// Saifee Lab v2: page behaviour. Open-now, fasting planner and WhatsApp forms live in ../shared/live.js.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme toggle
  document.querySelector('[data-theme-toggle]').addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('saifee-theme', next); } catch (e) {}
  });

  // Mobile menu
  const menu = document.querySelector('[data-menu]');
  const links = document.getElementById('navlinks');
  menu.addEventListener('click', () => menu.setAttribute('aria-expanded', String(links.classList.toggle('is-open'))));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) { links.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); } });

  // Nav hides while scrolling down, returns on scroll up
  const wrap = document.querySelector('[data-navwrap]');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    wrap.classList.toggle('is-hidden', y > lastY && y > 300 && !links.classList.contains('is-open'));
    lastY = y;
  }, { passive: true });

  // Active section in nav
  const navAs = [...links.querySelectorAll('a')];
  const secs = navAs.map((a) => document.querySelector(a.getAttribute('href')));
  const spy = () => {
    const mid = innerHeight * 0.45;
    let cur = -1;
    secs.forEach((s, i) => { const r = s.getBoundingClientRect(); if (r.top < mid && r.bottom > mid) cur = i; });
    navAs.forEach((a, i) => a.classList.toggle('is-active', i === cur));
  };
  addEventListener('scroll', spy, { passive: true });
  spy();

  // Report card: markers slide into place once it is on screen
  const report = document.querySelector('[data-report]');
  setTimeout(() => report.classList.add('is-live'), 150);

  // Count-up numbers
  const counters = document.querySelectorAll('[data-count]');
  const countIO = new IntersectionObserver((es) => {
    for (const e of es) {
      if (!e.isIntersecting) continue;
      countIO.unobserve(e.target);
      const el = e.target, end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
      if (reduce) continue;
      const t0 = performance.now(), dur = 1400;
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur), v = end * (1 - Math.pow(1 - p, 3));
        el.textContent = v.toFixed(dec);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }, { threshold: 0.6 });
  counters.forEach((c) => countIO.observe(c));

  // Test finder: search + category chips + "show all" on phones
  const search = document.querySelector('[data-test-search]');
  const chips = [...document.querySelectorAll('.chip[data-cat]')];
  const grid = document.querySelector('[data-tests]');
  const tests = [...grid.querySelectorAll('.test')];
  const empty = document.querySelector('[data-empty]');
  let cat = 'all';
  const expand = () => grid.classList.remove('is-collapsed');
  const filter = () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    for (const t of tests) {
      const ok = (cat === 'all' || t.dataset.cat === cat) && (!q || t.textContent.toLowerCase().includes(q));
      t.hidden = !ok;
      if (ok) { shown++; t.classList.add('is-in'); }
    }
    empty.classList.toggle('is-on', shown === 0);
  };
  document.querySelector('[data-more]').addEventListener('click', expand);
  search.addEventListener('input', () => { expand(); filter(); });
  chips.forEach((c) => c.addEventListener('click', () => {
    cat = c.dataset.cat; expand();
    chips.forEach((o) => o.setAttribute('aria-pressed', String(o === c)));
    filter();
  }));

  // Today's hours (Mumbai time) and the status dot
  const day = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).getDay();
  document.querySelectorAll('[data-hours] tr').forEach((tr) => tr.classList.toggle('is-today', tr.dataset.days.split(',').includes(String(day))));
  const status = document.querySelector('[data-open-now]');
  const dot = document.querySelector('[data-open-dot]');
  if (status && dot) dot.dataset.state = status.dataset.state || 'open';

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
