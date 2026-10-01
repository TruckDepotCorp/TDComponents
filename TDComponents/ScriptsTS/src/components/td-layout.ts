export function bindLayout(root: ParentNode = document): void {
    root.querySelectorAll('td-markdown').forEach((host) => {
        const source = host.querySelector<HTMLTextAreaElement>('[data-td-md-source]');
        if (source) {
            renderMarkdown(host, source.value);
        }
    });

    root.querySelectorAll('td-knob').forEach((host) => {
        if (host instanceof HTMLElement) {
            syncKnob(host, Number(host.dataset.value ?? 0));
        }
    });

    root.querySelectorAll('[data-td-toc]').forEach((toc) => {
        if (toc instanceof HTMLElement) {
            observeToc(toc);
        }
    });

    root.querySelectorAll('td-menuapp').forEach((host) => {
        if (host instanceof HTMLElement) {
            restoreMenu(host);
        }
    });

    root.querySelectorAll('td-ddgrid').forEach((host) => syncDdGrid(host));

    root.querySelectorAll('[data-td-navmenu]').forEach((nav) => {
        if (!(nav instanceof HTMLElement) || nav.dataset.bound === 'true') {
            return;
        }
        nav.dataset.bound = 'true';
        const delay = Number(nav.dataset.delay ?? 120);
        let timer = 0;
        const arm = (action: () => void, wait: number) => {
            window.clearTimeout(timer);
            timer = window.setTimeout(action, wait);
        };
        nav.addEventListener('pointerover', (event) => {
            const node = event.target instanceof Element ? event.target : null;
            const trigger = node?.closest('.td-navmenu__bar .td-navmenu__btn');
            if (!(trigger instanceof HTMLElement) || !nav.contains(trigger)) {
                return;
            }
            if (trigger instanceof HTMLButtonElement && trigger.hasAttribute('data-td-nav-open')) {
                if (trigger.getAttribute('aria-expanded') === 'true') {
                    window.clearTimeout(timer);
                    return;
                }
                arm(() => openNav(trigger, true), delay);
                return;
            }
            arm(() => closeNav(nav), delay);
        });
        nav.addEventListener('pointerleave', () => {
            arm(() => closeNav(nav), 180);
        });
    });
}

