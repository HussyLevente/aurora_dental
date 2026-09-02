/* ============================================================
   AURORA — SHARED UI
   Chrome injection (nav, menu, footer, cursor, rails) plus the
   interaction primitives every page reuses.
   ============================================================ */
(function (w, d) {
  'use strict';

  var A = w.AURORA;
  var C = A.CLINIC, S = A.Store, F = A.fmt;

  /* ---------- tiny helpers ---------- */
  function el(html) { var t = d.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function qs(s, r) { return (r || d).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }

  var ICON = {
    arrow: '<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 8h12M9 3l5 5-5 5"/></svg>',
    ne: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 9L9 3M4 3h5v5"/></svg>',
    check: '<svg viewBox="0 0 12 10" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 5l3.2 3.2L11 1.4"/></svg>',
    star: '<svg viewBox="0 0 20 19" fill="currentColor"><path d="M10 0l2.6 6.2 6.7.5-5.1 4.4 1.6 6.6L10 14.2 4.2 17.7l1.6-6.6L.7 6.7l6.7-.5z"/></svg>',
    pin: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 15s5-4.7 5-8.4A5 5 0 003 6.6C3 10.3 8 15 8 15z"/><circle cx="8" cy="6.5" r="1.8"/></svg>',
    phone: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 2h3l1.4 3.5-1.8 1.2a10 10 0 004.7 4.7l1.2-1.8L15 11v3a1 1 0 01-1.1 1A13 13 0 012 3.1 1 1 0 013 2z"/></svg>',
    mail: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1.5" y="3.5" width="13" height="9" rx="1"/><path d="M2 4.5l6 4.2 6-4.2"/></svg>',
    clock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6.4"/><path d="M8 4.4V8l2.6 1.6"/></svg>',
    tag: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 2h5.4L14 8.6 8.6 14 2 7.4V2z"/><circle cx="5" cy="5" r="1"/></svg>',
    leaf: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M13.5 2.5C7 2 2.5 5 2.5 10c0 1.6.6 2.8.6 2.8S6 8 11 6.2C7.6 8.6 5 11 4 13.5c4.6 1.4 9.5-1.3 9.5-11z"/></svg>',
    cube: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 1.6l5.6 3.2v6.4L8 14.4 2.4 11.2V4.8z"/><path d="M2.4 4.8L8 8l5.6-3.2M8 8v6.4"/></svg>',
    wave: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M1 9c2-3 4-3 6 0s4 3 6 0"/><path d="M1 5c2-3 4-3 6 0s4 3 6 0" opacity=".45"/></svg>',
    chat: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M14 8.8A5.2 5.2 0 018.8 14H3l-1 1.2V8.8a5.2 5.2 0 015.2-5.2h1.6A5.2 5.2 0 0114 8.8z"/></svg>',
    info: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6.4"/><path d="M8 7.2v4M8 4.9v.1"/></svg>',
    x: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
    prev: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M10 3L5 8l5 5"/></svg>',
    next: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 3l5 5-5 5"/></svg>',
    ig: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2.2" y="2.2" width="11.6" height="11.6" rx="3.4"/><circle cx="8" cy="8" r="2.9"/><circle cx="11.4" cy="4.6" r=".8" fill="currentColor" stroke="none"/></svg>',
    fb: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M9.6 15V8.9h2l.3-2.4H9.6V5c0-.7.2-1.2 1.2-1.2h1.2V1.6C11.8 1.6 11 1.5 10.2 1.5 8.3 1.5 7 2.7 7 4.8v1.7H5v2.4h2V15h2.6z"/></svg>',
    in: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3.6 5.2h2.3V14H3.6zM4.8 1.6a1.4 1.4 0 110 2.8 1.4 1.4 0 010-2.8zM7.6 5.2h2.2v1.2h.1c.3-.6 1.1-1.3 2.3-1.3 2.4 0 2.9 1.6 2.9 3.7V14h-2.3V9.3c0-1.1 0-2.5-1.5-2.5s-1.7 1.2-1.7 2.4V14H7.6z"/></svg>',
    yt: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M15.2 4.8s-.1-1.1-.6-1.5c-.6-.6-1.2-.6-1.5-.7C11 2.5 8 2.5 8 2.5s-3 0-5.1.1c-.3 0-.9 0-1.5.7-.5.4-.6 1.5-.6 1.5S.7 6 .7 7.3v1.2c0 1.3.1 2.5.1 2.5s.1 1.1.6 1.5c.6.6 1.4.6 1.7.6 1.2.1 5 .2 5 .2s3 0 5.1-.2c.3 0 .9 0 1.5-.6.5-.4.6-1.5.6-1.5s.1-1.2.1-2.5V7.3c0-1.3-.2-2.5-.2-2.5zM6.5 10.2V5.9l4 2.2-4 2.1z"/></svg>'
  };

  var NAV = [
    { n: 'Home', h: 'index.html', i: '01', img: A.IMG.reception },
    { n: 'About', h: 'about.html', i: '02', img: A.IMG.waiting },
    { n: 'Treatments', h: 'services.html', i: '03', img: A.IMG.exam },
    { n: 'Team', h: 'team.html', i: '04', img: A.TEAM[0].img },
    { n: 'Pricing', h: 'pricing.html', i: '05', img: A.IMG.workJ },
    { n: 'Locations', h: 'locations.html', i: '06', img: A.IMG.bpBridge },
    { n: 'Reviews', h: 'reviews.html', i: '07', img: A.IMG.smileWoman },
    { n: 'Contact', h: 'contact.html', i: '08', img: A.IMG.clinicDesk }
  ];

  /* ============================================================
     CHROME
     ============================================================ */
  function chrome(page) {
    /* ---- loader ---- */
    d.body.insertAdjacentHTML('afterbegin',
      '<div class="loader" role="status" aria-label="Loading">' +
        '<div class="loader__wrap">' +
          '<img class="loader__mark" src="imgs/dental_logo.png" alt="">' +
          '<div class="loader__word">Aurora</div>' +
        '</div>' +
        '<div class="loader__cap label">Dental Studio — Budapest</div>' +
        '<div class="loader__bar"><i></i></div>' +
        '<div class="loader__num">000</div>' +
      '</div>');

    /* ---- transition + cursor + rails ---- */
    d.body.insertAdjacentHTML('beforeend',
      '<div class="trans" aria-hidden="true"><div class="trans__panel"></div>' +
      '<img class="trans__mark" src="imgs/dental_logo.png" alt=""></div>' +
      '<div class="cur" aria-hidden="true"></div>' +
      '<div class="cur-ring" aria-hidden="true"><span class="cur-ring__t">View</span></div>' +
      '<div class="toasts" id="toasts" aria-live="polite"></div>' +
      '<div class="rail rail--l" aria-hidden="true"><span class="rail__txt">Aurora — Budapest</span></div>' +
      '<div class="rail rail--r" aria-hidden="true"><span class="rail__prog"><i></i></span></div>');

    /* ---- nav ---- */
    var links = NAV.map(function (n) {
      return '<a class="nav__link' + (n.h === page ? ' is-on' : '') + '" href="' + n.h + '">' + n.n + '</a>';
    }).join('');

    d.body.insertAdjacentHTML('afterbegin',
      '<header class="nav">' +
        '<div class="nav__in">' +
          '<a class="brand" href="index.html" aria-label="Aurora Dental Studio, home">' +
            '<img class="brand__mark" src="imgs/dental_logo.png" alt="">' +
            '<span class="brand__txt"><span class="brand__n">Aurora</span>' +
            '<span class="brand__s">Dental Studio</span></span></a>' +
          '<nav class="nav__links" aria-label="Primary">' + links + '</nav>' +
          '<div class="nav__act">' +
            '<a class="nav__tel" href="tel:' + C.phoneHref + '">' + C.phone + '</a>' +
            '<span class="mag" data-mag=".22"><a class="btn btn--sm" href="booking.html">Book a visit' + ICON.arrow + '</a></span>' +
            '<button class="burger" id="burger" aria-label="Open menu" aria-expanded="false"><i></i><i></i></button>' +
          '</div>' +
        '</div>' +
      '</header>');

    /* ---- overlay menu ---- */
    var items = NAV.map(function (n) {
      return '<li class="menu__item"><a class="menu__a" href="' + n.h + '" data-mimg="' + n.img + '">' +
        '<span class="n">' + n.i + '</span><span class="t">' + n.n + '</span>' +
        '<span class="ar">' + ICON.ne + '</span></a></li>';
    }).join('');

    var previews = NAV.map(function (n, i) {
      return '<img src="' + n.img + '" alt="" class="' + (i === 0 ? 'is-on' : '') + '" data-mp="' + n.h + '" loading="lazy">';
    }).join('');

    d.body.insertAdjacentHTML('beforeend',
      '<div class="menu" id="menu" aria-hidden="true">' +
        '<div class="menu__grid">' +
          '<ul class="menu__list">' + items + '</ul>' +
          '<div class="menu__preview" aria-hidden="true">' + previews + '</div>' +
        '</div>' +
        '<div class="menu__foot">' +
          '<div class="menu__cols">' +
            '<div class="menu__col"><span class="label">Studios</span>' +
              A.LOCATIONS.map(function (l) { return '<a href="locations.html">' + l.name + '</a>'; }).join('') +
            '</div>' +
            '<div class="menu__col"><span class="label">Contact</span>' +
              '<a href="tel:' + C.phoneHref + '">' + C.phone + '</a>' +
              '<a href="mailto:' + C.email + '">' + C.email + '</a>' +
              '<a href="booking.html">Book online</a>' +
            '</div>' +
            '<div class="menu__col"><span class="label">Follow</span>' +
              C.social.map(function (s) { return '<a href="' + s.u + '">' + s.n + '</a>'; }).join('') +
            '</div>' +
          '</div>' +
          '<div class="menu__col" style="text-align:right"><span class="label">Emergency</span>' +
            '<a href="tel:' + C.emergencyHref + '" style="font-size:1.1rem">' + C.emergency + '</a></div>' +
        '</div>' +
      '</div>');

    initMenu();
    footer();
  }

  /* ---------- menu behaviour ---------- */
  function initMenu() {
    var menu = qs('#menu'), burger = qs('#burger');
    if (!menu || !burger) return;
    var items = qsa('.menu__item', menu);
    var links = qsa('.menu__a', menu);
    var previews = qsa('.menu__preview img', menu);
    var open = false;
    var g = w.gsap, has = !!g && !A.motion.reduced;

    if (has) g.set(links, { yPercent: 100, opacity: 0 });

    function toggle(state) {
      open = state == null ? !open : state;
      d.body.classList.toggle('menu-open', open);
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');

      if (open) A.motion.stop(); else A.motion.start();

      if (!has) { menu.style.clipPath = open ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)'; return; }
      if (open) {
        g.timeline()
          .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: .82, ease: 'expo.inOut' })
          .to(links, { yPercent: 0, opacity: 1, duration: .85, stagger: .045, ease: 'expo.out' }, .28)
          .fromTo(qs('.menu__foot'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .6, ease: 'power2.out' }, .55);
      } else {
        g.timeline()
          .to(links, { yPercent: -60, opacity: 0, duration: .38, stagger: .02, ease: 'power2.in' })
          .to(menu, { clipPath: 'inset(0 0 100% 0)', duration: .68, ease: 'expo.inOut' }, .16)
          .set(links, { yPercent: 100 });
      }
    }

    burger.addEventListener('click', function () { toggle(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) toggle(false); });
    links.forEach(function (a) {
      a.addEventListener('mouseenter', function () {
        var src = a.dataset.mimg;
        previews.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('src') === src); });
      });
      a.addEventListener('click', function () { setTimeout(function () { toggle(false); }, 60); });
    });
    items.forEach(function (i) { i.style.overflow = 'hidden'; });
  }

  /* ---------- footer ---------- */
  function footer() {
    var svcLinks = ['exam', 'hygiene', 'implant', 'aligners', 'veneers', 'whitening'].map(function (id) {
      var s = S.service(id);
      return '<a href="services.html#' + id + '">' + s.name + '</a>';
    }).join('');

    d.body.insertAdjacentHTML('beforeend',
      '<footer class="ft">' +
        '<div class="shell">' +
          '<div class="ft__grid">' +
            '<div>' +
              '<div class="ft__h">Aurora Dental Studio</div>' +
              '<p class="mw-xs" style="color:rgba(255,255,255,.72);font-size:.95rem">' +
                'Three studios in Budapest, one standard of care. Nothing gets treated on the first visit unless it hurts.</p>' +
              '<div class="ft__nl mt3">' +
                '<input type="email" id="ftMail" placeholder="Email for the quarterly note" aria-label="Email address">' +
                '<button id="ftSub" aria-label="Subscribe">' + ICON.ne + '</button>' +
              '</div>' +
              '<div class="clock mt3"><span>Budapest</span><b id="ftClock">--:--</b>' +
                '<span id="ftOpen"></span></div>' +
            '</div>' +
            '<div><div class="ft__h">Studios</div><div class="ft__col">' +
              A.LOCATIONS.map(function (l) {
                return '<a href="locations.html#' + l.id + '">' + l.name + '<br><span style="color:rgba(255,255,255,.4);font-size:.82rem">' + l.street + '</span></a>';
              }).join('') + '</div></div>' +
            '<div><div class="ft__h">Treatments</div><div class="ft__col">' + svcLinks +
              '<a href="services.html">All treatments' + '</a></div></div>' +
            '<div><div class="ft__h">Practice</div><div class="ft__col">' +
              '<a href="about.html">About Aurora</a><a href="team.html">The team</a>' +
              '<a href="pricing.html">Prices &amp; plans</a><a href="reviews.html">Patient reviews</a>' +
              '<a href="booking.html">Book online</a><a href="contact.html">Contact</a></div></div>' +
            '<div><div class="ft__h">Reach us</div><div class="ft__col">' +
              '<a href="tel:' + C.phoneHref + '">' + C.phone + '</a>' +
              '<a href="mailto:' + C.email + '">' + C.email + '</a>' +
              '<span style="color:rgba(255,255,255,.42);margin-top:.6rem">Out of hours</span>' +
              '<a href="tel:' + C.emergencyHref + '">' + C.emergency + '</a>' +
              '<div class="ft__soc mt3">' + C.social.map(function (s) {
                return '<a href="' + s.u + '" aria-label="' + s.n + '">' + ICON[s.i] + '</a>';
              }).join('') + '</div>' +
            '</div></div>' +
          '</div>' +
          '<div class="ft__word" aria-hidden="true">' +
            '<div style="font-family:var(--display);font-weight:200;font-size:min(21.4vw,340px);' +
            'line-height:.78;letter-spacing:-.055em;color:rgba(255,255,255,.09);text-align:center;' +
            'white-space:nowrap">AURORA</div>' +
          '</div>' +
          '<div class="ft__bar">' +
            '<span>© ' + new Date().getFullYear() + ' Aurora Dental Studio Kft. — Reg. 01-09-884213</span>' +
            '<span class="flex g3 wrap"><a href="#">Privacy</a><a href="#">Terms</a>' +
            '<a href="#">Complaints</a><a href="#">Accessibility</a></span>' +
            '<span>Built in Budapest</span>' +
          '</div>' +
        '</div>' +
      '</footer>');

    /* newsletter */
    var mail = qs('#ftMail'), sub = qs('#ftSub');
    function doSub() {
      var v = (mail.value || '').trim();
      if (!A.valid.email(v)) { toast('That email does not look right', true); mail.focus(); return; }
      var r = S.subscribe(v);
      toast(r.ok ? 'You are on the list. Four notes a year, no more.' : 'You are already subscribed.');
      mail.value = '';
    }
    if (sub) sub.addEventListener('click', doSub);
    if (mail) mail.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSub(); });

    /* live Budapest clock + open state */
    var clock = qs('#ftClock'), openEl = qs('#ftOpen');
    function tick() {
      try {
        var t = new Date().toLocaleTimeString('en-GB', { timeZone: C.tz, hour: '2-digit', minute: '2-digit' });
        if (clock) clock.textContent = t;
      } catch (e) { if (clock) clock.textContent = new Date().toTimeString().slice(0, 5); }
      if (openEl) {
        var o = S.openNow('belvaros');
        openEl.textContent = '— ' + (o.open ? o.label : (o.label + (o.next ? ', reopens ' + o.next : '')));
      }
    }
    tick(); setInterval(tick, 20000);
  }

  /* ============================================================
     TOASTS
     ============================================================ */
  function toast(msg, bad) {
    var host = qs('#toasts');
    if (!host) return;
    var t = el('<div class="toast' + (bad ? ' toast--bad' : '') + '"><span class="dot"></span><span>' + esc(msg) + '</span></div>');
    host.appendChild(t);
    var g = w.gsap;
    if (g) {
      g.to(t, { opacity: 1, y: 0, scale: 1, duration: .5, ease: 'expo.out' });
      g.to(t, {
        opacity: 0, y: 12, duration: .4, delay: 4.2, ease: 'power2.in',
        onComplete: function () { t.remove(); }
      });
    } else {
      t.style.opacity = 1; t.style.transform = 'none';
      setTimeout(function () { t.remove(); }, 4200);
    }
  }

  /* ============================================================
     ACCORDION
     ============================================================ */
  function accordion(root, opts) {
    var scope = typeof root === 'string' ? qs(root) : root;
    if (!scope) return;
    var single = !opts || opts.single !== false;
    var items = qsa('[data-acc]', scope);

    items.forEach(function (item) {
      var head = qs('[data-acc-h]', item);
      var body = qs('[data-acc-b]', item);
      if (!head || !body || item._accBound) return;
      item._accBound = true;
      head.setAttribute('aria-expanded', 'false');

      head.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');
        if (single) items.forEach(function (o) { if (o !== item) close(o); });
        isOpen ? close(item) : open(item);
        setTimeout(function () { A.motion.refresh(); }, 520);
      });
    });

    function open(item) {
      var body = qs('[data-acc-b]', item), head = qs('[data-acc-h]', item);
      item.classList.add('is-open');
      head.setAttribute('aria-expanded', 'true');
      var h = body.firstElementChild.offsetHeight;
      /* settle on auto once open, so the panel reflows on resize */
      if (w.gsap && !A.motion.reduced) {
        w.gsap.to(body, {
          height: h, duration: .68, ease: 'expo.out',
          onComplete: function () { body.style.height = 'auto'; }
        });
      } else {
        body.style.height = 'auto';
      }
    }
    function close(item) {
      var body = qs('[data-acc-b]', item), head = qs('[data-acc-h]', item);
      if (!item.classList.contains('is-open')) return;
      item.classList.remove('is-open');
      head.setAttribute('aria-expanded', 'false');
      if (w.gsap && !A.motion.reduced) w.gsap.to(body, { height: 0, duration: .5, ease: 'expo.inOut' });
      else body.style.height = '0px';
    }
    return { open: open, close: close, items: items };
  }

  /* ============================================================
     DRAWER
     ============================================================ */
  function drawer() {
    var node = el('<div class="drawer" id="drawer" aria-hidden="true" role="dialog" aria-modal="true">' +
      '<div class="drawer__bg" data-x></div><div class="drawer__p">' +
      '<button class="drawer__x" data-x aria-label="Close">' + ICON.x + '</button>' +
      '<div class="drawer__body"></div></div></div>');
    d.body.appendChild(node);
    var bg = qs('.drawer__bg', node), panel = qs('.drawer__p', node), body = qs('.drawer__body', node);
    var g = w.gsap;

    function show(html) {
      body.innerHTML = html;
      node.classList.add('is-open');
      node.setAttribute('aria-hidden', 'false');
      A.motion.stop(); d.body.classList.add('is-locked');
      if (g) {
        g.to(bg, { opacity: 1, duration: .5, ease: 'power2.out' });
        g.to(panel, { x: 0, duration: .78, ease: 'expo.out' });
        g.fromTo(qsa('[data-dstag]', body), { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: .8, stagger: .06, delay: .18, ease: 'expo.out' });
      } else { bg.style.opacity = 1; panel.style.transform = 'none'; }
      panel.scrollTop = 0;
    }
    function hide() {
      node.setAttribute('aria-hidden', 'true');
      A.motion.start(); d.body.classList.remove('is-locked');
      if (g) {
        g.to(bg, { opacity: 0, duration: .4 });
        g.to(panel, { x: '100%', duration: .55, ease: 'expo.in', onComplete: function () { node.classList.remove('is-open'); } });
      } else { node.classList.remove('is-open'); bg.style.opacity = 0; panel.style.transform = 'translateX(100%)'; }
    }
    node.addEventListener('click', function (e) { if (e.target.closest('[data-x]')) hide(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && node.classList.contains('is-open')) hide(); });
    return { show: show, hide: hide };
  }

  /* ============================================================
     MODAL
     ============================================================ */
  function modal() {
    var node = el('<div class="modal" aria-hidden="true" role="dialog" aria-modal="true">' +
      '<div class="modal__bg" data-x></div><div class="modal__c"></div></div>');
    d.body.appendChild(node);
    var bg = qs('.modal__bg', node), box = qs('.modal__c', node);
    var g = w.gsap;
    function show(html) {
      box.innerHTML = html;
      node.classList.add('is-open'); node.setAttribute('aria-hidden', 'false');
      A.motion.stop(); d.body.classList.add('is-locked');
      if (g) {
        g.to(bg, { opacity: 1, duration: .4 });
        g.to(box, { opacity: 1, y: 0, scale: 1, duration: .7, ease: 'expo.out' });
      } else { bg.style.opacity = 1; box.style.opacity = 1; box.style.transform = 'none'; }
    }
    function hide() {
      node.setAttribute('aria-hidden', 'true');
      A.motion.start(); d.body.classList.remove('is-locked');
      if (g) {
        g.to(bg, { opacity: 0, duration: .3 });
        g.to(box, { opacity: 0, y: 18, scale: .98, duration: .35, onComplete: function () { node.classList.remove('is-open'); } });
      } else { node.classList.remove('is-open'); }
    }
    node.addEventListener('click', function (e) { if (e.target.closest('[data-x]')) hide(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && node.classList.contains('is-open')) hide(); });
    return { show: show, hide: hide, box: box };
  }

  /* ============================================================
     SMALL RENDERERS
     ============================================================ */
  function starsRO(n) {
    var out = '<span class="stars-ro" aria-label="' + n + ' out of 5">';
    for (var i = 1; i <= 5; i++) out += '<span class="' + (i <= n ? '' : 'off') + '">' + ICON.star + '</span>';
    return out + '</span>';
  }
  function initials(name) {
    return name.split(' ').filter(Boolean).slice(0, 2).map(function (p) { return p[0]; }).join('').toUpperCase();
  }
  function marquee(items, cls) {
    var run = items.map(function (t) {
      return '<span class="mq__i">' + t + '<span class="sep">◆</span></span>';
    }).join('');
    return '<div class="mq ' + (cls || '') + '" aria-hidden="true"><div class="mq__t">' + run +
      '</div><div class="mq__t">' + run + '</div></div>';
  }
  function faq(list, limit) {
    return '<div class="acc" data-accordion>' + list.slice(0, limit || list.length).map(function (f, i) {
      return '<div class="acc__i" data-acc">' +
        '<button class="acc__h" data-acc-h><span class="acc__n">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="acc__t">' + esc(f.q) + '</span><span class="acc__pm"></span></button>' +
        '<div class="acc__b" data-acc-b><div class="acc__bi">' + esc(f.a) + '</div></div></div>';
    }).join('') + '</div>';
  }
  function openBadge(clinicId) {
    var o = S.openNow(clinicId);
    return '<span class="tag ' + (o.open ? 'tag--live' : 'tag--shut') + '"><span class="dot"></span>' +
      esc(o.open ? o.label : o.label) + '</span>';
  }
  function mapSrc(loc, span) {
    var s = span || 0.006;
    var bbox = [loc.lon - s * 1.7, loc.lat - s, loc.lon + s * 1.7, loc.lat + s].join('%2C');
    return 'https://www.openstreetmap.org/export/embed.html?bbox=' + bbox +
      '&amp;layer=mapnik&amp;marker=' + loc.lat + '%2C' + loc.lon;
  }

  /* ============================================================
     ANCHORS
     ============================================================ */
  function initAnchors() {
    d.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var t = qs(id);
      if (!t) return;
      e.preventDefault();
      A.motion.scrollTo(t, { offset: -100 });
    });
  }

  /* ============================================================
     BOOT
     ============================================================ */
  function boot(page, after) {
    chrome(page);
    if (after) after();
    /* page controllers bind their own accordions; this catches any static ones */
    qsa('[data-accordion]').forEach(function (n) { accordion(n, { single: true }); });
    initAnchors();
    A.motion.boot();
  }

  A.UI = {
    boot: boot, chrome: chrome, toast: toast, accordion: accordion,
    drawer: drawer, modal: modal, el: el, esc: esc, qs: qs, qsa: qsa,
    ICON: ICON, starsRO: starsRO, initials: initials, marquee: marquee,
    faq: faq, openBadge: openBadge, mapSrc: mapSrc, NAV: NAV
  };
})(window, document);
