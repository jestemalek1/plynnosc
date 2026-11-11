---
status: zaakceptowany (Alek, 11.11 – przekazanie agentowi = akceptacja treści z §5)
id: "#19"
hld: 04, 06, 02
decyzja: B33, B34, B35, B36
budżet: 2 rundy
updated: 2026-11-11
---

# #19 Oddech A i Start na sygnał – zmienność i dźwięki

## 1. Cel i moduł HLD
Uwagi z dogfoodingu, dni 3–5 ([[Inbox]]), wszystkie „irytuje” – zgodnie z B33 (user friendly first) naprawiamy:
- Oddech A codziennie ma te same 4 słowa („nuda”); Alek chce nowych i trudniejszych (g/k).
- Oddech A nie pyta o brzuch, a Alek chce sam oceniać, żeby nabierać świadomości napięcia.
- Oddech A ma być do zrobienia z zamkniętymi oczami: dźwięk na początku wdechu i na początku wydechu.
- Start na sygnał: pytania EN powtarzają polskie (dzień 3: „Przedstaw się…” i „Can you introduce yourself?”), mała pula powtarza się dzień po dniu.

Moduły [[HLD v1]]: 04 Realizacja (timer, dźwięki), 06 Monitorowanie (brzuch jako fakt), 02 Biblioteka (pule słów i pytań). Decyzje: B33, B34 (technika stała, treść zmienna), B35 (brzuch: tak/częściowo/nie), B36 (dźwięki wdech/wydech) – [[Decision log]].

## 2. Zakres
**Wchodzi:**
- A. Słowa dnia w Oddechu A: dwie pule, codziennie inne, bez powtórek w oknie 7 dni, „Aleksander” co drugi dzień.
- B. Pytanie „Brzuch był miękki?” po serii Oddechu A (zalicza ćwiczenie) + licznik w Postępach.
- C. Dźwięki w Oddechu A: rosnący = początek wdechu, opadający = początek wydechu; Wake Lock w trakcie serii.
- D. Start na sygnał: nowe pule PL/EN z tematami, bez tego samego tematu w jednym dniu, bez powtórki pytania w oknie 7 dni.
- E. Drobne z weryfikacji v4, ten sam kod: B21(b) słowo dużym napisem w trakcie wdechu, B24(a) przed Startem „Wdech nosem 0:03”, B24(c) zdanie o trybie cichym, B26(a)(b) treść karty „Start na sygnał”.

**Poza zakresem (no-go):**
- Synteza mowy (czytanie słowa głosem) – osobny pomysł, jeśli zamknięte oczy + nowe słowa okażą się kłopotem.
- Zmiany w Miękkim starcie, monologu, napięciu, dzienniku, mapie.
- Nowe skale. Brzuch to fakt tak/częściowo/nie (B35), nie skala.
- Zmiana czasów faz (7 s wydech, 3 s wdech, 8+4 powtórzeń) i liczby pytań (10, 6 PL + 4 EN).

**Budżet:** 2 rundy (budowa + poprawki po testerze i recenzencie). Jeśli się nie mieści: najpierw A+D (treść), potem C, potem B; E tnie się pierwsze.

**Gałąź i kolejność:** `fix/19-oddech-sygnal` od `develop`. Plik `app/index.html` jest wspólny z B14 (okno B, termin 13.11) – zacząć po zmergowaniu B14 albo uzgodnić z oknem B. Jeśli A5 (podział pliku) jest już w `develop`, pule z §5 trafiają do `data.js`, logika do `app.js`.

## 3. Zachowanie (kryteria akceptacji – dla testera)
Zegar: `page.clock`, 390×844, `file://`. Dzień N = `dayIndex`.

