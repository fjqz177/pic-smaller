# 死代码清理日志 (Dead Code Cleanup Log)

**清理日期**: 2026-02-24  
**清理原因**: WASM 模块迁移后遗留的死代码  
**迁移内容**: 从分离的 PNG/AVIF/GIF WASM 模块 → 统一的 `pic_compress_wasm` 模块

---

## 🗑️ 已删除的文件

### 1. 旧 PNG WASM 模块 (SAFE)

- **文件**: `src/engines/png.wasm` (127 KB)
- **文件**: `src/engines/PngWasmModule.js` (65 KB)
- **删除原因**: 已迁移到统一的 `pic_compress_wasm` 模块，不再被任何代码引用
- **风险等级**: ✅ SAFE - 无引用，工具确认未使用
- **验证**: `grep` 搜索全代码库，无导入引用

### 2. 旧 AVIF WASM 模块 (SAFE)

- **文件**: `src/engines/avif.wasm` (718 KB)
- **文件**: `src/engines/AvifWasmModule.js` (1.4 KB)
- **删除原因**: 已迁移到统一的 `pic_compress_wasm` 模块，不再被任何代码引用
- **风险等级**: ✅ SAFE - 无引用，工具确认未使用
- **验证**: `grep` 搜索全代码库，无导入引用

### 3. Initial.tsx 中的死代码引用 (SAFE)

- **文件**: `src/Initial.tsx`
- **修改内容**: 移除对 `png.wasm` 和 `avif.wasm` 的 `fetch()` 调用
- **修改前**:
  ```typescript
  const loadList: Array<Promise<any>> = [
    import("jszip"),
    fetch(new URL("./engines/png.wasm", import.meta.url)),
    fetch(new URL("./engines/gif.wasm", import.meta.url)),
    fetch(new URL("./engines/avif.wasm", import.meta.url)),
    import("./engines/WorkerPreview?worker"),
    import("./engines/WorkerCompress?worker"),
  ];
  ```
- **修改后**:
  ```typescript
  const loadList: Array<Promise<any>> = [
    import("jszip"),
    fetch(new URL("./engines/gif.wasm", import.meta.url)),
    import("./engines/WorkerPreview?worker"),
    import("./engines/WorkerCompress?worker"),
  ];
  ```
- **风险等级**: ✅ SAFE - GIF WASM 仍在使用，必须保留

---

## 📊 清理成果

### 删除统计

| 类型        | 文件数 | 总大小      |
| ----------- | ------ | ----------- |
| WASM 二进制 | 2      | 845 KB      |
| JS 模块     | 2      | 66.4 KB     |
| 代码修改    | 1      | -           |
| **总计**    | **5**  | **~911 KB** |

### 构建产物优化

**构建前** (`dist/` 目录):

- `assets/png-*.wasm` (129.31 KB) ❌
- `assets/avif-*.wasm` (735.18 KB) ❌
- `assets/gif-*.wasm` (217.11 KB) ✅

**构建后** (`dist/` 目录):

- `assets/gif-*.wasm` (217.11 KB) ✅ - 仍在使用
- `wasm/pic_compress_wasm_bg.wasm` (~1.3 MB) ✅ - 新统一模块
- ❌ **无** png.wasm 和 avif.wasm

### 性能提升

- **源码体积**: 减少 ~911 KB
- **构建产物**: 减少 ~864 KB (png + avif WASM)
- **加载时间**: 减少不必要的 WASM 预加载（2 个 fetch 请求）

---

## ✅ 验证结果

### 1. TypeScript 编译

```bash
npm run build
```

- ✅ 编译成功，无类型错误
- ✅ 构建产物正确，仅包含 gif.wasm

### 2. Lint 检查

```bash
npm run lint
```

- ✅ 无未使用导入警告
- ✅ 无死代码警告

### 3. 测试套件

```bash
npm test
```

```
✓ tests/utils.test.ts (5 tests)
Test Files  1 passed (1)
Tests  5 passed (5)
```

- ✅ 所有测试通过

### 4. 功能验证

- ✅ PNG 压缩 - 使用新的 `pic_compress_wasm` 模块
- ✅ AVIF 压缩 - 使用新的 `pic_compress_wasm` 模块
- ✅ GIF 压缩 - 继续使用 `gifsicle-wasm` 模块
- ✅ 资源加载 - `Initial.tsx` 仅加载必要的 WASM 文件

---

## 🎯 保留的文件（仍在使用）

### GIF WASM 模块

- **文件**: `src/engines/gif.wasm` (213 KB)
- **文件**: `src/engines/GifWasmModule.js` (135 KB)
- **使用位置**: `src/engines/GifImage.ts`
- **保留原因**: GIF 压缩尚未迁移到统一模块，仍依赖 `gifsicle` WASM

---

## 📝 技术说明

### WASM 模块架构变更

**旧架构** (已废弃):

```
src/engines/
├── png.wasm              # PNG 压缩
├── PngWasmModule.js      # PNG 加载器
├── avif.wasm             # AVIF 压缩
├── AvifWasmModule.js     # AVIF 加载器
├── gif.wasm              # GIF 压缩
└── GifWasmModule.js      # GIF 加载器
```

**新架构** (当前):

```
src/engines/
├── PicCompressWasm.ts    # 统一 PNG/AVIF 压缩接口
├── gif.wasm              # GIF 压缩（保留）
└── GifWasmModule.js      # GIF 加载器（保留）

public/wasm/
└── pic_compress_wasm_bg.wasm  # Rust 统一 WASM 模块
```

### 迁移路径

1. ✅ **PNG/AVIF** - 已迁移到 `pic_compress_wasm`（Rust 实现）
2. ⏳ **GIF** - 仍使用 `gifsicle-wasm`（未来可能迁移）

---

## 🔍 验证方法

### 确认死代码已删除

```bash
# 确认旧文件不存在
ls -la src/engines/png.wasm        # 不应存在
ls -la src/engines/avif.wasm       # 不应存在
ls -la src/engines/PngWasmModule.js # 不应存在
ls -la src/engines/AvifWasmModule.js # 不应存在

# 确认新模块存在
ls -la public/wasm/pic_compress_wasm_bg.wasm # 应存在
ls -la src/engines/PicCompressWasm.ts        # 应存在
```

### 确认无引用

```bash
# 搜索代码库，确认无旧模块引用
grep -r "PngWasmModule" src/  # 应无结果
grep -r "AvifWasmModule" src/  # 应无结果
grep -r "png\.wasm" src/       # 应无结果
grep -r "avif\.wasm" src/      # 应无结果
```

### 确认 GIF 模块仍在使用

```bash
# 应找到引用
grep -r "GifWasmModule" src/   # 应在 GifImage.ts 中找到
grep -r "gif\.wasm" src/       # 应在 Initial.tsx 中找到
```

---

## 📌 Git 提交信息

```
refactor: remove dead WASM modules after migration

- Delete old PNG/AVIF WASM binaries (png.wasm, avif.wasm)
- Delete old WASM loaders (PngWasmModule.js, AvifWasmModule.js)
- Remove dead fetch() calls in Initial.tsx
- Keep GIF WASM module (not migrated yet)

Migration: separate WASM modules → unified pic_compress_wasm
Size reduction: ~911 KB source, ~864 KB build artifacts
All tests pass, build succeeds

Refs: WASM integration commit 5651237
```

---

**清理完成时间**: 2026-02-24 04:08  
**清理执行者**: Sisyphus (Refactor & Dead Code Cleaner)  
**清理状态**: ✅ 完成并验证
