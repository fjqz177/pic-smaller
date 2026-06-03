# PIC-COMPRESS-WASM — Rust WASM 图片压缩库

## OVERVIEW

基于 Rust 的 WebAssembly 图片压缩库，为 pic-smaller 前端提供高性能 PNG/WebP/AVIF 压缩。使用 SIMD 和并行计算优化，通过 wasm-bindgen 导出 JS API。

## STRUCTURE

```
pic-compress-wasm/
├── Cargo.toml          # Rust crate 配置（release profile 含 wasm-opt flags）
├── Cargo.lock          # 依赖锁文件（CI 缓存 key）
├── src/
│   ├── lib.rs          # crate 入口 + wasm-bindgen 导出
│   ├── png.rs          # PNG 压缩实现（量化 + 抖动）
│   ├── avif.rs         # AVIF 编码实现
│   ├── utils.rs        # 工具函数
│   └── error.rs        # 错误类型定义
├── pkg/                # wasm-pack build 产物
└── target/             # Rust 编译产物（巨大，已提交仓库）
```

## WHERE TO LOOK

| 任务 | 位置 | 说明 |
|------|------|------|
| 修改 PNG 压缩参数 | `src/png.rs` | 颜色量化、抖动算法 |
| 修改 AVIF 编码参数 | `src/avif.rs` | quality、speed 控制 |
| 添加新导出函数 | `src/lib.rs` | `#[wasm_bindgen]` 标注的函数会暴露给 JS |
| 构建配置 | `Cargo.toml` | release profile：LTO、strip、wasm-opt flags |
| 构建流程 | 项目根 `scripts/build-wasm.cjs` | wasm-pack build → public/wasm |
| 集成流程 | 项目根 `scripts/integrate-wasm.cjs` | 生成 `src/engines/PicCompressWasm.ts` |
| WASM JS 桥接 | `pkg/pic_compress_wasm.js` | wasm-bindgen 自动生成 |

## CONVENTIONS

- **构建工具**：`wasm-pack build --release --target web --out-dir pkg`
- **性能优化**：RUSTFLAGS 启用 `-Ctarget-feature=+simd128,+bulk-memory,+nontrapping-fptoint`；wasm-opt 启用 `--enable-simd`
- **API 风格**：所有压缩函数返回 `Promise<CompressResult>`（`{data, width, height, size, format}`）
- **类型安全**：集成脚本自动生成 `PicCompressWasm.ts` TypeScript wrapper

## ANTI-PATTERNS

- **不要直接修改 pkg/ 产物**：`pkg/` 由 wasm-pack 生成，所有修改应在 `src/` 中完成并重新构建
- **不要更改导出签名而不更新集成脚本**：修改 `src/lib.rs` 中的 `#[wasm_bindgen]` 函数签名后，必须运行 `npm run wasm:integrate` 重新生成 TS wrapper
- **target/ 巨大**：完整的 debug/release 产物可能数 GB，不要随意提交增量；CI 使用 cache key 加速

## COMMANDS

```bash
# 开发构建（快速，含调试信息）
wasm-pack build --dev --target web --out-dir pkg

# 生产构建（优化后，体积最小）
wasm-pack build --release --target web --out-dir pkg

# 测试
wasm-pack test --headless --firefox

# 代码检查
cargo clippy --target wasm32-unknown-unknown

# 格式化
cargo fmt
```
