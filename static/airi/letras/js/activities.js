/* Airi Games — activity types. Each type renders ONE task (round) into `stage`,
   calls api.ok(el, after) when it is solved and api.no(el) on a mistake (returns true when it is time to show a hint).
   Nothing moves on by itself: the bottom bar has ↺ (start this task again) and → (next task). */
(function () {
  'use strict';
  const { h, item, text, icon, shuffle } = AG;
  const mark = (el, ok) => AG.test && ok && (el.dataset.test = 'ok');
  const put = (stage, ...xs) => stage.append(...xs.filter((x) => x != null && x !== false));
  const promptBox = (r) => (r.prompt != null ? h('div.prompt' + (r.promptClass ? '.' + r.promptClass : ''), item(r.prompt)) : null);
  const question = (r) => (r.q ? h('div.q', r.q) : null);

  /* ---------- show: cards to look at together (learn step) ---------- */
  AG.type('show', {
    single: true,
    render(stage, r, api) {
      const cards = r.cards;
      const seen = new Set();
      let k = 0;
      const holder = h('div.show-card');
      const prev = h('button.rb.big', { onclick: () => go(k - 1), 'aria-label': 'Anterior' }, icon('back'));
      const next = h('button.rb.big.main', { onclick: () => go(k + 1), 'aria-label': 'Siguiente', 'data-test': AG.test ? 'card' : null }, icon('next'));
      const sdots = h('div.sdots', cards.map(() => h('i')));
      function go(j) {
        if (j < 0 || j >= cards.length) return;
        k = j;
        seen.add(j);
        holder.innerHTML = '';
        holder.append(h('div.card', item(cards[j])));
        prev.style.visibility = j === 0 ? 'hidden' : '';
        next.style.visibility = j === cards.length - 1 ? 'hidden' : '';
        [...sdots.children].forEach((d, i) => (d.className = i === j ? 'cur' : seen.has(i) ? 'seen' : ''));
        if (seen.size === cards.length) api.ok(null);
      }
      let sx = null;
      holder.addEventListener('pointerdown', (e) => (sx = e.clientX));
      holder.addEventListener('pointerup', (e) => {
        if (sx == null) return;
        const dx = e.clientX - sx;
        sx = null;
        if (Math.abs(dx) > 70) go(k + (dx < 0 ? 1 : -1));
      });
      put(stage, h('div.show', prev, holder, next), sdots);
      go(0);
    },
  });

  /* ---------- choose: one correct option ---------- */
  AG.type('choose', {
    render(stage, r, api) {
      const p = promptBox(r);
      const opts = h('div.options' + (r.optClass ? '.' + r.optClass : ''));
      r.options.forEach((o, i) => {
        const b = h('button.opt', item(o));
        mark(b, i === r.answer);
        b.onclick = () => {
          if (api.solved || b.classList.contains('dis')) return;
          if (i === r.answer) {
            if (r.fill != null && p) {
              const bl = p.querySelector('.blank');
              if (bl) {
                bl.textContent = r.fill;
                bl.classList.add('filled');
                if (r.fillCls) bl.classList.add(r.fillCls);
              }
            }
            api.ok(b, r.after);
          } else {
            const hint = api.no(b);
            b.classList.add('dis');
            if (hint) opts.children[r.answer].classList.add('hint');
          }
        };
        opts.append(b);
      });
      put(stage, question(r), p, opts);
    },
  });

  /* ---------- multi: find all correct options ---------- */
  AG.type('multi', {
    render(stage, r, api) {
      const p = promptBox(r);
      const opts = h('div.options.multi' + (r.optClass ? '.' + r.optClass : ''));
      let found = 0;
      const btns = r.options.map((o, i) => {
        const good = r.answers.includes(i);
        const b = h('button.opt', item(o));
        mark(b, good);
        b.onclick = () => {
          if (api.solved || b.classList.contains('dis') || b.classList.contains('got')) return;
          if (good) {
            b.classList.add('got');
            b.classList.remove('hint');
            found++;
            if (found === r.answers.length) api.ok(null, r.after);
          } else {
            const hint = api.no(b);
            b.classList.add('dis');
            if (hint) btns.forEach((x, j) => r.answers.includes(j) && !x.classList.contains('got') && x.classList.add('hint'));
          }
        };
        return b;
      });
      opts.append(...btns);
      put(stage, question(r), p, opts);
    },
  });

  /* ---------- build: fill the slots left→right with tiles (syllables, letters, words, numbers) ---------- */
  AG.type('build', {
    render(stage, r, api) {
      const face = (v, color) => {
        const t = r.tileStyle === 'num' ? h('span.num', String(v)) : text(v, { style: r.tileStyle });
        if (color) t.style.color = color;
        return t;
      };
      // slot kinds: {answer} to fill, {fixed} shown, {gap: true} a space between words
      const slots = r.slots.map((s) => (s.gap ? h('div.slot-gap') : h('div.slot' + (s.fixed != null ? '.fixed' : ''), s.fixed != null ? face(s.fixed) : null)));
      const blanks = r.slots.map((s, i) => (s.fixed == null && !s.gap ? i : -1)).filter((i) => i >= 0);
      let b = 0;
      const cur = () => slots.forEach((s, i) => s.classList.toggle('cur', i === blanks[b]));
      const tiles = (r.noShuffle ? r.tiles : shuffle(r.tiles)).map((t) => (typeof t === 'object' ? t : { v: t }));
      const fits = (t, slot) => String(t.v) === String(slot.answer) && (!slot.color || slot.color === t.color);
      const testMark = () => {
        if (!AG.test) return;
        tileEls.forEach((x) => delete x.dataset.test);
        const right = b < blanks.length && tileEls.find((x, j) => !x.classList.contains('used') && fits(tiles[j], r.slots[blanks[b]]));
        if (right) right.dataset.test = 'ok';
      };
      const tileEls = tiles.map((t) => {
        const el = h('button.tile', { style: t.color ? { background: t.color + '1A', borderColor: t.color } : null }, face(t.v, t.color));
        el.onclick = () => {
          if (api.solved || el.classList.contains('used') || b >= blanks.length) return;
          if (fits(t, r.slots[blanks[b]])) {
            el.classList.add('used');
            const s = slots[blanks[b]];
            s.append(face(t.v, t.color));
            s.classList.add('filled');
            if (t.color) s.style.borderColor = t.color;
            tileEls.forEach((x) => x.classList.remove('hint'));
            b++;
            cur();
            testMark();
            if (b === blanks.length) api.ok(null, r.after);
          } else if (api.no(el)) {
            const right = tileEls.find((x, j) => !x.classList.contains('used') && fits(tiles[j], r.slots[blanks[b]]));
            if (right) right.classList.add('hint');
          }
        };
        return el;
      });
      put(stage, question(r), promptBox(r), h('div.slots' + (r.slotClass ? '.' + r.slotClass : ''), slots), h('div.tiles', tileEls));
      cur();
      testMark();
    },
  });

  /* ---------- match: connect left items with right items (tap-tap or drag a line) ---------- */
  AG.type('match', {
    render(stage, r, api) {
      const n = r.left.length;
      const order = shuffle(AG.range(0, n - 1));
      const wrap = h('div.match');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'lines');
      const L = r.left.map((it, i) => h('button.mitem.left', { data: { i } }, item(it), h('span.dot')));
      const R = order.map((j) => h('button.mitem.right', { data: { j } }, h('span.dot'), item(r.right[j])));
      wrap.append(h('div.col', L), h('div.col', R), svg);
      put(stage, question(r), wrap);
      const done = [];
      let sel = null, temp = null;
      const center = (el) => {
        const d = el.querySelector('.dot').getBoundingClientRect();
        const w = wrap.getBoundingClientRect();
        return [d.left + d.width / 2 - w.left, d.top + d.height / 2 - w.top];
      };
      const line = (a, b, cls) => {
        const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        l.setAttribute('x1', a[0]); l.setAttribute('y1', a[1]); l.setAttribute('x2', b[0]); l.setAttribute('y2', b[1]);
        l.setAttribute('class', cls || '');
        svg.append(l);
        return l;
      };
      const redraw = () => {
        if (!wrap.isConnected) return window.removeEventListener('resize', redraw);
        svg.innerHTML = '';
        done.forEach(([i, j]) => line(center(L[i]), center(R[order.indexOf(j)]), 'ok'));
      };
      window.addEventListener('resize', redraw);
      const select = (el) => {
        [...L, ...R].forEach((x) => x.classList.remove('sel'));
        sel = el;
        if (el) el.classList.add('sel');
      };
      const attempt = (le, re) => {
        const i = +le.dataset.i, j = +re.dataset.j;
        select(null);
        if (i === j) {
          le.classList.add('got'); re.classList.add('got');
          done.push([i, j]);
          redraw();
          if (done.length === n) api.ok(null, r.after);
        } else if (api.no(re)) R[order.indexOf(i)].classList.add('hint');
      };
      const tapped = (el) => {
        if (api.solved || el.classList.contains('got')) return;
        const isL = el.classList.contains('left');
        if (sel && sel.classList.contains('left') !== isL) return attempt(isL ? el : sel, isL ? sel : el);
        select(el);
      };
      [...L, ...R].forEach((el) => {
        el.addEventListener('click', () => tapped(el));
        el.addEventListener('pointerdown', (e) => {
          if (api.solved || el.classList.contains('got')) return;
          const start = center(el);
          const move = (ev) => {
            const w = wrap.getBoundingClientRect();
            const pt = [ev.clientX - w.left, ev.clientY - w.top];
            if (!temp && Math.hypot(pt[0] - start[0], pt[1] - start[1]) > 25) temp = line(start, start, 'temp');
            if (temp) { temp.setAttribute('x2', pt[0]); temp.setAttribute('y2', pt[1]); }
          };
          const up = (ev) => {
            document.removeEventListener('pointermove', move);
            document.removeEventListener('pointerup', up);
            if (!temp) return;
            temp.remove(); temp = null;
            const target = document.elementFromPoint(ev.clientX, ev.clientY);
            const other = target && target.closest('.mitem');
            if (other && other !== el && other.classList.contains('left') !== el.classList.contains('left') && !other.classList.contains('got')) {
              const isL = el.classList.contains('left');
              attempt(isL ? el : other, isL ? other : el);
            }
            el.dataset.dragged = '1';
            setTimeout(() => delete el.dataset.dragged, 50);
          };
          document.addEventListener('pointermove', move);
          document.addEventListener('pointerup', up);
          e.preventDefault();
        });
      });
      wrap.addEventListener('click', (e) => { const m = e.target.closest('.mitem'); if (m && m.dataset.dragged) e.stopImmediatePropagation(); }, true);
      if (AG.test) L.forEach((el, i) => (el.dataset.pair = order.indexOf(i)));
    },
  });

  /* ---------- trace: write with the finger following the real pen movement ----------
     Shows the school writing lines, a green start dot, arrows for the next part of the path
     and a ▶ demo of how the letter is written. Progress is checked in order, so the child has to
     start at the dot and follow the direction of the arrows — exactly like on paper. */
  AG.type('trace', {
    render(stage, r, api) {
      const H = AG.hand;
      const lay = H.layout(r.glyph);
      const smp = H.sample(lay.strokes, 2);
      const P = smp.pts, N = P.length;
      const box = h('div.trace');
      const cv = h('canvas');
      box.append(cv);
      const demoBtn = h('button.pill', { onclick: () => demo() }, icon('play'), ' Mira');
      put(stage, box, h('div.tools', demoBtn));
      const css = getComputedStyle(document.documentElement);
      const accent = css.getPropertyValue('--accent').trim() || '#5865F2';
      const TOL = 11, WIN = 14;
      let ctx, W, Hh, T, k = 0, ink = [], curInk = null, anim = null, done = false, flash = 0;
      const visited = new Uint8Array(N);

      const toUnits = (e) => {
        const b = cv.getBoundingClientRect();
        return [(e.clientX - b.left - T.ox) / T.k, (e.clientY - b.top - T.oy) / T.k];
      };
      function setup() {
        if (!box.isConnected) return;
        const rect = box.getBoundingClientRect();
        W = rect.width; Hh = rect.height;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr);
        ctx = cv.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        T = H.fit(lay, W, Hh);
        draw();
      }
      function polyline(from, to, color, width) {
        ctx.save();
        ctx.strokeStyle = color; ctx.lineWidth = width * T.k; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath();
        for (let i = from; i <= Math.min(to, N - 1); i++) {
          const [x, y] = H.tx(T, P[i].x, P[i].y);
          if (i === from || P[i].s !== P[i - 1].s) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          if (P[i].dot) { ctx.lineTo(x + 0.1, y); }
        }
        ctx.stroke();
        ctx.restore();
      }
      function draw(demoUpTo) {
        if (!ctx) return;
        ctx.clearRect(0, 0, W, Hh);
        H.guide(ctx, T, W);
        H.road(ctx, lay, T, '#EEEAFB', 13);
        if (k > 0) polyline(0, k, '#C9EEDB', 13);
        ctx.save(); ctx.setLineDash([3, 6]); H.road(ctx, lay, T, '#AFA6CF', 1.4); ctx.restore();
        // child's ink
        ctx.save();
        ctx.strokeStyle = accent; ctx.lineWidth = Math.max(8, 6 * T.k); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ink.forEach((s) => {
          ctx.beginPath();
          s.forEach(([x, y], i) => { const q = H.tx(T, x, y); i ? ctx.lineTo(...q) : ctx.moveTo(...q); });
          if (s.length === 1) { const q = H.tx(T, s[0][0], s[0][1]); ctx.lineTo(q[0] + 0.1, q[1]); }
          ctx.stroke();
        });
        ctx.restore();
        if (demoUpTo != null) {
          polyline(0, demoUpTo, '#FF8A3D', 6);
          const p = P[Math.min(demoUpTo, N - 1)];
          H.badge(ctx, T, p, null, '#FF8A3D', 5);
          return;
        }
        if (done) { polyline(0, N - 1, '#1FA36B', 3); return; }
        // guidance: start of the current stroke, arrows for the next part
        const starting = k === 0 || smp.starts.includes(k) || smp.starts.includes(k + 1);
        const at = smp.starts.includes(k + 1) ? k + 1 : k;
        // arrows only up to the next sharp turn (so up-and-down retraces don't overlap)
        let end = at;
        while (end < Math.min(N - 1, at + 45) && P[end + 1].s === P[at].s) {
          let da = Math.abs(P[end + 1].a - P[end].a);
          if (da > Math.PI) da = 2 * Math.PI - da;
          if (end > at + 2 && da > 2.2) break;
          end++;
        }
        H.arrows(ctx, smp, T, at, end + 1, accent, 18);
        const strokeNo = smp.starts.filter((s) => s <= at).length;
        if (starting) H.badge(ctx, T, P[at], smp.starts.length > 1 ? strokeNo : null, '#1FA36B', flash ? 9 : 6.5);
        else H.badge(ctx, T, P[at], null, 'rgba(31,163,107,.85)', 4.5);
      }
      function advance(u) {
        let best = -1, bd = 1e9;
        // at the start of a stroke the child must begin near its start; elsewhere allow small gaps
        const atStart = (k === 0 && !visited[0]) || smp.starts.includes(k + 1);
        const lim = Math.min(N - 1, k + (atStart ? 7 : WIN));
        for (let j = k; j <= lim; j++) {
          const d = Math.hypot(P[j].x - u[0], P[j].y - u[1]);
          if (d <= bd) { bd = d; best = j; }
        }
        const tol = P[best] && P[best].dot ? TOL * 1.4 : TOL;
        if (best >= 0 && bd < tol && best >= k) {
          for (let j = k; j <= best; j++) visited[j] = 1;
          k = best;
          if (k >= N - 4) { k = N - 1; return true; }
          // a dot (like the dot of the i) is done with one tap: jump past it
          if (P[k].dot && k < N - 1) k++;
        }
        return false;
      }
      function finishOk() {
        done = true;
        draw();
        api.ok(box, r.after);
      }
      function demo() {
        if (anim) cancelAnimationFrame(anim);
        let j = 0, pause = 0;
        const stepF = () => {
          if (!box.isConnected) return;
          if (pause > 0) pause--;
          else {
            j += 1.4;
            const ji = Math.floor(j);
            if (ji < N - 1 && P[ji + 1] && P[ji + 1].s !== P[ji].s) pause = 18;
          }
          draw(Math.floor(j));
          if (j < N - 1) anim = requestAnimationFrame(stepF);
          else { anim = null; setTimeout(() => !anim && draw(), 700); }
        };
        anim = requestAnimationFrame(stepF);
      }
      cv.addEventListener('pointerdown', (e) => {
        if (done || curInk || !ctx) return;
        if (anim) { cancelAnimationFrame(anim); anim = null; }
        cv.setPointerCapture(e.pointerId);
        const u = toUnits(e);
        curInk = { id: e.pointerId, pts: [u], k0: k, far: 0 };
        ink.push(curInk.pts);
        if (advance(u)) return finishOk();
        draw();
      });
      cv.addEventListener('pointermove', (e) => {
        if (!curInk || e.pointerId !== curInk.id) return;
        const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
        for (const ev of evs) {
          const u = toUnits(ev);
          curInk.pts.push(u);
          if (advance(u)) { curInk = null; return finishOk(); }
        }
        draw();
      });
      const end = (e) => {
        if (!curInk || e.pointerId !== curInk.id) return;
        const moved = curInk.pts.length;
        const progressed = k > curInk.k0;
        curInk = null;
        if (!progressed && moved > 6) {
          api.no(box);
          api.message('● Empieza en el punto verde y sigue las flechas');
          ink.pop();
          flash = 1;
          setTimeout(() => { flash = 0; draw(); }, 900);
        }
        draw();
      };
      cv.addEventListener('pointerup', end);
      cv.addEventListener('pointercancel', end);
      const onResize = () => {
        if (!box.isConnected) return window.removeEventListener('resize', onResize);
        setup();
      };
      window.addEventListener('resize', onResize);
      if (AG.test) box.dataset.test = 'trace';
      AG._trace = {
        P, starts: smp.starts, finish: () => !done && finishOk(), progress: () => k,
        screen: (x, y) => { const b = cv.getBoundingClientRect(); const q = H.tx(T, x, y); return [b.left + q[0], b.top + q[1]]; },
      };
      requestAnimationFrame(() => {
        setup();
        if (r.demo !== false) setTimeout(() => box.isConnected && !ink.length && demo(), 400);
      });
    },
  });
})();
