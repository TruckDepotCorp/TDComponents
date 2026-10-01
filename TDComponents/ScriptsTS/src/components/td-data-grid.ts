const densityKey = 'td-grid-density';
const linesKey = 'td-grid-lines';

export class TDDataGridElement extends HTMLElement {
    private searchTimer = 0;
    private lastCheck: HTMLInputElement | null = null;
    private dragKey = '';

    connectedCallback(): void {
        this.bindChrome();
        this.restore();
        this.pinFrozen();
        this.syncActions();
        const status = this.querySelector('[data-td-status]');
        if (status instanceof HTMLElement && !status.dataset.base) {
            status.dataset.base = status.textContent ?? '';
        }
    }

    handleClick(target: Element, event?: Event): void {
        const density = target.closest('[data-td-density]');
        if (density instanceof HTMLButtonElement) {
            this.setDensity(density.dataset.tdDensity === 'compact' ? 'compact' : 'comfortable');
            return;
        }

        if (target.closest('[data-td-lines]')) {
            this.toggleLines();
            return;
        }

        if (target.closest('[data-td-columns]')) {
            this.togglePicker();
            return;
        }

        const columnToggle = target.closest('[data-td-column]');
        if (columnToggle instanceof HTMLButtonElement) {
            this.toggleColumn(columnToggle);
            return;
        }

        if (target.closest('[data-td-export]')) {
            this.exportCsv();
            return;
        }

        const filterOpen = target.closest('[data-td-filter-open]');
        if (filterOpen instanceof HTMLButtonElement) {
            this.openFilter(filterOpen);
            return;
        }

        if (target.closest('[data-td-filter-apply]')) {
            this.applyFilter();
            return;
        }

        if (target.closest('[data-td-filter-clear]')) {
            this.clearFilter();
            return;
        }

        const logic = target.closest('[data-td-logic]');
        if (logic instanceof HTMLButtonElement) {
            this.setLogic(logic.dataset.tdLogic === 'or' ? 'or' : 'and');
            return;
        }

        if (target.closest('[data-td-discard]')) {
            this.discard();
            return;
        }

        const selectAll = target.closest('[data-td-select-all]');
        if (selectAll instanceof HTMLInputElement) {
            this.querySelectorAll<HTMLInputElement>('[data-td-select]').forEach((box) => {
                box.checked = selectAll.checked;
                box.closest('tr')?.classList.toggle('is-selected', box.checked);
            });
            this.syncActions();
            return;
        }

        const checkValue = target.closest('[data-td-check-value]');
        if (checkValue instanceof HTMLButtonElement) {
            checkValue.setAttribute('aria-checked', String(checkValue.getAttribute('aria-checked') !== 'true'));
            return;
        }

        const menuAction = target.closest('[data-td-menu-action]');
        if (menuAction instanceof HTMLButtonElement) {
            const href = menuAction.dataset.href;
            if (menuAction.dataset.tdMenuAction === 'copy') {
                const value = menuAction.dataset.copy ?? '';
                void navigator.clipboard?.writeText(value);
                const status = this.querySelector('[data-td-status]');
                if (status instanceof HTMLElement) {
                    status.textContent = `Copiado · ${value}`;
                }
            } else if (href) {
                window.location.href = href;
            }
            this.closePopups();
            return;
        }

        const selectRow = target.closest('[data-td-select]');
        if (selectRow instanceof HTMLInputElement) {
            if (this.lastCheck && event instanceof MouseEvent && event.shiftKey) {
                const boxes = [...this.querySelectorAll<HTMLInputElement>('[data-td-select]')];
                const start = boxes.indexOf(this.lastCheck);
                const end = boxes.indexOf(selectRow);
                if (start >= 0 && end >= 0) {
                    const [from, to] = start < end ? [start, end] : [end, start];
                    for (let index = from; index <= to; index++) {
                        boxes[index].checked = selectRow.checked;
                        boxes[index].closest('tr')?.classList.toggle('is-selected', selectRow.checked);
                    }
                }
            } else {
                selectRow.closest('tr')?.classList.toggle('is-selected', selectRow.checked);
            }
            this.lastCheck = selectRow;
            this.syncSelection();
            this.syncActions();
            return;
        }

        if (!target.closest('[data-td-filter]') && !target.closest('[data-td-column-picker]') && !target.closest('[data-td-columns]') && !target.closest('[data-td-cell-menu]')) {
            this.closePopups();
        }
    }

