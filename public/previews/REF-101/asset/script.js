(() => {
  const form  = document.getElementById('login');
  const email = document.getElementById('email');
  const pass  = document.getElementById('password');
  const eye   = form.querySelector('.eye');
  const login = form.querySelector('.btn-login');

  const update = () => {
    const ok = email.value.trim() !== '' && pass.value !== '';
    login.classList.toggle('ready', ok);
    login.setAttribute('aria-disabled', String(!ok));
  };
  email.addEventListener('input', update);
  pass.addEventListener('input', update);

  eye.addEventListener('click', () => {
    const show = pass.type === 'password';
    pass.type = show ? 'text' : 'password';
    eye.setAttribute('aria-pressed', String(show));
    eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    pass.focus({ preventScroll: true });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (login.getAttribute('aria-disabled') === 'true') return;
    if (!email.checkValidity()) { email.focus(); email.closest('.field').style.borderColor = 'rgba(255,110,110,.6)'; return; }
  });
  document.querySelectorAll('a[href="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
})();
