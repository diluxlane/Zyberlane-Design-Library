import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { searchReferences, referencePrompt } from '../src/catalogue.mjs';
const catalogue=JSON.parse(await readFile(new URL('../data/catalogue.json',import.meta.url),'utf8'));
const registry=JSON.parse(await readFile(new URL('../data/reference-registry.json',import.meta.url),'utf8'));
const binaryAssets=JSON.parse(await readFile(new URL('../data/binary-assets.json',import.meta.url),'utf8'));
const {references,inventory}=catalogue;
test('all discovered repositories have one inventory row and valid classifications',()=>{
 assert.equal(inventory.length,catalogue.discoveredRepositories);
 assert.equal(new Set(inventory.map(r=>r.name)).size,inventory.length);
 assert.equal(inventory.filter(r=>r.website).length,catalogue.websiteRepositories);
 assert.equal(inventory.filter(r=>r.accepted).length,catalogue.acceptedWebsiteRepositories);
 for(const r of inventory){assert.match(r.repository,/^https:\/\/github\.com\/gireeshkumarreddy\/[^/]+$/);assert.ok(catalogue.classifications[r.classification]);assert.ok(r.classificationReason);}
});
test('permanent reference IDs map to their recorded repository and variant',()=>{
 assert.equal(new Set(references.map(r=>r.id)).size,references.length);
 for(const r of references){assert.match(r.id,/^REF-\d{3}$/);assert.equal(registry.assignments[r.repo+(r.variantRoute||'')],r.id);assert.match(r.commit,/^[a-f0-9]{40}$/);assert.equal(r.repository,'https://github.com/gireeshkumarreddy/'+r.repo);assert.ok(r.sourceEvidence.length);}
});
test('case-insensitive multi-term search includes technologies and reference IDs',()=>{
 assert.ok(searchReferences(references,{query:'WeBgL'}).length>0);
 assert.equal(searchReferences(references,{query:'ref-014'})[0].id,'REF-014');
 const sample=[{...references[0],id:'REF-901',title:'Cinematic portfolio',description:'',tags:[],categories:[],technologies:[],suitableFor:[],repo:'a',framework:'',complexity:'Low'},{...references[0],id:'REF-902',title:'Cinematic shop',description:'',tags:[],categories:[],technologies:[],suitableFor:[],repo:'b',framework:'',complexity:'Low'}];
 assert.deepEqual(searchReferences(sample,{query:'cinematic portfolio'}).map(r=>r.id),['REF-901']);
 assert.equal(searchReferences(references,{query:'nonexistentzzzzzz'}).length,0);
});
test('category, status and saved filters compose without mutating source order',()=>{
 const before=references.map(r=>r.id);const category=references[0].categories[0];
 const matches=searchReferences(references,{category,status:references[0].status,savedOnly:true,saved:[references[0].id]});
 assert.deepEqual(matches.map(r=>r.id),[references[0].id]);searchReferences(references,{sort:'name'});assert.deepEqual(references.map(r=>r.id),before);
});
test('copy prompt preserves reference identity and project separation',()=>{
 const r=references.find(r=>r.variantRoute);const prompt=referencePrompt(r);
 for(const value of [r.id,r.repository,r.commit,r.variantRoute,'NEW independent repository','Do not modify the original repository'])assert.ok(prompt.includes(value));
});
test('working previews have explicit verification evidence and matching screenshot records',async()=>{
 for(const r of references){
  assert.ok(['Working','Partial','Unavailable'].includes(r.status));
  if(r.status==='Working'){assert.ok(r.preview);assert.ok(r.checkedAt);assert.ok(r.visualEvidence);}
  if(r.thumbnail){
   assert.ok(r.thumbnail.startsWith('/screenshots/'+r.id));
   const file=binaryAssets.find(x=>'/'+x.output===r.thumbnail);assert.ok(file);
   const bytes=Buffer.from(await readFile(new URL('../'+file.source,import.meta.url),'utf8'),'base64');
   assert.ok(bytes.length>1000);assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
  }
  if(r.preview){assert.ok(r.preview.startsWith('/previews/'+r.id+'/')||/^https:\/\//.test(r.preview));}
 }
});
test('no credential patterns or production service configuration exist in catalogue',()=>{
 const value=JSON.stringify(catalogue);
 assert.doesNotMatch(value,/(?:sk-(?:proj-)?[a-zA-Z0-9_-]{20,}|gh[pousr]_[a-zA-Z0-9]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/);
});
