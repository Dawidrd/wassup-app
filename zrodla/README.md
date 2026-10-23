# Źródła Wassup

Jedyne dopuszczalne źródło liczb, progów, brzmień oświadczeń i ostrzeżeń w aplikacji Wassup.
**Ani aplikacja, ani Claude nie zgadują.** Jeśli czegoś tu nie ma, piszemy „brak w źródłach” i pytamy, zamiast uzupełniać z pamięci modelu.

Repozytorium musi być **prywatne**. Część dokumentów jest poufna (`05-wassup/`) albo chroniona prawem autorskim (`03-normy-zywienia/`, `04-samoregulacja/`).

## Zasady korzystania
1. **Pierwszeństwo:** tekst aktu prawnego (`01`, `02`) > normy i wytyczne (`03`) > samoregulacja (`04`) > nasze syntezy (`05-wassup/baza-regulacyjna-synteza.md`). Synteza to skrót roboczy: przed użyciem liczby w kodzie sprawdź ją w dokumencie źródłowym.
2. **Każda liczba w kodzie ma źródło.** W komentarzu podaj plik i miejsce, np. `// RWS: 01-prawo-ue/1169-2011…txt, zał. XIII cz. A`. Tak samo w opisie commita przy zmianie progu.
3. **Oświadczenia zdrowotne** wyświetlamy wyłącznie w brzmieniu z `06-dane/oswiadczenia-432-2012.json` (wyciąg z 432/2012), łącznie z warunkami stosowania.
4. **Teksty .txt** to ekstrakty z PDF (do przeszukiwania). Przy wątpliwości (tabele, przypisy, znaki ►M) rozstrzyga PDF. `porozumienie-nadawcow…ocr.txt` to OCR skanu: przy cytowaniu sprawdzaj w PDF.
5. **Aktualność:** teksty UE to wersje skonsolidowane z EUR-Lex z datą w tabeli. Przed wyjściem do użytkowników zewnętrznych sprawdź, czy nie ma nowszej konsolidacji, zwłaszcza dla 1924/2006 i 2015/2283.
6. **Nowy dokument** dodajesz do właściwego folderu jako PDF + TXT i dopisujesz wiersz do tabeli poniżej (co to jest, wersja, do czego służy w aplikacji).

## Spis

### 01-prawo-ue — rozporządzenia i dyrektywy UE (teksty skonsolidowane, EUR-Lex)
| Plik | Akt | Wersja | Do czego w Wassup |
|---|---|---|---|
| `178-2002-ogolne-prawo-zywnosciowe` | Rozp. (WE) 178/2002, ogólne prawo żywnościowe | 01.01.2026 | definicje żywności, odpowiedzialność, zasada ostrożności |
| `2002-46-dyrektywa-suplementy-diety` | Dyrektywa 2002/46/WE o suplementach diety | 26.11.2025 | definicja suplementu, dozwolone witaminy i minerały oraz ich formy (zał. I i II), zakaz przypisywania właściwości leczniczych (art. 6) |
| `1169-2011-informacje-o-zywnosci` | Rozp. (UE) 1169/2011, informowanie konsumentów | 01.04.2025 | **RWS (zał. XIII)**, obowiązkowe elementy etykiety, zakaz sugerowania leczenia (art. 7 ust. 3) |
| `1924-2006-oswiadczenia-zywieniowe-i-zdrowotne` | Rozp. (WE) 1924/2006, oświadczenia | 13.12.2014 (sprawdzić nowszą) | zasady oświadczeń; oświadczenie „źródło [witaminy]” wymaga „znaczącej ilości” (15% RWS wg 1169/2011 zał. XIII cz. A pkt 2) |
| `1925-2006-dodawanie-witamin-i-mineralow` | Rozp. (WE) 1925/2006 | 26.11.2025 | **zał. III: substancje zakazane i ograniczone** (np. Ephedra, johimba, EGCG) |
| `1333-2008-dodatki-do-zywnosci` | Rozp. (WE) 1333/2008, dodatki | 18.02.2026 (tylko TXT) | dodatki (E-numery) na etykietach |
| `2015-2283-nowa-zywnosc` | Rozp. (UE) 2015/2283, nowa żywność | 27.03.2021 (sprawdzić nowszą) | status „novel food” składników |
| `432-2012-wykaz-dozwolonych-oswiadczen-zdrowotnych` | Rozp. Komisji (UE) 432/2012 | 20.08.2025 | **jedyna lista dozwolonych oświadczeń zdrowotnych** (zakładka „Sprawdzone działanie”, kontrola etykiet) |

