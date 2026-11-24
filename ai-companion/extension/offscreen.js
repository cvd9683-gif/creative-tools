/* Rings the bell while the side panel is closed (the service worker can't play audio). Needs testing: whether Chrome
   lets an offscreen document start audio without a click first. If it can't, the badge and the row still show it. */
import { ringBell, unlockBell } from "./shared/bell.js";
unlockBell();
chrome.runtime.onMessage.addListener((m) => { if (m && m.type === "ring") ringBell({ force: true }); });
