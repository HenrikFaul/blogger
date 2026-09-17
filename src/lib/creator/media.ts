import { slugify } from "../safety.js";
import type { ImageAsset } from "./model.js";
const DB = "forgeblog-media-v1",
  STORE = "assets";
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export function sniffImage(
  b: Uint8Array,
): { mime: string; extension: string } | null {
  if (b[0] === 255 && b[1] === 216 && b[2] === 255)
    return { mime: "image/jpeg", extension: "jpg" };
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => b[i] === v))
    return { mime: "image/png", extension: "png" };
  const text = new TextDecoder("ascii").decode(b.slice(0, 12));
  if (text.startsWith("GIF87a") || text.startsWith("GIF89a"))
    return { mime: "image/gif", extension: "gif" };
  if (text.slice(0, 4) === "RIFF" && text.slice(8, 12) === "WEBP")
    return { mime: "image/webp", extension: "webp" };
  return null;
}
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore(STORE, { keyPath: "id" });
    request.onerror = () =>
      reject(
        new Error(
          "A médiatár nem elérhető. Engedélyezd a böngésző helyi tárhelyét.",
        ),
      );
    request.onsuccess = () => resolve(request.result);
    request.onblocked = () =>
      reject(new Error("Egy másik böngészőfül blokkolja a médiatárat."));
  });
}
async function request<T>(
  mode: IDBTransactionMode,
  run: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = run(tx.objectStore(STORE));
    let result: T;
    req.onsuccess = () => {
      result = req.result;
    };
    tx.oncomplete = () => {
      db.close();
      resolve(result);
    };
    tx.onerror = () => {
      db.close();
      reject(
        new Error(
          "A média mentése nem sikerült. Lehet, hogy betelt a tárhely.",
        ),
      );
    };
    tx.onabort = () => {
      db.close();
      reject(new Error("A médiaművelet megszakadt."));
    };
  });
}
export type StoredAsset = { id: string; meta: ImageAsset; blob: Blob };
export async function listStoredAssets(): Promise<StoredAsset[]> {
  return request("readonly", (s) => s.getAll());
}
export async function getStoredAsset(
  id: string,
): Promise<StoredAsset | undefined> {
  return request("readonly", (s) => s.get(id));
}
export async function putStoredAsset(item: StoredAsset): Promise<void> {
  await request("readwrite", (s) => s.put(item));
}
export async function removeStoredAsset(id: string): Promise<void> {
  await request("readwrite", (s) => s.delete(id));
}
export async function importImage(
  file: File,
): Promise<{ asset: ImageAsset; duplicate: boolean }> {
  if (!file.size || file.size > MAX_IMAGE_BYTES)
    throw new Error(
      `${file.name}: a kép mérete 1 bájt és 10 MB közötti lehet.`,
    );
  const bytes = new Uint8Array(await file.arrayBuffer());
  const format = sniffImage(bytes);
  if (!format)
    throw new Error(
      `${file.name}: csak valódi JPEG, PNG, WebP vagy GIF fogadható el. SVG és HTML nem tölthető fel.`,
    );
  const hash = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const id = "upload-" + hash;
  const existing = await getStoredAsset(id);
  if (existing) return { asset: existing.meta, duplicate: true };
  const blob = new Blob([bytes], { type: format.mime });
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    throw new Error(`${file.name}: a böngésző nem tudja dekódolni a képet.`);
  }
  const { width, height } = bitmap;
  bitmap.close();
  if (width * height > 40000000 || width > 16000 || height > 16000)
    throw new Error(
      `${file.name}: a kép túl nagy felbontású (legfeljebb 40 megapixel és 16 000 pixel oldalhossz).`,
    );
  const stem = slugify(file.name.replace(/\.[^.]+$/, "")).slice(0, 50) || "kep";
  const meta: ImageAsset = {
    id,
    name: file.name,
    src: `/media/uploads/${hash.slice(0, 16)}-${stem}.${format.extension}`,
    alt: "",
    decorative: false,
    caption: "",
    credit: "",
    width,
    height,
    size: file.size,
    type: format.mime,
    hash,
  };
  await putStoredAsset({ id, meta, blob });
  return { asset: meta, duplicate: false };
}
export async function updateAsset(meta: ImageAsset): Promise<void> {
  const stored = await getStoredAsset(meta.id);
  if (!stored) throw new Error("A kép nem található a helyi médiatárban.");
  await putStoredAsset({ ...stored, meta });
}
export async function blobBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let s = "";
  for (let i = 0; i < bytes.length; i += 32768)
    s += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return btoa(s);
}
