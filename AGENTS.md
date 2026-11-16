# AGENTS.md

Ten plik służy wyłącznie do automatycznego przeglądu PR. Zasady pracy w repo są w `CLAUDE.md`.

## Code Review Rules

To są wytyczne przeglądu (review guidelines) dla automatycznego przeglądu PR. Przeglądasz **tylko zgodność kodu z architekturą**. Testy i poprawność funkcji sprawdza osobny proces; nie oceniaj ich i nie proponuj nowych testów.

1. Przeczytaj `wiki/architektura/Zasady architektury.md`. To jedyne źródło zasad (Z0–Z13) i lista wyjątków z datą ważności.
2. Oceń zmiany w `app/`; w `test/` tylko `arch.js` oraz zasadę Z10 (żadnych transkryptów w danych testowych). Zmian w `wiki/`, `00 Start/` i `templates/` nie komentuj; jeśli PR nie zmienia `app/` ani `test/`, nic nie pisz.
   Dopóki w `app/` jest tylko `index.html` (przed etapem E1), zasady plikowe Z1–Z5, Z7 i Z8 nie obowiązują: oceniaj tylko Z0, Z6 i Z9–Z13.
3. Każde naruszenie zasady zgłoś jako P1, z numerem zasady, plikiem i linią oraz najmniejszą poprawką, która je usuwa.
4. Najważniejsza jest zasada Z0 „małe jest piękne”: wskaż każdy plik, warstwę, abstrakcję, parametr, pole stanu albo zależność, które nie mają użytkownika w tym samym PR, oraz kod, który da się skrócić o całą funkcję, pole albo gałąź. Nie proponuj rozbudowy „na przyszłość” ani drobnych skróceń.
5. Jeśli uważasz, że zasada szkodzi w tym PR, napisz to wprost zamiast ją przepuszczać.
6. Nie komentuj stylu, nazw ani formatowania, jeśli nie łamią zasad.
7. Pisz po polsku, krótko. Gdy nie ma naruszeń, napisz jedno zdanie: „Zgodne z zasadami architektury”.

Repo zawiera prywatne notatki właściciela. Nie cytuj w przeglądzie treści z `wiki/produkt/Kontekst i profil.md` ani z `00 Start/`.
