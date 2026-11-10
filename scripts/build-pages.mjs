import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const basePath = "/masterskaya-krasoty";
const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
  cwd: root,
  env: { ...process.env, NEXT_PUBLIC_BASE_PATH: basePath },
  stdio: "inherit",
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
writeFileSync(path.join(root, "out/.nojekyll"), "");
writeFileSync(path.join(root, "out/.base-path"), `${basePath}\n`);
