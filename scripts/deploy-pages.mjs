import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function git(args, cwd = root) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || `git ${args[0]} failed`);
  return result.stdout.trim();
}
if (git(["status", "--porcelain"])) {
  throw new Error("Commit your changes before publishing: the deployment records the source commit.");
}
const remote = git(["remote", "get-url", "origin"]);
const sourceCommit = git(["rev-parse", "--short", "HEAD"]);
const authorName = git(["config", "user.name"]);
const authorEmail = git(["config", "user.email"]);
const build = spawnSync(process.execPath, ["scripts/build-pages.mjs"], {
  cwd: root, stdio: "inherit",
});
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status || 1);

const stagingRoot = path.join(root, ".deploy");
mkdirSync(stagingRoot, { recursive: true });
const staging = mkdtempSync(path.join(stagingRoot, "pages-"));
try {
  const branch = git(["ls-remote", "--heads", remote, "refs/heads/gh-pages"]);
  if (branch) {
    git(["clone", "--single-branch", "--branch", "gh-pages", remote, staging]);
    for (const entry of readdirSync(staging)) {
      if (entry !== ".git") rmSync(path.join(staging, entry), { recursive: true, force: true });
    }
  } else {
    git(["init", "--initial-branch=gh-pages"], staging);
    git(["remote", "add", "origin", remote], staging);
  }
  git(["config", "user.name", authorName], staging);
  git(["config", "user.email", authorEmail], staging);
  cpSync(path.join(root, "out"), staging, { recursive: true });
  git(["add", "--all"], staging);
  if (git(["status", "--porcelain"], staging)) {
    git(["commit", "-m", `Publish site from ${sourceCommit}`], staging);
    git(["push", "origin", "HEAD:gh-pages"], staging);
    console.log(`Published build from ${sourceCommit} to gh-pages. GitHub Pages will deploy this branch.`);
  } else {
    console.log("The published build is already up to date.");
  }
} finally {
  rmSync(staging, { recursive: true, force: true });
}
