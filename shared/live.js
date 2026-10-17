// Saifee Lab: "open now" line and the fasting planner. Hours are the lab's Google listing.
// Mon–Sat 7:30–20:00, Sun 7:30–18:00, all in Mumbai time.
(() => {
  const WA = '917304398073';
  const OPEN = 7.5;
  const close = (day) => (day === 0 ? 18 : 20);
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Mumbai wall-clock as a plain Date whose getHours()/getDay() read IST, whatever the visitor's zone.
  const istNow = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hrs = (d) => d.getHours() + d.getMinutes() / 60;
  const fmt = (h) => {
    const H = Math.floor(h), M = Math.round((h - H) * 60);
    const h12 = ((H + 11) % 12) + 1;
    return `${h12}${M ? ':' + String(M).padStart(2, '0') : ''} ${H < 12 ? 'am' : 'pm'}`;
  };
  const dayName = (d, now) => {
    const diff = Math.round((new Date(d).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / 864e5);
    return diff === 0 ? 'today' : diff === 1 ? 'tomorrow' : DAYS[d.getDay()];
  };

  // "Open now" lines
  const now = istNow();
  const h = hrs(now);
  const isOpen = h >= OPEN && h < close(now.getDay());
  let status;
  if (isOpen) status = `Open now · closes ${fmt(close(now.getDay()))}`;
  else status = `Closed now · opens 7:30 am ${h < OPEN ? 'today' : 'tomorrow'}`;
  document.querySelectorAll('[data-open-now]').forEach((el) => {
    el.textContent = status;
    el.dataset.state = isOpen ? 'open' : 'closed';
  });

  // Fasting planner: first opening window that falls inside the fasting window.
  // ponytail: walks day by day for a week; holidays ("hours might differ") are not modelled.
  function plan(mealHHMM, fastHours) {
    const now = istNow();
    const [mh, mm] = mealHHMM.split(':').map(Number);
    const meal = new Date(now);
    meal.setHours(mh, mm, 0, 0);
    // A meal time later than now means "tonight"; earlier means "already eaten today";
    // more than 12 hours ahead (21:00 seen at 6 am) means last night.
    if (meal - now > 12 * 36e5) meal.setDate(meal.getDate() - 1);
    const from = new Date(Math.max(meal.getTime() + fastHours * 36e5, now.getTime()));
    const until = fastHours ? new Date(meal.getTime() + 14 * 36e5) : null;
    for (let i = 0; i < 8; i++) {
      const day = new Date(from);
      day.setDate(day.getDate() + i);
      const o = new Date(day); o.setHours(7, 30, 0, 0);
      const c = new Date(day); c.setHours(close(day.getDay()), 0, 0, 0);
      const start = new Date(Math.max(o, i === 0 ? from : o));
      const end = until ? new Date(Math.min(c, until)) : c;
      if (start < end) return { start, end, now };
      if (until && o > until) return { start: null, now };
    }
    return { start: null, now };
  }

  document.querySelectorAll('[data-fast]').forEach((form) => {
    const out = form.querySelector('[data-fast-out]');
    const book = form.querySelector('[data-fast-book]');
    const render = () => {
      const fast = Number(form.elements.test.value);
      const label = form.elements.test.selectedOptions[0].dataset.name;
      const r = plan(form.elements.meal.value || '21:00', fast);
      let text, msg;
      if (!r.start) {
        text = `That fast would run past 14 hours before we open. Eat a little later, or ask for an early home visit.`;
        msg = `Hi Saifee Lab, I'd like an early-morning home visit for a ${label}.`;
      } else {
        const when = dayName(r.start, r.now);
        text = fast
          ? `Come ${when} between ${fmt(hrs(r.start))} and ${fmt(hrs(r.end))}. Water is fine until then.`
          : `No fasting needed. Come ${when} any time from ${fmt(hrs(r.start))} to ${fmt(hrs(r.end))}.`;
        msg = `Hi Saifee Lab, I'd like to come in for a ${label} ${when} around ${fmt(hrs(r.start))}.`;
      }
      out.textContent = text;
      if (book) book.href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
    };
    form.addEventListener('input', render);
    form.addEventListener('submit', (e) => e.preventDefault());
    render();
  });

  // Home-visit forms: compose the WhatsApp message from the fields, no backend.
  document.querySelectorAll('[data-wa-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(form));
      const msg = `Hi Saifee Lab, I'd like a home visit.\nName: ${f.name || ''}\nArea: ${f.area || ''}\nDate: ${f.date || ''}\nTests: ${f.tests || ''}`;
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    });
  });
})();
