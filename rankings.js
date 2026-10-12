(function(){
'use strict';
const E=window.LLEngine,D=window.LL_DATA;
const state={scope:'franchise',mode:'ace',league:'MLB'},cache=new Map();let pending;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f=v=>Number.isFinite(v)?v.toFixed(1):'—';
function entries(bm){
 const key=state.scope+':'+bm;if(cache.has(key))return cache.get(key);
 const rows=[];
 for(const base of D.teams){
  const cities=base.key==='angels'?[]:(window.LL_CITIES?.[base.code]?.cities||[]);
  const variants=state.scope==='city'&&cities.length>1?cities.map(c=>({city:c,team:E.withCity(base,c)})):[{city:null,team:base}];
  for(const {city,team} of variants){
   const t=bm?E.withBM(team):team,o=E.build(t,{}),ace=o._objs.rot[0],filled=Object.values(o.start).filter(Boolean).length;
   const nine=filled===9&&Number.isFinite(o.team_runs)?o.team_runs:null;
   rows.push({key:base.key,name:city?city.name:base.name,city:city?.key||null,years:city?city.years.join('–'):'Full franchise',lg:base.lg,color:base.colors[0],nine,ace:ace?.name||null,aceValue:Number.isFinite(ace?.SPx)?ace.SPx:null,filled,gaps:o.gaps,combined:nine!==null&&Number.isFinite(ace?.SPx)?nine+ace.SPx:null});
  }
 }
 cache.set(key,rows);return rows;
}
function view(bm){
 const rows=entries(bm).filter(r=>state.league==='MLB'||r.lg===state.league),value=r=>state.mode==='ace'?r.combined:r.nine;
 rows.sort((a,b)=>(value(b)??-Infinity)-(value(a)??-Infinity)||a.name.localeCompare(b.name));let rank=0,previous=null;
 const body=rows.map((r,i)=>{const v=value(r);if(v!==null&&v!==previous)rank=i+1;previous=v;return `<tr data-rank-row data-team="${r.key}" data-city="${r.city||''}"><td>${v===null?'—':rank}</td><td><div class="rank-team" style="--rank-color:${r.color}"><a href="#/${r.key}${r.city?'?city='+encodeURIComponent(r.city):''}"><b>${esc(r.name)}</b></a><div class="small muted">${esc(r.years)} · ${r.lg}${r.nine===null?' · Incomplete nine ('+r.filled+'/9)':''}</div></div></td><td class="n">${f(r.nine)}</td>${state.mode==='ace'?`<td>${esc(r.ace||'No qualified ace')}</td><td class="n">${f(r.aceValue)}</td>`:''}<td class="n rank-total">${f(v)}</td></tr>`;}).join('');
 const select=(id,label,values,current)=>`<label>${label} <select id="${id}">${values.map(([v,n])=>`<option value="${v}" ${v===current?'selected':''}>${n}</option>`).join('')}</select></label>`;
 return `<div class="panel"><div class="meta">STANDARD ROSTERS</div><h1>All-Time Team Rankings</h1><p>Compare the strongest starting lineups—and the ace leading each staff.</p><div class="tools rank-tools">${select('rank-mode','Rank by',[['nine','Starting Nine'],['ace','Nine + Ace']],state.mode)}${select('rank-scope','Teams',[['franchise','Full franchises'],['city','Historical cities']],state.scope)}${select('rank-league','League',[['MLB','MLB'],['AL','AL'],['NL','NL']],state.league)}<label><input type="checkbox" data-act="bm" ${bm?'checked':''}> Big Moments</label></div><p class="small muted">${rows.length} teams · ${bm?'Big Moments on':'Big Moments off'} for every roster. Uses automatic standard builds; your saved selections are unchanged. Nine + Ace adds the nine position values and SP1’s starter APEX. This is a roster-value comparison, not a prediction of season wins.</p>${state.scope==='city'?'<div class="banner">Historical city editions replace relocated franchises here. Each player belongs to the city where he played the most franchise games and keeps all franchise statistics and scoring credit. These are city-assigned rosters, not city-only statistics. League filters use the franchise’s current league.</div>':''}<div class="rank-scroll"><table class="rank-table"><thead><tr><th>Rank</th><th>Team</th><th class="n">Starting Nine</th>${state.mode==='ace'?'<th>Ace / SP1</th><th class="n">Ace Value</th>':''}<th class="n">${state.mode==='ace'?'Combined':'Lineup Value'}</th></tr></thead><tbody>${body}</tbody></table></div><p class="small muted">All values in estimated wins (W). Incomplete lineups${state.mode==='ace'?' or missing aces':''} remain visible but unranked. Rankings use unrounded scores; displayed values are rounded. Full-roster rankings will follow after their formula is reviewed.</p></div>`;
}
window.LLRankings={view,entries,state,load(){return pending||(pending=Promise.all(D.teams.map(t=>LLData.ensure(t.key))).finally(()=>{pending=null;}));},bind(render){for(const [id,key] of [['rank-mode','mode'],['rank-scope','scope'],['rank-league','league']]){const el=document.getElementById(id);if(el)el.onchange=()=>{state[key]=el.value;render();};}}};
})();
