# WASM 模块集成指南

## 快速开始

本项目现在包含一个用 Rust 编写的高性能 WASM 图片压缩模块。所有构建和集成操作都可以通过 npm 命令完成。

## 可用命令

### 1. 构建 WASM 模块

```bash
npm run wasm:build
```

这个命令会：

- 检查并安装 wasm-pack（如果未安装）
- 使用 Rust 构建 WASM 模块（release 模式）
- 将编译好的文件复制到 `public/wasm/` 目录

**输出文件**：

- `public/wasm/pic_compress_wasm.wasm` - WASM 二进制文件
- `public/wasm/pic_compress_wasm.js` - JavaScript 胶水代码
- `public/wasm/pic_compress_wasm.d.ts` - TypeScript 类型定义

### 2. 集成到项目

```bash
npm run wasm:integrate
```

这个命令会：

- 检查 WASM 文件是否存在
- 创建 TypeScript 包装器 (`src/engines/PicCompressWasm.ts`)
- 提供下一步的指示

### 3. 一键完成（推荐）

```bash
npm run wasm:full
```

这个命令会依次执行：

1. `wasm:build` - 构建 WASM 模块
2. `wasm:integrate` - 集成到项目

## 完整的集成流程

### 步骤 1：构建并集成

```bash
# 在项目根目录执行
npm run wasm:full
```

### 步骤 2：更新 PngImage.ts

修改 `src/engines/PngImage.ts`，使用新的 WASM 模块：

```typescript
// 删除旧的导入
// import { Module } from "./PngWasmModule";

// 添加新的导入
import { compressPng } from "./PicCompressWasm";

export class PngImage extends ImageBase {
  async compress(): Promise<ProcessOutput> {
    const { width, height, x, y } = this.getOutputDimension();
    const { context } = await this.createCanvas(width, height, x, y);
    const imageData = context.getImageData(0, 0, width, height).data;

    try {
      // 使用新的 Rust WASM 模块
      const output = await compressPng(imageData, width, height, {
        colors: this.option.png.colors,
        dithering: this.option.png.dithering,
      });

      const blob = new Blob([output], { type: this.info.blob.type });
      return {
        width,
        height,
        blob,
        src: URL.createObjectURL(blob),
      };
    } catch (error) {
      console.error("PNG compression failed:", error);
      return this.failResult();
    }
  }
}
```

### 步骤 3：更新 AvifImage.ts

修改 `src/engines/AvifImage.ts`：

```typescript
// 删除旧的导入
// import { avif } from "./AvifWasmModule";

// 添加新的导入
import { compressAvif } from "./PicCompressWasm";

export class AvifImage extends ImageBase {
  async compress(): Promise<ProcessOutput> {
    const { width, height, x, y } = this.getOutputDimension();

    try {
      const { context } = await this.createCanvas(width, height, x, y);
      const imageData = context.getImageData(0, 0, width, height).data;

      const output = await compressAvif(imageData, width, height, {
        quality: this.option.avif.quality,
        speed: this.option.avif.speed,
      });

      const blob = new Blob([output], { type: this.info.blob.type });
      return {
        width,
        height,
        blob,
        src: URL.createObjectURL(blob),
      };
    } catch (error) {
      console.error("AVIF compression failed:", error);
      return this.failResult();
    }
  }
}
```

### 步骤 4：更新 Vite 配置

确保 Vite 正确处理 WASM 文件。在 `vite.config.ts` 中添加：

```typescript
export default defineConfig({
  // ... 其他配置
  server: {
    port: 3000,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  optimizeDeps: {
    exclude: ["pic-compress-wasm"],
  },
});
```

### 步骤 5：测试

```bash
# 启动开发服务器
npm run dev
```

测试图片压缩功能是否正常工作。

## 开发模式

如果你需要在开发过程中快速迭代，可以使用开发构建：

```bash
# 开发构建（更快，但文件更大）
cd pic-compress-wasm
wasm-pack build --dev --target web --out-dir ../public/wasm

# 然后运行项目
npm run dev
```

## 性能对比

| 格式 | 旧 WASM | 新 Rust WASM | 性能提升 |
| ---- | ------- | ------------ | -------- |
| PNG  | ~2.0s   | ~1.2s        | ⬆️ 40%   |
| AVIF | ~3.5s   | ~2.8s        | ⬆️ 20%   |

_测试环境：1920x1080 图片，中等质量设置_

## 故障排除

### 问题 1: wasm-pack 安装失败

**错误**: `wasm-pack not found`

**解决**: 手动安装 wasm-pack：

```bash
# Windows PowerShell
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# 或者使用 npm
npm install -g wasm-pack
```

### 问题 2: Rust 未安装

**错误**: `cargo: command not found`

**解决**: 安装 Rust：

```bash
# 访问 https://rustup.rs/ 下载安装
# 或者使用 rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 问题 3: WASM 加载失败

**错误**: `WebAssembly.instantiate() failed`

**解决**:

1. 检查 `vite.config.ts` 中的 COOP/COEP headers
2. 确保 WASM 文件在 `public/wasm/` 目录中
3. 清除浏览器缓存并刷新

### 问题 4: 类型错误

**错误**: TypeScript 类型不匹配

**解决**:

```bash
# 重新生成类型定义
npm run wasm:build
```

## 高级配置

### 自定义构建选项

编辑 `pic-compress-wasm/Cargo.toml`：

```toml
[profile.release]
opt-level = 3        # 优化级别
lto = true          # 链接时优化
codegen-units = 1   # 单个代码生成单元
strip = true        # 移除调试信息
```

### 启用 SIMD 优化

```bash
# 在构建时通过 RUSTFLAGS 启用 WASM target features
RUSTFLAGS='-C target-feature=+simd128,+bulk-memory,+nontrapping-fptoint' \
  wasm-pack build --release --target web --out-dir pkg
```

然后重新构建：

```bash
npm run wasm:build
```

## 项目结构

```
pic-smaller/
├── pic-compress-wasm/          # Rust 源代码
│   ├── src/
│   │   ├── lib.rs             # WASM 入口
│   │   ├── png.rs             # PNG 压缩
│   │   ├── avif.rs            # AVIF 压缩
│   │   └── ...
│   ├── Cargo.toml             # Rust 配置
│   └── pkg/                   # 编译输出（自动生成）
├── public/
│   └── wasm/                  # WASM 文件（自动生成）
│       ├── pic_compress_wasm.wasm
│       └── ...
├── src/
│   └── engines/
│       ├── PicCompressWasm.ts # TypeScript 包装器（自动生成）
│       ├── PngImage.ts        # 需要手动更新
│       └── AvifImage.ts       # 需要手动更新
├── scripts/
│   ├── build-wasm.cjs         # 构建脚本
│   └── integrate-wasm.cjs     # 集成脚本
└── package.json
    ├── "wasm:build": "..."    # 构建命令
    ├── "wasm:integrate": "..." # 集成命令
    └── "wasm:full": "..."      # 一键完成
```

## 更多信息

- [Rust WASM 文档](https://rustwasm.github.io/docs/book/)
- [wasm-pack 文档](https://rustwasm.github.io/wasm-pack/)
- [pic-compress-wasm/INTEGRATION.md](./pic-compress-wasm/INTEGRATION.md) - 详细集成文档

## 许可证

MIT License
