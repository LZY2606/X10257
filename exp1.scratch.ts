import { ModuleSet } from "./src/module_set.js";
import { GENERATOR } from "skir-typescript-gen";

const mods: Record<string, string> = {
  "a.skir": `
struct Foo(10) {
  name: string;
  scores: [int32];
}
`,
  "b.skir": `
import { Foo } from "./a.skir";

struct Bar(20) {
  foo: Foo;
  maybe_foo: Foo?;
}
`,
  "c.skir": `
import * as a from "./a.skir";
import * as b from "./b.skir";

enum Kind(30) {
  alpha;
  beta;
}

struct Baz(31) {
  foo: a.Foo;
  bar: b.Bar;
  kind: Kind;
}
`,
};

function gen(order: string[]) {
  const map = new Map<string, string>();
  for (const k of order) map.set(k, mods[k]!);
  const ms = ModuleSet.compile(map, "no-cache", "strict");
  if (ms.errors.length) {
    console.log("ERRORS", ms.errors.map(e => e.message ?? e.expected));
    return "";
  }
  const out = GENERATOR.generateCode({
    modules: [...ms.modules.values()].map((r) => r.result),
    recordMap: ms.recordMap,
    config: {},
  });
  return out.files.map((f) => f.path + "\n" + f.code).join("\n===\n");
}
const orders = [
  ["a.skir", "b.skir", "c.skir"],
  ["c.skir", "b.skir", "a.skir"],
  ["b.skir", "c.skir", "a.skir"],
];
const results = orders.map(gen);
for (let i = 1; i < results.length; i++) {
  console.log(`order ${i} equal to order 0:`, results[i] === results[0]);
  if (results[i] !== results[0]) {
    const l1 = results[0]!.split("\n"), l2 = results[i]!.split("\n");
    for (let j = 0; j < Math.max(l1.length, l2.length); j++) {
      if (l1[j] !== l2[j]) { console.log("first diff at line", j, JSON.stringify(l1[j]), JSON.stringify(l2[j])); break; }
    }
  }
}