export function handleLayoutClick(target: Element): boolean {
    const popup = target.closest('[data-td-popup-open]');
    if (popup instanceof HTMLButtonElement) {
        const host = popup.closest('td-popup');
        const panel = host?.querySelector<HTMLElement>('[data-td-popup-panel]');
        if (panel) {
            const next = panel.hidden;
            closePopups();
            panel.hidden = !next;
            popup.setAttribute('aria-expanded', String(next));
        }
        return true;
    }

    if (!target.closest('td-popup')) {
        closePopups();
    }

    const shellBell = target.closest('[data-td-shell-bell]');
    if (shellBell instanceof HTMLButtonElement) {
        const panel = shellBell.parentElement?.querySelector<HTMLElement>('[data-td-shell-notes]');
        if (panel) {
            panel.hidden = !panel.hidden;
            shellBell.setAttribute('aria-expanded', String(!panel.hidden));
        }
        return true;
    }

    if (!target.closest('[data-td-shell-notes]')) {
        document.querySelectorAll<HTMLElement>('[data-td-shell-notes]').forEach((panel) => {
            panel.hidden = true;
        });
        document.querySelectorAll('[data-td-shell-bell]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
    }

    const shellMask = target.closest('[data-td-shell-mask]');
    if (shellMask instanceof HTMLElement) {
        const host = shellMask.closest('td-layout');
        if (host) {
            host.dataset.collapsed = 'true';
            host.querySelector('[data-td-layout-toggle]')?.setAttribute('aria-expanded', 'false');
        }
        return true;
    }

    const layoutToggle = target.closest('[data-td-layout-toggle]');
    if (layoutToggle instanceof HTMLButtonElement) {
        const host = layoutToggle.closest('td-layout');
        if (host) {
            const collapsed = host.dataset.collapsed !== 'true';
            host.dataset.collapsed = String(collapsed);
            layoutToggle.setAttribute('aria-expanded', String(!collapsed));
        }
        return true;
    }

    const layoutSide = target.closest('[data-td-layout-side]');
    if (layoutSide instanceof HTMLButtonElement) {
        const host = layoutSide.closest('td-layout');
        if (host) {
            const start = host.dataset.side !== 'start';
            host.dataset.side = start ? 'start' : 'end';
            layoutSide.setAttribute('aria-checked', String(start));
            layoutSide.lastChild && (layoutSide.lastChild.textContent = start ? 'Sidebar a la izquierda' : 'Sidebar a la derecha');
        }
        return true;
    }

    const layoutPos = target.closest('[data-td-layout-pos]');
    if (layoutPos instanceof HTMLButtonElement) {
        const host = layoutPos.closest('td-layout');
        if (host) {
            host.dataset.side = layoutPos.dataset.tdLayoutPos ?? 'start';
            host.querySelectorAll<HTMLButtonElement>('[data-td-layout-pos]').forEach((button) => {
                button.setAttribute('aria-pressed', String(button === layoutPos));
            });
        }
        return true;
    }

    const navOpen = target.closest('[data-td-nav-open]');
    if (navOpen instanceof HTMLButtonElement) {
        openNav(navOpen, navOpen.getAttribute('aria-expanded') !== 'true');
        return true;
    }

    const pmenuToggle = target.closest('[data-td-pmenu-toggle]');
    if (pmenuToggle instanceof HTMLButtonElement) {
        const nav = pmenuToggle.closest('[data-td-pmenu]');
        const section = pmenuToggle.closest('[data-td-pmenu-sec]');
        const open = pmenuToggle.getAttribute('aria-expanded') !== 'true';
        if (nav?.dataset.multiple !== 'true') {
            nav?.querySelectorAll('[data-td-pmenu-sec]').forEach((node) => {
                node.setAttribute('data-open', 'false');
                node.querySelector('[data-td-pmenu-toggle]')?.setAttribute('aria-expanded', 'false');
                const kids = node.querySelector<HTMLElement>('.td-pmenu__kids');
                if (kids) {
                    kids.hidden = true;
                }
            });
        }
        if (section) {
            section.setAttribute('data-open', open ? 'true' : 'false');
            const kids = section.querySelector<HTMLElement>('.td-pmenu__kids');
            if (kids) {
                kids.hidden = !open;
            }
        }
        pmenuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        return true;
    }

    const pmenuLink = target.closest('[data-td-pmenu-link]');
    if (pmenuLink instanceof HTMLElement) {
        const msg = pmenuLink.closest('[data-td-pmenu-demo]')?.querySelector('[data-td-pmenu-msg]');
        if (msg) {
            const label = pmenuLink.querySelector('span')?.textContent?.trim() || pmenuLink.textContent?.trim() || '';
            msg.textContent = `Navegar a: ${label}`;
        }
    }

    const pmenuMulti = target.closest('[data-td-pmenu-multi]');
    if (pmenuMulti instanceof HTMLButtonElement) {
        const nav = pmenuMulti.closest('[data-td-pmenu-demo]')?.querySelector('[data-td-pmenu]');
        const on = nav?.dataset.multiple !== 'true';
        if (nav) {
            nav.dataset.multiple = on ? 'true' : 'false';
        }
        pmenuMulti.setAttribute('aria-checked', on ? 'true' : 'false');
        return true;
    }

    const pmenuIcons = target.closest('[data-td-pmenu-icons]');
    if (pmenuIcons instanceof HTMLButtonElement) {
        const nav = pmenuIcons.closest('[data-td-pmenu-demo]')?.querySelector('[data-td-pmenu]');
        const on = !nav?.classList.contains('is-collapsed');
        nav?.classList.toggle('is-collapsed', on);
        pmenuIcons.setAttribute('aria-checked', on ? 'true' : 'false');
        return true;
    }

    const menuRow = target.closest('[data-td-menu-row]');
    if (menuRow instanceof HTMLElement) {
        toggleMenuRow(menuRow, true);
        return true;
    }

    const rowGap = target.closest('[data-td-row-gap], [data-td-row-align]');
    if (rowGap instanceof HTMLButtonElement) {
        const host = rowGap.closest('[data-td-row-playground]');
        const rows = host?.querySelectorAll<HTMLElement>('.td-row12');
        if (rowGap.dataset.tdRowGap) {
            rows?.forEach((row) => {
                row.style.setProperty('--td-row-gap', rowGap.dataset.tdRowGap ?? '16px');
            });
            host?.querySelectorAll('[data-td-row-gap]').forEach((button) => {
                button.setAttribute('aria-pressed', String(button === rowGap));
                button.classList.toggle('is-on', button === rowGap);
            });
        }
        if (rowGap.dataset.tdRowAlign) {
            rows?.forEach((row) => {
                row.style.alignItems = rowGap.dataset.tdRowAlign ?? 'stretch';
            });
            host?.querySelectorAll('[data-td-row-align]').forEach((button) => {
                button.setAttribute('aria-pressed', String(button === rowGap));
                button.classList.toggle('is-on', button === rowGap);
            });
        }
        return true;
    }

    const ddPage = target.closest('[data-td-ddgrid-page]');
    if (ddPage instanceof HTMLButtonElement) {
        const host = ddPage.closest('td-ddgrid');
        if (host instanceof HTMLElement) {
            host.dataset.page = String(Number(host.dataset.page ?? 1) + Number(ddPage.dataset.tdDdgridPage ?? 1));
            syncDdGrid(host);
        }
        return true;
    }

    const ddClear = target.closest('[data-td-ddgrid-clear]');
    if (ddClear instanceof HTMLButtonElement) {
        const host = ddClear.closest('td-ddgrid');
        const value = host?.querySelector<HTMLInputElement>('[data-td-ddgrid-value]');
        const text = host?.querySelector('[data-td-ddgrid-text]');
        const code = host?.querySelector('[data-td-ddgrid-code]');
        if (value) {
            value.value = '';
        }
        if (text) {
            text.textContent = host?.querySelector<HTMLElement>('[data-td-ddgrid-open]')?.getAttribute('data-placeholder') ?? 'Selecciona un repuesto…';
            text.classList.add('is-placeholder');
        }
        if (code) {
            code.textContent = '';
        }
        host?.querySelectorAll('[data-td-ddgrid-row]').forEach((row) => {
            row.classList.remove('is-on');
            row.setAttribute('aria-selected', 'false');
        });
        ddClear.hidden = true;
        host?.querySelector('.td-select__trigger')?.classList.remove('has-clear');
        return true;
    }

    const ddOpen = target.closest('[data-td-ddgrid-open]');
    if (ddOpen instanceof HTMLElement && !target.closest('[data-td-ddgrid-clear]')) {
        const host = ddOpen.closest('td-ddgrid');
        const panel = host?.querySelector<HTMLElement>('[data-td-ddgrid-panel]');
        if (panel) {
            const next = panel.hidden;
            document.querySelectorAll<HTMLElement>('[data-td-ddgrid-panel]').forEach((open) => {
                open.hidden = true;
            });
            panel.hidden = !next;
            ddOpen.setAttribute('aria-expanded', String(next));
        }
        return true;
    }

    const ddRow = target.closest('[data-td-ddgrid-row]');
    if (ddRow instanceof HTMLElement) {
        const host = ddRow.closest('td-ddgrid');
        const value = host?.querySelector<HTMLInputElement>('[data-td-ddgrid-value]');
        const text = host?.querySelector('[data-td-ddgrid-text]');
        if (value) {
            value.value = ddRow.dataset.tdDdgridRow ?? '';
        }
        if (text) {
            text.textContent = ddRow.dataset.label ?? '';
            text.classList.remove('is-placeholder');
        }
        const code = host?.querySelector('[data-td-ddgrid-code]');
        if (code) {
            code.textContent = ddRow.dataset.code ?? '';
        }
        host?.querySelectorAll('[data-td-ddgrid-row]').forEach((row) => {
            const on = row === ddRow;
            row.classList.toggle('is-on', on);
            row.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        host?.querySelector<HTMLElement>('[data-td-ddgrid-panel]')?.setAttribute('hidden', '');
        host?.querySelector('[data-td-ddgrid-open]')?.setAttribute('aria-expanded', 'false');
        const clear = host?.querySelector<HTMLButtonElement>('[data-td-ddgrid-clear]');
        if (clear) {
            clear.hidden = false;
        }
        host?.querySelector('.td-select__trigger')?.classList.add('has-clear');
        return true;
    }

    const mdWrap = target.closest('[data-td-md]');
    if (mdWrap instanceof HTMLButtonElement) {
        wrapMarkdown(mdWrap.closest('td-markdown'), mdWrap.dataset.tdMd ?? '');
        return true;
    }

    const mdMode = target.closest('[data-td-md-mode]');
    if (mdMode instanceof HTMLButtonElement) {
        const host = mdMode.closest('td-markdown');
        if (host) {
            host.dataset.mode = mdMode.dataset.tdMdMode ?? 'split';
            host.querySelectorAll<HTMLButtonElement>('[data-td-md-mode]').forEach((button) => {
                button.setAttribute('aria-pressed', String(button === mdMode));
            });
        }
        return true;
    }

    const tsPreset = target.closest('[data-td-ts-preset]');
    if (tsPreset instanceof HTMLButtonElement) {
        applyTimeSpan(tsPreset.closest('td-timespan'), Number(tsPreset.dataset.tdTsPreset ?? 0));
        return true;
    }

    const knobStep = target.closest('[data-td-knob-step]');
    if (knobStep instanceof HTMLButtonElement) {
        const host = knobStep.closest('td-knob');
        if (host instanceof HTMLElement) {
            const step = Number(host.dataset.step ?? 1) * Number(knobStep.dataset.tdKnobStep ?? 1);
            syncKnob(host, Number(host.dataset.value ?? 0) + step);
        }
        return true;
    }

    const speech = target.closest('[data-td-speech]');
    if (speech instanceof HTMLButtonElement) {
        startSpeech(speech);
        return true;
    }

    const tip = target.closest('[data-td-ai-tip]');
    if (tip instanceof HTMLButtonElement) {
        const form = tip.closest('td-aichat')?.querySelector<HTMLFormElement>('[data-td-ai-form]');
        const input = form?.querySelector('input');
        if (input && form) {
            input.value = tip.textContent ?? '';
            form.requestSubmit();
        }
        return true;
    }

    return false;
}

export function handleLayoutInput(target: EventTarget | null): void {
    if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement)) {
        return;
    }

    if (target.matches('[data-td-md-source]')) {
        renderMarkdown(target.closest('td-markdown'), target.value);
        return;
    }

    if (target.matches('[data-td-ts]')) {
        syncTimeSpan(target.closest('td-timespan'));
        return;
    }

    if (target.matches('[data-td-ddgrid-q]')) {
        const host = target.closest('td-ddgrid');
        if (host instanceof HTMLElement) {
            host.dataset.page = '1';
            host.dataset.query = target.value;
            syncDdGrid(host);
        }
        return;
    }

    if (target.matches('[data-td-menuapp-q]')) {
        filterMenu(target.closest('td-menuapp'), target.value);
        const shellQuery = target.closest('td-layout')?.querySelector<HTMLInputElement>('[data-td-shell-q]');
        if (shellQuery && shellQuery.value !== target.value) {
            shellQuery.value = target.value;
        }
        return;
    }

    if (target.matches('[data-td-shell-q]')) {
        const shell = target.closest('td-layout');
        const menu = shell?.querySelector('td-menuapp');
        const inner = menu?.querySelector<HTMLInputElement>('[data-td-menuapp-q]');
        if (inner) {
            inner.value = target.value;
        }
        filterMenu(menu ?? null, target.value);
        if (target.value && shell instanceof HTMLElement && shell.dataset.collapsed === 'true') {
            shell.dataset.collapsed = 'false';
            shell.querySelector('[data-td-layout-toggle]')?.setAttribute('aria-expanded', 'true');
        }
        return;
    }

    if (target.matches('[data-td-menuapp-json]')) {
        applyMenuJson(target.closest('td-menuapp'), target.value);
        return;
    }

    if (target.matches('[data-td-row-width]')) {
        const stage = target.closest('[data-td-row-playground]')?.querySelector<HTMLElement>('[data-td-row-stage]');
        if (stage) {
            stage.style.width = `${target.value}px`;
            stage.style.maxWidth = `${target.value}px`;
        }
        target.setAttribute('aria-valuenow', target.value);
        return;
    }

    if (target.matches('[data-td-toolbar-q]')) {
        const status = document.querySelector('[data-td-toolbar-status]');
        if (status) {
            status.textContent = target.value.trim()
                ? `Buscar: ${target.value.trim()}`
                : 'Vista: Lista';
        }
    }
}

export function handleLayoutKey(event: KeyboardEvent): void {
    const navTarget = event.target instanceof HTMLElement ? event.target.closest('[data-td-navmenu]') : null;
    if (navTarget instanceof HTMLElement && ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'Escape'].includes(event.key)) {
        const buttons = [...navTarget.querySelectorAll<HTMLElement>('.td-navmenu__bar .td-navmenu__btn')];
        const current = buttons.findIndex((button) => button === document.activeElement || button.getAttribute('aria-expanded') === 'true');
        if (event.key === 'Escape') {
            closeNav(navTarget);
            buttons[Math.max(current, 0)]?.focus();
            return;
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            const next = buttons[(Math.max(current, 0) + (event.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length];
            if (next instanceof HTMLButtonElement && next.hasAttribute('data-td-nav-open')) {
                openNav(next, true);
            } else {
                closeNav(navTarget);
            }
            next?.focus();
            return;
        }
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            const button = buttons[Math.max(current, 0)];
            if (button instanceof HTMLButtonElement && button.hasAttribute('data-td-nav-open')) {
                openNav(button, true);
                button.parentElement?.querySelector<HTMLElement>('a')?.focus();
            }
        }
        return;
    }

    if (event.key === '/' && event.target instanceof HTMLElement && event.target.closest('td-menuapp') && !event.target.matches('input, textarea')) {
        event.preventDefault();
        event.target.closest('td-menuapp')?.querySelector<HTMLInputElement>('[data-td-menuapp-q]')?.focus();
        return;
    }

    if (event.key === 'Escape' && event.target instanceof HTMLInputElement && event.target.matches('[data-td-menuapp-q]')) {
        event.target.value = '';
        filterMenu(event.target.closest('td-menuapp'), '');
        const shellQuery = event.target.closest('td-layout')?.querySelector<HTMLInputElement>('[data-td-shell-q]');
        if (shellQuery) {
            shellQuery.value = '';
        }
        return;
    }

    if (event.key === 'Escape' && event.target instanceof HTMLElement && event.target.closest('td-layout.td-appshell--menu') && !event.target.matches('input, textarea')) {
        const shell = event.target.closest('td-layout');
        if (shell instanceof HTMLElement && shell.dataset.collapsed !== 'true') {
            event.preventDefault();
            shell.dataset.collapsed = 'true';
            shell.querySelector('[data-td-layout-toggle]')?.setAttribute('aria-expanded', 'false');
        }
        return;
    }

    const menuTarget = event.target instanceof HTMLElement ? event.target.closest('[data-td-menu-row]') : null;
    if (menuTarget instanceof HTMLElement && ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Enter'].includes(event.key)) {
        const rows = [...(menuTarget.closest('td-menuapp')?.querySelectorAll<HTMLElement>('[data-td-menu-row]:not([hidden])') ?? [])];
        const index = rows.indexOf(menuTarget);
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const next = rows[index + (event.key === 'ArrowDown' ? 1 : -1)];
            next?.focus();
        }
        if (event.key === 'ArrowRight' || event.key === 'Enter') {
            event.preventDefault();
            toggleMenuRow(menuTarget, event.key === 'Enter');
        }
        if (event.key === 'ArrowLeft' && menuTarget.getAttribute('aria-expanded') === 'true') {
            event.preventDefault();
            toggleMenuRow(menuTarget, false);
        }
        return;
    }

    const ddTrigger = event.target instanceof Element ? event.target.closest('[data-td-ddgrid-open]') : null;
    if (ddTrigger instanceof HTMLElement && (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown')) {
        const panel = ddTrigger.closest('td-ddgrid')?.querySelector<HTMLElement>('[data-td-ddgrid-panel]');
        if (panel?.hidden !== false) {
            event.preventDefault();
            ddTrigger.click();
            return;
        }
    }

    const gridHost = event.target instanceof Element ? event.target.closest('td-ddgrid') : null;
    if (gridHost && gridHost.querySelector('[data-td-ddgrid-panel]')?.hidden === false && ['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
        const rows = [...gridHost.querySelectorAll<HTMLElement>('[data-td-ddgrid-row]:not([hidden])')];
        const current = rows.findIndex((row) => row.classList.contains('is-active') || row.classList.contains('is-on'));
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const next = rows[Math.max(0, current + (event.key === 'ArrowDown' ? 1 : -1))] ?? rows[0];
            rows.forEach((row) => row.classList.toggle('is-active', row === next));
            next?.scrollIntoView({ block: 'nearest' });
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            (rows.find((row) => row.classList.contains('is-active')) ?? rows[Math.max(current, 0)])?.click();
        }
        return;
    }

    if (event.key === 'Escape') {
        closePopups();
        document.querySelectorAll<HTMLElement>('[data-td-ddgrid-panel], .td-navmenu__panel').forEach((panel) => {
            panel.hidden = true;
        });
        document.querySelectorAll('[data-td-ddgrid-open], [data-td-nav-open]').forEach((node) => {
            node.setAttribute('aria-expanded', 'false');
        });
    }

    const card = event.target instanceof Element ? event.target.closest('[data-td-drop-card]') : null;
    if (card instanceof HTMLElement && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault();
        const board = card.closest('td-dropzone');
        const zones = [...(board?.querySelectorAll<HTMLElement>('[data-td-drop-zone]') ?? [])];
        const current = card.closest('[data-td-drop-zone]');
        const index = zones.indexOf(current as HTMLElement);
        const next = zones[index + (event.key === 'ArrowRight' ? 1 : -1)];
        next?.querySelector('.td-dropboard__list')?.append(card);
        card.focus();
    }

    const knob = event.target instanceof Element ? event.target.closest('[data-td-knob]') : null;
    if (knob && event.target instanceof HTMLElement) {
        const host = knob.closest('td-knob');
        if (host instanceof HTMLElement && host.dataset.readonly !== 'true') {
            const step = Number(host.dataset.step ?? 1);
            if (event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'PageUp') {
                event.preventDefault();
                syncKnob(host, Number(host.dataset.value ?? 0) + (event.key === 'PageUp' ? step * 5 : step));
            }
            if (event.key === 'ArrowLeft' || event.key === 'ArrowDown' || event.key === 'PageDown') {
                event.preventDefault();
                syncKnob(host, Number(host.dataset.value ?? 0) - (event.key === 'PageDown' ? step * 5 : step));
            }
            if (event.key === 'Home') {
                event.preventDefault();
                syncKnob(host, Number(host.dataset.min ?? 0));
            }
            if (event.key === 'End') {
                event.preventDefault();
                syncKnob(host, Number(host.dataset.max ?? 100));
            }
        }
    }
}

export function bindLayoutPointer(): void {
    document.addEventListener('pointerdown', (event) => {
        const handle = event.target instanceof Element ? event.target.closest('[data-td-split-handle]') : null;
        if (handle instanceof HTMLElement && event instanceof PointerEvent) {
            event.preventDefault();
            startSplit(handle, event);
        }

        const knob = event.target instanceof Element ? event.target.closest('[data-td-knob]') : null;
        if (knob instanceof HTMLElement && event instanceof PointerEvent) {
            const host = knob.closest('td-knob');
            if (host instanceof HTMLElement && host.dataset.readonly !== 'true' && !host.classList.contains('is-off')) {
                event.preventDefault();
                const move = (pointer: PointerEvent) => setKnobFromPointer(host, knob, pointer);
                const stop = () => {
                    window.removeEventListener('pointermove', move);
                    window.removeEventListener('pointerup', stop);
                };
                move(event);
                window.addEventListener('pointermove', move);
                window.addEventListener('pointerup', stop);
            }
        }
    });

    document.addEventListener('dragstart', (event) => {
        const card = event.target instanceof Element ? event.target.closest('[data-td-drop-card], [data-td-tile]') : null;
        if (card instanceof HTMLElement) {
            event.dataTransfer?.setData('text/plain', card.dataset.tdDropCard ?? card.dataset.tdTile ?? '');
            card.classList.add('is-drag');
        }
    });

    document.addEventListener('dragend', (event) => {
        if (event.target instanceof Element) {
            event.target.closest('[data-td-drop-card], [data-td-tile]')?.classList.remove('is-drag');
        }
    });

    document.addEventListener('dragover', (event) => {
        if (event.target instanceof Element && event.target.closest('[data-td-drop-zone], td-tiles')) {
            event.preventDefault();
        }
    });

    document.addEventListener('drop', (event) => {
        const zone = event.target instanceof Element ? event.target.closest('[data-td-drop-zone]') : null;
        const cardId = event.dataTransfer?.getData('text/plain');
        if (zone && cardId) {
            event.preventDefault();
            const card = document.querySelector(`[data-td-drop-card="${CSS.escape(cardId)}"]`);
            zone.querySelector('.td-dropboard__list')?.append(card ?? '');
        }

        const tileHost = event.target instanceof Element ? event.target.closest('td-tiles') : null;
        const over = event.target instanceof Element ? event.target.closest('[data-td-tile]') : null;
        if (tileHost && over instanceof HTMLElement && cardId) {
            event.preventDefault();
            const tile = tileHost.querySelector(`[data-td-tile="${CSS.escape(cardId)}"]`);
            if (tile && tile !== over) {
                over.before(tile);
            }
        }
    });
}

export function handleLayoutSubmit(event: Event): boolean {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) {
        return false;
    }

    if (form.matches('[data-td-chat-form]')) {
        event.preventDefault();
        const input = form.querySelector('input');
        const log = form.closest('td-chat')?.querySelector('[data-td-chat-log]');
        const text = input?.value.trim() ?? '';
        if (text && log && input) {
            log.append(bubble(text, true));
            input.value = '';
            window.setTimeout(() => log.append(bubble('Recibido. Un asesor te confirma el stock.', false)), 700);
        }
        return true;
    }

    if (form.matches('[data-td-ai-form]')) {
        event.preventDefault();
        const input = form.querySelector('input');
        const host = form.closest('td-aichat');
        const log = host?.querySelector('[data-td-chat-log]');
        const text = input?.value.trim() ?? '';
        if (text && log && input && host) {
            log.append(bubble(text, true));
            input.value = '';
            const reply = answerCatalog(text, host.dataset.catalog ?? '');
            const incoming = bubble('', false);
            log.append(incoming);
            streamText(incoming.querySelector('p'), reply);
        }
        return true;
    }

    return false;
}

