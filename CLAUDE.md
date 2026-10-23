# Wassup — instrukcja dla Claude Code

**Wassup — „suplementy, które rozumiesz”.** Aplikacja dla osób zdrowych, które biorą albo rozważają suplementy. Pomaga sprawdzić, czy suplement jest w ogóle potrzebny, rozumieć dawki na tle norm i granic bezpieczeństwa oraz budować nawyk. Rynek: Polska. Język aplikacji i rozmów: polski.

- Repozytorium: https://github.com/Dawidrd/wassup-app (gałąź `main`, **musi być prywatne** — patrz `zrodla/`)
- Aplikacja (PWA na GitHub Pages): https://dawidrd.github.io/wassup-app/
- Backlog z postępem (artefakt claude.ai): https://claude.ai/artifact/3pYptHU8zGRh1x2a5gpJzR
- Właściciel produktu: Dawid. Dyskusje o kształcie produktu toczą się w projekcie „Wassup” na claude.ai, development tutaj.

## 1. Źródła: nie zgaduj

Wszystkie liczby (RWS, normy, UL, limity GIS), brzmienia oświadczeń zdrowotnych, ostrzeżenia i reguły etykiet bierzemy **wyłącznie** z folderu `zrodla/`. Zacznij od `zrodla/README.md`: spis dokumentów, hierarchia (akt prawny > normy > samoregulacja > nasza synteza) i lista tego, czego w źródłach brakuje.

- Jeśli czegoś nie ma w `zrodla/`, **nie uzupełniaj z pamięci**. Napisz Dawidowi, czego brakuje, albo oznacz w kodzie `TODO(źródło)`.
- Nowa lub zmieniona liczba w kodzie dostaje komentarz ze źródłem (plik + miejsce w dokumencie).
- Treści generowane przez AI w aplikacji mogą tylko przeformułowywać materiał z `zrodla/`. Nigdy nie tworzą twierdzeń zdrowotnych od zera.

## 2. Zasady produktu (twarde)

1. **Suplementy są dla ludzi zdrowych.** Użytkownik sam określa, czy w ogóle ich potrzebuje. Nie obiecujemy działania.
2. **Informujemy i liczymy, nie zalecamy dawek.** Aplikacja nigdy nie wylicza „ile brać”, także na podstawie wyników badań: to byłby wyrób medyczny (MDR, do potwierdzenia z prawnikiem). Porcję, cel i plan ustala użytkownik, najlepiej z lekarzem. Aplikacja je zapisuje i śledzi.
3. **Nie używamy słowa „niedobór”** w ocenach aplikacji (to diagnoza). Mówimy „poniżej normy”, „poniżej zakresu z wydruku”.
4. **UL = „Granica bezpieczeństwa”**: sufit, nie cel. Dla magnezu i kwasu foliowego UL liczymy tylko z suplementów (Normy 2024).
5. **Oświadczenia zdrowotne tylko z 432/2012**, w dosłownym brzmieniu, z warunkami stosowania. Synergie tylko jako edukacja ogólna, bez odniesienia do produktu.
6. **Wyniki badań:** porównujemy wyłącznie z zakresem z wydruku laboratorium przepisanym przez użytkownika. Nie podpowiadamy zakresów i nie interpretujemy wyników.
7. **„Czy nadal potrzebujesz?”** pojawia się w kluczowych momentach: kończący się zapas, wynik w celu, dieta pokrywa normę.
8. **Handel dopiero później:** żadnych płatnych rankingów. Linki afiliacyjne dopiero po konsultacji prawnej, nigdy dla leków OTC.
9. **Do AI nie wysyłamy danych o zdrowiu użytkownika.** Do modelu trafia tylko zdjęcie etykiety.

## 3. Stan obecny (v0.9.1, PWA bez backendu)

