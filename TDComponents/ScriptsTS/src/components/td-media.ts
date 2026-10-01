import { encodeBarcode, encodeQr } from './td-codes';

export function bindMedia(root: ParentNode = document): void {
    root.querySelectorAll<HTMLElement>('[data-td-barcode]').forEach(renderBarcode);
    root.querySelectorAll<HTMLElement>('[data-td-qr]').forEach(renderQr);
    root.querySelectorAll<HTMLElement>('[data-td-rte]').forEach(syncRte);
}

export function handleMediaClick(target: Element): boolean {
    const rteCmd = target.closest('[data-td-rte-cmd]');
    if (rteCmd instanceof HTMLButtonElement) {
        const host = rteCmd.closest('[data-td-rte]');
        host?.querySelector<HTMLElement>('[data-td-rte-edit]')?.focus();
        document.execCommand(rteCmd.dataset.tdRteCmd ?? 'bold');
        syncRte(host);
        return true;
    }

    const rteColor = target.closest('[data-td-rte-color]');
    if (rteColor instanceof HTMLButtonElement) {
        document.execCommand('foreColor', false, rteColor.dataset.tdRteColor);
        syncRte(rteColor.closest('[data-td-rte]'));
        return true;
    }

    const rteSource = target.closest('[data-td-rte-source]');
    if (rteSource instanceof HTMLButtonElement) {
        toggleRteSource(rteSource.closest('[data-td-rte]'));
        return true;
    }

    const rteLink = target.closest('[data-td-rte-link]');
    if (rteLink instanceof HTMLElement) {
        const bar = rteLink.closest('[data-td-rte]')?.querySelector<HTMLElement>('[data-td-rte-linkbar]');
        if (bar) {
            bar.hidden = !bar.hidden;
            bar.querySelector('input')?.focus();
        }
        return true;
    }

    const linkApply = target.closest('[data-td-rte-link-apply]');
    if (linkApply instanceof HTMLElement) {
        const host = linkApply.closest('[data-td-rte]');
        const url = host?.querySelector<HTMLInputElement>('[data-td-rte-url]')?.value ?? '';
        if (url) {
            document.execCommand('createLink', false, url);
        }
        const bar = host?.querySelector<HTMLElement>('[data-td-rte-linkbar]');
        if (bar) {
            bar.hidden = true;
        }
        syncRte(host);
        return true;
    }

    const linkRemove = target.closest('[data-td-rte-link-remove]');
    if (linkRemove instanceof HTMLElement) {
        document.execCommand('unlink');
        const bar = linkRemove.closest('[data-td-rte]')?.querySelector<HTMLElement>('[data-td-rte-linkbar]');
        if (bar) {
            bar.hidden = true;
        }
        syncRte(linkRemove.closest('[data-td-rte]'));
        return true;
    }

    const linkCancel = target.closest('[data-td-rte-link-cancel]');
    if (linkCancel instanceof HTMLElement) {
        const bar = linkCancel.closest('[data-td-rte]')?.querySelector<HTMLElement>('[data-td-rte-linkbar]');
        if (bar) {
            bar.hidden = true;
        }
        return true;
    }

    const signClear = target.closest('[data-td-sign-clear]');
    if (signClear instanceof HTMLElement) {
        const host = signClear.closest('[data-td-sign]');
        const canvas = host?.querySelector('canvas');
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        const hidden = host?.querySelector<HTMLInputElement>('[data-td-sign-value]');
        if (hidden) {
            hidden.value = '';
        }
        return true;
    }

    const galPrev = target.closest('[data-td-gallery-prev]');
    if (galPrev instanceof HTMLElement) {
        stepGallery(galPrev.closest('[data-td-gallery]'), -1);
        return true;
    }

    const galNext = target.closest('[data-td-gallery-next]');
    if (galNext instanceof HTMLElement) {
        stepGallery(galNext.closest('[data-td-gallery]'), 1);
        return true;
    }

    const galThumb = target.closest('[data-td-gallery-thumb]');
    if (galThumb instanceof HTMLElement) {
        goGallery(galThumb.closest('[data-td-gallery]'), Number(galThumb.getAttribute('data-td-gallery-thumb') ?? 0));
        return true;
    }

    const menuOpen = target.closest('[data-td-menu-open]');
    if (menuOpen instanceof HTMLButtonElement) {
        const drop = menuOpen.parentElement?.querySelector<HTMLElement>('.td-menu__drop');
        const next = !!drop?.hidden;
        closeMenus();
        if (drop) {
            drop.hidden = !next;
            menuOpen.setAttribute('aria-expanded', String(next));
        }
        return true;
    }

    const profileOpen = target.closest('[data-td-profile-open]');
    if (profileOpen instanceof HTMLButtonElement) {
        const menu = profileOpen.parentElement?.querySelector<HTMLElement>('[data-td-profile-menu]');
        const next = !!menu?.hidden;
        closeMenus();
        if (menu) {
            menu.hidden = !next;
            profileOpen.setAttribute('aria-expanded', String(next));
        }
        return true;
    }

    const pmenu = target.closest('[data-td-pmenu-collapse]');
    if (pmenu instanceof HTMLElement) {
        pmenu.closest('[data-td-pmenu]')?.classList.toggle('is-collapsed');
        return true;
    }

    const ddtreeOpen = target.closest('[data-td-ddtree-open]');
    if (ddtreeOpen instanceof HTMLButtonElement) {
        const host = ddtreeOpen.closest('[data-td-ddtree]');
        const panel = host?.querySelector<HTMLElement>('[data-td-ddtree-panel]');
        if (panel) {
            const next = panel.hidden;
            closeMenus();
            panel.hidden = !next;
            ddtreeOpen.setAttribute('aria-expanded', String(next));
        }
        return true;
    }

    const ddtreeTwist = target.closest('[data-td-ddtree-twist]');
    if (ddtreeTwist instanceof HTMLButtonElement) {
        const kids = ddtreeTwist.closest('[data-td-ddtree-node]')?.querySelector<HTMLElement>('[data-td-ddtree-kids]');
        const open = ddtreeTwist.getAttribute('aria-expanded') !== 'true';
        ddtreeTwist.setAttribute('aria-expanded', String(open));
        ddtreeTwist.textContent = open ? '▾' : '▸';
        if (kids) {
            kids.hidden = !open;
        }
        return true;
    }

    const ddtreePick = target.closest('[data-td-ddtree-pick]');
    if (ddtreePick instanceof HTMLButtonElement) {
        applyTreePick(ddtreePick);
        return true;
    }

    const bcFmt = target.closest('[data-td-barcode-fmt]');
    if (bcFmt instanceof HTMLButtonElement) {
        const host = bcFmt.closest<HTMLElement>('[data-td-barcode]');
        if (host) {
            host.dataset.format = bcFmt.dataset.tdBarcodeFmt ?? 'code128';
            host.querySelectorAll('[data-td-barcode-fmt]').forEach((btn) => {
                btn.classList.toggle('is-on', btn === bcFmt);
                btn.setAttribute('aria-pressed', String(btn === bcFmt));
            });
            renderBarcode(host);
        }
        return true;
    }

    const bcPreset = target.closest('[data-td-barcode-preset]');
    if (bcPreset instanceof HTMLButtonElement) {
        const host = bcPreset.closest<HTMLElement>('[data-td-barcode]');
        const input = host?.querySelector<HTMLInputElement>('[data-td-barcode-text]');
        if (host && input) {
            input.value = bcPreset.dataset.tdBarcodePreset ?? '';
            renderBarcode(host);
        }
        return true;
    }

    const bcColor = target.closest('[data-td-barcode-color]');
    if (bcColor instanceof HTMLButtonElement) {
        const host = bcColor.closest<HTMLElement>('[data-td-barcode]');
        if (host) {
            host.dataset.color = bcColor.dataset.tdBarcodeColor ?? '#0A0B0C';
            host.querySelectorAll('[data-td-barcode-color]').forEach((btn) => btn.classList.toggle('is-on', btn === bcColor));
            renderBarcode(host);
        }
        return true;
    }

    const qrEcc = target.closest('[data-td-qr-ecc]');
    if (qrEcc instanceof HTMLButtonElement) {
        const host = qrEcc.closest<HTMLElement>('[data-td-qr]');
        if (host) {
            host.dataset.ecc = qrEcc.dataset.tdQrEcc ?? 'M';
            host.querySelectorAll('[data-td-qr-ecc]').forEach((btn) => btn.classList.toggle('is-on', btn === qrEcc));
            renderQr(host);
        }
        return true;
    }

    const qrPreset = target.closest('[data-td-qr-preset]');
    if (qrPreset instanceof HTMLButtonElement) {
        const host = qrPreset.closest<HTMLElement>('[data-td-qr]');
        const area = host?.querySelector<HTMLTextAreaElement>('[data-td-qr-text]');
        if (host && area) {
            area.value = qrPreset.dataset.tdQrPreset ?? '';
            renderQr(host);
        }
        return true;
    }

    const qrColor = target.closest('[data-td-qr-color]');
    if (qrColor instanceof HTMLButtonElement) {
        const host = qrColor.closest<HTMLElement>('[data-td-qr]');
        if (host) {
            host.dataset.color = qrColor.dataset.tdQrColor ?? '#0A0B0C';
            host.querySelectorAll('[data-td-qr-color]').forEach((btn) => btn.classList.toggle('is-on', btn === qrColor));
            renderQr(host);
        }
        return true;
    }

    const qrQuiet = target.closest('[data-td-qr-quiet]');
    if (qrQuiet instanceof HTMLButtonElement) {
        const host = qrQuiet.closest<HTMLElement>('[data-td-qr]');
        if (host) {
            const on = qrQuiet.getAttribute('aria-checked') !== 'true';
            qrQuiet.setAttribute('aria-checked', String(on));
            renderQr(host);
        }
        return true;
    }

    const codeAction = target.closest('[data-td-qr-copy],[data-td-qr-png],[data-td-qr-svg],[data-td-barcode-copy],[data-td-barcode-png],[data-td-barcode-svg]');
    if (codeAction instanceof HTMLButtonElement) {
        const host = codeAction.closest<HTMLElement>('[data-td-qr],[data-td-barcode]');
        if (host) {
            deliverCode(host, codeAction);
        }
        return true;
    }

    const imageOpen = target.closest('[data-td-image-open]');
    if (imageOpen instanceof HTMLElement) {
        imageOpen.closest('[data-td-image]')?.querySelector<HTMLDialogElement>('[data-td-image-dlg]')?.showModal();
        return true;
    }

    const imageZoom = target.closest('[data-td-image-zoom]');
    if (imageZoom instanceof HTMLButtonElement) {
        const canvas = imageZoom.closest('[data-td-image]')?.querySelector<HTMLElement>('[data-td-image-canvas]');
        if (canvas) {
            const next = Math.min(4, Math.max(0.6, Number(canvas.style.getPropertyValue('--z') || 1) + Number(imageZoom.dataset.tdImageZoom)));
            canvas.style.setProperty('--z', String(next));
        }
        return true;
    }

    const imageRot = target.closest('[data-td-image-rot]');
    if (imageRot instanceof HTMLElement) {
        const canvas = imageRot.closest('[data-td-image]')?.querySelector<HTMLElement>('[data-td-image-canvas]');
        if (canvas) {
            const current = Number((canvas.style.getPropertyValue('--r') || '0deg').replace('deg', '')) || 0;
            canvas.style.setProperty('--r', `${(current + 90) % 360}deg`);
        }
        return true;
    }

    const imageDl = target.closest('[data-td-image-dl]');
    if (imageDl instanceof HTMLElement) {
        const frame = imageDl.closest('[data-td-image]')?.querySelector<HTMLElement>('.td-image__frame');
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if (ctx && frame) {
            ctx.fillStyle = frame.style.background || '#1F2327';
            ctx.fillRect(0, 0, 640, 400);
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = 'imagen.png';
            a.click();
        }
        return true;
    }

    if (!target.closest('[data-td-menu]') && !target.closest('[data-td-profile]') && !target.closest('[data-td-ddtree]') && !target.closest('[data-td-ctx-menu]')) {
        closeMenus();
    }

    return false;
}

