import { createHash } from "crypto";
import { GENERATOR } from "skir-typescript-gen";
import { ModuleSet } from "./src/module_set.js";

const files: Array<[string, string]> = [
  ["a/alpha", `
import * as beta from "../b/beta";
struct Alpha(10) {
  name: string;
  beta: beta.Beta;
  items: [beta.Beta];
}
enum Color { RED = 1; GREEN = 2; }
`],
  ["b/beta", `
import { Alpha } from "../a/alpha";
struct Beta(20) {
  id: int32;
  alpha: Alpha?;
}
`],
  ["c/gamma", `
import * as alpha from "../a/alpha";
struct Gamma(30) {
  color: alpha.Color;
  gammas: [Gamma];
}
method GetGamma(alpha.Alpha): Gamma = 5;
`],
];

function run(order: number[]) {
  const map = new Map<string, string>();
  for (const i of order) map.set(files[i]![0], files[i]![1]);
  const ms = ModuleSet.compile(map, "no-cache", "strict");
  if (ms.errors.length) {
    return "ERRORS: " + ms.errors.map(e => e.message).join("|");
  }
  const out = GENERATOR.generateCode({
    modules: [...ms.modules.values()].map(r => r.result),
    recordMap: ms.recordMap,
    config: {},
  });
  return out.files.map(f => f.path + "\n" + f.code).join("\n===\n");
}

const perms = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
const results = perms.map(p => run(p));
const hashes = results.map(r => createHash("sha256").update(r).digest("hex").slice(0,16));
console.log(hashes);
console.log("all equal:", new Set(hashes).size === 1);
if (new Set(hashes).size !== 1) {
  for (let i = 1; i < results.length; i++) {
    if (results[i] !== results[0]) {
      const a = results[0]!.split("\n"), b = results[i]!.split("\n");
      for (let j = 0; j < Math.max(a.length, b.length); j++) {
        if (a[j] !== b[j]) { console.log("first diff at line", j, "\nA:", a[j], "\nB:", b[j]); break; }
      }
      break;
    }
  }
}
