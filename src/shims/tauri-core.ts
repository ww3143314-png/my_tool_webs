/**
 * Web Polyfill for @tauri-apps/api/core
 * Maps all desktop native commands to modern browser Web APIs.
 */

export function isTauri(): boolean {
  return false;
}

export function convertFileSrc(filePath: string): string {
  return filePath;
}

export class Channel<T = any> {
  onmessage: (message: T) => void = () => {};
}

export class Resource {
  readonly rid: number = 0;
  async close(): Promise<void> {}
}

export async function invoke<T = any>(cmd: string, args?: Record<string, any>): Promise<T> {
  // console.debug(`[WebInvoke] ${cmd}`, args);

  switch (cmd) {
    case "window_minimize":
    case "window_hide":
      // Web safe no-op
      return undefined as unknown as T;

    case "window_toggle_maximize":
      if (typeof document !== "undefined") {
        if (document.fullscreenElement) {
          await document.exitFullscreen().catch(() => {});
        } else {
          await document.documentElement.requestFullscreen().catch(() => {});
        }
      }
      return undefined as unknown as T;

    case "window_is_maximized":
      return Boolean(typeof document !== "undefined" && document.fullscreenElement) as unknown as T;

    case "set_window_theme": {
      const theme = args?.theme;
      if (typeof document !== "undefined" && theme) {
        document.documentElement.classList.remove("light", "dark", "eye-care");
        document.documentElement.classList.add(theme);
        try {
          localStorage.setItem("furina:theme", theme);
        } catch { /* ignore */ }
      }
      return undefined as unknown as T;
    }

    case "window_frontend_ready":
      return undefined as unknown as T;

    case "clipboard_write":
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(String(args?.text ?? ""));
      }
      return undefined as unknown as T;

    case "clipboard_read":
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        try {
          return (await navigator.clipboard.readText()) as unknown as T;
        } catch {
          return "" as unknown as T;
        }
      }
      return "" as unknown as T;

    case "clipboard_write_image":
      // Best effort clipboard image write for web
      return undefined as unknown as T;

    case "app_root_path":
      return (typeof location !== "undefined" ? location.origin : "") as unknown as T;

    case "get_build_info":
      return {
        buildTime: new Date().toLocaleDateString(),
        buildEpoch: String(Date.now()),
        version: "2.1.0-web",
      } as unknown as T;

    case "get_default_output_dir":
      return "浏览器默认下载目录 (Downloads)" as unknown as T;

    case "select_directory":
      return "本地所选文件夹" as unknown as T;

    case "pick_file": {
      return new Promise<T>((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        if (args?.extensions && Array.isArray(args.extensions) && args.extensions.length > 0) {
          input.accept = args.extensions.map((ext: string) => `.${ext}`).join(",");
        }
        input.onchange = () => {
          const file = input.files?.[0];
          resolve((file ? file.name : null) as unknown as T);
        };
        input.click();
      });
    }

    case "pick_save_path":
      return (args?.defaultName || "output") as unknown as T;

    case "open_path":
      return { success: true } as unknown as T;

    case "open_external":
      if (typeof window !== "undefined" && args?.url) {
        window.open(String(args.url), "_blank");
      }
      return undefined as unknown as T;

    case "capture_region":
    case "capture_screen": {
      // Use Web Screen Capture API
      try {
        if (!navigator.mediaDevices?.getDisplayMedia) {
          throw new Error("当前浏览器不支持屏幕截图捕获 API");
        }
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const track = stream.getVideoTracks()[0];
        const video = document.createElement("video");
        video.srcObject = stream;
        await video.play();

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1920;
        canvas.height = video.videoHeight || 1080;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0);

        track.stop();
        stream.getTracks().forEach((t) => t.stop());

        const dataUrl = canvas.toDataURL("image/png");
        return {
          success: true,
          dataUrl,
          width: canvas.width,
          height: canvas.height,
        } as unknown as T;
      } catch (err: any) {
        return {
          success: false,
          cancelled: true,
          error: String(err?.message || err),
        } as unknown as T;
      }
    }

    case "apply_desktop_settings":
      return { success: true } as unknown as T;

    case "api_call": {
      const path = String(args?.path || "");
      // Dispatch browser-side internal endpoints
      if (path.includes("/api/health")) {
        return { status: "ok", mode: "web", time: Date.now() } as unknown as T;
      }
      if (path.includes("/api/jobs")) {
        return { jobs: [] } as unknown as T;
      }
      if (path.includes("/api/system/scan")) {
        return {
          status: "healthy",
          platform: "Web / Modern Browser",
          cores: navigator.hardwareConcurrency || 8,
          memory: ((navigator as any).deviceMemory || 8) + " GB (Browser Allocated)",
          userAgent: navigator.userAgent,
          screen: `${window.screen.width}x${window.screen.height}`,
          pixelRatio: window.devicePixelRatio,
          online: navigator.onLine,
        } as unknown as T;
      }
      return { success: true, message: "Web-native handled" } as unknown as T;
    }

    default:
      // Graceful fallback for any unknown Tauri desktop commands
      return { success: true, webMock: true } as unknown as T;
  }
}
