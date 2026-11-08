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
| 01 Wywiad i ocena wstępna | Wywiad zrobiony w czacie; dzień 1: 4 nagrania bazowe + hierarchia 10 sytuacji. Profil zaszyty w kodzie (data startu, tematy, wyniki bazowe). | Brak wywiadu w apce; profil nie jest danymi. | Wyciągnąć profil do `data.js` przy podziale plików (A5). Wywiad w apce dopiero przy produkcie. |
| 02 Biblioteka ćwiczeń | 7 ćwiczeń w kodzie (oddech, sygnał, monolog, napięcie, miękki start, dziennik, SR); program opisuje 9 procedur A–I. | Treść wymieszana z logiką. | `data.js` = biblioteka (opis + parametry ćwiczeń). Naturalny skutek A5. |
| 03 Generator planu | `exercisesFor()`: lista wg numeru tygodnia, czyli wg daty. | HLD: plan indywidualny i aktualizowany wg postępów. **Nasz własny program też mówi „przechodzisz dalej, gdy spełnisz kryterium, nie dlatego, że minął tydzień” – apka tego nie robi.** | Generator v0: przejście do kolejnego tygodnia po kryterium z programu (samoocena w niedzielnym Review), w M2 razem z tygodniami 4–6. |
| 04 Realizacja ćwiczeń | Najmocniejsza część: ekran Dziś, timery z auto-licznikiem, mapa wysp. | Zgodne. | Bez zmian; poprawki z dogfoodingu (okno A). |
| 05 Trening komunikacji | Monolog z kartą tematu, „Start na sygnał”. Program ma codzienne **zadanie w terenie** – apka go nie pokazuje. Brak symulacji rozmów z AI. | Transfer do prawdziwych sytuacji jest w programie, ale nie w apce. | Dodać „Zadanie w terenie” (1 zdanie dziennie + „zrobione/nie”) w M1. Symulacja rozmowy z AI tylko tekstowo (artefakt nie ma mikrofonu) – później. |
| 06 Monitorowanie postępów | SR (teraz tygodniowo), streak, bloki z ocen, mapa napięcia, hierarchia. | HLD mierzy też komfort, napięcie, **unikanie** i uczestnictwo. My nie mierzymy unikania ani zamiany słów, choć zamiana słów to Twój cel do wygaszenia. | Do karty „SR tygodnia” dodać 2 pytania: zamiana słów (nigdy / czasem / często) i uniknięte sytuacje (liczba). Kwestionariusz typu OASES co 3 miesiące – później. |
| 07 Wsparcie psychologiczne | Świadomie odsunięte: po wywiadzie CBT na lęk ma niski priorytet (bloki bez odczuwanego stresu). #12 to samorozwój, nie terapia. | Dla produktu to osobny moduł; dla Ciebie niski priorytet. | Zostaje w backlogu jako moduł „później”. Dobrowolne jąkanie i anulowanie (tyg. 6–7) pokrywają część „wstyd/unikanie”. |
| 08 Panel logopedy | Brak. Jest „Kopiuj dane” (JSON). | Brak wglądu specjalisty. | **Raport dla logopedy**: jedna strona tekstu (baza, SR tygodniowe, kryteria, dziennik) do skopiowania przed konsultacją – M1. Prawdziwy panel wymaga backendu i kont – produkt. |

## Co jest u nas, a nie ma w HLD
- **#13 angielski** (English card z nagrań) – poza zakresem HLD. Pasuje do modułu 05 tylko jako „komunikacja w języku obcym”. Dla Ciebie ważne, bo bloki po angielsku są najcięższe.
- **#12 jedno pytanie / #14 „psychoanaliza”** – samorozwój, nie terapia jąkania. Poza HLD.
- **Ocena nagrań przez Claude** – w HLD najbliżej „korektora jąkania (analiza nagrań)” z §5, który jest odłożony. U nas już działa.
- **Grywalizacja** (mapa wysp, streak, zachęty) – HLD jej nie opisuje; to warstwa UX modułu 04.

## Co jest w HLD, a nie ma u nas
- Panel logopedy, wielu użytkowników, wywiad w apce (patrz tabela).
- Korektor w czasie rzeczywistym (DAF/AAF) – według naszego researchu sam DAF nie daje istotnego efektu (metaanaliza 2000–2024), działa tylko w użyciu. Zgodne z decyzją HLD, żeby go odłożyć.
- Społeczność – poza zakresem obu.
- Granice z §6: informacja o pilnej ocenie medycznej przy nagłym jąkaniu u dorosłego; zgody i ochrona danych; weryfikacja kliniczna i regulacyjna funkcji terapeutycznych. Dla Ciebie (n=1) nieistotne; dla produktu obowiązkowe. Dane o zdrowiu to szczególna kategoria danych w RODO, a oprogramowanie o celu terapeutycznym może podlegać przepisom o wyrobach medycznych – do sprawdzenia przed jakimkolwiek udostępnieniem innym.

## Technicznie
HLD celowo nie wybiera technologii. Nasz runtime (artefakt claude.ai, localStorage, ocena przez `sample`) wystarcza dla jednej osoby, ale nie dla produktu: brak kont, współdzielenia danych z logopedą i mikrofonu w stronie. Produkt będzie potrzebował własnej aplikacji i backendu. Rekomendacja: nie budować tego teraz; decyzja po M2/M3, z danymi z własnego użycia.

## Decyzje dla Alka
Przeniesione do [[Decyzje do podjęcia]] jako B12–B16.
