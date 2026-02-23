//! Utility functions for image compression

use image::{ImageBuffer, Rgba};

/// Convert RGBA data to ImageBuffer
pub fn rgba_to_image_buffer(
    data: &[u8],
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

    Ok(
        ImageBuffer::from_raw(width, height, data.to_vec()).ok_or_else(|| {
            crate::CompressError::InvalidDataSize {
                expected: expected_size,
                actual: data.len(),
            }
        })?,
    )
}

/// Validate image dimensions
pub fn validate_dimensions(width: u32, height: u32) -> Result<(), crate::CompressError> {
    if width == 0 || height == 0 {
        return Err(crate::CompressError::InvalidDimensions(width, height));
    }

    if width > 65536 || height > 65536 {
        return Err(crate::CompressError::InvalidDimensions(width, height));
    }

    Ok(())
}
