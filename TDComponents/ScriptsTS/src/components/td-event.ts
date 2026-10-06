interface TDEventResponse {
    html: string;
}

/**
 * Atiende el @onclick de un TDButton en renderizado estático, sin SignalR.
 * Envía el token cifrado al servidor, que ejecuta el método .NET y devuelve el HTML nuevo de la página.
 */
export async function runClickEvent(button: HTMLButtonElement, afterSwap: () => void): Promise<void> {
    const token = button.dataset.tdClick;
    // La zona que se repinta: el TDRegion más cercano o, si no hay, toda la TDPage.
    const region = button.closest('[data-td-region]');
    const root = region ?? button.closest('[data-td-page]');
    if (!token || !(root instanceof HTMLElement) || button.dataset.busy === 'true') {
        return;
    }

    const index = [...root.querySelectorAll('[data-td-click]')].indexOf(button);
    button.dataset.busy = 'true';
    button.setAttribute('aria-busy', 'true');

    try {
        const response = await fetch(new URL('td/event', document.baseURI), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                RequestVerificationToken: button.dataset.tdToken ?? '',
            },
            body: JSON.stringify({ token, url: window.location.href }),
            credentials: 'same-origin',
        });
        if (!response.ok) {
            button.dispatchEvent(new CustomEvent('td-event-error', { bubbles: true, detail: { status: response.status } }));
            return;
        }

        const { html } = (await response.json()) as TDEventResponse;
        if (region instanceof HTMLElement) {
            // El servidor devuelve la página completa: se toma solo la zona del botón.
            const fresh = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
                .querySelector(`[data-td-region="${CSS.escape(region.dataset.tdRegion ?? '')}"]`);
            if (!fresh) {
                button.dispatchEvent(new CustomEvent('td-event-error', { bubbles: true, detail: { status: 0 } }));
                return;
            }
            region.innerHTML = fresh.innerHTML;
        } else {
            root.innerHTML = html;
        }
        afterSwap();
        const next = root.querySelectorAll<HTMLElement>('[data-td-click]')[index];
        next?.focus();
    } catch {
        button.dispatchEvent(new CustomEvent('td-event-error', { bubbles: true, detail: { status: 0 } }));
    } finally {
        // Si el botón sigue en el documento (no se reemplazó), vuelve a su estado normal.
        button.removeAttribute('aria-busy');
        delete button.dataset.busy;
    }
}
