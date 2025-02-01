export class PngData {
  public pngData: Uint8Array;

  public IHDR: Uint8Array | null = null;

  public IDATs: Uint8Array[] = [];

  public IEND: Uint8Array | null = null;

  constructor(public _pngData: ArrayBuffer) {
    this.pngData = new Uint8Array(_pngData);

    // Parse IHDR
    const IHDR = this.pngData.slice(0, 13);
    this.IHDR = new Uint8Array(IHDR);

    // Parse IDATs
    let offset = 13;
    while (offset < this.pngData.length) {
      const length = this.pngData[offset + 4] << 24 | this.pngData[offset + 5] << 16 | this.pngData[offset + 6] << 8 | this.pngData[offset + 7];
      const IDAT = this.pngData.slice(offset + 8, offset + 8 + length);
      this.IDATs.push(new Uint8Array(IDAT));
      offset += 8 + length;
    } 

    // Parse IEND
    const IEND = this.pngData.slice(offset);
    this.IEND = new Uint8Array(IEND); 
  }
}