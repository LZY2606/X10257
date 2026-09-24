import { tokenizeModule } from "./src/tokenizer.js";
for (const [name, code] of [["CR", "a\rb\r"], ["LFCR","a\n\rb\n"]] as const) {
  const r = tokenizeModule(code, "a.skir");
  console.log(name, JSON.stringify(r.result.tokens.map(t=>({text:t.text,line:t.line.lineNumber,col:t.colNumber}))));
}
