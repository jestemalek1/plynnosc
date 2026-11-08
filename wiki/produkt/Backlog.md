# Płynność – backlog

Właściciel: Alek. Aktualizacja: 2026-11-08. Kamienie milowe i zasady okien: [[Plan działania]].
Moduły HLD: [[HLD v1 – porównanie z planem]]. Okno **A** = Dogfood (poprawki z codziennego używania), okno **B** = Rozwój (funkcje z planu). Status: ☐ do zrobienia · ◐ w toku · ☑ zrobione · ⏸ czeka na Alka.

## Teraz – M0 Fundament (do 13.11)
| Status | ID | Co | Okno | Uwagi |
| --- | --- | --- | --- | --- |
| ◐ | v4 | Feedback dnia 2: wdech 3 s, legenda SR, SR tygodniowo, „Start na sygnał”, dzień zaliczony zostaje | B | tester + recenzent w toku; wydanie po czystej rundzie |
| ⏸ | B1 | Repo `jestemalek1/plynnosc` na GitHubie | Alek | warunek pracy w dwóch oknach |
| ☐ | A5 | Podział `app/index.html` na `styles.css`, `data.js`, `map.js`, `app.js` | B | pierwsze zadanie okna B; do tego czasu okno A nie zmienia kodu |
| ☐ | #18 | „Uwaga do apki”: jedno zdanie z dowolnego ekranu, lista uwag + kopiuj | A | zbieranie dogfoodu bez wychodzenia z treningu |
| ☐ | #15 | Eksport/import danych (JSON) | B | dane są tylko w jednym telefonie |

## Następne – M1 Stabilnie (do 21.11)
| Status | ID | Co | Okno | Uwagi |
| --- | --- | --- | --- | --- |
| ☐ | R3–R7 | Poprawki z recenzji: błąd od dnia 85, sonda Claude bez kliknięcia, stary wynik oceny, pasek kart po klawiaturze, sanityzacja stanu | B | [[Review kodu v3 – niezależny]] |
| ☐ | WL | Wake Lock w timerach (ekran nie gaśnie) | A | |
| ⏸ | B14 | Zadanie w terenie dziennie (HLD 05) | B | czeka na decyzję B14 |
| ⏸ | B15 | Zamiana słów + unikanie w karcie SR tygodnia (HLD 06) | A | czeka na decyzję B15 |
| ⏸ | B16 | Raport dla logopedy – 1 strona do skopiowania (HLD 08) | B | czeka na decyzję B16 |
| ⏸ | B4 | Transkrypcja PL: test Whisper na jednym monologu | Alek | [[Transkrypcja PL – research]] |
| ⏸ | B2 | Konsultacja 10.11 → wnioski do programu | Alek | lista pytań w [[Decyzje do podjęcia]] |

## M2 Tydzień 4 gotowy (do 27.11)
| Status | ID | Co | Okno |
| --- | --- | --- | --- |
| ☐ | T4–6 | Treść tygodni 4–6: wydłużona mowa (D), cykle Camperdown, dobrowolne jąkanie (G), anulowanie (H) | B |
| ⏸ | B13 | Generator planu v0: przejście tygodnia po kryterium (HLD 03) | B |

## Później – M3/M4
| ID | Co | Kamień |
| --- | --- | --- |
| #12 | Jedno pytanie z monologu (samorozwój) | M3 |
| #13 | English card z nagrania EN | M3 |
| B7 | Tryb szybki 10 min (decyzja po tyg. 3) | M3 |
| T7–12 | Treść tygodni 7–12 i utrzymanie | M4 |
| #14 | „Psychoanaliza” z nagrań – po dostarczeniu plików z sesji „AI lab” | M4 |

## Zgłoszenia (historia, w kolejności)

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

15. **Eksport/import danych (JSON)** – dane tylko w localStorage jednego telefonu; eksport przez capability `downloads`, import przez wklejenie. Zgłoszone 2026-11-07 (sesja Claude Code), decyzja B5 w [[Decyzje do podjęcia]].
16. **Poprawki z niezależnej recenzji v3 (R1–R11)** – [[Review kodu v3 – niezależny]]; R1–R6 przed treścią tygodnia 4. Zgłoszone 2026-11-07.

18. **„Uwaga do apki” (dogfooding)** – szybkie zapisywanie uwag do apki w trakcie treningu. Zgłoszone 2026-11-08 (wniosek z podejścia dogfoodingowego).
17. **Feedback dnia 2** – wdech za szybki, brak legendy SR przy ocenie, SR dnia zbędny na starcie, za mało ćwiczeń. Zgłoszone 2026-11-08. Wdrożone w v4 (patrz [[Decision log]] 2026-11-08).

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

- 2026-11-07 (sesja Claude Code): repo + vault Obsidiana, harness zielony lokalnie (exit 0, 0 błędów), niezależna recenzja kodu i research transkrypcji PL w `wiki/research/`. Decyzje: [[Decyzje do podjęcia]].

- 2026-11-07: v2 opublikowana (https://claude.ai/artifact/EUANdz59Df6hkaxVUsHR5P), 3 rundy build → tester + code review → poprawki; 15/15 testów akceptacyjnych PASS, harnessy: test/run.js, test/round2.js. Pokryte pomysły 1–9. Pomysł 10 (transkrypcja PL) otwarty.

- 2026-11-07 (wieczór): v3 – mapa wysp (#11) opublikowana; 12 archipelagów, odblokowanie po dacie, zablokowane etapy pokazują plan. Tygodnie 4–12: placeholder (dziennik + SR) – treść do dodania przed 28.11.2026. Architekt: decyzja A/B szablonu czeka na Alka (research/szablony-decyzja.md).

## Otwarte

- Transkrypcja PL: sprawdzić dyktowanie w Notatkach iOS (PL) lub wgrywanie m4a do czatu.
- Czy sesja ma mieć tryb „szybki” (10 min) na dni bez czasu.
