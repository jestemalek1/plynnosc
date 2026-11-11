---
status: active
updated: 2026-11-11
tags: [architektura]
---

# Architektura aplikacji

Ten dokument opisuje, jak apka jest zbudowana dziś, jak ma być zbudowana (decyzja C1) i w jakich krokach do tego dochodzimy. Zasady, których pilnuje przegląd PR: [[Zasady architektury]]. Uzasadnienia i głosy odrębne: [[HLD PoC – kworum 2026-11-11]].

## Podstawa: małe jest piękne
**Najmniejsza ilość pracy i kodu, która daje daną funkcję. Treść przed formą.** Architektura ma chronić przed rozrostem, a nie go usprawiedliwiać: plik, warstwa albo abstrakcja powstają dopiero wtedy, gdy mają użytkownika, i tylko w kroku, w którym dany kod i tak jest przepisywany. Pełna treść zasady: [[Zasady architektury]] (Z0).

## Stan dziś (v4)
Jeden plik `app/index.html` (1598 linii): `<style>` + `<script>` (IIFE, `var`/`function`, bez zależności zewnętrznych, bez frameworka).

| Warstwa | Funkcje | Uwagi |
| --- | --- | --- |
| Helpers | `h`, `append`, `clear`, `fmtClock`, `dateKey`/`parseKey`/`addDays`, `dayIndex`, `weekOf`, `pick`, `clampSR`, `toast` | `DAY1 = '2026-11-07'`; wszystko liczone od tej daty |
| Stan | `load`, `sanitizeDay`, `importDay1`, `save`/`saveNow`, `day`, `peekDay` | localStorage klucz `plynnosc`; zapis z opóźnieniem 300 ms + `pagehide`/`visibilitychange` |
| Audio | `primeAudio`, `beep` | WebAudio + `navigator.vibrate` |
| Komponenty | `SRPicker` (jedyna skala), `Timer`, `TopicCard` | współdzielone między ekranami |
| Treść | `ENC`, `INS`, `TOPICS`, `WEEKS`, `EX_META` | to tu wchodzą tygodnie 4–12 |
| Dzień | `exercisesFor`, `markDone`, `isDayDone`, `renderSession`, `exerciseCard`, `doneSummary`, `checkRollover` | progresja wg numeru dnia/tygodnia |
| Mapa | `renderMap`, `islandNode`, `islandState`, `planCard`, `openSheet`, `scrollToArch` | SVG, 12 archipelagów |
| Ocena | `metrics`, `buildPrompt`, `renderOcena`, `probeSample`, `renderMd`, `copyText` | `claude.use("sample")`; zastępczo: kopiuj prompt |
| Postępy | `streak`, `renderPostepy`, `chart` | SVG wykres SR 0–8 |
| Ściągawka, nawigacja | `renderSciagawka`, `showTab`, `fromHash`, obsługa klawiatury | hash routing |

