export function bindUi(root: ParentNode = document): void {
    root.querySelectorAll<HTMLInputElement>('[data-td-checkbox][data-tri="true"]').forEach((input) => {
        input.indeterminate = input.dataset.state === 'mixed';
    });

    root.querySelectorAll<HTMLElement>('[data-td-carousel]').forEach((host) => {
        startCarousel(host);
    });

    root.querySelectorAll<HTMLElement>('[data-td-ccard]').forEach((host) => {
        startCardCarousel(host);
    });

    root.querySelectorAll<HTMLElement>('[data-td-toast]').forEach((toast) => {
        window.setTimeout(() => toast.remove(), 4000);
    });

    root.querySelectorAll<HTMLElement>('[data-td-chip-box]').forEach((box) => {
        if (!box.dataset.tpl) {
            box.dataset.tpl = box.innerHTML;
        }
    });
}

export function closeFloating(target: Element): void {
    if (!target.closest('td-split')) {
        document.querySelectorAll<HTMLElement>('[data-td-split-menu]').forEach((menu) => {
            menu.hidden = true;
        });
        document.querySelectorAll('[data-td-split-open]').forEach((button) => {
            button.setAttribute('aria-expanded', 'false');
        });
    }

    if (!target.closest('td-fab')) {
        document.querySelectorAll<HTMLElement>('[data-td-fab-menu]').forEach((menu) => {
            menu.hidden = true;
        });
        document.querySelectorAll('[data-td-fab]').forEach((button) => {
            button.setAttribute('aria-expanded', 'false');
        });
    }

    if (!target.closest('td-select')) {
        closeSelects();
    }

    if (!target.closest('td-speed')) {
        document.querySelectorAll('td-speed').forEach((host) => toggleSpeed(host, false));
    }
}

export function handleInplaceDblClick(target: Element): void {
    const view = target.closest('[data-td-inplace-view]');
    const host = view?.closest('td-inplace');
    if (host?.getAttribute('data-mode') === 'auto') {
        openInplace(host);
    }
}

