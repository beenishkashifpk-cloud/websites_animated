/* ===== BeanCraft Roast Log - main.js =====
   Libraries: GSAP + ScrollTrigger (loaded from cdnjs in index.html)
   Pattern: every section is built by its own factory function (create...),
   and boot() creates them all. Easy to read, easy to maintain. */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isNarrow     = () => window.innerWidth < 900;

  // If the GSAP CDN is blocked, don't leave the visitor on a black loader.
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    const l = $('#loader'); if (l) l.remove();
    document.body.style.overflow = 'auto';
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* ---------- helper: scale an iframe so a fixed-width page fits a box ---------- */
  function fitIframe(viewport, frame, designWidth) {
    const apply = () => {
      const w = viewport.clientWidth, h = viewport.clientHeight;
      if (!w || !h) return;
      const s = w / designWidth;
      frame.style.width  = designWidth + 'px';
      frame.style.height = (h / s) + 'px';
      frame.style.transform = 'scale(' + s + ')';
    };
    new ResizeObserver(apply).observe(viewport);
    apply();
  }

  /* =========================================================
     HERO  - loader, intro timeline, parallax
     ========================================================= */
  function createHero() {
    const bean = $('#bean');
    const lines = $$('.line__in');
    const fades = $$('[data-hero="fade"]');
    const rings = $$('.hero__rings span');
    const topbar = $('#topbar');

    gsap.set(lines, { yPercent: 0 });
    gsap.set(fades, { opacity: 1, y: 0 });
    gsap.set(rings, { scale: 1, opacity: 1 });
    gsap.set(bean, { y: 0, rotate: 0, opacity: 1, scale: 1 });
    gsap.set(topbar, { yPercent: 0 });

    function intro() {
      startLoops();
    }

    function startLoops() {
      // gentle float
      gsap.to(bean, { y: -16, rotate: 4, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to(rings, { rotate: 360, duration: 90, ease: 'none', repeat: -1, stagger: { each: 12, from: 'end' } });
      // scroll parallax on the art wrapper
      gsap.to('.hero__art', {
        yPercent: -18, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to('.hero__copy', {
        yPercent: -12, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: '80% top', scrub: true }
      });
      // mouse parallax (desktop only)
      if (finePointer) {
        const rx = gsap.quickTo('.tag--a', 'x', { duration: 0.8 }), ry = gsap.quickTo('.tag--a', 'y', { duration: 0.8 });
        const bx = gsap.quickTo('.tag--b', 'x', { duration: 0.8 }), by = gsap.quickTo('.tag--b', 'y', { duration: 0.8 });
        const gx = gsap.quickTo('.hero__rings', 'x', { duration: 1.2 });
        window.addEventListener('pointermove', (e) => {
          const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
          rx(nx * -40); ry(ny * -30); bx(nx * 50); by(ny * 40); gx(nx * 30);
        }, { passive: true });
      }
    }

    function runLoader() {
      const loader = $('#loader');
      if (loader) loader.remove();
      document.body.style.overflow = '';
      intro();
      ScrollTrigger.refresh();
    }

    function showStatic() {
      $('#loader')?.remove();
      gsap.set([lines, fades, rings, bean, topbar], { clearProps: 'all' });
    }

    return { start: reduceMotion ? showStatic : runLoader };
  }

  /* =========================================================
     DESKTOP  - laptop enters, then the screen grows to full window
     ========================================================= */
  function createDesktop() {
    const section = $('#desktop'), laptop = $('#laptop'), screen = $('#laptopScreen');
    const vp = $('#deskViewport'), frame = $('#deskFrame'), base = $('#laptopBase');
    const text = $('#desktopText'), open = $('#deskOpen');

    fitIframe(vp, frame, 1440);
    if (reduceMotion) return;

    const vw = () => document.documentElement.clientWidth;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section, start: 'top top', end: '+=260%',
        pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true
      }
    });

    tl.fromTo(laptop,
        { y: 160, rotateX: 30, scale: 0.8, opacity: 0, transformPerspective: 1200 },
        { y: 0, rotateX: 0, scale: 1, opacity: 1, duration: 1, ease: 'power2.out' })
      .to({}, { duration: 0.3 })                                   // small pause
      .to(text, { opacity: 0, xPercent: -25, duration: 0.7, ease: 'power2.in' }, '>')
      .to(base, { opacity: 0, y: 60, duration: 0.7 }, '<')
      .to(laptop, { marginLeft: 0, duration: 1.8, ease: 'power2.inOut' }, '<')
      .to(screen, {
        width: () => vw(), height: () => window.innerHeight,
        borderWidth: 0, borderRadius: 0, duration: 1.8, ease: 'power2.inOut'
      }, '<')
      .to({}, { duration: 0.5 })                                    // hold on the full-screen site
      .to(open, { opacity: 0, duration: 0.3 }, '>-0.1')
      .to(screen, { filter: 'brightness(0.12)', duration: 0.5 }, '<');
  }

  /* =========================================================
     MOBILE  - phone swings in, then scales up into focus
     ========================================================= */
  function createMobile() {
    const section = $('#mobile'), phone = $('#phone'), glow = $('#mobileGlow'), text = $('#mobileText');
    const vp = $('#mobViewport'), frame = $('#mobFrame');

    fitIframe(vp, frame, 390);
    if (reduceMotion) return;

    const rest = () => ({ s: isNarrow() ? 0.74 : 1, y: isNarrow() ? 70 : 0 });
    const focusScale = () => Math.min((window.innerHeight * 0.92) / 620, (document.documentElement.clientWidth * 0.96) / 300);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section, start: 'top top', end: '+=240%',
        pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true
      }
    });

    tl.fromTo(phone,
        { x: () => window.innerWidth * 0.4, y: 140, rotateY: -50, rotateZ: 10, scale: 0.7, opacity: 0, transformPerspective: 1400 },
        { x: 0, y: () => rest().y, rotateY: 0, rotateZ: 0, scale: () => rest().s, opacity: 1, duration: 1, ease: 'power3.out' })
      .to(glow, { opacity: 0.8, duration: 1 }, '<')
      .to({}, { duration: 0.3 })
      .to(text, { opacity: 0, xPercent: -25, duration: 0.7, ease: 'power2.in' }, '>')
      .to(phone, { scale: () => focusScale(), y: 0, duration: 1.8, ease: 'power2.inOut' }, '<')
      .to(glow, { scale: 1.7, opacity: 1, duration: 1.8, ease: 'power2.inOut' }, '<')
      .to({}, { duration: 0.6 });
  }

  /* =========================================================
     HUD  - roast temperature that follows the story
     ========================================================= */
  function createHud() {
    const tempEl = $('#temp'), stageEl = $('#stage'), bar = $('#hudBar');
    const stages = [
      { el: '#hero',    temp: 20,  name: 'Green' },
      { el: '#desktop', temp: 196, name: 'First crack' },
      { el: '#mobile',  temp: 212, name: 'Development' },
      { el: '#contact', temp: 24,  name: 'Cooling, ready to cup' }
    ];
    const state = { v: 20 };
    let current = -1;

    function setStage(i) {
      if (i === current || i < 0) return;
      current = i;
      stageEl.textContent = stages[i].name;
      gsap.to(state, {
        v: stages[i].temp, duration: 1.2, ease: 'power2.out', overwrite: true,
        onUpdate() { tempEl.textContent = Math.round(state.v); }
      });
    }

    stages.forEach((s, i) => {
      ScrollTrigger.create({
        trigger: s.el, start: 'top 55%',
        onEnter: () => setStage(i),
        onLeaveBack: () => setStage(i - 1)
      });
    });
    setStage(0);

    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => { bar.style.width = (self.progress * 100) + '%'; }
    });
  }

  /* =========================================================
     CONTACT  - validation, sanitising, submit
     ========================================================= */
  function createContact() {
    // Put your Formspree URL here to receive real emails, e.g.
    // const FORM_ENDPOINT = 'https://formspree.io/f/xxxxxxxx';
    const FORM_ENDPOINT = '';

    const form = $('#contactForm'), status = $('#formStatus'), btn = $('#submitBtn');
    const done = $('#done'), doneMsg = $('#doneMsg'), again = $('#again');
    const counter = $('#msgCount');
    const loadedAt = Date.now();

    // Remove control characters and angle brackets, collapse spaces.
    const clean = (s) => String(s)
      .normalize('NFKC')
      .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '')
      .replace(/[<>]/g, '')
      .replace(/[^\S\n]+/g, ' ')
      .trim();
    const hasHtml = (s) => /<[^>]*>|javascript:|on\w+\s*=/i.test(s);

    const rules = {
      name(v, raw) {
        if (v.length < 2) return 'Please enter your name (at least 2 letters).';
        if (hasHtml(raw)) return 'Please remove special code or tags from your name.';
        if (!/^[\p{L}\p{M}' .-]{2,60}$/u.test(v)) return 'Use letters only, please.';
        return '';
      },
      email(v) {
        if (!v) return 'Please enter your email address.';
        if (!/^[^\s@<>()]+@[^\s@<>()]+\.[A-Za-z]{2,}$/.test(v) || v.length > 80) return 'That email does not look right.';
        return '';
      },
      message(v, raw) {
        if (hasHtml(raw)) return 'Please remove HTML tags or code from your message.';
        if (v.length < 10) return 'Please write at least 10 characters.';
        return '';
      }
    };

    function validate(field) {
      const input = form.elements[field];
      const raw = input.value;
      const v = clean(raw);
      const msg = rules[field](v, raw);
      const wrap = input.closest('.field');
      $('#' + field + 'Err').textContent = msg;               // textContent only, never innerHTML
      wrap.classList.toggle('is-invalid', !!msg);
      wrap.classList.toggle('is-valid', !msg && v.length > 0);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }

    ['name', 'email', 'message'].forEach((f) => {
      const el = form.elements[f];
      el.addEventListener('blur', () => validate(f));
      el.addEventListener('input', () => {
        if (el.closest('.field').classList.contains('is-invalid')) validate(f);
        if (f === 'message') counter.textContent = el.value.length;
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = '';
      const ok = ['name', 'email', 'message'].map(validate).every(Boolean);
      if (!ok) {
        const bad = $('.field.is-invalid input, .field.is-invalid textarea', form);
        if (bad) bad.focus();
        gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
        return;
      }

      const data = {
        name: clean(form.elements.name.value),
        email: clean(form.elements.email.value),
        roast: clean(form.elements.roast.value),
        message: clean(form.elements.message.value)
      };

      // Bots: hidden field filled, or form submitted impossibly fast. Pretend success, send nothing.
      const isBot = form.elements.website.value !== '' || Date.now() - loadedAt < 2000;

      btn.classList.add('is-loading');
      try {
        if (!isBot) {
          if (FORM_ENDPOINT) {
            const res = await fetch(FORM_ENDPOINT, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Server said ' + res.status);
          } else {
            await new Promise((r) => setTimeout(r, 900));      // demo mode
          }
        } else {
          await new Promise((r) => setTimeout(r, 600));
        }
        showDone(data);
      } catch (err) {
        status.textContent = 'Something went wrong. Please try again in a moment.';
      } finally {
        btn.classList.remove('is-loading');
      }
    });

    function showDone(data) {
      doneMsg.textContent = 'Thanks ' + data.name.split(' ')[0] + '. We will roast your ' + data.roast + ' and email ' + data.email + ' with the details.';
      done.hidden = false;
      void done.offsetWidth;
      done.classList.add('is-show');
      gsap.from(done, { opacity: 0, duration: 0.5 });
    }

    again.addEventListener('click', () => {
      form.reset();
      counter.textContent = '0';
      $$('.field', form).forEach((f) => f.classList.remove('is-valid', 'is-invalid'));
      done.classList.remove('is-show');
      done.hidden = true;
      form.elements.name.focus();
    });

    if (!reduceMotion) {
      gsap.from('.contact__intro > *', {
        y: 40, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '#contact', start: 'top 70%' }
      });
      gsap.from('.form', {
        y: 70, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '#contact', start: 'top 60%' }
      });
    }
  }

  /* =========================================================
     CURSOR + MAGNETIC BUTTONS (mouse devices only)
     ========================================================= */
  function createPointerEffects() {
    if (!finePointer || reduceMotion) return;
    const cur = $('#cursor');
    const mx = gsap.quickTo(cur, 'x', { duration: 0.25, ease: 'power3' });
    const my = gsap.quickTo(cur, 'y', { duration: 0.25, ease: 'power3' });
    window.addEventListener('pointermove', (e) => { cur.classList.add('is-active'); mx(e.clientX); my(e.clientY); }, { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.remove('is-active'));

    const hoverables = 'a, button, .chip, input, textarea';
    document.addEventListener('pointerover', (e) => { if (e.target.closest(hoverables)) cur.classList.add('is-hover'); });
    document.addEventListener('pointerout',  (e) => { if (e.target.closest(hoverables)) cur.classList.remove('is-hover'); });

    $$('.magnetic').forEach((el) => {
      const qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
      const qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        qx((e.clientX - (r.left + r.width / 2)) * 0.3);
        qy((e.clientY - (r.top + r.height / 2)) * 0.4);
      });
      el.addEventListener('pointerleave', () => { qx(0); qy(0); });
    });
  }

  /* ---------- boot ---------- */
  function boot() {
    window.scrollTo(0, 0);
    const hero = createHero();
    createDesktop();
    createMobile();
    createContact();
    createHud();            // after the pinned sections, so trigger positions are right
    createPointerEffects();
    hero.start();

    window.addEventListener('load', () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
