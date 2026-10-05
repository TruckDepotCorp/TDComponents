const TILE = 256;
const MIN_Z = 3;
const MAX_Z = 18;
const CIUDAD = { lat: 14.59, lng: -90.53 };

interface Point { lat: number; lng: number }
interface Stop { name: string; lat: number; lng: number; at?: string; note?: string }
interface Unit {
    id: string;
    name: string;
    lat: number;
    lng: number;
    kind?: string;
    status?: string;
    vehicle?: string;
    plate?: string;
    detail?: string;
    updated?: string;
    route?: Point[];
    stops?: Stop[];
}
interface PlanStop extends Stop { id: string; role: string }
interface Plan {
    incomplete?: boolean;
    profile?: string;
    router?: string;
    from?: Stop;
    to?: Stop;
    deliveries?: Stop[];
}
interface Model {
    title?: string;
    demo?: boolean;
    follow?: boolean;
    showRoute?: boolean;
    showStops?: boolean;
    matchRoute?: boolean;
    profile?: string;
    router?: string;
    userName?: string;
    userRole?: string;
    tileUrl?: string;
    attribution?: string;
    units?: Unit[];
    plan?: Plan;
}
interface Memory {
    lat: number;
    lng: number;
    zoom: number;
    moved: boolean;
    trail: Point[];
    watch?: number;
    timer?: number;
    tick: number;
    fix?: { lat: number; lng: number; accuracy: number };
    planKey?: string;
    planLine?: Point[];
    planLegs?: { distance: number; duration: number }[];
    planError?: string;
    planLoading?: boolean;
    planAbort?: AbortController;
    traceKey?: string;
    traceLines?: Record<string, Point[]>;
    traceStats?: Record<string, { distance: number; duration: number }>;
    traceError?: string;
    traceLoading?: boolean;
    traceAbort?: AbortController;
}

const memory = new Map<string, Memory>();
const live = new Map<string, FleetMap>();
let observerStarted = false;

function project(lat: number, lng: number, zoom: number): { x: number; y: number } {
    const clamped = Math.max(-85, Math.min(85, lat));
    const sin = Math.sin((clamped * Math.PI) / 180);
    const scale = TILE * 2 ** zoom;
    return {
        x: ((lng + 180) / 360) * scale,
        y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
    };
}

function unproject(x: number, y: number, zoom: number): Point {
    const scale = TILE * 2 ** zoom;
    const lng = (x / scale) * 360 - 180;
    const n = Math.PI - (2 * Math.PI * y) / scale;
    const lat = (180 / Math.PI) * Math.atan(Math.sinh(n));
    return { lat: Math.max(-85, Math.min(85, lat)), lng };
}

function formatCoord(lat: number, lng: number): string {
    const ns = lat >= 0 ? 'N' : 'S';
    const ew = lng >= 0 ? 'E' : 'O';
    return `${Math.abs(lat).toFixed(4)}° ${ns}, ${Math.abs(lng).toFixed(4)}° ${ew}`;
}

function readModel(host: HTMLElement): Model {
    const raw = host.querySelector('[data-td-maps-model]')?.textContent ?? '{}';
    try {
        const model = JSON.parse(raw) as Model;
        return model && typeof model === 'object' ? model : {};
    } catch {
        return {};
    }
}

function tileTemplate(url: string | undefined): string {
    if (url && /^https?:\/\//i.test(url) && url.includes('{z}') && url.includes('{x}') && url.includes('{y}')) {
        return url;
    }
    return 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
}

class FleetMap {
    private readonly host: HTMLElement;
    private readonly id: string;
    private readonly world: HTMLElement;
    private readonly tiles: HTMLElement;
    private readonly marks: HTMLElement;
    private readonly viewport: HTMLElement;
    private readonly card: HTMLElement;
    private readonly list: HTMLElement;
    private readonly status: HTMLElement;
    private readonly title: HTMLElement;
    private readonly count: HTMLElement;
    private readonly fitButton: HTMLButtonElement;
    private model: Model = {};
    private units: Unit[] = [];
    private selected = '';
    private hovered = '';
    private pinned = false;
    private generation = 0;
    private drag: { x: number; y: number; lat: number; lng: number; pointer: number } | null = null;

    matches(host: HTMLElement): boolean {
        return this.host === host;
    }

