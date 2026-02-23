# Pic Compress WASM

高性能 WebAssembly 图片压缩库，用于 pic-smaller 项目。

## 功能特性

- 🚀 **高性能**: 基于 Rust 编写，利用 SIMD 和并行计算
- 📦 **多格式支持**: PNG, WebP, AVIF
- 🔒 **类型安全**: 完整的 TypeScript 类型定义
- 🌐 **浏览器友好**: 优化的 WASM 体积和内存管理

## 快速开始

### 安装依赖

```bash
# 安装 wasm-pack (如果尚未安装)
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

### 构建 WASM 模块

```bash
# 开发构建
wasm-pack build --dev --target web --out-dir pkg

# 生产构建（优化后）
wasm-pack build --release --target web --out-dir pkg
```

### 在项目中使用

```typescript
import {
  init,
  compressPng,
  compressWebp,
  compressAvif,
} from "./pic-compress-wasm/pkg";

// 初始化 WASM 模块
await init();

// 压缩 PNG
const pngResult = await compressPng(imageData, width, height, {
  colors: 128,
  dithering: 0.5,
});

// 压缩 WebP
const webpResult = await compressWebp(imageData, width, height, {
  quality: 0.8,
  method: 6,
});

// 压缩 AVIF
const avifResult = await compressAvif(imageData, width, height, {
  quality: 50,
  speed: 8,
});
```

## API 文档

### 初始化

```typescript
init(): Promise<void>
```

初始化 WASM 模块，必须在使用其他函数前调用。

### PNG 压缩

```typescript
compressPng(
  data: Uint8Array,
  width: number,
  height: number,
  options: PngOptions
): Promise<CompressResult>

interface PngOptions {
  colors?: number;      // 颜色数量 (2-256)，默认 256
  dithering?: number;   // 抖动强度 (0-1)，默认 0
}
```

### WebP 压缩

```typescript
compressWebp(
  data: Uint8Array,
  width: number,
  height: number,
  options: WebpOptions
): Promise<CompressResult>

interface WebpOptions {
  quality?: number;     // 质量 (0-1)，默认 0.8
  method?: number;      // 压缩方法 (0-6)，默认 6
}
```

### AVIF 压缩

```typescript
compressAvif(
  data: Uint8Array,
  width: number,
  height: number,
  options: AvifOptions
): Promise<CompressResult>

interface AvifOptions {
  quality?: number;     // 质量 (1-100)，默认 50
  speed?: number;       // 速度 (1-10)，默认 8
}
```

### 返回类型

```typescript
interface CompressResult {
  data: Uint8Array; // 压缩后的图像数据
  width: number; // 宽度
  height: number; // 高度
  size: number; // 压缩后大小（字节）
  format: string; // 格式名称
}
```

## 性能优化

1. **并行处理**: 启用 `parallel` 特性使用多线程
2. **SIMD 加速**: 支持 WASM SIMD 扩展
3. **内存优化**: 最小化内存分配和数据拷贝

## 开发

```bash
# 运行测试
wasm-pack test --headless --firefox

# 检查代码
cargo clippy --target wasm32-unknown-unknown

# 格式化代码
cargo fmt
```

## 构建说明

- **开发构建**: `wasm-pack build --dev` - 快速构建，包含调试信息
- **发布构建**: `wasm-pack build --release` - 优化构建，最小体积
- **性能分析**: `wasm-pack build --profiling` - 包含性能分析信息

## 许可证

MIT License

## 致谢

- [image-rs](https://github.com/image-rs/image) - Rust 图像处理库
- [ravif](https://github.com/kornelski/ravif) - Rust AVIF 编码器
- [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen) - Rust 与 JavaScript 互操作
