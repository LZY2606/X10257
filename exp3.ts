import { createHash } from "crypto";
import { GENERATOR } from "skir-typescript-gen";
import { ModuleSet } from "./src/module_set.js";

// Independent modules: no import edges between them.
const files: Array<[string, string]> = [
  ["z/zeta", `struct Zeta(1) { z: string; }`],
  ["a/alpha", `struct Alpha(2) { a: int32; }`],
  ["m/mid", `enum Mid { X = 1; Y = 2; } struct Holder(3) { m: Mid; }`],
];
function run(order: number[]) {
  const map = new Map<string, string>();
  for (const i of order) map.set(files[i]![0], files[i]![1]);
  const ms = ModuleSet.compile(map, "no-cache", "strict");
  if (ms.errors.length) return "ERRORS:" + ms.errors.map(e=>e.message).join("|");
  const out = GENERATOR.generateCode({
    modules: [...ms.modules.values()].map(r => r.result),
    recordMap: ms.recordMap,
    config: {},
  });
  return out.files.map(f => f.path + "\n" + f.code).join("\n===\n");
}
const perms = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
const results = perms.map(run);
const hashes = results.map(r => createHash("sha256").update(r).digest("hex").slice(0,16));
console.log(hashes, "all equal:", new Set(hashes).size === 1);
if (new Set(hashes).size !== 1) {
  const a = results[0]!.split("\n");
  for (let i = 1; i < results.length; i++) {
    const b = results[i]!.split("\n");
    for (let j = 0; j < Math.max(a.length,b.length); j++) {
      if (a[j] !== b[j]) { console.log(`perm ${perms[i]} first diff line ${j}:\nA: ${a[j]}\nB: ${b[j]}`); j = 1e9; break; }
    }
  }
  // also check per-file map equality ignoring file order
  const toMap = (s: string) => new Map(s.split("\n===\n").map(c => { const i = c.indexOf("\n"); return [c.slice(0,i), c.slice(i+1)]; }));
  const m0 = toMap(results[0]!);
  for (let i = 1; i < results.length; i++) {
    const mi = toMap(results[i]!);
    let same = m0.size === mi.size;
    if (same) for (const [k,v] of m0) if (mi.get(k) !== v) { same = false; console.log("file content differs:", k); }
    console.log("perm", perms[i].join(""), "same file set+contents:", same);
  }
}
