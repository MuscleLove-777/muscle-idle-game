// ============================================
// App Entry Point - アプリ起動
// ============================================

const engine = new GameEngine();
const ui = new UIManager(engine);

// ページ離脱時にセーブ
window.addEventListener('beforeunload', () => engine.save());
document.addEventListener('visibilitychange', () => {
  if (document.hidden) engine.save();
});
