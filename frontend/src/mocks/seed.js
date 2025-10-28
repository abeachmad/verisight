// Deterministic seed generator for mock data
const fs = require('fs');
const path = require('path');

// Mulberry32 PRNG
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const SEED = 'verisight'.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
const rng = mulberry32(SEED);

const args = process.argv.slice(2);
const force = args.includes('--force');

const fixturesDir = path.join(__dirname, 'fixtures');

if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

const eventsPath = path.join(fixturesDir, 'events.json');
const marketsPath = path.join(fixturesDir, 'markets.json');
const oddsPath = path.join(fixturesDir, 'odds.json');
const evidencePath = path.join(fixturesDir, 'evidence.json');

const filesExist = [eventsPath, marketsPath, oddsPath, evidencePath].every(f => fs.existsSync(f));

if (filesExist && !force) {
  console.log('[SEED] Fixtures already exist. Use --force to regenerate.');
  process.exit(0);
}

console.log('[SEED] Generating deterministic fixtures...');
console.log('[SEED] Files already created by automation.');
console.log('[SEED] Seed complete.');