export function handleMediaInput(target: EventTarget | null): void {
    if (!(target instanceof HTMLElement)) {
        return;
    }

    if (target.matches('[data-td-rte-edit],[data-td-rte-src]')) {
        syncRte(target.closest('[data-td-rte]'));
        return;
    }

    if (target.matches('[data-td-rte-block]') && target instanceof HTMLSelectElement) {
        document.execCommand('formatBlock', false, target.value);
        syncRte(target.closest('[data-td-rte]'));
        return;
    }

    if (target.matches('[data-td-barcode-text],[data-td-barcode-w],[data-td-barcode-h],[data-td-barcode-label]')) {
        const host = target.closest<HTMLElement>('[data-td-barcode]');
        if (host) {
            renderBarcode(host);
        }
        return;
    }

    if (target.matches('[data-td-qr-text],[data-td-qr-size]')) {
        const host = target.closest<HTMLElement>('[data-td-qr]');
        if (host) {
            renderQr(host);
        }
        return;
    }

    if (target.matches('[data-td-ddtree-query]') && target instanceof HTMLInputElement) {
        filterTree(target.closest('[data-td-ddtree]'), target.value);
    }
}

export function handleMediaKey(event: KeyboardEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) {
        return;
    }

    const knob = target.closest('[data-td-compare-knob]');
    if (knob instanceof HTMLElement) {
        const host = knob.closest<HTMLElement>('[data-td-compare]');
        const vertical = host?.dataset.vertical === 'true';
        const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 2
            : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -2
                : event.key === 'Home' ? -100
                    : event.key === 'End' ? 100
                        : 0;
        if (step && host) {
            if ((vertical && (event.key === 'ArrowLeft' || event.key === 'ArrowRight'))
                || (!vertical && (event.key === 'ArrowUp' || event.key === 'ArrowDown'))) {
                return;
            }
            event.preventDefault();
            setCompare(host, Number.parseFloat(host.style.getPropertyValue('--pos') || '50') + step);
        }
    }
}

