// Regression tests for the article ToC scroll-spy (_includes/article.njk).
//
// The spy lives in an inline <script> in the Nunjucks layout, so there is
// nothing to import. This file re-states the algorithm and exercises it against
// synthetic layouts. That duplication is the cost of keeping the script inline,
// so the SOURCE GUARD at the bottom pins the expressions this model mirrors: if
// the real code changes shape, the guard fails and tells you to update the
// model rather than letting the two drift apart silently.
//
// Run with: npm test

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = readFileSync(join(ROOT, '_includes', 'article.njk'), 'utf8');

let failures = 0;
function check(name, got, want) {
  const g = JSON.stringify(got);
  const w = JSON.stringify(want);
  if (g === w) {
    console.log(`  ok   ${name}`);
  } else {
    failures++;
    console.log(`  FAIL ${name}\n         got  ${g}\n         want ${w}`);
  }
}
function section(title) {
  console.log(`\n${title}`);
}

// ---------------------------------------------------------------------------
// Model of thresholds() / electActive() / segmentMidpoint().
// docTops are absolute document positions; rendered[] marks which headings have
// a non-zero rect (an unrendered heading is skipped entirely, as in the source).
// ---------------------------------------------------------------------------

const ACTIVE_BAND = 0.25;
const SLACK = 2;
const VIEWPORT = 900;

function thresholds(docTops, rendered, maxScroll) {
  const bandBottom = VIEWPORT * ACTIVE_BAND;
  const live = [];
  const tops = [];
  docTops.forEach((top, i) => {
    if (!rendered[i]) return;
    live.push(i);
    tops.push(top);
  });
  const t = tops.map((top, i) =>
    Math.max(top - bandBottom - SLACK, i === 0 ? -Infinity : tops[i - 1])
  );
  const first = t.findIndex((x) => x >= maxScroll);
  if (first !== -1) {
    const zoneStart = first === 0 ? 0 : t[first - 1];
    const step = (maxScroll - zoneStart) / (t.length - first + 1);
    for (let i = first; i < t.length; i++) t[i] = zoneStart + step * (i - first + 1);
  }
  return { live, t, first };
}

function electActive(docTops, maxScroll, scrollY, rendered) {
  rendered = rendered || docTops.map(() => true);
  const { live, t } = thresholds(docTops, rendered, maxScroll);
  if (!live.length) return null;
  if (maxScroll <= 0) return live[0];
  let active = 0;
  let best = -Infinity;
  for (let i = 0; i < t.length; i++) {
    if (scrollY > t[i] && t[i] > best) {
      best = t[i];
      active = i;
    }
  }
  return live[active];
}

function segmentMidpoint(docTops, maxScroll, index, rendered) {
  rendered = rendered || docTops.map(() => true);
  if (maxScroll <= 0) return null;
  const { live, t } = thresholds(docTops, rendered, maxScroll);
  const i = live.indexOf(index);
  if (i === -1) return null;
  const next = i + 1 < t.length ? t[i + 1] : maxScroll;
  const landing = Math.min(docTops[index], maxScroll);
  if (landing > t[i] && landing <= next) return null;
  return (t[i] + next) / 2;
}

// Where native anchor navigation would put you: the heading's document top,
// clamped to the scrollable range.
const nativeLanding = (docTop, maxScroll) => Math.min(docTop, Math.max(0, maxScroll));

// ---------------------------------------------------------------------------

// A short section followed closely by the next heading: both sit in the band
// together after a jump, which is the case topmost-wins exists for.
const TIE = [1000, 3000, 3100, 5000];
const TIE_MAX = 8000;

section('election: the band rule');
check('deep-link to a heading elects it, not the one after', electActive(TIE, TIE_MAX, 3000), 1);
check('deep-link to the following heading elects that', electActive(TIE, TIE_MAX, 3100), 2);
check('band empty falls back to the last heading above the top', electActive(TIE, TIE_MAX, 3400), 2);
check('above every heading holds the first', electActive(TIE, TIE_MAX, 0), 0);
check('page bottom holds the last', electActive(TIE, TIE_MAX, TIE_MAX), 3);
check('a page with no scroll holds the first', electActive(TIE, 0, 0), 0);

section('election: strictness of the comparison');
{
  // The scan must use > and not >=. At an anchor landing, scrollY sits exactly
  // on the next heading's predecessorClearsTop term; >= would let it tie and win.
  const { t } = thresholds(TIE, [true, true, true, true], TIE_MAX);
  const loose = (() => {
    let active = 0;
    let best = -Infinity;
    for (let i = 0; i < t.length; i++) {
      if (3000 >= t[i] && t[i] >= best) {
        best = t[i];
        active = i;
      }
    }
    return active;
  })();
  check('strict > elects the target', electActive(TIE, TIE_MAX, 3000), 1);
  check('a >= scan would regress to the next heading', loose, 2);
}

section('trapped trailing headings');
const TAIL = [1000, 4800, 4900];
const TAIL_MAX = 4600;
check('before the respaced threshold, the reachable heading holds', electActive(TAIL, TAIL_MAX, 4575), 1);
check('at the page bottom, the last heading holds', electActive(TAIL, TAIL_MAX, TAIL_MAX), 2);
check('overscroll clamps to the last heading', electActive(TAIL, TAIL_MAX, TAIL_MAX + 300), 2);

const ALL_TRAPPED = [1000, 1100];
check('all trapped: top of page holds the first', electActive(ALL_TRAPPED, 500, 0), 0);
check('all trapped: bottom of page holds the last', electActive(ALL_TRAPPED, 500, 500), 1);

