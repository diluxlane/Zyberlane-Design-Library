import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

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
  if(!sources.length)return base;
  const references=[...base.references];
  const inventory=[...base.inventory];
  for(const source of sources){
    references.push(...(source.references||[]));
    inventory.push(...(source.inventory||[]));
  }
  const inspectedDates=[base.inspectedDate,...sources.map(s=>s.inspectedDate)].filter(Boolean).sort();
  return {
    ...base,
    creator:'multiple-sources',
    sources:[
      {owner:'gireeshkumarreddy',label:'Gireesh Kumar Reddy',repositoryCount:base.discoveredRepositories},
      ...sources.map(s=>({owner:s.owner,label:s.label,repositoryCount:(s.inventory||[]).length}))
    ],
    inspectedDate:inspectedDates.at(-1)||base.inspectedDate,
    discoveredRepositories:inventory.length,
    websiteRepositories:inventory.filter(r=>r.website).length,
    acceptedWebsiteRepositories:inventory.filter(r=>r.accepted).length,
    references,
    inventory
  };
}
