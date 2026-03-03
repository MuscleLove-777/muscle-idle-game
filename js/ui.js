// ============================================
// UI Manager - 画面制御＆描画
// ============================================

class UIManager {
  constructor(engine) {
    this.engine = engine;
    this.currentScreen = 'title';
    this.elements = {};
    this.cacheElements();
    this.bindEvents();
    this.bindEngineEvents();
  }

  cacheElements() {
    this.elements = {
      // Screens
      screenTitle: document.getElementById('screen-title'),
      screenMain: document.getElementById('screen-main'),
      screenUpgrade: document.getElementById('screen-upgrade'),
      screenCharacters: document.getElementById('screen-characters'),
      screenGallery: document.getElementById('screen-gallery'),
      // Header
      musclePoints: document.getElementById('muscle-points'),
      playerLevel: document.getElementById('player-level'),
      currentCharName: document.getElementById('current-character-name'),
      // Character area
      characterArea: document.getElementById('character-area'),
      characterVideo: document.getElementById('character-video'),
      tapEffectContainer: document.getElementById('tap-effect-container'),
      comboDisplay: document.getElementById('combo-display'),
      comboCount: document.getElementById('combo-count'),
      // Idle
      idleEarnings: document.getElementById('idle-earnings'),
      idleAmountValue: document.getElementById('idle-amount-value'),
      btnCollectIdle: document.getElementById('btn-collect-idle'),
      // Status
      expBar: document.getElementById('exp-bar'),
      expText: document.getElementById('exp-text'),
      statPower: document.getElementById('stat-power'),
      statAuto: document.getElementById('stat-auto'),
      statCombo: document.getElementById('stat-combo'),
      // Nav
      bottomNav: document.getElementById('bottom-nav'),
      // Upgrade
      upgradeList: document.getElementById('upgrade-list'),
      upgradePoints: document.getElementById('upgrade-points'),
      // Characters
      characterGrid: document.getElementById('character-grid'),
      charCount: document.getElementById('char-count'),
      // Gallery
      galleryGrid: document.getElementById('gallery-grid'),
      galleryCount: document.getElementById('gallery-count'),
      // Viewer
      imageViewer: document.getElementById('image-viewer'),
      viewerImage: document.getElementById('viewer-image'),
      viewerClose: document.getElementById('viewer-close'),
      // Overlays
      levelupOverlay: document.getElementById('levelup-overlay'),
      levelupLevelNum: document.getElementById('levelup-level-num'),
      levelupReward: document.getElementById('levelup-reward'),
      btnLevelupOk: document.getElementById('btn-levelup-ok'),
      unlockOverlay: document.getElementById('unlock-overlay'),
      unlockVideo: document.getElementById('unlock-video'),
      unlockName: document.getElementById('unlock-name'),
      btnUnlockOk: document.getElementById('btn-unlock-ok'),
    };
  }

