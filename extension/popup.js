(() => {
  "use strict";

  const api = globalThis.browser;
  const C = EXPENSIUM_CORE;
  const BY_CODE = new Map(EXPENSIUM_LANGUAGES.map((item) => [item.code, item]));

  const search = document.getElementById("search");
  const list = document.getElementById("list");
  const variant = document.getElementById("variant");
  const toggle = document.getElementById("toggle");
  const count = document.getElementById("count");
  const modeButtons = [...document.querySelectorAll(".modeButton")];

  let enabled = true;
  let language = "en";
  let logoMode = "auto";
  let filter = "";

  function normalizeLocale(locale) {
    return C.normalizeLocale(locale, BY_CODE);
  }

  function effectiveLocale() {
    return language !== "auto"
      ? normalizeLocale(language)
      : normalizeLocale(navigator.language || "en");
  }

  function strings() {
    const locale = effectiveLocale();
    return EXPENSIUM_UI[locale] ||
           EXPENSIUM_UI[locale.split("-")[0]] ||
           EXPENSIUM_UI.en;
  }

  function displayNames(locale) {
    try {
      return new Intl.DisplayNames([locale], { type: "language" });
    } catch (_) {
      try {
        return new Intl.DisplayNames(["en"], { type: "language" });
      } catch (_) {
        return null;
      }
    }
  }

  function localizedName(item, dn) {
    if (!dn) return item.native;
    try {
      return dn.of(item.code) || item.native;
    } catch (_) {
      return item.native;
    }
  }

  function previewWord(item) {
    if (logoMode === "standard") return item.standardWord;
    if (logoMode === "premium") return item.premiumWord;
    return `${item.standardWord} / ${item.premiumWord}`;
  }

  function applyLocale() {
    const locale = effectiveLocale();
    const item = BY_CODE.get(locale) || BY_CODE.get("en");
    const s = strings();

    document.documentElement.lang = locale;
    document.documentElement.dir = item.dir || "ltr";

    variant.textContent = previewWord(item);
    toggle.setAttribute("aria-checked", String(enabled));
    toggle.setAttribute("aria-label", enabled ? s.enabled : s.disabled);
    toggle.title = enabled ? s.enabled : s.disabled;
    search.placeholder = s.search;
    search.setAttribute("aria-label", s.search);

    const labels = {
      auto: s.modeAuto,
      standard: s.modeStandard,
      premium: s.modePremium
    };

    for (const button of modeButtons) {
      button.textContent = labels[button.dataset.mode];
      const selected = button.dataset.mode === logoMode;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-checked", String(selected));
    }

    render();
  }

  function buildLanguageRow(item, localized, selected) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "language" + (selected ? " selected" : "");
    button.dataset.code = item.code;
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(selected));
    button.dir = item.dir || "ltr";

    const code = document.createElement("span");
    code.className = "code";
    code.textContent = item.code.toUpperCase().replace("ZH-", "");

    const names = document.createElement("span");
    names.className = "names";

    const primary = document.createElement("span");
    primary.className = "primary";
    primary.textContent = localized;

    const secondary = document.createElement("span");
    secondary.className = "secondary";
    secondary.textContent =
      localized.toLocaleLowerCase(effectiveLocale()) ===
      item.native.toLocaleLowerCase(effectiveLocale())
        ? item.code
        : `${item.native} · ${item.code}`;

    const word = document.createElement("span");
    word.className = "word";
    word.textContent = previewWord(item);

    names.append(primary, secondary);
    button.append(code, names, word);

    button.addEventListener("click", async () => {
      language = item.code;
      filter = "";
      search.value = "";
      await api.storage.local.set({ language });
      applyLocale();
    });

    return button;
  }

  function buildAutoRow(dn) {
    const s = strings();
    const effective = BY_CODE.get(effectiveLocale()) || BY_CODE.get("en");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "language" + (language === "auto" ? " selected" : "");
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(language === "auto"));

    const code = document.createElement("span");
    code.className = "code";
    code.textContent = "🌐";

    const names = document.createElement("span");
    names.className = "names";

    const primary = document.createElement("span");
    primary.className = "primary";
    primary.textContent = s.auto;

    const secondary = document.createElement("span");
    secondary.className = "secondary";
    secondary.textContent = localizedName(effective, dn);

    const word = document.createElement("span");
    word.className = "word";
    word.textContent = previewWord(effective);

    names.append(primary, secondary);
    button.append(code, names, word);

    button.addEventListener("click", async () => {
      language = "auto";
      filter = "";
      search.value = "";
      await api.storage.local.set({ language });
      applyLocale();
    });

    return button;
  }

  function render() {
    const locale = effectiveLocale();
    const dn = displayNames(locale);
    const collator = new Intl.Collator(locale, { sensitivity: "base" });
    const q = filter.trim().toLocaleLowerCase(locale);

    const rows = EXPENSIUM_LANGUAGES
      .map((item) => ({ item, localized: localizedName(item, dn) }))
      .filter(({ item, localized }) => {
        if (!q) return true;
        return [
          item.code, item.native, item.standardWord, item.premiumWord, localized
        ].join(" ").toLocaleLowerCase(locale).includes(q);
      })
      .sort((a, b) => collator.compare(a.localized, b.localized));

    list.replaceChildren();
    if (!q) list.appendChild(buildAutoRow(dn));

    for (const row of rows) {
      list.appendChild(
        buildLanguageRow(row.item, row.localized, language === row.item.code)
      );
    }

    count.textContent =
      `🌐 ${new Intl.NumberFormat(locale).format(EXPENSIUM_LANGUAGES.length)}`;
  }

  toggle.addEventListener("click", async () => {
    enabled = !enabled;
    await api.storage.local.set({ enabled });
    applyLocale();
  });

  for (const button of modeButtons) {
    button.addEventListener("click", async () => {
      logoMode = button.dataset.mode;
      await api.storage.local.set({ logoMode });
      applyLocale();
    });
  }

  search.addEventListener("input", () => {
    filter = search.value;
    render();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement !== search) {
      event.preventDefault();
      search.focus();
    } else if (event.key === "Escape" && search.value) {
      search.value = "";
      filter = "";
      render();
    }
  });

  async function init() {
    const result = await api.storage.local.get([
      "enabled", "language", "logoMode"
    ]);

    enabled = result.enabled !== false;
    language = result.language || "en";
    logoMode = ["auto", "standard", "premium"].includes(result.logoMode)
      ? result.logoMode
      : "auto";

    applyLocale();
  }

  init();
})();