export function handleUiClick(target: Element): boolean {
    const photo = target.closest('[data-td-photo-open]');
    if (photo instanceof HTMLButtonElement && !photo.disabled) {
        photo.closest('td-photo')?.querySelector<HTMLInputElement>('[data-td-photo-pick]')?.click();
        return true;
    }

    const photosOpen = target.closest('[data-td-photos-open]');
    if (photosOpen instanceof HTMLButtonElement && !photosOpen.disabled) {
        const host = photosOpen.closest('td-photos');
        if (host instanceof HTMLElement) {
            void openPhotoSet(host);
        }
        return true;
    }

    const photosShot = target.closest('[data-td-photos-shot]');
    if (photosShot instanceof HTMLButtonElement && !photosShot.disabled) {
        const host = photosShot.closest('td-photos');
        if (host instanceof HTMLElement) {
            void takePhotoSetShot(host);
        }
        return true;
    }

    const photosDone = target.closest('[data-td-photos-done]');
    if (photosDone instanceof HTMLButtonElement) {
        photosDone.closest('td-photos')?.querySelector<HTMLDialogElement>('[data-td-photos-cam]')?.close();
        return true;
    }

    const photosRemove = target.closest('[data-td-photos-remove]');
    if (photosRemove instanceof HTMLButtonElement) {
        const host = photosRemove.closest('td-photos');
        const id = Number(photosRemove.dataset.tdPhotosRemove);
        if (host instanceof HTMLElement && Number.isFinite(id)) {
            removePhotoSetShot(host, id);
        }
        return true;
    }

    const checkAll = target.closest('[data-td-check-all]');
    if (checkAll instanceof HTMLInputElement) {
        const name = checkAll.getAttribute('data-td-check-all');
        const group = document.querySelectorAll<HTMLInputElement>(`[data-td-check-group="${name}"]`);
        const next = !group.length || [...group].some((item) => !item.checked);
        group.forEach((item) => {
            item.checked = next;
        });
        checkAll.checked = next;
        checkAll.indeterminate = false;
        return true;
    }

    const openSelect = target.closest('[data-td-select-open]');
    if (openSelect instanceof HTMLElement && openSelect.getAttribute('aria-disabled') !== 'true' && !target.closest('[data-td-select-remove], [data-td-select-clear]')) {
        const host = openSelect.closest('td-select');
        const panel = host?.querySelector<HTMLElement>('[data-td-select-panel]');
        if (panel) {
            const next = panel.hidden;
            closeSelects();
            panel.hidden = !next;
            openSelect.setAttribute('aria-expanded', String(next));
        }
        return true;
    }

    const selectAll = target.closest('[data-td-select-all]');
    if (selectAll instanceof HTMLButtonElement) {
        const host = selectAll.closest('td-select');
        host?.querySelectorAll<HTMLButtonElement>('[data-td-select-pick]:not([disabled])').forEach((option) => {
            if (!option.hidden) {
                selectValue(host, option.dataset.tdSelectPick ?? '', true);
            }
        });
        if (host) {
            refreshSelectFace(host);
        }
        return true;
    }

    const selectNone = target.closest('[data-td-select-none]');
    if (selectNone instanceof HTMLButtonElement) {
        const host = selectNone.closest('td-select');
        host?.querySelectorAll('[data-td-select-value]').forEach((node) => node.remove());
        if (host) {
            refreshSelectFace(host);
        }
        return true;
    }

    const selectGroup = target.closest('[data-td-select-group]');
    if (selectGroup instanceof HTMLButtonElement) {
        const host = selectGroup.closest('td-select');
        const group = selectGroup.dataset.tdSelectGroup ?? '';
        host?.querySelectorAll<HTMLButtonElement>(`[data-td-select-pick][data-group="${CSS.escape(group)}"]:not([disabled])`).forEach((option) => {
            selectValue(host, option.dataset.tdSelectPick ?? '', true);
        });
        if (host) {
            refreshSelectFace(host);
        }
        return true;
    }

    const pick = target.closest('[data-td-select-pick]');
    if (pick instanceof HTMLButtonElement) {
        applySelectPick(pick);
        return true;
    }

    const remove = target.closest('[data-td-select-remove]');
    if (remove instanceof HTMLButtonElement) {
        const host = remove.closest('td-select');
        host?.querySelectorAll<HTMLInputElement>('[data-td-select-value]').forEach((input) => {
            if (input.value === remove.dataset.tdSelectRemove) {
                input.remove();
            }
        });
        if (host) {
            refreshSelectFace(host);
        }
        return true;
    }

    const clearSelect = target.closest('[data-td-select-clear]');
    if (clearSelect instanceof HTMLButtonElement) {
        const host = clearSelect.closest('td-select');
        host?.querySelectorAll('[data-td-select-value]').forEach((node) => node.remove());
        if (host?.dataset.nullable === 'true') {
            addHidden(host, '');
        }
        if (host) {
            refreshSelectFace(host);
        }
        return true;
    }

    const step = target.closest('[data-td-numeric-step]');
    if (step instanceof HTMLButtonElement) {
        const host = step.closest('td-numeric');
        const input = host?.querySelector<HTMLInputElement>('[data-td-numeric]');
        if (input) {
            const delta = Number(step.dataset.tdNumericStep ?? 1);
            const min = Number(input.min || 0);
            const max = Number(input.max || 9999);
            const next = Math.min(max, Math.max(min, Number(input.value || 0) + delta));
            input.value = String(next);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        return true;
    }

    const star = target.closest('[data-td-rating]');
    if (star instanceof HTMLButtonElement && star.closest('[data-readonly="true"]') == null) {
        const host = star.closest('td-rating');
        const value = Number(star.dataset.tdRating ?? 0);
        const hidden = host?.querySelector<HTMLInputElement>('[data-td-rating-value]');
        if (hidden) {
            hidden.value = String(value);
        }
        host?.querySelectorAll<HTMLButtonElement>('[data-td-rating]').forEach((button) => {
            const current = Number(button.dataset.tdRating ?? 0);
            button.classList.toggle('is-on', current <= value);
            button.setAttribute('aria-checked', current === value ? 'true' : 'false');
        });
        return true;
    }

    const bar = target.closest('[data-td-selectbar]');
    if (bar instanceof HTMLButtonElement) {
        const host = bar.closest('.td-selectbar');
        const multiple = host?.getAttribute('data-multiple') === 'true';
        if (!multiple) {
            host?.querySelectorAll<HTMLButtonElement>('[data-td-selectbar]').forEach((button) => {
                button.classList.toggle('is-on', button === bar);
                button.setAttribute('aria-pressed', button === bar ? 'true' : 'false');
            });
        } else {
            bar.classList.toggle('is-on');
            bar.setAttribute('aria-pressed', bar.classList.contains('is-on') ? 'true' : 'false');
        }
        syncSelectBar(host);
        if (bar.closest('.td-toolbar')) {
            const status = document.querySelector('[data-td-toolbar-status]');
            if (status) {
                status.textContent = `Vista: ${bar.textContent?.trim() ?? ''}`;
            }
        }
        return true;
    }

    const chipToggle = target.closest('[data-td-chip-toggle]');
    if (chipToggle instanceof HTMLButtonElement) {
        const on = chipToggle.getAttribute('aria-pressed') !== 'true';
        chipToggle.classList.toggle('is-on', on);
        chipToggle.setAttribute('aria-pressed', on ? 'true' : 'false');
        return true;
    }

    const chipReset = target.closest('[data-td-chip-reset]');
    if (chipReset instanceof HTMLButtonElement) {
        const box = chipReset.parentElement?.querySelector<HTMLElement>('[data-td-chip-box]');
        if (box?.dataset.tpl) {
            box.innerHTML = box.dataset.tpl;
        }
        return true;
    }

    const toggle = target.closest('[data-td-toggle]');
    if (toggle instanceof HTMLButtonElement) {
        const group = toggle.dataset.tdToggleGroup;
        if (group) {
            document.querySelectorAll<HTMLButtonElement>(`[data-td-toggle-group="${group}"]`).forEach((button) => {
                const on = button === toggle;
                button.classList.toggle('is-on', on);
                button.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
        } else {
            const on = toggle.getAttribute('aria-pressed') !== 'true';
            toggle.classList.toggle('is-on', on);
            toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
        }
        return true;
    }

    const tabClose = target.closest('[data-td-tab-close]');
    if (tabClose instanceof HTMLElement) {
        const tabButton = tabClose.closest('[data-td-tab]');
        const host = tabButton?.closest('td-tabs');
        const tabs = [...(host?.querySelectorAll<HTMLButtonElement>('[data-td-tab]') ?? [])];
        if (host && tabButton instanceof HTMLButtonElement && tabs.length > 1) {
            const index = tabs.indexOf(tabButton);
            const panel = host.querySelector(`[data-td-tab-panel="${tabButton.dataset.tdTab}"]`);
            const next = tabs[index - 1] ?? tabs[index + 1];
            tabButton.remove();
            panel?.remove();
            next?.click();
        }
        return true;
    }

    const tabAdd = target.closest('[data-td-tab-add]');
    if (tabAdd instanceof HTMLButtonElement) {
        const host = tabAdd.closest('td-tabs');
        const list = host?.querySelector('.td-tabs__list');
        const panels = host?.querySelector('[data-td-tab-panels]');
        if (list && panels) {
            const count = list.querySelectorAll('[data-td-tab]').length + 1;
            const id = `pedido-${count}`;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'td-tabs__tab';
            button.role = 'tab';
            button.dataset.tdTab = id;
            button.innerHTML = `<span>Pedido ${count}</span><span class="td-tabs__x" data-td-tab-close aria-label="Cerrar Pedido ${count}">×</span>`;
            list.insertBefore(button, tabAdd);
            const panel = document.createElement('div');
            panel.className = 'td-tabs__pane';
            panel.dataset.tdTabPanel = id;
            panel.hidden = true;
            panel.textContent = `Pedido ${count} sin líneas.`;
            panels.append(panel);
            button.click();
        }
        return true;
    }

    const tab = target.closest('[data-td-tab]');
    if (tab instanceof HTMLButtonElement) {
        const host = tab.closest('td-tabs');
        host?.querySelectorAll<HTMLButtonElement>('[data-td-tab]').forEach((button) => {
            const on = button === tab;
            button.classList.toggle('is-on', on);
            button.setAttribute('aria-selected', on ? 'true' : 'false');
            button.tabIndex = on ? 0 : -1;
        });
        const key = tab.dataset.tdTab;
        host?.querySelectorAll<HTMLElement>('[data-td-tab-panel]').forEach((panel) => {
            panel.hidden = panel.dataset.tdTabPanel !== key;
        });
        return true;
    }

    const splitItem = target.closest('.td-split__menu a, .td-split__menu button');
    if (splitItem instanceof HTMLElement) {
        const host = splitItem.closest('td-split');
        const menu = host?.querySelector<HTMLElement>('[data-td-split-menu]');
        const status = host?.querySelector('[data-td-split-status]');
        const label = host?.querySelector('.td-btn__text, .td-btn')?.textContent?.trim() ?? 'Acción';
        if (menu) {
            menu.hidden = true;
        }
        host?.querySelector('[data-td-split-open]')?.setAttribute('aria-expanded', 'false');
        if (status) {
            status.textContent = `${label} → ${splitItem.textContent?.trim() ?? ''}`;
        }
        return splitItem instanceof HTMLButtonElement;
    }

    const split = target.closest('[data-td-split-open]');
    if (split instanceof HTMLButtonElement) {
        const menu = split.closest('td-split')?.querySelector<HTMLElement>('[data-td-split-menu]');
        if (menu) {
            const next = menu.hidden;
            document.querySelectorAll<HTMLElement>('[data-td-split-menu]').forEach((open) => {
                open.hidden = true;
            });
            menu.hidden = !next;
            split.setAttribute('aria-expanded', String(next));
        }
        return true;
    }

    const speed = target.closest('[data-td-speed]');
    if (speed instanceof HTMLButtonElement) {
        toggleSpeed(speed.closest('td-speed'), speed.getAttribute('aria-expanded') !== 'true');
        return true;
    }

    const speedMask = target.closest('[data-td-speed-mask]');
    if (speedMask instanceof HTMLElement) {
        toggleSpeed(speedMask.closest('td-speed'), false);
        return true;
    }

    const fabItem = target.closest('.td-fab__menu a, .td-fab__menu button');
    if (fabItem instanceof HTMLElement) {
        const host = fabItem.closest('td-fab');
        const menu = host?.querySelector<HTMLElement>('[data-td-fab-menu]');
        if (menu) {
            menu.hidden = true;
        }
        host?.querySelector('[data-td-fab]')?.setAttribute('aria-expanded', 'false');
        return fabItem instanceof HTMLButtonElement;
    }

    const speedItem = target.closest('[data-td-speed-item]');
    if (speedItem instanceof HTMLElement) {
        const host = speedItem.closest('td-speed');
        const status = speedItem.closest('.td-speed-host')?.querySelector('[data-td-speed-status]');
        const name = speedItem.getAttribute('aria-label') || speedItem.textContent || '';
        const title = host?.querySelector('[data-td-speed]')?.getAttribute('aria-label') ?? 'Acción';
        if (status) {
            status.textContent = `${title} → ${name.trim()}`;
        }
        toggleSpeed(host, false);
        return speedItem.getAttribute('href') === '#';
    }

    const fab = target.closest('[data-td-fab]');
    if (fab instanceof HTMLButtonElement) {
        const menu = fab.closest('td-fab')?.querySelector<HTMLElement>('[data-td-fab-menu]');
        if (menu) {
            menu.hidden = !menu.hidden;
            fab.setAttribute('aria-expanded', String(!menu.hidden));
        }
        return true;
    }

    const messageClose = target.closest('[data-td-message-close]');
    if (messageClose instanceof HTMLButtonElement) {
        messageClose.closest('[data-td-message]')?.remove();
        return true;
    }

    const dialogOpen = target.closest('[data-td-dialog-open]');
    if (dialogOpen instanceof HTMLElement) {
        const id = dialogOpen.getAttribute('data-td-dialog-open');
        const dialog = id ? document.getElementById(id) : null;
        if (dialog instanceof HTMLDialogElement) {
            dialog.showModal();
        }
        return true;
    }

    const catalogToggle = target.closest('[data-td-catalog-toggle]');
    if (catalogToggle instanceof HTMLButtonElement) {
        const open = catalogToggle.getAttribute('aria-expanded') !== 'true';
        catalogToggle.setAttribute('aria-expanded', String(open));
        const leaves = catalogToggle.parentElement?.querySelector<HTMLElement>('.td-catalog__leaves');
        if (leaves) {
            leaves.hidden = !open;
        }
        return true;
    }

    const catalogClear = target.closest('[data-td-catalog-clear]');
    if (catalogClear instanceof HTMLButtonElement) {
        const input = catalogClear.closest('[data-td-catalog]')?.querySelector<HTMLInputElement>('[data-td-catalog-q]');
        if (input) {
            input.value = '';
            filterCatalog(input);
            input.focus();
        }
        return true;
    }

    const inplaceOk = target.closest('[data-td-inplace-ok]');
    if (inplaceOk instanceof HTMLButtonElement) {
        commitInplace(inplaceOk.closest('td-inplace'), true);
        return true;
    }

    const inplaceCancel = target.closest('[data-td-inplace-cancel]');
    if (inplaceCancel instanceof HTMLButtonElement) {
        commitInplace(inplaceCancel.closest('td-inplace'), false);
        return true;
    }

    const inplaceView = target.closest('[data-td-inplace-view]');
    if (inplaceView instanceof HTMLButtonElement && inplaceView.closest('td-inplace')?.getAttribute('data-mode') === 'confirm') {
        openInplace(inplaceView.closest('td-inplace'));
        return true;
    }

    const listPick = target.closest('[data-td-list-pick]');
    if (listPick instanceof HTMLButtonElement && !listPick.disabled) {
        pickList(listPick);
        return true;
    }

    const otpClear = target.closest('[data-td-otp-clear]');
    if (otpClear instanceof HTMLButtonElement) {
        const host = otpClear.closest('td-otp');
        host?.querySelectorAll<HTMLInputElement>('[data-td-otp-cell]').forEach((cell) => {
            cell.value = '';
            cell.classList.remove('is-ok', 'is-bad');
        });
        syncOtp(host);
        host?.querySelector<HTMLInputElement>('[data-td-otp-cell]')?.focus();
        return true;
    }

    const inplaceOpen = target.closest('[data-td-inplace-open]');
    if (inplaceOpen instanceof HTMLButtonElement) {
        const host = inplaceOpen.closest('td-inplace');
        const panel = host?.querySelector<HTMLElement>('[data-td-inplace-panel]');
        if (panel) {
            panel.hidden = false;
            inplaceOpen.hidden = true;
            inplaceOpen.setAttribute('aria-expanded', 'true');
        }
        return true;
    }

    const inplaceClose = target.closest('[data-td-inplace-close]');
    if (inplaceClose instanceof HTMLButtonElement) {
        const host = inplaceClose.closest('td-inplace');
        const panel = host?.querySelector<HTMLElement>('[data-td-inplace-panel]');
        const trigger = host?.querySelector<HTMLButtonElement>('[data-td-inplace-open]');
        if (panel && trigger) {
            panel.hidden = true;
            trigger.hidden = false;
            trigger.setAttribute('aria-expanded', 'false');
            trigger.focus();
        }
        return true;
    }

    const acPick = target.closest('[data-td-ac-pick]');
    if (acPick instanceof HTMLButtonElement) {
        applyAutoComplete(acPick);
        return true;
    }

    const chipAdd = target.closest('[data-td-chip-add]');
    if (chipAdd instanceof HTMLButtonElement) {
        addChip(chipAdd.closest('td-chiplist'), chipAdd.dataset.tdChipAdd ?? chipAdd.textContent ?? '');
        return true;
    }

    const chipRemove = target.closest('[data-td-chip-remove]');
    if (chipRemove instanceof HTMLButtonElement) {
        chipRemove.closest('.td-chip')?.remove();
        return true;
    }

    const toastClose = target.closest('[data-td-toast-close]');
    if (toastClose instanceof HTMLButtonElement) {
        toastClose.closest('[data-td-toast]')?.remove();
        return true;
    }

    const carPrev = target.closest('[data-td-carousel-prev]');
    if (carPrev instanceof HTMLButtonElement) {
        stepCarousel(carPrev.closest('[data-td-carousel]'), -1);
        return true;
    }

    const carNext = target.closest('[data-td-carousel-next]');
    if (carNext instanceof HTMLButtonElement) {
        stepCarousel(carNext.closest('[data-td-carousel]'), 1);
        return true;
    }

    const carDot = target.closest('[data-td-carousel-dot]');
    if (carDot instanceof HTMLButtonElement) {
        goCarousel(carDot.closest('[data-td-carousel]'), Number(carDot.dataset.tdCarouselDot ?? 0));
        return true;
    }

    const carPlay = target.closest('[data-td-carousel-play]');
    if (carPlay instanceof HTMLButtonElement) {
        toggleCarouselPlay(carPlay.closest('[data-td-carousel]'));
        return true;
    }

    const cardPrev = target.closest('[data-td-ccard-prev]');
    if (cardPrev instanceof HTMLButtonElement) {
        stepCardCarousel(cardPrev.closest('[data-td-ccard]'), -1);
        return true;
    }

    const cardNext = target.closest('[data-td-ccard-next]');
    if (cardNext instanceof HTMLButtonElement) {
        stepCardCarousel(cardNext.closest('[data-td-ccard]'), 1);
        return true;
    }

    const cardDot = target.closest('[data-td-ccard-dot]');
    if (cardDot instanceof HTMLButtonElement) {
        goCardCarousel(cardDot.closest('[data-td-ccard]'), Number(cardDot.dataset.tdCcardDot ?? 0));
        return true;
    }

    const cardPlay = target.closest('[data-td-ccard-play]');
    if (cardPlay instanceof HTMLButtonElement) {
        toggleCardCarousel(cardPlay.closest('[data-td-ccard]'));
        return true;
    }

    const busyDemo = target.closest('[data-td-busy-demo]');
    if (busyDemo instanceof HTMLElement) {
        const host = busyDemo.closest('td-button');
        if (host && !host.hasAttribute('data-pending')) {
            host.setAttribute('data-pending', '');
            window.setTimeout(() => host.removeAttribute('data-pending'), 1600);
        }
        return true;
    }

    const copy = target.closest('[data-td-copy]');
    if (copy instanceof HTMLButtonElement) {
        const source = copy.closest('.td-code')?.querySelector('[data-td-copy-source]');
        const label = copy.querySelector('[data-td-copy-label]');
        const text = source?.textContent ?? '';
        if (text && navigator.clipboard) {
            void navigator.clipboard.writeText(text).then(() => {
                if (label) {
                    label.textContent = 'Copiado';
                    window.setTimeout(() => {
                        label.textContent = 'Copiar';
                    }, 1600);
                }
            });
        }
        return true;
    }

    if (!target.closest('[data-td-select-panel]') && !target.closest('[data-td-select-open]')) {
        closeSelects();
    }

    return false;
}

export function handleUiInput(target: EventTarget | null): void {
    if (!(target instanceof HTMLInputElement)) {
        return;
    }

    if (target.matches('[data-td-select-query]')) {
        const query = target.value.trim().toLowerCase();
        const host = target.closest('td-select');
        let visible = 0;
        host?.querySelectorAll<HTMLElement>('[data-td-select-pick]').forEach((option) => {
            const label = (option.dataset.label ?? option.textContent ?? '').toLowerCase();
            const match = query.length === 0 || label.includes(query);
            option.hidden = !match;
            if (match) {
                visible += 1;
            }
        });
        const empty = host?.querySelector<HTMLElement>('[data-td-select-empty]');
        if (empty) {
            empty.hidden = visible > 0;
        }
        return;
    }

    if (target.matches('[data-td-list-filter]')) {
        const query = target.value.trim().toLowerCase();
        const host = target.closest('td-listbox');
        let visible = 0;
        host?.querySelectorAll<HTMLElement>('[data-td-list-pick]').forEach((option) => {
            const label = (option.dataset.label ?? '').toLowerCase();
            const match = query.length === 0 || label.includes(query);
            option.hidden = !match;
            if (match) {
                visible += 1;
            }
        });
        const empty = host?.querySelector<HTMLElement>('[data-td-list-empty]');
        if (empty) {
            empty.hidden = visible > 0;
        }
        return;
    }

    if (target.matches('[data-td-slider]')) {
        const out = target.closest('td-slider')?.querySelector('[data-td-slider-out]');
        if (out) {
            out.textContent = target.value;
        }
        return;
    }

    if (target.matches('[data-td-mask]')) {
        target.value = applyMask(target.value, target.dataset.tdMask ?? '');
        return;
    }

    if (target.matches('[data-td-otp-cell]')) {
        const host = target.closest('td-otp');
        const cells = [...(host?.querySelectorAll<HTMLInputElement>('[data-td-otp-cell]') ?? [])];
        const digits = target.value.replace(/\D/g, '');
        if (digits.length > 1) {
            cells.forEach((cell, index) => {
                cell.value = digits[index] ?? '';
            });
            cells[Math.min(digits.length, cells.length) - 1]?.focus();
        } else {
            target.value = digits.slice(0, 1);
            const index = cells.indexOf(target);
            if (digits && cells[index + 1]) {
                cells[index + 1].focus();
            }
        }
        syncOtp(host);
        return;
    }

    if (target.matches('[data-td-file]')) {
        const name = target.closest('td-file')?.querySelector('[data-td-file-name]');
        if (name) {
            name.textContent = target.files?.[0]?.name ?? 'Ningún archivo elegido';
        }
        return;
    }

    if (target.matches('[data-td-catalog-q]')) {
        filterCatalog(target);
        return;
    }

    if (target.matches('[data-td-ac]')) {
        filterAutoComplete(target);
    }
}

function filterCatalog(input: HTMLInputElement): void {
    const host = input.closest('[data-td-catalog]');
    if (!host) {
        return;
    }

    const query = input.value.trim().toLowerCase();
    const clear = host.querySelector<HTMLButtonElement>('[data-td-catalog-clear]');
    if (clear) {
        clear.hidden = query.length === 0;
    }

    let visible = 0;
    host.querySelectorAll<HTMLElement>('[data-td-catalog-group]').forEach((group) => {
        let count = 0;
        group.querySelectorAll<HTMLElement>('[data-td-catalog-leaf]').forEach((leaf) => {
            const name = (leaf.dataset.name ?? leaf.textContent ?? '').toLowerCase();
            const match = query.length === 0 || name.includes(query);
            leaf.hidden = !match;
            if (match) {
                count += 1;
            }
        });
        group.hidden = count === 0;
        const toggle = group.querySelector<HTMLButtonElement>('[data-td-catalog-toggle]');
        const leaves = group.querySelector<HTMLElement>('.td-catalog__leaves');
        if (toggle && query.length > 0) {
            toggle.setAttribute('aria-expanded', 'true');
            if (leaves) {
                leaves.hidden = false;
            }
        }
        visible += count;
    });

    const empty = host.querySelector<HTMLElement>('[data-td-catalog-empty]');
    if (empty) {
        empty.hidden = visible > 0;
    }
}

export function handleUiKey(event: KeyboardEvent): void {
    const target = event.target;
    if (event.key === 'Escape') {
        document.querySelectorAll<HTMLElement>('[data-td-ac-list]').forEach((list) => {
            list.hidden = true;
        });
        document.querySelectorAll('[data-td-ac]').forEach((input) => {
            input.setAttribute('aria-expanded', 'false');
        });
        document.querySelectorAll<HTMLElement>('[data-td-split-menu], [data-td-fab-menu]').forEach((menu) => {
            if (!menu.hidden) {
                menu.hidden = true;
                menu.closest('td-split, td-fab')?.querySelector<HTMLElement>('[data-td-split-open], [data-td-fab]')?.focus();
            }
        });
        document.querySelectorAll('[data-td-split-open], [data-td-fab]').forEach((button) => {
            button.setAttribute('aria-expanded', 'false');
        });
        document.querySelectorAll('td-speed').forEach((host) => toggleSpeed(host, false));
        const editing = target instanceof Element ? target.closest('td-inplace') : null;
        if (editing) {
            commitInplace(editing, false);
        }
    }

    if (target instanceof HTMLInputElement && target.matches('[data-td-otp-cell]')) {
        const cells = [...(target.closest('td-otp')?.querySelectorAll<HTMLInputElement>('[data-td-otp-cell]') ?? [])];
        const index = cells.indexOf(target);
        if (event.key === 'Backspace' && !target.value && cells[index - 1]) {
            cells[index - 1].focus();
        }
        if (event.key === 'ArrowLeft' && cells[index - 1]) {
            cells[index - 1].focus();
        }
        if (event.key === 'ArrowRight' && cells[index + 1]) {
            cells[index + 1].focus();
        }
        return;
    }

    if (target instanceof HTMLElement && target.closest('[data-td-inplace-input]') && target.closest('td-inplace')?.getAttribute('data-mode') === 'confirm' && event.key === 'Enter' && !(target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        commitInplace(target.closest('td-inplace'), true);
        return;
    }

    if (target instanceof HTMLElement && target.closest('td-inplace')?.getAttribute('data-mode') === 'auto') {
        const host = target.closest('td-inplace');
        const notes = target instanceof HTMLTextAreaElement;
        if (event.key === 'Enter' && (!notes || event.ctrlKey)) {
            event.preventDefault();
            commitInplace(host, true);
            return;
        }
        if (event.key === 'Tab') {
            commitInplace(host, true);
            const views = [...document.querySelectorAll<HTMLButtonElement>('[data-td-inplace-view]')];
            const current = host?.querySelector('[data-td-inplace-view]');
            const next = views[views.indexOf(current as HTMLButtonElement) + (event.shiftKey ? -1 : 1)];
            if (next) {
                event.preventDefault();
                window.setTimeout(() => openInplace(next.closest('td-inplace')), 0);
            }
        }
    }

    if (target instanceof HTMLElement && target.closest('[data-td-listbox]') && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        const items = [...(target.closest('[data-td-listbox]')?.querySelectorAll<HTMLButtonElement>('[data-td-list-pick]:not([hidden]):not([disabled])') ?? [])];
        const current = items.indexOf(document.activeElement as HTMLButtonElement);
        const next = event.key === 'ArrowDown' ? Math.min(items.length - 1, current + 1) : Math.max(0, current - 1);
        event.preventDefault();
        items[next]?.focus();
        return;
    }

    if (target instanceof HTMLElement && target.closest('td-speed') && target.closest('td-speed')?.querySelector('[data-td-speed]')?.getAttribute('aria-expanded') === 'true') {
        const items = [...(target.closest('td-speed')?.querySelectorAll<HTMLElement>('[data-td-speed-item]') ?? [])];
        const current = items.indexOf(document.activeElement as HTMLElement);
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const next = event.key === 'ArrowDown' ? (current + 1) % items.length : (current - 1 + items.length) % items.length;
            items[next]?.focus();
        }
    }

    if (target instanceof HTMLElement && target.matches('[data-td-tab]') && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
        const host = target.closest('td-tabs');
        const vertical = host?.classList.contains('td-tabs--vertical') === true;
        const tabs = [...(host?.querySelectorAll<HTMLButtonElement>('[data-td-tab]') ?? [])];
        const index = tabs.indexOf(target as HTMLButtonElement);
        const forward = vertical ? event.key === 'ArrowDown' : event.key === 'ArrowRight';
        const back = vertical ? event.key === 'ArrowUp' : event.key === 'ArrowLeft';
        let next = index;
        if (forward) {
            next = (index + 1) % tabs.length;
        } else if (back) {
            next = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === 'Home') {
            next = 0;
        } else if (event.key === 'End') {
            next = tabs.length - 1;
        } else {
            return;
        }
        event.preventDefault();
        tabs[next]?.focus();
        tabs[next]?.click();
        return;
    }

    if (target instanceof HTMLElement && target.matches('[data-td-select-open]') && (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown')) {
        event.preventDefault();
        target.click();
        return;
    }

    if (target instanceof HTMLInputElement && target.matches('[data-td-chip-input]') && event.key === 'Enter') {
        event.preventDefault();
        addChip(target.closest('td-chiplist'), target.value);
        target.value = '';
        return;
    }

    if (target instanceof HTMLInputElement && target.matches('[data-td-chip-input]') && event.key === 'Backspace' && !target.value) {
        const chips = target.closest('[data-td-chiplist]')?.querySelectorAll('.td-chip');
        chips?.[chips.length - 1]?.querySelector<HTMLButtonElement>('[data-td-chip-remove]')?.click();
        return;
    }

    if (target instanceof HTMLInputElement && target.matches('[data-td-ac]')) {
        const list = target.closest('td-autocomplete')?.querySelector('[data-td-ac-list]');
        const options = [...(list?.querySelectorAll<HTMLButtonElement>('[data-td-ac-pick]:not([hidden])') ?? [])];
        const current = options.findIndex((option) => option.classList.contains('is-active'));
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const next = event.key === 'ArrowDown'
                ? Math.min(options.length - 1, current + 1)
                : Math.max(0, current - 1);
            options.forEach((option, index) => option.classList.toggle('is-active', index === next));
            options[next]?.focus();
        }
        if (event.key === 'Enter' && options[current]) {
            event.preventDefault();
            applyAutoComplete(options[current]);
        }
    }
}

function applySelectPick(button: HTMLButtonElement): void {
    const host = button.closest('td-select');
    if (!host) {
        return;
    }

    const multiple = host.dataset.multiple === 'true';
    const value = button.dataset.tdSelectPick ?? '';
    if (!multiple) {
        host.querySelectorAll('[data-td-select-value]').forEach((node) => node.remove());
        addHidden(host, value);
        closeSelects();
    } else {
        selectValue(host, value);
    }

    refreshSelectFace(host);
}

function selectValue(host: Element, value: string, forceOn = false): void {
    if (!value) {
        return;
    }

    host.querySelectorAll<HTMLInputElement>('[data-td-select-value]').forEach((input) => {
        if (input.value === '') {
            input.remove();
        }
    });

    const existing = [...host.querySelectorAll<HTMLInputElement>('[data-td-select-value]')].find((input) => input.value === value);
    if (existing) {
        if (!forceOn) {
            existing.remove();
        }
        return;
    }

    const max = Number(host.getAttribute('data-max-selected') ?? '0');
    const count = [...host.querySelectorAll<HTMLInputElement>('[data-td-select-value]')].filter((input) => input.value !== '').length;
    if (max > 0 && count >= max) {
        return;
    }

    addHidden(host, value);
}

function refreshSelectFace(host: Element): void {
    if (host.dataset.nullable === 'true' && host.querySelector('[data-td-select-value]') === null) {
        addHidden(host, '');
    }

    const selected = [...host.querySelectorAll<HTMLInputElement>('[data-td-select-value]')]
        .map((input) => input.value)
        .filter((value) => value !== '');
    const clear = host.querySelector<HTMLButtonElement>('[data-td-select-clear]');
    const trigger = host.querySelector('.td-select__trigger');
    if (clear) {
        clear.hidden = selected.length === 0;
    }
    trigger?.classList.toggle('has-clear', selected.length > 0 && clear !== null);
    const chips = host.dataset.chips !== 'false';
    const maxChips = Number(host.dataset.maxChips ?? '8');
    const face = host.querySelector('.td-select__chips');
    if (face && host.dataset.multiple === 'true') {
        face.querySelectorAll('[data-td-select-chip], [data-td-select-more], .td-select__text').forEach((node) => node.remove());
        if (!chips || selected.length === 0) {
            const text = document.createElement('span');
            text.className = `td-select__text${selected.length ? '' : ' is-placeholder'}`;
            const format = host.dataset.summary || '{0} seleccionadas';
            text.textContent = selected.length ? format.replace('{0}', String(selected.length)) : (host.dataset.placeholder ?? 'Selecciona');
            face.append(text);
        } else {
            selected.slice(0, maxChips).forEach((value) => {
                const option = host.querySelector<HTMLElement>(`[data-td-select-pick="${CSS.escape(value)}"]`);
                const chip = document.createElement('span');
                chip.className = 'td-chip td-chip--sm';
                chip.dataset.tdSelectChip = value;
                chip.append(option?.dataset.label ?? value);
                const remove = document.createElement('button');
                remove.type = 'button';
                remove.className = 'td-chip__remove';
                remove.dataset.tdSelectRemove = value;
                remove.setAttribute('aria-label', `Quitar ${option?.dataset.label ?? value}`);
                remove.textContent = '×';
                chip.append(remove);
                face.append(chip);
            });
            if (selected.length > maxChips) {
                const more = document.createElement('span');
                more.className = 'td-chip td-chip--sm';
                more.dataset.tdSelectMore = '';
                more.textContent = `+${selected.length - maxChips}`;
                face.append(more);
            }
        }
    } else if (face) {
        const text = face.querySelector('.td-select__text');
        const option = host.querySelector<HTMLElement>(`[data-td-select-pick="${CSS.escape(selected[0] ?? '')}"]`);
        if (text) {
            text.textContent = option?.dataset.label ?? host.dataset.placeholder ?? 'Selecciona';
            text.classList.toggle('is-placeholder', selected.length === 0);
        }
    }

    syncSelectOptions(host);
}

function addHidden(host: Element, value: string): void {
    const name = host.getAttribute('data-name')
        ?? host.querySelector<HTMLInputElement>('[data-td-select-value]')?.name
        ?? 'valor';
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name || 'valor';
    input.value = value;
    input.dataset.tdSelectValue = '';
    host.insertBefore(input, host.querySelector('[data-td-select-open]'));
}

function syncSelectOptions(host: Element | null): void {
    if (!host) {
        return;
    }

    const selected = new Set([...host.querySelectorAll<HTMLInputElement>('[data-td-select-value]')].map((input) => input.value));
    const max = Number(host.getAttribute('data-max-selected') ?? '0');
    const full = max > 0 && selected.size >= max;
    host.querySelectorAll<HTMLButtonElement>('[data-td-select-pick]').forEach((option) => {
        const on = selected.has(option.dataset.tdSelectPick ?? '');
        option.classList.toggle('is-on', on);
        option.setAttribute('aria-selected', on ? 'true' : 'false');
        option.disabled = option.dataset.locked === 'true' || (full && !on);
    });
}

function syncSelectBar(host: Element | null): void {
    if (!host) {
        return;
    }

    const name = host.getAttribute('data-name') ?? 'barra';
    host.querySelectorAll('[data-td-selectbar-value]').forEach((node) => node.remove());
    host.querySelectorAll<HTMLButtonElement>('[data-td-selectbar].is-on').forEach((button) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = button.dataset.tdSelectbar ?? '';
        input.dataset.tdSelectbarValue = '';
        host.append(input);
    });
}

function pickList(button: HTMLButtonElement): void {
    const host = button.closest('td-listbox');
    if (!host) {
        return;
    }

    const multiple = host.dataset.multiple === 'true';
    const value = button.dataset.tdListPick ?? '';
    if (!multiple) {
        host.querySelectorAll('[data-td-list-pick]').forEach((option) => {
            option.classList.toggle('is-on', option === button);
            option.setAttribute('aria-selected', option === button ? 'true' : 'false');
        });
    } else {
        const on = !button.classList.contains('is-on');
        button.classList.toggle('is-on', on);
        button.setAttribute('aria-selected', on ? 'true' : 'false');
    }

    const name = host.dataset.name ?? 'lista';
    host.querySelectorAll('[data-td-list-value]').forEach((node) => node.remove());
    host.querySelectorAll<HTMLButtonElement>('[data-td-list-pick].is-on').forEach((option) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = option.dataset.tdListPick ?? '';
        input.dataset.tdListValue = '';
        host.append(input);
    });
    void value;
}

function syncOtp(host: Element | null): void {
    if (!host) {
        return;
    }

    const cells = [...host.querySelectorAll<HTMLInputElement>('[data-td-otp-cell]')];
    const code = cells.map((cell) => cell.value.replace(/\D/g, '').slice(0, 1)).join('');
    const hidden = host.querySelector<HTMLInputElement>('[data-td-otp-value]');
    if (hidden) {
        hidden.value = code;
    }

    const status = host.querySelector('[data-td-otp-status]');
    const expected = host.getAttribute('data-expected') ?? '';
    cells.forEach((cell) => cell.classList.remove('is-ok', 'is-bad'));
    if (!status) {
        return;
    }

    if (code.length < cells.length) {
        status.textContent = `${cells.length - code.length} dígitos restantes`;
        status.className = '';
        return;
    }

    if (!expected || code === expected) {
        status.textContent = 'Código verificado';
        status.className = 'is-ok';
        cells.forEach((cell) => cell.classList.add('is-ok'));
        return;
    }

    status.textContent = 'Código incorrecto · te quedan 2 intentos';
    status.className = 'is-bad';
    cells.forEach((cell) => cell.classList.add('is-bad'));
}

function toggleSpeed(host: Element | null, open: boolean): void {
    if (!host) {
        return;
    }

    const actions = host.querySelector<HTMLElement>('[data-td-speed-actions]');
    const mask = host.querySelector<HTMLElement>('[data-td-speed-mask]');
    const button = host.querySelector('[data-td-speed]');
    if (actions) {
        actions.hidden = !open;
    }
    if (mask) {
        mask.hidden = !open;
    }
    button?.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (!open) {
        button instanceof HTMLElement && button.focus();
    }
}

function openInplace(host: Element | null): void {
    if (!host) {
        return;
    }

    const view = host.querySelector<HTMLElement>('[data-td-inplace-view]');
    const edit = host.querySelector<HTMLElement>('[data-td-inplace-edit]');
    const input = host.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[data-td-inplace-input]');
    const current = host.querySelector('[data-td-inplace-text]')?.textContent ?? '';
    if (view) {
        view.hidden = true;
    }
    if (edit) {
        edit.hidden = false;
    }
    if (input && input.tagName !== 'SELECT') {
        input.value = current;
    }
    input?.focus();
    if (input instanceof HTMLInputElement) {
        input.select();
    }
}

export function commitInplace(host: Element | null, save: boolean): void {
    if (!host) {
        return;
    }

    const view = host.querySelector<HTMLElement>('[data-td-inplace-view]');
    const edit = host.querySelector<HTMLElement>('[data-td-inplace-edit]');
    const input = host.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[data-td-inplace-input]');
    const text = host.querySelector('[data-td-inplace-text]');
    const hidden = host.querySelector<HTMLInputElement>('[data-td-inplace-value]');
    const saved = host.querySelector<HTMLElement>('[data-td-inplace-saved]');
    if (save && input && text) {
        const next = input.tagName === 'SELECT'
            ? (input as HTMLSelectElement).selectedOptions[0]?.textContent ?? input.value
            : input.value.trim();
        if (next) {
            text.textContent = next;
            if (hidden) {
                hidden.value = input.value;
            }
            const log = document.querySelector<HTMLElement>('[data-td-inplace-log]');
            if (log) {
                const line = document.createElement('p');
                const time = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                line.textContent = `${time} · ${host.getAttribute('data-field') ?? 'Campo'} → ${next}`;
                log.prepend(line);
            }
            if (saved) {
                saved.hidden = false;
                window.setTimeout(() => {
                    saved.hidden = true;
                }, 1400);
            }
        }
    }

    if (view) {
        view.hidden = false;
    }
    if (edit) {
        edit.hidden = true;
    }
}

function closeSelects(): void {
    document.querySelectorAll<HTMLElement>('[data-td-select-panel]').forEach((panel) => {
        panel.hidden = true;
    });
    document.querySelectorAll('[data-td-select-open]').forEach((button) => {
        button.setAttribute('aria-expanded', 'false');
    });
}

function applyMask(raw: string, pattern: string): string {
    const letters = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    let index = 0;
    let out = '';
    for (const token of pattern) {
        if (index >= letters.length) {
            break;
        }

        if (token === '0') {
            if (/\d/.test(letters[index])) {
                out += letters[index++];
            } else {
                index += 1;
            }
        } else if (token === 'X' || token === 'A') {
            if (/[A-Z]/.test(letters[index])) {
                out += letters[index++];
            } else {
                index += 1;
            }
        } else {
            out += token;
        }
    }

    return out;
}

function filterAutoComplete(input: HTMLInputElement): void {
    const host = input.closest('td-autocomplete');
    const list = host?.querySelector<HTMLElement>('[data-td-ac-list]');
    const query = input.value.trim().toLowerCase();
    let visible = 0;
    host?.querySelectorAll<HTMLButtonElement>('[data-td-ac-pick]').forEach((option) => {
        const label = (option.dataset.label ?? option.textContent ?? '').toLowerCase();
        const match = query.length > 0 && label.includes(query);
        option.hidden = !match;
        option.parentElement && (option.parentElement.hidden = !match);
        option.classList.remove('is-active');
        if (match) {
            visible += 1;
            const text = option.dataset.label ?? option.textContent ?? '';
            const at = text.toLowerCase().indexOf(query);
            option.innerHTML = `${escapeHtml(text.slice(0, at))}<mark>${escapeHtml(text.slice(at, at + query.length))}</mark>${escapeHtml(text.slice(at + query.length))}`;
        }
    });
    if (list) {
        list.hidden = visible === 0;
    }
    input.setAttribute('aria-expanded', visible > 0 ? 'true' : 'false');
}

function applyAutoComplete(button: HTMLButtonElement): void {
    const host = button.closest('td-autocomplete');
    const input = host?.querySelector<HTMLInputElement>('[data-td-ac]');
    const list = host?.querySelector<HTMLElement>('[data-td-ac-list]');
    if (input) {
        input.value = button.dataset.label ?? button.textContent ?? '';
        input.setAttribute('aria-expanded', 'false');
    }
    if (list) {
        list.hidden = true;
    }
}

function addChip(host: Element | null, raw: string): void {
    const value = raw.trim();
    if (!host || !value) {
        return;
    }

    const existing = [...host.querySelectorAll<HTMLInputElement>('[data-td-chip-value]')].some((input) => input.value === value);
    if (existing) {
        return;
    }

    const name = host.getAttribute('data-name') ?? 'tags';
    const chip = document.createElement('span');
    chip.className = 'td-chip td-chip--removable';
    chip.innerHTML = `${escapeHtml(value)}<button type="button" class="td-chip__remove" data-td-chip-remove="${escapeHtml(value)}" aria-label="Quitar ${escapeHtml(value)}">×</button><input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}" data-td-chip-value />`;
    host.querySelector('[data-td-chip-input]')?.before(chip);
}

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[char] ?? char));
}

