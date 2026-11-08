---
status: active
updated: 2026-11-08
tags: [operacje, okna, prompty]
---

# Prompty startowe dla dwóch okien

Otwórz nową sesję Claude Code z wybranym repo `jestemalek1/plynnosc` i wklej odpowiedni prompt. Stan na 8.11 wieczorem:
- `feature/dzien2-feedback` ma niewydaną v4 i wszystkie notatki, łącznie z decyzjami HLD B12–B20;
- `feature/testy-v4-wip` ma przerwaną pracę testera;
- `main` i `develop` to v3, czyli wersja opublikowana.

Poprzednie prompty (okno HLD, okno testów) są w historii gita.

## Okno B – dokończenie v4

```text
Pracujesz w repo jestemalek1/plynnosc (vault Obsidiana + apka). Jesteś oknem B – Rozwój. Cel tej sesji: dokończyć v4 i doprowadzić ją do wydania.

Start: git fetch && git checkout feature/dzien2-feedback. Przeczytaj CLAUDE.md, „00 Start/Start.md”, CHANGELOG.md (sekcja v4), „wiki/decyzje/Decision log.md” (wpis „v4 po feedbacku z dnia 2”), „wiki/operacje/Testy.md”, „wiki/operacje/Git i gałęzie.md” i „wiki/research/Review kodu v3 – niezależny.md” (R1, R2).

Stan: v4 jest w app/index.html na tej gałęzi. Na feature/testy-v4-wip jest przerwana, niezweryfikowana praca testera (commit a29a28b: test/run.js, test/round2.js, nowy test/round3.js). CLAUDE.md wymaga już round3.js, a na tej gałęzi go nie ma.

Zadania, po kolei:
1. Wciągnij harness z feature/testy-v4-wip (git merge origin/feature/testy-v4-wip; zmienia tylko test/). Przejrzyj go, zanim mu zaufasz.
2. Zakres v4 = tylko to, co jest w CHANGELOG v4. Nie dokładaj funkcji z backlogu (B14, A5, #15 itd.).
3. Niezależna weryfikacja wg CLAUDE.md: osobny agent-tester i osobny agent-recenzent kodu. Dostają kod i listę wymagań, nie Twoje wnioski. Wymagania do sprawdzenia (headless Chromium, 390×844, file://, page.clock):
   - legenda SR widoczna przed wyborem przy każdej skali;
   - Oddech A: 3 s wdechu z odliczaniem, bez zatrzymania na górze;
   - SR tylko w dniach 7, 14, … („SR tygodnia”); dzień 1 nadal „SR dnia”;
   - „Start na sygnał”: losowe 2–6 s, sygnał, pytanie PL/EN, 8 s na odpowiedź, 10 rund, pauza i „od nowa”, licznik w localStorage;
   - migracja: stary stan bez pola v; dzień z done [oddech, monolog, dziennik] albo [..., sr] jest zaliczony, dzień z samym [oddech] nie;
   - dzień zaliczony zostaje zaliczony po zmianie listy ćwiczeń;
   - brak skoku na mapę w trakcie pisania dziennika;
   - zero błędów konsoli w dniach 1, 2, 7, 8, 15, 22, 85;
   - brak regresji względem v3.
4. Poprawiasz realne defekty, potem znowu tester i recenzent, aż runda będzie czysta. Każda runda: node --check na wyekstrahowanym skrypcie, potem node test/run.js && node test/round2.js && node test/round3.js. Zielone = exit 0, puste *.errors, brak *.EXCEPTION.
5. Raport dla mnie: tabela wymaganie → PASS/FAIL + dowód, lista poprawionych defektów, czego nie sprawdziłeś. Rekomendacja: wydać czy nie.
6. Wydanie TYLKO po moim „wydaj”, wg „Git i gałęzie”: PR feature/dzien2-feedback → develop, potem PR develop → main „Wydanie v4”, tag v4, publikacja (Artifact read + publish na https://claude.ai/artifact/EUANdz59Df6hkaxVUsHR5P, bez capabilities), CHANGELOG bez „(w przygotowaniu)”, „Aktualny stan” w Start.md. Uwaga: ta gałąź niesie też notatki z sesji HLD; mają trafić do develop razem z v4.

Zasady: commity po polsku; nie zmieniaj treści ćwiczeń bez źródła w „Program płynności”; decyzji produktowych nie podejmujesz sam, tylko dopisujesz je do „Decyzje do podjęcia” z rekomendacją. Raporty krótko, bez zgadywania.
```

