---
status: active
updated: 2026-11-07
source: subagent research (WebSearch), sesja Claude Code 2026-11-07
tags: [research, transkrypcja]
---

# Transkrypcja polskich nagrań na iPhonie (stan: listopad 2026) — research

Legenda: [Z] = potwierdzone źródłem (link), [W] = moje wnioskowanie / niepotwierdzone.
Uwaga metodyczna: w tej sesji nie dało się otworzyć stron apple.com, support.apple.com, apps.apple.com, support.claude.com
(blokada sieci) — oficjalne listy języków znam tylko z omówień w prasie/blogach. Ceny App Store zależą od kraju; cen w PLN nie zweryfikowałem.

## 1. Apple Dyktafon / Notatki — transkrypcja audio (iOS 18 / iOS 26)
- [Z] Polski NIE jest obsługiwany. Lista startowa (iOS 18) to 10 języków: EN, ES, PT, IT, FR, DE, JA, KO, ZH (upr./trad.);
  blogi wprost wymieniają polski jako nieobsługiwany. https://transcribier.com/voice-memos-transcription-language ,
  https://loronote.com/en/blog/voice-memos-transcript-not-working
- [Z] Silnik iOS 26 (SpeechAnalyzer/SpeechTranscriber) wg stanu na sierpień 2026 obsługuje 42 lokalizacje / 22 języki — bez polskiego,
  czeskiego, ukraińskiego. Deweloperzy raportują, że `supportedLocale` dla pl-PL zwraca nil.
  https://loronote.com/en/blog/apple-speechanalyzer-vs-whisper , https://developer.apple.com/forums/tags/speech ,
  https://blog.addpipe.com/apple-speechanalyzer-api/
- [Z] Apple Intelligence/Siri nie mają polskiego; iOS 26.1 dodał 8 języków (m.in. duński, holenderski, turecki) — polskiego brak.
  https://www.macrumors.com/2025/09/22/ios-26-1-apple-intelligence-languages/ , https://9to5mac.com/2025/11/11/ios-26-1-brings-apple-intelligence-to-these-eight-new-languages/
- [Z] Które ustawienie decyduje: wg poradników transkrypcja w Dyktafonie/Notatkach pojawia się tylko, gdy JĘZYK URZĄDZENIA
  (Ustawienia > Ogólne > Język i region) jest na liście obsługiwanych; Apple odsyła do strony „Feature Availability".
  https://www.yaps.ai/blog/voice-memos-transcription-not-working , https://support.apple.com/en-al/guide/iphone/iph57c6590e9/ios
- [W] Zmiana języka urządzenia na angielski da transkrypcje angielskich nagrań, ale polskie nagrania nadal będą bez transkryptu
  (lub z bełkotem). Akcja Skrótów „Transkrybuj dźwięk" korzysta z tego samego silnika, więc polskiego też nie obsłuży.

## 2. Dyktowanie klawiaturą (po polsku) do Notatek — obejście
- [Z] Polskie dyktowanie istnieje od iOS 8; jest w pełni dostępne w iOS 18/26 (to nie jest Siri ani Apple Intelligence).
  https://9to5mac.com/2015/01/12/siri-slovak-czech-polish/ , https://discussions-jp-prz.apple.com/thread/256082630
- [Z] Limit 60 s zniesiono w iOS 15; dyktowanie kończy się samo po ~30 s ciszy; brak twardego limitu długości.
  https://talk.macpowerusers.com/t/dictation-on-device/25986 , https://discussions.apple.com/thread/254578866
- [Z] Interpunkcję wstawia się komendami głosowymi („przecinek", „kropka"); automatyczna interpunkcja i komendy edycyjne
  są ograniczone do angielskiego. https://transkriptor.com/pl/dyktowanie-iphone/ , https://www.laxis.com/blog/apple-dictation/
- [W] Czy polski działa w pełni offline (on-device) — nieoficjalne; brak potwierdzenia Apple. Wada praktyczna: trzeba mówić
  „na żywo" do telefonu z otwartymi Notatkami, nie ma pliku audio do ponownego użycia; 2-min monolog mieści się bez problemu.

## 3. Aplikacje Whisper działające lokalnie na iPhonie (polski obsługiwany)
- Aiko (Sindre Sorhus) — [Z] jednorazowa opłata (w DE 25 EUR, w US ~22 USD; PLN niezweryfikowane), 100 języków w tym polski,
  offline, na iOS model Whisper medium/small (zależnie od RAM), wymaga iOS 18.5+ i A12+. Udostępnianie z Dyktafonu
  przez Skrót; UWAGA: deweloper pisze, że na iOS 26 „Udostępnij" z Dyktafonu nie działa (błąd iOS) — obejście: zapis do Plików
  i import stamtąd. https://sindresorhus.com/aiko , https://apps.apple.com/de/app/id1672085276 , https://apps.apple.com/gb/app/id1672085276
