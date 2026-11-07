# Płynność – trening płynności mowy (projekt osobisty Alka)

Repo = vault Obsidiana + kod. Zacznij od `00 Start/Start.md`, potem `wiki/decyzje/Decyzje do podjęcia.md` (czy Alek coś odhaczył) i `wiki/produkt/Backlog.md`.

## Zasady
- Język UI i dokumentów: polski. Instrukcje ćwiczeń ZAWSZE w aplikacji: „Co robisz / Jak to ma brzmieć / Czego nie robić / Dlaczego”, krótko i dokładnie.
- Jedna skala wszędzie: SR 0–8 (komponent `SRPicker`). Żadnych innych skal.
- Minimum kliknięć; powtórzenia liczone automatycznie przez timer; jedna wyraźna „następna akcja”.
- Aplikacja = statyczne pliki publikowane jako artefakt claude.ai (ograniczenia: `wiki/architektura/Publikacja (artefakt claude.ai).md`). Bez frameworka i bundlera (Opcja A), chyba że Alek zdecyduje inaczej.
- Prywatność: nagrania/transkrypty to treści osobiste; w stanie trzymamy tagi/liczniki, nie pełne transkrypty poza ostatnimi ocenami; nic nie wysyłamy poza `claude.use("sample")`. W repo nigdy nie lądują transkrypty.
- Treści medyczne: aplikacja wspiera terapię, nie zastępuje logopedy; nie diagnozujemy; nie etykietujemy emocji, których użytkownik nie nazwał. Treść ćwiczeń tylko ze źródłem w `wiki/program/Program płynności.md` albo po akceptacji Alka.
- Target, nie proces: nie dodajemy CI, linterów, Spec Kitu, frameworków, dopóki nie boli. Każda decyzja z rekomendacją, nie „wybierz sam”.

## Workflow
1. Zmiana → `node --check` na wyekstrahowanym skrypcie → `node test/run.js && node test/round2.js` (Playwright, headless Chromium, 390×844, `file://`; szczegóły `wiki/operacje/Testy.md`). Zielone = exit 0, puste `*.errors`, brak `*.EXCEPTION` w `test/*results.json`.
2. Większe funkcje (logika dnia/tygodnia, stan, timer, mapa, ocena): budowniczy → niezależny tester + recenzent kodu (osobni agenci, bez twierdzeń budowniczego) → poprawki → publikacja.
3. Publikacja: narzędzie Artifact `read` + `publish` na https://claude.ai/artifact/EUANdz59Df6hkaxVUsHR5P (slug `6d11a925-4902-461b-9300-077502bbab5e`), bez podawania `capabilities` (zostaje `sample`).
4. Po pracy: wpis w `wiki/decyzje/Decision log.md` (jeśli decyzja), „Aktualny stan” w `00 Start/Start.md`, commit.

## Struktura
- `app/index.html` – aplikacja (plan podziału na `index.html`, `styles.css`, `data.js`, `app.js`: `wiki/architektura/Architektura aplikacji.md`).
- `test/` – harness (`run.js`, `round2.js`); zrzuty i wyniki generowane, w `.gitignore`.
- `00 Start/` – Start (dashboard), Inbox, Review, Daily/.
- `wiki/produkt/` – Kontekst i profil, Backlog. `wiki/program/` – program terapii (źródło prawdy). `wiki/decyzje/` – Decision log, Decyzje do podjęcia. `wiki/research/` – raporty. `wiki/architektura/`, `wiki/operacje/`.
- `templates/` – szablony Obsidiana. `90 Archiwum/` – stare pliki (HANDOFF z czatu, dzien-01.html, run.orig.js).
