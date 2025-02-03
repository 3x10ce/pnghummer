

// CRC hash calculate table
const crcTable = [...Array(256)].map((_,n)=>
  [...Array(8)].reduce((c,_) =>
    (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1 , n));

console.log(crcTable.map((n) => n.toString(16)));

/**
 * Updates CRC-32 value with given data.
 *
 * @param crc - Initial CRC-32 value.
 * @param data - Data to update CRC-32 value.
 * @returns Updated CRC-32 value.
 */
const updateCrc = (crc: number, data: Uint8Array) => {
  return data.reduce((p, c) => {
    const idx = (p ^ c) & 0xff
    return crcTable[idx] ^ (p >>> 8)
  }, crc);

}


/**
 * Computes the CRC-32 checksum for a given data array.
 *
 * @param data - The input data for which the CRC-32 checksum is calculated.
 * @returns The computed CRC-32 checksum as a number.
 */
export function crc32(data: Uint8Array): number {
  return ~updateCrc(-1, data);
}

// const printUint32 = (v: number) => `0x${Array.from(Array(8).keys()).map(i => (v >>> (4 * (7 - i))) % 16).map(v => v.toString(16)).join('')}`

// console.log(printUint32(crc32(new Uint8Array([0x49, 0x45, 0x4E, 0x44]))))
