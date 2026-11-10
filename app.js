/* ============================================================
   APP.JS — De logica van de Chore Tracker
   ============================================================
   Hoe werkt de week/kruisjes-logica? (ONGEWIJZIGD)
   - Elke week loopt van maandag t/m zondag 23:59.
   - Elke week in SCHEDULE (data.js) staat wie welke taak heeft.
   - Vink je je taak op tijd af (voor zondag 23:59)? Dan is die
     week goed gegaan.
   - Vink je 'm niet op tijd af? Dan krijg je +1 kruisje (max 3).
   - Doe je het de week daarna weer wél op tijd, en had je nog
     kruisjes staan? Dan gaat er 1 kruisje weer af.
   - Dit wordt bij elk bezoek van de app opnieuw berekend op basis
     van alle afgevinkte taken tot nu toe, dus er kan niets
     "verkeerd blijven staan".

   Nieuw in deze versie (alleen interface):
   - Lafbekken-schermen, smileys die leven, kleur-overgang,
     voltooid-animatie. De Firestore-koppeling, document-ID's
     ("personId_YYYY-MM-DD") en de kruisjesberekening zijn
     exact hetzelfde gebleven.
   ============================================================ */

// -------------------- OPSLAG (Firestore, gedeeld tussen huisgenoten) --------------------
// completions: { "personId_weekMonday": "2026-07-30T21:15:00.000Z" }
// Wordt gevuld door de live listener hieronder (onSnapshot), niet lokaal opgeslagen.
let completions = {};
let firestoreReady = false;

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const completionsRef = db.collection("completions");

// Live luisteren: zodra iemand (op wélk apparaat dan ook) een taak afvinkt,
// updaten alle open schermen automatisch.
completionsRef.onSnapshot(
  (snapshot) => {
    const updated = {};
    snapshot.forEach((doc) => {
      const d = doc.data();
      if (d && d.completedAt) updated[doc.id] = d.completedAt;
    });
    completions = updated;
    firestoreReady = true;
    hideLoadingOverlay();
    renderHome();
    if (currentPersonId) renderDetail(currentPersonId);
  },
  (error) => {
    console.error("Firestore fout:", error);
    showLoadingOverlay("Kan geen verbinding maken. Check firebase-config.js en je internetverbinding.", true);
  }
);

function markCompleted(personId, weekIso) {
  const id = `${personId}_${weekIso}`;
  return completionsRef.doc(id).set({
    personId,
    week: weekIso,
    completedAt: new Date().toISOString()
  });
}

// -------------------- DATUM HELPERS --------------------
function toDateOnly(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
// Maandag van de week waarin "date" valt (00:00)
function mondayOf(date) {
  const d = toDateOnly(date);
  const day = d.getDay(); // 0 = zondag, 1 = maandag ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function isoDate(d) {
  // Let op: NIET d.toISOString() gebruiken — die rekent om naar UTC en
  // kan daardoor een dag verschuiven t.o.v. de lokale datum (bug!).
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
// Deadline van een week = zondag 23:59:59 van die week
function deadlineOf(weekMondayDate) {
  const sunday = addDays(weekMondayDate, 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

const MONTHS = ["JAN","FEB","MRT","APR","MEI","JUN","JUL","AUG","SEP","OKT","NOV","DEC"];
const DAYS = ["ZO","MA","DI","WO","DO","VR","ZA"];

// "9 – 15 NOV" of "30 NOV – 6 DEC"
function formatWeekRange(weekMondayDate) {
  const sunday = addDays(weekMondayDate, 6);
  const sameMonth = sunday.getMonth() === weekMondayDate.getMonth();
  const a = sameMonth
    ? `${weekMondayDate.getDate()}`
    : `${weekMondayDate.getDate()} ${MONTHS[weekMondayDate.getMonth()]}`;
  return `${a} – ${sunday.getDate()} ${MONTHS[sunday.getMonth()]}`;
}
// ISO-weeknummer (alleen voor weergave)
function isoWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}
// "AFGEVINKT DI 10 NOV · 21:15"
function formatDoneMoment(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `AFGEVINKT ${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} · ${hh}:${mm}`;
}

const NOW = new Date();
const CURRENT_WEEK = mondayOf(NOW);

// Staat de app dagen open (bv. als web-app op het beginscherm) en is het
// inmiddels een nieuwe week? Dan herladen, zodat de nieuwe week klopt.
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && isoDate(mondayOf(new Date())) !== isoDate(CURRENT_WEEK)) {
    location.reload();
  }
});

