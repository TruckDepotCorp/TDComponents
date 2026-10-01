const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class TDTextBoxElement extends HTMLElement {
    handleInput(): void {
        const input = this.getControl();
        if (!input) {
            return;
        }

        this.hideServerError();
        if (this.dataset.touched === 'true' || this.isClientErrorVisible()) {
            this.validate();
        }

        this.updateCounter();
        this.dispatchChange(input);
    }

    handleBlur(): void {
        this.dataset.touched = 'true';
        this.validate();
    }

    validate(): boolean {
        const input = this.getControl();
        if (!input) {
            return true;
        }

        const error = this.clientError(input);
        this.showClientError(error);
        if (error) {
            input.setAttribute('aria-invalid', 'true');
        } else if (!this.hasServerError()) {
            input.removeAttribute('aria-invalid');
        }

        return error === null;
    }

    focusInput(): void {
        this.getControl()?.focus();
    }

    private getControl(): HTMLInputElement | HTMLTextAreaElement | null {
        const found = this.querySelector('input, textarea');
        if (found instanceof HTMLInputElement || found instanceof HTMLTextAreaElement) {
            return found;
        }

        return null;
    }

    private clientError(input: HTMLInputElement | HTMLTextAreaElement): string | null {
        const trimmed = input.value.trim();

        if (input.required && trimmed.length === 0) {
            return message(input, 'data-msg-required', 'Enter a value for this field.');
        }

        if (input instanceof HTMLInputElement && input.type === 'email' && trimmed.length > 0 && !emailPattern.test(trimmed)) {
            return message(input, 'data-msg-type', 'Enter an email address like name@company.com.');
        }

        if (input.minLength > 0 && trimmed.length > 0 && trimmed.length < input.minLength) {
            return message(input, 'data-msg-minlength', `Use at least ${input.minLength} characters.`);
        }

        if (input.maxLength > 0 && input.value.length > input.maxLength) {
            return message(input, 'data-msg-maxlength', `Use at most ${input.maxLength} characters.`);
        }

        if (input instanceof HTMLInputElement && input.pattern) {
            try {
                const pattern = new RegExp(`^(?:${input.pattern})$`);
                if (trimmed.length > 0 && !pattern.test(input.value)) {
                    return message(input, 'data-msg-pattern', 'Use the requested format for this field.');
                }
            } catch {
                return null;
            }
        }

        return null;
    }

    private updateCounter(): void {
        const input = this.getControl();
        const counter = this.querySelector('[data-td-counter]');
        if (!input || !(counter instanceof HTMLElement) || input.maxLength < 0) {
            return;
        }

        counter.textContent = `${input.value.length} / ${input.maxLength}`;
    }

    private showClientError(error: string | null): void {
        const slot = this.querySelector('[data-td-client-error]');
        if (!(slot instanceof HTMLElement)) {
            return;
        }

        if (!error) {
            slot.textContent = '';
            slot.hidden = true;
            return;
        }

        slot.textContent = error;
        slot.hidden = false;
    }

    private isClientErrorVisible(): boolean {
        const slot = this.querySelector('[data-td-client-error]');
        return slot instanceof HTMLElement && !slot.hidden && (slot.textContent?.trim().length ?? 0) > 0;
    }

    private hideServerError(): void {
        const server = this.querySelector('[data-td-server-error]');
        if (server instanceof HTMLElement) {
            server.hidden = true;
        }
    }

    private hasServerError(): boolean {
        const server = this.querySelector('[data-td-server-error]');
        return server instanceof HTMLElement && !server.hidden && !!server.querySelector('.validation-message');
    }

    private dispatchChange(input: HTMLInputElement | HTMLTextAreaElement): void {
        this.dispatchEvent(new CustomEvent('ux-change', {
            bubbles: true,
            composed: true,
            detail: {
                name: input.name,
                value: input.value,
                valid: this.clientError(input) === null,
            },
        }));
    }
}

function message(input: HTMLElement, key: string, fallback: string): string {
    const value = input.getAttribute(key);
    return value && value.trim().length > 0 ? value : fallback;
}
