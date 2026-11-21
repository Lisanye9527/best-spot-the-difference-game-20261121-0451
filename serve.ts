// Tiny static file server for local play-testing: serves this repository's
// game/ directory at http://localhost:8080 with no build step and no
// dependencies beyond the Node standard library.
//
//   node serve.ts

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const gameDir = join(fileURLToPath(new URL('.', import.meta.url)), 'game');
const PORT = 8080;

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const relative = normalize(decodeURIComponent(url.pathname)).replace(/^[/\\]+/, '');
  const filePath = join(gameDir, relative === '' ? 'index.html' : relative);
  if (!filePath.startsWith(gameDir)) {
    response.writeHead(403).end('forbidden');
    return;
  }
  try {
    const body = await readFile(filePath);
    response.writeHead(200, { 'content-type': CONTENT_TYPES[extname(filePath)] ?? 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404).end('not found');
  }
});

server.listen(PORT, () => {
  console.log(`The Reading Room is served at http://localhost:${PORT}`);
});
