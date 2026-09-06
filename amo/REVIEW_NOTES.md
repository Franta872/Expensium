# Notes for AMO Reviewers

## Behavior

Expensium modifies the YouTube masthead on `youtube.com`. It supports both the standard YouTube logo and YouTube Premium logo.

The extension finds the SVG group used for visible lettering, records its actual `getBBox()` dimensions, clones the original group for restoration, and replaces only the lettering with an SVG text element. The site's icon group remains untouched.

## Permissions

`storage` is used only for the enabled state and language preference. The content script is statically limited to `https://www.youtube.com/*` and `https://youtube.com/*`.

## Data collection

None. `browser_specific_settings.gecko.data_collection_permissions.required` is explicitly `["none"]`.

## Network / remote code

None. There is no `fetch`, XHR, WebSocket, remote script, analytics, telemetry, remote font or AI API call.

## AI development disclosure

The source was generated and iterated with OpenAI's ChatGPT under the direction and manual testing of the maintainer. This is disclosed in README.md and AI_NOTICE.md. AI is not used at runtime.

## Source / build

There is no compilation, transpilation, minification or bundling step for the extension. The readable files in `extension/` are packaged directly into the AMO ZIP.

## Quick test

1. Install the extension and open YouTube.
2. The masthead lettering should become Expensium for either the standard or Premium logo.
3. Pick another language from the popup and confirm the wordmark changes.
4. Disable Expensium and confirm the original wordmark returns.
