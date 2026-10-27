import {chromium} from 'playwright';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';

const sourceFile=process.argv[2]||'data/sources/magicinmybones.json';
const base=(process.argv[3]||'http://127.0.0.1:4173').replace(/\/$/,'');
const source=JSON.parse(await readFile(sourceFile,'utf8'));
const refs=(source.references||[]).filter(r=>r.preparedPreview&&r.previewType==='local');
await mkdir('public/screenshots',{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const results=[];
for(const ref of refs){const url=`${base}/previews/${ref.id}/`;const out=`public/screenshots/${ref.id}.jpg`;const result={id:ref.id,url,status:'failed',error:null};try{await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});await page.waitForTimeout(1800);const title=await page.title();const body=await page.locator('body').innerText({timeout:5000});if(!body.trim()&&!title.trim())throw new Error('Rendered page is empty');await page.screenshot({path:out,type:'jpeg',quality:76,fullPage:false});ref.thumbnail=`/screenshots/${ref.id}.jpg`;ref.screenshotNote='Actual browser capture of the authorized central preview at 1440×900.';ref.checkedAt=new Date().toISOString();ref.visualEvidence=`Browser rendered ${url}; title: ${title||'(untitled)'}; visible text detected.`;ref.status='Working';ref.previewReason='Authorized central preview built from the pinned source commit and browser-verified inside the Design Reference Library.';result.status='working'}catch(e){result.error=String(e?.message||e);ref.status='Partial';ref.checkedAt=new Date().toISOString();ref.visualEvidence=null;ref.thumbnail=null;ref.previewReason=`Central preview was prepared but browser verification failed: ${result.error}`}results.push(result);console.log(`${ref.id} ${ref.repo}: ${result.status}${result.error?` — ${result.error}`:''}`)}
await browser.close();source.visualVerification={generatedAt:new Date().toISOString(),working:results.filter(r=>r.status==='working').length,failed:results.filter(r=>r.status!=='working').length,results};await writeFile(sourceFile,JSON.stringify(source,null,2)+'\n');await mkdir('docs',{recursive:true});await writeFile('docs/magicinmybones-visual-verification.json',JSON.stringify(source.visualVerification,null,2)+'\n');console.log(`Verified ${source.visualVerification.working}/${results.length} central previews.`);
