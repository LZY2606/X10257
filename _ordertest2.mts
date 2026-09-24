import { ModuleSet } from "./src/module_set.js";
const files: Record<string,string> = {
  "aaa.skir": "struct Aaa { x: Missing; }\n",
  "mmm.skir": "struct Mmm { x: Missing; }\n",
  "zzz.skir": "struct Zzz { x: Missing; }\n",
};
function run(order: string[]) {
  const map = new Map(order.map(k => [k, files[k]!]));
  const ms = ModuleSet.compile(map, "no-cache", "strict");
  return {
    moduleOrder: [...ms.modules.keys()],
    errors: ms.errors.map(e => `${e.token.line.modulePath}:${e.token.line.lineNumber}:${e.message}`),
    recordOrder: [...ms.recordMap.keys()],
  };
}
const keys = Object.keys(files);
const r1 = run(keys);
const r2 = run([...keys].reverse());
console.log("forward:", r1.moduleOrder, r1.recordOrder);
console.log("errors:", r1.errors);
console.log("reverse:", r2.moduleOrder, r2.recordOrder);
console.log("errors:", r2.errors);
console.log("stable errors:", JSON.stringify(r1.errors) === JSON.stringify(r2.errors));
console.log("stable records:", JSON.stringify(r1.recordOrder) === JSON.stringify(r2.recordOrder));
