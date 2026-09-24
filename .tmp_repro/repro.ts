import { ModuleSet } from "../src/module_set.js";
import { GENERATOR } from "skir-typescript-gen";

const alpha = `
struct Alpha {
  x: int32;
}
`;
const beta = `
import Alpha from "./alpha.skir";
struct Beta {
  a: Alpha;
}
`;

function run(order: Array<[string, string]>) {
  const map = new Map(order);
  const ms = ModuleSet.compile(map, "no-cache", "strict");
  if (ms.errors.length) {
    return "ERRORS: " + ms.errors.map((e) => `${e.message}@${e.token.line.modulePath}:${e.token.line.lineNumber}`).join(" | ");
  }
  const files = GENERATOR.generateCode({
    modules: [...ms.modules.values()].map((r) => r.result),
    recordMap: ms.recordMap,
    config: {},
  }).files;
  return files.map((f) => f.path).join(",");
}

const o1 = run([["alpha.skir", alpha], ["beta.skir", beta]]);
const o2 = run([["beta.skir", beta], ["alpha.skir", alpha]]);
console.log(o1);
console.log(o2);
console.log("equal:", o1 === o2);
