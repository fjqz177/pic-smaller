#!/usr/bin/env node
/**
 * Clean build artifacts
 * Usage:
 *   npm run clean        - Clean dist, .vite, tsconfig.tsbuildinfo
 *   npm run clean:all    - Clean all including WASM build artifacts
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");

// Directories to clean
const COMMON_DIRS = ["dist", ".vite", "tsconfig.tsbuildinfo"];
const WASM_DIRS = [
  "pic-compress-wasm/pkg",
  "pic-compress-wasm/target",
  "public/wasm",
];

const CLEAN_ALL = process.argv.includes("--all");

const DIRS_TO_CLEAN = CLEAN_ALL ? [...COMMON_DIRS, ...WASM_DIRS] : COMMON_DIRS;

console.log(
  `🧹 Cleaning build artifacts${CLEAN_ALL ? " (including WASM)" : ""}...\n`,
);

let cleanedCount = 0;
let skippedCount = 0;

DIRS_TO_CLEAN.forEach((dir) => {
  const fullPath = path.join(ROOT_DIR, dir);

  if (!fs.existsSync(fullPath)) {
    console.log(`⊘ Skipped: ${dir} (does not exist)`);
    skippedCount++;
    return;
  }

  try {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`✓ Removed: ${dir}`);
    cleanedCount++;
  } catch (error) {
    console.error(`✗ Failed to remove ${dir}:`, error.message);
  }
});

console.log(`\n✅ Clean complete!`);
console.log(`   Removed: ${cleanedCount} directories`);
console.log(`   Skipped: ${skippedCount} directories`);

if (CLEAN_ALL) {
  console.log(
    `\n💡 Tip: Run "npm run wasm:full" to rebuild WASM module from scratch`,
  );
}

console.log(`   Run "npm run build" to rebuild the project\n`);
