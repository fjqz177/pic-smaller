# COMPONENTS — UI 组件域

## OVERVIEW

Pic Smaller 的 UI 组件库：每个组件一个目录（`index.tsx` + `index.module.scss`），CSS Modules 样式隔离。

## STRUCTURE

```
components/
├── Compare/          # 图片对比预览（拖拽滑块查看压缩前后差异）
├── CompressOption/   # 压缩选项面板（格式、质量、尺寸等配置）
├── ImageInput/       # 图片输入入口（拖拽/粘贴/点击上传）
├── Indicator/        # 进度指示器（压缩进度条）
├── Loading/          # 加载动画（全屏/局部加载状态）
├── Logo/             # 应用 Logo
├── OptionItem/       # 单个选项组件（标签 + 控件，被 CompressOption 复用）
├── ProgressHint/     # 进度提示（压缩中的文字提示）
└── UploadCard/       # 上传卡片（展示已上传图片的缩略图与信息）
```

## WHERE TO LOOK

| 任务 | 文件 | 说明 |
|------|------|------|
| 修改对比预览行为 | `Compare/index.tsx` | 拖拽滑块、裁剪模式下禁用对比 |
| 添加新压缩选项 | `CompressOption/` + `OptionItem/` | OptionItem 是 CompressOption 的子组件 |
| 修改上传方式 | `ImageInput/index.tsx` | 支持拖拽、粘贴（clipboard）、点击选择 |
| 修改压缩进度展示 | `Indicator/` + `ProgressHint/` | 进度条 + 文字提示组合 |
| 修改图片卡片样式 | `UploadCard/index.tsx` | 缩略图、文件名、尺寸、操作按钮 |

## CONVENTIONS

- **组件模式**：`{ComponentName}/index.tsx` + `index.module.scss`，每个组件一个默认导出
- **CSS Modules**：`.module.scss` 后缀，类名通过 `styles.xxx` 引用
- **无全局样式**：组件样式完全隔离，不依赖全局 CSS
- **Ant Design 组件**：大量使用 antd 的 `Slider`、`Select`、`InputNumber`、`Button` 等基础组件

## ANTI-PATTERNS

- **裁剪模式下禁止对比**：`Compare` 组件在 `resize.method` 为 `setCropRatio` 或 `setCropSize` 时不可用，会触发 `message.warning`
- **不要绕过 CSS Modules**：组件样式必须通过 `.module.scss` 管理，不要写内联样式或全局选择器
