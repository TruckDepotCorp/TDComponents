function money(value: number): string {
    return `Q ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function numberOf(value: string | null | undefined): number {
    const parsed = Number(String(value ?? '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
}

function toast(host: Element, text: string): void {
    const shell = host.closest('[data-td-mx-shell]') ?? document;
    const note = shell.querySelector('[data-td-mx-toast]');
    if (!(note instanceof HTMLElement)) {
        return;
    }
    note.hidden = false;
    note.textContent = text;
    window.setTimeout(() => {
        if (note.textContent === text) {
            note.hidden = true;
        }
    }, 2200);
}

function setOpen(shell: HTMLElement, open: boolean): void {
    shell.classList.toggle('is-menu', open);
    const nav = shell.querySelector('[data-td-mx-nav]');
    if (nav instanceof HTMLElement) {
        nav.setAttribute('aria-hidden', open ? 'false' : 'true');
    }
}

function paintCash(card: HTMLElement, open: boolean): void {
    card.dataset.open = open ? 'true' : 'false';
    card.classList.toggle('is-open', open);
    const title = card.querySelector('[data-td-mx-cashtitle]');
    const detail = card.querySelector('[data-td-mx-cashdetail]');
    const pill = card.querySelector('[data-td-mx-pilltext]');
    const button = card.querySelector('[data-td-mx-cashtoggle]');
    if (title) {
        title.textContent = open ? card.dataset.openTitle || 'Q 0.00' : card.dataset.closedTitle || 'Cerrada';
    }
    if (detail) {
        detail.textContent = open ? card.dataset.openDetail || '' : card.dataset.closedDetail || '';
    }
    if (pill) {
        pill.textContent = open ? 'Abierta' : 'Cerrada';
    }
    if (button) {
        button.textContent = open ? 'Cerrar caja' : 'Abrir caja';
    }
    const root = card.closest('[data-td-mx-shell]') ?? document;
    root.querySelectorAll<HTMLElement>('[data-td-mx-tile][data-needs-cash="true"]').forEach((tile) => {
        const sub = tile.querySelector('[data-td-mx-tilesub]');
        if (sub) {
            sub.textContent = open ? tile.dataset.ready || '' : tile.dataset.blocked || '';
        }
        tile.classList.toggle('is-blocked', !open);
    });
    root.querySelectorAll<HTMLElement>('[data-td-mx-cart]').forEach((cart) => {
        cart.dataset.cash = open ? 'true' : 'false';
        paintCart(cart);
    });
}

function activeChip(filter: HTMLElement): string {
    return filter.querySelector<HTMLElement>('[data-td-mx-chip].is-on')?.dataset.tdMxChip || '';
}

function paintFilter(filter: HTMLElement): void {
    const query = (filter.querySelector<HTMLInputElement>('[data-td-mx-q]')?.value || '').trim().toLowerCase();
    const tag = activeChip(filter);
    let visible = 0;
    filter.querySelectorAll<HTMLElement>('[data-td-mx-item]').forEach((item) => {
        const text = (item.dataset.text || item.textContent || '').toLowerCase();
        const tags = item.dataset.tags || '';
        const show = (!query || text.includes(query)) && (!tag || tags.split(/\s+/).includes(tag));
        item.hidden = !show;
        if (show) {
            visible += 1;
        }
    });
    const empty = filter.querySelector('[data-td-mx-empty]');
    if (empty instanceof HTMLElement) {
        empty.hidden = visible > 0;
    }
}

function paintCollect(box: HTMLElement): void {
    const debt = numberOf(box.dataset.debt);
    const amount = numberOf(box.querySelector<HTMLInputElement>('[data-td-mx-amount]')?.value);
    const error = box.querySelector('[data-td-mx-cerr]');
    const remain = box.querySelector('[data-td-mx-remain]');
    const button = box.querySelector<HTMLButtonElement>('[data-td-mx-charge]');
    const tooMuch = amount > debt;
    if (error instanceof HTMLElement) {
        error.hidden = !tooMuch;
        error.textContent = tooMuch ? `El monto supera la deuda (${money(debt)}).` : '';
    }
    if (remain) {
        const left = Math.max(0, debt - (tooMuch ? 0 : amount));
        remain.textContent = money(left);
        remain.classList.toggle('is-ok', amount > 0 && !tooMuch && left === 0);
    }
    if (button) {
        button.disabled = amount <= 0 || tooMuch;
    }
}

interface Line { name: string; sku: string; price: number; qty: number; stock: number }

function linesOf(cart: HTMLElement): Line[] {
    return [...cart.querySelectorAll<HTMLElement>('[data-td-mx-line]')].map((row) => ({
        name: row.dataset.name || '',
        sku: row.dataset.sku || '',
        price: numberOf(row.dataset.price),
        qty: numberOf(row.dataset.qty),
        stock: numberOf(row.dataset.stock),
    }));
}

function renderLines(cart: HTMLElement, lines: Line[]): void {
    const list = cart.querySelector('[data-td-mx-lines]');
    if (!list) {
        return;
    }
    list.replaceChildren();
    for (const line of lines) {
        const row = document.createElement('li');
        row.dataset.tdMxLine = '';
        row.dataset.name = line.name;
        row.dataset.sku = line.sku;
        row.dataset.price = String(line.price);
        row.dataset.qty = String(line.qty);
        row.dataset.stock = String(line.stock);
        const name = document.createElement('span');
        name.textContent = line.name;
        const qty = document.createElement('span');
        qty.className = 'td-mxqty';
        const minus = document.createElement('button');
        minus.type = 'button';
        minus.dataset.tdMxQty = '-1';
        minus.textContent = '−';
        minus.setAttribute('aria-label', `Quitar una unidad de ${line.name}`);
        const count = document.createElement('b');
        count.textContent = String(line.qty);
        const plus = document.createElement('button');
        plus.type = 'button';
        plus.dataset.tdMxQty = '1';
        plus.textContent = '+';
        plus.disabled = line.qty >= line.stock;
        plus.setAttribute('aria-label', `Agregar una unidad de ${line.name}`);
        qty.append(minus, count, plus);
        const total = document.createElement('b');
        total.textContent = money(line.price * line.qty);
        row.append(name, qty, total);
        list.append(row);
    }
    const empty = cart.querySelector('[data-td-mx-cartempty]');
    if (empty instanceof HTMLElement) {
        empty.hidden = lines.length > 0;
    }
}

function paintCart(cart: HTMLElement): void {
    const lines = linesOf(cart);
    const sub = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
    const discountRaw = numberOf(cart.querySelector<HTMLInputElement>('[data-td-mx-discount]')?.value);
    const percent = cart.querySelector<HTMLElement>('[data-td-mx-disctype].is-on')?.dataset.tdMxDisctype === 'pct';
    const discount = percent ? sub * Math.min(100, Math.max(0, discountRaw)) / 100 : Math.min(sub, Math.max(0, discountRaw));
    const total = Math.max(0, sub - discount);
    const method = cart.querySelector<HTMLElement>('[data-td-mx-pay].is-on')?.dataset.tdMxPay || 'Efectivo';
    const client = cart.querySelector<HTMLSelectElement>('[data-td-mx-client]')?.value || '';
    const received = numberOf(cart.querySelector<HTMLInputElement>('[data-td-mx-received]')?.value);
    const cashBox = cart.querySelector('[data-td-mx-cashbox]');
    if (cashBox instanceof HTMLElement) {
        cashBox.hidden = method !== 'Efectivo';
    }
    const change = method === 'Efectivo' ? Math.max(0, received - total) : 0;
    const count = cart.querySelector('[data-td-mx-count]');
    if (count) {
        count.textContent = String(lines.reduce((sum, line) => sum + line.qty, 0));
    }
    const totalNode = cart.querySelector('[data-td-mx-total]');
    if (totalNode) {
        totalNode.textContent = money(total);
    }
    const changeNode = cart.querySelector('[data-td-mx-change]');
    if (changeNode) {
        changeNode.textContent = money(change);
    }
    let reason = '';
    if (cart.dataset.cash !== 'true') {
        reason = 'Abre la caja para poder cobrar.';
    } else if (lines.length === 0) {
        reason = 'Agrega al menos un producto.';
    } else if (method === 'Crédito' && client === 'Venta de mostrador') {
        reason = 'El crédito necesita un cliente.';
    } else if (method === 'Efectivo' && received + 0.001 < total) {
        reason = 'El efectivo no cubre el total.';
    }
    const reasonNode = cart.querySelector('[data-td-mx-reason]');
    if (reasonNode) {
        reasonNode.textContent = reason;
    }
    const button = cart.querySelector<HTMLButtonElement>('[data-td-mx-checkout]');
    if (button) {
        button.disabled = reason.length > 0;
        button.textContent = total > 0 ? `Cobrar ${money(total)}` : 'Cobrar';
    }
}

function addProduct(cart: HTMLElement, product: Line): void {
    const lines = linesOf(cart);
    const found = lines.find((line) => line.sku === product.sku);
    if (found) {
        if (found.qty >= found.stock) {
            toast(cart, `${product.name} no tiene más existencia.`);
            return;
        }
        found.qty += 1;
    } else if (product.stock <= 0) {
        toast(cart, `${product.name} está agotado.`);
        return;
    } else {
        lines.push({ ...product, qty: 1 });
    }
    renderLines(cart, lines);
    paintCart(cart);
}

function paintStock(box: HTMLElement): void {
    const stock = numberOf(box.dataset.stock);
    const dir = box.querySelector<HTMLElement>('[data-td-mx-dir].is-on')?.dataset.tdMxDir || 'in';
    const qty = Math.max(0, Math.round(numberOf(box.querySelector<HTMLInputElement>('[data-td-mx-qty]')?.value)));
    const next = dir === 'out' ? stock - qty : stock + qty;
    const after = box.querySelector('[data-td-mx-after]');
    if (after) {
        after.textContent = String(Math.max(0, next));
    }
    const error = box.querySelector('[data-td-mx-stockerr]');
    if (error instanceof HTMLElement) {
        const invalid = dir === 'out' && qty > stock;
        error.hidden = !invalid;
        error.textContent = invalid ? 'La salida es mayor que el stock actual.' : '';
    }
}

function paintMargin(box: HTMLElement): void {
    const price = numberOf(box.querySelector<HTMLInputElement>('[data-td-mx-price]')?.value);
    const cost = numberOf(box.querySelector<HTMLInputElement>('[data-td-mx-cost]')?.value);
    const profit = price - cost;
    const margin = price > 0 ? (profit / price) * 100 : 0;
    const marginNode = box.querySelector('[data-td-mx-marginout]');
    const profitNode = box.querySelector('[data-td-mx-profit]');
    if (marginNode) {
        marginNode.textContent = `${Math.round(margin)}%`;
    }
    if (profitNode) {
        profitNode.textContent = money(profit);
    }
    box.classList.toggle('is-bad', cost >= price && price > 0);
    const warn = box.querySelector('[data-td-mx-costwarn]');
    if (warn instanceof HTMLElement) {
        warn.hidden = !(cost >= price && price > 0);
    }
}

function snapshot(form: HTMLElement): string {
    return [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select')]
        .filter((field) => !field.disabled)
        .map((field) => field.type === 'checkbox' ? String((field as HTMLInputElement).checked) : field.value)
        .join('|');
}

function paintSave(form: HTMLElement): void {
    const base = form.dataset.base ?? snapshot(form);
    if (!form.dataset.base) {
        form.dataset.base = base;
    }
    const name = form.querySelector<HTMLInputElement>('[data-td-mx-name]');
    const dirty = snapshot(form) !== form.dataset.base;
    const invalid = name ? name.value.trim().length === 0 : false;
    const label = form.querySelector('[data-td-mx-dirty]');
    if (label) {
        label.textContent = dirty ? 'Cambios sin guardar' : 'Sin cambios';
        label.classList.toggle('is-dirty', dirty);
    }
    const save = form.querySelector<HTMLButtonElement>('[data-td-mx-save]');
    if (save) {
        save.disabled = !dirty || invalid;
    }
}

function onClick(event: Event): void {
    const target = event.target;
    if (!(target instanceof Element)) {
        return;
    }
    const shell = target.closest('[data-td-mx-shell]');
    if (target.closest('[data-td-mx-open]') && shell instanceof HTMLElement) {
        setOpen(shell, true);
    }
    if (target.closest('[data-td-mx-close], [data-td-mx-ov]') && shell instanceof HTMLElement) {
        setOpen(shell, false);
    }
    const pick = target.closest('[data-td-mx-pick]');
    if (pick instanceof HTMLElement && shell instanceof HTMLElement) {
        shell.querySelectorAll('[data-td-mx-pick]').forEach((item) => item.classList.remove('is-on'));
        pick.classList.add('is-on');
        setOpen(shell, false);
        toast(shell, `Ir a ${pick.dataset.tdMxPick || 'la pantalla'}`);
    }
    const say = target.closest('[data-td-mx-say]');
    if (say instanceof HTMLElement) {
        toast(say, say.dataset.tdMxSay || 'Listo');
    }
    const cashButton = target.closest('[data-td-mx-cashtoggle]');
    const cash = cashButton?.closest('[data-td-mx-cash]');
    if (cash instanceof HTMLElement) {
        const open = cash.dataset.open !== 'true';
        paintCash(cash, open);
        toast(cash, open ? 'Caja abierta · fondo inicial Q 0.00' : 'Caja cerrada');
    }
    const chip = target.closest('[data-td-mx-chip]');
    const filter = chip?.closest('[data-td-mx-filter]');
    if (chip instanceof HTMLElement && filter instanceof HTMLElement) {
        filter.querySelectorAll('[data-td-mx-chip]').forEach((item) => item.classList.remove('is-on'));
        chip.classList.add('is-on');
        paintFilter(filter);
    }
    const quick = target.closest('[data-td-mx-quick]');
    const collect = quick?.closest('[data-td-mx-collect]');
    if (quick instanceof HTMLElement && collect instanceof HTMLElement) {
        const input = collect.querySelector<HTMLInputElement>('[data-td-mx-amount]');
        if (input) {
            input.value = quick.dataset.tdMxQuick || '';
        }
        paintCollect(collect);
    }
    const method = target.closest('[data-td-mx-method]');
    if (method instanceof HTMLElement) {
        method.parentElement?.querySelectorAll('[data-td-mx-method]').forEach((item) => item.classList.remove('is-on'));
        method.classList.add('is-on');
    }
    const charge = target.closest('[data-td-mx-charge]');
    const collectBox = charge?.closest('[data-td-mx-collect]');
    if (charge instanceof HTMLButtonElement && !charge.disabled && collectBox instanceof HTMLElement) {
        const amount = numberOf(collectBox.querySelector<HTMLInputElement>('[data-td-mx-amount]')?.value);
        const how = collectBox.querySelector<HTMLElement>('[data-td-mx-method].is-on')?.dataset.tdMxMethod || 'Efectivo';
        toast(collectBox, `Cobro registrado · ${money(amount)} · ${how}`);
    }
    const add = target.closest('[data-td-mx-add]');
    if (add instanceof HTMLElement && !add.hasAttribute('disabled')) {
        const cart = (add.closest('[data-td-mx-shell]') ?? document).querySelector('[data-td-mx-cart]');
        if (cart instanceof HTMLElement) {
            addProduct(cart, {
                name: add.dataset.name || 'Producto',
                sku: add.dataset.sku || add.dataset.name || 'sku',
                price: numberOf(add.dataset.price),
                qty: 1,
                stock: numberOf(add.dataset.stock),
            });
            toast(cart, `${add.dataset.name} en el carrito`);
        }
    }
    const qty = target.closest('[data-td-mx-qty]');
    const line = qty?.closest('[data-td-mx-line]');
    const cart = line?.closest('[data-td-mx-cart]');
    if (qty instanceof HTMLElement && line instanceof HTMLElement && cart instanceof HTMLElement) {
        const lines = linesOf(cart);
        const current = lines.find((item) => item.sku === line.dataset.sku);
        if (current) {
            current.qty += Number(qty.dataset.tdMxQty) || 0;
            renderLines(cart, lines.filter((item) => item.qty > 0));
            paintCart(cart);
        }
    }
    const disc = target.closest('[data-td-mx-disctype]');
    if (disc instanceof HTMLElement) {
        disc.parentElement?.querySelectorAll('[data-td-mx-disctype]').forEach((item) => item.classList.remove('is-on'));
        disc.classList.add('is-on');
        const owner = disc.closest('[data-td-mx-cart]');
        if (owner instanceof HTMLElement) {
            paintCart(owner);
        }
    }
    const pay = target.closest('[data-td-mx-pay]');
    if (pay instanceof HTMLElement) {
        pay.parentElement?.querySelectorAll('[data-td-mx-pay]').forEach((item) => item.classList.remove('is-on'));
        pay.classList.add('is-on');
        const owner = pay.closest('[data-td-mx-cart]');
        if (owner instanceof HTMLElement) {
            paintCart(owner);
        }
    }
    const checkout = target.closest('[data-td-mx-checkout]');
    const checkoutCart = checkout?.closest('[data-td-mx-cart]');
    if (checkout instanceof HTMLButtonElement && !checkout.disabled && checkoutCart instanceof HTMLElement) {
        const total = checkoutCart.querySelector('[data-td-mx-total]')?.textContent || '';
        renderLines(checkoutCart, []);
        const discount = checkoutCart.querySelector<HTMLInputElement>('[data-td-mx-discount]');
        const received = checkoutCart.querySelector<HTMLInputElement>('[data-td-mx-received]');
        if (discount) {
            discount.value = '0';
        }
        if (received) {
            received.value = '0';
        }
        paintCart(checkoutCart);
        toast(checkoutCart, `Venta registrada · ${total}`);
    }
    const dir = target.closest('[data-td-mx-dir]');
    if (dir instanceof HTMLElement) {
        dir.parentElement?.querySelectorAll('[data-td-mx-dir]').forEach((item) => item.classList.remove('is-on'));
        dir.classList.add('is-on');
        const box = dir.closest('[data-td-mx-stock]');
        if (box instanceof HTMLElement) {
            paintStock(box);
        }
    }
    const apply = target.closest('[data-td-mx-apply]');
    const stock = apply?.closest('[data-td-mx-stock]');
    if (apply instanceof HTMLElement && stock instanceof HTMLElement) {
        const qty = Math.max(0, Math.round(numberOf(stock.querySelector<HTMLInputElement>('[data-td-mx-qty]')?.value)));
        const reason = stock.querySelector<HTMLInputElement>('[data-td-mx-reason]')?.value.trim() || '';
        const outgoing = stock.querySelector<HTMLElement>('[data-td-mx-dir].is-on')?.dataset.tdMxDir === 'out';
        const current = numberOf(stock.dataset.stock);
        if (qty <= 0) {
            toast(stock, 'Escribe la cantidad del ajuste.');
            return;
        }
        if (!reason) {
            toast(stock, 'Escribe el motivo del ajuste.');
            return;
        }
        if (outgoing && qty > current) {
            paintStock(stock);
            return;
        }
        const next = outgoing ? current - qty : current + qty;
        stock.dataset.stock = String(next);
        const qtyInput = stock.querySelector<HTMLInputElement>('[data-td-mx-qty]');
        const reasonInput = stock.querySelector<HTMLInputElement>('[data-td-mx-reason]');
        if (qtyInput) {
            qtyInput.value = '';
        }
        if (reasonInput) {
            reasonInput.value = '';
        }
        const log = stock.querySelector('[data-td-mx-log]');
        if (log) {
            const item = document.createElement('li');
            item.className = outgoing ? 'is-out' : 'is-in';
            item.innerHTML = `<span><strong>${outgoing ? 'Salida' : 'Entrada'} · ${reason}</strong><small>Ahora</small></span><b>${outgoing ? '−' : '+'} ${qty}</b>`;
            log.prepend(item);
        }
        paintStock(stock);
        toast(stock, `Ajuste registrado. Stock actual: ${next}.`);
    }
    const reset = target.closest('[data-td-mx-reset]');
    const form = reset?.closest('[data-td-mx-form]');
    if (form instanceof HTMLElement && form.dataset.base) {
        const fields = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select')];
        const values = form.dataset.base.split('|');
        fields.forEach((field, index) => {
            if (field.type === 'checkbox' && field instanceof HTMLInputElement) {
                field.checked = values[index] === 'true';
            } else {
                field.value = values[index] ?? '';
            }
        });
        paintSave(form);
        const margin = form.querySelector('[data-td-mx-margin]');
        if (margin instanceof HTMLElement) {
            paintMargin(margin);
        }
    }
    const save = target.closest('[data-td-mx-save]');
    const saveForm = save?.closest('[data-td-mx-form]');
    if (save instanceof HTMLButtonElement && !save.disabled && saveForm instanceof HTMLElement) {
        saveForm.dataset.base = snapshot(saveForm);
        paintSave(saveForm);
        toast(saveForm, 'Cambios guardados');
    }
}

function boot(root: ParentNode): void {
    root.querySelectorAll<HTMLElement>('[data-td-mx-cash]').forEach((card) => paintCash(card, card.dataset.open === 'true'));
    root.querySelectorAll<HTMLElement>('[data-td-mx-filter]').forEach(paintFilter);
    root.querySelectorAll<HTMLElement>('[data-td-mx-collect]').forEach(paintCollect);
    root.querySelectorAll<HTMLElement>('[data-td-mx-cart]').forEach(paintCart);
    root.querySelectorAll<HTMLElement>('[data-td-mx-stock]').forEach(paintStock);
    root.querySelectorAll<HTMLElement>('[data-td-mx-margin]').forEach(paintMargin);
    root.querySelectorAll<HTMLElement>('[data-td-mx-form]').forEach((form) => {
        delete form.dataset.base;
        paintSave(form);
    });
}

let armed = false;

export function bindMisc(root: ParentNode = document): void {
    boot(root);
    if (armed) {
        return;
    }
    armed = true;
    document.addEventListener('click', onClick);
    document.addEventListener('input', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        const filter = target.closest('[data-td-mx-filter]');
        if (filter instanceof HTMLElement) {
            paintFilter(filter);
        }
        const collect = target.closest('[data-td-mx-collect]');
        if (collect instanceof HTMLElement) {
            paintCollect(collect);
        }
        const cart = target.closest('[data-td-mx-cart]');
        if (cart instanceof HTMLElement) {
            paintCart(cart);
        }
        const stock = target.closest('[data-td-mx-stock]');
        if (stock instanceof HTMLElement) {
            paintStock(stock);
        }
        const margin = target.closest('[data-td-mx-margin]');
        if (margin instanceof HTMLElement) {
            paintMargin(margin);
        }
        const form = target.closest('[data-td-mx-form]');
        if (form instanceof HTMLElement) {
            paintSave(form);
        }
    });
}
