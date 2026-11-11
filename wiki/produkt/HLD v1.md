---
status: active
owner: Alek
updated: 2026-11-08
source: HLD_aplikacja_wsparcie_jakania_v1.docx (assets/), zmiany B12–B20 w tej kopii
tags: [produkt, hld]
---

# HLD v1 – aplikacja wsparcia jąkania (8.11.2026)

Kopia tekstowa dokumentu Alka; oryginał: `assets/HLD_aplikacja_wsparcie_jakania_v1.docx`. Porównanie z naszym planem: [[HLD v1 – porównanie z planem]].

> **Zmiany po 8.11 (sesja decyzji B12–B20, B29–B32, [[Decision log]]).** Ta kopia jest teraz wersją wiodącą, a `.docx` to historia. Dopisane: utrzymanie i zapobieganie nawrotom w 03 i 06 (B18); ocena mowy przez AI z nagrania i rozmowy na żywo w 01, 05 i 06 (B19); minimum bezpieczeństwa w §6 z przypisaniem do modułów (B20); refleksja z nagrań z zabezpieczeniami (B17, od B32 w module 10); §7 „Prototyp n=1 i kolejność budowy” (B12); nowe moduły 09 „Trening języka obcego” (B31) i 10 „Refleksja i wzorce” (B32). Fragmenty dopisane oznaczone *[Bxx]*.

Stan ustaleń: 8 listopada 2026

Cel dokumentu: zebrać w jednym miejscu wszystkie dotychczas uzgodnione
„grube klocki” aplikacji, ich odpowiedzialności, zależności oraz pomysły
odłożone na później. To HLD funkcjonalne, a nie specyfikacja ekranów,
algorytmów czy protokół kliniczny.

## 1. Uzgodniona architektura — 8 głównych modułów

| **Nr** | **Moduł**               | **Rola**                                                          |
|--------|-------------------------|-------------------------------------------------------------------|
| 01     | Wywiad i ocena wstępna  | Rozpoznanie potrzeb i celów użytkownika.                          |
| 02     | Biblioteka ćwiczeń      | Zbiór dostępnych ćwiczeń i materiałów.                            |
| 03     | Generator planu terapii | Dobór indywidualnego planu pracy.                                 |
| 04     | Realizacja ćwiczeń      | Wykonywanie ćwiczeń zgodnie z planem.                             |
| 05     | Trening komunikacji     | Praktykowanie komunikacji w symulacjach i codziennych sytuacjach. |
| 06     | Monitorowanie postępów  | Ocena zmian i zwrot informacji do planu.                          |
| 07     | Wsparcie psychologiczne | Praca nad lękiem, napięciem i unikaniem rozmów.                   |
| 08     | Panel logopedy          | Nadzór specjalisty i modyfikacja planu.                           |
| 09     | Trening języka obcego *[B31]* | Rozwój wypowiedzi w języku obcym (na start angielski) z własnych nagrań i rozmów. |
| 10     | Refleksja i wzorce *[B32]* | Zauważanie własnych wzorców w swoich słowach i zamiana ich w małe działania. |

Decyzja: powyższe elementy (osiem z 8.11, moduły 09 i 10 dodane 8.11
decyzjami B31 i B32) stanowią zaakceptowany zakres bazowego
katalogu HLD. Nie oznacza to jeszcze, że wszystkie muszą wejść do
pierwszej wersji rynkowej.

## 2. Założenia i zasady podziału

- Skupiamy się na „grubych klockach”. Nie rozpisujemy na tym etapie
  podfunkcji, architektury technicznej ani technologii.

- Osobny moduł ma sens, gdy odpowiada za wyraźnie inną potrzebę lub
  odpowiedzialność, a nie wyłącznie wykorzystuje inną technologię.

- Trener rozmów AI i zadania w rzeczywistych sytuacjach zostały
  połączone w jeden moduł: „Trening komunikacji”.

- „Generator planu terapii” pozostaje pojedynczym, niezależnym
  feature’em (silnikiem generującym plan).

- Biblioteka ćwiczeń i generator są osobne: biblioteka dostarcza zasoby,
  generator dobiera plan. Kolejność architektoniczna nie jest tożsama z
  kolejnością ekranów użytkownika.

- Wsparcie psychologiczne jest osobnym modułem, współpracującym z
  planem, treningiem komunikacji i pomiarem postępów.

## 3. Opis uzgodnionych modułów

## 01. Wywiad i ocena wstępna

