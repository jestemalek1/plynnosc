---
status: active
owner: Alek
updated: 2026-11-08
tags: [decyzje, otwarte]
---

# Decyzje do podjęcia

Każda pozycja ma rekomendację i kroki. Odhaczasz `[x]`, dopisujesz jedną linię „Decyzja: …” i agent przy następnej sesji przenosi to do [[Decision log]]. Jeśli nie odhaczysz, agent działa wg rekomendacji tam, gdzie napisano „domyślnie”.

## A. Techniczne — wybrane przeze mnie, możesz zawetować

- [ ] **A1. Stack: Opcja A „Vanilla+”** (bez frameworka, bez bundlera; podział na `index.html` + `styles.css` + `data.js` + `app.js`). Domyślnie: TAK.
  Dlaczego: każdą zmianę robi agent w jednym przebiegu; Opcja B to 5–8 rund i build przy każdej zmianie. Szczegóły: [[Szablony UI – research i werdykt]], [[Architektura aplikacji]].
  Veto ma sens tylko, jeśli w 6 miesięcy planujesz wyraźnie więcej niż 8 ekranów.
- [ ] **A2. Jedno repo = vault Obsidiana + kod.** Domyślnie: TAK. (W Intradero było osobno, bo dwie osoby i wiele repo. Tu jedna osoba, jedna apka.)
- [ ] **A3. Jakość = harness Playwright, bez CI/linterów/Spec Kitu.** Domyślnie: TAK. Wracamy, gdy coś zacznie się psuć między sesjami.
- [ ] **A4. Runtime v1 = artefakt claude.ai** (bo tylko tam działa ocena przez Claude bez własnego backendu). Domyślnie: TAK. GitHub Pages dopiero, gdyby „Oceń z Claude” przestało być potrzebne w stronie.
- [ ] **A5. Pierwszy krok w kodzie: wydzielić treść do `data.js`** (zachęty, instrukcje, tematy, tygodnie), potem Wake Lock i własne modale. Domyślnie: TAK. Powód: tygodnie 4–12 to zmiany w treści, nie w logice — agent ma dotykać jednego pliku bez ryzyka.

- [ ] **A6. Poprawki z niezależnej recenzji R1–R6 przed treścią tygodnia 4.** Domyślnie: TAK, w rundzie 2 podziału. Najważniejsze: R1 — dodanie ćwiczeń do tygodnia 4 cofnie zaliczone dni i streak, jeśli nie zmienimy `isDayDone`. Lista: [[Review kodu v3 – niezależny]].

## B. Biznesowe / produktowe — czekają na Ciebie

- [x] **B1. Repo na GitHubie.** Decyzja: zrobione – `jestemalek1/plynnosc` (prywatne), gałęzie `main`, `develop`, `feature/*`. Status 2026-11-08 (przed pushem): lokalnie gotowe (`main`, `develop`, gałąź `feature/dzien2-feedback`), czeka na puste repo na GitHubie. Zasady: [[Git i gałęzie]]. Rekomendacja: prywatne repo `jestemalek1/plynnosc`, push od razu. Powód: kopia poza sesją w chmurze, sesje Claude Code mogą startować z repo, historia zmian apki.
  Kroki: (1) github.com → New repository → `plynnosc`, Private, bez README. (2) W sesji Claude Code: „podłącz repo jestemalek1/plynnosc z prawem push i wypchnij `main`”. (3) Sprawdź, że `app/index.html` jest w repo. Alternatywa: zostawić zip z tej sesji jako kopię (słabsze).
- [ ] **B2. Specjalista — poniedziałek 10.11.** Rekomendacja: najpierw Fundacja FIKS (793 001 160, darmowa diagnoza, Camperdown online), Jankiewicz (509 812 667, 145 zł) jako plan B.
  Na rozmowę weź: [[Kontekst i profil]] (profil + dane bazowe), pytania: (a) czy program zintegrowany w [[Program płynności]] jest OK dla bloków „na start wymuszony z zewnątrz”, (b) kolejność tygodni 4–12 (D wydłużona mowa / E frazowanie / G dobrowolne jąkanie / H anulowanie-wyślizg), (c) co z leczeniem ADHD a jąkaniem, (d) jak często kontrola. Wynik → jedna linia tu, agent przenosi do [[Decision log]] i do treści tygodni.
