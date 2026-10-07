/* Game: LETRAS — book «lecto-1», pages 16–25 (P, M, L, review, S, T, D, N, F, review) + vowels.
   Data first (words, lessons), then generators that turn the data into activities. */
(function () {
  'use strict';
  const { pick, shuffle, sample, deal, range } = AG;

  /* word | article | syllables | picture file (default: word without accents) | flags (x = no picture games, a = skip in el/la) */
  const TABLE = `
avión|el|a-vión
árbol|el|ár-bol
abeja|la|a-be-ja
elefante|el|e-le-fan-te
estrella|la|es-tre-lla
escalera|la|es-ca-le-ra
isla|la|is-la
iglú|el|i-glú
imán|el|i-mán
oso|el|o-so
ojo|el|o-jo
oveja|la|o-ve-ja
uva|la|u-va
uno|el|u-no||a
uña|la|u-ña
pollito|el|po-lli-to
pelota|la|pe-lo-ta
piña|la|pi-ña
puerta|la|puer-ta
paraguas|el|pa-ra-guas
pato|el|pa-to
polo|el|po-lo
pera|la|pe-ra
pila|la|pi-la
puré|el|pu-ré
papá|el|pa-pá
pipa|la|pi-pa
pala|la|pa-la
pelo|el|pe-lo
puma|el|pu-ma
pie|el|pie
mapa|el|ma-pa
pomo|el|po-mo
mopa|la|mo-pa
mesa|la|me-sa
micrófono|el|mi-cró-fo-no
mariposa|la|ma-ri-po-sa
mono|el|mo-no
muñeca|la|mu-ñe-ca
mamá|la|ma-má
mano|la|ma-no
moto|la|mo-to
mula|la|mu-la
miel|la|miel
muela|la|mue-la
maleta|la|ma-le-ta
gato|el|ga-to
vaca|la|va-ca
loro|el|lo-ro
lupa|la|lu-pa
limón|el|li-món
lazo|el|la-zo
leona|la|le-o-na
lechuga|la|le-chu-ga
lápiz|el|lá-piz
libro|el|li-bro
luna|la|lu-na
lima|la|li-ma
ala|el|a-la||a
ola|la|o-la
lana|la|la-na
lobo|el|lo-bo
sobre|el|so-bre
seta|la|se-ta
saco|el|sa-co
silla|la|si-lla
suma|la|su-ma
sol|el|sol
sopa|la|so-pa
sofá|el|so-fá
piso|el|pi-so||x
peso|el|pe-so||x
sapo|el|sa-po
taza|la|ta-za
tubo|el|tu-bo
tenedor|el|te-ne-dor
tijeras|las|ti-je-ras
toalla|la|to-a-lla
lata|la|la-ta
tomate|el|to-ma-te
tapa|la|ta-pa
patata|la|pa-ta-ta
tortuga|la|tor-tu-ga
dado|el|da-do
dominó|el|do-mi-nó
ducha|la|du-cha
delantal|el|de-lan-tal
diana|la|dia-na
medusa|la|me-du-sa
media|la|me-dia
dátil|el|dá-til
soldado|la|sol-da-do||a
dedo|el|de-do
nido|el|ni-do
nudo|el|nu-do
moneda|la|mo-ne-da
dinosaurio|el|di-no-sau-rio
nuez|la|nuez
naranja|la|na-ran-ja
noria|la|no-ria
león|el|le-ón
pino|el|pi-no
nariz|la|na-riz
nata|la|na-ta
fecha|la|fe-cha|calendario
foto|la|fo-to
fideos|los|fi-de-os|fideo
faro|el|fa-ro
fuente|la|fuen-te
mofeta|la|mo-fe-ta
fila|la|fi-la
fantasma|el|fan-tas-ma
foca|la|fo-ca
teléfono|el|te-lé-fo-no
toldo|el|tol-do
osito|el|o-si-to
`;
  const W = {};
  const slug = (w) => w.replace(/ñ/g, 'ny').normalize('NFD').replace(/[̀-ͯ]/g, '');
  TABLE.trim().split('\n').forEach((line) => {
    const [w, art, syl, img, flags = ''] = line.trim().split('|');
    W[w] = { w, art, syl: syl.split('-'), img: img || slug(w), pic: !flags.includes('x'), artOk: !flags.includes('a') && /^(el|la)$/.test(art) };
  });
  const PICS = Object.keys(W).filter((w) => W[w].pic);
  const VOW = ['a', 'e', 'i', 'o', 'u'];
  const NAME = { a: 'a', e: 'e', i: 'i', o: 'o', u: 'u', p: 'pe', m: 'eme', l: 'ele', s: 'ese', t: 'te', d: 'de', n: 'ene', f: 'efe' };
  const SND = { p: '[п]', m: '[м]', l: '[л]', s: '[с]', t: '[т]', d: '[д]', n: '[н]', f: '[ф]' };
  const withArt = (w) => (W[w].art ? W[w].art + ' ' : '') + w;
  const first = (w) => AG.plain(w)[0];
  const cap = (s) => s[0].toUpperCase() + s.slice(1);

  /* ---------------- lessons (book order) ---------------- */
  const LESSONS = [
    { id: 'vocales', vowels: true, label: 'a e i o u', title: 'Las vocales', page: '',
      byVowel: { a: ['avión', 'árbol', 'abeja'], e: ['elefante', 'estrella', 'escalera'], i: ['isla', 'iglú', 'imán'], o: ['oso', 'ojo', 'oveja'], u: ['uva', 'uno', 'uña'] } },
    { id: 'p', c: 'p', page: 16,
      intro: ['pollito', 'pelota', 'piña', 'puerta', 'paraguas'],
      words: ['pato', 'polo', 'pera', 'pila', 'puré', 'papá', 'pipa', 'pala', 'pelo', 'puma', 'pie', 'mapa', 'pelota', 'pollito', 'piña', 'puerta', 'paraguas'],
      sent: ['Papá y Pepe.', 'Pepa y Pepe.'],
      kkExtra: ['Кітаптағы тапсырма: буынды таңдап, сөзді толықтыру — pato, polo, pera, pila, puré. Ойындағы «¿Cómo empieza?» дәл осы тапсырма.'] },
    { id: 'm', c: 'm', page: 17,
      intro: ['mesa', 'micrófono', 'mariposa', 'mono', 'muñeca'],
      words: ['mapa', 'pomo', 'mopa', 'mamá', 'mano', 'moto', 'mula', 'miel', 'muela', 'maleta', 'mesa', 'mono', 'muñeca', 'puma', 'mariposa'],
      sent: ['Mi mamá me mima.', 'Papá ama a mamá.'], extra: ['sonidos'],
      kkExtra: ['Кітаптағы тапсырмалар: буындарды қосу (ma + pa = mapa, po + mo = pomo, mo + pa = mopa) және жануар дыбыстары (gato — «miau», vaca — «mu»). Ойында: «Une las sílabas» және «¿Qué dice?».'] },
    { id: 'l', c: 'l', page: 18,
      intro: ['loro', 'lupa', 'limón', 'lazo', 'leona'],
      words: ['lechuga', 'lápiz', 'libro', 'luna', 'lima', 'ola', 'lana', 'lobo', 'pala', 'pelo', 'pila', 'polo', 'mula', 'miel', 'lupa', 'loro', 'limón', 'leona', 'maleta'],
      sent: ['Alma pela a Eloy.', 'Lalo lame el polo.'],
      kkExtra: ['Испан тілінде зат есімнің тегі бар: **el** — еркек тегі (көк), **la** — әйел тегі (қызғылт). Сөзді әрқашан артикльмен бірге айтыңыз: el libro, la lechuga. Кітапта: «Di sus nombres y escribe el o la delante» — ойындағы «¿El o la?».',
        'Кітаптағы M I P E L O әріптерінен «miel» сөзін құрау — ойындағы «Escribe la palabra».'] },
    { id: 'r1', review: ['p', 'm', 'l'], label: 'p m l', title: 'Repaso P M L', page: 19,
      intro: ['mula', 'puma', 'lupa', 'muela'],
      words: ['mula', 'puma', 'lupa', 'muela', 'pato', 'pera', 'pala', 'pelo', 'polo', 'mapa', 'mesa', 'mono', 'moto', 'mano', 'lima', 'luna', 'loro', 'lana', 'limón', 'pelota', 'maleta', 'miel', 'pie'],
      sent: ['Pamela olía la lila.', 'Mamá pela la lima.'],
      kkExtra: ['Қайталау сабағы: P, M, L. Жаңа әріп жоқ. Кітапта: lu + pa = lupa, mue + la = muela; сөйлем: «Pamela olía la lila».', 'Қате көп болса, сол әріптің сабағына оралыңыз — бұл қалыпты жағдай.'] },
    { id: 's', c: 's', page: 20,
      intro: ['sobre', 'seta', 'saco', 'silla', 'suma'],
      words: ['sol', 'sopa', 'sofá', 'oso', 'mesa', 'seta', 'silla', 'suma', 'saco', 'sobre', 'sapo', 'osito'],
      sent: ['Siu puso la mesa.', 'Sale el sol.'], extra: ['plural'],
      kkExtra: ['Көпше түр: **los** (еркек тегі), **las** (әйел тегі). Кітапта: los pies, las alas — ойындағы «¿Los o las?».'] },
    { id: 't', c: 't', page: 21,
      intro: ['taza', 'tubo', 'tenedor', 'tijeras', 'toalla'],
      words: ['lata', 'seta', 'pato', 'tomate', 'tapa', 'moto', 'patata', 'maleta', 'pelota', 'taza', 'tubo', 'toalla', 'tenedor', 'tortuga', 'foto'],
      sent: ['Mati toma tomate.', 'Tito tapa la lata.'],
      kkExtra: ['Кітаптағы тапсырма: буын қосу — la + ta = lata, se + ta = seta, pa + ta = pata.'] },
    { id: 'd', c: 'd', page: 22,
      intro: ['dado', 'dominó', 'ducha', 'delantal', 'diana'],
      words: ['dado', 'dedo', 'nido', 'nudo', 'moneda', 'medusa', 'media', 'dátil', 'dominó', 'ducha', 'diana', 'delantal', 'dinosaurio', 'soldado'],
      sent: ['La soldado saluda.', 'Dame el dado.'], extra: ['letras'],
      kkExtra: ['Испанша d жұмсақ айтылады, әсіресе сөз ортасында: dedo, nido.', 'Кітаптағы тапсырма: сөздегі әріптерді санау (MEDUSA — 6). Ойындағы «¿Cuántas letras?».'] },
    { id: 'n', c: 'n', page: 23,
      intro: ['nuez', 'naranja', 'noria', 'nido', 'nariz'],
      words: ['nido', 'nudo', 'nata', 'mono', 'pino', 'luna', 'lana', 'mano', 'león', 'moneda', 'nuez', 'naranja', 'noria', 'nariz'],
      sent: ['Antón está asustado.', 'Nina toma nata.'], extra: ['termina'],
      kkExtra: ['Кітаптағы тапсырма: «no» немесе «ón» буынымен толықтыру — mono, león, pino. Ойындағы «¿Cómo termina?».'] },
    { id: 'f', c: 'f', page: 24,
      intro: ['fecha', 'foto', 'fideos', 'faro', 'fuente'],
      words: ['foto', 'fideos', 'faro', 'fuente', 'mofeta', 'elefante', 'fila', 'fantasma', 'sofá', 'foca', 'fecha'],
      sent: ['Una fila de fantasmas.', 'Fátima mira la foto.'],
      kkExtra: ['F дыбысы: жоғарғы тіс астыңғы ерінге тиеді — қазақша «ф» сияқты.', 'Кітапта: mofeta, elefante — f сөздің ортасында.'] },
    { id: 'r2', review: ['s', 't', 'd', 'n', 'f'], label: 's t d n f', title: 'Repaso S T D N F', page: 25,
      intro: ['teléfono', 'toldo', 'osito'],
      words: ['teléfono', 'toldo', 'osito', 'sapo', 'sopa', 'seta', 'tomate', 'taza', 'dado', 'dedo', 'nido', 'mono', 'luna', 'foto', 'foca', 'sofá', 'moneda', 'tortuga', 'naranja', 'fantasma'],
      sent: ['La semana tiene 7 días.', 'La pelota es de Felipe.'], extra: ['colores'],
      kkExtra: ['Қайталау: S, T, D, N, F. Кітаптағы тапсырма: бір түсті буындарды қосу — te-lé-fo-no, tol-do, o-si-to. Ойындағы «Sílabas de colores».', 'Кітаптағы сөйлемдер: «La semana tiene 7 días.» «La pelota es de Felipe.»'] },
  ];
  const ORDER = LESSONS.filter((l) => l.c).map((l) => l.c);
  LESSONS.forEach((l, i) => {
    l.cons = l.c ? [l.c] : l.review || [];
    l.known = ORDER.filter((c) => LESSONS.findIndex((x) => x.c === c) <= i);
    if (l.c) {
      l.C = l.c.toUpperCase();
      l.label = l.C + ' ' + l.c;
      l.title = 'La letra ' + l.C;
    }
    l.syl = l.vowels ? VOW.slice() : l.cons.flatMap((c) => VOW.map((v) => c + v));
    if (l.vowels) l.words = Object.values(l.byVowel).flat();
    if (AG.test) (l.words || []).concat(l.intro || []).forEach((w) => W[w] || console.warn('missing word', w));
  });

  /* ---------------- helpers ---------------- */
  const knownLetters = (les) => VOW.concat(les.known);
  function distract(s, les, k = 2) {
    if (VOW.includes(s)) return sample(VOW.filter((v) => v !== s), k);
    const c = s[0], v = s.slice(1);
    const sameC = VOW.map((x) => c + x).filter((x) => x !== s);
    const sameV = les.known.filter((x) => x !== c).map((x) => x + v);
    const out = [...sample(sameC, 1), ...sample(sameV, 1)];
    const rest = shuffle(sameC.concat(sameV).filter((x) => !out.includes(x)));
    while (out.length < k && rest.length) out.push(rest.pop());
    return out.slice(0, k);
  }
  const txt = (t, style) => ({ text: t, style });
  const traceable = (w) => AG.hand.can(w);

  /* ---------------- Kazakh notes for each activity: [line on the tile, longer tip] ---------------- */
  const KK = {
    aprende: ['Карточкаларды бірге қарау', ['Әр карточкадағы сөзді испанша өзіңіз айтыңыз, Айри қайталасын.', 'Сөзді артикльмен айтыңыз: el pato, la mesa (el — көк, la — қызғылт).', '‹ › батырмаларымен немесе саусақпен сырғытып ауыстырыңыз.']],
    traza: ['Жазба әріпті бағытпен жазу', ['Жасыл нүктеден бастап, көк бағыттамалар бойымен саусақпен жүргізеді. Өткен бөлігі жасылға боялады.', '«▶ Mira» — әріп қалай жазылатынын көрсетеді: қарындаш қайдан басталып, қайда жүреді. Дәптерде де дәл осылай жазады.', 'Сызықтар мектеп дәптеріндегідей: ортаңғы жолақ — кіші әріптің биіктігі.']],
    busca: ['Бірдей буынды табу', ['Жоғарыда — баспа әріп (кітаптағыдай: Pa), төменде — жазба әріп. Бірдейін табу керек.', 'Буынды бірге дауыстап оқыңыз.']],
    empieza: ['Бірінші буынды табу', ['Суретті испанша атаңыз. Сөздің басындағы буынды табу керек: __to → pa-to.', 'Бұл кітаптағы «Elige y completa» тапсырмасы.']],
    une: ['Буындардан сөз құрау', ['Суретті испанша атаңыз, сосын Айри буындарды ретімен басып, сөз құрайды.', 'Соңында сөзді бірге, қосып оқыңыз: pa-to → pato.']],
    lee: ['Сөзді оқып, суретін табу', ['Сөзді өзі оқуға тырыссын (буындап). Қиын болса, бірінші буынды бірге оқыңыз.', 'Бұл — нағыз оқу жаттығуы. Асықтырмаңыз.']],
    empiezan: ['Осы әріптен басталатын сөздер', ['Әр суретті испанша атаңыз. Осы әріптен басталатындардың бәрін табу керек.', 'Бірінші дыбысты созып айтыңыз: mmm-mesa.']],
    ella: ['el / la — сөздің тегі', ['Испан тілінде зат есімнің тегі бар: el — еркек тегі (көк), la — әйел тегі (қызғылт).', 'Ережеден тыс сөздер көп (la mano), сондықтан сөзді әрқашан артикльмен бірге жаттаған дұрыс.']],
    deletrea: ['Әріптерден сөз жазу', ['Суреттегі сөзді атаңыз, сосын Айри оны әріптермен жазады. Дыбыстап, баяу айтыңыз: m-i-e-l.']],
    frase: ['Сөйлем құрау', ['Жоғарыдағы сөйлемді бірге оқыңыз, сосын Айри сөздерді ретімен қояды.', 'Жоғарыда — баспа әріп, төменде — жазба әріп: екеуін де тануға үйретеді.']],
    sonidos: ['Жануарлар не дейді?', ['¿Qué dice el gato? — «Мысық не дейді?» Жауабы: miau. Сиыр — mu.', 'Кітаптағы M әрпінің тапсырмасы. Жауаптарды бірге оқыңыз.']],
    letras: ['Әріптерді санау', ['Сөздегі әріптерді санау. Әр әріпті басса — нөмірі шығады; бірге испанша санаңыз: uno, dos, tres…', 'Кітаптағы тапсырма: MEDUSA — 6 әріп.']],
    termina: ['Сөздің соңын табу', ['Сөздің соңғы бөлігін табу: mo__ → mono, le__ → león.', 'Кітаптағы «no / ón» тапсырмасы.']],
    plural: ['los / las — көпше түр', ['Көпше түрде: el → los, la → las. Мысалы: los pies, las alas.', 'Суретте екі зат тұр — сондықтан көпше.']],
    colores: ['Бір түсті буындар', ['Бір түсті буындарды ретімен қосып, сөз құрау.', 'Кітаптың 25-бетіндегі тапсырма: te-lé-fo-no, tol-do, o-si-to.']],
  };
  const A = (id, type, icon, title, es, make) => ({ id, type, icon, title, es, make, kkShort: KK[id][0], kk: KK[id][1] });

  /* ---------------- activity generators ---------------- */
  const G = {
    aprende(les) {
      return A('aprende', 'show', '📖', 'Aprende', 'Mira y di.', () => {
        let cards;
        if (les.vowels) cards = VOW.map((v) => ({ letters: v.toUpperCase() + ' ' + v, imgs: les.byVowel[v].map((w) => W[w].img) }));
        else
          cards = [
            ...les.cons.map((c) => ({ letters: c.toUpperCase() + ' ' + c })),
            ...les.cons.map((c) => ({ syls: VOW.map((v) => c + v) })),
            ...les.intro.map((w) => ({ img: W[w].img, text: w, art: W[w].art })),
          ];
        return [{ cards }];
      });
    },
    traza(les) {
      return A('traza', 'trace', '✍️', 'Traza', 'Empieza en el punto verde y sigue las flechas.', () => {
        let g;
        if (les.vowels) g = VOW.slice();
        else if (les.review) g = sample(les.words.filter((w) => traceable(w) && w.length <= 6), 4);
        else {
          const word = pick(les.words.filter((w) => traceable(w) && w.length <= 5 && w.includes(les.c)));
          g = [les.c, les.C, ...sample(les.syl, 2), word].filter(Boolean);
        }
        return g.map((x) => ({ glyph: x, after: x }));
      });
    },
    busca(les) {
      return A('busca', 'choose', '👀', '¿Cuál es igual?', 'Busca la misma sílaba.', ({ n }) =>
        deal(les.syl, n).map((s) => {
          const o = shuffle([s, ...distract(s, les)]);
          return { prompt: txt(cap(s), 'print'), promptClass: 'big', options: o.map((x) => txt(x, 'cursive')), answer: o.indexOf(s), after: s };
        }));
    },
    empieza(les) {
      const ws = les.words.filter((w) => W[w].pic && W[w].syl.length >= 2 && (les.vowels ? VOW.includes(first(w)) && W[w].syl[0][0] === first(w) : les.syl.includes(W[w].syl[0])));
      return A('empieza', 'choose', '🧩', '¿Cómo empieza?', les.vowels ? '¿Con qué letra empieza?' : '¿Cómo empieza? Toca la sílaba.', ({ n }) =>
        deal(ws, n).map((w) => {
          const s0 = les.vowels ? first(w) : W[w].syl[0];
          const rest = les.vowels ? w.slice(1) : W[w].syl.slice(1).join('');
          const o = shuffle([s0, ...distract(s0, les)]);
          return { prompt: { img: W[w].img, text: '__' + rest }, options: o.map((x) => txt(x)), answer: o.indexOf(s0), fill: s0, after: withArt(w) };
        }));
    },
    une(les) {
      const ws = les.words.filter((w) => W[w].pic && W[w].syl.length >= 2 && W[w].syl.length <= 4);
      return A('une', 'build', '🔗', 'Une las sílabas', 'Une las sílabas y forma la palabra.', ({ n }) =>
        deal(ws, n).map((w) => {
          const syl = W[w].syl;
          const plainSyl = syl.map(AG.plain);
          const pool = les.known.flatMap((c) => VOW.map((v) => c + v));
          const extra = sample(pool.filter((x) => !plainSyl.includes(x)), syl.length <= 2 ? 2 : 1);
          return { prompt: { img: W[w].img }, slots: syl.map((s) => ({ answer: s })), tiles: [...syl, ...extra], after: withArt(w) };
        }));
    },
    lee(les) {
      const ws = les.words.filter((w) => W[w].pic);
      return A('lee', 'choose', '🔎', 'Lee y busca', 'Lee la palabra y busca el dibujo.', ({ n }) =>
        deal(ws, n).map((w) => {
          const same = sample(ws.filter((x) => x !== w && W[x].img !== W[w].img), 1);
          const other = sample(PICS.filter((x) => x !== w && !same.includes(x) && !ws.includes(x)), 2 - same.length);
          const o = shuffle([w, ...same, ...other]);
          return { prompt: { text: w }, options: o.map((x) => ({ img: W[x].img })), answer: o.indexOf(w), after: withArt(w) };
        }));
    },
    empiezan(les) {
      const letters = les.vowels ? VOW : les.cons;
      return A('empiezan', 'multi', '🎯', '¿Cuáles empiezan…?', 'Busca los dibujos que empiezan por esta letra.', ({ n }) =>
        deal(letters, Math.max(2, Math.round(n / 2))).map((c) => {
          const yes = sample(PICS.filter((w) => first(w) === c && (les.vowels || les.words.includes(w) || les.intro.includes(w))), 3);
          const no = sample(PICS.filter((w) => first(w) !== c), 6 - yes.length);
          const o = shuffle([...yes, ...no]);
          return { prompt: { letters: c.toUpperCase() + ' ' + c }, promptClass: 'small', options: o.map((w) => ({ img: W[w].img })), answers: yes.map((w) => o.indexOf(w)), after: yes.join(', ') };
        }));
    },
    ella(les) {
      const ws = les.words.filter((w) => W[w].pic && W[w].artOk);
      return A('ella', 'choose', '👦👧', '¿El o la?', '¿El o la?', ({ n }) =>
        deal(ws, n).map((w) => ({
          prompt: { img: W[w].img, text: '__ ' + w },
          options: [{ text: 'el', cls: 'art-m' }, { text: 'la', cls: 'art-f' }],
          answer: W[w].art === 'el' ? 0 : 1, fill: W[w].art, fillCls: W[w].art === 'el' ? 'm' : 'f', after: withArt(w), optClass: 'wide',
        })));
    },
    plural() {
      const P = [['pies', 'los', 'pie'], ['alas', 'las', 'ala'], ['osos', 'los', 'oso'], ['setas', 'las', 'seta'], ['sobres', 'los', 'sobre'], ['mesas', 'las', 'mesa'],
        ['patos', 'los', 'pato'], ['sillas', 'las', 'silla'], ['monos', 'los', 'mono'], ['dados', 'los', 'dado'], ['lupas', 'las', 'lupa'], ['sopas', 'las', 'sopa']];
      return A('plural', 'choose', '👣', '¿Los o las?', '¿Los o las?', ({ n }) =>
        deal(P, n).map(([pl, art, w]) => ({
          prompt: { img: W[w].img, times: 2, text: '__ ' + pl },
          options: [{ text: 'los', cls: 'art-m' }, { text: 'las', cls: 'art-f' }],
          answer: art === 'los' ? 0 : 1, fill: art, fillCls: art === 'los' ? 'm' : 'f', after: art + ' ' + pl, optClass: 'wide',
        })));
    },
    deletrea(les) {
      const ws = les.words.filter((w) => W[w].pic && [...w].length >= 2 && [...w].length <= 5);
      return A('deletrea', 'build', '🔠', 'Escribe la palabra', 'Escribe la palabra con las letras.', ({ n }) =>
        deal(ws, Math.min(n, 6)).map((w) => {
          const letters = [...w];
          const extra = sample(knownLetters(les).filter((l) => !letters.map(AG.plain).includes(l)), 1);
          return { prompt: { img: W[w].img }, slots: letters.map((l) => ({ answer: l })), tiles: [...letters, ...extra], after: withArt(w) };
        }));
    },
    frase(les) {
      return A('frase', 'build', '🧱', 'Forma la frase', 'Lee y ordena las palabras.', () =>
        shuffle(les.sent).map((s) => {
          const words = s.split(' ');
          return { prompt: txt(s, 'print'), promptClass: 'model', slots: words.map((w) => ({ answer: w })), tiles: words, slotClass: 'words', after: s };
        }));
    },
    sonidos() {
      const S = [['gato', 'miau'], ['vaca', 'mu'], ['pollito', 'pío'], ['pato', 'cua, cua'], ['oveja', 'beee']];
      return A('sonidos', 'choose', '🐮', '¿Qué dice?', '¿Qué dice el animal?', ({ n }) =>
        deal(S, n).map(([w, snd]) => {
          const o = shuffle([snd, ...sample(S.filter((x) => x[1] !== snd).map((x) => x[1]), 2)]);
          return { prompt: { img: W[w].img }, q: `¿Qué dice ${withArt(w)}?`, options: o.map((x) => txt(x)), answer: o.indexOf(snd), after: `${cap(withArt(w))} dice ${snd}.` };
        }));
    },
    letras(les) {
      const ws = ['medusa', 'media', 'dátil', 'dado', 'dedo', 'nido', 'moneda', 'ducha', 'diana', 'dominó', 'delantal'];
      return A('letras', 'choose', '🔢', '¿Cuántas letras?', '¿Cuántas letras tiene? Cuenta.', ({ n }) =>
        deal(ws, n).map((w) => {
          const k = [...w].length;
          const pool = [k - 2, k - 1, k + 1, k + 2].filter((x) => x >= 2);
          const o = shuffle([k, ...sample(pool, 2)]);
          return { prompt: { img: W[w].img, spell: w.toUpperCase() }, promptClass: 'small', options: o.map((x) => ({ num: x })), answer: o.indexOf(k), after: `${w}: ${AG.NUM[k]} letras`, optClass: 'small' };
        }));
    },
    termina() {
      const ws = ['mono', 'pino', 'mano', 'león', 'luna', 'lana', 'nido'];
      const ends = ['no', 'ón', 'na', 'do'];
      return A('termina', 'choose', '🏁', '¿Cómo termina?', '¿Cómo termina? Toca la sílaba.', ({ n }) =>
        deal(ws, n).map((w) => {
          const last = W[w].syl[W[w].syl.length - 1];
          const o = shuffle([last, ...sample(ends.filter((x) => x !== last), 2)]);
          return { prompt: { img: W[w].img, text: W[w].syl.slice(0, -1).join('') + '__' }, options: o.map((x) => txt(x)), answer: o.indexOf(last), fill: last, after: withArt(w) };
        }));
    },
    colores() {
      const ws = ['teléfono', 'toldo', 'osito', 'tomate', 'patata', 'tortuga', 'sapo', 'delantal', 'naranja', 'soldado', 'fantasma', 'tenedor', 'moneda', 'dominó'];
      const COL = ['#D62839', '#1D70B8', '#138A36', '#7B2CBF'];
      return A('colores', 'build', '🌈', 'Sílabas de colores', 'Une las sílabas del mismo color.', ({ n }) =>
        deal(ws, n).map((w) => {
          const [c1, c2] = sample(COL, 2);
          const mine = W[w].syl.map(AG.plain);
          const w2 = pick(ws.filter((x) => x !== w && !W[x].syl.some((s) => mine.includes(AG.plain(s))))) || pick(ws.filter((x) => x !== w));
          const tiles = [...W[w].syl.map((v) => ({ v, color: c1 })), ...W[w2].syl.map((v) => ({ v, color: c2 }))];
          return { prompt: { img: W[w].img }, slots: W[w].syl.map((s) => ({ answer: s, color: c1 })), tiles, after: withArt(w) };
        }));
    },
  };

  function kkLesson(les) {
    const out = [];
    if (les.vowels) {
      out.push('Дауысты дыбыстар: **a, e, i, o, u**. Кітапта бұлар бұрын өтілген — бұл сабақ қайталауға арналған.',
        'Испан дауыстылары қысқа әрі таза айтылады: a [а], e [э], i [и], o [о], u [у]. Ешқашан созылмайды.',
        'Суреттерді испанша атаңыз: avión, árbol, abeja; elefante, estrella, escalera; isla, iglú, imán; oso, ojo, oveja; uva, uno, uña.');
    } else if (les.c) {
      out.push(`Жаңа әріп: **${les.C} ${les.c}**. Испанша аты — «${NAME[les.c]}», бірақ оқығанда тек дыбысы айтылады: ${SND[les.c]}.`,
        `Кітап, ${les.page}-бет. Суреттерді бірге испанша атаңыз: ${les.intro.map(withArt).join(', ')}.`,
        `Буындар: ${les.syl.join(', ')}. Әр буынды саусақпен көрсетіп, қосып оқыңыз: ${les.c} + a = ${les.c}a.`);
    }
    (les.kkExtra || []).forEach((x) => out.push(x));
    out.push('Тәртіп: «Aprende» → «Traza» → қалғандары. Бір күнде 3–4 ойын жеткілікті. Ойыннан кейін дәптерге жазыңыз — «Traza» көрсеткен бағытпен.');
    return out;
  }

  AG.game({
    id: 'letras',
    title: 'Letras',
    icon: 'Aa',
    color: '#5865F2',
    color2: '#8B94FF',
    kkTitle: 'Бұл ойын туралы (Letras)',
    kk: [
      'Бұл ойын «lecto-1» кітабының 16–25 беттері бойынша: P, M, L, S, T, D, N, F әріптері және екі қайталау сабағы. «Las vocales» — дауыстыларды қайталау.',
      'Ретімен жүріңіз: бір әріпке шамамен бір апта. Әр сабақта кітаптың беті жазылған — алдымен кітаппен жұмыс, сосын ойын.',
      'Ойында дыбыс жоқ: сөздерді өзіңіз испанша айтасыз. Ойын өзі келесі тапсырмаға ауыспайды — «→» батырмасын басыңыз; «↺» — тапсырманы қайта бастау.',
      'Мектепте жазба әріп (letra ligada) қолданылады, сондықтан ойын да жазба әріппен көрсетеді. Баспа әріпке ауыстыру: Ата-ана → Баптаулар.',
    ],
    lessons: LESSONS.map((les) => ({
      id: les.id,
      label: les.label,
      title: les.title,
      page: les.page,
      kk: kkLesson(les),
      activities: () => {
        const ids = les.vowels
          ? ['aprende', 'traza', 'busca', 'empieza', 'empiezan']
          : les.review
          ? ['aprende', 'traza', 'busca', 'une', 'lee', 'empiezan', 'ella', ...(les.extra || []), 'deletrea', 'frase']
          : ['aprende', 'traza', 'busca', 'empieza', 'une', 'lee', 'empiezan', 'ella', ...(les.extra || []), 'deletrea', 'frase'];
        return ids.map((id) => G[id](les));
      },
    })),
  });

  AG.letras = { W, LESSONS }; // for debugging / reuse
})();
