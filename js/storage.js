/**
 * AI開発アシスタント - ストレージ管理ユーティリティ (storage.js)
 * LocalStorage への安全な読み書きと状態永続化を提供
 */

const AppStorage = (() => {
  const STORAGE_KEY = 'tonikaku_ai_assistant_state';

  const defaultState = {
    currentScreen: 'welcome',
    userIdea: '',
    generatedPrompt: '',
    revisionIdea: '',
    revisionPrompt: '',
    lastUpdated: null
  };

  /**
   * 現在の状態を読み込む
   * @returns {Object} アプリケーション状態
   */
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultState };
      const parsed = JSON.parse(raw);
      return { ...defaultState, ...parsed };
    } catch (e) {
      console.warn('[Storage] LocalStorage読み込み失敗。デフォルト値を使用します。', e);
      return { ...defaultState };
    }
  }

  /**
   * 状態を保存する
   * @param {Object} partialState 更新する一部または全体の状態
   */
  function saveState(partialState) {
    try {
      const current = loadState();
      const nextState = {
        ...current,
        ...partialState,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch (e) {
      console.warn('[Storage] LocalStorage保存失敗。', e);
    }
  }

  /**
   * 状態を初期化する
   */
  function clearState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('[Storage] LocalStorageクリア失敗。', e);
    }
  }

  return {
    loadState,
    saveState,
    clearState
  };
})();
