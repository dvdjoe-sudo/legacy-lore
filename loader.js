/* Legacy Lore app data loader (app v1.3.1). The data ships as gzip + base64 blobs written by tools/pack_data.py from data/app_data.json:
   one index blob (rules, team list, the exported Python engine outputs py / py_bm) and one blob per team (score tables, seasons, Big Moments bonuses).
   Single-file build: every blob is inline (no network). Multi-file build (GitHub Pages): data/teams/<key>.js is added as a <script> when a team is opened.
   gunzip: the browser's DecompressionStream when it has one, else fflate (vendor/fflate.min.js). Teams are decoded only when needed. */
(function(root){
'use strict';
const P=root.LL_PACK; if(!P) throw new Error('LL_PACK missing (data/ll_index.js)');
const STATS={index_ms:0,teams:{},native:typeof DecompressionStream==='function',fallback_used:0};
const now=()=>(root.performance&&performance.now)?performance.now():Date.now();
function bytes(b64){ const s=atob(b64), n=s.length, u=new Uint8Array(n); for(let i=0;i<n;i++) u[i]=s.charCodeAt(i); return u; }
const utf8=new TextDecoder('utf-8');
function gunzipSync(u){ if(!root.fflate) throw new Error('no gunzip available'); STATS.fallback_used++; return utf8.decode(root.fflate.gunzipSync(u)); }
function gunzip(u){
  if(STATS.native){ try{ const s=new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip')); return new Response(s).text().catch(()=>gunzipSync(u)); }catch(e){ /* fall through */ } }
  return new Promise((res,rej)=>{ try{ res(gunzipSync(u)); }catch(e){ rej(e); } }); }
// generic column-major decoding (inverse of pack_data.enc): {$c, $m[, $k]} -> list / dict of objects with the original key order
function dec(o){
  if(Array.isArray(o)) return o.map(dec);
  if(o===null||typeof o!=='object') return o;
  if(o.$S) return decSeasons(o);
  if(o.$m){ const c=o.$c, m=o.$m.map(col=>col.map(dec)), n=m.length?m[0].length:0, rows=new Array(n);
    for(let i=0;i<n;i++){ const r={}; for(let j=0;j<c.length;j++) r[c[j]]=m[j][i]; rows[i]=r; }
    if(o.$k){ const d={}; o.$k.forEach((k,i)=>{ d[k]=rows[i]; }); return d; } return rows; }
  const d={}; for(const k in o) d[k]=dec(o[k]); return d; }
function decSeasons(o){ const S=o.$S, sc=S.c, d={}; let p=0;
  o.$k.forEach((id,i)=>{ const r={}; const se=new Array(S.n[i]);
    for(let a=0;a<S.n[i];a++,p++){ const x={}; for(let j=0;j<sc.length;j++) x[sc[j]]=S.m[j][p]; se[a]=x; }
    for(const k of o.$o){ if(k==='seasons') r.seasons=se; else r[k]=dec(o.$m[o.$c.indexOf(k)][i]); }
    d[id]=r; });
  return d; }
function unpackTeam(json){ const T=JSON.parse(json); const X={}; for(const k of ['pitchers','hfloat','bm']) X[k]=dec(T[k]);
  const H=dec(T.hitters), cols=T.hcols, der=T.derived;
  X.hitters=H.map(h=>{ const g=k=>{ const d=der[k]; if(!d) return h[k]; if(d[0]==='=') return g(d[1]); const y=g(d[2]); return y===null?null:g(d[1])+y; };   // v_<pos> = offAPEX + def_<pos>: same IEEE addition as Python, checked bit for bit by pack_data.py
    const r={}; for(const k of cols) r[k]=g(k); return r; });
  X.hseasons=dec(T.hseasons); X.pseasons=dec(T.pseasons); return X; }
// ---- index (synchronous: small) ----
const t0=now(); const D=JSON.parse(gunzipSync(bytes(P.index))); STATS.fallback_used=0; STATS.index_ms=Math.round(now()-t0);
const HEAVY=['hitters','pitchers','hfloat','hseasons','pseasons','bm'];
const byKey=new Map(D.teams.map(t=>[t.key,t])); const LOADED=new Set(), PENDING=new Map(), WAIT=new Map();
function attach(key,json,ms0){ const t=byKey.get(key); Object.assign(t,unpackTeam(json)); LOADED.add(key); STATS.teams[key]=Math.round(now()-ms0); return t; }
function blobFor(key){ return P.teams&&P.teams[key]; }
function fetchScript(key){ return new Promise((res,rej)=>{ if(blobFor(key)) return res(blobFor(key)); WAIT.set(key,res);
  const s=document.createElement('script'); s.src='data/teams/'+key+'.js'; s.onerror=()=>{ WAIT.delete(key); rej(new Error('could not load data/teams/'+key+'.js')); }; document.head.appendChild(s); }); }
const API={
  data:D, stats:STATS,
  loaded:key=>LOADED.has(key),
  put(key,b64){ P.teams=P.teams||{}; P.teams[key]=b64; const w=WAIT.get(key); if(w){ WAIT.delete(key); w(b64); } },   // called by data/teams/<key>.js
  ensure(key){ if(LOADED.has(key)) return Promise.resolve(byKey.get(key)); if(PENDING.has(key)) return PENDING.get(key);
    const ms0=now(); const pr=fetchScript(key).then(b=>gunzip(bytes(b))).then(j=>attach(key,j,ms0)).finally(()=>PENDING.delete(key)); PENDING.set(key,pr); return pr; },
  loadSync(key){ if(LOADED.has(key)) return byKey.get(key); const b=blobFor(key); if(!b) return null; const ms0=now(); return attach(key,gunzipSync(bytes(b)),ms0); },
  evict(key){ const t=byKey.get(key); if(!t||!LOADED.has(key)) return; for(const k of HEAVY) delete t[k]; delete t._S; delete t._P; if(t._bmT) t._bmT=undefined; LOADED.delete(key); },
};
root.LLData=API; root.LL_DATA=D;
})(typeof window!=='undefined'?window:globalThis);
