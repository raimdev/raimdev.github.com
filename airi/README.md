# Airi games (raim.dev/airi)

Offline iPad learning games built from Airi's school books, published as part of raim.dev (this Hugo site).

| URL | What |
|---|---|
| `raim.dev/airi/` | catalog of the games |
| `raim.dev/airi/letras/` | **Letras**: *lecto-1*, pages 16–25 (vowels, P, M, L, review, S, T, D, N, F, review) |
| `raim.dev/airi/numeros/` | **Números**: maths Unidad 1 "Números hasta 10", fichas 3–6 + extra sums |
| `raim.dev/airi/english/` | **English**: Unit 1 "Time for school" (class presentation): school things, sports equipment, have got / has got, our / their, exam practice |

Each game is a separate PWA, with its own manifest, service worker, icon, offline cache and progress. On the iPad, open a game
from the catalog in Safari and choose Share → **Add to Home Screen**. Open the new icon once while online, and it works offline from then on.

## Play style (buddy, presents, room)
The look follows the ideas of open-ended play apps for kids (no failing, everything reacts to a touch, playful flat art); all art is original.
- **Toy buttons**: bright pastel tiles, chunky buttons that squish when pressed, little stars around a right answer.
- **The buddy**: a round yellow friend at the bottom of every task. Right answer → it cheers; wrong answer → it tilts its head and thinks. It is never sad.
- **Presents**: finishing an activity for the first time, or with more stars than before, gives a present to tap open (a cat, a lamp, a ball…).
- **The room** (`#/room`, button *Mi cuarto*): free play with no rules. Drag presents in from the shelf, move them, tap them (they move, light up,
  and show their word: *el gato*, or *a cat* in English; the dice shows a number word), paint the wall and the floor. Saved per game on the iPad.
