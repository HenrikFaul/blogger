import { mkdirSync, writeFileSync } from 'node:fs';

const dir = 'C:/Work/project4 blogspot/public/media/stock';
mkdirSync(dir, { recursive: true });

// A curated, high-resolution set from Picsum (serves Unsplash photos, free to use).
const ids = [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 14, 15, 16, 18, 20, 21, 24, 25, 26, 27, 28, 29];
const W = 3840, H = 2160;

const out = [];
for (const id of ids) {
  const url = `https://picsum.photos/id/${id}/${W}/${H}`;
  try {
    const r = await fetch(url, { redirect: 'follow' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    const file = `${dir}/stock-${id}.jpg`;
    writeFileSync(file, buf);
    out.push(`OK id=${id} ${buf.length} bytes -> stock-${id}.jpg`);
  } catch (e) {
    out.push(`FAIL id=${id}: ${e.message}`);
  }
}
writeFileSync('C:/Work/_stock_download.txt', out.join('\n'));
