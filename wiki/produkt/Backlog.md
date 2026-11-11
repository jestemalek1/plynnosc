---
status: active
owner: Alek
updated: 2026-11-08
tags: [backlog, hld]
---

# Płynność – backlog

Właściciel: Alek. Aktualizacja: 2026-11-08 (sesja decyzji HLD). Roadmapa i lista na 2 tygodnie: [[Plan działania]].
**Zasada (B12):** każda pozycja ma moduł z [[HLD v1]] (01–10). Fundament techniczny (**F→nn**) jest dopuszczony tylko wtedy, gdy służy wskazanemu modułowi. Pomysł spoza HLD najpierw trafia do HLD (decyzja Alka), potem tutaj. Cel nadrzędny: trening Alka.
**Rozmiary (B29):** S = `fix/*`, bez specyfikacji · M = jedna runda, opis w backlogu · L = spec w `wiki/specs/` + tester + recenzent, budżet w rundach ([[Jak pisać spec]]).
**Zasada pomiaru (B15):** jedna skala SR 0–8 tylko dla nasilenia jąkania i poziomu techniki; wszystko inne to fakt tak/nie (jedno dotknięcie) albo licznik liczony przez apkę. Wyjątek: „Oddech po frazach: tak / częściowo / nie” w monologu zostaje.
Okno **A** = Dogfood (poprawki z codziennego używania), okno **B** = Rozwój (funkcje z planu). Status: ☐ do zrobienia · ◐ w toku · ☑ zrobione · ⏸ czeka na Alka.

## Teraz – M0 Fundament (do 13.11)
| Status | ID | Co | HLD | Rozmiar | Spec | Okno | Uwagi |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ◐ | v4 | Feedback dnia 2: wdech 3 s, legenda SR, SR tygodniowo, „Start na sygnał”, dzień zaliczony zostaje | 04, 06 | L | — (sprzed B29; wymagania w CHANGELOG v4) | B | tester + recenzent (gałąź `feature/testy-v4-wip` przerwana); wydanie po czystej rundzie |
| ☐ | B14 | Zadanie w terenie: karta od tyg. 2, „Użyłem techniki” / „Dziś nie”, nie blokuje zaliczenia dnia, licznik /7 | 05 (→06, 08) | L | [[B14 Zadanie w terenie]] | B | **przed 14.11**; treść tyg. 2–3 do akceptacji Alka; pełna pętla tester + recenzent |
| ☐ | A5 | Podział `app/index.html` na `styles.css`, `data.js`, `app.js` (etap E1; `map.js` skreślony – C1) | F→02 | L | — (refaktor: [[Architektura aplikacji]]) | B | `data.js` = biblioteka ćwiczeń (02) i profil (01 n=1); do tego czasu okno A nie zmienia kodu; może zejść na 14–15.11, B14 nie |
| ☐ | A7 | Strażnik architektury: `test/arch.js` + workflow w Actions, przegląd PR przez Codex wg `AGENTS.md` | F→wszystkie | M | [[A7 Strażnik architektury]] (zaakceptowany) | B | razem z A5; decyzja C9; zasady: [[Zasady architektury]] |
| ☐ | #15 | Eksport/import danych (JSON) | F→06, 08 | M | — | B | dane postępów są tylko w jednym telefonie; eksport jest też nośnikiem dla logopedy; **wchodzi w A8 (C2)** |
| ☑ | #19 | Oddech A i Start na sygnał: słowa dnia (pule 1–2, bez powtórek 7 dni), pytanie o brzuch, dźwięki wdech/wydech + Wake Lock, pytania PL/EN bez wspólnych tematów | 04, 06, 02 | L | [[19 Oddech A i Start na sygnał – zmienność i dźwięki]] | A | uwagi z dni 3–5 (irytuje, B33); `fix/19-oddech-sygnal`; po B14 albo w uzgodnieniu z oknem B; zawiera WL, B21(b), B24(a)(c), B26 |
| ☑ | B1 | Repo `jestemalek1/plynnosc` na GitHubie | F→wszystkie | — | — | Alek | zrobione |

