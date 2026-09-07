(() => {
  "use strict";

  const API = {
    normalizeLocale(locale, byCode) {
      if (!locale) return "en";
      const clean = String(locale).replace("_", "-");

      if (/^zh-(TW|HK|MO|Hant)/i.test(clean)) return "zh-Hant";
      if (/^zh/i.test(clean)) return "zh-Hans";
      if (byCode.has(clean)) return clean;

      const primary = clean.split("-")[0].toLowerCase();
      return byCode.has(primary) ? primary : "en";
    },

    detectLogoKind(labelText) {
      return /premium/i.test(String(labelText || "")) ? "premium" : "standard";
    },

    resolveLogoKind(setting, detected) {
      if (setting === "premium" || setting === "standard") return setting;
      return detected === "premium" ? "premium" : "standard";
    },

    wordFor(languageEntry, logoKind) {
      return logoKind === "premium"
        ? languageEntry.premiumWord
        : languageEntry.standardWord;
    },

    scriptProfile(word) {
      const text = String(word || "");

      if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(text)) {
        return { fontFactor: 1.16, weight: 560, tracking: 0, xScale: 1.0 };
      }

      if (/[\p{Script=Arabic}\p{Script=Hebrew}]/u.test(text)) {
        return { fontFactor: 1.34, weight: 580, tracking: 0, xScale: 1.0 };
      }

      if (/[\p{Script=Devanagari}\p{Script=Bengali}\p{Script=Gurmukhi}\p{Script=Gujarati}\p{Script=Tamil}\p{Script=Telugu}\p{Script=Kannada}\p{Script=Malayalam}\p{Script=Sinhala}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}\p{Script=Tibetan}\p{Script=Ethiopic}]/u.test(text)) {
        return { fontFactor: 1.24, weight: 560, tracking: 0, xScale: 1.0 };
      }

      return { fontFactor: 1.42, weight: 560, tracking: -0.45, xScale: 0.94 };
    }
  };

  globalThis.EXPENSIUM_CORE = Object.freeze(API);
})();
