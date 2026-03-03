// ============================================
// Game Engine - コアロジック
// ============================================

class GameEngine {
  constructor() {
    this.state = this.getDefaultState();
    this.lastTick = Date.now();
    this.comboTimer = null;
    this.autoSaveTimer = null;
    this.tickTimer = null;
    this.listeners = {};
  }

  getDefaultState() {
    return {
      musclePoints: 0,
      totalEarned: 0,
      level: 1,
      exp: 0,
      currentCharacter: 1,
      unlockedCharacters: [1],
      unlockedGallery: [],
      upgrades: {},
      combo: 0,
      lastPlayedTime: Date.now(),
      totalTaps: 0,
      startedAt: Date.now(),
    };
  }

  // イベントシステム
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  // セーブ＆ロード
  save() {
    this.state.lastPlayedTime = Date.now();
    localStorage.setItem(GAME_CONFIG.SAVE_KEY, JSON.stringify(this.state));
  }

  load() {
    const saved = localStorage.getItem(GAME_CONFIG.SAVE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      this.state = { ...this.getDefaultState(), ...parsed };
      return true;
    }
    return false;
  }

  resetSave() {
    localStorage.removeItem(GAME_CONFIG.SAVE_KEY);
    this.state = this.getDefaultState();
  }

  // ゲーム開始
  start() {
    const hadSave = this.load();

    // 放置報酬計算
    if (hadSave) {
      const idleEarnings = this.calculateIdleEarnings();
      if (idleEarnings > 0) {
        this.emit('idle-earnings', idleEarnings);
      }
    }

    // ゲームティック開始
    this.lastTick = Date.now();
    this.tickTimer = setInterval(() => this.tick(), 100);

    // 自動セーブ
    this.autoSaveTimer = setInterval(() => this.save(), GAME_CONFIG.AUTO_SAVE_INTERVAL);

    this.emit('state-changed', this.state);
  }

  stop() {
    this.save();
    clearInterval(this.tickTimer);
    clearInterval(this.autoSaveTimer);
    clearTimeout(this.comboTimer);
  }

  // 放置報酬計算
  calculateIdleEarnings() {
    const elapsed = (Date.now() - this.state.lastPlayedTime) / 1000;
    if (elapsed < 60) return 0; // 1分未満は無視

    const maxIdleSeconds = 8 * 3600; // 最大8時間分
    const idleSeconds = Math.min(elapsed, maxIdleSeconds);
    const autoRate = this.getAutoRate();
    const idleEfficiency = this.getUpgradeEffect('idle_boost');

    return Math.floor(autoRate * idleSeconds * idleEfficiency);
  }

  collectIdleEarnings(amount) {
    this.state.musclePoints += amount;
    this.state.totalEarned += amount;
    this.emit('state-changed', this.state);
  }

  // ゲームティック (100ms間隔)
  tick() {
    const now = Date.now();
    const delta = (now - this.lastTick) / 1000;
    this.lastTick = now;

    // 自動トレーニング
    const autoRate = this.getAutoRate();
    if (autoRate > 0) {
      const earned = autoRate * delta;
      this.state.musclePoints += earned;
      this.state.totalEarned += earned;
    }

    // ギャラリー解放チェック
    this.checkGalleryUnlocks();

    this.emit('tick', { delta, state: this.state });
  }

  // タップ処理
  tap() {
    const power = this.getTapPower();
    const isCritical = Math.random() < this.getCriticalChance();
    const critMultiplier = isCritical ? 5 : 1;

    // コンボ
    this.state.combo++;
    const comboMultiplier = this.getComboMultiplier();

    // コンボタイマーリセット
    clearTimeout(this.comboTimer);
    this.comboTimer = setTimeout(() => {
      this.state.combo = 0;
      this.emit('combo-reset');
    }, GAME_CONFIG.COMBO_TIMEOUT);

    const earned = Math.floor(power * comboMultiplier * critMultiplier);
    this.state.musclePoints += earned;
    this.state.totalEarned += earned;
    this.state.totalTaps++;

    // 経験値
    const expGain = Math.max(1, Math.floor(earned * 0.1 * this.getUpgradeEffect('exp_boost')));
    this.addExp(expGain);

    this.emit('tap', {
      earned,
      isCritical,
      combo: this.state.combo,
      comboMultiplier,
    });

    this.emit('state-changed', this.state);
    return earned;
  }

  // 経験値追加
  addExp(amount) {
    this.state.exp += amount;
    const required = this.getRequiredExp();

    while (this.state.exp >= required) {
      this.state.exp -= this.getRequiredExp();
      this.state.level++;

      // レベルアップ報酬
      const reward = this.getLevelUpReward();
      this.emit('level-up', {
        level: this.state.level,
        reward,
      });

      // キャラクター解放チェック
      this.checkCharacterUnlocks();
    }
  }

