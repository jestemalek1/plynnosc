---
status: propozycja
owner: Alek
updated: 2026-11-08
tags: [research, proces, planowanie, agenci]
---

# Planowanie pracy: HLD → LLD → backlog → agenci (research i propozycja)

Pytanie Alka (8.11): jak się podchodzi do rozwoju takiej aplikacji, jak mają wyglądać backlog, HLD, LLD i specyfikacje dla agentów, i którego modułu LLD robić teraz. Decyzje: B29, B30 w [[Decyzje do podjęcia]].

## Co mówią źródła (skrót)
1. **Warstwy dokumentów.** W typowym układzie:
   - wizja i HLD mówią, *co* powstaje i *po co* (moduły);
   - mapa historii użytkownika (story map) układa ścieżkę użytkownika i tnie ją na wydania;
   - LLD/spec mówi, *jak dokładnie* działa konkretna funkcja;
   - decyzje zapisuje się jako ADR (u nas [[Decision log]]);
   - zadania wynikają ze specyfikacji.
   Patton: uporządkowany backlog dobrze mówi, co zrobić *teraz*, ale słabo pokazuje, czym ma być cały system. Do tego służy mapa ([Agile Alliance – story map](https://agilealliance.org/glossary/story-map)).
2. **Najpierw szkielet (walking skeleton).** Pierwsze wydanie to najcieńsza wersja, która przechodzi przez *całą* ścieżkę użytkownika. Kolejne wydania tną mapę poziomo: teraz / następne / później.
3. **Budżet zamiast estymaty (Shape Up).** Najpierw ustalasz, ile czasu jesteś gotów dać (appetite), a potem dopasowujesz zakres. Termin jest stały, zakres zmienny. „Pitch” zawiera problem, budżet, szkic rozwiązania, pułapki i to, czego nie robimy ([Basecamp, rozdz. 3](https://basecamp.com/shapeup/1.2-chapter-03), [podsumowanie](https://umbrex.com/resources/frameworks/product-management-frameworks/shape-up-method/)).
4. **Spec-driven development z agentami AI.** Narzędzia:
   - GitHub Spec Kit: constitution → spec → plan → tasks;
   - Kiro: requirements → design → tasks;
   - Tessl: spec jako źródło kodu.

   Böckeler (Thoughtworks) wyróżnia trzy poziomy: spec-first, spec-anchored i spec-as-source. Zauważa dwie rzeczy: Spec Kit jest nieproporcjonalnie rozwlekły przy małych zadaniach (drobny błąd zamienia się w 16 kryteriów akceptacji), a specyfikacje, które nie są związane z kodem, szybko się dezaktualizują ([Fowler/Böckeler](https://www.martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html), [zestawienie narzędzi](https://ssojet.com/blog/best-spec-driven-development-tools)). Wniosek: brać *format*, nie narzędzie. Jest to zgodne z CLAUDE.md, który zakazuje Spec Kitu, dopóki nie zaboli.
5. **Praca z Claude Code.** Oficjalne zalecenia:
   - kolejność explore → plan → code → commit;
   - tryb planowania jest tylko do odczytu, oddziela rozpoznanie od wykonania;
   - główne ograniczenie to okno kontekstu, które szybko się zapełnia;
   - przerośnięty CLAUDE.md sprawia, że agent ignoruje instrukcje.

   Krótki plik ze specyfikacją, który agent czyta przed kodem, dobrze pasuje do tego modelu ([Claude Code – best practices](https://code.claude.com/docs/en/best-practices)).
6. **Wyroby medyczne (na przyszłość).** IEC 62304 wymaga śledzenia powiązań: potrzeba → wymaganie → projekt → implementacja → weryfikacja. Głębokość zależy od klasy oprogramowania (A/B/C). Dla małych zespołów źródła radzą trzymać ślad w zwykłym przepływie pracy, np. w PR wypisywać identyfikatory wymagań, zamiast odtwarzać go po fakcie ([DQS](https://www.dqsglobal.com/en/explore/blog/iec62304-traceability-framework), [Sii](https://sii.pl/blog/en/the-importance-of-traceability-from-the-perspective-of-designing-a-medical-device-software/), [DEV](https://dev.to/rank_alchemy_5ad282cec75d/how-to-implement-iec-62304-in-a-modern-devops-pipeline-traceability-soup-risk-controls-and-10fb)). To głównie blogi firm doradczych, a nie sama norma. Przed produktem trzeba sprawdzić normę.

## Propozycja dla nas: „lekki spec” zamiast pełnego LLD
**1. Nie piszemy LLD modułami z góry.** 01, 03, 07 i B19 są odłożone (B12). Ich LLD napisane dziś zdezaktualizuje się, zanim powstanie kod. LLD modułu rośnie od dołu: to suma specyfikacji jego wdrożonych funkcji (poziom spec-anchored, najlżejszy).

**2. Spec funkcji dla pozycji rozmiaru L.** L to to, co CLAUDE.md nazywa „większą funkcją”: logika dnia lub tygodnia, stan, timer, mapa, ocena. Jeden plik `wiki/specs/<ID> <nazwa>.md`, maksymalnie 1–2 strony:

| Sekcja | Treść | Kto korzysta |
| --- | --- | --- |
| 1. Cel i moduł HLD | problem z treningu, link do modułu, decyzja (np. B14) | Alek |
| 2. Zakres / poza zakresem | co wchodzi, czego nie robimy (no-go), budżet w rundach | Alek, budowniczy |
| 3. Zachowanie | 5–10 scenariuszy „Gdy … wtedy …”; to są kryteria akceptacji | tester (dostaje je zamiast twierdzeń budowniczego) |
| 4. Dane i stan | pola, migracja, wpływ na zaliczenie dnia i streak | budowniczy, recenzent |
| 5. Treść | instrukcje „Co robisz / Jak to ma brzmieć / Czego nie robić / Dlaczego”, źródło w programie | Alek akceptuje |
| 6. Zasady i ryzyka | skala, prywatność, granice medyczne (HLD §6) | recenzent |
| 7. Jak sprawdzone | uzupełniane po wdrożeniu: harness, wynik testera, wersja | historia, przyszły ślad 62304 |

Status pliku: `szkic` → `zaakceptowany` (Alek) → `wdrożony (vN)`.

**3. Rozmiary w backlogu zamiast estymat.**
- **S** = `fix/*`: jedna linia w backlogu i CHANGELOG, bez specyfikacji.
- **M** = jedna runda: krótki opis w backlogu.
- **L** = spec + tester + recenzent, z budżetem w rundach. Jeśli zakres się nie mieści, tniemy zakres, a nie przesuwamy termin.

Backlog dostaje kolumny „Rozmiar” i „Spec”.

**4. Mapa ścieżki jako jedna tabela w [[Plan działania]].** W poziomie pętla z HLD: ocena → plan → ćwiczenia → transfer → pomiar → aktualizacja → utrzymanie. Pod każdym krokiem funkcje n=1, a linie cięcia to kamienie M0–M4. Pozwala sprawdzić, czy każdy kamień przesuwa *całą* pętlę, a nie tylko jeden ekran.

**5. Agenci.**
- Budowniczy: czyta spec → tryb planowania → plan → kod.
- Tester dostaje sekcję 3, recenzent sekcje 4 i 6.
- CLAUDE.md zostaje krótki i tylko wskazuje `wiki/specs/`.

**6. Ślad bez macierzy.** ID w backlogu = ID specyfikacji = nazwa gałęzi = wpis w CHANGELOG, plus moduł HLD. Wystarczy, żeby kiedyś odtworzyć ślad wymagany przez 62304, i nic nie kosztuje dziś.

## Którego modułu LLD teraz
Żadnego modułu w całości. **Pierwszy spec: B14 „Zadanie w terenie” (moduł 05).** Powody:
- to najbliższy kod, potrzebny przed 14.11;
- dotyka zaliczenia dnia, a to klasa błędów R1;
- treść kart tygodni 2–3 i tak wymaga Twojej akceptacji.

Potem B15 (06, mały), a potem największy: T4–6 z nowym typem ćwiczenia „cykl Camperdown” (02/04: nagranie, poziom techniki, eksperyment). A5 (podział pliku) nie potrzebuje specyfikacji, bo to refaktor; wystarczy [[Architektura aplikacji]].

## Czego nie robimy
Nie robimy Spec Kitu ani Kiro, macierzy śledzenia, LLD modułów odłożonych ani specyfikacji dla poprawek S. Wracamy do tematu, gdy pojawi się drugi deweloper, produkt albo klasyfikacja jako wyrób medyczny.
