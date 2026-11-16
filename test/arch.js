// Strażnik architektury (A7): reguły „S” z wiki/architektura/Zasady architektury.md. Bez zależności.
// Uruchomienie: node test/arch.js  → wypisuje naruszenia „plik:linia Zn opis” i liczbę linii; exit 1 przy naruszeniu.
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', 'app');
const FILES = ['index.html', 'styles.css', 'data.js', 'app.js', 'store.js', 'domain.js']; // Z1
const JS = ['data.js', 'app.js', 'store.js', 'domain.js'];
// Reguły: { id, re, files: gdzie sprawdzać, allow: gdzie wolno }
const RULES = [
  { id: 'Z2', re: /localStorage/, files: JS, allow: ['store.js'], msg: 'localStorage poza store.js' },
  { id: 'Z3', re: /\bfunction\s*\w*\s*\(|=>|\)\s*\{|\bdocument\.|\blocalStorage\b/, files: ['data.js'], msg: 'data.js to tylko dane' },
  { id: 'Z4', re: /\bdocument\b|\bwindow\b|\blocalStorage\b/, files: ['domain.js'], msg: 'domain.js bez ekranu i stanu' },
  { id: 'Z6', re: /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket/, files: FILES, msg: 'sieć' },
  { id: 'Z6', re: /(?:https?:)?\/\/[a-z0-9.-]+\.[a-z]{2,}/i, files: ['index.html', 'styles.css'], msg: 'adres zewnętrzny' },
  { id: 'Z7', re: /^\s*(?:import|export)\s|type=["']?module/, files: FILES, msg: 'moduły ES' },
  { id: 'Z8', re: /^(?:var|let|const|function)\s+(?!PLYN_(?:DATA|STORE|DOMAIN)\b)\w+/, files: ['data.js', 'store.js', 'domain.js'], msg: 'obiekt globalny spoza PLYN_DATA / PLYN_STORE / PLYN_DOMAIN' },
  { id: 'Z8', re: /^(?:var|let|const|function)\s+\w+|\b(?:window|globalThis)(?:\.\w+|\[[^\]]+\])\s*=[^=]/, files: ['app.js'], msg: 'app.js nie wystawia nic' }
];
// Wyjątki z datą ważności – ta sama lista co w Zasady architektury.md
const EXCEPTIONS = [
  { id: 'Z2', file: 'app.js', until: 'E2 (powstaje store.js)' },
  { id: 'Z5', file: 'app.js', until: 'E2 (sonda probeSample przy starcie; pilnuje recenzent)' },
  { id: 'Z10', file: 'app.js', until: 'E2 („Kopiuj dane” ze szkicem; pilnuje recenzent)' }
];
const out = [], sizes = [];
const present = fs.readdirSync(DIR).filter(f => !f.startsWith('.'));
present.filter(f => !FILES.includes(f)).forEach(f => out.push(`app/${f}:0 Z1 plik spoza listy (${FILES.join(', ')})`));
const src = {};
present.filter(f => FILES.includes(f)).forEach(f => { src[f] = fs.readFileSync(path.join(DIR, f), 'utf8').replace(/\n$/, '').split('\n'); sizes.push([f, src[f].length]); });
const isComment = (l) => /^\s*(\/\/|\/\*|\*|<!--)/.test(l);
for (const r of RULES) for (const f of r.files) {
  if (!src[f] || (r.allow || []).includes(f) || EXCEPTIONS.some(e => e.id === r.id && e.file === f)) continue;
  src[f].forEach((l, i) => { if (!isComment(l) && r.re.test(l)) out.push(`app/${f}:${i + 1} ${r.id} ${r.msg}: ${l.trim().slice(0, 80)}`); });
}
// Z5: claude.use tylko w jednym pliku; Z7: w index.html żadnego kodu w <script>
const useIn = Object.keys(src).filter(f => src[f].some(l => !isComment(l) && /claude\.use\s*\(/.test(l)));
if (useIn.length > 1) out.push(`app/${useIn[1]}:0 Z5 claude.use w więcej niż jednym pliku: ${useIn.join(', ')}`);
if (src['index.html']) (src['index.html'].join('\n').match(/<script(?![^>]*\ssrc=)[^>]*>[\s\S]*?<\/script>/g) || []).forEach(() => out.push('app/index.html:0 Z7 kod w <script> w index.html'));
out.forEach(l => console.log(l));
sizes.forEach(([f, n]) => console.log(`${String(n).padStart(6)}  app/${f}`));
console.log(`${String(sizes.reduce((a, s) => a + s[1], 0)).padStart(6)}  razem` + (EXCEPTIONS.length ? `\nwyjątki: ${EXCEPTIONS.map(e => e.id + ' w ' + e.file + ' do ' + e.until).join('; ')}` : ''));
console.log(out.length ? `ARCH FAIL: ${out.length} naruszeń` : 'ARCH OK');
process.exitCode = out.length ? 1 : 0;
