import { ModuleSet } from "../src/module_set.js";

const a = `struct A { x: int32; } #1`;
const makeA = (id: number) => `struct RecA { x: int32; } = ${id};`;
const makeB = (id: number) => `struct RecB { y: int32; } = ${id};`;

// cross-file duplicate record numbers
const m1 = new Map<string,string>([["aa/rec_a.skir", makeA(7)], ["bb/rec_b.skir", makeB(7)]]);
const m2 = new Map<string,string>([["bb/rec_b.skir", makeB(7)], ["aa/rec_a.skir", makeA(7)]]);
const run = (m: Map<string,string>) => ModuleSet.compile(m, "no-cache", "strict").errors.map(e=>`${e.token.line.modulePath}: ${e.message}`);
console.log("dup rec order1:", JSON.stringify(run(m1), null, 1));
console.log("dup rec order2:", JSON.stringify(run(m2), null, 1));

// CRLF vs LF
const lf = `struct Point {\n  x: int32;\n  y: int32;\n}\n`;
const crlf = lf.replace(/\n/g, "\r\n");
const msLf = ModuleSet.compile(new Map([["p.skir", lf]]), "no-cache", "strict");
const msCrlf = ModuleSet.compile(new Map([["p.skir", crlf]]), "no-cache", "strict");
console.log("lf errors:", msLf.errors.length, "crlf errors:", msCrlf.errors.length);
const modLf = msLf.modules.get("p.skir")!.result;
const modCr = msCrlf.modules.get("p.skir")!.result;
const fLf = modLf.records[0]!.record.fields.map(f=>[f.name.text,f.number]);
const fCr = modCr.records[0]!.record.fields.map(f=>[f.name.text,f.number]);
console.log("fields equal:", JSON.stringify(fLf)===JSON.stringify(fCr), JSON.stringify(fLf));
console.log("record key lf:", modLf.records[0]!.record.key);
console.log("record key cr:", modCr.records[0]!.record.key);

// circular imports
const x = `import { Y } from "./y.skir";\nstruct X { y: Y; }`;
const y = `import { X } from "./x.skir";\nstruct Y { x: X; }`;
const cyc1 = ModuleSet.compile(new Map([["x.skir",x],["y.skir",y]]), "no-cache", "strict");
const cyc2 = ModuleSet.compile(new Map([["y.skir",y],["x.skir",x]]), "no-cache", "strict");
console.log("cycle1:", JSON.stringify(cyc1.errors.map(e=>`${e.token.line.modulePath}:${e.message}`)));
console.log("cycle2:", JSON.stringify(cyc2.errors.map(e=>`${e.token.line.modulePath}:${e.message}`)));
