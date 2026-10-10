const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process');
const {load}=require('./data.cjs'),E=require('../engine.js'),c=load();
const oldCtx={module:{exports:{}}};vm.createContext(oldCtx);vm.runInContext(cp.execFileSync('git',['-c','safe.directory=C:/Users/GIjoe/Documents/Codex/2026-10-08/https-github-com-dvdjoe-sudo-legacy/work/legacy-lore','-C','../legacy-lore','show','14ac62685cffd1a32c8e3bf798d91c0d709bca03:engine.js'],{encoding:'utf8'}),oldCtx);const old=oldCtx.module.exports;
let checks=0;const ok=(v,message)=>{checks++;assert.ok(v,message);}; const eq=(a,b,message)=>{checks++;assert.deepEqual(JSON.parse(JSON.stringify(a??null)),JSON.parse(JSON.stringify(b??null)),message);};
const changes=[],vacancies=[],sp6=[],cities=[];
for(const t of c.LL_DATA.teams){
 const scoreSnapshot=JSON.stringify([t.hitters,t.pitchers,t.bm]);
 for(const bm of [false,true]){
  const team=bm?E.withBM(t):t,o=E.build(team,{}),b=old.build(team,{}),label=t.key+(bm?':bm':'');
  const ref=bm?t.py_bm:t.py;
  for(const k of Object.keys(ref))if(k!=='_objs')eq(o[k],ref[k],label+' reference '+k);
  ok(Object.keys(o.start).length===9,label+' full nine');ok(Object.keys(o.bench).length===5,label+' full bench');ok(Object.keys(o.rotation).length===5,label+' rotation');ok(o._objs.pen.length===7,label+' bullpen');
  const selected=[...Object.values(o._objs.start),...Object.values(o._objs.bench),...o._objs.rot,...o._objs.pen];ok(new Set(selected.map(x=>x.id)).size===selected.length,label+' unique players');
  ok(o.team_runs>=b.team_runs-1e-9,label+' team value non-decreasing');
  eq(Object.values(o.start).sort(),Object.values(b.start).sort(),label+' starting membership stable');eq(o.rot_scores,b.rot_scores,label+' frozen rotation score display stable');
  eq(Object.values(o.bench).sort(),Object.values(b.bench).sort(),label+' bench membership stable');eq(Object.values(o.rotation).sort(),Object.values(b.rotation).sort(),label+' rotation stable');
  if(o.dh_swap){ok(o.dh_swap.cost<0,label+' positive swap');ok(o.dh_swap.r_f-o.dh_swap.r_d>=1,label+' glove floor');}
  for(const role of ['CL','SU1','SU2','LHS'])eq(o.pen[role],b.pen[role],label+' protected '+role);if(o._objs.roles.LONG)ok(E.longQualification(team,o._objs.roles.LONG).ok,label+' qualified LONG');else ok(o.warnings.some(w=>w.slot==='LONG'),label+' vacancy warning');
  const diffs=[];for(const sec of ['start','bench','rotation','pen'])for(const slot of new Set([...Object.keys(b[sec]),...Object.keys(o[sec])]))if(b[sec][slot]!==o[sec][slot])diffs.push({section:sec,slot,before:b[sec][slot]||null,after:o[sec][slot]||null});
  if(diffs.length)changes.push({team:label,value_before:b.team_runs,value_after:o.team_runs,gain:o.team_runs-b.team_runs,diffs});
  const blocked=E.build(team,{rules:{long_sp6:true}});eq(blocked.pen,o.pen,label+' SP6 policy deterministic');eq(blocked.rotation,o.rotation,label+' SP6 policy rotation unchanged');
 }
 ok(JSON.stringify([t.hitters,t.pitchers,t.bm])===scoreSnapshot,t.key+' frozen score inputs untouched');
 const bad=t.hitters.find(h=>h.g_C===0);const raw={roster:{[bad.name]:'C'}};
 const r=E.reviewPins(t,raw);ok(r.warnings.length&&r.warnings[0].message.includes('eligibility'),t.key+' invalid position detected');ok(!E.build(t,raw).start.C||E.build(t,raw).start.C!==bad.name,t.key+' unacknowledged pin rejected');
 raw.acknowledged=[r.warnings[0].key];const ack=E.build(t,raw);eq(ack.start.C,bad.name,t.key+' acknowledged authority');ok(ack.warnings.some(w=>w.acknowledged),t.key+' exception receipt');
 const pitcher=t.pitchers.find(p=>p.rp_ok&&p.cl_ok===false);if(pitcher){const pin={staff:{[pitcher.name]:'CL'}},review=E.reviewPins(t,pin);ok(!review.pins.staff[pitcher.name],t.key+' unacknowledged role exception rejected');pin.acknowledged=review.warnings.filter(w=>!w.structural).map(w=>w.key);eq(E.build(t,pin).pen.CL,pitcher.name,t.key+' acknowledged pitcher role authority');}
 const duplicateTeam={...t,pitchers:[{...t.pitchers[0],id:t.hitters[0].id}]};ok(E.reviewPins(duplicateTeam,{roster:{[t.hitters[0].name]:'DH'},staff:{[t.pitchers[0].name]:'ROT'}}).warnings.some(w=>w.message.includes('Duplicate player')),t.key+' cross-unit duplicate player flagged');
 const h=t.hitters.slice(0,2);const conflict={roster:{[h[0].name]:'DH',[h[1].name]:'DH'}};ok(E.reviewPins(t,conflict).warnings.some(w=>w.structural),t.key+' duplicate slot conflict');
 const nine=Object.values(E.build(t,{}).start);const lineup=E.build(t,{lineup:{[nine[0]]:1,[nine[1]]:1,missing:3}});ok(lineup.warnings.filter(w=>w.structural).length>=2,t.key+' lineup conflicts');ok(new Set(lineup.lineup.map(p=>p.name)).size===9,t.key+' lineup unique');
 const over={staff:Object.fromEntries(t.pitchers.filter(p=>p.sp_ok).slice(0,8).map(p=>[p.name,'ROT']))};ok(E.reviewPins(t,over).warnings.some(w=>w.message.includes('capacity')),t.key+' staff overcapacity');
 for(const city of (c.LL_CITIES[t.code]||{}).cities||[]){
  const ids=new Set(city.ids),cityTeam=E.withCity(t,city);
  eq(cityTeam.hitters,t.hitters.filter(h=>ids.has(h.id)),t.key+' '+city.key+' full hitter stats preserved');
  eq(cityTeam.pitchers,t.pitchers.filter(p=>ids.has(p.id)),t.key+' '+city.key+' full pitcher stats preserved');
  eq(cityTeam.hseasons,t.hseasons,t.key+' full season history retained');eq(cityTeam.bm,t.bm,t.key+' full BM retained');
  eq(cityTeam.py,null,t.key+' no franchise reference masquerading as city roster');
  ok(cityTeam.statisticsScope==='full-franchise'&&!cityTeam.cityUnavailable,t.key+' available scope');
  for(const bm of [false,true]){
   const ct=bm?E.withBM(cityTeam):cityTeam,o=E.build(ct,{}),b=old.build(ct,{});
   ok(Number.isFinite(o.team_runs),t.key+' '+city.key+' numerical result');
   ok(o.team_runs>=b.team_runs-1e-9,t.key+' '+city.key+' net team value not reduced');
   const selected=[...Object.values(o._objs.start),...Object.values(o._objs.bench),...o._objs.rot,...o._objs.pen];
   ok(selected.every(r=>ids.has(r.id)),t.key+' '+city.key+' assignment respected');
   ok(new Set(selected.map(r=>r.id)).size===selected.length,t.key+' '+city.key+' unique roster');
   if(o.dh_swap){ok(o.dh_swap.cost<0,t.key+' '+city.key+' positive DH net gain');ok(o.dh_swap.r_f-o.dh_swap.r_d>=1,t.key+' '+city.key+' glove threshold');}
  }cities.push(t.key+':'+city.key);
 }

}
const sample=c.LL_DATA.teams.find(t=>t.key==='yankees');const below=E.build(sample,{rules:{dh_defense_first:{min_gap:0,k:9}}});if(below.dh_swap)ok(below.dh_swap.r_f-below.dh_swap.r_d>=1,'cannot lower frozen glove floor');
const offline=fs.readFileSync('download/legacy_lore.html','utf8');ok(offline.includes(fs.readFileSync('data/ll_index.js','utf8').match(/index:"([^"]+)"/)[1]),'offline selection reference synchronized');for(const file of ['engine.js','app.js'])ok(offline.includes(fs.readFileSync(file,'utf8')),'offline synchronized '+file);
const summary={checks,franchises:30,default_and_bm_builds:60,sp6_policy_builds:60,city_variants:cities.length,changed_builds:changes.length,long_vacancies:vacancies,sp6,changes,cities};
fs.writeFileSync('../regression-results.json',JSON.stringify(summary,null,2));console.log(JSON.stringify({checks,franchises:30,builds:120,city_variants:cities.length,changed_builds:changes.length,vacancies,sp6},null,2));