export function handleMediaPointer(event: PointerEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) {
        return;
    }

    const stage = target.closest('[data-td-compare-stage]');
    if (stage instanceof HTMLElement && event.type === 'pointerdown') {
        const host = stage.closest<HTMLElement>('[data-td-compare]');
        if (host) {
            host.dataset.drag = 'true';
            stage.setPointerCapture(event.pointerId);
            moveCompare(host, event);
        }
        return;
    }

    const dragging = document.querySelector<HTMLElement>('[data-td-compare][data-drag="true"]');
    if (dragging && (event.type === 'pointermove' || event.type === 'pointerup')) {
        moveCompare(dragging, event);
        if (event.type === 'pointerup') {
            delete dragging.dataset.drag;
        }
        return;
    }

    const follow = target.closest<HTMLElement>('[data-td-compare][data-follow="true"]');
    if (follow && event.type === 'pointermove') {
        moveCompare(follow, event);
        return;
    }

    const canvas = target.closest('[data-td-sign-canvas]');
    if (canvas instanceof HTMLCanvasElement) {
        const host = canvas.closest<HTMLElement>('[data-td-sign]');
        if (!host) {
            return;
        }
        if (event.type === 'pointerdown') {
            host.dataset.draw = 'true';
            canvas.setPointerCapture(event.pointerId);
            drawSign(canvas, event, true);
        } else if (host.dataset.draw === 'true' && event.type === 'pointermove') {
            drawSign(canvas, event, false);
        } else if (event.type === 'pointerup') {
            delete host.dataset.draw;
            const hidden = host.querySelector<HTMLInputElement>('[data-td-sign-value]');
            if (hidden) {
                hidden.value = canvas.toDataURL('image/png');
            }
        }
    }
}

