# Expensium

[![Validate](https://github.com/Franta872/Expensium/actions/workflows/validate.yml/badge.svg)](https://github.com/Franta872/Expensium/actions/workflows/validate.yml)
[![CodeQL](https://github.com/Franta872/Expensium/actions/workflows/codeql.yml/badge.svg)](https://github.com/Franta872/Expensium/actions/workflows/codeql.yml)
![Firefox](https://img.shields.io/badge/Firefox-WebExtension-FF7139?logo=firefoxbrowser&logoColor=white)
![Vibe coded](https://img.shields.io/badge/development-100%25%20vibe--coded-8A2BE2)
![License](https://img.shields.io/badge/license-MIT-blue)

**Expensium** is a deliberately silly Firefox extension that replaces the
visible lettering in the **standard YouTube logo** or **YouTube Premium logo**
with a playful localized pseudo-brand.

The joke depends on which YouTube you actually have:

| Mode | Czech | English |
|---|---|---|
| Standard YouTube | **Reklamium** | **Adium** |
| YouTube Premium | **Drahium** | **Expensium** |

The extension detects Standard/Premium automatically, but the popup also has a
manual **Auto / Standard / Premium** override.

> [!IMPORTANT]
> **This project is 100% vibe-coded.**
>
> The implementation, refactors, documentation, tests, release packaging and
> repository setup were generated with **OpenAI's ChatGPT** from requirements,
> feedback and manual testing provided by **Franta872**. Franta872 directed the
> project and tested the results, but did not hand-write the implementation.
>
> Expensium itself does **not** use AI at runtime and does not send anything to
> an AI service. AI-generated code can be wrong, so changes should still be
> reviewed like any other code.

## Features

- Standard YouTube and YouTube Premium masthead support.
- Automatic Standard/Premium detection.
- Manual **Auto / Standard / Premium** override.
- **137 languages**, each with separate ad-themed and expensive-themed wordmarks.
- Automatic language detection.
- Searchable language picker.
- RTL support.
- Enable/disable switch that restores the original wordmark.
- Per-script optical sizing for Latin, Arabic/Hebrew, CJK and several other script families.
- Long translations compress mainly horizontally instead of becoming tiny.
- Dark/light mode friendly.
- No analytics, telemetry, advertising, tracking, accounts or network calls.

## Examples

| Language | Standard YouTube | YouTube Premium |
|---|---|---|
| English | **Adium** | **Expensium** |
| Čeština | **Reklamium** | **Drahium** |
| Deutsch | **Werbium** | **Teurium** |
| Polski | **Reklamium** | **Drogium** |
| Français | **Pubium** | **Chérium** |
| 日本語 | **広告ニウム** | **高価ニウム** |
| العربية | **إعلانيوم** | **غاليوم** |

These are intentionally jokes and pseudo-translations, not a serious
linguistics database.

## How detection works

In **Auto** mode Expensium reads the accessibility/title metadata attached to
the YouTube masthead logo. If it identifies **YouTube Premium**, the Premium
wordmark family is used. Otherwise the standard/ad-themed family is used.

You can override that from the popup at any time.

## How sizing works

YouTube's original lettering is path-based SVG. A normal font dropped into the
same coordinates looks noticeably wrong, so Expensium:

1. measures the original wordmark with `getBBox()`;
2. applies a writing-system-specific optical size profile;
3. keeps the intended visual height;
4. compresses excessive width separately;
5. aligns the measured glyph box inside the original lettering area.

It still cannot be mathematically identical to YouTube's custom path artwork,
but it is much closer than one fixed font size for every language.

## Privacy

Expensium stores only:

- enabled/disabled state;
- selected language;
- selected logo mode (`auto`, `standard`, or `premium`).

All values stay in Firefox through `browser.storage.local`.

There are no network APIs, remote scripts, analytics, telemetry, accounts,
tracking pixels, AI calls or advertising.

See [PRIVACY.md](PRIVACY.md).

## Permissions

| Permission / access | Why |
|---|---|
| `storage` | Remember enabled state, language and logo mode locally |
| `youtube.com` content script | Modify the wordmark rendered by YouTube |

## Development

There is intentionally **no compilation/minification/bundling step** for the
extension. The readable files in `extension/` are packaged directly.

Load locally:

1. Open `about:debugging`.
2. Choose **This Firefox**.
3. Click **Load Temporary Add-on…**
4. Select `extension/manifest.json`.
5. Open YouTube.

Run local checks:

```bash
node tests/validate.mjs
node tests/core.mjs
```

Run Mozilla's linter:

```bash
npx web-ext lint --source-dir extension
```

Build a ZIP:

```bash
python3 scripts/package.py
```

## GitHub automation

This repository includes:

- GitHub Actions validation and packaging
- Mozilla `web-ext lint`
- CodeQL
- Dependabot
- automatic GitHub Releases for `v*` tags
- SHA-256 release checksums
- issue forms
- pull request template
- CODEOWNERS
- release-note grouping
- security policy
- `CITATION.cff`

GitHub has successfully made changing a word in a website header resemble a
small aerospace programme.

## AI / vibe-coding provenance

See [AI_NOTICE.md](AI_NOTICE.md).

## Trademark notice

Expensium is an independent browser customization project and is **not**
affiliated with, endorsed by, sponsored by or officially connected with Google
or YouTube.

YouTube and YouTube Premium are trademarks of their respective owners.

See [NOTICE.md](NOTICE.md).

## Contributing

Contributions are especially welcome for better wordplay, script rendering,
accessibility and compatibility after YouTube changes its masthead again.

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).