### 02-prawo-pl — prawo polskie
| Plik | Akt | Wersja | Do czego w Wassup |
|---|---|---|---|
| `ustawa-o-bezpieczenstwie-zywnosci-i-zywienia` | Ustawa z 25.08.2006 | t.j. Dz.U. 2023 poz. 1448, zm. 2025 poz. 1424 | suplementy (art. 27, w tym ust. 5: oznakowanie, prezentacja i reklama nie mogą sugerować, że zbilansowana dieta nie wystarcza), powiadomienie GIS (art. 29–30), kary |
| `rozporzadzenie-mz-skladu-i-oznakowania-suplementow-tj-2023` | Rozp. MZ w sprawie składu oraz oznakowania suplementów diety, t.j. Dz.U. 2023 poz. 79 | 11.01.2023 | **minimum 15% RWS w porcji**, formy chemiczne, obowiązkowe elementy oznakowania suplementu (checklista etykiety) |

### 03-normy-zywienia — normy i wytyczne (chronione prawem autorskim, tylko do użytku wewnętrznego)
| Plik | Dokument | Do czego w Wassup |
|---|---|---|
| `normy-zywienia-dla-populacji-polski-2024.txt` | Normy żywienia dla populacji Polski, NIZP PZH-PIB 2024 (red. Rychlik, Stoś, Woźniak, Mojska), pełny tekst | **normy RDA/AI** wg płci, wieku, ciąży i laktacji; **UL** (tab. 30–32); **limity Zespołu ds. Suplementów Diety GIS** (rozdz. „Normy a suplementacja”); dane o spożyciu suplementów |
| `normy-2024-tabele-23-32-wyciag.txt` | Wyciąg tabel 23–32 | szybkie sprawdzanie liczb; rozstrzyga pełny tekst. Uwaga: w tab. 31 UL molibdenu w ciąży „7 mg” to najpewniej błąd w źródle |

### 04-samoregulacja — kodeksy branżowe (chronione prawem autorskim)
| Plik | Dokument | Do czego w Wassup |
|---|---|---|
| `kodeks-reklamy-suplementow-diety-krsio-2019` | Kodeks reklamy suplementów diety KRSiO, wersja 22.10.2019 | granice przekazu przy treściach produktowych i afiliacji; „Czerwone flagi w reklamach” |
| `porozumienie-nadawcow-reklama-suplementow-2019` | Porozumienie nadawców RTV z 25.11.2019 w sprawie zasad rozpowszechniania reklam suplementów | j.w.; TXT z OCR skanu |

### 05-wassup — dokumenty projektu (poufne)
| Plik | Co to jest |
|---|---|
| `mail-foundera-2026-09.txt` | **Oryginalny mail foundera/CEO** z wizją produktu (wrzesień 2026). Źródło celów produktu. |
| `wizja-produktu.md` | Synteza maila + punkty styku z regulacjami (do decyzji z prawnikiem) |
| `baza-regulacyjna-synteza.md` | Robocza synteza progów i zasad z dokumentów `01–04` (RWS, limity GIS, UL, checklista etykiety, substancje zakazane). Zawsze weryfikuj w źródle. |
| `pmf-i-model-biznesowy.md`, `pmf-raport-pelny.html` | Analiza PMF, model biznesowy, scenariusze, plan 90 dni (29.09.2026) |
| `partnerstwo-badamy-suplementy.md` | Analiza Fundacji Badamy Suplementy i pomysły na współpracę |
| `historia-wersji-aplikacji.md` | Historia wersji aplikacji v0.1–v0.9.1 i decyzje produktowe |

### 06-dane — dane maszynowe
| Plik | Co to jest |
|---|---|
| `oswiadczenia-432-2012.json` | Wszystkie oświadczenia z 432/2012: składnik, brzmienie, warunki stosowania, ograniczenia, opinia EFSA, strona PDF. Aplikacja używa wyciągu w `src/data/claims.json`. |

Dane o składzie żywności (`src/data/foods.json`) pochodzą z USDA SR28 (domena publiczna, repozytorium GitHub maxsu/USDA-SR28), z poprawką na brak wzbogacania żywności w Polsce; skrypt: `tools/foods_build.py`.

## Czego brakuje w źródłach (nie zgadywać)
- **Przepisy o wyrobach medycznych (MDR 2017/745)** i wytyczne MDCG: potrzebne do decyzji o granicach funkcji związanych z badaniami. Do pozyskania z prawnikiem.
- **RODO** (art. 9, dane o zdrowiu) i wytyczne UODO.
- **Pełny wykaz uchwał Zespołu ds. Suplementów Diety GIS** (mamy tylko limity zebrane w Normach 2024): https://www.gov.pl/web/gis/zespol-do-spraw-suplementow-diety
- **Katalog statusu „novel food” KE:** https://food.ec.europa.eu/food-safety/novel-food/novel-food-status-catalogue_en
- **Prawo farmaceutyczne** (reklama leków OTC, np. Ibuvit D3).
- **Polskie tabele składu żywności NIZP** (licencja do ustalenia, backlog t07).
