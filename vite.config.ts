/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // WASM 文件复制插件
    {
      name: "wasm-copy-plugin",
      closeBundle() {
        const wasmSrc = path.resolve(__dirname, "public/wasm");
        const wasmDest = path.resolve(__dirname, "dist/wasm");

        if (fs.existsSync(wasmSrc)) {
          if (!fs.existsSync(wasmDest)) {
            fs.mkdirSync(wasmDest, { recursive: true });
          }
          fs.cpSync(wasmSrc, wasmDest, { recursive: true });
          console.log("[WASM] Copied to dist/wasm/");
        }
      },
    },
  ],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    // WASM 需要共享内存，必须设置这些 headers
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  preview: {
    port: 3001,
    host: "0.0.0.0",
    // 预览环境也需要相同配置
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  test: {
    include: ["tests/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
  },
});