    constructor(host: HTMLElement) {
        this.host = host;
        this.id = host.dataset.mapId || 'pilotos';
        const modelText = host.querySelector('[data-td-maps-model]')?.textContent ?? '{}';
        host.replaceChildren();
        const frame = document.createElement('section');
        frame.className = 'td-maps__frame';
        frame.innerHTML = `
            <header class="td-maps__head">
                <h2 class="td-maps__title" data-td-maps-title></h2>
                <p class="td-maps__count" data-td-maps-count></p>
            </header>
            <div class="td-maps__body">
                <div class="td-maps__stage">
                    <div class="td-maps__viewport" data-td-maps-view tabindex="0" role="application"></div>
                    <div class="td-maps__tools">
                        <button type="button" data-td-maps-zoom="1">Acercar</button>
                        <button type="button" data-td-maps-zoom="-1">Alejar</button>
                        <button type="button" data-td-maps-fit>Ver todos</button>
                    </div>
                    <p class="td-maps__attrib"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" data-td-maps-attrib>OpenStreetMap</a></p>
                    <div class="td-maps__card" data-td-maps-card hidden></div>
                </div>
                <aside class="td-maps__list" data-td-maps-list></aside>
            </div>
            <p class="td-maps__status" data-td-maps-status role="status"></p>`;
        const script = document.createElement('script');
        script.type = 'application/json';
        script.dataset.tdMapsModel = '';
        script.textContent = modelText;
        host.append(frame);
        host.append(script);
        this.world = document.createElement('div');
        this.world.className = 'td-maps__world';
        this.world.dataset.tdMapsWorld = '';
        this.tiles = document.createElement('div');
        this.marks = document.createElement('div');
        this.tiles.className = 'td-maps__tiles';
        this.marks.className = 'td-maps__marks';
        this.world.append(this.tiles, this.marks);
        this.viewport = frame.querySelector('[data-td-maps-view]') as HTMLElement;
        this.viewport.append(this.world);
        this.card = frame.querySelector('[data-td-maps-card]') as HTMLElement;
        this.list = frame.querySelector('[data-td-maps-list]') as HTMLElement;
        this.status = frame.querySelector('[data-td-maps-status]') as HTMLElement;
        this.title = frame.querySelector('[data-td-maps-title]') as HTMLElement;
        this.count = frame.querySelector('[data-td-maps-count]') as HTMLElement;
        this.fitButton = frame.querySelector('[data-td-maps-fit]') as HTMLButtonElement;
        if (!memory.has(this.id)) {
            memory.set(this.id, { lat: CIUDAD.lat, lng: CIUDAD.lng, zoom: 12, moved: false, trail: [], tick: 0 });
        }
        this.bind();
        this.read();
        live.set(this.id, this);
        this.ensureWatch();
        this.ensureDemo();
        this.ensurePlan();
        this.ensureTrace();
        if (!this.memory.moved) {
            this.fit();
        }
        this.paint();
    }

    private get memory(): Memory {
        return memory.get(this.id)!;
    }

    refresh(): void {
        this.read();
        this.ensureWatch();
        this.ensureDemo();
        this.ensurePlan();
        this.ensureTrace();
        if (!this.memory.moved) {
            this.fit();
        }
        this.paint();
    }

    private read(): void {
        this.model = readModel(this.host);
        const source = Array.isArray(this.model.units) ? this.model.units : [];
        this.units = source.map((unit) => ({ ...unit }));
        if (this.model.follow && this.memory.fix) {
            this.units = [this.userUnit(this.memory.fix)];
        }
        this.title.textContent = this.model.title || (this.model.follow ? 'Tu ubicación' : 'Pilotos en ruta');
        const attrib = this.host.querySelector('[data-td-maps-attrib]');
        if (attrib) {
            attrib.textContent = this.model.attribution || 'OpenStreetMap';
        }
        this.viewport.setAttribute('aria-label', `${this.title.textContent}. Mapa de OpenStreetMap. Usa las flechas para moverte y más o menos para el zoom.`);
        this.fitButton.textContent = this.model.plan ? 'Ver toda la ruta' : this.model.follow ? 'Centrar en mí' : 'Ver todos';
    }

    private userUnit(fix: { lat: number; lng: number; accuracy: number }): Unit {
        return {
            id: 'yo',
            name: this.model.userName || 'Tú',
            lat: fix.lat,
            lng: fix.lng,
            kind: this.model.userRole || 'Sesión actual',
            status: 'En este equipo',
            detail: `Precisión aproximada de ${Math.round(fix.accuracy)} metros`,
            updated: 'Ahora',
            route: this.model.showRoute === false ? [] : this.memory.trail.slice(),
        };
    }

    private bind(): void {
        this.host.addEventListener('click', (event) => {
            const target = event.target;
            if (!(target instanceof Element)) {
                return;
            }
            const zoom = target.closest('[data-td-maps-zoom]');
            if (zoom instanceof HTMLElement) {
                this.bump(Number(zoom.dataset.tdMapsZoom) || 0);
                return;
            }
            if (target.closest('[data-td-maps-fit]')) {
                this.memory.moved = false;
                this.fit();
                this.paint();
                return;
            }
            if (target.closest('[data-td-maps-retry]')) {
                if (this.model.plan) {
                    this.status.textContent = 'Calculando la ruta por calles…';
                    this.ensurePlan(true);
                    return;
                }
                if (this.model.matchRoute) {
                    this.status.textContent = 'Reconstruyendo el recorrido por calles…';
                    this.ensureTrace(true);
                    return;
                }
                this.status.textContent = this.model.follow ? 'Buscando tu ubicación…' : 'Cargando el mapa…';
                this.ensureWatch(true);
                this.paint();
                return;
            }
            const pick = target.closest('[data-td-maps-pick]');
            if (pick instanceof HTMLElement && pick.dataset.tdMapsPick) {
                this.selected = pick.dataset.tdMapsPick;
                this.pinned = true;
                const unit = this.units.find((item) => item.id === this.selected)
                    ?? this.planStops().find((item) => item.id === this.selected);
                if (unit) {
                    this.memory.lat = unit.lat;
                    this.memory.lng = unit.lng;
                    this.memory.moved = true;
                }
                this.paint();
            }
        });
        this.viewport.addEventListener('keydown', (event) => {
            const step = TILE / 4;
            const center = project(this.memory.lat, this.memory.lng, this.memory.zoom);
            let next = center;
            if (event.key === 'ArrowLeft') next = { x: center.x - step, y: center.y };
            else if (event.key === 'ArrowRight') next = { x: center.x + step, y: center.y };
            else if (event.key === 'ArrowUp') next = { x: center.x, y: center.y - step };
            else if (event.key === 'ArrowDown') next = { x: center.x, y: center.y + step };
            else if (event.key === '+' || event.key === '=') this.bump(1);
            else if (event.key === '-' || event.key === '_') this.bump(-1);
            else return;
            event.preventDefault();
            if (next !== center) {
                const point = unproject(next.x, next.y, this.memory.zoom);
                this.memory.lat = point.lat;
                this.memory.lng = point.lng;
                this.memory.moved = true;
                this.paint();
            }
        });
        this.viewport.addEventListener('wheel', (event) => {
            event.preventDefault();
            this.bump(event.deltaY < 0 ? 1 : -1);
        }, { passive: false });
        this.host.addEventListener('pointerover', (event) => {
            const pick = event.target instanceof Element ? event.target.closest('[data-td-maps-pick]') : null;
            if (!(pick instanceof HTMLElement) || !pick.dataset.tdMapsPick) {
                return;
            }
            this.hovered = pick.dataset.tdMapsPick;
            this.drawCard(this.placed());
            this.placeCard();
        });
        this.host.addEventListener('pointerout', (event) => {
            const next = event.relatedTarget;
            if (next instanceof Node && this.host.contains(next)) {
                return;
            }
            this.hovered = '';
            this.drawCard(this.placed());
        });
        this.viewport.addEventListener('pointerdown', (event) => {
            if (event.button !== 0 || !(event.target instanceof Element) || event.target.closest('button, a')) {
                return;
            }
            this.drag = { x: event.clientX, y: event.clientY, lat: this.memory.lat, lng: this.memory.lng, pointer: event.pointerId };
            this.viewport.setPointerCapture(event.pointerId);
        });
        this.viewport.addEventListener('pointermove', (event) => {
            if (!this.drag || this.drag.pointer !== event.pointerId) {
                return;
            }
            const origin = project(this.drag.lat, this.drag.lng, this.memory.zoom);
            const point = unproject(origin.x - (event.clientX - this.drag.x), origin.y - (event.clientY - this.drag.y), this.memory.zoom);
            this.memory.lat = point.lat;
            this.memory.lng = point.lng;
            this.memory.moved = true;
            this.applyTransform();
            this.drawTiles();
            this.placeCard();
        });
        const endDrag = (event: PointerEvent) => {
            if (this.drag?.pointer === event.pointerId) {
                this.drag = null;
            }
        };
        this.viewport.addEventListener('pointerup', endDrag);
        this.viewport.addEventListener('pointercancel', endDrag);
        const resize = new ResizeObserver(() => this.paint());
        resize.observe(this.viewport);
    }

