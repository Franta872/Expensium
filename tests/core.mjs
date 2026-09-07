import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const ext = path.join(root, "extension");

function assert(value, message) {
  if (!value) throw new Error(message);
}

const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(ext, "languages.js"), "utf8"), context);
vm.runInContext(fs.readFileSync(path.join(ext, "core.js"), "utf8"), context);

const langs = context.EXPENSIUM_LANGUAGES;
const C = context.EXPENSIUM_CORE;
const byCode = new Map(langs.map((x) => [x.code, x]));

assert(langs.length === 137, "Expected 137 languages");
for (const item of langs) {
  assert(item.premiumWord, `Missing premiumWord: ${item.code}`);
  assert(item.standardWord, `Missing standardWord: ${item.code}`);
}

assert(C.detectLogoKind("YouTube Premium") === "premium", "Premium detection failed");
assert(C.detectLogoKind("Domovská stránka YouTube Premium") === "premium", "Localized Premium detection failed");
assert(C.detectLogoKind("YouTube Home") === "standard", "Standard detection failed");
assert(C.detectLogoKind("") === "standard", "Blank label should default to standard");
assert(C.resolveLogoKind("auto", "premium") === "premium", "Auto premium failed");
assert(C.resolveLogoKind("auto", "standard") === "standard", "Auto standard failed");
assert(C.resolveLogoKind("premium", "standard") === "premium", "Premium override failed");
assert(C.resolveLogoKind("standard", "premium") === "standard", "Standard override failed");

const cs = byCode.get("cs");
const en = byCode.get("en");
assert(C.wordFor(cs, "premium") === "Drahium", "Czech premium failed");
assert(C.wordFor(cs, "standard") === "Reklamium", "Czech standard failed");
assert(C.wordFor(en, "premium") === "Expensium", "English premium failed");
assert(C.wordFor(en, "standard") === "Adium", "English standard failed");

const latin = C.scriptProfile("Drahium");
const cjk = C.scriptProfile("広告ニウム");
const arabic = C.scriptProfile("إعلانيوم");
assert(latin.fontFactor > cjk.fontFactor, "Latin should be enlarged more than CJK");
assert(arabic.tracking === 0, "Arabic tracking must be zero");
assert(latin.xScale < 1, "Latin should be slightly condensed");

console.log("OK: auto logo detection");
console.log("OK: Standard/Premium override");
console.log("OK: Reklamium/Drahium and Adium/Expensium");
console.log("OK: 137 dual wordmark entries");
console.log("OK: per-script sizing profiles");
