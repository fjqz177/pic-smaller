//! Utility functions for image compression
//!
//! Performance optimizations:
//! - Inline hints for hot paths
//! - Minimal allocations in critical paths

use image::{ImageBuffer, Rgba};

/// Convert owned RGBA bytes to ImageBuffer without extra copy
///
/// # Performance notes:
/// - Reuses caller-owned buffer to avoid duplicate allocation/copy
/// - Validates size before constructing ImageBuffer
#[inline]
pub fn rgba_vec_to_image_buffer(
    data: Vec<u8>,
    width: u32,
    height: u32,
) -> Result<ImageBuffer<Rgba<u8>, Vec<u8>>, crate::CompressError> {
    let expected_size = (width * height * 4) as usize;
    if data.len() != expected_size {
        return Err(crate::CompressError::InvalidDataSize {
            expected: expected_size,
            actual: data.len(),
        });
    }

    ImageBuffer::from_raw(width, height, data).ok_or_else(|| {
        crate::CompressError::InvalidDataSize {
            expected: expected_size,
            actual: expected_size,
        }
    })
}

/// Validate image dimensions
///
/// # Performance notes:
/// - Marked #[inline] for hot path optimization
/// - Simple checks compile to efficient code
#[inline(always)]
pub fn validate_dimensions(width: u32, height: u32) -> Result<(), crate::CompressError> {
    if width == 0 || height == 0 {
        return Err(crate::CompressError::InvalidDimensions(width, height));
    }

    if width > 65536 || height > 65536 {
        return Err(crate::CompressError::InvalidDimensions(width, height));
    }

    Ok(())
}
