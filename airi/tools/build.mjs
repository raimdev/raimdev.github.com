#!/usr/bin/env node
/* Build the Airi games into the site:
     static/airi/index.html     catalog of games (raim.dev/airi/)   — public/airi/ in an Astro site
     static/airi/<game>/        one installable offline app per game (raim.dev/airi/<game>/):
                                index.html · manifest.webmanifest · sw.js · js/ css/ fonts/ img/ icons/
   No dependencies — plain Node 18+.
   Usage (from the site root):  node airi/tools/build.mjs            → writes static/airi (Hugo) or public/airi
                                node airi/tools/build.mjs --out DIR  → writes DIR instead
                                node airi/tools/build.mjs --base airi-tocaboca
                                  → a second copy at raim.dev/airi-tocaboca/ (preview of a branch). It has its own
                                    offline caches and its own saved progress, so it never touches the apps at /airi/. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); // blog/airi
const SRC = path.join(ROOT, 'src');
const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const BASE = arg('--base') || 'airi'; // folder name on the site, prefix of caches and saved progress
if (!/^airi(-[a-z0-9]+)*$/.test(BASE)) throw new Error('--base must look like airi or airi-something');
// Hugo site → static/airi (copied to the site root as /airi); Astro site → public/airi
const SITE = path.resolve(ROOT, '..');
const isHugo = ['hugo.toml', 'hugo.yaml', 'config.toml'].some((f) => fs.existsSync(path.join(SITE, f)));
const OUT = arg('--out') ? path.resolve(arg('--out')) : path.join(SITE, isHugo ? 'static' : 'public', BASE);
const SHARED = ['css', 'js', 'fonts'];
const SCRIPTS = ['js/build-info.js', 'js/core.js', 'js/art.js', 'js/strokes.js', 'js/activities.js', 'js/room.js', 'js/parent.js', 'game.js'];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const walk = (dir, base = dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith('.') || e.name.startsWith('_')) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p, base) : [path.relative(base, p).split(path.sep).join('/')];
  });

if (!/^airi(-[a-z0-9]+)*$/.test(path.basename(OUT))) throw new Error('refusing to replace a folder not named airi…: ' + OUT);
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
  <link rel="preload" href="fonts/fredoka.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="css/app.css">
</head>
<body>
  <div id="app"></div>
${SCRIPTS.map((s) => `  <script src="${s}"></script>`).join('\n')}
  <script>
    var fontsReady = document.fonts && document.fonts.load
      ? Promise.all(['40px Ligada', '40px Andika', 'bold 40px Andika', '600 40px Fredoka'].map(function (f) { return document.fonts.load(f).catch(function () {}); }))
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
  const cache = `${BASE}-${meta.id}-${digest}`;
  const assets = ['./', ...files, 'js/build-info.js'];
  const version = new Date().toISOString().slice(0, 10) + ' ' + digest.slice(0, 6);
  fs.writeFileSync(path.join(out, 'js', 'build-info.js'),
    `/* Generated by airi/tools/build.mjs */\nwindow.AG_BUILD = ${JSON.stringify({ game: meta.id, version, cache, count: assets.length, store: BASE + '-' })};\n`);
  fs.writeFileSync(path.join(out, 'sw.js'), `/* Generated by airi/tools/build.mjs — do not edit. Cache-first: works offline after the first visit. */
const CACHE = '${cache}';
const PREFIX = '${BASE}-${meta.id}-';
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
  console.log(`${BASE}/${meta.id}: ${assets.length} files, cache ${cache}`);
}

