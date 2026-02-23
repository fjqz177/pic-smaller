#!/usr/bin/env node
/**
 * Integrate WASM module into the project
 * Cross-platform Node.js script
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const WASM_OUTPUT_DIR = path.join(ROOT_DIR, "public", "wasm");
const ENGINES_DIR = path.join(ROOT_DIR, "src", "engines");
const WRAPPER_FILE = path.join(ENGINES_DIR, "PicCompressWasm.ts");

console.log("🔧 Integrating WASM module...\n");

try {
  // Check if WASM files exist
  console.log("📋 Checking WASM files...");
  const requiredFiles = [
    "pic_compress_wasm_bg.wasm",
    "pic_compress_wasm.js",
    "pic_compress_wasm.d.ts",
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(WASM_OUTPUT_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Missing file: ${file}`);
      console.log('\nPlease run "npm run wasm:build" first.\n');
      process.exit(1);
    }
  }
  console.log("✅ All WASM files found\n");

  // Create TypeScript wrapper if not exists
  if (!fs.existsSync(WRAPPER_FILE)) {
    console.log("📝 Creating TypeScript wrapper...\n");

    const wrapperCode = `/**
 * PicCompressWasm - Rust-based high-performance image compression
 * 
 * This module provides PNG and AVIF compression using WebAssembly
 */
import init, {
  compress_png_js,
  compress_avif_js,
} from "../../public/wasm/pic_compress_wasm";

let wasmInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * Initialize WASM module
 */
export async function ensureWasmInit(): Promise<void> {
  if (wasmInitialized) {
    return;
  }

  if (!initPromise) {
    initPromise = (async () => {
      await init("/wasm/pic_compress_wasm.wasm");
      wasmInitialized = true;
      console.log("[PicCompressWasm] WASM module initialized");
    })();
  }

  await initPromise;
}

export interface PngCompressOptions {
  colors?: number;
  dithering?: number;
  compression_level?: number;
}

export interface AvifCompressOptions {
  quality?: number;
  speed?: number;
}

/**
 * Compress PNG image
 * @param imageData - RGBA pixel data
 * @param width - Image width
 * @param height - Image height
 * @param options - Compression options
 * @returns Compressed PNG data
 */
export async function compressPng(
  imageData: Uint8Array,
  width: number,
  height: number,
  options: PngCompressOptions = {}
): Promise<Uint8Array> {
  await ensureWasmInit();

  const pngOptions = {
    colors: options.colors ?? 255,
    dithering: options.dithering ?? 0.0,
    compression_level: options.compression_level ?? 6,
  };

  try {
    return await compress_png_js(imageData, width, height, pngOptions);
  } catch (error) {
    console.error("[PicCompressWasm] PNG compression failed:", error);
    throw error;
  }
}

/**
 * Compress AVIF image
 * @param imageData - RGBA pixel data
 * @param width - Image width
 * @param height - Image height
 * @param options - Compression options
 * @returns Compressed AVIF data
 */
export async function compressAvif(
  imageData: Uint8Array,
  width: number,
  height: number,
  options: AvifCompressOptions = {}
): Promise<Uint8Array> {
  await ensureWasmInit();

  const avifOptions = {
    quality: options.quality ?? 50,
    speed: options.speed ?? 8,
  };

  try {
    return await compress_avif_js(imageData, width, height, avifOptions);
  } catch (error) {
    console.error("[PicCompressWasm] AVIF compression failed:", error);
    throw error;
  }
}
`;

    fs.writeFileSync(WRAPPER_FILE, wrapperCode, "utf-8");
    console.log("✅ TypeScript wrapper created\n");
  } else {
    console.log("ℹ️  TypeScript wrapper already exists\n");
  }

  console.log("✅ Integration complete!\n");
  console.log("Next steps:");
  console.log(
    "  1. Update src/engines/PngImage.ts to use compressPng from PicCompressWasm",
  );
  console.log(
    "  2. Update src/engines/AvifImage.ts to use compressAvif from PicCompressWasm",
  );
  console.log("\nSee INTEGRATION.md for detailed instructions.\n");
} catch (error) {
  console.error("\n❌ Integration failed:", error.message);
  process.exit(1);
}
