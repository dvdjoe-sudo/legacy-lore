# LONG / SP6 preview update — October 9, 2026

This updates only the isolated preview. The reviewed Git branch, frozen Python scoring engine, approved score values and published build are unchanged. No push, merge or deployment occurred. Publication remains subject to user approval.

## User-approved requirements

A starting pitcher outside the selected five may serve as long reliever/emergency starter if he has prior franchise relief work. The user explicitly retained the 100 franchise relief IP floor. The preview also retains 300 starter IP, starter eligibility, and three qualifying franchise seasons. Existing seasonal eligibility floors are preserved: at least 20 total franchise IP in each qualifying season.

## Implemented selection policy

1. A conventional LONG candidate needs three qualifying franchise seasons, 100 relief IP, exported reliever eligibility, and historical relief usage of at least 1.5 IP per relief appearance. The 1.5 threshold carries forward the historical long-relief threshold while using relief-only workload, avoiding starter innings inflating the relief average.
2. The SP6 exception needs three qualifying franchise seasons, exported starter eligibility, 300 starter IP and 100 relief IP. He must be outside the actual selected rotation. This exception permits LONG even if ordinary reliever eligibility is false.
3. Prefer a qualified conventional long reliever already among the remaining bullpen pitchers, ranked by existing RP-APEX. Otherwise use an already-selected qualified starter/swingman, ranked by existing SP-APEX.
4. If neither exists in the remaining bullpen seats, choose the highest-SP-APEX eligible emergency starter outside the selected staff; otherwise choose the highest-RP-APEX qualified conventional long reliever. Fill a vacancy or replace the weakest unprotected remaining bullpen pitcher by RP-APEX.
5. Do not displace the rotation, closer, setup pitchers, dedicated LHS, or manually pinned bullpen members. If no qualified placement is possible, leave LONG vacant and show the reason. Acknowledged manual exceptions remain permitted and visibly flagged.

The role remains stored as LONG to preserve pin compatibility; the roster displays LONG / SP6 when starter workload qualification applies. Receipts state starter IP, relief IP, qualifying seasons, and replacements. No new scoring weights or APEX formulas were introduced.

## Exact inputs

New `data/ll_workload.js` supplies workload metadata for 4,753 franchise pitcher records. It is exported directly from recovered exact `apexr/apexr_pit_<franchise>.csv` rows: sum starter-role IP, relief-role IP and relief-role appearances; count franchise seasons with at least 20 combined IP. Rounded card summaries are not used for certification. City-assigned players use full franchise workload, consistent with the approved full-stat city assignment rule.

All original data content is unchanged except the derived JavaScript selection references (`py` and `py_bm`) in `ll_index.js`, which were refreshed for the new staff selections. Raw player scores, scoring metadata, rules text and Big Moments values were verified unchanged. The new workload file is separate from those values.

## Tests

- 3,099 regression assertions across all 30 franchises, both scoring modes, and 24 city variants.
- 863 dedicated LONG/SP6 checks over 108 franchise/city/mode builds. These include exact threshold acceptance, just-under-threshold rejection, missing metadata, historical relief usage, no-qualified-candidate vacancies, protected bullpen constraints, automatic emergency insertion and acknowledged manual exceptions.
- 600 randomized override builds: zero failures, crashes, duplicate players or staff-capacity violations.
- 78 Chrome browser routes against the downloadable HTML; explicit cancel/acknowledge tests and zero page errors. See `preview-browser-results.json` for the final run. Desktop/mobile screenshots are refreshed.
- Scores verified unchanged; original index metadata verified identical after excluding only derived roster references.

## Before/after results

Compared with the previous preview, 26 full-franchise/mode builds change across 15 franchises, and 24 city/mode builds change. Every actual selected five, closer, setup role and LHS stays unchanged. Changes can be role reassignment within the same seven or insertion of a qualified LONG/SP6 candidate. All 50 changed builds, full before/after bullpens, qualification evidence and replacement receipts are in `preview-long-results.json`.

