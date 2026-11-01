// node tests.cjs — 測試 index.html 內 /*ENGINE-START*/…/*ENGINE-END*/ 的 PRAM 引擎
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/index.html', 'utf8');
const code = src.split('/*ENGINE-START*/')[1].split('/*ENGINE-END*/')[0];
const m = { exports: {} };
new Function('module', code)(m);
const P = m.exports;

let n = 0, fail = 0;
const eq = (a, b, msg) => { n++; const ok = JSON.stringify(a) === JSON.stringify(b); if (!ok) { fail++; console.log('FAIL', msg, '→', a, '≠', b); } };
const items = (O2, Supra, Scalene, Air, Wheeze) => ({ O2, Supra, Scalene, Air, Wheeze });

// 評分
eq(P.score(items(0, 0, 0, 0, 0)), 0, 'min score');
eq(P.score(items(2, 2, 2, 3, 3)), 12, 'max score');
eq(P.score(items(1, 0, 2, 1, 1)), 5, 'mixed score');
let threw = false; try { P.score(items(3, 0, 0, 0, 0)); } catch (e) { threw = true; }
eq(threw, true, 'invalid O2 value rejected');
threw = false; try { P.score(items(0, 1, 0, 0, 0)); } catch (e) { threw = true; }
eq(threw, true, 'suprasternal 1 is not a valid PRAM value');

// 嚴重度 (GINA 2026 Fig 9 / TREKK)
eq([0, 1, 3, 4, 7, 8, 10, 11, 12].map(s => P.severity(s, false).key),
  ['mild', 'mild', 'mild', 'mod', 'mod', 'sev', 'sev', 'crit', 'crit'], 'severity bands');
eq(P.severity(2, true).key, 'crit', 'impending failure overrides score');

// 劑量 (TREKK 2024)
let d = P.doses(19.9);
eq([d.salbutamol.mdi, d.salbutamol.neb, d.salbutamol.cont], [5, 2.5, 7.5], 'salbutamol <20 kg');
d = P.doses(20);
eq([d.salbutamol.mdi, d.salbutamol.neb, d.salbutamol.cont], [10, 5, 15], 'salbutamol ≥20 kg');
eq([d.ipratropium.mdi, d.ipratropium.neb, d.ipratropium.cont], [4, 250, 750], 'ipratropium all weights');
d = P.doses(12.5);
eq(d.dex, { dose: 7.5, capped: false }, 'dex 0.6 mg/kg');
eq(d.predEd, { dose: 25, capped: false }, 'pred ED 2 mg/kg');
eq(d.predHome, { dose: 13, capped: false }, 'pred home 1 mg/kg rounded');
eq(d.methylpred.dose, 25, 'methylpred 2 mg/kg');
eq(d.hydrocort.dose, 100, 'hydrocortisone 8 mg/kg');
eq(d.mg, { dose: 625, capped: false }, 'Mg 50 mg/kg');
eq(d.bolus.dose, 250, 'bolus 20 mL/kg');
eq(d.epi.dose, 0.13, 'epi 0.01 mg/kg');
d = P.doses(45);
eq([d.dex.dose, d.dex.capped], [12, true], 'dex cap 12');
eq([d.predEd.dose, d.predEd.capped, d.predHome.dose], [60, true, 45], 'pred caps');
eq([d.methylpred.dose, d.hydrocort.dose], [80, 360], 'methylpred cap 80');
eq([d.mg.dose, d.mg.capped], [2000, true], 'Mg cap 2 g');
eq(d.epi.dose, 0.45, 'epi 45 kg');
eq(P.doses(70).epi.dose, 0.5, 'epi max 0.5');
eq(P.doses(6).epi.dose, 0.1, 'epi min 0.1');
eq(P.doses(3.3).dex.dose, 2, 'dex 1-decimal rounding');

// 處置建議
eq(P.guideline('mild', false).some(x => x.includes('非常規')), true, 'mild: OCS not routine');
eq(P.guideline('mod', false).some(x => x.includes('q20min × 3')), true, 'moderate: q20min x3');
eq(P.guideline('crit', false).some(x => x.includes('IV 類固醇')), true, 'crit: IV steroid');
eq(P.guideline('sev', false).some(x => x.includes('IV 類固醇')), false, 'severe: oral steroid, not IV');
eq(P.guideline('mild', true)[0].includes('epinephrine'), true, 'anaphylaxis first');

// 警示
eq(P.warnings(15, 4).length, 0, 'plausible weight/age');
eq(P.warnings(15, 0.5).some(x => x.includes('未滿 1 歲')), true, '<1 y warning');
eq(P.warnings(60, 18).some(x => x.includes('≥ 18 歲')), true, 'adult warning');
eq(P.warnings(200, null).length, 1, 'weight out of range');
eq(P.warnings(50, 2).some(x => x.includes('差距大')), true, 'weight/age mismatch');