  bindEvents() {
    // Start button
    document.getElementById('btn-start').addEventListener('click', () => {
      this.showScreen('main');
      this.engine.start();
      this.updateAll();
    });

    // Tap area
    this.elements.characterArea.addEventListener('click', (e) => {
      if (this.currentScreen !== 'main') return;
      if (!this.elements.idleEarnings.classList.contains('hidden')) return;
      this.handleTap(e);
    });

    // Idle collect
    this.elements.btnCollectIdle.addEventListener('click', () => {
      const amount = this._pendingIdleAmount || 0;
      this.engine.collectIdleEarnings(amount);
      this.elements.idleEarnings.classList.add('hidden');
      this._pendingIdleAmount = 0;
      this.elements.characterVideo.play();
    });

    // Nav buttons
    this.elements.bottomNav.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.elements.bottomNav.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (tab === 'train') {
          this.showScreen('main');
        } else if (tab === 'upgrade') {
          this.showScreen('upgrade');
          this.renderUpgrades();
        } else if (tab === 'characters') {
          this.showScreen('characters');
          this.renderCharacters();
        } else if (tab === 'gallery') {
          this.showScreen('gallery');
          this.renderGallery();
        }
      });
    });

    // Back buttons
    document.querySelectorAll('.btn-back').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showScreen('main');
        this.elements.bottomNav.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        this.elements.bottomNav.querySelector('[data-tab="train"]').classList.add('active');
      });
    });

    // Image viewer close
    this.elements.viewerClose.addEventListener('click', () => {
      this.elements.imageViewer.classList.add('hidden');
    });

    // Level up OK
    this.elements.btnLevelupOk.addEventListener('click', () => {
      this.elements.levelupOverlay.classList.add('hidden');
    });

    // Unlock OK
    this.elements.btnUnlockOk.addEventListener('click', () => {
      this.elements.unlockOverlay.classList.add('hidden');
      this.elements.unlockVideo.pause();
    });
  }

  bindEngineEvents() {
    this.engine.on('state-changed', () => this.updateDisplay());

    this.engine.on('tick', () => this.updateDisplay());

    this.engine.on('tap', (data) => {
      this.updateComboDisplay(data.combo, data.comboMultiplier);
    });

    this.engine.on('combo-reset', () => {
      this.elements.comboDisplay.classList.add('hidden');
      this.elements.statCombo.textContent = 'x1';
    });

    this.engine.on('idle-earnings', (amount) => {
      this.elements.idleAmountValue.textContent = this.engine.formatNumber(amount);
      this.elements.idleEarnings.classList.remove('hidden');
      this._pendingIdleAmount = amount;
      // Pause video while showing idle earnings
      this.elements.characterVideo.pause();
    });

    this.engine.on('level-up', (data) => {
      this.elements.levelupLevelNum.textContent = data.level;
      this.elements.levelupReward.textContent = data.reward;
      this.elements.levelupOverlay.classList.remove('hidden');
    });

    this.engine.on('character-unlocked', (char) => {
      this.showUnlockAnimation(char);
      if (this.currentScreen === 'characters') {
        this.renderCharacters();
      }
    });

    this.engine.on('character-changed', (charId) => {
      this.loadCharacterVideo(charId);
    });
  }

  // 画面切り替え
  showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    let targetEl;
    switch (screenName) {
      case 'title': targetEl = this.elements.screenTitle; break;
      case 'main': targetEl = this.elements.screenMain; break;
      case 'upgrade': targetEl = this.elements.screenUpgrade; break;
      case 'characters': targetEl = this.elements.screenCharacters; break;
      case 'gallery': targetEl = this.elements.screenGallery; break;
    }

    if (targetEl) {
      targetEl.classList.add('active');
      this.currentScreen = screenName;
    }
  }

  // タップ処理
  handleTap(e) {
    const earned = this.engine.tap();
    const rect = this.elements.characterArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.showTapEffect(x, y, earned, this.engine.state.combo > 10);
    this.elements.characterArea.classList.add('shake');
    setTimeout(() => this.elements.characterArea.classList.remove('shake'), 100);
  }

  showTapEffect(x, y, amount, isCritical) {
    // Float number
    const float = document.createElement('div');
    float.className = 'tap-effect';
    float.textContent = `+${this.engine.formatNumber(amount)}`;
    float.style.left = `${x}px`;
    float.style.top = `${y}px`;
    if (isCritical) {
      float.style.fontSize = '36px';
      float.style.color = '#ff3366';
    }
    this.elements.tapEffectContainer.appendChild(float);
    setTimeout(() => float.remove(), 800);

    // Ring effect
    const ring = document.createElement('div');
    ring.className = 'tap-ring';
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    this.elements.tapEffectContainer.appendChild(ring);
    setTimeout(() => ring.remove(), 400);
  }

  updateComboDisplay(combo, multiplier) {
    if (combo >= 3) {
      this.elements.comboDisplay.classList.remove('hidden');
      this.elements.comboCount.textContent = combo;
      this.elements.statCombo.textContent = `x${multiplier.toFixed(1)}`;
    }
  }

  // 表示更新
  updateDisplay() {
    const state = this.engine.state;
    this.elements.musclePoints.textContent = this.engine.formatNumber(state.musclePoints);
    this.elements.playerLevel.textContent = state.level;
    this.elements.upgradePoints.textContent = this.engine.formatNumber(state.musclePoints);

    // キャラクター名
    const char = CHARACTERS.find(c => c.id === state.currentCharacter);
    if (char) {
      this.elements.currentCharName.textContent = char.name;
    }

    // Exp bar
    const required = this.engine.getRequiredExp();
    const percent = Math.min((state.exp / required) * 100, 100);
    this.elements.expBar.style.width = `${percent}%`;
    this.elements.expText.textContent = `${this.engine.formatNumber(state.exp)} / ${this.engine.formatNumber(required)}`;

    // Stats
    this.elements.statPower.textContent = this.engine.formatNumber(this.engine.getTapPower());
    this.elements.statAuto.textContent = this.engine.formatNumber(this.engine.getAutoRate());
  }

  updateAll() {
    this.updateDisplay();
    this.loadCharacterVideo(this.engine.state.currentCharacter);
  }

  // キャラクター動画ロード
  loadCharacterVideo(charId) {
    const videoSrc = `${GAME_CONFIG.VIDEO_BASE_PATH}muscle_${String(charId).padStart(2, '0')}.mp4`;
    const posterSrc = `${GAME_CONFIG.POSTER_BASE_PATH}muscle_${String(charId).padStart(2, '0')}.jpg`;

    this.elements.characterVideo.poster = posterSrc;
    this.elements.characterVideo.querySelector('source').src = videoSrc;
    this.elements.characterVideo.load();
    this.elements.characterVideo.play().catch(() => {});

    const char = CHARACTERS.find(c => c.id === charId);
    if (char) {
      this.elements.currentCharName.textContent = char.name;
    }
  }

  // 強化画面レンダリング
  renderUpgrades() {
    this.elements.upgradeList.innerHTML = '';
    UPGRADES.forEach(upgrade => {
      const level = this.engine.getUpgradeLevel(upgrade.id);
      const cost = this.engine.getUpgradeCost(upgrade.id);
      const canBuy = this.engine.canAfford(cost) && level < upgrade.maxLevel;

      const card = document.createElement('div');
      card.className = 'upgrade-card';
      card.innerHTML = `
        <div class="upgrade-icon">${upgrade.icon}</div>
        <div class="upgrade-info">
          <div class="upgrade-name">${upgrade.name}</div>
          <div class="upgrade-desc">${upgrade.desc}</div>
          <div class="upgrade-level">Lv.${level} / ${upgrade.maxLevel}</div>
        </div>
        <button class="upgrade-buy" ${!canBuy ? 'disabled' : ''}>
          ${level >= upgrade.maxLevel ? 'MAX' : this.engine.formatNumber(cost) + ' Pt'}
        </button>
      `;

      const btn = card.querySelector('.upgrade-buy');
      btn.addEventListener('click', () => {
        if (this.engine.buyUpgrade(upgrade.id)) {
          this.renderUpgrades();
        }
      });

      this.elements.upgradeList.appendChild(card);
    });
  }

  // キャラクター画面レンダリング
  renderCharacters() {
    this.elements.characterGrid.innerHTML = '';
    const unlocked = this.engine.state.unlockedCharacters;

    this.elements.charCount.textContent = `${unlocked.length}/${CHARACTERS.length}`;

    CHARACTERS.forEach(char => {
      const isUnlocked = unlocked.includes(char.id);
      const canUnlock = !isUnlocked &&
        this.engine.state.level >= char.unlockLevel &&
        this.engine.canAfford(char.cost);
      const isActive = this.engine.state.currentCharacter === char.id;

      const card = document.createElement('div');
      card.className = `char-card ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`;

      const posterSrc = `${GAME_CONFIG.POSTER_BASE_PATH}muscle_${String(char.id).padStart(2, '0')}.jpg`;

      card.innerHTML = `
        <img class="char-card-img" src="${posterSrc}" alt="${char.name}" loading="lazy">
        <div class="char-card-name">${isUnlocked ? char.name : '???'}</div>
        ${!isUnlocked ? `<div class="char-card-cost">Lv.${char.unlockLevel} / ${this.engine.formatNumber(char.cost)} Pt</div>` : ''}
        ${!isUnlocked ? '<div class="lock-icon">🔒</div>' : ''}
      `;

      card.addEventListener('click', () => {
        if (isUnlocked) {
          this.engine.setCharacter(char.id);
          this.renderCharacters();
        } else if (canUnlock) {
          this.engine.unlockCharacter(char.id);
          this.renderCharacters();
        }
      });

      this.elements.characterGrid.appendChild(card);
    });
  }

  // ギャラリー画面レンダリング
  renderGallery() {
    this.elements.galleryGrid.innerHTML = '';
    const unlocked = this.engine.state.unlockedGallery;

    this.elements.galleryCount.textContent = `${unlocked.length}/${GAME_CONFIG.TOTAL_IMAGES}`;

    for (let i = 1; i <= GAME_CONFIG.TOTAL_IMAGES; i++) {
      const isUnlocked = unlocked.includes(i);
      const item = document.createElement('div');
      item.className = `gallery-item ${!isUnlocked ? 'locked' : ''}`;

      const thumbSrc = `${GAME_CONFIG.THUMB_BASE_PATH}img_${String(i).padStart(3, '0')}.jpg`;
      const gallerySrc = `${GAME_CONFIG.GALLERY_BASE_PATH}img_${String(i).padStart(3, '0')}.jpg`;

      item.innerHTML = `
        <img src="${thumbSrc}" alt="Gallery ${i}" loading="lazy">
        ${!isUnlocked ? '<div class="lock-icon">🔒</div>' : ''}
      `;

      if (isUnlocked) {
        item.addEventListener('click', () => {
          this.elements.viewerImage.src = gallerySrc;
          this.elements.imageViewer.classList.remove('hidden');
        });
      }

      this.elements.galleryGrid.appendChild(item);
    }
  }

  // キャラ解放アニメーション
  showUnlockAnimation(char) {
    const videoSrc = `${GAME_CONFIG.VIDEO_BASE_PATH}muscle_${String(char.id).padStart(2, '0')}.mp4`;
    this.elements.unlockVideo.src = videoSrc;
    this.elements.unlockVideo.play().catch(() => {});
    this.elements.unlockName.textContent = `${char.name} - ${char.title}`;
    this.elements.unlockOverlay.classList.remove('hidden');
  }
}
