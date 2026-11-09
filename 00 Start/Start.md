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
- [[Architektura aplikacji]] — jak zbudowana jest apka i plan podziału na pliki
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
- [[Review kodu v3 – niezależny]]

## Aktualny stan (2026-11-08, sesja decyzji HLD)
- [[HLD v1]] uzupełniony i wiodący (kopia w vaultcie, `.docx` = historia): utrzymanie (B18), ocena mowy przez AI z nagrania i rozmowy na żywo (B19), minimum bezpieczeństwa (B20), refleksja z nagrań z zabezpieczeniami (B17), §7 prototyp n=1 (B12).
- Decyzje: B12 (narzędzie Alka → aplikacja przez dogfooding; trening nadrzędny; silnik, ocena AI, wywiad później), B14 (zadanie w terenie przed 14.11), B15 (zamiana słów jako fakt w dzienniku; SR 0–8 jedyną skalą). [[Decision log]].
- [[Backlog]]: każda pozycja ma moduł HLD; roadmapa M0–M4 + utrzymanie i lista na 2 tygodnie w [[Plan działania]].
- v4 przygotowana na `feature/dzien2-feedback` (wydana 9.11 – patrz niżej).
- Otwarte decyzje: B13, B16, B17 (#12, #13).
- 2026-11-09 (okno B): **v4 wydana i opublikowana** (tag `v4`, artefakt pod linkiem wyżej) po 8 rundach niezależnego testera i recenzenta; harness z bramką (run/round2/round3) zielony. Nowe decyzje z weryfikacji: B21–B28 (w tym B25 – reguła powrotu na mapę, B26 – treść „Start na sygnał”).

## Następna akcja
1. Okno B: domknąć v4 (tester + recenzent) i przygotować treść kart „Zadanie w terenie” tygodni 2–3 do akceptacji.
2. Alek: konsultacja 10.11 – [[Kontekst i profil]], pytania z B2, kolejność szczebli hierarchii.
3. Poza vaultem: doprecyzować w `CLAUDE.md` zasadę „jedna skala” wg B15.

## Inbox / Review
- [[Inbox]] · [[Review]]
