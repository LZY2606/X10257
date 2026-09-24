import { ModuleSet } from "../src/module_set.js";

const x = `struct X(7) { a: int32; }\n`;
const y = `struct Y(7) { b: int32; }\n`;
function run(order: Array<[string,string]>) {
  const ms = ModuleSet.compile(new Map(order), "no-cache", "strict");
  return ms.errors.map((e) => `${e.token.line.modulePath}: ${e.message}`);
}
console.log(run([["x.skir", x], ["y.skir", y]]));
console.log(run([["y.skir", y], ["x.skir", x]]));