function closePopups(): void {
    document.querySelectorAll<HTMLElement>('[data-td-popup-panel]').forEach((panel) => {
        panel.hidden = true;
    });
    document.querySelectorAll('[data-td-popup-open]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
}

function startSplit(handle: HTMLElement, event: PointerEvent): void {
    const host = handle.closest('td-splitter');
    const pane = handle.previousElementSibling;
    if (!(host instanceof HTMLElement) || !(pane instanceof HTMLElement)) {
        return;
    }

    const vertical = host.dataset.orientation === 'vertical';
    const start = vertical ? event.clientY : event.clientX;
    const size = vertical ? pane.getBoundingClientRect().height : pane.getBoundingClientRect().width;
    const move = (pointer: PointerEvent) => {
        const delta = (vertical ? pointer.clientY : pointer.clientX) - start;
        pane.style.flex = `0 0 ${Math.max(80, size + delta)}px`;
    };
    const stop = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', stop);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
}

function setKnobFromPointer(host: HTMLElement, dial: HTMLElement, event: PointerEvent): void {
    const box = dial.getBoundingClientRect();
    const angle = Math.atan2(event.clientY - (box.top + box.height / 2), event.clientX - (box.left + box.width / 2));
    const turns = (angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
    const min = Number(host.dataset.min ?? 0);
    const max = Number(host.dataset.max ?? 100);
    syncKnob(host, min + (turns / (Math.PI * 1.75)) * (max - min));
}

function syncKnob(host: HTMLElement, raw: number): void {
    const min = Number(host.dataset.min ?? 0);
    const max = Number(host.dataset.max ?? 100);
    const step = Number(host.dataset.step ?? 1) || 1;
    const value = Math.min(max, Math.max(min, Math.round(raw / step) * step));
    host.dataset.value = String(value);
    const hidden = host.querySelector<HTMLInputElement>('[data-td-knob-value]');
    if (hidden) {
        hidden.value = String(value);
    }
    const out = host.querySelector('[data-td-knob-out]');
    if (out) {
        out.textContent = `${value.toFixed(step < 1 ? 1 : 0)} ${host.dataset.suffix ?? ''}`.trim();
    }
    const arc = host.querySelector<SVGCircleElement>('[data-td-knob-arc]');
    if (arc) {
        const length = 2 * Math.PI * 40;
        const ratio = (value - min) / (max - min || 1);
        arc.style.strokeDasharray = `${length}`;
        arc.style.strokeDashoffset = `${length * (1 - ratio * 0.75)}`;
    }
    host.querySelector('[data-td-knob]')?.setAttribute('aria-valuenow', String(value));
}

function applyTimeSpan(host: Element | null, minutes: number): void {
    if (!host) {
        return;
    }

    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;
    const day = host.querySelector<HTMLInputElement>('[data-td-ts="d"]');
    const hour = host.querySelector<HTMLInputElement>('[data-td-ts="h"]');
    const minute = host.querySelector<HTMLInputElement>('[data-td-ts="m"]');
    if (day) {
        day.value = String(days);
    }
    if (hour) {
        hour.value = String(hours);
    }
    if (minute) {
        minute.value = String(mins);
    }
    syncTimeSpan(host);
}

function syncTimeSpan(host: Element | null): void {
    if (!host) {
        return;
    }

    const days = Number(host.querySelector<HTMLInputElement>('[data-td-ts="d"]')?.value ?? 0);
    const hours = Number(host.querySelector<HTMLInputElement>('[data-td-ts="h"]')?.value ?? 0);
    const minutes = Number(host.querySelector<HTMLInputElement>('[data-td-ts="m"]')?.value ?? 0);
    const pad = (value: number) => String(value).padStart(2, '0');
    const iso = `${days}.${pad(hours)}:${pad(minutes)}:00`;
    const hidden = host.querySelector<HTMLInputElement>('[data-td-ts-iso]');
    const out = host.querySelector('[data-td-ts-out]');
    if (hidden) {
        hidden.value = iso;
    }
    if (out) {
        out.textContent = iso;
    }
}

function wrapMarkdown(host: Element | null, mark: string): void {
    const area = host?.querySelector<HTMLTextAreaElement>('[data-td-md-source]');
    if (!area) {
        return;
    }

    const start = area.selectionStart;
    const end = area.selectionEnd;
    const selected = area.value.slice(start, end) || 'texto';
    const next = mark === '# ' || mark === '- '
        ? `${mark}${selected}`
        : `${mark}${selected}${mark}`;
    area.setRangeText(next, start, end, 'end');
    renderMarkdown(host, area.value);
    area.focus();
}

function renderMarkdown(host: Element | null, value: string): void {
    const preview = host?.querySelector('[data-td-md-preview]');
    if (!(preview instanceof HTMLElement)) {
        return;
    }

    preview.innerHTML = value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/\n{2,}/g, '</p><p>')
        .replace(/^(?!<h|<ul|<li|<p)(.+)$/gm, '<p>$1</p>');
}

function startSpeech(button: HTMLButtonElement): void {
    const label = button.querySelector('[data-td-speech-label]');
    const note = button.parentElement?.querySelector<HTMLElement>('[data-td-speech-note]');
    const setLabel = (text: string) => {
        if (label) {
            label.textContent = text;
        }
    };
    const active = (button as HTMLButtonElement & { tdSpeech?: SpeechLike }).tdSpeech;
    if (active) {
        active.stop();
        return;
    }

    const SpeechCtor = (window as unknown as { webkitSpeechRecognition?: new () => SpeechLike; SpeechRecognition?: new () => SpeechLike }).webkitSpeechRecognition
        ?? (window as unknown as { SpeechRecognition?: new () => SpeechLike }).SpeechRecognition;
    if (!SpeechCtor) {
        setLabel('Dictar');
        if (note) {
            note.hidden = false;
            note.textContent = 'Dictado no disponible en este navegador.';
        }
        return;
    }

    const recognition = new SpeechCtor();
    (button as HTMLButtonElement & { tdSpeech?: SpeechLike }).tdSpeech = recognition;
    recognition.lang = button.dataset.lang ?? 'es-CL';
    recognition.interimResults = true;
    recognition.continuous = button.dataset.continuous === 'true';
    const field = document.querySelector<HTMLTextAreaElement | HTMLInputElement>(`[name="${CSS.escape(button.dataset.target ?? '')}"]`);
    button.setAttribute('aria-pressed', 'true');
    setLabel('Escuchando…');
    recognition.onresult = (event) => {
        if (field) {
            const results = event.results as ArrayLike<ArrayLike<{ transcript: string }>>;
            field.value = [...Array.from({ length: results.length }, (_, index) => results[index]?.[0]?.transcript ?? '')].join(' ');
            field.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };
    const finish = () => {
        button.setAttribute('aria-pressed', 'false');
        setLabel('Dictar');
        delete (button as HTMLButtonElement & { tdSpeech?: SpeechLike }).tdSpeech;
    };
    recognition.onend = finish;
    recognition.onerror = () => {
        if (note) {
            note.hidden = false;
            note.textContent = 'No se pudo usar el micrófono.';
        }
        finish();
    };
    try {
        recognition.start();
    } catch {
        if (note) {
            note.hidden = false;
            note.textContent = 'Dictado no disponible en este navegador.';
        }
        finish();
    }
}

function closeNav(nav: Element): void {
    nav.querySelectorAll<HTMLElement>('.td-navmenu__panel').forEach((panel) => {
        panel.hidden = true;
    });
    nav.querySelectorAll('[data-td-nav-open]').forEach((node) => node.setAttribute('aria-expanded', 'false'));
}

function openNav(button: HTMLButtonElement, open: boolean): void {
    const item = button.closest('.td-navmenu__item');
    const panel = item?.querySelector<HTMLElement>('.td-navmenu__panel');
    document.querySelectorAll<HTMLElement>('.td-navmenu__panel').forEach((node) => {
        node.hidden = true;
    });
    document.querySelectorAll('[data-td-nav-open]').forEach((node) => node.setAttribute('aria-expanded', 'false'));
    if (panel) {
        panel.hidden = !open;
    }
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function syncShell(row: HTMLElement): void {
    const shell = row.closest('td-layout.td-appshell--menu');
    if (!(shell instanceof HTMLElement)) {
        return;
    }
    const names: string[] = [];
    let current: HTMLElement | null = row;
    const host = row.closest('td-menuapp');
    while (current) {
        names.unshift(current.dataset.label ?? '');
        const parentId = current.dataset.parent ?? '';
        current = parentId ? host?.querySelector<HTMLElement>(`[data-td-menu-row="${CSS.escape(parentId)}"]`) ?? null : null;
    }
    const title = shell.querySelector('[data-td-shell-title]');
    const crumb = shell.querySelector('[data-td-shell-crumb]');
    const path = shell.querySelector('[data-td-shell-path]');
    if (title) {
        title.textContent = row.dataset.label ?? '';
    }
    if (crumb) {
        crumb.textContent = names.filter(Boolean).join(' / ');
    }
    if (path) {
        path.textContent = row.dataset.href ? `Ruta activa: ${row.dataset.href}` : 'Ruta activa';
    }
    if (shell.dataset.mode === 'float') {
        shell.dataset.collapsed = 'true';
        shell.querySelector('[data-td-layout-toggle]')?.setAttribute('aria-expanded', 'false');
    }
}

function toggleMenuRow(row: HTMLElement, follow: boolean): void {
    const host = row.closest('td-menuapp');
    const shell = row.closest('td-layout.td-appshell--menu');
    if (shell instanceof HTMLElement && shell.dataset.mode !== 'float' && shell.dataset.collapsed === 'true' && row.getAttribute('aria-expanded') !== null) {
        shell.dataset.collapsed = 'false';
        shell.querySelector('[data-td-layout-toggle]')?.setAttribute('aria-expanded', 'true');
    }
    if (row.getAttribute('aria-expanded') !== null) {
        const open = follow ? row.getAttribute('aria-expanded') !== 'true' : false;
        row.setAttribute('aria-expanded', open ? 'true' : 'false');
        paintMenu(host);
        if (host?.dataset.remember === 'true') {
            const ids = [...(host.querySelectorAll<HTMLElement>('[aria-expanded="true"]') ?? [])].map((node) => node.dataset.tdMenuRow ?? '');
            try {
                localStorage.setItem('td-menuapp', JSON.stringify(ids));
            } catch {
                // The menu still opens for this view.
            }
        }
        return;
    }

    const href = row.dataset.href ?? '';
    const hostEl = row.closest('td-menuapp');
    hostEl?.querySelectorAll('[data-td-menu-row]').forEach((node) => node.classList.remove('is-on'));
    row.classList.add('is-on');
    const path = hostEl?.querySelector('[data-td-menuapp-path]');
    if (path) {
        path.textContent = href ? `Ruta activa: ${href}` : 'Ruta activa';
    }
    syncShell(row);
    if (follow && href && hostEl?.dataset.stay !== 'true') {
        window.location.href = href;
    }
}

function paintMenu(host: Element | null): void {
    if (!host) {
        return;
    }
    const rows = [...host.querySelectorAll<HTMLElement>('[data-td-menu-row]')];
    const open = new Set(rows.filter((row) => row.getAttribute('aria-expanded') === 'true').map((row) => row.dataset.tdMenuRow ?? ''));
    const query = (host.querySelector<HTMLInputElement>('[data-td-menuapp-q]')?.value ?? '').trim().toLocaleLowerCase();
    const match = new Set<string>();
    if (query) {
        rows.forEach((row) => {
            if ((row.dataset.label ?? '').toLocaleLowerCase().includes(query)) {
                let parent = row.dataset.parent ?? '';
                match.add(row.dataset.tdMenuRow ?? '');
                while (parent) {
                    match.add(parent);
                    open.add(parent);
                    parent = rows.find((item) => item.dataset.tdMenuRow === parent)?.dataset.parent ?? '';
                }
            }
        });
    }
    rows.forEach((row) => {
        const parent = row.dataset.parent;
        const parentOpen = !parent || open.has(parent);
        const hit = !query || match.has(row.dataset.tdMenuRow ?? '');
        row.hidden = !parentOpen || !hit;
        if (query && open.has(row.dataset.tdMenuRow ?? '') && row.getAttribute('aria-expanded') !== null) {
            row.setAttribute('aria-expanded', 'true');
        }
    });
    const empty = host.querySelector<HTMLElement>('[data-td-menuapp-empty]');
    if (empty) {
        empty.hidden = rows.some((row) => !row.hidden);
    }
}

function filterMenu(host: Element | null, _query: string): void {
    paintMenu(host);
}

function applyMenuJson(host: Element | null, text: string): void {
    if (!host) {
        return;
    }
    const state = host.querySelector('[data-td-menuapp-json-state]');
    let data: MenuNode[];
    try {
        data = JSON.parse(text) as MenuNode[];
        if (!Array.isArray(data)) {
            throw new Error('array');
        }
    } catch {
        state?.classList.add('td-menuapp__json-bad');
        if (state) {
            state.textContent = 'JSON inválido · se muestra la última versión válida';
        }
        return;
    }

    state?.classList.remove('td-menuapp__json-bad');
    if (state) {
        state.textContent = 'JSON válido';
    }
    const tree = host.querySelector('.td-menuapp__tree');
    const empty = tree?.querySelector('[data-td-menuapp-empty]');
    tree?.querySelectorAll('[data-td-menu-row]').forEach((row) => row.remove());
    const rows = flattenMenu(data, null, 0);
    rows.forEach((row, index) => {
        const node = document.createElement('div');
        node.className = 'td-menuapp__row';
        node.role = 'treeitem';
        node.dataset.tdMenuRow = row.id;
        node.dataset.parent = row.parent ?? '';
        node.dataset.depth = String(row.depth);
        node.dataset.label = row.label;
        node.dataset.href = row.path ?? '';
        node.style.setProperty('--d', String(row.depth));
        node.tabIndex = index === 0 ? 0 : -1;
        node.setAttribute('aria-level', String(row.depth + 1));
        if (row.parentNode) {
            node.setAttribute('aria-expanded', row.depth === 0 && index === 0 ? 'true' : 'false');
            node.innerHTML = '<svg class="td-menuapp__chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>';
        } else {
            node.innerHTML = '<span class="td-menuapp__dot" aria-hidden="true"></span>';
        }
        const label = document.createElement('span');
        label.textContent = row.label;
        node.append(label);
        if (row.badge) {
            const badge = document.createElement('em');
            badge.textContent = row.badge;
            node.append(badge);
        }
        empty ? tree?.insertBefore(node, empty) : tree?.append(node);
    });
    paintMenu(host);
}

function flattenMenu(items: MenuNode[], parent: string | null, depth: number): MenuFlat[] {
    const rows: MenuFlat[] = [];
    items.forEach((item, index) => {
        const id = `${parent ?? 'root'}-${index}`;
        const kids = item.options ?? item.children ?? [];
        rows.push({
            id,
            parent,
            depth,
            label: item.label ?? 'Opción',
            path: item.path,
            badge: item.badge,
            parentNode: kids.length > 0
        });
        if (kids.length) {
            rows.push(...flattenMenu(kids, id, depth + 1));
        }
    });
    return rows;
}

interface MenuNode {
    label?: string;
    path?: string;
    badge?: string;
    options?: MenuNode[];
    children?: MenuNode[];
}

interface MenuFlat {
    id: string;
    parent: string | null;
    depth: number;
    label: string;
    path?: string;
    badge?: string;
    parentNode: boolean;
}

function restoreMenu(host: HTMLElement): void {
    if (host.dataset.remember === 'true') {
        try {
            const ids = JSON.parse(localStorage.getItem('td-menuapp') ?? '[]') as string[];
            if (ids.length) {
                host.querySelectorAll<HTMLElement>('[data-td-menu-row][aria-expanded]').forEach((row) => {
                    row.setAttribute('aria-expanded', ids.includes(row.dataset.tdMenuRow ?? '') ? 'true' : 'false');
                });
            }
        } catch {
            // Keep the server expansion.
        }
    }
    paintMenu(host);
}

function syncDdGrid(host: Element): void {
    const pageSize = Number(host.getAttribute('data-page-size') ?? 8) || 8;
    const query = (host.getAttribute('data-query') ?? host.querySelector<HTMLInputElement>('[data-td-ddgrid-q]')?.value ?? '').trim().toLocaleLowerCase();
    const rows = [...host.querySelectorAll<HTMLElement>('[data-td-ddgrid-row]')];
    const matched = rows.filter((row) => !query || (row.textContent ?? '').toLocaleLowerCase().includes(query));
    const pages = Math.max(1, Math.ceil(matched.length / pageSize));
    let page = Number((host as HTMLElement).dataset.page ?? 1);
    page = Math.min(pages, Math.max(1, page));
    (host as HTMLElement).dataset.page = String(page);
    const start = (page - 1) * pageSize;
    rows.forEach((row) => {
        const index = matched.indexOf(row);
        row.hidden = index < 0 || index < start || index >= start + pageSize;
    });
    const meta = host.querySelector('[data-td-ddgrid-meta]');
    if (meta) {
        const from = matched.length === 0 ? 0 : start + 1;
        const to = Math.min(start + pageSize, matched.length);
        meta.textContent = `${from}–${to} de ${matched.length} repuestos · ↑ ↓ y Enter para elegir`;
    }
    const empty = host.querySelector<HTMLElement>('[data-td-ddgrid-empty]');
    if (empty) {
        empty.hidden = matched.length > 0;
    }
    const prev = host.querySelector<HTMLButtonElement>('[data-td-ddgrid-page="-1"]');
    const next = host.querySelector<HTMLButtonElement>('[data-td-ddgrid-page="1"]');
    if (prev) {
        prev.disabled = page <= 1;
    }
    if (next) {
        next.disabled = page >= pages;
    }
}

function observeToc(toc: HTMLElement): void {
    const ids = [...toc.querySelectorAll<HTMLAnchorElement>('[data-td-toc-link]')].map((link) => link.dataset.tdTocLink ?? '');
    const nodes = ids.map((id) => document.getElementById(id)).filter((node): node is HTMLElement => Boolean(node));
    const bar = toc.querySelector<HTMLElement>('[data-td-toc-bar]');
    const io = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
            toc.querySelectorAll('[data-td-toc-link]').forEach((link) => {
                link.classList.toggle('is-on', link.getAttribute('data-td-toc-link') === visible.target.id);
            });
            const index = ids.indexOf(visible.target.id);
            if (bar && ids.length) {
                bar.style.width = `${((index + 1) / ids.length) * 100}%`;
            }
        }
    }, { rootMargin: '-20% 0px -60% 0px', threshold: [0.2, 0.6] });
    nodes.forEach((node) => io.observe(node));
}

