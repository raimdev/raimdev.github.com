/* Airi Games — original flat art: the buddy, the gift box and the room things.
   Everything is inline SVG (works offline, scales on any iPad). Style: chunky round shapes, flat colours,
   one darker shade for volume, no outlines. */
(function () {
  'use strict';
  const AG = (window.AG = window.AG || {});
  const INK = '#2B2350';

  /* ---------------- buddy ----------------
     One SVG with every face; CSS shows the right one: .buddy (idle) · .happy · .think · .sleep */
  const BUDDY = `
<svg class="buddy-svg" viewBox="0 0 120 132" aria-hidden="true">
  <ellipse class="b-shadow" cx="60" cy="126" rx="36" ry="5" fill="rgba(43,35,80,.13)"/>
  <g class="b-body">
    <g class="b-ears">
      <circle cx="33" cy="30" r="13" fill="var(--b2)"/><circle cx="33" cy="30" r="6.5" fill="#FF9EAA"/>
      <circle cx="87" cy="30" r="13" fill="var(--b2)"/><circle cx="87" cy="30" r="6.5" fill="#FF9EAA"/>
    </g>
    <ellipse cx="44" cy="119" rx="12" ry="7.5" fill="var(--b2)"/>
    <ellipse cx="76" cy="119" rx="12" ry="7.5" fill="var(--b2)"/>
    <path d="M60 16C93 16 107 46 107 79c0 28-19 42-47 42S13 107 13 79C13 46 27 16 60 16z" fill="var(--b1)"/>
    <ellipse cx="60" cy="94" rx="29" ry="22" fill="var(--b3)"/>
    <g class="b-arm b-arm-l"><ellipse cx="19" cy="86" rx="8" ry="13" fill="var(--b2)"/></g>
    <g class="b-arm b-arm-r"><ellipse cx="101" cy="86" rx="8" ry="13" fill="var(--b2)"/></g>
    <path d="M57 17c-4-9 5-14 9-8" fill="none" stroke="var(--b2)" stroke-width="4.5" stroke-linecap="round"/>
    <ellipse cx="34" cy="74" rx="7.5" ry="4.5" fill="#FF8FA3" opacity=".75"/>
    <ellipse cx="86" cy="74" rx="7.5" ry="4.5" fill="#FF8FA3" opacity=".75"/>
    <g class="f f-open">
      <g class="b-eyes">
        <ellipse cx="45" cy="60" rx="7" ry="9" fill="${INK}"/><circle cx="47.6" cy="56.4" r="2.6" fill="#fff"/>
        <ellipse cx="75" cy="60" rx="7" ry="9" fill="${INK}"/><circle cx="77.6" cy="56.4" r="2.6" fill="#fff"/>
      </g>
    </g>
    <g class="f f-idle"><path d="M52 73q8 8 16 0" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/></g>
    <g class="f f-happy">
      <path d="M38 62q7-9 14 0M68 62q7-9 14 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <path d="M49 71h22q0 15-11 15T49 71z" fill="${INK}"/><ellipse cx="60" cy="81" rx="6" ry="3.6" fill="#FF7A8A"/>
    </g>
    <g class="f f-think"><ellipse cx="66" cy="76" rx="3.6" ry="4.2" fill="${INK}"/></g>
    <g class="f f-sleep">
      <path d="M38 61q7 6 14 0M68 61q7 6 14 0" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>
      <path d="M55 75q5 3 10 0" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>
    </g>
  </g>
</svg>`;

  AG.buddy = (mood = '', size) => {
    const e = AG.h('span.buddy' + (mood ? '.' + mood : ''), { html: BUDDY });
    if (size) e.style.setProperty('--bs', size);
    return e;
  };
  /* change the mood for a moment (or for good when ms is 0) */
  AG.buddyMood = (el, mood, ms = 1400) => {
    if (!el) return;
    clearTimeout(el._t);
    el.classList.remove('happy', 'think', 'sleep', 'jump');
    void el.offsetWidth;
    if (mood) el.classList.add(mood);
    if (mood === 'happy') el.classList.add('jump');
    if (mood && ms) el._t = setTimeout(() => el.classList.remove(mood, 'jump'), ms);
  };

  /* ---------------- gift box (the lid flies off when .open) ---------------- */
  AG.giftSvg = () => `
<svg class="gift-svg" viewBox="0 0 140 140" aria-hidden="true">
  <ellipse cx="70" cy="132" rx="46" ry="6" fill="rgba(43,35,80,.13)"/>
  <g class="g-box">
    <rect x="22" y="60" width="96" height="70" rx="12" fill="#FF6FA0"/>
    <rect x="86" y="60" width="32" height="70" rx="12" fill="#F2558A"/>
    <rect x="61" y="60" width="18" height="70" fill="#FFD34D"/>
  </g>
  <g class="g-lid">
    <rect x="14" y="44" width="112" height="24" rx="10" fill="#FF85B0"/>
    <rect x="59" y="44" width="22" height="24" fill="#FFE071"/>
    <path d="M70 44c-8-20-34-22-32-8 1 9 20 10 32 8z" fill="#FFD34D"/>
    <path d="M70 44c8-20 34-22 32-8-1 9-20 10-32 8z" fill="#FFC21F"/>
    <circle cx="70" cy="42" r="7" fill="#FFB800"/>
  </g>
</svg>`;

  /* ---------------- room things ----------------
     w: width in % of the room height · wall: hangs on the wall · flat: lies on the floor (always behind)
     tap: what happens on a tap (wiggle by default) · es / en: the word shown on a tap */
  const C = { ink: INK };
  const T = {};
  const add = (k, o) => (T[k] = o);

  add('plant', { es: 'la planta', en: 'a plant', w: 20, svg: `
    <path d="M50 58C50 40 34 30 18 31c2 15 13 25 32 27z" fill="#3DBE7A"/>
    <path d="M50 58C51 38 64 26 83 26c-2 17-15 29-33 32z" fill="#2FA566"/>
    <path d="M50 58C43 41 45 18 56 7c9 13 7 33-6 51z" fill="#4ED08B"/>
    <path d="M30 64h40l-5 29a6 6 0 0 1-6 5H41a6 6 0 0 1-6-5z" fill="#E8875B"/>
    <path d="M58 64h12l-5 29a6 6 0 0 1-6 5h-3z" fill="#D9744A"/>
    <rect x="25" y="57" width="50" height="11" rx="5.5" fill="#F09A70"/>` });

  add('cactus', { es: 'el cactus', en: 'a cactus', w: 15, svg: `
    <path d="M40 50h-8a6 6 0 0 1-6-6v-10a5 5 0 0 1 10 0v6h4z" fill="#4CC38A"/>
    <path d="M60 42h8a6 6 0 0 0 6-6v-8a5 5 0 0 0-10 0v4h-4z" fill="#4CC38A"/>
    <rect x="39" y="16" width="22" height="56" rx="11" fill="#55CF94"/>
    <rect x="50" y="22" width="4" height="44" rx="2" fill="#3FB37B"/>
    <circle cx="50" cy="15" r="5.5" fill="#FF7BAC"/><circle cx="50" cy="15" r="2" fill="#FFD34D"/>
    <path d="M33 70h34l-4 22a5 5 0 0 1-5 4H42a5 5 0 0 1-5-4z" fill="#6C8EF5"/>
    <rect x="29" y="64" width="42" height="10" rx="5" fill="#86A3FF"/>` });

  add('flowers', { es: 'las flores', en: 'flowers', w: 17, svg: `
    <path d="M50 60V30M50 60L36 30M50 60l15-28" stroke="#3DBE7A" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <g fill="#FF7BAC"><circle cx="36" cy="22" r="6"/><circle cx="29" cy="28" r="6"/><circle cx="43" cy="28" r="6"/><circle cx="31" cy="35" r="6"/><circle cx="41" cy="35" r="6"/></g><circle cx="36" cy="30" r="4" fill="#FFD34D"/>
    <g fill="#8C7CF0"><circle cx="65" cy="22" r="6"/><circle cx="58" cy="28" r="6"/><circle cx="72" cy="28" r="6"/><circle cx="60" cy="35" r="6"/><circle cx="70" cy="35" r="6"/></g><circle cx="65" cy="30" r="4" fill="#FFD34D"/>
    <g fill="#FFB938"><circle cx="50" cy="14" r="5.5"/><circle cx="44" cy="19" r="5.5"/><circle cx="56" cy="19" r="5.5"/><circle cx="46" cy="25" r="5.5"/><circle cx="54" cy="25" r="5.5"/></g><circle cx="50" cy="21" r="3.6" fill="#fff"/>
    <path d="M36 58h28c4 0 6 3 6 7 0 18-8 31-20 31S30 83 30 65c0-4 2-7 6-7z" fill="#5BC8F5"/>
    <path d="M58 58h6c4 0 6 3 6 7 0 18-8 31-20 31 9-6 12-20 8-38z" fill="#3FB2E3"/>` });

  add('lamp', { es: 'la lámpara', en: 'a lamp', w: 22, tap: 'glow', svg: `
    <path class="glow" d="M26 38L6 98h88L74 38z" fill="#FFF3B0"/>
    <ellipse cx="50" cy="95" rx="17" ry="4.5" fill="#6B5B95"/>
    <rect x="47" y="34" width="6" height="60" rx="3" fill="#8A7BB5"/>
    <path d="M33 8h34l11 28H22z" fill="#FFD166"/>
    <path d="M55 8h12l11 28H62z" fill="#F4B942"/>
    <rect x="20" y="33" width="60" height="6" rx="3" fill="#F2A516"/>` });

  add('rug', { es: 'la alfombra', en: 'a rug', w: 46, flat: true, vb: '0 0 100 40', svg: `
    <ellipse cx="50" cy="20" rx="48" ry="18" fill="#FF8FB1"/>
    <ellipse cx="50" cy="20" rx="38" ry="13.5" fill="#FFC1D4"/>
    <ellipse cx="50" cy="20" rx="27" ry="9.5" fill="#FF8FB1"/>
    <ellipse cx="50" cy="20" rx="15" ry="5" fill="#FFE071"/>` });

  add('armchair', { es: 'el sillón', en: 'an armchair', w: 30, svg: `
    <rect x="18" y="20" width="64" height="48" rx="18" fill="#5AA9F0"/>
    <rect x="22" y="56" width="56" height="20" rx="8" fill="#7CC0FF"/>
    <rect x="8" y="46" width="20" height="38" rx="10" fill="#4793DB"/>
    <rect x="72" y="46" width="20" height="38" rx="10" fill="#4793DB"/>
    <rect x="16" y="76" width="68" height="12" rx="6" fill="#3B7FC4"/>
    <rect x="20" y="86" width="7" height="10" rx="3" fill="#7A5638"/><rect x="73" y="86" width="7" height="10" rx="3" fill="#7A5638"/>` });

  add('books', { es: 'los libros', en: 'books', w: 18, svg: `
    <rect x="16" y="74" width="68" height="20" rx="4" fill="#FF7B6B"/><rect x="74" y="74" width="10" height="20" rx="3" fill="#FFF3E0"/>
    <rect x="22" y="54" width="60" height="20" rx="4" fill="#5BC8F5"/><rect x="22" y="54" width="9" height="20" rx="3" fill="#FFF3E0"/>
    <rect x="18" y="34" width="62" height="20" rx="4" fill="#FFD34D"/><rect x="71" y="34" width="9" height="20" rx="3" fill="#FFF3E0"/>
    <rect x="36" y="42" width="24" height="4" rx="2" fill="#F2A516"/>
    <rect x="40" y="62" width="24" height="4" rx="2" fill="#3FB2E3"/>
    <rect x="30" y="82" width="26" height="4" rx="2" fill="#E8604F"/>` });

  add('bear', { es: 'el oso', en: 'a teddy bear', w: 17, tap: 'hearts', svg: `
    <circle cx="30" cy="22" r="10" fill="#B07A4F"/><circle cx="70" cy="22" r="10" fill="#B07A4F"/>
    <circle cx="30" cy="22" r="5" fill="#E7B98E"/><circle cx="70" cy="22" r="5" fill="#E7B98E"/>
    <ellipse cx="50" cy="72" rx="26" ry="24" fill="#C08A5B"/>
    <ellipse cx="50" cy="76" rx="15" ry="14" fill="#E7B98E"/>
    <ellipse cx="25" cy="66" rx="8" ry="11" fill="#B07A4F"/><ellipse cx="75" cy="66" rx="8" ry="11" fill="#B07A4F"/>
    <ellipse cx="33" cy="93" rx="11" ry="6" fill="#B07A4F"/><ellipse cx="67" cy="93" rx="11" ry="6" fill="#B07A4F"/>
    <circle cx="50" cy="36" r="23" fill="#C08A5B"/>
    <ellipse cx="50" cy="44" rx="10" ry="8" fill="#E7B98E"/>
    <circle cx="41" cy="32" r="3" fill="${INK}"/><circle cx="59" cy="32" r="3" fill="${INK}"/>
    <ellipse cx="50" cy="41" rx="4" ry="3" fill="${INK}"/>
    <path d="M46 47q4 3 8 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M38 58l12 5 12-5-3 8h-18z" fill="#FF6FA0"/>` });

  add('ball', { es: 'la pelota', en: 'a ball', w: 13, tap: 'bounce', svg: `
    <circle cx="50" cy="60" r="36" fill="#FF6B6B"/>
    <path d="M14 60a36 36 0 0 1 72 0z" fill="#FFD34D" transform="rotate(-25 50 60)"/>
    <path d="M22 44a36 36 0 0 1 56 0 46 46 0 0 0-56 0z" fill="#5BC8F5" transform="rotate(-25 50 60)"/>
    <ellipse cx="38" cy="42" rx="8" ry="5" fill="#fff" opacity=".5" transform="rotate(-30 38 42)"/>` });

  add('cat', { es: 'el gato', en: 'a cat', w: 17, tap: 'hearts', svg: `
    <path d="M72 88c18 0 22-14 14-22" stroke="#F29B38" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M30 96c-4-26 4-46 20-46s24 20 20 46z" fill="#FFA94D"/>
    <ellipse cx="50" cy="82" rx="11" ry="14" fill="#FFE0B8"/>
    <path d="M26 30l4-22 14 13zM74 30l-4-22-14 13z" fill="#FFA94D"/>
    <path d="M30 26l2-11 7 7zM70 26l-2-11-7 7z" fill="#FF9EAA"/>
    <ellipse cx="50" cy="36" rx="25" ry="21" fill="#FFB561"/>
    <path d="M44 16h12l-2 8h-8z" fill="#F29B38"/>
    <ellipse cx="41" cy="35" rx="3.4" ry="4.4" fill="${INK}"/><ellipse cx="59" cy="35" rx="3.4" ry="4.4" fill="${INK}"/>
    <path d="M47 42h6l-3 3z" fill="#FF7A8A"/>
    <path d="M50 45q-3 4-7 2M50 45q3 4 7 2" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M24 42h10M24 47l10-2M76 42H66M76 47l-10-2" stroke="${INK}" stroke-width="1.4" stroke-linecap="round" opacity=".5"/>` });

  add('dog', { es: 'el perro', en: 'a dog', w: 19, tap: 'hearts', svg: `
    <path d="M70 70c14-4 16-14 12-20" stroke="#E0B07A" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M28 96c-3-24 6-40 22-40s25 16 22 40z" fill="#F2C994"/>
    <ellipse cx="50" cy="84" rx="11" ry="12" fill="#FFF1DC"/>
    <ellipse cx="50" cy="40" rx="26" ry="23" fill="#F2C994"/>
    <path d="M26 26c-12 4-12 26-2 32 6-6 8-20 2-32zM74 26c12 4 12 26 2 32-6-6-8-20-2-32z" fill="#A9774A"/>
    <ellipse cx="60" cy="34" rx="9" ry="8" fill="#E0B07A"/>
    <circle cx="41" cy="37" r="3.6" fill="${INK}"/><circle cx="59" cy="37" r="3.6" fill="${INK}"/>
    <ellipse cx="50" cy="48" rx="11" ry="8" fill="#FFF1DC"/>
    <ellipse cx="50" cy="45" rx="4.5" ry="3.4" fill="${INK}"/>
    <path d="M46 52q4 5 8 0" fill="#FF7A8A"/>` });

  add('fish', { es: 'el pez', en: 'a fish', w: 17, tap: 'swim', svg: `
    <ellipse cx="50" cy="94" rx="24" ry="4" fill="#C9B8F0"/>
    <path d="M24 40h52c8 10 12 20 12 30 0 15-17 26-38 26S12 85 12 70c0-10 4-20 12-30z" fill="#D7F2FF"/>
    <path d="M16 58h68c3 4 4 8 4 12 0 15-17 26-38 26S12 85 12 70c0-4 1-8 4-12z" fill="#7FD3F5"/>
    <rect x="22" y="34" width="56" height="8" rx="4" fill="#B5E6FA"/>
    <g class="swimmer"><path d="M38 72q12-12 24 0-12 12-24 0zM62 72l9-7v14z" fill="#FF8A3D"/><circle cx="43" cy="70" r="1.8" fill="${INK}"/></g>
    <path d="M30 88c4-6 4-12 0-16M70 88c-3-5-3-10 0-14" stroke="#3DBE7A" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="66" cy="54" r="2.5" fill="#fff"/><circle cx="60" cy="47" r="1.8" fill="#fff"/>` });

  add('balloon', { es: 'el globo', en: 'a balloon', w: 14, tap: 'float', svg: `
    <path d="M50 66c2 8-6 12-2 20s-4 10 0 12" stroke="#8A7BB5" stroke-width="2" fill="none"/>
    <path d="M50 4c17 0 28 14 28 30S62 64 50 64 22 50 22 34 33 4 50 4z" fill="#FF5C8A"/>
    <path d="M64 10c8 6 13 15 13 25 0 16-15 29-27 29 10-8 18-30 14-54z" fill="#E8457A"/>
    <path d="M46 63h8l-4 6z" fill="#E8457A"/>
    <ellipse cx="38" cy="22" rx="5" ry="8" fill="#fff" opacity=".45" transform="rotate(20 38 22)"/>` });

  add('cake', { es: 'la tarta', en: 'a cake', w: 17, svg: `
    <ellipse cx="50" cy="92" rx="38" ry="6" fill="#E5DDF7"/>
    <rect x="20" y="52" width="60" height="38" rx="8" fill="#FFC1D4"/>
    <rect x="20" y="70" width="60" height="6" fill="#FF8FB1"/>
    <path d="M20 58c0-6 4-8 8-8h44c4 0 8 2 8 8-5 0-5 6-10 6s-5-6-10-6-5 6-10 6-5-6-10-6-5 6-10 6-5-6-10-6z" fill="#FFF7FA"/>
    <rect x="47" y="30" width="6" height="20" rx="2" fill="#7CC0FF"/>
    <path d="M50 18c5 5 5 10 0 12-5-2-5-7 0-12z" fill="#FFB800"/>
    <circle cx="32" cy="50" r="3.5" fill="#FF5C5C"/><circle cx="68" cy="50" r="3.5" fill="#FF5C5C"/>` });

  add('apple', { es: 'la manzana', en: 'an apple', w: 11, svg: `
    <path d="M50 30c-6-8-30-8-30 22 0 22 14 40 30 34 16 6 30-12 30-34 0-30-24-30-30-22z" fill="#FF5C5C"/>
    <path d="M62 28c14 2 18 14 18 24 0 22-14 40-30 34 18-10 22-40 12-58z" fill="#E84545"/>
    <path d="M50 30c0-8 2-14 6-18" stroke="#7A5638" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M54 22c4-10 16-12 20-8-4 8-12 10-20 8z" fill="#3DBE7A"/>
    <ellipse cx="34" cy="44" rx="4" ry="7" fill="#fff" opacity=".45" transform="rotate(20 34 44)"/>` });

  add('clock', { es: 'el reloj', en: 'a clock', w: 15, wall: true, tap: 'spin', svg: `
    <circle cx="50" cy="50" r="44" fill="#8C7CF0"/>
    <circle cx="50" cy="50" r="35" fill="#FFFDF8"/>
    <g fill="${INK}"><circle cx="50" cy="21" r="3"/><circle cx="79" cy="50" r="3"/><circle cx="50" cy="79" r="3"/><circle cx="21" cy="50" r="3"/></g>
    <g class="hand-h"><rect x="47.5" y="32" width="5" height="20" rx="2.5" fill="${INK}"/></g>
    <g class="hand-m"><rect x="48.5" y="22" width="3" height="30" rx="1.5" fill="#FF6FA0"/></g>
    <circle cx="50" cy="50" r="4.5" fill="${INK}"/>` });

  add('picture', { es: 'el cuadro', en: 'a picture', w: 24, wall: true, vb: '0 0 100 80', svg: `
    <rect x="4" y="4" width="92" height="72" rx="8" fill="#F2A516"/>
    <rect x="12" y="12" width="76" height="56" rx="4" fill="#BDE8FF"/>
    <circle cx="70" cy="28" r="8" fill="#FFD34D"/>
    <path d="M12 68l22-30 16 18 12-12 26 24z" fill="#3DBE7A"/>
    <path d="M34 38l8 11-8 4-8-4z" fill="#fff"/>` });

  add('moon', { es: 'la luna', en: 'the moon', w: 13, wall: true, tap: 'glow', svg: `
    <circle class="glow" cx="50" cy="50" r="48" fill="#FFF3B0"/>
    <path d="M62 10a40 40 0 1 0 28 52A32 32 0 0 1 62 10z" fill="#FFD34D"/>
    <path d="M44 46q3-3 6 0M30 60q3-3 6 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M36 70q6 5 12 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="28" cy="70" r="4" fill="#FF8FA3" opacity=".7"/>` });

  add('rocket', { es: 'el cohete', en: 'a rocket', w: 14, tap: 'float', svg: `
    <path d="M36 74L22 92l18-4zM64 74l14 18-18-4z" fill="#FF6B6B"/>
    <path d="M50 4c16 12 20 34 16 72H34c-4-38 0-60 16-72z" fill="#F0F4FF"/>
    <path d="M50 4c16 12 20 34 16 72h-8c3-30 0-52-8-72z" fill="#D5DEF5"/>
    <path d="M50 4c7 5 11 12 13 20H37c2-8 6-15 13-20z" fill="#FF6B6B"/>
    <circle cx="50" cy="42" r="9" fill="#5BC8F5"/><circle cx="50" cy="42" r="5" fill="#BDE8FF"/>
    <path d="M40 78h20l-4 12-6-4-6 4z" fill="#FFB800"/>` });

  add('robot', { es: 'el robot', en: 'a robot', w: 16, svg: `
    <rect x="47" y="6" width="6" height="12" fill="#8A7BB5"/><circle cx="50" cy="6" r="5" fill="#FF6B6B"/>
    <rect x="24" y="16" width="52" height="36" rx="10" fill="#9AD7E8"/>
    <rect x="31" y="24" width="38" height="20" rx="8" fill="#2B2350"/>
    <circle cx="42" cy="34" r="4" fill="#7CF5C8"/><circle cx="58" cy="34" r="4" fill="#7CF5C8"/>
    <rect x="28" y="56" width="44" height="32" rx="8" fill="#7FC4D9"/>
    <rect x="42" y="64" width="16" height="9" rx="3" fill="#FFD34D"/>
    <rect x="12" y="58" width="12" height="22" rx="6" fill="#9AD7E8"/><rect x="76" y="58" width="12" height="22" rx="6" fill="#9AD7E8"/>
    <rect x="32" y="86" width="12" height="10" rx="3" fill="#6B5B95"/><rect x="56" y="86" width="12" height="10" rx="3" fill="#6B5B95"/>` });

  add('blocks', { es: 'los cubos', en: 'blocks', w: 18, svg: `
    <rect x="10" y="58" width="38" height="38" rx="6" fill="#FF6B6B"/>
    <rect x="52" y="58" width="38" height="38" rx="6" fill="#5BC8F5"/>
    <rect x="31" y="18" width="38" height="38" rx="6" fill="#FFD34D"/>
    <g font-family="Fredoka, Andika, sans-serif" font-weight="700" font-size="28" fill="#fff" text-anchor="middle">
      <text x="29" y="87">A</text><text x="71" y="87">b</text><text x="50" y="47" fill="#C98A00">1</text></g>` });

  add('bunny', { es: 'el conejo', en: 'a rabbit', w: 15, tap: 'hearts', svg: `
    <ellipse cx="38" cy="22" rx="8" ry="20" fill="#F4F0FA"/><ellipse cx="62" cy="22" rx="8" ry="20" fill="#F4F0FA"/>
    <ellipse cx="38" cy="24" rx="4" ry="14" fill="#FFB8C6"/><ellipse cx="62" cy="24" rx="4" ry="14" fill="#FFB8C6"/>
    <path d="M28 96c-3-22 6-36 22-36s25 14 22 36z" fill="#E9E3F5"/>
    <circle cx="74" cy="88" r="7" fill="#fff"/>
    <ellipse cx="50" cy="52" rx="22" ry="19" fill="#F4F0FA"/>
    <circle cx="42" cy="50" r="3.2" fill="${INK}"/><circle cx="58" cy="50" r="3.2" fill="${INK}"/>
    <ellipse cx="50" cy="57" rx="3" ry="2.2" fill="#FF8FA3"/>
    <path d="M50 59v3m0 0q-3 3-6 1m6-1q3 3 6 1" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <ellipse cx="36" cy="58" rx="4.5" ry="2.8" fill="#FFB8C6" opacity=".7"/><ellipse cx="64" cy="58" rx="4.5" ry="2.8" fill="#FFB8C6" opacity=".7"/>` });

  add('umbrella', { es: 'el paraguas', en: 'an umbrella', w: 20, svg: `
    <path d="M50 46v38q0 10-9 10t-8-8" stroke="#6B5B95" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M6 48C8 24 28 8 50 8s42 16 44 40c-5-5-12-5-15 0-4-5-11-5-14 0-4-5-11-5-15 0-3-5-10-5-14 0-3-5-10-5-15 0-3-5-10-5-15 0z" fill="#8C7CF0"/>
    <path d="M50 8c10 10 15 24 15 40-4-5-11-5-15 0-3-5-10-5-14 0 0-16 5-30 14-40z" fill="#FFD34D"/>
    <circle cx="50" cy="7" r="3.5" fill="#6B5B95"/>` });

  add('drum', { es: 'el tambor', en: 'a drum', w: 17, tap: 'bounce', svg: `
    <path d="M14 40v36c0 10 16 18 36 18s36-8 36-18V40z" fill="#FF6B6B"/>
    <path d="M14 46l12 44M32 50l8 44M50 50v44M68 50l-8 44M86 46L74 90" stroke="#FFD34D" stroke-width="3"/>
    <ellipse cx="50" cy="40" rx="36" ry="13" fill="#FFF7EC"/>
    <ellipse cx="50" cy="40" rx="36" ry="13" fill="none" stroke="#E8604F" stroke-width="4"/>
    <path d="M30 8l16 26M74 6L56 33" stroke="#B07A4F" stroke-width="4" stroke-linecap="round"/>
    <circle cx="29" cy="7" r="5" fill="#FFF7EC"/><circle cx="75" cy="5" r="5" fill="#FFF7EC"/>` });

  add('car', { es: 'el coche', en: 'a car', w: 22, tap: 'drive', vb: '0 0 100 70', svg: `
    <path d="M18 30l10-18c2-4 5-6 9-6h22c4 0 7 2 9 5l12 19z" fill="#5BC8F5"/>
    <path d="M30 28l7-14c1-2 2-3 4-3h7v17zM54 11h5c2 0 3 1 4 2l8 15H54z" fill="#D7F2FF"/>
    <rect x="6" y="28" width="88" height="26" rx="12" fill="#FF6B6B"/>
    <rect x="80" y="34" width="10" height="7" rx="3.5" fill="#FFE071"/>
    <circle cx="27" cy="55" r="11" fill="${INK}"/><circle cx="27" cy="55" r="4.5" fill="#D5DEF5"/>
    <circle cx="73" cy="55" r="11" fill="${INK}"/><circle cx="73" cy="55" r="4.5" fill="#D5DEF5"/>` });

  add('bed', { es: 'la cama', en: 'a bed', w: 44, vb: '0 0 100 64', svg: `
    <rect x="4" y="6" width="16" height="54" rx="6" fill="#B07A4F"/>
    <rect x="80" y="22" width="16" height="38" rx="6" fill="#B07A4F"/>
    <rect x="12" y="30" width="78" height="20" rx="6" fill="#FFF7EC"/>
    <path d="M40 26h50a4 4 0 0 1 4 4v18a6 6 0 0 1-6 6H40z" fill="#8C7CF0"/>
    <path d="M40 26h10v28H40z" fill="#A99BFF"/>
    <circle cx="66" cy="38" r="3" fill="#FFD34D"/><circle cx="80" cy="34" r="3" fill="#FFD34D"/><circle cx="74" cy="46" r="3" fill="#FFD34D"/>
    <rect x="18" y="20" width="24" height="14" rx="7" fill="#fff"/>
    <rect x="8" y="50" width="86" height="8" rx="4" fill="#8F6040"/>` });

  add('table', { es: 'la mesa', en: 'a table', w: 30, vb: '0 0 100 70', svg: `
    <rect x="6" y="14" width="88" height="12" rx="6" fill="#E8875B"/>
    <rect x="10" y="24" width="80" height="6" rx="3" fill="#D9744A"/>
    <rect x="16" y="28" width="9" height="40" rx="4" fill="#D9744A"/>
    <rect x="75" y="28" width="9" height="40" rx="4" fill="#D9744A"/>
    <rect x="44" y="2" width="14" height="13" rx="3" fill="#5BC8F5"/>` });

  add('chair', { es: 'la silla', en: 'a chair', w: 18, svg: `
    <rect x="26" y="8" width="48" height="44" rx="12" fill="#3DBE7A"/>
    <rect x="34" y="16" width="32" height="6" rx="3" fill="#5BD597"/><rect x="34" y="28" width="32" height="6" rx="3" fill="#5BD597"/>
    <rect x="20" y="52" width="60" height="12" rx="6" fill="#2FA566"/>
    <rect x="24" y="62" width="8" height="34" rx="4" fill="#2A915A"/>
    <rect x="68" y="62" width="8" height="34" rx="4" fill="#2A915A"/>` });

  add('kite', { es: 'la cometa', en: 'a kite', w: 16, wall: true, tap: 'float', svg: `
    <path d="M50 4l30 34-30 42-30-42z" fill="#FF6FA0"/>
    <path d="M50 4l30 34H50zM50 38v42L20 38z" fill="#FFD34D"/>
    <path d="M50 80c-6 6 6 8 0 14" stroke="#6B5B95" stroke-width="2.5" fill="none"/>
    <path d="M44 86l6 3-6 3zM56 92l-6 3 6 3z" fill="#5BC8F5"/>` });

  add('duck', { es: 'el pato', en: 'a duck', w: 14, tap: 'hearts', svg: `
    <path d="M14 66c0-12 10-18 22-16 4-14 24-14 30 0 10-2 22 2 22 14 0 18-16 30-38 30S14 84 14 66z" fill="#FFD34D"/>
    <path d="M60 64c10 0 14 8 10 16-6-2-12-8-10-16z" fill="#F7C12E"/>
    <circle cx="44" cy="38" r="20" fill="#FFDD5C"/>
    <path d="M22 40c-8 0-12 4-12 6 0 3 6 5 14 4z" fill="#FF8A3D"/>
    <circle cx="38" cy="33" r="3.4" fill="${INK}"/><circle cx="39.2" cy="31.8" r="1.1" fill="#fff"/>
    <ellipse cx="46" cy="44" rx="5" ry="3" fill="#FF8FA3" opacity=".6"/>` });

  add('dice', { es: 'el dado', en: 'a dice', w: 13, tap: 'roll', dice: true, svg: `
    <rect x="10" y="22" width="76" height="76" rx="16" fill="#E9E3F5"/>
    <rect x="6" y="14" width="76" height="76" rx="16" fill="#fff"/>
    <g class="pips" fill="${INK}"></g>` });

  add('star', { es: 'la estrella', en: 'a star', w: 13, wall: true, tap: 'spin2', svg: `
    <path d="M50 6l13 27 29 4-21 20 5 29-26-14-26 14 5-29L8 37l29-4z" fill="#FFD34D"/>
    <path d="M50 6l13 27 29 4-21 20 5 29-26-14z" fill="#FFC21F"/>
    <circle cx="42" cy="46" r="3" fill="${INK}"/><circle cx="58" cy="46" r="3" fill="${INK}"/>
    <path d="M45 55q5 4 10 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>` });

  add('guitar', { es: 'la guitarra', en: 'a guitar', w: 13, tap: 'wiggle', vb: '0 0 60 100', svg: `
    <rect x="26" y="4" width="8" height="46" rx="3" fill="#8F6040"/>
    <rect x="23" y="2" width="14" height="10" rx="3" fill="#6B4730"/>
    <path d="M30 40c10 0 16 6 15 14-1 6-6 8-6 10 0 3 9 6 9 16 0 10-8 16-18 16S12 90 12 80c0-10 9-13 9-16 0-2-5-4-6-10-1-8 5-14 15-14z" fill="#FF8A3D"/>
    <circle cx="30" cy="66" r="6" fill="#6B4730"/>
    <path d="M28 10v76M32 10v76" stroke="#FFF3E0" stroke-width="1"/>
    <rect x="22" y="80" width="16" height="4" rx="2" fill="#6B4730"/>` });

  AG.things = T;
  AG.thingKeys = Object.keys(T);
  AG.thingWord = (k) => {
    const t = T[k];
    if (!t) return '';
    return document.documentElement.lang === 'en' ? t.en : t.es;
  };
  /* dice faces: pip positions on a 3×3 grid */
  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  AG.diceFace = (el, n) => {
    const g = el.querySelector('.pips');
    if (!g) return;
    g.innerHTML = PIPS[n].map((p) => `<circle cx="${24 + (p % 3) * 20}" cy="${32 + Math.floor(p / 3) * 20}" r="6.5"/>`).join('');
    el.dataset.face = n;
  };
  AG.thingSvg = (k) => {
    const t = T[k];
    return `<svg viewBox="${t.vb || '0 0 100 100'}" aria-hidden="true">${t.svg}</svg>`;
  };
  AG.thingEl = (k, extra) => {
    const t = T[k];
    const e = AG.h('span.thing.k-' + k + (extra ? '.' + extra : ''), { html: AG.thingSvg(k) });
    if (t.dice) AG.diceFace(e, 5);
    return e;
  };
})();
