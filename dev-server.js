import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const BUILD_SCRIPT = path.join(__dirname, 'build.js');
const PORT = 8080;

// Helper: Run build script
function runBuild() {
  console.log('⚡️ Compiling static markdown & assets...');
  const res = spawnSync(process.execPath, [BUILD_SCRIPT], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}` },
  });
  if (res.status !== 0) {
    console.error('❌ Build failed with exit code', res.status);
  }
}

// 1. Ensure dist/ exists on startup
if (!fs.existsSync(DIST_DIR) || !fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
  console.log('📦 dist/ directory not found. Running initial build...');
  runBuild();
}

// 2. Watch content and src for live re-build
let buildTimeout = null;
function triggerRebuild(event, filename) {
  if (buildTimeout) clearTimeout(buildTimeout);
  buildTimeout = setTimeout(() => {
    console.log(`\n🔄 Change detected in ${filename || 'files'}. Rebuilding...`);
    runBuild();
  }, 100);
}

const contentDir = path.join(__dirname, 'content');
const srcDir = path.join(__dirname, 'src');

if (fs.existsSync(contentDir)) {
  fs.watch(contentDir, { recursive: true }, triggerRebuild);
}
if (fs.existsSync(srcDir)) {
  fs.watch(srcDir, { recursive: true }, triggerRebuild);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  let filePath = path.join(DIST_DIR, reqPath);

  // If path doesn't have an extension, try appending .html
  if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
    filePath += '.html';
  }

  // Fallback: If still not found, try building once more
  if (!fs.existsSync(filePath)) {
    runBuild();
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 Not Found</h1><p><a href="/">Return Home</a></p>');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`\n🥦 brokoli.blog local preview server running at:`);
  console.log(`   ➜ http://localhost:${PORT}/\n`);
  console.log(`👀 Watching content/posts and src/ for changes with auto-rebuild...`);
});
