---
status: active
owner: Alek
updated: 2026-11-08
tags: [plan, roadmapa, dogfooding]
---

# Plan działania

Metoda: **dogfooding**. Alek trenuje codziennie w apce, a to, co uwiera, jest głównym źródłem pracy nad apką. Kod nigdy nie zastępuje treningu: najpierw 15 minut ćwiczeń, potem ewentualnie apka.

Terminy wynikają z programu: dzień 22 (28.11.2026) zaczyna tydzień 4, dzień 85 (30.01.2027) kończy 12 tygodni.

## Kamienie milowe (po sesji decyzji HLD 8.11)
Moduły HLD: 01 Wywiad · 02 Biblioteka · 03 Generator · 04 Realizacja · 05 Trening komunikacji · 06 Monitorowanie · 07 Wsparcie psych. · 08 Panel logopedy. F = fundament techniczny.

| Kamień | Termin | Cel (co ma działać dla Alka) | Główne pozycje | Moduły HLD |
| --- | --- | --- | --- | --- |
| M0 Fundament | do 13.11 (koniec tyg. 1) | Wydana v4; od tygodnia 2 apka pokazuje zadanie w terenie; plik podzielony; dane da się skopiować | v4 → B14 zadanie w terenie (przed 14.11) → A5 podział → #15 eksport | 04, 05, 06, F→02 |
| M1 Stabilnie | do 21.11 (koniec tyg. 2) | Apka nie gubi danych; mierzymy zamianę słów i odpuszczone sytuacje; wnioski z konsultacji w programie | R3–R7, B15, Wake Lock, #18, B16 (jeśli TAK), B4, wnioski z B2 | 04, 06, 08, 02 |
| M2 Tydzień 4 gotowy | do 27.11 | Tygodnie 4–6 mają prawdziwe ćwiczenia; wiadomo, jak działa przejście tygodnia | T4–6, B13 (wg decyzji), kolejność szczebli potwierdzona | 02, 04, 03 |
| M3 Dopracowanie | grudzień | Codzienne używanie bez tarcia (tryb szybki, jeśli potrzebny); **przegląd po M3:** czy funkcjonalność jest dopracowana i można zacząć moduły „później” | B7, poprawki z dogfoodingu, #12/#13 tylko jeśli B17 je przypisze do HLD | 04, 05, 06 |
| M4 Cały program | do 29.01.2027 | Tygodnie 7–12; plan utrzymania gotowy przed końcem programu | T7–12, B18 (przeglądy i sygnały nawrotu) | 02, 04, 03, 06 |
| Utrzymanie | luty–lipiec 2027 | Przeglądy po 2, 2, 4, 4, 8 tygodniach, potem po 3 i 6 miesiącach; niezaliczony przegląd = powtórka etapu | przeglądy w apce, przy nawrocie powrót do G (tyg. 6–8) | 03, 06 |

### Mapa ścieżki: pętla HLD × kamienie (B29)
Sprawdzian: każdy kamień ma przesuwać całą pętlę, a nie tylko jeden ekran. Puste pole = w tym kamieniu nic.

| Krok pętli (HLD) | M0 (13.11) | M1 (21.11) | M2 (27.11) | M3 (grudzień) | M4 + utrzymanie |
| --- | --- | --- | --- | --- | --- |
| 01 Ocena wstępna | (dzień 1 zrobiony) | | | | wywiad w apce – produkt |
| 02 Biblioteka | A5 `data.js` | wnioski z konsultacji | T4–6 | | T7–12 |
| 03 Plan | (wg daty) | | B13 | | B18 utrzymanie, silnik po przeglądzie M3 |
| 04 Ćwiczenia | v4 | R3–R7, Wake Lock, #18 | T4–6 | B7 tryb szybki | T7–12 |
| 05 Transfer | **B14** tyg. 2–3 | | zadania tyg. 4–6 (w T4–6) | | zadania tyg. 7–12 |
| 06 Pomiar | SR tygodnia (v4), #15 eksport | B15 | | | sygnały nawrotu (B18); ocena AI (B19) po M3 |
| 07 Wsparcie | | | (G, H w T4–6 – częściowo) | | #14 poza MVP |
| 08 Logopeda | #15 eksport | B16 raport | | | przeglądy utrzymania |
| 09 Język obcy | | | | #13 English card | bank fraz, powtórki (po przeglądzie M3) |
| 10 Refleksja | | | | #12 jedno pytanie | #14 – poza MVP, po plikach z „AI lab” |

Specyfikacje (rozmiar L): [[Jak pisać spec]]; kolejność: B14 → B15 → T4–6.

