// Saifee Lab v2 (bento): page behaviour. Open-now, fasting planner and WhatsApp forms live in ../shared/live.js.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  const menu = document.querySelector('[data-menu]');
  const links = document.getElementById('navlinks');
  menu.addEventListener('click', () => menu.setAttribute('aria-expanded', String(links.classList.toggle('is-open'))));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) { links.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); } });

  // Nav: hairline once scrolled, and the section you're in
  const nav = document.querySelector('[data-nav]');
  const navAs = [...links.querySelectorAll('a')];
  const secs = navAs.map((a) => document.querySelector(a.getAttribute('href')));
  const onScroll = () => {
    nav.classList.toggle('is-stuck', scrollY > 8);
    const mid = innerHeight * 0.45;
    let cur = -1;
    secs.forEach((s, i) => { const r = s.getBoundingClientRect(); if (r.top < mid && r.bottom > mid) cur = i; });
    navAs.forEach((a, i) => a.classList.toggle('is-active', i === cur));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Open-now tile: live.js writes "Open now · closes 8 pm"; split it across the two lines of the tile
  const status = document.querySelector('[data-open-now]');
  const label = document.querySelector('[data-open-label]');
  const dot = document.querySelector('[data-open-dot]');
  if (status && status.dataset.state) {
    const [a, b] = status.textContent.split(' · ');
    label.textContent = a;
    if (b) status.textContent = b.charAt(0).toUpperCase() + b.slice(1);
    dot.dataset.state = status.dataset.state;
  }

  // Report bars fill once the tile is on screen
  const report = document.querySelector('[data-report]');
  new IntersectionObserver((es, io) => {
    if (es[0].isIntersecting) { report.classList.add('is-live'); io.disconnect(); }
  }, { threshold: 0.4 }).observe(report);

  // Count-up numbers
  const countIO = new IntersectionObserver((es) => {
    for (const e of es) {
      if (!e.isIntersecting) continue;
      countIO.unobserve(e.target);
      if (reduce) continue;
      const el = e.target, end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / 1300);
        el.textContent = (end * (1 - Math.pow(1 - p, 3))).toFixed(dec);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((c) => countIO.observe(c));

  // Test finder
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
  const setCat = (c) => { cat = c; chips.forEach((o) => o.setAttribute('aria-pressed', String(o.dataset.cat === c))); };
  document.querySelector('[data-more]').addEventListener('click', expand);
  search.addEventListener('input', () => { expand(); filter(); });
  chips.forEach((c) => c.addEventListener('click', () => { setCat(c.dataset.cat); expand(); filter(); }));

  // Hero search and popular-test chips jump into the finder with the query filled in
  const jumpTo = (q) => {
    setCat('all');
    search.value = q;
    expand(); filter();
    document.getElementById('tests').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    setTimeout(() => search.focus({ preventScroll: true }), reduce ? 0 : 600);
  };
  document.querySelector('[data-hero-search]').addEventListener('submit', (e) => {
    e.preventDefault();
    jumpTo(e.currentTarget.elements.q.value.trim());
  });
  document.querySelectorAll('[data-jump]').forEach((b) => b.addEventListener('click', () => jumpTo(b.dataset.jump)));
  document.querySelector('[data-jump-pkg]').addEventListener('click', () => document.getElementById('pkg-full').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }));

  // Today's hours (Mumbai time)
  const day = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).getDay();
  document.querySelectorAll('[data-hours] li').forEach((li) => li.classList.toggle('is-today', li.dataset.days.split(',').includes(String(day))));

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