// -------------------- SCHEMA OPZOEKEN --------------------
function scheduleForWeek(weekMondayDate) {
  const key = isoDate(weekMondayDate);
  return SCHEDULE.find(row => row.week === key) || null;
}
function taskIdForPerson(row, personId) {
  return Object.keys(TASKS).find(taskId => row[taskId] === personId) || null;
}

// -------------------- KRUISJES BEREKENEN --------------------
// Loopt alle weken vóór de huidige week af en telt kruisjes op/af.
function calculateStrikes(personId) {
  let strikes = 0;
  const pastWeeks = SCHEDULE.filter(row => row.week < isoDate(CURRENT_WEEK));
  for (const row of pastWeeks) {
    const taskId = taskIdForPerson(row, personId);
    if (!taskId) continue; // had deze week geen taak
    const weekMonday = new Date(row.week + "T00:00:00");
    const deadline = deadlineOf(weekMonday);
    const completedAt = completions[`${personId}_${row.week}`];
    const madeIt = completedAt && new Date(completedAt) <= deadline;
    if (madeIt) {
      if (strikes > 0) strikes -= 1;
    } else {
      strikes = Math.min(3, strikes + 1);
    }
  }
  return strikes;
}

// Alles wat een scherm over één persoon moet weten, op één plek
function stateFor(personId) {
  const row = scheduleForWeek(CURRENT_WEEK);
  const taskId = row ? taskIdForPerson(row, personId) : null;
  const task = taskId ? TASKS[taskId] : null;
  const key = `${personId}_${isoDate(CURRENT_WEEK)}`;
  return {
    task,
    done: !!completions[key],
    completedAt: completions[key] || null,
    strikes: calculateStrikes(personId)
  };
}

// Welke smiley past bij deze toestand?
function faceFor(s) {
  if (!s.task) return "sleepy";
  if (s.done) return s.strikes >= 2 ? "relieved" : "happy";
  if (s.strikes >= 3) return "panic";
  if (s.strikes === 2) return "shock";
  return s.strikes === 1 ? "meh" : "smirk";
}

// ============================================================
// SMILEYS TOT LEVEN WEKKEN
// Knipperen (2,4–6,5 s, 170–230 ms, ~18% dubbel), rondkijken
// (1,3–3,8 s) en een mond die met vertraging meebeweegt.
// ============================================================
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (a, b) => a + Math.random() * (b - a);

// Zet een uitdrukking in een houder; doet niets als die al klopt
// (zo herstart de animatie niet bij elke live-update).
function setFace(holder, expression) {
  if (holder.dataset.face === expression) return;
  holder.dataset.face = expression;
  holder.innerHTML = smileySVG(expression);
  bringToLife(holder.firstElementChild);
}

function bringToLife(svg) {
  if (REDUCED_MOTION || !svg) return;
  const eyes = svg.querySelector(".eyes");
  const blink = svg.querySelector(".blink");
  const mouth = svg.querySelector(".mouth");

  function blinkOnce(after) {
    const dur = rand(170, 230);
    blink.style.transitionDuration = `${dur / 2}ms`;
    blink.classList.add("shut");
    setTimeout(() => {
      blink.classList.remove("shut");
      setTimeout(after, dur / 2);
    }, dur / 2);
  }
  function scheduleBlink() {
    setTimeout(() => {
      if (!svg.isConnected) return; // smiley is vervangen → stoppen
      blinkOnce(() => {
        if (Math.random() < 0.18) setTimeout(() => blinkOnce(scheduleBlink), rand(90, 150));
        else scheduleBlink();
      });
    }, rand(2400, 6500));
  }
  function scheduleLook() {
    setTimeout(() => {
      if (!svg.isConnected) return;
      if (Math.random() < 0.3) {
        // even recht vooruit kijken
        eyes.style.transform = "";
        mouth.style.transform = "";
      } else {
        const x = rand(-4.5, 4.5);
        const y = rand(-3, 2.5);
        eyes.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
        mouth.style.transform = `translate(${(x * 0.45).toFixed(2)}px, ${(y * 0.35).toFixed(2)}px)`;
      }
      scheduleLook();
    }, rand(1300, 3800));
  }
  scheduleBlink();
  scheduleLook();
}

// Speel een CSS-animatieklasse (opnieuw) af
function replay(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth; // reflow forceert herstart
  el.classList.add(cls);
}