| # | Gdy … | Wtedy … |
| --- | --- | --- |
| A1 | otwieram Oddech A w dniach 2…84 | nad przyciskiem Start widać „Słowa dnia: w1 · w2 · w3 · w4”; w fazie słów (powtórzenia 9–12) cue = te słowa w tej kolejności |
| A2 | porównuję słowa dowolnych 7 kolejnych dni (dni 2–84) | żadne słowo z puli nie występuje dwa razy; wyjątek: „Aleksander” |
| A3 | dzień N nieparzysty (N ≥ 3) | słowo 4 = „Aleksander”; w dniach parzystych „Aleksander” nie występuje |
| A4 | tydzień programu < `A_HARD_FROM_WEEK` (domyślnie 3) | wszystkie słowa (poza „Aleksander”) z puli 1 |
| A5 | tydzień ≥ `A_HARD_FROM_WEEK` | słowa 1–2 z puli 2 (zwarte), słowa 3–4 z puli 1 / „Aleksander” wg A3 |
| A6 | przeładuję stronę w tym samym dniu albo wrócę do dnia z mapy | te same słowa w tej samej kolejności (deterministycznie, bez zapisu w stanie) |
| A7 | dzień 1 (baza) | bez zmian (Oddech A nie występuje) |
| B1 | timer Oddechu A dojdzie do 12/12 | zamiast zaliczenia pokazuje się „Brzuch był miękki?” z trzema przyciskami: tak / częściowo / nie; ćwiczenie NIE jest jeszcze zaliczone |
| B2 | dotknę jednej odpowiedzi | Oddech A zaliczony, nagłówek karty „Zrobione · 12/12 · brzuch: <odpowiedź>”, przejście do następnego ćwiczenia jak dziś |
| B3 | przeładuję stronę po 12/12, przed odpowiedzią | widać pytanie o brzuch (bez ponownej serii) |
| B4 | „Powtórz” na zaliczonym Oddechu A | licznik 0/12 i odpowiedź o brzuch wyczyszczona |
| B5 | dni zaliczone przed tą wersją (dane z v4) | zostają zaliczone; brak odpowiedzi o brzuch nie cofa dnia ani streaka |
| B6 | otwieram Postępy | linia „Brzuch miękki (ostatnie 7 dni): tak X · częściowo Y · nie Z” liczona z dni z odpowiedzią |
| C1 | naciskam Start w Oddechu A | od razu dźwięk „wdech” (rosnący), cue „Wdech nosem”, 0:03 |
| C2 | kończy się wdech (3 s) | dźwięk „wydech” (opadający) w momencie startu fazy 7 s |
| C3 | kończy się wydech 1–11 | dźwięk „wdech” (rosnący) na początku przerwy na wdech |
| C4 | kończy się wydech 12 | tylko dźwięk końca serii (jak dziś `beep(true)`), bez dźwięku „wdech” |
| C5 | Pauza → Wznów | po Wznów dźwięk „wdech” (wznowienie zaczyna się od wdechu, jak w v4) |
| C6 | seria trwa | aktywny Wake Lock (`navigator.wakeLock.request('screen')`), zwolniony po Pauzie, końcu serii, zmianie ekranu; brak API albo odmowa → bez błędu w konsoli (cicho) |
| C7 | Miękki start, monolog, napięcie, Start na sygnał | dźwięki bez zmian |
| C8 | przed Startem Oddechu A | zegar pokazuje „Wdech nosem” i 0:03 (B24a) |
| C9 | faza wdechu przed słowem (powtórzenia 9–12) | duży napis = słowo, mały = „Wdech nosem” (B21b); w fazie „fff” jak dziś |
| D1 | dzień N ≥ 2, Start na sygnał | 10 pytań: kolejność języków PL, EN, PL, EN, PL, PL, EN, PL, EN, PL (jak v4) |
| D2 | sprawdzam pytania jednego dnia | żadne dwa nie mają tego samego tematu `t` (np. nigdy „Przedstaw się…” i „Can you introduce yourself?” razem) |
| D3 | sprawdzam dowolne 7 kolejnych dni (2–84) | żadne pytanie nie powtarza się |
| D4 | przeładowanie / powrót do dnia | ten sam zestaw i kolejność |
| D5 | wszystkie dni 2–84 | brak `undefined`, brak pustych pytań, brak wyjątków |
| E1 | karta Start na sygnał | treść jak w §5 (bez „ok. 1 s”, zdanie o imieniu, zdanie o trybie cichym) |
| X1 | cały dzień 3 i 10 przeklikany (wszystkie ćwiczenia) | dzień zaliczony, streak rośnie, 0 błędów konsoli; `run.js`, `round2.js`, `round3.js` zielone |

