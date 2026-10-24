import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

// Original source is restored read-only at the pinned commit, not maintained as
// hundreds of duplicated application components or a separate Git history.
export async function preparePreviews(root,output){
 const snapshots=JSON.parse(await readFile(path.join(root,'data/preview-snapshots.json'),'utf8'));
 const tasks=snapshots.flatMap(s=>s.files.map(file=>({snapshot:s,file})));
 let cursor=0,downloaded=0;
 async function original(s,file){
  const cache=path.join(root,'.preview-cache',s.commit,file.path);
  let bytes;
  try{bytes=await readFile(cache);}catch{
   const url=`https://raw.githubusercontent.com/gireeshkumarreddy/${encodeURIComponent(s.repo)}/${s.commit}/${file.path.split('/').map(encodeURIComponent).join('/')}`;
   let response;
   for(let attempt=0;attempt<2;attempt++){
    try{response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(response.ok)break;}catch(error){if(attempt===1)throw error;}
   }
   if(!response?.ok)throw new Error(`${s.id}: source download failed (${response?.status}) for ${file.path}`);
   bytes=Buffer.from(await response.arrayBuffer());downloaded++;
   await mkdir(path.dirname(cache),{recursive:true});await writeFile(cache,bytes);
  }
  const sha=createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if(sha!==file.sha)throw new Error(`${s.id}: source integrity mismatch for ${file.path}`);
  return bytes.toString('utf8');
 }
 await Promise.all(Array.from({length:10},async()=>{
  while(cursor<tasks.length){
   const {snapshot:s,file}=tasks[cursor++];
   if(!/^[a-f0-9]{40}$/.test(s.commit)||file.relative.startsWith('.')||file.relative.split('/').includes('..'))throw new Error('Invalid preview manifest path');
   let content=await original(s,file);const base=`/previews/${s.id}/`;
   const tops=new Set([...s.topNames,...s.topNames.map(x=>x.replace(/\.html$/,''))]);
   content=content.replace(/(["'`(=])\/(?!\/)([^"'`)\s<>]*)/g,(match,prefix,url)=>{
    let first=url.split('/')[0].split('?')[0].split('#')[0];
    try{first=decodeURIComponent(first);}catch{return match;}
    if(!url||tops.has(first)||url.startsWith(s.repo+'/'))return prefix+base+(url.startsWith(s.repo+'/')?url.slice(s.repo.length+1):url);
    return match;
   });
   if(file.relative.endsWith('.html'))content=content.replace(/<base\b[^>]*>/gi,'').replace(/(<head\b[^>]*>)/i,`$1\n<base href="${base}">`);
   const destination=path.join(output,'previews',s.id,file.relative);await mkdir(path.dirname(destination),{recursive:true});await writeFile(destination,content);
  }
 }));
 for(const s of snapshots){
  const directory=path.join(output,'previews',s.id);
  if(s.repo==='hidden'){
   await writeFile(path.join(directory,'firebase-config.js'),'export const firebaseConfig = {};\n');
   await writeFile(path.join(directory,'maps-config.js'),'export const googleMaps = { apiKey: "", mapId: "" };\n');
  }
  await writeFile(path.join(directory,'SOURCE.md'),`# Original reference\n\nCreator: Gireesh Kumar Reddy\nRepository: https://github.com/gireeshkumarreddy/${s.repo}\nCommit: ${s.commit}\n\nInternal authorized design study. Existing source attribution and notices are retained.\n\n${s.compatibilityNotes.map(x=>'- '+x).join('\n')}\n`);
 }
 console.log(`Prepared ${tasks.length} pinned source files (${downloaded} downloads) across ${snapshots.length} static previews.`);
}
