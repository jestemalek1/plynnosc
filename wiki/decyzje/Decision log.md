# Decision log

Format: data — decyzja. Krótko: co, dlaczego, kiedy wracamy. Otwarte sprawy są w [[Decyzje do podjęcia]].

## Aktywne decyzje

### 2026-11-11 — C2, C10: plan wdrożenia architektury i spec strażnika zaakceptowane (Alek)
- **C2: TAK.** Kolejność etapów E0–E5 z [[Architektura aplikacji]]: do 13.11 tylko B14; do 15.11 podział pliku (E1) ze skryptem i workflow; w M1 pakiet bezpieczeństwa (E2, powstaje `store.js`) i migracja v3 z B15 (E3); `domain.js` (E4), gdy M1 ma zapas, inaczej po treści tygodni 4–6. Trening ma pierwszeństwo: przesuwa się etap, nie B14 ani treść.
- **C10: TAK.** [[A7 Strażnik architektury]] zaakceptowany; przy wdrożeniu dwie zmiany w `CLAUDE.md` (wyjątek od „bez CI” dla strażnika, `node test/arch.js` w bramce).
- **Korekta po przeglądzie dokumentów (11.11, do wiadomości Alka):** Wake Lock w pozostałych timerach nie wchodzi do pakietu bezpieczeństwa, zostaje małą pozycją WL (mechanizm jest już w v5); E3 idzie po B15 i B16, bo B15 nie potrzebuje zmiany stanu; gdy w M1 brakuje czasu, kolejność to E2 → B15 → B16 → E3 i tniemy od końca. Z tabeli zmian stanu wypadły `updatedAt` i `promptVersion` (nikt ich nie czyta).
- Test Wake Lock na osobnym artefakcie (C4) niepotrzebny po v5: Alek sprawdza w zwykłym Oddechu A, czy ekran nie gaśnie.

### 2026-11-11 — C9: strażnik architektury i podstawa „małe jest piękne” (Alek)
- **Podstawa architektury:** najmniejsza ilość pracy i kodu, która daje daną funkcję; treść przed formą. Nic „na zapas”: plik, warstwa, abstrakcja, pole stanu albo zależność muszą mieć użytkownika w tym samym PR. Pilnujemy od pierwszego PR, żeby nie budować długu technologicznego. Zapis: [[Zasady architektury]] (Z0) i [[Architektura aplikacji]].
- **Przegląd PR pod kątem architektury** (testy i działanie funkcji osobno): recenzent z innego modelu – Codex przez integrację z GitHubem, sterowany `AGENTS.md`, bez tokenu w repo – oraz skrypt `test/arch.js` w GitHub Actions dla reguł mechanicznych. To świadomy wyjątek od A3 „bez CI”: tylko architektura, bez Playwright, linterów i blokady scalania.
- Alek akceptuje, że Codex dostaje dostęp do całego prywatnego repo.
- Konsekwencja dla C1: osobny `ai.js` nie powstaje, dopóki model woła jedno miejsce; `store.js` powstaje w pakiecie bezpieczeństwa (M1). Plan etapami E0–E5: [[Architektura aplikacji]].
- Spec: [[A7 Strażnik architektury]] (zaakceptowany tego samego dnia – C10). Wracamy, jeśli przegląd generuje szum albo propozycje rozbudowy.

### 2026-11-11 — C1, C3: HLD PoC przyjęty; prompt „Oceń” zostaje jako wyjątek prywatny (Alek)
- **C1: TAK.** Architektura PoC wg [[HLD PoC – kworum 2026-11-11]]: `data.js` / `domain.js` / `store.js` / `ai.js` / `app.js`, bez `map.js`; stan v3 tylko przez dopisywanie pól. Zastępuje „Plan podziału” w [[Architektura aplikacji]]. Kolejność i terminy czekają na C2.
- **C3: NIE zmieniamy promptu ani ekranu „Oceń”.** Apka jest na razie narzędziem prywatnym Alka, więc sekcja „Treść i samorozwój” (co mówca ujawnia o sobie, słaby punkt, pytanie do przemyślenia) zostaje, a ekran nie dostaje etykiety „informacja zwrotna, nie ocena kliniczna”. To świadomy wyjątek od B20/B32 i od zasady „nie etykietujemy” – wyłącznie dla Alka.
- **Warunek bez wyjątków:** prompt i ekran „Oceń” w tej postaci **nigdy nie trafiają do wersji dla innych użytkowników**. Wersja produktowa powstaje od nowa wg minimum bezpieczeństwa z [[HLD v1]] §6. Wracamy przy pierwszym użytkowniku innym niż Alek (wyzwalacz z P16).

