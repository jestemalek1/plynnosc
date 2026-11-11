---
status: propozycja
owner: Alek
updated: 2026-11-11
tags: [architektura, hld, kworum, recenzja]
---

# HLD PoC – wynik kworum agentów (11.11.2026)

Pytanie Alka: czy kod aplikacji jest pisany zgodnie z najlepszymi praktykami dla takich rozwiązań i jaki HLD proponujemy dla PoC, wiedząc, że ma on urosnąć do produktu z [[HLD v1]].

Stan: **propozycja**. Nic tu nie jest decyzją, dopóki Alek nie odhaczy pozycji C1–C8 w [[Decyzje do podjęcia]]. Kod aplikacji nie był zmieniany.

## Jak to powstało
1. **Runda 1 – cztery niezależne raporty.** Agenci nie znali nawzajem swoich wniosków i pracowali tylko do odczytu:
   - **K** – jakość kodu względem dobrych praktyk dla małej aplikacji vanilla JS,
   - **A** – architektura i droga PoC → produkt,
   - **D** – dane zdrowotne, prywatność, regulacje, tor oceny mowy,
   - **Y** – adwokat prostoty (gdzie dobre praktyki to nadinżynieria przy jednym użytkowniku).
2. **Runda 2 – głosowanie.** Raporty scalono w 18 propozycji (P1–P18); każdy agent głosował: za / przeciw / za z poprawką. Próg: 3 głosy z 4. Głos odrębny jest zapisany.
3. **Runda 3 – „grill me”.** Piąty agent, który nie znał dyskusji, przepytał wynik i sprawdził go w repo. Ten dokument jest wersją **po** jego poprawkach; co zmienił, opisuje sekcja „Co zmieniła runda grill”.

**Zastrzeżenie o bazie.** Rundy 1–2 czytały `main` (bcea4ae). `develop` jest dwa PR-y dalej, ale tylko w dokumentach; `app/` i `test/` są identyczne. Ocena kodu jest więc aktualna, a harmonogram i odniesienia do decyzji zostały po rundzie 3 uzgodnione z `develop` (B13, B16, B17, B29–B32, spec [[B14 Zadanie w terenie]]).

Testów nie uruchamiał żaden agent (praca tylko do odczytu). Oceny opierają się na czytaniu kodu; K potwierdził `node --check` na wyciętym skrypcie.

## Odpowiedź w skrócie
**Na etap PoC z jednym użytkownikiem kod jest wystarczająco dobry i w kilku miejscach lepszy niż typowy prototyp.** Nie spełnia dobrych praktyk w trzech obszarach, które realnie zagrażają treningowi albo prywatności, i w jednym, który utrudni drogę do produktu (brak granic między treścią, logiką i ekranem).

| Obszar | Ocena K (1–5) | Komentarz |
| --- | --- | --- |
| Bezpieczeństwo (XSS) | 4 | DOM budowany przez `textContent`; odpowiedź modelu składana z węzłów, nie z HTML |
| Stan i trwałość danych | 3 | Odczyt „napraw, nie odrzucaj”, wersja stanu i migracja są; brak importu, kopii przed migracją i sygnału błędu zapisu |
| Renderowanie i DOM | 3 | Działa, ale stan ekranu rozlany po 11 zmiennych i 5 ścieżkach zaliczenia ćwiczenia |
| Dostępność | 3 | Cele dotykowe i `aria-pressed` są; kontrast cyfr na chipach SR od 2,27:1 (próg 4,5:1) |
| Testy | 3 | Playwright ze sterowanym zegarem i bramką; logiki czystej nie da się testować poza przeglądarką |
| Odporność na błędy | 3 | Brak siatki na wyjątki: błąd w renderze zostawia pół ekranu |
| Czytelność | 3 | — |
| Struktura i modularność | 2 | Jeden plik, 1598 linii; planowany podział nie został zrobiony |

**Co jest zrobione dobrze i czego nie wolno zepsuć:** bezpieczne budowanie DOM, `load()`/`sanitizeDay` naprawiające dane, lepka flaga `complete` z idempotentną migracją, zapis z opóźnieniem plus `pagehide`/`visibilitychange`, timer liczony od `Date.now()`, daty w czasie lokalnym, jedna skala `SRPicker`, harness z bramką.

**Z recenzji v3 naprawiono R1, R2, R3.** Otwarte: R4, R5, R6, R8, R9, R11; R7 częściowo.

## Największe ryzyka (zgodne u wszystkich czterech, linie potwierdzone w rundzie 3)
1. **Dane w jednej kopii, której nie da się przywrócić.** „Kopiuj dane” istnieje (`app/index.html:1515`), importu nie ma. `saveNow` połyka błąd zapisu (`:382`). Migracja nadpisuje oryginał bez kopii (`:345`, `:392`); uszkodzony JSON daje pusty stan i natychmiastowe nadpisanie (`:334`, `:392`). Safari może skasować dane strony po 7 dniach bez interakcji.
2. **Gasnący ekran w trakcie ćwiczenia.** Brak Wake Lock; po wygaszeniu sygnały timera przepadają. Nie wiadomo, czy Wake Lock działa w ramce artefaktu na iPhonie.
3. **Pusty albo połowiczny ekran w trakcie sesji.** Brak `window.onerror`/`unhandledrejection`; wywołania `BUILD[ex]`, `EX_META[ex]`, `INS[id]` zakładają spójność danych, a tygodnie 4–12 będą dopisywane przez dwa okna.
4. **Prompt oceny łamie własne zasady projektu.** Sekcja „Treść i samorozwój – co mówca ujawnia o sobie, jeden słaby punkt…” (`:1293`) jest sprzeczna z `CLAUDE.md` i z B20/B32. UI nazywa to „oceną”, bez zastrzeżenia, że to informacja zwrotna z transkryptu, która nie widzi bloków.
5. **Transkrypt zostaje na stałe.** `ocenaDraft.text` trzyma pełny transkrypt bez terminu (`:1354`), oceny przechowują wycinek i odpowiedź z cytatami (`:1392`), a „Kopiuj dane” wkłada to wszystko do schowka, razem z ostatnią odpowiedzią (`:1405`).
6. **Dane osobiste w publikowanym kodzie.** Fragment o rodzinie w „Zdaniu do powiedzenia” w Ściągawce (`:1554`; dane o zdrowiu osób trzecich), domyślny wpis dziennika i ciała (`:364–365`), hierarchia sytuacji (`:299–304`), imię (`:683`, `:759–760`), miasto, bazowe SR (`:357–360`), dane kontaktowe specjalisty (`:1553`).

## Proponowany HLD dla PoC
Zasada: zostajemy przy Opcji A (klasyczne `<script src>`, bez frameworka i bundlera). Zmienia się tylko to, **gdzie przebiegają granice**: oddzielamy to, co przejdzie do produktu (treść, logika dnia, kształt danych), od tego, co zostanie wyrzucone (DOM, mapa SVG, wiązanie z artefaktem).

```
index.html ── styles.css
   │
   ├─ data.js     TREŚĆ: ćwiczenia, instrukcje, tygodnie, tematy, parametry ćwiczeń      → moduł 02 (Biblioteka)
   │              zero logiki; dane Alka w jednym oznaczonym bloku PROFILE
   ├─ domain.js   LOGIKA BEZ DOM: daty, plan dnia, zaliczenie, streak, metryki tekstu,
   │              sanitize, lista migracji; zegar wstrzykiwany (today())                  → testy node:test
   ├─ store.js    JEDYNY dostęp do localStorage: load / save / migrate (+ kopia przed) /
   │              export / import / usuń dane / sygnał błędu zapisu
   ├─ ai.js       cienki adapter: assess(payload) → {text, promptVersion};
   │              ścieżki: sample (tylko z kliknięcia) albo „kopiuj prompt”
   └─ app.js      UI: ekrany, Timer, SRPicker, mapa (zostaje tutaj), Wake Lock, siatka błędów
```

**Zmiana względem planu z [[Architektura aplikacji]]:** `map.js` z wstrzykiwanym `ctx` (kilkanaście zależności dla jednego konsumenta) wypada (4/4). W jego miejsce wchodzą `domain.js` i `store.js`, bo to jedyne części kodu, które da się przenieść do produktu i przetestować poza przeglądarką.

**Szczegóły wykonawcze** (dopisane po rundzie 3):
- `domain.js` i `store.js` kończą się warunkowym `module.exports`, żeby ten sam plik działał jako `<script>` i w `node:test`, bez modułów ES.
- Pliki w `index.html` ładowane z `?v=N` albo ze sprawdzeniem wspólnej stałej wersji przy starcie, żeby po publikacji nie spotkały się nowy `index.html` i stary `app.js` z pamięci podręcznej.
- `ai.js` zwraca na razie tekst. Odpowiedź ustrukturyzowana (`sample.json`) dojdzie razem z #13 (karta angielska, M3), nie wcześniej.

**Stan, wersja 3 – wyłącznie dopisujemy, niczego nie przenosimy.** Powód: `saveNow()` przy starcie (`:392`) nadpisuje stan od razu, więc wycofanie wydania nie może trafić na dane, których stara wersja nie rozumie.

| Zmiana w v3 | Reguła |
| --- | --- |
| `days[k].plan: [exId]` | zapisywane w chwili ustawienia `complete`; dla dni już zaliczonych `plan := done`. Źródłem prawdy o zaliczeniu zostaje `complete` |
| `days[k].updatedAt` | dopisywane przy zapisie dnia |
| `assessments[]` bez `excerpt`, z `promptVersion` | wycinek transkryptu usuwany przy migracji |
| pola B15 (przełączniki w dzienniku) | płasko w dniu, tak jak `field` z zaakceptowanej specyfikacji B14 |
| kopia `plynnosc.bak` | jedna, robiona przed migracją i przy błędzie parsowania; kasowana po 14 dniach i przez „Usuń dane” |

Eksport = stan bez `ocenaDraft` i bez `lastAnswer`. Ten format jest kontraktem, który przetrwa przepisanie na produkt, więc jest ważniejszy niż sam podział plików.

**Czego w tym HLD świadomie nie ma:**
- **silnika planu** (`enrollment`, `stageHistory`, kryteria jako dane) – brak kworum, a B13 jest już rozstrzygnięte w wersji bez silnika (pytanie tak/nie w karcie SR tygodnia, tydzień idzie z kalendarzem); silnik po przeglądzie M3;
- **`startDate` w stanie** – wycofane po rundzie 3: klucze dni to daty, a numer dnia liczy się od startu (`:281`), więc ruchomy start przenumerowałby przeszłość (streak `:1250`, mapa `:938–940`, dni SR `:782`). Wraca dopiero z produktem;
- **`programVersion`** – nikt go dziś nie podbija;
- **przebudowy stanu na klasy danych** – odrzucone (P14); zamiast tego tabela „pole → klasa danych” w wiki.

## Wynik głosowania

| # | Propozycja | Głosy | Wynik po rundzie 3 |
| --- | --- | --- | --- |
| P1 | Import danych przez sanitizery, kopia przed migracją, widoczny błąd zapisu, przypomnienie o kopii | 4/4 | **Przyjęte.** Import przez „wklej”; jedna kopia `.bak` z terminem życia, także przy błędzie parsowania; eksport bez szkicu transkryptu |
| P2 | Siatka na wyjątki z przyciskiem „Kopiuj dane” | 4/4 | **Przyjęte.** Obsługa błędów niczego nie wysyła ani nie zapisuje treści |
| P3 | Wake Lock z wykrywaniem wsparcia i wskazówką zastępczą | 4/4 | **Przyjęte.** Najpierw test na iPhonie; blokadę ponawiać po powrocie na kartę |
| P4 | Podział: etap 1 `styles.css` + `data.js` + `app.js`; etap 2 `domain.js` + `store.js`; bez `map.js` | 4/4 etap 1, 3/4 etap 2 | **Przyjęte.** Y: etap 2 dopiero po M3 |
| P5 | Test spójności danych (każde ćwiczenie dni 1–85 ma komplet wpisów; `HIER.length === 10`) | 4/4 | **Przyjęte** |
| P6 | Testy `node:test` dla `domain.js`/`store.js`, wstrzykiwany zegar | 3/4 | **Przyjęte, wymaga zgody Alka (C6):** zmienia definicję „zielone” w `CLAUDE.md`. Y przeciw: drugi harness |
| P7 | Jeden obiekt stanu widoku, jedna ścieżka zaliczenia, kontrakt ćwiczenia | 3/4 | **Przyjęte na po M3.** Do tego czasu nie dodajemy szóstej ścieżki zaliczenia. Y: decyzja na przeglądzie M3 |
| P8 | `startDate` w stanie, migawka `plan` + `programVersion`, stabilne id ćwiczeń | 3/4 | **Zawężone:** zostaje migawka `plan` i stabilne id. `startDate` i `programVersion` wycofane |
| P9 | Pełny silnik planu przed tygodniami 4–6 | 2/4 | **Nie przechodzi.** Zgodne z B13 i B12: silnik po przeglądzie M3 |
| P10 | Parametry ćwiczeń w `data.js`; dane osobiste poza publikowanym kodem | 4/4 co do dziennika | **Zawężone (C5):** teraz znikają domyślny wpis dziennika i zdanie o rodzinie; reszta danych Alka w oznaczonym bloku `PROFILE`. Parametry przenosimy przy treści tygodni 4–6 |
| P11 | R4 i R5; cienki adapter AI z `promptVersion` | 4/4 R4/R5, 3/4 adapter | **Przyjęte.** Pole „O czym” domyślnie poza promptem. Y: adapter zbędny, B19 i tak go przepisze |
| P12 | Prompt bez wnioskowania o osobie, etykieta „informacja zwrotna, nie ocena kliniczna” | 4/4 | **Przyjęte, czeka na akceptację Alka (C3)** – to zmiana treści |
| P13 | Oceny bez wycinka transkryptu, przycisk „Usuń dane”, termin ważności szkicu | 4/4 wycinek i „Usuń dane”, 3/4 termin | **Przyjęte.** „Usuń dane” dwuetapowo; kasuje też `.bak` i stary klucz `plynnosc-dzien-01`; razem z R8, inaczej `importDay1` odtworzy dzień 1 z zaszytymi wartościami (`:344`, `:357–360`). Y przeciw automatycznemu kasowaniu |
| P14 | Stan przebudowany na klasy danych | 1/4 w tej formie | **Odrzucone.** Tabela „pole → klasa” w wiki i `updatedAt` w dniu |
| P15 | Dostępność: kontrast chipów SR i fokusu, `aria-live`, zagnieżdżony przycisk | 4/4 kontrast SR, 3/4 reszta | **Przyjęte.** Kontrast SR przy pierwszej okazji, reszta w M1 |
| P16 | Granica „ewoluujemy PoC” vs „piszemy produkt od nowa” | 4/4 | **Przyjęte**, treść niżej |
| P17 | Lista „świadomie nie teraz” | 4/4 | **Przyjęte**, treść niżej |
| P18 | Pełna pętla tester + recenzent tylko dla zmian ryzykownych | 4/4 | **Przyjęte**, uzgodnione z B29, treść niżej |

### P16 – kiedy ewoluujemy, a kiedy piszemy od nowa
Ewoluujemy PoC, dopóki prawdziwe jest wszystko: runtime to artefakt claude.ai, jeden użytkownik, jedno urządzenie, wejście tekstowe.

Piszemy produkt od nowa przy pierwszym z tych zdarzeń:
- mikrofon albo audio do modelu (B19),
- pierwszy użytkownik inny niż Alek, w tym logopeda w aplikacji (08),
- drugie urządzenie albo konta i synchronizacja,
- aplikacja poza artefaktem (PWA lub natywna).

Przed pierwszym obcym użytkownikiem: pisemne przeznaczenie, notatka kwalifikacyjna MDR i ocena skutków dla ochrony danych, po konsultacji prawnej. To nie jest porada prawna.

Przepisanie przetrwają: treść (`data.js` i [[Program płynności]]), `domain.js` z testami, kształt danych i format eksportu, scenariusze z harnessu i specyfikacje z `wiki/specs/` jako kryteria akceptacji, maszyna stanów timera jako specyfikacja, [[Decision log]]. Wyrzucamy: DOM, mapę SVG, wiązanie z `claude.use`.

Przed przeglądem M3: jednodniowy test mikrofonu na iPhonie poza artefaktem, bez zapisywania audio. Ocena z dźwięku w artefakcie na iPhonie jest niewykonalna: `sample` nie przyjmuje audio, a `dictation` nie działa w Safari ani w aplikacji mobilnej (potwierdzone przez dwóch agentów).

**Decyzje jednokierunkowe** (drogie do odwrócenia): id ćwiczeń i format eksportu; gdzie fizycznie leżą dane o zdrowiu; czy zbieramy surowe audio i jak długo; deklarowane przeznaczenie produktu; data startu programu. Reszta jest odwracalna: framework, IndexedDB, dostawca AI, hosting, wygląd mapy.

### P17 – świadomie nie teraz
| Nie robimy | Sygnał, żeby wrócić |
| --- | --- |
| Framework, TypeScript, bundler, CI, linter | drugi człowiek w repo albo regresja, która dwa razy przeszła bramkę |
| IndexedDB | bloby audio albo stan powyżej ok. 2 MB |
| Backend, konta, synchronizacja, CRDT | drugie urządzenie albo drugi użytkownik |
| Capability `db` artefaktu | tylko po świadomej zgodzie Alka: dane o zdrowiu trafiłyby do Anthropic |
| Eksport do pliku (capability `downloads`) | gdy kopiuj/wklej przestanie wystarczać; publikacja musiałaby podać `sample` i `downloads` razem |
| Biblioteka reguł, event sourcing, biblioteka walidacji schematu | kryteria pisze logopeda albo pojawia się synchronizacja |
| Telemetria, wysyłka audio | nigdy w PoC |

### P18 – proces
Zgodnie z B29 pozycje rozmiaru L (stan i migracje, import/eksport i retencja, timer, logika dnia, ocena i prompt) mają **spec w `wiki/specs/` zaakceptowany przez Alka przed kodem**, a potem pełną pętlę budowniczy → tester → recenzent. Kworum dodaje jedno: treść i wygląd (S/M) idą ścieżką budowniczy plus bramka harnessu, bez pełnej pętli. Treść medyczna zawsze po akceptacji Alka.

## Jak to wchodzi w plan
Kolejność po rundzie 3: B14 ma termin 13.11 i dotyka tego samego pliku, więc nic z kworum nie wchodzi przed nim. Żadna pozycja pakietu bezpieczeństwa nie chroni przed ryzykiem, które powstaje przed 14.11, bo B14 nie zmienia wersji stanu.

| Kiedy | Co | Uwagi |
| --- | --- | --- |
| **Do 13.11** | Tylko B14 wg zaakceptowanej specyfikacji. Alek: ręcznie „Kopiuj dane” do zablokowanej notatki; test Wake Lock i trwałości danych na osobnym, pustym artefakcie (C4) | zero kodu z kworum |
| **M0, do 15.11** | P4 etap 1 (czysty przerzut na `styles.css` + `data.js` + `app.js`) + P5 + `?v=N` | jedna runda; od tej chwili okno A może zmieniać treść i style |
| **M1, do 21.11** | **Pakiet bezpieczeństwa** jako jedna pozycja L ze specem: P1, P2, P3, R4, R5, kontrast SR, usunięcie domyślnego dziennika i zdania o rodzinie. P12 po akceptacji C3 | zastępuje w planie osobne „#15 eksport” i „Wake Lock” |
| **M1, razem z B15** | Migracja v3 (tabela wyżej) + P13 + R8 w specyfikacji B15 | jedna migracja, nie dwie |
| **Po treści tygodni 4–6 albo wcześniej, jeśli M1 ma zapas** | P4 etap 2 (`domain.js`, `store.js`) + P6 + cienki `ai.js` + reszta P15 + R6 | pierwsze do przesunięcia; nie blokuje 28.11, bo `complete` już chroni zaliczone dni |
| **Przy treści tygodni 4–6** | Parametry ćwiczeń do `data.js` (P10) | w ramach treści |
| **Przegląd M3** | P7; test mikrofonu; decyzja „ewoluujemy czy od nowa” wg P16 | — |

