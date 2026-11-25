/* What grok.com's chat page looks like, for content/core.js.
   ALL SELECTORS ARE UNVERIFIED GUESSES, and weaker than the Claude and ChatGPT ones. Check them on the live
   site (TESTING.md) and fix them here. */
window.__derbySite = {
  service: "grok", name: "Grok",
  isChat: (path) => /^\/(c|chat)\/[\w-]+/.test(path),
  titleSuffix: /\s*[-–|]\s*Grok\s*$/i,
  SEL: {
    user: ['[data-testid="user-message"]', '.items-end .message-bubble'],
    reply: ['[data-testid="assistant-message"]', '.items-start .message-bubble'],
    working: ['button[aria-label="Stop model response"]', 'button[aria-label^="Stop"]'],
    status: ['[data-testid*="status"]'],
  },
};