    private bump(delta: number): void {
        const zoom = Math.max(MIN_Z, Math.min(MAX_Z, this.memory.zoom + delta));
        if (zoom === this.memory.zoom) {
            return;
        }
        this.memory.zoom = zoom;
        this.memory.moved = true;
        this.paint();
    }

    private fit(): void {
        const points = this.points();
        if (points.length === 0) {
            this.memory.lat = CIUDAD.lat;
            this.memory.lng = CIUDAD.lng;
            this.memory.zoom = 11;
            return;
        }
        let minLat = 90;
        let maxLat = -90;
        let minLng = 180;
        let maxLng = -180;
        for (const point of points) {
            minLat = Math.min(minLat, point.lat);
            maxLat = Math.max(maxLat, point.lat);
            minLng = Math.min(minLng, point.lng);
            maxLng = Math.max(maxLng, point.lng);
        }
        const width = Math.max(this.viewport.clientWidth, 280);
        const height = Math.max(this.viewport.clientHeight, 220);
        let zoom = MAX_Z;
        for (let level = MAX_Z; level >= MIN_Z; level -= 1) {
            const a = project(maxLat, minLng, level);
            const b = project(minLat, maxLng, level);
            if (Math.abs(b.x - a.x) < width - 80 && Math.abs(b.y - a.y) < height - 80) {
                zoom = level;
                break;
            }
            zoom = level;
        }
        this.memory.zoom = zoom;
        this.memory.lat = (minLat + maxLat) / 2;
        this.memory.lng = (minLng + maxLng) / 2;
    }

    private points(): Point[] {
        const points: Point[] = [];
        if (this.model.plan && !this.model.plan.incomplete) {
            for (const stop of this.planStops()) points.push(stop);
            for (const point of this.memory.planLine ?? []) points.push(point);
            return points;
        }
        for (const unit of this.units) {
            points.push(unit);
            for (const point of unit.route ?? []) points.push(point);
            for (const stop of unit.stops ?? []) points.push(stop);
        }
        for (const line of Object.values(this.memory.traceLines ?? {})) {
            for (const point of line) points.push(point);
        }
        return points;
    }

