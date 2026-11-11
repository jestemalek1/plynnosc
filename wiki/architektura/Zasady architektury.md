---
status: active
owner: Alek
updated: 2026-11-11
tags: [architektura, zasady, przegląd-pr]
---

# Zasady architektury

Jedno źródło prawdy dla każdego, kto pisze albo przegląda kod: budowniczego, recenzenta w sesji, przeglądu PR przez Codex (`AGENTS.md`) i skryptu `test/arch.js`. Opis architektury i plan wdrożenia: [[Architektura aplikacji]]. Skąd się wzięły: [[HLD PoC – kworum 2026-11-11]], decyzje C1 i C9 w [[Decision log]].

Te zasady dotyczą **budowy kodu**. Testy i działanie funkcji sprawdza harness oraz tester ([[Testy]]); przegląd architektury ich nie ocenia.

## Podstawa: małe jest piękne
**Robimy najmniejszą ilość pracy i kodu, która daje daną funkcję. Treść przed formą.** Kod, którego nie ma, nie wymaga testów, przeglądu ani migracji. Dług technologiczny powstaje głównie z rzeczy dodanych „na przyszłość”, dlatego pilnujemy tego od pierwszego PR, a nie po fakcie.

W praktyce:
- Każdy nowy plik, warstwa, abstrakcja, parametr, pole stanu albo zależność musi mieć użytkownika **w tym samym PR**. Nic „na zapas”.
- Zanim coś dodasz, sprawdź, czy da się to osiągnąć usunięciem albo zmianą istniejącego kodu.
- Funkcję wydzielamy do osobnego pliku wtedy, gdy i tak ją przepisujemy albo gdy pojawia się drugi użytkownik. Nie przenosimy kodu tylko po to, żeby „było porządniej”.
- Przy dwóch rozwiązaniach o tym samym efekcie wygrywa krótsze i łatwiejsze do usunięcia.
- „Małe” dotyczy kodu, nie wygody: funkcja ma być miła w użyciu (B33, user friendly first), a zrobiona najmniejszym kodem, który to daje.
- Jeśli zasada z tej strony wymusza więcej kodu, niż jest wart jej zysk, zmieniamy zasadę (decyzja Alka), a nie obchodzimy jej po cichu.

## Zasady
**Przed etapem E1** (dopóki w `app/` jest tylko `index.html`) zasady plikowe Z1–Z8 nie obowiązują; ocenie podlegają Z0 i Z9–Z13.

Kolumna „Kto pilnuje”: **S** = skrypt `test/arch.js` (mechanicznie, przy każdym PR), **R** = recenzent (Codex i recenzent w sesji).

| # | Zasada | Kto pilnuje |
| --- | --- | --- |
| Z0 | **Małe jest piękne** (sekcja wyżej): PR nie dodaje niczego bez użytkownika w tym samym PR | R; S pokazuje liczbę linii na plik |
| Z1 | W `app/` są tylko pliki z listy: `index.html`, `styles.css`, `data.js`, `app.js`, `store.js`, `domain.js`. Nowy plik = decyzja Alka i zmiana tej listy | S |
| Z2 | `localStorage` występuje tylko w `store.js`. Reszta kodu woła `store` | S |
| Z3 | `data.js` to wyłącznie dane: bez funkcji, bez `document`, bez `localStorage`. Dane Alka (hierarchia, imię, słowa) są w jednym oznaczonym bloku `PROFILE` | S (funkcje), R (blok `PROFILE`) |
| Z4 | `domain.js` to logika bez ekranu: bez `document`, `window`, `localStorage`. Dzisiejszą datę dostaje jako parametr | S, R (data jako parametr) |
| Z5 | `claude.use` jest wołane z jednego pliku i tylko po kliknięciu użytkownika | S (jeden plik), R (kliknięcie) |
| Z6 | Żadnej sieci: bez `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`; w `index.html` i `styles.css` tylko ścieżki względne. Bez telemetrii | S |
| Z7 | Bez frameworka, bundlera i modułów ES: klasyczne `<script src>`, bez `type="module"` oraz instrukcji `import` i `export` na początku linii; po podziale `index.html` nie ma kodu w `<script>` | S |
| Z8 | Obiekty globalne tylko: `PLYN_DATA`, `PLYN_STORE`, `PLYN_DOMAIN`, po jednym na plik. `app.js` nie wystawia nic | S |
| Z9 | Stan zmieniamy tylko przez dopisywanie pól (jedyne zaplanowane usunięcie: `excerpt` w ocenach, którego żadna wersja nie czyta). Zmiana wersji `v` wymaga: wpisu na liście migracji, kopii przed migracją, specyfikacji. Starsza wersja apki musi umieć wczytać nowszy stan | R |
| Z10 | Eksport = stan bez szkicu transkryptu i ostatniej odpowiedzi modelu. W repo nigdy nie ma transkryptów, także w testach | R |
| Z11 | Ekran nie liczy logiki dnia: plan dnia, zaliczenie, streak i metryki są w `domain.js` (do czasu jego powstania: w jednym miejscu `app.js`). Nie dodajemy kolejnej ścieżki zaliczenia ćwiczenia | R |
| Z12 | `SRPicker` jest jedynym komponentem skali; wszystko inne to fakt tak/nie albo licznik. Wyjątki tylko te z `CLAUDE.md` (B15, B35) | R |
| Z13 | Wyjątek prywatny C3 (sekcja „Treść i samorozwój” w prompcie „Oceń”) nie rozszerza się: żaden nowy kod nie dodaje wnioskowania o osobie, etykiet emocji ani diagnoz | R |

## Wyjątki z datą ważności
Wyjątek ma zawsze termin i znika razem z etapem z [[Architektura aplikacji]]. Lista w skrypcie musi być taka sama jak tutaj.

| Zasada | Wyjątek | Wygasa |
| --- | --- | --- |
| Z2 | `localStorage` wolno w `app.js` | z etapem E2 (powstaje `store.js`) |
| Z5 | sonda `probeSample` woła `claude.use` przy starcie strony (R4) | z etapem E2 |
| Z10 | „Kopiuj dane” kopiuje cały stan razem ze szkicem | z etapem E2 |

## Jak zmienić zasadę
Zasady nie są święte. Zmiana = jedna linia w [[Decyzje do podjęcia]] z rekomendacją, decyzja Alka, wpis w [[Decision log]], potem poprawka tej strony i skryptu w jednym PR. Recenzent, który uważa zasadę za szkodliwą w danym PR, pisze to w przeglądzie zamiast ją przepuszczać.
