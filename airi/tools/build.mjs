#!/usr/bin/env node
/* Build the Airi games into the site:
     static/airi/index.html     catalog of games (raim.dev/airi/)   — public/airi/ in an Astro site
     static/airi/<game>/        one installable offline app per game (raim.dev/airi/<game>/):
                                index.html · manifest.webmanifest · sw.js · js/ css/ fonts/ img/ icons/
   No dependencies — plain Node 18+.
   Usage (from the site root):  node airi/tools/build.mjs            → writes static/airi (Hugo) or public/airi
                                node airi/tools/build.mjs --out DIR  → writes DIR instead */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); // blog/airi
const SRC = path.join(ROOT, 'src');
const outArg = process.argv.indexOf('--out');
// Hugo site → static/airi (copied to the site root as /airi); Astro site → public/airi
const SITE = path.resolve(ROOT, '..');
const isHugo = ['hugo.toml', 'hugo.yaml', 'config.toml'].some((f) => fs.existsSync(path.join(SITE, f)));
const OUT = outArg > 0 ? path.resolve(process.argv[outArg + 1]) : path.join(SITE, isHugo ? 'static' : 'public', 'airi');
const SHARED = ['css', 'js', 'fonts'];
const SCRIPTS = ['js/build-info.js', 'js/core.js', 'js/strokes.js', 'js/activities.js', 'js/parent.js', 'game.js'];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const walk = (dir, base = dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith('.') || e.name.startsWith('_')) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p, base) : [path.relative(base, p).split(path.sep).join('/')];
  });

if (!OUT.endsWith(path.sep + 'airi')) throw new Error('refusing to replace a folder not named airi: ' + OUT);
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const games = fs.readdirSync(path.join(SRC, 'games'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_')).map((d) => d.name);
const metas = games.map((dir) => ({ dir, ...JSON.parse(fs.readFileSync(path.join(SRC, 'games', dir, 'meta.json'), 'utf8')) }))
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.id.localeCompare(b.id));
const built = [];

for (const meta of metas) {
  const gsrc = path.join(SRC, 'games', meta.dir);
  const out = path.join(OUT, meta.id);
  fs.mkdirSync(out, { recursive: true });
  for (const s of SHARED) fs.cpSync(path.join(SRC, 'shared', s), path.join(out, s), { recursive: true });
  for (const f of fs.readdirSync(gsrc)) {
    if (f === 'meta.json' || f.startsWith('.') || f.startsWith('_')) continue;
    fs.cpSync(path.join(gsrc, f), path.join(out, f), { recursive: true });
  }

  fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
  <title>${esc(meta.name)}</title>
  <meta name="description" content="${esc(meta.description)}">
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="${esc(meta.background_color)}">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="${esc(meta.short_name)}">
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="icon" href="icons/icon-192.png">
  <link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
  <link rel="preload" href="fonts/andika-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="fonts/playwrite-es.woff" as="font" type="font/woff" crossorigin>
  <link rel="stylesheet" href="css/app.css">
</head>
<body>
  <div id="app"></div>
${SCRIPTS.map((s) => `  <script src="${s}"></script>`).join('\n')}
  <script>
    var fontsReady = document.fonts && document.fonts.load
      ? Promise.all(['40px Ligada', '40px Andika', 'bold 40px Andika'].map(function (f) { return document.fonts.load(f).catch(function () {}); }))
      : Promise.resolve();
    Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 2000); })]).then(function () { AG.start(); });
  </script>
</body>
</html>
`);

  fs.writeFileSync(path.join(out, 'manifest.webmanifest'), JSON.stringify({
    id: './',
    name: meta.name,
    short_name: meta.short_name,
    description: meta.description,
    start_url: './',
    scope: './',
    display: 'standalone',
    orientation: 'any',
    background_color: meta.background_color,
    theme_color: meta.background_color,
    lang: 'es',
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }, null, 2));

  // offline file list + version. The page itself is cached as "./" (Cloudflare Pages redirects …/index.html to …/).
  const files = walk(out).filter((f) => f !== 'sw.js' && f !== 'js/build-info.js' && f !== 'index.html').sort();
  const hash = crypto.createHash('sha256');
  for (const f of ['index.html', ...files]) hash.update(f).update(fs.readFileSync(path.join(out, f)));
  const digest = hash.digest('hex').slice(0, 10);
  const cache = `airi-${meta.id}-${digest}`;
  const assets = ['./', ...files, 'js/build-info.js'];
  const version = new Date().toISOString().slice(0, 10) + ' ' + digest.slice(0, 6);
  fs.writeFileSync(path.join(out, 'js', 'build-info.js'),
    `/* Generated by airi/tools/build.mjs */\nwindow.AG_BUILD = ${JSON.stringify({ game: meta.id, version, cache, count: assets.length })};\n`);
  fs.writeFileSync(path.join(out, 'sw.js'), `/* Generated by airi/tools/build.mjs — do not edit. Cache-first: works offline after the first visit. */
