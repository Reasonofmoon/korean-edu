/**
 * Bundle A-group Hangul utilities for the static prototype.
 * Output: prototype/lib/hangul-utils.js → window.HangulUtils
 */
import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const entry = path.join(root, "scripts", "hangul-utils-entry.mjs");
const outfile = path.join(root, "prototype", "lib", "hangul-utils.js");

await build({
  entryPoints: [entry],
  bundle: true,
  format: "iife",
  globalName: "HangulUtils",
  platform: "browser",
  target: ["es2020"],
  outfile,
  logLevel: "info",
  // hangul-postposition is CJS; esbuild handles it
  mainFields: ["browser", "module", "main"],
});

console.log(`Wrote ${path.relative(root, outfile)}`);
