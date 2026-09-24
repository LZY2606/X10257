import { ModuleSet } from "../src/module_set.js";
import { GENERATOR } from "skir-typescript-gen";

const sources: Record<string, string> = {
  "zebra.skir": `struct Zebra { z: int32; }\n`,
  "apple.skir": `struct Apple { a: int32; }\n`,
  "mango.skir": `struct Mango { m: int32; }\n`,
};

function run(order: string[]) {
  const map = new Map(order.map((p) => [p, sources[p]!]));
  const ms = ModuleSet.compile(map, "no-cache", "strict");
  const files = GENERATOR.generateCode({
    modules: [...ms.modules.values()].map((r) => r.result),
    recordMap: ms.recordMap,
    config: {},
  }).files;
  return files.map((f) => f.path).join(",");
}

const o1 = run(["zebra.skir", "apple.skir", "mango.skir"]);
const o2 = run(["mango.skir", "apple.skir", "zebra.skir"]);
const o3 = run(["apple.skir", "mango.skir", "zebra.skir"]);
console.log(o1);
console.log(o2);
console.log(o3);
console.log("equal:", o1 === o2 && o2 === o3);
