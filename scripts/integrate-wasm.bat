@echo off
REM Integrate new WASM module into the project

echo Integrating WASM module...

REM Check if WASM files exist
if not exist "public\wasm\pic_compress_wasm.js" (
    echo WASM files not found. Please run 'npm run wasm:build' first.
    exit /b 1
)

REM Create TypeScript wrapper if not exists
if not exist "src\engines\PicCompressWasm.ts" (
    echo Creating TypeScript wrapper...
    (
        echo /**
        echo  * PicCompressWasm - Rust-based high-performance image compression
        echo  *
        echo  * This module provides PNG and AVIF compression using WebAssembly
        echo  */
        echo import init, {
        echo   compress_png_js,
        echo   compress_avif_js,
        echo } from "../../public/wasm/pic_compress_wasm";
        echo.
        echo let wasmInitialized = false;
        echo let initPromise: Promise^<void^> | null = null;
        echo.
        echo /**
        echo  * Initialize WASM module
        echo  */
        echo export async function ensureWasmInit^(): Promise^<void^> {
        echo   if ^(wasmInitialized^) {
        echo     return;
        echo   }
        echo.
        echo   if ^(!initPromise^) {
        echo     initPromise = ^(async ^(^) =^> {
        echo       await init^("/wasm/pic_compress_wasm.wasm"^);
        echo       wasmInitialized = true;
        echo       console.log^("[PicCompressWasm] WASM module initialized"^);
        echo     ^)^();
        echo   }
        echo.
        echo   await initPromise;
        echo }
        echo.
        echo export interface PngCompressOptions {
        echo   colors?: number;
        echo   dithering?: number;
        echo   compression_level?: number;
        echo }
        echo.
        echo export interface AvifCompressOptions {
        echo   quality?: number;
        echo   speed?: number;
        echo }
        echo.
        echo /**
        echo  * Compress PNG image
        echo  * @param imageData - RGBA pixel data
        echo  * @param width - Image width
        echo  * @param height - Image height
        echo  * @param options - Compression options
        echo  * @returns Compressed PNG data
        echo  */
        echo export async function compressPng^(
        echo   imageData: Uint8Array,
        echo   width: number,
        echo   height: number,
        echo   options: PngCompressOptions = {}
        echo ^): Promise^<Uint8Array^> {
        echo   await ensureWasmInit^();
        echo.
        echo   const pngOptions = {
        echo     colors: options.colors ?? 255,
        echo     dithering: options.dithering ?? 0.0,
        echo     compression_level: options.compression_level ?? 6,
        echo   };
        echo.
        echo   try {
        echo     return await compress_png_js^(imageData, width, height, pngOptions^);
        echo   } catch ^(error^) {
        echo     console.error^("[PicCompressWasm] PNG compression failed:", error^);
        echo     throw error;
        echo   }
        echo }
        echo.
        echo /**
        echo  * Compress AVIF image
        echo  * @param imageData - RGBA pixel data
        echo  * @param width - Image width
        echo  * @param height - Image height
        echo  * @param options - Compression options
        echo  * @returns Compressed AVIF data
        echo  */
        echo export async function compressAvif^(
        echo   imageData: Uint8Array,
        echo   width: number,
        echo   height: number,
        echo   options: AvifCompressOptions = {}
        echo ^): Promise^<Uint8Array^> {
        echo   await ensureWasmInit^();
        echo.
        echo   const avifOptions = {
        echo     quality: options.quality ?? 50,
        echo     speed: options.speed ?? 8,
        echo   };
        echo.
        echo   try {
        echo     return await compress_avif_js^(imageData, width, height, avifOptions^);
        echo   } catch ^(error^) {
        echo     console.error^("[PicCompressWasm] AVIF compression failed:", error^);
        echo     throw error;
        echo   }
        echo }
    ) > src\engines\PicCompressWasm.ts
)

echo.
echo Integration complete!
echo.
echo Next steps:
echo 1. Update src/engines/PngImage.ts to use compressPng from PicCompressWasm
echo 2. Update src/engines/AvifImage.ts to use compressAvif from PicCompressWasm
echo.
echo See INTEGRATION.md for detailed instructions.