- [ ] **B3. Treść tygodni 4–12 — przed czy po konsultacji?** Rekomendacja: agent przygotuje tygodnie 4–6 z [[Program płynności]] teraz (masz je zobaczyć przed 28.11), tygodnie 7–12 po konsultacji. Ty akceptujesz treść (czytasz instrukcje „Co robisz / Jak to ma brzmieć / Czego nie robić / Dlaczego”), nie kod.
- [ ] **B4. Transkrypcja po polsku.** Rekomendacja: aplikacja Whisper offline na iPhonie (Whisper Notes, jednorazowo kilka dolarów; Aiko droższa) — Dyktafon → Udostępnij → app → Kopiuj → wklej w „Oceń”. Plan B za 0 zł: Gemini (iOS) przyjmuje m4a, do 10 min/plik, 5 promptów dziennie, ale audio idzie do chmury Google. Plan C: dyktowanie po polsku prosto do Notatek (na żywo, bez pliku audio).
  Fakty: Apple Dyktafon nie transkrybuje polskiego (iOS 18/26), Claude app nie przyjmuje audio, a `sample` w artefakcie przyjmuje tylko tekst i obrazy — więc transkrypcja musi powstać poza apką. Źródła: [[Transkrypcja PL – research]].
  Kroki: zainstaluj jedną apkę, zrób jutro jeden monolog PL i sprawdź jakość; jeśli bełkot → Gemini.
- [ ] **B5. Kopia danych (eksport/import).** Rekomendacja: TAK, jako pierwsza nowa funkcja (1 runda). Dane są tylko w localStorage jednego telefonu — czyszczenie Safari albo zmiana telefonu = utrata dziennika i SR. Rozwiązanie: przycisk „Eksport” (plik JSON przez capability `downloads`, z potwierdzeniem) + „Import” (wklej JSON). Dodatkowo: eksport przed startem leków (baseline ADHD).
- [ ] **B6. Kolejność funkcji na najbliższe 3 tygodnie.** Rekomendacja: (1) B5 eksport, (2) A5 podział + A6 poprawki + Wake Lock, (3) tygodnie 4–6, (4) #12 „jedno pytanie” w Ocenie, (5) #13 English card, (6) tryb szybki 10 min. Zmień kolejność, jeśli chcesz.
- [ ] **B7. Tryb „szybki” 10 min.** Rekomendacja: odłożyć do końca tygodnia 3 — wtedy zobaczymy w Postępach, czy są dni opuszczone z braku czasu.
- [ ] **B8. #14 „psychoanaliza” z nagrań.** Rekomendacja: #12 (jedno pytanie dziennie, już zresearchowane) wchodzi pierwsze; #14 czeka, aż dostarczysz pliki designu z sesji „AI lab” (repo/eksport/plik). Bez tych plików agent nie adaptuje pipeline'u.
- [ ] **B9. Diagnostyka ADHD a baseline.** Rekomendacja: umów diagnostykę; przed ewentualnym lekiem zrób eksport danych (B5) i cztery nagrania bazowe jak w dniu 1. Lekarzowi powiedz o jąkaniu (dobór leku).

