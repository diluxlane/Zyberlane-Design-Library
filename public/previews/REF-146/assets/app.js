(()=>{
  const root=document.documentElement;
  if(!root.classList.contains('intro-pending'))return;

  const animations=[];
  const curve='cubic-bezier(.22,1,.36,1)';
  const add=(element,from,to,delay,duration,easing=curve)=>{
    if(!element||!element.getClientRects().length)return;
    animations.push(element.animate([from,to],{delay,duration,easing,fill:'both'}));
  };
  const rise=(selector,delay,duration,distance=8)=>{
    const element=document.querySelector(selector);
    add(element,{opacity:0,transform:`translateY(${distance}px)`},{opacity:1,transform:'none'},delay,duration);
  };
  const settle=()=>{
    root.classList.remove('intro-pending');
    animations.forEach(animation=>animation.cancel());
    clearTimeout(window.talkieIntroFallback);
    motionPreference.removeEventListener?.('change',onPreferenceChange);
  };
  const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
  const onPreferenceChange=()=>{if(motionPreference.matches)settle()};
  motionPreference.addEventListener?.('change',onPreferenceChange);

  // Navigation establishes the frame without competing with the headline.
  rise('.brand',40,480,-6);
  document.querySelectorAll('.links li').forEach((item,index)=>
    add(item,{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'none'},150+index*55,420));
  rise('.menu-btn',200,430,-6);

  // The desktop lines reveal separately; the naturally wrapped mobile title
  // is treated as one mask so its responsive line breaks stay untouched.
  if(matchMedia('(max-width: 549.98px)').matches){
    add(document.querySelector('.copy h1'),
      {opacity:0,clipPath:'inset(0 0 100% 0)',transform:'translateY(10px)'},
      {opacity:1,clipPath:'inset(0 0 0 0)',transform:'none'},260,860);
  }else{
    document.querySelectorAll('.copy h1 span').forEach((line,index)=>
      add(line,{opacity:0,clipPath:'inset(0 0 100% 0)',transform:'translateY(12px)'},
        {opacity:1,clipPath:'inset(0 0 0 0)',transform:'none'},280+index*160,800));
  }
  rise('.copy p',720,570);
  document.querySelectorAll('.ctas .btn').forEach((button,index)=>
    add(button,{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'},1000+index*95,540));

  // The equalizer is foreground decoration; the background slices never move.
  add(document.querySelector('.eq'),{opacity:0},{opacity:1},850,650);
  rise('.person',880,850,14);
  rise('.agent',1360,650,10);
  rise('.chat',1490,680,10);

  Promise.all(animations.map(animation=>animation.finished.catch(()=>{}))).then(settle);
})();

(()=>{
  const btn=document.querySelector('.menu-btn'),sheet=document.getElementById('sheet');
  const items=()=>[...sheet.querySelectorAll('a')];
  const set=(open,{focus=true}={})=>{
    btn.setAttribute('aria-expanded',open);btn.setAttribute('aria-label',open?'Close menu':'Open menu');
    sheet.classList.toggle('open',open);
    if(open&&focus)requestAnimationFrame(()=>items()[0]?.focus());
  };
  btn.addEventListener('click',e=>{e.stopPropagation();set(btn.getAttribute('aria-expanded')!=='true',{focus:e.detail===0})});
  document.addEventListener('click',e=>{if(!sheet.contains(e.target))set(false)});
  sheet.addEventListener('click',e=>{if(e.target.closest('a'))set(false)});
  document.addEventListener('keydown',e=>{
    if(!sheet.classList.contains('open'))return;
    if(e.key==='Escape'){set(false);btn.focus();return}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const l=items(),i=l.indexOf(document.activeElement);
      l[(i+(e.key==='ArrowDown'?1:-1)+l.length)%l.length].focus()}
    if(e.key==='Tab'){const l=items();if(e.shiftKey&&document.activeElement===l[0]){e.preventDefault();btn.focus()}
      else if(!e.shiftKey&&document.activeElement===l[l.length-1]){set(false)}}
  });
})();
