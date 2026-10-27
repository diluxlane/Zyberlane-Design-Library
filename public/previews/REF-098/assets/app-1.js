
(()=>{
/* ---------------- data ---------------- */
const ICONS={
  sitemap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2.6" width="6" height="5.4" rx=".6"/><rect x="2.8" y="16" width="6" height="5.4" rx=".6"/><rect x="15.2" y="16" width="6" height="5.4" rx=".6"/><path d="M12 8v4M5.8 16v-2.4a1.6 1.6 0 0 1 1.6-1.6h9.2a1.6 1.6 0 0 1 1.6 1.6V16"/></svg>',
  pen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19.2 19.2 12l2.6 2.6-7.2 7.2z"/><path d="m17.8 13.2-1.4-7L3.2 2.8l3.4 13.2 7 1.4z"/><path d="m3.2 2.8 7.6 7.6"/><circle cx="12.2" cy="11.8" r="2"/></svg>',
  palette:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.5a9.5 9.5 0 1 1 9.5-9.5c0 2.6-2.1 3.8-4.2 3.8h-2a1.9 1.9 0 0 0-1.4 3.2 1.5 1.5 0 0 1-1.1 2.5Z"/><circle cx="7.6" cy="11" r="1.2" fill="currentColor"/><circle cx="10.6" cy="6.8" r="1.2" fill="currentColor"/><circle cx="15.6" cy="7.6" r="1.2" fill="currentColor"/></svg>',
  code:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16"/></svg>'
};
const SERVICES=[
  {id:'ux',title:'UX - Start',sub:'Ux Strategy Workshop',rate:450,icon:'sitemap',tone:'blue'},
  {id:'web',title:'Web Design',sub:'Landing Page Design',rate:600,icon:'pen',tone:'violet'},
  {id:'brand',title:'Branding',sub:'Brand Asset Kit',rate:300,icon:'palette',tone:'amber'},
  {id:'dev',title:'Development',sub:'Front-end Build',rate:800,icon:'code',tone:'green'}
];
const CLIENTS=[
  {name:'Billora',email:'hraccount.billora@gmail.com'},
  {name:'Northwind Studio',email:'accounts@northwind.studio'},
  {name:'Kestrel Labs',email:'finance@kestrellabs.io'}
];
const PROJECTS=['Website Redesign Sprint','Mobile App MVP','Brand Refresh 2026','Design System Audit'];
const CURRENCIES={USD:'$',EUR:'€',GBP:'£',INR:'₹'};

const state={
  number:'INV -039520P', client:0, issue:'2026-06-27', due:'2026-07-10', project:PROJECTS[0], preview:true,
  items:[
    {service:'ux',rate:450,qty:2,tax:10,currency:'USD'},
    {service:'web',rate:600,qty:1,tax:10,currency:'USD'},
    {service:'brand',rate:300,qty:3,tax:10,currency:'USD'}
  ]
};

/* ---------------- helpers ---------------- */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const svc=id=>SERVICES.find(s=>s.id===id)||SERVICES[0];
const fmtDate=iso=>{const [y,m,d]=iso.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})};
const money=(n,cur='USD')=>(CURRENCIES[cur]||'$')+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const lineTotal=it=>it.rate*it.qty*(1+it.tax/100);
const opts=(list,sel)=>list.map(([v,l])=>`<option value="${v}"${String(v)===String(sel)?' selected':''}>${l}</option>`).join('');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------------- static selects ---------------- */
$('#billTo').innerHTML=opts(CLIENTS.map((c,i)=>[i,`${c.name} — ${c.email}`]),state.client);
$('#project').innerHTML=opts(PROJECTS.map(p=>[p,p]),state.project);
$('#invNo').value=state.number; $('#issue').value=state.issue; $('#due').value=state.due;

/* ---------------- render ---------------- */
const tpl=$('#itemTpl');
function renderItems(){
  const host=$('#items'); host.textContent='';
  state.items.forEach((it,i)=>{
    const s=svc(it.service), n=tpl.content.firstElementChild.cloneNode(true);
    n.dataset.i=i;
    $('.item-no',n).textContent=String(i+1).padStart(2,'0');
    const ico=$('.svc-ico',n); ico.className='svc-ico tone-'+s.tone; ico.innerHTML=ICONS[s.icon];
    $('.svc-title',n).textContent=s.title; $('.svc-sub',n).textContent=s.sub;
    $('[data-f=service]',n).innerHTML=opts(SERVICES.map(x=>[x.id,`${x.title} — ${x.sub}`]),it.service);
    $('[data-f=currency]',n).innerHTML=opts(Object.keys(CURRENCIES).map(c=>[c,c]),it.currency);
    $('.cur-v',n).textContent=it.currency;
    $('[data-f=rate]',n).value=money(it.rate,it.currency);
    $('[data-f=qty]',n).innerHTML=opts(Array.from({length:20},(_,k)=>[k+1,k+1]),it.qty);
    $('.qty-v',n).textContent=it.qty;
    $('[data-f=tax]',n).value=it.tax+'%';
    host.appendChild(n);
  });
}
function renderPreview(){
  const c=CLIENTS[state.client], out={number:state.number,issue:fmtDate(state.issue),due:fmtDate(state.due),project:state.project,billName:c.name,billEmail:c.email};
  const cur=state.items[0]?.currency||'USD';
  out.subtotal=money(state.items.reduce((a,it)=>a+lineTotal(it),0),cur);
  $$('[data-out]').forEach(el=>{const k=el.dataset.out;if(k in out)el.textContent=out[k]});
  $('#lines').innerHTML=state.items.map(it=>{const s=svc(it.service);return `<div class="t-row t-line"><div class="name"><div class="t">${esc(s.title)}</div><div class="s">${esc(s.sub)}</div></div><span class="c qty">${it.qty}</span><span></span><span class="c">${money(it.rate,it.currency)}</span><span class="c tax">${it.tax}%</span><span class="c tot">${money(lineTotal(it),it.currency)}</span></div>`}).join('');
}
const render=()=>{renderItems();renderPreview()};

