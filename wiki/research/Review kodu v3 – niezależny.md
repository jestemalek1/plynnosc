---
status: active
updated: 2026-11-07
source: niezależny recenzent (subagent), bez znajomości HANDOFF/BACKLOG
tags: [research, review, kod]
---

# Recenzja `app/index.html` (1406 linii; CSS 7–225, skrypt 239–1403, jedno IIFE)

`node --check` na wyekstrahowanym skrypcie: OK.

## 1. Błędy i ryzyka (od najpoważniejszego)

**R1. Ukończone dni „odkończają się” po zmianie listy ćwiczeń (projektowe, uderzy przy tyg. 4).**
`isDayDone` (691) liczy stan z *aktualnej* listy: `exercisesFor(k).every(e => d.done.indexOf(e) >= 0)`. `exercisesFor` (654) zwraca dla tyg. ≥4 tylko `['dziennik','sr']`. Gdy w tyg. 4 dodasz prawdziwe ćwiczenia, każdy dzień zaliczony na placeholderze stanie się nagle „do nadrobienia” – spadnie `streak()` (1056), `weekDoneCount` (772), wyspy zmienią kolor, karta „Nowy archipelag” (804–811) może się nie pojawić. To samo dotyczy każdej przyszłej zmiany listy w tyg. 1–3. Naprawa: przy zaliczeniu zapisywać w dniu snapshot listy (`d.list`) albo flagę `d.complete`, a `isDayDone` ma czytać ją, nie `exercisesFor`.

**R2. Dziennik jako ostatnie ćwiczenie: ekran przełącza się na mapę w trakcie pisania.**
`maybeDone` (1033–1035) po 10 znakach woła `markDoneInPlace` → `if (isDayDone(k)) scheduleReturn(k)` (688) → po 1,8 s `renderDzis()` na mapę (718). Jeśli dziennik jest ostatni (częste: `sr` często robi się wcześniej), textarea znika spod palca. Tekst nie ginie (`d.diary` zapisywany na `oninput`), ale wpis zostaje ucięty. Naprawa: w `scheduleReturn` sprawdzać `isField(document.activeElement)` i odłożyć powrót do `focusout`.

**R3. TypeError od dnia 85 (2027‑01‑30).**
`planCard(w)` (746) robi `WEEKS[w - 1][0]` i `weekExNames(w)` (771) `WEEKS[w - 1][2]`; `WEEKS` ma 12 wpisów, `weekOf` (272) nie ma górnego limitu. `renderMap` klampuje `tw` (799), ale `renderSession` (721) nie – i dzień 85 jest osiągalny strzałką `›` (733, `disabled: k >= today`). Wyjątek wylatuje po dołożeniu nagłówka i paska (737–743) – ekran zostaje w połowie. Potwierdzone w node: `Cannot read properties of undefined (reading '0')`. Naprawa: `Math.min(12, w)` w jednym miejscu (`weekOf`) albo wiersz „Utrzymanie” jako fallback.

**R4. Sonda `sample`: timeout 10 s zamyka drzwi na stałe, a sonda odpala się bez intencji użytkownika.**
`probeSample` (1247): `Promise.race([claude.use('sample'), timeout])`; `done(null)` (1254–1255) ustawia `sampleChecked = true`, a guard `if (sample || sampleChecked || probing) return` (1249) blokuje kolejne próby. Jeśli runtime pokaże użytkownikowi prośbę o zgodę i ten odpowie po 10 s, aplikacja do przeładowania twierdzi „niedostępne”. Dodatkowo `use('sample')` jest wołany na `load` (1400) i przy każdym wejściu w „Oceń”, nie po kliknięciu „Oceń z Claude” – ewentualny prompt o zgodę pojawia się zanim użytkownik czegokolwiek chciał. Obsługa `rate_limited` (1220) i `not_granted` (1219) poprawna, bez retry. `onText` (1210) zakłada, że `ev.text` to tekst skumulowany, nie delta – jeśli to delta, podgląd miga; wynik końcowy i tak bierze `r.text`.

**R5. Stary wynik Claude doklejony do nowego transkryptu.**
`resultEl.dataset.text` ustawiany przy renderze z `draft.lastAnswer` (1188) i po ocenie; edycja textarea go nie czyści. Ścieżka: oceń transkrypt A → wklej B → „Zapisz metryki” (1176) → `saveAssessment(resultEl.dataset.text)` zapisuje metryki B z odpowiedzią do A. Naprawa: w `onEdit()` czyścić `dataset.text`, gdy `sig()` różni się od sygnatury ocenionego tekstu.

**R6. `body.kb` nie ma ścieżki resetu poza `focusout`.**
Klasa zdejmowana tylko w (1399). `showTab` (1373), `renderDzis`, `checkRollover` (701) ani `scheduleReturn` nie czyszczą jej; gdy pole z fokusem zostaje usunięte z DOM lub ukryte przez `display:none` sekcji, przeglądarki nie gwarantują `focusout` – pasek kart może zostać schowany do następnego cyklu fokusu. Jedna linia `document.body.classList.remove('kb')` w `showTab` i na początku `renderDzis` to zamyka.

