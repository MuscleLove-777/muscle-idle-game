// ============================================
// Game Data - キャラクター＆アップグレード定義
// ============================================

const GAME_CONFIG = {
  SAVE_KEY: 'muscle_paradise_save',
  AUTO_SAVE_INTERVAL: 10000,  // 10秒ごとに自動セーブ
  COMBO_TIMEOUT: 1500,        // コンボ継続時間(ms)
  COMBO_MULTIPLIER_STEP: 0.1, // コンボごとに+10%
  MAX_COMBO_MULTIPLIER: 5.0,  // 最大コンボ倍率
  IDLE_RATE: 0.5,             // 放置時の自動トレーニング効率(50%)
  BASE_EXP: 100,              // レベル1の必要経験値
  EXP_GROWTH: 1.4,            // レベルごとの経験値増加率
  VIDEO_BASE_PATH: 'assets/videos/',
  POSTER_BASE_PATH: 'assets/posters/',
  GALLERY_BASE_PATH: 'assets/images/gallery/',
  THUMB_BASE_PATH: 'assets/images/thumbnails/',
  TOTAL_VIDEOS: 42,
  TOTAL_IMAGES: 270,
};

// キャラクター定義（42体）
const CHARACTERS = [
  { id: 1,  name: 'サクラ',       title: '桜の新入生',       cost: 0,        unlockLevel: 1,  power: 1 },
  { id: 2,  name: 'ミサキ',       title: '情熱のランナー',    cost: 100,      unlockLevel: 2,  power: 2 },
  { id: 3,  name: 'アオイ',       title: '蒼き鉄腕',        cost: 300,      unlockLevel: 3,  power: 3 },
  { id: 4,  name: 'ヒナタ',       title: '陽だまりファイター', cost: 600,      unlockLevel: 4,  power: 5 },
  { id: 5,  name: 'カエデ',       title: '紅葉の格闘家',     cost: 1000,     unlockLevel: 5,  power: 7 },
  { id: 6,  name: 'リン',         title: '凛とした戦士',     cost: 1800,     unlockLevel: 6,  power: 10 },
  { id: 7,  name: 'ユキ',         title: '雪原のアスリート',  cost: 3000,     unlockLevel: 7,  power: 14 },
  { id: 8,  name: 'マイ',         title: '舞い踊る筋肉',     cost: 5000,     unlockLevel: 8,  power: 18 },
  { id: 9,  name: 'ナツキ',       title: '夏の鍛錬者',       cost: 8000,     unlockLevel: 9,  power: 24 },
  { id: 10, name: 'コハル',       title: '小春日和のパワー',  cost: 12000,    unlockLevel: 10, power: 30 },
  { id: 11, name: 'ツバキ',       title: '椿の拳',          cost: 18000,    unlockLevel: 11, power: 38 },
  { id: 12, name: 'スミレ',       title: '菫色の怪力',      cost: 26000,    unlockLevel: 12, power: 48 },
  { id: 13, name: 'モモ',         title: '桃色マッスル',     cost: 38000,    unlockLevel: 13, power: 60 },
  { id: 14, name: 'アカネ',       title: '茜色の闘志',      cost: 55000,    unlockLevel: 14, power: 75 },
  { id: 15, name: 'シオリ',       title: '栞の鉄壁',        cost: 80000,    unlockLevel: 15, power: 95 },
  { id: 16, name: 'ミズキ',       title: '瑞々しき力',      cost: 120000,   unlockLevel: 16, power: 120 },
  { id: 17, name: 'カスミ',       title: '霞む速さ',        cost: 180000,   unlockLevel: 17, power: 150 },
  { id: 18, name: 'フウカ',       title: '風花の一撃',      cost: 270000,   unlockLevel: 18, power: 190 },
  { id: 19, name: 'レイカ',       title: '麗華の豪腕',      cost: 400000,   unlockLevel: 19, power: 240 },
  { id: 20, name: 'アヤメ',       title: '菖蒲の鉄人',      cost: 600000,   unlockLevel: 20, power: 300 },
  { id: 21, name: 'イズミ',       title: '泉のパワー',      cost: 900000,   unlockLevel: 22, power: 380 },
  { id: 22, name: 'ワカバ',       title: '若葉の成長力',    cost: 1400000,  unlockLevel: 24, power: 480 },
  { id: 23, name: 'ホノカ',       title: '仄かな闘気',      cost: 2100000,  unlockLevel: 26, power: 600 },
  { id: 24, name: 'チヒロ',       title: '千尋の深み',      cost: 3200000,  unlockLevel: 28, power: 750 },
  { id: 25, name: 'マドカ',       title: '円の完成形',      cost: 5000000,  unlockLevel: 30, power: 950 },
  { id: 26, name: 'ノゾミ',       title: '希望の拳',        cost: 7500000,  unlockLevel: 32, power: 1200 },
  { id: 27, name: 'ハルカ',       title: '遥かなる頂',      cost: 11000000, unlockLevel: 34, power: 1500 },
  { id: 28, name: 'ミヤビ',       title: '雅な破壊力',      cost: 17000000, unlockLevel: 36, power: 1900 },
  { id: 29, name: 'キョウカ',     title: '強化の極み',      cost: 25000000, unlockLevel: 38, power: 2400 },
  { id: 30, name: 'トモエ',       title: '巴の回転力',      cost: 38000000, unlockLevel: 40, power: 3000 },
  { id: 31, name: 'シズカ',       title: '静かなる嵐',      cost: 57000000,  unlockLevel: 43, power: 3800 },
  { id: 32, name: 'ユウナ',       title: '優雅な筋肉',      cost: 85000000,  unlockLevel: 46, power: 4800 },
  { id: 33, name: 'アスカ',       title: '明日への力',      cost: 130000000, unlockLevel: 49, power: 6000 },
  { id: 34, name: 'セツナ',       title: '刹那の一撃',      cost: 200000000, unlockLevel: 52, power: 7500 },
  { id: 35, name: 'ツキヨ',       title: '月夜のトレーニー', cost: 300000000, unlockLevel: 55, power: 9500 },
  { id: 36, name: 'クレナイ',     title: '紅蓮の筋肉',      cost: 450000000, unlockLevel: 58, power: 12000 },
  { id: 37, name: 'ミコト',       title: '御言の力',        cost: 700000000, unlockLevel: 62, power: 15000 },
  { id: 38, name: 'タマキ',       title: '珠のボディ',      cost: 1e9,       unlockLevel: 66, power: 19000 },
  { id: 39, name: 'コトハ',       title: '琴葉の響き',      cost: 1.5e9,     unlockLevel: 70, power: 24000 },
  { id: 40, name: 'ヒビキ',       title: '響く咆哮',        cost: 2.5e9,     unlockLevel: 75, power: 30000 },
  { id: 41, name: 'アマテラス',   title: '天照の輝き',      cost: 5e9,       unlockLevel: 80, power: 50000 },
  { id: 42, name: 'ムサシ',       title: '伝説の筋肉神',    cost: 1e10,      unlockLevel: 99, power: 100000 },
];

