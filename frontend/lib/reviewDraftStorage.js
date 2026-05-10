function getDesktopStorageBridge() {
  if (typeof window === 'undefined') {
    return null;
  }

  const bridge = window.archflowDesktopStorage;

  if (
    bridge &&
    typeof bridge.getItem === 'function' &&
    typeof bridge.setItem === 'function' &&
    typeof bridge.removeItem === 'function'
  ) {
    return bridge;
  }

  return null;
}

export async function loadReviewDraftFromStorage(storageKey) {
  if (!storageKey || typeof window === 'undefined') {
    return null;
  }

  try {
    const desktopBridge = getDesktopStorageBridge();
    const rawValue = desktopBridge
      ? await desktopBridge.getItem(storageKey)
      : window.localStorage.getItem(storageKey);

    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue);

    return {
      assistantMessages: Array.isArray(parsed.assistantMessages)
        ? parsed.assistantMessages.slice(-20)
        : [],
      reviewSuggestions: Array.isArray(parsed.reviewSuggestions)
        ? parsed.reviewSuggestions
        : []
    };
  } catch (error) {
    console.error('Failed to read assistant review draft from storage:', error);
    return null;
  }
}

export async function saveReviewDraftToStorage(storageKey, draft) {
  if (!storageKey || typeof window === 'undefined') {
    return;
  }

  try {
    const assistantMessages = Array.isArray(draft.assistantMessages)
      ? draft.assistantMessages.slice(-20)
      : [];
    const reviewSuggestions = Array.isArray(draft.reviewSuggestions)
      ? draft.reviewSuggestions
      : [];

    if (assistantMessages.length === 0 && reviewSuggestions.length === 0) {
      await clearReviewDraftFromStorage(storageKey);
      return;
    }

    const serializedDraft = JSON.stringify({
      assistantMessages,
      reviewSuggestions
    });
    const desktopBridge = getDesktopStorageBridge();

    if (desktopBridge) {
      await desktopBridge.setItem(storageKey, serializedDraft);
      return;
    }

    window.localStorage.setItem(storageKey, serializedDraft);
  } catch (error) {
    console.error('Failed to persist assistant review draft to storage:', error);
  }
}

export async function clearReviewDraftFromStorage(storageKey) {
  if (!storageKey || typeof window === 'undefined') {
    return;
  }

  try {
    const desktopBridge = getDesktopStorageBridge();

    if (desktopBridge) {
      await desktopBridge.removeItem(storageKey);
      return;
    }

    window.localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Failed to clear assistant review draft from storage:', error);
  }
}
