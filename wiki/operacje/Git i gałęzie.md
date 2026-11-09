---
status: active
updated: 2026-11-08
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
5. Merge PR (squash) do `develop`, usuń gałąź.

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

## Bez GitHuba (awaryjnie)
Gałęzie i merge lokalnie tak samo, wydanie = merge do `main` + tag. Kopia: zip repo z historią.