**Odpowiedzialność:** Poznać historię trudności, charakter jąkania,
sytuacje komunikacyjne, emocje, unikanie i cele użytkownika.

**Zakres na poziomie HLD:** Wstępna rozmowa i samoocena; możliwa próbka
mowy. Rezultatem jest profil potrzeb, a nie automatyczna diagnoza
medyczna.

*[B19]* Próbka mowy to nagranie albo krótka rozmowa na żywo (czytanie,
monolog, rozmowa), oceniona przez AI tak samo jak w module 06. Jest
punktem wyjścia do porównań, nie oceną kliniczną.

*[B20]* Wywiad zawsze pyta, kiedy zaczęło się jąkanie. Nagły początek
w dorosłości oznacza informację o potrzebie pilnej oceny medycznej przed
dalszą pracą.

**Powiązania:** Dostarcza danych do generatora planu, wsparcia
psychologicznego i monitorowania postępów.

## 02. Biblioteka ćwiczeń

**Odpowiedzialność:** Być katalogiem ćwiczeń, z których można komponować
indywidualną pracę.

**Zakres na poziomie HLD:** Ćwiczenia dotyczące sposobu mówienia, pracy
z jąkaniem, swobody komunikacji oraz zrozumienia własnych trudności; bez
rozpisywania metod na tym etapie.

**Powiązania:** Jest źródłem zasobów dla generatora planu i modułu
realizacji ćwiczeń.

## 03. Generator planu terapii

**Odpowiedzialność:** Tworzyć i aktualizować indywidualny plan ćwiczeń
na podstawie potrzeb, celów i postępów.

**Zakres na poziomie HLD:** Osobny silnik generujący plan. Szczegóły
zasad doboru ćwiczeń nie są jeszcze projektowane.

*[B18]* Plan nie kończy się na osiągnięciu celu. Obejmuje fazę
utrzymania z rzadszymi przeglądami (wzorzec Camperdown: po 2, 2, 4, 4 i
8 tygodniach, potem po 3 i 6 miesiącach). Niezaliczony przegląd albo
sygnał nawrotu z modułu 06 cofa plan do wcześniejszego etapu.
Uzasadnienie: nawroty po samym kształtowaniu płynności dotyczą 20–70%
dorosłych, więc utrzymanie to część planu, a nie dodatek.

**Powiązania:** Korzysta z wywiadu, biblioteki, monitorowania postępów i
— gdy ma to zastosowanie — decyzji specjalisty.

## 04. Realizacja ćwiczeń

**Odpowiedzialność:** Udostępniać użytkownikowi wykonywanie zadań
wynikających z planu.

**Zakres na poziomie HLD:** Miejsce codziennej pracy z wybranymi
ćwiczeniami i rejestrowania ich wykonania.

**Powiązania:** Otrzymuje plan od generatora; przekazuje rezultaty do
monitorowania postępów.

## 05. Trening komunikacji

**Odpowiedzialność:** Pomagać przenosić umiejętności z ćwiczeń do
rzeczywistych sytuacji komunikacyjnych.

**Zakres na poziomie HLD:** Jeden klocek łączący symulowane rozmowy z AI
i zadania w prawdziwym świecie. Nie rozdzielamy ich na osobne moduły
HLD.

*[B19]* Symulowana rozmowa z AI odbywa się głosem, na żywo. Po rozmowie
AI ocenia mowę jak w module 06, a wynik trafia do monitorowania postępów.

**Powiązania:** Współpracuje z planem, wsparciem psychologicznym i
monitorowaniem postępów.

## 06. Monitorowanie postępów

**Odpowiedzialność:** Dawać obraz zmian i umożliwiać aktualizowanie
planu pracy.

**Zakres na poziomie HLD:** Obserwuje nie tylko płynność, ale też
komfort komunikacji, napięcie, unikanie rozmów i uczestnictwo w
sytuacjach komunikacyjnych.

*[B19]* **Ocena mowy przez AI z nagrania albo rozmowy na żywo.**
Użytkownik nagrywa się albo rozmawia (z AI lub z kimś), a AI ocenia
płynność i daje informację zwrotną. Zasady:
- AI ocenia dźwięk, nie tylko transkrypt. Transkrypcja nie pokazuje
  cichych bloków i wygładza niepłynności.
- Podstawowym pomiarem pozostaje samoocena SR 0–8, a docelowo ocena
  specjalisty. Ocena AI jest informacją zwrotną. Do decyzji o planie
  (moduł 03) wchodzi dopiero wtedy, gdy przez kilka tygodni zgadza się
  z samooceną.
