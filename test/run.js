const { chromium } = require('playwright');
const path = require('path');
const APP = path.resolve(__dirname, '..', 'app', 'index.html');
const URL = 'file://' + APP;
const OUT = __dirname + '/';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const R = {};
function log(k, v) { R[k] = v; console.log(k, JSON.stringify(v)); }

async function ctx(browser, opts = {}) {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: UA, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await c.newPage();
  page.__errors = [];
  page.on('console', m => { if (m.type() === 'error') page.__errors.push(m.text()); });
  page.on('pageerror', e => page.__errors.push('PAGEERROR ' + e.message));
  if (opts.init) await page.addInitScript(opts.init);
  if (opts.time) await page.clock.install({ time: opts.time });
  return { c, page };
}
async function openToday(pg) { // map entry flow: open today's island to reach the day session
  try { const isl = pg.locator('#s-dzis .island.st-today'); if (await isl.count() && await isl.first().isVisible()) { await isl.first().click(); await pg.waitForTimeout(50); } } catch (e) { /* not on map */ }
}
async function tab(page, id) { await page.click(`#tabs button[data-id="${id}"]`); await page.waitForTimeout(50); }
async function shot(page, name) { await page.screenshot({ path: OUT + name + '.png', fullPage: true }); return OUT + name + '.png'; }
const txt = (page, sel) => page.locator(sel).first().innerText();

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  // ---------- T1: Day 1 baseline, hierarchy, cheat sheet, static sandbox checks ----------
  {
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 7, 10, 0, 0) });
    await page.goto(URL); await openToday(page);
    await page.waitForTimeout(100);
    log('T1.h1', await txt(page, '#s-dzis h1'));
    log('T1.bazaTable', await page.locator('#s-dzis table').first().innerText());
    const st = await page.evaluate(() => JSON.parse(localStorage.getItem('plynnosc')));
    log('T1.day1', { done: st.days['2026-11-07'].done, base: st.days['2026-11-07'].base, sr: st.days['2026-11-07'].sr, hierarchy: st.hierarchy });
    log('T1.shot', await shot(page, '01_day1_baza'));
    // external resources / sandbox
    log('T1.external', await page.evaluate(() => {
      const r = [];
      document.querySelectorAll('script[src],link[href],img[src],iframe,video,audio,source').forEach(e => r.push(e.outerHTML.slice(0, 100)));
      return { tags: r, fontFaceInStyle: [...document.styleSheets].some(s => { try { return [...s.cssRules].some(x => x instanceof CSSFontFaceRule || /url\(/.test(x.cssText)); } catch (e) { return false; } }) };
    }));
    // scale text scan on all tabs
    const scaleHits = {};
    for (const t of ['dzis', 'ocena', 'postepy', 'sciagawka']) {
      await tab(page, t);
      await page.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true));
      const body = await page.locator('main').innerText();
      scaleHits[t] = (body.match(/0\s?[–-]\s?10|\/\s?10\b|1\s?[–-]\s?5\b|0\s?[–-]\s?5\b|\b10\s?pkt/g) || []);
    }
    log('T1.scaleHits', scaleHits);
    // chip rows per tab
    await tab(page, 'dzis');
    log('T1.dzisChipRows', await page.evaluate(() => [...document.querySelectorAll('#s-dzis .sr .chips')].map(c => c.children.length)));
    await tab(page, 'postepy');
    log('T1.postepyChipRows', await page.evaluate(() => [...document.querySelectorAll('#s-postepy .sr .chips')].map(c => c.children.length)));
    log('T1.hierarchySelected', await page.evaluate(() => [...document.querySelectorAll('#s-postepy .hitem')].filter(x => x.querySelector('.sr')).map(x => { const on = x.querySelector('.chip.on'); return on ? +on.textContent : null; })));
    // tap a hierarchy chip -> meaning
    await page.locator('#s-postepy .card').filter({ has: page.locator('h2', { hasText: 'Hierarchia' }) }).locator('.chead').click(); // hierarchy collapsed by default (round 3)
    const hc = page.locator('#s-postepy .hitem .sr').first();
    await hc.locator('.chip').nth(6).click();
    log('T1.hierMeaningAfterTap', await hc.locator('.meaning').innerText());
    log('T1.shotPostepy', await shot(page, '02_postepy_day1'));
    await tab(page, 'ocena');
    log('T1.ocenaChipRows', await page.evaluate(() => document.querySelectorAll('#s-ocena .sr .chips').length));
    log('T1.ocenaInputs', await page.evaluate(() => [...document.querySelectorAll('#s-ocena input,#s-ocena select,#s-ocena textarea')].map(e => e.tagName + ':' + (e.type || '') + ':' + (e.placeholder || ''))));
    await tab(page, 'sciagawka');
    log('T1.scaleSegs', await page.evaluate(() => document.querySelectorAll('#s-sciagawka .scale .chip').length));
    log('T1.scaleBoxBefore', await txt(page, '#s-sciagawka .scale .meaning'));
    await page.locator('#s-sciagawka .scale .chip').nth(4).click();
    log('T1.scaleBoxAfter', await txt(page, '#s-sciagawka .scale .meaning'));
    log('T1.scaleColors', await page.evaluate(() => [...document.querySelectorAll('#s-sciagawka .scale .chip')].map(b => getComputedStyle(b).borderColor)));
    log('T1.shotSciagawka', await shot(page, '03_sciagawka'));
    log('T1.errors', page.__errors);
    await c.close();
  }

  // ---------- T2: old key conversion ----------
  {
    const old = { h1: 10, h2: 0, h3: 5, h4: 7, h5: 3, h6: 9, h7: 1, h8: 6, h9: 4, h10: 8, r1b: 3, r1s: 6, reps: [1, 1], m1: 'tak', m2: 'nie', m3: '1', diary: 'stary wpis' };
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 7, 10, 0, 0), init: `localStorage.clear(); localStorage.setItem('plynnosc-dzien-01', ${JSON.stringify(JSON.stringify(old))});` });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    const st = await page.evaluate(() => JSON.parse(localStorage.getItem('plynnosc')));
    log('T2.hierarchy', st.hierarchy);
    log('T2.expected', [10, 0, 5, 7, 3, 9, 1, 6, 4, 8].map(v => Math.round(v * 0.8)));
    log('T2.day1base', st.days['2026-11-07'].base.readPL);
    log('T2.errors', page.__errors);
    await c.close();
  }

  // ---------- T3/T4: Day 2 full session (R5,R6,R7,R13,R14) ----------
  {
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0) });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    log('T3.h1', await txt(page, '#s-dzis h1'));
    log('T3.cards', await page.evaluate(() => [...document.querySelectorAll('#s-dzis .card h2')].map(h => h.textContent)));
    log('T3.next', await txt(page, '#s-dzis .next'));
    log('T3.progressBar', await page.evaluate(() => { const b = document.querySelector('#s-dzis .progress'); return { segs: b.children.length, on: b.querySelectorAll('.on').length, visible: b.getBoundingClientRect().height > 0 }; }));
    // instruction order in each card
    log('T3.insOrder', await page.evaluate(() => [...document.querySelectorAll('#s-dzis .card')].map(card => {
      const h2 = card.querySelector('h2').textContent;
      const body = card.querySelector('.cbody');
      const labels = [...body.querySelectorAll('.ins b, .ins summary')].map(x => x.textContent);
      const btn = [...body.querySelectorAll('button')].find(b => /Start|Zapisz/.test(b.textContent));
      const ins = body.querySelector('.ins');
      const order = ins && btn ? (ins.compareDocumentPosition(btn) & Node.DOCUMENT_POSITION_FOLLOWING ? 'ins-before-button' : 'button-before-ins') : (ins ? 'ins-no-button' : 'NO-INS');
      const detailsOpen = ins ? ins.querySelector('details').open : null;
      return { h2, labels, order, detailsOpen, startBtn: btn ? btn.textContent : null };
    })));
    log('T3.oddechText', await page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Oddech A'); return [...c.querySelectorAll('.ins .ln, .ins details p')].map(x => x.textContent); }));
    log('T3.oddechHasExact', await page.evaluate(() => document.querySelector('#s-dzis').innerText.includes('Wdech nosem 2–3 s i w chwili, gdy powietrze zaczyna wychodzić, mówisz „Aleksander”')));
    await shot(page, '04_day2_oddech_before');
    // Oddech A auto reps
    const oddech = page.locator('#s-dzis .card').filter({ has: page.locator('h2', { hasText: 'Oddech A' }) });
    const tbtn = oddech.locator('.timer button').first();
    log('T3.startLabel', await tbtn.innerText());
    await tbtn.click();
    const snap = async () => ({ cue: await oddech.locator('.cue').innerText(), sub: await oddech.locator('.sub').innerText(), clock: await oddech.locator('.clock').innerText(), reps: await oddech.locator('.reps').innerText(), btn: await tbtn.innerText() });
    log('T3.afterStart', await snap());
    await page.clock.runFor(7100); log('T3.t7.1', await snap());
    await page.clock.runFor(2100); log('T3.t9.2', await snap());
    await shot(page, '05_oddech_running');
    // run to phase 9 (8 fff done): each phase 7s + 2s gap = 9s; 8 phases => 72s
    await page.clock.runFor(72000 - 9200 + 300); log('T3.afterFff', await snap());
    await page.clock.runFor(2000); log('T3.wordPhase', await snap());
    await shot(page, '06_oddech_word');
    await page.clock.runFor(9000); log('T3.word2', await snap());
    await page.clock.runFor(9000 * 3); await page.waitForTimeout(100);
    log('T3.doneCard', await page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Oddech A'); return { cls: c.className, small: c.querySelector('small').textContent, enc: c.querySelector('.enc') ? c.querySelector('.enc').textContent : null }; }));
    log('T3.clicksNeeded', 1);
    await shot(page, '07_oddech_done');
    log('T3.nextAfterOddech', await txt(page, '#s-dzis .next'));

    // Monolog (R7, R9)
    const mono = page.locator('#s-dzis .card').filter({ has: page.locator('h2', { hasText: 'Luźny monolog' }) });
    log('T4.topic1', { tag: await mono.locator('.topic .tag').innerText(), q: await mono.locator('.topic .q').innerText(), langBtn: await mono.locator('.topic .seg button.on').innerText() });
    const topics = new Set();
    for (let i = 0; i < 6; i++) { await mono.locator('button', { hasText: 'Inny temat' }).click(); topics.add(await mono.locator('.topic .q').innerText()); }
    log('T4.distinctTopicsAfter6', topics.size);
    await mono.locator('.topic .seg button').nth(0).click(); // PL
    log('T4.afterToggle', { q: await mono.locator('.topic .q').innerText(), langBtn: await mono.locator('.topic .seg button.on').innerText(), cue: await mono.locator('.cue').innerText() });
    log('T4.monoStartLabel', await mono.locator('.timer button').first().innerText());
    await shot(page, '08_monolog_topic');
    await mono.locator('.timer button').first().click();
    await page.clock.runFor(120500); await page.waitForTimeout(50);
    log('T4.afterMonoTimer', await page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Luźny monolog'); return { h3: c.querySelector('h3') && c.querySelector('h3').textContent, chips3: c.querySelectorAll('.chips3 button').length, srChips: c.querySelectorAll('.sr .chip').length }; }));
    await mono.locator('.chips3 button', { hasText: 'tak' }).click();
    await mono.locator('.sr .chip').nth(3).click();
    await page.waitForTimeout(50);
    log('T4.monoDone', await page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Luźny monolog'); return { cls: c.className, enc: c.querySelector('.enc') && c.querySelector('.enc').textContent, small: c.querySelector('small').textContent, meaning: c.querySelector('.sr .meaning') ? c.querySelector('.sr .meaning').textContent : null }; }));
    await shot(page, '09_monolog_done');
    // Dziennik
    const dz = page.locator('#s-dzis .card').filter({ has: page.locator('h2', { hasText: 'Dziennik' }) });
    await dz.locator('.tags button', { hasText: 'start: ktoś' }).click();
    await dz.locator('.tags button', { hasText: 'EN' }).click();
    await dz.locator('textarea').fill('rozmowa o nartach · start: ktoś · EN · szybko');
    await page.waitForTimeout(50); // autosave: done at >= 10 chars, no save button
    log('T4.dzEnc', await page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Dziennik bloków'); return c.querySelector('.enc') && c.querySelector('.enc').textContent; }));
    // SR dnia
    const sr = page.locator('#s-dzis .card').filter({ has: page.locator('h2', { hasText: 'SR dnia' }) });
    await sr.locator('.sr').nth(0).locator('.chip').nth(2).click();
    log('T4.srMeaning', await sr.locator('.sr').nth(0).locator('.meaning').innerText());
    await sr.locator('.sr').nth(1).locator('.chip').nth(5).click(); await page.waitForTimeout(50);
    log('T4.srEnc', await page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'SR dnia'); return c.querySelector('.enc') && c.querySelector('.enc').textContent; }));
    log('T4.sessionDone', await page.evaluate(() => { const d = document.querySelector('#s-dzis .card.done h2'); const p = document.querySelector('#s-dzis .card.done p'); return { h2: d && d.textContent, p: p && p.textContent, next: !!document.querySelector('#s-dzis .next'), barOn: document.querySelectorAll('#s-dzis .progress .on').length }; }));
    await shot(page, '10_day2_done');
    // reload persist
    await page.reload(); await page.waitForTimeout(100); await openToday(page);
    log('T4.afterReload', await page.evaluate(() => ({ done: JSON.parse(localStorage.getItem('plynnosc')).days['2026-11-08'].done, doneCardText: document.querySelector('#s-dzis .card.done p') && document.querySelector('#s-dzis .card.done p').textContent })));
    // Postępy (R14)
    await tab(page, 'postepy');
    log('T5.stats', await txt(page, '#s-postepy .stat'));
    log('T5.chart', await page.evaluate(() => { const s = document.querySelector('#s-postepy svg.chart'); return { exists: !!s, polylines: s.querySelectorAll('polyline').length, circles: s.querySelectorAll('circle').length, points: [...s.querySelectorAll('polyline')].map(p => p.getAttribute('points')), h: s.getBoundingClientRect().height }; }));
    log('T5.table', await page.locator('#s-postepy table').first().innerText());
    await shot(page, '11_postepy_streak2');
    log('T3.errors', page.__errors);
    await c.close();
  }

  // ---------- T6: Day 9 and Day 16 (R13) ----------
  for (const [dd, name] of [[15, 'day9'], [22, 'day16']]) {
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, dd, 10, 0, 0) });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    log(`T6.${name}.h1`, await txt(page, '#s-dzis h1'));
    log(`T6.${name}.cards`, await page.evaluate(() => [...document.querySelectorAll('#s-dzis .card h2')].map(h => h.textContent)));
    log(`T6.${name}.monoLangBtn`, await page.evaluate(() => { const b = document.querySelector('#s-dzis .topic .seg button.on'); return b && b.textContent; }));
    if (name === 'day16') {
      await page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Miękki start'); c.classList.remove('collapsed'); });
      const mk = page.locator('#s-dzis .card').filter({ has: page.locator('h2', { hasText: 'Miękki start' }) });
      log('T6.miekkiIns', await mk.evaluate(c => [...c.querySelectorAll('.ins b, .ins summary')].map(x => x.textContent)));
      await mk.locator('.timer button').first().click();
      const sn = async () => ({ cue: await mk.locator('.cue').innerText(), reps: await mk.locator('.reps').innerText(), clock: await mk.locator('.clock').innerText() });
      log('T6.miekki.t0', await sn());
      await page.clock.runFor(5200); log('T6.miekki.t5', await sn());
      await page.clock.runFor(5000); log('T6.miekki.t10', await sn());
      await shot(page, '12_day16_miekki');
      await page.clock.runFor(5000 * 10 + 500); await page.waitForTimeout(50);
      log('T6.miekki.done', await page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'Miękki start'); return { cls: c.className, small: c.querySelector('small').textContent, enc: c.querySelector('.enc') && c.querySelector('.enc').textContent }; }));
      log('T6.cardsExpanded', await page.evaluate(() => [...document.querySelectorAll('#s-dzis .card')].map(c => c.querySelector('h2').textContent + ':' + (c.classList.contains('collapsed') ? 'collapsed' : 'open'))));
    } else {
      await page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent.startsWith('Identyfikacja')); c.classList.remove('collapsed'); });
      await shot(page, '12_day9_napiecie');
    }
    log(`T6.${name}.errors`, page.__errors);
    await c.close();
  }

  // ---------- T7: Oceń nagranie without window.claude ----------
  const transcript = 'So um yesterday I I was at the beach and the waves were were really big. I mean, I mean the forecast said... said two meters but it was like like three. So I decided to to wait. I decided to go later.';
  {
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0) });
    await page.goto(URL + '#ocena'); await page.waitForTimeout(200);
    log('T7.btnAIhidden', await page.evaluate(() => { const b = [...document.querySelectorAll('#s-ocena button')].find(x => x.textContent === 'Oceń z Claude'); return { exists: !!b, hidden: b ? (b.classList.contains('hidden') || getComputedStyle(b).display === 'none') : null }; }));
    log('T7.buttons', await page.evaluate(() => [...document.querySelectorAll('#s-ocena button')].filter(b => getComputedStyle(b).display !== 'none').map(b => b.textContent)));
    log('T7.status', await txt(page, '#s-ocena .status'));
    await page.locator('#s-ocena textarea').fill(transcript);
    await page.locator('#s-ocena select').selectOption('en');
    await page.locator('#s-ocena input[inputmode=numeric]').fill('0:30');
    log('T7.metrics', await txt(page, '#s-ocena .metrics'));
    await page.locator('#s-ocena button', { hasText: 'Kopiuj prompt' }).click(); await page.waitForTimeout(200);
    log('T7.afterCopy', { status: await txt(page, '#s-ocena .status'), fallback: await page.evaluate(() => { const f = document.querySelector('#s-ocena .fallback textarea'); return f ? f.value.slice(0, 120) : null; }) });
    await page.locator('#s-ocena button', { hasText: 'Zapisz metryki' }).click();
    log('T7.history', await txt(page, '#s-ocena .alist'));
    await shot(page, '13_ocena_noclaude');
    log('T7.errors', page.__errors);
    await c.close();
  }
  // ---------- T8: with mocked window.claude ----------
  {
    const init = `
      window.__prompts = [];
      window.claude = { use: async function (n) { return n === 'sample' ? async function (prompt, opts) {
        window.__prompts.push(prompt);
        const full = '**Płynność**\\nDużo powtórzeń: „I I was", „were were". Tempo ok.\\n**Angielski**\\n| powiedziałeś | lepiej |\\n|---|---|\\n| I decided to to wait | I decided to wait |\\n| like like three | more like three |\\n3 zwroty: 1. the swell was bigger than forecast 2. I held off 3. I paddled out later\\n**Treść i samorozwój**\\nOpowiadasz ostrożnie. Pytanie: co by się stało, gdybyś wszedł?\\n**Zadanie na jutro**\\nJedno zdanie bez restartu.';
        for (let i = 1; i <= full.length; i += 25) { await new Promise(r => setTimeout(r, 5)); opts.onText && opts.onText({ text: full.slice(0, i) }); }
        return { text: full };
      } : null; } };`;
    const { c, page } = await ctx(browser, { init });
    await page.goto(URL + '#ocena'); await page.waitForTimeout(200);
    log('T8.btnAIvisible', await page.evaluate(() => { const b = [...document.querySelectorAll('#s-ocena button')].find(x => x.textContent === 'Oceń z Claude'); return { exists: !!b, visible: b ? getComputedStyle(b).display !== 'none' : null, box: b && b.getBoundingClientRect().height }; }));
    await page.locator('#s-ocena textarea').fill(transcript);
    await page.locator('#s-ocena select').selectOption('en');
    await page.locator('#s-ocena input[inputmode=numeric]').fill('0:30');
    await page.locator('#s-ocena button', { hasText: 'Oceń z Claude' }).click();
    await page.waitForTimeout(40);
    log('T8.midStream', { status: await txt(page, '#s-ocena .status'), partial: (await txt(page, '#s-ocena .result')).slice(0, 60) });
    await page.waitForTimeout(400);
    log('T8.final', { status: await txt(page, '#s-ocena .status'), h4s: await page.evaluate(() => [...document.querySelectorAll('#s-ocena .result h4')].map(h => h.textContent)), tableRows: await page.evaluate(() => document.querySelectorAll('#s-ocena .result table tr').length) });
    const prompts = await page.evaluate(() => window.__prompts);
    log('T8.promptEN', { count: prompts.length, hasAngielski: /\*\*Angielski\*\*/.test(prompts[0]), hasTable: prompts[0].includes('powiedziałeś → lepiej'), has3phr: /3 zwroty/.test(prompts[0]), hasSamorozwoj: prompts[0].includes('Treść i samorozwój'), hasZadanie: prompts[0].includes('Zadanie na jutro'), hasMetrics: /tempo \d+ słów\/min/.test(prompts[0]), langLine: (prompts[0].match(/język: \w+/) || [])[0] });
    log('T8.promptFull', prompts[0]);
    // PL prompt
    await page.locator('#s-ocena select').selectOption('pl');
    await page.locator('#s-ocena button', { hasText: 'Oceń z Claude' }).click(); await page.waitForTimeout(500);
    const p2 = await page.evaluate(() => window.__prompts[1]);
    log('T8.promptPL', { angSection: (p2.match(/\*\*Angielski\*\*[^\n]*/) || [])[0] });
    log('T8.history', await txt(page, '#s-ocena .alist'));
    await shot(page, '14_ocena_claude');
    await page.reload(); await page.waitForTimeout(200); await openToday(page);
    log('T8.historyAfterReload', (await txt(page, '#s-ocena .alist')).split('\n').length);
    await tab(page, 'postepy');
    log('T8.postepyOceny', await txt(page, '#s-postepy .stat'));
    log('T8.errors', page.__errors);
    await c.close();
  }

  // ---------- T9: mobile usability (R11) ----------
  {
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0) });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    const res = {};
    for (const t of ['dzis', 'ocena', 'postepy', 'sciagawka']) {
      await tab(page, t);
      await page.evaluate(() => { document.querySelectorAll('.card.collapsed').forEach(c => c.classList.remove('collapsed')); document.querySelectorAll('details').forEach(d => d.open = true); });
      res[t] = await page.evaluate(() => {
        const sw = document.documentElement.scrollWidth, bw = document.body.scrollWidth;
        const wide = [...document.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > 391).map(e => e.tagName + '.' + e.className + ':' + Math.round(e.getBoundingClientRect().right)).slice(0, 5);
        const small = [...document.querySelectorAll('button, a, summary')].filter(e => e.offsetParent !== null).map(e => { const r = e.getBoundingClientRect(); return { t: (e.textContent || '').trim().slice(0, 20), w: Math.round(r.width), h: Math.round(r.height) }; }).filter(x => x.w < 44 || x.h < 44);
        const fonts = {}; [...document.querySelectorAll('body *')].forEach(e => { if (e.offsetParent === null && e.tagName !== 'BODY') return; const hasText = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!hasText) return; const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 14) fonts[e.tagName + '.' + e.className + ':' + fs] = (e.textContent || '').trim().slice(0, 30); });
        const nav = document.getElementById('tabs').getBoundingClientRect();
        return { scrollWidth: sw, bodyWidth: bw, wide, smallTargets: small, smallFonts: fonts, nav: { top: Math.round(nav.top), bottom: Math.round(nav.bottom), pos: getComputedStyle(document.getElementById('tabs')).position } };
      });
    }
    log('T9.usability', res);
    // scroll to bottom on dzis, nav still visible
    await tab(page, 'dzis');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    log('T9.navAfterScroll', await page.evaluate(() => { const r = document.getElementById('tabs').getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight }; }));
    await page.screenshot({ path: OUT + '15_viewport_bottom.png' });
    log('T9.errors', page.__errors);
    await c.close();
  }
  // ---------- T10: localStorage throwing ----------
  {
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0), init: `Object.defineProperty(window, 'localStorage', { get() { throw new Error('SecurityError: localStorage blocked'); }, configurable: true });` });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    log('T10.h1', await txt(page, '#s-dzis h1'));
    const sr = page.locator('#s-dzis .card').filter({ has: page.locator('h2', { hasText: 'SR dnia' }) });
    await page.evaluate(() => { document.querySelectorAll('.card.collapsed').forEach(c => c.classList.remove('collapsed')); });
    await sr.locator('.sr').nth(0).locator('.chip').nth(2).click();
    await sr.locator('.sr').nth(1).locator('.chip').nth(4).click(); await page.waitForTimeout(50);
    log('T10.srDone', await page.evaluate(() => { const c = [...document.querySelectorAll('#s-dzis .card')].find(x => x.querySelector('h2').textContent === 'SR dnia'); return c.className; }));
    for (const t of ['ocena', 'postepy', 'sciagawka', 'dzis']) await tab(page, t);
    log('T10.errors', page.__errors);
    await c.close();
  }

  // ---------- T11: encouragement variety across days + topic pool ----------
  {
    const { c, page } = await ctx(browser, { time: new Date(2026, 10, 8, 10, 0, 0) });
    await page.goto(URL); await page.waitForTimeout(100); await openToday(page);
    log('T11.topicPool', await page.evaluate(() => { const src = document.querySelector('script:not([src])').textContent; const m = src.match(/var TOPICS = \[([\s\S]*?)\n  \];/); const rows = m[1].split('\n').filter(l => /^\s*\['/.test(l)); const tags = {}; rows.forEach(r => { const t = r.match(/\['([^']+)'/)[1]; tags[t] = (tags[t] || 0) + 1; }); return { count: rows.length, tags }; }));
    await c.close();
  }
  await browser.close();
  require('fs').writeFileSync(OUT + 'results.json', JSON.stringify(R, null, 1));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
