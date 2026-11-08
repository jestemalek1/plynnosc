---
status: active
owner: Alek
updated: 2026-11-08
tags: [plan, roadmapa, dogfooding]
---

# Plan działania

Metoda: **dogfooding**. Alek trenuje codziennie w apce, a to, co uwiera, jest głównym źródłem pracy nad apką. Kod nigdy nie zastępuje treningu: najpierw 15 minut ćwiczeń, potem ewentualnie apka.

Terminy wynikają z programu: dzień 22 (28.11.2026) zaczyna tydzień 4, dzień 85 (30.01.2027) kończy 12 tygodni.

## Kamienie milowe
| Kamień | Termin | Cel (co ma działać dla Alka) | Główne pozycje |
| --- | --- | --- | --- |
| M0 Fundament | do 13.11 (koniec tyg. 1) | Repo na GitHubie, wydanie v4, dwa okna mogą pracować bez kolizji, uwagi z treningu zbierane w apce | v4, repo, podział na pliki, „Uwaga do apki”, eksport danych |
| M1 Stabilnie | do 21.11 (koniec tyg. 2) | Apka nie gubi danych i nie psuje się; transkrypcja PL ustalona; wnioski z konsultacji w programie | poprawki R3–R7, Wake Lock, transkrypcja PL, wnioski z 10.11 |
| M2 Tydzień 4 gotowy | do 27.11 | Tygodnie 4–6 mają prawdziwe ćwiczenia (wydłużona mowa, cykle Camperdown, dobrowolne jąkanie i anulowanie) | treść tyg. 4–6 + nowe typy ćwiczeń |
| M3 Rozwój z nagrań | grudzień | Ocena nagrania daje „jedno pytanie” i English card | #12, #13, decyzja o trybie szybkim |
| M4 Cały program | do 29.01.2027 | Tygodnie 7–12 i utrzymanie; ewentualnie #14 | treść tyg. 7–12, #14 po dostarczeniu plików |

Kolejność w M0 ma znaczenie: dopóki apka jest jednym plikiem, dwa okna będą się zderzać w tym samym pliku. Najpierw podział, potem praca równoległa.

## Dwa okna (dwie sesje Claude Code)
| Okno | Po co | Typ pracy | Gałęzie | Pliki (po podziale) |
| --- | --- | --- | --- | --- |
| **A – Dogfood** | Jak mi się pracuje z apką na co dzień | Drobne poprawki UI i tekstów z uwag z treningu, wydania często (nawet codziennie) | `fix/*`, `hotfix/*` | głównie `styles.css`, `data.js` |
| **B – Rozwój** | Dalszy rozwój rozwiązania wg planu | Funkcje z kamieni milowych, treść tygodni, nowe ćwiczenia | `feature/*` | głównie `app.js`, `map.js`, nowe pliki |

Warunki, żeby to działało:
1. **Repo na GitHubie jest konieczne.** Sesje w chmurze nie współdzielą dysku; drugie okno zobaczy pracę pierwszego tylko przez `git fetch`.
2. Okno B zaczyna od podziału pliku (1–2 rundy). Do tego czasu okno A tylko zbiera uwagi, nie zmienia kodu.
3. Każde okno zaczyna od `CLAUDE.md` i bierze pracę tylko ze swojej kolumny backlogu.
4. Wydaje i publikuje jedno okno naraz, tylko z `main` ([[Git i gałęzie]]).
5. Decyzje produktowe podejmuje Alek; okna nie rozstrzygają ich same, tylko dopisują do [[Decyzje do podjęcia]] z rekomendacją.

## Pętla dogfoodingu
- **W trakcie treningu:** uwaga do apki od razu, jednym zdaniem. Do czasu funkcji „Uwaga do apki” w notatce dnia (szablon [[Dzień]], sekcja „Apka – co uwierało”).
- **Codziennie, okno A:** przegląd uwag z wczoraj → małe poprawki → wydanie, jeśli coś przeszkadzało w treningu.
- **Niedziela, 15 min ([[Review]]):** SR tygodnia i dziennik bloków; kryterium przejścia tygodnia z [[Program płynności]]; ile dni treningu na 7; które uwagi zamknięte; decyzje na kolejny tydzień; aktualizacja kamieni milowych.

Miary, czy apka robi robotę (zbierane w Review, nie w apce):
| Miara | Cel |
| --- | --- |
| Dni z treningiem / 7 | 6–7 |
| Czas sesji vs plan 15 min | ±3 min |
| Uwagi „przeszkadza w treningu” otwarte dłużej niż 2 dni | 0 |
| Kryterium tygodnia z programu spełnione | tak / nie (jeśli 2× nie → temat dla logopedy) |

## Związek z HLD
HLD v1 (8.11, z dopiskami B12–B20) opisuje produkt z 8 modułów. **Decyzja B12:** apka to narzędzie Alka, które przez dogfooding staje się aplikacją z HLD. Cel nadrzędny to trening Alka.
- **Najpierw (M0–M2):** dopracowanie modułów w codziennym użyciu: 04 Realizacja, 05 Zadania w terenie, 06 Samoocena, 08 Raport (minimum), 02 jako `data.js`.
- **Później (po dopracowaniu funkcjonalności):** 03 silnik planu, ocena mowy przez AI z nagrania i rozmowy na żywo (B19), 01 wywiad w apce, 07.
- **Zasada:** w [[Backlog]] tylko pozycje z modułem HLD (albo fundament, który służy wskazanemu modułowi).
- **Utrzymanie (B18):** program nie kończy się 30.01.2027. Przeglądy utrzymania (po 2, 2, 4, 4, 8 tygodniach, potem po 3 i 6 miesiącach) trzeba ująć w roadmapie – patrz roadmapa na koniec sesji decyzji.
Mapowanie i różnice: [[HLD v1 – porównanie z planem]].

## Nasz obecny plan w skrócie (do porównania z HLD)
Żeby porównanie z HLD było szybkie, tu są założenia, które dziś obowiązują:
1. **Runtime:** statyczna strona jako artefakt claude.ai; ocena przez Claude przez capability `sample`; brak własnego backendu i kluczy API.
2. **Dane:** localStorage jednego urządzenia; eksport/import JSON jako kopia; transkrypty nie są trzymane poza ostatnimi ocenami.
3. **Kod:** vanilla JS bez frameworka i bundlera; podział na `index.html`, `styles.css`, `data.js`, `map.js`, `app.js`.
4. **Treść:** program 12 tygodni z [[Program płynności]] jako źródło prawdy; jedna skala SR 0–8; instrukcje „Co robisz / Jak to ma brzmieć / Czego nie robić / Dlaczego”.
5. **AI:** jedno wywołanie „Oceń” zwraca płynność, potem „jedno pytanie” (#12) i English card (#13); bez pamięci między dniami poza tagami/licznikami.
6. **Transkrypcja:** poza apką (Whisper na iPhonie), wklejana do „Oceń”.
7. **Jakość:** harness Playwright + niezależny tester i recenzent; bez CI.
8. **Proces:** gitflow lekki, dwa okna, dogfooding, tygodniowy Review.
