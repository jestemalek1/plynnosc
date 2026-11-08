---
status: active
updated: 2026-11-08
tags: [operacje, testy]
---

# Testy

Harness: Playwright + headless Chromium, viewport 390×844 (iPhone), `file://` na `app/index.html`, zegar sterowany (`page.clock`).

```bash
node test/run.js      # T1–T11: dzień 1 (baza), rollover, SR, ściągawka, ocena bez Claude, usability, localStorage rzucający
node test/round2.js   # A–O: „Od nowa”, pauza timera, monolog, dziennik, klawiatura, mapa wysp, zrzuty ekranu
node test/round3.js   # R1–R7 (v4): legenda SR, Oddech A z wdechem 3 s, SR tygodnia, Start na sygnał, migracja, dziennik bez skoku na mapę, błędy w dniach 1–85
```

Wymagania: Node 22+, pakiet `playwright` dostępny przez `require('playwright')` z zainstalowaną przeglądarką (w sesjach Claude Code w chmurze jest preinstalowany).

## Co znaczy „zielone”
- Wszystkie trzy skrypty kończą się exit 0 i wypisują logi `T*.`/`A.`…`O.`/`R*`.
- W `test/results.json`, `test/round2_results.json` i `test/round3_results.json` klucze `*.errors` są pustymi tablicami, a `*.EXCEPTION` nie występuje.
- `round3.js` wypisuje werdykty PASS/FAIL i kończy się exit 1, jeśli którykolwiek jest FAIL (część błędów, np. z R7, siedzi w zagnieżdżonych kluczach, więc samo „puste `*.errors`” by ich nie złapało).
- `run.js` i `round2.js` na końcu wypisują `GATE OK` albo `GATE FAIL: …` i kończą się exit 1 przy każdym niepustym `*errors` (także zagnieżdżonym), `*.EXCEPTION` albo błędzie konsoli na dowolnej stronie testu (także takiej, która go nie zalogowała). Łańcuch `&&` jest więc prawdziwą bramką; reszta logów nadal do przeczytania przez testera.
- Zrzuty `test/*.png` oglądamy przy zmianach wizualnych (są w `.gitignore`, generują się przy każdym biegu).

`run.js` i `round2.js` poza bramką błędów logują, nie asertują — oceny PASS/FAIL dokonuje tester (agent albo człowiek) na podstawie logów i listy wymagań. To celowe: przy zmianie wymagań nie przepisujemy asercji, tylko czytamy wynik.

## Historia
- 2026-11-08: `round3.js` (v4) z werdyktami i exit 1 przy FAIL; czasy Oddechu A z wdechem 3 s także przed pierwszym powtórzeniem.
- 2026-11-07: ścieżki w harnessie uniezależnione od maszyny (`__dirname`, `require('playwright')`, domyślne Chromium). Oryginał z czatu: `90 Archiwum/run.orig.js`.
