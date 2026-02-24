//! AVIF compression implementation
//!
//! Performance optimizations:
//! - Optimized speed/quality mapping
//! - Minimal allocations in encoding path

use imgref::Img;
use ravif::Encoder;
use rgb::RGBA;

use crate::error::CompressResult;
use crate::utils::{rgba_to_image_buffer, validate_dimensions};

/// AVIF compression options
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AvifOptions {
    /// Quality (1-100), lower is more compressed
    pub quality: u8,
    /// Encoding speed (1-10), higher is faster but larger file
    pub speed: u8,
}

impl Default for AvifOptions {
    fn default() -> Self {
        Self {
            quality: 60,
            speed: 10,
        }
    }
}

/// Compress AVIF image
///
/// # Arguments
/// * `data` - RGBA image data
/// * `width` - Image width
/// * `height` - Image height
/// * `options` - AVIF compression options
///
/// # Returns
/// Compressed AVIF data as Vec<u8>
///
/// # Performance notes:
/// - Uses ravif encoder with optimized speed/quality settings
/// - Speed mapping: user 1-10 -> ravif 0-9 (higher is faster)
/// - Zero-copy conversion using bytemuck for efficient memory usage
#[inline]
pub fn compress_avif(
    data: &[u8],
    width: u32,
    height: u32,
    options: AvifOptions,
) -> CompressResult<Vec<u8>> {
    validate_dimensions(width, height)?;
    let image = rgba_to_image_buffer(data, width, height)?;

    // Map quality to ravif's expected range (0-100, higher is better)
    let quality = options.quality as f32;

    // Map speed (1-10, higher is faster) to ravif speed (0-9, higher is faster)
    // Use more aggressive mapping for better performance:
    // User speed 1-3 -> ravif 0-2 (slow, best quality)
    // User speed 4-7 -> ravif 3-6 (medium)
    // User speed 8-10 -> ravif 7-9 (fast, good for web)
    let ravif_speed = match options.speed {
        1 => 0,
        2 => 1,
        3 => 2,
        4 => 3,
        5 => 4,
        6 => 5,
        7 => 6,
        8 => 7,
        9 => 8,
        10 => 9,
        _ => 9, // Default to fastest
    };

    // Encode to AVIF using ravif Encoder with optimized settings
    // Using bytemuck for zero-copy conversion from u8 to RGBA
    let img = Img::new(
        bytemuck::cast_slice::<u8, RGBA<u8>>(image.as_raw().as_slice()),
        width as usize,
        height as usize,
    );

    // Create encoder with quality and speed settings
    // The encoding is the performance-critical operation
    let result = Encoder::new()
        .with_quality(quality)
        .with_speed(ravif_speed)
        .encode_rgba(img)
        .map_err(|e: ravif::Error| crate::error::CompressError::AvifError(e.to_string()))?;

    Ok(result.avif_file)
}
