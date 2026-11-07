# Szablony – research + werdykt architekta (2026-11-07)

Researcher: 9 kandydatów; jedyny klon Duolingo bez backendu: bryanjenningz/react-duolingo (MIT, Next 14, ostatni commit 2024-09). sanidhyy/duolingo-clone wymaga Postgres/Clerk/Stripe. Framework7 Core (MIT, vanilla) – tabbar/dialog/toast/sheet. Konsta UI – wymaga React+Tailwind. beautiful-skill-tree – GPL (odpada). WebIntervalTimer, tabata-timer – źródła do kopiowania (beep, Wake Lock). Trackery nawyków – słabsze niż obecna aplikacja.

Architekt (weryfikacja): react-duolingo eksportuje się statycznie, ale z tarciem (i18n w next.config, walidacja env, next/image, absolutne /_next/ pod sub-ścieżką artefaktu). Framework7 9.3.0 z jsdelivr ładuje się, ale 1,3 MB na dialogi i tabbar w 107 KB aplikacji – słaba wartość. Kluczowy argument: każdą zmianę robi agent LLM – jeden plik bez builda = czytaj, edytuj, testuj headless w jednej rundzie.

## Opcja A – „Vanilla+” (rekomendowana)
Zostaje obecny kod; port IDEI z react-duolingo: wężykowa ścieżka (offsety [0,−45,−70,−45,0,45,70,45] px, odwracane co drugi rozdział) i algorytm streaka (zbiór dat + liczenie wstecz). Własne modale/toasty (~60 linii). Podział na 3–4 pliki statyczne (index.html, app.js, map.js, styles.css) bez bundlera. Timer: beep WebAudio + Wake Lock wg WebIntervalTimer. Nakład: 1–2 rundy. Ryzyko: rosnący plik – mitygacja podziałem i testami headless.

## Opcja B – przepisanie: Vite + Preact/React + Zustand(persist) + Tailwind
Fork koncepcji react-duolingo (learn/lesson/BottomBar/Calendar), logika domenowa przepisana do komponentów, build do dist/ publikowany jako wiele plików. Nakład: 5–8 rund. Ryzyka: źródło 14 mies. bez commitów, grafika do podmiany, każda zmiana agenta = npm ci + build + test w dev serwerze.

Decyzja: oczekuje na zatwierdzenie Alka. Pytania: (1) ile ekranów w 6 mies. – <8 (A) czy wyraźnie więcej (B)? (2) akceptacja kroku build przy każdej zmianie (B)?

Źródła: github.com/bryanjenningz/react-duolingo, react-duolingo-clone.vercel.app, nextjs.org/docs/pages/guides/static-exports, cdnjs.com/libraries/framework7, data.jsdelivr.com (framework7 9.3.0), framework7.io/docs, github.com/konstaui/konsta, github.com/m-masaki72/WebIntervalTimer, github.com/astryia/tabata-timer, github.com/andrico1234/beautiful-skill-tree, github.com/sanidhyy/duolingo-clone.
