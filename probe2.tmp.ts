import { ModuleSet } from "./src/module_set.js";
import { GENERATOR as tsGen } from "skir-typescript-gen";
import { GENERATOR as goGen } from "skir-go-gen";
import { GENERATOR as rsGen } from "skir-rust-gen";

function compile(paths: Array<[string, string]>, cache: ModuleSet | "no-cache" = "no-cache") {
  return ModuleSet.compile(new Map(paths), cache, "strict");
}
function showErrors(label: string, ms: ModuleSet) {
  console.log(label, ms.errors.map((e) => ({
    msg: e.message ?? `expected:${(e as {expected:string}).expected}`,
    mod: e.token.line.modulePath,
    line: e.token.line.lineNumber,
    col: e.token.colNumber,
  })));
}

// same name across namespaces
const NS_A = `struct Point { x: int32; y: int32; }`;
const NS_B = `struct Point { label: string; }`;
const USER = `
import * as a from "./ns_a.skir";
import * as b from "./ns_b.skir";
struct Pair { pa: a.Point; pb: b.Point; }
`;
const ns = compile([["ns_a.skir", NS_A], ["ns_b.skir", NS_B], ["user.skir", USER]]);
showErrors("same-name:", ns);
const pair = ns.recordMap.get([...ns.recordMap.keys()].find(k => k.startsWith("user.skir"))!)!.record;
const bindings = pair.fields.map((f) => {
  const t = f.type!;
  return { field: f.name.text, boundTo: t.kind === "record" ? t.key : t.kind };
});
console.log("bindings:", JSON.stringify(bindings));

// reference cycle
const C1 = `import * as two from "./c2.skir";\nstruct One { t: two.Two; }`;
const C2 = `import * as one from "./c1.skir";\nstruct Two { o: one.One; }`;
const cyc = compile([["c1.skir", C1], ["c2.skir", C2]]);
showErrors("cycle:", cyc);

// field number conflict
const DUP = `struct Bad { a: int32 = 1; b: string = 1; }`;
const dup = compile([["dup.skir", DUP]]);
showErrors("dup-field-number:", dup);

// duplicate record numbers across modules
const R1 = `struct A(42) {}`;
const R2 = `struct B(42) {}`;
const recNum = compile([["r1.skir", R1], ["r2.skir", R2]]);
showErrors("dup-record-number:", recNum);

// unknown type
const UNK = `struct U { x: NotDefined; }`;
showErrors("unknown-type:", compile([["u.skir", UNK]]));

// multi-language generation on the namespace case
const input = {
  modules: [...ns.modules.values()].map((r) => r.result),
  recordMap: ns.recordMap,
};
const goInput = { ...input, config: { goModuleName: "example.com/probe" } };
const files = new Map<string, string>();
for (const f of tsGen.generateCode({ ...input, config: {} } as never).files) files.set("ts:" + f.path, f.code);
for (const f of goGen.generateCode(goInput as never).files) files.set("go:" + f.path, f.code);
for (const f of rsGen.generateCode({ ...input, config: {} } as never).files) files.set("rs:" + f.path, f.code);
console.log("multi-lang files:", [...files.keys()]);

// permuted multi-lang
const ns2 = compile([["user.skir", USER], ["ns_b.skir", NS_B], ["ns_a.skir", NS_A]]);
const input2 = { modules: [...ns2.modules.values()].map((r) => r.result), recordMap: ns2.recordMap };
const files2 = new Map<string, string>();
for (const f of tsGen.generateCode({ ...input2, config: {} } as never).files) files2.set("ts:" + f.path, f.code);
for (const f of goGen.generateCode({ ...input2, config: { goModuleName: "example.com/probe" } } as never).files) files2.set("go:" + f.path, f.code);
for (const f of rsGen.generateCode({ ...input2, config: {} } as never).files) files2.set("rs:" + f.path, f.code);
const diffs: string[] = [];
for (const [k, v] of files) if (files2.get(k) !== v) diffs.push(k);
console.log("multi-lang permutation diffs:", diffs);
