/* ============================================================
   AURORA — PAGE CONTROLLERS
   One function per page, wired up from the page's own <script>.
   ============================================================ */
(function (w, d) {
  'use strict';

  var A = w.AURORA;
  var UI = A.UI, S = A.Store, F = A.fmt, V = A.valid;
  var qs = UI.qs, qsa = UI.qsa, esc = UI.esc, ICON = UI.ICON;

  /* ============================================================
     SHARED HELPERS
     ============================================================ */

  /** First bookable slot from today onward. */
  function nextAvailable(clinicId, dentistId) {
    var d0 = new Date();
    for (var i = 0; i < 30; i++) {
      var iso = F.iso(d0);
      var r = S.slotsFor({ date: iso, clinic: clinicId, dentist: dentistId || 'any', duration: 45 });
      if (r.state === 'open') {
        var free = r.slots.filter(function (s) { return s.free; });
        if (free.length) return { date: iso, time: free[0].time, count: free.length };
      }
      d0.setDate(d0.getDate() + 1);
    }
    return null;
  }

  /** Generic field-level validation binder. */
  function bindForm(form, rules, onOk) {
    if (!form) return;
    var fields = Object.keys(rules);

    function fieldEl(name) { return form.querySelector('[name="' + name + '"]'); }
    function wrapOf(input) { return input.closest('.fld') || input.closest('.check') || input.parentElement; }

    function check(name, silent) {
      var input = fieldEl(name);
      if (!input) return true;
      var rule = rules[name];
      var val = input.type === 'checkbox' ? input.checked : input.value;
      var ok = rule.test(val, form);
      var wrap = wrapOf(input);
      if (wrap) {
        wrap.classList.toggle('is-bad', !ok && !silent);
        var err = wrap.querySelector('.fld__err');
        if (err && rule.msg) err.textContent = rule.msg;
      }
      return ok;
    }

    fields.forEach(function (name) {
      var input = fieldEl(name);
      if (!input) return;
      input.addEventListener('blur', function () { check(name); });
      input.addEventListener('input', function () {
        var wrap = wrapOf(input);
        if (wrap && wrap.classList.contains('is-bad')) check(name);
      });
      input.addEventListener('change', function () { check(name); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = fields.filter(function (n) { return !check(n); });
      if (bad.length) {
        UI.toast(bad.length === 1 ? 'One field needs attention' : bad.length + ' fields need attention', true);
        var first = fieldEl(bad[0]);
        if (first) { A.motion.scrollTo(first.closest('.fld') || first, { offset: -180 }); first.focus({ preventScroll: true }); }
        return;
      }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      fields.forEach(function (n) {
        var el = fieldEl(n);
        if (el && el.type === 'checkbox') data[n] = el.checked;
      });
      onOk(data, form);
    });
    return { check: check };
  }

  /** Small stat/label building blocks reused across pages. */
  function factCell(k, v) {
    return '<div><div class="bio__k">' + esc(k) + '</div><div class="bio__v">' + v + '</div></div>';
  }

  function serviceCard(s) {
    return '<article class="hsc__panel">' +
      '<div class="hsc__img mzoom" data-cursor="' + esc(s.name) + '">' +
        '<img class="cover" src="' + s.img + '" alt="' + esc(s.name) + '" loading="lazy">' +
      '</div>' +
      '<div class="hsc__body">' +
        '<span class="idx">' + s.no + ' / ' + esc(s.cat) + '</span>' +
        '<h3 class="hsc__t">' + esc(s.name) + '</h3>' +
        '<p class="hsc__d">' + esc(s.short) + '</p>' +
        '<div class="hsc__meta"><span>' + esc(s.durLabel) + '</span>' +
        '<b>' + F.huf(s.price) + '</b></div>' +
      '</div>' +
      '<a href="services.html#' + s.id + '" class="sr">More about ' + esc(s.name) + '</a>' +
    '</article>';
  }

  function reviewCard(r, wide) {
    var svc = S.service(r.svc);
    var loc = S.location(r.loc);
    return '<article class="qcard"' + (wide ? ' style="width:100%;margin-right:0"' : '') + '>' +
      UI.starsRO(r.r) +
      '<p class="qcard__q">“' + esc(r.t) + '”</p>' +
      '<div class="qcard__f">' +
        '<span class="qcard__av">' + esc(UI.initials(r.n)) + '</span>' +
        '<span><span class="qcard__n">' + esc(r.n) + '</span>' +
        '<span class="qcard__m">' + (svc ? esc(svc.name) : 'Aurora') + ' · ' +
        (loc ? esc(loc.name.replace('Aurora ', '')) : '') + ' · ' + F.ago(r.d) + '</span></span>' +
        '<span class="qcard__m" style="margin-left:auto;white-space:nowrap">' + esc(r.s) + '</span>' +
      '</div>' +
    '</article>';
  }

  function planCard(p) {
    return '<article class="plan__c' + (p.hero ? ' is-hero' : '') + '">' +
      '<div><span class="label"' + (p.hero ? ' style="color:rgba(255,255,255,.5)"' : '') + '>' + esc(p.name) + '</span></div>' +
      '<div class="plan__p">' + F.hufShort(p.price) + '<span> ' + esc(p.per) + '</span></div>' +
      '<p class="plan__d small muted">' + esc(p.d) + '</p>' +
      '<ul class="plan__l">' + p.f.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
      '<a class="btn ' + (p.hero ? 'btn--white' : 'btn--ghost') + ' btn--block" href="booking.html?plan=' + p.id + '">Join ' + esc(p.name) + '</a>' +
    '</article>';
  }

  /* ============================================================
     HOME
     ============================================================ */
  function home() {
    /* marquee */
    var mq = qs('#mqSpecialties');
    if (mq) mq.innerHTML = UI.marquee(A.MARQUEE);

    /* next available badge */
    var next = nextAvailable('belvaros');
    if (next) {
      var n1 = qs('#heroNext'), n2 = qs('#heroNextSub');
      if (n1) n1.textContent = F.short(next.date) + ', ' + next.time;
      if (n2) n2.textContent = 'Aurora Belváros — ' + next.count + ' slots that day';
    }

    /* horizontal treatments */
    var track = qs('#hscTrack');
    if (track) {
      var picks = ['exam', 'hygiene', 'implant', 'aligners', 'veneers', 'whitening', 'crown', 'root', 'kids', 'emergency'];
      track.innerHTML =
        '<div class="hsc__intro only-mob">' +
          '<span class="label"><span class="dot"></span>03 — Treatments</span>' +
          '<h2 class="mt2" style="font-size:var(--fs-h2)">Everything we do, and roughly what it costs.</h2>' +
        '</div>' +
        picks.map(function (id) { return serviceCard(S.service(id)); }).join('') +
        '<article class="hsc__panel" style="display:flex;flex-direction:column;justify-content:center;' +
          'background:var(--ink);color:#fff;border-color:var(--ink)">' +
          '<div style="padding:2rem">' +
            '<span class="label" style="color:rgba(255,255,255,.5)">Eighteen treatments in total</span>' +
            '<h3 class="hsc__t mt2" style="font-size:1.7rem">Every price, in one list.</h3>' +
            '<p class="hsc__d mt2" style="color:rgba(255,255,255,.6)">Nothing hidden behind “from”. Where a range is genuine, both ends are shown.</p>' +
            '<a class="btn btn--white mt3" href="services.html">All treatments' + ICON.arrow + '</a>' +
          '</div>' +
        '</article>';
    }

    /* team peek */
    var peek = qs('#teamPeek');
    if (peek) {
      peek.innerHTML = A.TEAM.slice(0, 5).map(function (p) {
        return '<a class="tpeek__i tcard" href="team.html#' + p.id + '">' +
          '<div class="tcard__f" data-cursor="' + esc(p.name) + '">' +
            '<img src="' + p.img + '" alt="' + esc(p.name) + '" loading="lazy">' +
            '<div class="tcard__ov"><span style="font-size:.78rem">' + esc(p.dept) + '</span>' + ICON.ne + '</div>' +
          '</div>' +
          '<div><div class="tcard__n">' + esc(p.name) + '</div>' +
          '<div class="tcard__r">' + esc(p.role) + '</div></div></a>';
      }).join('');
    }

    /* location rows */
    var rows = qs('#locRows');
    if (rows) {
      rows.innerHTML = A.LOCATIONS.map(function (l) {
        var o = S.openNow(l.id);
        return '<div class="row" style="border-color:rgba(255,255,255,.14)" data-hov="' + l.img + '">' +
          '<a class="row__a" href="locations.html#' + l.id + '">' +
            '<span class="idx" style="color:rgba(255,255,255,.38)">' + l.no + '</span>' +
            '<span><span class="row__t">' + esc(l.name) + '</span></span>' +
            '<span class="row__m">' +
              '<span class="small" style="color:rgba(255,255,255,.55)">' + esc(l.street) + ', ' + esc(l.district) + '</span>' +
              '<span class="tag" style="background:transparent;border-color:rgba(255,255,255,.22);color:' +
                (o.open ? '#8fe0b4' : 'rgba(255,255,255,.55)') + '">' + esc(o.label) + '</span>' +
              '<span style="opacity:.6">' + ICON.ne + '</span>' +
            '</span>' +
          '</a></div>';
      }).join('');
    }

    /* reviews */
    var stars = qs('#revStars');
    if (stars) stars.innerHTML = UI.starsRO(5);
    var rm = qs('#revMarquee');
    if (rm) {
      var picked = S.reviews().slice(0, 8);
      var run = picked.map(function (r) { return reviewCard(r); }).join('');
      rm.innerHTML = '<div class="mq__t" style="animation-duration:64s">' + run + '</div>' +
        '<div class="mq__t" style="animation-duration:64s">' + run + '</div>';
    }

    /* plans */
    var pc = qs('#planCards');
    if (pc) pc.innerHTML = A.PLANS.map(planCard).join('');

    /* faq */
    var fq = qs('#faqHome');
    if (fq) { fq.innerHTML = UI.faq(A.FAQ, 6); UI.accordion(fq, { single: true }); }
  }

  /* ============================================================
     ABOUT
     ============================================================ */
  function about() {
    var vg = qs('#valuesGrid');
    if (vg) {
      vg.innerHTML = A.VALUES.map(function (v) {
        return '<div class="vgrid__i">' +
          '<div class="vgrid__ic">' + (ICON[v.i] || ICON.wave) + '</div>' +
          '<h3 class="vgrid__t">' + esc(v.t) + '</h3>' +
          '<p class="vgrid__d">' + esc(v.d) + '</p></div>';
      }).join('');
    }

    var tl = qs('#timeline');
    if (tl) {
      tl.innerHTML = A.TIMELINE.map(function (t) {
        return '<div class="tl__i" data-rv="up">' +
          '<div class="tl__y">' + esc(t.y) + '</div>' +
          '<h3 class="tl__t">' + esc(t.t) + '</h3>' +
          '<p class="tl__d">' + esc(t.d) + '</p></div>';
      }).join('');
    }

    var tech = qs('#techList');
    if (tech) {
      tech.innerHTML = A.TECH.map(function (t, i) {
        return '<div class="mstep" style="grid-template-columns:4rem 1fr">' +
          '<div class="mstep__n">' + String(i + 1).padStart(2, '0') + '</div>' +
          '<div><h3 class="mstep__t" style="font-size:clamp(1.15rem,1.9vw,1.5rem)">' + esc(t.t) + '</h3>' +
          '<p class="mstep__d">' + esc(t.d) + '</p></div></div>';
      }).join('');
    }

    var sb = qs('#aboutStats');
    if (sb) {
      sb.innerHTML = A.STATS.map(function (s) {
        return '<div class="sband__i"><div class="sband__n">' +
          '<span data-count="' + s.n + '"' + (s.dec ? ' data-dec="' + s.dec + '"' : '') +
          (s.suffix ? ' data-suffix="' + s.suffix + '"' : '') + '>0</span></div>' +
          '<div class="sband__c">' + esc(s.c) + '</div></div>';
      }).join('');
    }
  }

  /* ============================================================
     SERVICES
     ============================================================ */
  function services() {
    var list = qs('#svcList'), chips = qs('#svcChips'), count = qs('#svcCount');
    if (!list) return;
    var active = 'all';

    function render() {
      var items = A.SERVICES.filter(function (s) { return active === 'all' || s.cat === active; });
      if (count) count.textContent = items.length + (items.length === 1 ? ' treatment' : ' treatments');

      list.innerHTML = items.map(function (s) {
        var team = s.team.map(function (id) {
          var p = S.person(id);
          return p ? '<a class="tag" href="team.html#' + p.id + '">' + esc(p.name) + '</a>' : '';
        }).join('');
        return '<div class="svc__i" id="' + s.id + '" data-acc>' +
          '<button class="svc__h" data-acc-h>' +
            '<span class="idx">' + s.no + '</span>' +
            '<span class="svc__t">' + esc(s.name) + '</span>' +
            '<span class="svc__d hide-mob">' + esc(s.short) + '</span>' +
            '<span class="svc__p">' + F.huf(s.price) + '</span>' +
            '<span class="acc__pm"></span>' +
          '</button>' +
          '<div class="svc__b" data-acc-b><div class="svc__bi">' +
            '<figure class="svc__fig mzoom" data-cursor="' + esc(s.name) + '">' +
              '<img class="cover" src="' + s.img + '" alt="' + esc(s.name) + '" loading="lazy"></figure>' +
            '<div>' +
              '<p class="body-lg">' + esc(s.long) + '</p>' +
              '<div class="svc__facts">' +
                factCell('Time in chair', esc(s.durLabel)) +
                factCell('Price', F.huf(s.price) + '<br><span class="xs muted">' + esc(s.priceNote) + '</span>') +
                factCell('Category', esc(s.cat.charAt(0).toUpperCase() + s.cat.slice(1))) +
              '</div>' +
              '<div class="grid" style="grid-template-columns:repeat(2,1fr);gap:2rem">' +
                '<div><div class="bio__k">What is included</div>' +
                  '<ul class="svc__list">' + s.includes.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></div>' +
                '<div><div class="bio__k">Afterwards</div>' +
                  '<p class="small muted mt2">' + esc(s.after) + '</p>' +
                  '<div class="bio__k mt3">Who does this</div>' +
                  '<div class="flex g1 wrap mt2">' + team + '</div>' +
                '</div>' +
              '</div>' +
              '<div class="flex g2 mt4 wrap">' +
                '<a class="btn" href="booking.html?service=' + s.id + '">Book this treatment' + ICON.arrow + '</a>' +
                '<a class="btn btn--ghost" href="contact.html">Ask a question first</a>' +
              '</div>' +
            '</div>' +
          '</div></div></div>';
      }).join('');

      UI.accordion(list, { single: true });
      A.motion.refresh();
    }

    if (chips) {
      chips.innerHTML = A.CATS.map(function (c) {
        return '<button class="chip' + (c.id === 'all' ? ' is-on' : '') + '" data-cat="' + c.id + '">' + esc(c.n) + '</button>';
      }).join('');
      chips.addEventListener('click', function (e) {
        var b = e.target.closest('[data-cat]');
        if (!b) return;
        active = b.dataset.cat;
        qsa('.chip', chips).forEach(function (c) { c.classList.toggle('is-on', c === b); });
        render();
      });
    }

    render();

    /* deep link: open the accordion named in the hash */
    if (location.hash) {
      var target = qs(location.hash);
      if (target && target.classList.contains('svc__i')) {
        setTimeout(function () {
          qs('[data-acc-h]', target).click();
          A.motion.scrollTo(target, { offset: -120 });
        }, 700);
      }
    }
  }

  /* ============================================================
     TEAM
     ============================================================ */
  function team() {
    var grid = qs('#teamGrid'), chips = qs('#teamChips'), count = qs('#teamCount');
    if (!grid) return;
    var dr = UI.drawer();
    var active = 'all';

    var depts = ['all'].concat(A.TEAM.map(function (p) { return p.dept; }).filter(function (v, i, a) { return a.indexOf(v) === i; }));

    function render() {
      var items = A.TEAM.filter(function (p) { return active === 'all' || p.dept === active; });
      if (count) count.textContent = items.length + (items.length === 1 ? ' person' : ' people');
      grid.innerHTML = items.map(function (p) {
        return '<button class="tcard" id="' + p.id + '" data-person="' + p.id + '">' +
          '<div class="tcard__f" data-cursor="Read bio">' +
            '<img src="' + p.img + '" alt="' + esc(p.name) + '" loading="lazy">' +
            '<div class="tcard__ov"><span style="font-size:.78rem">' + esc(p.dept) + '</span>' + ICON.ne + '</div>' +
          '</div>' +
          '<div><div class="tcard__n">' + esc(p.name) + '</div>' +
          '<div class="tcard__r">' + esc(p.role) + '</div>' +
          '<div class="tcard__lang">' + esc(p.langs.join(' · ')) + '</div></div>' +
        '</button>';
      }).join('');
      A.motion.refresh();
    }

    function open(id) {
      var p = S.person(id);
      if (!p) return;
      var locs = p.locations.map(function (l) { return S.location(l).name; }).join(', ');
      var svcs = p.services.map(function (sid) {
        var s = S.service(sid);
        return s ? '<a class="tag" href="services.html#' + s.id + '">' + esc(s.name) + '</a>' : '';
      }).join('');
      dr.show(
        '<div data-dstag><span class="label"><span class="dot"></span>' + esc(p.dept) + '</span></div>' +
        '<figure class="bio__f mt3" data-dstag><img class="cover" src="' + p.img + '" alt="' + esc(p.name) + '"></figure>' +
        '<div data-dstag><h2 style="font-size:clamp(1.8rem,4vw,2.6rem)">' + esc(p.name) + '</h2>' +
        '<p class="lead mt2">' + esc(p.role) + '</p></div>' +
        '<blockquote data-dstag class="mt3" style="font-family:var(--display);font-size:1.3rem;font-weight:350;' +
          'letter-spacing:-.03em;line-height:1.24;color:var(--deep)">“' + esc(p.quote) + '”</blockquote>' +
        '<div class="bio__meta" data-dstag>' +
          factCell('At Aurora since', p.since) +
          factCell('Languages', esc(p.langs.join(', '))) +
          factCell('Studios', esc(locs)) +
          factCell('Focus', esc(p.focus.join(' · '))) +
        '</div>' +
        '<p class="body-lg" data-dstag>' + esc(p.bio) + '</p>' +
        '<div data-dstag class="mt4"><div class="bio__k">Qualifications</div>' +
          '<ul class="svc__list">' + p.creds.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul></div>' +
        '<div data-dstag class="mt4"><div class="bio__k">Treatments</div>' +
          '<div class="flex g1 wrap mt2">' + svcs + '</div></div>' +
        '<div data-dstag class="mt4"><a class="btn btn--block" href="booking.html?dentist=' + p.id + '">' +
          'Book with ' + esc(p.name.split(' ').slice(-1)[0]) + ICON.arrow + '</a></div>'
      );
    }

    if (chips) {
      chips.innerHTML = depts.map(function (dd) {
        return '<button class="chip' + (dd === 'all' ? ' is-on' : '') + '" data-dept="' + esc(dd) + '">' +
          (dd === 'all' ? 'Everyone' : esc(dd)) + '</button>';
      }).join('');
      chips.addEventListener('click', function (e) {
        var b = e.target.closest('[data-dept]');
        if (!b) return;
        active = b.dataset.dept;
        qsa('.chip', chips).forEach(function (c) { c.classList.toggle('is-on', c === b); });
        render();
      });
    }

    grid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-person]');
      if (b) open(b.dataset.person);
    });

    render();
    if (location.hash) setTimeout(function () { open(location.hash.slice(1)); }, 800);
  }

  /* ============================================================
     PRICING
     ============================================================ */
  function pricing() {
    var tabs = qs('#priceTabs'), body = qs('#priceRows'), plans = qs('#pricePlans');
    if (plans) plans.innerHTML = A.PLANS.map(planCard).join('');

    if (tabs && body) {
      var active = 'all';
      function render() {
        var items = A.SERVICES.filter(function (s) { return active === 'all' || s.cat === active; });
        body.innerHTML = items.map(function (s) {
          return '<div class="prow">' +
            '<div><div class="prow__t">' + esc(s.name) + '</div>' +
              '<div class="xs muted mt1">' + esc(s.durLabel) + ' in the chair</div></div>' +
            '<div class="prow__d">' + esc(s.short) + '</div>' +
            '<div class="prow__p">' + F.huf(s.price) + '<small>' + esc(s.priceNote) + '</small></div>' +
            '<a class="btn btn--ghost btn--sm" href="booking.html?service=' + s.id + '">Book</a>' +
          '</div>';
        }).join('');
        A.motion.refresh();
      }
      tabs.innerHTML = A.CATS.map(function (c) {
        return '<button class="' + (c.id === 'all' ? 'is-on' : '') + '" data-cat="' + c.id + '">' + esc(c.n) + '</button>';
      }).join('');
      tabs.addEventListener('click', function (e) {
        var b = e.target.closest('[data-cat]');
        if (!b) return;
        active = b.dataset.cat;
        qsa('button', tabs).forEach(function (x) { x.classList.toggle('is-on', x === b); });
        render();
      });
      render();
    }

    /* instalment calculator */
    var amt = qs('#calcAmt'), mon = qs('#calcMon');
    if (amt && mon) {
      var amtOut = qs('#calcAmtOut'), monOut = qs('#calcMonOut');
      var perOut = qs('#calcPer'), totOut = qs('#calcTot'), feeOut = qs('#calcFee'), depOut = qs('#calcDep');
      function calc() {
        var total = +amt.value, months = +mon.value;
        var deposit = Math.round(total * 0.2);
        var financed = total - deposit;
        var per = Math.round(financed / months);
        if (amtOut) amtOut.textContent = F.huf(total);
        if (monOut) monOut.textContent = months + ' months';
        if (perOut) perOut.textContent = F.huf(per);
        if (depOut) depOut.textContent = F.huf(deposit);
        if (totOut) totOut.textContent = F.huf(total);
        if (feeOut) feeOut.textContent = '0 Ft';
      }
      amt.addEventListener('input', calc);
      mon.addEventListener('input', calc);
      calc();
    }

    var fq = qs('#faqPricing');
    if (fq) {
      var picks = A.FAQ.filter(function (f) { return /pay|price|insur|guarant|cancel/i.test(f.q); });
      fq.innerHTML = UI.faq(picks);
      UI.accordion(fq, { single: true });
    }
  }

  /* ============================================================
     LOCATIONS
     ============================================================ */
  function locations() {
    var host = qs('#locList');
    if (!host) return;
    var todayIdx = S.todayIndex();

    host.innerHTML = A.LOCATIONS.map(function (l) {
      var o = S.openNow(l.id);
      var next = nextAvailable(l.id);
      var hours = l.hours.map(function (h, i) {
        return '<div' + (i === todayIdx ? ' class="today"' : '') + '><span>' + esc(h[0]) + '</span>' +
          '<span>' + (h[1] ? esc(h[1] + ' — ' + h[2]) : 'Closed') + '</span></div>';
      }).join('');

      return '<section class="loc" id="' + l.id + '">' +
        '<div>' +
          '<figure class="loc__fig mzoom" data-clip data-cursor="' + esc(l.name) + '">' +
            '<img class="cover" src="' + l.img + '" alt="' + esc(l.name) + '" loading="lazy">' +
            '<span class="loc__no">' + l.no + '</span>' +
          '</figure>' +
          '<div class="flex g1 wrap mt3">' +
            l.features.map(function (f) { return '<span class="tag">' + esc(f) + '</span>'; }).join('') +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div class="between wrap g2">' +
            '<span class="label"><span class="dot"></span>' + esc(l.role) + '</span>' +
            '<span class="tag ' + (o.open ? 'tag--live' : 'tag--shut') + '"><span class="dot"></span>' + esc(o.label) + '</span>' +
          '</div>' +
          '<h2 class="mt2" style="font-size:clamp(1.9rem,4vw,3.1rem)">' + esc(l.name) + '</h2>' +
          '<p class="lead mt3 mw-md">' + esc(l.blurb) + '</p>' +

          '<div class="loc__hrs">' + hours + '</div>' +

          '<div class="grid" style="grid-template-columns:repeat(2,1fr);gap:1.6rem">' +
            '<div><div class="bio__k">Address</div>' +
              '<p class="small">' + esc(l.street) + '<br>' + esc(l.district) + '<br>' + esc(l.post) + '</p></div>' +
            '<div><div class="bio__k">Direct line</div>' +
              '<p class="small"><a class="ulink" href="tel:' + l.phoneHref + '">' + esc(l.phone) + '</a><br>' +
              '<a class="ulink" href="mailto:' + l.email + '">' + esc(l.email) + '</a></p></div>' +
          '</div>' +

          '<div class="mt4"><div class="bio__k">Getting here</div>' +
            '<ul class="svc__list">' + l.transport.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>' +

          '<div class="loc__map mt4"><iframe title="Map of ' + esc(l.name) + '" loading="lazy" src="' + UI.mapSrc(l) + '"></iframe></div>' +

          '<div class="between mt4 wrap g2">' +
            '<div><div class="bio__k">Next free appointment</div>' +
              '<div style="font-family:var(--display);font-size:1.3rem;letter-spacing:-.03em;margin-top:.3rem">' +
              (next ? esc(F.short(next.date) + ', ' + next.time) : 'Call us') + '</div></div>' +
            '<a class="btn" href="booking.html?clinic=' + l.id + '">Book at ' + esc(l.name.replace('Aurora ', '')) + ICON.arrow + '</a>' +
          '</div>' +

          '<div class="mt4" style="display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem">' +
            l.gallery.map(function (g) {
              return '<figure class="soft ar-1 mzoom"><img class="cover" src="' + g + '" alt="" loading="lazy"></figure>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</section>';
    }).join('');

    if (location.hash) {
      var t = qs(location.hash);
      if (t) setTimeout(function () { A.motion.scrollTo(t, { offset: -110 }); }, 800);
    }
  }

  /* ============================================================
     REVIEWS
     ============================================================ */
  function reviews() {
    var grid = qs('#revGrid'), chips = qs('#revChips'), sortSel = qs('#revSort');
    var moreBtn = qs('#revMore'), countEl = qs('#revCount');
    if (!grid) return;

    var filter = 'all', sort = 'recent', shown = 9;

    function pool() {
      var list = S.reviews().slice();
      if (filter !== 'all') {
        list = list.filter(function (r) {
          return r.svc === filter || r.loc === filter || String(r.r) === filter;
        });
      }
      list.sort(function (a, b) {
        if (sort === 'recent') return a.d < b.d ? 1 : -1;
        if (sort === 'oldest') return a.d > b.d ? 1 : -1;
        if (sort === 'high') return b.r - a.r || (a.d < b.d ? 1 : -1);
        return a.r - b.r || (a.d < b.d ? 1 : -1);
      });
      return list;
    }

    function render() {
      var list = pool();
      var slice = list.slice(0, shown);
      grid.innerHTML = slice.length
        ? slice.map(function (r) { return reviewCard(r, true); }).join('')
        : '<div class="empty">No reviews match that filter yet.</div>';
      if (countEl) countEl.textContent = 'Showing ' + slice.length + ' of ' + list.length;
      if (moreBtn) moreBtn.style.display = slice.length >= list.length ? 'none' : '';
      A.motion.refresh();
    }

    /* summary */
    var b = S.ratingBreakdown();
    var avgEl = qs('#revAvg');
    if (avgEl) avgEl.setAttribute('data-count', b.avg.toFixed(1));
    var starsEl = qs('#revAvgStars');
    if (starsEl) starsEl.innerHTML = UI.starsRO(Math.round(b.avg));
    var totalEl = qs('#revTotal');
    if (totalEl) totalEl.textContent = '1,240 verified reviews';

    var bars = qs('#revBars');
    if (bars) {
      bars.innerHTML = [5, 4, 3, 2, 1].map(function (n) {
        var pct = b.total ? (b.counts[n] / b.total) * 100 : 0;
        var display = { 5: 92, 4: 6, 3: 1, 2: 0.6, 1: 0.4 }[n];
        return '<div class="rbar"><span>' + n + ' ★</span>' +
          '<span class="rbar__t"><i data-w="' + display + '"></i></span>' +
          '<span>' + display + '%</span></div>';
      }).join('');
    }

    var src = qs('#revSources');
    if (src) {
      src.innerHTML = [['Google', '4.9', '840'], ['Doctolib', '4.9', '268'], ['Facebook', '4.8', '132']]
        .map(function (s) {
          return '<div class="rsrc__i"><span>' + s[0] + '</span>' +
            '<span class="flex g1 center"><b style="font-family:var(--display);font-weight:400">' + s[1] + '</b>' +
            '<span class="xs muted">' + s[2] + ' reviews</span></span></div>';
        }).join('');
    }

    /* filters */
    if (chips) {
      var opts = [{ id: 'all', n: 'All reviews' }, { id: '5', n: '5 stars' }]
        .concat(A.LOCATIONS.map(function (l) { return { id: l.id, n: l.name.replace('Aurora ', '') }; }))
        .concat(['implant', 'aligners', 'veneers', 'hygiene', 'root', 'whitening'].map(function (id) {
          return { id: id, n: S.service(id).name };
        }));
      chips.innerHTML = opts.map(function (o) {
        return '<button class="chip' + (o.id === 'all' ? ' is-on' : '') + '" data-f="' + o.id + '">' + esc(o.n) + '</button>';
      }).join('');
      chips.addEventListener('click', function (e) {
        var t = e.target.closest('[data-f]');
        if (!t) return;
        filter = t.dataset.f; shown = 9;
        qsa('.chip', chips).forEach(function (c) { c.classList.toggle('is-on', c === t); });
        render();
      });
    }
    if (sortSel) sortSel.addEventListener('change', function () { sort = sortSel.value; render(); });
    if (moreBtn) moreBtn.addEventListener('click', function () { shown += 9; render(); });

    render();

    /* write a review */
    var form = qs('#reviewForm');
    if (form) {
      var rating = 0;
      var starHost = qs('#starPick');
      if (starHost) {
        starHost.innerHTML = [1, 2, 3, 4, 5].map(function (n) {
          return '<button type="button" data-star="' + n + '" aria-label="' + n + ' stars">' + ICON.star + '</button>';
        }).join('');
        starHost.addEventListener('click', function (e) {
          var btn = e.target.closest('[data-star]');
          if (!btn) return;
          rating = +btn.dataset.star;
          qsa('button', starHost).forEach(function (x) { x.classList.toggle('on', +x.dataset.star <= rating); });
          var err = qs('#starErr');
          if (err) err.style.opacity = 0;
        });
        starHost.addEventListener('mouseover', function (e) {
          var btn = e.target.closest('[data-star]');
          if (!btn) return;
          qsa('button', starHost).forEach(function (x) { x.classList.toggle('on', +x.dataset.star <= +btn.dataset.star); });
        });
        starHost.addEventListener('mouseleave', function () {
          qsa('button', starHost).forEach(function (x) { x.classList.toggle('on', +x.dataset.star <= rating); });
        });
      }

      var svcSel = qs('#revSvc'), locSel = qs('#revLoc');
      if (svcSel) svcSel.innerHTML = '<option value="">Select a treatment</option>' +
        A.SERVICES.map(function (s) { return '<option value="' + s.id + '">' + esc(s.name) + '</option>'; }).join('');
      if (locSel) locSel.innerHTML = '<option value="">Select a studio</option>' +
        A.LOCATIONS.map(function (l) { return '<option value="' + l.id + '">' + esc(l.name) + '</option>'; }).join('');

      bindForm(form, {
        name: { test: V.name, msg: 'Please give a name we can publish' },
        svc: { test: V.required, msg: 'Which treatment was it?' },
        loc: { test: V.required, msg: 'Which studio?' },
        text: { test: V.minLen(40), msg: 'A little more detail, please — at least 40 characters' }
      }, function (data) {
        if (!rating) {
          var err = qs('#starErr');
          if (err) err.style.opacity = 1;
          UI.toast('Choose a star rating first', true);
          return;
        }
        S.addReview({ n: data.name, r: rating, svc: data.svc, loc: data.loc, t: data.text });
        form.reset();
        rating = 0;
        qsa('button', starHost).forEach(function (x) { x.classList.remove('on'); });
        qsa('.fld', form).forEach(function (f) { f.classList.remove('has-val'); });
        filter = 'all'; shown = 9;
        if (chips) qsa('.chip', chips).forEach(function (c, i) { c.classList.toggle('is-on', i === 0); });
        render();
        UI.toast('Thank you — your review is live at the top');
        A.motion.scrollTo(grid, { offset: -140 });
      });
    }
  }

  /* ============================================================
     CONTACT
     ============================================================ */
  function contact() {
    /* info blocks */
    var info = qs('#contactInfo');
    if (info) {
      var rows = [
        { i: 'phone', k: 'Reception', v: '<a class="ulink" href="tel:' + A.CLINIC.phoneHref + '">' + A.CLINIC.phone + '</a>', s: 'Monday to Friday, 08:00 — 20:00' },
        { i: 'phone', k: 'Out of hours', v: '<a class="ulink" href="tel:' + A.CLINIC.emergencyHref + '">' + A.CLINIC.emergency + '</a>', s: 'Evenings, weekends and holidays' },
        { i: 'mail', k: 'Email', v: '<a class="ulink" href="mailto:' + A.CLINIC.email + '">' + A.CLINIC.email + '</a>', s: 'Answered within one working day' },
        { i: 'pin', k: 'Main studio', v: 'Váci utca 32, V. kerület', s: '1052 Budapest — two more studios in Buda and on Andrássy' },
        { i: 'clock', k: 'Right now', v: UI.openBadge('belvaros'), s: 'Belváros reception' }
      ];
      info.innerHTML = rows.map(function (r) {
        return '<div class="cinfo__i"><span class="cinfo__ic">' + ICON[r.i] + '</span>' +
          '<span><span class="bio__k">' + esc(r.k) + '</span>' +
          '<div style="font-size:1.05rem;margin:.25rem 0 .3rem">' + r.v + '</div>' +
          '<span class="xs muted">' + esc(r.s) + '</span></span></div>';
      }).join('');
    }

    /* selects */
    var locSel = qs('#cLoc');
    if (locSel) locSel.innerHTML = '<option value="">No preference</option>' +
      A.LOCATIONS.map(function (l) { return '<option value="' + l.id + '">' + esc(l.name) + '</option>'; }).join('');

    /* map */
    var map = qs('#contactMap');
    if (map) map.innerHTML = '<iframe title="Map of Aurora Belváros" loading="lazy" src="' + UI.mapSrc(A.LOCATIONS[0], 0.01) + '"></iframe>';

    /* faq */
    var fq = qs('#faqContact');
    if (fq) { fq.innerHTML = UI.faq(A.FAQ); UI.accordion(fq, { single: true }); }

    /* form */
    var form = qs('#contactForm');
    if (!form) return;
    bindForm(form, {
      name: { test: V.name, msg: 'Please tell us your name' },
      email: { test: V.email, msg: 'That email address does not look right' },
      phone: { test: function (v) { return !v || V.phone(v); }, msg: 'Use a number we can actually dial' },
      subject: { test: V.required, msg: 'Pick the closest match' },
      message: { test: V.minLen(15), msg: 'A sentence or two, so we can answer properly' },
      consent: { test: function (v) { return v === true; }, msg: 'We need your consent to reply' }
    }, function (data) {
      var rec = S.addMessage(data);
      var wrap = form.parentElement;
      wrap.innerHTML =
        '<div class="card" style="border-color:var(--aurora);background:var(--mist)">' +
          '<span class="label label--blue"><span class="dot"></span>Message sent</span>' +
          '<h3 class="mt3" style="font-size:clamp(1.6rem,3vw,2.2rem)">Thank you, ' + esc(String(data.name).split(' ')[0]) + '.</h3>' +
          '<p class="lead mt2 mw-sm">Your message is with the ' +
            (data.location ? esc(S.location(data.location).name) : 'Belváros') +
            ' team. We answer everything within one working day — sooner if it is urgent.</p>' +
          '<div class="bio__meta" style="border-color:var(--ice)">' +
            factCell('Reference', '<b>' + esc(rec.ref) + '</b>') +
            factCell('Replying to', esc(data.email)) +
          '</div>' +
          '<div class="flex g2 wrap"><a class="btn" href="booking.html">Book an appointment' + ICON.arrow + '</a>' +
          '<a class="btn btn--ghost" href="index.html">Back to the homepage</a></div>' +
        '</div>';
      A.motion.scrollTo(wrap, { offset: -160 });
      UI.toast('Message sent — reference ' + rec.ref);
    });
  }

  A.pages = {
    home: home, about: about, services: services, team: team,
    pricing: pricing, locations: locations, reviews: reviews, contact: contact
  };
  A.helpers = { nextAvailable: nextAvailable, bindForm: bindForm, factCell: factCell, reviewCard: reviewCard };
})(window, document);
