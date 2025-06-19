import { crc32 } from "../crc32";

test("crc32 of IEND", () => {
  const value = crc32(new Uint8Array([0x49, 0x45, 0x4e, 0x44])) >>> 0;
  expect(value).toBe(0xae426082);
});
