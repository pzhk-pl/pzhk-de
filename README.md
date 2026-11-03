![cover](https://raw.githubusercontent.com/kasiaizak/pzhk/master/src/assets/images/screenshot.jpg)

# PZHK

Szablon strony informacyjnej dla Polskiego Związku Hodowców Koni - [widok on-line](https://kasiaizak.github.io/pzhk/)

## Użyte technologie:

HTML5 i CSS3 (w tym Flexbox) z użyciem preprocesora Sass.

## Wymagania

Projekt wymaga Node.js **26.13.0** i npm **12.2.1**.
Wersję Node wskazują `.nvmrc` oraz `.node-version`; `package.json` dopuszcza
aktualizacje w ramach Node 26 i npm 12. `.npmrc` blokuje instalację na
niezgodnej wersji środowiska.

Polecenia poniżej są przeznaczone dla **Git Bash**. Przy użyciu nvm-windows:

```bash
nvm install 26.13.0
```

```bash
nvm use 26.13.0
```

lub

```bash
nvm use `cat .nvmrc`
```

```bash
npm install --global npm@12.2.1
node --version
npm --version
```

Bez menedżera wersji zainstaluj Node.js z [oficjalnej strony](https://nodejs.org/en/download).
Nie trzeba instalować Gulp globalnie. nvm-windows może wymagać uprawnień
administratora do przełączenia Node; instalację zależności i pracę z projektem
wykonuj jako zwykły użytkownik.

## Instalacja i podgląd zmian

W katalogu projektu:

```bash
npm ci
npm start
```

BrowserSync uruchamia stronę pod `http://localhost:3000`, otwiera przeglądarkę
i obserwuje HTML, SCSS, JavaScript, obrazy, pliki PWA oraz `robots.txt`.
`npm run watch` uruchamia ten sam tryb. Zatrzymanie: **Ctrl+C**.

Opcjonalnie zmień port lub wyłącz automatyczne otwieranie przeglądarki:

```bash
BROWSERSYNC_OPEN=false PORT=3010 npm start
```

## Struktura projektu

| Ścieżka | Przeznaczenie |
| --- | --- |
| `src/content/` | Źródłowe pliki HTML. |
| `src/scss/` | Style Sass; plik wejściowy: `main.scss`. |
| `src/js/` | JavaScript; plik wejściowy: `main.js`. |
| `src/assets/` | Obrazy i pozostałe zasoby kopiowane do `dist/assets/`. |
| `src/pwa/` | Pliki PWA kopiowane do katalogu głównego `dist/`. |
| `robots.txt` | Reguły dla robotów, kopiowane do `dist/`. |
| `dist/` | Wynik kompilacji, pomijany w Git na gałęzi źródłowej. |
| `scripts/prepare-page.cjs` | Kopiowanie workflow wyzwalającego publikację do `dist/.github/workflows/`. |
| `.github/workflows/` | Workflow wyzwalający publikację i współdzielony workflow wdrożenia SFTP. |

## Budowanie

```bash
npm run build
```

Build odtwarza katalog `dist/`: kopiuje HTML, zasoby, PWA i `robots.txt`,
kompiluje SCSS przez Dart Sass i Autoprefixer oraz JavaScript przez Webpack.
Tryb deweloperski generuje czytelne pliki i mapy źródeł; produkcyjny
minimalizuje CSS/JS bez map źródeł. Błędy kompilacji przerywają build.
Własne pliki umieszczaj w `src/`, ponieważ `dist/` jest usuwany przed
uruchomieniem podglądu i budowaniem.

## Publikacja przez gałąź `page` i SFTP

```bash
npm run deploy
```

Polecenie wykonuje kolejno:

1. `predeploy` uruchamia `npm run build` i odtwarza `dist/`.
2. `scripts/prepare-page.cjs` sprawdza obecność `dist/index.html` i kopiuje
   `page-trigger.yml` do `dist/.github/workflows/`.
3. `gh-pages -d dist -b page --dotfiles` publikuje zawartość `dist/` do gałęzi
   `page` repozytorium `origin`. Opcja `--dotfiles` uwzględnia katalog `.github/`.
4. Push do `page` uruchamia workflow `Publish website on page push`.
5. Workflow wywołuje `pzhk-pl/pzhk-de/.github/workflows/deploy.yml@master`,
   przekazując SHA opublikowanego commita. Wdrożenie pobiera ten commit
   i wysyła gotowe pliki na serwer przez SFTP.

Nazwa pakietu `gh-pages` pozostaje bez zmian, ale docelową gałęzią jest `page`.
GitHub Actions nie kompiluje źródeł; kompilacja odbywa się lokalnie przed pushem.
Gałąź `page` zawiera wygenerowane pliki, więc zmiany wprowadzaj w źródłach.

### Konfiguracja repozytorium

Przed pierwszą publikacją:

1. Sprawdź `git remote -v`. Publikacja wymaga uprawnień do zapisu w `origin`
   oraz skonfigurowanej tożsamości i uwierzytelniania Git.
2. Zapisz i wypchnij `.github/workflows/deploy.yml` do `master` repozytorium
   `pzhk-pl/pzhk-de`. Ta wersja workflow jest używana przez wyzwalacz.
   Zmiany w lokalnym `deploy.yml` zaczną działać po opublikowaniu ich na `master`.
3. Włącz GitHub Actions i dodaj poniższe sekrety w repozytorium, w którym
   powstaje push do `page`: **Settings → Secrets and variables → Actions →
   Repository secrets**.

| Sekret | Wartość |
| --- | --- |
| `SFTP_HOST` | Nazwa hosta serwera, bez prefiksu `sftp://`. |
| `SFTP_USERNAME` | Login użytkownika SFTP. |
| `SFTP_PASSWORD` | Hasło użytkownika SFTP. |
| `SFTP_PORT` | Port SSH/SFTP, np. `22`. |
| `SFTP_TARGET` | Katalog docelowy na serwerze; użyj ścieżki bez spacji. |
| `SFTP_KNOWN_HOSTS` | Wpisy w formacie `known_hosts` z zaufanymi kluczami hosta; dla niestandardowego portu wpis powinien wskazywać `[host]:port`. |

Klucze hosta potwierdź u administratora lub dostawcy serwera przed zapisaniem
sekretu. Workflow wymusza ich weryfikację przez `StrictHostKeyChecking yes`.
Przy użyciu innego repozytorium dostosuj odwołanie `uses` w `page-trigger.yml`
do repozytorium i gałęzi zawierających współdzielony workflow.

### Zakres wdrożenia i weryfikacja

Workflow przygotowuje paczkę z plików gałęzi `page`, pomijając `.git/`,
`.github/`, `deploy_bundle/` oraz pliki `*.yml` i `*.yaml`. Sprawdza obecność
`index.html`, a następnie przesyła paczkę za pomocą `lftp mirror -R`.
Obecna konfiguracja nie usuwa z serwera plików nieobecnych w paczce.

Po `npm run deploy` sprawdź wynik workflow w zakładce **Actions**,
a następnie otwórz stronę na serwerze i zweryfikuj treść oraz ładowanie zasobów.
Sukces lokalnego polecenia potwierdza publikację gałęzi `page`;
wynik wdrożenia SFTP jest dostępny osobno w GitHub Actions.

## Aktualizacja zależności

Po zmianie `package.json` uruchom `npm install` i zapisz również
`package-lock.json`. Do odtwarzalnej instalacji używaj `npm ci`.

```bash
npm outdated
npm audit
npm run build
```

Wynik audytu zależy od aktualnej bazy podatności i wersji zapisanych w lockfile.
Po aktualizacji zależności sprawdź również podgląd przez `npm start`.
