# Derby hub

One lawn for every place you chat with AI. A small program that runs on your own computer and collects chats from:

| Where you chat | How it gets to the hub | Status (Nov 25) |
| --- | --- | --- |
| Claude, ChatGPT, Grok in Chrome | The Derby extension forwards each chat | Works on fake copies of the sites; real sites unchecked |
| Claude Code in the terminal | Claude Code hooks (official) | **Tested with a real Claude Code run**: prompt, steps, reply and session end all arrived |
| Claude / ChatGPT desktop apps | Mac helper, if the Accessibility check passes (`../desktop/`) | Not built |

It only listens on 127.0.0.1, refuses other websites, and saves to `~/.derby/session.json`. Nothing leaves your computer.

## Run it

Needs Node 18 or newer. From `ai-companion/`:

```bash
npm run hub
```

Then open http://127.0.0.1:47800/ (or the extension's side panel, which switches to the hub's lawn when the hub is running).

## Add Claude Code

```bash
node hub/install-claude-code-hooks.mjs
```

That shows what it would add to `~/.claude/settings.json`. Add it with `--write` (keeps a backup), remove it with `--remove`. Start a **new** Claude Code session afterwards. The hooks run in the background and never print anything, so they can't change what Claude Code does; when the hub isn't running they do nothing.

Each Claude Code session gets a row named after its folder, e.g. "poster-site · Terminal":
- you send a prompt → the horse runs, with steps like "Editing files" or "Running a command"
- Claude finishes, or asks for permission → Your turn (and the bell)
- you quit Claude Code → the row sinks and its receipt waits

## Known gaps

- With the hub running, the extension's toolbar badge and closed-panel bell still only count browser chats.
- If the hub page and the side panel are both open, the bell can ring twice.
- Receipt token estimates for Claude Code only count the prompt and the final reply, not the tool work in between, so they run low. Claude Code's own log records real token counts. Reading it would give real numbers, but its format isn't documented.
- "Open" can't jump to a Terminal window; it says where the chat is.