    private ensureWatch(force = false): void {
        if (!this.model.follow || !('geolocation' in navigator)) {
            return;
        }
        const slot = this.memory;
        if (slot.watch !== undefined && !force) {
            return;
        }
        if (slot.watch !== undefined) {
            navigator.geolocation.clearWatch(slot.watch);
        }
        slot.watch = navigator.geolocation.watchPosition(
            (position) => {
                const map = live.get(this.id);
                if (!map) {
                    return;
                }
                const fix = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy || 0,
                };
                const last = map.memory.trail.at(-1);
                const moved = !last || distance(last, fix) > 12;
                if (moved) {
                    map.memory.trail.push({ lat: fix.lat, lng: fix.lng });
                }
                map.memory.fix = fix;
                if (map.model.follow && !map.memory.moved) {
                    map.memory.lat = fix.lat;
                    map.memory.lng = fix.lng;
                    map.memory.zoom = Math.max(map.memory.zoom, 15);
                }
                map.read();
                map.paint();
            },
            () => {
                const map = live.get(this.id);
                if (!map) {
                    return;
                }
                map.status.textContent = 'No pudimos usar la ubicación de este equipo. Permite el acceso en el navegador y vuelve a intentar.';
                map.paintRetry();
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 12000 },
        );
    }

    private ensureDemo(): void {
        const slot = this.memory;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!this.model.demo || reduced || this.model.follow) {
            if (slot.timer !== undefined) {
                window.clearInterval(slot.timer);
                slot.timer = undefined;
            }
            return;
        }
        if (slot.timer !== undefined) {
            return;
        }
        slot.timer = window.setInterval(() => {
            const map = live.get(this.id);
            if (!map || !map.model.demo) {
                return;
            }
            map.memory.tick += 1;
            map.paintMarks();
        }, 4000);
    }

    private placed(): Unit[] {
        if (!this.model.demo) {
            return this.units;
        }
        return this.units.map((unit, index) => {
            const route = unit.route ?? [];
            if (index !== 0 || route.length < 2) {
                return unit;
            }
            const step = this.memory.tick % route.length;
            const point = route[step];
            return { ...unit, lat: point.lat, lng: point.lng, updated: step === route.length - 1 ? unit.updated : 'Posición en movimiento' };
        });
    }

    private planStops(): PlanStop[] {
        const plan = this.model.plan;
        if (!plan?.from || !plan.to) {
            return [];
        }
        const deliveries = Array.isArray(plan.deliveries) ? plan.deliveries : [];
        return [
            { id: 'from', role: 'Salida', ...plan.from },
            ...deliveries.map((stop, index) => ({ id: `d${index}`, role: `Entrega ${index + 1}`, ...stop })),
            { id: 'to', role: 'Llegada', ...plan.to },
        ];
    }

    private ensurePlan(force = false): void {
        const plan = this.model.plan;
        if (!plan) {
            return;
        }
        const slot = this.memory;
        if (plan.incomplete || !plan.from || !plan.to) {
            slot.planLoading = false;
            slot.planError = 'Falta el punto de llegada. Indica dónde termina la ruta.';
            return;
        }
        const stops = this.planStops();
        const profile = plan.profile === 'walking' || plan.profile === 'cycling' ? plan.profile : 'driving';
        const router = /^https?:\/\//i.test(plan.router || '') ? (plan.router as string).replace(/\/$/, '') : 'https://router.project-osrm.org';
        const key = `${profile}|${router}|${stops.map((stop) => `${stop.lng.toFixed(5)},${stop.lat.toFixed(5)}`).join(';')}`;
        if (!force && slot.planKey === key && (slot.planLine || slot.planLoading || slot.planError)) {
            return;
        }
        slot.planAbort?.abort();
        const abort = new AbortController();
        slot.planAbort = abort;
        slot.planKey = key;
        slot.planLoading = true;
        slot.planError = undefined;
        slot.planLine = undefined;
        slot.planLegs = undefined;
        const coords = stops.map((stop) => `${stop.lng},${stop.lat}`).join(';');
        const url = `${router}/route/v1/${profile}/${coords}?overview=full&geometries=geojson&steps=false`;
        fetch(url, { signal: abort.signal })
            .then((response) => response.json() as Promise<{ code?: string; routes?: { distance: number; duration: number; geometry?: { coordinates?: [number, number][] }; legs?: { distance: number; duration: number }[] }[] }>)
            .then((body) => {
                const map = live.get(this.id);
                if (!map || map.memory.planKey !== key) {
                    return;
                }
                map.memory.planLoading = false;
                const route = body.code === 'Ok' ? body.routes?.[0] : undefined;
                const line = route?.geometry?.coordinates?.map(([lng, lat]) => ({ lat, lng })) ?? [];
                if (line.length < 2) {
                    map.memory.planError = 'No hay un camino por calles entre la salida, las entregas y la llegada.';
                    map.paint();
                    return;
                }
                map.memory.planLine = line;
                map.memory.planLegs = route?.legs ?? [];
                map.memory.planError = undefined;
                if (!map.memory.moved) {
                    map.fit();
                }
                map.paint();
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                const map = live.get(this.id);
                if (!map || map.memory.planKey !== key) {
                    return;
                }
                map.memory.planLoading = false;
                map.memory.planError = 'No se pudo calcular la ruta por calles. Revisa la conexión y vuelve a intentar.';
                map.paint();
            });
    }

    private ensureTrace(force = false): void {
        if (this.model.matchRoute !== true || this.model.plan || this.model.follow) {
            return;
        }
        const jobs = this.units
            .map((unit) => ({ id: unit.id, points: cleanTrace(unit.route ?? []) }))
            .filter((job) => job.points.length >= 2);
        const slot = this.memory;
        if (jobs.length === 0) {
            slot.traceLoading = false;
            slot.traceError = undefined;
            slot.traceLines = undefined;
            slot.traceStats = undefined;
            return;
        }
        const profile = this.model.profile === 'walking' || this.model.profile === 'cycling' ? this.model.profile : 'driving';
        const router = /^https?:\/\//i.test(this.model.router || '') ? (this.model.router as string).replace(/\/$/, '') : 'https://router.project-osrm.org';
        const key = `${profile}|${router}|${jobs.map((job) => `${job.id}:${job.points.map((point) => `${point.lng.toFixed(5)},${point.lat.toFixed(5)}`).join(';')}`).join('|')}`;
        if (!force && slot.traceKey === key && (slot.traceLines || slot.traceLoading || slot.traceError)) {
            return;
        }
        slot.traceAbort?.abort();
        const abort = new AbortController();
        slot.traceAbort = abort;
        slot.traceKey = key;
        slot.traceLoading = true;
        slot.traceError = undefined;
        Promise.all(jobs.map((job) => fetchTrace(job.points, profile, router, abort.signal)))
            .then((results) => {
                const map = live.get(this.id);
                if (!map || map.memory.traceKey !== key) {
                    return;
                }
                map.memory.traceLoading = false;
                const lines: Record<string, Point[]> = {};
                const stats: Record<string, { distance: number; duration: number }> = {};
                let failed = 0;
                results.forEach((result, index) => {
                    if (!result) {
                        failed += 1;
                        return;
                    }
                    lines[jobs[index].id] = result.line;
                    stats[jobs[index].id] = { distance: result.distance, duration: result.duration };
                });
                map.memory.traceLines = lines;
                map.memory.traceStats = stats;
                map.memory.traceError = failed === 0
                    ? undefined
                    : failed === jobs.length
                        ? 'No se pudo reconstruir el recorrido por calles. Se muestra la línea entre las coordenadas.'
                        : 'Parte del recorrido no tiene camino por calles. El resto sigue las calles.';
                if (!map.memory.moved) {
                    map.fit();
                }
                map.paint();
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                const map = live.get(this.id);
                if (!map || map.memory.traceKey !== key) {
                    return;
                }
                map.memory.traceLoading = false;
                map.memory.traceError = 'No se pudo reconstruir el recorrido por calles. Revisa la conexión y vuelve a intentar.';
                map.paint();
            });
    }

    private lineFor(unit: Unit): Point[] {
        const matched = this.memory.traceLines?.[unit.id];
        if (matched && matched.length > 1) {
            const here = { lat: unit.lat, lng: unit.lng };
            const onTrace = (unit.route ?? []).some((point) => distance(point, here) < 40);
            const last = matched[matched.length - 1];
            if (!onTrace && distance(last, here) > 40) {
                return [...matched, here];
            }
            return matched;
        }
        return [...(unit.route ?? []), { lat: unit.lat, lng: unit.lng }];
    }

    private paintPlan(): void {
        const stops = this.planStops();
        const zoom = this.memory.zoom;
        const line = this.memory.planLine ?? [];
        this.marks.replaceChildren();
        if (line.length > 1) {
            const last = line[line.length - 1];
            this.drawRoutes([{ id: 'plan', name: '', lat: last.lat, lng: last.lng, route: line }], zoom);
        }
        stops.forEach((stop, index) => {
            const pixel = project(stop.lat, stop.lng, zoom);
            const button = document.createElement('button');
            button.type = 'button';
            button.className = stop.id === 'from' || stop.id === 'to' ? 'td-maps__pin' : 'td-maps__stop';
            if (stop.id === this.openId()) {
                button.classList.add('is-on');
            }
            button.dataset.tdMapsPick = stop.id;
            button.style.transform = `translate(${pixel.x}px, ${pixel.y}px) translate(-50%, -50%)`;
            button.textContent = stop.id === 'from' ? 'A' : stop.id === 'to' ? 'B' : String(index);
            button.setAttribute('aria-label', `${stop.role}, ${stop.name}`);
            this.marks.append(button);
        });
        this.drawPlanList(stops);
        this.drawPlanCard(stops);
        this.placeCard();
        this.drawPlanStatus(stops);
    }

    private drawPlanList(stops: PlanStop[]): void {
        this.list.replaceChildren();
        const legend = document.createElement('p');
        legend.className = 'td-maps__legend';
        legend.textContent = 'El orden es salida, entregas y llegada. La línea sigue las calles.';
        this.list.append(legend);
        const legs = this.memory.planLegs ?? [];
        stops.forEach((stop, index) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'td-maps__person';
            item.dataset.tdMapsPick = stop.id;
            if (stop.id === this.openId()) {
                item.classList.add('is-on');
            }
            const name = document.createElement('strong');
            name.textContent = `${stop.role}. ${stop.name}`;
            item.append(name);
            const meta = document.createElement('span');
            const leg = index > 0 ? legs[index - 1] : undefined;
            meta.textContent = leg
                ? `${formatDistance(leg.distance)} · ${formatDuration(leg.duration)} desde la parada anterior`
                : (stop.note || 'Punto de salida');
            item.append(meta);
            this.list.append(item);
        });
    }

    private drawPlanCard(stops: PlanStop[]): void {
        const stop = stops.find((item) => item.id === this.openId());
        if (!stop) {
            this.card.hidden = true;
            this.card.replaceChildren();
            return;
        }
        this.card.hidden = false;
        this.card.replaceChildren();
        const name = document.createElement('h3');
        name.textContent = stop.name;
        const state = document.createElement('p');
        state.textContent = stop.role;
        this.card.append(name, state);
        if (stop.note) {
            const note = document.createElement('p');
            note.textContent = stop.note;
            this.card.append(note);
        }
        const index = stops.findIndex((item) => item.id === stop.id);
        const leg = index > 0 ? this.memory.planLegs?.[index - 1] : undefined;
        if (leg) {
            const trip = document.createElement('p');
            trip.textContent = `${formatDistance(leg.distance)} · ${formatDuration(leg.duration)} desde la parada anterior`;
            this.card.append(trip);
        }
        const where = document.createElement('p');
        where.textContent = formatCoord(stop.lat, stop.lng);
        this.card.append(where);
    }

    private drawPlanStatus(stops: PlanStop[]): void {
        const deliveries = Math.max(0, stops.length - 2);
        this.count.textContent = deliveries === 1 ? '1 entrega' : `${deliveries} entregas`;
        if (this.memory.planError) {
            this.status.textContent = this.memory.planError;
            this.paintRetry();
            return;
        }
        if (this.memory.planLoading || !this.memory.planLine) {
            this.status.textContent = 'Calculando la ruta por calles…';
            return;
        }
        const legs = this.memory.planLegs ?? [];
        const distance = legs.reduce((sum, leg) => sum + leg.distance, 0);
        const duration = legs.reduce((sum, leg) => sum + leg.duration, 0);
        this.count.textContent = `${formatDistance(distance)} · ${formatDuration(duration)}`;
        this.status.textContent = deliveries === 0
            ? 'Ruta directa de la salida a la llegada.'
            : `La ruta pasa por ${deliveries === 1 ? '1 entrega' : `${deliveries} entregas`} antes de llegar.`;
    }

    paint(): void {
        this.applyTransform();
        this.drawTiles();
        this.paintMarks();
    }

    paintMarks(): void {
        if (this.model.plan) {
            this.paintPlan();
            return;
        }
        const units = this.placed();
        const zoom = this.memory.zoom;
        this.marks.replaceChildren();
        if (this.model.showRoute !== false) {
            this.drawRoutes(units, zoom);
        }
        if (this.model.follow && this.memory.fix && this.memory.fix.accuracy > 0) {
            this.drawAccuracy(this.memory.fix, zoom);
        }
        this.drawStops(units, zoom);
        this.drawUnits(units, zoom);
        this.drawList(units);
        this.drawCard(units);
        this.placeCard();
        this.drawStatus(units);
    }

    private applyTransform(): void {
        const zoom = this.memory.zoom;
        const center = project(this.memory.lat, this.memory.lng, zoom);
        const width = this.viewport.clientWidth || 640;
        const height = this.viewport.clientHeight || 360;
        const left = center.x - width / 2;
        const top = center.y - height / 2;
        this.world.style.transform = `translate(${-left}px, ${-top}px)`;
    }

    private viewBox(): { zoom: number; left: number; top: number; width: number; height: number } {
        const zoom = this.memory.zoom;
        const center = project(this.memory.lat, this.memory.lng, zoom);
        const width = this.viewport.clientWidth || 640;
        const height = this.viewport.clientHeight || 360;
        return { zoom, left: center.x - width / 2, top: center.y - height / 2, width, height };
    }

    private drawTiles(): void {
        const box = this.viewBox();
        const template = tileTemplate(this.model.tileUrl);
        const x0 = Math.floor(box.left / TILE) - 1;
        const x1 = Math.floor((box.left + box.width) / TILE) + 1;
        const y0 = Math.floor(box.top / TILE) - 1;
        const y1 = Math.floor((box.top + box.height) / TILE) + 1;
        const max = 2 ** box.zoom;
        const keep = new Set<string>();
        const generation = ++this.generation;
        let errors = 0;
        let count = 0;
        for (let x = x0; x <= x1; x += 1) {
            for (let y = y0; y <= y1; y += 1) {
                if (y < 0 || y >= max || count > 48) {
                    continue;
                }
                count += 1;
                const wrapped = ((x % max) + max) % max;
                const key = `${box.zoom}/${wrapped}/${y}`;
                keep.add(key);
                if (this.tiles.querySelector(`[data-key="${key}"]`)) {
                    continue;
                }
                const tile = document.createElement('img');
                tile.className = 'td-maps__tile';
                tile.dataset.key = key;
                tile.alt = '';
                tile.width = TILE;
                tile.height = TILE;
                tile.style.left = `${wrapped * TILE}px`;
                tile.style.top = `${y * TILE}px`;
                tile.src = template.replace('{z}', String(box.zoom)).replace('{x}', String(wrapped)).replace('{y}', String(y));
                tile.addEventListener('error', () => {
                    if (generation !== this.generation) {
                        return;
                    }
                    errors += 1;
                    if (errors === 4) {
                        this.status.textContent = 'No se cargó el mapa. Revisa la conexión y vuelve a intentar.';
                        this.paintRetry();
                    }
                }, { once: true });
                this.tiles.append(tile);
            }
        }
        this.tiles.querySelectorAll<HTMLElement>('[data-key]').forEach((tile) => {
            if (!keep.has(tile.dataset.key || '')) {
                tile.remove();
            }
        });
    }

    private drawRoutes(units: Unit[], zoom: number): void {
        const lines: { x: number; y: number }[][] = [];
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const unit of units) {
            const route = this.lineFor(unit);
            if (route.length < 2) {
                continue;
            }
            const line = route.map((point) => project(point.lat, point.lng, zoom));
            lines.push(line);
            for (const pixel of line) {
                minX = Math.min(minX, pixel.x);
                minY = Math.min(minY, pixel.y);
                maxX = Math.max(maxX, pixel.x);
                maxY = Math.max(maxY, pixel.y);
            }
        }
        if (lines.length === 0) {
            return;
        }
        const pad = 8;
        minX -= pad;
        minY -= pad;
        maxX += pad;
        maxY += pad;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'td-maps__routes');
        svg.style.transform = `translate(${minX}px, ${minY}px)`;
        svg.setAttribute('width', String(Math.max(1, maxX - minX)));
        svg.setAttribute('height', String(Math.max(1, maxY - minY)));
        svg.setAttribute('viewBox', `${minX} ${minY} ${Math.max(1, maxX - minX)} ${Math.max(1, maxY - minY)}`);
        for (const line of lines) {
            const shape = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            shape.setAttribute('points', line.map((pixel) => `${pixel.x},${pixel.y}`).join(' '));
            svg.append(shape);
        }
        this.marks.append(svg);
    }

    private drawAccuracy(fix: { lat: number; lng: number; accuracy: number }, zoom: number): void {
        const pixel = project(fix.lat, fix.lng, zoom);
        const meters = 156543.03392 * Math.cos((fix.lat * Math.PI) / 180) / 2 ** zoom;
        const radius = Math.max(8, Math.min(180, fix.accuracy / meters));
        const dot = document.createElement('span');
        dot.className = 'td-maps__accuracy';
        dot.style.transform = `translate(${pixel.x - radius}px, ${pixel.y - radius}px)`;
        dot.style.width = `${radius * 2}px`;
        dot.style.height = `${radius * 2}px`;
        this.marks.append(dot);
    }

    private drawStops(units: Unit[], zoom: number): void {
        if (this.model.showStops === false) {
            return;
        }
        units.forEach((unit) => {
            (unit.stops ?? []).forEach((stop, index) => {
                const pixel = project(stop.lat, stop.lng, zoom);
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'td-maps__stop';
                button.dataset.tdMapsPick = unit.id;
                button.style.transform = `translate(${pixel.x}px, ${pixel.y}px) translate(-50%, -50%)`;
                button.textContent = String(index + 1);
                button.setAttribute('aria-label', `Parada ${index + 1}, ${stop.name}${stop.at ? `, ${stop.at}` : ''}`);
                this.marks.append(button);
            });
        });
    }

    private drawUnits(units: Unit[], zoom: number): void {
        for (const unit of units) {
            const pixel = project(unit.lat, unit.lng, zoom);
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'td-maps__pin';
            if (unit.id === this.openId()) {
                button.classList.add('is-on');
            }
            button.dataset.tdMapsPick = unit.id;
            button.style.transform = `translate(${pixel.x}px, ${pixel.y}px) translate(-50%, -50%)`;
            button.textContent = initials(unit.name);
            button.setAttribute('aria-label', `${unit.name}, ${unit.kind || 'Piloto'}, ${unit.status || 'En ruta'}`);
            this.marks.append(button);
        }
    }

    private drawList(units: Unit[]): void {
        this.list.replaceChildren();
        const legend = document.createElement('p');
        legend.className = 'td-maps__legend';
        legend.textContent = this.model.follow
            ? 'El círculo es tu posición. La línea es el recorrido de esta sesión.'
            : this.model.matchRoute
                ? 'La línea es el recorrido reconstruido por calles, a partir de la lista de coordenadas del piloto.'
                : 'El círculo es la posición actual. El cuadrado numerado es una parada ejecutada.';
        this.list.append(legend);
        if (units.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'td-maps__empty';
            empty.textContent = this.model.follow
                ? 'Todavía no hay una posición de este equipo.'
                : 'No hay pilotos en el mapa. Cuando el sistema envíe una posición, aparecerá aquí.';
            this.list.append(empty);
            return;
        }
        for (const unit of units) {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'td-maps__person';
            item.dataset.tdMapsPick = unit.id;
            if (unit.id === this.selected) {
                item.classList.add('is-on');
            }
            const name = document.createElement('strong');
            name.textContent = unit.name;
            const meta = document.createElement('span');
            const stat = this.memory.traceStats?.[unit.id];
            const trip = stat ? `${formatDistance(stat.distance)} recorridos · ${formatDuration(stat.duration)}` : '';
            meta.textContent = [unit.kind || 'Piloto', unit.status || 'En ruta', unit.vehicle, unit.plate, trip].filter(Boolean).join(' · ');
            item.append(name, meta);
            this.list.append(item);
            (unit.stops ?? []).forEach((stop, index) => {
                const line = document.createElement('p');
                line.className = 'td-maps__parada';
                line.textContent = `Parada ${index + 1}. ${stop.name}${stop.at ? `, ${stop.at}` : ''}${stop.note ? `. ${stop.note}` : ''}`;
                this.list.append(line);
            });
        }
    }

    private openId(): string {
        return this.hovered || this.selected;
    }

    private placeCard(): void {
        const id = this.openId();
        const pin = id ? this.marks.querySelector(`[data-td-maps-pick="${CSS.escape(id)}"]`) : null;
        const stage = this.viewport.parentElement;
        if (!(pin instanceof HTMLElement) || !stage || this.card.hidden) {
            return;
        }
        const pinBox = pin.getBoundingClientRect();
        const stageBox = stage.getBoundingClientRect();
        let left = pinBox.right - stageBox.left + 10;
        let top = pinBox.top - stageBox.top - 12;
        if (left + 260 > stageBox.width) {
            left = Math.max(8, pinBox.left - stageBox.left - 260);
        }
        if (top < 8) {
            top = Math.min(stageBox.height - 140, pinBox.bottom - stageBox.top + 8);
        }
        this.card.style.left = `${left}px`;
        this.card.style.top = `${top}px`;
    }

    private drawCard(units: Unit[]): void {
        const unit = units.find((item) => item.id === this.openId()) ?? null;
        if (!unit) {
            this.card.hidden = true;
            this.card.replaceChildren();
            return;
        }
        this.card.hidden = false;
        this.card.replaceChildren();
        const name = document.createElement('h3');
        name.textContent = unit.name;
        const state = document.createElement('p');
        state.textContent = `${unit.kind || 'Piloto'} · ${unit.status || 'En ruta'}`;
        this.card.append(name, state);
        const vehicle = [unit.vehicle, unit.plate].filter(Boolean).join(' · ');
        if (vehicle) {
            const line = document.createElement('p');
            line.textContent = vehicle;
            this.card.append(line);
        }
        if (unit.detail) {
            const line = document.createElement('p');
            line.textContent = unit.detail;
            this.card.append(line);
        }
        const where = document.createElement('p');
        where.textContent = formatCoord(unit.lat, unit.lng);
        this.card.append(where);
        const stat = this.memory.traceStats?.[unit.id];
        if (stat) {
            const trip = document.createElement('p');
            const count = unit.route?.length ?? 0;
            trip.textContent = `Recorrido reconstruido · ${count === 1 ? '1 coordenada' : `${count} coordenadas`} · ${formatDistance(stat.distance)} · ${formatDuration(stat.duration)}`;
            this.card.append(trip);
        }
        if (unit.updated) {
            const when = document.createElement('p');
            when.className = 'td-maps__when';
            when.textContent = unit.updated;
            this.card.append(when);
        }
    }

    private drawStatus(units: Unit[]): void {
        const noun = units.length === 1 ? '1 en el mapa' : `${units.length} en el mapa`;
        this.count.textContent = this.model.follow ? (units.length ? 'Posición de esta sesión' : 'Sin posición') : noun;
        if (this.model.follow && !this.memory.fix && !('geolocation' in navigator)) {
            this.status.textContent = 'Este navegador no entrega la ubicación del equipo.';
            this.paintRetry();
            return;
        }
        if (this.model.follow && !this.memory.fix) {
            this.status.textContent = `Buscando la ubicación de ${this.model.userName || 'esta sesión'}…`;
            return;
        }
        if (this.model.follow && this.memory.fix) {
            this.status.textContent = `${this.model.userName || 'Esta sesión'} está en el mapa. ${formatCoord(this.memory.fix.lat, this.memory.fix.lng)}. Precisión aproximada de ${Math.round(this.memory.fix.accuracy)} metros.`;
            return;
        }
        if (this.model.matchRoute && this.memory.traceLoading) {
            this.status.textContent = 'Reconstruyendo el recorrido por calles a partir de las coordenadas…';
            return;
        }
        if (this.model.matchRoute && this.memory.traceError) {
            this.status.textContent = this.memory.traceError;
            this.paintRetry();
            return;
        }
        if (this.model.matchRoute && this.memory.traceLines && Object.keys(this.memory.traceLines).length > 0) {
            const stats = Object.values(this.memory.traceStats ?? {});
            const distanceSum = stats.reduce((sum, item) => sum + item.distance, 0);
            const durationSum = stats.reduce((sum, item) => sum + item.duration, 0);
            if (units.length === 1 && stats.length === 1) {
                this.count.textContent = `${formatDistance(distanceSum)} · ${formatDuration(durationSum)}`;
            }
            this.status.textContent = units.length === 1
                ? 'Recorrido reconstruido por calles a partir de las coordenadas del piloto.'
                : `Recorridos reconstruidos por calles. ${formatDistance(distanceSum)} en total.`;
            return;
        }
        this.status.textContent = units.length
            ? 'Pasa el puntero o elige una persona para ver vehículo, patente y posición.'
            : 'No hay pilotos en el mapa. Cuando el sistema envíe una posición, aparecerá aquí.';
    }

    private paintRetry(): void {
        if (this.status.querySelector('[data-td-maps-retry]')) {
            return;
        }
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.tdMapsRetry = '';
        button.textContent = this.model.plan ? 'Reintentar ruta' : this.model.matchRoute ? 'Reintentar recorrido' : this.model.follow ? 'Reintentar ubicación' : 'Reintentar mapa';
        this.status.append(button);
    }
}

