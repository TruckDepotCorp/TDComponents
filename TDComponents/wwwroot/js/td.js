class Ue extends HTMLElement {
  beginPending() {
    if (this.hasAttribute("data-pending"))
      return;
    this.setAttribute("data-pending", "");
    const t = this.querySelector("button");
    t && (t.setAttribute("aria-busy", "true"), t.setAttribute("aria-disabled", "true")), this.querySelector(".td-btn__label")?.setAttribute("aria-hidden", "true"), this.querySelector(".td-btn__pending")?.removeAttribute("aria-hidden");
  }
}
const kn = "td-grid-density", _n = "td-grid-lines";
class ia extends HTMLElement {
  constructor() {
    super(...arguments), this.searchTimer = 0, this.lastCheck = null, this.dragKey = "";
  }
  connectedCallback() {
    this.bindChrome(), this.restore(), this.pinFrozen(), this.syncActions();
    const t = this.querySelector("[data-td-status]");
    t instanceof HTMLElement && !t.dataset.base && (t.dataset.base = t.textContent ?? "");
  }
  handleClick(t, a) {
    const n = t.closest("[data-td-density]");
    if (n instanceof HTMLButtonElement) {
      this.setDensity(n.dataset.tdDensity === "compact" ? "compact" : "comfortable");
      return;
    }
    if (t.closest("[data-td-lines]")) {
      this.toggleLines();
      return;
    }
    if (t.closest("[data-td-columns]")) {
      this.togglePicker();
      return;
    }
    const s = t.closest("[data-td-column]");
    if (s instanceof HTMLButtonElement) {
      this.toggleColumn(s);
      return;
    }
    if (t.closest("[data-td-export]")) {
      this.exportCsv();
      return;
    }
    const o = t.closest("[data-td-filter-open]");
    if (o instanceof HTMLButtonElement) {
      this.openFilter(o);
      return;
    }
    if (t.closest("[data-td-filter-apply]")) {
      this.applyFilter();
      return;
    }
    if (t.closest("[data-td-filter-clear]")) {
      this.clearFilter();
      return;
    }
    const r = t.closest("[data-td-logic]");
    if (r instanceof HTMLButtonElement) {
      this.setLogic(r.dataset.tdLogic === "or" ? "or" : "and");
      return;
    }
    if (t.closest("[data-td-discard]")) {
      this.discard();
      return;
    }
    const i = t.closest("[data-td-select-all]");
    if (i instanceof HTMLInputElement) {
      this.querySelectorAll("[data-td-select]").forEach((u) => {
        u.checked = i.checked, u.closest("tr")?.classList.toggle("is-selected", u.checked);
      }), this.syncActions();
      return;
    }
    const c = t.closest("[data-td-check-value]");
    if (c instanceof HTMLButtonElement) {
      c.setAttribute("aria-checked", String(c.getAttribute("aria-checked") !== "true"));
      return;
    }
    const l = t.closest("[data-td-menu-action]");
    if (l instanceof HTMLButtonElement) {
      const u = l.dataset.href;
      if (l.dataset.tdMenuAction === "copy") {
        const p = l.dataset.copy ?? "";
        navigator.clipboard?.writeText(p);
        const m = this.querySelector("[data-td-status]");
        m instanceof HTMLElement && (m.textContent = `Copiado · ${p}`);
      } else u && (window.location.href = u);
      this.closePopups();
      return;
    }
    const d = t.closest("[data-td-select]");
    if (d instanceof HTMLInputElement) {
      if (this.lastCheck && a instanceof MouseEvent && a.shiftKey) {
        const u = [...this.querySelectorAll("[data-td-select]")], p = u.indexOf(this.lastCheck), m = u.indexOf(d);
        if (p >= 0 && m >= 0) {
          const [h, g] = p < m ? [p, m] : [m, p];
          for (let f = h; f <= g; f++)
            u[f].checked = d.checked, u[f].closest("tr")?.classList.toggle("is-selected", d.checked);
        }
      } else
        d.closest("tr")?.classList.toggle("is-selected", d.checked);
      this.lastCheck = d, this.syncSelection(), this.syncActions();
      return;
    }
    !t.closest("[data-td-filter]") && !t.closest("[data-td-column-picker]") && !t.closest("[data-td-columns]") && !t.closest("[data-td-cell-menu]") && this.closePopups();
  }
  handleInput(t) {
    if (t instanceof HTMLInputElement) {
      if (t.dataset.tdStock !== void 0) {
        this.onStock(t);
        return;
      }
      if (t.dataset.tdCheckSearch !== void 0) {
        const a = t.value.toLocaleLowerCase();
        this.querySelectorAll("[data-td-check-value]").forEach((n) => {
          const s = (n.dataset.tdCheckValue ?? "").toLocaleLowerCase();
          n.hidden = a.length > 0 && !s.includes(a);
        });
        return;
      }
      (t.type === "search" && t.closest("[data-td-search-form]") || t.dataset.tdFilterValue !== void 0) && (window.clearTimeout(this.searchTimer), this.searchTimer = window.setTimeout(() => t.form?.requestSubmit(), 280));
    }
  }
  handleChange(t) {
    if (t instanceof HTMLSelectElement) {
      if (t.dataset.tdFilterOp !== void 0) {
        t.form?.requestSubmit();
        return;
      }
      t.closest("[data-td-filter]") && this.syncValueVisibility();
    }
  }
  restore() {
    const t = this.dataset.settings ?? "";
    try {
      const a = localStorage.getItem(kn);
      (a === "compact" || a === "comfortable") && this.setDensity(a), localStorage.getItem(_n) === "1" && this.setLines(!0);
      const n = localStorage.getItem(this.columnKey(t));
      if (n) {
        const r = JSON.parse(n);
        for (const [i, c] of Object.entries(r))
          this.setColumn(i, c);
      }
      const s = localStorage.getItem(this.widthKey(t));
      if (s) {
        const r = JSON.parse(s);
        for (const [i, c] of Object.entries(r))
          this.setWidth(i, c);
      }
      const o = localStorage.getItem(this.orderKey(t));
      o && JSON.parse(o).forEach((i, c) => {
        const l = this.headerKeys();
        l.indexOf(i) > c && this.moveColumn(i, l[c] ?? i);
      });
    } catch {
    }
  }
  setDensity(t) {
    this.dataset.density = t, this.querySelectorAll("[data-td-density]").forEach((a) => {
      a.setAttribute("aria-pressed", String(a.dataset.tdDensity === t));
    });
    try {
      localStorage.setItem(kn, t);
    } catch {
    }
  }
  toggleLines() {
    this.setLines(this.dataset.lines !== "true");
  }
  setLines(t) {
    t ? this.dataset.lines = "true" : delete this.dataset.lines, this.querySelector("[data-td-lines]")?.setAttribute("aria-pressed", String(t));
    try {
      localStorage.setItem(_n, t ? "1" : "0");
    } catch {
    }
  }
  togglePicker() {
    const t = this.querySelector("[data-td-column-picker]"), a = this.querySelector("[data-td-columns]");
    if (!(t instanceof HTMLElement) || !(a instanceof HTMLButtonElement))
      return;
    const n = t.hidden;
    this.closePopups(), t.hidden = !n, a.setAttribute("aria-expanded", String(n));
  }
  toggleColumn(t) {
    const a = t.dataset.tdColumn;
    if (!a || t.disabled)
      return;
    const n = t.getAttribute("aria-checked") !== "true";
    this.setColumn(a, n);
    const s = {};
    this.querySelectorAll("[data-td-column]").forEach((o) => {
      o.dataset.tdColumn && (s[o.dataset.tdColumn] = o.getAttribute("aria-checked") === "true");
    });
    try {
      localStorage.setItem(this.columnKey(this.dataset.settings ?? ""), JSON.stringify(s));
    } catch {
    }
  }
  setColumn(t, a) {
    this.querySelectorAll(`[data-col="${CSS.escape(t)}"]`).forEach((s) => {
      s.hidden = !a;
    }), this.querySelector(`[data-td-column="${CSS.escape(t)}"]`)?.setAttribute("aria-checked", String(a));
  }
  openFilter(t) {
    const a = this.querySelector("[data-td-filter]"), n = this.querySelector(".td-grid__card");
    if (!(a instanceof HTMLElement) || !(n instanceof HTMLElement))
      return;
    const s = t.dataset.type === "list" ? "list" : t.dataset.type === "text" ? "text" : t.dataset.type === "date" ? "date" : "num", o = (t.dataset.current ?? "").split("|");
    this.dataset.filterCol = t.dataset.col ?? "", this.dataset.filterType = s;
    const r = this.querySelector("[data-td-filter-title]");
    r && (r.textContent = `Filtrar · ${t.dataset.title ?? ""}`);
    const i = this.querySelector("[data-td-checklist]"), c = this.querySelector("[data-td-advanced]");
    s === "list" ? (c instanceof HTMLElement && (c.hidden = !0), i instanceof HTMLElement && (i.hidden = !1, this.fillChecklist(i, t))) : (i instanceof HTMLElement && (i.hidden = !0), c instanceof HTMLElement && (c.hidden = !1)), this.showOperators(s === "text" ? "text" : "num"), this.setSelect("1", o[0] || (s === "text" ? "contains" : "eq")), this.setSelect("2", o[3] || (s === "text" ? "contains" : "eq")), this.setValue("1", o[1] || ""), this.setValue("2", o[4] || ""), this.setLogic(o[2] === "or" ? "or" : "and"), this.querySelectorAll("[data-td-value]").forEach((u) => {
      u instanceof HTMLInputElement && (u.type = s === "date" ? "date" : s === "num" ? "number" : "text");
    }), this.syncValueVisibility();
    const l = t.getBoundingClientRect(), d = n.getBoundingClientRect();
    this.closePopups(), a.hidden = !1, this.placeFloating(a, n, l.left - d.left - 8, l.bottom - d.top + 6, 290), t.setAttribute("aria-expanded", "true");
  }
  applyFilter() {
    const t = this.dataset.filterCol;
    if (!t)
      return;
    const a = this.readFilters().filter((n) => n.key !== t);
    if (this.dataset.filterType === "list") {
      const n = [...this.querySelectorAll('[data-td-check-value][aria-checked="true"]')].map((s) => s.dataset.tdCheckValue ?? "").filter(Boolean).join(",");
      n && a.push({ key: t, op1: "in", value1: n, logic: "and", op2: "", value2: "" });
    } else {
      const n = this.operatorValue("1"), s = this.operatorValue("2"), o = this.inputValue("1"), r = this.inputValue("2"), i = this.querySelector('[data-td-logic][aria-pressed="true"]')?.dataset.tdLogic ?? "and";
      (this.active(n, o) || this.active(s, r)) && a.push({ key: t, op1: n, value1: o, logic: i, op2: s, value2: r });
    }
    this.writeFilters(a);
  }
  clearFilter() {
    const t = this.dataset.filterCol;
    this.writeFilters(this.readFilters().filter((a) => a.key !== t));
  }
  writeFilters(t) {
    const a = this.querySelector("[data-td-filter-field]");
    a instanceof HTMLInputElement && (a.value = t.map((n) => [n.key, n.op1, n.value1, n.logic, n.op2, n.value2].map(encodeURIComponent).join("|")).join(";")), this.querySelector("[data-td-search-form]")?.requestSubmit();
  }
  readFilters() {
    const t = this.querySelector("[data-td-filter-field]"), a = t instanceof HTMLInputElement ? t.value : "";
    return a ? a.split(";").filter(Boolean).map((n) => {
      const s = n.split("|").map(decodeURIComponent);
      return {
        key: s[0] ?? "",
        op1: s[1] ?? "",
        value1: s[2] ?? "",
        logic: s[3] === "or" ? "or" : "and",
        op2: s[4] ?? "",
        value2: s[5] ?? ""
      };
    }) : [];
  }
  onStock(t) {
    const a = t.closest("tr"), n = t.value !== (t.dataset.original ?? "");
    a?.classList.toggle("is-dirty", n);
    const s = a?.querySelector("[data-td-stock-state]");
    if (s instanceof HTMLElement) {
      const o = Number(t.value);
      s.classList.remove("is-ok", "is-low", "is-out"), o <= 0 ? (s.textContent = "Agotado", s.classList.add("is-out")) : o <= 10 ? (s.textContent = "Pocas unidades", s.classList.add("is-low")) : (s.textContent = "En stock", s.classList.add("is-ok"));
    }
    this.syncActions();
  }
  discard() {
    this.querySelectorAll("[data-td-stock]").forEach((t) => {
      t.value = t.dataset.original ?? "", this.onStock(t);
    });
  }
  syncActions() {
    const t = this.querySelectorAll("tr.is-dirty").length, a = this.querySelectorAll("[data-td-select]:checked").length;
    this.querySelectorAll("[data-td-discard], .td-grid__savebar .td-btn").forEach((s) => {
      s.disabled = t === 0;
    });
    const n = this.querySelector("[data-td-status]");
    if (n instanceof HTMLElement) {
      if (t > 0) {
        n.textContent = `${t} ${t === 1 ? "fila modificada" : "filas modificadas"} · sin guardar`;
        return;
      }
      if (a > 0) {
        n.textContent = `${a} ${a === 1 ? "repuesto seleccionado" : "repuestos seleccionados"}`;
        return;
      }
      n.textContent = n.dataset.base ?? "";
    }
  }
  syncSelection() {
    const t = [...this.querySelectorAll("[data-td-select]")], a = this.querySelector("[data-td-select-all]");
    if (!a)
      return;
    const n = t.filter((s) => s.checked).length;
    a.checked = t.length > 0 && n === t.length, a.indeterminate = n > 0 && n < t.length, a.closest("th")?.setAttribute("aria-checked", a.indeterminate ? "mixed" : String(a.checked));
  }
  exportCsv() {
    const t = this.querySelector('script[data-td-export-json], script[type="application/json"][data-td-export]');
    if (!t?.textContent)
      return;
    let a;
    try {
      a = JSON.parse(t.textContent);
    } catch {
      return;
    }
    const n = a.columns ?? [], s = a.rows ?? [], o = (l) => /[";\n]/.test(l) ? `"${l.replaceAll('"', '""')}"` : l, r = `\uFEFF${[n.map((l) => o(l.label)).join(";"), ...s.map((l) => n.map((d) => o(l[d.key] ?? "")).join(";"))].join(`
`)}`, i = document.createElement("a");
    i.href = URL.createObjectURL(new Blob([r], { type: "text/csv;charset=utf-8" })), i.download = "repuestos.csv", i.rel = "noopener", document.body.append(i), i.click(), i.remove(), window.setTimeout(() => URL.revokeObjectURL(i.href), 1e3);
    const c = this.querySelector("[data-td-status]");
    c instanceof HTMLElement && (c.textContent = `CSV exportado · ${s.length} ${s.length === 1 ? "fila" : "filas"} con filtros y orden actuales`);
  }
  closePopups() {
    const t = this.querySelector("[data-td-column-picker]");
    t instanceof HTMLElement && (t.hidden = !0), this.querySelector("[data-td-columns]")?.setAttribute("aria-expanded", "false");
    const a = this.querySelector("[data-td-filter]");
    a instanceof HTMLElement && (a.hidden = !0), this.querySelectorAll("[data-td-filter-open]").forEach((s) => s.setAttribute("aria-expanded", "false"));
    const n = this.querySelector("[data-td-cell-menu]");
    n instanceof HTMLElement && (n.hidden = !0);
  }
  showOperators(t) {
    this.querySelectorAll("[data-td-op]").forEach((a) => {
      a.hidden = a.dataset.for !== t;
    });
  }
  setSelect(t, a) {
    this.querySelectorAll(`[data-td-op="${t}"]`).forEach((n) => {
      [...n.options].some((s) => s.value === a) && (n.value = a);
    });
  }
  setValue(t, a) {
    const n = this.querySelector(`[data-td-value="${t}"]`);
    n instanceof HTMLInputElement && (n.value = a);
  }
  setLogic(t) {
    this.querySelectorAll("[data-td-logic]").forEach((a) => {
      a.setAttribute("aria-pressed", String(a.dataset.tdLogic === t));
    });
  }
  syncValueVisibility() {
    ["1", "2"].forEach((t) => {
      const a = this.operatorValue(t), n = this.querySelector(`[data-td-value="${t}"]`);
      n instanceof HTMLElement && (n.hidden = a === "empty" || a === "nempty");
    });
  }
  operatorValue(t) {
    return [...this.querySelectorAll(`[data-td-op="${t}"]`)].find((n) => !n.hidden)?.value ?? "";
  }
  inputValue(t) {
    const a = this.querySelector(`[data-td-value="${t}"]`);
    return a instanceof HTMLInputElement ? a.value : "";
  }
  active(t, a) {
    return t === "empty" || t === "nempty" || a.trim().length > 0;
  }
  columnKey(t) {
    return `td-grid-cols:${t || "default"}`;
  }
  widthKey(t) {
    return `td-grid-widths:${t || "default"}`;
  }
  orderKey(t) {
    return `td-grid-order:${t || "default"}`;
  }
  bindChrome() {
    this.dataset.chrome !== "1" && (this.dataset.chrome = "1", this.addEventListener("pointerdown", (t) => {
      const a = t.target instanceof Element ? t.target.closest("[data-td-resize]") : null;
      a instanceof HTMLElement && t instanceof PointerEvent && (t.preventDefault(), this.startResize(a, t));
    }), this.addEventListener("contextmenu", (t) => {
      if (this.dataset.contextMenu !== "true" || !(t.target instanceof Element))
        return;
      const a = t.target.closest("[data-td-cell]");
      a instanceof HTMLElement && (t.preventDefault(), this.openCellMenu(a, t.clientX, t.clientY));
    }), this.addEventListener("dragstart", (t) => {
      const a = t.target instanceof Element ? t.target.closest("th[data-col]") : null;
      !(a instanceof HTMLElement) || this.dataset.reorder !== "true" || (this.dragKey = a.dataset.col ?? "");
    }), this.addEventListener("dragover", (t) => {
      this.dataset.reorder === "true" && t.preventDefault();
    }), this.addEventListener("drop", (t) => {
      const a = t.target instanceof Element ? t.target.closest("th[data-col]") : null;
      !(a instanceof HTMLElement) || !this.dragKey || (t.preventDefault(), this.moveColumn(this.dragKey, a.dataset.col ?? ""), this.saveOrder(), this.pinFrozen());
    }), this.addEventListener("keydown", (t) => {
      if (!(t instanceof KeyboardEvent) || !t.altKey)
        return;
      const a = document.activeElement?.closest("th[data-col]");
      if (!(a instanceof HTMLElement) || !a.dataset.col)
        return;
      const n = this.headerKeys(), s = n.indexOf(a.dataset.col), o = t.key === "ArrowLeft" ? n[s - 1] : t.key === "ArrowRight" ? n[s + 1] : "";
      o && (t.preventDefault(), this.moveColumn(a.dataset.col, o), this.saveOrder(), a.focus());
    }));
  }
  startResize(t, a) {
    const n = t.dataset.col ?? "", s = t.closest("th");
    if (!n || !(s instanceof HTMLElement))
      return;
    const o = a.clientX, r = s.getBoundingClientRect().width, i = (l) => this.setWidth(n, Math.max(72, r + l.clientX - o)), c = () => {
      window.removeEventListener("pointermove", i), window.removeEventListener("pointerup", c), this.saveWidths(), this.pinFrozen();
    };
    window.addEventListener("pointermove", i), window.addEventListener("pointerup", c);
  }
  setWidth(t, a) {
    const n = this.querySelector("table");
    n instanceof HTMLElement && (n.style.tableLayout = "fixed");
    const s = this.querySelector(`thead th[data-col="${CSS.escape(t)}"]`);
    s instanceof HTMLElement && (s.style.width = `${Math.round(a)}px`);
  }
  saveWidths() {
    const t = {};
    this.querySelectorAll("thead th[data-col]").forEach((a) => {
      a.dataset.col && a.style.width && (t[a.dataset.col] = Number.parseInt(a.style.width, 10));
    });
    try {
      localStorage.setItem(this.widthKey(this.dataset.settings ?? ""), JSON.stringify(t));
    } catch {
    }
  }
  headerKeys() {
    return [...this.querySelectorAll("thead th[data-col]")].map((t) => t.dataset.col ?? "").filter(Boolean);
  }
  moveColumn(t, a) {
    !t || !a || t === a || this.querySelectorAll("tr").forEach((n) => {
      const s = [...n.children], o = s.find((i) => i.dataset.col === t), r = s.find((i) => i.dataset.col === a);
      o && r && r.parentElement?.insertBefore(o, r);
    });
  }
  saveOrder() {
    try {
      localStorage.setItem(this.orderKey(this.dataset.settings ?? ""), JSON.stringify(this.headerKeys()));
    } catch {
    }
  }
  pinFrozen() {
    const t = [...this.querySelectorAll("thead th[data-col]")];
    let a = 0;
    t.filter((s) => s.classList.contains("is-frozen-left")).forEach((s) => {
      s.style.left = `${a}px`, this.querySelectorAll(`td[data-col="${CSS.escape(s.dataset.col ?? "")}"]`).forEach((o) => {
        o.style.left = `${a}px`;
      }), a += s.getBoundingClientRect().width;
    });
    let n = 0;
    [...t].reverse().filter((s) => s.classList.contains("is-frozen-right")).forEach((s) => {
      s.style.right = `${n}px`, this.querySelectorAll(`td[data-col="${CSS.escape(s.dataset.col ?? "")}"]`).forEach((o) => {
        o.style.right = `${n}px`;
      }), n += s.getBoundingClientRect().width;
    });
  }
  fillChecklist(t, a) {
    t.replaceChildren();
    const n = document.createElement("input");
    n.dataset.tdCheckSearch = "", n.placeholder = "Buscar valor…", n.setAttribute("aria-label", "Buscar valor"), t.append(n);
    let s = [];
    try {
      s = JSON.parse(a.dataset.values ?? "[]");
    } catch {
      s = [];
    }
    const o = (a.dataset.current ?? "").split("|"), r = new Set((o[1] ?? "").split(",").filter(Boolean));
    s.forEach((i) => {
      const c = document.createElement("button");
      c.type = "button", c.dataset.tdCheckValue = i.v, c.setAttribute("aria-checked", String(r.has(i.v)));
      const l = document.createElement("span");
      l.textContent = i.v;
      const d = document.createElement("span");
      d.textContent = String(i.n), c.append(l, d), t.append(c);
    });
  }
  openCellMenu(t, a, n) {
    const s = this.querySelector("[data-td-cell-menu]"), o = this.querySelector(".td-grid__card");
    if (!(s instanceof HTMLElement) || !(o instanceof HTMLElement))
      return;
    s.replaceChildren();
    const r = document.createElement("p");
    r.className = "td-grid__popover-title", r.textContent = t.dataset.title ?? "Celda";
    const i = document.createElement("p");
    i.className = "td-grid__menutext", i.textContent = t.dataset.copy ?? "", s.append(r, i), this.menuItem(s, "Copiar valor", "copy", t.dataset.copy ?? ""), this.menuItem(s, "Filtrar por este valor", "go", "", t.dataset.filterHref), this.menuItem(s, "Ordenar ascendente", "go", "", t.dataset.sortAsc), this.menuItem(s, "Ordenar descendente", "go", "", t.dataset.sortDesc), this.menuItem(s, "Abrir ficha", "go", "", t.dataset.ficha), this.closePopups(), s.hidden = !1;
    const c = o.getBoundingClientRect();
    this.placeFloating(s, o, a - c.left, n - c.top, 250);
  }
  placeFloating(t, a, n, s, o) {
    const r = a.getBoundingClientRect(), i = Math.max(160, Math.min(o, r.width - 16, window.innerWidth - 24));
    t.style.width = `${i}px`;
    const c = Math.max(8, Math.min(n, r.width - i - 8));
    t.style.left = `${c}px`, t.style.top = `${Math.max(8, s)}px`;
    const l = t.getBoundingClientRect();
    if (l.right > window.innerWidth - 8 && (t.style.left = `${Math.max(8, c - (l.right - window.innerWidth + 8))}px`), l.bottom > window.innerHeight - 8) {
      const d = s - l.height - 12;
      d > 8 && (t.style.top = `${d}px`);
    }
  }
  menuItem(t, a, n, s, o) {
    if (n === "go" && !o)
      return;
    const r = document.createElement("button");
    r.type = "button", r.dataset.tdMenuAction = n, r.dataset.copy = s, o && (r.dataset.href = o), r.textContent = a, t.append(r);
  }
}
const ro = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
class Zt extends HTMLElement {
  handleInput() {
    const t = this.getControl();
    t && (this.hideServerError(), (this.dataset.touched === "true" || this.isClientErrorVisible()) && this.validate(), this.updateCounter(), this.dispatchChange(t));
  }
  handleBlur() {
    this.dataset.touched = "true", this.validate();
  }
  validate() {
    const t = this.getControl();
    if (!t)
      return !0;
    const a = this.clientError(t);
    return this.showClientError(a), a ? t.setAttribute("aria-invalid", "true") : this.hasServerError() || t.removeAttribute("aria-invalid"), a === null;
  }
  focusInput() {
    this.getControl()?.focus();
  }
  getControl() {
    const t = this.querySelector("input, textarea");
    return t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement ? t : null;
  }
  clientError(t) {
    const a = t.value.trim();
    if (t.required && a.length === 0)
      return fe(t, "data-msg-required", "Enter a value for this field.");
    if (t instanceof HTMLInputElement && t.type === "email" && a.length > 0 && !ro.test(a))
      return fe(t, "data-msg-type", "Enter an email address like name@company.com.");
    if (t.minLength > 0 && a.length > 0 && a.length < t.minLength)
      return fe(t, "data-msg-minlength", `Use at least ${t.minLength} characters.`);
    if (t.maxLength > 0 && t.value.length > t.maxLength)
      return fe(t, "data-msg-maxlength", `Use at most ${t.maxLength} characters.`);
    if (t instanceof HTMLInputElement && t.pattern)
      try {
        const n = new RegExp(`^(?:${t.pattern})$`);
        if (a.length > 0 && !n.test(t.value))
          return fe(t, "data-msg-pattern", "Use the requested format for this field.");
      } catch {
        return null;
      }
    return null;
  }
  updateCounter() {
    const t = this.getControl(), a = this.querySelector("[data-td-counter]");
    !t || !(a instanceof HTMLElement) || t.maxLength < 0 || (a.textContent = `${t.value.length} / ${t.maxLength}`);
  }
  showClientError(t) {
    const a = this.querySelector("[data-td-client-error]");
    if (a instanceof HTMLElement) {
      if (!t) {
        a.textContent = "", a.hidden = !0;
        return;
      }
      a.textContent = t, a.hidden = !1;
    }
  }
  isClientErrorVisible() {
    const t = this.querySelector("[data-td-client-error]");
    return t instanceof HTMLElement && !t.hidden && (t.textContent?.trim().length ?? 0) > 0;
  }
  hideServerError() {
    const t = this.querySelector("[data-td-server-error]");
    t instanceof HTMLElement && (t.hidden = !0);
  }
  hasServerError() {
    const t = this.querySelector("[data-td-server-error]");
    return t instanceof HTMLElement && !t.hidden && !!t.querySelector(".validation-message");
  }
  dispatchChange(t) {
    this.dispatchEvent(new CustomEvent("ux-change", {
      bubbles: !0,
      composed: !0,
      detail: {
        name: t.name,
        value: t.value,
        valid: this.clientError(t) === null
      }
    }));
  }
}
function fe(e, t, a) {
  const n = e.getAttribute(t);
  return n && n.trim().length > 0 ? n : a;
}
function io(e = document) {
  e.querySelectorAll("td-markdown").forEach((t) => {
    const a = t.querySelector("[data-td-md-source]");
    a && za(t, a.value);
  }), e.querySelectorAll("td-knob").forEach((t) => {
    t instanceof HTMLElement && Kt(t, Number(t.dataset.value ?? 0));
  }), e.querySelectorAll("[data-td-toc]").forEach((t) => {
    t instanceof HTMLElement && So(t);
  }), e.querySelectorAll("td-menuapp").forEach((t) => {
    t instanceof HTMLElement && xo(t);
  }), e.querySelectorAll("td-ddgrid").forEach((t) => Va(t)), e.querySelectorAll("[data-td-navmenu]").forEach((t) => {
    if (!(t instanceof HTMLElement) || t.dataset.bound === "true")
      return;
    t.dataset.bound = "true";
    const a = Number(t.dataset.delay ?? 120);
    let n = 0;
    const s = (o, r) => {
      window.clearTimeout(n), n = window.setTimeout(o, r);
    };
    t.addEventListener("pointerover", (o) => {
      const i = (o.target instanceof Element ? o.target : null)?.closest(".td-navmenu__bar .td-navmenu__btn");
      if (!(!(i instanceof HTMLElement) || !t.contains(i))) {
        if (i instanceof HTMLButtonElement && i.hasAttribute("data-td-nav-open")) {
          if (i.getAttribute("aria-expanded") === "true") {
            window.clearTimeout(n);
            return;
          }
          s(() => Ye(i, !0), a);
          return;
        }
        s(() => Xe(t), a);
      }
    }), t.addEventListener("pointerleave", () => {
      s(() => Xe(t), 180);
    });
  });
}
function co(e) {
  const t = e.closest("[data-td-popup-open]");
  if (t instanceof HTMLButtonElement) {
    const L = t.closest("td-popup")?.querySelector("[data-td-popup-panel]");
    if (L) {
      const q = L.hidden;
      _a(), L.hidden = !q, t.setAttribute("aria-expanded", String(q));
    }
    return !0;
  }
  e.closest("td-popup") || _a();
  const a = e.closest("[data-td-shell-bell]");
  if (a instanceof HTMLButtonElement) {
    const y = a.parentElement?.querySelector("[data-td-shell-notes]");
    return y && (y.hidden = !y.hidden, a.setAttribute("aria-expanded", String(!y.hidden))), !0;
  }
  e.closest("[data-td-shell-notes]") || (document.querySelectorAll("[data-td-shell-notes]").forEach((y) => {
    y.hidden = !0;
  }), document.querySelectorAll("[data-td-shell-bell]").forEach((y) => y.setAttribute("aria-expanded", "false")));
  const n = e.closest("[data-td-shell-mask]");
  if (n instanceof HTMLElement) {
    const y = n.closest("td-layout");
    return y && (y.dataset.collapsed = "true", y.querySelector("[data-td-layout-toggle]")?.setAttribute("aria-expanded", "false")), !0;
  }
  const s = e.closest("[data-td-layout-toggle]");
  if (s instanceof HTMLButtonElement) {
    const y = s.closest("td-layout");
    if (y) {
      const L = y.dataset.collapsed !== "true";
      y.dataset.collapsed = String(L), s.setAttribute("aria-expanded", String(!L));
    }
    return !0;
  }
  const o = e.closest("[data-td-layout-side]");
  if (o instanceof HTMLButtonElement) {
    const y = o.closest("td-layout");
    if (y) {
      const L = y.dataset.side !== "start";
      y.dataset.side = L ? "start" : "end", o.setAttribute("aria-checked", String(L)), o.lastChild && (o.lastChild.textContent = L ? "Sidebar a la izquierda" : "Sidebar a la derecha");
    }
    return !0;
  }
  const r = e.closest("[data-td-layout-pos]");
  if (r instanceof HTMLButtonElement) {
    const y = r.closest("td-layout");
    return y && (y.dataset.side = r.dataset.tdLayoutPos ?? "start", y.querySelectorAll("[data-td-layout-pos]").forEach((L) => {
      L.setAttribute("aria-pressed", String(L === r));
    })), !0;
  }
  const i = e.closest("[data-td-nav-open]");
  if (i instanceof HTMLButtonElement)
    return Ye(i, i.getAttribute("aria-expanded") !== "true"), !0;
  const c = e.closest("[data-td-pmenu-toggle]");
  if (c instanceof HTMLButtonElement) {
    const y = c.closest("[data-td-pmenu]"), L = c.closest("[data-td-pmenu-sec]"), q = c.getAttribute("aria-expanded") !== "true";
    if (y?.dataset.multiple !== "true" && y?.querySelectorAll("[data-td-pmenu-sec]").forEach((O) => {
      O.setAttribute("data-open", "false"), O.querySelector("[data-td-pmenu-toggle]")?.setAttribute("aria-expanded", "false");
      const W = O.querySelector(".td-pmenu__kids");
      W && (W.hidden = !0);
    }), L) {
      L.setAttribute("data-open", q ? "true" : "false");
      const O = L.querySelector(".td-pmenu__kids");
      O && (O.hidden = !q);
    }
    return c.setAttribute("aria-expanded", q ? "true" : "false"), !0;
  }
  const l = e.closest("[data-td-pmenu-link]");
  if (l instanceof HTMLElement) {
    const y = l.closest("[data-td-pmenu-demo]")?.querySelector("[data-td-pmenu-msg]");
    if (y) {
      const L = l.querySelector("span")?.textContent?.trim() || l.textContent?.trim() || "";
      y.textContent = `Navegar a: ${L}`;
    }
  }
  const d = e.closest("[data-td-pmenu-multi]");
  if (d instanceof HTMLButtonElement) {
    const y = d.closest("[data-td-pmenu-demo]")?.querySelector("[data-td-pmenu]"), L = y?.dataset.multiple !== "true";
    return y && (y.dataset.multiple = L ? "true" : "false"), d.setAttribute("aria-checked", L ? "true" : "false"), !0;
  }
  const u = e.closest("[data-td-pmenu-icons]");
  if (u instanceof HTMLButtonElement) {
    const y = u.closest("[data-td-pmenu-demo]")?.querySelector("[data-td-pmenu]"), L = !y?.classList.contains("is-collapsed");
    return y?.classList.toggle("is-collapsed", L), u.setAttribute("aria-checked", L ? "true" : "false"), !0;
  }
  const p = e.closest("[data-td-menu-row]");
  if (p instanceof HTMLElement)
    return Aa(p, !0), !0;
  const m = e.closest("[data-td-row-gap], [data-td-row-align]");
  if (m instanceof HTMLButtonElement) {
    const y = m.closest("[data-td-row-playground]"), L = y?.querySelectorAll(".td-row12");
    return m.dataset.tdRowGap && (L?.forEach((q) => {
      q.style.setProperty("--td-row-gap", m.dataset.tdRowGap ?? "16px");
    }), y?.querySelectorAll("[data-td-row-gap]").forEach((q) => {
      q.setAttribute("aria-pressed", String(q === m)), q.classList.toggle("is-on", q === m);
    })), m.dataset.tdRowAlign && (L?.forEach((q) => {
      q.style.alignItems = m.dataset.tdRowAlign ?? "stretch";
    }), y?.querySelectorAll("[data-td-row-align]").forEach((q) => {
      q.setAttribute("aria-pressed", String(q === m)), q.classList.toggle("is-on", q === m);
    })), !0;
  }
  const h = e.closest("[data-td-ddgrid-page]");
  if (h instanceof HTMLButtonElement) {
    const y = h.closest("td-ddgrid");
    return y instanceof HTMLElement && (y.dataset.page = String(Number(y.dataset.page ?? 1) + Number(h.dataset.tdDdgridPage ?? 1)), Va(y)), !0;
  }
  const g = e.closest("[data-td-ddgrid-clear]");
  if (g instanceof HTMLButtonElement) {
    const y = g.closest("td-ddgrid"), L = y?.querySelector("[data-td-ddgrid-value]"), q = y?.querySelector("[data-td-ddgrid-text]"), O = y?.querySelector("[data-td-ddgrid-code]");
    return L && (L.value = ""), q && (q.textContent = y?.querySelector("[data-td-ddgrid-open]")?.getAttribute("data-placeholder") ?? "Selecciona un repuesto…", q.classList.add("is-placeholder")), O && (O.textContent = ""), y?.querySelectorAll("[data-td-ddgrid-row]").forEach((W) => {
      W.classList.remove("is-on"), W.setAttribute("aria-selected", "false");
    }), g.hidden = !0, y?.querySelector(".td-select__trigger")?.classList.remove("has-clear"), !0;
  }
  const f = e.closest("[data-td-ddgrid-open]");
  if (f instanceof HTMLElement && !e.closest("[data-td-ddgrid-clear]")) {
    const L = f.closest("td-ddgrid")?.querySelector("[data-td-ddgrid-panel]");
    if (L) {
      const q = L.hidden;
      document.querySelectorAll("[data-td-ddgrid-panel]").forEach((O) => {
        O.hidden = !0;
      }), L.hidden = !q, f.setAttribute("aria-expanded", String(q));
    }
    return !0;
  }
  const b = e.closest("[data-td-ddgrid-row]");
  if (b instanceof HTMLElement) {
    const y = b.closest("td-ddgrid"), L = y?.querySelector("[data-td-ddgrid-value]"), q = y?.querySelector("[data-td-ddgrid-text]");
    L && (L.value = b.dataset.tdDdgridRow ?? ""), q && (q.textContent = b.dataset.label ?? "", q.classList.remove("is-placeholder"));
    const O = y?.querySelector("[data-td-ddgrid-code]");
    O && (O.textContent = b.dataset.code ?? ""), y?.querySelectorAll("[data-td-ddgrid-row]").forEach((Y) => {
      const k = Y === b;
      Y.classList.toggle("is-on", k), Y.setAttribute("aria-selected", k ? "true" : "false");
    }), y?.querySelector("[data-td-ddgrid-panel]")?.setAttribute("hidden", ""), y?.querySelector("[data-td-ddgrid-open]")?.setAttribute("aria-expanded", "false");
    const W = y?.querySelector("[data-td-ddgrid-clear]");
    return W && (W.hidden = !1), y?.querySelector(".td-select__trigger")?.classList.add("has-clear"), !0;
  }
  const v = e.closest("[data-td-md]");
  if (v instanceof HTMLButtonElement)
    return bo(v.closest("td-markdown"), v.dataset.tdMd ?? ""), !0;
  const x = e.closest("[data-td-md-mode]");
  if (x instanceof HTMLButtonElement) {
    const y = x.closest("td-markdown");
    return y && (y.dataset.mode = x.dataset.tdMdMode ?? "split", y.querySelectorAll("[data-td-md-mode]").forEach((L) => {
      L.setAttribute("aria-pressed", String(L === x));
    })), !0;
  }
  const M = e.closest("[data-td-ts-preset]");
  if (M instanceof HTMLButtonElement)
    return go(M.closest("td-timespan"), Number(M.dataset.tdTsPreset ?? 0)), !0;
  const S = e.closest("[data-td-knob-step]");
  if (S instanceof HTMLButtonElement) {
    const y = S.closest("td-knob");
    if (y instanceof HTMLElement) {
      const L = Number(y.dataset.step ?? 1) * Number(S.dataset.tdKnobStep ?? 1);
      Kt(y, Number(y.dataset.value ?? 0) + L);
    }
    return !0;
  }
  const $ = e.closest("[data-td-speech]");
  if ($ instanceof HTMLButtonElement)
    return $o($), !0;
  const w = e.closest("[data-td-ai-tip]");
  if (w instanceof HTMLButtonElement) {
    const y = w.closest("td-aichat")?.querySelector("[data-td-ai-form]"), L = y?.querySelector("input");
    return L && y && (L.value = w.textContent ?? "", y.requestSubmit()), !0;
  }
  return !1;
}
function lo(e) {
  if (!(!(e instanceof HTMLInputElement) && !(e instanceof HTMLTextAreaElement))) {
    if (e.matches("[data-td-md-source]")) {
      za(e.closest("td-markdown"), e.value);
      return;
    }
    if (e.matches("[data-td-ts]")) {
      hs(e.closest("td-timespan"));
      return;
    }
    if (e.matches("[data-td-ddgrid-q]")) {
      const t = e.closest("td-ddgrid");
      t instanceof HTMLElement && (t.dataset.page = "1", t.dataset.query = e.value, Va(t));
      return;
    }
    if (e.matches("[data-td-menuapp-q]")) {
      qa(e.closest("td-menuapp"), e.value);
      const t = e.closest("td-layout")?.querySelector("[data-td-shell-q]");
      t && t.value !== e.value && (t.value = e.value);
      return;
    }
    if (e.matches("[data-td-shell-q]")) {
      const t = e.closest("td-layout"), a = t?.querySelector("td-menuapp"), n = a?.querySelector("[data-td-menuapp-q]");
      n && (n.value = e.value), qa(a ?? null, e.value), e.value && t instanceof HTMLElement && t.dataset.collapsed === "true" && (t.dataset.collapsed = "false", t.querySelector("[data-td-layout-toggle]")?.setAttribute("aria-expanded", "true"));
      return;
    }
    if (e.matches("[data-td-menuapp-json]")) {
      vo(e.closest("td-menuapp"), e.value);
      return;
    }
    if (e.matches("[data-td-row-width]")) {
      const t = e.closest("[data-td-row-playground]")?.querySelector("[data-td-row-stage]");
      t && (t.style.width = `${e.value}px`, t.style.maxWidth = `${e.value}px`), e.setAttribute("aria-valuenow", e.value);
      return;
    }
    if (e.matches("[data-td-toolbar-q]")) {
      const t = document.querySelector("[data-td-toolbar-status]");
      t && (t.textContent = e.value.trim() ? `Buscar: ${e.value.trim()}` : "Vista: Lista");
    }
  }
}
function uo(e) {
  const t = e.target instanceof HTMLElement ? e.target.closest("[data-td-navmenu]") : null;
  if (t instanceof HTMLElement && ["ArrowLeft", "ArrowRight", "ArrowDown", "Escape"].includes(e.key)) {
    const i = [...t.querySelectorAll(".td-navmenu__bar .td-navmenu__btn")], c = i.findIndex((l) => l === document.activeElement || l.getAttribute("aria-expanded") === "true");
    if (e.key === "Escape") {
      Xe(t), i[Math.max(c, 0)]?.focus();
      return;
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const l = i[(Math.max(c, 0) + (e.key === "ArrowRight" ? 1 : i.length - 1)) % i.length];
      l instanceof HTMLButtonElement && l.hasAttribute("data-td-nav-open") ? Ye(l, !0) : Xe(t), l?.focus();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const l = i[Math.max(c, 0)];
      l instanceof HTMLButtonElement && l.hasAttribute("data-td-nav-open") && (Ye(l, !0), l.parentElement?.querySelector("a")?.focus());
    }
    return;
  }
  if (e.key === "/" && e.target instanceof HTMLElement && e.target.closest("td-menuapp") && !e.target.matches("input, textarea")) {
    e.preventDefault(), e.target.closest("td-menuapp")?.querySelector("[data-td-menuapp-q]")?.focus();
    return;
  }
  if (e.key === "Escape" && e.target instanceof HTMLInputElement && e.target.matches("[data-td-menuapp-q]")) {
    e.target.value = "", qa(e.target.closest("td-menuapp"));
    const i = e.target.closest("td-layout")?.querySelector("[data-td-shell-q]");
    i && (i.value = "");
    return;
  }
  if (e.key === "Escape" && e.target instanceof HTMLElement && e.target.closest("td-layout.td-appshell--menu") && !e.target.matches("input, textarea")) {
    const i = e.target.closest("td-layout");
    i instanceof HTMLElement && i.dataset.collapsed !== "true" && (e.preventDefault(), i.dataset.collapsed = "true", i.querySelector("[data-td-layout-toggle]")?.setAttribute("aria-expanded", "false"));
    return;
  }
  const a = e.target instanceof HTMLElement ? e.target.closest("[data-td-menu-row]") : null;
  if (a instanceof HTMLElement && ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Enter"].includes(e.key)) {
    const i = [...a.closest("td-menuapp")?.querySelectorAll("[data-td-menu-row]:not([hidden])") ?? []], c = i.indexOf(a);
    (e.key === "ArrowDown" || e.key === "ArrowUp") && (e.preventDefault(), i[c + (e.key === "ArrowDown" ? 1 : -1)]?.focus()), (e.key === "ArrowRight" || e.key === "Enter") && (e.preventDefault(), Aa(a, e.key === "Enter")), e.key === "ArrowLeft" && a.getAttribute("aria-expanded") === "true" && (e.preventDefault(), Aa(a, !1));
    return;
  }
  const n = e.target instanceof Element ? e.target.closest("[data-td-ddgrid-open]") : null;
  if (n instanceof HTMLElement && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") && n.closest("td-ddgrid")?.querySelector("[data-td-ddgrid-panel]")?.hidden !== !1) {
    e.preventDefault(), n.click();
    return;
  }
  const s = e.target instanceof Element ? e.target.closest("td-ddgrid") : null;
  if (s && s.querySelector("[data-td-ddgrid-panel]")?.hidden === !1 && ["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
    const i = [...s.querySelectorAll("[data-td-ddgrid-row]:not([hidden])")], c = i.findIndex((l) => l.classList.contains("is-active") || l.classList.contains("is-on"));
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const l = i[Math.max(0, c + (e.key === "ArrowDown" ? 1 : -1))] ?? i[0];
      i.forEach((d) => d.classList.toggle("is-active", d === l)), l?.scrollIntoView({ block: "nearest" });
    }
    e.key === "Enter" && (e.preventDefault(), (i.find((l) => l.classList.contains("is-active")) ?? i[Math.max(c, 0)])?.click());
    return;
  }
  e.key === "Escape" && (_a(), document.querySelectorAll("[data-td-ddgrid-panel], .td-navmenu__panel").forEach((i) => {
    i.hidden = !0;
  }), document.querySelectorAll("[data-td-ddgrid-open], [data-td-nav-open]").forEach((i) => {
    i.setAttribute("aria-expanded", "false");
  }));
  const o = e.target instanceof Element ? e.target.closest("[data-td-drop-card]") : null;
  if (o instanceof HTMLElement && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
    e.preventDefault();
    const c = [...o.closest("td-dropzone")?.querySelectorAll("[data-td-drop-zone]") ?? []], l = o.closest("[data-td-drop-zone]"), d = c.indexOf(l);
    c[d + (e.key === "ArrowRight" ? 1 : -1)]?.querySelector(".td-dropboard__list")?.append(o), o.focus();
  }
  const r = e.target instanceof Element ? e.target.closest("[data-td-knob]") : null;
  if (r && e.target instanceof HTMLElement) {
    const i = r.closest("td-knob");
    if (i instanceof HTMLElement && i.dataset.readonly !== "true") {
      const c = Number(i.dataset.step ?? 1);
      (e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "PageUp") && (e.preventDefault(), Kt(i, Number(i.dataset.value ?? 0) + (e.key === "PageUp" ? c * 5 : c))), (e.key === "ArrowLeft" || e.key === "ArrowDown" || e.key === "PageDown") && (e.preventDefault(), Kt(i, Number(i.dataset.value ?? 0) - (e.key === "PageDown" ? c * 5 : c))), e.key === "Home" && (e.preventDefault(), Kt(i, Number(i.dataset.min ?? 0))), e.key === "End" && (e.preventDefault(), Kt(i, Number(i.dataset.max ?? 100)));
    }
  }
}
function po() {
  document.addEventListener("pointerdown", (e) => {
    const t = e.target instanceof Element ? e.target.closest("[data-td-split-handle]") : null;
    t instanceof HTMLElement && e instanceof PointerEvent && (e.preventDefault(), fo(t, e));
    const a = e.target instanceof Element ? e.target.closest("[data-td-knob]") : null;
    if (a instanceof HTMLElement && e instanceof PointerEvent) {
      const n = a.closest("td-knob");
      if (n instanceof HTMLElement && n.dataset.readonly !== "true" && !n.classList.contains("is-off")) {
        e.preventDefault();
        const s = (r) => ho(n, a, r), o = () => {
          window.removeEventListener("pointermove", s), window.removeEventListener("pointerup", o);
        };
        s(e), window.addEventListener("pointermove", s), window.addEventListener("pointerup", o);
      }
    }
  }), document.addEventListener("dragstart", (e) => {
    const t = e.target instanceof Element ? e.target.closest("[data-td-drop-card], [data-td-tile]") : null;
    t instanceof HTMLElement && (e.dataTransfer?.setData("text/plain", t.dataset.tdDropCard ?? t.dataset.tdTile ?? ""), t.classList.add("is-drag"));
  }), document.addEventListener("dragend", (e) => {
    e.target instanceof Element && e.target.closest("[data-td-drop-card], [data-td-tile]")?.classList.remove("is-drag");
  }), document.addEventListener("dragover", (e) => {
    e.target instanceof Element && e.target.closest("[data-td-drop-zone], td-tiles") && e.preventDefault();
  }), document.addEventListener("drop", (e) => {
    const t = e.target instanceof Element ? e.target.closest("[data-td-drop-zone]") : null, a = e.dataTransfer?.getData("text/plain");
    if (t && a) {
      e.preventDefault();
      const o = document.querySelector(`[data-td-drop-card="${CSS.escape(a)}"]`);
      t.querySelector(".td-dropboard__list")?.append(o ?? "");
    }
    const n = e.target instanceof Element ? e.target.closest("td-tiles") : null, s = e.target instanceof Element ? e.target.closest("[data-td-tile]") : null;
    if (n && s instanceof HTMLElement && a) {
      e.preventDefault();
      const o = n.querySelector(`[data-td-tile="${CSS.escape(a)}"]`);
      o && o !== s && s.before(o);
    }
  });
}
function mo(e) {
  const t = e.target;
  if (!(t instanceof HTMLFormElement))
    return !1;
  if (t.matches("[data-td-chat-form]")) {
    e.preventDefault();
    const a = t.querySelector("input"), n = t.closest("td-chat")?.querySelector("[data-td-chat-log]"), s = a?.value.trim() ?? "";
    return s && n && a && (n.append(Pe(s, !0)), a.value = "", window.setTimeout(() => n.append(Pe("Recibido. Un asesor te confirma el stock.", !1)), 700)), !0;
  }
  if (t.matches("[data-td-ai-form]")) {
    e.preventDefault();
    const a = t.querySelector("input"), n = t.closest("td-aichat"), s = n?.querySelector("[data-td-chat-log]"), o = a?.value.trim() ?? "";
    if (o && s && a && n) {
      s.append(Pe(o, !0)), a.value = "";
      const r = Eo(o, n.dataset.catalog ?? ""), i = Pe("", !1);
      s.append(i), wo(i.querySelector("p"), r);
    }
    return !0;
  }
  return !1;
}
function _a() {
  document.querySelectorAll("[data-td-popup-panel]").forEach((e) => {
    e.hidden = !0;
  }), document.querySelectorAll("[data-td-popup-open]").forEach((e) => e.setAttribute("aria-expanded", "false"));
}
function fo(e, t) {
  const a = e.closest("td-splitter"), n = e.previousElementSibling;
  if (!(a instanceof HTMLElement) || !(n instanceof HTMLElement))
    return;
  const s = a.dataset.orientation === "vertical", o = s ? t.clientY : t.clientX, r = s ? n.getBoundingClientRect().height : n.getBoundingClientRect().width, i = (l) => {
    const d = (s ? l.clientY : l.clientX) - o;
    n.style.flex = `0 0 ${Math.max(80, r + d)}px`;
  }, c = () => {
    window.removeEventListener("pointermove", i), window.removeEventListener("pointerup", c);
  };
  window.addEventListener("pointermove", i), window.addEventListener("pointerup", c);
}
function ho(e, t, a) {
  const n = t.getBoundingClientRect(), o = (Math.atan2(a.clientY - (n.top + n.height / 2), a.clientX - (n.left + n.width / 2)) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2), r = Number(e.dataset.min ?? 0), i = Number(e.dataset.max ?? 100);
  Kt(e, r + o / (Math.PI * 1.75) * (i - r));
}
function Kt(e, t) {
  const a = Number(e.dataset.min ?? 0), n = Number(e.dataset.max ?? 100), s = Number(e.dataset.step ?? 1) || 1, o = Math.min(n, Math.max(a, Math.round(t / s) * s));
  e.dataset.value = String(o);
  const r = e.querySelector("[data-td-knob-value]");
  r && (r.value = String(o));
  const i = e.querySelector("[data-td-knob-out]");
  i && (i.textContent = `${o.toFixed(s < 1 ? 1 : 0)} ${e.dataset.suffix ?? ""}`.trim());
  const c = e.querySelector("[data-td-knob-arc]");
  if (c) {
    const l = 2 * Math.PI * 40, d = (o - a) / (n - a || 1);
    c.style.strokeDasharray = `${l}`, c.style.strokeDashoffset = `${l * (1 - d * 0.75)}`;
  }
  e.querySelector("[data-td-knob]")?.setAttribute("aria-valuenow", String(o));
}
function go(e, t) {
  if (!e)
    return;
  const a = Math.floor(t / 1440), n = Math.floor(t % 1440 / 60), s = t % 60, o = e.querySelector('[data-td-ts="d"]'), r = e.querySelector('[data-td-ts="h"]'), i = e.querySelector('[data-td-ts="m"]');
  o && (o.value = String(a)), r && (r.value = String(n)), i && (i.value = String(s)), hs(e);
}
function hs(e) {
  if (!e)
    return;
  const t = Number(e.querySelector('[data-td-ts="d"]')?.value ?? 0), a = Number(e.querySelector('[data-td-ts="h"]')?.value ?? 0), n = Number(e.querySelector('[data-td-ts="m"]')?.value ?? 0), s = (c) => String(c).padStart(2, "0"), o = `${t}.${s(a)}:${s(n)}:00`, r = e.querySelector("[data-td-ts-iso]"), i = e.querySelector("[data-td-ts-out]");
  r && (r.value = o), i && (i.textContent = o);
}
function bo(e, t) {
  const a = e?.querySelector("[data-td-md-source]");
  if (!a)
    return;
  const n = a.selectionStart, s = a.selectionEnd, o = a.value.slice(n, s) || "texto", r = t === "# " || t === "- " ? `${t}${o}` : `${t}${o}${t}`;
  a.setRangeText(r, n, s, "end"), za(e, a.value), a.focus();
}
function za(e, t) {
  const a = e?.querySelector("[data-td-md-preview]");
  a instanceof HTMLElement && (a.innerHTML = t.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replace(/^### (.+)$/gm, "<h3>$1</h3>").replace(/^## (.+)$/gm, "<h2>$1</h2>").replace(/^# (.+)$/gm, "<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/`(.+?)`/g, "<code>$1</code>").replace(/^- (.+)$/gm, "<li>$1</li>").replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>").replace(/\n{2,}/g, "</p><p>").replace(/^(?!<h|<ul|<li|<p)(.+)$/gm, "<p>$1</p>"));
}
function $o(e) {
  const t = e.querySelector("[data-td-speech-label]"), a = e.parentElement?.querySelector("[data-td-speech-note]"), n = (l) => {
    t && (t.textContent = l);
  }, s = e.tdSpeech;
  if (s) {
    s.stop();
    return;
  }
  const o = window.webkitSpeechRecognition ?? window.SpeechRecognition;
  if (!o) {
    n("Dictar"), a && (a.hidden = !1, a.textContent = "Dictado no disponible en este navegador.");
    return;
  }
  const r = new o();
  e.tdSpeech = r, r.lang = e.dataset.lang ?? "es-CL", r.interimResults = !0, r.continuous = e.dataset.continuous === "true";
  const i = document.querySelector(`[name="${CSS.escape(e.dataset.target ?? "")}"]`);
  e.setAttribute("aria-pressed", "true"), n("Escuchando…"), r.onresult = (l) => {
    if (i) {
      const d = l.results;
      i.value = [...Array.from({ length: d.length }, (u, p) => d[p]?.[0]?.transcript ?? "")].join(" "), i.dispatchEvent(new Event("input", { bubbles: !0 }));
    }
  };
  const c = () => {
    e.setAttribute("aria-pressed", "false"), n("Dictar"), delete e.tdSpeech;
  };
  r.onend = c, r.onerror = () => {
    a && (a.hidden = !1, a.textContent = "No se pudo usar el micrófono."), c();
  };
  try {
    r.start();
  } catch {
    a && (a.hidden = !1, a.textContent = "Dictado no disponible en este navegador."), c();
  }
}
function Xe(e) {
  e.querySelectorAll(".td-navmenu__panel").forEach((t) => {
    t.hidden = !0;
  }), e.querySelectorAll("[data-td-nav-open]").forEach((t) => t.setAttribute("aria-expanded", "false"));
}
function Ye(e, t) {
  const n = e.closest(".td-navmenu__item")?.querySelector(".td-navmenu__panel");
  document.querySelectorAll(".td-navmenu__panel").forEach((s) => {
    s.hidden = !0;
  }), document.querySelectorAll("[data-td-nav-open]").forEach((s) => s.setAttribute("aria-expanded", "false")), n && (n.hidden = !t), e.setAttribute("aria-expanded", t ? "true" : "false");
}
function yo(e) {
  const t = e.closest("td-layout.td-appshell--menu");
  if (!(t instanceof HTMLElement))
    return;
  const a = [];
  let n = e;
  const s = e.closest("td-menuapp");
  for (; n; ) {
    a.unshift(n.dataset.label ?? "");
    const c = n.dataset.parent ?? "";
    n = c ? s?.querySelector(`[data-td-menu-row="${CSS.escape(c)}"]`) ?? null : null;
  }
  const o = t.querySelector("[data-td-shell-title]"), r = t.querySelector("[data-td-shell-crumb]"), i = t.querySelector("[data-td-shell-path]");
  o && (o.textContent = e.dataset.label ?? ""), r && (r.textContent = a.filter(Boolean).join(" / ")), i && (i.textContent = e.dataset.href ? `Ruta activa: ${e.dataset.href}` : "Ruta activa"), t.dataset.mode === "float" && (t.dataset.collapsed = "true", t.querySelector("[data-td-layout-toggle]")?.setAttribute("aria-expanded", "false"));
}
function Aa(e, t) {
  const a = e.closest("td-menuapp"), n = e.closest("td-layout.td-appshell--menu");
  if (n instanceof HTMLElement && n.dataset.mode !== "float" && n.dataset.collapsed === "true" && e.getAttribute("aria-expanded") !== null && (n.dataset.collapsed = "false", n.querySelector("[data-td-layout-toggle]")?.setAttribute("aria-expanded", "true")), e.getAttribute("aria-expanded") !== null) {
    const i = t ? e.getAttribute("aria-expanded") !== "true" : !1;
    if (e.setAttribute("aria-expanded", i ? "true" : "false"), ca(a), a?.dataset.remember === "true") {
      const c = [...a.querySelectorAll('[aria-expanded="true"]') ?? []].map((l) => l.dataset.tdMenuRow ?? "");
      try {
        localStorage.setItem("td-menuapp", JSON.stringify(c));
      } catch {
      }
    }
    return;
  }
  const s = e.dataset.href ?? "", o = e.closest("td-menuapp");
  o?.querySelectorAll("[data-td-menu-row]").forEach((i) => i.classList.remove("is-on")), e.classList.add("is-on");
  const r = o?.querySelector("[data-td-menuapp-path]");
  r && (r.textContent = s ? `Ruta activa: ${s}` : "Ruta activa"), yo(e), t && s && o?.dataset.stay !== "true" && (window.location.href = s);
}
function ca(e) {
  if (!e)
    return;
  const t = [...e.querySelectorAll("[data-td-menu-row]")], a = new Set(t.filter((r) => r.getAttribute("aria-expanded") === "true").map((r) => r.dataset.tdMenuRow ?? "")), n = (e.querySelector("[data-td-menuapp-q]")?.value ?? "").trim().toLocaleLowerCase(), s = /* @__PURE__ */ new Set();
  n && t.forEach((r) => {
    if ((r.dataset.label ?? "").toLocaleLowerCase().includes(n)) {
      let i = r.dataset.parent ?? "";
      for (s.add(r.dataset.tdMenuRow ?? ""); i; )
        s.add(i), a.add(i), i = t.find((c) => c.dataset.tdMenuRow === i)?.dataset.parent ?? "";
    }
  }), t.forEach((r) => {
    const i = r.dataset.parent, c = !i || a.has(i), l = !n || s.has(r.dataset.tdMenuRow ?? "");
    r.hidden = !c || !l, n && a.has(r.dataset.tdMenuRow ?? "") && r.getAttribute("aria-expanded") !== null && r.setAttribute("aria-expanded", "true");
  });
  const o = e.querySelector("[data-td-menuapp-empty]");
  o && (o.hidden = t.some((r) => !r.hidden));
}
function qa(e, t) {
  ca(e);
}
function vo(e, t) {
  if (!e)
    return;
  const a = e.querySelector("[data-td-menuapp-json-state]");
  let n;
  try {
    if (n = JSON.parse(t), !Array.isArray(n))
      throw new Error("array");
  } catch {
    a?.classList.add("td-menuapp__json-bad"), a && (a.textContent = "JSON inválido · se muestra la última versión válida");
    return;
  }
  a?.classList.remove("td-menuapp__json-bad"), a && (a.textContent = "JSON válido");
  const s = e.querySelector(".td-menuapp__tree"), o = s?.querySelector("[data-td-menuapp-empty]");
  s?.querySelectorAll("[data-td-menu-row]").forEach((i) => i.remove()), gs(n, null, 0).forEach((i, c) => {
    const l = document.createElement("div");
    l.className = "td-menuapp__row", l.role = "treeitem", l.dataset.tdMenuRow = i.id, l.dataset.parent = i.parent ?? "", l.dataset.depth = String(i.depth), l.dataset.label = i.label, l.dataset.href = i.path ?? "", l.style.setProperty("--d", String(i.depth)), l.tabIndex = c === 0 ? 0 : -1, l.setAttribute("aria-level", String(i.depth + 1)), i.parentNode ? (l.setAttribute("aria-expanded", i.depth === 0 && c === 0 ? "true" : "false"), l.innerHTML = '<svg class="td-menuapp__chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>') : l.innerHTML = '<span class="td-menuapp__dot" aria-hidden="true"></span>';
    const d = document.createElement("span");
    if (d.textContent = i.label, l.append(d), i.badge) {
      const u = document.createElement("em");
      u.textContent = i.badge, l.append(u);
    }
    o ? s?.insertBefore(l, o) : s?.append(l);
  }), ca(e);
}
function gs(e, t, a) {
  const n = [];
  return e.forEach((s, o) => {
    const r = `${t ?? "root"}-${o}`, i = s.options ?? s.children ?? [];
    n.push({
      id: r,
      parent: t,
      depth: a,
      label: s.label ?? "Opción",
      path: s.path,
      badge: s.badge,
      parentNode: i.length > 0
    }), i.length && n.push(...gs(i, r, a + 1));
  }), n;
}
function xo(e) {
  if (e.dataset.remember === "true")
    try {
      const t = JSON.parse(localStorage.getItem("td-menuapp") ?? "[]");
      t.length && e.querySelectorAll("[data-td-menu-row][aria-expanded]").forEach((a) => {
        a.setAttribute("aria-expanded", t.includes(a.dataset.tdMenuRow ?? "") ? "true" : "false");
      });
    } catch {
    }
  ca(e);
}
function Va(e) {
  const t = Number(e.getAttribute("data-page-size") ?? 8) || 8, a = (e.getAttribute("data-query") ?? e.querySelector("[data-td-ddgrid-q]")?.value ?? "").trim().toLocaleLowerCase(), n = [...e.querySelectorAll("[data-td-ddgrid-row]")], s = n.filter((p) => !a || (p.textContent ?? "").toLocaleLowerCase().includes(a)), o = Math.max(1, Math.ceil(s.length / t));
  let r = Number(e.dataset.page ?? 1);
  r = Math.min(o, Math.max(1, r)), e.dataset.page = String(r);
  const i = (r - 1) * t;
  n.forEach((p) => {
    const m = s.indexOf(p);
    p.hidden = m < 0 || m < i || m >= i + t;
  });
  const c = e.querySelector("[data-td-ddgrid-meta]");
  if (c) {
    const p = s.length === 0 ? 0 : i + 1, m = Math.min(i + t, s.length);
    c.textContent = `${p}–${m} de ${s.length} repuestos · ↑ ↓ y Enter para elegir`;
  }
  const l = e.querySelector("[data-td-ddgrid-empty]");
  l && (l.hidden = s.length > 0);
  const d = e.querySelector('[data-td-ddgrid-page="-1"]'), u = e.querySelector('[data-td-ddgrid-page="1"]');
  d && (d.disabled = r <= 1), u && (u.disabled = r >= o);
}
function So(e) {
  const t = [...e.querySelectorAll("[data-td-toc-link]")].map((o) => o.dataset.tdTocLink ?? ""), a = t.map((o) => document.getElementById(o)).filter((o) => !!o), n = e.querySelector("[data-td-toc-bar]"), s = new IntersectionObserver((o) => {
    const r = o.filter((i) => i.isIntersecting).sort((i, c) => c.intersectionRatio - i.intersectionRatio)[0];
    if (r?.target.id) {
      e.querySelectorAll("[data-td-toc-link]").forEach((c) => {
        c.classList.toggle("is-on", c.getAttribute("data-td-toc-link") === r.target.id);
      });
      const i = t.indexOf(r.target.id);
      n && t.length && (n.style.width = `${(i + 1) / t.length * 100}%`);
    }
  }, { rootMargin: "-20% 0px -60% 0px", threshold: [0.2, 0.6] });
  a.forEach((o) => s.observe(o));
}
function Pe(e, t) {
  const a = document.createElement("div");
  a.className = `td-chat__bubble ${t ? "is-out" : "is-in"}`;
  const n = document.createElement("p");
  n.textContent = e;
  const s = document.createElement("time");
  return s.textContent = (/* @__PURE__ */ new Date()).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }), a.append(n, s), a;
}
function wo(e, t) {
  if (!e)
    return;
  let a = 0;
  const n = () => {
    a += 2, e.textContent = t.slice(0, a), a < t.length && window.setTimeout(n, 18);
  };
  n();
}
function Eo(e, t) {
  const a = e.toLocaleLowerCase(), n = t.split(`
`).map((o) => o.split("|").map((r) => r.trim())).filter((o) => o.length >= 4);
  if (a.includes("agotado")) {
    const o = n.filter((r) => Number(r[4] ?? 1) <= 0).map((r) => r[1]);
    return o.length ? `Agotados ahora: ${o.join(", ")}.` : "No hay agotados en este recorte del catálogo.";
  }
  const s = n.find((o) => o.some((r) => r.toLocaleLowerCase().includes(a.replace("pastillas para ", "").replace("¿", "").replace("?", ""))));
  return s ? `${s[1]} (${s[0]}). Marca ${s[2]}. Stock ${s[4] ?? "—"} · ${s[5] ?? ""}.` : "En este recorte del catálogo está BR-4521-AD Pastilla de freno delantera, Volvo, 42 u. en Santiago.";
}
const Mo = [
  "212222",
  "222122",
  "222221",
  "121223",
  "121322",
  "131222",
  "122213",
  "122312",
  "132212",
  "221213",
  "221312",
  "231212",
  "112232",
  "122132",
  "122231",
  "113222",
  "123122",
  "123221",
  "223211",
  "221132",
  "221231",
  "213212",
  "223112",
  "312131",
  "311222",
  "321122",
  "321221",
  "312212",
  "322112",
  "322211",
  "212123",
  "212321",
  "232121",
  "111323",
  "131123",
  "131321",
  "112313",
  "132113",
  "132311",
  "211313",
  "231113",
  "231311",
  "112133",
  "112331",
  "132131",
  "113123",
  "113321",
  "133121",
  "313121",
  "211331",
  "231131",
  "213113",
  "213311",
  "213131",
  "311123",
  "311321",
  "331121",
  "312113",
  "312311",
  "332111",
  "314111",
  "221411",
  "431111",
  "111224",
  "111422",
  "121124",
  "121421",
  "141122",
  "141221",
  "112214",
  "112412",
  "122114",
  "122411",
  "142112",
  "142211",
  "241211",
  "221114",
  "413111",
  "241112",
  "134111",
  "111242",
  "121142",
  "121241",
  "114212",
  "124112",
  "124211",
  "411212",
  "421112",
  "421211",
  "212141",
  "214121",
  "412121",
  "111143",
  "111341",
  "131141",
  "114113",
  "114311",
  "411113",
  "411311",
  "113141",
  "114131",
  "311141",
  "411131",
  "211412",
  "211214",
  "211232",
  "2331112"
], bs = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"], Lo = ["0100111", "0110011", "0011011", "0100001", "0011101", "0111001", "0000101", "0010001", "0001001", "0010111"], $s = ["1110010", "1100110", "1101100", "1000010", "1011100", "1001110", "1010000", "1000100", "1001000", "1110100"], ko = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];
function Ua(e, t, a, n, s, o) {
  return e === "ean13" ? ga("EAN-13", An(t, 13), t, a, n, s, o, "12 dígitos + verificador. Se completa con ceros si falta.") : e === "ean8" ? ga("EAN-8", An(t, 8), t, a, n, s, o, "7 dígitos + verificador.") : ga("Code 128", _o(t), t, a, n, s, o, "Code 128 B. ASCII imprimible.");
}
function _o(e) {
  const t = [...e].filter((s) => s.charCodeAt(0) >= 32 && s.charCodeAt(0) <= 126);
  if (!t.length)
    return { bits: "", value: e, error: "Escribe un valor para Code 128." };
  const a = [104, ...t.map((s) => s.charCodeAt(0) - 32)], n = a.reduce((s, o, r) => s + o * (r === 0 ? 1 : r), 0) % 103;
  return a.push(n, 106), { bits: a.map((s) => To(Mo[s])).join(""), value: t.join("") };
}
function An(e, t) {
  const a = e.replace(/\D/g, "").slice(0, t);
  if (a.length < t - 1)
    return { bits: "", value: a, error: `EAN-${t} necesita ${t - 1} dígitos.` };
  const n = a.slice(0, t - 1).padStart(t - 1, "0"), s = n + Ao(n);
  return { bits: t === 13 ? qo(s) : Co(s), value: s };
}
function Ao(e) {
  const t = [...e].reduce((a, n, s) => {
    const o = Number(n), r = e.length - s;
    return a + o * (r % 2 === 0 ? 3 : 1);
  }, 0);
  return String((10 - t % 10) % 10);
}
function qo(e) {
  const t = Number(e[0]), a = ko[t];
  let n = "101";
  for (let s = 0; s < 6; s++) {
    const o = Number(e[s + 1]);
    n += a[s] === "L" ? bs[o] : Lo[o];
  }
  n += "01010";
  for (let s = 7; s < 13; s++)
    n += $s[Number(e[s])];
  return `${n}101`;
}
function Co(e) {
  let t = "101";
  for (let a = 0; a < 4; a++)
    t += bs[Number(e[a])];
  t += "01010";
  for (let a = 4; a < 8; a++)
    t += $s[Number(e[a])];
  return `${t}101`;
}
function To(e) {
  return [...e].map((t, a) => (a % 2 === 0 ? "1" : "0").repeat(Number(t))).join("");
}
function ga(e, t, a, n, s, o, r, i) {
  if (t.error || !t.bits)
    return { svg: "", format: e, modules: "—", value: a || "—", hint: i, error: t.error };
  const c = 10, l = (t.bits.length + c * 2) * n, d = r ? 18 : 0, u = [...t.bits].map((m, h) => m === "1" ? `<rect x="${(h + c) * n}" y="0" width="${n}" height="${s}" fill="${o}"/>` : "").join(""), p = r ? `<text x="${l / 2}" y="${s + 14}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="12" fill="${o}">${Ta(t.value)}</text>` : "";
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${l}" height="${s + d}" viewBox="0 0 ${l} ${s + d}" role="img" aria-label="${e} ${Ta(t.value)}">${u}${p}</svg>`,
    format: e,
    modules: String(t.bits.length),
    value: t.value,
    hint: i
  };
}
const he = [
  [19, 16, 13, 9],
  [34, 28, 22, 16],
  [55, 44, 34, 26],
  [80, 64, 48, 36]
], Ho = [
  [7, 10, 13, 17],
  [10, 16, 22, 28],
  [15, 26, 36, 44],
  [20, 36, 52, 64]
], No = { L: 0, M: 1, Q: 2, H: 3 }, Po = [1, 0, 3, 2], oe = new Uint8Array(512), Ca = new Uint8Array(256);
(() => {
  let e = 1;
  for (let t = 0; t < 255; t++)
    oe[t] = e, Ca[e] = t, e <<= 1, e & 256 && (e ^= 285);
  for (let t = 255; t < 512; t++)
    oe[t] = oe[t - 255];
})();
function ba(e, t) {
  return e && t ? oe[Ca[e] + Ca[t]] : 0;
}
function Bo(e, t) {
  const a = [1];
  for (let s = 0; s < t; s++) {
    a.push(0);
    for (let o = a.length - 1; o > 0; o--)
      a[o] = a[o - 1] ^ ba(a[o], oe[s]);
    a[0] = ba(a[0], oe[s]);
  }
  const n = new Array(t).fill(0);
  for (const s of e) {
    const o = s ^ n[0];
    if (n.shift(), n.push(0), !!o)
      for (let r = 0; r < t; r++)
        n[r] ^= ba(a[t - r], o);
  }
  return n;
}
function Wa(e, t, a, n = "#0A0B0C", s = 4) {
  const o = /^#[0-9a-fA-F]{6}$/.test(n) ? n : "#0A0B0C", r = Math.max(0, s);
  if (!e.trim())
    return { svg: "", version: "—", modules: "—", bytes: "0", error: "Escribe un texto para generar el código QR." };
  const i = [...new TextEncoder().encode(e)], c = No[t] ?? 1;
  let l = 0;
  for (; l < he.length && i.length + 2 > he[l][c] - 2; )
    l += 1;
  l >= he.length && (l = he.length - 1);
  const d = he[l][c], u = i.slice(0, Math.max(0, d - 2)), p = [];
  for (be(p, 4, 4), be(p, u.length, 8), u.forEach((w) => be(p, w, 8)), be(p, 0, Math.min(4, d * 8 - p.length)); p.length % 8; )
    p.push(0);
  const m = [];
  for (let w = 0; w < p.length; w += 8)
    m.push(p.slice(w, w + 8).reduce((y, L) => y << 1 | L, 0));
  const h = [236, 17];
  for (; m.length < d; )
    m.push(h[m.length - u.length & 1]);
  const g = Bo(m, Ho[l][c]), f = [...m, ...g], b = 21 + l * 4, v = jo(b, l), x = Ro(b, l, v, f, c), M = (b + r * 2) * a;
  let S = "";
  for (let w = 0; w < b; w++)
    for (let y = 0; y < b; y++)
      x[w][y] && (S += `<rect x="${(y + r) * a}" y="${(w + r) * a}" width="${a}" height="${a}"/>`);
  const $ = i.length > u.length;
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${M}" height="${M}" viewBox="0 0 ${M} ${M}" role="img" aria-label="QR ${Ta(e)}"><rect width="${M}" height="${M}" fill="#fff"/><g fill="${o}">${S}</g></svg>`,
    version: String(l + 1),
    modules: `${b}×${b}`,
    bytes: String(u.length),
    error: $ ? `El texto supera la versión ${l + 1}. Se codificaron ${u.length} de ${i.length} bytes.` : void 0
  };
}
function be(e, t, a) {
  for (let n = a - 1; n >= 0; n--)
    e.push(t >> n & 1);
}
function jo(e, t) {
  const a = Array.from({ length: e }, () => Array(e).fill(!1)), n = (s, o) => {
    for (let r = -1; r <= 7; r++)
      for (let i = -1; i <= 7; i++) {
        const c = s + i, l = o + r;
        c >= 0 && l >= 0 && c < e && l < e && (a[l][c] = !0);
      }
  };
  n(0, 0), n(e - 7, 0), n(0, e - 7);
  for (let s = 0; s < e; s++)
    a[6][s] = !0, a[s][6] = !0;
  if (t > 0) {
    const s = 12 + t * 4;
    for (let o = 0; o < 5; o++)
      for (let r = 0; r < 5; r++)
        a[s - 2 + o][s - 2 + r] = !0;
  }
  for (let s = 0; s < 9; s++)
    a[8][s] = !0, a[s][8] = !0, e - 1 - s >= 0 && (a[8][e - 1 - s] = !0, a[e - 1 - s][8] = !0);
  return a[e - 8][8] = !0, a;
}
function Ro(e, t, a, n, s) {
  let o = [], r = 1 / 0;
  for (let i = 0; i < 8; i++) {
    const c = Do(e, t, a, n, s, i), l = zo(c);
    l < r && (r = l, o = c);
  }
  return o;
}
function Do(e, t, a, n, s, o) {
  const r = Array.from({ length: e }, () => Array(e).fill(!1));
  $a(r, 0, 0), $a(r, e - 7, 0), $a(r, 0, e - 7);
  for (let d = 8; d < e - 8; d++)
    r[6][d] = d % 2 === 0, r[d][6] = d % 2 === 0;
  if (t > 0) {
    const d = 12 + t * 4;
    Io(r, d, d);
  }
  const i = [];
  n.forEach((d) => be(i, d, 8));
  let c = 0, l = !0;
  for (let d = e - 1; d > 0; d -= 2) {
    d === 6 && (d -= 1);
    for (let u = 0; u < e; u++) {
      const p = l ? e - 1 - u : u;
      for (const m of [d, d - 1]) {
        if (a[p][m])
          continue;
        const h = c < i.length ? i[c] === 1 : !1;
        r[p][m] = Fo(p, m, o) ? !h : h, c += 1;
      }
    }
    l = !l;
  }
  return Oo(r, e, Po[s], o), r;
}
function $a(e, t, a) {
  for (let n = 0; n < 7; n++)
    for (let s = 0; s < 7; s++) {
      const o = n === 0 || n === 6 || s === 0 || s === 6, r = n >= 2 && n <= 4 && s >= 2 && s <= 4;
      e[a + n][t + s] = o || r;
    }
}
function Io(e, t, a) {
  for (let n = -2; n <= 2; n++)
    for (let s = -2; s <= 2; s++)
      e[a + n][t + s] = Math.max(Math.abs(n), Math.abs(s)) !== 1;
}
function Fo(e, t, a) {
  switch (a) {
    case 0:
      return (e + t) % 2 === 0;
    case 1:
      return e % 2 === 0;
    case 2:
      return t % 3 === 0;
    case 3:
      return (e + t) % 3 === 0;
    case 4:
      return (Math.floor(e / 2) + Math.floor(t / 3)) % 2 === 0;
    case 5:
      return e * t % 2 + e * t % 3 === 0;
    case 6:
      return (e * t % 2 + e * t % 3) % 2 === 0;
    default:
      return ((e + t) % 2 + e * t % 3) % 2 === 0;
  }
}
function Oo(e, t, a, n) {
  let s = a << 3 | n, o = s << 10;
  const r = 1335;
  for (let l = 14; l >= 10; l--)
    o >> l & 1 && (o ^= r << l - 10);
  o = (s << 10 | o) ^ 21522;
  const i = [
    [8, 0],
    [8, 1],
    [8, 2],
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 7],
    [8, 8],
    [7, 8],
    [5, 8],
    [4, 8],
    [3, 8],
    [2, 8],
    [1, 8],
    [0, 8]
  ], c = [
    [t - 1, 8],
    [t - 2, 8],
    [t - 3, 8],
    [t - 4, 8],
    [t - 5, 8],
    [t - 6, 8],
    [t - 7, 8],
    [8, t - 8],
    [8, t - 7],
    [8, t - 6],
    [8, t - 5],
    [8, t - 4],
    [8, t - 3],
    [8, t - 2],
    [8, t - 1]
  ];
  for (let l = 0; l < 15; l++) {
    const d = (o >> 14 - l & 1) === 1;
    e[i[l][0]][i[l][1]] = d, e[c[l][0]][c[l][1]] = d;
  }
  e[t - 8][8] = !0;
}
function zo(e) {
  const t = e.length;
  let a = 0;
  for (let s = 0; s < t; s++)
    a += qn(e[s]) + qn(e.map((o) => o[s]));
  for (let s = 0; s < t - 1; s++)
    for (let o = 0; o < t - 1; o++)
      e[s][o] === e[s][o + 1] && e[s][o] === e[s + 1][o] && e[s][o] === e[s + 1][o + 1] && (a += 3);
  let n = 0;
  return e.forEach((s) => s.forEach((o) => {
    o && (n += 1);
  })), a += Math.abs(Math.floor(n * 100 / (t * t) / 5) * 10 - 50), a;
}
function qn(e) {
  let t = 0, a = 1;
  for (let n = 1; n <= e.length; n++) {
    if (n < e.length && e[n] === e[n - 1]) {
      a += 1;
      continue;
    }
    a >= 5 && (t += 3 + (a - 5)), a = 1;
  }
  return t;
}
function Ta(e) {
  return e.replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t] ?? t);
}
function Vo(e = document) {
  e.querySelectorAll("[data-td-barcode]").forEach(ve), e.querySelectorAll("[data-td-qr]").forEach(se), e.querySelectorAll("[data-td-rte]").forEach(Rt);
}
function Uo(e) {
  const t = e.closest("[data-td-rte-cmd]");
  if (t instanceof HTMLButtonElement) {
    const k = t.closest("[data-td-rte]");
    return k?.querySelector("[data-td-rte-edit]")?.focus(), document.execCommand(t.dataset.tdRteCmd ?? "bold"), Rt(k), !0;
  }
  const a = e.closest("[data-td-rte-color]");
  if (a instanceof HTMLButtonElement)
    return document.execCommand("foreColor", !1, a.dataset.tdRteColor), Rt(a.closest("[data-td-rte]")), !0;
  const n = e.closest("[data-td-rte-source]");
  if (n instanceof HTMLButtonElement)
    return Jo(n.closest("[data-td-rte]")), !0;
  const s = e.closest("[data-td-rte-link]");
  if (s instanceof HTMLElement) {
    const k = s.closest("[data-td-rte]")?.querySelector("[data-td-rte-linkbar]");
    return k && (k.hidden = !k.hidden, k.querySelector("input")?.focus()), !0;
  }
  const o = e.closest("[data-td-rte-link-apply]");
  if (o instanceof HTMLElement) {
    const k = o.closest("[data-td-rte]"), H = k?.querySelector("[data-td-rte-url]")?.value ?? "";
    H && document.execCommand("createLink", !1, H);
    const R = k?.querySelector("[data-td-rte-linkbar]");
    return R && (R.hidden = !0), Rt(k), !0;
  }
  const r = e.closest("[data-td-rte-link-remove]");
  if (r instanceof HTMLElement) {
    document.execCommand("unlink");
    const k = r.closest("[data-td-rte]")?.querySelector("[data-td-rte-linkbar]");
    return k && (k.hidden = !0), Rt(r.closest("[data-td-rte]")), !0;
  }
  const i = e.closest("[data-td-rte-link-cancel]");
  if (i instanceof HTMLElement) {
    const k = i.closest("[data-td-rte]")?.querySelector("[data-td-rte-linkbar]");
    return k && (k.hidden = !0), !0;
  }
  const c = e.closest("[data-td-sign-clear]");
  if (c instanceof HTMLElement) {
    const k = c.closest("[data-td-sign]"), H = k?.querySelector("canvas"), R = H?.getContext("2d");
    H && R && R.clearRect(0, 0, H.width, H.height);
    const it = k?.querySelector("[data-td-sign-value]");
    return it && (it.value = ""), !0;
  }
  const l = e.closest("[data-td-gallery-prev]");
  if (l instanceof HTMLElement)
    return Tn(l.closest("[data-td-gallery]"), -1), !0;
  const d = e.closest("[data-td-gallery-next]");
  if (d instanceof HTMLElement)
    return Tn(d.closest("[data-td-gallery]"), 1), !0;
  const u = e.closest("[data-td-gallery-thumb]");
  if (u instanceof HTMLElement)
    return vs(u.closest("[data-td-gallery]"), Number(u.getAttribute("data-td-gallery-thumb") ?? 0)), !0;
  const p = e.closest("[data-td-menu-open]");
  if (p instanceof HTMLButtonElement) {
    const k = p.parentElement?.querySelector(".td-menu__drop"), H = !!k?.hidden;
    return ne(), k && (k.hidden = !H, p.setAttribute("aria-expanded", String(H))), !0;
  }
  const m = e.closest("[data-td-profile-open]");
  if (m instanceof HTMLButtonElement) {
    const k = m.parentElement?.querySelector("[data-td-profile-menu]"), H = !!k?.hidden;
    return ne(), k && (k.hidden = !H, m.setAttribute("aria-expanded", String(H))), !0;
  }
  const h = e.closest("[data-td-pmenu-collapse]");
  if (h instanceof HTMLElement)
    return h.closest("[data-td-pmenu]")?.classList.toggle("is-collapsed"), !0;
  const g = e.closest("[data-td-ddtree-open]");
  if (g instanceof HTMLButtonElement) {
    const H = g.closest("[data-td-ddtree]")?.querySelector("[data-td-ddtree-panel]");
    if (H) {
      const R = H.hidden;
      ne(), H.hidden = !R, g.setAttribute("aria-expanded", String(R));
    }
    return !0;
  }
  const f = e.closest("[data-td-ddtree-twist]");
  if (f instanceof HTMLButtonElement) {
    const k = f.closest("[data-td-ddtree-node]")?.querySelector("[data-td-ddtree-kids]"), H = f.getAttribute("aria-expanded") !== "true";
    return f.setAttribute("aria-expanded", String(H)), f.textContent = H ? "▾" : "▸", k && (k.hidden = !H), !0;
  }
  const b = e.closest("[data-td-ddtree-pick]");
  if (b instanceof HTMLButtonElement)
    return Qo(b), !0;
  const v = e.closest("[data-td-barcode-fmt]");
  if (v instanceof HTMLButtonElement) {
    const k = v.closest("[data-td-barcode]");
    return k && (k.dataset.format = v.dataset.tdBarcodeFmt ?? "code128", k.querySelectorAll("[data-td-barcode-fmt]").forEach((H) => {
      H.classList.toggle("is-on", H === v), H.setAttribute("aria-pressed", String(H === v));
    }), ve(k)), !0;
  }
  const x = e.closest("[data-td-barcode-preset]");
  if (x instanceof HTMLButtonElement) {
    const k = x.closest("[data-td-barcode]"), H = k?.querySelector("[data-td-barcode-text]");
    return k && H && (H.value = x.dataset.tdBarcodePreset ?? "", ve(k)), !0;
  }
  const M = e.closest("[data-td-barcode-color]");
  if (M instanceof HTMLButtonElement) {
    const k = M.closest("[data-td-barcode]");
    return k && (k.dataset.color = M.dataset.tdBarcodeColor ?? "#0A0B0C", k.querySelectorAll("[data-td-barcode-color]").forEach((H) => H.classList.toggle("is-on", H === M)), ve(k)), !0;
  }
  const S = e.closest("[data-td-qr-ecc]");
  if (S instanceof HTMLButtonElement) {
    const k = S.closest("[data-td-qr]");
    return k && (k.dataset.ecc = S.dataset.tdQrEcc ?? "M", k.querySelectorAll("[data-td-qr-ecc]").forEach((H) => H.classList.toggle("is-on", H === S)), se(k)), !0;
  }
  const $ = e.closest("[data-td-qr-preset]");
  if ($ instanceof HTMLButtonElement) {
    const k = $.closest("[data-td-qr]"), H = k?.querySelector("[data-td-qr-text]");
    return k && H && (H.value = $.dataset.tdQrPreset ?? "", se(k)), !0;
  }
  const w = e.closest("[data-td-qr-color]");
  if (w instanceof HTMLButtonElement) {
    const k = w.closest("[data-td-qr]");
    return k && (k.dataset.color = w.dataset.tdQrColor ?? "#0A0B0C", k.querySelectorAll("[data-td-qr-color]").forEach((H) => H.classList.toggle("is-on", H === w)), se(k)), !0;
  }
  const y = e.closest("[data-td-qr-quiet]");
  if (y instanceof HTMLButtonElement) {
    const k = y.closest("[data-td-qr]");
    if (k) {
      const H = y.getAttribute("aria-checked") !== "true";
      y.setAttribute("aria-checked", String(H)), se(k);
    }
    return !0;
  }
  const L = e.closest("[data-td-qr-copy],[data-td-qr-png],[data-td-qr-svg],[data-td-barcode-copy],[data-td-barcode-png],[data-td-barcode-svg]");
  if (L instanceof HTMLButtonElement) {
    const k = L.closest("[data-td-qr],[data-td-barcode]");
    return k && Yo(k, L), !0;
  }
  const q = e.closest("[data-td-image-open]");
  if (q instanceof HTMLElement)
    return q.closest("[data-td-image]")?.querySelector("[data-td-image-dlg]")?.showModal(), !0;
  const O = e.closest("[data-td-image-zoom]");
  if (O instanceof HTMLButtonElement) {
    const k = O.closest("[data-td-image]")?.querySelector("[data-td-image-canvas]");
    if (k) {
      const H = Math.min(4, Math.max(0.6, Number(k.style.getPropertyValue("--z") || 1) + Number(O.dataset.tdImageZoom)));
      k.style.setProperty("--z", String(H));
    }
    return !0;
  }
  const W = e.closest("[data-td-image-rot]");
  if (W instanceof HTMLElement) {
    const k = W.closest("[data-td-image]")?.querySelector("[data-td-image-canvas]");
    if (k) {
      const H = Number((k.style.getPropertyValue("--r") || "0deg").replace("deg", "")) || 0;
      k.style.setProperty("--r", `${(H + 90) % 360}deg`);
    }
    return !0;
  }
  const Y = e.closest("[data-td-image-dl]");
  if (Y instanceof HTMLElement) {
    const k = Y.closest("[data-td-image]"), H = k?.querySelector("img");
    if (H?.src) {
      const ft = document.createElement("a");
      return ft.href = H.src, ft.download = H.alt || "imagen", ft.click(), !0;
    }
    const R = k?.querySelector(".td-image__frame"), it = document.createElement("canvas");
    it.width = 640, it.height = 400;
    const Pt = it.getContext("2d");
    if (Pt && R) {
      Pt.fillStyle = R.style.background || "#1F2327", Pt.fillRect(0, 0, 640, 400);
      const ft = document.createElement("a");
      ft.href = it.toDataURL("image/png"), ft.download = "imagen.png", ft.click();
    }
    return !0;
  }
  return !e.closest("[data-td-menu]") && !e.closest("[data-td-profile]") && !e.closest("[data-td-ddtree]") && !e.closest("[data-td-ctx-menu]") && ne(), !1;
}
function Wo(e) {
  if (e instanceof HTMLElement) {
    if (e.matches("[data-td-rte-edit],[data-td-rte-src]")) {
      Rt(e.closest("[data-td-rte]"));
      return;
    }
    if (e.matches("[data-td-rte-block]") && e instanceof HTMLSelectElement) {
      document.execCommand("formatBlock", !1, e.value), Rt(e.closest("[data-td-rte]"));
      return;
    }
    if (e.matches("[data-td-barcode-text],[data-td-barcode-w],[data-td-barcode-h],[data-td-barcode-label]")) {
      const t = e.closest("[data-td-barcode]");
      t && ve(t);
      return;
    }
    if (e.matches("[data-td-qr-text],[data-td-qr-size]")) {
      const t = e.closest("[data-td-qr]");
      t && se(t);
      return;
    }
    e.matches("[data-td-ddtree-query]") && e instanceof HTMLInputElement && Zo(e.closest("[data-td-ddtree]"), e.value);
  }
}
function Go(e) {
  const t = e.target;
  if (!(t instanceof Element))
    return;
  const a = t.closest("[data-td-compare-knob]");
  if (a instanceof HTMLElement) {
    const n = a.closest("[data-td-compare]"), s = n?.dataset.vertical === "true", o = e.key === "ArrowRight" || e.key === "ArrowDown" ? 2 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -2 : e.key === "Home" ? -100 : e.key === "End" ? 100 : 0;
    if (o && n) {
      if (s && (e.key === "ArrowLeft" || e.key === "ArrowRight") || !s && (e.key === "ArrowUp" || e.key === "ArrowDown"))
        return;
      e.preventDefault(), ys(n, Number.parseFloat(n.style.getPropertyValue("--pos") || "50") + o);
    }
  }
}
function Ga(e) {
  const t = e.target;
  if (!(t instanceof Element))
    return;
  const a = t.closest("[data-td-compare-stage]");
  if (a instanceof HTMLElement && e.type === "pointerdown") {
    const r = a.closest("[data-td-compare]");
    r && (r.dataset.drag = "true", a.setPointerCapture(e.pointerId), ya(r, e));
    return;
  }
  const n = document.querySelector('[data-td-compare][data-drag="true"]');
  if (n && (e.type === "pointermove" || e.type === "pointerup")) {
    ya(n, e), e.type === "pointerup" && delete n.dataset.drag;
    return;
  }
  const s = t.closest('[data-td-compare][data-follow="true"]');
  if (s && e.type === "pointermove") {
    ya(s, e);
    return;
  }
  const o = t.closest("[data-td-sign-canvas]");
  if (o instanceof HTMLCanvasElement) {
    const r = o.closest("[data-td-sign]");
    if (!r)
      return;
    if (e.type === "pointerdown")
      r.dataset.draw = "true", o.setPointerCapture(e.pointerId), Cn(o, e, !0);
    else if (r.dataset.draw === "true" && e.type === "pointermove")
      Cn(o, e, !1);
    else if (e.type === "pointerup") {
      delete r.dataset.draw;
      const i = r.querySelector("[data-td-sign-value]");
      i && (i.value = o.toDataURL("image/png"));
    }
  }
}
function Ko(e) {
  const t = e.target;
  if (!(t instanceof Element))
    return;
  const a = t.closest("[data-td-ctx-target]");
  if (!(a instanceof HTMLElement))
    return;
  e.preventDefault();
  const s = a.closest("[data-td-ctx]")?.querySelector("[data-td-ctx-menu]");
  if (!s)
    return;
  ne(), s.hidden = !1;
  const o = a.getBoundingClientRect();
  s.style.left = `${e.clientX - o.left}px`, s.style.top = `${e.clientY - o.top}px`;
}
function ne() {
  document.querySelectorAll(".td-menu__drop, [data-td-profile-menu], [data-td-ddtree-panel], [data-td-ctx-menu]").forEach((e) => {
    e.hidden = !0;
  }), document.querySelectorAll("[data-td-menu-open], [data-td-profile-open], [data-td-ddtree-open]").forEach((e) => {
    e.setAttribute("aria-expanded", "false");
  });
}
function Rt(e) {
  if (!(e instanceof HTMLElement))
    return;
  const t = e.querySelector("[data-td-rte-edit]"), a = e.querySelector("[data-td-rte-src]"), n = e.querySelector("[data-td-rte-value]"), s = e.querySelector("[data-td-rte-limit]");
  if (!(!t || !a || !n) && (a.hidden ? a.value = t.innerHTML : t.innerHTML = a.value, n.value = t.innerHTML, s)) {
    const o = Number(s.dataset.max ?? 0), r = t.innerText.trim().length;
    s.textContent = `${r} / ${o}`, s.classList.toggle("is-over", o > 0 && r > o);
  }
}
function Jo(e) {
  if (!(e instanceof HTMLElement))
    return;
  const t = e.querySelector("[data-td-rte-edit]"), a = e.querySelector("[data-td-rte-src]");
  !t || !a || (a.hidden ? (a.value = t.innerHTML, a.hidden = !1, t.hidden = !0) : (t.innerHTML = a.value, a.hidden = !0, t.hidden = !1), Rt(e));
}
function ys(e, t) {
  const a = Math.min(100, Math.max(0, t));
  e.style.setProperty("--pos", `${a}%`), e.querySelector("[data-td-compare-knob]")?.setAttribute("aria-valuenow", String(Math.round(a)));
  const s = e.querySelector("[data-td-compare-pos]");
  s && (s.textContent = `${Math.round(a)}%`);
}
function ya(e, t) {
  const a = e.querySelector("[data-td-compare-stage]");
  if (!(a instanceof HTMLElement))
    return;
  const n = a.getBoundingClientRect(), o = e.dataset.vertical === "true" ? (t.clientY - n.top) / n.height : (t.clientX - n.left) / n.width;
  ys(e, o * 100);
}
function Cn(e, t, a) {
  const n = e.getContext("2d");
  if (!n)
    return;
  const s = e.getBoundingClientRect(), o = (t.clientX - s.left) * (e.width / s.width), r = (t.clientY - s.top) * (e.height / s.height);
  n.strokeStyle = "#0A0B0C", n.lineWidth = 2.4, n.lineCap = "round", n.lineJoin = "round", a ? (n.beginPath(), n.moveTo(o, r)) : (n.lineTo(o, r), n.stroke(), n.beginPath(), n.moveTo(o, r));
}
function Tn(e, t) {
  if (!(e instanceof HTMLElement))
    return;
  e.querySelectorAll(".td-gallery__slide");
  const a = Number(e.dataset.index ?? 0);
  vs(e, a + t);
}
function vs(e, t) {
  if (!(e instanceof HTMLElement))
    return;
  const a = [...e.querySelectorAll(".td-gallery__slide")];
  if (!a.length)
    return;
  const n = (t % a.length + a.length) % a.length;
  e.dataset.index = String(n), a.forEach((o, r) => {
    o.hidden = r !== n, o.classList.toggle("is-current", r === n);
  }), e.querySelectorAll("[data-td-gallery-thumb]").forEach((o, r) => {
    o.classList.toggle("is-current", r === n);
  });
  const s = e.querySelector("[data-td-gallery-count]");
  s && (s.textContent = `${n + 1} / ${a.length}`);
}
function Qo(e) {
  const t = e.closest("[data-td-ddtree]");
  if (!t)
    return;
  const a = t.getAttribute("data-multiple") === "true", n = e.dataset.tdDdtreePick ?? "";
  if (a) {
    const o = [...t.querySelectorAll("[data-td-ddtree-value]")].find((c) => c.value === n);
    o ? o.remove() : Hn(t, n);
    const r = t.querySelectorAll("[data-td-ddtree-value]").length, i = t.querySelector(".td-select__text");
    i && (i.textContent = r ? `${r} seleccionadas` : "Elegir categoría", i.classList.toggle("is-placeholder", r === 0));
  } else {
    t.querySelectorAll("[data-td-ddtree-value]").forEach((r) => r.remove()), Hn(t, n);
    const o = t.querySelector(".td-select__text");
    o && (o.textContent = e.dataset.label ?? n, o.classList.remove("is-placeholder")), ne();
  }
  const s = new Set([...t.querySelectorAll("[data-td-ddtree-value]")].map((o) => o.value));
  t.querySelectorAll("[data-td-ddtree-pick]").forEach((o) => {
    o.classList.toggle("is-on", s.has(o.dataset.tdDdtreePick ?? ""));
  });
}
function Hn(e, t) {
  const a = e.querySelector("[data-td-ddtree-value]")?.name ?? "nodo", n = document.createElement("input");
  n.type = "hidden", n.name = a, n.value = t, n.dataset.tdDdtreeValue = "", e.insertBefore(n, e.querySelector("[data-td-ddtree-open]"));
}
function Zo(e, t) {
  if (!e)
    return;
  const a = t.trim().toLowerCase();
  e.querySelectorAll("[data-td-ddtree-node]").forEach((n) => {
    const s = (n.dataset.label ?? "").toLowerCase(), o = !a || s.includes(a) || [...n.querySelectorAll("[data-td-ddtree-node]")].some((r) => (r.getAttribute("data-label") ?? "").toLowerCase().includes(a));
    if (n.hidden = !o, o && a) {
      const r = n.querySelector(":scope > [data-td-ddtree-kids]"), i = n.querySelector(":scope > .td-ddtree__row [data-td-ddtree-twist]");
      r && (r.hidden = !1), i?.setAttribute("aria-expanded", "true");
    }
  });
}
const Ha = /* @__PURE__ */ new WeakMap();
function ve(e) {
  const t = e.querySelector("[data-td-barcode-text]")?.value ?? e.dataset.value ?? "", a = e.dataset.format ?? "code128", n = Number(e.querySelector("[data-td-barcode-w]")?.value ?? 2), s = Number(e.querySelector("[data-td-barcode-h]")?.value ?? 80), o = e.dataset.color ?? "#0A0B0C", r = e.querySelector("[data-td-barcode-label]")?.checked ?? !0, i = Ua(a, t, n, s, o, r), c = e.querySelector("[data-td-barcode-svg]"), l = e.querySelector("[data-td-barcode-err]");
  c && (c.innerHTML = i.svg), l && (l.hidden = !i.error, l.textContent = i.error ?? ""), X(e, "[data-td-barcode-meta-fmt]", i.format), X(e, "[data-td-barcode-meta-mod]", i.modules), X(e, "[data-td-barcode-meta-val]", i.value), X(e, "[data-td-barcode-wlabel]", `${n} px`), X(e, "[data-td-barcode-hlabel]", `${s} px`);
  const d = e.querySelector("[data-td-barcode-hint]");
  d && (d.textContent = i.hint), xs(e, "barcode", i.error ? "" : i.svg, "barcode.png");
}
function se(e) {
  const t = e.querySelector("[data-td-qr-text]")?.value ?? e.dataset.value ?? "", a = e.dataset.ecc ?? "M", n = Number(e.querySelector("[data-td-qr-size]")?.value ?? 6), s = e.dataset.color ?? "#0A0B0C", o = e.querySelector("[data-td-qr-quiet]")?.getAttribute("aria-checked") !== "false" ? 4 : 0, r = Wa(t, a, n, s, o), i = e.querySelector("[data-td-qr-svg]"), c = e.querySelector("[data-td-qr-err]");
  i && (i.innerHTML = r.svg), c && (c.hidden = !r.error, c.textContent = r.error ?? ""), X(e, "[data-td-qr-ver]", r.version), X(e, "[data-td-qr-mod]", r.modules), X(e, "[data-td-qr-bytes]", r.bytes), X(e, "[data-td-qr-slabel]", `${n} px`), X(e, "[data-td-qr-count]", `${[...t].length} caracteres`), xs(e, "qr", r.error && !r.svg ? "" : r.svg, "qr.png");
}
function xs(e, t, a, n) {
  if (!a) {
    Ha.delete(e), X(e, `[data-td-${t}-url]`, "Sin imagen"), X(e, `[data-td-${t}-urlmeta]`, "Corrige el valor para generar el archivo.");
    const s = e.querySelector(`[data-td-${t}-uses]`);
    s && (s.innerHTML = "");
    return;
  }
  Xo(a).then((s) => {
    if (!e.isConnected)
      return;
    Ha.set(e, { svg: a, png: s });
    const o = e.querySelector(`[data-td-${t}-hidden]`);
    o && (o.value = s), X(e, `[data-td-${t}-url]`, s.length > 72 ? `${s.slice(0, 48)}…${s.slice(-16)}` : s), X(e, `[data-td-${t}-urlmeta]`, `${Math.max(1, Math.round(s.length * 3 / 4 / 1024))} KB · ${n}`);
    const r = e.querySelector(`[data-td-${t}-uses]`);
    if (r) {
      const i = t === "qr" ? [96, 160, 240] : [72, 96, 128];
      r.innerHTML = i.map((c) => `<img src="${s}" alt="" height="${c}">`).join("");
    }
  }).catch(() => X(e, `[data-td-${t}-msg]`, "No se pudo preparar el PNG. El SVG sigue disponible."));
}
function Xo(e) {
  return new Promise((t, a) => {
    const n = new Blob([e], { type: "image/svg+xml;charset=utf-8" }), s = URL.createObjectURL(n), o = new Image();
    o.onload = () => {
      const r = document.createElement("canvas");
      r.width = o.naturalWidth || 1, r.height = o.naturalHeight || 1;
      const i = r.getContext("2d");
      if (!i) {
        URL.revokeObjectURL(s), a(new Error("canvas"));
        return;
      }
      i.fillStyle = "#fff", i.fillRect(0, 0, r.width, r.height), i.drawImage(o, 0, 0), URL.revokeObjectURL(s), t(r.toDataURL("image/png"));
    }, o.onerror = () => {
      URL.revokeObjectURL(s), a(new Error("svg"));
    }, o.src = s;
  });
}
function Yo(e, t) {
  const a = Ha.get(e), n = e.hasAttribute("data-td-qr") ? "qr" : "barcode";
  if (!a) {
    X(e, `[data-td-${n}-msg]`, "Todavía no hay una imagen para entregar.");
    return;
  }
  const s = t.dataset.tdQrCopy != null || t.hasAttribute("data-td-qr-copy") ? "copy" : t.hasAttribute("data-td-qr-png") || t.hasAttribute("data-td-barcode-png") ? "png" : t.hasAttribute("data-td-qr-svg") || t.hasAttribute("data-td-barcode-svg") ? "svg" : t.hasAttribute("data-td-barcode-copy") ? "copy" : "", o = n === "qr" ? "qr" : "barcode";
  if (s === "png") {
    Nn(a.png, `${o}.png`), X(e, `[data-td-${n}-msg]`, "PNG descargado.");
    return;
  }
  if (s === "svg") {
    Nn(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(a.svg)}`, `${o}.svg`), X(e, `[data-td-${n}-msg]`, "SVG descargado.");
    return;
  }
  navigator.clipboard?.writeText(a.png).then(
    () => X(e, `[data-td-${n}-msg]`, "Data URL copiada. Puedes pegarla en un src de imagen."),
    () => X(e, `[data-td-${n}-msg]`, "No se pudo copiar. Descarga el PNG.")
  );
}
function Nn(e, t) {
  const a = document.createElement("a");
  a.href = e, a.download = t, a.click();
}
function X(e, t, a) {
  const n = e.querySelector(t);
  n && (n.textContent = a);
}
const zt = ["var(--td-color-primary)", "var(--td-color-text)", "var(--td-color-info)", "var(--td-color-success)", "var(--td-color-warning)", "#9CA3AB"], Ka = "var(--td-color-text-muted)", j = "var(--td-color-text)", St = "var(--td-color-border)", Ct = "var(--td-color-success)", kt = "var(--td-color-danger)", tr = /* @__PURE__ */ new Set(["chwf", "chfunnel", "chpareto", "chtree", "chradar", "chsankey", "chbullet", "chgantt", "chforecast", "chvariance", "chquadrant", "chcohort", "chmekko", "chslope", "chdumbbell", "chcontrol"]);
function U(e) {
  return `$ ${(Math.round(e * 10) / 10).toLocaleString("es-CL")} M`;
}
function A(e, t, a, n = {}) {
  return `<text x="${e.toFixed(1)}" y="${t.toFixed(1)}" font-size="${n.fs ?? 11.5}" fill="${n.fill ?? Ka}" font-family="${n.ff ?? "var(--td-font-family)"}" text-anchor="${n.a ?? "middle"}" font-weight="${n.fw ?? 400}" pointer-events="none">${a}</text>`;
}
function Nt(e, t) {
  return e == null || e === t ? 1 : 0.4;
}
function ct(e, t, a, n, s, o, r, i) {
  return `<div class="td-chart__head"><strong>${e}</strong><em>${t}</em></div>
        <svg viewBox="0 0 ${n} ${s}" width="100%" role="img" aria-label="${o}" data-ch-plot>${a}</svg>
        <p class="td-chart__read" role="status">${r}</p>
        <ul class="td-chart__ins">${i.map((c) => `<li>${c}</li>`).join("")}</ul>`;
}
function er() {
  let e = 11;
  const t = () => (e = (e * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 30 }, (a, n) => Math.round((22 + (t() - 0.5) * 7 + (n === 17 ? 11 : 0) + (n > 23 ? 2.2 : 0)) * 10) / 10);
}
function ar(e) {
  const t = [["Ventas", 84, "t"], ["Costo repuestos", -46.2], ["Flete", -6.2], ["Descuentos", -3.4], ["Devoluciones", -1.5], ["Otros ingresos", 1.3], ["Margen bruto", 0, "t"]];
  let a = 0;
  const n = t.map(([f, b, v]) => {
    if (v) {
      const M = f === "Ventas" ? b : a;
      return a = M, { name: f, a: 0, b: M, value: M, total: !0 };
    }
    const x = a;
    return a += b, { name: f, a: x, b: a, value: b, total: !1 };
  }), s = 760, o = 340, r = 50, i = 14, c = 46, l = o - i - c, d = 90, u = (s - r - 10) / n.length, p = (f) => i + l - f / d * l;
  let m = "";
  for (let f = 0; f <= d; f += 15)
    m += `<line x1="${r}" x2="${s - 10}" y1="${p(f)}" y2="${p(f)}" stroke="${St}" stroke-dasharray="${f ? "3 4" : ""}"></line>${A(r - 8, p(f) + 4, String(f), { a: "end", ff: "var(--td-font-mono)", fs: 11 })}`;
  n.forEach((f, b) => {
    const v = r + b * u + u * 0.15, x = u * 0.7, M = p(Math.max(f.a, f.b)), S = Math.abs(p(f.a) - p(f.b)), $ = f.total ? j : f.value < 0 ? kt : Ct, w = String(b);
    m += `<rect data-ch-hov="${w}" x="${v}" y="${M}" width="${x}" height="${Math.max(1, S)}" rx="2" fill="${$}" opacity="${Nt(e, w)}"></rect>`, m += A(v + x / 2, M - 6, `${f.total ? "" : f.value > 0 ? "+" : "−"}${Math.abs(f.value).toLocaleString("es-CL")}`, { ff: "var(--td-font-mono)", fw: 700, fill: j });
    const y = f.name.split(" ");
    m += A(v + x / 2, o - c + 18, y[0], { fs: 11 }), m += A(v + x / 2, o - c + 32, y.slice(1).join(" "), { fs: 11 }), b < n.length - 1 && (m += `<line x1="${v + x}" x2="${v + u}" y1="${p(f.b)}" y2="${p(f.b)}" stroke="var(--td-color-border-strong)" stroke-dasharray="2 3"></line>`);
  });
  const h = e == null ? null : n[Number(e)], g = h ? `${h.name} · ${h.total ? U(h.value) : `${h.value > 0 ? "+" : "−"}${U(Math.abs(h.value))} · acumulado ${U(h.b)}`}` : "Pasa el mouse sobre el gráfico";
  return ct("Puente de margen · septiembre 2026", "millones CLP", m, s, o, "Waterfall de margen", g, [
    `Margen bruto ${U(n[6].value)} (${Math.round(n[6].value / 84 * 100)}% de las ventas)`,
    `Mayor fuga: flete, ${U(6.2)} (7,4%)`,
    `Devoluciones bajaron a ${U(1.5)}`
  ]);
}
function nr(e) {
  const t = [["Visitas", 48200], ["Búsqueda de repuesto", 21300], ["Ficha técnica", 9840], ["Carrito", 3120], ["Cotización", 1460], ["Pedido", 1284]], a = 760, n = 360, s = 300, o = 520, r = 54, i = 6;
  let c = "";
  t.forEach(([u, p], m) => {
    const h = o * Math.sqrt(p / t[0][1]), g = m < t.length - 1 ? o * Math.sqrt(t[m + 1][1] / t[0][1]) : h * 0.92, f = 10 + m * (r + i), b = String(m), v = m === t.length - 1 ? "var(--td-color-primary)" : `color-mix(in srgb, var(--td-color-text) ${85 - m * 13}%, var(--td-color-surface))`;
    c += `<path data-ch-hov="${b}" d="M${s - h / 2},${f} L${s + h / 2},${f} L${s + g / 2},${f + r} L${s - g / 2},${f + r} Z" fill="${v}" opacity="${Nt(e, b)}"></path>`, c += A(s, f + r / 2 + 5, p.toLocaleString("es-CL"), { fs: 15, fw: 800, fill: m > 2 && m < t.length - 1 ? j : "#fff", ff: "var(--td-font-display)" }), c += A(s + o / 2 + 20, f + 22, u, { a: "start", fs: 13, fw: 600, fill: j }), c += A(s + o / 2 + 20, f + 40, m ? `${Math.round(p / t[m - 1][1] * 1e3) / 10}% del paso anterior` : "100%", { a: "start", fs: 11.5, ff: "var(--td-font-mono)" });
  });
  const l = e == null ? null : t[Number(e)], d = l ? `${l[0]} · ${l[1].toLocaleString("es-CL")} · ${Math.round(l[1] / t[0][1] * 1e3) / 10}% de las visitas${Number(e) ? ` · perdidos en este paso ${(t[Number(e) - 1][1] - l[1]).toLocaleString("es-CL")}` : ""}` : "Pasa el mouse sobre el gráfico";
  return ct("Embudo de conversión · tienda web · septiembre", "sesiones", c, a, n, "Embudo de conversión", d, [
    "Conversión total 2,66%",
    "Mayor caída: Ficha técnica → Carrito (−68%)",
    "Cotización → Pedido cierra al 88%"
  ]);
}
function sr(e) {
  const t = [["Pastillas", 34], ["Filtros", 28], ["Discos", 22], ["Amortig.", 18], ["Turbo", 16], ["Neumático", 14], ["Embragues", 13], ["Refriger.", 12], ["Alternad.", 11], ["Muelles", 9], ["Ilumin.", 7], ["Sensores", 6], ["Correas", 5], ["Bujes", 4]], a = t.reduce((x, M) => x + M[1], 0), n = 780, s = 340, o = 44, r = 44, i = 14, c = 44, l = n - o - r, d = s - i - c, u = l / t.length, p = 40;
  let m = 0;
  const h = [];
  let g = `<line x1="${o}" x2="${n - r}" y1="${i + d * 0.2}" y2="${i + d * 0.2}" stroke="var(--td-color-warning)" stroke-dasharray="5 4"></line>${A(n - r + 4, i + d * 0.2 + 4, "80%", { a: "start", ff: "var(--td-font-mono)", fs: 11, fill: "var(--td-color-warning)" })}`;
  for (let x = 0; x <= p; x += 10) {
    const M = i + d - x / p * d;
    g += `<line x1="${o}" x2="${n - r}" y1="${M}" y2="${M}" stroke="${St}" stroke-dasharray="${x ? "3 4" : ""}"></line>${A(o - 8, M + 4, String(x), { a: "end", ff: "var(--td-font-mono)", fs: 11 })}`;
  }
  t.forEach(([x, M], S) => {
    const $ = m;
    m += M;
    const w = $ / a < 0.8 ? "A" : $ / a < 0.95 ? "B" : "C", y = o + S * u + u * 0.14, L = M / p * d, q = String(S), O = w === "A" ? "var(--td-color-primary)" : w === "B" ? j : "#9CA3AB";
    g += `<rect data-ch-hov="${q}" x="${y}" y="${i + d - L}" width="${u * 0.72}" height="${L}" rx="2" fill="${O}" opacity="${Nt(e, q)}"></rect>`, g += A(y + u * 0.36, s - c + 16, x, { fs: 10.5 }), g += A(y + u * 0.36, s - c + 30, w, { fs: 10.5, fw: 700, ff: "var(--td-font-mono)", fill: j }), h.push([o + S * u + u / 2, i + d - m / a * d]);
  }), g += `<path d="${h.map((x, M) => `${M ? "L" : "M"}${x[0]},${x[1]}`).join(" ")}" fill="none" stroke="var(--td-color-info)" stroke-width="2.5"></path>`, h.forEach((x, M) => {
    g += `<circle cx="${x[0]}" cy="${x[1]}" r="${e === String(M) ? 5 : 3}" fill="var(--td-color-info)"></circle>`;
  }), [0, 50, 100].forEach((x) => {
    g += A(n - r + 8, i + d - x / 100 * d + 4, `${x}%`, { a: "start", ff: "var(--td-font-mono)", fs: 11, fill: "var(--td-color-info)" });
  });
  const f = e == null ? -1 : Number(e), b = f < 0 ? "Pasa el mouse sobre el gráfico" : `${t[f][0]} · ${U(t[f][1])} · ${Math.round(t[f][1] / a * 100)}% · acumulado ${Math.round(t.slice(0, f + 1).reduce((x, M) => x + M[1], 0) / a * 100)}%`, v = t.filter((x, M) => t.slice(0, M).reduce((S, $) => S + $[1], 0) / a < 0.8).length;
  return ct("Ventas por familia · clasificación ABC", "millones CLP · acumulado en %", g, n, s, "Pareto ABC", b, [
    `Clase A: ${v} de ${t.length} familias generan el 80% de la venta`,
    "Prioriza stock de seguridad en clase A",
    "Clase C candidata a venta bajo pedido"
  ]);
}
function or(e) {
  const t = [["Frenos", [["Pastillas", 34], ["Discos", 22], ["Neumático", 14], ["Sensores", 6]]], ["Motor", [["Filtros", 28], ["Turbo", 16], ["Refrigeración", 12]]], ["Suspensión", [["Amortiguadores", 18], ["Muelles", 9]]], ["Eléctrico", [["Alternadores", 11], ["Iluminación", 7]]], ["Transmisión", [["Embragues", 13]]]], a = (l) => l.reduce((d, u) => d + u[1], 0), n = t.reduce((l, d) => l + a(d[1]), 0), s = 780, o = 380;
  let r = 0, i = "";
  t.forEach(([l, d], u) => {
    const p = s * a(d) / n;
    let m = 0;
    const h = a(d);
    d.forEach(([g, f], b) => {
      const v = o * f / h, x = `${u}-${b}`;
      i += `<rect data-ch-hov="${x}" x="${r + 1}" y="${m + 1}" width="${p - 2}" height="${v - 2}" fill="${zt[u]}" fill-opacity="${0.92 - b * 0.18}" stroke="var(--td-color-surface)" stroke-width="2" opacity="${Nt(e, x)}"></rect>`, p > 90 && v > 44 && (i += A(r + 10, m + 22, g, { a: "start", fs: 13, fw: 700, fill: "#fff" }), i += A(r + 10, m + 40, U(f), { a: "start", fs: 11.5, ff: "var(--td-font-mono)", fill: "rgba(255,255,255,.85)" })), m += v;
    }), i += p > 70 ? A(r + p / 2, o + 18, l, { fs: 12, fw: 700, fill: j }) : A(Math.min(s - 2, r + p), o + 18, l, { fs: 12, fw: 700, fill: j, a: "end" }), r += p;
  });
  let c = "Pasa el mouse sobre el gráfico";
  if (e) {
    const [l, d] = e.split("-").map(Number), u = t[l], p = u[1][d];
    c = `${u[0]} › ${p[0]} · ${U(p[1])} · ${Math.round(p[1] / n * 100)}% del total · ${Math.round(p[1] / a(u[1]) * 100)}% de ${u[0]}`;
  }
  return ct("Valor de venta por categoría y subcategoría", "área proporcional · millones CLP", i, s, o + 26, "Treemap", c, [
    `Frenos concentra el ${Math.round(a(t[0][1]) / n * 100)}% del valor`,
    "Pastillas es la subcategoría más grande",
    "Transmisión depende de un solo producto"
  ]);
}
function rr(e) {
  const t = ["Precio", "Plazo", "Calidad", "Stock", "Garantía", "Soporte"], a = [["Volvo Parts", [6, 7, 9.5, 8, 9, 8]], ["Bosch", [7.5, 8.5, 8.5, 9, 7, 7]], ["Genérico", [9.5, 6, 5.5, 7, 4, 5]]], n = 230, s = 190, o = 150, r = (d, u) => {
    const p = -Math.PI / 2 + d * 2 * Math.PI / t.length;
    return [n + Math.cos(p) * o * u / 10, s + Math.sin(p) * o * u / 10];
  };
  let i = "";
  [2, 4, 6, 8, 10].forEach((d) => {
    i += `<polygon points="${t.map((u, p) => r(p, d).join(",")).join(" ")}" fill="none" stroke="${St}"></polygon>`;
  }), t.forEach((d, u) => {
    const p = r(u, 10), m = r(u, 11.6);
    i += `<line x1="${n}" y1="${s}" x2="${p[0]}" y2="${p[1]}" stroke="${St}"></line>${A(m[0], m[1] + 4, d, { fs: 12.5, fw: 600, fill: j })}`;
  }), a.forEach(([, d], u) => {
    const p = zt[[0, 2, 1][u]], m = String(u);
    i += `<polygon data-ch-hov="${m}" points="${d.map((h, g) => r(g, h).join(",")).join(" ")}" fill="${p}" fill-opacity="${e === m ? 0.3 : 0.1}" stroke="${p}" stroke-width="${e === m ? 3 : 2}"></polygon>`, d.forEach((h, g) => {
      const f = r(g, h);
      i += `<circle cx="${f[0]}" cy="${f[1]}" r="3.5" fill="${p}" pointer-events="none"></circle>`;
    });
  }), a.forEach(([d], u) => {
    const p = (a[u][1].reduce((m, h) => m + h, 0) / 6).toFixed(1).replace(".", ",");
    i += `<rect x="470" y="${60 + u * 30}" width="12" height="12" rx="3" fill="${zt[[0, 2, 1][u]]}"></rect>${A(490, 71 + u * 30, d, { a: "start", fs: 13, fw: 600, fill: j })}${A(640, 71 + u * 30, p, { a: "end", fs: 13, ff: "var(--td-font-mono)", fw: 700, fill: j })}`;
  });
  const c = e == null ? null : a[Number(e)], l = c ? `${c[0]} · ${t.map((d, u) => `${d} ${String(c[1][u]).replace(".", ",")}`).join(" · ")}` : "Pasa el mouse sobre el gráfico";
  return ct("Evaluación de proveedores · frenos", "puntaje 0–10", i, 660, 380, "Radar de proveedores", l, [
    "Volvo Parts lidera en calidad y garantía",
    "Bosch tiene el mejor plazo y stock",
    "Genérico: más barato pero débil en garantía y soporte"
  ]);
}
function ir(e) {
  const t = ["Quilicura", "Concepción", "Antofagasta"], a = ["Metropolitana", "Centro", "Sur", "Norte"], n = [[320, 120, 40, 40], [30, 60, 150, 20], [20, 10, 10, 170]], s = 760, o = 380, r = n.flat().reduce((S, $) => S + $, 0), i = 14, c = (o - 20 - i * 3) / r, l = 16, d = 150, u = s - 170, p = t.map((S, $) => n[$].reduce((w, y) => w + y, 0)), m = a.map((S, $) => n.reduce((w, y) => w + y[$], 0)), h = [];
  let g = 10;
  p.forEach((S) => {
    h.push(g), g += S * c + i;
  });
  const f = [];
  g = 10, m.forEach((S) => {
    f.push(g), g += S * c + i;
  });
  const b = h.slice(), v = f.slice();
  let x = "";
  n.forEach((S, $) => S.forEach((w, y) => {
    const L = w * c, q = b[$] + L / 2, O = v[y] + L / 2, W = (d + l + u) / 2, Y = `${$}-${y}`, k = e == null ? 0.35 : e === Y ? 0.7 : 0.1;
    x += `<path data-ch-hov="${Y}" d="M${d + l},${q} C${W},${q} ${W},${O} ${u},${O}" fill="none" stroke="${zt[[0, 2, 3][$]]}" stroke-width="${Math.max(1, L)}" stroke-opacity="${k}"></path>`, b[$] += L, v[y] += L;
  })), t.forEach((S, $) => {
    x += `<rect x="${d}" y="${h[$]}" width="${l}" height="${p[$] * c}" rx="2" fill="${zt[[0, 2, 3][$]]}"></rect>`, x += A(d - 10, h[$] + p[$] * c / 2, S, { a: "end", fs: 13, fw: 700, fill: j }), x += A(d - 10, h[$] + p[$] * c / 2 + 16, `${p[$]} pedidos`, { a: "end", fs: 11, ff: "var(--td-font-mono)" });
  }), a.forEach((S, $) => {
    x += `<rect x="${u}" y="${f[$]}" width="${l}" height="${m[$] * c}" rx="2" fill="${j}"></rect>`, x += A(u + l + 10, f[$] + m[$] * c / 2, S, { a: "start", fs: 13, fw: 700, fill: j }), x += A(u + l + 10, f[$] + m[$] * c / 2 + 16, `${m[$]} pedidos`, { a: "start", fs: 11, ff: "var(--td-font-mono)" });
  });
  let M = "Pasa el mouse sobre el gráfico";
  if (e?.includes("-") && t[Number(e.split("-")[0])]) {
    const [S, $] = e.split("-").map(Number), w = n[S][$];
    M = `${t[S]} → ${a[$]} · ${w} pedidos · ${Math.round(w / p[S] * 100)}% de ${t[S]} · ${Math.round(w / m[$] * 100)}% de lo recibido en ${a[$]}`;
  }
  return ct("Flujo de despachos · bodega → región · septiembre", "pedidos", x, s, o, "Sankey de despachos", M, [
    "Quilicura abastece el 86% de la Región Metropolitana",
    "Concepción cubre el 75% del Sur",
    "40 pedidos cruzan de Quilicura al Norte: evaluar stock en Antofagasta"
  ]);
}
function cr(e) {
  const t = [["Ventas", "M CLP", 84, 90, [60, 80, 100]], ["Pedidos", "miles", 1.28, 1.2, [0.8, 1.1, 1.5]], ["OTIF", "%", 92, 95, [80, 90, 100]], ["Margen", "%", 33, 35, [25, 32, 40]], ["NPS", "pts", 48, 55, [30, 50, 70]]], a = 760, n = 58, s = 150;
  let o = "";
  t.forEach(([c, l, d, u, p], m) => {
    const h = 10 + m * n, g = a - s - 70, f = p[2], b = (M) => s + M / f * g;
    [...p].reverse().forEach((M, S) => {
      o += `<rect x="${s}" y="${h}" width="${b(M) - s}" height="30" fill="color-mix(in srgb, var(--td-color-text) ${[10, 18, 28][S]}%, var(--td-color-surface))"></rect>`;
    });
    const v = d >= u, x = String(m);
    o += `<rect data-ch-hov="${x}" x="${s}" y="${h + 10}" width="${b(d) - s}" height="10" fill="${v ? Ct : "var(--td-color-primary)"}" opacity="${Nt(e, x)}"></rect>`, o += `<line x1="${b(u)}" x2="${b(u)}" y1="${h + 3}" y2="${h + 27}" stroke="${j}" stroke-width="3"></line>`, o += A(s - 12, h + 14, c, { a: "end", fs: 13.5, fw: 700, fill: j }), o += A(s - 12, h + 29, l, { a: "end", fs: 11, ff: "var(--td-font-mono)" }), o += A(a - 60, h + 20, String(d).replace(".", ","), { a: "start", fs: 14, fw: 800, fill: v ? Ct : j, ff: "var(--td-font-display)" });
  });
  const r = e == null ? null : t[Number(e)], i = r ? `${r[0]} · ${String(r[2]).replace(".", ",")} ${r[1]} · meta ${String(r[3]).replace(".", ",")} · ${r[2] >= r[3] ? "cumple (+" : "falta ("}${Math.round((r[2] / r[3] - 1) * 1e3) / 10}%)` : "Pasa el mouse sobre el gráfico";
  return ct("KPIs del mes contra meta", "barra = actual · marca = meta · bandas = malo / aceptable / bueno", o, a, 10 + t.length * n, "Bullet chart de KPIs", i, [
    "Cumplen meta: Pedidos",
    "Más lejos de la meta: NPS (−13%)",
    "Cinco indicadores en el espacio de un gráfico"
  ]);
}
function lr(e) {
  const t = ["Lun 22", "Mar 23", "Mié 24", "Jue 25", "Vie 26", "Sáb 27"], a = [["Picking OC-00498", 0, 1.5, 100, 0], ["Carga camión CBTR-45", 1, 0.5, 100, 1], ["Ruta Norte · Antofagasta", 1.5, 2.5, 55, 2], ["Picking OC-00503/504", 2, 1, 40, 0], ["Ruta Sur · Concepción", 2.5, 2, 10, 2], ["Inventario cíclico A", 3, 2, 0, 3], ["Entrega Minera Los Robles", 4, 1, 0, 2]], n = 780, s = 210, o = 38, r = 30, i = (n - s - 10) / t.length, c = 2.45, l = r + a.length * o + 6;
  let d = "";
  t.forEach((p, m) => {
    d += `<rect x="${s + m * i}" y="${r}" width="${i}" height="${a.length * o}" fill="${m % 2 ? "transparent" : "var(--td-color-surface-secondary)"}"></rect>`, d += A(s + m * i + i / 2, 18, p, { fs: 12, fw: 600, fill: m === 2 ? "var(--td-color-primary)" : Ka });
  }), a.forEach(([p, m, h, g, f], b) => {
    const v = r + b * o + 8, x = s + m * i, M = h * i, S = zt[[0, 1, 2, 3][f]], $ = String(b);
    d += A(s - 12, v + 16, p, { a: "end", fs: 12.5, fw: 600, fill: j }), d += `<rect data-ch-hov="${$}" x="${x}" y="${v}" width="${M}" height="22" rx="4" fill="${S}" fill-opacity="0.22" stroke="${S}" opacity="${Nt(e, $)}"></rect>`, d += `<rect x="${x}" y="${v}" width="${M * g / 100}" height="22" rx="4" fill="${S}" pointer-events="none"></rect>`, d += A(x + M + 6, v + 15, `${g}%`, { a: "start", fs: 11, ff: "var(--td-font-mono)", fill: j });
  }), d += `<line x1="${s + c * i}" x2="${s + c * i}" y1="${r - 4}" y2="${l}" stroke="var(--td-color-primary)" stroke-width="2"></line>${A(s + c * i, l + 14, "Hoy", { fs: 11, fw: 700, fill: "var(--td-color-primary)" })}`;
  let u = "Pasa el mouse sobre el gráfico";
  if (e != null && a[Number(e)]) {
    const [p, m, h, g] = a[Number(e)], f = (b) => `${t[Math.floor(b)]} ${b % 1 ? "14:00" : "08:00"}`;
    u = `${p} · ${f(m)} → ${f(Math.min(m + h, 5.99))} · ${h * 24 >= 24 ? `${String(h).replace(".", ",")} días` : `${h * 24} h`} · avance ${g}%`;
  }
  return ct("Programación de despachos · semana 39", "barra = duración · relleno = avance", d, n, l + 20, "Gantt de despachos", u, [
    "2 tareas completadas, 3 en curso",
    "Ruta Sur va atrasada respecto a hoy (10%)",
    "Viernes: entrega crítica a Minera Los Robles"
  ]);
}
function dr(e) {
  const t = ["Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"], a = [61, 64, 70, 60, 62, 64, 66, 71, 72, 76, 80, 84], n = [86, 89, 95], s = [60, 62, 66, 62, 63, 65, 68, 70, 73, 75, 78, 80, 83, 86, 90], o = 780, r = 340, i = 44, c = 14, l = 32, d = o - i - 16, u = r - c - l, p = t.length, m = (S) => i + S * d / (p - 1), h = 40, g = 120, f = (S) => c + u - (S - h) / (g - h) * u, b = a.length - 1;
  let v = "";
  for (let S = h; S <= g; S += 20)
    v += `<line x1="${i}" x2="${o - 16}" y1="${f(S)}" y2="${f(S)}" stroke="${St}" stroke-dasharray="3 4"></line>${A(i - 8, f(S) + 4, String(S), { a: "end", ff: "var(--td-font-mono)", fs: 11 })}`;
  const x = (S) => {
    const $ = [[m(b), f(a[b])], ...n.map((y, L) => [m(b + 1 + L), f(y + (L + 1) * S)])], w = [...n.map((y, L) => [m(b + 1 + L), f(y - (L + 1) * S)])].reverse();
    return `M${$.map((y) => y.join(",")).join(" L")} L${w.map((y) => y.join(",")).join(" L")} L${m(b)},${f(a[b])} Z`;
  };
  v += `<rect x="${m(b)}" y="${c}" width="${m(p - 1) - m(b)}" height="${u}" fill="var(--td-color-surface-secondary)"></rect>${A((m(b) + m(p - 1)) / 2, c + 14, "Pronóstico", { fs: 11, fw: 700 })}`, v += `<path d="${x(3.2 * 1.96)}" fill="var(--td-color-primary)" fill-opacity="0.1"></path><path d="${x(3.2 * 1.28)}" fill="var(--td-color-primary)" fill-opacity="0.18"></path>`, v += `<path d="${s.map((S, $) => `${$ ? "L" : "M"}${m($)},${f(S)}`).join(" ")}" fill="none" stroke="${Ka}" stroke-width="2" stroke-dasharray="6 5"></path>`, v += `<path d="${a.map((S, $) => `${$ ? "L" : "M"}${m($)},${f(S)}`).join(" ")}" fill="none" stroke="${j}" stroke-width="2.75"></path>`, v += `<path d="M${m(b)},${f(a[b])}${n.map((S, $) => ` L${m(b + 1 + $)},${f(S)}`).join("")}" fill="none" stroke="var(--td-color-primary)" stroke-width="2.75" stroke-dasharray="2 5" stroke-linecap="round"></path>`, t.forEach((S, $) => {
    const w = $ > b, y = w ? n[$ - b - 1] : a[$];
    v += A(m($), r - 10, S, { fs: 11 }), v += `<circle cx="${m($)}" cy="${f(y)}" r="${e === String($) ? 6 : 3.5}" fill="${w ? "var(--td-color-primary)" : j}"></circle>`, v += `<rect data-ch-hov="${$}" x="${m($) - d / (p - 1) / 2}" y="${c}" width="${d / (p - 1)}" height="${u}" fill="transparent"></rect>`;
  });
  let M = "Pasa el mouse sobre el gráfico";
  if (e != null) {
    const S = Number(e), $ = S > b, w = $ ? n[S - b - 1] : a[S], y = 1.96 * 3.2 * (S - b);
    M = `${t[S]} · ${$ ? `pronóstico ${U(w)} (95 %: ${U(w - y)}–${U(w + y)})` : `real ${U(w)}`} · presupuesto ${U(s[S])} · brecha ${w >= s[S] ? "+" : ""}${U(w - s[S])}`;
  }
  return ct("Ventas mensuales · real, pronóstico y presupuesto", "millones CLP · bandas 80 % y 95 %", v, o, r, "Pronóstico de ventas", M, [
    `Cierre de año proyectado: ${U(n.reduce((S, $) => S + $, 0))} en el trimestre`,
    `Diciembre supera el presupuesto en ${U(5)}`,
    `Riesgo bajo: el peor escenario al 95 % sigue sobre ${U(Math.round(95 - 1.96 * 3.2 * 3))}`
  ]);
}
function ur(e) {
  const t = [["Repuestos frenos", 42.1, 38], ["Repuestos motor", 29.4, 31], ["Servicio técnico", 12.8, 10.5], ["E-commerce", 9.6, 12], ["Logística", -8.9, -7.5], ["Marketing", -3.1, -3.4], ["Personal", -18.2, -17.6], ["Arriendo bodegas", -6, -6]].map(([p, m, h]) => ({ name: String(p), real: Number(m), budget: Number(h), delta: Number(m) - Number(h) })).sort((p, m) => Math.abs(m.delta) - Math.abs(p.delta)), a = 780, n = 36, s = 200, o = 480, r = 60, i = 20 + t.length * n + 40;
  let c = `<line x1="${o}" x2="${o}" y1="8" y2="${i - 30}" stroke="${j}"></line>${A(o - 120, 14, "← Bajo presupuesto", { fs: 11, fw: 600, fill: kt })}${A(o + 120, 14, "Sobre presupuesto →", { fs: 11, fw: 600, fill: Ct })}`;
  t.forEach((p, m) => {
    const h = 24 + m * n, g = Math.abs(p.delta) * r, f = p.delta >= 0, b = String(m);
    c += A(s - 12, h + 16, p.name, { a: "end", fs: 13, fw: 600, fill: j }), c += A(s - 12, h + 30, `real ${U(p.real)} · ppto ${U(p.budget)}`, { a: "end", fs: 10.5, ff: "var(--td-font-mono)" }), c += `<rect data-ch-hov="${b}" x="${f ? o : o - g}" y="${h + 4}" width="${Math.max(2, g)}" height="22" rx="3" fill="${f ? Ct : kt}" opacity="${Nt(e, b)}"></rect>`, c += A(f ? o + g + 6 : o - g - 6, h + 19, `${f ? "+" : "−"}${Math.abs(p.delta).toFixed(1).replace(".", ",")}`, { a: f ? "start" : "end", fs: 12, ff: "var(--td-font-mono)", fw: 700, fill: j });
  });
  const l = t.reduce((p, m) => p + m.delta, 0);
  c += `<line x1="${s - 180}" x2="${a - 10}" y1="${i - 34}" y2="${i - 34}" stroke="${St}"></line>`, c += A(s - 12, i - 12, "Resultado neto vs presupuesto", { a: "end", fs: 13, fw: 800, fill: j }), c += A(o + (l >= 0 ? 8 : -8), i - 12, `${l >= 0 ? "+" : "−"}${U(Math.abs(l))}`, { a: l >= 0 ? "start" : "end", fs: 14, fw: 800, fill: l >= 0 ? Ct : kt, ff: "var(--td-font-display)" });
  const d = e == null ? null : t[Number(e)], u = d ? `${d.name} · real ${U(d.real)} · presupuesto ${U(d.budget)} · desviación ${d.delta >= 0 ? "+" : "−"}${U(Math.abs(d.delta))} (${Math.round(d.delta / Math.abs(d.budget) * 100)}%)` : "Pasa el mouse sobre el gráfico";
  return ct("Resultado por área · real vs presupuesto · septiembre", "desviación en millones CLP, ordenada por impacto", c, a, i, "Varianza contra presupuesto", u, [
    `Frenos explica la mayor parte del sobrecumplimiento (+${U(4.1)})`,
    "E-commerce 20% bajo lo presupuestado: revisar campañas",
    `Logística se excede en ${U(1.4)} por fletes al Norte`
  ]);
}
function pr(e) {
  const t = [["Pastillas", 18, 38, 34], ["Filtros", 6, 42, 28], ["Discos", 12, 31, 22], ["Turbo", 24, 27, 16], ["Amortiguadores", 9, 22, 18], ["Embragues", -4, 35, 13], ["Alternadores", 15, 18, 11], ["Iluminación", 31, 24, 7], ["Correas", -8, 16, 5], ["Bujes", -2, 12, 4], ["Sensores", 38, 44, 6]], a = 780, n = 400, s = 50, o = 16, r = 40, i = a - s - 20, c = n - o - r, l = (b) => s + (b + 15) / 60 * i, d = (b) => o + c - (b - 5) / 45 * c, u = l(10), p = d(30), m = [
    [s, o, u - s, p - o, "Mantener", "Rentable, crece poco"],
    [u, o, a - 20 - u, p - o, "Invertir", "Crece y es rentable"],
    [s, p, u - s, o + c - p, "Revisar / salir", "Poco margen, sin crecimiento"],
    [u, p, a - 20 - u, o + c - p, "Mejorar margen", "Crece con margen bajo"]
  ];
  let h = "";
  m.forEach(([b, v, x, M, ,], S) => {
    h += `<rect x="${b}" y="${v}" width="${x}" height="${M}" fill="${S === 1 ? "color-mix(in srgb, var(--td-color-success) 7%, transparent)" : S === 2 ? "color-mix(in srgb, var(--td-color-danger) 6%, transparent)" : "transparent"}"></rect>`;
  }), h += `<line x1="${u}" x2="${u}" y1="${o}" y2="${o + c}" stroke="var(--td-color-border-strong)" stroke-dasharray="5 4"></line><line x1="${s}" x2="${a - 20}" y1="${p}" y2="${p}" stroke="var(--td-color-border-strong)" stroke-dasharray="5 4"></line>`, [-10, 0, 10, 20, 30, 40].forEach((b) => {
    h += A(l(b), o + c + 18, `${b}%`, { ff: "var(--td-font-mono)", fs: 11 });
  }), [10, 20, 30, 40, 50].forEach((b) => {
    h += A(s - 8, d(b) + 4, `${b}%`, { a: "end", ff: "var(--td-font-mono)", fs: 11 });
  }), h += A(s + i, n - 4, "Crecimiento anual →", { a: "end", fs: 11 }) + A(s + 4, o + 4, "↑ Margen", { a: "start", fs: 11 }), t.forEach(([b, v, x, M], S) => {
    const $ = v >= 10 && x >= 30 ? 3 : v < 10 && x >= 30 ? 1 : v >= 10 ? 2 : 0, w = [kt, j, "var(--td-color-info)", Ct][$], y = String(S);
    h += `<circle data-ch-hov="${y}" cx="${l(v)}" cy="${d(x)}" r="${6 + Math.sqrt(M) * 3.2}" fill="${w}" fill-opacity="0.28" stroke="${w}" stroke-width="2" opacity="${Nt(e, y)}"></circle>`, h += A(l(v), d(x) + 4, b, { fs: 11, fw: 700, fill: j });
  }), m.forEach(([b, v, x, M, S, $], w) => {
    const y = w < 2, L = w % 2 ? b + x - 10 : b + 10, q = w % 2 ? "end" : "start";
    h += A(L, y ? v + 18 : v + M - 22, S, { a: q, fs: 13, fw: 800, fill: j }), h += A(L, y ? v + 33 : v + M - 8, $, { a: q, fs: 11 });
  });
  const g = e == null ? null : t[Number(e)], f = g ? `${g[0]} · crecimiento ${g[1]}% · margen ${g[2]}% · venta ${U(g[3])} · ${g[1] >= 10 && g[2] >= 30 ? "Invertir" : g[1] < 10 && g[2] >= 30 ? "Mantener" : g[1] >= 10 ? "Mejorar margen" : "Revisar / salir"}` : "Pasa el mouse sobre el gráfico";
  return ct("Portafolio de familias · crecimiento vs margen", "tamaño = venta anual", h, a, n, "Matriz de portafolio", f, [
    "Invertir: Pastillas, Sensores y Discos",
    "Turbo e Iluminación crecen con margen bajo: renegociar costos",
    "Correas y Bujes: candidatos a salir o vender bajo pedido"
  ]);
}
function mr(e) {
  const t = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep"], a = [42, 38, 51, 47, 55, 49, 60, 58, 64], n = [100, 78, 69, 63, 60, 57, 55, 54, 53], s = 780, o = 120, r = 40, i = (s - o - 10) / 9, c = 34, l = r + t.length * c + 10;
  let d = "";
  for (let p = 0; p < 9; p += 1)
    d += A(o + p * i + i / 2, r - 12, `Mes ${p}`, { fs: 11, fw: 600 });
  t.forEach((p, m) => {
    d += A(o - 12, r + m * c + 15, `${p} 2026`, { a: "end", fs: 12.5, fw: 700, fill: j }), d += A(o - 12, r + m * c + 28, `${a[m]} clientes`, { a: "end", fs: 10.5, ff: "var(--td-font-mono)" });
    for (let h = 0; h < 9 - m; h += 1) {
      const g = h ? Math.max(30, Math.round(n[h] + m * 1.6 + (m * 3 + h) % 4 - 1.5)) : 100, f = (g - 30) / 70, b = `${m}-${h}`;
      d += `<rect data-ch-hov="${b}" x="${o + h * i + 2}" y="${r + m * c + 2}" width="${i - 4}" height="${c - 4}" rx="3" fill="color-mix(in srgb, var(--td-color-primary) ${Math.round(8 + f * 88)}%, var(--td-color-surface))" stroke="${e === b ? j : "none"}" stroke-width="2"></rect>`, d += A(o + h * i + i / 2, r + m * c + c / 2 + 4, `${g}%`, { fs: 11.5, ff: "var(--td-font-mono)", fw: 600, fill: f > 0.55 ? "#fff" : j });
    }
  });
  let u = "Pasa el mouse sobre el gráfico";
  if (e?.includes("-")) {
    const [p, m] = e.split("-").map(Number);
    u = `Cohorte ${t[p]} · mes ${m} · ${m ? `retención aprox. ${Math.round(n[m] + p * 1.6)}%` : "100% (alta)"} · ${a[p]} clientes iniciales`;
  }
  return ct("Retención de clientes por cohorte de alta", "% de clientes que vuelve a comprar cada mes", d, s, l, "Cohortes de retención", u, [
    "La mayor caída ocurre en el primer mes (−22 pp)",
    "Las cohortes recientes retienen mejor: el onboarding de flota funciona",
    "Retención estable en torno al 53% desde el mes 6"
  ]);
}
function fr(e) {
  const t = [["Metropolitana", [42, 28, 16, 14]], ["Centro", [35, 30, 20, 15]], ["Sur", [30, 26, 26, 18]], ["Norte", [48, 24, 12, 16]]], a = ["Frenos", "Motor", "Suspensión", "Otros"], n = [410, 180, 150, 140], s = n.reduce((h, g) => h + g, 0), o = 780, r = 360, i = 40, c = 10, l = o - i - 110, d = r - c - 40;
  let u = i, p = "";
  t.forEach(([, h], g) => {
    const f = l * n[g] / s;
    let b = c;
    h.forEach((v, x) => {
      const M = d * v / 100, S = `${g}-${x}`;
      p += `<rect data-ch-hov="${S}" x="${u + 1}" y="${b + 1}" width="${f - 2}" height="${M - 2}" fill="${zt[x]}" fill-opacity="0.9" opacity="${Nt(e, S)}"></rect>`, M > 22 && f > 60 && (p += A(u + f / 2, b + M / 2 + 4, `${v}%`, { fs: 12, fw: 700, ff: "var(--td-font-mono)", fill: x <= 1 ? "#fff" : "#0A0B0C" })), b += M;
    }), p += A(u + f / 2, r - 22, t[g][0], { fs: 12, fw: 700, fill: j }), p += A(u + f / 2, r - 8, `${U(n[g])} · ${Math.round(n[g] / s * 100)}%`, { fs: 10.5, ff: "var(--td-font-mono)" }), u += f;
  }), [0, 25, 50, 75, 100].forEach((h) => {
    p += A(i - 6, c + d - h / 100 * d + 4, `${h}%`, { a: "end", fs: 10.5, ff: "var(--td-font-mono)" });
  }), a.forEach((h, g) => {
    p += `<rect x="${o - 100}" y="${20 + g * 24}" width="12" height="12" rx="3" fill="${zt[g]}"></rect>${A(o - 82, 31 + g * 24, h, { a: "start", fs: 12.5, fw: 600, fill: j })}`;
  });
  let m = "Pasa el mouse sobre el gráfico";
  if (e?.includes("-")) {
    const [h, g] = e.split("-").map(Number), f = t[h][1][g];
    m = `${t[h][0]} › ${a[g]} · ${f}% de la región · ${U(n[h] * f / 100)} · ${Math.round(n[h] * f / s)}% del total país`;
  }
  return ct("Mezcla de venta · región × categoría", "ancho = venta de la región · alto = % por categoría", p, o, r, "Marimekko", m, [
    "Metropolitana es el 47% de la venta",
    "El Norte depende de Frenos (48%): minería",
    "El Sur tiene la mezcla más equilibrada"
  ]);
}
function hr(e) {
  const t = [["Quilicura", 214, 262], ["Concepción", 118, 131], ["Antofagasta", 96, 128], ["Puerto Montt", 71, 69], ["Temuco", 52, 74], ["La Serena", 64, 58], ["Rancagua", 40, 55]], a = 700, n = 400, s = 200, o = 500, r = 30, i = 280, c = (v) => 20 + (i - v) / (i - r) * (n - 40), l = (v) => t.map((x, M) => [M, x[v]]).sort((x, M) => M[1] - x[1]).map((x) => x[0]), d = l(1), u = l(2), p = (v) => {
    const x = v.map((S, $) => ({ y: S, index: $ })).sort((S, $) => S.y - $.y);
    for (let S = 0; S < 30; S += 1)
      for (let $ = 1; $ < x.length; $ += 1) {
        const w = x[$].y - x[$ - 1].y;
        if (w < 15) {
          const y = (15 - w) / 2;
          x[$].y += y, x[$ - 1].y -= y;
        }
      }
    const M = [];
    return x.forEach((S) => {
      M[S.index] = S.y;
    }), M;
  }, m = p(t.map((v) => c(v[1]))), h = p(t.map((v) => c(v[2])));
  let g = `${A(s, 14, "2025", { fs: 13, fw: 800, fill: j })}${A(o, 14, "2026", { fs: 13, fw: 800, fill: j })}<line x1="${s}" x2="${s}" y1="22" y2="${n - 10}" stroke="${St}"></line><line x1="${o}" x2="${o}" y1="22" y2="${n - 10}" stroke="${St}"></line>`;
  t.forEach(([v, x, M], S) => {
    const $ = M >= x, w = $ ? Ct : kt, y = Math.abs(M / x - 1) > 0.2, L = String(S);
    g += `<line data-ch-hov="${L}" x1="${s}" y1="${c(x)}" x2="${o}" y2="${c(M)}" stroke="${y || e === L ? w : "var(--td-color-border-strong)"}" stroke-width="${e === L ? 4 : y ? 3 : 2}"></line>`, g += `<circle cx="${s}" cy="${c(x)}" r="5" fill="${j}"></circle><circle cx="${o}" cy="${c(M)}" r="5" fill="${w}"></circle>`, g += `<line x1="${s - 6}" y1="${c(x)}" x2="${s - 12}" y2="${m[S]}" stroke="${St}"></line><line x1="${o + 6}" y1="${c(M)}" x2="${o + 12}" y2="${h[S]}" stroke="${St}"></line>`, g += A(s - 14, m[S] + 4, `#${d.indexOf(S) + 1} ${v}  ${x}`, { a: "end", fs: 12, fw: 600, fill: j }), g += A(o + 14, h[S] + 4, `${M}  ${v} #${u.indexOf(S) + 1}  ${$ ? "+" : ""}${Math.round((M / x - 1) * 100)}%`, { a: "start", fs: 12, fw: 600, fill: j });
  });
  const f = e == null ? null : t[Number(e)], b = f ? `${f[0]} · ${U(f[1])} → ${U(f[2])} · ${f[2] >= f[1] ? "+" : ""}${Math.round((f[2] / f[1] - 1) * 100)}% · posición #${d.indexOf(Number(e)) + 1} → #${u.indexOf(Number(e)) + 1}` : "Pasa el mouse sobre el gráfico";
  return ct("Venta por sucursal · 2025 vs 2026 (ene–sep)", "millones CLP · # = posición", g, a, n, "Slope chart", b, [
    "Antofagasta sube al #3 con +33%",
    "Temuco es la de mayor crecimiento (+42%)",
    "La Serena y Puerto Montt caen: revisar cobertura comercial"
  ]);
}
function gr(e) {
  const t = [["Metropolitana", 1.9, 1.1], ["Valparaíso", 2.6, 1.6], ["O’Higgins", 2.8, 1.9], ["Biobío", 3.4, 2.1], ["Araucanía", 4.1, 2.6], ["Los Lagos", 4.8, 3.3], ["Antofagasta", 5.2, 2.9], ["Atacama", 4.6, 3.8]], a = 760, n = 38, s = 170, o = a - s - 70, r = 6, i = (p) => s + p / r * o, c = 30 + t.length * n + 40;
  let l = "";
  for (let p = 0; p <= r; p += 1)
    l += `<line x1="${i(p)}" x2="${i(p)}" y1="20" y2="${c - 40}" stroke="${St}" stroke-dasharray="${p ? "3 4" : ""}"></line>${A(i(p), c - 24, `${p} d`, { fs: 11, ff: "var(--td-font-mono)" })}`;
  l += `<line x1="${i(2)}" x2="${i(2)}" y1="14" y2="${c - 40}" stroke="var(--td-color-warning)" stroke-width="2" stroke-dasharray="5 4"></line>${A(i(2) + 4, 12, "SLA 2 días", { a: "start", fs: 11, fw: 700, fill: "var(--td-color-warning)" })}`, t.forEach(([p, m, h], g) => {
    const f = 34 + g * n, b = String(g);
    l += A(s - 12, f + 4, p, { a: "end", fs: 13, fw: 600, fill: j }), l += `<line data-ch-hov="${b}" x1="${i(h)}" x2="${i(m)}" y1="${f}" y2="${f}" stroke="${e === b ? j : "var(--td-color-border-strong)"}" stroke-width="4"></line>`, l += `<circle cx="${i(m)}" cy="${f}" r="7" fill="#9CA3AB"></circle><circle cx="${i(h)}" cy="${f}" r="7" fill="${h <= 2 ? Ct : "var(--td-color-primary)"}"></circle>`, l += A(i(m) + 12, f + 4, `−${Math.round((1 - h / m) * 100)}%`, { a: "start", fs: 11.5, ff: "var(--td-font-mono)", fw: 700, fill: j });
  }), l += `<circle cx="${a - 230}" cy="${c - 6}" r="5" fill="#9CA3AB"></circle>${A(a - 220, c - 2, "Antes (2025)", { a: "start", fs: 11 })}`, l += `<circle cx="${a - 120}" cy="${c - 6}" r="5" fill="var(--td-color-primary)"></circle>${A(a - 110, c - 2, "Después (2026)", { a: "start", fs: 11 })}`;
  const d = e == null ? null : t[Number(e)], u = d ? `${d[0]} · ${String(d[1]).replace(".", ",")} → ${String(d[2]).replace(".", ",")} días · mejora ${Math.round((1 - d[2] / d[1]) * 100)}% · ${d[2] <= 2 ? "cumple SLA" : `fuera de SLA por ${String(Math.round((d[2] - 2) * 10) / 10).replace(".", ",")} d`}` : "Pasa el mouse sobre el gráfico";
  return ct("Tiempo de entrega por región · antes y después del plan", "días promedio", l, a, c, "Dumbbell de tiempos de entrega", u, [
    "Mejora promedio del 38%",
    "Antofagasta: la mayor mejora (−44%) tras abrir bodega",
    "Atacama y Los Lagos siguen fuera del SLA"
  ]);
}
function br(e, t) {
  const a = t.reduce(($, w) => $ + w, 0) / t.length, n = Math.sqrt(t.reduce(($, w) => $ + (w - a) ** 2, 0) / t.length), s = a + 3 * n, o = Math.max(0, a - 3 * n), r = 780, i = 320, c = 46, l = 14, d = 30, u = r - c - 104, p = i - l - d, m = 5, h = 40, g = ($) => c + $ * u / (t.length - 1), f = ($) => l + p - ($ - m) / (h - m) * p;
  let b = `<rect x="${c}" y="${f(s)}" width="${u}" height="${f(o) - f(s)}" fill="color-mix(in srgb, var(--td-color-success) 6%, transparent)"></rect>`;
  [[s, "LCS", kt, 0], [a, "Media", j, 1], [o, "LCI", kt, 2]].forEach(([$, w, y, L]) => {
    b += `<line x1="${c}" x2="${c + u}" y1="${f(Number($))}" y2="${f(Number($))}" stroke="${y}" stroke-width="${L === 1 ? 2 : 1.5}" stroke-dasharray="${L === 1 ? "" : "6 4"}"></line>`, b += A(c + u + 6, f(Number($)) + 4, `${w} ${Number($).toFixed(1).replace(".", ",")}`, { a: "start", fs: 11, ff: "var(--td-font-mono)", fw: 700, fill: String(y) });
  }), [10, 20, 30, 40].forEach(($) => {
    b += A(c - 8, f($) + 4, `${$} h`, { a: "end", fs: 11, ff: "var(--td-font-mono)" });
  }), b += `<path d="${t.map(($, w) => `${w ? "L" : "M"}${g(w)},${f($)}`).join(" ")}" fill="none" stroke="${j}" stroke-width="2"></path>`;
  let v = 0;
  const x = t.map(($) => (v = $ > a ? v + 1 : 0, v >= 6));
  t.forEach(($, w) => {
    const y = $ > s || $ < o, L = String(w), q = y ? kt : x[w] ? "var(--td-color-warning)" : j;
    b += `<circle data-ch-hov="${L}" cx="${g(w)}" cy="${f($)}" r="${e === L ? 7 : y ? 6 : 4}" fill="${y ? kt : x[w] ? "var(--td-color-warning)" : "var(--td-color-surface)"}" stroke="${q}" stroke-width="2"></circle>`, w % 5 === 0 && (b += A(g(w), i - 8, `${w + 1} sep`, { fs: 10.5, ff: "var(--td-font-mono)" }));
  });
  let M = "Pasa el mouse sobre el gráfico";
  if (e != null) {
    const $ = Number(e), w = t[$], y = w > s || w < o ? "FUERA DE CONTROL" : x[$] ? "tendencia: 6+ días sobre la media" : "en control";
    M = `${$ + 1} sep · ${String(w).replace(".", ",")} h · ${y} · desvío ${((w - a) / n).toFixed(1).replace(".", ",")}σ`;
  }
  const S = t.map(($, w) => $ > s || $ < o ? w + 1 : 0).filter(Boolean);
  return ct("Tiempo de preparación de pedidos · control estadístico", "horas por día · límites ±3σ", b, r, i, "Gráfico de control", M, [
    S.length ? `Fuera de control el ${S.join(", ")} sep: investigar causa` : "Proceso en control",
    "Desde el 24 sep: tendencia sobre la media (regla de 6 puntos)",
    `Media ${a.toFixed(1).replace(".", ",")} h · σ ${n.toFixed(1).replace(".", ",")} h`
  ]);
}
function $r(e, t, a) {
  if (!tr.has(e))
    return null;
  switch (e) {
    case "chwf":
      return ar(t);
    case "chfunnel":
      return nr(t);
    case "chpareto":
      return sr(t);
    case "chtree":
      return or(t);
    case "chradar":
      return rr(t);
    case "chsankey":
      return ir(t);
    case "chbullet":
      return cr(t);
    case "chgantt":
      return lr(t);
    case "chforecast":
      return dr(t);
    case "chvariance":
      return ur(t);
    case "chquadrant":
      return pr(t);
    case "chcohort":
      return mr(t);
    case "chmekko":
      return fr(t);
    case "chslope":
      return hr(t);
    case "chdumbbell":
      return gr(t);
    case "chcontrol":
      return br(t, a);
    default:
      return null;
  }
}
const Et = ["var(--td-color-primary)", "var(--td-color-text)", "var(--td-color-info)", "var(--td-color-success)", "var(--td-color-warning)", "#9CA3AB"], yr = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep"], vr = [
  ["Frenos", [18, 21, 19, 24, 26, 25, 29, 31, 34]],
  ["Motor", [14, 15, 17, 16, 18, 20, 19, 22, 23]],
  ["Suspensión", [9, 10, 9, 11, 12, 12, 13, 14, 15]],
  ["Eléctrico", [6, 7, 8, 7, 9, 9, 10, 11, 12]]
], Be = [50, 52, 54, 56, 60, 62, 66, 70, 74], Ja = 720, _e = 320, dt = 56, xr = 16, nt = 16, Sr = 34, qt = Ja - dt - xr, Q = _e - nt - Sr;
function ta(e) {
  const t = Math.max(e, 1), a = Math.pow(10, Math.floor(Math.log10(t))), n = t / a, o = (n <= 1 ? 0.2 : n <= 2 ? 0.5 : n <= 5 ? 1 : 2) * a;
  return { max: Math.ceil(t / o) * o, step: o };
}
function Ss(e) {
  return `$ ${(Math.round(e * 10) / 10).toLocaleString("es-CL")} M`;
}
function Tt(e) {
  return e.replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t] ?? t);
}
function Qa(e) {
  if (!e.model) return vr;
  const t = Math.max(e.model.categories.length, 0, ...e.model.series.map((a) => a[1].length));
  return e.model.series.map(([a, n]) => [a, Array.from({ length: Math.max(t, n.length) }, (s, o) => n[o] ?? 0)]);
}
function re(e) {
  if (!e.model) return yr;
  if (e.model.categories.length) return e.model.categories;
  const t = e.model.series[0]?.[1].length ?? 0;
  return Array.from({ length: t }, (a, n) => String(n + 1));
}
function Za(e, t) {
  if (!e.model) return Ss(t);
  const a = (Math.round(t * 10) / 10).toLocaleString("es-CL");
  return e.model.unit ? `${a} ${e.model.unit}` : a;
}
function Pn(e) {
  if (!e) return null;
  try {
    const t = JSON.parse(e), a = Array.isArray(t.series) ? t.series.filter((n) => n.name).map((n) => [String(n.name), (n.values ?? []).map(Number)]) : [];
    return { title: t.title || "", unit: t.unit || "", categories: Array.isArray(t.categories) ? t.categories.map(String) : [], series: a };
  } catch {
    return null;
  }
}
function ws(e) {
  return e.map((t, a) => {
    if (!a)
      return `M${t[0]},${t[1]}`;
    const n = e[a - 2] || e[a - 1], s = e[a - 1], o = e[a + 1] || t, r = s[0] + (t[0] - n[0]) / 6, i = s[1] + (t[1] - n[1]) / 6, c = t[0] - (o[0] - s[0]) / 6, l = t[1] - (o[1] - s[1]) / 6;
    return `C${r.toFixed(1)},${i.toFixed(1)} ${c.toFixed(1)},${l.toFixed(1)} ${t[0].toFixed(1)},${t[1].toFixed(1)}`;
  }).join(" ");
}
function Bn(e, t) {
  const a = new Blob(["\uFEFF" + t.map((s) => s.join(";")).join(`\r
`)], { type: "text/csv;charset=utf-8" }), n = document.createElement("a");
  n.href = URL.createObjectURL(a), n.download = `${e}.csv`, n.click(), URL.revokeObjectURL(n.href);
}
function ea(e, t, a) {
  return `<div class="td-chart__seg" role="group">${t.map(
    ([n, s]) => `<button type="button" data-ch-key="${e}" data-ch-value="${n}" aria-pressed="${String(a === n)}">${s}</button>`
  ).join("")}</div>`;
}
function aa(e, t, a) {
  return `<button type="button" class="td-switch" role="switch" data-ch-toggle="${e}" aria-checked="${t}"><i></i>${a}</button>`;
}
function Es(e, t) {
  return `<div class="td-chart__legend">${e.map((a, n) => {
    const s = t.includes(a);
    return `<button type="button" data-ch-legend="${a}" aria-pressed="${!s}" style="opacity:${s ? 0.4 : 1};text-decoration:${s ? "line-through" : "none"}"><i style="background:${Et[n]}"></i>${a}</button>`;
  }).join("")}</div>`;
}
function Xa(e, t, a) {
  let n = "";
  for (let s = 0; s <= e + 1e-9; s += t) {
    const o = nt + Q - s / e * Q;
    n += `<line x1="${dt}" x2="${dt + qt}" y1="${o}" y2="${o}" stroke="var(--td-color-border)" stroke-dasharray="${s ? "3 4" : ""}"></line>`, n += `<text x="${dt - 8}" y="${o + 4}" text-anchor="end" font-size="11" fill="var(--td-color-text-muted)" font-family="var(--td-font-mono)">${a(s)}</text>`;
  }
  return n;
}
function Ya(e, t = _e, a = "Gráfico") {
  return `<svg viewBox="0 0 ${Ja} ${t}" width="100%" role="img" aria-label="${a}" data-ch-plot>${e}</svg>`;
}
function wr(e) {
  const t = Qa(e), a = re(e), n = (v) => Za(e, v), s = e.model?.title || "Ventas por categoría · 2026", o = e.model ? e.model.unit || "" : "millones CLP";
  if (!t.length || !a.length) return `<p class="td-chart__read">${Tt(s)}</p>`;
  const r = t.filter((v) => !e.hidden.includes(v[0])), i = ta(Math.max(1, ...r.flatMap((v) => v[1])) * 1.08), c = a.length, l = (v) => dt + v * (qt / Math.max(c - 1, 1)), d = (v) => nt + Q - v / i.max * Q;
  let u = Xa(i.max, i.step, (v) => String(v));
  u += a.map((v, x) => `<text x="${l(x)}" y="${nt + Q + 22}" text-anchor="middle" font-size="11.5" fill="var(--td-color-text-muted)">${v}</text>`).join(""), e.hov != null && (u += `<line x1="${l(e.hov)}" x2="${l(e.hov)}" y1="${nt}" y2="${nt + Q}" stroke="var(--td-color-border-strong)"></line>`), t.forEach(([v, x], M) => {
    if (e.hidden.includes(v))
      return;
    const S = x.map((w, y) => [l(y), d(w)]);
    let $ = "";
    e.lType === "step" ? $ = S.map((w, y) => y ? `H${w[0]} V${w[1]}` : `M${w[0]},${w[1]}`).join(" ") : $ = e.smooth ? ws(S) : S.map((w, y) => `${y ? "L" : "M"}${w[0]},${w[1]}`).join(" "), e.lType === "area" && (u += `<path d="${$} L${l(c - 1)},${nt + Q} L${dt},${nt + Q} Z" fill="${Et[M]}" opacity="${M ? 0.08 : 0.16}"></path>`), u += `<path d="${$}" fill="none" stroke="${Et[M]}" stroke-width="${M ? 2 : 2.75}" stroke-linejoin="round" stroke-linecap="round"></path>`, e.markers && S.forEach((w, y) => {
      u += `<circle cx="${w[0]}" cy="${w[1]}" r="${e.hov === y ? 5 : 3.2}" fill="var(--td-color-surface)" stroke="${Et[M]}" stroke-width="2"></circle>`;
    });
  });
  const p = a.map((v, x) => t.reduce((M, S) => M + S[1][x], 0)), m = p.indexOf(Math.max(...p)), h = Math.max(p.length - 1, 0), g = p[0] ? Math.round((p[h] / p[0] - 1) * 100) : 0, f = [
    [e.model ? "Total" : "Total 2026", n(p.reduce((v, x) => v + x, 0))],
    ["Mejor periodo", `${a[m] ?? ""} · ${n(p[m] || 0)}`],
    [e.model ? "Cambio" : "Crecimiento Ene→Sep", `${g > 0 ? "+" : ""}${g}%`]
  ], b = e.hov == null ? "Pasa el mouse sobre el gráfico para ver cada mes" : `${a[e.hov]} 2026 · ${r.map((v) => `${v[0]} ${n(v[1][e.hov])}`).join(" · ")} · Total ${n(r.reduce((v, x) => v + x[1][e.hov], 0))}`;
  return `<div class="td-chart__kpis">${f.map(([v, x]) => `<div><span>${v}</span><strong>${x}</strong></div>`).join("")}</div>
        <div class="td-chart__tools">${ea("lType", [["line", "Línea"], ["area", "Área"], ["step", "Escalón"]], e.lType)}${aa("smooth", e.smooth, "Suavizado")}${aa("markers", e.markers, "Marcadores")}<span></span><button type="button" class="td-btn td-btn--secondary td-btn--sm" data-ch-export="ventas">Exportar CSV</button></div>
        <div class="td-chart__head"><strong>${Tt(s)}</strong><em>${Tt(o)}</em></div>
        ${Es(t.map((v) => v[0]), e.hidden)}
        ${Ya(u, _e, "Ventas por categoría")}
        <p class="td-chart__read" role="status">${b}</p>`;
}
function jn(e) {
  const t = Qa(e), a = re(e), n = (h) => Za(e, h);
  if (!t.length || !a.length) return `<p class="td-chart__read">${Tt(e.model?.title || "Sin datos")}</p>`;
  const s = t.filter((h) => !e.hidden.includes(h[0])), o = e.cOri === "h", r = a.map((h, g) => s.reduce((f, b) => f + b[1][g], 0)), i = e.cMode === "pct" ? 100 : e.cMode === "stack" ? Math.max(...r, e.target ? Math.max(...Be) : 0) : Math.max(1, ...s.flatMap((h) => h[1])), c = e.cMode === "pct" ? { max: 100, step: 20 } : ta(i * 1.08), l = (o ? Q : qt) / a.length, d = l * 0.62;
  let u = "";
  if (!o)
    u += Xa(c.max, c.step, (h) => e.cMode === "pct" ? `${h}%` : String(h));
  else
    for (let h = 0; h <= c.max + 1e-9; h += c.step) {
      const g = dt + h / c.max * qt;
      u += `<line x1="${g}" x2="${g}" y1="${nt}" y2="${nt + Q}" stroke="var(--td-color-border)" stroke-dasharray="${h ? "3 4" : ""}"></line>`, u += `<text x="${g}" y="${nt + Q + 18}" text-anchor="middle" font-size="11" fill="var(--td-color-text-muted)" font-family="var(--td-font-mono)">${e.cMode === "pct" ? `${h}%` : h}</text>`;
    }
  if (a.forEach((h, g) => {
    const f = (o ? nt : dt) + l * g + l / 2;
    u += o ? `<text x="${dt - 8}" y="${f + 4}" text-anchor="end" font-size="11.5" fill="var(--td-color-text-muted)">${h}</text>` : `<text x="${f}" y="${nt + Q + 22}" text-anchor="middle" font-size="11.5" fill="var(--td-color-text-muted)">${h}</text>`;
    let b = 0;
    s.forEach(([v, x]) => {
      const M = t.findIndex((W) => W[0] === v), S = x[g], $ = e.cMode === "pct" ? S / r[g] * 100 : S;
      let w = 0, y = 0, L = 0, q = 0;
      if (e.cMode === "group") {
        const W = d / s.length, Y = s.findIndex((k) => k[0] === v);
        o ? (y = f - d / 2 + Y * W, q = W - 2, w = dt, L = $ / c.max * qt) : (w = f - d / 2 + Y * W, L = W - 2, q = $ / c.max * Q, y = nt + Q - q);
      } else o ? (y = f - d / 2, q = d, w = dt + b / c.max * qt, L = $ / c.max * qt, b += $) : (w = f - d / 2, L = d, q = $ / c.max * Q, y = nt + Q - b / c.max * Q - q, b += $);
      const O = e.hov == null || e.hov === g ? 1 : 0.45;
      u += `<rect data-ch-col="${g}" x="${w}" y="${y}" width="${Math.max(0, L)}" height="${Math.max(0, q)}" rx="1.5" fill="${Et[M]}" opacity="${O}"></rect>`;
    });
  }), e.target && e.cMode === "stack" && !o) {
    const h = Be.map((g, f) => [dt + l * f + l / 2, nt + Q - g / c.max * Q]);
    u += `<path d="${h.map((g, f) => `${f ? "L" : "M"}${g[0]},${g[1]}`).join(" ")}" fill="none" stroke="var(--td-color-warning)" stroke-width="2.5" stroke-dasharray="6 5"></path>`, h.forEach((g) => {
      u += `<circle cx="${g[0]}" cy="${g[1]}" r="3.5" fill="var(--td-color-warning)"></circle>`;
    });
  }
  const p = e.hov == null ? "Pasa el mouse sobre una columna" : `${a[e.hov]} · ${s.map((h) => `${h[0]} ${e.cMode === "pct" ? `${Math.round(h[1][e.hov] / r[e.hov] * 100)}%` : n(h[1][e.hov])}`).join(" · ")} · Total ${n(r[e.hov])}${e.target && e.cMode === "stack" ? ` · Meta ${n(Be[e.hov])} ${r[e.hov] >= Be[e.hov] ? "✓" : "✗"}` : ""}`, m = e.target && e.cMode === "stack" && !o ? '<span class="td-chart__meta"><i></i>Meta</span>' : "";
  return `<div class="td-chart__tools">${ea("cOri", [["v", "Columnas"], ["h", "Barras"]], e.cOri)}${ea("cMode", [["group", "Agrupadas"], ["stack", "Apiladas"], ["pct", "100 %"]], e.cMode)}${aa("target", e.target, "Línea de meta")}<span></span><button type="button" class="td-btn td-btn--secondary td-btn--sm" data-ch-export="ventas">Exportar CSV</button></div>
        ${e.model?.title ? `<strong class="td-chart__title">${Tt(e.model.title)}</strong>` : ""}
        ${Es(t.map((h) => h[0]), e.hidden)}${m}
        ${Ya(u, _e, Tt(e.model?.title || "Columnas de ventas"))}
        <p class="td-chart__read" role="status">${p}</p>`;
}
function Er(e) {
  const t = (p) => Za(e, p), a = e.model?.title || "Valor de stock por bodega", n = e.model ? re(e).map((p, m) => [p, e.model?.series[0]?.[1][m] ?? 0]) : [["Quilicura", 128], ["Concepción", 64], ["Antofagasta", 55], ["Puerto Montt", 34], ["En tránsito", 24]];
  if (!n.length || n.every((p) => !p[1])) return `<p class="td-chart__read">${Tt(a)}</p>`;
  const s = n.reduce((p, m) => p + m[1], 0), o = 160, r = 150, i = 120, c = e.pDonut ? 72 : 0;
  let l = -Math.PI / 2, d = "";
  if (n.forEach(([p, m], h) => {
    const g = l + m / s * Math.PI * 2, f = (l + g) / 2, b = e.pHov === h, v = b ? 8 : 0, x = Math.cos(f) * v, M = Math.sin(f) * v, S = g - l > Math.PI ? 1 : 0, $ = (q, O) => [o + x + Math.cos(q) * O, r + M + Math.sin(q) * O], w = $(l, i), y = $(g, i), L = c ? `M${w} A${i},${i} 0 ${S} 1 ${y} L${$(g, c)} A${c},${c} 0 ${S} 0 ${$(l, c)} Z` : `M${o + x},${r + M} L${w} A${i},${i} 0 ${S} 1 ${y} Z`;
    if (d += `<path data-ch-pie="${h}" d="${L}" fill="${Et[h]}" stroke="var(--td-color-surface)" stroke-width="2" opacity="${e.pHov == null || b ? 1 : 0.5}"></path>`, m / s > 0.07) {
      const q = $(f, c ? (i + c) / 2 : i * 0.62);
      d += `<text x="${q[0]}" y="${q[1] + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="${h <= 1 ? "#fff" : "#0A0B0C"}" font-family="var(--td-font-mono)">${Math.round(m / s * 100)}%</text>`;
    }
    l = g;
  }), c) {
    const p = e.pHov == null ? null : n[e.pHov];
    d += `<text x="${o}" y="${r - 4}" text-anchor="middle" font-size="12" fill="var(--td-color-text-muted)">${p ? p[0] : "Valor en stock"}</text>`, d += `<text x="${o}" y="${r + 22}" text-anchor="middle" font-size="24" font-weight="800" fill="var(--td-color-text)" font-family="var(--td-font-display)">${t(p ? p[1] : s)}</text>`;
  }
  const u = n.map(([p, m], h) => `<div class="td-chart__pie-row ${e.pHov === h ? "is-on" : ""}" data-ch-pie="${h}"><i style="background:${Et[h]}"></i><span><strong>${p}</strong><b style="width:${Math.round(m / n[0][1] * 100)}%;background:${Et[h]}"></b></span><em>${t(m)}</em><small>${Math.round(m / s * 100)}%</small></div>`).join("");
  return `<div class="td-chart__tools">${ea("pDonut", [["pie", "Pie"], ["donut", "Donut"]], e.pDonut ? "donut" : "pie")}<strong class="td-chart__title">${Tt(a)}</strong><span></span><button type="button" class="td-btn td-btn--secondary td-btn--sm" data-ch-export="pie">Exportar CSV</button></div>
        <div class="td-chart__pie"><svg viewBox="0 0 320 300" data-ch-plot role="img" aria-label="${Tt(a)}">${d}</svg><div data-ch-pie-list>${u}</div></div>`;
}
function Mr(e) {
  const t = ["Web", "Asesor", "Flota"], a = [0, 2, 3], n = e.points.filter((m) => !e.sHid.includes(t[m.c])), s = ta(2e3), o = ta(6.5), r = (m) => dt + m / s.max * qt, i = (m) => nt + Q - m / o.max * Q;
  let c = Xa(o.max, o.step, (m) => `${m} d`);
  for (let m = 0; m <= s.max + 1e-9; m += s.step)
    c += `<text x="${r(m)}" y="${nt + Q + 20}" text-anchor="middle" font-size="11" fill="var(--td-color-text-muted)" font-family="var(--td-font-mono)">${m ? `$${m}k` : "0"}</text>`;
  n.forEach((m) => {
    const h = e.sHov === m.id;
    c += `<circle data-ch-point="${m.id}" cx="${r(m.val)}" cy="${i(m.dias)}" r="${4 + m.u / 2.4}" fill="${Et[a[m.c]]}" fill-opacity="${h ? 0.9 : 0.35}" stroke="${Et[a[m.c]]}" stroke-width="${h ? 2.5 : 1.25}"></circle>`;
  });
  let l = "";
  if (e.sTrend && n.length > 2) {
    const m = n.length, h = n.reduce((v, x) => v + x.val, 0) / m, g = n.reduce((v, x) => v + x.dias, 0) / m, f = n.reduce((v, x) => v + (x.val - h) * (x.dias - g), 0) / n.reduce((v, x) => v + (x.val - h) ** 2, 0), b = g - f * h;
    c += `<line x1="${r(0)}" y1="${i(b)}" x2="${r(2e3)}" y2="${i(b + f * 2e3)}" stroke="var(--td-color-text)" stroke-width="2" stroke-dasharray="6 5"></line>`, l = `Tendencia: +${(f * 1e3).toFixed(2).replace(".", ",")} días por cada $ 1 M de pedido`;
  }
  const d = e.points.find((m) => m.id === e.sHov), u = d ? `${d.oc} · ${t[d.c]} · $ ${(d.val * 1e3).toLocaleString("es-CL")} · ${String(d.dias).replace(".", ",")} días · ${d.u} unidades` : "Pasa el mouse sobre un punto";
  return `<div class="td-chart__tools"><strong class="td-chart__title">Valor del pedido vs días de entrega</strong><div class="td-chart__legend">${t.map((m, h) => {
    const g = e.sHid.includes(m);
    return `<button type="button" data-ch-channel="${m}" aria-pressed="${!g}" style="opacity:${g ? 0.4 : 1};text-decoration:${g ? "line-through" : "none"}"><i style="background:${Et[a[h]]};border-radius:50%"></i>${m}</button>`;
  }).join("")}</div>${aa("sTrend", e.sTrend, "Línea de tendencia")}</div>
        ${Ya(c, _e + 14, "Dispersión de pedidos")}
        <p class="td-chart__read" role="status">${u}</p><p class="td-chart__trend">${l}</p>`;
}
function xe(e, t, a, n) {
  const s = (n - 90) * Math.PI / 180;
  return [e + a * Math.cos(s), t + a * Math.sin(s)];
}
function Lr(e, t, a, n, s) {
  const o = xe(e, t, a, n), r = xe(e, t, a, s);
  return `M${o[0].toFixed(1)},${o[1].toFixed(1)} A${a},${a} 0 ${s - n > 180 ? 1 : 0} 1 ${r[0].toFixed(1)},${r[1].toFixed(1)}`;
}
function kr(e) {
  const t = e.g, a = (d) => -120 + d / 100 * 240;
  let n = "";
  [[0, 60, "var(--td-color-danger)"], [60, 85, "var(--td-color-warning)"], [85, 100, "var(--td-color-success)"]].forEach(([d, u, p]) => {
    n += `<path d="${Lr(150, 150, 110, a(d), a(u))}" fill="none" stroke="${p}" stroke-width="14"></path>`;
  });
  for (let d = 0; d <= 100; d += 10) {
    const u = xe(150, 150, 94, a(d)), p = xe(150, 150, d % 50 ? 88 : 82, a(d));
    n += `<line x1="${u[0]}" y1="${u[1]}" x2="${p[0]}" y2="${p[1]}" stroke="var(--td-color-text-muted)" stroke-width="${d % 50 ? 1.5 : 2.5}"></line>`;
  }
  const s = xe(150, 150, 100, a(t));
  n += `<line x1="150" y1="150" x2="${s[0]}" y2="${s[1]}" stroke="var(--td-color-text)" stroke-width="4" stroke-linecap="round"></line><circle cx="150" cy="150" r="9" fill="var(--td-color-text)"></circle>`, n += `<text x="150" y="212" text-anchor="middle" font-size="34" font-weight="800" fill="var(--td-color-text)" font-family="var(--td-font-display)">${t}%</text>`, n += '<text x="150" y="234" text-anchor="middle" font-size="12" fill="var(--td-color-text-muted)">Cumplimiento de meta</text>';
  const o = Math.max(0, Math.min(100, Math.round(t * 0.4 + 58))), r = 95, i = Math.PI * 100, c = t >= 85 ? "var(--td-color-success)" : t >= 60 ? "var(--td-color-warning)" : "var(--td-color-danger)", l = t >= 85 ? "Sobre la meta" : t >= 60 ? "En riesgo" : "Bajo la meta";
  return `<div class="td-chart__gauges">
        <div><span>Radial · con rangos</span><svg viewBox="0 0 300 250" role="img" aria-label="Cumplimiento ${t} %">${n}</svg><strong style="color:${c}">${l}</strong></div>
        <div><span>Arco · contra meta</span><svg viewBox="0 0 240 150" role="img" aria-label="OTIF ${o} %"><path d="M20,130 A100,100 0 0 1 220,130" fill="none" stroke="var(--td-color-border)" stroke-width="18" stroke-linecap="round"></path><path d="M20,130 A100,100 0 0 1 220,130" fill="none" stroke="${o >= r ? "var(--td-color-success)" : "var(--td-color-primary)"}" stroke-width="18" stroke-linecap="round" stroke-dasharray="${(i * o / 100).toFixed(1)} ${i.toFixed(1)}"></path><text x="120" y="118" text-anchor="middle" font-size="32" font-weight="800" fill="var(--td-color-text)" font-family="var(--td-font-display)">${o}%</text><text x="120" y="142" text-anchor="middle" font-size="11.5" fill="var(--td-color-text-muted)">OTIF · meta ${r}%</text></svg></div>
    </div>
    <div class="td-chart__tools"><label class="td-chart__range">Valor<input type="range" min="0" max="100" value="${t}" data-ch-gauge></label><button type="button" class="td-btn" data-ch-sim>Simular dato</button></div>`;
}
function _r(e) {
  const a = [
    ["Ventas del mes", "$ 84,0 M", "+12,4%", !0, [52, 55, 54, 58, 61, 60, 66, 70, 68, 74, 79, 84], "area"],
    ["Pedidos", "1.284", "+8,1%", !0, [920, 980, 1010, 990, 1060, 1100, 1090, 1150, 1180, 1210, 1240, 1284], "line"],
    ["Ticket promedio", "$ 65.420", "−2,3%", !1, [70, 69, 71, 68, 67, 69, 68, 66, 67, 66, 65.8, 65.4], "line"],
    ["Devoluciones", "1,8%", "−0,4 pp", !0, [2.6, 2.5, 2.4, 2.4, 2.3, 2.2, 2.2, 2.1, 2, 1.9, 1.9, 1.8], "bar"]
  ].map(([o, r, i, c, l, d], u) => {
    const p = Math.min(...l), m = Math.max(...l), h = 220, g = 56, f = ($) => 2 + $ * (h - 4) / (l.length - 1), b = ($) => g - 4 - ($ - p) / (m - p || 1) * (g - 10), v = l.map(($, w) => [f(w), b($)]), x = e.kHov && e.kHov[0] === u ? e.kHov[1] : l.length - 1;
    let M = "";
    if (d === "bar")
      M = l.map(($, w) => `<rect x="${2 + w * (h - 4) / l.length + 2}" y="${b($)}" width="${(h - 4) / l.length - 4}" height="${g - 2 - b($)}" rx="1" fill="${w === l.length - 1 ? "var(--td-color-primary)" : "var(--td-color-border-strong)"}"></rect>`).join("");
    else {
      const $ = ws(v);
      d === "area" && (M += `<path d="${$} L${f(l.length - 1)},${g} L${f(0)},${g} Z" fill="var(--td-color-primary)" opacity="0.12"></path>`), M += `<path d="${$}" fill="none" stroke="var(--td-color-primary)" stroke-width="2"></path><circle cx="${v[x][0]}" cy="${v[x][1]}" r="3.5" fill="var(--td-color-primary)"></circle>`;
    }
    const S = e.kHov && e.kHov[0] === u ? `Mes ${e.kHov[1] + 1}: ${l[e.kHov[1]].toLocaleString("es-CL")}` : "Últimos 12 meses";
    return `<article><span>${o}</span><div><strong>${r}</strong><em style="color:${c ? "var(--td-color-success)" : "var(--td-color-danger)"}">${i.startsWith("+") || i.startsWith("−") ? i.startsWith("+") ? "▲" : "▼" : ""} ${i}</em></div><svg data-ch-spark="${u}" viewBox="0 0 ${h} ${g}" width="100%" height="${g}">${M}</svg><small>${S}</small></article>`;
  }).join(""), s = [["Frenos", [18, 21, 19, 24, 26, 25, 29, 31, 34]], ["Motor", [14, 15, 17, 16, 18, 20, 19, 22, 23]], ["Suspensión", [9, 10, 9, 11, 12, 12, 13, 14, 15]], ["Eléctrico", [6, 7, 8, 7, 9, 9, 10, 11, 12]], ["Transmisión", [8, 7, 7, 6, 6, 7, 6, 5, 5]]].map(([o, r]) => {
    const i = Math.min(...r), c = Math.max(...r), l = r[r.length - 1] >= r[0], d = r.map((p, m) => `${(m * 120 / (r.length - 1)).toFixed(1)},${(25 - (p - i) / (c - i || 1) * 22).toFixed(1)}`).join(" "), u = `${l ? "+" : ""}${Math.round((r[r.length - 1] / r[0] - 1) * 100)}%`;
    return `<div><span>${o}</span><svg viewBox="0 0 120 28" width="120" height="28"><polyline points="${d}" fill="none" stroke="${l ? "var(--td-color-text)" : "var(--td-color-danger)"}" stroke-width="1.75"></polyline></svg><em>${Ss(r[r.length - 1])}</em><strong style="color:${l ? "var(--td-color-success)" : "var(--td-color-danger)"}">${u}</strong></div>`;
  }).join("");
  return `<div class="td-chart__sparks">${a}</div><div class="td-chart__table"><div><span>Categoría</span><span>Ene–Sep</span><span>Sep</span><span>Var.</span></div>${s}</div>`;
}
function Ar(e) {
  const t = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"], a = Array.from({ length: 12 }, (p, m) => 8 + m), n = (p, m) => {
    const h = p < 5 ? 1 : p === 5 ? 0.55 : 0.15, g = Math.exp(-((m - 10.5) ** 2) / 3) + Math.exp(-((m - 16) ** 2) / 4) * 0.8;
    return Math.round((6 + g * 38) * h * (1 + (p * 7 + m * 3) % 5 / 12));
  }, s = t.map((p, m) => a.map((h) => n(m, h))), o = Math.max(...s.flat()), r = a.map((p, m) => s.reduce((h, g) => h + g[m], 0)), i = s.map((p) => p.reduce((m, h) => m + h, 0)), c = [
    ["Hora punta", `${a[r.indexOf(Math.max(...r))]}:00`],
    ["Día con más pedidos", t[i.indexOf(Math.max(...i))]],
    ["Total semana", `${i.reduce((p, m) => p + m, 0).toLocaleString("es-CL")} pedidos`]
  ], l = a.map((p) => `<span>${String(p).padStart(2, "0")}:00</span>`).join(""), d = t.map((p, m) => `<span class="td-chart__day">${p}</span>${a.map((h, g) => {
    const f = s[m][g], b = f / o, v = e.hHov && e.hHov[0] === m && e.hHov[1] === g;
    return `<button type="button" data-ch-heat="${m}-${g}" style="background:color-mix(in srgb, var(--td-color-primary) ${Math.round(6 + b * 94)}%, var(--td-color-surface));color:${b > 0.55 ? "#fff" : "var(--td-color-text)"};box-shadow:${v ? "inset 0 0 0 2px var(--td-color-text)" : "none"}" aria-label="${p} ${h}:00 · ${f} pedidos">${f}</button>`;
  }).join("")}`).join(""), u = e.hHov ? `${t[e.hHov[0]]} ${a[e.hHov[1]]}:00–${a[e.hHov[1]] + 1}:00 · ${s[e.hHov[0]][e.hHov[1]]} pedidos` : "Pasa el mouse sobre una celda";
  return `<div class="td-chart__kpis">${c.map(([p, m]) => `<div><span>${p}</span><strong>${m}</strong></div>`).join("")}</div>
        <strong class="td-chart__title">Pedidos por día y hora · última semana</strong>
        <div class="td-chart__heat" role="grid" aria-label="Pedidos por día y hora"><span></span>${l}${d}</div>
        <div class="td-chart__scale"><span>0</span><i></i><span>${o}</span><p role="status">${u}</p></div>`;
}
function Rn(e, t) {
  const a = e.dataset.kind || "chline", n = a === "chline" || a === "chcol" || a === "chpie" || !a;
  if (t.model) {
    if (!n && a !== "chline") {
      e.innerHTML = jn(t);
      return;
    }
  } else {
    const o = $r(a, t.advHov, t.spc);
    if (o) {
      e.innerHTML = o;
      return;
    }
  }
  const s = a === "chcol" ? jn(t) : a === "chpie" ? Er(t) : a === "chscatter" ? Mr(t) : a === "chgauge" ? kr(t) : a === "chspark" ? _r(t) : a === "chheat" ? Ar(t) : wr(t);
  e.innerHTML = s;
}
function qr(e, t, a) {
  const n = e.getBoundingClientRect(), s = (t.clientX - n.left) / n.width * Ja;
  return Math.max(0, Math.min(a - 1, Math.round((s - dt) / (qt / (a - 1)))));
}
function Cr() {
  let e = 7;
  const t = () => (e = (e * 9301 + 49297) % 233280) / 233280;
  return {
    lType: "area",
    smooth: !0,
    markers: !0,
    hidden: [],
    hov: null,
    cOri: "v",
    cMode: "group",
    target: !1,
    pDonut: !0,
    pHov: null,
    sHid: [],
    sHov: null,
    sTrend: !0,
    g: 78,
    kHov: null,
    hHov: null,
    advHov: null,
    model: null,
    source: "",
    spc: er(),
    points: Array.from({ length: 48 }, (a, n) => {
      const s = n % 3, o = Math.round(60 + t() * 1900), r = Math.max(0.5, Math.round((0.8 + o / 900 + (s === 2 ? -0.6 : s === 0 ? 0.5 : 0) + (t() - 0.5) * 1.6) * 10) / 10);
      return { id: n, c: s, val: o, dias: r, u: Math.round(1 + t() * 24), oc: `OC-${String(480 + n).padStart(5, "0")}` };
    })
  };
}
const Dn = /* @__PURE__ */ new WeakMap();
function Tr(e = document) {
  e.querySelectorAll("td-chart").forEach((t) => {
    const a = Dn.get(t), n = t.dataset.model || "";
    if (a) {
      a.source !== n && (a.source = n, a.model = Pn(n), Rn(t, a));
      return;
    }
    const s = Cr();
    s.source = n, s.model = Pn(n), Dn.set(t, s);
    const o = () => Rn(t, s);
    t.addEventListener("click", (r) => {
      const c = (r.target instanceof Element ? r.target : null)?.closest("button");
      if (!(c instanceof HTMLButtonElement) || !t.contains(c))
        return;
      const l = c.dataset.chKey, d = c.dataset.chValue;
      if (l === "lType" && (d === "line" || d === "area" || d === "step"))
        s.lType = d;
      else if (l === "cOri" && (d === "v" || d === "h"))
        s.cOri = d;
      else if (l === "cMode" && (d === "group" || d === "stack" || d === "pct"))
        s.cMode = d;
      else if (l === "pDonut")
        s.pDonut = d === "donut";
      else if (c.dataset.chToggle) {
        const u = c.dataset.chToggle;
        u === "smooth" && (s.smooth = !s.smooth), u === "markers" && (s.markers = !s.markers), u === "target" && (s.target = !s.target), u === "sTrend" && (s.sTrend = !s.sTrend);
      } else if (c.dataset.chLegend) {
        const u = c.dataset.chLegend;
        s.hidden = s.hidden.includes(u) ? s.hidden.filter((p) => p !== u) : [...s.hidden, u];
      } else if (c.dataset.chChannel) {
        const u = c.dataset.chChannel;
        s.sHid = s.sHid.includes(u) ? s.sHid.filter((p) => p !== u) : [...s.sHid, u];
      } else if (c.dataset.chExport === "ventas") {
        const u = Qa(s), p = re(s);
        Bn("ventas-por-categoria", [["Mes", ...u.map((m) => m[0])], ...p.map((m, h) => [m, ...u.map((g) => g[1][h] ?? 0)])]);
        return;
      } else if (c.dataset.chExport === "pie") {
        const u = s.model ? re(s).map((m, h) => [m, s.model?.series[0]?.[1][h] ?? 0]) : [["Quilicura", 128], ["Concepción", 64], ["Antofagasta", 55], ["Puerto Montt", 34], ["En tránsito", 24]], p = u.reduce((m, h) => m + h[1], 0);
        Bn("stock-por-bodega", [["Bodega", "Valor (M)", "%"], ...u.map((m) => [m[0], m[1], Math.round(m[1] / p * 100)])]);
        return;
      } else if (c.dataset.chSim !== void 0)
        s.g = Math.round(35 + Math.random() * 64);
      else if (c.dataset.chHeat) {
        const [u, p] = c.dataset.chHeat.split("-").map(Number);
        s.hHov = [u, p];
      }
      o();
    }), t.addEventListener("input", (r) => {
      const i = r.target;
      i instanceof HTMLInputElement && i.matches("[data-ch-gauge]") && (s.g = Number(i.value), o());
    }), t.addEventListener("mousemove", (r) => {
      const i = r.target instanceof Element ? r.target.closest("[data-ch-plot]") : null;
      if (i instanceof SVGSVGElement && (t.dataset.kind === "chline" || !t.dataset.kind)) {
        const l = qr(i, r, re(s).length);
        l !== s.hov && (s.hov = l, o());
      }
      const c = r.target instanceof Element ? r.target.closest("[data-ch-spark]") : null;
      if (c instanceof SVGSVGElement) {
        const l = c.getBoundingClientRect(), d = Number(c.dataset.chSpark), u = Math.max(0, Math.min(11, Math.round((r.clientX - l.left) / l.width * 11)));
        (!s.kHov || s.kHov[0] !== d || s.kHov[1] !== u) && (s.kHov = [d, u], o());
      }
    }), t.addEventListener("mouseover", (r) => {
      const i = r.target instanceof Element ? r.target : null, c = i?.closest("[data-ch-col]");
      if (c instanceof SVGElement) {
        const m = Number(c.dataset.chCol);
        s.hov !== m && (s.hov = m, o());
      }
      const l = i?.closest("[data-ch-pie]");
      if (l instanceof Element) {
        const m = Number(l.dataset.chPie);
        s.pHov !== m && (s.pHov = m, o());
      }
      const d = i?.closest("[data-ch-point]");
      if (d instanceof Element) {
        const m = Number(d.dataset.chPoint);
        s.sHov !== m && (s.sHov = m, o());
      }
      const u = i?.closest("[data-ch-heat]");
      if (u instanceof HTMLElement) {
        const [m, h] = (u.dataset.chHeat ?? "0-0").split("-").map(Number);
        (!s.hHov || s.hHov[0] !== m || s.hHov[1] !== h) && (s.hHov = [m, h], o());
      }
      const p = i?.closest("[data-ch-hov]");
      if (p instanceof Element) {
        const m = p.dataset.chHov ?? "";
        s.advHov !== m && (s.advHov = m, o());
      }
    }), t.addEventListener("mouseleave", () => {
      s.hov = null, s.pHov = null, s.sHov = null, s.kHov = null, s.hHov = null, s.advHov = null, o();
    }), o();
  });
}
const tn = [
  { id: 1, code: "BR-4521-AD", name: "Pastilla de freno delantera", brand: "Volvo", app: "Volvo FH 460", cat: "Frenos", stock: 42, price: 189990 },
  { id: 2, code: "SU-1180-KT", name: "Amortiguador de cabina", brand: "Scania", app: "Scania R450", cat: "Suspensión", stock: 8, price: 246500 },
  { id: 3, code: "MT-7702-FL", name: "Filtro de aceite", brand: "Mercedes-Benz", app: "Mercedes-Benz Actros 2651", cat: "Motor", stock: 120, price: 24990 },
  { id: 4, code: "EL-3310-AL", name: "Alternador 24V 110A", brand: "Freightliner", app: "Freightliner Cascadia", cat: "Eléctrico", stock: 0, price: 612e3 },
  { id: 5, code: "TR-5049-EM", name: "Kit de embrague 430 mm", brand: "International", app: "International LT 625", cat: "Transmisión", stock: 5, price: 1089990 },
  { id: 6, code: "BR-4609-DS", name: "Disco de freno ventilado", brand: "Mercedes-Benz", app: "Mercedes-Benz O500 RS", cat: "Frenos", stock: 16, price: 158400 },
  { id: 7, code: "SU-2231-BL", name: "Bolsa de aire suspensión", brand: "Volvo", app: "Volvo B12R", cat: "Suspensión", stock: 27, price: 132750 },
  { id: 8, code: "MT-8840-TB", name: "Turbocompresor", brand: "Scania", app: "Scania K410", cat: "Motor", stock: 3, price: 149e4 },
  { id: 9, code: "EL-1024-MA", name: "Motor de arranque 24V", brand: "Hino", app: "Hino 500 FM", cat: "Eléctrico", stock: 11, price: 398900 },
  { id: 10, code: "MT-3301-BA", name: "Bomba de agua", brand: "Kenworth", app: "Kenworth T880", cat: "Motor", stock: 19, price: 214300 },
  { id: 11, code: "CA-7710-ES", name: "Espejo retrovisor calefaccionado", brand: "Volvo", app: "Volvo FH 540", cat: "Carrocería", stock: 34, price: 96500 },
  { id: 12, code: "BR-5512-VA", name: "Válvula relé de freno", brand: "MAN", app: "MAN TGX 18.480", cat: "Frenos", stock: 9, price: 87400 },
  { id: 13, code: "TR-2208-CR", name: "Cruceta de cardán", brand: "Iveco", app: "Iveco Stralis", cat: "Transmisión", stock: 48, price: 45900 },
  { id: 14, code: "SU-6603-BR", name: "Barra estabilizadora", brand: "Mercedes-Benz", app: "Mercedes-Benz O500 U", cat: "Suspensión", stock: 6, price: 312e3 },
  { id: 15, code: "EL-4450-FA", name: "Faro LED delantero", brand: "Scania", app: "Scania Serie S", cat: "Eléctrico", stock: 22, price: 278600 },
  { id: 16, code: "MT-1190-IN", name: "Inyector diésel", brand: "Volvo", app: "Volvo D13", cat: "Motor", stock: 0, price: 529e3 },
  { id: 17, code: "CA-3320-PA", name: "Parachoques delantero", brand: "International", app: "International HX 620", cat: "Carrocería", stock: 2, price: 684500 },
  { id: 18, code: "BR-7781-TA", name: "Tambor de freno trasero", brand: "Hino", app: "Hino Dutro", cat: "Frenos", stock: 14, price: 171200 },
  { id: 19, code: "TR-9902-SI", name: "Sincronizador 3ª/4ª", brand: "Scania", app: "Scania GRS905", cat: "Transmisión", stock: 7, price: 143800 },
  { id: 20, code: "SU-4417-RE", name: "Resorte de hoja delantero", brand: "Kenworth", app: "Kenworth W900", cat: "Suspensión", stock: 13, price: 256700 },
  { id: 21, code: "EL-8812-SE", name: "Sensor ABS de rueda", brand: "Mercedes-Benz", app: "Mercedes-Benz Citaro", cat: "Eléctrico", stock: 64, price: 38900 },
  { id: 22, code: "MT-5520-RA", name: "Radiador de aluminio", brand: "MAN", app: "MAN Lion's City", cat: "Motor", stock: 4, price: 896e3 },
  { id: 23, code: "CA-1150-LI", name: "Limpiaparabrisas 1000 mm", brand: "Volvo", app: "Volvo B8R", cat: "Carrocería", stock: 85, price: 18900 },
  { id: 24, code: "BR-3390-CA", name: "Caliper de freno", brand: "Iveco", app: "Iveco Crossway", cat: "Frenos", stock: 10, price: 368400 }
], wt = tn, rt = [
  "linear-gradient(135deg,#3A4047,#15181B)",
  "linear-gradient(135deg,#4B5158,#1F2327)",
  "linear-gradient(135deg,#2B3036,#0A0B0C)",
  "linear-gradient(135deg,#5A6168,#2B3036)",
  "linear-gradient(135deg,#33383D,#0A0B0C)",
  "linear-gradient(135deg,#6E757D,#33383D)"
], Bt = [
  [5, "Carlos M.", "Transportes del Sur", "Duración excelente, 60.000 km y siguen bien. Sin ruido al frenar.", 18, 2],
  [4, "Paula R.", "Taller Maipú", "Buen producto, la instalación fue simple. El sensor vino aparte.", 9, 5],
  [5, "Jorge S.", "Buses Andinos", "Compramos 40 juegos para la flota, llegaron al día siguiente.", 24, 8],
  [3, "Ana V.", "Particular", "Cumple, pero frenan algo menos en frío que las originales anteriores.", 4, 12],
  [5, "Luis T.", "Minera Los Robles", "Aguantan bien el polvo de faena. Recomendadas.", 12, 20],
  [2, "Diego F.", "Particular", "Llegaron con la caja dañada, aunque las pastillas estaban bien.", 2, 30],
  [4, "Marcela P.", "Frío Norte", "Precio razonable por volumen. Atención rápida del asesor.", 6, 41]
], We = 15e4, vt = /* @__PURE__ */ new WeakMap(), In = /* @__PURE__ */ new WeakSet();
function F(e) {
  return `$ ${Math.round(e).toLocaleString("es-CL")}`;
}
function T(e) {
  return e.replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t] ?? t);
}
function Vt(e, t) {
  return (t?.parts ?? tn).find((a) => a.id === e);
}
function Ht(e, t) {
  return e.parts[t] ?? e.parts[0] ?? { id: 0, code: "", name: "Sin productos", brand: "", app: "", cat: "", stock: 0, price: 0 };
}
function Ms(e) {
  return [0, 15, 0, 20, 0, 10, 25, 0][e.id % 8];
}
function Qt(e) {
  return Math.round(e.price * (1 - Ms(e) / 100));
}
function Ft(e) {
  return 3.6 + e.id * 37 % 14 / 10;
}
function Ls(e) {
  return 12 + e.id * 53 % 180;
}
function la(e) {
  return e === 0 ? ["Agotado", "var(--td-color-danger)"] : e <= 10 ? [`Pocas unidades · ${e}`, "var(--td-color-warning)"] : ["En stock", "var(--td-color-success)"];
}
function na(e) {
  const t = Math.round(e * 2) / 2;
  return Array.from({ length: 5 }, (a, n) => `<i class="td-ecom__star" style="--fill:${n + 1 <= t ? 1 : n + 0.5 === t ? 0.5 : 0}" aria-hidden="true"></i>`).join("");
}
function Fn(e = "ecard") {
  return {
    cart: [{ id: 1, qty: 2 }, { id: 4, qty: 1 }],
    wish: [3],
    cmp: [1, 2, 5],
    cmpDiff: !1,
    layout: "grid",
    coupon: "",
    couponOk: !1,
    pv: { side: "del", q: "orig", qty: 1, img: 0 },
    step: 0,
    co: { name: "", mail: "", rut: "", addr: "", ship: "std", pay: "card", tried: !1 },
    f: { brand: [], cat: [], stock: !1, max: 0 },
    sort: "rel",
    q: "",
    qOpen: !1,
    qHi: -1,
    recentQ: ["pastilla volvo", "filtro aceite scania"],
    rf: 0,
    rs: "new",
    votes: {},
    rv: { open: !1, stars: 0, text: "", tried: !1 },
    pf: { brand: "", model: "", year: "", sys: "", plate: "", tab: "veh", done: !1 },
    quote: [],
    quoteNote: "",
    quoteSent: !1,
    bulkText: "",
    bulkRows: null,
    recent: [7, 3, 9, 2, 5],
    stockSubs: {},
    lists: [{ id: "l1", name: "Flota Volvo", items: [1, 4] }, { id: "l2", name: "Bahía 2", items: [3] }],
    newList: "",
    fbtOff: {},
    storeQ: "",
    rmaStep: 0,
    rma: { item: null, reason: "", method: "refund", tried: !1 },
    paid: [],
    msg: "",
    timer: 0,
    flashEnd: Date.now() + (5 * 3600 + 1380 + 41) * 1e3,
    kind: e,
    parts: tn,
    source: "",
    drawer: e === "ecart"
  };
}
function je(e) {
  return e.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function en(e) {
  const t = e.cart.reduce((s, o) => {
    const r = Vt(o.id, e);
    return r ? s + Qt(r) * o.qty : s;
  }, 0), a = e.couponOk ? Math.round(t * 0.1) : 0, n = t - a >= We || !t ? 0 : 6990;
  return { sub: t, off: a, ship: n, total: t - a + n, qty: e.cart.reduce((s, o) => s + o.qty, 0) };
}
function Ae(e, t) {
  const a = Ms(e), [n, s] = la(e.stock), o = t.wish.includes(e.id), r = t.cmp.includes(e.id);
  return `<article class="td-ecom__card ${t.layout === "list" ? "is-list" : ""}">
        <div class="td-ecom__media" style="background:${rt[e.id % rt.length]}">
            <span>${T(e.cat)}</span>
            ${a ? `<b class="td-ecom__flag">-${a}%</b>` : ""}
            ${e.id % 5 === 2 ? '<b class="td-ecom__flag is-new">Nuevo</b>' : ""}
            ${e.id % 7 === 1 ? '<b class="td-ecom__flag is-best">Más vendido</b>' : ""}
        </div>
        <div class="td-ecom__body">
            <small>${T(e.brand)} · ${T(e.code)}</small>
            <strong>${T(e.name)}</strong>
            <span class="td-ecom__stars" aria-label="${Ft(e).toFixed(1).replace(".", ",")} de 5">${na(Ft(e))}<em>${Ft(e).toFixed(1).replace(".", ",")} (${Ls(e)})</em></span>
            <span class="td-ecom__stock" style="color:${s}">${n}</span>
            <p class="td-ecom__price"><b>${F(Qt(e))}</b>${a ? `<s>${F(e.price)}</s>` : ""}</p>
            <div class="td-ecom__acts">
                <button type="button" data-ec="add:${e.id}" ${e.stock ? "" : "disabled"}>Agregar al carrito</button>
                <button type="button" data-ec="wish:${e.id}" aria-pressed="${o}" aria-label="${o ? "Quitar de favoritos" : "Agregar a favoritos"}">${o ? "En favoritos" : "Favorito"}</button>
                <button type="button" data-ec="cmp:${e.id}" aria-pressed="${r}">${r ? "En comparación" : "Comparar"}</button>
            </div>
        </div>
    </article>`;
}
function Hr(e, t) {
  const a = Nr(e, t);
  return `<p class="td-ecom__msg" role="status">${T(t.msg || " ")}</p>${a}`;
}
function Nr(e, t) {
  switch (e) {
    case "ecard":
      return On(t);
    case "edetail":
      return Pr(t);
    case "ecart":
      return Br(t);
    case "echeckout":
      return jr(t);
    case "efacets":
      return Rr(t);
    case "esearch":
      return Dr(t);
    case "ecompare":
      return Ir(t);
    case "eflash":
      return Or(t);
    case "ereviews":
      return zr(t);
    case "efinder":
      return Vr(t);
    case "equote":
      return Ur(t);
    case "ebulk":
      return Wr(t);
    case "erecent":
      return Gr(t);
    case "estock":
      return Kr(t);
    case "ewishmulti":
      return Jr(t);
    case "etrack":
      return Qr(t);
    case "efbt":
      return Zr(t);
    case "elocator":
      return Xr(t);
    case "ecredit":
      return Yr(t);
    case "ereturns":
      return ti(t);
    default:
      return On(t);
  }
}
function On(e) {
  const t = en(e);
  return `<div class="td-ecom__bar">
        <div class="td-ecom__seg" role="group" aria-label="Disposición">
            <button type="button" data-ec="layout:grid" aria-pressed="${e.layout === "grid"}">Grilla</button>
            <button type="button" data-ec="layout:list" aria-pressed="${e.layout === "list"}">Lista</button>
        </div>
        <span>Favoritos ${e.wish.length} · Comparar ${e.cmp.length} · Carrito ${t.qty}</span>
    </div>
    <div class="td-ecom__grid ${e.layout === "list" ? "is-list" : ""}">${e.parts.slice(0, 8).map((a) => Ae(a, e)).join("")}</div>`;
}
function Pr(e) {
  const t = Ht(e, 0), a = e.pv.q === "orig" ? 1 : e.pv.q === "alt" ? 0.72 : 0.55, n = Math.round(t.price * a), s = [[1, 0], [5, 5], [10, 10], [20, 15]], o = [...s].reverse().find((u) => e.pv.qty >= u[0]) ?? s[0], r = Math.round(n * (1 - o[1] / 100)), i = t.code + (e.pv.side === "tra" ? "-T" : "") + (e.pv.q === "orig" ? "" : e.pv.q === "alt" ? "-A" : "-E"), c = ["Vista frontal", "Vista lateral", "Detalle del material", "En el eje"], l = [["orig", "Original", "Garantía 12 meses"], ["alt", "Alternativa", "Garantía 6 meses"], ["eco", "Económica", "Garantía 3 meses"]], d = [["Quilicura", 42, "Hoy"], ["Concepción", 8, "Mañana"], ["Antofagasta", 0, "3–5 días"]];
  return `<div class="td-ecom__detail">
        <div>
            <div class="td-ecom__hero" style="background:${rt[(t.id + e.pv.img) % rt.length]}">${c[e.pv.img]}</div>
            <div class="td-ecom__thumbs">${c.map((u, p) => `<button type="button" data-ec="img:${p}" aria-pressed="${e.pv.img === p}" style="background:${rt[(t.id + p) % rt.length]}">${u}</button>`).join("")}</div>
        </div>
        <div class="td-ecom__buy">
            <small>${T(t.brand)} · ${T(i)}</small>
            <h2>${T(t.name)}</h2>
            <span class="td-ecom__stars">${na(Ft(t))}<em>${Ft(t).toFixed(1).replace(".", ",")} · ${Ls(t)} reseñas</em></span>
            <p>${T(t.app)}</p>
            <div class="td-ecom__seg" role="group" aria-label="Lado">
                <button type="button" data-ec="side:del" aria-pressed="${e.pv.side === "del"}">Delantera</button>
                <button type="button" data-ec="side:tra" aria-pressed="${e.pv.side === "tra"}">Trasera</button>
            </div>
            <div class="td-ecom__quals">${l.map(([u, p, m]) => `<button type="button" data-ec="qual:${u}" aria-pressed="${e.pv.q === u}"><b>${p}</b><span>${m}</span><em>${F(Math.round(t.price * (u === "orig" ? 1 : u === "alt" ? 0.72 : 0.55)))}</em></button>`).join("")}</div>
            <div class="td-ecom__tiers">${s.map(([u, p]) => `<span class="${o[0] === u ? "is-on" : ""}">${u}+ u. · ${p ? `−${p}%` : "Base"}</span>`).join("")}</div>
            <p class="td-ecom__price"><b>${F(r)}</b>${o[1] ? `<s>${F(n)}</s><em>${o[1]}% por volumen</em>` : ""}</p>
            <div class="td-ecom__qty">
                <button type="button" data-ec="pd:-1" aria-label="Disminuir cantidad">−</button>
                <input data-ec-in="pd" inputmode="numeric" value="${e.pv.qty}" aria-label="Cantidad">
                <button type="button" data-ec="pd:1" aria-label="Aumentar cantidad">+</button>
                <strong>Total ${F(r * e.pv.qty)}</strong>
            </div>
            <div class="td-ecom__acts">
                <button type="button" data-ec="addpd">Agregar al carrito</button>
                <button type="button" data-ec="buy">Comprar ahora · ${F(r * e.pv.qty)}</button>
            </div>
            <ul class="td-ecom__stores">${d.map(([u, p, m]) => {
    const [h, g] = la(p);
    return `<li><b>${u}</b><span style="color:${g}">${p ? `${p} u. · ${h}` : "Sin stock"}</span><small>${p ? `Retiro ${m.toLowerCase()}` : `Traslado ${m}`}</small></li>`;
  }).join("")}</ul>
        </div>
    </div>`;
}
function Br(e) {
  const t = en(e), a = e.cart.map((o) => ({ line: o, part: Vt(o.id, e) })).filter((o) => o.part), n = Math.max(0, We - (t.sub - t.off)), s = e.parts.filter((o) => o.stock > 0 && !e.cart.some((r) => r.id === o.id)).slice(0, 3);
  return `<div class="td-ecom__cart ${e.drawer ? "is-open" : ""}">
        <button type="button" data-ec="drawer">${e.drawer ? "Cerrar carrito" : `Abrir carrito · ${t.qty} productos`}</button>
        <aside class="td-ecom__drawer" ${e.drawer ? "" : "hidden"} aria-label="Carrito">
            <header><strong>${t.qty} ${t.qty === 1 ? "producto" : "productos"}</strong><button type="button" data-ec="drawer">Cerrar</button></header>
            ${a.length ? `<ul>${a.map(({ line: o, part: r }) => `<li>
                <i style="background:${rt[r.id % rt.length]}"></i>
                <div><b>${T(r.name)}</b><small>${T(r.code)} · ${F(Qt(r))}</small></div>
                <div class="td-ecom__qty">
                    <button type="button" data-ec="line:${o.id}:-1" ${o.qty <= 1 ? "disabled" : ""} aria-label="Disminuir">−</button>
                    <span>${o.qty}</span>
                    <button type="button" data-ec="line:${o.id}:1" ${o.qty >= r.stock ? "disabled" : ""} aria-label="Aumentar">+</button>
                </div>
                <b>${F(Qt(r) * o.qty)}</b>
                <button type="button" data-ec="rm:${o.id}" aria-label="Quitar ${T(r.name)}">Quitar</button>
            </li>`).join("")}</ul>` : "<p>El carrito está vacío. Agrega un repuesto para continuar.</p>"}
            <div class="td-ecom__ship"><span style="width:${Math.min(100, Math.round((t.sub - t.off) / We * 100))}%"></span></div>
            <p>${t.sub - t.off >= We ? "Tienes despacho gratis" : `Te faltan ${F(n)} para despacho gratis`}</p>
            <label>Cupón <input data-ec-in="coupon" value="${T(e.coupon)}" placeholder="FLOTA10" aria-label="Cupón"></label>
            <button type="button" data-ec="coupon">${e.couponOk ? "Cupón FLOTA10 aplicado · 10%" : "Aplicar cupón"}</button>
            <dl>
                <dt>Subtotal</dt><dd>${F(t.sub)}</dd>
                ${t.off ? `<dt>Descuento</dt><dd>− ${F(t.off)}</dd>` : ""}
                <dt>Despacho</dt><dd>${t.ship ? F(t.ship) : "Gratis"}</dd>
                <dt>Total</dt><dd><b>${F(t.total)}</b></dd>
            </dl>
            <button type="button" data-ec="go-check" ${a.length ? "" : "disabled"}>Ir a pagar · ${F(t.total)}</button>
            <div class="td-ecom__cross">${s.map((o) => `<button type="button" data-ec="add:${o.id}"><i style="background:${rt[o.id % rt.length]}"></i>${T(o.name)}<b>${F(o.price)}</b></button>`).join("")}</div>
        </aside>
    </div>`;
}
function Re(e, t, a, n) {
  return `<label>${t}<input data-ec-in="${e}" value="${T(a)}" aria-invalid="${n ? "true" : "false"}" aria-describedby="${n ? e + "-err" : ""}">${n ? `<small id="${e}-err">${n}</small>` : ""}</label>`;
}
function jr(e) {
  const t = en(e), a = e.co, n = {
    name: a.name.trim().length < 3 ? "Ingresa nombre o razón social" : "",
    mail: /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(a.mail) ? "" : "Correo no válido",
    rut: /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/.test(a.rut.trim()) ? "" : "Formato 76.482.190-3",
    addr: a.addr.trim().length < 6 ? "Ingresa la dirección de despacho" : ""
  }, s = a.tried ? n : { name: "", mail: "", rut: "", addr: "" }, o = [
    ["std", "Estándar", "24–48 h hábiles", t.ship],
    ["exp", "Express", "Hoy antes de las 19:00", 9990],
    ["pick", "Retiro en bodega", "Quilicura · hoy", 0]
  ], r = o.find((d) => d[0] === a.ship)?.[3] ?? 0, i = t.sub - t.off + r, c = ["Datos", "Despacho", "Pago", "Confirmación"], l = { card: "Tarjeta", transfer: "Transferencia", credit: "Crédito de flota" }[a.pay];
  return `<ol class="td-ecom__steps">${c.map((d, u) => `<li class="${u === e.step ? "is-on" : ""} ${u < e.step ? "is-done" : ""}"><b>${u < e.step ? "✓" : u + 1}</b>${d}</li>`).join("")}</ol>
        ${e.step === 0 ? `<div class="td-ecom__form">${Re("name", "Nombre o razón social", a.name, s.name)}${Re("mail", "Correo", a.mail, s.mail)}${Re("rut", "RUT", a.rut, s.rut)}</div>` : ""}
        ${e.step === 1 ? `<div class="td-ecom__form">${Re("addr", "Dirección de despacho", a.addr, s.addr)}<div class="td-ecom__choices">${o.map(([d, u, p, m]) => `<button type="button" data-ec="ship:${d}" aria-pressed="${a.ship === d}"><b>${u}</b><span>${p}</span><em>${m ? F(m) : "Gratis"}</em></button>`).join("")}</div></div>` : ""}
        ${e.step === 2 ? `<div class="td-ecom__choices">${[["card", "Tarjeta de crédito o débito"], ["transfer", "Transferencia bancaria"], ["credit", "Crédito de flota a 30 días"]].map(([d, u]) => `<button type="button" data-ec="pay:${d}" aria-pressed="${a.pay === d}">${u}</button>`).join("")}</div>` : ""}
        ${e.step === 3 ? `<div class="td-ecom__done"><h2>Pedido OC-2026-0${500 + t.qty}</h2><p>${o.find((d) => d[0] === a.ship)?.[1]} · ${o.find((d) => d[0] === a.ship)?.[2]}</p><p>${l} · ${F(i)}</p><p>Te enviaremos la guía a ${T(a.mail || "tu correo")}.</p><button type="button" data-ec="restart">Hacer otro pedido</button></div>` : ""}
        ${e.step < 3 ? `<div class="td-ecom__nav">${e.step ? '<button type="button" data-ec="back">Volver</button>' : "<span></span>"}<button type="button" data-ec="next">${e.step === 2 ? `Pagar ${F(i)}` : "Continuar"}</button></div>` : ""}`;
}
function Rr(e) {
  const t = Math.max(1, ...e.parts.map((l) => l.price)), a = e.f.max || t, n = (l, d) => (d === "brand" || !e.f.brand.length || e.f.brand.includes(l.brand)) && (d === "cat" || !e.f.cat.length || e.f.cat.includes(l.cat)) && (!e.f.stock || l.stock > 0) && l.price <= a, s = (l, d) => d.map((u) => {
    const p = e.f[l].includes(u), m = e.parts.filter((h) => h[l] === u && n(h, l)).length;
    return `<label class="${!m && !p ? "is-off" : ""}"><input type="checkbox" data-ec="facet:${l}:${encodeURIComponent(u)}" ${p ? "checked" : ""} ${!m && !p ? "disabled" : ""}>${T(u)} <em>${m}</em></label>`;
  }).join(""), o = [...new Set(e.parts.map((l) => l.brand))].sort(), r = [...new Set(e.parts.map((l) => l.cat))];
  let i = e.parts.filter((l) => n(l));
  i = [...i].sort(e.sort === "lo" ? (l, d) => l.price - d.price : e.sort === "hi" ? (l, d) => d.price - l.price : e.sort === "rate" ? (l, d) => Ft(d) - Ft(l) : (l, d) => l.id - d.id);
  const c = [
    ...e.f.brand.map((l) => ["brand", l]),
    ...e.f.cat.map((l) => ["cat", l]),
    ...e.f.stock ? [["stock", "Con stock"]] : [],
    ...e.f.max && e.f.max < t ? [["max", `Hasta ${F(e.f.max)}`]] : []
  ];
  return `<div class="td-ecom__facets">
        <aside>
            <h3>Marca</h3>${s("brand", o)}
            <h3>Categoría</h3>${s("cat", r)}
            <label class="td-ecom__switch"><input type="checkbox" data-ec="fstock" ${e.f.stock ? "checked" : ""}>Solo con stock</label>
            <label>Hasta ${F(a)}<input type="range" data-ec-in="max" min="20000" max="${t}" step="1000" value="${a}"></label>
            <button type="button" data-ec="clearf">Limpiar filtros</button>
        </aside>
        <div>
            <div class="td-ecom__bar">
                <span>${i.length} ${i.length === 1 ? "resultado" : "resultados"}</span>
                <label>Orden <select data-ec-ch="sort" aria-label="Orden">
                    ${[["rel", "Relevancia"], ["lo", "Menor precio"], ["hi", "Mayor precio"], ["rate", "Mejor calificados"]].map(([l, d]) => `<option value="${l}" ${e.sort === l ? "selected" : ""}>${d}</option>`).join("")}
                </select></label>
            </div>
            <div class="td-ecom__chips">${c.map(([l, d]) => `<button type="button" data-ec="chip:${l}:${encodeURIComponent(d)}">${T(d)} · quitar</button>`).join("")}</div>
            ${i.length ? `<div class="td-ecom__grid">${i.slice(0, 9).map((l) => Ae(l, e)).join("")}</div>` : "<p>Ningún repuesto coincide con estos filtros. Quita uno para ver más.</p>"}
        </div>
    </div>`;
}
function Dr(e) {
  const t = je(e.q.trim()), a = t.length >= 2 ? e.parts.filter((r) => je(`${r.name} ${r.code} ${r.brand}`).includes(t)).slice(0, 5) : [], n = t.length >= 2 ? [...new Set(e.parts.filter((r) => je(`${r.name} ${r.cat}`).includes(t)).map((r) => r.cat))].slice(0, 3) : [], s = t.length >= 2 ? [...new Set(e.parts.map((r) => r.name.toLowerCase()).filter((r) => je(r).includes(t)))].slice(0, 4) : [], o = e.qOpen && (t.length >= 2 || !t);
  return `<div class="td-ecom__search">
        <label>Buscar repuesto<input data-ec-in="q" value="${T(e.q)}" placeholder="Pastilla, filtro, código…" role="combobox" aria-expanded="${o}" aria-autocomplete="list"></label>
        ${e.q ? '<button type="button" data-ec="qclear">Borrar búsqueda</button>' : ""}
        <div class="td-ecom__suggest" ${o ? "" : "hidden"} role="listbox">
            ${t ? "" : e.recentQ.map((r) => `<button type="button" role="option" data-ec="qgo:${encodeURIComponent(r)}">${T(r)}<span data-ec="qrm:${encodeURIComponent(r)}">Quitar</span></button>`).join("")}
            ${s.map((r) => `<button type="button" role="option" data-ec="qgo:${encodeURIComponent(r)}">${T(r)}</button>`).join("")}
            ${n.map((r) => `<button type="button" role="option" data-ec="qgo:${encodeURIComponent(r)}">Categoría · ${T(r)} <em>${e.parts.filter((i) => i.cat === r).length}</em></button>`).join("")}
            ${a.map((r) => {
    const [i, c] = la(r.stock);
    return `<button type="button" role="option" data-ec="qgo:${encodeURIComponent(r.name)}"><i style="background:${rt[r.id % rt.length]}"></i><span><b>${T(r.name)}</b><small>${T(r.code)} · ${F(Qt(r))}</small></span><em style="color:${c}">${i}</em></button>`;
  }).join("")}
            ${t.length >= 2 && !s.length && !a.length ? "<p>Sin coincidencias. Prueba con el código o la marca.</p>" : ""}
        </div>
        <div class="td-ecom__chips">${["Pastillas de freno", "Filtro de aire", "Amortiguador", "Kit de embrague"].map((r) => `<button type="button" data-ec="qpop:${encodeURIComponent(r)}">${r}</button>`).join("")}</div>
    </div>`;
}
function Ir(e) {
  const t = e.cmp.map((o) => Vt(o, e)).filter((o) => !!o), n = [
    ["Precio", (o) => Qt(o), "min"],
    ["Marca", (o) => o.brand, ""],
    ["Categoría", (o) => o.cat, ""],
    ["Aplicación", (o) => o.app, ""],
    ["Stock", (o) => o.stock, "max"],
    ["Calificación", (o) => Ft(o), "max"],
    ["Garantía", (o) => o.price > 15e4 ? 12 : 6, "max"],
    ["Despacho", (o) => o.stock > 10 ? "Hoy" : o.stock ? "24 h" : "—", ""]
  ].map(([o, r, i]) => {
    const c = t.map(r), l = c.every((p) => String(p) === String(c[0]));
    if (e.cmpDiff && l) return "";
    const d = c.filter((p) => typeof p == "number"), u = i === "min" ? Math.min(...d) : i === "max" ? Math.max(...d) : null;
    return `<tr class="${l ? "is-same" : ""}"><th>${o}</th>${c.map((p) => `<td class="${u != null && p === u && !l ? "is-best" : ""}">${Fr(o, p)}</td>`).join("")}</tr>`;
  }).join(""), s = e.parts.filter((o) => !e.cmp.includes(o.id)).slice(0, 6);
  return `<div class="td-ecom__bar"><label class="td-ecom__switch"><input type="checkbox" data-ec="diff" ${e.cmpDiff ? "checked" : ""}>Solo diferencias</label><span>${t.length} de 4</span></div>
        <div class="td-ecom__cmphead">${t.map((o) => `<div><button type="button" data-ec="cmpx:${o.id}" aria-label="Quitar ${T(o.name)}">Quitar</button><strong>${T(o.name)}</strong><small>${F(Qt(o))}</small></div>`).join("") || "<p>Agrega productos para comparar. El máximo es 4.</p>"}</div>
        ${t.length ? `<table class="td-ecom__table"><tbody>${n}</tbody></table>` : ""}
        ${e.cmp.length < 4 ? `<div class="td-ecom__chips">${s.map((o) => `<button type="button" data-ec="cmpadd:${o.id}">${T(o.name)}</button>`).join("")}</div>` : ""}`;
}
function Fr(e, t) {
  return e === "Precio" && typeof t == "number" ? F(t) : e === "Stock" ? t ? `${t} u.` : "Agotado" : e === "Calificación" && typeof t == "number" ? `${t.toFixed(1).replace(".", ",")} / 5` : e === "Garantía" ? `${t} meses` : T(String(t));
}
function Or(e) {
  const t = Ht(e, 5), a = Math.max(0, e.flashEnd - Date.now()), n = String(Math.floor(a / 36e5)).padStart(2, "0"), s = String(Math.floor(a % 36e5 / 6e4)).padStart(2, "0"), o = String(Math.floor(a % 6e4 / 1e3)).padStart(2, "0"), r = 26 + Math.floor(Date.now() / 6e4 % 8);
  return `<article class="td-ecom__flash">
        <div class="td-ecom__hero" style="background:${rt[2]}">Oferta relámpago</div>
        <div>
            <small>${T(t.brand)} · ${T(t.code)}</small>
            <h2>${T(t.name)}</h2>
            <p class="td-ecom__price"><b>${F(Math.round(t.price * 0.75))}</b><s>${F(t.price)}</s><em>Ahorras ${F(Math.round(t.price * 0.25))}</em></p>
            <p class="td-ecom__clock" aria-label="Tiempo restante"><b>${n}</b>:<b>${s}</b>:<b>${o}</b></p>
            <div class="td-ecom__ship"><span style="width:${Math.round(r / 40 * 100)}%"></span></div>
            <p>${r} de 40 vendidos · Quedan ${40 - r}</p>
            <button type="button" data-ec="add:${t.id}">Agregar al carrito</button>
        </div>
    </article>
    <div class="td-ecom__grid">${e.parts.slice(8, 12).map((i, c) => `<div>${Ae(i, e)}<small>${[60, 35, 80, 20][c]}% vendido</small></div>`).join("")}</div>`;
}
function zr(e) {
  const t = [5, 4, 3, 2, 1].map((o) => Bt.filter((r) => r[0] === o).length), a = Bt.reduce((o, r) => o + r[0], 0) / Bt.length, n = Bt.map((o, r) => ({ row: o, index: r })).filter(({ row: o }) => !e.rf || o[0] === e.rf).sort((o, r) => e.rs === "new" ? o.row[5] - r.row[5] : e.rs === "help" ? r.row[4] + (e.votes[r.index] ? 1 : 0) - (o.row[4] + (e.votes[o.index] ? 1 : 0)) : e.rs === "hi" ? r.row[0] - o.row[0] : o.row[0] - r.row[0]), s = e.rv.tried && (!e.rv.stars || e.rv.text.trim().length < 10) ? "Elige una calificación y escribe al menos 10 caracteres" : "";
  return `<header class="td-ecom__rvhead">
        <strong>${a.toFixed(1).replace(".", ",")}</strong>
        <span class="td-ecom__stars">${na(a)}</span>
        <p>${Bt.length} reseñas verificadas · ${Math.round(Bt.filter((o) => o[0] >= 4).length / Bt.length * 100)}% lo recomienda</p>
    </header>
    <div class="td-ecom__hist">${t.map((o, r) => {
    const i = 5 - r;
    return `<button type="button" data-ec="rvf:${i}" aria-pressed="${e.rf === i}">${i} estrellas <i style="width:${Math.round(o / Bt.length * 100)}%"></i> ${o}</button>`;
  }).join("")}</div>
    <div class="td-ecom__seg">${[["new", "Recientes"], ["help", "Útiles"], ["hi", "Mejor"], ["lo", "Peor"]].map(([o, r]) => `<button type="button" data-ec="rvs:${o}" aria-pressed="${e.rs === o}">${r}</button>`).join("")}</div>
    ${e.rf ? `<p>Mostrando ${n.length} de ${e.rf} estrellas <button type="button" data-ec="rvclear">Ver todas</button></p>` : ""}
    <ul class="td-ecom__reviews">${n.map(({ row: o, index: r }) => `<li>
        <b aria-hidden="true">${o[1].split(" ").map((i) => i[0]).join("")}</b>
        <div><strong>${T(o[1])}</strong> <small>${T(o[2])} · ${o[5] === 2 ? "Hace 2 días" : `Hace ${o[5]} días`}</small>
        <span class="td-ecom__stars">${na(o[0])}</span><p>${T(o[3])}</p>
        <button type="button" data-ec="vote:${r}" aria-pressed="${!!e.votes[r]}">Útil (${o[4] + (e.votes[r] ? 1 : 0)})</button></div>
    </li>`).join("")}</ul>
    <button type="button" data-ec="rvopen">${e.rv.open ? "Cerrar reseña" : "Escribir reseña"}</button>
    ${e.rv.open ? `<form class="td-ecom__form" data-ec-form="review">
        <div class="td-ecom__seg">${[1, 2, 3, 4, 5].map((o) => `<button type="button" data-ec="rvstar:${o}" aria-pressed="${e.rv.stars === o}" aria-label="${o} estrellas">${o}</button>`).join("")}</div>
        <label>Tu reseña<textarea data-ec-in="rv" maxlength="500">${T(e.rv.text)}</textarea><small>${e.rv.text.length} / 500</small></label>
        ${s ? `<p class="td-ecom__err" role="alert">${s}</p>` : ""}
        <button type="button" data-ec="rvsend">Publicar reseña</button>
    </form>` : ""}`;
}
function Vr(e) {
  const t = e.pf, a = [...new Set(e.parts.map((l) => l.brand))].sort(), n = t.brand ? [...new Set(e.parts.filter((l) => l.brand === t.brand).map((l) => l.app.slice(t.brand.length + 1)))].sort() : [], s = t.model ? ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2016"] : [], o = t.year ? [...new Set(e.parts.filter((l) => l.app === `${t.brand} ${t.model}`).map((l) => l.cat))] : [], r = t.tab === "veh" ? !!t.year : /^[A-Z]{4}-?\d{2}$/.test(t.plate), i = t.done ? e.parts.filter((l) => l.app === `${t.brand} ${t.model}` && (!t.sys || l.cat === t.sys)) : [], c = (l, d) => `<option value="">Elige</option>${l.map((u) => `<option ${u === d ? "selected" : ""}>${T(u)}</option>`).join("")}`;
  return `<div class="td-ecom__seg">
        <button type="button" data-ec="pftab:veh" aria-pressed="${t.tab === "veh"}">Por vehículo</button>
        <button type="button" data-ec="pftab:plate" aria-pressed="${t.tab === "plate"}">Por patente</button>
    </div>
    ${t.tab === "veh" ? `<div class="td-ecom__form">
        <label>Marca<select data-ec-ch="brand">${c(a, t.brand)}</select></label>
        <label>Modelo<select data-ec-ch="model" ${t.brand ? "" : "disabled"}>${c(n, t.model)}</select></label>
        <label>Año<select data-ec-ch="year" ${t.model ? "" : "disabled"}>${c(s, t.year)}</select></label>
        <label>Sistema<select data-ec-ch="sys" ${t.year ? "" : "disabled"}>${c(o, t.sys)}</select></label>
    </div>` : `<label>Patente<input data-ec-in="plate" value="${T(t.plate)}" placeholder="ABCD-12" maxlength="8" aria-label="Patente"></label>`}
    <div class="td-ecom__nav"><button type="button" data-ec="pfgo" ${r ? "" : "disabled"}>Buscar compatibles</button><button type="button" data-ec="pfreset">Limpiar</button></div>
    ${t.done ? `<h3>${T(t.brand)} ${T(t.model)} ${T(t.year)} · ${i.length} ${i.length === 1 ? "repuesto compatible" : "repuestos compatibles"}</h3>${i.length ? `<div class="td-ecom__grid">${i.map((l) => Ae(l, e)).join("")}</div>` : "<p>No hay repuestos para ese sistema. Prueba otro o limpia el sistema.</p>"}` : ""}`;
}
function Ur(e) {
  const t = e.quote.map((s) => ({ line: s, part: Vt(s.id, e) })).filter((s) => s.part), a = t.reduce((s, o) => s + o.line.qty, 0), n = e.parts.filter((s) => !e.quote.some((o) => o.id === s.id)).slice(0, 6);
  return e.quoteSent ? `<div class="td-ecom__done"><h2>Cotización enviada</h2><p>${a} unidades · ${t.length} productos. Un asesor responderá en horario hábil.</p><button type="button" data-ec="qnew">Nueva cotización</button></div>` : `<p>${a} unidades · ${t.length} productos</p>
        ${t.length ? `<ul class="td-ecom__lines">${t.map(({ line: s, part: o }) => `<li><b>${T(o.name)}</b><small>${T(o.code)}</small>
            <div class="td-ecom__qty"><button type="button" data-ec="qq:${s.id}:-1">−</button><span>${s.qty}</span><button type="button" data-ec="qq:${s.id}:1">+</button></div>
            <button type="button" data-ec="qqrm:${s.id}">Quitar</button></li>`).join("")}</ul>` : "<p>Agrega al menos un producto para cotizar.</p>"}
        <div class="td-ecom__chips">${n.map((s) => `<button type="button" data-ec="qadd:${s.id}">${T(s.name)}</button>`).join("")}</div>
        <label>Notas para el asesor<textarea data-ec-in="qnote">${T(e.quoteNote)}</textarea></label>
        <button type="button" data-ec="qsend">Enviar cotización</button>`;
}
function Wr(e) {
  const t = e.bulkRows ?? [], a = t.filter((n) => n.ok).length;
  return `<p>Pega código y cantidad, uno por línea. Ejemplo: BR-4521-AD, 2</p>
        <textarea data-ec-in="bulk" rows="6">${T(e.bulkText)}</textarea>
        <div class="td-ecom__nav"><button type="button" data-ec="bulksample">Cargar ejemplo</button><button type="button" data-ec="bulkparse">Validar líneas</button></div>
        ${e.bulkRows ? `<p>${a} válidas${t.length - a ? ` · ${t.length - a} con error` : ""}</p><ul class="td-ecom__lines">${t.map((n) => `<li><b>${n.ok ? "✓" : "✕"} ${T(n.code)}</b><span>${T(n.name)}</span><em>${n.qty}</em></li>`).join("")}</ul><button type="button" data-ec="bulkok" ${a ? "" : "disabled"}>Agregar ${a} al carrito</button>` : ""}`;
}
function Gr(e) {
  const t = e.recent.map((a) => Vt(a, e)).filter((a) => !!a);
  return `<div class="td-ecom__bar"><span>${t.length} vistos</span><button type="button" data-ec="recentclear" ${t.length ? "" : "disabled"}>Vaciar historial</button></div>
        ${t.length ? `<div class="td-ecom__grid">${t.map((a) => `<div>${Ae(a, e)}<button type="button" data-ec="recentx:${a.id}">Quitar del historial</button></div>`).join("")}</div>` : "<p>Todavía no hay productos vistos.</p>"}`;
}
function Kr(e) {
  return `<ul class="td-ecom__lines">${e.parts.filter((a) => a.stock === 0).slice(0, 6).map((a) => {
    const n = !!e.stockSubs[a.id];
    return `<li><i style="background:${rt[a.id % rt.length]}"></i><div><b>${T(a.name)}</b><small>${T(a.code)} · Agotado</small></div><button type="button" data-ec="sub:${a.id}" aria-pressed="${n}">${n ? "Te avisaremos" : "Avisarme"}</button></li>`;
  }).join("")}</ul>`;
}
function Jr(e) {
  const t = e.parts.filter((a) => !e.lists.some((n) => n.items.includes(a.id))).slice(0, 4);
  return `<form class="td-ecom__nav"><input data-ec-in="list" value="${T(e.newList)}" placeholder="Nombre de la lista" aria-label="Nombre de la lista"><button type="button" data-ec="listadd">Crear lista</button></form>
        <div class="td-ecom__lists">${e.lists.map((a) => `<section><header><h3>${T(a.name)}</h3><span>${a.items.length} ${a.items.length === 1 ? "producto" : "productos"}</span><button type="button" data-ec="listdel:${a.id}">Eliminar lista</button></header>
            ${a.items.length ? `<ul>${a.items.map((n) => Vt(n, e)).filter((n) => !!n).map((n) => `<li><b>${T(n.name)}</b><small>${F(n.price)}</small>
                <select data-ec-ch="move:${a.id}:${n.id}" aria-label="Mover ${T(n.name)}"><option value="">Mover a…</option>${e.lists.filter((s) => s.id !== a.id).map((s) => `<option value="${s.id}">${T(s.name)}</option>`).join("")}</select>
                <button type="button" data-ec="listrm:${a.id}:${n.id}">Quitar</button></li>`).join("")}</ul>` : "<p>Esta lista está vacía.</p>"}
        </section>`).join("")}</div>
        <div class="td-ecom__chips">${t.map((a) => `<button type="button" data-ec="listitem:${a.id}">${T(a.name)}</button>`).join("")}</div>`;
}
function Qr(e) {
  const t = ["Pedido recibido", "Preparando", "Despachado", "En ruta", "Entregado"], n = e.parts.slice(0, 2), s = n.length ? n : [Ht(e, 0)];
  return `<header><h2>OC-2026-00481</h2><p>Guía GD-88213-CL · Entrega estimada 23 de septiembre, entre 12 y 14 h</p></header>
        <ol class="td-ecom__steps">${t.map((o, r) => `<li class="${r === 2 ? "is-on" : ""} ${r < 2 ? "is-done" : ""}"><b>${r < 2 ? "✓" : r + 1}</b>${o}</li>`).join("")}</ol>
        <ul class="td-ecom__lines">${s.map((o) => `<li><b>${T(o.name)}</b><small>${T(o.code)}</small></li>`).join("")}</ul>`;
}
function Zr(e) {
  const t = Ht(e, 0), a = [t, ...e.parts.filter((o) => o.id !== t.id).slice(1, 3)], n = (o) => e.fbtOff[o] !== !1, s = a.filter((o) => n(o.id));
  return `<h2>Comprados juntos</h2><div class="td-ecom__bundle">${a.map((o) => `<label><input type="checkbox" data-ec="fbt:${o.id}" ${n(o.id) ? "checked" : ""} ${o.id === t.id ? "disabled" : ""}><i style="background:${rt[o.id % rt.length]}"></i><b>${T(o.name)}</b><span>${F(o.price)}</span></label>`).join("")}</div>
        <p>Combo ${s.length} productos · <b>${F(s.reduce((o, r) => o + r.price, 0))}</b></p>
        <button type="button" data-ec="fbtadd">Agregar combo al carrito</button>`;
}
function Xr(e) {
  const t = [
    ["Quilicura", "Av. Américo Vespucio 1501", "Lun–Vie 08:00–19:00 · Sáb 09:00–14:00", 42],
    ["Concepción", "Camino a Penco 2200", "Lun–Vie 08:30–18:30", 8],
    ["Antofagasta", "Av. Balmaceda 1890", "Lun–Vie 08:00–18:00", 0],
    ["Puerto Montt", "Ruta 5 Sur km 1020", "Lun–Vie 08:30–18:00", 15]
  ], a = e.storeQ.toLowerCase(), n = t.filter(([s]) => !a || s.toLowerCase().includes(a));
  return `<label>Sucursal o ciudad<input data-ec-in="store" value="${T(e.storeQ)}" placeholder="Quilicura, Sur…"></label>
        <ul class="td-ecom__lines">${n.map(([s, o, r, i]) => {
    const [c, l] = la(i);
    return `<li><div><b>${s}</b><small>${o}</small><small>${r}</small></div><span style="color:${l}">${c}</span></li>`;
  }).join("") || "<li>Ninguna sucursal coincide. Prueba con otra ciudad.</li>"}</ul>`;
}
function Yr(e) {
  const t = [["F-88213", "22/09/2026", 412970], ["F-88190", "15/09/2026", 1204300], ["F-88055", "02/09/2026", 238980]];
  return `<div class="td-ecom__kpis"><div><span>Línea</span><b>${F(15e6)}</b></div><div><span>Usado</span><b>${F(92e5)}</b></div><div><span>Disponible</span><b>${F(58e5)}</b></div></div>
        <div class="td-ecom__ship" aria-label="61% de la línea usada"><span style="width:61%"></span></div>
        <ul class="td-ecom__lines">${t.map(([a, n, s]) => {
    const o = e.paid.includes(a);
    return `<li><div><b>${a}</b><small>${n}</small></div><b>${F(s)}</b>${o ? '<span style="color:var(--td-color-success)">Pagada</span>' : `<button type="button" data-ec="payinv:${a}">Pagar ${F(s)}</button>`}</li>`;
  }).join("")}</ul>`;
}
function ti(e) {
  const t = [Ht(e, 0), Ht(e, 3)], a = ["Producto defectuoso", "No es compatible con mi vehículo", "Llegó el repuesto equivocado", "Ya no lo necesito"], n = [["refund", "Reembolso al medio de pago original"], ["credit", "Nota de crédito"], ["exchange", "Cambio por otro producto"]], s = e.rma.tried ? e.rmaStep === 0 && !e.rma.item ? "Elige un producto" : e.rmaStep === 1 && !e.rma.reason ? "Elige un motivo" : "" : "", o = ["Producto", "Motivo", "Método", "Listo"];
  return e.rmaStep === 3 ? '<div class="td-ecom__done"><h2>Solicitud RMA-2026-0091</h2><p>Recibimos la devolución. Te escribiremos con la guía de retiro.</p><button type="button" data-ec="rmarestart">Nueva devolución</button></div>' : `<ol class="td-ecom__steps">${o.map((r, i) => `<li class="${i === e.rmaStep ? "is-on" : ""}"><b>${i + 1}</b>${r}</li>`).join("")}</ol>
        ${e.rmaStep === 0 ? `<div class="td-ecom__choices">${t.map((r) => `<button type="button" data-ec="rmaitem:${r.id}" aria-pressed="${e.rma.item === r.id}"><b>${T(r.name)}</b><span>${T(r.code)}</span></button>`).join("")}</div>` : ""}
        ${e.rmaStep === 1 ? `<div class="td-ecom__choices">${a.map((r) => `<button type="button" data-ec="rmareason:${encodeURIComponent(r)}" aria-pressed="${e.rma.reason === r}">${r}</button>`).join("")}</div>` : ""}
        ${e.rmaStep === 2 ? `<div class="td-ecom__choices">${n.map(([r, i]) => `<button type="button" data-ec="rmamethod:${r}" aria-pressed="${e.rma.method === r}">${i}</button>`).join("")}</div>` : ""}
        ${s ? `<p class="td-ecom__err" role="alert">${s}</p>` : ""}
        <div class="td-ecom__nav">${e.rmaStep ? '<button type="button" data-ec="rmaback">Volver</button>' : "<span></span>"}<button type="button" data-ec="rmanext">${e.rmaStep === 2 ? "Enviar solicitud" : "Continuar"}</button></div>`;
}
function mt(e) {
  const t = vt.get(e);
  if (!t) return;
  const a = document.activeElement, n = a instanceof HTMLElement && e.contains(a) ? a.getAttribute("data-ec-in") || a.getAttribute("data-ec-ch") : null, s = a instanceof HTMLInputElement || a instanceof HTMLTextAreaElement ? a.selectionStart : null;
  if (e.innerHTML = Hr(e.dataset.kind || "ecard", t), !n) return;
  const o = e.querySelector(`[data-ec-in="${CSS.escape(n)}"], [data-ec-ch="${CSS.escape(n)}"]`);
  o instanceof HTMLElement && (o.focus(), (o instanceof HTMLInputElement || o instanceof HTMLTextAreaElement) && s != null && o.type !== "checkbox" && o.type !== "range" && o.setSelectionRange(s, s));
}
function st(e, t) {
  const a = vt.get(e);
  a && (a.msg = t, window.clearTimeout(a.timer), mt(e), a.timer = window.setTimeout(() => {
    a.msg = "", e.isConnected && mt(e);
  }, 2800));
}
function ei(e, t, a) {
  const n = vt.get(e);
  if (!n) return;
  const [s, o = "", r = ""] = t.split(":"), i = Number(o), c = Vt(i, n);
  if (s === "layout" && (o === "grid" || o === "list")) n.layout = o;
  else if (s === "wish" && c) {
    n.wish = n.wish.includes(i) ? n.wish.filter((l) => l !== i) : [...n.wish, i], st(e, n.wish.includes(i) ? "Guardado en favoritos" : "Quitado de favoritos");
    return;
  } else if (s === "cmp" && c) {
    if (!n.cmp.includes(i) && n.cmp.length >= 4) {
      st(e, "Máximo 4 productos para comparar");
      return;
    }
    n.cmp = n.cmp.includes(i) ? n.cmp.filter((l) => l !== i) : [...n.cmp, i];
  } else if (s === "cmpx") n.cmp = n.cmp.filter((l) => l !== i);
  else if (s === "cmpadd" && c) {
    if (n.cmp.length >= 4) {
      st(e, "Máximo 4 productos para comparar");
      return;
    }
    n.cmp = [...n.cmp, i];
  } else if ((s === "add" || s === "addpd") && (s === "addpd" || c)) {
    const l = s === "addpd" ? Ht(n, 0) : c, d = s === "addpd" ? n.pv.qty : 1;
    if (!l || l.stock === 0) return;
    const u = n.cart.find((p) => p.id === l.id);
    n.cart = u ? n.cart.map((p) => p.id === l.id ? { ...p, qty: Math.min(l.stock, p.qty + d) } : p) : [...n.cart, { id: l.id, qty: d }], e.dataset.kind === "ecart" && (n.drawer = !0), st(e, `${l.name} agregado al carrito`);
    return;
  } else if (s === "buy") {
    const l = Ht(n, 0), d = n.cart.find((u) => u.id === l.id);
    n.cart = d ? n.cart.map((u) => u.id === l.id ? { ...u, qty: Math.min(l.stock, u.qty + n.pv.qty) } : u) : [...n.cart, { id: l.id, qty: n.pv.qty }], st(e, "Listo para pagar. Revisa el checkout.");
    return;
  } else if (s === "drawer") n.drawer = !n.drawer;
  else if (s === "line") {
    const l = Number(r), d = Vt(i, n);
    n.cart = n.cart.map((u) => u.id === i ? { ...u, qty: Math.max(1, Math.min(d?.stock ?? 99, u.qty + l)) } : u);
  } else if (s === "rm" && c) {
    n.cart = n.cart.filter((l) => l.id !== i), st(e, `${c.name} quitado`);
    return;
  } else if (s === "coupon") {
    n.coupon.trim() === "FLOTA10" ? (n.couponOk = !0, st(e, "Cupón FLOTA10 aplicado · 10% de descuento")) : (n.couponOk = !1, st(e, "Cupón no válido · prueba FLOTA10"));
    return;
  } else if (s === "go-check") st(e, "Continúa en Checkout para pagar el pedido.");
  else if (s === "pd") n.pv = { ...n.pv, qty: Math.max(1, Math.min(99, n.pv.qty + Number(o))) };
  else if (s === "side" && (o === "del" || o === "tra")) n.pv = { ...n.pv, side: o };
  else if (s === "qual" && (o === "orig" || o === "alt" || o === "eco")) n.pv = { ...n.pv, q: o };
  else if (s === "img") n.pv = { ...n.pv, img: Number(o) };
  else if (s === "next" || s === "back" || s === "restart") ai(e, n, s);
  else if (s === "ship" && (o === "std" || o === "exp" || o === "pick")) n.co = { ...n.co, ship: o };
  else if (s === "pay" && (o === "card" || o === "transfer" || o === "credit")) n.co = { ...n.co, pay: o };
  else if (s === "facet") ks(n, o, decodeURIComponent(r));
  else if (s === "chip") ni(n, o, decodeURIComponent(t.split(":").slice(2).join(":")));
  else if (s === "clearf") n.f = { brand: [], cat: [], stock: !1, max: 0 };
  else if (s === "qclear")
    n.q = "", n.qOpen = !0;
  else if (s === "qgo") {
    const l = decodeURIComponent(o);
    n.recentQ = [l.toLowerCase(), ...n.recentQ.filter((d) => d !== l.toLowerCase())].slice(0, 5), n.q = l, n.qOpen = !1, st(e, `Buscar: “${l}”`);
    return;
  } else if (s === "qrm")
    a?.stopPropagation(), n.recentQ = n.recentQ.filter((l) => l !== decodeURIComponent(o));
  else if (s === "qpop")
    n.q = decodeURIComponent(o), n.qOpen = !0;
  else if (s === "rvf") n.rf = n.rf === i ? 0 : i;
  else if (s === "rvs" && (o === "new" || o === "help" || o === "hi" || o === "lo")) n.rs = o;
  else if (s === "rvclear") n.rf = 0;
  else if (s === "vote") n.votes = { ...n.votes, [i]: !n.votes[i] };
  else if (s === "rvopen") n.rv = { ...n.rv, open: !n.rv.open };
  else if (s === "rvstar") n.rv = { ...n.rv, stars: i };
  else if (s === "rvsend") {
    if (!n.rv.stars || n.rv.text.trim().length < 10) {
      n.rv = { ...n.rv, tried: !0 }, mt(e);
      return;
    }
    n.rv = { open: !1, stars: 0, text: "", tried: !1 }, st(e, "Gracias. Tu reseña se publicará tras moderación");
    return;
  } else if (s === "pftab" && (o === "veh" || o === "plate")) n.pf = { ...n.pf, tab: o, done: !1 };
  else if (s === "pfgo") si(e, n);
  else if (s === "pfreset") n.pf = { ...n.pf, brand: "", model: "", year: "", sys: "", plate: "", done: !1 };
  else if (s === "qadd" && c) n.quote = [...n.quote, { id: i, qty: 10 }];
  else if (s === "qq") n.quote = n.quote.map((l) => l.id === i ? { ...l, qty: Math.max(1, l.qty + Number(r)) } : l);
  else if (s === "qqrm") n.quote = n.quote.filter((l) => l.id !== i);
  else if (s === "qsend") {
    if (!n.quote.length) {
      st(e, "Agrega al menos un producto");
      return;
    }
    n.quoteSent = !0;
  } else if (s === "qnew")
    n.quote = [], n.quoteNote = "", n.quoteSent = !1;
  else if (s === "bulksample") n.bulkText = n.parts.slice(0, 4).map((l, d) => `${l.code}, ${d + 2}`).join(`
`);
  else if (s === "bulkparse") n.bulkRows = oi(n.bulkText, n);
  else if (s === "bulkok") {
    const l = (n.bulkRows ?? []).filter((d) => d.ok);
    if (!l.length) return;
    l.forEach((d) => {
      const u = n.parts.find((m) => m.code === d.code);
      if (!u) return;
      const p = n.cart.find((m) => m.id === u.id);
      n.cart = p ? n.cart.map((m) => m.id === u.id ? { ...m, qty: m.qty + d.qty } : m) : [...n.cart, { id: u.id, qty: d.qty }];
    }), n.bulkRows = null, n.bulkText = "", st(e, `${l.length} productos agregados al carrito`);
    return;
  } else if (s === "recentx") n.recent = n.recent.filter((l) => l !== i);
  else if (s === "recentclear") n.recent = [];
  else if (s === "sub") n.stockSubs = { ...n.stockSubs, [i]: !n.stockSubs[i] };
  else if (s === "listadd") {
    const l = n.newList.trim();
    if (!l) return;
    n.lists = [...n.lists, { id: `l${Date.now()}`, name: l, items: [] }], n.newList = "";
  } else if (s === "listdel") n.lists = n.lists.filter((l) => l.id !== o);
  else if (s === "listrm") n.lists = n.lists.map((l) => l.id === o ? { ...l, items: l.items.filter((d) => d !== Number(r)) } : l);
  else if (s === "listitem" && c && n.lists[0]) n.lists = n.lists.map((l, d) => d === 0 ? { ...l, items: [...l.items, i] } : l);
  else if (s === "fbt") n.fbtOff = { ...n.fbtOff, [i]: n.fbtOff[i] === !1 };
  else if (s === "fbtadd") {
    const l = Ht(n, 0), d = [l, ...n.parts.filter((u) => u.id !== l.id).slice(1, 3)].filter((u) => n.fbtOff[u.id] !== !1);
    st(e, `Combo agregado al carrito · ${d.length} productos`);
    return;
  } else if (s === "payinv") {
    n.paid = [...n.paid, o], st(e, `${o} pagada`);
    return;
  } else s === "rmaitem" ? n.rma = { ...n.rma, item: i } : s === "rmareason" ? n.rma = { ...n.rma, reason: decodeURIComponent(o) } : s === "rmamethod" && (o === "refund" || o === "credit" || o === "exchange") ? n.rma = { ...n.rma, method: o } : (s === "rmanext" || s === "rmaback" || s === "rmarestart") && ri(n, s);
  mt(e);
}
function ai(e, t, a) {
  if (a === "restart") {
    t.step = 0, t.co = { name: "", mail: "", rut: "", addr: "", ship: "std", pay: "card", tried: !1 };
    return;
  }
  if (a === "back") {
    t.step = Math.max(0, t.step - 1);
    return;
  }
  const n = t.co;
  if ([
    n.name.trim().length < 3 || !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(n.mail) || !/^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/.test(n.rut.trim()),
    n.addr.trim().length < 6,
    !1
  ][t.step]) {
    t.co = { ...n, tried: !0 };
    return;
  }
  t.step += 1, t.co = { ...n, tried: !1 };
}
function ks(e, t, a) {
  const n = e.f[t];
  e.f = { ...e.f, [t]: n.includes(a) ? n.filter((s) => s !== a) : [...n, a] };
}
function ni(e, t, a) {
  t === "brand" || t === "cat" ? e.f = { ...e.f, [t]: e.f[t].filter((n) => n !== a) } : t === "stock" ? e.f = { ...e.f, stock: !1 } : e.f = { ...e.f, max: 0 };
}
function zn(e, t) {
  if (e.source = t, !!t)
    try {
      const a = JSON.parse(t);
      if (!Array.isArray(a)) return;
      e.parts = a.filter((n) => n.code && n.name).map((n, s) => ({
        id: Number(n.id) || s + 1,
        code: String(n.code),
        name: String(n.name),
        brand: n.brand || "",
        app: n.fit || "",
        cat: n.category || "",
        stock: Number(n.stock) || 0,
        price: Number(n.price) || 0
      })), e.cart = [], e.wish = [], e.cmp = [], e.quote = [], e.recent = [], e.lists = [];
    } catch {
    }
}
function si(e, t) {
  if (!t.parts.length) {
    st(e, "No hay productos");
    return;
  }
  if (t.pf.tab === "plate") {
    if (!/^[A-Z]{4}-?\d{2}$/.test(t.pf.plate)) {
      st(e, "Patente con formato ABCD-12");
      return;
    }
    const a = t.parts[t.pf.plate.charCodeAt(0) % t.parts.length], [n, ...s] = a.app.split(" ");
    t.pf = { ...t.pf, brand: n, model: s.join(" "), year: "2021", sys: "", done: !0 }, mt(e);
    return;
  }
  t.pf.year && (t.pf = { ...t.pf, done: !0 });
}
function oi(e, t) {
  return e.split(/\n/).map((a) => a.trim()).filter(Boolean).map((a) => {
    const n = a.split(/[,;\t]|\s{2,}/).map((i) => i.trim()).filter(Boolean), s = (n[0] || "").toUpperCase(), o = Number(n[1]) || 1, r = t.parts.find((i) => i.code === s);
    return { code: s, qty: o, ok: !!r, name: r ? r.name : "No encontrado" };
  });
}
function ri(e, t) {
  if (t === "rmarestart") {
    e.rmaStep = 0, e.rma = { item: null, reason: "", method: "refund", tried: !1 };
    return;
  }
  if (t === "rmaback") {
    e.rmaStep = Math.max(0, e.rmaStep - 1);
    return;
  }
  if (e.rmaStep === 0 ? !e.rma.item : e.rmaStep === 1 ? !e.rma.reason : !1) {
    e.rma = { ...e.rma, tried: !0 };
    return;
  }
  e.rmaStep += 1, e.rma = { ...e.rma, tried: !1 };
}
function Vn(e, t) {
  if (!(t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement)) return;
  const a = vt.get(e);
  if (!a) return;
  const n = t.getAttribute("data-ec-in") || t.getAttribute("data-ec-ch");
  if (n) {
    if (n === "coupon") a.coupon = t.value.toUpperCase();
    else if (n === "name") a.co = { ...a.co, name: t.value };
    else if (n === "mail") a.co = { ...a.co, mail: t.value };
    else if (n === "rut") a.co = { ...a.co, rut: t.value };
    else if (n === "addr") a.co = { ...a.co, addr: t.value };
    else if (n === "pd") a.pv = { ...a.pv, qty: Math.max(1, Math.min(99, Number(t.value) || 1)) };
    else if (n === "max") a.f = { ...a.f, max: Number(t.value) };
    else if (n === "q")
      a.q = t.value, a.qOpen = !0, a.qHi = -1;
    else if (n === "rv") a.rv = { ...a.rv, text: t.value };
    else if (n === "plate") a.pf = { ...a.pf, plate: t.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 8), done: !1 };
    else if (n === "qnote") a.quoteNote = t.value;
    else if (n === "bulk")
      a.bulkText = t.value, a.bulkRows = null;
    else if (n === "list") a.newList = t.value;
    else if (n === "store") a.storeQ = t.value;
    else if (n === "sort" && (t.value === "rel" || t.value === "lo" || t.value === "hi" || t.value === "rate")) a.sort = t.value;
    else if (n === "brand") a.pf = { ...a.pf, brand: t.value, model: "", year: "", sys: "", done: !1 };
    else if (n === "model") a.pf = { ...a.pf, model: t.value, year: "", sys: "", done: !1 };
    else if (n === "year") a.pf = { ...a.pf, year: t.value, sys: "", done: !1 };
    else if (n === "sys") a.pf = { ...a.pf, sys: t.value, done: !1 };
    else if (n.startsWith("move:")) {
      const [, s, o] = n.split(":"), r = t.value;
      if (r) {
        const i = Number(o);
        a.lists = a.lists.map((c) => c.id === s ? { ...c, items: c.items.filter((l) => l !== i) } : c.id === r ? { ...c, items: [...c.items, i] } : c);
      }
    }
    n !== "coupon" && mt(e);
  }
}
function Un(e) {
  e.dataset.kind !== "eflash" || In.has(e) || (In.add(e), window.setInterval(() => {
    e.isConnected && e.dataset.kind === "eflash" && mt(e);
  }, 1e3));
}
function Na(e = document) {
  e.querySelectorAll("td-ecom").forEach((t) => {
    const a = t.dataset.kind || "ecard", n = t.dataset.products || "", s = vt.get(t);
    if (s) {
      if (s.kind !== a || t.childElementCount === 0 || s.source !== n) {
        const r = Fn(a);
        zn(r, n), vt.set(t, r), mt(t), Un(t);
      }
      return;
    }
    const o = Fn(a);
    zn(o, n), vt.set(t, o), t.addEventListener("click", (r) => {
      const i = r.target instanceof Element ? r.target.closest("[data-ec]") : null;
      i instanceof HTMLElement && (i instanceof HTMLInputElement || ei(t, i.dataset.ec || "", r));
    }), t.addEventListener("change", (r) => {
      const i = r.target;
      if (i instanceof HTMLInputElement && i.dataset.ec === "fstock") {
        const c = vt.get(t);
        c && (c.f = { ...c.f, stock: i.checked }), mt(t);
        return;
      }
      if (i instanceof HTMLInputElement && i.dataset.ec === "diff") {
        const c = vt.get(t);
        c && (c.cmpDiff = i.checked), mt(t);
        return;
      }
      if (i instanceof HTMLInputElement && i.dataset.ec?.startsWith("facet:")) {
        const [, c, l] = i.dataset.ec.split(":"), d = vt.get(t);
        d && (c === "brand" || c === "cat") && ks(d, c, decodeURIComponent(l)), mt(t);
        return;
      }
      if (i instanceof HTMLInputElement && i.dataset.ec?.startsWith("fbt:")) {
        const c = vt.get(t), l = Number(i.dataset.ec.split(":")[1]);
        c && (c.fbtOff = { ...c.fbtOff, [l]: !i.checked }), mt(t);
        return;
      }
      Vn(t, r.target);
    }), t.addEventListener("input", (r) => {
      const i = r.target;
      i instanceof HTMLSelectElement || Vn(t, i);
    }), mt(t), Un(t);
  });
}
const $e = {
  text: "Texto",
  line: "Línea",
  box: "Recuadro",
  image: "Imagen",
  qr: "QR",
  barcode: "Código de barras"
}, Se = "Barlow, Arial, Helvetica, sans-serif", Pa = '"JetBrains Mono", Consolas, monospace';
function Z(e, t, a) {
  return Math.max(t, Math.min(a, e));
}
function Mt(e) {
  return Math.round(e * 100) / 100;
}
function z(e) {
  return e.replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t] ?? t);
}
function ii(e) {
  return `$ ${Math.round(e).toLocaleString("es-CL")}`;
}
function da(e) {
  return JSON.parse(JSON.stringify(e));
}
function lt(e, t, a, n, s, o = {}) {
  return { id: "", type: e, x: t, y: a, w: n, h: s, ...o };
}
function J(e, t, a, n, s, o, r = {}) {
  return lt("text", e, t, a, n, { text: s, size: o, bold: !1, align: "left", ...r });
}
function an() {
  return {
    factura: {
      format: "uiux-report",
      version: 1,
      name: "Factura",
      page: { size: "A4", margin: 12 },
      parameters: [
        { name: "NumeroFactura", type: "texto", value: "F-000481" },
        { name: "Cliente", type: "texto", value: "Transportes del Sur SpA" },
        { name: "RutCliente", type: "texto", value: "76.543.210-K" },
        { name: "Fecha", type: "fecha", value: "2026-09-23" },
        { name: "Vendedor", type: "texto", value: "Camila Rojas" }
      ],
      bands: {
        header: {
          height: 62,
          elements: [
            lt("image", 0, 0, 40, 15, { text: "Logo" }),
            J(0, 18, 110, 6, "Distribuidora de Repuestos SpA", 4.4, { bold: !0 }),
            J(0, 25, 115, 4, "RUT 77.123.456-7 · Av. Américo Vespucio 1500, Quilicura", 2.6),
            lt("box", 120, 0, 66, 27, { thick: 0.5 }),
            J(120, 3.5, 66, 4.5, "FACTURA ELECTRÓNICA", 3.4, { bold: !0, align: "center" }),
            J(120, 10, 66, 7, "N° {?NumeroFactura}", 5.6, { bold: !0, align: "center" }),
            J(120, 19.5, 66, 4, "Fecha {?Fecha|date}", 2.8, { align: "center" }),
            lt("line", 0, 34, 186, 0.3, { thick: 0.3 }),
            J(0, 37.5, 60, 3.5, "CLIENTE", 2.4, { bold: !0 }),
            J(0, 41.5, 140, 5.5, "{?Cliente}", 4.2, { bold: !0 }),
            J(0, 48.5, 140, 4, "RUT {?RutCliente} · Vendedor {?Vendedor}", 2.7),
            lt("qr", 164, 37, 22, 22, { text: "https://sii.cl/verificar/{?NumeroFactura}" })
          ]
        },
        detail: {
          source: "Lineas",
          rowHeight: 7,
          headHeight: 8,
          zebra: !0,
          columns: [
            { title: "Código", expr: "codigo", w: 17, fmt: "" },
            { title: "Descripción", expr: "descripcion", w: 41, fmt: "" },
            { title: "Cant.", expr: "cantidad", w: 10, fmt: "number", align: "right" },
            { title: "Precio", expr: "precio", w: 16, fmt: "money", align: "right" },
            { title: "Total", expr: "cantidad*precio", w: 16, fmt: "money", align: "right" }
          ]
        },
        footer: {
          height: 46,
          elements: [
            J(0, 4, 100, 4, "Líneas: {=count(Lineas)} · unidades: {=sum(Lineas, cantidad)}", 2.7),
            lt("barcode", 0, 12, 72, 16, { text: "{?NumeroFactura}", format: "c128", showText: !0 }),
            J(110, 4, 40, 4.5, "Subtotal", 3, { align: "right" }),
            J(152, 4, 34, 4.5, "{=sum(Lineas, cantidad*precio)|money}", 3, { align: "right" }),
            J(110, 10, 40, 4.5, "IVA 19%", 3, { align: "right" }),
            J(152, 10, 34, 4.5, "{=sum(Lineas, cantidad*precio)*0.19|money}", 3, { align: "right" }),
            lt("line", 120, 16.5, 66, 0.4, { thick: 0.4 }),
            J(110, 19, 40, 6, "TOTAL", 4.4, { bold: !0, align: "right" }),
            J(140, 19, 46, 6, "{=sum(Lineas, cantidad*precio)*1.19|money}", 4.4, { bold: !0, align: "right" }),
            J(0, 36, 186, 4, "Documento generado con TDReport · {now|date}", 2.3, { align: "center" })
          ]
        }
      }
    },
    stock: {
      format: "uiux-report",
      version: 1,
      name: "Informe de stock",
      page: { size: "A4", margin: 12 },
      parameters: [
        { name: "Bodega", type: "texto", value: "Quilicura" },
        { name: "FechaCorte", type: "fecha", value: "2026-09-23" },
        { name: "Responsable", type: "texto", value: "Jefe de bodega" }
      ],
      bands: {
        header: {
          height: 30,
          elements: [
            J(0, 0, 130, 9, "INFORME DE STOCK", 7, { bold: !0 }),
            J(0, 11, 150, 4.5, "Bodega {?Bodega} · corte al {?FechaCorte|date} · {?Responsable}", 3.1),
            lt("line", 0, 22, 186, 0.6, { thick: 0.6 }),
            lt("qr", 170, 0, 16, 16, { text: "stock:{?Bodega}:{?FechaCorte}" })
          ]
        },
        detail: {
          source: "Repuestos",
          rowHeight: 6.5,
          headHeight: 8,
          zebra: !0,
          columns: [
            { title: "Código", expr: "codigo", w: 16, fmt: "" },
            { title: "Repuesto", expr: "nombre", w: 34, fmt: "" },
            { title: "Marca", expr: "marca", w: 14, fmt: "" },
            { title: "Stock", expr: "stock", w: 9, fmt: "number", align: "right" },
            { title: "Precio", expr: "precio", w: 13, fmt: "money", align: "right" },
            { title: "Valorizado", expr: "stock*precio", w: 14, fmt: "money", align: "right" }
          ]
        },
        footer: {
          height: 24,
          elements: [
            lt("line", 0, 2, 186, 0.4, { thick: 0.4 }),
            J(0, 6, 60, 5, "Repuestos: {=count(Repuestos)}", 3.2, { bold: !0 }),
            J(62, 6, 60, 5, "Unidades: {=sum(Repuestos, stock)|number}", 3.2, { bold: !0 }),
            J(110, 6, 76, 5, "Valorizado: {=sum(Repuestos, stock*precio)|money}", 3.2, { bold: !0, align: "right" }),
            J(0, 15, 186, 4, "Sin stock: {=sum(Repuestos, stock==0?1:0)} repuestos", 2.7)
          ]
        }
      }
    }
  };
}
function ci() {
  return {
    format: "uiux-report",
    version: 1,
    name: "Nuevo reporte",
    page: { size: "A4", margin: 12 },
    parameters: [{ name: "Titulo", type: "texto", value: "Mi reporte" }],
    bands: {
      header: { height: 24, elements: [J(0, 0, 186, 8, "{?Titulo}", 6, { bold: !0 })] },
      detail: { source: "Lineas", rowHeight: 7, headHeight: 8, zebra: !1, columns: [{ title: "Código", expr: "codigo", w: 30, fmt: "" }, { title: "Descripción", expr: "descripcion", w: 70, fmt: "" }] },
      footer: { height: 16, elements: [] }
    }
  };
}
function ua(e) {
  e.bands.header.elements.forEach((t, a) => {
    t.id || (t.id = `h${a}`);
  }), e.bands.footer.elements.forEach((t, a) => {
    t.id || (t.id = `f${a}`);
  });
}
function nn(e) {
  return Object.fromEntries(e.parameters.map((t) => [t.name, t.value]));
}
function li() {
  const e = da(an().factura);
  return ua(e), {
    mode: "design",
    tplKey: "factura",
    tpl: e,
    sel: null,
    rows: 8,
    pv: nn(e),
    json: null,
    jsonMsg: "",
    jsonBad: !1,
    dataJson: null,
    dataMsg: "",
    dataBad: !1,
    fileMsg: "",
    fileBad: !1,
    timer: 0,
    nid: 100,
    avail: 720,
    scale: 2.4,
    runData: null,
    runParams: null,
    drag: null
  };
}
function di(e, t) {
  const a = t.dataset.report;
  (a === "factura" || a === "stock") && (e.tplKey = a, e.tpl = da(an()[a]), ua(e.tpl), e.pv = nn(e.tpl), e.sel = null, e.runData = null, e.runParams = null, e.json = null);
  const n = Number(t.dataset.rows);
  n && (e.rows = Z(Math.round(n), 1, 60));
  const s = {
    NumeroFactura: t.dataset.numero,
    Cliente: t.dataset.cliente,
    RutCliente: t.dataset.rut,
    Fecha: t.dataset.fecha,
    Vendedor: t.dataset.vendedor,
    Bodega: t.dataset.bodega,
    FechaCorte: t.dataset.fechaCorte,
    Responsable: t.dataset.responsable
  };
  for (const o of e.tpl.parameters) {
    const r = s[o.name];
    r && (o.value = r, e.pv[o.name] = r);
  }
}
function xt(e, t, a, n, s) {
  t.fileMsg = a, t.fileBad = n, window.clearTimeout(t.timer), t.timer = window.setTimeout(() => {
    t.fileMsg = "", e.isConnected && s();
  }, 4500);
}
function qe(e) {
  return e === "Carta" ? [216, 279] : [210, 297];
}
function ie(e) {
  const [t] = qe(e.page.size);
  return t - e.page.margin * 2;
}
function ui(e, t) {
  return e === "Repuestos" ? Array.from({ length: t }, (a, n) => {
    const s = wt[n % wt.length];
    return { codigo: s.code, nombre: s.name, marca: s.brand, categoria: s.cat, stock: s.stock, precio: s.price };
  }) : Array.from({ length: t }, (a, n) => {
    const s = wt[n % wt.length];
    return { codigo: s.code, descripcion: s.name, cantidad: n * 7 % 4 + 1, precio: s.price };
  });
}
function ye(e, t) {
  if (e == null || e === "") return "";
  if (t === "money") return ii(Math.round(Number(e) || 0));
  if (t === "number") return (Number(e) || 0).toLocaleString("es-CL");
  if (t === "date") {
    const a = String(e).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return a ? `${a[3]}/${a[2]}/${a[1]}` : String(e);
  }
  return String(e);
}
function sn(e, t, a, n) {
  let s = String(e).replace(/\?([A-Za-z_][A-Za-z0-9_]*)/g, (o, r) => {
    const i = n[r];
    return Number.isNaN(Number(i)) || i === "" ? JSON.stringify(String(i ?? "")) : String(Number(i));
  });
  if (s = s.replace(/(sum|avg|min|max)\(\s*(\w+)\s*,\s*([^)]*)\)/g, (o, r, i, c) => {
    const l = (a[i] || []).map((d) => Number(sn(c, d, a, n)) || 0);
    return l.length ? String(r === "sum" ? l.reduce((d, u) => d + u, 0) : r === "avg" ? l.reduce((d, u) => d + u, 0) / l.length : r === "min" ? Math.min(...l) : Math.max(...l)) : "0";
  }), s = s.replace(/count\(\s*(\w+)\s*\)/g, (o, r) => String((a[r] || []).length)), t && (s = s.replace(/"[^"]*"|\b([A-Za-z_]\w*)\b/g, (o, r) => {
    if (!r || !(r in t)) return o;
    const i = t[r];
    return typeof i == "number" ? String(i) : JSON.stringify(String(i));
  })), /^\s*"[^"]*"\s*$/.test(s)) return JSON.parse(s);
  if (!/^[0-9.+\-*/()<>=!?: ]*$/.test(s)) throw new Error(`Expresión no válida: ${e}`);
  return Function(`"use strict"; return (${s.trim() || "0"})`)();
}
function Ge(e, t, a, n, s, o) {
  return String(e ?? "").replace(/\{([^{}]+)\}/g, (r, i) => {
    const [c, l = ""] = i.split("|");
    try {
      if (c === "page") return String(a ? a[0] : 1);
      if (c === "pages") return String(a ? a[1] : 1);
      if (c === "now") return ye((/* @__PURE__ */ new Date()).toISOString().slice(0, 10), l || "date");
      if (c.startsWith("?")) {
        const d = c.slice(1), u = n.parameters.find((p) => p.name === d);
        return ye(o[d], l || (u?.type === "fecha" ? "date" : ""));
      }
      return c.startsWith("=") ? ye(sn(c.slice(1), t, s, o), l) : t && c in t ? ye(t[c], l) : r;
    } catch {
      return "#ERR";
    }
  });
}
function pi(e, t, a, n) {
  try {
    const s = e.expr in t ? t[e.expr] : sn(e.expr, t, a, n);
    return ye(s, e.fmt);
  } catch {
    return "#ERR";
  }
}
function Wn(e, t) {
  return e.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "").replace("<svg ", `<svg preserveAspectRatio="${t ? "xMidYMid meet" : "none"}" style="width:100%;height:100%;display:block" `);
}
function _s(e, t, a, n, s, o, r) {
  const i = `position:absolute;left:${t(e.x)};top:${t(e.y)};width:${t(e.w)};height:${t(e.h)};`;
  if (e.type === "text")
    return `<div style="${i}font:${e.bold ? 700 : 400} ${t(e.size || 3)}/1.15 ${Se};text-align:${e.align || "left"};white-space:nowrap;overflow:hidden;color:#0A0B0C">${z(Ge(e.text || "", a, n, s, o, r))}</div>`;
  if (e.type === "line") return `<div style="${i}height:${t(e.thick || 0.3)};background:#0A0B0C"></div>`;
  if (e.type === "box") return `<div style="${i}box-sizing:border-box;border:${t(e.thick || 0.3)} solid #0A0B0C"></div>`;
  if (e.type === "image")
    return `<div style="${i}box-sizing:border-box;border:${t(0.3)} dashed #9CA3AB;background:#F1F2F4;display:flex;align-items:center;justify-content:center;font:500 ${t(2.6)} ${Pa};color:#6E757D">${z(e.text || "Imagen")}</div>`;
  if (e.type === "qr") {
    const c = Ge(e.text || "", a, n, s, o, r) || " ", l = Wa(c, "M", 1, "#0A0B0C", 0);
    if (l.error || !l.svg) return `<div style="${i}border:1px dashed #C62828;color:#C62828;font:500 ${t(2.4)} ${Se};display:flex;align-items:center;justify-content:center">QR no válido</div>`;
    const d = Math.min(e.w, e.h);
    return `<div style="position:absolute;left:${t(e.x)};top:${t(e.y)};width:${t(d)};height:${t(d)}">${Wn(l.svg, !0)}</div>`;
  }
  if (e.type === "barcode") {
    const c = Ge(e.text || "", a, n, s, o, r), l = Ua(e.format === "ean13" ? "ean13" : "c128", c, 1, 40, "#0A0B0C", !1);
    if (l.error || !l.svg) return `<div style="${i}border:1px dashed #C62828;color:#C62828;font:500 ${t(2.4)} ${Se};display:flex;align-items:center;padding:0 4px">Código no válido</div>`;
    const d = e.showText ? Math.min(3.2, e.h * 0.22) : 0;
    return `<div style="${i}display:flex;flex-direction:column"><div style="flex:1;min-height:0">${Wn(l.svg, !1)}</div>${d ? `<div style="text-align:center;font:${t(d)}/1.2 ${Pa};letter-spacing:.08em">${z(l.value)}</div>` : ""}</div>`;
  }
  return "";
}
function As(e, t, a, n, s) {
  const o = e.bands.detail, r = o.columns.reduce((d, u) => d + (Number(u.w) || 0), 0) || 100, i = o.columns.map((d) => `<col style="width:${(Number(d.w) || 0) / r * 100}%">`).join(""), c = `<thead><tr>${o.columns.map((d) => `<th style="height:${a(o.headHeight)};padding:0 ${a(1.5)};background:#EEF0F2;border-top:${a(0.3)} solid #0A0B0C;border-bottom:${a(0.3)} solid #0A0B0C;font-weight:700;font-size:${a(2.5)};text-transform:uppercase;letter-spacing:.04em;text-align:${d.align || "left"};white-space:nowrap;overflow:hidden">${z(d.title)}</th>`).join("")}</tr></thead>`, l = t.map((d, u) => `<tr style="background:${o.zebra && u % 2 ? "#F6F7F8" : "#FFFFFF"}">${o.columns.map((p) => `<td style="height:${a(o.rowHeight)};padding:0 ${a(1.5)};border-bottom:${a(0.2)} solid #DCDFE3;text-align:${p.align || "left"};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${/^(codigo|code)$/.test(p.expr) ? `font-family:${Pa};font-size:${a(2.5)};` : ""}">${z(pi(p, d, n, s))}</td>`).join("")}</tr>`).join("");
  return `<table style="position:absolute;left:0;top:0;width:${a(ie(e))};border-collapse:collapse;table-layout:fixed;font:400 ${a(2.8)} ${Se};color:#0A0B0C"><colgroup>${i}</colgroup>${c}<tbody>${l}</tbody></table>`;
}
function qs(e, t) {
  const [, a] = qe(e.page.size), n = e.page.margin, s = e.bands.detail, o = a - n - 7, r = [{ items: [] }];
  let i = r[0], c = n;
  i.items.push({ kind: "header", y: c }), c += e.bands.header.height;
  const l = () => {
    i = { items: [] }, r.push(i), c = n;
  };
  let d = 0;
  for (t.length || i.items.push({ kind: "table", y: c, rows: [] }); d < t.length; ) {
    c + s.headHeight + s.rowHeight > o && l();
    const u = Math.max(1, Math.floor((o - c - s.headHeight) / s.rowHeight)), p = t.slice(d, d + u);
    i.items.push({ kind: "table", y: c, rows: p }), c += s.headHeight + p.length * s.rowHeight + 2, d += p.length, d < t.length && l();
  }
  return c + e.bands.footer.height > o && l(), i.items.push({ kind: "footer", y: c }), r;
}
function Cs(e, t, a, n, s, o, r, i) {
  const [c, l] = qe(e.page.size), d = e.page.margin, u = ie(e), p = t.items.map((h) => {
    const g = h.kind === "table" ? As(e, h.rows || [], s, r, i) : e.bands[h.kind].elements.map((f) => _s(f, s, o, [a + 1, n], e, r, i)).join("");
    return `<div style="position:absolute;left:${s(d)};top:${s(h.y)};width:${s(u)};height:${h.kind === "table" ? "auto" : s(e.bands[h.kind].height)}">${g}</div>`;
  }).join(""), m = d - 6 > 2 ? d - 6 : 3;
  return `<div style="position:relative;width:${s(c)};height:${s(l)};background:#fff;overflow:hidden;box-sizing:border-box">${p}<div style="position:absolute;left:${s(d)};right:${s(d)};bottom:${s(m)};display:flex;justify-content:space-between;font:400 ${s(2.3)} ${Se};color:#6E757D"><span>${z(e.name)}</span><span>Página ${a + 1} de ${n}</span></div></div>`;
}
function Ts(e) {
  return `${(e || "reporte").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w-]+/g, "-")}.uxr`;
}
function Hs(e, t) {
  const a = t ? { ...e, savedAt: (/* @__PURE__ */ new Date()).toISOString() } : e;
  return JSON.stringify(a, null, 2);
}
function Ns(e) {
  if (e.sel?.kind !== "el") return null;
  const { band: t, id: a } = e.sel;
  return e.tpl.bands[t].elements.find((n) => n.id === a) ?? null;
}
function on(e) {
  return e && e.kind !== "detail" ? e.band : "header";
}
function rn(e) {
  return e.nid += 1, `r${e.nid}`;
}
function V(e, t) {
  const a = da(e.tpl);
  t(a), e.tpl = a, e.json = null;
}
function Ps(e, t) {
  if (!t || typeof t != "object") throw new Error("el archivo no tiene una plantilla");
  const a = t;
  if (a.format !== "uiux-report" || !a.bands?.detail || !a.bands.header || !a.bands.footer)
    throw new Error("no es una plantilla de reporte .uxr");
  if (!Array.isArray(a.bands.detail.columns) || !Array.isArray(a.parameters))
    throw new Error("faltan las columnas o los parámetros");
  return a.version = 1, a.page = { size: a.page?.size === "Carta" ? "Carta" : "A4", margin: Z(Number(a.page?.margin) || 12, 5, 30) }, a.bands.header.elements = a.bands.header.elements || [], a.bands.footer.elements = a.bands.footer.elements || [], a.bands.header.height = Z(Number(a.bands.header.height) || 20, 5, 200), a.bands.footer.height = Z(Number(a.bands.footer.height) || 16, 5, 200), ua(a), e.tpl = a, e.sel = null, e.json = null, e.runData = null, e.runParams = null, e.pv = Object.fromEntries((a.parameters || []).map((n) => [n.name, String(n.value ?? "")])), a.name || "Plantilla";
}
function Ke(e) {
  const t = e.tpl, a = t.bands.detail.source || "Lineas", n = e.runData && e.runData[a] || ui(a, e.rows), s = { [a]: n }, o = e.runParams || e.pv;
  return { tpl: t, source: a, rows: n, sources: s, params: o, sample: n[0] || {} };
}
function va(e, t, a, n) {
  const s = Ns(t);
  if (s && (s.type === "text" || s.type === "qr" || s.type === "barcode")) {
    V(t, (i) => {
      const c = t.sel?.kind === "el" ? t.sel.band : "header", l = i.bands[c].elements.find((d) => d.id === s.id);
      l && (l.text = l.type === "text" ? `${l.text ? `${l.text} ` : ""}${a}` : a);
    });
    return;
  }
  if (t.sel?.kind === "detail") {
    xt(e, t, "Selecciona un texto del encabezado o del pie. En el detalle, escribe el campo en la columna.", !0, n);
    return;
  }
  const o = on(t.sel), r = rn(t);
  V(t, (i) => {
    i.bands[o].elements.push(J(0, 0, 80, 5, a, 3.2));
    const c = i.bands[o].elements.at(-1);
    c && (c.id = r);
  }), t.sel = { kind: "el", band: o, id: r };
}
function De(e, t, a) {
  return `<div class="td-ecom__seg" role="group">${e.map(([n, s]) => `<button type="button" data-st="${a(n)}" aria-pressed="${t === n}">${s}</button>`).join("")}</div>`;
}
function xa(e, t, a) {
  return `<button type="button" class="td-rpt__switch" role="switch" aria-checked="${e}" data-st="${a}"><span class="td-rpt__track${e ? " is-on" : ""}" aria-hidden="true"></span>${t}</button>`;
}
function pt(e, t) {
  return `<label>${e}${t}</label>`;
}
function mi(e) {
  const { tpl: t, source: a, rows: n, sources: s, params: o, sample: r } = Ke(e), [i, c] = qe(t.page.size), l = t.page.margin, d = e.mode, u = (C) => (D) => `${Mt(D * C)}px`, p = Z((e.avail - 44) / i, 1.4, 4.2);
  e.scale = p;
  const m = u(p), h = t.bands.detail, g = Object.keys(n[0] || { codigo: "", descripcion: "" }), f = g.find((C) => typeof (n[0] || {})[C] == "number") || "cantidad", b = [
    ["Σ suma", `{=sum(${a}, ${f})|number}`],
    ["# conteo", `{=count(${a})}`],
    ["Página", "Página {page} de {pages}"],
    ["Hoy", "{now|date}"]
  ], v = e.fileMsg || "El archivo .uxr guarda bandas, parámetros y fuentes. Se reutiliza pasando otros valores y datos.", x = e.fileMsg ? e.fileBad ? "is-bad" : "is-ok" : "", M = on(e.sel) === "header" ? "encabezado" : "pie", S = qs(t, n), $ = Z((e.avail - 60) / i, 1, 3.2), w = u($), y = (C, D) => {
    const tt = t.bands[C].height, ht = e.sel?.kind === "band" && e.sel.band === C, Ut = t.bands[C].elements.map((G) => {
      const te = e.sel?.kind === "el" && e.sel.band === C && e.sel.id === G.id, ue = G.type === "line" ? Math.max(G.h, 1.6) : G.type === "qr" ? Math.min(G.w, G.h) : G.h, pe = G.type === "line" ? G.y - (ue - G.h) / 2 : G.y, Ne = G.type === "qr" ? Math.min(G.w, G.h) : G.w;
      return `<button type="button" class="td-rpt__hit${te ? " is-on" : ""}" data-st="rhit:${C}:${G.id}" aria-label="${$e[G.type]} en ${G.x}, ${G.y} mm" aria-pressed="${te}" style="left:${m(G.x)};top:${m(pe)};width:${m(Ne)};height:${m(ue)}">${te ? `<span class="td-studio__tag">${$e[G.type]} · ${Mt(G.w)}×${Mt(G.h)}</span><span class="td-studio__grip" data-st="rsize:${C}:${G.id}" aria-hidden="true"></span>` : ""}</button>`;
    }).join(""), de = t.bands[C].elements.map((G) => _s(G, m, r, [1, S.length || 1], t, s, o)).join("");
    return `<div class="td-rpt__bandbox" style="margin:0 ${m(l)}"><button type="button" class="td-rpt__strip${ht ? " is-on" : ""}" data-st="rband:${C}" aria-pressed="${ht}"><span>${D}</span><span>${tt} mm</span></button><div class="td-rpt__band" style="height:${m(tt)}">${de}${Ut}</div></div>`;
  }, L = e.sel?.kind === "detail", q = h.headHeight + Math.min(3, Math.max(n.length, 1)) * h.rowHeight + 2, O = `<div class="td-rpt__bandbox" style="margin:0 ${m(l)}"><button type="button" class="td-rpt__strip${L ? " is-on" : ""}" data-st="rdetail" aria-pressed="${L}"><span>Detalle · ${z(a)} · se repite por fila</span><span>${h.rowHeight} mm/fila</span></button><div class="td-rpt__band" style="height:${m(q)}">${As(t, n.slice(0, 3), m, s, o)}<button type="button" class="td-rpt__hit${L ? " is-on" : ""}" data-st="rdetail" aria-label="Tabla de detalle" aria-pressed="${L}" style="left:0;top:0;width:${m(ie(t))};height:${m(q - 2)};cursor:pointer">${L ? `<span class="td-studio__tag">Detalle · ${h.columns.length} columnas</span>` : ""}</button></div></div>`, W = ["text", "line", "box", "image", "qr", "barcode"].map((C) => `<button type="button" data-st="radd:${C}"><b>+</b> ${$e[C]}</button>`).join(""), Y = h.columns.reduce((C, D) => C + (Number(D.w) || 0), 0), k = t.parameters.length ? t.parameters.map((C, D) => `<div class="td-rpt__param"><input data-st-in="pname:${D}" value="${z(C.name)}" aria-label="Nombre del parámetro"><select data-st-in="ptype:${D}" aria-label="Tipo de ${z(C.name) || "parámetro"}"><option value="texto" ${C.type === "texto" ? "selected" : ""}>Texto</option><option value="numero" ${C.type === "numero" ? "selected" : ""}>Número</option><option value="fecha" ${C.type === "fecha" ? "selected" : ""}>Fecha</option></select><button type="button" class="td-rpt__x" data-st="pdel:${D}" aria-label="Quitar parámetro ${z(C.name) || D + 1}">×</button><button type="button" class="td-rpt__token" data-st="pins:${D}" title="Insertar en el elemento seleccionado">{?${z(C.name)}}</button></div>`).join("") : '<p class="td-rpt__hint">Todavía no hay parámetros. Agrega uno para usarlo como {?Nombre} en el reporte.</p>', H = `<div class="td-rpt__card"><span class="td-section-title">Fuente de datos · ${z(a)}</span><div class="td-rpt__chips">${g.map((C) => `<button type="button" class="td-rpt__token" data-st="fins:${C}" title="Insertar {${C}}">{${z(C)}}</button>`).join("")}</div><span class="td-section-title">Fórmulas</span><div class="td-rpt__chips">${b.map(([C, D], tt) => `<button type="button" class="td-rpt__token" data-st="qins:${tt}" title="${z(D)}">${C}</button>`).join("")}</div><p class="td-rpt__hint">Clic para insertar en el elemento seleccionado. Sin selección, se crea un texto nuevo en el ${M}.</p></div>`, R = Ns(e);
  let it = "";
  if (R && e.sel?.kind === "el") {
    const C = e.sel.band === "header" ? "encabezado" : "pie", D = Ge(R.text || "", r, [1, S.length || 1], t, s, o), tt = D.includes("#ERR");
    it = `<div class="td-rpt__head"><span class="td-section-title">${$e[R.type]} · ${C}</span><button type="button" data-st="rdup">Duplicar</button><button type="button" class="is-danger" data-st="rdel">Eliminar</button></div>
            <div class="td-rpt__geo">${[["x", "X"], ["y", "Y"], ["w", "Ancho"], ["h", "Alto"]].map(([ht, Ut]) => pt(Ut, `<input type="number" step="0.5" data-st-in="rgeo:${ht}" value="${R[ht]}" aria-label="${Ut}">`)).join("")}</div>
            ${R.text != null || R.type === "text" || R.type === "image" || R.type === "qr" || R.type === "barcode" ? `${pt(R.type === "text" ? "Texto · {?param} {campo} {=fórmula}" : R.type === "image" ? "Etiqueta de la imagen" : "Valor a codificar", `<input data-st-in="rtext" value="${z(R.text || "")}">`)}<span class="td-rpt__hint">${tt ? "No se pudo resolver. Revisa el parámetro, el campo o la fórmula." : `Vista previa: ${z(D)}`}</span>` : ""}
            ${R.type === "text" ? `<div class="td-rpt__geo td-rpt__geo--text">${pt("Alto mm", `<input type="number" step="0.2" data-st-in="rsize" value="${R.size ?? 3}">`)}${De([["left", "Izq."], ["center", "Centro"], ["right", "Der."]], R.align || "left", (ht) => `ralign:${ht}`)}</div>${xa(!!R.bold, "Negrita", "rbold")}` : ""}
            ${R.type === "barcode" ? De([["c128", "Code 128"], ["ean13", "EAN-13"]], R.format === "ean13" ? "ean13" : "c128", (ht) => `rbc:${ht}`) + xa(!!R.showText, "Texto legible", "rshow") : ""}
            ${R.type === "line" || R.type === "box" ? pt("Grosor mm", `<input type="number" step="0.1" data-st-in="rthick" value="${R.thick ?? 0.3}" style="width:90px">`) : ""}
            <p class="td-rpt__hint">Arrastra para mover. La esquina cambia el tamaño. Flechas: 0,5 mm. Mayús: 2 mm. Supr elimina.</p>`;
  } else if (L) {
    const C = Y === 100 ? "100%" : `${Y}% · la tabla los reparte al ancho completo`;
    it = `<span class="td-section-title">Banda de detalle</span>
            <div class="td-rpt__detail">${pt("Fuente", `<input data-st-in="rsrc" value="${z(a)}" aria-label="Nombre de la fuente">`)}${pt("Fila mm", `<input type="number" step="0.5" data-st-in="rrowh" value="${h.rowHeight}">`)}${pt("Título mm", `<input type="number" step="0.5" data-st-in="rheadh" value="${h.headHeight}">`)}</div>
            ${xa(h.zebra, "Filas alternadas", "rzebra")}
            <div class="td-rpt__head"><span class="td-section-title">Columnas · ${C}</span><button type="button" data-st="cadd">+ Columna</button></div>
            ${h.columns.length ? h.columns.map((D, tt) => `<div class="td-rpt__col"><input data-st-in="ctitle:${tt}" value="${z(D.title)}" aria-label="Título de la columna ${tt + 1}"><input type="number" data-st-in="cw:${tt}" value="${D.w}" aria-label="Ancho en porcentaje" title="Ancho %"><button type="button" class="td-rpt__x" data-st="cdel:${tt}" aria-label="Quitar columna ${z(D.title) || tt + 1}">×</button><input data-st-in="cexpr:${tt}" value="${z(D.expr)}" aria-label="Campo o expresión" placeholder="campo o expresión"><select class="td-rpt__span2" data-st-in="cfmt:${tt}" aria-label="Formato"><option value="" ${D.fmt ? "" : "selected"}>Texto</option><option value="number" ${D.fmt === "number" ? "selected" : ""}>Número</option><option value="money" ${D.fmt === "money" ? "selected" : ""}>Moneda</option><option value="date" ${D.fmt === "date" ? "selected" : ""}>Fecha</option></select></div>`).join("") : '<p class="td-rpt__hint">La tabla no tiene columnas. Agrega al menos una para ver las filas.</p>'}`;
  } else e.sel?.kind === "band" ? it = `<span class="td-section-title">${e.sel.band === "header" ? "Encabezado del reporte" : "Pie del reporte"}</span>${pt("Alto de la banda mm", `<input type="number" step="1" data-st-in="rbandh" value="${t.bands[e.sel.band].height}" style="width:110px">`)}<p class="td-rpt__hint">Este alto reserva espacio en cada página antes del detalle o después de él.</p>` : it = `<span class="td-section-title">Página</span>${De([["A4", "A4"], ["Carta", "Carta"]], t.page.size, (C) => `rpage:${C}`)}${pt("Margen mm", `<input type="number" step="1" data-st-in="rmargin" value="${l}" style="width:90px">`)}<p class="td-rpt__hint">Selecciona un elemento, la tabla de detalle o el nombre de una banda para editarlos.</p>`;
  const Pt = `<div class="td-rpt__tools" role="toolbar" aria-label="Insertar elemento">${W}<span class="td-rpt__hint">Se agrega en: ${M}</span></div>
        <div class="td-rpt__sheetwrap"><div class="td-rpt__sheet" style="width:${m(i)};padding:${m(l)} 0">${y("header", "Encabezado del reporte")}${O}${y("footer", "Pie del reporte")}</div></div>
        <p class="td-rpt__hint">${t.page.size} ${i} × ${c} mm · margen ${l} mm · ${t.bands.header.elements.length + t.bands.footer.elements.length} elementos · ${h.columns.length} columnas</p>`, ft = `<div class="td-rpt__sheetwrap td-rpt__sheetwrap--pages">${S.map((C, D) => `<div class="td-rpt__paper" role="img" aria-label="Página ${D + 1} de ${S.length}">${Cs(t, C, D, S.length, w, r, s, o)}</div>`).join("")}</div>`, ce = Hs(t, !1), le = e.json ?? ce, Ce = JSON.stringify({ parameters: o, dataSources: { [a]: n.slice(0, 3) } }, null, 2), Yt = `<div class="td-rpt__card"><span class="td-section-title">Plantilla .uxr · JSON editable</span><textarea data-st-in="rjson" rows="16" spellcheck="false" aria-label="Plantilla JSON">${z(le)}</textarea><div class="td-rpt__actions"><button type="button" class="td-studio__primary" data-st="rapply">Aplicar plantilla</button><button type="button" data-st="rreset">Descartar cambios</button><span class="${e.jsonBad ? "is-bad" : e.jsonMsg ? "is-ok" : ""} td-rpt__status">${z(e.jsonMsg || (e.json != null ? "Cambios sin aplicar" : "Sincronizada con el diseño"))}</span></div></div>
        <div class="td-rpt__card"><span class="td-section-title">Datos de ejecución · parámetros y fuentes</span><textarea data-st-in="rdata" rows="12" spellcheck="false" aria-label="Datos de ejecución">${z(e.dataJson ?? Ce)}</textarea><div class="td-rpt__actions"><button type="button" class="td-studio__primary" data-st="rrun">Ejecutar y ver</button><span class="${e.dataBad ? "is-bad" : ""} td-rpt__status">${z(e.dataMsg || "Ejecuta el reporte con estos datos, igual que desde el servidor.")}</span></div></div>`, Te = `var pdf = await Reports.RenderPdfAsync(
    "Reports/${Ts(t.name)}",
    parameters: new()
    {
${t.parameters.map((C) => {
    const D = o[C.name] ?? "", tt = C.type === "fecha" ? `DateTime.Parse(${JSON.stringify(String(D))})` : C.type === "numero" ? String(Number(D) || 0) : JSON.stringify(String(D));
    return `        ["${C.name}"] = ${tt}`;
  }).join(`,
`)}
    },
    dataSources: new()
    {
        ["${a}"] = db.${a}
            .Select(x => new { ${g.map((C) => `x.${C.charAt(0).toUpperCase()}${C.slice(1)}`).join(", ")} })
    });

return Results.File(pdf, "application/pdf");`, He = d === "design" ? `<div class="td-rpt__card"><div class="td-rpt__head"><span class="td-section-title">Parámetros</span><button type="button" data-st="padd">+ Parámetro</button></div>${k}</div>${H}` : d === "preview" ? `<div class="td-rpt__card"><span class="td-section-title">Parámetros del reporte</span>${t.parameters.map((C) => pt(C.name, `<input type="${C.type === "fecha" ? "date" : C.type === "numero" ? "number" : "text"}" data-st-in="rpv:${z(C.name)}" value="${z(o[C.name] ?? "")}">`)).join("")}${pt(`Filas de ${z(a)} · ${e.rows}`, `<input type="range" min="1" max="60" data-st-in="rrows" value="${e.rows}" aria-label="Cantidad de filas">`)}<button type="button" class="td-studio__primary" data-st="rpdf">Imprimir · PDF</button><p class="td-rpt__hint">${n.length} filas · ${S.length} ${S.length === 1 ? "página" : "páginas"} ${t.page.size}</p></div>` : `<div class="td-rpt__card"><div class="td-rpt__head"><span class="td-section-title">Llamada desde C#</span><button type="button" data-st="rcopy">Copiar código</button></div><pre class="td-rpt__pre">${z(Te)}</pre></div>`;
  return `<div class="td-rpt">
        <div class="td-rpt__top">
            ${pt("Plantilla", `<input data-st-in="rname" value="${z(t.name)}" aria-label="Nombre de la plantilla" style="width:200px">`)}
            ${pt("Nueva desde", `<select data-st-in="rtpl" aria-label="Plantilla de partida" style="width:170px"><option value="factura" ${e.tplKey === "factura" ? "selected" : ""}>Factura</option><option value="stock" ${e.tplKey === "stock" ? "selected" : ""}>Informe de stock</option><option value="blank" ${e.tplKey === "blank" ? "selected" : ""}>En blanco</option></select>`)}
            <label class="td-rpt__file">Abrir .uxr<input type="file" data-st-file="uxr" accept=".uxr,.json,application/json" aria-label="Abrir archivo .uxr"></label>
            <button type="button" class="td-studio__primary" data-st="rsave">Guardar .uxr</button>
            <span class="td-rpt__grow"></span>
            ${De([["design", "Diseño"], ["preview", "Vista previa"], ["code", "Programación"]], d, (C) => `rmode:${C}`)}
        </div>
        <p class="td-rpt__note ${x}" role="status">${z(v)}</p>
        <div class="td-rpt__body">
            <div class="td-rpt__side">${He}</div>
            <div class="td-rpt__stage">${d === "design" ? Pt : d === "preview" ? ft : Yt}</div>
            ${d === "design" ? `<div class="td-rpt__inspector"><div class="td-rpt__card">${it}</div></div>` : ""}
        </div>
    </div>`;
}
function fi(e, t) {
  const a = on(e.sel), n = rn(e), s = e.tpl.parameters[0]?.name || "Param1", o = ie(e.tpl), r = t === "text" ? J(0, 1, 60, 5, "Texto", 3.2) : t === "line" ? lt("line", 0, 1, o, 0.3, { thick: 0.3 }) : t === "box" ? lt("box", 0, 1, 50, 16, { thick: 0.35 }) : t === "image" ? lt("image", 0, 1, 40, 15, { text: "Imagen" }) : t === "qr" ? lt("qr", 0, 1, 20, 20, { text: `{?${s}}` }) : lt("barcode", 0, 1, 60, 14, { text: `{?${s}}`, format: "c128", showText: !0 });
  r.id = n, V(e, (i) => {
    i.bands[a].elements.push(r);
  }), e.sel = { kind: "el", band: a, id: n };
}
function hi(e, t, a, n) {
  const [s, o = "", r = ""] = a.split(":"), i = t.tpl;
  if (s === "rmode" && (o === "design" || o === "preview" || o === "code")) t.mode = o;
  else if (s === "rsave") {
    const c = Ts(i.name), l = URL.createObjectURL(new Blob([Hs(i, !0)], { type: "application/json" })), d = document.createElement("a");
    d.href = l, d.download = c, d.click(), window.setTimeout(() => URL.revokeObjectURL(l), 2e3), xt(e, t, `${c} guardado · ${i.parameters.length} parámetros · fuente ${i.bands.detail.source}`, !1, n);
  } else if (s === "rpdf") {
    const { rows: c, sources: l, params: d, sample: u } = Ke(t), p = qs(i, c), m = (v) => `${v}mm`, [h, g] = qe(i.page.size), f = `<!doctype html><html><head><meta charset="utf-8"><title>${z(i.name)}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;700&family=JetBrains+Mono:wght@500&display=swap"><style>@page{size:${h}mm ${g}mm;margin:0}html,body{margin:0;padding:0}.p{break-after:page}</style></head><body>${p.map((v, x) => `<div class="p">${Cs(i, v, x, p.length, m, u, l, d)}</div>`).join("")}</body></html>`, b = document.createElement("iframe");
    b.setAttribute("aria-hidden", "true"), b.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0", b.onload = () => window.setTimeout(() => {
      b.contentWindow?.focus(), b.contentWindow?.print(), window.setTimeout(() => b.remove(), 6e4);
    }, 400), b.srcdoc = f, document.body.appendChild(b), xt(e, t, `Listo para imprimir: ${p.length} ${p.length === 1 ? "página" : "páginas"}. En el diálogo elige Guardar como PDF. El diseño no se modificó.`, !1, n);
  } else if (s === "radd" && o in $e) fi(t, o);
  else if (s === "rband" && (o === "header" || o === "footer")) t.sel = { kind: "band", band: o };
  else if (s === "rdetail") t.sel = { kind: "detail" };
  else if (s === "rhit" && (o === "header" || o === "footer") && r) t.sel = { kind: "el", band: o, id: r };
  else if (s === "rdup" && t.sel?.kind === "el") {
    const c = t.sel.band, l = i.bands[c].elements.find((u) => u.id === (t.sel?.kind === "el" ? t.sel.id : ""));
    if (!l) return;
    const d = rn(t);
    V(t, (u) => {
      u.bands[c].elements.push({ ...l, id: d, y: Z(l.y + 3, 0, u.bands[c].height - l.h) });
    }), t.sel = { kind: "el", band: c, id: d };
  } else if (s === "rdel" && t.sel?.kind === "el") {
    const { band: c, id: l } = t.sel;
    V(t, (d) => {
      d.bands[c].elements = d.bands[c].elements.filter((u) => u.id !== l);
    }), t.sel = null;
  } else if (s === "ralign" && t.sel?.kind === "el" && (o === "left" || o === "center" || o === "right")) {
    const { band: c, id: l } = t.sel;
    V(t, (d) => {
      const u = d.bands[c].elements.find((p) => p.id === l);
      u && (u.align = o);
    });
  } else if (s === "rbold" && t.sel?.kind === "el") {
    const { band: c, id: l } = t.sel;
    V(t, (d) => {
      const u = d.bands[c].elements.find((p) => p.id === l);
      u && (u.bold = !u.bold);
    });
  } else if (s === "rshow" && t.sel?.kind === "el") {
    const { band: c, id: l } = t.sel;
    V(t, (d) => {
      const u = d.bands[c].elements.find((p) => p.id === l);
      u && (u.showText = !u.showText);
    });
  } else if (s === "rbc" && t.sel?.kind === "el" && (o === "c128" || o === "ean13")) {
    const { band: c, id: l } = t.sel;
    V(t, (d) => {
      const u = d.bands[c].elements.find((p) => p.id === l);
      u && (u.format = o);
    });
  } else if (s === "rpage" && (o === "A4" || o === "Carta")) V(t, (c) => {
    c.page.size = o;
  });
  else if (s === "padd") {
    const c = `Param${i.parameters.length + 1}`;
    V(t, (l) => {
      l.parameters.push({ name: c, type: "texto", value: "" });
    }), t.pv[c] = "";
  } else if (s === "pdel") {
    const c = Number(o), l = i.parameters[c];
    V(t, (d) => {
      d.parameters.splice(c, 1);
    }), l && delete t.pv[l.name];
  } else if (s === "pins") va(e, t, `{?${i.parameters[Number(o)]?.name || ""}}`, n);
  else if (s === "fins") va(e, t, `{${o}}`, n);
  else if (s === "qins") {
    const { source: c, rows: l } = Ke(t), u = Object.keys(l[0] || {}).find((m) => typeof (l[0] || {})[m] == "number") || "cantidad", p = [`{=sum(${c}, ${u})|number}`, `{=count(${c})}`, "Página {page} de {pages}", "{now|date}"];
    va(e, t, p[Number(o)] || "", n);
  } else if (s === "cadd") {
    const { rows: c } = Ke(t), l = Object.keys(c[0] || { campo: "" })[0] || "campo";
    V(t, (d) => {
      d.bands.detail.columns.push({ title: "Columna", expr: l, w: 12, fmt: "" });
    });
  } else if (s === "cdel") V(t, (c) => {
    c.bands.detail.columns.splice(Number(o), 1);
  });
  else if (s === "rzebra") V(t, (c) => {
    c.bands.detail.zebra = !c.bands.detail.zebra;
  });
  else if (s === "rapply")
    try {
      const c = Ps(t, JSON.parse(t.json || "{}"));
      t.jsonMsg = `Plantilla aplicada · ${c}`, t.jsonBad = !1, xt(e, t, `Plantilla “${c}” aplicada. El diseño ya usa estas bandas.`, !1, n);
    } catch (c) {
      t.jsonMsg = `No se pudo aplicar: ${c instanceof Error ? c.message : "JSON no válido"}. Revisa el texto o descarta los cambios.`, t.jsonBad = !0;
    }
  else if (s === "rreset")
    t.json = null, t.jsonMsg = "", t.jsonBad = !1;
  else if (s === "rrun")
    try {
      const c = JSON.parse(t.dataJson || "{}"), l = i.bands.detail.source;
      if (!c.dataSources || !Array.isArray(c.dataSources[l])) throw new Error(`falta dataSources.${l}, un arreglo de filas`);
      t.runData = c.dataSources, t.runParams = { ...t.pv, ...c.parameters || {} }, t.mode = "preview", t.dataMsg = "", t.dataBad = !1, xt(e, t, `Reporte ejecutado con ${c.dataSources[l].length} filas de ${l}. Estás en la vista previa.`, !1, n);
    } catch (c) {
      t.dataMsg = `No se pudo ejecutar: ${c instanceof Error ? c.message : "JSON no válido"}. Corrige los datos y vuelve a intentar.`, t.dataBad = !0;
    }
  else if (s === "rcopy") {
    const c = e.querySelector(".td-rpt__pre")?.textContent || "";
    if (!navigator.clipboard) {
      xt(e, t, "No se pudo copiar. Selecciona el código y cópialo a mano.", !0, n);
      return;
    }
    navigator.clipboard.writeText(c).then(
      () => xt(e, t, "Código C# copiado. Pégalo en el servicio que genera el PDF.", !1, n),
      () => xt(e, t, "No se pudo copiar. Selecciona el código y cópialo a mano.", !0, n)
    );
  }
}
function gi(e, t, a, n, s) {
  const o = a === "rjson" || a === "rdata";
  if (a === "rname") V(t, (r) => {
    r.name = n;
  });
  else if (a === "rtpl" && (n === "factura" || n === "stock" || n === "blank")) {
    const r = n === "blank" ? ci() : da(an()[n]);
    ua(r), t.tplKey = n, t.tpl = r, t.sel = null, t.json = null, t.runData = null, t.runParams = null, t.pv = nn(r), xt(e, t, `Plantilla “${r.name}” cargada. Lo que había en el lienzo se reemplazó.`, !1, s);
  } else if (a.startsWith("pname:")) {
    const r = Number(a.slice(6)), i = t.tpl.parameters[r];
    if (!i) return !1;
    const c = n.replace(/[^\w]/g, "");
    V(t, (l) => {
      l.parameters[r] && (l.parameters[r].name = c);
    }), c !== i.name && (t.pv[c] = t.pv[i.name] ?? i.value, delete t.pv[i.name]);
  } else if (a.startsWith("ptype:")) {
    const r = Number(a.slice(6));
    (n === "texto" || n === "numero" || n === "fecha") && V(t, (i) => {
      i.parameters[r] && (i.parameters[r].type = n);
    });
  } else if (a.startsWith("rpv:"))
    t.pv[a.slice(4)] = n, t.runParams = null;
  else if (a === "rrows")
    t.rows = Z(Number(n) || 1, 1, 60), t.runData = null;
  else if (a === "rjson")
    t.json = n, t.jsonMsg = "", t.jsonBad = !1;
  else if (a === "rdata")
    t.dataJson = n, t.dataMsg = "", t.dataBad = !1;
  else if (a.startsWith("rgeo:") && t.sel?.kind === "el") {
    const r = a.slice(5), i = Number(n);
    if (!Number.isNaN(i)) {
      const { band: c, id: l } = t.sel;
      V(t, (d) => {
        const u = d.bands[c].elements.find((p) => p.id === l);
        u && (u[r] = Mt(Math.max(0, i)));
      });
    }
  } else if (a === "rtext" && t.sel?.kind === "el") {
    const { band: r, id: i } = t.sel;
    V(t, (c) => {
      const l = c.bands[r].elements.find((d) => d.id === i);
      l && (l.text = n);
    });
  } else if (a === "rsize" && t.sel?.kind === "el") {
    const { band: r, id: i } = t.sel;
    V(t, (c) => {
      const l = c.bands[r].elements.find((d) => d.id === i);
      l && (l.size = Mt(Z(Number(n) || 1, 1, 30)));
    });
  } else if (a === "rthick" && t.sel?.kind === "el") {
    const { band: r, id: i } = t.sel, c = Mt(Z(Number(n) || 0.1, 0.1, 5));
    V(t, (l) => {
      const d = l.bands[r].elements.find((u) => u.id === i);
      d && (d.thick = c, d.type === "line" && (d.h = c));
    });
  } else if (a === "rsrc") V(t, (r) => {
    r.bands.detail.source = n.replace(/[^\w]/g, "") || "Lineas";
  });
  else if (a === "rrowh") V(t, (r) => {
    r.bands.detail.rowHeight = Z(Number(n) || 5, 4, 20);
  });
  else if (a === "rheadh") V(t, (r) => {
    r.bands.detail.headHeight = Z(Number(n) || 6, 4, 20);
  });
  else if (a === "rbandh" && t.sel?.kind === "band") {
    const r = t.sel.band;
    V(t, (i) => {
      i.bands[r].height = Z(Number(n) || 10, 5, 200);
    });
  } else a === "rmargin" ? V(t, (r) => {
    r.page.margin = Z(Number(n) || 5, 5, 30);
  }) : a.startsWith("ctitle:") ? V(t, (r) => {
    const i = r.bands.detail.columns[Number(a.slice(7))];
    i && (i.title = n);
  }) : a.startsWith("cw:") ? V(t, (r) => {
    const i = r.bands.detail.columns[Number(a.slice(3))];
    i && (i.w = Z(Number(n) || 1, 1, 100));
  }) : a.startsWith("cexpr:") ? V(t, (r) => {
    const i = r.bands.detail.columns[Number(a.slice(6))];
    i && (i.expr = n);
  }) : a.startsWith("cfmt:") && V(t, (r) => {
    const i = r.bands.detail.columns[Number(a.slice(5))];
    i && (i.fmt = n, i.align = n === "money" || n === "number" ? "right" : "left");
  });
  return o;
}
function bi(e, t, a, n) {
  const s = a.files?.[0];
  a.value = "", s && s.text().then((o) => {
    try {
      const r = Ps(t, JSON.parse(o));
      xt(e, t, `${s.name} abierto · plantilla “${r}”.`, !1, n);
    } catch (r) {
      xt(e, t, `No se pudo abrir ${s.name}: ${r instanceof Error ? r.message : "archivo no válido"}. El diseño actual sigue intacto.`, !0, n);
    }
    n();
  });
}
function $i(e, t) {
  if (e.mode !== "design" || t.button !== 0) return !1;
  const a = t.target instanceof Element ? t.target : null, n = a?.closest('[data-st^="rsize:"]'), s = a?.closest('[data-st^="rhit:"]'), o = n instanceof HTMLElement ? n : s instanceof HTMLElement ? s : null;
  if (!o?.dataset.st) return !1;
  const [, r, i] = o.dataset.st.split(":");
  if (r !== "header" && r !== "footer" || !i) return !1;
  const c = e.tpl.bands[r].elements.find((l) => l.id === i);
  return c ? (e.sel = { kind: "el", band: r, id: i }, e.drag = { band: r, id: i, mode: n ? "resize" : "move", x: c.x, y: c.y, w: c.w, h: c.h, px: t.clientX, py: t.clientY, moved: !1 }, t.preventDefault(), !0) : !1;
}
function yi(e, t) {
  const a = e.drag;
  if (!a) return;
  const n = e.tpl.bands[a.band].elements.find((l) => l.id === a.id);
  if (!n) return;
  const s = (t.clientX - a.px) / (e.scale || 1), o = (t.clientY - a.py) / (e.scale || 1);
  Math.hypot(t.clientX - a.px, t.clientY - a.py) > 3 && (a.moved = !0);
  const r = (l) => Math.round(l * 2) / 2, i = ie(e.tpl), c = e.tpl.bands[a.band].height;
  if (a.mode === "move")
    n.x = Z(r(a.x + s), 0, Math.max(0, i - a.w)), n.y = Z(r(a.y + o), 0, Math.max(0, c - a.h));
  else {
    let l = Z(r(a.w + s), 2, i - a.x), d = n.type === "line" ? a.h : Z(r(a.h + o), 2, c - a.y);
    n.type === "qr" && (l = d = Math.min(Math.max(l, d), i - a.x, c - a.y)), n.w = Mt(l), n.h = Mt(d), n.type === "text" && (n.size = Mt(Z(d * 0.78, 1.5, 20)));
  }
}
function vi(e) {
  const t = !!e.drag?.moved;
  return e.drag = null, t;
}
function xi(e, t, a) {
  if (e.mode !== "design" || e.sel?.kind !== "el") return !1;
  const { band: n, id: s } = e.sel, o = e.tpl.bands[n].elements.find((c) => c.id === s);
  if (!o) return !1;
  const r = a ? 2 : 0.5, i = { ArrowLeft: [-r, 0], ArrowRight: [r, 0], ArrowUp: [0, -r], ArrowDown: [0, r] };
  if (i[t]) {
    const [c, l] = i[t];
    return o.x = Z(Mt(o.x + c), 0, Math.max(0, ie(e.tpl) - o.w)), o.y = Z(Mt(o.y + l), 0, Math.max(0, e.tpl.bands[n].height - o.h)), !0;
  }
  return t === "Delete" || t === "Backspace" ? (e.tpl.bands[n].elements = e.tpl.bands[n].elements.filter((c) => c.id !== s), e.sel = null, e.json = null, !0) : !1;
}
function Si(e, t, a) {
  if (e.dataset.tdRptWatch === "1" || typeof ResizeObserver > "u") return;
  e.dataset.tdRptWatch = "1", new ResizeObserver(() => {
    const s = e.querySelector(".td-rpt__stage"), o = Math.round((s instanceof HTMLElement ? s.clientWidth : e.clientWidth) || 0), r = t();
    !r || !o || Math.abs(o - r.avail) < 8 || r.drag || (r.avail = o, a());
  }).observe(e);
}
const I = /* @__PURE__ */ new WeakMap(), sa = { text: "Texto", barcode: "Código de barras", qr: "Código QR", line: "Línea", box: "Recuadro" };
function wi() {
  return [
    { id: "t1", name: "Bahía 1 · Frenos", who: "J. Muñoz", c: "#ED2A24" },
    { id: "t2", name: "Bahía 2 · Motor", who: "P. Soto", c: "#2A6FDB" },
    { id: "t3", name: "Bahía 3 · Suspensión", who: "C. Vera", c: "#1E9E54" },
    { id: "t4", name: "Terreno", who: "M. Rojas", c: "#E8920C" }
  ];
}
const Gn = [["qr_code", "QR"], ["code_128", "Code 128"], ["ean_13", "EAN-13"], ["ean_8", "EAN-8"], ["code_39", "Code 39"], ["data_matrix", "DataMatrix"]];
function Bs(e) {
  return `$ ${Math.round(e).toLocaleString("es-CL")}`;
}
function P(e) {
  return e.replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t] ?? t);
}
function Xt() {
  const e = /* @__PURE__ */ new Date();
  return [e.getHours(), e.getMinutes(), e.getSeconds()].map((t) => String(t).padStart(2, "0")).join(":");
}
function et(e, t, a) {
  return Math.max(t, Math.min(a, e));
}
function Me(e) {
  return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
function at(e) {
  const [t, a, n] = e.split("-").map(Number);
  return new Date(t, a - 1, n);
}
function Dt(e, t) {
  const a = at(e);
  return a.setDate(a.getDate() + t), Me(a);
}
function cn(e) {
  const t = at(e);
  return Dt(e, -((t.getDay() + 6) % 7));
}
function Lt(e) {
  return `${String(Math.floor(e / 60)).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}`;
}
function Kn(e) {
  const t = /^(\d{1,2}):(\d{2})$/.exec(e.trim());
  return t ? et(Number(t[1]) * 60 + Number(t[2]), 0, 1440) : 540;
}
function Ei(e, t) {
  const a = e.querySelector("[data-td-sch-out]");
  a && (a.value = JSON.stringify(t.sch.events.map((n) => ({
    Id: n.id,
    Title: n.title,
    Date: n.date,
    Start: Lt(n.s),
    End: Lt(n.e),
    ResourceId: n.res,
    Note: n.note
  }))).replace(/</g, "\\u003c"));
}
function js(e, t) {
  t.sch.readOnly = e.dataset.readonly === "true", t.sch.field = e.dataset.field || "";
  const a = e.dataset.agenda || "";
  if (t.sch.source = a, !!a)
    try {
      const n = JSON.parse(a);
      if (n.date && /^\d{4}-\d{2}-\d{2}$/.test(n.date) && (t.sch.date = n.date), (n.view === "day" || n.view === "week" || n.view === "month" || n.view === "agenda" || n.view === "res") && (t.sch.view = n.view), Array.isArray(n.resources)) {
        const s = ["#ED2A24", "#2A6FDB", "#1E9E54", "#E8920C", "#7A4DFF", "#0E7C86"];
        t.sch.resources = n.resources.filter((o) => o.id && o.name).map((o, r) => ({
          id: String(o.id),
          name: String(o.name),
          who: o.person || "",
          c: o.color || s[r % s.length]
        }));
      }
      if (Array.isArray(n.appointments)) {
        const s = t.sch.resources[0]?.id || "";
        t.sch.events = n.appointments.filter((o) => o.date && o.title).map((o, r) => ({
          id: o.id ? String(o.id) : String(r + 1),
          date: String(o.date),
          res: o.resourceId ? String(o.resourceId) : s,
          s: Kn(o.start || "09:00"),
          e: Kn(o.end || "10:00"),
          title: String(o.title),
          note: o.note || ""
        })), t.sch.seq = 100, t.sch.dlg = null, t.sch.drag = null;
      }
    } catch {
    }
}
function Rs(e) {
  return { code: e.code, name: e.name, brand: e.brand, price: Bs(e.price), stock: String(e.stock), url: `https://uiuxblazor.dev/r/${e.code}` };
}
function ln(e) {
  return e.record ?? Rs(wt[e.rec] ?? wt[0]);
}
function dn(e, t) {
  return e.replace(/\{(\w+)\}/g, (a, n) => t[n] ?? a);
}
function Ot(e, t, a) {
  return `<button type="button" class="td-rpt__switch" role="switch" aria-checked="${e}" data-st="${a}"><span class="td-rpt__track ${e ? "is-on" : ""}" aria-hidden="true"></span>${t}</button>`;
}
function un(e) {
  const t = Math.max(220, (e.avail || 640) - 52);
  return Math.max(2.2, Math.min(7.2, t / e.w));
}
function Jn(e) {
  const t = e >= -50 ? 4 : e >= -62 ? 3 : e >= -74 ? 2 : 1;
  return `<span class="td-code__bars" aria-hidden="true">${[6, 9, 12, 14].map((a, n) => `<i style="height:${a}px;background:${n < t ? "var(--td-color-text)" : "var(--td-color-border-strong)"}"></i>`).join("")}</span>`;
}
const Ie = /* @__PURE__ */ new Map(), Fe = /* @__PURE__ */ new Map();
function Mi(e, t) {
  const a = `${e}
${t}`, n = Ie.get(a);
  if (n) return n;
  const s = Ua(e === "ean13" ? "ean13" : "code128", t, 1, 40, "#0A0B0C", !1), o = { error: !!s.error, svg: s.svg, value: s.value || t };
  return Ie.size > 96 && Ie.clear(), Ie.set(a, o), o;
}
function Li(e) {
  const t = e, a = Fe.get(t);
  if (a) return a;
  const n = Wa(t, "M", 2).svg;
  return Fe.size > 96 && Fe.clear(), Fe.set(t, n), n;
}
const Sa = /* @__PURE__ */ new WeakMap();
function ki(e) {
  Sa.has(e) || Sa.set(e, requestAnimationFrame(() => {
    Sa.delete(e), e.isConnected && B(e);
  }));
}
const Le = /* @__PURE__ */ new WeakMap();
let Wt = null;
function _i(e) {
  if (e.vibrate && navigator.vibrate?.(35), !e.beep || typeof AudioContext > "u") return;
  Wt ??= new AudioContext();
  const t = Wt.createOscillator(), a = Wt.createGain();
  t.type = "square", t.frequency.value = 988, a.gain.setValueAtTime(0.045, Wt.currentTime), a.gain.exponentialRampToValueAtTime(1e-3, Wt.currentTime + 0.08), t.connect(a), a.connect(Wt.destination), t.start(), t.stop(Wt.currentTime + 0.09);
}
function Qn(e) {
  return wt.find((t) => t.code === e || e.endsWith(`/${t.code}`));
}
const Zn = {
  hs: "~HS",
  jc: "~JC",
  ztest: "^XA^FO20,20^A0N,36,36^FDPrueba UiuxBlazor^FS^XZ",
  init: "ESC @",
  cut: "GS V 0",
  ticket: "UiuxBlazor",
  cpcl: `! 0 200 200 210 1\r
TEXT 4 0 30 30 PRUEBA\r
PRINT\r
`,
  size: "SIZE 62 mm,40 mm",
  cls: "CLS",
  tspl: `TEXT 30,30,"3",0,1,1,"PRUEBA"\r
PRINT 1\r
`
};
function Ai(e) {
  return e === "ZPL" ? [["Estado ~HS", "hs"], ["Calibrar", "jc"], ["Etiqueta de prueba", "ztest"]] : e === "CPCL" ? [["Etiqueta CPCL", "cpcl"]] : e === "TSPL" ? [["Tamaño", "size"], ["Limpiar", "cls"], ["Imprimir", "tspl"]] : [["Inicializar", "init"], ["Texto", "ticket"], ["Corte", "cut"]];
}
function qi() {
  const e = Me(/* @__PURE__ */ new Date()), t = cn(e), a = [[0, "t1", 480, 570, "Cambio de pastillas · CBTR-45"], [0, "t2", 540, 690, "Diagnóstico turbo · HJKL-22"], [0, "t3", 600, 660, "Alineación · FGRT-90"], [1, "t1", 510, 600, "Discos ventilados · PLMN-12"], [1, "t4", 480, 720, "Visita flota Minera Los Robles"], [1, "t2", 780, 900, "Cambio de embrague · XZCV-77"], [2, "t3", 540, 630, "Amortiguadores · QWER-31"], [2, "t1", 570, 630, "Revisión sistema neumático"], [2, "t1", 600, 690, "Válvula relé · BNMK-08"], [2, "t2", 840, 960, "Mantención 300.000 km"], [3, "t2", 480, 570, "Filtros · CBTR-45"], [3, "t3", 660, 750, "Muelles · TYUI-55"], [4, "t1", 540, 660, "Kit de frenos · Buses Andinos"], [5, "t4", 540, 720, "Operativo sábado · Frío Norte"]];
  return {
    msg: "",
    timer: 0,
    labelDrag: null,
    label: {
      w: 62,
      h: 40,
      dpi: 203,
      mode: "design",
      grid: !0,
      sel: "e1",
      rec: 0,
      record: null,
      copies: 1,
      printer: "zebra",
      nid: 8,
      json: "",
      jsonMsg: "",
      jsonBad: !1,
      jobs: [],
      batch: JSON.stringify(wt.slice(0, 3).map(Rs), null, 2),
      avail: 720,
      els: [
        { id: "e1", type: "text", x: 3, y: 3, w: 56, h: 4.2, text: "{name}", size: 3.4, bold: !0, align: "left" },
        { id: "e2", type: "text", x: 3, y: 7.6, w: 56, h: 3.2, text: "{brand} · {code}", size: 2.5, bold: !1, align: "left" },
        { id: "e3", type: "text", x: 3, y: 11.2, w: 40, h: 6, text: "{price}", size: 5.2, bold: !0, align: "left" },
        { id: "e4", type: "line", x: 3, y: 18.6, w: 56, h: 0.4, thick: 0.4 },
        { id: "e5", type: "barcode", x: 3, y: 20.5, w: 38, h: 16, text: "{code}", format: "c128", showText: !0 },
        { id: "e6", type: "qr", x: 45, y: 21, w: 14, h: 14, text: "{url}" },
        { id: "e7", type: "box", x: 44, y: 11, w: 15, h: 6.2, thick: 0.35 },
        { id: "e8", type: "text", x: 44, y: 12.4, w: 15, h: 3.4, text: "STOCK {stock}", size: 2.3, bold: !0, align: "center" }
      ]
    },
    report: li(),
    print: {
      sel: "zd421",
      copies: 1,
      raw: "~HS",
      log: [{ t: Xt(), dir: "SYS", msg: "Listo. Zebra ZD421 conectada en 192.168.1.40:9100." }],
      scan: null,
      wifi: !1,
      wf: { name: "", ip: "", port: "9100", proto: "ZPL" },
      wfMsg: "",
      wfBad: !1,
      scanTimer: 0,
      devs: [
        { id: "zd421", name: "Zebra ZD421", model: "ZD421d · 203 dpi", conn: "wifi", addr: "192.168.1.40:9100", proto: "ZPL", dpi: 203, width: 104, status: "connected", rssi: -48, def: !0, fw: "V93.21.15Z", jobs: 128 },
        { id: "ql820", name: "Brother QL-820NWB", model: "QL-820NWB · 300 dpi", conn: "wifi", addr: "192.168.1.52:9100", proto: "ESC/P", dpi: 300, width: 62, status: "disconnected", rssi: -66, fw: "1.21", jobs: 42, unreachable: !0 },
        { id: "zq520", name: "Zebra ZQ520", model: "ZQ520 móvil · 203 dpi", conn: "bt", addr: "AC:3F:A4:12:9B:07", proto: "CPCL", dpi: 203, width: 104, status: "disconnected", rssi: -61, battery: 82, fw: "V85.20.19", jobs: 311 }
      ]
    },
    hid: { on: !0, ignore: !1, minLen: 4, gap: 60, count: 0, last: null, log: [], buf: "", lastAt: 0 },
    scan: { mode: "continuous", on: !1, formats: ["qr_code", "code_128", "ean_13", "ean_8"], wedge: !0, beep: !0, vibrate: !0, dedupe: 1500, reads: [], last: null, waiting: !1, manual: "", err: "", lastCode: "", lastAt: 0, buf: "", bufAt: 0, sim: 0, cams: [], camId: "", torch: !1, torchOk: !1 },
    sch: { view: "week", date: e, hide: [], resources: wi(), seq: 100, dlg: null, tried: !1, drag: null, skipClick: !1, field: "", readOnly: !1, source: "", events: a.map((n, s) => ({ id: String(s + 1), date: Dt(t, n[0]), res: n[1], s: n[2], e: n[3], title: n[4], note: "" })) }
  };
}
function ot(e, t) {
  const a = I.get(e);
  a && (a.msg = t, window.clearTimeout(a.timer), B(e), a.timer = window.setTimeout(() => {
    a.msg = "", e.isConnected && B(e);
  }, 3200));
}
function B(e) {
  const t = I.get(e);
  if (!t) return;
  const a = document.activeElement, n = a instanceof HTMLElement && e.contains(a) ? a.getAttribute("data-st-in") : null, s = a instanceof HTMLInputElement || a instanceof HTMLTextAreaElement ? a.selectionStart : null;
  if (e.dataset.kind === "scheduler" && (t.sch.readOnly = e.dataset.readonly === "true", t.sch.field = e.dataset.field || ""), e.innerHTML = `<p class="td-studio__msg" role="status">${P(t.msg || " ")}</p>${Di(e.dataset.kind || "", t)}`, e.dataset.kind === "scheduler" && Ei(e, t), e.dataset.kind === "labeldesigner" && (e.dataset.lbScale = String(un(t.label))), Ds(e), !n) return;
  const o = e.querySelector(`[data-st-in="${CSS.escape(n)}"]`);
  o instanceof HTMLElement && (o.focus(), (o instanceof HTMLInputElement || o instanceof HTMLTextAreaElement) && s != null && o.type !== "checkbox" && o.type !== "range" && o.setSelectionRange(s, s));
}
function Ds(e) {
  const t = Le.get(e), a = I.get(e);
  if (!t || !a?.scan.on) return;
  const n = e.querySelector("[data-st-video]");
  n instanceof HTMLVideoElement && (n.srcObject !== t && (n.srcObject = t), n.paused && n.play().catch(() => {
  }));
}
function Ci(e, t) {
  const a = dn(e.text || "", t);
  if (e.type === "text") {
    const n = e.align === "center" ? "middle" : e.align === "right" ? "end" : "start";
    return `<text x="${e.align === "center" ? e.w / 2 : e.align === "right" ? e.w : 0}" y="${(e.size || 3) * 0.82}" font-size="${e.size || 3}" font-weight="${e.bold ? 700 : 400}" text-anchor="${n}" fill="#0A0B0C">${P(a)}</text>`;
  }
  if (e.type === "line") return `<rect width="${e.w}" height="${e.thick || 0.3}" fill="#0A0B0C"/>`;
  if (e.type === "box") return `<rect width="${e.w}" height="${e.h}" fill="none" stroke="#0A0B0C" stroke-width="${e.thick || 0.3}"/>`;
  if (e.type === "barcode") {
    const n = Mi(e.format === "ean13" ? "ean13" : "c128", a), s = e.h * (e.showText ? 0.78 : 1);
    return (n.error ? '<text y="3" font-size="2" fill="#C62828">Valor no válido</text>' : Xn(n.svg, 0, 0, e.w, s)) + (e.showText && !n.error ? `<text x="${e.w / 2}" y="${e.h - 0.4}" font-size="2.2" text-anchor="middle">${P(n.value)}</text>` : "");
  }
  return Xn(Li(a || " "), 0, 0, e.w, e.h);
}
function Ti(e) {
  const t = e.label, a = ln(t), n = un(t), s = t.els.map((r) => `<g data-lb="${P(r.id)}" transform="translate(${r.x} ${r.y})">${Ci(r, a)}</g>`).join(""), o = t.mode === "design" ? t.els.map((r) => {
    const i = r.id === t.sel;
    return `<button type="button" class="td-studio__hit ${i ? "is-on" : ""}" data-st="sel:${r.id}" style="left:${r.x * n}px;top:${r.y * n}px;width:${r.w * n}px;height:${Math.max(r.h, r.type === "line" ? 1.2 : r.h) * n}px" aria-label="${sa[r.type]}">${i ? `<span class="td-studio__tag">${sa[r.type]}</span><span class="td-studio__grip" data-st="resize:${r.id}" aria-hidden="true"></span>` : ""}</button>`;
  }).join("") : "";
  return `<div class="td-studio__well"><div class="td-studio__stage ${t.grid ? "is-grid" : "is-plain"}" style="width:${t.w * n}px;height:${t.h * n}px;background-size:${5 * n}px ${5 * n}px">
        <svg viewBox="0 0 ${t.w} ${t.h}" width="100%" height="100%" role="img" aria-label="Etiqueta ${t.w} por ${t.h} milímetros">${s}</svg>${o}</div></div>`;
}
function Xn(e, t, a, n, s) {
  return e.replace("<svg ", `<svg x="${t}" y="${a}" width="${n}" height="${s}" `);
}
function Ba(e) {
  const t = e.label, a = ln(t), n = (o) => Math.round(o * t.dpi / 25.4), s = ["^XA", "^CI28", `^PW${n(t.w)}`, `^LL${n(t.h)}`];
  for (const o of t.els) {
    const r = dn(o.text || "", a).replace(/[\^~]/g, " "), i = `^FO${n(o.x)},${n(o.y)}`;
    o.type === "text" ? s.push(`${i}^A0N,${n(o.size || 3)},${n(o.size || 3)}^FD${r}^FS`) : o.type === "line" || o.type === "box" ? s.push(`${i}^GB${n(o.w)},${n(o.type === "line" ? o.thick || 0.3 : o.h)},${Math.max(1, n(o.thick || 0.3))}^FS`) : o.type === "barcode" ? s.push(`${i}^BCN,${n(o.h)},${o.showText ? "Y" : "N"},N,N^FD${r}^FS`) : s.push(`${i}^BQN,2,4^FDMA,${r}^FS`);
  }
  return s.push(`^PQ${t.copies},0,1,Y`, "^XZ"), s.join(`
`);
}
function Hi(e) {
  const t = e.label, a = t.els.find((d) => d.id === t.sel), n = ln(t), s = [[50, 25, "Estantería"], [62, 40, "Producto"], [40, 30, "Pequeña"], [100, 50, "Caja"], [100, 150, "Envío"]], o = t.json || JSON.stringify({ size: { width: t.w, height: t.h, dpi: t.dpi }, elements: t.els.map(({ id: d, ...u }) => u) }, null, 2), r = a?.align ?? "left";
  let i = 0, c = !1;
  try {
    const d = JSON.parse(t.batch || "[]");
    i = Array.isArray(d) ? d.length : 0, c = !Array.isArray(d);
  } catch {
    c = !0;
  }
  const l = `${Math.round(t.w * t.dpi / 25.4)} × ${Math.round(t.h * t.dpi / 25.4)} puntos`;
  return `<div class="td-studio__bar">
        <div class="td-studio__field"><span class="td-section-title">Tamaño de etiqueta</span><div class="td-code__pills">${s.map(([d, u, p]) => `<button type="button" class="td-code__pill" data-st="size:${d}x${u}" aria-pressed="${t.w === d && t.h === u}" title="${p}">${d}×${u} ${p}</button>`).join("")}</div></div>
        <label>Ancho mm<input data-st-in="lw" value="${t.w}" inputmode="numeric"></label>
        <label>Alto mm<input data-st-in="lh" value="${t.h}" inputmode="numeric"></label>
        <div class="td-studio__field"><span class="td-section-title">Resolución</span><div class="td-ecom__seg" role="group" aria-label="Resolución"><button type="button" data-st="dpi:203" aria-pressed="${t.dpi === 203}">203 dpi</button><button type="button" data-st="dpi:300" aria-pressed="${t.dpi === 300}">300 dpi</button></div></div>
        <span class="td-code__grow"></span>
        <div class="td-studio__field"><span class="td-section-title">Modo</span><div class="td-ecom__seg" role="group" aria-label="Modo"><button type="button" data-st="mode:design" aria-pressed="${t.mode === "design"}">Diseño</button><button type="button" data-st="mode:code" aria-pressed="${t.mode === "code"}">Programación</button></div></div>
    </div>
    <div class="td-studio__work">
        <div class="td-studio__canvas">
            ${t.mode === "design" ? `<div class="td-studio__tools" role="toolbar" aria-label="Elementos">${["text", "barcode", "qr", "line", "box"].map((d) => `<button type="button" data-st="add:${d}"><b>+</b> ${sa[d]}</button>`).join("")}<span class="td-code__rule" aria-hidden="true"></span>${Ot(t.grid, "Cuadrícula", "grid")}</div>` : ""}
            ${Ti(e)}
            <p class="td-studio__dims">${t.w} × ${t.h} mm · ${l} · ${t.els.length} elementos${t.mode === "design" ? " · arrastra para mover, esquina roja para el tamaño, flechas 0,5 mm" : ` · vista con ${P(n.code)}`}</p>
        </div>
        <div class="td-studio__side">
            ${t.mode === "design" ? `<div class="td-studio__inspector"><label>Datos de vista previa<select data-st-in="rec">${wt.slice(0, 8).map((d, u) => `<option value="${u}" ${u === t.rec ? "selected" : ""}>${P(d.code)} · ${P(d.name)}</option>`).join("")}</select></label>
                <span class="td-section-title">Variables · clic para insertar</span>
                <div class="td-code__pills">${Object.keys(n).map((d) => `<button type="button" class="td-rpt__token" data-st="var:${d}" title="${P(n[d])}" ${a?.text == null ? "disabled" : ""}>{${d}}</button>`).join("")}</div>
            </div>
            ${a ? `<div class="td-studio__inspector">
                <div class="td-studio__head"><span class="td-section-title">${sa[a.type]}</span><button type="button" data-st="dup">Duplicar</button><button type="button" class="is-danger" data-st="del">Eliminar</button></div>
                <div class="td-studio__geo">${[["x", "X"], ["y", "Y"], ["w", "Ancho"], ["h", "Alto"]].map(([d, u]) => `<label>${u}<input data-st-in="geo:${d}" value="${a[d]}" inputmode="decimal"></label>`).join("")}</div>
                ${a.text != null ? `<label>Contenido<input data-st-in="text" value="${P(a.text)}"></label><span class="td-studio__dims">→ ${P(dn(a.text, n))}</span>` : ""}
                ${a.type === "text" ? `<div class="td-studio__bar"><label>Alto mm<input data-st-in="size" value="${a.size ?? 3}" inputmode="decimal"></label><div class="td-ecom__seg" role="group" aria-label="Alineación">${[["left", "Izquierda"], ["center", "Centro"], ["right", "Derecha"]].map(([d, u]) => `<button type="button" data-st="align:${d}" aria-pressed="${r === d}">${u}</button>`).join("")}</div></div>${Ot(!!a.bold, "Negrita", "bold")}` : ""}
                ${a.type === "barcode" ? `<div class="td-ecom__seg" role="group" aria-label="Formato"><button type="button" data-st="bcfmt:c128" aria-pressed="${a.format !== "ean13"}">Code 128</button><button type="button" data-st="bcfmt:ean13" aria-pressed="${a.format === "ean13"}">EAN-13</button></div>${Ot(!!a.showText, "Mostrar texto", "showtext")}` : ""}
                ${a.type === "line" || a.type === "box" ? `<label>Grosor mm<input data-st-in="thick" value="${a.thick ?? 0.3}" inputmode="decimal"></label>` : ""}
                <p class="td-studio__dims">Supr elimina el elemento seleccionado.</p>
            </div>` : '<div class="td-studio__inspector"><p class="td-studio__dims">Selecciona un elemento de la etiqueta para editar su posición, tamaño y contenido, o agrega uno desde la barra.</p></div>'}` : `<div class="td-studio__inspector"><span class="td-section-title">Plantilla JSON · editable</span><textarea data-st-in="json" rows="18" spellcheck="false" aria-label="Plantilla JSON">${P(o)}</textarea>
                <div class="td-rpt__actions"><button type="button" class="td-studio__primary" data-st="applyjson">Aplicar JSON</button><button type="button" data-st="resetjson">Descartar cambios</button><span class="${t.jsonBad ? "td-rpt__status is-bad" : "td-rpt__status"}">${P(t.jsonMsg || "Sincronizado con el diseño")}</span></div></div>`}
        </div>
    </div>
    ${t.mode === "code" ? `<div class="td-code__pair"><div class="td-studio__inspector"><div class="td-studio__head"><span class="td-section-title">ZPL generado · ${t.dpi} dpi</span><button type="button" data-st="copyzpl">Copiar</button><button type="button" data-st="dlzpl">Descargar .zpl</button></div><pre class="td-studio__zpl">${P(Ba(e))}</pre></div>
        <div class="td-studio__inspector"><span class="td-section-title">Lote · una etiqueta por registro</span><textarea data-st-in="batch" rows="12" spellcheck="false" aria-label="Datos del lote en JSON">${P(t.batch)}</textarea>
        <div class="td-rpt__actions"><button type="button" class="td-studio__primary" data-st="printbatch" ${c || !i ? "disabled" : ""}>Imprimir lote</button><span class="${c ? "td-rpt__status is-bad" : "td-studio__dims"}">${c ? "El lote debe ser un arreglo JSON." : `${i} registros · ${t.copies} ${t.copies === 1 ? "copia" : "copias"} cada uno`}</span></div></div></div>` : ""}
    <div class="td-studio__print">
        <label>Impresora<select data-st-in="printer"><option value="browser" ${t.printer === "browser" ? "selected" : ""}>Navegador</option><option value="zebra" ${t.printer === "zebra" ? "selected" : ""}>Zebra ZD421 · 203 dpi</option><option value="zebra300" ${t.printer === "zebra300" ? "selected" : ""}>Zebra ZT411 · 300 dpi</option></select></label>
        <label>Copias<div class="td-studio__step"><button type="button" data-st="copdec" aria-label="Menos copias">−</button><input data-st-in="copies" value="${t.copies}" inputmode="numeric" aria-label="Número de copias"><button type="button" data-st="copinc" aria-label="Más copias">+</button></div></label>
        <button type="button" class="td-studio__primary" data-st="print">Imprimir ${t.copies} ${t.copies === 1 ? "copia" : "copias"}</button>
        <div class="td-studio__jobs">${t.jobs.map((d) => `<span><b>✓</b> ${d.t} ${P(d.text)}</span>`).join("")}</div>
    </div>`;
}
function Yn(e) {
  return e.unreachable && e.status === "disconnected" ? "error" : e.status;
}
function Ni(e) {
  const t = e.print, a = t.devs.find((d) => d.id === t.sel), n = { connected: ["Conectada", "var(--td-color-success)"], connecting: ["Conectando…", "var(--td-color-warning)"], disconnected: ["Desconectada", "var(--td-color-text-muted)"], error: ["Sin respuesta", "var(--td-color-danger)"], printing: ["Imprimiendo…", "var(--td-color-info)"] }, s = typeof navigator < "u" && "bluetooth" in navigator, o = !!(t.scan && t.scan.pr < 100), r = a ? Yn(a) : "disconnected", i = a?.status === "connected", c = a ? [["Conexión", a.conn === "bt" ? "Bluetooth" : "Wi‑Fi"], ["Dirección", a.addr], ["Lenguaje", a.proto], ["Resolución", `${a.dpi} dpi`], ["Ancho", `${a.width} mm`], ["Firmware", a.fw], ["Trabajos", String(a.jobs)], ...a.battery != null ? [["Batería", `${a.battery} %`]] : []] : [], l = t.log.length ? t.log : [{ t: "", dir: "—", msg: "Sin eventos en la consola." }];
  return `<div class="td-studio__bar"><button type="button" class="td-studio__primary" data-st="btscan" ${o ? "disabled" : ""}>Buscar Bluetooth</button><button type="button" data-st="wifi" aria-expanded="${t.wifi}">Agregar por Wi‑Fi</button>
        <span class="td-studio__chips"><span class="td-studio__chip" title="${s ? "Este navegador expone Web Bluetooth" : "Este navegador no expone Web Bluetooth"}"><i style="background:${s ? "var(--td-color-success)" : "var(--td-color-text-muted)"}"></i>Bluetooth ${s ? "disponible" : "no disponible"}</span><span class="td-studio__chip" title="La red Wi‑Fi se simula: el navegador no abre el puerto 9100"><i style="background:var(--td-color-warning)"></i>Agente local simulado</span><span class="td-studio__chip" title="Puerto crudo de impresoras térmicas"><i style="background:var(--td-color-info)"></i>Wi‑Fi puerto 9100</span></span></div>
        ${t.scan ? `<section class="td-prn__panel"><div class="td-studio__head"><strong>${o ? "Buscando impresoras Bluetooth" : "Búsqueda terminada"}</strong><span class="td-studio__dims">${t.scan.found.length} encontrados · ${t.scan.pr} %</span><span class="td-code__grow"></span><button type="button" data-st="webbt">Selector del navegador</button><button type="button" data-st="scanclose">${o ? "Cancelar" : "Cerrar"}</button></div>
            <div class="td-prn__meter" role="progressbar" aria-valuenow="${t.scan.pr}" aria-valuemin="0" aria-valuemax="100" aria-label="Progreso de búsqueda"><span style="width:${t.scan.pr}%"></span></div>
            <div role="list">${t.scan.found.map((d) => {
    const u = t.devs.some((p) => p.addr === d.mac);
    return `<div role="listitem" class="td-prn__hit"><span class="td-prn__name">${P(d.name)}<small>${P(d.mac)} · ${P(d.proto)} · batería ${d.battery} %</small></span>${Jn(d.rssi)}<span class="td-studio__dims">${d.rssi} dBm</span><button type="button" data-st="pair:${d.mac}" ${u ? "disabled" : ""}>${u ? "Emparejada" : "Emparejar"}</button></div>`;
  }).join("") || '<p class="td-studio__dims">Acerca la impresora y enciéndela en modo emparejamiento.</p>'}</div></section>` : ""}
        ${t.wifi ? `<section class="td-prn__panel"><strong>Agregar impresora de red</strong><div class="td-prn__form"><label>Nombre<input data-st-in="wf-name" value="${P(t.wf.name)}" placeholder="Zebra bodega 2"></label><label>Dirección IP<input data-st-in="wf-ip" value="${P(t.wf.ip)}" placeholder="192.168.1.60" inputmode="decimal"></label><label>Puerto<input data-st-in="wf-port" value="${P(t.wf.port)}" placeholder="9100" inputmode="numeric"></label><label>Lenguaje<select data-st-in="wf-proto"><option value="ZPL" ${t.wf.proto === "ZPL" ? "selected" : ""}>ZPL · Zebra</option><option value="ESC/POS" ${t.wf.proto === "ESC/POS" ? "selected" : ""}>ESC/POS · tickets</option><option value="CPCL" ${t.wf.proto === "CPCL" ? "selected" : ""}>CPCL · móviles</option><option value="TSPL" ${t.wf.proto === "TSPL" ? "selected" : ""}>TSPL · TSC</option></select></label></div>
            <div class="td-rpt__actions"><button type="button" class="td-studio__primary" data-st="wfadd">Probar y agregar</button><button type="button" data-st="wifi">Cancelar</button><span class="${t.wfBad ? "td-rpt__status is-bad" : "td-rpt__status"}">${P(t.wfMsg)}</span></div>
            <p class="td-studio__dims">El navegador no abre sockets TCP. La conexión Wi‑Fi pasa por un agente local o por el servidor, que envía los datos crudos al puerto 9100.</p></section>` : ""}
        <div class="td-prn"><div class="td-prn__list" role="listbox" aria-label="Impresoras"><span class="td-section-title">Dispositivos · ${t.devs.length}</span>
            ${t.devs.map((d) => {
    const [u, p] = n[Yn(d)];
    return `<button type="button" class="td-prn__dev" role="option" data-st="seldev:${d.id}" aria-pressed="${d.id === t.sel}"><span class="td-prn__mark" aria-hidden="true">${d.conn === "bt" ? "BT" : "IP"}</span><span class="td-prn__name">${P(d.name)}${d.def ? "<em>Predet.</em>" : ""}<small>${d.conn === "bt" ? "Bluetooth" : "Wi‑Fi"} · ${P(d.addr)}</small></span><span class="td-prn__side"><span style="color:${p}"><i style="background:${p}"></i>${u}</span>${Jn(d.rssi)}</span></button>`;
  }).join("")}
        </div>
        ${a ? `<div class="td-prn__detail"><section class="td-prn__panel"><div class="td-prn__hero"><span class="td-prn__mark is-lg" aria-hidden="true">${a.conn === "bt" ? "BT" : "IP"}</span><div><strong>${P(a.name)}</strong><span class="td-studio__dims">${P(a.model)} · ${P(a.addr)}</span><span class="td-studio__chip"><i style="background:${n[r][1]}"></i>${n[r][0]}</span></div>
            <div class="td-ecom__nav"><button type="button" class="td-studio__primary" data-st="conn" ${a.status === "connecting" || a.status === "printing" ? "disabled" : ""}>${a.status === "connected" || a.status === "printing" ? "Desconectar" : "Conectar"}</button><button type="button" data-st="def" ${a.def ? "disabled" : ""}>Predeterminada</button><button type="button" class="is-danger" data-st="forget">Olvidar</button></div></div>
            ${a.err || a.unreachable ? `<p class="td-prn__alert" role="alert">${P(a.err || "No responde en el puerto 9100. Revisa que esté encendida y en la misma red.")}</p>` : ""}
            <div class="td-prn__info">${c.map(([d, u]) => `<div><span>${d}</span><b>${P(u)}</b></div>`).join("")}</div></section>
            <div class="td-code__pair"><section class="td-prn__panel"><span class="td-section-title">Impresión de prueba</span><p class="td-studio__dims">Imprime una etiqueta corta para confirmar conexión, lenguaje y ancho útil.</p><div class="td-rpt__actions"><div class="td-studio__step"><button type="button" data-st="pcopdec" aria-label="Menos copias">−</button><input data-st-in="pcopies" value="${t.copies}" inputmode="numeric" aria-label="Copias de prueba"><button type="button" data-st="pcopinc" aria-label="Más copias">+</button></div><button type="button" class="td-studio__primary" data-st="test" ${i ? "" : "disabled"}>Imprimir prueba</button></div></section>
            <section class="td-prn__panel"><span class="td-section-title">Comando directo · ${P(a.proto)}</span><div class="td-code__pills">${Ai(a.proto).map(([d, u]) => `<button type="button" class="td-rpt__token" data-st="preset:${u}">${d}</button>`).join("")}</div><textarea data-st-in="raw" rows="4" spellcheck="false" aria-label="Comando crudo">${P(t.raw)}</textarea><button type="button" data-st="send" ${i ? "" : "disabled"}>Enviar ${new TextEncoder().encode(t.raw).length} bytes</button></section></div>
            <div class="td-prn__console"><div class="td-studio__head"><span>Consola</span><span class="td-code__grow"></span><button type="button" data-st="clearlog">Limpiar</button></div><div role="log" aria-live="polite">${l.map((d) => `<p><span>${d.t}</span><b>${d.dir}</b><span>${P(d.msg)}</span></p>`).join("")}</div></div></div>` : '<p class="td-studio__dims">No queda ninguna impresora. Busca por Bluetooth o agrega una por Wi‑Fi.</p>'}</div>`;
}
function Pi(e) {
  const t = e.hid;
  return `<p class="td-code__lead">Este componente no necesita foco en un campo: escucha las teclas que un lector USB, Bluetooth o RF emite al documento. Apunta el lector a un código, o usa Simular lectura para probar sin hardware.</p>
        <div class="td-hid"><div class="td-hid__controls">${Ot(t.on, "Escuchando en segundo plano", "hidon")}${Ot(t.ignore, "Ignorar si el foco está en un campo", "hidignore")}
            <label>Longitud mínima válida<input data-st-in="min" type="number" min="1" value="${t.minLen}"></label>
            <label>Tolerancia entre teclas · ${t.gap} ms<input data-st-in="gap" type="range" min="20" max="200" step="10" value="${t.gap}"></label>
            <div class="td-ecom__nav"><button type="button" class="td-studio__primary" data-st="hidsim">Simular lectura</button><button type="button" data-st="hidclear">Limpiar</button></div>
        </div><div class="td-hid__main"><section class="td-studio__inspector" role="status"><div class="td-studio__head"><span class="td-section-title">Última lectura</span><span class="td-studio__dims">${t.count} en total</span></div>
            ${t.last ? `<strong class="td-hid__code">${P(t.last.code)}</strong><span class="${t.last.name ? "td-rpt__status is-ok" : "td-rpt__status is-bad"}">${t.last.name ? `Coincide con ${P(t.last.name)}` : "Sin coincidencia en el catálogo"}</span><span class="td-studio__dims">${t.last.t}</span>` : '<p class="td-studio__dims">Sin lecturas todavía. Apunta el lector a un código o usa Simular lectura.</p>'}
        </section><div class="td-hid__log" role="log" aria-live="polite">${t.log.map((a) => `<div class="td-hid__row"><span>${a.t}</span><b>${P(a.code)}</b><span class="${a.name ? "" : "is-miss"}">${P(a.name || "Sin coincidencia")}</span></div>`).join("") || "<p>Sin eventos registrados</p>"}</div></div></div>`;
}
function Bi(e) {
  const t = e.scan, a = t.last ? Qn(t.last.value) : void 0, n = typeof window < "u" && "BarcodeDetector" in window, s = !!(t.last && Date.now() - t.last.id < 2400 && t.last.id > 10), o = { camera: "Cámara", wedge: "Lector", manual: "Manual", sim: "Simulación" }, r = (d) => Gn.find(([u]) => u === d)?.[1] ?? d, i = t.on ? t.waiting ? "En pausa" : "Leyendo" : "Cámara apagada", c = t.on ? t.waiting ? "var(--td-color-warning)" : "var(--td-color-success)" : "#6E757D", l = t.cams.length ? t.cams : [{ id: "", label: "Cámara principal" }];
  return `<div class="td-studio__bar"><div class="td-ecom__seg" role="group" aria-label="Modo de lectura"><button type="button" data-st="smode:single" aria-pressed="${t.mode === "single"}">Manual · 1 a 1</button><button type="button" data-st="smode:continuous" aria-pressed="${t.mode === "continuous"}">Continuo</button></div>
        <div class="td-code__pills">${Gn.map(([d, u]) => `<button type="button" class="td-code__pill" data-st="sfmt:${d}" aria-pressed="${t.formats.includes(d)}">${u}</button>`).join("")}</div>
        <span class="td-studio__chips"><span class="td-studio__chip" title="${n ? "El navegador detecta códigos en el video" : "Sin BarcodeDetector: usa un lector, escribe el código o simula"}"><i style="background:${n ? "var(--td-color-success)" : "var(--td-color-text-muted)"}"></i>${n ? "Detector nativo" : "Sin detector nativo"}</span><span class="td-studio__chip"><i style="background:${t.wedge ? "var(--td-color-success)" : "var(--td-color-text-muted)"}"></i>Lector ${t.wedge ? "activo" : "apagado"}</span></span></div>
        <div class="td-scan"><div class="td-scan__col"><div class="td-scan__stage ${t.on ? "is-on" : ""} ${s ? "is-hit" : ""}">
            <video data-st-video playsinline muted autoplay ${t.on ? "" : "hidden"} aria-label="Vista de la cámara"></video>
            ${t.on ? "" : `<div class="td-scan__idle"><strong>${t.err || "La cámara está apagada"}</strong><span>${t.mode === "single" ? "Cada lectura se detiene hasta que confirmes la siguiente." : "En continuo, cada código nuevo entra al registro sin cerrar la cámara."}</span><div class="td-ecom__nav"><button type="button" class="td-studio__primary" data-st="scam">Activar cámara</button><button type="button" class="td-scan__ghost" data-st="ssim">Simular lectura</button></div></div>`}
            <div class="td-scan__frame" aria-hidden="true"><i></i><i></i><i></i><i></i><b></b></div>
            <div class="td-scan__badge"><span role="status"><i style="background:${c}"></i>${i}</span>${t.mode === "continuous" ? `<span>${t.reads.length}</span>` : ""}</div>
            ${s && t.last ? `<div class="td-scan__toast" role="alert"><b>${P(t.last.value)}</b><span>${r(t.last.format)} · ${o[t.last.source] ?? t.last.source}</span></div>` : ""}
            ${t.on ? `<div class="td-scan__bar"><button type="button" class="td-scan__ghost" data-st="scam">Apagar cámara</button><select data-st-in="cam" aria-label="Cámara">${l.map((d) => `<option value="${P(d.id)}" ${d.id === t.camId ? "selected" : ""}>${P(d.label)}</option>`).join("")}</select>${t.torchOk ? `<button type="button" class="td-scan__ghost" data-st="storch" aria-pressed="${t.torch}">Linterna</button>` : ""}<span class="td-code__grow"></span><button type="button" class="td-scan__ghost" data-st="ssim">Simular lectura</button></div>` : ""}
        </div><p class="td-studio__dims">${t.err || (n ? "Detector nativo listo. El mismo código se ignora durante la ventana de deduplicación." : "Este navegador no trae detector nativo: usa un lector, escribe el código o simula una lectura.")}</p></div>
        <div class="td-scan__side"><section class="td-studio__inspector"><div class="td-studio__head"><span class="td-section-title">${t.waiting ? "Lectura en espera" : "Último resultado"}</span>${t.last ? `<span class="td-code__fmt">${r(t.last.format)}</span>` : ""}</div>
            ${t.last ? `<strong class="td-hid__code">${P(t.last.value)}</strong><span class="td-studio__dims">${o[t.last.source] ?? t.last.source} · ${t.last.t}</span>
                ${a ? `<div class="td-scan__match"><span><b>${P(a.name)}</b><small class="${a.stock ? "is-ok" : "is-bad"}">${a.stock ? `${a.stock} en stock` : "Agotado"}</small></span><b>${Bs(a.price)}</b></div>` : '<span class="td-rpt__status is-bad">Sin coincidencia en el catálogo</span>'}
                <div class="td-ecom__nav"><button type="button" data-st="scopy">Copiar</button>${/^https?:/i.test(t.last.value) ? `<a class="td-scan__link" href="${P(t.last.value)}" target="_blank" rel="noopener noreferrer">Abrir enlace</a>` : ""}${t.waiting ? '<button type="button" class="td-studio__primary" data-st="snext">Leer siguiente</button>' : ""}</div>` : `<p class="td-studio__dims">${t.mode === "single" ? "Al leer un código la detección se pausa hasta Leer siguiente." : "Cada código se agrega al registro sin cerrar la cámara."}</p>`}
        </section><section class="td-studio__inspector"><span class="td-section-title">Comportamiento</span>${Ot(t.beep, "Pitido al leer", "sbeep")}${Ot(t.vibrate, "Vibrar al leer", "svib")}${Ot(t.wedge, "Aceptar lector USB o Bluetooth", "swedge")}
            <label>Ignorar el mismo código durante ${t.dedupe < 1e3 ? `${t.dedupe} ms` : `${t.dedupe / 1e3} s`}<input data-st-in="dedupe" type="range" min="0" max="5000" step="250" value="${t.dedupe}"></label>
            <div class="td-scan__manual"><input data-st-in="manual" value="${P(t.manual)}" placeholder="Escribir código a mano" aria-label="Código manual"><button type="button" data-st="sadd">Agregar</button></div>
        </section></div></div>
        <section class="td-studio__inspector"><div class="td-studio__head"><span class="td-section-title">Eventos ux-scan · ${t.reads.length}</span><button type="button" data-st="sexport" ${t.reads.length ? "" : "disabled"}>Exportar CSV</button><button type="button" data-st="sclear" ${t.reads.length ? "" : "disabled"}>Limpiar</button></div>
        <div class="td-scan__log" role="log" aria-live="polite">${t.reads.slice(0, 20).map((d) => {
    const u = Qn(d.value);
    return `<div class="td-scan__row"><span>${d.t}</span><b>${r(d.format)}</b><span><strong>${P(d.value)}</strong><small>${u ? P(u.name) : "Sin coincidencia"}</small></span><em>${o[d.source] ?? P(d.source)}</em></div>`;
  }).join("") || "<p>Sin lecturas todavía</p>"}</div></section>`;
}
function ji(e) {
  const t = e.sch, a = t.resources, n = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"], s = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"], o = cn(t.date), r = t.view === "month" ? `${s[at(t.date).getMonth()]} ${at(t.date).getFullYear()}` : t.view === "week" || t.view === "agenda" ? `${at(o).getDate()} ${s[at(o).getMonth()]} – ${at(Dt(o, 6)).getDate()} ${s[at(Dt(o, 6)).getMonth()]}` : `${n[(at(t.date).getDay() + 6) % 7]} ${at(t.date).getDate()} ${s[at(t.date).getMonth()]}`, i = t.events.filter((g) => !t.hide.includes(g.res)), c = 420, l = Array.from({ length: 13 }, (g, f) => c + f * 60), d = t.view === "res" ? a.filter((g) => !t.hide.includes(g.id)).map((g) => ({ key: `r:${g.id}`, head: g.name, sub: g.who, date: t.date, res: g.id })) : (t.view === "day" ? [t.date] : Array.from({ length: 7 }, (g, f) => Dt(o, f))).map((g) => ({ key: `d:${g}`, head: `${n[(at(g).getDay() + 6) % 7]} ${at(g).getDate()}`, sub: "", date: g, res: "" })), u = t.view === "day" || t.view === "week" || t.view === "res", p = t.dlg, m = p ? t.events.find((g) => g.id !== p.id && g.res === p.res && g.date === p.date && g.s < p.e && p.s < g.e) : void 0, h = p && !p.title.trim() ? "Escribe un título" : p && p.e <= p.s ? "La hora de término debe ser posterior al inicio" : "";
  return `<div class="td-studio__bar"><div class="td-ecom__seg">${[["day", "Día"], ["week", "Semana"], ["month", "Mes"], ["agenda", "Agenda"], ["res", "Recursos"]].map(([g, f]) => `<button type="button" data-st="view:${g}" aria-pressed="${t.view === g}">${f}</button>`).join("")}</div>
        <div class="td-ecom__nav"><button type="button" data-st="prev">Anterior</button><button type="button" data-st="today">Hoy</button><button type="button" data-st="next">Siguiente</button><strong>${r}</strong>${t.readOnly ? "" : '<button type="button" data-st="new">Nuevo trabajo</button>'}</div></div>
        <div class="td-ecom__chips">${a.map((g) => `<button type="button" data-st="res:${g.id}" aria-pressed="${!t.hide.includes(g.id)}" style="--c:${g.c}">${g.name}</button>`).join("")}</div>
        ${u ? `<div class="td-studio__cal" style="--cols:${d.length}"><div class="td-studio__hours">${l.map((g) => `<span>${Lt(g)}</span>`).join("")}</div>${d.map((g) => `<section data-st-col="${g.key}"><header>${g.head}<small>${g.sub}</small></header><div class="td-studio__col" data-st="slot:${g.key}">${i.filter((f) => {
    const b = t.drag?.id === f.id ? t.drag : null, v = b?.col.startsWith("d:") ? b.col.slice(2) : f.date, x = b?.col.startsWith("r:") ? b.col.slice(2) : f.res;
    return v === g.date && (t.view !== "res" || x === g.res);
  }).map((f) => {
    const b = t.drag?.id === f.id ? t.drag : null, v = b?.s ?? f.s, x = b?.e ?? f.e, M = a.find((S) => S.id === (b?.col.startsWith("r:") ? b.col.slice(2) : f.res))?.c || "#333";
    return `<button type="button" class="td-studio__event" data-st="edit:${f.id}" style="top:${(v - c) / 60 * 48}px;height:${Math.max(22, (x - v) / 60 * 48 - 2)}px;--c:${M}"><b>${P(f.title)}</b><small>${Lt(v)}–${Lt(x)}</small></button>`;
  }).join("")}</div></section>`).join("")}</div>` : ""}
        ${t.view === "agenda" ? Array.from({ length: 7 }, (g, f) => Dt(o, f)).map((g) => {
    const f = i.filter((b) => b.date === g);
    return `<section><h3>${n[(at(g).getDay() + 6) % 7]} ${at(g).getDate()} · ${f.length} trabajos</h3><ul class="td-ecom__lines">${f.map((b) => `<li><button type="button" data-st="edit:${b.id}"><b>${Lt(b.s)}–${Lt(b.e)} ${P(b.title)}</b><small>${a.find((v) => v.id === b.res)?.name}</small></button></li>`).join("") || "<li>Sin trabajos</li>"}</ul></section>`;
  }).join("") : ""}
        ${t.view === "month" ? `<div class="td-studio__month">${n.map((g) => `<b>${g}</b>`).join("")}${Ri(t).map((g) => `<button type="button" data-st="day:${g.date}"><span>${g.n}</span>${g.titles.map((f) => `<small>${P(f)}</small>`).join("")}${g.more ? `<em>${g.more}</em>` : ""}</button>`).join("")}</div>` : ""}
        ${p ? `<form class="td-studio__dlg" role="dialog" aria-label="${p.id ? "Editar trabajo" : "Nuevo trabajo"}"><h3>${p.id ? "Editar trabajo" : "Nuevo trabajo"}</h3>
            <label>Título<input data-st-in="title" value="${P(p.title)}"></label>
            <label>Fecha<input data-st-in="sdate" type="date" value="${p.date}"></label>
            <label>Inicio<select data-st-in="ss">${ts(p.s)}</select></label><label>Término<select data-st-in="se">${ts(p.e)}</select></label>
            <label>Recurso<select data-st-in="sres">${a.map((g) => `<option value="${g.id}" ${p.res === g.id ? "selected" : ""}>${g.name} · ${g.who}</option>`).join("")}</select></label>
            <label>Nota<textarea data-st-in="snote">${P(p.note)}</textarea></label>
            ${t.tried && h ? `<p class="td-ecom__err" role="alert">${h}</p>` : ""}${m ? `<p role="status">Choca con “${P(m.title)}” (${Lt(m.s)}–${Lt(m.e)}) en el mismo recurso.</p>` : ""}
            <div class="td-ecom__nav"><button type="button" data-st="save">Guardar</button>${p.id ? '<button type="button" data-st="sdel">Eliminar</button>' : ""}<button type="button" data-st="sclose">Cerrar</button></div></form>` : ""}${t.field ? `<input type="hidden" name="${P(t.field)}" data-td-sch-out>` : ""}`;
}
function ts(e) {
  let t = "";
  for (let a = 420; a <= 1200; a += 15) t += `<option value="${a}" ${a === e ? "selected" : ""}>${Lt(a)}</option>`;
  return t;
}
function Ri(e) {
  const t = at(e.date);
  t.setDate(1);
  const a = cn(Me(t));
  return Array.from({ length: 42 }, (n, s) => {
    const o = Dt(a, s), r = e.events.filter((i) => i.date === o && !e.hide.includes(i.res));
    return { date: o, n: String(at(o).getDate()), titles: r.slice(0, 3).map((i) => i.title), more: r.length > 3 ? `+${r.length - 3}` : "" };
  });
}
function Di(e, t) {
  return e === "labeldesigner" ? Hi(t) : e === "reportdesigner" ? mi(t.report) : e === "printers" ? Ni(t) : e === "ehid" ? Pi(t) : e === "scanner" ? Bi(t) : e === "scheduler" ? ji(t) : "";
}
function es(e, t) {
  const a = I.get(e);
  if (!a) return;
  if (e.dataset.kind === "reportdesigner") {
    hi(e, a.report, t, () => B(e)), B(e);
    return;
  }
  const n = t.split(":"), s = n[0] ?? "", o = n[1] ?? "", r = n[2] ?? "", i = a.label;
  if (s === "size") {
    const [c, l] = o.split("x").map(Number);
    i.w = c, i.h = l;
  } else if (s === "dpi") i.dpi = Number(o);
  else if (s === "mode" && (o === "design" || o === "code"))
    i.mode = o, o === "code" && (i.json = "");
  else if (s === "sel") i.sel = o;
  else if (s === "add") Fi(i, o);
  else if (s === "del")
    i.els = i.els.filter((c) => c.id !== i.sel), i.sel = null;
  else if (s === "dup") Ii(i);
  else if (s === "align" && (o === "left" || o === "center" || o === "right")) {
    const c = i.els.find((l) => l.id === i.sel);
    c && (c.align = o);
  } else if (s === "bcfmt") {
    const c = i.els.find((l) => l.id === i.sel);
    c && (c.format = o);
  } else if (s === "copdec") i.copies = et(i.copies - 1, 1, 999);
  else if (s === "copinc") i.copies = et(i.copies + 1, 1, 999);
  else if (s === "dlzpl") {
    Is(Ba(a), `etiqueta-${i.w}x${i.h}.zpl`), ot(e, "Archivo ZPL descargado");
    return;
  } else if (s === "var") {
    const c = i.els.find((l) => l.id === i.sel);
    c && c.text != null && (c.text = c.type === "text" ? `${c.text} {${o}}`.trim() : `{${o}}`);
  } else if (s === "print") {
    const c = `${i.copies} ${i.copies === 1 ? "etiqueta" : "etiquetas"}`, l = i.printer === "browser" ? `Impresión del navegador · ${c} de ${i.w}×${i.h} mm` : `Enviado a ${i.printer === "zebra300" ? "Zebra ZT411" : "Zebra ZD421"} · ${c}`;
    i.jobs = [{ t: Xt(), text: l }, ...i.jobs].slice(0, 4), ot(e, l);
    return;
  } else if (s === "copyzpl") {
    navigator.clipboard?.writeText(Ba(a)).then(() => ot(e, "ZPL copiado"), () => ot(e, "No se pudo copiar el ZPL"));
    return;
  } else if (s === "grid") i.grid = !i.grid;
  else if (s === "bold") {
    const c = i.els.find((l) => l.id === i.sel);
    c && (c.bold = !c.bold);
  } else if (s === "showtext") {
    const c = i.els.find((l) => l.id === i.sel);
    c && (c.showText = !c.showText);
  } else if (s === "resetjson")
    i.json = "", i.jsonMsg = "", i.jsonBad = !1;
  else if (s === "printbatch") {
    Ki(e, a);
    return;
  } else if (s === "applyjson") Oi(e, a);
  else if (s === "btscan") zi(e, a);
  else if (s === "scanclose")
    window.clearInterval(a.print.scanTimer), a.print.scan = null;
  else if (s === "webbt") {
    Qi(e, a);
    return;
  } else if (s === "pair") Vi(e, a, n.slice(1).join(":"));
  else if (s === "wifi") a.print.wifi = !a.print.wifi;
  else if (s === "wfadd") Ui(e, a);
  else if (s === "seldev") a.print.sel = o;
  else if (s === "conn") Wi(e, a);
  else if (s === "def")
    a.print.devs.forEach((c) => {
      c.def = c.id === a.print.sel;
    }), ut(a, "SYS", "Impresora predeterminada actualizada");
  else if (s === "forget")
    a.print.devs = a.print.devs.filter((c) => c.id !== a.print.sel), a.print.sel = a.print.devs[0]?.id || "", ut(a, "SYS", "Impresora olvidada");
  else if (s === "test" || s === "send") Gi(e, a, s === "test");
  else if (s === "preset" && Zn[o]) a.print.raw = Zn[o];
  else if (s === "pcopdec") a.print.copies = et(a.print.copies - 1, 1, 999);
  else if (s === "pcopinc") a.print.copies = et(a.print.copies + 1, 1, 999);
  else if (s === "clearlog") a.print.log = [];
  else if (s === "hidsim") pn(a, wt[Math.floor(Math.random() * 6)].code);
  else if (s === "hidclear")
    a.hid.log = [], a.hid.last = null, a.hid.count = 0;
  else if (s === "hidon") a.hid.on = !a.hid.on;
  else if (s === "hidignore") a.hid.ignore = !a.hid.ignore;
  else if (s === "smode" && (o === "single" || o === "continuous"))
    a.scan.mode = o, a.scan.waiting = !1;
  else if (s === "sfmt") a.scan.formats = a.scan.formats.includes(o) ? a.scan.formats.length > 1 ? a.scan.formats.filter((c) => c !== o) : a.scan.formats : [...a.scan.formats, o];
  else if (s === "scam") Yi(e, a);
  else if (s === "ssim") Zi(e, a);
  else if (s === "snext")
    a.scan.waiting = !1, a.scan.lastCode = "";
  else if (s === "sadd") Xi(e, a);
  else if (s === "sclear")
    a.scan.reads = [], a.scan.last = null, a.scan.waiting = !1;
  else if (s === "sbeep") a.scan.beep = !a.scan.beep;
  else if (s === "svib") a.scan.vibrate = !a.scan.vibrate;
  else if (s === "swedge") a.scan.wedge = !a.scan.wedge;
  else if (s === "scopy") {
    const c = a.scan.last?.value;
    if (!c) return;
    navigator.clipboard?.writeText(c).then(() => ot(e, "Código copiado"), () => ot(e, "No se pudo copiar el código"));
    return;
  } else if (s === "sexport") {
    Ji(a), ot(e, "CSV de lecturas descargado");
    return;
  } else if (s === "storch") {
    ec(e, a);
    return;
  } else if (s === "view" && ["day", "week", "month", "agenda", "res"].includes(o)) a.sch.view = o;
  else if (s === "prev" || s === "next" || s === "today") nc(a, s);
  else if (s === "res") a.sch.hide = a.sch.hide.includes(o) ? a.sch.hide.filter((c) => c !== o) : [...a.sch.hide, o];
  else if (s === "new") {
    if (a.sch.readOnly) return;
    a.sch.dlg = { id: "", title: "", date: a.sch.date, s: 540, e: 600, res: a.sch.resources[0]?.id || "", note: "" };
  } else if (s === "edit") {
    if (a.sch.readOnly) return;
    const c = a.sch.events.find((l) => l.id === o);
    if (!c) return;
    a.sch.dlg = { ...c };
  } else if (s === "day")
    a.sch.date = o, a.sch.view = "day";
  else if (s === "slot") {
    if (a.sch.readOnly) return;
    a.sch.dlg = { id: "", title: "", date: o === "d" ? r : a.sch.date, s: 540, e: 600, res: o === "r" ? r : a.sch.resources[0]?.id || "", note: "" };
  } else if (s === "save") {
    if (a.sch.readOnly) return;
    sc(e, a);
  } else if (s === "sdel" && a.sch.dlg) {
    if (a.sch.readOnly) return;
    a.sch.events = a.sch.events.filter((c) => c.id !== a.sch.dlg?.id), ot(e, `Eliminado: ${a.sch.dlg.title}`), a.sch.dlg = null;
    return;
  } else s === "sclose" && (a.sch.dlg = null);
  B(e);
}
function Ii(e) {
  const t = e.els.find((n) => n.id === e.sel);
  if (!t) return;
  const a = `e${e.nid + 1}`;
  e.els = [...e.els, { ...t, id: a, x: t.x + 2, y: t.y + 2 }], e.sel = a, e.nid += 1;
}
function Is(e, t) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([e], { type: "text/plain" })), a.download = t, a.click(), URL.revokeObjectURL(a.href);
}
function Fi(e, t) {
  const a = `e${e.nid + 1}`, n = t === "text" ? { id: a, type: t, x: 2, y: 2, w: 30, h: 4, text: "Texto", size: 3, align: "left" } : t === "barcode" ? { id: a, type: t, x: 2, y: 2, w: 34, h: 14, text: "{code}", format: "c128", showText: !0 } : t === "qr" ? { id: a, type: t, x: 2, y: 2, w: 14, h: 14, text: "{url}" } : t === "line" ? { id: a, type: t, x: 2, y: 2, w: e.w - 6, h: 0.4, thick: 0.4 } : { id: a, type: t, x: 2, y: 2, w: 20, h: 10, thick: 0.35 };
  e.els = [...e.els, n], e.sel = a, e.nid += 1;
}
function Oi(e, t) {
  try {
    const a = JSON.parse(t.label.json || "{}");
    if (!a.size || !Array.isArray(a.elements)) throw new Error('Faltan "size" o "elements".');
    t.label.els = a.elements.map((n, s) => ({ ...n, id: `j${s}` })), t.label.w = et(Number(a.size.width) || 62, 10, 200), t.label.h = et(Number(a.size.height) || 40, 10, 300), t.label.jsonMsg = `Plantilla aplicada · ${t.label.els.length} elementos`, t.label.jsonBad = !1, t.label.json = "";
  } catch (a) {
    t.label.jsonMsg = `JSON no válido: ${a instanceof Error ? a.message : "revisa la plantilla"}`, t.label.jsonBad = !0;
  }
  B(e);
}
function ut(e, t, a) {
  e.print.log = [{ t: Xt(), dir: t, msg: a }, ...e.print.log].slice(0, 40);
}
function zi(e, t) {
  window.clearInterval(t.print.scanTimer);
  const a = [
    { name: "Zebra ZQ630", model: "ZQ630", proto: "CPCL", rssi: -58, battery: 91, mac: "" },
    { name: "Epson TM-P20II", model: "TM-P20II", proto: "ESC/POS", rssi: -69, battery: 64, mac: "" },
    { name: "TSC Alpha-40L", model: "Alpha-40L", proto: "TSPL", rssi: -63, battery: 77, mac: "" }
  ];
  a.forEach((n, s) => {
    n.mac = Array.from({ length: 6 }, (o, r) => ((n.name.length * 37 + r * 53 + s * 11) % 256).toString(16).padStart(2, "0")).join(":").toUpperCase();
  }), t.print.scan = { pr: 0, found: [] }, ut(t, "SYS", "Buscando dispositivos Bluetooth LE cercanos…"), t.print.scanTimer = window.setInterval(() => {
    const n = t.print.scan;
    if (!n || !e.isConnected) {
      window.clearInterval(t.print.scanTimer);
      return;
    }
    n.pr = Math.min(100, n.pr + 25), n.found.length < a.length && n.found.push(a[n.found.length]), n.pr >= 100 && (window.clearInterval(t.print.scanTimer), ut(t, "SYS", `Búsqueda terminada · ${n.found.length} dispositivos`)), B(e);
  }, 450), B(e);
}
function Vi(e, t, a) {
  const n = t.print.scan?.found.find((o) => o.mac === a);
  if (!n || t.print.devs.some((o) => o.addr === a)) return;
  const s = { id: `bt${a}`, name: n.name, model: `${n.model} · 203 dpi`, conn: "bt", addr: a, proto: n.proto, dpi: 203, width: 104, status: "connecting", rssi: n.rssi, battery: n.battery, fw: "—", jobs: 0 };
  t.print.devs = [...t.print.devs, s], t.print.sel = s.id, ut(t, "SYS", `${n.name} emparejada (${a})`), window.setTimeout(() => {
    s.status = "connected", ut(t, "RX", `${n.name}: lista · papel OK · batería ${n.battery}%`), e.isConnected && B(e);
  }, 900);
}
function Ui(e, t) {
  const a = t.print.wf, n = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(a.ip.trim()), s = Number(a.port);
  if (!n) {
    t.print.wfMsg = "Ingresa una IPv4 válida, por ejemplo 192.168.1.60", t.print.wfBad = !0, B(e);
    return;
  }
  if (!(s > 0 && s < 65536)) {
    t.print.wfMsg = "Puerto no válido", t.print.wfBad = !0, B(e);
    return;
  }
  const o = `${a.ip.trim()}:${s}`;
  if (t.print.devs.some((c) => c.addr === o)) {
    t.print.wfMsg = "Esa impresora ya está en la lista", t.print.wfBad = !0, B(e);
    return;
  }
  const r = a.name.trim() || `Impresora ${a.ip.trim()}`, i = { id: `wf${Date.now()}`, name: r, model: `${a.proto} · red`, conn: "wifi", addr: o, proto: a.proto, dpi: 203, width: 104, status: "connected", rssi: -55, fw: "—", jobs: 0 };
  t.print.devs = [...t.print.devs, i], t.print.sel = i.id, t.print.wifi = !1, t.print.wf = { name: "", ip: "", port: "9100", proto: "ZPL" }, t.print.wfMsg = "", ut(t, "RX", `${r}: responde en ${o} · ${i.proto}`), B(e);
}
function Wi(e, t) {
  const a = t.print.devs.find((n) => n.id === t.print.sel);
  if (a) {
    if (a.status === "connected" || a.status === "printing") {
      a.status = "disconnected", ut(t, "SYS", `${a.name}: desconectada`);
      return;
    }
    a.status = "connecting", a.err = "", ut(t, "SYS", `Conectando a ${a.name}…`), window.setTimeout(() => {
      a.unreachable ? (a.status = "error", a.err = `No hubo respuesta en ${a.addr}. Revisa que esté encendida y con el puerto 9100 habilitado.`, ut(t, "ERR", `${a.name}: timeout`)) : (a.status = "connected", ut(t, "RX", `${a.name}: lista · papel OK`)), e.isConnected && B(e);
    }, 900);
  }
}
function Gi(e, t, a) {
  const n = t.print.devs.find((o) => o.id === t.print.sel);
  if (!n || n.status !== "connected") return;
  n.status = "printing";
  const s = a ? t.print.copies : 1;
  ut(t, "TX", `${n.name} ← ${a ? `prueba × ${s}` : "comando"} · ${n.proto}`), window.setTimeout(() => {
    n.status = "connected", n.jobs += s, ut(t, "RX", `${n.name}: trabajo completado · ${s} ${s === 1 ? "etiqueta" : "etiquetas"}`), e.isConnected && B(e);
  }, 700), B(e);
}
function pn(e, t) {
  const a = wt.find((n) => n.code === t);
  e.hid.count += 1, e.hid.last = { code: t, t: Xt(), name: a?.name ?? null }, e.hid.log = [e.hid.last, ...e.hid.log].slice(0, 40);
}
function pa(e, t, a, n, s) {
  const o = t.scan;
  if (o.mode === "single" && o.waiting && s === "camera") return;
  const r = Date.now();
  if (o.lastCode === a && r - o.lastAt < o.dedupe && s !== "manual") return;
  o.lastCode = a, o.lastAt = r;
  const i = { value: a, format: n, source: s, t: Xt(), id: r };
  o.reads = [i, ...o.reads].slice(0, 80), o.last = i, o.waiting = o.mode === "single", _i(o), ot(e, `${a} · ${s === "camera" ? "cámara" : s === "wedge" ? "lector" : s === "manual" ? "teclado" : "simulación"}`);
}
function Ki(e, t) {
  const a = t.label;
  let n;
  try {
    const i = JSON.parse(a.batch || "[]");
    if (!Array.isArray(i) || !i.length) throw new Error("vacío");
    n = i;
  } catch {
    ot(e, "El lote debe ser un arreglo JSON con al menos un registro.");
    return;
  }
  const s = a.copies, o = n.length * s, r = `Lote enviado · ${n.length} registros × ${s} ${s === 1 ? "copia" : "copias"} = ${o} etiquetas`;
  a.jobs = [{ t: Xt(), text: r }, ...a.jobs].slice(0, 4), ot(e, r);
}
function Ji(e) {
  const t = (n) => `"${n.replace(/"/g, '""')}"`, a = ["hora,formato,codigo,origen", ...e.scan.reads.map((n) => [n.t, n.format, n.value, n.source].map(t).join(","))];
  Is(a.join(`
`), "lecturas.csv");
}
async function Qi(e, t) {
  const a = navigator.bluetooth;
  if (!a?.requestDevice) {
    ot(e, "Este navegador no abre el selector Bluetooth.");
    return;
  }
  try {
    const n = await a.requestDevice({ acceptAllDevices: !0 }), s = n.id;
    if (t.print.devs.some((o) => o.addr === s)) {
      ot(e, `${n.name || "El equipo"} ya está en la lista.`);
      return;
    }
    t.print.devs = [...t.print.devs, { id: `bt${s}`, name: n.name || "Impresora Bluetooth", model: "Seleccionada en el navegador", conn: "bt", addr: s, proto: "ZPL", dpi: 203, width: 104, status: "disconnected", rssi: -55, fw: "—", jobs: 0 }], t.print.sel = `bt${s}`, ut(t, "SYS", `Selector del navegador · ${n.name || s}`), B(e);
  } catch (n) {
    if (n instanceof DOMException && n.name === "NotFoundError") return;
    ot(e, "No se pudo usar el selector Bluetooth.");
  }
}
function Zi(e, t) {
  if (t.scan.mode === "single" && t.scan.waiting) return;
  const a = [["BR-4521-AD", "code_128"], ["https://uiuxblazor.dev/r/MT-7702-FL", "qr_code"], ["7801234567892", "ean_13"], ["96385074", "ean_8"]], n = a[t.scan.sim % a.length];
  t.scan.sim += 1, t.scan.lastCode = "", pa(e, t, n[0], n[1], "sim");
}
function Xi(e, t) {
  const a = t.scan.manual.trim();
  if (!a) return;
  const n = /^\d{13}$/.test(a) ? "ean_13" : /^https?:/i.test(a) ? "qr_code" : "code_128";
  t.scan.manual = "", t.scan.waiting = !1, t.scan.lastCode = "", pa(e, t, a, n, "manual");
}
function mn(e, t) {
  Le.get(e)?.getTracks().forEach((a) => a.stop()), Le.delete(e), t.scan.on = !1, t.scan.torch = !1, e.dataset.tdScanGen = "";
}
async function Yi(e, t) {
  if (t.scan.on) {
    mn(e, t), B(e);
    return;
  }
  await Fs(e, t);
}
async function Fs(e, t) {
  if (!navigator.mediaDevices?.getUserMedia) {
    t.scan.err = "Este navegador no permite usar la cámara.", B(e);
    return;
  }
  try {
    const a = t.scan.camId ? { deviceId: { exact: t.scan.camId } } : { facingMode: { ideal: "environment" } }, n = await navigator.mediaDevices.getUserMedia({ video: a, audio: !1 });
    Le.set(e, n), t.scan.on = !0, t.scan.err = "";
    const o = (await navigator.mediaDevices.enumerateDevices().catch(() => [])).filter((c) => c.kind === "videoinput").map((c, l) => ({ id: c.deviceId, label: c.label || `Cámara ${l + 1}` }));
    o.length && (t.scan.cams = o);
    const r = n.getVideoTracks()[0], i = r?.getCapabilities?.();
    t.scan.torchOk = !!(i && "torch" in i && i.torch), t.scan.torch = !1, r?.getSettings().deviceId && (t.scan.camId = r.getSettings().deviceId || t.scan.camId), B(e), Ds(e), ac(e);
  } catch (a) {
    mn(e, t), t.scan.err = a instanceof DOMException && a.name === "NotAllowedError" ? "Permiso de cámara denegado. Habilítalo en el navegador." : "No se pudo abrir la cámara.", B(e);
  }
}
async function tc(e, t) {
  if (!t.scan.on) return;
  const a = t.scan.camId;
  mn(e, t), t.scan.camId = a, await Fs(e, t);
}
async function ec(e, t) {
  const a = Le.get(e)?.getVideoTracks()[0];
  if (!a) return;
  const n = !t.scan.torch;
  try {
    await a.applyConstraints({ advanced: [{ torch: n }] }), t.scan.torch = n, B(e);
  } catch {
    t.scan.torch = !1, t.scan.torchOk = !1, ot(e, "Esta cámara no permite la linterna.");
  }
}
function ac(e) {
  const t = window.BarcodeDetector;
  if (!t) return;
  const a = String(Date.now());
  e.dataset.tdScanGen = a;
  const n = I.get(e);
  let s = n?.scan.formats.join() ?? "", o = new t({ formats: n?.scan.formats ?? ["qr_code"] });
  const r = async () => {
    const i = I.get(e);
    if (e.dataset.tdScanGen !== a || !i?.scan.on || !e.isConnected) return;
    const c = i.scan.formats.join();
    c !== s && (s = c, o = new t({ formats: i.scan.formats }));
    const l = e.querySelector("[data-st-video]");
    if (l instanceof HTMLVideoElement && l.readyState >= 2 && !(i.scan.mode === "single" && i.scan.waiting))
      try {
        const u = (await o.detect(l)).find((p) => p.rawValue);
        u && e.dataset.tdScanGen === a && pa(e, i, u.rawValue, u.format || "qr_code", "camera");
      } catch {
      }
    window.setTimeout(() => {
      r();
    }, 160);
  };
  window.setTimeout(() => {
    r();
  }, 200);
}
function nc(e, t) {
  if (t === "today") {
    e.sch.date = Me(/* @__PURE__ */ new Date());
    return;
  }
  const a = e.sch.view === "month" ? 0 : e.sch.view === "week" || e.sch.view === "agenda" ? 7 : 1;
  if (!a) {
    const n = at(e.sch.date);
    n.setMonth(n.getMonth() + (t === "next" ? 1 : -1)), e.sch.date = Me(n);
    return;
  }
  e.sch.date = Dt(e.sch.date, t === "next" ? a : -a);
}
function sc(e, t) {
  const a = t.sch.dlg;
  if (a) {
    if (!a.title.trim() || a.e <= a.s) {
      t.sch.tried = !0, B(e);
      return;
    }
    a.id ? (t.sch.events = t.sch.events.map((n) => n.id === a.id ? { ...a, title: a.title.trim() } : n), ot(e, `Guardado: ${a.title.trim()}`)) : (t.sch.seq += 1, a.id = `n${t.sch.seq}`, t.sch.events = [...t.sch.events, { ...a, title: a.title.trim() }], ot(e, `Creado: ${a.title.trim()}`)), t.sch.dlg = null;
  }
}
function as(e, t) {
  const a = I.get(e);
  if (!a || !(t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement)) return;
  const n = t.getAttribute("data-st-in");
  if (!n) return;
  if (e.dataset.kind === "reportdesigner") {
    gi(e, a.report, n, t.value, () => B(e)) || B(e);
    return;
  }
  const s = a.label, o = s.els.find((r) => r.id === s.sel);
  if (n === "rec")
    s.rec = Number(t.value), s.record = null;
  else if (n === "copies") s.copies = et(Number(t.value) || 1, 1, 999);
  else if (n === "printer") s.printer = t.value;
  else if (n === "lw") s.w = et(Number(t.value) || s.w, 10, 200);
  else if (n === "lh") s.h = et(Number(t.value) || s.h, 10, 300);
  else if (n === "size" && o) o.size = Math.max(1, Number(t.value) || 3);
  else if (n === "thick" && o) o.thick = Math.max(0.1, Number(t.value) || 0.3);
  else if (n === "text" && o) o.text = t.value;
  else if (n.startsWith("geo:") && o) {
    const r = n.slice(4), i = Number(t.value);
    Number.isNaN(i) || (o[r] = Math.max(0, i));
  } else if (n === "json")
    s.json = t.value, s.jsonMsg = "Cambios sin aplicar", s.jsonBad = !1;
  else if (n === "batch") s.batch = t.value;
  else if (n === "dedupe") a.scan.dedupe = et(Number(t.value) || 0, 0, 5e3);
  else if (n === "cam") {
    a.scan.camId = t.value, tc(e, a);
    return;
  } else n === "wf-name" ? a.print.wf.name = t.value : n === "wf-ip" ? a.print.wf.ip = t.value : n === "wf-port" ? a.print.wf.port = t.value : n === "wf-proto" ? a.print.wf.proto = t.value : n === "pcopies" ? a.print.copies = et(Number(t.value) || 1, 1, 999) : n === "raw" ? a.print.raw = t.value : n === "min" ? a.hid.minLen = Math.max(1, Number(t.value) || 1) : n === "gap" ? a.hid.gap = Number(t.value) || 0 : n === "manual" ? a.scan.manual = t.value : a.sch.dlg && n === "title" ? a.sch.dlg.title = t.value : a.sch.dlg && n === "sdate" ? a.sch.dlg.date = t.value : a.sch.dlg && n === "ss" ? a.sch.dlg.s = Number(t.value) : a.sch.dlg && n === "se" ? a.sch.dlg.e = Number(t.value) : a.sch.dlg && n === "sres" ? a.sch.dlg.res = t.value : a.sch.dlg && n === "snote" && (a.sch.dlg.note = t.value);
  n !== "raw" && n !== "json" && n !== "batch" && n !== "manual" && n !== "title" && n !== "snote" && B(e);
}
function oc(e, t) {
  if (t.button !== 0) return;
  if (e.dataset.kind === "reportdesigner") {
    const r = I.get(e);
    r && $i(r.report, t);
    return;
  }
  if (e.dataset.kind === "labeldesigner") {
    rc(e, t);
    return;
  }
  if (e.dataset.kind !== "scheduler") return;
  const a = t.target instanceof Element ? t.target.closest('[data-st^="edit:"]') : null;
  if (!(a instanceof HTMLElement)) return;
  const n = I.get(e);
  if (n?.sch.readOnly) return;
  const s = n?.sch.events.find((r) => r.id === a.dataset.st?.slice(5));
  if (!n || !s) return;
  n.sch.skipClick = !1;
  const o = a.getBoundingClientRect();
  n.sch.drag = { id: s.id, s: s.s, e: s.e, dur: s.e - s.s, col: a.closest("[data-st-col]")?.getAttribute("data-st-col") || "", grab: t.clientY - o.top, moved: !1 };
}
function rc(e, t) {
  const a = I.get(e);
  if (!a || a.label.mode !== "design") return;
  const n = t.target instanceof Element ? t.target.closest('[data-st^="resize:"]') : null, s = t.target instanceof Element ? t.target.closest('[data-st^="sel:"]') : null, o = n instanceof HTMLElement ? n.dataset.st?.slice(7) : s instanceof HTMLElement ? s.dataset.st?.slice(4) : "", r = a.label.els.find((i) => i.id === o);
  r && (a.label.sel = r.id, a.labelDrag = { id: r.id, mode: n ? "resize" : "move", x: r.x, y: r.y, w: r.w, h: r.h, px: t.clientX, py: t.clientY, moved: !1 }, e.setPointerCapture?.(t.pointerId), t.preventDefault());
}
function ic(e) {
  const t = [...document.querySelectorAll("td-studio")].find((p) => p instanceof HTMLElement && I.get(p)?.report.drag);
  if (t instanceof HTMLElement) {
    const p = I.get(t);
    if (!p) return;
    yi(p.report, e), p.report.drag?.moved && B(t);
    return;
  }
  const a = [...document.querySelectorAll("td-studio")].find((p) => p instanceof HTMLElement && I.get(p)?.labelDrag);
  if (a instanceof HTMLElement) {
    cc(a, e);
    return;
  }
  const n = [...document.querySelectorAll("td-studio")].find((p) => p instanceof HTMLElement && I.get(p)?.sch.drag);
  if (!(n instanceof HTMLElement)) return;
  const s = I.get(n), o = s?.sch.drag;
  if (!s || !o) return;
  const i = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-st-col]"), c = i?.getAttribute("data-st-col") || o.col, l = i?.querySelector(".td-studio__col")?.getBoundingClientRect();
  if (!l) return;
  const d = 420 + (e.clientY - o.grab - l.top) / 48 * 60, u = et(Math.round(d / 15) * 15, 420, 1200 - o.dur);
  Math.abs(e.clientY - (l.top + (o.s - 420) / 60 * 48 + o.grab)) < 6 && c === o.col && !o.moved || u === o.s && c === o.col || (o.s = u, o.e = u + o.dur, o.col = c, o.moved = !0, B(n));
}
function cc(e, t) {
  const a = I.get(e), n = a?.labelDrag;
  if (!a || !n) return;
  const s = a.label.els.find((d) => d.id === n.id);
  if (!s) return;
  const o = Number(e.dataset.lbScale) || un(a.label), r = (t.clientX - n.px) / o, i = (t.clientY - n.py) / o;
  Math.hypot(t.clientX - n.px, t.clientY - n.py) > 3 && (n.moved = !0), n.mode === "move" ? (s.x = Math.max(0, Math.round((n.x + r) * 2) / 2), s.y = Math.max(0, Math.round((n.y + i) * 2) / 2)) : (s.w = Math.max(2, Math.round((n.w + r) * 2) / 2), s.h = Math.max(1, Math.round((n.h + i) * 2) / 2));
  const c = e.querySelector(`[data-lb="${CSS.escape(s.id)}"]`);
  c && c.setAttribute("transform", `translate(${s.x} ${s.y})`);
  const l = e.querySelector(`[data-st="${CSS.escape(`sel:${s.id}`)}"]`);
  l instanceof HTMLElement && (l.style.left = `${s.x * o}px`, l.style.top = `${s.y * o}px`, l.style.width = `${s.w * o}px`, l.style.height = `${Math.max(s.h, s.type === "line" ? 1.2 : s.h) * o}px`), n.mode === "resize" && ki(e);
}
function lc(e) {
  const t = [...document.querySelectorAll("td-studio")].find((i) => i instanceof HTMLElement && I.get(i)?.report.drag);
  if (t instanceof HTMLElement) {
    const i = I.get(t);
    if (!i) return;
    const c = vi(i.report);
    c && (t.dataset.skipClick = "1"), B(t), c && e.preventDefault();
    return;
  }
  const a = [...document.querySelectorAll("td-studio")].find((i) => i instanceof HTMLElement && I.get(i)?.labelDrag);
  if (a instanceof HTMLElement) {
    const i = I.get(a), c = i?.labelDrag?.moved;
    i && (i.labelDrag = null), c && (a.dataset.skipClick = "1"), c && (e.preventDefault(), B(a));
    return;
  }
  const n = [...document.querySelectorAll("td-studio")].find((i) => i instanceof HTMLElement && I.get(i)?.sch.drag);
  if (!(n instanceof HTMLElement)) return;
  const s = I.get(n), o = s?.sch.drag;
  if (!s || !o || (s.sch.drag = null, !o.moved)) return;
  const r = s.sch.events.find((i) => i.id === o.id);
  r && (r.s = o.s, r.e = o.e, o.col.startsWith("d:") && (r.date = o.col.slice(2)), o.col.startsWith("r:") && (r.res = o.col.slice(2))), s.sch.skipClick = !0, e.preventDefault(), B(n);
}
function dc(e) {
  const t = document.querySelector("td-studio");
  if (!(t instanceof HTMLElement)) return;
  const a = I.get(t);
  if (!a) return;
  const n = e.target, s = n instanceof HTMLElement && (n.tagName === "INPUT" || n.tagName === "TEXTAREA" || n.tagName === "SELECT" || n.isContentEditable);
  if (t.dataset.kind === "reportdesigner" && !s && t.contains(n instanceof Node ? n : t)) {
    xi(a.report, e.key, e.shiftKey) && (e.preventDefault(), B(t));
    return;
  }
  if (t.dataset.kind === "labeldesigner" && !s && a.label.sel) {
    const o = a.label.els.find((i) => i.id === a.label.sel), r = e.shiftKey ? 2 : 0.5;
    if (o && e.key === "ArrowLeft") o.x = Math.max(0, o.x - r);
    else if (o && e.key === "ArrowRight") o.x += r;
    else if (o && e.key === "ArrowUp") o.y = Math.max(0, o.y - r);
    else if (o && e.key === "ArrowDown") o.y += r;
    else if (o && (e.key === "Delete" || e.key === "Backspace"))
      a.label.els = a.label.els.filter((i) => i.id !== o.id), a.label.sel = null;
    else return;
    e.preventDefault(), B(t);
    return;
  }
  if (t.dataset.kind === "ehid" && a.hid.on) {
    if (a.hid.ignore && s || s && t.contains(n)) return;
    const o = performance.now();
    o - a.hid.lastAt > a.hid.gap && (a.hid.buf = ""), a.hid.lastAt = o, e.key === "Enter" ? (a.hid.buf.length >= a.hid.minLen && pn(a, a.hid.buf), a.hid.buf = "", B(t)) : e.key.length === 1 && (a.hid.buf += e.key);
  }
  if (t.dataset.kind === "scanner" && a.scan.wedge && !s) {
    const o = Date.now();
    if (o - a.scan.bufAt > 80 && (a.scan.buf = ""), a.scan.bufAt = o, e.key === "Enter" && a.scan.buf.length >= 4) {
      e.preventDefault();
      const r = a.scan.buf;
      a.scan.buf = "", pa(t, a, r, /^\d{13}$/.test(r) ? "ean_13" : "code_128", "wedge");
    } else e.key.length === 1 && (a.scan.buf += e.key);
  }
}
function uc(e, t) {
  const a = e.dataset.kind || "";
  if (a === "labeldesigner") {
    const n = t.label, s = Number(e.dataset.width), o = Number(e.dataset.height), r = Number(e.dataset.dpi), i = Number(e.dataset.copies);
    if (s && (n.w = et(s, 10, 200)), o && (n.h = et(o, 10, 300)), (r === 203 || r === 300) && (n.dpi = r), i && (n.copies = et(Math.round(i), 1, 99)), e.dataset.template)
      try {
        const c = JSON.parse(e.dataset.template);
        c.size && Array.isArray(c.elements) && (n.els = c.elements.map((l, d) => ({ ...l, id: l.id || `e${d + 1}` })), n.w = et(Number(c.size.width) || n.w, 10, 200), n.h = et(Number(c.size.height) || n.h, 10, 300), (c.size.dpi === 203 || c.size.dpi === 300) && (n.dpi = c.size.dpi), n.sel = n.els[0]?.id ?? null, n.nid = n.els.length);
      } catch {
      }
    if (e.dataset.record)
      try {
        const c = JSON.parse(e.dataset.record);
        typeof c.code == "string" && (n.record = c);
      } catch {
      }
    return;
  }
  if (a === "reportdesigner") {
    di(t.report, e);
    return;
  }
  if (a === "printers" && e.dataset.devices) {
    try {
      const n = JSON.parse(e.dataset.devices);
      if (!Array.isArray(n) || !n.length) return;
      t.print.devs = n.map((s) => ({
        id: s.id,
        name: s.name,
        model: s.model,
        conn: s.connection === "bt" ? "bt" : "wifi",
        addr: s.address,
        proto: s.protocol,
        dpi: s.dpi || 203,
        width: s.widthMm || 104,
        status: s.connected ? "connected" : "disconnected",
        rssi: s.id === "ql820" ? -66 : s.connection === "bt" ? -61 : -48,
        battery: s.id === "zq520" ? 82 : void 0,
        def: s.isDefault,
        fw: s.id === "zd421" ? "V93.21.15Z" : s.id === "ql820" ? "1.21" : s.id === "zq520" ? "V85.20.19" : "—",
        jobs: s.id === "zd421" ? 128 : s.id === "ql820" ? 42 : s.id === "zq520" ? 311 : 0,
        unreachable: s.unreachable,
        err: s.unreachable ? "No responde en el puerto 9100. Revisa que esté encendida y en la misma red." : void 0
      })), t.print.sel = t.print.devs.find((s) => s.def)?.id ?? t.print.devs[0].id;
    } catch {
    }
    return;
  }
  if (a === "ehid") {
    const n = Number(e.dataset.min);
    n && (t.hid.minLen = et(Math.round(n), 1, 64)), e.dataset.gap != null && (t.hid.gap = Math.max(0, Number(e.dataset.gap) || 0)), t.hid.ignore = e.dataset.ignore === "true", e.dataset.initial && pn(t, e.dataset.initial);
    return;
  }
  if (a === "scanner" && ((e.dataset.mode === "single" || e.dataset.mode === "continuous") && (t.scan.mode = e.dataset.mode), (e.dataset.wedge === "true" || e.dataset.wedge === "false") && (t.scan.wedge = e.dataset.wedge === "true"), e.dataset.initial)) {
    const n = e.dataset.initial, s = { value: n, format: "code_128", source: "wedge", t: Xt(), id: 1 };
    t.scan.reads = [s], t.scan.last = s, t.scan.lastCode = n, t.scan.lastAt = Date.now();
  }
  a === "scheduler" && js(e, t);
}
function pc(e) {
  if (e.dataset.tdLbWatch === "1" || typeof ResizeObserver > "u") return;
  e.dataset.tdLbWatch = "1", new ResizeObserver(() => {
    const a = I.get(e), n = e.querySelector(".td-studio__well"), s = Math.round((n instanceof HTMLElement ? n.clientWidth : e.clientWidth) || 0);
    !a || !s || a.labelDrag || Math.abs(s - a.label.avail) < 16 || (a.label.avail = s, B(e));
  }).observe(e);
}
function Os(e = document) {
  e.querySelectorAll("td-studio").forEach((t) => {
    if (I.has(t)) {
      if (t.dataset.kind === "scheduler") {
        const n = I.get(t), s = t.dataset.agenda || "";
        n && n.sch.source !== s && (js(t, n), B(t));
      }
      return;
    }
    const a = qi();
    uc(t, a), I.set(t, a), t.addEventListener("click", (n) => {
      const s = I.get(t);
      if (t.dataset.skipClick === "1") {
        delete t.dataset.skipClick;
        return;
      }
      if (s?.sch.skipClick) {
        s.sch.skipClick = !1;
        return;
      }
      const o = n.target instanceof Element ? n.target.closest("[data-st]") : null;
      !(o instanceof HTMLElement) || o instanceof HTMLInputElement || o.dataset.st?.startsWith("slot:") && n.target !== o || es(t, o.dataset.st || "");
    }), t.addEventListener("pointerdown", (n) => oc(t, n)), t.addEventListener("change", (n) => {
      const s = n.target;
      if (s instanceof HTMLInputElement && s.dataset.stFile === "uxr") {
        const o = I.get(t);
        o && bi(t, o.report, s, () => B(t));
        return;
      }
      if (s instanceof HTMLInputElement && s.dataset.st === "grid") {
        const o = I.get(t);
        o && (o.label.grid = s.checked), B(t);
        return;
      }
      if (s instanceof HTMLInputElement && (s.dataset.st === "bold" || s.dataset.st === "showtext")) {
        const o = I.get(t), r = o?.label.els.find((i) => i.id === o.label.sel);
        r && s.dataset.st === "bold" && (r.bold = s.checked), r && s.dataset.st === "showtext" && (r.showText = s.checked), B(t);
        return;
      }
      if (s instanceof HTMLInputElement && s.dataset.st === "hidon") {
        const o = I.get(t);
        o && (o.hid.on = s.checked), B(t);
        return;
      }
      if (s instanceof HTMLInputElement && s.dataset.st === "hidignore") {
        const o = I.get(t);
        o && (o.hid.ignore = s.checked), B(t);
        return;
      }
      if (s instanceof HTMLInputElement && s.dataset.st === "swedge") {
        const o = I.get(t);
        o && (o.scan.wedge = s.checked), B(t);
        return;
      }
      as(t, s);
    }), t.addEventListener("input", (n) => {
      n.target instanceof HTMLSelectElement || as(t, n.target);
    }), t.addEventListener("keydown", (n) => {
      n.key !== "Enter" || !(n.target instanceof HTMLInputElement) || n.target.dataset.stIn !== "manual" || (n.preventDefault(), es(t, "sadd"));
    }), B(t), t.dataset.kind === "reportdesigner" && Si(t, () => I.get(t)?.report, () => B(t)), t.dataset.kind === "labeldesigner" && pc(t);
  }), document.documentElement.dataset.tdStudioKeys || (document.documentElement.dataset.tdStudioKeys = "1", document.addEventListener("keydown", dc, !0), document.addEventListener("pointermove", ic), document.addEventListener("pointerup", lc));
}
const mc = ["help", "stock", "buscar", "pedido", "imprimir", "date", "echo", "clear"], ns = /* @__PURE__ */ new WeakSet();
function fc(e = document) {
  e.querySelectorAll("td-aos").forEach((t) => {
    if (t.dataset.bound === "true" || typeof IntersectionObserver > "u")
      return;
    if (t.dataset.bound = "true", window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      t.dataset.visible = "true";
      return;
    }
    const a = t.closest("[data-td-aos-box]"), n = new IntersectionObserver((s) => {
      s.forEach((o) => {
        o.isIntersecting ? (t.dataset.visible = "true", t.dataset.once !== "false" && n.unobserve(t)) : t.dataset.once === "false" && delete t.dataset.visible;
      });
    }, { root: a instanceof HTMLElement ? a : null, threshold: Number(t.dataset.threshold ?? 0.25) });
    n.observe(t);
  }), e.querySelectorAll("td-terminal").forEach((t) => {
    if (t.dataset.bound === "true")
      return;
    t.dataset.bound = "true";
    const a = t.querySelector("[data-td-term-in]"), n = t.querySelector("[data-td-term-out]"), s = t.dataset.prompt ?? "td@taller:~$";
    let o = [];
    try {
      o = JSON.parse(t.querySelector("[data-td-term-parts]")?.textContent || "[]");
    } catch {
      o = [];
    }
    const r = [];
    let i = -1;
    const c = (d, u = "") => {
      const p = document.createElement("p");
      p.dataset.tdTermLine = "", u && (p.dataset.tone = u), p.textContent = d, n?.append(p), n && (n.scrollTop = n.scrollHeight);
    }, l = (d) => {
      const u = d.trim();
      if (!u)
        return;
      const [p, ...m] = u.split(/\s+/), h = m.join(" "), g = p.toLowerCase();
      if (r.unshift(u), i = -1, g === "clear") {
        n?.replaceChildren(), a && (a.value = "");
        return;
      }
      if (c(`${s} ${u}`, "cmd"), g === "help")
        [["help", "lista de comandos"], ["stock <código>", "stock y precio de un repuesto"], ["buscar <texto>", "busca en el catálogo"], ["pedido <número>", "estado de un pedido"], ["imprimir <código> [copias]", "envía etiqueta a la impresora predeterminada"], ["date", "fecha y hora"], ["echo <texto>", "repite el texto"], ["clear", "limpia la pantalla"]].forEach(([f, b]) => c(`${f.padEnd(28, " ")}${b}`));
      else if (g === "date")
        c((/* @__PURE__ */ new Date()).toLocaleString("es-CL"));
      else if (g === "echo")
        c(h);
      else if (g === "stock") {
        const f = o.find((b) => b.code.toLowerCase() === h.toLowerCase());
        h ? f ? (c(`${f.code}  ${f.name}`), c(`stock ${f.stock} u. · $${f.price.toLocaleString("es-CL")} · ${f.brand}`, f.stock === 0 ? "bad" : f.stock <= 10 ? "warn" : "ok")) : c(`No existe el código ${h.toUpperCase()}`, "bad") : c("uso: stock <código>", "warn");
      } else if (g === "buscar")
        if (!h)
          c("uso: buscar <texto>", "warn");
        else {
          const f = o.filter((b) => `${b.name} ${b.code} ${b.brand}`.toLowerCase().includes(h.toLowerCase()));
          f.length || c(`Sin resultados para "${h}"`, "warn"), f.slice(0, 6).forEach((b) => c(`${b.code.padEnd(14, " ")}${b.name.slice(0, 34).padEnd(36, " ")}$${b.price.toLocaleString("es-CL")}`)), f.length > 6 && c(`… y ${f.length - 6} más`, "muted");
        }
      else if (g === "pedido") {
        const f = h.replace(/\D/g, "");
        if (!f)
          c("uso: pedido <número>", "warn");
        else {
          const b = ["Recibido", "Preparando", "En ruta", "Entregado"];
          c(`OC-${f.padStart(5, "0")} · ${b[Number(f) % 4]} · Transportes del Sur`, "ok");
        }
      } else if (g === "imprimir") {
        const [f, b] = m;
        if (!f)
          c("uso: imprimir <código> [copias]", "warn");
        else {
          const v = Math.max(1, Number.parseInt(b || "1", 10) || 1);
          c(`→ Zebra ZD421 · ^XA^FD${f.toUpperCase()}^FS^PQ${v}^XZ`, "print"), c(`Trabajo enviado · ${v} ${v === 1 ? "etiqueta" : "etiquetas"}`, "ok");
        }
      } else
        c(`${p}: comando no encontrado. Escribe help.`, "bad");
      a && (a.value = "");
    };
    t.querySelector("[data-td-term-form]")?.addEventListener("submit", (d) => {
      d.preventDefault(), l(a?.value ?? "");
    }), a?.addEventListener("keydown", (d) => {
      if (d.key === "ArrowUp" || d.key === "ArrowDown")
        d.preventDefault(), i = Math.max(-1, Math.min(r.length - 1, i + (d.key === "ArrowUp" ? 1 : -1))), a.value = i < 0 ? "" : r[i];
      else if (d.key === "Tab") {
        d.preventDefault();
        const u = mc.filter((p) => p.startsWith(a.value.toLowerCase()));
        u.length === 1 ? a.value = `${u[0]} ` : u.length > 1 && c(u.join("   "), "muted");
      } else d.key === "l" && d.ctrlKey && (d.preventDefault(), n?.replaceChildren());
    }), t.addEventListener("click", () => a?.focus()), t.parentElement?.addEventListener("click", (d) => {
      const u = d.target instanceof Element ? d.target.closest("[data-td-term-chip]") : null;
      u instanceof HTMLElement && l(u.dataset.tdTermChip ?? u.textContent ?? "");
    });
  }), e.querySelectorAll("td-org").forEach((t) => {
    if (ns.has(t))
      return;
    ns.add(t);
    const a = () => {
      const s = [...t.querySelectorAll("[data-td-org-card].is-on")], o = t.querySelector("[data-td-org-msg]");
      o && (o.textContent = s.length ? `Seleccionado: ${s.map((r) => `${r.dataset.name} (${r.dataset.role})`).join(", ")}` : "Sin selección");
    };
    t.addEventListener("click", (s) => {
      const o = s.target instanceof Element ? s.target : null;
      if (!o)
        return;
      if (o.closest("[data-td-org-expand]")) {
        t.querySelectorAll("[data-td-org-kids]").forEach((c) => {
          c.hidden = !1;
        }), t.querySelectorAll("[data-td-org-toggle]").forEach((c) => {
          c.setAttribute("aria-expanded", "true");
          const l = c.closest('[role="treeitem"]');
          l?.setAttribute("aria-expanded", "true");
          const d = l?.querySelector("[data-td-org-card]")?.getAttribute("data-name") ?? "el equipo", u = c.querySelector("span")?.textContent ?? "";
          c.setAttribute("aria-label", `Ocultar equipo de ${d}, ${u === "1" ? "1 persona" : `${u} personas`}`);
        });
        return;
      }
      if (o.closest("[data-td-org-collapse]")) {
        t.querySelectorAll("[data-td-org-kids]").forEach((c) => {
          c.hidden = !0;
        }), t.querySelectorAll("[data-td-org-toggle]").forEach((c) => {
          c.setAttribute("aria-expanded", "false");
          const l = c.closest('[role="treeitem"]');
          l?.setAttribute("aria-expanded", "false");
          const d = l?.querySelector("[data-td-org-card]")?.getAttribute("data-name") ?? "el equipo", u = c.querySelector("span")?.textContent ?? "";
          c.setAttribute("aria-label", `Mostrar equipo de ${d}, ${u === "1" ? "1 persona" : `${u} personas`}`);
        });
        return;
      }
      if (o.closest("[data-td-org-multi]")) {
        const c = t.dataset.multi !== "true";
        t.dataset.multi = c ? "true" : "false", o.closest("[data-td-org-multi]")?.setAttribute("aria-checked", String(c)), t.querySelectorAll("[data-td-org-card]").forEach((l) => l.classList.remove("is-on")), a();
        return;
      }
      const r = o.closest("[data-td-org-toggle]");
      if (r instanceof HTMLButtonElement) {
        const c = r.closest(".td-org__item"), l = c?.querySelector(":scope > [data-td-org-kids]"), d = r.getAttribute("aria-expanded") !== "true";
        r.setAttribute("aria-expanded", d ? "true" : "false"), c?.setAttribute("aria-expanded", d ? "true" : "false");
        const u = c?.querySelector("[data-td-org-card]")?.getAttribute("data-name") ?? "el equipo", p = r.querySelector("span")?.textContent ?? "";
        r.setAttribute("aria-label", `${d ? "Ocultar" : "Mostrar"} equipo de ${u}, ${p === "1" ? "1 persona" : `${p} personas`}`), l instanceof HTMLElement && (l.hidden = !d);
        return;
      }
      if (o.closest("a"))
        return;
      const i = o.closest("[data-td-org-card]");
      i instanceof HTMLElement && (t.dataset.multi === "true" ? (i.classList.toggle("is-on"), i.closest('[role="treeitem"]')?.setAttribute("aria-selected", String(i.classList.contains("is-on")))) : t.querySelectorAll("[data-td-org-card]").forEach((c) => {
        const l = c === i;
        c.classList.toggle("is-on", l), c.closest('[role="treeitem"]')?.setAttribute("aria-selected", String(l));
      }), a());
    });
    const n = t.querySelector("[data-td-org-scroll]");
    n && (n.scrollLeft = (n.scrollWidth - n.clientWidth) / 2);
  });
}
function hc(e = document) {
  e.querySelectorAll('[data-td-checkbox][data-tri="true"]').forEach((t) => {
    t.indeterminate = t.dataset.state === "mixed";
  }), e.querySelectorAll("[data-td-carousel]").forEach((t) => {
    Ac(t);
  }), e.querySelectorAll("[data-td-ccard]").forEach((t) => {
    kc(t);
  }), e.querySelectorAll("[data-td-toast]").forEach((t) => {
    window.setTimeout(() => t.remove(), 4e3);
  }), e.querySelectorAll("[data-td-chip-box]").forEach((t) => {
    t.dataset.tpl || (t.dataset.tpl = t.innerHTML);
  });
}
function gc(e) {
  e.closest("td-split") || (document.querySelectorAll("[data-td-split-menu]").forEach((t) => {
    t.hidden = !0;
  }), document.querySelectorAll("[data-td-split-open]").forEach((t) => {
    t.setAttribute("aria-expanded", "false");
  })), e.closest("td-fab") || (document.querySelectorAll("[data-td-fab-menu]").forEach((t) => {
    t.hidden = !0;
  }), document.querySelectorAll("[data-td-fab]").forEach((t) => {
    t.setAttribute("aria-expanded", "false");
  })), e.closest("td-select") || oa(), e.closest("td-speed") || document.querySelectorAll("td-speed").forEach((t) => we(t, !1));
}
function bc(e) {
  const a = e.closest("[data-td-inplace-view]")?.closest("td-inplace");
  a?.getAttribute("data-mode") === "auto" && fn(a);
}
function $c(e) {
  const t = e.closest("[data-td-photo-open]");
  if (t instanceof HTMLButtonElement && !t.disabled)
    return t.closest("td-photo")?.querySelector("[data-td-photo-pick]")?.click(), !0;
  const a = e.closest("[data-td-photos-open]");
  if (a instanceof HTMLButtonElement && !a.disabled) {
    const E = a.closest("td-photos");
    return E instanceof HTMLElement && Dc(E), !0;
  }
  const n = e.closest("[data-td-photos-shot]");
  if (n instanceof HTMLButtonElement && !n.disabled) {
    const E = n.closest("td-photos");
    return E instanceof HTMLElement && Ic(E), !0;
  }
  const s = e.closest("[data-td-photos-done]");
  if (s instanceof HTMLButtonElement)
    return s.closest("td-photos")?.querySelector("[data-td-photos-cam]")?.close(), !0;
  const o = e.closest("[data-td-photos-remove]");
  if (o instanceof HTMLButtonElement) {
    const E = o.closest("td-photos"), _ = Number(o.dataset.tdPhotosRemove);
    return E instanceof HTMLElement && Number.isFinite(_) && Fc(E, _), !0;
  }
  const r = e.closest("[data-td-check-all]");
  if (r instanceof HTMLInputElement) {
    const E = r.getAttribute("data-td-check-all"), _ = document.querySelectorAll(`[data-td-check-group="${E}"]`), N = !_.length || [..._].some((K) => !K.checked);
    return _.forEach((K) => {
      K.checked = N;
    }), r.checked = N, r.indeterminate = !1, !0;
  }
  const i = e.closest("[data-td-select-open]");
  if (i instanceof HTMLElement && i.getAttribute("aria-disabled") !== "true" && !e.closest("[data-td-select-remove], [data-td-select-clear]")) {
    const _ = i.closest("td-select")?.querySelector("[data-td-select-panel]");
    if (_) {
      const N = _.hidden;
      oa(), _.hidden = !N, i.setAttribute("aria-expanded", String(N));
    }
    return !0;
  }
  const c = e.closest("[data-td-select-all]");
  if (c instanceof HTMLButtonElement) {
    const E = c.closest("td-select");
    return E?.querySelectorAll("[data-td-select-pick]:not([disabled])").forEach((_) => {
      _.hidden || ja(E, _.dataset.tdSelectPick ?? "", !0);
    }), E && ae(E), !0;
  }
  const l = e.closest("[data-td-select-none]");
  if (l instanceof HTMLButtonElement) {
    const E = l.closest("td-select");
    return E?.querySelectorAll("[data-td-select-value]").forEach((_) => _.remove()), E && ae(E), !0;
  }
  const d = e.closest("[data-td-select-group]");
  if (d instanceof HTMLButtonElement) {
    const E = d.closest("td-select"), _ = d.dataset.tdSelectGroup ?? "";
    return E?.querySelectorAll(`[data-td-select-pick][data-group="${CSS.escape(_)}"]:not([disabled])`).forEach((N) => {
      ja(E, N.dataset.tdSelectPick ?? "", !0);
    }), E && ae(E), !0;
  }
  const u = e.closest("[data-td-select-pick]");
  if (u instanceof HTMLButtonElement)
    return xc(u), !0;
  const p = e.closest("[data-td-select-remove]");
  if (p instanceof HTMLButtonElement) {
    const E = p.closest("td-select");
    return E?.querySelectorAll("[data-td-select-value]").forEach((_) => {
      _.value === p.dataset.tdSelectRemove && _.remove();
    }), E && ae(E), !0;
  }
  const m = e.closest("[data-td-select-clear]");
  if (m instanceof HTMLButtonElement) {
    const E = m.closest("td-select");
    return E?.querySelectorAll("[data-td-select-value]").forEach((_) => _.remove()), E?.dataset.nullable === "true" && ma(E, ""), E && ae(E), !0;
  }
  const h = e.closest("[data-td-numeric-step]");
  if (h instanceof HTMLButtonElement) {
    const _ = h.closest("td-numeric")?.querySelector("[data-td-numeric]");
    if (_) {
      const N = Number(h.dataset.tdNumericStep ?? 1), K = Number(_.min || 0), _t = Number(_.max || 9999), bt = Math.min(_t, Math.max(K, Number(_.value || 0) + N));
      _.value = String(bt), _.dispatchEvent(new Event("input", { bubbles: !0 }));
    }
    return !0;
  }
  const g = e.closest("[data-td-rating]");
  if (g instanceof HTMLButtonElement && g.closest('[data-readonly="true"]') == null) {
    const E = g.closest("td-rating"), _ = Number(g.dataset.tdRating ?? 0), N = E?.querySelector("[data-td-rating-value]");
    return N && (N.value = String(_)), E?.querySelectorAll("[data-td-rating]").forEach((K) => {
      const _t = Number(K.dataset.tdRating ?? 0);
      K.classList.toggle("is-on", _t <= _), K.setAttribute("aria-checked", _t === _ ? "true" : "false");
    }), !0;
  }
  const f = e.closest("[data-td-selectbar]");
  if (f instanceof HTMLButtonElement) {
    const E = f.closest(".td-selectbar");
    if (E?.getAttribute("data-multiple") === "true" ? (f.classList.toggle("is-on"), f.setAttribute("aria-pressed", f.classList.contains("is-on") ? "true" : "false")) : E?.querySelectorAll("[data-td-selectbar]").forEach((N) => {
      N.classList.toggle("is-on", N === f), N.setAttribute("aria-pressed", N === f ? "true" : "false");
    }), wc(E), f.closest(".td-toolbar")) {
      const N = document.querySelector("[data-td-toolbar-status]");
      N && (N.textContent = `Vista: ${f.textContent?.trim() ?? ""}`);
    }
    return !0;
  }
  const b = e.closest("[data-td-chip-toggle]");
  if (b instanceof HTMLButtonElement) {
    const E = b.getAttribute("aria-pressed") !== "true";
    return b.classList.toggle("is-on", E), b.setAttribute("aria-pressed", E ? "true" : "false"), !0;
  }
  const v = e.closest("[data-td-chip-reset]");
  if (v instanceof HTMLButtonElement) {
    const E = v.parentElement?.querySelector("[data-td-chip-box]");
    return E?.dataset.tpl && (E.innerHTML = E.dataset.tpl), !0;
  }
  const x = e.closest("[data-td-toggle]");
  if (x instanceof HTMLButtonElement) {
    const E = x.dataset.tdToggleGroup;
    if (E)
      document.querySelectorAll(`[data-td-toggle-group="${E}"]`).forEach((_) => {
        const N = _ === x;
        _.classList.toggle("is-on", N), _.setAttribute("aria-pressed", N ? "true" : "false");
      });
    else {
      const _ = x.getAttribute("aria-pressed") !== "true";
      x.classList.toggle("is-on", _), x.setAttribute("aria-pressed", _ ? "true" : "false");
    }
    return !0;
  }
  const M = e.closest("[data-td-tab-close]");
  if (M instanceof HTMLElement) {
    const E = M.closest("[data-td-tab]"), _ = E?.closest("td-tabs"), N = [..._?.querySelectorAll("[data-td-tab]") ?? []];
    if (_ && E instanceof HTMLButtonElement && N.length > 1) {
      const K = N.indexOf(E), _t = _.querySelector(`[data-td-tab-panel="${E.dataset.tdTab}"]`), bt = N[K - 1] ?? N[K + 1];
      E.remove(), _t?.remove(), bt?.click();
    }
    return !0;
  }
  const S = e.closest("[data-td-tab-add]");
  if (S instanceof HTMLButtonElement) {
    const E = S.closest("td-tabs"), _ = E?.querySelector(".td-tabs__list"), N = E?.querySelector("[data-td-tab-panels]");
    if (_ && N) {
      const K = _.querySelectorAll("[data-td-tab]").length + 1, _t = `pedido-${K}`, bt = document.createElement("button");
      bt.type = "button", bt.className = "td-tabs__tab", bt.role = "tab", bt.dataset.tdTab = _t, bt.innerHTML = `<span>Pedido ${K}</span><span class="td-tabs__x" data-td-tab-close aria-label="Cerrar Pedido ${K}">×</span>`, _.insertBefore(bt, S);
      const me = document.createElement("div");
      me.className = "td-tabs__pane", me.dataset.tdTabPanel = _t, me.hidden = !0, me.textContent = `Pedido ${K} sin líneas.`, N.append(me), bt.click();
    }
    return !0;
  }
  const $ = e.closest("[data-td-tab]");
  if ($ instanceof HTMLButtonElement) {
    const E = $.closest("td-tabs");
    E?.querySelectorAll("[data-td-tab]").forEach((N) => {
      const K = N === $;
      N.classList.toggle("is-on", K), N.setAttribute("aria-selected", K ? "true" : "false"), N.tabIndex = K ? 0 : -1;
    });
    const _ = $.dataset.tdTab;
    return E?.querySelectorAll("[data-td-tab-panel]").forEach((N) => {
      N.hidden = N.dataset.tdTabPanel !== _;
    }), !0;
  }
  const w = e.closest(".td-split__menu a, .td-split__menu button");
  if (w instanceof HTMLElement) {
    const E = w.closest("td-split"), _ = E?.querySelector("[data-td-split-menu]"), N = E?.querySelector("[data-td-split-status]"), K = E?.querySelector(".td-btn__text, .td-btn")?.textContent?.trim() ?? "Acción";
    return _ && (_.hidden = !0), E?.querySelector("[data-td-split-open]")?.setAttribute("aria-expanded", "false"), N && (N.textContent = `${K} → ${w.textContent?.trim() ?? ""}`), w instanceof HTMLButtonElement;
  }
  const y = e.closest("[data-td-split-open]");
  if (y instanceof HTMLButtonElement) {
    const E = y.closest("td-split")?.querySelector("[data-td-split-menu]");
    if (E) {
      const _ = E.hidden;
      document.querySelectorAll("[data-td-split-menu]").forEach((N) => {
        N.hidden = !0;
      }), E.hidden = !_, y.setAttribute("aria-expanded", String(_));
    }
    return !0;
  }
  const L = e.closest("[data-td-speed]");
  if (L instanceof HTMLButtonElement)
    return we(L.closest("td-speed"), L.getAttribute("aria-expanded") !== "true"), !0;
  const q = e.closest("[data-td-speed-mask]");
  if (q instanceof HTMLElement)
    return we(q.closest("td-speed"), !1), !0;
  const O = e.closest(".td-fab__menu a, .td-fab__menu button");
  if (O instanceof HTMLElement) {
    const E = O.closest("td-fab"), _ = E?.querySelector("[data-td-fab-menu]");
    return _ && (_.hidden = !0), E?.querySelector("[data-td-fab]")?.setAttribute("aria-expanded", "false"), O instanceof HTMLButtonElement;
  }
  const W = e.closest("[data-td-speed-item]");
  if (W instanceof HTMLElement) {
    const E = W.closest("td-speed"), _ = W.closest(".td-speed-host")?.querySelector("[data-td-speed-status]"), N = W.getAttribute("aria-label") || W.textContent || "", K = E?.querySelector("[data-td-speed]")?.getAttribute("aria-label") ?? "Acción";
    return _ && (_.textContent = `${K} → ${N.trim()}`), we(E, !1), W.getAttribute("href") === "#";
  }
  const Y = e.closest("[data-td-fab]");
  if (Y instanceof HTMLButtonElement) {
    const E = Y.closest("td-fab")?.querySelector("[data-td-fab-menu]");
    return E && (E.hidden = !E.hidden, Y.setAttribute("aria-expanded", String(!E.hidden))), !0;
  }
  const k = e.closest("[data-td-message-close]");
  if (k instanceof HTMLButtonElement)
    return k.closest("[data-td-message]")?.remove(), !0;
  const H = e.closest("[data-td-dialog-open]");
  if (H instanceof HTMLElement) {
    const E = H.getAttribute("data-td-dialog-open"), _ = E ? document.getElementById(E) : null;
    return _ instanceof HTMLDialogElement && _.showModal(), !0;
  }
  const R = e.closest("[data-td-catalog-toggle]");
  if (R instanceof HTMLButtonElement) {
    const E = R.getAttribute("aria-expanded") !== "true";
    R.setAttribute("aria-expanded", String(E));
    const _ = R.parentElement?.querySelector(".td-catalog__leaves");
    return _ && (_.hidden = !E), !0;
  }
  const it = e.closest("[data-td-catalog-clear]");
  if (it instanceof HTMLButtonElement) {
    const E = it.closest("[data-td-catalog]")?.querySelector("[data-td-catalog-q]");
    return E && (E.value = "", zs(E), E.focus()), !0;
  }
  const Pt = e.closest("[data-td-inplace-ok]");
  if (Pt instanceof HTMLButtonElement)
    return Jt(Pt.closest("td-inplace"), !0), !0;
  const ft = e.closest("[data-td-inplace-cancel]");
  if (ft instanceof HTMLButtonElement)
    return Jt(ft.closest("td-inplace"), !1), !0;
  const ce = e.closest("[data-td-inplace-view]");
  if (ce instanceof HTMLButtonElement && ce.closest("td-inplace")?.getAttribute("data-mode") === "confirm")
    return fn(ce.closest("td-inplace")), !0;
  const le = e.closest("[data-td-list-pick]");
  if (le instanceof HTMLButtonElement && !le.disabled)
    return Ec(le), !0;
  const Ce = e.closest("[data-td-otp-clear]");
  if (Ce instanceof HTMLButtonElement) {
    const E = Ce.closest("td-otp");
    return E?.querySelectorAll("[data-td-otp-cell]").forEach((_) => {
      _.value = "", _.classList.remove("is-ok", "is-bad");
    }), Vs(E), E?.querySelector("[data-td-otp-cell]")?.focus(), !0;
  }
  const Yt = e.closest("[data-td-inplace-open]");
  if (Yt instanceof HTMLButtonElement) {
    const _ = Yt.closest("td-inplace")?.querySelector("[data-td-inplace-panel]");
    return _ && (_.hidden = !1, Yt.hidden = !0, Yt.setAttribute("aria-expanded", "true")), !0;
  }
  const Te = e.closest("[data-td-inplace-close]");
  if (Te instanceof HTMLButtonElement) {
    const E = Te.closest("td-inplace"), _ = E?.querySelector("[data-td-inplace-panel]"), N = E?.querySelector("[data-td-inplace-open]");
    return _ && N && (_.hidden = !0, N.hidden = !1, N.setAttribute("aria-expanded", "false"), N.focus()), !0;
  }
  const He = e.closest("[data-td-ac-pick]");
  if (He instanceof HTMLButtonElement)
    return Us(He), !0;
  const C = e.closest("[data-td-chip-add]");
  if (C instanceof HTMLButtonElement)
    return Ws(C.closest("td-chiplist"), C.dataset.tdChipAdd ?? C.textContent ?? ""), !0;
  const D = e.closest("[data-td-chip-remove]");
  if (D instanceof HTMLButtonElement)
    return D.closest(".td-chip")?.remove(), !0;
  const tt = e.closest("[data-td-toast-close]");
  if (tt instanceof HTMLButtonElement)
    return tt.closest("[data-td-toast]")?.remove(), !0;
  const ht = e.closest("[data-td-carousel-prev]");
  if (ht instanceof HTMLButtonElement)
    return Fa(ht.closest("[data-td-carousel]"), -1), !0;
  const Ut = e.closest("[data-td-carousel-next]");
  if (Ut instanceof HTMLButtonElement)
    return Fa(Ut.closest("[data-td-carousel]"), 1), !0;
  const de = e.closest("[data-td-carousel-dot]");
  if (de instanceof HTMLButtonElement)
    return Js(de.closest("[data-td-carousel]"), Number(de.dataset.tdCarouselDot ?? 0)), !0;
  const G = e.closest("[data-td-carousel-play]");
  if (G instanceof HTMLButtonElement)
    return qc(G.closest("[data-td-carousel]")), !0;
  const te = e.closest("[data-td-ccard-prev]");
  if (te instanceof HTMLButtonElement)
    return Da(te.closest("[data-td-ccard]"), -1), !0;
  const ue = e.closest("[data-td-ccard-next]");
  if (ue instanceof HTMLButtonElement)
    return Da(ue.closest("[data-td-ccard]"), 1), !0;
  const pe = e.closest("[data-td-ccard-dot]");
  if (pe instanceof HTMLButtonElement)
    return Ks(pe.closest("[data-td-ccard]"), Number(pe.dataset.tdCcardDot ?? 0)), !0;
  const Ne = e.closest("[data-td-ccard-play]");
  if (Ne instanceof HTMLButtonElement)
    return _c(Ne.closest("[data-td-ccard]")), !0;
  const Ln = e.closest("[data-td-busy-demo]");
  if (Ln instanceof HTMLElement) {
    const E = Ln.closest("td-button");
    return E && !E.hasAttribute("data-pending") && (E.setAttribute("data-pending", ""), window.setTimeout(() => E.removeAttribute("data-pending"), 1600)), !0;
  }
  const ha = e.closest("[data-td-copy]");
  if (ha instanceof HTMLButtonElement) {
    const E = ha.closest(".td-code")?.querySelector("[data-td-copy-source]"), _ = ha.querySelector("[data-td-copy-label]"), N = E?.textContent ?? "";
    return N && navigator.clipboard && navigator.clipboard.writeText(N).then(() => {
      _ && (_.textContent = "Copiado", window.setTimeout(() => {
        _.textContent = "Copiar";
      }, 1600));
    }), !0;
  }
  return !e.closest("[data-td-select-panel]") && !e.closest("[data-td-select-open]") && oa(), !1;
}
function yc(e) {
  if (e instanceof HTMLInputElement) {
    if (e.matches("[data-td-select-query]")) {
      const t = e.value.trim().toLowerCase(), a = e.closest("td-select");
      let n = 0;
      a?.querySelectorAll("[data-td-select-pick]").forEach((o) => {
        const r = (o.dataset.label ?? o.textContent ?? "").toLowerCase(), i = t.length === 0 || r.includes(t);
        o.hidden = !i, i && (n += 1);
      });
      const s = a?.querySelector("[data-td-select-empty]");
      s && (s.hidden = n > 0);
      return;
    }
    if (e.matches("[data-td-list-filter]")) {
      const t = e.value.trim().toLowerCase(), a = e.closest("td-listbox");
      let n = 0;
      a?.querySelectorAll("[data-td-list-pick]").forEach((o) => {
        const r = (o.dataset.label ?? "").toLowerCase(), i = t.length === 0 || r.includes(t);
        o.hidden = !i, i && (n += 1);
      });
      const s = a?.querySelector("[data-td-list-empty]");
      s && (s.hidden = n > 0);
      return;
    }
    if (e.matches("[data-td-slider]")) {
      const t = e.closest("td-slider")?.querySelector("[data-td-slider-out]");
      t && (t.textContent = e.value);
      return;
    }
    if (e.matches("[data-td-mask]")) {
      e.value = Mc(e.value, e.dataset.tdMask ?? "");
      return;
    }
    if (e.matches("[data-td-otp-cell]")) {
      const t = e.closest("td-otp"), a = [...t?.querySelectorAll("[data-td-otp-cell]") ?? []], n = e.value.replace(/\D/g, "");
      if (n.length > 1)
        a.forEach((s, o) => {
          s.value = n[o] ?? "";
        }), a[Math.min(n.length, a.length) - 1]?.focus();
      else {
        e.value = n.slice(0, 1);
        const s = a.indexOf(e);
        n && a[s + 1] && a[s + 1].focus();
      }
      Vs(t);
      return;
    }
    if (e.matches("[data-td-file]")) {
      const t = e.closest("td-file")?.querySelector("[data-td-file-name]");
      t && (t.textContent = e.files?.[0]?.name ?? "Ningún archivo elegido");
      return;
    }
    if (e.matches("[data-td-catalog-q]")) {
      zs(e);
      return;
    }
    e.matches("[data-td-ac]") && Lc(e);
  }
}
function zs(e) {
  const t = e.closest("[data-td-catalog]");
  if (!t)
    return;
  const a = e.value.trim().toLowerCase(), n = t.querySelector("[data-td-catalog-clear]");
  n && (n.hidden = a.length === 0);
  let s = 0;
  t.querySelectorAll("[data-td-catalog-group]").forEach((r) => {
    let i = 0;
    r.querySelectorAll("[data-td-catalog-leaf]").forEach((d) => {
      const u = (d.dataset.name ?? d.textContent ?? "").toLowerCase(), p = a.length === 0 || u.includes(a);
      d.hidden = !p, p && (i += 1);
    }), r.hidden = i === 0;
    const c = r.querySelector("[data-td-catalog-toggle]"), l = r.querySelector(".td-catalog__leaves");
    c && a.length > 0 && (c.setAttribute("aria-expanded", "true"), l && (l.hidden = !1)), s += i;
  });
  const o = t.querySelector("[data-td-catalog-empty]");
  o && (o.hidden = s > 0);
}
function vc(e) {
  const t = e.target;
  if (e.key === "Escape") {
    document.querySelectorAll("[data-td-ac-list]").forEach((n) => {
      n.hidden = !0;
    }), document.querySelectorAll("[data-td-ac]").forEach((n) => {
      n.setAttribute("aria-expanded", "false");
    }), document.querySelectorAll("[data-td-split-menu], [data-td-fab-menu]").forEach((n) => {
      n.hidden || (n.hidden = !0, n.closest("td-split, td-fab")?.querySelector("[data-td-split-open], [data-td-fab]")?.focus());
    }), document.querySelectorAll("[data-td-split-open], [data-td-fab]").forEach((n) => {
      n.setAttribute("aria-expanded", "false");
    }), document.querySelectorAll("td-speed").forEach((n) => we(n, !1));
    const a = t instanceof Element ? t.closest("td-inplace") : null;
    a && Jt(a, !1);
  }
  if (t instanceof HTMLInputElement && t.matches("[data-td-otp-cell]")) {
    const a = [...t.closest("td-otp")?.querySelectorAll("[data-td-otp-cell]") ?? []], n = a.indexOf(t);
    e.key === "Backspace" && !t.value && a[n - 1] && a[n - 1].focus(), e.key === "ArrowLeft" && a[n - 1] && a[n - 1].focus(), e.key === "ArrowRight" && a[n + 1] && a[n + 1].focus();
    return;
  }
  if (t instanceof HTMLElement && t.closest("[data-td-inplace-input]") && t.closest("td-inplace")?.getAttribute("data-mode") === "confirm" && e.key === "Enter" && !(t instanceof HTMLTextAreaElement)) {
    e.preventDefault(), Jt(t.closest("td-inplace"), !0);
    return;
  }
  if (t instanceof HTMLElement && t.closest("td-inplace")?.getAttribute("data-mode") === "auto") {
    const a = t.closest("td-inplace"), n = t instanceof HTMLTextAreaElement;
    if (e.key === "Enter" && (!n || e.ctrlKey)) {
      e.preventDefault(), Jt(a, !0);
      return;
    }
    if (e.key === "Tab") {
      Jt(a, !0);
      const s = [...document.querySelectorAll("[data-td-inplace-view]")], o = a?.querySelector("[data-td-inplace-view]"), r = s[s.indexOf(o) + (e.shiftKey ? -1 : 1)];
      r && (e.preventDefault(), window.setTimeout(() => fn(r.closest("td-inplace")), 0));
    }
  }
  if (t instanceof HTMLElement && t.closest("[data-td-listbox]") && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    const a = [...t.closest("[data-td-listbox]")?.querySelectorAll("[data-td-list-pick]:not([hidden]):not([disabled])") ?? []], n = a.indexOf(document.activeElement), s = e.key === "ArrowDown" ? Math.min(a.length - 1, n + 1) : Math.max(0, n - 1);
    e.preventDefault(), a[s]?.focus();
    return;
  }
  if (t instanceof HTMLElement && t.closest("td-speed") && t.closest("td-speed")?.querySelector("[data-td-speed]")?.getAttribute("aria-expanded") === "true") {
    const a = [...t.closest("td-speed")?.querySelectorAll("[data-td-speed-item]") ?? []], n = a.indexOf(document.activeElement);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const s = e.key === "ArrowDown" ? (n + 1) % a.length : (n - 1 + a.length) % a.length;
      a[s]?.focus();
    }
  }
  if (t instanceof HTMLElement && t.matches("[data-td-tab]") && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) {
    const a = t.closest("td-tabs"), n = a?.classList.contains("td-tabs--vertical") === !0, s = [...a?.querySelectorAll("[data-td-tab]") ?? []], o = s.indexOf(t), r = n ? e.key === "ArrowDown" : e.key === "ArrowRight", i = n ? e.key === "ArrowUp" : e.key === "ArrowLeft";
    let c = o;
    if (r)
      c = (o + 1) % s.length;
    else if (i)
      c = (o - 1 + s.length) % s.length;
    else if (e.key === "Home")
      c = 0;
    else if (e.key === "End")
      c = s.length - 1;
    else
      return;
    e.preventDefault(), s[c]?.focus(), s[c]?.click();
    return;
  }
  if (t instanceof HTMLElement && t.matches("[data-td-select-open]") && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
    e.preventDefault(), t.click();
    return;
  }
  if (t instanceof HTMLInputElement && t.matches("[data-td-chip-input]") && e.key === "Enter") {
    e.preventDefault(), Ws(t.closest("td-chiplist"), t.value), t.value = "";
    return;
  }
  if (t instanceof HTMLInputElement && t.matches("[data-td-chip-input]") && e.key === "Backspace" && !t.value) {
    const a = t.closest("[data-td-chiplist]")?.querySelectorAll(".td-chip");
    a?.[a.length - 1]?.querySelector("[data-td-chip-remove]")?.click();
    return;
  }
  if (t instanceof HTMLInputElement && t.matches("[data-td-ac]")) {
    const n = [...t.closest("td-autocomplete")?.querySelector("[data-td-ac-list]")?.querySelectorAll("[data-td-ac-pick]:not([hidden])") ?? []], s = n.findIndex((o) => o.classList.contains("is-active"));
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const o = e.key === "ArrowDown" ? Math.min(n.length - 1, s + 1) : Math.max(0, s - 1);
      n.forEach((r, i) => r.classList.toggle("is-active", i === o)), n[o]?.focus();
    }
    e.key === "Enter" && n[s] && (e.preventDefault(), Us(n[s]));
  }
}
function xc(e) {
  const t = e.closest("td-select");
  if (!t)
    return;
  const a = t.dataset.multiple === "true", n = e.dataset.tdSelectPick ?? "";
  a ? ja(t, n) : (t.querySelectorAll("[data-td-select-value]").forEach((s) => s.remove()), ma(t, n), oa()), ae(t);
}
function ja(e, t, a = !1) {
  if (!t)
    return;
  e.querySelectorAll("[data-td-select-value]").forEach((r) => {
    r.value === "" && r.remove();
  });
  const n = [...e.querySelectorAll("[data-td-select-value]")].find((r) => r.value === t);
  if (n) {
    a || n.remove();
    return;
  }
  const s = Number(e.getAttribute("data-max-selected") ?? "0"), o = [...e.querySelectorAll("[data-td-select-value]")].filter((r) => r.value !== "").length;
  s > 0 && o >= s || ma(e, t);
}
function ae(e) {
  e.dataset.nullable === "true" && e.querySelector("[data-td-select-value]") === null && ma(e, "");
  const t = [...e.querySelectorAll("[data-td-select-value]")].map((i) => i.value).filter((i) => i !== ""), a = e.querySelector("[data-td-select-clear]"), n = e.querySelector(".td-select__trigger");
  a && (a.hidden = t.length === 0), n?.classList.toggle("has-clear", t.length > 0 && a !== null);
  const s = e.dataset.chips !== "false", o = Number(e.dataset.maxChips ?? "8"), r = e.querySelector(".td-select__chips");
  if (r && e.dataset.multiple === "true") {
    if (r.querySelectorAll("[data-td-select-chip], [data-td-select-more], .td-select__text").forEach((i) => i.remove()), !s || t.length === 0) {
      const i = document.createElement("span");
      i.className = `td-select__text${t.length ? "" : " is-placeholder"}`;
      const c = e.dataset.summary || "{0} seleccionadas";
      i.textContent = t.length ? c.replace("{0}", String(t.length)) : e.dataset.placeholder ?? "Selecciona", r.append(i);
    } else if (t.slice(0, o).forEach((i) => {
      const c = e.querySelector(`[data-td-select-pick="${CSS.escape(i)}"]`), l = document.createElement("span");
      l.className = "td-chip td-chip--sm", l.dataset.tdSelectChip = i, l.append(c?.dataset.label ?? i);
      const d = document.createElement("button");
      d.type = "button", d.className = "td-chip__remove", d.dataset.tdSelectRemove = i, d.setAttribute("aria-label", `Quitar ${c?.dataset.label ?? i}`), d.textContent = "×", l.append(d), r.append(l);
    }), t.length > o) {
      const i = document.createElement("span");
      i.className = "td-chip td-chip--sm", i.dataset.tdSelectMore = "", i.textContent = `+${t.length - o}`, r.append(i);
    }
  } else if (r) {
    const i = r.querySelector(".td-select__text"), c = e.querySelector(`[data-td-select-pick="${CSS.escape(t[0] ?? "")}"]`);
    i && (i.textContent = c?.dataset.label ?? e.dataset.placeholder ?? "Selecciona", i.classList.toggle("is-placeholder", t.length === 0));
  }
  Sc(e);
}
function ma(e, t) {
  const a = e.getAttribute("data-name") ?? e.querySelector("[data-td-select-value]")?.name ?? "valor", n = document.createElement("input");
  n.type = "hidden", n.name = a || "valor", n.value = t, n.dataset.tdSelectValue = "", e.insertBefore(n, e.querySelector("[data-td-select-open]"));
}
function Sc(e) {
  if (!e)
    return;
  const t = new Set([...e.querySelectorAll("[data-td-select-value]")].map((s) => s.value)), a = Number(e.getAttribute("data-max-selected") ?? "0"), n = a > 0 && t.size >= a;
  e.querySelectorAll("[data-td-select-pick]").forEach((s) => {
    const o = t.has(s.dataset.tdSelectPick ?? "");
    s.classList.toggle("is-on", o), s.setAttribute("aria-selected", o ? "true" : "false"), s.disabled = s.dataset.locked === "true" || n && !o;
  });
}
function wc(e) {
  if (!e)
    return;
  const t = e.getAttribute("data-name") ?? "barra";
  e.querySelectorAll("[data-td-selectbar-value]").forEach((a) => a.remove()), e.querySelectorAll("[data-td-selectbar].is-on").forEach((a) => {
    const n = document.createElement("input");
    n.type = "hidden", n.name = t, n.value = a.dataset.tdSelectbar ?? "", n.dataset.tdSelectbarValue = "", e.append(n);
  });
}
function Ec(e) {
  const t = e.closest("td-listbox");
  if (!t)
    return;
  const a = t.dataset.multiple === "true";
  if (e.dataset.tdListPick, !a)
    t.querySelectorAll("[data-td-list-pick]").forEach((s) => {
      s.classList.toggle("is-on", s === e), s.setAttribute("aria-selected", s === e ? "true" : "false");
    });
  else {
    const s = !e.classList.contains("is-on");
    e.classList.toggle("is-on", s), e.setAttribute("aria-selected", s ? "true" : "false");
  }
  const n = t.dataset.name ?? "lista";
  t.querySelectorAll("[data-td-list-value]").forEach((s) => s.remove()), t.querySelectorAll("[data-td-list-pick].is-on").forEach((s) => {
    const o = document.createElement("input");
    o.type = "hidden", o.name = n, o.value = s.dataset.tdListPick ?? "", o.dataset.tdListValue = "", t.append(o);
  });
}
function Vs(e) {
  if (!e)
    return;
  const t = [...e.querySelectorAll("[data-td-otp-cell]")], a = t.map((r) => r.value.replace(/\D/g, "").slice(0, 1)).join(""), n = e.querySelector("[data-td-otp-value]");
  n && (n.value = a);
  const s = e.querySelector("[data-td-otp-status]"), o = e.getAttribute("data-expected") ?? "";
  if (t.forEach((r) => r.classList.remove("is-ok", "is-bad")), !!s) {
    if (a.length < t.length) {
      s.textContent = `${t.length - a.length} dígitos restantes`, s.className = "";
      return;
    }
    if (!o || a === o) {
      s.textContent = "Código verificado", s.className = "is-ok", t.forEach((r) => r.classList.add("is-ok"));
      return;
    }
    s.textContent = "Código incorrecto · te quedan 2 intentos", s.className = "is-bad", t.forEach((r) => r.classList.add("is-bad"));
  }
}
function we(e, t) {
  if (!e)
    return;
  const a = e.querySelector("[data-td-speed-actions]"), n = e.querySelector("[data-td-speed-mask]"), s = e.querySelector("[data-td-speed]");
  a && (a.hidden = !t), n && (n.hidden = !t), s?.setAttribute("aria-expanded", t ? "true" : "false"), t || s instanceof HTMLElement && s.focus();
}
function fn(e) {
  if (!e)
    return;
  const t = e.querySelector("[data-td-inplace-view]"), a = e.querySelector("[data-td-inplace-edit]"), n = e.querySelector("[data-td-inplace-input]"), s = e.querySelector("[data-td-inplace-text]")?.textContent ?? "";
  t && (t.hidden = !0), a && (a.hidden = !1), n && n.tagName !== "SELECT" && (n.value = s), n?.focus(), n instanceof HTMLInputElement && n.select();
}
function Jt(e, t) {
  if (!e)
    return;
  const a = e.querySelector("[data-td-inplace-view]"), n = e.querySelector("[data-td-inplace-edit]"), s = e.querySelector("[data-td-inplace-input]"), o = e.querySelector("[data-td-inplace-text]"), r = e.querySelector("[data-td-inplace-value]"), i = e.querySelector("[data-td-inplace-saved]");
  if (t && s && o) {
    const c = s.tagName === "SELECT" ? s.selectedOptions[0]?.textContent ?? s.value : s.value.trim();
    if (c) {
      o.textContent = c, r && (r.value = s.value);
      const l = document.querySelector("[data-td-inplace-log]");
      if (l) {
        const d = document.createElement("p"), u = (/* @__PURE__ */ new Date()).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        d.textContent = `${u} · ${e.getAttribute("data-field") ?? "Campo"} → ${c}`, l.prepend(d);
      }
      i && (i.hidden = !1, window.setTimeout(() => {
        i.hidden = !0;
      }, 1400));
    }
  }
  a && (a.hidden = !1), n && (n.hidden = !0);
}
function oa() {
  document.querySelectorAll("[data-td-select-panel]").forEach((e) => {
    e.hidden = !0;
  }), document.querySelectorAll("[data-td-select-open]").forEach((e) => {
    e.setAttribute("aria-expanded", "false");
  });
}
function Mc(e, t) {
  const a = e.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  let n = 0, s = "";
  for (const o of t) {
    if (n >= a.length)
      break;
    o === "0" ? /\d/.test(a[n]) ? s += a[n++] : n += 1 : o === "X" || o === "A" ? /[A-Z]/.test(a[n]) ? s += a[n++] : n += 1 : s += o;
  }
  return s;
}
function Lc(e) {
  const t = e.closest("td-autocomplete"), a = t?.querySelector("[data-td-ac-list]"), n = e.value.trim().toLowerCase();
  let s = 0;
  t?.querySelectorAll("[data-td-ac-pick]").forEach((o) => {
    const r = (o.dataset.label ?? o.textContent ?? "").toLowerCase(), i = n.length > 0 && r.includes(n);
    if (o.hidden = !i, o.parentElement && (o.parentElement.hidden = !i), o.classList.remove("is-active"), i) {
      s += 1;
      const c = o.dataset.label ?? o.textContent ?? "", l = c.toLowerCase().indexOf(n);
      o.innerHTML = `${jt(c.slice(0, l))}<mark>${jt(c.slice(l, l + n.length))}</mark>${jt(c.slice(l + n.length))}`;
    }
  }), a && (a.hidden = s === 0), e.setAttribute("aria-expanded", s > 0 ? "true" : "false");
}
function Us(e) {
  const t = e.closest("td-autocomplete"), a = t?.querySelector("[data-td-ac]"), n = t?.querySelector("[data-td-ac-list]");
  a && (a.value = e.dataset.label ?? e.textContent ?? "", a.setAttribute("aria-expanded", "false")), n && (n.hidden = !0);
}
function Ws(e, t) {
  const a = t.trim();
  if (!e || !a || [...e.querySelectorAll("[data-td-chip-value]")].some((r) => r.value === a))
    return;
  const s = e.getAttribute("data-name") ?? "tags", o = document.createElement("span");
  o.className = "td-chip td-chip--removable", o.innerHTML = `${jt(a)}<button type="button" class="td-chip__remove" data-td-chip-remove="${jt(a)}" aria-label="Quitar ${jt(a)}">×</button><input type="hidden" name="${jt(s)}" value="${jt(a)}" data-td-chip-value />`, e.querySelector("[data-td-chip-input]")?.before(o);
}
function jt(e) {
  return e.replace(/[&<>"']/g, (t) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[t] ?? t);
}
const Ra = /* @__PURE__ */ new WeakMap();
function kc(e) {
  e.dataset.auto !== "false" && (e.querySelectorAll(".td-ccard").length < 2 || (e.addEventListener("mouseenter", () => Oe(e, !0)), e.addEventListener("mouseleave", () => Oe(e, !1)), e.addEventListener("focusin", () => Oe(e, !0)), e.addEventListener("focusout", () => Oe(e, !1)), hn(e)));
}
function hn(e) {
  gn(e);
  const t = Number(e.closest("td-card-carousel")?.getAttribute("data-interval") ?? 5e3), a = window.setInterval(() => Da(e, 1), Number.isFinite(t) ? t : 5e3);
  Ra.set(e, a), e.dataset.paused = "false", Gs(e, !0);
}
function gn(e) {
  const t = Ra.get(e);
  t && (window.clearInterval(t), Ra.delete(e));
}
function Oe(e, t) {
  e.dataset.hold = t ? "true" : "false", t ? gn(e) : e.dataset.paused !== "true" && hn(e);
}
function _c(e) {
  if (!e) return;
  const t = e.dataset.paused === "true";
  e.dataset.paused = t ? "false" : "true", t ? hn(e) : (gn(e), Gs(e, !1));
}
function Gs(e, t) {
  const a = e.querySelector("[data-td-ccard-play]"), n = a?.querySelector(".td-btnicon__glyph");
  if (n && (n.textContent = t ? "pause" : "play_arrow"), a instanceof HTMLElement) {
    const s = t ? "Pausar" : "Reproducir";
    a.setAttribute("aria-label", s);
  }
}
function Da(e, t) {
  if (!e) return;
  const a = e.querySelectorAll(".td-ccard"), n = Number(e.dataset.index ?? 0);
  Ks(e, (n + t + a.length) % a.length);
}
function Ks(e, t) {
  if (!e) return;
  const a = e.querySelector("[data-td-ccard-track]"), n = e.querySelectorAll(".td-ccard");
  if (!a || !n.length) return;
  const s = (t % n.length + n.length) % n.length;
  e.dataset.index = String(s), a.style.transform = `translateX(-${s * 100}%)`, e.querySelectorAll("[data-td-ccard-dot]").forEach((r, i) => {
    r.classList.toggle("is-current", i === s), i === s ? r.setAttribute("aria-current", "true") : r.removeAttribute("aria-current");
  });
  const o = e.querySelector("[data-td-ccard-live]");
  o && (o.textContent = `Tarjeta ${s + 1} de ${n.length}`);
}
const Ia = /* @__PURE__ */ new WeakMap();
function Ac(e) {
  e.addEventListener("mouseenter", () => ss(e, !0)), e.addEventListener("mouseleave", () => ss(e, !1)), bn(e);
}
function bn(e) {
  $n(e);
  const t = Number(e.closest("td-carousel")?.getAttribute("data-interval") ?? 5e3), a = window.setInterval(() => Fa(e, 1), Number.isFinite(t) ? t : 5e3);
  Ia.set(e, a), e.dataset.paused = "false", e.querySelector("[data-td-carousel-play]")?.setAttribute("aria-label", "Pausar");
}
function $n(e) {
  const t = Ia.get(e);
  t && (window.clearInterval(t), Ia.delete(e));
}
function ss(e, t) {
  e.dataset.hold = t ? "true" : "false", t ? $n(e) : e.dataset.paused !== "true" && bn(e);
}
function qc(e) {
  if (!e)
    return;
  const t = e.dataset.paused === "true";
  e.dataset.paused = t ? "false" : "true", t ? bn(e) : ($n(e), e.querySelector("[data-td-carousel-play]")?.setAttribute("aria-label", "Reproducir"));
}
function Fa(e, t) {
  if (!e)
    return;
  const a = e.querySelectorAll(".td-carousel__slide"), n = Number(e.dataset.index ?? 0);
  Js(e, (n + t + a.length) % a.length);
}
function Js(e, t) {
  if (!e)
    return;
  const a = e.querySelector("[data-td-carousel-track]"), n = e.querySelectorAll(".td-carousel__slide");
  if (!a || !n.length)
    return;
  const s = (t % n.length + n.length) % n.length;
  e.dataset.index = String(s), a.style.transform = `translateX(-${s * 100}%)`, e.querySelectorAll("[data-td-carousel-dot]").forEach((o, r) => {
    o.classList.toggle("is-current", r === s), o.setAttribute("aria-current", r === s ? "true" : "false");
  });
}
const Cc = 0.85, os = 1920, Ee = /* @__PURE__ */ new WeakMap(), rs = /* @__PURE__ */ new WeakMap();
function Tc(e) {
  if (!(e instanceof HTMLInputElement) || !e.matches("[data-td-photo-pick]"))
    return;
  const t = e.closest("td-photo"), a = e.files?.[0] ?? null;
  if (e.value = "", !(t instanceof HTMLElement) || !a)
    return;
  const n = (Ee.get(t) ?? 0) + 1;
  Ee.set(t, n), Hc(t, a, n);
}
async function Hc(e, t, a) {
  const n = e.querySelector("[data-td-photo-open]");
  n?.setAttribute("aria-busy", "true"), gt(e, "Comprimiendo la foto…", !1);
  try {
    const s = await Nc(t);
    if (Ee.get(e) !== a)
      return;
    const o = e.querySelector("[data-td-photo-file]");
    if (!o)
      return;
    const r = new DataTransfer();
    r.items.add(s), o.files = r.files, Bc(e, s), gt(e, `Foto lista, ${jc(s.size)}. Toca la imagen para verla en grande.`, !1);
  } catch {
    if (Ee.get(e) !== a)
      return;
    gt(e, "No se pudo comprimir esta imagen. Elige un archivo JPG, PNG o WEBP.", !0);
  } finally {
    Ee.get(e) === a && n?.removeAttribute("aria-busy");
  }
}
async function Nc(e) {
  if (e.type && !e.type.startsWith("image/"))
    throw new Error("tipo");
  const t = await createImageBitmap(e);
  try {
    const a = e.name.replace(/\.[^.]+$/, "") || "foto";
    return await Qs(t, a);
  } finally {
    t.close();
  }
}
async function Qs(e, t) {
  const a = Math.max(e.width, e.height), n = a > os ? os / a : 1, s = Math.max(1, Math.round(e.width * n)), o = Math.max(1, Math.round(e.height * n));
  let r = e;
  if (n < 1)
    try {
      r = await createImageBitmap(e, { resizeWidth: s, resizeHeight: o, resizeQuality: "high" });
    } catch {
      r = e;
    }
  try {
    const i = document.createElement("canvas");
    i.width = s, i.height = o;
    const c = i.getContext("2d", { alpha: !1 });
    if (!c)
      throw new Error("canvas");
    c.imageSmoothingEnabled = !0, c.imageSmoothingQuality = "high", c.fillStyle = "#ffffff", c.fillRect(0, 0, s, o), c.drawImage(r, 0, 0, s, o);
    const l = await Pc(i, Cc);
    return new File([l], `${t}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } finally {
    r !== e && r.close();
  }
}
function Pc(e, t) {
  return new Promise((a, n) => {
    e.toBlob((s) => {
      s ? a(s) : n(new Error("blob"));
    }, "image/jpeg", t);
  });
}
function Bc(e, t) {
  const a = e.querySelector("[data-td-photo-preview]"), n = e.querySelector("[data-td-photo-large]"), s = e.querySelector("[data-td-photo-preview-open]");
  if (!a || !n || !s)
    return;
  const o = rs.get(e);
  o && URL.revokeObjectURL(o);
  const r = URL.createObjectURL(t);
  rs.set(e, r), a.src = r, n.src = r, s.hidden = !1;
  const i = e.querySelector("[data-td-image-canvas]");
  i?.style.setProperty("--z", "1"), i?.style.setProperty("--r", "0deg");
}
function gt(e, t, a) {
  const n = e.querySelector("[data-td-photo-status]");
  n && (n.textContent = t, n.classList.toggle("is-bad", a));
}
function jc(e) {
  return e < 1024 * 1024 ? `${Math.max(1, Math.round(e / 1024))} KB` : `${(e / (1024 * 1024)).toFixed(1)} MB`;
}
const It = /* @__PURE__ */ new WeakMap(), Oa = /* @__PURE__ */ new WeakMap();
let Rc = 0;
async function Dc(e) {
  const t = e.querySelector("[data-td-photos-cam]"), a = e.querySelector("[data-td-photos-video]");
  if (!(!t || !a)) {
    if (t.dataset.bound || (t.dataset.bound = "true", t.addEventListener("close", () => is(e))), !navigator.mediaDevices?.getUserMedia) {
      gt(e, "Este navegador no abre la cámara. Usa uno que permita fotos en el sitio.", !0);
      return;
    }
    try {
      const n = await navigator.mediaDevices.getUserMedia({
        audio: !1,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      Oa.set(e, n), a.srcObject = n, await a.play(), t.showModal(), gt(e, "La cámara sigue abierta. Toca Tomar foto las veces que necesites.", !1);
    } catch {
      is(e), gt(e, "No se pudo abrir la cámara. Permite el acceso en este sitio y vuelve a tocar el botón.", !0);
    }
  }
}
function is(e) {
  Oa.get(e)?.getTracks().forEach((o) => o.stop()), Oa.delete(e);
  const a = e.querySelector("[data-td-photos-video]");
  a && (a.srcObject = null);
  const n = It.get(e) ?? [];
  n.filter((o) => o.file).length > 0 && gt(e, ra(n), !1);
}
async function Ic(e) {
  const t = e.querySelector("[data-td-photos-video]");
  if (!t || t.readyState < 2) {
    gt(e, "Esperando la imagen de la cámara.", !1);
    return;
  }
  const a = await createImageBitmap(t), n = ++Rc, s = It.get(e) ?? [];
  s.push({ id: n, file: null, url: "" }), It.set(e, s), Je(e), gt(e, ra(s), !1);
  try {
    const o = await Qs(a, `foto-${n}`), r = It.get(e) ?? [], i = r.find((c) => c.id === n);
    if (!i)
      return;
    i.file = o, i.url = URL.createObjectURL(o), Zs(e), Je(e), gt(e, ra(r), !1);
  } catch {
    const o = It.get(e) ?? [], r = o.findIndex((i) => i.id === n);
    r >= 0 && o.splice(r, 1), Je(e), gt(e, "Esa foto no se pudo guardar. Toma otra.", !0);
  } finally {
    a.close();
  }
}
function Fc(e, t) {
  const a = It.get(e) ?? [], n = a.findIndex((s) => s.id === t);
  n < 0 || (a[n].url && URL.revokeObjectURL(a[n].url), a.splice(n, 1), Zs(e), Je(e), gt(e, a.length ? ra(a) : "No quedan fotos. La cámara puede seguir abierta.", !1));
}
function Zs(e) {
  const t = e.querySelector("[data-td-photos-file]");
  if (!t)
    return;
  const a = new DataTransfer();
  for (const n of It.get(e) ?? [])
    n.file && a.items.add(n.file);
  t.files = a.files;
}
function Je(e) {
  const t = It.get(e) ?? [];
  e.querySelectorAll("[data-td-photos-strip]").forEach((a) => {
    a.replaceChildren(...t.map((n, s) => Oc(n, s)));
  });
}
function Oc(e, t) {
  const a = document.createElement("li");
  a.className = "td-photos__shot";
  const n = t + 1;
  if (e.url) {
    const o = document.createElement("img");
    o.src = e.url, o.alt = `Foto ${n}`, a.append(o);
  } else {
    const o = document.createElement("span");
    o.className = "td-photos__pending", o.textContent = "Guardando…", a.append(o);
  }
  const s = document.createElement("button");
  return s.type = "button", s.dataset.tdPhotosRemove = String(e.id), s.setAttribute("aria-label", `Quitar foto ${n}`), s.textContent = "Quitar", a.append(s), a;
}
function ra(e) {
  const t = e.filter((o) => o.file).length, a = e.length - t, n = t === 1 ? "foto lista" : "fotos listas", s = a > 0 ? ` ${a === 1 ? "Una se está guardando." : `${a} se están guardando.`}` : "";
  return `${t} ${n} para enviar.${s} Quita las que no quieras. La cámara no se cierra al tomar.`;
}
function zc(e) {
  const t = e.closest("[data-td-qty-key]");
  if (t instanceof HTMLButtonElement) {
    const s = t.closest("[data-td-qty]");
    if (s instanceof HTMLElement)
      return Vc(s, t.dataset.tdQtyKey || ""), !0;
  }
  const a = e.closest("[data-td-sheet-close]");
  if (a instanceof HTMLButtonElement) {
    const s = a.closest("[data-td-sheet]");
    if (s instanceof HTMLElement)
      return s.hidden = !0, !0;
  }
  const n = e.closest("[data-td-pick]");
  if (n instanceof HTMLButtonElement) {
    const s = n.closest("[data-td-pick-line]");
    if (s instanceof HTMLElement)
      return Uc(s, Number(n.dataset.tdPick) || 0), !0;
  }
  return !1;
}
function Vc(e, t) {
  const a = e.querySelector("[data-td-qty-value]"), n = e.querySelector("[data-td-qty-read]"), s = e.querySelector("[data-td-qty-hint]");
  if (!(a instanceof HTMLInputElement) || !(n instanceof HTMLElement))
    return;
  const o = Number(e.dataset.min ?? "0"), r = Number(e.dataset.max ?? "9999"), i = e.dataset.unit || "unidades";
  let c = Number(a.value) || 0;
  if (t === "back")
    c = Math.floor(c / 10);
  else if (t === "minus")
    c -= 1;
  else if (t === "plus")
    c += 1;
  else if (/^\d$/.test(t)) {
    const l = c === 0 ? Number(t) : +`${c}${t}`;
    c = Number.isFinite(l) ? l : c;
  }
  c < o && (c = o), c > r && (c = r), a.value = String(c), n.textContent = String(c), s instanceof HTMLElement && (s.textContent = c >= r ? `Llegaste al máximo de esta ubicación: ${r} ${i}.` : `Entre ${o} y ${r} ${i}.`);
}
function Uc(e, t) {
  const a = e.querySelector("[data-td-pick-value]"), n = e.querySelector("[data-td-pick-read]"), s = e.querySelector("[data-td-pick-status]");
  if (!(a instanceof HTMLInputElement) || !(n instanceof HTMLElement))
    return;
  const o = Number(e.dataset.total ?? "0"), r = e.dataset.unit || "unidades", i = Math.min(o, Math.max(0, (Number(a.value) || 0) + t));
  if (a.value = String(i), n.textContent = String(i), s instanceof HTMLElement) {
    const c = o - i;
    s.textContent = c === 0 ? "Línea completa. Puedes confirmar el retiro." : `Faltan ${c} ${r}.`;
  }
  e.querySelectorAll("[data-td-pick]").forEach((c) => {
    const l = Number(c.dataset.tdPick) || 0;
    c.disabled = l > 0 && i >= o || l < 0 && i <= 0;
  });
}
function Wc(e) {
  const t = e.closest("button[data-td-count]");
  if (t instanceof HTMLButtonElement) {
    const n = t.closest("article[data-td-count]");
    if (n instanceof HTMLElement)
      return Gc(n, Number(t.dataset.tdCount) || 0), !0;
  }
  const a = e.closest("button[data-td-replen]");
  if (a instanceof HTMLButtonElement) {
    const n = a.closest("article[data-td-replen]");
    if (n instanceof HTMLElement)
      return Kc(n, Number(a.dataset.tdReplen) || 0), !0;
  }
  return !1;
}
function Gc(e, t) {
  const a = e.querySelector("[data-td-count-value]"), n = e.querySelector("[data-td-count-read]"), s = e.querySelector("[data-td-count-status]");
  if (!(a instanceof HTMLInputElement) || !(n instanceof HTMLElement))
    return;
  const o = Number(e.dataset.expected ?? "0"), r = e.dataset.unit || "unidades", i = Math.max(0, (Number(a.value) || 0) + t);
  a.value = String(i), n.textContent = String(i);
  const c = i - o;
  s instanceof HTMLElement && (s.classList.remove("is-ok", "is-warn", "is-bad", "is-neutral"), c === 0 ? (s.classList.add("is-ok"), s.textContent = "El conteo coincide con el sistema.") : c < 0 ? (s.classList.add("is-bad"), s.textContent = `Faltan ${-c} ${r}. Vuelve a contar o deja la incidencia.`) : (s.classList.add("is-warn"), s.textContent = `Sobran ${c} ${r}. Revisa antes de cerrar el conteo.`)), e.querySelectorAll("button[data-td-count]").forEach((l) => {
    if (!(l instanceof HTMLButtonElement)) return;
    (Number(l.dataset.tdCount) || 0) < 0 && (l.disabled = i <= 0);
  });
}
function Kc(e, t) {
  const a = e.querySelector("[data-td-replen-value]"), n = e.querySelector("[data-td-replen-read]"), s = e.querySelector("[data-td-replen-status]");
  if (!(a instanceof HTMLInputElement) || !(n instanceof HTMLElement))
    return;
  const o = Number(e.dataset.needed ?? "0"), r = e.dataset.unit || "unidades", i = Math.min(o, Math.max(0, (Number(a.value) || 0) + t));
  if (a.value = String(i), n.textContent = String(i), s instanceof HTMLElement) {
    const c = o - i;
    s.textContent = c === 0 ? "Reposición completa. Puedes confirmar el movimiento." : `Faltan ${c} ${r} por llevar a la ubicación de picking.`;
  }
  e.querySelectorAll("button[data-td-replen]").forEach((c) => {
    if (!(c instanceof HTMLButtonElement)) return;
    const l = Number(c.dataset.tdReplen) || 0;
    c.disabled = l > 0 && i >= o || l < 0 && i <= 0;
  });
}
function Jc(e) {
  const t = e.closest("button[data-td-receipt]");
  if (t instanceof HTMLButtonElement) {
    const i = t.closest("article[data-td-receipt]");
    if (i instanceof HTMLElement)
      return cs(i, Number(t.dataset.tdReceipt) || 0, Xs(i)), !0;
  }
  const a = e.closest("button[data-td-asn]");
  if (a instanceof HTMLButtonElement) {
    const i = a.closest("article[data-td-asn]");
    if (i instanceof HTMLElement)
      return cs(i, Number(a.dataset.tdAsn) || 0, {
        expectedKey: "expected",
        value: "data-td-asn-value",
        read: "data-td-asn-read",
        status: "data-td-asn-status",
        button: "button[data-td-asn]",
        step: "tdAsn",
        unit: "bultos",
        zero: "El camión trae los bultos del aviso. Puedes abrir la descarga.",
        under: (c) => `Faltan ${c} bultos. No cierres la entrada hasta contar de nuevo.`,
        over: (c) => `Hay ${c} bultos de más. Sepáralos antes de recibir.`,
        cap: !1
      }), !0;
  }
  const n = e.closest("[data-td-receipt-open]");
  if (n instanceof HTMLElement) {
    const i = n.closest("article[data-td-receipt]");
    if (i instanceof HTMLElement)
      return Zc(i), !0;
  }
  const s = e.closest("[data-td-receipt-apply]");
  if (s instanceof HTMLElement) {
    const i = s.closest("article[data-td-receipt]");
    if (i instanceof HTMLElement)
      return Ys(i), !0;
  }
  const o = e.closest("[data-td-receipt-close]");
  if (o instanceof HTMLElement)
    return o.closest("article[data-td-receipt]")?.querySelector("dialog")?.close(), !0;
  const r = e.closest("button[data-td-inspect-mark]");
  if (r instanceof HTMLButtonElement) {
    const i = r.closest("[data-td-inspect-row]"), c = r.closest("article[data-td-inspect]");
    if (i instanceof HTMLElement && c instanceof HTMLElement)
      return Xc(c, i, r.dataset.tdInspectMark || "Pendiente"), !0;
  }
  return !1;
}
function Qc(e) {
  if (e.key !== "Enter") return;
  const t = e.target;
  if (!(t instanceof HTMLInputElement) || !t.matches("[data-td-receipt-typed]")) return;
  const a = t.closest("article[data-td-receipt]");
  a instanceof HTMLElement && (e.preventDefault(), Ys(a));
}
function Xs(e) {
  return {
    expectedKey: "ordered",
    value: "data-td-receipt-value",
    read: "data-td-receipt-read",
    status: "data-td-receipt-status",
    button: "button[data-td-receipt]",
    step: "tdReceipt",
    unit: e.dataset.unit || "unidades",
    zero: "La línea coincide con la orden.",
    under: (t, a) => `Faltan ${t} ${a} por recibir.`,
    over: (t, a) => `Sobran ${t} ${a}. Anótalo antes de cerrar la línea.`,
    cap: !1
  };
}
function Zc(e) {
  const t = e.querySelector("[data-td-receipt-dlg]"), a = e.querySelector("[data-td-receipt-typed]"), n = e.querySelector("[data-td-receipt-value]"), s = e.querySelector("[data-td-receipt-error]");
  !(t instanceof HTMLDialogElement) || !(a instanceof HTMLInputElement) || (n instanceof HTMLInputElement && (a.value = n.value), s instanceof HTMLElement && (s.hidden = !0), t.open || t.showModal(), a.focus(), a.select());
}
function Ys(e) {
  const t = e.querySelector("[data-td-receipt-typed]"), a = e.querySelector("[data-td-receipt-error]"), n = e.querySelector("[data-td-receipt-dlg]");
  if (t instanceof HTMLInputElement) {
    if (!/^\d+$/.test(t.value.trim())) {
      a instanceof HTMLElement && (a.hidden = !1), t.focus();
      return;
    }
    to(e, Number(t.value.trim()), Xs(e)), a instanceof HTMLElement && (a.hidden = !0), n instanceof HTMLDialogElement && n.close();
  }
}
function cs(e, t, a) {
  const n = e.querySelector(`[${a.value}]`), s = e.querySelector(`[${a.read}]`);
  if (e.querySelector(`[${a.status}]`), !(n instanceof HTMLInputElement) || !(s instanceof HTMLElement))
    return;
  const o = Number(e.dataset[a.expectedKey] ?? "0"), r = Math.max(0, (Number(n.value) || 0) + t), i = a.cap ? Math.min(o, r) : r;
  to(e, i, a);
}
function to(e, t, a) {
  const n = e.querySelector(`[${a.value}]`), s = e.querySelector(`[${a.read}]`), o = e.querySelector(`[${a.status}]`);
  if (!(n instanceof HTMLInputElement) || !(s instanceof HTMLElement)) return;
  const r = Number(e.dataset[a.expectedKey] ?? "0");
  n.value = String(t), s.textContent = String(t);
  const i = t - r;
  o instanceof HTMLElement && (o.classList.remove("is-ok", "is-warn", "is-bad", "is-neutral"), i === 0 ? (o.classList.add("is-ok"), o.textContent = a.zero) : i < 0 ? (o.classList.add("is-warn"), o.textContent = a.under(-i, a.unit)) : (o.classList.add("is-warn"), o.textContent = a.over(i, a.unit))), e.querySelectorAll(a.button).forEach((c) => {
    if (!(c instanceof HTMLButtonElement)) return;
    (Number(c.dataset[a.step]) || 0) < 0 && (c.disabled = t <= 0);
  });
}
function Xc(e, t, a) {
  const n = t.querySelector("[data-td-inspect-result]"), s = t.querySelector("[data-td-inspect-value]");
  n instanceof HTMLElement && (n.classList.remove("is-ok", "is-warn", "is-bad", "is-neutral"), n.classList.add(a === "Cumple" ? "is-ok" : a === "No cumple" ? "is-bad" : "is-warn"), n.textContent = a), s instanceof HTMLInputElement && (s.value = a), t.querySelectorAll("button[data-td-inspect-mark]").forEach((d) => {
    d instanceof HTMLButtonElement && d.setAttribute("aria-pressed", d.dataset.tdInspectMark === a ? "true" : "false");
  });
  const r = [...e.querySelectorAll("[data-td-inspect-row]")].map((d) => d.querySelector("[data-td-inspect-result]")?.textContent?.trim() ?? "Pendiente"), i = r.filter((d) => d === "Cumple").length, c = e.querySelector("[data-td-inspect-pass]");
  c instanceof HTMLElement && (c.textContent = String(i));
  const l = e.querySelector("[data-td-inspect-summary]");
  l instanceof HTMLElement && (l.classList.remove("is-ok", "is-warn", "is-bad"), r.some((d) => d === "No cumple") ? (l.classList.add("is-bad"), l.textContent = "Hay criterios que no cumplen. No aceptes el producto.") : r.some((d) => d !== "Cumple") ? (l.classList.add("is-warn"), l.textContent = "Faltan criterios por revisar.") : (l.classList.add("is-ok"), l.textContent = "La revisión está completa. Puedes decidir el ingreso."));
}
let ge = null;
function Yc(e = document) {
  e.querySelectorAll("td-editform").forEach((t) => {
    t.removeAttribute("data-pending"), t.removeAttribute("aria-busy");
    const a = t.querySelector("form");
    if (!(a instanceof HTMLFormElement))
      return;
    const n = xn(a, !1);
    n.length > 0 ? yn(t, n) : t.querySelector("[data-td-editform-status]")?.dataset.tone === "pending" && fa(t), t.dataset.autofocus === "true" && t.dataset.focused !== "true" && (t.dataset.focused = "true", sl(a));
  });
}
function tl(e) {
  const t = e.closest("td-editform");
  return t instanceof HTMLElement && t.dataset.guard !== "false" && t.hasAttribute("data-pending");
}
function yn(e, t) {
  if (e.dataset.summary === "false")
    return;
  const a = e.querySelector("[data-td-editform-status]"), n = e.querySelector("[data-td-editform-status-title]"), s = e.querySelector("[data-td-editform-status-detail]"), o = e.querySelector("[data-td-editform-errors]");
  if (!(!a || !n || !s || !o)) {
    n.textContent = e.dataset.invalidTitle || "No se pudo guardar", s.textContent = e.dataset.invalidDetail || "Revisa los campos marcados. Lo escrito sigue en el formulario.", o.replaceChildren();
    for (const r of t) {
      const i = document.createElement("li"), c = document.createElement("button");
      c.type = "button", c.dataset.tdEditformJump = r.key;
      const l = document.createElement("span");
      l.className = "td-editform__error-label", l.textContent = r.label;
      const d = document.createElement("span");
      d.className = "td-editform__error-msg", d.textContent = r.message, c.append(l, d), i.append(c), o.append(i);
    }
    a.dataset.tone = "invalid", a.setAttribute("role", "alert"), a.hidden = !1;
  }
}
function fa(e) {
  const t = e.querySelector("[data-td-editform-status]"), a = e.querySelector("[data-td-editform-errors]");
  t && (t.hidden = !0, a?.replaceChildren());
}
function el(e) {
  if (e.dataset.guard === "false")
    return;
  e.setAttribute("data-pending", ""), e.setAttribute("aria-busy", "true");
  const t = e.querySelector("[data-td-editform-status]"), a = e.querySelector("[data-td-editform-status-title]"), n = e.querySelector("[data-td-editform-status-detail]"), s = e.querySelector("[data-td-editform-errors]");
  !t || !a || !n || (a.textContent = e.dataset.pendingText || "Guardando. Espera un momento.", n.textContent = "Los datos siguen en el formulario.", s?.replaceChildren(), t.dataset.tone = "pending", t.setAttribute("role", "status"), t.hidden = !1);
}
function vn(e) {
  const t = e.control.closest("td-textbox");
  t instanceof Zt ? t.focusInput() : e.control.focus();
}
function xn(e, t) {
  const a = /* @__PURE__ */ new Map();
  return e.querySelectorAll("td-textbox").forEach((n) => {
    if (!(n instanceof Zt))
      return;
    const s = n.querySelector("input, textarea");
    if (!(s instanceof HTMLElement) || Qe(s))
      return;
    const o = rl(n);
    (s.getAttribute("aria-invalid") === "true" || o) && a.set(s, {
      key: Ea(s),
      label: wa(n, s),
      message: o || "Revisa este campo.",
      control: s
    });
  }), t && e.querySelectorAll("input, select, textarea").forEach((n) => {
    if (!(n instanceof HTMLElement) || a.has(n) || Qe(n) || n.closest("td-textbox"))
      return;
    const s = n instanceof HTMLInputElement || n instanceof HTMLSelectElement || n instanceof HTMLTextAreaElement ? n : null, o = s ? ol(s) : null;
    o && a.set(n, {
      key: Ea(n),
      label: wa(n.closest(".td-field") ?? n, n),
      message: o,
      control: n
    });
  }), e.querySelectorAll(".validation-message").forEach((n) => {
    if (Qe(n) || !n.textContent?.trim())
      return;
    const s = il(e, n);
    !s || a.has(s) || a.set(s, {
      key: Ea(s),
      label: wa(s.closest(".td-field, td-textbox") ?? s, s),
      message: n.textContent.trim(),
      control: s
    });
  }), [...a.values()];
}
function eo(e) {
  if (!(e instanceof Element))
    return;
  const t = e.closest("td-editform");
  if (!(t instanceof HTMLElement) || e.closest("[data-td-editform-status], [data-td-editform-leave]"))
    return;
  t.setAttribute("data-dirty", "");
  const a = t.querySelector("[data-td-editform-status]");
  if (!a || a.hidden || a.dataset.tone !== "invalid")
    return;
  const n = t.querySelector("form");
  if (!(n instanceof HTMLFormElement))
    return;
  const s = e.closest("td-textbox");
  s instanceof Zt && s.validate();
  const o = xn(n, !0);
  if (o.length === 0) {
    fa(t);
    return;
  }
  yn(t, o);
}
function al(e) {
  const t = e.closest("td-editform");
  t instanceof HTMLElement && (t.removeAttribute("data-dirty"), t.removeAttribute("data-pending"), t.removeAttribute("aria-busy"), fa(t));
}
function nl(e) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
    return !1;
  const t = e.target;
  if (!(t instanceof Element))
    return !1;
  const a = t.closest("[data-td-editform-stay]");
  if (a)
    return ls(a), ge = null, !0;
  const n = t.closest("[data-td-editform-discard]");
  if (n) {
    const l = ge?.href;
    return ge?.host.removeAttribute("data-dirty"), ge = null, ls(n), l && location.assign(l), !0;
  }
  const s = t.closest("[data-td-editform-jump]");
  if (s) {
    const l = s.dataset.tdEditformJump, d = s.closest("td-editform")?.querySelector("form"), u = l ? d?.querySelector(`#${CSS.escape(l)}`) : null;
    return u && vn({ key: u.id, control: u }), !0;
  }
  const o = t.closest("a[href]");
  if (!(o instanceof HTMLAnchorElement) || o.target === "_blank" || o.hasAttribute("download"))
    return !1;
  const r = o.getAttribute("href") ?? "";
  if (!r || r.startsWith("#") || r.startsWith("javascript:") || r.startsWith("data:") || o.href === location.href || o.closest("[data-td-editform-leave]"))
    return !1;
  const i = document.querySelector('td-editform[data-dirty][data-confirm-leave="true"]');
  if (!i)
    return !1;
  const c = i.querySelector("dialog");
  return c instanceof HTMLDialogElement ? (ge = { host: i, href: o.href }, c.open || c.showModal(), !0) : !1;
}
function ls(e) {
  const t = e.closest("dialog");
  t instanceof HTMLDialogElement && t.close();
}
function sl(e) {
  const t = e.querySelectorAll("input, textarea, select");
  for (const a of t)
    if (!(Qe(a) || !a.required || a.value.trim().length > 0)) {
      vn({ key: a.id, control: a });
      return;
    }
}
function ol(e) {
  if (e.disabled)
    return null;
  const t = e.value.trim();
  if (e.required && t.length === 0)
    return ze(e, "data-msg-required", "Completa este campo.");
  if (e instanceof HTMLInputElement && e.type === "email" && t.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t))
    return ze(e, "data-msg-type", "Escribe un correo como nombre@empresa.com.");
  if (e instanceof HTMLInputElement && e.minLength > 0 && t.length > 0 && t.length < e.minLength)
    return ze(e, "data-msg-minlength", `Usa al menos ${e.minLength} caracteres.`);
  if (e instanceof HTMLInputElement && e.pattern && t.length > 0)
    try {
      if (!new RegExp(`^(?:${e.pattern})$`).test(e.value))
        return ze(e, "data-msg-pattern", "Usa el formato pedido.");
    } catch {
      return null;
    }
  return e.getAttribute("aria-invalid") === "true" ? "Revisa este campo." : null;
}
function ze(e, t, a) {
  const n = e.getAttribute(t);
  return n && n.trim().length > 0 ? n : a;
}
function rl(e) {
  const t = e.querySelector("[data-td-client-error]");
  if (t && !t.hidden && t.textContent?.trim())
    return t.textContent.trim();
  const a = e.querySelector("[data-td-server-error]"), n = a && !a.hidden ? a.textContent?.trim() : "";
  return n || null;
}
function il(e, t) {
  return t.id ? e.querySelector(`[aria-describedby~="${CSS.escape(t.id)}"]`) : null;
}
function wa(e, t) {
  const n = e.querySelector("label")?.textContent?.replace(/\s+/g, " ").trim();
  return n || t.getAttribute("aria-label") || "Campo";
}
function Ea(e) {
  return e.id || (e.id = `td-editform-field-${Math.random().toString(36).slice(2, 8)}`), e.id;
}
function Qe(e) {
  return e.hidden || e.closest("[hidden]") || e.closest(".td-sr") || e.classList.contains("td-sr") ? !0 : e instanceof HTMLInputElement ? e.type === "hidden" || e.type === "button" || e.type === "submit" || e.type === "reset" : !1;
}
window.addEventListener("beforeunload", (e) => {
  document.querySelector('td-editform[data-dirty][data-confirm-leave="true"]') && e.preventDefault();
});
const yt = 256, ds = 3, Ma = 18, Ve = { lat: 14.59, lng: -90.53 }, La = /* @__PURE__ */ new Map(), At = /* @__PURE__ */ new Map();
let us = !1;
function $t(e, t, a) {
  const n = Math.max(-85, Math.min(85, e)), s = Math.sin(n * Math.PI / 180), o = yt * 2 ** a;
  return {
    x: (t + 180) / 360 * o,
    y: (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * o
  };
}
function ps(e, t, a) {
  const n = yt * 2 ** a, s = e / n * 360 - 180, o = Math.PI - 2 * Math.PI * t / n, r = 180 / Math.PI * Math.atan(Math.sinh(o));
  return { lat: Math.max(-85, Math.min(85, r)), lng: s };
}
function ka(e, t) {
  const a = e >= 0 ? "N" : "S", n = t >= 0 ? "E" : "O";
  return `${Math.abs(e).toFixed(4)}° ${a}, ${Math.abs(t).toFixed(4)}° ${n}`;
}
function cl(e) {
  const t = e.querySelector("[data-td-maps-model]")?.textContent ?? "{}";
  try {
    const a = JSON.parse(t);
    return a && typeof a == "object" ? a : {};
  } catch {
    return {};
  }
}
function ll(e) {
  return e && /^https?:\/\//i.test(e) && e.includes("{z}") && e.includes("{x}") && e.includes("{y}") ? e : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
}
class dl {
  constructor(t) {
    this.model = {}, this.units = [], this.selected = "", this.hovered = "", this.pinned = !1, this.generation = 0, this.drag = null, this.host = t, this.id = t.dataset.mapId || "pilotos";
    const a = t.querySelector("[data-td-maps-model]")?.textContent ?? "{}";
    t.replaceChildren();
    const n = document.createElement("section");
    n.className = "td-maps__frame", n.innerHTML = `
            <header class="td-maps__head">
                <h2 class="td-maps__title" data-td-maps-title></h2>
                <p class="td-maps__count" data-td-maps-count></p>
            </header>
            <div class="td-maps__body">
                <div class="td-maps__stage">
                    <div class="td-maps__viewport" data-td-maps-view tabindex="0" role="application"></div>
                    <div class="td-maps__tools">
                        <button type="button" data-td-maps-zoom="1">Acercar</button>
                        <button type="button" data-td-maps-zoom="-1">Alejar</button>
                        <button type="button" data-td-maps-fit>Ver todos</button>
                    </div>
                    <p class="td-maps__attrib"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" data-td-maps-attrib>OpenStreetMap</a></p>
                    <div class="td-maps__card" data-td-maps-card hidden></div>
                </div>
                <aside class="td-maps__list" data-td-maps-list></aside>
            </div>
            <p class="td-maps__status" data-td-maps-status role="status"></p>`;
    const s = document.createElement("script");
    s.type = "application/json", s.dataset.tdMapsModel = "", s.textContent = a, t.append(n), t.append(s), this.world = document.createElement("div"), this.world.className = "td-maps__world", this.world.dataset.tdMapsWorld = "", this.tiles = document.createElement("div"), this.marks = document.createElement("div"), this.tiles.className = "td-maps__tiles", this.marks.className = "td-maps__marks", this.world.append(this.tiles, this.marks), this.viewport = n.querySelector("[data-td-maps-view]"), this.viewport.append(this.world), this.card = n.querySelector("[data-td-maps-card]"), this.list = n.querySelector("[data-td-maps-list]"), this.status = n.querySelector("[data-td-maps-status]"), this.title = n.querySelector("[data-td-maps-title]"), this.count = n.querySelector("[data-td-maps-count]"), this.fitButton = n.querySelector("[data-td-maps-fit]"), La.has(this.id) || La.set(this.id, { lat: Ve.lat, lng: Ve.lng, zoom: 12, moved: !1, trail: [], tick: 0 }), this.bind(), this.read(), At.set(this.id, this), this.ensureWatch(), this.ensureDemo(), this.ensurePlan(), this.ensureTrace(), this.memory.moved || this.fit(), this.paint();
  }
  matches(t) {
    return this.host === t;
  }
  get memory() {
    return La.get(this.id);
  }
  refresh() {
    this.read(), this.ensureWatch(), this.ensureDemo(), this.ensurePlan(), this.ensureTrace(), this.memory.moved || this.fit(), this.paint();
  }
  read() {
    this.model = cl(this.host);
    const t = Array.isArray(this.model.units) ? this.model.units : [];
    this.units = t.map((n) => ({ ...n })), this.model.follow && this.memory.fix && (this.units = [this.userUnit(this.memory.fix)]), this.title.textContent = this.model.title || (this.model.follow ? "Tu ubicación" : "Pilotos en ruta");
    const a = this.host.querySelector("[data-td-maps-attrib]");
    a && (a.textContent = this.model.attribution || "OpenStreetMap"), this.viewport.setAttribute("aria-label", `${this.title.textContent}. Mapa de OpenStreetMap. Usa las flechas para moverte y más o menos para el zoom.`), this.fitButton.textContent = this.model.plan ? "Ver toda la ruta" : this.model.follow ? "Centrar en mí" : "Ver todos";
  }
  userUnit(t) {
    return {
      id: "yo",
      name: this.model.userName || "Tú",
      lat: t.lat,
      lng: t.lng,
      kind: this.model.userRole || "Sesión actual",
      status: "En este equipo",
      detail: `Precisión aproximada de ${Math.round(t.accuracy)} metros`,
      updated: "Ahora",
      route: this.model.showRoute === !1 ? [] : this.memory.trail.slice()
    };
  }
  bind() {
    this.host.addEventListener("click", (n) => {
      const s = n.target;
      if (!(s instanceof Element))
        return;
      const o = s.closest("[data-td-maps-zoom]");
      if (o instanceof HTMLElement) {
        this.bump(Number(o.dataset.tdMapsZoom) || 0);
        return;
      }
      if (s.closest("[data-td-maps-fit]")) {
        this.memory.moved = !1, this.fit(), this.paint();
        return;
      }
      if (s.closest("[data-td-maps-retry]")) {
        if (this.model.plan) {
          this.status.textContent = "Calculando la ruta por calles…", this.ensurePlan(!0);
          return;
        }
        if (this.model.matchRoute) {
          this.status.textContent = "Reconstruyendo el recorrido por calles…", this.ensureTrace(!0);
          return;
        }
        this.status.textContent = this.model.follow ? "Buscando tu ubicación…" : "Cargando el mapa…", this.ensureWatch(!0), this.paint();
        return;
      }
      const r = s.closest("[data-td-maps-pick]");
      if (r instanceof HTMLElement && r.dataset.tdMapsPick) {
        this.selected = r.dataset.tdMapsPick, this.pinned = !0;
        const i = this.units.find((c) => c.id === this.selected) ?? this.planStops().find((c) => c.id === this.selected);
        i && (this.memory.lat = i.lat, this.memory.lng = i.lng, this.memory.moved = !0), this.paint();
      }
    }), this.viewport.addEventListener("keydown", (n) => {
      const s = yt / 4, o = $t(this.memory.lat, this.memory.lng, this.memory.zoom);
      let r = o;
      if (n.key === "ArrowLeft") r = { x: o.x - s, y: o.y };
      else if (n.key === "ArrowRight") r = { x: o.x + s, y: o.y };
      else if (n.key === "ArrowUp") r = { x: o.x, y: o.y - s };
      else if (n.key === "ArrowDown") r = { x: o.x, y: o.y + s };
      else if (n.key === "+" || n.key === "=") this.bump(1);
      else if (n.key === "-" || n.key === "_") this.bump(-1);
      else return;
      if (n.preventDefault(), r !== o) {
        const i = ps(r.x, r.y, this.memory.zoom);
        this.memory.lat = i.lat, this.memory.lng = i.lng, this.memory.moved = !0, this.paint();
      }
    }), this.viewport.addEventListener("wheel", (n) => {
      n.preventDefault(), this.bump(n.deltaY < 0 ? 1 : -1);
    }, { passive: !1 }), this.host.addEventListener("pointerover", (n) => {
      const s = n.target instanceof Element ? n.target.closest("[data-td-maps-pick]") : null;
      !(s instanceof HTMLElement) || !s.dataset.tdMapsPick || (this.hovered = s.dataset.tdMapsPick, this.drawCard(this.placed()), this.placeCard());
    }), this.host.addEventListener("pointerout", (n) => {
      const s = n.relatedTarget;
      s instanceof Node && this.host.contains(s) || (this.hovered = "", this.drawCard(this.placed()));
    }), this.viewport.addEventListener("pointerdown", (n) => {
      n.button !== 0 || !(n.target instanceof Element) || n.target.closest("button, a") || (this.drag = { x: n.clientX, y: n.clientY, lat: this.memory.lat, lng: this.memory.lng, pointer: n.pointerId }, this.viewport.setPointerCapture(n.pointerId));
    }), this.viewport.addEventListener("pointermove", (n) => {
      if (!this.drag || this.drag.pointer !== n.pointerId)
        return;
      const s = $t(this.drag.lat, this.drag.lng, this.memory.zoom), o = ps(s.x - (n.clientX - this.drag.x), s.y - (n.clientY - this.drag.y), this.memory.zoom);
      this.memory.lat = o.lat, this.memory.lng = o.lng, this.memory.moved = !0, this.applyTransform(), this.drawTiles(), this.placeCard();
    });
    const t = (n) => {
      this.drag?.pointer === n.pointerId && (this.drag = null);
    };
    this.viewport.addEventListener("pointerup", t), this.viewport.addEventListener("pointercancel", t), new ResizeObserver(() => this.paint()).observe(this.viewport);
  }
  bump(t) {
    const a = Math.max(ds, Math.min(Ma, this.memory.zoom + t));
    a !== this.memory.zoom && (this.memory.zoom = a, this.memory.moved = !0, this.paint());
  }
  fit() {
    const t = this.points();
    if (t.length === 0) {
      this.memory.lat = Ve.lat, this.memory.lng = Ve.lng, this.memory.zoom = 11;
      return;
    }
    let a = 90, n = -90, s = 180, o = -180;
    for (const l of t)
      a = Math.min(a, l.lat), n = Math.max(n, l.lat), s = Math.min(s, l.lng), o = Math.max(o, l.lng);
    const r = Math.max(this.viewport.clientWidth, 280), i = Math.max(this.viewport.clientHeight, 220);
    let c = Ma;
    for (let l = Ma; l >= ds; l -= 1) {
      const d = $t(n, s, l), u = $t(a, o, l);
      if (Math.abs(u.x - d.x) < r - 80 && Math.abs(u.y - d.y) < i - 80) {
        c = l;
        break;
      }
      c = l;
    }
    this.memory.zoom = c, this.memory.lat = (a + n) / 2, this.memory.lng = (s + o) / 2;
  }
  points() {
    const t = [];
    if (this.model.plan && !this.model.plan.incomplete) {
      for (const a of this.planStops()) t.push(a);
      for (const a of this.memory.planLine ?? []) t.push(a);
      return t;
    }
    for (const a of this.units) {
      t.push(a);
      for (const n of a.route ?? []) t.push(n);
      for (const n of a.stops ?? []) t.push(n);
    }
    for (const a of Object.values(this.memory.traceLines ?? {}))
      for (const n of a) t.push(n);
    return t;
  }
  ensureWatch(t = !1) {
    if (!this.model.follow || !("geolocation" in navigator))
      return;
    const a = this.memory;
    a.watch !== void 0 && !t || (a.watch !== void 0 && navigator.geolocation.clearWatch(a.watch), a.watch = navigator.geolocation.watchPosition(
      (n) => {
        const s = At.get(this.id);
        if (!s)
          return;
        const o = {
          lat: n.coords.latitude,
          lng: n.coords.longitude,
          accuracy: n.coords.accuracy || 0
        }, r = s.memory.trail.at(-1);
        (!r || Ze(r, o) > 12) && s.memory.trail.push({ lat: o.lat, lng: o.lng }), s.memory.fix = o, s.model.follow && !s.memory.moved && (s.memory.lat = o.lat, s.memory.lng = o.lng, s.memory.zoom = Math.max(s.memory.zoom, 15)), s.read(), s.paint();
      },
      () => {
        const n = At.get(this.id);
        n && (n.status.textContent = "No pudimos usar la ubicación de este equipo. Permite el acceso en el navegador y vuelve a intentar.", n.paintRetry());
      },
      { enableHighAccuracy: !0, maximumAge: 5e3, timeout: 12e3 }
    ));
  }
  ensureDemo() {
    const t = this.memory, a = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!this.model.demo || a || this.model.follow) {
      t.timer !== void 0 && (window.clearInterval(t.timer), t.timer = void 0);
      return;
    }
    t.timer === void 0 && (t.timer = window.setInterval(() => {
      const n = At.get(this.id);
      !n || !n.model.demo || (n.memory.tick += 1, n.paintMarks());
    }, 4e3));
  }
  placed() {
    return this.model.demo ? this.units.map((t, a) => {
      const n = t.route ?? [];
      if (a !== 0 || n.length < 2)
        return t;
      const s = this.memory.tick % n.length, o = n[s];
      return { ...t, lat: o.lat, lng: o.lng, updated: s === n.length - 1 ? t.updated : "Posición en movimiento" };
    }) : this.units;
  }
  planStops() {
    const t = this.model.plan;
    if (!t?.from || !t.to)
      return [];
    const a = Array.isArray(t.deliveries) ? t.deliveries : [];
    return [
      { id: "from", role: "Salida", ...t.from },
      ...a.map((n, s) => ({ id: `d${s}`, role: `Entrega ${s + 1}`, ...n })),
      { id: "to", role: "Llegada", ...t.to }
    ];
  }
  ensurePlan(t = !1) {
    const a = this.model.plan;
    if (!a)
      return;
    const n = this.memory;
    if (a.incomplete || !a.from || !a.to) {
      n.planLoading = !1, n.planError = "Falta el punto de llegada. Indica dónde termina la ruta.";
      return;
    }
    const s = this.planStops(), o = a.profile === "walking" || a.profile === "cycling" ? a.profile : "driving", r = /^https?:\/\//i.test(a.router || "") ? a.router.replace(/\/$/, "") : "https://router.project-osrm.org", i = `${o}|${r}|${s.map((u) => `${u.lng.toFixed(5)},${u.lat.toFixed(5)}`).join(";")}`;
    if (!t && n.planKey === i && (n.planLine || n.planLoading || n.planError))
      return;
    n.planAbort?.abort();
    const c = new AbortController();
    n.planAbort = c, n.planKey = i, n.planLoading = !0, n.planError = void 0, n.planLine = void 0, n.planLegs = void 0;
    const l = s.map((u) => `${u.lng},${u.lat}`).join(";"), d = `${r}/route/v1/${o}/${l}?overview=full&geometries=geojson&steps=false`;
    fetch(d, { signal: c.signal }).then((u) => u.json()).then((u) => {
      const p = At.get(this.id);
      if (!p || p.memory.planKey !== i)
        return;
      p.memory.planLoading = !1;
      const m = u.code === "Ok" ? u.routes?.[0] : void 0, h = m?.geometry?.coordinates?.map(([g, f]) => ({ lat: f, lng: g })) ?? [];
      if (h.length < 2) {
        p.memory.planError = "No hay un camino por calles entre la salida, las entregas y la llegada.", p.paint();
        return;
      }
      p.memory.planLine = h, p.memory.planLegs = m?.legs ?? [], p.memory.planError = void 0, p.memory.moved || p.fit(), p.paint();
    }).catch((u) => {
      if (u instanceof DOMException && u.name === "AbortError")
        return;
      const p = At.get(this.id);
      !p || p.memory.planKey !== i || (p.memory.planLoading = !1, p.memory.planError = "No se pudo calcular la ruta por calles. Revisa la conexión y vuelve a intentar.", p.paint());
    });
  }
  ensureTrace(t = !1) {
    if (this.model.matchRoute !== !0 || this.model.plan || this.model.follow)
      return;
    const a = this.units.map((c) => ({ id: c.id, points: pl(c.route ?? []) })).filter((c) => c.points.length >= 2), n = this.memory;
    if (a.length === 0) {
      n.traceLoading = !1, n.traceError = void 0, n.traceLines = void 0, n.traceStats = void 0;
      return;
    }
    const s = this.model.profile === "walking" || this.model.profile === "cycling" ? this.model.profile : "driving", o = /^https?:\/\//i.test(this.model.router || "") ? this.model.router.replace(/\/$/, "") : "https://router.project-osrm.org", r = `${s}|${o}|${a.map((c) => `${c.id}:${c.points.map((l) => `${l.lng.toFixed(5)},${l.lat.toFixed(5)}`).join(";")}`).join("|")}`;
    if (!t && n.traceKey === r && (n.traceLines || n.traceLoading || n.traceError))
      return;
    n.traceAbort?.abort();
    const i = new AbortController();
    n.traceAbort = i, n.traceKey = r, n.traceLoading = !0, n.traceError = void 0, Promise.all(a.map((c) => fl(c.points, s, o, i.signal))).then((c) => {
      const l = At.get(this.id);
      if (!l || l.memory.traceKey !== r)
        return;
      l.memory.traceLoading = !1;
      const d = {}, u = {};
      let p = 0;
      c.forEach((m, h) => {
        if (!m) {
          p += 1;
          return;
        }
        d[a[h].id] = m.line, u[a[h].id] = { distance: m.distance, duration: m.duration };
      }), l.memory.traceLines = d, l.memory.traceStats = u, l.memory.traceError = p === 0 ? void 0 : p === a.length ? "No se pudo reconstruir el recorrido por calles. Se muestra la línea entre las coordenadas." : "Parte del recorrido no tiene camino por calles. El resto sigue las calles.", l.memory.moved || l.fit(), l.paint();
    }).catch((c) => {
      if (c instanceof DOMException && c.name === "AbortError")
        return;
      const l = At.get(this.id);
      !l || l.memory.traceKey !== r || (l.memory.traceLoading = !1, l.memory.traceError = "No se pudo reconstruir el recorrido por calles. Revisa la conexión y vuelve a intentar.", l.paint());
    });
  }
  lineFor(t) {
    const a = this.memory.traceLines?.[t.id];
    if (a && a.length > 1) {
      const n = { lat: t.lat, lng: t.lng }, s = (t.route ?? []).some((r) => Ze(r, n) < 40), o = a[a.length - 1];
      return !s && Ze(o, n) > 40 ? [...a, n] : a;
    }
    return [...t.route ?? [], { lat: t.lat, lng: t.lng }];
  }
  paintPlan() {
    const t = this.planStops(), a = this.memory.zoom, n = this.memory.planLine ?? [];
    if (this.marks.replaceChildren(), n.length > 1) {
      const s = n[n.length - 1];
      this.drawRoutes([{ id: "plan", name: "", lat: s.lat, lng: s.lng, route: n }], a);
    }
    t.forEach((s, o) => {
      const r = $t(s.lat, s.lng, a), i = document.createElement("button");
      i.type = "button", i.className = s.id === "from" || s.id === "to" ? "td-maps__pin" : "td-maps__stop", s.id === this.openId() && i.classList.add("is-on"), i.dataset.tdMapsPick = s.id, i.style.transform = `translate(${r.x}px, ${r.y}px) translate(-50%, -50%)`, i.textContent = s.id === "from" ? "A" : s.id === "to" ? "B" : String(o), i.setAttribute("aria-label", `${s.role}, ${s.name}`), this.marks.append(i);
    }), this.drawPlanList(t), this.drawPlanCard(t), this.placeCard(), this.drawPlanStatus(t);
  }
  drawPlanList(t) {
    this.list.replaceChildren();
    const a = document.createElement("p");
    a.className = "td-maps__legend", a.textContent = "El orden es salida, entregas y llegada. La línea sigue las calles.", this.list.append(a);
    const n = this.memory.planLegs ?? [];
    t.forEach((s, o) => {
      const r = document.createElement("button");
      r.type = "button", r.className = "td-maps__person", r.dataset.tdMapsPick = s.id, s.id === this.openId() && r.classList.add("is-on");
      const i = document.createElement("strong");
      i.textContent = `${s.role}. ${s.name}`, r.append(i);
      const c = document.createElement("span"), l = o > 0 ? n[o - 1] : void 0;
      c.textContent = l ? `${Gt(l.distance)} · ${ee(l.duration)} desde la parada anterior` : s.note || "Punto de salida", r.append(c), this.list.append(r);
    });
  }
  drawPlanCard(t) {
    const a = t.find((c) => c.id === this.openId());
    if (!a) {
      this.card.hidden = !0, this.card.replaceChildren();
      return;
    }
    this.card.hidden = !1, this.card.replaceChildren();
    const n = document.createElement("h3");
    n.textContent = a.name;
    const s = document.createElement("p");
    if (s.textContent = a.role, this.card.append(n, s), a.note) {
      const c = document.createElement("p");
      c.textContent = a.note, this.card.append(c);
    }
    const o = t.findIndex((c) => c.id === a.id), r = o > 0 ? this.memory.planLegs?.[o - 1] : void 0;
    if (r) {
      const c = document.createElement("p");
      c.textContent = `${Gt(r.distance)} · ${ee(r.duration)} desde la parada anterior`, this.card.append(c);
    }
    const i = document.createElement("p");
    i.textContent = ka(a.lat, a.lng), this.card.append(i);
  }
  drawPlanStatus(t) {
    const a = Math.max(0, t.length - 2);
    if (this.count.textContent = a === 1 ? "1 entrega" : `${a} entregas`, this.memory.planError) {
      this.status.textContent = this.memory.planError, this.paintRetry();
      return;
    }
    if (this.memory.planLoading || !this.memory.planLine) {
      this.status.textContent = "Calculando la ruta por calles…";
      return;
    }
    const n = this.memory.planLegs ?? [], s = n.reduce((r, i) => r + i.distance, 0), o = n.reduce((r, i) => r + i.duration, 0);
    this.count.textContent = `${Gt(s)} · ${ee(o)}`, this.status.textContent = a === 0 ? "Ruta directa de la salida a la llegada." : `La ruta pasa por ${a === 1 ? "1 entrega" : `${a} entregas`} antes de llegar.`;
  }
  paint() {
    this.applyTransform(), this.drawTiles(), this.paintMarks();
  }
  paintMarks() {
    if (this.model.plan) {
      this.paintPlan();
      return;
    }
    const t = this.placed(), a = this.memory.zoom;
    this.marks.replaceChildren(), this.model.showRoute !== !1 && this.drawRoutes(t, a), this.model.follow && this.memory.fix && this.memory.fix.accuracy > 0 && this.drawAccuracy(this.memory.fix, a), this.drawStops(t, a), this.drawUnits(t, a), this.drawList(t), this.drawCard(t), this.placeCard(), this.drawStatus(t);
  }
  applyTransform() {
    const t = this.memory.zoom, a = $t(this.memory.lat, this.memory.lng, t), n = this.viewport.clientWidth || 640, s = this.viewport.clientHeight || 360, o = a.x - n / 2, r = a.y - s / 2;
    this.world.style.transform = `translate(${-o}px, ${-r}px)`;
  }
  viewBox() {
    const t = this.memory.zoom, a = $t(this.memory.lat, this.memory.lng, t), n = this.viewport.clientWidth || 640, s = this.viewport.clientHeight || 360;
    return { zoom: t, left: a.x - n / 2, top: a.y - s / 2, width: n, height: s };
  }
  drawTiles() {
    const t = this.viewBox(), a = ll(this.model.tileUrl), n = Math.floor(t.left / yt) - 1, s = Math.floor((t.left + t.width) / yt) + 1, o = Math.floor(t.top / yt) - 1, r = Math.floor((t.top + t.height) / yt) + 1, i = 2 ** t.zoom, c = /* @__PURE__ */ new Set(), l = ++this.generation;
    let d = 0, u = 0;
    for (let p = n; p <= s; p += 1)
      for (let m = o; m <= r; m += 1) {
        if (m < 0 || m >= i || u > 48)
          continue;
        u += 1;
        const h = (p % i + i) % i, g = `${t.zoom}/${h}/${m}`;
        if (c.add(g), this.tiles.querySelector(`[data-key="${g}"]`))
          continue;
        const f = document.createElement("img");
        f.className = "td-maps__tile", f.dataset.key = g, f.alt = "", f.width = yt, f.height = yt, f.style.left = `${h * yt}px`, f.style.top = `${m * yt}px`, f.src = a.replace("{z}", String(t.zoom)).replace("{x}", String(h)).replace("{y}", String(m)), f.addEventListener("error", () => {
          l === this.generation && (d += 1, d === 4 && (this.status.textContent = "No se cargó el mapa. Revisa la conexión y vuelve a intentar.", this.paintRetry()));
        }, { once: !0 }), this.tiles.append(f);
      }
    this.tiles.querySelectorAll("[data-key]").forEach((p) => {
      c.has(p.dataset.key || "") || p.remove();
    });
  }
  drawRoutes(t, a) {
    const n = [];
    let s = 1 / 0, o = 1 / 0, r = -1 / 0, i = -1 / 0;
    for (const d of t) {
      const u = this.lineFor(d);
      if (u.length < 2)
        continue;
      const p = u.map((m) => $t(m.lat, m.lng, a));
      n.push(p);
      for (const m of p)
        s = Math.min(s, m.x), o = Math.min(o, m.y), r = Math.max(r, m.x), i = Math.max(i, m.y);
    }
    if (n.length === 0)
      return;
    const c = 8;
    s -= c, o -= c, r += c, i += c;
    const l = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    l.setAttribute("class", "td-maps__routes"), l.style.transform = `translate(${s}px, ${o}px)`, l.setAttribute("width", String(Math.max(1, r - s))), l.setAttribute("height", String(Math.max(1, i - o))), l.setAttribute("viewBox", `${s} ${o} ${Math.max(1, r - s)} ${Math.max(1, i - o)}`);
    for (const d of n) {
      const u = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      u.setAttribute("points", d.map((p) => `${p.x},${p.y}`).join(" ")), l.append(u);
    }
    this.marks.append(l);
  }
  drawAccuracy(t, a) {
    const n = $t(t.lat, t.lng, a), s = 156543.03392 * Math.cos(t.lat * Math.PI / 180) / 2 ** a, o = Math.max(8, Math.min(180, t.accuracy / s)), r = document.createElement("span");
    r.className = "td-maps__accuracy", r.style.transform = `translate(${n.x - o}px, ${n.y - o}px)`, r.style.width = `${o * 2}px`, r.style.height = `${o * 2}px`, this.marks.append(r);
  }
  drawStops(t, a) {
    this.model.showStops !== !1 && t.forEach((n) => {
      (n.stops ?? []).forEach((s, o) => {
        const r = $t(s.lat, s.lng, a), i = document.createElement("button");
        i.type = "button", i.className = "td-maps__stop", i.dataset.tdMapsPick = n.id, i.style.transform = `translate(${r.x}px, ${r.y}px) translate(-50%, -50%)`, i.textContent = String(o + 1), i.setAttribute("aria-label", `Parada ${o + 1}, ${s.name}${s.at ? `, ${s.at}` : ""}`), this.marks.append(i);
      });
    });
  }
  drawUnits(t, a) {
    for (const n of t) {
      const s = $t(n.lat, n.lng, a), o = document.createElement("button");
      o.type = "button", o.className = "td-maps__pin", n.id === this.openId() && o.classList.add("is-on"), o.dataset.tdMapsPick = n.id, o.style.transform = `translate(${s.x}px, ${s.y}px) translate(-50%, -50%)`, o.textContent = ul(n.name), o.setAttribute("aria-label", `${n.name}, ${n.kind || "Piloto"}, ${n.status || "En ruta"}`), this.marks.append(o);
    }
  }
  drawList(t) {
    this.list.replaceChildren();
    const a = document.createElement("p");
    if (a.className = "td-maps__legend", a.textContent = this.model.follow ? "El círculo es tu posición. La línea es el recorrido de esta sesión." : this.model.matchRoute ? "La línea es el recorrido reconstruido por calles, a partir de la lista de coordenadas del piloto." : "El círculo es la posición actual. El cuadrado numerado es una parada ejecutada.", this.list.append(a), t.length === 0) {
      const n = document.createElement("p");
      n.className = "td-maps__empty", n.textContent = this.model.follow ? "Todavía no hay una posición de este equipo." : "No hay pilotos en el mapa. Cuando el sistema envíe una posición, aparecerá aquí.", this.list.append(n);
      return;
    }
    for (const n of t) {
      const s = document.createElement("button");
      s.type = "button", s.className = "td-maps__person", s.dataset.tdMapsPick = n.id, n.id === this.selected && s.classList.add("is-on");
      const o = document.createElement("strong");
      o.textContent = n.name;
      const r = document.createElement("span"), i = this.memory.traceStats?.[n.id], c = i ? `${Gt(i.distance)} recorridos · ${ee(i.duration)}` : "";
      r.textContent = [n.kind || "Piloto", n.status || "En ruta", n.vehicle, n.plate, c].filter(Boolean).join(" · "), s.append(o, r), this.list.append(s), (n.stops ?? []).forEach((l, d) => {
        const u = document.createElement("p");
        u.className = "td-maps__parada", u.textContent = `Parada ${d + 1}. ${l.name}${l.at ? `, ${l.at}` : ""}${l.note ? `. ${l.note}` : ""}`, this.list.append(u);
      });
    }
  }
  openId() {
    return this.hovered || this.selected;
  }
  placeCard() {
    const t = this.openId(), a = t ? this.marks.querySelector(`[data-td-maps-pick="${CSS.escape(t)}"]`) : null, n = this.viewport.parentElement;
    if (!(a instanceof HTMLElement) || !n || this.card.hidden)
      return;
    const s = a.getBoundingClientRect(), o = n.getBoundingClientRect();
    let r = s.right - o.left + 10, i = s.top - o.top - 12;
    r + 260 > o.width && (r = Math.max(8, s.left - o.left - 260)), i < 8 && (i = Math.min(o.height - 140, s.bottom - o.top + 8)), this.card.style.left = `${r}px`, this.card.style.top = `${i}px`;
  }
  drawCard(t) {
    const a = t.find((c) => c.id === this.openId()) ?? null;
    if (!a) {
      this.card.hidden = !0, this.card.replaceChildren();
      return;
    }
    this.card.hidden = !1, this.card.replaceChildren();
    const n = document.createElement("h3");
    n.textContent = a.name;
    const s = document.createElement("p");
    s.textContent = `${a.kind || "Piloto"} · ${a.status || "En ruta"}`, this.card.append(n, s);
    const o = [a.vehicle, a.plate].filter(Boolean).join(" · ");
    if (o) {
      const c = document.createElement("p");
      c.textContent = o, this.card.append(c);
    }
    if (a.detail) {
      const c = document.createElement("p");
      c.textContent = a.detail, this.card.append(c);
    }
    const r = document.createElement("p");
    r.textContent = ka(a.lat, a.lng), this.card.append(r);
    const i = this.memory.traceStats?.[a.id];
    if (i) {
      const c = document.createElement("p"), l = a.route?.length ?? 0;
      c.textContent = `Recorrido reconstruido · ${l === 1 ? "1 coordenada" : `${l} coordenadas`} · ${Gt(i.distance)} · ${ee(i.duration)}`, this.card.append(c);
    }
    if (a.updated) {
      const c = document.createElement("p");
      c.className = "td-maps__when", c.textContent = a.updated, this.card.append(c);
    }
  }
  drawStatus(t) {
    const a = t.length === 1 ? "1 en el mapa" : `${t.length} en el mapa`;
    if (this.count.textContent = this.model.follow ? t.length ? "Posición de esta sesión" : "Sin posición" : a, this.model.follow && !this.memory.fix && !("geolocation" in navigator)) {
      this.status.textContent = "Este navegador no entrega la ubicación del equipo.", this.paintRetry();
      return;
    }
    if (this.model.follow && !this.memory.fix) {
      this.status.textContent = `Buscando la ubicación de ${this.model.userName || "esta sesión"}…`;
      return;
    }
    if (this.model.follow && this.memory.fix) {
      this.status.textContent = `${this.model.userName || "Esta sesión"} está en el mapa. ${ka(this.memory.fix.lat, this.memory.fix.lng)}. Precisión aproximada de ${Math.round(this.memory.fix.accuracy)} metros.`;
      return;
    }
    if (this.model.matchRoute && this.memory.traceLoading) {
      this.status.textContent = "Reconstruyendo el recorrido por calles a partir de las coordenadas…";
      return;
    }
    if (this.model.matchRoute && this.memory.traceError) {
      this.status.textContent = this.memory.traceError, this.paintRetry();
      return;
    }
    if (this.model.matchRoute && this.memory.traceLines && Object.keys(this.memory.traceLines).length > 0) {
      const n = Object.values(this.memory.traceStats ?? {}), s = n.reduce((r, i) => r + i.distance, 0), o = n.reduce((r, i) => r + i.duration, 0);
      t.length === 1 && n.length === 1 && (this.count.textContent = `${Gt(s)} · ${ee(o)}`), this.status.textContent = t.length === 1 ? "Recorrido reconstruido por calles a partir de las coordenadas del piloto." : `Recorridos reconstruidos por calles. ${Gt(s)} en total.`;
      return;
    }
    this.status.textContent = t.length ? "Pasa el puntero o elige una persona para ver vehículo, patente y posición." : "No hay pilotos en el mapa. Cuando el sistema envíe una posición, aparecerá aquí.";
  }
  paintRetry() {
    if (this.status.querySelector("[data-td-maps-retry]"))
      return;
    const t = document.createElement("button");
    t.type = "button", t.dataset.tdMapsRetry = "", t.textContent = this.model.plan ? "Reintentar ruta" : this.model.matchRoute ? "Reintentar recorrido" : this.model.follow ? "Reintentar ubicación" : "Reintentar mapa", this.status.append(t);
  }
}
function Gt(e) {
  return e < 1e3 ? `${Math.round(e)} m` : `${(e / 1e3).toLocaleString("es-CL", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} km`;
}
function ee(e) {
  const t = Math.max(1, Math.round(e / 60)), a = Math.floor(t / 60), n = t % 60;
  return a === 0 ? `${t} min` : n === 0 ? `${a} h` : `${a} h ${n} min`;
}
function ul(e) {
  return e.trim().split(/\s+/).slice(0, 2).map((a) => a.charAt(0)).join("").toUpperCase() || "•";
}
function pl(e) {
  const t = [];
  for (const a of e) {
    if (!Number.isFinite(a.lat) || !Number.isFinite(a.lng))
      continue;
    const n = t[t.length - 1];
    n && Ze(n, a) < 15 || t.push(a);
  }
  return ml(t, 80);
}
function ml(e, t) {
  if (e.length <= t)
    return e;
  const a = [e[0]], n = (e.length - 1) / (t - 1);
  for (let s = 1; s < t - 1; s += 1)
    a.push(e[Math.round(s * n)]);
  return a.push(e[e.length - 1]), a;
}
function fl(e, t, a, n) {
  const s = e.map((r) => `${r.lng.toFixed(5)},${r.lat.toFixed(5)}`).join(";"), o = `${a}/route/v1/${t}/${s}?overview=full&geometries=geojson&steps=false`;
  return fetch(o, { signal: n }).then((r) => r.json()).then((r) => {
    const i = r.code === "Ok" ? r.routes?.[0] : void 0, c = i?.geometry?.coordinates?.map(([l, d]) => ({ lat: d, lng: l })) ?? [];
    return !i || c.length < 2 ? null : { line: c, distance: i.distance, duration: i.duration };
  });
}
function Ze(e, t) {
  const n = (t.lat - e.lat) * Math.PI / 180, s = (t.lng - e.lng) * Math.PI / 180, o = e.lat * Math.PI / 180, r = t.lat * Math.PI / 180, i = Math.sin(n / 2) ** 2 + Math.cos(o) * Math.cos(r) * Math.sin(s / 2) ** 2;
  return 2 * 6371e3 * Math.asin(Math.min(1, Math.sqrt(i)));
}
function ms(e) {
  e.querySelectorAll("td-maps").forEach((t) => {
    const a = At.get(t.dataset.mapId || "pilotos");
    if (a && a.matches(t) && t.querySelector("[data-td-maps-world]")) {
      a.refresh();
      return;
    }
    new dl(t);
  });
}
function hl(e = document) {
  if (ms(e), us || typeof MutationObserver > "u" || !document.body)
    return;
  us = !0, new MutationObserver((a) => {
    for (const n of a)
      for (const s of n.addedNodes)
        s instanceof Element && (s.matches("td-maps") || s.querySelector("td-maps")) && ms(s.matches("td-maps") ? s.parentElement ?? document : s);
  }).observe(document.body, { childList: !0, subtree: !0 });
}
async function gl(e, t) {
  const a = e.dataset.tdClick, n = e.closest("[data-td-region]"), s = n ?? e.closest("[data-td-page]");
  if (!a || !(s instanceof HTMLElement) || e.dataset.busy === "true")
    return;
  const o = [...s.querySelectorAll("[data-td-click]")].indexOf(e);
  e.dataset.busy = "true", e.setAttribute("aria-busy", "true");
  try {
    const r = await fetch(new URL("td/event", document.baseURI), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        RequestVerificationToken: e.dataset.tdToken ?? ""
      },
      body: JSON.stringify({ token: a, url: window.location.href }),
      credentials: "same-origin"
    });
    if (!r.ok) {
      e.dispatchEvent(new CustomEvent("td-event-error", { bubbles: !0, detail: { status: r.status } }));
      return;
    }
    const { html: i } = await r.json();
    if (n instanceof HTMLElement) {
      const l = new DOMParser().parseFromString(`<body>${i}</body>`, "text/html").querySelector(`[data-td-region="${CSS.escape(n.dataset.tdRegion ?? "")}"]`);
      if (!l) {
        e.dispatchEvent(new CustomEvent("td-event-error", { bubbles: !0, detail: { status: 0 } }));
        return;
      }
      n.innerHTML = l.innerHTML;
    } else
      s.innerHTML = i;
    t(), s.querySelectorAll("[data-td-click]")[o]?.focus();
  } catch {
    e.dispatchEvent(new CustomEvent("td-event-error", { bubbles: !0, detail: { status: 0 } }));
  } finally {
    e.removeAttribute("aria-busy"), delete e.dataset.busy;
  }
}
customElements.get("td-button") || customElements.define("td-button", Ue);
customElements.get("td-data-grid") || customElements.define("td-data-grid", ia);
customElements.get("td-textbox") || customElements.define("td-textbox", Zt);
document.addEventListener("input", (e) => {
  const t = ke(e.target, "td-textbox");
  t instanceof Zt && t.handleInput();
  const a = ke(e.target, "td-data-grid");
  a instanceof ia && a.handleInput(e.target), yc(e.target), Wo(e.target), lo(e.target), eo(e.target);
});
document.addEventListener("focusout", (e) => {
  const t = ke(e.target, "td-textbox");
  t instanceof Zt && t.handleBlur();
});
document.addEventListener("submit", (e) => {
  if (mo(e) || !(e.target instanceof HTMLFormElement))
    return;
  const t = e.target;
  if (tl(t)) {
    e.preventDefault(), e.stopPropagation();
    return;
  }
  const n = (e instanceof SubmitEvent ? e.submitter : null)?.closest("td-button");
  if (n instanceof Ue && n.hasAttribute("data-pending")) {
    e.preventDefault(), e.stopPropagation();
    return;
  }
  const s = [...t.querySelectorAll("td-textbox")].filter(
    (c) => c instanceof Zt
  );
  let o = null;
  for (const c of s)
    !c.validate() && !o && (o = c);
  const r = t.closest("td-editform");
  if (r instanceof HTMLElement) {
    const c = xn(t, !0);
    if (c.length > 0) {
      e.preventDefault(), e.stopPropagation(), yn(r, c), vn(c[0]);
      return;
    }
    fa(r), el(r), n instanceof Ue && n.beginPending();
    return;
  }
  const i = t.querySelector("[data-td-form-status]");
  if (o) {
    if (e.preventDefault(), e.stopPropagation(), i instanceof HTMLElement) {
      const c = i.querySelector("[data-td-form-status-detail]"), l = i.getAttribute("data-status-detail") ?? "Fix the highlighted fields, then try again.";
      c && (c.textContent = l), i.hidden = !1;
    }
    o.focusInput();
    return;
  }
  i instanceof HTMLElement && (i.hidden = !0), n instanceof Ue && n.beginPending();
}, !0);
document.addEventListener("click", (e) => {
  const t = e.target;
  if (!(t instanceof Element) || (gc(t), zc(t) || Wc(t) || Jc(t)) || $c(t) || Uo(t) || co(t))
    return;
  const a = t.closest("[data-td-secret-toggle]");
  if (a instanceof HTMLButtonElement) {
    bl(a);
    return;
  }
  const n = t.closest("[data-td-clear-secret]");
  if (n instanceof HTMLElement) {
    const l = n.closest("form")?.querySelector("[data-td-secret-field]");
    if (l instanceof HTMLInputElement) {
      l.value = "", l.type = "password", l.dispatchEvent(new Event("input", { bubbles: !0 }));
      const d = l.closest("td-textbox")?.querySelector("[data-td-secret-toggle]");
      d instanceof HTMLButtonElement && (d.textContent = d.dataset.show ?? "Show password", d.setAttribute("aria-pressed", "false")), l.focus();
    }
    return;
  }
  const s = ke(t, "td-data-grid");
  s instanceof ia && s.handleClick(t, e);
  const o = t.closest("[data-td-tree-toggle]");
  if (o instanceof HTMLButtonElement) {
    const l = o.closest('[role="treeitem"]'), d = l?.querySelector(':scope > [role="group"]'), u = o.getAttribute("aria-expanded") !== "true";
    o.setAttribute("aria-expanded", String(u)), l?.setAttribute("aria-expanded", String(u));
    const p = o.getAttribute("aria-label") ?? "";
    o.setAttribute("aria-label", u ? p.replace("Expandir", "Contraer") : p.replace("Contraer", "Expandir")), d instanceof HTMLElement && (d.hidden = !u);
  }
  const r = t.closest("[data-td-click]");
  if (r instanceof HTMLButtonElement && !r.disabled) {
    gl(r, Mn);
    return;
  }
  const i = t.closest("[data-td-theme-pick]");
  if (i instanceof HTMLElement) {
    En(i.getAttribute("data-td-theme-pick") || "modern");
    return;
  }
  if (t.closest("[data-td-theme-toggle]") instanceof HTMLElement) {
    const l = wn() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", l), Sn("td-theme", l), ao(), no();
  }
});
document.addEventListener("change", (e) => {
  const t = e.target;
  if (t instanceof HTMLSelectElement && t.matches("[data-td-theme-select]")) {
    En(t.value);
    return;
  }
  if (t instanceof HTMLSelectElement && t.matches("[data-td-cascade]")) {
    t.form?.requestSubmit();
    return;
  }
  Tc(t), eo(t);
  const a = ke(t, "td-data-grid");
  a instanceof ia && a.handleChange(t);
}, !0);
function bl(e) {
  const a = e.closest("td-textbox")?.querySelector("input");
  if (!(a instanceof HTMLInputElement))
    return;
  const n = a.type === "password";
  a.type = n ? "text" : "password", e.textContent = n ? e.dataset.hide ?? "Hide password" : e.dataset.show ?? "Show password", e.setAttribute("aria-pressed", n ? "true" : "false"), a.focus();
}
const $l = 3600 * 24 * 365;
function yl(e) {
  const t = `${e}=`;
  for (const a of document.cookie.split("; "))
    if (a.startsWith(t))
      try {
        return decodeURIComponent(a.slice(t.length));
      } catch {
        return a.slice(t.length);
      }
  return null;
}
function Sn(e, t) {
  const a = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${e}=${encodeURIComponent(t)}; Max-Age=${$l}; Path=/; SameSite=Lax${a}`;
}
function fs(e) {
  const t = yl(e);
  if (t)
    return t;
  try {
    const a = localStorage.getItem(e);
    if (a)
      return Sn(e, a), localStorage.removeItem(e), a;
  } catch {
  }
  return null;
}
function vl() {
  const e = fs("td-theme");
  (e === "dark" || e === "light") && document.documentElement.setAttribute("data-theme", e);
  const t = fs("td-theme-family");
  t === "material" || t === "expressive" || t === "fluent" ? document.documentElement.setAttribute("data-td-theme", t) : t === "modern" && document.documentElement.removeAttribute("data-td-theme");
}
function wn() {
  const e = document.documentElement.getAttribute("data-theme");
  return e === "dark" || e === "light" ? e : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function ao() {
  const e = wn() === "dark" ? "light" : "dark";
  document.querySelectorAll("[data-td-theme-toggle]").forEach((t) => {
    const a = t.querySelector(".td-btn__text") ?? t.querySelector(".td-btn__label"), n = t.getAttribute(e === "dark" ? "data-label-dark" : "data-label-light");
    a && n && (a.textContent = n);
  });
}
const xl = ["modern", "material", "expressive", "fluent"], Sl = {
  modern: "Modern",
  material: "Material",
  expressive: "Material Expressive",
  fluent: "Fluent 3"
};
function En(e) {
  const t = xl.includes(e) ? e : "modern";
  t === "modern" ? document.documentElement.removeAttribute("data-td-theme") : document.documentElement.setAttribute("data-td-theme", t), Sn("td-theme-family", t), document.querySelectorAll("[data-td-theme-select]").forEach((a) => {
    a.value = t;
  }), document.querySelectorAll(".td-theme-name").forEach((a) => {
    a.textContent = Sl[t];
  }), no();
}
function no() {
  const e = document.documentElement.getAttribute("data-td-theme") ?? "modern", t = wn();
  document.querySelectorAll("[data-td-theme-pick]").forEach((a) => {
    a.setAttribute("aria-pressed", String((a.getAttribute("data-td-theme-pick") || "modern") === e)), a.setAttribute("data-theme", t);
  });
}
function wl() {
  En(document.documentElement.getAttribute("data-td-theme") ?? "modern");
}
function ke(e, t) {
  return e instanceof Element ? e.closest(t) : null;
}
document.addEventListener("dblclick", (e) => {
  e.target instanceof Element && bc(e.target);
});
document.addEventListener("focusout", (e) => {
  const t = e.target;
  if (!(t instanceof Element))
    return;
  const a = t.closest("td-inplace");
  if (a?.getAttribute("data-mode") !== "auto" || !t.closest("[data-td-inplace-edit]"))
    return;
  const n = e.relatedTarget;
  n instanceof Node && a.contains(n) || window.setTimeout(() => {
    a.querySelector("[data-td-inplace-edit]")?.hasAttribute("hidden") || Jt(a, !0);
  }, 0);
});
document.addEventListener("keydown", (e) => {
  Qc(e), vc(e), Go(e), uo(e);
});
document.addEventListener("mousedown", (e) => {
  const t = e.target;
  t instanceof Element && t.closest("[data-td-rte-cmd],[data-td-rte-color],[data-td-rte-source],[data-td-rte-link]") && e.preventDefault();
});
document.addEventListener("pointerdown", Ga);
document.addEventListener("pointermove", Ga);
document.addEventListener("pointerup", Ga);
document.addEventListener("contextmenu", Ko);
function Mn() {
  vl(), hc(), Vo(), io(), Tr(), fc(), Na(), Os(), ao(), wl(), Yc(), hl();
}
Mn();
po();
document.addEventListener("click", (e) => {
  nl(e) && (e.preventDefault(), e.stopPropagation());
}, !0);
document.addEventListener("reset", (e) => {
  e.target instanceof HTMLFormElement && al(e.target);
});
const El = window.Blazor, so = ["data-theme", "data-td-theme"], oo = new Map(so.flatMap((e) => {
  const t = document.documentElement.getAttribute(e);
  return t ? [[e, t]] : [];
}));
new MutationObserver((e) => {
  for (const t of e) {
    const a = t.attributeName;
    if (!a) continue;
    const n = document.documentElement.getAttribute(a);
    n && oo.set(a, n);
  }
}).observe(document.documentElement, { attributes: !0, attributeFilter: [...so] });
El?.addEventListener?.("enhancedload", () => {
  for (const [e, t] of oo)
    document.documentElement.hasAttribute(e) || document.documentElement.setAttribute(e, t);
  Mn();
});
const Ml = new MutationObserver((e) => {
  for (const t of e) {
    const a = t.target instanceof HTMLElement && t.target.matches("td-ecom") ? t.target : null;
    a && (t.type === "attributes" || a.childElementCount === 0) && Na(a.parentElement ?? document);
    for (const n of t.addedNodes) {
      if (!(n instanceof Element)) continue;
      const s = n.matches("td-studio") || n.querySelector("td-studio"), o = n.matches("td-ecom") || n.querySelector("td-ecom");
      s && Os(n.matches("td-studio") ? n.parentElement ?? document : n), o && Na(n.matches("td-ecom") ? n.parentElement ?? document : n);
    }
  }
});
Ml.observe(document.body, { childList: !0, subtree: !0, attributes: !0, attributeFilter: ["data-kind"] });
