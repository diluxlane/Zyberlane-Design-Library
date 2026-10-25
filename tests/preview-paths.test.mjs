import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { rewritePreviewPaths } from '../scripts/preview-paths.mjs';
const snapshot={id:'REF-032',repo:'Mahira',topNames:['assets','js','index.html','shop.html']};
test('actual Mahira regex escaping and SVG self-closing syntax survive path compatibility',()=>{
 const original=`var CHEV = '<span class="chev"><svg viewBox="0 0 16 16"><path d="M6 3l5 5-5 5"/></svg></span>';\nfunction esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }`;
 const result=rewritePreviewPaths(original,snapshot);
 assert.equal(result,original);assert.doesNotThrow(()=>new vm.Script(result));
});
test('only complete known URL values receive a preview base',()=>{
 const original=`const image="/assets/hero.jpg"; const parts='/'.split('/'); const external="https://example.test/assets/x"; const unknown="/outside/x"; const html='<a href="/">Home</a><img src="/assets/a b.jpg">'; const css='background:url(/assets/paper.png)';`;
 const result=rewritePreviewPaths(original,snapshot);
 assert.ok(result.includes('"/previews/REF-032/assets/hero.jpg"'));
 assert.ok(result.includes("'/'.split('/')"));assert.ok(result.includes('https://example.test/assets/x'));
 assert.ok(result.includes('"/outside/x"'));assert.ok(result.includes('href="/previews/REF-032/"'));
 assert.ok(result.includes('src="/previews/REF-032/assets/a b.jpg"'));
 assert.ok(result.includes('url(/previews/REF-032/assets/paper.png)'));assert.doesNotThrow(()=>new vm.Script(result));
});
