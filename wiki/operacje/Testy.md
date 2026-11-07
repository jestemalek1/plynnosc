---
status: active
updated: 2026-11-07
tags: [operacje, testy]
---

# Testy

Harness: Playwright + headless Chromium, viewport 390×844 (iPhone), `file://` na `app/index.html`, zegar sterowany (`page.clock`).

```bash
node test/run.js      # T1–T11: dzień 1 (baza), rollover, SR, ściągawka, ocena bez Claude, usability, localStorage rzucający
node test/round2.js   # A–O: „Od nowa”, pauza timera, monolog, dziennik, klawiatura, mapa wysp, zrzuty ekranu
```

Wymagania: Node 22+, pakiet `playwright` dostępny przez `require('playwright')` z zainstalowaną przeglądarką (w sesjach Claude Code w chmurze jest preinstalowany).

## Co znaczy „zielone”
- Oba skrypty kończą się exit 0 i wypisują logi `T*.`/`A.`…`O.`.
- W `test/results.json` i `test/round2_results.json` klucze `*.errors` są pustymi tablicami, a `*.EXCEPTION` nie występuje.
- Zrzuty `test/*.png` oglądamy przy zmianach wizualnych (są w `.gitignore`, generują się przy każdym biegu).

Harness loguje, nie asertuje — oceny PASS/FAIL dokonuje tester (agent albo człowiek) na podstawie logów i listy wymagań. To celowe: przy zmianie wymagań nie przepisujemy asercji, tylko czytamy wynik.

## Historia
- 2026-11-07: ścieżki w harnessie uniezależnione od maszyny (`__dirname`, `require('playwright')`, domyślne Chromium). Oryginał z czatu: `90 Archiwum/run.orig.js`.
