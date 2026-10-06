/* Legacy Lore app v1.9 Compare mode: the app's default 26 vs the user's own build (pins / swaps, city split, Big Moments, rule switches).
   Pure functions, no DOM (app.js renders; tests/compare_test.js runs it in Node).
   App default = engine build of the FULL franchise with NO pins and Big Moments OFF = exactly the exported Python output (t.py).
   Score gaps use those same default engine scores (value at the slot: v_<pos> for the nine, DH-Prod for DH/BAT, Total for C2/UTIL-IF/OF4/FLEX,
   Starter score for SP, Reliever score for the pen), so a gap measures the player swap, not a Big Moments or city re-score.
   Nothing here reads Story Bible / lore data: the builder and this comparison only ever see engine output + the user's own pins. */
(function(root){
'use strict';
const SECS=[['start','Starting nine'],['bench','Bench'],['rotation','Rotation'],['pen','Bullpen']];
function slotScore(row,sec,slot){ if(!row) return null; let v;
  if(sec==='start') v=row['v_'+slot]; else if(sec==='bench') v=slot==='BAT'?row.dhAPEX:row.total; else if(sec==='rotation') v=row.SPx; else v=row.RPx;
  return (v===undefined||v===null||Number.isNaN(v))?null:v; }
function where(o,n){ if(!n) return null; for(const [sec] of SECS) for(const [s,x] of Object.entries(o[sec]||{})) if(x===n) return s; return null; }
function names26(o){ const s=new Set(); for(const [sec] of SECS) for(const x of Object.values(o[sec]||{})) if(x) s.add(x); return s; }
function pinnedSet(p){ p=p||{}; return new Set([...Object.keys(p.roster||{}),...Object.keys(p.staff||{})]); }
// t0: the full-franchise team with pure engine score rows (_S/_P filled by LLEngine.build); base: build(t0,{}); mine: the user's build; pins: user's pins
function compare(t0,base,mine,pins){
  const H=new Map((t0._S||t0.hitters).map(h=>[h.name,h])), P=new Map((t0._P||t0.pitchers).map(p=>[p.name,p])), pin=pinnedSet(pins);
  const rows=[], diffs=[];
  for(const [sec,label] of SECS){
    const slots=Object.keys(base[sec]||{}); for(const s of Object.keys(mine[sec]||{})) if(!slots.includes(s)) slots.push(s);
    const R=(sec==='rotation'||sec==='pen')?P:H;
    for(const s of slots){ const a=(base[sec]||{})[s]||null, b=(mine[sec]||{})[s]||null;
      const r={sec,label,slot:s,app:a,mine:b,av:slotScore(R.get(a),sec,s),bv:slotScore(R.get(b),sec,s),diff:a!==b,pinned:!!b&&pin.has(b)};
      if(r.diff){
        r.gap=(r.av!==null&&r.bv!==null)?r.bv-r.av:null;
        r.pct=(r.av!==null&&r.bv!==null&&r.av>0)?100*r.bv/r.av:null;
        const cc=(base.close_calls||[]).find(c=>c.pick===a&&c.alt===b);   // the engine flagged this exact pair as a Close Call
        r.cc=cc?cc.pct:null;
        r.appNow=a?where(mine,a):null;   // where the app's pick ended up in your build (null = off your 26)
        r.mineWas=b?where(base,b):null;  // where your pick sat on the app's 26 (null = not on it)
        diffs.push(r); }
      rows.push(r); } }
  const A=names26(base), M=names26(mine);
  const nine=o=>{ let s=0; for(const [p,n] of Object.entries(o.start||{})){ const v=slotScore(H.get(n),'start',p); if(v!==null) s+=v; } return s; };
  return {rows,diffs,n:diffs.length,slots:rows.length,
    added:[...M].filter(n=>!A.has(n)), dropped:[...A].filter(n=>!M.has(n)),
    nine_app:nine(base), nine_mine:nine(mine)}; }
const API={SECS,slotScore,compare,where};
if(typeof module!=='undefined'&&module.exports) module.exports=API; else root.LLCompare=API;
})(typeof window!=='undefined'?window:globalThis);
