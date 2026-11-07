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

## Plan podziału (Opcja A, bez bundlera)
Cel: agent czyta tylko plik, który zmienia. Propozycja (do zweryfikowania z [[Review kodu v3 – niezależny]]):
- `index.html` — szkielet DOM + `<link rel="stylesheet" href="styles.css">` + `<script src="data.js">`, `<script src="app.js">`.
- `styles.css` — cały `<style>`.
- `data.js` — treść: `ENC`, `INS`, `TOPICS`, `WEEKS`, `EX_META`, `HIER`, `BASE_HIER`, `SR_MEANING`, `SR_COLORS` → jeden globalny obiekt `window.PLYNNOSC_DATA`. **To jest plik, który zmieniamy najczęściej (tygodnie 4–12) i który nie powinien dotykać logiki.**
- `app.js` — reszta (helpers, stan, komponenty, ekrany, mapa). Jeśli urośnie: `map.js` jako drugi plik z funkcjami mapy, wpięty przez `window.PLYNNOSC_MAP`.
Harness nie wymaga zmian poza tym, że T11 czyta `TOPICS` z `script:not([src])` — po podziale czyta `data.js` z dysku.
Publikacja: `publish` z `files` (patrz [[Publikacja (artefakt claude.ai)]]).

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
