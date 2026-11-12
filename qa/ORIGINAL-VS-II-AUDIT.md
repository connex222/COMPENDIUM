# THE COMPENDIUM (original) — product, technical and preservation audit

Review branch: `improvement/compendium-original-focus` (DO NOT MERGE OR DEPLOY without explicit approval).
Reference: `connex222/COMPENDIUM` main at `1982226f8f0b61c49793b527ed359d148bd1845d` and `connex222/COMPENDIUM-2` main at `d8d4995861d316627a32a78672bc65c6ce543e28` (12 November 2026).
The earlier original release remains untouched. The sequel also remains untouched.

## Decision — KEEP AS A DISTINCT CLASSIC COLLECTION

**Keep the original as the accessible, classic, replayable word/logic collection.** The sequel is a separate collection of nine more experimental visual, spatial and deduction experiences. They share a brand but **not identical games**, and the original is not an obsolete launcher. Avoid a single merged save system or combining the original's games into the sequel now. The only product-level cross-link added here is a clearly labelled, user-initiated online link to the sequel; the original game file still runs offline.

A future *optional* umbrella launcher with independent seven- and nine-puzzle entries is preferable to game migration. Such a launcher must launch each published collection intact and must not import or clear either collection's storage.

## Ranked puzzle evaluation — provisional, NOT player telemetry

Ranking reflects distinctive mechanics, code-supported replay supply, fit as a classic phone puzzle and clearly inspectable game loop. We have **no real completion or retention analytics**, so do not interpret ranking as measured engagement.

| Rank | Original puzzle | Mechanic / supply confirmed in code | What works, what limits it | Priority and overlap |
| --- | --- | --- | --- | --- |
| **1** | **Causeway** | Classic letter-change ladders plus rearranging doublets; **3,600 authored start/end challenges**, six mode/length combinations and four difficulty tiers; daily/free | Strong approachable wordplay and a clear shortest-path/par payoff. Previously lost unfinished ladder/typed letters; isolated validated recovery added. Validate long-word first-use graph performance and keyboard/touch. | **Polish first**; Riffle II is word finding, not a ladder |
| **2** | **Skein** | Trace word paths through a themed grid; **576 boards** across 24 themes | Very distinctive tactile action, multiple sizes and tiers, appealing finding/reveal. Previously lost solved threads; recovery added. Drag-only control remains a keyboard-accessibility gap. | **Polish next**; not duplicated in II |
| **3** | **Winnow** | Four intersecting categories of 16 words; **36 curated boards** (24 General, 8 British Isles, 4 Cryptic) | Easy to explain, fast reveal and interesting near-misses. Board supply is much smaller than Causeway/Skein, so replay fatigue is a real constraint. Previously lost order/groups/mistakes; exact shuffle/attempt restore added. | **Polish third**; Riffle uses letters, not category sets |
| 4 | **Cyphr** | Substitution mapping: each number represents a letter; **107 grids** with three levels | Existing per-grid mapping, completion history and cascading duplicate-cell feedback. Audit keyboard/focus and dense small-screen cells before widening scope. | Keep distinct; no exact II equivalent |
| 5 | **Reckoner** | Number Latin-square/cage/inequality logic: **575 boards** (4×4:300, 5×5:200, 6×6:75) | Pencil marks and immediate contradiction highlighting are good. Previously no ongoing grid persistence; validated grid/notes recovery added. Small editable cells and keyboard focus need further testing. | Keep; II's region/route games are not this mechanic |
| 6 | **Longhand** | Daily/practice seven-letter deduction; full daily, practice, stats, settings and guess history persisted | Already has a fuller resume model; substantial separate work exists in `connex222/LONGHAND-WEB`. Risk is duplicated product fixes, not a redundant sequel mechanic. | Maintain original copy; coordinate deliberately with standalone |
| 7 | **Unpick** | Cryptic clue teaching with **1,164 clues**, 12 clue devices, daily/practice and mini mode | Deep educational value but a specialist teaching product, not a casual quick-play puzzle. Existing stats in `unpick.v1` were durable; daily/practice partial clue inputs were not, so a separate attempt snapshot was added. Mini-mode recovery remains unverified. A standalone `connex222/Unpick-web` is also maintained. | Keep accessible; editorial/corpus work belongs in the specialist project |

These are **collection-fit priorities**, not a judgement that Unpick or Longhand are intrinsically poor products. Re-evaluate with consent-based small player tests, not guessed usage figures.

## Comparison with THE COMPENDIUM II

The sequel's canonical nine: **Fell, Mirrorwork, Riffle, Glean, Bight, Marquetry, Reeve, Shunt, Furlong**. These are sandpile/cascade, timed matching, letter-rack word finding, value-path chaining, single-loop logic, spatial tiling, judgement/deduction, rail sliding and numeric region partitioning. None exactly replaces an original title. Broad shared genres (letters, numbers, logic) do **not** mean mechanic duplication.

