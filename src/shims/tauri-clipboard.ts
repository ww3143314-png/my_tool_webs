/**
 * Web Polyfill for @tauri-apps/plugin-clipboard-manager
 */

export async function writeText(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  }
}

export async function readText(): Promise<string> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      return await navigator.clipboard.readText();
    } catch {
      return "";
    }
  }
  return "";
}

export async function writeImage(_data: string | Uint8Array): Promise<void> {
  // Web safe fallback
}
