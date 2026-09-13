export function safeConfirm(message: string): boolean {
  try {
    return window.confirm(message);
  } catch (e) {
    console.warn('window.confirm blocked by sandbox/iframe, proceeding safely:', e);
    return true;
  }
}