/* ---- catalog: raim.dev/airi/ ---- */
const f0 = built[0].id;
const preview = BASE !== 'airi';
fs.writeFileSync(path.join(OUT, 'index.html'), `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Airi · Juegos</title>
  <meta name="description" content="Juegos para aprender: letras, números e inglés.">
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="#FFF1E2">
  <link rel="icon" href="${f0}/icons/icon-192.png">
  <style>
    @font-face { font-family: 'Fredoka'; src: url(${f0}/fonts/fredoka.woff2) format('woff2'); font-weight: 500 700; unicode-range: U+0000-00FF, U+2000-206F; }
    @font-face { font-family: 'Andika'; src: url(${f0}/fonts/andika-400.woff2) format('woff2'); font-weight: 400; unicode-range: U+0000-00FF, U+2000-206F; }
    @font-face { font-family: 'Andika'; src: url(${f0}/fonts/andika-400-cyr.woff2) format('woff2'); font-weight: 400; unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1; }
    @font-face { font-family: 'Andika'; src: url(${f0}/fonts/andika-400-cyrext.woff2) format('woff2'); font-weight: 400; unicode-range: U+0460-052F; }
    @font-face { font-family: 'Andika'; src: url(${f0}/fonts/andika-700.woff2) format('woff2'); font-weight: 700; unicode-range: U+0000-00FF, U+2000-206F; }
    @font-face { font-family: 'Andika'; src: url(${f0}/fonts/andika-700-cyr.woff2) format('woff2'); font-weight: 700; unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1; }
    @font-face { font-family: 'Andika'; src: url(${f0}/fonts/andika-700-cyrext.woff2) format('woff2'); font-weight: 700; unicode-range: U+0460-052F; }
    :root { --bg: #FFF1E2; --ink: #2B2350; --muted: #7A7394; --kk: #FFF4D6; --kk-line: #F2B705; --kk-ink: #4A3B00; --b1: #FFC247; --b2: #F4A21C; --b3: #FFE6A8; }
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html { background: var(--bg); }
    body { margin: 0; min-height: 100vh; color: var(--ink); font-family: 'Andika', system-ui, sans-serif; overflow-x: hidden; position: relative;
           padding: max(20px, env(safe-area-inset-top)) 16px 32px; }
    body::before, body::after { content: ''; position: fixed; border-radius: 50%; z-index: -1; }
    body::before { width: 70vmax; height: 70vmax; left: -28vmax; bottom: -40vmax; background: #FFE3CC; }
    body::after { width: 50vmax; height: 50vmax; right: -22vmax; top: -26vmax; background: #FFE9F1; }
    header { display: flex; align-items: center; justify-content: center; gap: 18px; margin: 2vh 0 4vh; }
    .bubble { position: relative; background: #fff; border-radius: 30px; padding: 16px 28px; box-shadow: 0 6px 0 rgba(43,35,80,.17);
              font-family: 'Fredoka', 'Andika', sans-serif; font-weight: 600; font-size: clamp(28px, 5vw, 48px); }
    .bubble::before { content: ''; position: absolute; left: -14px; top: 50%; margin-top: -12px; border: 12px solid transparent; border-right: 16px solid #fff; border-left: 0; }
    .tag { display: block; font-size: 17px; font-weight: 500; color: #fff; background: #FF5C8A; border-radius: 12px; padding: 2px 12px; width: fit-content; margin-top: 6px; }
    .games { display: flex; flex-wrap: wrap; gap: 30px; justify-content: center; }
    .game { width: min(300px, 42vw); min-width: 220px; aspect-ratio: 1; border-radius: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center;
            gap: 12px; color: #fff; text-decoration: none; box-shadow: 0 9px 0 rgba(0,0,0,.2); padding: 16px; text-align: center; transition: transform .09s, box-shadow .09s; }
    .game:nth-child(odd) { rotate: -1.5deg; } .game:nth-child(even) { rotate: 1.5deg; }
    .game:active { transform: translateY(6px) scale(.98); box-shadow: 0 3px 0 rgba(0,0,0,.2); }
    .game img { width: 48%; aspect-ratio: 1; border-radius: 26%; box-shadow: 0 6px 0 rgba(0,0,0,.15); }
    .game b { font-family: 'Fredoka', 'Andika', sans-serif; font-weight: 600; font-size: clamp(28px, 4vw, 40px); }
    .game span { font-size: 16px; opacity: .95; line-height: 1.3; }
    .kk { max-width: 760px; margin: 5vh auto 0; background: var(--kk); border-left: 6px solid var(--kk-line); border-radius: 18px; padding: 12px 18px; color: var(--kk-ink); font-size: 17px; line-height: 1.5; }
    .kk b.badge { background: var(--kk-line); color: #fff; border-radius: 6px; padding: 1px 7px; font-size: 13px; margin-right: 6px; }
    .kk ol { margin: 6px 0 0; padding-left: 22px; }
    .kk a { color: inherit; }
    .credit { max-width: 760px; margin: 18px auto 0; color: var(--muted); font-size: 13px; text-align: center; }
    .buddy { width: 120px; height: 132px; flex: none; }
    .buddy svg { width: 100%; height: 100%; display: block; overflow: visible; }
    .buddy .f { display: none; } .buddy .f-happy { display: inline; }
    .buddy .b-arm-l, .buddy .b-arm-r { transform-box: fill-box; }
    .buddy .b-arm-l { transform-origin: 80% 20%; animation: wave 2.6s ease-in-out infinite; }
    @keyframes wave { 0%, 60%, 100% { transform: rotate(0); } 70%, 90% { transform: rotate(120deg); } 80% { transform: rotate(150deg); } }
    @media (max-width: 600px) { .buddy { width: 80px; height: 88px; } }
    @media (prefers-reduced-motion: reduce) { .buddy .b-arm-l { animation: none; } }
  </style>
</head>
<body>
  <header><span class="buddy" id="buddy"></span><div class="bubble">¡Hola! ¿A qué jugamos?${preview ? '<span class="tag">nueva versión · prueba</span>' : ''}</div></header>
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
${preview ? `    <div style="margin-top:8px"><b>Бұл — жаңа нұсқаның сынағы.</b> Прогресс пен бөлме мұнда бөлек сақталады. Қазіргі нұсқа: <a href="../airi/">raim.dev/airi</a></div>\n` : ''}  </section>
  <p class="credit">Pictogramas: Sergio Palao · ARASAAC (arasaac.org) · CC BY-NC-SA · Gobierno de Aragón.</p>
  <script src="${f0}/js/core.js"></script>
  <script src="${f0}/js/art.js"></script>
  <script>document.getElementById('buddy').innerHTML = AG.buddy('happy').innerHTML;</script>
</body>
</html>
`);
console.log('catalog: ' + path.relative(process.cwd(), path.join(OUT, 'index.html')));
