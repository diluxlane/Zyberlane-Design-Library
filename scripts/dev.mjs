// Local QA mirrors the static filesystem and immutable asset rewrites on Vercel.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
const root=path.resolve('dist');
const config=JSON.parse(await readFile('vercel.json','utf8'));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf'};
createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');let name=decodeURIComponent(url.pathname);
  let file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
  try{const info=await stat(file);if(info.isDirectory())file=path.join(file,'index.html');const bytes=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);return;}catch{}
  const rule=config.rewrites.find(r=>r.source.includes(':path*')&&name.startsWith(r.source.split(':path*')[0]));
  if(rule){
   const prefix=rule.source.split(':path*')[0];const suffix=name.slice(prefix.length).split('/').map(encodeURIComponent).join('/');
   const upstream=await fetch(rule.destination.replace(':path*',suffix),{headers:req.headers.range?{Range:req.headers.range}:{},signal:AbortSignal.timeout(60000)});
   const headers={'Content-Type':mime[path.extname(name)]||upstream.headers.get('content-type')||'application/octet-stream','Cache-Control':'public, max-age=3600'};
   for(const key of ['content-range','accept-ranges','content-length'])if(upstream.headers.has(key))headers[key]=upstream.headers.get(key);
   res.writeHead(upstream.status,headers);if(upstream.body)Readable.fromWeb(upstream.body).pipe(res);else res.end();return;
  }
  res.writeHead(404,{'Content-Type':'text/html'});res.end(await readFile(path.join(root,'404.html')));
 }catch(error){res.writeHead(502,{'Content-Type':'text/plain'});res.end('Preview asset unavailable');console.error(error.message);}
}).listen(Number(process.env.PORT||(process.argv.includes('--port')?process.argv[process.argv.indexOf('--port')+1]:3000)),'0.0.0.0',()=>console.log('Local reference library ready'));
