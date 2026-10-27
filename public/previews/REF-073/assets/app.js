/* Mobile menu — only visible below the mobile breakpoint; CSS owns layout. */
(function(){
  var bar=document.querySelector('.topbar'),btn=bar&&bar.querySelector('.burger'),menu=document.getElementById('site-menu');
  if(!btn||!menu)return;
  var isOpen=function(){return bar.hasAttribute('data-open')};
  function setOpen(open,moveFocus){
    if(open===isOpen())return;
    bar.toggleAttribute('data-open',open);
    btn.setAttribute('aria-expanded',String(open));
    btn.setAttribute('aria-label',open?'Close menu':'Open menu');
    if(open&&moveFocus){var first=menu.querySelector('a');if(first)first.focus({preventScroll:true})}
  }
  btn.addEventListener('click',function(e){setOpen(!isOpen(),e.detail===0)});  /* keyboard activation moves focus in */
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&isOpen()){setOpen(false);btn.focus()}});
  document.addEventListener('pointerdown',function(e){if(isOpen()&&!bar.contains(e.target))setOpen(false)});
  menu.addEventListener('click',function(e){if(e.target.closest('a'))setOpen(false)});
  bar.addEventListener('focusout',function(e){if(isOpen()&&e.relatedTarget&&!bar.contains(e.relatedTarget))setOpen(false)});
  var mq=window.matchMedia('(max-width:599.98px)');
  var onChange=function(){if(!mq.matches)setOpen(false)};
  mq.addEventListener?mq.addEventListener('change',onChange):mq.addListener(onChange);
})();