// 再評估 (TREKK)
let r = P.reassess(2, '2-4h', 6, 0);
eq(r.key, 'good', 'good response');
eq(r.lines.some(x => x.includes('ICS')), true, 'initial ≥4 → ICS at discharge');
eq(P.reassess(2, '2-4h', 2, 0).lines.some(x => x.includes('ICS')), false, 'initial mild → no ICS line');
eq(P.reassess(3, '1h', 5, 2).lines.some(x => x.includes('SpO₂ < 92%')), true, 'SpO2 <92 blocks discharge');
r = P.reassess(5, '4-6h', 9, 1);
eq([r.key, r.head.includes('住院')], ['partial', true], 'persistent ≥4 after 4-6 h → admit');
eq(P.reassess(5, '1h', 9, 1).head.includes('留觀'), true, 'partial at 1 h → observe');
r = P.reassess(9, '2-4h', 9, 2);
eq([r.key, r.lines.some(x => x.includes('聯絡 PICU'))], ['poor', true], 'persistent ≥8 → PICU');

// 教學內容
const block = (a, b, name) => new Function(src.split(a)[1].split(b)[0] + `\nreturn ${name};`)();
const CASES = block('/*CASES-START*/', '/*CASES-END*/', 'CASES');
const QUIZ = block('/*QUIZ-START*/', '/*QUIZ-END*/', 'QUIZ');
const MAP = block('/*MAP-START*/', '/*MAP-END*/', 'MIND_MAP');

eq(CASES.length, 6, '6 cases');
for (const c of CASES) {
  const s = P.score(c.items);
  eq(s, c.expect.score, c.id + ' score');
  eq(P.severity(s, c.impending).key, c.expect.sev, c.id + ' severity');
  eq(c.reassess.map(r => P.reassess(P.score(r.items), r.time, s, r.items.O2).key), c.expect.re, c.id + ' reassess');
  eq(P.warnings(c.wt, c.age), [], c.id + ' plausible age/weight');
}
const caseOf = id => CASES.find(c => c.id === id);
eq(P.doses(caseOf('c3').wt).dex, { dose: 12, capped: true }, 'c3 dex capped from 18 mg');
eq(P.doses(caseOf('c3').wt).mg.dose, 1500, 'c3 Mg');
eq(0.6 * caseOf('c6').wt, 24, 'c6 dex raw 24 mg in text');
eq(P.doses(caseOf('c6').wt).epi.dose, 0.4, 'c6 epi');
eq(0.6 * caseOf('c3').wt, 18, 'c3 dex raw 18 mg in text');
eq(caseOf('c5').impending && P.doses(caseOf('c5').wt).hydrocort.dose, 96, 'c5 hydrocortisone');

eq(QUIZ.length, 20, '20 questions');
eq(QUIZ.filter(q => q.lv === 'basic').length, 10, '10 basic');
eq(QUIZ.filter(q => q.lv === 'adv').length, 10, '10 advanced');
eq([0, 1, 2, 3].map(a => QUIZ.filter(q => q.ans === a).length), [5, 5, 5, 5], 'A–D 5 each');
for (const q of QUIZ) {
  eq(q.options.length, 4, 'four options: ' + q.q);
  eq(new Set(q.options).size, 4, 'distinct options: ' + q.q);
  eq(!!(q.expl && q.src), true, 'explained and sourced: ' + q.q);
}
// 考題中的計算對引擎驗證
const qFind = t => QUIZ.find(q => q.q.includes(t));
const right = q => q.options[q.ans];
eq(right(qFind('SpO₂ 93%')), String(P.score(items(1, 2, 0, 1, 1))), 'Q score 5');
eq(P.severity(8, false).key, 'sev', 'Q PRAM 8');
eq(right(qFind('體重 20 kg')), P.doses(20).salbutamol.mdi + ' puffs', 'Q salbutamol 20 kg');
eq(right(qFind('15 kg')), P.doses(15).dex.dose + ' mg', 'Q dex 15 kg');
eq(right(qFind('28 kg')).startsWith(P.doses(28).mg.dose + ' mg'), true, 'Q Mg 28 kg');
eq(right(qFind('牛奶蛋白')).includes(P.doses(20).hydrocort.dose + ' mg'), true, 'Q hydrocortisone 20 kg');
eq(right(qFind('35 kg')).includes(P.doses(35).epi.dose + ' mg'), true, 'Q epi 35 kg');
eq(P.reassess(5, '4-6h', 7, 0).head.includes('住院'), true, 'Q PRAM 5 after 5 h');
eq(P.warnings(8, 0.67).some(x => x.includes('未滿 1 歲')), true, 'Q 8 months warns');

const mapText = JSON.stringify(MAP);
eq(MAP.branches.length, 6, 'map branches');
for (const t of ['0.6 mg/kg', '8 mg/kg', '50 mg/kg', '20 mL/kg', '0.01 mg/kg', 'max 12 mg', 'max 400 mg', 'max 2 g', '750 mcg', '15 mg/hr'])
  eq(mapText.includes(t), true, 'map has ' + t);

console.log(`${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