- Original: approximately 1.5 MB embedded `index.html`, all seven full HTML documents held as data, loaded as **fresh same-origin iframes**. Font assets are embedded. No external dependencies, analytics or sign-in. Four established save families used only historical keys, not unfinished-session snapshots.
- Sequel: approximately 573 KB embedded `index.html`, nine manifest-driven volumes, explicit `c2.` key prefix, shared local progress status and separate QA scripts. It already handles new/unfinished/completed catalogue states and deeper per-volume saved states.
- Original and sequel live under **different paths on the same GitHub Pages host** and thus can share the same browser's origin storage. Original keys include `cmp_theme`, `wl_seen_*`, `wl_streak`, `rk_seen_*`, `sk_seen_*`, `wn_seen`, `wn_streak`, `unpick.v1`, `lh.daily`, `lh.practice`, `lh.settings`, `lh.stats`, `lh.seen` and `cyphr`. The sequel uses `c2.` keys. New original snapshots are `cmp.v1.<name>.session` and must never alter `c2.` values.
- **Additional cross-project risk:** Original embedded Unpick/Longhand retain save names used by their standalone versions. Do not change these existing keys or assume a path-isolated localStorage namespace. This requires separate review before syncing standalone code.

## Non-destructive improvements on this review branch

1. Refined the original's position as a seven-game classic. Added an explicitly online, user-activated sequel link rather than pretending that all sixteen games share one save/launcher.
2. The roll reads legacy progress without rewriting it and shows `Play`, `Continue` or `Played` only where the corresponding saved record supports it. Never label historical 'seen' challenges as solved.
3. Refreshing `#causeway`, `#winnow`, etc. restores the corresponding iframe. Browser back, the in-game return control and rapid reopen have safer route/cleanup handling. No old route was deleted.
4. **Causeway:** new versioned snapshot validates selected puzzle, every rung's vocabulary/adjacency, elapsed time and typed word; saves on input, clock ticks and navigation.
5. **Winnow:** saves exact selected board/shuffle, solved groups, mistakes, remaining tiles and guesses. Recovery validates four-group membership and does not grant extra mistakes.
6. **Skein:** saves board index, solved threads, hint and clock state, validating original theme/word supply before restoration. The grid now supports accessible arrow-key navigation, Space to select letters, Enter to submit, Escape to cancel, roving focus and spoken letter/selection labels.
7. **Reckoner:** saves selected board index, entries, pencil marks, checks and clock. Every given clue is validated before restore; invalid records are ignored, not erased.
8. **Unpick:** saves daily/practice partial letters, clue, selected position and hints in a separate record; existing `unpick.v1` stats remain untouched. The mini-game is outside this addition.
9. Added dependency-free source checks and review-only Chromium tests. The workflow cannot publish the site.

This change **does not** migrate historical saves or attempt to merge the two game engines.

## QA and blockers

Run `node qa/verify.mjs` (source, seven-game catalogue, script parse, key isolation and synthetic status scenarios). For browser QA install `playwright-core` outside the shipped game and run `node qa/browser.mjs` with `CHROME_BIN` set. GitHub Actions definition: `.github/workflows/compendium-original-qa.yml`.

**Confirmed passing review-only GitHub Actions:** [Run 43244487763](https://github.com/connex222/COMPENDIUM/actions/runs/43244487763). The independent static suite passed the seven-puzzle catalogue, all eight JavaScript source parses, save-key isolation and **14 synthetic progress/status scenarios**. The actual Chromium browser suite passed **20 checks**, including opening, refreshing and returning from every original volume; the versioned progress recovery paths; **a real completed UI solve in each of the seven games**; a genuine Skein keyboard-selected word; and an untouched Compendium II `c2.` sentinel. These results confirm browser E2E on Chromium, not every operating system or input combination.

**Remaining manual/mobile release gate:** iOS Safari and Android WebView touch/layout/refresh, physical keyboard and switch access, invalid input and corrupted-session edge cases, storage-disabled and local-file operation, independent Unpick/Longhand saved-key compatibility, daily date rollover, and repeated starts/finishes with existing user progress. The original and sequel were not jointly opened against production user data. No user telemetry was collected, so ranked engagement remains editorial.

**Approval gate:** Do not merge or deploy until these tests have been reviewed and the owner explicitly authorises a merge. Migration/deletion continues to require its own separate approval.

## Future consolidation/migration proposal — REQUIRES A SEPARATE APPROVAL

1. Write a separate feature proposal and catalogue showing sixteen unique mechanics and design roles, including what the independent Unpick/Longhand repositories mean.
2. First offer a **read-only launcher** (two clearly labelled collections with 7 + 9 games). Do not copy either game's embedded JavaScript or unify persistence. Maintain independent back routes and original product links.
3. If users actively request shared history, produce a clearly labelled **export/back-up** of relevant original keys and `c2.` keys, without including unrelated same-origin data. Obtain opt-in before any copy.
4. Design a versioned schema and per-game mapping; validate date/time, puzzle identity, solved flags and reversible snapshots; explicitly handle standalone Unpick/Longhand conflicts. Verify on devices with live progress.
5. Only after a **second explicit authorisation** consider a copy-only migration into new keys. Never bulk-delete old localStorage and never replace source IDs with shared IDs without proven mapping.
6. Roll back by reopening the untouched original URLs and original storage keys. Deprecating either game or deleting stored data is a separate approval, not part of this branch.

**Review rule:** keep branch open for QA, and do not merge, release, deploy or delete historical data without the owner's explicit approval.
