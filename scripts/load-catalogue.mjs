import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { normalizedReferenceType } from '../src/catalogue.mjs';

function normalizeSourceReference(reference){
  return {...reference,referenceType:normalizedReferenceType(reference)};
}
function normalizeSourceInventory(row){
  if(!row.accepted)return row;
  return {...row,referenceType:row.referenceType||normalizedReferenceType({repo:row.name,categories:row.categories||[]})};
}

export async function loadCatalogue(root=process.cwd()) {
  const base=JSON.parse(await readFile(path.join(root,'data/catalogue.json'),'utf8'));
  const sourcesDir=path.join(root,'data/sources');
  let names=[];
  try{names=(await readdir(sourcesDir)).filter(name=>name.endsWith('.json')).sort();}catch{}
  const sources=[];
  for(const name of names){
    const source=JSON.parse(await readFile(path.join(sourcesDir,name),'utf8'));
    if(source.enabled===false)continue;
    sources.push(source);
  }
  // The legacy/base catalogue is the already-verified Gireesh Kumar Reddy website collection.
  // Keep those entries as full Websites instead of applying heuristic reclassification.
  const references=[...(base.references||[]).map(r=>({...r,referenceType:r.referenceType||'Website'}))];
  const inventory=[...(base.inventory||[]).map(r=>r.accepted?{...r,referenceType:r.referenceType||'Website'}:r)];
  for(const source of sources){
    references.push(...(source.references||[]).map(normalizeSourceReference));
    inventory.push(...(source.inventory||[]).map(normalizeSourceInventory));
  }
  const inspectedDates=[base.inspectedDate,...sources.map(s=>s.inspectedDate)].filter(Boolean).sort();
  const referenceTypeCounts=Object.fromEntries([...new Set(references.map(r=>r.referenceType))].sort().map(type=>[type,references.filter(r=>r.referenceType===type).length]));
  return {
    ...base,
    creator:sources.length?'multiple-sources':base.creator,
    sources:[
      {owner:'gireeshkumarreddy',label:'Gireesh Kumar Reddy',repositoryCount:base.discoveredRepositories},
      ...sources.map(s=>({owner:s.owner,label:s.label,repositoryCount:(s.inventory||[]).length}))
    ],
    inspectedDate:inspectedDates.at(-1)||base.inspectedDate,
    discoveredRepositories:inventory.length,
    websiteRepositories:inventory.filter(r=>r.website).length,
    acceptedWebsiteRepositories:inventory.filter(r=>r.accepted&&r.referenceType==='Website').length,
    acceptedReferences:inventory.filter(r=>r.accepted).length,
    referenceTypeCounts,
    references,
    inventory
  };
}
