import { TDTextBoxElement } from './td-textbox';

interface FieldProblem {
    key: string;
    label: string;
    message: string;
    control: HTMLElement;
}

let pendingLeave: { host: HTMLElement; href: string } | null = null;

export function bindEditForms(root: ParentNode = document): void {
    root.querySelectorAll<HTMLElement>('td-editform').forEach((host) => {
        host.removeAttribute('data-pending');
        host.removeAttribute('aria-busy');
        const form = host.querySelector('form');
        if (!(form instanceof HTMLFormElement)) {
            return;
        }

        const returned = collectEditFormProblems(form, false);
        if (returned.length > 0) {
            showEditFormProblems(host, returned);
        } else {
            const status = host.querySelector<HTMLElement>('[data-td-editform-status]');
            if (status?.dataset.tone === 'pending') {
                hideEditFormStatus(host);
            }
        }

        if (host.dataset.autofocus === 'true' && host.dataset.focused !== 'true') {
            host.dataset.focused = 'true';
            focusFirstEmpty(form);
        }
    });
}

export function isEditFormBusy(form: HTMLFormElement): boolean {
    const host = form.closest('td-editform');
    return host instanceof HTMLElement && host.dataset.guard !== 'false' && host.hasAttribute('data-pending');
}

export function showEditFormProblems(host: HTMLElement, problems: FieldProblem[]): void {
    if (host.dataset.summary === 'false') {
        return;
    }

    const status = host.querySelector<HTMLElement>('[data-td-editform-status]');
    const title = host.querySelector<HTMLElement>('[data-td-editform-status-title]');
    const detail = host.querySelector<HTMLElement>('[data-td-editform-status-detail]');
    const list = host.querySelector<HTMLElement>('[data-td-editform-errors]');
    if (!status || !title || !detail || !list) {
        return;
    }

    title.textContent = host.dataset.invalidTitle || 'No se pudo guardar';
    detail.textContent = host.dataset.invalidDetail || 'Revisa los campos marcados. Lo escrito sigue en el formulario.';
    list.replaceChildren();
    for (const problem of problems) {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.tdEditformJump = problem.key;
        const label = document.createElement('span');
        label.className = 'td-editform__error-label';
        label.textContent = problem.label;
        const message = document.createElement('span');
        message.className = 'td-editform__error-msg';
        message.textContent = problem.message;
        button.append(label, message);
        item.append(button);
        list.append(item);
    }

    status.dataset.tone = 'invalid';
    status.setAttribute('role', 'alert');
    status.hidden = false;
}

export function hideEditFormStatus(host: HTMLElement): void {
    const status = host.querySelector<HTMLElement>('[data-td-editform-status]');
    const list = host.querySelector<HTMLElement>('[data-td-editform-errors]');
    if (!status) {
        return;
    }

    status.hidden = true;
    list?.replaceChildren();
}

export function armEditFormPending(host: HTMLElement): void {
    if (host.dataset.guard === 'false') {
        return;
    }

    host.setAttribute('data-pending', '');
    host.setAttribute('aria-busy', 'true');
    const status = host.querySelector<HTMLElement>('[data-td-editform-status]');
    const title = host.querySelector<HTMLElement>('[data-td-editform-status-title]');
    const detail = host.querySelector<HTMLElement>('[data-td-editform-status-detail]');
    const list = host.querySelector<HTMLElement>('[data-td-editform-errors]');
    if (!status || !title || !detail) {
        return;
    }

    title.textContent = host.dataset.pendingText || 'Guardando. Espera un momento.';
    detail.textContent = 'Los datos siguen en el formulario.';
    list?.replaceChildren();
    status.dataset.tone = 'pending';
    status.setAttribute('role', 'status');
    status.hidden = false;
}

export function focusEditFormProblem(problem: FieldProblem): void {
    const box = problem.control.closest('td-textbox');
    if (box instanceof TDTextBoxElement) {
        box.focusInput();
    } else {
        problem.control.focus();
    }
}