Funkcje:
- **Dziś:** odhaczanie produktów, bilans składników na tle RWS, normy, limitu GIS i UL; „Do normy brakuje”; sekcja Uwaga (UL, zapas, badania, kopia danych).
- **Historia:** wykres 30 dni, kalendarz, regularność.
- **Apteczka:** porcja −/+ z historią zmian, zapas, produkty zakończone.
- **Wiedza:** cele, pakiety „Sprawdzone działanie”, Czerwone flagi.
- **Badania** (tryb „Mam badania”): wyniki, okres do badania kontrolnego, przed i po.
- **Raport dla lekarza:** druk lub PDF.
- **Ty:** profil, przypomnienia .ics, eksport i import kopii.

Historia wersji i decyzje: `zrodla/05-wassup/historia-wersji-aplikacji.md`.

### Struktura
```
index.html          # szablon HTML + CSS i jednocześnie zbudowany wynik (skrypt wklejany przez build)
src/app.js          # rdzeń: NUTR (RWS, UL), NORMS, gisFor(), CATALOG, PACKS, widoki, akcje
src/diet.js         # kreator „Czy potrzebuję suplementów?”, ankieta FFQ, import XLSX/CSV, werdykty diety
src/labs.js         # tryb „Mam badania”: MARKERS, wyniki, alerty
src/periods.js      # okres do badania kontrolnego
src/report.js       # raport dla lekarza
src/data/claims.json  # oświadczenia 432/2012 używane w aplikacji
src/data/foods.json   # 139 produktów spożywczych (USDA SR28, bez wzbogacania)
tools/build.py      # skleja src/ do index.html
tools/foods_build.py  # historyczny skrypt budowy foods.json (wymaga lokalnej kopii SR28)
tests/              # testy Playwright (iPhone 13, motyw jasny i ciemny)
sw.js               # service worker, najpierw sieć; CACHE = "wassup-<wersja>"
manifest.webmanifest, icons/, reminders/*.ics
zrodla/             # dokumenty źródłowe (patrz §1)
```
Wszystkie pliki z `src/` są sklejane do jednego zakresu globalnego (bez modułów ES). CSS jest w `index.html`. **Nie edytuj skryptu w `index.html` ręcznie**: zmieniaj `src/` i uruchom `python3 tools/build.py`.

### Dane (localStorage, klucz `wassup.v1`)
```
{ v:1, created, profile:{sex:"m"|"f", age:"19-30"|..., state:"none"|"preg"|"lact"},
  products:[{id, cid?, name, brand, type:"suplement"|"lek", unit:"kapsulka"|"tabletka"|"kropla"|"saszetka"|"porcja",
             content:{<składnik>: ilość w 1 jednostce}, daily, doses:[{since, daily}], producerDaily, form, info,
             stock:{count, since, pack}, ended?}],
  log:{ "RRRR-MM-DD": { <productId>: liczba jednostek } },
  labs:[{id, m:"d25"|"ferr"|..., n, name?, date, value, unit, lo, hi, flag?, ts}],
  periods:[{id, start, testDate, items:[{k, m, name, unit, lo, hi, src:"lab"|"doctor"}], products:[id], doctor, note, closed?}],
  goals:{<składnik>: wartość}, packs:[], foodMap:{}, diet:{method:"ffq"|"file", date, intake:{...}, ...},
  prefs:{onlyLeft, labsMode, snooze, lastBackup, backupSnooze, dosesMigrated} }
```
Klucze składników: `mg d b6 c zn b12 fe fol ca k se i bio pot om3` (jednostki w `NUTR`). Witamina D: 1 µg = 40 IU. **Zmiany schematu muszą być wstecznie zgodne** (migracja w `fill()`), bo u Dawida są prawdziwe dane.

### Budowanie, testy, wdrożenie
```bash
python3 tools/build.py                       # po każdej zmianie w src/
python3 -m http.server 8766 &                # w katalogu repo
NODE_PATH=$(npm root -g) node tests/t11.js   # potrzebny playwright (npm i -g playwright)
```
Testy zakładają serwer na `localhost:8766` i sprawdzają brak błędów JS (`errs []`). Przed wydaniem uruchom wszystkie i obejrzyj zrzuty w obu motywach.

