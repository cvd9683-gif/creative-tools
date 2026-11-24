document.querySelector("#open").addEventListener("click", async () => {
  // sidePanel.open needs this click; Chrome 116+
  const win = await chrome.windows.getCurrent();
  try { await chrome.sidePanel.open({ windowId: win.id }); }
  catch (e) { alert("Click the Derby icon in your toolbar to open the panel."); }
});
