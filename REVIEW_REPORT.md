# Legacy Lore Clubhouse review — October 8, 2026

Scope: the supplied GitHub repository dvdjoe-sudo/legacy-lore, baseline commit 14ac62685cffd1a32c8e3bf798d91c0d709bca03. Work is isolated on local branch fix/city-dh-long-overrides. No deployment, publication, remote push, or merge was performed. The separately hosted Studio application was not modified.

## Completion status

| Requested correction | Status | Result |
|---|---|---|
| City-specific statistics and every APEX component | Unsupported calculations blocked | City roster/statistics, Big Moments and comparison values are unavailable; no filtering plus full-franchise scores, no prorating and no inferred city APEX. Exact city scoring remains blocked. |
| DH/fielding swaps | Implemented and tested | Defensive eligibility still requires at least 1 run per 150 games; a finite, strictly positive net team-value gain is also required. |
| LONG/SP6 qualification | Blocked by your follow-up instruction | Provisional qualification and SP6 changes were withdrawn. Existing LONG selection and bullpen roles are preserved, with an unverified-qualification warning. No new LONG qualification algorithm or SP6 fallback is active. |
| Manual overrides | Implemented and tested within the exported rule set | Position/role exceptions require explicit acknowledgment; conflicting slots, duplicate identities, unknown selections and excess staff capacity are rejected with warnings. |

## Implemented behavior

The DH net-gain calculation is: new fielder value + new DH production minus old fielder value minus old DH production. It uses the existing v_position and dhAPEX values, including their already-exported scoring components. No weights, position adjustments, APEX scores, Big Moments bonus arithmetic, rotation balancing, closer quality weights, or historical stats were recalculated. A zero-gain swap is rejected. The one-run defensive threshold cannot be lowered by a rule parameter. Eligible swaps are compared by net gain, rather than defensive gap alone. Pinned positions remain protected.

Override validation is in the engine, rather than only the UI. Existing position eligibility, the starting-position guard, bench fit, exported SP/RP eligibility, closer eligibility, and left-handed specialist fit are checked. Each permitted exception has a player/slot/violation-specific acknowledgment key. Accepted exceptions remain visible in warnings and exports. Original saved pins are retained; invalid or conflicting pins are not silently deleted. A replacement that displaces an existing pin requires acknowledgment. Cancel leaves stored selections unchanged. Duplicate identities across hitting/pitching selections are prevented. Duplicate slots or invalid lineup membership are structural conflicts requiring resolution; acknowledgment does not make a duplicate roster valid.

Unsupported city mode clears the hitter/pitcher, season, Big Moments and full-franchise reference payloads. The city roster is empty and its team-value field is null, displayed as N/A. Copy/export marks its unavailability. City comparison pages and their comparison API return unavailable, rather than comparing franchise scores as city results. Full-franchise data and saved overrides remain preserved. This is a data-availability safeguard, not completed city-only scoring.

LONG/SP6 is explicitly not certified. Your follow-up supplied the established three-season, 300 starter-IP and 100 relief-IP requirements and blocked an unverified LONG algorithm. The recovered Studio source confirms those general workload floors, but its LR behavior is a different implementation and does not establish the approved Clubhouse emergency-SP6 rule. Existing exported sp_ok/rp_ok flags are used for current validation; there is no new reconstruction of complete starter/relief workload from rounded records. No claim is made that LONG candidates have passed the unrecovered qualification rule.

## Regression results

