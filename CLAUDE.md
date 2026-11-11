# CLAUDE.md - The Compendium

Instructions for AI assistants working in this repository.

## What this is

The first Compendium: a suite of seven puzzle volumes, including Causeway (word ladder), Reckoner (number grid), Skein (word snake) and Winnow (categories), merged into one file. It is also built as an Android app.

- Live: https://connex222.github.io/COMPENDIUM/ (GitHub Pages, updates automatically from `main`)
- Audience: Puzzle players on phones.

## Architecture

- **One self-contained file: `index.html`.** All CSS, JavaScript, fonts and artwork live inside it.
- State is saved in the browser's `localStorage`. Theme and per-volume progress (keys include `cmp_theme`). Each volume keeps its own keys. Never rename an existing key without migrating the old data, or players lose their progress.

## Hard rules

- **Fully offline.** No network requests: no CDNs, no fonts or images from the internet, no analytics, no `fetch`.
- **No external dependencies.** Everything stays inside `index.html`.
- Readable in direct sunlight and in the dark (provide both light and dark themes with strong contrast).
- Works one-handed on a phone in portrait, and safe to interrupt at any moment without losing progress.
- Free to use. Do not add adverts, tracking or sign-ups.

## Project notes

- Volumes are kept separate so their `const` names cannot collide (the Android build uses same-origin iframes per volume). Keep each volume self-contained.
- `APP_VERSION` in `index.html` is the version (currently 4.2).

## Working with Shaun (the owner)

- Shaun is not a programmer. Explain every step in plain English, in order, and assume no prior knowledge.
- Always return the complete `index.html`, never partial snippets or "..." placeholders.
- Use UK English.
- Before saying a change is finished, check that the file still opens with no errors in the browser console.
- Never force-push, rewrite history or rename the repository.
