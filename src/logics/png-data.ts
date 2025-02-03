import { crc32 } from "./crc32";

export class PngData {
  public fileHeader: Uint8Array;

  public IHDR: PngIHDR;

  public ancillaryChunks: PngChunk[] = [];

  public IDATs: PngChunk[] = [];

  public IEND: PngChunk | null = null;

  constructor(public _pngData: ArrayBuffer) {

    const pngData = new Uint8Array(_pngData);

    // Parse File Header
    const fileHeader = pngData.slice(0, 8);
    this.fileHeader = fileHeader;

    // Parse IHDR
    const IHDR = pngData.slice(8);
    this.IHDR = PngIHDR.fromBinary(IHDR);

    // Parse following chunks
    let offset = 8 + this.IHDR.length + 12;
    while (offset < pngData.length) {
      const chunk = PngChunk.fromBinary(pngData.slice(offset));
      const length = chunk.length + 12;
      
      if (chunk.type === "IEND") {
        this.IEND = chunk;
        break;
      }
      if (chunk.type === "IDAT") {
        this.IDATs.push(chunk);
      } else {
        this.ancillaryChunks.push(chunk);
      }
      offset += length;
    }
  }

  public toBlob() {
    const blobParts = [
      this.fileHeader,
      this.IHDR.toBinary(),
      ...this.ancillaryChunks.map((chunk) => chunk.toBinary()),
      ...this.IDATs.map((chunk) => chunk.toBinary()),
    ]
    if (this.IEND) {
      blobParts.push(this.IEND.toBinary());
    }
    return new Blob(blobParts, { type: "image/png" });
  }
}

export class PngChunk {
  public type: string;
  public data: Uint8Array;
  public length: number;
  public crc: number;

  constructor(type: string, data: Uint8Array, length: number | undefined = undefined, crc: number | undefined = undefined) {
    this.type = type;
    this.data = data;
    this.length = length || data.length;
    this.crc = crc || crc32(this.toBinary().slice(4));
  }

  public static fromBinary(chunk: Uint8Array) {
    const length = chunk[0] << 24 | chunk[1] << 16 | chunk[2] << 8 | chunk[3];
    const type = new TextDecoder().decode(chunk.slice(4, 8).buffer);
    const data = chunk.slice(8, 8 + length);
    const crc = chunk[8 + length] << 24 | chunk[8 + length + 1] << 16 | chunk[8 + length + 2] << 8 | chunk[8 + length + 3];

    // check CRC
    const crcCheck = crc32(chunk.slice(4, 8 + length));
    if (crcCheck !== crc) {
      console.warn(`CRC check failed: ${crcCheck} !== ${crc}`);
    }
    
    return new PngChunk(type, data, length, crc);
  }

  /**
   * Returns a binary representation of the chunk.
   */
  toBinary(): Uint8Array {
    const binary = new Uint8Array(8 + this.length + 4);
    binary[0] = this.length >> 24 & 0xFF;
    binary[1] = this.length >> 16 & 0xFF;
    binary[2] = this.length >> 8 & 0xFF;
    binary[3] = this.length & 0xFF;
    binary.set(new TextEncoder().encode(this.type), 4);
    binary.set(this.data, 8);
    binary[8 + this.length] = this.crc >> 24 & 0xFF;
    binary[8 + this.length + 1] = this.crc >> 16 & 0xFF;
    binary[8 + this.length + 2] = this.crc >> 8 & 0xFF;
    binary[8 + this.length + 3] = this.crc & 0xFF;
    return binary;
  }
}

export class PngIHDR extends PngChunk{
  public width: number;
  public height: number;
  public bitDepth: number;
  public colorType: number;
  public compressionMethod: number;
  public filterMethod: number;
  public interlaceMethod: number;

  constructor(type: string, data: Uint8Array, length: number | undefined, crc: number | undefined) {
    super(type, data, length, crc);

    this.width = this.data[0] << 24 | this.data[1] << 16 | this.data[2] << 8 | this.data[3];
    this.height = this.data[4] << 24 | this.data[5] << 16 | this.data[6] << 8 | this.data[7];
    this.bitDepth = this.data[8];
    this.colorType = this.data[9];
    this.compressionMethod = this.data[10];
    this.filterMethod = this.data[11];
    this.interlaceMethod = this.data[12];

  }

  public static fromBinary(chunk: Uint8Array) {
    const sc = super.fromBinary(chunk);
    return new PngIHDR(sc.type, sc.data, sc.length, sc.crc);
  }
}