- Nagranie to dane o zdrowiu: wymaga zgody, krótkiej retencji i
  możliwości usunięcia (§6).

*[B18]* Wykrywa sygnały nawrotu (wzrost SR, powrót zamiany słów lub
unikania, opuszczone przeglądy) i zgłasza je do generatora planu.

*[B15]* **Zasada pomiaru:** jedna skala SR 0–8 dla nasilenia jąkania i
poziomu techniki; pozostałe obszary jako fakty tak/nie albo liczniki,
nie kolejne skale. Wersja n=1 mierzy: SR tygodnia (typowe, najgorsze),
zamianę słów i odpuszczone sytuacje (dni z faktem), uczestnictwo
(zadania w terenie z użytą techniką), miejsce napięcia. Komfort i
kwestionariusze wpływu (OASES) – ze specjalistą albo w produkcie.

**Powiązania:** Zbiera informacje z ćwiczeń, treningu i samooceny;
zasila generator planu oraz panel logopedy.

## 07. Wsparcie psychologiczne

**Odpowiedzialność:** Pomagać w radzeniu sobie z lękiem, napięciem,
wstydem i unikaniem rozmów związanych z jąkaniem.

**Zakres na poziomie HLD:** Odrębna ścieżka wspierająca pracę nad
barierami emocjonalnymi i podejmowaniem sytuacji komunikacyjnych. Nie
zastępuje psychoterapeuty ani diagnozy psychologicznej.

*[B32]* Refleksja nad wzorcami zachowań w ogóle (dawniej #14 „psychoanaliza”,
zapisana tu decyzją B17) przeszła do modułu 10. Moduł 07 zajmuje się
barierami związanymi z jąkaniem; gdy wzorzec z 10 dotyczy lęku przed
mówieniem albo unikania rozmów, trafia tutaj.

**Powiązania:** Wykorzystuje informacje z wywiadu; współdziała z
treningiem komunikacji, monitorowaniem i generatorem planu.

## 08. Panel logopedy

**Odpowiedzialność:** Umożliwiać specjaliście nadzorowanie i
dostosowywanie planu użytkownika.

**Zakres na poziomie HLD:** Wgląd w uzgodniony zakres informacji o
postępach i możliwość korygowania planu; szczegóły interfejsu i zakres
uprawnień później.

**Powiązania:** Łączy się z generatorem planu, realizacją ćwiczeń i
monitorowaniem postępów.

## 09. Trening języka obcego *[B31]*

**Odpowiedzialność:** Rozwijać sposób mówienia w języku obcym (na start
angielski) na podstawie własnych nagrań i rozmów użytkownika, tak żeby
spadł koszt formułowania wypowiedzi.

**Zakres na poziomie HLD:** Po wypowiedzi krótka karta: najwyżej 5
poprawek „powiedziałeś → lepiej”, frazy zamiast reguł, jedna uwaga o
rejestrze, jedna rzecz, która wyszła dobrze. Użytkownik sam wypowiada
poprawioną wersję. Bank fraz z własnych potknięć powtarzany przez
mówienie, shadowing własnych poprawionych zdań, porównanie co 2 tygodnie.

**Granice:** poprawki tylko po wypowiedzi, nigdy w jej trakcie
(przerwanie wymusza ponowny start); niepłynność nie jest błędem
językowym i nie wpływa na ocenę języka; tempo nie jest celem; ocena
płynności zostaje w 06; AI cytuje dokładny fragment i oznacza niską
pewność poprawki.

**Uzasadnienie:** u dwujęzycznych osób jąkających się przeważają wyniki
pokazujące więcej niepłynności w słabszym języku (obraz niejednoznaczny,
małe próby; [[Język obcy i refleksja – research]]). Lepszy język obcy
obniża obciążenie formułowania, które może nasilać bloki.

**Powiązania:** Te same nagrania i rozmowy co 05 i 06 (B19); frazy
zasilają bibliotekę (02); plan (03) ustala proporcję języków.

## 10. Refleksja i wzorce *[B32]*

**Odpowiedzialność:** Pomagać użytkownikowi zauważać jego powtarzające
się wzorce (sytuacje, reakcje, energię, odkładanie, intencje) na
podstawie tego, co sam mówi, i zamieniać je w małe działania.