## Następne – M1 Stabilnie (do 21.11)
| Status | ID | Co | HLD | Rozmiar | Spec | Okno | Uwagi |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ☐ | A8 | Pakiet bezpieczeństwa (etap E2): `store.js` – import „wklej”, kopia przed migracją, widoczny błąd zapisu; siatka na wyjątki; Wake Lock w pozostałych timerach; R4, R5 | F→04, 06 | L | do napisania | B | decyzja C2; obejmuje #15, resztę WL oraz R4 i R5 z R3–R7; plan: [[Architektura aplikacji]] |
| ☐ | R3–R7 | Poprawki z recenzji: błąd od dnia 85, sonda Claude bez kliknięcia, stary wynik oceny, pasek kart po klawiaturze, sanityzacja stanu | 04, 06 | L | [[Review kodu v3 – niezależny]] | B | [[Review kodu v3 – niezależny]] |
| ☑ | #20 | Dziennik bloków z sensem: wpis z dotknięć (start ja/ktoś, PL/EN, wolno/szybko) + „Dziś bez wyraźnego bloku”, notatka opcjonalna; od razu po wpisie liczniki z ostatnich dni („wpisy 3 · start: ktoś 3/3 · szybko 2/3”), bez interpretacji; w „Dlaczego” zdanie, że po 14 dniach tabela idzie do logopedki (B16) | 06 | M | [[20 Dziennik bloków z sensem]] | A | uwaga z dnia 3 (irytuje); w wydaniu v5 razem z #19, #21 (decyzja Alka 11.11); B15 dokłada przełączniki później |
| ☐ | B15 | Dziennik: przełączniki „zamieniłem słowo” i „odpuściłem sytuację” (1 dotknięcie); suma z 7 dni w karcie SR tygodnia | 06 | L | do napisania (następny) | B | w tej samej rundzie co R3–R7; do wdrożenia zamiany zapisuj w notatce dnia |
| ◐ | WL | Wake Lock w timerach (ekran nie gaśnie) | 04 | S | — | A | Oddech A w #19; reszta timerów (monolog, napięcie, miękki start) po #19 |
| ☐ | #18 | „Uwaga do apki”: jedno zdanie z dowolnego ekranu, lista uwag + kopiuj | F→04 | M | — | A | przesunięte z M0 (B14); do tego czasu uwagi jednym zdaniem w [[Inbox]]; usuwamy po okresie dogfoodingu |
| ☐ | B16 | Raport dla logopedy – 1 strona do skopiowania: baza, SR tygodni, kryteria (B13), zadania w terenie, zamiany słów | 08 | M | — | B | po B14 i B15; na 10.11 ręcznie [[Kontekst i profil]] |
| ⏸ | B4 | Transkrypcja PL: test Whisper na jednym monologu | 06 | — | — | Alek | pomost do czasu oceny z dźwięku (B19); [[Transkrypcja PL – research]] |
| ⏸ | B2 | Konsultacja 10.11 → wnioski do programu (w tym kolejność szczebli hierarchii) | 08, 02 | — | — | Alek | lista pytań w [[Decyzje do podjęcia]] |

## M2 Tydzień 4 gotowy (do 27.11)
| Status | ID | Co | HLD | Rozmiar | Spec | Okno |
| --- | --- | --- | --- | --- | --- | --- |
| ☐ | T4–6 | Treść tygodni 4–6: wydłużona mowa (D), cykle Camperdown, dobrowolne jąkanie (G), anulowanie (H) | 02, 04 | L | do napisania (po B15) | B |
| ☑ | #21 | ★ Ćwiczenie z gwiazdką (dla chętnych): monolog w drugim języku niż dzisiejszy, 2 min, inny temat, te same pytania po monologu; nie wlicza się do zaliczenia dnia ani streaka; zrobione = gwiazdka na wyspie | 04 | L | [[21 Ćwiczenie z gwiazdką]] | A | w wydaniu v5 razem z #19, #20 (decyzja Alka 11.11); pomysł z 10.11, decyzja B34; źródło: program tydz. 1 (monolog naprzemiennie PL/EN) |
| ☐ | B13 | Karta SR tygodnia: „Kryterium tygodnia spełnione? tak/nie” + treść kryterium; 2× „nie” → sygnał w B16 | 03 | M | — (karta jak w B15; można w tej samej rundzie) | B |

## Później – po dopracowaniu funkcjonalności (B12)
| ID | Co | HLD | Rozmiar | Spec | Kamień |
| --- | --- | --- | --- | --- | --- |
| B7 | Tryb szybki 10 min (decyzja po tyg. 3) | 04 | M | — | M3 |
| T7–12 | Treść tygodni 7–12 | 02, 04 | L | później | M4 |
| B18 | Utrzymanie: przeglądy po 2, 2, 4, 4, 8 tyg., potem po 3 i 6 mies.; sygnały nawrotu | 03, 06 | L | później | M4 → utrzymanie |
| B19 | Ocena mowy przez AI z nagrania i rozmowy na żywo (dźwięk, nie transkrypt) | 06, 05, 01 | L | później | po przeglądzie M3 |
| 03 | Silnik planu (generator) | 03 | L | później | po przeglądzie M3 |
| 01 | Wywiad i ocena wstępna w apce | 01 | L | później | produkt |
| #13 | English card z nagrania EN (pierwsza wersja języka obcego) | 09 | L | do napisania | M3 |
| #12 | Jedno pytanie z monologu (pierwsza wersja refleksji) | 10 | L | do napisania | M3 |
| #14 | Refleksja z nagrań – wersja bezpieczna; po dostarczeniu plików z sesji „AI lab” | 10 | L | później | poza MVP |

## Zgłoszenia (historia – źródło numerów #)

To jest historia zgłoszeń, nie backlog. Co z każdym zrobiono: tabele wyżej, [[Decision log]] i `CHANGELOG.md`. #12 i #13 są w backlogu od B17, w modułach 09 i 10 (B31, B32).

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
19. **Oddech A i Start na sygnał – zmienność i dźwięki** – te same słowa codziennie, brak pytania o brzuch, dźwięk na wdech i wydech (oczy zamknięte), pytania EN powtarzają PL. Zgłoszone 2026-11-09…11 (dni 3–5). Spec: [[19 Oddech A i Start na sygnał – zmienność i dźwięki]].
20. **Dziennik bloków – „nie czuję, co wypełniam i po co”**. Zgłoszone 2026-11-09.
21. **Ćwiczenie z gwiazdką** – nieobowiązkowe, dla chętnych. Zgłoszone 2026-11-10.
17. **Feedback dnia 2** – wdech za szybki, brak legendy SR przy ocenie, SR dnia zbędny na starcie, za mało ćwiczeń. Zgłoszone 2026-11-08. Wdrożone w v4 (patrz [[Decision log]] 2026-11-08).

Dane bazowe z dnia 1: [[Kontekst i profil]]. Dawny „Plan wdrożenia v2” i statusy wersji: [[Architektura aplikacji]], [[Decision log]], `CHANGELOG.md`.
