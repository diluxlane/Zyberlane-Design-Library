(function(){
  var h=document.documentElement; if(!h.classList.contains('intro'))return;
  var imgs=[].slice.call(document.images), go=false;
  function play(){ if(go)return; go=true;
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ h.classList.add('play');
      setTimeout(function(){ h.classList.remove('intro','play'); }, 2300); }); }); }
  Promise.all([document.fonts?document.fonts.ready:0].concat(imgs.map(function(i){return i.decode?i.decode().catch(function(){}):0}))).then(play);
  setTimeout(play,1200);
})();
(function(){
  var b=document.querySelector('.plus'),m=document.getElementById('menu');
  function items(){return [].slice.call(m.querySelectorAll('a')).filter(function(a){return a.offsetParent!==null;});}
  function isOpen(){return b.getAttribute('aria-expanded')==='true';}
  function set(o,focusBtn){ if(o===isOpen())return;
    b.setAttribute('aria-expanded',o); m.classList.toggle('open',o);
    if(o){ setTimeout(function(){var i=items(); if(i[0])i[0].focus({preventScroll:true});},30); }
    else if(focusBtn){ b.focus({preventScroll:true}); } }
  b.addEventListener('click',function(e){e.stopPropagation();set(!isOpen(),false);});
  m.addEventListener('click',function(e){ if(e.target.closest('a'))set(false,false); });
  document.addEventListener('click',function(e){if(!m.contains(e.target))set(false,false);});
  document.addEventListener('keydown',function(e){
    if(!isOpen())return;
    if(e.key==='Escape'){e.preventDefault();set(false,true);return;}
    var i=items(),k=i.indexOf(document.activeElement);
    if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();i[(k+1)%i.length].focus();}
    else if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();i[(k-1+i.length)%i.length].focus();}
    else if(e.key==='Tab'){ if(e.shiftKey&&k===0){e.preventDefault();set(false,true);} else if(!e.shiftKey&&k===i.length-1){e.preventDefault();set(false,true);} }
  });
})();
