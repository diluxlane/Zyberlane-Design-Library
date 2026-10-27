export function searchReferences(references, {query='',category='All',status='All',savedOnly=false,saved=[],sort='id'}={}) {
  const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const list=references.filter(r=>{
    if(category!=='All'&&!r.categories.includes(category))return false;
    if(status!=='All'&&r.status!==status)return false;
    if(savedOnly&&!saved.includes(r.id))return false;
    const haystack=[r.id,r.title,r.repo,r.creator,r.sourceOwner,r.description,r.framework,r.complexity,...r.tags,...r.categories,...r.technologies,...r.suitableFor].filter(Boolean).join(' ').toLowerCase();
    return terms.every(t=>haystack.includes(t));
  });
  return list.sort(sort==='name'?(a,b)=>a.title.localeCompare(b.title):sort==='ready'?(a,b)=>['Working','Partial','Unavailable'].indexOf(a.status)-['Working','Partial','Unavailable'].indexOf(b.status)||a.id.localeCompare(b.id):sort==='complexity'?(a,b)=>['Low','Medium','High'].indexOf(a.complexity)-['Low','Medium','High'].indexOf(b.complexity)||a.id.localeCompare(b.id):(a,b)=>a.id.localeCompare(b.id));
}
export function referencePrompt(r) {
  return `Use ${r.id} — ${r.title} as my authorized design reference.\nOriginal repository: ${r.repository}\nInspected source commit: ${r.commit}${r.variantRoute?'\nDesign route: '+r.variantRoute:''}\n\nStart a NEW independent repository for [my new project]. Adapt the reference using my own identity and content. Preserve applicable attribution and license notices. Do not modify the original repository, the Design Reference Library, Zyberlane production, or existing client projects. Inspect the source and dependencies before implementation; do not claim prototype integrations are production-ready.`;
}
