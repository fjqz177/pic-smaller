//! Error types for image compression
//!
//! Performance notes:
//! - Minimal overhead error types
//! - Efficient From implementations for error conversion

use thiserror::Error;
use wasm_bindgen::JsValue;

/// Result type alias for compression operations
pub type CompressResult<T> = Result<T, CompressError>;

/// Error types that can occur during compression
#[derive(Error, Debug)]
pub enum CompressError {
    #[error("Invalid image dimensions: {0}x{1}")]
    InvalidDimensions(u32, u32),

    #[error("Invalid image data size: expected {expected}, got {actual}")]
    InvalidDataSize { expected: usize, actual: usize },

    #[error("PNG compression failed: {0}")]
    PngError(String),

    #[error("WebP compression failed: {0}")]
    WebpError(String),

    #[error("AVIF compression failed: {0}")]
    AvifError(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
}

/// Convert CompressError to JsValue for WASM boundary
impl From<CompressError> for JsValue {
    fn from(err: CompressError) -> Self {
        JsValue::from_str(&err.to_string())
    }
}
