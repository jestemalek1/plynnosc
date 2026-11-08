---
status: active
updated: 2026-11-08
tags: [operacje, okna, prompty]
---

# Prompty startowe dla dwóch okien

Nowa sesja Claude Code z wybranym repo `jestemalek1/plynnosc`, potem wklej odpowiedni prompt. Stan na 8.11: cała wiedza (gitflow, plan, HLD, decyzje) i niewydana v4 są na gałęzi `feature/dzien2-feedback`; `main` i `develop` = v3 (opublikowana).

## Okno 1 – HLD i kierunek produktu

```text
Pracujesz w repo jestemalek1/plynnosc (vault Obsidiana + apka). Najpierw: git fetch && git checkout feature/dzien2-feedback, potem przeczytaj CLAUDE.md, „00 Start/Start.md”, „wiki/produkt/HLD v1.md”, „wiki/produkt/HLD v1 – porównanie z planem.md”, „wiki/produkt/Plan działania.md”, „wiki/decyzje/Decyzje do podjęcia.md” i „wiki/program/Program płynności.md”.

Cel tej sesji: omówić ze mną niezgodności naszej apki z HLD v1 i podjąć decyzje B12–B17, tak żeby plan, kamienie milowe i backlog prowadziły do tego, do czego dążymy w HLD. Apka jest dogfoodowanym prototypem: ja ją używam codziennie do własnego treningu.

Zasady:
- NIE zmieniasz kodu (app/, test/). Zmieniasz tylko notatki .md w wiki/ i 00 Start/.
- Pracujesz na gałęzi feature/hld-decyzje utworzonej od feature/dzien2-feedback; commity po polsku, push, bez merge.
- Prowadź po jednej decyzji naraz: krótko kontekst (co mówi HLD, co mamy, czego brakuje), Twoja rekomendacja z uzasadnieniem, konsekwencje dla backlogu i terminów. Czekasz na moją odpowiedź, zanim przejdziesz dalej.
- Jeśli się z czymś nie zgadzasz albo coś w HLD jest niespójne lub ryzykowne (klinicznie, prawnie, technicznie), powiedz to wprost.
- Po każdej decyzji: wpis w „wiki/decyzje/Decision log.md”, odhaczenie w „Decyzje do podjęcia”, zmiany w „Plan działania” i „Backlog” (z przypisaniem do modułu HLD 01–08 i okna A/B).
- Na koniec: zaktualizowana roadmapa M0–M4, lista pozycji backlogu na najbliższe 2 tygodnie z kolejnością, oraz lista pytań otwartych na później (MVP rynkowe, RODO, wyroby medyczne, stack produktu).
- Bez overengineeringu: nie projektujemy teraz infrastruktury produktu, tylko kierunek i kolejność.
```

## Okno 2 – Testowanie apki i dogfooding

```text
Pracujesz w repo jestemalek1/plynnosc (vault Obsidiana + apka). Najpierw: git fetch && git checkout feature/dzien2-feedback, potem przeczytaj CLAUDE.md, „00 Start/Start.md”, „wiki/produkt/Plan działania.md” (sekcje o dwóch oknach i pętli dogfoodingu), „wiki/operacje/Testy.md”, „wiki/operacje/Git i gałęzie.md”, CHANGELOG.md i „wiki/research/Review kodu v3 – niezależny.md”.

Jesteś oknem A – Dogfood i testy. Codziennie trenuję w apce (live: https://claude.ai/artifact/EUANdz59Df6hkaxVUsHR5P, wersja v3; program ruszył 7.11.2026). Na gałęzi feature/dzien2-feedback czeka niewydana v4 (feedback z dnia 2), a na feature/testy-v4-wip jest przerwana, niezweryfikowana praca testera (zmienione test/run.js, test/round2.js i nowy test/round3.js).

Na razie TYLKO testujesz i zbierasz uwagi. NIE zmieniasz kodu apki (app/) bez mojego wyraźnego „poprawiaj”. Testy (test/) i notatki .md możesz zmieniać na gałęzi fix/testy-v4 od feature/dzien2-feedback.

Zadania:
1. v4: sprawdź w headless Chromium (Playwright, 390×844, file://, page.clock) wymagania z CHANGELOG v4: legenda SR widoczna przed wyborem przy każdej skali; Oddech A ma 3 s na wdech z odliczaniem i bez zatrzymania; SR tylko w dniu 7, 14… („SR tygodnia”), dzień 1 nadal „SR dnia”; „Start na sygnał” (losowe 2–6 s, sygnał, pytanie PL/EN, 8 s, 10 rund, pauza/od nowa, licznik w localStorage); stary stan bez pola v: dzień z done [oddech, monolog, dziennik] lub [..., sr] po wczytaniu jest zaliczony, a dzień z samym [oddech] nie; brak skoku na mapę w trakcie pisania dziennika; zero błędów konsoli w dniach 1, 2, 7, 8, 15, 22, 85. Wykorzystaj pracę z feature/testy-v4-wip, ale nie ufaj jej bez sprawdzenia.
2. Uruchom wszystkie harnessy, raportuj: tabela wymaganie → PASS/FAIL + dowód, lista realnych defektów z krokami odtworzenia, regresje względem v3.
3. Dogfooding: poproś mnie o uwagi z dzisiejszego treningu (co uwierało, co zbędne, co niejasne). Każdą uwagę zamień na pozycję w „wiki/produkt/Backlog.md” (okno A, typ fix/*, priorytet: przeszkadza w treningu / irytuje / pomysł) albo na pytanie do „Decyzje do podjęcia”, jeśli to decyzja produktowa.
4. Na koniec: rekomendacja, czy v4 nadaje się do wydania (tak/nie i dlaczego). Wydanie (merge do develop i main, tag, publikacja artefaktu wg „Git i gałęzie”) robisz tylko po moim wyraźnym „wydaj”.
Raporty krótko, po polsku, bez zgadywania: jeśli czegoś nie sprawdziłeś, napisz to.
```
