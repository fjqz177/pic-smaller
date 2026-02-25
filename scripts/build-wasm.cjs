#!/usr/bin/env node
/**
 * Build WASM module for production
 * Cross-platform Node.js script
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT_DIR = path.resolve(__dirname, "..");
const WASM_DIR = path.join(ROOT_DIR, "pic-compress-wasm");
const OUTPUT_DIR = path.join(ROOT_DIR, "public", "wasm");

console.log("🔨 Building WASM module...\n");

try {
  // Check if wasm-pack is installed
  console.log("📋 Checking wasm-pack...");
  try {
    execSync("wasm-pack --version", { stdio: "ignore" });
    console.log("✅ wasm-pack found\n");
  } catch (error) {
    console.log("❌ wasm-pack not found. Installing...\n");
    execSync(
      "curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh",
      {
        stdio: "inherit",
        cwd: ROOT_DIR,
      },
    );
  }

  // Build WASM module
  console.log("📦 Building with wasm-pack (release mode)...\n");
  const rustFlags = [
    "-C",
    "target-feature=+simd128,+bulk-memory,+nontrapping-fptoint",
  ].join(" ");

  execSync("wasm-pack build --release --target web --out-dir pkg", {
    stdio: "inherit",
    cwd: WASM_DIR,
    env: {
      ...process.env,
      RUSTFLAGS: process.env.RUSTFLAGS
        ? `${process.env.RUSTFLAGS} ${rustFlags}`
        : rustFlags,
    },
  });

  // Copy WASM files to public directory
  console.log("\n📋 Copying WASM files to public/wasm...\n");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = [
    "pic_compress_wasm_bg.wasm",
    "pic_compress_wasm.js",
    "pic_compress_wasm.d.ts",
  ];

  files.forEach((file) => {
    const src = path.join(WASM_DIR, "pkg", file);
    const dest = path.join(OUTPUT_DIR, file);
    fs.copyFileSync(src, dest);
    console.log(`  ✓ ${file}`);
  });

  console.log("\n✅ WASM build complete!\n");
  console.log("📍 Output:", OUTPUT_DIR, "\n");
  console.log(
    'Next step: Run "npm run wasm:integrate" to integrate into the project\n',
  );
} catch (error) {
  console.error("\n❌ Build failed:", error.message);
  process.exit(1);
}