## 4. Dane i stan
- **Słowa i pytania nie są zapisywane w stanie.** Liczone deterministycznie z `dayIndex` i pul (jak `signalQuestions` w v4). Zmiana puli w przyszłości może zmienić słowa dni minionych – akceptowalne (stan trzyma tylko liczniki).
- **Algorytm (wspólny dla słów i pytań)** – okno przesuwne, deterministyczne:
  - Dla d = 2 … N (N ≤ 100, koszt pomijalny) wylicz dzień po dniu. Dla dnia d: kolejność kandydatów = pula przetasowana generatorem z ziarnem `d * 7919 + 13 + offset` (np. mulberry32; Fisher–Yates), offset inny dla każdej puli: PL 0, EN 1, słowa pula 1 – 2, pula 2 – 3.
  - Wybierz pierwszych kandydatów, którzy (1) nie wystąpili w dniach d−6 … d−1 i (2) nie łamią reguły tematu (pytania: `t` nieużyty w tym dniu; słowa: nie ma tematów).
  - Awaryjnie, gdy kandydatów brak: dopuść słowo/pytanie najdawniej użyte (najpierw łamie się okno 7 dni, nigdy reguła tematu). Przy pulach z §5 awaryjna ścieżka nie występuje w dniach 2–84 (symulacja okna A 11.11: 0 przypadków) – tester to sprawdza (A2, D3).
  - Pytania: osobno pula PL (6 na dzień) i EN (4 na dzień); temat `t` jest wspólny dla obu języków.
  - Słowa: dzień nieparzysty → 3 słowa z puli + „Aleksander” jako 4.; parzysty → 4 z puli. Od `A_HARD_FROM_WEEK`: słowa 1–2 z puli 2, reszta z puli 1 (okno 7 dni liczone osobno dla każdej puli).
  - Stała `A_HARD_FROM_WEEK = 3` w danych. Jeśli logopedka zgodzi się na k/g wcześniej – Alek zmienia na 1 (jedna liczba).
- **Brzuch:** nowe pole dnia `oddechBrzuch: 'tak' | 'częściowo' | 'nie' | null`.
  - `sanitizeDay`: inna wartość → `null`. Brak migracji; stare dni mają `null`.
  - Nowy stan pośredni: `reps.oddech === 12`, `oddechBrzuch === null`, „oddech” nie w `done` → karta pokazuje pytanie (B3).
  - `REPEAT.oddech`: zeruje też `oddechBrzuch`.
  - Zaliczenie: `markDone(k, 'oddech')` dopiero po odpowiedzi. Flaga `complete` z v4 (dni już zaliczone) bez zmian (B5).
  - Postępy: liczenie z ostatnich 7 dni kalendarzowych do dziś, tylko dni z odpowiedzią.
- **Dźwięki:** rozszerzyć `beep` albo dodać `tone(kind)`:
  - `wdech`: sinus 392 → 587 Hz liniowo w 0,4 s, głośność jak dziś (0,25), wibracja 80 ms;
  - `wydech`: sinus 587 → 392 Hz w 0,4 s, wibracja [60, 60, 60];
  - koniec serii: obecny `beep(true)`.
  - Timer: nowa opcja (np. `opts.breathTones: true`) włączona tylko w Oddechu A; w trybie gap: dźwięk `wdech` przy wejściu w gap (Start, Wznów, koniec wydechu 1–11), `wydech` przy przejściu gap → run. Bez `breathTones` – zachowanie v4 bez zmian (C7).
