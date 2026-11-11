---
status: active
updated: 2026-11-11
tags: [architektura]
---

# Architektura aplikacji

Ten dokument opisuje, jak apka jest zbudowana dziś, jak ma być zbudowana (decyzja C1) i w jakich krokach do tego dochodzimy. Zasady, których pilnuje przegląd PR: [[Zasady architektury]]. Uzasadnienia i głosy odrębne: [[HLD PoC – kworum 2026-11-11]].

## Podstawa: małe jest piękne
**Najmniejsza ilość pracy i kodu, która daje daną funkcję. Treść przed formą.** Architektura ma chronić przed rozrostem, a nie go usprawiedliwiać: plik, warstwa albo abstrakcja powstają dopiero wtedy, gdy mają użytkownika, i tylko w kroku, w którym dany kod i tak jest przepisywany. Pełna treść zasady: [[Zasady architektury]] (Z0).

## Stan dziś (v5, wydana 11.11)
Jeden plik `app/index.html` (2017 linii; v4 miała 1598): `<style>` + `<script>` (IIFE, `var`/`function`, bez zależności zewnętrznych, bez frameworka).

| Warstwa | Funkcje | Uwagi |
| --- | --- | --- |
| Helpers | `h`, `append`, `clear`, `fmtClock`, `dateKey`/`parseKey`/`addDays`, `dayIndex`, `weekOf`, `pick`, `clampSR`, `toast` | `DAY1 = '2026-11-07'`; wszystko liczone od tej daty |
| Stan | `load`, `sanitizeDay`, `importDay1`, `save`/`saveNow`, `day`, `peekDay` | localStorage klucz `plynnosc`; zapis z opóźnieniem 300 ms + `pagehide`/`visibilitychange` |
| Audio | `primeAudio`, `beep` | WebAudio + `navigator.vibrate` |
| Komponenty | `SRPicker` (jedyna skala), `Timer`, `SignalDrill`, `TopicCard`, Wake Lock (`wakeOn`/`wakeOff`, dziś włączony tylko w Oddechu A) | współdzielone między ekranami |
| Treść | `ENC`, `INS`, `TOPICS`, `WEEKS`, `EX_META`; rotacja treści: `Rotation`, `oddechWords`, `signalQuestions` | dane idą do `data.js`; funkcje rotacji to kod, więc zostają w `app.js` |
| Dzień | `exercisesFor`, `markDone`, `isDayDone`, `renderSession`, `exerciseCard`, `doneSummary`, `checkRollover` | progresja wg numeru dnia/tygodnia |
| Mapa | `renderMap`, `islandNode`, `islandState`, `planCard`, `openSheet`, `scrollToArch` | SVG, 12 archipelagów |
| Ocena | `metrics`, `buildPrompt`, `renderOcena`, `probeSample`, `renderMd`, `copyText` | `claude.use("sample")`; zastępczo: kopiuj prompt |
| Postępy | `streak`, `renderPostepy`, `chart` | SVG wykres SR 0–8 |
| Ściągawka, nawigacja | `renderSciagawka`, `showTab`, `fromHash`, obsługa klawiatury | hash routing |

Model danych (localStorage `plynnosc`, wersja `v: 2`; v5 dopisała pola bez zmiany wersji, zgodnie z zasadą Z9):
```
{ v, days: { 'YYYY-MM-DD': { done:[], reps:{}, monolog:{…}, sr:{typ,max}, tension:{}, diary:'', body?, complete?, base?:{…}, baseline?,
                          oddechBrzuch, blok:{jest,…}, extra:{lang,topic,ran,breath,sr,done} } },   // trzy ostatnie od v5
  hierarchy:[10 × SR], assessments:[{date, lang, dur, note, metrics, sr, excerpt, result}], archDone:{}, insSeen:{},
  ocenaDraft:{ text, lastAnswer, … }, hierOpen }
```
Wejście z poprzedniej strony: klucz `plynnosc-dzien-01` (import jednorazowy w `importDay1`).

## Architektura docelowa PoC (decyzja C1, 11.11)
Opcja A zostaje: klasyczne `<script src>`, bez frameworka, bundlera i modułów. Granice oddzielają to, co przejdzie do produktu (treść, logika dnia, kształt danych), od tego, co zostanie wyrzucone (ekrany, mapa, wiązanie z artefaktem).

