#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = __dirname;

/**
 * Minimal mime lookup for our known asset types.
 */
function getMimeTypeByExtension(ext) {
  const e = ext.toLowerCase();
  switch (e) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    case '.mp4': return 'video/mp4';
    case '.glb': return 'model/gltf-binary';
    case '.obj': return 'model/obj';
    case '.mtl': return 'text/plain';
    case '.md': return 'text/markdown';
    default: return 'application/octet-stream';
  }
}

function shouldIncludeFile(fileName) {
  // Exclude generated files and scripts
  const excluded = new Set(['assets.json', 'build-manifest.mjs']);
  if (excluded.has(fileName)) return false;
  return true;
}

async function buildManifest() {
  const dirents = await fs.readdir(ROOT, { withFileTypes: true });
  const assets = [];

  for (const d of dirents) {
    if (!d.isFile()) continue;
    if (!shouldIncludeFile(d.name)) continue;
    const filePath = path.join(ROOT, d.name);
    const stat = await fs.stat(filePath);
    const ext = path.extname(d.name);
    const mimeType = getMimeTypeByExtension(ext);
    assets.push({
      name: d.name,
      extension: ext || '',
      mimeType,
      sizeBytes: stat.size,
      modifiedMs: stat.mtimeMs
    });
  }

  // Sort by name for determinism
  assets.sort((a, b) => a.name.localeCompare(b.name));

  const manifest = { generatedAtMs: Date.now(), assets };
  const outPath = path.join(ROOT, 'assets.json');
  await fs.writeFile(outPath, JSON.stringify(manifest, null, 2));
  return outPath;
}

buildManifest()
  .then((out) => {
    console.log(`Wrote manifest to ${out}`);
  })
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });


