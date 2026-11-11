---
status: propozycja
owner: Alek
updated: 2026-11-11
tags: [architektura, hld, kworum, recenzja]
---

# HLD PoC – wynik kworum agentów (11.11.2026)

Pytanie Alka: czy kod aplikacji jest pisany zgodnie z najlepszymi praktykami dla takich rozwiązań i jaki HLD proponujemy dla PoC, wiedząc, że ma on urosnąć do produktu z [[HLD v1]].

Stan: **propozycja**. Nic tu nie jest decyzją, dopóki Alek nie odhaczy pozycji w [[Decyzje do podjęcia]] (sekcja C). Kod aplikacji nie był zmieniany.

## Jak to powstało
1. **Runda 1 – cztery niezależne raporty** (agenci nie znali nawzajem swoich wniosków, pracowali tylko do odczytu na v4, `main` @ bcea4ae):
   - **K** – jakość kodu względem dobrych praktyk dla małej aplikacji vanilla JS,
   - **A** – architektura i droga PoC → produkt,
   - **D** – dane zdrowotne, prywatność, regulacje, tor oceny mowy,
   - **Y** – adwokat prostoty (gdzie dobre praktyki to nadinżynieria przy jednym użytkowniku).
2. **Runda 2 – głosowanie.** Raporty scalono w 18 propozycji (P1–P18); każdy agent głosował: za / przeciw / za z poprawką.
3. **Runda 3 – „grill me”.** Piąty agent, który nie znał dyskusji, przepytał wynik. Jego pytania i odpowiedzi są na końcu.

Próg: propozycja przechodzi przy co najmniej 3 głosach z 4. Głos odrębny jest zawsze zapisany.

## Odpowiedź w skrócie
**Na etap PoC z jednym użytkownikiem kod jest wystarczająco dobry i w kilku miejscach lepszy niż typowy prototyp.** Nie jest natomiast zgodny z dobrymi praktykami w trzech obszarach, które realnie zagrażają treningowi albo prywatności, i w jednym, który utrudni drogę do produktu.

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

**Co jest zrobione dobrze i czego nie wolno zepsuć przy zmianach:** bezpieczne budowanie DOM, `load()`/`sanitizeDay` naprawiające dane, lepka flaga `complete` z idempotentną migracją, zapis z opóźnieniem plus `pagehide`/`visibilitychange`, timer liczony od `Date.now()`, daty w czasie lokalnym, jedna skala `SRPicker`, harness z bramką.

**Z recenzji v3 naprawiono R1, R2, R3.** Otwarte zostały R4, R5, R6, R8, R9, R11; R7 częściowo.

## Największe ryzyka (zgodne u wszystkich czterech)
1. **Dane w jednej kopii, której nie da się przywrócić.** „Kopiuj dane” istnieje (`app/index.html:1515`), importu nie ma. `saveNow` połyka błąd zapisu (`:382`). Migracja nadpisuje oryginał bez kopii (`:345`, `:392`). Safari może skasować dane strony po 7 dniach bez interakcji.
2. **Gasnący ekran w trakcie ćwiczenia.** Brak Wake Lock; po wygaszeniu sygnały timera przepadają. Nie wiadomo, czy Wake Lock w ogóle działa w ramce artefaktu na iPhonie – trzeba sprawdzić na telefonie.
3. **Pusty albo połowiczny ekran w trakcie sesji.** Brak `window.onerror`/`unhandledrejection`; wywołania `BUILD[ex]`, `EX_META[ex]`, `INS[id]` zakładają spójność danych, a tygodnie 4–12 będą dopisywane przez dwa okna.
4. **Prompt oceny łamie własne zasady projektu.** Sekcja „co mówca ujawnia o sobie” (`:1293`) jest sprzeczna z `CLAUDE.md` („nie etykietujemy emocji”) i z B17/B20. UI nazywa to „oceną”, bez zastrzeżenia, że to informacja zwrotna z transkryptu, która nie widzi bloków.
5. **Transkrypt zostaje na stałe.** `ocenaDraft.text` trzyma pełny transkrypt bez terminu (`:1354`), oceny przechowują wycinek i odpowiedź z cytatami (`:1392`), a „Kopiuj dane” wkłada to wszystko do schowka.
6. **Dane osobiste w publikowanym kodzie.** Wywiad rodzinny (`:1554`), domyślny wpis dziennika (`:364–365`), hierarchia sytuacji (`:299–304`), data startu (`:280`).

## Proponowany HLD dla PoC
Zasada: zostajemy przy Opcji A (klasyczne `<script src>`, bez frameworka i bundlera). Zmienia się tylko to, **gdzie przebiegają granice**: oddzielamy to, co przejdzie do produktu (treść, logika dnia, kształt danych), od tego, co zostanie wyrzucone (DOM, mapa SVG, wiązanie z artefaktem).

```
index.html ── styles.css
   │
   ├─ data.js     TREŚĆ: ćwiczenia, instrukcje, tygodnie, tematy, parametry ćwiczeń      → moduł 02 (Biblioteka)
   │              zero logiki, zero danych osobistych
   ├─ domain.js   LOGIKA BEZ DOM: daty, plan dnia, zaliczenie, streak, metryki tekstu,
   │              sanitize, lista migracji; zegar wstrzykiwany (today())                  → testy node:test
   ├─ store.js    JEDYNY dostęp do localStorage: load / save / migrate (+ kopia przed) /
   │              export / import / usuń dane / sygnał błędu zapisu
   ├─ ai.js       cienki adapter: assess(payload) → {text, promptVersion};
   │              ścieżki: sample (tylko z kliknięcia) albo „kopiuj prompt”
   └─ app.js      UI: ekrany, Timer, SRPicker, mapa (zostaje tutaj), Wake Lock, siatka błędów
```

**Zmiana względem planu z [[Architektura aplikacji]]:** `map.js` z wstrzykiwanym `ctx` (kilkanaście zależności dla jednego konsumenta) wypada (4/4). W jego miejsce wchodzą `domain.js` i `store.js`, bo to jedyne części kodu, które da się przenieść do produktu i przetestować poza przeglądarką.

**Stan, wersja 3** (jedna migracja, nie trzy osobne):
```
{ v: 3,
  startDate: 'YYYY-MM-DD',                      // zamiast stałej DAY1 w kodzie
  days: { 'YYYY-MM-DD': { plan:[exId], programVersion, done, reps, monolog, sr, tension, diary,
                          facts:{…},             // liczniki B14/B15 od razu w docelowym miejscu
                          complete } },
  hierarchy:[10 × SR],
  assessments:[{ date, lang, dur, metrics, sr, result, promptVersion }],   // bez wycinka transkryptu
  insSeen:{}, hierOpen,
  ocenaDraft:{}                                  // szkic; nie wchodzi do eksportu ani kopii
}
```
Format eksportu = format stanu. To jest kontrakt, który przetrwa przepisanie na produkt, więc jest ważniejszy niż sam podział plików.

**Czego w tym HLD świadomie nie ma:** silnika planu (`enrollment`, `stageHistory`, kryteria jako dane) – brak kworum, patrz P9; przebudowy stanu na klasy danych – odrzucone, patrz P14.

## Wynik głosowania

| # | Propozycja | Głosy | Wynik |
| --- | --- | --- | --- |
| P1 | Import danych przez sanitizery, kopia przed migracją, widoczny błąd zapisu, przypomnienie o kopii | 4/4 | **Przyjęte.** Poprawki: import przez „wklej” (plik później, patrz niżej); jedna kopia `.bak`; eksport bez szkicu transkryptu |
| P2 | Siatka na wyjątki z przyciskiem „Kopiuj dane” | 4/4 | **Przyjęte.** Obsługa błędów niczego nie wysyła ani nie zapisuje treści |
| P3 | Wake Lock z wykrywaniem wsparcia i wskazówką zastępczą | 4/4 | **Przyjęte.** Najpierw test na iPhonie w artefakcie; blokadę ponawiać po powrocie na kartę |
| P4 | Podział: etap 1 `styles.css` + `data.js` + `app.js`; etap 2 `domain.js` + `store.js`; bez `map.js` | 4/4 etap 1, 3/4 etap 2 | **Przyjęte.** Y: etap 2 dopiero po M3 |
| P5 | Test spójności danych (każde ćwiczenie dni 1–85 ma komplet wpisów; `HIER.length === 10`) | 4/4 | **Przyjęte** |
| P6 | Testy `node:test` dla `domain.js`/`store.js`, wstrzykiwany zegar | 3/4 | **Przyjęte.** Y przeciw: drugi harness |
| P7 | Jeden obiekt stanu widoku, jedna ścieżka zaliczenia, kontrakt ćwiczenia | 3/4 | **Przyjęte na po M3.** Do tego czasu zakaz dodawania szóstej ścieżki zaliczenia. Y przeciw: decyzja na przeglądzie M3 |
| P8 | `startDate` w stanie, migawka `plan` + `programVersion` w dniu, stabilne id ćwiczeń | 3/4 | **Przyjęte**, jako jedna migracja v3 po P1 i P6. Y przeciw: `complete` już wystarcza |
| P9 | Pełny silnik planu (`enrollment`, `stageHistory`, kryteria jako dane) przed tygodniami 4–6 | 2/4 | **Brak kworum.** K i Y przeciw: silnik z jedną regułą to spekulacja i moduł 03 tylnymi drzwiami (B12). Wraca przy decyzji B13 |
| P10 | Parametry ćwiczeń w `data.js`; dane osobiste poza publikowanym kodem | 4/4 co do danych osobistych | **Przyjęte w części.** Teksty osobiste wychodzą z kodu teraz; parametry przenosimy przy treści tygodni 4–6 |
| P11 | R4 i R5; cienki adapter AI z `promptVersion` | 4/4 R4/R5, 3/4 adapter | **Przyjęte.** Adapter bez parsera sekcji; pole „O czym” domyślnie poza promptem. Y: adapter zbędny, B19 i tak go przepisze |
| P12 | Prompt bez „co mówca ujawnia o sobie”, zakaz diagnoz i nazywania emocji, informacja o pomocy przy treściach kryzysowych, etykieta „informacja zwrotna, nie ocena kliniczna” | 4/4 | **Przyjęte, czeka na akceptację Alka** (zmiana treści) |
| P13 | Oceny bez wycinka transkryptu, przycisk „Usuń dane”, termin ważności szkicu | 4/4 wycinek i „Usuń dane”, 3/4 termin | **Przyjęte.** „Usuń dane” dwuetapowo, kasuje też `.bak` i stary klucz `plynnosc-dzien-01`. Y przeciw automatycznemu kasowaniu |
| P14 | Stan przebudowany na klasy danych (`content`/`profile`/`health`/`app`) | 1/4 w tej formie | **Odrzucone.** Zamiast tego: tabela „pole → klasa danych” w wiki i `updatedAt` w dniu |
| P15 | Dostępność: kontrast chipów SR i fokusu, `aria-live`, zagnieżdżony przycisk | 4/4 kontrast SR, 3/4 reszta | **Przyjęte.** Kontrast SR teraz, reszta w M1 |
| P16 | Granica „ewoluujemy PoC” vs „piszemy produkt od nowa” | 4/4 | **Przyjęte**, treść niżej |
| P17 | Lista „świadomie nie teraz” | 4/4 | **Przyjęte**, treść niżej |
| P18 | Pełna pętla tester + recenzent tylko dla zmian ryzykownych; porządek w gałęziach | 4/4 | **Przyjęte.** Zakres „ryzykownych” poszerzony, patrz niżej |

### P16 – kiedy ewoluujemy, a kiedy piszemy od nowa
Ewoluujemy PoC, dopóki prawdziwe jest wszystko: runtime to artefakt claude.ai, jeden użytkownik, jedno urządzenie, wejście tekstowe.

Piszemy produkt od nowa przy pierwszym z tych zdarzeń:
- mikrofon albo audio do modelu (B19),
- pierwszy użytkownik inny niż Alek, w tym logopeda w aplikacji (08),
- drugie urządzenie albo konta i synchronizacja,
- aplikacja poza artefaktem (PWA lub natywna).

Przed pierwszym obcym użytkownikiem: pisemne przeznaczenie, notatka kwalifikacyjna MDR i ocena skutków dla ochrony danych, po konsultacji prawnej. To nie jest porada prawna.

Przepisanie przetrwają: treść (`data.js` i [[Program płynności]]), `domain.js` z testami, kształt danych i format eksportu, scenariusze z harnessu jako kryteria akceptacji, maszyna stanów timera jako specyfikacja, [[Decision log]]. Wyrzucamy: DOM, mapę SVG, wiązanie z `claude.use`.

Przed przeglądem M3: jednodniowy test mikrofonu na iPhonie poza artefaktem, bez zapisywania audio. Według agenta A ocena z dźwięku w artefakcie na iPhonie jest niewykonalna (`sample` nie przyjmuje audio).

**Decyzje jednokierunkowe** (drogie do odwrócenia, podejmować świadomie): id ćwiczeń i format eksportu; gdzie fizycznie leżą dane o zdrowiu; czy zbieramy surowe audio i jak długo; deklarowane przeznaczenie produktu. Reszta jest odwracalna: framework, IndexedDB, dostawca AI, hosting, wygląd mapy.

### P17 – świadomie nie teraz
| Nie robimy | Sygnał, żeby wrócić |
| --- | --- |
| Framework, TypeScript, bundler, CI, linter | drugi człowiek w repo albo regresja, która dwa razy przeszła bramkę |
| IndexedDB | bloby audio albo stan powyżej ok. 2 MB |
| Backend, konta, synchronizacja, CRDT | drugie urządzenie albo drugi użytkownik |
| Capability `db` artefaktu | tylko po świadomej zgodzie Alka: dane o zdrowiu trafiłyby do Anthropic |
| Biblioteka reguł, event sourcing, biblioteka walidacji schematu | kryteria pisze logopeda albo pojawia się synchronizacja |
| Telemetria, wysyłka audio | nigdy w PoC |

### P18 – proces
Pełna pętla budowniczy → tester → recenzent tylko dla: stanu i migracji, importu/eksportu i retencji, timera, logiki dnia i planu, promptu i renderowania odpowiedzi modelu. Treść i wygląd: budowniczy plus bramka harnessu. Treść medyczna zawsze po akceptacji Alka.

Fakt z repo (sprawdzony `git ls-remote`): na origin są `main`, `develop` i sześć gałęzi `feature/*`, z których część jest po wydaniu v4 martwa. **Nie ma żadnego tagu**, choć [[Git i gałęzie]] i `Start.md` mówią o tagu `v4`.

## Jak to wchodzi w plan
Kolejność uwzględnia zastrzeżenie Y, że M1 jest już pełny, a trening wygrywa z kodem (B12).

| Kiedy | Co | Koszt |
| --- | --- | --- |
| **Teraz, przed 14.11** – „pakiet bezpieczeństwa” | Test na iPhonie: czy Wake Lock działa w artefakcie. P1 (import „wklej”, kopia przed migracją, toast błędu zapisu, przypomnienie o kopii), P2, P3, R4 i R5, kontrast chipów SR, usunięcie tekstów osobistych z kodu, P12 po akceptacji | kilka małych zmian, jedna runda z pełną pętlą (dotyka stanu) |
| **M0, do 15.11** | P4 etap 1 (czysty przerzut) + P5 | jedna runda |
| **M1, do 21.11** | P4 etap 2 + P6 + P8 jako jedna migracja v3, razem z polami B15; P13; cienki `ai.js`; reszta P15; R6 | 1–2 rundy |
| **Przy treści tygodni 4–6** | Parametry ćwiczeń do `data.js` (P10) | w ramach treści |
| **Przegląd M3** | P7; test mikrofonu; decyzja „ewoluujemy czy od nowa” wg P16 | — |

Jeśli M1 się nie zmieści, przesuwa się etap 2 z P6 i P8 (na po treści tygodni 4–6), nie pakiet bezpieczeństwa.

## Rozbieżności i rzeczy niesprawdzone
- **P9, silnik planu – 2/2.** A i D: struktura `enrollment` nie musi czekać na B13 i bez niej B13/B18 będą przepisaniem. K i Y: to moduł 03 przed czasem. Rekomendacja koordynatora: nie teraz. P8 daje `startDate` i migawkę planu, co wystarcza, żeby B13 obsłużyć małym polem; wracamy, gdy Alek rozstrzygnie B13.
- **Eksport do pliku.** Według agenta A aktualny kontrakt artefaktów ma capability `downloads`, wbrew zapisowi w [[Publikacja (artefakt claude.ai)]]. Wymagałoby to publikacji z deklaracją `sample` i `downloads` naraz, czyli zmiany reguły „bez `capabilities`” w `CLAUDE.md`. Niesprawdzone przez drugiego agenta; do potwierdzenia przy #15. Import i eksport przez „wklej/kopiuj” tego nie wymaga.
- **Nikt nie sprawdził na telefonie**, czy localStorage artefaktu przeżywa tydzień bez użycia ani czy Wake Lock jest dozwolony w ramce. Oba testy są po stronie Alka.
- **Ustawienia konta claude.ai.** D: przy włączonej zgodzie na trening modeli dane z `sample` mogą być przechowywane znacznie dłużej. Aktualność warunków do sprawdzenia w ustawieniach prywatności.
- **Dane o zdrowiu w samym repo** (`wiki/produkt/Kontekst i profil.md`). To świadomy wybór Alka; warto potwierdzić, że repo jest prywatne.
- Testów nie uruchamiał żaden z agentów (praca tylko do odczytu). Oceny opierają się na czytaniu kodu; K potwierdził `node --check` na wyciętym skrypcie.

## Źródła
- Trwałość danych w Safari: https://webkit.org/?p=14403, https://bugs.webkit.org/show_bug.cgi?id=237350, https://developer.mozilla.org/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- Wake Lock: https://developer.mozilla.org/docs/Web/API/Screen_Wake_Lock_API, https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy/screen-wake-lock
- XSS i DOM: https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html
- Dostępność: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html, https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- Testy: https://playwright.dev/docs/api/class-page#page-wait-for-timeout
- Architektura: https://martinfowler.com/bliki/SacrificialArchitecture.html, https://martinfowler.com/bliki/Yagni.html, https://alistair.cockburn.us/hexagonal-architecture/, https://inkandswitch.com/local-first/, https://firt.dev/notes/pwa-ios/
- Regulacje: MDCG 2019-11 rev.1 https://health.ec.europa.eu/latest-updates/update-mdcg-2019-11-rev1-qualification-and-classification-software-regulation-eu-2017745-and-2025-06-17_en, EDPB 02/2021 https://www.edpb.europa.eu/system/files/2021-03/edpb_guidelines_022021_virtual_voice_assistants_adopted-public-consultation_en.pdf
- Rozpoznawanie mowy a niepłynności: https://arxiv.org/pdf/2311.00867, https://www.isca-archive.org/interspeech_2025/sridhar25_interspeech.html, https://arxiv.org/abs/2102.12394, https://github.com/nyrahealth/CrisperWhisper
