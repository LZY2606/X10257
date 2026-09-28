import { ModuleSet } from "../src/module_set.js";

const lf = `struct First {\n  a: int32;\n}\n\nstruct Second {\n  b: int32;\n}\n`;
const crlf = lf.replace(/\n/g, "\r\n");

for (const [tag, code] of [["LF", lf], ["CRLF", crlf]] as const) {
  const ms = ModuleSet.compile(new Map([["p.skir", code]]), "no-cache", "strict");
  const recs = ms.modules.get("p.skir")!.result.records.map(r => [r.record.name.text, r.record.key, r.record.name.line.lineNumber+1]);
  console.log(tag, "errors:", ms.errors.length, JSON.stringify(recs));
}

// error line under CRLF
const badLf = `struct Bad {\n  a: int32 = 0;\n  b: int32 = 0;\n}\n`;
const badCrlf = badLf.replace(/\n/g, "\r\n");
for (const [tag, code] of [["LF", badLf], ["CRLF", badCrlf]] as const) {
  const ms = ModuleSet.compile(new Map([["p.skir", code]]), "no-cache", "strict");
  console.log(tag, JSON.stringify(ms.errors.map(e=>`line=${e.token.line.lineNumber+1} col=${e.token.colNumber}: ${e.message}`)));
}
