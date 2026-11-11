---
status: zaakceptowany (Alek, 10–11.11: „6 tak”, „wdróż wszystko, co zleciłem”)
id: "#21"
hld: 04
decyzja: B34
budżet: 1 runda (razem z #19 i #20)
updated: 2026-11-11
---

# #21 Ćwiczenie z gwiazdką: ★ monolog w drugim języku

## 1. Cel i moduł HLD
Pomysł Alka (10.11): jedno ćwiczenie dla chętnych, nieobowiązkowe do zaliczenia dnia. HLD 04 Realizacja. Źródło treści: [[Program płynności]], tydzień 1 – luźny monolog naprzemiennie po polsku i po angielsku; profil – długa wypowiedź po angielsku to warunek, który blokuje.

## 2. Zakres
- Wchodzi: karta „★ Monolog w drugim języku” w dniach, w których jest Luźny monolog (tygodnie 1–3, bez dnia 1); gwiazdka na wyspie mapy, gdy zrobione; licznik w Postępach.
- Poza zakresem: inne ćwiczenia z gwiazdką, wybór ćwiczenia, punkty/odznaki, tygodnie ≥ 4 (wrócimy przy T4–6).
- Budżet: część rundy #19–#21.

## 3. Zachowanie (kryteria akceptacji)
| # | Gdy … | Wtedy … |
| --- | --- | --- |
| G1 | dzień 2–21 | pod ćwiczeniami obowiązkowymi karta „★ Monolog w drugim języku” z podpisem „dla chętnych · nie wlicza się do dnia · 3 min”, domyślnie zwinięta; nie ma jej w pasku postępu ani w „Teraz: …” |
| G2 | dzisiejszy monolog jest PL (wybrany język w karcie monologu) | ★ jest po angielsku; i odwrotnie. Gdy Luźny monolog nie ma jeszcze ustalonego języka – przeciwny do domyślnego dnia |
| G3 | otwieram ★ | karta tematu (inny temat niż dzisiejszy monolog, „Inny temat” działa), timer „Start 2:00”, „Już mówiłem – przejdź do pytań”; po monologu „Oddech po frazach? tak / częściowo / nie” i „SR tego monologu” (SRPicker z legendą) – jak w Luźnym monologu |
| G4 | odpowiem na oba pytania | ★ zrobione: karta „Zrobione · EN · SR x”, krótka zachęta; zaliczenie dnia i streak bez zmian |
| G5 | wszystkie obowiązkowe zrobione, ★ nie | dzień zaliczony, streak rośnie jak dziś |
| G6 | ★ zrobione, obowiązkowe nie | dzień niezaliczony (★ nie liczy się) |
| G7 | ostatnie obowiązkowe ćwiczenie zaliczone, ★ niezrobione | zamiast automatycznego powrotu na mapę baner „Sesja zrobiona” ma dwa przyciski: „Na mapę” (główny, z animacją jak dziś) i „★ Jeszcze monolog EN/PL” (rozwija kartę ★ i przewija do niej). Gdy ★ już zrobione – automatyczny powrót jak w v4 (B25) |
| G8 | ★ zrobione | na mapie wyspa dnia ma małą gwiazdkę; w Postępach „★ zrobione: N dni” |
| G9 | przeładowanie w trakcie | stan ★ jak w monologu (temat, język, odpowiedzi zapisane; timer od 2:00) |
| G10 | „Powtórz” na zrobionej ★ | jak w Luźnym monologu (nowy temat, czyste odpowiedzi) |
| G11 | dzień 1, tygodnie ≥ 4 | brak karty ★ |

## 4. Dane i stan
- Nowe pole dnia `extra: { lang: 'pl'|'en'|null, topic: number|null, ran: bool, breath: 'tak'|'częściowo'|'nie'|null, sr: 0–8|null, done: bool }`; `sanitizeDay` jak dla `monolog` (clampSR, walidacja tematu, reszta → null/false).
- `extra` **nie** jest w `exercisesFor`, `done`, `isDayDone`, `allListedDone`, `streak`, `weekDoneCount`.
- Postępy: N = dni z `extra.done === true`.
- Eksport (#15): pole idzie razem z dniem.

## 5. Treść (do wklejenia)
- Tytuł: „★ Monolog w drugim języku”; podpis: „dla chętnych · nie wlicza się do dnia · 3 min”.
- brief: [„Drugi monolog, w drugim języku niż dzisiejszy, inny temat, 2 minuty.”, „Jak w Luźnym monologu: szybko, naturalnie, frazy 3–5 słów z oddechem po każdej.”, „Bloki się nie liczą – nie poprawiaj, nie zwalniaj.”]
- co / jak / nie: jak w Luźnym monologu (v4).
- dlaczego: „Program każe w tygodniu 1 mówić naprzemiennie po polsku i po angielsku. Długa, szybka wypowiedź po angielsku to dla Ciebie najtrudniejszy warunek – ta karta daje go więcej w dni, kiedy masz ochotę.”
- zachęty (ENC): „Gwiazdka zdobyta. Dodatkowe dwie minuty w drugim języku.”, „Dzień i tak był zaliczony – to był bonus.”, „Drugi język, drugi temat, ten sam oddech po frazach.”

## 6. Zasady i ryzyka
- Skale: SR monologu (nasilenie) i „oddech po frazach” (wyjątek B15) – bez nowych skal.
- Minimum kliknięć: jedno dotknięcie więcej przy wyjściu na mapę tylko w dni, gdy ★ niezrobione (G7) – świadomy koszt, żeby ★ nie znikała po 2 s.
- Ryzyko: B25 (auto-powrót) – zmiana tylko dla przypadku G7.

## 7. Jak sprawdzone
(po wdrożeniu)
