import { ModuleSet } from "./src/module_set.js";
import { GENERATOR } from "skir-typescript-gen";

const files: Array<[string, string]> = [
  ["a/alpha.skir", `
    import * as beta from "../b/beta.skir";
    struct Foo(1) {
      bar: beta.Bar;
      name: string;
    }
    enum Color(2) { RED = 1; GREEN = 2; }
  `,
  ],
  ["b/beta.skir", `
    import * as alpha from "../a/alpha.skir";
    struct Bar(3) {
      foo: alpha.Foo;
      colors: [alpha.Color];
    }
  `,
  ],
  ["c/gamma.skir", `
    struct Foo(4) {
      // same name as a/alpha.Foo but different namespace
      id: int32;
    }
    method GetFoo(Foo): Foo = 1;
  `,
  ],
];

function compileAndGen(order: number[]) {
  const map = new Map<string, string>();
  for (const i of order) map.set(files[i]![0], files[i]![1]);
  const ms = ModuleSet.compile(map, "no-cache", "strict");
  if (ms.errors.length) {
    return { errors: ms.errors.map(e => `${e.token.line.modulePath}:${e.token.line.lineNumber}:${e.message}`) };
  }
  const out = GENERATOR.generateCode({
    modules: [...ms.modules.values()].map(r => r.result),
    recordMap: ms.recordMap,
    config: {},
  });
  return { files: out.files.map(f => [f.path, f.code] as const), moduleOrder: [...ms.modules.keys()] };
}

const r1 = compileAndGen([0,1,2]);
const r2 = compileAndGen([2,1,0]);
console.log("module order 1:", (r1 as any).moduleOrder);
console.log("module order 2:", (r2 as any).moduleOrder);
const s1 = JSON.stringify(r1);
const s2 = JSON.stringify(r2);
console.log("identical full output:", s1 === s2);
// per-path comparison
const m1 = new Map((r1 as any).files); const m2 = new Map((r2 as any).files);
let perPathSame = true;
for (const [k, v] of m1) { if (m2.get(k) !== v) { perPathSame = false; console.log("DIFF in", k); } }
console.log("per-path bytes identical:", perPathSame);

// duplicate record numbers: which module gets the error?
const dupFiles: Array<[string,string]> = [
  ["m1.skir", "struct A(10) { x: int32; }"],
  ["m2.skir", "struct B(10) { y: int32; }"],
];
for (const order of [[0,1],[1,0]]) {
  const map = new Map<string,string>();
  for (const i of order) map.set(dupFiles[i]![0], dupFiles[i]![1]);
  const ms = ModuleSet.compile(map, "no-cache", "strict");
  console.log("order", order, "errors:", ms.errors.map(e => `${e.token.line.modulePath}: ${e.message}`));
}
