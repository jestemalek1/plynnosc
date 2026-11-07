# Płynność – backlog i plan rozwoju aplikacji

Właściciel: Alek. Stan na 2026-11-07.

## Pomysły od Alka (w kolejności zgłoszenia)

1. **Jedna skala wszędzie** – SR 0–8 jako kolorowy pasek do kliknięcia; żadnych innych skal (0–10 wypada).
2. **Ściągawka SR na stronie** – widoczna, intuicyjna, nie tekst.
3. **Odsłuch + ocena przez Claude w stronie** – wklejam transkrypt z Voice Memos (EN działa, PL nie), Claude ocenia płynność.
4. **Praca nad angielskim przy okazji** – słownictwo, płynność wypowiedzi, poprawki „powiedziałeś → lepiej”.
5. **Automatyczne liczenie powtórzeń** – każde odliczenie timera = +1 powtórzenie; minimum kliknięć.
6. **Jasna instrukcja wykonania** – np. jak dokładnie powiedzieć „Aleksander” w ćwiczeniu oddechowym (tempo, start), jednym zdaniem, tak żeby nie było wątpliwości.
7. **Ćwiczenia nie mogą być nudne/powtarzalne** – luźny monolog wyglądał jak powtórka nagrań bazowych. Styl Duolingo: zachęta po każdym ćwiczeniu, różnorodność, progres widoczny.
8. **Analiza słabych punktów i samorozwój** – Claude analizuje, co opowiadam (treść, nie tylko forma), pomaga w samorozwoju; połączenie treningu wypowiedzi z rozwojem osobistym.
9. **Trening rozmowy jako treść** – z dziennika: „za wolno myślę, nie wiem, co powiedzieć, brakuje mi treningu w rozmowie” → karty tematów, pytania, formułowanie myśli, nie tylko mechanika mowy.
10. **Transkrypcja po polsku** – Voice Memos nie transkrybuje PL; potrzebna alternatywa (dyktowanie w Notatkach / wgranie audio do czatu).

11. **Mapa wysp (roadmapa)** – dni jako wysepki do wyboru, tydzień = archipelag z nazwą etapu; po tygodniu przechodzi się na nowy archipelag; ma być widać, dokąd zmierzamy (12 archipelagów = 12 tygodni programu). Zgłoszone 2026-11-07.

12. **Rozwój osobisty na podstawie nagrań (duży feature)** – pytania mają być rozsądne, nie „terapeutyczne”; zrobić research aplikacji do samorozwoju / budowania lepszej wersji siebie (wzorce: refleksja, pytania, cele, nawyki) i wpleść w nasze rozwiązanie. Zgłoszone 2026-11-07. Research gotowy: research/12-13-samorozwoj-angielski.md (ekstrakcja z monologu, reguła jednego pytania, 20 promptów).
13. **Doskonalenie języka obcego (duży feature)** – języka, w którym wypowiada się osoba; na razie angielski. Research aplikacji do mówienia w obcym języku (feedback po wypowiedzi, słownictwo, powtórki, shadowing) i integracja z oceną nagrań. Zgłoszone 2026-11-07. Research gotowy: research/12-13-samorozwoj-angielski.md (format karty, JSON, bank chunków, metryki, interferencja PL).

14. **Lepsze rozumienie siebie i podłoża zachowań („psychoanaliza” z nagrań)** – rozwinięcie #12: nie tylko refleksja, ale analiza wzorców i ich źródeł na podstawie tego, co Alek opowiada. Istnieje już design pipeline'u z wcześniejszego projektu Alka z innym współpracownikiem (ten współpracownik robił „psychoanalizę”); design jest poparty researchem i ma materiały – DO DOSTARCZENIA przez Alka (plik/link/nazwa Projektu), wtedy adaptujemy pipeline do naszego rozwiązania. Zgłoszone 2026-11-07. Status: design powstał w sesji Claude Code („AI lab”, https://claude.ai/code/session_01M48q9i1Wur2dFYwTKhR61K) – nie da się jej odczytać z tej rozmowy; potrzebne repo lub pliki designu.

