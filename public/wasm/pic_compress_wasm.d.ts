/* tslint:disable */
/* eslint-disable */

/**
 * Compress AVIF image from JavaScript
 */
export function compress_avif_js(data: Uint8Array, width: number, height: number, options: any): Promise<Uint8Array>;

/**
 * Compress PNG image from JavaScript
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
    readonly compress_avif_js: (a: any, b: number, c: number, d: any) => any;
    readonly compress_png_js: (a: any, b: number, c: number, d: any) => any;
    readonly init: () => any;
    readonly main: () => void;
    readonly wasm_bindgen__closure__destroy__heb87ec39d131b05e: (a: number, b: number) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h823a4507fd0e7976: (a: number, b: number, c: any) => [number, number];
    readonly wasm_bindgen__convert__closures_____invoke__h1e227618e4722773: (a: number, b: number, c: any, d: any) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
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
