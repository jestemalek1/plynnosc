---
status: active
owner: Alek
updated: 2026-11-08
tags: [produkt, hld, decyzje]
---

# HLD v1 – porównanie z planem

Źródła: [[HLD v1]] (Alek, 8.11) i [[Plan działania]] (sekcja „Nasz obecny plan w skrócie”).

## Najważniejsza różnica
HLD opisuje **produkt rynkowy dla wielu dorosłych z jąkaniem**: profil z wywiadu, plan dobierany indywidualnie, panel logopedy. Nasz plan opisuje **narzędzie dla jednej osoby**: profil Alka zaszyty w kodzie, sztywny program 12 tygodni, dane w jednym telefonie.
Kierunek jest zgodny: ten sam cykl „ocena → plan → ćwiczenia → transfer → pomiar”. Różni się skala. Dogfooding łączy jedno z drugim: apka Alka staje się prototypem modułów HLD, sprawdzonym na sobie, zanim powstanie infrastruktura produktu.

## Moduł po module
| HLD | Co mamy dziś | Różnica | Propozycja (n=1, bez infrastruktury produktu) |
| --- | --- | --- | --- |
| 01 Wywiad i ocena wstępna | Wywiad zrobiony w czacie; dzień 1: 4 nagrania bazowe + hierarchia 10 sytuacji. Profil zaszyty w kodzie (data startu, tematy, wyniki bazowe). | Brak wywiadu w apce; profil nie jest danymi. | Wyciągnąć profil do `data.js` przy podziale plików (A5). Wywiad w apce później, po dopracowaniu funkcjonalności (B12). |
| 02 Biblioteka ćwiczeń | 7 ćwiczeń w kodzie (oddech, sygnał, monolog, napięcie, miękki start, dziennik, SR); program opisuje 9 procedur A–I. | Treść wymieszana z logiką. | `data.js` = biblioteka (opis + parametry ćwiczeń). Naturalny skutek A5. |
| 03 Generator planu | `exercisesFor()`: lista wg numeru tygodnia, czyli wg daty. | HLD: plan indywidualny i aktualizowany wg postępów. **Nasz własny program też mówi „przechodzisz dalej, gdy spełnisz kryterium, nie dlatego, że minął tydzień” – apka tego nie robi.** | Silnik odłożony (B12): powstaje po dopracowaniu funkcjonalności. Co do tego czasu z kryterium przejścia – decyzja B13. |
| 04 Realizacja ćwiczeń | Najmocniejsza część: ekran Dziś, timery z auto-licznikiem, mapa wysp. | Zgodne. | Bez zmian; poprawki z dogfoodingu (okno A). |
| 05 Trening komunikacji | Monolog z kartą tematu, „Start na sygnał”. **Poprawka 8.11:** w tygodniu 1 zadaniem w terenie jest właśnie luźny monolog, więc apka go ma. Prawdziwe zadania w terenie (szczeble hierarchii, przedstawienie się) zaczynają się w tygodniu 2, czyli **14.11**, i tych apka nie pokazuje. Brak rozmów z AI. | Transfer do prawdziwych sytuacji od tygodnia 2 jest w programie, ale nie w apce. | „Zadanie w terenie” musi być gotowe przed 14.11, nie w M1 (decyzja B14). Rozmowa z AI głosem, na żywo – HLD 05 (B19), później. |
| 06 Monitorowanie postępów | SR (teraz tygodniowo), streak, bloki z ocen, mapa napięcia, hierarchia. | HLD mierzy też komfort, napięcie, **unikanie** i uczestnictwo. My nie mierzymy unikania ani zamiany słów, choć zamiana słów to Twój cel do wygaszenia. | B15: w dzienniku przełączniki „zamieniłem słowo” / „odpuściłem sytuację”, suma w SR tygodnia; bez nowych skal. Uczestnictwo z B14. OASES – z logopedką. |
| 07 Wsparcie psychologiczne | Świadomie odsunięte: po wywiadzie CBT na lęk ma niski priorytet (bloki bez odczuwanego stresu). #12 to samorozwój, nie terapia. | Dla produktu to osobny moduł; dla Ciebie niski priorytet. | Moduł „później” (B12). #14 jako „refleksja z nagrań” z zabezpieczeniami w HLD 07, poza MVP (B17). Dobrowolne jąkanie i anulowanie (tyg. 6–7) pokrywają część „wstyd/unikanie”. |
| 08 Panel logopedy | Brak. Jest „Kopiuj dane” (JSON). | Brak wglądu specjalisty. | **Raport dla logopedy**: jedna strona tekstu (baza, SR tygodniowe, kryteria, dziennik) do skopiowania przed konsultacją (B16). **Poprawka 8.11:** konsultacja jest 10.11, czyli przed M1, więc na nią idzie ręcznie [[Kontekst i profil]]; raport w apce służy kolejnym konsultacjom. Prawdziwy panel wymaga backendu i kont – produkt. |

## Co jest u nas, a nie ma w HLD
- ~~**#13 angielski**~~ – od B31 w HLD jako moduł 09 „Trening języka obcego”.
- ~~**#12 jedno pytanie / #14 „psychoanaliza”**~~ – od B32 w HLD jako moduł 10 „Refleksja i wzorce” (wersja bez etykiet i diagnoz), poza MVP.
- ~~**Ocena nagrań przez Claude**~~ – od B19 w HLD (moduł 06, docelowo z dźwięku i rozmowy na żywo). Dzisiejsze „Oceń” działa na transkrypcie, więc nie widzi cichych bloków.
- **Grywalizacja** (mapa wysp, streak, zachęty) – HLD jej nie opisuje; to warstwa UX modułu 04.

## Co jest w HLD, a nie ma u nas
- Panel logopedy, wielu użytkowników, wywiad w apce (patrz tabela).
- Korektor w czasie rzeczywistym (DAF/AAF) – według naszego researchu sam DAF nie daje istotnego efektu (metaanaliza 2000–2024), działa tylko w użyciu. Zgodne z decyzją HLD, żeby go odłożyć.
- Społeczność – poza zakresem obu.
- Granice z §6: od B20 rozpisane na moduły w HLD §6. Dla Ciebie (n=1) nic nie zmieniają w apce; dla produktu obowiązkowe. Dane o zdrowiu to szczególna kategoria danych w RODO, a oprogramowanie o celu terapeutycznym może podlegać przepisom o wyrobach medycznych – do sprawdzenia przed jakimkolwiek udostępnieniem innym.

## Technicznie
HLD celowo nie wybiera technologii. Nasz runtime (artefakt claude.ai, localStorage, ocena przez `sample`) wystarcza dla jednej osoby, ale nie dla produktu: brak kont, współdzielenia danych z logopedą i mikrofonu w stronie. Produkt będzie potrzebował własnej aplikacji i backendu. Rekomendacja: nie budować tego teraz; decyzja po M2/M3, z danymi z własnego użycia.

## Co HLD pomijał (dopisane 8.11)
- **Utrzymanie i nawroty (B18)** – dopisane do HLD 03, 06 i §4.
- **Ocena mowy przez AI (B19)** – dopisana do HLD 01, 05, 06; korektor w §5 zawężony do czasu rzeczywistego.
- **Minimum bezpieczeństwa (B20)** – tabela w HLD §6.
- **Język obcy (B31) i refleksja nad wzorcami (B32)** – nowe moduły 09 i 10.

## Decyzje dla Alka
[[Decyzje do podjęcia]], B12–B20; rozstrzygnięte w [[Decision log]].
