/* Airi Games — presents and the room.
   Finishing an activity for the first time (or with more stars than before) gives a present: a thing for the room.
   The room is free play with no rules: drag things anywhere, tap them (they move, light up, show their word),
   paint the wall and the floor. Everything is saved on the iPad, per game. */
(function () {
  'use strict';
  const { h } = AG;
  const EN_NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'];
  const WALLS = ['#BFE3FF', '#FFD6E7', '#D3F4E6', '#FFF0B3', '#E5DBFF', '#FFE0CC'];
  const FLOORS = ['#F2C48D', '#C99A6E', '#BFE8C8', '#E6DCF2', '#9FD4F5'];
  const STARTERS = [['rug', 50, 93], ['plant', 86, 88]];
  const en = () => document.documentElement.lang === 'en';

  /* ---------- data ---------- */
  function room() {
    const D = AG.db();
    if (!D.room) {
      D.room = { wall: 0, floor: 0, seq: 0, things: [], buddy: { x: 66, y: 92 } };
      STARTERS.forEach(([k, x, y]) => D.room.things.push({ id: ++D.room.seq, k, x, y, placed: true }));
    }
    return D.room;
  }
  const save = () => AG.persist();
  AG.freshCount = () => (AG.db().room ? AG.db().room.things.filter((t) => t.fresh).length : 0);

  /* pick a present: something new first; when she has everything, a second (or third) one */
  AG.giveGift = () => {
    const R = room();
    const count = {};
    R.things.forEach((t) => (count[t.k] = (count[t.k] || 0) + 1));
    let pool = AG.thingKeys.filter((k) => !count[k]);
    if (!pool.length) pool = AG.thingKeys.filter((k) => count[k] < 3 && !AG.things[k].flat);
    if (!pool.length) return null;
    const t = { id: ++R.seq, k: AG.pick(pool), placed: false, fresh: true };
    R.things.push(t);
    save();
    return t;
  };

  /* the word of a thing, coloured like in the books: el / los blue, la / las red */
  AG.thingLabel = (k) => {
    const t = AG.things[k];
    if (en()) return AG.text(t.en, { style: 'print' });
    const m = t.es.match(/^(el|la|los|las)\s+(.+)$/);
    return m ? AG.text(m[2], { art: m[1], style: 'print' }) : AG.text(t.es, { style: 'print' });
  };

  /* ---------- small art ---------- */
  const HOUSE = `<svg viewBox="0 0 48 48" aria-hidden="true">
    <rect x="9" y="20" width="30" height="23" rx="4" fill="#FFF7EC"/>
    <path d="M3.5 23.5L24 6l20.5 17.5a2.4 2.4 0 0 1-3.2 3.5L24 12.6 6.7 27a2.4 2.4 0 0 1-3.2-3.5z" fill="#FF6B6B"/>
    <rect x="20" y="29" width="9" height="14" rx="2.5" fill="#8C7CF0"/>
    <rect x="12.5" y="27" width="6" height="6" rx="1.5" fill="#7FD3F5"/><rect x="31" y="27" width="5" height="6" rx="1.5" fill="#7FD3F5"/>
    <rect x="31" y="9" width="5" height="9" rx="1" fill="#C99A6E"/></svg>`;
  AG.houseIcon = () => h('span.ico', { html: HOUSE });
  AG.roomButton = () => {
    const n = AG.freshCount();
    return h('button.roombtn', { onclick: () => AG.go('room'), 'data-test': AG.test ? 'room' : null },
      AG.houseIcon(), AG.ui.room, n ? h('span.newdot', String(n)) : null);
  };

  /* ---------- the room screen ---------- */
  AG.roomScreen = (mount) => {
    const R = room();
    const screen = h('div.screen.room-screen');
    const box = h('div.room', h('div.wall'), h('div.win', h('i'), h('i')), h('div.floor'), h('div.board'));
    const tray = h('div.tray');
    const paintBtn = h('button.rb', { onclick: (e) => { e.stopPropagation(); togglePalette(); }, 'aria-label': 'Colores' }, AG.icon('paint'));
    screen.append(AG.topbar('', h('span', AG.houseIcon(), ' ', AG.ui.room), paintBtn), box, tray);
    mount(screen);

    const paint = () => {
      box.style.setProperty('--wall', WALLS[R.wall % WALLS.length]);
      box.style.setProperty('--floor', FLOORS[R.floor % FLOORS.length]);
    };
    paint();
    // sizes follow the short side of the room, a bit bigger than the art's base size
    let rh = 600;
    const SCALE = 1.25;
    const sizeAll = () => {
      const r = box.getBoundingClientRect();
      rh = Math.min(r.width, r.height) || rh;
      box.querySelectorAll('.room-thing').forEach(size);
    };
    const size = (el) => {
      if (!el._t) return;
      el.style.width = ((AG.things[el._t.k].w * SCALE) / 100) * rh + 'px';
    };
    const zOf = (t, y) => (t && AG.things[t.k].flat ? 1 : 10 + Math.round(y * 10));
    const placeEl = (el, x, y) => {
      el.style.left = x + '%';
      el.style.top = y + '%';
      el.style.zIndex = zOf(el._t, y);
    };

    /* things already in the room */
    function addThingEl(t) {
      const el = h('div.room-thing', { data: { k: t.k, test: AG.test ? 'thing' : null } }, AG.thingEl(t.k, t.on ? 'on' : null));
      el._t = t;
      if (t.face) AG.diceFace(el, t.face);
      size(el);
      placeEl(el, t.x, t.y);
      draggable(el, t);
      box.append(el);
      return el;
    }
    R.things.filter((t) => t.placed).forEach(addThingEl);

    /* the buddy lives here too */
    const bud = h('div.room-thing.buddy-thing', AG.buddy('', '100%'));
    const budFace = bud.firstChild;
    bud.style.width = 0.17 * rh + 'px';
    placeEl(bud, R.buddy.x, R.buddy.y);
    draggable(bud, null);
    box.append(bud);
    const sizeBud = () => (bud.style.width = 0.17 * rh + 'px');

    if (window.ResizeObserver) new ResizeObserver(() => { sizeAll(); sizeBud(); }).observe(box);
    requestAnimationFrame(() => { sizeAll(); sizeBud(); });

    /* drag inside the room; a short touch is a tap */
    function draggable(el, t) {
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        closePalette();
        const b = box.getBoundingClientRect();
        const cur = t || R.buddy;
        const ox = e.clientX - (b.left + (cur.x / 100) * b.width);
        const oy = e.clientY - (b.top + (cur.y / 100) * b.height);
        const sx = e.clientX, sy = e.clientY;
        let moved = false;
        el.setPointerCapture(e.pointerId);
        const move = (ev) => {
          if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 9) return;
          moved = true;
          el.classList.add('drag');
          const x = Math.max(3, Math.min(97, ((ev.clientX - ox - b.left) / b.width) * 100));
          const y = Math.max(12, Math.min(100, ((ev.clientY - oy - b.top) / b.height) * 100));
          cur.x = Math.round(x * 10) / 10;
          cur.y = Math.round(y * 10) / 10;
          placeEl(el, cur.x, cur.y);
          if (t) tray.classList.toggle('over', overTray(ev));
        };
        const up = (ev) => {
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerup', up);
          el.removeEventListener('pointercancel', up);
          el.classList.remove('drag');
          tray.classList.remove('over');
          if (!moved) return tap(el, t);
          if (t && overTray(ev)) {
            t.placed = false;
            el.remove();
            renderTray();
          } else land(el);
          save();
        };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerup', up);
        el.addEventListener('pointercancel', up);
      });
    }
    const overTray = (ev) => {
      const r = tray.getBoundingClientRect();
      return ev.clientY >= r.top - 10 && ev.clientX >= r.left && ev.clientX <= r.right;
    };
    const land = (el) => {
      el.classList.remove('drop');
      void el.offsetWidth;
      el.classList.add('drop');
    };

    /* taps: every thing does something and shows its word */
    function tap(el, t) {
      if (!t) return AG.buddyMood(budFace, 'happy', 1300);
      const def = AG.things[t.k];
      const kind = def.tap || 'wiggle';
      let word = AG.thingLabel(t.k);
      if (kind === 'glow') {
        const th = el.querySelector('.thing');
        th.classList.toggle('on');
        t.on = th.classList.contains('on');
        save();
      } else if (kind === 'roll') {
        let n = 1 + AG.rand(6);
        if (n === t.face) n = (n % 6) + 1;
        t.face = n;
        AG.diceFace(el, n);
        word = h('span', h('b', String(n)), ' · ', AG.text(en() ? EN_NUM[n] : AG.NUM[n], { style: 'print' }));
        save();
      } else if (kind === 'hearts' && !AG.calm()) {
        const hs = h('div.hearts', [0, 1, 2].map((k) => h('i', { style: { '--dx': (k - 1) * 26 + 'px', animationDelay: k * 0.15 + 's' } }, '♥')));
        el.append(hs);
        setTimeout(() => hs.remove(), 1600);
      }
      if (kind !== 'glow' && kind !== 'hearts') {
        el.classList.remove('a-' + kind);
        void el.offsetWidth;
        el.classList.add('a-' + kind);
        clearTimeout(el._a);
        el._a = setTimeout(() => el.classList.remove('a-' + kind), 3100);
      } else {
        el.classList.remove('a-wiggle');
        void el.offsetWidth;
        el.classList.add('a-wiggle');
      }
      // one word at a time, shown above everything
      box.querySelectorAll('.room-thing .label').forEach((l) => l.remove());
      box.querySelectorAll('.room-thing.talk').forEach((x) => x.classList.remove('talk'));
      const lab = h('span.label', word);
      el.append(lab);
      el.classList.add('talk');
      clearTimeout(el._l);
      el._l = setTimeout(() => { lab.remove(); el.classList.remove('talk'); }, 2200);
    }

    /* tray: presents that are not in the room yet */
    function renderTray() {
      tray.innerHTML = '';
      const groups = {};
      R.things.filter((t) => !t.placed).forEach((t) => (groups[t.k] = groups[t.k] || []).push(t));
      const keys = Object.keys(groups);
      if (!keys.length) {
        tray.append(h('div.tray-empty', h('span.mini', { html: AG.giftSvg() }), R.things.length > STARTERS.length ? AG.ui.trayMore : AG.ui.trayEmpty));
        return;
      }
      keys.forEach((k) => {
        const list = groups[k];
        const it = h('button.tray-item' + (list.some((t) => t.fresh) ? '.new' : ''), { data: { k, test: AG.test ? 'tray' : null } },
          AG.thingEl(k), list.length > 1 ? h('span.n', String(list.length)) : null);
        trayDrag(it, k);
        tray.append(it);
      });
    }
    function placeFromTray(k, x, y) {
      const t = R.things.find((q) => !q.placed && q.k === k);
      if (!t) return;
      const def = AG.things[k];
      if (x == null) {
        // a tap puts it in the emptiest of a few random spots
        const others = R.things.filter((q) => q.placed && q !== t).map((q) => [q.x, q.y]).concat([[R.buddy.x, R.buddy.y]]);
        let best = -1;
        for (let n = 0; n < 12; n++) {
          const cx = 10 + Math.random() * 80;
          const cy = def.wall ? 28 + Math.random() * 20 : def.flat ? 88 + Math.random() * 8 : 74 + Math.random() * 22;
          const d = Math.min(1e9, ...others.map(([ox, oy]) => Math.hypot(cx - ox, (cy - oy) * 1.6)));
          if (d > best) { best = d; x = cx; y = cy; }
        }
      }
      Object.assign(t, { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, placed: true });
      delete t.fresh;
      const el = addThingEl(t);
      land(el);
      save();
      renderTray();
    }
    function trayDrag(it, k) {
      it.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        closePalette();
        const sx = e.clientX, sy = e.clientY;
        let ghost = null;
        it.setPointerCapture(e.pointerId);
        const move = (ev) => {
          if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 9) return;
          if (!ghost) {
            ghost = h('div.ghost', AG.thingEl(k));
            ghost.style.width = ((AG.things[k].w * SCALE) / 100) * rh + 'px';
            document.body.append(ghost);
          }
          ghost.style.left = ev.clientX + 'px';
          ghost.style.top = ev.clientY + 'px';
        };
        const up = (ev) => {
          it.removeEventListener('pointermove', move);
          it.removeEventListener('pointerup', up);
          it.removeEventListener('pointercancel', up);
          if (!ghost) return placeFromTray(k);
          ghost.remove();
          const b = box.getBoundingClientRect();
          if (ev.clientX > b.left && ev.clientX < b.right && ev.clientY > b.top && ev.clientY < b.bottom) {
            const gh = ((AG.things[k].w * SCALE) / 100) * rh * 0.25;
            placeFromTray(k, ((ev.clientX - b.left) / b.width) * 100, Math.min(100, ((ev.clientY + gh - b.top) / b.height) * 100));
          }
        };
        it.addEventListener('pointermove', move);
        it.addEventListener('pointerup', up);
        it.addEventListener('pointercancel', up);
      });
    }
    renderTray();

    /* paint the wall and the floor; put everything away */
    let pal = null;
    function closePalette() {
      if (pal) pal.remove();
      pal = null;
    }
    function togglePalette() {
      if (pal) return closePalette();
      const row = (list, key) => h('div.row', list.map((c, i) => h('button.swatch' + (R[key] % list.length === i ? '.on' : ''), {
        style: { background: c },
        onclick: (e) => {
          R[key] = i;
          paint();
          save();
          [...e.currentTarget.parentNode.children].forEach((b) => b.classList.remove('on'));
          e.currentTarget.classList.add('on');
        },
      })));
      pal = h('div.palette', { onclick: (e) => e.stopPropagation() },
        row(WALLS, 'wall'), row(FLOORS, 'floor'),
        h('button.pill', {
          onclick: () => {
            R.things.forEach((t) => (t.placed = false));
            box.querySelectorAll('.room-thing:not(.buddy-thing)').forEach((el) => el.remove());
            save();
            renderTray();
            closePalette();
          },
        }, AG.icon('tray')));
      screen.append(pal);
    }
    screen.addEventListener('pointerdown', (e) => pal && !pal.contains(e.target) && e.target !== paintBtn && !paintBtn.contains(e.target) && closePalette());
    if (AG.test) AG._room = { R, box, tray };
  };
})();