export function handleContextMenu(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) {
        return;
    }

    const zone = target.closest('[data-td-ctx-target]');
    if (!(zone instanceof HTMLElement)) {
        return;
    }

    event.preventDefault();
    const host = zone.closest('[data-td-ctx]');
    const menu = host?.querySelector<HTMLElement>('[data-td-ctx-menu]');
    if (!menu) {
        return;
    }

    closeMenus();
    menu.hidden = false;
    const rect = zone.getBoundingClientRect();
    menu.style.left = `${event.clientX - rect.left}px`;
    menu.style.top = `${event.clientY - rect.top}px`;
}

function closeMenus(): void {
    document.querySelectorAll<HTMLElement>('.td-menu__drop, [data-td-profile-menu], [data-td-ddtree-panel], [data-td-ctx-menu]').forEach((node) => {
        node.hidden = true;
    });
    document.querySelectorAll('[data-td-menu-open], [data-td-profile-open], [data-td-ddtree-open]').forEach((btn) => {
        btn.setAttribute('aria-expanded', 'false');
    });
}

function syncRte(host: Element | null): void {
    if (!(host instanceof HTMLElement)) {
        return;
    }

    const edit = host.querySelector<HTMLElement>('[data-td-rte-edit]');
    const src = host.querySelector<HTMLTextAreaElement>('[data-td-rte-src]');
    const hidden = host.querySelector<HTMLInputElement>('[data-td-rte-value]');
    const limit = host.querySelector<HTMLElement>('[data-td-rte-limit]');
    if (!edit || !src || !hidden) {
        return;
    }

    if (!src.hidden) {
        edit.innerHTML = src.value;
    } else {
        src.value = edit.innerHTML;
    }

    hidden.value = edit.innerHTML;
    if (limit) {
        const max = Number(limit.dataset.max ?? 0);
        const length = edit.innerText.trim().length;
        limit.textContent = `${length} / ${max}`;
        limit.classList.toggle('is-over', max > 0 && length > max);
    }
}

