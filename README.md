# BR Chore Tracker — Firebase opzetten (eenmalig, ~10 min)

Je app gebruikt nu **Firebase Firestore** als gedeelde, live database. Dat betekent:
je huisgenoten zien allemaal dezelfde stand van zaken, op elk apparaat, direct
bijgewerkt zodra iemand een taak afvinkt. Firebase is gratis voor dit soort kleine
gebruik (het "Spark"-plan, geen creditcard nodig).

## Stap 1 — Maak een Firebase-project
1. Ga naar https://console.firebase.google.com
2. Log in met een Google-account en klik **"Project toevoegen"**
3. Geef het een naam, bv. `br-chore-tracker`
4. Google Analytics mag je uitzetten (niet nodig)
5. Klik **"Project maken"**

## Stap 2 — Zet Firestore Database aan
1. Klik in het linkermenu op **Build → Firestore Database**
2. Klik **"Database maken"**
3. Kies een locatie dichtbij (bv. `eur3 (Europe)`)
4. Kies **"Starten in testmodus"** (we vervangen de regels hierna zelf)

## Stap 3 — Zet de beveiligingsregels goed
Testmodus verloopt na 30 dagen. Vervang de regels door onderstaande, zodat alleen
het `completions`-overzicht gelezen/geschreven kan worden (voldoende voor deze app):

1. Ga naar het tabblad **"Rules"** binnen Firestore Database
2. Vervang de inhoud door:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /completions/{docId} {
      allow read, write: if true;
    }
  }
}
```

3. Klik **"Publiceren"**

> ⚠️ Let op: deze regels zijn open — iedereen die de link naar je project weet kan
> in theorie meelezen/schrijven. Voor een chore tracker tussen huisgenoten is dat
> een prima afweging (geen gevoelige data), maar het is geen bank-niveau beveiliging.

## Stap 4 — Maak een webapp aan en kopieer de configuratie
1. Ga naar **Project instellingen** (tandwiel-icoon linksboven) → **Algemeen**
2. Scroll naar **"Jouw apps"** → klik het **`</>`** (web) icoon
3. Geef de app een bijnaam, bv. `chore-tracker-web` → **"App registreren"**
4. Je krijgt een blokje code met `const firebaseConfig = { ... }`
5. Kopieer die 6 regels (apiKey, authDomain, projectId, etc.)

## Stap 5 — Plak je configuratie in het project
1. Open `firebase-config.js` in VS Code
2. Vervang de placeholder-waarden door wat je net hebt gekopieerd
3. Opslaan

Dat is alles — de app praat nu met jouw eigen Firestore-database.

## Stap 6 — De app online zetten (zodat iedereen 'm op z'n telefoon kan gebruiken)
Lokaal openen (dubbelklikken op `index.html`) werkt om te testen, maar je
huisgenoten hebben pas overal toegang als de site online staat. Snelste gratis opties:

**Optie A: Firebase Hosting (hoort bij hetzelfde project)**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # kies je project, public folder = huidige map, single-page app = No
firebase deploy
```
Je krijgt een gratis `.web.app`-linkje dat je met je huisgenoten kan delen.

**Optie B: GitHub Pages**
Zet de map in een GitHub-repository en zet Pages aan via de repo-instellingen.

## Problemen oplossen
- **Laadscherm blijft hangen / "Kan geen verbinding maken"** → check of je
  `firebase-config.js` goed hebt ingevuld en of Firestore (stap 2) echt aanstaat.
- **"Missing or insufficient permissions"** in de browserconsole → je Rules
  (stap 3) zijn nog niet gepubliceerd of kloppen niet.
- Open de browserconsole (rechtermuisknop → Inspecteren → Console) voor
  foutmeldingen als er iets niet werkt.
