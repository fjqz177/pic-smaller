#!/bin/bash
# Integrate new WASM module into the project

set -e

echo "🔧 Integrating WASM module..."

# Check if WASM files exist
if [ ! -f "public/wasm/pic_compress_wasm.js" ]; then
    echo "❌ WASM files not found. Please run 'npm run wasm:build' first."
    exit 1
fi

# Create TypeScript wrapper if not exists
if [ ! -f "src/engines/PicCompressWasm.ts" ]; then
    echo "📝 Creating TypeScript wrapper..."
    cat > src/engines/PicCompressWasm.ts << 'EOF'
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
EOF
fi

echo "✅ Integration complete!"
echo ""
echo "Next steps:"
echo "1. Update src/engines/PngImage.ts to use compressPng from PicCompressWasm"
echo "2. Update src/engines/AvifImage.ts to use compressAvif from PicCompressWasm"
echo ""
echo "See INTEGRATION.md for detailed instructions."
