/* ============================================================
   DATA.JS — Alle inhoud die je zelf mag aanpassen
   ============================================================
   - Huisgenoten (PEOPLE): naam en kleur
   - Taken (TASKS): naam, icoon en de instructietekst
   - Planning (SCHEDULE): wie welke taak heeft, per week
   Wil je een tekst aanpassen? Dat kan gewoon hieronder.
   ============================================================ */

// -------------------- HUISGENOTEN --------------------
// "id" wordt intern gebruikt (niet aanpassen), "name" mag je wijzigen.
const PEOPLE = [
  { id: "rick", name: "Rick", colorClass: "card-pink" },
  { id: "sam", name: "Sam", colorClass: "card-blue" },
  { id: "ignash", name: "Nasi", colorClass: "card-orange" },
  { id: "romy", name: "Romy", colorClass: "card-green" }
];

/* -------------------- HUISREGELS --------------------
   Deze regels verschijnen in het pop-up scherm dat opent via het
   boek-icoontje onderin de app. Iedere regel heeft een "icon"
   (kies uit: book, info, bell, moon, heart, sparkle, trash, wind,
   bathtub) en een "text". Voeg gerust meer regels toe of verwijder
   ze, de lijst mag zo lang zijn als je wilt.
------------------------------------------------------------- */
const HOUSE_RULES = [
  { icon: "bell", text: "3 keer achter elkaar je taakje vergeten is koken en betalen voor het hele huis" },
  { icon: "sparkle", text: "Wie kookt ruimt nooit af - Ghandi" },
  { icon: "moon", text: "Feest gegeven = alle kamers in kwestie zelf opruimen" },
  { icon: "trash", text: "Glas gebost? Nieuwe stelen" },
  { icon: "info", text: "Mensen over de vloer gaarna vermelden" },
  { icon: "heart", text: "Clubverbod voor Dion, Mat, Carlijn, Pien, Dionne en alle andere griezels... Romy" }
];

// -------------------- TAKEN --------------------
// "icon" verwijst naar een icoon hieronder in icons.js (sparkle, trash, wind, bathtub)
// "greeting" en "instructions" mag je vrij aanpassen.
const TASKS = {
  badkamer: {
    name: "Badkamer & wc beneden",
    icon: "bathtub",
    instructions: "Maak de wastafel, douche/bad en wc beneden schoon. Vergeet de spiegel niet!"
  },
  woonkamer: {
    name: "Woonkamer & vuilnis",
    icon: "trash",
    instructions: "Zet de vuilnisbakken buiten voor donderdag. Vergeet het recycling niet! Stofzuig/ruim ook de woonkamer op."
  },
  zuigen: {
    name: "Rukbunker, trap, keuken en benedenhal zuigen",
    icon: "wind",
    instructions: "Stofzuig de rukbunker, de trap, de keuken en de hal beneden."
  },
  koelkast: {
    name: "Taaie week maat",
    icon: "sparkle",
    instructions: "Al het verotte gekanker uit de koelkast en de hele week de vaat in en uitruimen"
  }
};

/* -------------------- PLANNING --------------------
   Elke regel is één week (maandag t/m zondag).
   "week" = de maandag waarop die week begint (YYYY-MM-DD).
   "label" = het "weekend van ..." label zoals in het schema.
   Daaronder staat per taak wie hem die week doet.
   Wil je iets corrigeren of de planning verlengen na 3 januari?
   Voeg gewoon een nieuwe regel toe in hetzelfde patroon
   (elke week is +7 dagen, en de volgorde rick → romy → sam →
   ignash → rick... rouleert door de taken heen).
------------------------------------------------------------- */
const SCHEDULE = [
  { week: "2026-07-27", label: "Weekend van 1/2 aug", badkamer: "sam", woonkamer: "ignash", zuigen: "rick", koelkast: "romy" },
  { week: "2026-08-03", label: "Weekend van 8/9 aug", badkamer: "romy", woonkamer: "sam", zuigen: "ignash", koelkast: "rick" },
  { week: "2026-08-10", label: "Weekend van 15/16 aug", badkamer: "rick", woonkamer: "romy", zuigen: "sam", koelkast: "ignash" },
  { week: "2026-08-17", label: "Weekend van 22/23 aug", badkamer: "ignash", woonkamer: "rick", zuigen: "romy", koelkast: "sam" },
  { week: "2026-08-24", label: "Weekend van 29/30 aug", badkamer: "sam", woonkamer: "ignash", zuigen: "rick", koelkast: "romy" },
  { week: "2026-08-31", label: "Weekend van 5/6 sep", badkamer: "romy", woonkamer: "sam", zuigen: "ignash", koelkast: "rick" },
  { week: "2026-09-07", label: "Weekend van 12/13 sep", badkamer: "rick", woonkamer: "romy", zuigen: "sam", koelkast: "ignash" },
  { week: "2026-09-14", label: "Weekend van 19/20 sep", badkamer: "ignash", woonkamer: "rick", zuigen: "romy", koelkast: "sam" },
  { week: "2026-09-21", label: "Weekend van 26/27 sep", badkamer: "sam", woonkamer: "ignash", zuigen: "rick", koelkast: "romy" },
  { week: "2026-09-28", label: "Weekend van 3/4 okt", badkamer: "romy", woonkamer: "sam", zuigen: "ignash", koelkast: "rick" },
  { week: "2026-10-05", label: "Weekend van 10/11 okt", badkamer: "rick", woonkamer: "romy", zuigen: "sam", koelkast: "ignash" },
  { week: "2026-10-12", label: "Weekend van 17/18 okt", badkamer: "ignash", woonkamer: "rick", zuigen: "romy", koelkast: "sam" },
  { week: "2026-10-19", label: "Weekend van 24/25 okt", badkamer: "sam", woonkamer: "ignash", zuigen: "rick", koelkast: "romy" },
  { week: "2026-10-26", label: "Weekend van 31 okt", badkamer: "romy", woonkamer: "sam", zuigen: "ignash", koelkast: "rick" },
  { week: "2026-11-02", label: "Weekend van 7/8 nov", badkamer: "rick", woonkamer: "romy", zuigen: "sam", koelkast: "ignash" },
  { week: "2026-11-09", label: "Weekend van 14/15 nov", badkamer: "ignash", woonkamer: "rick", zuigen: "romy", koelkast: "sam" },
  { week: "2026-11-16", label: "Weekend van 21/22 nov", badkamer: "sam", woonkamer: "ignash", zuigen: "rick", koelkast: "romy" },
  { week: "2026-11-23", label: "Weekend van 28/29 nov", badkamer: "romy", woonkamer: "sam", zuigen: "ignash", koelkast: "rick" },
  { week: "2026-11-30", label: "Weekend van 5/6 dec", badkamer: "rick", woonkamer: "romy", zuigen: "sam", koelkast: "ignash" },
  { week: "2026-12-07", label: "Weekend van 12/13 dec", badkamer: "ignash", woonkamer: "rick", zuigen: "romy", koelkast: "sam" },
  { week: "2026-12-14", label: "Weekend van 19/20 dec", badkamer: "sam", woonkamer: "ignash", zuigen: "rick", koelkast: "romy" },
  { week: "2026-12-21", label: "Weekend van 26/27 dec", badkamer: "romy", woonkamer: "sam", zuigen: "ignash", koelkast: "rick" },
  { week: "2026-12-28", label: "Weekend van 2/3 jan", badkamer: "rick", woonkamer: "romy", zuigen: "sam", koelkast: "ignash" }
];
