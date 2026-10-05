function formatCoord(lat: number, lng: number): string {
    const ns = lat >= 0 ? 'N' : 'S';
    const ew = lng >= 0 ? 'E' : 'O';
    return `${Math.abs(lat).toFixed(4)}° ${ns}, ${Math.abs(lng).toFixed(4)}° ${ew}`;
}

function message(error: GeolocationPositionError): string {
    if (error.code === error.PERMISSION_DENIED) {
        return 'El equipo no permitió leer la ubicación. Activa el permiso del navegador y vuelve a intentar.';
    }
    if (error.code === error.TIMEOUT) {
        return 'La lectura tardó demasiado. Vuelve a intentar en un momento.';
    }
    return 'No se pudo leer la ubicación de este equipo. Revisa el GPS y vuelve a intentar.';
}

function read(host: HTMLElement, button: HTMLButtonElement): void {
    const hint = host.querySelector('[data-td-locate-hint]');
    const result = host.querySelector('[data-td-locate-result]');
    const lat = host.querySelector<HTMLInputElement>('[data-td-locate-lat]');
    const lng = host.querySelector<HTMLInputElement>('[data-td-locate-lng]');
    const accuracy = host.querySelector<HTMLInputElement>('[data-td-locate-accuracy]');
    if (!(hint instanceof HTMLElement) || !(result instanceof HTMLElement)) {
        return;
    }
    if (!('geolocation' in navigator)) {
        result.hidden = true;
        hint.textContent = 'Este navegador no entrega la ubicación del equipo.';
        button.textContent = host.dataset.retry || 'Reintentar ubicación';
        return;
    }
    if (button.disabled) {
        return;
    }
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    result.hidden = true;
    hint.textContent = host.dataset.pending || 'Buscando tu ubicación…';
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const here = position.coords;
            if (lat) {
                lat.value = here.latitude.toFixed(6);
            }
            if (lng) {
                lng.value = here.longitude.toFixed(6);
            }
            if (accuracy) {
                accuracy.value = String(Math.round(here.accuracy));
            }
            result.hidden = false;
            result.textContent = formatCoord(here.latitude, here.longitude);
            hint.textContent = `Precisión aproximada de ${Math.round(here.accuracy)} metros.`;
            button.disabled = false;
            button.removeAttribute('aria-busy');
            button.textContent = host.dataset.update || 'Actualizar ubicación';
        },
        (error) => {
            result.hidden = true;
            hint.textContent = message(error);
            button.disabled = false;
            button.removeAttribute('aria-busy');
            button.textContent = host.dataset.retry || 'Reintentar ubicación';
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
}

let armed = false;

export function bindLocate(): void {
    if (armed) {
        return;
    }
    armed = true;
    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }
        const button = target.closest('[data-td-locate-go]');
        if (!(button instanceof HTMLButtonElement)) {
            return;
        }
        const host = button.closest('td-locate');
        if (!(host instanceof HTMLElement)) {
            return;
        }
        read(host, button);
    });
}
