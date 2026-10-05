/* Legacy Lore clubhouse engine, JavaScript port of engine_v5.py selection logic (v0.9.3; selection logic unchanged since v0.9.2), lines "starting 8" to the end.
   Input: one team from LL_DATA (hitter and pitcher score tables written by engine_v5.py) plus fan-override pins:
     pins = {roster:{name:slot}, lineup:{name:1-9}, staff:{name:'ROT'|'PEN'}, rules:{dh_defense_first:false|{k,min_gap}, primary_pos_guard:false|{pct}}}
   Output: the same structure as v5_out.json. Every string mirrors the Python f-strings so the receipts can be diffed. */
(function(root){
'use strict';
const POS=['C','1B','2B','3B','SS','LF','CF','RF'], POS9=POS.concat(['DH']), FAMS=['C','1B','2B','3B','SS','LF','CF'];
const POSADJ={C:12.5,'1B':-12.5,'2B':2.5,'3B':2.5,SS:7.5,LF:-7.5,CF:2.5,RF:-7.5,DH:-17.5};
const SS_GLOVE_FLOOR=-5.0, ROT_MIN_HAND=2, ROT_SWAP_PCT=0.90, CLOSE_PCT=0.02, CLOSE_PTS=2.0, SP_MIN_GS=30, RP_MIN_G=100, PIT_TIE=0.02, HAND_CLOSE=0.05;
// ---------- Python-exact number formatting ----------
function exactDec(x){ // exact decimal expansion of a finite double: {neg, int:'digits', frac:'digits'}
  const buf=new DataView(new ArrayBuffer(8)); buf.setFloat64(0,x);
  const hi=buf.getUint32(0), lo=buf.getUint32(4); const neg=(hi>>>31)===1; const ex=(hi>>>20)&0x7ff;
  let m=(BigInt(hi&0xfffff)<<32n)|BigInt(lo); let e;
  if(ex===0){e=-1074;} else {m|=1n<<52n; e=ex-1075;}
  if(m===0n) return {neg,int:'0',frac:''};
  if(e>=0) return {neg,int:(m<<BigInt(e)).toString(),frac:''};
  const k=-e; let s=(m*(5n**BigInt(k))).toString(); if(s.length<=k) s='0'.repeat(k-s.length+1)+s;
  return {neg,int:s.slice(0,s.length-k),frac:s.slice(s.length-k).replace(/0+$/,'')};
}
function fmt(x,d,plus){ // Python format(x, '.{d}f') / '+.{d}f' (round-half-even on the exact value)
  if(Number.isNaN(x)) return (plus?'+':'')+'nan';
  if(!Number.isFinite(x)) return (x<0?'-':(plus?'+':''))+'inf';
  const D=exactDec(x); let frac=D.frac.padEnd(d+1,'0'); let keep=D.int+frac.slice(0,d); const rest=frac.slice(d);
  let up=false; if(rest[0]>'5') up=true; else if(rest[0]==='5'){ if(/[1-9]/.test(rest.slice(1))) up=true; else up=(parseInt(keep[keep.length-1])%2===1); }
  let n=BigInt(keep); if(up) n+=1n; let s=n.toString(); if(d>0){ s=s.padStart(d+1,'0'); s=s.slice(0,s.length-d)+'.'+s.slice(s.length-d); }
  return (D.neg?'-':(plus?'+':''))+s;
}
const f1=x=>fmt(x,1), p1=x=>fmt(x,1,true), f0=x=>fmt(x,0);
const pyRound=(x,d)=>{const v=parseFloat(fmt(x,d)); return v===0&&(x<0||Object.is(x,-0))?-0:v;}  // Python round(float, d)
function npRound(x,d){ const f=10**d, y=x*f, fl=Math.floor(y), df=y-fl; let r; if(df<0.5) r=fl; else if(df>0.5) r=fl+1; else r=(fl%2===0)?fl:fl+1; const v=r/f; return (v===0&&x<0)?-0:v; } // numpy round
const trunc=Math.trunc;
function pySum(a){ let r=0, c=0; for(const y of a){ const t=r+y; if(Math.abs(r)>=Math.abs(y)) c+=(r-t)+y; else c+=(y-t)+r; r=t; } if(c&&Number.isFinite(c)) r+=c; return r; } // CPython 3.12+ sum() of floats (Neumaier)
function pyStr(v,isFloat){ if(typeof v==='number'){ if(Number.isNaN(v)) return 'nan'; if(isFloat){ let s=String(v); if(!/[.e]/.test(s)) s+='.0'; return s;} return String(v);} return String(v); }
// numpy pairwise sum (used by pandas mean/std)
function npSum(a){ const n=a.length; if(n<8){let s=0; for(const v of a) s+=v; return s===0?0:s;} if(n<=128){ const r=a.slice(0,8); let i; for(i=8;i<n-(n%8);i+=8){ for(let j=0;j<8;j++) r[j]+=a[i+j]; } let res=((r[0]+r[1])+(r[2]+r[3]))+((r[4]+r[5])+(r[6]+r[7])); for(;i<n;i++) res+=a[i]; return res;} const n2=Math.floor(n/2)-(Math.floor(n/2)%8); return npSum(a.slice(0,n2))+npSum(a.slice(n2)); }
function zs(arr){ const n=arr.length, m=npSum(arr)/n; const v=npSum(arr.map(x=>(x-m)**2))/(n-1); const sd=Math.sqrt(v); return arr.map(x=>(x-m)/sd); }
// pandas-like sort: keys descending/ascending, NaN last, stable
function sortBy(arr,keys,asc){ keys=[].concat(keys); const A=keys.map((k,i)=>Array.isArray(asc)?asc[i]:!!asc);
  return arr.map((r,i)=>[r,i]).sort((x,y)=>{ for(let k=0;k<keys.length;k++){ const a=x[0][keys[k]], b=y[0][keys[k]]; const an=Number.isNaN(a), bn=Number.isNaN(b); if(an||bn){ if(an&&bn) continue; return an?1:-1; } if(a!==b) return A[k]?(a<b?-1:1):(a>b?-1:1);} return x[1]-y[1]; }).map(x=>x[0]); }
function prep(rows){ return rows.map(r=>{const o={}; for(const k in r) o[k]=(r[k]===null?NaN:r[k]); return o;}); }
// ---------- engine ----------
function build(team,pins){
  pins=pins||{}; const HF=new Set(team.hfloat||[]);
  const S=team._S||(team._S=prep(team.hitters)), PX=team._P||(team._P=prep(team.pitchers));
  const byName=new Map(S.map(h=>[h.name,h]));
  const gpos=(h,p)=>(p==='LF'||p==='RF')?h.g_LF+h.g_RF:h['g_'+p];
  const elig=(h,p)=>p==='DH'?true:(gpos(h,p)>=h.elig_min&&gpos(h,p)>0);
  const rules=pins.rules||{};
  const GUARD=('primary_pos_guard' in rules)?rules.primary_pos_guard:{pct:0.25}; const GUARD_PCT=(GUARD||{}).pct!==undefined?(GUARD||{}).pct:0.25;
  const most_played=h=>{let b=FAMS[0]; for(const q of FAMS) if(gpos(h,q)>gpos(h,b)) b=q; return b;};
  const start_ok=(h,p)=>{ if(p==='DH') return true; if(!elig(h,p)) return false; if(!GUARD) return true; const q=(p==='LF'||p==='RF')?'LF':p; return gpos(h,p)>=GUARD_PCT*h.G_team||most_played(h)===q; };
  const guard_log=[], log=[], close_calls=[];
  const rec=(slot,h,score,need,fit,over)=>log.push({slot,pick:h.name,score,need,fit,override:over===undefined?null:over});
  function close(slot,pick,pv,alt,av,rule){
    if(pv>0&&(1-CLOSE_PCT)*pv<=av&&av<=pv){
      close_calls.push({slot,pick,alt,pick_v:pyRound(pv,1),alt_v:pyRound(av,1),pct:pyRound(100*av/pv,1),rule});
      for(let i=log.length-1;i>=0;i--) if(log[i].slot===slot){ log[i].close=`Close Call: ${pick} ${f1(pv)} vs ${alt} ${f1(av)} (${f1(100*av/pv)}%) on ${rule}`; break; }
    }
  }
  const RP_PINS=pins.roster||{};
  const pinned_start={}; for(const [n,slot] of Object.entries(RP_PINS)) if(POS9.includes(slot)) pinned_start[slot]=byName.get(n);
  const pin_names=new Set(Object.keys(RP_PINS));
  const cand=sortBy(S.filter(h=>!pin_names.has(h.name)),'total',false).slice(0,60);
  let m0=0; for(const p in pinned_start) m0+=1<<POS9.indexOf(p);
  let dp=new Map([[m0,[0,0,[]]]]);
  const gt=(a,b)=>a[0]!==b[0]?a[0]>b[0]:a[1]>b[1];
  cand.forEach((h,i)=>{ const nw=new Map(dp);
    for(const [mask,[s,t,l]] of dp){ for(let j=0;j<9;j++){ const p=POS9[j];
      if(!((mask>>j)&1)&&start_ok(h,p)){ const m2=mask|(1<<j); const v=[s+h['v_'+p],t+h.total]; const cur=nw.get(m2)||[-1e9,-1e9];
        if(gt(v,cur)) nw.set(m2,[v[0],v[1],l.concat([[p,i]])]); } } }
    dp=nw; });
  const start={}; for(const [p,i] of dp.get(511)[2]) start[p]=cand[i]; for(const p in pinned_start) start[p]=pinned_start[p];
  // DH glove rule
  const DHR=('dh_defense_first' in rules)?rules.dh_defense_first:{k:3,min_gap:1.0}; const dhrule_log=[]; let dhswap=null;
  if(DHR&&!('DH' in pinned_start)){
    const D0=start.DH, k=DHR.k!==undefined?DHR.k:3, mg=DHR.min_gap!==undefined?DHR.min_gap:1.0;
    const contested=POS.filter(p=>!(p in pinned_start)&&start_ok(D0,p));
    const pool=[[D0,'DH']].concat(contested.map(p=>[start[p],p])).map((x,i)=>[x,i]).sort((a,b)=>(-a[0][0].dhAPEX)-(-b[0][0].dhAPEX)||a[1]-b[1]).map(x=>x[0]).slice(0,k);
    dhrule_log.push(`candidates (top ${k} by DH-Prod among the DH and starters at positions he is eligible for): `+pool.map(([h,q])=>`${h.name} (${q}, DH-Prod ${f1(h.dhAPEX)})`).join(', '));
    if(pool.some(([h,q])=>q==='DH')){ let best=null;
      for(const [h,q] of pool){ if(q==='DH') continue; const gap=D0['rf150_'+q]-h['rf150_'+q];
        dhrule_log.push(`${q}: ${D0.name} ${p1(D0['rf150_'+q])}/150 vs ${h.name} ${p1(h['rf150_'+q])}/150 (gap ${p1(gap)}); value change if swapped ${p1(D0['v_'+q]+h.dhAPEX-h['v_'+q]-D0.dhAPEX)} W`);
        if(gap>=mg&&(best===null||gap>best[0])) best=[gap,q,h]; }
      if(best){ const [gap,q,h]=best; start[q]=D0; start.DH=h;
        dhswap={pos:q,fld:D0.name,dh:h.name,r_f:D0['rf150_'+q],r_d:h['rf150_'+q],cost:h['v_'+q]+D0.dhAPEX-D0['v_'+q]-h.dhAPEX};
        dhrule_log.push(`SWAP: ${D0.name} plays ${q}, ${h.name} DHs (better glove fields)`);
      } else dhrule_log.push(`no swap: the DH does not have the better glove by >= ${f1(mg)} runs/150`);
    }
  }
  for(const p of POS){ const h=start[p]; const mp=most_played(h);
    guard_log.push(`${p}: ${h.name} - ${trunc(gpos(h,p))} of ${trunc(h.G_team)} franchise G (${f0(100*gpos(h,p)/Math.max(h.G_team,1))}%) at ${(p==='LF'||p==='RF')?'LF/RF':p}; most-played ${mp==='LF'?'LF/RF':mp}`+((p in pinned_start)?' (pinned)':'')); }
  const TEAM_RUNS=pySum(POS9.map(p=>start[p]['v_'+p]));
  const tie_log=[];
  { const lf=start.LF, rf=start.RF; if(!('LF' in pinned_start)&&!('RF' in pinned_start)&&lf.g_RF+rf.g_LF>lf.g_LF+rf.g_RF){ start.LF=rf; start.RF=lf; } }
  const used=new Set(Object.values(start).map(h=>h.name)); for(const n of pin_names) used.add(n);
  for(const p of POS){ const h=start[p]; const ex=new Set(used); ex.delete(h.name);
    const top=sortBy(S.filter(x=>!ex.has(x.name)&&start_ok(x,p)),['v_'+p,'total'],false);
    const alt=top.filter(x=>x.name!==h.name)[0]; let over=null; const best=top[0];
    const hp=sortBy(S.filter(x=>!pin_names.has(x.name)),p,false)[0];
    if(hp.name!==h.name&&!elig(hp,p)) over=`${hp.name} has a higher ${p} score (${f1(hp[p])}) but only ${trunc(gpos(hp,p))} G there (< ${f0(hp.elig_min)} needed)`;
    else if(hp.name!==h.name&&!start_ok(hp,p)) over=`${hp.name} has a higher ${p} score (${f1(hp[p])}) but ${p} is only ${f0(100*gpos(hp,p)/hp.G_team)}% of his franchise games and not his most-played position (start guard)`;
    if(dhswap&&p===dhswap.pos) over=`DH glove rule: ${dhswap.fld} fields ${p} (${p1(dhswap.r_f)}/150 vs ${dhswap.dh} ${p1(dhswap.r_d)}/150); cost ${f1(dhswap.cost)} W vs the value-only alignment`;
    if(p in pinned_start){ rec(p,h,`${p}-APEX ${f1(h[p])} (total ${f1(h.total)})`,`starting ${p}`,'pinned by Joseph','Fan override'); continue; }
    if(best.name!==h.name){ const q=Object.entries(start).filter(([q,x])=>x.name===best.name).map(x=>x[0]); over=`${best.name} has a higher value at ${p} (${f0(best['v_'+p])}) but the team-runs assignment uses him at ${used.has(best.name)?q[0]:'?'}`; }
    rec(p,h,`Value ${f1(h['v_'+p])} W = Off ${f1(h.offAPEX)} (hit ${f1(h.batAPEX)} + BR) + Def ${p1(h['def_'+p])} (fielding ${p1(h['rf150_'+p])} runs/150 + pos ${p1(POSADJ[p])}); Total ${f1(h.total)} (#${h.total_rank}); ${trunc(gpos(h,p))} G at ${(p==='LF'||p==='RF')?'LF/RF':p}`,
      `starting ${p} (eligible: >= min(25% of franchise G, 100); start guard: >= 25% of his franchise G or most-played position)`,`next eligible by value: ${alt.name} ${f1(alt['v_'+p])} W`,over);
    close(p,h.name,h['v_'+p],alt.name,alt['v_'+p],`value at ${p} (W)`);
  }
  // DH
  const dh=start.DH; used.add(dh.name);
  { const ex=new Set(used); ex.delete(dh.name); var R=sortBy(S.filter(x=>!ex.has(x.name)),'dhAPEX',false); }
  const R2=R.filter(x=>x.name!==dh.name);
  let better_bats=POS.map(p=>start[p]).filter(x=>x.dhAPEX>dh.dhAPEX); if(dhswap) better_bats=[];
  if('DH' in pinned_start) rec('DH',dh,`DH-Prod ${f1(dh.dhAPEX)} W (hitting only); total ${f1(dh.total)}, #${dh.total_rank}`,'DH','pinned by Joseph','Fan override');
  else rec('DH',dh,`DH-Prod ${f1(dh.dhAPEX)} W (0.25 bat + 0.40 OPS+ runs + 0.35 power runs + replacement; no fielding); DH-Prod + baserunning (reference only) ${f1(dh.dhbrAPEX)}; pure Hit-APEX ${f1(dh.batAPEX)}; total ${f1(dh.total)}, #${dh.total_rank})`,'DH chosen jointly with the 8 fielders (max team runs)',
    `best bench bats: ${R2[0].name} ${f1(R2[0].dhAPEX)}, ${R2[1].name} ${f1(R2[1].dhAPEX)}`,
    dhswap?`DH glove rule: weaker glove DHs (${dhswap.dh} ${p1(dhswap.r_d)}/150 at ${dhswap.pos} vs ${dhswap.fld} ${p1(dhswap.r_f)}); cost ${f1(dhswap.cost)} W`:(better_bats.length?better_bats.map(x=>`${x.name} out-hits him (DH-Prod ${f0(x.dhAPEX)}) but adds more as a fielder`).join('; '):null));
  if(!('DH' in pinned_start)&&!dhswap) close('DH',dh.name,dh.dhAPEX,R2[0].name,R2[0].dhAPEX,'DH-Prod (W)');
  const r1=x=>npRound(x,1);
  const dh_table=R.slice(0,8).map(x=>({name:x.name,dhAPEX:r1(x.dhAPEX),dhbrAPEX:r1(x.dhbrAPEX),batAPEX:r1(x.batAPEX),dhAPEX_wp:r1(x.dhAPEX_wp),batAPEX_wp:r1(x.batAPEX_wp),rbat600:r1(x.rbat600),total:r1(x.total)}));
  // bench
  const bench={}; const rest=()=>sortBy(S.filter(x=>!used.has(x.name)),'total',false);
  function take(slot,df,need,fit,why,key){ key=key||'total';
    const pn=Object.entries(RP_PINS).filter(([n,sl])=>sl===slot).map(x=>x[0]);
    if(pn.length){ const h=byName.get(pn[0]); rec(slot,h,`total ${f1(h.total)}`,need,'pinned by Joseph','Fan override'); bench[slot]=h; return; }
    df=sortBy(df,key,false); if(!df.length) return; const h=df[0], t=rest()[0];
    const over=t.name===h.name?null:(why?why(t,h):`${t.name} (#${t.total_rank}) higher total but doesn't fit ${slot}`);
    rec(slot,h,`total ${f1(h.total)} (#${h.total_rank})`,need,fit(h),over); used.add(h.name); bench[slot]=h;
    if(df.length>1) close(slot,h.name,h[key],df[1].name,df[1][key],(key==='dhAPEX'?'DH-Prod':'Total APEX')+' among eligible (W)');
  }
  take('C2',rest().filter(h=>elig(h,'C')),'backup C (mandatory)',h=>`C-APEX ${f1(h.C)}; ${pyStr(h.g_C,HF.has('g_C'))} G at C`,(t,h)=>`${t.name} (#${t.total_rank}) can't catch; C2 filled first`);
  const ssel=rest().filter(h=>elig(h,'SS')); let okg=ssel.filter(h=>h.ss_rf150>=SS_GLOVE_FLOOR); let util_note=`SS-eligible and SS fielding >= ${f0(SS_GLOVE_FLOOR)} runs/150 G`;
  if(!okg.length){ okg=sortBy(ssel,'ss_rf150',false).slice(0,1); util_note='no SS-eligible player meets the glove floor -> best SS glove'; }
  const okmax=Math.max(...okg.map(h=>h.total)); const failed=ssel.filter(h=>h.ss_rf150<SS_GLOVE_FLOOR&&h.total>okmax);
  take('UTIL-IF',okg,'utility IF (v0.4: '+util_note+')',h=>`${h.pos}; SS fielding ${p1(h.ss_rf150)} runs/150 G at SS (${trunc(h.ss_g)} G); Total ${f1(h.total)}`,
    (t,h)=>failed.map(x=>`${x.name} (#${x.total_rank}, Total ${f1(x.total)}) fails glove check: ${p1(x.ss_rf150)} runs/150 at SS`).join('; ')||`${t.name} (#${t.total_rank}) not SS-eligible`);
  take('OF4',rest().filter(h=>['LF','CF','RF'].some(p=>elig(h,p))),'4th OF',h=>`${h.pos}`,(t,h)=>`${t.name} (#${t.total_rank}) not OF-eligible`);
  const IF=['1B','2B','3B','SS'], OF=['LF','CF','RF'];
  const grp_count=gr=>Object.values(bench).filter(b=>b.name&&gr.some(p=>elig(b,p))).length;
  const fl=rest().filter(h=>POS.reduce((a,p)=>a+h['g_'+p],0)>0); const top=fl[0]; const band=fl.filter(h=>h.total>=0.85*top.total);
  const nIF=grp_count(IF), nOF=grp_count(OF); const thin=nOF<nIF?OF:(nIF<nOF?IF:null);
  const flex_note=`bench before FLEX: ${nIF} IF-capable, ${nOF} OF-capable -> thinnest = ${thin===OF?'OF':thin===IF?'IF':'tie'}`;
  let pick=top; if(thin){ const b2=band.filter(h=>thin.some(p=>elig(h,p))); pick=b2.length?b2[0]:top; }
  used.add(pick.name); bench.FLEX=pick;
  rec('FLEX',pick,`total ${f1(pick.total)} (#${pick.total_rank})`,'PR/defense or extra IF/OF; prefer thinnest group within 15% of best total',`${flex_note}; 15% band: `+band.map(x=>`${x.name} ${f1(x.total)}`).join(', '),
    pick.name===top.name?null:`${top.name} (#${top.total_rank}, ${f1(top.total)}) is best total but adds to the thicker group`);
  take('BAT',rest().filter(h=>h.PA_bref>=1500),'bench bat: best run producer left (DH-Prod)',h=>`DH-Prod ${f1(h.dhAPEX)} (Hit-APEX ${f1(h.batAPEX)}); ${pyStr(h.rbat600,HF.has('rbat600'))} BatRuns/600; bats ${h.bats}`,(t,h)=>`${t.name} (#${t.total_rank}) higher total but DH-Prod ${f1(t.dhAPEX)} vs ${f1(h.dhAPEX)}`,'dhAPEX');
  // pitchers
  const PST=pins.staff||{}; const PIN_ROT=Object.keys(PST).filter(n=>PST[n]==='ROT'), PIN_PEN=Object.keys(PST).filter(n=>PST[n]==='PEN');
  const pit_tie_log=[]; let SPP=PX.filter(r=>r.sp_ok);
  const notIn=(a,b)=>{const s=new Set(b.map(r=>r.id)); return a.filter(r=>!s.has(r.id));};
  function tieCut(sel,pool,key,label){ const last=sortBy(sel,key,true)[0]; const alt=sortBy(notIn(pool,sel),key,false); if(!alt.length) return sel; const a=alt[0];
    if(last[key]>0&&a[key]>=(1-PIT_TIE)*last[key]&&a.total>last.total){ pit_tie_log.push(`${label}: ${a.name} (${key} ${f1(a[key])}, Combined ${f1(a.total)}) replaces ${last.name} (${key} ${f1(last[key])}, Combined ${f1(last.total)}); within 2%, higher Combined`);
      return sortBy(sel.filter(r=>r.id!==last.id).concat([a]),key,false); } return sel; }
  let rot;
  if(PIN_ROT.length||PIN_PEN.length){ SPP=SPP.filter(r=>!PIN_ROT.includes(r.name)&&!PIN_PEN.includes(r.name)); const fx=PX.filter(r=>PIN_ROT.includes(r.name)); const nf=5-fx.length;
    rot=sortBy(fx.concat(nf>0?tieCut(sortBy(SPP,'SPx',false).slice(0,nf),SPP,'SPx','SP5'):[]),'SPx',false); }
  else rot=tieCut(sortBy(SPP,'SPx',false).slice(0,5),SPP,'SPx','SP5');
  const rot_log=PIN_ROT.map(n=>`Fan override: ${n} pinned to the rotation`), ROT_OUT=[];
  const pct90=trunc(100*ROT_SWAP_PCT), pct5=trunc(100*HAND_CLOSE);
  function handClose(o,i){ const r=100*i.SPx/o.SPx; if(Math.abs(r-100*ROT_SWAP_PCT)<=CLOSE_PTS){
    close_calls.push({slot:'SP (hand rule)',pick:o.name,alt:i.name,pick_v:pyRound(o.SPx,1),alt_v:pyRound(i.SPx,1),pct:pyRound(r,1),rule:`rotation handedness swap needs ${pct90}%; ${i.throws}HP ${i.name} is at ${f1(r)}% of ${o.name}`});
    rot_log.push(`Close Call: ${i.name} (${i.throws}, ${f1(i.SPx)}) is ${f1(r)}% of ${o.name} (${f1(o.SPx)}); the swap line is ${pct90}%`); } }
  function handPickClose(c,key,slot,lg,why){ if(c.length>1){ const a=c[0], b=c[1]; if(a[key]>0&&b[key]>=(1-HAND_CLOSE)*a[key]){ const r=100*b[key]/a[key];
    close_calls.push({slot,pick:a.name,alt:b.name,pick_v:pyRound(a[key],1),alt_v:pyRound(b[key],1),pct:pyRound(r,1),rule:`${why}: next ${b.throws}HP ${b.name} is at ${f1(r)}% of ${a.name} (within ${pct5}%)`});
    lg.push(`Close Call: ${why} chose ${a.name} (${f1(a[key])}); next ${b.throws}HP ${b.name} (${f1(b[key])}) is ${f1(r)}% of him (within ${pct5}%)`); } } }
  for(const hm of ['L','R']){
    while(rot.filter(r=>r.throws===hm).length<ROT_MIN_HAND){
      const maj=sortBy(rot.filter(r=>r.throws!==hm&&!PIN_ROT.includes(r.name)),'SPx',true);
      if(!maj.length){ rot_log.push(`only ${rot.filter(r=>r.throws===hm).length} ${hm}HP; every other starter is pinned -> no swap`); break; }
      const out_=maj[0]; const c=sortBy(notIn(SPP,rot).filter(r=>r.throws===hm),'SPx',false);
      if(c.length) handClose(out_,c[0]);
      if(!c.length||c[0].SPx<ROT_SWAP_PCT*out_.SPx){ rot_log.push(`only ${rot.filter(r=>r.throws===hm).length} ${hm}HP; best candidate ${c.length?c[0].name:'-'} (${c.length?f1(c[0].SPx):'-'}) below ${trunc(ROT_SWAP_PCT*100)}% of ${out_.name} (${f1(out_.SPx)}) -> no swap`); break; }
      ROT_OUT.push(out_.id); const inn=c[0];
      rot_log.push(`Rotation balance: ${inn.name} (${hm}, SP-APEX ${f1(inn.SPx)}) replaces ${out_.name} (${out_.throws}, ${f1(out_.SPx)}); ${f1(100*inn.SPx/out_.SPx)}% of his score, >= ${trunc(ROT_SWAP_PCT*100)}%`);
      handPickClose(c,'SPx','SP (hand pick)',rot_log,'rotation handedness swap');
      rot=sortBy(rot.filter(r=>r.id!==out_.id).concat([inn]),'SPx',false);
    } }
  { const r5=sortBy(rot.filter(r=>!PIN_ROT.includes(r.name)),'SPx',true); const nx=sortBy(SPP.filter(r=>!rot.some(x=>x.id===r.id)&&!ROT_OUT.includes(r.id)),'SPx',false);
    if(r5.length&&nx.length) close('SP5',r5[0].name,r5[0].SPx,nx[0].name,nx[0].SPx,'SP-APEX, last rotation spot (W)'); }
  let RPP=notIn(PX.filter(r=>r.rp_ok),rot); let pen;
  if(PIN_PEN.length){ RPP=RPP.filter(r=>!PIN_PEN.includes(r.name)); const fx=notIn(PX.filter(r=>PIN_PEN.includes(r.name)),rot); const nf=7-fx.length;
    pen=fx.concat(nf>0?tieCut(sortBy(RPP,'RPx',false).slice(0,nf),RPP,'RPx','PEN7'):[]); }
  else pen=tieCut(sortBy(RPP,'RPx',false).slice(0,7),RPP,'RPx','PEN7');
  const deco=r=>Object.assign({},r,{lefty:r.throws==='L',ip_per_app:r.IP/r.G,long:(r.IP/r.G>=1.5)||(r.GS>=20)});
  pen=pen.map(deco); const pen_log=PIN_PEN.map(n=>`Fan override: ${n} pinned to the bullpen`);
  let _rest=notIn(RPP,pen).map(deco);
  while(pen.filter(r=>r.lefty).length<2){
    const c=sortBy(_rest.filter(r=>r.lefty),'RPx',false); if(!c.length){ pen_log.push('fewer than 2 LHP available'); break; }
    const _o=sortBy(pen.filter(r=>!r.lefty&&!PIN_PEN.includes(r.name)),'RPx',true); if(!_o.length){ pen_log.push('fewer than 2 LHP: every righty in the pen is pinned'); break; }
    const o_=_o[0], i_=c[0];
    pen_log.push(`Pen balance: ${i_.name} (L, RP-APEX ${f1(i_.RPx)}) replaces ${o_.name} (${o_.throws}, ${f1(o_.RPx)}) to reach 2 LHP`);
    handPickClose(c,'RPx','PEN (lefty pick)',pen_log,'bullpen lefty fallback');
    pen=pen.filter(r=>r.id!==o_.id).concat([i_]); _rest=_rest.filter(r=>r.id!==i_.id);
  }
  if(!pen.some(r=>r.long)){ const c=sortBy(_rest.filter(r=>r.long),'RPx',false); const nl=pen.filter(r=>r.lefty).length;
    const _o=sortBy(pen.filter(r=>(!r.lefty||nl>2)&&!PIN_PEN.includes(r.name)),'RPx',true);
    if(_o.length&&c.length){ const o_=_o[0], i_=c[0]; pen_log.push(`Pen long man: ${i_.name} (RP-APEX ${f1(i_.RPx)}) replaces ${o_.name} (${f1(o_.RPx)})`); pen=pen.filter(r=>r.id!==o_.id).concat([i_]); } }
  { const p7=sortBy(pen.filter(r=>!PIN_PEN.includes(r.name)),'RPx',true); const p8=_rest.length?sortBy(_rest,'RPx',false)[0]:null;
    if(p8&&p7.length) close('PEN7',p7[0].name,p7[0].RPx,p8.name,p8.RPx,'RP-APEX, last bullpen spot (W)'); }
  { const a=zs(pen.map(r=>r.RPx)), b=zs(pen.map(r=>r.KBB)), c=zs(pen.map(r=>r.ERAplus)); pen.forEach((r,i)=>{ r.q=0.5*a[i]+0.0*b[i]+0.5*c[i]; if(r.sv_term!==undefined&&r.sv_term!==null) r.q=0.9*r.q+0.1*r.sv_term;   /* v0.9.5: closer save-rate tiebreaker (sv_term from engine_v5.py: regressed franchise save% in 10+ SV seasons since 1969; 0 = no data) */   /* v0.9.4: closer/setup order = 0.5 RP score + 0.5 ERA+ (K/BB dropped; v0.9.3 was 0.4/0.3/0.3), same as engine_v5.py */ }); }
  const roles={}; let o=sortBy(pen,'q',false);
  /* v0.9.5.1: closer eligibility (cl_ok from engine_v5.py: 1+ franchise season with 10+ SV since 1969 or 40%+ of relief games finished); first eligible in closer order closes */
  if(o.length&&o[0].cl_ok===false&&o.some(r=>r.cl_ok===true)){ const c=o.find(r=>r.cl_ok===true); pen_log.push(`Closer record rule: ${o[0].name} (closer order #1; ${o[0].cl_seasons} seasons with 10+ saves, ${(100*o[0].gf_share).toFixed(0)}% of relief games finished) has no closer record -> ${c.name} closes (${c.cl_seasons} seasons with 10+ saves, ${(100*c.gf_share).toFixed(0)}% finished)`); o=[c].concat(o.filter(r=>r!==c)); }
  roles.CL=o[0]; roles.SU1=o[1]; roles.SU2=o[2];
  let left=pen.filter(r=>![roles.CL,roles.SU1,roles.SU2].some(x=>x.name===r.name));
  const lhs=sortBy(left.filter(r=>r.lefty),'Kpct',false); if(lhs.length){ roles.LHS=lhs[0]; left=left.filter(r=>r.name!==roles.LHS.name); } else pen_log.push('No LHS role: both bullpen lefties already hold CL/SU1/SU2 (30-team step 2; same as app/engine.js)');
  roles.LONG=sortBy(left,'ip_per_app',false)[0]; left=left.filter(r=>r.name!==roles.LONG.name);
  sortBy(left,'RPx',false).forEach((r,k)=>{ roles['MID'+(k+1)]=r; });
  // lineup
  const L=POS9.map(p=>Object.assign({},start[p],{slot_pos:p}));
  { const a=zs(L.map(x=>x.SBrate)), b=zs(L.map(x=>x.rbr600)), c=zs(L.map(x=>x.OBPplus)); L.forEach((x,i)=>{ x.bat=x.rbat600; x.speed=a[i]+b[i]; x.lead=0.7*c[i]+0.3*x.speed; }); }
  const B=sortBy(L,['bat','OBPplus'],false); const LP={}; for(const [n,k] of Object.entries(pins.lineup||{})) LP[n]=trunc(k);
  const order=new Array(9).fill(null), notes={};
  for(const [n,k] of Object.entries(LP)){ order[k-1]=n; notes[k]='Fan override (pinned by Joseph); rules reflow around him'; }
  const free=k=>order[k-1]===null; const avail=df=>df.filter(x=>!order.includes(x.name));
  const top4=new Set(B.slice(0,4).map(x=>x.name));
  if(free(3)){ order[2]=avail(B)[0].name; notes[3]='#3 = best hitter (highest BatRuns/600)'; }
  let b24=avail(B.filter(x=>top4.has(x.name)));
  if(free(4)&&b24.length){ order[3]=sortBy(b24,['ISOplus','bat'],false)[0].name; notes[4]='#4 = most power (highest era-adjusted ISO+) among top-4 bats'; }
  b24=avail(B.filter(x=>top4.has(x.name)));
  if(free(2)&&b24.length){ order[1]=sortBy(b24,['OBPplus','bat'],false)[0].name; notes[2]='#2 = best OBP+ of the remaining top-4 bats'; }
  if(free(1)){ let pp=avail(L.filter(x=>!top4.has(x.name)&&x.slot_pos!=='C'&&x.speed>=0)); if(!pp.length) pp=avail(L.filter(x=>!top4.has(x.name)&&x.slot_pos!=='C'));
    order[0]=sortBy(pp,'lead',false)[0].name; notes[1]='#1 = best 0.7 z(OBP+) + 0.3 speed; not a top-4 bat, not C, speed >= team avg'; }
  let rem=sortBy(avail(L),['bat','OBPplus'],false);
  if(free(9)){ const nine=sortBy(rem.slice(-2),'lead',false)[0]; order[8]=nine.name; notes[9]='#9 = second leadoff (better OBP/speed of the two weakest bats)'; rem=rem.filter(x=>x.name!==nine.name); }
  let first=true; const hasLP=Object.keys(LP).length>0;
  for(const x of rem){ const k=order.indexOf(null); order[k]=x.name; notes[k+1]=hasLP?'next-best bat (fills first open slot from #5 down; top-4 bats displaced by a pin land here)':(first?'#5 = next-best bat':'#6-8 = descending BatRuns/600'); first=false; }
  const Li=new Map(L.map(x=>[x.name,x])); const hand=n=>Li.get(n).bats;
  const run3=o=>{ for(let i=0;i<o.length-2;i++){ const a=[hand(o[i]),hand(o[i+1]),hand(o[i+2])]; if(a[0]===a[1]&&a[1]===a[2]&&a[2]!=='B') return i; } return null; };
  const hfix=[]; let r=run3(order);
  while(r!==null&&r>=3){ const i=r+2; let j=null;
    for(let k=Math.max(i+1,5);k<8;k++){ if(!(order[k] in LP)&&!(order[i] in LP)&&hand(order[k])!==hand(order[i])&&Math.abs(Li.get(order[k]).bat-Li.get(order[i]).bat)<=0.25*Math.abs(Li.get(order[i]).bat)){ j=k; break; } }
    if(j===null||i<5){ hfix.push(`run at ${r+1}-${r+3} not fixable within rules`); break; }
    hfix.push(`swap ${order[i]} <-> ${order[j]}`); [order[i],order[j]]=[order[j],order[i]]; r=run3(order); }
  const lineup=order.map((n,i)=>{ const x=Li.get(n); return {slot:i+1,name:n,pos:x.slot_pos,bats:x.bats,OBP:x.OBP,SLG:x.SLG,OBPplus:trunc(x.OBPplus),ISO:x.ISO,ISOplus:trunc(x.ISOplus),bat600:x.rbat600,SB:trunc(x.SB),note:notes[i+1]}; });
  const r3=x=>npRound(x,3);
  const out={start:Object.fromEntries(POS9.map(p=>[p,start[p].name])),bench:Object.fromEntries(Object.entries(bench).map(([k,v])=>[k,v.name])),
    rotation:Object.fromEntries(rot.map((x,i)=>['SP'+(i+1),x.name])),pen:Object.fromEntries(Object.entries(roles).map(([k,v])=>[k,v.name])),lineup,log,hfix,dh_table,
    pen_q:pen.map(x=>({name:x.name,throws:x.throws,RPx:r3(x.RPx),total:r3(x.total),KBB:r3(x.KBB),ERAplus:r3(x.ERAplus),SV:r3(x.SV),q:r3(x.q),ip_per_app:r3(x.ip_per_app),...(x.sv_term!==undefined&&x.sv_term!==null?{sv_term:r3(x.sv_term),sv_SV:r3(x.sv_SV),sv_BS:r3(x.sv_BS)}:{})})),
    rot_scores:rot.map(x=>({name:x.name,SPx:r1(x.SPx),total:r1(x.total)}))};
  const staff=new Set(rot.map(x=>x.id).concat(pen.map(x=>x.id)));
  out.pit_omit=sortBy(PX.filter(x=>!staff.has(x.id)),'total',false).slice(0,8).map(x=>({name:x.name,combined:npRound(x.total,1),p_rank:trunc(x.p_rank),SPx:npRound(x.SPx,1),RPx:npRound(x.RPx,1),sp_ok:!!x.sp_ok,rp_ok:!!x.rp_ok,G:trunc(x.G),GS:trunc(x.GS)}));
  Object.assign(out,{pit_tie_log,tie_log,close_calls,guard_log,dh_rule_log:dhrule_log,dh_swap:dhswap,team_runs:TEAM_RUNS,rot_log,pen_log,pins,
    util_failed:failed.map(x=>({name:x.name,total:pyRound(x.total,1),ss_rf150:pyRound(x.ss_rf150,1)}))});
  out._objs={start,bench,rot,pen,roles};  // full rows for the UI (not part of the Python output)
  return out;
}
// ---------- Big Moments option (app v1.1, not default) ----------
// Same arithmetic as engine_v5.py with ENGINE_BM=1: hitters  col + (d_oct + d_cl)  on Total, Off, Hit, DH-Prod, DH-Prod+BR and every v_*;
// pitchers  total + (d_oct + d_cl),  SPx + (d_oct_SPx + d_cl_SPx),  RPx + (d_oct_RPx + d_cl_RPx);  ranks = pandas rank(ascending=False, method='first').
const BM_HCOLS=['total','offAPEX','batAPEX','dhAPEX','dhbrAPEX','v_C','v_1B','v_2B','v_3B','v_SS','v_LF','v_CF','v_RF','v_DH'];
function rankFirst(rows,key,out){ rows.map((r,i)=>[r[key],i]).sort((a,b)=>a[0]!==b[0]?b[0]-a[0]:a[1]-b[1]).forEach(([v,i],k)=>{ rows[i][out]=k+1; }); }
function withBM(team){
  if(team._bmT) return team._bmT;
  const B=team.bm||{h:{},p:{}};
  const hitters=team.hitters.map(h=>{ const b=B.h[h.id]; const d=b?(b.d_oct+b.d_cl):0; const o=Object.assign({},h); for(const k of BM_HCOLS) if(o[k]!==null&&o[k]!==undefined) o[k]=o[k]+d; return o; });
  const pitchers=team.pitchers.map(p=>{ const b=B.p[p.id]; const o=Object.assign({},p); if(b){ o.total=o.total+(b.d_oct+b.d_cl); o.SPx=o.SPx+(b.d_oct_SPx+b.d_cl_SPx); o.RPx=o.RPx+(b.d_oct_RPx+b.d_cl_RPx); } return o; });
  rankFirst(hitters,'total','total_rank'); rankFirst(pitchers,'total','p_rank');
  const t=Object.assign({},team,{hitters,pitchers,py:team.py_bm,bmOn:true,base:team}); delete t._S; delete t._P; delete t._bmT;
  Object.defineProperty(team,'_bmT',{value:t,enumerable:false,writable:true}); return t;
}
const API={build,fmt,POS,POS9,POSADJ,withBM};
if(typeof module!=='undefined'&&module.exports) module.exports=API; else root.LLEngine=API;
})(typeof window!=='undefined'?window:globalThis);