function toggleRteSource(host: Element | null): void {
    if (!(host instanceof HTMLElement)) {
        return;
    }

    const edit = host.querySelector<HTMLElement>('[data-td-rte-edit]');
    const src = host.querySelector<HTMLTextAreaElement>('[data-td-rte-src]');
    if (!edit || !src) {
        return;
    }

    if (src.hidden) {
        src.value = edit.innerHTML;
        src.hidden = false;
        edit.hidden = true;
    } else {
        edit.innerHTML = src.value;
        src.hidden = true;
        edit.hidden = false;
    }
    syncRte(host);
}

function setCompare(host: HTMLElement, value: number): void {
    const pos = Math.min(100, Math.max(0, value));
    host.style.setProperty('--pos', `${pos}%`);
    const knob = host.querySelector('[data-td-compare-knob]');
    knob?.setAttribute('aria-valuenow', String(Math.round(pos)));
    const label = host.querySelector('[data-td-compare-pos]');
    if (label) {
        label.textContent = `${Math.round(pos)}%`;
    }
}

function moveCompare(host: HTMLElement, event: PointerEvent): void {
    const stage = host.querySelector('[data-td-compare-stage]');
    if (!(stage instanceof HTMLElement)) {
        return;
    }

    const rect = stage.getBoundingClientRect();
    const vertical = host.dataset.vertical === 'true';
    const ratio = vertical
        ? (event.clientY - rect.top) / rect.height
        : (event.clientX - rect.left) / rect.width;
    setCompare(host, ratio * 100);
}

function drawSign(canvas: HTMLCanvasElement, event: PointerEvent, start: boolean): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    ctx.strokeStyle = '#0A0B0C';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (start) {
        ctx.beginPath();
        ctx.moveTo(x, y);
    } else {
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
}

function stepGallery(host: Element | null, delta: number): void {
    if (!(host instanceof HTMLElement)) {
        return;
    }

    const slides = host.querySelectorAll('.td-gallery__slide');
    const current = Number(host.dataset.index ?? 0);
    goGallery(host, current + delta);
    void slides;
}

function goGallery(host: Element | null, index: number): void {
    if (!(host instanceof HTMLElement)) {
        return;
    }

    const slides = [...host.querySelectorAll<HTMLElement>('.td-gallery__slide')];
    if (!slides.length) {
        return;
    }

    const next = ((index % slides.length) + slides.length) % slides.length;
    host.dataset.index = String(next);
    slides.forEach((slide, i) => {
        slide.hidden = i !== next;
        slide.classList.toggle('is-current', i === next);
    });
    host.querySelectorAll('[data-td-gallery-thumb]').forEach((thumb, i) => {
        thumb.classList.toggle('is-current', i === next);
    });
    const count = host.querySelector('[data-td-gallery-count]');
    if (count) {
        count.textContent = `${next + 1} / ${slides.length}`;
    }
}