- [x] **B10. HLD.** Dostarczony 8.11, porównanie: [[HLD v1 – porównanie z planem]].
- [x] **B12. Czym jest ta apka: narzędziem dla Ciebie czy prototypem produktu z HLD?** Decyzja: narzędzie dla mnie, które przez dogfooding zmieniam w aplikację z HLD; mój trening to cel nadrzędny. Silnik (03), ocena AI (B19), wywiad (01) i 07 – później, po dopracowaniu funkcjonalności. W backlogu tylko to, co wynika z HLD. Pierwotna rekomendacja: Rekomendacja: prototyp dogfoodowany na sobie. Moduły HLD budujemy w wersji „dla jednej osoby” w obecnej apce (bez kont, backendu, panelu). Decyzję o produkcie rynkowym (stack, RODO, wyroby medyczne, MVP) podejmujemy po M2/M3 na podstawie własnych danych. Skutek: od teraz backlog jest przypisany do modułów 01–08.
- [ ] **B13. Generator planu v0: przejście tygodnia po kryterium, nie po dacie.** Stan po B12: silnik odłożony; do rozstrzygnięcia, co z kryterium do tego czasu. Pierwotna rekomendacja: TAK, w M2 razem z tygodniami 4–6. Tak mówi nasz własny program; dziś apka przesuwa tydzień z kalendarzem.
- [x] **B14. Zadanie w terenie w apce (moduł 05).** Decyzja: TAK, w M0 przed 14.11; karta nie blokuje zaliczenia dnia; szczeble z mojej hierarchii z dnia 1; #18 do M1. Pierwotnie: Rekomendacja: TAK, w M1. Jedno zadanie dziennie z programu + „zrobione / nie”. To jest transfer, którego brakowało w poprzedniej terapii.
- [x] **B15. Pomiar unikania i zamiany słów (moduł 06).** Decyzja: przełączniki „zamieniłem słowo” / „odpuściłem sytuację” w dzienniku, suma w SR tygodnia; bez SUDS i komfortu; SR 0–8 zostaje, poza nim tylko tak/nie albo licznik („Oddech po frazach: częściowo” zostaje). Pierwotnie: Rekomendacja: TAK, 2 pytania w karcie „SR tygodnia”, w M1.
- [ ] **B16. Raport dla logopedy (moduł 08 w wersji minimum).** Rekomendacja: TAK, w M1. Jedna strona do skopiowania przed konsultacją.
- [ ] **B17. #13 angielski i #12/#14 samorozwój są poza HLD.** Częściowo: #14 → HLD 07 jako „refleksja z nagrań” z zabezpieczeniami, poza MVP. Otwarte: #12, #13 (zasada B12: poza HLD = poza backlogiem). Pierwotnie: Rekomendacja: zostają jako Twoje dodatki (M3/M4), oznaczone „poza HLD”; nie wchodzą do zakresu produktu bez osobnej decyzji.
- [x] **B18. Utrzymanie i nawroty w HLD.** Decyzja: dopisać do HLD (03, 06, §4).
- [x] **B19. Ocena mowy przez AI z nagrania / rozmowy na żywo.** Decyzja: do HLD (01, 05, 06); realizacja później (B12).
- [x] **B20. Minimum bezpieczeństwa z §6.** Decyzja: zapisać w HLD z przypisaniem do modułów.
- [ ] **B11. Dwa okna.** Rekomendacja: TAK, okno A – Dogfood i okno B – Rozwój, ale dopiero po repo na GitHubie i podziale pliku (A5). Szczegóły: [[Plan działania]].

- [ ] **B21. Czytelność v4 przy SR i Oddechu A (z weryfikacji v4, 8.11).** Dwie drobne rzeczy, nie blokują wydania. (a) Na karcie „SR tygodnia” legenda jest jedna, pod drugą skalą: ok. 300 px pod pierwszym rzędem chipów i na telefonie dotyka paska zakładek. (b) W trakcie wdechu słowo widać tylko małym szarym napisem „następne: Aleksander”; duży napis to „Wdech nosem”. Rekomendacja: (a) zostawić, bo przewija się razem z kartą (zgodne z decyzją „jedna legenda na kartę”); (b) zmienić w `fix/` po wydaniu: słowo dużym napisem już w czasie wdechu, „Wdech nosem” małym. Zmiana tylko wizualna, bez zmiany treści ćwiczenia.
- [ ] **B22. Opuszczony dzień 7, 14, … = brak SR tygodnia.** SR jest tylko na karcie ostatniego dnia archipelagu. Jeśli ten dzień wypadnie, w tym tygodniu nie ma punktu SR, a dzień 8 o tym nie przypomina. Rekomendacja: na razie nic nie zmieniać; jeśli w tygodniach 1–3 zdarzy się choć raz, dodać „SR tygodnia” do pierwszego dnia następnego archipelagu, gdy poprzedni nie ma oceny.
- [ ] **B23. Po dniu 84 (od 30.01.2027) mapa nie ma wyspy „dziś”.** Dzień 85+ otwiera się bez błędu (v4), ale tylko przez wyspę 84 i strzałkę „›”. Rekomendacja: zdecydować razem z treścią tygodnia 12 / utrzymania (B18): albo karta „Dziś (dzień N)” nad mapą, albo osobny ekran utrzymania. Do tego czasu nic nie dodajemy; jest czas do stycznia.

## Zostało otwarte po sesji HLD (8.11)
B13 (kryterium przejścia tygodnia przy odłożonym silniku), B16 (raport dla logopedy w M1), B17 (#12 i #13: do HLD czy poza; poza HLD = poza backlogiem). Do tego czasu nie są realizowane. Pytania na później (MVP, RODO, wyroby medyczne, stack): [[Plan działania]].

## Zrobione w sesji 7.11 (do wiadomości)
- Harness testowy uruchomiony w repo: oba skrypty zielone (exit 0, brak błędów konsoli i wyjątków), 38 zrzutów.
- Opublikowana wersja apki = `app/index.html` (sprawdzone bajt w bajt). Nic nie republikowałem.
- Vault Obsidiana postawiony, dokumenty z handoffu rozłożone po `wiki/`, HANDOFF w archiwum.
