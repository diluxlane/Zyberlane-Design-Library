import {readFile,writeFile} from 'node:fs/promises';

const file='src/app.js';
let content=await readFile(file,'utf8');
const replacements=[
  [
    'Websites and experiences by Gireesh Kumar Reddy, inspected for your next design study.',
    'Authorized website and interface references from multiple creators, inspected for your next design study.'
  ],
  [
    '<div><dt>Creator / source</dt><dd>Gireesh Kumar Reddy<br><a href="${esc(r.repository)}" ${external} class="inline-link">${esc(r.repo)} ↗</a></dd></div>',
    '<div><dt>Creator / source</dt><dd>${esc(r.creator||\'Gireesh Kumar Reddy\')}<br><a href="${esc(r.repository)}" ${external} class="inline-link">${esc(r.repo)} ↗</a></dd></div>'
  ],
  [
    '${catalogue.websiteRepositories} repositories contain website implementations. ${refs.length} accepted design entries include six independent concepts from one repository. Classification A means source appears deployable; it does not claim an independently successful build or production-ready integrations.',
    '${catalogue.websiteRepositories} repositories contain website implementations across the inspected reference sources. ${refs.length} accepted design entries are available in the library. Classification A means source appears deployable; it does not claim an independently successful build or production-ready integrations.'
  ]
];
let changed=false;
for(const [from,to] of replacements){if(content.includes(from)){content=content.replace(from,to);changed=true}else if(!content.includes(to)){throw new Error(`Expected UI text not found: ${from.slice(0,80)}`)}}
if(changed){await writeFile(file,content);console.log('Applied multi-source UI labels.')}else console.log('Multi-source UI labels already applied.');
