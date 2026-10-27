/* Run before the body is parsed so foreground content cannot flash. */
(function () {
  if (!Element.prototype.animate ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.documentElement.classList.add('entry-prep');
  // If the entrance script fails to load, reveal the complete page.
  window.entryRevealFallback = window.setTimeout(function () {
    document.documentElement.classList.remove('entry-prep');
  }, 4000);
})();