```
index.html ── styles.css
   │
   ├─ data.js     TREŚĆ: ćwiczenia, instrukcje, tygodnie, tematy, parametry ćwiczeń     → moduł 02
   │              tylko dane; dane Alka w jednym oznaczonym bloku PROFILE
   ├─ domain.js   LOGIKA BEZ EKRANU: daty, plan dnia, zaliczenie, streak, metryki tekstu,
   │              sanitize, lista migracji; dzisiejsza data jako parametr                → testy w Node
   ├─ store.js    JEDYNY dostęp do localStorage: load / save / migracja z kopią /
   │              eksport / import / usuń dane / sygnał błędu zapisu
   └─ app.js      EKRAN: widoki, Timer, SRPicker, mapa, Wake Lock, siatka błędów,
                  jedna funkcja wołająca Claude (tylko po kliknięciu)
```

Kolejność ładowania: `data.js` → `domain.js` → `store.js` → `app.js`. `data.js`, `domain.js` i `store.js` wystawiają po jednym obiekcie globalnym (`PLYN_DATA`, `PLYN_DOMAIN`, `PLYN_STORE`); `app.js` nie wystawia nic, bo nikt by tego nie czytał. Warunkowe `module.exports` dochodzi do pliku dopiero razem z jego testami w Node (etap E4). Pliki ładowane z `?v=N`, żeby po publikacji nie spotkały się wersje z pamięci podręcznej.

