import { ModuleSet } from "./src/module_set.js";
import type { SkirError } from "skir-internal";
function fmt(e: SkirError){ return `${e.token.line.modulePath}:${e.token.line.lineNumber+1}:${"message" in e && e.message ? e.message : "expected "+("expected" in e ? e.expected : "")}`; }
function errs(ms: ModuleSet){ return ms.errors.map(fmt); }

// 3-way duplicate record numbers -> error message names depend on registry push order
const mk = () : [string,string][] => [
  ["s1.skir", `struct R1(50) {}\n`],
  ["s2.skir", `struct R2(50) {}\n`],
  ["s3.skir", `struct R3(50) {}\n`],
];
const ord1 = ModuleSet.compile(new Map(mk()), "no-cache", "strict");
const rev = mk().reverse();
const ord2 = ModuleSet.compile(new Map(rev), "no-cache", "strict");
console.log("dup 3-way ord1:", errs(ord1));
console.log("dup 3-way ord2:", errs(ord2));

// error aggregation order with several broken modules
const bad = (n:number) => `struct X${n} { v: Nope${n}; }\n`;
const names = ["d1.skir","d2.skir","d3.skir","d4.skir"];
const e1 = ModuleSet.compile(new Map(names.map((n,i)=>[n,bad(i+1)])), "no-cache", "strict");
const e2 = ModuleSet.compile(new Map(names.map((n,i)=>[n,bad(i+1)]).reverse()), "no-cache", "strict");
console.log("agg equal:", JSON.stringify(errs(e1))===JSON.stringify(errs(e2).reverse()) ? "reverse-of-each-other" : "DIFFER");
console.log("agg ord1:", errs(e1));
console.log("agg ord2:", errs(e2));

// caching: compile failing set, then fixed set with cache
const broken = new Map([["m.skir", `struct M { v: Missing; }\n`]]);
const failMs = ModuleSet.compile(broken, "no-cache", "strict");
console.log("fail errs:", errs(failMs).length);
const fixed = new Map([["m.skir", `struct M { v: int32; }\n`]]);
const retry = ModuleSet.compile(fixed, failMs, "strict");
console.log("retry errs:", errs(retry).length);
const fresh = ModuleSet.compile(fixed, "no-cache", "strict");
console.log("retry==fresh:", JSON.stringify([...retry.recordMap.keys()])===JSON.stringify([...fresh.recordMap.keys()]));

// cache with stale error propagation: dep broken, dep fixed later
const dep = new Map([["dep.skir", `struct D { v: Missing; }\n`], ["main.skir", `import { D } from "./dep.skir";\nstruct Main { d: D; }\n`]]);
const failDep = ModuleSet.compile(dep, "no-cache", "strict");
console.log("failDep errs:", errs(failDep));
const depFixed = new Map([["dep.skir", `struct D { v: int32; }\n`], ["main.skir", `import { D } from "./dep.skir";\nstruct Main { d: D; }\n`]]);
const retryDep = ModuleSet.compile(depFixed, failDep, "strict");
console.log("retryDep errs:", errs(retryDep));