const cardCarouselTimers = new WeakMap<HTMLElement, number>();

function startCardCarousel(host: HTMLElement): void {
    if (host.dataset.auto === 'false') return;
    if (host.querySelectorAll('.td-ccard').length < 2) return;
    host.addEventListener('mouseenter', () => pauseCardCarousel(host, true));
    host.addEventListener('mouseleave', () => pauseCardCarousel(host, false));
    host.addEventListener('focusin', () => pauseCardCarousel(host, true));
    host.addEventListener('focusout', () => pauseCardCarousel(host, false));
    playCardCarousel(host);
}

function playCardCarousel(host: HTMLElement): void {
    stopCardCarousel(host);
    const interval = Number(host.closest('td-card-carousel')?.getAttribute('data-interval') ?? 5000);
    const id = window.setInterval(() => stepCardCarousel(host, 1), Number.isFinite(interval) ? interval : 5000);
    cardCarouselTimers.set(host, id);
    host.dataset.paused = 'false';
    setPlayIcon(host, true);
}

function stopCardCarousel(host: HTMLElement): void {
    const id = cardCarouselTimers.get(host);
    if (id) {
        window.clearInterval(id);
        cardCarouselTimers.delete(host);
    }
}

function pauseCardCarousel(host: HTMLElement, paused: boolean): void {
    host.dataset.hold = paused ? 'true' : 'false';
    if (paused) stopCardCarousel(host);
    else if (host.dataset.paused !== 'true') playCardCarousel(host);
}