### 2026-11-11 — Wydanie v5: #19, #20, #21 (Alek: „wdróż wszystko, co zleciłem, od jutra poprawiona wersja”)
Zakres: specy [[19 Oddech A i Start na sygnał – zmienność i dźwięki]], [[20 Dziennik bloków z sensem]], [[21 Ćwiczenie z gwiazdką]]. Pętla: budowniczy → niezależny tester (wszystkie kryteria PASS, 4 drobne defekty) + recenzent (0 krytycznych, 1 istotne: wznawianie dźwięku na iOS) → runda poprawek 11 punktów → harness zielony (run, round2, round3 z nowymi R8–R13). Odstępstwa przyjęte: dziennik dnia 1 tylko do odczytu, karta „Start na sygnał” wyższa o ok. 31 px (pytania do 3 linii), węższe przyciski tak/częściowo/nie poniżej 390 px; po dzienniku zakończonym „tak” bez notatki baner z „Na mapę” zamiast auto-powrotu; nowa zachęta dziennika „Zapisane. Po dwóch tygodniach te liczby pokażą wzór.” (Alek: tak). Do sprawdzenia na iPhonie: dźwięk w trybie cichym (`audioSession`), Wake Lock w iframe artefaktu.

### 2026-11-11 — B34, B35, B36 i uwagi z dni 3–5 (Alek)
- **B34 (HLD 02, 03): technika stała przez tydzień, treść zmienna codziennie.** Słowa, pytania i tematy zmieniają się każdego dnia; technika i zestaw ćwiczeń tygodnia zostają (program: jedna nowa technika na tydzień, też ze względu na ADHD). Szersza zmienność (wybór ćwiczeń) dopiero w generatorze 03 po przeglądzie M3. Powód: nuda bez rozmywania treningu; dla innych użytkowników zmienność treści jest warunkiem powrotu.
- **B35 (HLD 06): „Brzuch był miękki? tak / częściowo / nie” po serii Oddechu A** – drugi wyjątek od zasady jednej skali (obok „oddech po frazach”), bo przy napięciu „częściowo” jest najczęstszą prawdziwą odpowiedzią. Odpowiedź zalicza ćwiczenie; w Postępach licznik z 7 dni. Wpisane do `CLAUDE.md`.
- **B36 (HLD 04): dźwięk na początku wdechu i wydechu w Oddechu A** (rosnący / opadający), żeby ćwiczyć z zamkniętymi oczami; z Wake Lockiem. Zastępuje rekomendację B24(b) „zostawić”.
- Słowa: codziennie inne z puli, „Aleksander” co drugi dzień; słowa na k/g/t/d/p/b od tygodnia 3 (lekki kontakt z C), wcześniej tylko jeśli logopedka pozwoli (jedna stała). Pytania „Start na sygnał”: PL i EN o różnych tematach w jednym dniu, bez powtórki przez 7 dni (rozstrzygnięte przez okno A na prośbę Alka: przygotowana odpowiedź osłabia trening startu wymuszonego z zewnątrz).
- Dziennik bloków (#20) i ćwiczenie z gwiazdką (#21, ★ monolog w drugim języku) – TAK, okno B.
- Realizacja: spec [[19 Oddech A i Start na sygnał – zmienność i dźwięki]] (zawiera też B21(b), B24(a)(c), B26), [[Backlog]] #19–#21.

### 2026-11-09 — B33: user friendly first (Alek)
Apka (i produkt z HLD) ma być miła i przyjemna w użyciu. Uwagi z dogfoodingu oznaczone „irytuje” też naprawiamy, nie odkładamy na „kiedyś”; kolejność: najpierw „przeszkadza w treningu”, potem „irytuje”. Zasada wpisana do `CLAUDE.md`. Powód: przy 12 tygodniach codziennego treningu drobne irytacje decydują, czy się wraca; dla przyszłych użytkowników tym bardziej.

### 2026-11-08 — B31, B32: nowe moduły HLD 09 „Trening języka obcego” i 10 „Refleksja i wzorce” (Alek)
- **09:** po wypowiedzi karta z najwyżej 5 poprawkami i frazami, użytkownik sam wypowiada poprawki, bank fraz z własnych potknięć. Granice: poprawki tylko po wypowiedzi, niepłynność nie jest błędem językowym, tempo nie jest celem. Pierwsza wersja dla Alka: #13 (M3).
- **10:** wzorce widziane w słowach użytkownika, z datami i cytatami, potwierdzane przez niego i zamieniane w plany „jeśli X, to Y”. Bez etykiet schematów, diagnoz i interpretacji źródeł; pomoc kryzysowa; przeznaczenie wellbeing, bez „terapii” i „psychoanalizy” w nazwie. #12 to pierwsza wersja (M3), #14 przechodzi z 07 do 10.
Uzasadnienie i źródła: [[Język obcy i refleksja – research]]. Numeracja: okno B użyło B21–B28 w weryfikacji v4, więc decyzje tej sesji mają numery B29–B32 (wcześniej robocze B21–B24).

### 2026-11-08 — B13, B16, B17 (Alek)
- **B13 (HLD 03), wersja bez silnika:** w karcie „SR tygodnia” (dzień 7, 14, …) jedno pytanie tak/nie: „Kryterium tygodnia spełnione?”, pod nim treść kryterium z [[Program płynności]]. Tydzień dalej przesuwa się z kalendarzem. Dwa razy „nie” z rzędu = sygnał dla logopedki w raporcie B16. Świadomie akceptujemy, że do czasu silnika (po M3) apka może przepuścić dalej bez kryterium. Rozmiar M, M2; ta sama karta co B15, więc może iść w tej samej rundzie.
- **B16 (HLD 08):** TAK, M1, rozmiar M, po B14 i B15. Jedna strona tekstu do skopiowania: baza, SR tygodni, kryteria (B13), zadania w terenie (B14), zamiana słów i odpuszczone sytuacje (B15).
- **B17:** #13 angielski wchodzi do HLD jako komunikacja w języku obcym, #12 „jedno pytanie” jako część refleksji z nagrań z zabezpieczeniami #14. Poza MVP; dla Alka M3. Docelowe miejsce w HLD (nowe moduły 09 i 10) – propozycja B31 i B32 ([[Język obcy i refleksja – research]]).

### 2026-11-08 — B29, B30: lekki spec funkcji zamiast LLD modułów; pierwszy spec B14 (Alek)
Decyzja B29: HLD zostaje katalogiem modułów. LLD modułu rośnie od dołu jako suma specyfikacji jego funkcji. Dla pozycji rozmiaru L (logika dnia/tygodnia, stan, timer, mapa, ocena) piszemy przed kodem jeden plik `wiki/specs/<ID>.md` wg [[Jak pisać spec]], a Alek go akceptuje. Tester dostaje scenariusze, recenzent dane i ryzyka. Backlog ma kolumny Rozmiar (S/M/L) i Spec. W [[Plan działania]] jest mapa „pętla HLD × kamienie”. Ślad bez macierzy: to samo ID w backlogu, specyfikacji, gałęzi i CHANGELOG. Bez Spec Kitu i Kiro (zgodnie z CLAUDE.md). Research: [[Planowanie pracy – research]]. Wracamy, gdy pojawi się drugi deweloper, produkt albo klasyfikacja jako wyrób medyczny.
Decyzja B30: pierwszy spec to [[B14 Zadanie w terenie]], zaakceptowany 8.11 z treścią tygodni 2–3. Przy imieniu w tygodniu 3 miękki start zgodnie z tabelą progresji; pytanie o preparatory set na konsultację. Daily jako szczebel 2. Potem B15, potem T4–6.
Do zrobienia poza vaultem: w `CLAUDE.md` wskazać `wiki/specs/` w kroku 2 workflow.

### 2026-11-08 — B15: zamiana słów i odpuszczone sytuacje jako fakty w dzienniku; zasada jednej skali doprecyzowana (Alek)
Decyzja (HLD 06): w dzienniku bloków dwa przełączniki jednym dotknięciem: „zamieniłem słowo” i „odpuściłem sytuację”. Karta „SR tygodnia” pokazuje sumę z 7 dni. Bez pytań z pamięci o cały tydzień, bez SUDS i skali komfortu. OASES – z logopedką.
**Zasada pomiaru:** jedna skala SR 0–8 tylko dla nasilenia jąkania i poziomu techniki; wszystko inne to fakt tak/nie albo licznik liczony przez apkę. Wyjątek: „Oddech po frazach: tak / częściowo / nie” zostaje.
Rozważone i odrzucone: wszystko w skali 0–5 z przeliczeniami. Powody: progi programu leżą na dole 0–8 (cel SR 0–1, powrót przy ≥2, tydz. 10 „najgorsze ≤ 2”) i w 0–5 znikają; przeliczenie jest jednokierunkowe; logopeda (Camperdown, FIKS) pracuje w 0–8; dane bazowe są w 0–8. Mniej wyborów daje rezygnacja z dodatkowych skal, nie zmiana skali.
Termin: M1, okno B, w rundzie z R3–R7. Do wdrożenia zamiany zapisywane w notatce dnia. Do zrobienia poza vaultem: doprecyzować w `CLAUDE.md` brzmienie zasady „jedna skala”.

### 2026-11-08 — B14: zadanie w terenie w apce od tygodnia 2, w M0 (Alek)
Decyzja (HLD 05): na ekranie Dziś od tygodnia 2 jedna karta „Zadanie w terenie” z tabeli progresji [[Program płynności]] (szczebel + technika, format „Co robisz / Jak to ma brzmieć / Czego nie robić / Dlaczego”). Dwa przyciski: „Użyłem techniki” / „Dziś nie”, bez skali – cel to użycie techniki, nie płynność.
- Karta **nie blokuje zaliczenia dnia**: zadanie dzieje się zwykle poza sesją; inaczej psułby się streak (błąd tej samej klasy co R1).
- Źródłem szczebli jest **hierarchia Alka z dnia 1** (lista w apce), nie przykładowa lista z programu; dopisek w programie.
- Licznik „użyłem / 7” zasila 06 (uczestnictwo), 08 (raport), później 03 (kryterium szczebla).
Termin: przed 14.11 (start tygodnia 2), w M0. W zamian #18 „Uwaga do apki” przechodzi do M1 (B12: trening wygrywa). Treść kart tygodni 2–3 do akceptacji Alka przed wdrożeniem. Pełna pętla budowniczy → tester → recenzent (logika dnia).

### 2026-11-08 — B12: apka to narzędzie Alka, które przez dogfooding staje się aplikacją z HLD (Alek)
Decyzja: apka jest przede wszystkim narzędziem do własnego treningu Alka. Przez dogfooding ma stać się aplikacją z [[HLD v1]]. **Cel nadrzędny to trening Alka:** gdy funkcja „pod produkt” konkuruje z potrzebami treningu, wygrywa trening.
Kolejność: najpierw dopracowujemy funkcjonalność w codziennym użyciu (04, 05, 06 jako samoocena, 08 jako raport, 02 jako dane). **Później**, po dopracowaniu: silnik planu (03), ocena mowy przez AI (B19), wywiad w apce (01) i 07.
Zasada backlogu: w [[Backlog]] jest tylko to, co wynika z HLD albo bezpośrednio mu służy (fundament z przypisanym modułem). Pomysł spoza HLD najpierw trafia do HLD.
Zapis: HLD §7. Prototyp n=1 nie dowodzi skuteczności klinicznej ani popytu.

### 2026-11-08 — B18: utrzymanie i zapobieganie nawrotom w HLD (Alek)
Decyzja: dopisane do HLD 03 (faza utrzymania z przeglądami wg Camperdown; niezaliczony przegląd cofa plan), 06 (sygnały nawrotu) i §4 (pętla utrzymania). Bez nowego modułu, bo to ta sama odpowiedzialność co plan i pomiar, tylko rozciągnięta w czasie. Powód: nawroty 20–70% po samym kształtowaniu płynności ([[Program płynności]]).

### 2026-11-08 — B19: ocena mowy przez AI z nagrania i rozmowy na żywo w HLD (Alek)
Decyzja: Alek chce nagrywać się albo rozmawiać na żywo i dostawać ocenę od AI. Dopisane do HLD 06 (ocena), 05 (rozmowa z AI głosem) i 01 (próbka mowy). Analiza nagrań wychodzi z odłożonego „korektora” (§5); korektor = tylko czas rzeczywisty.
Zabezpieczenia: AI ocenia dźwięk, nie tylko transkrypt (transkrypt nie widzi cichych bloków); podstawowym pomiarem zostaje samoocena SR 0–8; ocena AI wpływa na plan dopiero po kilku tygodniach zgodności z samooceną.
Termin: później, po dopracowaniu funkcjonalności (B12). Do sprawdzenia przy realizacji: mikrofon w artefakcie i model z wejściem audio (dziś `sample` przyjmuje tekst i obrazy). Do tego czasu zostaje „Oceń” na transkrypcie.

### 2026-11-08 — B20: minimum bezpieczeństwa zapisane w HLD (Alek)
Decyzja: tabela w HLD §6 przypisuje zasady do modułów: nagły początek → pilna ocena medyczna (01), brak diagnoz i etykiet emocji, ocena AI = informacja zwrotna (05, 06), pomoc kryzysowa (07), zgody i retencja nagrań (01, 05, 06, 08), weryfikacja kliniczna i regulacyjna przed udostępnieniem innym. Dla n=1 nic nie zmienia w apce.

### 2026-11-08 — B17 (część): #14 jako „refleksja z nagrań” w HLD 07, bez ryzyka i poza MVP (Alek)
Decyzja: funkcja wchodzi do HLD 07, ale tak zaprojektowana, żeby ryzyka nie było: tylko słowa użytkownika i jedno pytanie, bez wnioskowania o przyczynach i „podłożu”, bez diagnoz i nazywania emocji, wnioski formułuje użytkownik, przy treściach kryzysowych informacja o pomocy. Nie wchodzi do MVP. Interpretacja źródeł zachowań zostaje dla psychoterapeuty. Pozostała część B17 (#12, #13) otwarta.

### 2026-11-08 — Poprawki w notatkach porównania
(1) Zadanie w terenie z tygodnia 1 to luźny monolog, który apka ma; prawdziwe zadania w terenie startują w tygodniu 2 (14.11). (2) Raport dla logopedy (B16) nie zdąży na konsultację 10.11; na nią idzie ręcznie [[Kontekst i profil]]. (3) B1 (repo na GitHubie) zrobione.

### 2026-11-09 — Bramka harnessu i weryfikacja v4
Decyzja: „zielone” = `node test/run.js && node test/round2.js && node test/round3.js` z exit 0, przy czym `run.js`/`round2.js` kończą się exit 1 przy każdym błędzie konsoli (także z kontekstu, który go nie zalogował) albo `*.EXCEPTION`, a `round3.js` przy każdym werdykcie FAIL. Powód: w v4 runda z błędem dnia 85 wyglądała na zieloną, bo błędy siedziały w zagnieżdżonym kluczu, a round3 kończył się exit 0 mimo FAIL. v4 przeszła 8 rund niezależnego testera i recenzenta; każdy poprawiony defekt ma test w `round3.js`, który pada na kodzie sprzed poprawki. Reguła powrotu na mapę po zaliczeniu dnia czeka na weto (B25). Szczegóły: [[Testy]].

### 2026-11-08 — v4 po feedbacku z dnia 2 (Alek)
Feedback: oddech za szybki (potrzebna chwila między wdechem a wydechem), brak opisu skali przy ocenie SR, „SR dnia” bez sensu na tym etapie, za mało ćwiczeń.
Decyzje:
- **Wdech 3 s z odliczaniem, bez zatrzymania na górze.** Timer dawał 2 s, a instrukcja mówiła 2–3 s, więc to był błąd. Pauzy na górze wdechu nie dodajemy: wstrzymane powietrze plus docisk to mechanizm bloku ([[Program płynności]], reguła 1). Czas na myśl jest w trakcie wdechu, bo słowo widać już wtedy.
- **Legenda SR zawsze widoczna** pod każdą skalą (jedna na kartę).
- **SR raz w tygodniu** (dzień 7, 14, …: „SR tygodnia”, typowe i najgorsze z 7 dni) zamiast codziennie. Zgodne z [[02 Protokoły ćwiczeń – raport agenta]] §3 „Pomiar (tygodniowo)” i tygodniowym trackerem w programie. Codzienną mowę opisuje dziennik. Wracamy w tygodniu 9 (kryterium „typowe dzienne SR ≈ 1”).
- **Nowe ćwiczenie „Start na sygnał”** w tygodniach 1–3: losowe 2–6 s czekania, sygnał i krótkie pytanie (PL/EN), odpowiedź na wydechu, 10 rund. Źródło: zalecenie treningu startu „na sygnał” w [[Program płynności]] (profil: bloki przy starcie wyznaczonym z zewnątrz).
- **Zaliczony dzień zostaje zaliczony** (flaga `complete`, migracja v1→v2). Poprawka R1 i R2 z [[Review kodu v3 – niezależny]].
Dawka: realny czas mówienia w tygodniu 1 rośnie z ok. 4 do ok. 6–7 min. To nadal poniżej 10–15 min z programu; pełna dawka przychodzi z blokiem głównym (cykle Camperdown) od tygodnia 4–5.

### 2026-11-07 — Jedno repo = vault Obsidian + kod
Decyzja: `plynnosc` jest jednocześnie vaultem Obsidiana (`.obsidian/`, `00 Start/`, `wiki/`, `templates/`) i repo kodu (`app/`, `test/`). W `intradero-knowledge` wiedza i kod były osobno — tu projekt jest jednoosobowy i ma jedną apkę, więc dwa repo to koszt bez zysku.
Konsekwencje: Obsidian pokazuje tylko `.md` (pliki `.html`/`.js` ukryte). Wracamy, gdy pojawi się drugi produkt albo drugi współpracownik.

### 2026-11-07 — Stack: Opcja A „Vanilla+” (domyślna, do potwierdzenia)
Decyzja: bez frameworka i bez bundlera. Port idei (wężykowa ścieżka, streak) z react-duolingo, własne modale/toasty, podział na 3–4 pliki statyczne. Uzasadnienie: każdą zmianę robi agent LLM — jeden przebieg „czytaj → edytuj → test headless”; Opcja B (Vite+Preact) to 5–8 rund i build przy każdej zmianie. Szczegóły: [[Szablony UI – research i werdykt]].
Status: przyjęta jako domyślna; Alek może zawetować w [[Decyzje do podjęcia]].

### 2026-11-07 — Harness testowy jest jedyną bramką jakości
Decyzja: `node test/run.js && node test/round2.js` (Playwright, headless Chromium, 390×844, `file://`) musi być zielone przed publikacją. Ścieżki w harnessie względne do repo. Bez CI, bez Spec Kit, bez linterów na start — proces ma być tak mały, jak się da.
Wracamy, gdy pojawi się drugi deweloper albo zmiany zaczną się psuć między sesjami.

### 2026-11-07 — Publikacja: artefakt claude.ai pozostaje runtime'em v1
Decyzja: aplikacja żyje pod https://claude.ai/artifact/EUANdz59Df6hkaxVUsHR5P, bo tylko tam działa `claude.use("sample")` (ocena nagrań przez Claude bez własnego backendu i klucza API). Repo jest źródłem prawdy; artefakt = kopia `app/index.html`.
Wracamy, gdy ocena przez Claude przestanie być potrzebna w stronie albo pojawi się potrzeba instalacji PWA / pracy offline.

### 2026-11-07 — Terapia: program zintegrowany
Modyfikacja jąkania + miękki start / lekki kontakt / wydłużona mowa + praca z antycypacją, online, z transferem i utrzymaniem. Po wywiadzie: CBT na lęk mniej istotne; priorytet oddech/tempo/frazowanie/start „na sygnał” w warunkach, które blokują. Źródło: [[Program płynności]].

### 2026-11-07 — Jedna skala: SR 0–8
Tylko SR 0–8 (Camperdown) w całej aplikacji. Hierarchia 0–10 przeliczona ×0.8.

### 2026-11-07 — Architektura v2/v3: jedna aplikacja zamiast strony na dzień
Stan w localStorage pod kluczem `plynnosc`, 4 ekrany (Dziś / Oceń / Postępy / Ściągawka), komponenty `SRPicker`, `Timer`, `TopicCard`. Dzień 1 zaimportowany z `dzien-01.html` (archiwum).

## Archiwum decyzji
- (pusto)
