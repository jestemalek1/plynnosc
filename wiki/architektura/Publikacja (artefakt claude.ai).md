---
status: active
updated: 2026-11-07
tags: [architektura, publikacja]
---

# Publikacja (artefakt claude.ai)

Aplikacja jest publikowana jako artefakt claude.ai: https://claude.ai/artifact/EUANdz59Df6hkaxVUsHR5P
Slug: `6d11a925-4902-461b-9300-077502bbab5e`. Zadeklarowana capability: `sample` (pytanie Claude ze strony).

## Ograniczenia środowiska
- Statyczne pliki. Skrypty tylko własne albo z cdnjs / jsdelivr / unpkg / cdn.tailwindcss.com; fonty tylko Google Fonts.
- Brak `fetch` do innych hostów. Brak `alert/confirm/prompt/window.open/download`, brak service workera.
- `localStorage` OK, ale zawsze w `try/catch` i strona ma działać bez niego.
- `claude.use("sample")`: konsent przy pierwszym użyciu, wywołanie tylko z click handlera, bez retry przy `rate_limited`.
- Na iOS Safari dane w localStorage mogą zniknąć (czyszczenie, tryb prywatny, długa nieaktywność) → patrz decyzja o eksporcie w [[Decyzje do podjęcia]].

> Korekta 11.11 ([[HLD PoC – kworum 2026-11-11]]): według dwóch agentów aktualny kontrakt artefaktów ma capability `downloads` (zapis pliku). Niepusta deklaracja zastępuje cały zestaw, więc publikacja musiałaby podać `sample` i `downloads` razem. Na razie nie używamy; do potwierdzenia, gdy kopiuj/wklej przestanie wystarczać.

## Jak publikować (z sesji Claude Code)
1. Zielony harness: `node test/run.js && node test/round2.js`.
2. Narzędzie Artifact: `read` na URL artefaktu (żeby mieć aktualną wersję), potem `publish` z `file_path: app/index.html` i tym samym `url`. Capability `sample` zostaje (nie podawać `capabilities`, żeby nie wyzerować deklaracji).
3. Po publikacji: sprawdzić w telefonie ekran Dziś i jedno „Oceń z Claude”.
4. Zapisać w [[Decision log]] albo w notatce dnia, co weszło.

Po podziale na kilka plików (Opcja A): `publish` z `files` (`styles.css`, `data.js`, `app.js`, później `store.js`, `domain.js`) obok `index.html`; ścieżki w HTML względne, bez wiodącego `/`.