export function collectEditFormProblems(form: HTMLFormElement, native: boolean): FieldProblem[] {
    const problems = new Map<HTMLElement, FieldProblem>();

    form.querySelectorAll('td-textbox').forEach((node) => {
        if (!(node instanceof TDTextBoxElement)) {
            return;
        }

        const control = node.querySelector('input, textarea');
        if (!(control instanceof HTMLElement) || isSkippable(control)) {
            return;
        }

        const message = textboxMessage(node);
        if (control.getAttribute('aria-invalid') === 'true' || message) {
            problems.set(control, {
                key: keyFor(control),
                label: labelFor(node, control),
                message: message || 'Revisa este campo.',
                control,
            });
        }
    });

    if (native) {
        form.querySelectorAll('input, select, textarea').forEach((node) => {
            if (!(node instanceof HTMLElement) || problems.has(node) || isSkippable(node) || node.closest('td-textbox')) {
                return;
            }

            const field = node instanceof HTMLInputElement || node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement
                ? node
                : null;
            const message = field ? fieldProblem(field) : null;
            if (!message) {
                return;
            }

            problems.set(node, {
                key: keyFor(node),
                label: labelFor(node.closest('.td-field') ?? node, node),
                message,
                control: node,
            });
        });
    }

    form.querySelectorAll<HTMLElement>('.validation-message').forEach((message) => {
        if (isSkippable(message) || !message.textContent?.trim()) {
            return;
        }

        const control = describedControl(form, message);
        if (!control || problems.has(control)) {
            return;
        }

        problems.set(control, {
            key: keyFor(control),
            label: labelFor(control.closest('.td-field, td-textbox') ?? control, control),
            message: message.textContent.trim(),
            control,
        });
    });

    return [...problems.values()];
}

export function markEditFormDirty(target: EventTarget | null): void {
    if (!(target instanceof Element)) {
        return;
    }

    const host = target.closest('td-editform');
    if (!(host instanceof HTMLElement) || target.closest('[data-td-editform-status], [data-td-editform-leave]')) {
        return;
    }

    host.setAttribute('data-dirty', '');
    const status = host.querySelector<HTMLElement>('[data-td-editform-status]');
    if (!status || status.hidden || status.dataset.tone !== 'invalid') {
        return;
    }

    const form = host.querySelector('form');
    if (!(form instanceof HTMLFormElement)) {
        return;
    }

    const box = target.closest('td-textbox');
    if (box instanceof TDTextBoxElement) {
        box.validate();
    }

    const problems = collectEditFormProblems(form, true);
    if (problems.length === 0) {
        hideEditFormStatus(host);
        return;
    }

    showEditFormProblems(host, problems);
}

export function clearEditForm(form: HTMLFormElement): void {
    const host = form.closest('td-editform');
    if (!(host instanceof HTMLElement)) {
        return;
    }

    host.removeAttribute('data-dirty');
    host.removeAttribute('data-pending');
    host.removeAttribute('aria-busy');
    hideEditFormStatus(host);
}

export function guardEditFormLeave(event: MouseEvent): boolean {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return false;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
        return false;
    }

    const stay = target.closest('[data-td-editform-stay]');
    if (stay) {
        closeDialog(stay);
        pendingLeave = null;
        return true;
    }

    const discard = target.closest('[data-td-editform-discard]');
    if (discard) {
        const href = pendingLeave?.href;
        pendingLeave?.host.removeAttribute('data-dirty');
        pendingLeave = null;
        closeDialog(discard);
        if (href) {
            location.assign(href);
        }
        return true;
    }

    const jump = target.closest<HTMLButtonElement>('[data-td-editform-jump]');
    if (jump) {
        const key = jump.dataset.tdEditformJump;
        const form = jump.closest('td-editform')?.querySelector('form');
        const control = key ? form?.querySelector<HTMLElement>(`#${CSS.escape(key)}`) : null;
        if (control) {
            focusEditFormProblem({ key: control.id, label: '', message: '', control });
        }
        return true;
    }

    const link = target.closest('a[href]');
    if (!(link instanceof HTMLAnchorElement) || link.target === '_blank' || link.hasAttribute('download')) {
        return false;
    }

    const hrefAttr = link.getAttribute('href') ?? '';
    if (!hrefAttr || hrefAttr.startsWith('#') || hrefAttr.startsWith('javascript:') || hrefAttr.startsWith('data:')) {
        return false;
    }

    if (link.href === location.href || link.closest('[data-td-editform-leave]')) {
        return false;
    }

    const host = document.querySelector<HTMLElement>('td-editform[data-dirty][data-confirm-leave="true"]');
    if (!host) {
        return false;
    }

    const dialog = host.querySelector('dialog');
    if (!(dialog instanceof HTMLDialogElement)) {
        return false;
    }

    pendingLeave = { host, href: link.href };
    if (!dialog.open) {
        dialog.showModal();
    }
    return true;
}