## Okno A – uwagi z dogfoodingu: omówienie i wdrożenie

```text
Pracujesz w repo jestemalek1/plynnosc (vault Obsidiana + apka). Jesteś oknem A – Dogfood. Codziennie trenuję w apce (https://claude.ai/artifact/EUANdz59Df6hkaxVUsHR5P, program od 7.11.2026). Cel tej sesji: omówić ze mną moje uwagi z używania apki i wdrożyć te, które zaakceptuję.

Start: git fetch. Przeczytaj CLAUDE.md, „00 Start/Start.md”, „wiki/produkt/HLD v1.md” (§7 i zasady pomiaru w 06), „wiki/produkt/Backlog.md”, „wiki/produkt/Plan działania.md” (dwa okna, pętla dogfoodingu), „wiki/operacje/Git i gałęzie.md”, „wiki/operacje/Testy.md” i „wiki/program/Program płynności.md”. Uwagi zbierz od mnie oraz z „00 Start/Inbox.md” i z sekcji „Apka – co uwierało” w notatkach dnia (00 Start/Daily/), jeśli są.

Część 1 – omówienie, po jednej uwadze naraz:
- Ty: co zrozumiałeś, wersja apki, której to dotyczy (v3 opublikowana / v4), moduł HLD 01–08, priorytet (przeszkadza w treningu / irytuje / pomysł), Twoja rekomendacja (zrobić, jak, ile to zmiana; albo nie robić i dlaczego).
- Sprawdzasz zgodność z zasadami:
  - jedna skala SR 0–8 tylko dla nasilenia i techniki, poza tym tak/nie albo licznik (wyjątek: „Oddech po frazach: częściowo”);
  - instrukcje w formacie „Co robisz / Jak to ma brzmieć / Czego nie robić / Dlaczego”;
  - treść ćwiczeń tylko ze źródłem w programie;
  - minimum kliknięć;
  - prywatność (bez transkryptów w repo i stanie).
- Uwaga spoza HLD nie trafia do backlogu: dopisz ją do „Decyzje do podjęcia” jako propozycję zmiany HLD.
- Czekasz na moje „tak / nie / inaczej”, zanim przejdziesz dalej. Po każdej decyzji pozycja w Backlogu (HLD, okno A, fix/*, priorytet) albo wpis w Decyzjach.

Część 2 – wdrożenie zaakceptowanych:
- Warunek startu: v4 jest na develop (sprawdź git log origin/develop i CHANGELOG). Jeśli jeszcze nie jest, nie zmieniasz app/, tylko kończysz na części 1 i mówisz mi, co czeka.
- Dopóki app/index.html nie jest podzielony na pliki (A5), okno B pracuje w tym samym pliku. Rób małe, punktowe zmiany. Przed startem i przed PR: git fetch && git rebase origin/develop. Sprawdź, czy okno B ma otwartą gałąź zmieniającą app/; jeśli tak, uprzedź mnie.
- Jedna sprawa = jedna gałąź fix/<krótko> od develop (bez ogonków). Każda zmiana: node --check na wyekstrahowanym skrypcie, potem node test/run.js && node test/round2.js && node test/round3.js zielone. Zmiana w logice dnia/tygodnia, stanu, timera, mapy albo oceny: osobny agent-tester i recenzent przed PR.
- CHANGELOG (sekcja następnej wersji, językiem użytkownika), PR do develop z opisem „co / dlaczego / jak sprawdzone”.
- Coś przeszkadza w dzisiejszym treningu na opublikowanej wersji: hotfix/* od main wg „Git i gałęzie”, ale tylko po moim OK.
- Wydanie i publikację robisz tylko po moim „wydaj” i tylko wtedy, gdy okno B w tym czasie nie wydaje.

Na koniec: lista uwag ze statusem (wdrożone / w backlogu / odrzucone / decyzja), wpis „Aktualny stan” w Start.md, commity po polsku. Raporty krótko, bez zgadywania: jeśli czegoś nie sprawdziłeś, napisz to.
```

## Okno A – dzień 3 (pon. 9.11): test przed treningiem + uwagi po treningu

