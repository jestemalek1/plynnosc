// Round 2 acceptance tests for app/index.html (updated in round 3: 3 s breath gap, Start na sygnał, weekly SR)
const { chromium } = require('playwright');
const path = require('path');
const APP = path.resolve(__dirname, '..', 'app', 'index.html');
const fs = require('fs');
const URL = 'file://' + APP;
const OUT = __dirname + '/';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const R = {};
function log(k, v) { R[k] = v; console.log(k, JSON.stringify(v)); }

async function ctx(browser, opts = {}) {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: UA, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await c.newPage();
  page.__errors = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') page.__errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => page.__errors.push('PAGEERROR ' + e.message));
  if (opts.init) await page.addInitScript(opts.init);
  if (opts.time) await page.clock.install({ time: opts.time });
  return { c, page };
}
async function openToday(pg) { // map entry flow: open today's island to reach the day session
  try { const isl = pg.locator('#s-dzis .island.st-today'); if (await isl.count() && await isl.first().isVisible()) { await isl.first().click(); await pg.waitForTimeout(50); } } catch (e) { /* not on map */ }
}
async function tab(page, id) { await page.click(`#tabs button[data-id="${id}"]`); await page.waitForTimeout(60); }
async function shot(page, name, full = true) { const p = OUT + 'r2_' + name + '.png'; await page.screenshot({ path: p, fullPage: full }); return p; }
const txt = (page, sel) => page.locator(sel).first().innerText();
const flush = async (page) => { await page.clock.runFor(400); await page.waitForTimeout(30); };
const store = (page) => page.evaluate(() => { try { return JSON.parse(localStorage.getItem('plynnosc')); } catch (e) { return 'ERR ' + e.message; } });
function cardByTitle(page, title) { return page.locator('#s-dzis .card').filter({ has: page.locator('h2', { hasText: title }) }); }
async function section(name, fn) {
  try { await fn(); } catch (e) { log(name + '.EXCEPTION', String(e && e.stack || e)); }
}

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  // ================= A: "Od nowa" after 5 reps =================
  await section('A', async () => {
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0) });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    const od = cardByTitle(page, 'Oddech A');
    const snap = async () => ({ cue: await od.locator('.cue').innerText(), sub: await od.locator('.sub').innerText(), clock: await od.locator('.clock').innerText(), reps: await od.locator('.reps').innerText(), btn: await od.locator('.timer button.big').innerText() });
    await od.locator('.timer button.big').click();
    await page.clock.runFor(51000); // v4: first inhale 3 s + 5 x (7 s + 3 s) -> 5 reps complete at t=50s, now in gap before rep 6
    log('A.after5reps', await snap());
    await flush(page);
    log('A.storeReps5', (await store(page)).days['2026-11-08'].reps);
    await od.locator('button', { hasText: 'Od nowa' }).click();
    await page.waitForTimeout(50);
    log('A.afterReset', await snap());
    await flush(page);
    log('A.storeRepsAfterReset', (await store(page)).days['2026-11-08'].reps);
    await shot(page, 'A_after_od_nowa', false);
    await od.locator('.timer button.big').click();
    await page.clock.runFor(1000);
    log('A.restart1s', await snap());
    await page.clock.runFor(6500);
    log('A.restart7_5s', await snap());
    // variant: reload with reps=5 persisted, then Od nowa
    await c.close();
    const v = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0), init: `localStorage.setItem('plynnosc', JSON.stringify({days:{'2026-11-08':{reps:{oddech:5}}}}))` });
    await v.page.goto(URL); await v.page.waitForTimeout(100); await openToday(v.page);
    const od2 = cardByTitle(v.page, 'Oddech A');
    const snap2 = async () => ({ cue: await od2.locator('.cue').innerText(), sub: await od2.locator('.sub').innerText(), reps: await od2.locator('.reps').innerText() });
    log('A.variantReloadReps5', await snap2());
    await od2.locator('button', { hasText: 'Od nowa' }).click(); await v.page.waitForTimeout(50);
    log('A.variantAfterReset', await snap2());
    log('A.errors', page.__errors.concat(v.page.__errors));
    await v.c.close();
  });

  // ================= B: Oceń persistence + mocked streaming =================
  await section('B', async () => {
    const TRANSCRIPT = 'So um yesterday I I went to the the beach and um the waves were like really big... I mean I mean it was scary but uh I tried anyway. I tried anyway and it was uh fine.';
    const mock = `window.claude = { use: async function (n) { return n === 'sample' ? async function (prompt, opts) { const full = '**Płynność**\\nDużo wypełniaczy: „um", „uh". Powtórzenia „I I", „the the".\\n**Angielski**\\n| powiedziałeś | lepiej |\\n|---|---|\\n| really big | huge |\\n**Treść i samorozwój**\\nOdwaga mimo strachu.\\n**Zadanie na jutro**\\nFrazy po 3 słowa.'; let acc = ''; for (const ch of full.split(' ')) { acc += (acc ? ' ' : '') + ch; opts.onText({ text: acc }); await new Promise(r => setTimeout(r, 5)); } return { text: full }; } : null; } };`;
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0), init: mock });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    await tab(page, 'ocena');
    await page.fill('#s-ocena textarea[aria-label="Transkrypt"]', TRANSCRIPT);
    await page.selectOption('#s-ocena select', 'en');
    await page.fill('#s-ocena input[aria-label="Czas trwania"]', '0:30');
    await page.fill('#s-ocena input[aria-label="O czym"]', 'plaża');
    await page.locator('#s-ocena .sr .chip').nth(3).click();
    const readForm = () => page.evaluate(() => ({ text: document.querySelector('#s-ocena textarea[aria-label="Transkrypt"]').value.length, lang: document.querySelector('#s-ocena select').value, dur: document.querySelector('#s-ocena input[aria-label="Czas trwania"]').value, note: document.querySelector('#s-ocena input[aria-label="O czym"]').value, sr: (document.querySelector('#s-ocena .sr .chip.on') || {}).textContent || null, meaning: document.querySelector('#s-ocena .sr .meaning').textContent, metrics: [...document.querySelectorAll('#s-ocena .metrics b')].map(b => b.textContent) }));
    log('B.form', await readForm());
    await tab(page, 'sciagawka'); await tab(page, 'ocena');
    log('B.formAfterTabSwitch', await readForm());
    await flush(page);
    await page.reload(); await page.waitForTimeout(150); await openToday(page);
    log('B.hashAfterReload', await page.evaluate(() => location.hash + ' tab=' + document.querySelector('#tabs button.on').dataset.id));
    log('B.formAfterReload', await readForm());
    // mocked evaluation
    await page.waitForTimeout(100);
    log('B.btnAIVisible', await page.locator('#s-ocena button', { hasText: 'Oceń z Claude' }).isVisible());
    await page.locator('#s-ocena button', { hasText: 'Oceń z Claude' }).click();
    await page.clock.runFor(30); await page.waitForTimeout(20);
    log('B.streamingMid', await page.evaluate(() => ({ status: document.querySelector('#s-ocena .status').textContent, result: document.querySelector('#s-ocena .result').textContent.slice(0, 80), isMd: document.querySelector('#s-ocena .result').classList.contains('md') })));
    await page.clock.runFor(2000); await page.waitForTimeout(100);
    log('B.streamingDone', await page.evaluate(() => ({ status: document.querySelector('#s-ocena .status').textContent, h4s: [...document.querySelectorAll('#s-ocena .result h4')].map(x => x.textContent), tableRows: document.querySelectorAll('#s-ocena .result table tr').length, isMd: document.querySelector('#s-ocena .result').classList.contains('md'), listItems: document.querySelectorAll('#s-ocena .alist .item').length })));
    await shot(page, 'B_ocena_answer');
    await tab(page, 'dzis'); await tab(page, 'ocena');
    log('B.answerAfterTabSwitch', await page.evaluate(() => ({ h4s: [...document.querySelectorAll('#s-ocena .result h4')].map(x => x.textContent).length, visible: document.querySelector('#s-ocena .result').getBoundingClientRect().height > 0 })));
    await flush(page); await page.reload(); await page.waitForTimeout(150); await openToday(page);
    log('B.answerAfterReload', await page.evaluate(() => ({ h4s: [...document.querySelectorAll('#s-ocena .result h4')].map(x => x.textContent).length, items: document.querySelectorAll('#s-ocena .alist .item').length })));
    log('B.errors', page.__errors);
    await c.close();
  });

  // ================= C: tab tap renders once; Dziś tap does not stop timer =================
  await section('C', async () => {
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0) });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    await page.evaluate(() => {
      window.__mut = { dzis: 0, ocena: 0, postepy: 0, sciagawka: 0, headers: { dzis: 0, ocena: 0, postepy: 0, sciagawka: 0 } };
      ['dzis', 'ocena', 'postepy', 'sciagawka'].forEach(id => {
        new MutationObserver(recs => { recs.forEach(r => { window.__mut[id]++; r.addedNodes.forEach(n => { if (n.nodeType === 1 && n.matches && n.matches('header.top')) window.__mut.headers[id]++; }); }); }).observe(document.getElementById('s-' + id), { childList: true, subtree: true });
      });
    });
    const snapMut = () => page.evaluate(() => JSON.parse(JSON.stringify(window.__mut)));
    const resetMut = () => page.evaluate(() => { Object.keys(window.__mut).forEach(k => { if (k !== 'headers') window.__mut[k] = 0; }); Object.keys(window.__mut.headers).forEach(k => window.__mut.headers[k] = 0); });
    const per = {};
    for (const t of ['postepy', 'ocena', 'sciagawka', 'dzis', 'postepy', 'dzis']) { await resetMut(); await tab(page, t); await page.waitForTimeout(100); per[t + (per[t] ? '_2' : '')] = await snapMut(); }
    log('C.mutationsPerTap', per);
    // start Oddech A, tap Dziś while on Dziś
    const od = cardByTitle(page, 'Oddech A');
    await od.locator('.timer button.big').click();
    await page.clock.runFor(3000);
    const before = { clock: await od.locator('.clock').innerText(), btn: await od.locator('.timer button.big').innerText(), sub: await od.locator('.sub').innerText() };
    await resetMut();
    await page.evaluate(() => window.scrollTo(0, 300));
    await tab(page, 'dzis');
    const mutDzisTap = await snapMut();
    const after = { clock: await od.locator('.clock').innerText(), btn: await od.locator('.timer button.big').innerText(), sub: await od.locator('.sub').innerText(), scrollY: await page.evaluate(() => window.scrollY) };
    await page.clock.runFor(2000);
    const after2 = { clock: await od.locator('.clock').innerText(), btn: await od.locator('.timer button.big').innerText(), sub: await od.locator('.sub').innerText() };
    log('C.dzisTapWhileRunning', { before, mutDzisTap, after, after2 });
    log('C.errors', page.__errors);
    await c.close();
  });

  // ================= D: late capability =================
  await section('D', async () => {
    const mockLate = `window.claude = { use: async function (n) { return n === 'sample' ? async function (p, o) { return { text: 'ok' }; } : null; } };`;
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0) });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    await tab(page, 'ocena');
    log('D.noClaude', await page.evaluate(() => ({ hasClaude: !!window.claude, aiVisible: [...document.querySelectorAll('#s-ocena button')].some(b => /Oceń z Claude/.test(b.textContent) && b.offsetParent !== null), copyVisible: [...document.querySelectorAll('#s-ocena button')].some(b => /Kopiuj prompt/.test(b.textContent) && b.offsetParent !== null), status: document.querySelector('#s-ocena .status').textContent })));
    await shot(page, 'D_ocena_noclaude', false);
    await tab(page, 'dzis');
    await page.clock.runFor(3000);
    await page.evaluate(mockLate);
    await tab(page, 'ocena'); await page.waitForTimeout(100);
    log('D.afterAttach3s', await page.evaluate(() => ({ aiVisible: [...document.querySelectorAll('#s-ocena button')].some(b => /Oceń z Claude/.test(b.textContent) && b.offsetParent !== null), status: document.querySelector('#s-ocena .status').textContent })));
    log('D.errors', page.__errors);
    await c.close();
    // variant: attach after the 10 s give-up
    const v = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0) });
    await v.page.goto(URL); await v.page.waitForTimeout(100); await openToday(v.page);
    await tab(v.page, 'ocena'); await tab(v.page, 'dzis');
    await v.page.clock.runFor(12000);
    await v.page.evaluate(mockLate);
    await tab(v.page, 'ocena'); await v.page.waitForTimeout(100);
    log('D.variantAttachAfter12s', await v.page.evaluate(() => ({ aiVisible: [...document.querySelectorAll('#s-ocena button')].some(b => /Oceń z Claude/.test(b.textContent) && b.offsetParent !== null), status: document.querySelector('#s-ocena .status').textContent })));
    await v.c.close();
  });

  // ================= E: day navigation =================
  await section('E', async () => {
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 10, 10, 0, 0) }); // day 4
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    const nav = () => page.evaluate(() => ({ h1: document.querySelector('#s-dzis h1').textContent, prevDisabled: document.querySelector('#s-dzis .arrow[aria-label="Poprzedni dzień"]').disabled, nextDisabled: document.querySelector('#s-dzis .arrow[aria-label="Następny dzień"]').disabled, footer: (document.querySelector('#s-dzis .footer') || {}).textContent || null }));
    log('E.today', await nav());
    await page.click('#s-dzis .arrow[aria-label="Poprzedni dzień"]'); await page.waitForTimeout(50);
    log('E.prev1', await nav());
    await page.click('#s-dzis .arrow[aria-label="Poprzedni dzień"]'); await page.waitForTimeout(50);
    await page.click('#s-dzis .arrow[aria-label="Poprzedni dzień"]'); await page.waitForTimeout(50);
    log('E.prev3', await nav());
    // try clicking disabled prev again (force) and next 3 times, then next again (disabled)
    await page.click('#s-dzis .arrow[aria-label="Następny dzień"]'); await page.waitForTimeout(50);
    await page.click('#s-dzis .arrow[aria-label="Następny dzień"]'); await page.waitForTimeout(50);
    await page.click('#s-dzis .arrow[aria-label="Następny dzień"]'); await page.waitForTimeout(50);
    log('E.backToToday', await nav());
    await page.evaluate(() => { const b = document.querySelector('#s-dzis .arrow[aria-label="Następny dzień"]'); b.disabled = false; b.click(); }); await page.waitForTimeout(50);
    log('E.forcedNextClick', await nav());
    await flush(page);
    const st = await store(page);
    log('E.dayKeys', Object.keys(st.days).sort());
    log('E.futureKeys', Object.keys(st.days).filter(k => k > '2026-11-10'));
    log('E.errors', page.__errors);
    await c.close();
  });

  // ================= F: tap targets + SR picker uniformity =================
  await section('F', async () => {
    // Seed a state that shows most UI variants: day 16 (all exercises), monolog ran (SR picker shown), some done
    const seed = { days: { '2026-11-22': { done: ['oddech'], reps: { oddech: 12 }, monolog: { ran: true, lang: 'pl', topic: 3 }, sr: {}, tension: {}, diary: '' } }, assessments: [{ date: '2026-11-20T10:00:00Z', lang: 'en', dur: '1:00', metrics: { words: 100, wpm: 100, fillers: 3, reps: 1, restarts: 1 }, sr: 3, result: '**Płynność**\nok' }] };
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 22, 10, 0, 0), init: `localStorage.setItem('plynnosc', ${JSON.stringify(JSON.stringify(seed))})` });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    const measure = (tabId) => page.evaluate((tabId) => {
      document.querySelectorAll('details').forEach(d => d.open = true);
      document.querySelectorAll('.card.collapsed').forEach(x => x.classList.remove('collapsed'));
      document.querySelectorAll('.ins.hidden').forEach(x => x.classList.remove('hidden'));
      const sel = 'button, a, summary, [role=button], select, input, textarea, .seg > button';
      const out = { small: [], count: 0, hidden: 0 };
      const roots = [document.getElementById('s-' + tabId), document.getElementById('tabs')];
      roots.forEach(root => root.querySelectorAll(sel).forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) { out.hidden++; return; }
        out.count++;
        if (r.width < 44 || r.height < 44) {
          let s = el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ').join('.') : '');
          out.small.push({ sel: s, text: (el.textContent || '').trim().slice(0, 25), w: +r.width.toFixed(1), h: +r.height.toFixed(1) });
        }
      }));
      // SR pickers
      out.srPickers = [...document.querySelectorAll('#s-' + tabId + ' .sr')].map(s => ({ chips: s.querySelectorAll('.chip').length, labels: [...s.querySelectorAll('.chip')].map(b => b.textContent).join(''), hasMeaning: !!s.querySelector('.meaning'), group: s.querySelector('.chips').getAttribute('aria-label') }));
      // scale text scan
      const body = document.getElementById('s-' + tabId).innerText;
      out.scaleHits = (body.match(/0\s?[–-]\s?10\b|\/\s?10\b(?!\s*startów)|\b1\s?[–-]\s?5\b|\b0\s?[–-]\s?5\b|\b1\s?[–-]\s?10\b|\/\s?5\b|skal[aiąę] 1|\b10\s?pkt/gi) || []);
      out.inputsWithoutSR = [...document.querySelectorAll('#s-' + tabId + ' input[type=range], #s-' + tabId + ' input[type=number]')].length;
      return out;
    }, tabId);
    const res = {};
    for (const t of ['dzis', 'ocena', 'postepy', 'sciagawka']) { await tab(page, t); res[t] = await measure(t); }
    log('F.tapTargets', res);
    // also measure Dziś on day 2 with nothing done (Start buttons, seg control, topic etc.)
    await c.close();
    const v = await ctx(browser, { time: new Date(2026, 10, 13, 10, 0, 0) }); // round 3: day 7 (weekly SR card; day 2 has no SR chips until the monolog ran)
    await v.page.goto(URL); await v.page.waitForTimeout(100); await openToday(v.page);
    await v.page.evaluate(() => { document.querySelectorAll('.card.collapsed').forEach(x => x.classList.remove('collapsed')); document.querySelectorAll('details').forEach(d => d.open = true); });
    log('F.tapTargetsDay7', await v.page.evaluate(() => {
      const out = [];
      document.querySelectorAll('#s-dzis button, #s-dzis summary, #s-dzis [role=button], #s-dzis textarea').forEach(el => { const r = el.getBoundingClientRect(); if (r.width && r.height && (r.width < 44 || r.height < 44)) out.push({ sel: el.tagName.toLowerCase() + '.' + el.className, text: el.textContent.trim().slice(0, 20), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }); });
      return { small: out, segSizes: [...document.querySelectorAll('#s-dzis .seg button')].map(b => { const r = b.getBoundingClientRect(); return [b.textContent, +r.width.toFixed(1), +r.height.toFixed(1)]; }), chipSize: (() => { const r = document.querySelector('#s-dzis .sr .chip').getBoundingClientRect(); return [+r.width.toFixed(1), +r.height.toFixed(1)]; })() };
    }));
    // scan whole source for other scales
    const src = fs.readFileSync(APP, 'utf8');
    log('F.sourceScaleScan', { '0-10': (src.match(/0\s?[–-]\s?10\b/g) || []).length, '/10': (src.match(/(?<!\/)\/\s?10\b/g) || []).length, '1-5': (src.match(/\b1\s?[–-]\s?5\b/g) || []).length, 'range': (src.match(/type=["']?range/g) || []).length, 'SR 0–8': (src.match(/0–8/g) || []).length });
    await v.c.close();
  });

  // ================= G: Monolog seg control, Inny temat, topic survives reload =================
  await section('G', async () => {
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0) });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    const mono = cardByTitle(page, 'Luźny monolog');
    await page.evaluate(() => document.querySelectorAll('.card.collapsed').forEach(x => x.classList.remove('collapsed')));
    const snap = () => page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Luźny monolog'); return { seg: [...c.querySelectorAll('.seg button')].map(b => b.textContent + (b.classList.contains('on') ? '*' : '')), tag: c.querySelector('.topic .tag').textContent, q: c.querySelector('.topic .q').textContent, cue: c.querySelector('.cue').textContent, sub: c.querySelector('.sub').textContent, btn: c.querySelector('.timer button.big').textContent }; });
    const s0 = await snap(); log('G.initial', s0);
    await mono.locator('.seg button', { hasText: 'EN' }).click();
    const s1 = await snap(); log('G.afterEN', s1);
    await mono.locator('.seg button', { hasText: 'PL' }).click();
    const s2 = await snap(); log('G.afterPL', s2);
    // switch during running timer
    await mono.locator('.timer button.big').click(); await page.clock.runFor(1000);
    await mono.locator('.seg button', { hasText: 'EN' }).click();
    const s3 = await snap(); log('G.ENwhileRunning', s3);
    await mono.locator('.timer button.big').click(); // pause
    await mono.locator('button', { hasText: 'Od nowa' }).click();
    const topics = [];
    for (let i = 0; i < 6; i++) { await mono.locator('button', { hasText: 'Inny temat' }).click(); topics.push((await snap()).q); }
    log('G.innyTemat', { start: s2.q, topics, allDifferentFromPrev: topics.every((t, i) => t !== (i ? topics[i - 1] : s2.q)) });
    await flush(page);
    const before = await snap();
    await page.reload(); await page.waitForTimeout(150); await openToday(page);
    await page.evaluate(() => document.querySelectorAll('.card.collapsed').forEach(x => x.classList.remove('collapsed')));
    const afterR = await snap();
    log('G.reload', { beforeQ: before.q, afterQ: afterR.q, sameTopic: before.q === afterR.q, beforeSeg: before.seg, afterSeg: afterR.seg, cue: afterR.cue });
    await shot(page, 'G_monolog_card', false);
    log('G.errors', page.__errors);
    await c.close();
  });

  // ================= H: card layout, collapse after Start, done card =================
  await section('H', async () => {
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0) });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    const layout = () => page.evaluate(() => [...document.querySelectorAll('#s-dzis .card')].map(card => {
      const body = card.querySelector('.cbody');
      const seq = [];
      body.querySelectorAll(':scope > *').forEach(el => seq.push(el.className || el.tagName.toLowerCase()));
      const brief = [...body.querySelectorAll('.brief li b')].map(b => b.textContent.trim());
      const ins = body.querySelector('.ins');
      const tg = body.querySelector('.instoggle');
      return { title: card.querySelector('h2').textContent, collapsed: card.classList.contains('collapsed'), seq, brief, insLabels: ins ? [...ins.querySelectorAll('.ln b, summary')].map(x => x.textContent) : null, insHidden: ins ? ins.classList.contains('hidden') : null, toggle: tg ? tg.textContent : null, dlaczegoOpen: ins ? ins.querySelector('details').open : null, bigBtn: (body.querySelector('button.big') || {}).textContent || null, act: (card.querySelector('.chead .act') || {}).textContent || null, headSmall: card.querySelector('.chead small').textContent };
    }));
    log('H.day2initial', await layout());
    log('H.oddechSentence', await page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Oddech A'); const s = 'Wdech nosem 2–3 s i w chwili, gdy powietrze zaczyna wychodzić, mówisz „Aleksander”'; return { inFull: c.querySelector('.ins').innerText.includes(s), inBrief: c.querySelector('.brief').innerText.includes(s), briefText: c.querySelector('.brief').innerText }; }));
    await shot(page, 'H_day2_oddech_before', false);
    await shot(page, 'H_day2_full');
    const od = cardByTitle(page, 'Oddech A');
    await od.locator('.timer button.big').click(); await page.waitForTimeout(50);
    log('H.afterStart', (await layout()).filter(x => x.title === 'Oddech A'));
    await shot(page, 'H_oddech_after_start', false);
    await flush(page);
    await page.reload(); await page.waitForTimeout(150); await openToday(page);
    log('H.afterReload', (await layout()).filter(x => x.title === 'Oddech A'));
    // click Pokaż instrukcję
    await od.locator('button.instoggle').click();
    log('H.afterPokaz', (await layout()).filter(x => x.title === 'Oddech A').map(x => ({ insHidden: x.insHidden, toggle: x.toggle })));
    await od.locator('button.instoggle').click();
    // finish oddech: from startIndex (reps saved during run? the first phase did not complete) -> run full 12
    await od.locator('.timer button.big').click();
    await page.clock.runFor(12 * 10000 + 500); // round 3: 7 s + 3 s gap per rep
    await page.waitForTimeout(50);
    log('H.doneImmediate', (await layout()).filter(x => x.title === 'Oddech A'));
    await shot(page, 'H_oddech_done_immediate', false);
    await flush(page); await page.reload(); await page.waitForTimeout(150); await openToday(page);
    log('H.doneAfterReload', (await layout()).filter(x => x.title === 'Oddech A'));
    log('H.doneRowHeight', await page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Oddech A'); return { h: Math.round(c.getBoundingClientRect().height), headH: Math.round(c.querySelector('.chead').getBoundingClientRect().height) }; }));
    await shot(page, 'H_oddech_done_reload', false);
    log('H.errors', page.__errors);
    await c.close();
  });

  // ================= I: Dziennik typing keeps focus =================
  await section('I', async () => {
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0) });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    const dz = cardByTitle(page, 'Dziennik bloków');
    await dz.locator('.chead').click(); // expand
    const ta = dz.locator('textarea');
    await ta.click();
    const text = 'rozmowa z kolega o nartach · s'; // 30 chars
    await page.keyboard.type(text, { delay: 15 });
    log('I.afterTyping', await page.evaluate((text) => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Dziennik bloków'); const ta = c.querySelector('textarea'); return { activeIsTextarea: document.activeElement === ta, value: ta.value, valueOk: ta.value === text, len: ta.value.length, saved: c.querySelector('.saved').textContent, done: c.classList.contains('done'), mark: c.querySelector('.mark').textContent, small: c.querySelector('small').textContent, hasZapiszWpis: [...document.querySelectorAll('#s-dzis button')].some(b => /Zapisz wpis/i.test(b.textContent)), enc: (c.querySelector('.enc') || {}).textContent || null, selStart: ta.selectionStart }; }, text));
    await page.keyboard.type('zybko', { delay: 15 });
    log('I.afterMore', await page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Dziennik bloków'); const ta = c.querySelector('textarea'); return { activeIsTextarea: document.activeElement === ta, value: ta.value, small: c.querySelector('small').textContent }; }));
    await shot(page, 'I_dziennik_typed', false);
    await flush(page);
    log('I.store', (await store(page)).days['2026-11-08'].diary);
    log('I.errors', page.__errors);
    await c.close();
  });

  // ================= J: toast on hierarchy chip =================
  await section('J', async () => {
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0) });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    await tab(page, 'postepy');
    await page.locator('#s-postepy .card').filter({ has: page.locator('h2', { hasText: 'Hierarchia' }) }).locator('.chead').click(); // collapsed by default since round 3
    const toastBefore = await page.evaluate(() => ({ on: document.getElementById('toast').classList.contains('on'), text: document.getElementById('toast').textContent }));
    await page.locator('#s-postepy .hitem .sr').nth(2).locator('.chip').nth(5).click();
    await page.waitForTimeout(60);
    const toastAfter = await page.evaluate(() => { const t = document.getElementById('toast'); const r = t.getBoundingClientRect(); return { on: t.classList.contains('on'), text: t.textContent, opacity: getComputedStyle(t).opacity, inViewport: r.top >= 0 && r.bottom <= innerHeight, bottom: Math.round(r.bottom), vh: innerHeight }; });
    await page.waitForTimeout(250);
    await shot(page, 'J_toast', false);
    await page.clock.runFor(1500); await page.waitForTimeout(100);
    const toastGone = await page.evaluate(() => document.getElementById('toast').classList.contains('on'));
    await flush(page);
    log('J.toast', { toastBefore, toastAfter, toastGone, storedH3: (await store(page)).hierarchy[2] });
    log('J.errors', page.__errors);
    await c.close();
  });

  // ================= K: keyboard hides nav =================
  await section('K', async () => {
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0) });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    await tab(page, 'ocena');
    const navState = () => page.evaluate(() => { const n = document.getElementById('tabs').getBoundingClientRect(); const ta = document.querySelector('#s-ocena textarea[aria-label="Transkrypt"]').getBoundingClientRect(); return { kb: document.body.classList.contains('kb'), navTop: Math.round(n.top), vh: innerHeight, navOffscreen: n.top >= innerHeight, taTop: Math.round(ta.top), taBottom: Math.round(ta.bottom), taInView: ta.top >= 0 && ta.bottom <= innerHeight, active: document.activeElement.tagName }; });
    log('K.before', await navState());
    await page.locator('#s-ocena textarea[aria-label="Transkrypt"]').focus();
    await page.waitForTimeout(400);
    log('K.focused', await navState());
    await shot(page, 'K_keyboard_focus', false);
    await page.evaluate(() => document.activeElement.blur());
    await page.waitForTimeout(300);
    log('K.blurred', await navState());
    // tab between fields: nav stays hidden
    await page.locator('#s-ocena input[aria-label="Czas trwania"]').focus(); await page.waitForTimeout(100);
    await page.keyboard.press('Tab'); await page.waitForTimeout(100);
    log('K.tabBetweenFields', await navState());
    log('K.errors', page.__errors);
    await c.close();
  });

  // ================= L: clamping + corrupted state =================
  await section('L', async () => {
    const old = { r1s: 7, h2: 20, h4: 10, h1: 3 };
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 7, 10, 0, 0), init: `localStorage.clear(); localStorage.setItem('plynnosc-dzien-01', ${JSON.stringify(JSON.stringify(old))});` });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    const st = await store(page);
    log('L.migration', { r1s: st.days['2026-11-07'].base.readPL.sr, h1: st.hierarchy[0], h2: st.hierarchy[1], h4: st.hierarchy[3], hierarchy: st.hierarchy, bazaTableSR: await page.evaluate(() => [...document.querySelectorAll('#s-dzis table tbody tr')].map(r => r.innerText.replace(/\s+/g, ' '))) });
    log('L.migrationErrors', page.__errors);
    await c.close();
    const v = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0), init: `localStorage.setItem('plynnosc', '{"days":"x","hierarchy":[9,-1],"assessments":[{}]}')` });
    await v.page.goto(URL); await v.page.waitForTimeout(100); await openToday(v.page);
    const res = {};
    for (const t of ['dzis', 'ocena', 'postepy', 'sciagawka']) { await tab(v.page, t); res[t] = await v.page.evaluate((t) => ({ h1: document.querySelector('#s-' + t + ' h1').textContent, children: document.getElementById('s-' + t).children.length }), t); }
    const st2 = await store(v.page);
    log('L.corrupted', { tabs: res, hierarchy: st2.hierarchy, assessments: st2.assessments, dayKeys: Object.keys(st2.days), ocenaList: await v.page.evaluate(() => document.querySelector('#s-ocena .alist').innerText.slice(0, 80)) });
    log('L.corruptedErrors', v.page.__errors);
    await v.c.close();
  });

  // ================= M: date rollover =================
  await section('M', async () => {
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 8, 23, 59, 0) });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    log('M.before', await page.evaluate(() => ({ h1: document.querySelector('#s-dzis h1').textContent, p: document.querySelector('#s-dzis header p').textContent })));
    await page.clock.runFor(2 * 60 * 1000);
    log('M.afterClockNoEvent', await page.evaluate(() => ({ h1: document.querySelector('#s-dzis h1').textContent, now: new Date().toString() })));
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await page.waitForTimeout(50); await openToday(page); // rollover returns to the map; open the new day
    log('M.afterVisibility', await page.evaluate(() => ({ h1: document.querySelector('#s-dzis h1').textContent, p: document.querySelector('#s-dzis header p').textContent, visState: document.visibilityState, nextDisabled: document.querySelector('#s-dzis .arrow[aria-label="Następny dzień"]').disabled })));
    const dz = cardByTitle(page, 'Dziennik bloków');
    await dz.locator('.chead').click(); await dz.locator('textarea').click(); await page.keyboard.type('wpis po północy test', { delay: 5 });
    await flush(page);
    const st = await store(page);
    log('M.entries', { keys: Object.keys(st.days).sort(), diary09: (st.days['2026-11-09'] || {}).diary, diary08: (st.days['2026-11-08'] || {}).diary });
    // Also: rollover via tab switch (Postępy -> Dziś) without visibilitychange
    const v = await ctx(browser, { time: new Date(2026, 10, 8, 23, 59, 0) });
    await v.page.goto(URL); await v.page.waitForTimeout(100); await openToday(v.page);
    await tab(v.page, 'postepy'); await v.page.clock.runFor(2 * 60 * 1000); await tab(v.page, 'dzis');
    log('M.rolloverViaTab', await v.page.evaluate(() => document.querySelector('#s-dzis h1').textContent));
    log('M.errors', page.__errors.concat(v.page.__errors));
    await c.close(); await v.c.close();
  });

  // ================= N: regression =================
  await section('N', async () => {
    // N1: Oddech auto-reps 12/12 with word phase
    {
      const { c, page } = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0) });
      await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
      const od = cardByTitle(page, 'Oddech A');
      await od.locator('.timer button.big').click();
      const cues = [];
      await page.clock.runFor(3500); // v4: first counted inhale, sample mid-phase
      for (let i = 0; i < 12; i++) { cues.push({ cue: await od.locator('.cue').innerText(), sub: await od.locator('.sub').innerText(), reps: await od.locator('.reps').innerText() }); await page.clock.runFor(10000); }
      await page.waitForTimeout(50);
      const dn = await page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Oddech A'); return { done: c.classList.contains('done'), small: c.querySelector('small').textContent, next: document.querySelector('#s-dzis .next').textContent, bar: document.querySelectorAll('#s-dzis .progress .on').length }; });
      log('N1.oddech', { fff: cues.filter(x => x.cue === 'fff').length, words: cues.filter(x => x.cue !== 'fff').map(x => x.cue), subs: cues.map(x => x.sub.split(' ·')[0]), done: dn });
      await flush(page); log('N1.storeReps', (await store(page)).days['2026-11-08'].reps);
      log('N1.errors', page.__errors);
      await c.close();
    }
    // N2: day 9 Identyfikacja, day 16 Miękki start
    {
      const { c, page } = await ctx(browser, { time: new Date(2026, 10, 15, 10, 0, 0) });
      await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
      log('N2.day9', await page.evaluate(() => ({ h1: document.querySelector('#s-dzis h1').textContent, cards: [...document.querySelectorAll('#s-dzis .card h2')].map(h => h.textContent) })));
      await c.close();
      const v = await ctx(browser, { time: new Date(2026, 10, 22, 10, 0, 0) });
      await v.page.goto(URL); await v.page.waitForTimeout(100); await openToday(v.page);
      log('N2.day16', await v.page.evaluate(() => ({ h1: document.querySelector('#s-dzis h1').textContent, cards: [...document.querySelectorAll('#s-dzis .card h2')].map(h => h.textContent) })));
      const mk = cardByTitle(v.page, 'Miękki start');
      await mk.locator('.chead').click();
      await mk.locator('.timer button.big').click();
      const words = [];
      for (let i = 0; i < 12; i++) { words.push(await mk.locator('.cue').innerText() + '|' + await mk.locator('.sub').innerText()); await v.page.clock.runFor(5000); }
      await v.page.waitForTimeout(50);
      log('N2.miekki', { words, done: await v.page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Miękki start'); return { done: c.classList.contains('done'), small: c.querySelector('small').textContent }; }) });
      await shot(v.page, 'N2_day16');
      log('N2.errors', v.page.__errors);
      await v.c.close();
    }
    // N3: streak 2 after two consecutive days (D1 baseline + D2 via UI), chart renders, metrics EN
    {
      const { c, page } = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0) });
      await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
      // oddech
      await cardByTitle(page, 'Oddech A').locator('.timer button.big').click(); await page.clock.runFor(12 * 10000 + 200); await page.waitForTimeout(50);
      // round 3: Start na sygnał (10 x 2-6 s wait + 8 s answer)
      await cardByTitle(page, 'Start na sygnał').locator('.timer button.big').click(); await page.clock.runFor(145000); await page.waitForTimeout(50);
      // monolog
      const mono = cardByTitle(page, 'Luźny monolog');
      await mono.locator('.timer button.big').click(); await page.clock.runFor(121000); await page.waitForTimeout(50);
      await mono.locator('.chips3 button', { hasText: 'tak' }).click();
      await mono.locator('.sr .chip').nth(2).click(); await page.waitForTimeout(50);
      // dziennik
      const dz = cardByTitle(page, 'Dziennik bloków'); await dz.locator('textarea').click(); await page.keyboard.type('daily · start: ktoś · PL · szybko', { delay: 3 });
      // round 3: no SR card on day 2 (weekly SR) -> the diary completes the day
      await page.waitForTimeout(50);
      log('N3.day2done', await page.evaluate(() => ({ banner: (document.querySelector('#s-dzis .card.done h2') || {}).textContent, bannerP: (document.querySelector('#s-dzis .card.done p') || {}).textContent, doneCards: document.querySelectorAll('#s-dzis .card.done').length, bars: document.querySelectorAll('#s-dzis .progress .on').length + '/' + document.querySelectorAll('#s-dzis .progress span').length })));
      await shot(page, 'N3_day2_done', false);
      await shot(page, 'N3_day2_done_full');
      await page.evaluate(() => document.activeElement.blur()); await page.waitForTimeout(250); // round 3: diary is the last card; the tab bar is hidden while the textarea has focus
      await tab(page, 'postepy');
      log('N3.postepy', await page.evaluate(() => ({ stats: [...document.querySelectorAll('#s-postepy .stat b')].map(b => b.textContent), chart: { polylines: document.querySelectorAll('#s-postepy svg.chart polyline').length, circles: document.querySelectorAll('#s-postepy svg.chart circle').length, h: Math.round(document.querySelector('#s-postepy svg.chart').getBoundingClientRect().height) }, rows: [...document.querySelectorAll('#s-postepy table tbody tr')].map(r => r.innerText.replace(/\s+/g, ' ')) })));
      await shot(page, 'N3_postepy');
      // metrics EN
      await tab(page, 'ocena');
      await page.fill('#s-ocena textarea[aria-label="Transkrypt"]', 'Um so yesterday I I went to the the beach and uh the waves were like really big... I mean it was scary. It was scary but I tried anyway.');
      await page.selectOption('#s-ocena select', 'en'); await page.fill('#s-ocena input[aria-label="Czas trwania"]', '0:20');
      log('N3.metricsEN', await page.evaluate(() => [...document.querySelectorAll('#s-ocena .metrics div')].map(d => d.querySelector('span').textContent + '=' + d.querySelector('b').textContent)));
      log('N3.errors', page.__errors);
      await c.close();
    }
    // N4: grep for external resources / forbidden APIs
    {
      const src = fs.readFileSync(APP, 'utf8');
      const pats = { 'http(s)://': /https?:\/\//g, 'fetch(': /\bfetch\s*\(/g, XMLHttpRequest: /XMLHttpRequest/g, WebSocket: /WebSocket/g, EventSource: /EventSource/g, sendBeacon: /sendBeacon/g, 'import(': /\bimport\s*\(/g, 'eval(': /\beval\s*\(/g, 'new Function': /new Function/g, 'document.cookie': /document\.cookie/g, indexedDB: /indexedDB/g, 'script src': /<script[^>]+src=/g, 'link href': /<link[^>]+href=/g, '@import': /@import/g, 'url(': /url\(/g, 'window.open': /window\.open/g, 'serviceWorker': /serviceWorker/g, 'getUserMedia': /getUserMedia/g };
      const hits = {}; Object.keys(pats).forEach(k => { const m = src.match(pats[k]); if (m) hits[k] = m.length; });
      const urls = src.match(/https?:\/\/[^\s"'<)]+/g) || [];
      log('N4.grep', { hits, urls });
    }
    // N5: localStorage throwing
    {
      const { c, page } = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0), init: `Object.defineProperty(window, 'localStorage', { get() { throw new Error('SecurityError: localStorage blocked'); }, configurable: true });` });
      await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
      const od = cardByTitle(page, 'Oddech A'); await od.locator('.timer button.big').click(); await page.clock.runFor(9500);
      const res = { h1: await txt(page, '#s-dzis h1'), reps: await od.locator('.reps').innerText() };
      for (const t of ['ocena', 'postepy', 'sciagawka', 'dzis']) await tab(page, t);
      res.tabsOk = true; res.errors = page.__errors;
      log('N5.lsThrow', res);
      await c.close();
    }
  });

  // ================= O: visual screenshots =================
  await section('O', async () => {
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0) });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    await shot(page, 'O_dzis_day2_viewport', false);
    log('O.overflow', await page.evaluate(() => ({ docW: document.documentElement.scrollWidth, vw: innerWidth, overflowing: [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 && r.width > 0; }).slice(0, 5).map(e => e.tagName + '.' + e.className) })));
    await tab(page, 'sciagawka'); await shot(page, 'O_sciagawka');
    await tab(page, 'ocena'); await shot(page, 'O_ocena_empty');
    await tab(page, 'postepy'); await shot(page, 'O_postepy_day2');
    await tab(page, 'dzis');
    await page.evaluate(() => document.querySelectorAll('.card.collapsed').forEach(x => x.classList.remove('collapsed')));
    await c.close();
    // round 3: weekly SR card (day 7)
    const w7 = await ctx(browser, { time: new Date(2026, 10, 13, 10, 0, 0) });
    await w7.page.goto(URL); await w7.page.waitForTimeout(100); await openToday(w7.page);
    await w7.page.evaluate(() => document.querySelectorAll('.card.collapsed').forEach(x => x.classList.remove('collapsed')));
    const sr = cardByTitle(w7.page, 'SR tygodnia');
    await sr.scrollIntoViewIfNeeded(); await shot(w7.page, 'O_sr_tygodnia_card', false);
    log('O.srTygodnia', await sr.evaluate(c => ({ pickers: c.querySelectorAll('.sr').length, keys: c.querySelectorAll('.srkey').length })));
    log('O.errors', page.__errors.concat(w7.page.__errors));
    await w7.c.close();
    // day 1
    const v = await ctx(browser, { time: new Date(2026, 10, 7, 10, 0, 0) });
    await v.page.goto(URL); await v.page.waitForTimeout(100); await openToday(v.page);
    await shot(v.page, 'O_dzis_day1', true);
    log('O.day1', await v.page.evaluate(() => ({ h1: document.querySelector('#s-dzis h1').textContent, cards: [...document.querySelectorAll('#s-dzis .card')].map(c => c.querySelector('h2').textContent + (c.classList.contains('collapsed') ? '(collapsed)' : '') + (c.classList.contains('done') ? '(done)' : '')), banner: (document.querySelector('#s-dzis .card.done p') || {}).textContent })));
    await v.c.close();
  });

  await browser.close();
  fs.writeFileSync(OUT + 'round2_results.json', JSON.stringify(R, null, 1));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
