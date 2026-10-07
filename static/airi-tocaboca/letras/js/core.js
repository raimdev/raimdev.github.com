/* Airi Games — core framework (no dependencies, no build step needed to run).
   One game (book) per app:  AG.game({...}) in game.js, activity types in activities.js.
   Screens: lesson map → lesson (activities) → activity (tasks, with ↺ reset and → next) → result. */
(function () {
  'use strict';
  const AG = (window.AG = window.AG || {});
  AG.test = /[?&]test\b/.test(location.search);
  AG.standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;

  /* ---------------- DOM helpers ---------------- */
  function h(sel, ...args) {
    const [tag, ...cls] = sel.split('.');
    const e = document.createElement(tag || 'div');
    if (cls.length) e.className = cls.join(' ');
    const a = args[0];
    if (a && typeof a === 'object' && !a.nodeType && !Array.isArray(a)) {
      args.shift();
      for (const k in a) {
        const v = a[k];
        if (v == null || v === false) continue;
        if (k === 'style' && typeof v === 'object') {
          for (const s in v) s.startsWith('--') ? e.style.setProperty(s, v[s]) : (e.style[s] = v[s]);
        } else if (k === 'class') e.className += ' ' + v;
        else if (k === 'html') e.innerHTML = v;
        else if (k === 'data') Object.assign(e.dataset, v);
        else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
        else e.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const k of args.flat(Infinity)) if (k != null && k !== false) e.append(k.nodeType ? k : String(k));
    return e;
  }
  AG.h = h;
  AG.wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const ICONS = {
    back: '<path d="M15 4l-8 8 8 8"/>',
    next: '<path d="M9 4l8 8-8 8"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    again: '<path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 4v5h5"/>',
    list: '<path d="M5 6h14M5 12h14M5 18h14"/>',
    play: '<path d="M8 5v14l11-7z" fill="currentColor"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-1 .7-1.5 1.2-1.5 2.5"/><circle cx="12" cy="17.3" r=".4" fill="currentColor"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    erase: '<path d="M8 20h12M4.5 15.5l9-9 5 5-9 9H8z"/>',
    paint: '<path d="M12 3a9 9 0 1 0 0 18c1.3 0 2-.9 2-1.9 0-1.2-1-1.6-1-2.7 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11.5" r="1.3" fill="currentColor"/><circle cx="10.5" cy="7.3" r="1.3" fill="currentColor"/><circle cx="15.3" cy="8" r="1.3" fill="currentColor"/>',
    tray: '<path d="M4 13l2.5-7h11l2.5 7v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M4 13h4.5l1 2.5h5l1-2.5H20"/>',
  };
  AG.icon = (name) =>
    h('span.ico', {
      html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`,
    });

  /* ---------------- random helpers ---------------- */
  AG.rand = (n) => Math.floor(Math.random() * n);
  AG.pick = (a) => a[AG.rand(a.length)];
  AG.shuffle = (a) => {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = AG.rand(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  AG.sample = (a, n) => AG.shuffle(a).slice(0, n);
  AG.range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  /* n items from arr, re-shuffling when exhausted, never the same item twice in a row */
  AG.deal = (arr, n) => {
    const out = [];
    let bag = [];
    while (out.length < n && arr.length) {
      if (!bag.length) bag = AG.shuffle(arr);
      let x = bag.pop();
      if (arr.length > 1 && x === out[out.length - 1]) {
        bag.unshift(x);
        x = bag.pop();
      }
      out.push(x);
    }
    return out;
  };
  AG.NUM = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
    'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte'];
  AG.plain = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  /* ---------------- storage (per game) ---------------- */
  let KEY = 'airi';
  let DB = {};
  const persist = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(DB));
    } catch (e) {}
  };
  AG.defaults = { name: 'Airi', rounds: 6, script: 'ligada', kk: true, hintAfter: 2, anim: true };
  AG.settings = Object.assign({}, AG.defaults);
  function loadStore(gameId) {
    // the preview build (raim.dev/airi-tocaboca/) keeps its own progress: AG_BUILD.store = 'airi-tocaboca-'
    KEY = ((window.AG_BUILD || {}).store || 'airi-') + gameId;
    try {
      DB = JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (e) {
      DB = {};
    }
    Object.assign(AG.settings, AG.defaults, DB.settings);
  }
  AG.saveSettings = () => {
    DB.settings = AG.settings;
    persist();
    AG.applyCalm();
  };
  AG.db = () => DB;
  AG.persist = persist;
  /* calm: the parent switched animations off (or the iPad asks for reduced motion) */
  AG.calm = () => !AG.settings.anim || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  AG.applyCalm = () => document.documentElement.classList.toggle('calm', !AG.settings.anim);
  AG.getProg = (l, a) => (((DB.prog || {})[l] || {})[a]) || null;
  AG.setProg = (l, a, stars) => {
    DB.prog = DB.prog || {};
    const L = (DB.prog[l] = DB.prog[l] || {});
    const p = (L[a] = L[a] || { stars: 0, plays: 0 });
    p.stars = Math.max(p.stars, stars);
    p.plays++;
    p.last = Date.now();
    persist();
  };
  AG.resetProgress = () => {
    DB.prog = {};
    persist();
  };
  AG.lessonStars = (les) => {
    let got = 0;
    les.acts.forEach((a) => (got += (AG.getProg(les.id, a.id) || {}).stars || 0));
    return { got, max: les.acts.length * 3, done: les.acts.filter((a) => AG.getProg(les.id, a.id)).length, total: les.acts.length };
  };

  /* ---------------- items: pictures, words, numbers, sets ---------------- */
  AG.imgBase = 'img/';
  // a game can fix the script (e.g. English is always print); otherwise the parent's setting decides
  AG.styleClass = (style) => (style === 'print' ? 'imprenta' : style === 'cursive' ? 'ligada' : (AG.current && AG.current.script) || AG.settings.script);
  /* words of the child-facing UI; a game may override them (English game uses English) */
  AG.ui = {
    hello: '¡Hola', next: 'Siguiente', again: 'Otra vez', lesson: 'Lección', praise: ['¡Muy bien', '¡Genial', '¡Fenomenal', '¡Bravo', '¡Estupendo', '¡Lo has conseguido'],
    room: 'Mi cuarto', gift: '¡Un regalo!', tapGift: '¡Tócalo!', toRoom: 'A mi cuarto', moreStars: 'Más ★ = otro regalo',
    trayEmpty: 'Juega y gana regalos para tu cuarto', trayMore: 'Juega y gana más regalos',
  };
  AG.text = (t, o = {}) => {
    const e = h('span.txt.' + AG.styleClass(o.style));
    if (o.art) e.append(h('span.art.' + (/^(el|los|un|unos)$/.test(o.art) ? 'm' : 'f'), o.art), ' ');
    if (t != null) {
      String(t)
        .split(/(_+)/)
        .forEach((part) => part && e.append(/^_+$/.test(part) ? h('span.blank' + (part.length === 1 ? '.one' : ''), '  ') : part));
    }
    return e;
  };
  /* tap-to-count: each tap marks one thing with its number (the parent counts aloud with the child) */
  function counter() {
    let k = 0; // shared by every element it is applied to
    return (el) => {
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        if (el.classList.contains('counted')) return;
        k++;
        el.classList.add('counted');
        el.append(h('b.badge', String(k)));
      });
      return el;
    };
  }
  AG.counter = counter;
  AG.countView = (c) => {
    const n = c.n;
    const layout = c.layout || 'rows';
    const wrap = h('div.count.' + layout + (n === 0 ? '.empty' : ''), { style: c.size ? { '--esz': c.size } : null });
    const tap = c.tap === false ? (x) => x : c.counter || counter();
    const mk = () => tap(h('span.e', c.emoji));
    if (layout === 'frame') {
      for (let i = 0; i < 10; i++) wrap.append(h('span.cell', i < n ? mk() : null));
    } else if (layout === 'plate' || layout === 'scatter') {
      let pos = [];
      if (layout === 'plate') {
        const outer = Math.min(n, 7);
        for (let i = 0; i < n; i++) {
          const ring = i < outer ? 0 : 1;
          const cnt = ring ? n - outer : outer;
          const j = ring ? i - outer : i;
          const r = n === 1 ? 0 : ring ? (cnt === 1 ? 0 : 13) : 30;
          const a = (2 * Math.PI * j) / cnt - Math.PI / 2 + (ring ? 0.5 : 0);
          pos.push([50 + r * Math.cos(a), 50 + r * Math.sin(a)]);
        }
      } else {
        const cells = AG.sample(AG.range(0, 11), n);
        pos = cells.map((k) => [((k % 4) + 0.5) * 25 + (Math.random() - 0.5) * 9, (Math.floor(k / 4) + 0.5) * 33.3 + (Math.random() - 0.5) * 10]);
      }
      pos.forEach(([x, y]) => {
        const e = mk();
        e.style.left = x + '%';
        e.style.top = y + '%';
        wrap.append(e);
      });
    } else {
      for (let i = 0; i < n; i++) wrap.append(mk());
      if (layout === 'rows') wrap.style.maxWidth = `calc(${Math.min(n, c.per || 5)} * var(--esz) * 1.45)`;
    }
    return wrap;
  };
  AG.letterBoxes = (word) => {
    const tap = counter();
    return h('div.lboxes', [...word].map((ch) => tap(h('span.lbox', ch))));
  };
  AG.item = function item(it) {
    if (it == null) return h('div.item');
    if (typeof it !== 'object') it = { text: String(it) };
    const e = h('div.item' + (it.cls ? '.' + it.cls : ''));
    if (it.row) {
      const row = it.text == null ? e : h('div.item.rowitem');
      row.classList.add('rowitem');
      it.row.forEach((x) => row.append(typeof x === 'string' ? h('span.sym', x) : item(x)));
      if (it.text == null) return e;
      e.append(row, AG.text(it.text, it)); // pictures in a row with a sentence below
      if (it.cap) e.append(h('div.cap', it.cap));
      return e;
    }
    if (it.letters) e.append(h('div.letters', h('span.txt.imprenta', it.letters), h('span.txt.ligada', it.letters)));
    if (it.img) {
      const k = it.times || 1;
      const pics = h('div.pics' + (k > 1 ? '.multi' : ''));
      for (let i = 0; i < k; i++) pics.append(h('img.pic', { src: AG.imgBase + it.img + '.webp', alt: '', draggable: 'false' }));
      e.append(pics);
    }
    if (it.imgs) e.append(h('div.pics.multi', it.imgs.map((s) => h('img.pic', { src: AG.imgBase + s + '.webp', alt: '', draggable: 'false' }))));
    if (it.emoji) e.append(h('span.emoji', it.emoji));
    if (it.count) e.append(AG.countView(it.count));
    if (it.spell) e.append(AG.letterBoxes(it.spell));
    if (it.num != null) e.append(h('span.num', String(it.num)));
    if (it.text != null || it.art) e.append(AG.text(it.text, it));
    if (it.syls) e.append(h('div.syls', it.syls.map((s) => h('span.syl', AG.text(s, it)))));
    if (it.cap) e.append(h('div.cap', it.cap));
    return e;
  };

  /* Kazakh parent/teacher notes: array of strings; "- " starts a bullet; **bold**; «italic» */
  AG.kk = (lines, title = 'Мұғалімге (сізге)', open = true, force = false) => {
    if ((!AG.settings.kk && !force) || !lines || !lines.length) return null;
    const body = h('div.kk-body');
    let ul = null;
    [].concat(lines).forEach((l) => {
      if (l.startsWith('- ')) {
        if (!ul) body.append((ul = h('ul')));
        ul.append(h('li', { html: md(l.slice(2)) }));
      } else {
        ul = null;
        body.append(h('p', { html: md(l) }));
      }
    });
    return h('details.kk', { open }, h('summary', h('span.kk-badge', 'ҚАЗ'), ' ', title), body);
  };
  const md = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/«(.+?)»/g, '«<i>$1</i>»');

  /* ---------------- registry ---------------- */
  AG.types = {};
  AG.type = (name, impl) => (AG.types[name] = impl);
  AG.game = (def) => {
    def.lessons.forEach((l, i) => {
      l.index = i;
      l.acts = (typeof l.activities === 'function' ? l.activities(l, def) : l.activities) || [];
      l.acts.forEach((a, k) => (a.id = a.id || a.type + k));
    });
    AG.current = def;
    return def;
  };

  /* ---------------- screens ---------------- */
  const root = () => document.getElementById('app');
  function mount(screen) {
    const r = root();
    r.innerHTML = '';
    r.append(screen);
  }
  AG.mount = mount;
  AG.go = (path) => {
    const want = '#/' + path;
    if (location.hash === want) route();
    else location.hash = want;
  };
  function topbar(back, title, right) {
    return h(
      'header.top',
      back != null ? h('button.rb', { onclick: () => AG.go(back), 'aria-label': 'Atrás' }, AG.icon('back')) : h('span.rb-space'),
      h('div.ttl', title),
      right || h('span.rb-space')
    );
  }
  AG.topbar = topbar;
  const stars = (n, max = 3) => h('span.stars', AG.range(1, max).map((k) => h('i' + (k <= n ? '.on' : ''), '★')));
  AG.stars = stars;

  /* button that must be held (so the child doesn't open the parent area by accident) */
  AG.holdButton = (label, action, ms = 1200) => {
    let t = null;
    const b = h('button.hold', h('i.fill'), h('span', AG.icon('gear'), ' ', label));
    const stop = () => {
      clearTimeout(t);
      b.classList.remove('holding');
    };
    b.addEventListener('pointerdown', () => {
      b.classList.add('holding');
      t = setTimeout(() => {
        stop();
        action();
      }, ms);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, stop));
    if (AG.test) b.addEventListener('click', action);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
    return b;
  };

  function gameScreen(g) {
    const name = AG.settings.name;
    const hiBuddy = AG.buddy('', '92px');
    hiBuddy.addEventListener('click', () => AG.buddyMood(hiBuddy, 'happy', 1300));
    mount(
      h(
        'div.screen.game',
        h('header.top.home-top',
          // in the browser: back to the catalog of games; hidden inside the installed app
          AG.standalone ? h('span.rb-space') : h('a.rb', { href: '../', 'aria-label': 'Juegos' }, AG.icon('back')),
          h('div.ttl',
            hiBuddy,
            h('div.hello', h('b', AG.ui.hello + (name ? ', ' + name : '') + '!'), h('span', h('span.gi', g.icon), ' ', g.title))),
          h('div.home-right', AG.roomButton(), AG.holdButton('Ата-ана', () => AG.go('parent')))),
        h(
          'div.scroll',
          AG.kk(g.kk, g.kkTitle || 'Бұл ойын туралы', false),
          h(
            'div.lessons',
            g.lessons.map((l) => {
              const st = AG.lessonStars(l);
              return h(
                'button.ltile' + (st.done === st.total && st.total ? '.complete' : ''),
                { onclick: () => AG.go('l/' + l.id) },
                h('span.lbig' + (l.label.length > 8 ? '.long' : ''), AG.text(l.label, { style: l.labelStyle })),
                h('span.lname', l.title),
                l.page ? h('span.lpage', 'pág. ' + l.page) : null,
                h('span.lprog', h('i', { style: { width: (st.max ? (100 * st.got) / st.max : 0) + '%' } }))
              );
            })
          )
        )
      )
    );
  }

  function lessonScreen(g, les) {
    mount(
      h(
        'div.screen.lesson',
        topbar('', h('span', les.title, les.page ? h('small', ' · pág. ' + les.page) : null)),
        h(
          'div.scroll',
          AG.kk(les.kk, 'Мұғалімге (сізге)', true),
          h(
            'div.acts',
            les.acts.map((a, i) => {
              const p = AG.getProg(les.id, a.id);
              return h(
                'button.atile' + (p ? '.played' : '') + (p && p.stars === 3 ? '.three' : ''),
                { onclick: () => AG.go(`l/${les.id}/${i}`) },
                h('span.anum', String(i + 1)),
                p ? null : h('span.gifted', { html: AG.giftSvg() }),
                h('span.aicon', a.icon || '•'),
                h('span.aname', a.title),
                AG.settings.kk && a.kkShort ? h('span.akk', a.kkShort) : null,
                h('span.astars', stars(p ? p.stars : 0))
              );
            })
          )
        )
      )
    );
  }


  /* one activity = several tasks (rounds). Nothing advances by itself:
     ↺ starts the current task again, → goes to the next one, the dots jump to any task. */
  function playScreen(g, les, idx) {
    const act = les.acts[idx];
    const type = act && AG.types[act.type];
    if (!type) return AG.go('l/' + les.id);
    const rounds = act.make({ n: AG.settings.rounds, game: g, lesson: les }) || [];
    const status = rounds.map(() => ''); // '' | 'skip' | 'done' | 'clean'
    let i = 0, errs = 0, solved = false;
    const dots = h('div.dots', rounds.map((_, k) => h('button', { onclick: () => start(k), 'aria-label': String(k + 1) })));
    const stage = h('main.stage');
    const tip = h('button.rb.tipbtn', { onclick: () => showTip(), 'aria-label': 'Ayuda' }, AG.icon('help'));
    const feedback = h('div.feedback');
    const buddy = AG.buddy('', '70px');
    buddy.addEventListener('click', () => !solved && AG.buddyMood(buddy, 'happy', 1000));
    const say = (...xs) => {
      feedback.innerHTML = '';
      feedback.append(buddy, ...xs.filter((x) => x != null));
    };
    const resetBtn = h('button.pill.reset', { onclick: () => start(i) }, AG.icon('again'));
    const nextBtn = h('button.pill.next', { onclick: () => next(), 'data-test': AG.test ? 'next' : null }, AG.ui.next + ' ', AG.icon('next'));
    const bottom = h('footer.bottom', resetBtn, feedback, nextBtn);
    const screen = h('div.screen.play.t-' + act.type,
      topbar('l/' + les.id, h('div.ttl-play', h('span.at', act.icon || '', ' ', act.title), rounds.length > 1 ? dots : null, act.es ? h('span.es', act.es) : null), tip),
      stage, bottom);
    mount(screen);
    const alive = () => screen.isConnected;

    function showTip() {
      const ov = h('div.overlay', { onclick: () => ov.remove() },
        h('div.tipcard', { onclick: (e) => e.stopPropagation() },
          act.es ? h('div.tip-es', act.es) : null,
          AG.kk(act.kk, 'Мұғалімге', true, true),
          h('button.pill', { onclick: () => ov.remove() }, AG.icon('check'), ' OK')));
      screen.append(ov);
    }
    const paintDots = () =>
      [...dots.children].forEach((d, k) => (d.className = (k === i ? 'cur ' : '') + (status[k] === 'clean' ? 'full' : status[k] === 'done' ? 'half' : status[k] === 'skip' ? 'skip' : '')));

    const api = {
      game: g, lesson: les, act, stage, alive,
      get errors() { return errs; },
      get solved() { return solved; },
      ok: (el, after) => {
        if (solved) return;
        solved = true;
        if (el) el.classList.add('ok');
        stage.classList.add('solved');
        status[i] = status[i] === 'clean' || errs === 0 ? 'clean' : 'done';
        paintDots();
        say(h('span.fb-ok', AG.icon('check')), after != null ? (typeof after === 'string' ? AG.text(after, { style: 'print' }) : AG.item(after)) : null);
        AG.buddyMood(buddy, 'happy', 0);
        AG.sparkle(el || feedback.querySelector('.fb-ok'));
        nextBtn.classList.add('ready');
      },
      no: (el) => {
        errs++;
        AG.buddyMood(buddy, 'think', 1300);
        if (el) {
          el.classList.remove('no');
          void el.offsetWidth;
          el.classList.add('no');
        }
        return errs >= AG.settings.hintAfter;
      },
      step: () => {},
      message: (t) => say(t ? h('span.fb-msg', t) : null),
    };
    function start(k) {
      if (!alive()) return;
      i = k;
      errs = 0;
      solved = false;
      stage.innerHTML = '';
      stage.classList.remove('solved');
      say();
      AG.buddyMood(buddy, '');
      nextBtn.classList.remove('ready');
      paintDots();
      AG._round = rounds[i];
      type.render(stage, rounds[i], api, i);
    }
    function next() {
      if (!solved && !status[i]) status[i] = 'skip';
      if (i < rounds.length - 1) start(i + 1);
      else finish();
    }
    function finish() {
      const n = rounds.length || 1;
      const clean = status.filter((s) => s === 'clean').length;
      const done = status.filter((s) => s === 'clean' || s === 'done').length;
      const ratio = clean / n;
      const st = done === 0 ? 0 : ratio >= 0.85 ? 3 : ratio >= 0.5 ? 2 : 1;
      const prev = AG.getProg(les.id, act.id);
      const before = prev ? prev.stars : -1; // read before saving: setProg updates the same object
      if (st) AG.setProg(les.id, act.id, st);
      // a present for a new activity, or for more stars than last time
      const prize = st && st > before ? AG.giveGift() : null;
      const nxt = les.acts[idx + 1];
      const name = AG.settings.name;
      const praise = st ? AG.pick(AG.ui.praise) + (name ? ', ' + name : '') + '!' : '';
      bottom.style.display = 'none';
      stage.classList.remove('solved');
      stage.innerHTML = '';
      const fb = AG.buddy(st ? 'happy' : '');
      if (st) AG.buddyMood(fb, 'happy', 0);
      const btns = h('div.fbtns',
        h('button.pill', { onclick: () => route() }, AG.icon('again'), ' ' + AG.ui.again),
        nxt ? h('button.pill.main', { onclick: () => AG.go(`l/${les.id}/${idx + 1}`) }, (nxt.icon || '') + ' ' + nxt.title, ' ', AG.icon('next')) : null,
        h('button.pill', { onclick: () => AG.go('l/' + les.id) }, AG.icon('list'), ' ' + AG.ui.lesson));
      let giftBox = null;
      if (prize) {
        const cap = h('div.gift-cap', AG.ui.gift + ' ' + AG.ui.tapGift);
        const btn = h('button.gift-btn', { 'aria-label': AG.ui.gift, 'data-test': AG.test ? 'gift' : null, html: AG.giftSvg() },
          h('span.gift-prize', AG.thingEl(prize.k)));
        giftBox = h('div.gift', btn, cap);
        btn.addEventListener('click', () => {
          if (giftBox.classList.contains('open')) return;
          giftBox.classList.add('open');
          cap.innerHTML = '';
          cap.append(h('span.word', AG.thingLabel(prize.k)));
          btns.prepend(h('button.pill.room', { onclick: () => AG.go('room'), 'data-test': AG.test ? 'toroom' : null }, AG.houseIcon(), ' ' + AG.ui.toRoom));
          if (!AG.calm()) confetti(screen);
        });
      }
      stage.append(
        h('div.finish',
          h('div.finish-row',
            fb,
            h('div', h('div.bigstars', [1, 2, 3].map((k) => h('i' + (k <= st ? '.on' : ''), { style: { animationDelay: k * 0.15 + 's' } }, '★'))),
              praise ? h('div.praise', praise) : null)),
          giftBox,
          !prize && st && st < 3 ? h('div.gift-next', h('span.mini', { html: AG.giftSvg() }), AG.ui.moreStars) : null,
          btns)
      );
      if (st && !prize && !AG.calm()) confetti(screen);
    }
    if (!rounds.length) return finish();
    if (type.single) bottom.classList.add('single');
    start(0);
  }

  /* little stars fly out of a right answer */
  const STAR = '<svg viewBox="0 0 20 20"><path d="M10 1l2.6 5.6 6.1.8-4.5 4.2 1.1 6-5.3-3-5.3 3 1.1-6L1.3 7.4l6.1-.8z" fill="currentColor"/></svg>';
  AG.sparkle = (el) => {
    if (!el || AG.calm()) return;
    const r = el.getBoundingClientRect();
    const box = h('div.spark', { style: { left: r.left + r.width / 2 + 'px', top: r.top + r.height / 2 + 'px' } });
    const cols = ['#FFC21F', '#FF6FA0', '#5BC8F5', '#22B573', '#8C7CF0'];
    const rad = Math.max(60, Math.min(140, Math.max(r.width, r.height) * 0.7));
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2 + Math.random() * 0.5;
      const d = rad * (0.8 + Math.random() * 0.4);
      box.append(h('i', { html: STAR, style: { color: cols[k % cols.length], '--dx': Math.cos(a) * d + 'px', '--dy': Math.sin(a) * d + 'px', animationDelay: Math.random() * 0.08 + 's' } }));
    }
    document.body.append(box);
    setTimeout(() => box.remove(), 900);
  };

  function confetti(host) {
    const box = h('div.confetti');
    const cols = ['#FFC21F', '#FF6FA0', '#5BC8F5', '#22B573', '#8C7CF0', '#FF8A3D'];
    for (let i = 0; i < 26; i++)
      box.append(h('i', { style: { left: Math.random() * 100 + '%', background: AG.pick(cols), animationDelay: Math.random() * 0.6 + 's', animationDuration: 1.8 + Math.random() * 1.2 + 's' } }));
    host.append(box);
    setTimeout(() => box.remove(), 3500);
  }

  function route() {
    const g = AG.current;
    const p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    if (p[0] === 'parent') return AG.parentScreen(mount, p[1]);
    if (p[0] === 'room') return AG.roomScreen(mount);
    if (p[0] === 'l') {
      const les = g.lessons.find((l) => l.id === p[1]);
      if (!les) return AG.go('');
      if (p.length === 2) return lessonScreen(g, les);
      return playScreen(g, les, +p[2]);
    }
    return gameScreen(g);
  }
  AG.route = route;

  /* ---------------- offline (service worker) ---------------- */
  AG.offlineStatus = async () => {
    const info = window.AG_BUILD || {};
    try {
      if (!('caches' in window) || !info.cache) return { ready: false, total: info.count };
      const c = await caches.open(info.cache);
      const keys = await c.keys();
      return { ready: keys.length >= info.count, count: keys.length, total: info.count };
    } catch (e) {
      return { ready: false };
    }
  };
  function registerSW() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:' || AG.test) return;
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  AG.start = () => {
    const g = AG.current;
    loadStore(g.id);
    AG.applyCalm();
    Object.assign(AG.ui, g.ui || {});
    if (g.lang) document.documentElement.lang = g.lang;
    document.documentElement.style.setProperty('--accent', g.color);
    document.documentElement.style.setProperty('--accent2', g.color2 || g.color);
    window.addEventListener('hashchange', route);
    document.addEventListener('gesturestart', (e) => e.preventDefault()); // no pinch-zoom on iPad
    route();
    registerSW();
  };
})();
