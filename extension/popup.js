(() => {
  "use strict";
  const BY_CODE = new Map(EXPENSIUM_LANGUAGES.map(x => [x.code,x]));
  const UI = {
    en:["Search languages","Automatic","Enabled","Disabled"], cs:["Hledat jazyky","Automaticky","Zapnuto","Vypnuto"],
    de:["Sprachen suchen","Automatisch","Aktiviert","Deaktiviert"], pl:["Szukaj języków","Automatycznie","Włączone","Wyłączone"],
    fr:["Rechercher des langues","Automatique","Activé","Désactivé"], es:["Buscar idiomas","Automático","Activado","Desactivado"],
    it:["Cerca lingue","Automatico","Attivato","Disattivato"], ru:["Поиск языков","Автоматически","Включено","Выключено"],
    ar:["البحث عن اللغات","تلقائي","مفعّل","معطّل"], ja:["言語を検索","自動","オン","オフ"], ko:["언어 검색","자동","켜짐","꺼짐"],
    "zh-Hans":["搜索语言","自动","已启用","已禁用"], "zh-Hant":["搜尋語言","自動","已啟用","已停用"]
  };
  const q = document.querySelector("#q"), list = document.querySelector("#list"), variant = document.querySelector("#variant"), toggle = document.querySelector("#toggle"), count = document.querySelector("#count");
  let enabled = true, language = "en", filter = "";

  function locale(value) {
    const raw = String(value || "en").replace("_","-");
    if (/^zh-(TW|HK|MO|Hant)/i.test(raw)) return "zh-Hant";
    if (/^zh/i.test(raw)) return "zh-Hans";
    if (BY_CODE.has(raw)) return raw;
    const p = raw.split("-")[0].toLowerCase();
    return BY_CODE.has(p) ? p : "en";
  }
  function current() { return language === "auto" ? locale(navigator.language) : locale(language); }
  function strings() { return UI[current()] || UI[current().split("-")[0]] || UI.en; }
  function names() { try { return new Intl.DisplayNames([current()],{type:"language"}); } catch (_) { return null; } }
  function langName(code,dn) { try { return dn?.of(code) || code; } catch (_) { return code; } }

  function row(item,name,selected) {
    const b = document.createElement("button");
    b.className = "language" + (selected ? " selected" : ""); b.type="button"; b.dir=item.dir; b.dataset.code=item.code;
    b.innerHTML = `<span class="code"></span><span class="names"><span class="name"></span><span class="sub"></span></span><span class="word"></span>`;
    b.querySelector(".code").textContent=item.code.toUpperCase().replace("ZH-",""); b.querySelector(".name").textContent=name; b.querySelector(".sub").textContent=item.code; b.querySelector(".word").textContent=item.word;
    b.onclick = async () => { language=item.code; filter=""; q.value=""; await browser.storage.local.set({language}); render(); };
    return b;
  }

  function autoRow(dn) {
    const item=BY_CODE.get(current())||BY_CODE.get("en"), b=row({code:"🌐",word:item.word,dir:item.dir},strings()[1],language==="auto");
    b.querySelector(".sub").textContent=langName(item.code,dn); b.onclick=async()=>{language="auto";filter="";q.value="";await browser.storage.local.set({language});render();}; return b;
  }

  function render() {
    const loc=current(), item=BY_CODE.get(loc)||BY_CODE.get("en"), s=strings(), dn=names(), needle=filter.trim().toLocaleLowerCase(loc);
    document.documentElement.lang=loc; document.documentElement.dir=item.dir; variant.textContent=item.word; q.placeholder=s[0];
    toggle.setAttribute("aria-checked",String(enabled)); toggle.title=enabled?s[2]:s[3];
    const rows=EXPENSIUM_LANGUAGES.map(x=>[x,langName(x.code,dn)]).filter(([x,n])=>!needle||`${x.code} ${x.word} ${n}`.toLocaleLowerCase(loc).includes(needle)).sort((a,b)=>new Intl.Collator(loc,{sensitivity:"base"}).compare(a[1],b[1]));
    list.replaceChildren(); if(!needle) list.append(autoRow(dn)); for(const [x,n] of rows) list.append(row(x,n,language===x.code));
    count.textContent=`🌐 ${new Intl.NumberFormat(loc).format(EXPENSIUM_LANGUAGES.length)}`;
  }

  toggle.onclick=async()=>{enabled=!enabled;await browser.storage.local.set({enabled});render();}; q.oninput=()=>{filter=q.value;render();};
  document.addEventListener("keydown",e=>{if(e.key==="/"&&document.activeElement!==q){e.preventDefault();q.focus();return;}if(e.key==="Escape"&&q.value){q.value="";filter="";render();return;}const rows=[...list.querySelectorAll(".language")];const i=rows.indexOf(document.activeElement);if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();rows[Math.max(0,Math.min(rows.length-1,(i<0?0:i)+(e.key==="ArrowDown"?1:-1)))]?.focus();}});
  browser.storage.local.get(["enabled","language"]).then(s=>{enabled=s.enabled!==false;language=s.language||"en";render();});
})();
