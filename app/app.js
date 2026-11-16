(function () {
  'use strict';
  var D = PLYN_DATA; // treść i PROFILE z data.js (ładowany wcześniej)
  var DAY1 = D.DAY1, HIER = D.HIER, BASE_HIER = D.BASE_HIER, A_NAME = D.A_NAME, TOPICS = D.TOPICS, TAG_LABEL = D.TAG_LABEL, ENC = D.ENC, INS = D.INS, A_POOL1 = D.A_POOL1, A_POOL2 = D.A_POOL2, B_WORDS = D.B_WORDS, TENSION = D.TENSION, SIGNAL_PL = D.SIGNAL_PL, SIGNAL_EN = D.SIGNAL_EN, EX_META = D.EX_META, WEEKS = D.WEEKS;

  /* ---------- helpers ---------- */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k.indexOf('on') === 0) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(el, x); }); return; }
    el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtClock(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + pad2(s % 60); }
  function dateKey(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function parseKey(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(k, n) { var d = parseKey(k); d.setDate(d.getDate() + n); return dateKey(d); }
  function todayKey() { return dateKey(new Date()); }
  function dayIndex(k) { return Math.round((parseKey(k) - parseKey(DAY1)) / 86400000) + 1; }
  function weekOf(day) { return Math.min(12, Math.max(1, Math.ceil(day / 7))); } // R3 v3: po dniu 84 zostaje archipelag 12 (Utrzymanie)
  function fmtDate(k) {
    try { return parseKey(k).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' }); }
    catch (e) { return k; }
  }
  function pick(arr, seed) { return arr[Math.abs(seed) % arr.length]; }
  function isObj(o) { return !!o && typeof o === 'object' && !Array.isArray(o); }
  function clampSR(v) { var n = Math.round(Number(v)); if (isNaN(n)) return null; return Math.max(0, Math.min(8, n)); }
  function num(v, dflt) { var n = parseInt(v, 10); return isNaN(n) ? dflt : Math.max(0, n); }
  var toastT = null;
  function toast(msg) {
    var el = document.getElementById('toast'); el.textContent = msg; el.classList.add('on');
    if (toastT) clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('on'); }, 1300);
  }

  /* ---------- state ---------- */
  var KEY = 'plynnosc';
  var TRI = ['tak', 'częściowo', 'nie']; // fakty tak / częściowo / nie (B15, B35) – jedyne wyjątki od „tak/nie”
  var BLOK_OPTS = { start: ['ja', 'ktoś'], jezyk: ['PL', 'EN'], tempo: ['wolno', 'szybko'] };
  var state = load();

  function sanitizeDay(d) {
    if (!isObj(d)) d = {};
    d.done = Array.isArray(d.done) ? d.done.filter(function (x) { return typeof x === 'string'; }) : [];
    d.reps = isObj(d.reps) ? d.reps : {};
    d.monolog = isObj(d.monolog) ? d.monolog : {};
    if (d.monolog.sr != null) d.monolog.sr = clampSR(d.monolog.sr);
    d.sr = isObj(d.sr) ? d.sr : {};
    d.sr.typ = d.sr.typ == null ? null : clampSR(d.sr.typ);
    d.sr.max = d.sr.max == null ? null : clampSR(d.sr.max);
    d.tension = isObj(d.tension) ? d.tension : {};
    d.diary = typeof d.diary === 'string' ? d.diary : '';
    d.complete = d.complete === true;
    // v5 (#19): odpowiedź „Brzuch był miękki?” po serii Oddechu A.
    d.oddechBrzuch = TRI.indexOf(d.oddechBrzuch) >= 0 ? d.oddechBrzuch : null;
    // v5 (#20): wpis dziennika z dotknięć; `diary` zostaje jako notatka (stary tekst v3/v4 też).
    var b = isObj(d.blok) ? d.blok : {};
    d.blok = { jest: typeof b.jest === 'boolean' ? b.jest : null };
    Object.keys(BLOK_OPTS).forEach(function (f) { d.blok[f] = BLOK_OPTS[f].indexOf(b[f]) >= 0 ? b[f] : null; });
    // v5 (#21): ★ monolog w drugim języku (nie wlicza się do dnia). Zakres tematu sprawdza karta (TOPICS jeszcze nie istnieje przy load()).
    var x = isObj(d.extra) ? d.extra : {};
    d.extra = { lang: x.lang === 'pl' || x.lang === 'en' ? x.lang : null, topic: typeof x.topic === 'number' && x.topic >= 0 && x.topic % 1 === 0 ? x.topic : null,
      ran: x.ran === true, breath: TRI.indexOf(x.breath) >= 0 ? x.breath : null, sr: x.sr == null ? null : clampSR(x.sr), done: x.done === true };
    // B14: zadanie w terenie – fakt tak/nie, brak odpowiedzi = null.
    d.field = d.field === 'tak' || d.field === 'nie' ? d.field : null;
    return d;
  }
  // v2 (2026-11-08): a finished day stays finished even when the exercise list changes later (review R1).
  // Migration marks days that were complete under the v1 list, with SR counted only on weekly days.
  function legacyCompleteV1(k, d) {
    var n = dayIndex(k), w = weekOf(n), list;
    if (d.baseline) list = ['baza', 'monolog', 'dziennik', 'sr'];
    else if (w >= 4) list = ['dziennik'];
    else { list = ['oddech', 'monolog']; if (w >= 2) list.push('napiecie'); if (w >= 3) list.push('miekki'); list.push('dziennik'); }
    if (!d.baseline && n % 7 === 0) list.push('sr');
    return n >= 1 && list.every(function (e) { return d.done.indexOf(e) >= 0; });
  }
  function load() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { s = null; }
    if (!isObj(s)) s = {};
    s.days = isObj(s.days) ? s.days : {};
    Object.keys(s.days).forEach(function (k) { if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) { delete s.days[k]; return; } s.days[k] = sanitizeDay(s.days[k]); });
    s.hierarchy = Array.isArray(s.hierarchy) && s.hierarchy.length === 10 ? s.hierarchy.map(function (v, i) { var c = clampSR(v); return c == null ? BASE_HIER[i] : c; }) : BASE_HIER.slice();
    s.assessments = Array.isArray(s.assessments) ? s.assessments.filter(isObj).map(function (a) {
      a.date = typeof a.date === 'string' ? a.date : ''; a.metrics = isObj(a.metrics) ? a.metrics : {}; a.sr = a.sr == null ? null : clampSR(a.sr); return a;
    }) : [];
    s.insSeen = isObj(s.insSeen) ? s.insSeen : {};
    s.ocenaDraft = isObj(s.ocenaDraft) ? s.ocenaDraft : {};
    if (!s.days[DAY1]) { var imp = importDay1(); if (imp.hierarchy) { s.hierarchy = imp.hierarchy; delete imp.hierarchy; } s.days[DAY1] = sanitizeDay(imp); }
    if (!(s.v >= 2)) { Object.keys(s.days).forEach(function (k) { var d = s.days[k]; if (legacyCompleteV1(k, d)) d.complete = true; }); s.v = 2; }
    return s;
  }
  function importDay1() {
    var old = null;
    try { old = JSON.parse(localStorage.getItem('plynnosc-dzien-01') || 'null'); } catch (e) { old = null; }
    if (!isObj(old)) old = {};
    function sr(v, dflt) { var c = clampSR(v); return c == null ? dflt : c; }
    var d = {
      baseline: true,
      done: ['baza', 'monolog', 'dziennik', 'sr'],
      base: {
        readPL: { b: num(old.r1b, 1), sr: sr(old.r1s, 5) },
        monPL: { b: num(old.r2b, 1), sr: sr(old.r2s, 4) },
        monEN: { b: num(old.r3b, 1), sr: sr(old.r3s, 3) },
        conv: { b: num(old.r4b, 1), sr: sr(old.r4s, 2) }
      },
      reps: { oddech: (Array.isArray(old.reps) ? old.reps : []).filter(Boolean).length },
      monolog: { lang: 'pl', ran: true, breath: old.m1 || 'nie', belly: old.m2 || 'nie', blocks: num(old.m3, 2), sr: null },
      diary: old.diary || '',
      body: old.body || '',
      sr: { typ: null, max: null },
      tension: {}
    };
    var srs = [d.base.readPL.sr, d.base.monPL.sr, d.base.monEN.sr, d.base.conv.sr];
    d.sr.max = Math.max.apply(null, srs);
    d.sr.typ = Math.round(srs.reduce(function (a, b) { return a + b; }, 0) / srs.length);
    d.monolog.sr = d.base.monPL.sr;
    var hasOldH = false;
    for (var i = 1; i <= 10; i++) if (old['h' + i] !== undefined && old['h' + i] !== '' && old['h' + i] !== null) hasOldH = true;
    if (hasOldH) {
      d.hierarchy = [];
      for (var j = 1; j <= 10; j++) { var v = parseFloat(old['h' + j]); d.hierarchy.push(isNaN(v) ? BASE_HIER[j - 1] : clampSR(Math.round(v * 0.8))); }
    }
    return d;
  }
  var saveT = null;
  function saveNow() { if (saveT) { clearTimeout(saveT); saveT = null; } try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* no storage */ } }
  function save() { if (saveT) clearTimeout(saveT); saveT = setTimeout(saveNow, 300); }
  window.addEventListener('pagehide', saveNow);
  window.addEventListener('beforeunload', saveNow);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { saveNow(); wakeRelease(); } // seria trwa dalej (wake.want), blokada wraca po powrocie
    else { onVisible(); if (wake.want) { resumeAudio(); wakeRequest(); } }
  });
  function day(k) {
    if (!state.days[k]) state.days[k] = sanitizeDay({});
    return state.days[k];
  }
  function peekDay(k) { return state.days[k] || null; }
  saveNow();

  /* ---------- audio / haptics ---------- */
  var audioCtx = null;
  function primeAudio() {
    try { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; }
    resumeAudio();
  }
  function resumeAudio() {
    // iOS: kontekst bywa „suspended” albo „interrupted” (np. po zablokowaniu ekranu) – wznawiamy przy każdym dźwięku i po powrocie strony.
    try { if (audioCtx && audioCtx.state !== 'running') { var pr = audioCtx.resume(); if (pr && pr.catch) pr.catch(function () { /* ignore */ }); } } catch (e) { /* ignore */ }
  }
  function playbackSession() {
    // Safari 17+: sesja audio „playback” gra mimo przełącznika trybu cichego. Brak API = bez zmian.
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* ignore */ }
  }
  function beep(final) {
    try {
      primeAudio();
      if (audioCtx) {
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = 'sine'; o.frequency.value = final ? 660 : 880;
        g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (final ? 0.6 : 0.3));
        o.connect(g); g.connect(audioCtx.destination);
        o.start(); o.stop(audioCtx.currentTime + (final ? 0.65 : 0.35));
      }
    } catch (e) { /* no audio */ }
    try { if (navigator.vibrate) navigator.vibrate(final ? [200, 100, 200] : 200); } catch (e) { /* no haptics */ }
  }
  // v5 (#19, B36): Oddech A z zamkniętymi oczami – rosnący ton = początek wdechu, opadający = początek wydechu.
  function tone(kind) {
    var up = kind === 'wdech';
    try {
      primeAudio();
      if (audioCtx) {
        var t0 = audioCtx.currentTime, o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(up ? 392 : 587, t0);
        o.frequency.linearRampToValueAtTime(up ? 587 : 392, t0 + 0.4);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.03);
        g.gain.setValueAtTime(0.25, t0 + 0.32);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.42);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(t0); o.stop(t0 + 0.45);
      }
    } catch (e) { /* no audio */ }
    try { if (navigator.vibrate) navigator.vibrate(up ? 80 : [60, 60, 60]); } catch (e) { /* no haptics */ }
  }

  /* ---------- Wake Lock (Oddech A): ekran nie gaśnie w trakcie serii; brak API albo odmowa = cicho ---------- */
  var wake = { want: false, lock: null, pending: false };
  function wakeRequest() {
    try {
      if (!wake.want || wake.lock || wake.pending || !navigator.wakeLock || document.visibilityState !== 'visible') return;
      wake.pending = true;
      navigator.wakeLock.request('screen').then(function (l) {
        wake.pending = false;
        if (!wake.want) { try { l.release().catch(function () { /* ignore */ }); } catch (e) { /* ignore */ } return; }
        wake.lock = l;
        try { l.addEventListener('release', function () { if (wake.lock === l) wake.lock = null; }); } catch (e) { /* ignore */ }
      }, function () { wake.pending = false; });
    } catch (e) { wake.pending = false; }
  }
  function wakeRelease() { var l = wake.lock; wake.lock = null; if (l) try { l.release().catch(function () { /* ignore */ }); } catch (e) { /* ignore */ } }
  function wakeOn() { wake.want = true; wakeRequest(); }
  function wakeOff() { wake.want = false; wakeRelease(); }

  /* ---------- SR picker (shared, the only scale in the app) ---------- */
  var SR_COLORS = ['#2f9e6b', '#55a35c', '#84a84b', '#b3a63a', '#e0a100', '#dc8a0c', '#d57117', '#cb5621', '#c0392b'];
  var SR_MEANING = ['brak', 'jest, słuchacz nie zauważa', 'lekkie, słychać, nie przeszkadza', 'lekkie, słychać, nie przeszkadza',
    'umiarkowane, spowalnia przekaz', 'umiarkowane, spowalnia przekaz', 'ciężkie, walka, trudno słuchać', 'ciężkie, walka, trudno słuchać', 'przekaz nie dochodzi'];
  // Always-visible key under the chips (opts.key === false hides it, e.g. second picker on the same card).
  var SR_KEY = [[[0], 'brak'], [[1], 'słuchacz nie zauważa'], [[2, 3], 'lekkie, słychać'], [[4, 5], 'umiarkowane, spowalnia'], [[6, 7], 'ciężkie, walka'], [[8], 'przekaz nie dochodzi']];
  function srKey() {
    var rows = SR_KEY.map(function (r) {
      var v = r[0], lbl = v.length > 1 ? v[0] + '–' + v[1] : String(v[0]);
      var s = h('span', {}, h('i', { style: '--c:' + SR_COLORS[v[v.length - 1]] }), h('b', { text: lbl }), r[1]);
      s._vals = v; return s;
    });
    var el = h('div', { class: 'srkey', 'aria-hidden': 'true' }, rows);
    el._mark = function (val) { var vs = [].concat(val).filter(function (v) { return v != null; }); rows.forEach(function (s) { s.classList.toggle('on', vs.some(function (v) { return s._vals.indexOf(v) >= 0; })); }); };
    return el;
  }
  function SRPicker(container, value, onChange, opts) {
    opts = opts || {};
    var chips = h('div', { class: 'chips', role: 'group', 'aria-label': opts.label || 'SR 0–8' });
    var meaning = h('div', { class: 'meaning' });
    var key = opts.key === false ? null : srKey();
    var buttons = [];
    function paint(v) {
      if (key) key._mark(v);
      buttons.forEach(function (b, i) { b.classList.toggle('on', i === v); b.setAttribute('aria-pressed', i === v ? 'true' : 'false'); });
      clear(meaning);
      if (v == null) meaning.textContent = opts.empty || 'Wybierz SR 0–8';
      else append(meaning, [h('b', { text: 'SR ' + v + ' – ' }), SR_MEANING[v]]);
    }
    for (var i = 0; i <= 8; i++) (function (i) {
      var b = h('button', { class: 'chip', type: 'button', text: String(i), style: '--c:' + SR_COLORS[i], onclick: function () {
        value = i; paint(i); if (onChange) onChange(i);
      } });
      buttons.push(b); chips.appendChild(b);
    })(i);
    container.appendChild(h('div', { class: 'sr' }, chips, meaning, key));
    paint(value == null ? null : clampSR(value));
    return { set: paint };
  }

  /* ---------- Timer with auto reps ---------- */
  var activeTimers = [];
  function Timer(container, opts) {
    // opts: phases [{secs, cue, sub, word}], gap (s), startIndex, onStart, onRep(i), onDone, onReset, startLabel,
    // breathTones (v5: ton „wdech” na wejściu w przerwę, „wydech” na starcie fazy), wakeLock (v5), above (węzeł nad przyciskiem Start)
    var phases = opts.phases, gap = opts.gap == null ? 2 : opts.gap;
    var idx = opts.startIndex || 0, status = 'idle', endAt = 0, leftMs = 0, pausedIn = 'run', iv = null;
    var cue = h('div', { class: 'cue', 'aria-live': 'polite' }), sub = h('div', { class: 'sub' }), clock = h('div', { class: 'clock' });
    var reps = h('div', { class: 'reps' }), barI = h('i'), bar = h('div', { class: 'bar' }, barI);
    var btn = h('button', { class: 'big', type: 'button', onclick: toggle });
    var reset = h('button', { class: 'ghost', type: 'button', text: 'Od nowa', onclick: function () { stop(); lockOff(); idx = 0; status = 'idle'; if (opts.onReset) opts.onReset(); draw(); } });
    var root = h('div', { class: 'timer' }, cue, sub, clock, reps, bar, opts.above || null, btn, h('div', { class: 'row' }, reset));
    container.appendChild(root);
    var self = { stop: stop, redraw: draw };
    activeTimers.push(self);

    function cur() { return phases[Math.min(idx, phases.length - 1)]; }
    function lockOn() { if (opts.wakeLock) wakeOn(); }
    function lockOff() { if (opts.wakeLock) wakeOff(); }
    function enterGap() { status = 'gap'; endAt = Date.now() + gap * 1000; if (opts.breathTones) tone('wdech'); }
    function draw() {
      // v5 (B24a): z przerwą na wdech także przed Startem widać „Wdech nosem” i 0:03 – seria zaczyna się od wdechu.
      var inhale = status === 'gap' || (status === 'pause' && pausedIn === 'gap') || (status === 'idle' && gap > 0);
      root.classList.toggle('gap', inhale);
      var p = cur();
      // v5 (B21b): przed słowem duży napis = słowo, mały = „Wdech nosem”.
      if (inhale && p.word) { cue.textContent = p.cue; cue.className = 'cue'; sub.textContent = 'Wdech nosem'; }
      else if (inhale) { cue.textContent = 'Wdech nosem'; cue.className = 'cue small'; sub.textContent = 'następne: ' + p.cue; }
      else if (status === 'done') { cue.textContent = 'Zrobione'; cue.className = 'cue'; sub.textContent = ''; }
      else { cue.textContent = p.cue; cue.className = 'cue'; sub.textContent = p.sub || ''; }
      var secs = status === 'run' || status === 'gap' ? (endAt - Date.now()) / 1000 : status === 'pause' ? leftMs / 1000 : inhale ? gap : p.secs;
      clock.textContent = status === 'done' ? fmtClock(0) : fmtClock(Math.ceil(secs));
      if (phases.length > 1) { clear(reps); append(reps, [h('b', { text: String(Math.min(idx, phases.length)) }), ' / ' + phases.length + ' powtórzeń']); }
      var total = status === 'gap' ? gap : p.secs;
      var frac = status === 'run' || status === 'gap' ? 1 - Math.max(0, secs) / total : status === 'pause' ? 1 - leftMs / 1000 / (pausedIn === 'gap' ? gap : p.secs) : 0;
      barI.style.width = Math.round(frac * 100) + '%';
      btn.textContent = status === 'run' || status === 'gap' ? 'Pauza' : status === 'pause' ? 'Wznów' : status === 'done' ? 'Jeszcze raz' : (opts.startLabel || 'Start');
      reset.classList.toggle('hidden', status === 'idle' && idx === 0);
    }
    function tick() {
      var ms = endAt - Date.now();
      if (ms > 0) { draw(); return; }
      if (status === 'gap') { status = 'run'; endAt = Date.now() + cur().secs * 1000; if (opts.breathTones) tone('wydech'); draw(); return; }
      idx++;
      if (opts.onRep) opts.onRep(idx);
      // Koniec serii zmienia wysokość karty (np. 2-liniowe „Mów po angielsku” → „Zrobione”): pomiar pola przed rysowaniem.
      if (idx >= phases.length) { keepFieldInPlace(function () { stop(); lockOff(); status = 'done'; beep(true); draw(); if (opts.onDone) opts.onDone(); }); return; }
      if (gap > 0) { if (!opts.breathTones) beep(false); enterGap(); }
      else { beep(false); status = 'run'; endAt = Date.now() + cur().secs * 1000; }
      draw();
    }
    function run() { stop(); iv = setInterval(tick, 200); }
    function stop() { if (iv) clearInterval(iv); iv = null; }
    function toggle() {
      if (opts.breathTones) playbackSession();
      primeAudio();
      if (status === 'run' || status === 'gap') {
        // v4: z przerwą na wdech po pauzie zawsze pełny odliczany wdech, a przerwane powtórzenie liczy się od nowa.
        if (gap > 0) { pausedIn = 'gap'; leftMs = gap * 1000; } else { pausedIn = status; leftMs = Math.max(0, endAt - Date.now()); }
        status = 'pause'; stop(); lockOff(); draw(); return;
      }
      if (status === 'pause') {
        if (pausedIn === 'gap') enterGap(); else { status = pausedIn; endAt = Date.now() + leftMs; }
        lockOn(); run(); draw(); return;
      }
      if (status === 'done') { idx = 0; if (opts.onReset) opts.onReset(); }
      if (opts.onStart) opts.onStart();
      // v4: z przerwą na wdech (Oddech A) pierwsze powtórzenie też zaczyna się od odliczanego wdechu.
      if (gap > 0) enterGap(); else { status = 'run'; endAt = Date.now() + cur().secs * 1000; }
      lockOn(); run(); draw();
    }
    draw();
    return self;
  }
  function killTimers() { activeTimers.forEach(function (t) { t.stop(); }); activeTimers = []; wakeOff(); }

  /* ---------- Start na sygnał: random wait → beep + question → answer window ---------- */
  var SIGNAL_N = 10, SIGNAL_ANSWER = 8, SIGNAL_WAIT = [2, 6];
  function SignalDrill(container, opts) {
    // opts: questions[], startIndex, onStart, onRep(i), onReset, onDone. States: idle | wait | answer | pause | done.
    var qs = opts.questions, n = qs.length, idx = opts.startIndex || 0, status = 'idle', endAt = 0, waitMs = 0, paused = null, iv = null;
    var cue = h('div', { class: 'cue', 'aria-live': 'polite' }), sub = h('div', { class: 'sub' }), clock = h('div', { class: 'clock' });
    var reps = h('div', { class: 'reps' }), barI = h('i'), bar = h('div', { class: 'bar' }, barI);
    var btn = h('button', { class: 'big', type: 'button', onclick: toggle });
    var reset = h('button', { class: 'ghost', type: 'button', text: 'Od nowa', onclick: function () { stop(); idx = 0; status = 'idle'; if (opts.onReset) opts.onReset(); draw(); } });
    var root = h('div', { class: 'timer signal' }, cue, sub, clock, reps, bar, btn, h('div', { class: 'row' }, reset));
    container.appendChild(root);
    var self = { stop: stop };
    activeTimers.push(self);
    function rnd() { return Math.round((SIGNAL_WAIT[0] + Math.random() * (SIGNAL_WAIT[1] - SIGNAL_WAIT[0])) * 1000); }
    function draw() {
      root.classList.toggle('wait', status === 'wait' || (status === 'pause' && paused === 'wait'));
      var left = Math.max(0, endAt - Date.now());
      if (status === 'wait') { cue.textContent = 'Czekaj na sygnał…'; sub.textContent = 'dłoń na brzuchu, oddychasz normalnie'; clock.textContent = '·'; }
      else if (status === 'answer') { cue.textContent = qs[idx]; sub.textContent = 'wdech nosem i od razu odpowiedź na wydechu'; clock.textContent = fmtClock(Math.ceil(left / 1000)); }
      else if (status === 'pause') { cue.textContent = 'Pauza'; sub.textContent = 'po wznowieniu znowu czekasz na sygnał'; clock.textContent = '·'; }
      else if (status === 'done') { cue.textContent = 'Zrobione'; sub.textContent = ''; clock.textContent = fmtClock(0); }
      else { cue.textContent = 'Gotowy?'; sub.textContent = n + ' pytań, każde w losowym momencie'; clock.textContent = fmtClock(SIGNAL_ANSWER); }
      clear(reps); append(reps, [h('b', { text: String(Math.min(idx, n)) }), ' / ' + n + ' startów']);
      barI.style.width = (status === 'answer' ? Math.round((1 - left / (SIGNAL_ANSWER * 1000)) * 100) : 0) + '%';
      btn.textContent = status === 'wait' || status === 'answer' ? 'Pauza' : status === 'pause' ? 'Wznów' : status === 'done' ? 'Jeszcze raz' : 'Start';
      reset.classList.toggle('hidden', status === 'idle' && idx === 0);
    }
    function toWait() { status = 'wait'; waitMs = rnd(); endAt = Date.now() + waitMs; }
    function tick() {
      if (Date.now() < endAt) { if (status === 'answer') draw(); return; }
      if (status === 'wait') { status = 'answer'; endAt = Date.now() + SIGNAL_ANSWER * 1000; beep(false); draw(); return; }
      if (status === 'answer') {
        idx++; if (opts.onRep) opts.onRep(idx);
        if (idx >= n) { stop(); status = 'done'; beep(true); draw(); if (opts.onDone) opts.onDone(); return; }
        toWait(); draw();
      }
    }
    function run() { stop(); iv = setInterval(tick, 200); }
    function stop() { if (iv) clearInterval(iv); iv = null; }
    function toggle() {
      primeAudio();
      if (status === 'wait' || status === 'answer') { paused = status; status = 'pause'; stop(); draw(); return; }
      if (status === 'pause') { toWait(); run(); draw(); return; }
      if (status === 'done') { idx = 0; if (opts.onReset) opts.onReset(); }
      if (opts.onStart) opts.onStart();
      toWait(); run(); draw();
    }
    draw();
    return self;
  }


  function monoLangNote(lang, xlang) { return 'Język: ' + lang.toUpperCase() + ' – ★ była ' + (xlang === 'en' ? 'po angielsku' : 'po polsku'); }
  function randomTopic(avoid) { var next; do { next = Math.floor(Math.random() * TOPICS.length); } while (avoid.indexOf(next) >= 0 && TOPICS.length > avoid.length); return next; }
  function TopicCard(container, m, onChange, opts) {
    // m = day.monolog albo day.extra (mutated): {topic, lang}. opts.fixedLang: bez przełącznika PL/EN (★); opts.avoid(): tematy do pominięcia przy „Inny temat”.
    opts = opts || {};
    var tagEl = h('div', { class: 'tag' }), qEl = h('div', { class: 'q' });
    var segBtns = {};
    var seg = opts.fixedLang ? null : h('div', { class: 'seg', role: 'group', 'aria-label': 'Język monologu' });
    var langNote = h('div', { class: 'note langnote' + (opts.langNote ? '' : ' hidden'), text: opts.langNote || '' });
    if (opts.langNote && seg) seg.classList.add('hidden');
    if (seg) ['pl', 'en'].forEach(function (L) {
      segBtns[L] = h('button', { type: 'button', text: L.toUpperCase(), onclick: function () { if (m.lang === L) return; m.lang = L; onChange(); draw(); } });
      seg.appendChild(segBtns[L]);
    });
    var otherBtn = h('button', { class: 'ghost', type: 'button', text: 'Inny temat', onclick: function () {
      m.topic = randomTopic([m.topic].concat(opts.avoid ? opts.avoid() : [])); onChange(); draw();
    } });
    function draw() {
      var t = TOPICS[m.topic];
      tagEl.textContent = (TAG_LABEL[t[0]] || t[0]) + (opts.fixedLang ? ' · ' + (m.lang === 'en' ? 'po angielsku' : 'po polsku') : '');
      qEl.textContent = m.lang === 'en' ? t[2] : t[1];
      if (seg) ['pl', 'en'].forEach(function (L) { segBtns[L].classList.toggle('on', m.lang === L); segBtns[L].setAttribute('aria-pressed', m.lang === L ? 'true' : 'false'); });
    }
    draw();
    container.appendChild(h('div', { class: 'topic' }, tagEl, qEl, h('div', { class: 'ctl' }, otherBtn, seg, langNote)));
    return { redraw: draw, lock: function (text) { if (seg) seg.classList.add('hidden'); langNote.textContent = text; langNote.classList.remove('hidden'); } };
  }

  var BRIEF_LABEL = ['Co robisz', 'Jak to ma brzmieć', 'Czego nie robić'];
  function briefBlock(id) {
    var t = INS[id];
    return h('ul', { class: 'brief' }, t.brief.map(function (s, i) { return h('li', { class: i === 2 ? 'no' : '' }, h('b', { text: BRIEF_LABEL[i] + ': ' }), s); }));
  }
  function fullInstructions(body, id, jakExtra) {
    // Full block; open until the exercise was started once, then behind "Pokaż instrukcję". jakExtra: zdanie dopisywane do „Jak to ma brzmieć” (v5, Oddech A).
    var t = INS[id];
    var block = h('div', { class: 'ins' },
      h('div', { class: 'ln' }, h('b', { text: 'Co robisz' }), t.co),
      h('div', { class: 'ln' }, h('b', { text: 'Jak to ma brzmieć' }), t.jak + (jakExtra ? ' ' + jakExtra : '')),
      h('div', { class: 'ln no' }, h('b', { text: 'Czego nie robić' }), t.nie),
      h('details', {}, h('summary', { text: 'Dlaczego to ćwiczenie' }), h('p', { text: t.dlaczego })));
    var open = !state.insSeen[id];
    var tg = h('button', { class: 'instoggle', type: 'button', 'aria-expanded': open ? 'true' : 'false', onclick: function () { open = !open; paint(); } });
    function paint() { block.classList.toggle('hidden', !open); tg.textContent = open ? 'Ukryj instrukcję' : 'Pokaż instrukcję'; tg.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    paint();
    body.appendChild(tg); body.appendChild(block);
    return { collapse: function () { if (open) { open = false; paint(); } } };
  }
  function markSeen(id) { if (!state.insSeen[id]) { state.insSeen[id] = true; save(); } }

  // v5 (#19, B34): technika stała, treść zmienna. Słowa dnia w Oddechu A – dwie pule, okno 7 dni bez powtórek, „Aleksander” w dni nieparzyste.
  // Pula 1 (od tygodnia 1): samogłoska albo m, n, l, ł, r, w, j na początku (program A krok 3, B). Pula 2 (od A_HARD_FROM_WEEK): zwarte k, g, t, d, p, b (program C).
  var A_HARD_FROM_WEEK = 3; // logopedka zgodzi się na k/g wcześniej → 1

  /* Deterministyczny dobór (bez Math.random i bez zapisu w stanie): dla d = 2 … N pula tasowana mulberry32 z ziarnem d*7919+13+offset (Fisher–Yates);
     bierzemy pierwszych kandydatów spoza dni d−6 … d−1, z tematem nieużytym w tym dniu. Awaryjnie najdawniej użyty (łamie się okno, nigdy temat). */
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffledIdx(n, seed) { var a = [], r = mulberry32(seed), i; for (i = 0; i < n; i++) a.push(i); for (i = n - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function Rotation(specs) {
    // specs: [{ pool, offset, count(d), topic(item) | null }] – liczone dzień po dniu, kolejno w obrębie dnia (temat wspólny dla wszystkich pul dnia).
    var last = specs.map(function () { return {}; }), days = {}, upTo = 1, MAXD = 2000;
    function step(d) {
      var used = {}, out = [];
      specs.forEach(function (s, si) {
        var cnt = s.count(d), order = shuffledIdx(s.pool.length, d * 7919 + 13 + s.offset), pick = [], L = last[si];
        function ok(i) { return pick.indexOf(i) < 0 && (!s.topic || !used[s.topic(s.pool[i])]); }
        function take(i) { pick.push(i); if (s.topic) used[s.topic(s.pool[i])] = true; }
        order.forEach(function (i) { if (pick.length < cnt && ok(i) && !(L[i] >= d - 6)) take(i); });
        while (pick.length < cnt) { // awaryjnie: najdawniej użyty
          var best = -1;
          order.forEach(function (i) { if (ok(i) && (best < 0 || (L[i] || 0) < (L[best] || 0))) best = i; });
          if (best < 0) break;
          take(best);
        }
        pick.forEach(function (i) { L[i] = d; });
        out.push(pick.map(function (i) { return s.pool[i]; }));
      });
      days[d] = out;
    }
    return function (n) { n = Math.min(n, MAXD); if (n < 2) return specs.map(function () { return []; }); for (var d = upTo + 1; d <= n; d++) step(d); if (n > upTo) upTo = n; return days[n]; };
  }
  var qRot = Rotation([
    { pool: SIGNAL_PL, offset: 0, count: function () { return 6; }, topic: function (x) { return x.t; } },
    { pool: SIGNAL_EN, offset: 1, count: function () { return 4; }, topic: function (x) { return x.t; } }
  ]);
  function aHard(d) { return weekOf(d) >= A_HARD_FROM_WEEK; }
  var wRot = Rotation([
    { pool: A_POOL2, offset: 3, count: function (d) { return aHard(d) ? 2 : 0; } },
    { pool: A_POOL1, offset: 2, count: function (d) { return (aHard(d) ? 2 : 4) - (d % 2 === 1 ? 1 : 0); } }
  ]);
  function oddechWords(k) {
    // [{w, hard}] × 4: od A_HARD_FROM_WEEK słowa 1–2 z puli 2; w dni nieparzyste słowo 4 = „Aleksander”.
    var n = dayIndex(k), r = wRot(n), out = [];
    r[0].forEach(function (w) { out.push({ w: w, hard: true }); });
    r[1].forEach(function (w) { out.push({ w: w, hard: false }); });
    if (n % 2 === 1) out.push({ w: A_NAME, hard: false });
    return out;
  }
  function signalQuestions(k, n) {
    // 10 per day: 6 PL + 4 EN, deterministic per day so a reload shows the same set.
    var r = qRot(dayIndex(k)), pl = r[0], en = r[1], out = [];
    for (var i = 0, a = 0, b = 0; i < n; i++) {
      var q = i % 5 === 1 || i % 5 === 3 ? en[b++] : pl[a++];
      if (q) out.push(q.q);
    }
    return out;
  }
  function isSrDay(k) { var n = dayIndex(k); return n >= 1 && n % 7 === 0; }
  function exercisesFor(k) {
    var d = peekDay(k), n = dayIndex(k), w = weekOf(n);
    if (d && d.baseline) return ['baza', 'monolog', 'dziennik', 'sr'];
    var list;
    if (w >= 4) list = ['dziennik'];
    else {
      list = ['oddech', 'sygnal', 'monolog'];
      if (w >= 2) list.push('napiecie');
      if (w >= 3) list.push('miekki');
      list.push('dziennik');
    }
    if (isSrDay(k)) list.push('sr');
    return list;
  }
  // B14: karta zadania w terenie od dnia 8, tylko w tygodniach z treścią.
  function fieldId(k) { var n = dayIndex(k), id = 'field' + weekOf(n); return n >= 8 && INS[id] ? id : null; } // klucz insSeen = id tygodnia: nowa treść = instrukcja znowu rozwinięta
  // ★ w dniach z Luźnym monologiem (tygodnie 1–3, bez dnia 1); nie wchodzi do listy ćwiczeń, paska postępu ani „Teraz”.
  function hasExtra(k) { var d = peekDay(k), n = dayIndex(k); return n >= 2 && weekOf(n) <= 3 && !(d && d.baseline) && exercisesFor(k).indexOf('monolog') >= 0; }
  function extraDone(k) { var d = peekDay(k); return !!d && !!d.extra && d.extra.done === true; }
  function extraPending(k) { return hasExtra(k) && !extraDone(k); }
  function extraStarted(d) { return !!d && !!d.extra && (d.extra.ran || d.extra.done) && !!d.extra.lang; }
  function extraBtnLang(k) { var d = day(k); return extraStarted(d) ? d.extra.lang : extraLang(k); }
  function extraLang(k) { var d = day(k), m = d.monolog, ml = m.lang || (dayIndex(k) % 2 === 1 ? 'pl' : 'en'); return ml === 'pl' ? 'en' : 'pl'; }
  function exTitle(k, ex) { var d = peekDay(k); return ex === 'sr' && d && d.baseline ? 'SR dnia' : EX_META[ex].title; }
  function isDone(k, ex) { if (ex === 'extra') return extraDone(k); if (ex === 'field') { var f = peekDay(k); return !!f && f.field != null; } var d = peekDay(k); return !!d && d.done.indexOf(ex) >= 0; }
  function refreshComplete(k) { var d = day(k); if (!d.complete && exercisesFor(k).every(function (e) { return d.done.indexOf(e) >= 0; })) d.complete = true; }
  function markDone(k, ex) {
    if (cards[ex] && isField(document.activeElement)) {
      // Fokus w polu (np. dziennik): bez przebudowy ekranu. Pole w tej samej karcie – łatka w miejscu; w innej karcie – przebudowa tylko tej karty.
      if (cards[ex].contains(document.activeElement)) return markDoneInPlace(k, ex);
      var dd = day(k); if (dd.done.indexOf(ex) < 0) dd.done.push(ex); refreshComplete(k); save(); recent[ex] = true;
      rebuildCard(k, ex); if (allListedDone(k)) scheduleReturn(k); return;
    }
    var d = day(k); if (d.done.indexOf(ex) < 0) d.done.push(ex); refreshComplete(k); save(); recent[ex] = true; renderDzis(); scrollToNext(k); if (allListedDone(k)) scheduleReturn(k); }
  function scrollToNext(k) {
    var nextEx = exercisesFor(k).filter(function (e) { return !isDone(k, e); })[0];
    var target = nextEx ? cards[nextEx] : hdr.banner;
    try { (target || hdr.next).scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { /* ignore */ }
  }
  function markDoneInPlace(k, ex, anchor) {
    // Same as markDone but without rebuilding the screen (keeps focus in inputs). anchor: element, który ma zostać w miejscu (np. dotknięty przycisk).
    var d = day(k); if (d.done.indexOf(ex) >= 0) return; d.done.push(ex); refreshComplete(k); save(); recent[ex] = true;
    var card = cards[ex]; if (!card) { renderDzis(); return; }
    keepFieldInPlace(function () {
      card.classList.add('done'); card.querySelector('.mark').textContent = '✓';
      card.querySelector('small').textContent = 'Zrobione' + doneSummary(k, ex);
      var head = card.querySelector('.chead');
      if (head && !head.querySelector('.act') && !d.baseline && REPEAT[ex]) head.appendChild(repeatBtn(REPEAT[ex].label, function () { REPEAT[ex].fn(k, d); })); // po odznacz → zaznacz
      var body = card.querySelector('.cbody'); body.insertBefore(encCard(k, ex), body.firstChild);
      updateHeader();
    }, anchor);
    if (allListedDone(k)) scheduleReturn(k);
  }
  function unmarkInPlace(k, ex, anchor) {
    // v5 (#20): odznaczenie bez przebudowy ekranu; dzień raz zaliczony zostaje zaliczony (flaga complete).
    unmark(k, ex);
    var card = cards[ex]; if (!card) return;
    keepFieldInPlace(function () {
      card.classList.remove('done'); card.querySelector('.mark').textContent = '';
      card.querySelector('small').textContent = EX_META[ex].sub + ' · ' + EX_META[ex].mins;
      var enc = card.querySelector('.cbody > .enc'); if (enc) enc.parentNode.removeChild(enc);
      var act = card.querySelector('.chead .act'); if (act) act.parentNode.removeChild(act);
      updateHeader();
    }, anchor);
  }
  function keepFieldInPlace(fn, anchor) {
    // Zmiana DOM nad polem, w którym piszesz, nie może go przesunąć (Safari nie ma scroll anchoring). Bez pola w fokusie: opcjonalny anchor.
    var ae = document.activeElement, el = isField(ae) ? ae : anchor, top = el && el.isConnected ? el.getBoundingClientRect().top : null;
    fn();
    if (top != null && el.isConnected) { var dy = el.getBoundingClientRect().top - top; if (Math.abs(dy) > 1) try { window.scrollBy(0, dy); } catch (e) { /* ignore */ } }
  }
  function rebuildCard(k, ex) {
    var old = cards[ex]; if (!old || !old.parentNode) { renderDzis(); return; }
    keepFieldInPlace(function () { var c = exerciseCard(k, ex, old.classList.contains('current')); old.parentNode.replaceChild(c, old); cards[ex] = c; updateHeader(); });
  }
  function renderOrRebuild(k, ex) { var ae = document.activeElement; if (cards[ex] && isField(ae) && !cards[ex].contains(ae)) rebuildCard(k, ex); else renderDzis(); }
  function unmark(k, ex) { refreshComplete(k); var d = day(k); d.done = d.done.filter(function (x) { return x !== ex; }); delete recent[ex]; save(); } // dzień raz zaliczony zostaje zaliczony (także bez flagi complete)
  function allListedDone(k) { var d = peekDay(k); return !!d && exercisesFor(k).every(function (e) { return d.done.indexOf(e) >= 0; }); }
  function isDayDone(k) { var d = peekDay(k); if (!d) return false; if (d.complete) return true; return exercisesFor(k).every(function (e) { return d.done.indexOf(e) >= 0; }); }
  function encPool(k, ex) {
    var a = ENC[ex] || ['Zrobione.'], d = peekDay(k);
    // v5: zachęta nie może przeczyć faktom – „brzuch miękki” tylko po „tak”, „dzień i tak zaliczony” tylko w zaliczonym dniu.
    if (ex === 'oddech' && d && d.oddechBrzuch && d.oddechBrzuch !== 'tak') a = a.filter(function (t) { return !/Brzuch miękki/.test(t); });
    if (ex === 'extra' && !isDayDone(k)) a = a.filter(function (t) { return !/Dzień i tak był zaliczony/.test(t); });
    return a;
  }
  function encCard(k, ex) { return h('div', { class: 'enc' }, h('strong', { text: ex === 'extra' ? '★ ' : 'Zaliczone. ' }), pick(encPool(k, ex), dayIndex(k) + ex.length)); }
  var recent = {};
  var expanded = {};
  var cards = {};
  var extraHook = null;
  var monoHook = null; // v5: ★ wystartowała → język Luźnego monologu przeciwny do ★, bez przełącznika
  var holdReturn = null; // v5: dzień zakończony wpisem „tak” bez notatki → baner z „Na mapę” zamiast powrotu (czas na notatkę) // v5 (#21): zmiana języka Luźnego monologu odświeża język ★, dopóki ★ nie wystartowała

  /* ---------- screen: Dziś ---------- */
  var lastToday = todayKey();
  var viewKey = lastToday;
  if (dayIndex(viewKey) < 1) viewKey = DAY1;
  function checkRollover(render) {
    var t = todayKey();
    if (t !== lastToday) { lastToday = t; viewKey = t; recent = {}; expanded = {}; dzisView = 'map'; if (render && currentTab === 'dzis') { renderDzis(); flushAfterShow(); } }
  }
  function onVisible() { checkRollover(true); }

  var hdr = {};
  var dzisView = 'map'; // 'map' | 'session'
  function renderDzis() { if (dzisView === 'map') renderMap(); else renderSession(); }
  function openDay(k) { holdReturn = null; viewKey = k; dzisView = 'session'; recent = {}; expanded = {}; renderDzis(); try { window.scrollTo(0, 0); } catch (e) { /* ignore */ } }
  function backToMap() { holdReturn = null; dzisView = 'map'; renderDzis(); flushAfterShow(); }
  var justDone = null, mapMsg = '';
  // Odłożony powrót na mapę jest anulowany, gdy po zaliczeniu dnia zrobisz w sesji coś świadomie (przycisk, chip, nagłówek karty),
  // np. „Zmień” SR. Neutralne wyjście z pola (klawiatura „Gotowe”, tap w puste miejsce) nadal wraca na mapę. Tagi dziennika to część pisania.
  var returnGen = 0;
  document.getElementById('s-dzis').addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('button, [role=button], summary, a, label') : null;
    if (t && !t.closest('.tags, .fieldq')) returnGen++; // B14: odpowiedź na zadanie w terenie nie zatrzymuje powrotu na mapę
  }, true);
  function scheduleReturn(k, gen) {
    // v5 (#21, G7): gdy jest niezrobiona ★, zamiast powrotu baner „Sesja zrobiona” ma przyciski „Na mapę” i „★ Jeszcze monolog”.
    if (extraPending(k) || holdReturn === k) return;
    if (gen == null) gen = returnGen;
    setTimeout(function () {
      if (gen !== returnGen || currentTab !== 'dzis' || dzisView !== 'session' || viewKey !== k || !allListedDone(k)) return;
      // Review R2: never pull the screen away while the user is typing (diary is often the last exercise).
      var ae = document.activeElement;
      if (isField(ae)) { ae.addEventListener('focusout', function once() { ae.removeEventListener('focusout', once); scheduleReturn(k, gen); }); return; }
      returnToMap(k);
    }, 1800);
  }
  function returnToMap(k) {
    holdReturn = null;
    var w = weekOf(dayIndex(k));
    justDone = k; mapMsg = 'Archipelag ' + w + ': ' + weekDoneCount(w) + '/7';
    dzisView = 'map'; renderDzis(); afterShow = null; scrollToArch(w);
  }
  function renderSession() {
    killTimers();
    var root = document.getElementById('s-dzis'); clear(root);
    cards = {};
    var today = todayKey();
    if (viewKey > today) viewKey = today;
    var k = viewKey, d = day(k), n = dayIndex(k), w = weekOf(n), list = exercisesFor(k);
    var nextEx = list.filter(function (e) { return !isDone(k, e); })[0];
    var isToday = k === today;
    root.appendChild(h('button', { class: 'back', type: 'button', text: '← Mapa', onclick: backToMap }));

    var prev = h('button', { class: 'arrow', type: 'button', text: '‹', 'aria-label': 'Poprzedni dzień', disabled: n <= 1, onclick: function () { viewKey = addDays(viewKey, -1); recent = {}; expanded = {}; renderDzis(); } });
    var next = h('button', { class: 'arrow', type: 'button', text: '›', 'aria-label': 'Następny dzień', disabled: k >= today, onclick: function () { if (viewKey >= todayKey()) return; viewKey = addDays(viewKey, 1); recent = {}; expanded = {}; renderDzis(); } });
    root.appendChild(h('header', { class: 'top' },
      h('div', { class: 'daynav' }, prev,
        h('div', { class: 'mid' }, h('h1', { text: 'Dzień ' + n + (d.baseline ? ' – Baza' : '') }), h('p', { text: fmtDate(k) + ' · tydzień ' + w + (isToday ? ' · dziś' : '') })),
        next)
    ));
    hdr = { bar: h('div', { class: 'progress', role: 'progressbar', 'aria-label': 'Postęp sesji' }), next: h('div', { class: 'next' }), banner: h('div'), k: k, list: list, n: n, w: w };
    root.appendChild(hdr.bar); root.appendChild(hdr.next); root.appendChild(hdr.banner);
    if (w >= 4 && !d.baseline) root.appendChild(planCard(w));
    extraHook = null; monoHook = null;
    list.forEach(function (ex) { var c = exerciseCard(k, ex, ex === nextEx); cards[ex] = c; root.appendChild(c); });
    if (fieldId(k)) { cards.field = exerciseCard(k, 'field', false); root.appendChild(cards.field); } // B14: pod ćwiczeniami, bez odpowiedzi rozwinięta
    if (hasExtra(k)) { cards.extra = exerciseCard(k, 'extra', false); root.appendChild(cards.extra); } // v5 (#21): pod obowiązkowymi, domyślnie zwinięta
    updateHeader();
    if (!isToday) root.appendChild(h('p', { class: 'footer' }, 'Przeglądasz wcześniejszy dzień.'));
  }
  function planCard(w) {
    return h('div', { class: 'card' }, h('h2', { text: 'Etap ' + w + ': ' + WEEKS[w - 1][0] }),
      h('p', { text: 'Ten etap zostanie dodany przed ' + fmtDate(weekStart(w)) + '. Dziś: dziennik' + (isSrDay(viewKey) ? ' i SR tygodnia.' : '.') }),
      h('p', { class: 'note', text: 'Planowane ćwiczenia: ' + weekExNames(w).join(', ') + '.' }));
  }

  var NS = 'http://www.w3.org/2000/svg';
  var AH = 540, MAPW = 390;
  var ISL_X = [125, 205, 280, 262, 180, 112, 195];
  function weekStart(w) { return addDays(DAY1, (w - 1) * 7); }
  function weekExNames(w) { if (WEEKS[w - 1][2]) return WEEKS[w - 1][2]; return exercisesFor(addDays(DAY1, (w - 1) * 7 + 6)).map(function (e) { return EX_META[e].title; }); }
  function weekDoneCount(w) { var n = 0; for (var i = 0; i < 7; i++) if (isDayDone(addDays(weekStart(w), i))) n++; return n; }
  function islandState(k, today) { if (k > today) return 'locked'; if (isDayDone(k)) return 'done'; if (k === today) return 'today'; return 'missed'; }
  function sv(tag, attrs, text) { var e = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach(function (a) { e.setAttribute(a, attrs[a]); }); if (text != null) e.textContent = text; return e; }
  function islandPos(w, i) { return [ISL_X[i], (w - 1) * AH + 100 + i * 58]; }
  function scrollToArch(w) {
    w = Math.max(1, Math.min(12, w));
    var svg = document.querySelector('#s-dzis svg.map'); if (!svg) return;
    try {
      var r = svg.getBoundingClientRect(), scale = r.width / MAPW;
      window.scrollTo(0, Math.max(0, window.scrollY + r.top + (w - 1) * AH * scale - 72));
    } catch (e) { /* ignore */ }
  }
  var sheet = document.getElementById('sheet');
  function openSheet(k) {
    var n = dayIndex(k), w = weekOf(n);
    clear(sheet);
    append(sheet, [h('h2', { text: 'Dzień ' + n + ' · ' + WEEKS[w - 1][0] }),
      h('p', { text: 'Odblokuje się ' + fmtDate(k) + '.' }),
      h('p', { class: 'note', text: 'Ćwiczenia tego archipelagu:' }),
      h('ul', {}, weekExNames(w).map(function (x) { return h('li', { text: x }); })),
      h('button', { class: 'plain', type: 'button', text: 'Zamknij', style: 'width:100%', onclick: closeSheet })]);
    sheet.classList.add('on');
  }
  function closeSheet() { sheet.classList.remove('on'); }
  function renderMap() {
    killTimers(); closeSheet();
    var root = document.getElementById('s-dzis'); clear(root);
    var today = todayKey(), tn = dayIndex(today), tw = Math.max(1, Math.min(12, weekOf(tn)));
    var st = streak();
    root.appendChild(h('header', { class: 'top' }, h('h1', { text: 'Dzień ' + tn }),
      h('p', { text: 'Archipelag ' + tw + ': ' + WEEKS[tw - 1][0] + ' · streak ' + st + (st === 1 ? ' dzień' : ' dni') })));
    root.appendChild(h('div', { class: 'mapline', text: mapMsg })); mapMsg = '';
    state.archDone = isObj(state.archDone) ? state.archDone : {};
    for (var cw = 1; cw <= 12; cw++) (function (cw) {
      if (weekDoneCount(cw) === 7 && !state.archDone[cw]) {
        var card = h('div', { class: 'card done' }, h('h2', { text: cw < 12 ? 'Nowy archipelag: ' + WEEKS[cw][0] : 'Program ukończony' }),
          h('p', { text: cw < 12 ? 'Archipelag ' + cw + ' (' + WEEKS[cw - 1][0] + ') zaliczony w całości. Następny etap: ' + WEEKS[cw][1] + '.' : 'Dwanaście archipelagów za Tobą. Teraz liczy się utrzymanie.' }),
          h('div', { class: 'row' }, h('button', { type: 'button', text: 'Dalej', onclick: function () { state.archDone[cw] = true; saveNow(); card.parentNode.removeChild(card); } })));
        root.appendChild(card);
      }
    })(cw);
    var H = AH * 12 + 40;
    var svg = sv('svg', { viewBox: '0 0 ' + MAPW + ' ' + H, class: 'map', role: 'group', 'aria-label': 'Mapa programu: 12 archipelagów' });
    svg.appendChild(sv('rect', { x: 0, y: 0, width: MAPW, height: H, fill: '#cfe0db' }));
    for (var w = 1; w <= 12; w++) {
      var top = (w - 1) * AH, g = sv('g', { class: 'arch', 'data-w': w });
      // water ripples
      for (var rp = 0; rp < 3; rp++) { var ry = top + 30 + rp * 170 + (w % 3) * 20, rx = 20 + ((w * 37 + rp * 53) % 300); g.appendChild(sv('path', { d: 'M' + rx + ' ' + ry + ' q 10 -5 20 0 t 20 0', fill: 'none', stroke: '#b9d0ca', 'stroke-width': 1.5, 'stroke-linecap': 'round' })); }
      // land cluster: three overlapping ellipses drawn twice (shallow shore under sand) = one soft blob without seams
      var blobs = [[195, top + 300, 150, 228], [125 + (w % 2) * 20, top + 160, 96, 74], [268 - (w % 3) * 15, top + 436, 92, 70]];
      [['#dfe6d2', 7], ['#ede4cf', 0]].forEach(function (layer) {
        var gl = sv('g', { fill: layer[0] });
        blobs.forEach(function (b) { gl.appendChild(sv('ellipse', { cx: b[0], cy: b[1], rx: b[2] + layer[1], ry: b[3] + layer[1] })); });
        g.appendChild(gl);
      });
      g.appendChild(sv('text', { x: 24, y: top + 36, class: 'aname' }, w + ' · ' + WEEKS[w - 1][0]));
      g.appendChild(sv('text', { x: 24, y: top + 58, class: 'afocus' }, WEEKS[w - 1][1]));
      g.appendChild(sv('text', { x: 366, y: top + 36, class: 'aprog' }, weekDoneCount(w) + '/7'));
      // dotted path within the archipelago, then on to the next one
      var pts = [];
      for (var i = 0; i < 7; i++) pts.push(islandPos(w, i));
      if (w < 12) pts.push(islandPos(w + 1, 0));
      var dpath = 'M' + pts.map(function (q) { return q[0] + ' ' + q[1]; }).join(' L ');
      g.appendChild(sv('path', { d: dpath, fill: 'none', stroke: '#8fa8a1', 'stroke-width': 3, 'stroke-dasharray': '1 9', 'stroke-linecap': 'round' }));
      for (var j = 0; j < 7; j++) g.appendChild(islandNode(w, j, today));
      svg.appendChild(g);
    }
    root.appendChild(h('div', { class: 'mapwrap' }, svg));
    root.appendChild(h('p', { class: 'footer', text: '12 archipelagów = 12 tygodni programu. Dotknij wyspę, żeby otworzyć dzień.' }));
    afterShow = function () { scrollToArch(tw); }; // run by showTab after its scrollTo(0,0), or by flushAfterShow()
  }
  function flushAfterShow() { if (afterShow) { var f = afterShow; afterShow = null; f(); } }
  function islandNode(w, i, today) {
    var k = addDays(weekStart(w), i), n = dayIndex(k), pos = islandPos(w, i), cx = pos[0], cy = pos[1];
    var stt = islandState(k, today), isToday = k === today, r = isToday ? 27 : 22;
    var star = stt !== 'locked' && extraDone(k);
    var label = 'Dzień ' + n + ', ' + fmtDate(k) + ' – ' + (stt === 'done' ? 'zrobiony' : stt === 'locked' ? 'zablokowany' : stt === 'today' ? 'dziś' : 'do nadrobienia') + (star ? ', z gwiazdką' : '');
    var g = sv('g', { class: 'island st-' + stt + (isToday ? ' st-today' : '') + (justDone === k ? ' pop' : ''), 'data-k': k, role: 'button', tabindex: '0', 'aria-label': label });
    if (isToday) { g.appendChild(sv('circle', { cx: cx, cy: cy, r: r + 4, class: 'pulse' })); g.appendChild(sv('circle', { cx: cx, cy: cy, r: r + 7, class: 'ring' })); }
    g.appendChild(sv('circle', { cx: cx, cy: cy, r: r, class: 'isl' }));
    g.appendChild(sv('text', { x: cx, y: cy, class: 'num' }, String(n)));
    if (stt === 'done') {
      g.appendChild(sv('circle', { cx: cx + r - 6, cy: cy - r + 6, r: 9, fill: '#fff', stroke: '#2f6f5e', 'stroke-width': 1.5 }));
      g.appendChild(sv('path', { d: 'M' + (cx + r - 10) + ' ' + (cy - r + 6) + ' l 3 3 l 5 -6', fill: 'none', stroke: '#2f6f5e', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    }
    if (star) { // v5 (#21, G8): mała gwiazdka po lewej u góry wyspy
      var sx = cx - r + 6, sy = cy - r + 6, pts = [];
      for (var si = 0; si < 10; si++) { var ang = -Math.PI / 2 + si * Math.PI / 5, rr = si % 2 ? 3.4 : 7.5; pts.push((sx + rr * Math.cos(ang)).toFixed(1) + ',' + (sy + rr * Math.sin(ang)).toFixed(1)); }
      g.appendChild(sv('circle', { cx: sx, cy: sy, r: 9, fill: '#fff', stroke: '#2f6f5e', 'stroke-width': 1.5, class: 'star' }));
      g.appendChild(sv('polygon', { points: pts.join(' '), fill: '#e0a100', class: 'star' }));
    }
    if (isToday) {
      g.appendChild(sv('text', { x: cx, y: cy - r - 14, class: 'lbl b' }, 'Dziś'));
      g.appendChild(sv('text', { x: cx, y: cy + r + 20, class: 'lbl' }, parseKey(k).getDate() + '.' + pad2(parseKey(k).getMonth() + 1)));
    }
    function act() { if (stt === 'locked') openSheet(k); else openDay(k); }
    g.addEventListener('click', act);
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
    if (justDone === k) justDone = null;
    return g;
  }
  function updateHeader() {
    var k = hdr.k, list = hdr.list, n = hdr.n, w = hdr.w;
    var doneCount = list.filter(function (e) { return isDone(k, e); }).length;
    var nextEx = list.filter(function (e) { return !isDone(k, e); })[0];
    clear(hdr.bar); list.forEach(function (e) { hdr.bar.appendChild(h('span', { class: isDone(k, e) ? 'on' : '' })); });
    hdr.bar.setAttribute('aria-valuenow', doneCount); hdr.bar.setAttribute('aria-valuemax', list.length);
    clear(hdr.next); clear(hdr.banner);
    if (nextEx && isDayDone(k)) {
      append(hdr.next, [h('div', {}, 'Dzień zaliczony. Dodatkowo: ', h('strong', { text: exTitle(k, nextEx) }), ' · ' + EX_META[nextEx].mins), h('span', { text: doneCount + '/' + list.length })]);
    } else if (nextEx) {
      append(hdr.next, [h('div', {}, 'Teraz: ', h('strong', { text: exTitle(k, nextEx) }), ' · ' + EX_META[nextEx].mins), h('span', { text: doneCount + '/' + list.length })]);
    } else {
      var st = streak();
      var bannerCard = h('div', { class: 'card done' }, h('h2', { text: 'Sesja zrobiona' }),
        h('p', { text: 'Dzień ' + n + ' zaliczony. Streak: ' + st + (st === 1 ? ' dzień' : ' dni') + '. Jutro ' + (weekOf(n + 1) > w ? 'zaczyna się tydzień ' + weekOf(n + 1) + ' – dochodzi nowe ćwiczenie.' : 'to samo, ciało zapamięta.') }));
      var xp = extraPending(k) && cards.extra;
      if (xp || holdReturn === k) { // v5 (#21, G7; #20: czas na notatkę)
        bannerCard.appendChild(h('div', { class: 'row' },
          h('button', { type: 'button', text: 'Na mapę', onclick: function () { returnToMap(k); } }),
          xp ? h('button', { class: 'ghost', type: 'button', text: '★ Jeszcze monolog ' + extraBtnLang(k).toUpperCase(), onclick: openExtra }) : null));
      }
      hdr.banner.appendChild(bannerCard);
    }
    Object.keys(cards).forEach(function (ex) {
      var c = cards[ex], cur = ex === nextEx;
      c.classList.toggle('current', cur);
      if (cur && expanded[ex] == null) { c.classList.remove('collapsed'); var ch = c.querySelector('.chead'); if (ch) ch.setAttribute('aria-expanded', 'true'); }
    });
  }

  function openExtra() {
    var c = cards.extra; if (!c) return;
    expanded.extra = true; c.classList.remove('collapsed'); var ch = c.querySelector('.chead'); if (ch) ch.setAttribute('aria-expanded', 'true');
    try { c.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { /* ignore */ }
  }
  function repeatBtn(label, fn) { return h('button', { class: 'ghost act', type: 'button', text: label, onclick: function (e) { e.stopPropagation(); fn(); } }); }
  function exerciseCard(k, ex, isCurrent) {
    var d = day(k), done = isDone(k, ex), meta = EX_META[ex];
    var open = expanded[ex] != null ? expanded[ex] : (isCurrent || (done && recent[ex]) || (ex === 'extra' && d.extra.ran && !done) || (ex === 'field' && !done)); // ★ w trakcie i zadanie bez odpowiedzi: rozwinięte
    var card = h('div', { class: 'card' + (done ? ' done' : '') + (isCurrent ? ' current' : '') + (open ? '' : ' collapsed') });
    function toggleBody() { expanded[ex] = card.classList.contains('collapsed'); card.classList.toggle('collapsed'); head.setAttribute('aria-expanded', card.classList.contains('collapsed') ? 'false' : 'true'); }
    var head = h('div', { class: 'chead', role: 'button', tabindex: '0', 'aria-expanded': open ? 'true' : 'false', onclick: toggleBody,
      onkeydown: function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); head.click(); } } }, // przez click: ta sama ścieżka co tap (anuluje powrót na mapę)
      h('div', { class: 'mark', text: done ? '✓' : '' }),
      h('div', { class: 't' }, h('h2', { text: exTitle(k, ex) }), h('small', { text: ex === 'field' ? (done ? 'Zapisane' + doneSummary(k, ex) : INS[fieldId(k)].sub) : done ? 'Zrobione' + doneSummary(k, ex) : meta.sub + ' · ' + meta.mins })));
    if (done && !d.baseline && REPEAT[ex]) head.appendChild(repeatBtn(REPEAT[ex].label, function () { REPEAT[ex].fn(k, d); }));
    var body = h('div', { class: 'cbody' });
    card.appendChild(head); card.appendChild(body);
    if (done && recent[ex] && ex !== 'field') body.appendChild(encCard(k, ex)); // zadanie: potwierdzenie pod przyciskami (BUILD.field)
    BUILD[ex](body, k, d, done);
    return card;
  }
  var REPEAT = {
    oddech: { label: 'Powtórz', fn: function (k, d) { unmark(k, 'oddech'); d.reps.oddech = 0; d.oddechBrzuch = null; save(); renderDzis(); } },
    miekki: { label: 'Powtórz', fn: function (k, d) { unmark(k, 'miekki'); d.reps.miekki = 0; save(); renderDzis(); } },
    sygnal: { label: 'Powtórz', fn: function (k, d) { unmark(k, 'sygnal'); d.reps.sygnal = 0; save(); renderDzis(); } },
    napiecie: { label: 'Powtórz', fn: function (k, d) { unmark(k, 'napiecie'); d.tension = {}; save(); renderDzis(); } },
    monolog: { label: 'Powtórz', fn: function (k, d) { unmark(k, 'monolog'); d.monolog.ran = false; d.monolog.breath = null; d.monolog.sr = null; d.monolog.topic = null; save(); renderDzis(); } },
    dziennik: { label: 'Edytuj', fn: function (k) { expanded.dziennik = true; renderDzis(); } },
    sr: { label: 'Zmień', fn: function (k) { expanded.sr = true; renderDzis(); } },
    extra: { label: 'Powtórz', fn: function (k, d) { var x = d.extra; x.ran = false; x.breath = null; x.sr = null; x.done = false; x.topic = null; x.lang = null; delete recent.extra; expanded.extra = true; save(); renderDzis(); } }
  };
  function doneSummary(k, ex) {
    var d = day(k);
    if (ex === 'oddech') return ' · ' + (d.reps.oddech || 0) + '/12' + (d.oddechBrzuch ? ' · brzuch: ' + d.oddechBrzuch : '');
    if (ex === 'field') return d.field === 'tak' ? ' · użyłem techniki' : ' · dziś nie';
    if (ex === 'extra') return ' · ' + (d.extra.lang || extraLang(k)).toUpperCase() + (d.extra.sr != null ? ' · SR ' + d.extra.sr : '');
    if (ex === 'miekki') return ' · ' + (d.reps.miekki || 0) + '/' + B_WORDS.length;
    if (ex === 'sygnal') return ' · ' + (d.reps.sygnal || 0) + '/' + SIGNAL_N;
    if (ex === 'sr') return ' · typowe ' + d.sr.typ + ', najgorsze ' + d.sr.max;
    if (ex === 'monolog') return d.monolog.sr != null ? ' · SR ' + d.monolog.sr : '';
    if (ex === 'napiecie') { var t = d.tension; return ' · ' + TENSION.map(function (x) { return x[1].toLowerCase() + ' ' + (t[x[0]] || 0); }).join(', '); }
    if (ex === 'dziennik') {
      var b = d.blok;
      if (b.jest === false) return ' · dziś bez wyraźnego bloku';
      if (b.jest === true && b.start && b.jezyk && b.tempo) return ' · start: ' + b.start + ' · ' + b.jezyk + ' · ' + b.tempo;
      return d.diary ? ' · „' + d.diary.slice(0, 40) + (d.diary.length > 40 ? '…' : '') + '”' : ''; // wpisy v3/v4 (sam tekst)
    }
    return '';
  }

  var BUILD = {
    baza: function (body, k, d) {
      var b = d.base || {};
      var rows = [['Czytanie PL', b.readPL], ['Monolog PL', b.monPL], ['Monolog EN', b.monEN], ['Rozmowa', b.conv]];
      body.appendChild(briefBlock('baza'));
      body.appendChild(h('table', {}, h('thead', {}, h('tr', {}, h('th', { text: 'Nagranie' }), h('th', { class: 'n', text: 'Bloki' }), h('th', { class: 'n', text: 'SR' }))),
        h('tbody', {}, rows.map(function (r) { return h('tr', {}, h('td', { text: r[0] }), h('td', { class: 'n', text: r[1] ? r[1].b : '–' }), h('td', { class: 'n', text: r[1] ? r[1].sr : '–' })); }))));
      body.appendChild(h('p', { class: 'note', text: 'Oddech A: nie wykonane (' + (d.reps.oddech || 0) + '/12). Monolog: oddech po frazach – ' + (d.monolog.breath || '–') + ', brzuch – ' + (d.monolog.belly || '–') + ', bloki ' + (d.monolog.blocks != null ? d.monolog.blocks : '–') + '.' }));
      if (d.body) body.appendChild(h('p', { class: 'note', text: 'Ciało: ' + d.body }));
      fullInstructions(body, 'baza');
    },

    oddech: function (body, k, d, done) {
      if (done) { body.appendChild(h('p', { class: 'note', text: 'Powtórzenia: ' + (d.reps.oddech || 0) + '/12' + (d.oddechBrzuch ? ' · brzuch: ' + d.oddechBrzuch : '') + '.' })); return; }
      if ((d.reps.oddech || 0) >= 12) {
        // v5 (#19, B1/B3, B35): seria skończona, zaliczenie dopiero po jednym dotknięciu „Brzuch był miękki?” (fakt, nie skala).
        body.appendChild(h('p', { class: 'note', text: 'Seria 12/12 zrobiona. Jeszcze jedno dotknięcie:' }));
        body.appendChild(h('div', { class: 'srlabel', text: 'Brzuch był miękki?' }));
        body.appendChild(h('div', { class: 'chips3', role: 'group', 'aria-label': 'Brzuch był miękki?' }, TRI.map(function (o) {
          return h('button', { type: 'button', text: o, 'aria-pressed': 'false', onclick: function () { d.oddechBrzuch = o; save(); markSeen('oddech'); markDone(k, 'oddech'); } });
        })));
        return;
      }
      body.appendChild(briefBlock('oddech'));
      var words = oddechWords(k), hasHard = words.some(function (x) { return x.hard; });
      var phases = [];
      for (var i = 0; i < 8; i++) phases.push({ secs: 7, cue: 'fff', sub: 'wydech ' + (i + 1) + '/8 · brzuch miękki' });
      for (var j = 0; j < 4; j++) {
        var wd = words[j] || { w: A_NAME, hard: false };
        phases.push({ secs: 7, cue: wd.w, word: true, sub: wd.hard ? 'lekki kontakt, powietrze idzie przez głoskę' : 'słowo na początku wydechu, potem dalej „fff”' });
      }
      var ins;
      Timer(body, { phases: phases, gap: 3, breathTones: true, wakeLock: true, startIndex: Math.min(d.reps.oddech || 0, 11),
        above: h('div', { class: 'words' }, h('b', { text: 'Słowa dnia: ' }), words.map(function (x) { return x.w; }).join(' · ')),
        onStart: function () { markSeen('oddech'); if (ins) ins.collapse(); },
        onRep: function (i) { d.reps.oddech = i; save(); },
        onReset: function () { d.reps.oddech = 0; save(); },
        onDone: function () { save(); renderOrRebuild(k, 'oddech'); } });
      body.appendChild(h('p', { class: 'note', text: 'Licznik rośnie sam. Dźwięk rosnący = wdech, opadający = wydech. Wyłącz tryb cichy w iPhonie, inaczej nie usłyszysz sygnałów.' }));
      ins = fullInstructions(body, 'oddech', hasHard ? INS.oddech.jakHard : null);
    },

    sygnal: function (body, k, d, done) {
      if (done) { body.appendChild(h('p', { class: 'note', text: 'Starty: ' + (d.reps.sygnal || 0) + '/' + SIGNAL_N + '.' })); return; }
      body.appendChild(briefBlock('sygnal'));
      var ins;
      SignalDrill(body, { questions: signalQuestions(k, SIGNAL_N), startIndex: Math.min(d.reps.sygnal || 0, SIGNAL_N - 1),
        onStart: function () { markSeen('sygnal'); if (ins) ins.collapse(); },
        onRep: function (i) { d.reps.sygnal = i; save(); },
        onReset: function () { d.reps.sygnal = 0; save(); },
        onDone: function () { markDone(k, 'sygnal'); } });
      body.appendChild(h('p', { class: 'note', text: 'Trzymaj telefon przed sobą, dźwięk włączony. Pytanie pojawia się razem z sygnałem – nie wiesz wcześniej, kiedy. Wyłącz tryb cichy, inaczej nie usłyszysz sygnału.' }));
      ins = fullInstructions(body, 'sygnal');
    },

    monolog: function (body, k, d, done) {
      var m = d.monolog, changed = false;
      if (m.topic == null || !TOPICS[m.topic]) { m.topic = Math.floor(Math.random() * TOPICS.length); changed = true; }
      if (!m.lang) { m.lang = dayIndex(k) % 2 === 1 ? 'pl' : 'en'; changed = true; }
      var lockLang = !d.baseline && !done && !m.ran && hasExtra(k) && extraStarted(d); // v5: ★ wystartowała, monolog jeszcze nie → język przeciwny do ★
      if (lockLang) { var wantL = d.extra.lang === 'pl' ? 'en' : 'pl'; if (m.lang !== wantL) { m.lang = wantL; changed = true; } }
      if (changed) save();
      if (d.baseline) { body.appendChild(briefBlock('monolog')); body.appendChild(h('p', { class: 'note', text: 'Dzień 1: monolog PL i EN nagrane jako baza (oddech po frazach: ' + (m.breath || '–') + ', bloki ' + m.blocks + ').' })); fullInstructions(body, 'monolog'); return; }
      if (done) { body.appendChild(h('p', { class: 'note', text: 'Oddech po frazach: ' + (m.breath || '–') + ' · SR ' + (m.sr != null ? m.sr : '–') + '.' })); return; }
      body.appendChild(briefBlock('monolog'));
      function cueFor() { return m.lang === 'en' ? 'Mów po angielsku' : 'Mów po polsku'; }
      if (!m.ran) {
        var phase = { secs: 120, cue: cueFor(), sub: 'frazy 3–5 słów, oddech po każdej' };
        var timer, ins;
        var tcm = TopicCard(body, m, function () { save(); phase.cue = cueFor(); if (timer) timer.redraw(); if (extraHook) extraHook(); }, { avoid: function () { return [d.extra.topic]; }, langNote: lockLang ? monoLangNote(m.lang, d.extra.lang) : null });
        monoHook = function () {
          if (m.ran || !extraStarted(d)) return;
          m.lang = d.extra.lang === 'pl' ? 'en' : 'pl'; save(); phase.cue = cueFor();
          tcm.lock(monoLangNote(m.lang, d.extra.lang)); tcm.redraw(); if (timer) timer.redraw();
        };
        timer = Timer(body, { phases: [phase], gap: 0, startLabel: 'Start 2:00',
          onStart: function () { markSeen('monolog'); if (ins) ins.collapse(); },
          onDone: function () { m.ran = true; save(); renderOrRebuild(k, 'monolog'); } });
        body.appendChild(h('div', { class: 'row' }, h('button', { class: 'plain', type: 'button', text: 'Już mówiłem – przejdź do pytań', onclick: function () { m.ran = true; markSeen('monolog'); save(); renderDzis(); } })));
        ins = fullInstructions(body, 'monolog');
        return;
      }
      body.appendChild(h('h3', { text: 'Po monologu' }));
      body.appendChild(h('div', { class: 'srlabel', text: 'Oddech po frazach?' }));
      var opts = ['tak', 'częściowo', 'nie'], chips = h('div', { class: 'chips3', role: 'group', 'aria-label': 'Oddech po frazach' });
      opts.forEach(function (o) {
        chips.appendChild(h('button', { type: 'button', text: o, class: m.breath === o ? 'on' : '', 'aria-pressed': m.breath === o ? 'true' : 'false', onclick: function () {
          m.breath = o; save(); Array.prototype.forEach.call(chips.children, function (c) { var on = c.textContent === o; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on ? 'true' : 'false'); }); check();
        } }));
      });
      body.appendChild(chips);
      body.appendChild(h('div', { class: 'srlabel', text: 'SR tego monologu' }));
      SRPicker(body, m.sr, function (v) { m.sr = v; save(); check(); }, { label: 'SR monologu' });
      body.appendChild(h('div', { class: 'row' }, h('button', { class: 'ghost', type: 'button', text: 'Jeszcze raz, inny temat', onclick: function () { m.ran = false; m.breath = null; m.sr = null; m.topic = null; save(); renderDzis(); } })));
      function check() { if (m.breath && m.sr != null && !isDone(k, 'monolog')) markDone(k, 'monolog'); }
    },

    napiecie: function (body, k, d, done) {
      var tally = h('div', { class: 'tally' });
      TENSION.forEach(function (t) {
        var cnt = h('b', { text: String(d.tension[t[0]] || 0) });
        tally.appendChild(h('button', { type: 'button', onclick: function () { d.tension[t[0]] = (d.tension[t[0]] || 0) + 1; cnt.textContent = d.tension[t[0]]; save(); } }, t[1], cnt));
      });
      if (done) { body.appendChild(h('div', { class: 'srlabel', text: 'Gdzie trzymało (możesz dopisać)' })); body.appendChild(tally); return; }
      body.appendChild(briefBlock('napiecie'));
      var ins;
      Timer(body, { phases: [{ secs: 120, cue: 'Czytaj na głos', sub: 'w bloku: zostań, poczuj, stuknij' }], gap: 0, startLabel: 'Start 2:00',
        onStart: function () { markSeen('napiecie'); if (ins) ins.collapse(); },
        onDone: function () { markDone(k, 'napiecie'); } });
      body.appendChild(h('div', { class: 'srlabel', text: 'Gdzie trzymało?' }));
      body.appendChild(tally);
      ins = fullInstructions(body, 'napiecie');
    },

    miekki: function (body, k, d, done) {
      if (done) { body.appendChild(h('p', { class: 'note', text: 'Słowa: ' + (d.reps.miekki || 0) + '/' + B_WORDS.length + '.' })); return; }
      body.appendChild(briefBlock('miekki'));
      var phases = B_WORDS.map(function (wd, i) { return { secs: 5, cue: wd, sub: 'słowo ' + (i + 1) + '/' + B_WORDS.length }; });
      var ins;
      Timer(body, { phases: phases, gap: 0, startIndex: Math.min(d.reps.miekki || 0, B_WORDS.length - 1),
        onStart: function () { markSeen('miekki'); if (ins) ins.collapse(); },
        onRep: function (i) { d.reps.miekki = i; save(); },
        onReset: function () { d.reps.miekki = 0; save(); },
        onDone: function () { markDone(k, 'miekki'); } });
      ins = fullInstructions(body, 'miekki');
    },

    dziennik: function (body, k, d, done) {
      if (d.baseline) { // dzień 1 (baza): tekst z importu, tylko do odczytu
        var ro = h('textarea', { readonly: 'readonly', 'aria-label': 'Wpis do dziennika bloków (dzień 1)' }); ro.value = d.diary || '';
        body.appendChild(h('p', { class: 'note', text: 'Dzień 1 (baza): wpis z nagrań bazowych.' })); body.appendChild(ro);
        return;
      }
      // v5 (#20): wpis z dotknięć. „nie” = gotowe; „tak” + start / język / tempo = gotowe. Notatka opcjonalna (tu też stary tekst v3/v4).
      body.appendChild(briefBlock('dziennik'));
      var b = d.blok, groups = {}, saved = h('div', { class: 'saved' });
      function group(field, label, opts, vals) {
        var btns = opts.map(function (o, i) {
          return h('button', { type: 'button', text: o,
            onmousedown: function (e) { e.preventDefault(); }, // nie zabiera fokusu notatce (klawiatura zostaje, pole nie skacze)
            onclick: function (e) { set(field, vals[i], e.currentTarget); } });
        });
        groups[field] = { btns: btns, vals: vals };
        return h('div', { class: 'bgroup' }, h('div', { class: 'srlabel', text: label }), h('div', { class: 'chips3', role: 'group', 'aria-label': label }, btns));
      }
      var ta = h('textarea', { 'aria-label': 'Co robiłeś? (opcjonalnie)', placeholder: 'np. rozmowa z kolegą o nartach', oninput: function () {
        d.diary = ta.value; save(); saved.textContent = 'Zapisano';
        if (isDone(k, 'dziennik') && cards.dziennik) keepFieldInPlace(function () { cards.dziennik.querySelector('small').textContent = 'Zrobione' + doneSummary(k, 'dziennik'); }); // wpis v3/v4: podsumowanie z tekstu
      } });
      ta.value = d.diary || '';
      var noteEl = h('label', { class: 'f' }, 'Co robiłeś? (opcjonalnie)', ta);
      var details = h('div', { class: 'bdetails' },
        group('start', 'Start', ['ja', 'ktoś'], ['ja', 'ktoś']),
        group('jezyk', 'Język', ['PL', 'EN'], ['PL', 'EN']),
        group('tempo', 'Tempo', ['wolno', 'szybko'], ['wolno', 'szybko']));
      var counts = h('p', { class: 'note bcount' });
      body.appendChild(group('jest', 'Dziś był wyraźny blok?', ['tak', 'nie'], [true, false]));
      body.appendChild(details); body.appendChild(noteEl); body.appendChild(saved); body.appendChild(counts);
      fullInstructions(body, 'dziennik');
      function complete() { return b.jest === false || (b.jest === true && !!b.start && !!b.jezyk && !!b.tempo); }
      function paint() {
        Object.keys(groups).forEach(function (f) { var g = groups[f]; g.btns.forEach(function (bt, i) { var on = b[f] === g.vals[i]; bt.classList.toggle('on', on); bt.setAttribute('aria-pressed', on ? 'true' : 'false'); }); });
        details.classList.toggle('hidden', b.jest !== true);
        noteEl.classList.toggle('hidden', b.jest !== true && !(d.diary || '').trim());
        counts.classList.toggle('hidden', !isDone(k, 'dziennik'));
        counts.textContent = diaryStatsLine();
      }
      function set(field, v, btn) {
        var was = isDone(k, 'dziennik'), wasTaps = complete(); // wpis v3/v4 (sam tekst) nie traci zaliczenia przy niepełnych wyborach
        keepFieldInPlace(function () { b[field] = v; save(); saved.textContent = 'Zapisano'; paint(); }, btn);
        if (complete() && !was) {
          markSeen('dziennik');
          var last = exercisesFor(k).every(function (e) { return e === 'dziennik' || isDone(k, e); });
          if (last && b.jest === true && !(d.diary || '').trim()) holdReturn = k; // czas na opcjonalną notatkę: baner z „Na mapę”
          markDoneInPlace(k, 'dziennik', btn);
        }
        else if (!complete() && was && wasTaps) unmarkInPlace(k, 'dziennik', btn);
        else if (was && cards.dziennik) keepFieldInPlace(function () { cards.dziennik.querySelector('small').textContent = 'Zrobione' + doneSummary(k, 'dziennik'); }, btn);
        paint();
      }
      paint();
    },

    sr: function (body, k, d) {
      var insId = d.baseline ? 'srDzien' : 'sr';
      body.appendChild(briefBlock(insId));
      body.appendChild(h('div', { class: 'srlabel', text: 'Typowe' }));
      var kk = srKey();
      SRPicker(body, d.sr.typ, function (v) { d.sr.typ = v; save(); kk._mark([d.sr.typ, d.sr.max]); check(); }, { label: 'SR typowe', key: false });
      body.appendChild(h('div', { class: 'srlabel', text: 'Najgorsze' }));
      SRPicker(body, d.sr.max, function (v) { d.sr.max = v; save(); kk._mark([d.sr.typ, d.sr.max]); check(); }, { label: 'SR najgorsze', key: false });
      body.appendChild(kk); kk._mark([d.sr.typ, d.sr.max]);
      if (d.baseline) body.appendChild(h('p', { class: 'note', text: 'Dzień 1: wyliczone z nagrań bazowych (średnia i maksimum SR).' }));
      fullInstructions(body, insId);
      function check() {
        if (d.sr.typ != null && d.sr.max != null && !isDone(k, 'sr')) { markSeen('sr'); markDone(k, 'sr'); }
        else if (isDone(k, 'sr')) { var c = cards.sr; if (c) c.querySelector('small').textContent = 'Zrobione' + doneSummary(k, 'sr'); toast('Zapisano'); }
      }
    },

    field: function (body, k, d) {
      // B14: fakt tak/nie; zmiana odpowiedzi w każdej chwili, bez wpływu na zaliczenie dnia i powrót na mapę.
      // Odpowiedź zmienia kartę w miejscu: przycisk nie przesuwa się, instrukcja zwija się dopiero przy następnym otwarciu.
      var id = fieldId(k), t = INS[id], msg = h('div', { class: 'enc' });
      var btns = [['tak', 'Użyłem techniki'], ['nie', 'Dziś nie']].map(function (o) {
        return h('button', { type: 'button', text: o[1], onclick: function () { d.field = o[0]; markSeen(id); save(); toast('Zapisano'); recent.field = true; paint(); } });
      });
      function paint() {
        btns.forEach(function (b, i) { var on = d.field === ['tak', 'nie'][i]; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        msg.textContent = d.field === 'tak' ? t.tak : t.nieMsg; msg.classList.toggle('hidden', !(recent.field && d.field));
        var c = cards.field; if (c && d.field) { c.classList.add('done'); c.querySelector('.mark').textContent = '✓'; c.querySelector('small').textContent = 'Zapisane' + doneSummary(k, 'field'); }
      }
      body.appendChild(briefBlock(id));
      body.appendChild(h('div', { class: 'chips3 fieldq', role: 'group', 'aria-label': 'Zadanie w terenie' }, btns));
      body.appendChild(msg);
      fullInstructions(body, id);
      paint();
    },

    extra: function (body, k, d, done) {
      // v5 (#21): ★ monolog w drugim języku – jak Luźny monolog, ale nie wlicza się do dnia (poza done / exercisesFor / streakiem).
      var x = d.extra, m = d.monolog, changed = false;
      if (!x.ran && !done) { var L0 = extraLang(k); if (x.lang !== L0) { x.lang = L0; changed = true; } }
      else if (!x.lang) { x.lang = extraLang(k); changed = true; }
      if (x.topic == null || !TOPICS[x.topic] || (!x.ran && !done && x.topic === m.topic)) { x.topic = randomTopic([m.topic]); changed = true; }
      if (changed) save();
      if (done) { body.appendChild(h('p', { class: 'note', text: 'Język: ' + x.lang.toUpperCase() + ' · oddech po frazach: ' + (x.breath || '–') + ' · SR ' + (x.sr != null ? x.sr : '–') + '.' })); return; }
      body.appendChild(briefBlock('extra'));
      function cueFor() { return x.lang === 'en' ? 'Mów po angielsku' : 'Mów po polsku'; }
      if (!x.ran) {
        var phase = { secs: 120, cue: cueFor(), sub: 'frazy 3–5 słów, oddech po każdej' };
        var timer, ins, started = false;
        var tc = TopicCard(body, x, function () { save(); }, { fixedLang: true, avoid: function () { return [d.monolog.topic]; } });
        timer = Timer(body, { phases: [phase], gap: 0, startLabel: 'Start 2:00',
          onStart: function () { started = true; markSeen('extra'); if (ins) ins.collapse(); },
          onReset: function () { started = false; },
          onDone: function () { x.ran = true; save(); rebuildCard(k, 'extra'); if (monoHook) monoHook(); } });
        extraHook = function () { // G2: język ★ = przeciwny do dzisiejszego monologu, dopóki ★ nie wystartowała
          if (started || x.ran) return; var L = extraLang(k); if (x.lang === L) return;
          x.lang = L; save(); phase.cue = cueFor(); tc.redraw(); timer.redraw();
          if (cards.extra) cards.extra.querySelector('small').textContent = EX_META.extra.sub + ' · ' + EX_META.extra.mins;
        };
        body.appendChild(h('div', { class: 'row' }, h('button', { class: 'plain', type: 'button', text: 'Już mówiłem – przejdź do pytań', onclick: function () { timer.stop(); x.ran = true; markSeen('extra'); save(); rebuildCard(k, 'extra'); if (monoHook) monoHook(); } })));
        ins = fullInstructions(body, 'extra');
        return;
      }
      body.appendChild(h('h3', { text: 'Po monologu' }));
      body.appendChild(h('div', { class: 'srlabel', text: 'Oddech po frazach?' }));
      var chips = h('div', { class: 'chips3', role: 'group', 'aria-label': 'Oddech po frazach' });
      TRI.forEach(function (o) {
        chips.appendChild(h('button', { type: 'button', text: o, class: x.breath === o ? 'on' : '', 'aria-pressed': x.breath === o ? 'true' : 'false', onclick: function () {
          x.breath = o; save(); Array.prototype.forEach.call(chips.children, function (c) { var on = c.textContent === o; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on ? 'true' : 'false'); }); check();
        } }));
      });
      body.appendChild(chips);
      body.appendChild(h('div', { class: 'srlabel', text: 'SR tego monologu' }));
      SRPicker(body, x.sr, function (v) { x.sr = v; save(); check(); }, { label: 'SR monologu ★' });
      body.appendChild(h('div', { class: 'row' }, h('button', { class: 'ghost', type: 'button', text: 'Jeszcze raz, inny temat', onclick: function () { x.ran = false; x.breath = null; x.sr = null; x.topic = null; save(); rebuildCard(k, 'extra'); } })));
      function check() {
        if (!x.breath || x.sr == null || x.done) return;
        x.done = true; save(); recent.extra = true; expanded.extra = true; rebuildCard(k, 'extra');
        if (allListedDone(k)) scheduleReturn(k); // ★ po zaliczonym dniu: powrót na mapę jak w v4 (B25)
      }
    }
  };

  /* ---------- liczniki v5 (tylko odczyt ze state.days, nic nie zapisują) ---------- */
  function blokEntry(d) {
    // #20: wpis dnia – {jest, start, jezyk, tempo} albo null. Wpis v3/v4 (sam tekst) = z blokiem, fakty odczytane z fragmentów chipów v4.
    if (!d || d.baseline) return null;
    var b = d.blok || {};
    if (b.jest === false) return { jest: false };
    if (b.jest === true) return b.start && b.jezyk && b.tempo ? { jest: true, start: b.start, jezyk: b.jezyk, tempo: b.tempo } : null;
    var t = (d.diary || '').trim(); if (!t) return null;
    return { jest: true, start: /start:\s*ktoś/.test(t) ? 'ktoś' : /start:\s*ja(?![a-ząćęłńóśźż])/i.test(t) ? 'ja' : null,
      jezyk: /\bEN\b/.test(t) ? 'EN' : /\bPL\b/.test(t) ? 'PL' : null, tempo: /szybko/.test(t) ? 'szybko' : /wolno/.test(t) ? 'wolno' : null };
  }
  function diaryStatsLine() {
    var t = todayKey(), N = 0, B = 0, x = 0, y = 0, z = 0;
    for (var i = 13; i >= 0; i--) {
      var k = addDays(t, -i); if (dayIndex(k) < 2) continue;
      var e = blokEntry(peekDay(k)); if (!e) continue;
      N++; if (!e.jest) continue; B++;
      if (e.start === 'ktoś') x++; if (e.tempo === 'szybko') y++; if (e.jezyk === 'EN') z++;
    }
    return 'Wpisy: ' + N + ' · z blokiem: ' + B + ' · start ktoś: ' + x + '/' + B + ' · szybko: ' + y + '/' + B + ' · EN: ' + z + '/' + B;
  }
  function fieldLine() { // B14: liczone tylko dni ≥ 8
    var t = todayKey(), y = 0, n = 0;
    for (var i = 6; i >= 0; i--) { var k = addDays(t, -i), d = peekDay(k); if (dayIndex(k) < 8 || !d) continue; if (d.field === 'tak') y++; else if (d.field === 'nie') n++; }
    return 'Zadania w terenie (ostatnie 7 dni): użyłem ' + y + ' · dziś nie ' + n;
  }
  function bellyLine() {
    var t = todayKey(), c = { tak: 0, 'częściowo': 0, nie: 0 };
    for (var i = 6; i >= 0; i--) { var d = peekDay(addDays(t, -i)); if (d && d.oddechBrzuch && c[d.oddechBrzuch] != null) c[d.oddechBrzuch]++; }
    return 'Brzuch miękki (ostatnie 7 dni): tak ' + c.tak + ' · częściowo ' + c['częściowo'] + ' · nie ' + c.nie;
  }
  function extraDays() { return Object.keys(state.days).filter(function (k) { return dayIndex(k) >= 1 && extraDone(k); }).length; }

  /* ---------- streak ---------- */
  function streak() {
    var k = todayKey(), n = 0;
    if (!isDayDone(k)) k = addDays(k, -1);
    while (dayIndex(k) >= 1 && isDayDone(k)) { n++; k = addDays(k, -1); }
    return n;
  }

  /* ---------- screen: Oceń nagranie ---------- */
  var sample = null, sampleChecked = false, probing = false;
  var MSG_PROBING = 'Sprawdzam, czy ocena przez Claude jest dostępna…', MSG_UNAVAIL = 'Ocena przez Claude niedostępna – użyj „Kopiuj prompt”.';
  var FILL_PL = ['yyy', 'yy', 'eee', 'ee', 'eh', 'ehm', 'hmm', 'mmm', 'no', 'właśnie', 'jakby', 'um', 'uh', 'er'];
  var FILL_EN = ['um', 'uh', 'er', 'erm', 'hmm', 'mmm', 'like', 'yyy', 'eee', 'ah'];
  var PUNCT_EDGE = /^[\s.,;:!?…"'„”“‘’()\[\]\-–—]+|[\s.,;:!?…"„”“‘’()\[\]\-–—]+$/g;
  function tokenize(t) { return t.toLowerCase().split(/\s+/).map(function (w) { return w.replace(PUNCT_EDGE, ''); }).filter(Boolean); }
  function metrics(text, lang, secs) {
    var toks = tokenize(text), words = toks.length;
    var fill = lang === 'en' ? FILL_EN : FILL_PL;
    var fillers = toks.filter(function (w) { return fill.indexOf(w) >= 0; }).length;
    var reps = 0;
    for (var i = 0; i < toks.length;) {
      var hit = 0;
      for (var n = 3; n >= 1; n--) {
        if (i + 2 * n <= toks.length) { var ok = true; for (var j = 0; j < n; j++) if (toks[i + j] !== toks[i + n + j]) { ok = false; break; } if (ok) { hit = n; break; } }
      }
      if (hit) { reps++; i += hit; } else i++;
    }
    var restarts = (text.match(/\.\.\.|…/g) || []).length;
    restarts += (text.match(/\bI mean\b/gi) || []).length + (text.match(/\bznaczy\b/gi) || []).length;
    var sents = text.split(/[.!?]+\s+/).map(tokenize).filter(function (s) { return s.length >= 2; });
    for (var s = 1; s < sents.length; s++) if (sents[s][0] === sents[s - 1][0] && sents[s][1] === sents[s - 1][1]) restarts++;
    var wpm = secs > 0 ? Math.round(words / (secs / 60)) : 0;
    return { words: words, wpm: wpm, fillers: fillers, reps: reps, restarts: restarts };
  }
  function buildPrompt(text, lang, dur, note, m, sr) {
    var L = lang === 'en' ? 'angielski' : 'polski';
    var noteClean = String(note || '').replace(/\s+/g, ' ').trim().slice(0, 120);
    return 'Jesteś trenerem płynności mowy i języka. Oceń transkrypt nagrania (czas ' + dur + ', język: ' + L + (noteClean ? ', temat: „' + noteClean + '”' : '') + '). ' +
      'Mówca: dorosły, jąka się (bloki – zatrzymanie oddechu, napięcie); trenuje oddech bez stopu, frazowanie 3–5 słów i miękki start. Nie masz pamięci wcześniejszych nagrań – oceniasz tylko ten tekst.\n\n' +
      'Metryki policzone lokalnie: słowa ' + m.words + ', tempo ' + m.wpm + ' słów/min, wypełniacze ' + m.fillers + ', powtórzenia bezpośrednie ' + m.reps + ', restarty ' + m.restarts +
      (sr != null ? ', własna ocena mówcy SR ' + sr + '/8 (' + SR_MEANING[sr] + ')' : '') + '.\n\n' +
      'Transkrypt:\n"""\n' + text.trim() + '\n"""\n\n' +
      'Odpowiedz po polsku, maksymalnie ok. 250 słów, w 4 sekcjach z dokładnie takimi nagłówkami:\n' +
      '**Płynność** – restarty, powtórzenia, wypełniacze, frazowanie, tempo; 3–5 zdań, konkretnie, z krótkimi cytatami.\n' +
      (lang === 'en'
        ? '**Angielski** – tabela „powiedziałeś → lepiej” (maks. 6 wierszy, format markdown) oraz 3 zwroty do zapamiętania.\n'
        : '**Angielski** – pomiń, nagranie jest po polsku; zamiast tego pod tym nagłówkiem napisz 2–3 zdania o stylu i precyzji wypowiedzi.\n') +
      '**Treść i samorozwój** – co mówca ujawnia o sobie, jeden słaby punkt w sposobie formułowania myśli, jedno pytanie do przemyślenia; ciepło, bez tonu terapeutycznego.\n' +
      '**Zadanie na jutro** – jedno zdanie.\n' +
      'Bez wstępu i podsumowania.';
  }
  function renderMd(el, text) {
    clear(el); el.classList.add('md');
    var lines = text.split('\n'), i = 0;
    function inline(s) {
      var frag = document.createDocumentFragment(), re = /\*\*(.+?)\*\*/g, last = 0, mm;
      while ((mm = re.exec(s))) { frag.appendChild(document.createTextNode(s.slice(last, mm.index))); frag.appendChild(h('strong', { text: mm[1] })); last = re.lastIndex; }
      frag.appendChild(document.createTextNode(s.slice(last)));
      return frag;
    }
    while (i < lines.length) {
      var ln = lines[i].trim();
      if (!ln) { i++; continue; }
      var hm = ln.match(/^(?:#+\s*)?\*\*(.+?)\*\*:?\s*(.*)$/);
      if (hm && !/^\|/.test(ln)) { el.appendChild(h('h4', { text: hm[1] })); if (hm[2]) el.appendChild(h('p', {}, inline(hm[2]))); i++; continue; }
      if (/^\|/.test(ln)) {
        var tbl = h('table'), body = h('tbody'), rowN = 0;
        var isSep = function (ln2) { return /^\|/.test(ln2) && ln2.replace(/^\||\|$/g, '').split('|').every(function (c) { return /^\s*:?-+:?\s*$/.test(c); }); };
        var hasHeader = i + 1 < lines.length && isSep(lines[i + 1].trim());
        while (i < lines.length && /^\|/.test(lines[i].trim())) {
          var ln2 = lines[i].trim();
          if (!isSep(ln2)) {
            var cells = ln2.replace(/^\||\|$/g, '').split('|').map(function (c) { return c.trim(); });
            var tag = hasHeader && rowN === 0 ? 'th' : 'td';
            var tr = h('tr', {}, cells.map(function (c) { return h(tag, {}, inline(c)); }));
            if (tag === 'th') tbl.appendChild(h('thead', {}, tr)); else body.appendChild(tr);
            rowN++;
          }
          i++;
        }
        tbl.appendChild(body); el.appendChild(tbl); continue;
      }
      if (/^[-*•]\s+/.test(ln) || /^\d+[.)]\s+/.test(ln)) {
        var ul = h('ul');
        while (i < lines.length && (/^[-*•]\s+/.test(lines[i].trim()) || /^\d+[.)]\s+/.test(lines[i].trim()))) { ul.appendChild(h('li', {}, inline(lines[i].trim().replace(/^([-*•]|\d+[.)])\s+/, '')))); i++; }
        el.appendChild(ul); continue;
      }
      el.appendChild(h('p', {}, inline(ln))); i++;
    }
  }
  function copyText(txt, statusEl, host) {
    function fallback() {
      clear(host);
      var ta = h('textarea', { readonly: 'readonly', 'aria-label': 'Tekst do skopiowania' }); ta.value = txt;
      host.appendChild(h('div', { class: 'fallback' }, h('p', { class: 'note', text: 'Zaznacz i skopiuj ręcznie:' }), ta));
      try { ta.focus(); ta.select(); } catch (e) { /* ignore */ }
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { statusEl.textContent = 'Skopiowane.'; clear(host); }, fallback);
      else fallback();
    } catch (e) { fallback(); }
  }
  var ocena = null; // built once; {refresh()}
  function renderOcena() {
    if (ocena) { ocena.refresh(); probeSample(); return; }
    var root = document.getElementById('s-ocena');
    var draft = state.ocenaDraft;
    root.appendChild(h('header', { class: 'top' }, h('h1', { text: 'Oceń nagranie' }), h('p', { text: 'Wklej transkrypt z dyktafonu. Metryki liczą się od razu.' })));
    var ta = h('textarea', { 'aria-label': 'Transkrypt', placeholder: 'Wklej transkrypt…', style: 'min-height:140px', oninput: function () { draft.text = ta.value; onEdit(); } });
    var lang = h('select', { 'aria-label': 'Język nagrania' }, h('option', { value: 'pl', text: 'polski' }), h('option', { value: 'en', text: 'angielski' }));
    lang.addEventListener('change', function () { draft.lang = lang.value; onEdit(); });
    var dur = h('input', { type: 'text', inputmode: 'numeric', placeholder: 'mm:ss, np. 2:05', 'aria-label': 'Czas trwania', oninput: function () { draft.dur = dur.value; onEdit(); } });
    var note = h('input', { type: 'text', placeholder: 'np. daily, rozmowa o nartach', 'aria-label': 'O czym', oninput: function () { draft.note = note.value; onEdit(); } });
    ta.value = draft.text || ''; lang.value = draft.lang === 'en' ? 'en' : 'pl'; dur.value = draft.dur || ''; note.value = draft.note || '';
    var met = h('div', { class: 'metrics' });
    var srHost = h('div');
    var srPicker = SRPicker(srHost, draft.sr, function (v) { draft.sr = v; onEdit(); }, { label: 'SR nagrania' });
    var btnAI = h('button', { class: 'big hidden', type: 'button', text: 'Oceń z Claude', onclick: evaluate });
    var aiRow = h('div', { class: 'row hidden' }, btnAI);
    function showAI(on) { aiRow.classList.toggle('hidden', !on); btnAI.classList.toggle('hidden', !on); }
    var btnCopy = h('button', { class: 'ghost', type: 'button', text: 'Kopiuj prompt', onclick: function () { if (!valid()) return; copyText(buildPrompt(ta.value, lang.value, dur.value || '?', note.value, current(), draft.sr), status, host); } });
    var btnSave = h('button', { class: 'plain', type: 'button', text: 'Zapisz metryki', onclick: function () { if (!valid()) return; if (savedSig === sig()) { status.textContent = 'To nagranie jest już w historii.'; return; } saveAssessment(resultEl.dataset.text || ''); status.textContent = 'Zapisane w historii.'; } });
    var status = h('div', { class: 'status' }), host = h('div'), resultEl = h('div', { class: 'result' });
    var savedSig = null;
    root.appendChild(h('div', { class: 'card' },
      h('label', { class: 'f' }, 'Transkrypt', ta),
      h('div', { class: 'grid2' }, h('label', { class: 'f' }, 'Język', lang), h('label', { class: 'f' }, 'Czas trwania', dur)),
      h('label', { class: 'f' }, 'O czym (opcjonalnie)', note),
      met,
      h('div', { class: 'srlabel', text: 'Twoja ocena SR tego nagrania' }), srHost,
      aiRow, h('div', { class: 'row' }, btnCopy, btnSave), status, host, resultEl));
    var list = h('div', { class: 'alist' });
    root.appendChild(h('div', { class: 'card' }, h('h2', { text: 'Ostatnie oceny' }), list));
    if (draft.lastAnswer) { renderMd(resultEl, draft.lastAnswer); resultEl.dataset.text = draft.lastAnswer; }

    function parseDur(v) { var m = String(v).trim().match(/^(\d+):(\d{1,2})$/); if (m) return +m[1] * 60 + +m[2]; var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }
    function current() { return metrics(ta.value, lang.value, parseDur(dur.value)); }
    function sig() { return ta.value.trim() + '|' + lang.value + '|' + dur.value; }
    function valid() { if (!ta.value.trim()) { status.textContent = 'Najpierw wklej transkrypt.'; status.className = 'status err'; return false; } status.className = 'status'; return true; }
    function onEdit() { save(); update(); }
    function update() {
      var m = current(); clear(met);
      [['słowa', m.words], ['słów/min', m.wpm || '–'], ['wypełn.', m.fillers], ['powtórz.', m.reps], ['restarty', m.restarts]].forEach(function (x) { met.appendChild(h('div', {}, h('b', { text: String(x[1]) }), h('span', { text: x[0] }))); });
    }
    function saveAssessment(resultText) {
      var m = current();
      state.assessments.unshift({ date: new Date().toISOString(), lang: lang.value, dur: dur.value, note: note.value, sr: draft.sr == null ? null : draft.sr, metrics: m, excerpt: ta.value.trim().slice(0, 160), result: resultText });
      state.assessments = state.assessments.slice(0, 20); savedSig = sig(); save(); drawList();
    }
    function evaluate() {
      if (!valid() || !sample) return;
      btnAI.disabled = true; status.className = 'status'; status.textContent = 'Claude ocenia…';
      resultEl.className = 'result'; resultEl.textContent = ''; delete resultEl.dataset.text; draft.lastAnswer = '';
      var prompt = buildPrompt(ta.value, lang.value, dur.value || '?', note.value, current(), draft.sr);
      var p;
      try { p = sample(prompt, { onText: function (ev) { resultEl.textContent = ev && ev.text ? ev.text : ''; }, modelTier: 'default', cache: false }); }
      catch (e) { p = Promise.reject(e); }
      Promise.resolve(p).then(function (r) {
        var text = (r && r.text) || resultEl.textContent || '';
        renderMd(resultEl, text); resultEl.dataset.text = text; draft.lastAnswer = text;
        status.textContent = r && r.truncated ? 'Odpowiedź ucięta (limit długości). Zapisano w historii.' : 'Zapisano w historii.';
        saveAssessment(text); btnAI.disabled = false;
      }, function (err) {
        var code = err && err.code;
        if (code === 'not_granted') { sample = null; showAI(false); status.textContent = MSG_UNAVAIL; }
        else if (code === 'rate_limited') { status.className = 'status err'; status.textContent = 'Limit zapytań – spróbuj za chwilę albo skopiuj prompt.'; btnAI.disabled = false; }
        else { status.className = 'status err'; status.textContent = 'Nie udało się ocenić. Skopiuj prompt i wklej do czatu.'; btnAI.disabled = false; }
      });
    }
    function drawList() {
      clear(list);
      if (!state.assessments.length) { list.appendChild(h('p', { class: 'note', text: 'Jeszcze nic. Pierwsza ocena pojawi się tutaj.' })); return; }
      state.assessments.forEach(function (a) {
        var dt = String(a.date || '').slice(0, 10) || '–', m = a.metrics || {};
        var item = h('div', { class: 'item' },
          h('div', {}, h('strong', { text: dt + ' · ' + (a.lang === 'en' ? 'EN' : 'PL') + (a.dur ? ' · ' + a.dur : '') + (a.sr != null ? ' · SR ' + a.sr : '') }), a.note ? ' · ' + a.note : ''),
          h('div', { class: 'meta', text: (m.words || 0) + ' słów · ' + (m.wpm || '–') + '/min · wypełniacze ' + (m.fillers || 0) + ' · powtórzenia ' + (m.reps || 0) + ' · restarty ' + (m.restarts || 0) }));
        if (a.result) { var det = h('details', {}, h('summary', { text: 'Pokaż ocenę' })); var box = h('div', { class: 'result' }); renderMd(box, a.result); det.appendChild(box); item.appendChild(det); }
        list.appendChild(item);
      });
    }
    function refresh() {
      drawList();
      showAI(!!sample);
      // Status reflects current availability: "Sprawdzam…" only while a probe is in flight, nothing when unavailable.
      var isAvailMsg = status.textContent === MSG_PROBING || status.textContent === MSG_UNAVAIL;
      if (!sample && probing && !status.textContent) status.textContent = MSG_PROBING;
      else if ((sample || !probing) && isAvailMsg) status.textContent = '';
    }
    update(); ocena = { refresh: refresh, setSR: srPicker.set };
    refresh(); probeSample();
  }
  function probeSample() {
    // Probe the "sample" capability; window.claude may attach after the first script run, so re-probe on load and on each visit to Oceń.
    if (sample || sampleChecked || probing) return;
    var hasUse = false;
    try { hasUse = !!(window.claude && typeof window.claude.use === 'function'); } catch (e) { hasUse = false; }
    if (!hasUse) { if (ocena) ocena.refresh(); return; }
    probing = true; if (ocena) ocena.refresh();
    var done = function (s) {
      probing = false; sampleChecked = true; sample = typeof s === 'function' ? s : null;
      if (ocena) ocena.refresh();
    };
    var timeout = new Promise(function (res) { setTimeout(function () { res(null); }, 10000); });
    try { Promise.race([Promise.resolve(window.claude.use('sample')), timeout]).then(done, function () { done(null); }); }
    catch (e) { done(null); }
  }

  /* ---------- screen: Postępy ---------- */
  function renderPostepy() {
    var root = document.getElementById('s-postepy'); clear(root);
    root.appendChild(h('header', { class: 'top' }, h('h1', { text: 'Postępy' }), h('p', { text: 'Dzień ' + dayIndex(todayKey()) + ' programu' })));
    var doneKeys = Object.keys(state.days).filter(isDayDone);
    root.appendChild(h('div', { class: 'stat' },
      h('div', {}, h('b', { text: String(streak()) }), h('span', { text: 'streak (dni)' })),
      h('div', {}, h('b', { text: String(doneKeys.length) }), h('span', { text: 'sesji zrobionych' })),
      h('div', {}, h('b', { text: String(state.assessments.length) }), h('span', { text: 'ocen nagrań' }))));

    var days = [], t = todayKey();
    for (var i = 13; i >= 0; i--) { var k = addDays(t, -i); if (dayIndex(k) >= 1) days.push(k); }
    var card = h('div', { class: 'card', style: 'margin-top:12px' }, h('h2', { text: 'SR (ocena raz w tygodniu)' }));
    var srDays = Object.keys(state.days).filter(function (k) { var x = state.days[k].sr; return dayIndex(k) >= 1 && x && (x.typ != null || x.max != null); }).sort().slice(-12);
    card.appendChild(srDays.length ? chart(srDays) : h('p', { class: 'note', text: 'Pierwszy punkt pojawi się po ocenie SR tygodnia.' }));
    card.appendChild(h('div', { class: 'legend' }, h('span', {}, h('i', { style: 'background:var(--accent)' }), 'typowe'), h('span', {}, h('i', { style: 'background:var(--warn)' }), 'najgorsze')));
    var tb = h('tbody');
    days.slice().reverse().forEach(function (k) {
      var d = peekDay(k), sr = d && d.sr ? d.sr : {}, doneN = d && d.done ? exercisesFor(k).filter(function (e) { return d.done.indexOf(e) >= 0; }).length : 0;
      tb.appendChild(h('tr', {}, h('td', { text: 'D' + dayIndex(k) + ' · ' + k.slice(5) }), h('td', { class: 'n', text: sr.typ != null ? sr.typ : '–' }), h('td', { class: 'n', text: sr.max != null ? sr.max : '–' }), h('td', { class: 'n', text: isDayDone(k) ? 'tak' : (doneN ? doneN + '/' + exercisesFor(k).length : '–') })));
    });
    card.appendChild(h('table', {}, h('thead', {}, h('tr', {}, h('th', { text: 'Dzień' }), h('th', { class: 'n', text: 'Typowe' }), h('th', { class: 'n', text: 'Najgorsze' }), h('th', { class: 'n', text: 'Sesja' }))), tb));
    root.appendChild(card);

    // v5: Oddech A – brzuch (#19, B6), ★ (#21, G8), dziennik bloków (#20, J9) – same liczby, bez komentarza
    var ne = extraDays();
    root.appendChild(h('div', { class: 'card' }, h('h2', { text: 'Ćwiczenia' }),
      h('p', { class: 'note', text: bellyLine() }),
      h('p', { class: 'note', text: '★ zrobione: ' + ne + (ne === 1 ? ' dzień' : ' dni') }),
      dayIndex(todayKey()) >= 8 ? h('p', { class: 'note', text: fieldLine() }) : null));
    root.appendChild(h('div', { class: 'card' }, h('h2', { text: 'Dziennik bloków (14 dni)' }), h('p', { class: 'note', text: diaryStatsLine() })));

    var bl = h('div', { class: 'card' }, h('h2', { text: 'Bloki i SR: PL / EN' }));
    var d1 = peekDay(DAY1), b1 = d1 && isObj(d1.base) ? d1.base : null;
    var rows = [];
    function bs(x) { return x ? x.b + ' (SR ' + x.sr + ')' : '–'; }
    if (b1) rows.push(['Baza (D1) – bloki', 'PL czyt. ' + bs(b1.readPL) + ' · PL mon. ' + bs(b1.monPL) + ' · EN ' + bs(b1.monEN) + ' · rozm. ' + bs(b1.conv)]);
    ['pl', 'en'].forEach(function (L) {
      var as = state.assessments.filter(function (a) { return a.lang === L && isObj(a.metrics); });
      if (!as.length) return;
      function avg(f) { return as.reduce(function (acc, a) { return acc + (Number(f(a)) || 0); }, 0) / as.length; }
      var withSR = as.filter(function (a) { return a.sr != null; });
      var srTxt = withSR.length ? ' · SR śr. ' + (withSR.reduce(function (acc, a) { return acc + a.sr; }, 0) / withSR.length).toFixed(1) : '';
      rows.push(['Oceny ' + L.toUpperCase() + ' (' + as.length + ')', 'zacięcia śr. ' + avg(function (a) { return (a.metrics.reps || 0) + (a.metrics.restarts || 0); }).toFixed(1) + ' · wypełniacze śr. ' + avg(function (a) { return a.metrics.fillers; }).toFixed(1) + ' · tempo śr. ' + Math.round(avg(function (a) { return a.metrics.wpm; })) + '/min' + srTxt]);
    });
    if (rows.length <= 1) rows.push(['Z ocen', 'Brak ocen nagrań – pojawią się tu po pierwszej ocenie.']);
    rows.forEach(function (r) { bl.appendChild(h('div', { class: 'hitem' }, h('div', { class: 'hn', text: r[0] }), h('div', { class: 'note', text: r[1] }))); });
    var tsum = {}; Object.keys(state.days).forEach(function (k) { var tn = state.days[k].tension || {}; Object.keys(tn).forEach(function (x) { tsum[x] = (tsum[x] || 0) + (Number(tn[x]) || 0); }); });
    if (Object.keys(tsum).length) bl.appendChild(h('div', { class: 'hitem' }, h('div', { class: 'hn', text: 'Napięcie (suma)' }), h('div', { class: 'note', text: TENSION.map(function (x) { return x[1] + ' ' + (tsum[x[0]] || 0); }).join(' · ') })));
    root.appendChild(bl);

    var hOpen = !!state.hierOpen;
    var hTitle = h('h2', { text: 'Hierarchia sytuacji' }), hSmall = h('small');
    var hBody = h('div', { class: 'cbody' }, h('p', { class: 'note', text: 'Spodziewane SR w każdej sytuacji. Aktualizuj, gdy coś się zmieni.' }), srKey());
    function paintH() { hc.classList.toggle('collapsed', !hOpen); hSmall.textContent = hOpen ? 'ukryj' : 'pokaż'; hHead.setAttribute('aria-expanded', hOpen ? 'true' : 'false'); }
    function toggleH() { hOpen = !hOpen; state.hierOpen = hOpen; save(); paintH(); }
    var hHead = h('div', { class: 'chead', role: 'button', tabindex: '0', onclick: toggleH, onkeydown: function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleH(); } } },
      h('div', { class: 't' }, hTitle, hSmall));
    var hc = h('div', { class: 'card' }, hHead, hBody);
    HIER.forEach(function (name, i) {
      var it = h('div', { class: 'hitem' }, h('div', { class: 'hn', text: (i + 1) + '. ' + name }));
      SRPicker(it, state.hierarchy[i], function (v) { state.hierarchy[i] = v; save(); toast('Zapisano'); }, { label: 'SR: ' + name, key: false });
      hBody.appendChild(it);
    });
    paintH();
    root.appendChild(hc);

    var st = h('div', { class: 'status' }), host = h('div');
    root.appendChild(h('div', { class: 'card' }, h('h2', { text: 'Dane' }), h('p', { class: 'note', text: 'Wszystko zapisuje się w tej przeglądarce. Skopiuj JSON, żeby mieć kopię.' }),
      h('div', { class: 'row' }, h('button', { class: 'ghost', type: 'button', text: 'Kopiuj dane', onclick: function () { saveNow(); copyText(JSON.stringify(state), st, host); } })), st, host));
  }
  function chart(days) {
    var NS = 'http://www.w3.org/2000/svg', W = 360, H = 170, L = 26, R = 8, T = 10, B = 26;
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('class', 'chart'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Wykres SR z ostatnich ocen');
    function el(n, a) { var e = document.createElementNS(NS, n); Object.keys(a).forEach(function (k) { e.setAttribute(k, a[k]); }); return e; }
    function x(i) { return days.length > 1 ? L + i * (W - L - R) / (days.length - 1) : (W + L - R) / 2; }
    function y(v) { return T + (8 - v) * (H - T - B) / 8; }
    for (var g = 0; g <= 8; g += 2) { svg.appendChild(el('line', { x1: L, x2: W - R, y1: y(g), y2: y(g), stroke: '#e5e1d8' })); var tx = el('text', { x: L - 6, y: y(g) + 4, 'text-anchor': 'end', 'font-size': '14', fill: '#6b7280' }); tx.textContent = g; svg.appendChild(tx); }
    days.forEach(function (k, i) { var tx = el('text', { x: x(i), y: H - 8, 'text-anchor': 'middle', 'font-size': '14', fill: '#6b7280' }); tx.textContent = 'D' + dayIndex(k); svg.appendChild(tx); });
    [['typ', '#2f6f5e'], ['max', '#b4551d']].forEach(function (s) {
      var pts = [], segs = [];
      days.forEach(function (k, i) { var d = peekDay(k), v = d && d.sr ? d.sr[s[0]] : null; if (v == null) return; pts.push([x(i), y(v)]); });
      if (pts.length) segs.push(pts);
      segs.forEach(function (sg) {
        if (sg.length > 1) svg.appendChild(el('polyline', { points: sg.map(function (p) { return p[0] + ',' + p[1]; }).join(' '), fill: 'none', stroke: s[1], 'stroke-width': '2.5', 'stroke-linejoin': 'round' }));
        sg.forEach(function (p) { svg.appendChild(el('circle', { cx: p[0], cy: p[1], r: '4', fill: s[1] })); });
      });
    });
    return svg;
  }

  /* ---------- screen: Ściągawka (built once, read-only) ---------- */
  var sciBuilt = false;
  function renderSciagawka() {
    if (sciBuilt) return; sciBuilt = true;
    var root = document.getElementById('s-sciagawka');
    root.appendChild(h('header', { class: 'top' }, h('h1', { text: 'Ściągawka' }), h('p', { text: 'Skala, procedura w bloku, reguły, kontakty.' })));
    var scale = h('div', { class: 'scale' });
    SRPicker(scale, null, null, { label: 'Skala SR', empty: 'Dotknij liczbę, żeby zobaczyć znaczenie.' });
    root.appendChild(h('div', { class: 'card' }, h('h2', { text: 'SR 0–8' }), h('p', { class: 'note', text: 'Severity Rating: jak ciężko było mówić. Jedna skala w całej aplikacji; tu tylko do podglądu.' }), scale));
    root.appendChild(h('div', { class: 'card' }, h('h2', { text: 'W bloku' }), h('ol', { class: 'steps' },
      h('li', { text: 'Stop z pchaniem.' }), h('li', { text: 'Puść brzuch, wypuść powietrze.' }), h('li', { text: 'Cichy głos na samogłosce.' }),
      h('li', { text: 'Przeciągnij i dokończ słowo.' }), h('li', { text: 'Nie wyszło? Anuluj: pauza 2 s, powtórz miękko.' }))));
    root.appendChild(h('div', { class: 'card' }, h('h2', { text: '3 reguły' }), h('ul', { class: 'rules' },
      h('li', { text: 'Powietrze płynie, kontakt lekki.' }), h('li', { text: 'Zmieniasz reakcję na blok, nie liczbę bloków.' }), h('li', { text: 'Transfer od pierwszego dnia.' }))));
    root.appendChild(h('div', { class: 'card' }, h('h2', { text: 'Kontakty' }),
      h('div', { class: 'contact' }, h('div', {}, 'Fundacja FIKS', h('span', { text: 'bezpłatna diagnoza, Camperdown online' })), h('a', { href: 'tel:+48793001160', text: '793 001 160' })),
      h('div', { class: 'contact' }, h('div', {}, 'Karolina Jankiewicz', h('span', { text: 'pierwszy wolny termin online' })), h('a', { href: 'tel:+48509812667', text: '509 812 667' })),
      h('p', { class: 'note', text: 'Zdanie do powiedzenia: „zacinam się przy długich, szybkich, spontanicznych wypowiedziach i po angielsku, głównie gdy muszę zacząć mówić w cudzym momencie; na daily po polsku jestem płynny”.' })));
  }

  /* ---------- tabs / router ---------- */
  var TABS = [
    ['dzis', 'Dziś', 'M4 6h16M4 12h16M4 18h10', function () { checkRollover(false); renderDzis(); }],
    ['ocena', 'Oceń', 'M12 3v10m0 0l-3-3m3 3l3-3M5 14v5h14v-5', renderOcena],
    ['postepy', 'Postępy', 'M4 19h16M6 15l4-5 4 3 4-7', renderPostepy],
    ['sciagawka', 'Ściągawka', 'M6 4h12v16H6zM9 9h6M9 13h6', renderSciagawka]
  ];
  var currentTab = null;
  function showTab(id, fromHashChange) {
    var t = TABS.filter(function (x) { return x[0] === id; })[0] || TABS[0];
    if (currentTab === t[0]) { try { window.scrollTo(0, 0); } catch (e) { /* ignore */ } return; }
    killTimers();
    currentTab = t[0];
    TABS.forEach(function (x) { document.getElementById('s-' + x[0]).classList.toggle('on', x[0] === t[0]); });
    Array.prototype.forEach.call(document.getElementById('tabs').children, function (b) {
      var on = b.dataset.id === t[0]; b.classList.toggle('on', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    t[3]();
    if (!fromHashChange) { try { if (location.hash !== '#' + t[0]) location.hash = t[0]; } catch (e) { /* sandbox */ } }
    try { window.scrollTo(0, 0); } catch (e) { /* ignore */ }
    flushAfterShow();
  }
  var afterShow = null;
  var tabs = document.getElementById('tabs');
  TABS.forEach(function (t) {
    var svg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + t[2] + '"/></svg>';
    tabs.appendChild(h('button', { type: 'button', 'data-id': t[0], html: svg + '<span>' + t[1] + '</span>', onclick: function () { showTab(t[0]); } }));
  });
  function fromHash() { var id = (location.hash || '').replace('#', '') || 'dzis'; if (id === currentTab) return; showTab(id, true); }
  window.addEventListener('hashchange', fromHash);
  // Keyboard: hide the tab bar while an input is focused so it never overlays the field.
  function isField(el) { return !!el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName); }
  document.addEventListener('focusin', function (e) { if (isField(e.target)) { document.body.classList.add('kb'); try { e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (x) { /* ignore */ } } });
  document.addEventListener('focusout', function (e) { if (!isField(e.relatedTarget)) document.body.classList.remove('kb'); });
  window.addEventListener('load', probeSample);
  fromHash();
  probeSample();
})();
