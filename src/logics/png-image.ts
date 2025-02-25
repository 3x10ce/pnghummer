
import { crc32 } from "./crc32";
import { PngData, PngChunk } from "./png-data";

const pixelByte = (colorType: number) => {
  switch (colorType) {
    case 0:
      return 1;
    case 2:
      return 3;
    case 3:
      return 1;
    case 4:
      return 2;
    case 6:
      return 4;
    default:
      return 0;
  }
}

export class PngImage {
  public pngData: PngData;
  public imageData: PngImageScanline[];
  protected constructor(pngData: PngData, imageData: Uint8Array) {
    this.pngData = pngData;
    this.imageData = [];
    
    // convert imageData to scanlines
    let offset = 0;
    const byteOfPixel = pixelByte(this.pngData.IHDR.colorType)
    if (byteOfPixel === 0) throw new Error("Invalid color type");
    const scanlineLnength = this.pngData.IHDR.width * pixelByte(this.pngData.IHDR.colorType) + 1;
    while (offset < imageData.length) {
      const scanline = imageData.slice(offset, offset + scanlineLnength);
      this.imageData.push(new PngImageScanline(scanline));
      offset += scanlineLnength;
    }
  }

  public static async from(pngData: PngData) {
    // zlib decompress image data
    const ds = new DecompressionStream("deflate");
    const dataBlob = new Blob(pngData.IDATs.map((chunk) => chunk.data));
    const dsStream = dataBlob.stream().pipeThrough(ds);

    // read decompressed data
    const decompressedData: Uint8Array[] = [];
    for await (const chunk of dsStream) {
      decompressedData.push(chunk);
    }
    const imageData = new Uint8Array(await new Blob(decompressedData).arrayBuffer());
    console.log(`Decompress data size: ${dataBlob.size} => ${imageData.length}`);
    return new PngImage(pngData, imageData);
  }

  public async getPngData() {
    // zlib compress image data
    const us = new CompressionStream("deflate");
    const dataBlob = new Blob(this.imageData.map((scanline) => scanline.toBinary()));
    const usStream = dataBlob.stream().pipeThrough(us);

    // read compressed data
    const compressedData: Uint8Array[] = [];
    for await (const chunk of usStream) {
      compressedData.push(chunk);
    }

    // merge image data
    const mergedImageData = new Uint8Array(compressedData.reduce((a, b) => a + b.length, 0));
    console.log(`Compress data size: ${dataBlob.size} => ${mergedImageData.length}`);

    let offset = 0;
    for (const chunk of compressedData) {
      mergedImageData.set(chunk, offset);
      offset += chunk.length;
    }

    // create IDATs
    const IDATs: PngChunk[] = [];
    offset = 0;
  
    while (offset < mergedImageData.length) {
      // packing data to IDAT 
      const length = Math.min(8 * 1024, mergedImageData.length - offset);
      const data = mergedImageData.slice(offset, offset + length);

      // create IDAT
      const IDAT = new PngChunk("IDAT", data);
      IDATs.push(IDAT);
      offset += length;
    }
    console.log(IDATs);
    // update IDATs
    this.pngData.IDATs = IDATs;
    console.log(this.pngData);
    return this.pngData;
  }

  public getRawPixel(x: number, y: number) {
    const scanline = this.imageData[y];
    const pixel = scanline.data[x * this.pngData.IHDR.bitDepth / 8 | 0];
    return pixel;
  }

  
  public setRawPixel(x: number, y: number, pixel: number | number[]) {
    const scanline = this.imageData[y];
    switch(this.pngData.IHDR.colorType) {
      case 0:
        // Grayscale
        scanline.data[x] = pixel as number;
        break;
      case 2:
        // RGB
        scanline.data[x * 3 + 0] = (pixel as number[])[0];
        scanline.data[x * 3 + 1] = (pixel as number[])[1];
        scanline.data[x * 3 + 2] = (pixel as number[])[2];
        break;
      case 3:
        // Palette
        scanline.data[x] = pixel as number;
        break;
      case 4:
        // Grayscale with alpha
        scanline.data[x * 4 + 0] = (pixel as number[])[0];
        scanline.data[x * 4 + 1] = (pixel as number[])[1];
        scanline.data[x * 4 + 2] = (pixel as number[])[2];
        scanline.data[x * 4 + 3] = (pixel as number[])[3];
        break;
      case 6:
        // RGB with alpha
        scanline.data[x * 4 + 0] = (pixel as number[])[0];
        scanline.data[x * 4 + 1] = (pixel as number[])[1];
        scanline.data[x * 4 + 2] = (pixel as number[])[2];
        scanline.data[x * 4 + 3] = (pixel as number[])[3];
        break;
    }
  }
}

export enum PngImageFilterType {
  None = 0,
  Sub = 1,
  Up = 2,
  Average = 3,
  Paeth = 4
}

export class PngImageScanline {
  public filterType: PngImageFilterType;
  public data: Uint8Array;
  constructor(scanline: Uint8Array) {
    this.filterType = scanline[0];
    this.data = scanline.slice(1);
  }

  public toBinary(): Uint8Array {
    return new Uint8Array([this.filterType, ...this.data]);
  }
}