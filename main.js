// Saifee Lab: page behaviour. Open-now, fasting planner and WhatsApp forms live in shared/live.js.
(() => {
  // Test finder: search + category chips
  const search = document.querySelector('[data-test-search]');
  const chips = [...document.querySelectorAll('[data-cat].chip')];
  const tests = [...document.querySelectorAll('[data-tests] .test')];
  const empty = document.querySelector('[data-empty]');
  let cat = 'all';
  const filter = () => {
    const q = (search.value || '').trim().toLowerCase();
    let shown = 0;
    for (const t of tests) {
      const ok = (cat === 'all' || t.dataset.cat === cat) && (!q || t.textContent.toLowerCase().includes(q));
      t.hidden = !ok;
      if (ok) { shown++; t.classList.add('is-in'); }
    }
    empty.classList.toggle('is-on', shown === 0);
  };
  const more = document.querySelector('[data-more]');
  const expand = () => document.querySelector('[data-tests]').classList.remove('is-collapsed');
  more.addEventListener('click', expand);
  search.addEventListener('input', () => { expand(); filter(); });
  chips.forEach((c) => c.addEventListener('click', () => {
    cat = c.dataset.cat;
    expand();
    chips.forEach((o) => o.setAttribute('aria-pressed', String(o === c)));
    filter();
  }));

  // Mobile menu
  const btn = document.querySelector('[data-menu]');
  const nav = document.getElementById('nav');
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) { nav.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
  });

  // Header border once scrolled
  const header = document.querySelector('[data-header]');
  const onScroll = () => header.classList.toggle('is-stuck', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Highlight today's hours (Mumbai time) and colour the status dot
  const day = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).getDay();
  document.querySelectorAll('[data-hours] tr').forEach((tr) => tr.classList.toggle('is-today', tr.dataset.days.split(',').includes(String(day))));
  const status = document.querySelector('[data-open-now]');
  const dot = document.querySelector('[data-open-dot]');
  if (status && dot) dot.dataset.state = status.dataset.state || 'open';

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
