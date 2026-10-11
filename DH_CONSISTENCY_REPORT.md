# DH consistency correction — unpublished preview

DH now uses existing Off-APEX. A field position uses that same Off-APEX plus its existing Def-APEX component. Defense includes the approved position adjustment and workload treatment; it is not just the displayed fielding-runs rate. DH contributes zero defense. No APEX weights, packed player scores, Big Moments arithmetic, LSI formulas, city attribution or pitcher qualification rules were changed.

Automatic DH/field swaps still require at least one run per 150 games of defensive improvement and a strictly positive net team-value gain. Existing position eligibility and manual-pin protections remain. DH-Prod remains a hitting-only reference and bench-bat selection statistic.

## Regression results

- 324 before/after builds: all 30 franchises and 24 city pools, Big Moments off/on, bench sizes 5/6/7. 5,395 assertions passed; unique players, capacity limits, consistent values and unchanged pitching selections verified.
- 1,620 randomized manual-override builds passed, including 2,190 acknowledged exceptions.
- Browser audit: 180 builds, 300 comparison views, 90 pitching swap sheets; no page errors or mobile overflow. Cancellation, storage warnings/reset and city-scoped comparison passed.
- Offline browser: 78 routes, self-check, override cancellation and acknowledgment passed.
- Display: 180 builds and 1,620 lineup rows; desktop and 320/390-pixel widths passed.
- LONG regression: 863 checks / 108 builds passed. Its 50 changed-build count compares against an older SP6 fixture, not this DH baseline; the dedicated DH comparison verified zero pitching changes.
- Frozen-data fixture: 31 protected files and Big Moments arithmetic passed.

## Before/after roster changes

150 of 324 builds changed assignments. In standard full-franchise rosters, 35 of 60 mode-specific builds changed across 18 franchises. All other standard builds retained their assignments. The table includes bench changes, not only starters.

Values below compare both lineups on the new common-offense scale. Old published totals use a different DH definition and are not directly comparable. The machine-readable results preserve old-scale totals separately.

| Franchise | Big Moments | Gain | Assignments before → after |
|---|---|---:|---|
| mets | Off | +0.995 | start DH: Pete Alonso → Howard Johnson; bench FLEX: Howard Johnson → Jeff McNeil; bench BAT: Kevin McReynolds → Pete Alonso |
| mets | On | +0.499 | start DH: Pete Alonso → Howard Johnson; bench FLEX: Howard Johnson → Jeff McNeil; bench BAT: Kevin McReynolds → Pete Alonso |
| yankees | Off | +3.578 | start CF: Mickey Mantle → Joe DiMaggio; start DH: Joe DiMaggio → Mickey Mantle |
| yankees | On | +3.578 | start CF: Mickey Mantle → Joe DiMaggio; start DH: Joe DiMaggio → Mickey Mantle |
| pirates | Off | +1.854 | start DH: Ralph Kiner → Arky Vaughan; bench UTIL-IF: Arky Vaughan → Jay Bell; bench BAT: Fred Clarke → Ralph Kiner |
| pirates | On | +2.010 | start DH: Ralph Kiner → Arky Vaughan; bench UTIL-IF: Arky Vaughan → Jay Bell; bench BAT: Fred Clarke → Ralph Kiner |
| athletics | Off | +1.109 | start DH: Mark McGwire → Jason Giambi; bench FLEX: Jason Giambi → Home Run Baker; bench BAT: Home Run Baker → Mark McGwire |
| athletics | On | +1.796 | start DH: Mark McGwire → Jason Giambi; bench FLEX: Jason Giambi → Sal Bando; bench BAT: José Canseco → Mark McGwire |
| braves | Off | +2.297 | start 3B: Chipper Jones → Eddie Mathews; start DH: Eddie Mathews → Chipper Jones |
| braves | On | +2.297 | start 3B: Chipper Jones → Eddie Mathews; start DH: Eddie Mathews → Chipper Jones |
| orioles | Off | +0.998 | start 1B: George Sisler → Eddie Murray; start DH: Eddie Murray → George Sisler |
| orioles | On | +0.998 | start 1B: George Sisler → Eddie Murray; start DH: Eddie Murray → George Sisler |
| redsox | Off | +8.854 | start 1B: Jimmie Foxx → David Ortiz; start RF: Ted Williams → Dwight Evans; start DH: David Ortiz → Ted Williams; bench OF4: Dwight Evans → Jim Rice; bench FLEX: Jim Rice → Bobby Doerr; bench BAT: Manny Ramirez → Jimmie Foxx |
| redsox | On | +9.318 | start 1B: Jimmie Foxx → David Ortiz; start RF: Ted Williams → Dwight Evans; start DH: David Ortiz → Ted Williams; bench OF4: Dwight Evans → Jim Rice; bench FLEX: Jim Rice → Bobby Doerr; bench BAT: Manny Ramirez → Jimmie Foxx |
| cubs | Off | +5.763 | start LF: Billy Williams → Bill Nicholson; start RF: Bill Nicholson → Sammy Sosa; start DH: Sammy Sosa → Billy Williams |
| cubs | On | +5.763 | start LF: Billy Williams → Bill Nicholson; start RF: Bill Nicholson → Sammy Sosa; start DH: Sammy Sosa → Billy Williams |
| whitesox | Off | +3.172 | start 1B: Frank Thomas → José Abreu; start DH: Paul Konerko → Frank Thomas; bench BAT: José Abreu → Paul Konerko |
| whitesox | On | +3.615 | start 1B: Frank Thomas → José Abreu; start DH: Paul Konerko → Frank Thomas; bench BAT: José Abreu → Paul Konerko |
| reds | Off | +3.543 | start 2B: Joe Morgan → Bid McPhee; start DH: George Foster → Joe Morgan; bench FLEX: Bid McPhee → George Foster |
| reds | On | +3.617 | start 2B: Joe Morgan → Bid McPhee; start DH: George Foster → Joe Morgan; bench FLEX: Bid McPhee → George Foster |
| astros | Off | +6.085 | start RF: Jim Wynn → Lance Berkman; start DH: Lance Berkman → Craig Biggio; bench C2: Craig Biggio → Jason Castro; bench OF4: Yordan Álvarez → Jim Wynn; bench FLEX: Joe Morgan → Yordan Álvarez |
| astros | On | +5.558 | start RF: Jim Wynn → Lance Berkman; start DH: Lance Berkman → Craig Biggio; bench C2: Craig Biggio → Jason Castro; bench OF4: Yordan Álvarez → Jim Wynn; bench FLEX: George Springer → Yordan Álvarez |
| marlins | Off | +3.311 | start RF: Gary Sheffield → Giancarlo Stanton; start DH: Giancarlo Stanton → Gary Sheffield |
| marlins | On | +3.311 | start RF: Gary Sheffield → Giancarlo Stanton; start DH: Giancarlo Stanton → Gary Sheffield |
| twins | Off | +4.316 | start 3B: Eddie Yost → Harmon Killebrew; start DH: Harmon Killebrew → Kirby Puckett; bench OF4: Kirby Puckett → Clyde Milan; bench FLEX: Clyde Milan → Chuck Knoblauch |
| twins | On | +6.162 | start 3B: Buddy Lewis → Harmon Killebrew; start CF: Kirby Puckett → Sam Rice; start DH: Harmon Killebrew → Kirby Puckett; bench OF4: Sam Rice → Clyde Milan; bench FLEX: Clyde Milan → Buddy Myer |
| padres | Off | +2.106 | start 1B: Ryan Klesko → Adrián González; start LF: Dave Winfield → Ryan Klesko; start RF: Tony Gwynn → Dave Winfield; start DH: Adrián González → Tony Gwynn |
| padres | On | +2.106 | start 1B: Ryan Klesko → Adrián González; start LF: Dave Winfield → Ryan Klesko; start RF: Tony Gwynn → Dave Winfield; start DH: Adrián González → Tony Gwynn |
| cardinals | Off | +0.932 | start LF: Stan Musial → Joe Medwick; start RF: Enos Slaughter → Stan Musial; start DH: Johnny Mize → Enos Slaughter; bench OF4: Joe Medwick → Lou Brock; bench FLEX: Lou Brock → Johnny Mize |
| cardinals | On | +1.180 | start LF: Stan Musial → Joe Medwick; start RF: Enos Slaughter → Stan Musial; start DH: Johnny Mize → Enos Slaughter; bench OF4: Joe Medwick → Lou Brock; bench FLEX: Lou Brock → Johnny Mize |
| rays | Off | +0.343 | start 1B: Yandy Díaz → Carlos Peña; start DH: Carlos Peña → Yandy Díaz |
| rays | On | +0.343 | start 1B: Yandy Díaz → Carlos Peña; start DH: Carlos Peña → Yandy Díaz |
| bluejays | On | +0.576 | start 1B: Vladimir Guerrero Jr. → Carlos Delgado; start DH: Carlos Delgado → Vladimir Guerrero Jr. |
| nationals | Off | +2.414 | start RF: Bryce Harper → Vladimir Guerrero; start DH: Vladimir Guerrero → Bryce Harper |
| nationals | On | +2.160 | start RF: Juan Soto → Vladimir Guerrero; start DH: Vladimir Guerrero → Bryce Harper; bench OF4: Bryce Harper → Juan Soto |

