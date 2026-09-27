/**
 * Web Polyfill for @tauri-apps/plugin-fs
 */

export async function readTextFile(_path: string): Promise<string> {
  return "";
}

export async function readFile(_path: string): Promise<Uint8Array> {
  return new Uint8Array(0);
}

export async function writeTextFile(_path: string, _contents: string): Promise<void> {}

export async function writeFile(_path: string, _data: Uint8Array): Promise<void> {}

export async function exists(_path: string): Promise<boolean> {
  return false;
}

export async function mkdir(_path: string, _options?: any): Promise<void> {}
