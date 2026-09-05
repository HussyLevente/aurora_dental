/* ============================================================
   AURORA — BOOKING WIZARD
   Six steps, a real availability engine, and a diary that
   persists in the browser until a server takes over.
   ============================================================ */
(function (w, d) {
  'use strict';

  var A = w.AURORA;
  var UI = A.UI, S = A.Store, F = A.fmt, V = A.valid;
  var qs = UI.qs, qsa = UI.qsa, esc = UI.esc, ICON = UI.ICON;

  var STEPS = ['Studio', 'Treatment', 'Clinician', 'Date & time', 'Your details', 'Confirm'];

  function booking() {
    var root = qs('#wiz');
    if (!root) return;

    /* ---------- state ---------- */
    var params = new URLSearchParams(location.search);
    var st = {
      step: 0,
      clinic: params.get('clinic') || '',
      service: params.get('service') || '',
      dentist: params.get('dentist') || '',
      date: '',
      time: '',
      details: {},
      plan: params.get('plan') || ''
    };
    /* if a dentist came in on the URL, adopt one of their studios */
    if (st.dentist && !st.clinic) {
      var p0 = S.person(st.dentist);
      if (p0) st.clinic = p0.locations[0];
    }
    var view = { y: new Date().getFullYear(), m: new Date().getMonth() };

    var stepsEl = qs('#wizSteps'), panelsEl = qs('#wizPanels');
    var navEl = qs('#wizNav'), asideEl = qs('#wizAside');

    /* ============================================================
       CHROME
       ============================================================ */
    function renderSteps() {
      stepsEl.innerHTML = STEPS.map(function (s, i) {
        var cls = i === st.step ? 'is-on' : (i < st.step ? 'is-done' : '');
        return '<button class="wiz__step ' + cls + '" data-goto="' + i + '"' +
          (i > furthest() ? ' disabled' : '') + '>' +
          '<span class="n">' + (i < st.step ? '✓' : i + 1) + '</span>' + esc(s) + '</button>';
      }).join('');
    }

    function furthest() {
      if (!st.clinic) return 0;
      if (!st.service) return 1;
      if (!st.dentist) return 2;
      if (!st.date || !st.time) return 3;
      if (!st.details.email) return 4;
      return 5;
    }

    function renderAside() {
      var svc = st.service ? S.service(st.service) : null;
      var loc = st.clinic ? S.location(st.clinic) : null;
      var per = st.dentist === 'any' ? { name: 'No preference' } : (st.dentist ? S.person(st.dentist) : null);

      function line(k, v) {
        return '<div class="wiz__line"><span class="k">' + esc(k) + '</span>' +
          '<span class="v' + (v ? '' : ' is-empty') + '">' + (v || 'Not chosen') + '</span></div>';
      }

      asideEl.innerHTML =
        '<div class="wiz__ahead"><span class="label"><span class="dot"></span>Your appointment</span></div>' +
        '<div class="wiz__abody">' +
          line('Studio', loc ? esc(loc.name) : '') +
          line('Treatment', svc ? esc(svc.name) : '') +
          line('Clinician', per ? esc(per.name) : '') +
          line('Date', st.date ? esc(F.medium(st.date)) : '') +
          line('Time', st.time ? esc(st.time) + (svc ? ' — ' + F.dur(svc.dur) : '') : '') +
        '</div>' +
        (svc ? '<div class="wiz__total"><span class="small muted">' + esc(svc.priceNote) + '</span>' +
          '<b>' + F.huf(svc.price) + '</b></div>' : '') +
        '<div style="padding:1.1rem 1.4rem;border-top:1px solid var(--line)">' +
          '<p class="xs muted">Free to cancel or move up to 24 hours before. Nothing is charged today — you pay at the studio.</p>' +
        '</div>';
    }

    function renderNav() {
      var last = st.step === STEPS.length - 1;
      navEl.innerHTML =
        '<button class="btn btn--ghost" id="wizBack"' + (st.step === 0 ? ' disabled' : '') + '>Back</button>' +
        '<span class="mag"><button class="btn" id="wizNext">' +
          (last ? 'Confirm appointment' : 'Continue') + ICON.arrow + '</button></span>';
      qs('#wizBack').addEventListener('click', function () { go(st.step - 1); });
      qs('#wizNext').addEventListener('click', next);
    }

    /* ============================================================
       STEP 1 — STUDIO
       ============================================================ */
    function stepStudio() {
      return '<div class="wiz__panel is-on">' +
        head('01', 'Which studio suits you?', 'All three keep the same prices, the same records and the same standard. Pick the one you can reach without effort.') +
        '<div class="opts opts--3 mt4">' +
          A.LOCATIONS.map(function (l) {
            var o = S.openNow(l.id);
            var n = A.helpers.nextAvailable(l.id);
            return '<label class="opt' + (st.clinic === l.id ? ' is-on' : '') + '" data-pick="clinic" data-val="' + l.id + '">' +
              '<input type="radio" name="clinic" value="' + l.id + '"' + (st.clinic === l.id ? ' checked' : '') + '>' +
              '<span class="opt__t">' + esc(l.name.replace('Aurora ', '')) + '<span class="idx">' + l.no + '</span></span>' +
              '<span class="opt__d">' + esc(l.street) + ', ' + esc(l.district) + '</span>' +
              '<span class="flex g1 wrap" style="margin-top:.9rem">' +
                '<span class="tag ' + (o.open ? 'tag--live' : 'tag--shut') + '"><span class="dot"></span>' + esc(o.label) + '</span>' +
              '</span>' +
              '<span class="opt__d" style="margin-top:.7rem">Next free: <b>' +
                (n ? esc(F.short(n.date) + ' ' + n.time) : 'call us') + '</b></span>' +
            '</label>';
          }).join('') +
        '</div>' +
        '<div class="note mt4">' + ICON.info +
          '<span>In pain today? Call <a class="ulink" href="tel:' + A.CLINIC.phoneHref + '"><b>' +
          A.CLINIC.phone + '</b></a> before 10:00 and we will almost always see you the same day — every studio holds emergency slots back.</span></div>' +
      '</div>';
    }

    /* ============================================================
       STEP 2 — TREATMENT
       ============================================================ */
    function stepService() {
      var cats = A.CATS.filter(function (c) { return c.id !== 'all'; });
      return '<div class="wiz__panel is-on">' +
        head('02', 'What are we booking?', 'Not sure? Choose the examination — it is the right first step for almost everything, and the fee comes off whatever follows.') +
        '<div class="chips mt4" id="bkCats">' +
          '<button class="chip is-on" data-cat="all">Everything</button>' +
          cats.map(function (c) { return '<button class="chip" data-cat="' + c.id + '">' + esc(c.n) + '</button>'; }).join('') +
        '</div>' +
        '<div class="opts mt3" id="bkServices"></div>' +
      '</div>';
    }

    function paintServices(cat) {
      var host = qs('#bkServices');
      if (!host) return;
      var list = A.SERVICES.filter(function (s) { return !cat || cat === 'all' || s.cat === cat; });
      host.innerHTML = list.map(function (s) {
        return '<label class="opt' + (st.service === s.id ? ' is-on' : '') + '" data-pick="service" data-val="' + s.id + '">' +
          '<input type="radio" name="service" value="' + s.id + '"' + (st.service === s.id ? ' checked' : '') + '>' +
          '<span class="opt__t">' + esc(s.name) +
            '<span class="opt__p">' + F.huf(s.price) + '</span></span>' +
          '<span class="opt__d">' + esc(s.short) + ' · ' + esc(s.durLabel) + '</span>' +
        '</label>';
      }).join('');
    }

    /* ============================================================
       STEP 3 — CLINICIAN
       ============================================================ */
    function stepDentist() {
      var team = S.teamFor(st.service, st.clinic);
      if (!team.length) team = S.teamFor(null, st.clinic);
      var svc = S.service(st.service);

      return '<div class="wiz__panel is-on">' +
        head('03', 'Anyone in particular?', 'These are the clinicians who do ' +
          esc(svc ? svc.name.toLowerCase() : 'this treatment') + ' at ' +
          esc(S.location(st.clinic).name) + '. No preference is genuinely fine — it usually means an earlier slot.') +
        '<div class="opts opts--2 mt4">' +
          '<label class="opt' + (st.dentist === 'any' ? ' is-on' : '') + '" data-pick="dentist" data-val="any">' +
            '<input type="radio" name="dentist" value="any"' + (st.dentist === 'any' ? ' checked' : '') + '>' +
            '<span class="opt__t">No preference</span>' +
            '<span class="opt__d">Whoever is free soonest. Most patients choose this.</span>' +
          '</label>' +
          team.map(function (p) {
            return '<label class="opt' + (st.dentist === p.id ? ' is-on' : '') + '" data-pick="dentist" data-val="' + p.id + '">' +
              '<input type="radio" name="dentist" value="' + p.id + '"' + (st.dentist === p.id ? ' checked' : '') + '>' +
              '<span class="flex g2" style="align-items:center">' +
                '<img src="' + p.img + '" alt="" style="width:52px;height:52px;border-radius:50%;object-fit:cover;flex:none">' +
                '<span><span class="opt__t" style="display:block">' + esc(p.name) + '</span>' +
                '<span class="opt__d">' + esc(p.role) + ' · ' + esc(p.langs.join(', ')) + '</span></span>' +
              '</span>' +
            '</label>';
          }).join('') +
        '</div>' +
      '</div>';
    }

    /* ============================================================
       STEP 4 — DATE & TIME
       ============================================================ */
    function stepWhen() {
      return '<div class="wiz__panel is-on">' +
        head('04', 'Pick a day, then a time', 'The diary below is live. Days with a dot have space; struck-through days are closed or fully booked.') +
        '<div class="grid mt4" style="grid-template-columns:repeat(12,1fr);gap:var(--gut)">' +
          '<div style="grid-column:span 6" id="calHost"></div>' +
          '<div style="grid-column:span 6" id="slotHost"></div>' +
        '</div>' +
      '</div>';
    }

    function paintCalendar() {
      var host = qs('#calHost');
      if (!host) return;
      var svc = S.service(st.service);
      var dur = svc ? svc.dur : 45;

      var first = new Date(view.y, view.m, 1);
      var startPad = (first.getDay() + 6) % 7;              // Monday-first
      var days = new Date(view.y, view.m + 1, 0).getDate();
      var todayISO = F.iso(new Date());
      var minM = new Date().getFullYear() * 12 + new Date().getMonth();
      var curM = view.y * 12 + view.m;

      var cells = '';
      for (var i = 0; i < startPad; i++) cells += '<span class="cal__d pad"></span>';
      for (var day = 1; day <= days; day++) {
        var iso = view.y + '-' + String(view.m + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        var info = S.dayInfo(iso, st.clinic);
        var free = info.state === 'open' && S.dayHasSpace(iso, st.clinic, st.dentist, dur);
        var cls = 'cal__d ' + (free ? 'free' : 'off') +
          (iso === todayISO ? ' today' : '') + (iso === st.date ? ' is-on' : '');
        var title = free ? 'Available' : (info.why || 'No space');
        cells += '<button class="' + cls + '" data-day="' + iso + '" title="' + esc(title) + '"' +
          (free ? '' : ' disabled') + '>' + day + '</button>';
      }

      host.innerHTML =
        '<div class="cal">' +
          '<div class="cal__h">' +
            '<span class="cal__m">' + esc(F.monthYear(view.y, view.m)) + '</span>' +
            '<span class="cal__nav">' +
              '<button data-mv="-1"' + (curM <= minM ? ' disabled' : '') + ' aria-label="Previous month">' + ICON.prev + '</button>' +
              '<button data-mv="1"' + (curM >= minM + 4 ? ' disabled' : '') + ' aria-label="Next month">' + ICON.next + '</button>' +
            '</span>' +
          '</div>' +
          '<div class="cal__dow"><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span></div>' +
          '<div class="cal__grid">' + cells + '</div>' +
          '<div class="cal__legend"><span><i></i>Space available</span>' +
            '<span style="opacity:.6">Struck through — closed or full</span></div>' +
        '</div>';
      paintSlots();
    }

    function paintSlots() {
      var host = qs('#slotHost');
      if (!host) return;
      if (!st.date) {
        host.innerHTML = '<div class="empty" style="height:100%;display:grid;place-content:center">' +
          'Choose a day on the left<br><span class="xs">and the times will appear here</span></div>';
        return;
      }
      var svc = S.service(st.service);
      var res = S.slotsFor({ date: st.date, clinic: st.clinic, dentist: st.dentist, duration: svc ? svc.dur : 45 });
      if (res.state !== 'open') {
        host.innerHTML = '<div class="empty">' + esc(res.why || 'Closed') + '</div>';
        return;
      }
      var groups = {};
      res.slots.forEach(function (s) { (groups[s.period] = groups[s.period] || []).push(s); });

      host.innerHTML =
        '<div class="between mb3 wrap g1">' +
          '<span class="label label--ink">' + esc(F.long(st.date)) + '</span>' +
          '<span class="xs muted">' + res.free + ' of ' + res.slots.length + ' free</span>' +
        '</div>' +
        ['Morning', 'Afternoon', 'Evening'].filter(function (g) { return groups[g]; }).map(function (g) {
          return '<div class="slots__grp"><div class="bio__k mb2">' + g + '</div><div class="slots">' +
            groups[g].map(function (s) {
              return '<button class="slot' + (st.time === s.time ? ' is-on' : '') + '"' +
                (s.free ? '' : ' disabled title="' + esc(s.reason || 'Taken') + '"') +
                ' data-slot="' + s.time + '">' + s.time + '</button>';
            }).join('') + '</div></div>';
        }).join('') +
        (res.free === 0 ? '<div class="note">' + ICON.info + '<span>Nothing left that day. Try the next one with a dot — or call us and we will find something.</span></div>' : '');
    }

    /* ============================================================
       STEP 5 — DETAILS
       ============================================================ */
    function stepDetails() {
      var v = st.details;
      function fld(name, label, type, span, extra) {
        return '<label class="fld' + (span ? ' span2' : '') + '">' +
          '<input type="' + (type || 'text') + '" name="' + name + '" placeholder=" " ' +
          (extra || '') + ' value="' + esc(v[name] || '') + '">' +
          '<span class="fld__lb">' + esc(label) + '</span>' +
          '<span class="fld__err"></span></label>';
      }
      return '<div class="wiz__panel is-on">' +
        head('05', 'A few details', 'Only what we genuinely need. Everything stays in this browser until you have a backend behind it.') +
        '<form id="wizForm" class="form-grid mt4" novalidate>' +
          fld('first', 'First name') +
          fld('last', 'Last name') +
          fld('email', 'Email address', 'email') +
          fld('phone', 'Mobile number', 'tel', false, 'placeholder="+36 30 123 4567"') +
          fld('dob', 'Date of birth', 'date') +
          '<label class="fld">' +
            '<select name="status">' +
              '<option value="new"' + (v.status === 'new' ? ' selected' : '') + '>New patient</option>' +
              '<option value="returning"' + (v.status === 'returning' ? ' selected' : '') + '>Returning patient</option>' +
              '<option value="transfer"' + (v.status === 'transfer' ? ' selected' : '') + '>Transferring from another practice</option>' +
            '</select><span class="fld__lb" style="transform:translateY(-1.42rem) scale(.68);letter-spacing:.08em;text-transform:uppercase">Patient status</span>' +
            '<span class="fld__err"></span></label>' +
          '<label class="fld span2"><textarea name="notes" placeholder=" ">' + esc(v.notes || '') + '</textarea>' +
            '<span class="fld__lb">Anything we should know? Anxiety, medication, a tooth that is bothering you</span>' +
            '<span class="fld__err"></span></label>' +
          '<div class="span2 col g2">' +
            '<label class="check"><input type="checkbox" name="consent"' + (v.consent ? ' checked' : '') + '>' +
              '<span class="bx">' + ICON.check + '</span>' +
              '<span>I agree to Aurora holding these details in order to arrange and deliver my care. ' +
              '<a class="ulink" href="#">Privacy notice</a>.</span></label>' +
            '<label class="check"><input type="checkbox" name="remind"' + (v.remind !== false ? ' checked' : '') + '>' +
              '<span class="bx">' + ICON.check + '</span>' +
              '<span>Send me a reminder the day before. Recommended — it halves the number of missed appointments.</span></label>' +
            '<span class="fld__err" style="opacity:1;height:auto"></span>' +
          '</div>' +
        '</form>' +
      '</div>';
    }

    function bindDetails() {
      var form = qs('#wizForm');
      if (!form) return;
      qsa('.fld', form).forEach(function (f) {
        var i = f.querySelector('input,textarea,select');
        if (i && i.value) f.classList.add('has-val');
        if (i) i.addEventListener('input', function () { f.classList.toggle('has-val', !!i.value); });
      });
      form.addEventListener('submit', function (e) { e.preventDefault(); next(); });
    }

    function collectDetails(silent) {
      var form = qs('#wizForm');
      if (!form) return false;
      var rules = {
        first: [V.name, 'First name, please'],
        last: [V.name, 'Last name, please'],
        email: [V.email, 'That email does not look right'],
        phone: [V.phone, 'We need a number we can dial'],
        dob: [V.dob, 'Use the date picker — day, month, year'],
        consent: [function (v) { return v === true; }, 'We cannot book without this']
      };
      var ok = true, firstBad = null, data = {};
      Object.keys(rules).forEach(function (name) {
        var el = form.querySelector('[name="' + name + '"]');
        if (!el) return;
        var val = el.type === 'checkbox' ? el.checked : el.value.trim();
        data[name] = val;
        var good = rules[name][0](val);
        var wrap = el.closest('.fld') || el.closest('.col');
        if (wrap) {
          wrap.classList.toggle('is-bad', !good && !silent);
          var err = wrap.querySelector('.fld__err');
          if (err) err.textContent = good ? '' : rules[name][1];
        }
        if (!good) { ok = false; if (!firstBad) firstBad = el; }
      });
      data.notes = form.querySelector('[name="notes"]').value.trim();
      data.status = form.querySelector('[name="status"]').value;
      data.remind = form.querySelector('[name="remind"]').checked;
      if (ok) st.details = data;
      else if (!silent && firstBad) {
        A.motion.scrollTo(firstBad.closest('.fld') || firstBad, { offset: -180 });
        firstBad.focus({ preventScroll: true });
      }
      return ok;
    }

    /* ============================================================
       STEP 6 — CONFIRM
       ============================================================ */
    function stepConfirm() {
      var svc = S.service(st.service), loc = S.location(st.clinic);
      var per = st.dentist === 'any' ? null : S.person(st.dentist);
      var v = st.details;

      return '<div class="wiz__panel is-on">' +
        head('06', 'Check it over', 'Nothing is charged now. You pay at the studio, after the appointment.') +
        '<div class="card mt4" style="padding:0;overflow:hidden">' +
          '<div style="display:grid;grid-template-columns:repeat(2,1fr)">' +
            cell('Treatment', esc(svc.name) + '<br><span class="xs muted">' + esc(svc.durLabel) + ' · ' + F.huf(svc.price) + '</span>') +
            cell('When', esc(F.long(st.date)) + '<br><span class="xs muted">' + esc(st.time) + ' — arrive ten minutes early</span>') +
            cell('Where', esc(loc.name) + '<br><span class="xs muted">' + esc(loc.street) + ', ' + esc(loc.post) + '</span>') +
            cell('Clinician', per ? esc(per.name) + '<br><span class="xs muted">' + esc(per.role) + '</span>' : 'No preference<br><span class="xs muted">Assigned on the day</span>') +
            cell('Patient', esc(v.first + ' ' + v.last) + '<br><span class="xs muted">' + esc(v.email) + ' · ' + esc(v.phone) + '</span>') +
            cell('Status', esc({ 'new': 'New patient', returning: 'Returning patient', transfer: 'Transferring practice' }[v.status] || v.status) +
              '<br><span class="xs muted">' + (v.remind ? 'Reminder the day before' : 'No reminder') + '</span>') +
          '</div>' +
          (v.notes ? '<div style="padding:1.2rem 1.4rem;border-top:1px solid var(--line);background:var(--bone)">' +
            '<div class="bio__k">Your note</div><p class="small mt1">' + esc(v.notes) + '</p></div>' : '') +
        '</div>' +
        '<div class="note mt3">' + ICON.info +
          '<span>Free to move or cancel until 24 hours before. Inside that window we charge half the appointment fee, because the slot cannot be filled at short notice.</span></div>' +
      '</div>';

      function cell(k, v2) {
        return '<div style="padding:1.3rem 1.4rem;border-bottom:1px solid var(--line);border-right:1px solid var(--line)">' +
          '<div class="bio__k">' + esc(k) + '</div><div style="margin-top:.35rem;font-size:.98rem">' + v2 + '</div></div>';
      }
    }

    /* ============================================================
       DONE
       ============================================================ */
    function complete() {
      var rec = S.addBooking({
        clinic: st.clinic, service: st.service, dentist: st.dentist,
        date: st.date, time: st.time,
        name: st.details.first + ' ' + st.details.last,
        email: st.details.email, phone: st.details.phone,
        dob: st.details.dob, status: st.details.status,
        notes: st.details.notes, remind: st.details.remind
      });

      var svc = S.service(rec.service), loc = S.location(rec.clinic);
      root.innerHTML =
        '<div class="rel" style="max-width:820px;margin-inline:auto;text-align:center">' +
          '<span class="label label--blue"><span class="dot"></span>Confirmed</span>' +
          '<h2 class="dsp mt3">You are booked in.</h2>' +
          '<p class="lead mt3 mw-md" style="margin-inline:auto">A confirmation is on its way to ' +
            esc(rec.email) + '. Keep the reference below — it is all you need to move or cancel.</p>' +
          '<div class="card mt6" style="text-align:left">' +
            '<div class="between wrap g2">' +
              '<div><div class="bio__k">Reference</div>' +
                '<div style="font-family:var(--display);font-size:2rem;letter-spacing:-.03em;margin-top:.3rem">' + esc(rec.ref) + '</div></div>' +
              '<span class="tag tag--blue">' + esc(svc.name) + '</span>' +
            '</div>' +
            '<div class="bio__meta">' +
              A.helpers.factCell('When', esc(F.long(rec.date)) + ' at ' + esc(rec.time)) +
              A.helpers.factCell('Where', esc(loc.name) + ', ' + esc(loc.street)) +
              A.helpers.factCell('Clinician', rec.dentist === 'any' ? 'Assigned on the day' : esc(S.person(rec.dentist).name)) +
              A.helpers.factCell('To pay at the studio', F.huf(svc.price)) +
            '</div>' +
            '<div class="flex g2 wrap">' +
              '<button class="btn" id="icsBtn">Add to calendar' + ICON.arrow + '</button>' +
              '<a class="btn btn--ghost" href="booking.html">Book another</a>' +
              '<a class="btn btn--ghost" href="locations.html#' + loc.id + '">How to get there</a>' +
            '</div>' +
          '</div>' +
          '<p class="xs muted mt4">Please arrive ten minutes early on a first visit — there is a short medical history to complete.</p>' +
        '</div>';

      qs('#icsBtn').addEventListener('click', function () {
        var ok = S.download('aurora-' + rec.ref + '.ics', S.ics(rec), 'text/calendar;charset=utf-8');
        UI.toast(ok ? 'Calendar file downloaded' : 'Could not create the file', !ok);
      });

      UI.toast('Appointment confirmed — ' + rec.ref);
      renderMine();
      A.motion.scrollTo(root, { offset: -140 });
      if (w.gsap && !A.motion.reduced) {
        w.gsap.from(qs('.card', root), { opacity: 0, y: 40, duration: 1, ease: 'expo.out', delay: .2 });
      }
    }

    /* ============================================================
       NAVIGATION
       ============================================================ */
    function head(n, t, sub) {
      return '<span class="label"><span class="dot"></span>Step ' + n + ' of 06</span>' +
        '<h2 class="mt2" style="font-size:clamp(1.7rem,3.6vw,2.7rem)">' + esc(t) + '</h2>' +
        '<p class="lead mt2 mw-md">' + esc(sub) + '</p>';
    }

    function paint() {
      var html = [stepStudio, stepService, stepDentist, stepWhen, stepDetails, stepConfirm][st.step]();
      panelsEl.innerHTML = html;

      if (st.step === 1) {
        paintServices('all');
        qs('#bkCats').addEventListener('click', function (e) {
          var b = e.target.closest('[data-cat]');
          if (!b) return;
          qsa('.chip', qs('#bkCats')).forEach(function (c) { c.classList.toggle('is-on', c === b); });
          paintServices(b.dataset.cat);
        });
      }
      if (st.step === 3) paintCalendar();
      if (st.step === 4) bindDetails();

      renderSteps(); renderAside(); renderNav();

      if (w.gsap && !A.motion.reduced) {
        w.gsap.fromTo(panelsEl.children, { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: .7, ease: 'expo.out' });
        w.gsap.fromTo(qsa('.opt, .cal, .slots__grp, .fld', panelsEl), { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: .65, stagger: .028, delay: .1, ease: 'expo.out' });
      }
      A.motion.refresh();
    }

    function go(n) {
      if (n < 0 || n >= STEPS.length) return;
      if (n > st.step && !validate()) return;
      st.step = n;
      paint();
      A.motion.scrollTo(root, { offset: -110 });
    }

    function validate() {
      if (st.step === 0 && !st.clinic) { UI.toast('Choose a studio first', true); return false; }
      if (st.step === 1 && !st.service) { UI.toast('Choose a treatment', true); return false; }
      if (st.step === 2 && !st.dentist) { UI.toast('Pick a clinician, or “no preference”', true); return false; }
      if (st.step === 3 && (!st.date || !st.time)) { UI.toast('Choose a day and a time', true); return false; }
      if (st.step === 4 && !collectDetails()) { UI.toast('Some details need attention', true); return false; }
      return true;
    }

    function next() {
      if (!validate()) return;
      if (st.step === STEPS.length - 1) { complete(); return; }
      go(st.step + 1);
    }

    /* ---------- delegated interaction ---------- */
    panelsEl.addEventListener('click', function (e) {
      /* a <label> forwards its click to the radio inside, which bubbles a
         second time — ignore that one or every choice advances twice */
      if (e.target.tagName === 'INPUT') return;
      var pick = e.target.closest('[data-pick]');
      if (pick) {
        var key = pick.dataset.pick;
        st[key] = pick.dataset.val;
        if (key === 'clinic' || key === 'service') { st.dentist = ''; st.date = ''; st.time = ''; }
        if (key === 'dentist') { st.date = ''; st.time = ''; }
        qsa('[data-pick="' + key + '"]', panelsEl).forEach(function (o) {
          o.classList.toggle('is-on', o === pick);
        });
        renderAside(); renderSteps();
        setTimeout(function () { if (st.step < 3) go(st.step + 1); }, 260);
        return;
      }
      var mv = e.target.closest('[data-mv]');
      if (mv) {
        view.m += +mv.dataset.mv;
        if (view.m > 11) { view.m = 0; view.y++; }
        if (view.m < 0) { view.m = 11; view.y--; }
        paintCalendar();
        return;
      }
      var day = e.target.closest('[data-day]');
      if (day) {
        st.date = day.dataset.day; st.time = '';
        paintCalendar(); renderAside(); renderSteps();
        return;
      }
      var slot = e.target.closest('[data-slot]');
      if (slot) {
        st.time = slot.dataset.slot;
        qsa('[data-slot]', panelsEl).forEach(function (s) { s.classList.toggle('is-on', s === slot); });
        renderAside(); renderSteps();
      }
    });

    stepsEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-goto]');
      if (b && !b.disabled) go(+b.dataset.goto);
    });

    /* ============================================================
       MY APPOINTMENTS
       ============================================================ */
    var cancelModal = null;

    function renderMine() {
      var host = qs('#myAppts');
      if (!host) return;
      var up = S.upcoming(), past = S.past();

      function row(b, isPast) {
        var svc = S.service(b.service), loc = S.location(b.clinic);
        return '<div class="appt"' + (isPast ? ' style="opacity:.55"' : '') + '>' +
          '<div class="appt__d"><div class="dd">' + F.day(b.date) + '</div>' +
            '<div class="mm">' + F.mon3(b.date) + '</div></div>' +
          '<div><div style="font-family:var(--display);font-size:1.15rem;letter-spacing:-.025em">' +
            esc(svc ? svc.name : 'Appointment') + '</div>' +
            '<div class="xs muted mt1">' + esc(b.time) + ' · ' + esc(loc.name) + ' · ' +
            (b.dentist === 'any' ? 'No preference' : esc((S.person(b.dentist) || {}).name || '')) + '</div>' +
            '<div class="appt__ref mt1">' + esc(b.ref) +
              (b.status === 'cancelled' ? ' · <span style="color:#c8503f">Cancelled</span>' : '') + '</div></div>' +
          '<div class="flex g1">' +
            (isPast ? '' :
              '<button class="btn btn--ghost btn--sm" data-ics="' + b.ref + '">Calendar</button>' +
              '<button class="btn btn--ghost btn--sm" data-cancel="' + b.ref + '">Cancel</button>') +
          '</div></div>';
      }

      host.innerHTML =
        '<div class="between wrap g2 mb3">' +
          '<span class="label"><span class="dot"></span>Your appointments</span>' +
          '<span class="xs muted">Stored in this browser · ' + (S.available ? 'saved' : 'session only') + '</span>' +
        '</div>' +
        (up.length ? up.map(function (b) { return row(b, false); }).join('')
          : '<div class="empty">Nothing booked yet. The form above takes about ninety seconds.</div>') +
        (past.length ? '<div class="label mt6 mb2">Earlier</div>' +
          past.slice(0, 5).map(function (b) { return row(b, true); }).join('') : '');

      host.querySelectorAll('[data-cancel]').forEach(function (b) {
        b.addEventListener('click', function () {
          var rec = S.findBooking(b.dataset.cancel);
          if (!rec) return;
          /* one modal for the page — building a new one per click stacked up
             nodes and key handlers that never went away */
          var m = cancelModal || (cancelModal = UI.modal());
          m.show('<span class="label"><span class="dot"></span>Cancel appointment</span>' +
            '<h3 class="mt3" style="font-size:clamp(1.5rem,3vw,2rem)">Cancel ' + esc(rec.ref) + '?</h3>' +
            '<p class="lead mt2">' + esc(S.service(rec.service).name) + ' on ' + esc(F.long(rec.date)) +
            ' at ' + esc(rec.time) + '.</p>' +
            '<p class="small muted mt2">More than 24 hours away, so there is no charge.</p>' +
            '<div class="flex g2 mt4 wrap"><button class="btn" id="mYes">Yes, cancel it</button>' +
            '<button class="btn btn--ghost" data-x>Keep it</button></div>');
          /* scoped to this modal's own box — a document-wide lookup bound the
             handler to whichever #mYes came first, so the second cancel of a
             session did nothing */
          qs('#mYes', m.box).addEventListener('click', function () {
            S.cancelBooking(rec.ref);
            m.hide();
            renderMine();
            UI.toast('Appointment ' + rec.ref + ' cancelled');
          });
        });
      });
      host.querySelectorAll('[data-ics]').forEach(function (b) {
        b.addEventListener('click', function () {
          var rec = S.findBooking(b.dataset.ics);
          if (rec) S.download('aurora-' + rec.ref + '.ics', S.ics(rec), 'text/calendar;charset=utf-8');
        });
      });
    }

    /* ---------- go ---------- */
    /* a deep link (?service=, ?clinic=, ?dentist=) drops you further in */
    st.step = Math.min(furthest(), 3);
    paint();
    renderMine();
  }

  A.pages = A.pages || {};
  A.pages.booking = booking;
})(window, document);
