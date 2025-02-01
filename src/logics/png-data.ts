export class PngData {
  public pngData: Uint8Array;

  public fileHeader: Uint8Array | null = null;

  public IHDR: PngIHDR | null = null;

  public ancillaryChunks: PngChunk[] = [];

  public IDATs: PngChunk[] = [];

  public IEND: PngChunk | null = null;

  constructor(public _pngData: ArrayBuffer) {

    this.pngData = new Uint8Array(_pngData);

    // Parse File Header
    const fileHeader = this.pngData.slice(0, 8);
    this.fileHeader = fileHeader;

    // Parse IHDR
    const IHDR = this.pngData.slice(8);
    this.IHDR = new PngIHDR(IHDR);

    // Parse following chunks
    let offset = 8 + this.IHDR.length + 12;
    while (offset < this.pngData.length) {
      const chunk = new PngChunk(this.pngData.slice(offset));
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
}

export class PngChunk {
  public type: string;
  public data: Uint8Array;
  public length: number;
  public crc: number;

  constructor(chunk: Uint8Array) {
    this.length = chunk[0] << 24 | chunk[1] << 16 | chunk[2] << 8 | chunk[3];
    this.type = new TextDecoder().decode(chunk.slice(4, 8).buffer);
    this.data = chunk.slice(8, 8 + this.length);
    this.crc = chunk[8 + this.length] << 24 | chunk[8 + this.length + 1] << 16 | chunk[8 + this.length + 2] << 8 | chunk[8 + this.length + 3];
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

  constructor(chunk: Uint8Array) { 
    super(chunk);
    this.width = this.data[0] << 24 | this.data[1] << 16 | this.data[2] << 8 | this.data[3];
    this.height = this.data[4] << 24 | this.data[5] << 16 | this.data[6] << 8 | this.data[7];
    this.bitDepth = this.data[8];
    this.colorType = this.data[9];
    this.compressionMethod = this.data[10];
    this.filterMethod = this.data[11];
    this.interlaceMethod = this.data[12];
  }
}