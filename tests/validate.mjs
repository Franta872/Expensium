import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const ext = path.join(root, "extension");
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const read = file => fs.readFileSync(path.join(ext, file), "utf8");
const manifest = JSON.parse(read("manifest.json"));

assert(manifest.manifest_version === 3, "Manifest must be V3");
assert(manifest.name === "Expensium", "Unexpected name");
assert(manifest.version === "1.0.0", "Unexpected version");
assert(JSON.stringify(manifest.permissions) === JSON.stringify(["storage"]), "Unexpected permissions");
assert(manifest.browser_specific_settings?.gecko?.data_collection_permissions?.required?.[0] === "none", "Data collection must be none");

for (const file of ["content.js","languages.js","popup.js"]) {
  const source = read(file);
  new vm.Script(source, {filename:file});
  for (const forbidden of [/\beval\s*\(/,/\bnew\s+Function\s*\(/,/\bfetch\s*\(/,/\bXMLHttpRequest\b/,/\bWebSocket\b/]) {
    assert(!forbidden.test(source), `${file} contains forbidden remote/dynamic API`);
  }
}

const context = {};
vm.createContext(context);
vm.runInContext(read("languages.js"), context);
const languages = context.EXPENSIUM_LANGUAGES;
assert(Array.isArray(languages) && languages.length === 137, "Expected 137 languages");
assert(new Set(languages.map(x => x.code)).size === languages.length, "Duplicate language code");
assert(languages.find(x => x.code === "en")?.word === "Expensium", "English wordmark mismatch");

const content = read("content.js");
assert(content.includes('g[id^="youtube-paths"]'), "YouTube wordmark selector missing");
assert(content.includes("getBBox"), "Dynamic SVG sizing missing");
assert(content.includes("ytd-topbar-logo-renderer ytd-logo svg"), "Generic standard/Premium selector missing");

console.log("OK: manifest + JavaScript syntax");
console.log("OK: 137 unique language variants");
console.log("OK: no network APIs found");
console.log("OK: standard + Premium generic logo path present");
