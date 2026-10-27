/* Desktop stage (locked): authored at 1374x1145 design px and scaled with CSS zoom to the
   viewport width; rows stretch so the stage always reaches the bottom edge.
   Every narrower or portrait viewport is laid out by the CSS media queries above —
   this script does nothing there. */
(function(){
  var root=document.documentElement, mq=window.matchMedia('(min-width:1120px) and (min-aspect-ratio:1/1)');
  function fit(){
    if(!mq.matches){ root.style.removeProperty('--k'); root.style.removeProperty('--stage-h'); return; }
    var k=root.clientWidth/1374;
    root.style.setProperty('--k', k);
    root.style.setProperty('--stage-h', Math.max(1145, window.innerHeight/k)+'px');
  }
  fit();
  window.addEventListener('resize', fit, {passive:true});
  if (mq.addEventListener) mq.addEventListener('change', fit);
})();

/* One opening composition. Each foreground group joins the same timeline;
   all Web Animations are cancelled after their final frame so the authored
   styles alone define the resting page. */
(function () {
  const root = document.documentElement;
  if (!root.classList.contains('entry-prep')) return;

  const steps = [
    // The connected integration establishes the first point of focus.
    ['.c1 .row.on',    80, 720, 'panel'],
    ['.c1 .row.r2',   330, 500, 'support'],
    ['.c1 .row.r3',   420, 480, 'support'],
    ['.c1 .row.r4',   500, 460, 'support'],
    ['.c1 .foot .ico',430, 420, 'icon'],
    ['.c1 .foot h3', 500, 660, 'title'],
    ['.c1 .foot p',  700, 480, 'support'],

    // The second dashboard builds from its main table to its overlays.
    ['.c2 .panel',    280, 780, 'panel'],
    ['.c2 .pill',     630, 540, 'mini'],
    ['.c2 .rate',     670, 700, 'panel'],
    ['.c2 .foot .ico',720, 420, 'icon'],
    ['.c2 .foot h3', 790, 660, 'title'],
    ['.c2 .foot p', 1000, 480, 'support'],

    // The two lower cards complete the grid. Their light stays still.
    ['.c3 .bar',      820, 740, 'panel'],
    ['.c3 .foot .ico',1060,420, 'icon'],
    ['.c3 .foot h3',1130,660, 'title'],
    ['.c3 .foot p', 1330,480, 'support'],
    ['.c4 .box',      850, 820, 'panel'],
    ['.c4 .menu',    1110,660, 'mini'],
    ['.c4 .foot .ico',1300,420, 'icon'],
    ['.c4 .foot h3',1370,660, 'title'],
    ['.c4 .foot p', 1550,480, 'support']
  ];

  const easing = 'cubic-bezier(.22, 1, .36, 1)';
  let started = false;
  let deadline;

  function inOpeningViewport(element) {
    const rect = element.getBoundingClientRect();
    const card = element.closest('.card').getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0 &&
      rect.left < window.innerWidth && rect.right > 0 &&
      card.top < window.innerHeight && card.bottom > 0;
  }

  function keyframes(kind, opacity) {
    if (kind === 'title') return [
      { opacity: 0, transform: 'translate3d(0, 10px, 0)', clipPath: 'inset(0 0 100% 0)' },
      { opacity, transform: 'none', clipPath: 'inset(0 0 0 0)' }
    ];
    if (kind === 'icon') return [{ opacity: 0 }, { opacity }];
    const offset = kind === 'panel' ? 10 : kind === 'mini' ? 6 : 7;
    const scale = kind === 'panel' ? ' scale(.985)' : kind === 'mini' ? ' scale(.99)' : '';
    return [
      { opacity: 0, transform: `translate3d(0, ${offset}px, 0)${scale}` },
      { opacity, transform: 'none' }
    ];
  }

  function start() {
    if (started) return;
    started = true;
    window.clearTimeout(deadline);
    window.clearTimeout(window.entryRevealFallback);
    delete window.entryRevealFallback;

    // Style measurement and animation setup happen in one task, before paint.
    root.classList.remove('entry-prep');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const animations = [];
    try {
      for (const [selector, delay, duration, kind] of steps) {
        const element = document.querySelector(selector);
        if (!element || !inOpeningViewport(element)) continue;
        const opacity = getComputedStyle(element).opacity;
        animations.push(element.animate(keyframes(kind, opacity), {
          delay, duration, easing, fill: 'backwards'
        }));
      }
    } catch (error) {
      animations.forEach(animation => animation.cancel());
      return;
    }

    Promise.all(animations.map(animation => animation.finished.catch(() => {})))
      .then(() => animations.forEach(animation => animation.cancel()));
  }

  deadline = window.setTimeout(start, 900);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start, start);
  else start();
})();
