class Xe extends HTMLElement {
  beginPending() {
    if (this.hasAttribute("data-pending"))
      return;
    this.setAttribute("data-pending", "");
    const t = this.querySelector("button");
    t && (t.setAttribute("aria-busy", "true"), t.setAttribute("aria-disabled", "true")), this.querySelector(".td-btn__label")?.setAttribute("aria-hidden", "true"), this.querySelector(".td-btn__pending")?.removeAttribute("aria-hidden");
  }
}
const Da = "td-grid-density", Pa = "td-grid-lines";
class De extends HTMLElement {
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
        const f = this.querySelector("[data-td-status]");
        f instanceof HTMLElement && (f.textContent = `Copiado · ${p}`);
      } else u && (window.location.href = u);
      this.closePopups();
      return;
    }
    const d = t.closest("[data-td-select]");
    if (d instanceof HTMLInputElement) {
      if (this.lastCheck && a instanceof MouseEvent && a.shiftKey) {
        const u = [...this.querySelectorAll("[data-td-select]")], p = u.indexOf(this.lastCheck), f = u.indexOf(d);
        if (p >= 0 && f >= 0) {
          const [m, b] = p < f ? [p, f] : [f, p];
          for (let h = m; h <= b; h++)
            u[h].checked = d.checked, u[h].closest("tr")?.classList.toggle("is-selected", d.checked);
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
      const a = localStorage.getItem(Da);
      (a === "compact" || a === "comfortable") && this.setDensity(a), localStorage.getItem(Pa) === "1" && this.setLines(!0);
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
      localStorage.setItem(Da, t);
    } catch {
    }
  }
  toggleLines() {
    this.setLines(this.dataset.lines !== "true");
  }
  setLines(t) {
    t ? this.dataset.lines = "true" : delete this.dataset.lines, this.querySelector("[data-td-lines]")?.setAttribute("aria-pressed", String(t));
    try {
      localStorage.setItem(Pa, t ? "1" : "0");
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
const Vn = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
class Pe extends HTMLElement {
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
      return Zt(t, "data-msg-required", "Enter a value for this field.");
    if (t instanceof HTMLInputElement && t.type === "email" && a.length > 0 && !Vn.test(a))
      return Zt(t, "data-msg-type", "Enter an email address like name@company.com.");
    if (t.minLength > 0 && a.length > 0 && a.length < t.minLength)
      return Zt(t, "data-msg-minlength", `Use at least ${t.minLength} characters.`);
    if (t.maxLength > 0 && t.value.length > t.maxLength)
      return Zt(t, "data-msg-maxlength", `Use at most ${t.maxLength} characters.`);
    if (t instanceof HTMLInputElement && t.pattern)
      try {
        const n = new RegExp(`^(?:${t.pattern})$`);
        if (a.length > 0 && !n.test(t.value))
          return Zt(t, "data-msg-pattern", "Use the requested format for this field.");
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
function Zt(e, t, a) {
  const n = e.getAttribute(t);
  return n && n.trim().length > 0 ? n : a;
}
function Un(e = document) {
  e.querySelectorAll("td-markdown").forEach((t) => {
    const a = t.querySelector("[data-td-md-source]");
    a && ua(t, a.value);
  }), e.querySelectorAll("td-knob").forEach((t) => {
    t instanceof HTMLElement && It(t, Number(t.dataset.value ?? 0));
  }), e.querySelectorAll("[data-td-toc]").forEach((t) => {
    t instanceof HTMLElement && os(t);
  }), e.querySelectorAll("td-menuapp").forEach((t) => {
    t instanceof HTMLElement && ss(t);
  }), e.querySelectorAll("td-ddgrid").forEach((t) => pa(t)), e.querySelectorAll("[data-td-navmenu]").forEach((t) => {
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
          s(() => qe(i, !0), a);
          return;
        }
        s(() => Ae(t), a);
      }
    }), t.addEventListener("pointerleave", () => {
      s(() => Ae(t), 180);
    });
  });
}
function Wn(e) {
  const t = e.closest("[data-td-popup-open]");
  if (t instanceof HTMLButtonElement) {
    const k = t.closest("td-popup")?.querySelector("[data-td-popup-panel]");
    if (k) {
      const N = k.hidden;
      Ye(), k.hidden = !N, t.setAttribute("aria-expanded", String(N));
    }
    return !0;
  }
  e.closest("td-popup") || Ye();
  const a = e.closest("[data-td-shell-bell]");
  if (a instanceof HTMLButtonElement) {
    const $ = a.parentElement?.querySelector("[data-td-shell-notes]");
    return $ && ($.hidden = !$.hidden, a.setAttribute("aria-expanded", String(!$.hidden))), !0;
  }
  e.closest("[data-td-shell-notes]") || (document.querySelectorAll("[data-td-shell-notes]").forEach(($) => {
    $.hidden = !0;
  }), document.querySelectorAll("[data-td-shell-bell]").forEach(($) => $.setAttribute("aria-expanded", "false")));
  const n = e.closest("[data-td-shell-mask]");
  if (n instanceof HTMLElement) {
    const $ = n.closest("td-layout");
    return $ && ($.dataset.collapsed = "true", $.querySelector("[data-td-layout-toggle]")?.setAttribute("aria-expanded", "false")), !0;
  }
  const s = e.closest("[data-td-layout-toggle]");
  if (s instanceof HTMLButtonElement) {
    const $ = s.closest("td-layout");
    if ($) {
      const k = $.dataset.collapsed !== "true";
      $.dataset.collapsed = String(k), s.setAttribute("aria-expanded", String(!k));
    }
    return !0;
  }
  const o = e.closest("[data-td-layout-side]");
  if (o instanceof HTMLButtonElement) {
    const $ = o.closest("td-layout");
    if ($) {
      const k = $.dataset.side !== "start";
      $.dataset.side = k ? "start" : "end", o.setAttribute("aria-checked", String(k)), o.lastChild && (o.lastChild.textContent = k ? "Sidebar a la izquierda" : "Sidebar a la derecha");
    }
    return !0;
  }
  const r = e.closest("[data-td-layout-pos]");
  if (r instanceof HTMLButtonElement) {
    const $ = r.closest("td-layout");
    return $ && ($.dataset.side = r.dataset.tdLayoutPos ?? "start", $.querySelectorAll("[data-td-layout-pos]").forEach((k) => {
      k.setAttribute("aria-pressed", String(k === r));
    })), !0;
  }
  const i = e.closest("[data-td-nav-open]");
  if (i instanceof HTMLButtonElement)
    return qe(i, i.getAttribute("aria-expanded") !== "true"), !0;
  const c = e.closest("[data-td-pmenu-toggle]");
  if (c instanceof HTMLButtonElement) {
    const $ = c.closest("[data-td-pmenu]"), k = c.closest("[data-td-pmenu-sec]"), N = c.getAttribute("aria-expanded") !== "true";
    if ($?.dataset.multiple !== "true" && $?.querySelectorAll("[data-td-pmenu-sec]").forEach((O) => {
      O.setAttribute("data-open", "false"), O.querySelector("[data-td-pmenu-toggle]")?.setAttribute("aria-expanded", "false");
      const X = O.querySelector(".td-pmenu__kids");
      X && (X.hidden = !0);
    }), k) {
      k.setAttribute("data-open", N ? "true" : "false");
      const O = k.querySelector(".td-pmenu__kids");
      O && (O.hidden = !N);
    }
    return c.setAttribute("aria-expanded", N ? "true" : "false"), !0;
  }
  const l = e.closest("[data-td-pmenu-link]");
  if (l instanceof HTMLElement) {
    const $ = l.closest("[data-td-pmenu-demo]")?.querySelector("[data-td-pmenu-msg]");
    if ($) {
      const k = l.querySelector("span")?.textContent?.trim() || l.textContent?.trim() || "";
      $.textContent = `Navegar a: ${k}`;
    }
  }
  const d = e.closest("[data-td-pmenu-multi]");
  if (d instanceof HTMLButtonElement) {
    const $ = d.closest("[data-td-pmenu-demo]")?.querySelector("[data-td-pmenu]"), k = $?.dataset.multiple !== "true";
    return $ && ($.dataset.multiple = k ? "true" : "false"), d.setAttribute("aria-checked", k ? "true" : "false"), !0;
  }
  const u = e.closest("[data-td-pmenu-icons]");
  if (u instanceof HTMLButtonElement) {
    const $ = u.closest("[data-td-pmenu-demo]")?.querySelector("[data-td-pmenu]"), k = !$?.classList.contains("is-collapsed");
    return $?.classList.toggle("is-collapsed", k), u.setAttribute("aria-checked", k ? "true" : "false"), !0;
  }
  const p = e.closest("[data-td-menu-row]");
  if (p instanceof HTMLElement)
    return ta(p, !0), !0;
  const f = e.closest("[data-td-row-gap], [data-td-row-align]");
  if (f instanceof HTMLButtonElement) {
    const $ = f.closest("[data-td-row-playground]"), k = $?.querySelectorAll(".td-row12");
    return f.dataset.tdRowGap && (k?.forEach((N) => {
      N.style.setProperty("--td-row-gap", f.dataset.tdRowGap ?? "16px");
    }), $?.querySelectorAll("[data-td-row-gap]").forEach((N) => {
      N.setAttribute("aria-pressed", String(N === f)), N.classList.toggle("is-on", N === f);
    })), f.dataset.tdRowAlign && (k?.forEach((N) => {
      N.style.alignItems = f.dataset.tdRowAlign ?? "stretch";
    }), $?.querySelectorAll("[data-td-row-align]").forEach((N) => {
      N.setAttribute("aria-pressed", String(N === f)), N.classList.toggle("is-on", N === f);
    })), !0;
  }
  const m = e.closest("[data-td-ddgrid-page]");
  if (m instanceof HTMLButtonElement) {
    const $ = m.closest("td-ddgrid");
    return $ instanceof HTMLElement && ($.dataset.page = String(Number($.dataset.page ?? 1) + Number(m.dataset.tdDdgridPage ?? 1)), pa($)), !0;
  }
  const b = e.closest("[data-td-ddgrid-clear]");
  if (b instanceof HTMLButtonElement) {
    const $ = b.closest("td-ddgrid"), k = $?.querySelector("[data-td-ddgrid-value]"), N = $?.querySelector("[data-td-ddgrid-text]"), O = $?.querySelector("[data-td-ddgrid-code]");
    return k && (k.value = ""), N && (N.textContent = $?.querySelector("[data-td-ddgrid-open]")?.getAttribute("data-placeholder") ?? "Selecciona un repuesto…", N.classList.add("is-placeholder")), O && (O.textContent = ""), $?.querySelectorAll("[data-td-ddgrid-row]").forEach((X) => {
      X.classList.remove("is-on"), X.setAttribute("aria-selected", "false");
    }), b.hidden = !0, $?.querySelector(".td-select__trigger")?.classList.remove("has-clear"), !0;
  }
  const h = e.closest("[data-td-ddgrid-open]");
  if (h instanceof HTMLElement && !e.closest("[data-td-ddgrid-clear]")) {
    const k = h.closest("td-ddgrid")?.querySelector("[data-td-ddgrid-panel]");
    if (k) {
      const N = k.hidden;
      document.querySelectorAll("[data-td-ddgrid-panel]").forEach((O) => {
        O.hidden = !0;
      }), k.hidden = !N, h.setAttribute("aria-expanded", String(N));
    }
    return !0;
  }
  const g = e.closest("[data-td-ddgrid-row]");
  if (g instanceof HTMLElement) {
    const $ = g.closest("td-ddgrid"), k = $?.querySelector("[data-td-ddgrid-value]"), N = $?.querySelector("[data-td-ddgrid-text]");
    k && (k.value = g.dataset.tdDdgridRow ?? ""), N && (N.textContent = g.dataset.label ?? "", N.classList.remove("is-placeholder"));
    const O = $?.querySelector("[data-td-ddgrid-code]");
    O && (O.textContent = g.dataset.code ?? ""), $?.querySelectorAll("[data-td-ddgrid-row]").forEach((ct) => {
      const M = ct === g;
      ct.classList.toggle("is-on", M), ct.setAttribute("aria-selected", M ? "true" : "false");
    }), $?.querySelector("[data-td-ddgrid-panel]")?.setAttribute("hidden", ""), $?.querySelector("[data-td-ddgrid-open]")?.setAttribute("aria-expanded", "false");
    const X = $?.querySelector("[data-td-ddgrid-clear]");
    return X && (X.hidden = !1), $?.querySelector(".td-select__trigger")?.classList.add("has-clear"), !0;
  }
  const w = e.closest("[data-td-md]");
  if (w instanceof HTMLButtonElement)
    return ts(w.closest("td-markdown"), w.dataset.tdMd ?? ""), !0;
  const v = e.closest("[data-td-md-mode]");
  if (v instanceof HTMLButtonElement) {
    const $ = v.closest("td-markdown");
    return $ && ($.dataset.mode = v.dataset.tdMdMode ?? "split", $.querySelectorAll("[data-td-md-mode]").forEach((k) => {
      k.setAttribute("aria-pressed", String(k === v));
    })), !0;
  }
  const E = e.closest("[data-td-ts-preset]");
  if (E instanceof HTMLButtonElement)
    return Yn(E.closest("td-timespan"), Number(E.dataset.tdTsPreset ?? 0)), !0;
  const x = e.closest("[data-td-knob-step]");
  if (x instanceof HTMLButtonElement) {
    const $ = x.closest("td-knob");
    if ($ instanceof HTMLElement) {
      const k = Number($.dataset.step ?? 1) * Number(x.dataset.tdKnobStep ?? 1);
      It($, Number($.dataset.value ?? 0) + k);
    }
    return !0;
  }
  const y = e.closest("[data-td-speech]");
  if (y instanceof HTMLButtonElement)
    return es(y), !0;
  const S = e.closest("[data-td-ai-tip]");
  if (S instanceof HTMLButtonElement) {
    const $ = S.closest("td-aichat")?.querySelector("[data-td-ai-form]"), k = $?.querySelector("input");
    return k && $ && (k.value = S.textContent ?? "", $.requestSubmit()), !0;
  }
  return !1;
}
function Gn(e) {
  if (!(!(e instanceof HTMLInputElement) && !(e instanceof HTMLTextAreaElement))) {
    if (e.matches("[data-td-md-source]")) {
      ua(e.closest("td-markdown"), e.value);
      return;
    }
    if (e.matches("[data-td-ts]")) {
      dn(e.closest("td-timespan"));
      return;
    }
    if (e.matches("[data-td-ddgrid-q]")) {
      const t = e.closest("td-ddgrid");
      t instanceof HTMLElement && (t.dataset.page = "1", t.dataset.query = e.value, pa(t));
      return;
    }
    if (e.matches("[data-td-menuapp-q]")) {
      ea(e.closest("td-menuapp"), e.value);
      const t = e.closest("td-layout")?.querySelector("[data-td-shell-q]");
      t && t.value !== e.value && (t.value = e.value);
      return;
    }
    if (e.matches("[data-td-shell-q]")) {
      const t = e.closest("td-layout"), a = t?.querySelector("td-menuapp"), n = a?.querySelector("[data-td-menuapp-q]");
      n && (n.value = e.value), ea(a ?? null, e.value), e.value && t instanceof HTMLElement && t.dataset.collapsed === "true" && (t.dataset.collapsed = "false", t.querySelector("[data-td-layout-toggle]")?.setAttribute("aria-expanded", "true"));
      return;
    }
    if (e.matches("[data-td-menuapp-json]")) {
      ns(e.closest("td-menuapp"), e.value);
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
function Jn(e) {
  const t = e.target instanceof HTMLElement ? e.target.closest("[data-td-navmenu]") : null;
  if (t instanceof HTMLElement && ["ArrowLeft", "ArrowRight", "ArrowDown", "Escape"].includes(e.key)) {
    const i = [...t.querySelectorAll(".td-navmenu__bar .td-navmenu__btn")], c = i.findIndex((l) => l === document.activeElement || l.getAttribute("aria-expanded") === "true");
    if (e.key === "Escape") {
      Ae(t), i[Math.max(c, 0)]?.focus();
      return;
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const l = i[(Math.max(c, 0) + (e.key === "ArrowRight" ? 1 : i.length - 1)) % i.length];
      l instanceof HTMLButtonElement && l.hasAttribute("data-td-nav-open") ? qe(l, !0) : Ae(t), l?.focus();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const l = i[Math.max(c, 0)];
      l instanceof HTMLButtonElement && l.hasAttribute("data-td-nav-open") && (qe(l, !0), l.parentElement?.querySelector("a")?.focus());
    }
    return;
  }
  if (e.key === "/" && e.target instanceof HTMLElement && e.target.closest("td-menuapp") && !e.target.matches("input, textarea")) {
    e.preventDefault(), e.target.closest("td-menuapp")?.querySelector("[data-td-menuapp-q]")?.focus();
    return;
  }
  if (e.key === "Escape" && e.target instanceof HTMLInputElement && e.target.matches("[data-td-menuapp-q]")) {
    e.target.value = "", ea(e.target.closest("td-menuapp"));
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
    (e.key === "ArrowDown" || e.key === "ArrowUp") && (e.preventDefault(), i[c + (e.key === "ArrowDown" ? 1 : -1)]?.focus()), (e.key === "ArrowRight" || e.key === "Enter") && (e.preventDefault(), ta(a, e.key === "Enter")), e.key === "ArrowLeft" && a.getAttribute("aria-expanded") === "true" && (e.preventDefault(), ta(a, !1));
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
  e.key === "Escape" && (Ye(), document.querySelectorAll("[data-td-ddgrid-panel], .td-navmenu__panel").forEach((i) => {
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
      (e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "PageUp") && (e.preventDefault(), It(i, Number(i.dataset.value ?? 0) + (e.key === "PageUp" ? c * 5 : c))), (e.key === "ArrowLeft" || e.key === "ArrowDown" || e.key === "PageDown") && (e.preventDefault(), It(i, Number(i.dataset.value ?? 0) - (e.key === "PageDown" ? c * 5 : c))), e.key === "Home" && (e.preventDefault(), It(i, Number(i.dataset.min ?? 0))), e.key === "End" && (e.preventDefault(), It(i, Number(i.dataset.max ?? 100)));
    }
  }
}
function Qn() {
  document.addEventListener("pointerdown", (e) => {
    const t = e.target instanceof Element ? e.target.closest("[data-td-split-handle]") : null;
    t instanceof HTMLElement && e instanceof PointerEvent && (e.preventDefault(), Zn(t, e));
    const a = e.target instanceof Element ? e.target.closest("[data-td-knob]") : null;
    if (a instanceof HTMLElement && e instanceof PointerEvent) {
      const n = a.closest("td-knob");
      if (n instanceof HTMLElement && n.dataset.readonly !== "true" && !n.classList.contains("is-off")) {
        e.preventDefault();
        const s = (r) => Xn(n, a, r), o = () => {
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
function Kn(e) {
  const t = e.target;
  if (!(t instanceof HTMLFormElement))
    return !1;
  if (t.matches("[data-td-chat-form]")) {
    e.preventDefault();
    const a = t.querySelector("input"), n = t.closest("td-chat")?.querySelector("[data-td-chat-log]"), s = a?.value.trim() ?? "";
    return s && n && a && (n.append(ye(s, !0)), a.value = "", window.setTimeout(() => n.append(ye("Recibido. Un asesor te confirma el stock.", !1)), 700)), !0;
  }
  if (t.matches("[data-td-ai-form]")) {
    e.preventDefault();
    const a = t.querySelector("input"), n = t.closest("td-aichat"), s = n?.querySelector("[data-td-chat-log]"), o = a?.value.trim() ?? "";
    if (o && s && a && n) {
      s.append(ye(o, !0)), a.value = "";
      const r = is(o, n.dataset.catalog ?? ""), i = ye("", !1);
      s.append(i), rs(i.querySelector("p"), r);
    }
    return !0;
  }
  return !1;
}
function Ye() {
  document.querySelectorAll("[data-td-popup-panel]").forEach((e) => {
    e.hidden = !0;
  }), document.querySelectorAll("[data-td-popup-open]").forEach((e) => e.setAttribute("aria-expanded", "false"));
}
function Zn(e, t) {
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
function Xn(e, t, a) {
  const n = t.getBoundingClientRect(), o = (Math.atan2(a.clientY - (n.top + n.height / 2), a.clientX - (n.left + n.width / 2)) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2), r = Number(e.dataset.min ?? 0), i = Number(e.dataset.max ?? 100);
  It(e, r + o / (Math.PI * 1.75) * (i - r));
}
function It(e, t) {
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
function Yn(e, t) {
  if (!e)
    return;
  const a = Math.floor(t / 1440), n = Math.floor(t % 1440 / 60), s = t % 60, o = e.querySelector('[data-td-ts="d"]'), r = e.querySelector('[data-td-ts="h"]'), i = e.querySelector('[data-td-ts="m"]');
  o && (o.value = String(a)), r && (r.value = String(n)), i && (i.value = String(s)), dn(e);
}
function dn(e) {
  if (!e)
    return;
  const t = Number(e.querySelector('[data-td-ts="d"]')?.value ?? 0), a = Number(e.querySelector('[data-td-ts="h"]')?.value ?? 0), n = Number(e.querySelector('[data-td-ts="m"]')?.value ?? 0), s = (c) => String(c).padStart(2, "0"), o = `${t}.${s(a)}:${s(n)}:00`, r = e.querySelector("[data-td-ts-iso]"), i = e.querySelector("[data-td-ts-out]");
  r && (r.value = o), i && (i.textContent = o);
}
function ts(e, t) {
  const a = e?.querySelector("[data-td-md-source]");
  if (!a)
    return;
  const n = a.selectionStart, s = a.selectionEnd, o = a.value.slice(n, s) || "texto", r = t === "# " || t === "- " ? `${t}${o}` : `${t}${o}${t}`;
  a.setRangeText(r, n, s, "end"), ua(e, a.value), a.focus();
}
function ua(e, t) {
  const a = e?.querySelector("[data-td-md-preview]");
  a instanceof HTMLElement && (a.innerHTML = t.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replace(/^### (.+)$/gm, "<h3>$1</h3>").replace(/^## (.+)$/gm, "<h2>$1</h2>").replace(/^# (.+)$/gm, "<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/`(.+?)`/g, "<code>$1</code>").replace(/^- (.+)$/gm, "<li>$1</li>").replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>").replace(/\n{2,}/g, "</p><p>").replace(/^(?!<h|<ul|<li|<p)(.+)$/gm, "<p>$1</p>"));
}
function es(e) {
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
function Ae(e) {
  e.querySelectorAll(".td-navmenu__panel").forEach((t) => {
    t.hidden = !0;
  }), e.querySelectorAll("[data-td-nav-open]").forEach((t) => t.setAttribute("aria-expanded", "false"));
}
function qe(e, t) {
  const n = e.closest(".td-navmenu__item")?.querySelector(".td-navmenu__panel");
  document.querySelectorAll(".td-navmenu__panel").forEach((s) => {
    s.hidden = !0;
  }), document.querySelectorAll("[data-td-nav-open]").forEach((s) => s.setAttribute("aria-expanded", "false")), n && (n.hidden = !t), e.setAttribute("aria-expanded", t ? "true" : "false");
}
function as(e) {
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
function ta(e, t) {
  const a = e.closest("td-menuapp"), n = e.closest("td-layout.td-appshell--menu");
  if (n instanceof HTMLElement && n.dataset.mode !== "float" && n.dataset.collapsed === "true" && e.getAttribute("aria-expanded") !== null && (n.dataset.collapsed = "false", n.querySelector("[data-td-layout-toggle]")?.setAttribute("aria-expanded", "true")), e.getAttribute("aria-expanded") !== null) {
    const i = t ? e.getAttribute("aria-expanded") !== "true" : !1;
    if (e.setAttribute("aria-expanded", i ? "true" : "false"), Re(a), a?.dataset.remember === "true") {
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
  r && (r.textContent = s ? `Ruta activa: ${s}` : "Ruta activa"), as(e), t && s && o?.dataset.stay !== "true" && (window.location.href = s);
}
function Re(e) {
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
function ea(e, t) {
  Re(e);
}
function ns(e, t) {
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
  s?.querySelectorAll("[data-td-menu-row]").forEach((i) => i.remove()), un(n, null, 0).forEach((i, c) => {
    const l = document.createElement("div");
    l.className = "td-menuapp__row", l.role = "treeitem", l.dataset.tdMenuRow = i.id, l.dataset.parent = i.parent ?? "", l.dataset.depth = String(i.depth), l.dataset.label = i.label, l.dataset.href = i.path ?? "", l.style.setProperty("--d", String(i.depth)), l.tabIndex = c === 0 ? 0 : -1, l.setAttribute("aria-level", String(i.depth + 1)), i.parentNode ? (l.setAttribute("aria-expanded", i.depth === 0 && c === 0 ? "true" : "false"), l.innerHTML = '<svg class="td-menuapp__chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>') : l.innerHTML = '<span class="td-menuapp__dot" aria-hidden="true"></span>';
    const d = document.createElement("span");
    if (d.textContent = i.label, l.append(d), i.badge) {
      const u = document.createElement("em");
      u.textContent = i.badge, l.append(u);
    }
    o ? s?.insertBefore(l, o) : s?.append(l);
  }), Re(e);
}
function un(e, t, a) {
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
    }), i.length && n.push(...un(i, r, a + 1));
  }), n;
}
function ss(e) {
  if (e.dataset.remember === "true")
    try {
      const t = JSON.parse(localStorage.getItem("td-menuapp") ?? "[]");
      t.length && e.querySelectorAll("[data-td-menu-row][aria-expanded]").forEach((a) => {
        a.setAttribute("aria-expanded", t.includes(a.dataset.tdMenuRow ?? "") ? "true" : "false");
      });
    } catch {
    }
  Re(e);
}
function pa(e) {
  const t = Number(e.getAttribute("data-page-size") ?? 8) || 8, a = (e.getAttribute("data-query") ?? e.querySelector("[data-td-ddgrid-q]")?.value ?? "").trim().toLocaleLowerCase(), n = [...e.querySelectorAll("[data-td-ddgrid-row]")], s = n.filter((p) => !a || (p.textContent ?? "").toLocaleLowerCase().includes(a)), o = Math.max(1, Math.ceil(s.length / t));
  let r = Number(e.dataset.page ?? 1);
  r = Math.min(o, Math.max(1, r)), e.dataset.page = String(r);
  const i = (r - 1) * t;
  n.forEach((p) => {
    const f = s.indexOf(p);
    p.hidden = f < 0 || f < i || f >= i + t;
  });
  const c = e.querySelector("[data-td-ddgrid-meta]");
  if (c) {
    const p = s.length === 0 ? 0 : i + 1, f = Math.min(i + t, s.length);
    c.textContent = `${p}–${f} de ${s.length} repuestos · ↑ ↓ y Enter para elegir`;
  }
  const l = e.querySelector("[data-td-ddgrid-empty]");
  l && (l.hidden = s.length > 0);
  const d = e.querySelector('[data-td-ddgrid-page="-1"]'), u = e.querySelector('[data-td-ddgrid-page="1"]');
  d && (d.disabled = r <= 1), u && (u.disabled = r >= o);
}
function os(e) {
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
function ye(e, t) {
  const a = document.createElement("div");
  a.className = `td-chat__bubble ${t ? "is-out" : "is-in"}`;
  const n = document.createElement("p");
  n.textContent = e;
  const s = document.createElement("time");
  return s.textContent = (/* @__PURE__ */ new Date()).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }), a.append(n, s), a;
}
function rs(e, t) {
  if (!e)
    return;
  let a = 0;
  const n = () => {
    a += 2, e.textContent = t.slice(0, a), a < t.length && window.setTimeout(n, 18);
  };
  n();
}
function is(e, t) {
  const a = e.toLocaleLowerCase(), n = t.split(`
`).map((o) => o.split("|").map((r) => r.trim())).filter((o) => o.length >= 4);
  if (a.includes("agotado")) {
    const o = n.filter((r) => Number(r[4] ?? 1) <= 0).map((r) => r[1]);
    return o.length ? `Agotados ahora: ${o.join(", ")}.` : "No hay agotados en este recorte del catálogo.";
  }
  const s = n.find((o) => o.some((r) => r.toLocaleLowerCase().includes(a.replace("pastillas para ", "").replace("¿", "").replace("?", ""))));
  return s ? `${s[1]} (${s[0]}). Marca ${s[2]}. Stock ${s[4] ?? "—"} · ${s[5] ?? ""}.` : "En este recorte del catálogo está BR-4521-AD Pastilla de freno delantera, Volvo, 42 u. en Santiago.";
}
const cs = [
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
], pn = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"], ls = ["0100111", "0110011", "0011011", "0100001", "0011101", "0111001", "0000101", "0010001", "0001001", "0010111"], fn = ["1110010", "1100110", "1101100", "1000010", "1011100", "1001110", "1010000", "1000100", "1001000", "1110100"], ds = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];
function fa(e, t, a, n, s, o) {
  return e === "ean13" ? Ue("EAN-13", Ra(t, 13), t, a, n, s, o, "12 dígitos + verificador. Se completa con ceros si falta.") : e === "ean8" ? Ue("EAN-8", Ra(t, 8), t, a, n, s, o, "7 dígitos + verificador.") : Ue("Code 128", us(t), t, a, n, s, o, "Code 128 B. ASCII imprimible.");
}
function us(e) {
  const t = [...e].filter((s) => s.charCodeAt(0) >= 32 && s.charCodeAt(0) <= 126);
  if (!t.length)
    return { bits: "", value: e, error: "Escribe un valor para Code 128." };
  const a = [104, ...t.map((s) => s.charCodeAt(0) - 32)], n = a.reduce((s, o, r) => s + o * (r === 0 ? 1 : r), 0) % 103;
  return a.push(n, 106), { bits: a.map((s) => hs(cs[s])).join(""), value: t.join("") };
}
function Ra(e, t) {
  const a = e.replace(/\D/g, "").slice(0, t);
  if (a.length < t - 1)
    return { bits: "", value: a, error: `EAN-${t} necesita ${t - 1} dígitos.` };
  const n = a.slice(0, t - 1).padStart(t - 1, "0"), s = n + ps(n);
  return { bits: t === 13 ? fs(s) : ms(s), value: s };
}
function ps(e) {
  const t = [...e].reduce((a, n, s) => {
    const o = Number(n), r = e.length - s;
    return a + o * (r % 2 === 0 ? 3 : 1);
  }, 0);
  return String((10 - t % 10) % 10);
}
function fs(e) {
  const t = Number(e[0]), a = ds[t];
  let n = "101";
  for (let s = 0; s < 6; s++) {
    const o = Number(e[s + 1]);
    n += a[s] === "L" ? pn[o] : ls[o];
  }
  n += "01010";
  for (let s = 7; s < 13; s++)
    n += fn[Number(e[s])];
  return `${n}101`;
}
function ms(e) {
  let t = "101";
  for (let a = 0; a < 4; a++)
    t += pn[Number(e[a])];
  t += "01010";
  for (let a = 4; a < 8; a++)
    t += fn[Number(e[a])];
  return `${t}101`;
}
function hs(e) {
  return [...e].map((t, a) => (a % 2 === 0 ? "1" : "0").repeat(Number(t))).join("");
}
function Ue(e, t, a, n, s, o, r, i) {
  if (t.error || !t.bits)
    return { svg: "", format: e, modules: "—", value: a || "—", hint: i, error: t.error };
  const c = 10, l = (t.bits.length + c * 2) * n, d = r ? 18 : 0, u = [...t.bits].map((f, m) => f === "1" ? `<rect x="${(m + c) * n}" y="0" width="${n}" height="${s}" fill="${o}"/>` : "").join(""), p = r ? `<text x="${l / 2}" y="${s + 14}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="12" fill="${o}">${na(t.value)}</text>` : "";
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${l}" height="${s + d}" viewBox="0 0 ${l} ${s + d}" role="img" aria-label="${e} ${na(t.value)}">${u}${p}</svg>`,
    format: e,
    modules: String(t.bits.length),
    value: t.value,
    hint: i
  };
}
const Xt = [
  [19, 16, 13, 9],
  [34, 28, 22, 16],
  [55, 44, 34, 26],
  [80, 64, 48, 36]
], bs = [
  [7, 10, 13, 17],
  [10, 16, 22, 28],
  [15, 26, 36, 44],
  [20, 36, 52, 64]
], gs = { L: 0, M: 1, Q: 2, H: 3 }, $s = [1, 0, 3, 2], Qt = new Uint8Array(512), aa = new Uint8Array(256);
(() => {
  let e = 1;
  for (let t = 0; t < 255; t++)
    Qt[t] = e, aa[e] = t, e <<= 1, e & 256 && (e ^= 285);
  for (let t = 255; t < 512; t++)
    Qt[t] = Qt[t - 255];
})();
function We(e, t) {
  return e && t ? Qt[aa[e] + aa[t]] : 0;
}
function ys(e, t) {
  const a = [1];
  for (let s = 0; s < t; s++) {
    a.push(0);
    for (let o = a.length - 1; o > 0; o--)
      a[o] = a[o - 1] ^ We(a[o], Qt[s]);
    a[0] = We(a[0], Qt[s]);
  }
  const n = new Array(t).fill(0);
  for (const s of e) {
    const o = s ^ n[0];
    if (n.shift(), n.push(0), !!o)
      for (let r = 0; r < t; r++)
        n[r] ^= We(a[t - r], o);
  }
  return n;
}
function ma(e, t, a, n = "#0A0B0C", s = 4) {
  const o = /^#[0-9a-fA-F]{6}$/.test(n) ? n : "#0A0B0C", r = Math.max(0, s);
  if (!e.trim())
    return { svg: "", version: "—", modules: "—", bytes: "0", error: "Escribe un texto para generar el código QR." };
  const i = [...new TextEncoder().encode(e)], c = gs[t] ?? 1;
  let l = 0;
  for (; l < Xt.length && i.length + 2 > Xt[l][c] - 2; )
    l += 1;
  l >= Xt.length && (l = Xt.length - 1);
  const d = Xt[l][c], u = i.slice(0, Math.max(0, d - 2)), p = [];
  for (te(p, 4, 4), te(p, u.length, 8), u.forEach((S) => te(p, S, 8)), te(p, 0, Math.min(4, d * 8 - p.length)); p.length % 8; )
    p.push(0);
  const f = [];
  for (let S = 0; S < p.length; S += 8)
    f.push(p.slice(S, S + 8).reduce(($, k) => $ << 1 | k, 0));
  const m = [236, 17];
  for (; f.length < d; )
    f.push(m[f.length - u.length & 1]);
  const b = ys(f, bs[l][c]), h = [...f, ...b], g = 21 + l * 4, w = vs(g, l), v = xs(g, l, w, h, c), E = (g + r * 2) * a;
  let x = "";
  for (let S = 0; S < g; S++)
    for (let $ = 0; $ < g; $++)
      v[S][$] && (x += `<rect x="${($ + r) * a}" y="${(S + r) * a}" width="${a}" height="${a}"/>`);
  const y = i.length > u.length;
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${E}" height="${E}" viewBox="0 0 ${E} ${E}" role="img" aria-label="QR ${na(e)}"><rect width="${E}" height="${E}" fill="#fff"/><g fill="${o}">${x}</g></svg>`,
    version: String(l + 1),
    modules: `${g}×${g}`,
    bytes: String(u.length),
    error: y ? `El texto supera la versión ${l + 1}. Se codificaron ${u.length} de ${i.length} bytes.` : void 0
  };
}
function te(e, t, a) {
  for (let n = a - 1; n >= 0; n--)
    e.push(t >> n & 1);
}
function vs(e, t) {
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
function xs(e, t, a, n, s) {
  let o = [], r = 1 / 0;
  for (let i = 0; i < 8; i++) {
    const c = ws(e, t, a, n, s, i), l = ks(c);
    l < r && (r = l, o = c);
  }
  return o;
}
function ws(e, t, a, n, s, o) {
  const r = Array.from({ length: e }, () => Array(e).fill(!1));
  Ge(r, 0, 0), Ge(r, e - 7, 0), Ge(r, 0, e - 7);
  for (let d = 8; d < e - 8; d++)
    r[6][d] = d % 2 === 0, r[d][6] = d % 2 === 0;
  if (t > 0) {
    const d = 12 + t * 4;
    Ss(r, d, d);
  }
  const i = [];
  n.forEach((d) => te(i, d, 8));
  let c = 0, l = !0;
  for (let d = e - 1; d > 0; d -= 2) {
    d === 6 && (d -= 1);
    for (let u = 0; u < e; u++) {
      const p = l ? e - 1 - u : u;
      for (const f of [d, d - 1]) {
        if (a[p][f])
          continue;
        const m = c < i.length ? i[c] === 1 : !1;
        r[p][f] = Es(p, f, o) ? !m : m, c += 1;
      }
    }
    l = !l;
  }
  return _s(r, e, $s[s], o), r;
}
function Ge(e, t, a) {
  for (let n = 0; n < 7; n++)
    for (let s = 0; s < 7; s++) {
      const o = n === 0 || n === 6 || s === 0 || s === 6, r = n >= 2 && n <= 4 && s >= 2 && s <= 4;
      e[a + n][t + s] = o || r;
    }
}
function Ss(e, t, a) {
  for (let n = -2; n <= 2; n++)
    for (let s = -2; s <= 2; s++)
      e[a + n][t + s] = Math.max(Math.abs(n), Math.abs(s)) !== 1;
}
function Es(e, t, a) {
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
function _s(e, t, a, n) {
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
function ks(e) {
  const t = e.length;
  let a = 0;
  for (let s = 0; s < t; s++)
    a += Ia(e[s]) + Ia(e.map((o) => o[s]));
  for (let s = 0; s < t - 1; s++)
    for (let o = 0; o < t - 1; o++)
      e[s][o] === e[s][o + 1] && e[s][o] === e[s + 1][o] && e[s][o] === e[s + 1][o + 1] && (a += 3);
  let n = 0;
  return e.forEach((s) => s.forEach((o) => {
    o && (n += 1);
  })), a += Math.abs(Math.floor(n * 100 / (t * t) / 5) * 10 - 50), a;
}
function Ia(e) {
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
function na(e) {
  return e.replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t] ?? t);
}
function Ms(e = document) {
  e.querySelectorAll("[data-td-barcode]").forEach(ne), e.querySelectorAll("[data-td-qr]").forEach(Jt), e.querySelectorAll("[data-td-rte]").forEach(Ht);
}
function Ls(e) {
  const t = e.closest("[data-td-rte-cmd]");
  if (t instanceof HTMLButtonElement) {
    const M = t.closest("[data-td-rte]");
    return M?.querySelector("[data-td-rte-edit]")?.focus(), document.execCommand(t.dataset.tdRteCmd ?? "bold"), Ht(M), !0;
  }
  const a = e.closest("[data-td-rte-color]");
  if (a instanceof HTMLButtonElement)
    return document.execCommand("foreColor", !1, a.dataset.tdRteColor), Ht(a.closest("[data-td-rte]")), !0;
  const n = e.closest("[data-td-rte-source]");
  if (n instanceof HTMLButtonElement)
    return Ts(n.closest("[data-td-rte]")), !0;
  const s = e.closest("[data-td-rte-link]");
  if (s instanceof HTMLElement) {
    const M = s.closest("[data-td-rte]")?.querySelector("[data-td-rte-linkbar]");
    return M && (M.hidden = !M.hidden, M.querySelector("input")?.focus()), !0;
  }
  const o = e.closest("[data-td-rte-link-apply]");
  if (o instanceof HTMLElement) {
    const M = o.closest("[data-td-rte]"), H = M?.querySelector("[data-td-rte-url]")?.value ?? "";
    H && document.execCommand("createLink", !1, H);
    const P = M?.querySelector("[data-td-rte-linkbar]");
    return P && (P.hidden = !0), Ht(M), !0;
  }
  const r = e.closest("[data-td-rte-link-remove]");
  if (r instanceof HTMLElement) {
    document.execCommand("unlink");
    const M = r.closest("[data-td-rte]")?.querySelector("[data-td-rte-linkbar]");
    return M && (M.hidden = !0), Ht(r.closest("[data-td-rte]")), !0;
  }
  const i = e.closest("[data-td-rte-link-cancel]");
  if (i instanceof HTMLElement) {
    const M = i.closest("[data-td-rte]")?.querySelector("[data-td-rte-linkbar]");
    return M && (M.hidden = !0), !0;
  }
  const c = e.closest("[data-td-sign-clear]");
  if (c instanceof HTMLElement) {
    const M = c.closest("[data-td-sign]"), H = M?.querySelector("canvas"), P = H?.getContext("2d");
    H && P && P.clearRect(0, 0, H.width, H.height);
    const lt = M?.querySelector("[data-td-sign-value]");
    return lt && (lt.value = ""), !0;
  }
  const l = e.closest("[data-td-gallery-prev]");
  if (l instanceof HTMLElement)
    return Oa(l.closest("[data-td-gallery]"), -1), !0;
  const d = e.closest("[data-td-gallery-next]");
  if (d instanceof HTMLElement)
    return Oa(d.closest("[data-td-gallery]"), 1), !0;
  const u = e.closest("[data-td-gallery-thumb]");
  if (u instanceof HTMLElement)
    return hn(u.closest("[data-td-gallery]"), Number(u.getAttribute("data-td-gallery-thumb") ?? 0)), !0;
  const p = e.closest("[data-td-menu-open]");
  if (p instanceof HTMLButtonElement) {
    const M = p.parentElement?.querySelector(".td-menu__drop"), H = !!M?.hidden;
    return Gt(), M && (M.hidden = !H, p.setAttribute("aria-expanded", String(H))), !0;
  }
  const f = e.closest("[data-td-profile-open]");
  if (f instanceof HTMLButtonElement) {
    const M = f.parentElement?.querySelector("[data-td-profile-menu]"), H = !!M?.hidden;
    return Gt(), M && (M.hidden = !H, f.setAttribute("aria-expanded", String(H))), !0;
  }
  const m = e.closest("[data-td-pmenu-collapse]");
  if (m instanceof HTMLElement)
    return m.closest("[data-td-pmenu]")?.classList.toggle("is-collapsed"), !0;
  const b = e.closest("[data-td-ddtree-open]");
  if (b instanceof HTMLButtonElement) {
    const H = b.closest("[data-td-ddtree]")?.querySelector("[data-td-ddtree-panel]");
    if (H) {
      const P = H.hidden;
      Gt(), H.hidden = !P, b.setAttribute("aria-expanded", String(P));
    }
    return !0;
  }
  const h = e.closest("[data-td-ddtree-twist]");
  if (h instanceof HTMLButtonElement) {
    const M = h.closest("[data-td-ddtree-node]")?.querySelector("[data-td-ddtree-kids]"), H = h.getAttribute("aria-expanded") !== "true";
    return h.setAttribute("aria-expanded", String(H)), h.textContent = H ? "▾" : "▸", M && (M.hidden = !H), !0;
  }
  const g = e.closest("[data-td-ddtree-pick]");
  if (g instanceof HTMLButtonElement)
    return Hs(g), !0;
  const w = e.closest("[data-td-barcode-fmt]");
  if (w instanceof HTMLButtonElement) {
    const M = w.closest("[data-td-barcode]");
    return M && (M.dataset.format = w.dataset.tdBarcodeFmt ?? "code128", M.querySelectorAll("[data-td-barcode-fmt]").forEach((H) => {
      H.classList.toggle("is-on", H === w), H.setAttribute("aria-pressed", String(H === w));
    }), ne(M)), !0;
  }
  const v = e.closest("[data-td-barcode-preset]");
  if (v instanceof HTMLButtonElement) {
    const M = v.closest("[data-td-barcode]"), H = M?.querySelector("[data-td-barcode-text]");
    return M && H && (H.value = v.dataset.tdBarcodePreset ?? "", ne(M)), !0;
  }
  const E = e.closest("[data-td-barcode-color]");
  if (E instanceof HTMLButtonElement) {
    const M = E.closest("[data-td-barcode]");
    return M && (M.dataset.color = E.dataset.tdBarcodeColor ?? "#0A0B0C", M.querySelectorAll("[data-td-barcode-color]").forEach((H) => H.classList.toggle("is-on", H === E)), ne(M)), !0;
  }
  const x = e.closest("[data-td-qr-ecc]");
  if (x instanceof HTMLButtonElement) {
    const M = x.closest("[data-td-qr]");
    return M && (M.dataset.ecc = x.dataset.tdQrEcc ?? "M", M.querySelectorAll("[data-td-qr-ecc]").forEach((H) => H.classList.toggle("is-on", H === x)), Jt(M)), !0;
  }
  const y = e.closest("[data-td-qr-preset]");
  if (y instanceof HTMLButtonElement) {
    const M = y.closest("[data-td-qr]"), H = M?.querySelector("[data-td-qr-text]");
    return M && H && (H.value = y.dataset.tdQrPreset ?? "", Jt(M)), !0;
  }
  const S = e.closest("[data-td-qr-color]");
  if (S instanceof HTMLButtonElement) {
    const M = S.closest("[data-td-qr]");
    return M && (M.dataset.color = S.dataset.tdQrColor ?? "#0A0B0C", M.querySelectorAll("[data-td-qr-color]").forEach((H) => H.classList.toggle("is-on", H === S)), Jt(M)), !0;
  }
  const $ = e.closest("[data-td-qr-quiet]");
  if ($ instanceof HTMLButtonElement) {
    const M = $.closest("[data-td-qr]");
    if (M) {
      const H = $.getAttribute("aria-checked") !== "true";
      $.setAttribute("aria-checked", String(H)), Jt(M);
    }
    return !0;
  }
  const k = e.closest("[data-td-qr-copy],[data-td-qr-png],[data-td-qr-svg],[data-td-barcode-copy],[data-td-barcode-png],[data-td-barcode-svg]");
  if (k instanceof HTMLButtonElement) {
    const M = k.closest("[data-td-qr],[data-td-barcode]");
    return M && js(M, k), !0;
  }
  const N = e.closest("[data-td-image-open]");
  if (N instanceof HTMLElement)
    return N.closest("[data-td-image]")?.querySelector("[data-td-image-dlg]")?.showModal(), !0;
  const O = e.closest("[data-td-image-zoom]");
  if (O instanceof HTMLButtonElement) {
    const M = O.closest("[data-td-image]")?.querySelector("[data-td-image-canvas]");
    if (M) {
      const H = Math.min(4, Math.max(0.6, Number(M.style.getPropertyValue("--z") || 1) + Number(O.dataset.tdImageZoom)));
      M.style.setProperty("--z", String(H));
    }
    return !0;
  }
  const X = e.closest("[data-td-image-rot]");
  if (X instanceof HTMLElement) {
    const M = X.closest("[data-td-image]")?.querySelector("[data-td-image-canvas]");
    if (M) {
      const H = Number((M.style.getPropertyValue("--r") || "0deg").replace("deg", "")) || 0;
      M.style.setProperty("--r", `${(H + 90) % 360}deg`);
    }
    return !0;
  }
  const ct = e.closest("[data-td-image-dl]");
  if (ct instanceof HTMLElement) {
    const M = ct.closest("[data-td-image]")?.querySelector(".td-image__frame"), H = document.createElement("canvas");
    H.width = 640, H.height = 400;
    const P = H.getContext("2d");
    if (P && M) {
      P.fillStyle = M.style.background || "#1F2327", P.fillRect(0, 0, 640, 400);
      const lt = document.createElement("a");
      lt.href = H.toDataURL("image/png"), lt.download = "imagen.png", lt.click();
    }
    return !0;
  }
  return !e.closest("[data-td-menu]") && !e.closest("[data-td-profile]") && !e.closest("[data-td-ddtree]") && !e.closest("[data-td-ctx-menu]") && Gt(), !1;
}
function As(e) {
  if (e instanceof HTMLElement) {
    if (e.matches("[data-td-rte-edit],[data-td-rte-src]")) {
      Ht(e.closest("[data-td-rte]"));
      return;
    }
    if (e.matches("[data-td-rte-block]") && e instanceof HTMLSelectElement) {
      document.execCommand("formatBlock", !1, e.value), Ht(e.closest("[data-td-rte]"));
      return;
    }
    if (e.matches("[data-td-barcode-text],[data-td-barcode-w],[data-td-barcode-h],[data-td-barcode-label]")) {
      const t = e.closest("[data-td-barcode]");
      t && ne(t);
      return;
    }
    if (e.matches("[data-td-qr-text],[data-td-qr-size]")) {
      const t = e.closest("[data-td-qr]");
      t && Jt(t);
      return;
    }
    e.matches("[data-td-ddtree-query]") && e instanceof HTMLInputElement && Ns(e.closest("[data-td-ddtree]"), e.value);
  }
}
function qs(e) {
  const t = e.target;
  if (!(t instanceof Element))
    return;
  const a = t.closest("[data-td-compare-knob]");
  if (a instanceof HTMLElement) {
    const n = a.closest("[data-td-compare]"), s = n?.dataset.vertical === "true", o = e.key === "ArrowRight" || e.key === "ArrowDown" ? 2 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -2 : e.key === "Home" ? -100 : e.key === "End" ? 100 : 0;
    if (o && n) {
      if (s && (e.key === "ArrowLeft" || e.key === "ArrowRight") || !s && (e.key === "ArrowUp" || e.key === "ArrowDown"))
        return;
      e.preventDefault(), mn(n, Number.parseFloat(n.style.getPropertyValue("--pos") || "50") + o);
    }
  }
}
function ha(e) {
  const t = e.target;
  if (!(t instanceof Element))
    return;
  const a = t.closest("[data-td-compare-stage]");
  if (a instanceof HTMLElement && e.type === "pointerdown") {
    const r = a.closest("[data-td-compare]");
    r && (r.dataset.drag = "true", a.setPointerCapture(e.pointerId), Je(r, e));
    return;
  }
  const n = document.querySelector('[data-td-compare][data-drag="true"]');
  if (n && (e.type === "pointermove" || e.type === "pointerup")) {
    Je(n, e), e.type === "pointerup" && delete n.dataset.drag;
    return;
  }
  const s = t.closest('[data-td-compare][data-follow="true"]');
  if (s && e.type === "pointermove") {
    Je(s, e);
    return;
  }
  const o = t.closest("[data-td-sign-canvas]");
  if (o instanceof HTMLCanvasElement) {
    const r = o.closest("[data-td-sign]");
    if (!r)
      return;
    if (e.type === "pointerdown")
      r.dataset.draw = "true", o.setPointerCapture(e.pointerId), Fa(o, e, !0);
    else if (r.dataset.draw === "true" && e.type === "pointermove")
      Fa(o, e, !1);
    else if (e.type === "pointerup") {
      delete r.dataset.draw;
      const i = r.querySelector("[data-td-sign-value]");
      i && (i.value = o.toDataURL("image/png"));
    }
  }
}
function Cs(e) {
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
  Gt(), s.hidden = !1;
  const o = a.getBoundingClientRect();
  s.style.left = `${e.clientX - o.left}px`, s.style.top = `${e.clientY - o.top}px`;
}
function Gt() {
  document.querySelectorAll(".td-menu__drop, [data-td-profile-menu], [data-td-ddtree-panel], [data-td-ctx-menu]").forEach((e) => {
    e.hidden = !0;
  }), document.querySelectorAll("[data-td-menu-open], [data-td-profile-open], [data-td-ddtree-open]").forEach((e) => {
    e.setAttribute("aria-expanded", "false");
  });
}
function Ht(e) {
  if (!(e instanceof HTMLElement))
    return;
  const t = e.querySelector("[data-td-rte-edit]"), a = e.querySelector("[data-td-rte-src]"), n = e.querySelector("[data-td-rte-value]"), s = e.querySelector("[data-td-rte-limit]");
  if (!(!t || !a || !n) && (a.hidden ? a.value = t.innerHTML : t.innerHTML = a.value, n.value = t.innerHTML, s)) {
    const o = Number(s.dataset.max ?? 0), r = t.innerText.trim().length;
    s.textContent = `${r} / ${o}`, s.classList.toggle("is-over", o > 0 && r > o);
  }
}
function Ts(e) {
  if (!(e instanceof HTMLElement))
    return;
  const t = e.querySelector("[data-td-rte-edit]"), a = e.querySelector("[data-td-rte-src]");
  !t || !a || (a.hidden ? (a.value = t.innerHTML, a.hidden = !1, t.hidden = !0) : (t.innerHTML = a.value, a.hidden = !0, t.hidden = !1), Ht(e));
}
function mn(e, t) {
  const a = Math.min(100, Math.max(0, t));
  e.style.setProperty("--pos", `${a}%`), e.querySelector("[data-td-compare-knob]")?.setAttribute("aria-valuenow", String(Math.round(a)));
  const s = e.querySelector("[data-td-compare-pos]");
  s && (s.textContent = `${Math.round(a)}%`);
}
function Je(e, t) {
  const a = e.querySelector("[data-td-compare-stage]");
  if (!(a instanceof HTMLElement))
    return;
  const n = a.getBoundingClientRect(), o = e.dataset.vertical === "true" ? (t.clientY - n.top) / n.height : (t.clientX - n.left) / n.width;
  mn(e, o * 100);
}
function Fa(e, t, a) {
  const n = e.getContext("2d");
  if (!n)
    return;
  const s = e.getBoundingClientRect(), o = (t.clientX - s.left) * (e.width / s.width), r = (t.clientY - s.top) * (e.height / s.height);
  n.strokeStyle = "#0A0B0C", n.lineWidth = 2.4, n.lineCap = "round", n.lineJoin = "round", a ? (n.beginPath(), n.moveTo(o, r)) : (n.lineTo(o, r), n.stroke(), n.beginPath(), n.moveTo(o, r));
}
function Oa(e, t) {
  if (!(e instanceof HTMLElement))
    return;
  e.querySelectorAll(".td-gallery__slide");
  const a = Number(e.dataset.index ?? 0);
  hn(e, a + t);
}
function hn(e, t) {
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
function Hs(e) {
  const t = e.closest("[data-td-ddtree]");
  if (!t)
    return;
  const a = t.getAttribute("data-multiple") === "true", n = e.dataset.tdDdtreePick ?? "";
  if (a) {
    const o = [...t.querySelectorAll("[data-td-ddtree-value]")].find((c) => c.value === n);
    o ? o.remove() : za(t, n);
    const r = t.querySelectorAll("[data-td-ddtree-value]").length, i = t.querySelector(".td-select__text");
    i && (i.textContent = r ? `${r} seleccionadas` : "Elegir categoría", i.classList.toggle("is-placeholder", r === 0));
  } else {
    t.querySelectorAll("[data-td-ddtree-value]").forEach((r) => r.remove()), za(t, n);
    const o = t.querySelector(".td-select__text");
    o && (o.textContent = e.dataset.label ?? n, o.classList.remove("is-placeholder")), Gt();
  }
  const s = new Set([...t.querySelectorAll("[data-td-ddtree-value]")].map((o) => o.value));
  t.querySelectorAll("[data-td-ddtree-pick]").forEach((o) => {
    o.classList.toggle("is-on", s.has(o.dataset.tdDdtreePick ?? ""));
  });
}
function za(e, t) {
  const a = e.querySelector("[data-td-ddtree-value]")?.name ?? "nodo", n = document.createElement("input");
  n.type = "hidden", n.name = a, n.value = t, n.dataset.tdDdtreeValue = "", e.insertBefore(n, e.querySelector("[data-td-ddtree-open]"));
}
function Ns(e, t) {
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
const sa = /* @__PURE__ */ new WeakMap();
function ne(e) {
  const t = e.querySelector("[data-td-barcode-text]")?.value ?? e.dataset.value ?? "", a = e.dataset.format ?? "code128", n = Number(e.querySelector("[data-td-barcode-w]")?.value ?? 2), s = Number(e.querySelector("[data-td-barcode-h]")?.value ?? 80), o = e.dataset.color ?? "#0A0B0C", r = e.querySelector("[data-td-barcode-label]")?.checked ?? !0, i = fa(a, t, n, s, o, r), c = e.querySelector("[data-td-barcode-svg]"), l = e.querySelector("[data-td-barcode-err]");
  c && (c.innerHTML = i.svg), l && (l.hidden = !i.error, l.textContent = i.error ?? ""), Z(e, "[data-td-barcode-meta-fmt]", i.format), Z(e, "[data-td-barcode-meta-mod]", i.modules), Z(e, "[data-td-barcode-meta-val]", i.value), Z(e, "[data-td-barcode-wlabel]", `${n} px`), Z(e, "[data-td-barcode-hlabel]", `${s} px`);
  const d = e.querySelector("[data-td-barcode-hint]");
  d && (d.textContent = i.hint), bn(e, "barcode", i.error ? "" : i.svg, "barcode.png");
}
function Jt(e) {
  const t = e.querySelector("[data-td-qr-text]")?.value ?? e.dataset.value ?? "", a = e.dataset.ecc ?? "M", n = Number(e.querySelector("[data-td-qr-size]")?.value ?? 6), s = e.dataset.color ?? "#0A0B0C", o = e.querySelector("[data-td-qr-quiet]")?.getAttribute("aria-checked") !== "false" ? 4 : 0, r = ma(t, a, n, s, o), i = e.querySelector("[data-td-qr-svg]"), c = e.querySelector("[data-td-qr-err]");
  i && (i.innerHTML = r.svg), c && (c.hidden = !r.error, c.textContent = r.error ?? ""), Z(e, "[data-td-qr-ver]", r.version), Z(e, "[data-td-qr-mod]", r.modules), Z(e, "[data-td-qr-bytes]", r.bytes), Z(e, "[data-td-qr-slabel]", `${n} px`), Z(e, "[data-td-qr-count]", `${[...t].length} caracteres`), bn(e, "qr", r.error && !r.svg ? "" : r.svg, "qr.png");
}
function bn(e, t, a, n) {
  if (!a) {
    sa.delete(e), Z(e, `[data-td-${t}-url]`, "Sin imagen"), Z(e, `[data-td-${t}-urlmeta]`, "Corrige el valor para generar el archivo.");
    const s = e.querySelector(`[data-td-${t}-uses]`);
    s && (s.innerHTML = "");
    return;
  }
  Bs(a).then((s) => {
    if (!e.isConnected)
      return;
    sa.set(e, { svg: a, png: s });
    const o = e.querySelector(`[data-td-${t}-hidden]`);
    o && (o.value = s), Z(e, `[data-td-${t}-url]`, s.length > 72 ? `${s.slice(0, 48)}…${s.slice(-16)}` : s), Z(e, `[data-td-${t}-urlmeta]`, `${Math.max(1, Math.round(s.length * 3 / 4 / 1024))} KB · ${n}`);
    const r = e.querySelector(`[data-td-${t}-uses]`);
    if (r) {
      const i = t === "qr" ? [96, 160, 240] : [72, 96, 128];
      r.innerHTML = i.map((c) => `<img src="${s}" alt="" height="${c}">`).join("");
    }
  }).catch(() => Z(e, `[data-td-${t}-msg]`, "No se pudo preparar el PNG. El SVG sigue disponible."));
}
function Bs(e) {
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
function js(e, t) {
  const a = sa.get(e), n = e.hasAttribute("data-td-qr") ? "qr" : "barcode";
  if (!a) {
    Z(e, `[data-td-${n}-msg]`, "Todavía no hay una imagen para entregar.");
    return;
  }
  const s = t.dataset.tdQrCopy != null || t.hasAttribute("data-td-qr-copy") ? "copy" : t.hasAttribute("data-td-qr-png") || t.hasAttribute("data-td-barcode-png") ? "png" : t.hasAttribute("data-td-qr-svg") || t.hasAttribute("data-td-barcode-svg") ? "svg" : t.hasAttribute("data-td-barcode-copy") ? "copy" : "", o = n === "qr" ? "qr" : "barcode";
  if (s === "png") {
    Va(a.png, `${o}.png`), Z(e, `[data-td-${n}-msg]`, "PNG descargado.");
    return;
  }
  if (s === "svg") {
    Va(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(a.svg)}`, `${o}.svg`), Z(e, `[data-td-${n}-msg]`, "SVG descargado.");
    return;
  }
  navigator.clipboard?.writeText(a.png).then(
    () => Z(e, `[data-td-${n}-msg]`, "Data URL copiada. Puedes pegarla en un src de imagen."),
    () => Z(e, `[data-td-${n}-msg]`, "No se pudo copiar. Descarga el PNG.")
  );
}
function Va(e, t) {
  const a = document.createElement("a");
  a.href = e, a.download = t, a.click();
}
function Z(e, t, a) {
  const n = e.querySelector(t);
  n && (n.textContent = a);
}
const Dt = ["var(--td-color-primary)", "var(--td-color-text)", "var(--td-color-info)", "var(--td-color-success)", "var(--td-color-warning)", "#9CA3AB"], ba = "var(--td-color-text-muted)", D = "var(--td-color-text)", xt = "var(--td-color-border)", Lt = "var(--td-color-success)", Et = "var(--td-color-danger)", Ds = /* @__PURE__ */ new Set(["chwf", "chfunnel", "chpareto", "chtree", "chradar", "chsankey", "chbullet", "chgantt", "chforecast", "chvariance", "chquadrant", "chcohort", "chmekko", "chslope", "chdumbbell", "chcontrol"]);
function W(e) {
  return `$ ${(Math.round(e * 10) / 10).toLocaleString("es-CL")} M`;
}
function q(e, t, a, n = {}) {
  return `<text x="${e.toFixed(1)}" y="${t.toFixed(1)}" font-size="${n.fs ?? 11.5}" fill="${n.fill ?? ba}" font-family="${n.ff ?? "var(--td-font-family)"}" text-anchor="${n.a ?? "middle"}" font-weight="${n.fw ?? 400}" pointer-events="none">${a}</text>`;
}
function At(e, t) {
  return e == null || e === t ? 1 : 0.4;
}
function it(e, t, a, n, s, o, r, i) {
  return `<div class="td-chart__head"><strong>${e}</strong><em>${t}</em></div>
        <svg viewBox="0 0 ${n} ${s}" width="100%" role="img" aria-label="${o}" data-ch-plot>${a}</svg>
        <p class="td-chart__read" role="status">${r}</p>
        <ul class="td-chart__ins">${i.map((c) => `<li>${c}</li>`).join("")}</ul>`;
}
function Ps() {
  let e = 11;
  const t = () => (e = (e * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 30 }, (a, n) => Math.round((22 + (t() - 0.5) * 7 + (n === 17 ? 11 : 0) + (n > 23 ? 2.2 : 0)) * 10) / 10);
}
function Rs(e) {
  const t = [["Ventas", 84, "t"], ["Costo repuestos", -46.2], ["Flete", -6.2], ["Descuentos", -3.4], ["Devoluciones", -1.5], ["Otros ingresos", 1.3], ["Margen bruto", 0, "t"]];
  let a = 0;
  const n = t.map(([h, g, w]) => {
    if (w) {
      const E = h === "Ventas" ? g : a;
      return a = E, { name: h, a: 0, b: E, value: E, total: !0 };
    }
    const v = a;
    return a += g, { name: h, a: v, b: a, value: g, total: !1 };
  }), s = 760, o = 340, r = 50, i = 14, c = 46, l = o - i - c, d = 90, u = (s - r - 10) / n.length, p = (h) => i + l - h / d * l;
  let f = "";
  for (let h = 0; h <= d; h += 15)
    f += `<line x1="${r}" x2="${s - 10}" y1="${p(h)}" y2="${p(h)}" stroke="${xt}" stroke-dasharray="${h ? "3 4" : ""}"></line>${q(r - 8, p(h) + 4, String(h), { a: "end", ff: "var(--td-font-mono)", fs: 11 })}`;
  n.forEach((h, g) => {
    const w = r + g * u + u * 0.15, v = u * 0.7, E = p(Math.max(h.a, h.b)), x = Math.abs(p(h.a) - p(h.b)), y = h.total ? D : h.value < 0 ? Et : Lt, S = String(g);
    f += `<rect data-ch-hov="${S}" x="${w}" y="${E}" width="${v}" height="${Math.max(1, x)}" rx="2" fill="${y}" opacity="${At(e, S)}"></rect>`, f += q(w + v / 2, E - 6, `${h.total ? "" : h.value > 0 ? "+" : "−"}${Math.abs(h.value).toLocaleString("es-CL")}`, { ff: "var(--td-font-mono)", fw: 700, fill: D });
    const $ = h.name.split(" ");
    f += q(w + v / 2, o - c + 18, $[0], { fs: 11 }), f += q(w + v / 2, o - c + 32, $.slice(1).join(" "), { fs: 11 }), g < n.length - 1 && (f += `<line x1="${w + v}" x2="${w + u}" y1="${p(h.b)}" y2="${p(h.b)}" stroke="var(--td-color-border-strong)" stroke-dasharray="2 3"></line>`);
  });
  const m = e == null ? null : n[Number(e)], b = m ? `${m.name} · ${m.total ? W(m.value) : `${m.value > 0 ? "+" : "−"}${W(Math.abs(m.value))} · acumulado ${W(m.b)}`}` : "Pasa el mouse sobre el gráfico";
  return it("Puente de margen · septiembre 2026", "millones CLP", f, s, o, "Waterfall de margen", b, [
    `Margen bruto ${W(n[6].value)} (${Math.round(n[6].value / 84 * 100)}% de las ventas)`,
    `Mayor fuga: flete, ${W(6.2)} (7,4%)`,
    `Devoluciones bajaron a ${W(1.5)}`
  ]);
}
function Is(e) {
  const t = [["Visitas", 48200], ["Búsqueda de repuesto", 21300], ["Ficha técnica", 9840], ["Carrito", 3120], ["Cotización", 1460], ["Pedido", 1284]], a = 760, n = 360, s = 300, o = 520, r = 54, i = 6;
  let c = "";
  t.forEach(([u, p], f) => {
    const m = o * Math.sqrt(p / t[0][1]), b = f < t.length - 1 ? o * Math.sqrt(t[f + 1][1] / t[0][1]) : m * 0.92, h = 10 + f * (r + i), g = String(f), w = f === t.length - 1 ? "var(--td-color-primary)" : `color-mix(in srgb, var(--td-color-text) ${85 - f * 13}%, var(--td-color-surface))`;
    c += `<path data-ch-hov="${g}" d="M${s - m / 2},${h} L${s + m / 2},${h} L${s + b / 2},${h + r} L${s - b / 2},${h + r} Z" fill="${w}" opacity="${At(e, g)}"></path>`, c += q(s, h + r / 2 + 5, p.toLocaleString("es-CL"), { fs: 15, fw: 800, fill: f > 2 && f < t.length - 1 ? D : "#fff", ff: "var(--td-font-display)" }), c += q(s + o / 2 + 20, h + 22, u, { a: "start", fs: 13, fw: 600, fill: D }), c += q(s + o / 2 + 20, h + 40, f ? `${Math.round(p / t[f - 1][1] * 1e3) / 10}% del paso anterior` : "100%", { a: "start", fs: 11.5, ff: "var(--td-font-mono)" });
  });
  const l = e == null ? null : t[Number(e)], d = l ? `${l[0]} · ${l[1].toLocaleString("es-CL")} · ${Math.round(l[1] / t[0][1] * 1e3) / 10}% de las visitas${Number(e) ? ` · perdidos en este paso ${(t[Number(e) - 1][1] - l[1]).toLocaleString("es-CL")}` : ""}` : "Pasa el mouse sobre el gráfico";
  return it("Embudo de conversión · tienda web · septiembre", "sesiones", c, a, n, "Embudo de conversión", d, [
    "Conversión total 2,66%",
    "Mayor caída: Ficha técnica → Carrito (−68%)",
    "Cotización → Pedido cierra al 88%"
  ]);
}
function Fs(e) {
  const t = [["Pastillas", 34], ["Filtros", 28], ["Discos", 22], ["Amortig.", 18], ["Turbo", 16], ["Neumático", 14], ["Embragues", 13], ["Refriger.", 12], ["Alternad.", 11], ["Muelles", 9], ["Ilumin.", 7], ["Sensores", 6], ["Correas", 5], ["Bujes", 4]], a = t.reduce((v, E) => v + E[1], 0), n = 780, s = 340, o = 44, r = 44, i = 14, c = 44, l = n - o - r, d = s - i - c, u = l / t.length, p = 40;
  let f = 0;
  const m = [];
  let b = `<line x1="${o}" x2="${n - r}" y1="${i + d * 0.2}" y2="${i + d * 0.2}" stroke="var(--td-color-warning)" stroke-dasharray="5 4"></line>${q(n - r + 4, i + d * 0.2 + 4, "80%", { a: "start", ff: "var(--td-font-mono)", fs: 11, fill: "var(--td-color-warning)" })}`;
  for (let v = 0; v <= p; v += 10) {
    const E = i + d - v / p * d;
    b += `<line x1="${o}" x2="${n - r}" y1="${E}" y2="${E}" stroke="${xt}" stroke-dasharray="${v ? "3 4" : ""}"></line>${q(o - 8, E + 4, String(v), { a: "end", ff: "var(--td-font-mono)", fs: 11 })}`;
  }
  t.forEach(([v, E], x) => {
    const y = f;
    f += E;
    const S = y / a < 0.8 ? "A" : y / a < 0.95 ? "B" : "C", $ = o + x * u + u * 0.14, k = E / p * d, N = String(x), O = S === "A" ? "var(--td-color-primary)" : S === "B" ? D : "#9CA3AB";
    b += `<rect data-ch-hov="${N}" x="${$}" y="${i + d - k}" width="${u * 0.72}" height="${k}" rx="2" fill="${O}" opacity="${At(e, N)}"></rect>`, b += q($ + u * 0.36, s - c + 16, v, { fs: 10.5 }), b += q($ + u * 0.36, s - c + 30, S, { fs: 10.5, fw: 700, ff: "var(--td-font-mono)", fill: D }), m.push([o + x * u + u / 2, i + d - f / a * d]);
  }), b += `<path d="${m.map((v, E) => `${E ? "L" : "M"}${v[0]},${v[1]}`).join(" ")}" fill="none" stroke="var(--td-color-info)" stroke-width="2.5"></path>`, m.forEach((v, E) => {
    b += `<circle cx="${v[0]}" cy="${v[1]}" r="${e === String(E) ? 5 : 3}" fill="var(--td-color-info)"></circle>`;
  }), [0, 50, 100].forEach((v) => {
    b += q(n - r + 8, i + d - v / 100 * d + 4, `${v}%`, { a: "start", ff: "var(--td-font-mono)", fs: 11, fill: "var(--td-color-info)" });
  });
  const h = e == null ? -1 : Number(e), g = h < 0 ? "Pasa el mouse sobre el gráfico" : `${t[h][0]} · ${W(t[h][1])} · ${Math.round(t[h][1] / a * 100)}% · acumulado ${Math.round(t.slice(0, h + 1).reduce((v, E) => v + E[1], 0) / a * 100)}%`, w = t.filter((v, E) => t.slice(0, E).reduce((x, y) => x + y[1], 0) / a < 0.8).length;
  return it("Ventas por familia · clasificación ABC", "millones CLP · acumulado en %", b, n, s, "Pareto ABC", g, [
    `Clase A: ${w} de ${t.length} familias generan el 80% de la venta`,
    "Prioriza stock de seguridad en clase A",
    "Clase C candidata a venta bajo pedido"
  ]);
}
function Os(e) {
  const t = [["Frenos", [["Pastillas", 34], ["Discos", 22], ["Neumático", 14], ["Sensores", 6]]], ["Motor", [["Filtros", 28], ["Turbo", 16], ["Refrigeración", 12]]], ["Suspensión", [["Amortiguadores", 18], ["Muelles", 9]]], ["Eléctrico", [["Alternadores", 11], ["Iluminación", 7]]], ["Transmisión", [["Embragues", 13]]]], a = (l) => l.reduce((d, u) => d + u[1], 0), n = t.reduce((l, d) => l + a(d[1]), 0), s = 780, o = 380;
  let r = 0, i = "";
  t.forEach(([l, d], u) => {
    const p = s * a(d) / n;
    let f = 0;
    const m = a(d);
    d.forEach(([b, h], g) => {
      const w = o * h / m, v = `${u}-${g}`;
      i += `<rect data-ch-hov="${v}" x="${r + 1}" y="${f + 1}" width="${p - 2}" height="${w - 2}" fill="${Dt[u]}" fill-opacity="${0.92 - g * 0.18}" stroke="var(--td-color-surface)" stroke-width="2" opacity="${At(e, v)}"></rect>`, p > 90 && w > 44 && (i += q(r + 10, f + 22, b, { a: "start", fs: 13, fw: 700, fill: "#fff" }), i += q(r + 10, f + 40, W(h), { a: "start", fs: 11.5, ff: "var(--td-font-mono)", fill: "rgba(255,255,255,.85)" })), f += w;
    }), i += p > 70 ? q(r + p / 2, o + 18, l, { fs: 12, fw: 700, fill: D }) : q(Math.min(s - 2, r + p), o + 18, l, { fs: 12, fw: 700, fill: D, a: "end" }), r += p;
  });
  let c = "Pasa el mouse sobre el gráfico";
  if (e) {
    const [l, d] = e.split("-").map(Number), u = t[l], p = u[1][d];
    c = `${u[0]} › ${p[0]} · ${W(p[1])} · ${Math.round(p[1] / n * 100)}% del total · ${Math.round(p[1] / a(u[1]) * 100)}% de ${u[0]}`;
  }
  return it("Valor de venta por categoría y subcategoría", "área proporcional · millones CLP", i, s, o + 26, "Treemap", c, [
    `Frenos concentra el ${Math.round(a(t[0][1]) / n * 100)}% del valor`,
    "Pastillas es la subcategoría más grande",
    "Transmisión depende de un solo producto"
  ]);
}
function zs(e) {
  const t = ["Precio", "Plazo", "Calidad", "Stock", "Garantía", "Soporte"], a = [["Volvo Parts", [6, 7, 9.5, 8, 9, 8]], ["Bosch", [7.5, 8.5, 8.5, 9, 7, 7]], ["Genérico", [9.5, 6, 5.5, 7, 4, 5]]], n = 230, s = 190, o = 150, r = (d, u) => {
    const p = -Math.PI / 2 + d * 2 * Math.PI / t.length;
    return [n + Math.cos(p) * o * u / 10, s + Math.sin(p) * o * u / 10];
  };
  let i = "";
  [2, 4, 6, 8, 10].forEach((d) => {
    i += `<polygon points="${t.map((u, p) => r(p, d).join(",")).join(" ")}" fill="none" stroke="${xt}"></polygon>`;
  }), t.forEach((d, u) => {
    const p = r(u, 10), f = r(u, 11.6);
    i += `<line x1="${n}" y1="${s}" x2="${p[0]}" y2="${p[1]}" stroke="${xt}"></line>${q(f[0], f[1] + 4, d, { fs: 12.5, fw: 600, fill: D })}`;
  }), a.forEach(([, d], u) => {
    const p = Dt[[0, 2, 1][u]], f = String(u);
    i += `<polygon data-ch-hov="${f}" points="${d.map((m, b) => r(b, m).join(",")).join(" ")}" fill="${p}" fill-opacity="${e === f ? 0.3 : 0.1}" stroke="${p}" stroke-width="${e === f ? 3 : 2}"></polygon>`, d.forEach((m, b) => {
      const h = r(b, m);
      i += `<circle cx="${h[0]}" cy="${h[1]}" r="3.5" fill="${p}" pointer-events="none"></circle>`;
    });
  }), a.forEach(([d], u) => {
    const p = (a[u][1].reduce((f, m) => f + m, 0) / 6).toFixed(1).replace(".", ",");
    i += `<rect x="470" y="${60 + u * 30}" width="12" height="12" rx="3" fill="${Dt[[0, 2, 1][u]]}"></rect>${q(490, 71 + u * 30, d, { a: "start", fs: 13, fw: 600, fill: D })}${q(640, 71 + u * 30, p, { a: "end", fs: 13, ff: "var(--td-font-mono)", fw: 700, fill: D })}`;
  });
  const c = e == null ? null : a[Number(e)], l = c ? `${c[0]} · ${t.map((d, u) => `${d} ${String(c[1][u]).replace(".", ",")}`).join(" · ")}` : "Pasa el mouse sobre el gráfico";
  return it("Evaluación de proveedores · frenos", "puntaje 0–10", i, 660, 380, "Radar de proveedores", l, [
    "Volvo Parts lidera en calidad y garantía",
    "Bosch tiene el mejor plazo y stock",
    "Genérico: más barato pero débil en garantía y soporte"
  ]);
}
function Vs(e) {
  const t = ["Quilicura", "Concepción", "Antofagasta"], a = ["Metropolitana", "Centro", "Sur", "Norte"], n = [[320, 120, 40, 40], [30, 60, 150, 20], [20, 10, 10, 170]], s = 760, o = 380, r = n.flat().reduce((x, y) => x + y, 0), i = 14, c = (o - 20 - i * 3) / r, l = 16, d = 150, u = s - 170, p = t.map((x, y) => n[y].reduce((S, $) => S + $, 0)), f = a.map((x, y) => n.reduce((S, $) => S + $[y], 0)), m = [];
  let b = 10;
  p.forEach((x) => {
    m.push(b), b += x * c + i;
  });
  const h = [];
  b = 10, f.forEach((x) => {
    h.push(b), b += x * c + i;
  });
  const g = m.slice(), w = h.slice();
  let v = "";
  n.forEach((x, y) => x.forEach((S, $) => {
    const k = S * c, N = g[y] + k / 2, O = w[$] + k / 2, X = (d + l + u) / 2, ct = `${y}-${$}`, M = e == null ? 0.35 : e === ct ? 0.7 : 0.1;
    v += `<path data-ch-hov="${ct}" d="M${d + l},${N} C${X},${N} ${X},${O} ${u},${O}" fill="none" stroke="${Dt[[0, 2, 3][y]]}" stroke-width="${Math.max(1, k)}" stroke-opacity="${M}"></path>`, g[y] += k, w[$] += k;
  })), t.forEach((x, y) => {
    v += `<rect x="${d}" y="${m[y]}" width="${l}" height="${p[y] * c}" rx="2" fill="${Dt[[0, 2, 3][y]]}"></rect>`, v += q(d - 10, m[y] + p[y] * c / 2, x, { a: "end", fs: 13, fw: 700, fill: D }), v += q(d - 10, m[y] + p[y] * c / 2 + 16, `${p[y]} pedidos`, { a: "end", fs: 11, ff: "var(--td-font-mono)" });
  }), a.forEach((x, y) => {
    v += `<rect x="${u}" y="${h[y]}" width="${l}" height="${f[y] * c}" rx="2" fill="${D}"></rect>`, v += q(u + l + 10, h[y] + f[y] * c / 2, x, { a: "start", fs: 13, fw: 700, fill: D }), v += q(u + l + 10, h[y] + f[y] * c / 2 + 16, `${f[y]} pedidos`, { a: "start", fs: 11, ff: "var(--td-font-mono)" });
  });
  let E = "Pasa el mouse sobre el gráfico";
  if (e?.includes("-") && t[Number(e.split("-")[0])]) {
    const [x, y] = e.split("-").map(Number), S = n[x][y];
    E = `${t[x]} → ${a[y]} · ${S} pedidos · ${Math.round(S / p[x] * 100)}% de ${t[x]} · ${Math.round(S / f[y] * 100)}% de lo recibido en ${a[y]}`;
  }
  return it("Flujo de despachos · bodega → región · septiembre", "pedidos", v, s, o, "Sankey de despachos", E, [
    "Quilicura abastece el 86% de la Región Metropolitana",
    "Concepción cubre el 75% del Sur",
    "40 pedidos cruzan de Quilicura al Norte: evaluar stock en Antofagasta"
  ]);
}
function Us(e) {
  const t = [["Ventas", "M CLP", 84, 90, [60, 80, 100]], ["Pedidos", "miles", 1.28, 1.2, [0.8, 1.1, 1.5]], ["OTIF", "%", 92, 95, [80, 90, 100]], ["Margen", "%", 33, 35, [25, 32, 40]], ["NPS", "pts", 48, 55, [30, 50, 70]]], a = 760, n = 58, s = 150;
  let o = "";
  t.forEach(([c, l, d, u, p], f) => {
    const m = 10 + f * n, b = a - s - 70, h = p[2], g = (E) => s + E / h * b;
    [...p].reverse().forEach((E, x) => {
      o += `<rect x="${s}" y="${m}" width="${g(E) - s}" height="30" fill="color-mix(in srgb, var(--td-color-text) ${[10, 18, 28][x]}%, var(--td-color-surface))"></rect>`;
    });
    const w = d >= u, v = String(f);
    o += `<rect data-ch-hov="${v}" x="${s}" y="${m + 10}" width="${g(d) - s}" height="10" fill="${w ? Lt : "var(--td-color-primary)"}" opacity="${At(e, v)}"></rect>`, o += `<line x1="${g(u)}" x2="${g(u)}" y1="${m + 3}" y2="${m + 27}" stroke="${D}" stroke-width="3"></line>`, o += q(s - 12, m + 14, c, { a: "end", fs: 13.5, fw: 700, fill: D }), o += q(s - 12, m + 29, l, { a: "end", fs: 11, ff: "var(--td-font-mono)" }), o += q(a - 60, m + 20, String(d).replace(".", ","), { a: "start", fs: 14, fw: 800, fill: w ? Lt : D, ff: "var(--td-font-display)" });
  });
  const r = e == null ? null : t[Number(e)], i = r ? `${r[0]} · ${String(r[2]).replace(".", ",")} ${r[1]} · meta ${String(r[3]).replace(".", ",")} · ${r[2] >= r[3] ? "cumple (+" : "falta ("}${Math.round((r[2] / r[3] - 1) * 1e3) / 10}%)` : "Pasa el mouse sobre el gráfico";
  return it("KPIs del mes contra meta", "barra = actual · marca = meta · bandas = malo / aceptable / bueno", o, a, 10 + t.length * n, "Bullet chart de KPIs", i, [
    "Cumplen meta: Pedidos",
    "Más lejos de la meta: NPS (−13%)",
    "Cinco indicadores en el espacio de un gráfico"
  ]);
}
function Ws(e) {
  const t = ["Lun 22", "Mar 23", "Mié 24", "Jue 25", "Vie 26", "Sáb 27"], a = [["Picking OC-00498", 0, 1.5, 100, 0], ["Carga camión CBTR-45", 1, 0.5, 100, 1], ["Ruta Norte · Antofagasta", 1.5, 2.5, 55, 2], ["Picking OC-00503/504", 2, 1, 40, 0], ["Ruta Sur · Concepción", 2.5, 2, 10, 2], ["Inventario cíclico A", 3, 2, 0, 3], ["Entrega Minera Los Robles", 4, 1, 0, 2]], n = 780, s = 210, o = 38, r = 30, i = (n - s - 10) / t.length, c = 2.45, l = r + a.length * o + 6;
  let d = "";
  t.forEach((p, f) => {
    d += `<rect x="${s + f * i}" y="${r}" width="${i}" height="${a.length * o}" fill="${f % 2 ? "transparent" : "var(--td-color-surface-secondary)"}"></rect>`, d += q(s + f * i + i / 2, 18, p, { fs: 12, fw: 600, fill: f === 2 ? "var(--td-color-primary)" : ba });
  }), a.forEach(([p, f, m, b, h], g) => {
    const w = r + g * o + 8, v = s + f * i, E = m * i, x = Dt[[0, 1, 2, 3][h]], y = String(g);
    d += q(s - 12, w + 16, p, { a: "end", fs: 12.5, fw: 600, fill: D }), d += `<rect data-ch-hov="${y}" x="${v}" y="${w}" width="${E}" height="22" rx="4" fill="${x}" fill-opacity="0.22" stroke="${x}" opacity="${At(e, y)}"></rect>`, d += `<rect x="${v}" y="${w}" width="${E * b / 100}" height="22" rx="4" fill="${x}" pointer-events="none"></rect>`, d += q(v + E + 6, w + 15, `${b}%`, { a: "start", fs: 11, ff: "var(--td-font-mono)", fill: D });
  }), d += `<line x1="${s + c * i}" x2="${s + c * i}" y1="${r - 4}" y2="${l}" stroke="var(--td-color-primary)" stroke-width="2"></line>${q(s + c * i, l + 14, "Hoy", { fs: 11, fw: 700, fill: "var(--td-color-primary)" })}`;
  let u = "Pasa el mouse sobre el gráfico";
  if (e != null && a[Number(e)]) {
    const [p, f, m, b] = a[Number(e)], h = (g) => `${t[Math.floor(g)]} ${g % 1 ? "14:00" : "08:00"}`;
    u = `${p} · ${h(f)} → ${h(Math.min(f + m, 5.99))} · ${m * 24 >= 24 ? `${String(m).replace(".", ",")} días` : `${m * 24} h`} · avance ${b}%`;
  }
  return it("Programación de despachos · semana 39", "barra = duración · relleno = avance", d, n, l + 20, "Gantt de despachos", u, [
    "2 tareas completadas, 3 en curso",
    "Ruta Sur va atrasada respecto a hoy (10%)",
    "Viernes: entrega crítica a Minera Los Robles"
  ]);
}
function Gs(e) {
  const t = ["Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"], a = [61, 64, 70, 60, 62, 64, 66, 71, 72, 76, 80, 84], n = [86, 89, 95], s = [60, 62, 66, 62, 63, 65, 68, 70, 73, 75, 78, 80, 83, 86, 90], o = 780, r = 340, i = 44, c = 14, l = 32, d = o - i - 16, u = r - c - l, p = t.length, f = (x) => i + x * d / (p - 1), m = 40, b = 120, h = (x) => c + u - (x - m) / (b - m) * u, g = a.length - 1;
  let w = "";
  for (let x = m; x <= b; x += 20)
    w += `<line x1="${i}" x2="${o - 16}" y1="${h(x)}" y2="${h(x)}" stroke="${xt}" stroke-dasharray="3 4"></line>${q(i - 8, h(x) + 4, String(x), { a: "end", ff: "var(--td-font-mono)", fs: 11 })}`;
  const v = (x) => {
    const y = [[f(g), h(a[g])], ...n.map(($, k) => [f(g + 1 + k), h($ + (k + 1) * x)])], S = [...n.map(($, k) => [f(g + 1 + k), h($ - (k + 1) * x)])].reverse();
    return `M${y.map(($) => $.join(",")).join(" L")} L${S.map(($) => $.join(",")).join(" L")} L${f(g)},${h(a[g])} Z`;
  };
  w += `<rect x="${f(g)}" y="${c}" width="${f(p - 1) - f(g)}" height="${u}" fill="var(--td-color-surface-secondary)"></rect>${q((f(g) + f(p - 1)) / 2, c + 14, "Pronóstico", { fs: 11, fw: 700 })}`, w += `<path d="${v(3.2 * 1.96)}" fill="var(--td-color-primary)" fill-opacity="0.1"></path><path d="${v(3.2 * 1.28)}" fill="var(--td-color-primary)" fill-opacity="0.18"></path>`, w += `<path d="${s.map((x, y) => `${y ? "L" : "M"}${f(y)},${h(x)}`).join(" ")}" fill="none" stroke="${ba}" stroke-width="2" stroke-dasharray="6 5"></path>`, w += `<path d="${a.map((x, y) => `${y ? "L" : "M"}${f(y)},${h(x)}`).join(" ")}" fill="none" stroke="${D}" stroke-width="2.75"></path>`, w += `<path d="M${f(g)},${h(a[g])}${n.map((x, y) => ` L${f(g + 1 + y)},${h(x)}`).join("")}" fill="none" stroke="var(--td-color-primary)" stroke-width="2.75" stroke-dasharray="2 5" stroke-linecap="round"></path>`, t.forEach((x, y) => {
    const S = y > g, $ = S ? n[y - g - 1] : a[y];
    w += q(f(y), r - 10, x, { fs: 11 }), w += `<circle cx="${f(y)}" cy="${h($)}" r="${e === String(y) ? 6 : 3.5}" fill="${S ? "var(--td-color-primary)" : D}"></circle>`, w += `<rect data-ch-hov="${y}" x="${f(y) - d / (p - 1) / 2}" y="${c}" width="${d / (p - 1)}" height="${u}" fill="transparent"></rect>`;
  });
  let E = "Pasa el mouse sobre el gráfico";
  if (e != null) {
    const x = Number(e), y = x > g, S = y ? n[x - g - 1] : a[x], $ = 1.96 * 3.2 * (x - g);
    E = `${t[x]} · ${y ? `pronóstico ${W(S)} (95 %: ${W(S - $)}–${W(S + $)})` : `real ${W(S)}`} · presupuesto ${W(s[x])} · brecha ${S >= s[x] ? "+" : ""}${W(S - s[x])}`;
  }
  return it("Ventas mensuales · real, pronóstico y presupuesto", "millones CLP · bandas 80 % y 95 %", w, o, r, "Pronóstico de ventas", E, [
    `Cierre de año proyectado: ${W(n.reduce((x, y) => x + y, 0))} en el trimestre`,
    `Diciembre supera el presupuesto en ${W(5)}`,
    `Riesgo bajo: el peor escenario al 95 % sigue sobre ${W(Math.round(95 - 1.96 * 3.2 * 3))}`
  ]);
}
function Js(e) {
  const t = [["Repuestos frenos", 42.1, 38], ["Repuestos motor", 29.4, 31], ["Servicio técnico", 12.8, 10.5], ["E-commerce", 9.6, 12], ["Logística", -8.9, -7.5], ["Marketing", -3.1, -3.4], ["Personal", -18.2, -17.6], ["Arriendo bodegas", -6, -6]].map(([p, f, m]) => ({ name: String(p), real: Number(f), budget: Number(m), delta: Number(f) - Number(m) })).sort((p, f) => Math.abs(f.delta) - Math.abs(p.delta)), a = 780, n = 36, s = 200, o = 480, r = 60, i = 20 + t.length * n + 40;
  let c = `<line x1="${o}" x2="${o}" y1="8" y2="${i - 30}" stroke="${D}"></line>${q(o - 120, 14, "← Bajo presupuesto", { fs: 11, fw: 600, fill: Et })}${q(o + 120, 14, "Sobre presupuesto →", { fs: 11, fw: 600, fill: Lt })}`;
  t.forEach((p, f) => {
    const m = 24 + f * n, b = Math.abs(p.delta) * r, h = p.delta >= 0, g = String(f);
    c += q(s - 12, m + 16, p.name, { a: "end", fs: 13, fw: 600, fill: D }), c += q(s - 12, m + 30, `real ${W(p.real)} · ppto ${W(p.budget)}`, { a: "end", fs: 10.5, ff: "var(--td-font-mono)" }), c += `<rect data-ch-hov="${g}" x="${h ? o : o - b}" y="${m + 4}" width="${Math.max(2, b)}" height="22" rx="3" fill="${h ? Lt : Et}" opacity="${At(e, g)}"></rect>`, c += q(h ? o + b + 6 : o - b - 6, m + 19, `${h ? "+" : "−"}${Math.abs(p.delta).toFixed(1).replace(".", ",")}`, { a: h ? "start" : "end", fs: 12, ff: "var(--td-font-mono)", fw: 700, fill: D });
  });
  const l = t.reduce((p, f) => p + f.delta, 0);
  c += `<line x1="${s - 180}" x2="${a - 10}" y1="${i - 34}" y2="${i - 34}" stroke="${xt}"></line>`, c += q(s - 12, i - 12, "Resultado neto vs presupuesto", { a: "end", fs: 13, fw: 800, fill: D }), c += q(o + (l >= 0 ? 8 : -8), i - 12, `${l >= 0 ? "+" : "−"}${W(Math.abs(l))}`, { a: l >= 0 ? "start" : "end", fs: 14, fw: 800, fill: l >= 0 ? Lt : Et, ff: "var(--td-font-display)" });
  const d = e == null ? null : t[Number(e)], u = d ? `${d.name} · real ${W(d.real)} · presupuesto ${W(d.budget)} · desviación ${d.delta >= 0 ? "+" : "−"}${W(Math.abs(d.delta))} (${Math.round(d.delta / Math.abs(d.budget) * 100)}%)` : "Pasa el mouse sobre el gráfico";
  return it("Resultado por área · real vs presupuesto · septiembre", "desviación en millones CLP, ordenada por impacto", c, a, i, "Varianza contra presupuesto", u, [
    `Frenos explica la mayor parte del sobrecumplimiento (+${W(4.1)})`,
    "E-commerce 20% bajo lo presupuestado: revisar campañas",
    `Logística se excede en ${W(1.4)} por fletes al Norte`
  ]);
}
function Qs(e) {
  const t = [["Pastillas", 18, 38, 34], ["Filtros", 6, 42, 28], ["Discos", 12, 31, 22], ["Turbo", 24, 27, 16], ["Amortiguadores", 9, 22, 18], ["Embragues", -4, 35, 13], ["Alternadores", 15, 18, 11], ["Iluminación", 31, 24, 7], ["Correas", -8, 16, 5], ["Bujes", -2, 12, 4], ["Sensores", 38, 44, 6]], a = 780, n = 400, s = 50, o = 16, r = 40, i = a - s - 20, c = n - o - r, l = (g) => s + (g + 15) / 60 * i, d = (g) => o + c - (g - 5) / 45 * c, u = l(10), p = d(30), f = [
    [s, o, u - s, p - o, "Mantener", "Rentable, crece poco"],
    [u, o, a - 20 - u, p - o, "Invertir", "Crece y es rentable"],
    [s, p, u - s, o + c - p, "Revisar / salir", "Poco margen, sin crecimiento"],
    [u, p, a - 20 - u, o + c - p, "Mejorar margen", "Crece con margen bajo"]
  ];
  let m = "";
  f.forEach(([g, w, v, E, ,], x) => {
    m += `<rect x="${g}" y="${w}" width="${v}" height="${E}" fill="${x === 1 ? "color-mix(in srgb, var(--td-color-success) 7%, transparent)" : x === 2 ? "color-mix(in srgb, var(--td-color-danger) 6%, transparent)" : "transparent"}"></rect>`;
  }), m += `<line x1="${u}" x2="${u}" y1="${o}" y2="${o + c}" stroke="var(--td-color-border-strong)" stroke-dasharray="5 4"></line><line x1="${s}" x2="${a - 20}" y1="${p}" y2="${p}" stroke="var(--td-color-border-strong)" stroke-dasharray="5 4"></line>`, [-10, 0, 10, 20, 30, 40].forEach((g) => {
    m += q(l(g), o + c + 18, `${g}%`, { ff: "var(--td-font-mono)", fs: 11 });
  }), [10, 20, 30, 40, 50].forEach((g) => {
    m += q(s - 8, d(g) + 4, `${g}%`, { a: "end", ff: "var(--td-font-mono)", fs: 11 });
  }), m += q(s + i, n - 4, "Crecimiento anual →", { a: "end", fs: 11 }) + q(s + 4, o + 4, "↑ Margen", { a: "start", fs: 11 }), t.forEach(([g, w, v, E], x) => {
    const y = w >= 10 && v >= 30 ? 3 : w < 10 && v >= 30 ? 1 : w >= 10 ? 2 : 0, S = [Et, D, "var(--td-color-info)", Lt][y], $ = String(x);
    m += `<circle data-ch-hov="${$}" cx="${l(w)}" cy="${d(v)}" r="${6 + Math.sqrt(E) * 3.2}" fill="${S}" fill-opacity="0.28" stroke="${S}" stroke-width="2" opacity="${At(e, $)}"></circle>`, m += q(l(w), d(v) + 4, g, { fs: 11, fw: 700, fill: D });
  }), f.forEach(([g, w, v, E, x, y], S) => {
    const $ = S < 2, k = S % 2 ? g + v - 10 : g + 10, N = S % 2 ? "end" : "start";
    m += q(k, $ ? w + 18 : w + E - 22, x, { a: N, fs: 13, fw: 800, fill: D }), m += q(k, $ ? w + 33 : w + E - 8, y, { a: N, fs: 11 });
  });
  const b = e == null ? null : t[Number(e)], h = b ? `${b[0]} · crecimiento ${b[1]}% · margen ${b[2]}% · venta ${W(b[3])} · ${b[1] >= 10 && b[2] >= 30 ? "Invertir" : b[1] < 10 && b[2] >= 30 ? "Mantener" : b[1] >= 10 ? "Mejorar margen" : "Revisar / salir"}` : "Pasa el mouse sobre el gráfico";
  return it("Portafolio de familias · crecimiento vs margen", "tamaño = venta anual", m, a, n, "Matriz de portafolio", h, [
    "Invertir: Pastillas, Sensores y Discos",
    "Turbo e Iluminación crecen con margen bajo: renegociar costos",
    "Correas y Bujes: candidatos a salir o vender bajo pedido"
  ]);
}
function Ks(e) {
  const t = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep"], a = [42, 38, 51, 47, 55, 49, 60, 58, 64], n = [100, 78, 69, 63, 60, 57, 55, 54, 53], s = 780, o = 120, r = 40, i = (s - o - 10) / 9, c = 34, l = r + t.length * c + 10;
  let d = "";
  for (let p = 0; p < 9; p += 1)
    d += q(o + p * i + i / 2, r - 12, `Mes ${p}`, { fs: 11, fw: 600 });
  t.forEach((p, f) => {
    d += q(o - 12, r + f * c + 15, `${p} 2026`, { a: "end", fs: 12.5, fw: 700, fill: D }), d += q(o - 12, r + f * c + 28, `${a[f]} clientes`, { a: "end", fs: 10.5, ff: "var(--td-font-mono)" });
    for (let m = 0; m < 9 - f; m += 1) {
      const b = m ? Math.max(30, Math.round(n[m] + f * 1.6 + (f * 3 + m) % 4 - 1.5)) : 100, h = (b - 30) / 70, g = `${f}-${m}`;
      d += `<rect data-ch-hov="${g}" x="${o + m * i + 2}" y="${r + f * c + 2}" width="${i - 4}" height="${c - 4}" rx="3" fill="color-mix(in srgb, var(--td-color-primary) ${Math.round(8 + h * 88)}%, var(--td-color-surface))" stroke="${e === g ? D : "none"}" stroke-width="2"></rect>`, d += q(o + m * i + i / 2, r + f * c + c / 2 + 4, `${b}%`, { fs: 11.5, ff: "var(--td-font-mono)", fw: 600, fill: h > 0.55 ? "#fff" : D });
    }
  });
  let u = "Pasa el mouse sobre el gráfico";
  if (e?.includes("-")) {
    const [p, f] = e.split("-").map(Number);
    u = `Cohorte ${t[p]} · mes ${f} · ${f ? `retención aprox. ${Math.round(n[f] + p * 1.6)}%` : "100% (alta)"} · ${a[p]} clientes iniciales`;
  }
  return it("Retención de clientes por cohorte de alta", "% de clientes que vuelve a comprar cada mes", d, s, l, "Cohortes de retención", u, [
    "La mayor caída ocurre en el primer mes (−22 pp)",
    "Las cohortes recientes retienen mejor: el onboarding de flota funciona",
    "Retención estable en torno al 53% desde el mes 6"
  ]);
}
function Zs(e) {
  const t = [["Metropolitana", [42, 28, 16, 14]], ["Centro", [35, 30, 20, 15]], ["Sur", [30, 26, 26, 18]], ["Norte", [48, 24, 12, 16]]], a = ["Frenos", "Motor", "Suspensión", "Otros"], n = [410, 180, 150, 140], s = n.reduce((m, b) => m + b, 0), o = 780, r = 360, i = 40, c = 10, l = o - i - 110, d = r - c - 40;
  let u = i, p = "";
  t.forEach(([, m], b) => {
    const h = l * n[b] / s;
    let g = c;
    m.forEach((w, v) => {
      const E = d * w / 100, x = `${b}-${v}`;
      p += `<rect data-ch-hov="${x}" x="${u + 1}" y="${g + 1}" width="${h - 2}" height="${E - 2}" fill="${Dt[v]}" fill-opacity="0.9" opacity="${At(e, x)}"></rect>`, E > 22 && h > 60 && (p += q(u + h / 2, g + E / 2 + 4, `${w}%`, { fs: 12, fw: 700, ff: "var(--td-font-mono)", fill: v <= 1 ? "#fff" : "#0A0B0C" })), g += E;
    }), p += q(u + h / 2, r - 22, t[b][0], { fs: 12, fw: 700, fill: D }), p += q(u + h / 2, r - 8, `${W(n[b])} · ${Math.round(n[b] / s * 100)}%`, { fs: 10.5, ff: "var(--td-font-mono)" }), u += h;
  }), [0, 25, 50, 75, 100].forEach((m) => {
    p += q(i - 6, c + d - m / 100 * d + 4, `${m}%`, { a: "end", fs: 10.5, ff: "var(--td-font-mono)" });
  }), a.forEach((m, b) => {
    p += `<rect x="${o - 100}" y="${20 + b * 24}" width="12" height="12" rx="3" fill="${Dt[b]}"></rect>${q(o - 82, 31 + b * 24, m, { a: "start", fs: 12.5, fw: 600, fill: D })}`;
  });
  let f = "Pasa el mouse sobre el gráfico";
  if (e?.includes("-")) {
    const [m, b] = e.split("-").map(Number), h = t[m][1][b];
    f = `${t[m][0]} › ${a[b]} · ${h}% de la región · ${W(n[m] * h / 100)} · ${Math.round(n[m] * h / s)}% del total país`;
  }
  return it("Mezcla de venta · región × categoría", "ancho = venta de la región · alto = % por categoría", p, o, r, "Marimekko", f, [
    "Metropolitana es el 47% de la venta",
    "El Norte depende de Frenos (48%): minería",
    "El Sur tiene la mezcla más equilibrada"
  ]);
}
function Xs(e) {
  const t = [["Quilicura", 214, 262], ["Concepción", 118, 131], ["Antofagasta", 96, 128], ["Puerto Montt", 71, 69], ["Temuco", 52, 74], ["La Serena", 64, 58], ["Rancagua", 40, 55]], a = 700, n = 400, s = 200, o = 500, r = 30, i = 280, c = (w) => 20 + (i - w) / (i - r) * (n - 40), l = (w) => t.map((v, E) => [E, v[w]]).sort((v, E) => E[1] - v[1]).map((v) => v[0]), d = l(1), u = l(2), p = (w) => {
    const v = w.map((x, y) => ({ y: x, index: y })).sort((x, y) => x.y - y.y);
    for (let x = 0; x < 30; x += 1)
      for (let y = 1; y < v.length; y += 1) {
        const S = v[y].y - v[y - 1].y;
        if (S < 15) {
          const $ = (15 - S) / 2;
          v[y].y += $, v[y - 1].y -= $;
        }
      }
    const E = [];
    return v.forEach((x) => {
      E[x.index] = x.y;
    }), E;
  }, f = p(t.map((w) => c(w[1]))), m = p(t.map((w) => c(w[2])));
  let b = `${q(s, 14, "2025", { fs: 13, fw: 800, fill: D })}${q(o, 14, "2026", { fs: 13, fw: 800, fill: D })}<line x1="${s}" x2="${s}" y1="22" y2="${n - 10}" stroke="${xt}"></line><line x1="${o}" x2="${o}" y1="22" y2="${n - 10}" stroke="${xt}"></line>`;
  t.forEach(([w, v, E], x) => {
    const y = E >= v, S = y ? Lt : Et, $ = Math.abs(E / v - 1) > 0.2, k = String(x);
    b += `<line data-ch-hov="${k}" x1="${s}" y1="${c(v)}" x2="${o}" y2="${c(E)}" stroke="${$ || e === k ? S : "var(--td-color-border-strong)"}" stroke-width="${e === k ? 4 : $ ? 3 : 2}"></line>`, b += `<circle cx="${s}" cy="${c(v)}" r="5" fill="${D}"></circle><circle cx="${o}" cy="${c(E)}" r="5" fill="${S}"></circle>`, b += `<line x1="${s - 6}" y1="${c(v)}" x2="${s - 12}" y2="${f[x]}" stroke="${xt}"></line><line x1="${o + 6}" y1="${c(E)}" x2="${o + 12}" y2="${m[x]}" stroke="${xt}"></line>`, b += q(s - 14, f[x] + 4, `#${d.indexOf(x) + 1} ${w}  ${v}`, { a: "end", fs: 12, fw: 600, fill: D }), b += q(o + 14, m[x] + 4, `${E}  ${w} #${u.indexOf(x) + 1}  ${y ? "+" : ""}${Math.round((E / v - 1) * 100)}%`, { a: "start", fs: 12, fw: 600, fill: D });
  });
  const h = e == null ? null : t[Number(e)], g = h ? `${h[0]} · ${W(h[1])} → ${W(h[2])} · ${h[2] >= h[1] ? "+" : ""}${Math.round((h[2] / h[1] - 1) * 100)}% · posición #${d.indexOf(Number(e)) + 1} → #${u.indexOf(Number(e)) + 1}` : "Pasa el mouse sobre el gráfico";
  return it("Venta por sucursal · 2025 vs 2026 (ene–sep)", "millones CLP · # = posición", b, a, n, "Slope chart", g, [
    "Antofagasta sube al #3 con +33%",
    "Temuco es la de mayor crecimiento (+42%)",
    "La Serena y Puerto Montt caen: revisar cobertura comercial"
  ]);
}
function Ys(e) {
  const t = [["Metropolitana", 1.9, 1.1], ["Valparaíso", 2.6, 1.6], ["O’Higgins", 2.8, 1.9], ["Biobío", 3.4, 2.1], ["Araucanía", 4.1, 2.6], ["Los Lagos", 4.8, 3.3], ["Antofagasta", 5.2, 2.9], ["Atacama", 4.6, 3.8]], a = 760, n = 38, s = 170, o = a - s - 70, r = 6, i = (p) => s + p / r * o, c = 30 + t.length * n + 40;
  let l = "";
  for (let p = 0; p <= r; p += 1)
    l += `<line x1="${i(p)}" x2="${i(p)}" y1="20" y2="${c - 40}" stroke="${xt}" stroke-dasharray="${p ? "3 4" : ""}"></line>${q(i(p), c - 24, `${p} d`, { fs: 11, ff: "var(--td-font-mono)" })}`;
  l += `<line x1="${i(2)}" x2="${i(2)}" y1="14" y2="${c - 40}" stroke="var(--td-color-warning)" stroke-width="2" stroke-dasharray="5 4"></line>${q(i(2) + 4, 12, "SLA 2 días", { a: "start", fs: 11, fw: 700, fill: "var(--td-color-warning)" })}`, t.forEach(([p, f, m], b) => {
    const h = 34 + b * n, g = String(b);
    l += q(s - 12, h + 4, p, { a: "end", fs: 13, fw: 600, fill: D }), l += `<line data-ch-hov="${g}" x1="${i(m)}" x2="${i(f)}" y1="${h}" y2="${h}" stroke="${e === g ? D : "var(--td-color-border-strong)"}" stroke-width="4"></line>`, l += `<circle cx="${i(f)}" cy="${h}" r="7" fill="#9CA3AB"></circle><circle cx="${i(m)}" cy="${h}" r="7" fill="${m <= 2 ? Lt : "var(--td-color-primary)"}"></circle>`, l += q(i(f) + 12, h + 4, `−${Math.round((1 - m / f) * 100)}%`, { a: "start", fs: 11.5, ff: "var(--td-font-mono)", fw: 700, fill: D });
  }), l += `<circle cx="${a - 230}" cy="${c - 6}" r="5" fill="#9CA3AB"></circle>${q(a - 220, c - 2, "Antes (2025)", { a: "start", fs: 11 })}`, l += `<circle cx="${a - 120}" cy="${c - 6}" r="5" fill="var(--td-color-primary)"></circle>${q(a - 110, c - 2, "Después (2026)", { a: "start", fs: 11 })}`;
  const d = e == null ? null : t[Number(e)], u = d ? `${d[0]} · ${String(d[1]).replace(".", ",")} → ${String(d[2]).replace(".", ",")} días · mejora ${Math.round((1 - d[2] / d[1]) * 100)}% · ${d[2] <= 2 ? "cumple SLA" : `fuera de SLA por ${String(Math.round((d[2] - 2) * 10) / 10).replace(".", ",")} d`}` : "Pasa el mouse sobre el gráfico";
  return it("Tiempo de entrega por región · antes y después del plan", "días promedio", l, a, c, "Dumbbell de tiempos de entrega", u, [
    "Mejora promedio del 38%",
    "Antofagasta: la mayor mejora (−44%) tras abrir bodega",
    "Atacama y Los Lagos siguen fuera del SLA"
  ]);
}
function to(e, t) {
  const a = t.reduce((y, S) => y + S, 0) / t.length, n = Math.sqrt(t.reduce((y, S) => y + (S - a) ** 2, 0) / t.length), s = a + 3 * n, o = Math.max(0, a - 3 * n), r = 780, i = 320, c = 46, l = 14, d = 30, u = r - c - 104, p = i - l - d, f = 5, m = 40, b = (y) => c + y * u / (t.length - 1), h = (y) => l + p - (y - f) / (m - f) * p;
  let g = `<rect x="${c}" y="${h(s)}" width="${u}" height="${h(o) - h(s)}" fill="color-mix(in srgb, var(--td-color-success) 6%, transparent)"></rect>`;
  [[s, "LCS", Et, 0], [a, "Media", D, 1], [o, "LCI", Et, 2]].forEach(([y, S, $, k]) => {
    g += `<line x1="${c}" x2="${c + u}" y1="${h(Number(y))}" y2="${h(Number(y))}" stroke="${$}" stroke-width="${k === 1 ? 2 : 1.5}" stroke-dasharray="${k === 1 ? "" : "6 4"}"></line>`, g += q(c + u + 6, h(Number(y)) + 4, `${S} ${Number(y).toFixed(1).replace(".", ",")}`, { a: "start", fs: 11, ff: "var(--td-font-mono)", fw: 700, fill: String($) });
  }), [10, 20, 30, 40].forEach((y) => {
    g += q(c - 8, h(y) + 4, `${y} h`, { a: "end", fs: 11, ff: "var(--td-font-mono)" });
  }), g += `<path d="${t.map((y, S) => `${S ? "L" : "M"}${b(S)},${h(y)}`).join(" ")}" fill="none" stroke="${D}" stroke-width="2"></path>`;
  let w = 0;
  const v = t.map((y) => (w = y > a ? w + 1 : 0, w >= 6));
  t.forEach((y, S) => {
    const $ = y > s || y < o, k = String(S), N = $ ? Et : v[S] ? "var(--td-color-warning)" : D;
    g += `<circle data-ch-hov="${k}" cx="${b(S)}" cy="${h(y)}" r="${e === k ? 7 : $ ? 6 : 4}" fill="${$ ? Et : v[S] ? "var(--td-color-warning)" : "var(--td-color-surface)"}" stroke="${N}" stroke-width="2"></circle>`, S % 5 === 0 && (g += q(b(S), i - 8, `${S + 1} sep`, { fs: 10.5, ff: "var(--td-font-mono)" }));
  });
  let E = "Pasa el mouse sobre el gráfico";
  if (e != null) {
    const y = Number(e), S = t[y], $ = S > s || S < o ? "FUERA DE CONTROL" : v[y] ? "tendencia: 6+ días sobre la media" : "en control";
    E = `${y + 1} sep · ${String(S).replace(".", ",")} h · ${$} · desvío ${((S - a) / n).toFixed(1).replace(".", ",")}σ`;
  }
  const x = t.map((y, S) => y > s || y < o ? S + 1 : 0).filter(Boolean);
  return it("Tiempo de preparación de pedidos · control estadístico", "horas por día · límites ±3σ", g, r, i, "Gráfico de control", E, [
    x.length ? `Fuera de control el ${x.join(", ")} sep: investigar causa` : "Proceso en control",
    "Desde el 24 sep: tendencia sobre la media (regla de 6 puntos)",
    `Media ${a.toFixed(1).replace(".", ",")} h · σ ${n.toFixed(1).replace(".", ",")} h`
  ]);
}
function eo(e, t, a) {
  if (!Ds.has(e))
    return null;
  switch (e) {
    case "chwf":
      return Rs(t);
    case "chfunnel":
      return Is(t);
    case "chpareto":
      return Fs(t);
    case "chtree":
      return Os(t);
    case "chradar":
      return zs(t);
    case "chsankey":
      return Vs(t);
    case "chbullet":
      return Us(t);
    case "chgantt":
      return Ws(t);
    case "chforecast":
      return Gs(t);
    case "chvariance":
      return Js(t);
    case "chquadrant":
      return Qs(t);
    case "chcohort":
      return Ks(t);
    case "chmekko":
      return Zs(t);
    case "chslope":
      return Xs(t);
    case "chdumbbell":
      return Ys(t);
    case "chcontrol":
      return to(t, a);
    default:
      return null;
  }
}
const wt = ["var(--td-color-primary)", "var(--td-color-text)", "var(--td-color-info)", "var(--td-color-success)", "var(--td-color-warning)", "#9CA3AB"], vt = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep"], Mt = [
  ["Frenos", [18, 21, 19, 24, 26, 25, 29, 31, 34]],
  ["Motor", [14, 15, 17, 16, 18, 20, 19, 22, 23]],
  ["Suspensión", [9, 10, 9, 11, 12, 12, 13, 14, 15]],
  ["Eléctrico", [6, 7, 8, 7, 9, 9, 10, 11, 12]]
], ve = [50, 52, 54, 56, 60, 62, 66, 70, 74], ga = 720, de = 320, ut = 56, ao = 16, et = 16, no = 34, kt = ga - ut - ao, Q = de - et - no;
function Ce(e) {
  const t = Math.max(e, 1), a = Math.pow(10, Math.floor(Math.log10(t))), n = t / a, o = (n <= 1 ? 0.2 : n <= 2 ? 0.5 : n <= 5 ? 1 : 2) * a;
  return { max: Math.ceil(t / o) * o, step: o };
}
function _t(e) {
  return `$ ${(Math.round(e * 10) / 10).toLocaleString("es-CL")} M`;
}
function gn(e) {
  return e.map((t, a) => {
    if (!a)
      return `M${t[0]},${t[1]}`;
    const n = e[a - 2] || e[a - 1], s = e[a - 1], o = e[a + 1] || t, r = s[0] + (t[0] - n[0]) / 6, i = s[1] + (t[1] - n[1]) / 6, c = t[0] - (o[0] - s[0]) / 6, l = t[1] - (o[1] - s[1]) / 6;
    return `C${r.toFixed(1)},${i.toFixed(1)} ${c.toFixed(1)},${l.toFixed(1)} ${t[0].toFixed(1)},${t[1].toFixed(1)}`;
  }).join(" ");
}
function Ua(e, t) {
  const a = new Blob(["\uFEFF" + t.map((s) => s.join(";")).join(`\r
`)], { type: "text/csv;charset=utf-8" }), n = document.createElement("a");
  n.href = URL.createObjectURL(a), n.download = `${e}.csv`, n.click(), URL.revokeObjectURL(n.href);
}
function Te(e, t, a) {
  return `<div class="td-chart__seg" role="group">${t.map(
    ([n, s]) => `<button type="button" data-ch-key="${e}" data-ch-value="${n}" aria-pressed="${String(a === n)}">${s}</button>`
  ).join("")}</div>`;
}
function He(e, t, a) {
  return `<button type="button" class="td-switch" role="switch" data-ch-toggle="${e}" aria-checked="${t}"><i></i>${a}</button>`;
}
function $n(e, t) {
  return `<div class="td-chart__legend">${e.map((a, n) => {
    const s = t.includes(a);
    return `<button type="button" data-ch-legend="${a}" aria-pressed="${!s}" style="opacity:${s ? 0.4 : 1};text-decoration:${s ? "line-through" : "none"}"><i style="background:${wt[n]}"></i>${a}</button>`;
  }).join("")}</div>`;
}
function $a(e, t, a) {
  let n = "";
  for (let s = 0; s <= e + 1e-9; s += t) {
    const o = et + Q - s / e * Q;
    n += `<line x1="${ut}" x2="${ut + kt}" y1="${o}" y2="${o}" stroke="var(--td-color-border)" stroke-dasharray="${s ? "3 4" : ""}"></line>`, n += `<text x="${ut - 8}" y="${o + 4}" text-anchor="end" font-size="11" fill="var(--td-color-text-muted)" font-family="var(--td-font-mono)">${a(s)}</text>`;
  }
  return n;
}
function ya(e, t = de, a = "Gráfico") {
  return `<svg viewBox="0 0 ${ga} ${t}" width="100%" role="img" aria-label="${a}" data-ch-plot>${e}</svg>`;
}
function so(e) {
  const t = Mt.filter((u) => !e.hidden.includes(u[0])), a = Ce(Math.max(1, ...t.flatMap((u) => u[1])) * 1.08), n = vt.length, s = (u) => ut + u * (kt / (n - 1)), o = (u) => et + Q - u / a.max * Q;
  let r = $a(a.max, a.step, (u) => String(u));
  r += vt.map((u, p) => `<text x="${s(p)}" y="${et + Q + 22}" text-anchor="middle" font-size="11.5" fill="var(--td-color-text-muted)">${u}</text>`).join(""), e.hov != null && (r += `<line x1="${s(e.hov)}" x2="${s(e.hov)}" y1="${et}" y2="${et + Q}" stroke="var(--td-color-border-strong)"></line>`), Mt.forEach(([u, p], f) => {
    if (e.hidden.includes(u))
      return;
    const m = p.map((h, g) => [s(g), o(h)]);
    let b = "";
    e.lType === "step" ? b = m.map((h, g) => g ? `H${h[0]} V${h[1]}` : `M${h[0]},${h[1]}`).join(" ") : b = e.smooth ? gn(m) : m.map((h, g) => `${g ? "L" : "M"}${h[0]},${h[1]}`).join(" "), e.lType === "area" && (r += `<path d="${b} L${s(n - 1)},${et + Q} L${ut},${et + Q} Z" fill="${wt[f]}" opacity="${f ? 0.08 : 0.16}"></path>`), r += `<path d="${b}" fill="none" stroke="${wt[f]}" stroke-width="${f ? 2 : 2.75}" stroke-linejoin="round" stroke-linecap="round"></path>`, e.markers && m.forEach((h, g) => {
      r += `<circle cx="${h[0]}" cy="${h[1]}" r="${e.hov === g ? 5 : 3.2}" fill="var(--td-color-surface)" stroke="${wt[f]}" stroke-width="2"></circle>`;
    });
  });
  const i = vt.map((u, p) => Mt.reduce((f, m) => f + m[1][p], 0)), c = i.indexOf(Math.max(...i)), l = [
    ["Total 2026", _t(i.reduce((u, p) => u + p, 0))],
    ["Mejor mes", `${vt[c]} · ${_t(i[c])}`],
    ["Crecimiento Ene→Sep", `+${Math.round((i[8] / i[0] - 1) * 100)}%`]
  ], d = e.hov == null ? "Pasa el mouse sobre el gráfico para ver cada mes" : `${vt[e.hov]} 2026 · ${t.map((u) => `${u[0]} ${_t(u[1][e.hov])}`).join(" · ")} · Total ${_t(t.reduce((u, p) => u + p[1][e.hov], 0))}`;
  return `<div class="td-chart__kpis">${l.map(([u, p]) => `<div><span>${u}</span><strong>${p}</strong></div>`).join("")}</div>
        <div class="td-chart__tools">${Te("lType", [["line", "Línea"], ["area", "Área"], ["step", "Escalón"]], e.lType)}${He("smooth", e.smooth, "Suavizado")}${He("markers", e.markers, "Marcadores")}<span></span><button type="button" class="td-btn td-btn--secondary td-btn--sm" data-ch-export="ventas">Exportar CSV</button></div>
        <div class="td-chart__head"><strong>Ventas por categoría · 2026</strong><em>millones CLP</em></div>
        ${$n(Mt.map((u) => u[0]), e.hidden)}
        ${ya(r, de, "Ventas por categoría")}
        <p class="td-chart__read" role="status">${d}</p>`;
}
function oo(e) {
  const t = Mt.filter((u) => !e.hidden.includes(u[0])), a = e.cOri === "h", n = vt.map((u, p) => t.reduce((f, m) => f + m[1][p], 0)), s = e.cMode === "pct" ? 100 : e.cMode === "stack" ? Math.max(...n, e.target ? Math.max(...ve) : 0) : Math.max(1, ...t.flatMap((u) => u[1])), o = e.cMode === "pct" ? { max: 100, step: 20 } : Ce(s * 1.08), r = (a ? Q : kt) / vt.length, i = r * 0.62;
  let c = "";
  if (!a)
    c += $a(o.max, o.step, (u) => e.cMode === "pct" ? `${u}%` : String(u));
  else
    for (let u = 0; u <= o.max + 1e-9; u += o.step) {
      const p = ut + u / o.max * kt;
      c += `<line x1="${p}" x2="${p}" y1="${et}" y2="${et + Q}" stroke="var(--td-color-border)" stroke-dasharray="${u ? "3 4" : ""}"></line>`, c += `<text x="${p}" y="${et + Q + 18}" text-anchor="middle" font-size="11" fill="var(--td-color-text-muted)" font-family="var(--td-font-mono)">${e.cMode === "pct" ? `${u}%` : u}</text>`;
    }
  if (vt.forEach((u, p) => {
    const f = (a ? et : ut) + r * p + r / 2;
    c += a ? `<text x="${ut - 8}" y="${f + 4}" text-anchor="end" font-size="11.5" fill="var(--td-color-text-muted)">${u}</text>` : `<text x="${f}" y="${et + Q + 22}" text-anchor="middle" font-size="11.5" fill="var(--td-color-text-muted)">${u}</text>`;
    let m = 0;
    t.forEach(([b, h]) => {
      const g = Mt.findIndex((k) => k[0] === b), w = h[p], v = e.cMode === "pct" ? w / n[p] * 100 : w;
      let E = 0, x = 0, y = 0, S = 0;
      if (e.cMode === "group") {
        const k = i / t.length, N = t.findIndex((O) => O[0] === b);
        a ? (x = f - i / 2 + N * k, S = k - 2, E = ut, y = v / o.max * kt) : (E = f - i / 2 + N * k, y = k - 2, S = v / o.max * Q, x = et + Q - S);
      } else a ? (x = f - i / 2, S = i, E = ut + m / o.max * kt, y = v / o.max * kt, m += v) : (E = f - i / 2, y = i, S = v / o.max * Q, x = et + Q - m / o.max * Q - S, m += v);
      const $ = e.hov == null || e.hov === p ? 1 : 0.45;
      c += `<rect data-ch-col="${p}" x="${E}" y="${x}" width="${Math.max(0, y)}" height="${Math.max(0, S)}" rx="1.5" fill="${wt[g]}" opacity="${$}"></rect>`;
    });
  }), e.target && e.cMode === "stack" && !a) {
    const u = ve.map((p, f) => [ut + r * f + r / 2, et + Q - p / o.max * Q]);
    c += `<path d="${u.map((p, f) => `${f ? "L" : "M"}${p[0]},${p[1]}`).join(" ")}" fill="none" stroke="var(--td-color-warning)" stroke-width="2.5" stroke-dasharray="6 5"></path>`, u.forEach((p) => {
      c += `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="var(--td-color-warning)"></circle>`;
    });
  }
  const l = e.hov == null ? "Pasa el mouse sobre una columna" : `${vt[e.hov]} · ${t.map((u) => `${u[0]} ${e.cMode === "pct" ? `${Math.round(u[1][e.hov] / n[e.hov] * 100)}%` : _t(u[1][e.hov])}`).join(" · ")} · Total ${_t(n[e.hov])}${e.target && e.cMode === "stack" ? ` · Meta ${_t(ve[e.hov])} ${n[e.hov] >= ve[e.hov] ? "✓" : "✗"}` : ""}`, d = e.target && e.cMode === "stack" && !a ? '<span class="td-chart__meta"><i></i>Meta</span>' : "";
  return `<div class="td-chart__tools">${Te("cOri", [["v", "Columnas"], ["h", "Barras"]], e.cOri)}${Te("cMode", [["group", "Agrupadas"], ["stack", "Apiladas"], ["pct", "100 %"]], e.cMode)}${He("target", e.target, "Línea de meta")}<span></span><button type="button" class="td-btn td-btn--secondary td-btn--sm" data-ch-export="ventas">Exportar CSV</button></div>
        ${$n(Mt.map((u) => u[0]), e.hidden)}${d}
        ${ya(c, de, "Columnas de ventas")}
        <p class="td-chart__read" role="status">${l}</p>`;
}
function ro(e) {
  const t = [["Quilicura", 128], ["Concepción", 64], ["Antofagasta", 55], ["Puerto Montt", 34], ["En tránsito", 24]], a = t.reduce((d, u) => d + u[1], 0), n = 160, s = 150, o = 120, r = e.pDonut ? 72 : 0;
  let i = -Math.PI / 2, c = "";
  if (t.forEach(([d, u], p) => {
    const f = i + u / a * Math.PI * 2, m = (i + f) / 2, b = e.pHov === p, h = b ? 8 : 0, g = Math.cos(m) * h, w = Math.sin(m) * h, v = f - i > Math.PI ? 1 : 0, E = ($, k) => [n + g + Math.cos($) * k, s + w + Math.sin($) * k], x = E(i, o), y = E(f, o), S = r ? `M${x} A${o},${o} 0 ${v} 1 ${y} L${E(f, r)} A${r},${r} 0 ${v} 0 ${E(i, r)} Z` : `M${n + g},${s + w} L${x} A${o},${o} 0 ${v} 1 ${y} Z`;
    if (c += `<path data-ch-pie="${p}" d="${S}" fill="${wt[p]}" stroke="var(--td-color-surface)" stroke-width="2" opacity="${e.pHov == null || b ? 1 : 0.5}"></path>`, u / a > 0.07) {
      const $ = E(m, r ? (o + r) / 2 : o * 0.62);
      c += `<text x="${$[0]}" y="${$[1] + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="${p <= 1 ? "#fff" : "#0A0B0C"}" font-family="var(--td-font-mono)">${Math.round(u / a * 100)}%</text>`;
    }
    i = f;
  }), r) {
    const d = e.pHov == null ? null : t[e.pHov];
    c += `<text x="${n}" y="${s - 4}" text-anchor="middle" font-size="12" fill="var(--td-color-text-muted)">${d ? d[0] : "Valor en stock"}</text>`, c += `<text x="${n}" y="${s + 22}" text-anchor="middle" font-size="24" font-weight="800" fill="var(--td-color-text)" font-family="var(--td-font-display)">${_t(d ? d[1] : a)}</text>`;
  }
  const l = t.map(([d, u], p) => `<div class="td-chart__pie-row ${e.pHov === p ? "is-on" : ""}" data-ch-pie="${p}"><i style="background:${wt[p]}"></i><span><strong>${d}</strong><b style="width:${Math.round(u / t[0][1] * 100)}%;background:${wt[p]}"></b></span><em>${_t(u)}</em><small>${Math.round(u / a * 100)}%</small></div>`).join("");
  return `<div class="td-chart__tools">${Te("pDonut", [["pie", "Pie"], ["donut", "Donut"]], e.pDonut ? "donut" : "pie")}<strong class="td-chart__title">Valor de stock por bodega</strong><span></span><button type="button" class="td-btn td-btn--secondary td-btn--sm" data-ch-export="pie">Exportar CSV</button></div>
        <div class="td-chart__pie"><svg viewBox="0 0 320 300" data-ch-plot role="img" aria-label="Valor de stock por bodega">${c}</svg><div data-ch-pie-list>${l}</div></div>`;
}
function io(e) {
  const t = ["Web", "Asesor", "Flota"], a = [0, 2, 3], n = e.points.filter((f) => !e.sHid.includes(t[f.c])), s = Ce(2e3), o = Ce(6.5), r = (f) => ut + f / s.max * kt, i = (f) => et + Q - f / o.max * Q;
  let c = $a(o.max, o.step, (f) => `${f} d`);
  for (let f = 0; f <= s.max + 1e-9; f += s.step)
    c += `<text x="${r(f)}" y="${et + Q + 20}" text-anchor="middle" font-size="11" fill="var(--td-color-text-muted)" font-family="var(--td-font-mono)">${f ? `$${f}k` : "0"}</text>`;
  n.forEach((f) => {
    const m = e.sHov === f.id;
    c += `<circle data-ch-point="${f.id}" cx="${r(f.val)}" cy="${i(f.dias)}" r="${4 + f.u / 2.4}" fill="${wt[a[f.c]]}" fill-opacity="${m ? 0.9 : 0.35}" stroke="${wt[a[f.c]]}" stroke-width="${m ? 2.5 : 1.25}"></circle>`;
  });
  let l = "";
  if (e.sTrend && n.length > 2) {
    const f = n.length, m = n.reduce((w, v) => w + v.val, 0) / f, b = n.reduce((w, v) => w + v.dias, 0) / f, h = n.reduce((w, v) => w + (v.val - m) * (v.dias - b), 0) / n.reduce((w, v) => w + (v.val - m) ** 2, 0), g = b - h * m;
    c += `<line x1="${r(0)}" y1="${i(g)}" x2="${r(2e3)}" y2="${i(g + h * 2e3)}" stroke="var(--td-color-text)" stroke-width="2" stroke-dasharray="6 5"></line>`, l = `Tendencia: +${(h * 1e3).toFixed(2).replace(".", ",")} días por cada $ 1 M de pedido`;
  }
  const d = e.points.find((f) => f.id === e.sHov), u = d ? `${d.oc} · ${t[d.c]} · $ ${(d.val * 1e3).toLocaleString("es-CL")} · ${String(d.dias).replace(".", ",")} días · ${d.u} unidades` : "Pasa el mouse sobre un punto";
  return `<div class="td-chart__tools"><strong class="td-chart__title">Valor del pedido vs días de entrega</strong><div class="td-chart__legend">${t.map((f, m) => {
    const b = e.sHid.includes(f);
    return `<button type="button" data-ch-channel="${f}" aria-pressed="${!b}" style="opacity:${b ? 0.4 : 1};text-decoration:${b ? "line-through" : "none"}"><i style="background:${wt[a[m]]};border-radius:50%"></i>${f}</button>`;
  }).join("")}</div>${He("sTrend", e.sTrend, "Línea de tendencia")}</div>
        ${ya(c, de + 14, "Dispersión de pedidos")}
        <p class="td-chart__read" role="status">${u}</p><p class="td-chart__trend">${l}</p>`;
}
function se(e, t, a, n) {
  const s = (n - 90) * Math.PI / 180;
  return [e + a * Math.cos(s), t + a * Math.sin(s)];
}
function co(e, t, a, n, s) {
  const o = se(e, t, a, n), r = se(e, t, a, s);
  return `M${o[0].toFixed(1)},${o[1].toFixed(1)} A${a},${a} 0 ${s - n > 180 ? 1 : 0} 1 ${r[0].toFixed(1)},${r[1].toFixed(1)}`;
}
function lo(e) {
  const t = e.g, a = (d) => -120 + d / 100 * 240;
  let n = "";
  [[0, 60, "var(--td-color-danger)"], [60, 85, "var(--td-color-warning)"], [85, 100, "var(--td-color-success)"]].forEach(([d, u, p]) => {
    n += `<path d="${co(150, 150, 110, a(d), a(u))}" fill="none" stroke="${p}" stroke-width="14"></path>`;
  });
  for (let d = 0; d <= 100; d += 10) {
    const u = se(150, 150, 94, a(d)), p = se(150, 150, d % 50 ? 88 : 82, a(d));
    n += `<line x1="${u[0]}" y1="${u[1]}" x2="${p[0]}" y2="${p[1]}" stroke="var(--td-color-text-muted)" stroke-width="${d % 50 ? 1.5 : 2.5}"></line>`;
  }
  const s = se(150, 150, 100, a(t));
  n += `<line x1="150" y1="150" x2="${s[0]}" y2="${s[1]}" stroke="var(--td-color-text)" stroke-width="4" stroke-linecap="round"></line><circle cx="150" cy="150" r="9" fill="var(--td-color-text)"></circle>`, n += `<text x="150" y="212" text-anchor="middle" font-size="34" font-weight="800" fill="var(--td-color-text)" font-family="var(--td-font-display)">${t}%</text>`, n += '<text x="150" y="234" text-anchor="middle" font-size="12" fill="var(--td-color-text-muted)">Cumplimiento de meta</text>';
  const o = Math.max(0, Math.min(100, Math.round(t * 0.4 + 58))), r = 95, i = Math.PI * 100, c = t >= 85 ? "var(--td-color-success)" : t >= 60 ? "var(--td-color-warning)" : "var(--td-color-danger)", l = t >= 85 ? "Sobre la meta" : t >= 60 ? "En riesgo" : "Bajo la meta";
  return `<div class="td-chart__gauges">
        <div><span>Radial · con rangos</span><svg viewBox="0 0 300 250" role="img" aria-label="Cumplimiento ${t} %">${n}</svg><strong style="color:${c}">${l}</strong></div>
        <div><span>Arco · contra meta</span><svg viewBox="0 0 240 150" role="img" aria-label="OTIF ${o} %"><path d="M20,130 A100,100 0 0 1 220,130" fill="none" stroke="var(--td-color-border)" stroke-width="18" stroke-linecap="round"></path><path d="M20,130 A100,100 0 0 1 220,130" fill="none" stroke="${o >= r ? "var(--td-color-success)" : "var(--td-color-primary)"}" stroke-width="18" stroke-linecap="round" stroke-dasharray="${(i * o / 100).toFixed(1)} ${i.toFixed(1)}"></path><text x="120" y="118" text-anchor="middle" font-size="32" font-weight="800" fill="var(--td-color-text)" font-family="var(--td-font-display)">${o}%</text><text x="120" y="142" text-anchor="middle" font-size="11.5" fill="var(--td-color-text-muted)">OTIF · meta ${r}%</text></svg></div>
    </div>
    <div class="td-chart__tools"><label class="td-chart__range">Valor<input type="range" min="0" max="100" value="${t}" data-ch-gauge></label><button type="button" class="td-btn" data-ch-sim>Simular dato</button></div>`;
}
function uo(e) {
  const a = [
    ["Ventas del mes", "$ 84,0 M", "+12,4%", !0, [52, 55, 54, 58, 61, 60, 66, 70, 68, 74, 79, 84], "area"],
    ["Pedidos", "1.284", "+8,1%", !0, [920, 980, 1010, 990, 1060, 1100, 1090, 1150, 1180, 1210, 1240, 1284], "line"],
    ["Ticket promedio", "$ 65.420", "−2,3%", !1, [70, 69, 71, 68, 67, 69, 68, 66, 67, 66, 65.8, 65.4], "line"],
    ["Devoluciones", "1,8%", "−0,4 pp", !0, [2.6, 2.5, 2.4, 2.4, 2.3, 2.2, 2.2, 2.1, 2, 1.9, 1.9, 1.8], "bar"]
  ].map(([o, r, i, c, l, d], u) => {
    const p = Math.min(...l), f = Math.max(...l), m = 220, b = 56, h = (y) => 2 + y * (m - 4) / (l.length - 1), g = (y) => b - 4 - (y - p) / (f - p || 1) * (b - 10), w = l.map((y, S) => [h(S), g(y)]), v = e.kHov && e.kHov[0] === u ? e.kHov[1] : l.length - 1;
    let E = "";
    if (d === "bar")
      E = l.map((y, S) => `<rect x="${2 + S * (m - 4) / l.length + 2}" y="${g(y)}" width="${(m - 4) / l.length - 4}" height="${b - 2 - g(y)}" rx="1" fill="${S === l.length - 1 ? "var(--td-color-primary)" : "var(--td-color-border-strong)"}"></rect>`).join("");
    else {
      const y = gn(w);
      d === "area" && (E += `<path d="${y} L${h(l.length - 1)},${b} L${h(0)},${b} Z" fill="var(--td-color-primary)" opacity="0.12"></path>`), E += `<path d="${y}" fill="none" stroke="var(--td-color-primary)" stroke-width="2"></path><circle cx="${w[v][0]}" cy="${w[v][1]}" r="3.5" fill="var(--td-color-primary)"></circle>`;
    }
    const x = e.kHov && e.kHov[0] === u ? `Mes ${e.kHov[1] + 1}: ${l[e.kHov[1]].toLocaleString("es-CL")}` : "Últimos 12 meses";
    return `<article><span>${o}</span><div><strong>${r}</strong><em style="color:${c ? "var(--td-color-success)" : "var(--td-color-danger)"}">${i.startsWith("+") || i.startsWith("−") ? i.startsWith("+") ? "▲" : "▼" : ""} ${i}</em></div><svg data-ch-spark="${u}" viewBox="0 0 ${m} ${b}" width="100%" height="${b}">${E}</svg><small>${x}</small></article>`;
  }).join(""), s = [["Frenos", [18, 21, 19, 24, 26, 25, 29, 31, 34]], ["Motor", [14, 15, 17, 16, 18, 20, 19, 22, 23]], ["Suspensión", [9, 10, 9, 11, 12, 12, 13, 14, 15]], ["Eléctrico", [6, 7, 8, 7, 9, 9, 10, 11, 12]], ["Transmisión", [8, 7, 7, 6, 6, 7, 6, 5, 5]]].map(([o, r]) => {
    const i = Math.min(...r), c = Math.max(...r), l = r[r.length - 1] >= r[0], d = r.map((p, f) => `${(f * 120 / (r.length - 1)).toFixed(1)},${(25 - (p - i) / (c - i || 1) * 22).toFixed(1)}`).join(" "), u = `${l ? "+" : ""}${Math.round((r[r.length - 1] / r[0] - 1) * 100)}%`;
    return `<div><span>${o}</span><svg viewBox="0 0 120 28" width="120" height="28"><polyline points="${d}" fill="none" stroke="${l ? "var(--td-color-text)" : "var(--td-color-danger)"}" stroke-width="1.75"></polyline></svg><em>${_t(r[r.length - 1])}</em><strong style="color:${l ? "var(--td-color-success)" : "var(--td-color-danger)"}">${u}</strong></div>`;
  }).join("");
  return `<div class="td-chart__sparks">${a}</div><div class="td-chart__table"><div><span>Categoría</span><span>Ene–Sep</span><span>Sep</span><span>Var.</span></div>${s}</div>`;
}
function po(e) {
  const t = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"], a = Array.from({ length: 12 }, (p, f) => 8 + f), n = (p, f) => {
    const m = p < 5 ? 1 : p === 5 ? 0.55 : 0.15, b = Math.exp(-((f - 10.5) ** 2) / 3) + Math.exp(-((f - 16) ** 2) / 4) * 0.8;
    return Math.round((6 + b * 38) * m * (1 + (p * 7 + f * 3) % 5 / 12));
  }, s = t.map((p, f) => a.map((m) => n(f, m))), o = Math.max(...s.flat()), r = a.map((p, f) => s.reduce((m, b) => m + b[f], 0)), i = s.map((p) => p.reduce((f, m) => f + m, 0)), c = [
    ["Hora punta", `${a[r.indexOf(Math.max(...r))]}:00`],
    ["Día con más pedidos", t[i.indexOf(Math.max(...i))]],
    ["Total semana", `${i.reduce((p, f) => p + f, 0).toLocaleString("es-CL")} pedidos`]
  ], l = a.map((p) => `<span>${String(p).padStart(2, "0")}:00</span>`).join(""), d = t.map((p, f) => `<span class="td-chart__day">${p}</span>${a.map((m, b) => {
    const h = s[f][b], g = h / o, w = e.hHov && e.hHov[0] === f && e.hHov[1] === b;
    return `<button type="button" data-ch-heat="${f}-${b}" style="background:color-mix(in srgb, var(--td-color-primary) ${Math.round(6 + g * 94)}%, var(--td-color-surface));color:${g > 0.55 ? "#fff" : "var(--td-color-text)"};box-shadow:${w ? "inset 0 0 0 2px var(--td-color-text)" : "none"}" aria-label="${p} ${m}:00 · ${h} pedidos">${h}</button>`;
  }).join("")}`).join(""), u = e.hHov ? `${t[e.hHov[0]]} ${a[e.hHov[1]]}:00–${a[e.hHov[1]] + 1}:00 · ${s[e.hHov[0]][e.hHov[1]]} pedidos` : "Pasa el mouse sobre una celda";
  return `<div class="td-chart__kpis">${c.map(([p, f]) => `<div><span>${p}</span><strong>${f}</strong></div>`).join("")}</div>
        <strong class="td-chart__title">Pedidos por día y hora · última semana</strong>
        <div class="td-chart__heat" role="grid" aria-label="Pedidos por día y hora"><span></span>${l}${d}</div>
        <div class="td-chart__scale"><span>0</span><i></i><span>${o}</span><p role="status">${u}</p></div>`;
}
function fo(e, t) {
  const a = e.dataset.kind || "chline", n = eo(a, t.advHov, t.spc);
  if (n) {
    e.innerHTML = n;
    return;
  }
  const s = a === "chcol" ? oo(t) : a === "chpie" ? ro(t) : a === "chscatter" ? io(t) : a === "chgauge" ? lo(t) : a === "chspark" ? uo(t) : a === "chheat" ? po(t) : so(t);
  e.innerHTML = s;
}
function mo(e, t, a) {
  const n = e.getBoundingClientRect(), s = (t.clientX - n.left) / n.width * ga;
  return Math.max(0, Math.min(a - 1, Math.round((s - ut) / (kt / (a - 1)))));
}
function ho() {
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
    spc: Ps(),
    points: Array.from({ length: 48 }, (a, n) => {
      const s = n % 3, o = Math.round(60 + t() * 1900), r = Math.max(0.5, Math.round((0.8 + o / 900 + (s === 2 ? -0.6 : s === 0 ? 0.5 : 0) + (t() - 0.5) * 1.6) * 10) / 10);
      return { id: n, c: s, val: o, dias: r, u: Math.round(1 + t() * 24), oc: `OC-${String(480 + n).padStart(5, "0")}` };
    })
  };
}
function bo(e = document) {
  e.querySelectorAll("td-chart").forEach((t) => {
    if (t.dataset.bound === "true")
      return;
    t.dataset.bound = "true";
    const a = ho(), n = () => fo(t, a);
    t.addEventListener("click", (s) => {
      const r = (s.target instanceof Element ? s.target : null)?.closest("button");
      if (!(r instanceof HTMLButtonElement) || !t.contains(r))
        return;
      const i = r.dataset.chKey, c = r.dataset.chValue;
      if (i === "lType" && (c === "line" || c === "area" || c === "step"))
        a.lType = c;
      else if (i === "cOri" && (c === "v" || c === "h"))
        a.cOri = c;
      else if (i === "cMode" && (c === "group" || c === "stack" || c === "pct"))
        a.cMode = c;
      else if (i === "pDonut")
        a.pDonut = c === "donut";
      else if (r.dataset.chToggle) {
        const l = r.dataset.chToggle;
        l === "smooth" && (a.smooth = !a.smooth), l === "markers" && (a.markers = !a.markers), l === "target" && (a.target = !a.target), l === "sTrend" && (a.sTrend = !a.sTrend);
      } else if (r.dataset.chLegend) {
        const l = r.dataset.chLegend;
        a.hidden = a.hidden.includes(l) ? a.hidden.filter((d) => d !== l) : [...a.hidden, l];
      } else if (r.dataset.chChannel) {
        const l = r.dataset.chChannel;
        a.sHid = a.sHid.includes(l) ? a.sHid.filter((d) => d !== l) : [...a.sHid, l];
      } else if (r.dataset.chExport === "ventas") {
        Ua("ventas-por-categoria", [["Mes", ...Mt.map((l) => l[0])], ...vt.map((l, d) => [l, ...Mt.map((u) => u[1][d])])]);
        return;
      } else if (r.dataset.chExport === "pie") {
        const l = [["Quilicura", 128], ["Concepción", 64], ["Antofagasta", 55], ["Puerto Montt", 34], ["En tránsito", 24]], d = l.reduce((u, p) => u + p[1], 0);
        Ua("stock-por-bodega", [["Bodega", "Valor (M)", "%"], ...l.map((u) => [u[0], u[1], Math.round(u[1] / d * 100)])]);
        return;
      } else if (r.dataset.chSim !== void 0)
        a.g = Math.round(35 + Math.random() * 64);
      else if (r.dataset.chHeat) {
        const [l, d] = r.dataset.chHeat.split("-").map(Number);
        a.hHov = [l, d];
      }
      n();
    }), t.addEventListener("input", (s) => {
      const o = s.target;
      o instanceof HTMLInputElement && o.matches("[data-ch-gauge]") && (a.g = Number(o.value), n());
    }), t.addEventListener("mousemove", (s) => {
      const o = s.target instanceof Element ? s.target.closest("[data-ch-plot]") : null;
      if (o instanceof SVGSVGElement && (t.dataset.kind === "chline" || !t.dataset.kind)) {
        const i = mo(o, s, vt.length);
        i !== a.hov && (a.hov = i, n());
      }
      const r = s.target instanceof Element ? s.target.closest("[data-ch-spark]") : null;
      if (r instanceof SVGSVGElement) {
        const i = r.getBoundingClientRect(), c = Number(r.dataset.chSpark), l = Math.max(0, Math.min(11, Math.round((s.clientX - i.left) / i.width * 11)));
        (!a.kHov || a.kHov[0] !== c || a.kHov[1] !== l) && (a.kHov = [c, l], n());
      }
    }), t.addEventListener("mouseover", (s) => {
      const o = s.target instanceof Element ? s.target : null, r = o?.closest("[data-ch-col]");
      if (r instanceof SVGElement) {
        const u = Number(r.dataset.chCol);
        a.hov !== u && (a.hov = u, n());
      }
      const i = o?.closest("[data-ch-pie]");
      if (i instanceof Element) {
        const u = Number(i.dataset.chPie);
        a.pHov !== u && (a.pHov = u, n());
      }
      const c = o?.closest("[data-ch-point]");
      if (c instanceof Element) {
        const u = Number(c.dataset.chPoint);
        a.sHov !== u && (a.sHov = u, n());
      }
      const l = o?.closest("[data-ch-heat]");
      if (l instanceof HTMLElement) {
        const [u, p] = (l.dataset.chHeat ?? "0-0").split("-").map(Number);
        (!a.hHov || a.hHov[0] !== u || a.hHov[1] !== p) && (a.hHov = [u, p], n());
      }
      const d = o?.closest("[data-ch-hov]");
      if (d instanceof Element) {
        const u = d.dataset.chHov ?? "";
        a.advHov !== u && (a.advHov = u, n());
      }
    }), t.addEventListener("mouseleave", () => {
      a.hov = null, a.pHov = null, a.sHov = null, a.kHov = null, a.hHov = null, a.advHov = null, n();
    }), n();
  });
}
const R = [
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
], st = [
  "linear-gradient(135deg,#3A4047,#15181B)",
  "linear-gradient(135deg,#4B5158,#1F2327)",
  "linear-gradient(135deg,#2B3036,#0A0B0C)",
  "linear-gradient(135deg,#5A6168,#2B3036)",
  "linear-gradient(135deg,#33383D,#0A0B0C)",
  "linear-gradient(135deg,#6E757D,#33383D)"
], qt = [
  [5, "Carlos M.", "Transportes del Sur", "Duración excelente, 60.000 km y siguen bien. Sin ruido al frenar.", 18, 2],
  [4, "Paula R.", "Taller Maipú", "Buen producto, la instalación fue simple. El sensor vino aparte.", 9, 5],
  [5, "Jorge S.", "Buses Andinos", "Compramos 40 juegos para la flota, llegaron al día siguiente.", 24, 8],
  [3, "Ana V.", "Particular", "Cumple, pero frenan algo menos en frío que las originales anteriores.", 4, 12],
  [5, "Luis T.", "Minera Los Robles", "Aguantan bien el polvo de faena. Recomendadas.", 12, 20],
  [2, "Diego F.", "Particular", "Llegaron con la caja dañada, aunque las pastillas estaban bien.", 2, 30],
  [4, "Marcela P.", "Frío Norte", "Precio razonable por volumen. Atención rápida del asesor.", 6, 41]
], ke = 15e4, $t = /* @__PURE__ */ new WeakMap(), Wa = /* @__PURE__ */ new WeakSet();
function F(e) {
  return `$ ${Math.round(e).toLocaleString("es-CL")}`;
}
function T(e) {
  return e.replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t] ?? t);
}
function rt(e) {
  return R.find((t) => t.id === e);
}
function yn(e) {
  return [0, 15, 0, 20, 0, 10, 25, 0][e.id % 8];
}
function Ot(e) {
  return Math.round(e.price * (1 - yn(e) / 100));
}
function Bt(e) {
  return 3.6 + e.id * 37 % 14 / 10;
}
function vn(e) {
  return 12 + e.id * 53 % 180;
}
function Ie(e) {
  return e === 0 ? ["Agotado", "var(--td-color-danger)"] : e <= 10 ? [`Pocas unidades · ${e}`, "var(--td-color-warning)"] : ["En stock", "var(--td-color-success)"];
}
function Ne(e) {
  const t = Math.round(e * 2) / 2;
  return Array.from({ length: 5 }, (a, n) => `<i class="td-ecom__star" style="--fill:${n + 1 <= t ? 1 : n + 0.5 === t ? 0.5 : 0}" aria-hidden="true"></i>`).join("");
}
function Ga(e = "ecard") {
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
    drawer: e === "ecart"
  };
}
function xe(e) {
  return e.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function va(e) {
  const t = e.cart.reduce((s, o) => {
    const r = rt(o.id);
    return r ? s + Ot(r) * o.qty : s;
  }, 0), a = e.couponOk ? Math.round(t * 0.1) : 0, n = t - a >= ke || !t ? 0 : 6990;
  return { sub: t, off: a, ship: n, total: t - a + n, qty: e.cart.reduce((s, o) => s + o.qty, 0) };
}
function ue(e, t) {
  const a = yn(e), [n, s] = Ie(e.stock), o = t.wish.includes(e.id), r = t.cmp.includes(e.id);
  return `<article class="td-ecom__card ${t.layout === "list" ? "is-list" : ""}">
        <div class="td-ecom__media" style="background:${st[e.id % st.length]}">
            <span>${T(e.cat)}</span>
            ${a ? `<b class="td-ecom__flag">-${a}%</b>` : ""}
            ${e.id % 5 === 2 ? '<b class="td-ecom__flag is-new">Nuevo</b>' : ""}
            ${e.id % 7 === 1 ? '<b class="td-ecom__flag is-best">Más vendido</b>' : ""}
        </div>
        <div class="td-ecom__body">
            <small>${T(e.brand)} · ${T(e.code)}</small>
            <strong>${T(e.name)}</strong>
            <span class="td-ecom__stars" aria-label="${Bt(e).toFixed(1).replace(".", ",")} de 5">${Ne(Bt(e))}<em>${Bt(e).toFixed(1).replace(".", ",")} (${vn(e)})</em></span>
            <span class="td-ecom__stock" style="color:${s}">${n}</span>
            <p class="td-ecom__price"><b>${F(Ot(e))}</b>${a ? `<s>${F(e.price)}</s>` : ""}</p>
            <div class="td-ecom__acts">
                <button type="button" data-ec="add:${e.id}" ${e.stock ? "" : "disabled"}>Agregar al carrito</button>
                <button type="button" data-ec="wish:${e.id}" aria-pressed="${o}" aria-label="${o ? "Quitar de favoritos" : "Agregar a favoritos"}">${o ? "En favoritos" : "Favorito"}</button>
                <button type="button" data-ec="cmp:${e.id}" aria-pressed="${r}">${r ? "En comparación" : "Comparar"}</button>
            </div>
        </div>
    </article>`;
}
function go(e, t) {
  const a = $o(e, t);
  return `<p class="td-ecom__msg" role="status">${T(t.msg || " ")}</p>${a}`;
}
function $o(e, t) {
  switch (e) {
    case "ecard":
      return Ja(t);
    case "edetail":
      return yo(t);
    case "ecart":
      return vo(t);
    case "echeckout":
      return xo(t);
    case "efacets":
      return wo(t);
    case "esearch":
      return So(t);
    case "ecompare":
      return Eo(t);
    case "eflash":
      return ko(t);
    case "ereviews":
      return Mo(t);
    case "efinder":
      return Lo(t);
    case "equote":
      return Ao(t);
    case "ebulk":
      return qo(t);
    case "erecent":
      return Co(t);
    case "estock":
      return To(t);
    case "ewishmulti":
      return Ho(t);
    case "etrack":
      return No();
    case "efbt":
      return Bo(t);
    case "elocator":
      return jo(t);
    case "ecredit":
      return Do(t);
    case "ereturns":
      return Po(t);
    default:
      return Ja(t);
  }
}
function Ja(e) {
  const t = va(e);
  return `<div class="td-ecom__bar">
        <div class="td-ecom__seg" role="group" aria-label="Disposición">
            <button type="button" data-ec="layout:grid" aria-pressed="${e.layout === "grid"}">Grilla</button>
            <button type="button" data-ec="layout:list" aria-pressed="${e.layout === "list"}">Lista</button>
        </div>
        <span>Favoritos ${e.wish.length} · Comparar ${e.cmp.length} · Carrito ${t.qty}</span>
    </div>
    <div class="td-ecom__grid ${e.layout === "list" ? "is-list" : ""}">${R.slice(0, 8).map((a) => ue(a, e)).join("")}</div>`;
}
function yo(e) {
  const t = rt(1), a = e.pv.q === "orig" ? 1 : e.pv.q === "alt" ? 0.72 : 0.55, n = Math.round(t.price * a), s = [[1, 0], [5, 5], [10, 10], [20, 15]], o = [...s].reverse().find((u) => e.pv.qty >= u[0]) ?? s[0], r = Math.round(n * (1 - o[1] / 100)), i = t.code + (e.pv.side === "tra" ? "-T" : "") + (e.pv.q === "orig" ? "" : e.pv.q === "alt" ? "-A" : "-E"), c = ["Vista frontal", "Vista lateral", "Detalle del material", "En el eje"], l = [["orig", "Original", "Garantía 12 meses"], ["alt", "Alternativa", "Garantía 6 meses"], ["eco", "Económica", "Garantía 3 meses"]], d = [["Quilicura", 42, "Hoy"], ["Concepción", 8, "Mañana"], ["Antofagasta", 0, "3–5 días"]];
  return `<div class="td-ecom__detail">
        <div>
            <div class="td-ecom__hero" style="background:${st[(t.id + e.pv.img) % st.length]}">${c[e.pv.img]}</div>
            <div class="td-ecom__thumbs">${c.map((u, p) => `<button type="button" data-ec="img:${p}" aria-pressed="${e.pv.img === p}" style="background:${st[(t.id + p) % st.length]}">${u}</button>`).join("")}</div>
        </div>
        <div class="td-ecom__buy">
            <small>${T(t.brand)} · ${T(i)}</small>
            <h2>${T(t.name)}</h2>
            <span class="td-ecom__stars">${Ne(Bt(t))}<em>${Bt(t).toFixed(1).replace(".", ",")} · ${vn(t)} reseñas</em></span>
            <p>${T(t.app)}</p>
            <div class="td-ecom__seg" role="group" aria-label="Lado">
                <button type="button" data-ec="side:del" aria-pressed="${e.pv.side === "del"}">Delantera</button>
                <button type="button" data-ec="side:tra" aria-pressed="${e.pv.side === "tra"}">Trasera</button>
            </div>
            <div class="td-ecom__quals">${l.map(([u, p, f]) => `<button type="button" data-ec="qual:${u}" aria-pressed="${e.pv.q === u}"><b>${p}</b><span>${f}</span><em>${F(Math.round(t.price * (u === "orig" ? 1 : u === "alt" ? 0.72 : 0.55)))}</em></button>`).join("")}</div>
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
            <ul class="td-ecom__stores">${d.map(([u, p, f]) => {
    const [m, b] = Ie(p);
    return `<li><b>${u}</b><span style="color:${b}">${p ? `${p} u. · ${m}` : "Sin stock"}</span><small>${p ? `Retiro ${f.toLowerCase()}` : `Traslado ${f}`}</small></li>`;
  }).join("")}</ul>
        </div>
    </div>`;
}
function vo(e) {
  const t = va(e), a = e.cart.map((o) => ({ line: o, part: rt(o.id) })).filter((o) => o.part), n = Math.max(0, ke - (t.sub - t.off)), s = R.filter((o) => o.stock > 0 && !e.cart.some((r) => r.id === o.id)).slice(0, 3);
  return `<div class="td-ecom__cart ${e.drawer ? "is-open" : ""}">
        <button type="button" data-ec="drawer">${e.drawer ? "Cerrar carrito" : `Abrir carrito · ${t.qty} productos`}</button>
        <aside class="td-ecom__drawer" ${e.drawer ? "" : "hidden"} aria-label="Carrito">
            <header><strong>${t.qty} ${t.qty === 1 ? "producto" : "productos"}</strong><button type="button" data-ec="drawer">Cerrar</button></header>
            ${a.length ? `<ul>${a.map(({ line: o, part: r }) => `<li>
                <i style="background:${st[r.id % st.length]}"></i>
                <div><b>${T(r.name)}</b><small>${T(r.code)} · ${F(Ot(r))}</small></div>
                <div class="td-ecom__qty">
                    <button type="button" data-ec="line:${o.id}:-1" ${o.qty <= 1 ? "disabled" : ""} aria-label="Disminuir">−</button>
                    <span>${o.qty}</span>
                    <button type="button" data-ec="line:${o.id}:1" ${o.qty >= r.stock ? "disabled" : ""} aria-label="Aumentar">+</button>
                </div>
                <b>${F(Ot(r) * o.qty)}</b>
                <button type="button" data-ec="rm:${o.id}" aria-label="Quitar ${T(r.name)}">Quitar</button>
            </li>`).join("")}</ul>` : "<p>El carrito está vacío. Agrega un repuesto para continuar.</p>"}
            <div class="td-ecom__ship"><span style="width:${Math.min(100, Math.round((t.sub - t.off) / ke * 100))}%"></span></div>
            <p>${t.sub - t.off >= ke ? "Tienes despacho gratis" : `Te faltan ${F(n)} para despacho gratis`}</p>
            <label>Cupón <input data-ec-in="coupon" value="${T(e.coupon)}" placeholder="FLOTA10" aria-label="Cupón"></label>
            <button type="button" data-ec="coupon">${e.couponOk ? "Cupón FLOTA10 aplicado · 10%" : "Aplicar cupón"}</button>
            <dl>
                <dt>Subtotal</dt><dd>${F(t.sub)}</dd>
                ${t.off ? `<dt>Descuento</dt><dd>− ${F(t.off)}</dd>` : ""}
                <dt>Despacho</dt><dd>${t.ship ? F(t.ship) : "Gratis"}</dd>
                <dt>Total</dt><dd><b>${F(t.total)}</b></dd>
            </dl>
            <button type="button" data-ec="go-check" ${a.length ? "" : "disabled"}>Ir a pagar · ${F(t.total)}</button>
            <div class="td-ecom__cross">${s.map((o) => `<button type="button" data-ec="add:${o.id}"><i style="background:${st[o.id % st.length]}"></i>${T(o.name)}<b>${F(o.price)}</b></button>`).join("")}</div>
        </aside>
    </div>`;
}
function we(e, t, a, n) {
  return `<label>${t}<input data-ec-in="${e}" value="${T(a)}" aria-invalid="${n ? "true" : "false"}" aria-describedby="${n ? e + "-err" : ""}">${n ? `<small id="${e}-err">${n}</small>` : ""}</label>`;
}
function xo(e) {
  const t = va(e), a = e.co, n = {
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
        ${e.step === 0 ? `<div class="td-ecom__form">${we("name", "Nombre o razón social", a.name, s.name)}${we("mail", "Correo", a.mail, s.mail)}${we("rut", "RUT", a.rut, s.rut)}</div>` : ""}
        ${e.step === 1 ? `<div class="td-ecom__form">${we("addr", "Dirección de despacho", a.addr, s.addr)}<div class="td-ecom__choices">${o.map(([d, u, p, f]) => `<button type="button" data-ec="ship:${d}" aria-pressed="${a.ship === d}"><b>${u}</b><span>${p}</span><em>${f ? F(f) : "Gratis"}</em></button>`).join("")}</div></div>` : ""}
        ${e.step === 2 ? `<div class="td-ecom__choices">${[["card", "Tarjeta de crédito o débito"], ["transfer", "Transferencia bancaria"], ["credit", "Crédito de flota a 30 días"]].map(([d, u]) => `<button type="button" data-ec="pay:${d}" aria-pressed="${a.pay === d}">${u}</button>`).join("")}</div>` : ""}
        ${e.step === 3 ? `<div class="td-ecom__done"><h2>Pedido OC-2026-0${500 + t.qty}</h2><p>${o.find((d) => d[0] === a.ship)?.[1]} · ${o.find((d) => d[0] === a.ship)?.[2]}</p><p>${l} · ${F(i)}</p><p>Te enviaremos la guía a ${T(a.mail || "tu correo")}.</p><button type="button" data-ec="restart">Hacer otro pedido</button></div>` : ""}
        ${e.step < 3 ? `<div class="td-ecom__nav">${e.step ? '<button type="button" data-ec="back">Volver</button>' : "<span></span>"}<button type="button" data-ec="next">${e.step === 2 ? `Pagar ${F(i)}` : "Continuar"}</button></div>` : ""}`;
}
function wo(e) {
  const t = Math.max(...R.map((l) => l.price)), a = e.f.max || t, n = (l, d) => (d === "brand" || !e.f.brand.length || e.f.brand.includes(l.brand)) && (d === "cat" || !e.f.cat.length || e.f.cat.includes(l.cat)) && (!e.f.stock || l.stock > 0) && l.price <= a, s = (l, d) => d.map((u) => {
    const p = e.f[l].includes(u), f = R.filter((m) => m[l] === u && n(m, l)).length;
    return `<label class="${!f && !p ? "is-off" : ""}"><input type="checkbox" data-ec="facet:${l}:${encodeURIComponent(u)}" ${p ? "checked" : ""} ${!f && !p ? "disabled" : ""}>${T(u)} <em>${f}</em></label>`;
  }).join(""), o = [...new Set(R.map((l) => l.brand))].sort(), r = [...new Set(R.map((l) => l.cat))];
  let i = R.filter((l) => n(l));
  i = [...i].sort(e.sort === "lo" ? (l, d) => l.price - d.price : e.sort === "hi" ? (l, d) => d.price - l.price : e.sort === "rate" ? (l, d) => Bt(d) - Bt(l) : (l, d) => l.id - d.id);
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
            ${i.length ? `<div class="td-ecom__grid">${i.slice(0, 9).map((l) => ue(l, e)).join("")}</div>` : "<p>Ningún repuesto coincide con estos filtros. Quita uno para ver más.</p>"}
        </div>
    </div>`;
}
function So(e) {
  const t = xe(e.q.trim()), a = t.length >= 2 ? R.filter((r) => xe(`${r.name} ${r.code} ${r.brand}`).includes(t)).slice(0, 5) : [], n = t.length >= 2 ? [...new Set(R.filter((r) => xe(`${r.name} ${r.cat}`).includes(t)).map((r) => r.cat))].slice(0, 3) : [], s = t.length >= 2 ? [...new Set(R.map((r) => r.name.toLowerCase()).filter((r) => xe(r).includes(t)))].slice(0, 4) : [], o = e.qOpen && (t.length >= 2 || !t);
  return `<div class="td-ecom__search">
        <label>Buscar repuesto<input data-ec-in="q" value="${T(e.q)}" placeholder="Pastilla, filtro, código…" role="combobox" aria-expanded="${o}" aria-autocomplete="list"></label>
        ${e.q ? '<button type="button" data-ec="qclear">Borrar búsqueda</button>' : ""}
        <div class="td-ecom__suggest" ${o ? "" : "hidden"} role="listbox">
            ${t ? "" : e.recentQ.map((r) => `<button type="button" role="option" data-ec="qgo:${encodeURIComponent(r)}">${T(r)}<span data-ec="qrm:${encodeURIComponent(r)}">Quitar</span></button>`).join("")}
            ${s.map((r) => `<button type="button" role="option" data-ec="qgo:${encodeURIComponent(r)}">${T(r)}</button>`).join("")}
            ${n.map((r) => `<button type="button" role="option" data-ec="qgo:${encodeURIComponent(r)}">Categoría · ${T(r)} <em>${R.filter((i) => i.cat === r).length}</em></button>`).join("")}
            ${a.map((r) => {
    const [i, c] = Ie(r.stock);
    return `<button type="button" role="option" data-ec="qgo:${encodeURIComponent(r.name)}"><i style="background:${st[r.id % st.length]}"></i><span><b>${T(r.name)}</b><small>${T(r.code)} · ${F(Ot(r))}</small></span><em style="color:${c}">${i}</em></button>`;
  }).join("")}
            ${t.length >= 2 && !s.length && !a.length ? "<p>Sin coincidencias. Prueba con el código o la marca.</p>" : ""}
        </div>
        <div class="td-ecom__chips">${["Pastillas de freno", "Filtro de aire", "Amortiguador", "Kit de embrague"].map((r) => `<button type="button" data-ec="qpop:${encodeURIComponent(r)}">${r}</button>`).join("")}</div>
    </div>`;
}
function Eo(e) {
  const t = e.cmp.map(rt).filter((o) => !!o), n = [
    ["Precio", (o) => Ot(o), "min"],
    ["Marca", (o) => o.brand, ""],
    ["Categoría", (o) => o.cat, ""],
    ["Aplicación", (o) => o.app, ""],
    ["Stock", (o) => o.stock, "max"],
    ["Calificación", (o) => Bt(o), "max"],
    ["Garantía", (o) => o.price > 15e4 ? 12 : 6, "max"],
    ["Despacho", (o) => o.stock > 10 ? "Hoy" : o.stock ? "24 h" : "—", ""]
  ].map(([o, r, i]) => {
    const c = t.map(r), l = c.every((p) => String(p) === String(c[0]));
    if (e.cmpDiff && l) return "";
    const d = c.filter((p) => typeof p == "number"), u = i === "min" ? Math.min(...d) : i === "max" ? Math.max(...d) : null;
    return `<tr class="${l ? "is-same" : ""}"><th>${o}</th>${c.map((p) => `<td class="${u != null && p === u && !l ? "is-best" : ""}">${_o(o, p)}</td>`).join("")}</tr>`;
  }).join(""), s = R.filter((o) => !e.cmp.includes(o.id)).slice(0, 6);
  return `<div class="td-ecom__bar"><label class="td-ecom__switch"><input type="checkbox" data-ec="diff" ${e.cmpDiff ? "checked" : ""}>Solo diferencias</label><span>${t.length} de 4</span></div>
        <div class="td-ecom__cmphead">${t.map((o) => `<div><button type="button" data-ec="cmpx:${o.id}" aria-label="Quitar ${T(o.name)}">Quitar</button><strong>${T(o.name)}</strong><small>${F(Ot(o))}</small></div>`).join("") || "<p>Agrega productos para comparar. El máximo es 4.</p>"}</div>
        ${t.length ? `<table class="td-ecom__table"><tbody>${n}</tbody></table>` : ""}
        ${e.cmp.length < 4 ? `<div class="td-ecom__chips">${s.map((o) => `<button type="button" data-ec="cmpadd:${o.id}">${T(o.name)}</button>`).join("")}</div>` : ""}`;
}
function _o(e, t) {
  return e === "Precio" && typeof t == "number" ? F(t) : e === "Stock" ? t ? `${t} u.` : "Agotado" : e === "Calificación" && typeof t == "number" ? `${t.toFixed(1).replace(".", ",")} / 5` : e === "Garantía" ? `${t} meses` : T(String(t));
}
function ko(e) {
  const t = rt(6), a = Math.max(0, e.flashEnd - Date.now()), n = String(Math.floor(a / 36e5)).padStart(2, "0"), s = String(Math.floor(a % 36e5 / 6e4)).padStart(2, "0"), o = String(Math.floor(a % 6e4 / 1e3)).padStart(2, "0"), r = 26 + Math.floor(Date.now() / 6e4 % 8);
  return `<article class="td-ecom__flash">
        <div class="td-ecom__hero" style="background:${st[2]}">Oferta relámpago</div>
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
    <div class="td-ecom__grid">${R.slice(8, 12).map((i, c) => `<div>${ue(i, e)}<small>${[60, 35, 80, 20][c]}% vendido</small></div>`).join("")}</div>`;
}
function Mo(e) {
  const t = [5, 4, 3, 2, 1].map((o) => qt.filter((r) => r[0] === o).length), a = qt.reduce((o, r) => o + r[0], 0) / qt.length, n = qt.map((o, r) => ({ row: o, index: r })).filter(({ row: o }) => !e.rf || o[0] === e.rf).sort((o, r) => e.rs === "new" ? o.row[5] - r.row[5] : e.rs === "help" ? r.row[4] + (e.votes[r.index] ? 1 : 0) - (o.row[4] + (e.votes[o.index] ? 1 : 0)) : e.rs === "hi" ? r.row[0] - o.row[0] : o.row[0] - r.row[0]), s = e.rv.tried && (!e.rv.stars || e.rv.text.trim().length < 10) ? "Elige una calificación y escribe al menos 10 caracteres" : "";
  return `<header class="td-ecom__rvhead">
        <strong>${a.toFixed(1).replace(".", ",")}</strong>
        <span class="td-ecom__stars">${Ne(a)}</span>
        <p>${qt.length} reseñas verificadas · ${Math.round(qt.filter((o) => o[0] >= 4).length / qt.length * 100)}% lo recomienda</p>
    </header>
    <div class="td-ecom__hist">${t.map((o, r) => {
    const i = 5 - r;
    return `<button type="button" data-ec="rvf:${i}" aria-pressed="${e.rf === i}">${i} estrellas <i style="width:${Math.round(o / qt.length * 100)}%"></i> ${o}</button>`;
  }).join("")}</div>
    <div class="td-ecom__seg">${[["new", "Recientes"], ["help", "Útiles"], ["hi", "Mejor"], ["lo", "Peor"]].map(([o, r]) => `<button type="button" data-ec="rvs:${o}" aria-pressed="${e.rs === o}">${r}</button>`).join("")}</div>
    ${e.rf ? `<p>Mostrando ${n.length} de ${e.rf} estrellas <button type="button" data-ec="rvclear">Ver todas</button></p>` : ""}
    <ul class="td-ecom__reviews">${n.map(({ row: o, index: r }) => `<li>
        <b aria-hidden="true">${o[1].split(" ").map((i) => i[0]).join("")}</b>
        <div><strong>${T(o[1])}</strong> <small>${T(o[2])} · ${o[5] === 2 ? "Hace 2 días" : `Hace ${o[5]} días`}</small>
        <span class="td-ecom__stars">${Ne(o[0])}</span><p>${T(o[3])}</p>
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
function Lo(e) {
  const t = e.pf, a = [...new Set(R.map((l) => l.brand))].sort(), n = t.brand ? [...new Set(R.filter((l) => l.brand === t.brand).map((l) => l.app.slice(t.brand.length + 1)))].sort() : [], s = t.model ? ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2016"] : [], o = t.year ? [...new Set(R.filter((l) => l.app === `${t.brand} ${t.model}`).map((l) => l.cat))] : [], r = t.tab === "veh" ? !!t.year : /^[A-Z]{4}-?\d{2}$/.test(t.plate), i = t.done ? R.filter((l) => l.app === `${t.brand} ${t.model}` && (!t.sys || l.cat === t.sys)) : [], c = (l, d) => `<option value="">Elige</option>${l.map((u) => `<option ${u === d ? "selected" : ""}>${T(u)}</option>`).join("")}`;
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
    ${t.done ? `<h3>${T(t.brand)} ${T(t.model)} ${T(t.year)} · ${i.length} ${i.length === 1 ? "repuesto compatible" : "repuestos compatibles"}</h3>${i.length ? `<div class="td-ecom__grid">${i.map((l) => ue(l, e)).join("")}</div>` : "<p>No hay repuestos para ese sistema. Prueba otro o limpia el sistema.</p>"}` : ""}`;
}
function Ao(e) {
  const t = e.quote.map((s) => ({ line: s, part: rt(s.id) })).filter((s) => s.part), a = t.reduce((s, o) => s + o.line.qty, 0), n = R.filter((s) => !e.quote.some((o) => o.id === s.id)).slice(0, 6);
  return e.quoteSent ? `<div class="td-ecom__done"><h2>Cotización enviada</h2><p>${a} unidades · ${t.length} productos. Un asesor responderá en horario hábil.</p><button type="button" data-ec="qnew">Nueva cotización</button></div>` : `<p>${a} unidades · ${t.length} productos</p>
        ${t.length ? `<ul class="td-ecom__lines">${t.map(({ line: s, part: o }) => `<li><b>${T(o.name)}</b><small>${T(o.code)}</small>
            <div class="td-ecom__qty"><button type="button" data-ec="qq:${s.id}:-1">−</button><span>${s.qty}</span><button type="button" data-ec="qq:${s.id}:1">+</button></div>
            <button type="button" data-ec="qqrm:${s.id}">Quitar</button></li>`).join("")}</ul>` : "<p>Agrega al menos un producto para cotizar.</p>"}
        <div class="td-ecom__chips">${n.map((s) => `<button type="button" data-ec="qadd:${s.id}">${T(s.name)}</button>`).join("")}</div>
        <label>Notas para el asesor<textarea data-ec-in="qnote">${T(e.quoteNote)}</textarea></label>
        <button type="button" data-ec="qsend">Enviar cotización</button>`;
}
function qo(e) {
  const t = e.bulkRows ?? [], a = t.filter((n) => n.ok).length;
  return `<p>Pega código y cantidad, uno por línea. Ejemplo: BR-4521-AD, 2</p>
        <textarea data-ec-in="bulk" rows="6">${T(e.bulkText)}</textarea>
        <div class="td-ecom__nav"><button type="button" data-ec="bulksample">Cargar ejemplo</button><button type="button" data-ec="bulkparse">Validar líneas</button></div>
        ${e.bulkRows ? `<p>${a} válidas${t.length - a ? ` · ${t.length - a} con error` : ""}</p><ul class="td-ecom__lines">${t.map((n) => `<li><b>${n.ok ? "✓" : "✕"} ${T(n.code)}</b><span>${T(n.name)}</span><em>${n.qty}</em></li>`).join("")}</ul><button type="button" data-ec="bulkok" ${a ? "" : "disabled"}>Agregar ${a} al carrito</button>` : ""}`;
}
function Co(e) {
  const t = e.recent.map(rt).filter((a) => !!a);
  return `<div class="td-ecom__bar"><span>${t.length} vistos</span><button type="button" data-ec="recentclear" ${t.length ? "" : "disabled"}>Vaciar historial</button></div>
        ${t.length ? `<div class="td-ecom__grid">${t.map((a) => `<div>${ue(a, e)}<button type="button" data-ec="recentx:${a.id}">Quitar del historial</button></div>`).join("")}</div>` : "<p>Todavía no hay productos vistos.</p>"}`;
}
function To(e) {
  return `<ul class="td-ecom__lines">${R.filter((a) => a.stock === 0).slice(0, 6).map((a) => {
    const n = !!e.stockSubs[a.id];
    return `<li><i style="background:${st[a.id % st.length]}"></i><div><b>${T(a.name)}</b><small>${T(a.code)} · Agotado</small></div><button type="button" data-ec="sub:${a.id}" aria-pressed="${n}">${n ? "Te avisaremos" : "Avisarme"}</button></li>`;
  }).join("")}</ul>`;
}
function Ho(e) {
  const t = R.filter((a) => !e.lists.some((n) => n.items.includes(a.id))).slice(0, 4);
  return `<form class="td-ecom__nav"><input data-ec-in="list" value="${T(e.newList)}" placeholder="Nombre de la lista" aria-label="Nombre de la lista"><button type="button" data-ec="listadd">Crear lista</button></form>
        <div class="td-ecom__lists">${e.lists.map((a) => `<section><header><h3>${T(a.name)}</h3><span>${a.items.length} ${a.items.length === 1 ? "producto" : "productos"}</span><button type="button" data-ec="listdel:${a.id}">Eliminar lista</button></header>
            ${a.items.length ? `<ul>${a.items.map(rt).filter((n) => !!n).map((n) => `<li><b>${T(n.name)}</b><small>${F(n.price)}</small>
                <select data-ec-ch="move:${a.id}:${n.id}" aria-label="Mover ${T(n.name)}"><option value="">Mover a…</option>${e.lists.filter((s) => s.id !== a.id).map((s) => `<option value="${s.id}">${T(s.name)}</option>`).join("")}</select>
                <button type="button" data-ec="listrm:${a.id}:${n.id}">Quitar</button></li>`).join("")}</ul>` : "<p>Esta lista está vacía.</p>"}
        </section>`).join("")}</div>
        <div class="td-ecom__chips">${t.map((a) => `<button type="button" data-ec="listitem:${a.id}">${T(a.name)}</button>`).join("")}</div>`;
}
function No() {
  return `<header><h2>OC-2026-00481</h2><p>Guía GD-88213-CL · Entrega estimada 23 de septiembre, entre 12 y 14 h</p></header>
        <ol class="td-ecom__steps">${["Pedido recibido", "Preparando", "Despachado", "En ruta", "Entregado"].map((a, n) => `<li class="${n === 2 ? "is-on" : ""} ${n < 2 ? "is-done" : ""}"><b>${n < 2 ? "✓" : n + 1}</b>${a}</li>`).join("")}</ol>
        <ul class="td-ecom__lines"><li><b>Pastilla de freno delantera</b><small>BR-4521-AD · 2</small></li><li><b>Alternador 24V 110A</b><small>EL-3310-AL · 1</small></li></ul>`;
}
function Bo(e) {
  const t = rt(1), a = [t, ...R.filter((o) => o.id !== t.id).slice(1, 3)], n = (o) => e.fbtOff[o] !== !1, s = a.filter((o) => n(o.id));
  return `<h2>Comprados juntos</h2><div class="td-ecom__bundle">${a.map((o) => `<label><input type="checkbox" data-ec="fbt:${o.id}" ${n(o.id) ? "checked" : ""} ${o.id === t.id ? "disabled" : ""}><i style="background:${st[o.id % st.length]}"></i><b>${T(o.name)}</b><span>${F(o.price)}</span></label>`).join("")}</div>
        <p>Combo ${s.length} productos · <b>${F(s.reduce((o, r) => o + r.price, 0))}</b></p>
        <button type="button" data-ec="fbtadd">Agregar combo al carrito</button>`;
}
function jo(e) {
  const t = [
    ["Quilicura", "Av. Américo Vespucio 1501", "Lun–Vie 08:00–19:00 · Sáb 09:00–14:00", 42],
    ["Concepción", "Camino a Penco 2200", "Lun–Vie 08:30–18:30", 8],
    ["Antofagasta", "Av. Balmaceda 1890", "Lun–Vie 08:00–18:00", 0],
    ["Puerto Montt", "Ruta 5 Sur km 1020", "Lun–Vie 08:30–18:00", 15]
  ], a = e.storeQ.toLowerCase(), n = t.filter(([s]) => !a || s.toLowerCase().includes(a));
  return `<label>Sucursal o ciudad<input data-ec-in="store" value="${T(e.storeQ)}" placeholder="Quilicura, Sur…"></label>
        <ul class="td-ecom__lines">${n.map(([s, o, r, i]) => {
    const [c, l] = Ie(i);
    return `<li><div><b>${s}</b><small>${o}</small><small>${r}</small></div><span style="color:${l}">${c}</span></li>`;
  }).join("") || "<li>Ninguna sucursal coincide. Prueba con otra ciudad.</li>"}</ul>`;
}
function Do(e) {
  const t = [["F-88213", "22/09/2026", 412970], ["F-88190", "15/09/2026", 1204300], ["F-88055", "02/09/2026", 238980]];
  return `<div class="td-ecom__kpis"><div><span>Línea</span><b>${F(15e6)}</b></div><div><span>Usado</span><b>${F(92e5)}</b></div><div><span>Disponible</span><b>${F(58e5)}</b></div></div>
        <div class="td-ecom__ship" aria-label="61% de la línea usada"><span style="width:61%"></span></div>
        <ul class="td-ecom__lines">${t.map(([a, n, s]) => {
    const o = e.paid.includes(a);
    return `<li><div><b>${a}</b><small>${n}</small></div><b>${F(s)}</b>${o ? '<span style="color:var(--td-color-success)">Pagada</span>' : `<button type="button" data-ec="payinv:${a}">Pagar ${F(s)}</button>`}</li>`;
  }).join("")}</ul>`;
}
function Po(e) {
  const t = [rt(1), rt(4)], a = ["Producto defectuoso", "No es compatible con mi vehículo", "Llegó el repuesto equivocado", "Ya no lo necesito"], n = [["refund", "Reembolso al medio de pago original"], ["credit", "Nota de crédito"], ["exchange", "Cambio por otro producto"]], s = e.rma.tried ? e.rmaStep === 0 && !e.rma.item ? "Elige un producto" : e.rmaStep === 1 && !e.rma.reason ? "Elige un motivo" : "" : "", o = ["Producto", "Motivo", "Método", "Listo"];
  return e.rmaStep === 3 ? '<div class="td-ecom__done"><h2>Solicitud RMA-2026-0091</h2><p>Recibimos la devolución. Te escribiremos con la guía de retiro.</p><button type="button" data-ec="rmarestart">Nueva devolución</button></div>' : `<ol class="td-ecom__steps">${o.map((r, i) => `<li class="${i === e.rmaStep ? "is-on" : ""}"><b>${i + 1}</b>${r}</li>`).join("")}</ol>
        ${e.rmaStep === 0 ? `<div class="td-ecom__choices">${t.map((r) => `<button type="button" data-ec="rmaitem:${r.id}" aria-pressed="${e.rma.item === r.id}"><b>${T(r.name)}</b><span>${T(r.code)}</span></button>`).join("")}</div>` : ""}
        ${e.rmaStep === 1 ? `<div class="td-ecom__choices">${a.map((r) => `<button type="button" data-ec="rmareason:${encodeURIComponent(r)}" aria-pressed="${e.rma.reason === r}">${r}</button>`).join("")}</div>` : ""}
        ${e.rmaStep === 2 ? `<div class="td-ecom__choices">${n.map(([r, i]) => `<button type="button" data-ec="rmamethod:${r}" aria-pressed="${e.rma.method === r}">${i}</button>`).join("")}</div>` : ""}
        ${s ? `<p class="td-ecom__err" role="alert">${s}</p>` : ""}
        <div class="td-ecom__nav">${e.rmaStep ? '<button type="button" data-ec="rmaback">Volver</button>' : "<span></span>"}<button type="button" data-ec="rmanext">${e.rmaStep === 2 ? "Enviar solicitud" : "Continuar"}</button></div>`;
}
function bt(e) {
  const t = $t.get(e);
  if (!t) return;
  const a = document.activeElement, n = a instanceof HTMLElement && e.contains(a) ? a.getAttribute("data-ec-in") || a.getAttribute("data-ec-ch") : null, s = a instanceof HTMLInputElement || a instanceof HTMLTextAreaElement ? a.selectionStart : null;
  if (e.innerHTML = go(e.dataset.kind || "ecard", t), !n) return;
  const o = e.querySelector(`[data-ec-in="${CSS.escape(n)}"], [data-ec-ch="${CSS.escape(n)}"]`);
  o instanceof HTMLElement && (o.focus(), (o instanceof HTMLInputElement || o instanceof HTMLTextAreaElement) && s != null && o.type !== "checkbox" && o.type !== "range" && o.setSelectionRange(s, s));
}
function ot(e, t) {
  const a = $t.get(e);
  a && (a.msg = t, window.clearTimeout(a.timer), bt(e), a.timer = window.setTimeout(() => {
    a.msg = "", e.isConnected && bt(e);
  }, 2800));
}
function Ro(e, t, a) {
  const n = $t.get(e);
  if (!n) return;
  const [s, o = "", r = ""] = t.split(":"), i = Number(o), c = rt(i);
  if (s === "layout" && (o === "grid" || o === "list")) n.layout = o;
  else if (s === "wish" && c) {
    n.wish = n.wish.includes(i) ? n.wish.filter((l) => l !== i) : [...n.wish, i], ot(e, n.wish.includes(i) ? "Guardado en favoritos" : "Quitado de favoritos");
    return;
  } else if (s === "cmp" && c) {
    if (!n.cmp.includes(i) && n.cmp.length >= 4) {
      ot(e, "Máximo 4 productos para comparar");
      return;
    }
    n.cmp = n.cmp.includes(i) ? n.cmp.filter((l) => l !== i) : [...n.cmp, i];
  } else if (s === "cmpx") n.cmp = n.cmp.filter((l) => l !== i);
  else if (s === "cmpadd" && c) {
    if (n.cmp.length >= 4) {
      ot(e, "Máximo 4 productos para comparar");
      return;
    }
    n.cmp = [...n.cmp, i];
  } else if ((s === "add" || s === "addpd") && (s === "addpd" || c)) {
    const l = s === "addpd" ? rt(1) : c, d = s === "addpd" ? n.pv.qty : 1;
    if (!l || l.stock === 0) return;
    const u = n.cart.find((p) => p.id === l.id);
    n.cart = u ? n.cart.map((p) => p.id === l.id ? { ...p, qty: Math.min(l.stock, p.qty + d) } : p) : [...n.cart, { id: l.id, qty: d }], e.dataset.kind === "ecart" && (n.drawer = !0), ot(e, `${l.name} agregado al carrito`);
    return;
  } else if (s === "buy") {
    const l = rt(1), d = n.cart.find((u) => u.id === l.id);
    n.cart = d ? n.cart.map((u) => u.id === l.id ? { ...u, qty: Math.min(l.stock, u.qty + n.pv.qty) } : u) : [...n.cart, { id: l.id, qty: n.pv.qty }], ot(e, "Listo para pagar. Revisa el checkout.");
    return;
  } else if (s === "drawer") n.drawer = !n.drawer;
  else if (s === "line") {
    const l = Number(r), d = rt(i);
    n.cart = n.cart.map((u) => u.id === i ? { ...u, qty: Math.max(1, Math.min(d?.stock ?? 99, u.qty + l)) } : u);
  } else if (s === "rm" && c) {
    n.cart = n.cart.filter((l) => l.id !== i), ot(e, `${c.name} quitado`);
    return;
  } else if (s === "coupon") {
    n.coupon.trim() === "FLOTA10" ? (n.couponOk = !0, ot(e, "Cupón FLOTA10 aplicado · 10% de descuento")) : (n.couponOk = !1, ot(e, "Cupón no válido · prueba FLOTA10"));
    return;
  } else if (s === "go-check") ot(e, "Continúa en Checkout para pagar el pedido.");
  else if (s === "pd") n.pv = { ...n.pv, qty: Math.max(1, Math.min(99, n.pv.qty + Number(o))) };
  else if (s === "side" && (o === "del" || o === "tra")) n.pv = { ...n.pv, side: o };
  else if (s === "qual" && (o === "orig" || o === "alt" || o === "eco")) n.pv = { ...n.pv, q: o };
  else if (s === "img") n.pv = { ...n.pv, img: Number(o) };
  else if (s === "next" || s === "back" || s === "restart") Io(e, n, s);
  else if (s === "ship" && (o === "std" || o === "exp" || o === "pick")) n.co = { ...n.co, ship: o };
  else if (s === "pay" && (o === "card" || o === "transfer" || o === "credit")) n.co = { ...n.co, pay: o };
  else if (s === "facet") xn(n, o, decodeURIComponent(r));
  else if (s === "chip") Fo(n, o, decodeURIComponent(t.split(":").slice(2).join(":")));
  else if (s === "clearf") n.f = { brand: [], cat: [], stock: !1, max: 0 };
  else if (s === "qclear")
    n.q = "", n.qOpen = !0;
  else if (s === "qgo") {
    const l = decodeURIComponent(o);
    n.recentQ = [l.toLowerCase(), ...n.recentQ.filter((d) => d !== l.toLowerCase())].slice(0, 5), n.q = l, n.qOpen = !1, ot(e, `Buscar: “${l}”`);
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
      n.rv = { ...n.rv, tried: !0 }, bt(e);
      return;
    }
    n.rv = { open: !1, stars: 0, text: "", tried: !1 }, ot(e, "Gracias. Tu reseña se publicará tras moderación");
    return;
  } else if (s === "pftab" && (o === "veh" || o === "plate")) n.pf = { ...n.pf, tab: o, done: !1 };
  else if (s === "pfgo") Oo(e, n);
  else if (s === "pfreset") n.pf = { ...n.pf, brand: "", model: "", year: "", sys: "", plate: "", done: !1 };
  else if (s === "qadd" && c) n.quote = [...n.quote, { id: i, qty: 10 }];
  else if (s === "qq") n.quote = n.quote.map((l) => l.id === i ? { ...l, qty: Math.max(1, l.qty + Number(r)) } : l);
  else if (s === "qqrm") n.quote = n.quote.filter((l) => l.id !== i);
  else if (s === "qsend") {
    if (!n.quote.length) {
      ot(e, "Agrega al menos un producto");
      return;
    }
    n.quoteSent = !0;
  } else if (s === "qnew")
    n.quote = [], n.quoteNote = "", n.quoteSent = !1;
  else if (s === "bulksample") n.bulkText = R.slice(0, 4).map((l, d) => `${l.code}, ${d + 2}`).join(`
`);
  else if (s === "bulkparse") n.bulkRows = zo(n.bulkText);
  else if (s === "bulkok") {
    const l = (n.bulkRows ?? []).filter((d) => d.ok);
    if (!l.length) return;
    l.forEach((d) => {
      const u = R.find((f) => f.code === d.code);
      if (!u) return;
      const p = n.cart.find((f) => f.id === u.id);
      n.cart = p ? n.cart.map((f) => f.id === u.id ? { ...f, qty: f.qty + d.qty } : f) : [...n.cart, { id: u.id, qty: d.qty }];
    }), n.bulkRows = null, n.bulkText = "", ot(e, `${l.length} productos agregados al carrito`);
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
    const l = rt(1), d = [l, ...R.filter((u) => u.id !== l.id).slice(1, 3)].filter((u) => n.fbtOff[u.id] !== !1);
    ot(e, `Combo agregado al carrito · ${d.length} productos`);
    return;
  } else if (s === "payinv") {
    n.paid = [...n.paid, o], ot(e, `${o} pagada`);
    return;
  } else s === "rmaitem" ? n.rma = { ...n.rma, item: i } : s === "rmareason" ? n.rma = { ...n.rma, reason: decodeURIComponent(o) } : s === "rmamethod" && (o === "refund" || o === "credit" || o === "exchange") ? n.rma = { ...n.rma, method: o } : (s === "rmanext" || s === "rmaback" || s === "rmarestart") && Vo(n, s);
  bt(e);
}
function Io(e, t, a) {
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
function xn(e, t, a) {
  const n = e.f[t];
  e.f = { ...e.f, [t]: n.includes(a) ? n.filter((s) => s !== a) : [...n, a] };
}
function Fo(e, t, a) {
  t === "brand" || t === "cat" ? e.f = { ...e.f, [t]: e.f[t].filter((n) => n !== a) } : t === "stock" ? e.f = { ...e.f, stock: !1 } : e.f = { ...e.f, max: 0 };
}
function Oo(e, t) {
  if (t.pf.tab === "plate") {
    if (!/^[A-Z]{4}-?\d{2}$/.test(t.pf.plate)) {
      ot(e, "Patente con formato ABCD-12");
      return;
    }
    const a = R[t.pf.plate.charCodeAt(0) % R.length], [n, ...s] = a.app.split(" ");
    t.pf = { ...t.pf, brand: n, model: s.join(" "), year: "2021", sys: "", done: !0 }, bt(e);
    return;
  }
  t.pf.year && (t.pf = { ...t.pf, done: !0 });
}
function zo(e) {
  return e.split(/\n/).map((t) => t.trim()).filter(Boolean).map((t) => {
    const a = t.split(/[,;\t]|\s{2,}/).map((r) => r.trim()).filter(Boolean), n = (a[0] || "").toUpperCase(), s = Number(a[1]) || 1, o = R.find((r) => r.code === n);
    return { code: n, qty: s, ok: !!o, name: o ? o.name : "No encontrado" };
  });
}
function Vo(e, t) {
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
function Qa(e, t) {
  if (!(t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement)) return;
  const a = $t.get(e);
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
    n !== "coupon" && bt(e);
  }
}
function Ka(e) {
  e.dataset.kind !== "eflash" || Wa.has(e) || (Wa.add(e), window.setInterval(() => {
    e.isConnected && e.dataset.kind === "eflash" && bt(e);
  }, 1e3));
}
function oa(e = document) {
  e.querySelectorAll("td-ecom").forEach((t) => {
    const a = t.dataset.kind || "ecard", n = $t.get(t);
    if (n) {
      (n.kind !== a || t.childElementCount === 0) && ($t.set(t, Ga(a)), bt(t), Ka(t));
      return;
    }
    const s = Ga(a);
    $t.set(t, s), t.addEventListener("click", (o) => {
      const r = o.target instanceof Element ? o.target.closest("[data-ec]") : null;
      r instanceof HTMLElement && (r instanceof HTMLInputElement || Ro(t, r.dataset.ec || "", o));
    }), t.addEventListener("change", (o) => {
      const r = o.target;
      if (r instanceof HTMLInputElement && r.dataset.ec === "fstock") {
        const i = $t.get(t);
        i && (i.f = { ...i.f, stock: r.checked }), bt(t);
        return;
      }
      if (r instanceof HTMLInputElement && r.dataset.ec === "diff") {
        const i = $t.get(t);
        i && (i.cmpDiff = r.checked), bt(t);
        return;
      }
      if (r instanceof HTMLInputElement && r.dataset.ec?.startsWith("facet:")) {
        const [, i, c] = r.dataset.ec.split(":"), l = $t.get(t);
        l && (i === "brand" || i === "cat") && xn(l, i, decodeURIComponent(c)), bt(t);
        return;
      }
      if (r instanceof HTMLInputElement && r.dataset.ec?.startsWith("fbt:")) {
        const i = $t.get(t), c = Number(r.dataset.ec.split(":")[1]);
        i && (i.fbtOff = { ...i.fbtOff, [c]: !r.checked }), bt(t);
        return;
      }
      Qa(t, o.target);
    }), t.addEventListener("input", (o) => {
      const r = o.target;
      r instanceof HTMLSelectElement || Qa(t, r);
    }), bt(t), Ka(t);
  });
}
const ee = {
  text: "Texto",
  line: "Línea",
  box: "Recuadro",
  image: "Imagen",
  qr: "QR",
  barcode: "Código de barras"
}, oe = "Barlow, Arial, Helvetica, sans-serif", ra = '"JetBrains Mono", Consolas, monospace';
function K(e, t, a) {
  return Math.max(t, Math.min(a, e));
}
function St(e) {
  return Math.round(e * 100) / 100;
}
function V(e) {
  return e.replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t] ?? t);
}
function Uo(e) {
  return `$ ${Math.round(e).toLocaleString("es-CL")}`;
}
function Fe(e) {
  return JSON.parse(JSON.stringify(e));
}
function dt(e, t, a, n, s, o = {}) {
  return { id: "", type: e, x: t, y: a, w: n, h: s, ...o };
}
function J(e, t, a, n, s, o, r = {}) {
  return dt("text", e, t, a, n, { text: s, size: o, bold: !1, align: "left", ...r });
}
function xa() {
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
            dt("image", 0, 0, 40, 15, { text: "Logo" }),
            J(0, 18, 110, 6, "Distribuidora de Repuestos SpA", 4.4, { bold: !0 }),
            J(0, 25, 115, 4, "RUT 77.123.456-7 · Av. Américo Vespucio 1500, Quilicura", 2.6),
            dt("box", 120, 0, 66, 27, { thick: 0.5 }),
            J(120, 3.5, 66, 4.5, "FACTURA ELECTRÓNICA", 3.4, { bold: !0, align: "center" }),
            J(120, 10, 66, 7, "N° {?NumeroFactura}", 5.6, { bold: !0, align: "center" }),
            J(120, 19.5, 66, 4, "Fecha {?Fecha|date}", 2.8, { align: "center" }),
            dt("line", 0, 34, 186, 0.3, { thick: 0.3 }),
            J(0, 37.5, 60, 3.5, "CLIENTE", 2.4, { bold: !0 }),
            J(0, 41.5, 140, 5.5, "{?Cliente}", 4.2, { bold: !0 }),
            J(0, 48.5, 140, 4, "RUT {?RutCliente} · Vendedor {?Vendedor}", 2.7),
            dt("qr", 164, 37, 22, 22, { text: "https://sii.cl/verificar/{?NumeroFactura}" })
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
            dt("barcode", 0, 12, 72, 16, { text: "{?NumeroFactura}", format: "c128", showText: !0 }),
            J(110, 4, 40, 4.5, "Subtotal", 3, { align: "right" }),
            J(152, 4, 34, 4.5, "{=sum(Lineas, cantidad*precio)|money}", 3, { align: "right" }),
            J(110, 10, 40, 4.5, "IVA 19%", 3, { align: "right" }),
            J(152, 10, 34, 4.5, "{=sum(Lineas, cantidad*precio)*0.19|money}", 3, { align: "right" }),
            dt("line", 120, 16.5, 66, 0.4, { thick: 0.4 }),
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
            dt("line", 0, 22, 186, 0.6, { thick: 0.6 }),
            dt("qr", 170, 0, 16, 16, { text: "stock:{?Bodega}:{?FechaCorte}" })
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
            dt("line", 0, 2, 186, 0.4, { thick: 0.4 }),
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
function Wo() {
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
function Oe(e) {
  e.bands.header.elements.forEach((t, a) => {
    t.id || (t.id = `h${a}`);
  }), e.bands.footer.elements.forEach((t, a) => {
    t.id || (t.id = `f${a}`);
  });
}
function wa(e) {
  return Object.fromEntries(e.parameters.map((t) => [t.name, t.value]));
}
function Go() {
  const e = Fe(xa().factura);
  return Oe(e), {
    mode: "design",
    tplKey: "factura",
    tpl: e,
    sel: null,
    rows: 8,
    pv: wa(e),
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
function Jo(e, t) {
  const a = t.dataset.report;
  (a === "factura" || a === "stock") && (e.tplKey = a, e.tpl = Fe(xa()[a]), Oe(e.tpl), e.pv = wa(e.tpl), e.sel = null, e.runData = null, e.runParams = null, e.json = null);
  const n = Number(t.dataset.rows);
  n && (e.rows = K(Math.round(n), 1, 60));
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
function yt(e, t, a, n, s) {
  t.fileMsg = a, t.fileBad = n, window.clearTimeout(t.timer), t.timer = window.setTimeout(() => {
    t.fileMsg = "", e.isConnected && s();
  }, 4500);
}
function pe(e) {
  return e === "Carta" ? [216, 279] : [210, 297];
}
function Kt(e) {
  const [t] = pe(e.page.size);
  return t - e.page.margin * 2;
}
function Qo(e, t) {
  return e === "Repuestos" ? Array.from({ length: t }, (a, n) => {
    const s = R[n % R.length];
    return { codigo: s.code, nombre: s.name, marca: s.brand, categoria: s.cat, stock: s.stock, precio: s.price };
  }) : Array.from({ length: t }, (a, n) => {
    const s = R[n % R.length];
    return { codigo: s.code, descripcion: s.name, cantidad: n * 7 % 4 + 1, precio: s.price };
  });
}
function ae(e, t) {
  if (e == null || e === "") return "";
  if (t === "money") return Uo(Math.round(Number(e) || 0));
  if (t === "number") return (Number(e) || 0).toLocaleString("es-CL");
  if (t === "date") {
    const a = String(e).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return a ? `${a[3]}/${a[2]}/${a[1]}` : String(e);
  }
  return String(e);
}
function Sa(e, t, a, n) {
  let s = String(e).replace(/\?([A-Za-z_][A-Za-z0-9_]*)/g, (o, r) => {
    const i = n[r];
    return Number.isNaN(Number(i)) || i === "" ? JSON.stringify(String(i ?? "")) : String(Number(i));
  });
  if (s = s.replace(/(sum|avg|min|max)\(\s*(\w+)\s*,\s*([^)]*)\)/g, (o, r, i, c) => {
    const l = (a[i] || []).map((d) => Number(Sa(c, d, a, n)) || 0);
    return l.length ? String(r === "sum" ? l.reduce((d, u) => d + u, 0) : r === "avg" ? l.reduce((d, u) => d + u, 0) / l.length : r === "min" ? Math.min(...l) : Math.max(...l)) : "0";
  }), s = s.replace(/count\(\s*(\w+)\s*\)/g, (o, r) => String((a[r] || []).length)), t && (s = s.replace(/"[^"]*"|\b([A-Za-z_]\w*)\b/g, (o, r) => {
    if (!r || !(r in t)) return o;
    const i = t[r];
    return typeof i == "number" ? String(i) : JSON.stringify(String(i));
  })), /^\s*"[^"]*"\s*$/.test(s)) return JSON.parse(s);
  if (!/^[0-9.+\-*/()<>=!?: ]*$/.test(s)) throw new Error(`Expresión no válida: ${e}`);
  return Function(`"use strict"; return (${s.trim() || "0"})`)();
}
function Me(e, t, a, n, s, o) {
  return String(e ?? "").replace(/\{([^{}]+)\}/g, (r, i) => {
    const [c, l = ""] = i.split("|");
    try {
      if (c === "page") return String(a ? a[0] : 1);
      if (c === "pages") return String(a ? a[1] : 1);
      if (c === "now") return ae((/* @__PURE__ */ new Date()).toISOString().slice(0, 10), l || "date");
      if (c.startsWith("?")) {
        const d = c.slice(1), u = n.parameters.find((p) => p.name === d);
        return ae(o[d], l || (u?.type === "fecha" ? "date" : ""));
      }
      return c.startsWith("=") ? ae(Sa(c.slice(1), t, s, o), l) : t && c in t ? ae(t[c], l) : r;
    } catch {
      return "#ERR";
    }
  });
}
function Ko(e, t, a, n) {
  try {
    const s = e.expr in t ? t[e.expr] : Sa(e.expr, t, a, n);
    return ae(s, e.fmt);
  } catch {
    return "#ERR";
  }
}
function Za(e, t) {
  return e.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "").replace("<svg ", `<svg preserveAspectRatio="${t ? "xMidYMid meet" : "none"}" style="width:100%;height:100%;display:block" `);
}
function wn(e, t, a, n, s, o, r) {
  const i = `position:absolute;left:${t(e.x)};top:${t(e.y)};width:${t(e.w)};height:${t(e.h)};`;
  if (e.type === "text")
    return `<div style="${i}font:${e.bold ? 700 : 400} ${t(e.size || 3)}/1.15 ${oe};text-align:${e.align || "left"};white-space:nowrap;overflow:hidden;color:#0A0B0C">${V(Me(e.text || "", a, n, s, o, r))}</div>`;
  if (e.type === "line") return `<div style="${i}height:${t(e.thick || 0.3)};background:#0A0B0C"></div>`;
  if (e.type === "box") return `<div style="${i}box-sizing:border-box;border:${t(e.thick || 0.3)} solid #0A0B0C"></div>`;
  if (e.type === "image")
    return `<div style="${i}box-sizing:border-box;border:${t(0.3)} dashed #9CA3AB;background:#F1F2F4;display:flex;align-items:center;justify-content:center;font:500 ${t(2.6)} ${ra};color:#6E757D">${V(e.text || "Imagen")}</div>`;
  if (e.type === "qr") {
    const c = Me(e.text || "", a, n, s, o, r) || " ", l = ma(c, "M", 1, "#0A0B0C", 0);
    if (l.error || !l.svg) return `<div style="${i}border:1px dashed #C62828;color:#C62828;font:500 ${t(2.4)} ${oe};display:flex;align-items:center;justify-content:center">QR no válido</div>`;
    const d = Math.min(e.w, e.h);
    return `<div style="position:absolute;left:${t(e.x)};top:${t(e.y)};width:${t(d)};height:${t(d)}">${Za(l.svg, !0)}</div>`;
  }
  if (e.type === "barcode") {
    const c = Me(e.text || "", a, n, s, o, r), l = fa(e.format === "ean13" ? "ean13" : "c128", c, 1, 40, "#0A0B0C", !1);
    if (l.error || !l.svg) return `<div style="${i}border:1px dashed #C62828;color:#C62828;font:500 ${t(2.4)} ${oe};display:flex;align-items:center;padding:0 4px">Código no válido</div>`;
    const d = e.showText ? Math.min(3.2, e.h * 0.22) : 0;
    return `<div style="${i}display:flex;flex-direction:column"><div style="flex:1;min-height:0">${Za(l.svg, !1)}</div>${d ? `<div style="text-align:center;font:${t(d)}/1.2 ${ra};letter-spacing:.08em">${V(l.value)}</div>` : ""}</div>`;
  }
  return "";
}
function Sn(e, t, a, n, s) {
  const o = e.bands.detail, r = o.columns.reduce((d, u) => d + (Number(u.w) || 0), 0) || 100, i = o.columns.map((d) => `<col style="width:${(Number(d.w) || 0) / r * 100}%">`).join(""), c = `<thead><tr>${o.columns.map((d) => `<th style="height:${a(o.headHeight)};padding:0 ${a(1.5)};background:#EEF0F2;border-top:${a(0.3)} solid #0A0B0C;border-bottom:${a(0.3)} solid #0A0B0C;font-weight:700;font-size:${a(2.5)};text-transform:uppercase;letter-spacing:.04em;text-align:${d.align || "left"};white-space:nowrap;overflow:hidden">${V(d.title)}</th>`).join("")}</tr></thead>`, l = t.map((d, u) => `<tr style="background:${o.zebra && u % 2 ? "#F6F7F8" : "#FFFFFF"}">${o.columns.map((p) => `<td style="height:${a(o.rowHeight)};padding:0 ${a(1.5)};border-bottom:${a(0.2)} solid #DCDFE3;text-align:${p.align || "left"};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${/^(codigo|code)$/.test(p.expr) ? `font-family:${ra};font-size:${a(2.5)};` : ""}">${V(Ko(p, d, n, s))}</td>`).join("")}</tr>`).join("");
  return `<table style="position:absolute;left:0;top:0;width:${a(Kt(e))};border-collapse:collapse;table-layout:fixed;font:400 ${a(2.8)} ${oe};color:#0A0B0C"><colgroup>${i}</colgroup>${c}<tbody>${l}</tbody></table>`;
}
function En(e, t) {
  const [, a] = pe(e.page.size), n = e.page.margin, s = e.bands.detail, o = a - n - 7, r = [{ items: [] }];
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
function _n(e, t, a, n, s, o, r, i) {
  const [c, l] = pe(e.page.size), d = e.page.margin, u = Kt(e), p = t.items.map((m) => {
    const b = m.kind === "table" ? Sn(e, m.rows || [], s, r, i) : e.bands[m.kind].elements.map((h) => wn(h, s, o, [a + 1, n], e, r, i)).join("");
    return `<div style="position:absolute;left:${s(d)};top:${s(m.y)};width:${s(u)};height:${m.kind === "table" ? "auto" : s(e.bands[m.kind].height)}">${b}</div>`;
  }).join(""), f = d - 6 > 2 ? d - 6 : 3;
  return `<div style="position:relative;width:${s(c)};height:${s(l)};background:#fff;overflow:hidden;box-sizing:border-box">${p}<div style="position:absolute;left:${s(d)};right:${s(d)};bottom:${s(f)};display:flex;justify-content:space-between;font:400 ${s(2.3)} ${oe};color:#6E757D"><span>${V(e.name)}</span><span>Página ${a + 1} de ${n}</span></div></div>`;
}
function kn(e) {
  return `${(e || "reporte").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w-]+/g, "-")}.uxr`;
}
function Mn(e, t) {
  const a = t ? { ...e, savedAt: (/* @__PURE__ */ new Date()).toISOString() } : e;
  return JSON.stringify(a, null, 2);
}
function Ln(e) {
  if (e.sel?.kind !== "el") return null;
  const { band: t, id: a } = e.sel;
  return e.tpl.bands[t].elements.find((n) => n.id === a) ?? null;
}
function Ea(e) {
  return e && e.kind !== "detail" ? e.band : "header";
}
function _a(e) {
  return e.nid += 1, `r${e.nid}`;
}
function U(e, t) {
  const a = Fe(e.tpl);
  t(a), e.tpl = a, e.json = null;
}
function An(e, t) {
  if (!t || typeof t != "object") throw new Error("el archivo no tiene una plantilla");
  const a = t;
  if (a.format !== "uiux-report" || !a.bands?.detail || !a.bands.header || !a.bands.footer)
    throw new Error("no es una plantilla de reporte .uxr");
  if (!Array.isArray(a.bands.detail.columns) || !Array.isArray(a.parameters))
    throw new Error("faltan las columnas o los parámetros");
  return a.version = 1, a.page = { size: a.page?.size === "Carta" ? "Carta" : "A4", margin: K(Number(a.page?.margin) || 12, 5, 30) }, a.bands.header.elements = a.bands.header.elements || [], a.bands.footer.elements = a.bands.footer.elements || [], a.bands.header.height = K(Number(a.bands.header.height) || 20, 5, 200), a.bands.footer.height = K(Number(a.bands.footer.height) || 16, 5, 200), Oe(a), e.tpl = a, e.sel = null, e.json = null, e.runData = null, e.runParams = null, e.pv = Object.fromEntries((a.parameters || []).map((n) => [n.name, String(n.value ?? "")])), a.name || "Plantilla";
}
function Le(e) {
  const t = e.tpl, a = t.bands.detail.source || "Lineas", n = e.runData && e.runData[a] || Qo(a, e.rows), s = { [a]: n }, o = e.runParams || e.pv;
  return { tpl: t, source: a, rows: n, sources: s, params: o, sample: n[0] || {} };
}
function Qe(e, t, a, n) {
  const s = Ln(t);
  if (s && (s.type === "text" || s.type === "qr" || s.type === "barcode")) {
    U(t, (i) => {
      const c = t.sel?.kind === "el" ? t.sel.band : "header", l = i.bands[c].elements.find((d) => d.id === s.id);
      l && (l.text = l.type === "text" ? `${l.text ? `${l.text} ` : ""}${a}` : a);
    });
    return;
  }
  if (t.sel?.kind === "detail") {
    yt(e, t, "Selecciona un texto del encabezado o del pie. En el detalle, escribe el campo en la columna.", !0, n);
    return;
  }
  const o = Ea(t.sel), r = _a(t);
  U(t, (i) => {
    i.bands[o].elements.push(J(0, 0, 80, 5, a, 3.2));
    const c = i.bands[o].elements.at(-1);
    c && (c.id = r);
  }), t.sel = { kind: "el", band: o, id: r };
}
function Se(e, t, a) {
  return `<div class="td-ecom__seg" role="group">${e.map(([n, s]) => `<button type="button" data-st="${a(n)}" aria-pressed="${t === n}">${s}</button>`).join("")}</div>`;
}
function Ke(e, t, a) {
  return `<button type="button" class="td-rpt__switch" role="switch" aria-checked="${e}" data-st="${a}"><span class="td-rpt__track${e ? " is-on" : ""}" aria-hidden="true"></span>${t}</button>`;
}
function ht(e, t) {
  return `<label>${e}${t}</label>`;
}
function Zo(e) {
  const { tpl: t, source: a, rows: n, sources: s, params: o, sample: r } = Le(e), [i, c] = pe(t.page.size), l = t.page.margin, d = e.mode, u = (C) => (I) => `${St(I * C)}px`, p = K((e.avail - 44) / i, 1.4, 4.2);
  e.scale = p;
  const f = u(p), m = t.bands.detail, b = Object.keys(n[0] || { codigo: "", descripcion: "" }), h = b.find((C) => typeof (n[0] || {})[C] == "number") || "cantidad", g = [
    ["Σ suma", `{=sum(${a}, ${h})|number}`],
    ["# conteo", `{=count(${a})}`],
    ["Página", "Página {page} de {pages}"],
    ["Hoy", "{now|date}"]
  ], w = e.fileMsg || "El archivo .uxr guarda bandas, parámetros y fuentes. Se reutiliza pasando otros valores y datos.", v = e.fileMsg ? e.fileBad ? "is-bad" : "is-ok" : "", E = Ea(e.sel) === "header" ? "encabezado" : "pie", x = En(t, n), y = K((e.avail - 60) / i, 1, 3.2), S = u(y), $ = (C, I) => {
    const Y = t.bands[C].height, ft = e.sel?.kind === "band" && e.sel.band === C, _ = t.bands[C].elements.map((A) => {
      const G = e.sel?.kind === "el" && e.sel.band === C && e.sel.id === A.id, gt = A.type === "line" ? Math.max(A.h, 1.6) : A.type === "qr" ? Math.min(A.w, A.h) : A.h, mt = A.type === "line" ? A.y - (gt - A.h) / 2 : A.y, Pt = A.type === "qr" ? Math.min(A.w, A.h) : A.w;
      return `<button type="button" class="td-rpt__hit${G ? " is-on" : ""}" data-st="rhit:${C}:${A.id}" aria-label="${ee[A.type]} en ${A.x}, ${A.y} mm" aria-pressed="${G}" style="left:${f(A.x)};top:${f(mt)};width:${f(Pt)};height:${f(gt)}">${G ? `<span class="td-studio__tag">${ee[A.type]} · ${St(A.w)}×${St(A.h)}</span><span class="td-studio__grip" data-st="rsize:${C}:${A.id}" aria-hidden="true"></span>` : ""}</button>`;
    }).join(""), L = t.bands[C].elements.map((A) => wn(A, f, r, [1, x.length || 1], t, s, o)).join("");
    return `<div class="td-rpt__bandbox" style="margin:0 ${f(l)}"><button type="button" class="td-rpt__strip${ft ? " is-on" : ""}" data-st="rband:${C}" aria-pressed="${ft}"><span>${I}</span><span>${Y} mm</span></button><div class="td-rpt__band" style="height:${f(Y)}">${L}${_}</div></div>`;
  }, k = e.sel?.kind === "detail", N = m.headHeight + Math.min(3, Math.max(n.length, 1)) * m.rowHeight + 2, O = `<div class="td-rpt__bandbox" style="margin:0 ${f(l)}"><button type="button" class="td-rpt__strip${k ? " is-on" : ""}" data-st="rdetail" aria-pressed="${k}"><span>Detalle · ${V(a)} · se repite por fila</span><span>${m.rowHeight} mm/fila</span></button><div class="td-rpt__band" style="height:${f(N)}">${Sn(t, n.slice(0, 3), f, s, o)}<button type="button" class="td-rpt__hit${k ? " is-on" : ""}" data-st="rdetail" aria-label="Tabla de detalle" aria-pressed="${k}" style="left:0;top:0;width:${f(Kt(t))};height:${f(N - 2)};cursor:pointer">${k ? `<span class="td-studio__tag">Detalle · ${m.columns.length} columnas</span>` : ""}</button></div></div>`, X = ["text", "line", "box", "image", "qr", "barcode"].map((C) => `<button type="button" data-st="radd:${C}"><b>+</b> ${ee[C]}</button>`).join(""), ct = m.columns.reduce((C, I) => C + (Number(I.w) || 0), 0), M = t.parameters.length ? t.parameters.map((C, I) => `<div class="td-rpt__param"><input data-st-in="pname:${I}" value="${V(C.name)}" aria-label="Nombre del parámetro"><select data-st-in="ptype:${I}" aria-label="Tipo de ${V(C.name) || "parámetro"}"><option value="texto" ${C.type === "texto" ? "selected" : ""}>Texto</option><option value="numero" ${C.type === "numero" ? "selected" : ""}>Número</option><option value="fecha" ${C.type === "fecha" ? "selected" : ""}>Fecha</option></select><button type="button" class="td-rpt__x" data-st="pdel:${I}" aria-label="Quitar parámetro ${V(C.name) || I + 1}">×</button><button type="button" class="td-rpt__token" data-st="pins:${I}" title="Insertar en el elemento seleccionado">{?${V(C.name)}}</button></div>`).join("") : '<p class="td-rpt__hint">Todavía no hay parámetros. Agrega uno para usarlo como {?Nombre} en el reporte.</p>', H = `<div class="td-rpt__card"><span class="td-section-title">Fuente de datos · ${V(a)}</span><div class="td-rpt__chips">${b.map((C) => `<button type="button" class="td-rpt__token" data-st="fins:${C}" title="Insertar {${C}}">{${V(C)}}</button>`).join("")}</div><span class="td-section-title">Fórmulas</span><div class="td-rpt__chips">${g.map(([C, I], Y) => `<button type="button" class="td-rpt__token" data-st="qins:${Y}" title="${V(I)}">${C}</button>`).join("")}</div><p class="td-rpt__hint">Clic para insertar en el elemento seleccionado. Sin selección, se crea un texto nuevo en el ${E}.</p></div>`, P = Ln(e);
  let lt = "";
  if (P && e.sel?.kind === "el") {
    const C = e.sel.band === "header" ? "encabezado" : "pie", I = Me(P.text || "", r, [1, x.length || 1], t, s, o), Y = I.includes("#ERR");
    lt = `<div class="td-rpt__head"><span class="td-section-title">${ee[P.type]} · ${C}</span><button type="button" data-st="rdup">Duplicar</button><button type="button" class="is-danger" data-st="rdel">Eliminar</button></div>
            <div class="td-rpt__geo">${[["x", "X"], ["y", "Y"], ["w", "Ancho"], ["h", "Alto"]].map(([ft, _]) => ht(_, `<input type="number" step="0.5" data-st-in="rgeo:${ft}" value="${P[ft]}" aria-label="${_}">`)).join("")}</div>
            ${P.text != null || P.type === "text" || P.type === "image" || P.type === "qr" || P.type === "barcode" ? `${ht(P.type === "text" ? "Texto · {?param} {campo} {=fórmula}" : P.type === "image" ? "Etiqueta de la imagen" : "Valor a codificar", `<input data-st-in="rtext" value="${V(P.text || "")}">`)}<span class="td-rpt__hint">${Y ? "No se pudo resolver. Revisa el parámetro, el campo o la fórmula." : `Vista previa: ${V(I)}`}</span>` : ""}
            ${P.type === "text" ? `<div class="td-rpt__geo td-rpt__geo--text">${ht("Alto mm", `<input type="number" step="0.2" data-st-in="rsize" value="${P.size ?? 3}">`)}${Se([["left", "Izq."], ["center", "Centro"], ["right", "Der."]], P.align || "left", (ft) => `ralign:${ft}`)}</div>${Ke(!!P.bold, "Negrita", "rbold")}` : ""}
            ${P.type === "barcode" ? Se([["c128", "Code 128"], ["ean13", "EAN-13"]], P.format === "ean13" ? "ean13" : "c128", (ft) => `rbc:${ft}`) + Ke(!!P.showText, "Texto legible", "rshow") : ""}
            ${P.type === "line" || P.type === "box" ? ht("Grosor mm", `<input type="number" step="0.1" data-st-in="rthick" value="${P.thick ?? 0.3}" style="width:90px">`) : ""}
            <p class="td-rpt__hint">Arrastra para mover. La esquina cambia el tamaño. Flechas: 0,5 mm. Mayús: 2 mm. Supr elimina.</p>`;
  } else if (k) {
    const C = ct === 100 ? "100%" : `${ct}% · la tabla los reparte al ancho completo`;
    lt = `<span class="td-section-title">Banda de detalle</span>
            <div class="td-rpt__detail">${ht("Fuente", `<input data-st-in="rsrc" value="${V(a)}" aria-label="Nombre de la fuente">`)}${ht("Fila mm", `<input type="number" step="0.5" data-st-in="rrowh" value="${m.rowHeight}">`)}${ht("Título mm", `<input type="number" step="0.5" data-st-in="rheadh" value="${m.headHeight}">`)}</div>
            ${Ke(m.zebra, "Filas alternadas", "rzebra")}
            <div class="td-rpt__head"><span class="td-section-title">Columnas · ${C}</span><button type="button" data-st="cadd">+ Columna</button></div>
            ${m.columns.length ? m.columns.map((I, Y) => `<div class="td-rpt__col"><input data-st-in="ctitle:${Y}" value="${V(I.title)}" aria-label="Título de la columna ${Y + 1}"><input type="number" data-st-in="cw:${Y}" value="${I.w}" aria-label="Ancho en porcentaje" title="Ancho %"><button type="button" class="td-rpt__x" data-st="cdel:${Y}" aria-label="Quitar columna ${V(I.title) || Y + 1}">×</button><input data-st-in="cexpr:${Y}" value="${V(I.expr)}" aria-label="Campo o expresión" placeholder="campo o expresión"><select class="td-rpt__span2" data-st-in="cfmt:${Y}" aria-label="Formato"><option value="" ${I.fmt ? "" : "selected"}>Texto</option><option value="number" ${I.fmt === "number" ? "selected" : ""}>Número</option><option value="money" ${I.fmt === "money" ? "selected" : ""}>Moneda</option><option value="date" ${I.fmt === "date" ? "selected" : ""}>Fecha</option></select></div>`).join("") : '<p class="td-rpt__hint">La tabla no tiene columnas. Agrega al menos una para ver las filas.</p>'}`;
  } else e.sel?.kind === "band" ? lt = `<span class="td-section-title">${e.sel.band === "header" ? "Encabezado del reporte" : "Pie del reporte"}</span>${ht("Alto de la banda mm", `<input type="number" step="1" data-st-in="rbandh" value="${t.bands[e.sel.band].height}" style="width:110px">`)}<p class="td-rpt__hint">Este alto reserva espacio en cada página antes del detalle o después de él.</p>` : lt = `<span class="td-section-title">Página</span>${Se([["A4", "A4"], ["Carta", "Carta"]], t.page.size, (C) => `rpage:${C}`)}${ht("Margen mm", `<input type="number" step="1" data-st-in="rmargin" value="${l}" style="width:90px">`)}<p class="td-rpt__hint">Selecciona un elemento, la tabla de detalle o el nombre de una banda para editarlos.</p>`;
  const Vt = `<div class="td-rpt__tools" role="toolbar" aria-label="Insertar elemento">${X}<span class="td-rpt__hint">Se agrega en: ${E}</span></div>
        <div class="td-rpt__sheetwrap"><div class="td-rpt__sheet" style="width:${f(i)};padding:${f(l)} 0">${$("header", "Encabezado del reporte")}${O}${$("footer", "Pie del reporte")}</div></div>
        <p class="td-rpt__hint">${t.page.size} ${i} × ${c} mm · margen ${l} mm · ${t.bands.header.elements.length + t.bands.footer.elements.length} elementos · ${m.columns.length} columnas</p>`, fe = `<div class="td-rpt__sheetwrap td-rpt__sheetwrap--pages">${x.map((C, I) => `<div class="td-rpt__paper" role="img" aria-label="Página ${I + 1} de ${x.length}">${_n(t, C, I, x.length, S, r, s, o)}</div>`).join("")}</div>`, me = Mn(t, !1), Ut = e.json ?? me, he = JSON.stringify({ parameters: o, dataSources: { [a]: n.slice(0, 3) } }, null, 2), be = `<div class="td-rpt__card"><span class="td-section-title">Plantilla .uxr · JSON editable</span><textarea data-st-in="rjson" rows="16" spellcheck="false" aria-label="Plantilla JSON">${V(Ut)}</textarea><div class="td-rpt__actions"><button type="button" class="td-studio__primary" data-st="rapply">Aplicar plantilla</button><button type="button" data-st="rreset">Descartar cambios</button><span class="${e.jsonBad ? "is-bad" : e.jsonMsg ? "is-ok" : ""} td-rpt__status">${V(e.jsonMsg || (e.json != null ? "Cambios sin aplicar" : "Sincronizada con el diseño"))}</span></div></div>
        <div class="td-rpt__card"><span class="td-section-title">Datos de ejecución · parámetros y fuentes</span><textarea data-st-in="rdata" rows="12" spellcheck="false" aria-label="Datos de ejecución">${V(e.dataJson ?? he)}</textarea><div class="td-rpt__actions"><button type="button" class="td-studio__primary" data-st="rrun">Ejecutar y ver</button><span class="${e.dataBad ? "is-bad" : ""} td-rpt__status">${V(e.dataMsg || "Ejecuta el reporte con estos datos, igual que desde el servidor.")}</span></div></div>`, ge = `var pdf = await Reports.RenderPdfAsync(
    "Reports/${kn(t.name)}",
    parameters: new()
    {
${t.parameters.map((C) => {
    const I = o[C.name] ?? "", Y = C.type === "fecha" ? `DateTime.Parse(${JSON.stringify(String(I))})` : C.type === "numero" ? String(Number(I) || 0) : JSON.stringify(String(I));
    return `        ["${C.name}"] = ${Y}`;
  }).join(`,
`)}
    },
    dataSources: new()
    {
        ["${a}"] = db.${a}
            .Select(x => new { ${b.map((C) => `x.${C.charAt(0).toUpperCase()}${C.slice(1)}`).join(", ")} })
    });

return Results.File(pdf, "application/pdf");`, $e = d === "design" ? `<div class="td-rpt__card"><div class="td-rpt__head"><span class="td-section-title">Parámetros</span><button type="button" data-st="padd">+ Parámetro</button></div>${M}</div>${H}` : d === "preview" ? `<div class="td-rpt__card"><span class="td-section-title">Parámetros del reporte</span>${t.parameters.map((C) => ht(C.name, `<input type="${C.type === "fecha" ? "date" : C.type === "numero" ? "number" : "text"}" data-st-in="rpv:${V(C.name)}" value="${V(o[C.name] ?? "")}">`)).join("")}${ht(`Filas de ${V(a)} · ${e.rows}`, `<input type="range" min="1" max="60" data-st-in="rrows" value="${e.rows}" aria-label="Cantidad de filas">`)}<button type="button" class="td-studio__primary" data-st="rpdf">Imprimir · PDF</button><p class="td-rpt__hint">${n.length} filas · ${x.length} ${x.length === 1 ? "página" : "páginas"} ${t.page.size}</p></div>` : `<div class="td-rpt__card"><div class="td-rpt__head"><span class="td-section-title">Llamada desde C#</span><button type="button" data-st="rcopy">Copiar código</button></div><pre class="td-rpt__pre">${V(ge)}</pre></div>`;
  return `<div class="td-rpt">
        <div class="td-rpt__top">
            ${ht("Plantilla", `<input data-st-in="rname" value="${V(t.name)}" aria-label="Nombre de la plantilla" style="width:200px">`)}
            ${ht("Nueva desde", `<select data-st-in="rtpl" aria-label="Plantilla de partida" style="width:170px"><option value="factura" ${e.tplKey === "factura" ? "selected" : ""}>Factura</option><option value="stock" ${e.tplKey === "stock" ? "selected" : ""}>Informe de stock</option><option value="blank" ${e.tplKey === "blank" ? "selected" : ""}>En blanco</option></select>`)}
            <label class="td-rpt__file">Abrir .uxr<input type="file" data-st-file="uxr" accept=".uxr,.json,application/json" aria-label="Abrir archivo .uxr"></label>
            <button type="button" class="td-studio__primary" data-st="rsave">Guardar .uxr</button>
            <span class="td-rpt__grow"></span>
            ${Se([["design", "Diseño"], ["preview", "Vista previa"], ["code", "Programación"]], d, (C) => `rmode:${C}`)}
        </div>
        <p class="td-rpt__note ${v}" role="status">${V(w)}</p>
        <div class="td-rpt__body">
            <div class="td-rpt__side">${$e}</div>
            <div class="td-rpt__stage">${d === "design" ? Vt : d === "preview" ? fe : be}</div>
            ${d === "design" ? `<div class="td-rpt__inspector"><div class="td-rpt__card">${lt}</div></div>` : ""}
        </div>
    </div>`;
}
function Xo(e, t) {
  const a = Ea(e.sel), n = _a(e), s = e.tpl.parameters[0]?.name || "Param1", o = Kt(e.tpl), r = t === "text" ? J(0, 1, 60, 5, "Texto", 3.2) : t === "line" ? dt("line", 0, 1, o, 0.3, { thick: 0.3 }) : t === "box" ? dt("box", 0, 1, 50, 16, { thick: 0.35 }) : t === "image" ? dt("image", 0, 1, 40, 15, { text: "Imagen" }) : t === "qr" ? dt("qr", 0, 1, 20, 20, { text: `{?${s}}` }) : dt("barcode", 0, 1, 60, 14, { text: `{?${s}}`, format: "c128", showText: !0 });
  r.id = n, U(e, (i) => {
    i.bands[a].elements.push(r);
  }), e.sel = { kind: "el", band: a, id: n };
}
function Yo(e, t, a, n) {
  const [s, o = "", r = ""] = a.split(":"), i = t.tpl;
  if (s === "rmode" && (o === "design" || o === "preview" || o === "code")) t.mode = o;
  else if (s === "rsave") {
    const c = kn(i.name), l = URL.createObjectURL(new Blob([Mn(i, !0)], { type: "application/json" })), d = document.createElement("a");
    d.href = l, d.download = c, d.click(), window.setTimeout(() => URL.revokeObjectURL(l), 2e3), yt(e, t, `${c} guardado · ${i.parameters.length} parámetros · fuente ${i.bands.detail.source}`, !1, n);
  } else if (s === "rpdf") {
    const { rows: c, sources: l, params: d, sample: u } = Le(t), p = En(i, c), f = (w) => `${w}mm`, [m, b] = pe(i.page.size), h = `<!doctype html><html><head><meta charset="utf-8"><title>${V(i.name)}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;700&family=JetBrains+Mono:wght@500&display=swap"><style>@page{size:${m}mm ${b}mm;margin:0}html,body{margin:0;padding:0}.p{break-after:page}</style></head><body>${p.map((w, v) => `<div class="p">${_n(i, w, v, p.length, f, u, l, d)}</div>`).join("")}</body></html>`, g = document.createElement("iframe");
    g.setAttribute("aria-hidden", "true"), g.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0", g.onload = () => window.setTimeout(() => {
      g.contentWindow?.focus(), g.contentWindow?.print(), window.setTimeout(() => g.remove(), 6e4);
    }, 400), g.srcdoc = h, document.body.appendChild(g), yt(e, t, `Listo para imprimir: ${p.length} ${p.length === 1 ? "página" : "páginas"}. En el diálogo elige Guardar como PDF. El diseño no se modificó.`, !1, n);
  } else if (s === "radd" && o in ee) Xo(t, o);
  else if (s === "rband" && (o === "header" || o === "footer")) t.sel = { kind: "band", band: o };
  else if (s === "rdetail") t.sel = { kind: "detail" };
  else if (s === "rhit" && (o === "header" || o === "footer") && r) t.sel = { kind: "el", band: o, id: r };
  else if (s === "rdup" && t.sel?.kind === "el") {
    const c = t.sel.band, l = i.bands[c].elements.find((u) => u.id === (t.sel?.kind === "el" ? t.sel.id : ""));
    if (!l) return;
    const d = _a(t);
    U(t, (u) => {
      u.bands[c].elements.push({ ...l, id: d, y: K(l.y + 3, 0, u.bands[c].height - l.h) });
    }), t.sel = { kind: "el", band: c, id: d };
  } else if (s === "rdel" && t.sel?.kind === "el") {
    const { band: c, id: l } = t.sel;
    U(t, (d) => {
      d.bands[c].elements = d.bands[c].elements.filter((u) => u.id !== l);
    }), t.sel = null;
  } else if (s === "ralign" && t.sel?.kind === "el" && (o === "left" || o === "center" || o === "right")) {
    const { band: c, id: l } = t.sel;
    U(t, (d) => {
      const u = d.bands[c].elements.find((p) => p.id === l);
      u && (u.align = o);
    });
  } else if (s === "rbold" && t.sel?.kind === "el") {
    const { band: c, id: l } = t.sel;
    U(t, (d) => {
      const u = d.bands[c].elements.find((p) => p.id === l);
      u && (u.bold = !u.bold);
    });
  } else if (s === "rshow" && t.sel?.kind === "el") {
    const { band: c, id: l } = t.sel;
    U(t, (d) => {
      const u = d.bands[c].elements.find((p) => p.id === l);
      u && (u.showText = !u.showText);
    });
  } else if (s === "rbc" && t.sel?.kind === "el" && (o === "c128" || o === "ean13")) {
    const { band: c, id: l } = t.sel;
    U(t, (d) => {
      const u = d.bands[c].elements.find((p) => p.id === l);
      u && (u.format = o);
    });
  } else if (s === "rpage" && (o === "A4" || o === "Carta")) U(t, (c) => {
    c.page.size = o;
  });
  else if (s === "padd") {
    const c = `Param${i.parameters.length + 1}`;
    U(t, (l) => {
      l.parameters.push({ name: c, type: "texto", value: "" });
    }), t.pv[c] = "";
  } else if (s === "pdel") {
    const c = Number(o), l = i.parameters[c];
    U(t, (d) => {
      d.parameters.splice(c, 1);
    }), l && delete t.pv[l.name];
  } else if (s === "pins") Qe(e, t, `{?${i.parameters[Number(o)]?.name || ""}}`, n);
  else if (s === "fins") Qe(e, t, `{${o}}`, n);
  else if (s === "qins") {
    const { source: c, rows: l } = Le(t), u = Object.keys(l[0] || {}).find((f) => typeof (l[0] || {})[f] == "number") || "cantidad", p = [`{=sum(${c}, ${u})|number}`, `{=count(${c})}`, "Página {page} de {pages}", "{now|date}"];
    Qe(e, t, p[Number(o)] || "", n);
  } else if (s === "cadd") {
    const { rows: c } = Le(t), l = Object.keys(c[0] || { campo: "" })[0] || "campo";
    U(t, (d) => {
      d.bands.detail.columns.push({ title: "Columna", expr: l, w: 12, fmt: "" });
    });
  } else if (s === "cdel") U(t, (c) => {
    c.bands.detail.columns.splice(Number(o), 1);
  });
  else if (s === "rzebra") U(t, (c) => {
    c.bands.detail.zebra = !c.bands.detail.zebra;
  });
  else if (s === "rapply")
    try {
      const c = An(t, JSON.parse(t.json || "{}"));
      t.jsonMsg = `Plantilla aplicada · ${c}`, t.jsonBad = !1, yt(e, t, `Plantilla “${c}” aplicada. El diseño ya usa estas bandas.`, !1, n);
    } catch (c) {
      t.jsonMsg = `No se pudo aplicar: ${c instanceof Error ? c.message : "JSON no válido"}. Revisa el texto o descarta los cambios.`, t.jsonBad = !0;
    }
  else if (s === "rreset")
    t.json = null, t.jsonMsg = "", t.jsonBad = !1;
  else if (s === "rrun")
    try {
      const c = JSON.parse(t.dataJson || "{}"), l = i.bands.detail.source;
      if (!c.dataSources || !Array.isArray(c.dataSources[l])) throw new Error(`falta dataSources.${l}, un arreglo de filas`);
      t.runData = c.dataSources, t.runParams = { ...t.pv, ...c.parameters || {} }, t.mode = "preview", t.dataMsg = "", t.dataBad = !1, yt(e, t, `Reporte ejecutado con ${c.dataSources[l].length} filas de ${l}. Estás en la vista previa.`, !1, n);
    } catch (c) {
      t.dataMsg = `No se pudo ejecutar: ${c instanceof Error ? c.message : "JSON no válido"}. Corrige los datos y vuelve a intentar.`, t.dataBad = !0;
    }
  else if (s === "rcopy") {
    const c = e.querySelector(".td-rpt__pre")?.textContent || "";
    if (!navigator.clipboard) {
      yt(e, t, "No se pudo copiar. Selecciona el código y cópialo a mano.", !0, n);
      return;
    }
    navigator.clipboard.writeText(c).then(
      () => yt(e, t, "Código C# copiado. Pégalo en el servicio que genera el PDF.", !1, n),
      () => yt(e, t, "No se pudo copiar. Selecciona el código y cópialo a mano.", !0, n)
    );
  }
}
function tr(e, t, a, n, s) {
  const o = a === "rjson" || a === "rdata";
  if (a === "rname") U(t, (r) => {
    r.name = n;
  });
  else if (a === "rtpl" && (n === "factura" || n === "stock" || n === "blank")) {
    const r = n === "blank" ? Wo() : Fe(xa()[n]);
    Oe(r), t.tplKey = n, t.tpl = r, t.sel = null, t.json = null, t.runData = null, t.runParams = null, t.pv = wa(r), yt(e, t, `Plantilla “${r.name}” cargada. Lo que había en el lienzo se reemplazó.`, !1, s);
  } else if (a.startsWith("pname:")) {
    const r = Number(a.slice(6)), i = t.tpl.parameters[r];
    if (!i) return !1;
    const c = n.replace(/[^\w]/g, "");
    U(t, (l) => {
      l.parameters[r] && (l.parameters[r].name = c);
    }), c !== i.name && (t.pv[c] = t.pv[i.name] ?? i.value, delete t.pv[i.name]);
  } else if (a.startsWith("ptype:")) {
    const r = Number(a.slice(6));
    (n === "texto" || n === "numero" || n === "fecha") && U(t, (i) => {
      i.parameters[r] && (i.parameters[r].type = n);
    });
  } else if (a.startsWith("rpv:"))
    t.pv[a.slice(4)] = n, t.runParams = null;
  else if (a === "rrows")
    t.rows = K(Number(n) || 1, 1, 60), t.runData = null;
  else if (a === "rjson")
    t.json = n, t.jsonMsg = "", t.jsonBad = !1;
  else if (a === "rdata")
    t.dataJson = n, t.dataMsg = "", t.dataBad = !1;
  else if (a.startsWith("rgeo:") && t.sel?.kind === "el") {
    const r = a.slice(5), i = Number(n);
    if (!Number.isNaN(i)) {
      const { band: c, id: l } = t.sel;
      U(t, (d) => {
        const u = d.bands[c].elements.find((p) => p.id === l);
        u && (u[r] = St(Math.max(0, i)));
      });
    }
  } else if (a === "rtext" && t.sel?.kind === "el") {
    const { band: r, id: i } = t.sel;
    U(t, (c) => {
      const l = c.bands[r].elements.find((d) => d.id === i);
      l && (l.text = n);
    });
  } else if (a === "rsize" && t.sel?.kind === "el") {
    const { band: r, id: i } = t.sel;
    U(t, (c) => {
      const l = c.bands[r].elements.find((d) => d.id === i);
      l && (l.size = St(K(Number(n) || 1, 1, 30)));
    });
  } else if (a === "rthick" && t.sel?.kind === "el") {
    const { band: r, id: i } = t.sel, c = St(K(Number(n) || 0.1, 0.1, 5));
    U(t, (l) => {
      const d = l.bands[r].elements.find((u) => u.id === i);
      d && (d.thick = c, d.type === "line" && (d.h = c));
    });
  } else if (a === "rsrc") U(t, (r) => {
    r.bands.detail.source = n.replace(/[^\w]/g, "") || "Lineas";
  });
  else if (a === "rrowh") U(t, (r) => {
    r.bands.detail.rowHeight = K(Number(n) || 5, 4, 20);
  });
  else if (a === "rheadh") U(t, (r) => {
    r.bands.detail.headHeight = K(Number(n) || 6, 4, 20);
  });
  else if (a === "rbandh" && t.sel?.kind === "band") {
    const r = t.sel.band;
    U(t, (i) => {
      i.bands[r].height = K(Number(n) || 10, 5, 200);
    });
  } else a === "rmargin" ? U(t, (r) => {
    r.page.margin = K(Number(n) || 5, 5, 30);
  }) : a.startsWith("ctitle:") ? U(t, (r) => {
    const i = r.bands.detail.columns[Number(a.slice(7))];
    i && (i.title = n);
  }) : a.startsWith("cw:") ? U(t, (r) => {
    const i = r.bands.detail.columns[Number(a.slice(3))];
    i && (i.w = K(Number(n) || 1, 1, 100));
  }) : a.startsWith("cexpr:") ? U(t, (r) => {
    const i = r.bands.detail.columns[Number(a.slice(6))];
    i && (i.expr = n);
  }) : a.startsWith("cfmt:") && U(t, (r) => {
    const i = r.bands.detail.columns[Number(a.slice(5))];
    i && (i.fmt = n, i.align = n === "money" || n === "number" ? "right" : "left");
  });
  return o;
}
function er(e, t, a, n) {
  const s = a.files?.[0];
  a.value = "", s && s.text().then((o) => {
    try {
      const r = An(t, JSON.parse(o));
      yt(e, t, `${s.name} abierto · plantilla “${r}”.`, !1, n);
    } catch (r) {
      yt(e, t, `No se pudo abrir ${s.name}: ${r instanceof Error ? r.message : "archivo no válido"}. El diseño actual sigue intacto.`, !0, n);
    }
    n();
  });
}
function ar(e, t) {
  if (e.mode !== "design" || t.button !== 0) return !1;
  const a = t.target instanceof Element ? t.target : null, n = a?.closest('[data-st^="rsize:"]'), s = a?.closest('[data-st^="rhit:"]'), o = n instanceof HTMLElement ? n : s instanceof HTMLElement ? s : null;
  if (!o?.dataset.st) return !1;
  const [, r, i] = o.dataset.st.split(":");
  if (r !== "header" && r !== "footer" || !i) return !1;
  const c = e.tpl.bands[r].elements.find((l) => l.id === i);
  return c ? (e.sel = { kind: "el", band: r, id: i }, e.drag = { band: r, id: i, mode: n ? "resize" : "move", x: c.x, y: c.y, w: c.w, h: c.h, px: t.clientX, py: t.clientY, moved: !1 }, t.preventDefault(), !0) : !1;
}
function nr(e, t) {
  const a = e.drag;
  if (!a) return;
  const n = e.tpl.bands[a.band].elements.find((l) => l.id === a.id);
  if (!n) return;
  const s = (t.clientX - a.px) / (e.scale || 1), o = (t.clientY - a.py) / (e.scale || 1);
  Math.hypot(t.clientX - a.px, t.clientY - a.py) > 3 && (a.moved = !0);
  const r = (l) => Math.round(l * 2) / 2, i = Kt(e.tpl), c = e.tpl.bands[a.band].height;
  if (a.mode === "move")
    n.x = K(r(a.x + s), 0, Math.max(0, i - a.w)), n.y = K(r(a.y + o), 0, Math.max(0, c - a.h));
  else {
    let l = K(r(a.w + s), 2, i - a.x), d = n.type === "line" ? a.h : K(r(a.h + o), 2, c - a.y);
    n.type === "qr" && (l = d = Math.min(Math.max(l, d), i - a.x, c - a.y)), n.w = St(l), n.h = St(d), n.type === "text" && (n.size = St(K(d * 0.78, 1.5, 20)));
  }
}
function sr(e) {
  const t = !!e.drag?.moved;
  return e.drag = null, t;
}
function or(e, t, a) {
  if (e.mode !== "design" || e.sel?.kind !== "el") return !1;
  const { band: n, id: s } = e.sel, o = e.tpl.bands[n].elements.find((c) => c.id === s);
  if (!o) return !1;
  const r = a ? 2 : 0.5, i = { ArrowLeft: [-r, 0], ArrowRight: [r, 0], ArrowUp: [0, -r], ArrowDown: [0, r] };
  if (i[t]) {
    const [c, l] = i[t];
    return o.x = K(St(o.x + c), 0, Math.max(0, Kt(e.tpl) - o.w)), o.y = K(St(o.y + l), 0, Math.max(0, e.tpl.bands[n].height - o.h)), !0;
  }
  return t === "Delete" || t === "Backspace" ? (e.tpl.bands[n].elements = e.tpl.bands[n].elements.filter((c) => c.id !== s), e.sel = null, e.json = null, !0) : !1;
}
function rr(e, t, a) {
  if (e.dataset.tdRptWatch === "1" || typeof ResizeObserver > "u") return;
  e.dataset.tdRptWatch = "1", new ResizeObserver(() => {
    const s = e.querySelector(".td-rpt__stage"), o = Math.round((s instanceof HTMLElement ? s.clientWidth : e.clientWidth) || 0), r = t();
    !r || !o || Math.abs(o - r.avail) < 8 || r.drag || (r.avail = o, a());
  }).observe(e);
}
const z = /* @__PURE__ */ new WeakMap(), Be = { text: "Texto", barcode: "Código de barras", qr: "Código QR", line: "Línea", box: "Recuadro" }, Yt = [
  { id: "t1", name: "Bahía 1 · Frenos", who: "J. Muñoz", c: "#ED2A24" },
  { id: "t2", name: "Bahía 2 · Motor", who: "P. Soto", c: "#2A6FDB" },
  { id: "t3", name: "Bahía 3 · Suspensión", who: "C. Vera", c: "#1E9E54" },
  { id: "t4", name: "Terreno", who: "M. Rojas", c: "#E8920C" }
], Xa = [["qr_code", "QR"], ["code_128", "Code 128"], ["ean_13", "EAN-13"], ["ean_8", "EAN-8"], ["code_39", "Code 39"], ["data_matrix", "DataMatrix"]];
function qn(e) {
  return `$ ${Math.round(e).toLocaleString("es-CL")}`;
}
function B(e) {
  return e.replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t] ?? t);
}
function zt() {
  const e = /* @__PURE__ */ new Date();
  return [e.getHours(), e.getMinutes(), e.getSeconds()].map((t) => String(t).padStart(2, "0")).join(":");
}
function at(e, t, a) {
  return Math.max(t, Math.min(a, e));
}
function ie(e) {
  return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
function tt(e) {
  const [t, a, n] = e.split("-").map(Number);
  return new Date(t, a - 1, n);
}
function Nt(e, t) {
  const a = tt(e);
  return a.setDate(a.getDate() + t), ie(a);
}
function ka(e) {
  const t = tt(e);
  return Nt(e, -((t.getDay() + 6) % 7));
}
function Ct(e) {
  return `${String(Math.floor(e / 60)).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}`;
}
function Cn(e) {
  return { code: e.code, name: e.name, brand: e.brand, price: qn(e.price), stock: String(e.stock), url: `https://uiuxblazor.dev/r/${e.code}` };
}
function Ma(e) {
  return e.record ?? Cn(R[e.rec] ?? R[0]);
}
function La(e, t) {
  return e.replace(/\{(\w+)\}/g, (a, n) => t[n] ?? a);
}
function jt(e, t, a) {
  return `<button type="button" class="td-rpt__switch" role="switch" aria-checked="${e}" data-st="${a}"><span class="td-rpt__track ${e ? "is-on" : ""}" aria-hidden="true"></span>${t}</button>`;
}
function Aa(e) {
  const t = Math.max(220, (e.avail || 640) - 52);
  return Math.max(2.2, Math.min(7.2, t / e.w));
}
function Ya(e) {
  const t = e >= -50 ? 4 : e >= -62 ? 3 : e >= -74 ? 2 : 1;
  return `<span class="td-code__bars" aria-hidden="true">${[6, 9, 12, 14].map((a, n) => `<i style="height:${a}px;background:${n < t ? "var(--td-color-text)" : "var(--td-color-border-strong)"}"></i>`).join("")}</span>`;
}
const Ee = /* @__PURE__ */ new Map(), _e = /* @__PURE__ */ new Map();
function ir(e, t) {
  const a = `${e}
${t}`, n = Ee.get(a);
  if (n) return n;
  const s = fa(e === "ean13" ? "ean13" : "code128", t, 1, 40, "#0A0B0C", !1), o = { error: !!s.error, svg: s.svg, value: s.value || t };
  return Ee.size > 96 && Ee.clear(), Ee.set(a, o), o;
}
function cr(e) {
  const t = e, a = _e.get(t);
  if (a) return a;
  const n = ma(t, "M", 2).svg;
  return _e.size > 96 && _e.clear(), _e.set(t, n), n;
}
const Ze = /* @__PURE__ */ new WeakMap();
function lr(e) {
  Ze.has(e) || Ze.set(e, requestAnimationFrame(() => {
    Ze.delete(e), e.isConnected && j(e);
  }));
}
const ce = /* @__PURE__ */ new WeakMap();
let Rt = null;
function dr(e) {
  if (e.vibrate && navigator.vibrate?.(35), !e.beep || typeof AudioContext > "u") return;
  Rt ??= new AudioContext();
  const t = Rt.createOscillator(), a = Rt.createGain();
  t.type = "square", t.frequency.value = 988, a.gain.setValueAtTime(0.045, Rt.currentTime), a.gain.exponentialRampToValueAtTime(1e-3, Rt.currentTime + 0.08), t.connect(a), a.connect(Rt.destination), t.start(), t.stop(Rt.currentTime + 0.09);
}
function tn(e) {
  return R.find((t) => t.code === e || e.endsWith(`/${t.code}`));
}
const en = {
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
function ur(e) {
  return e === "ZPL" ? [["Estado ~HS", "hs"], ["Calibrar", "jc"], ["Etiqueta de prueba", "ztest"]] : e === "CPCL" ? [["Etiqueta CPCL", "cpcl"]] : e === "TSPL" ? [["Tamaño", "size"], ["Limpiar", "cls"], ["Imprimir", "tspl"]] : [["Inicializar", "init"], ["Texto", "ticket"], ["Corte", "cut"]];
}
function pr() {
  const e = ie(/* @__PURE__ */ new Date()), t = ka(e), a = [[0, "t1", 480, 570, "Cambio de pastillas · CBTR-45"], [0, "t2", 540, 690, "Diagnóstico turbo · HJKL-22"], [0, "t3", 600, 660, "Alineación · FGRT-90"], [1, "t1", 510, 600, "Discos ventilados · PLMN-12"], [1, "t4", 480, 720, "Visita flota Minera Los Robles"], [1, "t2", 780, 900, "Cambio de embrague · XZCV-77"], [2, "t3", 540, 630, "Amortiguadores · QWER-31"], [2, "t1", 570, 630, "Revisión sistema neumático"], [2, "t1", 600, 690, "Válvula relé · BNMK-08"], [2, "t2", 840, 960, "Mantención 300.000 km"], [3, "t2", 480, 570, "Filtros · CBTR-45"], [3, "t3", 660, 750, "Muelles · TYUI-55"], [4, "t1", 540, 660, "Kit de frenos · Buses Andinos"], [5, "t4", 540, 720, "Operativo sábado · Frío Norte"]];
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
      batch: JSON.stringify(R.slice(0, 3).map(Cn), null, 2),
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
    report: Go(),
    print: {
      sel: "zd421",
      copies: 1,
      raw: "~HS",
      log: [{ t: zt(), dir: "SYS", msg: "Listo. Zebra ZD421 conectada en 192.168.1.40:9100." }],
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
    sch: { view: "week", date: e, hide: [], seq: 100, dlg: null, tried: !1, drag: null, skipClick: !1, events: a.map((n, s) => ({ id: s + 1, date: Nt(t, n[0]), res: n[1], s: n[2], e: n[3], title: n[4], note: "" })) }
  };
}
function nt(e, t) {
  const a = z.get(e);
  a && (a.msg = t, window.clearTimeout(a.timer), j(e), a.timer = window.setTimeout(() => {
    a.msg = "", e.isConnected && j(e);
  }, 3200));
}
function j(e) {
  const t = z.get(e);
  if (!t) return;
  const a = document.activeElement, n = a instanceof HTMLElement && e.contains(a) ? a.getAttribute("data-st-in") : null, s = a instanceof HTMLInputElement || a instanceof HTMLTextAreaElement ? a.selectionStart : null;
  if (e.innerHTML = `<p class="td-studio__msg" role="status">${B(t.msg || " ")}</p>${xr(e.dataset.kind || "", t)}`, e.dataset.kind === "labeldesigner" && (e.dataset.lbScale = String(Aa(t.label))), Tn(e), !n) return;
  const o = e.querySelector(`[data-st-in="${CSS.escape(n)}"]`);
  o instanceof HTMLElement && (o.focus(), (o instanceof HTMLInputElement || o instanceof HTMLTextAreaElement) && s != null && o.type !== "checkbox" && o.type !== "range" && o.setSelectionRange(s, s));
}
function Tn(e) {
  const t = ce.get(e), a = z.get(e);
  if (!t || !a?.scan.on) return;
  const n = e.querySelector("[data-st-video]");
  n instanceof HTMLVideoElement && (n.srcObject !== t && (n.srcObject = t), n.paused && n.play().catch(() => {
  }));
}
function fr(e, t) {
  const a = La(e.text || "", t);
  if (e.type === "text") {
    const n = e.align === "center" ? "middle" : e.align === "right" ? "end" : "start";
    return `<text x="${e.align === "center" ? e.w / 2 : e.align === "right" ? e.w : 0}" y="${(e.size || 3) * 0.82}" font-size="${e.size || 3}" font-weight="${e.bold ? 700 : 400}" text-anchor="${n}" fill="#0A0B0C">${B(a)}</text>`;
  }
  if (e.type === "line") return `<rect width="${e.w}" height="${e.thick || 0.3}" fill="#0A0B0C"/>`;
  if (e.type === "box") return `<rect width="${e.w}" height="${e.h}" fill="none" stroke="#0A0B0C" stroke-width="${e.thick || 0.3}"/>`;
  if (e.type === "barcode") {
    const n = ir(e.format === "ean13" ? "ean13" : "c128", a), s = e.h * (e.showText ? 0.78 : 1);
    return (n.error ? '<text y="3" font-size="2" fill="#C62828">Valor no válido</text>' : an(n.svg, 0, 0, e.w, s)) + (e.showText && !n.error ? `<text x="${e.w / 2}" y="${e.h - 0.4}" font-size="2.2" text-anchor="middle">${B(n.value)}</text>` : "");
  }
  return an(cr(a || " "), 0, 0, e.w, e.h);
}
function mr(e) {
  const t = e.label, a = Ma(t), n = Aa(t), s = t.els.map((r) => `<g data-lb="${B(r.id)}" transform="translate(${r.x} ${r.y})">${fr(r, a)}</g>`).join(""), o = t.mode === "design" ? t.els.map((r) => {
    const i = r.id === t.sel;
    return `<button type="button" class="td-studio__hit ${i ? "is-on" : ""}" data-st="sel:${r.id}" style="left:${r.x * n}px;top:${r.y * n}px;width:${r.w * n}px;height:${Math.max(r.h, r.type === "line" ? 1.2 : r.h) * n}px" aria-label="${Be[r.type]}">${i ? `<span class="td-studio__tag">${Be[r.type]}</span><span class="td-studio__grip" data-st="resize:${r.id}" aria-hidden="true"></span>` : ""}</button>`;
  }).join("") : "";
  return `<div class="td-studio__well"><div class="td-studio__stage ${t.grid ? "is-grid" : "is-plain"}" style="width:${t.w * n}px;height:${t.h * n}px;background-size:${5 * n}px ${5 * n}px">
        <svg viewBox="0 0 ${t.w} ${t.h}" width="100%" height="100%" role="img" aria-label="Etiqueta ${t.w} por ${t.h} milímetros">${s}</svg>${o}</div></div>`;
}
function an(e, t, a, n, s) {
  return e.replace("<svg ", `<svg x="${t}" y="${a}" width="${n}" height="${s}" `);
}
function ia(e) {
  const t = e.label, a = Ma(t), n = (o) => Math.round(o * t.dpi / 25.4), s = ["^XA", "^CI28", `^PW${n(t.w)}`, `^LL${n(t.h)}`];
  for (const o of t.els) {
    const r = La(o.text || "", a).replace(/[\^~]/g, " "), i = `^FO${n(o.x)},${n(o.y)}`;
    o.type === "text" ? s.push(`${i}^A0N,${n(o.size || 3)},${n(o.size || 3)}^FD${r}^FS`) : o.type === "line" || o.type === "box" ? s.push(`${i}^GB${n(o.w)},${n(o.type === "line" ? o.thick || 0.3 : o.h)},${Math.max(1, n(o.thick || 0.3))}^FS`) : o.type === "barcode" ? s.push(`${i}^BCN,${n(o.h)},${o.showText ? "Y" : "N"},N,N^FD${r}^FS`) : s.push(`${i}^BQN,2,4^FDMA,${r}^FS`);
  }
  return s.push(`^PQ${t.copies},0,1,Y`, "^XZ"), s.join(`
`);
}
function hr(e) {
  const t = e.label, a = t.els.find((d) => d.id === t.sel), n = Ma(t), s = [[50, 25, "Estantería"], [62, 40, "Producto"], [40, 30, "Pequeña"], [100, 50, "Caja"], [100, 150, "Envío"]], o = t.json || JSON.stringify({ size: { width: t.w, height: t.h, dpi: t.dpi }, elements: t.els.map(({ id: d, ...u }) => u) }, null, 2), r = a?.align ?? "left";
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
            ${t.mode === "design" ? `<div class="td-studio__tools" role="toolbar" aria-label="Elementos">${["text", "barcode", "qr", "line", "box"].map((d) => `<button type="button" data-st="add:${d}"><b>+</b> ${Be[d]}</button>`).join("")}<span class="td-code__rule" aria-hidden="true"></span>${jt(t.grid, "Cuadrícula", "grid")}</div>` : ""}
            ${mr(e)}
            <p class="td-studio__dims">${t.w} × ${t.h} mm · ${l} · ${t.els.length} elementos${t.mode === "design" ? " · arrastra para mover, esquina roja para el tamaño, flechas 0,5 mm" : ` · vista con ${B(n.code)}`}</p>
        </div>
        <div class="td-studio__side">
            ${t.mode === "design" ? `<div class="td-studio__inspector"><label>Datos de vista previa<select data-st-in="rec">${R.slice(0, 8).map((d, u) => `<option value="${u}" ${u === t.rec ? "selected" : ""}>${B(d.code)} · ${B(d.name)}</option>`).join("")}</select></label>
                <span class="td-section-title">Variables · clic para insertar</span>
                <div class="td-code__pills">${Object.keys(n).map((d) => `<button type="button" class="td-rpt__token" data-st="var:${d}" title="${B(n[d])}" ${a?.text == null ? "disabled" : ""}>{${d}}</button>`).join("")}</div>
            </div>
            ${a ? `<div class="td-studio__inspector">
                <div class="td-studio__head"><span class="td-section-title">${Be[a.type]}</span><button type="button" data-st="dup">Duplicar</button><button type="button" class="is-danger" data-st="del">Eliminar</button></div>
                <div class="td-studio__geo">${[["x", "X"], ["y", "Y"], ["w", "Ancho"], ["h", "Alto"]].map(([d, u]) => `<label>${u}<input data-st-in="geo:${d}" value="${a[d]}" inputmode="decimal"></label>`).join("")}</div>
                ${a.text != null ? `<label>Contenido<input data-st-in="text" value="${B(a.text)}"></label><span class="td-studio__dims">→ ${B(La(a.text, n))}</span>` : ""}
                ${a.type === "text" ? `<div class="td-studio__bar"><label>Alto mm<input data-st-in="size" value="${a.size ?? 3}" inputmode="decimal"></label><div class="td-ecom__seg" role="group" aria-label="Alineación">${[["left", "Izquierda"], ["center", "Centro"], ["right", "Derecha"]].map(([d, u]) => `<button type="button" data-st="align:${d}" aria-pressed="${r === d}">${u}</button>`).join("")}</div></div>${jt(!!a.bold, "Negrita", "bold")}` : ""}
                ${a.type === "barcode" ? `<div class="td-ecom__seg" role="group" aria-label="Formato"><button type="button" data-st="bcfmt:c128" aria-pressed="${a.format !== "ean13"}">Code 128</button><button type="button" data-st="bcfmt:ean13" aria-pressed="${a.format === "ean13"}">EAN-13</button></div>${jt(!!a.showText, "Mostrar texto", "showtext")}` : ""}
                ${a.type === "line" || a.type === "box" ? `<label>Grosor mm<input data-st-in="thick" value="${a.thick ?? 0.3}" inputmode="decimal"></label>` : ""}
                <p class="td-studio__dims">Supr elimina el elemento seleccionado.</p>
            </div>` : '<div class="td-studio__inspector"><p class="td-studio__dims">Selecciona un elemento de la etiqueta para editar su posición, tamaño y contenido, o agrega uno desde la barra.</p></div>'}` : `<div class="td-studio__inspector"><span class="td-section-title">Plantilla JSON · editable</span><textarea data-st-in="json" rows="18" spellcheck="false" aria-label="Plantilla JSON">${B(o)}</textarea>
                <div class="td-rpt__actions"><button type="button" class="td-studio__primary" data-st="applyjson">Aplicar JSON</button><button type="button" data-st="resetjson">Descartar cambios</button><span class="${t.jsonBad ? "td-rpt__status is-bad" : "td-rpt__status"}">${B(t.jsonMsg || "Sincronizado con el diseño")}</span></div></div>`}
        </div>
    </div>
    ${t.mode === "code" ? `<div class="td-code__pair"><div class="td-studio__inspector"><div class="td-studio__head"><span class="td-section-title">ZPL generado · ${t.dpi} dpi</span><button type="button" data-st="copyzpl">Copiar</button><button type="button" data-st="dlzpl">Descargar .zpl</button></div><pre class="td-studio__zpl">${B(ia(e))}</pre></div>
        <div class="td-studio__inspector"><span class="td-section-title">Lote · una etiqueta por registro</span><textarea data-st-in="batch" rows="12" spellcheck="false" aria-label="Datos del lote en JSON">${B(t.batch)}</textarea>
        <div class="td-rpt__actions"><button type="button" class="td-studio__primary" data-st="printbatch" ${c || !i ? "disabled" : ""}>Imprimir lote</button><span class="${c ? "td-rpt__status is-bad" : "td-studio__dims"}">${c ? "El lote debe ser un arreglo JSON." : `${i} registros · ${t.copies} ${t.copies === 1 ? "copia" : "copias"} cada uno`}</span></div></div></div>` : ""}
    <div class="td-studio__print">
        <label>Impresora<select data-st-in="printer"><option value="browser" ${t.printer === "browser" ? "selected" : ""}>Navegador</option><option value="zebra" ${t.printer === "zebra" ? "selected" : ""}>Zebra ZD421 · 203 dpi</option><option value="zebra300" ${t.printer === "zebra300" ? "selected" : ""}>Zebra ZT411 · 300 dpi</option></select></label>
        <label>Copias<div class="td-studio__step"><button type="button" data-st="copdec" aria-label="Menos copias">−</button><input data-st-in="copies" value="${t.copies}" inputmode="numeric" aria-label="Número de copias"><button type="button" data-st="copinc" aria-label="Más copias">+</button></div></label>
        <button type="button" class="td-studio__primary" data-st="print">Imprimir ${t.copies} ${t.copies === 1 ? "copia" : "copias"}</button>
        <div class="td-studio__jobs">${t.jobs.map((d) => `<span><b>✓</b> ${d.t} ${B(d.text)}</span>`).join("")}</div>
    </div>`;
}
function nn(e) {
  return e.unreachable && e.status === "disconnected" ? "error" : e.status;
}
function br(e) {
  const t = e.print, a = t.devs.find((d) => d.id === t.sel), n = { connected: ["Conectada", "var(--td-color-success)"], connecting: ["Conectando…", "var(--td-color-warning)"], disconnected: ["Desconectada", "var(--td-color-text-muted)"], error: ["Sin respuesta", "var(--td-color-danger)"], printing: ["Imprimiendo…", "var(--td-color-info)"] }, s = typeof navigator < "u" && "bluetooth" in navigator, o = !!(t.scan && t.scan.pr < 100), r = a ? nn(a) : "disconnected", i = a?.status === "connected", c = a ? [["Conexión", a.conn === "bt" ? "Bluetooth" : "Wi‑Fi"], ["Dirección", a.addr], ["Lenguaje", a.proto], ["Resolución", `${a.dpi} dpi`], ["Ancho", `${a.width} mm`], ["Firmware", a.fw], ["Trabajos", String(a.jobs)], ...a.battery != null ? [["Batería", `${a.battery} %`]] : []] : [], l = t.log.length ? t.log : [{ t: "", dir: "—", msg: "Sin eventos en la consola." }];
  return `<div class="td-studio__bar"><button type="button" class="td-studio__primary" data-st="btscan" ${o ? "disabled" : ""}>Buscar Bluetooth</button><button type="button" data-st="wifi" aria-expanded="${t.wifi}">Agregar por Wi‑Fi</button>
        <span class="td-studio__chips"><span class="td-studio__chip" title="${s ? "Este navegador expone Web Bluetooth" : "Este navegador no expone Web Bluetooth"}"><i style="background:${s ? "var(--td-color-success)" : "var(--td-color-text-muted)"}"></i>Bluetooth ${s ? "disponible" : "no disponible"}</span><span class="td-studio__chip" title="La red Wi‑Fi se simula: el navegador no abre el puerto 9100"><i style="background:var(--td-color-warning)"></i>Agente local simulado</span><span class="td-studio__chip" title="Puerto crudo de impresoras térmicas"><i style="background:var(--td-color-info)"></i>Wi‑Fi puerto 9100</span></span></div>
        ${t.scan ? `<section class="td-prn__panel"><div class="td-studio__head"><strong>${o ? "Buscando impresoras Bluetooth" : "Búsqueda terminada"}</strong><span class="td-studio__dims">${t.scan.found.length} encontrados · ${t.scan.pr} %</span><span class="td-code__grow"></span><button type="button" data-st="webbt">Selector del navegador</button><button type="button" data-st="scanclose">${o ? "Cancelar" : "Cerrar"}</button></div>
            <div class="td-prn__meter" role="progressbar" aria-valuenow="${t.scan.pr}" aria-valuemin="0" aria-valuemax="100" aria-label="Progreso de búsqueda"><span style="width:${t.scan.pr}%"></span></div>
            <div role="list">${t.scan.found.map((d) => {
    const u = t.devs.some((p) => p.addr === d.mac);
    return `<div role="listitem" class="td-prn__hit"><span class="td-prn__name">${B(d.name)}<small>${B(d.mac)} · ${B(d.proto)} · batería ${d.battery} %</small></span>${Ya(d.rssi)}<span class="td-studio__dims">${d.rssi} dBm</span><button type="button" data-st="pair:${d.mac}" ${u ? "disabled" : ""}>${u ? "Emparejada" : "Emparejar"}</button></div>`;
  }).join("") || '<p class="td-studio__dims">Acerca la impresora y enciéndela en modo emparejamiento.</p>'}</div></section>` : ""}
        ${t.wifi ? `<section class="td-prn__panel"><strong>Agregar impresora de red</strong><div class="td-prn__form"><label>Nombre<input data-st-in="wf-name" value="${B(t.wf.name)}" placeholder="Zebra bodega 2"></label><label>Dirección IP<input data-st-in="wf-ip" value="${B(t.wf.ip)}" placeholder="192.168.1.60" inputmode="decimal"></label><label>Puerto<input data-st-in="wf-port" value="${B(t.wf.port)}" placeholder="9100" inputmode="numeric"></label><label>Lenguaje<select data-st-in="wf-proto"><option value="ZPL" ${t.wf.proto === "ZPL" ? "selected" : ""}>ZPL · Zebra</option><option value="ESC/POS" ${t.wf.proto === "ESC/POS" ? "selected" : ""}>ESC/POS · tickets</option><option value="CPCL" ${t.wf.proto === "CPCL" ? "selected" : ""}>CPCL · móviles</option><option value="TSPL" ${t.wf.proto === "TSPL" ? "selected" : ""}>TSPL · TSC</option></select></label></div>
            <div class="td-rpt__actions"><button type="button" class="td-studio__primary" data-st="wfadd">Probar y agregar</button><button type="button" data-st="wifi">Cancelar</button><span class="${t.wfBad ? "td-rpt__status is-bad" : "td-rpt__status"}">${B(t.wfMsg)}</span></div>
            <p class="td-studio__dims">El navegador no abre sockets TCP. La conexión Wi‑Fi pasa por un agente local o por el servidor, que envía los datos crudos al puerto 9100.</p></section>` : ""}
        <div class="td-prn"><div class="td-prn__list" role="listbox" aria-label="Impresoras"><span class="td-section-title">Dispositivos · ${t.devs.length}</span>
            ${t.devs.map((d) => {
    const [u, p] = n[nn(d)];
    return `<button type="button" class="td-prn__dev" role="option" data-st="seldev:${d.id}" aria-pressed="${d.id === t.sel}"><span class="td-prn__mark" aria-hidden="true">${d.conn === "bt" ? "BT" : "IP"}</span><span class="td-prn__name">${B(d.name)}${d.def ? "<em>Predet.</em>" : ""}<small>${d.conn === "bt" ? "Bluetooth" : "Wi‑Fi"} · ${B(d.addr)}</small></span><span class="td-prn__side"><span style="color:${p}"><i style="background:${p}"></i>${u}</span>${Ya(d.rssi)}</span></button>`;
  }).join("")}
        </div>
        ${a ? `<div class="td-prn__detail"><section class="td-prn__panel"><div class="td-prn__hero"><span class="td-prn__mark is-lg" aria-hidden="true">${a.conn === "bt" ? "BT" : "IP"}</span><div><strong>${B(a.name)}</strong><span class="td-studio__dims">${B(a.model)} · ${B(a.addr)}</span><span class="td-studio__chip"><i style="background:${n[r][1]}"></i>${n[r][0]}</span></div>
            <div class="td-ecom__nav"><button type="button" class="td-studio__primary" data-st="conn" ${a.status === "connecting" || a.status === "printing" ? "disabled" : ""}>${a.status === "connected" || a.status === "printing" ? "Desconectar" : "Conectar"}</button><button type="button" data-st="def" ${a.def ? "disabled" : ""}>Predeterminada</button><button type="button" class="is-danger" data-st="forget">Olvidar</button></div></div>
            ${a.err || a.unreachable ? `<p class="td-prn__alert" role="alert">${B(a.err || "No responde en el puerto 9100. Revisa que esté encendida y en la misma red.")}</p>` : ""}
            <div class="td-prn__info">${c.map(([d, u]) => `<div><span>${d}</span><b>${B(u)}</b></div>`).join("")}</div></section>
            <div class="td-code__pair"><section class="td-prn__panel"><span class="td-section-title">Impresión de prueba</span><p class="td-studio__dims">Imprime una etiqueta corta para confirmar conexión, lenguaje y ancho útil.</p><div class="td-rpt__actions"><div class="td-studio__step"><button type="button" data-st="pcopdec" aria-label="Menos copias">−</button><input data-st-in="pcopies" value="${t.copies}" inputmode="numeric" aria-label="Copias de prueba"><button type="button" data-st="pcopinc" aria-label="Más copias">+</button></div><button type="button" class="td-studio__primary" data-st="test" ${i ? "" : "disabled"}>Imprimir prueba</button></div></section>
            <section class="td-prn__panel"><span class="td-section-title">Comando directo · ${B(a.proto)}</span><div class="td-code__pills">${ur(a.proto).map(([d, u]) => `<button type="button" class="td-rpt__token" data-st="preset:${u}">${d}</button>`).join("")}</div><textarea data-st-in="raw" rows="4" spellcheck="false" aria-label="Comando crudo">${B(t.raw)}</textarea><button type="button" data-st="send" ${i ? "" : "disabled"}>Enviar ${new TextEncoder().encode(t.raw).length} bytes</button></section></div>
            <div class="td-prn__console"><div class="td-studio__head"><span>Consola</span><span class="td-code__grow"></span><button type="button" data-st="clearlog">Limpiar</button></div><div role="log" aria-live="polite">${l.map((d) => `<p><span>${d.t}</span><b>${d.dir}</b><span>${B(d.msg)}</span></p>`).join("")}</div></div></div>` : '<p class="td-studio__dims">No queda ninguna impresora. Busca por Bluetooth o agrega una por Wi‑Fi.</p>'}</div>`;
}
function gr(e) {
  const t = e.hid;
  return `<p class="td-code__lead">Este componente no necesita foco en un campo: escucha las teclas que un lector USB, Bluetooth o RF emite al documento. Apunta el lector a un código, o usa Simular lectura para probar sin hardware.</p>
        <div class="td-hid"><div class="td-hid__controls">${jt(t.on, "Escuchando en segundo plano", "hidon")}${jt(t.ignore, "Ignorar si el foco está en un campo", "hidignore")}
            <label>Longitud mínima válida<input data-st-in="min" type="number" min="1" value="${t.minLen}"></label>
            <label>Tolerancia entre teclas · ${t.gap} ms<input data-st-in="gap" type="range" min="20" max="200" step="10" value="${t.gap}"></label>
            <div class="td-ecom__nav"><button type="button" class="td-studio__primary" data-st="hidsim">Simular lectura</button><button type="button" data-st="hidclear">Limpiar</button></div>
        </div><div class="td-hid__main"><section class="td-studio__inspector" role="status"><div class="td-studio__head"><span class="td-section-title">Última lectura</span><span class="td-studio__dims">${t.count} en total</span></div>
            ${t.last ? `<strong class="td-hid__code">${B(t.last.code)}</strong><span class="${t.last.name ? "td-rpt__status is-ok" : "td-rpt__status is-bad"}">${t.last.name ? `Coincide con ${B(t.last.name)}` : "Sin coincidencia en el catálogo"}</span><span class="td-studio__dims">${t.last.t}</span>` : '<p class="td-studio__dims">Sin lecturas todavía. Apunta el lector a un código o usa Simular lectura.</p>'}
        </section><div class="td-hid__log" role="log" aria-live="polite">${t.log.map((a) => `<div class="td-hid__row"><span>${a.t}</span><b>${B(a.code)}</b><span class="${a.name ? "" : "is-miss"}">${B(a.name || "Sin coincidencia")}</span></div>`).join("") || "<p>Sin eventos registrados</p>"}</div></div></div>`;
}
function $r(e) {
  const t = e.scan, a = t.last ? tn(t.last.value) : void 0, n = typeof window < "u" && "BarcodeDetector" in window, s = !!(t.last && Date.now() - t.last.id < 2400 && t.last.id > 10), o = { camera: "Cámara", wedge: "Lector", manual: "Manual", sim: "Simulación" }, r = (d) => Xa.find(([u]) => u === d)?.[1] ?? d, i = t.on ? t.waiting ? "En pausa" : "Leyendo" : "Cámara apagada", c = t.on ? t.waiting ? "var(--td-color-warning)" : "var(--td-color-success)" : "#6E757D", l = t.cams.length ? t.cams : [{ id: "", label: "Cámara principal" }];
  return `<div class="td-studio__bar"><div class="td-ecom__seg" role="group" aria-label="Modo de lectura"><button type="button" data-st="smode:single" aria-pressed="${t.mode === "single"}">Manual · 1 a 1</button><button type="button" data-st="smode:continuous" aria-pressed="${t.mode === "continuous"}">Continuo</button></div>
        <div class="td-code__pills">${Xa.map(([d, u]) => `<button type="button" class="td-code__pill" data-st="sfmt:${d}" aria-pressed="${t.formats.includes(d)}">${u}</button>`).join("")}</div>
        <span class="td-studio__chips"><span class="td-studio__chip" title="${n ? "El navegador detecta códigos en el video" : "Sin BarcodeDetector: usa un lector, escribe el código o simula"}"><i style="background:${n ? "var(--td-color-success)" : "var(--td-color-text-muted)"}"></i>${n ? "Detector nativo" : "Sin detector nativo"}</span><span class="td-studio__chip"><i style="background:${t.wedge ? "var(--td-color-success)" : "var(--td-color-text-muted)"}"></i>Lector ${t.wedge ? "activo" : "apagado"}</span></span></div>
        <div class="td-scan"><div class="td-scan__col"><div class="td-scan__stage ${t.on ? "is-on" : ""} ${s ? "is-hit" : ""}">
            <video data-st-video playsinline muted autoplay ${t.on ? "" : "hidden"} aria-label="Vista de la cámara"></video>
            ${t.on ? "" : `<div class="td-scan__idle"><strong>${t.err || "La cámara está apagada"}</strong><span>${t.mode === "single" ? "Cada lectura se detiene hasta que confirmes la siguiente." : "En continuo, cada código nuevo entra al registro sin cerrar la cámara."}</span><div class="td-ecom__nav"><button type="button" class="td-studio__primary" data-st="scam">Activar cámara</button><button type="button" class="td-scan__ghost" data-st="ssim">Simular lectura</button></div></div>`}
            <div class="td-scan__frame" aria-hidden="true"><i></i><i></i><i></i><i></i><b></b></div>
            <div class="td-scan__badge"><span role="status"><i style="background:${c}"></i>${i}</span>${t.mode === "continuous" ? `<span>${t.reads.length}</span>` : ""}</div>
            ${s && t.last ? `<div class="td-scan__toast" role="alert"><b>${B(t.last.value)}</b><span>${r(t.last.format)} · ${o[t.last.source] ?? t.last.source}</span></div>` : ""}
            ${t.on ? `<div class="td-scan__bar"><button type="button" class="td-scan__ghost" data-st="scam">Apagar cámara</button><select data-st-in="cam" aria-label="Cámara">${l.map((d) => `<option value="${B(d.id)}" ${d.id === t.camId ? "selected" : ""}>${B(d.label)}</option>`).join("")}</select>${t.torchOk ? `<button type="button" class="td-scan__ghost" data-st="storch" aria-pressed="${t.torch}">Linterna</button>` : ""}<span class="td-code__grow"></span><button type="button" class="td-scan__ghost" data-st="ssim">Simular lectura</button></div>` : ""}
        </div><p class="td-studio__dims">${t.err || (n ? "Detector nativo listo. El mismo código se ignora durante la ventana de deduplicación." : "Este navegador no trae detector nativo: usa un lector, escribe el código o simula una lectura.")}</p></div>
        <div class="td-scan__side"><section class="td-studio__inspector"><div class="td-studio__head"><span class="td-section-title">${t.waiting ? "Lectura en espera" : "Último resultado"}</span>${t.last ? `<span class="td-code__fmt">${r(t.last.format)}</span>` : ""}</div>
            ${t.last ? `<strong class="td-hid__code">${B(t.last.value)}</strong><span class="td-studio__dims">${o[t.last.source] ?? t.last.source} · ${t.last.t}</span>
                ${a ? `<div class="td-scan__match"><span><b>${B(a.name)}</b><small class="${a.stock ? "is-ok" : "is-bad"}">${a.stock ? `${a.stock} en stock` : "Agotado"}</small></span><b>${qn(a.price)}</b></div>` : '<span class="td-rpt__status is-bad">Sin coincidencia en el catálogo</span>'}
                <div class="td-ecom__nav"><button type="button" data-st="scopy">Copiar</button>${/^https?:/i.test(t.last.value) ? `<a class="td-scan__link" href="${B(t.last.value)}" target="_blank" rel="noopener noreferrer">Abrir enlace</a>` : ""}${t.waiting ? '<button type="button" class="td-studio__primary" data-st="snext">Leer siguiente</button>' : ""}</div>` : `<p class="td-studio__dims">${t.mode === "single" ? "Al leer un código la detección se pausa hasta Leer siguiente." : "Cada código se agrega al registro sin cerrar la cámara."}</p>`}
        </section><section class="td-studio__inspector"><span class="td-section-title">Comportamiento</span>${jt(t.beep, "Pitido al leer", "sbeep")}${jt(t.vibrate, "Vibrar al leer", "svib")}${jt(t.wedge, "Aceptar lector USB o Bluetooth", "swedge")}
            <label>Ignorar el mismo código durante ${t.dedupe < 1e3 ? `${t.dedupe} ms` : `${t.dedupe / 1e3} s`}<input data-st-in="dedupe" type="range" min="0" max="5000" step="250" value="${t.dedupe}"></label>
            <div class="td-scan__manual"><input data-st-in="manual" value="${B(t.manual)}" placeholder="Escribir código a mano" aria-label="Código manual"><button type="button" data-st="sadd">Agregar</button></div>
        </section></div></div>
        <section class="td-studio__inspector"><div class="td-studio__head"><span class="td-section-title">Eventos ux-scan · ${t.reads.length}</span><button type="button" data-st="sexport" ${t.reads.length ? "" : "disabled"}>Exportar CSV</button><button type="button" data-st="sclear" ${t.reads.length ? "" : "disabled"}>Limpiar</button></div>
        <div class="td-scan__log" role="log" aria-live="polite">${t.reads.slice(0, 20).map((d) => {
    const u = tn(d.value);
    return `<div class="td-scan__row"><span>${d.t}</span><b>${r(d.format)}</b><span><strong>${B(d.value)}</strong><small>${u ? B(u.name) : "Sin coincidencia"}</small></span><em>${o[d.source] ?? B(d.source)}</em></div>`;
  }).join("") || "<p>Sin lecturas todavía</p>"}</div></section>`;
}
function yr(e) {
  const t = e.sch, a = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"], n = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"], s = ka(t.date), o = t.view === "month" ? `${n[tt(t.date).getMonth()]} ${tt(t.date).getFullYear()}` : t.view === "week" || t.view === "agenda" ? `${tt(s).getDate()} ${n[tt(s).getMonth()]} – ${tt(Nt(s, 6)).getDate()} ${n[tt(Nt(s, 6)).getMonth()]}` : `${a[(tt(t.date).getDay() + 6) % 7]} ${tt(t.date).getDate()} ${n[tt(t.date).getMonth()]}`, r = t.events.filter((m) => !t.hide.includes(m.res)), i = 420, c = Array.from({ length: 13 }, (m, b) => i + b * 60), l = t.view === "res" ? Yt.filter((m) => !t.hide.includes(m.id)).map((m) => ({ key: `r:${m.id}`, head: m.name, sub: m.who, date: t.date, res: m.id })) : (t.view === "day" ? [t.date] : Array.from({ length: 7 }, (m, b) => Nt(s, b))).map((m) => ({ key: `d:${m}`, head: `${a[(tt(m).getDay() + 6) % 7]} ${tt(m).getDate()}`, sub: "", date: m, res: "" })), d = t.view === "day" || t.view === "week" || t.view === "res", u = t.dlg, p = u ? t.events.find((m) => m.id !== u.id && m.res === u.res && m.date === u.date && m.s < u.e && u.s < m.e) : void 0, f = u && !u.title.trim() ? "Escribe un título" : u && u.e <= u.s ? "La hora de término debe ser posterior al inicio" : "";
  return `<div class="td-studio__bar"><div class="td-ecom__seg">${[["day", "Día"], ["week", "Semana"], ["month", "Mes"], ["agenda", "Agenda"], ["res", "Recursos"]].map(([m, b]) => `<button type="button" data-st="view:${m}" aria-pressed="${t.view === m}">${b}</button>`).join("")}</div>
        <div class="td-ecom__nav"><button type="button" data-st="prev">Anterior</button><button type="button" data-st="today">Hoy</button><button type="button" data-st="next">Siguiente</button><strong>${o}</strong><button type="button" data-st="new">Nuevo trabajo</button></div></div>
        <div class="td-ecom__chips">${Yt.map((m) => `<button type="button" data-st="res:${m.id}" aria-pressed="${!t.hide.includes(m.id)}" style="--c:${m.c}">${m.name}</button>`).join("")}</div>
        ${d ? `<div class="td-studio__cal" style="--cols:${l.length}"><div class="td-studio__hours">${c.map((m) => `<span>${Ct(m)}</span>`).join("")}</div>${l.map((m) => `<section data-st-col="${m.key}"><header>${m.head}<small>${m.sub}</small></header><div class="td-studio__col" data-st="slot:${m.key}">${r.filter((b) => {
    const h = t.drag?.id === b.id ? t.drag : null, g = h?.col.startsWith("d:") ? h.col.slice(2) : b.date, w = h?.col.startsWith("r:") ? h.col.slice(2) : b.res;
    return g === m.date && (t.view !== "res" || w === m.res);
  }).map((b) => {
    const h = t.drag?.id === b.id ? t.drag : null, g = h?.s ?? b.s, w = h?.e ?? b.e, v = Yt.find((E) => E.id === (h?.col.startsWith("r:") ? h.col.slice(2) : b.res))?.c || "#333";
    return `<button type="button" class="td-studio__event" data-st="edit:${b.id}" style="top:${(g - i) / 60 * 48}px;height:${Math.max(22, (w - g) / 60 * 48 - 2)}px;--c:${v}"><b>${B(b.title)}</b><small>${Ct(g)}–${Ct(w)}</small></button>`;
  }).join("")}</div></section>`).join("")}</div>` : ""}
        ${t.view === "agenda" ? Array.from({ length: 7 }, (m, b) => Nt(s, b)).map((m) => {
    const b = r.filter((h) => h.date === m);
    return `<section><h3>${a[(tt(m).getDay() + 6) % 7]} ${tt(m).getDate()} · ${b.length} trabajos</h3><ul class="td-ecom__lines">${b.map((h) => `<li><button type="button" data-st="edit:${h.id}"><b>${Ct(h.s)}–${Ct(h.e)} ${B(h.title)}</b><small>${Yt.find((g) => g.id === h.res)?.name}</small></button></li>`).join("") || "<li>Sin trabajos</li>"}</ul></section>`;
  }).join("") : ""}
        ${t.view === "month" ? `<div class="td-studio__month">${a.map((m) => `<b>${m}</b>`).join("")}${vr(t).map((m) => `<button type="button" data-st="day:${m.date}"><span>${m.n}</span>${m.titles.map((b) => `<small>${B(b)}</small>`).join("")}${m.more ? `<em>${m.more}</em>` : ""}</button>`).join("")}</div>` : ""}
        ${u ? `<form class="td-studio__dlg" role="dialog" aria-label="${u.id ? "Editar trabajo" : "Nuevo trabajo"}"><h3>${u.id ? "Editar trabajo" : "Nuevo trabajo"}</h3>
            <label>Título<input data-st-in="title" value="${B(u.title)}"></label>
            <label>Fecha<input data-st-in="sdate" type="date" value="${u.date}"></label>
            <label>Inicio<select data-st-in="ss">${sn(u.s)}</select></label><label>Término<select data-st-in="se">${sn(u.e)}</select></label>
            <label>Recurso<select data-st-in="sres">${Yt.map((m) => `<option value="${m.id}" ${u.res === m.id ? "selected" : ""}>${m.name} · ${m.who}</option>`).join("")}</select></label>
            <label>Nota<textarea data-st-in="snote">${B(u.note)}</textarea></label>
            ${t.tried && f ? `<p class="td-ecom__err" role="alert">${f}</p>` : ""}${p ? `<p role="status">Choca con “${B(p.title)}” (${Ct(p.s)}–${Ct(p.e)}) en el mismo recurso.</p>` : ""}
            <div class="td-ecom__nav"><button type="button" data-st="save">Guardar</button>${u.id ? '<button type="button" data-st="sdel">Eliminar</button>' : ""}<button type="button" data-st="sclose">Cerrar</button></div></form>` : ""}`;
}
function sn(e) {
  let t = "";
  for (let a = 420; a <= 1200; a += 15) t += `<option value="${a}" ${a === e ? "selected" : ""}>${Ct(a)}</option>`;
  return t;
}
function vr(e) {
  const t = tt(e.date);
  t.setDate(1);
  const a = ka(ie(t));
  return Array.from({ length: 42 }, (n, s) => {
    const o = Nt(a, s), r = e.events.filter((i) => i.date === o && !e.hide.includes(i.res));
    return { date: o, n: String(tt(o).getDate()), titles: r.slice(0, 3).map((i) => i.title), more: r.length > 3 ? `+${r.length - 3}` : "" };
  });
}
function xr(e, t) {
  return e === "labeldesigner" ? hr(t) : e === "reportdesigner" ? Zo(t.report) : e === "printers" ? br(t) : e === "ehid" ? gr(t) : e === "scanner" ? $r(t) : e === "scheduler" ? yr(t) : "";
}
function on(e, t) {
  const a = z.get(e);
  if (!a) return;
  if (e.dataset.kind === "reportdesigner") {
    Yo(e, a.report, t, () => j(e)), j(e);
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
  else if (s === "add") Sr(i, o);
  else if (s === "del")
    i.els = i.els.filter((c) => c.id !== i.sel), i.sel = null;
  else if (s === "dup") wr(i);
  else if (s === "align" && (o === "left" || o === "center" || o === "right")) {
    const c = i.els.find((l) => l.id === i.sel);
    c && (c.align = o);
  } else if (s === "bcfmt") {
    const c = i.els.find((l) => l.id === i.sel);
    c && (c.format = o);
  } else if (s === "copdec") i.copies = at(i.copies - 1, 1, 999);
  else if (s === "copinc") i.copies = at(i.copies + 1, 1, 999);
  else if (s === "dlzpl") {
    Hn(ia(a), `etiqueta-${i.w}x${i.h}.zpl`), nt(e, "Archivo ZPL descargado");
    return;
  } else if (s === "var") {
    const c = i.els.find((l) => l.id === i.sel);
    c && c.text != null && (c.text = c.type === "text" ? `${c.text} {${o}}`.trim() : `{${o}}`);
  } else if (s === "print") {
    const c = `${i.copies} ${i.copies === 1 ? "etiqueta" : "etiquetas"}`, l = i.printer === "browser" ? `Impresión del navegador · ${c} de ${i.w}×${i.h} mm` : `Enviado a ${i.printer === "zebra300" ? "Zebra ZT411" : "Zebra ZD421"} · ${c}`;
    i.jobs = [{ t: zt(), text: l }, ...i.jobs].slice(0, 4), nt(e, l);
    return;
  } else if (s === "copyzpl") {
    navigator.clipboard?.writeText(ia(a)).then(() => nt(e, "ZPL copiado"), () => nt(e, "No se pudo copiar el ZPL"));
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
    qr(e, a);
    return;
  } else if (s === "applyjson") Er(e, a);
  else if (s === "btscan") _r(e, a);
  else if (s === "scanclose")
    window.clearInterval(a.print.scanTimer), a.print.scan = null;
  else if (s === "webbt") {
    Tr(e, a);
    return;
  } else if (s === "pair") kr(e, a, n.slice(1).join(":"));
  else if (s === "wifi") a.print.wifi = !a.print.wifi;
  else if (s === "wfadd") Mr(e, a);
  else if (s === "seldev") a.print.sel = o;
  else if (s === "conn") Lr(e, a);
  else if (s === "def")
    a.print.devs.forEach((c) => {
      c.def = c.id === a.print.sel;
    }), pt(a, "SYS", "Impresora predeterminada actualizada");
  else if (s === "forget")
    a.print.devs = a.print.devs.filter((c) => c.id !== a.print.sel), a.print.sel = a.print.devs[0]?.id || "", pt(a, "SYS", "Impresora olvidada");
  else if (s === "test" || s === "send") Ar(e, a, s === "test");
  else if (s === "preset" && en[o]) a.print.raw = en[o];
  else if (s === "pcopdec") a.print.copies = at(a.print.copies - 1, 1, 999);
  else if (s === "pcopinc") a.print.copies = at(a.print.copies + 1, 1, 999);
  else if (s === "clearlog") a.print.log = [];
  else if (s === "hidsim") qa(a, R[Math.floor(Math.random() * 6)].code);
  else if (s === "hidclear")
    a.hid.log = [], a.hid.last = null, a.hid.count = 0;
  else if (s === "hidon") a.hid.on = !a.hid.on;
  else if (s === "hidignore") a.hid.ignore = !a.hid.ignore;
  else if (s === "smode" && (o === "single" || o === "continuous"))
    a.scan.mode = o, a.scan.waiting = !1;
  else if (s === "sfmt") a.scan.formats = a.scan.formats.includes(o) ? a.scan.formats.length > 1 ? a.scan.formats.filter((c) => c !== o) : a.scan.formats : [...a.scan.formats, o];
  else if (s === "scam") Br(e, a);
  else if (s === "ssim") Hr(e, a);
  else if (s === "snext")
    a.scan.waiting = !1, a.scan.lastCode = "";
  else if (s === "sadd") Nr(e, a);
  else if (s === "sclear")
    a.scan.reads = [], a.scan.last = null, a.scan.waiting = !1;
  else if (s === "sbeep") a.scan.beep = !a.scan.beep;
  else if (s === "svib") a.scan.vibrate = !a.scan.vibrate;
  else if (s === "swedge") a.scan.wedge = !a.scan.wedge;
  else if (s === "scopy") {
    const c = a.scan.last?.value;
    if (!c) return;
    navigator.clipboard?.writeText(c).then(() => nt(e, "Código copiado"), () => nt(e, "No se pudo copiar el código"));
    return;
  } else if (s === "sexport") {
    Cr(a), nt(e, "CSV de lecturas descargado");
    return;
  } else if (s === "storch") {
    Dr(e, a);
    return;
  } else if (s === "view" && ["day", "week", "month", "agenda", "res"].includes(o)) a.sch.view = o;
  else if (s === "prev" || s === "next" || s === "today") Rr(a, s);
  else if (s === "res") a.sch.hide = a.sch.hide.includes(o) ? a.sch.hide.filter((c) => c !== o) : [...a.sch.hide, o];
  else if (s === "new") a.sch.dlg = { id: 0, title: "", date: a.sch.date, s: 540, e: 600, res: "t1", note: "" };
  else if (s === "edit") a.sch.dlg = { ...a.sch.events.find((c) => c.id === Number(o)) };
  else if (s === "day")
    a.sch.date = o, a.sch.view = "day";
  else if (s === "slot") a.sch.dlg = { id: 0, title: "", date: o === "d" ? r : a.sch.date, s: 540, e: 600, res: o === "r" ? r : "t1", note: "" };
  else if (s === "save") Ir(e, a);
  else if (s === "sdel" && a.sch.dlg) {
    a.sch.events = a.sch.events.filter((c) => c.id !== a.sch.dlg?.id), nt(e, `Eliminado: ${a.sch.dlg.title}`), a.sch.dlg = null;
    return;
  } else s === "sclose" && (a.sch.dlg = null);
  j(e);
}
function wr(e) {
  const t = e.els.find((n) => n.id === e.sel);
  if (!t) return;
  const a = `e${e.nid + 1}`;
  e.els = [...e.els, { ...t, id: a, x: t.x + 2, y: t.y + 2 }], e.sel = a, e.nid += 1;
}
function Hn(e, t) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([e], { type: "text/plain" })), a.download = t, a.click(), URL.revokeObjectURL(a.href);
}
function Sr(e, t) {
  const a = `e${e.nid + 1}`, n = t === "text" ? { id: a, type: t, x: 2, y: 2, w: 30, h: 4, text: "Texto", size: 3, align: "left" } : t === "barcode" ? { id: a, type: t, x: 2, y: 2, w: 34, h: 14, text: "{code}", format: "c128", showText: !0 } : t === "qr" ? { id: a, type: t, x: 2, y: 2, w: 14, h: 14, text: "{url}" } : t === "line" ? { id: a, type: t, x: 2, y: 2, w: e.w - 6, h: 0.4, thick: 0.4 } : { id: a, type: t, x: 2, y: 2, w: 20, h: 10, thick: 0.35 };
  e.els = [...e.els, n], e.sel = a, e.nid += 1;
}
function Er(e, t) {
  try {
    const a = JSON.parse(t.label.json || "{}");
    if (!a.size || !Array.isArray(a.elements)) throw new Error('Faltan "size" o "elements".');
    t.label.els = a.elements.map((n, s) => ({ ...n, id: `j${s}` })), t.label.w = at(Number(a.size.width) || 62, 10, 200), t.label.h = at(Number(a.size.height) || 40, 10, 300), t.label.jsonMsg = `Plantilla aplicada · ${t.label.els.length} elementos`, t.label.jsonBad = !1, t.label.json = "";
  } catch (a) {
    t.label.jsonMsg = `JSON no válido: ${a instanceof Error ? a.message : "revisa la plantilla"}`, t.label.jsonBad = !0;
  }
  j(e);
}
function pt(e, t, a) {
  e.print.log = [{ t: zt(), dir: t, msg: a }, ...e.print.log].slice(0, 40);
}
function _r(e, t) {
  window.clearInterval(t.print.scanTimer);
  const a = [
    { name: "Zebra ZQ630", model: "ZQ630", proto: "CPCL", rssi: -58, battery: 91, mac: "" },
    { name: "Epson TM-P20II", model: "TM-P20II", proto: "ESC/POS", rssi: -69, battery: 64, mac: "" },
    { name: "TSC Alpha-40L", model: "Alpha-40L", proto: "TSPL", rssi: -63, battery: 77, mac: "" }
  ];
  a.forEach((n, s) => {
    n.mac = Array.from({ length: 6 }, (o, r) => ((n.name.length * 37 + r * 53 + s * 11) % 256).toString(16).padStart(2, "0")).join(":").toUpperCase();
  }), t.print.scan = { pr: 0, found: [] }, pt(t, "SYS", "Buscando dispositivos Bluetooth LE cercanos…"), t.print.scanTimer = window.setInterval(() => {
    const n = t.print.scan;
    if (!n || !e.isConnected) {
      window.clearInterval(t.print.scanTimer);
      return;
    }
    n.pr = Math.min(100, n.pr + 25), n.found.length < a.length && n.found.push(a[n.found.length]), n.pr >= 100 && (window.clearInterval(t.print.scanTimer), pt(t, "SYS", `Búsqueda terminada · ${n.found.length} dispositivos`)), j(e);
  }, 450), j(e);
}
function kr(e, t, a) {
  const n = t.print.scan?.found.find((o) => o.mac === a);
  if (!n || t.print.devs.some((o) => o.addr === a)) return;
  const s = { id: `bt${a}`, name: n.name, model: `${n.model} · 203 dpi`, conn: "bt", addr: a, proto: n.proto, dpi: 203, width: 104, status: "connecting", rssi: n.rssi, battery: n.battery, fw: "—", jobs: 0 };
  t.print.devs = [...t.print.devs, s], t.print.sel = s.id, pt(t, "SYS", `${n.name} emparejada (${a})`), window.setTimeout(() => {
    s.status = "connected", pt(t, "RX", `${n.name}: lista · papel OK · batería ${n.battery}%`), e.isConnected && j(e);
  }, 900);
}
function Mr(e, t) {
  const a = t.print.wf, n = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(a.ip.trim()), s = Number(a.port);
  if (!n) {
    t.print.wfMsg = "Ingresa una IPv4 válida, por ejemplo 192.168.1.60", t.print.wfBad = !0, j(e);
    return;
  }
  if (!(s > 0 && s < 65536)) {
    t.print.wfMsg = "Puerto no válido", t.print.wfBad = !0, j(e);
    return;
  }
  const o = `${a.ip.trim()}:${s}`;
  if (t.print.devs.some((c) => c.addr === o)) {
    t.print.wfMsg = "Esa impresora ya está en la lista", t.print.wfBad = !0, j(e);
    return;
  }
  const r = a.name.trim() || `Impresora ${a.ip.trim()}`, i = { id: `wf${Date.now()}`, name: r, model: `${a.proto} · red`, conn: "wifi", addr: o, proto: a.proto, dpi: 203, width: 104, status: "connected", rssi: -55, fw: "—", jobs: 0 };
  t.print.devs = [...t.print.devs, i], t.print.sel = i.id, t.print.wifi = !1, t.print.wf = { name: "", ip: "", port: "9100", proto: "ZPL" }, t.print.wfMsg = "", pt(t, "RX", `${r}: responde en ${o} · ${i.proto}`), j(e);
}
function Lr(e, t) {
  const a = t.print.devs.find((n) => n.id === t.print.sel);
  if (a) {
    if (a.status === "connected" || a.status === "printing") {
      a.status = "disconnected", pt(t, "SYS", `${a.name}: desconectada`);
      return;
    }
    a.status = "connecting", a.err = "", pt(t, "SYS", `Conectando a ${a.name}…`), window.setTimeout(() => {
      a.unreachable ? (a.status = "error", a.err = `No hubo respuesta en ${a.addr}. Revisa que esté encendida y con el puerto 9100 habilitado.`, pt(t, "ERR", `${a.name}: timeout`)) : (a.status = "connected", pt(t, "RX", `${a.name}: lista · papel OK`)), e.isConnected && j(e);
    }, 900);
  }
}
function Ar(e, t, a) {
  const n = t.print.devs.find((o) => o.id === t.print.sel);
  if (!n || n.status !== "connected") return;
  n.status = "printing";
  const s = a ? t.print.copies : 1;
  pt(t, "TX", `${n.name} ← ${a ? `prueba × ${s}` : "comando"} · ${n.proto}`), window.setTimeout(() => {
    n.status = "connected", n.jobs += s, pt(t, "RX", `${n.name}: trabajo completado · ${s} ${s === 1 ? "etiqueta" : "etiquetas"}`), e.isConnected && j(e);
  }, 700), j(e);
}
function qa(e, t) {
  const a = R.find((n) => n.code === t);
  e.hid.count += 1, e.hid.last = { code: t, t: zt(), name: a?.name ?? null }, e.hid.log = [e.hid.last, ...e.hid.log].slice(0, 40);
}
function ze(e, t, a, n, s) {
  const o = t.scan;
  if (o.mode === "single" && o.waiting && s === "camera") return;
  const r = Date.now();
  if (o.lastCode === a && r - o.lastAt < o.dedupe && s !== "manual") return;
  o.lastCode = a, o.lastAt = r;
  const i = { value: a, format: n, source: s, t: zt(), id: r };
  o.reads = [i, ...o.reads].slice(0, 80), o.last = i, o.waiting = o.mode === "single", dr(o), nt(e, `${a} · ${s === "camera" ? "cámara" : s === "wedge" ? "lector" : s === "manual" ? "teclado" : "simulación"}`);
}
function qr(e, t) {
  const a = t.label;
  let n;
  try {
    const i = JSON.parse(a.batch || "[]");
    if (!Array.isArray(i) || !i.length) throw new Error("vacío");
    n = i;
  } catch {
    nt(e, "El lote debe ser un arreglo JSON con al menos un registro.");
    return;
  }
  const s = a.copies, o = n.length * s, r = `Lote enviado · ${n.length} registros × ${s} ${s === 1 ? "copia" : "copias"} = ${o} etiquetas`;
  a.jobs = [{ t: zt(), text: r }, ...a.jobs].slice(0, 4), nt(e, r);
}
function Cr(e) {
  const t = (n) => `"${n.replace(/"/g, '""')}"`, a = ["hora,formato,codigo,origen", ...e.scan.reads.map((n) => [n.t, n.format, n.value, n.source].map(t).join(","))];
  Hn(a.join(`
`), "lecturas.csv");
}
async function Tr(e, t) {
  const a = navigator.bluetooth;
  if (!a?.requestDevice) {
    nt(e, "Este navegador no abre el selector Bluetooth.");
    return;
  }
  try {
    const n = await a.requestDevice({ acceptAllDevices: !0 }), s = n.id;
    if (t.print.devs.some((o) => o.addr === s)) {
      nt(e, `${n.name || "El equipo"} ya está en la lista.`);
      return;
    }
    t.print.devs = [...t.print.devs, { id: `bt${s}`, name: n.name || "Impresora Bluetooth", model: "Seleccionada en el navegador", conn: "bt", addr: s, proto: "ZPL", dpi: 203, width: 104, status: "disconnected", rssi: -55, fw: "—", jobs: 0 }], t.print.sel = `bt${s}`, pt(t, "SYS", `Selector del navegador · ${n.name || s}`), j(e);
  } catch (n) {
    if (n instanceof DOMException && n.name === "NotFoundError") return;
    nt(e, "No se pudo usar el selector Bluetooth.");
  }
}
function Hr(e, t) {
  if (t.scan.mode === "single" && t.scan.waiting) return;
  const a = [["BR-4521-AD", "code_128"], ["https://uiuxblazor.dev/r/MT-7702-FL", "qr_code"], ["7801234567892", "ean_13"], ["96385074", "ean_8"]], n = a[t.scan.sim % a.length];
  t.scan.sim += 1, t.scan.lastCode = "", ze(e, t, n[0], n[1], "sim");
}
function Nr(e, t) {
  const a = t.scan.manual.trim();
  if (!a) return;
  const n = /^\d{13}$/.test(a) ? "ean_13" : /^https?:/i.test(a) ? "qr_code" : "code_128";
  t.scan.manual = "", t.scan.waiting = !1, t.scan.lastCode = "", ze(e, t, a, n, "manual");
}
function Ca(e, t) {
  ce.get(e)?.getTracks().forEach((a) => a.stop()), ce.delete(e), t.scan.on = !1, t.scan.torch = !1, e.dataset.tdScanGen = "";
}
async function Br(e, t) {
  if (t.scan.on) {
    Ca(e, t), j(e);
    return;
  }
  await Nn(e, t);
}
async function Nn(e, t) {
  if (!navigator.mediaDevices?.getUserMedia) {
    t.scan.err = "Este navegador no permite usar la cámara.", j(e);
    return;
  }
  try {
    const a = t.scan.camId ? { deviceId: { exact: t.scan.camId } } : { facingMode: { ideal: "environment" } }, n = await navigator.mediaDevices.getUserMedia({ video: a, audio: !1 });
    ce.set(e, n), t.scan.on = !0, t.scan.err = "";
    const o = (await navigator.mediaDevices.enumerateDevices().catch(() => [])).filter((c) => c.kind === "videoinput").map((c, l) => ({ id: c.deviceId, label: c.label || `Cámara ${l + 1}` }));
    o.length && (t.scan.cams = o);
    const r = n.getVideoTracks()[0], i = r?.getCapabilities?.();
    t.scan.torchOk = !!(i && "torch" in i && i.torch), t.scan.torch = !1, r?.getSettings().deviceId && (t.scan.camId = r.getSettings().deviceId || t.scan.camId), j(e), Tn(e), Pr(e);
  } catch (a) {
    Ca(e, t), t.scan.err = a instanceof DOMException && a.name === "NotAllowedError" ? "Permiso de cámara denegado. Habilítalo en el navegador." : "No se pudo abrir la cámara.", j(e);
  }
}
async function jr(e, t) {
  if (!t.scan.on) return;
  const a = t.scan.camId;
  Ca(e, t), t.scan.camId = a, await Nn(e, t);
}
async function Dr(e, t) {
  const a = ce.get(e)?.getVideoTracks()[0];
  if (!a) return;
  const n = !t.scan.torch;
  try {
    await a.applyConstraints({ advanced: [{ torch: n }] }), t.scan.torch = n, j(e);
  } catch {
    t.scan.torch = !1, t.scan.torchOk = !1, nt(e, "Esta cámara no permite la linterna.");
  }
}
function Pr(e) {
  const t = window.BarcodeDetector;
  if (!t) return;
  const a = String(Date.now());
  e.dataset.tdScanGen = a;
  const n = z.get(e);
  let s = n?.scan.formats.join() ?? "", o = new t({ formats: n?.scan.formats ?? ["qr_code"] });
  const r = async () => {
    const i = z.get(e);
    if (e.dataset.tdScanGen !== a || !i?.scan.on || !e.isConnected) return;
    const c = i.scan.formats.join();
    c !== s && (s = c, o = new t({ formats: i.scan.formats }));
    const l = e.querySelector("[data-st-video]");
    if (l instanceof HTMLVideoElement && l.readyState >= 2 && !(i.scan.mode === "single" && i.scan.waiting))
      try {
        const u = (await o.detect(l)).find((p) => p.rawValue);
        u && e.dataset.tdScanGen === a && ze(e, i, u.rawValue, u.format || "qr_code", "camera");
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
function Rr(e, t) {
  if (t === "today") {
    e.sch.date = ie(/* @__PURE__ */ new Date());
    return;
  }
  const a = e.sch.view === "month" ? 0 : e.sch.view === "week" || e.sch.view === "agenda" ? 7 : 1;
  if (!a) {
    const n = tt(e.sch.date);
    n.setMonth(n.getMonth() + (t === "next" ? 1 : -1)), e.sch.date = ie(n);
    return;
  }
  e.sch.date = Nt(e.sch.date, t === "next" ? a : -a);
}
function Ir(e, t) {
  const a = t.sch.dlg;
  if (a) {
    if (!a.title.trim() || a.e <= a.s) {
      t.sch.tried = !0, j(e);
      return;
    }
    a.id ? (t.sch.events = t.sch.events.map((n) => n.id === a.id ? { ...a, title: a.title.trim() } : n), nt(e, `Guardado: ${a.title.trim()}`)) : (a.id = t.sch.seq + 1, t.sch.seq += 1, t.sch.events = [...t.sch.events, { ...a, title: a.title.trim() }], nt(e, `Creado: ${a.title.trim()}`)), t.sch.dlg = null;
  }
}
function rn(e, t) {
  const a = z.get(e);
  if (!a || !(t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement)) return;
  const n = t.getAttribute("data-st-in");
  if (!n) return;
  if (e.dataset.kind === "reportdesigner") {
    tr(e, a.report, n, t.value, () => j(e)) || j(e);
    return;
  }
  const s = a.label, o = s.els.find((r) => r.id === s.sel);
  if (n === "rec")
    s.rec = Number(t.value), s.record = null;
  else if (n === "copies") s.copies = at(Number(t.value) || 1, 1, 999);
  else if (n === "printer") s.printer = t.value;
  else if (n === "lw") s.w = at(Number(t.value) || s.w, 10, 200);
  else if (n === "lh") s.h = at(Number(t.value) || s.h, 10, 300);
  else if (n === "size" && o) o.size = Math.max(1, Number(t.value) || 3);
  else if (n === "thick" && o) o.thick = Math.max(0.1, Number(t.value) || 0.3);
  else if (n === "text" && o) o.text = t.value;
  else if (n.startsWith("geo:") && o) {
    const r = n.slice(4), i = Number(t.value);
    Number.isNaN(i) || (o[r] = Math.max(0, i));
  } else if (n === "json")
    s.json = t.value, s.jsonMsg = "Cambios sin aplicar", s.jsonBad = !1;
  else if (n === "batch") s.batch = t.value;
  else if (n === "dedupe") a.scan.dedupe = at(Number(t.value) || 0, 0, 5e3);
  else if (n === "cam") {
    a.scan.camId = t.value, jr(e, a);
    return;
  } else n === "wf-name" ? a.print.wf.name = t.value : n === "wf-ip" ? a.print.wf.ip = t.value : n === "wf-port" ? a.print.wf.port = t.value : n === "wf-proto" ? a.print.wf.proto = t.value : n === "pcopies" ? a.print.copies = at(Number(t.value) || 1, 1, 999) : n === "raw" ? a.print.raw = t.value : n === "min" ? a.hid.minLen = Math.max(1, Number(t.value) || 1) : n === "gap" ? a.hid.gap = Number(t.value) || 0 : n === "manual" ? a.scan.manual = t.value : a.sch.dlg && n === "title" ? a.sch.dlg.title = t.value : a.sch.dlg && n === "sdate" ? a.sch.dlg.date = t.value : a.sch.dlg && n === "ss" ? a.sch.dlg.s = Number(t.value) : a.sch.dlg && n === "se" ? a.sch.dlg.e = Number(t.value) : a.sch.dlg && n === "sres" ? a.sch.dlg.res = t.value : a.sch.dlg && n === "snote" && (a.sch.dlg.note = t.value);
  n !== "raw" && n !== "json" && n !== "batch" && n !== "manual" && n !== "title" && n !== "snote" && j(e);
}
function Fr(e, t) {
  if (t.button !== 0) return;
  if (e.dataset.kind === "reportdesigner") {
    const r = z.get(e);
    r && ar(r.report, t);
    return;
  }
  if (e.dataset.kind === "labeldesigner") {
    Or(e, t);
    return;
  }
  if (e.dataset.kind !== "scheduler") return;
  const a = t.target instanceof Element ? t.target.closest('[data-st^="edit:"]') : null;
  if (!(a instanceof HTMLElement)) return;
  const n = z.get(e), s = n?.sch.events.find((r) => r.id === Number(a.dataset.st?.slice(5)));
  if (!n || !s) return;
  n.sch.skipClick = !1;
  const o = a.getBoundingClientRect();
  n.sch.drag = { id: s.id, s: s.s, e: s.e, dur: s.e - s.s, col: a.closest("[data-st-col]")?.getAttribute("data-st-col") || "", grab: t.clientY - o.top, moved: !1 };
}
function Or(e, t) {
  const a = z.get(e);
  if (!a || a.label.mode !== "design") return;
  const n = t.target instanceof Element ? t.target.closest('[data-st^="resize:"]') : null, s = t.target instanceof Element ? t.target.closest('[data-st^="sel:"]') : null, o = n instanceof HTMLElement ? n.dataset.st?.slice(7) : s instanceof HTMLElement ? s.dataset.st?.slice(4) : "", r = a.label.els.find((i) => i.id === o);
  r && (a.label.sel = r.id, a.labelDrag = { id: r.id, mode: n ? "resize" : "move", x: r.x, y: r.y, w: r.w, h: r.h, px: t.clientX, py: t.clientY, moved: !1 }, e.setPointerCapture?.(t.pointerId), t.preventDefault());
}
function zr(e) {
  const t = [...document.querySelectorAll("td-studio")].find((p) => p instanceof HTMLElement && z.get(p)?.report.drag);
  if (t instanceof HTMLElement) {
    const p = z.get(t);
    if (!p) return;
    nr(p.report, e), p.report.drag?.moved && j(t);
    return;
  }
  const a = [...document.querySelectorAll("td-studio")].find((p) => p instanceof HTMLElement && z.get(p)?.labelDrag);
  if (a instanceof HTMLElement) {
    Vr(a, e);
    return;
  }
  const n = document.querySelector('td-studio[data-kind="scheduler"]');
  if (!(n instanceof HTMLElement)) return;
  const s = z.get(n), o = s?.sch.drag;
  if (!s || !o) return;
  const i = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-st-col]"), c = i?.getAttribute("data-st-col") || o.col, l = i?.querySelector(".td-studio__col")?.getBoundingClientRect();
  if (!l) return;
  const d = 420 + (e.clientY - o.grab - l.top) / 48 * 60, u = at(Math.round(d / 15) * 15, 420, 1200 - o.dur);
  Math.abs(e.clientY - (l.top + (o.s - 420) / 60 * 48 + o.grab)) < 6 && c === o.col && !o.moved || u === o.s && c === o.col || (o.s = u, o.e = u + o.dur, o.col = c, o.moved = !0, j(n));
}
function Vr(e, t) {
  const a = z.get(e), n = a?.labelDrag;
  if (!a || !n) return;
  const s = a.label.els.find((d) => d.id === n.id);
  if (!s) return;
  const o = Number(e.dataset.lbScale) || Aa(a.label), r = (t.clientX - n.px) / o, i = (t.clientY - n.py) / o;
  Math.hypot(t.clientX - n.px, t.clientY - n.py) > 3 && (n.moved = !0), n.mode === "move" ? (s.x = Math.max(0, Math.round((n.x + r) * 2) / 2), s.y = Math.max(0, Math.round((n.y + i) * 2) / 2)) : (s.w = Math.max(2, Math.round((n.w + r) * 2) / 2), s.h = Math.max(1, Math.round((n.h + i) * 2) / 2));
  const c = e.querySelector(`[data-lb="${CSS.escape(s.id)}"]`);
  c && c.setAttribute("transform", `translate(${s.x} ${s.y})`);
  const l = e.querySelector(`[data-st="${CSS.escape(`sel:${s.id}`)}"]`);
  l instanceof HTMLElement && (l.style.left = `${s.x * o}px`, l.style.top = `${s.y * o}px`, l.style.width = `${s.w * o}px`, l.style.height = `${Math.max(s.h, s.type === "line" ? 1.2 : s.h) * o}px`), n.mode === "resize" && lr(e);
}
function Ur(e) {
  const t = [...document.querySelectorAll("td-studio")].find((i) => i instanceof HTMLElement && z.get(i)?.report.drag);
  if (t instanceof HTMLElement) {
    const i = z.get(t);
    if (!i) return;
    const c = sr(i.report);
    c && (t.dataset.skipClick = "1"), j(t), c && e.preventDefault();
    return;
  }
  const a = [...document.querySelectorAll("td-studio")].find((i) => i instanceof HTMLElement && z.get(i)?.labelDrag);
  if (a instanceof HTMLElement) {
    const i = z.get(a), c = i?.labelDrag?.moved;
    i && (i.labelDrag = null), c && (a.dataset.skipClick = "1"), c && (e.preventDefault(), j(a));
    return;
  }
  const n = document.querySelector('td-studio[data-kind="scheduler"]');
  if (!(n instanceof HTMLElement)) return;
  const s = z.get(n), o = s?.sch.drag;
  if (!s || !o || (s.sch.drag = null, !o.moved)) return;
  const r = s.sch.events.find((i) => i.id === o.id);
  r && (r.s = o.s, r.e = o.e, o.col.startsWith("d:") && (r.date = o.col.slice(2)), o.col.startsWith("r:") && (r.res = o.col.slice(2))), s.sch.skipClick = !0, e.preventDefault(), j(n);
}
function Wr(e) {
  const t = document.querySelector("td-studio");
  if (!(t instanceof HTMLElement)) return;
  const a = z.get(t);
  if (!a) return;
  const n = e.target, s = n instanceof HTMLElement && (n.tagName === "INPUT" || n.tagName === "TEXTAREA" || n.tagName === "SELECT" || n.isContentEditable);
  if (t.dataset.kind === "reportdesigner" && !s && t.contains(n instanceof Node ? n : t)) {
    or(a.report, e.key, e.shiftKey) && (e.preventDefault(), j(t));
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
    e.preventDefault(), j(t);
    return;
  }
  if (t.dataset.kind === "ehid" && a.hid.on) {
    if (a.hid.ignore && s || s && t.contains(n)) return;
    const o = performance.now();
    o - a.hid.lastAt > a.hid.gap && (a.hid.buf = ""), a.hid.lastAt = o, e.key === "Enter" ? (a.hid.buf.length >= a.hid.minLen && qa(a, a.hid.buf), a.hid.buf = "", j(t)) : e.key.length === 1 && (a.hid.buf += e.key);
  }
  if (t.dataset.kind === "scanner" && a.scan.wedge && !s) {
    const o = Date.now();
    if (o - a.scan.bufAt > 80 && (a.scan.buf = ""), a.scan.bufAt = o, e.key === "Enter" && a.scan.buf.length >= 4) {
      e.preventDefault();
      const r = a.scan.buf;
      a.scan.buf = "", ze(t, a, r, /^\d{13}$/.test(r) ? "ean_13" : "code_128", "wedge");
    } else e.key.length === 1 && (a.scan.buf += e.key);
  }
}
function Gr(e, t) {
  const a = e.dataset.kind || "";
  if (a === "labeldesigner") {
    const n = t.label, s = Number(e.dataset.width), o = Number(e.dataset.height), r = Number(e.dataset.dpi), i = Number(e.dataset.copies);
    if (s && (n.w = at(s, 10, 200)), o && (n.h = at(o, 10, 300)), (r === 203 || r === 300) && (n.dpi = r), i && (n.copies = at(Math.round(i), 1, 99)), e.dataset.template)
      try {
        const c = JSON.parse(e.dataset.template);
        c.size && Array.isArray(c.elements) && (n.els = c.elements.map((l, d) => ({ ...l, id: l.id || `e${d + 1}` })), n.w = at(Number(c.size.width) || n.w, 10, 200), n.h = at(Number(c.size.height) || n.h, 10, 300), (c.size.dpi === 203 || c.size.dpi === 300) && (n.dpi = c.size.dpi), n.sel = n.els[0]?.id ?? null, n.nid = n.els.length);
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
    Jo(t.report, e);
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
    n && (t.hid.minLen = at(Math.round(n), 1, 64)), e.dataset.gap != null && (t.hid.gap = Math.max(0, Number(e.dataset.gap) || 0)), t.hid.ignore = e.dataset.ignore === "true", e.dataset.initial && qa(t, e.dataset.initial);
    return;
  }
  if (a === "scanner" && ((e.dataset.mode === "single" || e.dataset.mode === "continuous") && (t.scan.mode = e.dataset.mode), (e.dataset.wedge === "true" || e.dataset.wedge === "false") && (t.scan.wedge = e.dataset.wedge === "true"), e.dataset.initial)) {
    const n = e.dataset.initial, s = { value: n, format: "code_128", source: "wedge", t: zt(), id: 1 };
    t.scan.reads = [s], t.scan.last = s, t.scan.lastCode = n, t.scan.lastAt = Date.now();
  }
}
function Jr(e) {
  if (e.dataset.tdLbWatch === "1" || typeof ResizeObserver > "u") return;
  e.dataset.tdLbWatch = "1", new ResizeObserver(() => {
    const a = z.get(e), n = e.querySelector(".td-studio__well"), s = Math.round((n instanceof HTMLElement ? n.clientWidth : e.clientWidth) || 0);
    !a || !s || a.labelDrag || Math.abs(s - a.label.avail) < 16 || (a.label.avail = s, j(e));
  }).observe(e);
}
function Bn(e = document) {
  e.querySelectorAll("td-studio").forEach((t) => {
    if (z.has(t)) return;
    const a = pr();
    Gr(t, a), z.set(t, a), t.addEventListener("click", (n) => {
      const s = z.get(t);
      if (t.dataset.skipClick === "1") {
        delete t.dataset.skipClick;
        return;
      }
      if (s?.sch.skipClick) {
        s.sch.skipClick = !1;
        return;
      }
      const o = n.target instanceof Element ? n.target.closest("[data-st]") : null;
      !(o instanceof HTMLElement) || o instanceof HTMLInputElement || o.dataset.st?.startsWith("slot:") && n.target !== o || on(t, o.dataset.st || "");
    }), t.addEventListener("pointerdown", (n) => Fr(t, n)), t.addEventListener("change", (n) => {
      const s = n.target;
      if (s instanceof HTMLInputElement && s.dataset.stFile === "uxr") {
        const o = z.get(t);
        o && er(t, o.report, s, () => j(t));
        return;
      }
      if (s instanceof HTMLInputElement && s.dataset.st === "grid") {
        const o = z.get(t);
        o && (o.label.grid = s.checked), j(t);
        return;
      }
      if (s instanceof HTMLInputElement && (s.dataset.st === "bold" || s.dataset.st === "showtext")) {
        const o = z.get(t), r = o?.label.els.find((i) => i.id === o.label.sel);
        r && s.dataset.st === "bold" && (r.bold = s.checked), r && s.dataset.st === "showtext" && (r.showText = s.checked), j(t);
        return;
      }
      if (s instanceof HTMLInputElement && s.dataset.st === "hidon") {
        const o = z.get(t);
        o && (o.hid.on = s.checked), j(t);
        return;
      }
      if (s instanceof HTMLInputElement && s.dataset.st === "hidignore") {
        const o = z.get(t);
        o && (o.hid.ignore = s.checked), j(t);
        return;
      }
      if (s instanceof HTMLInputElement && s.dataset.st === "swedge") {
        const o = z.get(t);
        o && (o.scan.wedge = s.checked), j(t);
        return;
      }
      rn(t, s);
    }), t.addEventListener("input", (n) => {
      n.target instanceof HTMLSelectElement || rn(t, n.target);
    }), t.addEventListener("keydown", (n) => {
      n.key !== "Enter" || !(n.target instanceof HTMLInputElement) || n.target.dataset.stIn !== "manual" || (n.preventDefault(), on(t, "sadd"));
    }), j(t), t.dataset.kind === "reportdesigner" && rr(t, () => z.get(t)?.report, () => j(t)), t.dataset.kind === "labeldesigner" && Jr(t);
  }), document.documentElement.dataset.tdStudioKeys || (document.documentElement.dataset.tdStudioKeys = "1", document.addEventListener("keydown", Wr, !0), document.addEventListener("pointermove", zr), document.addEventListener("pointerup", Ur));
}
const Qr = ["help", "stock", "buscar", "pedido", "imprimir", "date", "echo", "clear"], cn = /* @__PURE__ */ new WeakSet();
function Kr(e = document) {
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
      const [p, ...f] = u.split(/\s+/), m = f.join(" "), b = p.toLowerCase();
      if (r.unshift(u), i = -1, b === "clear") {
        n?.replaceChildren(), a && (a.value = "");
        return;
      }
      if (c(`${s} ${u}`, "cmd"), b === "help")
        [["help", "lista de comandos"], ["stock <código>", "stock y precio de un repuesto"], ["buscar <texto>", "busca en el catálogo"], ["pedido <número>", "estado de un pedido"], ["imprimir <código> [copias]", "envía etiqueta a la impresora predeterminada"], ["date", "fecha y hora"], ["echo <texto>", "repite el texto"], ["clear", "limpia la pantalla"]].forEach(([h, g]) => c(`${h.padEnd(28, " ")}${g}`));
      else if (b === "date")
        c((/* @__PURE__ */ new Date()).toLocaleString("es-CL"));
      else if (b === "echo")
        c(m);
      else if (b === "stock") {
        const h = o.find((g) => g.code.toLowerCase() === m.toLowerCase());
        m ? h ? (c(`${h.code}  ${h.name}`), c(`stock ${h.stock} u. · $${h.price.toLocaleString("es-CL")} · ${h.brand}`, h.stock === 0 ? "bad" : h.stock <= 10 ? "warn" : "ok")) : c(`No existe el código ${m.toUpperCase()}`, "bad") : c("uso: stock <código>", "warn");
      } else if (b === "buscar")
        if (!m)
          c("uso: buscar <texto>", "warn");
        else {
          const h = o.filter((g) => `${g.name} ${g.code} ${g.brand}`.toLowerCase().includes(m.toLowerCase()));
          h.length || c(`Sin resultados para "${m}"`, "warn"), h.slice(0, 6).forEach((g) => c(`${g.code.padEnd(14, " ")}${g.name.slice(0, 34).padEnd(36, " ")}$${g.price.toLocaleString("es-CL")}`)), h.length > 6 && c(`… y ${h.length - 6} más`, "muted");
        }
      else if (b === "pedido") {
        const h = m.replace(/\D/g, "");
        if (!h)
          c("uso: pedido <número>", "warn");
        else {
          const g = ["Recibido", "Preparando", "En ruta", "Entregado"];
          c(`OC-${h.padStart(5, "0")} · ${g[Number(h) % 4]} · Transportes del Sur`, "ok");
        }
      } else if (b === "imprimir") {
        const [h, g] = f;
        if (!h)
          c("uso: imprimir <código> [copias]", "warn");
        else {
          const w = Math.max(1, Number.parseInt(g || "1", 10) || 1);
          c(`→ Zebra ZD421 · ^XA^FD${h.toUpperCase()}^FS^PQ${w}^XZ`, "print"), c(`Trabajo enviado · ${w} ${w === 1 ? "etiqueta" : "etiquetas"}`, "ok");
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
        const u = Qr.filter((p) => p.startsWith(a.value.toLowerCase()));
        u.length === 1 ? a.value = `${u[0]} ` : u.length > 1 && c(u.join("   "), "muted");
      } else d.key === "l" && d.ctrlKey && (d.preventDefault(), n?.replaceChildren());
    }), t.addEventListener("click", () => a?.focus()), t.parentElement?.addEventListener("click", (d) => {
      const u = d.target instanceof Element ? d.target.closest("[data-td-term-chip]") : null;
      u instanceof HTMLElement && l(u.dataset.tdTermChip ?? u.textContent ?? "");
    });
  }), e.querySelectorAll("td-org").forEach((t) => {
    if (cn.has(t))
      return;
    cn.add(t);
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
function Zr(e = document) {
  e.querySelectorAll('[data-td-checkbox][data-tri="true"]').forEach((t) => {
    t.indeterminate = t.dataset.state === "mixed";
  }), e.querySelectorAll("[data-td-carousel]").forEach((t) => {
    li(t);
  }), e.querySelectorAll("[data-td-toast]").forEach((t) => {
    window.setTimeout(() => t.remove(), 4e3);
  }), e.querySelectorAll("[data-td-chip-box]").forEach((t) => {
    t.dataset.tpl || (t.dataset.tpl = t.innerHTML);
  });
}
function Xr(e) {
  e.closest("td-split") || (document.querySelectorAll("[data-td-split-menu]").forEach((t) => {
    t.hidden = !0;
  }), document.querySelectorAll("[data-td-split-open]").forEach((t) => {
    t.setAttribute("aria-expanded", "false");
  })), e.closest("td-fab") || (document.querySelectorAll("[data-td-fab-menu]").forEach((t) => {
    t.hidden = !0;
  }), document.querySelectorAll("[data-td-fab]").forEach((t) => {
    t.setAttribute("aria-expanded", "false");
  })), e.closest("td-select") || je(), e.closest("td-speed") || document.querySelectorAll("td-speed").forEach((t) => re(t, !1));
}
function Yr(e) {
  const a = e.closest("[data-td-inplace-view]")?.closest("td-inplace");
  a?.getAttribute("data-mode") === "auto" && Ta(a);
}
function ti(e) {
  const t = e.closest("[data-td-check-all]");
  if (t instanceof HTMLInputElement) {
    const _ = t.getAttribute("data-td-check-all"), L = document.querySelectorAll(`[data-td-check-group="${_}"]`), A = !L.length || [...L].some((G) => !G.checked);
    return L.forEach((G) => {
      G.checked = A;
    }), t.checked = A, t.indeterminate = !1, !0;
  }
  const a = e.closest("[data-td-select-open]");
  if (a instanceof HTMLElement && a.getAttribute("aria-disabled") !== "true" && !e.closest("[data-td-select-remove], [data-td-select-clear]")) {
    const L = a.closest("td-select")?.querySelector("[data-td-select-panel]");
    if (L) {
      const A = L.hidden;
      je(), L.hidden = !A, a.setAttribute("aria-expanded", String(A));
    }
    return !0;
  }
  const n = e.closest("[data-td-select-all]");
  if (n instanceof HTMLButtonElement) {
    const _ = n.closest("td-select");
    return _?.querySelectorAll("[data-td-select-pick]:not([disabled])").forEach((L) => {
      L.hidden || ca(_, L.dataset.tdSelectPick ?? "", !0);
    }), _ && Wt(_), !0;
  }
  const s = e.closest("[data-td-select-none]");
  if (s instanceof HTMLButtonElement) {
    const _ = s.closest("td-select");
    return _?.querySelectorAll("[data-td-select-value]").forEach((L) => L.remove()), _ && Wt(_), !0;
  }
  const o = e.closest("[data-td-select-group]");
  if (o instanceof HTMLButtonElement) {
    const _ = o.closest("td-select"), L = o.dataset.tdSelectGroup ?? "";
    return _?.querySelectorAll(`[data-td-select-pick][data-group="${CSS.escape(L)}"]:not([disabled])`).forEach((A) => {
      ca(_, A.dataset.tdSelectPick ?? "", !0);
    }), _ && Wt(_), !0;
  }
  const r = e.closest("[data-td-select-pick]");
  if (r instanceof HTMLButtonElement)
    return ni(r), !0;
  const i = e.closest("[data-td-select-remove]");
  if (i instanceof HTMLButtonElement) {
    const _ = i.closest("td-select");
    return _?.querySelectorAll("[data-td-select-value]").forEach((L) => {
      L.value === i.dataset.tdSelectRemove && L.remove();
    }), _ && Wt(_), !0;
  }
  const c = e.closest("[data-td-select-clear]");
  if (c instanceof HTMLButtonElement) {
    const _ = c.closest("td-select");
    return _?.querySelectorAll("[data-td-select-value]").forEach((L) => L.remove()), _?.dataset.nullable === "true" && Ve(_, ""), _ && Wt(_), !0;
  }
  const l = e.closest("[data-td-numeric-step]");
  if (l instanceof HTMLButtonElement) {
    const L = l.closest("td-numeric")?.querySelector("[data-td-numeric]");
    if (L) {
      const A = Number(l.dataset.tdNumericStep ?? 1), G = Number(L.min || 0), gt = Number(L.max || 9999), mt = Math.min(gt, Math.max(G, Number(L.value || 0) + A));
      L.value = String(mt), L.dispatchEvent(new Event("input", { bubbles: !0 }));
    }
    return !0;
  }
  const d = e.closest("[data-td-rating]");
  if (d instanceof HTMLButtonElement && d.closest('[data-readonly="true"]') == null) {
    const _ = d.closest("td-rating"), L = Number(d.dataset.tdRating ?? 0), A = _?.querySelector("[data-td-rating-value]");
    return A && (A.value = String(L)), _?.querySelectorAll("[data-td-rating]").forEach((G) => {
      const gt = Number(G.dataset.tdRating ?? 0);
      G.classList.toggle("is-on", gt <= L), G.setAttribute("aria-checked", gt === L ? "true" : "false");
    }), !0;
  }
  const u = e.closest("[data-td-selectbar]");
  if (u instanceof HTMLButtonElement) {
    const _ = u.closest(".td-selectbar");
    if (_?.getAttribute("data-multiple") === "true" ? (u.classList.toggle("is-on"), u.setAttribute("aria-pressed", u.classList.contains("is-on") ? "true" : "false")) : _?.querySelectorAll("[data-td-selectbar]").forEach((A) => {
      A.classList.toggle("is-on", A === u), A.setAttribute("aria-pressed", A === u ? "true" : "false");
    }), oi(_), u.closest(".td-toolbar")) {
      const A = document.querySelector("[data-td-toolbar-status]");
      A && (A.textContent = `Vista: ${u.textContent?.trim() ?? ""}`);
    }
    return !0;
  }
  const p = e.closest("[data-td-chip-toggle]");
  if (p instanceof HTMLButtonElement) {
    const _ = p.getAttribute("aria-pressed") !== "true";
    return p.classList.toggle("is-on", _), p.setAttribute("aria-pressed", _ ? "true" : "false"), !0;
  }
  const f = e.closest("[data-td-chip-reset]");
  if (f instanceof HTMLButtonElement) {
    const _ = f.parentElement?.querySelector("[data-td-chip-box]");
    return _?.dataset.tpl && (_.innerHTML = _.dataset.tpl), !0;
  }
  const m = e.closest("[data-td-toggle]");
  if (m instanceof HTMLButtonElement) {
    const _ = m.dataset.tdToggleGroup;
    if (_)
      document.querySelectorAll(`[data-td-toggle-group="${_}"]`).forEach((L) => {
        const A = L === m;
        L.classList.toggle("is-on", A), L.setAttribute("aria-pressed", A ? "true" : "false");
      });
    else {
      const L = m.getAttribute("aria-pressed") !== "true";
      m.classList.toggle("is-on", L), m.setAttribute("aria-pressed", L ? "true" : "false");
    }
    return !0;
  }
  const b = e.closest("[data-td-tab-close]");
  if (b instanceof HTMLElement) {
    const _ = b.closest("[data-td-tab]"), L = _?.closest("td-tabs"), A = [...L?.querySelectorAll("[data-td-tab]") ?? []];
    if (L && _ instanceof HTMLButtonElement && A.length > 1) {
      const G = A.indexOf(_), gt = L.querySelector(`[data-td-tab-panel="${_.dataset.tdTab}"]`), mt = A[G - 1] ?? A[G + 1];
      _.remove(), gt?.remove(), mt?.click();
    }
    return !0;
  }
  const h = e.closest("[data-td-tab-add]");
  if (h instanceof HTMLButtonElement) {
    const _ = h.closest("td-tabs"), L = _?.querySelector(".td-tabs__list"), A = _?.querySelector("[data-td-tab-panels]");
    if (L && A) {
      const G = L.querySelectorAll("[data-td-tab]").length + 1, gt = `pedido-${G}`, mt = document.createElement("button");
      mt.type = "button", mt.className = "td-tabs__tab", mt.role = "tab", mt.dataset.tdTab = gt, mt.innerHTML = `<span>Pedido ${G}</span><span class="td-tabs__x" data-td-tab-close aria-label="Cerrar Pedido ${G}">×</span>`, L.insertBefore(mt, h);
      const Pt = document.createElement("div");
      Pt.className = "td-tabs__pane", Pt.dataset.tdTabPanel = gt, Pt.hidden = !0, Pt.textContent = `Pedido ${G} sin líneas.`, A.append(Pt), mt.click();
    }
    return !0;
  }
  const g = e.closest("[data-td-tab]");
  if (g instanceof HTMLButtonElement) {
    const _ = g.closest("td-tabs");
    _?.querySelectorAll("[data-td-tab]").forEach((A) => {
      const G = A === g;
      A.classList.toggle("is-on", G), A.setAttribute("aria-selected", G ? "true" : "false"), A.tabIndex = G ? 0 : -1;
    });
    const L = g.dataset.tdTab;
    return _?.querySelectorAll("[data-td-tab-panel]").forEach((A) => {
      A.hidden = A.dataset.tdTabPanel !== L;
    }), !0;
  }
  const w = e.closest(".td-split__menu a, .td-split__menu button");
  if (w instanceof HTMLElement) {
    const _ = w.closest("td-split"), L = _?.querySelector("[data-td-split-menu]"), A = _?.querySelector("[data-td-split-status]"), G = _?.querySelector(".td-btn__text, .td-btn")?.textContent?.trim() ?? "Acción";
    return L && (L.hidden = !0), _?.querySelector("[data-td-split-open]")?.setAttribute("aria-expanded", "false"), A && (A.textContent = `${G} → ${w.textContent?.trim() ?? ""}`), w instanceof HTMLButtonElement;
  }
  const v = e.closest("[data-td-split-open]");
  if (v instanceof HTMLButtonElement) {
    const _ = v.closest("td-split")?.querySelector("[data-td-split-menu]");
    if (_) {
      const L = _.hidden;
      document.querySelectorAll("[data-td-split-menu]").forEach((A) => {
        A.hidden = !0;
      }), _.hidden = !L, v.setAttribute("aria-expanded", String(L));
    }
    return !0;
  }
  const E = e.closest("[data-td-speed]");
  if (E instanceof HTMLButtonElement)
    return re(E.closest("td-speed"), E.getAttribute("aria-expanded") !== "true"), !0;
  const x = e.closest("[data-td-speed-mask]");
  if (x instanceof HTMLElement)
    return re(x.closest("td-speed"), !1), !0;
  const y = e.closest(".td-fab__menu a, .td-fab__menu button");
  if (y instanceof HTMLElement) {
    const _ = y.closest("td-fab"), L = _?.querySelector("[data-td-fab-menu]");
    return L && (L.hidden = !0), _?.querySelector("[data-td-fab]")?.setAttribute("aria-expanded", "false"), y instanceof HTMLButtonElement;
  }
  const S = e.closest("[data-td-speed-item]");
  if (S instanceof HTMLElement) {
    const _ = S.closest("td-speed"), L = S.closest(".td-speed-host")?.querySelector("[data-td-speed-status]"), A = S.getAttribute("aria-label") || S.textContent || "", G = _?.querySelector("[data-td-speed]")?.getAttribute("aria-label") ?? "Acción";
    return L && (L.textContent = `${G} → ${A.trim()}`), re(_, !1), S.getAttribute("href") === "#";
  }
  const $ = e.closest("[data-td-fab]");
  if ($ instanceof HTMLButtonElement) {
    const _ = $.closest("td-fab")?.querySelector("[data-td-fab-menu]");
    return _ && (_.hidden = !_.hidden, $.setAttribute("aria-expanded", String(!_.hidden))), !0;
  }
  const k = e.closest("[data-td-message-close]");
  if (k instanceof HTMLButtonElement)
    return k.closest("[data-td-message]")?.remove(), !0;
  const N = e.closest("[data-td-dialog-open]");
  if (N instanceof HTMLElement) {
    const _ = N.getAttribute("data-td-dialog-open"), L = _ ? document.getElementById(_) : null;
    return L instanceof HTMLDialogElement && L.showModal(), !0;
  }
  const O = e.closest("[data-td-catalog-toggle]");
  if (O instanceof HTMLButtonElement) {
    const _ = O.getAttribute("aria-expanded") !== "true";
    O.setAttribute("aria-expanded", String(_));
    const L = O.parentElement?.querySelector(".td-catalog__leaves");
    return L && (L.hidden = !_), !0;
  }
  const X = e.closest("[data-td-catalog-clear]");
  if (X instanceof HTMLButtonElement) {
    const _ = X.closest("[data-td-catalog]")?.querySelector("[data-td-catalog-q]");
    return _ && (_.value = "", jn(_), _.focus()), !0;
  }
  const ct = e.closest("[data-td-inplace-ok]");
  if (ct instanceof HTMLButtonElement)
    return Ft(ct.closest("td-inplace"), !0), !0;
  const M = e.closest("[data-td-inplace-cancel]");
  if (M instanceof HTMLButtonElement)
    return Ft(M.closest("td-inplace"), !1), !0;
  const H = e.closest("[data-td-inplace-view]");
  if (H instanceof HTMLButtonElement && H.closest("td-inplace")?.getAttribute("data-mode") === "confirm")
    return Ta(H.closest("td-inplace")), !0;
  const P = e.closest("[data-td-list-pick]");
  if (P instanceof HTMLButtonElement && !P.disabled)
    return ri(P), !0;
  const lt = e.closest("[data-td-otp-clear]");
  if (lt instanceof HTMLButtonElement) {
    const _ = lt.closest("td-otp");
    return _?.querySelectorAll("[data-td-otp-cell]").forEach((L) => {
      L.value = "", L.classList.remove("is-ok", "is-bad");
    }), Dn(_), _?.querySelector("[data-td-otp-cell]")?.focus(), !0;
  }
  const Vt = e.closest("[data-td-inplace-open]");
  if (Vt instanceof HTMLButtonElement) {
    const L = Vt.closest("td-inplace")?.querySelector("[data-td-inplace-panel]");
    return L && (L.hidden = !1, Vt.hidden = !0, Vt.setAttribute("aria-expanded", "true")), !0;
  }
  const fe = e.closest("[data-td-inplace-close]");
  if (fe instanceof HTMLButtonElement) {
    const _ = fe.closest("td-inplace"), L = _?.querySelector("[data-td-inplace-panel]"), A = _?.querySelector("[data-td-inplace-open]");
    return L && A && (L.hidden = !0, A.hidden = !1, A.setAttribute("aria-expanded", "false"), A.focus()), !0;
  }
  const me = e.closest("[data-td-ac-pick]");
  if (me instanceof HTMLButtonElement)
    return Pn(me), !0;
  const Ut = e.closest("[data-td-chip-add]");
  if (Ut instanceof HTMLButtonElement)
    return Rn(Ut.closest("td-chiplist"), Ut.dataset.tdChipAdd ?? Ut.textContent ?? ""), !0;
  const he = e.closest("[data-td-chip-remove]");
  if (he instanceof HTMLButtonElement)
    return he.closest(".td-chip")?.remove(), !0;
  const be = e.closest("[data-td-toast-close]");
  if (be instanceof HTMLButtonElement)
    return be.closest("[data-td-toast]")?.remove(), !0;
  const ge = e.closest("[data-td-carousel-prev]");
  if (ge instanceof HTMLButtonElement)
    return da(ge.closest("[data-td-carousel]"), -1), !0;
  const $e = e.closest("[data-td-carousel-next]");
  if ($e instanceof HTMLButtonElement)
    return da($e.closest("[data-td-carousel]"), 1), !0;
  const C = e.closest("[data-td-carousel-dot]");
  if (C instanceof HTMLButtonElement)
    return In(C.closest("[data-td-carousel]"), Number(C.dataset.tdCarouselDot ?? 0)), !0;
  const I = e.closest("[data-td-carousel-play]");
  if (I instanceof HTMLButtonElement)
    return di(I.closest("[data-td-carousel]")), !0;
  const Y = e.closest("[data-td-busy-demo]");
  if (Y instanceof HTMLElement) {
    const _ = Y.closest("td-button");
    return _ && !_.hasAttribute("data-pending") && (_.setAttribute("data-pending", ""), window.setTimeout(() => _.removeAttribute("data-pending"), 1600)), !0;
  }
  const ft = e.closest("[data-td-copy]");
  if (ft instanceof HTMLButtonElement) {
    const _ = ft.closest(".td-code")?.querySelector("[data-td-copy-source]"), L = ft.querySelector("[data-td-copy-label]"), A = _?.textContent ?? "";
    return A && navigator.clipboard && navigator.clipboard.writeText(A).then(() => {
      L && (L.textContent = "Copiado", window.setTimeout(() => {
        L.textContent = "Copiar";
      }, 1600));
    }), !0;
  }
  return !e.closest("[data-td-select-panel]") && !e.closest("[data-td-select-open]") && je(), !1;
}
function ei(e) {
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
      e.value = ii(e.value, e.dataset.tdMask ?? "");
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
      Dn(t);
      return;
    }
    if (e.matches("[data-td-file]")) {
      const t = e.closest("td-file")?.querySelector("[data-td-file-name]");
      t && (t.textContent = e.files?.[0]?.name ?? "Ningún archivo elegido");
      return;
    }
    if (e.matches("[data-td-catalog-q]")) {
      jn(e);
      return;
    }
    e.matches("[data-td-ac]") && ci(e);
  }
}
function jn(e) {
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
function ai(e) {
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
    }), document.querySelectorAll("td-speed").forEach((n) => re(n, !1));
    const a = t instanceof Element ? t.closest("td-inplace") : null;
    a && Ft(a, !1);
  }
  if (t instanceof HTMLInputElement && t.matches("[data-td-otp-cell]")) {
    const a = [...t.closest("td-otp")?.querySelectorAll("[data-td-otp-cell]") ?? []], n = a.indexOf(t);
    e.key === "Backspace" && !t.value && a[n - 1] && a[n - 1].focus(), e.key === "ArrowLeft" && a[n - 1] && a[n - 1].focus(), e.key === "ArrowRight" && a[n + 1] && a[n + 1].focus();
    return;
  }
  if (t instanceof HTMLElement && t.closest("[data-td-inplace-input]") && t.closest("td-inplace")?.getAttribute("data-mode") === "confirm" && e.key === "Enter" && !(t instanceof HTMLTextAreaElement)) {
    e.preventDefault(), Ft(t.closest("td-inplace"), !0);
    return;
  }
  if (t instanceof HTMLElement && t.closest("td-inplace")?.getAttribute("data-mode") === "auto") {
    const a = t.closest("td-inplace"), n = t instanceof HTMLTextAreaElement;
    if (e.key === "Enter" && (!n || e.ctrlKey)) {
      e.preventDefault(), Ft(a, !0);
      return;
    }
    if (e.key === "Tab") {
      Ft(a, !0);
      const s = [...document.querySelectorAll("[data-td-inplace-view]")], o = a?.querySelector("[data-td-inplace-view]"), r = s[s.indexOf(o) + (e.shiftKey ? -1 : 1)];
      r && (e.preventDefault(), window.setTimeout(() => Ta(r.closest("td-inplace")), 0));
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
    e.preventDefault(), Rn(t.closest("td-chiplist"), t.value), t.value = "";
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
    e.key === "Enter" && n[s] && (e.preventDefault(), Pn(n[s]));
  }
}
function ni(e) {
  const t = e.closest("td-select");
  if (!t)
    return;
  const a = t.dataset.multiple === "true", n = e.dataset.tdSelectPick ?? "";
  a ? ca(t, n) : (t.querySelectorAll("[data-td-select-value]").forEach((s) => s.remove()), Ve(t, n), je()), Wt(t);
}
function ca(e, t, a = !1) {
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
  s > 0 && o >= s || Ve(e, t);
}
function Wt(e) {
  e.dataset.nullable === "true" && e.querySelector("[data-td-select-value]") === null && Ve(e, "");
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
  si(e);
}
function Ve(e, t) {
  const a = e.getAttribute("data-name") ?? e.querySelector("[data-td-select-value]")?.name ?? "valor", n = document.createElement("input");
  n.type = "hidden", n.name = a || "valor", n.value = t, n.dataset.tdSelectValue = "", e.insertBefore(n, e.querySelector("[data-td-select-open]"));
}
function si(e) {
  if (!e)
    return;
  const t = new Set([...e.querySelectorAll("[data-td-select-value]")].map((s) => s.value)), a = Number(e.getAttribute("data-max-selected") ?? "0"), n = a > 0 && t.size >= a;
  e.querySelectorAll("[data-td-select-pick]").forEach((s) => {
    const o = t.has(s.dataset.tdSelectPick ?? "");
    s.classList.toggle("is-on", o), s.setAttribute("aria-selected", o ? "true" : "false"), s.disabled = s.dataset.locked === "true" || n && !o;
  });
}
function oi(e) {
  if (!e)
    return;
  const t = e.getAttribute("data-name") ?? "barra";
  e.querySelectorAll("[data-td-selectbar-value]").forEach((a) => a.remove()), e.querySelectorAll("[data-td-selectbar].is-on").forEach((a) => {
    const n = document.createElement("input");
    n.type = "hidden", n.name = t, n.value = a.dataset.tdSelectbar ?? "", n.dataset.tdSelectbarValue = "", e.append(n);
  });
}
function ri(e) {
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
function Dn(e) {
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
function re(e, t) {
  if (!e)
    return;
  const a = e.querySelector("[data-td-speed-actions]"), n = e.querySelector("[data-td-speed-mask]"), s = e.querySelector("[data-td-speed]");
  a && (a.hidden = !t), n && (n.hidden = !t), s?.setAttribute("aria-expanded", t ? "true" : "false"), t || s instanceof HTMLElement && s.focus();
}
function Ta(e) {
  if (!e)
    return;
  const t = e.querySelector("[data-td-inplace-view]"), a = e.querySelector("[data-td-inplace-edit]"), n = e.querySelector("[data-td-inplace-input]"), s = e.querySelector("[data-td-inplace-text]")?.textContent ?? "";
  t && (t.hidden = !0), a && (a.hidden = !1), n && n.tagName !== "SELECT" && (n.value = s), n?.focus(), n instanceof HTMLInputElement && n.select();
}
function Ft(e, t) {
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
function je() {
  document.querySelectorAll("[data-td-select-panel]").forEach((e) => {
    e.hidden = !0;
  }), document.querySelectorAll("[data-td-select-open]").forEach((e) => {
    e.setAttribute("aria-expanded", "false");
  });
}
function ii(e, t) {
  const a = e.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  let n = 0, s = "";
  for (const o of t) {
    if (n >= a.length)
      break;
    o === "0" ? /\d/.test(a[n]) ? s += a[n++] : n += 1 : o === "X" || o === "A" ? /[A-Z]/.test(a[n]) ? s += a[n++] : n += 1 : s += o;
  }
  return s;
}
function ci(e) {
  const t = e.closest("td-autocomplete"), a = t?.querySelector("[data-td-ac-list]"), n = e.value.trim().toLowerCase();
  let s = 0;
  t?.querySelectorAll("[data-td-ac-pick]").forEach((o) => {
    const r = (o.dataset.label ?? o.textContent ?? "").toLowerCase(), i = n.length > 0 && r.includes(n);
    if (o.hidden = !i, o.parentElement && (o.parentElement.hidden = !i), o.classList.remove("is-active"), i) {
      s += 1;
      const c = o.dataset.label ?? o.textContent ?? "", l = c.toLowerCase().indexOf(n);
      o.innerHTML = `${Tt(c.slice(0, l))}<mark>${Tt(c.slice(l, l + n.length))}</mark>${Tt(c.slice(l + n.length))}`;
    }
  }), a && (a.hidden = s === 0), e.setAttribute("aria-expanded", s > 0 ? "true" : "false");
}
function Pn(e) {
  const t = e.closest("td-autocomplete"), a = t?.querySelector("[data-td-ac]"), n = t?.querySelector("[data-td-ac-list]");
  a && (a.value = e.dataset.label ?? e.textContent ?? "", a.setAttribute("aria-expanded", "false")), n && (n.hidden = !0);
}
function Rn(e, t) {
  const a = t.trim();
  if (!e || !a || [...e.querySelectorAll("[data-td-chip-value]")].some((r) => r.value === a))
    return;
  const s = e.getAttribute("data-name") ?? "tags", o = document.createElement("span");
  o.className = "td-chip td-chip--removable", o.innerHTML = `${Tt(a)}<button type="button" class="td-chip__remove" data-td-chip-remove="${Tt(a)}" aria-label="Quitar ${Tt(a)}">×</button><input type="hidden" name="${Tt(s)}" value="${Tt(a)}" data-td-chip-value />`, e.querySelector("[data-td-chip-input]")?.before(o);
}
function Tt(e) {
  return e.replace(/[&<>"']/g, (t) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[t] ?? t);
}
const la = /* @__PURE__ */ new WeakMap();
function li(e) {
  e.addEventListener("mouseenter", () => ln(e, !0)), e.addEventListener("mouseleave", () => ln(e, !1)), Ha(e);
}
function Ha(e) {
  Na(e);
  const t = Number(e.closest("td-carousel")?.getAttribute("data-interval") ?? 5e3), a = window.setInterval(() => da(e, 1), Number.isFinite(t) ? t : 5e3);
  la.set(e, a), e.dataset.paused = "false", e.querySelector("[data-td-carousel-play]")?.setAttribute("aria-label", "Pausar");
}
function Na(e) {
  const t = la.get(e);
  t && (window.clearInterval(t), la.delete(e));
}
function ln(e, t) {
  e.dataset.hold = t ? "true" : "false", t ? Na(e) : e.dataset.paused !== "true" && Ha(e);
}
function di(e) {
  if (!e)
    return;
  const t = e.dataset.paused === "true";
  e.dataset.paused = t ? "false" : "true", t ? Ha(e) : (Na(e), e.querySelector("[data-td-carousel-play]")?.setAttribute("aria-label", "Reproducir"));
}
function da(e, t) {
  if (!e)
    return;
  const a = e.querySelectorAll(".td-carousel__slide"), n = Number(e.dataset.index ?? 0);
  In(e, (n + t + a.length) % a.length);
}
function In(e, t) {
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
customElements.get("td-button") || customElements.define("td-button", Xe);
customElements.get("td-data-grid") || customElements.define("td-data-grid", De);
customElements.get("td-textbox") || customElements.define("td-textbox", Pe);
document.addEventListener("input", (e) => {
  const t = le(e.target, "td-textbox");
  t instanceof Pe && t.handleInput();
  const a = le(e.target, "td-data-grid");
  a instanceof De && a.handleInput(e.target), ei(e.target), As(e.target), Gn(e.target);
});
document.addEventListener("focusout", (e) => {
  const t = le(e.target, "td-textbox");
  t instanceof Pe && t.handleBlur();
});
document.addEventListener("submit", (e) => {
  if (Kn(e) || !(e.target instanceof HTMLFormElement))
    return;
  const t = e.target, n = (e instanceof SubmitEvent ? e.submitter : null)?.closest("td-button");
  if (n instanceof Xe && n.hasAttribute("data-pending")) {
    e.preventDefault(), e.stopPropagation();
    return;
  }
  const s = [...t.querySelectorAll("td-textbox")].filter(
    (i) => i instanceof Pe
  );
  let o = null;
  for (const i of s)
    !i.validate() && !o && (o = i);
  const r = t.querySelector("[data-td-form-status]");
  if (o) {
    if (e.preventDefault(), e.stopPropagation(), r instanceof HTMLElement) {
      const i = r.querySelector("[data-td-form-status-detail]"), c = r.getAttribute("data-status-detail") ?? "Fix the highlighted fields, then try again.";
      i && (i.textContent = c), r.hidden = !1;
    }
    o.focusInput();
    return;
  }
  r instanceof HTMLElement && (r.hidden = !0), n instanceof Xe && n.beginPending();
}, !0);
document.addEventListener("click", (e) => {
  const t = e.target;
  if (!(t instanceof Element) || (Xr(t), ti(t) || Ls(t) || Wn(t)))
    return;
  const a = t.closest("[data-td-secret-toggle]");
  if (a instanceof HTMLButtonElement) {
    ui(a);
    return;
  }
  const n = t.closest("[data-td-clear-secret]");
  if (n instanceof HTMLElement) {
    const c = n.closest("form")?.querySelector("[data-td-secret-field]");
    if (c instanceof HTMLInputElement) {
      c.value = "", c.type = "password", c.dispatchEvent(new Event("input", { bubbles: !0 }));
      const l = c.closest("td-textbox")?.querySelector("[data-td-secret-toggle]");
      l instanceof HTMLButtonElement && (l.textContent = l.dataset.show ?? "Show password", l.setAttribute("aria-pressed", "false")), c.focus();
    }
    return;
  }
  const s = le(t, "td-data-grid");
  s instanceof De && s.handleClick(t, e);
  const o = t.closest("[data-td-tree-toggle]");
  if (o instanceof HTMLButtonElement) {
    const c = o.closest('[role="treeitem"]'), l = c?.querySelector(':scope > [role="group"]'), d = o.getAttribute("aria-expanded") !== "true";
    o.setAttribute("aria-expanded", String(d)), c?.setAttribute("aria-expanded", String(d));
    const u = o.getAttribute("aria-label") ?? "";
    o.setAttribute("aria-label", d ? u.replace("Expandir", "Contraer") : u.replace("Contraer", "Expandir")), l instanceof HTMLElement && (l.hidden = !d);
  }
  const r = t.closest("[data-td-theme-pick]");
  if (r instanceof HTMLElement) {
    ja(r.getAttribute("data-td-theme-pick") || "modern");
    return;
  }
  if (t.closest("[data-td-theme-toggle]") instanceof HTMLElement) {
    const c = Ba() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", c);
    try {
      localStorage.setItem("td-theme", c);
    } catch {
    }
    Fn(), On();
  }
});
document.addEventListener("change", (e) => {
  const t = e.target;
  if (t instanceof HTMLSelectElement && t.matches("[data-td-theme-select]")) {
    ja(t.value);
    return;
  }
  if (t instanceof HTMLSelectElement && t.matches("[data-td-cascade]")) {
    t.form?.requestSubmit();
    return;
  }
  const a = le(t, "td-data-grid");
  a instanceof De && a.handleChange(t);
}, !0);
function ui(e) {
  const a = e.closest("td-textbox")?.querySelector("input");
  if (!(a instanceof HTMLInputElement))
    return;
  const n = a.type === "password";
  a.type = n ? "text" : "password", e.textContent = n ? e.dataset.hide ?? "Hide password" : e.dataset.show ?? "Show password", e.setAttribute("aria-pressed", n ? "true" : "false"), a.focus();
}
function Ba() {
  const e = document.documentElement.getAttribute("data-theme");
  return e === "dark" || e === "light" ? e : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function Fn() {
  const e = Ba() === "dark" ? "light" : "dark";
  document.querySelectorAll("[data-td-theme-toggle]").forEach((t) => {
    const a = t.querySelector(".td-btn__text") ?? t.querySelector(".td-btn__label"), n = t.getAttribute(e === "dark" ? "data-label-dark" : "data-label-light");
    a && n && (a.textContent = n);
  });
}
const pi = ["modern", "material", "expressive", "fluent"], fi = {
  modern: "Modern",
  material: "Material",
  expressive: "Material Expressive",
  fluent: "Fluent 3"
};
function ja(e) {
  const t = pi.includes(e) ? e : "modern";
  t === "modern" ? document.documentElement.removeAttribute("data-td-theme") : document.documentElement.setAttribute("data-td-theme", t);
  try {
    localStorage.setItem("td-theme-family", t);
  } catch {
  }
  document.querySelectorAll("[data-td-theme-select]").forEach((a) => {
    a.value = t;
  }), document.querySelectorAll(".td-theme-name").forEach((a) => {
    a.textContent = fi[t];
  }), On();
}
function On() {
  const e = document.documentElement.getAttribute("data-td-theme") ?? "modern", t = Ba();
  document.querySelectorAll("[data-td-theme-pick]").forEach((a) => {
    a.setAttribute("aria-pressed", String((a.getAttribute("data-td-theme-pick") || "modern") === e)), a.setAttribute("data-theme", t);
  });
}
function mi() {
  ja(document.documentElement.getAttribute("data-td-theme") ?? "modern");
}
function le(e, t) {
  return e instanceof Element ? e.closest(t) : null;
}
document.addEventListener("dblclick", (e) => {
  e.target instanceof Element && Yr(e.target);
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
    a.querySelector("[data-td-inplace-edit]")?.hasAttribute("hidden") || Ft(a, !0);
  }, 0);
});
document.addEventListener("keydown", (e) => {
  ai(e), qs(e), Jn(e);
});
document.addEventListener("mousedown", (e) => {
  const t = e.target;
  t instanceof Element && t.closest("[data-td-rte-cmd],[data-td-rte-color],[data-td-rte-source],[data-td-rte-link]") && e.preventDefault();
});
document.addEventListener("pointerdown", ha);
document.addEventListener("pointermove", ha);
document.addEventListener("pointerup", ha);
document.addEventListener("contextmenu", Cs);
function zn() {
  Zr(), Ms(), Un(), bo(), Kr(), oa(), Bn(), Fn(), mi();
}
zn();
Qn();
const hi = window.Blazor;
hi?.addEventListener?.("enhancedload", zn);
const bi = new MutationObserver((e) => {
  for (const t of e) {
    const a = t.target instanceof HTMLElement && t.target.matches("td-ecom") ? t.target : null;
    a && (t.type === "attributes" || a.childElementCount === 0) && oa(a.parentElement ?? document);
    for (const n of t.addedNodes) {
      if (!(n instanceof Element)) continue;
      const s = n.matches("td-studio") || n.querySelector("td-studio"), o = n.matches("td-ecom") || n.querySelector("td-ecom");
      s && Bn(n.matches("td-studio") ? n.parentElement ?? document : n), o && oa(n.matches("td-ecom") ? n.parentElement ?? document : n);
    }
  }
});
bi.observe(document.body, { childList: !0, subtree: !0, attributes: !0, attributeFilter: ["data-kind"] });
