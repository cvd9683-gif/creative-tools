/* What chatgpt.com's chat page looks like, for content/core.js.
   ALL SELECTORS ARE UNVERIFIED GUESSES. Check them on the live site (TESTING.md) and fix them here. */
window.__derbySite = {
  service: "chatgpt", name: "ChatGPT",
  // /c/<id>, and chats inside a custom GPT or project: /g/<gpt>/c/<id>
  isChat: (path) => /(^|\/)c\/[\w-]+/.test(path),
  titleSuffix: /\s*[-–|]\s*ChatGPT\s*$/i,
  SEL: {
    user: ['[data-message-author-role="user"]'],
    reply: ['[data-message-author-role="assistant"]'],
    working: ['button[data-testid="stop-button"]', 'button[aria-label="Stop streaming"]', 'button[aria-label^="Stop"]'],
    status: ['[data-testid*="status"]', '.loading-shimmer'],
  },
};