function closeDialog(source: Element): void {
    const dialog = source.closest('dialog');
    if (dialog instanceof HTMLDialogElement) {
        dialog.close();
    }
}

function focusFirstEmpty(form: HTMLFormElement): void {
    const fields = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select');
    for (const field of fields) {
        if (isSkippable(field) || !field.required || field.value.trim().length > 0) {
            continue;
        }

        focusEditFormProblem({ key: field.id, label: '', message: '', control: field });
        return;
    }
}

function fieldProblem(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string | null {
    if (field.disabled) {
        return null;
    }

    const value = field.value.trim();
    if (field.required && value.length === 0) {
        return readMessage(field, 'data-msg-required', 'Completa este campo.');
    }

    if (field instanceof HTMLInputElement && field.type === 'email' && value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return readMessage(field, 'data-msg-type', 'Escribe un correo como nombre@empresa.com.');
    }

    if (field instanceof HTMLInputElement && field.minLength > 0 && value.length > 0 && value.length < field.minLength) {
        return readMessage(field, 'data-msg-minlength', `Usa al menos ${field.minLength} caracteres.`);
    }

    if (field instanceof HTMLInputElement && field.pattern && value.length > 0) {
        try {
            if (!new RegExp(`^(?:${field.pattern})$`).test(field.value)) {
                return readMessage(field, 'data-msg-pattern', 'Usa el formato pedido.');
            }
        } catch {
            return null;
        }
    }

    if (field.getAttribute('aria-invalid') === 'true') {
        return 'Revisa este campo.';
    }

    return null;
}

function readMessage(field: HTMLElement, key: string, fallback: string): string {
    const value = field.getAttribute(key);
    return value && value.trim().length > 0 ? value : fallback;
}

function textboxMessage(box: TDTextBoxElement): string | null {
    const client = box.querySelector<HTMLElement>('[data-td-client-error]');
    if (client && !client.hidden && client.textContent?.trim()) {
        return client.textContent.trim();
    }

    const server = box.querySelector<HTMLElement>('[data-td-server-error]');
    const text = server && !server.hidden ? server.textContent?.trim() : '';
    return text ? text : null;
}

function describedControl(form: HTMLFormElement, message: HTMLElement): HTMLElement | null {
    if (!message.id) {
        return null;
    }

    const found = form.querySelector<HTMLElement>(`[aria-describedby~="${CSS.escape(message.id)}"]`);
    return found;
}

function labelFor(scope: Element, control: HTMLElement): string {
    const label = scope.querySelector('label');
    const text = label?.textContent?.replace(/\s+/g, ' ').trim();
    if (text) {
        return text;
    }

    return control.getAttribute('aria-label') || 'Campo';
}

function keyFor(control: HTMLElement): string {
    if (!control.id) {
        control.id = `td-editform-field-${Math.random().toString(36).slice(2, 8)}`;
    }

    return control.id;
}

function isSkippable(node: HTMLElement): boolean {
    if (node.hidden || node.closest('[hidden]') || node.closest('.td-sr') || node.classList.contains('td-sr')) {
        return true;
    }

    if (node instanceof HTMLInputElement) {
        return node.type === 'hidden' || node.type === 'button' || node.type === 'submit' || node.type === 'reset';
    }

    return false;
}

window.addEventListener('beforeunload', (event) => {
    if (document.querySelector('td-editform[data-dirty][data-confirm-leave="true"]')) {
        event.preventDefault();
    }
});
