# HANDOFF – „Płynność” (przeniesienie z czatu Claude do Claude Code)

Data: 2026-11-07. Właściciel: Alek (Aleksander Stępień). Język projektu: polski (UI, dokumenty), kod i komentarze mogą być po angielsku.

## 1. O co chodzi
Osobista aplikacja treningu płynności mowy dla dorosłego z jąkaniem (bloki), 15 min dziennie, 12-tygodniowy program oparty na badaniach, z oceną nagrań przez Claude, mapą postępu w stylu Duolingo, a docelowo z modułem samorozwoju i doskonalenia angielskiego na podstawie tych samych nagrań.

## 2. Co istnieje (stan)
| Artefakt | Gdzie | Stan |
| --- | --- | --- |
| Aplikacja v3 (single-file HTML, 107 KB) | `app/index.html`; opublikowana: https://claude.ai/artifact/EUANdz59Df6hkaxVUsHR5P (slug 6d11a925-4902-461b-9300-077502bbab5e, capability `sample` zadeklarowana) | działa; 3 rundy build→tester+review→fix; 15/15 testów akceptacyjnych |
| Strona dnia 1 (poprzednik) | `dzien-01.html` | archiwum; dane dnia 1 zaimportowane do app |
| Harnessy testowe (Playwright, headless Chrome, 390×844) | `test/run.js`, `test/round2.js`, `test/run.orig.js`, zrzuty `test/*.png` | przechodzą (exit 0) |
| Program terapii (dok, 33 KB md) | `docs/program-plynnosci.md`; żywy dok: https://claude.ai/artifact/4WQoBX2pNUpqGVPTFxkJQA | kompletny, ze źródłami |
| Backlog i plan | `BACKLOG.md` | 14 pozycji, status w środku |
| Research | `research/01-terapie-doroslych-raport-agenta.md`, `02-protokoly-cwiczen-raport-agenta.md`, `03-polskie-zasoby-raport-agenta.md`, `12-13-samorozwoj-angielski.md`, `szablony-decyzja.md` | gotowe |

## 3. Profil użytkownika istotny dla produktu (powiedziane przez Alka)
- Jąkanie od nastoletniości; typ: bloki, przeciąganie, współruchy; w rodzinie (ciocia, jej dziecko). Nie unika sytuacji (instruktor sportu, szkolenia, prezentacje), żartuje z tego w pracy – ujawnianie „zaliczone”.
- Reakcja na blok: forsowanie + zamiana słów (oba do wygaszenia).
- Bloki NIE zależą od stresu: daily po polsku (własny moment startu, krótko) – płynnie; luźna szybka rozmowa z kolegą bez stresu – bloki; prezentacja po angielsku – blok na każdym słowie, napięcie od brzucha w górę, bez oddechu, bez odczuwanego stresu. Kiedyś angielski płynniejszy, dziś gorszy. Najbardziej spójny wątek: start mowy wymuszony z zewnątrz (wtrącenie, szybka odpowiedź, imię na żądanie). Zmienność bez wzorca – normalna cecha; prowadzi 2-tyg. dziennik bloków.
- Dziennik dzień 1: „za wolno myślę, nie wiem co powiedzieć, brakuje mi treningu w rozmowie” → trening formułowania treści jest częścią programu.
- Poprzednia terapia: techniki, które „nie trzymały się w stresie” (brak transferu). Cel: maksymalna płynność, gotowość na intensywny program.
- ADHD: podejrzenie, planuje diagnostykę (osobna rozmowa). Leki dobierać z wiedzą o jąkaniu; baseline nagrań przed lekiem.
- Preferencje produktowe: WSZYSTKIE instrukcje w aplikacji (nie w czacie), krótko i dokładnie; minimum kliknięć; jedna skala (SR 0–8) wszędzie; ćwiczenia nie mogą być nudne (styl Duolingo); mapa wysp jako roadmapa.
- Dane bazowe dnia 1 (2026-11-07): czytanie PL bloki 1/SR 5; monolog PL 1/4; monolog EN 1/3; rozmowa 1/2; hierarchia (0–8): 2,2,3,5,4,2,2,4,2,4; oddech nie wykonany; monolog: brak oddechu po frazach, brzuch spięty, 2 bloki.

## 4. Decyzje podjęte
- Terapia: program zintegrowany (modyfikacja jąkania + mięki start/lekki kontakt/wydłużona mowa + praca z antycypacją), online, z transferem i utrzymaniem. Po wywiadzie: CBT na lęk mniej istotne; priorytet oddech/tempo/frazowanie/start „na sygnał” w warunkach, które blokują (długie, szybkie, spontaniczne, EN).
- Specjaliści do kontaktu (poniedziałek 10.11): Fundacja FIKS 793 001 160 (darmowa diagnoza, Camperdown online), Karolina Jankiewicz 509 812 667 (145 zł online). Tańsze warszawskie: Zielkowska/Walesiak 120 zł.
- Stack: Opcja A „Vanilla+” rekomendowana (bez frameworka; port idei ścieżki/streaka z react-duolingo; własne modale; podział na 3–4 pliki). Decyzja Alka A/B – oczekiwana; bez niej jedziemy A.
- Skala: tylko SR 0–8 (Camperdown). Hierarchia 0–10 przeliczona ×0.8.

## 5. Otwarte / następne kroki (szczegóły w BACKLOG.md)
1. Sesje tygodni 4–12 (D wydłużona mowa, E frazowanie, G dobrowolne jąkanie, H anulowanie/wyślizg/przygotowanie, transfer, prezentacja, utrzymanie) – przed 28.11.2026.
2. #12 Samorozwój z nagrań + #13 Angielski – spec w `research/12-13-samorozwoj-angielski.md` (jedno pytanie dziennie, English card JSON, bank chunków).
3. #14 „Psychoanaliza” – design pipeline'u z sesji Claude Code „AI lab” (https://claude.ai/code/session_01M48q9i1Wur2dFYwTKhR61K) – Alek dostarcza repo/pliki.
4. #10 Transkrypcja PL (Voice Memos nie robi PL).
5. Podział `app/index.html` na pliki + wake lock + własne modale (Opcja A).
6. Ewentualnie: tryb „szybki” 10 min.

## 6. Ograniczenia środowiska publikacji (artefakt claude.ai)
Statyczne pliki; skrypty tylko własne lub cdnjs/jsdelivr/unpkg/cdn.tailwindcss.com; fonty Google; brak fetch do innych hostów; brak alert/confirm/prompt/window.open/download/service worker; localStorage OK (try/catch); `claude.use("sample")` do pytania Claude ze strony (konsent przy pierwszym użyciu, wywołanie tylko z click handlera, bez retry przy rate_limited). Republikacja: `publish_files` z `slug` + `base_version` (ostatnia: 1794091256-c963).

## 7. Sposób pracy, który się sprawdził
Budowniczy (agent) → niezależny tester (Playwright, wymagania punkt po punkcie) + recenzent kodu (bez znajomości twierdzeń budowniczego) → lista poprawek → kolejna runda → publikacja po czystej rundzie. Każdą zmianę robi agent, więc kod ma być czytelny w jednym przebiegu i testowalny headless z `file://`.
