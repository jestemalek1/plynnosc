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

## Aktualny stan (2026-11-07)
- v3 opublikowana jako artefakt (slug `6d11a925-4902-461b-9300-077502bbab5e`, capability `sample`). Plik `app/index.html` w repo jest bajt w bajt tą wersją.
- Harness testowy przeniesiony do repo i uniezależniony od ścieżek (patrz [[Testy]]).
- Tygodnie 1–3 mają treść; tygodnie 4–12 to placeholder (dziennik + SR). Termin: przed 28.11.2026.
- Konsultacje ze specjalistą: poniedziałek 10.11 (FIKS / Jankiewicz) — patrz [[Decyzje do podjęcia]].
- Niezależna recenzja kodu: 11 ryzyk, R1–R6 do poprawy przed treścią tygodnia 4 ([[Review kodu v3 – niezależny]]). Research transkrypcji PL gotowy ([[Transkrypcja PL – research]]).
- Repo lokalne z pierwszym commitem; nie wypchnięte na GitHub (decyzja B1).

## Następna akcja
1. Alek: przejrzeć [[Decyzje do podjęcia]] i odhaczyć.
2. Agent: po decyzjach — podział `app/index.html` na pliki (Opcja A) i treść tygodni 4–6.

## Inbox / Review
- [[Inbox]] · [[Review]]