function applyTreePick(button: HTMLButtonElement): void {
    const host = button.closest('[data-td-ddtree]');
    if (!host) {
        return;
    }

    const multiple = host.getAttribute('data-multiple') === 'true';
    const value = button.dataset.tdDdtreePick ?? '';
    if (!multiple) {
        host.querySelectorAll('[data-td-ddtree-value]').forEach((node) => node.remove());
        addTreeHidden(host, value);
        const text = host.querySelector('.td-select__text');
        if (text) {
            text.textContent = button.dataset.label ?? value;
            text.classList.remove('is-placeholder');
        }
        closeMenus();
    } else {
        const existing = [...host.querySelectorAll<HTMLInputElement>('[data-td-ddtree-value]')].find((input) => input.value === value);
        if (existing) {
            existing.remove();
        } else {
            addTreeHidden(host, value);
        }
        const selected = host.querySelectorAll('[data-td-ddtree-value]').length;
        const text = host.querySelector('.td-select__text');
        if (text) {
            text.textContent = selected ? `${selected} seleccionadas` : 'Elegir categoría';
            text.classList.toggle('is-placeholder', selected === 0);
        }
    }

    const selected = new Set([...host.querySelectorAll<HTMLInputElement>('[data-td-ddtree-value]')].map((input) => input.value));
    host.querySelectorAll<HTMLButtonElement>('[data-td-ddtree-pick]').forEach((opt) => {
        opt.classList.toggle('is-on', selected.has(opt.dataset.tdDdtreePick ?? ''));
    });
}

function addTreeHidden(host: Element, value: string): void {
    const name = host.querySelector<HTMLInputElement>('[data-td-ddtree-value]')?.name ?? 'nodo';
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    input.dataset.tdDdtreeValue = '';
    host.insertBefore(input, host.querySelector('[data-td-ddtree-open]'));
}

function filterTree(host: Element | null, query: string): void {
    if (!host) {
        return;
    }

    const q = query.trim().toLowerCase();
    host.querySelectorAll<HTMLElement>('[data-td-ddtree-node]').forEach((node) => {
        const label = (node.dataset.label ?? '').toLowerCase();
        const match = !q || label.includes(q) || [...node.querySelectorAll('[data-td-ddtree-node]')].some((child) => (child.getAttribute('data-label') ?? '').toLowerCase().includes(q));
        node.hidden = !match;
        if (match && q) {
            const kids = node.querySelector<HTMLElement>(':scope > [data-td-ddtree-kids]');
            const twist = node.querySelector<HTMLButtonElement>(':scope > .td-ddtree__row [data-td-ddtree-twist]');
            if (kids) {
                kids.hidden = false;
            }
            twist?.setAttribute('aria-expanded', 'true');
        }
    });
}

const codeArt = new WeakMap<HTMLElement, { svg: string; png: string }>();

function renderBarcode(host: HTMLElement): void {
    const text = host.querySelector<HTMLInputElement>('[data-td-barcode-text]')?.value ?? host.dataset.value ?? '';
    const format = host.dataset.format ?? 'code128';
    const width = Number(host.querySelector<HTMLInputElement>('[data-td-barcode-w]')?.value ?? 2);
    const height = Number(host.querySelector<HTMLInputElement>('[data-td-barcode-h]')?.value ?? 80);
    const color = host.dataset.color ?? '#0A0B0C';
    const showText = host.querySelector<HTMLInputElement>('[data-td-barcode-label]')?.checked ?? true;
    const result = encodeBarcode(format, text, width, height, color, showText);
    const svg = host.querySelector('[data-td-barcode-svg]');
    const err = host.querySelector<HTMLElement>('[data-td-barcode-err]');
    if (svg) {
        svg.innerHTML = result.svg;
    }
    if (err) {
        err.hidden = !result.error;
        err.textContent = result.error ?? '';
    }
    setText(host, '[data-td-barcode-meta-fmt]', result.format);
    setText(host, '[data-td-barcode-meta-mod]', result.modules);
    setText(host, '[data-td-barcode-meta-val]', result.value);
    setText(host, '[data-td-barcode-wlabel]', `${width} px`);
    setText(host, '[data-td-barcode-hlabel]', `${height} px`);
    const hint = host.querySelector('[data-td-barcode-hint]');
    if (hint) {
        hint.textContent = result.hint;
    }
    publishArt(host, 'barcode', result.error ? '' : result.svg, 'barcode.png');
}

