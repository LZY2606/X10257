import { ModuleSet } from "./src/module_set.js";
import { GENERATOR as tsGen } from "skir-typescript-gen";
import { GENERATOR as pyGen } from "skir-python-gen";

const MOD_A = `
struct Foo {
  a: int32;
  b: string;
}
`;
const MOD_B = `
import * as a from "./a.skir";
struct Bar {
  foo: a.Foo;
  foos: [a.Foo];
}
`;

function compile(paths: Array<[string, string]>, cache: ModuleSet | "no-cache" = "no-cache") {
  return ModuleSet.compile(new Map(paths), cache, "strict");
}

function genFiles(ms: ModuleSet) {
  const input = {
    modules: [...ms.modules.values()].map((r) => r.result),
    recordMap: ms.recordMap,
    config: {} as never,
  };
  const files = new Map<string, string>();
  for (const g of [tsGen, pyGen]) {
    for (const f of g.generateCode(input as never).files) {
      files.set(g.id + ":" + f.path, f.code);
    }
  }
  return files;
}

function diff(a: Map<string, string>, b: Map<string, string>): string[] {
  const out: string[] = [];
  for (const [k, v] of a) {
    if (!b.has(k)) out.push("missing in b: " + k);
    else if (b.get(k) !== v) out.push("differ: " + k);
  }
  for (const k of b.keys()) if (!a.has(k)) out.push("missing in a: " + k);
  return out;
}

// 1. permutation
const base = compile([["a.skir", MOD_A], ["b.skir", MOD_B]]);
console.log("base errors:", base.errors.length);
const perm = compile([["b.skir", MOD_B], ["a.skir", MOD_A]]);
console.log("permutation diff:", diff(genFiles(base), genFiles(perm)));

// 2. newline variants
const MOD_A_NL = "\n\nstruct Foo {\r\n  a: int32;\n\n  b: string;\r\n}\n\n";
const nl = compile([["a.skir", MOD_A_NL], ["b.skir", MOD_B]]);
console.log("newline errors:", nl.errors.length);
console.log("newline diff:", diff(genFiles(base), genFiles(nl)));

// 3. cache reuse after failure
const BAD_B = MOD_B.replace("a.Foo;", "a.DoesNotExist;");
const bad = compile([["a.skir", MOD_A], ["b.skir", BAD_B]]);
console.log("bad errors:", bad.errors.map((e) => e.message));
const goodAfterBad = compile([["a.skir", MOD_A], ["b.skir", MOD_B]], bad);
console.log("good-after-bad errors:", goodAfterBad.errors.length);
console.log("good-after-bad diff:", diff(genFiles(base), genFiles(goodAfterBad)));

// 4. cache from success
const goodCache = compile([["a.skir", MOD_A], ["b.skir", MOD_B]], base);
console.log("good-cache diff:", diff(genFiles(base), genFiles(goodCache)));

// 5. record keys
console.log("keys:", [...base.recordMap.keys()]);
