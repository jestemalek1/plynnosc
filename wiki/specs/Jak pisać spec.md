---
status: active
updated: 2026-11-08
tags: [specs, proces]
---

# Jak pisać spec funkcji (decyzja B29)

Spec piszemy tylko dla pozycji backlogu rozmiaru **L**, czyli dla zmian w logice dnia lub tygodnia, stanie, timerze, mapie albo ocenie. Poprawki S i rundy M obywają się bez specyfikacji. Spec ma 1–2 strony. Jest pisany przed kodem, Alek go akceptuje, a po wdrożeniu zostaje jako opis działania. LLD modułu HLD to suma specyfikacji jego funkcji. Uzasadnienie: [[Planowanie pracy – research]].

**Plik:** `wiki/specs/<ID> <nazwa>.md`. To samo ID występuje w backlogu, w nazwie gałęzi i w CHANGELOG.
**Status:** `szkic` → `zaakceptowany` (Alek) → `wdrożony (vN)`.
**Agenci:**
- budowniczy czyta całość, robi plan i dopiero potem kod;
- tester dostaje sekcję 3 i kod, bez twierdzeń budowniczego;
- recenzent dostaje sekcje 4 i 6 oraz kod.

## Szablon

```markdown
---
status: szkic
id: <ID>
hld: <01–08>
decyzja: <Bxx>
budżet: <N rund>
updated: <data>
---

# <ID> <nazwa>

## 1. Cel i moduł HLD
Problem z treningu (1–2 zdania), moduł [[HLD v1]], decyzja w [[Decision log]].

## 2. Zakres
- Wchodzi: …
- Poza zakresem (no-go): …
- Budżet: N rund. Jeśli się nie mieści – tniemy zakres, nie termin.

## 3. Zachowanie (kryteria akceptacji)
| # | Gdy … | Wtedy … |
| --- | --- | --- |

## 4. Dane i stan
Pola, wartości dozwolone, sanityzacja, migracja, wpływ na zaliczenie dnia i streak, eksport.

## 5. Treść
Instrukcje „Co robisz / Jak to ma brzmieć / Czego nie robić / Dlaczego”, źródło w [[Program płynności]]. Do akceptacji Alka.

## 6. Zasady i ryzyka
Skala (SR 0–8 tylko nasilenie i technika), prywatność, granice medyczne (HLD §6), ryzyka techniczne.

## 7. Jak sprawdzone
(po wdrożeniu) harness, wynik testera i recenzenta, wersja.
```
