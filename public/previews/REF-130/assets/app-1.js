
(function(){
  var b=document.querySelector('.p_menu'),s=document.getElementById('sheet');
  function set(o){s.classList.toggle('open',o);b.setAttribute('aria-expanded',o);b.setAttribute('aria-label',o?'Close menu':'Open menu');}
  b.addEventListener('click',function(e){e.stopPropagation();set(!s.classList.contains('open'));});
  document.addEventListener('click',function(e){if(!s.contains(e.target))set(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false);});
  var radios=[].slice.call(document.querySelectorAll('.radio')),panel=document.querySelector('.panel'),cards=[].slice.call(panel.querySelectorAll('.card'));
  function mark(i){radios.forEach(function(o,j){var on=j===i;o.setAttribute('aria-selected',on);
      var c=o.querySelectorAll('circle');c[0].setAttribute('stroke',on?'rgba(255,255,255,.95)':'rgba(255,255,255,.28)');c[0].setAttribute('stroke-width',on?'1.8':'2.2');
      if(on&&c.length<2){var d=document.createElementNS('http://www.w3.org/2000/svg','circle');d.setAttribute('r','3.16');d.setAttribute('fill','#fff');o.querySelector('svg').appendChild(d);}
      if(!on&&c.length>1)c[1].remove();});}
  function strip(){return panel.scrollWidth>panel.clientWidth+2;}
  radios.forEach(function(r,i){r.addEventListener('click',function(){mark(i);
    if(strip())panel.scrollTo({left:cards[i].offsetLeft-cards[0].offsetLeft,behavior:'smooth'});});});
  var t;panel.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(function(){if(!strip())return;
    var x=panel.scrollLeft,best=0,bd=1e9;cards.forEach(function(c,i){var d=Math.abs(c.offsetLeft-cards[0].offsetLeft-x);if(d<bd){bd=d;best=i;}});
    if(panel.scrollLeft+panel.clientWidth>=panel.scrollWidth-4)best=cards.length-1;mark(best);},80);},{passive:true});
})();