function toggleCardCarousel(host: HTMLElement | null): void {
    if (!host) return;
    const paused = host.dataset.paused === 'true';
    host.dataset.paused = paused ? 'false' : 'true';
    if (paused) {
        playCardCarousel(host);
    } else {
        stopCardCarousel(host);
        setPlayIcon(host, false);
    }
}

function setPlayIcon(host: HTMLElement, playing: boolean): void {
    const play = host.querySelector('[data-td-ccard-play]');
    const glyph = play?.querySelector('.td-btnicon__glyph');
    if (glyph) glyph.textContent = playing ? 'pause' : 'play_arrow';
    if (play instanceof HTMLElement) {
        const label = playing ? 'Pausar' : 'Reproducir';
        play.setAttribute('aria-label', label);
    }
}

function stepCardCarousel(host: HTMLElement | null, delta: number): void {
    if (!host) return;
    const cards = host.querySelectorAll('.td-ccard');
    const current = Number(host.dataset.index ?? 0);
    goCardCarousel(host, (current + delta + cards.length) % cards.length);
}

function goCardCarousel(host: HTMLElement | null, index: number): void {
    if (!host) return;
    const track = host.querySelector<HTMLElement>('[data-td-ccard-track]');
    const cards = host.querySelectorAll('.td-ccard');
    if (!track || !cards.length) return;
    const next = ((index % cards.length) + cards.length) % cards.length;
    host.dataset.index = String(next);
    track.style.transform = `translateX(-${next * 100}%)`;
    host.querySelectorAll('[data-td-ccard-dot]').forEach((dot, i) => {
        dot.classList.toggle('is-current', i === next);
        if (i === next) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
    });
    const live = host.querySelector('[data-td-ccard-live]');
    if (live) live.textContent = `Tarjeta ${next + 1} de ${cards.length}`;
}