- 2,895 assertions passed across all 30 franchises.
- 60 original-vs-corrected full-franchise builds: default and Big Moments.
- 60 additional builds verify that requesting the unverified long_sp6 option does not change bullpen or rotation selections.
- All 24 bundled city variants tested in both scoring modes: 48 unavailable-state checks and 48 before/after city comparisons.
- Browser coverage passed for 78 routes: 30 franchise pages, 24 city roster pages, and 24 city comparison pages.
- Browser tests confirmed explicit exception acceptance, cancellation preserving saved state, zero JavaScript page errors, and successful online and offline reference checks for all 30 teams / both modes.
- Frozen-data audit passed: data/teams/*.js, loader.js, compare.js, style.css and index.html unchanged; original index rules/metadata identical after excluding derived py/py_bm selection outputs; Big Moments arithmetic unchanged.
- Node syntax checks and git diff --check passed.

Nine franchises have alignment changes, affecting 18 of the 60 default/Big Moments builds. All 60 builds retain the same starting-nine player membership, bench players, rotation players, bullpen players and bullpen role labels. Team value does not decrease in any build. Values below use the app's existing W units, rounded to six decimals only for this report; JSON snapshots retain full precision.

## All 30 franchises: before and after

| Franchise | Default before | Default after | Default gain | Big Moments before | Big Moments after | Big Moments gain | Alignment changed? |
|---|---:|---:|---:|---:|---:|---:|---|
| mets | 226.977148 | 226.977148 | 0.000000 | 228.715093 | 228.715093 | 0.000000 | No |
| yankees | 485.829545 | 489.572730 | 3.743185 | 493.492113 | 497.235298 | 3.743185 | Yes |
| pirates | 357.009330 | 357.009330 | 0.000000 | 362.762711 | 362.762711 | 0.000000 | No |
| diamondbacks | 171.127871 | 171.127871 | 0.000000 | 171.688629 | 171.688629 | 0.000000 | No |
| athletics | 351.105110 | 351.105110 | 0.000000 | 355.109592 | 355.109592 | 0.000000 | No |
| braves | 348.680636 | 350.609553 | 1.928917 | 349.953961 | 351.882877 | 1.928917 | Yes |
| orioles | 308.427524 | 311.944559 | 3.517036 | 309.132761 | 312.649797 | 3.517036 | Yes |
| redsox | 395.035971 | 395.035971 | 0.000000 | 400.465690 | 400.465690 | 0.000000 | No |
| cubs | 375.423800 | 376.275201 | 0.851402 | 373.684199 | 374.535600 | 0.851402 | Yes |
| whitesox | 292.695117 | 299.502344 | 6.807227 | 295.933055 | 302.740282 | 6.807227 | Yes |
| reds | 363.283774 | 363.283774 | 0.000000 | 369.235692 | 369.235692 | 0.000000 | No |
| guardians | 344.211520 | 344.211520 | 0.000000 | 345.766118 | 345.766118 | 0.000000 | No |
| rockies | 213.344220 | 213.344220 | 0.000000 | 214.117923 | 214.117923 | 0.000000 | No |
| tigers | 413.760955 | 413.760955 | 0.000000 | 417.166979 | 417.166979 | 0.000000 | No |
| astros | 288.933954 | 288.933954 | 0.000000 | 293.569372 | 293.569372 | 0.000000 | No |
| royals | 254.130000 | 254.130000 | 0.000000 | 259.040419 | 259.040419 | 0.000000 | No |
| angels | 245.616488 | 245.616488 | 0.000000 | 246.140539 | 246.140539 | 0.000000 | No |
| dodgers | 316.797453 | 316.797453 | 0.000000 | 321.214051 | 321.214051 | 0.000000 | No |
| marlins | 168.829087 | 169.497048 | 0.667961 | 168.502717 | 169.170679 | 0.667961 | Yes |
| brewers | 253.981628 | 253.981628 | 0.000000 | 254.863967 | 254.863967 | 0.000000 | No |
| twins | 325.846336 | 325.846336 | 0.000000 | 327.940940 | 327.940940 | 0.000000 | No |
| phillies | 348.982401 | 348.982401 | 0.000000 | 348.805837 | 348.805837 | 0.000000 | No |
| padres | 199.895255 | 202.341778 | 2.446523 | 202.064483 | 204.511006 | 2.446523 | Yes |
| mariners | 272.073775 | 272.073775 | 0.000000 | 274.163463 | 274.163463 | 0.000000 | No |
| giants | 446.142416 | 446.142416 | 0.000000 | 451.790329 | 451.790329 | 0.000000 | No |
| cardinals | 401.093062 | 401.093062 | 0.000000 | 406.741483 | 406.741483 | 0.000000 | No |
| rays | 170.830054 | 170.830054 | 0.000000 | 170.049645 | 170.049645 | 0.000000 | No |
| rangers | 241.559910 | 241.559910 | 0.000000 | 243.312523 | 243.312523 | 0.000000 | No |
| bluejays | 213.217067 | 213.760289 | 0.543223 | 214.350305 | 215.515880 | 1.165575 | Yes |
| nationals | 240.777143 | 240.885778 | 0.108635 | 239.474175 | 242.432361 | 2.958186 | Yes |

## Every alignment change

### yankees

Team value: 485.829545 → 489.572730 W; improvement 3.743185 W.

- CF: Joe DiMaggio → Mickey Mantle.
- DH: Mickey Mantle → Joe DiMaggio.

### yankees:bm

Team value: 493.492113 → 497.235298 W; improvement 3.743185 W.

- CF: Joe DiMaggio → Mickey Mantle.
- DH: Mickey Mantle → Joe DiMaggio.

### braves

Team value: 348.680636 → 350.609553 W; improvement 1.928917 W.

- 3B: Eddie Mathews → Chipper Jones.
- DH: Chipper Jones → Eddie Mathews.

### braves:bm

Team value: 349.953961 → 351.882877 W; improvement 1.928917 W.

- 3B: Eddie Mathews → Chipper Jones.
- DH: Chipper Jones → Eddie Mathews.

### orioles

Team value: 308.427524 → 311.944559 W; improvement 3.517036 W.

- 1B: Eddie Murray → George Sisler.
- DH: George Sisler → Eddie Murray.

### orioles:bm

Team value: 309.132761 → 312.649797 W; improvement 3.517036 W.

- 1B: Eddie Murray → George Sisler.
- DH: George Sisler → Eddie Murray.

### cubs

Team value: 375.423800 → 376.275201 W; improvement 0.851402 W.

- LF: Bill Nicholson → Billy Williams.
- RF: Sammy Sosa → Bill Nicholson.
- DH: Billy Williams → Sammy Sosa.

### cubs:bm

Team value: 373.684199 → 374.535600 W; improvement 0.851402 W.

- LF: Bill Nicholson → Billy Williams.
- RF: Sammy Sosa → Bill Nicholson.
- DH: Billy Williams → Sammy Sosa.

### whitesox

Team value: 292.695117 → 299.502344 W; improvement 6.807227 W.

- 1B: Paul Konerko → Frank Thomas.
- DH: Frank Thomas → Paul Konerko.

### whitesox:bm

Team value: 295.933055 → 302.740282 W; improvement 6.807227 W.

- 1B: Paul Konerko → Frank Thomas.
- DH: Frank Thomas → Paul Konerko.

### marlins

Team value: 168.829087 → 169.497048 W; improvement 0.667961 W.

- RF: Giancarlo Stanton → Gary Sheffield.
- DH: Gary Sheffield → Giancarlo Stanton.

### marlins:bm

Team value: 168.502717 → 169.170679 W; improvement 0.667961 W.

- RF: Giancarlo Stanton → Gary Sheffield.
- DH: Gary Sheffield → Giancarlo Stanton.

### padres

Team value: 199.895255 → 202.341778 W; improvement 2.446523 W.

- 1B: Adrián González → Ryan Klesko.
- DH: Ryan Klesko → Adrián González.

### padres:bm

Team value: 202.064483 → 204.511006 W; improvement 2.446523 W.

- 1B: Adrián González → Ryan Klesko.
- DH: Ryan Klesko → Adrián González.

### bluejays

Team value: 213.217067 → 213.760289 W; improvement 0.543223 W.

- 1B: Carlos Delgado → Edwin Encarnación.
- DH: Edwin Encarnación → Carlos Delgado.

### bluejays:bm

Team value: 214.350305 → 215.515880 W; improvement 1.165575 W.

- 1B: Carlos Delgado → Vladimir Guerrero Jr..
- DH: Vladimir Guerrero Jr. → Carlos Delgado.

### nationals

Team value: 240.777143 → 240.885778 W; improvement 0.108635 W.

- RF: Vladimir Guerrero → Bryce Harper.
- DH: Bryce Harper → Vladimir Guerrero.

### nationals:bm

Team value: 239.474175 → 242.432361 W; improvement 2.958186 W.

- RF: Vladimir Guerrero → Juan Soto.
- DH: Juan Soto → Vladimir Guerrero.

## City comparisons

The old city builds carried full-franchise player scores. Their old values are recorded only as evidence of the bug and are not valid city-specific APEX totals. Every city below now reports unavailable rather than a completed city roster. The separate city-comparison.json includes all old assignments, players spanning multiple cities, and null corrected values in both scoring modes.

| Franchise | City / historical club | Players in old filtered pool with seasons outside the city period | Corrected status |
|---|---|---:|---|
| athletics | Philadelphia Athletics | 8 | Unavailable |
| athletics | Kansas City Athletics | 14 | Unavailable |
| athletics | Oakland Athletics | 22 | Unavailable |
| athletics | Athletics (Sacramento) | 7 | Unavailable |
| braves | Boston Braves (incl. Red Stockings / Beaneaters) | 8 | Unavailable |
| braves | Milwaukee Braves | 24 | Unavailable |
| braves | Atlanta Braves | 8 | Unavailable |
| orioles | Milwaukee Brewers (1901) | 1 | Unavailable |
| orioles | St. Louis Browns | 13 | Unavailable |
| orioles | Baltimore Orioles | 5 | Unavailable |
| angels | Los Angeles Angels (1961-65) | 8 | Unavailable |
| angels | Anaheim / California Angels (1966-) | 13 | Unavailable |
| dodgers | Brooklyn Dodgers (incl. Atlantics / Grooms / Superbas / Robins) | 10 | Unavailable |
| dodgers | Los Angeles Dodgers | 12 | Unavailable |
| brewers | Seattle Pilots | 0 | Unavailable |
| brewers | Milwaukee Brewers | 4 | Unavailable |
| twins | Washington Senators (1901-60) | 9 | Unavailable |
| twins | Minnesota Twins | 10 | Unavailable |
| giants | New York Giants (incl. Gothams) | 8 | Unavailable |
| giants | San Francisco Giants | 5 | Unavailable |
| rangers | Washington Senators (1961-71) | 8 | Unavailable |
| rangers | Texas Rangers | 13 | Unavailable |
| nationals | Montreal Expos | 13 | Unavailable |
| nationals | Washington Nationals | 9 | Unavailable |

## Every changed file

| File | Change |
|---|---|
| engine.js | Selection-only DH net-gain gate; centralized override review/acknowledgment, identity deduplication, unavailable city output, and informational LONG/SP6 qualification warning. Existing LONG and pitching quality formulas retained. |
| app.js | Warning banners, explicit exception/displacement acknowledgment, retained saved pins, N/A city scores and blocked city comparisons; warning-aware exports; corrected reference-check wording. |
| data/ll_index.js | Only derived selection-reference py/py_bm outputs refreshed. Frozen score tables, index rules, team metadata and APEX/BM values unchanged. |
| download/legacy_lore.html | Offline copy synchronized with the corrected scripts and selection references. |
| tests/data.cjs | Node-only unpacking harness using original packed data. |
| tests/snapshot.cjs | Captures full-franchise builds in both scoring modes. |
| tests/regression.cjs | 30-franchise before/after, override, identity, frozen output, city N/A, and blocked-SP6 regressions. |
| tests/frozen.cjs | Checks original index content apart from derived references; verifies immutable score files and unchanged Big Moments arithmetic. |
| tests/browser.cjs | Headless Edge browser coverage, online/offline reference checks, city warnings/compare blocks, and acknowledgment/cancel tests. |
| tests/city-comparison.cjs | Records old city-filter results as INVALID full-franchise statistics and compares them to unavailable city outputs. |
| tests/update-reference.cjs | Regenerates derived selection fixtures only; does not recompute APEX scores. Run intentionally after reviewing selection changes. |
| tests/update-offline.cjs | Synchronizes offline scripts/index, asserting one replacement per source. |
| REVIEW_REPORT.md | This complete review, changed-file manifest, regression results, and roster comparison. |
| RECOVERY_REPORT.md | Recovery search evidence, recovered sources and hashes, missing dependencies, and blocked calculations. |

## Reproduce and review

Use Node.js 24 or a compatible modern Node runtime. The main regression harness uses only built-in modules. Browser checks require Playwright and an installed Edge browser (PLAYWRIGHT_MODULE and PLAYWRIGHT_CHANNEL can override the module path/channel).

```text
node tests/regression.cjs
node tests/frozen.cjs
node tests/browser.cjs
node tests/city-comparison.cjs
node tests/snapshot.cjs ../after.json
git diff --check
```

Do not regenerate selection references merely to silence a test failure. The updated references are JavaScript selection snapshots, not a fresh independent Python scoring verification. Regression tests separately compare membership, value and frozen outputs to the original baseline engine.

## Remaining limitations

1. Approved Python pipeline and complete version-matched input datasets have not been recovered. Exact city Peak3/Prime5/Career, offense, defense, DH, pitcher role and October/Clutch components remain blocked. No replacement formula was introduced.
2. The precise approved LONG/SP6 qualification algorithm, candidate workload rules, emergency-starter admission and displacement policy remain unverified. The requested no-qualified-LONG determination cannot be certified yet. Existing labels are retained with warnings.
3. Studio and GitHub Clubhouse are distinct source implementations. Recovered Studio LR and scoring modules are evidence only; they were not ported into this branch.
4. Manual override validation follows the current exported Clubhouse rule set. General three-season/300-starter-IP/100-relief-IP certification requires the complete approved role-workload sources; no new automatic eligibility engine was substituted.
5. Existing original rule text and data/changes.js historical release notes were preserved. The change reports and warning labels document this branch's corrections and blocks.
6. This local branch is ready to review for DH, override, and availability safeguards; it does not claim all four original requests are complete. Nothing is deployed or merged.
