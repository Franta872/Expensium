# Contributing to Expensium

Contributions are welcome.

## Good first contributions

- Fix or improve one of the 137 languages and its Standard/Premium wordmarks.
- Report a YouTube DOM change that breaks the logo replacement.
- Improve accessibility or keyboard navigation.
- Add a missing UI translation.
- Improve documentation or tests.

## Development

1. Fork the repository.
2. Create a branch.
3. Make the change.
4. Run:

```bash
node tests/validate.mjs
node tests/core.mjs
npx web-ext lint --source-dir extension
```

5. Open a pull request.

## Translation changes

The wordmarks are deliberately playful pseudo-translations. When changing one,
include:
- the language/code;
- the old word;
- the proposed word;
- a short explanation from a speaker or reliable linguistic reasoning.

## AI contributions

AI-assisted contributions are allowed. Please disclose meaningful AI generation
in the pull request description. Generated code still needs testing and review.

## Style

Prefer boring, readable JavaScript over clever abstractions. This repository
already began life through vibe coding. It does not need to evolve into
archaeological JavaScript.
