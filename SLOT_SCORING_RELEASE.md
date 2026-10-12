# App v2.2 — slot scoring v1 (October 12, 2026)

Roster slot values now add positive position credit to unchanged Off-APEX and projected glove value. LF, CF and RF use separate recorded appearances, eligibility and source-derived regressed glove rates. Player cards expose glove and position credit separately; swaps and rankings use those same slot values.

The prior positional scale is shifted by +15 runs/150: C 27.5; 1B 2.5; 2B/3B/CF 17.5; SS 22.5; LF/RF 7.5. DH adds no glove or position credit. Existing APEX exposure scales the projected contribution. Position credit is not limited to games actually played at the assigned position, and it can influence field/DH exchanges independently of glove rate.

Total APEX, offense, baserunning, pitching source scores and packed source files remain archived inputs. The browser applies a versioned slot overlay. The historical Python scoring engine has not been replaced or edited. Current slot rules are presented before the superseded archived rule text. Selection references are JavaScript snapshots, not a new Python parity claim.

Zero-sum components for Josh Rojas and Xavier Edwards are resolved from saved season games and RPW using existing APEX weights. Other exposure values preserve the reviewed diagnostic. Saved 2026 source data remains independently unverified.

Corrected regular-season appearance counts and ordinary season ERA from the prior audit are included. ERA display uses exact earned runs and innings; the archived scoring input retains its adjusted runs-allowed measure. The browser reports failed roster saves, and the background self-check builds each roster once per mode rather than repeatedly per comparison field. Rankings include starting nine / nine plus ace and historical city scopes. City assignments retain full franchise credit.

Validation: 104 complete franchise/city scoring builds; 16,496 card component sums; 1,260 valid swap builds; 312 release roster builds across three bench sizes; 1,200 reference comparisons; 17 standalone script blocks parsed and offline scripts synchronized. Rotation/bullpen selection was unchanged in the scoring comparison. No new independent browser visual verification is claimed by these runtime checks; the user reviewed the preview before authorizing this release.

Rollback checkpoint: backup/pre-position-credit-2026-10-12.