const carouselTimers = new WeakMap<HTMLElement, number>();

function startCarousel(host: HTMLElement): void {
    host.addEventListener('mouseenter', () => pauseCarousel(host, true));
    host.addEventListener('mouseleave', () => pauseCarousel(host, false));
    playCarousel(host);
}

function playCarousel(host: HTMLElement): void {
    stopCarousel(host);
    const interval = Number(host.closest('td-carousel')?.getAttribute('data-interval') ?? 5000);
    const id = window.setInterval(() => stepCarousel(host, 1), Number.isFinite(interval) ? interval : 5000);
    carouselTimers.set(host, id);
    host.dataset.paused = 'false';
    const play = host.querySelector('[data-td-carousel-play]');
    play?.setAttribute('aria-label', 'Pausar');
}

function stopCarousel(host: HTMLElement): void {
    const id = carouselTimers.get(host);
    if (id) {
        window.clearInterval(id);
        carouselTimers.delete(host);
    }
}

function pauseCarousel(host: HTMLElement, paused: boolean): void {
    host.dataset.hold = paused ? 'true' : 'false';
    if (paused) {
        stopCarousel(host);
    } else if (host.dataset.paused !== 'true') {
        playCarousel(host);
    }
}

function toggleCarouselPlay(host: HTMLElement | null): void {
    if (!host) {
        return;
    }

    const paused = host.dataset.paused === 'true';
    host.dataset.paused = paused ? 'false' : 'true';
    if (paused) {
        playCarousel(host);
    } else {
        stopCarousel(host);
        host.querySelector('[data-td-carousel-play]')?.setAttribute('aria-label', 'Reproducir');
    }
}

