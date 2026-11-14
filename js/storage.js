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

  let errorHandler = null;

  /**
   * ストレージ操作エラー時の通知ハンドラを登録する
   * @param {Function|null} handler (action: string, error: unknown) => void
   */
  function setErrorHandler(handler) {
    errorHandler = typeof handler === 'function' ? handler : null;
  }

  /**
   * 登録されたエラーハンドラへ失敗を通知する
   * @param {string} action 操作種別 ('load' | 'save' | 'clear')
   * @param {unknown} error 発生したエラー
   */
  function notifyError(action, error) {
    if (errorHandler) {
      errorHandler(action, error);
    }
  }

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
      notifyError('load', e);
      return { ...defaultState };
    }
  }

  /**
   * 状態を保存する
   * @param {Object} partialState 更新する一部または全体の状態
   * @returns {boolean} 保存成功時は true、失敗時は false
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
      return true;
    } catch (e) {
      console.warn('[Storage] LocalStorage保存失敗。', e);
      notifyError('save', e);
      return false;
    }
  }

  /**
   * 状態を初期化する
   * @returns {boolean} 初期化成功時は true、失敗時は false
   */
  function clearState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      console.warn('[Storage] LocalStorageクリア失敗。', e);
      notifyError('clear', e);
      return false;
    }
  }

  return {
    setErrorHandler,
    loadState,
    saveState,
    clearState
  };
})();
