const fs=require('node:fs'); const {load}=require('./data.cjs'); const E=require('../engine.js'); const c=load();
const out={}; for(const t of c.LL_DATA.teams) for(const bm of [false,true]){const o=E.build(bm?E.withBM(t):t,{}); delete o._objs;out[t.key+(bm?':bm':'')]=o;}
fs.writeFileSync(process.argv[2],JSON.stringify(out,null,2)); console.log('Captured 60 builds');