**Zakres na poziomie HLD:** Po wypowiedzi jedna linia lustra i jedno
pytanie. Temat, który wraca, pokazany z datami i cytatami użytkownika.
Wzorzec zapisany jako „sytuacja → co zrobiłem → skutek” słowami
użytkownika; plan „jeśli X, to Y” do potwierdzenia; karta tygodniowa i
przegląd miesięczny. Psychoedukacja o typowych wzorcach jako materiał,
z którego użytkownik sam wybiera nazwę.

**Granice (twarde):** AI nie nadaje etykiet schematów, nie interpretuje
źródeł ani dzieciństwa, nie diagnozuje i nie nazywa emocji, których
użytkownik nie nazwał. Wzorzec istnieje dopiero po potwierdzeniu przez
użytkownika („to nie to” go usuwa). Jedno pytanie dziennie, bez porad
nieproszonych. Pamięć jako tagi i liczniki, usuwalne. Przy treściach
kryzysowych informacja o pomocy zamiast analizy. Bez słów „terapia” i
„psychoanaliza” w nazwie i opisie; przeznaczenie: wellbeing. Funkcja
dobrowolna.

**Uzasadnienie:** wersja „AI znajduje złe schematy i ich źródła” to w
praktyce psychoterapia: dowody na zmianę schematów przez self-help są
słabe, a APA (XI 2025), prawo Illinois (VIII 2025) i MDR (deklarowane
przeznaczenie) stawiają tu granicę. Wartość dają pamięć i zestawienie
wpisów w czasie oraz plany „jeśli–to” ([[Język obcy i refleksja – research]]).

**Powiązania:** cele z 01; wzorce z rozmów w 05; lęk przed mówieniem i
unikanie rozmów → 07; plan (03) korzysta z wzorców tylko za zgodą
użytkownika.

## 4. Przepływ na poziomie HLD

Ścieżka użytkownika: wywiad i ocena → indywidualny plan → realizacja
ćwiczeń → trening komunikacji → monitorowanie postępów → aktualizacja
planu. *[B18]* Po osiągnięciu celu → utrzymanie (rzadsze przeglądy) →
przy sygnale nawrotu powrót do wcześniejszego etapu planu.

Biblioteka ćwiczeń jest zapleczem zasobowym planu i realizacji, a
wsparcie psychologiczne działa równolegle. *[B31, B32]* Trening języka
obcego (09) i refleksja (10) też działają równolegle i korzystają z
tych samych wypowiedzi użytkownika. Panel logopedy może obejmować
nadzór nad całym cyklem.

Zależności architektoniczne: biblioteka ćwiczeń → generator planu;
wywiad → generator planu; realizacja i trening → monitorowanie →
generator planu. To nie jest kolejność ekranów aplikacji.

## 5. Pomysły odłożone / niezatwierdzone jako baza

**Korektor jąkania:** możliwy osobny moduł wspierający mowę w czasie
rzeczywistym (np. odsłuch lub inne wskazówki). Pomysł pozostaje otwarty;
nie podejmowaliśmy decyzji, czy i w jakiej postaci ma wejść do produktu.
Nie należy zakładać, że trwale „usuwa” jąkanie. Badania: sam DAF nie
daje trwałego efektu, działa tylko w trakcie użycia (metaanaliza
2000–2024). *[B19]* Analiza nagrań przestała być częścią korektora: jest
teraz w bazie, w module 06.

**Społeczność użytkowników:** potencjalny moduł wymiany doświadczeń i
wzajemnego wsparcia; na ten moment poza zaakceptowaną ósemką.

## 6. Granice i kwestie do dalszego dopracowania

- Główny punkt wyjścia to dorośli użytkownicy mówiący po polsku;
  ewentualna wersja dla dzieci wymaga osobnego podejścia.

- Aplikacja ma wspierać pracę nad komunikacją i jąkaniem, nie obiecywać
  wyleczenia ani samodzielnie stawiać diagnozy klinicznej.

- Nagłe pojawienie się jąkania u osoby dorosłej powinno uruchamiać
  informację o potrzebie pilnej oceny medycznej.

- Nagrania i informacje o trudnościach użytkownika wymagają
  zabezpieczenia prywatności, zgód i odpowiedniego podejścia do ochrony
  danych.

- Przed wdrożeniem funkcji o deklarowanym celu terapeutycznym należy
  zweryfikować ich zasadność kliniczną i ewentualne obowiązki
  regulacyjne.

- Do ustalenia później: zakres MVP, kryteria personalizacji, sposób
  pracy AI, rola specjalisty, pomiar skuteczności i kolejność
  implementacji.

