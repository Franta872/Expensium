(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const BY_CODE = new Map(EXPENSIUM_LANGUAGES.map((item) => [item.code, item]));
  const C = EXPENSIUM_CORE;
  const originals = new WeakMap();

  let enabled = true;
  let language = "en";
  let logoMode = "auto";

  function detectedLocale() {
    return C.normalizeLocale(
      document.documentElement.lang || navigator.language || "en",
      BY_CODE
    );
  }

  function selectedLocale() {
    return language === "auto"
      ? detectedLocale()
      : C.normalizeLocale(language, BY_CODE);
  }

  function languageEntry() {
    return BY_CODE.get(selectedLocale()) || BY_CODE.get("en");
  }

  function logoLabel(svg) {
    const renderer = svg.closest("ytd-topbar-logo-renderer");
    const anchor = svg.closest("a#logo") || renderer?.querySelector("a#logo");

    return [
      anchor?.getAttribute("title"),
      anchor?.getAttribute("aria-label"),
      renderer?.getAttribute("aria-label")
    ].filter(Boolean).join(" ");
  }

  function detectedLogoKind(svg) {
    return C.detectLogoKind(logoLabel(svg));
  }

  function activeLogoKind(svg) {
    return C.resolveLogoKind(logoMode, detectedLogoKind(svg));
  }

  function activeWord(svg) {
    return C.wordFor(languageEntry(), activeLogoKind(svg));
  }

  function findOriginalWordmark(svg) {
    return (
      svg.querySelector('g[id^="youtube-paths"]') ||
      svg.querySelector('g[id*="youtube-paths"]') ||
      [...svg.children].find((node) => {
        return (
          node.tagName?.toLowerCase() === "g" &&
          node.querySelectorAll?.("path").length >= 5
        );
      })
    );
  }

  function safeBBox(node) {
    try {
      const box = node.getBBox();

      if (
        Number.isFinite(box.x) &&
        Number.isFinite(box.y) &&
        Number.isFinite(box.width) &&
        Number.isFinite(box.height) &&
        box.width > 0 &&
        box.height > 0
      ) {
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      }
    } catch (_) {}

    return null;
  }

  function makeWordmark(svg, targetBox) {
    const kind = activeLogoKind(svg);
    const word = activeWord(svg);
    const profile = C.scriptProfile(word);

    const group = document.createElementNS(SVG_NS, "g");
    group.id = "expensium-wordmark";
    group.dataset.locale = selectedLocale();
    group.dataset.logoKind = kind;
    group.dataset.targetX = String(targetBox.x);
    group.dataset.targetY = String(targetBox.y);
    group.dataset.targetWidth = String(targetBox.width);
    group.dataset.targetHeight = String(targetBox.height);
    group.dataset.baseXScale = String(profile.xScale);

    const text = document.createElementNS(SVG_NS, "text");
    text.textContent = word;
    text.setAttribute("x", "0");
    text.setAttribute("y", "0");
    text.setAttribute("fill", "currentColor");

    // v1.0.0 looked visibly too small because the whole text was scaled to
    // the original path bbox. Now height comes from the original logo plus a
    // script-specific optical multiplier; only excessive width is squeezed.
    text.setAttribute(
      "font-size",
      String((targetBox.height * profile.fontFactor).toFixed(3))
    );
    text.setAttribute("font-weight", String(profile.weight));
    text.setAttribute(
      "font-family",
      '"YouTube Sans","Roboto Condensed","Arial Narrow","Roboto","Noto Sans",sans-serif'
    );
    text.setAttribute("letter-spacing", String(profile.tracking));
    text.style.fontVariationSettings = `"wght" ${profile.weight}`;

    group.appendChild(text);
    return group;
  }

  function targetBoxFromGroup(group) {
    const box = {
      x: Number(group.dataset.targetX),
      y: Number(group.dataset.targetY),
      width: Number(group.dataset.targetWidth),
      height: Number(group.dataset.targetHeight)
    };

    return Object.values(box).every(Number.isFinite) ? box : null;
  }

  function fitWordmark(group) {
    const text = group?.querySelector("text");
    const target = targetBoxFromGroup(group);
    if (!text || !target) return;

    let box;
    try {
      box = text.getBBox();
    } catch (_) {
      return;
    }

    if (!box.width || !box.height) return;

    const baseXScale = Number(group.dataset.baseXScale) || 1;
    const naturalWidth = box.width * baseXScale;
    const fitX = naturalWidth > target.width
      ? target.width / naturalWidth
      : 1;
    const scaleX = baseXScale * fitX;

    const transformedWidth = box.width * scaleX;
    const left = target.x + Math.max(0, (target.width - transformedWidth) * 0.02);
    const top = target.y + (target.height - box.height) / 2;

    group.setAttribute(
      "transform",
      [
        `translate(${left.toFixed(4)} ${top.toFixed(4)})`,
        `scale(${scaleX.toFixed(5)} 1)`,
        `translate(${-box.x.toFixed(4)} ${-box.y.toFixed(4)})`
      ].join(" ")
    );
  }

  function scheduleFit(group) {
    requestAnimationFrame(() => fitWordmark(group));

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => fitWordmark(group)).catch(() => {});
    }
  }

  function restore(svg) {
    const custom = svg.querySelector("#expensium-wordmark");
    const saved = originals.get(svg);

    if (custom && saved?.clone) {
      custom.replaceWith(saved.clone.cloneNode(true));
      originals.delete(svg);
    }
  }

  function patch(svg) {
    if (!svg) return;

    if (!enabled) {
      restore(svg);
      return;
    }

    const custom = svg.querySelector("#expensium-wordmark");
    const wantedKind = activeLogoKind(svg);

    if (custom) {
      if (
        custom.dataset.locale !== selectedLocale() ||
        custom.dataset.logoKind !== wantedKind
      ) {
        const target = targetBoxFromGroup(custom);
        if (!target) return;

        const replacement = makeWordmark(svg, target);
        custom.replaceWith(replacement);
        scheduleFit(replacement);
      } else {
        scheduleFit(custom);
      }
      return;
    }

    const original = findOriginalWordmark(svg);
    if (!original) return;

    const target = safeBBox(original);
    if (!target) return;

    originals.set(svg, { clone: original.cloneNode(true), box: target });

    const replacement = makeWordmark(svg, target);
    original.replaceWith(replacement);
    scheduleFit(replacement);
  }

  function run() {
    document
      .querySelectorAll("ytd-topbar-logo-renderer ytd-logo svg")
      .forEach(patch);
  }

  async function loadSettings() {
    try {
      const result = await browser.storage.local.get([
        "enabled",
        "language",
        "logoMode"
      ]);

      enabled = result.enabled !== false;
      language = result.language || "en";
      logoMode = ["auto", "standard", "premium"].includes(result.logoMode)
        ? result.logoMode
        : "auto";
    } catch (_) {
      enabled = true;
      language = "en";
      logoMode = "auto";
    }
  }

  async function init() {
    await loadSettings();
    run();

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run, { once: true });
    }

    document.addEventListener("yt-navigate-finish", run, true);
    document.addEventListener("yt-page-data-updated", run, true);

    browser.storage.onChanged.addListener((changes, area) => {
      if (area !== "local") return;

      if (changes.enabled) enabled = changes.enabled.newValue !== false;
      if (changes.language) language = changes.language.newValue || "en";

      if (changes.logoMode) {
        logoMode = ["auto", "standard", "premium"].includes(changes.logoMode.newValue)
          ? changes.logoMode.newValue
          : "auto";
      }

      run();
    });

    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.addedNodes.length > 0)) run();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    let attempts = 0;
    const timer = setInterval(() => {
      run();
      attempts += 1;
      if (attempts >= 20) clearInterval(timer);
    }, 500);
  }

  init();
})();