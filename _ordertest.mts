import { ModuleSet } from "./src/module_set.js";
import { GENERATOR } from "skir-typescript-gen";
const files: Record<string,string> = {
  "alpha.skir": 'import { Beta } from "./beta.skir";\nstruct Alpha { b: Beta; }\n',
  "beta.skir": 'import { Gamma } from "./gamma.skir";\nstruct Beta { g: Gamma; }\n',
  "gamma.skir": "struct Gamma { v: int32; }\n",
};
function run(order: string[]) {
  const map = new Map(order.map(k => [k, files[k]!]));
  const ms = ModuleSet.compile(map, "no-cache", "strict");
  const mods = [...ms.modules.values()].map(r => r.result);
  const out = GENERATOR.generateCode({ modules: mods, recordMap: ms.recordMap, config: {} }).files;
  return {
    moduleOrder: [...ms.modules.keys()],
    files: out.map(f => f.path),
    bytes: out.map(f => f.code),
  };
}
const keys = Object.keys(files);
const perms = [keys, [keys[2]!, keys[0]!, keys[1]!], [keys[1]!, keys[2]!, keys[0]!]] as string[][];
const results = perms.map(run);
for (const r of results) console.log(r.moduleOrder, r.files.join(","));
console.log("all moduleOrder same:", results.every(r => r.moduleOrder.join() === results[0]!.moduleOrder.join()));
console.log("all bytes same:", results.every(r => JSON.stringify(r.bytes) === JSON.stringify(results[0]!.bytes)));
