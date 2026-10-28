const TYPE_ORDER=['Website','Hero Page','Interface / Dashboard','UI Page','Component','Motion / Animation','Typography','Data Visualization'];
const STATUS_ORDER=['Working','Partial','Unavailable'];
const CATEGORY_ALIASES={
  'Portfolio':'portfolio website personal site creative professional video editor video editing videographer filmmaker photographer editor designer developer showreel reel',
  'Creative Portfolio':'portfolio website creative professional video editor video editing videographer filmmaker photographer editor artist designer showreel reel',
  'Agency':'agency studio creative digital marketing branding web design website',
  'Business':'business company service corporate website',
  'Cinematic':'cinematic film filmmaker video editor video editing videographer production showreel',
  '3D/WebGL':'3d webgl interactive immersive animation motion experience',
  '3D/Product':'3d product showcase ecommerce interactive product website',
  'Experimental':'experimental interaction motion animation creative coding',
  'Editorial':'editorial magazine publication typography content website',
  'Landing Page':'landing page website marketing startup product service',
  'Hero Section':'hero page hero section above the fold landing hero website',
  'Component Study':'component ui element button card interaction pattern',
  'Dashboard':'dashboard admin interface web app workspace analytics',
  'Authentication UI':'login signup sign in registration authentication ui',
  'AI / SaaS':'ai saas software startup technology product website'
};
const TYPE_ALIASES={
  'Website':'website full website site web design landing page portfolio business agency ecommerce',
  'Hero Page':'hero hero page hero section above the fold website hero landing hero',
  'Interface / Dashboard':'dashboard interface admin web app workspace product ui',
  'UI Page':'ui page login signup authentication standalone screen',
  'Component':'component button card navigation footer pricing testimonial ui element pattern',
  'Motion / Animation':'motion animation transition scroll parallax interaction effect',
  'Typography':'typography font fonts text lettering type treatment',
  'Data Visualization':'chart graph graphs data visualization dataviz analytics'
};

export function normalizedReferenceType(r={}){
  if(r.referenceType)return r.referenceType;
  const categories=r.categories||[];
  const name=String(r.repo||r.name||'').toLowerCase();
  if(categories.includes('Hero Section')||/(^|[-_])hero([_-]|$)/.test(name))return 'Hero Page';
  if(categories.includes('Dashboard')||/(dashboard|workspace|admin|invoice|analytics)/.test(name))return 'Interface / Dashboard';
  if(categories.includes('Authentication UI')||/(login|signup|sign[-_]?in|auth)/.test(name))return 'UI Page';
  if(categories.includes('Component Study')||/(button|cards?|testimonial|pricing|footer|navbar|navigation|menu|tabs?|modal|tooltip|badge|accordion)/.test(name))return 'Component';
  if(/(motion|animation|transition|parallax|scroll[-_]?effect)/.test(name)&&!/(website|landing|portfolio|studio)/.test(name))return 'Motion / Animation';
  if(/(typography|font|text[-_]?effect|type[-_]?study)/.test(name))return 'Typography';
  if(/(chart|graph|dataviz|data[-_]?viz|visualization)/.test(name))return 'Data Visualization';
  return 'Website';
}

function searchAliases(r,type){
  return [TYPE_ALIASES[type]||'',...(r.categories||[]).map(c=>CATEGORY_ALIASES[c]||'')].join(' ');
}
function typeRank(r){const i=TYPE_ORDER.indexOf(normalizedReferenceType(r));return i<0?TYPE_ORDER.length:i;}
function statusRank(r){const i=STATUS_ORDER.indexOf(r.status);return i<0?STATUS_ORDER.length:i;}
function baseComparator(sort){
  if(sort==='name')return (a,b)=>a.title.localeCompare(b.title);
  if(sort==='ready')return (a,b)=>statusRank(a)-statusRank(b)||a.id.localeCompare(b.id);
  if(sort==='complexity')return (a,b)=>['Low','Medium','High'].indexOf(a.complexity)-['Low','Medium','High'].indexOf(b.complexity)||a.id.localeCompare(b.id);
  return (a,b)=>a.id.localeCompare(b.id);
}
function relevance(r,terms,phrase,type){
  const title=String(r.title||'').toLowerCase();
  const description=String(r.description||'').toLowerCase();
  const categories=(r.categories||[]).join(' ').toLowerCase();
  const tags=(r.tags||[]).join(' ').toLowerCase();
  const suitable=(r.suitableFor||[]).join(' ').toLowerCase();
  const aliases=searchAliases(r,type).toLowerCase();
  let score=0;
  if(phrase&&title.includes(phrase))score+=120;
  if(phrase&&categories.includes(phrase))score+=80;
  for(const term of terms){
    if(title.includes(term))score+=24;
    if(categories.includes(term))score+=18;
    if(tags.includes(term))score+=12;
    if(suitable.includes(term))score+=10;
    if(description.includes(term))score+=7;
    if(aliases.includes(term))score+=5;
  }
  return score;
}

export function searchReferences(references,{query='',category='All',status='All',savedOnly=false,saved=[],sort='id',referenceType='All'}={}) {
  const phrase=query.trim().toLowerCase().replace(/\s+/g,' ');
  const terms=phrase.split(/\s+/).filter(Boolean);
  const rows=references.map(r=>{
    const type=normalizedReferenceType(r);
    const haystack=[r.id,r.title,r.repo,r.creator,r.sourceOwner,r.description,r.framework,r.complexity,type,...(r.tags||[]),...(r.categories||[]),...(r.technologies||[]),...(r.suitableFor||[]),searchAliases(r,type)].filter(Boolean).join(' ').toLowerCase();
    return {r,type,haystack,score:terms.length?relevance(r,terms,phrase,type):0};
  }).filter(({r,type,haystack})=>{
    if(category!=='All'&&!(r.categories||[]).includes(category))return false;
    if(status!=='All'&&r.status!==status)return false;
    if(savedOnly&&!saved.includes(r.id))return false;
    if(!terms.length&&!savedOnly&&referenceType!=='All'&&type!==referenceType)return false;
    return terms.every(t=>haystack.includes(t));
  });
  const within=baseComparator(sort);
  rows.sort((a,b)=>terms.length?(typeRank(a.r)-typeRank(b.r)||b.score-a.score||within(a.r,b.r)):within(a.r,b.r));
  return rows.map(x=>x.r);
}

export function referencePrompt(r) {
  return `Use ${r.id} — ${r.title} as my authorized ${normalizedReferenceType(r).toLowerCase()} design reference.\nOriginal repository: ${r.repository}\nInspected source commit: ${r.commit}${r.variantRoute?'\nDesign route: '+r.variantRoute:''}\n\nStart a NEW independent repository for [my new project]. Adapt the reference using my own identity and content. Preserve applicable attribution and license notices. Do not modify the original repository, the Design Reference Library, Zyberlane production, or existing client projects. Inspect the source and dependencies before implementation; do not claim prototype integrations are production-ready.`;
}