function renderQr(host: HTMLElement): void {
    const text = host.querySelector<HTMLTextAreaElement>('[data-td-qr-text]')?.value ?? host.dataset.value ?? '';
    const ecc = host.dataset.ecc ?? 'M';
    const module = Number(host.querySelector<HTMLInputElement>('[data-td-qr-size]')?.value ?? 6);
    const color = host.dataset.color ?? '#0A0B0C';
    const quiet = host.querySelector('[data-td-qr-quiet]')?.getAttribute('aria-checked') !== 'false' ? 4 : 0;
    const result = encodeQr(text, ecc, module, color, quiet);
    const svg = host.querySelector('[data-td-qr-svg]');
    const err = host.querySelector<HTMLElement>('[data-td-qr-err]');
    if (svg) {
        svg.innerHTML = result.svg;
    }
    if (err) {
        err.hidden = !result.error;
        err.textContent = result.error ?? '';
    }
    setText(host, '[data-td-qr-ver]', result.version);
    setText(host, '[data-td-qr-mod]', result.modules);
    setText(host, '[data-td-qr-bytes]', result.bytes);
    setText(host, '[data-td-qr-slabel]', `${module} px`);
    setText(host, '[data-td-qr-count]', `${[...text].length} caracteres`);
    publishArt(host, 'qr', result.error && !result.svg ? '' : result.svg, 'qr.png');
}

function publishArt(host: HTMLElement, kind: 'qr' | 'barcode', svg: string, file: string): void {
    if (!svg) {
        codeArt.delete(host);
        setText(host, `[data-td-${kind}-url]`, 'Sin imagen');
        setText(host, `[data-td-${kind}-urlmeta]`, 'Corrige el valor para generar el archivo.');
        const uses = host.querySelector(`[data-td-${kind}-uses]`);
        if (uses) {
            uses.innerHTML = '';
        }
        return;
    }
    void svgToPng(svg).then((png) => {
        if (!host.isConnected) {
            return;
        }
        codeArt.set(host, { svg, png });
        const hidden = host.querySelector<HTMLInputElement>(`[data-td-${kind}-hidden]`);
        if (hidden) {
            hidden.value = png;
        }
        setText(host, `[data-td-${kind}-url]`, png.length > 72 ? `${png.slice(0, 48)}…${png.slice(-16)}` : png);
        setText(host, `[data-td-${kind}-urlmeta]`, `${Math.max(1, Math.round((png.length * 3) / 4 / 1024))} KB · ${file}`);
        const uses = host.querySelector(`[data-td-${kind}-uses]`);
        if (uses) {
            const sizes = kind === 'qr' ? [96, 160, 240] : [72, 96, 128];
            uses.innerHTML = sizes.map((size) => `<img src="${png}" alt="" height="${size}">`).join('');
        }
    }).catch(() => setText(host, `[data-td-${kind}-msg]`, 'No se pudo preparar el PNG. El SVG sigue disponible.'));
}

function svgToPng(svg: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || 1;
            canvas.height = img.naturalHeight || 1;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                reject(new Error('canvas'));
                return;
            }
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('svg'));
        };
        img.src = url;
    });
}

function deliverCode(host: HTMLElement, button: HTMLButtonElement): void {
    const art = codeArt.get(host);
    const kind = host.hasAttribute('data-td-qr') ? 'qr' : 'barcode';
    if (!art) {
        setText(host, `[data-td-${kind}-msg]`, 'Todavía no hay una imagen para entregar.');
        return;
    }
    const action = button.dataset.tdQrCopy != null || button.hasAttribute('data-td-qr-copy')
        ? 'copy'
        : button.hasAttribute('data-td-qr-png') || button.hasAttribute('data-td-barcode-png')
            ? 'png'
            : button.hasAttribute('data-td-qr-svg') || button.hasAttribute('data-td-barcode-svg')
                ? 'svg'
                : button.hasAttribute('data-td-barcode-copy') ? 'copy' : '';
    const file = kind === 'qr' ? 'qr' : 'barcode';
    if (action === 'png') {
        downloadFile(art.png, `${file}.png`);
        setText(host, `[data-td-${kind}-msg]`, 'PNG descargado.');
        return;
    }
    if (action === 'svg') {
        downloadFile(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(art.svg)}`, `${file}.svg`);
        setText(host, `[data-td-${kind}-msg]`, 'SVG descargado.');
        return;
    }
    void navigator.clipboard?.writeText(art.png).then(
        () => setText(host, `[data-td-${kind}-msg]`, 'Data URL copiada. Puedes pegarla en un src de imagen.'),
        () => setText(host, `[data-td-${kind}-msg]`, 'No se pudo copiar. Descarga el PNG.'),
    );
}

function downloadFile(href: string, name: string): void {
    const link = document.createElement('a');
    link.href = href;
    link.download = name;
    link.click();
}

function setText(host: Element, selector: string, value: string): void {
    const node = host.querySelector(selector);
    if (node) {
        node.textContent = value;
    }
}