Po przeglądzie M3, w kolejności z HLD §7: B19 ocena mowy przez AI z nagrania i rozmowy na żywo (06, 05) → 03 silnik planu → 07 refleksja z nagrań (#14, poza MVP) → 01 wywiad w apce (produkt).

Kolejność w M0 ma znaczenie: dopóki apka jest jednym plikiem, dwa okna będą się zderzać w tym samym pliku. B14 idzie jednak przed podziałem, bo tydzień 2 startuje 14.11 (trening wygrywa, B12). Jeśli A5 nie zmieści się do 13.11, schodzi na 14–15.11; B14 nie schodzi.

## Najbliższe 2 tygodnie (8–21.11), w kolejności
| # | Co | HLD | Kto | Do kiedy |
| --- | --- | --- | --- | --- |
| 1 | Domknąć v4: tester + recenzent (wznowić `feature/testy-v4-wip`), wydanie i publikacja | 04, 06 | B | 10.11 |
| 2 | Konsultacja 10.11: zabrać [[Kontekst i profil]] i pytania z B2 + kolejność szczebli hierarchii | 08, 02 | Alek | 10.11 |
| 3 | Treść kart „Zadanie w terenie” dla tygodni 2–3 → akceptacja Alka | 05 | B → Alek | 11.11 |
| 4 | B14 w kodzie + tester + recenzent → wydanie | 05 | B | 13.11 |
| 5 | B4: test Whisper na jednym monologu PL | 06 | Alek | 13.11 |
| 6 | A5 podział pliku (potem okno A może zmieniać kod) | F→02 | B | 13.11 (najpóźniej 15.11) |
| 7 | #15 eksport/import JSON | F→06, 08 | B | 15.11 |
| 8 | Review niedzielny 15.11: wnioski z konsultacji → [[Program płynności]] | 02 | Alek + B | 16.11 |
| 9 | R3–R7 + B15 (przełączniki w dzienniku, suma w SR tygodnia) w jednej rundzie | 04, 06 | B | 19.11 |
| 10 | Wake Lock | 04 | A | 19.11 |
| 11 | #18 „Uwaga do apki” | F→04 | A | 21.11 |
| 12 | B16 raport dla logopedy – jeśli decyzja TAK | 08 | B | 21.11 |

Czeka na Alka (bez blokowania listy): B13, B16, B17 (#12, #13) w [[Decyzje do podjęcia]].

## Pytania otwarte na później (po przeglądzie M3, nie teraz)
**MVP rynkowe**
- Dla kogo pierwsza wersja (dorośli PL, typ jąkania, z logopedą czy bez) i które moduły wchodzą (minimum: 02, 04, 05, 06?).
- Czy 08 (panel logopedy) jest w MVP – to zmienia model: aplikacja konsumencka vs narzędzie dla gabinetów.
- Jak mierzymy skuteczność produktu (SR, %SS, OASES) i kto ocenia.
- Czy 09 (język obcy) i 10 (refleksja) są w MVP, czy w kolejnych wersjach; 10 tylko jako wellbeing (B32).

**RODO**
- Nagrania i informacje o jąkaniu to dane o zdrowiu (art. 9): podstawa przetwarzania (wyraźna zgoda), DPIA, minimalizacja.
- Retencja nagrań i transkryptów, prawo do usunięcia, eksport.
- Przekazanie audio do dostawcy AI (podmiot przetwarzający, transfer poza EOG).
- Udostępnianie danych specjaliście (08): zakres i zgoda.

**Wyroby medyczne**
- Czy deklarowany cel („wsparcie terapii jąkania”) czyni oprogramowanie wyrobem medycznym (MDR, reguła 11) – i jak sformułować przeznaczenie.
- Które funkcje są najbardziej ryzykowne regulacyjnie: generator planu (03), ocena mowy przez AI (B19), refleksja z nagrań (07).
- Kiedy i z kim konsultacja prawna/regulacyjna; walidacja kliniczna oceny AI względem logopedy.

**Stack produktu**
- Własna aplikacja (mobilna / PWA) zamiast artefaktu claude.ai: konta, backend, synchronizacja, offline.
- Audio na żywo: mikrofon, model z wejściem audio do oceny i rozmowy (B19); koszt na użytkownika.
- Migracja danych z prototypu (eksport #15) i co z prototypu zostaje (treść w `data.js` = biblioteka 02).

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
- **Utrzymanie (B18):** program nie kończy się 30.01.2027. Przeglądy utrzymania (po 2, 2, 4, 4, 8 tygodniach, potem po 3 i 6 miesiącach) są w roadmapie jako wiersz „Utrzymanie” (luty–lipiec 2027).
Mapowanie i różnice: [[HLD v1 – porównanie z planem]].

## Nasz obecny plan w skrócie (do porównania z HLD)
Żeby porównanie z HLD było szybkie, tu są założenia, które dziś obowiązują:
1. **Runtime:** statyczna strona jako artefakt claude.ai; ocena przez Claude przez capability `sample`; brak własnego backendu i kluczy API.
2. **Dane:** localStorage jednego urządzenia; eksport/import JSON jako kopia; transkrypty nie są trzymane poza ostatnimi ocenami.
3. **Kod:** vanilla JS bez frameworka i bundlera; podział na `index.html`, `styles.css`, `data.js`, `map.js`, `app.js`.
4. **Treść:** program 12 tygodni z [[Program płynności]] jako źródło prawdy; jedna skala SR 0–8; instrukcje „Co robisz / Jak to ma brzmieć / Czego nie robić / Dlaczego”.
5. **AI:** jedno wywołanie „Oceń” na transkrypcie zwraca płynność (informacja zwrotna, nie pomiar – B19); bez pamięci między dniami poza tagami/licznikami. „Jedno pytanie” (#12) i English card (#13) czekają na B17.
6. **Transkrypcja:** poza apką (Whisper na iPhonie), wklejana do „Oceń”.
7. **Jakość:** harness Playwright + niezależny tester i recenzent; bez CI.
8. **Proces:** gitflow lekki, dwa okna, dogfooding, tygodniowy Review.