function bubble(text: string, mine: boolean): HTMLElement {
    const node = document.createElement('div');
    node.className = `td-chat__bubble ${mine ? 'is-out' : 'is-in'}`;
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    const time = document.createElement('time');
    time.textContent = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    node.append(paragraph, time);
    return node;
}

function streamText(target: HTMLParagraphElement | null, text: string): void {
    if (!target) {
        return;
    }

    let index = 0;
    const tick = () => {
        index += 2;
        target.textContent = text.slice(0, index);
        if (index < text.length) {
            window.setTimeout(tick, 18);
        }
    };
    tick();
}

function answerCatalog(question: string, catalog: string): string {
    const query = question.toLocaleLowerCase();
    const rows = catalog.split('\n').map((line) => line.split('|').map((part) => part.trim())).filter((parts) => parts.length >= 4);
    if (query.includes('agotado')) {
        const out = rows.filter((row) => Number(row[4] ?? 1) <= 0).map((row) => row[1]);
        return out.length ? `Agotados ahora: ${out.join(', ')}.` : 'No hay agotados en este recorte del catálogo.';
    }

    const hit = rows.find((row) => row.some((cell) => cell.toLocaleLowerCase().includes(query.replace('pastillas para ', '').replace('¿', '').replace('?', ''))));
    if (hit) {
        return `${hit[1]} (${hit[0]}). Marca ${hit[2]}. Stock ${hit[4] ?? '—'} · ${hit[5] ?? ''}.`;
    }

    return 'En este recorte del catálogo está BR-4521-AD Pastilla de freno delantera, Volvo, 42 u. en Santiago.';
}

interface SpeechLike {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    start(): void;
    stop(): void;
    onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
}
