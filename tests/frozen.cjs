const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),fixture=require('./fixtures/frozen-scoring-hashes.json');
const hash=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n')).digest('hex');
for(const [file,sha] of Object.entries(fixture.files))assert.equal(hash(fs.readFileSync(path.join(root,file),'utf8')),sha,file+' frozen input');
const engine=fs.readFileSync(path.join(root,'engine.js'),'utf8');assert.equal(hash(engine.slice(engine.indexOf('const BM_HCOLS'),engine.indexOf('const API='))),fixture.bigMomentsArithmetic,'frozen Big Moments arithmetic');
const zlib=require('node:zlib'),pack=fs.readFileSync(path.join(root,'data/ll_index.js'),'utf8').match(/index:"([^"]+)"/)[1],metadata=JSON.parse(zlib.gunzipSync(Buffer.from(pack,'base64')));for(const t of metadata.teams){delete t.py;delete t.py_bm;}assert.deepEqual(metadata,fixture.indexMetadata,'frozen index metadata and rules; corrected selection references excluded');
console.log(JSON.stringify({passed:true,historicalBase:fixture.commit,frozenFiles:Object.keys(fixture.files).length,bigMomentsArithmeticUnchanged:true}));
