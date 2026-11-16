# Płynność — Start

Osobista apka treningu płynności mowy (15 min/dzień, 12 tygodni) + vault wiedzy w jednym repo.
Apka działa tu: https://claude.ai/artifact/EUANdz59Df6hkaxVUsHR5P

## Najważniejsze
- [[Kontekst i profil]] — po co to jest, kim jest użytkownik, co już ustalone
- [[Decyzje do podjęcia]] — co czeka na Alka, z instrukcją krok po kroku (TL;DR z sesji 7.11: `wiki/decyzje/TLDR 2026-11-07.html`)
- [[Decision log]] — co już postanowione i dlaczego
- [[HLD v1]] i [[HLD v1 – porównanie z planem]] — 8 modułów produktu vs nasza apka
- [[Plan działania]] — kamienie milowe, dwa okna, pętla dogfoodingu
- [[Backlog]] — co teraz, co następne, kto (okno A / B)
- [[Git i gałęzie]] — gitflow lekki, wydania, hotfix
- [[Program płynności]] — źródło prawdy dla treści ćwiczeń i progresji
- [[Architektura aplikacji]] — jak zbudowana jest apka, architektura docelowa i plan wdrożenia etapami
- [[Zasady architektury]] — podstawa „małe jest piękne” i zasady Z0–Z13 pilnowane przy każdym PR
- [[HLD PoC – kworum 2026-11-11]] — ocena kodu wg dobrych praktyk i propozycja HLD dla PoC (4 agentów, głosowanie, runda „grill”); C1, C2, C9, C10 przyjęte; otwarte C4–C8
- [[Publikacja (artefakt claude.ai)]] — ograniczenia środowiska i jak publikować
- [[Jak pracujemy]] — pętla build → tester → review → publikacja
- [[Testy]] — jak odpalić harness i co znaczy „zielone”

## Research
- [[01 Terapie dorosłych – raport agenta]]
- [[02 Protokoły ćwiczeń – raport agenta]]
- [[03 Polskie zasoby – raport agenta]]
- [[12-13 Samorozwój i angielski – brief]]
- [[Szablony UI – research i werdykt]]
- [[Transkrypcja PL – research]]
- [[Planowanie pracy – research]]
- [[Język obcy i refleksja – research]]
- [[Review kodu v3 – niezależny]]

## Aktualny stan (2026-11-09)
- **v4 wydana i opublikowana** (tag `v4`, artefakt pod linkiem wyżej) po 8 rundach niezależnego testera i recenzenta; harness (run/round2/round3) zielony. Decyzje z weryfikacji v4: B21–B28 (okno B), czekają na Alka.
- [[HLD v1]] wiodący (kopia w vaultcie, `.docx` = historia): 10 modułów – dodane 09 Trening języka obcego (B31) i 10 Refleksja i wzorce (B32); utrzymanie (B18), ocena mowy przez AI (B19), minimum bezpieczeństwa (B20), §7 prototyp n=1 (B12).
- Decyzje sesji HLD (B12–B20, B29–B32) podjęte – [[Decision log]]. Planowanie: spec funkcji dla pozycji L w `wiki/specs/` ([[Jak pisać spec]]); [[B14 Zadanie w terenie]] zaakceptowany.
- **v5 wydana i opublikowana 11.11** (tag `v5`): słowa dnia i dźwięki w Oddechu A, pytanie o brzuch, nowe pytania „Start na sygnał”, dziennik z dotknięć z licznikami, ★ monolog w drugim języku ([[CHANGELOG]]). Do sprawdzenia na telefonie: dźwięk w trybie cichym, ekran nie gaśnie.
- Dogfooding dni 3–5 (okno A, 9–11.11): uwagi w [[Inbox]], decyzje B33 (user friendly first), B34–B36; spec [[19 Oddech A i Start na sygnał – zmienność i dźwięki]] zaakceptowany i gotowy dla agenta; #20 dziennik i #21 ★ w backlogu (okno B).
- [[Backlog]]: każda pozycja ma moduł HLD, rozmiar i spec; roadmapa M0–M4 + utrzymanie, mapa pętla × kamienie i lista na 2 tygodnie w [[Plan działania]].

