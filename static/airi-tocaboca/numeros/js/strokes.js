/* Handwriting model for tracing: joined cursive lowercase (letra ligada), simple capitals and digits.
   Units (y grows down, like SVG): ascender line y=0, x-height line y=50, baseline y=100, descender line y=150.
   Lowercase letters: `s` = where the letter body starts; an entry stroke from the previous letter
   (or from the baseline for the first letter) is added automatically, so letters join into words.
   Every lowercase body ends at x=w on the baseline (y=90, exit 'low') or at the x-height (y=55, exit 'high'). */
(function () {
  'use strict';
  const AG = (window.AG = window.AG || {});

  const LOW = {
    a: { w: 54, s: [36, 54], d: 'M 36 54 C 30 47, 14 50, 10 67 C 7 85, 17 100, 27 98 C 35 96, 39 84, 40 66 L 40 52 L 40 88 C 40 97, 47 99, 54 90' },
    e: { w: 46, s: [4, 82], d: 'M 4 82 C 18 78, 34 70, 34 59 C 34 49, 24 47, 18 52 C 10 59, 9 78, 13 89 C 18 100, 33 100, 46 90' },
    i: { w: 30, s: [14, 52], d: 'M 14 52 C 14 64, 13 79, 14 88 C 15 98, 24 99, 30 90', late: ['M 14.5 32 L 14.6 32.1'] },
    o: { w: 56, s: [34, 53], exit: 'high', d: 'M 34 53 C 26 47, 12 52, 10 68 C 8 86, 18 100, 28 99 C 38 98, 43 84, 41 68 C 40 58, 37 52, 32 54 C 38 59, 47 58, 56 55' },
    u: { w: 54, s: [11, 52], d: 'M 11 52 C 11 66, 9 83, 13 92 C 17 100, 29 100, 35 92 C 39 85, 40 68, 40 52 L 40 88 C 40 97, 47 99, 54 90' },
    p: { w: 54, s: [13, 52], d: 'M 13 52 L 13 146 L 13 64 C 19 53, 28 48, 36 51 C 46 56, 47 83, 38 94 C 31 101, 20 100, 14 94 C 22 99, 40 98, 54 90' },
    m: { w: 74, s: [10, 52], d: 'M 10 52 L 10 99 L 10 70 C 13 56, 19 50, 25 50 C 32 50, 35 58, 35 68 L 35 99 L 35 70 C 38 56, 44 50, 50 50 C 57 50, 60 58, 60 68 L 60 88 C 60 97, 67 99, 74 90' },
    n: { w: 54, s: [10, 52], d: 'M 10 52 L 10 99 L 10 70 C 14 56, 21 50, 28 50 C 36 50, 39 58, 39 68 L 39 88 C 39 97, 46 99, 54 90' },
    l: { w: 42, s: [4, 84], d: 'M 4 84 C 16 72, 30 42, 30 17 C 30 5, 24 0, 20 2 C 14 6, 14 32, 15 62 C 15 80, 15 97, 26 98 C 32 98, 37 95, 42 90' },
    s: { w: 48, s: [24, 50], d: 'M 24 50 C 29 60, 38 70, 38 81 C 38 94, 27 100, 19 98 C 13 97, 10 93, 12 88 C 18 97, 34 98, 48 90' },
    t: { w: 34, s: [17, 12], d: 'M 17 12 L 16 88 C 16 97, 24 99, 34 90', late: ['M 4 50 L 32 50'] },
    d: { w: 56, s: [36, 54], d: 'M 36 54 C 30 47, 14 50, 10 67 C 7 85, 17 100, 27 98 C 35 96, 39 84, 40 66 L 42 0 L 42 88 C 42 97, 49 99, 56 90' },
    f: { w: 50, s: [4, 84], d: 'M 4 84 C 16 72, 30 42, 30 17 C 30 5, 24 0, 20 2 C 14 6, 15 32, 16 62 L 16 138 C 16 151, 30 151, 30 137 C 30 120, 23 106, 17 97 C 26 99, 38 96, 50 90' },
  };

  const UP = {
    A: { w: 62, strokes: ['M 4 100 L 31 0 L 58 100', 'M 15 62 L 47 62'] },
    E: { w: 48, strokes: ['M 8 0 L 8 100', 'M 8 0 L 46 0', 'M 8 50 L 40 50', 'M 8 100 L 46 100'] },
    I: { w: 20, strokes: ['M 10 0 L 10 100'] },
    O: { w: 70, strokes: ['M 36 0 C 14 0, 4 24, 4 50 C 4 78, 16 100, 36 100 C 56 100, 66 78, 66 50 C 66 24, 56 0, 36 0'] },
    U: { w: 62, strokes: ['M 8 0 L 8 64 C 8 88, 18 100, 31 100 C 44 100, 54 88, 54 64 L 54 0'] },
    P: { w: 54, strokes: ['M 8 0 L 8 100', 'M 8 0 C 38 0, 50 8, 50 27 C 50 46, 38 54, 8 54'] },
    M: { w: 72, strokes: ['M 6 100 L 6 0 L 36 64 L 66 0 L 66 100'] },
    L: { w: 46, strokes: ['M 8 0 L 8 100 L 44 100'] },
    S: { w: 52, strokes: ['M 46 14 C 40 3, 30 0, 25 0 C 12 0, 6 10, 6 22 C 6 40, 46 48, 46 72 C 46 92, 34 100, 24 100 C 14 100, 6 95, 3 86'] },
    T: { w: 56, strokes: ['M 4 0 L 52 0', 'M 28 0 L 28 100'] },
    D: { w: 60, strokes: ['M 8 0 L 8 100', 'M 8 0 C 46 0, 56 26, 56 50 C 56 76, 46 100, 8 100'] },
    N: { w: 60, strokes: ['M 7 100 L 7 0 L 53 100 L 53 0'] },
    F: { w: 46, strokes: ['M 8 0 L 8 100', 'M 8 0 L 44 0', 'M 8 50 L 38 50'] },
  };

  const DIG = {
    0: { w: 56, strokes: ['M 28 0 C 10 0, 4 26, 4 50 C 4 76, 12 100, 28 100 C 44 100, 52 76, 52 50 C 52 26, 46 0, 28 0'] },
    1: { w: 40, strokes: ['M 8 24 L 30 0 L 30 100'] },
    2: { w: 54, strokes: ['M 6 24 C 8 8, 18 0, 28 0 C 41 0, 50 9, 50 23 C 50 44, 26 66, 4 100 L 52 100'] },
    3: { w: 54, strokes: ['M 7 12 C 14 4, 22 0, 29 0 C 42 0, 50 9, 49 22 C 48 37, 37 46, 24 47 C 41 47, 52 58, 52 73 C 52 91, 40 100, 27 100 C 17 100, 9 95, 5 88'] },
    4: { w: 56, strokes: ['M 36 0 L 3 68 L 54 68', 'M 41 30 L 41 100'] },
    5: { w: 54, strokes: ['M 12 0 L 8 45 C 18 37, 40 35, 50 52 C 57 68, 50 100, 26 100 C 16 100, 8 95, 4 88', 'M 12 0 L 48 0'] },
    6: { w: 54, strokes: ['M 46 8 C 40 2, 33 0, 28 0 C 12 2, 4 30, 4 60 C 4 86, 15 100, 29 100 C 44 100, 52 87, 52 70 C 52 54, 41 45, 29 45 C 17 45, 8 53, 5 64'] },
    7: { w: 54, strokes: ['M 4 0 L 52 0 L 20 100'] },
    8: { w: 54, strokes: ['M 47 18 C 47 6, 38 0, 27 0 C 16 0, 8 7, 8 19 C 8 33, 21 40, 27 47 C 38 55, 51 62, 51 78 C 51 92, 40 100, 27 100 C 14 100, 3 92, 3 78 C 3 62, 16 55, 27 47 C 35 40, 47 32, 47 18'] },
    9: { w: 54, strokes: ['M 48 20 C 46 7, 37 0, 27 0 C 13 0, 5 10, 5 24 C 5 39, 15 48, 27 48 C 40 48, 48 38, 48 22 L 46 100'] },
  };

  /* ---- tiny SVG-path parser (M, L, C only; absolute) → list of cubic segments ---- */
  function parse(d, dx = 0, start = null) {
    const tok = d.match(/[MLC]|-?\d*\.?\d+/g);
    const segs = [];
    let cmd = null, cur = start, i = 0;
    const num = () => +tok[i++];
    while (i < tok.length) {
      if (/[MLC]/.test(tok[i])) cmd = tok[i++];
      if (cmd === 'M') { cur = [num() + dx, num()]; cmd = 'L'; if (!segs.length && !start) segs.start = cur; continue; }
      if (cmd === 'L') {
        const p = [num() + dx, num()];
        segs.push([cur, lerp(cur, p, 1 / 3), lerp(cur, p, 2 / 3), p]);
        cur = p;
      } else if (cmd === 'C') {
        const c1 = [num() + dx, num()], c2 = [num() + dx, num()], p = [num() + dx, num()];
        segs.push([cur, c1, c2, p]);
        cur = p;
      }
    }
    return segs;
  }
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const bez = (s, t) => {
    const u = 1 - t;
    return [0, 1].map((k) => u * u * u * s[0][k] + 3 * u * u * t * s[1][k] + 3 * u * t * t * s[2][k] + t * t * t * s[3][k]);
  };

  function entry(x0, yin, sx, sy) {
    if (yin < 70) return `C ${x0 + sx * 0.4} ${yin} ${x0 + sx * 0.75} ${sy} ${x0 + sx} ${sy}`;
    return `C ${x0 + sx * 0.45} ${yin - 0.08 * (yin - sy)} ${x0 + sx * 0.9} ${sy + 0.4 * (yin - sy)} ${x0 + sx} ${sy}`;
  }

  /* text → strokes (each stroke = list of cubic segments), in drawing order */
  function layout(text) {
    const strokes = [], late = [];
    let x = 0, cur = null, prevExit = null;
    for (const ch of text) {
      if (ch === ' ') { x += 26; cur = null; prevExit = null; continue; }
      const L = LOW[ch];
      if (L) {
        const yin = prevExit === 'high' ? 55 : 90;
        const body = L.d.replace(/^M\s*-?[\d.]+[\s,]+-?[\d.]+/, '');
        // entry + body in letter-local coordinates, shifted right by x
        const fixed = parse(entry(0, yin, L.s[0], L.s[1]) + ' ' + body, x, [x, yin]);
        if (cur && prevExit) cur.push(...fixed);
        else { cur = fixed; strokes.push(cur); }
        (L.late || []).forEach((d) => late.push(parse(d, x)));
        x += L.w;
        prevExit = L.exit || 'low';
        continue;
      }
      const U = UP[ch] || DIG[ch];
      if (U) {
        if (cur) x += 6;
        cur = null; prevExit = null;
        U.strokes.forEach((d) => strokes.push(parse(d, x)));
        x += U.w + 8;
      }
    }
    strokes.push(...late);
    let minY = 0, maxY = 100;
    strokes.forEach((s) => s.forEach((g) => g.forEach((p) => { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); })));
    return { strokes, w: x, minY, maxY };
  }

  /* resample strokes every `step` units → points with direction; dots become single points */
  function sample(strokes, step = 2) {
    const pts = [], starts = [];
    strokes.forEach((segs, si) => {
      const fine = [];
      segs.forEach((s) => { for (let k = 0; k <= 40; k++) fine.push(bez(s, k / 40)); });
      let len = 0;
      for (let k = 1; k < fine.length; k++) len += Math.hypot(fine[k][0] - fine[k - 1][0], fine[k][1] - fine[k - 1][1]);
      starts.push(pts.length);
      if (len < 3) { pts.push({ x: fine[0][0], y: fine[0][1], a: 0, s: si, dot: true }); return; }
      let acc = 0, next = 0;
      for (let k = 1; k < fine.length; k++) {
        const a = fine[k - 1], b = fine[k];
        const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
        while (next <= acc + d && d > 0) {
          const t = (next - acc) / d;
          pts.push({ x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, a: Math.atan2(b[1] - a[1], b[0] - a[0]), s: si });
          next += step;
        }
        acc += d;
      }
      const last = fine[fine.length - 1], prev = fine[fine.length - 2], q = pts[pts.length - 1];
      if (Math.hypot(q.x - last[0], q.y - last[1]) > 0.6) pts.push({ x: last[0], y: last[1], a: Math.atan2(last[1] - prev[1], last[0] - prev[0]), s: si });
    });
    return { pts, starts };
  }

  /* can every character be traced? */
  const can = (text) => [...text].every((ch) => ch === ' ' || LOW[ch] || UP[ch] || DIG[ch]);

  /* ---- drawing helpers (canvas 2D) ---- */
  // fit the used part of the writing guide (x-height band always included) and the text width into W×H
  function fit(lay, W, H) {
    const top = Math.min(lay.minY, 50) - 16, bottom = Math.max(lay.maxY, 100) + 16;
    const k = Math.min((W * 0.9) / (lay.w + 16), (H * 0.94) / (bottom - top));
    return { k, ox: (W - lay.w * k) / 2, oy: (H - (bottom - top) * k) / 2 - top * k };
  }
  const tx = (T, x, y) => [T.ox + x * T.k, T.oy + y * T.k];
  function pathOf(ctx, segs, T) {
    ctx.beginPath();
    segs.forEach((s, i) => {
      if (!i) ctx.moveTo(...tx(T, ...s[0]));
      ctx.bezierCurveTo(...tx(T, ...s[1]), ...tx(T, ...s[2]), ...tx(T, ...s[3]));
    });
  }
  function guide(ctx, T, W) {
    // school "pauta": x-height band, baseline strong, other lines light
    const [, y0] = tx(T, 0, 0), [, y1] = tx(T, 0, 50), [, y2] = tx(T, 0, 100), [, y3] = tx(T, 0, 150);
    ctx.fillStyle = 'rgba(88,101,242,0.045)';
    ctx.fillRect(0, y1, W, y2 - y1);
    const line = (y, color, w, dash) => {
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(dash || []);
      ctx.beginPath(); ctx.moveTo(W * 0.03, y); ctx.lineTo(W * 0.97, y); ctx.stroke(); ctx.restore();
    };
    line(y0, '#E6DCCB', 1.5, [6, 8]);
    line(y1, '#C9BEDF', 2, [10, 8]);
    line(y2, '#9C8FC4', 3);
    line(y3, '#E6DCCB', 1.5, [6, 8]);
  }
  function road(ctx, lay, T, color, width) {
    ctx.save();
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width * T.k; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    lay.strokes.forEach((s) => { pathOf(ctx, s, T); ctx.stroke(); });
    ctx.restore();
  }
  function arrow(ctx, T, p, size, color) {
    const [x, y] = tx(T, p.x, p.y);
    const r = size * T.k;
    ctx.save(); ctx.translate(x, y); ctx.rotate(p.a);
    ctx.fillStyle = color; ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.5, r * 0.25); ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(r * 0.9, 0); ctx.lineTo(-r * 0.6, -r * 0.75); ctx.lineTo(-r * 0.25, 0); ctx.lineTo(-r * 0.6, r * 0.75); ctx.closePath();
    ctx.stroke(); ctx.fill(); ctx.restore();
  }
  // arrows along sampled points between indices [from, to), every `every` units
  function arrows(ctx, smp, T, from, to, color, every = 24, step = 2) {
    const n = Math.round(every / step);
    for (let i = from + Math.round(n * 0.6); i < Math.min(to, smp.pts.length - 2); i += n) {
      const p = smp.pts[i];
      if (p.dot) continue;
      if (smp.starts.includes(i + 1) || smp.starts.includes(i)) continue;
      arrow(ctx, T, p, 5.5, color);
    }
  }
  function badge(ctx, T, p, label, color, rUnits = 7) {
    const [x, y] = tx(T, p.x, p.y);
    const r = Math.max(11, rUnits * T.k);
    ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (label != null) {
      ctx.fillStyle = '#fff'; ctx.font = `700 ${Math.round(r * 1.2)}px Andika, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(label), x, y + r * 0.08);
    }
    ctx.restore();
  }

  AG.hand = { LOW, UP, DIG, layout, sample, can, parse, bez, fit, tx, pathOf, guide, road, arrow, arrows, badge };
})();
