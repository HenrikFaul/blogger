/** Small standards-based ZIP (STORE) writer. No remote service; UTF-8 names and CRC32. */
export type ZipEntry = { path: string; data: Uint8Array | string };
const table = Uint32Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
export function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of data) c = table[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
export function createZip(entries: ZipEntry[]): Uint8Array {
  if (entries.length > 1000) throw new Error("Túl sok exportált fájl.");
  const encoder = new TextEncoder();
  let offset = 0;
  const local: Uint8Array[] = [],
    central: Uint8Array[] = [];
  const names = new Set<string>();
  for (const item of entries) {
    if (
      typeof item.path !== "string" ||
      !item.path ||
      /[:\u0000-\u001f\u007f]/.test(item.path) ||
      item.path.startsWith("/") ||
      item.path.includes("\\") ||
      item.path.split("/").some((v) => !v || v === ".." || v === ".") ||
      names.has(item.path)
    )
      throw new Error("Nem biztonságos vagy ismétlődő ZIP-útvonal.");
    if (offset > 200000000)
      throw new Error("A teljes ZIP legfeljebb 200 MB lehet.");
    names.add(item.path);
    const name = encoder.encode(item.path),
      data =
        typeof item.data === "string" ? encoder.encode(item.data) : item.data;
    if (data.byteLength + offset > 200000000) throw new Error("Túl nagy fájl.");
    if (name.length > 65535) throw new Error("Túl hosszú ZIP-fájlnév.");
    const crc = crc32(data),
      lh = new Uint8Array(30 + name.length),
      lv = new DataView(lh.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x800, true);
    lv.setUint16(12, 0x21, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, name.length, true);
    lh.set(name, 30);
    local.push(lh, data);
    const ch = new Uint8Array(46 + name.length),
      cv = new DataView(ch.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x800, true);
    cv.setUint16(14, 0x21, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    ch.set(name, 46);
    central.push(ch);
    offset += lh.length + data.length;
  }
  const size = central.reduce((n, b) => n + b.length, 0),
    end = new Uint8Array(22),
    ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, size, true);
  ev.setUint32(16, offset, true);
  const out = new Uint8Array(offset + size + 22);
  let cursor = 0;
  for (const chunk of [...local, ...central, end]) {
    out.set(chunk, cursor);
    cursor += chunk.length;
  }
  return out;
}
export function download(
  data: BlobPart,
  name: string,
  type = "application/octet-stream",
) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