    handleInput(target: EventTarget | null): void {
        if (!(target instanceof HTMLInputElement)) {
            return;
        }

        if (target.dataset.tdStock !== undefined) {
            this.onStock(target);
            return;
        }

        if (target.dataset.tdCheckSearch !== undefined) {
            const query = target.value.toLocaleLowerCase();
            this.querySelectorAll<HTMLButtonElement>('[data-td-check-value]').forEach((button) => {
                const label = (button.dataset.tdCheckValue ?? '').toLocaleLowerCase();
                button.hidden = query.length > 0 && !label.includes(query);
            });
            return;
        }

        if (target.type === 'search' && target.closest('[data-td-search-form]') || target.dataset.tdFilterValue !== undefined) {
            window.clearTimeout(this.searchTimer);
            this.searchTimer = window.setTimeout(() => target.form?.requestSubmit(), 280);
        }
    }

    handleChange(target: EventTarget | null): void {
        if (!(target instanceof HTMLSelectElement)) {
            return;
        }

        if (target.dataset.tdFilterOp !== undefined) {
            target.form?.requestSubmit();
            return;
        }

        if (target.closest('[data-td-filter]')) {
            this.syncValueVisibility();
        }
    }

    private restore(): void {
        const settings = this.dataset.settings ?? '';
        try {
            const density = localStorage.getItem(densityKey);
            if (density === 'compact' || density === 'comfortable') {
                this.setDensity(density);
            }

            if (localStorage.getItem(linesKey) === '1') {
                this.setLines(true);
            }

            const stored = localStorage.getItem(this.columnKey(settings));
            if (stored) {
                const parsed = JSON.parse(stored) as Record<string, boolean>;
                for (const [key, visible] of Object.entries(parsed)) {
                    this.setColumn(key, visible);
                }
            }

            const widths = localStorage.getItem(this.widthKey(settings));
            if (widths) {
                const parsed = JSON.parse(widths) as Record<string, number>;
                for (const [key, width] of Object.entries(parsed)) {
                    this.setWidth(key, width);
                }
            }

            const order = localStorage.getItem(this.orderKey(settings));
            if (order) {
                const keys = JSON.parse(order) as string[];
                keys.forEach((key, index) => {
                    const current = this.headerKeys();
                    const from = current.indexOf(key);
                    if (from > index) {
                        this.moveColumn(key, current[index] ?? key);
                    }
                });
            }
        } catch {
            // Preferences stay at the server render.
        }
    }

    private setDensity(density: 'compact' | 'comfortable'): void {
        this.dataset.density = density;
        this.querySelectorAll<HTMLButtonElement>('[data-td-density]').forEach((button) => {
            button.setAttribute('aria-pressed', String(button.dataset.tdDensity === density));
        });
        try {
            localStorage.setItem(densityKey, density);
        } catch {
            // The density still changes for this view.
        }
    }

    private toggleLines(): void {
        this.setLines(this.dataset.lines !== 'true');
    }

    private setLines(on: boolean): void {
        if (on) {
            this.dataset.lines = 'true';
        } else {
            delete this.dataset.lines;
        }

        const button = this.querySelector('[data-td-lines]');
        button?.setAttribute('aria-pressed', String(on));
        try {
            localStorage.setItem(linesKey, on ? '1' : '0');
        } catch {
            // The lines still change for this view.
        }
    }

    private togglePicker(): void {
        const picker = this.querySelector('[data-td-column-picker]');
        const button = this.querySelector('[data-td-columns]');
        if (!(picker instanceof HTMLElement) || !(button instanceof HTMLButtonElement)) {
            return;
        }

        const open = picker.hidden;
        this.closePopups();
        picker.hidden = !open;
        button.setAttribute('aria-expanded', String(open));
    }

