# Legacy Lore source recovery — October 8, 2026

Status: approved engine_v5.py, export_app_data.py, complete version-matched scoring datasets, and the precise Clubhouse LONG/SP6 algorithm remain unrecovered/unverified. APEX values were preserved. No recovered generator was executed. No city APEX was inferred from packed franchise scores or rounded summaries.

## Search evidence

| Location | What was checked | Finding / limitation |
|---|---|---|
| Supplied GitHub repository | Full clone, all refs, all 11 commits and historical filenames | Only engine.js is tracked as the selection-engine source; no engine_v5.py, export_app_data.py, pack_data.py or app_data.json appeared in history. Main is the only fetched remote branch; no tags. |
| Local Documents/Codex, Documents, Downloads and OneDrive | Filename searches for pipeline, APEX, Legacy Lore, Python sources and archives, including prior workspaces | No requested Python pipeline found. Older legacy_lore.html and APEX specification PDFs exist in Downloads; they are not a recovered exact pipeline. |
| Local Downloads ZIP backups | Central-directory searches for pipeline filenames, app_data JSON, APEX JSON and Legacy Lore source | No requested pipeline matches found. Archives were inspected without executing their content. |
| Earlier Codex chat history | Find Baseball Lore App; Build Legacy Lore Studio; original durable Codex thread 01a100ef-65f2-7503-b3fc-9ac60d6f4010 | Original workspace and export names found in command history. Current local session cannot directly execute/read that durable host filesystem. History is a recovery lead, not proof of current file availability. |
| Connected Drive | Keyword searches for engine_v5.py, export_app_data, APEX_Source_Data and Legacy ZIPs; Studio root/scripts/public/data folder inventories | No named Python pipeline or original raw-data ZIP found through these searches. Studio JavaScript sources and an apex data folder were found. Searches are not proof that an inaccessible/unindexed file does not exist elsewhere. |

The original historical cloud paths are /workspace/scratch/737cd0f78afd and its .sites-checkout subdirectory. Recorded exports include Legacy_Lore_Studio_Complete_Source.zip, legacy-lore-v092-deployment.tar.gz and legacy-lore-specific-position-deployment.tar.gz. The previous chat also recorded audit-data/APEX_Source_Data_Through_2025.zip and its war_daily_bat.txt metadata. Those archives have not been materialized in this local session.

## Recovered source evidence

The [Studio backup folder](https://drive.google.com/drive/folders/1nEfRKfJUNtNi2H9AG2SCure95gaj-n29) contains a separate Studio codebase. Three original JavaScript files were materialized unchanged for evidence:

| File | Drive source | Bytes | SHA-256 |
|---|---|---:|---|
| roster-rules.js | [Source](https://drive.google.com/file/d/1SeXKvjdffxCfsvXE7sK-PzIauXOuLeYr/view) | 10445 | 2279cad2c8630485ec2be8bebd4231ab80984ffb33affbfef9dbe1c038203dc0 |
| legends.js | [Source](https://drive.google.com/file/d/1-09OELZQdeYj73sziO3acYvBKwZ55amm/view) | 40877 | f84f658577b43fadf30184c34a1aa0ffab51eb0b79945c3b0e144cc0b72ec976 |
| generate-apex-starters.mjs | [Source](https://drive.google.com/file/d/1ZEih21w8D0LLnvPRAs_IgvHJ8WbH44GE/view) | 41056 | 308c0a2ad12e3d2e5390926c910a2691d7caefcdb68b77fb4de01d157fcae6c8 |

Recovered legends.js explicitly defines three franchise seasons, 300 starter IP, and 100 relief IP. Its roster-workload logic separates starter and relief innings and can use Retrosheet role evidence. Its LR candidate logic prioritizes long/swing preferences, then a reliever with SP experience, then a generic reliever. That is a historical Studio implementation, not verification of the requested approved Clubhouse LONG/SP6 rule. No new qualification thresholds or fallback algorithm were activated from it.

The recovered generator imports ../public/data-import.js and ../public/apex-formula.js. Its referenced inputs are Baseball-Reference war_daily_bat.txt and war_daily_pitch.txt, plus Lahman Appearances, Fielding, People, Teams, Managers and Pitching CSVs. The generator uses current UTC year to determine completed-season coverage. Re-fetching current external endpoints would not establish the original frozen input versions. Those source dependencies must be recovered with their original snapshots, provenance, dates and checksums before any verified reproduction. The separate scripts/generate-retrosheet-october.mjs and generate-retrosheet-pilot.mjs were located in Drive metadata, but were not run or substituted for the approved pipeline.

## Missing files and dependencies

| Required item | Why it is required | Status |
|---|---|---|
| Approved engine_v5.py | Exact scoring, aggregation, peak/prime/career, fielding, role and eligibility logic matching the frozen export | Not recovered |
| Approved export_app_data.py | Reproducible export schema, version/provenance and full-precision source-to-app mapping | Not recovered |
| tools/pack_data.py and complete app_data.json | Original packing/export contract and original full dataset before compact encoding | Not recovered; loader/packed outputs exist |
| Complete full-precision season/stint inputs | Restrict every counting, rate, positional, pitcher-role and peak/prime/career component to the relevant city before applying the frozen engine | Not recovered as a verified complete, version-matched set |
| Per-season/game postseason and Clutch inputs | Scope October and Clutch bonuses to the city without retaining full-franchise bonuses | Not recovered as the approved complete inputs |
| Approved LONG/SP6 qualification specification or verified implementation | Establish historical usage, workload, role fit, emergency starter eligibility, vacancy flags and admission/displacement policy | General floors known; exact algorithm unverified |
| Original input provenance and checksums | Distinguish the frozen dataset from later live endpoint revisions and identify matching engine/export versions | Incomplete |

## Blocked calculations and decisions

- Every city-specific APEX component, including base hitter/pitcher scores, position/defense/DH values, Peak3/Prime5/Career summaries, and Big Moments/October/Clutch values.
- Exact role-specific workload certification from incomplete rounded records.
- New LONG qualification ranking and a certified no-qualified-LONG determination.
- Automatic emergency-SP6 admission, its workload exception rules, and whom it may replace.
- Reproduction or replacement of approved APEX scoring from the recovered separate Studio generator.

## Recovery path

1. Retrieve the named archives and original upload/source directory from the original durable workspace or original ChatGPT file library; preserve bytes and hashes.
2. Locate the named Python pipeline and its version-matched input snapshots, rather than reconstructing formulas from app outputs.
3. Establish which exact source implementation and LONG/SP6 rule you approve for the Clubhouse repository. The recovered Studio LR source is a candidate for review, not an approval assumption.
4. Once approved source and complete data are available, reproduce all original franchise APEX values exactly before attempting city-scoped exports.
5. Only then implement and test city scoring and LONG/SP6 qualification, compare all 30 franchises and historical cities, and seek your approval before any deployment or merge.

The recovery work used the Google Drive plugin and its installed Google Drive skill; only read/search operations were performed. The exact local skill source was C:/Users/GIjoe/.codex/plugins/cache/openai-curated-remote/google-drive/0.1.16/skills/google-drive/SKILL.md. No Drive file was modified.
