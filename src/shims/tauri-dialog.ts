/**
 * Web Polyfill for @tauri-apps/plugin-dialog
 */

export async function open(_options?: any): Promise<string | string[] | null> {
  return null;
}

export async function save(options?: any): Promise<string | null> {
  return options?.defaultPath || "download";
}

export async function message(msg: string, _options?: any): Promise<void> {
  if (typeof window !== "undefined") {
    alert(msg);
  }
}

export async function ask(msg: string, _options?: any): Promise<boolean> {
  if (typeof window !== "undefined") {
    return confirm(msg);
  }
  return false;
}

export async function confirm(msg: string, _options?: any): Promise<boolean> {
  if (typeof window !== "undefined") {
    return window.confirm(msg);
  }
  return false;
}
