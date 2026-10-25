// Change URL values, preserving regex literals, SVG closing tags and path delimiters.
export function rewritePreviewPaths(content,snapshot){
 const base=`/previews/${snapshot.id}/`;
 const tops=new Set([...snapshot.topNames,...snapshot.topNames.map(x=>x.replace(/\.html$/,''))]);
 function prefix(url,allowRoot=false){
  if(!url.startsWith('/')||url.startsWith('//')||(!allowRoot&&url==='/'))return url;
  let first=url.slice(1).split('/')[0].split('?')[0].split('#')[0];
  try{first=decodeURIComponent(first);}catch{return url;}
  if((allowRoot&&url==='/')||tops.has(first)||url.startsWith('/'+snapshot.repo+'/')){
   const relative=url.startsWith('/'+snapshot.repo+'/')?url.slice(snapshot.repo.length+2):url.slice(1);
   return base+relative;
  }
  return url;
 }
 content=content.replace(/(["'`])(\/(?!\/)[^"'`<>\\\r\n]*)\1/g,(match,quote,url)=>quote+prefix(url)+quote);
 content=content.replace(/(\b(?:href|src|poster|data-src|data-poster)\s*=\s*)(["'])(\/(?!\/)[^"'<>]*)\2/g,(match,attribute,quote,url)=>attribute+quote+prefix(url,true)+quote);
 content=content.replace(/(\burl\(\s*)(\/(?!\/)[^"'()\s]+)(\s*\))/g,(match,before,url,after)=>before+prefix(url)+after);
 return content;
}
