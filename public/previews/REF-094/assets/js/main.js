(function(){
  var b=document.querySelector('.burger'),r=document.documentElement,first=document.querySelector('.nav a');
  function set(o){
    r.classList.toggle('menu-open',o);b.setAttribute('aria-expanded',o);b.setAttribute('aria-label',o?'Close menu':'Open menu');
    if(o&&first){setTimeout(function(){first.focus({preventScroll:true})},50)}else if(!o&&document.activeElement&&document.activeElement.closest('.nav,.btn-top')){b.focus({preventScroll:true})}
  }
  b.addEventListener('click',function(){set(!r.classList.contains('menu-open'))});
  document.querySelectorAll('.nav a,.btn-top').forEach(function(a){a.addEventListener('click',function(){set(false)})});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&r.classList.contains('menu-open'))set(false)});
  matchMedia('(min-width:1000px) and (min-height:640px) and (min-aspect-ratio:11/10)').addEventListener('change',function(m){if(m.matches)set(false)});
})();
