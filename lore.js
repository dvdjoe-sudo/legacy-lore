/* Legacy Lore — History / Almanac / Lore tabs (app v1.8). Separate spots next to the roster build, cross-linked with the player cards.
   Data: data/lore/<key>.js (one gzip+base64 blob per team, written by tools/pack_lore.py) + data/lore/_history.js (league five-year reader, facts only).
   Loaded only when a lore tab or a player card needs it (multi-file: <script> tag; single-file build: window.LL_LORE_INLINE).
   Rights: no This Great Game / Baseball Almanac prose is shipped. Story threads show metadata (year, kind, tags, players) + a link to the source.
   Text shown = Lahman facts (CC BY-SA 3.0), Baseball Data Hub facts, our lore packs / Story Bibles, and Legacy Lore blurbs. */
(function(root){
'use strict';
// ---------------- loader ----------------
const BLOBS={teams:{},index:null}, DATA={}, PEND={}, WAIT={};
let INDEX=null, INDEXP=null;
const utf8=new TextDecoder('utf-8');
function bytes(b64){ const s=atob(b64), n=s.length, u=new Uint8Array(n); for(let i=0;i<n;i++) u[i]=s.charCodeAt(i); return u; }
function gunzip(u){
  if(typeof DecompressionStream==='function'){ try{ const s=new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip')); return new Response(s).text().catch(()=>utf8.decode(root.fflate.gunzipSync(u))); }catch(e){} }
  return new Promise((res,rej)=>{ try{ res(utf8.decode(root.fflate.gunzipSync(u))); }catch(e){ rej(e); } }); }
const INL=root.LL_LORE_INLINE||null;
function script(src,key){ return new Promise((res,rej)=>{ WAIT[key]=res; const s=document.createElement('script'); s.src=src; s.onerror=()=>{ delete WAIT[key]; rej(new Error('could not load '+src)); }; document.head.appendChild(s); }); }
const Lore={
  put(key,b64){ BLOBS.teams[key]=b64; const w=WAIT[key]; if(w){ delete WAIT[key]; w(b64); } },
  putIndex(b64){ BLOBS.index=b64; const w=WAIT['_history']; if(w){ delete WAIT['_history']; w(b64); } },
  loaded:key=>!!DATA[key],
  get:key=>DATA[key]||null,
  ensure(key){ if(DATA[key]) return Promise.resolve(DATA[key]); if(PEND[key]) return PEND[key];
    const b=(INL&&INL.teams&&INL.teams[key])||BLOBS.teams[key];
    const src=b?Promise.resolve(b):(INL?Promise.reject(new Error('offline build without lore data')):script('data/lore/'+key+'.js',key));
    return PEND[key]=src.then(x=>gunzip(bytes(x))).then(j=>{ DATA[key]=prep(JSON.parse(j)); return DATA[key]; }).finally(()=>{ delete PEND[key]; }); },
  ensureIndex(){ if(INDEX) return Promise.resolve(INDEX); if(INDEXP) return INDEXP;
    const b=(INL&&INL.index)||BLOBS.index;
    const src=b?Promise.resolve(b):(INL?Promise.reject(new Error('offline build without lore data')):script('data/lore/_history.js','_history'));
    return INDEXP=src.then(x=>gunzip(bytes(x))).then(j=>{ INDEX=JSON.parse(j); return INDEX; }).finally(()=>{ INDEXP=null; }); },
  hasInline:()=>!!INL,
};
function prep(d){ d.byYear={}; for(const s of d.seasons) d.byYear[s.y]=s;
  d.beatsByYear={}; for(const id of d.tb){ const b=d.beats[id]; (d.beatsByYear[b.y]=d.beatsByYear[b.y]||[]).push(id); }
  d.awByYear={}; for(const a of d.awards){ (d.awByYear[a[0]]=d.awByYear[a[0]]||[]).push(a); }
  d.ldByYear={}; for(const l of d.leaders){ (d.ldByYear[l[0]]=d.ldByYear[l[0]]||[]).push(l); }
  return d; }
root.LLLore=Lore;

// ---------------- UI helpers ----------------
let H=null;   // host hooks from app.js: {render, esc, cur, kindOf(id)->'h'|'p'|null, nameOk}
const esc=s=>H.esc(s);
const TYPE={H:'Season headline',E:'Season essay',I:'It happened',B:'By the way',S:'Sidebar',L:'League story',F:'Fast fact',V:'Dated event',R:'Rule change','?':'Story'};
const TAG={first:'A first',ballpark:'Ballpark',record:'Record',scandal:'Scandal',labor:'Labor',world_series:'World Series',rule:'Rules',death:'In memoriam',no_hitter:'No-hitter',trade:'Trade',integration:'Integration',milestone:'Milestone',triple_crown:'Triple Crown'};
const HON={WS:['World Series champions','ws'],PEN:['Pennant','pen'],DIV:['Division title','div'],WC:['Wild card','wc']};
function srcUrl(b){ const u=b.u; if(u==='T') return [`https://thisgreatgame.com/${b.y}-baseball-history/`,'This Great Game'];
  if(/^A[a-z]$/.test(u)) return [`https://www.baseball-almanac.com/yearly/yr${b.y}${u[1]}.shtml`,'Baseball Almanac']; return [u,'Source']; }
const pct=(w,l)=>w+l?(w/(w+l)).toFixed(3).replace(/^0/,''):'–';
const ord=n=>{ const s=['th','st','nd','rd'], v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); };
function finish(s){ if(!s.rk) return ''; return `${ord(s.rk)} ${s.lg}${s.dv?' '+({E:'East',C:'Central',W:'West'}[s.dv]||s.dv):''}`; }
function chip(d,id,label){ const k=H.kindOf(id); const n=label||d.names[id]||id;
  return k?`<a href="javascript:void 0" class="lchip on" data-card="${k}" data-n="${esc(H.nameOf(id)||n)}">${esc(n)}</a>`:`<span class="lchip">${esc(n)}</span>`; }
// link full names of players in the current pool inside our own prose (Story Bible, blurbs)
let LINKRE=null, LINKKEY='';
function linkify(text){ const c=H.cur(); if(!c) return esc(text); const key=c.t.key+'|'+(c.city?c.city.key:'');
  if(LINKKEY!==key){ const ns=[...c.t.hitters,...c.t.pitchers].map(x=>x.name).filter(n=>n.includes(' ')&&n.length>6);
    LINKRE=ns.length?new RegExp('('+[...new Set(ns)].sort((a,b)=>b.length-a.length).map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','g'):null; LINKKEY=key; }
  const s=String(text==null?'':text); if(!LINKRE) return esc(s);
  let out='', last=0; s.replace(LINKRE,(m,_,i)=>{ out+=esc(s.slice(last,i)); const k=H.kindByName(m); out+=k?`<a href="javascript:void 0" class="name" data-card="${k}" data-n="${esc(m)}">${esc(m)}</a>`:esc(m); last=i+m.length; return m; });
  return out+esc(s.slice(last)); }
function cityRange(){ const c=H.cur(); return c&&c.city?[c.city.years[0],c.city.years[1]]:null; }
function seasonsIn(d){ const r=cityRange(); return r?d.seasons.filter(s=>s.y>=r[0]&&s.y<=r[1]):d.seasons; }
function chaptersIn(d){ const ss=seasonsIn(d); if(!ss.length) return []; const y0=ss[0].y, y1=ss[ss.length-1].y; return d.chapters.filter(c=>c.y1>=y0&&c.y0<=y1); }
function chapterOf(d,y){ return d.chapters.find(c=>y>=c.y0&&y<=c.y1); }
function cityNote(){ const c=H.cur(); return c&&c.city?`<div class="banner">City view: <b>${esc(c.city.city)} ${c.city.years[0]}–${c.city.years[1]}</b>. History and Almanac show these seasons only; switch the city on the Clubhouse tab for the full franchise.</div>`:''; }
function loading(key,what){ Lore.ensure(key).then(()=>H.rerender(),e=>{ const el=document.getElementById('lorebox'); if(el) el.innerHTML=`<div class="banner">${esc(what)} is not available here: ${esc(e.message)}. Open the online app for History, Almanac and Lore.</div>`; });
  return `<div id="lorebox"><p class="loading">Loading ${esc(what)}…</p></div>`; }
function beatRow(d,id,opts){ const b=d.beats[id]; if(!b) return ''; const [u,sn]=srcUrl(b); const tg=(b.tg||[]).map(t=>TAG[t]||t);
  const ps=(b.p||[]).slice(0,8).map(p=>chip(d,p)).join(' ');
  return `<li class="beat${b.f?' feat':''}"><div class="bh">${opts&&opts.year?`<b>${b.y}</b> · `:''}<span class="bk">${esc(TYPE[b.k]||'Story')}</span>${b.d?` · ${esc(b.d)}`:''}${b.lg&&b.lg!=='ML'?` · ${esc(b.lg)}`:''}${tg.length?` · ${tg.map(t=>`<span class="ltag">${esc(t)}</span>`).join(' ')}`:''}</div>${ps?`<div class="bp">${ps}</div>`:''}<div class="bsrc"><a href="${esc(u)}" target="_blank" rel="noopener">Read at ${esc(sn)} ↗</a>${opts&&opts.ch?` · <a href="#/${esc(opts.key)}/history/${esc(opts.ch)}">Open ${esc(opts.chTitle)}</a>`:''}</div></li>`; }
function honorTags(s){ return (s.hon||[]).map(h=>`<span class="tag hon ${HON[h][1]}">${esc(HON[h][0])}</span>`).join(''); }
function postLine(s){ if(!s.post) return ''; return s.post.map(p=>`${esc(p[0])}: ${p[1]?'beat':'lost to'} ${p[3]?`<a href="#/${p[3]}/history">${esc(p[2])}</a>`:esc(p[2])} ${p[4]}–${p[5]}`).join(' · '); }

// ---------------- History tab ----------------
function vHistory(key,chId){ const d=Lore.get(key); if(!d) return loading(key,'History');
  const c=H.cur(), t=c.t; const chs=chaptersIn(d); if(!chs.length) return `<div class="lorebox"><p class="muted">No seasons in this view.</p></div>`;
  const ch=chId?chs.find(x=>x.id===chId):null;
  if(!ch){ // chapter list
    const cards=chs.map(x=>{ const ss=seasonsIn(d).filter(s=>s.y>=x.y0&&s.y<=x.y1); const w=ss.reduce((a,s)=>a+(s.W||0),0), l=ss.reduce((a,s)=>a+(s.L||0),0);
      const hon=ss.flatMap(s=>(s.hon||[]).map(h=>[h,s.y])); const nb=ss.reduce((a,s)=>a+((d.beatsByYear[s.y]||[]).length),0); const nbl=ss.filter(s=>d.blurbs&&d.blurbs.seasons[s.y]).length;
      const names=[...new Set(ss.map(s=>s.nm))];
      return `<a class="chcard" href="#/${key}/history/${x.id}"><div class="cht">${esc(x.y0)}–${esc(x.y1)}</div><div class="small">${esc(names.join(' / '))}</div><div class="small"><b>${w}–${l}</b> (${pct(w,l)}) · ${ss.length} season${ss.length===1?'':'s'}</div><div>${hon.filter(h=>h[0]==='WS'||h[0]==='PEN').map(h=>`<span class="tag hon ${HON[h[0]][1]}">${h[1]} ${h[0]==='WS'?'champs':'pennant'}</span>`).join('')}</div><div class="small muted">${nb} story thread${nb===1?'':'s'}${nbl?` · ${nbl} Legacy Lore note${nbl===1?'':'s'}`:''}</div></a>`; }).join('');
    return `${cityNote()}<p class="small muted">Five years at a time, the same chapters as the league History reader. Tap a chapter for season-by-season facts, story threads with source links, and every player in this pool who shows up in them (tap a name for his card).</p><div class="chgrid">${cards}</div>`; }
  const i=chs.indexOf(ch), prev=chs[i-1], next=chs[i+1];
  const eras=(d.lore&&d.lore.history||[]).filter(e=>{ const m=String(e.era).match(/\d{4}/); return m&&+m[0]>=ch.y0&&+m[0]<=ch.y1; });   // era essay opens the chapter it starts in
  const ss=seasonsIn(d).filter(s=>s.y>=ch.y0&&s.y<=ch.y1);
  const rows=ss.map(s=>{ const bl=d.blurbs&&d.blurbs.seasons[s.y]; const aw=(d.awByYear[s.y]||[]).filter(a=>!/Gold Glove|Silver Slugger|Platinum/.test(a[1]));
    const ld=d.ldByYear[s.y]||[]; const beats=d.beatsByYear[s.y]||[]; const feat=beats.filter(id=>d.beats[id].f), rest=beats.filter(id=>!d.beats[id].f);
    return `<div class="season" id="y${s.y}"><div class="sh"><span class="sy">${s.y}</span> <b>${esc(s.nm)}</b> ${honorTags(s)}</div>
      <div class="small"><b>${s.W}–${s.L}</b> (${pct(s.W,s.L)}) · ${esc(finish(s))} · ${s.mg.map(m=>esc(m[0])).join(', ')}${s.pk?` · <span class="muted">${esc(s.pk)}</span>`:''}</div>
      ${s.post?`<div class="small">${postLine(s)}</div>`:''}
      ${bl?`<div class="llnote"><span class="llk">Legacy Lore</span> ${linkify(bl)}</div>`:''}
      ${aw.length?`<div class="small">${aw.map(a=>`<span class="pill">${esc(a[1])}${a[2]&&a[2]!=='ML'?' ('+esc(a[2])+')':''}: ${chip(d,a[3])}</span>`).join(' ')}</div>`:''}
      ${ld.length?`<div class="small muted">Led the league: ${[...new Set(ld.map(l=>l[4]))].map(pid=>`${chip(d,pid)} ${ld.filter(l=>l[4]===pid).map(l=>`${esc(l[2])} ${esc(l[3])}`).join(', ')}`).join(' · ')}</div>`:''}
      ${beats.length?`<details${feat.length&&ss.length<=5?' open':''}><summary class="small">${beats.length} story thread${beats.length===1?'':'s'}${feat.length?` (${feat.length} featured)`:''}</summary><ul class="beats">${feat.concat(rest).map(id=>beatRow(d,id)).join('')}</ul></details>`:''}
    </div>`; }).join('');
  return `${cityNote()}<div class="chnav"><a class="btn" href="#/${key}/history">All chapters</a>${prev?`<a class="btn" href="#/${key}/history/${prev.id}">‹ ${prev.y0}–${prev.y1}</a>`:''}${next?`<a class="btn" href="#/${key}/history/${next.id}">${next.y0}–${next.y1} ›</a>`:''}<a class="btn" href="#/history/${ch.id}">League view</a></div>
    <h2 style="margin-top:6px">${esc(t.short)}, ${ch.y0}–${ch.y1}</h2>
    ${eras.map(e=>`<div class="era"><div class="small muted">${esc(e.era)}</div><b>${esc(e.title)}</b><p>${linkify(e.body)}</p></div>`).join('')}
    ${rows}
    <p class="small muted">Season facts: Lahman Database (CC BY-SA 3.0). League leaders: Baseball Almanac leader tables. Story threads are matched to this franchise by team name that season; open the source for the full story. Legacy Lore notes are ours.</p>`; }

// ---------------- Almanac tab ----------------
function vAlmanac(key){ const d=Lore.get(key); if(!d) return loading(key,'Almanac');
  const ss=seasonsIn(d); const r=cityRange(); const inR=y=>!r||(y>=r[0]&&y<=r[1]);
  const W=ss.reduce((a,s)=>a+(s.W||0),0), L=ss.reduce((a,s)=>a+(s.L||0),0);
  const hy=k=>ss.filter(s=>(s.hon||[]).includes(k)).map(s=>s.y); const post=ss.filter(s=>s.post).map(s=>s.y);
  const best=ss.filter(s=>s.W+s.L>=100).slice().sort((a,b)=>b.W/(b.W+b.L)-a.W/(a.W+a.L)); 
  const kv=`<div class="kv"><div><span>Seasons</span><b>${ss.length}</b><span>${ss.length?ss[0].y+'–'+ss[ss.length-1].y:''}</span></div><div><span>All-time record</span><b>${W}–${L}</b><span>${pct(W,L)}</span></div><div><span>World Series titles</span><b>${hy('WS').length}</b></div><div><span>Pennants</span><b>${hy('PEN').length}</b></div><div><span>Division titles</span><b>${hy('DIV').length}</b></div><div><span>Wild cards</span><b>${hy('WC').length}</b></div><div><span>Postseason trips</span><b>${post.length}</b></div>${best.length?`<div><span>Best season</span><b>${best[0].y}</b><span>${best[0].W}–${best[0].L}</span></div><div><span>Worst season</span><b>${best[best.length-1].y}</b><span>${best[best.length-1].W}–${best[best.length-1].L}</span></div>`:''}</div>`;
  const yl=(ys,cls)=>ys.length?ys.map(y=>{ const ch=chapterOf(d,y); return `<a class="tag hon ${cls}" href="#/${key}/history/${ch?ch.id:''}">${y}</a>`; }).join(' '):'<span class="muted small">none</span>';
  const honors=`<div class="card"><h3>Honors</h3><p><b>World Series</b><br>${yl(hy('WS'),'ws')}</p><p><b>Pennants</b><br>${yl(hy('PEN'),'pen')}</p><p><b>Division titles</b><br>${yl(hy('DIV'),'div')}</p><p><b>Wild cards</b><br>${yl(hy('WC'),'wc')}</p><p class="small muted">Tap a year for its History chapter.</p></div>`;
  // awards
  const aw=d.awards.filter(a=>inR(a[0])); const MAJOR=['MVP','Cy Young','Rookie of the Year','WS MVP','ALCS MVP','NLCS MVP','Triple Crown','Pitching Triple Crown','Reliever of the Year','Rolaids Relief Man Award','Hank Aaron Award','Comeback Player of the Year','All-Star Game MVP','Roberto Clemente Award','Babe Ruth Award','Lou Gehrig Memorial Award','Outstanding DH'];
  const group=MAJOR.map(n=>[n,aw.filter(a=>a[1]===n)]).filter(x=>x[1].length);
  const gg=aw.filter(a=>/Gold Glove|Platinum Glove|Silver Slugger/.test(a[1]));
  const cnt={}; for(const a of gg){ const k=a[3]+'|'+a[1]; cnt[k]=(cnt[k]||0)+1; }
  const ggList=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).map(([k,n])=>{ const [id,award]=k.split('|'); return `<span class="pill">${chip(d,id)} ${esc(award)} ×${n}</span>`; }).join(' ');
  const awards=`<div class="card"><h3>Awards</h3>${group.length?group.map(([n,L])=>`<p><b>${esc(n)}</b> (${L.length})<br>${L.map(a=>`<span class="pill">${a[0]} ${chip(d,a[3])}</span>`).join(' ')}</p>`).join(''):'<p class="muted small">No major awards in this view.</p>'}${gg.length?`<details><summary class="small">Gold Gloves &amp; Silver Sluggers (${gg.length})</summary><p>${ggList}</p></details>`:''}<p class="small muted">Lahman AwardsPlayers; a player traded mid-season counts for the club he played most games for (WS / LCS MVP: the series winner).</p></div>`;
  // HOF
  const hofP=d.hof.filter(h=>h[2]==='P'), hofM=d.hof.filter(h=>h[2]==='M');
  const hof=`<div class="card"><h3>Hall of Fame</h3>${hofP.length?`<p><b>Players</b> (franchise games, share of career)<br>${hofP.map(h=>`<span class="pill${h[4]>=0.5?' prim':''}">${chip(d,h[0])} ${h[1]} · ${h[3]} G · ${Math.round(h[4]*100)}%</span>`).join(' ')}</p>`:''}${hofM.length?`<p><b>Managers</b><br>${hofM.map(h=>`<span class="pill">${esc(d.names[h[0]]||h[0])} ${h[1]} · ${h[3]} G</span>`).join(' ')}</p>`:''}<p class="small muted">Inducted players with 100+ games or 25%+ of their career here (bold = half or more); managers with 300+ games. Lahman HallOfFame + Appearances. Full franchise.</p></div>`;
  // leaders
  const ld=d.leaders.filter(l=>inR(l[0])); const byStat={}; for(const l of ld) (byStat[l[2]]=byStat[l[2]]||[]).push(l);
  const order=['Batting Average','Home Runs','RBI','Hits','Runs','Stolen Bases','On Base Percentage','Slugging Average','Total Bases','Doubles','Triples','Base on Balls','Wins','ERA','Strikeouts','Saves','Shutouts','Complete Games','Winning Percentage','Games'];
  const stats=Object.keys(byStat).sort((a,b)=>((order.indexOf(a)+1)||99)-((order.indexOf(b)+1)||99));
  const leaders=`<div class="card"><h3>League leaders</h3>${stats.length?stats.map(s=>`<details><summary><b>${esc(s)}</b> <span class="muted small">${byStat[s].length}</span></summary><p class="small">${byStat[s].map(l=>`<span class="pill">${l[0]} ${esc(l[1])} ${chip(d,l[4])} ${esc(l[3])}</span>`).join(' ')}</p></details>`).join(''):'<p class="muted small">None found for players in this pool.</p>'}<p class="small muted">Baseball Almanac league-leader tables (facts), players in this franchise pool only.</p></div>`;
  // pack extras
  const lp=d.lore; let extra='';
  if(lp){ if(lp.records&&lp.records.length) extra+=`<div class="card"><h3>Franchise records</h3><ul class="small">${lp.records.map(x=>`<li>${x.year?`<b>${esc(x.year)}</b> `:''}${linkify(x.note||x.kind)}${x.player?` · ${linkify(x.player)}`:''}${x.value!=null?` · ${esc(x.value)}`:''}</li>`).join('')}</ul></div>`;
    if(lp.no_hitters&&lp.no_hitters.length) extra+=`<div class="card"><h3>No-hitters (${lp.no_hitters.length})</h3><ul class="small">${lp.no_hitters.map(x=>`<li>${esc(x.date)} · ${linkify(x.pitcher)} vs ${esc(x.opponent)} ${esc(x.score||'')}${x.perfect?' <span class="tag hon ws">Perfect game</span>':''}</li>`).join('')}</ul></div>`;
    if(lp.retired&&lp.retired.length) extra+=`<div class="card"><h3>Retired numbers</h3><p>${lp.retired.map(x=>`<span class="pill"><b>${esc(x.number)}</b> ${linkify(x.name)}</span>`).join(' ')}</p></div>`; }
  // season table by decade
  const dec={}; for(const s of ss){ const k=Math.floor(s.y/10)*10; (dec[k]=dec[k]||[]).push(s); }
  const seasons=`<div class="card"><h3>Season by season</h3>${Object.keys(dec).sort((a,b)=>b-a).map(k=>{ const L=dec[k]; const w=L.reduce((a,s)=>a+s.W,0), l=L.reduce((a,s)=>a+s.L,0);
     return `<details><summary><b>${k}s</b> <span class="small muted">${w}–${l} (${pct(w,l)})</span> ${L.filter(s=>s.hon).map(s=>honorTags({hon:s.hon.slice(0,1)}).replace('</span>',' '+s.y+'</span>')).join('')}</summary><div class="scroll" style="max-height:none"><table><thead><tr><th>Year</th><th class="n">W–L</th><th class="n hide-s">Pct</th><th>Finish</th><th class="hide-s">Manager</th><th>October</th></tr></thead><tbody>${L.slice().reverse().map(s=>`<tr><td><a href="#/${key}/history/${(chapterOf(d,s.y)||{}).id||''}">${s.y}</a></td><td class="n">${s.W}–${s.L}</td><td class="n hide-s">${pct(s.W,s.L)}</td><td>${esc(finish(s))}</td><td class="hide-s small">${s.mg.map(m=>esc(m[0])).join(', ')}</td><td class="small">${honorTags(s)}${s.post?'<br>'+postLine(s):''}</td></tr>`).join('')}</tbody></table></div></details>`; }).join('')}<p class="small muted">Lahman Teams / Managers / SeriesPost (CC BY-SA 3.0), through 2025.</p></div>`;
  return `${cityNote()}${kv}<div class="grid">${honors}${awards}</div><div class="grid">${hof}${leaders}</div>${extra?`<div class="grid">${extra}</div>`:''}${seasons}`; }

// ---------------- Lore tab ----------------
function storyCards(sec){ const st=(sec&&sec.stories)||[]; if(!st.length) return '';
  return `<div class="card"><h3>${esc(sec.title||'')}</h3>${sec.intro?`<p class="small muted">${esc(sec.intro)}</p>`:''}${st.map(s=>{ if(typeof s==='string') return `<div class="story"><p>${linkify(s)}</p></div>`;
    const links=(s.source_links||[]).map(l=>`<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join(' · ');
    return `<div class="story"><div><b>${linkify(s.title||'')}</b>${s.era?` <span class="muted small">${esc(s.era)}</span>`:''}</div>${s.subtitle?`<div class="small muted">${esc(s.subtitle)}</div>`:''}${s.hook?`<p class="small"><i>${linkify(s.hook)}</i></p>`:''}${s.body?`<p>${linkify(s.body)}</p>`:''}${links?`<div class="small">${links}</div>`:''}</div>`; }).join('')}</div>`; }
// v1.9: the Story Bible's locked 26 lives only here. It is compared with the app's DEFAULT 26 for this view (city + Big Moments setting, never the
// user's pins), and nothing flows the other way: app.js / engine.js / compare.js never read sb.locked_roster.
function lockedRoster(lr){ if(!lr) return ''; const c=H.cur();
  const eng=c?(H.appBase?H.appBase():c.o):null; const engSet=eng?new Set([...Object.values(eng.start),...Object.values(eng.bench),...Object.values(eng.rotation),...Object.values(eng.pen)]):new Set();
  const row=x=>{ const n=typeof x==='string'?x:x.name; const on=engSet.has(n); return `<tr><td><span class="pos">${esc(x.slot||'')}</span></td><td>${linkify(n)}${x.bat_order?` <span class="muted small">#${x.bat_order}</span>`:''}</td><td class="small">${on?'<span class="tag ok">engine agrees</span>':'<span class="tag bible">Bible pick</span>'}</td></tr>`; };
  const part=(h,L)=>L&&L.length?`<h3>${h}</h3><table><tbody>${L.map(row).join('')}</tbody></table>`:'';
  return `<div class="card"><div class="small muted">Bible 26 vs app</div><h3>${esc(lr.title||'Story Bible 26')}</h3>${lr.headline?`<p><b>${esc(lr.headline)}</b></p>`:''}${lr.blurb?`<p class="small">${linkify(lr.blurb)}</p>`:''}
    <div class="grid"><div>${part('Starting nine',lr.starting_nine)}${part('Bench',lr.bench)}</div><div>${part('Rotation',lr.rotation)}${part('Bullpen',lr.bullpen)}</div></div>
    ${(lr.decisions||[]).length?`<details><summary class="small">Decisions (${lr.decisions.length})</summary><ul class="small">${lr.decisions.map(x=>`<li>${linkify(typeof x==='string'?x:(x.text||x.title||JSON.stringify(x)))}</li>`).join('')}</ul></details>`:''}
    <p class="small muted">"Engine agrees" = also on the app's default 26 for this view (${c&&c.city?esc(c.city.city):'full franchise'}, no fan pins). "Bible pick" = an editorial Story Bible choice the engine did not make. This list is for reading only: the roster builder and the engine never use it.</p></div>`; }
function itemList(title,items,intro){ if(!items||!items.length) return ''; return `<div class="card"><h3>${esc(title)}</h3>${intro?`<p class="small muted">${esc(intro)}</p>`:''}<ul>${items.map(x=>`<li>${typeof x==='string'?linkify(x):`${x.topic?`<b>${esc(x.topic)}</b>: `:''}${x.beat?`<b>${esc(x.beat)}</b>: `:''}${linkify(x.note||x.body||x.text||x.title||'')}`}</li>`).join('')}</ul></div>`; }
function vLore(key){ const d=Lore.get(key); if(!d) return loading(key,'Lore');
  const c=H.cur(), t=c.t, lp=d.lore; let html='';
  if(lp&&lp.sb){ const sb=lp.sb;
    const hero=sb.hero||{};
    html+=`<div class="lhero"><div class="small">${esc(sb.title||'Story Bible')}${sb.scope?' · '+esc(sb.scope):''}</div><h2>${esc(hero.headline||sb.title||t.name)}</h2>${hero.dek?`<p>${linkify(hero.dek)}</p>`:''}${sb.central_idea?`<p><b>${esc(sb.central_idea)}</b></p>`:''}${sb.narrative_thesis?`<p class="small">${linkify(sb.narrative_thesis)}</p>`:''}
      ${hero.scorebox&&hero.scorebox.lines?`<div class="small">${hero.scorebox.lines.map(esc).join('<br>')}</div>`:''}${(hero.facts||[]).length?`<div class="kv">${hero.facts.map(f=>`<div><span>${esc(f.label)}</span><b>${esc(f.value)}</b></div>`).join('')}</div>`:''}</div>`;
    if(sb.spine&&sb.spine.ideas) html+=`<div class="card"><h3>${esc(sb.spine.title||'The story spine')}</h3>${sb.spine.intro?`<p class="small muted">${esc(sb.spine.intro)}</p>`:''}<div class="spine">${sb.spine.ideas.map(i=>`<div class="story"><div class="small muted">${esc(i.kicker||'')}</div><b>${esc(i.title)}</b><p>${linkify(i.body)}</p></div>`).join('')}</div>${sb.spine.quote?`<blockquote>${esc(sb.spine.quote.text)}<br><span class="small muted">${esc(sb.spine.quote.attribution||'')}</span></blockquote>`:''}</div>`;
    html+=lockedRoster(sb.locked_roster);
    for(const k of ['highs','lows','legendary_players','people','managers','builders','figures','quirky_lore','city_lore','cult_heroes']) html+=storyCards(sb[k]);
    if(sb.film_spine) html+=itemList(sb.film_spine.title,sb.film_spine.beats,sb.film_spine.intro);
    if(sb.unsettled_claims) html+=itemList(sb.unsettled_claims.title,sb.unsettled_claims.items,sb.unsettled_claims.intro);
    if(sb.open_questions&&((sb.open_questions.items||[]).length||(sb.open_questions.corrections||[]).length)) html+=itemList(sb.open_questions.title||'Open questions',[...(sb.open_questions.items||[]),...(sb.open_questions.corrections||[])],sb.open_questions.intro);
    if(sb.closing) html+=`<div class="card"><h3>${esc(sb.closing.title||'')}</h3><p>${linkify(sb.closing.body||'')}</p>${sb.closing.credits?`<p class="small muted">${esc(sb.closing.credits)}</p>`:''}</div>`;
  }
  if(lp){ const fl=lp.legends; if(fl){ const lk=Object.keys(fl).find(k=>/^top\d+$/.test(k)); const L=lk?fl[lk]:[];
      if(L.length) html+=`<div class="card"><h3>${esc(fl.title||'Franchise legends')}</h3>${fl.note?`<p class="small muted">${esc(fl.note)}</p>`:''}<ol>${L.map(x=>`<li>${linkify(x.player)}${x.pos||x.role?` <span class="muted small">${esc(x.pos||x.role)}</span>`:''}${x.tagline?` · <i>${esc(x.tagline)}</i>`:''}${x.stats?` <span class="small muted">${esc(x.stats)}</span>`:''}</li>`).join('')}</ol>${(fl.honorable_mentions||fl.just_missed||[]).length?`<p class="small">Also: ${(fl.honorable_mentions||fl.just_missed).map(x=>linkify(typeof x==='string'?x:(x.player||x.name||''))).join(', ')}</p>`:''}</div>`; }
    if(lp.deep&&lp.deep.length) html+=`<div class="card"><h3>Deep cuts</h3>${lp.deep.map(x=>`<div class="story"><b>${linkify(x.title)}</b><p>${linkify(x.body)}</p></div>`).join('')}</div>`;
    if(lp.nick&&lp.nick.length) html+=`<div class="card"><h3>Nicknames &amp; rivalries</h3><p>${lp.nick.map(x=>`<span class="pill">${linkify(x.text||x.label)}${x.note?` <span class="muted small">${esc(x.note)}</span>`:''}</span>`).join(' ')}</p></div>`;
    if(lp.moments&&lp.moments.length) html+=`<div class="card"><h3>Moments</h3>${lp.moments.map(x=>`<div class="story"><b>${esc(x.title)}</b> <span class="muted small">${esc(x.date||'')}${x.wpa!=null?` · WPA ${x.wpa>0?'+':''}${x.wpa}`:''}</span><p>${linkify(x.body)}</p></div>`).join('')}</div>`;
    const ps=lp.postseason||{}; if((ps.top_career_oct_wpa||[]).length) html+=`<div class="card"><h3>October leaders (career WPA here)</h3><table><thead><tr><th>Player</th><th class="n">Oct WPA</th><th class="n">G</th><th class="n hide-s">Best year</th></tr></thead><tbody>${ps.top_career_oct_wpa.map(x=>`<tr><td>${linkify(x.player)}</td><td class="n">${(+x.oct_wpa).toFixed(2)}</td><td class="n">${x.oct_G}</td><td class="n hide-s">${x.best_year||''}</td></tr>`).join('')}</tbody></table></div>`;
    if(lp.history&&lp.history.length) html+=`<div class="card"><h3>Eras</h3>${lp.history.map(e=>{ const m=String(e.era).match(/\d{4}/); const ch=m?chapterOf(d,+m[0]):null; return `<div class="story"><div class="small muted">${esc(e.era)}${ch?` · <a href="#/${key}/history/${ch.id}">History chapter</a>`:''}</div><b>${esc(e.title)}</b><p>${linkify(e.body)}</p></div>`; }).join('')}</div>`;
    html+=`<p class="small muted">Lore pack ${esc(lp.version||'')}: our own writing from Joseph's Story Bible / posters plus Lahman facts. ${lp.gaps&&lp.gaps.length?`Known gaps: ${lp.gaps.map(esc).join(' · ')}`:''}</p>`;
  }
  if(!lp){ // empty state + what we can already say
    const pl=Object.entries(d.players).filter(([id,r])=>H.kindOf(id)&&r.b).sort((a,b)=>b[1].b.length-a[1].b.length).slice(0,24);
    html+=`<div class="banner"><b>No Story Bible for the ${esc(t.short)} yet.</b> When one lands it fills this tab: the story spine, highs and lows, legends, cult heroes, quirky lore and the Bible's locked 26 (compared with the app's 26). History and Almanac already work for every club.</div>
      <div class="card"><h3>Most-told players in the history threads</h3><p>${pl.map(([id,r])=>`<span class="pill">${chip(d,id)} ${r.b.length}</span>`).join(' ')||'<span class="muted small">none yet</span>'}</p><p class="small muted">Count of story threads (This Great Game / Baseball Almanac, linked on each card) that name him.</p></div>`;
  }
  return html; }

// ---------------- player card section ----------------
function cardSection(key,id){ const d=Lore.get(key); if(!d){ Lore.ensure(key).then(()=>{ const el=document.querySelector(`.lorecard[data-id="${CSS.escape(id)}"]`); if(el) el.outerHTML=cardSection(key,id); },()=>{ const el=document.querySelector('.lorecard'); if(el) el.innerHTML='<p class="small muted">History not available in this build.</p>'; });
    return `<div class="lorecard" data-id="${esc(id)}"><h3>In the history books</h3><p class="small muted">Loading…</p></div>`; }
  const r=d.players[id]; if(!r) return `<div class="lorecard" data-id="${esc(id)}"><h3>In the history books</h3><p class="small muted">No history threads, awards or league-leading lines found for him yet.</p></div>`;
  const aw=r.aw||[]; const mine=aw.filter(a=>a[3]), other=aw.filter(a=>!a[3]);
  const ll=r.ll||[]; const llMine=ll.filter(l=>l[4]);
  const beats=(r.b||[]).map(b=>{ const x=d.beats[b]; const ch=x?chapterOf(d,x.y):null; return beatRow(d,b,{year:1,ch:ch&&d.byYear[x.y]?ch.id:null,chTitle:ch?`${ch.y0}–${ch.y1}`:'',key}); }).join('');
  const sum=a=>{ const c={}; for(const x of a) c[x[1]]=(c[x[1]]||[]).concat(x[0]); return Object.entries(c).map(([k,ys])=>`<span class="pill">${esc(k)} ${ys.join(', ')}</span>`).join(' '); };
  return `<div class="lorecard" data-id="${esc(id)}"><h3>In the history books</h3>${r.hof?`<p><span class="tag hon ws">Hall of Fame ${r.hof}</span></p>`:''}
    ${mine.length?`<p class="small"><b>Awards with the ${esc(d.name)}</b><br>${sum(mine)}</p>`:''}${other.length?`<p class="small muted">Elsewhere: ${sum(other)}</p>`:''}
    ${llMine.length?`<p class="small"><b>Led the league here</b><br>${llMine.map(l=>`<span class="pill">${l[0]} ${esc(l[1])} ${esc(l[2])} ${esc(l[3])}</span>`).join(' ')}</p>`:''}${ll.length>llMine.length?`<p class="small muted">Plus ${ll.length-llMine.length} league-leading line${ll.length-llMine.length===1?'':'s'} with other clubs.</p>`:''}
    ${beats?`<details${(r.b||[]).length<=4?' open':''}><summary class="small">${r.b.length} story thread${r.b.length===1?'':'s'} name him</summary><ul class="beats">${beats}</ul></details>`:''}
    <p class="small muted">History tab: <a href="#/${key}/history">${esc(d.name)} chapters</a> · Almanac: <a href="#/${key}/almanac">honors and leaders</a></p></div>`; }

// ---------------- League History (top level) ----------------
function vLeague(chId){ if(!INDEX){ Lore.ensureIndex().then(()=>H.rerender(),e=>{ const el=document.getElementById('lorebox'); if(el) el.innerHTML=`<div class="banner">History is not available here: ${esc(e.message)}. Open the online app for History, Almanac and Lore.</div>`; }); return `<div class="panel" style="border-radius:10px"><div id="lorebox"><p class="loading">Loading History…</p></div></div>`; }
  const chs=INDEX.chapters; const ch=chId?chs.find(c=>c.id===chId):null;
  const tl=(nm,k,hash)=>k?`<a href="#/${k}/history${hash?'/'+hash:''}">${esc(nm)}</a>`:esc(nm);
  if(!ch) return `<div class="panel" style="border-radius:10px"><h1>Baseball, five years at a time</h1><p class="small muted">${chs.length} chapters, 1871 to today. Each chapter has the pennant winners, World Series, first-place clubs and the MLB leaders for every season, with links to the full stories at This Great Game, Baseball Almanac and Baseball Data Hub. Team names open that club's History tab.</p>
    <div class="chgrid">${chs.map(c=>{ const ws=c.seasons.filter(s=>s.ws).map(s=>s.ws[0]); return `<a class="chcard" href="#/history/${c.id}"><div class="cht">${esc(c.title.replace(/^Chapter \d+: /,''))}</div><div class="small muted">${esc(c.title.split(':')[0])}</div><div class="small">${ws.length?'Champions: '+ws.map(esc).join(', '):''}</div></a>`; }).join('')}</div></div>`;
  const i=chs.indexOf(ch), prev=chs[i-1], next=chs[i+1];
  const seasons=ch.seasons.map(s=>`<div class="season"><div class="sh"><span class="sy">${s.y}</span></div>
     ${s.ws?`<div><span class="tag hon ws">World Series</span> ${tl(s.ws[0],s.ws[1],ch.id)} def. ${tl(s.ws[2],s.ws[3],ch.id)} (${esc(s.ws[4])})</div>`:s.wsr?`<div class="small">${esc(s.wsr)}</div>`:''}
     ${s.pen.length?`<div class="small"><b>Pennants</b> ${s.pen.map(p=>`${esc(p[0])}: ${tl(p[1],p[2],ch.id)}`).join(' · ')}</div>`:''}
     ${s.fp.length?`<div class="small muted">First place: ${s.fp.map(p=>`${esc(p[0])}${p[1]?' '+esc(p[1]):''} ${tl(p[2],p[5],ch.id)} ${p[3]}–${p[4]}`).join(' · ')}</div>`:''}
     ${Object.keys(s.ld).length?`<details><summary class="small">MLB leaders</summary><p class="small">${Object.entries(s.ld).map(([k,v])=>`<span class="pill">${esc(k)}: ${v.map(x=>esc(x[0])+' '+esc(x[1])).join(', ')}</span>`).join(' ')}</p></details>`:''}
     <div class="small">${s.src.map(u=>`<a href="${esc(u)}" target="_blank" rel="noopener">${/thisgreatgame/.test(u)?'This Great Game':/almanac/.test(u)?'Baseball Almanac'+(/a\.shtml$/.test(u)?' (AL)':/n\.shtml$/.test(u)?' (NL)':''):/datahub/.test(u)?'Baseball Data Hub':'Source'} ↗</a>`).join(' · ')}${s.y>=1900&&s.y<=2025?` · <a href="https://thisgreatgame.com/${s.y}-baseball-history/" target="_blank" rel="noopener">This Great Game ↗</a>`:''}${s.n?` · <span class="muted">${s.n} threads in the archive</span>`:''}</div></div>`).join('');
  return `<div class="panel" style="border-radius:10px"><div class="chnav"><a class="btn" href="#/history">All chapters</a>${prev?`<a class="btn" href="#/history/${prev.id}">‹ ${esc(prev.title.split(':')[0])}</a>`:''}${next?`<a class="btn" href="#/history/${next.id}">${esc(next.title.split(':')[0])} ›</a>`:''}</div>
    <h1>${esc(ch.title)}</h1>${ch.dec.length?`<p class="small">${ch.dec.map(x=>`<a href="${esc(x.u)}" target="_blank" rel="noopener">${esc(x.t)} overview at This Great Game ↗</a>`).join(' · ')}</p>`:''}${seasons}
    <p class="small muted">${esc(INDEX.note)}</p></div>`; }

root.LLLoreUI={ init(h){ H=h; }, history:vHistory, almanac:vAlmanac, lore:vLore, card:cardSection, league:vLeague };
})(typeof window!=='undefined'?window:globalThis);
