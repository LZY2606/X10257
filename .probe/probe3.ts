import { ModuleSet } from "../src/module_set.js";
const makeA = (id: number) => `struct RecA(7) { x: int32; }`.replace("7", String(id));
const makeB = (id: number) => `struct RecB(7) { y: int32; }`.replace("7", String(id));
const m1 = new Map<string,string>([["aa/rec_a.skir", makeA(7)], ["bb/rec_b.skir", makeB(7)]]);
const m2 = new Map<string,string>([["bb/rec_b.skir", makeB(7)], ["aa/rec_a.skir", makeA(7)]]);
const run = (m: Map<string,string>) => ModuleSet.compile(m, "no-cache", "strict").errors.map(e=>`${e.token.line.modulePath}: ${e.message}`);
console.log("dup rec order1:", JSON.stringify(run(m1), null, 1));
console.log("dup rec order2:", JSON.stringify(run(m2), null, 1));
