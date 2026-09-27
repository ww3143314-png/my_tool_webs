/**
 * Web Polyfill for @tauri-apps/plugin-shell
 */

export async function open(pathOrUrl: string): Promise<void> {
  if (typeof window !== "undefined") {
    window.open(pathOrUrl, "_blank");
  }
}