// -------------------- KRUISJES TEKENEN --------------------
// Bouwt 3 vakjes één keer en werkt daarna alleen de stand bij.
// Een nieuw kruisje 'popt' even.
function renderStrikes(container, count) {
  if (container.children.length !== 3) {
    container.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const span = document.createElement("span");
      span.className = "strike";
      span.innerHTML = ICONS.cross;
      container.appendChild(span);
    }
  }
  const previous = container.dataset.count === undefined ? null : Number(container.dataset.count);
  [...container.children].forEach((span, i) => {
    const active = i < count;
    span.classList.toggle("strike-active", active);
    if (previous !== null && active && i >= previous) replay(span, "pop");
  });
  container.dataset.count = String(count);
  container.setAttribute("aria-label", `${count} van 3 kruisjes`);
}

// ============================================================
// SCHERM A — HOME
// ============================================================
const app = document.getElementById("app");
const homeScreen = document.getElementById("home-screen");
const detailScreen = document.getElementById("detail-screen");
const cardsContainer = document.getElementById("cards-container");
const weekNumLabel = document.getElementById("week-num");
const weekRangeLabel = document.getElementById("week-range-label");
const weekLeftLabel = document.getElementById("week-left-label");

const cardRefs = {}; // personId → onderdelen van de kaart

// Kaarten één keer opbouwen; daarna alleen bijwerken (geen geflikker bij live-updates)
function buildCards() {
  PEOPLE.forEach((person, i) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `person-card ${person.colorClass}`;
    card.style.setProperty("--i", i);
    card.innerHTML = `
      <span class="card-photo">
        <span class="card-task"></span>
        <span class="card-done">KLAAR</span>
      </span>
      <span class="card-foot">
        <span class="card-name"></span>
        <span class="card-face face"></span>
      </span>
      <span class="strikes"></span>`;
    const nameEl = card.querySelector(".card-name");
    nameEl.textContent = person.name.toUpperCase();
    nameEl.style.setProperty("--len", Math.max(4, person.name.length));
    card.addEventListener("click", () => openDetail(person.id, card));
    cardsContainer.appendChild(card);

    cardRefs[person.id] = {
      card,
      task: card.querySelector(".card-task"),
      face: card.querySelector(".card-face"),
      strikes: card.querySelector(".strikes")
    };
  });
  replay(cardsContainer, "enter");
}

function renderHome() {
  weekNumLabel.textContent = isoWeekNumber(CURRENT_WEEK);
  weekRangeLabel.textContent = formatWeekRange(CURRENT_WEEK);
  const msLeft = deadlineOf(CURRENT_WEEK) - new Date();
  const daysLeft = Math.ceil(msLeft / 86400000);
  weekLeftLabel.textContent = daysLeft <= 1 ? "LAATSTE DAG" : `NOG ${daysLeft} DAGEN`;

  if (!cardsContainer.children.length) buildCards();

  PEOPLE.forEach(person => {
    const s = stateFor(person.id);
    const ref = cardRefs[person.id];

    const iconKey = s.task ? s.task.icon : "sparkle";
    if (ref.task.dataset.icon !== iconKey) {
      ref.task.dataset.icon = iconKey;
      ref.task.innerHTML = ICONS[iconKey] || ICONS.sparkle;
    }
    ref.card.classList.toggle("is-done", s.done);
    ref.card.setAttribute(
      "aria-label",
      `${person.name} — ${s.task ? s.task.name : "Geen taak deze week"}${s.done ? " — klaar" : ""}, ${s.strikes} kruisjes`
    );
    setFace(ref.face, faceFor(s));
    renderStrikes(ref.strikes, s.strikes);
  });
}

// ============================================================
// SCHERM B — PERSOONLIJK TAAKSCHERM
// ============================================================
const detailWeekLabel = document.getElementById("detail-week-label");
const detailGreeting = document.getElementById("detail-greeting");
const detailName = document.getElementById("detail-name");
const detailStrikesRow = document.getElementById("detail-strikes-row");
const detailFace = document.getElementById("detail-face");
const detailIcon = document.getElementById("detail-icon");
const detailTaskName = document.getElementById("detail-task-name");
const detailInstructions = document.getElementById("detail-instructions");
const detailButton = document.getElementById("detail-button");
const doneMeta = document.getElementById("done-meta");
const backButton = document.getElementById("back-button");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

let currentPersonId = null;
let currentColorClass = null;
let savingFor = null;        // personId waarvoor we nu aan het opslaan zijn
let celebrateFor = null;     // personId dat een feestje krijgt zodra 'klaar' binnenkomt
let errorTimer = null;

