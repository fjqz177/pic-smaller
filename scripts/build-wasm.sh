#!/bin/bash
# Build WASM module for production

set -e

echo "🔨 Building WASM module..."

cd pic-compress-wasm

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "❌ wasm-pack not found. Installing..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

# Build WASM module
echo "📦 Building with wasm-pack..."
wasm-pack build --release --target web --out-dir pkg

# Copy WASM files to public directory
echo "📋 Copying WASM files to public/wasm..."
mkdir -p ../public/wasm
cp pkg/pic_compress_wasm.wasm ../public/wasm/
cp pkg/pic_compress_wasm.js ../public/wasm/
cp pkg/pic_compress_wasm.d.ts ../public/wasm/

echo "✅ WASM build complete!"
echo "📍 Output: public/wasm/"
