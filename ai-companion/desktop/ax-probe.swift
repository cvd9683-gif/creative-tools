// Derby desktop check (step 1 of the desktop helper). Run on your Mac:
//
//     swift ai-companion/desktop/ax-probe.swift
//
// Open the Claude and/or ChatGPT (or Grok) desktop app first, with a chat on screen, and a ChatGPT chat in your browser. The first run asks for
// Accessibility permission for your Terminal app: allow it in System Settings → Privacy & Security →
// Accessibility, then run the script again.
//
// It only READS what each app shows to screen readers. It never clicks or types. Chat text is NOT copied into
// the report: long text is replaced by its length, so the report is safe to share. Short labels (buttons,
// headings, under 40 characters) are kept, because that's how Derby will recognise the Stop button.
//
// The report is written to ~/Desktop/derby-ax-report.txt.

import AppKit
import ApplicationServices
import Foundation

// AI apps, plus browsers: if Accessibility can read ChatGPT inside Arc or Chrome, one Mac app could track
// browser chats too, with no extension.
let targets = ["Claude", "ChatGPT", "Grok", "Arc", "Google Chrome", "Safari"]
let maxNodes = 6000
let maxDepth = 60

func attr(_ el: AXUIElement, _ name: String) -> AnyObject? {
    var v: AnyObject?
    return AXUIElementCopyAttributeValue(el, name as CFString, &v) == .success ? v : nil
}
func str(_ el: AXUIElement, _ name: String) -> String? {
    guard let v = attr(el, name) else { return nil }
    if let s = v as? String { return s.isEmpty ? nil : s }
    return nil
}
func safe(_ s: String) -> String {
    let one = s.replacingOccurrences(of: "\n", with: " ")
    return one.count < 40 ? "\"\(one)\"" : "[text, \(s.count) chars]"
}

let trusted = AXIsProcessTrustedWithOptions([kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary)
if !trusted {
    print("Accessibility permission is needed. Allow your Terminal app in System Settings → Privacy & Security → Accessibility, then run this again.")
    exit(1)
}

var report = "Derby desktop check, \(Date())\n"
let apps = NSWorkspace.shared.runningApplications.filter { app in
    guard let n = app.localizedName else { return false }
    return targets.contains { n == $0 || n.hasPrefix($0 + " ") }
}
if apps.isEmpty { print("None of \(targets.joined(separator: ", ")) is running. Open one with a chat on screen and run again."); exit(1) }

for app in apps {
    let name = app.localizedName ?? "?"
    let root = AXUIElementCreateApplication(app.processIdentifier)
    // Electron/Chromium apps (the Claude app, Arc, Chrome) hide their page from Accessibility unless asked.
    // Electron listens for AXManualAccessibility; Chrome-based browsers for AXEnhancedUserInterface.
    let manual = AXUIElementSetAttributeValue(root, "AXManualAccessibility" as CFString, kCFBooleanTrue)
    _ = AXUIElementSetAttributeValue(root, "AXEnhancedUserInterface" as CFString, kCFBooleanTrue)
    Thread.sleep(forTimeInterval: 1.5)

    var nodes = 0, textNodes = 0, longText = 0
    var stopButtons: [String] = []
    var lines: [String] = []
    func walk(_ el: AXUIElement, _ depth: Int) {
        if nodes >= maxNodes || depth > maxDepth { return }
        nodes += 1
        let role = str(el, kAXRoleAttribute) ?? "?"
        let sub = str(el, kAXSubroleAttribute)
        let bits = [kAXTitleAttribute, kAXDescriptionAttribute, kAXValueAttribute, "AXDOMIdentifier", "AXIdentifier", "AXDOMClassList"]
            .compactMap { k -> String? in
                if k == "AXDOMClassList", let list = attr(el, k) as? [String], !list.isEmpty { return "class=\(list.prefix(4).joined(separator: "."))" }
                guard let s = str(el, k) else { return nil }
                if k == kAXValueAttribute || k == kAXTitleAttribute || k == kAXDescriptionAttribute {
                    textNodes += 1
                    if s.count >= 40 { longText += 1 }
                    if role == "AXButton" && s.lowercased().contains("stop") { stopButtons.append(s) }
                }
                return "\(k.replacingOccurrences(of: "AX", with: ""))=\(safe(s))"
            }
        lines.append(String(repeating: "  ", count: min(depth, 30)) + role + (sub.map { "/\($0)" } ?? "") + (bits.isEmpty ? "" : "  " + bits.joined(separator: "  ")))
        if let kids = attr(el, kAXChildrenAttribute) as? [AXUIElement] { for k in kids { walk(k, depth + 1) } }
    }
    walk(root, 0)

    let summary = """

    === \(name) (\(app.bundleIdentifier ?? "?")) ===
    Manual accessibility switch: \(manual == .success ? "accepted" : "not accepted (\(manual.rawValue))")
    Elements seen: \(nodes)\(nodes >= maxNodes ? " (stopped at the limit)" : "")
    Elements with text: \(textNodes), long text blocks (likely messages): \(longText)
    Stop buttons visible now: \(stopButtons.isEmpty ? "none" : stopButtons.joined(separator: ", "))
    Verdict: \(longText >= 2 ? "chat text looks readable" : "chat text NOT visible: Derby can't read this app this way")
    """
    print(summary)
    report += summary + "\n\n" + lines.joined(separator: "\n") + "\n"
}

let out = FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent("Desktop/derby-ax-report.txt")
try? report.write(to: out, atomically: true, encoding: .utf8)
print("\nFull report: \(out.path)")
print("Run it once while a reply is being written too, to see whether a Stop button shows up.")
