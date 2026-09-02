/* ============================================================
   AURORA — CLIENT "BACKEND"
   Persistence, availability engine, validation, formatting.
   Everything below is deliberately isolated behind Store.* so a
   real API can replace the bodies without touching the UI code.
   ============================================================ */
(function (w) {
  'use strict';

  var A = w.AURORA || (w.AURORA = {});
  var NS = 'aurora.v1.';

  /* ============================================================
     LOW-LEVEL PERSISTENCE (fails soft in private mode)
     ============================================================ */
  var mem = {};
  var canLS = (function () {
    try { var k = NS + 'probe'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; }
    catch (e) { return false; }
  })();

  function read(key, fallback) {
    try {
      var raw = canLS ? localStorage.getItem(NS + key) : mem[key];
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, val) {
    try {
      var raw = JSON.stringify(val);
      if (canLS) localStorage.setItem(NS + key, raw); else mem[key] = raw;
      return true;
    } catch (e) { return false; }
  }

  /* ============================================================
     FORMATTING
     ============================================================ */
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  var fmt = {
    huf: function (n) {
      if (n == null) return '—';
      return new Intl.NumberFormat('hu-HU').format(Math.round(n)).replace(/ /g, ' ') + ' Ft';
    },
    hufShort: function (n) {
      return new Intl.NumberFormat('en-US').format(Math.round(n)) + ' Ft';
    },
    num: function (n, dec) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0
      }).format(n);
    },
    /* ISO yyyy-mm-dd -> Date (local, no timezone drift) */
    parse: function (iso) {
      if (iso instanceof Date) return iso;
      var p = String(iso).split('-');
      return new Date(+p[0], +p[1] - 1, +p[2]);
    },
    iso: function (d) {
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    },
    long: function (iso) {
      var d = fmt.parse(iso);
      return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
    },
    medium: function (iso) {
      var d = fmt.parse(iso);
      return d.getDate() + ' ' + MON3[d.getMonth()] + ' ' + d.getFullYear();
    },
    short: function (iso) {
      var d = fmt.parse(iso);
      return DAYS[d.getDay()].slice(0, 3) + ' ' + d.getDate() + ' ' + MON3[d.getMonth()];
    },
    day: function (iso) { return fmt.parse(iso).getDate(); },
    mon3: function (iso) { return MON3[fmt.parse(iso).getMonth()]; },
    monthYear: function (y, m) { return MONTHS[m] + ' ' + y; },
    dur: function (min) {
      if (min < 60) return min + ' min';
      var h = Math.floor(min / 60), r = min % 60;
      return h + 'h' + (r ? ' ' + r + 'm' : '');
    },
    ago: function (iso) {
      var days = Math.round((new Date() - fmt.parse(iso)) / 86400000);
      if (days < 1) return 'Today';
      if (days < 2) return 'Yesterday';
      if (days < 30) return days + ' days ago';
      if (days < 60) return 'A month ago';
      if (days < 365) return Math.round(days / 30) + ' months ago';
      var y = Math.floor(days / 365);
      return y + (y === 1 ? ' year ago' : ' years ago');
    },
    MONTHS: MONTHS, MON3: MON3, DAYS: DAYS
  };

  /* ============================================================
     VALIDATION
     ============================================================ */
  var valid = {
    required: function (v) { return String(v || '').trim().length > 0; },
    name: function (v) { return String(v || '').trim().length >= 2 && /[a-zA-ZÀ-ÿŐőŰű]/.test(v); },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(String(v || '').trim()); },
    phone: function (v) {
      var d = String(v || '').replace(/[^\d+]/g, '');
      return d.length >= 9 && d.length <= 16;
    },
    dob: function (v) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
      var d = fmt.parse(v), now = new Date();
      if (isNaN(d)) return false;
      var age = (now - d) / 31557600000;
      return age > 0 && age < 120;
    },
    minLen: function (n) { return function (v) { return String(v || '').trim().length >= n; }; },
    checked: function (el) { return !!(el && el.checked); }
  };

  /* ============================================================
     DETERMINISTIC PRNG — same day always yields the same diary,
     so availability does not reshuffle on every page load.
     ============================================================ */
  function hash(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }
  function rng(seed) {
    var t = seed >>> 0;
    return function () {
      t += 0x6D2B79F5;
      var r = t;
      r = Math.imul(r ^ (r >>> 15), r | 1);
      r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ============================================================
     CALENDAR RULES
     ============================================================ */
  var HOLIDAYS = {
    '01-01': 'New Year',
    '03-15': 'National Day',
    '05-01': 'Labour Day',
    '08-20': 'St Stephen’s Day',
    '10-23': 'Republic Day',
    '11-01': 'All Saints',
    '12-24': 'Christmas Eve',
    '12-25': 'Christmas Day',
    '12-26': 'Boxing Day',
    '12-31': 'New Year’s Eve',
    '2026-04-03': 'Good Friday',
    '2026-04-06': 'Easter Monday',
    '2026-05-25': 'Whit Monday',
    '2027-03-26': 'Good Friday',
    '2027-03-29': 'Easter Monday',
    '2027-05-17': 'Whit Monday'
  };
  var BOOK_WINDOW = 120; // days ahead

  function holidayName(iso) {
    return HOLIDAYS[iso] || HOLIDAYS[iso.slice(5)] || null;
  }
  function clinicById(id) {
    var l = A.LOCATIONS, i;
    for (i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return l[0];
  }
  function hoursFor(clinicId, iso) {
    var c = clinicById(clinicId);
    var dow = fmt.parse(iso).getDay();          // 0 = Sunday
    var idx = dow === 0 ? 6 : dow - 1;          // hours array starts Monday
    var row = c.hours[idx];
    return row && row[1] ? { open: row[1], close: row[2] } : null;
  }
  function toMin(hhmm) { var p = hhmm.split(':'); return +p[0] * 60 + +p[1]; }
  function toHHMM(min) {
    return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
  }

  /* ============================================================
     STORE
     ============================================================ */
  var Store = {
    read: read,
    write: write,
    available: canLS,

    /* ---------- reference codes ---------- */
    ref: function () {
      var c = 'ACDEFGHJKLMNPQRTUVWXY3479';
      var s = '';
      for (var i = 0; i < 6; i++) s += c[Math.floor(Math.random() * c.length)];
      return 'AUR-' + s;
    },

    /* ---------- bookings ---------- */
    bookings: function () {
      return read('bookings', []).sort(function (a, b) {
        return (a.date + a.time) < (b.date + b.time) ? -1 : 1;
      });
    },
    upcoming: function () {
      var today = fmt.iso(new Date());
      return Store.bookings().filter(function (b) {
        return b.status !== 'cancelled' && b.date >= today;
      });
    },
    past: function () {
      var today = fmt.iso(new Date());
      return Store.bookings().filter(function (b) {
        return b.status === 'cancelled' || b.date < today;
      }).reverse();
    },
    findBooking: function (ref) {
      var b = Store.bookings(), i;
      for (i = 0; i < b.length; i++) if (b[i].ref === ref) return b[i];
      return null;
    },
    addBooking: function (data) {
      var all = read('bookings', []);
      var rec = Object.assign({
        ref: Store.ref(),
        status: 'confirmed',
        created: new Date().toISOString()
      }, data);
      all.push(rec);
      write('bookings', all);
      return rec;
    },
    cancelBooking: function (ref) {
      var all = read('bookings', []), i, hit = false;
      for (i = 0; i < all.length; i++) {
        if (all[i].ref === ref) { all[i].status = 'cancelled'; all[i].cancelled = new Date().toISOString(); hit = true; }
      }
      write('bookings', all);
      return hit;
    },
    /* slots already taken by this browser's own bookings */
    takenSlots: function (clinicId, dentistId, iso) {
      return Store.bookings().filter(function (b) {
        return b.status !== 'cancelled' && b.date === iso && b.clinic === clinicId &&
          (!dentistId || dentistId === 'any' || b.dentist === dentistId);
      }).map(function (b) { return b.time; });
    },

    /* ---------- day + slot availability ---------- */
    dayInfo: function (iso, clinicId) {
      var today = fmt.iso(new Date());
      var max = new Date(); max.setDate(max.getDate() + BOOK_WINDOW);
      if (iso < today) return { state: 'past', why: 'In the past' };
      if (iso > fmt.iso(max)) return { state: 'far', why: 'Beyond the booking window' };
      var hol = holidayName(iso);
      if (hol) return { state: 'closed', why: hol };
      var h = hoursFor(clinicId, iso);
      if (!h) return { state: 'closed', why: 'Studio closed' };
      return { state: 'open', hours: h };
    },

    /**
     * The diary for one day. Deterministic: the same clinic + dentist +
     * date always produces the same pattern of taken slots, so the
     * calendar behaves like a real one across reloads.
     */
    slotsFor: function (opts) {
      var iso = opts.date, clinicId = opts.clinic, dentistId = opts.dentist || 'any';
      var info = Store.dayInfo(iso, clinicId);
      if (info.state !== 'open') return { state: info.state, why: info.why, slots: [] };

      var start = toMin(info.hours.open), end = toMin(info.hours.close);
      var step = 30;
      var dur = opts.duration || 45;
      var rand = rng(hash(iso + '|' + clinicId + '|' + dentistId));
      var mine = Store.takenSlots(clinicId, dentistId === 'any' ? null : dentistId, iso);
      var nowMin = -1;
      if (iso === fmt.iso(new Date())) {
        var n = new Date();
        nowMin = n.getHours() * 60 + n.getMinutes() + 90; // 90 min lead time
      }

      var out = [], t, busyBias = dentistId === 'any' ? 0.22 : 0.42;
      for (t = start; t + dur <= end; t += step) {
        var hhmm = toHHMM(t);
        var lunch = t >= 12 * 60 + 30 && t < 13 * 60 + 30;
        var taken = mine.indexOf(hhmm) > -1;
        var full = lunch || taken || rand() < busyBias || t < nowMin;
        out.push({
          time: hhmm,
          free: !full,
          period: t < 12 * 60 ? 'Morning' : (t < 16 * 60 ? 'Afternoon' : 'Evening'),
          reason: lunch ? 'Team break' : (taken ? 'You booked this' : null)
        });
      }
      return { state: 'open', slots: out, free: out.filter(function (s) { return s.free; }).length };
    },

    /* quick check used by the calendar grid to grey out full days */
    dayHasSpace: function (iso, clinicId, dentistId, dur) {
      var r = Store.slotsFor({ date: iso, clinic: clinicId, dentist: dentistId, duration: dur });
      return r.state === 'open' && r.free > 0;
    },

    /* ---------- open right now? ---------- */
    openNow: function (clinicId) {
      var now = new Date();
      var iso = fmt.iso(now);
      var info = Store.dayInfo(iso, clinicId);
      /* a bare "Closed" is unhelpful — always say when it opens again */
      function shut(reason) {
        var nx = Store.nextOpen(clinicId);
        return { open: false, next: nx, label: nx ? reason + ' · opens ' + nx : reason };
      }
      if (info.state !== 'open') return shut(info.why || 'Closed');
      var cur = now.getHours() * 60 + now.getMinutes();
      var o = toMin(info.hours.open), c = toMin(info.hours.close);
      if (cur >= o && cur < c) return { open: true, label: 'Open until ' + info.hours.close };
      if (cur < o) return { open: false, label: 'Opens today at ' + info.hours.open };
      return shut('Closed');
    },
    nextOpen: function (clinicId) {
      var d = new Date(), i;
      for (i = 1; i <= 10; i++) {
        d.setDate(d.getDate() + 1);
        var iso = fmt.iso(d);
        var info = Store.dayInfo(iso, clinicId);
        if (info.state === 'open') return fmt.DAYS[d.getDay()] + ' ' + info.hours.open;
      }
      return null;
    },
    todayIndex: function () { var dw = new Date().getDay(); return dw === 0 ? 6 : dw - 1; },

    /* ---------- reviews ---------- */
    reviews: function () {
      var custom = read('reviews', []);
      return custom.concat(A.REVIEWS);
    },
    addReview: function (r) {
      var all = read('reviews', []);
      var rec = Object.assign({
        id: 'u' + Date.now(),
        s: 'Aurora website',
        d: fmt.iso(new Date()),
        mine: true
      }, r);
      all.unshift(rec);
      write('reviews', all);
      return rec;
    },
    ratingBreakdown: function (list) {
      var l = list || Store.reviews();
      var b = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, sum = 0, i;
      for (i = 0; i < l.length; i++) { b[l[i].r] = (b[l[i].r] || 0) + 1; sum += l[i].r; }
      return { counts: b, total: l.length, avg: l.length ? sum / l.length : 0 };
    },

    /* ---------- messages / newsletter ---------- */
    messages: function () { return read('messages', []); },
    addMessage: function (m) {
      var all = read('messages', []);
      var rec = Object.assign({ ref: Store.ref().replace('AUR', 'MSG'), at: new Date().toISOString() }, m);
      all.unshift(rec);
      write('messages', all);
      return rec;
    },
    subscribe: function (email) {
      var all = read('subs', []);
      if (all.indexOf(email) > -1) return { ok: false, why: 'already' };
      all.push(email);
      write('subs', all);
      return { ok: true };
    },

    /* ---------- lookups ---------- */
    service: function (id) {
      var s = A.SERVICES, i;
      for (i = 0; i < s.length; i++) if (s[i].id === id) return s[i];
      return null;
    },
    person: function (id) {
      var t = A.TEAM, i;
      for (i = 0; i < t.length; i++) if (t[i].id === id) return t[i];
      return null;
    },
    location: clinicById,
    teamFor: function (serviceId, clinicId) {
      return A.TEAM.filter(function (p) {
        var okSvc = !serviceId || p.services.indexOf(serviceId) > -1;
        var okLoc = !clinicId || p.locations.indexOf(clinicId) > -1;
        return okSvc && okLoc;
      });
    },

    /* ---------- calendar file ---------- */
    ics: function (b) {
      var svc = Store.service(b.service);
      var loc = clinicById(b.clinic);
      var d = fmt.parse(b.date);
      var p = b.time.split(':');
      var start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), +p[0], +p[1]);
      var end = new Date(start.getTime() + ((svc && svc.dur) || 45) * 60000);
      function z(dt) {
        return dt.getUTCFullYear() +
          String(dt.getUTCMonth() + 1).padStart(2, '0') +
          String(dt.getUTCDate()).padStart(2, '0') + 'T' +
          String(dt.getUTCHours()).padStart(2, '0') +
          String(dt.getUTCMinutes()).padStart(2, '0') + '00Z';
      }
      return [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Aurora Dental Studio//EN',
        'BEGIN:VEVENT',
        'UID:' + b.ref + '@auroradental.hu',
        'DTSTAMP:' + z(new Date()),
        'DTSTART:' + z(start),
        'DTEND:' + z(end),
        'SUMMARY:' + (svc ? svc.name : 'Appointment') + ' — Aurora Dental',
        'LOCATION:' + loc.name + '\\, ' + loc.street + '\\, ' + loc.post,
        'DESCRIPTION:Reference ' + b.ref + '. Please arrive 10 minutes early.',
        'END:VEVENT', 'END:VCALENDAR'
      ].join('\r\n');
    },
    download: function (name, text, mime) {
      try {
        var blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = name;
        document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 400);
        return true;
      } catch (e) { return false; }
    }
  };

  A.Store = Store;
  A.fmt = fmt;
  A.valid = valid;
})(window);
