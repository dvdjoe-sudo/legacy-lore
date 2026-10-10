# Local archive recovery — October 9, 2026

## Result

Successfully opened the user's original `C:\Users\GIjoe\OneDrive\Desktop\legacy_lore_recovery.zip` (3,143,931,770 bytes). The ZIP contains 14,292 entries. The original archive was read only and preserved. Python scripts were extracted separately with SHA-256 provenance, followed by selected pipeline inputs and exports (3,252 files, 2,131,937,173 bytes). ZIP reads verified the CRC of the extracted members. No recovered scripts were executed as a scoring engine, and no frozen scoring formulas were changed.

Recovered the previously missing `engine_v5.py` (44,716 bytes), `export_app_data.py` (14,267 bytes), exact APEX batting and pitching season files for all 30 franchises, complete exported app data, score tables, Big Moments inputs, Lahman tables, and pipeline helper scripts. The embedded rulebook identifies this export as v0.9.8.

## Verification

- All 30 recovered packed franchise data files match the repository files, after CRLF/LF normalization.
- All 60 franchise hitter/pitcher CSV tables match their exported app records: **677,557 cell comparisons, zero mismatches**. This verifies recovery consistency; it is not a fresh execution of the full scoring pipeline.
- All 60 default APEX season input files (30 batting and 30 pitching) are present.
- The previous code regression results remain 2,895 assertions and 78 browser routes. They were not rerun for this recovery-only step because no application code changed.

## City-statistics finding

The recovered `app_v17/city_split.py` explicitly assigns each player to a majority/plurality city and retains his **entire franchise record**. The corresponding `v5_*_city_*.csv` and JSON exports implement that policy. They are not corrected city statistics and must not be substituted into the app as city-scoped APEX values.

Exact season-level data is now recovered. A corrected city export must filter the input seasons first, recompute every approved APEX component with the frozen pipeline, rebuild city-scoped eligibility and rate inputs, and restrict the Big Moments source events to the city period. Filtering existing score rows would repeat the original error. Current city results remain unavailable while complete dependency verification and an exact export are pending.

## LONG/SP6 rule conflict

The recovered v0.9.8 rule 21 says LONG is a role label among the already-selected bullpen pitchers, based on highest innings per game, and specifies **no emergency SP6 / long-man force-in**. The recovered engine implements this at lines 406–419. Rule 19a defines starter/reliever eligibility by starts, relief appearances, and role innings shares. The export also documents three qualifying franchise seasons with 100 PA/20 IP seasonal floors.

This establishes the historical implementation, but does not establish the requested new LONG/SP6 qualification algorithm or reconcile it with the user's stated 300 starter IP / 100 relief IP requirements. The recovered document's statements about past approval are historical source evidence, not fresh user authorization. Keep the requested qualification changes blocked until the intended rule is explicitly resolved. Do not silently restore an older force-in rule or invent a replacement algorithm.

## Remaining dependencies and limits

- Both `engine_v5.py` and `export_app_data.py` read `/workspace/apba/data/war_bat.txt` to establish MLB participation in 2025+ for the Prime5 missed-season rule. That external global file is not in this archive. Franchise-specific batting extracts do not prove an equivalent complete global file.
- `export_app_data.py` expects `/workspace/legacy_lore/out/legacy_lore_rules_v*.md` and `out/legacy_lore_big_moments_option.md`. The original `out/` files are not in this archive. Rule text was recovered from the exported app payload and is provided as evidence; it was not represented as the missing original source file.
- Hard-coded Linux paths require controlled path mapping to execute the original pipeline on Windows. No path mapping or scoring execution was performed in this recovery step.
- The complete upstream rebuild may depend on additional files outside `/workspace/legacy_lore`; do not treat this as a complete standalone rebuild until its imports and file reads have been checked.
- PIV remains a proposed companion metric; no PIV scores were calculated or added.

## Deliverables

`local-archive-inventory.json`: original ZIP member names and sizes.

`local-pipeline-provenance.json`: extracted Python file sizes and SHA-256 hashes.

`local-input-provenance.json`: extracted data/export member sizes and SHA-256 hashes.

`recovered-franchise-parity.json`: all 30 packed-file checks.

`recovered-score-audit.json`: all 60 table checks and comparison count.

`recovered-rulebook-v0.9.8.md`: exact rule text from the exported app payload.

`recovered-pipeline-evidence.zip`: selected original scripts and embedded rulebook, for review. Scripts are historical evidence and have not been run to produce new scores.

The earlier `RECOVERY_REPORT.md` remains the record of what was missing before this local backup arrived. This addendum supersedes its statements that engine_v5.py/export_app_data.py and all exact season files were unrecovered. It does not supersede the existing application review results or authorize deployment.

No application code, Git commit, approved scores, roster selections, or published site changed in this step. No push, merge, deployment, or external write occurred.

## Key original-file hashes

- `engine_v5.py` — 44,716 bytes; SHA-256 `12196c42ae436c87e819652a88dc54cef575c0c379016dfda54478ba466dffa9`
- `export_app_data.py` — 14,267 bytes; SHA-256 `7a1d692e590ca2ab7d3bc032cb8eb71d8f39ac5e92dcbd9fd06171c66768f479`
- `app_v17/city_split.py` — 5,025 bytes; SHA-256 `cd2219e460b1b2e9f6fbeed8d9f86319da2ce7b0a298d5c2a75c87a49381d93c`
