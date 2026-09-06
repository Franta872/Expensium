# Expensium

[![Validate](https://github.com/Franta872/Expensium/actions/workflows/validate.yml/badge.svg)](https://github.com/Franta872/Expensium/actions/workflows/validate.yml)
[![CodeQL](https://github.com/Franta872/Expensium/actions/workflows/codeql.yml/badge.svg)](https://github.com/Franta872/Expensium/actions/workflows/codeql.yml)
![Firefox](https://img.shields.io/badge/Firefox-WebExtension-FF7139?logo=firefoxbrowser&logoColor=white)
![Vibe coded](https://img.shields.io/badge/development-100%25%20vibe--coded-8A2BE2)
![License](https://img.shields.io/badge/license-MIT-blue)

**Expensium** is a deliberately silly Firefox extension that replaces the visible lettering in the **standard YouTube logo** or **YouTube Premium logo** with `Expensium` or one of **137 playful localized variants**.

It changes the wordmark only. YouTube's own icon, country code, layout and navigation stay in place.

> [!IMPORTANT]
> **This project is 100% vibe-coded.**
>
> The implementation, refactors, documentation, tests, release packaging and repository setup were generated with **OpenAI's ChatGPT** from requirements, feedback and manual testing provided by **Franta872**. Franta872 directed and tested the project, but did not hand-write the implementation.
>
> Expensium itself does **not** use AI at runtime and sends nothing to an AI service. AI-generated code can be wrong, so it should still be reviewed like any other code.

## Features

- Standard YouTube **and** YouTube Premium wordmarks.
- **137** playful language variants.
- **Expensium** as the international English default.
- Automatic browser/page-language mode.
- Searchable language picker with RTL support.
- Keyboard navigation with `/`, Escape and arrow keys.
- Instant enable/disable switch that restores the original wordmark.
- Light and dark theme support.
- No analytics, telemetry, ads, trackers, accounts or network requests.

| Language | Wordmark |
|---|---|
| English | **Expensium** |
| Čeština | **Drahium** |
| Deutsch | **Teurium** |
| Polski | **Drogium** |
| Français | **Chérium** |
| 日本語 | **高価ニウム** |
| العربية | **غاليوم** |

The localized names are intentionally jokes and pseudo-translations, not a linguistics database.

## How the logo replacement works

YouTube currently draws the icon and lettering as separate SVG groups. Expensium finds the lettering group, reads its actual SVG `getBBox()` dimensions, stores a clone of the original, and fits the selected wordmark into the same box. That lets one code path handle both the normal and Premium logo instead of hard-coding Premium dimensions.

The icon itself is not replaced. Turning Expensium off restores the cloned original lettering.

## Privacy

Expensium stores only the enabled state and selected language in `browser.storage.local`. There are no network APIs, remote scripts, analytics, telemetry, remote fonts or AI calls. See [PRIVACY.md](PRIVACY.md).

## Permissions

| Permission / access | Purpose |
|---|---|
| `storage` | Remember enabled state and selected language locally |
| `youtube.com` content script | Modify the locally rendered logo wordmark |

## Development

There is intentionally **no compilation, minification or bundling step**. The readable files in `extension/` are the files packaged for Firefox.

Load locally:

1. Open `about:debugging`.
2. Choose **This Firefox**.
3. Click **Load Temporary Add-on…**.
4. Select `extension/manifest.json`.
5. Open YouTube.

Checks:

```bash
node tests/validate.mjs
npx web-ext lint --source-dir extension
```

Package locally:

```bash
python3 scripts/package.py
```

## GitHub overkill, because apparently one joke needs infrastructure

This repository deliberately demonstrates a bunch of GitHub features:

- **GitHub Actions CI** validates and packages every push/PR.
- **CodeQL** scans the JavaScript.
- **Dependabot** watches GitHub Actions versions.
- **Tag-driven GitHub Releases** build an archive and SHA-256 checksum.
- **Automatic release notes** group changes by labels.
- **Issue forms** for bugs, features and translation fixes.
- **Pull request template** with test and AI-disclosure checkboxes.
- **CODEOWNERS** automatically requests the maintainer for review.
- **Security policy**, support guide and code of conduct.
- **CITATION.cff**, so GitHub can give this logo joke a literal “Cite this repository” button.

GitHub has successfully supplied enterprise-grade ceremony for changing a word in the corner of a website. Humanity perseveres.

## AI / vibe-coding provenance

See [AI_NOTICE.md](AI_NOTICE.md). The short version is not hidden behind euphemisms: **the code is AI-generated and the project is 100% vibe-coded**.

## Trademark notice

Expensium is an independent browser-customization project and is **not affiliated with, endorsed by, sponsored by or officially connected with Google or YouTube**. YouTube and YouTube Premium are trademarks of their respective owners. See [NOTICE.md](NOTICE.md).

## Contributing

Better language jokes, script fixes, YouTube-DOM compatibility fixes and accessibility improvements are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).