    private toggleColumn(button: HTMLButtonElement): void {
        const key = button.dataset.tdColumn;
        if (!key || button.disabled) {
            return;
        }

        const visible = button.getAttribute('aria-checked') !== 'true';
        this.setColumn(key, visible);
        const stored: Record<string, boolean> = {};
        this.querySelectorAll<HTMLButtonElement>('[data-td-column]').forEach((item) => {
            if (item.dataset.tdColumn) {
                stored[item.dataset.tdColumn] = item.getAttribute('aria-checked') === 'true';
            }
        });
        try {
            localStorage.setItem(this.columnKey(this.dataset.settings ?? ''), JSON.stringify(stored));
        } catch {
            // The column still changes for this view.
        }
    }

    private setColumn(key: string, visible: boolean): void {
        this.querySelectorAll<HTMLElement>(`[data-col="${CSS.escape(key)}"]`).forEach((cell) => {
            cell.hidden = !visible;
        });
        const toggle = this.querySelector<HTMLButtonElement>(`[data-td-column="${CSS.escape(key)}"]`);
        toggle?.setAttribute('aria-checked', String(visible));
    }

    private openFilter(button: HTMLButtonElement): void {
        const popover = this.querySelector('[data-td-filter]');
        const card = this.querySelector('.td-grid__card');
        if (!(popover instanceof HTMLElement) || !(card instanceof HTMLElement)) {
            return;
        }

        const type = button.dataset.type === 'list' ? 'list' : button.dataset.type === 'text' ? 'text' : button.dataset.type === 'date' ? 'date' : 'num';
        const current = (button.dataset.current ?? '').split('|');
        this.dataset.filterCol = button.dataset.col ?? '';
        this.dataset.filterType = type;
        const title = this.querySelector('[data-td-filter-title]');
        if (title) {
            title.textContent = `Filtrar · ${button.dataset.title ?? ''}`;
        }

        const checklist = this.querySelector('[data-td-checklist]');
        const advanced = this.querySelector('[data-td-advanced]');
        if (type === 'list') {
            if (advanced instanceof HTMLElement) {
                advanced.hidden = true;
            }
            if (checklist instanceof HTMLElement) {
                checklist.hidden = false;
                this.fillChecklist(checklist, button);
            }
        } else {
            if (checklist instanceof HTMLElement) {
                checklist.hidden = true;
            }
            if (advanced instanceof HTMLElement) {
                advanced.hidden = false;
            }
        }

        this.showOperators(type === 'text' ? 'text' : 'num');
        this.setSelect('1', current[0] || (type === 'text' ? 'contains' : 'eq'));
        this.setSelect('2', current[3] || (type === 'text' ? 'contains' : 'eq'));
        this.setValue('1', current[1] || '');
        this.setValue('2', current[4] || '');
        this.setLogic(current[2] === 'or' ? 'or' : 'and');
        this.querySelectorAll('[data-td-value]').forEach((input) => {
            if (input instanceof HTMLInputElement) {
                input.type = type === 'date' ? 'date' : type === 'num' ? 'number' : 'text';
            }
        });
        this.syncValueVisibility();
        const buttonBox = button.getBoundingClientRect();
        const cardBox = card.getBoundingClientRect();
        this.closePopups();
        popover.hidden = false;
        this.placeFloating(popover, card, buttonBox.left - cardBox.left - 8, buttonBox.bottom - cardBox.top + 6, 290);
        button.setAttribute('aria-expanded', 'true');
    }

    private applyFilter(): void {
        const key = this.dataset.filterCol;
        if (!key) {
            return;
        }

        const filters = this.readFilters().filter((filter) => filter.key !== key);
        if (this.dataset.filterType === 'list') {
            const value1 = [...this.querySelectorAll<HTMLButtonElement>('[data-td-check-value][aria-checked="true"]')]
                .map((button) => button.dataset.tdCheckValue ?? '')
                .filter(Boolean)
                .join(',');
            if (value1) {
                filters.push({ key, op1: 'in', value1, logic: 'and', op2: '', value2: '' });
            }
        } else {
            const op1 = this.operatorValue('1');
            const op2 = this.operatorValue('2');
            const value1 = this.inputValue('1');
            const value2 = this.inputValue('2');
            const logic = this.querySelector<HTMLButtonElement>('[data-td-logic][aria-pressed="true"]')?.dataset.tdLogic ?? 'and';
            if (this.active(op1, value1) || this.active(op2, value2)) {
                filters.push({ key, op1, value1, logic, op2, value2 });
            }
        }

        this.writeFilters(filters);
    }