- 2026-11-11: przegląd kodu i architektury przez kworum agentów – [[HLD PoC – kworum 2026-11-11]]. Kod bez zmian. Decyzje Alka 11.11: **C1 TAK** (architektura przyjęta), **C3 NIE** (prompt „Oceń” zostaje jako wyjątek prywatny, z zakazem przeniesienia do produktu – [[HLD v1]] §7). Otwarte: C2, C4–C8 w [[Decyzje do podjęcia]].
- 2026-11-11: **C9 TAK** – podstawa „małe jest piękne” i strażnik architektury (przegląd PR przez Codex + `test/arch.js` w Actions). Nowe: [[Zasady architektury]], `AGENTS.md`, przepisana [[Architektura aplikacji]] (stan dziś, architektura docelowa, plan etapami E0–E5), spec [[A7 Strażnik architektury]] zaakceptowany (C10), plan etapów E0–E5 zaakceptowany (C2). Otwarte: C4–C8.
- 2026-11-16: **E1 (A5 + A7) – kod gotowy:** apka w czterech plikach (`index.html`, `styles.css`, `data.js` z blokiem `PROFILE`, `app.js`), strażnik `test/arch.js` + workflow „Architektura”, test spójności danych R15. Tester: zero różnic w działaniu wobec v6 (99 zrzutów, stan, DOM). **v7 wydana i opublikowana 16.11** – pierwsza publikacja z `files` (4 pliki); Codex i workflow „Architektura” zielone na PR #15. Tag `v7` do założenia przez Alka.
- 2026-11-16: Alek potwierdził kolejność prac (bez przepisywania od zera; B14 → E1 → E2 → B15/B16/E3) i podłączył Codex. **B14 „Zadanie w terenie” zrobione** (tester + recenzent, poprawki, przegląd Codex bez uwag). **v6 wydana i opublikowana 16.11** (B14 + C5); tag `v6` do założenia przez Alka (krok 5 niżej).
- 2026-11-12: **C11 TAK** – pętla PR: okno subskrybuje swój PR, samo poprawia uwagi z przeglądu i scala po spełnieniu warunków ([[Git i gałęzie]], `CLAUDE.md` krok 4).
- 2026-11-12: **C5, C6, C8 TAK.** C5 zrobione w kodzie (wejdzie z następnym wydaniem); C8 (tagi `v4`, `v5` i stare gałęzie) do wykonania przez Alka – polecenia w [[Decision log]].

## Następna akcja
1. **Alek: na telefonie otworzyć apkę (v7) i sprawdzić mapę, dzień i Postępy** – mają wyglądać jak wcześniej; „działa” zamyka E1, A5 i A7. Jeśli strona jest pusta: napisz od razu (brak `data.js`/`app.js`).
2. Okno B: spec A8 (pakiet bezpieczeństwa, E2) do akceptacji Alka – teraz pilniejsze po niezapisanym dniu 15.11.
3. Alek: konsultacja 10.11 – [[Kontekst i profil]], pytania z B2 (w tym kolejność szczebli i imię w tygodniu 3); decyzje B21–B28 z weryfikacji v4.
4. Okno B potem: spec B15 (+ B13 w tej samej karcie). Plan etapów: [[Architektura aplikacji]].
5. Alek: przy Oddechu A sprawdzić, czy ekran nie gaśnie (C4).
6. Alek: tagi `v6` (`6d2dff3`) i `v7` (`c64e41a`) na `main` oraz C8 (tagi `v4`, `v5`, stare gałęzie – polecenia w [[Decision log]]); sesja w chmurze nie wypycha tagów i nie usuwa gałęzi. Przy okazji na GitHubie włączyć „Automatically delete head branches” (Settings → General).
7. Alek: na telefonie zajrzeć do karty „Zadanie w terenie” i potwierdzić 3-liniowy skrót (spec B14 §7).

## Inbox / Review
- [[Inbox]] · [[Review]]
