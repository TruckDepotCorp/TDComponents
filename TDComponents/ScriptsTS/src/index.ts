import { TDButtonElement } from './components/td-button';
import { TDDataGridElement } from './components/td-data-grid';
import { TDTextBoxElement } from './components/td-textbox';
import { bindLayout, bindLayoutPointer, handleLayoutClick, handleLayoutInput, handleLayoutKey, handleLayoutSubmit } from './components/td-layout';
import { bindMedia, handleContextMenu, handleMediaClick, handleMediaInput, handleMediaKey, handleMediaPointer } from './components/td-media';
import { bindCharts } from './components/td-charts';
import { bindEcom } from './components/td-ecom';
import { bindStudio } from './components/td-studio';
import { bindExtra } from './components/td-extra';
import { bindUi, closeFloating, commitInplace, handleInplaceDblClick, handleUiClick, handleUiInput, handleUiKey } from './components/td-ui';

if (!customElements.get('td-button')) {
    customElements.define('td-button', TDButtonElement);
}

if (!customElements.get('td-data-grid')) {
    customElements.define('td-data-grid', TDDataGridElement);
}

if (!customElements.get('td-textbox')) {
    customElements.define('td-textbox', TDTextBoxElement);
}

document.addEventListener('input', (event) => {
    const host = hostFrom(event.target, 'td-textbox');
    if (host instanceof TDTextBoxElement) {
        host.handleInput();
    }

    const grid = hostFrom(event.target, 'td-data-grid');
    if (grid instanceof TDDataGridElement) {
        grid.handleInput(event.target);
    }

    handleUiInput(event.target);
    handleMediaInput(event.target);
    handleLayoutInput(event.target);
});

document.addEventListener('focusout', (event) => {
    const host = hostFrom(event.target, 'td-textbox');
    if (host instanceof TDTextBoxElement) {
        host.handleBlur();
    }
});

document.addEventListener('submit', (event) => {
    if (handleLayoutSubmit(event)) {
        return;
    }

    if (!(event.target instanceof HTMLFormElement)) {
        return;
    }

    const form = event.target;
    const submitter = event instanceof SubmitEvent ? event.submitter : null;
    const buttonHost = submitter?.closest('td-button');
    if (buttonHost instanceof TDButtonElement && buttonHost.hasAttribute('data-pending')) {
        event.preventDefault();
        event.stopPropagation();
        return;
    }

    const fields = [...form.querySelectorAll('td-textbox')].filter(
        (field): field is TDTextBoxElement => field instanceof TDTextBoxElement,
    );

    let firstInvalid: TDTextBoxElement | null = null;
    for (const field of fields) {
        if (!field.validate() && !firstInvalid) {
            firstInvalid = field;
        }
    }

    const status = form.querySelector('[data-td-form-status]');
    if (firstInvalid) {
        event.preventDefault();
        event.stopPropagation();
        if (status instanceof HTMLElement) {
            const detail = status.querySelector('[data-td-form-status-detail]');
            const message = status.getAttribute('data-status-detail')
                ?? 'Fix the highlighted fields, then try again.';
            if (detail) {
                detail.textContent = message;
            }
            status.hidden = false;
        }
        firstInvalid.focusInput();
        return;
    }

    if (status instanceof HTMLElement) {
        status.hidden = true;
    }

    if (buttonHost instanceof TDButtonElement) {
        buttonHost.beginPending();
    }
}, true);