## Dane bazowe (dzień 1, 2026-11-07)

| Nagranie | Bloki | SR |
| --- | --- | --- |
| Czytanie PL | 1 | 5 |
| Monolog PL | 1 | 4 |
| Monolog EN | 1 | 3 |
| Rozmowa | 1 | 2 |

Hierarchia (przeliczona 0–10 → 0–8): 1=2, 2=2, 3=3, 4=5 (wtrącenie), 5=4 (szybka odpowiedź), 6=2, 7=2, 8=4 (spotkanie EN), 9=2, 10=4 (prezentacja EN).
Oddech A: nie wykonane (0/12). Monolog: brak oddechu po frazach, brzuch spięty, 2 bloki.
Dziennik: „za wolno myślę, nie wiem co powiedzieć, brakuje mi treningu w rozmowie”.

## Plan wdrożenia – wersja 2 (jedna aplikacja zamiast strony na dzień)

**Architektura:** jeden samodzielny plik HTML, publikowany jako artefakt (capability `sample` = pytanie Claude ze strony). Stan w localStorage pod kluczem `plynnosc` (dzień 1 zaimportowany z danych wyżej). Ekrany:

1. **Dziś** – sesja dnia wg progresji (tydzień 1: oddech A, monolog z kartą tematu, dziennik). Każde ćwiczenie: instrukcja jednym zdaniem + „jak to ma brzmieć”, timer, automatyczny licznik powtórzeń (koniec odliczenia = +1, sygnał, auto‑start kolejnego po 2 s), po ćwiczeniu krótka zachęta + co poszło dobrze.
2. **Oceń nagranie** – wklej transkrypt (+ język, czas trwania) → metryki lokalne (słowa/min, wypełniacze, powtórzenia, restarty) → „Oceń z Claude”: płynność, angielski (tabela powiedziałeś → lepiej, 3 zwroty do zapamiętania), treść/samorozwój (co mówisz o sobie, słabe punkty, jedno pytanie do przemyślenia), zadanie na jutro.
3. **Postępy** – SR dzienne (typowe/najgorsze) na jednym pasku 0–8, streak dni, bloki PL/EN, hierarchia.
4. **Ściągawka** – SR 0–8 kolorowo, zasady w bloku (5 kroków), 3 reguły programu.

**Komponenty wspólne:** `SRPicker` (9 chipów 0–8, kolor zielony→czerwony, opis po dotknięciu), `Timer` (auto‑powtórzenia), `Card` z zachętą, `TopicCard` (losowy temat PL/EN z puli ~60, tagi: sport, praca, książki, kuchnia azjatycka, samorozwój).

**Kolejność prac:** (1) szkielet + SRPicker + Timer z auto‑licznikiem; (2) sesja dnia 2 (niedziela 8.11) i import dnia 1; (3) ocena transkryptu z `sample`; (4) postępy; (5) treści: karty tematów, zachęty, instrukcje „jak to ma brzmieć”.

## Status

- 2026-11-07: v2 opublikowana (https://claude.ai/artifact/EUANdz59Df6hkaxVUsHR5P), 3 rundy build → tester + code review → poprawki; 15/15 testów akceptacyjnych PASS, harnessy: test/run.js, test/round2.js. Pokryte pomysły 1–9. Pomysł 10 (transkrypcja PL) otwarty.

- 2026-11-07 (wieczór): v3 – mapa wysp (#11) opublikowana; 12 archipelagów, odblokowanie po dacie, zablokowane etapy pokazują plan. Tygodnie 4–12: placeholder (dziennik + SR) – treść do dodania przed 28.11.2026. Architekt: decyzja A/B szablonu czeka na Alka (research/szablony-decyzja.md).

## Otwarte

- Transkrypcja PL: sprawdzić dyktowanie w Notatkach iOS (PL) lub wgrywanie m4a do czatu.
- Czy sesja ma mieć tryb „szybki” (10 min) na dni bez czasu.
