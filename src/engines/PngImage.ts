import { ImageBase, ProcessOutput } from "./ImageBase";
import { compressPng } from "./PicCompressWasm";

export class PngImage extends ImageBase {
  async compress(): Promise<ProcessOutput> {
    const { width, height, x, y } = this.getOutputDimension();
    const { context } = await this.createCanvas(width, height, x, y);
    const imageData = context.getImageData(0, 0, width, height).data;

    try {
      // 使用新的 Rust WASM 模块进行 PNG 压缩
      const output = await compressPng(
        new Uint8Array(imageData),
        width,
        height,
        {
          colors: this.option.png.colors,
          dithering: this.option.png.dithering,
          compression_level: 6,
        }
      );

      const blob = new Blob([output], { type: this.info.blob.type });
      return {
        width,
        height,
        blob,
        src: URL.createObjectURL(blob),
      };
    } catch (error) {
      console.error("[PngImage] Compression failed:", error);
      return this.failResult();
    }
  }
}
