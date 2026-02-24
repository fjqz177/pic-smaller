//! PNG compression implementation

use image::{ImageBuffer, Rgba};
use imagequant::Attributes;
use png::{BitDepth, ColorType as PngColorType, Compression, Encoder};
use rgb::RGBA;

use crate::error::CompressError;
use crate::error::CompressResult;
use crate::utils::{rgba_to_image_buffer, validate_dimensions};

/// PNG compression options
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PngOptions {
    pub colors: u8,
    #[serde(default)]
    pub dithering: f32,
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

pub fn compress_png(
    data: &[u8],
    width: u32,
    height: u32,
    options: PngOptions,
) -> CompressResult<Vec<u8>> {
    validate_dimensions(width, height)?;
    let image = rgba_to_image_buffer(data, width, height)?;

    let quantized = if options.colors < 255 {
        quantize_image(&image, options.colors, options.dithering)?
    } else {
        image
    };

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

fn quantize_image(
    image: &ImageBuffer<Rgba<u8>, Vec<u8>>,
    colors: u8,
    _dithering: f32,
) -> CompressResult<ImageBuffer<Rgba<u8>, Vec<u8>>> {
    let width = image.width();
    let height = image.height();

    let rgba_data: Vec<RGBA<u8>> = image
        .pixels()
        .map(|p| RGBA::new(p[0], p[1], p[2], p[3]))
        .collect();

    let mut attr = Attributes::new();
    attr.set_quality(0, 100)
        .map_err(|e| CompressError::PngError(format!("Quality error: {}", e)))?;

    attr.set_speed(4)
        .map_err(|e| CompressError::PngError(format!("Speed error: {}", e)))?;

    attr.set_max_colors(colors as u32)
        .map_err(|e| CompressError::PngError(format!("Colors error: {}", e)))?;

    let mut quant_img = attr
        .new_image(rgba_data, width as usize, height as usize, 1.0)
        .map_err(|e| CompressError::PngError(format!("Image error: {}", e)))?;

    let mut result = attr
        .quantize(&mut quant_img)
        .map_err(|e| CompressError::PngError(format!("Quantize error: {}", e)))?;

    // remapped returns (Vec<RGBA<u8>>, Vec<u8>) - first is quantized pixels, second is palette
    let (quantized_rgba, _palette) = result
        .remapped(&mut quant_img)
        .map_err(|e| CompressError::PngError(format!("Remap error: {}", e)))?;

    let mut quantized_bytes = Vec::with_capacity(quantized_rgba.len() * 4);
    for rgba in quantized_rgba {
        quantized_bytes.extend_from_slice(&[rgba.r, rgba.g, rgba.b, rgba.a]);
    }

    let expected_size = (width * height * 4) as usize;
    if quantized_bytes.len() != expected_size {
        return Err(CompressError::PngError(format!(
            "Size mismatch: expected {}, got {}",
            expected_size,
            quantized_bytes.len()
        )));
    }

    ImageBuffer::from_raw(width, height, quantized_bytes)
        .ok_or_else(|| CompressError::PngError("ImageBuffer creation failed".to_string()))
}
