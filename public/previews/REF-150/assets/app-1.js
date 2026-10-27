
/* Flow mode: tell the backdrop where the open "scene" (spacer) sits so the
   ridge lands in it and the mist rises behind the lower content. */
(function(){
  var hero=document.querySelector('.hero'), gap=hero&&hero.querySelector('.hero__spacer');
  if(!hero||!gap) return;
  function sync(){
    var h=hero.getBoundingClientRect(), g=gap.getBoundingClientRect();
    if(!g.height) return;
    hero.style.setProperty('--s0',(g.top-h.top).toFixed(1)+'px');
    hero.style.setProperty('--s1',(g.bottom-h.top).toFixed(1)+'px');
  }
  if('ResizeObserver' in window) new ResizeObserver(sync).observe(hero);
  window.addEventListener('resize',sync,{passive:true});
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(sync);
  sync();
})();
