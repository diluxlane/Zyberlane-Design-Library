import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { searchReferences, normalizedReferenceType } from '../src/catalogue.mjs';
import { loadCatalogue } from '../scripts/load-catalogue.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const catalogue=await loadCatalogue(root);

function ref(id,type,title,categories=[],tags=[]){
  return {id,title,repo:title.toLowerCase().replace(/\s+/g,'-'),creator:'Test',sourceOwner:'Test',description:'',framework:'Static HTML/CSS/JS',complexity:'Low',tags,categories,technologies:[],suitableFor:[],status:'Working',referenceType:type};
}

test('merged catalogue assigns every accepted reference a collection type',()=>{
  assert.ok(catalogue.references.length>0);
  for(const r of catalogue.references)assert.ok(r.referenceType,`${r.id} missing referenceType`);
});

test('Magicinmybones hero repositories are kept out of the Website collection',()=>{
  const heroNamed=catalogue.references.filter(r=>String(r.sourceOwner).toLowerCase()==='magicinmybones'&&/(^|[-_])hero([_-]|$)/i.test(r.repo));
  assert.ok(heroNamed.length>0,'Expected at least one Magicinmybones hero repository');
  assert.ok(heroNamed.every(r=>r.referenceType==='Hero Page'));
  const websiteIds=new Set(searchReferences(catalogue.references,{referenceType:'Website'}).map(r=>r.id));
  assert.ok(heroNamed.every(r=>!websiteIds.has(r.id)));
});

test('a collection scope applies only when there is no search query',()=>{
  const sample=[ref('REF-901','Website','Studio Website',['Creative Portfolio']),ref('REF-902','Hero Page','Studio Hero',['Creative Portfolio'])];
  assert.deepEqual(searchReferences(sample,{referenceType:'Website'}).map(r=>r.id),['REF-901']);
  assert.deepEqual(searchReferences(sample,{referenceType:'Hero Page'}).map(r=>r.id),['REF-902']);
  assert.deepEqual(searchReferences(sample,{referenceType:'Website',query:'studio'}).map(r=>r.id),['REF-901','REF-902']);
});

test('global search ranks websites before hero pages and then other reference types',()=>{
  const sample=[
    ref('REF-903','Component','Portfolio Button',['Component Study'],['portfolio']),
    ref('REF-902','Hero Page','Portfolio Hero',['Creative Portfolio']),
    ref('REF-901','Website','Portfolio Website',['Creative Portfolio'])
  ];
  assert.deepEqual(searchReferences(sample,{query:'portfolio'}).map(r=>r.id),['REF-901','REF-902','REF-903']);
});

test('portfolio search aliases include video-editor intent',()=>{
  const sample=[
    ref('REF-901','Website','Creative Portfolio',['Creative Portfolio']),
    ref('REF-902','Hero Page','Creative Portfolio Hero',['Creative Portfolio']),
    ref('REF-903','Website','Banking Site',['Business'])
  ];
  assert.deepEqual(searchReferences(sample,{query:'video editor portfolio website'}).map(r=>r.id),['REF-901','REF-902']);
});

test('legacy references get safe type fallbacks',()=>{
  assert.equal(normalizedReferenceType({repo:'artifact-museum-hero',categories:['Hero Section']}),'Hero Page');
  assert.equal(normalizedReferenceType({repo:'cloud-cards',categories:['Component Study']}),'Component');
  assert.equal(normalizedReferenceType({repo:'portfolio-site',categories:['Creative Portfolio']}),'Website');
});
