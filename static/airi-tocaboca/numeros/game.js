/* Game: NÚMEROS — maths book, Unidad 1 «Números hasta 10», fichas 3–6 (pages 10–17) + extra sums. */
(function () {
  'use strict';
  const { pick, shuffle, sample, deal, range, NUM } = AG;

  const OBJ = ['🍎', '🐞', '⭐', '🚗', '🌼', '🐟', '🧸', '🍪', '🎈', '🐥'];
  const set = (n, emoji = pick(OBJ), layout = pick(['rows', 'scatter', 'rows', 'frame']), extra = {}) => ({ count: Object.assign({ n, emoji, layout }, extra) });
  const nums = (ans, pool, k = 3) => {
    const o = shuffle([ans, ...sample(pool.filter((x) => x !== ans), k - 1)]);
    return { options: o.map((x) => ({ num: x })), answer: o.indexOf(ans) };
  };
  const near = (n, lo = 0, hi = 10) => range(Math.max(lo, n - 3), Math.min(hi, n + 3));
  const two = (lo, hi, minGap = 1, maxGap = 10) => {
    for (;;) {
      const a = lo + AG.rand(hi - lo + 1), b = lo + AG.rand(hi - lo + 1);
      const d = Math.abs(a - b);
      if (d >= minGap && d <= maxGap) return [a, b];
    }
  };

  /* Kazakh notes per activity: [line on the tile, longer tip] */
  const KK = {
    aprende: ['Сандарды бірге атау', ['Әр карточкадағы санды испанша бірге айтыңыз: cero, uno, dos…', 'Рамкадағы алмаларды бірге санаңыз: 5 — бір толық қатар.']],
    traza: ['Цифрды бағытпен жазу', ['Жасыл нүктеден бастап, көк бағыттамалар бойымен саусақпен жүргізеді.', '«▶ Mira» — цифр қалай жазылатынын көрсетеді. Дәптерде де дәл осы бағытпен жазады.']],
    cuenta: ['Санап, санды табу', ['Заттарды бір-бірлеп басып санайды — әрқайсысында нөмір шығады. Бірге испанша санаңыз. Соңғы сан — жауап.']],
    raton: ['Тышқан мен ірімшік', ['Кітаптағы «une con flechas»: тышқандағы санды сонша ірімшігі бар топпен қосу.', 'Алдымен солдағыны, сосын оңдағыны басыңыз — немесе саусақпен сызық сызыңыз.']],
    palabra: ['Сөзді оқып, цифрды табу', ['Сан сөзбен жазылған (tres) — цифрын (3) табу. Сөзді бірге оқыңыз.']],
    numpal: ['Цифр мен сөзді қосу', ['Цифрды оның сөзімен сызықпен қосу: 3 — tres, 7 — siete.']],
    mascotas: ['Үй жануарларын санау', ['¿Cuántos gatos hay? — «Неше мысық бар?» Тек сұралған жануарларды санайды.', 'Жауаптар сөзбен жазылған — оқуға көмектесіңіз. Кітаптағы «Las mascotas de Blanca».']],
    escribe: ['Санды сөзбен жазу', ['Санның атауын әріптермен құрау: 3 → t-r-e-s.']],
    serie: ['Сан қатарын толтыру', ['Бос орындарға жетпейтін сандарды қою: 0, 1, 2, 3, 4…', 'Қатарды басынан бастап бірге дауыстап санаңыз.']],
    atras: ['Кері санау', ['Сандар кемиді: 5, 4, 3, 2, 1, 0. Бірге кері санаңыз.']],
    fresas: ['Тәрелкедегі құлпынай', ['Тәрелкеде неше құлпынай бар? Бос тәрелке — 0 (cero).', 'Кітаптағы 11-беттегі тапсырма.']],
    cohete: ['Зымыран: кері санау', ['Сандарды үлкеннен 0-ге дейін ретімен басу. Соңында — «¡Despegue!» (ұшты!).']],
    mas: ['Қай жерде көп?', ['Екі топты салыстырып, көп (más) жерді басу.', 'Қиын болса: заттарды жұп-жұбымен саусақпен қосыңыз — жұбы жоқ қалған топ көп.']],
    menos: ['Қай жерде аз?', ['Екі топты салыстырып, аз (menos) жерді басу.']],
    compara: ['más que / menos que / tantos como', ['Екі топты санап, сөзді таңдау: көп — más que, аз — menos que, бірдей — tantos como.', 'Заттарды басса — нөмірленеді. Соңында толық сөйлем шығады — бірге оқыңыз.']],
    mayor: ['Үлкен сан (mayor)', ['Екі санның үлкенін табу. Сан түзуінде оң жақтағы сан үлкен.']],
    menor: ['Кіші сан (menor)', ['Екі санның кішісін табу.']],
    mayores: ['Берілген саннан үлкендер', ['Берілген саннан үлкен сандардың бәрін табу. Мысалы, 5-тен үлкен: 6, 7, 8, 9, 10.', 'Кітаптағы 15-беттегі доптар тапсырмасы.']],
    asc: ['Кішіден үлкенге', ['Сандарды кішіден үлкенге қою: 3, 7, 10. Тышқан — кіші, піл — үлкен.']],
    desc: ['Үлкеннен кішіге', ['Сандарды үлкеннен кішіге қою: 9, 8, 5.']],
    suma: ['Суреттермен қосу', ['Екі топты бірге санау — барлығы нешеу? Заттарды басса, санау жалғаса береді.', '«dos más tres son cinco» — екі қосу үш, бес.']],
    sumanum: ['Цифрлармен қосу', ['Цифрлармен қосу. Қиын болса, саусақпен немесе түймелермен санаңыз.']],
  };
  const A = (id, type, icon, title, es, make) => ({ id, type, icon, title, es, make, kkShort: KK[id][0], kk: KK[id][1] });

  /* ---------------- activities ---------------- */
  const aprende = () =>
    A('aprende', 'show', '📖', 'Aprende', 'Mira y cuenta.', () => [{
      cards: range(0, 10).map((n) => ({ count: { n, emoji: '🍎', layout: 'frame', tap: false }, num: n, text: NUM[n] })),
    }]);
  const traza = () =>
    A('traza', 'trace', '✍️', 'Traza', 'Empieza en el punto verde y sigue las flechas.', ({ n }) =>
      deal(range(0, 10), Math.min(Math.max(n, 4), 6)).map((d) => ({ glyph: String(d), after: `${d} · ${NUM[d]}` })));
  const cuenta = () =>
    A('cuenta', 'choose', '🔢', 'Cuenta', 'Cuenta y toca el número.', ({ n }) =>
      deal(range(1, 10), n).map((k) => ({ prompt: set(k), ...nums(k, near(k, 1)), after: `${k} · ${NUM[k]}` })));

  const raton = () =>
    A('raton', 'match', '🐭', 'Ratones y quesos', 'Une cada ratón con su queso.', ({ n }) =>
      range(1, Math.max(2, Math.round(n / 3))).map(() => {
        const ks = sample(range(1, 10), 5);
        return {
          left: ks.map((k) => ({ cls: 'mouse', row: [{ emoji: '🐭' }, { num: k }] })),
          right: ks.map((k) => ({ count: { n: k, emoji: '🧀', layout: 'rows', tap: false }, text: NUM[k], style: 'print' })),
        };
      }));
  const numpal = () =>
    A('numpal', 'match', '🔗', 'Número y palabra', 'Une cada número con su palabra.', ({ n }) =>
      range(1, Math.max(2, Math.round(n / 3))).map(() => {
        const ks = sample(range(0, 10), 5);
        return { left: ks.map((k) => ({ num: k })), right: ks.map((k) => ({ text: NUM[k] })) };
      }));
  const palabra = () =>
    A('palabra', 'choose', '🔤', 'Lee el número', 'Lee la palabra y toca el número.', ({ n }) =>
      deal(range(0, 10), n).map((k) => ({ prompt: { text: NUM[k] }, ...nums(k, range(0, 10)), after: `${NUM[k]} · ${k}` })));
  const PETS = [['🐱', 'gato', 'gatos'], ['🐟', 'pez', 'peces'], ['🐰', 'conejo', 'conejos'], ['🐦', 'pájaro', 'pájaros']];
  const mascotas = () =>
    A('mascotas', 'choose', '🐱', 'Las mascotas', 'Cuenta las mascotas de Blanca.', ({ n }) =>
      range(1, n).map(() => {
        const counts = sample(range(1, 6), 4);
        const ask = AG.rand(4);
        const k = counts[ask];
        const [emoji, sing, plur] = PETS[ask];
        const o = shuffle([k, ...sample(near(k, 1, 6).filter((x) => x !== k), 2)]);
        return {
          q: `¿Cuántos ${plur} hay? ${emoji}`,
          prompt: { cls: 'scene', row: PETS.map((p, i) => ({ count: { n: counts[i], emoji: p[0], layout: 'rows', per: 3 } })) },
          promptClass: 'scene',
          options: o.map((x) => ({ text: NUM[x] })), answer: o.indexOf(k), optClass: 'wide',
          after: k === 1 ? `Hay un ${sing}.` : `Hay ${NUM[k]} ${plur}.`,
        };
      }));
  const escribe = () =>
    A('escribe', 'build', '🔠', 'Escribe el número', 'Escribe el número con letras.', ({ n }) =>
      deal(range(0, 10), Math.min(n, 6)).map((k) => {
        const letters = [...NUM[k]];
        const extra = sample([...'aeioumnstdr'].filter((l) => !letters.includes(l)), 1);
        return { prompt: { num: k }, slots: letters.map((l) => ({ answer: l })), tiles: [...letters, ...extra], after: `${k} · ${NUM[k]}` };
      }));

  function series(dir) {
    return ({ n }) =>
      range(1, n).map(() => {
        const len = pick([5, 6]);
        const start = dir > 0 ? AG.rand(11 - len + 1) : len - 1 + AG.rand(11 - len + 1);
        const seq = range(0, len - 1).map((i) => start + dir * i);
        const blanks = sample(range(1, len - 1), pick([2, 3]));
        const missing = blanks.map((i) => seq[i]);
        const extra = sample(range(0, 10).filter((x) => !seq.includes(x)), 2);
        return {
          slots: seq.map((v, i) => (blanks.includes(i) ? { answer: v } : { fixed: v })),
          tiles: [...missing, ...extra], tileStyle: 'num', slotClass: 'nums',
          after: seq.join(', '),
        };
      });
  }
  const serie = () => A('serie', 'build', '➡️', 'Completa la serie', 'Completa la serie.', series(1));
  const atras = () => A('atras', 'build', '⬅️', 'Hacia atrás', 'Cuenta hacia atrás.', series(-1));
  const fresas = () =>
    A('fresas', 'choose', '🍓', 'Fresas', '¿Cuántas fresas hay en el plato?', ({ n }) =>
      deal([0, 0, 1, 2, 3, 4, 5, 6], n).map((k) => ({
        prompt: { count: { n: k, emoji: '🍓', layout: 'plate' } }, ...nums(k, range(0, 7)), after: k === 0 ? 'Cero: no hay fresas.' : `${k} · ${NUM[k]}`,
      })));
  const cohete = () =>
    A('cohete', 'build', '🚀', 'El cohete', 'Cuenta hacia atrás hasta cero.', () =>
      [pick([5, 6]), pick([7, 8, 9, 10])].map((k) => ({
        prompt: { emoji: '🚀' }, slots: range(0, k).map((i) => ({ answer: k - i })), tiles: range(0, k), tileStyle: 'num', slotClass: 'nums',
        after: '¡Despegue! 🚀',
      })));

  const CMP = ['🧁', '💂', '🦆', '🍎', '🌼', '⚽', '🐞'];
  const pairSets = (pickBig) =>
    ({ n }) =>
      range(1, n).map(() => {
        const [a, b] = two(1, 10, 1, 4);
        const e = pick(CMP);
        const o = [a, b];
        const ans = pickBig ? (a > b ? 0 : 1) : a < b ? 0 : 1;
        return { q: pickBig ? '¿Dónde hay más?' : '¿Dónde hay menos?', options: o.map((k) => set(k, e, 'rows', { tap: false })), answer: ans, optClass: 'sets', after: `${pickBig ? 'Más' : 'Menos'}: ${o[ans]} (${NUM[o[ans]]})` };
      });
  const mas = () => A('mas', 'choose', '⬆️', '¿Dónde hay más?', '¿Dónde hay más?', pairSets(true));
  const menos = () => A('menos', 'choose', '⬇️', '¿Dónde hay menos?', '¿Dónde hay menos?', pairSets(false));
  const NOUNS = [['🐶', 'perros', '🦴', 'huesos'], ['🐰', 'conejos', '🥕', 'zanahorias'], ['🐭', 'ratones', '🧀', 'quesos'], ['🐒', 'monos', '🍌', 'plátanos'], ['👦', 'niños', '🎈', 'globos']];
  const compara = () =>
    A('compara', 'choose', '⚖️', 'Más, menos, tantos', 'Más que, menos que o tantos como.', ({ n }) =>
      range(1, n).map(() => {
        const rel = pick(['más', 'menos', 'tantos']);
        let a, b;
        if (rel === 'tantos') a = b = 2 + AG.rand(8);
        else [a, b] = two(1, 9, 1, 3);
        if (rel === 'más' && a < b) [a, b] = [b, a];
        if (rel === 'menos' && a > b) [a, b] = [b, a];
        const [e1, n1, e2, n2] = pick(NOUNS);
        const labels = ['más que', 'menos que', 'tantos como'];
        return {
          prompt: { row: [{ count: { n: a, emoji: e1, layout: 'rows' } }, '?', { count: { n: b, emoji: e2, layout: 'rows' } }] },
          options: labels.map((t) => ({ text: t, style: 'print' })), answer: ['más', 'menos', 'tantos'].indexOf(rel), optClass: 'wide',
          after: rel === 'tantos' ? `Hay tantos ${n1} como ${n2}.` : `Hay ${rel} ${n1} que ${n2}.`,
        };
      }));

  const bigSmall = (big) =>
    ({ n }) =>
      range(1, n).map(() => {
        const [a, b] = two(0, 10, 1, 10);
        const ans = big ? (a > b ? 0 : 1) : a < b ? 0 : 1;
        const hi = Math.max(a, b), lo = Math.min(a, b);
        return {
          q: big ? 'Toca el número mayor.' : 'Toca el número menor.',
          options: [a, b].map((k) => ({ emoji: big ? '🐦' : '🐻', num: k })), answer: ans, optClass: 'sets',
          after: big ? `${hi} es mayor que ${lo}.` : `${lo} es menor que ${hi}.`,
        };
      });
  const mayor = () => A('mayor', 'choose', '🐦', 'El mayor', 'Toca el número mayor.', bigSmall(true));
  const menor = () => A('menor', 'choose', '🐻', 'El menor', 'Toca el número menor.', bigSmall(false));
  const mayores = () =>
    A('mayores', 'multi', '⚽', 'Mayores que…', 'Toca los números mayores.', ({ n }) =>
      range(1, Math.max(2, Math.round(n / 2))).map(() => {
        const t = pick([3, 4, 5, 5, 6]);
        const hi = sample(range(t + 1, 10), Math.min(4, 10 - t));
        const lo = sample(range(0, t), 8 - hi.length);
        const o = shuffle([...hi, ...lo]);
        return {
          q: `Toca los números mayores que ${t}.`,
          options: o.map((k) => ({ num: k, cls: 'ball' })), answers: hi.map((k) => o.indexOf(k)), optClass: 'balls',
          after: hi.slice().sort((x, y) => x - y).join(', '),
        };
      }));
  const order = (up) =>
    ({ n }) =>
      range(1, Math.max(3, Math.round(n / 2) + 1)).map((_, i) => {
        const k = i < 2 ? 3 : 4;
        const ns = sample(range(0, 10), k);
        const sorted = ns.slice().sort((x, y) => (up ? x - y : y - x));
        return {
          prompt: { row: up ? [{ emoji: '🐭' }, '→', { emoji: '🐘' }] : [{ emoji: '🐘' }, '→', { emoji: '🐭' }], cls: 'arrow' },
          slots: sorted.map((v) => ({ answer: v })), tiles: ns, tileStyle: 'num', slotClass: 'nums',
          after: sorted.join(up ? ' < ' : ' > '),
        };
      });
  const asc = () => A('asc', 'build', '📈', 'De menor a mayor', 'Ordena de menor a mayor.', order(true));
  const desc = () => A('desc', 'build', '📉', 'De mayor a menor', 'Ordena de mayor a menor.', order(false));

  const suma = () =>
    A('suma', 'choose', '➕', 'Suma con dibujos', '¿Cuántos hay en total?', ({ n }) =>
      range(1, n).map(() => {
        const a = 1 + AG.rand(5), b = 1 + AG.rand(Math.min(5, 10 - a));
        const e = pick(OBJ);
        const ctr = AG.counter();
        return {
          prompt: { row: [{ count: { n: a, emoji: e, layout: 'rows', counter: ctr } }, '+', { count: { n: b, emoji: e, layout: 'rows', counter: ctr } }, '=', '?'] },
          ...nums(a + b, near(a + b, 1)), after: `${a} + ${b} = ${a + b}`,
        };
      }));
  const sumanum = () =>
    A('sumanum', 'choose', '🧮', 'Suma con números', 'Suma.', ({ n }) =>
      range(1, n).map(() => {
        const a = 1 + AG.rand(6), b = 1 + AG.rand(Math.min(5, 10 - a));
        return { prompt: { row: [{ num: a }, '+', { num: b }, '=', '?'] }, ...nums(a + b, near(a + b, 1)), after: `${a} + ${b} = ${a + b}` };
      }));

  /* ---------------- lessons (book order) ---------------- */
  AG.game({
    id: 'numeros',
    title: 'Números',
    icon: '123',
    color: '#0E9F6E',
    color2: '#4FD1A1',
    kkTitle: 'Бұл ойын туралы (Números)',
    kk: [
      'Бұл ойын математика кітабының 1-бөлімі бойынша: «Números hasta 10», 10–17 беттер (Ficha 3–6). Әр сабақта кітаптың беті жазылған.',
      'Ойында дыбыс жоқ: сандарды өзіңіз испанша айтасыз. Заттарды басса, нөмірі шығады — бірге санаңыз: uno, dos, tres…',
      'Ойын өзі ауыспайды: «→» — келесі тапсырма, «↺» — қайта бастау.',
      '«Sumar» сабағы кітапта жоқ — күнделікті қосу жаттығуы үшін қосымша.',
    ],
    lessons: [
      {
        id: 'numeros', label: '0 – 10', labelStyle: 'print', title: 'Los números', page: '',
        kk: ['0-ден 10-ға дейінгі сандардың испанша атаулары: cero, uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez.',
          'Күнделікті өмірде испанша санаңыз: баспалдақ, қасық, ойыншық.',
          '«Traza» цифрды қалай жазу керегін көрсетеді (бағыттамалар) — кейін дәптерде дәл солай жазады.'],
        activities: () => [aprende(), cuenta(), traza()],
      },
      {
        id: 'f3', label: '3 · tres', labelStyle: 'print', title: 'Escribir números', page: 10,
        kk: ['Кітап, 10-бет (Ficha 3): тышқандардағы сандарды ірімшік топтарымен сызықпен қосу (une con flechas) және Бланканың үй жануарларын санап, санды сөзбен жазу.',
          'Ойындағы «Ratones y quesos» және «Las mascotas» — осы тапсырмалар. Ойыннан кейін кітаптағы бетті қарындашпен орындаңыз.'],
        activities: () => [raton(), palabra(), numpal(), mascotas(), escribe()],
      },
      {
        id: 'f4', label: '3 2 1 0', labelStyle: 'print', title: 'Contar hasta cero', page: 11,
        kk: ['Кітап, 11-бет (Ficha 4): нөлге дейін санау. 0 — «cero», яғни ештеңе жоқ (бос тәрелке).',
          'Кері санау: diez, nueve, ocho… cero — «зымыран ұшады» ойыны сияқты.'],
        activities: () => [serie(), atras(), fresas(), cohete()],
      },
      {
        id: 'f5', label: 'más · menos', labelStyle: 'print', title: 'Comparar', page: '12–13',
        kk: ['Кітап, 12–13 беттер (Ficha 5): салыстыру. **más** — көп, **menos** — аз, **tantos como** — бірдей.',
          'Екі топты санаңыз, сосын салыстырыңыз. Кеңес: заттарды жұп-жұбымен қосуға болады — жұбы жоқ қалған топ көп.',
          'Сөйлем үлгісі: «Hay más perros que huesos» — «Сүйектен ит көп».'],
        activities: () => [mas(), menos(), compara()],
      },
      {
        id: 'f6', label: '3 < 7', labelStyle: 'print', title: 'Ordenar números', page: '14–15',
        kk: ['Кітап, 14–15 беттер (Ficha 6): сандарды салыстыру және ретке келтіру. **mayor** — үлкен, **menor** — кіші.',
          'Сан түзуін көрсетіңіз (0–10): оңға қарай сандар үлкейеді.',
          '«De menor a mayor» — кішіден үлкенге; «de mayor a menor» — үлкеннен кішіге.'],
        activities: () => [mayor(), menor(), mayores(), asc(), desc()],
      },
      {
        id: 'sumas', label: '2 + 3', labelStyle: 'print', title: 'Sumar (extra)', page: '',
        kk: ['Кітапта жоқ — қосымша жаттығу (күнделікті қосу).',
          'Алдымен екі топты бірге санайды (заттарды басса — нөмірленеді), сосын жауапты таңдайды. «más» — қосу: dos más tres son cinco.'],
        activities: () => [suma(), sumanum()],
      },
    ],
  });
})();
