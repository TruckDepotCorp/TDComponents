export function handleInboundClick(target: Element): boolean {
    const receipt = target.closest('button[data-td-receipt]');
    if (receipt instanceof HTMLButtonElement) {
        const host = receipt.closest('article[data-td-receipt]');
        if (host instanceof HTMLElement) {
            applyDelta(host, Number(receipt.dataset.tdReceipt) || 0, receiptSpec(host));
            return true;
        }
    }

    const asn = target.closest('button[data-td-asn]');
    if (asn instanceof HTMLButtonElement) {
        const host = asn.closest('article[data-td-asn]');
        if (host instanceof HTMLElement) {
            applyDelta(host, Number(asn.dataset.tdAsn) || 0, {
                expectedKey: 'expected',
                value: 'data-td-asn-value',
                read: 'data-td-asn-read',
                status: 'data-td-asn-status',
                button: 'button[data-td-asn]',
                step: 'tdAsn',
                unit: 'bultos',
                zero: 'El camión trae los bultos del aviso. Puedes abrir la descarga.',
                under: (left) => `Faltan ${left} bultos. No cierres la entrada hasta contar de nuevo.`,
                over: (extra) => `Hay ${extra} bultos de más. Sepáralos antes de recibir.`,
                cap: false,
            });
            return true;
        }
    }

    const open = target.closest('[data-td-receipt-open]');
    if (open instanceof HTMLElement) {
        const host = open.closest('article[data-td-receipt]');
        if (host instanceof HTMLElement) {
            openReceipt(host);
            return true;
        }
    }

    const apply = target.closest('[data-td-receipt-apply]');
    if (apply instanceof HTMLElement) {
        const host = apply.closest('article[data-td-receipt]');
        if (host instanceof HTMLElement) {
            applyTyped(host);
            return true;
        }
    }

    const close = target.closest('[data-td-receipt-close]');
    if (close instanceof HTMLElement) {
        close.closest('article[data-td-receipt]')?.querySelector('dialog')?.close();
        return true;
    }

    const mark = target.closest('button[data-td-inspect-mark]');
    if (mark instanceof HTMLButtonElement) {
        const row = mark.closest('[data-td-inspect-row]');
        const host = mark.closest('article[data-td-inspect]');
        if (row instanceof HTMLElement && host instanceof HTMLElement) {
            applyInspect(host, row, mark.dataset.tdInspectMark || 'Pendiente');
            return true;
        }
    }

    return false;
}

export function handleInboundKey(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.matches('[data-td-receipt-typed]')) return;
    const host = input.closest('article[data-td-receipt]');
    if (!(host instanceof HTMLElement)) return;
    event.preventDefault();
    applyTyped(host);
}

function receiptSpec(host: HTMLElement) {
    return {
        expectedKey: 'ordered',
        value: 'data-td-receipt-value',
        read: 'data-td-receipt-read',
        status: 'data-td-receipt-status',
        button: 'button[data-td-receipt]',
        step: 'tdReceipt',
        unit: host.dataset.unit || 'unidades',
        zero: 'La línea coincide con la orden.',
        under: (left: number, unit: string) => `Faltan ${left} ${unit} por recibir.`,
        over: (extra: number, unit: string) => `Sobran ${extra} ${unit}. Anótalo antes de cerrar la línea.`,
        cap: false,
    };
}

function openReceipt(host: HTMLElement): void {
    const dialog = host.querySelector('[data-td-receipt-dlg]');
    const typed = host.querySelector('[data-td-receipt-typed]');
    const current = host.querySelector('[data-td-receipt-value]');
    const error = host.querySelector('[data-td-receipt-error]');
    if (!(dialog instanceof HTMLDialogElement) || !(typed instanceof HTMLInputElement)) return;
    if (current instanceof HTMLInputElement) typed.value = current.value;
    if (error instanceof HTMLElement) error.hidden = true;
    if (!dialog.open) dialog.showModal();
    typed.focus();
    typed.select();
}

function applyTyped(host: HTMLElement): void {
    const typed = host.querySelector('[data-td-receipt-typed]');
    const error = host.querySelector('[data-td-receipt-error]');
    const dialog = host.querySelector('[data-td-receipt-dlg]');
    if (!(typed instanceof HTMLInputElement)) return;
    if (!/^\d+$/.test(typed.value.trim())) {
        if (error instanceof HTMLElement) error.hidden = false;
        typed.focus();
        return;
    }
    writeCount(host, Number(typed.value.trim()), receiptSpec(host));
    if (error instanceof HTMLElement) error.hidden = true;
    if (dialog instanceof HTMLDialogElement) dialog.close();
}

