export function handleOpsClick(target: Element): boolean {
    const count = target.closest('button[data-td-count]');
    if (count instanceof HTMLButtonElement) {
        const host = count.closest('article[data-td-count]');
        if (host instanceof HTMLElement) {
            applyCount(host, Number(count.dataset.tdCount) || 0);
            return true;
        }
    }

    const replen = target.closest('button[data-td-replen]');
    if (replen instanceof HTMLButtonElement) {
        const host = replen.closest('article[data-td-replen]');
        if (host instanceof HTMLElement) {
            applyReplen(host, Number(replen.dataset.tdReplen) || 0);
            return true;
        }
    }

    return false;
}

function applyCount(host: HTMLElement, delta: number): void {
    const input = host.querySelector('[data-td-count-value]');
    const read = host.querySelector('[data-td-count-read]');
    const status = host.querySelector('[data-td-count-status]');
    if (!(input instanceof HTMLInputElement) || !(read instanceof HTMLElement)) {
        return;
    }

    const expected = Number(host.dataset.expected ?? '0');
    const unit = host.dataset.unit || 'unidades';
    const counted = Math.max(0, (Number(input.value) || 0) + delta);
    input.value = String(counted);
    read.textContent = String(counted);
    const diff = counted - expected;
    if (status instanceof HTMLElement) {
        status.classList.remove('is-ok', 'is-warn', 'is-bad', 'is-neutral');
        if (diff === 0) {
            status.classList.add('is-ok');
            status.textContent = 'El conteo coincide con el sistema.';
        } else if (diff < 0) {
            status.classList.add('is-bad');
            status.textContent = `Faltan ${-diff} ${unit}. Vuelve a contar o deja la incidencia.`;
        } else {
            status.classList.add('is-warn');
            status.textContent = `Sobran ${diff} ${unit}. Revisa antes de cerrar el conteo.`;
        }
    }

    host.querySelectorAll('button[data-td-count]').forEach((node) => {
        if (!(node instanceof HTMLButtonElement)) return;
        const step = Number(node.dataset.tdCount) || 0;
        if (step < 0) node.disabled = counted <= 0;
    });
}

function applyReplen(host: HTMLElement, delta: number): void {
    const input = host.querySelector('[data-td-replen-value]');
    const read = host.querySelector('[data-td-replen-read]');
    const status = host.querySelector('[data-td-replen-status]');
    if (!(input instanceof HTMLInputElement) || !(read instanceof HTMLElement)) {
        return;
    }

    const needed = Number(host.dataset.needed ?? '0');
    const unit = host.dataset.unit || 'unidades';
    const moved = Math.min(needed, Math.max(0, (Number(input.value) || 0) + delta));
    input.value = String(moved);
    read.textContent = String(moved);
    if (status instanceof HTMLElement) {
        const left = needed - moved;
        status.textContent = left === 0
            ? 'Reposición completa. Puedes confirmar el movimiento.'
            : `Faltan ${left} ${unit} por llevar a la ubicación de picking.`;
    }

    host.querySelectorAll('button[data-td-replen]').forEach((node) => {
        if (!(node instanceof HTMLButtonElement)) return;
        const step = Number(node.dataset.tdReplen) || 0;
        node.disabled = (step > 0 && moved >= needed) || (step < 0 && moved <= 0);
    });
}