| Franchise | Mode | Previous LONG | Preview LONG | Starter IP | Relief IP |
|---|---|---|---|---:|---:|
| yankees | Default | Lindy McDaniel | Sparky Lyle | 0.0 | 745.7 |
| yankees | Big Moments | Lindy McDaniel | Sparky Lyle | 0.0 | 745.7 |
| athletics | Default | Justin Duchscherer | Jack Coombs | 1476.7 | 149.7 |
| athletics | Big Moments | Justin Duchscherer | George Earnshaw | 1249.3 | 104.0 |
| orioles | Default | Dick Hall | Stu Miller | 0.0 | 502.0 |
| orioles | Big Moments | Dick Hall | Stu Miller | 0.0 | 502.0 |
| redsox | Default | Derek Lowe | Bob Stanley | 548.0 | 1158.7 |
| redsox | Big Moments | Derek Lowe | Bob Stanley | 548.0 | 1158.7 |
| reds | Default | Frank Smith | Clay Carroll | 91.3 | 764.7 |
| reds | Big Moments | Frank Smith | Clay Carroll | 91.3 | 764.7 |
| rockies | Default | Curt Leskanic | Antonio Senzatela | 759.0 | 115.3 |
| rockies | Big Moments | Curt Leskanic | Jhoulys ChacÃ­n | 657.0 | 126.7 |
| astros | Default | Dave Smith | Joe Niekro | 2065.7 | 195.3 |
| royals | Big Moments | Jeff Montgomery | Larry Gura | 1515.7 | 185.7 |
| angels | Default | Shigetoshi Hasegawa | Dean Chance | 1131.3 | 105.3 |
| angels | Big Moments | Scot Shields | Dean Chance | 1131.3 | 105.3 |
| marlins | Default | Braden Looper | George Soriano | 3.0 | 115.0 |
| marlins | Big Moments | Antonio Alfonseca | George Soriano | 3.0 | 115.0 |
| twins | Big Moments | Firpo Marberry | Bill Campbell | 52.0 | 408.7 |
| giants | Default | Stu Miller | Hoyt Wilhelm | 0.0 | 608.3 |
| giants | Big Moments | Stu Miller | Hoyt Wilhelm | 0.0 | 608.3 |
| cardinals | Default | Al Brazle | Ted Wilks | 301.3 | 440.3 |
| rangers | Default | Jeff Russell | Dick Bosman | 993.0 | 110.3 |
| rangers | Big Moments | Jeff Russell | Dick Bosman | 993.0 | 110.3 |
| bluejays | Default | Duane Ward | David Wells | 890.3 | 258.3 |
| bluejays | Big Moments | Tony Castillo | David Wells | 890.3 | 258.3 |

## Changed preview files

`engine.js`: LONG qualification, SP6 exception, protected candidate selection, vacancy warning, and manual LONG validation.

`data/ll_workload.js`: new exact workload metadata, without replacement score formulas.

`index.html`: loads the new workload metadata before the engine.

`app.js`: displays LONG / SP6 for qualifying starters while retaining LONG pin identifiers.

`data/ll_index.js`: updates derived selection references only.

`download/legacy_lore.html`: includes the synchronized engine, app, reference data and workload metadata.

`tests/data.cjs`, `tests/regression.cjs`, and new `tests/long.cjs`: load exact metadata and verify the now-approved policy. Existing stress, city comparison and browser checks were rerun.

## Remaining limits

Certification relies on the recovered frozen source inputs; this is not an independent re-audit of every historical season against external baseball sources. Automated HTTP-hosted browser testing remains unavailable in this sandbox; the actual self-contained HTML was browser-tested. External files still missing for a complete fresh APEX rebuild are documented in LOCAL_RECOVERY_REPORT.md; they do not require estimating workload or scores for this preview.

The earlier PREVIEW_REPORT.md's statement that LONG/SP6 remained blocked is superseded by this update and the user's explicit qualification choice. PIV remains a proposed feature and is not included.