function applyDelta(host: HTMLElement, delta: number, spec: {
    expectedKey: string;
    value: string;
    read: string;
    status: string;
    button: string;
    step: string;
    unit: string;
    zero: string;
    under: (left: number, unit: string) => string;
    over: (extra: number, unit: string) => string;
    cap: boolean;
}): void {
    const input = host.querySelector(`[${spec.value}]`);
    const read = host.querySelector(`[${spec.read}]`);
    const status = host.querySelector(`[${spec.status}]`);
    if (!(input instanceof HTMLInputElement) || !(read instanceof HTMLElement)) {
        return;
    }

    const expected = Number(host.dataset[spec.expectedKey] ?? '0');
    const next = Math.max(0, (Number(input.value) || 0) + delta);
    const value = spec.cap ? Math.min(expected, next) : next;
    writeCount(host, value, spec);
}

function writeCount(host: HTMLElement, value: number, spec: {
    expectedKey: string;
    value: string;
    read: string;
    status: string;
    button: string;
    step: string;
    unit: string;
    zero: string;
    under: (left: number, unit: string) => string;
    over: (extra: number, unit: string) => string;
}): void {
    const input = host.querySelector(`[${spec.value}]`);
    const read = host.querySelector(`[${spec.read}]`);
    const status = host.querySelector(`[${spec.status}]`);
    if (!(input instanceof HTMLInputElement) || !(read instanceof HTMLElement)) return;
    const expected = Number(host.dataset[spec.expectedKey] ?? '0');
    input.value = String(value);
    read.textContent = String(value);
    const diff = value - expected;
    if (status instanceof HTMLElement) {
        status.classList.remove('is-ok', 'is-warn', 'is-bad', 'is-neutral');
        if (diff === 0) {
            status.classList.add('is-ok');
            status.textContent = spec.zero;
        } else if (diff < 0) {
            status.classList.add('is-warn');
            status.textContent = spec.under(-diff, spec.unit);
        } else {
            status.classList.add('is-warn');
            status.textContent = spec.over(diff, spec.unit);
        }
    }

    host.querySelectorAll(spec.button).forEach((node) => {
        if (!(node instanceof HTMLButtonElement)) return;
        const step = Number(node.dataset[spec.step]) || 0;
        if (step < 0) node.disabled = value <= 0;
    });
}

function applyInspect(host: HTMLElement, row: HTMLElement, result: string): void {
    const status = row.querySelector('[data-td-inspect-result]');
    const input = row.querySelector('[data-td-inspect-value]');
    if (status instanceof HTMLElement) {
        status.classList.remove('is-ok', 'is-warn', 'is-bad', 'is-neutral');
        status.classList.add(result === 'Cumple' ? 'is-ok' : result === 'No cumple' ? 'is-bad' : 'is-warn');
        status.textContent = result;
    }
    if (input instanceof HTMLInputElement) input.value = result;
    row.querySelectorAll('button[data-td-inspect-mark]').forEach((node) => {
        if (node instanceof HTMLButtonElement) {
            node.setAttribute('aria-pressed', node.dataset.tdInspectMark === result ? 'true' : 'false');
        }
    });

    const rows = [...host.querySelectorAll('[data-td-inspect-row]')];
    const results = rows.map((item) => item.querySelector('[data-td-inspect-result]')?.textContent?.trim() ?? 'Pendiente');
    const passed = results.filter((item) => item === 'Cumple').length;
    const pass = host.querySelector('[data-td-inspect-pass]');
    if (pass instanceof HTMLElement) pass.textContent = String(passed);
    const summary = host.querySelector('[data-td-inspect-summary]');
    if (summary instanceof HTMLElement) {
        summary.classList.remove('is-ok', 'is-warn', 'is-bad');
        if (results.some((item) => item === 'No cumple')) {
            summary.classList.add('is-bad');
            summary.textContent = 'Hay criterios que no cumplen. No aceptes el producto.';
        } else if (results.some((item) => item !== 'Cumple')) {
            summary.classList.add('is-warn');
            summary.textContent = 'Faltan criterios por revisar.';
        } else {
            summary.classList.add('is-ok');
            summary.textContent = 'La revisión está completa. Puedes decidir el ingreso.';
        }
    }
}
