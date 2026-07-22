import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
};

// Simple server-side include: replaces <!--#include virtual="partials/x.html" -->
// with that file's contents (one level deep — includes aren't recursive).
// Lets nav/footer markup live in one file and stay in sync across pages.
const INCLUDE_RE = /<!--#include virtual="([^"]+)"\s*-->/g;

function resolveIncludes(html) {
  return html.replace(INCLUDE_RE, (match, includePath) => {
    const includeFile = path.join(__dirname, includePath);
    try {
      return fs.readFileSync(includeFile, 'utf8');
    } catch {
      return `<!-- include failed: ${includePath} not found -->`;
    }
  });
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
    if (ext === '.html') {
      res.end(resolveIncludes(data.toString('utf8')));
    } else {
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
