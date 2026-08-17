/**
 * AI開発アシスタント - プロンプト生成エンジン (prompt.js)
 * ユーザー入力から Google Antigravity IDE 向けの最適化された指示文を生成
 */

const PromptEngine = (() => {
  /**
   * 要件定義依頼プロンプトを生成
   * @param {string} userIdea ユーザーが入力した「こんなの作って」
   * @returns {string} Antigravity IDE 用のプロンプト
   */
  function generateRequirementPrompt(userIdea) {
    const cleanIdea = (userIdea || '').trim();
    if (!cleanIdea) {
      return '';
    }

    return `以下のアイデアをもとに、ソフトウェアの要件定義を行い、開発に必要な「README.md」と「仕様書.md」を作成してください。

【作りたいもの】
${cleanIdea}

【AIへの指示事項】
1. まず、上記の作りたいものから「目的」「想定利用者」「利用方法」「必要な機能」「不要・過剰な機能」「入力・出力」「動作環境」を整理してください。
2. 情報不足、曖昧な点、矛盾点、開発に影響を与える未確定事項がある場合のみ、私に質問してください。あなたが合理的に判断できる内容は、あなたが判断して進めて構いません。
3. 要件が整理できたら、以下の2つの文書を作成してください：
   - README.md: プロジェクトの概要、目的、使い方などをまとめた文書
   - 仕様書.md: 機能、動作条件、制約事項、技術前提などをまとめた文書
4. 文書作成が完了したら、私に確認を促してください。`;
  }

  /**
   * 修正依頼プロンプトを生成
   * @param {string} revisionFeedback ユーザーの修正要望
   * @returns {string} 修正用のプロンプト
   */
  function generateRevisionPrompt(revisionFeedback) {
    const cleanFeedback = (revisionFeedback || '').trim();
    if (!cleanFeedback) {
      return '';
    }

    return `先ほど作成していただいた内容について、以下の通り修正をお願いします。

【修正要望】
${cleanFeedback}

【AIへの指示事項】
1. 上記の修正内容を反映して要件定義を見直してください。
2. 「README.md」および「仕様書.md」の内容を最新の修正に合わせて更新してください。
3. 更新が完了したら、変更点を簡潔に報告し、再度確認を促してください。`;
  }

  return {
    generateRequirementPrompt,
    generateRevisionPrompt
  };
})();
