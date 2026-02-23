/**
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
      // 使用绝对路径从 public 目录加载
      await init("/wasm/pic_compress_wasm_bg.wasm");
      wasmInitialized = true;
      console.log("[PicCompressWasm] ✅ WASM module initialized");
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
  options: PngCompressOptions = {},
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
  options: AvifCompressOptions = {},
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
