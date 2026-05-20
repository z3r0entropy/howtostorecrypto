#!/usr/bin/env node
/**
 * Produce a downloadable offline bundle of the static site.
 *
 *  1. Astro has already built into `dist/`.
 *  2. We zip the *contents* of dist/ (including the offline instructions
 *     and the serve.* helpers that public/ contributes) to a temp file.
 *  3. We move the resulting zip back into dist/offline.zip so the deploy
 *     artifact serves it at https://howtostorecrypto.com/offline.zip.
 *
 * Run AFTER `astro build`.
 */

import { execSync } from "node:child_process";
import { existsSync, statSync, mkdtempSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const root = process.cwd();
const dist = join(root, "dist");
const final = join(dist, "offline.zip");

if (!existsSync(dist) || !statSync(dist).isDirectory()) {
  console.error("[bundle] No dist/ directory found. Run `astro build` first.");
  process.exit(1);
}

// Build to a temp location, then move into dist/ so the zip never contains itself.
const stagingDir = mkdtempSync(join(tmpdir(), "hsc-bundle-"));
const stagingZip = join(stagingDir, "offline.zip");

console.log("[bundle] Zipping dist/ → offline.zip");

try {
  // Quiet, recursive, store symlinks as links, exclude any pre-existing offline.zip
  // and macOS metadata noise.
  execSync(`zip -qr "${stagingZip}" . -x "offline.zip" "*.DS_Store" "__MACOSX/*"`, {
    cwd: dist,
    stdio: "inherit",
  });
} catch (err) {
  console.error("[bundle] zip failed:", err.message);
  rmSync(stagingDir, { recursive: true, force: true });
  process.exit(1);
}

renameSync(stagingZip, final);
rmSync(stagingDir, { recursive: true, force: true });

const sizeMb = (statSync(final).size / (1024 * 1024)).toFixed(2);
console.log(`[bundle] Created dist/offline.zip (${sizeMb} MB)`);