// Regression: the original two-driver spy asked "can this heading reach the
// band" instead of "can it become topmost in the band", so a heading whose
// predecessor never clears the viewport top could never be elected at all.
section('regression: predecessor never clears the top');
{
  const tops = [1000, 4100, 4200];
  const max = 4000;
  const reached = new Set();
  for (let y = 0; y <= max; y += 0.5) reached.add(electActive(tops, max, y));
  check('every heading is reachable at some scroll position', reached.size, tops.length);
  check('the last heading holds at the bottom', electActive(tops, max, max), 2);
}

section('unrendered headings are skipped');
{
  // An unrendered heading reports an all-zero rect, so its computed document
  // top tracks the scroll position. It must not participate at all.
  const rendered = [true, false, true, true];
  const reached = new Set();
  for (let y = 0; y <= TIE_MAX; y += 1) reached.add(electActive(TIE, TIE_MAX, y, rendered));
  check('a hidden heading is never elected', reached.has(1), false);
  check('the headings around it still elect normally', electActive(TIE, TIE_MAX, 3100, rendered), 2);
  check('no rendered headings means no selection', electActive(TIE, TIE_MAX, 500, [false, false, false, false]), null);
}

section('election survives visual order != document order');
{
  // Float, grid order and absolute positioning can put a heading's box above
  // its predecessor's. Selecting by largest threshold needs no ordering
  // assumption; selecting by last index passed would.
  const jumbled = [1000, 5000, 1200, 1300, 1400];
  const max = 9000;
  const reached = new Set();
  for (let y = 0; y <= max; y += 1) reached.add(electActive(jumbled, max, y));
  check('every heading still gets a turn', reached.size, jumbled.length);
}

section('clicking a trapped entry');
{
  // Native navigation clamps to the bottom, where the LAST heading wins, so a
  // trapped entry has to be corrected to the middle of its own segment.
  check(
    'native landing on a trapped heading elects the wrong one',
    electActive(TAIL, TAIL_MAX, nativeLanding(4800, TAIL_MAX)),
    2
  );
  // Heading 1 has a REACHABLE threshold (the respacing leaves it alone) but an
  // unreachable document top, so the browser still overshoots it. The criterion
  // has to be the landing position, not whether the heading was respaced.
  const mid = segmentMidpoint(TAIL, TAIL_MAX, 1);
  check('a heading the browser overshoots is corrected', typeof mid, 'number');
  check('the correction elects the heading that was clicked', electActive(TAIL, TAIL_MAX, mid), 1);
  check('reachable headings are left to the browser', segmentMidpoint(TAIL, TAIL_MAX, 0), null);
  check('an unknown id is left to the browser', segmentMidpoint(TAIL, TAIL_MAX, 99), null);
  check('a page with no scroll is left to the browser', segmentMidpoint(TAIL, 0, 1), null);

  // Every entry the browser would get wrong, not just the first.
  const dense = [500, 4000, 4100, 4200, 4300];
  const denseMax = 3900;
  let corrected = 0;
  let allCorrect = true;
  dense.forEach((_, k) => {
    const y = segmentMidpoint(dense, denseMax, k);
    if (y === null) {
      if (electActive(dense, denseMax, nativeLanding(dense[k], denseMax)) !== k) allCorrect = false;
    } else {
      corrected++;
      if (electActive(dense, denseMax, y) !== k) allCorrect = false;
    }
  });
  check('every entry lands on itself, corrected or not', allCorrect, true);
  check('and some genuinely needed correcting', corrected > 0, true);
}

section('structural invariants');
for (const [name, tops, max] of [
  ['tie layout', TIE, TIE_MAX],
  ['trapped tail', TAIL, TAIL_MAX],
  ['all trapped', ALL_TRAPPED, 500],
]) {
  const { t } = thresholds(tops, tops.map(() => true), max);
  check(`${name}: thresholds strictly increasing`, t.every((x, i) => i === 0 || x > t[i - 1]), true);
  check(`${name}: thresholds below the end of scroll`, t.every((x) => x < max), true);
}

// ---------------------------------------------------------------------------
// Source guard. These are the expressions the model above mirrors. If you
// change the algorithm in article.njk, update this file to match and then
// update these pins.
// ---------------------------------------------------------------------------

section('source guard (model matches article.njk)');
const PINS = [
  ['band constant', 'const ACTIVE_BAND = 0.25;'],
  ['slack constant', 'const SLACK = 2;'],
  ['threshold is the later of two crossings', 'Math.max(entersBand, predecessorClearsTop)'],
  ['band crossing term', 'const entersBand = top - bandBottom - SLACK;'],
  ['predecessor crossing term', 'const predecessorClearsTop = i === 0 ? -Infinity : tops[i - 1];'],
  ['trapped test is at-or-past the end', 't.findIndex((x) => x >= maxScroll)'],
  ['respacing is even', 't[i] = zoneStart + step * (i - first + 1);'],
  ['scan takes the largest threshold passed, strictly', 'if (window.scrollY > t[i] && t[i] > best) {'],
  ['unrendered headings are dropped', 'if (rect.width === 0 && rect.height === 0) continue;'],
  ['trapped clicks are corrected', 'const y = segmentMidpoint(heading.id);'],
  ['correction keys off the landing position', 'if (landing > t[i] && landing <= next) return null;'],
];
for (const [name, snippet] of PINS) {
  check(name, SOURCE.includes(snippet), true);
}

console.log(
  failures ? `\n${failures} failing\n` : '\nall passing\n'
);
process.exit(failures ? 1 : 0);
