import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Tauri 用系统自带的 WebView2，所以开发服务器固定 1420 端口（Tauri 的 devUrl 指向它）。
// Keep the HTML entry and aliases on one Windows drive-letter spelling.
// Vite inline-style proxies use case-sensitive cache keys, even on NTFS.
const frontendRoot = path.resolve(__dirname).replace(/^[a-z]:/, drive => drive.toUpperCase());
export default defineConfig({
  root: frontendRoot,
  plugins: [react()],
  clearScreen: false,
  server: { port: 5173, host: "0.0.0.0" },
  preview: { port: 5173, host: "0.0.0.0" },
  build: { outDir: "dist", emptyOutDir: true, target: "chrome110",
    rollupOptions: { input: path.resolve(frontendRoot, "index.html") },
  },
  define: {
    // 原版这两个开关写在 apps/web/.env.local，Electron 主进程里也会再设一遍
    // （main.js:127）。它们决定"下载类工具"是否显示：
    //   共享包里的 getAvailableTools() 会用 selfHostOnly && !downloadsEnabled() 过滤掉一批工具。
    // 不补上的话界面会少 20 个工具（实测 178 vs 198）—— 这正是"界面要一模一样"必须补的一环。
    "process.env.NEXT_PUBLIC_ENABLE_DOWNLOADS": JSON.stringify("1"),
    "process.env.NEXT_PUBLIC_ENABLE_HEAVY_WORKER_TOOLS": JSON.stringify("1"),
    "process.env.NEXT_PUBLIC_APP_NAME": JSON.stringify("FurinaKit"),
  },
  resolve: {
    alias: {
      "@": path.resolve(frontendRoot, "src"),
      "@furinakit/shared": path.resolve(frontendRoot, "src/shared"),
      "next/link": path.resolve(frontendRoot, "src/shims/next-link.tsx"),
      "next/navigation": path.resolve(frontendRoot, "src/shims/next-navigation.ts"),
      "@tauri-apps/api/core": path.resolve(frontendRoot, "src/shims/tauri-core.ts"),
      "@tauri-apps/api/window": path.resolve(frontendRoot, "src/shims/tauri-window.ts"),
      "@tauri-apps/api/event": path.resolve(frontendRoot, "src/shims/tauri-event.ts"),
      "@tauri-apps/api": path.resolve(frontendRoot, "src/shims/tauri-core.ts"),
      "@tauri-apps/plugin-clipboard-manager": path.resolve(frontendRoot, "src/shims/tauri-clipboard.ts"),
      "@tauri-apps/plugin-dialog": path.resolve(frontendRoot, "src/shims/tauri-dialog.ts"),
      "@tauri-apps/plugin-fs": path.resolve(frontendRoot, "src/shims/tauri-fs.ts"),
      "@tauri-apps/plugin-shell": path.resolve(frontendRoot, "src/shims/tauri-shell.ts"),
    },
  },
});
