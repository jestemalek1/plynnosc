---
status: zaakceptowany
id: B14
hld: "05 (zasila 06, 08)"
decyzja: B14
budżet: 2 rundy (budowa + tester/recenzent, poprawki)
updated: 2026-11-08
---

# B14 Zadanie w terenie

## 1. Cel i moduł HLD
Poprzednia terapia: techniki „nie trzymały się” poza ćwiczeniami, bo brakowało przenoszenia ich do prawdziwych sytuacji. Program (reguła 3) każe codziennie wykonać jedno małe zadanie w terenie, którego celem jest „użyłem techniki”, a nie „byłem płynny”. W tygodniu 1 tym zadaniem jest luźny monolog, który apka ma. Od tygodnia 2 (dzień 8 = 14.11.2026) apka zadań w terenie nie pokazuje.
Moduł [[HLD v1]] 05 Trening komunikacji. Licznik zasila 06 (uczestnictwo) i 08 (raport). Decyzja B14 w [[Decision log]].

## 2. Zakres
**Wchodzi:**
- karta „Zadanie w terenie” na ekranie Dziś od dnia 8, pod listą ćwiczeń;
- dwa przyciski: „Użyłem techniki” / „Dziś nie”;
- zapis odpowiedzi w dniu;
- jedna linia w Postępach;
- treść kart dla tygodni 2 i 3.

**Poza zakresem (no-go):**
- skala przy zadaniu (cel to użycie techniki, nie płynność);
- przypomnienia i powiadomienia;
- edycja hierarchii;
- logika dnia tygodnia (np. inne zadanie w weekend);
- znacznik na mapie wysp;
- treść tygodni 4+ (dochodzi razem z T4–6; do tego czasu w tygodniu 4+ karty nie ma);
- wpływ na zaliczenie dnia.

**Budżet:** 2 rundy. Jeśli się nie zmieści, pierwszą rzeczą do wycięcia jest linia w Postępach. Karta i zapis zostają.

## 3. Zachowanie (kryteria akceptacji)
| # | Gdy … | Wtedy … |
| --- | --- | --- |
| 1 | otwieram dzień 1–7 (w tym dzień 1 – Baza) | karty „Zadanie w terenie” nie ma |
| 2 | otwieram dzień 8–14 | pod ostatnim ćwiczeniem jest karta z treścią tygodnia 2 (sekcja 5), z krótkim opisem (3 linie) i „Pokaż instrukcję” jak w innych kartach |
| 3 | otwieram dzień 15–21 | karta ma treść tygodnia 3 |
| 4 | otwieram dzień ≥ 22 i dla tego tygodnia nie ma treści | karty nie ma, bez błędów |
| 5 | dotykam „Użyłem techniki” | odpowiedź zapisuje się w stanie (`tak`), przycisk jest zaznaczony, toast „Zapisano” i jedno zdanie potwierdzenia; pasek postępu, „następna akcja”, zaliczenie dnia i streak bez zmian |
| 6 | dotykam „Dziś nie” | zapisuje się `nie`, przycisk zaznaczony, neutralny tekst bez oceny (sekcja 5); reszta jak w #5 |
| 7 | dotykam drugi przycisk po wcześniejszym wyborze | odpowiedź się zmienia; nie ma innych stanów niż brak / `tak` / `nie` |
| 8 | wszystkie ćwiczenia dnia są zrobione, a zadanie bez odpowiedzi | dzień jest zaliczony, streak liczy go, auto-powrót na mapę działa jak dotąd |
| 9 | odpowiadam na zadanie po zaliczeniu dnia (np. wieczorem) | zapis działa; nie ma ponownego auto-powrotu ani przewinięcia ekranu |
| 10 | przeglądam wcześniejszy dzień (strzałka ‹) z tygodnia 2+ | mogę zaznaczyć lub zmienić odpowiedź dla tamtego dnia |
| 11 | otwieram Postępy | linia „Zadania w terenie (ostatnie 7 dni): użyłem X · dziś nie Y”; liczone tylko dni ≥ 8; przed dniem 8 linii nie ma |
| 12 | wczytuję stan bez tego pola (v3/v4) albo z nieprawidłową wartością | brak odpowiedzi; nic się nie psuje; zaliczone dni zostają zaliczone |
| 13 | „Kopiuj dane” | JSON zawiera odpowiedzi zadań |
| 14 | dni 7, 8, 14, 15, 21, 22, 85 | zero błędów konsoli; dzień 7 i 14 nadal ma „SR tygodnia” |
| 15 | ekran 390×844 | przyciski ≥ 44×44 px, karta nie wymaga przewijania w poziomie |