  getRequiredExp() {
    return Math.floor(GAME_CONFIG.BASE_EXP * Math.pow(GAME_CONFIG.EXP_GROWTH, this.state.level - 1));
  }

  getLevelUpReward() {
    const bonusPoints = this.state.level * 50;
    this.state.musclePoints += bonusPoints;
    this.state.totalEarned += bonusPoints;
    return `+${this.formatNumber(bonusPoints)} 筋肉Pt`;
  }

  // キャラクター解放チェック
  checkCharacterUnlocks() {
    CHARACTERS.forEach(char => {
      if (!this.state.unlockedCharacters.includes(char.id) &&
          this.state.level >= char.unlockLevel &&
          this.state.musclePoints >= char.cost) {
        // レベル条件は達成、コストは手動解放
      }
    });
  }

  // キャラクター解放（手動）
  unlockCharacter(charId) {
    const char = CHARACTERS.find(c => c.id === charId);
    if (!char) return false;
    if (this.state.unlockedCharacters.includes(charId)) return false;
    if (this.state.level < char.unlockLevel) return false;
    if (this.state.musclePoints < char.cost) return false;

    this.state.musclePoints -= char.cost;
    this.state.unlockedCharacters.push(charId);
    this.emit('character-unlocked', char);
    this.emit('state-changed', this.state);
    return true;
  }

  // キャラクター変更
  setCharacter(charId) {
    if (this.state.unlockedCharacters.includes(charId)) {
      this.state.currentCharacter = charId;
      this.emit('character-changed', charId);
      this.emit('state-changed', this.state);
    }
  }

  // ギャラリー解放チェック
  checkGalleryUnlocks() {
    for (let i = 1; i <= GAME_CONFIG.TOTAL_IMAGES; i++) {
      if (!this.state.unlockedGallery.includes(i)) {
        const requiredLevel = getGalleryUnlockCondition(i);
        if (this.state.level >= requiredLevel) {
          this.state.unlockedGallery.push(i);
          this.emit('gallery-unlocked', i);
        }
      }
    }
  }

  // アップグレード
  getUpgradeLevel(upgradeId) {
    return this.state.upgrades[upgradeId] || 0;
  }

  getUpgradeCost(upgradeId) {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return Infinity;
    const level = this.getUpgradeLevel(upgradeId);
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costGrowth, level));
  }

  getUpgradeEffect(upgradeId) {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return 0;
    return upgrade.effect(this.getUpgradeLevel(upgradeId));
  }

  buyUpgrade(upgradeId) {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return false;

    const level = this.getUpgradeLevel(upgradeId);
    if (level >= upgrade.maxLevel) return false;

    const cost = this.getUpgradeCost(upgradeId);
    if (this.state.musclePoints < cost) return false;

    this.state.musclePoints -= cost;
    this.state.upgrades[upgradeId] = level + 1;
    this.emit('upgrade-bought', { upgradeId, level: level + 1 });
    this.emit('state-changed', this.state);
    return true;
  }

  // 計算系
  getTapPower() {
    const basePower = this.getUpgradeEffect('tap_power');
    const charPower = this.getCurrentCharacterPower();
    return Math.floor(basePower * (1 + charPower * 0.1));
  }

  getAutoRate() {
    return this.getUpgradeEffect('auto_train');
  }

  getComboMultiplier() {
    const comboBonus = this.getUpgradeEffect('combo_master');
    const rawMultiplier = 1 + this.state.combo * GAME_CONFIG.COMBO_MULTIPLIER_STEP * comboBonus;
    return Math.min(rawMultiplier, GAME_CONFIG.MAX_COMBO_MULTIPLIER);
  }

  getCriticalChance() {
    return this.getUpgradeEffect('critical');
  }

  getCurrentCharacterPower() {
    const char = CHARACTERS.find(c => c.id === this.state.currentCharacter);
    return char ? char.power : 1;
  }

  // ユーティリティ
  formatNumber(num) {
    if (num < 1000) return Math.floor(num).toString();
    if (num < 1e6) return (num / 1000).toFixed(1) + 'K';
    if (num < 1e9) return (num / 1e6).toFixed(1) + 'M';
    if (num < 1e12) return (num / 1e9).toFixed(1) + 'B';
    return (num / 1e12).toFixed(1) + 'T';
  }

  canAfford(cost) {
    return this.state.musclePoints >= cost;
  }
}
