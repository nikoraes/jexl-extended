/**
 * Marks the CommonJS build output (dist/cjs) as CommonJS so that Node does not
 * treat it as ESM once the root package.json declares "type": "module".
 * npm publishes everything under dist/ (see package.json "files"), so this
 * file ships with the package and the "require" export condition works.
 */
import { writeFileSync } from "node:fs";

writeFileSync("dist/cjs/package.json", JSON.stringify({ type: "commonjs" }, null, 2) + "\n");