## 4. Dane i stan
- Pole w dniu: `field`, wartości: `"tak"` | `"nie"` | `null`. `sanitizeDay` przepuszcza tylko te wartości, wszystko inne zamienia na `null`.
- Bez zmiany wersji stanu `v`: pole jest opcjonalne, brak = `null`.
- **Nie dodawać** `field` do `exercisesFor()` ani do `done`. Karta jest rysowana osobno, po liście ćwiczeń, więc nie wpływa na `isDayDone`, `refreshComplete`, `allListedDone`, `scheduleReturn`, `nextEx` i pasek postępu (lekcja z R1).
- Treść zadań w danych obok `INS`, kluczowana tygodniem: `FIELD[2]`, `FIELD[3]` z polami `brief`, `co`, `jak`, `nie`, `dlaczego`, `tak`, `nieMsg`. Po podziale A5 trafia do `data.js` (02).
- `insSeen` dla instrukcji zadania: klucz `field` (jedna instrukcja zwinięta po pierwszej odpowiedzi).
- Postępy: liczenie po `state.days` dla 7 ostatnich dni ≤ dziś z `dayIndex ≥ 8`.

## 5. Treść (do akceptacji Alka)
Źródło: [[Program płynności]] – reguła 3, tabela progresji (kolumna „Zadanie w terenie”), ćwiczenia A i B, „Co robić w momencie bloku”, „Imię i przedstawianie się”. Szczeble wg Twojej hierarchii z dnia 1 (dopisek B14 w programie).

### Tydzień 2 (dni 8–14): szczebel 1–2, start na wydechu
- **Tytuł / podtytuł:** Zadanie w terenie · Daily: pierwsze zdanie na wydechu
- **Krótko (3 linie):** Na daily pierwsze zdanie zaczynasz na wydechu, jak w oddechu A. · W dzień bez daily: jeden akapit czegoś, co i tak czytasz, na głos. · Liczy się „użyłem”, nie „byłem płynny”.
- **Co robisz:** Na daily (szczebel 2 Twojej hierarchii) przed pierwszym zdaniem robisz jeden spokojny wdech brzuchem i zaczynasz mówić od razu na wydechu, tak jak słowo w ostatnich powtórzeniach oddechu A. W dzień bez daily: szczebel 1. Przeczytaj na głos jeden akapit czegoś, co i tak czytasz, i zacznij tak samo. Potem zaznacz w apce.
- **Jak to ma brzmieć:** Wdech 2–3 s, brzuch luźny, pierwsze słowo wychodzi na początku wydechu, bez momentu „wdech – stop – mówię”. Dalej mówisz normalnie i nie musisz pilnować techniki w całej wypowiedzi.
- **Czego nie robić:** Nie zatrzymuj powietrza po wdechu, nie bierz kilku wdechów „na zapas”, nie oceniaj, czy było płynnie.
- **Dlaczego:** Poprzednio technika nie trzymała się poza ćwiczeniami, bo brakowało przenoszenia jej do prawdziwych sytuacji. Zaczynasz od najłatwiejszych szczebli, gdzie bloków zwykle nie ma, żeby start na wydechu stał się nawykiem, zanim przeniesiesz go wyżej.
- **Po „Użyłem techniki”:** Zapisane. Technika użyta w prawdziwej sytuacji – to jest właśnie transfer.
- **Po „Dziś nie”:** Zapisane. Jutro kolejna okazja.

