/**
 * AI開発アシスタント - メインアプリケーション制御 (app.js)
 * 画面遷移、UIイベント、コピー機能、状態同期を管理
 */

document.addEventListener('DOMContentLoaded', () => {
  // 画面の定義（9画面のインデックスとタイトル）
  const SCREENS = [
    { id: 'welcome', name: 'Step 1: ようこそ' },
    { id: 'setup', name: 'Step 2: IDE準備' },
    { id: 'create', name: 'Step 3: 作りたいものを入力' },
    { id: 'prompt', name: 'Step 4: AIへ依頼文送信' },
    { id: 'questions', name: 'Step 5: AI質問待機' },
    { id: 'documents', name: 'Step 6: 文書確認' },
    { id: 'confirm', name: 'Step 7: これで作る？' },
    { id: 'revision', name: 'Step 8: 修正依頼' },
    { id: 'start', name: 'Step 9: 開発開始' }
  ];

  // DOM 要素
  const progressFill = document.getElementById('progressFill');
  const stepNameEl = document.getElementById('stepName');
  const stepCounterEl = document.getElementById('stepCounter');
  const appToast = document.getElementById('appToast');
  const userIdeaInput = document.getElementById('userIdeaInput');
  const promptDisplayBox = document.getElementById('promptDisplayBox');
  const revisionInput = document.getElementById('revisionInput');
  const revisionPromptBox = document.getElementById('revisionPromptBox');
  const btnCopyRevision = document.getElementById('btn-copy-revision');

  let toastTimer = null;

  /**
   * トースト通知を表示
   * @param {string} msg 表示メッセージ
   */
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    appToast.querySelector('span').textContent = msg || '📋 クリップボードにコピーしました';
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2500);
  }

  /**
   * テキストをクリップボードにコピー
   * @param {string} text コピー対象テキスト
   */
  async function copyToClipboard(text) {
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // フォールバック
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showToast('📋 クリップボードにコピーしました');
    } catch (err) {
      console.error('クリップボードコピー失敗:', err);
      showToast('⚠️ コピーに失敗しました。手動でコピーしてください');
    }
  }

  /**
   * 指定画面へ遷移
   * @param {string} screenId 遷移先画面ID
   */
  function navigateTo(screenId) {
    const screenIndex = SCREENS.findIndex((s) => s.id === screenId);
    if (screenIndex === -1) return;

    // 全画面非表示にして対象画面を表示
    document.querySelectorAll('.screen').forEach((el) => {
      el.classList.remove('active');
    });

    const targetEl = document.getElementById(`screen-${screenId}`);
    if (targetEl) {
      targetEl.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // プログレスバー・ステップ表示の更新
    const stepNum = screenIndex + 1;
    const totalSteps = SCREENS.length;
    const progressPercent = Math.round((stepNum / totalSteps) * 100);

    if (progressFill) progressFill.style.width = `${progressPercent}%`;
    if (stepNameEl) stepNameEl.textContent = SCREENS[screenIndex].name;
    if (stepCounterEl) stepCounterEl.textContent = `${stepNum} / ${totalSteps}`;

    // 状態を保存
    AppStorage.saveState({ currentScreen: screenId });
  }

  /**
   * 画面の初期化と保存状態の復元
   */
  function initApp() {
    const savedState = AppStorage.loadState();

    if (savedState.userIdea && userIdeaInput) {
      userIdeaInput.value = savedState.userIdea;
    }

    if (savedState.generatedPrompt && promptDisplayBox) {
      promptDisplayBox.textContent = savedState.generatedPrompt;
    }

    if (savedState.revisionIdea && revisionInput) {
      revisionInput.value = savedState.revisionIdea;
    }

    if (savedState.revisionPrompt && revisionPromptBox) {
      revisionPromptBox.textContent = savedState.revisionPrompt;
      revisionPromptBox.style.display = 'block';
      if (btnCopyRevision) btnCopyRevision.style.display = 'inline-flex';
    }

    const startScreen = savedState.currentScreen || 'welcome';
    navigateTo(startScreen);
  }

  // =========================================================================
  // イベントリスナーの設定
  // =========================================================================

  // 1. Welcome -> Setup
  document.getElementById('btn-welcome-start')?.addEventListener('click', () => {
    navigateTo('setup');
  });

  // 2. Setup -> Create
  document.getElementById('btn-setup-next')?.addEventListener('click', () => {
    navigateTo('create');
  });

  // 3. Create: サンプル選択
  document.querySelectorAll('.sample-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const sampleText = chip.getAttribute('data-sample');
      if (sampleText && userIdeaInput) {
        userIdeaInput.value = sampleText;
        userIdeaInput.focus();
      }
    });
  });

  // 3. Create -> Prompt
  document.getElementById('btn-create-next')?.addEventListener('click', () => {
    const idea = (userIdeaInput?.value || '').trim();
    if (!idea) {
      alert('作りたいものを入力するか、サンプルを選択してください。');
      userIdeaInput?.focus();
      return;
    }

    const generatedPrompt = PromptEngine.generateRequirementPrompt(idea);
    if (promptDisplayBox) {
      promptDisplayBox.textContent = generatedPrompt;
    }

    AppStorage.saveState({
      userIdea: idea,
      generatedPrompt: generatedPrompt
    });

    navigateTo('prompt');
  });

  // 4. Prompt: コピー
  document.getElementById('btn-copy-prompt')?.addEventListener('click', () => {
    const text = promptDisplayBox?.textContent || '';
    copyToClipboard(text);
  });

  // 4. Prompt -> Questions
  document.getElementById('btn-prompt-next')?.addEventListener('click', () => {
    navigateTo('questions');
  });

  // 5. Questions -> Documents
  document.getElementById('btn-questions-next')?.addEventListener('click', () => {
    navigateTo('documents');
  });

  // 6. Documents -> Confirm
  document.getElementById('btn-docs-next')?.addEventListener('click', () => {
    navigateTo('confirm');
  });

  // 7. Confirm: これで作る -> Start
  document.getElementById('btn-confirm-ok')?.addEventListener('click', () => {
    navigateTo('start');
  });

  // 7. Confirm: 修正する -> Revision
  document.getElementById('btn-confirm-modify')?.addEventListener('click', () => {
    navigateTo('revision');
  });

  // 8. Revision: 修正プロンプト生成
  document.getElementById('btn-generate-revision')?.addEventListener('click', () => {
    const rev = (revisionInput?.value || '').trim();
    if (!rev) {
      alert('修正したい内容を入力してください。');
      revisionInput?.focus();
      return;
    }

    const revPrompt = PromptEngine.generateRevisionPrompt(rev);
    if (revisionPromptBox) {
      revisionPromptBox.textContent = revPrompt;
      revisionPromptBox.style.display = 'block';
    }
    if (btnCopyRevision) {
      btnCopyRevision.style.display = 'inline-flex';
    }

    AppStorage.saveState({
      revisionIdea: rev,
      revisionPrompt: revPrompt
    });
  });

  // 8. Revision: 修正指示コピー
  btnCopyRevision?.addEventListener('click', () => {
    const text = revisionPromptBox?.textContent || '';
    copyToClipboard(text);
  });

  // 8. Revision -> Documents（修正送信完了でドキュメント確認へ戻る）
  document.getElementById('btn-revision-done')?.addEventListener('click', () => {
    navigateTo('documents');
  });

  // 9. Start: 最初からやり直す
  document.getElementById('btn-restart')?.addEventListener('click', () => {
    if (confirm('入力内容をリセットして、最初から別のツールを作成しますか？')) {
      AppStorage.clearState();
      if (userIdeaInput) userIdeaInput.value = '';
      if (revisionInput) revisionInput.value = '';
      if (promptDisplayBox) promptDisplayBox.textContent = '';
      if (revisionPromptBox) {
        revisionPromptBox.textContent = '';
        revisionPromptBox.style.display = 'none';
      }
      if (btnCopyRevision) btnCopyRevision.style.display = 'none';
      navigateTo('welcome');
    }
  });

  // 共通の data-nav 戻るボタン
  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-nav');
      if (target) navigateTo(target);
    });
  });

  // アプリ起動
  initApp();
});
