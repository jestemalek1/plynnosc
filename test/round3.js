// Round 3 acceptance tests (weekly SR, SR key, Oddech A 3 s inhale, Start na sygnał, v2 migration, diary focus, errors).
// Logs results to round3_results.json and prints PASS/FAIL per requirement.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const APP = path.resolve(__dirname, '..', 'app', 'index.html');
const URL = 'file://' + APP;
const OUT = __dirname + '/';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const R = {}, V = {};
function log(k, v) { R[k] = v; console.log(k, JSON.stringify(v)); }
function verdict(req, ok, evidence) { (V[req] = V[req] || []).push({ ok: !!ok, evidence }); console.log((ok ? 'PASS ' : 'FAIL ') + req + ': ' + evidence); }
const D = (n) => { const d = new Date(2026, 10, 7, 10, 0, 0); d.setDate(d.getDate() + n - 1); return d; }; // program day n -> Date
const KEY = (n) => { const d = D(n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

const ALL_PAGES = [];
async function ctx(browser, opts = {}) {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: UA, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await c.newPage();
  page.__errors = []; page.__warn = []; ALL_PAGES.push(page);
  page.on('console', m => { if (m.type() === 'error') page.__errors.push(m.text()); else if (m.type() === 'warning') page.__warn.push(m.text()); });
  page.on('pageerror', e => page.__errors.push('PAGEERROR ' + e.message));
  await page.addInitScript(() => {
    window.__beeps = [];
    try { Object.defineProperty(navigator, 'vibrate', { configurable: true, value: (p) => { window.__beeps.push({ t: Date.now(), p }); return true; } }); } catch (e) { /* ignore */ }
  });
  if (opts.init) await page.addInitScript(opts.init);
  if (opts.time) await page.clock.install({ time: opts.time });
  return { c, page };
}
async function openToday(pg) {
  const isl = pg.locator('#s-dzis .island.st-today');
  if (await isl.count()) { await isl.first().click(); await pg.waitForTimeout(50); return true; }
  return false;
}
async function tab(page, id) { await page.click(`#tabs button[data-id="${id}"]`); await page.waitForTimeout(60); }
const flush = async (page) => { await page.clock.runFor(400); await page.waitForTimeout(30); };
const store = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('plynnosc')));
function card(page, title) { return page.locator('#s-dzis .card').filter({ has: page.locator('h2', { hasText: title }) }); }
async function expand(page, title) { const c = card(page, title); if (await c.evaluate(e => e.classList.contains('collapsed'))) await c.locator('.chead').click(); return c; }
// v5 (#20): diary entry from taps; exact button text inside the card (e.g. tap(dz, 'tak', 'ktoś', 'PL'))
async function tap(loc, ...labels) { for (const l of labels) await loc.locator('.chips3 button', { hasText: new RegExp('^' + l + '$') }).click(); }
// v5 (#21): seeds that assert the B25 auto-return mark the optional ★ as done (with ★ pending the banner offers buttons instead, G7)
const EXTRA_DONE = { lang: 'en', topic: 2, ran: true, breath: 'tak', sr: 2, done: true };
const cardTitles = (page) => page.evaluate(() => [...document.querySelectorAll('#s-dzis .card h2')].map(h => h.textContent));
const onMap = (page) => page.evaluate(() => !!document.querySelector('#s-dzis svg.map'));
async function section(name, fn) { try { await fn(); } catch (e) { log(name + '.EXCEPTION', String(e && e.stack || e)); verdict(name, false, 'exception: ' + String(e && e.message || e).split('\n')[0]); } }
// SR key inspection inside a root element
const keyInfo = (loc) => loc.evaluate(root => {
  const keys = [...root.querySelectorAll('.srkey')];
  return { count: keys.length, visible: keys.map(k => k.getBoundingClientRect().height > 0 && getComputedStyle(k).display !== 'none'), rows: keys.map(k => [...k.children].map(s => s.textContent)), on: keys.map(k => [...k.children].filter(s => s.classList.contains('on')).map(s => s.textContent)), chipsOn: [...root.querySelectorAll('.sr .chip.on')].map(b => b.textContent) };
});
const EXPECT_ROWS = ['0brak', '1słuchacz nie zauważa', '2–3lekkie', '4–5umiarkowane', '6–7ciężkie', '8przekaz nie dochodzi'];
const rowsOk = (rows) => rows.length === 6 && rows.every((r, i) => r.startsWith(EXPECT_ROWS[i]));

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  // ===== R1: SR key always visible =====
  await section('R1', async () => {
    const res = {};
    // monolog SR on day 2
    {
      const { c, page } = await ctx(browser, { time: D(2) });
      await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
      const mono = await expand(page, 'Luźny monolog');
      await mono.locator('button', { hasText: 'Już mówiłem – przejdź do pytań' }).click(); await page.waitForTimeout(50);
      const m = card(page, 'Luźny monolog');
      const before = await keyInfo(m);
      await m.locator('.sr .chip').nth(5).click(); await page.waitForTimeout(30);
      const after = await keyInfo(m);
      res.monolog = { before, after };
      verdict('R1', before.count === 1 && before.visible[0] && rowsOk(before.rows[0]) && before.on[0].length === 0 && before.chipsOn.length === 0 && after.on[0].length === 1 && after.on[0][0].startsWith('4–5'),
        'monolog SR: key ' + before.count + ' visible before choice, rows ' + JSON.stringify(before.rows[0]) + '; chip 5 -> on ' + JSON.stringify(after.on[0]));
      res.monologErrors = page.__errors; await c.close();
    }
    // weekly SR card on day 7
    {
      const { c, page } = await ctx(browser, { time: D(7) });
      await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
      const sr = await expand(page, 'SR tygodnia');
      const before = await keyInfo(sr);
      await sr.locator('.sr').nth(0).locator('.chip').nth(3).click(); await page.waitForTimeout(30);
      const afterTyp = await keyInfo(sr);
      await sr.locator('.sr').nth(1).locator('.chip').nth(7).click(); await page.waitForTimeout(30);
      const afterMax = await keyInfo(sr);
      const pickers = await sr.locator('.sr').count();
      res.weekly = { pickers, before, afterTyp, afterMax };
      verdict('R1', pickers === 2 && before.count === 1 && before.visible[0] && rowsOk(before.rows[0]) && before.on[0].length === 0 && afterTyp.on[0].join().startsWith('2–3') && afterMax.on[0].length === 2 && afterMax.on[0][1].startsWith('6–7'), // one key, marks both typ and max
        'weekly SR card: 2 pickers, ' + before.count + ' key visible before choice; typ=3 -> key on ' + JSON.stringify(afterTyp.on[0]) + '; max=7 -> on ' + JSON.stringify(afterMax.on[0]));
      res.weeklyErrors = page.__errors; await c.close();
    }
    // Oceń, Postępy hierarchy, Ściągawka on day 2
    {
      const { c, page } = await ctx(browser, { time: D(2) });
      await page.goto(URL); await page.waitForTimeout(100);
      await tab(page, 'ocena');
      const oc = page.locator('#s-ocena');
      const ob = await keyInfo(oc);
      await oc.locator('.sr .chip').nth(1).click(); await page.waitForTimeout(30);
      const oa = await keyInfo(oc);
      res.ocena = { before: ob, after: oa };
      verdict('R1', ob.count === 1 && ob.visible[0] && rowsOk(ob.rows[0]) && ob.on[0].length === 0 && oa.on[0].length === 1 && oa.on[0][0].startsWith('1'),
        'Oceń: key visible before choice; chip 1 -> on ' + JSON.stringify(oa.on[0]));
      await tab(page, 'postepy');
      const hc = page.locator('#s-postepy .card').filter({ has: page.locator('h2', { hasText: 'Hierarchia' }) });
      await hc.locator('.chead').click(); await page.waitForTimeout(30);
      const hb = await keyInfo(hc);
      await hc.locator('.hitem .sr').nth(0).locator('.chip').nth(6).click(); await page.waitForTimeout(30);
      const ha = await keyInfo(hc);
      const pickers = await hc.locator('.sr').count();
      res.hier = { pickers, before: hb, after: ha };
      verdict('R1', pickers === 10 && hb.count === 1 && hb.visible[0] && rowsOk(hb.rows[0]),
        'Postępy hierarchy: ' + pickers + ' pickers, ' + hb.count + ' key, visible=' + hb.visible[0] + '; preset values shown, key rows on ' + JSON.stringify(hb.on[0]) + '; after tapping 6 on item 1 -> key on ' + JSON.stringify(ha.on[0]) + ' (shared key not linked to pickers)');
      await tab(page, 'sciagawka');
      const sc = page.locator('#s-sciagawka');
      const sb = await keyInfo(sc);
      await sc.locator('.sr .chip').nth(8).click(); await page.waitForTimeout(30);
      const sa = await keyInfo(sc);
      res.sciagawka = { before: sb, after: sa };
      verdict('R1', sb.count === 1 && sb.visible[0] && rowsOk(sb.rows[0]) && sb.on[0].length === 0 && sa.on[0][0] && sa.on[0][0].startsWith('8'),
        'Ściągawka: key visible before choice; chip 8 -> on ' + JSON.stringify(sa.on[0]));
      await page.screenshot({ path: OUT + 'r3_R1_sciagawka.png', fullPage: false });
      res.errors = page.__errors; await c.close();
    }
    // legend range labels („2–3”, „4–5”, „6–7”) stay on one line at 320/360/390 px
    {
      const wr = {};
      for (const width of [320, 360, 390]) {
        const nc = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true }); const np = await nc.newPage(); np.__errors = []; ALL_PAGES.push(np);
        np.on('pageerror', e => np.__errors.push('PAGEERROR ' + e.message)); np.on('console', m => { if (m.type() === 'error') np.__errors.push(m.text()); });
        await np.clock.install({ time: D(2) }); await np.goto(URL); await np.waitForTimeout(100); await tab(np, 'sciagawka');
        wr['overflow' + width] = await np.evaluate(() => [...document.querySelectorAll('#s-sciagawka .srkey')].some(k => k.scrollWidth > k.clientWidth) || document.documentElement.scrollWidth > window.innerWidth);
        wr[width] = await np.evaluate(() => [...document.querySelectorAll('#s-sciagawka .srkey b')].map(b => { const r = b.getBoundingClientRect(); return b.textContent + ':' + Math.round(r.height); }));
        await nc.close();
      }
      const overflow = Object.keys(wr).filter(k => k.startsWith('overflow') && wr[k]);
      Object.keys(wr).filter(k => k.startsWith('overflow')).forEach(k => delete wr[k]);
      const maxH = Math.max(...Object.values(wr).flat().map(x => +x.split(':')[1]));
      verdict('R1', maxH <= 20 && overflow.length === 0, 'no horizontal overflow (' + (overflow.join(',') || 'none') + '); legend labels one line (max height ' + maxH + ' px): ' + JSON.stringify(wr));
    }
    log('R1.detail', res);
  });

  // ===== R2: Oddech A with 3 s inhale =====
  await section('R2', async () => {
    const { c, page } = await ctx(browser, { time: D(2) });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    const od = card(page, 'Oddech A');
    const snap = () => od.evaluate(c => ({ cue: c.querySelector('.cue').textContent, sub: c.querySelector('.sub').textContent, clock: c.querySelector('.clock').textContent, reps: c.querySelector('.reps').textContent, gap: c.querySelector('.timer').classList.contains('gap'), bar: c.querySelector('.bar i').style.width }));
    const dayWords = await od.evaluate(c => c.querySelector('.words').textContent.replace(/^Słowa dnia: /, '').split(' · ')); // v5 (#19)
    const insText = await od.evaluate(c => c.querySelector('.brief').innerText + '\n' + c.querySelector('.ins').innerText + '\n' + [...c.querySelectorAll('.note')].map(n => n.textContent).join('\n'));
    await od.locator('.timer button.big').click();
    const t = {};
    t['start'] = await snap();
    await page.clock.runFor(1000); t['start+1'] = await snap();
    await page.clock.runFor(2000); // v4: first rep also starts with the counted 3 s inhale
    t['0'] = await snap();
    await page.clock.runFor(7100); t['7.1'] = await snap();
    await page.clock.runFor(1000); t['8.1'] = await snap();
    await page.clock.runFor(1000); t['9.1'] = await snap();
    await page.clock.runFor(700); t['9.8'] = await snap();
    await page.clock.runFor(500); t['10.3'] = await snap();
    // to the gap after rep 8 (ends at 7 + 7*10 = 77 s)
    await page.clock.runFor(77300 - 10300); t['77.3'] = await snap();
    await page.clock.runFor(3000); t['80.3'] = await snap();
    await page.clock.runFor(117500 - 80300); await page.waitForTimeout(50);
    await flush(page);
    // v5 (#19, B1/B2): after 12/12 the card asks „Brzuch był miękki?”, Oddech A is done only after the answer
    const ask = await od.evaluate(c => ({ done: c.classList.contains('done'), label: (c.querySelector('.srlabel') || {}).textContent || null }));
    const stAsk = await store(page);
    await tap(od, 'częściowo'); await flush(page);
    const st = await store(page);
    const done = await page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Oddech A'); return { done: c.classList.contains('done'), small: c.querySelector('small').textContent }; });
    log('R2.timeline', t); log('R2.done', { done, reps: st.days[KEY(2)].reps, doneList: st.days[KEY(2)].done });
    log('R2.instructions', insText);
    const gapOk = t['7.1'].gap && t['7.1'].cue === 'Wdech nosem' && t['7.1'].clock === '0:03' && /następne: fff/.test(t['7.1'].sub) && t['8.1'].clock === '0:02' && t['9.1'].clock === '0:01' && t['9.8'].gap && !t['10.3'].gap && t['10.3'].cue === 'fff';
    verdict('R2', gapOk, 'gap after rep1: t7.1 ' + JSON.stringify(t['7.1']) + ' t8.1 clock ' + t['8.1'].clock + ', t9.1 ' + t['9.1'].clock + ', t9.8 gap=' + t['9.8'].gap + ', t10.3 cue ' + t['10.3'].cue + ' reps "' + t['10.3'].reps + '"');
    // v5 (B21b): during the inhale before a word the big cue is the word, the small line „Wdech nosem”; words of the day change daily
    verdict('R2', t['77.3'].gap && t['77.3'].cue === dayWords[0] && t['77.3'].sub === 'Wdech nosem' && t['80.3'].cue === dayWords[0] && dayWords.length === 4, 'word cue visible during inhale: words ' + JSON.stringify(dayWords) + ', t77.3 cue "' + t['77.3'].cue + '" sub "' + t['77.3'].sub + '", t80.3 cue ' + t['80.3'].cue);
    verdict('R2', !ask.done && ask.label === 'Brzuch był miękki?' && !stAsk.days[KEY(2)].done.includes('oddech') && done.done && /brzuch: częściowo/.test(done.small) && st.days[KEY(2)].reps.oddech === 12 && st.days[KEY(2)].done.includes('oddech') && st.days[KEY(2)].oddechBrzuch === 'częściowo',
      'completes at 117 s after the belly answer: before answer ' + JSON.stringify(ask) + ', after ' + JSON.stringify(done) + ' reps.oddech=' + st.days[KEY(2)].reps.oddech + ' oddechBrzuch=' + st.days[KEY(2)].oddechBrzuch);
    verdict('R2', t['start'].gap && t['start'].cue === 'Wdech nosem' && t['start'].clock === '0:03' && /następne: fff/.test(t['start'].sub) && t['start+1'].clock === '0:02' && !t['0'].gap && t['0'].cue === 'fff', 'Start -> counted inhale before rep 1: ' + JSON.stringify(t['start']) + ', +1 s clock ' + t['start+1'].clock + ', +3 s cue ' + t['0'].cue);
    verdict('R2', /Bez zatrzymania na górze wdechu/.test(insText) && /Nie zatrzymuj powietrza na górze wdechu/.test(insText) && /3 s/.test(insText), 'instructions mention 3 s inhale and no stop at the top of the inhale');
    log('R2.errors', page.__errors); await c.close();
    // pause during the inhale keeps the inhale and its remaining time (v4)
    {
      const v = await ctx(browser, { time: D(2) });
      await v.page.goto(URL); await v.page.waitForTimeout(100); await openToday(v.page);
      const o2 = card(v.page, 'Oddech A');
      const sn = () => o2.evaluate(c => ({ cue: c.querySelector('.cue').textContent, clock: c.querySelector('.clock').textContent, gap: c.querySelector('.timer').classList.contains('gap'), btn: c.querySelector('.timer button.big').textContent, reps: c.querySelector('.reps').textContent }));
      await o2.locator('.timer button.big').click();
      await v.page.clock.runFor(9000); // inhale 0-3 s, rep 1 3-10 s
      await v.page.clock.runFor(2000); // t=11 s: gap after rep 1, 2 s left
      const inGap = await sn();
      await o2.locator('.timer button.big').click(); const paused = await sn();
      await v.page.clock.runFor(6000); const later = await sn();
      await o2.locator('.timer button.big').click(); const resumed = await sn();
      await v.page.clock.runFor(1200); const resumed1 = await sn();
      await v.page.clock.runFor(2000); const afterInhale = await sn();
      log('R2.pauseInInhale', { inGap, paused, later, resumed, resumed1, afterInhale });
      verdict('R2', inGap.gap && paused.btn === 'Wznów' && paused.cue === 'Wdech nosem' && paused.clock === '0:03' && later.clock === '0:03' && resumed.gap && resumed.clock === '0:03' && resumed1.gap && resumed1.clock === '0:02' && !afterInhale.gap && afterInhale.cue === 'fff' && afterInhale.clock === '0:07' && afterInhale.reps.startsWith('1 '),
        'pause during inhale: ' + JSON.stringify(paused) + '; 6 s later ' + later.clock + '; resume -> full inhale gap=' + resumed.gap + ' ' + resumed.clock + ', +1.2 s ' + resumed1.clock + '; +3.2 s -> ' + afterInhale.cue + ' ' + afterInhale.clock + ' (' + afterInhale.reps + ')');
      // pause during an exhale: resume starts with the full inhale and the interrupted rep again in full
      await v.page.clock.runFor(2000); const inRun = await sn(); // rep 2 running, ~5 s left
      await o2.locator('.timer button.big').click(); const pausedRun = await sn();
      await v.page.clock.runFor(4000);
      await o2.locator('.timer button.big').click(); const resumedRun = await sn();
      await v.page.clock.runFor(3200); const repAgain = await sn();
      log('R2.pauseInExhale', { inRun, pausedRun, resumedRun, repAgain });
      verdict('R2', !inRun.gap && inRun.cue === 'fff' && pausedRun.cue === 'Wdech nosem' && pausedRun.clock === '0:03' && resumedRun.gap && resumedRun.clock === '0:03' && repAgain.cue === 'fff' && repAgain.clock === '0:07' && repAgain.reps.startsWith('1 '),
        'pause during exhale (' + inRun.clock + ' left): paused shows ' + pausedRun.cue + ' ' + pausedRun.clock + '; resume -> gap ' + resumedRun.clock + '; +3.2 s -> ' + repAgain.cue + ' ' + repAgain.clock + ' (' + repAgain.reps + ', rep restarts)');
      log('R2.pauseErrors', v.page.__errors); await v.c.close();
    }
  });

  // ===== R3: SR weekly =====
  await section('R3', async () => {
    const lists = {};
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 14, 15, 21, 22, 28]) {
      const { c, page } = await ctx(browser, { time: D(n) });
      await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
      lists[n] = { cards: await cardTitles(page), errors: page.__errors.slice() };
      if (n === 1) lists[1].banner = await page.evaluate(() => { const b = document.querySelector('#s-dzis .card.done h2'); return b && b.textContent === 'Sesja zrobiona' ? document.querySelector('#s-dzis .card.done p').textContent : null; });
      if (n === 22) {
        const dz = card(page, 'Dziennik bloków');
        await tap(dz, 'nie'); // v5 (#20): „dziś bez wyraźnego bloku” = one tap
        await page.clock.runFor(2500); await page.waitForTimeout(50);
        const st = await store(page);
        lists[22].afterDiary = { complete: st.days[KEY(22)].complete, onMap: await onMap(page) };
      }
      lists[n].errors = page.__errors.slice();
      await c.close();
    }
    log('R3.lists', lists);
    const noSr = [2, 3, 4, 5, 6].every(n => !lists[n].cards.some(t => /SR/.test(t)));
    verdict('R3', noSr, 'days 2–6 cards: ' + JSON.stringify(lists[2].cards) + ' (no SR card on any of 2–6)');
    verdict('R3', lists[7].cards.includes('SR tygodnia') && lists[14].cards.includes('SR tygodnia') && !lists[8].cards.some(t => /SR/.test(t)), 'day 7: ' + JSON.stringify(lists[7].cards) + '; day 14 has SR tygodnia: ' + lists[14].cards.includes('SR tygodnia') + '; day 8 no SR');
    verdict('R3', lists[1].cards.includes('SR dnia') && !!lists[1].banner, 'day 1: ' + JSON.stringify(lists[1].cards) + ', banner: ' + lists[1].banner);
    const w4 = lists[22].cards, w4b = lists[28].cards;
    verdict('R3', w4.filter(t => !/^Etap/.test(t)).join() === 'Dziennik bloków' && w4b.filter(t => !/^Etap/.test(t)).join() === 'Dziennik bloków,SR tygodnia' && lists[22].afterDiary.complete && lists[22].errors.length === 0 && lists[28].errors.length === 0,
      'day 22: ' + JSON.stringify(w4) + ' -> diary completes day (' + JSON.stringify(lists[22].afterDiary) + '); day 28: ' + JSON.stringify(w4b) + '; errors ' + (lists[22].errors.length + lists[28].errors.length));
  });

  // ===== R4: Start na sygnał =====
  await section('R4', async () => {
    const { c, page } = await ctx(browser, { time: D(2), init: () => { const C = window.AudioContext || window.webkitAudioContext; if (C) { const o = C.prototype.createOscillator; C.prototype.createOscillator = function () { (window.__osc = window.__osc || []).push(Date.now()); return o.call(this); }; } } });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    const titles = await cardTitles(page);
    const sg = await expand(page, 'Start na sygnał');
    const snap = () => sg.evaluate(c => ({ cue: c.querySelector('.cue').textContent, clock: c.querySelector('.clock').textContent, reps: c.querySelector('.reps').textContent, btn: c.querySelector('.timer button.big').textContent, wait: c.querySelector('.timer').classList.contains('wait'), done: c.classList.contains('done') }));
    const idle = await snap();
    await sg.locator('.timer button.big').click();
    // step through with 100 ms resolution, record phase transitions
    const events = []; let prev = null, t = 0; const qs = [], repsStore = [];
    let s = await snap(); prev = s.wait ? 'wait' : 'answer'; events.push({ t, ph: prev, cue: s.cue }); const cueH = new Set();
    while (t < 200000) {
      await page.clock.runFor(100); t += 100;
      const cur = await page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Start na sygnał'); if (!c) return { gone: true }; const tm = c.querySelector('.timer'); return { cue: tm ? c.querySelector('.cue').textContent : null, wait: tm ? tm.classList.contains('wait') : null, done: c.classList.contains('done'), reps: tm ? c.querySelector('.reps').textContent : null, h: tm ? Math.round(c.querySelector('.cue').getBoundingClientRect().height) : null }; });
      if (cur.done || cur.gone) { events.push({ t, ph: 'done' }); break; }
      cueH.add(cur.h);
      const ph = cur.wait ? 'wait' : 'answer';
      if (ph !== prev) { events.push({ t, ph, cue: cur.cue, reps: cur.reps }); if (ph === 'answer') qs.push(cur.cue); prev = ph; }
      if (t % 30000 === 0) { const st = await store(page); repsStore.push({ t, reps: st.days[KEY(2)].reps.sygnal }); }
    }
    await page.waitForTimeout(50); await flush(page);
    const st = await store(page);
    const waits = [], answers = [];
    for (let i = 0; i < events.length - 1; i++) { const d = events[i + 1].t - events[i].t; if (events[i].ph === 'wait') waits.push(d); else if (events[i].ph === 'answer') answers.push(d); }
    const beeps = await page.evaluate(() => ({ vib: window.__beeps.length, osc: (window.__osc || []).length }));
    log('R4.run', { titles, idle, events: events.length, waits, answers, qs, repsStore, beeps, store: { reps: st.days[KEY(2)].reps, done: st.days[KEY(2)].done } });
    verdict('R4', titles[0] === 'Oddech A' && titles[1] === 'Start na sygnał', 'day 2 order: ' + JSON.stringify(titles));
    verdict('R4', cueH.size === 1, 'cue height constant across wait/answer of all 10 rounds (cards below do not jump): ' + JSON.stringify([...cueH]));
    verdict('R4', events[0].ph === 'wait' && events[0].cue === 'Czekaj na sygnał…' && waits.length === 10 && waits.every(w => w >= 2000 && w <= 6200) && answers.length === 10 && answers.every(a => a >= 7900 && a <= 8200) && beeps.vib >= 11,
      'Start -> "' + events[0].cue + '"; waits ms ' + JSON.stringify(waits) + '; answer windows ' + JSON.stringify([...new Set(answers)]) + '; vibrate/beep calls ' + beeps.vib + ' (osc ' + beeps.osc + ')');
    const en = qs.filter(q => /^(What|Where|How|Can|Any|Coffee or tea\?$)/.test(q)).length;
    verdict('R4', st.days[KEY(2)].reps.sygnal === 10 && st.days[KEY(2)].done.includes('sygnal') && repsStore.some(r => r.reps > 0 && r.reps < 10) && en >= 2 && qs.length - en >= 2,
      'reps.sygnal=' + st.days[KEY(2)].reps.sygnal + ' (mid-run samples ' + JSON.stringify(repsStore) + '), done includes sygnal; questions PL ' + (qs.length - en) + ' / EN ' + en);
    // stable across reload: Powtórz -> run again in the same page after reload and compare
    await page.reload(); await page.waitForTimeout(100); await openToday(page);
    await card(page, 'Start na sygnał').locator('.chead .act').click(); await page.waitForTimeout(50);
    const sg2 = await expand(page, 'Start na sygnał');
    await sg2.locator('.timer button.big').click();
    const qs2 = []; prev = 'wait'; t = 0;
    while (t < 200000 && qs2.length < 10) {
      await page.clock.runFor(100); t += 100;
      const cur = await sg2.evaluate(c => ({ cue: c.querySelector('.cue') && c.querySelector('.cue').textContent, wait: c.querySelector('.timer') && c.querySelector('.timer').classList.contains('wait') })).catch(() => ({}));
      const ph = cur.wait ? 'wait' : 'answer';
      if (ph !== prev) { if (ph === 'answer') qs2.push(cur.cue); prev = ph; }
    }
    log('R4.reloadQuestions', { qs, qs2 });
    verdict('R4', JSON.stringify(qs) === JSON.stringify(qs2), 'same 10 questions after reload: ' + (JSON.stringify(qs) === JSON.stringify(qs2)) + ' e.g. ' + JSON.stringify(qs.slice(0, 3)));
    log('R4.errors', page.__errors); await c.close();

    // Pause/resume, Od nowa, mid-run reload, other day differs
    const v = await ctx(browser, { time: D(2) });
    await v.page.goto(URL); await v.page.waitForTimeout(100); await openToday(v.page);
    const s3 = await expand(v.page, 'Start na sygnał');
    const sn = () => s3.evaluate(c => ({ cue: c.querySelector('.cue').textContent, clock: c.querySelector('.clock').textContent, reps: c.querySelector('.reps').textContent, btn: c.querySelector('.timer button.big').textContent, reset: !c.querySelector('.timer .row button').classList.contains('hidden') }));
    await s3.locator('.timer button.big').click();
    await v.page.clock.runFor(6300); // in answer phase for rep 1
    const inAnswer = await sn();
    await s3.locator('.timer button.big').click(); const paused = await sn();
    await v.page.clock.runFor(30000); const stillPaused = await sn();
    await s3.locator('.timer button.big').click(); const resumed = await sn();
    await v.page.clock.runFor(14300 * 3); const after3 = await sn();
    await flush(v.page);
    const repsMid = (await store(v.page)).days[KEY(2)].reps.sygnal;
    await v.page.reload(); await v.page.waitForTimeout(100); await openToday(v.page);
    const s4 = await expand(v.page, 'Start na sygnał');
    const afterReload = await s4.evaluate(c => ({ cue: c.querySelector('.cue').textContent, reps: c.querySelector('.reps').textContent, reset: !c.querySelector('.timer .row button').classList.contains('hidden') }));
    await s4.locator('button', { hasText: 'Od nowa' }).click(); await flush(v.page);
    const afterReset = await s4.evaluate(c => ({ cue: c.querySelector('.cue').textContent, reps: c.querySelector('.reps').textContent }));
    const repsAfterReset = (await store(v.page)).days[KEY(2)].reps.sygnal;
    log('R4.controls', { inAnswer, paused, stillPaused, resumed, after3, repsMid, afterReload, afterReset, repsAfterReset });
    verdict('R4', paused.cue === 'Pauza' && paused.btn === 'Wznów' && stillPaused.reps === paused.reps && resumed.cue === 'Czekaj na sygnał…' && resumed.btn === 'Pauza' && repsMid >= 2,
      'pause: ' + JSON.stringify(paused) + ', 30 s later reps unchanged (' + stillPaused.reps + '), resume -> "' + resumed.cue + '", continues to ' + after3.reps + ' (store ' + repsMid + ')');
    verdict('R4', /^\s*0 \/ 10/.test(afterReset.reps) && repsAfterReset === 0 && afterReload.reps.startsWith(String(repsMid)),
      'reload keeps ' + afterReload.reps + '; Od nowa -> "' + afterReset.reps + '", store reps.sygnal=' + repsAfterReset);
    log('R4.controlsErrors', v.page.__errors); await v.c.close();
    // narrow phones: every question and the wait text give the same cue height
    {
      const hs = {};
      const timerH = {};
      for (const width of [320, 360, 390]) {
        const nc = await browser.newContext({ viewport: { width, height: 700 }, isMobile: true, hasTouch: true }); const np = await nc.newPage(); np.__errors = []; ALL_PAGES.push(np);
        np.on('pageerror', e => np.__errors.push('PAGEERROR ' + e.message));
        await np.clock.install({ time: D(2) }); await np.goto(URL); await np.waitForTimeout(100); await openToday(np);
        hs[width] = await np.evaluate(() => { const src = document.querySelector('script:not([src])').textContent; const qs = ['PL', 'EN'].flatMap(L => eval('[' + src.match(new RegExp('var SIGNAL_' + L + ' = \\[([\\s\\S]*?)\\];'))[1] + ']').map(x => x.q)); /* v5: {t, q} in SIGNAL_PL / SIGNAL_EN */ const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Start na sygnał'); c.classList.remove('collapsed'); const cue = c.querySelector('.cue'), tm = c.querySelector('.timer'); const set = new Set(); qs.forEach(q => { cue.textContent = q; set.add(Math.round(cue.getBoundingClientRect().height)); }); tm.classList.add('wait'); cue.textContent = 'Czekaj na sygnał…'; set.add(Math.round(cue.getBoundingClientRect().height)); return [...set]; });
        timerH[width] = await np.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Start na sygnał'); const tm = c.querySelector('.timer'), sub = c.querySelector('.sub'); const set = new Set(); ['dłoń na brzuchu, oddychasz normalnie', 'wdech nosem i od razu odpowiedź na wydechu', 'po wznowieniu znowu czekasz na sygnał', '', '10 pytań, każde w losowym momencie'].forEach(t => { sub.textContent = t; set.add(Math.round(tm.getBoundingClientRect().height)); }); return [...set]; });
        await nc.close();
      }
      // every timer (Oddech A, Miękki start, Identyfikacja napięcia, monolog) keeps its height across all its phase hints, per width
      const allH = {};
      for (const width of [320, 360, 375, 390]) {
        const nc = await browser.newContext({ viewport: { width, height: 700 }, isMobile: true, hasTouch: true }); const np = await nc.newPage(); np.__errors = []; ALL_PAGES.push(np);
        np.on('pageerror', e => np.__errors.push('PAGEERROR ' + e.message));
        await np.clock.install({ time: D(15) }); await np.goto(URL); await np.waitForTimeout(100); await openToday(np);
        allH[width] = await np.evaluate(() => {
          const subs = ['wydech 1/8 · brzuch miękki', 'słowo na początku wydechu, potem dalej „fff”', 'następne: Aleksander', 'następne: fff', 'frazy 3–5 słów, oddech po każdej', 'w bloku: zostań, poczuj, stuknij', ''];
          const res = {};
          [...document.querySelectorAll('#s-dzis .card')].forEach(c => { const tm = c.querySelector('.timer:not(.signal)'); if (!tm) return; c.classList.remove('collapsed'); const sub = tm.querySelector('.sub'), keep = sub.textContent; const set = new Set(); subs.concat([keep]).forEach(t => { sub.textContent = t; set.add(Math.round(tm.getBoundingClientRect().height)); }); sub.textContent = keep; res[c.querySelector('h2').textContent] = [...set]; });
          return res;
        });
        await nc.close();
      }
      log('R4.allTimerHeights', allH);
      verdict('R4', Object.values(allH).every(o => Object.keys(o).length >= 3 && Object.values(o).every(x => x.length === 1)), 'every timer height constant across its hints at 320/360/375/390 px: ' + JSON.stringify(allH));
      log('R4.cueHeights', hs); log('R4.signalTimerHeights', timerH);
      verdict('R4', Object.values(timerH).every(x => x.length === 1), 'whole signal timer height constant for every hint text, per width: ' + JSON.stringify(timerH));
      verdict('R4', Object.values(hs).every(x => x.length === 1), 'cue height per width (all ' + 'questions + wait): ' + JSON.stringify(hs));
    }
    // other day: different set
    const w = await ctx(browser, { time: D(3) });
    await w.page.goto(URL); await w.page.waitForTimeout(100); await openToday(w.page);
    log('R4.day3', { cards: await cardTitles(w.page) });
    await w.c.close();
  });

  // ===== R5: migration of completed days =====
  await section('R5', async () => {
    const old = { days: {
      [KEY(2)]: { done: ['oddech', 'monolog', 'dziennik', 'sr'], reps: { oddech: 12 }, monolog: { ran: true, breath: 'tak', sr: 2 }, sr: { typ: 2, max: 4 }, diary: 'rozmowa · start: ktoś' },
      [KEY(3)]: { done: ['oddech', 'monolog', 'dziennik'], reps: { oddech: 12 }, monolog: { ran: true, breath: 'tak', sr: 3 }, diary: 'daily · start: ja' },
      [KEY(4)]: { done: ['oddech'], reps: { oddech: 12 } }
    } };
    const init = `if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded','1'); localStorage.setItem('plynnosc', ${JSON.stringify(JSON.stringify(old))}); }`;
    const { c, page } = await ctx(browser, { time: D(4), init });
    await page.goto(URL); await page.waitForTimeout(100);
    const st = await store(page);
    const isl = await page.evaluate(() => [...document.querySelectorAll('#s-dzis .island')].slice(0, 5).map(g => g.getAttribute('data-k') + ':' + g.getAttribute('class')));
    const mapHeader = await page.locator('#s-dzis header p').innerText();
    await tab(page, 'postepy');
    const stats = await page.evaluate(() => [...document.querySelectorAll('#s-postepy .stat b')].map(b => b.textContent));
    const table = await page.evaluate(() => [...document.querySelectorAll('#s-postepy table tbody tr')].map(r => r.innerText.replace(/\s+/g, ' ')));
    await tab(page, 'dzis');
    // open migrated day 2 (complete, but sygnal not in done list)
    await page.locator(`#s-dzis .island[data-k="${KEY(2)}"]`).click(); await page.waitForTimeout(50);
    const day2View = await page.evaluate(() => ({ h1: document.querySelector('#s-dzis h1').textContent, banner: (document.querySelector('#s-dzis .card.done h2') || {}).textContent || null, next: document.querySelector('#s-dzis .next').textContent, bar: document.querySelectorAll('#s-dzis .progress .on').length + '/' + document.querySelectorAll('#s-dzis .progress span').length }));
    await page.reload(); await page.waitForTimeout(100);
    const st2 = await store(page);
    const out = { v: st.v, complete: { d1: st.days[KEY(1)].complete, d2: st.days[KEY(2)].complete, d3: st.days[KEY(3)].complete, d4: st.days[KEY(4)].complete }, afterReload: { v: st2.v, d2: st2.days[KEY(2)].complete, d3: st2.days[KEY(3)].complete, d4: st2.days[KEY(4)].complete }, isl, mapHeader, stats, table, day2View };
    log('R5.result', out);
    verdict('R5', st.v === 2 && st.days[KEY(2)].complete === true && /st-done/.test(isl[1]), 'old ["oddech","monolog","dziennik","sr"] -> complete:true, v:2, island ' + isl[1]);
    verdict('R5', st.days[KEY(3)].complete === true && /st-done/.test(isl[2]), 'old ["oddech","monolog","dziennik"] -> complete:' + st.days[KEY(3)].complete + ', island ' + isl[2]);
    verdict('R5', st.days[KEY(4)].complete === false && !/st-done/.test(isl[3]) && /streak 3 dni/.test(mapHeader) && stats[0] === '3', 'only ["oddech"] -> complete:' + st.days[KEY(4)].complete + ' (' + isl[3] + '); streak "' + mapHeader + '", Postępy streak ' + stats[0] + ', sessions ' + stats[1]);
    log('R5.errors', page.__errors); await c.close();
  });

  // ===== R6: diary last, typing keeps the session =====
  await section('R6', async () => {
    const seed = { v: 2, days: { [KEY(2)]: { done: ['oddech', 'sygnal', 'monolog'], reps: { oddech: 12, sygnal: 10 }, monolog: { ran: true, breath: 'tak', sr: 2, lang: 'en', topic: 1 }, extra: EXTRA_DONE } } };
    for (const variant of ['typing', 'chip']) {
      const { c, page } = await ctx(browser, { time: D(2), init: `localStorage.setItem('plynnosc', ${JSON.stringify(JSON.stringify(seed))})` });
      await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
      const dz = await expand(page, 'Dziennik bloków');
      const ta = dz.locator('textarea');
      // v5 (#20): the last tap completes the diary while the note keeps focus (taps do not take the focus)
      if (variant === 'typing') { await tap(dz, 'tak', 'ktoś', 'PL'); await ta.click(); await page.keyboard.type('rozmowa z kolegą', { delay: 5 }); await tap(dz, 'szybko'); }
      else { await tap(dz, 'tak'); await ta.click(); await page.keyboard.type('telefon', { delay: 5 }); await tap(dz, 'ktoś', 'PL', 'szybko'); } // note not empty: with an empty note the banner waits (point 9, R12)
      await page.clock.runFor(200);
      const doneNow = await dz.evaluate(c => c.classList.contains('done'));
      await page.keyboard.type(' o nartach', { delay: 5 });
      await page.clock.runFor(5000); await page.waitForTimeout(50);
      const whileFocused = await page.evaluate(() => ({ onMap: !!document.querySelector('#s-dzis svg.map'), active: document.activeElement && document.activeElement.tagName, value: (document.querySelector('#s-dzis textarea') || {}).value }));
      await page.locator('#s-dzis h1').click(); // blur
      await page.clock.runFor(2500); await page.waitForTimeout(50);
      const afterBlur = await page.evaluate(() => ({ onMap: !!document.querySelector('#s-dzis svg.map'), mapline: (document.querySelector('#s-dzis .mapline') || {}).textContent }));
      await flush(page);
      const st = await store(page);
      log('R6.' + variant, { doneNow, whileFocused, afterBlur, diary: st.days[KEY(2)].diary, complete: st.days[KEY(2)].complete });
      verdict('R6', doneNow && !whileFocused.onMap && whileFocused.active === 'TEXTAREA' && / o nartach$/.test(whileFocused.value) && afterBlur.onMap && st.days[KEY(2)].complete,
        variant + ': diary done while typing, 5 s later still on session with focus (value "' + whileFocused.value + '"), after blur -> map ("' + afterBlur.mapline + '")');
      log('R6.' + variant + '.errors', page.__errors); await c.close();
    }
  });

  // ===== R6b: a timer that ends while typing in the diary keeps focus and the session (v4) =====
  await section('R6', async () => {
    const seed = { v: 2, days: { [KEY(9)]: { done: ['oddech', 'sygnal', 'monolog'], reps: { oddech: 12, sygnal: 10 }, monolog: { ran: true, breath: 'tak', sr: 2, lang: 'pl', topic: 1 }, extra: EXTRA_DONE } } };
    const { c, page } = await ctx(browser, { time: D(9), init: `localStorage.setItem('plynnosc', ${JSON.stringify(JSON.stringify(seed))})` });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    const nap = await expand(page, 'Identyfikacja napięcia');
    await nap.locator('.timer button.big').click();
    const dz = await expand(page, 'Dziennik bloków');
    await tap(dz, 'tak', 'ja', 'PL', 'wolno'); // v5 (#20): diary done by taps, then the note is being typed when the timer ends
    await dz.locator('textarea').click(); await page.keyboard.type('czytanie raportu', { delay: 5 });
    await page.clock.runFor(125000); await page.waitForTimeout(50);
    const whileFocused = await page.evaluate(() => ({ onMap: !!document.querySelector('#s-dzis svg.map'), active: document.activeElement && document.activeElement.tagName, napDone: [...document.querySelectorAll('#s-dzis .card.done h2')].map(h => h.textContent) }));
    await page.keyboard.type(' · start: ja', { delay: 5 });
    const value = await page.evaluate(() => (document.querySelector('#s-dzis textarea') || {}).value);
    await page.locator('#s-dzis h1').click(); await page.clock.runFor(2500); await page.waitForTimeout(50);
    const afterBlur = await onMap(page);
    await flush(page); const st = await store(page);
    log('R6.timerEndsWhileTyping', { whileFocused, value, afterBlur, done: st.days[KEY(9)].done, complete: st.days[KEY(9)].complete });
    verdict('R6', !whileFocused.onMap && whileFocused.active === 'TEXTAREA' && whileFocused.napDone.includes('Identyfikacja napięcia') && value === 'czytanie raportu · start: ja' && afterBlur && st.days[KEY(9)].complete,
      'day 9: napięcie timer ends while typing -> focus kept (' + whileFocused.active + '), done ' + JSON.stringify(whileFocused.napDone) + ', value "' + value + '", after blur onMap=' + afterBlur);
    log('R6.timerErrors', page.__errors); await c.close();
    // monolog timer ends while typing in the diary: focus and text stay, monolog card switches to the questions
    {
      const seed2 = { v: 2, days: { [KEY(2)]: { done: ['oddech', 'sygnal'], reps: { oddech: 12, sygnal: 10 }, monolog: { lang: 'pl', topic: 1 } } } };
      const v = await ctx(browser, { time: D(2), init: `localStorage.setItem('plynnosc', ${JSON.stringify(JSON.stringify(seed2))})` });
      await v.page.goto(URL); await v.page.waitForTimeout(100); await openToday(v.page);
      await (await expand(v.page, 'Luźny monolog')).locator('.timer button.big').click();
      const dz2 = await expand(v.page, 'Dziennik bloków');
      await tap(dz2, 'tak'); await dz2.locator('textarea').click(); await v.page.keyboard.type('spotkanie', { delay: 5 });
      await v.page.clock.runFor(121000); await v.page.waitForTimeout(50);
      await v.page.keyboard.type(' XYZ', { delay: 5 });
      const r = await v.page.evaluate(() => ({ active: document.activeElement && document.activeElement.tagName, value: (document.querySelector('#s-dzis textarea') || {}).value, onMap: !!document.querySelector('#s-dzis svg.map'), monoQuestions: [...document.querySelectorAll('#s-dzis .card h3')].some(h => h.textContent === 'Po monologu') }));
      log('R6.monologEndsWhileTyping', r);
      verdict('R6', r.active === 'TEXTAREA' && r.value === 'spotkanie XYZ' && !r.onMap && r.monoQuestions, 'day 2: monolog timer ends while typing -> focus ' + r.active + ', value "' + r.value + '", monolog questions shown ' + r.monoQuestions);
      log('R6.monologErrors', v.page.__errors); await v.c.close();
    }
    // Oddech A ends while typing in the diary: the next card auto-expands above the diary; the field must stay where it was (also without scroll anchoring, as in Safari)
    {
      const res = {};
      for (const anchoring of ['auto', 'none']) {
        const v = await ctx(browser, { time: D(2), init: anchoring === 'none' ? `document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '* { overflow-anchor: none !important; }'; document.head.appendChild(s); });` : undefined });
        await v.page.goto(URL); await v.page.waitForTimeout(100); await openToday(v.page);
        await card(v.page, 'Oddech A').locator('.timer button.big').click();
        const dz4 = await expand(v.page, 'Dziennik bloków');
        await tap(dz4, 'tak'); await dz4.locator('textarea').click(); await v.page.keyboard.type('rozmowa', { delay: 5 });
        const before = await v.page.evaluate(() => Math.round(document.querySelector('#s-dzis textarea').getBoundingClientRect().top));
        await v.page.clock.runFor(121000); await v.page.waitForTimeout(50);
        const after = await v.page.evaluate(() => ({ top: Math.round(document.querySelector('#s-dzis textarea').getBoundingClientRect().top), active: document.activeElement.tagName, oddechDone: [...document.querySelectorAll('#s-dzis .card')].some(c => c.querySelector('h2').textContent === 'Oddech A' && [...c.querySelectorAll('.srlabel')].some(l => l.textContent === 'Brzuch był miękki?')) })); // v5 (#19): the card switches to the belly question
        res[anchoring] = { before, after, errors: v.page.__errors }; await v.c.close();
      }
      log('R6.fieldStaysInPlace', res);
      verdict('R6', ['auto', 'none'].every(a => res[a].after.oddechDone && res[a].after.active === 'TEXTAREA' && Math.abs(res[a].after.top - res[a].before) <= 3),
        'Oddech A ends while typing: textarea top ' + ['auto', 'none'].map(a => a + ' ' + res[a].before + '→' + res[a].after.top).join(', ') + ' (overflow-anchor), focus ' + res.none.after.active);
    }
    // diary completes the day in place: the field stays where it was (both scroll-anchoring modes)
    // then: deliberate actions in the session cancel the pending return; a neutral blur (also with a quick tab switch) returns to the map
    {
      const seedD = { v: 2, days: { [KEY(7)]: { done: ['oddech', 'sygnal', 'monolog', 'sr'], reps: { oddech: 12, sygnal: 10 }, monolog: { ran: true, breath: 'tak', sr: 2, lang: 'pl', topic: 1 }, sr: { typ: 2, max: 4 }, extra: EXTRA_DONE } } };
      const out = {};
      for (const sc of ['anchor-auto', 'anchor-none', 'srChip', 'insToggle', 'neutralBlur', 'tabSwitch']) {
        const none = sc !== 'anchor-auto';
        const v = await ctx(browser, { time: D(7), init: `localStorage.setItem('plynnosc', ${JSON.stringify(JSON.stringify(seedD))});` + (none ? ` document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '* { overflow-anchor: none !important; }'; document.head.appendChild(s); });` : '') });
        await v.page.goto(URL); await v.page.waitForTimeout(100); await openToday(v.page);
        const dzD = await expand(v.page, 'Dziennik bloków');
        await tap(dzD, 'tak', 'ktoś', 'PL'); // v5 (#20): the last tap („szybko”) completes the day while the note keeps focus
        await dzD.locator('textarea').click(); await v.page.clock.runFor(1000); await v.page.waitForTimeout(800); // let the focus „center” smooth scroll settle
        await v.page.keyboard.type('rozmowa', { delay: 5 });
        const before = await v.page.evaluate(() => Math.round(document.querySelector('#s-dzis textarea').getBoundingClientRect().top));
        await tap(dzD, 'szybko'); await v.page.keyboard.type(' z kolegą', { delay: 5 }); await v.page.waitForTimeout(300);
        const r = { before, after: await v.page.evaluate(() => Math.round(document.querySelector('#s-dzis textarea').getBoundingClientRect().top)) };
        await v.page.clock.runFor(5000);
        if (sc === 'srChip') { await card(v.page, 'SR tygodnia').locator('.chead h2').click(); await v.page.waitForTimeout(30); await card(v.page, 'SR tygodnia').locator('.sr').nth(0).locator('.chip').nth(3).click(); }
        if (sc === 'insToggle') { await card(v.page, 'Dziennik bloków').locator('button.instoggle').click(); }
        if (sc === 'neutralBlur' || sc === 'tabSwitch') { await v.page.locator('#s-dzis h1').click(); }
        if (sc === 'tabSwitch') { await v.page.clock.runFor(500); await tab(v.page, 'postepy'); await tab(v.page, 'dzis'); }
        await v.page.clock.runFor(3000); await v.page.waitForTimeout(50);
        r.onMap = await onMap(v.page); r.typ = (await store(v.page)).days[KEY(7)].sr.typ; r.errors = v.page.__errors;
        out[sc] = r; await v.c.close();
      }
      log('R6.inPlaceAndCancel', out);
      verdict('R6', ['anchor-auto', 'anchor-none'].every(a => Math.abs(out[a].after - out[a].before) <= 3),
        'diary completes the day in place: textarea top ' + ['anchor-auto', 'anchor-none'].map(a => a + ' ' + out[a].before + '→' + out[a].after).join(', '));
      verdict('R6', !out.srChip.onMap && out.srChip.typ === 3 && !out.insToggle.onMap && out.neutralBlur.onMap && out.tabSwitch.onMap,
        'after diary completion: SR header+chip -> onMap ' + out.srChip.onMap + ' (typ ' + out.srChip.typ + '), „Pokaż instrukcję” -> onMap ' + out.insToggle.onMap + '; neutral blur -> onMap ' + out.neutralBlur.onMap + '; blur + quick tab switch -> onMap ' + out.tabSwitch.onMap);
    }
    // a diary tag completes the day: the field keeps focus and position; keyboard Enter on a card header cancels the return like a tap
    {
      const seedT = { v: 2, days: { [KEY(7)]: { done: ['oddech', 'sygnal', 'monolog', 'sr'], reps: { oddech: 12, sygnal: 10 }, monolog: { ran: true, breath: 'tak', sr: 2, lang: 'pl', topic: 1 }, sr: { typ: 2, max: 4 }, extra: EXTRA_DONE } } };
      const out = {};
      for (const sc of ['tag-auto', 'tag-none', 'kbHeader']) {
        const none = sc === 'tag-none';
        const v = await ctx(browser, { time: D(7), init: `localStorage.setItem('plynnosc', ${JSON.stringify(JSON.stringify(seedT))});` + (none ? ` document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '* { overflow-anchor: none !important; }'; document.head.appendChild(s); });` : '') });
        await v.page.goto(URL); await v.page.waitForTimeout(100); await openToday(v.page);
        const dzT = await expand(v.page, 'Dziennik bloków');
        await tap(dzT, 'tak', 'PL', 'szybko'); // v5 (#20): „ktoś” is the last tap (below) and completes the day
        await dzT.locator('textarea').click(); await v.page.clock.runFor(1000); await v.page.waitForTimeout(800);
        const r = {};
        if (sc !== 'kbHeader') {
          await v.page.keyboard.type('abc', { delay: 5 });
          r.before = await v.page.evaluate(() => Math.round(document.querySelector('#s-dzis textarea').getBoundingClientRect().top));
          await tap(dzT, 'ktoś');
          r.now = await v.page.evaluate(() => ({ top: Math.round(document.querySelector('#s-dzis textarea').getBoundingClientRect().top), active: document.activeElement.tagName }));
          await v.page.waitForTimeout(700);
          r.later = await v.page.evaluate(() => Math.round(document.querySelector('#s-dzis textarea').getBoundingClientRect().top));
          r.complete = (await store(v.page)).days[KEY(7)].complete;
        } else {
          await v.page.keyboard.type('rozmowa z kolegą', { delay: 5 }); await tap(dzT, 'ktoś'); await v.page.clock.runFor(3000);
          await card(v.page, 'SR tygodnia').locator('.chead').focus(); await v.page.keyboard.press('Enter');
          await v.page.clock.runFor(3000); await v.page.waitForTimeout(50);
          r.onMap = await onMap(v.page); r.srOpen = await card(v.page, 'SR tygodnia').evaluate(c => !c.classList.contains('collapsed'));
        }
        r.errors = v.page.__errors; out[sc] = r; await v.c.close();
      }
      // long sentence from the instructions: the header summary wraps while typing, the field must not move
      for (const sc of ['long-auto', 'long-none']) {
        const none = sc === 'long-none';
        const v = await ctx(browser, { time: D(2), init: none ? `document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '* { overflow-anchor: none !important; }'; document.head.appendChild(s); });` : undefined });
        await v.page.goto(URL); await v.page.waitForTimeout(100); await openToday(v.page);
        const dzL = await expand(v.page, 'Dziennik bloków');
        await tap(dzL, 'tak'); await dzL.locator('textarea').click(); await v.page.clock.runFor(1000); await v.page.waitForTimeout(800);
        const tops = [];
        for (const ch of 'rozmowa z kolegą o nartach · start: ktoś · PL · szybko') { await v.page.keyboard.type(ch); tops.push(await v.page.evaluate(() => Math.round(document.querySelector('#s-dzis textarea').getBoundingClientRect().top))); }
        out[sc] = { min: Math.min(...tops), max: Math.max(...tops), errors: v.page.__errors }; await v.c.close();
      }
      // 320 px: English monolog cue wraps to 2 lines; when the monolog ends while typing, the field must not move
      for (const sc of ['mon320-auto', 'mon320-none']) {
        const none = sc === 'mon320-none';
        const seedM = { v: 2, days: { [KEY(2)]: { done: ['oddech', 'sygnal'], reps: { oddech: 12, sygnal: 10 }, monolog: { lang: 'en', topic: 1 } } } };
        const nc = await browser.newContext({ viewport: { width: 320, height: 844 }, isMobile: true, hasTouch: true }); const np = await nc.newPage(); np.__errors = []; ALL_PAGES.push(np);
        np.on('pageerror', e => np.__errors.push('PAGEERROR ' + e.message)); np.on('console', m => { if (m.type() === 'error') np.__errors.push(m.text()); });
        await np.addInitScript(`localStorage.setItem('plynnosc', ${JSON.stringify(JSON.stringify(seedM))});` + (none ? ` document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '* { overflow-anchor: none !important; }'; document.head.appendChild(s); });` : ''));
        await np.clock.install({ time: D(2) }); await np.goto(URL); await np.waitForTimeout(100); await openToday(np);
        await (await expand(np, 'Luźny monolog')).locator('.timer button.big').click();
        const dzM = await expand(np, 'Dziennik bloków');
        await tap(dzM, 'tak'); await dzM.locator('textarea').click(); await np.clock.runFor(1000); await np.waitForTimeout(800);
        await np.keyboard.type('spotkanie', { delay: 5 });
        const cueLines = await np.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Luźny monolog'); return Math.round(c.querySelector('.cue').getBoundingClientRect().height); });
        const before = await np.evaluate(() => Math.round(document.querySelector('#s-dzis textarea').getBoundingClientRect().top));
        await np.clock.runFor(121000); await np.waitForTimeout(50);
        const after = await np.evaluate(() => ({ top: Math.round(document.querySelector('#s-dzis textarea').getBoundingClientRect().top), active: document.activeElement.tagName }));
        out[sc] = { cueH: cueLines, before, after }; await nc.close();
      }
      verdict('R6', ['mon320-auto', 'mon320-none'].every(a => out[a].after.active === 'TEXTAREA' && Math.abs(out[a].after.top - out[a].before) <= 3),
        '320 px, English monolog (cue ' + out['mon320-none'].cueH + ' px) ends while typing: ' + ['mon320-auto', 'mon320-none'].map(a => a + ' ' + out[a].before + '→' + out[a].after.top).join(', '));
      log('R6.tagAndKeyboard', out);
      verdict('R6', ['long-auto', 'long-none'].every(a => out[a].max - out[a].min <= 3), 'long diary sentence typed char by char: textarea top range ' + ['long-auto', 'long-none'].map(a => a + ' ' + out[a].min + '–' + out[a].max).join(', '));
      verdict('R6', ['tag-auto', 'tag-none'].every(a => out[a].complete && out[a].now.active === 'TEXTAREA' && Math.abs(out[a].now.top - out[a].before) <= 3 && Math.abs(out[a].later - out[a].before) <= 3),
        'diary tag completes the day: ' + ['tag-auto', 'tag-none'].map(a => a + ' ' + out[a].before + '→' + out[a].now.top + '→' + out[a].later + ' focus ' + out[a].now.active).join(', '));
      verdict('R6', !out.kbHeader.onMap && out.kbHeader.srOpen, 'keyboard Enter on SR header after diary completion: onMap ' + out.kbHeader.onMap + ', SR expanded ' + out.kbHeader.srOpen);
    }
    // day completed by the diary, user keeps typing, then taps „Zmień” on SR tygodnia: no deferred jump to the map (v3 behaviour)
    {
      const seed3 = { v: 2, days: { [KEY(7)]: { done: ['oddech', 'sygnal', 'monolog', 'sr'], reps: { oddech: 12, sygnal: 10 }, monolog: { ran: true, breath: 'tak', sr: 2, lang: 'pl', topic: 1 }, sr: { typ: 2, max: 4 }, extra: EXTRA_DONE } } };
      const res = {};
      for (const mode of ['playwright', 'domclick']) { // domclick = tap that does not move focus (iOS-like)
        const v = await ctx(browser, { time: D(7), init: `localStorage.setItem('plynnosc', ${JSON.stringify(JSON.stringify(seed3))})` });
        await v.page.goto(URL); await v.page.waitForTimeout(100); await openToday(v.page);
        const dz3 = await expand(v.page, 'Dziennik bloków');
        await tap(dz3, 'tak', 'ktoś', 'PL'); // v5 (#20): the last tap completes the day while the note keeps focus
        await dz3.locator('textarea').click(); await v.page.keyboard.type('telefon do banku', { delay: 5 }); await tap(dz3, 'szybko');
        await v.page.clock.runFor(60000); await v.page.keyboard.type(' · start: ktoś', { delay: 5 });
        const zm = card(v.page, 'SR tygodnia').locator('.chead .act');
        if (mode === 'playwright') await zm.click(); else await zm.evaluate(b => b.click());
        await v.page.clock.runFor(3000); await v.page.waitForTimeout(50);
        const r = await v.page.evaluate(() => ({ onMap: !!document.querySelector('#s-dzis svg.map'), srOpen: [...document.querySelectorAll('#s-dzis .card')].some(c => c.querySelector('h2').textContent === 'SR tygodnia' && !c.classList.contains('collapsed')) }));
        if (!r.onMap) { await card(v.page, 'SR tygodnia').locator('.sr').nth(0).locator('.chip').nth(3).click(); await v.page.clock.runFor(3000); await v.page.waitForTimeout(50); }
        r.afterChange = { onMap: await onMap(v.page), typ: (await store(v.page)).days[KEY(7)].sr.typ, diary: (await store(v.page)).days[KEY(7)].diary };
        r.errors = v.page.__errors; res[mode] = r; await v.c.close();
      }
      log('R6.zmienAfterDiary', res);
      verdict('R6', ['playwright', 'domclick'].every(m => !res[m].onMap && res[m].srOpen && !res[m].afterChange.onMap && res[m].afterChange.typ === 3 && res[m].afterChange.diary === 'telefon do banku · start: ktoś'),
        'day 7 done by diary, 60 s later „Zmień” on SR tygodnia (playwright click / DOM click): ' + JSON.stringify(res));
    }
  });

  // ===== R7: no console errors on any tab, days 1,2,7,8,15,22,85 =====
  await section('R7', async () => {
    const res = {};
    for (const n of [1, 2, 7, 8, 15, 22, 84, 85]) {
      const { c, page } = await ctx(browser, { time: D(n) });
      await page.goto(URL); await page.waitForTimeout(100);
      const steps = [];
      const opened = await openToday(page);
      if (!opened) { // today beyond the map: open the last island, then arrow forward
        const last = page.locator('#s-dzis .island').last();
        await last.click(); await page.waitForTimeout(50);
        for (let i = 0; i < 3; i++) { const nx = page.locator('#s-dzis .arrow[aria-label="Następny dzień"]'); if (await nx.count() && !(await nx.isDisabled())) { await nx.click(); await page.waitForTimeout(50); } }
        steps.push('noTodayIsland');
      }
      steps.push('session:' + await page.evaluate(() => (document.querySelector('#s-dzis h1') || {}).textContent));
      // expand every card
      const heads = page.locator('#s-dzis .card.collapsed .chead');
      for (let i = await heads.count(); i > 0; i--) { await page.locator('#s-dzis .card.collapsed .chead').first().click(); await page.waitForTimeout(20); }
      await page.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true));
      steps.push('cards:' + (await cardTitles(page)).join('|'));
      for (const t of ['ocena', 'postepy', 'sciagawka', 'dzis']) {
        await tab(page, t);
        if (t === 'postepy') { await page.locator('#s-postepy .card').filter({ has: page.locator('h2', { hasText: 'Hierarchia' }) }).locator('.chead').click(); await page.waitForTimeout(30); }
      }
      // on the map: open a locked island sheet if any, then the back/forward arrows on today's session
      const locked = page.locator('#s-dzis .island.st-locked');
      if (await locked.count()) { await locked.first().click(); await page.waitForTimeout(30); steps.push('sheet:' + (await page.locator('#sheet h2').innerText())); }
      await page.clock.runFor(1000);
      res[n] = { steps, errors: page.__errors, warnings: page.__warn };
      await c.close();
    }
    log('R7.days', res);
    verdict('R7', res[85].steps.includes('session:Dzień 85'), 'day 85 session opens (arrow from day 84): ' + JSON.stringify(res[85].steps.slice(0, 2)));
    const bad = Object.keys(res).filter(n => res[n].errors.length);
    verdict('R7', bad.length === 0, bad.length ? 'errors on days ' + bad.join(',') + ': ' + bad.map(n => n + ' ' + JSON.stringify(res[n].errors.slice(0, 2))).join('; ') : 'no console/page errors on days 1,2,7,8,15,22,84,85 across all tabs');
  });

  // ===== v5 regression (review round): R8 G7 banner / point 9, R9 G5–G6, R10 A2/D3, R11 J8 + points 8 and 10, R12 tones, R13 ★ vs monolog language =====
  const MAND = (lang) => ({ done: ['oddech', 'sygnal', 'monolog'], reps: { oddech: 12, sygnal: 10 }, oddechBrzuch: 'tak', monolog: { ran: true, breath: 'tak', sr: 2, lang, topic: 1 } });
  const seeded = (obj) => `if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('plynnosc', ${JSON.stringify(JSON.stringify(obj))}); }`;
  const bannerInfo = (page) => page.evaluate(() => { const b = [...document.querySelectorAll('#s-dzis .card.done')].find(c => c.querySelector('h2').textContent === 'Sesja zrobiona'); return b ? { buttons: [...b.querySelectorAll('button')].map(x => x.textContent) } : null; });
  await section('R8', async () => {
    // (a) weeks 1–3, ★ not done: banner with „Na mapę” + „★ Jeszcze monolog”, no auto-return; ★ done afterwards -> auto-return and a star on the island
    {
      const { c, page } = await ctx(browser, { time: D(3), init: seeded({ v: 2, days: { [KEY(3)]: MAND('pl') } }) });
      await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
      await tap(await expand(page, 'Dziennik bloków'), 'nie');
      const banner = await bannerInfo(page);
      await page.clock.runFor(3500); await page.waitForTimeout(50);
      const stillSession = !(await onMap(page));
      await page.locator('#s-dzis button', { hasText: '★ Jeszcze monolog' }).click(); await page.waitForTimeout(50);
      const ex = card(page, '★ Monolog w drugim języku');
      const exOpen = await ex.evaluate(c => !c.classList.contains('collapsed'));
      await ex.locator('button', { hasText: 'Już mówiłem' }).click(); await tap(card(page, '★ Monolog w drugim języku'), 'tak');
      await card(page, '★ Monolog w drugim języku').locator('.sr .chip').nth(3).click();
      await page.clock.runFor(2500); await page.waitForTimeout(50);
      const after = await page.evaluate((k) => ({ onMap: !!document.querySelector('#s-dzis svg.map'), star: !!document.querySelector(`#s-dzis .island[data-k="${k}"] polygon.star`) }), KEY(3));
      log('R8.g7', { banner, stillSession, exOpen, after, errors: page.__errors });
      verdict('R8', banner && banner.buttons.join('|') === 'Na mapę|★ Jeszcze monolog EN' && stillSession && exOpen && after.onMap && after.star,
        'G7: banner ' + JSON.stringify(banner) + ', 3.5 s later still in session ' + stillSession + ', ★ button opens the card ' + exOpen + ', ★ done -> map ' + after.onMap + ', star ' + after.star);
      await c.close();
    }
    // „Na mapę” works (pop animation on the island)
    {
      const { c, page } = await ctx(browser, { time: D(3), init: seeded({ v: 2, days: { [KEY(3)]: MAND('pl') } }) });
      await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
      await tap(await expand(page, 'Dziennik bloków'), 'nie');
      await page.locator('#s-dzis button', { hasText: 'Na mapę' }).click(); await page.waitForTimeout(50);
      const r = await page.evaluate((k) => ({ onMap: !!document.querySelector('#s-dzis svg.map'), pop: !!document.querySelector(`#s-dzis .island.pop[data-k="${k}"]`), done: !!document.querySelector(`#s-dzis .island.st-done[data-k="${k}"]`) }), KEY(3));
      log('R8.naMape', { r, errors: page.__errors });
      verdict('R8', r.onMap && r.pop && r.done, '„Na mapę” -> map ' + JSON.stringify(r));
      await c.close();
    }
    // point 9: last diary tap on the „tak” path with an empty note (★ already done): banner with „Na mapę”, no auto-return; „nie” path keeps B25
    {
      const out = {};
      for (const path of ['takEmpty', 'nie']) {
        const seed = MAND('pl'); seed.extra = EXTRA_DONE;
        const { c, page } = await ctx(browser, { time: D(3), init: seeded({ v: 2, days: { [KEY(3)]: seed } }) });
        await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
        const dz = await expand(page, 'Dziennik bloków');
        if (path === 'takEmpty') await tap(dz, 'tak', 'ktoś', 'PL', 'szybko'); else await tap(dz, 'nie');
        const banner = await bannerInfo(page);
        await page.clock.runFor(3500); await page.waitForTimeout(50);
        out[path] = { banner, onMap: await onMap(page), complete: (await store(page)).days[KEY(3)].complete, errors: page.__errors };
        await c.close();
      }
      log('R8.point9', out);
      verdict('R8', out.takEmpty.banner && out.takEmpty.banner.buttons.join('|') === 'Na mapę' && !out.takEmpty.onMap && out.takEmpty.complete && out.nie.onMap && out.nie.complete,
        '„tak” + 3 taps, empty note: banner ' + JSON.stringify(out.takEmpty.banner) + ', onMap after 3.5 s ' + out.takEmpty.onMap + '; „nie”: onMap ' + out.nie.onMap);
    }
  });

  await section('R9', async () => {
    // G5/G6: ★ does not count. Day 2: mandatory done, no ★ -> done. Day 3: ★ done, mandatory not -> not done, streak unaffected.
    const seed = { v: 2, days: { [KEY(2)]: Object.assign(MAND('pl'), { done: ['oddech', 'sygnal', 'monolog', 'dziennik'], blok: { jest: false } }), [KEY(3)]: { done: ['oddech'], reps: { oddech: 12 }, oddechBrzuch: 'tak', extra: EXTRA_DONE } } };
    const { c, page } = await ctx(browser, { time: D(4), init: seeded(seed) });
    await page.goto(URL); await page.waitForTimeout(100);
    const isl = await page.evaluate((ks) => ks.map(k => { const g = document.querySelector(`#s-dzis .island[data-k="${k}"]`); return { cls: g.getAttribute('class'), star: !!g.querySelector('polygon.star') }; }), [KEY(2), KEY(3)]);
    const header = await page.locator('#s-dzis header p').innerText();
    await tab(page, 'postepy');
    const post = await page.evaluate(() => ({ stats: [...document.querySelectorAll('#s-postepy .stat b')].map(b => b.textContent), text: document.querySelector('#s-postepy').innerText }));
    const st = await store(page);
    log('R9.result', { isl, header, stats: post.stats, complete: [st.days[KEY(2)].complete, st.days[KEY(3)].complete], errors: page.__errors });
    verdict('R9', /st-done/.test(isl[0].cls) && !isl[0].star && !/st-done/.test(isl[1].cls) && isl[1].star && /streak 0 dni/.test(header) && post.stats[1] === '2' && /★ zrobione: 1 dzień/.test(post.text) && st.days[KEY(3)].complete === false,
      'G5 day 2 (no ★) ' + isl[0].cls + '; G6 day 3 (★ only) ' + isl[1].cls + ' star ' + isl[1].star + '; header "' + header + '"; sessions ' + post.stats[1] + '; „★ zrobione: 1 dzień” ' + /★ zrobione: 1 dzień/.test(post.text));
    await c.close();
  });

  await section('R10', async () => {
    // A2–A5 / D1–D5 from the page's own functions (sliced from the script), days 2–84, computed in two orders; cross-check with the UI
    const src = fs.readFileSync(APP, 'utf8');
    const body = src.slice(src.indexOf('  var A_HARD_FROM_WEEK'), src.indexOf('  function isSrDay(k)'));
    const make = () => new Function('function weekOf(d){return Math.min(12,Math.max(1,Math.ceil(d/7)));} function dayIndex(k){return k;}\n' + body + '\nreturn {oddechWords, signalQuestions, SIGNAL_PL, SIGNAL_EN, A_POOL1, A_POOL2, A_HARD_FROM_WEEK};')();
    const M = make(), M2 = make();
    const topic = {}; M.SIGNAL_PL.concat(M.SIGNAL_EN).forEach(x => { topic[x.q] = x.t; });
    const W = {}, Q = {}, bad = [];
    for (let d = 2; d <= 84; d++) { W[d] = M.oddechWords(d).map(x => x.w); Q[d] = M.signalQuestions(d, 10); }
    for (let d = 84; d >= 2; d--) { if (M2.oddechWords(d).map(x => x.w).join() !== W[d].join()) bad.push('A6 det ' + d); if (M2.signalQuestions(d, 10).join() !== Q[d].join()) bad.push('D4 det ' + d); }
    for (let d = 2; d <= 84; d++) {
      const w = W[d], hard = Math.ceil(d / 7) >= M.A_HARD_FROM_WEEK;
      if (w.length !== 4 || w.some(x => !x)) bad.push('A1 ' + d);
      if (d % 2 ? w[3] !== 'Aleksander' : w.includes('Aleksander')) bad.push('A3 ' + d);
      if (hard ? !(M.A_POOL2.includes(w[0]) && M.A_POOL2.includes(w[1]) && !M.A_POOL2.includes(w[2])) : w.some(x => M.A_POOL2.includes(x))) bad.push('A4/A5 ' + d);
      const q = Q[d];
      if (q.length !== 10 || q.some(x => !x || x === 'undefined')) bad.push('D5 ' + d);
      if (new Set(q.map(x => topic[x])).size !== 10) bad.push('D2 ' + d);
      if (q.map(x => M.SIGNAL_EN.some(e => e.q === x) ? 'EN' : 'PL').join() !== 'PL,EN,PL,EN,PL,PL,EN,PL,EN,PL') bad.push('D1 ' + d);
    }
    for (let s0 = 2; s0 + 6 <= 84; s0++) {
      const ws = [], qs = []; for (let d = s0; d < s0 + 7; d++) { ws.push(...W[d].filter(x => x !== 'Aleksander')); qs.push(...Q[d]); }
      if (new Set(ws).size !== ws.length) bad.push('A2 window ' + s0); if (new Set(qs).size !== qs.length) bad.push('D3 window ' + s0);
    }
    const ui = {};
    for (const n of [3, 16]) {
      const { c, page } = await ctx(browser, { time: D(n) }); await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
      ui[n] = await card(page, 'Oddech A').evaluate(c => c.querySelector('.words').textContent); ui[n + 'err'] = page.__errors; await c.close();
    }
    const uiOk = [3, 16].every(n => ui[n] === 'Słowa dnia: ' + W[n].join(' · '));
    log('R10.result', { pools: [M.SIGNAL_PL.length, M.SIGNAL_EN.length, M.A_POOL1.length, M.A_POOL2.length], bad: bad.slice(0, 20), ui, errors: ui['3err'].concat(ui['16err']) });
    verdict('R10', bad.length === 0 && uiOk, 'days 2–84: ' + (bad.length ? bad.length + ' violations ' + JSON.stringify(bad.slice(0, 5)) : '7-day window, topic rule, Aleksander parity, pool 2 from week ' + M.A_HARD_FROM_WEEK + ', determinism – 0 violations') + '; UI words match functions on days 3 and 16: ' + uiOk);
  });

  await section('R11', async () => {
    // J8 + point 8: legacy text entry counts and keeps completion after „tak”; a day without the complete flag never loses completion. Point 10: „Edytuj” comes back.
    const seed = { v: 2, days: {
      [KEY(2)]: Object.assign(MAND('pl'), { done: ['oddech', 'sygnal', 'monolog', 'dziennik'], diary: 'rozmowa · start: ktoś · EN · szybko' }), // v4 text, no complete flag
      [KEY(3)]: Object.assign(MAND('pl'), { done: ['oddech', 'sygnal', 'monolog', 'dziennik'], blok: { jest: false } }) // tapped „nie”, no complete flag
    } };
    const { c, page } = await ctx(browser, { time: D(4), init: seeded(seed) });
    await page.goto(URL); await page.waitForTimeout(100);
    await tab(page, 'postepy');
    const line = await page.evaluate(() => { const c = [...document.querySelectorAll('#s-postepy .card')].find(x => x.querySelector('h2').textContent === 'Dziennik bloków (14 dni)'); return c && c.querySelector('p').textContent; });
    await tab(page, 'dzis');
    const res = {};
    for (const n of [2, 3]) {
      await page.locator(`#s-dzis .island[data-k="${KEY(n)}"]`).click(); await page.waitForTimeout(50);
      await card(page, 'Dziennik bloków').locator('.chead .act').click(); await page.waitForTimeout(50);
      await tap(card(page, 'Dziennik bloków'), 'tak'); await flush(page);
      const dz = await card(page, 'Dziennik bloków').evaluate(c => ({ done: c.classList.contains('done'), small: c.querySelector('small').textContent }));
      const st = await store(page);
      res[n] = { dz, done: st.days[KEY(n)].done.includes('dziennik'), complete: st.days[KEY(n)].complete };
      await page.locator('#s-dzis .back').click(); await page.waitForTimeout(50);
    }
    const isl = await page.evaluate((ks) => ks.map(k => /st-done/.test(document.querySelector(`#s-dzis .island[data-k="${k}"]`).getAttribute('class'))), [KEY(2), KEY(3)]);
    const header = await page.locator('#s-dzis header p').innerText();
    // point 10: today „nie” -> „tak” (unmarked) -> ja / PL / wolno: done again with „Edytuj” in the header
    await openToday(page);
    const dz4 = await expand(page, 'Dziennik bloków');
    await tap(dz4, 'nie'); const act1 = await dz4.locator('.chead .act').count();
    await tap(dz4, 'tak'); const mid = await dz4.evaluate(c => ({ done: c.classList.contains('done'), act: c.querySelectorAll('.chead .act').length }));
    await page.locator('#s-dzis textarea').fill('notatka'); await tap(dz4, 'ja', 'PL', 'wolno');
    const fin = await dz4.evaluate(c => ({ done: c.classList.contains('done'), act: [...c.querySelectorAll('.chead .act')].map(b => b.textContent) }));
    log('R11.result', { line, res, isl, header, act1, mid, fin, errors: page.__errors });
    verdict('R11', line === 'Wpisy: 2 · z blokiem: 1 · start ktoś: 1/1 · szybko: 1/1 · EN: 1/1', 'J8: legacy text counted with block, facts parsed: "' + line + '"');
    verdict('R11', res[2].dz.done && res[2].done && isl[0] && isl[1] && res[3].complete === true && !res[3].done && /streak 3 dni/.test(header),
      'point 8: legacy entry + „tak” stays done ' + JSON.stringify(res[2]) + '; tapped entry + „tak” unmarked but day stays complete ' + JSON.stringify(res[3]) + '; islands done ' + JSON.stringify(isl) + ', "' + header + '"');
    verdict('R11', act1 === 1 && !mid.done && mid.act === 0 && fin.done && fin.act.join() === 'Edytuj', 'point 10: „Edytuj” after „nie” ' + act1 + ', after „tak” ' + JSON.stringify(mid) + ', after full choices ' + JSON.stringify(fin));
    await c.close();
  });

  await section('R12', async () => {
    // tone order on a fake AudioContext: Start = inhale (rising), +3 s exhale (falling), every exhale end 1–11 = inhale, end of rep 12 = only the final beep
    const fake = `(() => { window.__tl = []; class F { constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; } resume() { return Promise.resolve(); }
      createOscillator() { const rec = { t: Date.now() }; window.__tl.push(rec); return { type: '', frequency: { set value(v) { rec.kind = v === 660 ? 'end' : 'beep'; }, setValueAtTime(v) { if (!rec.kind) rec.kind = v === 392 ? 'wdech' : v === 587 ? 'wydech' : 'f' + v; }, linearRampToValueAtTime() {} }, connect() {}, start() {}, stop() {} }; }
      createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; } }
      window.AudioContext = F; window.webkitAudioContext = F; })();`;
    const { c, page } = await ctx(browser, { time: D(2), init: fake });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    const t0 = await page.evaluate(() => Date.now());
    await card(page, 'Oddech A').locator('.timer button.big').click();
    await page.clock.runFor(121000); await page.waitForTimeout(50);
    const tl = (await page.evaluate(() => window.__tl)).map(r => ({ kind: r.kind, at: Math.round((r.t - t0) / 100) / 10 }));
    const kinds = tl.map(r => r.kind);
    const expect = []; for (let i = 0; i < 12; i++) expect.push('wdech', 'wydech'); expect.push('end');
    const timesOk = tl.length === 25 && tl.every((r, i) => i === 24 ? Math.abs(r.at - 120) <= 0.5 : Math.abs(r.at - (Math.floor(i / 2) * 10 + (i % 2) * 3)) <= 0.5);
    log('R12.tones', { kinds, at: tl.map(r => r.at), errors: page.__errors });
    verdict('R12', kinds.join() === expect.join() && timesOk, 'tones: ' + kinds.slice(0, 4).join(',') + ' … ' + kinds.slice(-3).join(',') + ' (' + kinds.length + '), times ' + JSON.stringify(tl.slice(0, 3).map(r => r.at)) + ' … ' + tl[tl.length - 1].at + ' s; times ok ' + timesOk);
    await c.close();
  });

  await section('R13', async () => {
    // point 7: once ★ started, the monolog takes the other language and hides PL/EN; point 3: ★ in progress stays expanded after reload
    const out = {};
    for (const sc of ['default', 'monoPL']) {
      const { c, page } = await ctx(browser, { time: D(2) });
      await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
      if (sc === 'monoPL') { const mo = await expand(page, 'Luźny monolog'); await mo.locator('.seg button', { hasText: 'PL' }).click(); }
      const ex = await expand(page, '★ Monolog w drugim języku');
      const exTag = await ex.locator('.topic .tag').innerText();
      await ex.locator('button', { hasText: 'Już mówiłem' }).click(); await page.waitForTimeout(50);
      const mono = async () => (await expand(page, 'Luźny monolog')).evaluate(c => ({ segVisible: !!c.querySelector('.seg') && !c.querySelector('.seg').classList.contains('hidden'), note: (c.querySelector('.langnote:not(.hidden)') || {}).textContent || null, cue: c.querySelector('.cue').textContent }));
      const live = await mono();
      await flush(page); await page.reload(); await page.waitForTimeout(100); await openToday(page);
      const exOpenAfterReload = await card(page, '★ Monolog w drugim języku').evaluate(c => !c.classList.contains('collapsed'));
      const reloaded = await mono();
      out[sc] = { exTag, live, reloaded, exOpenAfterReload, errors: page.__errors }; await c.close();
    }
    // banner label from extra.lang when ★ started (monolog done in the same language)
    {
      const seed = MAND('en'); seed.done.push('dziennik'); seed.blok = { jest: false }; seed.extra = { lang: 'en', topic: 2, ran: true, breath: null, sr: null, done: false };
      const { c, page } = await ctx(browser, { time: D(2), init: seeded({ v: 2, days: { [KEY(2)]: seed } }) });
      await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
      out.banner = await bannerInfo(page); out.bannerErrors = page.__errors; await c.close();
    }
    log('R13.result', out);
    verdict('R13', /po polsku/i.test(out.default.exTag) && !out.default.live.segVisible && out.default.live.note === 'Język: EN – ★ była po polsku' && out.default.live.cue === 'Mów po angielsku' && out.default.reloaded.note === 'Język: EN – ★ była po polsku' && !out.default.reloaded.segVisible,
      'day 2 (monolog EN): ★ ' + out.default.exTag + '; after ★ started monolog ' + JSON.stringify(out.default.live) + '; after reload ' + JSON.stringify(out.default.reloaded));
    verdict('R13', /po angielsku/i.test(out.monoPL.exTag) && out.monoPL.live.note === 'Język: PL – ★ była po angielsku' && out.monoPL.live.cue === 'Mów po polsku' && out.monoPL.reloaded.note === 'Język: PL – ★ była po angielsku',
      'monolog switched to PL first: ★ ' + out.monoPL.exTag + ', monolog ' + JSON.stringify(out.monoPL.live));
    verdict('R13', out.default.exOpenAfterReload && out.monoPL.exOpenAfterReload, 'point 3: ★ in progress expanded after reload: ' + out.default.exOpenAfterReload + ', ' + out.monoPL.exOpenAfterReload);
    verdict('R13', out.banner && out.banner.buttons.join('|') === 'Na mapę|★ Jeszcze monolog EN', 'banner label from extra.lang: ' + JSON.stringify(out.banner));
  });

  await browser.close();
  // every console/page error logged anywhere (also nested, e.g. R1.detail.*Errors) fails the run
  const errs = []; (function scan(o, p) { if (!o || typeof o !== 'object') return; for (const k of Object.keys(o)) { if (/errors$/i.test(k) && Array.isArray(o[k]) && o[k].length) errs.push(p + k + ': ' + JSON.stringify(o[k]).slice(0, 200)); else scan(o[k], p + k + '.'); } })(R, '');
  ALL_PAGES.forEach((p, i) => { if (p.__errors.length && !errs.length) errs.push('page#' + i + ': ' + JSON.stringify(p.__errors).slice(0, 200)); });
  verdict('ERR', errs.length === 0, errs.length ? errs.join('; ') : 'no console/page errors in any section');
  R.verdicts = V;
  fs.writeFileSync(OUT + 'round3_results.json', JSON.stringify(R, null, 1));
  console.log('\nSUMMARY');
  Object.keys(V).forEach(k => console.log(k, V[k].every(x => x.ok) ? 'PASS' : 'FAIL', '(' + V[k].filter(x => x.ok).length + '/' + V[k].length + ')'));
  if (Object.keys(V).some(k => !V[k].every(x => x.ok))) process.exitCode = 1; // a FAIL verdict must not look green
})().catch(e => { console.error('FATAL', e); process.exit(1); });
