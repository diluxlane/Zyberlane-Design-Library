(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const root = document.documentElement;
  root.classList.add("entry-motion");
  window.setTimeout(() => root.classList.remove("entry-motion"), 2250);
})();
