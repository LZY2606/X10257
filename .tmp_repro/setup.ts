import * as fs from "fs/promises";
import * as path from "path";
const root = ".tmp_repro/proj";
await fs.rm(root, { recursive: true, force: true });
await fs.mkdir(path.join(root, "skir-src/ns1"), { recursive: true });
await fs.mkdir(path.join(root, "skir-src/ns2"), { recursive: true });
await fs.writeFile(path.join(root, "skir.yml"), `generators:
  - mod: skir-typescript-gen
    outDir: ./skirout
    config: {}
  - mod: skir-python-gen
    outDir: ./skirout
    config: {}
dependencies: {}
`);
await fs.writeFile(path.join(root, "skir-src/ns1/point.skir"),
  "/// Point doc\r\nstruct Point {\r\n  x: int32;\r\n  y: int32;\r\n}\r\n");
await fs.writeFile(path.join(root, "skir-src/ns2/point.skir"),
  "struct Point { z: string; }\n");
await fs.writeFile(path.join(root, "skir-src/box.skir"),
  "import Point2 from \"./ns2/point.skir\";\r\nstruct Box { p1: Point; p2: Point2; }\r\n");
