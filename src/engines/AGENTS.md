# ENGINES — 图片压缩引擎域

## OVERVIEW

图片压缩的核心模块：引擎基类、Worker 调度、并发队列、WASM 集成。所有压缩流程由此域管理。

## STRUCTURE

```
engines/
├── ImageBase.ts        # 核心类型：CompressOption、ProcessOutput、ImageInfo
├── CanvasImage.ts      # Canvas 通用图片引擎（resize、格式转换、JPEG/WebP 压缩）
├── PngImage.ts         # PNG 专用引擎（WASM 量化 + 抖动）
├── AvifImage.ts        # AVIF 专用引擎（WASM 编码）
├── PicCompressWasm.ts  # WASM 模块封装（init + compressPng/compressWebp/compressAvif）
├── WorkerCompress.ts   # Worker 入口：压缩任务（OffscreenCanvas + WASM）
├── WorkerPreview.ts    # Worker 入口：预览任务（生成缩略图）
├── createWorker.ts     # Worker 工厂：动态创建 Web Worker 实例
├── Queue.ts            # 并发任务队列（默认并发 1）
├── transform.ts        # 任务编排：创建压缩任务、处理流程
├── handler.ts          # 处理器选择：根据图片类型和格式选择引擎
└── support.ts          # 功能检测：WASM 支持、Worker 支持
```

## WHERE TO LOOK

| 任务 | 文件 | 说明 |
|------|------|------|
| 理解压缩选项结构 | `ImageBase.ts` | `CompressOption` 接口定义了所有可配置参数 |
| 添加新图片格式支持 | `handler.ts` + 新建 `*Image.ts` | handler 根据格式选择引擎 |
| 修改压缩流程 | `transform.ts` | `createCompressTask()` 是流程入口 |
| 调试 Worker 通信 | `WorkerCompress.ts` `WorkerPreview.ts` `createWorker.ts` | Worker 通过 `new Worker(new URL(...), {type:"module"})` 创建 |
| WASM 集成 | `PicCompressWasm.ts` | 由 `scripts/integrate-wasm.cjs` 生成 |
| 并发控制 | `Queue.ts` | 默认 max=1（串行），可调整 |

## CONVENTIONS

- **引擎继承**：`CanvasImage` 为基类引擎，`PngImage`/`AvifImage` 继承并重写特定方法
- **Worker 模式**：压缩和预览通过 Web Worker 执行，避免阻塞主线程；Worker 文件放在此目录下（非标准，但属同一域）
- **WASM 优先**：PNG 和 AVIF 压缩走 WASM，不通过 Canvas；Canvas 仅用于 JPEG/WebP 和 resize
- **OffscreenCanvas**：Worker 中使用，主线程不可直接访问 Worker 中的 Canvas

## ANTI-PATTERNS

- **不要通过 Canvas 编码 AVIF**：浏览器不支持 `toBlob('image/avif')`，AVIF 必须走 WASM（`AvifImage.ts` → `PicCompressWasm.ts`）。WASM 产出的 AVIF blob 直接返回，禁止二次压缩。
- **不要在 Worker 外使用 OffscreenCanvas**：Worker 文件（`WorkerCompress.ts`、`WorkerPreview.ts`）中使用 OffscreenCanvas，主线程代码不应引用 Canvas 相关 API 处理图片
- **Queue 默认串行**：`Queue(max=1)` 保证顺序执行；增大并发数可能导致内存问题
- **WASM 初始化一次性**：`PicCompressWasm.ts` 中的 `init()` 是全局单次调用，重复初始化会报错
