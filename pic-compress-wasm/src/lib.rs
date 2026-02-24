//! Pic Compress WASM - High-performance image compression library
//!
//! # Performance Features
//! - Optimized memory allocation patterns
//! - Professional-grade PNG quantization (imagequant)
//! - Fast AVIF encoding (ravif)
//! - Inline hints for hot paths
//! - LTO and aggressive compiler optimizations

use js_sys::Uint8Array;
use wasm_bindgen::prelude::*;

// Export modules
mod avif;
mod error;
mod png;
mod utils;

pub use avif::{compress_avif, AvifOptions};
pub use error::{CompressError, CompressResult};
pub use png::{compress_png, PngOptions};

/// Initialize the WASM module and set up panic hook
#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}

/// Initialize WASM module (explicit initialization)
#[wasm_bindgen]
pub async fn init() -> Result<(), JsValue> {
    Ok(())
}

/// Compress PNG image from JavaScript
///
/// # Performance notes:
/// - Single memory allocation for input/output
/// - Uses professional imagequant library for quantization
/// - Optimized for minimal GC pressure
#[wasm_bindgen]
pub async fn compress_png_js(
    data: Uint8Array,
    width: u32,
    height: u32,
    options: &JsValue,
) -> Result<Uint8Array, JsValue> {
    let options: PngOptions = if options.is_undefined() || options.is_null() {
        PngOptions::default()
    } else {
        serde_wasm_bindgen::from_value(options.clone())
            .map_err(|e| JsValue::from_str(&format!("Invalid PNG options: {}", e)))?
    };

    // Convert Uint8Array to Vec - this is necessary as WASM owns the memory
    let rgba_data = data.to_vec();
    let result = compress_png(&rgba_data, width, height, options)?;

    // Return compressed data as Uint8Array
    Ok(Uint8Array::from(result.as_slice()))
}

/// Compress AVIF image from JavaScript
///
/// # Performance notes:
/// - Single memory allocation for input/output
/// - Uses ravif encoder with optimized settings
/// - Zero-copy conversion with bytemuck
#[wasm_bindgen]
pub async fn compress_avif_js(
    data: Uint8Array,
    width: u32,
    height: u32,
    options: &JsValue,
) -> Result<Uint8Array, JsValue> {
    let options: AvifOptions = if options.is_undefined() || options.is_null() {
        AvifOptions::default()
    } else {
        serde_wasm_bindgen::from_value(options.clone())
            .map_err(|e| JsValue::from_str(&format!("Invalid AVIF options: {}", e)))?
    };

    // Convert Uint8Array to Vec - this is necessary as WASM owns the memory
    let rgba_data = data.to_vec();
    let result = compress_avif(&rgba_data, width, height, options)?;

    // Return compressed data as Uint8Array
    Ok(Uint8Array::from(result.as_slice()))
}
