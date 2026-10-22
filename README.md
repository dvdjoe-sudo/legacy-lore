# Legacy Lore Clubhouse

All-time franchise rosters for all 30 MLB teams: starting nine, bench, rotation and bullpen, picked by the Legacy Lore engine from
Baseball-Reference / Retrosheet-based value scores. Runs entirely in the browser (static site, no server).

- **Live app:** https://dvdjoe-sudo.github.io/legacy-lore/
- **Rules page (how players are scored and picked):** https://dvdjoe-sudo.github.io/legacy-lore/#/rules
- **App version:** v2.2.6 · **Base engine:** v0.9.8 · **Slot scoring:** v1
- **Offline single-file version:** [download/legacy_lore.html](download/legacy_lore.html) (open it in Safari or Chrome; works with no connection)

Team pages: `#/<team>` (e.g. [#/mets](https://dvdjoe-sudo.github.io/legacy-lore/#/mets), [#/yankees](https://dvdjoe-sudo.github.io/legacy-lore/#/yankees)).
Team pages have History, Almanac and Lore tabs; the league History reader is at #/history.

**Team Rankings:** [Full 26-Man Rankings](https://dvdjoe-sudo.github.io/legacy-lore/#/rankings) now compares automatic standard rosters using the existing assigned-role APEX values for all nine starting hitters, five bench players, five starting pitchers, and seven relievers. Full 26 is the default view; Starting Nine and Nine + Ace remain selectable, with historical city editions and Big Moments still supported. Expand a team to see every player and their role value. The full-roster total is an additive roster-strength index, not projected wins. Saved personal roster picks do not affect standard rankings.

## Share a family roster

Open a team, make your selections, and click **Share My Roster**. On supported phones, the native share sheet lets you send the link by text or email; other browsers copy the link. The recipient sees a **read-only snapshot** of the exact nine-person batting order, bench, rotation and bullpen, including the No DH / Big Moments format, without changing their own browser's saved team. Shared rosters use a URL encoded in the link itself; no account or backend is required. Recipients can copy the roster text or choose **Build my own roster**.