```text
Pracujesz w repo jestemalek1/plynnosc (vault Obsidiana + apka). Jesteś oknem A – Dogfood i testy. Dziś jest dzień 3 programu (poniedziałek 9.11.2026, program od 7.11). Trenuję na wersji opublikowanej, czyli v3 z main (https://claude.ai/artifact/EUANdz59Df6hkaxVUsHR5P). v4 nie jest wydana: okno B kończy ją na feature/dzien2-feedback. Na tej gałęzi i w app/ nie pracujesz.

Start: git fetch. Przeczytaj CLAUDE.md, „00 Start/Start.md”, „wiki/operacje/Testy.md”, „wiki/produkt/Plan działania.md” (pętla dogfoodingu), CHANGELOG.md i „wiki/program/Program płynności.md” (tydzień 1). Najnowsze notatki są na origin/feature/dzien2-feedback (git show origin/feature/dzien2-feedback:<ścieżka>).

Zasady: NIE zmieniasz app/ ani test/. Skrypty testowe na dziś trzymasz w scratchpadzie, nie w repo. Notatki zmieniasz na gałęzi feature/uwagi-dzien3 od origin/feature/dzien2-feedback. Nie mergujesz jej do feature/dzien2-feedback, bo tam pracuje okno B; na koniec tylko push i informacja dla mnie. Moich wpisów z dziennika, transkryptów ani eksportu stanu nie zapisujesz w repo.

Część 1 – przed treningiem (max 15 min, raport w 10 linijkach):
1. Headless Chromium (Playwright, 390×844, file://, page.clock na 2026-11-09 08:00), app/index.html z origin/main (v3) i z origin/feature/dzien2-feedback (v4). Stan: dzień 1 z importu, dzień 2 zaliczony. Opcjonalnie wkleję Ci „Kopiuj dane” z telefonu – wtedy użyj go tylko w scratchpadzie.
2. Dla dnia 3 sprawdź na obu wersjach:
   - listę ćwiczeń i ich kolejność;
   - czy instrukcje mają „Co robisz / Jak to ma brzmieć / Czego nie robić / Dlaczego”;
   - czy timery liczą powtórzenia same i czy wznowienie po przeładowaniu działa;
   - czy dzień się zalicza i streak = 3;
   - błędy konsoli;
   - czy mapa pokazuje dzień 3 jako dzisiejszy.
3. Sprawdź, czy opublikowany artefakt = app/index.html z main (narzędzie Artifact, akcja read; porównaj treść).
4. Raport dla mnie: co dziś działa, na co uważać w v3 (znane braki, które v4 naprawia: m.in. wdech 2 s zamiast 3 s, brak legendy SR, brak „Start na sygnał”), czy coś blokuje trening. Jeśli coś blokuje dzisiejszy trening: proponujesz hotfix/* od main, robisz go tylko po moim OK.

Część 2 – po treningu (ja wracam i piszę „po treningu”):
1. Pytasz mnie krótko, po jednym ekranie: Oddech A, Luźny monolog, Dziennik bloków, mapa/ekran Dziś, Postępy (jeśli zaglądałem). Przy każdym: co uwierało? przeszkadzało w treningu czy tylko irytowało? Odpowiedź „nic” jest OK. Nie podsuwasz uwag.
2. Każdą uwagę zapisujesz jednym zdaniem w „00 Start/Inbox.md” (data, ekran, uwaga, przeszkadza/irytuje).
3. Potem bierzesz je po kolei: jak rozumiesz, której wersji dotyczy (czy v4 już to naprawia – sprawdź w kodzie v4), moduł HLD 01–08, priorytet (przeszkadza w treningu / irytuje / pomysł), rekomendacja, zgodność z zasadami (SR 0–8 tylko dla nasilenia i techniki, poza tym tak/nie albo licznik; format instrukcji; treść tylko ze źródłem w programie; minimum kliknięć; prywatność). Czekasz na moje „tak / nie / inaczej”.
4. Zaakceptowane → „wiki/produkt/Backlog.md” (HLD, okno A, fix/*, priorytet) albo „Decyzje do podjęcia”, jeśli to decyzja produktowa albo coś spoza HLD. Naprawione już w v4 → tylko odnotuj w Inbox „naprawione w v4”.
5. Popraw „Plan działania” (pętla dogfoodingu): do czasu funkcji #18 uwagi lądują jednym zdaniem w „00 Start/Inbox.md”, nie w notatce dnia (folderu Daily/ nie ma).
6. Na koniec: commit po polsku na feature/uwagi-dzien3, push, krótka lista uwag ze statusem i informacja, które pozycje czekają na v4 na develop.

Raporty krótko, po polsku, bez zgadywania: jeśli czegoś nie sprawdziłeś, napisz to.
```
