# Decision log

Format: data — decyzja. Krótko: co, dlaczego, kiedy wracamy. Otwarte sprawy są w [[Decyzje do podjęcia]].

## Aktywne decyzje

### 2026-11-07 — Jedno repo = vault Obsidian + kod
Decyzja: `plynnosc` jest jednocześnie vaultem Obsidiana (`.obsidian/`, `00 Start/`, `wiki/`, `templates/`) i repo kodu (`app/`, `test/`). W `intradero-knowledge` wiedza i kod były osobno — tu projekt jest jednoosobowy i ma jedną apkę, więc dwa repo to koszt bez zysku.
Konsekwencje: Obsidian pokazuje tylko `.md` (pliki `.html`/`.js` ukryte). Wracamy, gdy pojawi się drugi produkt albo drugi współpracownik.

### 2026-11-07 — Stack: Opcja A „Vanilla+” (domyślna, do potwierdzenia)
Decyzja: bez frameworka i bez bundlera. Port idei (wężykowa ścieżka, streak) z react-duolingo, własne modale/toasty, podział na 3–4 pliki statyczne. Uzasadnienie: każdą zmianę robi agent LLM — jeden przebieg „czytaj → edytuj → test headless”; Opcja B (Vite+Preact) to 5–8 rund i build przy każdej zmianie. Szczegóły: [[Szablony UI – research i werdykt]].
Status: przyjęta jako domyślna; Alek może zawetować w [[Decyzje do podjęcia]].

### 2026-11-07 — Harness testowy jest jedyną bramką jakości
Decyzja: `node test/run.js && node test/round2.js` (Playwright, headless Chromium, 390×844, `file://`) musi być zielone przed publikacją. Ścieżki w harnessie względne do repo. Bez CI, bez Spec Kit, bez linterów na start — proces ma być tak mały, jak się da.
Wracamy, gdy pojawi się drugi deweloper albo zmiany zaczną się psuć między sesjami.

### 2026-11-07 — Publikacja: artefakt claude.ai pozostaje runtime'em v1
Decyzja: aplikacja żyje pod https://claude.ai/artifact/EUANdz59Df6hkaxVUsHR5P, bo tylko tam działa `claude.use("sample")` (ocena nagrań przez Claude bez własnego backendu i klucza API). Repo jest źródłem prawdy; artefakt = kopia `app/index.html`.
Wracamy, gdy ocena przez Claude przestanie być potrzebna w stronie albo pojawi się potrzeba instalacji PWA / pracy offline.

### 2026-11-07 — Terapia: program zintegrowany
Modyfikacja jąkania + miękki start / lekki kontakt / wydłużona mowa + praca z antycypacją, online, z transferem i utrzymaniem. Po wywiadzie: CBT na lęk mniej istotne; priorytet oddech/tempo/frazowanie/start „na sygnał” w warunkach, które blokują. Źródło: [[Program płynności]].

### 2026-11-07 — Jedna skala: SR 0–8
Tylko SR 0–8 (Camperdown) w całej aplikacji. Hierarchia 0–10 przeliczona ×0.8.

### 2026-11-07 — Architektura v2/v3: jedna aplikacja zamiast strony na dzień
Stan w localStorage pod kluczem `plynnosc`, 4 ekrany (Dziś / Oceń / Postępy / Ściągawka), komponenty `SRPicker`, `Timer`, `TopicCard`. Dzień 1 zaimportowany z `dzien-01.html` (archiwum).

## Archiwum decyzji
- (pusto)