function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toLocaleString('es-CL', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} km`;
}

function formatDuration(seconds: number): string {
    const minutes = Math.max(1, Math.round(seconds / 60));
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (hours === 0) {
        return `${minutes} min`;
    }
    return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

function initials(name: string): string {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part.charAt(0)).join('').toUpperCase() || '•';
}

function cleanTrace(points: Point[]): Point[] {
    const clean: Point[] = [];
    for (const point of points) {
        if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) {
            continue;
        }
        const last = clean[clean.length - 1];
        if (last && distance(last, point) < 15) {
            continue;
        }
        clean.push(point);
    }
    return sampleTrace(clean, 80);
}

function sampleTrace(points: Point[], max: number): Point[] {
    if (points.length <= max) {
        return points;
    }
    const sampled: Point[] = [points[0]];
    const step = (points.length - 1) / (max - 1);
    for (let index = 1; index < max - 1; index += 1) {
        sampled.push(points[Math.round(index * step)]);
    }
    sampled.push(points[points.length - 1]);
    return sampled;
}

function fetchTrace(points: Point[], profile: string, router: string, signal: AbortSignal): Promise<{ line: Point[]; distance: number; duration: number } | null> {
    const coords = points.map((point) => `${point.lng.toFixed(5)},${point.lat.toFixed(5)}`).join(';');
    const url = `${router}/route/v1/${profile}/${coords}?overview=full&geometries=geojson&steps=false`;
    return fetch(url, { signal })
        .then((response) => response.json() as Promise<{ code?: string; routes?: { distance: number; duration: number; geometry?: { coordinates?: [number, number][] } }[] }>)
        .then((body) => {
            const route = body.code === 'Ok' ? body.routes?.[0] : undefined;
            const line = route?.geometry?.coordinates?.map(([lng, lat]) => ({ lat, lng })) ?? [];
            if (!route || line.length < 2) {
                return null;
            }
            return { line, distance: route.distance, duration: route.duration };
        });
}

function distance(a: Point, b: Point): number {
    const radius = 6371000;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * radius * Math.asin(Math.min(1, Math.sqrt(h)));
}

function mount(node: ParentNode): void {
    node.querySelectorAll<HTMLElement>('td-maps').forEach((host) => {
        const current = live.get(host.dataset.mapId || 'pilotos');
        if (current && current.matches(host) && host.querySelector('[data-td-maps-world]')) {
            current.refresh();
            return;
        }
        new FleetMap(host);
    });
}

export function bindMaps(root: ParentNode = document): void {
    mount(root);
    if (observerStarted || typeof MutationObserver === 'undefined' || !document.body) {
        return;
    }
    observerStarted = true;
    const observer = new MutationObserver((records) => {
        for (const record of records) {
            for (const node of record.addedNodes) {
                if (!(node instanceof Element)) {
                    continue;
                }
                if (node.matches('td-maps') || node.querySelector('td-maps')) {
                    mount(node.matches('td-maps') ? node.parentElement ?? document : node);
                }
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
