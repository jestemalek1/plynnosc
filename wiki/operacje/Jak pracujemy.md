---
status: active
updated: 2026-11-07
tags: [operacje, proces]
---

# Jak pracujemy

Zasada nadrzędna: **target, nie proces**. Jeden plik do czytania przed pracą (`CLAUDE.md`), jedna bramka jakości (harness), jedno miejsce na decyzje.

## Pętla, która się sprawdziła (3 rundy v2/v3, 15/15 testów)
1. **Budowniczy** (agent) robi zmianę w `app/`.
2. **Niezależny tester** (agent, Playwright) sprawdza wymagania punkt po punkcie — bez czytania twierdzeń budowniczego, z listy wymagań.
3. **Recenzent kodu** (agent) czyta diff bez znajomości twierdzeń budowniczego.
4. Lista poprawek → kolejna runda. Publikacja po czystej rundzie.

Małe zmiany (tekst, jedna funkcja): sam budowniczy + harness. Pętlę z testerem i recenzentem uruchamiamy przy zmianach w logice dnia/tygodnia, stanie, timerze, mapie, ocenie.

## Co robi Alek, co robi agent
- Alek: decyzje produktowe i biznesowe ([[Decyzje do podjęcia]]), treść terapii po konsultacji z logopedą, testy na prawdziwym telefonie, dziennik.
- Agent: kod, testy headless, research z podanymi źródłami, propozycje decyzji z rekomendacją (nigdy „wybierz sam” bez rekomendacji).

## Sesja agenta — checklista
1. Przeczytaj `CLAUDE.md` → [[Start]] → [[Decyzje do podjęcia]] (czy coś odhaczone?).
2. Weź jedną pozycję z [[Backlog]] albo jedną decyzję do wdrożenia.
3. Zmiana → `node --check` → `node test/run.js && node test/round2.js`.
4. Większa zmiana → tester + recenzent (osobni agenci) → poprawki.
5. Publikacja wg [[Publikacja (artefakt claude.ai)]].
6. Wpis w [[Decision log]] (jeśli decyzja) i aktualizacja „Aktualny stan” w [[Start]]. Commit.

## Czego nie robimy
- Nie wprowadzamy frameworka, bundlera, CI, Spec Kitu, linterów — dopóki nie boli.
- Nie trzymamy w repo transkryptów nagrań ani danych wrażliwych.
- Nie piszemy treści terapii bez źródła w [[Program płynności]] albo bez akceptacji Alka.