function stepCarousel(host: HTMLElement | null, delta: number): void {
    if (!host) {
        return;
    }

    const slides = host.querySelectorAll('.td-carousel__slide');
    const current = Number(host.dataset.index ?? 0);
    goCarousel(host, (current + delta + slides.length) % slides.length);
}

function goCarousel(host: HTMLElement | null, index: number): void {
    if (!host) {
        return;
    }

    const track = host.querySelector<HTMLElement>('[data-td-carousel-track]');
    const slides = host.querySelectorAll('.td-carousel__slide');
    if (!track || !slides.length) {
        return;
    }

    const next = ((index % slides.length) + slides.length) % slides.length;
    host.dataset.index = String(next);
    track.style.transform = `translateX(-${next * 100}%)`;
    host.querySelectorAll('[data-td-carousel-dot]').forEach((dot, i) => {
        dot.classList.toggle('is-current', i === next);
        dot.setAttribute('aria-current', i === next ? 'true' : 'false');
    });
}

const PHOTO_QUALITY = 0.85;
const PHOTO_MAX_EDGE = 1920;
const photoTokens = new WeakMap<HTMLElement, number>();
const photoPreviewUrls = new WeakMap<HTMLElement, string>();

export function handlePhotoChange(target: EventTarget | null): void {
    if (!(target instanceof HTMLInputElement) || !target.matches('[data-td-photo-pick]')) {
        return;
    }

    const host = target.closest('td-photo');
    const file = target.files?.[0] ?? null;
    target.value = '';
    if (!(host instanceof HTMLElement) || !file) {
        return;
    }

    const token = (photoTokens.get(host) ?? 0) + 1;
    photoTokens.set(host, token);
    void finishPhoto(host, file, token);
}

