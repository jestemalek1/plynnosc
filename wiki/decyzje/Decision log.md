# Decision log

Format: data — decyzja. Krótko: co, dlaczego, kiedy wracamy. Otwarte sprawy są w [[Decyzje do podjęcia]].

## Aktywne decyzje

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
