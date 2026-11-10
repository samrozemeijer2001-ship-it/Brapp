/* ============================================================
   ICONS.JS — Lafbekken-stijl: handgetekende lijnillustraties
   en de smileyset.
   ------------------------------------------------------------
   - ICONS: taakillustraties + UI-iconen. De namen (sparkle,
     trash, wind, bathtub, book, info, bell, moon, heart, ...)
     zijn gelijk gebleven, zodat data.js gewoon blijft werken.
   - FACES / smileySVG(): minimalistische gezichten (alleen ogen
     en mond) met groepen .eyes > .blink en .mouth, zodat app.js
     ze los kan laten knipperen, rondkijken en meebewegen.
   Alles is één kleur (currentColor) — de kleur komt uit de CSS.
   ============================================================ */

// Gedeelde lijn-instellingen voor alle illustraties (dikke, ronde lijnen)
const LINE = `fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"`;
// Dunnere variant voor de kleine UI-iconen (24×24)
const LINE_UI = `fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;

const ICONS = {
  /* ---------- TAAKILLUSTRATIES (viewBox 0 0 100 100) ---------- */

  // Stapel borden + sopbelletjes — "Taaie week maat" (vaat).
  // Naam 'sparkle' blijft voor data.js; ook gebruikt als 'geen taak'-symbool.
  sparkle: `<svg viewBox="0 0 100 100" ${LINE} aria-hidden="true">
    <path d="M10 66 H90"/>
    <path d="M18 66 Q22 84 40 84 H60 Q78 84 82 66"/>
    <path d="M16 52 L84 46"/>
    <path d="M22 50 Q27 39 48 37.5 Q71 36 79 46"/>
    <circle cx="34" cy="20" r="6" stroke-width="6"/>
    <circle cx="54" cy="14" r="4" stroke-width="5"/>
    <path d="M68 24 V25"/>
  </svg>`,

  // Vuilnisbak met scheef deksel — "Woonkamer & vuilnis"
  trash: `<svg viewBox="0 0 100 100" ${LINE} aria-hidden="true">
    <path d="M15 30 L85 22"/>
    <path d="M39 26 L37.5 17 Q37 13 41 12.5 L57 10.7 Q61 10.3 61.5 14.3 L62.5 22.5"/>
    <path d="M23 38 L28 85 Q28.6 91 34.6 91 H65.4 Q71.4 91 72 85 L77 38"/>
    <path d="M42 50 L43 79"/>
    <path d="M58 50 L57 79"/>
  </svg>`,

  // Stofzuiger met stofwolkjes — "zuigen" (naam 'wind' blijft voor data.js)
  wind: `<svg viewBox="0 0 100 100" ${LINE} aria-hidden="true">
    <path d="M62 10 H82"/>
    <path d="M72 10 L54 68"/>
    <path d="M30 68 H62 Q72 68 72 78 V84 Q72 90 66 90 H22 Q16 90 16 84 V82 Q16 68 30 68 Z"/>
    <path d="M28 79 H48"/>
    <path d="M12 54 V55"/>
    <path d="M22 46 V47"/>
    <path d="M8 66 V67"/>
  </svg>`,

  // Bad met douchekop en belletjes — "Badkamer & wc"
  bathtub: `<svg viewBox="0 0 100 100" ${LINE} aria-hidden="true">
    <path d="M10 52 H90"/>
    <path d="M16 52 V60 Q16 80 38 80 H62 Q84 80 84 60 V52"/>
    <path d="M30 80 L26 90"/>
    <path d="M70 80 L74 90"/>
    <path d="M24 52 V24 Q24 12 36 12 Q47 12 48 22"/>
    <path d="M40 30 Q48 22 56 30"/>
    <path d="M44 40 V41"/>
    <path d="M54 39 V40"/>
    <path d="M70 38 V39"/>
    <path d="M78 30 V31"/>
  </svg>`,

  /* ---------- UI-ICONEN (viewBox 0 0 24 24) ---------- */

  back: `<svg viewBox="0 0 24 24" ${LINE_UI} stroke-width="3.2" aria-hidden="true">
    <path d="M14.5 5 L7.5 12 L14.5 19"/>
  </svg>`,

  calendar: `<svg viewBox="0 0 24 24" ${LINE_UI} aria-hidden="true">
    <path d="M5 7 Q5 5 7 5 H17 Q19 5 19 7 V18 Q19 20 17 20 H7 Q5 20 5 18 Z"/>
    <path d="M5 10 H19"/><path d="M9 3 V6"/><path d="M15 3 V6"/>
  </svg>`,

  // Handgetekend kruisje (iets scheef = minder 'computer')
  cross: `<svg viewBox="0 0 24 24" ${LINE_UI} stroke-width="3.6" aria-hidden="true">
    <path d="M6.5 6 L17.8 17.5"/>
    <path d="M17.5 6.4 L6.2 17.6"/>
  </svg>`,

  check: `<svg viewBox="0 0 24 24" ${LINE_UI} stroke-width="3.4" aria-hidden="true">
    <path d="M5 12.5 L10 17.5 L19.5 6.5"/>
  </svg>`,

  book: `<svg viewBox="0 0 24 24" ${LINE_UI} aria-hidden="true">
    <path d="M12 6.5 Q8 4 4 5 V18.5 Q8 17.5 12 20 Q16 17.5 20 18.5 V5 Q16 4 12 6.5 Z"/>
    <path d="M12 6.5 V20"/>
  </svg>`,

  info: `<svg viewBox="0 0 24 24" ${LINE_UI} aria-hidden="true">
    <path d="M12 11 V17"/>
    <path d="M12 7 V7.2" stroke-width="3.6"/>
  </svg>`,

  bell: `<svg viewBox="0 0 24 24" ${LINE_UI} aria-hidden="true">
    <path d="M6 16 V11 Q6 5 12 5 Q18 5 18 11 V16 H5"/>
    <path d="M10 19.5 H14"/>
  </svg>`,

  moon: `<svg viewBox="0 0 24 24" ${LINE_UI} aria-hidden="true">
    <path d="M17.5 14.5 Q11 15.5 9.5 9.5 Q9 7 10.5 4.5 Q4.5 6 4.5 12.5 Q5 19.5 12 19.5 Q16 19.5 17.5 14.5 Z"/>
  </svg>`,

  heart: `<svg viewBox="0 0 24 24" ${LINE_UI} aria-hidden="true">
    <path d="M12 19.5 Q4 14 4 9.3 Q4 5.5 7.7 5.5 Q10.5 5.5 12 8.5 Q13.5 5.5 16.3 5.5 Q20 5.5 20 9.3 Q20 14 12 19.5 Z"/>
  </svg>`
};

/* ============================================================
   SMILEYS
   viewBox "8 10 84 84", stroke-width 8, ronde uiteinden.
   Opbouw: <g class="eyes"><g class="blink">…ogen…</g></g>
           <g class="mouth">…mond…</g>
   ============================================================ */

const DOT = (x, y) => `<circle cx="${x}" cy="${y}" r="6.5" fill="currentColor" stroke="none"/>`;
// Afgeronde viertandige ster voor "stars"-ogen
const STAR = (x, y) =>
  `<path d="M${x} ${y - 9} Q${x + 2} ${y - 2} ${x + 9} ${y} Q${x + 2} ${y + 2} ${x} ${y + 9} Q${x - 2} ${y + 2} ${x - 9} ${y} Q${x - 2} ${y - 2} ${x} ${y - 9} Z" fill="currentColor" stroke-width="5"/>`;

const FACES = {
  // stipogen + grote open lach
  happy: {
    eyes: DOT(35, 40) + DOT(65, 40),
    mouth: `<path d="M30 59 H70 Q70 81 50 81 Q30 81 30 59 Z" fill="currentColor"/>`
  },
  // ontspannen gebogen ogen + vriendelijke lach
  relieved: {
    eyes: `<path d="M27 39 Q35 47 43 39"/><path d="M57 39 Q65 47 73 39"/>`,
    mouth: `<path d="M34 63 Q50 77 66 63"/>`
  },
  // halfgesloten ogen + klein mondje
  sleepy: {
    eyes: `<path d="M27 43 H43"/><path d="M57 43 H73"/><path d="M29 43 Q35 49 41 43" stroke-width="6"/><path d="M59 43 Q65 49 71 43" stroke-width="6"/>`,
    mouth: `<path d="M45 69 Q50 64 55 69"/>`
  },
  // één streepoog, één stipoog + rechte mond
  meh: {
    eyes: `<path d="M27 41 H43"/>` + DOT(65, 41),
    mouth: `<path d="M36 67 H64"/>`
  },
  // stipogen + scheve grijns
  smirk: {
    eyes: DOT(35, 40) + DOT(65, 40),
    mouth: `<path d="M34 66 Q50 72 67 58"/>`
  },
  // sterogen + brede lach
  stars: {
    eyes: STAR(34, 39) + STAR(66, 39),
    mouth: `<path d="M26 58 H74 Q74 83 50 83 Q26 83 26 58 Z" fill="currentColor"/>`
  },
  // grote ogen + ovale open mond
  shock: {
    eyes: `<circle cx="34" cy="38" r="8.5"/><circle cx="66" cy="38" r="8.5"/>`,
    mouth: `<ellipse cx="50" cy="70" rx="8" ry="11"/>`
  },
  // dichtgeknepen ogen + golvende mond
  panic: {
    eyes: `<path d="M27 32 L41 39 L27 46"/><path d="M73 32 L59 39 L73 46"/>`,
    mouth: `<path d="M27 70 Q32 62 38.5 70 T50 70 T61.5 70 T73 70"/>`
  }
};

// Bouwt de SVG-string voor een uitdrukking (valt terug op "happy")
function smileySVG(name) {
  const f = FACES[name] || FACES.happy;
  return `<svg class="smiley" data-face="${name}" viewBox="8 10 84 84" ${LINE} aria-hidden="true">
    <g class="eyes"><g class="blink">${f.eyes}</g></g>
    <g class="mouth">${f.mouth}</g>
  </svg>`;
}
