export class TDButtonElement extends HTMLElement {
    beginPending(): void {
        if (this.hasAttribute('data-pending')) {
            return;
        }

        this.setAttribute('data-pending', '');
        const control = this.querySelector('button');
        if (control) {
            control.setAttribute('aria-busy', 'true');
            control.setAttribute('aria-disabled', 'true');
        }

        this.querySelector('.td-btn__label')?.setAttribute('aria-hidden', 'true');
        this.querySelector('.td-btn__pending')?.removeAttribute('aria-hidden');
    }
}
