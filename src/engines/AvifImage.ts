import { Mimes } from "@/mimes";
import { ImageBase, ProcessOutput } from "./ImageBase";
import { compressAvif } from "./PicCompressWasm";

export class AvifImage extends ImageBase {
  /**
   * Encode AVIF image
   */
  static async encode(
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
    quality: number = 50,
    speed: number = 8,
  ): Promise<Blob> {
    const imageData = context.getImageData(0, 0, width, height).data;
    const output = await compressAvif(
      new Uint8Array(imageData),
      width,
      height,
      { quality, speed },
    );
    return new Blob([output], { type: Mimes.avif });
  }

  async compress(): Promise<ProcessOutput> {
    const { width, height, x, y } = this.getOutputDimension();

    try {
      const { context } = await this.createCanvas(width, height, x, y);
      const imageData = context.getImageData(0, 0, width, height).data;

      // 使用新的 Rust WASM 模块进行 AVIF 压缩
      const output = await compressAvif(
        new Uint8Array(imageData),
        width,
        height,
        {
          quality: this.option.avif.quality,
          speed: this.option.avif.speed,
        },
      );

      const blob = new Blob([output], { type: Mimes.avif });
      return {
        width,
        height,
        blob,
        src: URL.createObjectURL(blob),
      };
    } catch (error) {
      console.error("[AvifImage] Compression failed:", error);
      return this.failResult();
    }
  }
}
