---
status: zaakceptowany (Alek, 11.11 – „wdróż wszystko, co zleciłem”)
id: "#20"
hld: 06
decyzja: B15 (zasada pomiaru), B33
budżet: 1 runda (razem z #19 i #21)
updated: 2026-11-11
---

# #20 Dziennik bloków z sensem

## 1. Cel i moduł HLD
Uwaga z dnia 3 („irytuje”): „nie czuję, co wypełniam i co mi to da”. Dziennik v4 to wolne zdanie, a jego sens (wzór po 14 dniach) nigdzie się nie pokazuje. HLD 06 Monitorowanie. Źródło treści: [[Program płynności]] – „2 tygodnie dziennika bloków (co robiłem, kto decydował o momencie startu, język, tempo)”.

## 2. Zakres
- Wchodzi: wpis z dotknięć zamiast zdania, odpowiedź „dziś bez wyraźnego bloku”, notatka opcjonalna, liczniki od razu po wpisie i w Postępach, nowa treść instrukcji.
- Poza zakresem: przełączniki B15 („zamieniłem słowo”, „odpuściłem sytuację”) – osobna runda okna B; zostawić w karcie miejsce pod nimi. Kilka wpisów na dzień. Interpretacja wzoru przez apkę albo AI.
- Budżet: część rundy #19–#21.

## 3. Zachowanie (kryteria akceptacji)
| # | Gdy … | Wtedy … |
| --- | --- | --- |
| J1 | otwieram Dziennik bloków (dzień ≥ 2) | pytanie „Dziś był wyraźny blok?” i dwa przyciski: „tak” / „nie” |
| J2 | dotknę „nie” | dziennik zaliczony (jedno dotknięcie); nagłówek „Zrobione · dziś bez wyraźnego bloku” |
| J3 | dotknę „tak” | pojawiają się trzy grupy wyboru (po jednym): Start: „ja” / „ktoś” · Język: „PL” / „EN” · Tempo: „wolno” / „szybko” oraz pole „Co robiłeś? (opcjonalnie)” |
| J4 | wybiorę po jednym w każdej z trzech grup | dziennik zaliczony (bez pisania); nagłówek „Zrobione · start: ktoś · PL · szybko” |
| J5 | wpiszę notatkę | zapis jak dziś (bez klikania „zapisz”), nie jest wymagana |
| J6 | dziennik zaliczony | pod kartą liczniki z ostatnich 14 dni z wpisem: „Wpisy: N · z blokiem: B · start ktoś: x/B · szybko: y/B · EN: z/B” (same liczby, bez komentarza) |
| J7 | zmienię wybór po zaliczeniu | zapis i liczniki odświeżają się w miejscu; ekran nie skacze (jak dziś przy edycji dziennika) |
| J8 | dni sprzed tej wersji z samym tekstem (v3/v4) | zostają zaliczone; do liczników liczone jako „z blokiem”, a start/język/tempo odczytane z tekstu, jeśli zawiera „start: ja”, „start: ktoś”, „PL”, „EN”, „wolno”, „szybko” (fragmenty wklejane chipami v4); bez rozpoznania – nie liczą się do x/y/z |
| J9 | Postępy | karta „Dziennik bloków (14 dni)” z tą samą linią liczników |
| J10 | dzień 1 (baza) | bez zmian (tekst z importu, tylko do odczytu jak dziś) |
| J11 | „Edytuj” na zaliczonym dzienniku | karta otwiera się z zapisanymi wyborami |

## 4. Dane i stan
- Nowe pole dnia `blok: { jest: true|false|null, start: 'ja'|'ktoś'|null, jezyk: 'PL'|'EN'|null, tempo: 'wolno'|'szybko'|null }`; `sanitizeDay` – inne wartości → `null`, brak pola → wszystkie `null`.
- `diary` (string) zostaje jako notatka opcjonalna; stary tekst v3/v4 widoczny w polu notatki.
- Zaliczenie: `jest === false` albo (`jest === true` i start, jezyk, tempo ≠ null). Stare dni z „dziennik” w `done` zostają zaliczone. Flaga `complete` z v4 bez zmian.
- Zmiana „tak” → „nie” po zaliczeniu: zostaje zaliczony; „nie” → „tak” bez trzech wyborów: dziennik odznaczony (jak `unmark`), dopóki wybory nie są kompletne – ale **dzień raz zaliczony zostaje zaliczony** (flaga `complete`, v4).
- Liczniki liczone z `state.days` w oknie 14 dni kalendarzowych do dziś (bez dnia 1), nic nie zapisują.

## 5. Treść (do wklejenia)
- brief: [„Był dziś wyraźny blok? Jeśli tak – trzy dotknięcia: kto zaczął, język, tempo.”, „Same fakty: start ja / ktoś · PL / EN · wolno / szybko.”, „Bez interpretacji i bez emocji.”]
- co: „Jedno pytanie: był dziś wyraźny blok? Jeśli nie – dotykasz „nie” i gotowe. Jeśli tak – zaznaczasz, kto decydował o momencie startu (ja / ktoś), język i tempo. Notatka „co robiłeś” jest opcjonalna. Zapisuje się samo.”
- jak: „Blok przy wtrąceniu się do rozmowy z kolegą o nartach: tak → start: ktoś · PL · szybko.”
- nie: „Nie pisz, dlaczego się zaciąłeś, i nie pisz, jak się czułeś.” (bez zmian)
- dlaczego: „Bloki mają wzór – zwykle zależą od tego, kto wyznacza moment startu, nie od słowa. Pod kartą widzisz liczniki z 14 dni; po dwóch tygodniach ta tabela idzie do logopedki.” (program: 2 tygodnie dziennika; B16)
- EX_META.dziennik.sub: „Był blok? 1–4 dotknięcia”.

## 6. Zasady i ryzyka
- Skala: tylko fakty i liczniki (B15). Żadnej interpretacji wzoru w apce (nie diagnozujemy).
- Prywatność: notatka zostaje w telefonie (localStorage).
- Ryzyko: B15 dołoży dwa przełączniki – układ karty ma je pomieścić bez przebudowy.

## 7. Jak sprawdzone
(po wdrożeniu)
