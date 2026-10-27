(() => {
  const root = document.documentElement;
  if (!root.classList.contains('entry-pending')) return;

  const animations = window.lumoEntryAnimations;
  const finish = window.finishLumoEntry;
  const reveal = (selector, from, delay, duration, easing) => {
    const element = document.querySelector(selector);
    if (!element) return;
    if (element.matches('.card, .hey')) {
      const bounds = element.getBoundingClientRect();
      if (bounds.top >= innerHeight || bounds.bottom <= 0) {
        element.classList.add('entry-skip');
        return;
      }
    }
    const to = { opacity: 1, translate: 'none' };
    if ('clipPath' in from) to.clipPath = 'inset(0 0 0 0)';
    animations.push(element.animate(
      [from, to],
      { delay, duration, easing, fill: 'forwards' }
    ));
  };

  const settle = 'cubic-bezier(.22, 1, .36, 1)';
  const soft = 'cubic-bezier(.2, .8, .2, 1)';

  // Establish the brand, then let the three headline lines lead the eye.
  reveal('.topbar', { opacity: 0, translate: '0 7px' }, 80, 500, soft);
  reveal('.hero h1 .l1', { opacity: 0, translate: '0 .18em', clipPath: 'inset(100% 0 0 0)' }, 210, 760, settle);
  reveal('.hero h1 .l2', { opacity: 0, translate: '0 .18em', clipPath: 'inset(100% 0 0 0)' }, 325, 760, settle);
  reveal('.hero h1 em', { opacity: 0, translate: '0 .18em', clipPath: 'inset(100% 0 0 0)' }, 440, 820, settle);

  // The banking interface assembles in its existing front-to-back order.
  reveal('.balance', { opacity: 0, translate: '0 12px' }, 670, 760, settle);
  reveal('.glass', { opacity: 0, translate: '0 12px' }, 840, 790, settle);
  reveal('.vcard', { opacity: 0, translate: '0 12px' }, 1030, 800, settle);

  reveal('.hero p', { opacity: 0, translate: '0 8px' }, 670, 560, soft);
  reveal('.cta', { opacity: 0, translate: '0 9px' }, 900, 590, settle);
  reveal('.perks', { opacity: 0 }, 1130, 430, soft);
  reveal('.hey', { opacity: 0, translate: '0 10px', clipPath: 'inset(100% 0 0 0)' }, 1230, 720, settle);

  Promise.allSettled(animations.map(animation => animation.finished)).then(finish);
  window.lumoEntryMedia = matchMedia('(prefers-reduced-motion: reduce)');
  window.lumoEntryMotionHandler = event => {
    if (event.matches) finish();
  };
  window.lumoEntryMedia.addEventListener('change', window.lumoEntryMotionHandler);
})();