- **Wake Lock:** w Oddechu A przy Start/Wznów `request('screen')`, zwolnienie przy Pauzie, końcu, `killTimers`, `visibilitychange` ukryte; ponowne żądanie po powrocie, jeśli seria trwa. Wszystko w `try/catch`, bez komunikatu przy braku API (artefakt w iframe może nie dostać uprawnienia – wtedy zostaje zdanie z §5).
- Eksport (#15): nowe pole dnia idzie razem z dniem.

## 5. Treść (do wklejenia; źródła w nawiasach)

### Pula 1 – słowa od tygodnia 1 (samogłoska albo m, n, l, ł, r, w, j na początku)
Źródło: [[Program płynności]] A krok 3 (słowo na początku wydechu), B (słowa na samogłoskę blokują, bo krtań zamyka się przed głosem); słowa z życia Alka (sport, praca, Las Palmas, kuchnia) – akceptacja Alka.

okej, akurat, analiza, Azja, ale, auto, ekran, efekt, Ewa, idę, inaczej, impreza, inżynier, oczywiście, ocean, okno, obiad, umowa, uwaga, ulica, rano, rower, ramen, raport, miasto, morze, model, moment, narty, nowy, noc, Las Palmas, lato, woda, wakacje, wiatr, wtorek, jutro, jasne, jedzenie, łatwo, lekcja

(42 słowa; „Aleksander” osobno, wg A3. Imię zawsze w pełnej formie – program, „Imię i przedstawianie się”.)

### Pula 2 – słowa od `A_HARD_FROM_WEEK` (zwarte: k, g, t, d, p, b)
Źródło: [[Program płynności]] C (tydz. 3: lekki kontakt, powietrze przez głoskę, kolejność p, b, t, d, k, g); prośba Alka o g/k (10.11).

gdzie, góry, gotowe, godzina, Gran Canaria, kawa, kolega, klient, kod, koniec, kuchnia, kiedy, dobrze, dane, deska, dzięki, teraz, tydzień, temat, trening, praca, projekt, prezentacja, problem, pytanie, plan, budżet, bilet, biuro, bardzo

(30 słów.) Podpis pod słowem z puli 2 w fazie wydechu: „lekki kontakt, powietrze idzie przez głoskę” (program C kroki 1–2). Podpis pod słowem z puli 1: jak dziś („słowo na początku wydechu, potem dalej „fff””).

### Pytania PL (47) – format `[t] pytanie`
Źródło treści: pula v4 (20, zaakceptowana) + nowe do akceptacji Alka. Tematy `t` są wspólne z EN.

[imie] Jak masz na imię? · [imie] Przedstaw się – imię i czym się zajmujesz. · [imie] Jak się pisze twoje nazwisko? · [sniadanie] Co jadłeś dziś na śniadanie? · [gdzie] Gdzie teraz jesteś? · [weekend] Co robisz w ten weekend? · [kawa] Kawa czy herbata – i dlaczego? · [kawa] Gdzie pijesz najlepszą kawę? · [pogoda] Jaka jest dziś pogoda? · [wiek] Ile masz lat? · [skad] Skąd jesteś? · [sport] Jaki sport lubisz najbardziej? · [czytanie] Co teraz czytasz? · [godzina] Która jest godzina? · [wczoraj] Jak minął ci wczorajszy dzień? · [kuchnia] Polecisz mi jakieś danie azjatyckie? · [firma] Jak się nazywa twoja firma? · [wakacje] Gdzie byłeś na ostatnich wakacjach? · [narty] Narty czy deska? · [plan] Co dziś musisz jeszcze zrobić? · [film] Jaki film ostatnio widziałeś? · [dojazd] Jak dojeżdżasz do pracy? · [kolacja] Co dziś na kolację? · [sen] O której wczoraj poszedłeś spać? · [telefon] Do kogo ostatnio dzwoniłeś? · [muzyka] Czego ostatnio słuchasz? · [zakupy] Co ostatnio kupiłeś? · [fala] Kiedy ostatnio surfowałeś? · [projekt] Nad czym teraz pracujesz? · [spotkanie] Z kim masz dziś spotkanie? · [miasto] Co polecisz w Las Palmas? · [jutro] Co robisz jutro rano? · [zwierzeta] Psy czy koty? · [auto] Masz samochód? · [jezyki] Jakie znasz języki? · [urodziny] Kiedy masz urodziny? · [aplikacja] Jakiej aplikacji używasz najczęściej? · [gotowanie] Co ostatnio gotowałeś? · [polska] Za czym tęsknisz w Polsce? · [ocean] Woda dziś zimna? · [trening] Kiedy ostatnio trenowałeś? · [podroz] Dokąd chciałbyś pojechać? · [energia] Rano czy wieczorem – kiedy masz więcej energii? · [gory] Jaka jest twoja ulubiona góra? · [owoc] Jaki jest twój ulubiony owoc? · [godziny] Ile godzin dziennie pracujesz? · [humor] Co ostatnio cię rozśmieszyło?

### Pytania EN (32)
[imie] What's your name? · [imie] Can you introduce yourself? · [skad] Where are you from? · [skad] Where did you grow up? · [praca] What do you do for a living? · [weekend] How was your weekend? · [lunch] What did you have for lunch? · [wieczor] Any plans for tonight? · [projekt] What are you working on right now? · [kawa] Coffee or tea? · [mieszkanie] Where do you live? · [sport] What's your favourite sport? · [lpa] How long have you lived in Las Palmas? · [jezyki] How many languages do you speak? · [czytanie] What's the last book you read? · [film] What are you watching these days? · [dzien] How's your day going? · [plaza] What's the best beach on the island? · [gotowanie] What's your favourite thing to cook? · [hobby] What do you do after work? · [narty] Have you ever skied in the Alps? · [narzedzie] Which tool do you use the most at work? · [rano] What time did you get up today? · [pogoda] What's the weather like today? · [podroz] Where would you like to travel next? · [restauracja] Can you recommend a good restaurant here? · [auto] Do you drive? · [zakupy] What was the last thing you bought? · [fala] When did you last go surfing? · [telefon] Who did you last call? · [spotkanie] Do you have any meetings today? · [nauka] What are you learning right now?

### Instrukcje – zmiany (format „Co robisz / Jak to ma brzmieć / Czego nie robić / Dlaczego”)
**Oddech A**
- brief: [„Dłoń na brzuchu, wdech nosem 3 s, bez zatrzymania wydech.”, „8× „fff” po 7 s, potem 4× słowo dnia na początku wydechu. Dźwięk rosnący = wdech, opadający = wydech.”, „Bez zatrzymania na górze wdechu, nie spinaj brzucha.”]
- co: „Dłoń na brzuchu. Wdech nosem przez 3 s i bez zatrzymania wydech: 8 razy „fff” po 7 s, potem 4 razy słowo dnia na samym początku wydechu. Słowa dnia są nad przyciskiem Start i każdego dnia są inne. Dźwięk rosnący to wdech, opadający to wydech – możesz ćwiczyć z zamkniętymi oczami. Na koniec jedno dotknięcie: czy brzuch był miękki.”
- jak: bez zmian (v4) + na końcu: „Słowo na k, g, t, d, p, b: lekki kontakt – język albo wargi ledwo się dotykają, powietrze idzie przez głoskę.” (program C; zdanie widoczne tylko, gdy w danym dniu jest słowo z puli 2)
- nie: bez zmian (v4).
- dlaczego: bez zmian (v4) + „Pytanie o brzuch po serii uczy zauważać napięcie, zanim pojawi się w rozmowie.” (program: profil – identyfikacja napięcia jest kluczowa, bo ciało nie daje sygnału ostrzegawczego)
- notka pod timerem (zamiast obecnej): „Licznik rośnie sam. Dźwięk rosnący = wdech, opadający = wydech. Wyłącz tryb cichy w iPhonie, inaczej nie usłyszysz sygnałów.”
- pytanie po serii: etykieta „Brzuch był miękki?”, przyciski „tak” / „częściowo” / „nie”.

**Start na sygnał** (B26, B24c)
- co: v4 + „Pytania po polsku i po angielsku są o różnych rzeczach i nie powtarzają się przez tydzień.”
- jak: „Sygnał → spokojny wdech nosem → głos rusza razem z wydechem: „Aaaleksander, pracuję z danymi”. Pierwsze słowo jak w Oddechu A: lekko wydłużony, miękki początek, dalej normalne tempo.” (usunięte „(ok. 1 s)”)
- nie: v4 + „Przy pytaniu o imię wolno zrobić krótką pauzę i spokojny wdech – to nie odkładanie startu. Imię zawsze w pełnej formie.” (program, „Imię i przedstawianie się”)
- notka pod timerem: v4 + „Wyłącz tryb cichy, inaczej nie usłyszysz sygnału.”

## 6. Zasady i ryzyka
- Skala: brzuch to fakt tak/częściowo/nie – drugi wyjątek obok „oddech po frazach” (B35, `CLAUDE.md`). Żadnego SR za brzuch.
- Minimum kliknięć: +1 dotknięcie na dzień (brzuch); reszta bez nowych kliknięć.
- Treść medyczna: pula 2 dopiero od tygodnia 3 (lekki kontakt z C), chyba że logopedka pozwoli wcześniej (`A_HARD_FROM_WEEK`). Imię zawsze w pełnej formie.
- Prywatność: odpowiedzi o brzuch to liczniki w stanie, nic nie wychodzi z telefonu.
- Ryzyka techniczne:
  - iOS w trybie cichym wycisza Web Audio, a Safari nie ma wibracji – wtedy dźwięków nie ma (zdanie w notce).
  - Wake Lock w iframe artefaktu może być zablokowany przez politykę uprawnień – sprawdzić na telefonie Alka po publikacji; bez niego ekran może zgasnąć po czasie autoblokady (wtedy przy 2 min serii ustawić autoblokadę ≥ 2 min).
  - `setInterval` 200 ms → dźwięk do 200 ms po zmianie fazy; akceptowalne.
  - Determinizm: generator i ziarna bez `Math.random()`; tester porównuje dni 2–84 dwukrotnie.

## 7. Jak sprawdzone
(po wdrożeniu) harness + scenariusze A1–X1 (tester), recenzent kodu, wersja.
