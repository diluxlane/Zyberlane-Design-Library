/* A single, two-second opening sequence. The artwork never participates. */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('entrance-pending')) return;

  var motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  var animations = [];
  var fontWait;
  var started = false;
  var finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(fontWait);
    clearTimeout(window.__clawdEntranceFallback);
    root.classList.remove('entrance-pending');
    animations.forEach(function (animation) { animation.cancel(); });
    if (motionPreference.removeEventListener) motionPreference.removeEventListener('change', onPreferenceChange);
    else if (motionPreference.removeListener) motionPreference.removeListener(onPreferenceChange);
  }

  function onPreferenceChange() {
    if (motionPreference.matches) finish();
  }

  if (motionPreference.addEventListener) motionPreference.addEventListener('change', onPreferenceChange);
  else if (motionPreference.addListener) motionPreference.addListener(onPreferenceChange);

  if (!Element.prototype.animate || motionPreference.matches) {
    finish();
    return;
  }

  function cue(element, first, last, at, duration, easing) {
    if (!element) return;
    animations.push(element.animate([first, last], {
      delay: at,
      duration: duration,
      easing: easing,
      fill: 'both'
    }));
  }

  function start() {
    if (started || finished) return;
    started = true;
    clearTimeout(fontWait);

    var soft = 'cubic-bezier(.22,1,.36,1)';
    var type = 'cubic-bezier(.16,1,.3,1)';
    var settle = 'cubic-bezier(.2,.75,.25,1)';
    var subtleIn = { opacity: 0, transform: 'translate3d(0,8px,0)' };
    var subtleOut = { opacity: 1, transform: 'none' };

    cue(document.querySelector('.brand'), subtleIn, subtleOut, 60, 520, soft);
    document.querySelectorAll('.nav li').forEach(function (item, index) {
      cue(item, subtleIn, subtleOut, 160 + index * 80, 450, soft);
    });
    cue(document.querySelector('.cta-ghost'), subtleIn, subtleOut, 360, 500, soft);
    cue(document.querySelector('.burger'), subtleIn, subtleOut, 160, 420, soft);

    document.querySelectorAll('.headline span').forEach(function (line, index) {
      cue(line,
        { clipPath: 'inset(0 0 100% 0)', transform: 'translate3d(0,.18em,0)' },
        { clipPath: 'inset(0 0 0% 0)', transform: 'none' },
        180 + index * 140, 820, type);
    });

    cue(document.querySelector('.pitch'),
      { opacity: 0, transform: 'translate3d(0,12px,0)' },
      { opacity: 1, transform: 'none' }, 640, 680, soft);
    cue(document.querySelector('.cta-row'),
      { opacity: 0, transform: 'translate3d(0,12px,0)' },
      { opacity: 1, transform: 'none' }, 980, 600, soft);
    cue(document.querySelector('.tagline'),
      { opacity: 0, transform: 'translate3d(0,12px,0)' },
      { opacity: 1, transform: 'none' }, 1120, 650, soft);
    document.querySelectorAll('.stat').forEach(function (card, index) {
      cue(card,
        { opacity: 0, transform: 'translate3d(0,12px,0) scale(.985)' },
        { opacity: 1, transform: 'none' },
        1200 + index * 110, 680, settle);
    });

    Promise.all(animations.map(function (animation) {
      return animation.finished.catch(function () {});
    })).then(finish, finish);
  }

  if (document.fonts && document.fonts.ready) {
    fontWait = setTimeout(start, 400);
    document.fonts.ready.then(start, start);
  } else {
    start();
  }
})();