**Zmiana względem przyjętego HLD, wynikająca z „małe jest piękne”:** osobny plik `ai.js` nie powstaje, dopóki model woła jedno miejsce. Granica zostaje (zasada Z5: `claude.use` w jednym pliku, po kliknięciu), ale jako jedna funkcja w `app.js`. Plik wydzielimy, gdy pojawi się drugie wywołanie (#13, karta angielska w M3).

**Zmiany stanu w etapie E3 – wyłącznie dopisujemy** (zasada Z9). Stara wersja apki musi wczytać nowy stan, bo `saveNow()` przy starcie nadpisuje go od razu. Jedyne usunięcie to `excerpt` w ocenach: żadna wersja go nie czyta, kod tylko go zapisuje. Wersję `v` podnosimy tylko wtedy, gdy zmiany nie da się zrobić w `sanitize` przy wczytaniu. Każde pole wchodzi dopiero z kodem, który je czyta (Z0).

| Zmiana | Reguła |
| --- | --- |
| `days[k].plan: [exId]` | zapisywane w chwili ustawienia `complete`; dla dni już zaliczonych `plan := done`. Źródłem prawdy o zaliczeniu zostaje `complete`. Wchodzi tylko razem z kodem, który to pole czyta (np. raport B16); inaczej wypada |
| `assessments[]` bez `excerpt` | wycinek transkryptu usuwany przy wczytaniu |
| pola B14 i B15 | płasko w dniu, tak jak `field` w [[B14 Zadanie w terenie]] |
| kopia `plynnosc.bak` | jedna; robiona przy błędzie parsowania (E2) i przed każdą zmianą `v`; kasowana po 14 dniach i przez „Usuń dane” |

Eksport = stan bez `ocenaDraft` (szkic transkryptu i ostatnia odpowiedź modelu). Ten format przetrwa przepisanie na produkt.

Czego tu świadomie nie ma: silnika planu (B13 działa bez niego; wraca po przeglądzie M3), ruchomej daty startu w stanie, `map.js`, przebudowy stanu na klasy danych. Lista „nie teraz” z sygnałami powrotu: [[HLD PoC – kworum 2026-11-11]] (P17).

## Plan wdrożenia
Zasada kolejności: plik powstaje w tym kroku, w którym jego kod i tak jest przepisywany, więc nic nie przenosimy dwa razy. Kolejność i terminy zaakceptowane decyzją C2 (11.11). Trening ma pierwszeństwo (B12): gdy brakuje czasu, przesuwa się etap, nie B14 ani treść tygodni.

| Etap | Co powstaje | Kiedy | Backlog | Gotowe, gdy |
| --- | --- | --- | --- | --- |
| **E0** | [[Zasady architektury]], `AGENTS.md`; Alek podłącza przegląd PR przez Codex | dokumenty teraz; Codex w dowolnym momencie przed PR E1 | A7 | Codex skomentował pierwszy PR zmieniający `app/` (przed E1 ocenia tylko Z0 i Z9–Z13) |
| **E1** | Podział mechaniczny: `styles.css`, `data.js` (z blokiem `PROFILE`), `app.js`; `?v=N`; test spójności danych; `test/arch.js` i workflow w Actions; harness czyta wszystkie pliki `app/` | do 15.11, po B14 | A5, A7 | harness zielony, zrzuty ekranów bez zmian, `test/arch.js` zielony, w `index.html` nie ma kodu w `<script>`, artefakt opublikowany z `files` działa na telefonie |
| **E2** | „Pakiet bezpieczeństwa”: powstaje `store.js` (zapis, kopia przy błędzie parsowania, import „wklej”, eksport bez `ocenaDraft`, widoczny błąd zapisu) oraz w `app.js` siatka na wyjątki, R4, R5 | M1, do 21.11 | A8 (obejmuje #15); spec do napisania | dane da się przywrócić z kopii; błąd zapisu i wyjątek są widoczne; wygasają wyjątki Z2, Z5, Z10 |
| **E3** | Zmiany stanu z tabeli wyżej, „Usuń dane”, R7, R8 | M1, po B15 i B16 | w specyfikacji A8 albo osobnej | stan Alka wczytuje się bez utraty; wycofanie wydania nie psuje danych |
| **E4** | `domain.js`: wydzielenie logiki dnia bez zmian zachowania + testy w Node | gdy M1 ma zapas, inaczej po treści tygodni 4–6 | A9; C6 | testy zaliczenia dnia działają bez przeglądarki; z Z11 znika dopisek „do czasu jego powstania” |
| **E5** | Przegląd M3: jeden obiekt stanu widoku i jedna ścieżka zaliczenia (jeśli nadal boli); decyzja „ewoluujemy czy piszemy od nowa” | grudzień | przegląd M3 | decyzja zapisana w [[Decision log]] |

Gdy w M1 brakuje czasu, kolejność jest taka: E2, potem B15, potem B16, na końcu E3; tniemy od końca. B15 nie potrzebuje E3 (jego pola idą płasko w dniu, bez zmiany `v`).

Uwagi do E1:
- Harness czyta dziś źródło `index.html` (m.in. `test/round3.js` R10 i skan innych skal w `test/round2.js`); po podziale ma czytać wszystkie pliki w `app/`. Test N4 w `round2.js` (brak sieci) zastępuje `test/arch.js`.
- To pierwsza publikacja wielu plików: `publish` z `files`, sprawdzenie na telefonie, że wersje plików się nie rozjeżdżają (`?v=N`).
- Zmiany w `CLAUDE.md` przy E1: krok 1 (`node --check app/*.js`), krok 3 (publikacja z `files`), opis struktury.

Przy treści tygodni 4–6 parametry ćwiczeń (czasy, liczby powtórzeń) przechodzą z kodu ekranów do `data.js`; to część tamtej pracy, nie osobny etap.

## Pilnowanie architektury
Specyfikacja: [[A7 Strażnik architektury]].
- **Skrypt** `test/arch.js` sprawdza reguły mechaniczne lokalnie i w GitHub Actions przy każdym PR zmieniającym `app/`.
- **Recenzent z innego modelu** (Codex przez integrację z GitHubem, sterowany `AGENTS.md`) ocenia, czy zmiana trzyma się zasad, przede wszystkim Z0.
- Testy i działanie funkcji są poza tym przeglądem: [[Testy]].

## Poprawki z recenzji v3 – stan
- Zrobione w v4: R1 (flaga `complete`), R2 (powrót na mapę czeka na koniec pisania), R3 (dzień 85+).
- Etap E2 (A8): R4 (sonda `sample` tylko po kliknięciu, bez stałej blokady), R5 (stary wynik Claude przy nowym transkrypcie).
- Etap E3: R7 (walidacja ocen przy wczytaniu), R8 (dzień 1 z wartościami wpisanymi w kod).
- Otwarte, małe: R6 (pasek kart po klawiaturze), R9 (daty ocen w UTC), R10 (drobiazgi timera), R11 (tekst `planCard`).
Pełna lista: [[Review kodu v3 – niezależny]].

## Znane ograniczenia
- Dane tylko w localStorage jednego urządzenia; kopia przez „Kopiuj dane”, bez importu (do etapu E2).
- Wake Lock jest od v5 tylko w Oddechu A. Włączenie w pozostałych timerach to drobna zmiana (pozycja WL w backlogu, okno A), po potwierdzeniu na telefonie, że w Oddechu A działa (C4).
- Tygodnie 4–12 = placeholder.
- `sample` nie przyjmuje audio → transkrypcja powstaje poza aplikacją: [[Transkrypcja PL – research]].
- Prompt „Oceń” w obecnej postaci to wyjątek prywatny Alka (C3) z zakazem przeniesienia do produktu: [[HLD v1]] §7.
