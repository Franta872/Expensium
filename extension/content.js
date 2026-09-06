(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const BY_CODE = new Map(EXPENSIUM_LANGUAGES.map(x => [x.code, x]));
  const originals = new WeakMap();
  let enabled = true;
  let language = "en";

  function locale(value) {
    const raw = String(value || "en").replace("_", "-");
    if (/^zh-(TW|HK|MO|Hant)/i.test(raw)) return "zh-Hant";
    if (/^zh/i.test(raw)) return "zh-Hans";
    if (BY_CODE.has(raw)) return raw;
    const primary = raw.split("-")[0].toLowerCase();
    return BY_CODE.has(primary) ? primary : "en";
  }

  function activeLocale() {
    if (language !== "auto") return locale(language);
    return locale(document.documentElement.lang || navigator.language);
  }

  function activeVariant() {
    return BY_CODE.get(activeLocale()) || BY_CODE.get("en");
  }

  function wordGroup(svg) {
    return svg.querySelector('g[id^="youtube-paths"],g[id*="youtube-paths"]') ||
      [...svg.children].find(el => el.tagName?.toLowerCase() === "g" && el.querySelectorAll?.("path").length >= 5);
  }

  function bbox(node) {
    try {
      const b = node.getBBox();
      if ([b.x,b.y,b.width,b.height].every(Number.isFinite) && b.width > 0 && b.height > 0) {
        return {x:b.x,y:b.y,width:b.width,height:b.height};
      }
    } catch (_) {}
    return null;
  }

  function make(box) {
    const v = activeVariant();
    const g = document.createElementNS(SVG_NS, "g");
    const t = document.createElementNS(SVG_NS, "text");
    g.id = "expensium-wordmark";
    g.dataset.locale = activeLocale();
    g.dataset.box = [box.x,box.y,box.width,box.height].join(",");
    t.textContent = v.word;
    t.setAttribute("fill", "currentColor");
    t.setAttribute("font-size", "20");
    t.setAttribute("font-weight", "500");
    t.setAttribute("letter-spacing", "-0.35");
    t.setAttribute("font-family", '"YouTube Sans","Roboto Condensed","Arial Narrow","Noto Sans",sans-serif');
    g.append(t);
    return g;
  }

  function savedBox(g) {
    const p = (g.dataset.box || "").split(",").map(Number);
    return p.length === 4 && p.every(Number.isFinite) ? {x:p[0],y:p[1],width:p[2],height:p[3]} : null;
  }

  function fit(g) {
    const t = g?.querySelector("text");
    const target = savedBox(g);
    if (!t || !target) return;
    let b;
    try { b = t.getBBox(); } catch (_) { return; }
    if (!b.width || !b.height) return;
    const sy = target.height / b.height;
    const sx = Math.min(sy, target.width / b.width);
    g.setAttribute("transform", `translate(${target.x} ${target.y}) scale(${sx.toFixed(5)} ${sy.toFixed(5)}) translate(${-b.x} ${-b.y})`);
  }

  function scheduleFit(g) {
    requestAnimationFrame(() => fit(g));
    document.fonts?.ready?.then(() => fit(g)).catch(() => {});
  }

  function restore(svg) {
    const custom = svg.querySelector("#expensium-wordmark");
    const original = originals.get(svg);
    if (custom && original) {
      custom.replaceWith(original.cloneNode(true));
      originals.delete(svg);
    }
  }

  function patch(svg) {
    if (!enabled) return restore(svg);
    const custom = svg.querySelector("#expensium-wordmark");
    if (custom) {
      if (custom.dataset.locale !== activeLocale()) {
        const box = savedBox(custom);
        if (!box) return;
        const next = make(box);
        custom.replaceWith(next);
        scheduleFit(next);
      } else scheduleFit(custom);
      return;
    }
    const original = wordGroup(svg);
    if (!original) return;
    const box = bbox(original);
    if (!box) return;
    originals.set(svg, original.cloneNode(true));
    const next = make(box);
    original.replaceWith(next);
    scheduleFit(next);
  }

  function run() {
    document.querySelectorAll("ytd-topbar-logo-renderer ytd-logo svg").forEach(patch);
  }

  async function init() {
    const settings = await browser.storage.local.get(["enabled","language"]);
    enabled = settings.enabled !== false;
    language = settings.language || "en";
    run();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, {once:true});
    document.addEventListener("yt-navigate-finish", run, true);
    document.addEventListener("yt-page-data-updated", run, true);
    browser.storage.onChanged.addListener((changes, area) => {
      if (area !== "local") return;
      if (changes.enabled) enabled = changes.enabled.newValue !== false;
      if (changes.language) language = changes.language.newValue || "en";
      run();
    });
    new MutationObserver(run).observe(document.documentElement, {childList:true,subtree:true});
    let tries = 0;
    const timer = setInterval(() => { run(); if (++tries >= 20) clearInterval(timer); }, 500);
  }

  init().catch(error => console.error("[Expensium]", error));
})();