const CACHE = '${cache}';
const PREFIX = 'airi-${meta.id}-';
const ASSETS = ${JSON.stringify(assets, null, 1)};

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // the app is a single page: any navigation inside the scope gets the cached page
    e.respondWith(caches.open(CACHE).then((c) => c.match('./')).then((r) => r || fetch(req)));
    return;
  }
  e.respondWith(
    caches.open(CACHE).then((c) => c.match(req, { ignoreSearch: true })).then((r) => r || fetch(req).then((res) => {
      if (res.ok && !res.redirected) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }))
  );
});
`);
  built.push({ ...meta, files: assets.length, cache });
  console.log(`airi/${meta.id}: ${assets.length} files, cache ${cache}`);
}

/* ---- catalog: raim.dev/airi/ ---- */
const f0 = built[0].id;
fs.writeFileSync(path.join(OUT, 'index.html'), `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Airi · Juegos</title>
  <meta name="description" content="Juegos para aprender: letras y números.">
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="#FFF8EF">
  <link rel="icon" href="${f0}/icons/icon-192.png">
  <style>
    @font-face { font-family: 'Andika'; src: url(${f0}/fonts/andika-700.woff2) format('woff2'); font-weight: 700; unicode-range: U+0000-00FF, U+2000-206F; }
    @font-face { font-family: 'Andika'; src: url(${f0}/fonts/andika-700-cyr.woff2) format('woff2'); font-weight: 700; unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1; }
    @font-face { font-family: 'Andika'; src: url(${f0}/fonts/andika-700-cyrext.woff2) format('woff2'); font-weight: 700; unicode-range: U+0460-052F; }
    @font-face { font-family: 'Andika'; src: url(${f0}/fonts/andika-400.woff2) format('woff2'); font-weight: 400; unicode-range: U+0000-00FF, U+2000-206F; }
    @font-face { font-family: 'Andika'; src: url(${f0}/fonts/andika-400-cyr.woff2) format('woff2'); font-weight: 400; unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1; }
    @font-face { font-family: 'Andika'; src: url(${f0}/fonts/andika-400-cyrext.woff2) format('woff2'); font-weight: 400; unicode-range: U+0460-052F; }
    :root { --bg: #FFF8EF; --ink: #1F2433; --muted: #6B6F7B; --kk: #FFF4D6; --kk-line: #F2B705; --kk-ink: #4A3B00; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: var(--bg); color: var(--ink); font-family: 'Andika', system-ui, sans-serif;
           padding: max(24px, env(safe-area-inset-top)) 16px 32px; }
    h1 { text-align: center; font-size: clamp(32px, 6vw, 56px); margin: 2vh 0 4vh; }
    .games { display: flex; flex-wrap: wrap; gap: 28px; justify-content: center; }
    .game { width: min(300px, 42vw); min-width: 220px; aspect-ratio: 1; border-radius: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center;
            gap: 14px; color: #fff; text-decoration: none; box-shadow: 0 8px 0 rgba(0,0,0,.12), 0 14px 30px rgba(0,0,0,.12); padding: 16px; text-align: center; }
    .game:active { transform: translateY(4px); box-shadow: 0 4px 0 rgba(0,0,0,.12); }
    .game img { width: 46%; aspect-ratio: 1; border-radius: 26%; box-shadow: 0 4px 12px rgba(0,0,0,.15); }
    .game b { font-size: clamp(26px, 4vw, 38px); }
    .game span { font-size: 16px; opacity: .92; line-height: 1.3; }
    .kk { max-width: 760px; margin: 5vh auto 0; background: var(--kk); border-left: 6px solid var(--kk-line); border-radius: 16px; padding: 12px 18px; color: var(--kk-ink); font-size: 17px; line-height: 1.5; }
    .kk b.badge { background: var(--kk-line); color: #fff; border-radius: 6px; padding: 1px 7px; font-size: 13px; margin-right: 6px; }
    .kk ol { margin: 6px 0 0; padding-left: 22px; }
    .credit { max-width: 760px; margin: 18px auto 0; color: var(--muted); font-size: 13px; text-align: center; }
  </style>
</head>
<body>
  <h1>¡Hola! ¿A qué jugamos?</h1>
  <main class="games">
${built.map((g) => `    <a class="game" href="${g.id}/" style="background: linear-gradient(150deg, ${g.theme_color}cc, ${g.theme_color})">
      <img src="${g.id}/icons/icon-192.png" alt="">
      <b>${esc(g.short_name)}</b>
      <span>${esc(g.description)}</span>
    </a>`).join('\n')}
  </main>
  <section class="kk">
    <div><b class="badge">ҚАЗ</b><b>iPad-қа орнату</b> — әр ойын бөлек қолданба болып орнатылады:</div>
    <ol>
      <li>Safari-де ойынды ашыңыз (жоғарыдағы батырма).</li>
      <li>«Бөлісу» → «На экран Домой» / «Add to Home Screen» → «Добавить».</li>
      <li>Үй экранындағы белгішені интернетпен бір рет ашыңыз — кейін интернетсіз жұмыс істейді.</li>
    </ol>
    <div>Басқа ойын үшін осы бетке оралып, дәл солай қайталаңыз.</div>
  </section>
  <p class="credit">Pictogramas: Sergio Palao · ARASAAC (arasaac.org) · CC BY-NC-SA · Gobierno de Aragón.</p>
</body>
</html>
`);
console.log('catalog: ' + path.relative(process.cwd(), path.join(OUT, 'index.html')));