*[B20]* **Minimum bezpieczeństwa – kto za co odpowiada:**

| Zasada | Moduł |
| --- | --- |
| Pytanie o początek jąkania; nagły początek w dorosłości → informacja o pilnej ocenie medycznej | 01 |
| Nie obiecujemy wyleczenia, nie diagnozujemy, nie nazywamy emocji, których użytkownik nie nazwał | wszystkie, szczególnie 01, 06, 07 |
| Ocena AI to informacja zwrotna, a nie ocena kliniczna; wyraźnie tak opisana | 05, 06 |
| Informacja o pomocy kryzysowej przy treściach kryzysowych | 07 (i każde miejsce, gdzie AI czyta wypowiedzi) |
| Zgoda na nagrania, krótka retencja, usuwanie danych; dane o zdrowiu traktowane jako szczególna kategoria (RODO art. 9) | 01, 05, 06, 08 |
| Specjalista widzi tylko uzgodniony zakres danych, za zgodą użytkownika | 08 |
| Funkcja o deklarowanym celu terapeutycznym przechodzi weryfikację kliniczną i regulacyjną przed udostępnieniem innym | 02, 03, 05, 06 |
| *[B31]* Niepłynność nie jest błędem językowym; poprawki tylko po wypowiedzi | 09 |
| *[B32]* Bez etykiet, diagnoz i interpretacji źródeł; wzorzec tylko po potwierdzeniu użytkownika; pomoc kryzysowa; przeznaczenie wellbeing, bez „terapii” w nazwie | 10 |

## 7. Prototyp n=1 i kolejność budowy *[B12]*

- Dzisiejsza aplikacja to **narzędzie Alka do własnego treningu**, które
  przez dogfooding ma stać się aplikacją z tego HLD. Moduły powstają
  najpierw w wersji dla jednej osoby: bez kont, backendu i panelu.
- **Cel nadrzędny: trening Alka.** Moduł budujemy wtedy, gdy pomaga
  temu treningowi. Jeśli funkcja „pod produkt” konkuruje z tym, czego
  trening potrzebuje w danym tygodniu, wygrywa trening.
- **Kolejność:** najpierw dopracowujemy to, co jest w codziennym
  użyciu: 04 Realizacja ćwiczeń, 05 Trening komunikacji (zadania w
  terenie), 06 Monitorowanie (samoocena), 08 w wersji minimum (raport) i
  02 jako dane. Później, po dopracowaniu funkcjonalności, dochodzą: 01
  Wywiad w aplikacji, 03 Generator planu (silnik), ocena mowy przez AI z
  nagrania i rozmowy na żywo (B19), 07 oraz *[B31, B32]* 09 i 10.
  Dla Alka pierwsze wersje 09 (#13 English card) i 10 (#12 jedno
  pytanie) w M3, na dzisiejszej ocenie z transkryptu.
- *[C3, 11.11]* **Wyjątek prywatny – zakaz przeniesienia do produktu.**
  Ekran „Oceń” w prototypie prosi model o sekcję „Treść i samorozwój”
  (co mówca ujawnia o sobie, słaby punkt w formułowaniu myśli) i nie
  opisuje wyniku jako „informacja zwrotna, nie ocena kliniczna”. Alek
  świadomie zostawia to dla siebie. W tej postaci prompt i ekran
  **kategorycznie nigdy nie wchodzą do wersji dla innych użytkowników**:
  łamią minimum bezpieczeństwa z §6 (wnioskowanie o osobie, brak
  etykiety, brak informacji o pomocy kryzysowej). Wersję produktową
  pisze się od nowa wg §6 i modułu 10, a nie przez kopiowanie tego
  promptu.
- **Czego prototyp nie dowodzi:** sprawdza, czy z aplikacji da się
  codziennie korzystać i czy pętla „plan → ćwiczenia → pomiar → zmiana
  planu” działa. Nie dowodzi skuteczności klinicznej ani popytu
  rynkowego.
- **Zasada backlogu:** w backlogu jest tylko to, co wynika z tego HLD
  (moduł 01–08) albo bezpośrednio mu służy (fundament techniczny z
  przypisanym modułem). Nowy pomysł spoza HLD najpierw trafia do HLD
  (decyzja Alka), potem do backlogu.

Status dokumentu: zapis uzgodnionej struktury produktu i opisu
odpowiedzialności modułów. Nie jest to ostateczna specyfikacja
funkcjonalna ani zalecenie terapeutyczne.