async function finishPhoto(host: HTMLElement, file: File, token: number): Promise<void> {
    const button = host.querySelector<HTMLButtonElement>('[data-td-photo-open]');
    button?.setAttribute('aria-busy', 'true');
    setPhotoStatus(host, 'Comprimiendo la foto…', false);

    try {
        const ready = await compressPhoto(file);
        if (photoTokens.get(host) !== token) {
            return;
        }

        const posted = host.querySelector<HTMLInputElement>('[data-td-photo-file]');
        if (!posted) {
            return;
        }

        const transfer = new DataTransfer();
        transfer.items.add(ready);
        posted.files = transfer.files;
        showPhotoPreview(host, ready);
        setPhotoStatus(host, `Foto lista, ${photoSize(ready.size)}. Toca la imagen para verla en grande.`, false);
    } catch {
        if (photoTokens.get(host) !== token) {
            return;
        }

        setPhotoStatus(host, 'No se pudo comprimir esta imagen. Elige un archivo JPG, PNG o WEBP.', true);
    } finally {
        if (photoTokens.get(host) === token) {
            button?.removeAttribute('aria-busy');
        }
    }
}

async function compressPhoto(file: File): Promise<File> {
    if (file.type && !file.type.startsWith('image/')) {
        throw new Error('tipo');
    }

    const source = await createImageBitmap(file);
    try {
        const base = file.name.replace(/\.[^.]+$/, '') || 'foto';
        return await compressBitmap(source, base);
    } finally {
        source.close();
    }
}

