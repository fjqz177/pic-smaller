# 🧹 Clean 命令使用指南

## 命令说明

项目提供了两个清理命令，用于清理构建产物，方便从头开始构建。

---

## 📋 可用命令

### 1. `npm run clean` - 清理前端构建文件

清理内容：

- ✅ `dist/` - Vite 构建输出目录
- ✅ `.vite/` - Vite 缓存目录
- ✅ `tsconfig.tsbuildinfo` - TypeScript 构建信息

**不清理**：

- ❌ WASM 构建文件（`pic-compress-wasm/pkg`, `pic-compress-wasm/target`）
- ❌ `public/wasm/` - 已构建的 WASM 文件

**使用场景**：

- 前端代码修改后重新构建
- 快速清理，保留 WASM 模块

```bash
npm run clean
```

### 2. `npm run clean:all` - 清理所有构建文件

清理内容：

- ✅ 所有 `npm run clean` 的内容
- ✅ `pic-compress-wasm/pkg/` - WASM 编译输出
- ✅ `pic-compress-wasm/target/` - Rust 编译目标文件
- ✅ `public/wasm/` - 复制到 public 的 WASM 文件

**使用场景**：

- Rust 代码修改后重新编译 WASM
- 完全干净的构建环境
- 解决构建相关问题

```bash
npm run clean:all
```

---

## 🔄 完整重建流程

### 场景 1：仅重建前端

```bash
# 清理前端构建
npm run clean

# 重新构建
npm run build
```

### 场景 2：完全重建（包括 WASM）

```bash
# 清理所有
npm run clean:all

# 重新构建 WASM
npm run wasm:full

# 重新构建前端
npm run build
```

### 场景 3：开发环境重启

```bash
# 清理所有
npm run clean:all

# 构建 WASM
npm run wasm:full

# 启动开发服务器
npm run dev
```

---

## 📊 清理对比

| 清理项                      | `npm run clean` | `npm run clean:all` |
| --------------------------- | --------------- | ------------------- |
| `dist/`                     | ✅              | ✅                  |
| `.vite/`                    | ✅              | ✅                  |
| `tsconfig.tsbuildinfo`      | ✅              | ✅                  |
| `pic-compress-wasm/pkg/`    | ❌              | ✅                  |
| `pic-compress-wasm/target/` | ❌              | ✅                  |
| `public/wasm/`              | ❌              | ✅                  |
| **耗时**                    | ~0.5s           | ~1s                 |

---

## 💡 使用建议

### 日常开发

```bash
# 开发模式，自动热更新
npm run dev
```

### 修改前端代码后

```bash
# 清理并重建
npm run clean
npm run build
```

### 修改 Rust 代码后

```bash
# 完全重建
npm run clean:all
npm run wasm:full
npm run build
```

### 遇到构建问题时

```bash
# 彻底清理后重建
npm run clean:all
npm install
npm run wasm:full
npm run build
```

---

## ⚠️ 注意事项

1. **清理后需要重新构建**

   - 清理命令只删除文件，不会自动重建
   - 运行 `npm run build` 或 `npm run wasm:full` 重新构建

2. **`clean:all` 会删除 WASM 文件**

   - 执行后必须运行 `npm run wasm:full` 重新构建 WASM
   - 否则浏览器会报 404 错误

3. **`node_modules` 不会被清理**
   - 如需清理依赖，手动删除：
   ```bash
   rm -rf node_modules
   npm install
   ```

---

## 📝 脚本实现

查看清理脚本源码：

- [`scripts/clean.cjs`](../scripts/clean.cjs)

自定义清理目录：

```javascript
// 编辑 scripts/clean.cjs
const COMMON_DIRS = ["dist", ".vite", "tsconfig.tsbuildinfo"];
const WASM_DIRS = [
  "pic-compress-wasm/pkg",
  "pic-compress-wasm/target",
  "public/wasm",
];
```

---

## 🎯 快速参考

```bash
# 快速清理（前端）
npm run clean

# 完全清理（包括 WASM）
npm run clean:all

# 重建 WASM
npm run wasm:full

# 重建前端
npm run build

# 完整流程
npm run clean:all && npm run wasm:full && npm run build
```

---

**清理完成，准备重新构建！** 🚀
