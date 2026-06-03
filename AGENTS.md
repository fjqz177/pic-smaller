# PROJECT KNOWLEDGE BASE

**Generated:** 2026-06-04
**Commit:** b9d753e
**Branch:** master

## OVERVIEW

Pic Smaller（图小小）— 纯前端在线图片压缩工具。Vite + React 18 + TypeScript + MobX + Ant Design，核心压缩由 Rust WASM (`pic-compress-wasm`) 提供。

## STRUCTURE

```
pic-smaller/
├── src/                    # 前端源码
│   ├── engines/            # 图片压缩引擎（核心域）→ AGENTS.md
│   ├── components/         # UI 组件（每组件一个目录 + CSS Module）
│   ├── pages/              # 页面（home、error404）
│   ├── states/             # MobX 页面状态（仅 home.ts）
│   ├── locales/            # 国际化翻译文件（9 种语言）
│   ├── utils/              # 工具函数（file、format、misc）
│   ├── main.tsx            # 应用启动入口
│   ├── App.tsx             # 顶层组件（Antd ConfigProvider + 路由渲染）
│   ├── router.tsx          # 自定义客户端路由（history + import.meta.glob）
│   ├── modules.ts          # Vite glob 导入映射（pages、locales）
│   ├── global.tsx          # MobX 全局状态 gstate
│   └── type.ts             # 全局类型定义
├── pic-compress-wasm/      # Rust WASM 子项目 → AGENTS.md
├── scripts/                # 构建脚本（WASM 构建、集成、清理）
├── tests/                  # 测试（Vitest，仅 utils.test.ts）
├── public/wasm/            # WASM 运行时产物（pic_compress_wasm.js）
└── docs/                   # 文档截图
```

## WHERE TO LOOK

| 任务 | 位置 | 备注 |
|------|------|------|
| 应用启动流程 | `src/main.tsx` → `src/App.tsx` → `src/Initial.tsx` | main.tsx 在 window.onload 挂载 |
| 路由 | `src/router.tsx` | 自实现（history），非 react-router |
| 页面组件 | `src/pages/{name}/index.tsx` | 通过 import.meta.glob 动态导入 |
| 全局状态 | `src/global.tsx` (gstate) | MobX，gstate.page 存放 React.ReactNode |
| 页面状态 | `src/states/home.ts` (homeState) | 图片列表、压缩选项 |
| 图片压缩逻辑 | `src/engines/` | ImageBase → 具体引擎 → Worker → Queue |
| WASM 压缩核心 | `pic-compress-wasm/src/` | Rust 实现 PNG/WebP/AVIF 压缩 |
| 国际化 | `src/locale.ts` + `src/locales/*.ts` | 9 种语言，localStorage 缓存 |
| UI 组件 | `src/components/{Name}/` | 每组件 index.tsx + index.module.scss |
| Antd 静态方法 | `src/ContextAction.ts` | 导出 message/modal/notification |
| 构建配置 | `vite.config.ts` `tsconfig.json` | @/ alias → src/ |
| WASM 构建 | `scripts/build-wasm.cjs` `scripts/integrate-wasm.cjs` | wasm-pack 构建 → public/wasm |

## CODE MAP

| 符号 | 类型 | 位置 | 职责 |
|------|------|------|------|
| `App` | 组件 | `src/App.tsx` | 顶层：Antd ConfigProvider + 渲染 gstate.page |
| `gstate` | 实例 | `src/global.tsx` | 全局状态：pathname、page（ReactNode）、locale、loading |
| `homeState` | 实例 | `src/states/home.ts` | 主页状态：图片列表、压缩选项、任务进度 |
| `initRouter` | 函数 | `src/router.tsx` | 启动路由监听（history.listen） |
| `loadPageComponent` | 函数 | `src/router.tsx` | 动态 import 页面组件，失败回退 error404 |
| `initLang` | 函数 | `src/locale.ts` | 初始化语言（localStorage → getUserLocale → defaultLang） |
| `Queue` | 类 | `src/engines/Queue.ts` | 并发任务队列（默认并发数 1） |
| `ImageBase` | 接口 | `src/engines/ImageBase.ts` | 图片引擎基础类型：CompressOption、ProcessOutput |
| `createCompressTask` | 函数 | `src/engines/transform.ts` | 创建压缩任务并入队 |
| `modules` / `locales` | 映射 | `src/modules.ts` | Vite import.meta.glob 映射 |

## CONVENTIONS

- **TypeScript strict 模式**：`strict: true`、`noUnusedLocals: true`、`noUnusedParameters: true`、`noFallthroughCasesInSwitch: true`
- **路径别名**：`@/` → `src/`（tsconfig paths + vite alias 双配置）
- **Prettier**：双引号、尾随逗号、2 空格缩进、分号、bracketSpacing、bracketSameLine: false
- **ESLint**：`eslint:recommended` + `@typescript-eslint/recommended` + `react-hooks/recommended`；允许 `no-explicit-any` 和 `no-empty`
- **组件模式**：每个组件一个目录，`index.tsx` + `index.module.scss`
- **CSS Modules**：`.module.scss` 后缀
- **格式化范围**：`npm run format` 仅覆盖 `src/**/*`，不含配置文件和测试
- **MobX**：`enforceActions: "never"` — 允许任意位置修改 observable

## ANTI-PATTERNS (本项目)

- **裁剪模式下禁止预览对比**：当 `resize.method` 为 `setCropRatio` 或 `setCropSize` 时，对比预览不可用（见 `cropCompareWarning` 和 `useColumn.tsx` 中的 `message.warning`）
- **MobX enforceActions = "never"**：不依赖 action-only 的状态突变语义；如需严格模式，需改配置并审计状态访问
- **AVIF 仅通过 WASM 编码**：浏览器不支持 canvas → AVIF，切勿通过 canvas 创建 AVIF；WASM 产出的 AVIF blob 直接返回，不进行二次压缩（见 `src/engines/handler.ts` 注释）

## COMMANDS

```bash
npm run dev              # Vite 开发服务器（端口 3000）
npm run build            # tsc 类型检查 + vite build（生产构建）
npm run build:preview    # tsc + vite build --mode preview
npm run preview          # 预览构建产物（端口 3001）
npm run lint             # ESLint（max-warnings 0，CI 级严格）
npm run format           # Prettier 格式化（仅 src/**/*）
npm run test             # Vitest 运行测试
npm run clean            # 清理构建产物
npm run clean:all        # 清理所有（含 WASM）
npm run wasm:build       # 构建 Rust WASM 模块
npm run wasm:integrate   # 集成 WASM 到 public/wasm
npm run wasm:full        # wasm:build + wasm:integrate 一键构建
```

## NOTES

- **无现有 AGENTS.md**：这是首次生成，基于 `b9d753e` 快照
- **非标准路由**：未使用 react-router，自实现 `history` + `import.meta.glob` 动态加载，`gstate.page` 直接存放 ReactNode
- **WASM 构建依赖**：`wasm:full` 需要 Rust 工具链 + `wasm-pack` + `wasm32-unknown-unknown` target；CI 环境已配置（Node 24 + dtolnay/rust-toolchain + wasm-pack-action）
- **Dockerfile 注意**：使用 `--ignore-scripts` 安装且不单独构建 WASM，确保 `public/wasm/` 已存在于构建上下文
- **测试覆盖率**：当前未配置 coverage；建议通过 `vitest --coverage` 添加
- **submit artifacts**：`dist/` 和 `pic-compress-wasm/target/` 为构建产物，已提交入仓库；重新生成通过 `npm run wasm:full && npm run build`
