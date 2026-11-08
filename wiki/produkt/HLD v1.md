---
status: active
owner: Alek
updated: 2026-11-08
source: HLD_aplikacja_wsparcie_jakania_v1.docx (assets/)
tags: [produkt, hld]
---

# HLD v1 – aplikacja wsparcia jąkania (8.11.2026)

Kopia tekstowa dokumentu Alka; oryginał: `assets/HLD_aplikacja_wsparcie_jakania_v1.docx`. Porównanie z naszym planem: [[HLD v1 – porównanie z planem]].

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

Decyzja: powyższe osiem elementów stanowi zaakceptowany zakres bazowego
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

**Powiązania:** Współpracuje z planem, wsparciem psychologicznym i
monitorowaniem postępów.

## 06. Monitorowanie postępów

**Odpowiedzialność:** Dawać obraz zmian i umożliwiać aktualizowanie
planu pracy.

**Zakres na poziomie HLD:** Obserwuje nie tylko płynność, ale też
komfort komunikacji, napięcie, unikanie rozmów i uczestnictwo w
sytuacjach komunikacyjnych.

**Powiązania:** Zbiera informacje z ćwiczeń, treningu i samooceny;
zasila generator planu oraz panel logopedy.

## 07. Wsparcie psychologiczne

**Odpowiedzialność:** Pomagać w radzeniu sobie z lękiem, napięciem,
wstydem i unikaniem rozmów związanych z jąkaniem.

**Zakres na poziomie HLD:** Odrębna ścieżka wspierająca pracę nad
barierami emocjonalnymi i podejmowaniem sytuacji komunikacyjnych. Nie
zastępuje psychoterapeuty ani diagnozy psychologicznej.

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

## 4. Przepływ na poziomie HLD

Ścieżka użytkownika: wywiad i ocena → indywidualny plan → realizacja
ćwiczeń → trening komunikacji → monitorowanie postępów → aktualizacja
planu.

Biblioteka ćwiczeń jest zapleczem zasobowym planu i realizacji, a
wsparcie psychologiczne działa równolegle. Panel logopedy może obejmować
nadzór nad całym cyklem.

Zależności architektoniczne: biblioteka ćwiczeń → generator planu;
wywiad → generator planu; realizacja i trening → monitorowanie →
generator planu. To nie jest kolejność ekranów aplikacji.

## 5. Pomysły odłożone / niezatwierdzone jako baza

**Korektor jąkania:** możliwy osobny moduł wspierający mowę w czasie
rzeczywistym (np. odsłuch lub inne wskazówki) albo analizujący nagrania.
Pomysł pozostaje otwarty; nie podejmowaliśmy decyzji, czy i w jakiej
postaci ma wejść do produktu. Nie należy zakładać, że trwale „usuwa”
jąkanie.

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

Status dokumentu: zapis uzgodnionej struktury produktu i opisu
odpowiedzialności modułów. Nie jest to ostateczna specyfikacja
funkcjonalna ani zalecenie terapeutyczne.
