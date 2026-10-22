(function(){
'use strict';
const E=window.LLEngine,D=window.LL_DATA;
const state={scope:'franchise',mode:'full',league:'MLB'},cache=new Map();let pending;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f=v=>Number.isFinite(v)?v.toFixed(1):'—';
const sum=values=>values.every(Number.isFinite)?values.reduce((a,b)=>a+b,0):null;
const BENCH_BATS=new Set(['BAT','BAT2','BAT3','BAT4']);
const PEN_ORDER=['CL','SU1','SU2','MID1','MID2','MID3','LHS','LONG'];
function rosterParts(t,o){
 const hitters=new Map((t._S||t.hitters).map(x=>[x.name,x]));
 const pitchers=new Map((t._P||t.pitchers).map(x=>[x.name,x]));
 const positionScore=(name,slot)=>{const row=hitters.get(name),v=row&&E.slotValue(row,slot);return Number.isFinite(v)?v:null;};
 const benchScore=(name,slot)=>{const row=hitters.get(name),v=row&&(BENCH_BATS.has(slot)?row.dhAPEX:row.total);return Number.isFinite(v)?v:null;};
 const pitcherScore=(name,field)=>{const row=pitchers.get(name),v=row&&row[field];return Number.isFinite(v)?v:null;};
 const lineup=o.lineup.map(l=>({slot:l.pos,name:l.name,number:l.slot,value:l.pos==='P'?null:positionScore(l.name,l.pos)}));
 const bench=Object.entries(o.bench).map(([slot,name])=>({slot,name,value:benchScore(name,slot)}));
 const rotation=Object.entries(o.rotation).map(([slot,name])=>({slot,name,value:pitcherScore(name,'SPx')}));
 const bullpen=Object.entries(o.pen).sort((a,b)=>PEN_ORDER.indexOf(a[0])-PEN_ORDER.indexOf(b[0]))
   .map(([slot,name])=>({slot,name,value:pitcherScore(name,'RPx')}));
 const nine=Object.values(o.start).length===9&&lineup.length===9&&Number.isFinite(o.team_runs)?o.team_runs:null;
 const benchValue=bench.length===5?sum(bench.map(x=>x.value)):null;
 const rotationValue=rotation.length===5?sum(rotation.map(x=>x.value)):null;
 const bullpenValue=bullpen.length===7?sum(bullpen.map(x=>x.value)):null;
 const fullCount=Object.keys(o.start).length+bench.length+rotation.length+bullpen.length;
 const full=fullCount===26&&nine!==null&&benchValue!==null&&rotationValue!==null&&bullpenValue!==null?
   sum([nine,benchValue,rotationValue,bullpenValue]):null;
 const ace=rotation.find(x=>x.slot==='SP1')||null;
 return {lineup,bench,rotation,bullpen,nine,benchValue,rotationValue,bullpenValue,full,fullCount,ace:ace?.name||null,
   aceValue:ace?.value??null,filled:Object.keys(o.start).length,gaps:o.gaps||[]};
}
function entries(bm){
 const key=state.scope+':'+bm;if(cache.has(key))return cache.get(key);
 const rows=[];
 for(const base of D.teams){
  const cities=base.key==='angels'?[]:(window.LL_CITIES?.[base.code]?.cities||[]);
  const variants=state.scope==='city'&&cities.length>1?
    cities.map(city=>({city,team:E.withCity(base,city)})):[{city:null,team:base}];
  for(const {city,team} of variants){
   const t=bm?E.withBM(team):team,output=E.build(t,{}),parts=rosterParts(t,output);
   rows.push({key:base.key,name:city?city.name:base.name,city:city?.key||null,
     years:city?city.years.join('–'):'Full franchise',lg:base.lg,color:base.colors[0],
     ...parts,combined:parts.nine!==null&&parts.aceValue!==null?parts.nine+parts.aceValue:null});
  }
 }
 cache.set(key,rows);return rows;
}
function rosterDetails(r){
 const block=(name,rows,batting)=>`<section class="rank-roster-unit"><h4>${name} <span class="muted">(${rows.length})</span></h4><ol class="rank-roster-list">${rows.map((p,i)=>`<li><span class="rank-roster-role">${batting?(p.number||i+1)+'. '+esc(p.slot):esc(p.slot)}</span><span class="rank-roster-name">${esc(p.name)}</span><span class="rank-roster-value">${f(p.value)} W</span></li>`).join('')}</ol></section>`;
 return `<details class="rank-roster-details"><summary>View ${r.fullCount}-player roster</summary><div class="rank-roster-grid">
   ${block('Batting order',r.lineup,true)}${block('Bench',r.bench,false)}
   ${block('Rotation',r.rotation,false)}${block('Bullpen',r.bullpen,false)}
   </div><p class="small muted">Numbers show each player's existing APEX value in this role. Bench BAT slots use DH-Prod; other bench slots use Total APEX. Starting pitchers use SPx; relievers use RPx.</p></details>`;
}
function view(bm){
 const rows=entries(bm).filter(r=>state.league==='MLB'||r.lg===state.league);
 const value=r=>state.mode==='full'?r.full:state.mode==='ace'?r.combined:r.nine;
 rows.sort((a,b)=>(value(b)??-Infinity)-(value(a)??-Infinity)||a.name.localeCompare(b.name));
 let rank=0,previous=null;
 const body=rows.map((r,i)=>{
   const v=value(r);if(v!==null&&v!==previous)rank=i+1;previous=v;
   const teamUrl='#/'+r.key+(r.city?'?city='+encodeURIComponent(r.city):'');
   const incomplete=state.mode==='full'?(r.full===null?` · Incomplete roster (${r.fullCount}/26)`:''):
     (r.nine===null?` · Incomplete nine (${r.filled}/9)`:'');
   return `<tr data-rank-row data-team="${r.key}" data-city="${r.city||''}">
     <td>${v===null?'—':rank}</td>
     <td><div class="rank-team" style="--rank-color:${r.color}">
       <a href="${teamUrl}"><b>${esc(r.name)}</b></a>
       <div class="small muted">${esc(r.years)} · ${r.lg}${incomplete}</div>${rosterDetails(r)}
     </div></td>
     <td class="n">${f(r.nine)}</td>
     ${state.mode==='full'?`<td class="n">${f(r.benchValue)}</td><td class="n">${f(r.rotationValue)}</td><td class="n">${f(r.bullpenValue)}</td>`:''}
     ${state.mode==='ace'?`<td>${esc(r.ace||'No qualified ace')}</td><td class="n">${f(r.aceValue)}</td>`:''}
     <td class="n rank-total">${f(v)}</td></tr>`;
 }).join('');
 const select=(id,label,values,current)=>`<label>${label} <select id="${id}">${values.map(([v,n])=>`<option value="${v}" ${v===current?'selected':''}>${n}</option>`).join('')}</select></label>`;
 const full=state.mode==='full',ace=state.mode==='ace',label=full?'Full 26 Index':ace?'Nine + Ace':'Starting Nine';
 const intro=full?
   'Full 26 ranks all 26 players: nine starting-slot values + five bench-role values + all five starting-pitcher SPx scores + all seven bullpen RPx scores. It is an additive roster-strength index, not predicted season wins.' :
   ace?'Nine + Ace adds the nine position values and the SP1 starter APEX.':'Starting Nine compares the nine selected hitters at their lineup positions.';
 return `<div class="panel"><div class="meta">STANDARD ROSTERS · ALL 30 FRANCHISES</div>
   <h1>All-Time Team Rankings</h1>
   <p>Compare complete all-time 26-man teams, from the starting lineup through every bench and pitching spot. Expand any team to see its full roster.</p>
   <div class="tools rank-tools">
    ${select('rank-mode','Rank by',[['full','Full 26-Man Roster'],['nine','Starting Nine'],['ace','Nine + Ace']],state.mode)}
    ${select('rank-scope','Teams',[['franchise','Full franchises'],['city','Historical cities']],state.scope)}
    ${select('rank-league','League',[['MLB','MLB'],['AL','AL'],['NL','NL']],state.league)}
    <label><input type="checkbox" data-act="bm" ${bm?'checked':''}> Big Moments</label>
   </div>
   <p class="small muted">${rows.length} teams · ${bm?'Big Moments on':'Big Moments off'} for every roster. ${intro} Rankings are automatic standard builds; your saved picks remain unchanged.</p>
   ${state.scope==='city'?'<div class="banner">Historical city editions replace relocated franchises here. Each player belongs to the city where he played the most franchise games and keeps all franchise statistics and scoring credit. These are city-assigned rosters, not city-only statistics. League filters use the franchise’s current league.</div>':''}
   <div class="rank-scroll"><table class="rank-table"><thead><tr>
     <th>Rank</th><th>Team / Full Roster</th><th class="n">Starting Nine</th>
     ${full?'<th class="n">Bench (5)</th><th class="n">Rotation (5)</th><th class="n">Bullpen (7)</th>':''}
     ${ace?'<th>Ace / SP1</th><th class="n">Ace Value</th>':''}
     <th class="n">${label}</th></tr></thead><tbody>${body}</tbody></table></div>
   <p class="small muted">Values are APEX win-based scores (W); rankings use unrounded totals, with displayed values rounded to one decimal. Full 26 is an index made by summing role values—not a projection, probability, or single-season win total. Incomplete teams remain visible but unranked.</p>
  </div>`;
}
window.LLRankings={view,entries,state,rosterParts,load(){return pending||(pending=Promise.all(D.teams.map(t=>LLData.ensure(t.key))).finally(()=>{pending=null;}));},
 bind(render){for(const [id,key] of [['rank-mode','mode'],['rank-scope','scope'],['rank-league','league']]){const el=document.getElementById(id);if(el)el.onchange=()=>{state[key]=el.value;render();};}}};
})();