const BTN_TODO = "IK HEB HET GEDAAN";
const BTN_DONE = `<span class="btn-icon">${ICONS.check}</span>GEDAAN VOOR DEZE WEEK`;

// Wisselt de persoonskleur op een element
function applyColor(el, colorClass) {
  PEOPLE.forEach(p => el.classList.remove(p.colorClass));
  el.classList.add(colorClass);
}

// Vult het taakscherm (wordt ook aangeroepen bij elke live-update)
function renderDetail(personId) {
  const person = PEOPLE.find(p => p.id === personId);
  if (!person) return;
  const s = stateFor(personId);

  if (currentColorClass !== person.colorClass) {
    applyColor(detailScreen, person.colorClass);
    currentColorClass = person.colorClass;
  }

  detailWeekLabel.textContent = `WK ${isoWeekNumber(CURRENT_WEEK)} · ${formatWeekRange(CURRENT_WEEK)}`;
  detailGreeting.textContent = s.task ? `HOI ${person.name.toUpperCase()}, DIT IS JOUW KLUS` : `HOI ${person.name.toUpperCase()}`;
  detailName.textContent = person.name.toUpperCase();
  detailName.style.setProperty("--len", Math.max(3, person.name.length));
  renderStrikes(detailStrikesRow, s.strikes);
  setFace(detailFace, faceFor(s));

  const iconKey = s.task ? s.task.icon : "sparkle";
  if (detailIcon.dataset.icon !== iconKey) {
    detailIcon.dataset.icon = iconKey;
    detailIcon.innerHTML = ICONS[iconKey] || ICONS.sparkle;
  }

  detailScreen.classList.toggle("no-task", !s.task);
  detailScreen.classList.toggle("is-done", !!(s.task && s.done));

  if (s.task) {
    detailTaskName.textContent = s.task.name.toUpperCase();
    detailInstructions.textContent = s.task.instructions;
    doneMeta.textContent = s.done ? formatDoneMoment(s.completedAt) : "";

    if (s.done) {
      savingFor = null;
      detailButton.disabled = true;
      detailButton.classList.remove("is-saving", "is-error");
      detailButton.innerHTML = BTN_DONE;
      // Taak is net door ons afgevinkt → korte voltooid-animatie
      if (celebrateFor === personId) {
        celebrateFor = null;
        celebrate(person);
      }
    } else if (savingFor === personId) {
      detailButton.disabled = true;
      detailButton.classList.add("is-saving");
      detailButton.textContent = "BEZIG...";
    } else if (!detailButton.classList.contains("is-error")) {
      detailButton.disabled = false;
      detailButton.classList.remove("is-saving");
      detailButton.textContent = BTN_TODO;
    }
  } else {
    detailTaskName.textContent = "GEEN TAAK DEZE WEEK";
    detailInstructions.textContent = "Er staat voor deze week nog geen taak in de planning voor jou.";
    doneMeta.textContent = "";
  }
}

// Opent het taakscherm met een kleur-overgang vanuit de aangetikte kaart
function openDetail(personId, originEl) {
  currentPersonId = personId;
  clearTimeout(errorTimer);
  detailButton.classList.remove("is-error");
  renderDetail(personId);

  if (originEl) {
    const a = app.getBoundingClientRect();
    const r = originEl.getBoundingClientRect();
    detailScreen.style.setProperty("--ox", `${r.left + r.width / 2 - a.left}px`);
    detailScreen.style.setProperty("--oy", `${r.top + r.height / 2 - a.top}px`);
  }
  detailScreen.scrollTop = 0;
  detailScreen.classList.remove("closing");
  replay(detailScreen, "active");
  detailScreen.setAttribute("aria-hidden", "false");
  homeScreen.setAttribute("aria-hidden", "true");
  homeScreen.inert = true;
  updateStatusCover();

  const person = PEOPLE.find(p => p.id === personId);
  if (themeColorMeta && person) {
    themeColorMeta.content = getComputedStyle(detailScreen).getPropertyValue("--c-dark").trim() || "#141210";
  }
}

