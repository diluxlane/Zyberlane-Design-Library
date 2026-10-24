import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
export async function restoreBinaryAssets(root,output){
 const manifest=JSON.parse(await readFile(path.join(root,'data/binary-assets.json'),'utf8'));
 for(const file of manifest){
  if(file.output.split('/').includes('..')||!file.source.startsWith('encoded-assets/'))throw new Error('Invalid encoded asset path');
  const bytes=Buffer.from(await readFile(path.join(root,file.source),'utf8'),'base64');
  if(bytes.length!==file.bytes||createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw new Error('Binary asset integrity mismatch: '+file.output);
  const target=path.join(output,file.output);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,bytes);
 }
 console.log(`Restored ${manifest.length} exact binary assets with SHA-256 verification.`);
}
