export function handleMobileClick(target: Element): boolean {
    const key = target.closest('[data-td-qty-key]');
    if (key instanceof HTMLButtonElement) {
        const host = key.closest('[data-td-qty]');
        if (host instanceof HTMLElement) {
            applyQty(host, key.dataset.tdQtyKey || '');
            return true;
        }
    }

    const close = target.closest('[data-td-sheet-close]');
    if (close instanceof HTMLButtonElement) {
        const sheet = close.closest('[data-td-sheet]');
        if (sheet instanceof HTMLElement) {
            sheet.hidden = true;
            return true;
        }
    }

    const pick = target.closest('[data-td-pick]');
    if (pick instanceof HTMLButtonElement) {
        const host = pick.closest('[data-td-pick-line]');
        if (host instanceof HTMLElement) {
            applyPick(host, Number(pick.dataset.tdPick) || 0);
            return true;
        }
    }

    return false;
}

function applyQty(host: HTMLElement, key: string): void {
    const input = host.querySelector('[data-td-qty-value]');
    const read = host.querySelector('[data-td-qty-read]');
    const hint = host.querySelector('[data-td-qty-hint]');
    if (!(input instanceof HTMLInputElement) || !(read instanceof HTMLElement)) {
        return;
    }

    const min = Number(host.dataset.min ?? '0');
    const max = Number(host.dataset.max ?? '9999');
    const unit = host.dataset.unit || 'unidades';
    let current = Number(input.value) || 0;
    if (key === 'back') {
        current = Math.floor(current / 10);
    } else if (key === 'minus') {
        current -= 1;
    } else if (key === 'plus') {
        current += 1;
    } else if (/^\d$/.test(key)) {
        const appended = current === 0 ? Number(key) : Number(`${current}${key}`);
        current = Number.isFinite(appended) ? appended : current;
    }

    if (current < min) current = min;
    if (current > max) current = max;
    input.value = String(current);
    read.textContent = String(current);
    if (hint instanceof HTMLElement) {
        hint.textContent = current >= max
            ? `Llegaste al máximo de esta ubicación: ${max} ${unit}.`
            : `Entre ${min} y ${max} ${unit}.`;
    }
}

function applyPick(host: HTMLElement, delta: number): void {
    const input = host.querySelector('[data-td-pick-value]');
    const read = host.querySelector('[data-td-pick-read]');
    const status = host.querySelector('[data-td-pick-status]');
    if (!(input instanceof HTMLInputElement) || !(read instanceof HTMLElement)) {
        return;
    }

    const total = Number(host.dataset.total ?? '0');
    const unit = host.dataset.unit || 'unidades';
    const picked = Math.min(total, Math.max(0, (Number(input.value) || 0) + delta));
    input.value = String(picked);
    read.textContent = String(picked);
    if (status instanceof HTMLElement) {
        const left = total - picked;
        status.textContent = left === 0
            ? 'Línea completa. Puedes confirmar el retiro.'
            : `Faltan ${left} ${unit}.`;
    }

    host.querySelectorAll<HTMLButtonElement>('[data-td-pick]').forEach((button) => {
        const step = Number(button.dataset.tdPick) || 0;
        button.disabled = (step > 0 && picked >= total) || (step < 0 && picked <= 0);
    });
}
