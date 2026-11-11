---
status: active
updated: 2026-11-07
tags: [architektura]
---

# Architektura aplikacji

Jeden plik `app/index.html` (107 KB): `<style>` (~220 linii) + `<script>` (~1170 linii, IIFE, ES5-style `var`/`function`, bez zależności zewnętrznych, bez frameworka).

## Warstwy (w kolejności w pliku)
| Warstwa | Funkcje | Uwagi |
| --- | --- | --- |
| Helpers | `h`, `append`, `clear`, `fmtClock`, `dateKey`/`parseKey`/`addDays`, `dayIndex`, `weekOf`, `pick`, `clampSR`, `toast` | `DAY1 = '2026-11-07'`; wszystko liczone od tej daty |
| Stan | `load`, `sanitizeDay`, `importDay1`, `save`/`saveNow`, `day`, `peekDay` | localStorage klucz `plynnosc`; zapis z debounce 300 ms + `pagehide`/`visibilitychange` |
| Audio | `primeAudio`, `beep` | WebAudio + `navigator.vibrate` |
| Komponenty | `SRPicker` (jedyna skala), `Timer` (fazy, przerwa, auto-powtórzenia, pauza), `TopicCard` (60 tematów PL/EN, 7 tagów) | współdzielone między ekranami |
| Treść | `ENC` (zachęty), `INS` (instrukcje: brief/co/jak/nie/dlaczego), `TOPICS`, `WEEKS`, `EX_META` | to tu wchodzą tygodnie 4–12 |
| Dzień | `exercisesFor`, `markDone`, `isDayDone`, `renderSession`, `exerciseCard`, `doneSummary`, `checkRollover` | progresja wg numeru dnia/tygodnia |
| Mapa | `renderMap`, `islandNode`, `islandState`, `planCard`, `openSheet`, `scrollToArch` | SVG, 12 archipelagów, odblokowanie po dacie |
| Ocena | `metrics`, `buildPrompt`, `renderOcena`, `probeSample`, `renderMd`, `copyText` | `claude.use("sample")`; fallback: kopiuj prompt do czatu |
| Postępy | `streak`, `renderPostepy`, `chart` | SVG wykres SR 0–8 |
| Ściągawka, nawigacja | `renderSciagawka`, `showTab`, `fromHash`, obsługa klawiatury (`body.kb`) | hash routing `#dzis/#ocena/#postepy/#sciagawka` |

## Plan podziału (Opcja A, bez bundlera) — zweryfikowany recenzją
> **11.11, decyzja C1:** ten plan zastępuje [[HLD PoC – kworum 2026-11-11]] (bez `map.js`, z `domain.js` i `store.js`; etap 1 to nadal `styles.css` + `data.js` + `app.js`). Poniższy tekst zostaje jako historia; punkt 3 (`map.js` z `ctx`) nie obowiązuje.
Źródło: [[Review kodu v3 – niezależny]] §3. Cztery pliki, klasyczne `<script src>` w kolejności `data.js` → `map.js` → `app.js`, bez `type=module` (działa z `file://`, `node --check` per plik).
1. `styles.css` — cały `<style>` bez zmian.
2. `data.js` → `window.PLYN_DATA` = { DAY1, HIER, BASE_HIER, SR_COLORS, SR_MEANING, TOPICS, TAG_LABEL, ENC, INS, BRIEF_LABEL, A_WORDS, B_WORDS, TENSION, WEEKS, EX_META, FILL_PL, FILL_EN }. Zero logiki. **Najczęściej edytowany plik (tygodnie 4–12) → najmniejsze ryzyko.**
3. `map.js` → `window.PLYN_MAP` = { render(root, ctx), scrollToArch, openSheet, closeSheet, weekStart, weekDoneCount, islandState }; zależności wstrzykiwane przez `ctx` (h, sv, clear, append, daty, isDayDone, exercisesFor, state, saveNow, streak, openDay, onReady). `justDone`/`mapMsg` jako parametry, nie globale.
4. `app.js` — reszta; eksportuje `window.PLYN` = { state, save, saveNow, day, isDayDone, exercisesFor, streak, showTab, renderDzis, openDay }.
Granice globalne: tylko `PLYN_DATA`, `PLYN_MAP`, `PLYN`. Harness: T11 czyta `TOPICS` z `data.js` z dysku zamiast z `script:not([src])`.
Szacunek: **2 rundy**. Runda 1: CSS + `data.js` + `app.js` (czysto mechanicznie, zero zmian logiki, screenshoty identyczne). Runda 2: `map.js` z `ctx` + poprawki R1–R6 z recenzji. Najpierw podział, potem zmiana semantyki — nie w jednym commicie.

## Poprawki z recenzji do zrobienia przed treścią tygodnia 4
- **R1** `isDayDone` liczy z aktualnej listy ćwiczeń → po dodaniu ćwiczeń do tyg. 4 zaliczone dni „odkończą się” (streak, wyspy). Zapisywać snapshot listy/flagę `complete` w dniu.
- **R2** powrót na mapę po 1,8 s ucina pisanie dziennika, gdy dziennik jest ostatni → odkładać do `focusout`.
- **R3** TypeError od dnia 85 (`WEEKS[w-1]` poza zakresem) → klamp `weekOf` do 12.
- **R4** sonda `sample` z 10 s timeoutem blokuje na stałe i odpala się na `load`, nie po kliknięciu.
- **R5** stary wynik Claude doklejany do nowego transkryptu przy „Zapisz metryki”.
- **R6** `body.kb` bez resetu poza `focusout` (pasek kart może zostać schowany).
- R7–R11: sanityzacja stanu (brak `version`), dzień 1 z danymi domyślnymi w źródle, rollover/UTC w datach ocen, drobiazgi timera, tekst `planCard`.

## Model danych (localStorage `plynnosc`)
```
{ days: { 'YYYY-MM-DD': { done:[], reps:{}, monolog:{lang,topic,breath,belly,blocks,sr}, sr:{typ,max}, tension:{}, diary:'' , base?:{...}, baseline?:true } },
  hierarchy:[10 × SR], assessments:[{date, lang, dur, metrics, sr, result}], insSeen:{}, ocenaDraft:{}, hierOpen }
```
Wejście z poprzedniej strony: klucz `plynnosc-dzien-01` (import jednorazowy w `importDay1`).

## Znane ograniczenia
- Dane tylko w localStorage jednego urządzenia (brak eksportu/kopii) → [[Decyzje do podjęcia]].
- Brak Wake Lock (ekran może zgasnąć w trakcie timera).
- Tygodnie 4–12 = placeholder.
- `sample` nie przyjmuje audio (tylko tekst i obrazy) → transkrypcja musi powstać poza aplikacją: [[Transkrypcja PL – research]].
