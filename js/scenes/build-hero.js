#!/usr/bin/env node
/**
 * build-hero.js
 * ---------------------------------------------------------------------
 * heroScene.js is one large Three.js closure with lots of shared state
 * (camera, gate arrays, materials, etc.) referenced across sections.
 * To keep that behavior 100% intact while still editing it as small,
 * organized files, the real source lives in js/scenes/hero/*.js and
 * this script concatenates them IN ORDER into js/scenes/heroScene.js,
 * which is what index.html actually loads.
 *
 * Edit files in js/scenes/hero/, then run:
 *   node js/scenes/build-hero.js
 *
 * Never hand-edit js/scenes/heroScene.js directly — it's generated and
 * will be overwritten next build.
 * ---------------------------------------------------------------------
 */

const fs = require("fs");
const path = require("path");

const HERO_DIR = path.join(__dirname, "hero");
const OUTPUT_FILE = path.join(__dirname, "heroScene.js");

// Fixed load order. This order matters: each file relies on variables
// declared in earlier files still being in scope (same IIFE).
const PARTS = [
  "01.textures.js",
  "02.environment.js",
  "03.foliage.js",
  "04.pillars.js",
  "05.emblem.js",
  "06.gatesigns.js",
  "07.structure.js",
  "08.camera.js",
  "09.gates.js",
  "10.loop.js",
];

function build() {
  const banner =
    "// =========================================================================\n" +
    "// AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY\n" +
    "// Source of truth is js/scenes/hero/*.js — edit those, then run:\n" +
    "//   node js/scenes/build-hero.js\n" +
    "// =========================================================================\n\n";

  let out = banner;

  for (const part of PARTS) {
    const filePath = path.join(HERO_DIR, part);
    if (!fs.existsSync(filePath)) {
      console.error(`Missing part file: ${part}`);
      process.exit(1);
    }
    const content = fs.readFileSync(filePath, "utf8");
    out += `// ---- ${part} ----\n`;
    out += content;
    if (!content.endsWith("\n")) out += "\n";
    out += "\n";
  }

  fs.writeFileSync(OUTPUT_FILE, out, "utf8");
  console.log(`Built heroScene.js from ${PARTS.length} part files.`);
}

build();
