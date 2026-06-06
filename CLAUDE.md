# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pic Smaller (图小小) is a **pure frontend, browser-based image compression tool**. React 19 + TypeScript 6 + MobX 6 + Ant Design 6 + Vite 8. Core compression is powered by a Rust WASM module (`pic-compress-wasm`). All compression happens locally — no server-side logic.

## Commands

```bash
npm run dev              # Vite dev server (port 3000, host 0.0.0.0)
npm run build            # tsc type-check + vite build (production, base=/pic-smaller/)
npm run build:preview    # tsc + vite build --mode preview
npm run preview          # Preview production build (port 3001, host 0.0.0.0)
npm run lint             # ESLint flat config, --max-warnings 0 (CI-strict)
npm run typecheck        # tsc --noEmit (type-check only, no emit)
npm run format           # Prettier format src/**/* only
npm run test             # Vitest (tests/ directory, config inline in vite.config.ts)
npm run clean            # Remove dist/ and WASM build artifacts
npm run clean:all        # Remove all build artifacts
npm run wasm:build       # Build Rust WASM (requires wasm-pack + Rust toolchain)
npm run wasm:integrate   # Copy WASM output to public/wasm/
npm run wasm:full        # wasm:build + wasm:integrate
```

## Architecture

### Startup Flow

`src/main.tsx` (mounts on `window.onload`) → `src/App.tsx` (Antd ConfigProvider + `ContextAction` for static methods, renders `gstate.page`) → `src/Initial.tsx` (preloads all resources: JSZip, WASM init, locale bundles, page modules, AVIF support check) → `initRouter()` → route resolution → page render.

### Routing

**Custom router** (NOT react-router). `src/router.tsx` uses the `history` library directly:
- `initRouter()` listens to `history` changes and calls `handleRouteChange()`
- `loadPageComponent()` dynamically imports page components via `import.meta.glob` mappings defined in `src/modules.ts`
- `gstate.page` holds the resolved `React.ReactNode` — the app re-renders by swapping this value
- `gstate.pathname` tracks the current normalized path
- `goto()` is the navigation helper (push/replace with query params)

### State Management (MobX)

Two observable stores, both with `enforceActions: "never"` (mutations allowed anywhere):

- **`gstate`** (`src/global.tsx`): Global state — `pathname`, `page` (ReactNode, `observable.ref`), `lang`, `locale` (translation data), `loading`
- **`homeState`** (`src/states/home.ts`): Page-level state — `list` (Map of uploaded images), `option` (applied compress settings), `tempOption` (in-progress settings from UI), `compareId`, `showOption`

### Compression Engine (`src/engines/`)

The engine follows a **strategy pattern** with Web Workers for off-thread processing:

1. **Image input**: `createImageList()` in `transform.ts` accepts File[], creates `ImageItem` entries in `homeState.list`, then posts each to two Web Workers:
   - `WorkerPreview` — generates small preview thumbnails
   - `WorkerCompress` — runs full compression

2. **Worker factory** (`createWorker.ts`): `createWorkerHandler()` creates the message handler for each worker. On startup, it runs `avifCheck()`, creates a `Queue` (concurrency: 3 for workers), and listens for `MessageEvent<MessageData>`.

3. **Worker message flow**: Both workers call `convert()` in `handler.ts` which processes the image, then `globalThis.postMessage()` sends `OutputMessageData` back. The `message()` callback in `transform.ts` receives results and updates `homeState.list`. Compress timing is tracked via `performance.now()`.

4. **Handler** (`handler.ts`): The `convert()` function running in the worker:
   - Creates an `ImageBitmap` from the blob
   - If format conversion is needed (e.g., PNG → JPEG), draws to an `OffscreenCanvas` and re-encodes (JPEG conversion fills background to handle transparency)
   - Dispatches to `createHandler()` which instantiates the correct `ImageBase` subclass based on MIME type
   - **AVIF exception**: Browsers cannot encode AVIF from canvas, so AVIF encoding goes directly through WASM — the resulting blob skips further compression

5. **ImageBase subclasses** (strategy pattern):
   - `CanvasImage` — handles JPG, JPEG, WebP via `OffscreenCanvas` + `convertToBlob()`
   - `PngImage` — PNG via `PicCompressWasm.compressPng()` (imagequant-based quantization)
   - `AvifImage` — AVIF via `PicCompressWasm.compressAvif()` (ravif-based encoding)

6. **WASM loader** (`PicCompressWasm.ts`): Lazy-initializes the WASM module via `ensureWasmInit()`. Loads `pic_compress_wasm_bg.wasm` using a relative URL (compatible with GitHub Pages `/pic-smaller/` sub-path). Exposes `compressPng()` and `compressAvif()` with typed option interfaces.

7. **Browser support** (`support.ts`): `avifCheck()` tests AVIF encoding support via `OffscreenCanvas.convertToBlob({type: "image/avif"})` and conditionally adds the `"image/avif"` entry to the `Mimes` dictionary.

