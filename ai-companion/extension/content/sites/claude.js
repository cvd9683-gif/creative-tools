/* What claude.ai's chat page looks like, for content/core.js.
   ALL SELECTORS ARE UNVERIFIED GUESSES. Check them on the live site (TESTING.md) and fix them here. */
window.__derbySite = {
  service: "claude", name: "Claude",
  isChat: (path) => /^\/chat\/[\w-]+/.test(path),
  titleSuffix: /\s*[-–|]\s*Claude\s*$/i,
  SEL: {
    // the person's messages
    user: ['[data-testid="user-message"]', '[data-testid*="user-message"]'],
    // the AI's replies (outermost match wins)
    reply: ['[data-is-streaming]', '.font-claude-response', '.font-claude-message'],
    // present only while a reply is being written
    working: ['[data-is-streaming="true"]', 'button[aria-label="Stop response"]', 'button[aria-label^="Stop"]'],
    // status labels shown during a reply, e.g. "Searching the web" (P1: may not exist)
    status: ['[data-testid*="status"]', '[aria-live="polite"]'],
  },
};
