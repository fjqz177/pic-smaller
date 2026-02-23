//! PNG compression implementation

use image::{ImageBuffer, Rgba};
use png::{BitDepth, ColorType as PngColorType, Compression, Encoder};

use crate::error::CompressResult;
use crate::utils::{rgba_to_image_buffer, validate_dimensions};

/// PNG compression options
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PngOptions {
    /// Number of colors (2-256), for palette reduction
    pub colors: u8,
    /// Dithering strength (0.0-1.0)
    #[serde(default)]
    pub dithering: f32,
    /// Compression level (0-9)
    #[serde(default = "default_compression_level")]
    pub compression_level: u8,
}

fn default_compression_level() -> u8 {
    6
}

impl Default for PngOptions {
    fn default() -> Self {
        Self {
            colors: 255,
            dithering: 0.0,
            compression_level: 6,
        }
    }
}

/// Compress PNG image
///
/// # Arguments
/// * `data` - RGBA image data
/// * `width` - Image width
/// * `height` - Image height
/// * `options` - PNG compression options
///
/// # Returns
/// Compressed PNG data as Vec<u8>
pub fn compress_png(
    data: &[u8],
    width: u32,
    height: u32,
    options: PngOptions,
) -> CompressResult<Vec<u8>> {
    validate_dimensions(width, height)?;
    let image = rgba_to_image_buffer(data, width, height)?;

    // Apply color quantization if needed
    let quantized = if options.colors < 255 {
        quantize_image(&image, options.colors, options.dithering)
    } else {
        image
    };

    // Encode to PNG
    let mut png_data = Vec::new();
    {
        let mut encoder = Encoder::new(&mut png_data, width, height);

        encoder.set_color(PngColorType::Rgba);
        encoder.set_depth(BitDepth::Eight);
        encoder.set_compression(Compression::Default);
        encoder.set_filter(png::FilterType::Sub);

        let mut writer = encoder
            .write_header()
            .map_err(|e| crate::error::CompressError::PngError(e.to_string()))?;

        writer
            .write_image_data(quantized.as_raw())
            .map_err(|e| crate::error::CompressError::PngError(e.to_string()))?;
    }

    Ok(png_data)
}

/// Quantize image to reduced color palette
fn quantize_image(
    image: &ImageBuffer<Rgba<u8>, Vec<u8>>,
    colors: u8,
    _dithering: f32,
) -> ImageBuffer<Rgba<u8>, Vec<u8>> {
    // Simple color quantization using k-means or median cut could be implemented here
    // For now, we'll use a simple approach
    // In production, consider using the `imagequant` crate

    let mut quantized = ImageBuffer::new(image.width(), image.height());

    let color_step = (256 / colors as u32).max(1) as u8;

    for (x, y, pixel) in image.enumerate_pixels() {
        let r = pixel[0] / color_step * color_step;
        let g = pixel[1] / color_step * color_step;
        let b = pixel[2] / color_step * color_step;
        let a = pixel[3];

        quantized.put_pixel(x, y, Rgba([r, g, b, a]));
    }

    quantized
}