function closeDetail() {
  currentPersonId = null; // zodat live-updates het taakscherm niet opnieuw openen
  homeScreen.inert = false;
  homeScreen.setAttribute("aria-hidden", "false");
  detailScreen.setAttribute("aria-hidden", "true");
  if (themeColorMeta) themeColorMeta.content = "#141210";
  statusCover.classList.remove("show");
  renderHome();
  replay(cardsContainer, "enter");

  if (REDUCED_MOTION) {
    detailScreen.classList.remove("active");
    return;
  }
  detailScreen.classList.add("closing");
  setTimeout(() => {
    // Alleen sluiten als er intussen niet opnieuw een kaart is geopend
    if (!currentPersonId) {
      detailScreen.classList.remove("active", "closing");
      updateStatusCover();
    }
  }, 380);
}

detailButton.addEventListener("click", () => {
  if (!currentPersonId || detailButton.disabled) return;
  const personId = currentPersonId;
  savingFor = personId;
  celebrateFor = personId;
  detailButton.disabled = true;
  detailButton.classList.add("is-saving");
  detailButton.textContent = "BEZIG...";

  markCompleted(personId, isoDate(CURRENT_WEEK)).catch((err) => {
    console.error(err);
    savingFor = null;
    celebrateFor = null;
    hideCelebrate();
    if (currentPersonId !== personId) return;
    detailButton.classList.remove("is-saving");
    detailButton.classList.add("is-error");
    detailButton.disabled = false;
    detailButton.textContent = "MISLUKT — PROBEER OPNIEUW";
    renderDetail(personId);
    clearTimeout(errorTimer);
    errorTimer = setTimeout(() => {
      detailButton.classList.remove("is-error");
      if (currentPersonId) renderDetail(currentPersonId);
    }, 3500);
  });
  // De onSnapshot-listener hierboven ververst automatisch beide schermen
  // zodra het is opgeslagen (en start dan de voltooid-animatie).
});

backButton.addEventListener("click", closeDetail);

// ============================================================
// SCHERM C — VOLTOOID-ANIMATIE (kort, geen bevestiging nodig)
// ============================================================
const celebrateEl = document.getElementById("celebrate");
const celebrateFace = document.getElementById("celebrate-face");
const celebrateSub = document.getElementById("celebrate-sub");
const confettiEl = document.getElementById("confetti");
const CONFETTI_COLORS = ["#ffcc2e", "#7fe0a8", "#7fb7ff", "#b98cff", "#ff8a3d", "#ff5a3c", "#ff8fc8", "#fff6ea"];
let celebrateTimer = null;

function celebrate(person) {
  applyColor(celebrateEl, person.colorClass);
  celebrateSub.textContent = `${person.name.toUpperCase()} HEEFT DEZE WEEK GELEVERD`;
  celebrateFace.dataset.face = ""; // forceer verse smiley-animatie
  setFace(celebrateFace, "stars");

  // Eenmalige confetti-burst (vierkantjes in de huiskleuren)
  confettiEl.innerHTML = "";
  if (!REDUCED_MOTION) {
    for (let i = 0; i < 22; i++) {
      const bit = document.createElement("i");
      const angle = rand(0, Math.PI * 2);
      const dist = rand(140, 320);
      bit.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
      bit.style.setProperty("--ty", `${Math.sin(angle) * dist}px`);
      bit.style.setProperty("--rot", `${rand(-260, 260)}deg`);
      bit.style.setProperty("--s", `${rand(12, 26)}px`);
      bit.style.setProperty("--d", `${rand(0, 140)}ms`);
      bit.style.setProperty("--k", CONFETTI_COLORS[i % CONFETTI_COLORS.length]);
      confettiEl.appendChild(bit);
    }
  }

  celebrateEl.classList.remove("hide");
  replay(celebrateEl, "show");
  clearTimeout(celebrateTimer);
  celebrateTimer = setTimeout(hideCelebrate, 1700);
}

function hideCelebrate() {
  clearTimeout(celebrateTimer);
  if (!celebrateEl.classList.contains("show")) return;
  celebrateEl.classList.remove("show");
  celebrateEl.classList.add("hide");
  setTimeout(() => celebrateEl.classList.remove("hide"), REDUCED_MOTION ? 0 : 340);
}
celebrateEl.addEventListener("click", hideCelebrate); // tik = meteen weg

