/* tslint:disable */
/* eslint-disable */

/**
 * Compress AVIF image from JavaScript
 *
 * # Performance notes:
 * - Single memory allocation for input/output
 * - Uses ravif encoder with optimized settings
 * - Zero-copy conversion with bytemuck
 */
export function compress_avif_js(data: Uint8Array, width: number, height: number, options: any): Promise<Uint8Array>;

/**
 * Compress PNG image from JavaScript
 *
 * # Performance notes:
 * - Single memory allocation for input/output
 * - Uses professional imagequant library for quantization
 * - Optimized for minimal GC pressure
 */
export function compress_png_js(data: Uint8Array, width: number, height: number, options: any): Promise<Uint8Array>;

/**
 * Initialize WASM module (explicit initialization)
 */
export function init(): Promise<void>;

/**
 * Initialize the WASM module and set up panic hook
 */
export function main(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly compress_avif_js: (a: number, b: number, c: number, d: number) => number;
    readonly compress_png_js: (a: number, b: number, c: number, d: number) => number;
    readonly init: () => number;
    readonly main: () => void;
    readonly __wasm_bindgen_func_elem_132: (a: number, b: number) => void;
    readonly __wasm_bindgen_func_elem_133: (a: number, b: number, c: number, d: number) => void;
    readonly __wasm_bindgen_func_elem_1121: (a: number, b: number, c: number, d: number) => void;
    readonly __wbindgen_export: (a: number, b: number) => number;
    readonly __wbindgen_export2: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_export3: (a: number) => void;
    readonly __wbindgen_export4: (a: number, b: number, c: number) => void;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
