# Derby for desktop apps (experiment)

Goal: track chats in the Claude, ChatGPT and Grok **desktop apps**, not only in Chrome. A Chrome extension can't see
those apps. The route being tried is macOS Accessibility (what screen readers use). Mac only. Nothing here is verified yet.

## Step 1: can Derby read the apps at all? (Nov 26–27)

1. Open the Claude and/or ChatGPT desktop app with a chat on screen.
2. In Terminal, from the repo folder:
   ```bash
   swift ai-companion/desktop/ax-probe.swift
   ```
3. The first run asks for Accessibility permission for Terminal. Allow it in System Settings → Privacy & Security → Accessibility, then run it again.
4. Run it once more **while a reply is being written**, to see whether a Stop button shows up.

It only reads. Chat text is not copied into the report (long text becomes its length). Results go to `~/Desktop/derby-ax-report.txt`.

**Go** if, for an app, the verdict says chat text is readable and a Stop button shows while a reply runs. **No-go** for that app otherwise.

## Step 2 (only after a go)

A small menu-bar helper that watches the apps and sends the same chat updates the browser readers send, so desktop and browser chats share one Derby panel. Not started.
