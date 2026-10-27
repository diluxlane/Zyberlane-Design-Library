(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var root = document.documentElement;
  root.classList.add('intro-pending');

  var fallback;
  function finish() {
    root.classList.remove('intro-pending');
    window.clearTimeout(fallback);
  }

  // The CSS sequence ends at 2.25s. Remove its opt-in class after it settles,
  // with an independent fallback if document readiness never fires.
  document.addEventListener('DOMContentLoaded', function () {
    window.setTimeout(finish, 2400);
  }, { once: true });
  fallback = window.setTimeout(finish, 8000);
})();