Yankees: Joe DiMaggio now fields CF and Mickey Mantle plays DH in both modes. Their role swap improves the pair by 3.578 value points solely from the difference in approved defensive components. Manual pins can still choose Mantle in CF. Jeter’s defensive inputs were not changed.

## Changed application files versus the audit preview

- `app.js`
- `compare.js`
- `data/ll_index.js`
- `download/legacy_lore.html`
- `engine.js`

Engine: common role-value helper, optimizer, swap validation, DH candidate receipts and reference table. App: field diagram, lineup, filters, swap values, player position card, and explanatory text. Comparison: DH role value. Packed index: derived selection reference outputs only. Offline HTML: regenerated scripts, references and copy. Test utilities: reference/offline regeneration.

Additional work artifacts: `work/prepare-consistent-dh.py`, `work/test-consistent-dh.cjs`, `work/dh-stress.cjs`, `work/test-dh-display.cjs`, `work/report-dh.py`; new preview tests `tests/update-reference.cjs`; `outputs/dh-consistency-results.json`, `outputs/dh-stress.json`, `outputs/dh-display-tests.json`, `outputs/dh-defense-speed-desktop.png`, `outputs/dh-defense-speed-mobile.png`, `outputs/legacy-lore-dh-preview.html`, this report. Existing browser/long result artifacts were regenerated by their tests.

## Limitations and release status

- Separate copy `work/dh-consistent-preview` preserves `work/audit-preview` as the before baseline. Published checkout was not edited, committed, pushed or deployed.
- Historical pre-change exact-roster fixtures are not expected to match this explicitly changed role policy. Frozen scoring data and before/after comparisons provide the relevant protection.
- Original packed `v_DH` / DH-Prod values remain intact for source compatibility; current roster consumers use the common role-value helper. External consumers of packed values must adopt this policy explicitly.
- Fielding quality still depends on existing historical source coverage and regression. This correction does not repair or re-estimate historical defense.
- Browser tests use isolated test rosters. Existing personal saved overrides in the user’s browser were not inspected or reset.
- All 324 build-level differences, including cities and flexible sizes, are recorded in `dh-consistency-results.json`.