- Whisper Notes — [Z] jednorazowo ~4,99–7,99 USD (zależnie od kraju), 100% offline, import pliku lub „…" > Udostępnij > Whisper Notes
  z Dyktafonu, kopiowanie samego tekstu, iPhone 12+/iOS 18+; „80+ języków", polski wymieniony w listingu AU.
  https://whispernotes.app/pl/whisper-app , https://apps.apple.com/au/app/id6447090616 . [W] Transkrypcja zatrzymuje się po wyjściu z apki (ograniczenie iOS).
- Whisper Transcription (Good Snooze, twórca MacWhisper) — [Z] darmowa z modelami tiny/base offline, Pro/Assistant w subskrypcji
  (US: 5,99 USD/tydz. lub 12,99 USD), „100 języków"; recenzje narzekają na cięcie darmowych minut. https://apps.apple.com/app/id1668083311
- VAYS — [Z] marketing wprost „po polsku lub angielsku", silnik Parakeet on-device, „Free · Pro on Mac"; [W] cena iOS i jakość polskiego niezweryfikowane. https://vays.pages.dev/
- [W] Jakość: Whisper small/medium po polsku jest wyraźnie słabszy niż large (fine-tune medium: WER ~8,9 na Common Voice 11;
  base: WER ~42). Na iPhonie wybieraj największy dostępny model. https://huggingface.co/bardsai/whisper-medium-pl

## 4. Google i inne darmowe opcje na iPhonie
- [Z] Google Recorder — tylko Pixel, brak na iOS. https://voicenotes.com/blog/apple-vs-google-voice-recorder
- [Z] Gboard iOS ma polski i głosowe pisanie (od 2017); [W] polskie dyktowanie głosem w Gboard niepotwierdzone w 2026. https://blog.google/products-and-platforms/products/search/gboard-iphone-gets-upgrade/
- [Z] Google Translate „Transkrybuj" — 8 języków, bez polskiego. https://betanews.com/2020/03/18/google-translate-update-speech-transcription
- [Z] Aplikacja Gemini (iOS) przyjmuje pliki MP3/M4A/WAV od IX 2025; plan darmowy: łącznie do 10 min audio na prompt, 100 MB/plik,
  5 promptów dziennie. https://bgr.com/1962690/google-gemini-app-upload-audio-files/ , https://iamtypist.dev/blog/gemini-transcribe-audio
- [Z] Microsoft Word mobile: dyktowanie po polsku na oficjalnej liście MS. https://support.microsoft.com/en-us/word/dictate-your-documents-in-word-mobile
- [W] ChatGPT: wg blogów upload audio od 6 X 2026 tylko w planach płatnych — nie potwierdzone u OpenAI.

## 5. Wgranie .m4a do czatu Claude (aplikacja claude.ai)
- [Z] Wg źródeł z X 2026 powołujących się na centrum pomocy Anthropic: lista załączników to dokumenty i obrazy — audio (MP3/M4A/WAV) NIE jest
  obsługiwane ani w claude.ai, ani w API. Tryb głosowy to dyktowanie na żywo, nie analiza nagrań.
  https://getmeetnotes.com/blog/can-claude-transcribe-audio/ , https://mytranscriber.app/blog/guides/2026-05-31/voice-memos-as-ai-context
- [Z] Tryb głosowy Claude: 11–14 języków (EN, FR, DE, HI, ID, IT, JA, KO, PT-BR, ES…) — polskiego brak. https://the-decoder.com/claudes-voice-mode-now-runs-on-anthropics-most-capable-models-across-all-platforms/
- [W] Nie udało się otworzyć support.claude.com; limity wielkości plików w źródłach są sprzeczne (10–500 MB) — nieistotne, skoro audio nie przechodzi.
  Wniosek: ścieżka „wgraj m4a do Claude" obecnie nie działa; Claude może tylko poprawić/streścić gotowy tekst.

## 6. Rekomendacja (ranking: tarcie dzienne / koszt / jakość PL / prywatność)
1. Whisper Notes lub Aiko (offline, jednorazowo ~5–25 USD). Najlepsza prywatność, dobra jakość PL przy większym modelu, brak limitów.
   Dziennie: nagraj w Dyktafonie > „…" > Udostępnij > Whisper Notes (Aiko na iOS 26: zapisz do Plików > importuj) > Kopiuj tekst > wklej do apki.
   [W] Zacznij od Whisper Notes (taniej, udostępnianie z Dyktafonu działa wg dewelopera); Aiko, jeśli chcesz model medium.
2. Gemini (darmowe, 10 min/prompt wystarcza na 2-min monolog). Najmniejsze tarcie bez zakupu, chmura Google (prywatność gorsza).
   Dziennie: Dyktafon > Udostępnij > Gemini > „Zrób dosłowną transkrypcję po polsku, bez poprawek" > kopiuj > wklej.
3. Dyktowanie po polsku prosto do Notatek (0 zł, bez instalacji, offline). Wymaga mówienia na żywo i dyktowania interpunkcji; brak pliku audio.
   Dziennie: Notatki > mikrofon na klawiaturze (język PL) > mów 2 min > Zaznacz wszystko > Kopiuj > wklej.
Poza rankingiem: angielskie monologi dalej rób wbudowaną transkrypcją Dyktafonu (język urządzenia EN); Claude użyj tylko do korekty tekstu.
