#!/usr/bin/env node
import http from 'node:http';
import { promises as fs, createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = __dirname;
const PORT = process.env.PORT ? Number(process.env.PORT) : 5173;

function getMime(ext) {
  switch (ext.toLowerCase()) {
    case '.html': return 'text/html; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.js': return 'text/javascript; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.webp': return 'image/webp';
    case '.avif': return 'image/avif';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    case '.mp4': return 'video/mp4';
    case '.glb': return 'model/gltf-binary';
    case '.obj': return 'text/plain; charset=utf-8';
    case '.mtl': return 'text/plain; charset=utf-8';
    case '.md': return 'text/markdown; charset=utf-8';
    default: return 'application/octet-stream';
  }
}

function safeJoin(root, requestedPath) {
  const resolved = path.normalize(path.join(root, requestedPath));
  if (!resolved.startsWith(root)) return null; // directory traversal guard
  return resolved;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';
    const filePath = safeJoin(ROOT, pathname);
    if (!filePath) {
      res.writeHead(400).end('Bad request');
      return;
    }
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    const ext = path.extname(filePath);
    const mime = getMime(ext);

    // Basic Range support for videos/large binaries
    const range = req.headers.range;
    if (range && (mime.startsWith('video/') || mime === 'model/gltf-binary' || mime === 'application/octet-stream')) {
      const match = /bytes=(\d*)-(\d*)/.exec(range);
      const start = match && match[1] ? Number(match[1]) : 0;
      const end = match && match[2] ? Number(match[2]) : stat.size - 1;
      const chunkSize = end - start + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': mime,
        'Last-Modified': stat.mtime.toUTCString()
      });
      createReadStream(filePath, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, {
      'Content-Type': mime,
      'Content-Length': stat.size,
      'Last-Modified': stat.mtime.toUTCString(),
      'Cache-Control': 'no-cache'
    });
    createReadStream(filePath).pipe(res);
  } catch (err) {
    res.writeHead(404).end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Static server running at http://localhost:${PORT}/`);
});


