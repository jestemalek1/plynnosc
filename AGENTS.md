# AGENTS.md

Ten plik służy wyłącznie do automatycznego przeglądu PR. Zasady pracy w repo są w `CLAUDE.md`.

## Review guidelines

Przeglądasz **tylko zgodność kodu z architekturą**. Testy i poprawność funkcji sprawdza osobny proces; nie oceniaj ich i nie proponuj nowych testów.

1. Przeczytaj `wiki/architektura/Zasady architektury.md`. To jedyne źródło zasad (Z0–Z13) i lista wyjątków z datą ważności.
2. Oceń zmiany w `app/` i `test/arch.js`. Zmian w `wiki/`, `00 Start/` i `templates/` nie komentuj.
3. Każde naruszenie zasady zgłoś jako P1, z numerem zasady, plikiem i linią oraz najmniejszą poprawką, która je usuwa.
4. Najważniejsza jest zasada Z0 „małe jest piękne”: wskaż każdy plik, warstwę, abstrakcję, parametr, pole stanu albo zależność, które nie mają użytkownika w tym samym PR, oraz kod, który da się osiągnąć krócej. Nie proponuj rozbudowy „na przyszłość”.
5. Jeśli uważasz, że zasada szkodzi w tym PR, napisz to wprost zamiast ją przepuszczać.
6. Nie komentuj stylu, nazw ani formatowania, jeśli nie łamią zasad.
7. Pisz po polsku, krótko. Gdy nie ma naruszeń, napisz jedno zdanie: „Zgodne z zasadami architektury”.

Repo zawiera prywatne notatki właściciela. Nie cytuj w przeglądzie treści z `wiki/produkt/Kontekst i profil.md` ani z `00 Start/`.
