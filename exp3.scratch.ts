import { ModuleSet } from "./src/module_set.js";
import { GENERATOR } from "skir-typescript-gen";

function compile(mods: Record<string,string>, cache: ModuleSet | "no-cache" = "no-cache") {
  const map = new Map(Object.entries(mods));
  return ModuleSet.compile(map, cache, "strict");
}
function errSig(ms: ModuleSet) {
  return ms.errors.map(e => `${e.token.line.modulePath}:${e.token.position}:${e.message ?? e.expected}`);
}
function genBytes(ms: ModuleSet) {
  const out = GENERATOR.generateCode({
    modules: [...ms.modules.values()].map((r) => r.result),
    recordMap: ms.recordMap,
    config: {},
  });
  return out.files.map((f) => f.path + "\n" + f.code).join("\n===\n");
}

// 1. cycle
const cycle = {
  "a.skir": `import { B } from "./b.skir";\nstruct A { b: B; }\n`,
  "b.skir": `import { A } from "./a.skir";\nstruct B { a: A; }\n`,
};
const c1 = compile(cycle);
console.log("cycle errors:", errSig(c1));
const cycleRev = Object.fromEntries(Object.entries(cycle).reverse());
console.log("cycle reversed same:", JSON.stringify(errSig(compile(cycleRev))) === JSON.stringify(errSig(c1)), errSig(compile(cycleRev)));

// 2. unknown type
const unknown = { "a.skir": `struct A { x: DoesNotExist; }\n` };
const u1 = compile(unknown);
console.log("unknown errors:", errSig(u1));
console.log("unknown repeatable:", JSON.stringify(errSig(compile(unknown))) === JSON.stringify(errSig(u1)));

// 3. duplicate field number
const dup = { "a.skir": `struct A {\n  a: int32 = 0;\n  b: int32 = 0;\n}\n` };
console.log("dup errors:", errSig(compile(dup)));

// 4. duplicate record numbers across modules
const dupRec = {
  "a.skir": `struct A(5) {}\n`,
  "b.skir": `struct B(5) {}\n`,
};
console.log("dup record errors:", errSig(compile(dupRec)));
console.log("dup record reversed:", errSig(compile(Object.fromEntries(Object.entries(dupRec).reverse()))));

// 5. mid-pipeline failure + recovery with cache from failed compile
const good = {
  "a.skir": `struct Foo(10) {\n  name: string;\n}\n`,
  "b.skir": `import { Foo } from "./a.skir";\nstruct Bar(20) {\n  foo: Foo;\n}\n`,
};
const goodSet = compile(good);
const broken = { ...good, "c.skir": `import { Foo } from "./a.skir";\nstruct Baz(30) {\n  foo: Foo;\n  bad: Nope;\n}\n` };
const failedSet = compile(broken, goodSet);
console.log("failed errors:", errSig(failedSet));
const fixed = { ...good, "c.skir": `import { Foo } from "./a.skir";\nstruct Baz(30) {\n  foo: Foo;\n  ok: int32;\n}\n` };
const recovered = compile(fixed, failedSet);
const fresh = compile(fixed);
console.log("recovered errors:", recovered.errors.length);
console.log("recovered bytes == fresh bytes:", genBytes(recovered) === genBytes(fresh));
// model equality: recordMap keys
console.log("recovered keys == fresh keys:", JSON.stringify([...recovered.recordMap.keys()]) === JSON.stringify([...fresh.recordMap.keys()]));
// reuse failed cache again
const recovered2 = compile(fixed, failedSet);
console.log("recovered2 == recovered:", genBytes(recovered2) === genBytes(recovered));