async function compressBitmap(source: ImageBitmap, baseName: string): Promise<File> {
    const longest = Math.max(source.width, source.height);
    const scale = longest > PHOTO_MAX_EDGE ? PHOTO_MAX_EDGE / longest : 1;
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));
    let bitmap = source;
    if (scale < 1) {
        try {
            bitmap = await createImageBitmap(source, { resizeWidth: width, resizeHeight: height, resizeQuality: 'high' });
        } catch {
            bitmap = source;
        }
    }

    try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
            throw new Error('canvas');
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(bitmap, 0, 0, width, height);
        const blob = await canvasToJpeg(canvas, PHOTO_QUALITY);
        return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
    } finally {
        if (bitmap !== source) {
            bitmap.close();
        }
    }
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('blob'));
            }
        }, 'image/jpeg', quality);
    });
}

function showPhotoPreview(host: HTMLElement, file: File): void {
    const preview = host.querySelector<HTMLImageElement>('[data-td-photo-preview]');
    const large = host.querySelector<HTMLImageElement>('[data-td-photo-large]');
    const open = host.querySelector<HTMLButtonElement>('[data-td-photo-preview-open]');
    if (!preview || !large || !open) {
        return;
    }

    const previous = photoPreviewUrls.get(host);
    if (previous) {
        URL.revokeObjectURL(previous);
    }

    const url = URL.createObjectURL(file);
    photoPreviewUrls.set(host, url);
    preview.src = url;
    large.src = url;
    open.hidden = false;
    const canvas = host.querySelector<HTMLElement>('[data-td-image-canvas]');
    canvas?.style.setProperty('--z', '1');
    canvas?.style.setProperty('--r', '0deg');
}

function setPhotoStatus(host: HTMLElement, text: string, failed: boolean): void {
    const status = host.querySelector('[data-td-photo-status]');
    if (!status) {
        return;
    }

    status.textContent = text;
    status.classList.toggle('is-bad', failed);
}

function photoSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type PhotoShot = { id: number; file: File | null; url: string };

const photoSetShots = new WeakMap<HTMLElement, PhotoShot[]>();
const photoSetStreams = new WeakMap<HTMLElement, MediaStream>();
let photoSetSeq = 0;

async function openPhotoSet(host: HTMLElement): Promise<void> {
    const dialog = host.querySelector<HTMLDialogElement>('[data-td-photos-cam]');
    const video = host.querySelector<HTMLVideoElement>('[data-td-photos-video]');
    if (!dialog || !video) {
        return;
    }

    if (!dialog.dataset.bound) {
        dialog.dataset.bound = 'true';
        dialog.addEventListener('close', () => stopPhotoSet(host));
    }

    if (!navigator.mediaDevices?.getUserMedia) {
        setPhotoStatus(host, 'Este navegador no abre la cámara. Usa uno que permita fotos en el sitio.', true);
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1920 },
                height: { ideal: 1080 },
            },
        });
        photoSetStreams.set(host, stream);
        video.srcObject = stream;
        await video.play();
        dialog.showModal();
        setPhotoStatus(host, 'La cámara sigue abierta. Toca Tomar foto las veces que necesites.', false);
    } catch {
        stopPhotoSet(host);
        setPhotoStatus(host, 'No se pudo abrir la cámara. Permite el acceso en este sitio y vuelve a tocar el botón.', true);
    }
}

function stopPhotoSet(host: HTMLElement): void {
    const stream = photoSetStreams.get(host);
    stream?.getTracks().forEach((track) => track.stop());
    photoSetStreams.delete(host);
    const video = host.querySelector<HTMLVideoElement>('[data-td-photos-video]');
    if (video) {
        video.srcObject = null;
    }
    const shots = photoSetShots.get(host) ?? [];
    const ready = shots.filter((shot) => shot.file).length;
    if (ready > 0) {
        setPhotoStatus(host, photoSetStatus(shots), false);
    }
}

async function takePhotoSetShot(host: HTMLElement): Promise<void> {
    const video = host.querySelector<HTMLVideoElement>('[data-td-photos-video]');
    if (!video || video.readyState < 2) {
        setPhotoStatus(host, 'Esperando la imagen de la cámara.', false);
        return;
    }

    const source = await createImageBitmap(video);
    const id = ++photoSetSeq;
    const shots = photoSetShots.get(host) ?? [];
    shots.push({ id, file: null, url: '' });
    photoSetShots.set(host, shots);
    renderPhotoSet(host);
    setPhotoStatus(host, photoSetStatus(shots), false);

    try {
        const file = await compressBitmap(source, `foto-${id}`);
        const current = photoSetShots.get(host) ?? [];
        const shot = current.find((item) => item.id === id);
        if (!shot) {
            return;
        }
        shot.file = file;
        shot.url = URL.createObjectURL(file);
        syncPhotoSetFiles(host);
        renderPhotoSet(host);
        setPhotoStatus(host, photoSetStatus(current), false);
    } catch {
        const current = photoSetShots.get(host) ?? [];
        const index = current.findIndex((item) => item.id === id);
        if (index >= 0) {
            current.splice(index, 1);
        }
        renderPhotoSet(host);
        setPhotoStatus(host, 'Esa foto no se pudo guardar. Toma otra.', true);
    } finally {
        source.close();
    }
}

function removePhotoSetShot(host: HTMLElement, id: number): void {
    const shots = photoSetShots.get(host) ?? [];
    const index = shots.findIndex((shot) => shot.id === id);
    if (index < 0) {
        return;
    }
    if (shots[index].url) {
        URL.revokeObjectURL(shots[index].url);
    }
    shots.splice(index, 1);
    syncPhotoSetFiles(host);
    renderPhotoSet(host);
    setPhotoStatus(host, shots.length ? photoSetStatus(shots) : 'No quedan fotos. La cámara puede seguir abierta.', false);
}

function syncPhotoSetFiles(host: HTMLElement): void {
    const input = host.querySelector<HTMLInputElement>('[data-td-photos-file]');
    if (!input) {
        return;
    }
    const transfer = new DataTransfer();
    for (const shot of photoSetShots.get(host) ?? []) {
        if (shot.file) {
            transfer.items.add(shot.file);
        }
    }
    input.files = transfer.files;
}

function renderPhotoSet(host: HTMLElement): void {
    const shots = photoSetShots.get(host) ?? [];
    host.querySelectorAll<HTMLElement>('[data-td-photos-strip]').forEach((strip) => {
        strip.replaceChildren(...shots.map((shot, index) => photoSetItem(shot, index)));
    });
}

function photoSetItem(shot: PhotoShot, index: number): HTMLLIElement {
    const item = document.createElement('li');
    item.className = 'td-photos__shot';
    const number = index + 1;
    if (shot.url) {
        const img = document.createElement('img');
        img.src = shot.url;
        img.alt = `Foto ${number}`;
        item.append(img);
    } else {
        const pending = document.createElement('span');
        pending.className = 'td-photos__pending';
        pending.textContent = 'Guardando…';
        item.append(pending);
    }
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.dataset.tdPhotosRemove = String(shot.id);
    remove.setAttribute('aria-label', `Quitar foto ${number}`);
    remove.textContent = 'Quitar';
    item.append(remove);
    return item;
}

function photoSetStatus(shots: PhotoShot[]): string {
    const ready = shots.filter((shot) => shot.file).length;
    const pending = shots.length - ready;
    const noun = ready === 1 ? 'foto lista' : 'fotos listas';
    const waiting = pending > 0 ? ` ${pending === 1 ? 'Una se está guardando.' : `${pending} se están guardando.`}` : '';
    return `${ready} ${noun} para enviar.${waiting} Quita las que no quieras. La cámara no se cierra al tomar.`;
}