// -------------------- STATUSBALK-KAPJE --------------------
// Met de doorlopende statusbalk zou gescrolde tekst onder de klok door
// schuiven. Zodra de kopband uit beeld scrolt, verschijnt er een kapje in
// dezelfde kleur achter de klok.
const statusCover = document.getElementById("status-cover");
function updateStatusCover() {
  const onDetail = detailScreen.classList.contains("active") && !detailScreen.classList.contains("closing");
  const screen = onDetail ? detailScreen : homeScreen;
  const band = screen.querySelector(onDetail ? ".detail-bar" : ".home-topbar");
  const cover = statusCover.offsetHeight;
  const show = cover > 0 && band && screen.scrollTop > band.offsetHeight - cover - 4;
  statusCover.classList.toggle("on-detail", onDetail);
  if (onDetail) applyColor(statusCover, currentColorClass);
  statusCover.classList.toggle("show", !!show);
}
homeScreen.addEventListener("scroll", updateStatusCover, { passive: true });
detailScreen.addEventListener("scroll", updateStatusCover, { passive: true });

// -------------------- STATISCHE ICONEN --------------------
document.querySelector(".back-icon").innerHTML = ICONS.back;

// -------------------- LAADSCHERM --------------------
const loadingOverlay = document.getElementById("loading-overlay");
const loadingText = document.getElementById("loading-text");
const loadingFace = document.getElementById("loading-face");
setFace(loadingFace, "sleepy");

function showLoadingOverlay(text, isError) {
  loadingText.textContent = text || "Verbinden...";
  loadingOverlay.classList.toggle("is-error", !!isError);
  setFace(loadingFace, isError ? "panic" : "sleepy");
  loadingOverlay.style.display = "flex";
  loadingOverlay.classList.remove("is-hidden");
}
function hideLoadingOverlay() {
  if (loadingOverlay.style.display === "none") return;
  loadingOverlay.classList.add("is-hidden"); // eerst vervagen…
  setTimeout(() => {
    if (loadingOverlay.classList.contains("is-hidden")) loadingOverlay.style.display = "none"; // …dan weg
  }, REDUCED_MOTION ? 0 : 320);
}

// -------------------- HUISREGELS POP-UP --------------------
const rulesFab = document.getElementById("rules-fab");
const rulesFabIcon = document.getElementById("rules-fab-icon");
const rulesOverlay = document.getElementById("rules-overlay");
const rulesSheet = document.getElementById("rules-sheet");
const rulesClose = document.getElementById("rules-close");
const rulesCloseIcon = document.getElementById("rules-close-icon");
const rulesList = document.getElementById("rules-list");

rulesFabIcon.innerHTML = ICONS.book;
rulesCloseIcon.innerHTML = ICONS.cross;

// Iedere regel krijgt een eigen kleurpaar uit de huisstijl
const RULE_COLORS = [
  ["--yellow", "--yellow-ink"], ["--lilac", "--lilac-ink"], ["--mint", "--mint-ink"],
  ["--red", "--red-ink"], ["--sky", "--sky-ink"], ["--purple", "--purple-ink"],
  ["--orange", "--orange-ink"], ["--pink", "--pink-ink"], ["--cobalt", "--cobalt-ink"]
];

// Lijst met huisregels (HOUSE_RULES in data.js) eenmalig opbouwen
HOUSE_RULES.forEach((rule, i) => {
  const item = document.createElement("div");
  item.className = "rule-item";
  const [bg, ink] = RULE_COLORS[i % RULE_COLORS.length];
  item.style.setProperty("--k-bg", `var(${bg})`);
  item.style.setProperty("--k-ink", `var(${ink})`);
  item.style.setProperty("--i", i);

  const icon = document.createElement("span");
  icon.className = "rule-icon";
  icon.innerHTML = ICONS[rule.icon] || ICONS.info;

  const text = document.createElement("span");
  text.className = "rule-text";
  text.textContent = rule.text;

  item.appendChild(icon);
  item.appendChild(text);
  rulesList.appendChild(item);
});

function openRules() {
  rulesOverlay.classList.add("active");
  rulesSheet.classList.add("active");
  rulesSheet.setAttribute("aria-hidden", "false");
  rulesSheet.scrollTop = 0;
}
function closeRules() {
  rulesOverlay.classList.remove("active");
  rulesSheet.classList.remove("active");
  rulesSheet.setAttribute("aria-hidden", "true");
}

rulesFab.addEventListener("click", openRules);
rulesClose.addEventListener("click", closeRules);
rulesOverlay.addEventListener("click", closeRules);
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (rulesSheet.classList.contains("active")) closeRules();
  else if (currentPersonId) closeDetail();
});

// -------------------- START --------------------
// renderHome() wordt pas aangeroepen zodra de eerste Firestore-snapshot
// binnen is (zie onSnapshot hierboven). Tot die tijd blijft het laadscherm staan.