8. **Queue** (`Queue.ts`): Simple concurrent task queue (default concurrency: 1 in main thread, 3 in workers). Used to serialize compression tasks.

### WASM Subproject (`pic-compress-wasm/`)

Rust crate compiled to WASM via `wasm-pack`. Exposes two JS functions:
- `compress_png_js(data, width, height, options)` — PNG quantization via `imagequant` library
- `compress_avif_js(data, width, height, options)` — AVIF encoding via `ravif`

Built artifacts live in `public/wasm/` (committed to repo). Build requires Rust toolchain + `wasm32-unknown-unknown` target.

### Key Utility Files

- **`src/mimes.ts`**: MIME type dictionary (`jpg`, `jpeg`, `png`, `webp`; AVIF added dynamically by `support.ts`)
- **`src/ContextAction.ts`**: Initializes antd static methods (`message`, `modal`, `notification`) via `App.useApp()`. Rendered in `App.tsx`.
- **`src/media.ts`**: `useResponse()` hook providing `{ isMobile, isPad, isPC }` breakpoints via `react-responsive`
- **`src/functions.ts`**: `normalize()` utility for path normalization
- **`src/type.ts`**: Global TypeScript types (`Dimensions`, `FileInfo`, `LocaleData`)

### Components

Each component lives in its own directory under `src/components/{Name}/` with `index.tsx` + `index.module.scss` (CSS Modules). Key components:
- `ImageInput` — drag-and-drop + file picker upload area
- `CompressOption` — resize method, output format, quality/color sliders
- `Compare` — before/after slider comparison (disabled in crop mode)
- `UploadCard` — per-image card with preview, compress result, and actions
- `ProgressHint` — overall compression progress bar

### Internationalization

`src/locale.ts` determines language: localStorage → browser `getUserLocale()` → fallback `en-US`. Translation files in `src/locales/` (9 languages). `initLang()` populates `gstate.locale`.

### Docker

`Dockerfile` uses `node:20-alpine`, installs with `--ignore-scripts`, builds preview mode, serves on port 3001. WASM artifacts must already exist in `public/wasm/` — they are NOT built in the Docker build.

## Conventions

- **TypeScript 6 strict** (`strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`). `ignoreDeprecations: "6.0"` suppresses TS6's `baseUrl` deprecation warning (still using `baseUrl` + `paths` for `@/` alias).
- **Path alias**: `@/` → `src/` (configured in both tsconfig paths and vite alias)
- **Prettier**: double quotes, trailing commas, 2-space indent, semicolons
- **ESLint 10 flat config** (`eslint.config.mjs`): `@eslint/js` recommended + `typescript-eslint` recommended + `react-hooks` flat recommended + `react-refresh` plugin. `no-explicit-any` and `no-empty` are disabled.
- **MobX**: `enforceActions: "never"` — do NOT rely on action-only mutation semantics
- **CSS Modules**: `.module.scss` suffix, colocated with component
- **Vite dev server**: port 3000, host `0.0.0.0`, COOP/COEP headers required for WASM SharedArrayBuffer
- **Vite preview**: port 3001, host `0.0.0.0`, same COOP/COEP headers
- **Vitest**: config inline in `vite.config.ts` (`test.include: ["tests/**/*.{test,spec}.?(c|m)[jt]s?(x)"]`)

## Anti-Patterns

- **Crop mode disables comparison preview**: When `resize.method` is `setCropRatio` or `setCropSize`, the before/after compare slider is unavailable (see `cropCompareWarning` in `useColumn.tsx`)
- **AVIF only via WASM**: Never attempt canvas → AVIF encoding; it's unsupported by browsers. WASM-produced AVIF blobs are returned directly without re-compression (see `handler.ts` comments)
- **No react-router**: Routing is custom. Do not introduce react-router without a full migration plan

## WASM Build Notes

- **Prerequisites**: Rust toolchain, `wasm-pack`, `wasm32-unknown-unknown` target
- **CI**: GitHub Actions uses `dtolnay/rust-toolchain` + `wasm-pack-action`
- **Docker**: WASM is NOT built in Docker; `public/wasm/` must exist in the build context (committed to repo)
- **Headers**: COOP/COEP headers are set in `vite.config.ts` for SharedArrayBuffer support
- **Vite WASM plugin**: A custom `wasm-copy-plugin` copies `public/wasm/` to `dist/wasm/` on `closeBundle`

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **pic-smaller** (1281 symbols, 2374 relationships, 84 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/pic-smaller/context` | Codebase overview, check index freshness |
| `gitnexus://repo/pic-smaller/clusters` | All functional areas |
| `gitnexus://repo/pic-smaller/processes` | All execution flows |
| `gitnexus://repo/pic-smaller/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `~/.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `~/.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `~/.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `~/.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `~/.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `~/.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
