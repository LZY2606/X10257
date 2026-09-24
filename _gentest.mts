import { ModuleSet } from "./src/module_set.js";
import { GENERATOR } from "skir-typescript-gen";
function compile(content: string) {
  return ModuleSet.compile(new Map([["hello.skir", content]]), "no-cache", "strict");
}
function gen(content: string) {
  const ms = compile(content);
  if (ms.errors.length) { console.log("ERRORS", ms.errors.map(e=>e.message)); return; }
  const files = GENERATOR.generateCode({
    modules: [...ms.modules.values()].map(r => r.result),
    recordMap: ms.recordMap,
    config: {},
  }).files;
  return files;
}
const lf = "struct Point {\n  x: int32;\n  y: int32;\n}\n";
const crlf = lf.replaceAll("\n", "\r\n");
const a = gen(lf), b = gen(crlf);
console.log("errors same:", JSON.stringify(compile(lf).errors) === JSON.stringify(compile(crlf).errors));
console.log("equal:", JSON.stringify(a) === JSON.stringify(b));
if (JSON.stringify(a) !== JSON.stringify(b)) {
  for (let i=0;i<a!.length;i++) console.log(a![i].path, a![i].code === b![i].code);
}
