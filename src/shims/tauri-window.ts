/**
 * Web Polyfill for @tauri-apps/api/window
 */

export interface WebWindow {
  isMaximized: () => Promise<boolean>;
  onResized: (cb: () => void) => Promise<() => void>;
  minimize: () => Promise<void>;
  toggleMaximize: () => Promise<void>;
  close: () => Promise<void>;
  hide: () => Promise<void>;
  show: () => Promise<void>;
  setFocus: () => Promise<void>;
  setTitle: (title: string) => Promise<void>;
}

export function getCurrentWindow(): WebWindow {
  return {
    isMaximized: async () => {
      if (typeof document === "undefined") return false;
      return Boolean(document.fullscreenElement);
    },
    onResized: async (cb: () => void) => {
      if (typeof window === "undefined") return () => {};
      const handler = () => cb();
      window.addEventListener("resize", handler);
      document.addEventListener("fullscreenchange", handler);
      return () => {
        window.removeEventListener("resize", handler);
        document.removeEventListener("fullscreenchange", handler);
      };
    },
    minimize: async () => {
      // Browser cannot minimize window directly
    },
    toggleMaximize: async () => {
      if (typeof document === "undefined") return;
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      } else {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    },
    close: async () => {
      // In browser, navigate or close
    },
    hide: async () => {},
    show: async () => {},
    setFocus: async () => {},
    setTitle: async (title: string) => {
      if (typeof document !== "undefined") {
        document.title = title;
      }
    },
  };
}