// アップグレード定義
const UPGRADES = [
  {
    id: 'tap_power',
    name: 'タップパワー',
    desc: 'タップ1回の獲得ポイントUP',
    icon: '💪',
    baseCost: 50,
    costGrowth: 1.5,
    maxLevel: 100,
    effect: (level) => level + 1, // タップパワー
  },
  {
    id: 'auto_train',
    name: '自動トレーニング',
    desc: '毎秒自動でポイント獲得',
    icon: '⚡',
    baseCost: 200,
    costGrowth: 1.6,
    maxLevel: 100,
    effect: (level) => level * 2, // 毎秒獲得量
  },
  {
    id: 'combo_master',
    name: 'コンボマスター',
    desc: 'コンボ倍率の上昇速度UP',
    icon: '🔥',
    baseCost: 500,
    costGrowth: 2.0,
    maxLevel: 50,
    effect: (level) => 1 + level * 0.05, // コンボ倍率ボーナス
  },
  {
    id: 'idle_boost',
    name: '放置ブースト',
    desc: '放置中の獲得効率UP',
    icon: '😴',
    baseCost: 1000,
    costGrowth: 2.0,
    maxLevel: 50,
    effect: (level) => 0.5 + level * 0.1, // 放置効率
  },
  {
    id: 'exp_boost',
    name: '経験値ブースト',
    desc: '経験値獲得量UP',
    icon: '📈',
    baseCost: 800,
    costGrowth: 1.8,
    maxLevel: 50,
    effect: (level) => 1 + level * 0.15, // 経験値倍率
  },
  {
    id: 'critical',
    name: 'クリティカル',
    desc: 'タップ時に大量ポイント確率UP',
    icon: '💥',
    baseCost: 2000,
    costGrowth: 2.2,
    maxLevel: 30,
    effect: (level) => level * 0.02, // クリティカル確率
  },
];

// ギャラリー解放条件
function getGalleryUnlockCondition(imageIndex) {
  // 5枚ごとに1レベル必要
  return Math.floor(imageIndex / 5) + 1;
}