document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
        return;
    }

    closeFloating(target);
    if (handleUiClick(target) || handleMediaClick(target) || handleLayoutClick(target)) {
        return;
    }

    const secretToggle = target.closest('[data-td-secret-toggle]');
    if (secretToggle instanceof HTMLButtonElement) {
        toggleSecret(secretToggle);
        return;
    }

    const clearSecret = target.closest('[data-td-clear-secret]');
    if (clearSecret instanceof HTMLElement) {
        const input = clearSecret.closest('form')?.querySelector('[data-td-secret-field]');
        if (input instanceof HTMLInputElement) {
            input.value = '';
            input.type = 'password';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            const toggle = input.closest('td-textbox')?.querySelector('[data-td-secret-toggle]');
            if (toggle instanceof HTMLButtonElement) {
                toggle.textContent = toggle.dataset.show ?? 'Show password';
                toggle.setAttribute('aria-pressed', 'false');
            }
            input.focus();
        }
        return;
    }

    const grid = hostFrom(target, 'td-data-grid');
    if (grid instanceof TDDataGridElement) {
        grid.handleClick(target, event);
    }

    const treeToggle = target.closest('[data-td-tree-toggle]');
    if (treeToggle instanceof HTMLButtonElement) {
        const item = treeToggle.closest('[role="treeitem"]');
        const group = item?.querySelector(':scope > [role="group"]');
        const open = treeToggle.getAttribute('aria-expanded') !== 'true';
        treeToggle.setAttribute('aria-expanded', String(open));
        item?.setAttribute('aria-expanded', String(open));
        const label = treeToggle.getAttribute('aria-label') ?? '';
        treeToggle.setAttribute('aria-label', open
            ? label.replace('Expandir', 'Contraer')
            : label.replace('Contraer', 'Expandir'));
        if (group instanceof HTMLElement) {
            group.hidden = !open;
        }
    }

    const themePick = target.closest('[data-td-theme-pick]');
    if (themePick instanceof HTMLElement) {
        applyThemeFamily(themePick.getAttribute('data-td-theme-pick') || 'modern');
        return;
    }

    const themeToggle = target.closest('[data-td-theme-toggle]');
    if (themeToggle instanceof HTMLElement) {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try {
            localStorage.setItem('td-theme', next);
        } catch {
            // The theme still changes for this page view.
        }
        syncThemeToggleLabels();
        syncThemeCards();
    }
});

document.addEventListener('change', (event) => {
    const target = event.target;
    if (target instanceof HTMLSelectElement && target.matches('[data-td-theme-select]')) {
        applyThemeFamily(target.value);
        return;
    }

    if (target instanceof HTMLSelectElement && target.matches('[data-td-cascade]')) {
        target.form?.requestSubmit();
        return;
    }

    const grid = hostFrom(target, 'td-data-grid');
    if (grid instanceof TDDataGridElement) {
        grid.handleChange(target);
    }
}, true);

function toggleSecret(toggle: HTMLButtonElement): void {
    const host = toggle.closest('td-textbox');
    const input = host?.querySelector('input');
    if (!(input instanceof HTMLInputElement)) {
        return;
    }

    const reveal = input.type === 'password';
    input.type = reveal ? 'text' : 'password';
    toggle.textContent = reveal
        ? toggle.dataset.hide ?? 'Hide password'
        : toggle.dataset.show ?? 'Show password';
    toggle.setAttribute('aria-pressed', reveal ? 'true' : 'false');
    input.focus();
}

