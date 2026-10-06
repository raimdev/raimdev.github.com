/* Parent / teacher area (Kazakh): guide, settings, progress, install. */
(function () {
  'use strict';
  const { h, icon } = AG;

  const GUIDE = [
    'Бұл ойын мектеп кітабындағы тақырыпты бекітуге арналған. iPad кітап пен дәптерді алмастырмайды — тек қосымша құрал.',
    '**Бір сабақтың тәртібі (15–20 минут)**',
    '- Кітапты ашып, жаңа әріпті немесе тапсырманы өзіңіз түсіндіріңіз. Дыбысын айтыңыз, суреттерді испанша атаңыз.',
    '- iPad: алдымен «Aprende», содан кейін «Traza» және тағы 2–3 ойын. Бәрін бір күнде ойнау міндетті емес.',
    '- Соңында дәптерге жазыңыз — «Traza» көрсеткен бағытпен.',
    '**Ойында дыбыс жоқ**',
    '- Сөздерді, буындарды және сандарды испанша өзіңіз айтыңыз; Айри қайталасын. Жоғарыдағы сұр жол — испанша нұсқау, оны оқып беруге болады.',
    '**Батырмалар**',
    '- **↺** — осы тапсырманы басынан қайта бастау.',
    '- **Siguiente →** — келесі тапсырма. Ойын өзі ауыспайды, сіз басасыз. Қиын тапсырманы өткізіп жіберуге де болады.',
    '- Жоғарыдағы дөңгелектер — тапсырмалар: жасыл — бірден дұрыс, сары — қатемен, сұр — өткізілген. Дөңгелекті басып, кез келген тапсырмаға оралуға болады.',
    '- **?** — осы ойынға қазақша кеңес.',
    '**Traza (жазу)**',
    '- Жасыл нүктеден бастап, көк бағыттамалар бойымен саусақпен жүргізеді. Өткен бөлігі жасылға боялады.',
    '- «▶ Mira» — әріп қалай жазылатынын көрсетеді (қарындаш қайдан басталып, қайда жүреді).',
    '- Сызықтар мектеп дәптеріндегідей: ортаңғы жолақ — кіші әріптің биіктігі.',
    '**Көмек**',
    '- Қате басса, жауап сөнеді; екі қатеден кейін дұрыс жауап жыпылықтайды. Ұрыспаңыз: «жақсы, тағы байқап көр» деңіз.',
    '- Айри өзі бассын. Сіз саусақпен нұсқай аласыз, бірақ оның орнына баспаңыз.',
    '- Суреттегі заттарды басса, нөмірі шығады — бірге испанша санаңыз: uno, dos, tres…',
    '- Жұлдыздар: ★★★ — бәрі бірден дұрыс; ★ — көп қате. «Otra vez» — жаңа сұрақтармен қайта ойнау.',
    '- Шаршаса немесе алаңдаса — тоқтатыңыз. Қысқа, бірақ күн сайын — ең жақсы нәтиже береді.',
  ];

  const installLines = () => [
    '**Бір рет интернет керек, кейін интернетсіз жұмыс істейді.**',
    `- iPad-та **Safari** арқылы осы мекенжайды ашыңыз: **${location.origin + location.pathname.replace(/index\.html$/, '')}**`,
    '- «Бөлісу» батырмасы (шаршы мен жоғары бағыттама) → «На экран Домой» / «Add to Home Screen» → «Добавить / Add».',
    '- Үй экранындағы белгішені ашыңыз. Интернет қосулы тұрғанда осы бетте «Офлайн: дайын ✓» жазуы шыққанша күтіңіз.',
    '- Болды: енді ұшақ режимінде де жұмыс істейді.',
    '**Ескерту**',
    '- Әр ойын (Letras, Números, English) — бөлек қолданба. Әрқайсысын жеке-жеке қосыңыз.',
    '- Прогресс тек осы iPad-тағы қолданбада сақталады. Белгішені өшірсеңіз, прогресс те өшеді.',
    '- Жаңа нұсқа шықса: қолданбаны интернетпен ашып-жабыңыз да, қайта ашыңыз.',
  ];

  function seg(label, options, value, onPick) {
    return h('div.setrow',
      h('span.setlabel', label),
      h('div.seg', options.map(([v, t]) => h('button' + (v === value ? '.on' : ''), {
        onclick: (e) => {
          [...e.currentTarget.parentNode.children].forEach((b) => b.classList.remove('on'));
          e.currentTarget.classList.add('on');
          onPick(v);
        },
      }, t))));
  }
  const set = (k) => (v) => {
    AG.settings[k] = v;
    AG.saveSettings();
  };

  function settingsTab() {
    const S = AG.settings;
    let confirmReset = false;
    const resetBtn = h('button.pill.danger', {
      onclick: () => {
        if (!confirmReset) {
          confirmReset = true;
          resetBtn.lastChild.textContent = ' Иә, барлық прогресті өшіру';
          return;
        }
        AG.resetProgress();
        resetBtn.lastChild.textContent = ' Өшірілді ✓';
      },
    }, icon('erase'), h('span', ' Прогресті өшіру'));
    return h('div.settings',
      h('div.setrow', h('span.setlabel', 'Баланың аты'),
        h('input', { value: S.name, maxlength: 20, oninput: (e) => set('name')(e.target.value.trim()) })),
      seg('Бір ойындағы тапсырма саны', [[4, '4'], [6, '6'], [8, '8']], S.rounds, set('rounds')),
      AG.current.script ? null : seg('Жазу түрі (сөздер мен буындар)', [['ligada', 'Жазба (letra ligada)'], ['imprenta', 'Баспа (imprenta)']], S.script, set('script')),
      seg('Дұрыс жауапты көрсету', [[1, '1 қатеден кейін'], [2, '2 қатеден кейін'], [3, '3 қатеден кейін']], S.hintAfter, set('hintAfter')),
      seg('Қазақша кеңестер', [[true, 'Көрсету'], [false, 'Жасыру']], S.kk, set('kk')),
      seg('Конфетти / анимация', [[true, 'Қосулы'], [false, 'Өшірулі']], S.anim, set('anim')),
      AG.current.lessons.some((l) => l.acts.some((a) => a.type === 'trace')) ? h('p.note', '«Traza» әрқашан жазба әріппен (кітаптағыдай), бағыттамалармен.') : null,
      resetBtn);
  }

  function progressTab() {
    const g = AG.current;
    const fmt = (t) => (t ? new Date(t).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) : '');
    return h('div.progress', h('div.pgame',
      h('h3', g.icon + ' ' + g.title),
      h('table',
        h('tr', h('th', 'Сабақ'), h('th', 'Ойындар'), h('th', 'Жұлдыз'), h('th', 'Соңғы рет')),
        g.lessons.map((l) => {
          const st = AG.lessonStars(l);
          let last = 0;
          l.acts.forEach((a) => { const p = AG.getProg(l.id, a.id); if (p && p.last > last) last = p.last; });
          return h('tr', h('td', l.title), h('td', `${st.done} / ${st.total}`), h('td', `${st.got} / ${st.max}`), h('td', fmt(last)));
        }))));
  }

  function installTab() {
    const status = h('div.offstat', 'Тексерілуде…');
    const check = () => AG.offlineStatus().then((st) => {
      if (!status.isConnected) return;
      if (st.ready) {
        status.textContent = `Офлайн: дайын ✓ (${st.count} файл)`;
        status.classList.add('ok');
      } else {
        status.textContent = st.total ? `Офлайн: әлі дайын емес (${st.count || 0} / ${st.total}). Интернетпен бірнеше секунд күтіңіз.` : 'Офлайн: әлі дайын емес.';
        setTimeout(check, 3000);
      }
    });
    check();
    return h('div', status, AG.kk(installLines(), 'iPad-қа орнату', true, true),
      h('p.note', 'Нұсқа: ' + ((window.AG_BUILD || {}).version || 'dev')));
  }

  const TABS = [
    ['guide', 'Нұсқаулық', () => AG.kk(GUIDE, 'Ата-анаға / мұғалімге нұсқаулық', true, true)],
    ['settings', 'Баптаулар', settingsTab],
    ['progress', 'Прогресс', progressTab],
    ['install', 'iPad-қа орнату', installTab],
  ];

  AG.parentScreen = (mount, tab) => {
    const cur = TABS.find((t) => t[0] === tab) || TABS[0];
    const credit = h('p.credit',
      'Пиктограммалар: Sergio Palao. Origen: ARASAAC (arasaac.org). Licencia: CC BY-NC-SA. Propiedad: Gobierno de Aragón (España). ',
      'Қаріптер: Andika (SIL), Playwrite ES (TypeTogether) — SIL Open Font License.');
    mount(h('div.screen.parent',
      AG.topbar('', 'Ата-ана бөлімі'),
      h('div.scroll',
        h('nav.tabs', TABS.map(([id, label]) => h('button' + (id === cur[0] ? '.on' : ''), { onclick: () => AG.go('parent/' + id) }, label))),
        h('div.tabbody', cur[2]()),
        credit)));
  };
})();