Model danych (localStorage `plynnosc`, wersja `v: 2`):
```
{ v, days: { 'YYYY-MM-DD': { done:[], reps:{}, monolog:{…}, sr:{typ,max}, tension:{}, diary:'', body?, complete?, base?:{…}, baseline? } },
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

Kolejność ładowania: `data.js` → `domain.js` → `store.js` → `app.js`. Każdy plik wystawia jeden obiekt globalny (`PLYN_DATA`, `PLYN_DOMAIN`, `PLYN_STORE`, `PLYN`). `domain.js` i `store.js` kończą się warunkowym `module.exports`, żeby ten sam plik działał w przeglądarce i w Node. Pliki ładowane z `?v=N`, żeby po publikacji nie spotkały się wersje z pamięci podręcznej.

**Zmiana względem przyjętego HLD, wynikająca z „małe jest piękne”:** osobny plik `ai.js` nie powstaje, dopóki model woła jedno miejsce. Granica zostaje (zasada Z5: `claude.use` w jednym pliku, po kliknięciu), ale jako jedna funkcja w `app.js`. Plik wydzielimy, gdy pojawi się drugie wywołanie (#13, karta angielska w M3).

**Stan v3 – wyłącznie dopisujemy** (zasada Z9). Stara wersja apki musi wczytać nowy stan, bo `saveNow()` przy starcie nadpisuje go od razu.

| Zmiana | Reguła |
| --- | --- |
| `days[k].plan: [exId]` | zapisywane w chwili ustawienia `complete`; dla dni już zaliczonych `plan := done`. Źródłem prawdy o zaliczeniu zostaje `complete` |
| `days[k].updatedAt` | dopisywane przy zapisie dnia |
| `assessments[]` bez `excerpt`, z `promptVersion` | wycinek transkryptu usuwany przy migracji |
| pola B14 i B15 | płasko w dniu, tak jak `field` w [[B14 Zadanie w terenie]] |
| kopia `plynnosc.bak` | jedna; robiona przed migracją i przy błędzie parsowania; kasowana po 14 dniach i przez „Usuń dane” |

Eksport = stan bez `ocenaDraft` (szkic transkryptu i ostatnia odpowiedź modelu). Ten format przetrwa przepisanie na produkt.

Czego tu świadomie nie ma: silnika planu (B13 działa bez niego; wraca po przeglądzie M3), ruchomej daty startu w stanie, `map.js`, przebudowy stanu na klasy danych. Lista „nie teraz” z sygnałami powrotu: [[HLD PoC – kworum 2026-11-11]] (P17).

## Plan wdrożenia
Zasada kolejności: plik powstaje w tym kroku, w którym jego kod i tak jest przepisywany, więc nic nie przenosimy dwa razy. Terminy to rekomendacja i czekają na decyzję C2 w [[Decyzje do podjęcia]]. Trening ma pierwszeństwo (B12): gdy brakuje czasu, przesuwa się etap, nie B14 ani treść tygodni.

| Etap | Co powstaje | Kiedy | Backlog | Gotowe, gdy |
| --- | --- | --- | --- | --- |
| **E0** | [[Zasady architektury]], `AGENTS.md`, przegląd PR przez Codex podłączony przez Alka | teraz | A7 | Codex skomentował pierwszy PR |
| **E1** | Podział mechaniczny: `styles.css`, `data.js` (z blokiem `PROFILE`), `app.js`; `?v=N`; test spójności danych; `test/arch.js` i workflow w Actions | do 15.11, po B14 | A5, A7 | harness zielony, zrzuty ekranów bez zmian, `test/arch.js` zielony, w `index.html` nie ma kodu w `<script>` |
| **E2** | „Pakiet bezpieczeństwa”: powstaje `store.js` (zapis, kopia przed migracją, import „wklej”, widoczny błąd zapisu) oraz w `app.js` siatka na wyjątki, Wake Lock, R4, R5 | M1, do 21.11 | zastępuje #15 i WL; spec do napisania | dane da się przywrócić z kopii; błąd zapisu i wyjątek są widoczne; wygasa wyjątek Z2 |
| **E3** | Migracja v3 (tabela wyżej), „Usuń dane”, R8 | M1, razem z B15 | w specyfikacji B15 | stan v2 Alka przechodzi migrację bez utraty; wycofanie wydania nie psuje danych |
| **E4** | `domain.js`: wydzielenie logiki dnia bez zmian zachowania + testy w Node | gdy M1 ma zapas, inaczej po treści tygodni 4–6 | nowa pozycja; C6 | testy migracji i zaliczenia dnia działają bez przeglądarki; wygasa wyjątek Z4 |
| **E5** | Przegląd M3: jeden obiekt stanu widoku i jedna ścieżka zaliczenia (jeśli nadal boli); decyzja „ewoluujemy czy piszemy od nowa” | grudzień | przegląd M3 | decyzja zapisana w [[Decision log]] |

Przy treści tygodni 4–6 parametry ćwiczeń (czasy, liczby powtórzeń) przechodzą z kodu ekranów do `data.js`; to część tamtej pracy, nie osobny etap.

## Pilnowanie architektury
Specyfikacja: [[A7 Strażnik architektury]].
- **Skrypt** `test/arch.js` sprawdza reguły mechaniczne lokalnie i w GitHub Actions przy każdym PR zmieniającym `app/`.
- **Recenzent z innego modelu** (Codex przez integrację z GitHubem, sterowany `AGENTS.md`) ocenia, czy zmiana trzyma się zasad, przede wszystkim Z0.
- Testy i działanie funkcji są poza tym przeglądem: [[Testy]].

## Poprawki z recenzji v3 – stan
- Zrobione w v4: R1 (flaga `complete`), R2 (powrót na mapę czeka na koniec pisania), R3 (dzień 85+).
- Etap E2: R4 (sonda `sample` tylko po kliknięciu, bez stałej blokady), R5 (stary wynik Claude przy nowym transkrypcie).
- Etap E3: R7 (walidacja ocen przy wczytaniu), R8 (dzień 1 z wartościami wpisanymi w kod).
- Otwarte, małe: R6 (pasek kart po klawiaturze), R9 (daty ocen w UTC), R10 (drobiazgi timera), R11 (tekst `planCard`).
Pełna lista: [[Review kodu v3 – niezależny]].

## Znane ograniczenia
- Dane tylko w localStorage jednego urządzenia; kopia przez „Kopiuj dane”, bez importu (do etapu E2).
- Brak Wake Lock (do etapu E2; nie wiadomo jeszcze, czy działa w artefakcie na iPhonie – C4).
- Tygodnie 4–12 = placeholder.
- `sample` nie przyjmuje audio → transkrypcja powstaje poza aplikacją: [[Transkrypcja PL – research]].
- Prompt „Oceń” w obecnej postaci to wyjątek prywatny Alka (C3) z zakazem przeniesienia do produktu: [[HLD v1]] §7.