function currentTheme(): 'dark' | 'light' {
    const explicit = document.documentElement.getAttribute('data-theme');
    if (explicit === 'dark' || explicit === 'light') {
        return explicit;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function syncThemeToggleLabels(): void {
    const action = currentTheme() === 'dark' ? 'light' : 'dark';
    document.querySelectorAll('[data-td-theme-toggle]').forEach((toggle) => {
        const label = toggle.querySelector('.td-btn__text') ?? toggle.querySelector('.td-btn__label');
        const text = toggle.getAttribute(action === 'dark' ? 'data-label-dark' : 'data-label-light');
        if (label && text) {
            label.textContent = text;
        }
    });
}

const themeFamilies = ['modern', 'material', 'expressive', 'fluent'] as const;
const themeFamilyNames: Record<(typeof themeFamilies)[number], string> = {
    modern: 'Modern',
    material: 'Material',
    expressive: 'Material Expressive',
    fluent: 'Fluent 3',
};

function applyThemeFamily(value: string): void {
    const family = themeFamilies.includes(value as (typeof themeFamilies)[number])
        ? value as (typeof themeFamilies)[number]
        : 'modern';
    if (family === 'modern') {
        document.documentElement.removeAttribute('data-td-theme');
    } else {
        document.documentElement.setAttribute('data-td-theme', family);
    }

    try {
        localStorage.setItem('td-theme-family', family);
    } catch {
        // The family still changes for this page view.
    }

    document.querySelectorAll<HTMLSelectElement>('[data-td-theme-select]').forEach((select) => {
        select.value = family;
    });
    document.querySelectorAll('.td-theme-name').forEach((name) => {
        name.textContent = themeFamilyNames[family];
    });
    syncThemeCards();
}

function syncThemeCards(): void {
    const family = document.documentElement.getAttribute('data-td-theme') ?? 'modern';
    const scheme = currentTheme();
    document.querySelectorAll<HTMLElement>('[data-td-theme-pick]').forEach((card) => {
        card.setAttribute('aria-pressed', String((card.getAttribute('data-td-theme-pick') || 'modern') === family));
        card.setAttribute('data-theme', scheme);
    });
}

function syncThemeFamily(): void {
    applyThemeFamily(document.documentElement.getAttribute('data-td-theme') ?? 'modern');
}

function hostFrom(target: EventTarget | null, name: string): Element | null {
    if (!(target instanceof Element)) {
        return null;
    }

    return target.closest(name);
}

document.addEventListener('dblclick', (event) => {
    if (event.target instanceof Element) {
        handleInplaceDblClick(event.target);
    }
});

document.addEventListener('focusout', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
        return;
    }

    const host = target.closest('td-inplace');
    if (host?.getAttribute('data-mode') !== 'auto' || !target.closest('[data-td-inplace-edit]')) {
        return;
    }

    const next = event.relatedTarget;
    if (next instanceof Node && host.contains(next)) {
        return;
    }

    window.setTimeout(() => {
        if (!host.querySelector('[data-td-inplace-edit]')?.hasAttribute('hidden')) {
            commitInplace(host, true);
        }
    }, 0);
});

document.addEventListener('keydown', (event) => {
    handleUiKey(event);
    handleMediaKey(event);
    handleLayoutKey(event);
});

document.addEventListener('mousedown', (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest('[data-td-rte-cmd],[data-td-rte-color],[data-td-rte-source],[data-td-rte-link]')) {
        event.preventDefault();
    }
});

document.addEventListener('pointerdown', handleMediaPointer);
document.addEventListener('pointermove', handleMediaPointer);
document.addEventListener('pointerup', handleMediaPointer);
document.addEventListener('contextmenu', handleContextMenu);

function bootPage(): void {
    bindUi();
    bindMedia();
    bindLayout();
    bindCharts();
    bindExtra();
    bindEcom();
    bindStudio();
    syncThemeToggleLabels();
    syncThemeFamily();
}

bootPage();
bindLayoutPointer();

const blazor = (window as Window & { Blazor?: { addEventListener?: (name: string, handler: () => void) => void } }).Blazor;
blazor?.addEventListener?.('enhancedload', bootPage);

const hostWatch = new MutationObserver((records) => {
    for (const record of records) {
        const ecomHost = record.target instanceof HTMLElement && record.target.matches('td-ecom') ? record.target : null;
        if (ecomHost && (record.type === 'attributes' || ecomHost.childElementCount === 0)) {
            bindEcom(ecomHost.parentElement ?? document);
        }
        for (const node of record.addedNodes) {
            if (!(node instanceof Element)) continue;
            const studio = node.matches('td-studio') || node.querySelector('td-studio');
            const ecom = node.matches('td-ecom') || node.querySelector('td-ecom');
            if (studio) bindStudio(node.matches('td-studio') ? node.parentElement ?? document : node);
            if (ecom) bindEcom(node.matches('td-ecom') ? node.parentElement ?? document : node);
        }
    }
});
hostWatch.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-kind'] });