## Co zmieniła runda grill
| Zarzut | Rozstrzygnięcie |
| --- | --- |
| Kworum czytało `main`, a `develop` ma nowsze decyzje (B13, B29, spec B14) | Dokument przeniesiony na `develop`; P8, P9, P18 i harmonogram przepisane |
| „Pakiet bezpieczeństwa przed 14.11” koliduje z B14 (ten sam plik, ten sam termin) | Pakiet przeniesiony do M1, po podziale pliku |
| Schemat v3 pomijał pola, które kod czyta (`baseline`, `base`, `body`, `archDone`, `note`), i nie miał reguły dla dni już zaliczonych | v3 opisane jako lista dopisków; `plan := done` dla starych dni; `complete` zostaje źródłem prawdy |
| `startDate` przenumerowałby przeszłość | Wycofane |
| „Zero danych osobistych w `data.js`” jest niewykonalne: etykiety hierarchii rysują się ze stałej (`:1505`), a spec B14 sam używa imienia | Blok `PROFILE` w `data.js`; teraz usuwamy tylko domyślny dziennik i zdanie o rodzinie |
| Kopia `.bak` zachowałaby wycinki transkryptów, które v3 usuwa; „Usuń dane” bez R8 odtworzy dzień 1 | Termin życia kopii; R8 razem z P13 |
| „Format eksportu = format stanu” kontra „szkic poza eksportem” | Eksport = stan bez `ocenaDraft` i `lastAnswer` |
| Liczniki B14 „w docelowym miejscu `facts`” sprzeczne z zaakceptowaną specyfikacją (`field` płasko) | `facts` wycofane; spec B14 zostaje bez zmian |
| Brak odpowiedzi na: pamięć podręczna po publikacji, ładowanie `domain.js` w Node, zmiana definicji „zielone”, zderzenie adaptera z #13 | Dopisane w „Szczegóły wykonawcze” i C6 |

Obroniło się po sprawdzeniu w repo: wszystkie cytowane linie; brak Wake Lock i siatki błędów; R4 i R5 nadal otwarte; usunięcie domyślnego dziennika nie skasuje wpisu Alkowi (wartość domyślna działa tylko przy braku `days[DAY1]`, `:344`); kontrast `#e0a100` na białym to dokładnie 2,27:1; capability `downloads` istnieje.

Cytaty w odpowiedzi modelu zostają w `assessments[].result`, bo prompt ich wymaga (`:1289`). Ryzyko 5 po zmianach maleje, nie znika.

## Rzeczy niesprawdzone i fakty do uporządkowania
- **Nikt nie sprawdził na telefonie**, czy localStorage artefaktu przeżywa tydzień bez użycia ani czy Wake Lock jest dozwolony w ramce. To największy pozostały znak zapytania (C4).
- **Ustawienia konta claude.ai.** Przy włączonej zgodzie na trening modeli dane z „Oceń” mogą być przechowywane znacznie dłużej. Aktualność warunków do sprawdzenia w ustawieniach prywatności (C7).
- **Na origin nie ma żadnego tagu**, choć `Start.md` i [[Git i gałęzie]] mówią o tagu `v4` (sprawdzone `git ls-remote`). Jest też sześć gałęzi `feature/*`; żadna nie jest przodkiem `develop`, więc bez przejrzenia nie da się stwierdzić, które są zmergowane (C8).
- [[Publikacja (artefakt claude.ai)]] mówiła „brak download”; według dwóch agentów aktualny kontrakt ma `downloads`. Dopisana tam korekta.

## Źródła
- Trwałość danych w Safari: https://webkit.org/?p=14403, https://bugs.webkit.org/show_bug.cgi?id=237350, https://developer.mozilla.org/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- Wake Lock: https://developer.mozilla.org/docs/Web/API/Screen_Wake_Lock_API, https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy/screen-wake-lock
- XSS i DOM: https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html
- Dostępność: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html, https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- Testy: https://playwright.dev/docs/api/class-page#page-wait-for-timeout
- Architektura: https://martinfowler.com/bliki/SacrificialArchitecture.html, https://martinfowler.com/bliki/Yagni.html, https://alistair.cockburn.us/hexagonal-architecture/, https://inkandswitch.com/local-first/, https://firt.dev/notes/pwa-ios/
- Regulacje: MDCG 2019-11 rev.1 https://health.ec.europa.eu/latest-updates/update-mdcg-2019-11-rev1-qualification-and-classification-software-regulation-eu-2017745-and-2025-06-17_en, EDPB 02/2021 https://www.edpb.europa.eu/system/files/2021-03/edpb_guidelines_022021_virtual_voice_assistants_adopted-public-consultation_en.pdf
- Rozpoznawanie mowy a niepłynności: https://arxiv.org/pdf/2311.00867, https://www.isca-archive.org/interspeech_2025/sridhar25_interspeech.html, https://arxiv.org/abs/2102.12394, https://github.com/nyrahealth/CrisperWhisper
