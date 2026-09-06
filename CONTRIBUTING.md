# Contributing to Expensium

Contributions are welcome, especially translation jokes, YouTube DOM compatibility fixes, accessibility improvements and tests.

## Development

1. Fork the repository and create a branch.
2. Make your change.
3. Run:

```bash
node tests/validate.mjs
npx web-ext lint --source-dir extension
```

4. Open a pull request.

## Translation changes

Wordmarks are deliberately playful pseudo-translations. Include the language/code, old wordmark, proposed wordmark and a short explanation. Native-speaker context is especially useful.

## AI contributions

AI-assisted contributions are allowed. Disclose meaningful AI generation in the pull request description. Generated code still needs testing and review.

## Style

Prefer boring, readable JavaScript over clever abstractions. This repository already began life through vibe coding. It does not need to become archaeological JavaScript.