**R7. Sanityzacja stanu niepełna.**
`load()` (311) nie sprawdza: `a.result`/`a.lang`/`a.excerpt` w `assessments` (318–320) – `renderMd(box, a.result)` (1232) robi `text.split('\n')`, nie‑string = TypeError i pusta historia; `ocenaDraft.lastAnswer` (1188) tak samo; `archDone` i `hierOpen` powstają poza `load` (804, 1305); `sanitizeDay` (298) nie waliduje `base`, `baseline`, `monolog.topic/lang` (dla `topic` jest fallback w BUILD 946, dla `lang` – nie: `'xx'` daje oba segmenty wyłączone). Brak pola `version` w stanie – nie ma na czym oparć przyszłej migracji. `hierarchy.length === 10` (317) – zmiana długości listy cicho kasuje dane użytkownika.

**R8. Dzień 1 jest „zaliczony” z danymi domyślnymi na każdej nowej instalacji.**
`importDay1` (326) zawsze zwraca `done: ['baza','monolog','dziennik','sr']` (333) i SR 5/4/3/2, dziennik z zaszytym tekstem osobistym (344–345), nawet gdy klucz `plynnosc-dzien-01` nie istnieje. Streak i wykres startują od sztucznego punktu; tekst osobisty siedzi w publikowanym źródle. Zamierzone dla jednego użytkownika, ale warto wiedzieć.

**R9. Rollover przez północ.** `checkRollover` (701) tylko na `visibilitychange`/kliknięciu „Dziś”; przy ekranie włączonym `lastToday` nie odświeży się. `renderSession` sam liczy `today` (725), więc nawigacja działa; ale po powrocie z tła `checkRollover(true)` rzuca na mapę i zabija bieżący timer (`renderMap` → `killTimers`) – reps są zapisane po `onRep`, bieżąca faza przepada. Date z `toISOString().slice(0,10)` (1201, 1228) to UTC – wieczorne oceny w WEST (+1) pokazują poprzedni dzień.

**R10. Timer.** Pauza w fazie `gap` (469) ustawia `leftMs = cur().secs*1000` – po „Wznów” pomija resztę przerwy na wdech i startuje od pełnej fazy; drobne. `tick` co 200 ms przebudowuje `reps` (446) – 5×/s `clear+append`, zbędne. Po uśpieniu telefonu jedno wywołanie `tick` zalicza tylko jedną fazę (świadome, ale nieopisane w UI). Liczenie `onRep(idx)` przed sprawdzeniem końca (456–457) i `startIndex` (`Math.min(reps, 11)`) są spójne.

**R11. planCard tekst zawsze nieaktualny.** „Ten etap zostanie dodany przed `weekStart(w)`” (748) – karta jest widoczna tylko dla dni ≤ dziś, więc data zawsze już minęła.

Drobne: `.chead[role=button]` zawiera zagnieżdżony `<button>` (895–899); `progressbar` bez `aria-valuemin`; dwa `NS` (767, 1326); `openSheet` i mapa trzymają się 84 wysp, ale nagłówek `'Dzień ' + tn` (801) pójdzie w 85+.

## 2. Czytelność dla agenta LLM

Jedna zmiana w jednym przebiegu jest realna tylko dla danych (`TOPICS`, `INS`, `ENC`, `WEEKS`, `EX_META`) i dla ekranów Postępy/Ściągawka. Trudne są:
- Stan ekranu „Dziś” rozlany po zmiennych modułowych: `viewKey, lastToday, dzisView, recent, expanded, cards, hdr, justDone, mapMsg, afterShow, currentTab` (693–712, 1372, 1388) – modyfikowane z ~10 miejsc (`openDay`, `checkRollover`, strzałki 732–733, `scheduleReturn`, `renderMap`, `showTab`, `REPEAT`). Agent nie widzi z jednego miejsca, kto i kiedy to zeruje.
- Trzy ścieżki zaliczenia: `markDone` (668) przebudowuje ekran, `markDoneInPlace` (680) łata DOM, `check()` w BUILD.sr/monolog (955, 1049) robi własny update `small`. Każda zmiana w karcie wymaga przejrzenia wszystkich trzech.
- `afterShow`/`flushAfterShow` + `scrollToArch` – kolejność scrolla zależy od `showTab` vs `renderMap` vs `scheduleReturn`; łatwo zepsuć bez testu.
- `renderOcena` to 90‑linijkowa domknięcie z 15 wewnętrznymi funkcjami i stanem w `status.textContent` (porównania ze stałymi 1239–1242).
- `Timer` jest zwarty i samowystarczalny – dobry przykład; `BUILD[ex]` jako tabela funkcji – dobre miejsce na nowe ćwiczenia, ale zależy od globali `cards`, `expanded`, `recent`.

## 3. Plan podziału bez bundlera

Cztery pliki, klasyczne `<script src>` w kolejności, bez `type=module` (pozostaje `file://` i prosty `node --check` per plik; artefakt dopuszcza własne pliki). Każdy plik to IIFE przypinające jeden obiekt do `window`; `app.js` zamiast IIFE może zostać nienazwaną funkcją, bo i tak jest ostatni.

