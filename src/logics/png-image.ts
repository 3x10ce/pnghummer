
import { crc32 } from "./crc32";
import { PngData, PngChunk } from "./png-data";

export class PngImageGlitcher {
  public pngData: PngData;
  public imageData: Uint8Array;
  protected constructor(pngData: PngData, imageData: Uint8Array) {
    this.pngData = pngData;
    this.imageData = imageData;
  }

  public static async from(pngData: PngData) {
    // zlib decompress image data
    const ds = new DecompressionStream("deflate");
    const dataBlob = new Blob(pngData.IDATs.map((chunk) => chunk.data));
    const dsStream = dataBlob.stream().pipeThrough(ds);

    // read decompressed data
    const decompressedData: Uint8Array[] = [];
    for await (const chunk of dsStream) {
      console.log(chunk);
      decompressedData.push(chunk);
    }
    const imageData = new Uint8Array(await new Blob(decompressedData).arrayBuffer());
    console.log(`Decompress data size: ${dataBlob.size} => ${imageData.length}`);
    return new PngImageGlitcher(pngData, imageData);
  }

  public async getImage() {
    // zlib compress image data
    const us = new CompressionStream("deflate");
    const dataBlob = new Blob([this.imageData]);
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
      // packing data to IDAT per 8KB
      const length = Math.min(8192, mergedImageData.length - offset);
      const data = mergedImageData.slice(offset, offset + length);

      // create IDAT
      const IDAT = new PngChunk("IDAT", data);
      IDATs.push(IDAT);
      offset += length;
    }
    
    // update IDATs
    this.pngData.IDATs = IDATs;

    return this.pngData;
  }
}

