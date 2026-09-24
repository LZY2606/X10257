import { tokenizeModule } from "./src/tokenizer.js";
const lf = "struct A {\n  x: int32;\n}\n";
const crlf = "struct A {\r\n  x: int32;\r\n}\r\n";
for (const [name, code] of [["LF", lf], ["CRLF", crlf]] as const) {
  const r = tokenizeModule(code, "a.skir");
  console.log(name, "errors:", r.errors.length, r.errors.map(e=>e.message));
  const xTok = r.result.tokens.find(t=>t.text==="x");
  console.log(" x line:", JSON.stringify(xTok?.line.line), "lineNumber:", xTok?.line.lineNumber, "col:", xTok?.colNumber);
}
