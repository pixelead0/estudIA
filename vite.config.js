import { defineConfig } from 'vite';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

/** Sirve `1/`, `assets/` y `subjects.json` en dev/preview (como en dist tras el build). */
function serveContentRoots() {
  const root = process.cwd();

  function contentType(rel) {
    if (rel.endsWith('.json')) return 'application/json; charset=utf-8';
    if (rel.endsWith('.md')) return 'text/plain; charset=utf-8';
    if (rel.endsWith('.css')) return 'text/css; charset=utf-8';
    if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(rel)) {
      const ext = rel.split('.').pop().toLowerCase();
      return `image/${ext === 'svg' ? 'svg+xml' : ext}`;
    }
    return 'application/octet-stream';
  }

  function middleware(req, res, next) {
    const raw = (req.url || '').split('?')[0];
    const rel = decodeURIComponent(raw.replace(/^\//, ''));
    const allowed =
      rel.startsWith('1/') || rel.startsWith('assets/') || rel === 'subjects.json';
    if (!allowed) {
      next();
      return;
    }
    const file = resolve(join(root, rel));
    if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
      next();
      return;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType(rel));
    createReadStream(file).pipe(res);
  }

  return {
    name: 'estudia-serve-content',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [serveContentRoots()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
