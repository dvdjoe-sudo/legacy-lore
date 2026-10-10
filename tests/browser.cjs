const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {root,load}=require('./data.cjs');
const tmp=path.resolve(root,'../preview-browser-tmp');fs.mkdirSync(tmp,{recursive:true});process.env.TEMP=tmp;process.env.TMP=tmp;
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/GIjoe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(data);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));const base=require('url').pathToFileURL(path.join(root,'download/legacy_lore.html')).href;
  await page.goto(base);await page.waitForFunction(()=>window.LL_SELFCHECK?.().done,{timeout:60000});assert.equal(await page.evaluate(()=>LL_SELFCHECK().ok),true);
  const c=load();let routes=0;
  for(const t of c.LL_DATA.teams){await page.goto(base+'#/'+t.key);await page.waitForSelector('[data-swap="DH"]',{timeout:30000});routes++;}
  for(const t of c.LL_DATA.teams)for(const city of (c.LL_CITIES[t.code]||{}).cities||[]){
   await page.evaluate(([key,value])=>localStorage.setItem('ll_city_v1_'+key,value),[t.key,city.key]);await page.goto(base+'#/'+t.key);
   await page.waitForFunction(()=>document.body.innerText.includes('Full franchise stats; assigned to the city'),{timeout:30000});
   assert.ok(!(await page.locator('#app').innerText()).includes('City roster unavailable'));routes++;
   await page.goto(base+'#/'+t.key+'/compare');await page.waitForFunction(()=>window.LL_TEST&&document.body.innerText.includes('Divergence flags'));
   assert.notEqual(await page.evaluate(()=>LL_TEST.compareNow().unavailable),true);routes++;
  }

  await page.evaluate(()=>{localStorage.clear();localStorage.setItem('ll_pins_v1_yankees',JSON.stringify({roster:{'Mickey Mantle':'C'}}));});await page.goto(base+'#/yankees');await page.waitForFunction(()=>document.body.innerText.includes('Position eligibility violation'));assert.ok((await page.locator('[data-swap="C"]').innerText()).includes('Yogi Berra'));
  await page.evaluate(()=>LL_TEST.card('h','Mickey Mantle'));let dialog;page.once('dialog',async d=>{dialog=d.message();await d.dismiss();});await page.locator('[data-pin="roster"]').selectOption('SS');assert.ok(dialog.includes('Explicitly acknowledge'));assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('ll_pins_v1_yankees')).roster['Mickey Mantle']),'C');
  page.once('dialog',d=>d.accept());await page.locator('[data-pin="roster"]').selectOption('SS');await page.waitForFunction(()=>document.body.innerText.includes('exception explicitly acknowledged'));assert.ok((await page.locator('[data-swap="SS"]').innerText()).includes('Mickey Mantle'));
  await page.goto(base);await page.waitForFunction(()=>window.LL_SELFCHECK?.().done,{timeout:60000});assert.equal(await page.evaluate(()=>LL_SELFCHECK().ok),true);assert.deepEqual(errors,[]);
  await page.evaluate(()=>{localStorage.clear();localStorage.setItem('ll_city_v1_athletics','oak');});await page.goto(base+'#/athletics');await page.waitForFunction(()=>document.body.innerText.includes('Full franchise stats; assigned to the city'));
  await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:path.resolve(root,'../../outputs/preview-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.resolve(root,'../../outputs/preview-mobile.png'),fullPage:true});
 
  console.log(JSON.stringify({routes,offline_routes:true,offline_selfcheck:true,override_cancel:true,override_acknowledge:true,page_errors:errors},null,2));fs.writeFileSync('../browser-results.json',JSON.stringify({routes,offline_routes:true,offline_selfcheck:true,override_cancel:true,override_acknowledge:true,page_errors:errors},null,2));
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
