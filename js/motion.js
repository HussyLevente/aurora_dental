/* ============================================================
   AURORA — MOTION SYSTEM
   Lenis smooth scroll + GSAP ScrollTrigger, with a working
   no-library fallback. Everything respects prefers-reduced-motion.
   ============================================================ */
(function (w, d) {
  'use strict';

  var A = w.AURORA || (w.AURORA = {});
  var REDUCED = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TOUCH = w.matchMedia('(hover:none), (pointer:coarse)').matches;
  var gsap = w.gsap;
  var HAS = !!(gsap && w.ScrollTrigger) && !REDUCED;
  var lenis = null;
  var M = {};

  if (HAS) gsap.registerPlugin(w.ScrollTrigger);

  /* ============================================================
     TEXT SPLITTING — walks text nodes so inline tags survive
     ============================================================ */
  function splitNode(root, mode) {
    var out = [];
    function walk(node) {
      var kids = Array.prototype.slice.call(node.childNodes);
      kids.forEach(function (n) {
        if (n.nodeType === 3) {
          var txt = n.textContent;
          if (!txt.trim()) return;
          var frag = d.createDocumentFragment();
          var parts = mode === 'chars' ? txt.split('') : txt.split(/(\s+)/);
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(p)); return; }
            var mask = d.createElement('span');
            mask.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;';
            var inner = d.createElement('span');
            inner.style.cssText = 'display:inline-block;will-change:transform;';
            inner.textContent = p;
            mask.appendChild(inner);
            frag.appendChild(mask);
            out.push(inner);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.dataset.noSplit) {
          walk(n);
        }
      });
    }
    walk(root);
    return out;
  }

  /* ============================================================
     FALLBACK REVEALS (no GSAP, or reduced motion)
     ============================================================ */
  function fallbackReveals() {
    var els = d.querySelectorAll('[data-rv],[data-split],[data-clip],[data-count]');
    if (REDUCED || !('IntersectionObserver' in w)) {
      Array.prototype.forEach.call(els, function (el) {
        el.style.opacity = '1'; el.style.transform = 'none'; el.style.clipPath = 'none';
        if (el.hasAttribute('data-count')) countUp(el, true);
      });
      d.documentElement.classList.remove('motion');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.style.transition = 'opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1), clip-path 1s cubic-bezier(.16,1,.3,1)';
        el.style.transitionDelay = (parseFloat(el.dataset.rvD || 0)) + 's';
        el.style.opacity = '1'; el.style.transform = 'none'; el.style.clipPath = 'inset(0 0 0% 0)';
        if (el.hasAttribute('data-count')) countUp(el);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  /* ============================================================
     COUNTERS
     ============================================================ */
  function countUp(el, instant) {
    if (el._counted) return;
    el._counted = true;
    var target = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.dec || 0, 10);
    var suffix = el.dataset.suffix || '';
    var dur = instant ? 0 : (parseFloat(el.dataset.dur) || 1.9);
    var start = performance.now();
    function frame(now) {
      /* a rAF timestamp can predate the performance.now() we captured, which
         sent the quartic ease negative and flashed a huge minus number */
      var p = dur === 0 ? 1 : Math.min(Math.max((now - start) / (dur * 1000), 0), 1);
      var eased = 1 - Math.pow(1 - p, 4);
      var v = target * eased;
      el.textContent = A.fmt.num(v, dec) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ============================================================
     LENIS
     ============================================================ */
  function initLenis() {
    if (REDUCED || TOUCH || !w.Lenis) return null;
    try {
      lenis = new w.Lenis({
        duration: 1.15,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
        infinite: false
      });
      if (HAS) {
        lenis.on('scroll', w.ScrollTrigger.update);
        gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
        gsap.ticker.lagSmoothing(0);
      } else {
        var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
      }
      return lenis;
    } catch (e) { return null; }
  }

  M.scrollTo = function (target, opts) {
    var o = Object.assign({ offset: -90, duration: 1.2 }, opts || {});
    if (lenis) lenis.scrollTo(target, o);
    else {
      var el = typeof target === 'string' ? d.querySelector(target) : target;
      if (el) w.scrollTo({ top: el.getBoundingClientRect().top + w.pageYOffset + o.offset, behavior: 'smooth' });
    }
  };
  M.stop = function () { if (lenis) lenis.stop(); };
  M.start = function () { if (lenis) lenis.start(); };
  M.refresh = function () { if (HAS) w.ScrollTrigger.refresh(); };

  /* ============================================================
     LOADER
     ============================================================ */
  function runLoader(done) {
    var el = d.querySelector('.loader');
    var seen = false;
    try { seen = sessionStorage.getItem('aurora.seen') === '1'; } catch (e) { }
    if (!el || seen || REDUCED || !HAS) {
      if (el) el.remove();
      try { sessionStorage.setItem('aurora.seen', '1'); } catch (e) { }
      done();
      return;
    }
    try { sessionStorage.setItem('aurora.seen', '1'); } catch (e) { }

    M.stop();
    d.body.classList.add('is-locked');

    var word = el.querySelector('.loader__word');
    var letters = word ? splitNode(word, 'chars') : [];
    var bar = el.querySelector('.loader__bar i');
    var num = el.querySelector('.loader__num');
    var mark = el.querySelector('.loader__mark');
    var counter = { v: 0 };

    gsap.set(letters, { yPercent: 115 });
    var tl = gsap.timeline({
      onComplete: function () {
        el.remove();
        d.body.classList.remove('is-locked');
        M.start();
        done();
      }
    });
    tl.to(mark, { opacity: 0.14, scale: 1, duration: .7, ease: 'power2.out' }, 0)
      .to(letters, { yPercent: 0, duration: 1.05, stagger: .045, ease: 'expo.out' }, .12)
      .to(counter, {
        v: 100, duration: 1.5, ease: 'power2.inOut',
        onUpdate: function () { if (num) num.textContent = String(Math.round(counter.v)).padStart(3, '0'); }
      }, .2)
      .to(bar, { width: '100%', duration: 1.5, ease: 'power2.inOut' }, .2)
      .to(letters, { yPercent: -115, duration: .75, stagger: .028, ease: 'expo.in' }, 1.72)
      .to([num, el.querySelector('.loader__cap'), mark], { opacity: 0, duration: .5, ease: 'power2.in' }, 1.8)
      .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, 2.1);
  }

  /* ============================================================
     PAGE TRANSITIONS
     ============================================================ */
  function initTransitions() {
    var wrap = d.querySelector('.trans');
    if (!wrap) return;
    var panel = wrap.querySelector('.trans__panel');
    var mark = wrap.querySelector('.trans__mark');
    var incoming = d.documentElement.classList.contains('nav-in');

    if (incoming && HAS) {
      gsap.set(panel, { scaleY: 1, transformOrigin: 'top center' });
      gsap.set(mark, { opacity: 1, scale: 1 });
      gsap.timeline({ onComplete: function () { d.documentElement.classList.remove('nav-in'); } })
        .to(mark, { opacity: 0, scale: .82, duration: .38, ease: 'power2.in' }, 0)
        .to(panel, { scaleY: 0, duration: .95, ease: 'expo.inOut' }, .1);
    } else {
      d.documentElement.classList.remove('nav-in');
      if (HAS) gsap.set(panel, { scaleY: 0 });
    }

    if (!HAS) return;

    var here = location.pathname.split('/').pop() || 'index.html';
    d.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || a.target === '_blank' || a.hasAttribute('download')) return;
      if (/^(#|mailto:|tel:|http)/i.test(href)) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      var to = href.split('#')[0].split('/').pop();
      if (to === here || to === '') return;

      e.preventDefault();
      try { sessionStorage.setItem('aurora.nav', '1'); } catch (er) { }
      M.stop();
      gsap.timeline({ onComplete: function () { location.href = href; } })
        .set(panel, { transformOrigin: 'bottom center' })
        .to(panel, { scaleY: 1, duration: .78, ease: 'expo.inOut' }, 0)
        .fromTo(mark, { opacity: 0, scale: .82 }, { opacity: 1, scale: 1, duration: .42, ease: 'power2.out' }, .34);
    });

    w.addEventListener('pageshow', function (e) {
      if (e.persisted) { gsap.set(panel, { scaleY: 0 }); gsap.set(mark, { opacity: 0 }); M.start(); }
    });
  }

  /* ============================================================
     CURSOR
     ============================================================ */
  function initCursor() {
    if (TOUCH || REDUCED || !HAS) return;
    var dot = d.querySelector('.cur'), ring = d.querySelector('.cur-ring');
    if (!dot || !ring) return;
    var label = ring.querySelector('.cur-ring__t');

    var xTo = gsap.quickTo(dot, 'x', { duration: .18, ease: 'power3' });
    var yTo = gsap.quickTo(dot, 'y', { duration: .18, ease: 'power3' });
    var rxTo = gsap.quickTo(ring, 'x', { duration: .52, ease: 'power3' });
    var ryTo = gsap.quickTo(ring, 'y', { duration: .52, ease: 'power3' });

    w.addEventListener('mousemove', function (e) {
      d.body.classList.add('cur-on');
      xTo(e.clientX); yTo(e.clientY); rxTo(e.clientX); ryTo(e.clientY);
    }, { passive: true });
    d.addEventListener('mouseleave', function () { d.body.classList.remove('cur-on'); });

    var LINK = 'a,button,input,select,textarea,label,.chip,.slot,.cal__d.free,summary';
    var MEDIA = '[data-cursor]';

    d.addEventListener('mouseover', function (e) {
      var m = e.target.closest(MEDIA);
      if (m) {
        d.body.classList.add('cur-media');
        if (label) label.textContent = m.dataset.cursor || 'View';
        gsap.to(ring, { width: 76, height: 76, duration: .5, ease: 'expo.out' });
        return;
      }
      if (e.target.closest(LINK)) {
        d.body.classList.add('cur-link');
        gsap.to(ring, { width: 58, height: 58, duration: .45, ease: 'expo.out' });
      }
    });
    d.addEventListener('mouseout', function (e) {
      if (e.target.closest(MEDIA) || e.target.closest(LINK)) {
        d.body.classList.remove('cur-media', 'cur-link');
        gsap.to(ring, { width: 44, height: 44, duration: .45, ease: 'expo.out' });
      }
    });
  }

  /* ============================================================
     MAGNETIC ELEMENTS
     ============================================================ */
  function initMagnetic() {
    if (TOUCH || REDUCED || !HAS) return;
    Array.prototype.forEach.call(d.querySelectorAll('.mag'), function (el) {
      var strength = parseFloat(el.dataset.mag || .34);
      var xTo = gsap.quickTo(el, 'x', { duration: .55, ease: 'expo.out' });
      var yTo = gsap.quickTo(el, 'y', { duration: .55, ease: 'expo.out' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      });
      el.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
    });
  }

  /* ============================================================
     SCROLL-DRIVEN REVEALS
     ============================================================ */
  function initReveals() {
    if (!HAS) { fallbackReveals(); return; }
    var ST = w.ScrollTrigger;

    /* headline word reveals */
    Array.prototype.forEach.call(d.querySelectorAll('[data-split]'), function (el) {
      var mode = el.dataset.split === 'chars' ? 'chars' : 'words';
      var parts = splitNode(el, mode);
      el.classList.add('split-done');
      gsap.set(el, { opacity: 1 });
      gsap.set(parts, { yPercent: 108 });
      gsap.to(parts, {
        yPercent: 0,
        duration: 1.15,
        ease: 'expo.out',
        stagger: mode === 'chars' ? .022 : .052,
        delay: parseFloat(el.dataset.rvD || 0),
        scrollTrigger: el.dataset.now ? null : { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* generic reveals */
    Array.prototype.forEach.call(d.querySelectorAll('[data-rv]'), function (el) {
      gsap.to(el, {
        opacity: 1, y: 0,
        duration: 1.05,
        ease: 'expo.out',
        delay: parseFloat(el.dataset.rvD || 0),
        scrollTrigger: el.dataset.now ? null : { trigger: el, start: 'top 90%', once: true }
      });
    });

    /* staggered groups */
    Array.prototype.forEach.call(d.querySelectorAll('[data-stagger]'), function (group) {
      var kids = group.children;
      gsap.set(kids, { opacity: 0, y: 34 });
      gsap.to(kids, {
        opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .075,
        scrollTrigger: { trigger: group, start: 'top 86%', once: true }
      });
    });

    /* clip reveals for imagery */
    Array.prototype.forEach.call(d.querySelectorAll('[data-clip]'), function (el) {
      gsap.to(el, {
        opacity: 1, clipPath: 'inset(0 0 0% 0)',
        duration: 1.5, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });

    /* parallax */
    Array.prototype.forEach.call(d.querySelectorAll('[data-par]'), function (el) {
      var s = parseFloat(el.dataset.par || 12);
      gsap.fromTo(el, { yPercent: -s / 2 }, {
        yPercent: s / 2, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    /* counters */
    Array.prototype.forEach.call(d.querySelectorAll('[data-count]'), function (el) {
      ST.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () { countUp(el); } });
    });

    /* method steps highlight */
    Array.prototype.forEach.call(d.querySelectorAll('.mstep'), function (el) {
      ST.create({
        trigger: el, start: 'top 62%', end: 'bottom 42%',
        onToggle: function (self) { el.classList.toggle('is-in', self.isActive); }
      });
    });

    /* rail progress */
    var railBar = d.querySelector('.rail__prog i');
    if (railBar) {
      gsap.to(railBar, {
        height: '100%', ease: 'none',
        scrollTrigger: { trigger: d.body, start: 'top top', end: 'bottom bottom', scrub: .4 }
      });
    }

    /* rating bars */
    Array.prototype.forEach.call(d.querySelectorAll('.rbar__t i'), function (el) {
      gsap.to(el, {
        width: el.dataset.w + '%', duration: 1.4, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 94%', once: true }
      });
    });
  }

  /* ============================================================
     HORIZONTAL PINNED SECTION
     ============================================================ */
  function initHorizontal() {
    var sec = d.querySelector('.hsc');
    if (!sec || !HAS) return;
    if (w.innerWidth < 901) return;
    var track = sec.querySelector('.hsc__track');
    var prog = sec.querySelector('.hsc__prog i');
    if (!track) return;

    var distance = function () { return Math.max(0, track.scrollWidth - w.innerWidth + parseFloat(getComputedStyle(d.documentElement).getPropertyValue('--pad')) * 2); };

    gsap.to(track, {
      x: function () { return -distance(); },
      ease: 'none',
      scrollTrigger: {
        trigger: sec,
        start: 'top top',
        end: function () { return '+=' + distance() * 1.15; },
        pin: true,
        scrub: .8,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: function (self) { if (prog) prog.style.width = (self.progress * 100).toFixed(2) + '%'; }
      }
    });
  }

  /* ============================================================
     HERO INTRO
     ============================================================ */
  function heroIntro() {
    var hero = d.querySelector('[data-hero]');
    if (!hero || !HAS) return;
    var tl = gsap.timeline({ delay: .12 });
    var fig = hero.querySelector('[data-hero-fig]');
    var badge = hero.querySelector('[data-hero-badge]');
    var strip = hero.querySelectorAll('[data-hero-strip] > *');
    if (fig) tl.fromTo(fig, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.out' }, .25);
    if (badge) tl.fromTo(badge, { opacity: 0, y: 26, scale: .95 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'expo.out' }, 1.05);
    if (strip.length) tl.fromTo(strip, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: .9, stagger: .07, ease: 'expo.out' }, .85);
  }

  /* ============================================================
     ROW HOVER IMAGE
     ============================================================ */
  function initRowHover() {
    var holder = d.querySelector('.row__hov');
    if (!holder || !HAS || TOUCH) return;
    var img = holder.querySelector('img');
    var xTo = gsap.quickTo(holder, 'x', { duration: .7, ease: 'expo.out' });
    var yTo = gsap.quickTo(holder, 'y', { duration: .7, ease: 'expo.out' });
    var rTo = gsap.quickTo(holder, 'rotation', { duration: .9, ease: 'expo.out' });
    var lastX = 0;

    Array.prototype.forEach.call(d.querySelectorAll('[data-hov]'), function (row) {
      row.addEventListener('mouseenter', function () {
        if (img) img.src = row.dataset.hov;
        gsap.to(holder, { opacity: 1, scale: 1, duration: .55, ease: 'expo.out' });
      });
      row.addEventListener('mouseleave', function () {
        gsap.to(holder, { opacity: 0, scale: .9, duration: .4, ease: 'power2.out' });
      });
    });

    w.addEventListener('mousemove', function (e) {
      xTo(e.clientX - 60); yTo(e.clientY - 130);
      rTo(Math.max(-9, Math.min(9, (e.clientX - lastX) * .35)));
      lastX = e.clientX;
    }, { passive: true });
  }

  /* ============================================================
     NAV BEHAVIOUR
     ============================================================ */
  function initNav() {
    var nav = d.querySelector('.nav');
    if (!nav) return;
    var last = 0;
    function onScroll() {
      var y = w.pageYOffset;
      nav.classList.toggle('is-stuck', y > 40);
      if (!d.body.classList.contains('menu-open')) {
        nav.classList.toggle('is-hidden', y > 320 && y > last + 4);
      }
      last = y;
    }
    w.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============================================================
     BOOT
     ============================================================ */
  M.boot = function () {
    initNav();
    initLenis();
    initTransitions();
    initCursor();
    initMagnetic();
    runLoader(function () {
      initReveals();
      heroIntro();
      initHorizontal();
      initRowHover();
      if (HAS) w.ScrollTrigger.refresh();
    });
  };
  M.split = splitNode;
  M.count = countUp;
  M.has = HAS;
  M.reduced = REDUCED;
  M.touch = TOUCH;

  A.motion = M;
})(window, document);
