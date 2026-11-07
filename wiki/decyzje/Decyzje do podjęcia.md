---
status: active
owner: Alek
updated: 2026-11-07
tags: [decyzje, otwarte]
---

# Decyzje do podjęcia

Każda pozycja ma rekomendację i kroki. Odhaczasz `[x]`, dopisujesz jedną linię „Decyzja: …” i agent przy następnej sesji przenosi to do [[Decision log]]. Jeśli nie odhaczysz, agent działa wg rekomendacji tam, gdzie napisano „domyślnie”.

## A. Techniczne — wybrane przeze mnie, możesz zawetować

- [ ] **A1. Stack: Opcja A „Vanilla+”** (bez frameworka, bez bundlera; podział na `index.html` + `styles.css` + `data.js` + `app.js`). Domyślnie: TAK.
  Dlaczego: każdą zmianę robi agent w jednym przebiegu; Opcja B to 5–8 rund i build przy każdej zmianie. Szczegóły: [[Szablony UI – research i werdykt]], [[Architektura aplikacji]].
  Veto ma sens tylko, jeśli w 6 miesięcy planujesz wyraźnie więcej niż 8 ekranów.
- [ ] **A2. Jedno repo = vault Obsidiana + kod.** Domyślnie: TAK. (W Intradero było osobno, bo dwie osoby i wiele repo. Tu jedna osoba, jedna apka.)
- [ ] **A3. Jakość = harness Playwright, bez CI/linterów/Spec Kitu.** Domyślnie: TAK. Wracamy, gdy coś zacznie się psuć między sesjami.
- [ ] **A4. Runtime v1 = artefakt claude.ai** (bo tylko tam działa ocena przez Claude bez własnego backendu). Domyślnie: TAK. GitHub Pages dopiero, gdyby „Oceń z Claude” przestało być potrzebne w stronie.
- [ ] **A5. Pierwszy krok w kodzie: wydzielić treść do `data.js`** (zachęty, instrukcje, tematy, tygodnie), potem Wake Lock i własne modale. Domyślnie: TAK. Powód: tygodnie 4–12 to zmiany w treści, nie w logice — agent ma dotykać jednego pliku bez ryzyka.

## B. Biznesowe / produktowe — czekają na Ciebie

- [ ] **B1. Repo na GitHubie.** Rekomendacja: prywatne repo `jestemalek1/plynnosc`, push od razu. Powód: kopia poza sesją w chmurze, sesje Claude Code mogą startować z repo, historia zmian apki.
  Kroki: (1) github.com → New repository → `plynnosc`, Private, bez README. (2) W sesji Claude Code: „podłącz repo jestemalek1/plynnosc z prawem push i wypchnij `main`”. (3) Sprawdź, że `app/index.html` jest w repo. Alternatywa: zostawić zip z tej sesji jako kopię (słabsze).
- [ ] **B2. Specjalista — poniedziałek 10.11.** Rekomendacja: najpierw Fundacja FIKS (793 001 160, darmowa diagnoza, Camperdown online), Jankiewicz (509 812 667, 145 zł) jako plan B.
  Na rozmowę weź: [[Kontekst i profil]] (profil + dane bazowe), pytania: (a) czy program zintegrowany w [[Program płynności]] jest OK dla bloków „na start wymuszony z zewnątrz”, (b) kolejność tygodni 4–12 (D wydłużona mowa / E frazowanie / G dobrowolne jąkanie / H anulowanie-wyślizg), (c) co z leczeniem ADHD a jąkaniem, (d) jak często kontrola. Wynik → jedna linia tu, agent przenosi do [[Decision log]] i do treści tygodni.
- [ ] **B3. Treść tygodni 4–12 — przed czy po konsultacji?** Rekomendacja: agent przygotuje tygodnie 4–6 z [[Program płynności]] teraz (masz je zobaczyć przed 28.11), tygodnie 7–12 po konsultacji. Ty akceptujesz treść (czytasz instrukcje „Co robisz / Jak to ma brzmieć / Czego nie robić / Dlaczego”), nie kod.
- [ ] **B4. Transkrypcja po polsku.** Rekomendacja: aplikacja Whisper offline na iPhonie (Whisper Notes, jednorazowo kilka dolarów; Aiko droższa) — Dyktafon → Udostępnij → app → Kopiuj → wklej w „Oceń”. Plan B za 0 zł: Gemini (iOS) przyjmuje m4a, do 10 min/plik, 5 promptów dziennie, ale audio idzie do chmury Google. Plan C: dyktowanie po polsku prosto do Notatek (na żywo, bez pliku audio).
  Fakty: Apple Dyktafon nie transkrybuje polskiego (iOS 18/26), Claude app nie przyjmuje audio, a `sample` w artefakcie przyjmuje tylko tekst i obrazy — więc transkrypcja musi powstać poza apką. Źródła: [[Transkrypcja PL – research]].
  Kroki: zainstaluj jedną apkę, zrób jutro jeden monolog PL i sprawdź jakość; jeśli bełkot → Gemini.
- [ ] **B5. Kopia danych (eksport/import).** Rekomendacja: TAK, jako pierwsza nowa funkcja (1 runda). Dane są tylko w localStorage jednego telefonu — czyszczenie Safari albo zmiana telefonu = utrata dziennika i SR. Rozwiązanie: przycisk „Eksport” (plik JSON przez capability `downloads`, z potwierdzeniem) + „Import” (wklej JSON). Dodatkowo: eksport przed startem leków (baseline ADHD).
- [ ] **B6. Kolejność funkcji na najbliższe 3 tygodnie.** Rekomendacja: (1) B5 eksport, (2) A5 podział + Wake Lock, (3) tygodnie 4–6, (4) #12 „jedno pytanie” w Ocenie, (5) #13 English card, (6) tryb szybki 10 min. Zmień kolejność, jeśli chcesz.
- [ ] **B7. Tryb „szybki” 10 min.** Rekomendacja: odłożyć do końca tygodnia 3 — wtedy zobaczymy w Postępach, czy są dni opuszczone z braku czasu.
- [ ] **B8. #14 „psychoanaliza” z nagrań.** Rekomendacja: #12 (jedno pytanie dziennie, już zresearchowane) wchodzi pierwsze; #14 czeka, aż dostarczysz pliki designu z sesji „AI lab” (repo/eksport/plik). Bez tych plików agent nie adaptuje pipeline'u.
- [ ] **B9. Diagnostyka ADHD a baseline.** Rekomendacja: umów diagnostykę; przed ewentualnym lekiem zrób eksport danych (B5) i cztery nagrania bazowe jak w dniu 1. Lekarzowi powiedz o jąkaniu (dobór leku).

## Zrobione w tej sesji (do wiadomości)
- Harness testowy uruchomiony w repo: oba skrypty zielone (exit 0, brak błędów konsoli i wyjątków), 38 zrzutów.
- Opublikowana wersja apki = `app/index.html` (sprawdzone bajt w bajt). Nic nie republikowałem.
- Vault Obsidiana postawiony, dokumenty z handoffu rozłożone po `wiki/`, HANDOFF w archiwum.
