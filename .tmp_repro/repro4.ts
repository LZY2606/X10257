import { ModuleSet } from "../src/module_set.js";

// a imports b, b imports a, both actually use the imported names.
const a = `import B from "./b.skir";\nstruct A { b: B; }\n`;
const b = `import A from "./a.skir";\nstruct B { a: A; }\n`;

function run(order: Array<[string, string]>) {
  const ms = ModuleSet.compile(new Map(order), "no-cache", "strict");
  return ms.errors.map((e) => `${e.token.line.modulePath}:${e.token.line.lineNumber}:${e.message}`);
}
console.log("a first:");
console.log(run([["a.skir", a], ["b.skir", b]]));
console.log("b first:");
console.log(run([["b.skir", b], ["a.skir", a]]));