### Tydzień 3 (dni 15–21): przedstawienie się z miękkim startem
- **Tytuł / podtytuł:** Zadanie w terenie · Imię z miękkim startem, 1× dziennie
- **Krótko (3 linie):** Raz dziennie przedstaw się pełnym imieniem z miękkim startem: „hhhAleksander”. · Telefon, spotkanie, recepcja, wiadomość głosowa – byle naprawdę do kogoś. · Liczy się „użyłem”, nie „byłem płynny”.
- **Co robisz:** Raz dziennie w prawdziwej sytuacji mówisz pełne imię „Aleksander” z miękkim startem, jak w ćwiczeniu „Miękki start”: cichy wydech, z którego wyrasta „A”. Okazja może być dowolna: telefon („tu Aleksander”), spotkanie, recepcja, wiadomość głosowa. Potem zaznacz w apce.
- **Jak to ma brzmieć:** „hhhAleksander”: „h” ledwo słyszalne, krótsze niż sekunda, „A” miękko na wydechu, reszta imienia w normalnym tempie. Rozmówca słyszy po prostu spokojnie powiedziane imię.
- **Czego nie robić:** Nie skracaj do „Alek” i nie zastępuj imienia obejściem w rodzaju „jestem z firmy…”, bo to też zamiana słowa. Nie zatrzymuj powietrza przed „A”. Jeśli wejdzie blok, rób mniej, nie więcej: puść brzuch, cichy głos na samogłosce, dokończ.
- **Dlaczego:** Przedstawianie się to Twój najtrudniejszy szczebel, a imię zaczyna się od samogłoski, czyli dokładnie tam, gdzie krtań lubi się zamknąć. Miękki start trzyma ją otwartą. Cel tego tygodnia to jedno użycie dziennie, nie płynność.
- **Po „Użyłem techniki”:** Zapisane. Imię powiedziane techniką w prawdziwej sytuacji – najtrudniejszy szczebel ruszył.
- **Po „Dziś nie”:** Zapisane. Bez okazji też jest OK; jutro spróbuj ją stworzyć (np. „tu Aleksander” w wiadomości głosowej).

**Potwierdzone przez Alka 8.11** (treść i oba punkty):
1. **Imię w tygodniu 3.** Program w sekcji „Imię i przedstawianie się” mówi „preparatory set zawsze”, ale tabela progresji wprowadza preparatory set dopiero w tygodniu 8. W tygodniu 3 trzymam się tabeli (miękki start). Preparatory set dochodzi w tygodniu 8. Decyzja: miękki start; pytanie na konsultację 10.11 (B2).
2. **Daily jako szczebel 2.** Na daily nie masz bloków, więc to zadanie łatwe. Zgodnie z programem budujemy nawyk od najłatwiejszego szczebla.

## 6. Zasady i ryzyka
- **Skala:** brak; tylko fakt tak/nie (zasada pomiaru B15). „Dziś nie” to normalna odpowiedź. Żadnych komunikatów oceniających, streaka ani kar za „nie”.
- **Prywatność:** w stanie tylko `tak`/`nie`, bez opisu sytuacji.
- **Medyczne:** treść wyłącznie ze źródłem w programie; nie obiecujemy płynności.
- **Ryzyko R1 (zaliczenie dnia):** karta poza `exercisesFor`. Tester sprawdza #8, #9 i #12.
- **Kolizja z oknem A:** dopóki nie ma A5, zmiana jest w `app/index.html`. Gałąź `feature/b14-zadanie-w-terenie` od `develop` po wydaniu v4.

## 7. Jak sprawdzone
(uzupełnia okno B po wdrożeniu)
