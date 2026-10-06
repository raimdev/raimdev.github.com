/* Game: ENGLISH — Unit 1 «Time for school» (class presentation): school things, sports equipment,
   have got / has got with short answers, our / their. Exam practice at the end. */
(function () {
  'use strict';
  const { pick, shuffle, sample, deal, range } = AG;

  /* picture file | English | group | Spanish (as in class) | Kazakh (for the parent) | number: s = a …, p = plural, u = uncountable */
  const TABLE = `
dictionary|dictionary|school|el diccionario|сөздік|s
pencil-case|pencil case|school|el estuche|пенал|s
water-bottle|water bottle|school|la botella de agua|су бөтелкесі|s
lunch-box|lunch box|school|la fiambrera|тамақ қорабы (ланчбокс)|s
glue-stick|glue stick|school|el pegamento de barra|желім-қарындаш|s
folder|folder|school|la carpeta|папка|s
scissors|scissors|school|las tijeras|қайшы|p
pencil-sharpener|pencil sharpener|school|el sacapuntas|ұштағыш|s
crayons|crayons|art|las ceras|балауыз қарындаштар (мелки)|p
paints|paints|art|las pinturas|бояулар|p
paintbrushes|paintbrushes|art|los pinceles|қылқаламдар|p
paper|paper|art|el papel|қағаз|u
tracksuit|tracksuit|sport|el chándal|спорт костюмі|s
trainers|trainers|sport|las zapatillas de deporte|кроссовкалар|p
sports-bag|sports bag|sport|la bolsa de deporte|спорт сөмкесі|s
football-boots|football boots|sport|las botas de fútbol|бутсы|p
shorts|shorts|sport|el pantalón corto|шорты|p
football-shirt|football shirt|sport|la camiseta de fútbol|футбол жейдесі|s
`;
  const V = TABLE.trim().split('\n').map((l) => {
    const [img, en, group, es, kk, num] = l.split('|');
    return { img, en, group, es, kk, num };
  });
  const byGroup = (g) => V.filter((v) => v.group === g);
  const SCHOOL = byGroup('school'), ART = byGroup('art'), SPORT = byGroup('sport');
  const withA = (v) => (v.num === 's' ? 'a ' + v.en : v.en);
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const P = (t) => ({ text: t, style: 'print' });
  const PRON = {
    I: { img: 'i', have: 'have', es: 'yo' }, you: { img: 'you', have: 'have', es: 'tú' }, he: { img: 'he', have: 'has', es: 'él' },
    she: { img: 'she', have: 'has', es: 'ella' }, we: { img: 'we', have: 'have', es: 'nosotros' }, they: { img: 'they', have: 'have', es: 'ellos' },
  };
  const Pr = (p) => (p === 'I' ? 'I' : cap(p));

  /* Kazakh notes per activity: [line on the tile, longer tip] */
  const KK = {
    learn: ['Ағылшынша бірге атау', ['Әр карточканы ағылшынша бірге айтыңыз. Астындағы сұр жазу — испанша аудармасы (сабақ испан тілінде өтеді).', 'Слайдтағыдай «Say their name!»: алдымен Айри өзі атасын, сосын сөзді бірге оқыңыз.']],
    find: ['Сөзді оқып, суретін табу', ['Сөзді бірге ағылшынша оқыңыз — Айри сәйкес суретті басады.']],
    what: ['Суретке сөз табу', ['Суретті көрсетіп «What is it?» деп сұраңыз. Айри дұрыс сөзді таңдап, дауыстап айтады.']],
    match: ['Суретті сөзбен қосу', ['Суретті оның атымен сызықпен қосады. Әр жұпты ағылшынша айтыңыз.']],
    missing: ['Жетпейтін әріп', ['Сөздегі бос орынға дұрыс әріпті табу. Емтиханда сөз жазу болуы мүмкін — бұл соған дайындық.']],
    spell: ['Сөзді әріптермен жазу', ['Суреттегі сөзді әріптерден құрау. Қате әріп басылмайды — келесі дұрыс әріп жыпылықтайды.']],
    sort: ['Мектеп заттары ма, спорт па?', ['Сурет «School things» (мектеп заттары) ме, әлде «Sports equipment» (спорт киімі мен заттары) ма?']],
    haveyou: ['Have you got…? — Yes / No', ['Сөмкеде не бар екенін қарайды. «Have you got a folder?» — «Сенде папка бар ма?»', 'Бар болса — «Yes, I have.», жоқ болса — «No, I haven\'t.»']],
    hashe: ['Has he / she got…?', ['Ұл бала — he, қыз бала — she. Суреттегі балада сол зат бар ма?', 'Жауабы: «Yes, he has.» / «No, he hasn\'t.» немесе «Yes, she has.» / «No, she hasn\'t.» He мен she-ді шатастырмау маңызды.']],
    havehas: ['have немесе has', ['I, you, we, they → **have** got. He, she → **has** got.', 'Мысалы: «She has got a lunch box.» «We have got paints.»']],
    ourtheir: ['our немесе their', ['We → **our** (біздің, испанша nuestro). They → **their** (олардың, испанша suyo).', 'Слайдтағы тапсырма: «We have got ___ sports bag.» → our.']],
    sentence: ['Сөйлем құрау', ['Сөздерді ретімен қойып сөйлем құрайды: I have got a dictionary.', 'Соңында сөйлемді бірге ағылшынша оқыңыз.']],
    grammar: ['Грамматика: аралас', ['have / has, our / their және қысқа жауаптар араласып келеді. Емтиханға дейін бірнеше рет ойнаңыз.']],
  };
  const A = (id, kkId, type, icon, title, es, make) => ({ id, type, icon, title, es, make, kkShort: KK[kkId][0], kk: KK[kkId][1] });

  /* ---------------- vocabulary activities ---------------- */
  const learnWords = (items) =>
    A('learn', 'learn', 'show', '📖', 'Learn', 'Look and say.', () => [{ cards: items.map((v) => ({ img: v.img, text: v.en, cap: v.es })) }]);
  const others = (v, items, k) => {
    const near = sample(items.filter((x) => x !== v), k);
    return near.length < k ? near.concat(sample(V.filter((x) => x !== v && !near.includes(x)), k - near.length)) : near;
  };
  const findPic = (items, id = 'find') =>
    A(id, 'find', 'choose', '🔎', 'Find the picture', 'Read and find the picture.', ({ n }) =>
      deal(items, n).map((v) => {
        const o = shuffle([v, ...others(v, items, 2)]);
        return { prompt: P(v.en), options: o.map((x) => ({ img: x.img })), answer: o.indexOf(v), after: `${v.en} · ${v.es}` };
      }));
  const whatIs = (items, id = 'what') =>
    A(id, 'what', 'choose', '❓', 'What is it?', 'What is it?', ({ n }) =>
      deal(items, n).map((v) => {
        const o = shuffle([v, ...others(v, items, 2)]);
        return { prompt: { img: v.img }, options: o.map((x) => P(x.en)), answer: o.indexOf(v), optClass: 'wide', after: `${v.en} · ${v.es}` };
      }));
  const matchWords = (items) =>
    A('match', 'match', 'match', '🔗', 'Match', 'Match the pictures and the words.', ({ n }) =>
      range(1, Math.max(2, Math.round(n / 3))).map(() => {
        const vs = sample(items.length >= 4 ? items : items.concat(sample(V.filter((x) => !items.includes(x)), 4 - items.length)), Math.min(5, Math.max(4, items.length)));
        return { left: vs.map((v) => ({ img: v.img, cls: 'mpic' })), right: vs.map((v) => P(v.en)) };
      }));
  const missing = (items, id = 'missing') =>
    A(id, 'missing', 'choose', '🔤', 'Missing letter', 'Find the missing letter.', ({ n }) =>
      deal(items, n).map((v) => {
        const pos = pick([...v.en].map((c, i) => (c === ' ' ? -1 : i)).filter((i) => i >= 0));
        const letter = v.en[pos];
        const masked = v.en.slice(0, pos) + '_' + v.en.slice(pos + 1);
        const o = shuffle([letter, ...sample([...'abcdefghiklmnoprstuy'].filter((c) => c !== letter), 2)]);
        return { prompt: { img: v.img, text: masked, style: 'print' }, options: o.map(P), answer: o.indexOf(letter), fill: letter, optClass: 'small', after: v.en };
      }));
  const spell = (items, id = 'spell') => {
    const ok = items.filter((v) => v.en.replace(' ', '').length <= 10);
    return A(id, 'spell', 'build', '✏️', 'Spell it', 'Spell the word.', ({ n }) =>
      deal(ok, Math.min(n, 6)).map((v) => {
        const chars = [...v.en];
        const letters = chars.filter((c) => c !== ' ');
        const extra = sample([...'aeioumnrst'].filter((c) => !letters.includes(c)), 1);
        return {
          prompt: { img: v.img }, slots: chars.map((c) => (c === ' ' ? { gap: true } : { answer: c })),
          tiles: [...letters, ...extra], slotClass: 'letters', after: `${v.en} · ${v.es}`,
        };
      }));
  };
  const sortGroup = () =>
    A('sort', 'sort', 'choose', '🗂️', 'School or sport?', 'School things or sports equipment?', ({ n }) =>
      deal(V, n).map((v) => ({
        prompt: { img: v.img, text: v.en, style: 'print' },
        options: [{ emoji: '🎒', text: 'school things', style: 'print' }, { emoji: '⚽', text: 'sports equipment', style: 'print' }],
        answer: v.group === 'sport' ? 1 : 0, optClass: 'answers', after: v.group === 'sport' ? 'Sports equipment' : 'School things',
      })));

  /* ---------------- grammar rounds (plain functions, mixed later in the exam) ---------------- */
  function rHaveYou() {
    const inBag = sample(V, 3);
    const yes = Math.random() < 0.5;
    const v = yes ? pick(inBag) : pick(V.filter((x) => !inBag.includes(x)));
    return {
      q: `Have you got ${withA(v)}?`,
      prompt: { cls: 'bag', row: [{ img: 'backpack' }, ':', ...inBag.map((x) => ({ img: x.img }))] },
      options: [P('Yes, I have.'), P("No, I haven't.")], answer: yes ? 0 : 1, optClass: 'answers',
      after: yes ? `Yes, I have got ${withA(v)}.` : `No, I haven't got ${withA(v)}.`,
    };
  }
  function rHasHeShe() {
    const who = pick(['he', 'she']);
    const has = sample(V, 2);
    const yes = Math.random() < 0.5;
    const v = yes ? pick(has) : pick(V.filter((x) => !has.includes(x)));
    const opts = ['Yes, he has.', "No, he hasn't.", 'Yes, she has.', "No, she hasn't."];
    const ans = (who === 'she' ? 2 : 0) + (yes ? 0 : 1);
    return {
      q: `Has ${who} got ${withA(v)}?`,
      prompt: { cls: 'bag', row: [{ img: PRON[who].img, cls: 'who' }, ':', ...has.map((x) => ({ img: x.img }))] },
      options: opts.map(P), answer: ans, optClass: 'answers', after: opts[ans],
    };
  }
  function rHaveHas(pron) {
    const p = pron || pick(Object.keys(PRON));
    const v = pick(V);
    const ans = PRON[p].have;
    return {
      prompt: { cls: 'sent', row: [{ img: PRON[p].img }, { img: v.img }], text: `${Pr(p)} __ got ${withA(v)}.`, style: 'print' },
      options: [P('have'), P('has')], answer: ans === 'have' ? 0 : 1, fill: ans, optClass: 'wide',
      after: `${Pr(p)} ${ans} got ${withA(v)}.`,
    };
  }
  /* the six sentences from the class slide, then new ones */
  const SLIDE = [['we', 'sports-bag'], ['they', 'paintbrushes'], ['they', 'tracksuit'], ['we', 'pencil-case'], ['they', 'pencil-sharpener'], ['we', 'folder']];
  function rOurTheir(pair) {
    const [who, img] = pair || [pick(['we', 'they']), pick(V).img];
    const v = V.find((x) => x.img === img);
    const ans = who === 'we' ? 'our' : 'their';
    return {
      prompt: { cls: 'sent', row: [{ img: PRON[who].img }, { img: v.img }], text: `${Pr(who)} have got __ ${v.en}.`, style: 'print' },
      options: [P('our'), P('their')], answer: who === 'we' ? 0 : 1, fill: ans, optClass: 'wide',
      after: `${Pr(who)} have got ${ans} ${v.en}.`,
    };
  }
  function rSentence(kind) {
    if (kind === 'mix') kind = pick(['have', 'has', 'our']);
    const v = pick(V);
    let who, words;
    if (kind === 'our') {
      who = pick(['we', 'they']);
      words = [Pr(who), 'have', 'got', who === 'we' ? 'our' : 'their', ...v.en.split(' ')];
    } else {
      who = kind === 'has' ? pick(['he', 'she']) : pick(['I', 'you', 'we', 'they']);
      words = [Pr(who), PRON[who].have, 'got', ...withA(v).split(' ')];
    }
    words[words.length - 1] += '.';
    return {
      prompt: { row: [{ img: PRON[who].img }, { img: v.img }], cls: 'bag' },
      slots: words.map((w) => ({ answer: w })), tiles: words, slotClass: 'words', after: words.join(' '),
    };
  }

  const haveYou = () => A('haveyou', 'haveyou', 'choose', '🎒', 'Have you got…?', 'Look in the bag and answer.', ({ n }) => range(1, n).map(() => rHaveYou()));
  const hasHeShe = () => A('hashe', 'hashe', 'choose', '👦👧', 'Has he / she got…?', 'Look and answer.', ({ n }) => range(1, n).map(() => rHasHeShe()));
  const haveHas = () =>
    A('havehas', 'havehas', 'choose', '🧩', 'have or has?', 'Have or has?', ({ n }) => deal(Object.keys(PRON), n).map((p) => rHaveHas(p)));
  const ourTheir = () =>
    A('ourtheir', 'ourtheir', 'choose', '👫', 'our or their?', 'Our or their?', ({ n }) =>
      [...SLIDE.map((s) => rOurTheir(s)), ...range(1, Math.max(0, n - 6)).map(() => rOurTheir())].slice(0, Math.max(n, 6)));
  const sentence = (kind, id = 'sentence') =>
    A(id, 'sentence', 'build', '🧱', 'Make the sentence', 'Put the words in order.', ({ n }) => range(1, Math.min(n, 5)).map(() => rSentence(kind)));
  const grammarMix = () =>
    A('grammar', 'grammar', 'choose', '🏆', 'Grammar mix', 'Read and choose.', ({ n }) =>
      shuffle(range(1, Math.max(n, 8)).map((i) => [rHaveYou, rHasHeShe, () => rHaveHas(), () => rOurTheir()][i % 4]())));

  /* ---------------- grammar «learn» cards ---------------- */
  const card = (row, text, es) => ({ cls: 'sent', row, text, cap: es, style: 'print' });
  const im = (x) => ({ img: x });
  const learnHave = () =>
    A('learn', 'learn', 'show', '📖', 'Learn', 'Read and say.', () => [{
      cards: [
        card([im('i'), im('dictionary')], 'I have got a dictionary.', 'Yo tengo un diccionario.'),
        card([im('i'), im('scissors')], 'I have got scissors.', 'Yo tengo tijeras.'),
        card([im('you'), im('folder')], 'Have you got a folder?', '¿Tienes una carpeta?'),
        { cls: 'sent', emoji: '✅', text: 'Yes, I have.', cap: 'Sí, tengo.', style: 'print' },
        { cls: 'sent', emoji: '❌', text: "No, I haven't.", cap: 'No, no tengo.', style: 'print' },
      ],
    }]);
  const learnHas = () =>
    A('learn', 'learn', 'show', '📖', 'Learn', 'Read and say.', () => [{
      cards: [
        card([im('he'), im('sports-bag')], 'He has got a sports bag.', 'Él tiene una bolsa de deporte.'),
        card([im('she'), im('crayons')], 'She has got crayons.', 'Ella tiene ceras.'),
        card([im('he'), im('trainers')], 'Has he got trainers?', '¿Tiene él zapatillas?'),
        { cls: 'sent', emoji: '✅', text: 'Yes, he has.', cap: 'Sí, tiene.', style: 'print' },
        { cls: 'sent', emoji: '❌', text: "No, he hasn't.", cap: 'No, no tiene.', style: 'print' },
        card([im('she'), im('lunch-box')], 'Has she got a lunch box?', '¿Tiene ella una fiambrera?'),
        { cls: 'sent', emoji: '✅', text: 'Yes, she has.', cap: 'Sí, tiene.', style: 'print' },
        { cls: 'sent', emoji: '❌', text: "No, she hasn't.", cap: 'No, no tiene.', style: 'print' },
        { cls: 'sent', text: 'I, you, we, they → have got\nhe, she → has got', style: 'print' },
      ],
    }]);
  const learnOur = () =>
    A('learn', 'learn', 'show', '📖', 'Learn', 'Read and say.', () => [{
      cards: [
        card([im('we'), im('sports-bag')], 'We have got our sports bag.', 'our = nuestro'),
        card([im('they'), im('water-bottle')], 'They have got their water bottles.', 'their = suyo'),
      ],
    }]);

  const vocabKK = (items, slides) => [
    `Слайдтар ${slides}. Сөздер (ағылшынша — испанша — қазақша):`,
    ...items.map((v) => `- **${v.en}** — ${v.es} — ${v.kk}`),
    'Әр сөзді ағылшынша бірге айтыңыз. Емтиханда суретке сөз жазу немесе таңдау болуы мүмкін.',
  ];
  const vocabActs = (items) => [learnWords(items), findPic(items), whatIs(items), matchWords(items), missing(items), spell(items)];

  AG.game({
    id: 'english',
    title: 'English',
    icon: 'ABC',
    color: '#E8590C',
    color2: '#FF922B',
    script: 'imprenta',
    lang: 'en',
    ui: { hello: 'Hello', next: 'Next', again: 'Again', lesson: 'Lesson', praise: ['Good job', 'Well done', 'Excellent', 'Great work', 'Fantastic'] },
    kkTitle: 'Бұл ойын туралы (English)',
    kk: [
      'Бұл ойын — ағылшын тілі, Unit 1 «Time for school» (мұғалімнің презентациясы) бойынша. Емтиханға дайындық.',
      'Ойында дыбыс жоқ: сөздерді өзіңіз ағылшынша айтыңыз. Карточкалардың астында испанша аудармасы бар (сабақ испан тілінде өтеді).',
      'Ретімен жүріңіз: алдымен сөздер (School things, Sports equipment), сосын грамматика (have got, has got, our / their), соңында «Exam practice».',
    ],
    lessons: [
      { id: 'school', label: '✂️ 📕', labelStyle: 'print', title: 'School things', page: '',
        kk: vocabKK(SCHOOL, '2–4'), activities: () => vocabActs(SCHOOL) },
      { id: 'art', label: '🖍️ 🎨', labelStyle: 'print', title: 'School things 2', page: '',
        kk: vocabKK(ART, '5–7'), activities: () => vocabActs(ART) },
      { id: 'sport', label: '👟 ⚽', labelStyle: 'print', title: 'Sports equipment', page: '',
        kk: vocabKK(SPORT, '8–10'), activities: () => vocabActs(SPORT) },
      { id: 'have', label: 'have got', labelStyle: 'print', title: 'I have got…', page: '',
        kk: ['Слайдтар 11–12: «To have» және «Have you got…?».',
          '**I have got** a dictionary. — Менде сөздік бар. (испанша: tengo)',
          '**Have you got** a folder? — Сенде папка бар ма?',
          '- Yes, I have. — Иә, бар.',
          "- No, I haven't. — Жоқ, менде жоқ.",
          'Бір зат болса — «a» қосылады: a folder. Көп болса — «a» жоқ: scissors, crayons, trainers.'],
        activities: () => [learnHave(), haveYou(), sentence('have')] },
      { id: 'has', label: 'has got', labelStyle: 'print', title: 'He / She has got…', page: '',
        kk: ['Слайдтар 13–14: «Has he got…?», «Has she got…?».',
          '**he** — ол (ұл бала), **she** — ол (қыз бала). Қазақшада бір сөз «ол», ал ағылшыншада екеу.',
          '**I, you, we, they → have got**; **he, she → has got**.',
          "- Yes, he has. / No, he hasn't.",
          "- Yes, she has. / No, she hasn't."],
        activities: () => [learnHas(), hasHeShe(), haveHas(), sentence('has')] },
      { id: 'our', label: 'our · their', labelStyle: 'print', title: 'Our and their', page: '',
        kk: ['Слайдтар 15–17: «Our and their».',
          '**we** — біз → **our** — біздің (испанша nuestro).',
          '**they** — олар → **their** — олардың (испанша suyo).',
          'We have got our sports bag. They have got their water bottles.',
          'Ойындағы алғашқы 6 тапсырма — слайдтағы «Our or their?» жаттығуы.'],
        activities: () => [learnOur(), ourTheir(), sentence('our')] },
      { id: 'exam', label: '🏆 Exam', labelStyle: 'print', title: 'Exam practice', page: '',
        kk: ['Емтиханға дайындық: барлық сөздер мен грамматика араласып келеді.',
          'Күн сайын 2–3 ойын жеткілікті. Жұлдызы аз ойынды қайталаңыз.',
          'Емтиханда әдетте: суретке сөз таңдау немесе жазу, сөз бен суретті қосу, have / has, our / their, Yes / No жауаптар.'],
        activities: () => [whatIs(V, 'words'), findPic(V, 'pictures'), sortGroup(), missing(V, 'letters'), spell(V, 'spelling'), grammarMix(), sentence('mix', 'sentences')] },
    ],
  });
})();
