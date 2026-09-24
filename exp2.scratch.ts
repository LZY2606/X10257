import { ModuleSet } from "./src/module_set.js";
import { GENERATOR } from "skir-typescript-gen";

const base = `struct Foo(10) {
  name: string;
}
`;
const variants: Record<string, string> = {
  lf: base,
  crlf: base.replace(/\n/g, "\r\n"),
  trailing: base + "\n\n",
  leading: "\n" + base,
};
const outputs: Record<string, string> = {};
for (const [name, code] of Object.entries(variants)) {
  const ms = ModuleSet.compile(new Map([["a.skir", code]]), "no-cache", "strict");
  if (ms.errors.length) { console.log(name, "ERRORS", ms.errors.map(e=>e.message)); continue; }
  const out = GENERATOR.generateCode({
    modules: [...ms.modules.values()].map((r) => r.result),
    recordMap: ms.recordMap,
    config: {},
  });
  outputs[name] = out.files.map((f) => f.path + "\n" + f.code).join("\n===\n");
  const keys = [...ms.recordMap.keys()];
  console.log(name, "recordKeys:", keys);
}
const names = Object.keys(outputs);
for (let i = 1; i < names.length; i++) {
  const a = outputs[names[0]!]!, b = outputs[names[i]!]!;
  console.log(`${names[i]} == lf:`, a === b);
  if (a !== b) {
    const l1 = a.split("\n"), l2 = b.split("\n");
    for (let j = 0; j < Math.max(l1.length, l2.length); j++) {
      if (l1[j] !== l2[j]) { console.log("  first diff line", j, JSON.stringify(l1[j]), JSON.stringify(l2[j])); break; }
    }
  }
}
