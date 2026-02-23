//! AVIF compression implementation

use ravif::Encoder;
use imgref::Img;
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
            quality: 50,
            speed: 8,
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
    
    // Map speed (1-10, higher is faster)
    let speed = (10 - options.speed).max(0).min(9) as u8;
    
    // Encode to AVIF using ravif Encoder
    let img = Img::new(
        bytemuck::cast_slice::<u8, RGBA<u8>>(image.as_raw().as_slice()),
        width as usize,
        height as usize,
    );
    let result = Encoder::new()
        .with_quality(quality)
        .with_speed(speed)
        .encode_rgba(img)
        .map_err(|e| crate::error::CompressError::AvifError(e.to_string()))?;
    
    Ok(result.avif_file)
}
