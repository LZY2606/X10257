import { tokenizeModule } from "./src/tokenizer.js";
const crlf = "struct A {\r\n  x: int32;\r\n}\r\n";
const r = tokenizeModule(crlf, "a.skir");
const lines = new Set(r.result.tokens.map(t => t.line.line));
console.log([...lines]);
