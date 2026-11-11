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
- [[HLD PoC – kworum 2026-11-11]] — ocena kodu wg dobrych praktyk i propozycja HLD dla PoC (4 agentów, głosowanie, runda „grill”); czeka na decyzje C1–C8
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
- [[Backlog]]: każda pozycja ma moduł HLD, rozmiar i spec; roadmapa M0–M4 + utrzymanie, mapa pętla × kamienie i lista na 2 tygodnie w [[Plan działania]].

- 2026-11-11: przegląd kodu i architektury przez kworum agentów – [[HLD PoC – kworum 2026-11-11]]. To **propozycja**; kod bez zmian. Do decyzji Alka: C1–C8 w [[Decyzje do podjęcia]].

## Następna akcja
1. Okno B: B14 wg [[B14 Zadanie w terenie]] – przed 14.11 (start tygodnia 2).
2. Alek: konsultacja 10.11 – [[Kontekst i profil]], pytania z B2 (w tym kolejność szczebli i imię w tygodniu 3); decyzje B21–B28 z weryfikacji v4.
3. Okno B potem: A5 podział, #15 eksport; spec B15 (+ B13 w tej samej karcie).
4. Alek (opcjonalnie): na GitHubie włączyć „Automatically delete head branches” (Settings → General).

## Inbox / Review
- [[Inbox]] · [[Review]]