Wydanie:
1. Podbij `APP_VERSION` w `src/app.js` i `CACHE` w `sw.js`.
2. Uruchom build i testy.
3. Commit i push na `main`. GitHub Pages publikuje automatycznie.
4. Dopisz wersję do `zrodla/05-wassup/historia-wersji-aplikacji.md`.

Dawid testuje na iPhonie (PWA z ekranu początkowego).

## 4. Decyzje na wersję 1.0 (23.10.2026)

Cel: tracker z kontem użytkownika i skanem etykiety, który zasila wspólny katalog produktów sprawdzanych bazą wiedzy. Jest to też MVP skanera z planu 90 dni w `zrodla/05-wassup/pmf-i-model-biznesowy.md`: 100–300 testerów, D30 ≥ 15%.

- **Rozwijamy obecną aplikację**, nie piszemy nowej. Natywna aplikacja ma sens dopiero przy skalowaniu komercyjnym.
- **Backend: Supabase, region UE (Frankfurt), darmowy plan:**
  - Postgres z row level security dla danych użytkownika;
  - Auth z logowaniem Google;
  - Storage na zdjęcia etykiet (prywatny bucket);
  - Edge Functions do wywołań AI;
  - klucz Anthropic trzymany wyłącznie w sekretach Supabase.
- **Logowanie Google:** przycisk Google Identity Services, a potem `supabase.auth.signInWithIdToken`, bez przekierowań (iPhone PWA gubi sesję po redirectach). Plan B: magic link e-mail albo logowanie w Safari.
- **Rola AI:** Claude (vision) tylko **czyta** etykietę i zwraca dane w sztywnym schemacie JSON:
  - nazwa, marka, EAN;
  - forma i jednostka, porcja producenta;
  - składniki na 1 jednostkę i na porcję, z ilością, jednostką i wydrukowanym % RWS;
  - oświadczenia i ostrzeżenia z etykiety;
  - czytelność pól.

  **Ocenę robi deterministyczny silnik reguł** z `zrodla/`, nie AI. Model (tańszy czy dokładniejszy) wybieramy testem na 15–20 prawdziwych etykietach.
- **Weryfikacja bez ludzi** (bez działu operacyjnego i bez formularza poprawek):
  1. Automatyczne bramki odrzucają odczyt:
     - **kontrola krzyżowa ilości z wydrukowanym % RWS** (np. 102 mg Mg ↔ 27% RWS);
     - progi wiarygodności, np. Mg powyżej 400 mg w kapsułce wskazuje masę związku (MAG B6: 670 mg cytrynianu = 102 mg Mg);
     - na kapsułkę czy na porcję, IU czy µg;
     - niska czytelność.

     Przy niezgodności jedna druga próba dokładniejszym modelem, potem prośba o nowe zdjęcie.
  2. Potwierdzenie jednym stuknięciem: krótkie podsumowanie i pytanie „Zgadza się z opakowaniem?”. „Nie” oznacza nowe zdjęcie, bez edycji pól.
  3. Weryfikacja przez innych użytkowników:
     - produkt jest „niezweryfikowany”, dopóki druga, niezależna osoba nie zeskanuje go z tym samym wynikiem (wtedy automatycznie „zweryfikowany”);
     - po kilku zgłoszeniach „błąd w danych” produkt sam się ukrywa;
     - awaryjnie można go ukryć w panelu Supabase.
- **Dane o zdrowiu:**
  - wyniki badań i okresy zostają na urządzeniu, dopóki nie będzie osobnej, wyraźnej zgody (RODO art. 9, partia 6);
  - do chmury od partii 1 trafiają: profil, Apteczka, przyjęcia, historia porcji, wynik diety;
  - konto ma eksport danych i usuwanie (RODO).
- **Limit skanów** na osobę dziennie i limit wydatków na koncie Anthropic.
- **Zmiana domeny** (gdyby kiedyś nastąpiła) kasuje localStorage. Przenoszenie danych z telefonu na konto jest w partii 1.

## 5. Plan pracy w partiach

Każda partia to osobna wersja: build, testy Playwright w obu motywach, commit i push. Potem Dawid testuje na iPhonie kilka dni przed następną partią.