    private clearFilter(): void {
        const key = this.dataset.filterCol;
        this.writeFilters(this.readFilters().filter((filter) => filter.key !== key));
    }

    private writeFilters(filters: Filter[]): void {
        const field = this.querySelector('[data-td-filter-field]');
        if (field instanceof HTMLInputElement) {
            field.value = filters.map((filter) => [filter.key, filter.op1, filter.value1, filter.logic, filter.op2, filter.value2].map(encodeURIComponent).join('|')).join(';');
        }

        this.querySelector<HTMLFormElement>('[data-td-search-form]')?.requestSubmit();
    }

    private readFilters(): Filter[] {
        const field = this.querySelector('[data-td-filter-field]');
        const raw = field instanceof HTMLInputElement ? field.value : '';
        if (!raw) {
            return [];
        }

        return raw.split(';').filter(Boolean).map((part) => {
            const bits = part.split('|').map(decodeURIComponent);
            return {
                key: bits[0] ?? '',
                op1: bits[1] ?? '',
                value1: bits[2] ?? '',
                logic: bits[3] === 'or' ? 'or' : 'and',
                op2: bits[4] ?? '',
                value2: bits[5] ?? '',
            };
        });
    }

    private onStock(input: HTMLInputElement): void {
        const row = input.closest('tr');
        const dirty = input.value !== (input.dataset.original ?? '');
        row?.classList.toggle('is-dirty', dirty);
        const state = row?.querySelector('[data-td-stock-state]');
        if (state instanceof HTMLElement) {
            const value = Number(input.value);
            state.classList.remove('is-ok', 'is-low', 'is-out');
            if (value <= 0) {
                state.textContent = 'Agotado';
                state.classList.add('is-out');
            } else if (value <= 10) {
                state.textContent = 'Pocas unidades';
                state.classList.add('is-low');
            } else {
                state.textContent = 'En stock';
                state.classList.add('is-ok');
            }
        }

        this.syncActions();
    }

    private discard(): void {
        this.querySelectorAll<HTMLInputElement>('[data-td-stock]').forEach((input) => {
            input.value = input.dataset.original ?? '';
            this.onStock(input);
        });
    }

    private syncActions(): void {
        const dirty = this.querySelectorAll('tr.is-dirty').length;
        const selected = this.querySelectorAll('[data-td-select]:checked').length;
        this.querySelectorAll<HTMLButtonElement>('[data-td-discard], .td-grid__savebar .td-btn').forEach((button) => {
            button.disabled = dirty === 0;
        });
        const status = this.querySelector('[data-td-status]');
        if (!(status instanceof HTMLElement)) {
            return;
        }

        if (dirty > 0) {
            status.textContent = `${dirty} ${dirty === 1 ? 'fila modificada' : 'filas modificadas'} · sin guardar`;
            return;
        }

        if (selected > 0) {
            status.textContent = `${selected} ${selected === 1 ? 'repuesto seleccionado' : 'repuestos seleccionados'}`;
            return;
        }

        status.textContent = status.dataset.base ?? '';
    }

    private syncSelection(): void {
        const boxes = [...this.querySelectorAll<HTMLInputElement>('[data-td-select]')];
        const all = this.querySelector<HTMLInputElement>('[data-td-select-all]');
        if (!all) {
            return;
        }

        const checked = boxes.filter((box) => box.checked).length;
        all.checked = boxes.length > 0 && checked === boxes.length;
        all.indeterminate = checked > 0 && checked < boxes.length;
        all.closest('th')?.setAttribute('aria-checked', all.indeterminate ? 'mixed' : String(all.checked));
    }

