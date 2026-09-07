# Notes for AMO Reviewers

## Behavior

Expensium modifies only the visible lettering in the YouTube masthead.

It supports:
- standard YouTube;
- YouTube Premium.

Auto mode determines the family from masthead title/ARIA metadata. Users can
manually override this with Standard or Premium mode.

The extension measures the original SVG wordmark with `getBBox()` and places an
SVG text replacement into the same region. Different script families use
different optical size profiles. Excessively long variants are compressed
horizontally rather than reduced uniformly.

When disabled, Expensium restores a clone of the original lettering group.

## Permissions

- `storage`: enabled state, language and logo-mode preference only.

Content-script access is limited to YouTube.

## Data collection
None.

`browser_specific_settings.gecko.data_collection_permissions.required` is
`["none"]`.

## Remote code / network
None. No `fetch`, XHR, WebSocket, remote scripts, analytics, telemetry, remote
fonts or AI API calls.

## AI disclosure
The source was generated/iterated with OpenAI's ChatGPT under the direction and
manual testing of the maintainer. AI is not used at runtime.

## Source / build
No compilation, transpilation, minification or bundling is required. Files in
`extension/` are packaged directly.

## Automated checks
- manifest and JavaScript syntax
- no-network-API scan
- 137 languages with both wordmark families
- Standard/Premium detection
- manual override behavior
- Czech and English mapping checks
- per-script sizing-profile checks