/* ---------------- events ---------------- */
document.addEventListener('input',e=>{
  const b=e.target.dataset.bind; if(b==='number'){state.number=e.target.value;renderPreview()}
});
document.addEventListener('change',e=>{
  const t=e.target, b=t.dataset.bind;
  if(b){ if(b==='client')state.client=+t.value; else if(b==='issue'||b==='due'){if(t.value)state[b]=t.value} else if(b==='project')state.project=t.value; renderPreview(); return }
  const f=t.dataset.f, row=t.closest('.item'); if(!f||!row)return;
  const it=state.items[+row.dataset.i];
  if(f==='service'){it.service=t.value;it.rate=svc(t.value).rate}
  else if(f==='currency')it.currency=t.value;
  else if(f==='qty')it.qty=+t.value;
  else if(f==='rate'){const v=parseFloat(t.value.replace(/[^\d.]/g,''));if(!isNaN(v))it.rate=v}
  else if(f==='tax'){const v=parseFloat(t.value.replace(/[^\d.]/g,''));if(!isNaN(v))it.tax=Math.min(100,Math.max(0,v))}
  render();
});
document.addEventListener('focusin',e=>{const el=e.target,f=el.dataset.f;if(f!=='rate'&&f!=='tax')return;const it=state.items[+el.closest('.item').dataset.i];el.value=f==='rate'?it.rate:it.tax;el.select()});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.target.dataset.f==='rate'||e.target.dataset.f==='tax'))e.target.blur()});
document.addEventListener('focusout',e=>{const f=e.target.dataset.f;if(f==='rate'||f==='tax')e.target.dispatchEvent(new Event('change',{bubbles:true}))});
$$('input[type=date]').forEach(el=>el.addEventListener('click',()=>{try{el.showPicker()}catch(_){}}));
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act]'); if(!a)return;
  if(a.dataset.act==='remove'){state.items.splice(+a.closest('.item').dataset.i,1);render()}
  if(a.dataset.act==='show')togglePreview();
});
$('#addItem').addEventListener('click',()=>{
  const used=new Set(state.items.map(i=>i.service)), s=SERVICES.find(x=>!used.has(x.id))||SERVICES[0];
  state.items.push({service:s.id,rate:s.rate,qty:1,tax:10,currency:state.items[0]?.currency||'USD'});
  render(); const last=$('#items').lastElementChild; last&&last.scrollIntoView({behavior:'smooth',block:'nearest'});
});
function togglePreview(){state.preview=!state.preview;$('#app').classList.toggle('no-preview',!state.preview);$('#togglePreview').textContent=state.preview?'Hide Preview':'Show Preview'}
$('#togglePreview').addEventListener('click',togglePreview);
const toast=msg=>{const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),2200)};
$('#saveDraft').addEventListener('click',()=>toast('Draft saved'));
$('#sendInvoice').addEventListener('click',()=>toast(`${state.number} sent to ${CLIENTS[state.client].email}`));

/* ---------------- viewport fitting ---------------- */
const app=$('#app'), root=document.documentElement, W=1490, H=1056;
const hasZoom=CSS.supports('zoom','2');
function fit(){
  const vv=window.visualViewport, w=Math.round(vv?vv.width*vv.scale:innerWidth)||innerWidth, h=innerHeight;
  const compact = w<900 || (w<1100 && h/w>1.15);
  root.classList.toggle('compact',compact); root.classList.toggle('scaled',!compact);
  if(compact){app.style.cssText='';return}
  const s=Math.min(innerWidth/W, h/H), cw=innerWidth/s, ch=h/s;
  if(hasZoom){app.style.cssText=`zoom:${s};width:${cw}px;height:${ch}px`}
  else{app.style.cssText=`transform:scale(${s});width:${cw}px;height:${ch}px`}
}
addEventListener('resize',fit); window.visualViewport&&visualViewport.addEventListener('resize',fit);
fit(); render();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
})();
