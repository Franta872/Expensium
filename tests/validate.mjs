import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const ext = path.join(root, "extension");

function assert(value, message) {
  if (!value) throw new Error(message);
}

const manifest = JSON.parse(fs.readFileSync(path.join(ext, "manifest.json"), "utf8"));

assert(manifest.manifest_version === 3, "Manifest must be V3");
assert(manifest.name === "Expensium", "Extension name must be Expensium");
assert(manifest.version === "1.1.0", "Unexpected version");
assert(manifest.permissions.length === 1 && manifest.permissions[0] === "storage", "Unexpected permissions");
assert(manifest.browser_specific_settings?.gecko?.data_collection_permissions?.required?.[0] === "none", "AMO data collection declaration must be none");

const expected = ["content.js", "core.js", "languages.js", "ui.js", "popup.html", "popup.css", "popup.js"];
for (const file of expected) assert(fs.existsSync(path.join(ext, file)), `Missing ${file}`);

for (const file of ["content.js", "core.js", "languages.js", "ui.js", "popup.js"]) {
  const source = fs.readFileSync(path.join(ext, file), "utf8");
  new vm.Script(source, { filename: file });
  assert(!/\beval\s*\(/.test(source), `${file} contains eval()`);
  assert(!/\bnew\s+Function\s*\(/.test(source), `${file} contains new Function()`);
  assert(!/\bfetch\s*\(/.test(source), `${file} contains fetch()`);
  assert(!/\bXMLHttpRequest\b/.test(source), `${file} contains XMLHttpRequest`);
  assert(!/\bWebSocket\b/.test(source), `${file} contains WebSocket`);
}

const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(ext, "languages.js"), "utf8"), context);
const languages = context.EXPENSIUM_LANGUAGES;
assert(Array.isArray(languages), "Language registry not loaded");
assert(languages.length === 137, "Unexpected language count");

const codes = new Set();
for (const item of languages) {
  assert(item.code && item.native && item.premiumWord && item.standardWord && item.dir, "Malformed language entry");
  assert(!codes.has(item.code), `Duplicate language code: ${item.code}`);
  codes.add(item.code);
}

assert(languages.find((x) => x.code === "en")?.premiumWord === "Expensium", "English premium mismatch");
assert(languages.find((x) => x.code === "en")?.standardWord === "Adium", "English standard mismatch");
for (const item of languages) assert(item.premiumWord && item.standardWord, `Missing dual wordmark: ${item.code}`);

const content = fs.readFileSync(path.join(ext, "content.js"), "utf8");
assert(content.includes('g[id^="youtube-paths"]'), "Primary YouTube wordmark selector missing");
assert(content.includes("getBBox"), "Dynamic SVG sizing support missing");
assert(content.includes("ytd-topbar-logo-renderer ytd-logo svg"), "Generic standard/Premium SVG selector missing");

console.log("OK: manifest and JavaScript syntax");
console.log(`OK: ${languages.length} unique language variants`);
console.log("OK: no remote-network APIs found");
console.log("OK: generic standard/Premium logo patch path present");
