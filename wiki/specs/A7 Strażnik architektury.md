---
status: zaakceptowany
id: A7
hld: F→wszystkie
decyzja: C9
budżet: 1 runda
updated: 2026-11-11
---

# A7 Strażnik architektury

Zaakceptowane przez Alka 11.11 (C10). Wdrożenie razem z etapem E1.

## 1. Cel i moduł HLD
Dwa okna same otwierają i scalają PR, a Alek nie czyta kodu. Bez stałej kontroli kod rozrasta się i gubi granice przyjęte w C1. Strażnik sprawdza przy każdym PR, czy kod trzyma się [[Zasady architektury]]; testów i działania funkcji nie dotyka. Fundament dla wszystkich modułów [[HLD v1]]; decyzja C9 w [[Decision log]] (wyjątek od A3 „bez CI”).

## 2. Zakres
- Wchodzi:
  - **Warstwa S (skrypt):** `test/arch.js`, bez zależności, sprawdza zasady oznaczone „S”. Uruchamiany lokalnie razem z harnessem i w GitHub Actions przy PR.
  - **Warstwa R (recenzent, inny model):** przegląd PR przez Codex wpięty w GitHuba, sterowany plikiem `AGENTS.md`, który odsyła do [[Zasady architektury]].
- Poza zakresem (no-go):
  - Playwright i jakiekolwiek testy funkcji w CI.
  - Lintery, formatowanie, pokrycie testami, blokada scalania (branch protection).
  - Klucz API i sekrety w repo. Codex działa przez integrację konta, skrypt nie potrzebuje tokenu.
  - Automatyczne poprawianie kodu przez recenzenta.
- Budżet: 1 runda, razem z PR podziału pliku (etap E1 w [[Architektura aplikacji]]). Jeśli się nie mieści – tniemy liczbę reguł w skrypcie, nie termin.

## 3. Zachowanie (kryteria akceptacji)
| # | Gdy … | Wtedy … |
| --- | --- | --- |
| 1 | PR zmienia coś w `app/` i trzyma się zasad | workflow „Architektura” jest zielony w mniej niż minutę i wypisuje liczbę linii każdego pliku w `app/` oraz sumę |
| 2 | PR dodaje `localStorage` poza `store.js` (po wygaśnięciu wyjątku) | workflow jest czerwony, w logu jest `app/<plik>:<linia> Z2` |
| 3 | PR dodaje nowy plik w `app/`, którego nie ma na liście Z1 | workflow jest czerwony z `Z1` i nazwą pliku |
| 4 | PR dodaje `fetch(` albo zewnętrzny adres w `index.html` | workflow jest czerwony z `Z6` |
| 5 | PR zmienia tylko `wiki/` albo `00 Start/` | workflow się nie uruchamia |
| 6 | `node test/arch.js` uruchomiony lokalnie | ten sam wynik co w Actions; kod wyjścia 0 albo 1 |
| 7 | PR do `develop` zmienia `app/` | Codex dodaje przegląd po polsku: naruszenia z numerem zasady, plikiem, linią i najmniejszą poprawką, albo jedno zdanie „Zgodne z zasadami architektury” |
| 8 | PR dodaje abstrakcję bez użytkownika w tym samym PR | Codex zgłasza Z0 |
| 9 | Przegląd Codex jest niedostępny (plan, awaria) | okno, które otworzyło PR, uruchamia recenzenta w sesji z tym samym plikiem zasad i zapisuje to w opisie PR |
| 10 | Wyjątek z datą ważności wygasa (etap E2, E4) | PR danego etapu usuwa go jednocześnie ze skryptu i z [[Zasady architektury]] |

## 4. Dane i stan
Nie dotyczy stanu aplikacji. Skrypt czyta tylko pliki w `app/`.

Budowa skryptu (cel: około 60 linii):
- tablica reguł `{id, wzorzec, pliki dozwolone}` i tablica wyjątków `{id, plik, wygasa}`, obie na górze pliku;
- pomija linie będące komentarzem;
- wypisuje `plik:linia Zn krótki opis` dla każdego trafienia i na końcu liczbę linii na plik;
- kod wyjścia 1 przy jakimkolwiek naruszeniu.

Workflow `.github/workflows/architektura.yml` (całość):
```yaml
name: Architektura
on:
  pull_request:
    paths: ['app/**', 'test/arch.js', '.github/workflows/architektura.yml']
jobs:
  zasady:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: node test/arch.js
```

## 5. Treść
Brak treści ćwiczeń. Teksty dla recenzenta są w `AGENTS.md` (sekcja „Code Review Rules” – tak nazywa ją aktualna dokumentacja Codex).

## 6. Zasady i ryzyka
- **Fałszywe alarmy skryptu.** Proste wzorce mogą trafić w napis albo nazwę zmiennej. Poprawiamy wzorzec; nie dodajemy parsera.
- **Recenzent proponuje rozbudowę.** `AGENTS.md` zakazuje propozycji „na przyszłość”; jeśli mimo to się pojawiają, zaostrzamy tekst.
- **Dwa pliki instrukcji.** `AGENTS.md` nie powtarza `CLAUDE.md`; zawiera tylko zasady przeglądu i odsyłacz.
- **Prywatność.** Podłączenie Codex daje OpenAI dostęp do całego prywatnego repo, także do vaulta. Decyzja Alka (C9); transkryptów w repo nie ma. `AGENTS.md` zabrania cytowania notatek osobistych w przeglądzie.
- **Przegląd jest doradczy.** Nie blokuje scalania. Okno, które otworzyło PR, odpowiada na każde zgłoszenie: poprawką albo jednym zdaniem, dlaczego nie.
- **Niesprawdzone:** czy plan ChatGPT Alka obejmuje przegląd PR w GitHubie i czy domyślnie pokazuje wszystkie zgłoszenia. Wyjdzie przy pierwszym PR; plan awaryjny to wiersz 9.

Kroki po stronie Alka (jednorazowo):
1. W ustawieniach Codex podłączyć GitHuba i repo `jestemalek1/plynnosc`.
2. W ustawieniach Codex wybrać to repo i włączyć „Automatic review” w części „Review code”; to samo w „Personal preferences” (tam też „Review trigger”).
3. Przy pierwszym PR sprawdzić, czy przegląd się pojawił; jeśli nie, napisać w PR komentarz `@codex review`.

Na GitHubie Codex publikuje tylko zgłoszenia P0 i P1, dlatego `AGENTS.md` każe zgłaszać każde naruszenie zasady jako P1.

Zmiany w dokumentach przy wdrożeniu:
- `CLAUDE.md`, zasada „Target, nie proces”: dopisać wyjątek „strażnik architektury (A7)”.
- `CLAUDE.md`, workflow krok 1: dopisać `node test/arch.js` do bramki.
- [[Testy]]: jedna linia o `test/arch.js`.
- [[Git i gałęzie]]: przed scaleniem PR odpowiedzieć na przegląd architektury.

## 7. Jak sprawdzone
(po wdrożeniu)
