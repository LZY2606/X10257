import { tokenizeModule } from "../src/tokenizer.js";
import { parseModule } from "../src/parser.js";

for (const eol of ["\n", "\r\n", "\r", "\n\r"]) {
  const code = `struct Point {` + eol + `  x: int32;` + eol + `  y: int32;` + eol + `}` + eol;
  const toks = tokenizeModule(code, "point.skir");
  const parsed = parseModule(toks.result, "strict");
  const rec = parsed.result.records[0]?.record;
  console.log(JSON.stringify(eol), "tokenErrors:", toks.errors.map(e=>e.message),
    "parseErrors:", parsed.errors.map(e=>e.message),
    "fields:", rec?.fields.map(f=>`${f.name.text}@${f.name.line.lineNumber}:${f.name.line.line.length}`),
    "line2:", JSON.stringify(rec?.fields[0]?.name.line.line));
}
