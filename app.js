/* Legacy Lore Clubhouse v1.7 (city split + tap-to-swap + pen-role pins; engine v0.9.8 dedicated LHS (closer does not count)) (v1.6: Total Zone by position for all 30 franchises 1953-2015; v1.5.1: closer record rule 22a; v1.5: engine v0.9.5 Baseball-Reference match fixes, save-rate tiebreaker for closer order, Jr. names; v1.4: relief innings 100% runs allowed, closer order on Reliever score + ERA+, Big Moments Shutdown score for relief; v1.3.1: packed data, each team decoded on demand by loader.js; same UI and numbers as v1.3): all 30 franchises with a team picker (v1.2: engine v0.9.3; v1.1 added the Big Moments option: October + Clutch bonuses, OFF by default). All numbers come from LL_DATA (exported from the engine files by export_app_data.py)
   or from LLEngine.build (the JS port of engine_v5.py, verified equal to Python). */
(function(){
'use strict';
const D=window.LL_DATA, E=window.LLEngine, $=s=>document.querySelector(s);
const POS=E.POS, POS9=E.POS9, f1=x=>E.fmt(x,1), f0=x=>E.fmt(x,0), p1=x=>E.fmt(x,1,true), f3=x=>E.fmt(x,3);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>v===null||v===undefined||Number.isNaN(v)?null:v;
const fx=(v,d=1)=>num(v)===null?'–':E.fmt(v,d);
const obp=v=>num(v)===null?'–':E.fmt(v,3).replace(/^0\./,'.');
const BENCH_SLOTS=['C2','UTIL-IF','OF4','BAT'];   // FLEX is not pinnable (engine_v5.py has no FLEX pin path)
const SLOT_NAME={C:'Catcher','1B':'First base','2B':'Second base','3B':'Third base',SS:'Shortstop',LF:'Left field',CF:'Center field',RF:'Right field',DH:'Designated hitter',C2:'Backup catcher','UTIL-IF':'Utility infielder',OF4:'4th outfielder',FLEX:'Flex',BAT:'Bench bat',
  SP1:'Starter 1',SP2:'Starter 2',SP3:'Starter 3',SP4:'Starter 4',SP5:'Starter 5',CL:'Closer',SU1:'Setup 1',SU2:'Setup 2',LHS:'Lefty specialist',LONG:'Long relief',MID1:'Middle relief 1',MID2:'Middle relief 2',MID3:'Middle relief 3'};
const KEYS=['start','bench','rotation','pen','lineup','log','hfix','dh_table','pen_q','rot_scores','pit_omit','close_calls','rot_log','pen_log','pit_tie_log','dh_rule_log','dh_swap','team_runs','guard_log','util_failed'];
const TEAM=k=>D.teams.find(t=>t.key===k);
// ---------- verification: JS engine (no pins) must equal the Python output exported with the data ----------
const deq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
// Big Moments ON must equal engine_v5.py with ENGINE_BM=1 (exported as py_bm).
// app v1.3: 30 teams x 2 builds take ~2 s, so the self-check runs in the background one team at a time after the first paint.
const VERIFY={}, VERIFY_BM={}; let VDONE=0;
function verifyOne(t){ VERIFY[t.key]=KEYS.filter(k=>!deq(E.build(t,{})[k],t.py[k])); VERIFY_BM[t.key]=KEYS.filter(k=>!deq(E.build(E.withBM(t),{})[k],t.py_bm[k])); VDONE++; }
const verified=()=>VDONE===D.teams.length;
const allOk=()=>verified()&&Object.values(VERIFY).every(v=>!v.length)&&Object.values(VERIFY_BM).every(v=>!v.length);
// app v1.3.1: a team's data is decoded only when needed; the self-check decodes each team, checks it, and frees it again unless it is on screen (phone memory).
function runVerify(i){ if(i>=D.teams.length){ foot(); const b=document.querySelector('.banner.vb'); if(b) b.outerHTML=verifyBanner(); return; }
  const t=D.teams[i], had=LLData.loaded(t.key);
  LLData.ensure(t.key).then(()=>{ verifyOne(t); if(!had&&!(CUR&&CUR.t0===t)) LLData.evict(t.key); foot(); setTimeout(()=>runVerify(i+1),0); },
    e=>{ VERIFY[t.key]=['data: '+e.message]; VERIFY_BM[t.key]=VERIFY[t.key]; VDONE++; foot(); setTimeout(()=>runVerify(i+1),0); }); }
// team picker groups (current league / division)
const GROUPS=[['AL','East'],['AL','Central'],['AL','West'],['NL','East'],['NL','Central'],['NL','West']];
const byGroup=(lg,dv)=>D.teams.filter(t=>t.lg===lg&&t.div===dv).sort((a,b)=>a.name.localeCompare(b.name));
const thinTag=t=>t.thin?`<span class="tag thin" title="Fewer than ${D.thin_n} qualified hitters or pitchers (3+ seasons over the 100 PA / 20 IP floor): a young franchise, so the bench and bullpen go deeper into short careers">Thin pool</span>`:'';
const homeVals=t=>BMON?t.py_bm:t.py;   // exact: the in-app engine is verified to rebuild these (self-check)
// ---------- Big Moments switch (one setting for all teams, stored on this device; default OFF) ----------
const BMKEY='ll_bigmoments_v1';
let BMON=(()=>{ try{ return localStorage.getItem(BMKEY)==='1'; }catch(e){ return false; } })();
function setBM(on){ BMON=!!on; try{ localStorage.setItem(BMKEY,BMON?'1':'0'); }catch(e){} }
const teamFor=t=>BMON?E.withBM(t):t;
const engLabel=()=>BMON?D.bm.engine:D.version;
// ---------- city split (v1.7): 50.1% franchise games → one city; full career stats travel with the player ----------
const citiesFor=t=>(window.LL_CITIES&&LL_CITIES[t.code]&&LL_CITIES[t.code].cities)||[];
const ckey=k=>'ll_city_v1_'+k;
const loadCity=k=>{ try{ return localStorage.getItem(ckey(k))||''; }catch(e){ return ''; } };
const saveCity=(k,v)=>{ try{ if(v) localStorage.setItem(ckey(k),v); else localStorage.removeItem(ckey(k)); }catch(e){} };
function withCity(t0){
  const cities=citiesFor(t0); const ck=loadCity(t0.key); const city=cities.find(c=>c.key===ck);
  if(!city) return t0;
  const ids=new Set(city.ids);
  const hitters=t0.hitters.filter(h=>ids.has(h.id));
  const pitchers=t0.pitchers.filter(p=>ids.has(p.id));
  const t=Object.assign({},t0,{hitters,pitchers,city,name:city.name,history:`${city.city} (${city.years[0]}–${city.years[1]}, ${city.seasons} seasons)`,pool:[hitters.length,pitchers.length],thin:hitters.length<(D.thin_n||110)||pitchers.length<(D.thin_n||110),thinCity:true});
  delete t._S; delete t._P; delete t._bmT;
  return t;
}
// ---------- pins ----------
const pkey=k=>'ll_pins_v1_'+k;
function loadPins(k){ try{ return JSON.parse(localStorage.getItem(pkey(k))||'{}'); }catch(e){ return {}; } }
function savePins(k,p){ try{ localStorage.setItem(pkey(k),JSON.stringify(p)); }catch(e){} }
function cleanPins(t,raw){ const P={roster:{},lineup:{},staff:{},rules:{}}; const dropped=[];
  const H=new Set(t.hitters.map(h=>h.name)), PP=new Set(t.pitchers.map(p=>p.name));
  const seen={}; for(const [n,s] of Object.entries(raw.roster||{})){ if(!H.has(n)||!(POS9.includes(s)||BENCH_SLOTS.includes(s))){dropped.push(n);continue;} if(seen[s]) delete P.roster[seen[s]]; seen[s]=n; P.roster[n]=s; }
  const PEN_ROLES=new Set(['CL','SU1','SU2','LHS','LONG','MID1','MID2']);
  let nr=0,np=0; const roleSeen={}; for(const [n,s] of Object.entries(raw.staff||{})){ if(!PP.has(n)) {dropped.push(n);continue;}
    if(s==='ROT'&&nr<5){P.staff[n]=s;nr++;}
    else if((s==='PEN'||PEN_ROLES.has(s))&&np<7){ if(PEN_ROLES.has(s)){ if(roleSeen[s]){ delete P.staff[roleSeen[s]]; } roleSeen[s]=n; } P.staff[n]=s;np++; }
    else dropped.push(n); }
  const r=raw.rules||{}; if(r.dh_defense_first===false) P.rules.dh_defense_first=false; if(r.primary_pos_guard===false) P.rules.primary_pos_guard=false;
  const base={roster:P.roster,staff:P.staff,rules:P.rules}; const nine=new Set(Object.values(E.build(t,base).start));
  const ls={}; for(const [n,k] of Object.entries(raw.lineup||{})){ if(!nine.has(n)||!(k>=1&&k<=9)||ls[k]){dropped.push(n+' (lineup)');continue;} ls[k]=n; P.lineup[n]=k; }
  const out={}; for(const k of ['roster','lineup','staff','rules']) if(Object.keys(P[k]).length) out[k]=P[k];
  return {pins:out,dropped}; }
const pinCount=p=>['roster','lineup','staff'].reduce((a,k)=>a+Object.keys(p[k]||{}).length,0)+Object.keys(p.rules||{}).length;
// ---------- state ----------
let CUR=null; // {t, raw, pins, dropped, o}
function compute(k){ const t0=TEAM(k), t=teamFor(withCity(t0)); const raw=loadPins(k); const c=cleanPins(t,raw); const o=E.build(t,c.pins); CUR={t,t0,raw,pins:c.pins,dropped:c.dropped,o,city:t.city||null}; return CUR; }
function setPins(fn){ const k=CUR.t.key; const p=JSON.parse(JSON.stringify(CUR.pins)); fn(p); for(const s of ['roster','lineup','staff','rules']) if(p[s]&&!Object.keys(p[s]).length) delete p[s]; savePins(k,p); compute(k); render(); }
// ---------- helpers ----------
const hitter=n=>CUR.t._S.find(h=>h.name===n), pitcher=n=>CUR.t._P.find(p=>p.name===n);
function slotOf(n){ const o=CUR.o; for(const [s,x] of Object.entries(o.start)) if(x===n) return s; for(const [s,x] of Object.entries(o.bench)) if(x===n) return s;
  for(const [s,x] of Object.entries(o.rotation)) if(x===n) return s; for(const [s,x] of Object.entries(o.pen)) if(x===n) return s; return null; }
const gpos=(h,p)=>(p==='LF'||p==='RF')?h.g_LF+h.g_RF:h['g_'+p];
const most=h=>{const F=['C','1B','2B','3B','SS','LF','CF']; let b=F[0]; for(const q of F) if(gpos(h,q)>gpos(h,b)) b=q; return b;};
const elig=(h,p)=>p==='DH'||(gpos(h,p)>=h.elig_min&&gpos(h,p)>0);
const guardOn=()=>!(CUR.pins.rules&&CUR.pins.rules.primary_pos_guard===false);
const startOk=(h,p)=>p==='DH'||(elig(h,p)&&(!guardOn()||gpos(h,p)>=0.25*h.G_team||most(h)===((p==='LF'||p==='RF')?'LF':p)));
const ccFor=n=>CUR.o.close_calls.filter(c=>c.pick===n||c.alt===n);
const confTag=c=>`<span class="tag conf conf${c}" title="${esc(D.tiers[c])}">Data ${c}</span>`;
const nm=(n,kind)=>`<a href="javascript:void 0" class="name" data-card="${esc(kind)}" data-n="${esc(n)}">${esc(n)}</a>`;
const yrs=(n,kind)=>{ const t=CUR.t; const id=(kind==='h'?hitter(n):pitcher(n)).id; const s=(kind==='h'?t.hseasons:t.pseasons)[id]; return s?`${s.yrs[0]}–${s.yrs[1]}`:''; };
const pinTag=n=>{ const p=CUR.pins; const a=[]; if(p.roster&&p.roster[n]) a.push('pinned '+p.roster[n]); if(p.lineup&&p.lineup[n]) a.push('bats #'+p.lineup[n]); if(p.staff&&p.staff[n]){ const s=p.staff[n]; a.push('pinned '+(s==='ROT'?'rotation':s==='PEN'?'bullpen':s)); } return a.length?`<span class="tag pin">Fan override: ${esc(a.join(', '))}</span>`:''; };
const ccTag=n=>ccFor(n).length?`<span class="tag cc" title="${esc(ccFor(n).map(c=>c.slot+': '+c.pick+' '+c.pick_v+' vs '+c.alt+' '+c.alt_v+' ('+c.pct+'%)').join('; '))}">Close Call</span>`:'';
// ---------- Big Moments badges and numbers ----------
const bmOf=(kind,id)=>{ const t=CUR?CUR.t0:null; return t&&t.bm?(t.bm[kind][id]||null):null; };
const bmBonus=(kind,x)=>{ const b=bmOf(kind,x.id); return b?(b.d_oct+b.d_cl):0; };
function bmTags(kind,x,big){ const b=bmOf(kind,x.id); if(!b) return ''; const m=D.bm.badge_min; let s='';
  if(b.d_oct>=m) s+=`<span class="tag oct${big?' big':''}" title="October bonus: postseason win probability added for this franchise, weighted by series stakes">October ${p1(b.d_oct)} W</span>`;
  if(b.d_cl>=m) s+=`<span class="tag clutch${big?' big':''}" title="Clutch bonus: better in high-pressure regular-season spots than his everyday value predicts (regressed)">Clutch ${p1(b.d_cl)} W</span>`;
  return s; }
// ---------- views ----------
const lum=h=>{ const v=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255); return 0.2126*v[0]+0.7152*v[1]+0.0722*v[2]; };   // app v1.3: light secondary colours are darkened for text accents
const shade=h=>'#'+[1,3,5].map(i=>Math.round(parseInt(h.slice(i,i+2),16)*0.6).toString(16).padStart(2,'0')).join('');
function nav(view){ const k=CUR&&CUR.t.key;
  $('#teams').innerHTML=`<a href="#/" class="${view==='home'?'on':''}">All teams</a><select id="teampick" aria-label="Pick a team"><option value="">${k?'':'Pick a team…'}</option>${GROUPS.map(([lg,dv])=>`<optgroup label="${lg} ${dv}">${byGroup(lg,dv).map(t=>`<option value="${t.key}" ${k===t.key?'selected':''}>${esc(t.name)}</option>`).join('')}</optgroup>`).join('')}</select>`+`<a href="#/rules" class="${view==='rules'?'on':''}">Rules</a><a href="#/about" class="${view==='about'?'on':''}">About</a>`;
  $('#ver').textContent='Engine '+engLabel();
  $('#subnav').innerHTML=(k&&['club','hit','pit'].includes(view))?[['club','Clubhouse',''],['hit','Hitters','/hitters'],['pit','Pitchers','/pitchers']].map(([v,l,s])=>`<a href="#/${k}${s}" class="${v===view?'on':''}">${l}</a>`).join(''):'';
  if(k){ document.documentElement.style.setProperty('--t1',CUR.t.colors[0]); document.documentElement.style.setProperty('--t2',lum(CUR.t.colors[1])>0.55?(CUR.t.colors[1]==='#C4CED3'?'#8c99a6':shade(CUR.t.colors[1])):CUR.t.colors[1]); }
  else { document.documentElement.style.setProperty('--t1','#1b2a41'); document.documentElement.style.setProperty('--t2','#c8102e'); }
}
function vHome(){ CUR=null; nav('home');
  return `<div class="panel" style="border-radius:10px"><h1>All-time franchise clubhouses</h1>
  <p>Each 26-man roster is built by the Legacy Lore engine <b>${esc(D.version)}</b> (APEX-R, no WAR inside the scores), with a receipt for every pick. Tap a team, then any player for his scores at every position, why he made it (or didn't), Close Calls, and fan-override pins.</p>
  ${bmSwitch()}${GROUPS.map(([lg,dv])=>`<h2 class="grp">${lg==='AL'?'American':'National'} League ${dv}</h2><div class="homegrid">${byGroup(lg,dv).map(t=>{ const o=homeVals(t); return `<a class="teamcard" href="#/${t.key}" style="background:linear-gradient(135deg,${t.colors[0]},${t.colors[0]} 60%,${t.colors[1]})"><h2>${esc(t.name)}</h2>
   <p class="small">${esc(t.history)} · since ${t.since} (${t.seasons} seasons)</p><p>${t.pool[0]} hitters · ${t.pool[1]} pitchers in the pool ${thinTag(t)}</p><p>SP1 ${esc(o.rotation.SP1)} · CL ${esc(o.pen.CL)}</p><p>Nine-starter value ${f1(o.team_runs)} W · ${o.close_calls.length} Close Call${o.close_calls.length===1?'':'s'}</p></a>`;}).join('')}</div>`).join('')}
  ${verifyBanner()}</div>`; }
function verifyBanner(){ if(!verified()) return `<div class="banner vb">Self-check running: rebuilding every roster in the browser and comparing with the Python engine (${VDONE} of ${D.teams.length} teams done)…</div>`; const bad=Object.entries(VERIFY).filter(([k,v])=>v.length).map(([k,v])=>[k,v]).concat(Object.entries(VERIFY_BM).filter(([k,v])=>v.length).map(([k,v])=>[k+' (Big Moments)',v]));
  return bad.length?`<div class="banner bad vb">JS engine differs from the Python engine output for: ${bad.map(([k,v])=>esc(k)+' ('+esc(v.join(', '))+')').join('; ')}</div>`
   :`<div class="banner ok vb">Self-check passed: with no pins, the in-app engine rebuilds all ${D.teams.length} rosters and every receipt exactly as the Python engine did, both for ${esc(D.version)} (default) and with the Big Moments option on.</div>`; }
function bmSwitch(){ return `<div class="bmswitch"><label><input type="checkbox" data-act="bm" ${BMON?'checked':''}> <b>Big Moments</b></label> <span class="small muted">${BMON?'ON: scores include the October and Clutch bonuses (rules BM1–BM5), and rosters are rebuilt.':'OFF (default): pure engine '+esc(D.version)+'. Turn on to add October and Clutch bonuses to the scores.'}</span></div>`; }
function bmBanner(){ if(!BMON) return ''; const a=E.build(CUR.t0,{}), b=E.build(CUR.t,{}); const ch=[];
  for(const sec of ['start','bench','rotation','pen']) for(const s of Object.keys(a[sec])) if(a[sec][s]!==b[sec][s]) ch.push(`${s}: ${a[sec][s]} → ${b[sec][s]}`);
  return `<div class="banner bm"><b>Big Moments ON</b>: October (positive-only, cap min(${D.bm.caps.oct_w.toFixed(1)} W, ${Math.round(D.bm.caps.oct_pct*100)}% of APEX)) + two-way Clutch (shrunk, cap ±${D.bm.caps.cl_w.toFixed(1)} W / ${Math.round(D.bm.caps.cl_pct*100)}%) are added to every score. Engine picks vs default ${esc(D.version)}: ${ch.length?ch.map(x=>`<span class="pill">${esc(x)}</span>`).join(' '):'no roster or role changes'}; nine-starter value ${f1(b.team_runs)} W vs ${f1(a.team_runs)} W.</div>`; }
function pinBanner(){ const p=CUR.pins; const n=pinCount(p); const dr=CUR.dropped.length?`<div class="small muted">Ignored stale pins: ${esc(CUR.dropped.join(', '))}</div>`:'';
  if(!n) return dr?`<div class="banner">${dr}</div>`:'';
  const items=[]; for(const [a,s] of Object.entries(p.roster||{})) items.push(`${esc(a)} → ${esc(s)}`); for(const [a,s] of Object.entries(p.lineup||{})) items.push(`${esc(a)} bats #${s}`);
  for(const [a,s] of Object.entries(p.staff||{})) items.push(`${esc(a)} → ${s==='ROT'?'rotation':s==='PEN'?'bullpen':s}`); if(p.rules&&p.rules.dh_defense_first===false) items.push('DH glove rule OFF'); if(p.rules&&p.rules.primary_pos_guard===false) items.push('start guard OFF');
  const base=E.build(CUR.t,{}); const dv=CUR.o.team_runs-base.team_runs;
  return `<div class="banner"><b>Fan override active</b> (${n}): ${items.map(x=>`<span class="pill">${x}</span>`).join(' ')}<br>
   Nine-starter value ${f1(CUR.o.team_runs)} W vs engine pick ${f1(base.team_runs)} W (${p1(dv)} W). Everything else rebuilt around the pins.
   <div class="tools" style="margin:6px 0 0"><button class="btn" data-act="clear">Clear all pins</button><button class="btn" data-act="pinsjson">Show pins file (for engine_v5.py)</button></div>${dr}</div>`; }
const POSXY={C:[50,90],'1B':[77,64],'2B':[64,43],'3B':[23,64],SS:[36,43],LF:[17,24],CF:[50,12],RF:[83,24],DH:[86,90]};
function field(){ const o=CUR.o;
  return `<div class="field"><svg viewBox="0 0 100 86" preserveAspectRatio="none" aria-hidden="true"><path d="M50 84 L2 36 Q50 -14 98 36 Z" fill="#3d7f46"/><path d="M50 80 L28 58 L50 36 L72 58 Z" fill="#c99a63"/><path d="M50 74 L34 58 L50 42 L66 58 Z" fill="#3d7f46"/><circle cx="50" cy="58" r="3" fill="#c99a63"/></svg>
  ${POS9.map(p=>{const n=o.start[p]; if(!n) return `<div class="fp gap" style="left:${POSXY[p][0]}%;top:${POSXY[p][1]}%"><b>${p}</b><span class="muted">empty</span></div>`; const h=hitter(n); return `<div class="fp" style="left:${POSXY[p][0]}%;top:${POSXY[p][1]}%" data-swap="${p}" title="Tap to swap"><b>${p}</b>${esc(n)}<br><span class="muted">${f1(h['v_'+p])} W</span></div>`;}).join('')}</div>
  <p class="small muted" style="text-align:center">Tap a position to swap (shows win cost). Tap a name in the tables for the full card.</p>`; }
function cityPicker(t0){ const cities=citiesFor(t0); if(cities.length<2) return ''; const cur=loadCity(t0.key);
  return `<label class="small">City <select id="citypick" data-act="city"><option value="" ${!cur?'selected':''}>Full franchise</option>${cities.map(c=>`<option value="${esc(c.key)}" ${cur===c.key?'selected':''}>${esc(c.city)} (${c.years[0]}–${c.years[1]})</option>`).join('')}</select></label>`; }
function gapsBanner(){ const g=CUR.o.gaps; if(!g||!g.length) return ''; return `<div class="banner">Thin city pool: unfilled slots ${g.map(esc).join(', ')}. Player needs 50.1%+ of franchise games in this city; all of his franchise stats come with him.</div>`; }
function vClub(k){ compute(k); nav('club'); const t=CUR.t, t0=CUR.t0, o=CUR.o; const ob=o._objs;
  const logBy=s=>o.log.find(l=>l.slot===s);
  const lineup=o.lineup.map(l=>{ const h=hitter(l.name); const lg=logBy(l.pos);
    return `<tr class="click" data-card="h" data-n="${esc(l.name)}"><td class="slot">${l.slot}</td><td><span class="pos">${l.pos}</span> <span class="name">${esc(l.name)}</span> <span class="muted small">${esc(l.bats)}</span>${pinTag(l.name)}${bmTags('h',h)}${lg&&lg.close?'<span class="tag cc">Close Call</span>':''}${lg&&lg.override?'<span class="tag ov">Override</span>':''}<div class="small muted">${esc(l.note)}</div></td>
     <td class="n">${obp(l.OBP)}</td><td class="n hide-s">${obp(l.SLG)}</td><td class="n hide-s">${l.OBPplus}</td><td class="n hide-s">${l.ISOplus}</td><td class="n">${fx(l.bat600)}</td><td class="n">${f1(h['v_'+l.pos])}</td></tr>`;}).join('');
  const benchRows=Object.entries(o.bench).map(([s,n])=>{ const h=hitter(n); const lg=logBy(s); return `<tr><td><button type="button" class="pos swapbtn" data-swap="${esc(s)}" title="Swap this slot">${s}</button></td><td class="click" data-card="h" data-n="${esc(n)}"><span class="name">${esc(n)}</span> <span class="muted small">${esc(h.pos)}</span>${pinTag(n)}${bmTags('h',h)}${lg&&lg.close?'<span class="tag cc">Close Call</span>':''}${lg&&lg.override?'<span class="tag ov">Override</span>':''}<div class="small muted">${esc(lg?lg.fit:'')}</div></td><td class="n">${f1(h.total)}</td><td class="n hide-s">#${h.total_rank}</td></tr>`;}).join('');
  const rotRows=Object.entries(o.rotation).map(([s,n])=>{ const p=pitcher(n); return `<tr><td><button type="button" class="pos swapbtn" data-swap="${esc(s)}" title="Swap this slot">${s}</button></td><td class="click" data-card="p" data-n="${esc(n)}"><span class="name">${esc(n)}</span> <span class="muted small">${esc(p.throws)}HP</span>${pinTag(n)}${ccTag(n)}${bmTags('p',p)}</td><td class="n">${f1(p.SPx)}</td><td class="n">${f1(p.total)}</td><td class="n hide-s">${fx(p.ERAplus,0)}</td><td class="n hide-s">${Math.round(p.IP)}</td></tr>`;}).join('');
  const penRows=Object.entries(o.pen).map(([s,n])=>{ const p=pitcher(n); return `<tr><td><button type="button" class="pos swapbtn" data-swap="${esc(s)}" title="Swap this slot">${s}</button></td><td class="click" data-card="p" data-n="${esc(n)}"><span class="name">${esc(n)}</span> <span class="muted small">${esc(p.throws)}HP</span>${pinTag(n)}${ccTag(n)}${bmTags('p',p)}</td><td class="n">${f1(p.RPx)}</td><td class="n">${f1(p.total)}</td><td class="n hide-s">${fx(p.KBB,2)}</td><td class="n hide-s">${fx(p.ERAplus,0)}</td><td class="n hide-s">${p.SV}</td></tr>`;}).join('');
  const cc=o.close_calls.length?o.close_calls.map(c=>`<li><b>${esc(c.slot)}</b>: ${nm(c.pick,hitter(c.pick)?'h':'p')} ${c.pick_v} vs ${nm(c.alt,hitter(c.alt)?'h':'p')} ${c.alt_v} (${c.pct}%), ${esc(c.rule)}</li>`).join(''):'<li class="muted">No Close Calls on this roster.</li>';
  const on26=new Set([...Object.values(o.start),...Object.values(o.bench)]);
  const omitH=E_sorted(t._S.filter(h=>!on26.has(h.name)),'total').slice(0,8).map(h=>{ let best=null; for(const p of POS9){ if(!startOk(h,p)) continue; const v=h['v_'+p]; if(Number.isNaN(v)) continue; if(!best||v>best[1]) best=[p,v]; }
    const who=best?o.start[best[0]]:null; const wv=best?hitter(who)['v_'+best[0]]:null;
    return `<tr class="click" data-card="h" data-n="${esc(h.name)}"><td><span class="name">${esc(h.name)}</span> <span class="muted small">${esc(h.pos)}</span></td><td class="n">${f1(h.total)} <span class="muted small">#${h.total_rank}</span></td><td class="small">${best?`best start: ${best[0]} ${f1(best[1])} W vs ${esc(who)} ${f1(wv)} W`:'no start-eligible slot'}</td></tr>`;}).join('');
  const omitP=o.pit_omit.map(x=>`<tr class="click" data-card="p" data-n="${esc(x.name)}"><td><span class="name">${esc(x.name)}</span></td><td class="n">${x.combined} <span class="muted small">#${x.p_rank}</span></td><td class="small">Starter ${x.SPx}${x.sp_ok?'':' (not SP-eligible)'} · Reliever ${x.RPx}${x.rp_ok?'':' (not RP-eligible)'} · ${x.G} G, ${x.GS} GS</td></tr>`).join('');
  const logs=[['DH glove rule',o.dh_rule_log],['Rotation',o.rot_log],['Bullpen',o.pen_log],['Pitcher 2% ties',o.pit_tie_log],['Lineup handedness',o.hfix]].filter(x=>x[1]&&x[1].length);
  return `<div class="panel"><div class="teamhead"><div><h1>${esc(t.name)} ${thinTag(t)}</h1><div class="meta">${esc(t.history)} · ${t.since}–2026 (${t.seasons} seasons)</div><div class="meta">All-time franchise clubhouse · engine ${esc(engLabel())} · data exported ${esc(D.exported)}</div></div>
   <div class="tools"><label class="small bmlabel"><input type="checkbox" data-act="bm" ${BMON?'checked':''}> <b>Big Moments</b></label>${cityPicker(t0)}${gapsBanner()}<button class="btn" data-act="copy">Copy roster for post</button><button class="btn" data-act="export">Export roster JSON</button><label class="small"><input type="checkbox" data-act="rule-dh" ${CUR.pins.rules&&CUR.pins.rules.dh_defense_first===false?'':'checked'}> DH glove rule</label><label class="small"><input type="checkbox" data-act="rule-guard" ${guardOn()?'checked':''}> Start guard</label></div></div>
   ${bmBanner()}${pinBanner()}
   <div class="grid"><div>${field()}<div class="small muted" style="text-align:center">Nine-starter value <b>${f1(o.team_runs)} W</b> (value at the position each man plays; DH = DH-Prod)</div></div>
   <div class="card"><h3>Lineup</h3><table class="lineup"><thead><tr><th></th><th>Batting order</th><th class="n">OBP</th><th class="n hide-s">SLG</th><th class="n hide-s">OBP+</th><th class="n hide-s">ISO+</th><th class="n" title="APEX-R batting runs per 600 PA">Bat/600</th><th class="n" title="Value at his slot (W)">Value</th></tr></thead><tbody>${lineup}</tbody></table></div></div>
   <div class="grid"><div class="card"><h3>Bench</h3><table><thead><tr><th>Slot</th><th>Player</th><th class="n">Total</th><th class="n hide-s">Rank</th></tr></thead><tbody>${benchRows}</tbody></table></div>
   <div class="card"><h3>Rotation</h3><table><thead><tr><th>Role</th><th>Pitcher</th><th class="n">Starter</th><th class="n">Comb.</th><th class="n hide-s">ERA+</th><th class="n hide-s">IP</th></tr></thead><tbody>${rotRows}</tbody></table>
   <h3 style="margin-top:12px">Bullpen</h3><table><thead><tr><th>Role</th><th>Pitcher</th><th class="n">Reliever</th><th class="n">Comb.</th><th class="n hide-s">K/BB</th><th class="n hide-s">ERA+</th><th class="n hide-s">SV</th></tr></thead><tbody>${penRows}</tbody></table></div></div>
   <div class="card"><h3>Close Calls</h3><ul>${cc}</ul><p class="small muted">A Close Call never changes a pick: the runner-up is within 2% (or the 90% hand rule is decided within 2 points, or the next pitcher of the same hand is within 5%).</p></div>
   ${logs.length?`<div class="card"><h3>Rule receipts</h3>${logs.map(([h,l])=>`<div class="receipt"><b>${esc(h)}</b>${l.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`).join('')}</div>`:''}
   <div class="grid"><div class="card"><h3>Notable omissions: hitters</h3><table><thead><tr><th>Player</th><th class="n">Total</th><th>Why not</th></tr></thead><tbody>${omitH}</tbody></table><p class="small muted">Top Total APEX hitters not on the 26. "Best start" = his highest value at a position he may start; bench slots follow the rule order C2 → UTIL-IF → OF4 → FLEX → BAT.</p></div>
   <div class="card"><h3>Notable omissions: pitchers</h3><table><thead><tr><th>Pitcher</th><th class="n">Comb.</th><th>Scores</th></tr></thead><tbody>${omitP}</tbody></table></div></div>
   </div>`; }
function E_sorted(a,k){ return a.slice().sort((x,y)=>y[k]-x[k]); }
// tables
let SORT={hit:['total',false],pit:['total',false]}, FILT={q:'',pos:'',role:''};
function vHit(k){ compute(k); nav('hit'); const t=CUR.t; const [sk,asc]=SORT.hit; const q=FILT.q.toLowerCase();
  let rows=t._S.filter(h=>!q||h.name.toLowerCase().includes(q)); if(FILT.pos) rows=rows.filter(h=>elig(h,FILT.pos));
  const val=(h,c)=>c==='pval'?(FILT.pos?h['v_'+FILT.pos]:NaN):c==='conf'?t.hseasons[h.id].conf:c==='name'?h.name:c==='bm'?bmBonus('h',h):h[c];
  rows.sort((a,b)=>{ const x=val(a,sk), y=val(b,sk); if(typeof x==='string') return asc?x.localeCompare(y):y.localeCompare(x); const xn=Number.isNaN(x), yn=Number.isNaN(y); if(xn||yn) return xn-yn; return asc?x-y:y-x; });
  const cols=[['total_rank','#',1],['name','Player',0],['pos','Pos',0],['total','Total APEX',1],['offAPEX','Off-APEX',1],['dhAPEX','DH-Prod',1],['bm','Big Moments',1],...(FILT.pos?[['pval','Value at '+FILT.pos,1]]:[]),['c_PA','PA',1],['c_bat','Bat runs',1],['c_br','BR runs',1],['c_fld','Fld runs',1],['conf','Data',0]];
  const th=cols.map(([c,l,n])=>`<th class="${n?'n':''}"><a href="javascript:void 0" data-sort="hit:${c}">${esc(l)}${sk===c?(asc?' ▲':' ▼'):''}</a></th>`).join('');
  const on=r=>slotOf(r.name);
  const body=rows.map(h=>`<tr class="click" data-card="h" data-n="${esc(h.name)}"><td class="n">${h.total_rank}</td><td><span class="name">${esc(h.name)}</span> ${on(h)?`<span class="pos">${on(h)}</span>`:''}${bmTags('h',h)}<div class="small muted">${yrs(h.name,'h')}</div></td><td>${esc(h.pos)}</td><td class="n"><b>${f1(h.total)}</b></td><td class="n">${f1(h.offAPEX)}</td><td class="n">${f1(h.dhAPEX)}</td><td class="n">${p1(bmBonus('h',h))}</td>${FILT.pos?`<td class="n">${fx(h['v_'+FILT.pos])}${startOk(h,FILT.pos)?'':' <span class="muted small" title="cannot start here (start guard)">bench</span>'}</td>`:''}<td class="n">${Math.round(h.c_PA)}</td><td class="n">${f0(h.c_bat)}</td><td class="n">${f0(h.c_br)}</td><td class="n">${f0(h.c_fld)}</td><td>${confTag(t.hseasons[h.id].conf)}</td></tr>`).join('');
  return `<div class="panel"><h1>${esc(t.short)} hitters</h1><div class="tools"><input type="search" id="q" placeholder="Search player" value="${esc(FILT.q)}"><select id="posf"><option value="">All positions</option>${POS.filter(p=>p!=='RF').map(p=>`<option value="${p}" ${FILT.pos===p?'selected':''}>${p==='LF'?'LF/RF (corner OF)':p} eligible</option>`).join('')}<option value="DH" ${FILT.pos==='DH'?'selected':''}>DH</option></select><span class="small muted">${rows.length} of ${t._S.length} (season floor: 3+ seasons with 100+ PA)</span></div>${bmSwitch()}
   <div class="scroll"><table><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table></div><p class="small muted">Runs columns are franchise-career APEX-R components. Value at a position = Off-APEX + Def-APEX there (DH = DH-Prod). Big Moments = October + Clutch bonus (W); it is inside the other columns only when the Big Moments switch is on (now ${BMON?'ON':'OFF'}). Tap a player for every position.</p></div>`; }
function vPit(k){ compute(k); nav('pit'); const t=CUR.t; const [sk,asc]=SORT.pit; const q=FILT.q.toLowerCase();
  let rows=t._P.filter(p=>!q||p.name.toLowerCase().includes(q)); if(FILT.role==='S') rows=rows.filter(p=>p.sp_ok); if(FILT.role==='R') rows=rows.filter(p=>p.rp_ok);
  const val=(p,c)=>c==='conf'?t.pseasons[p.id].conf:c==='bm'?bmBonus('p',p):p[c];
  rows.sort((a,b)=>{ const x=val(a,sk), y=val(b,sk); if(typeof x==='string') return asc?x.localeCompare(y):y.localeCompare(x); const xn=Number.isNaN(x), yn=Number.isNaN(y); if(xn||yn) return xn-yn; return asc?x-y:y-x; });
  const cols=[['p_rank','#',1],['name','Pitcher',0],['throws','T',0],['total','Combined',1],['SPx','Starter',1],['RPx','Reliever',1],['bm','Big Moments',1],['G','G',1],['GS','GS',1],['IP','IP',1],['ERAplus','ERA+',1],['KBB','K/BB',1],['SV','SV',1],['conf','Data',0]];
  const th=cols.map(([c,l,n])=>`<th class="${n?'n':''}"><a href="javascript:void 0" data-sort="pit:${c}">${esc(l)}${sk===c?(asc?' ▲':' ▼'):''}</a></th>`).join('');
  const body=rows.map(p=>`<tr class="click" data-card="p" data-n="${esc(p.name)}"><td class="n">${p.p_rank}</td><td><span class="name">${esc(p.name)}</span> ${slotOf(p.name)?`<span class="pos">${slotOf(p.name)}</span>`:''}${bmTags('p',p)}<div class="small muted">${yrs(p.name,'p')}</div></td><td>${esc(p.throws)}</td><td class="n"><b>${f1(p.total)}</b></td><td class="n">${f1(p.SPx)}${p.sp_ok?'':'<span class="muted small" title="not Starter-eligible"> ✕</span>'}</td><td class="n">${f1(p.RPx)}${p.rp_ok?'':'<span class="muted small" title="not Reliever-eligible"> ✕</span>'}</td><td class="n">${p1(bmBonus('p',p))}</td><td class="n">${p.G}</td><td class="n">${p.GS}</td><td class="n">${Math.round(p.IP)}</td><td class="n">${fx(p.ERAplus,0)}</td><td class="n">${fx(p.KBB,2)}</td><td class="n">${p.SV}</td><td>${confTag(t.pseasons[p.id].conf)}</td></tr>`).join('');
  return `<div class="panel"><h1>${esc(t.short)} pitchers</h1><div class="tools"><input type="search" id="q" placeholder="Search pitcher" value="${esc(FILT.q)}"><select id="rolef"><option value="">All roles</option><option value="S" ${FILT.role==='S'?'selected':''}>Starter-eligible</option><option value="R" ${FILT.role==='R'?'selected':''}>Reliever-eligible</option></select><span class="small muted">${rows.length} of ${t._P.length} (season floor: 3+ seasons with 20+ IP)</span></div>${bmSwitch()}
   <div class="scroll"><table><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table></div><p class="small muted">Starter / Reliever / Combined = APEX 2.2 shape on APEX-R wins from starting / relief / all innings. ✕ = not eligible for that role (rule 19a). Big Moments = October + Clutch bonus to Combined (W); inside the scores only when the switch is on (now ${BMON?'ON':'OFF'}).</p></div>`; }
function vRules(){ CUR=null; nav('rules'); const bml=D.bm_rules.split('\n').map(l=>{ const e=esc(l); if(/^(BIG MOMENTS|CHANGE LOG)/.test(l)||/^BM\d\./.test(l)||/^What it is/.test(l)) return `<span class="h">${e}</span>`; if(l.includes('app '+D.app_version)) return `<span class="new">${e}</span>`; return e; }); const lines=D.rules.split('\n').map(l=>{ const e=esc(l); if(/^==.*==$/.test(l.trim())||/^LEGACY LORE/.test(l)) return `<span class="h">${e}</span>`; if(/^[A-Z][A-Z ]+$/.test(l.trim())&&l.trim().length>3) return `<span class="h">${e}</span>`; if(l.includes(D.version)) return `<span class="new">${e}</span>`; return e; });
  return `<div class="panel" style="border-radius:10px"><h1>Clubhouse rules ${esc(D.version)} + Big Moments option</h1><p class="small muted">Copied verbatim from <code>${esc(D.rules_file)}</code>, including the change log and open items. Lines touched in ${esc(D.version)} are highlighted.</p><div class="tools"><button class="btn" data-act="copyrules">Copy rules</button></div><div class="rules">${lines.join('\n')}</div>
   <h2 id="bigmoments">Big Moments option (app ${esc(D.app_version)}) and app change log</h2><p class="small muted">From <code>${esc(D.bm_rules_file)}</code>. The engine is ${esc(D.version)}; Big Moments is an opt-in layer on top of it (engine_v5.py with ENGINE_BM=1).</p><div class="rules">${bml.join('\n')}</div></div>`; }
function vAbout(){ CUR=null; nav('about');
  return `<div class="panel" style="border-radius:10px"><h1>About this app</h1>
  <p><b>Engine ${esc(D.version)}</b> · data exported ${esc(D.exported)} from the engine files by <code>export_app_data.py</code>. No server: everything runs in your browser, and your pins are stored only on this device.</p>
  ${verifyBanner()}
  <h2>What each score means</h2><ul>
  <li><b>APEX 2.2 shape</b>: 25% Peak3 + 35% Prime5 + 40% Career, franchise seasons only (military years skipped when finding Prime5).</li>
  <li><b>Total APEX</b> (Franchise APEX): APEX shape on APEX-R season wins (batting + baserunning + fielding + position + playing-time credit).</li>
  <li><b>Value at a position</b> = Off-APEX + Def-APEX there; <b>DH-Prod</b> = hitting-only run production (DH and bench bat).</li>
  <li><b>C-APEX</b> (catchers) = his score at C (catcher fielding = caught stealing, passed balls, Statcast framing 2015+).</li>
  <li><b>Starter / Reliever / Combined</b> for pitchers.</li>
  <li><b>Data Confidence</b> (A–D): which data era most of his franchise PA (hitters) or IP (pitchers) came from. ${Object.entries(D.tiers).map(([k,v])=>`<br>${confTag(k)} ${esc(v)}`).join('')}<br><span class="small muted">This tier label is a v1 app rule built on the engine's data-source rules. It is not an engine score and never changes a pick.</span></li>
  <li><b>Big Moments</b> (app v1.1, optional): October = this franchise's postseason win probability added, weighted by series stakes, positive-only, capped at min(3.0 W, 10% of APEX). Clutch = how much better he was in high-pressure regular-season spots than his everyday value predicts, regressed hard (PA/(PA+${D.bm.K.toLocaleString('en-US')})) and capped at ±1.5 W / 5%. Badges at +${D.bm.badge_min} W or more; numbers always on the player card.</li></ul>
  <h2>Not in v1 (compared with the old ChatGPT-hosted app)</h2><ul>
  <li><b>APEX-Oct</b> (postseason) is back in app v1.1 as the optional <b>Big Moments</b> switch (October + Clutch bonuses; OFF by default, see <a href="#/rules">Rules</a>, BM1–BM5). The default scores stay pure ${esc(D.version)}.</li>
  <li><b>APEX-V</b>: retired as an engine input (the v0.4 tie window was retired; Total is the tie-break), so there is no APEX-V number to show.</li>
  <li>All 30 current franchises are in (app v1.3), each with its full franchise history including relocations (e.g. Senators → Twins, Browns → Orioles, Expos → Nationals). Teams with fewer than ${D.thin_n} qualified hitters or pitchers carry a <b>Thin pool</b> tag. History, lore and "The Moment I Remember" content, the Baseball Through the Years almanac, the side-by-side research roster, and the old import/export of history material are not part of v1.</li></ul>
  <h2>Sources inside the data</h2><ul>${D.teams.map(t=>`<li>${esc(t.name)}: <code>${esc(t.files.hitters)}</code>, <code>${esc(t.files.pitchers)}</code>, <code>${esc(t.files.out)}</code>, <code>${esc(t.files.bat)}</code>, <code>${esc(t.files.pit)}</code></li>`).join('')}</ul></div>`; }
// ---------- player card ----------

// ---------- tap-to-swap (v1.7): pin alternatives with win cost vs current nine/staff ----------
function clonePins(extra){ const p=JSON.parse(JSON.stringify(CUR.pins||{})); p.roster=p.roster||{}; p.staff=p.staff||{}; p.lineup=p.lineup||{}; p.rules=p.rules||{}; if(extra) extra(p); return p; }
function applyRosterPin(p,name,slot){ for(const [m,s] of Object.entries(p.roster)) if(s===slot||m===name) delete p.roster[m]; if(slot) p.roster[name]=slot; }
function applyStaffPin(p,name,slot){ for(const [m,s] of Object.entries(p.staff)) if(m===name||(slot&&slot!=='ROT'&&slot!=='PEN'&&s===slot)) delete p.staff[m]; if(slot) p.staff[name]=slot; }
function winCost(pins){ try{ return CUR.o.team_runs-E.build(CUR.t,pins).team_runs; }catch(e){ return null; } }
function swapCands(slot){
  const o=CUR.o, t=CUR.t, base=o.team_runs; const out=[];
  if(POS9.includes(slot)){
    const cur=o.start[slot]; const pool=E_sorted(t._S.filter(h=>startOk(h,slot)||(CUR.pins.roster&&CUR.pins.roster[h.name]===slot)), slot==='DH'?'dhAPEX':('v_'+slot)).slice(0,36);
    const onNine=new Set(Object.values(o.start));
    for(const h of pool){ if(h.name===cur) continue;
      const pins=clonePins(p=>applyRosterPin(p,h.name,slot));
      const o2=E.build(t,pins); const cost=base-o2.team_runs;
      out.push({kind:'h',name:h.name,cost,note:onNine.has(h.name)?'on the nine':(slotOf(h.name)||'off roster'),v:h[slot==='DH'?'dhAPEX':('v_'+slot)]}); }
  } else if(['C2','UTIL-IF','OF4','BAT'].includes(slot)){
    const cur=o.bench[slot]; const key=slot==='BAT'?'dhAPEX':'total';
    for(const h of E_sorted(t._S,key).slice(0,40)){ if(h.name===cur) continue;
      if(slot==='C2'&&!elig(h,'C')) continue;
      if(slot==='OF4'&&!(elig(h,'LF')||elig(h,'CF')||elig(h,'RF'))) continue;
      const pins=clonePins(p=>applyRosterPin(p,h.name,slot));
      const o2=E.build(t,pins); out.push({kind:'h',name:h.name,cost:base-o2.team_runs,note:slotOf(h.name)||'off roster',v:h[key]}); }
  } else if(/^SP[1-5]$/.test(slot)){
    const cur=o.rotation[slot];
    for(const p of E_sorted(t._P.filter(x=>x.sp_ok),'SPx').slice(0,24)){ if(p.name===cur) continue;
      const pins=clonePins(pp=>applyStaffPin(pp,p.name,'ROT'));
      const o2=E.build(t,pins); out.push({kind:'p',name:p.name,cost:base-o2.team_runs,note:slotOf(p.name)||'off staff',v:p.SPx}); }
  } else if(['CL','SU1','SU2','LHS','LONG','MID1','MID2'].includes(slot)){
    const cur=o.pen[slot];
    for(const p of E_sorted(t._P.filter(x=>x.rp_ok),'RPx').slice(0,28)){ if(p.name===cur) continue;
      const pins=clonePins(pp=>applyStaffPin(pp,p.name,slot));
      const o2=E.build(t,pins); out.push({kind:'p',name:p.name,cost:base-o2.team_runs,note:slotOf(p.name)||'off staff',v:p.RPx}); }
  }
  out.sort((a,b)=>(a.cost??99)-(b.cost??99));
  return out.slice(0,14);
}
function swapSheet(slot){
  const o=CUR.o; const cur=o.start[slot]||o.bench[slot]||o.rotation[slot]||o.pen[slot]||null;
  const kind=POS9.includes(slot)||['C2','UTIL-IF','OF4','BAT'].includes(slot)?'h':'p';
  const cands=swapCands(slot);
  const rows=cands.map(c=>{ const cost=c.cost==null?'–':(c.cost===0?'0.0':p1(-c.cost).replace('+','+').replace('−','−')); // show gain as + when cost negative
    const gain=c.cost==null?'–':p1(-c.cost);
    const label=c.cost==null?'n/a':(c.cost<=0.05?`<span class="tag ok">+${f1(-c.cost)} W</span>`:`<span class="tag cost">${c.cost>0?'−':'+'}${f1(Math.abs(c.cost))} W</span>`);
    return `<tr class="click" data-act="dopin" data-kind="${c.kind==='h'?'roster':'staff'}" data-n="${esc(c.name)}" data-slot="${esc(slot)}"><td><span class="name">${esc(c.name)}</span><div class="small muted">${esc(c.note)}</div></td><td class="n">${f1(c.v)}</td><td class="n">${label}</td></tr>`; }).join('')||'<tr><td colspan="3" class="muted">No eligible alternatives in the top pool.</td></tr>';
  const clear=cur?`<button class="btn" data-act="clearslot" data-slot="${esc(slot)}" data-kind="${kind}">Clear pin at ${esc(slot)}</button>`:'';
  const cardBtn=cur?`<button class="btn" data-card="${kind}" data-n="${esc(cur)}">Open ${esc(cur)}</button>`:'';
  $('#mbody').innerHTML=`<h2 style="margin-top:0">Swap ${esc(SLOT_NAME[slot]||slot)}</h2>
    <p class="small muted">Current: <b>${esc(cur||'(empty)')}</b>. Win cost = change in nine-starter value after the pin (negative cost = the roster gets better). Top candidates by slot score.</p>
    <div class="tools">${cardBtn}${clear}</div>
    <table><thead><tr><th>Alternative</th><th class="n">Slot score</th><th class="n">Win Δ</th></tr></thead><tbody>${rows}</tbody></table>`;
  $('#modal').hidden=false;
}

function card(kind,n){ if(!CUR) return; const t=CUR.t, o=CUR.o; let h=kind==='h'?hitter(n):pitcher(n); if(!h){ h=hitter(n)||pitcher(n); kind=hitter(n)?'h':'p'; } if(!h) return;
  const slot=slotOf(n); const lg=o.log.filter(l=>l.pick===n); const cc=ccFor(n);
  let html=`<h2 style="margin-top:0">${esc(n)} ${slot?`<span class="pos">${slot}</span>`:'<span class="tag">not on the 26</span>'}${pinTag(n)}</h2>${bmTags(kind,h,true)?`<div class="badges">${bmTags(kind,h,true)}</div>`:''}`;
  if(kind==='h'){ const s=t.hseasons[h.id];
    html+=`<div class="muted small">${esc(t.short)} ${s.yrs[0]}–${s.yrs[1]} · bats ${esc(h.bats)} · primary ${esc(h.pos)} · ${Math.round(h.G_team)} G · ${Math.round(h.c_PA)} PA · ${confTag(s.conf)}${t.military[h.id]?` · military years skipped in Prime5: ${t.military[h.id].join(', ')}`:''}</div>
    <div class="kv"><div><span>Total APEX (#${h.total_rank})</span><b>${f1(h.total)}</b></div><div><span>Peak3</span><b>${f1(s.apex[0])}</b></div><div><span>Prime5</span><b>${f1(s.apex[1])}</b></div><div><span>Career</span><b>${f1(s.apex[2])}</b></div><div><span>Off-APEX</span><b>${f1(h.offAPEX)}</b></div><div><span>Hit-APEX</span><b>${f1(h.batAPEX)}</b></div><div><span>DH-Prod</span><b>${f1(h.dhAPEX)}</b></div><div><span>Career runs bat / BR / fld</span><b style="font-size:15px">${f0(h.c_bat)} / ${f0(h.c_br)} / ${f0(h.c_fld)}</b></div></div>`;
    html+=bmCard('h',h);
    html+=receipts(lg,cc);
    const rows=['C','1B','2B','3B','SS','LF','CF','DH'].map(p=>{ const P=p==='LF'?'LF/RF':p; const g=p==='DH'?null:gpos(h,p); const e=elig(h,p), so=startOk(h,p);
      const rk=p==='DH'?null:(()=>{ const pool=t._S.filter(x=>startOk(x,p)&&!Number.isNaN(x['v_'+p])).sort((a,b)=>b['v_'+p]-a['v_'+p]); const i=pool.findIndex(x=>x.name===n); return i>=0?i+1:null; })();
      return `<tr><td><b>${P}</b></td><td class="n">${g===null?'–':Math.round(g)}</td><td>${p==='DH'?'any':e?(so?'start + bench':'bench only'):'<span class="muted">no</span>'}</td><td class="n">${p==='DH'?'–':fx(h[p])}</td><td class="n">${p==='DH'?'–':fx(h['def_'+p],1)}</td><td class="n hide-s">${p==='DH'?'–':(g?p1(h['rf150_'+p]):'–')}</td><td class="n"><b>${fx(h['v_'+p])}</b></td><td class="n hide-s">${rk?'#'+rk:'–'}</td></tr>`;}).join('');
    html+=`<h3>Scores at each position</h3><div class="scroll" style="max-height:none"><table><thead><tr><th>Pos</th><th class="n">G</th><th>Eligible</th><th class="n" title="Total APEX prorated by games at the position">Pos APEX</th><th class="n">Def-APEX</th><th class="n hide-s">Fld/150</th><th class="n">Value (W)</th><th class="n hide-s">Team rank</th></tr></thead><tbody>${rows}</tbody></table></div>
     <p class="small muted">Eligible = min(25% of his franchise games, 100) at the position (LF and RF pooled). Start = also 25% of his games or his most-played position (start guard). Value = Off-APEX + Def-APEX; DH = DH-Prod. Team rank = among players who may start there.</p>`;
    html+=pinUI('h',n,h);
    html+=`<h3>Seasons</h3><div class="scroll" style="max-height:280px"><table><thead><tr><th>Year</th><th class="n">G</th><th class="n">PA</th><th class="n">OPS+</th><th class="n">Bat</th><th class="n">BR</th><th class="n">Fld</th><th class="n hide-s">Pos</th><th class="n hide-s">Rep</th><th class="n">Wins</th></tr></thead><tbody>${s.seasons.map(r=>`<tr${r.q?'':' class="muted" title="under 100 PA: counts in value, not toward the 3-season rule"'}><td>${r.y}</td><td class="n">${r.G}</td><td class="n">${Math.round(r.PA)}</td><td class="n">${fx(r.OPSp,0)}</td><td class="n">${fx(r.bat)}</td><td class="n">${fx(r.br)}</td><td class="n">${fx(r.fld)}</td><td class="n hide-s">${fx(r.pos)}</td><td class="n hide-s">${fx(r.rep)}</td><td class="n"><b>${fx(r.w,2)}</b></td></tr>`).join('')}</tbody></table></div><p class="small muted">Runs, APEX-R; wins = runs ÷ runs-per-win. Grey rows have under 100 PA.</p>`;
  } else { const s=t.pseasons[h.id];
    html+=`<div class="muted small">${esc(t.short)} ${s.yrs[0]}–${s.yrs[1]} · throws ${esc(h.throws)} · ${h.G} G, ${h.GS} GS, ${Math.round(h.IP)} IP · ERA ${fx(h.ERA,2)} (ERA+ ${fx(h.ERAplus,0)}) · K/BB ${fx(h.KBB,2)} · SV ${h.SV} · ${confTag(s.conf)}${s.pre1893?' · pre-1893 seasons count 89%':''}${t.military[h.id]?` · military years skipped: ${t.military[h.id].join(', ')}`:''}</div>
    <div class="kv"><div><span>Combined (#${h.p_rank})</span><b>${f1(h.total)}</b></div><div><span>Starter${h.sp_ok?'':' (not eligible)'}</span><b>${f1(h.SPx)}</b></div><div><span>Reliever${h.rp_ok?'':' (not eligible)'}</span><b>${f1(h.RPx)}</b></div><div><span>Peak3 / Prime5 / Career</span><b style="font-size:15px">${f1(s.apex[0][0])} / ${f1(s.apex[0][1])} / ${f1(s.apex[0][2])}</b></div><div><span>Franchise APEX-R wins</span><b>${f1(h.c_wins)}</b></div><div><span>Runs prevented / replacement</span><b style="font-size:15px">${f0(h.c_prev)} / ${f0(h.c_rep)}</b></div></div>`;
    html+=bmCard('p',h);
    const lines=[...o.rot_log,...o.pen_log,...o.pit_tie_log].filter(x=>x.includes(n));
    const role=slot?(slot.startsWith('SP')?`In the rotation (${slot}): top 5 by Starter score among Starter-eligible pitchers, then min 1 LHP and 1 RHP (90% swap if needed).`:`In the bullpen (${slot}): top 7 by Reliever score among Reliever-eligible pitchers, then a dedicated lefty specialist (closer does not count as the LHS); roles by quality index (0.5 Reliever + 0.5 ERA+, z-scores), LHS by K%, LONG by innings per game among those already in.`):'Not on the staff.';
    const pq=o.pen_q.find(x=>x.name===n);
    html+=`<h3>Receipt</h3><div class="receipt"><p>${esc(role)}</p>${pq?`<p>Quality index ${f3(pq.q)} (K/BB ${pq.KBB}, ERA+ ${pq.ERAplus}, IP per game ${pq.ip_per_app})</p>`:''}${lines.map(x=>`<p>${esc(x)}</p>`).join('')}${cc.map(c=>`<p><span class="tag cc">Close Call</span> ${esc(c.slot)}: ${esc(c.pick)} ${c.pick_v} vs ${esc(c.alt)} ${c.alt_v} (${c.pct}%), ${esc(c.rule)}</p>`).join('')}</div>`;
    html+=pinUI('p',n,h);
    html+=`<h3>Seasons</h3><div class="scroll" style="max-height:280px"><table><thead><tr><th>Year</th><th>Role</th><th class="n">G</th><th class="n">IP</th><th class="n">ERA</th><th class="n hide-s">FIP</th><th class="n hide-s">LI</th><th class="n">Wins</th></tr></thead><tbody>${s.seasons.map(r=>`<tr><td>${r.y}</td><td>${r.role==='S'?'Start':'Relief'}</td><td class="n">${r.G}</td><td class="n">${fx(r.IP)}</td><td class="n">${fx(r.ERA,2)}</td><td class="n hide-s">${fx(r.FIP,2)}</td><td class="n hide-s">${r.role==='R'?fx(r.li,2):''}</td><td class="n"><b>${fx(r.w,2)}</b></td></tr>`).join('')}</tbody></table></div>`;
  }
  $('#mbody').innerHTML=html; $('#modal').hidden=false; $('#modal').scrollTop=0; }
function bmCard(kind,x){ const b=bmOf(kind,x.id); if(!b) return ''; const t0=CUR.t0, tn=t0.short;
  const base=(kind==='h'?t0.hitters:t0.pitchers).find(r=>r.id===x.id); const C=D.bm.caps, w2=v=>E.fmt(v,2), w2p=v=>E.fmt(v,2,true);
  const capO=Math.min(C.oct_w,C.oct_pct*Math.max(base.total,0)), capC=Math.min(C.cl_w,C.cl_pct*Math.max(base.total,0)); const tot=b.d_oct+b.d_cl;
  const oct=b.oct_G?`In <b>${b.oct_G}</b> postseason game${b.oct_G===1?'':'s'} for the ${esc(tn)} he added <b>${w2p(b.oct_wpa)}</b> wins of win probability (WPA: how much each of his plate appearances${kind==='p'?' against him':''} moved his team's chance of winning). Weighted by what each game meant for the series (a World Series Game 7 counts most, an early Division Series game least), that is <b>${w2p(b.oct_w)}</b>${b.oct_best_year?`; his best October was <b>${Math.round(b.oct_best_year)}</b> (${w2p(b.oct_best_w)})`:''}. Bad Octobers cancel good ones, but the total never goes below zero, so October can only help. ${b.d_oct_raw>b.d_oct+1e-12?`Capped at ${w2(capO)} W (the smaller of ${C.oct_w.toFixed(1)} W or ${Math.round(C.oct_pct*100)}% of his ${esc(D.version)} score).`:`Cap ${w2(capO)} W (not reached).`}`
    :`No postseason games for the ${esc(tn)}, so no October bonus.`;
  const cl=b.clutch_PA?`Over <b>${Math.round(b.clutch_PA).toLocaleString('en-US')}</b> regular-season ${kind==='h'?'plate appearances':'batters faced'} for the ${esc(tn)} (play-by-play years), he was <b>${w2p(b.clutch_raw)}</b> wins ${b.clutch_raw>=0?'better':'worse'} in high-pressure spots than his everyday value predicts. That is after removing intentional walks, the league-season average and the league-wide "great hitters look unclutch" bias${kind==='p'?', and (for relief innings) the leverage he was handed, which the Reliever score already pays for':''}. Clutch barely repeats from year to year, so only <b>${Math.round(100*b.shrink)}%</b> of it counts (PA ÷ (PA + ${D.bm.K.toLocaleString('en-US')})): ${w2p(b.d_cl_raw)} W${Math.abs(b.d_cl_raw)>Math.abs(b.d_cl)+1e-12?`, capped at ±${w2(capC)} W (the smaller of ${C.cl_w.toFixed(1)} W or ${Math.round(C.cl_pct*100)}% of his score)`:''}. Clutch can be plus or minus.`
    :`No regular-season play-by-play for his ${esc(tn)} years, so no clutch number.`;
  const parts=kind==='p'?`<div><span>Starter / Reliever parts</span><b style="font-size:15px">${w2p(b.d_oct_SPx+b.d_cl_SPx)} / ${w2p(b.d_oct_RPx+b.d_cl_RPx)}</b></div>`:'';
  const lbl=kind==='h'?'Total APEX':'Combined';
  return `<h3>Big Moments</h3><div class="kv bmkv"><div><span>October bonus</span><b>${w2p(b.d_oct)}</b></div><div><span>Clutch bonus</span><b>${w2p(b.d_cl)}</b></div><div><span>Big Moments total</span><b>${w2p(tot)}</b></div>${parts}<div><span>${lbl}: ${esc(D.version)} → with Big Moments</span><b style="font-size:15px">${f1(base.total)} → ${f1(base.total+tot)}</b></div></div>
   <div class="receipt bmtext"><p><b>October.</b> ${oct}</p><p><b>Clutch.</b> ${cl}</p>${kind==='p'&&b.sd_BF?`<p><b>Shutdown (relief, rule BM2b).</b> Over <b>${Math.round(b.sd_BF).toLocaleString('en-US')}</b> batters faced in relief for the ${esc(tn)}, his shutdown score is <b>${w2p(b.d_sd)}</b> W: win probability he added beyond what his runs prevented are already worth at that leverage, after shrinking (it barely repeats year to year) and the ±1.5 W cap. For relief innings it replaces Clutch, so the Clutch bonus above includes it and only his starts use two-way Clutch.</p>`:''}<p class="muted">${BMON?'Big Moments is ON: these bonuses are inside every score on this card and the roster was rebuilt with them.':'Big Moments is OFF: these numbers are shown for reference only; the scores on this card are pure '+esc(D.version)+'. Turn on the Big Moments switch on the team page to add them.'} Badges appear at +${D.bm.badge_min} W or more.</p></div>`; }
function receipts(lg,cc){ if(!lg.length&&!cc.length) return `<h3>Receipt</h3><div class="receipt"><p>Not on the 26-man roster.</p></div>`;
  return `<h3>Why he was picked</h3>`+lg.map(l=>`<div class="receipt"><p><b>${esc(l.slot)}</b> · ${esc(l.need)}</p><p>${esc(l.score)}</p><p class="muted">${esc(l.fit)}</p>${l.override?`<p><span class="tag ov">${l.override==='Fan override'?'Fan override':'Override note'}</span> ${esc(l.override)}</p>`:''}${l.close?`<p><span class="tag cc">Close Call</span> ${esc(l.close)}</p>`:''}</div>`).join('')
   +cc.filter(c=>!lg.some(l=>l.slot===c.slot)).map(c=>`<div class="receipt"><p><span class="tag cc">Close Call</span> ${esc(c.slot)}: ${esc(c.pick)} ${c.pick_v} vs ${esc(c.alt)} ${c.alt_v} (${c.pct}%), ${esc(c.rule)}</p></div>`).join(''); }
function pinUI(kind,n,h){ const p=CUR.pins;
  if(kind==='h'){ const cur=(p.roster||{})[n]||''; const inNine=Object.values(CUR.o.start).includes(n); const lp=(p.lineup||{})[n]||'';
    return `<h3>Fan override</h3><div class="tools"><label class="small">Pin to slot <select data-pin="roster" data-n="${esc(n)}"><option value="">(no pin)</option>${POS9.concat(BENCH_SLOTS).map(s=>`<option value="${s}" ${cur===s?'selected':''}>${s}${POS9.includes(s)&&s!=='DH'&&!startOk(h,s)?' (outside rules)':''}</option>`).join('')}</select></label>
     <label class="small">Bat in slot <select data-pin="lineup" data-n="${esc(n)}" ${inNine||lp?'':'disabled'}><option value="">(rules)</option>${[1,2,3,4,5,6,7,8,9].map(k=>`<option ${+lp===k?'selected':''}>${k}</option>`).join('')}</select></label></div><p class="small muted">Pins rebuild the nine, bench, and lineup around him; the receipt says "Fan override". Lineup pins work for players in the starting nine.</p>`; }
  const cur=(p.staff||{})[n]||''; const roleOpts=['CL','SU1','SU2','LHS','LONG','MID1','MID2'];
  return `<h3>Fan override</h3><div class="tools"><label class="small">Pin to <select data-pin="staff" data-n="${esc(n)}"><option value="">(no pin)</option><option value="ROT" ${cur==='ROT'?'selected':''}>Rotation</option><option value="PEN" ${cur==='PEN'?'selected':''}>Bullpen</option>${roleOpts.map(r=>`<option value="${r}" ${cur===r?'selected':''}>${r}</option>`).join('')}</select></label></div><p class="small muted">Rotation / bullpen pins force that unit. A role pin (CL, SU1, …) forces the bullpen and that role; the rest rebuilds around him.</p>`; }
// ---------- export ----------
function rosterText(){ const t=CUR.t,o=CUR.o; const L=[`ALL-TIME ${t.name.toUpperCase()} – Legacy Lore Clubhouse (engine ${engLabel()})${pinCount(CUR.pins)?' – with fan override pins':''}`,'','LINEUP'];
  for(const l of o.lineup) L.push(`${l.slot}. ${l.name} ${l.pos}`); L.push('','BENCH'); for(const [s,n] of Object.entries(o.bench)) L.push(`${s}: ${n}`);
  L.push('','ROTATION'); for(const [s,n] of Object.entries(o.rotation)) L.push(`${s}: ${n}`); L.push('','BULLPEN'); for(const [s,n] of Object.entries(o.pen)) L.push(`${s}: ${n}`);
  if(o.close_calls.length){ L.push('','CLOSE CALLS'); for(const c of o.close_calls) L.push(`${c.slot}: ${c.pick} ${c.pick_v} vs ${c.alt} ${c.alt_v} (${c.pct}%)`); }
  return L.join('\n'); }
function copy(txt,msg){ const done=()=>toast(msg||'Copied'); if(navigator.clipboard&&window.isSecureContext) navigator.clipboard.writeText(txt).then(done,()=>fallback()); else fallback();
  function fallback(){ const a=document.createElement('textarea'); a.value=txt; document.body.appendChild(a); a.select(); try{document.execCommand('copy'); done();}catch(e){ prompt('Copy:',txt);} a.remove(); } }
function toast(m){ let d=$('#toast'); if(!d){ d=document.createElement('div'); d.id='toast'; d.style.cssText='position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:#1d232b;color:#fff;padding:8px 14px;border-radius:8px;z-index:99;font-size:14px'; document.body.appendChild(d);} d.textContent=m; d.style.display='block'; clearTimeout(d._t); d._t=setTimeout(()=>d.style.display='none',1800); }
function download(name,txt){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([txt],{type:'application/json'})); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2000); }
function foot(){ $('#foot').innerHTML=`Legacy Lore Clubhouse app ${esc(D.app_version)} · ${D.teams.length} franchises · engine ${esc(D.bm.engine)} (Big Moments ${BMON?'ON':'OFF'}) · data ${esc(D.exported)} · static build, works offline · ${!verified()?`self-check running (${VDONE}/${D.teams.length})`:allOk()?'JS engine = Python engine (no pins) ✓ · Big Moments ✓':'self-check FAILED'}`; }
// ---------- router ----------
let VIEW='';
function render(){ const h=location.hash.replace(/^#\/?/,'').split('/'); const k=h[0]; let html;
  if(TEAM(k)&&!LLData.loaded(k)){ const t=TEAM(k); $('#app').innerHTML=`<p class="loading">Loading ${esc(t.name)}…</p>`; foot();   // app v1.3.1: decode this team, then draw
    LLData.ensure(k).then(()=>{ if(location.hash.replace(/^#\/?/,'').split('/')[0]===k) render(); },e=>{ $('#app').innerHTML=`<div class="banner">Could not load ${esc(t.name)}: ${esc(e.message)}</div>`; }); return; }
  if(TEAM(k)){ VIEW=h[1]||''; html=VIEW==='hitters'?vHit(k):VIEW==='pitchers'?vPit(k):vClub(k); }
  else if(k==='rules') html=vRules(); else if(k==='about') html=vAbout(); else html=vHome();
  $('#app').innerHTML=html;
  foot();
  const q=$('#q'); if(q){ q.oninput=e=>{ FILT.q=e.target.value; const pos=q.selectionStart; render(); const q2=$('#q'); q2.focus(); q2.setSelectionRange(pos,pos); }; }
  const pf=$('#posf'); if(pf) pf.onchange=e=>{ FILT.pos=e.target.value; if(FILT.pos) SORT.hit=['pval',false]; else if(SORT.hit[0]==='pval') SORT.hit=['total',false]; render(); };
  const rf=$('#rolef'); if(rf) rf.onchange=e=>{ FILT.role=e.target.value; render(); };
  const tp=$('#teampick'); if(tp) tp.onchange=e=>{ if(e.target.value) location.hash='#/'+e.target.value+(VIEW&&TEAM(e.target.value)&&CUR?(VIEW==='hitters'||VIEW==='pitchers'?'/'+VIEW:''):''); };
  const cp=$('#citypick'); if(cp) cp.onchange=e=>{ saveCity(CUR.t0.key,e.target.value); compute(CUR.t0.key); render(); toast(e.target.value?'City: '+e.target.selectedOptions[0].text:'Full franchise'); };
}
document.addEventListener('click',e=>{
  const sw=e.target.closest('[data-swap]'); if(sw&&!e.target.closest('[data-card]')){ e.preventDefault(); e.stopPropagation(); swapSheet(sw.dataset.swap); return; }
  const c=e.target.closest('[data-card]'); if(c&&!e.target.closest('select')){ e.preventDefault(); card(c.dataset.card,c.dataset.n); return; }
  const s=e.target.closest('[data-sort]'); if(s){ const [tb,col]=s.dataset.sort.split(':'); SORT[tb]=SORT[tb][0]===col?[col,!SORT[tb][1]]:[col,['name','throws','pos','conf','total_rank','p_rank'].includes(col)]; render(); return; }
  const a=e.target.closest('[data-act]'); if(a){ const act=a.dataset.act;
    if(act==='dopin'){ const kind=a.dataset.kind, n=a.dataset.n, slot=a.dataset.slot;
      setPins(p=>{ if(kind==='roster'){ p.roster=p.roster||{}; applyRosterPin(p,n,slot); } else { p.staff=p.staff||{}; applyStaffPin(p,n,/^SP/.test(slot)?'ROT':slot); } });
      $('#modal').hidden=true; toast('Pinned '+n+' to '+slot); return; }
    if(act==='clearslot'){ const slot=a.dataset.slot, kind=a.dataset.kind;
      setPins(p=>{ if(kind==='h'){ p.roster=p.roster||{}; for(const [m,s] of Object.entries(p.roster)) if(s===slot) delete p.roster[m]; }
        else { p.staff=p.staff||{}; for(const [m,s] of Object.entries(p.staff)) if(s===slot||(s==='ROT'&&/^SP/.test(slot))||(s==='PEN'&&['CL','SU1','SU2','LHS','LONG','MID1','MID2'].includes(slot))) delete p.staff[m]; } });
      $('#modal').hidden=true; toast('Cleared pin at '+slot); return; }
    if(a.tagName==='BUTTON'){
      if(act==='clear') setPins(p=>{ for(const k in p) delete p[k]; });
      if(act==='copy') copy(rosterText(),'Roster copied');
      if(act==='export') download(`legacy_lore_${CUR.t.key}_${D.version}${BMON?'_bigmoments':''}.json`,JSON.stringify({team:CUR.t.name,engine:engLabel(),big_moments:BMON,pins:CUR.pins,start:CUR.o.start,bench:CUR.o.bench,rotation:CUR.o.rotation,pen:CUR.o.pen,lineup:CUR.o.lineup,close_calls:CUR.o.close_calls,log:CUR.o.log,team_runs:CUR.o.team_runs},null,1));
      if(act==='pinsjson') copy(JSON.stringify(CUR.pins),'Pins JSON copied (engine_v5.py pins file)');
      if(act==='copyrules') copy(D.rules,'Rules copied'); } }
  if(e.target.closest('.x')||e.target.id==='modal') $('#modal').hidden=true; });
document.addEventListener('change',e=>{ const t=e.target;
  if(t.dataset.pin){ const n=t.dataset.n, v=t.value, kind=t.dataset.pin;
    setPins(p=>{ p[kind]=p[kind]||{};
      if(kind==='roster'){ if(v) applyRosterPin(p,n,v); else delete p.roster[n]; }
      else if(kind==='staff'){ if(v) applyStaffPin(p,n,v); else delete p.staff[n]; }
      else if(kind==='lineup'){ if(v){ for(const [m,s] of Object.entries(p.lineup)) if(+s===+v) delete p.lineup[m]; p.lineup[n]=+v; } else delete p.lineup[n]; }
      else { if(v) p[kind][n]=v; else delete p[kind][n]; } });
    card(t.dataset.pin==='staff'?'p':'h',n); toast('Rebuilt with fan override'); }
  if(t.dataset.act==='bm'){ setBM(t.checked); if(CUR) compute(CUR.t0.key); render(); toast(BMON?'Big Moments ON: rosters rebuilt':'Big Moments OFF: engine '+D.version); return; }
  if(t.dataset.act==='rule-dh') setPins(p=>{ p.rules=p.rules||{}; if(t.checked) delete p.rules.dh_defense_first; else p.rules.dh_defense_first=false; });
  if(t.dataset.act==='rule-guard') setPins(p=>{ p.rules=p.rules||{}; if(t.checked) delete p.rules.primary_pos_guard; else p.rules.primary_pos_guard=false; }); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape') $('#modal').hidden=true; });
window.addEventListener('hashchange',()=>{ FILT={q:'',pos:'',role:''}; $('#modal').hidden=true; render(); window.scrollTo(0,0); });
render(); setTimeout(()=>runVerify(0),50);
window.LL_SELFCHECK=()=>({done:verified(),ok:allOk(),VERIFY,VERIFY_BM});   // for the headless test
window.LL_TEST={render,card,setBM,sort:(tb,col,asc)=>{ SORT[tb]=[col,asc]; },filt:f=>{ FILT=Object.assign({q:'',pos:'',role:''},f); }};   // app v1.3.1: used by tests/dom_compare.js only
})();
