---
status: active
updated: 2026-11-12
tags: [operacje, git, gitflow]
---

# Git i gałęzie (gitflow, wersja lekka)

Repo: `jestemalek1/plynnosc` (prywatne). Jedno repo = vault + apka.

## Gałęzie
| Gałąź | Co na niej jest | Kto/skąd |
| --- | --- | --- |
| `main` | Dokładnie to, co jest opublikowane jako artefakt. Każdy commit na `main` = wydanie z tagiem `vN`. | tylko merge z `develop` (wydanie) albo z `hotfix/*` |
| `develop` | Zintegrowane, przetestowane zmiany czekające na wydanie. | merge z `feature/*` i `fix/*` |
| `feature/<krótko>` | Większa zmiana (nowe ćwiczenie, tydzień 4, eksport, podział plików). | z `develop`, jedna sprawa na gałąź |
| `fix/<krótko>` | Drobna poprawka z dogfoodingu (tekst, kolor, czas timera). | z `develop`, żyje godziny, nie dni |
| `hotfix/<krótko>` | Apka na produkcji przeszkadza w dzisiejszym treningu. | z `main`, merge do `main` i `develop` |

Nazwy po polsku bez ogonków, z myślnikami: `feature/eksport-danych`, `fix/legenda-sr-kolor`, `hotfix/timer-nie-startuje`.

## Cykl jednej zmiany
1. `git fetch origin && git checkout develop && git pull` → `git checkout -b feature/...`.
2. Zmiana + harness (`node test/run.js && node test/round2.js && node test/round3.js`) zielony.
3. Większa zmiana: niezależny tester + recenzent (osobni agenci) → poprawki.
4. Commit(y) z sensownym opisem po polsku → `git push -u origin feature/...` → PR do `develop` z opisem „co / dlaczego / jak sprawdzone”.
5. Od razu po otwarciu PR: subskrypcja i pętla poprawek (sekcja „Pętla PR”).
6. Merge PR (squash) do `develop` po spełnieniu warunków z „Pętli PR”, **od razu usuń gałąź zdalnie i lokalnie** (patrz „Sprzątanie”).

## Pętla PR: uwaga z przeglądu → poprawka → scalenie (decyzja C11)
Cel: poprawki po przeglądzie idą same, a Alek dostaje gotowy wynik albo jedno konkretne pytanie. Kto przegląda i co sprawdza: [[A7 Strażnik architektury]], [[Zasady architektury]].

1. **Subskrypcja zawsze.** Okno, które otworzyło PR, od razu subskrybuje jego aktywność (w sesji w chmurze: narzędzie `subscribe_pr_activity`), bez pytania Alka. Od tej chwili budzi je każdy komentarz z przeglądu i każdy wynik w Actions.
2. **Poprawka.** Na uwagę albo czerwony wynik okno: odtwarza problem, poprawia najmniejszą zmianą, puszcza harness (i `test/arch.js`, gdy istnieje), wypycha, odpowiada na uwagę jednym zdaniem.
3. **Okno może odmówić.** Uwaga sprzeczna z [[Zasady architektury]], z decyzją Alka albo proponująca rozbudowę „na przyszłość” dostaje odpowiedź „nie, bo …” i nie jest wprowadzana. Okno nigdy nie wyłącza, nie pomija ani nie osłabia sprawdzenia, żeby dostać zielone.
4. **Warunki samodzielnego scalenia** (wszystkie naraz):
   - harness zielony na ostatnim commicie;
   - workflow „Architektura” zielony (od etapu E1);
   - brak uwagi P1 z przeglądu bez odpowiedzi;
   - dla rozmiaru L: tester i recenzent ze specyfikacji zaliczeni.

   PR tylko z dokumentami scala się bez pętli, o ile nie zmienia zasad ani decyzji bez zgody Alka.
5. **Bezpiecznik: najwyżej 3 rundy poprawek na PR.** Po trzeciej okno staje i pisze Alkowi, co się nie spina i jaką decyzję rekomenduje.
6. **Okno czeka na Alka**, gdy: warunek z punktu 4 nie jest spełniony, uwaga wymaga decyzji produktowej albo zmiany zasady, albo PR dotyka treści medycznej bez akceptacji.
7. Po scaleniu: koniec subskrypcji i sprzątanie gałęzi.

Ograniczenia: pętla działa tylko w sesji w chmurze (sesji w lokalnym terminalu zdarzenia z GitHuba nie budzą). Jeśli przegląd Codex nie dociera jako zdarzenie albo jest niedostępny, okno przed scaleniem samo czyta komentarze w PR i, gdy przeglądu brak, uruchamia recenzenta w sesji z tym samym plikiem zasad.

## Wydanie (develop → main → artefakt)
1. Na `develop` harness zielony, `CHANGELOG.md` uzupełniony w sekcji nowej wersji.
2. PR `develop` → `main` o tytule „Wydanie vN”, merge (bez squash, żeby historia zgadzała się z `develop`).
3. `git tag vN && git push origin vN`.
4. Publikacja: narzędzie Artifact `read` na https://claude.ai/artifact/EUANdz59Df6hkaxVUsHR5P, potem `publish` z `app/index.html` (bez `capabilities`). Publikujemy **tylko z `main`**.
5. Krótki wpis w [[Decision log]] tylko jeśli wydanie zawiera decyzję. Sprawdzenie na telefonie.

Hotfix: `hotfix/*` z `main` → PR do `main` → tag `vN.1` → publikacja → merge `main` do `develop`.

## Zasady dla dwóch okien (sesji) naraz
- Każde okno pracuje na własnej gałęzi. Nigdy dwa okna na jednej gałęzi.
- Przed startem pracy i przed PR: `git fetch && git rebase origin/develop`.
- Publikuje tylko ten, kto robi wydanie z `main`; drugie okno w tym czasie nie publikuje.
- Pliki wspólne vaultu (`00 Start/Start.md`, [[Decision log]]): tylko dopisywanie na końcu sekcji, bez przepisywania cudzych fragmentów. Konflikty rozwiązuje się, zachowując oba wpisy.
- Dopóki apka jest jednym plikiem, oba okna mogą konfliktować w `app/index.html`. Dlatego pierwsze zadanie okna „Rozwój” to podział na pliki (patrz [[Plan działania]]).

## Sprzątanie (zawsze, bez pytania)
Alek nie chce starych gałęzi ani na GitHubie, ani lokalnie. Repo ma być czyste.
1. **Po każdym merge PR:** `git push origin --delete <gałąź>` i `git branch -D <gałąź>`.
2. **Na koniec każdej sesji:**
   - `git fetch --prune origin`;
   - `git branch -a`.

   Zdalnie zostają tylko `main`, `develop` i gałęzie z otwartym PR albo w aktywnej pracy drugiego okna (najwyżej jedna na okno). Lokalnie tylko `main`, `develop` i bieżąca gałąź.
3. **Zanim usuniesz:** sprawdź, czy zmiany są w `develop`:
   - PR zmergowany, albo
   - `git diff origin/develop origin/<gałąź> -- app test` jest pusty, a notatki są w `develop`.

   Niezmergowane zmiany: nie usuwasz, pytasz Alka.
4. **Bez gałęzi „na zapas”.** Przerwana praca to szkic PR (draft) z opisem stanu albo usunięcie, nie porzucony WIP.
5. **Na GitHubie** warto włączyć Settings → General → „Automatically delete head branches”. Wtedy gałąź znika sama po merge PR (krok 1 robi się sam).

## Bez GitHuba (awaryjnie)
Gałęzie i merge lokalnie tak samo, wydanie = merge do `main` + tag. Kopia: zip repo z historią.
