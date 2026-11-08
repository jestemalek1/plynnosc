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

async function ctx(browser, opts = {}) {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: UA, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await c.newPage();
  page.__errors = []; page.__warn = [];
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
    log('R1.detail', res);
  });

  // ===== R2: Oddech A with 3 s inhale =====
  await section('R2', async () => {
    const { c, page } = await ctx(browser, { time: D(2) });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    const od = card(page, 'Oddech A');
    const snap = () => od.evaluate(c => ({ cue: c.querySelector('.cue').textContent, sub: c.querySelector('.sub').textContent, clock: c.querySelector('.clock').textContent, reps: c.querySelector('.reps').textContent, gap: c.querySelector('.timer').classList.contains('gap'), bar: c.querySelector('.bar i').style.width }));
    const insText = await od.evaluate(c => c.querySelector('.brief').innerText + '\n' + c.querySelector('.ins').innerText + '\n' + [...c.querySelectorAll('.note')].map(n => n.textContent).join('\n'));
    await od.locator('.timer button.big').click();
    const t = {};
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
    const st = await store(page);
    const done = await page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Oddech A'); return { done: c.classList.contains('done'), small: c.querySelector('small').textContent }; });
    log('R2.timeline', t); log('R2.done', { done, reps: st.days[KEY(2)].reps, doneList: st.days[KEY(2)].done });
    log('R2.instructions', insText);
    const gapOk = t['7.1'].gap && t['7.1'].cue === 'Wdech nosem' && t['7.1'].clock === '0:03' && /następne: fff/.test(t['7.1'].sub) && t['8.1'].clock === '0:02' && t['9.1'].clock === '0:01' && t['9.8'].gap && !t['10.3'].gap && t['10.3'].cue === 'fff';
    verdict('R2', gapOk, 'gap after rep1: t7.1 ' + JSON.stringify(t['7.1']) + ' t8.1 clock ' + t['8.1'].clock + ', t9.1 ' + t['9.1'].clock + ', t9.8 gap=' + t['9.8'].gap + ', t10.3 cue ' + t['10.3'].cue + ' reps "' + t['10.3'].reps + '"');
    verdict('R2', t['77.3'].gap && /następne: Aleksander/.test(t['77.3'].sub) && t['80.3'].cue === 'Aleksander', 'word cue visible during inhale: t77.3 sub "' + t['77.3'].sub + '", t80.3 cue ' + t['80.3'].cue);
    verdict('R2', done.done && st.days[KEY(2)].reps.oddech === 12 && st.days[KEY(2)].done.includes('oddech'), 'completes at 117 s: ' + JSON.stringify(done) + ' reps.oddech=' + st.days[KEY(2)].reps.oddech);
    verdict('R2', /Bez zatrzymania na górze wdechu/.test(insText) && /Nie zatrzymuj powietrza na górze wdechu/.test(insText) && /3 s/.test(insText), 'instructions mention 3 s inhale and no stop at the top of the inhale');
    log('R2.errors', page.__errors); await c.close();
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
        await dz.locator('textarea').click(); await page.keyboard.type('daily po polsku · start: ja', { delay: 2 });
        await page.evaluate(() => document.activeElement.blur()); await page.clock.runFor(2500); await page.waitForTimeout(50);
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
    let s = await snap(); prev = s.wait ? 'wait' : 'answer'; events.push({ t, ph: prev, cue: s.cue });
    while (t < 200000) {
      await page.clock.runFor(100); t += 100;
      const cur = await page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Start na sygnał'); if (!c) return { gone: true }; const tm = c.querySelector('.timer'); return { cue: tm ? c.querySelector('.cue').textContent : null, wait: tm ? tm.classList.contains('wait') : null, done: c.classList.contains('done'), reps: tm ? c.querySelector('.reps').textContent : null }; });
      if (cur.done || cur.gone) { events.push({ t, ph: 'done' }); break; }
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
    const seed = { v: 2, days: { [KEY(2)]: { done: ['oddech', 'sygnal', 'monolog'], reps: { oddech: 12, sygnal: 10 }, monolog: { ran: true, breath: 'tak', sr: 2, lang: 'en', topic: 1 } } } };
    for (const variant of ['typing', 'chip']) {
      const { c, page } = await ctx(browser, { time: D(2), init: `localStorage.setItem('plynnosc', ${JSON.stringify(JSON.stringify(seed))})` });
      await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
      const dz = await expand(page, 'Dziennik bloków');
      const ta = dz.locator('textarea');
      if (variant === 'typing') { await ta.click(); await page.keyboard.type('rozmowa z kolegą', { delay: 5 }); }
      else { await dz.locator('.tags button', { hasText: 'start: ktoś' }).click(); await dz.locator('.tags button', { hasText: 'szybko' }).click(); }
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
    const bad = Object.keys(res).filter(n => res[n].errors.length);
    verdict('R7', bad.length === 0, bad.length ? 'errors on days ' + bad.join(',') + ': ' + bad.map(n => n + ' ' + JSON.stringify(res[n].errors.slice(0, 2))).join('; ') : 'no console/page errors on days 1,2,7,8,15,22,84,85 across all tabs');
  });

  await browser.close();
  R.verdicts = V;
  fs.writeFileSync(OUT + 'round3_results.json', JSON.stringify(R, null, 1));
  console.log('\nSUMMARY');
  Object.keys(V).forEach(k => console.log(k, V[k].every(x => x.ok) ? 'PASS' : 'FAIL', '(' + V[k].filter(x => x.ok).length + '/' + V[k].length + ')'));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
