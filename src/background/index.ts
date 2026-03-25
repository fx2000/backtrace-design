const MENU_ID = "backtrace-extract";

// ─── Context menu setup ───────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Extract styles from this page",
      contexts: ["page", "selection"],
    });
  });
});

// ─── Stylesheet fetcher (bypasses CORS for cross-origin sheets) ───────────────

async function fetchStylesheet(url: string): Promise<{ url: string; text: string | null }> {
  try {
    const res = await fetch(url);
    if (!res.ok) return { url, text: null };
    const text = await res.text();
    return { url, text };
  } catch {
    return { url, text: null };
  }
}

// ─── Message handler ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "FETCH_STYLESHEETS" && Array.isArray(message.urls)) {
    Promise.all((message.urls as string[]).map(fetchStylesheet)).then((sheets) => {
      sendResponse({ sheets });
    });
    return true;
  }
});

// ─── Context menu click ───────────────────────────────────────────────────────

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab?.id) return;
  const tabId = tab.id;

  let response: { success: boolean; data?: unknown; error?: string } | undefined;

  // Try to reach the content script (auto-injected via manifest for new pages)
  try {
    response = await chrome.tabs.sendMessage(tabId, { type: "EXTRACT_STYLES" });
  } catch {
    // Content script not present (page was open before extension was installed).
    // Inject it on demand, then retry.
    try {
      await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
      response = await chrome.tabs.sendMessage(tabId, { type: "EXTRACT_STYLES" });
    } catch (err) {
      console.error("[BacktraceDesign] Failed to inject or communicate:", err);
      return;
    }
  }

  if (!response?.success) {
    console.error("[BacktraceDesign] Extraction failed:", response?.error);
    return;
  }

  // Capture a thumbnail of the visible tab before switching away
  const data = response.data as Record<string, unknown>;
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(
      tab!.windowId,
      { format: "jpeg", quality: 50 }
    );
    (data.site as Record<string, unknown>).thumbnail = dataUrl;
  } catch {
    // Not critical — stylebook works without a thumbnail
  }

  await chrome.storage.session.set({ stylebookData: data });
  chrome.tabs.create({ url: chrome.runtime.getURL("stylebook.html") });
});