| Partia | Zakres | Gotowe, gdy |
|---|---|---|
| **0. Przygotowanie** | Dawid zakłada: projekt Supabase (UE), klienta OAuth Google Cloud, klucz API Anthropic z limitem wydatków; klucze wpisuje w panelach, nie w czacie. Ja: struktura `supabase/` (migracje, funkcje), wdrażanie przez GitHub Actions, strona testowa logowania. | logowanie Google działa w PWA z ekranu początkowego na iPhonie Dawida (albo wybrany plan B) |
| **1. Konto (v1.0-alpha)** | ekran logowania; tabele `profiles`, `user_products`, `intake_logs` z RLS; offline-first z synchronizacją; „Przenieś dane z tego telefonu na konto” (import `wassup.v1`); wylogowanie, eksport, usunięcie konta | dane Dawida są na koncie i widoczne po zalogowaniu na innym urządzeniu |
| **2. Katalog produktów** | tabele `products`, `product_ingredients` (EAN, rodzaj, jednostka, porcja producenta, status `unverified`/`verified`/`hidden`); wyszukiwarka przy dodawaniu do Apteczki; ręczny formularz zasila katalog; seed: MAG B6, Ibuvit D3 | produkt wybrany z katalogu trafia do Apteczki jednym stuknięciem |
| **3. Skan etykiety z AI** | zdjęcie pomniejszane na telefonie, potem Edge Function i Claude vision dają JSON; bramki z §4; potwierdzenie jednym stuknięciem; duplikaty po EAN; limit skanów; zdjęcie w prywatnym Storage | na 15–20 etykietach Dawida brak błędnych zapisów (odrzucenie jest dopuszczalne) |
| **4. Karta produktu (baza wiedzy)** | silnik reguł ze źródłami: składniki i formy (2002/46 zał. II, rozp. MZ), min. 15% RWS, limity GIS na porcję, UL razem z planem i dietą, obowiązkowe elementy etykiety, oświadczenia z etykiety wobec 432/2012 („nie znaleźliśmy w unijnym wykazie”), substancje z 1925/2006 zał. III, dublowanie składników w Apteczce | każde wskazanie na karcie ma przypisane źródło z `zrodla/` |
| **5. Kod kreskowy i jakość katalogu** | skaner EAN kamerą (biblioteka dołączona do repo, iOS nie ma `BarcodeDetector`); znaleziony = dodaj, brak = skan etykiety; weryfikacja drugim skanem; „Zgłoś błąd” i automatyczne ukrywanie | produkt zeskanowany przez dwie osoby sam staje się zweryfikowany |
| **6. Dane o zdrowiu i testerzy** | zgoda na synchronizację badań i okresów; polityka prywatności; ekran zgód; zaproszenia testerów. Wcześniej konsultacja prawna (MDR, RODO, afiliacja). | zgody i polityka zaakceptowane przez prawnika |

Otwarte poza partiami (backlog):
- testy Dawida na sobie;
- kontakt z Fundacją Badamy Suplementy (`zrodla/05-wassup/partnerstwo-badamy-suplementy.md`);
- licencja polskich tabel składu NIZP;
- eksport z Fitatu (zaparkowany);
- pomysły: push, kolejne pakiety, dziennik diety z AI, skan wydruku z laboratorium, lekarz w aplikacji, afiliacja.

## 6. Styl pracy

- Rozmawiaj z Dawidem po polsku, prostym językiem. Najpierw krótki plan, potem zmiany. Przy decyzjach produktowych zapytaj, zanim zaczniesz kodować.
- Teksty w aplikacji: krótkie, spokojne, bez straszenia i bez obietnic. Zawsze z możliwością „zapytaj lekarza lub farmaceutę”.
- Nie używaj zewnętrznych CDN w aplikacji. Biblioteki dołączaj do repo, bo aplikacja ma działać offline.
- Sekrety (klucze Supabase service role, Anthropic) nigdy w repo. Publiczny może być tylko klucz `anon` Supabase.
