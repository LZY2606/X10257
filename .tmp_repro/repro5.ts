import { ModuleSet } from "../src/module_set.js";

const sources: Record<string, string> = {
  "ns1/shared.skir": `struct Shared { v: int32; }\n`,
  "ns2/shared.skir": `struct Shared { v: string; }\n`,
  "main.skir": `import Shared1 from "./ns1/shared.skir";\nimport Shared2 from "./ns2/shared.skir";\nstruct Box { one: Shared1; two: Shared2; missing: Nope; }\n`,
  "conflict.skir": `struct Conflict { a: int32 = 1; b: int32 = 1; }\n`,
};

function run(order: string[]) {
  const ms = ModuleSet.compile(new Map(order.map((p) => [p, sources[p]!])), "no-cache", "strict");
  return {
    errors: ms.errors.map((e) => `${e.token.line.modulePath}:${e.token.line.lineNumber}:${e.message}`),
    keys: [...ms.recordMap.keys()].sort(),
  };
}
console.log(JSON.stringify(run(Object.keys(sources)), null, 1));
console.log(JSON.stringify(run([...Object.keys(sources)].reverse()), null, 1));
