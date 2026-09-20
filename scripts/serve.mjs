// Tiny static server for previewing dist/ locally: `npm run dev`
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.env.PORT) || 4173;
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.pdf': 'application/pdf' };

createServer(async (req, res) => {
  let p = path.join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(DIST)) { res.writeHead(403).end(); return; }
  try { if ((await stat(p)).isDirectory()) p = path.join(p, 'index.html'); await stat(p); }
  catch { res.writeHead(404, { 'content-type': 'text/html' }).end(await readFile(path.join(DIST, '404.html'))); return; }
  res.writeHead(200, { 'content-type': types[path.extname(p)] ?? 'application/octet-stream' }).end(await readFile(p));
}).listen(port, () => console.log(`Preview: http://localhost:${port}`));
