#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'optimized');

const sources = [
  'front_graphic.png',
  'back_graphic.png',
  'front.png',
  'back.png'
];

const widths = [3840, 2560, 1920, 1280, 1024, 768, 640];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function fileExists(p) {
  try { await fs.stat(p); return true; } catch { return false; }
}

async function optimizeOne(srcFile) {
  const inputPath = path.join(ROOT, srcFile);
  const exists = await fileExists(inputPath);
  if (!exists) {
    console.warn(`[skip] Missing ${srcFile}`);
    return [];
  }

  const base = path.parse(srcFile).name;
  const outputs = [];

  const image = sharp(inputPath, { failOn: 'none', unlimited: true });
  const meta = await image.metadata();
  const maxWidth = meta.width || Math.max(...widths);

  for (const w of widths) {
    if (w > maxWidth) continue;
    // AVIF
    {
      const outPath = path.join(OUT_DIR, `${base}-w${w}.avif`);
      await image
        .resize({ width: w, withoutEnlargement: true, fit: 'inside' })
        .avif({ quality: 55, effort: 4 })
        .toFile(outPath);
      outputs.push(outPath);
    }
    // WEBP
    {
      const outPath = path.join(OUT_DIR, `${base}-w${w}.webp`);
      await image
        .resize({ width: w, withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: 82, effort: 4 })
        .toFile(outPath);
      outputs.push(outPath);
    }
  }

  // Fallback compressed JPG at 1920
  {
    const w = Math.min(1920, maxWidth);
    const outPath = path.join(OUT_DIR, `${base}-w${w}.jpg`);
    await image
      .resize({ width: w, withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(outPath);
    outputs.push(outPath);
  }

  // Tiny blur preview (LQIP)
  {
    const outPath = path.join(OUT_DIR, `${base}-blur-24.webp`);
    await image
      .resize({ width: 24, withoutEnlargement: true })
      .webp({ quality: 50 })
      .toFile(outPath);
    outputs.push(outPath);
  }

  return outputs;
}

async function main() {
  await ensureDir(OUT_DIR);
  const all = [];
  for (const s of sources) {
    const outs = await optimizeOne(s);
    all.push(...outs);
  }
  console.log(`Optimized ${all.length} files into ${OUT_DIR}`);
}

main().catch(err => { console.error(err); process.exit(1); });