    private exportCsv(): void {
        const script = this.querySelector('script[data-td-export-json], script[type="application/json"][data-td-export]');
        if (!script?.textContent) {
            return;
        }

        let data: { columns?: { key: string; label: string }[]; rows?: Record<string, string>[] };
        try {
            data = JSON.parse(script.textContent) as { columns?: { key: string; label: string }[]; rows?: Record<string, string>[] };
        } catch {
            return;
        }

        const columns = data.columns ?? [];
        const rows = data.rows ?? [];
        const escape = (value: string) => /[";\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
        const csv = `\uFEFF${[columns.map((column) => escape(column.label)).join(';'), ...rows.map((row) => columns.map((column) => escape(row[column.key] ?? '')).join(';'))].join('\n')}`;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        link.download = 'repuestos.csv';
        link.rel = 'noopener';
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        const status = this.querySelector('[data-td-status]');
        if (status instanceof HTMLElement) {
            status.textContent = `CSV exportado · ${rows.length} ${rows.length === 1 ? 'fila' : 'filas'} con filtros y orden actuales`;
        }
    }

    private closePopups(): void {
        const picker = this.querySelector('[data-td-column-picker]');
        if (picker instanceof HTMLElement) {
            picker.hidden = true;
        }

        this.querySelector('[data-td-columns]')?.setAttribute('aria-expanded', 'false');
        const popover = this.querySelector('[data-td-filter]');
        if (popover instanceof HTMLElement) {
            popover.hidden = true;
        }

        this.querySelectorAll('[data-td-filter-open]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
        const menu = this.querySelector('[data-td-cell-menu]');
        if (menu instanceof HTMLElement) {
            menu.hidden = true;
        }
    }

    private showOperators(kind: 'text' | 'num'): void {
        this.querySelectorAll<HTMLElement>('[data-td-op]').forEach((select) => {
            select.hidden = select.dataset.for !== kind;
        });
    }

    private setSelect(slot: string, value: string): void {
        this.querySelectorAll<HTMLSelectElement>(`[data-td-op="${slot}"]`).forEach((select) => {
            if ([...select.options].some((option) => option.value === value)) {
                select.value = value;
            }
        });
    }

    private setValue(slot: string, value: string): void {
        const input = this.querySelector(`[data-td-value="${slot}"]`);
        if (input instanceof HTMLInputElement) {
            input.value = value;
        }
    }

    private setLogic(logic: 'and' | 'or'): void {
        this.querySelectorAll<HTMLButtonElement>('[data-td-logic]').forEach((button) => {
            button.setAttribute('aria-pressed', String(button.dataset.tdLogic === logic));
        });
    }

    private syncValueVisibility(): void {
        (['1', '2'] as const).forEach((slot) => {
            const op = this.operatorValue(slot);
            const input = this.querySelector(`[data-td-value="${slot}"]`);
            if (input instanceof HTMLElement) {
                input.hidden = op === 'empty' || op === 'nempty';
            }
        });
    }

    private operatorValue(slot: string): string {
        const select = [...this.querySelectorAll<HTMLSelectElement>(`[data-td-op="${slot}"]`)].find((item) => !item.hidden);
        return select?.value ?? '';
    }

    private inputValue(slot: string): string {
        const input = this.querySelector(`[data-td-value="${slot}"]`);
        return input instanceof HTMLInputElement ? input.value : '';
    }

    private active(op: string, value: string): boolean {
        return op === 'empty' || op === 'nempty' || value.trim().length > 0;
    }

    private columnKey(settings: string): string {
        return `td-grid-cols:${settings || 'default'}`;
    }

    private widthKey(settings: string): string {
        return `td-grid-widths:${settings || 'default'}`;
    }

    private orderKey(settings: string): string {
        return `td-grid-order:${settings || 'default'}`;
    }

    private bindChrome(): void {
        if (this.dataset.chrome === '1') {
            return;
        }

        this.dataset.chrome = '1';
        this.addEventListener('pointerdown', (event) => {
            const handle = event.target instanceof Element ? event.target.closest('[data-td-resize]') : null;
            if (handle instanceof HTMLElement && event instanceof PointerEvent) {
                event.preventDefault();
                this.startResize(handle, event);
            }
        });
        this.addEventListener('contextmenu', (event) => {
            if (this.dataset.contextMenu !== 'true' || !(event.target instanceof Element)) {
                return;
            }

            const cell = event.target.closest('[data-td-cell]');
            if (!(cell instanceof HTMLElement)) {
                return;
            }

            event.preventDefault();
            this.openCellMenu(cell, event.clientX, event.clientY);
        });
        this.addEventListener('dragstart', (event) => {
            const header = event.target instanceof Element ? event.target.closest('th[data-col]') : null;
            if (!(header instanceof HTMLElement) || this.dataset.reorder !== 'true') {
                return;
            }

            this.dragKey = header.dataset.col ?? '';
        });
        this.addEventListener('dragover', (event) => {
            if (this.dataset.reorder === 'true') {
                event.preventDefault();
            }
        });
        this.addEventListener('drop', (event) => {
            const header = event.target instanceof Element ? event.target.closest('th[data-col]') : null;
            if (!(header instanceof HTMLElement) || !this.dragKey) {
                return;
            }

            event.preventDefault();
            this.moveColumn(this.dragKey, header.dataset.col ?? '');
            this.saveOrder();
            this.pinFrozen();
        });
        this.addEventListener('keydown', (event) => {
            if (!(event instanceof KeyboardEvent) || !event.altKey) {
                return;
            }

            const header = document.activeElement?.closest('th[data-col]');
            if (!(header instanceof HTMLElement) || !header.dataset.col) {
                return;
            }

            const keys = this.headerKeys();
            const index = keys.indexOf(header.dataset.col);
            const next = event.key === 'ArrowLeft' ? keys[index - 1] : event.key === 'ArrowRight' ? keys[index + 1] : '';
            if (!next) {
                return;
            }

            event.preventDefault();
            this.moveColumn(header.dataset.col, next);
            this.saveOrder();
            header.focus();
        });
    }

    private startResize(handle: HTMLElement, event: PointerEvent): void {
        const key = handle.dataset.col ?? '';
        const header = handle.closest('th');
        if (!key || !(header instanceof HTMLElement)) {
            return;
        }

        const startX = event.clientX;
        const startWidth = header.getBoundingClientRect().width;
        const move = (pointer: PointerEvent) => this.setWidth(key, Math.max(72, startWidth + pointer.clientX - startX));
        const stop = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', stop);
            this.saveWidths();
            this.pinFrozen();
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', stop);
    }

    private setWidth(key: string, width: number): void {
        const table = this.querySelector('table');
        if (table instanceof HTMLElement) {
            table.style.tableLayout = 'fixed';
        }

        const header = this.querySelector(`thead th[data-col="${CSS.escape(key)}"]`);
        if (header instanceof HTMLElement) {
            header.style.width = `${Math.round(width)}px`;
        }
    }

    private saveWidths(): void {
        const widths: Record<string, number> = {};
        this.querySelectorAll<HTMLElement>('thead th[data-col]').forEach((header) => {
            if (header.dataset.col && header.style.width) {
                widths[header.dataset.col] = Number.parseInt(header.style.width, 10);
            }
        });
        try {
            localStorage.setItem(this.widthKey(this.dataset.settings ?? ''), JSON.stringify(widths));
        } catch {
            // The width still changes for this view.
        }
    }

    private headerKeys(): string[] {
        return [...this.querySelectorAll<HTMLElement>('thead th[data-col]')].map((header) => header.dataset.col ?? '').filter(Boolean);
    }

    private moveColumn(from: string, to: string): void {
        if (!from || !to || from === to) {
            return;
        }

        this.querySelectorAll('tr').forEach((row) => {
            const cells = [...row.children] as HTMLElement[];
            const source = cells.find((cell) => cell.dataset.col === from);
            const target = cells.find((cell) => cell.dataset.col === to);
            if (source && target) {
                target.parentElement?.insertBefore(source, target);
            }
        });
    }

    private saveOrder(): void {
        try {
            localStorage.setItem(this.orderKey(this.dataset.settings ?? ''), JSON.stringify(this.headerKeys()));
        } catch {
            // The order still changes for this view.
        }
    }

    private pinFrozen(): void {
        const headers = [...this.querySelectorAll<HTMLElement>('thead th[data-col]')];
        let left = 0;
        headers.filter((header) => header.classList.contains('is-frozen-left')).forEach((header) => {
            header.style.left = `${left}px`;
            this.querySelectorAll<HTMLElement>(`td[data-col="${CSS.escape(header.dataset.col ?? '')}"]`).forEach((cell) => {
                cell.style.left = `${left}px`;
            });
            left += header.getBoundingClientRect().width;
        });

        let right = 0;
        [...headers].reverse().filter((header) => header.classList.contains('is-frozen-right')).forEach((header) => {
            header.style.right = `${right}px`;
            this.querySelectorAll<HTMLElement>(`td[data-col="${CSS.escape(header.dataset.col ?? '')}"]`).forEach((cell) => {
                cell.style.right = `${right}px`;
            });
            right += header.getBoundingClientRect().width;
        });
    }

    private fillChecklist(host: HTMLElement, button: HTMLButtonElement): void {
        host.replaceChildren();
        const search = document.createElement('input');
        search.dataset.tdCheckSearch = '';
        search.placeholder = 'Buscar valor…';
        search.setAttribute('aria-label', 'Buscar valor');
        host.append(search);
        let values: { v: string; n: number }[] = [];
        try {
            values = JSON.parse(button.dataset.values ?? '[]') as { v: string; n: number }[];
        } catch {
            values = [];
        }

        const current = (button.dataset.current ?? '').split('|');
        const selected = new Set((current[1] ?? '').split(',').filter(Boolean));
        values.forEach((item) => {
            const choice = document.createElement('button');
            choice.type = 'button';
            choice.dataset.tdCheckValue = item.v;
            choice.setAttribute('aria-checked', String(selected.has(item.v)));
            const label = document.createElement('span');
            label.textContent = item.v;
            const count = document.createElement('span');
            count.textContent = String(item.n);
            choice.append(label, count);
            host.append(choice);
        });
    }

    private openCellMenu(cell: HTMLElement, x: number, y: number): void {
        const menu = this.querySelector('[data-td-cell-menu]');
        const card = this.querySelector('.td-grid__card');
        if (!(menu instanceof HTMLElement) || !(card instanceof HTMLElement)) {
            return;
        }

        menu.replaceChildren();
        const heading = document.createElement('p');
        heading.className = 'td-grid__popover-title';
        heading.textContent = cell.dataset.title ?? 'Celda';
        const value = document.createElement('p');
        value.className = 'td-grid__menutext';
        value.textContent = cell.dataset.copy ?? '';
        menu.append(heading, value);
        this.menuItem(menu, 'Copiar valor', 'copy', cell.dataset.copy ?? '');
        this.menuItem(menu, 'Filtrar por este valor', 'go', '', cell.dataset.filterHref);
        this.menuItem(menu, 'Ordenar ascendente', 'go', '', cell.dataset.sortAsc);
        this.menuItem(menu, 'Ordenar descendente', 'go', '', cell.dataset.sortDesc);
        this.menuItem(menu, 'Abrir ficha', 'go', '', cell.dataset.ficha);
        this.closePopups();
        menu.hidden = false;
        const cardBox = card.getBoundingClientRect();
        this.placeFloating(menu, card, x - cardBox.left, y - cardBox.top, 250);
    }

    private placeFloating(element: HTMLElement, card: Element, preferredLeft: number, preferredTop: number, width: number): void {
        const cardBox = card.getBoundingClientRect();
        const maxWidth = Math.max(160, Math.min(width, cardBox.width - 16, window.innerWidth - 24));
        element.style.width = `${maxWidth}px`;
        const left = Math.max(8, Math.min(preferredLeft, cardBox.width - maxWidth - 8));
        element.style.left = `${left}px`;
        element.style.top = `${Math.max(8, preferredTop)}px`;
        const box = element.getBoundingClientRect();
        if (box.right > window.innerWidth - 8) {
            element.style.left = `${Math.max(8, left - (box.right - window.innerWidth + 8))}px`;
        }
        if (box.bottom > window.innerHeight - 8) {
            const flipped = preferredTop - box.height - 12;
            if (flipped > 8) {
                element.style.top = `${flipped}px`;
            }
        }
    }

    private menuItem(menu: HTMLElement, label: string, action: string, copy: string, href?: string): void {
        if (action === 'go' && !href) {
            return;
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.tdMenuAction = action;
        button.dataset.copy = copy;
        if (href) {
            button.dataset.href = href;
        }
        button.textContent = label;
        menu.append(button);
    }
}

interface Filter {
    key: string;
    op1: string;
    value1: string;
    logic: string;
    op2: string;
    value2: string;
}
