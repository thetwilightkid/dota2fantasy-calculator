// One-off transform: the legacy dataset's Core/Support entries store each pair's SUM of the two
// players' scores, but the real Fantasy system averages a pair, not sums it (per the project
// owner). Since sum = 2 x average for a 2-person pair, halving every stat value on core/support
// rows converts them to the correct average - including `deaths`, whose affine formula
// (1950 - 195*deaths) was originally doubled the same way, so halving it lands on exactly
// 1950 - 195*avg(d1,d2). Mid rows (solo players) are untouched.
//   node scripts/halve-legacy-pairs.js

const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "data", "players.ts");
const src = fs.readFileSync(file, "utf8");

const lines = src.split("\n");
let changedLines = 0;
let changedValues = 0;

const out = lines.map((line) => {
  if (!/role:\s*"(core|support)"/.test(line)) return line;
  const statsMatch = line.match(/stats:\s*\{([^}]*)\}/);
  if (!statsMatch) return line;
  changedLines++;
  const rewritten = statsMatch[1].replace(/(-?\d+(?:\.\d+)?)/g, (num) => {
    changedValues++;
    const halved = parseFloat(num) / 2;
    return Number.isInteger(halved) ? String(halved) : halved.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  });
  return line.replace(statsMatch[0], `stats: {${rewritten}}`);
});

if (changedLines !== 32) throw new Error(`Expected to touch 32 core/support lines, touched ${changedLines}`);

fs.writeFileSync(file, out.join("\n"));
console.log(`Halved ${changedValues} stat values across ${changedLines} core/support player entries in data/players.ts.`);
