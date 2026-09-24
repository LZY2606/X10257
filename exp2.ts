import { GENERATOR } from "skir-typescript-gen";
import { ModuleSet } from "./src/module_set.js";

// 1) modules map order under permutation
const files: Array<[string, string]> = [
  ["a/alpha", `struct Alpha(10) { x: int32; }`],
  ["b/beta", `import * as a from "../a/alpha"; struct Beta(20) { a: a.Alpha; }`],
  ["c/gamma", `import * as b from "../b/beta"; struct Gamma(30) { b: b.Beta; }`],
];
for (const perm of [[0,1,2],[2,1,0],[1,2,0]]) {
  const map = new Map<string, string>();
  for (const i of perm) map.set(files[i]![0], files[i]![1]);
  const ms = ModuleSet.compile(map, "no-cache", "strict");
  console.log("perm", perm.join(""), "modules order:", [...ms.modules.keys()].join(","));
  console.log("  recordMap order:", [...ms.recordMap.keys()].map(k=>JSON.stringify(k)).join(","));
}

// 2) duplicate record numbers across modules, under permutation
console.log("\n-- duplicate record numbers --");
const dup: Array<[string,string]> = [
  ["m1", `struct Foo(7) {}`],
  ["m2", `struct Bar(7) {}`],
  ["m3", `struct Baz(7) {}`],
];
for (const perm of [[0,1,2],[2,1,0],[1,0,2]]) {
  const map = new Map<string, string>();
  for (const i of perm) map.set(dup[i]![0], dup[i]![1]);
  const ms = ModuleSet.compile(map, "no-cache", "strict");
  console.log("perm", perm.join(""), "errors:", JSON.stringify(ms.errors.map(e=>`${e.token.line.modulePath}:${e.message}`)));
}