1. **`styles.css`** – linie 8–224 bez zmian. `<link rel="stylesheet" href="styles.css">`.
2. **`data.js`** → `window.PLYN_DATA = { DAY1, HIER, BASE_HIER, SR_COLORS, SR_MEANING, TOPICS, TAG_LABEL, ENC, INS, BRIEF_LABEL, A_WORDS, B_WORDS, TENSION, WEEKS, EX_META, FILL_PL, FILL_EN }` (fragmenty 270, 289–297, 397–399, 481–544, 569–653, 753–766, 1066–1067). Zero logiki. Najczęściej edytowany plik → najmniejsze ryzyko.
3. **`map.js`** → `window.PLYN_MAP = { render(root, ctx), scrollToArch, openSheet, closeSheet, weekStart, weekDoneCount, islandState }` z linii 767–865 (bez `WEEKS` i `weekExNames`, które zostają w app/data). Zależności wstrzykiwane przez `ctx`: `{ h, sv, clear, append, addDays, dayIndex, weekOf, fmtDate, parseKey, pad2, isDayDone, exercisesFor, EX_META, WEEKS, state, saveNow, streak, openDay, onReady(afterShowFn) }`. `justDone`/`mapMsg` przekazywane jako parametry `render(root, {justDone, mapMsg})`, nie globale. Alternatywa minimalna: `map.js` czyta `window.PLYN` (core) – szybsze, ale utrwala sprzężenie.
4. **`app.js`** – reszta (helpery 243–286, stan 288–372, audio, `SRPicker`, `Timer`, `TopicCard`, ćwiczenia/BUILD/REPEAT, Dziś/session, Oceń, Postępy, Ściągawka, router). Eksportuje `window.PLYN = { state, save, saveNow, day, isDayDone, exercisesFor, streak, showTab, renderDzis, openDay, _timers: killTimers }` – potrzebne mapie i testom.

Granice globalne: `PLYN_DATA` (tylko odczyt), `PLYN_MAP` (wołany z `renderDzis`), `PLYN` (core, wołany przez mapę). Nic więcej na `window`. Kolejność w HTML: `data.js`, `map.js`, `app.js` – `map.js` nie wywołuje nic w czasie ładowania, więc może stać przed `app.js`.

Warunki: testy Playwright ładują `file://…/index.html` – `<script src>` relatywne działa bez serwera; `node --check` uruchamiać na każdym z trzech `.js`. Publikacja: `files: {"styles.css","data.js","map.js","app.js"}` obok strony; żadnych CDN nie potrzeba. Jeśli przy okazji chcesz rozbić R1, najpierw podział (czysty przerzut), potem zmiana semantyki – nie w jednym commicie.

Szacunek: **2 rundy** (build → test → review). Runda 1: wycięcie CSS + `data.js` + `app.js` (czysto mechaniczne, diff zero w logice; test = screenshoty bez zmian). Runda 2: `map.js` z `ctx` (jedyna refaktoryzacja z ryzykiem: `afterShow`/`justDone`/`scrollToArch`), poprawki z review. Rozbijanie `renderOcena` lub ekranu Dziś na osobne moduły – nie teraz; to osobna runda, dopiero po R1/R2.

## 4. Czego NIE ruszać

- `h()`/`append()`/`sv()` (243–263, 774) – bezpieczne (textContent, `html:` tylko dla statycznych ikon), a `renderMd` (1106) na nich polega; nie wprowadzać `innerHTML` do odpowiedzi modelu.
- `Timer` (424–479): maszyna stanów `idle/run/gap/pause/done`, `endAt` oparty na `Date.now()` (odporny na throttling), `onRep` przed `onDone`, `startIndex` z `reps`. Działa; R10 to kosmetyka.
- `SRPicker` (400–421) – jedyna skala, używana w 5 miejscach; `clampSR` przy wejściu.
- `load()`/`sanitizeDay` – struktura „napraw, nie odrzucaj” jest słuszna; uzupełnić (R7), nie przepisywać. Nie zmieniać klucza `plynnosc` ani kształtu `days[k]`.
- `save()` debounce + `pagehide`/`beforeunload`/`visibilitychange → saveNow` (361–364).
- Daty: `dateKey/parseKey/addDays/dayIndex` na lokalnym czasie z `Math.round` – poprawne przy DST; porównania kluczy jako stringów ISO (726, 733, 773) są prawidłowe.
- Router: `showTab` ↔ `hashchange` z guardem `id === currentTab` (1391) – brak pętli; `try/catch` wokół `location.hash` jest potrzebny w sandboxie artefaktu.
- Obsługa błędów `sample` w `evaluate` (1216–1223): bez retry, komunikaty poprawne, `not_granted` chowa przycisk.
- CSS: cele dotykowe ≥44 px, `env(safe-area-inset-*)`, `prefers-reduced-motion`, `interactive-widget=resizes-content` – spójne, nie wymaga zmian przy wycięciu do `styles.css`.
