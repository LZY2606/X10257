import { ModuleSet } from "../src/module_set.js";

const a = `struct Dup {
  a: int32 = 0;
  b: int32 = 0;
}`;
const b = `struct Other { x: int32; }
struct Dup2 {
  a: int32 = 0;
  b: int32 = 0;
}`;

function run(order: [string,string][]) {
  const ms = ModuleSet.compile(new Map(order), "no-cache", "strict");
  return ms.errors.map(e => `${e.token.line.modulePath}:${e.token.line.lineNumber+1}: ${e.message}`);
}
const r1 = run([["a.skir", a], ["b.skir", b]]);
const r2 = run([["b.skir", b], ["a.skir", a]]);
console.log("order1", JSON.stringify(r1, null, 1));
console.log("order2", JSON.stringify(r2, null, 1));
console.log("same errors:", JSON.stringify(r1) === JSON.stringify(r2));

// modules iteration order
const ms1 = ModuleSet.compile(new Map([["a.skir", a], ["b.skir", b]]), "no-cache", "strict");
const ms2 = ModuleSet.compile(new Map([["b.skir", b], ["a.skir", a]]), "no-cache", "strict");
console.log("modules1:", [...ms1.modules.keys()]);
console.log("modules2:", [...ms2.modules.keys()]);