- **Calm**: the parent setting *Анимация → Өшірулі* (or the iPad's *Reduce Motion*) stops the decorative movement.

## Preview of a branch: raim.dev/airi-tocaboca/
`node airi/tools/build.mjs --base airi-tocaboca` writes a second copy to `static/airi-tocaboca/`. It uses its own cache names
(`airi-tocaboca-<game>-…`) and its own saved progress (`airi-tocaboca-<game>`), so it can be installed next to the apps at `/airi/`
without touching them. To make a branch's version the main one, run `node airi/tools/build.mjs` (writes `static/airi`) and delete `static/airi-tocaboca`.

## How it fits into the site (Hugo, GitHub Pages)
- `airi/` holds the source: shared framework, games, build script. Hugo ignores it.
- `static/airi/` holds the **generated** apps. Hugo copies `static/` to the site root unchanged, so they are served at
  `raim.dev/airi/…`. They are committed, so the normal GitHub Actions build (`.github/workflows/hugo.yml`) publishes them
  on every push to `main`.

After you change anything in `airi/src`, rebuild and commit both folders:
```bash
node airi/tools/build.mjs        # regenerates static/airi (only that folder is replaced)
hugo server                      # check at http://localhost:1313/airi/
git add airi static/airi && git commit -m "airi: …" && git push
```
Each app caches itself as `./`, so link to folders (`/airi/letras/`) rather than to `index.html`.
After a deploy, the iPad gets the new version the next time the app is opened online.

## Structure
```
airi/src/shared/js/core.js        screens, router, task flow (↺ / →), progress, item renderer, sparkles, presents on the finish screen
airi/src/shared/js/art.js         original SVG art: the buddy (moods), the present box, the room things (+ their es / en words)
airi/src/shared/js/activities.js  activity types: show, choose, multi, build, match, trace
airi/src/shared/js/room.js        presents (which thing to give) and the room screen (drag, tap, paint, shelf)
airi/src/shared/js/strokes.js     handwriting model: joined cursive lowercase, capitals, digits + drawing helpers
airi/src/shared/js/parent.js      parent area (Kazakh): guide, settings, progress, install status
airi/src/shared/css/app.css       styles (iPad landscape and portrait)
airi/src/shared/fonts/            Andika (print), Playwrite ES (Spanish school cursive), Fredoka (playful UI titles and buttons)
airi/src/games/<id>/meta.json     app name, description, colours, order in the catalog
airi/src/games/<id>/game.js       the book: lessons and activity generators
airi/src/games/<id>/icons/, img/  app icons, ARASAAC pictograms (webp)
airi/tools/build.mjs              builds static/airi: catalog + one app per game
```

## Adding a game (another book)
Copy `airi/src/games/numeros` to `airi/src/games/<id>` and edit `meta.json` (`id`, names, colours, `order`), `game.js` and `icons/`.
Then run `node airi/tools/build.mjs`. The game appears in the catalog at `raim.dev/airi/<id>/`.

`game.js` registers one game:
```js
AG.game({
  id: 'colores', title: 'Colores', icon: '🎨', color: '#E36BAE', color2: '#F4A7CF',
  kk: ['Kazakh notes about the game'],
  lessons: [{
    id: 'l1', label: '🔴 🔵', title: 'Los colores', page: 5, kk: ['Kazakh notes for this lesson'],
    activities: () => [ { id, type, icon, title, es, kkShort, kk, make: ({ n }) => [task, task, …] }, … ],
  }],
});
```
`es` is a short Spanish instruction shown under the title, `kkShort` is the Kazakh line on the activity tile, and `kk` is the Kazakh tip behind **?**.
`make({ n })` returns the tasks, where `n` is the "number of tasks" setting. Build them at random so every replay differs.
Never rename `id`s after use, because progress is saved under them.

### Items
```js
{ img: 'pato' }  { text: 'pato', art: 'el' }  { text: '__to' }  { num: 7 }  { emoji: '🐦' }
{ letters: 'P p' }  { syls: ['pa','pe'] }  { spell: 'MEDUSA' }  { row: [item, '+', item, '=', '?'] }
{ count: { n: 5, emoji: '🍓', layout: 'rows|scatter|plate|frame|line' } }   // tap to number them
{ style: 'print' | 'cursive', cls: 'css-class', times: 2 }
```

### Activity types (one task each; nothing advances by itself: ↺ restarts the task, → goes on)
| type | task |
|---|---|
| `show` | `{ cards: [item…] }` |
| `choose` | `{ q?, prompt?, options: [item…], answer: index, fill?, after? }` |
| `multi` | `{ q?, prompt?, options: [item…], answers: [index…] }` |
| `build` | `{ prompt?, slots: [{answer}|{fixed}], tiles: [value|{v,color}], tileStyle?, after? }` |
| `match` | `{ left: [item…], right: [item…] }` (left[i] ↔ right[i]) |
| `trace` | `{ glyph: 'pa', after? }`: cursive with start dot, arrows and ▶ demo; checked in stroke order |

### Handwriting model (`strokes.js`)
The units match the school writing lines: ascender line `y=0`, x-height line `y=50`, baseline `y=100`, descender line `y=150`.
Lowercase letters are SVG paths from the body start `s` to the right edge (exit at `y=90`, or `y=55` for `o`). Entry strokes
are added automatically, so letters join into words. Late strokes (dot of *i*, bar of *t*) are drawn after the word.
The model covers `a e i o u p m l s t d n f`, the matching capitals and `0–9`.

## Credits and licences
- Pictograms: Sergio Palao. Origin: ARASAAC (<https://arasaac.org>). Licence: CC BY-NC-SA. Owner: Gobierno de Aragón (Spain). Non-commercial use only.
- Fonts: Andika (SIL International), Playwrite ES (TypeTogether) and Fredoka (The Fredoka Project Authors), all under the SIL Open Font License.
- Buddy, present and room art: drawn for this project (inline SVG in `art.js`).
- Word lists and exercise ideas follow Airi's school books, for personal practice. No book pages are included.
