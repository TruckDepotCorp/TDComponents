import { encodeBarcode, encodeQr } from './td-codes';
import { PARTS } from './td-ecom';
import { actReport, applyReportHost, beginReportDrag, endReportDrag, freshReport, inputReport, moveReportDrag, nudgeReport, openReportFile, renderReport, watchReportWidth, type ReportState } from './td-report';

type Part = (typeof PARTS)[number];
type LabelEl = { id: string; type: 'text' | 'barcode' | 'qr' | 'line' | 'box'; x: number; y: number; w: number; h: number; text?: string; size?: number; bold?: boolean; align?: 'left' | 'center' | 'right'; format?: string; showText?: boolean; thick?: number };
type DevStatus = 'connected' | 'connecting' | 'disconnected' | 'error' | 'printing';
type Device = { id: string; name: string; model: string; conn: 'bt' | 'wifi'; addr: string; proto: string; dpi: number; width: number; status: DevStatus; rssi: number; battery?: number; fw: string; jobs: number; def?: boolean; unreachable?: boolean; err?: string };
type ScanHit = { name: string; model: string; proto: string; rssi: number; battery: number; mac: string };
type Read = { value: string; format: string; source: string; t: string; id: number };
type Work = { id: number; date: string; res: string; s: number; e: number; title: string; note: string };
interface StudioState {
    msg: string;
    timer: number;
    label: { w: number; h: number; dpi: number; mode: 'design' | 'code'; grid: boolean; sel: string | null; rec: number; record: Record<string, string> | null; copies: number; printer: string; els: LabelEl[]; nid: number; json: string; jsonMsg: string; jsonBad: boolean; jobs: { t: string; text: string }[]; batch: string; avail: number };
    labelDrag: { id: string; mode: 'move' | 'resize'; x: number; y: number; w: number; h: number; px: number; py: number; moved: boolean } | null;
    report: ReportState;
    print: { sel: string; copies: number; raw: string; log: { t: string; dir: string; msg: string }[]; devs: Device[]; scan: { pr: number; found: ScanHit[] } | null; wifi: boolean; wf: { name: string; ip: string; port: string; proto: string }; wfMsg: string; wfBad: boolean; scanTimer: number };
    hid: { on: boolean; ignore: boolean; minLen: number; gap: number; count: number; last: { code: string; t: string; name: string | null } | null; log: { code: string; t: string; name: string | null }[]; buf: string; lastAt: number };
    scan: { mode: 'single' | 'continuous'; on: boolean; formats: string[]; wedge: boolean; beep: boolean; vibrate: boolean; dedupe: number; reads: Read[]; last: Read | null; waiting: boolean; manual: string; err: string; lastCode: string; lastAt: number; buf: string; bufAt: number; sim: number; cams: { id: string; label: string }[]; camId: string; torch: boolean; torchOk: boolean };
    sch: { view: 'day' | 'week' | 'month' | 'agenda' | 'res'; date: string; hide: string[]; events: Work[]; seq: number; dlg: Work | null; tried: boolean; skipClick: boolean; drag: { id: number; s: number; e: number; dur: number; col: string; grab: number; moved: boolean } | null };
}

const states = new WeakMap<HTMLElement, StudioState>();
const NAMES: Record<LabelEl['type'], string> = { text: 'Texto', barcode: 'Código de barras', qr: 'Código QR', line: 'Línea', box: 'Recuadro' };
const RES = [
    { id: 't1', name: 'Bahía 1 · Frenos', who: 'J. Muñoz', c: '#ED2A24' },
    { id: 't2', name: 'Bahía 2 · Motor', who: 'P. Soto', c: '#2A6FDB' },
    { id: 't3', name: 'Bahía 3 · Suspensión', who: 'C. Vera', c: '#1E9E54' },
    { id: 't4', name: 'Terreno', who: 'M. Rojas', c: '#E8920C' },
];
const FMT: [string, string][] = [['qr_code', 'QR'], ['code_128', 'Code 128'], ['ean_13', 'EAN-13'], ['ean_8', 'EAN-8'], ['code_39', 'Code 39'], ['data_matrix', 'DataMatrix']];

function money(n: number): string { return `$ ${Math.round(n).toLocaleString('es-CL')}`; }
function esc(value: string): string { return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c)); }
function clock(): string { const d = new Date(); return [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':'); }
function clamp(n: number, a: number, b: number): number { return Math.max(a, Math.min(b, n)); }
function iso(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function parseIso(value: string): Date { const [y, m, d] = value.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(value: string, days: number): string { const date = parseIso(value); date.setDate(date.getDate() + days); return iso(date); }
function monday(value: string): string { const date = parseIso(value); return addDays(value, -((date.getDay() + 6) % 7)); }
function hm(min: number): string { return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`; }

function recOf(part: Part) {
    return { code: part.code, name: part.name, brand: part.brand, price: money(part.price), stock: String(part.stock), url: `https://uiuxblazor.dev/r/${part.code}` };
}

function labelData(lb: StudioState['label']): Record<string, string> {
    return lb.record ?? recOf(PARTS[lb.rec] ?? PARTS[0]);
}

function fill(text: string, data: Record<string, string>): string {
    return text.replace(/\{(\w+)\}/g, (token, key: string) => data[key] ?? token);
}

function sw(on: boolean, label: string, action: string): string {
    return `<button type="button" class="td-rpt__switch" role="switch" aria-checked="${on}" data-st="${action}"><span class="td-rpt__track ${on ? 'is-on' : ''}" aria-hidden="true"></span>${label}</button>`;
}

function labelScale(lb: StudioState['label']): number {
    const room = Math.max(220, (lb.avail || 640) - 52);
    return Math.max(2.2, Math.min(7.2, room / lb.w));
}

function signalBars(rssi: number): string {
    const level = rssi >= -50 ? 4 : rssi >= -62 ? 3 : rssi >= -74 ? 2 : 1;
    return `<span class="td-code__bars" aria-hidden="true">${[6, 9, 12, 14].map((height, index) => `<i style="height:${height}px;background:${index < level ? 'var(--td-color-text)' : 'var(--td-color-border-strong)'}"></i>`).join('')}</span>`;
}

const barMarks = new Map<string, { error: boolean; svg: string; value: string }>();
const qrMarks = new Map<string, string>();
function markBarcode(format: string, text: string): { error: boolean; svg: string; value: string } {
    const key = `${format}\n${text}`;
    const hit = barMarks.get(key);
    if (hit) return hit;
    const code = encodeBarcode(format === 'ean13' ? 'ean13' : 'code128', text, 1, 40, '#0A0B0C', false);
    const packed = { error: Boolean(code.error), svg: code.svg, value: code.value || text };
    if (barMarks.size > 96) barMarks.clear();
    barMarks.set(key, packed);
    return packed;
}
function markQr(text: string): string {
    const key = text || ' ';
    const hit = qrMarks.get(key);
    if (hit) return hit;
    const svg = encodeQr(key, 'M', 2).svg;
    if (qrMarks.size > 96) qrMarks.clear();
    qrMarks.set(key, svg);
    return svg;
}

const paintFrame = new WeakMap<HTMLElement, number>();
function paintSoon(host: HTMLElement): void {
    if (paintFrame.has(host)) return;
    paintFrame.set(host, requestAnimationFrame(() => {
        paintFrame.delete(host);
        if (host.isConnected) paint(host);
    }));
}

const cameras = new WeakMap<HTMLElement, MediaStream>();
let beepCtx: AudioContext | null = null;
function cueScan(scan: StudioState['scan']): void {
    if (scan.vibrate) navigator.vibrate?.(35);
    if (!scan.beep || typeof AudioContext === 'undefined') return;
    beepCtx ??= new AudioContext();
    const osc = beepCtx.createOscillator();
    const gain = beepCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = 988;
    gain.gain.setValueAtTime(0.045, beepCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, beepCtx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(beepCtx.destination);
    osc.start();
    osc.stop(beepCtx.currentTime + 0.09);
}

function matchPart(value: string): Part | undefined {
    return PARTS.find((item) => item.code === value || value.endsWith(`/${item.code}`));
}

const PRESET: Record<string, string> = {
    hs: '~HS',
    jc: '~JC',
    ztest: '^XA^FO20,20^A0N,36,36^FDPrueba UiuxBlazor^FS^XZ',
    init: 'ESC @',
    cut: 'GS V 0',
    ticket: 'UiuxBlazor',
    cpcl: '! 0 200 200 210 1\r\nTEXT 4 0 30 30 PRUEBA\r\nPRINT\r\n',
    size: 'SIZE 62 mm,40 mm',
    cls: 'CLS',
    tspl: 'TEXT 30,30,"3",0,1,1,"PRUEBA"\r\nPRINT 1\r\n',
};
function presetsFor(proto: string): [string, string][] {
    if (proto === 'ZPL') return [['Estado ~HS', 'hs'], ['Calibrar', 'jc'], ['Etiqueta de prueba', 'ztest']];
    if (proto === 'CPCL') return [['Etiqueta CPCL', 'cpcl']];
    if (proto === 'TSPL') return [['Tamaño', 'size'], ['Limpiar', 'cls'], ['Imprimir', 'tspl']];
    return [['Inicializar', 'init'], ['Texto', 'ticket'], ['Corte', 'cut']];
}

function fresh(): StudioState {
    const today = iso(new Date());
    const week = monday(today);
    const seed: [number, string, number, number, string][] = [[0, 't1', 480, 570, 'Cambio de pastillas · CBTR-45'], [0, 't2', 540, 690, 'Diagnóstico turbo · HJKL-22'], [0, 't3', 600, 660, 'Alineación · FGRT-90'], [1, 't1', 510, 600, 'Discos ventilados · PLMN-12'], [1, 't4', 480, 720, 'Visita flota Minera Los Robles'], [1, 't2', 780, 900, 'Cambio de embrague · XZCV-77'], [2, 't3', 540, 630, 'Amortiguadores · QWER-31'], [2, 't1', 570, 630, 'Revisión sistema neumático'], [2, 't1', 600, 690, 'Válvula relé · BNMK-08'], [2, 't2', 840, 960, 'Mantención 300.000 km'], [3, 't2', 480, 570, 'Filtros · CBTR-45'], [3, 't3', 660, 750, 'Muelles · TYUI-55'], [4, 't1', 540, 660, 'Kit de frenos · Buses Andinos'], [5, 't4', 540, 720, 'Operativo sábado · Frío Norte']];
    return {
        msg: '',
        timer: 0,
        labelDrag: null,
        label: {
            w: 62, h: 40, dpi: 203, mode: 'design', grid: true, sel: 'e1', rec: 0, record: null, copies: 1, printer: 'zebra', nid: 8, json: '', jsonMsg: '', jsonBad: false, jobs: [],
            batch: JSON.stringify(PARTS.slice(0, 3).map(recOf), null, 2), avail: 720,
            els: [
                { id: 'e1', type: 'text', x: 3, y: 3, w: 56, h: 4.2, text: '{name}', size: 3.4, bold: true, align: 'left' },
                { id: 'e2', type: 'text', x: 3, y: 7.6, w: 56, h: 3.2, text: '{brand} · {code}', size: 2.5, bold: false, align: 'left' },
                { id: 'e3', type: 'text', x: 3, y: 11.2, w: 40, h: 6, text: '{price}', size: 5.2, bold: true, align: 'left' },
                { id: 'e4', type: 'line', x: 3, y: 18.6, w: 56, h: 0.4, thick: 0.4 },
                { id: 'e5', type: 'barcode', x: 3, y: 20.5, w: 38, h: 16, text: '{code}', format: 'c128', showText: true },
                { id: 'e6', type: 'qr', x: 45, y: 21, w: 14, h: 14, text: '{url}' },
                { id: 'e7', type: 'box', x: 44, y: 11, w: 15, h: 6.2, thick: 0.35 },
                { id: 'e8', type: 'text', x: 44, y: 12.4, w: 15, h: 3.4, text: 'STOCK {stock}', size: 2.3, bold: true, align: 'center' },
            ],
        },
        report: freshReport(),
        print: {
            sel: 'zd421', copies: 1, raw: '~HS', log: [{ t: clock(), dir: 'SYS', msg: 'Listo. Zebra ZD421 conectada en 192.168.1.40:9100.' }], scan: null, wifi: false, wf: { name: '', ip: '', port: '9100', proto: 'ZPL' }, wfMsg: '', wfBad: false, scanTimer: 0,
            devs: [
                { id: 'zd421', name: 'Zebra ZD421', model: 'ZD421d · 203 dpi', conn: 'wifi', addr: '192.168.1.40:9100', proto: 'ZPL', dpi: 203, width: 104, status: 'connected', rssi: -48, def: true, fw: 'V93.21.15Z', jobs: 128 },
                { id: 'ql820', name: 'Brother QL-820NWB', model: 'QL-820NWB · 300 dpi', conn: 'wifi', addr: '192.168.1.52:9100', proto: 'ESC/P', dpi: 300, width: 62, status: 'disconnected', rssi: -66, fw: '1.21', jobs: 42, unreachable: true },
                { id: 'zq520', name: 'Zebra ZQ520', model: 'ZQ520 móvil · 203 dpi', conn: 'bt', addr: 'AC:3F:A4:12:9B:07', proto: 'CPCL', dpi: 203, width: 104, status: 'disconnected', rssi: -61, battery: 82, fw: 'V85.20.19', jobs: 311 },
            ],
        },
        hid: { on: true, ignore: false, minLen: 4, gap: 60, count: 0, last: null, log: [], buf: '', lastAt: 0 },
        scan: { mode: 'continuous', on: false, formats: ['qr_code', 'code_128', 'ean_13', 'ean_8'], wedge: true, beep: true, vibrate: true, dedupe: 1500, reads: [], last: null, waiting: false, manual: '', err: '', lastCode: '', lastAt: 0, buf: '', bufAt: 0, sim: 0, cams: [], camId: '', torch: false, torchOk: false },
        sch: { view: 'week', date: today, hide: [], seq: 100, dlg: null, tried: false, drag: null, skipClick: false, events: seed.map((row, index) => ({ id: index + 1, date: addDays(week, row[0]), res: row[1], s: row[2], e: row[3], title: row[4], note: '' })) },
    };
}

function say(host: HTMLElement, message: string): void {
    const state = states.get(host);
    if (!state) return;
    state.msg = message;
    window.clearTimeout(state.timer);
    paint(host);
    state.timer = window.setTimeout(() => { state.msg = ''; if (host.isConnected) paint(host); }, 3200);
}

function paint(host: HTMLElement): void {
    const state = states.get(host);
    if (!state) return;
    const active = document.activeElement;
    const mark = active instanceof HTMLElement && host.contains(active) ? active.getAttribute('data-st-in') : null;
    const pos = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement ? active.selectionStart : null;
    host.innerHTML = `<p class="td-studio__msg" role="status">${esc(state.msg || '\u00a0')}</p>${render(host.dataset.kind || '', state)}`;
    if (host.dataset.kind === 'labeldesigner') host.dataset.lbScale = String(labelScale(state.label));
    restoreCamera(host);
    if (!mark) return;
    const next = host.querySelector(`[data-st-in="${CSS.escape(mark)}"]`);
    if (next instanceof HTMLElement) {
        next.focus();
        if ((next instanceof HTMLInputElement || next instanceof HTMLTextAreaElement) && pos != null && next.type !== 'checkbox' && next.type !== 'range') next.setSelectionRange(pos, pos);
    }
}

function restoreCamera(host: HTMLElement): void {
    const stream = cameras.get(host);
    const state = states.get(host);
    if (!stream || !state?.scan.on) return;
    const video = host.querySelector('[data-st-video]');
    if (!(video instanceof HTMLVideoElement)) return;
    if (video.srcObject !== stream) video.srcObject = stream;
    if (video.paused) void video.play().catch(() => undefined);
}

function labelShape(el: LabelEl, data: Record<string, string>): string {
    const text = fill(el.text || '', data);
    if (el.type === 'text') {
        const anchor = el.align === 'center' ? 'middle' : el.align === 'right' ? 'end' : 'start';
        const x = el.align === 'center' ? el.w / 2 : el.align === 'right' ? el.w : 0;
        return `<text x="${x}" y="${(el.size || 3) * 0.82}" font-size="${el.size || 3}" font-weight="${el.bold ? 700 : 400}" text-anchor="${anchor}" fill="#0A0B0C">${esc(text)}</text>`;
    }
    if (el.type === 'line') return `<rect width="${el.w}" height="${el.thick || 0.3}" fill="#0A0B0C"/>`;
    if (el.type === 'box') return `<rect width="${el.w}" height="${el.h}" fill="none" stroke="#0A0B0C" stroke-width="${el.thick || 0.3}"/>`;
    if (el.type === 'barcode') {
        const code = markBarcode(el.format === 'ean13' ? 'ean13' : 'c128', text);
        const height = el.h * (el.showText ? 0.78 : 1);
        const drawn = code.error ? `<text y="3" font-size="2" fill="#C62828">Valor no válido</text>` : nest(code.svg, 0, 0, el.w, height);
        return drawn + (el.showText && !code.error ? `<text x="${el.w / 2}" y="${el.h - 0.4}" font-size="2.2" text-anchor="middle">${esc(code.value)}</text>` : '');
    }
    return nest(markQr(text || ' '), 0, 0, el.w, el.h);
}

function labelSvg(state: StudioState): string {
    const lb = state.label;
    const data = labelData(lb);
    const scale = labelScale(lb);
    const body = lb.els.map((el) => `<g data-lb="${esc(el.id)}" transform="translate(${el.x} ${el.y})">${labelShape(el, data)}</g>`).join('');
    const boxes = lb.mode === 'design' ? lb.els.map((el) => {
        const on = el.id === lb.sel;
        return `<button type="button" class="td-studio__hit ${on ? 'is-on' : ''}" data-st="sel:${el.id}" style="left:${el.x * scale}px;top:${el.y * scale}px;width:${el.w * scale}px;height:${Math.max(el.h, el.type === 'line' ? 1.2 : el.h) * scale}px" aria-label="${NAMES[el.type]}">${on ? `<span class="td-studio__tag">${NAMES[el.type]}</span><span class="td-studio__grip" data-st="resize:${el.id}" aria-hidden="true"></span>` : ''}</button>`;
    }).join('') : '';
    return `<div class="td-studio__well"><div class="td-studio__stage ${lb.grid ? 'is-grid' : 'is-plain'}" style="width:${lb.w * scale}px;height:${lb.h * scale}px;background-size:${5 * scale}px ${5 * scale}px">
        <svg viewBox="0 0 ${lb.w} ${lb.h}" width="100%" height="100%" role="img" aria-label="Etiqueta ${lb.w} por ${lb.h} milímetros">${body}</svg>${boxes}</div></div>`;
}

function nest(svg: string, x: number, y: number, w: number, h: number): string {
    return svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
}

function zpl(state: StudioState): string {
    const lb = state.label;
    const data = labelData(lb);
    const dots = (mm: number) => Math.round(mm * lb.dpi / 25.4);
    const lines = ['^XA', '^CI28', `^PW${dots(lb.w)}`, `^LL${dots(lb.h)}`];
    for (const el of lb.els) {
        const text = fill(el.text || '', data).replace(/[\^~]/g, ' ');
        const fo = `^FO${dots(el.x)},${dots(el.y)}`;
        if (el.type === 'text') lines.push(`${fo}^A0N,${dots(el.size || 3)},${dots(el.size || 3)}^FD${text}^FS`);
        else if (el.type === 'line' || el.type === 'box') lines.push(`${fo}^GB${dots(el.w)},${dots(el.type === 'line' ? el.thick || 0.3 : el.h)},${Math.max(1, dots(el.thick || 0.3))}^FS`);
        else if (el.type === 'barcode') lines.push(`${fo}^BCN,${dots(el.h)},${el.showText ? 'Y' : 'N'},N,N^FD${text}^FS`);
        else lines.push(`${fo}^BQN,2,4^FDMA,${text}^FS`);
    }
    lines.push(`^PQ${lb.copies},0,1,Y`, '^XZ');
    return lines.join('\n');
}

function renderLabel(state: StudioState): string {
    const lb = state.label;
    const selected = lb.els.find((el) => el.id === lb.sel);
    const data = labelData(lb);
    const sizes: [number, number, string][] = [[50, 25, 'Estantería'], [62, 40, 'Producto'], [40, 30, 'Pequeña'], [100, 50, 'Caja'], [100, 150, 'Envío']];
    const json = lb.json || JSON.stringify({ size: { width: lb.w, height: lb.h, dpi: lb.dpi }, elements: lb.els.map(({ id, ...rest }) => rest) }, null, 2);
    const align = selected?.align ?? 'left';
    let batchCount = 0;
    let batchBad = false;
    try {
        const parsed = JSON.parse(lb.batch || '[]') as unknown;
        batchCount = Array.isArray(parsed) ? parsed.length : 0;
        batchBad = !Array.isArray(parsed);
    } catch {
        batchBad = true;
    }
    const dots = `${Math.round(lb.w * lb.dpi / 25.4)} × ${Math.round(lb.h * lb.dpi / 25.4)} puntos`;
    return `<div class="td-studio__bar">
        <div class="td-studio__field"><span class="td-section-title">Tamaño de etiqueta</span><div class="td-code__pills">${sizes.map(([w, h, hint]) => `<button type="button" class="td-code__pill" data-st="size:${w}x${h}" aria-pressed="${lb.w === w && lb.h === h}" title="${hint}">${w}×${h} ${hint}</button>`).join('')}</div></div>
        <label>Ancho mm<input data-st-in="lw" value="${lb.w}" inputmode="numeric"></label>
        <label>Alto mm<input data-st-in="lh" value="${lb.h}" inputmode="numeric"></label>
        <div class="td-studio__field"><span class="td-section-title">Resolución</span><div class="td-ecom__seg" role="group" aria-label="Resolución"><button type="button" data-st="dpi:203" aria-pressed="${lb.dpi === 203}">203 dpi</button><button type="button" data-st="dpi:300" aria-pressed="${lb.dpi === 300}">300 dpi</button></div></div>
        <span class="td-code__grow"></span>
        <div class="td-studio__field"><span class="td-section-title">Modo</span><div class="td-ecom__seg" role="group" aria-label="Modo"><button type="button" data-st="mode:design" aria-pressed="${lb.mode === 'design'}">Diseño</button><button type="button" data-st="mode:code" aria-pressed="${lb.mode === 'code'}">Programación</button></div></div>
    </div>
    <div class="td-studio__work">
        <div class="td-studio__canvas">
            ${lb.mode === 'design' ? `<div class="td-studio__tools" role="toolbar" aria-label="Elementos">${(['text', 'barcode', 'qr', 'line', 'box'] as const).map((type) => `<button type="button" data-st="add:${type}"><b>+</b> ${NAMES[type]}</button>`).join('')}<span class="td-code__rule" aria-hidden="true"></span>${sw(lb.grid, 'Cuadrícula', 'grid')}</div>` : ''}
            ${labelSvg(state)}
            <p class="td-studio__dims">${lb.w} × ${lb.h} mm · ${dots} · ${lb.els.length} elementos${lb.mode === 'design' ? ' · arrastra para mover, esquina roja para el tamaño, flechas 0,5 mm' : ` · vista con ${esc(data.code)}`}</p>
        </div>
        <div class="td-studio__side">
            ${lb.mode === 'design' ? `<div class="td-studio__inspector"><label>Datos de vista previa<select data-st-in="rec">${PARTS.slice(0, 8).map((part, index) => `<option value="${index}" ${index === lb.rec ? 'selected' : ''}>${esc(part.code)} · ${esc(part.name)}</option>`).join('')}</select></label>
                <span class="td-section-title">Variables · clic para insertar</span>
                <div class="td-code__pills">${Object.keys(data).map((key) => `<button type="button" class="td-rpt__token" data-st="var:${key}" title="${esc(data[key])}" ${selected?.text == null ? 'disabled' : ''}>{${key}}</button>`).join('')}</div>
            </div>
            ${selected ? `<div class="td-studio__inspector">
                <div class="td-studio__head"><span class="td-section-title">${NAMES[selected.type]}</span><button type="button" data-st="dup">Duplicar</button><button type="button" class="is-danger" data-st="del">Eliminar</button></div>
                <div class="td-studio__geo">${([['x', 'X'], ['y', 'Y'], ['w', 'Ancho'], ['h', 'Alto']] as const).map(([key, label]) => `<label>${label}<input data-st-in="geo:${key}" value="${selected[key]}" inputmode="decimal"></label>`).join('')}</div>
                ${selected.text != null ? `<label>Contenido<input data-st-in="text" value="${esc(selected.text)}"></label><span class="td-studio__dims">→ ${esc(fill(selected.text, data))}</span>` : ''}
                ${selected.type === 'text' ? `<div class="td-studio__bar"><label>Alto mm<input data-st-in="size" value="${selected.size ?? 3}" inputmode="decimal"></label><div class="td-ecom__seg" role="group" aria-label="Alineación">${([['left', 'Izquierda'], ['center', 'Centro'], ['right', 'Derecha']] as const).map(([key, label]) => `<button type="button" data-st="align:${key}" aria-pressed="${align === key}">${label}</button>`).join('')}</div></div>${sw(Boolean(selected.bold), 'Negrita', 'bold')}` : ''}
                ${selected.type === 'barcode' ? `<div class="td-ecom__seg" role="group" aria-label="Formato"><button type="button" data-st="bcfmt:c128" aria-pressed="${selected.format !== 'ean13'}">Code 128</button><button type="button" data-st="bcfmt:ean13" aria-pressed="${selected.format === 'ean13'}">EAN-13</button></div>${sw(Boolean(selected.showText), 'Mostrar texto', 'showtext')}` : ''}
                ${selected.type === 'line' || selected.type === 'box' ? `<label>Grosor mm<input data-st-in="thick" value="${selected.thick ?? 0.3}" inputmode="decimal"></label>` : ''}
                <p class="td-studio__dims">Supr elimina el elemento seleccionado.</p>
            </div>` : '<div class="td-studio__inspector"><p class="td-studio__dims">Selecciona un elemento de la etiqueta para editar su posición, tamaño y contenido, o agrega uno desde la barra.</p></div>'}` : `<div class="td-studio__inspector"><span class="td-section-title">Plantilla JSON · editable</span><textarea data-st-in="json" rows="18" spellcheck="false" aria-label="Plantilla JSON">${esc(json)}</textarea>
                <div class="td-rpt__actions"><button type="button" class="td-studio__primary" data-st="applyjson">Aplicar JSON</button><button type="button" data-st="resetjson">Descartar cambios</button><span class="${lb.jsonBad ? 'td-rpt__status is-bad' : 'td-rpt__status'}">${esc(lb.jsonMsg || 'Sincronizado con el diseño')}</span></div></div>`}
        </div>
    </div>
    ${lb.mode === 'code' ? `<div class="td-code__pair"><div class="td-studio__inspector"><div class="td-studio__head"><span class="td-section-title">ZPL generado · ${lb.dpi} dpi</span><button type="button" data-st="copyzpl">Copiar</button><button type="button" data-st="dlzpl">Descargar .zpl</button></div><pre class="td-studio__zpl">${esc(zpl(state))}</pre></div>
        <div class="td-studio__inspector"><span class="td-section-title">Lote · una etiqueta por registro</span><textarea data-st-in="batch" rows="12" spellcheck="false" aria-label="Datos del lote en JSON">${esc(lb.batch)}</textarea>
        <div class="td-rpt__actions"><button type="button" class="td-studio__primary" data-st="printbatch" ${batchBad || !batchCount ? 'disabled' : ''}>Imprimir lote</button><span class="${batchBad ? 'td-rpt__status is-bad' : 'td-studio__dims'}">${batchBad ? 'El lote debe ser un arreglo JSON.' : `${batchCount} registros · ${lb.copies} ${lb.copies === 1 ? 'copia' : 'copias'} cada uno`}</span></div></div></div>` : ''}
    <div class="td-studio__print">
        <label>Impresora<select data-st-in="printer"><option value="browser" ${lb.printer === 'browser' ? 'selected' : ''}>Navegador</option><option value="zebra" ${lb.printer === 'zebra' ? 'selected' : ''}>Zebra ZD421 · 203 dpi</option><option value="zebra300" ${lb.printer === 'zebra300' ? 'selected' : ''}>Zebra ZT411 · 300 dpi</option></select></label>
        <label>Copias<div class="td-studio__step"><button type="button" data-st="copdec" aria-label="Menos copias">−</button><input data-st-in="copies" value="${lb.copies}" inputmode="numeric" aria-label="Número de copias"><button type="button" data-st="copinc" aria-label="Más copias">+</button></div></label>
        <button type="button" class="td-studio__primary" data-st="print">Imprimir ${lb.copies} ${lb.copies === 1 ? 'copia' : 'copias'}</button>
        <div class="td-studio__jobs">${lb.jobs.map((job) => `<span><b>✓</b> ${job.t} ${esc(job.text)}</span>`).join('')}</div>
    </div>`;
}

function shownStatus(dev: Device): DevStatus {
    return dev.unreachable && dev.status === 'disconnected' ? 'error' : dev.status;
}

function renderPrinters(state: StudioState): string {
    const print = state.print;
    const current = print.devs.find((dev) => dev.id === print.sel);
    const status: Record<DevStatus, [string, string]> = { connected: ['Conectada', 'var(--td-color-success)'], connecting: ['Conectando…', 'var(--td-color-warning)'], disconnected: ['Desconectada', 'var(--td-color-text-muted)'], error: ['Sin respuesta', 'var(--td-color-danger)'], printing: ['Imprimiendo…', 'var(--td-color-info)'] };
    const hasBt = typeof navigator !== 'undefined' && 'bluetooth' in navigator;
    const busy = Boolean(print.scan && print.scan.pr < 100);
    const live = current ? shownStatus(current) : 'disconnected';
    const ready = current?.status === 'connected';
    const info = current ? [['Conexión', current.conn === 'bt' ? 'Bluetooth' : 'Wi‑Fi'], ['Dirección', current.addr], ['Lenguaje', current.proto], ['Resolución', `${current.dpi} dpi`], ['Ancho', `${current.width} mm`], ['Firmware', current.fw], ['Trabajos', String(current.jobs)], ...(current.battery != null ? [['Batería', `${current.battery} %`]] : [])] : [];
    const log = print.log.length ? print.log : [{ t: '', dir: '—', msg: 'Sin eventos en la consola.' }];
    return `<div class="td-studio__bar"><button type="button" class="td-studio__primary" data-st="btscan" ${busy ? 'disabled' : ''}>Buscar Bluetooth</button><button type="button" data-st="wifi" aria-expanded="${print.wifi}">Agregar por Wi‑Fi</button>
        <span class="td-studio__chips"><span class="td-studio__chip" title="${hasBt ? 'Este navegador expone Web Bluetooth' : 'Este navegador no expone Web Bluetooth'}"><i style="background:${hasBt ? 'var(--td-color-success)' : 'var(--td-color-text-muted)'}"></i>Bluetooth ${hasBt ? 'disponible' : 'no disponible'}</span><span class="td-studio__chip" title="La red Wi‑Fi se simula: el navegador no abre el puerto 9100"><i style="background:var(--td-color-warning)"></i>Agente local simulado</span><span class="td-studio__chip" title="Puerto crudo de impresoras térmicas"><i style="background:var(--td-color-info)"></i>Wi‑Fi puerto 9100</span></span></div>
        ${print.scan ? `<section class="td-prn__panel"><div class="td-studio__head"><strong>${busy ? 'Buscando impresoras Bluetooth' : 'Búsqueda terminada'}</strong><span class="td-studio__dims">${print.scan.found.length} encontrados · ${print.scan.pr} %</span><span class="td-code__grow"></span><button type="button" data-st="webbt">Selector del navegador</button><button type="button" data-st="scanclose">${busy ? 'Cancelar' : 'Cerrar'}</button></div>
            <div class="td-prn__meter" role="progressbar" aria-valuenow="${print.scan.pr}" aria-valuemin="0" aria-valuemax="100" aria-label="Progreso de búsqueda"><span style="width:${print.scan.pr}%"></span></div>
            <div role="list">${print.scan.found.map((hit) => { const paired = print.devs.some((dev) => dev.addr === hit.mac); return `<div role="listitem" class="td-prn__hit"><span class="td-prn__name">${esc(hit.name)}<small>${esc(hit.mac)} · ${esc(hit.proto)} · batería ${hit.battery} %</small></span>${signalBars(hit.rssi)}<span class="td-studio__dims">${hit.rssi} dBm</span><button type="button" data-st="pair:${hit.mac}" ${paired ? 'disabled' : ''}>${paired ? 'Emparejada' : 'Emparejar'}</button></div>`; }).join('') || '<p class="td-studio__dims">Acerca la impresora y enciéndela en modo emparejamiento.</p>'}</div></section>` : ''}
        ${print.wifi ? `<section class="td-prn__panel"><strong>Agregar impresora de red</strong><div class="td-prn__form"><label>Nombre<input data-st-in="wf-name" value="${esc(print.wf.name)}" placeholder="Zebra bodega 2"></label><label>Dirección IP<input data-st-in="wf-ip" value="${esc(print.wf.ip)}" placeholder="192.168.1.60" inputmode="decimal"></label><label>Puerto<input data-st-in="wf-port" value="${esc(print.wf.port)}" placeholder="9100" inputmode="numeric"></label><label>Lenguaje<select data-st-in="wf-proto"><option value="ZPL" ${print.wf.proto === 'ZPL' ? 'selected' : ''}>ZPL · Zebra</option><option value="ESC/POS" ${print.wf.proto === 'ESC/POS' ? 'selected' : ''}>ESC/POS · tickets</option><option value="CPCL" ${print.wf.proto === 'CPCL' ? 'selected' : ''}>CPCL · móviles</option><option value="TSPL" ${print.wf.proto === 'TSPL' ? 'selected' : ''}>TSPL · TSC</option></select></label></div>
            <div class="td-rpt__actions"><button type="button" class="td-studio__primary" data-st="wfadd">Probar y agregar</button><button type="button" data-st="wifi">Cancelar</button><span class="${print.wfBad ? 'td-rpt__status is-bad' : 'td-rpt__status'}">${esc(print.wfMsg)}</span></div>
            <p class="td-studio__dims">El navegador no abre sockets TCP. La conexión Wi‑Fi pasa por un agente local o por el servidor, que envía los datos crudos al puerto 9100.</p></section>` : ''}
        <div class="td-prn"><div class="td-prn__list" role="listbox" aria-label="Impresoras"><span class="td-section-title">Dispositivos · ${print.devs.length}</span>
            ${print.devs.map((dev) => { const [label, color] = status[shownStatus(dev)]; return `<button type="button" class="td-prn__dev" role="option" data-st="seldev:${dev.id}" aria-pressed="${dev.id === print.sel}"><span class="td-prn__mark" aria-hidden="true">${dev.conn === 'bt' ? 'BT' : 'IP'}</span><span class="td-prn__name">${esc(dev.name)}${dev.def ? '<em>Predet.</em>' : ''}<small>${dev.conn === 'bt' ? 'Bluetooth' : 'Wi‑Fi'} · ${esc(dev.addr)}</small></span><span class="td-prn__side"><span style="color:${color}"><i style="background:${color}"></i>${label}</span>${signalBars(dev.rssi)}</span></button>`; }).join('')}
        </div>
        ${current ? `<div class="td-prn__detail"><section class="td-prn__panel"><div class="td-prn__hero"><span class="td-prn__mark is-lg" aria-hidden="true">${current.conn === 'bt' ? 'BT' : 'IP'}</span><div><strong>${esc(current.name)}</strong><span class="td-studio__dims">${esc(current.model)} · ${esc(current.addr)}</span><span class="td-studio__chip"><i style="background:${status[live][1]}"></i>${status[live][0]}</span></div>
            <div class="td-ecom__nav"><button type="button" class="td-studio__primary" data-st="conn" ${current.status === 'connecting' || current.status === 'printing' ? 'disabled' : ''}>${current.status === 'connected' || current.status === 'printing' ? 'Desconectar' : 'Conectar'}</button><button type="button" data-st="def" ${current.def ? 'disabled' : ''}>Predeterminada</button><button type="button" class="is-danger" data-st="forget">Olvidar</button></div></div>
            ${current.err || current.unreachable ? `<p class="td-prn__alert" role="alert">${esc(current.err || 'No responde en el puerto 9100. Revisa que esté encendida y en la misma red.')}</p>` : ''}
            <div class="td-prn__info">${info.map(([key, value]) => `<div><span>${key}</span><b>${esc(value)}</b></div>`).join('')}</div></section>
            <div class="td-code__pair"><section class="td-prn__panel"><span class="td-section-title">Impresión de prueba</span><p class="td-studio__dims">Imprime una etiqueta corta para confirmar conexión, lenguaje y ancho útil.</p><div class="td-rpt__actions"><div class="td-studio__step"><button type="button" data-st="pcopdec" aria-label="Menos copias">−</button><input data-st-in="pcopies" value="${print.copies}" inputmode="numeric" aria-label="Copias de prueba"><button type="button" data-st="pcopinc" aria-label="Más copias">+</button></div><button type="button" class="td-studio__primary" data-st="test" ${ready ? '' : 'disabled'}>Imprimir prueba</button></div></section>
            <section class="td-prn__panel"><span class="td-section-title">Comando directo · ${esc(current.proto)}</span><div class="td-code__pills">${presetsFor(current.proto).map(([label, id]) => `<button type="button" class="td-rpt__token" data-st="preset:${id}">${label}</button>`).join('')}</div><textarea data-st-in="raw" rows="4" spellcheck="false" aria-label="Comando crudo">${esc(print.raw)}</textarea><button type="button" data-st="send" ${ready ? '' : 'disabled'}>Enviar ${new TextEncoder().encode(print.raw).length} bytes</button></section></div>
            <div class="td-prn__console"><div class="td-studio__head"><span>Consola</span><span class="td-code__grow"></span><button type="button" data-st="clearlog">Limpiar</button></div><div role="log" aria-live="polite">${log.map((line) => `<p><span>${line.t}</span><b>${line.dir}</b><span>${esc(line.msg)}</span></p>`).join('')}</div></div></div>` : '<p class="td-studio__dims">No queda ninguna impresora. Busca por Bluetooth o agrega una por Wi‑Fi.</p>'}</div>`;
}

function renderHid(state: StudioState): string {
    const hid = state.hid;
    return `<p class="td-code__lead">Este componente no necesita foco en un campo: escucha las teclas que un lector USB, Bluetooth o RF emite al documento. Apunta el lector a un código, o usa Simular lectura para probar sin hardware.</p>
        <div class="td-hid"><div class="td-hid__controls">${sw(hid.on, 'Escuchando en segundo plano', 'hidon')}${sw(hid.ignore, 'Ignorar si el foco está en un campo', 'hidignore')}
            <label>Longitud mínima válida<input data-st-in="min" type="number" min="1" value="${hid.minLen}"></label>
            <label>Tolerancia entre teclas · ${hid.gap} ms<input data-st-in="gap" type="range" min="20" max="200" step="10" value="${hid.gap}"></label>
            <div class="td-ecom__nav"><button type="button" class="td-studio__primary" data-st="hidsim">Simular lectura</button><button type="button" data-st="hidclear">Limpiar</button></div>
        </div><div class="td-hid__main"><section class="td-studio__inspector" role="status"><div class="td-studio__head"><span class="td-section-title">Última lectura</span><span class="td-studio__dims">${hid.count} en total</span></div>
            ${hid.last ? `<strong class="td-hid__code">${esc(hid.last.code)}</strong><span class="${hid.last.name ? 'td-rpt__status is-ok' : 'td-rpt__status is-bad'}">${hid.last.name ? `Coincide con ${esc(hid.last.name)}` : 'Sin coincidencia en el catálogo'}</span><span class="td-studio__dims">${hid.last.t}</span>` : '<p class="td-studio__dims">Sin lecturas todavía. Apunta el lector a un código o usa Simular lectura.</p>'}
        </section><div class="td-hid__log" role="log" aria-live="polite">${hid.log.map((row) => `<div class="td-hid__row"><span>${row.t}</span><b>${esc(row.code)}</b><span class="${row.name ? '' : 'is-miss'}">${esc(row.name || 'Sin coincidencia')}</span></div>`).join('') || '<p>Sin eventos registrados</p>'}</div></div></div>`;
}

function renderScanner(state: StudioState): string {
    const scan = state.scan;
    const part = scan.last ? matchPart(scan.last.value) : undefined;
    const hasDet = typeof window !== 'undefined' && 'BarcodeDetector' in window;
    const freshHit = Boolean(scan.last && Date.now() - scan.last.id < 2400 && scan.last.id > 10);
    const src: Record<string, string> = { camera: 'Cámara', wedge: 'Lector', manual: 'Manual', sim: 'Simulación' };
    const fmt = (key: string) => FMT.find(([id]) => id === key)?.[1] ?? key;
    const status = !scan.on ? 'Cámara apagada' : scan.waiting ? 'En pausa' : 'Leyendo';
    const dot = !scan.on ? '#6E757D' : scan.waiting ? 'var(--td-color-warning)' : 'var(--td-color-success)';
    const cams = scan.cams.length ? scan.cams : [{ id: '', label: 'Cámara principal' }];
    return `<div class="td-studio__bar"><div class="td-ecom__seg" role="group" aria-label="Modo de lectura"><button type="button" data-st="smode:single" aria-pressed="${scan.mode === 'single'}">Manual · 1 a 1</button><button type="button" data-st="smode:continuous" aria-pressed="${scan.mode === 'continuous'}">Continuo</button></div>
        <div class="td-code__pills">${FMT.map(([key, label]) => `<button type="button" class="td-code__pill" data-st="sfmt:${key}" aria-pressed="${scan.formats.includes(key)}">${label}</button>`).join('')}</div>
        <span class="td-studio__chips"><span class="td-studio__chip" title="${hasDet ? 'El navegador detecta códigos en el video' : 'Sin BarcodeDetector: usa un lector, escribe el código o simula'}"><i style="background:${hasDet ? 'var(--td-color-success)' : 'var(--td-color-text-muted)'}"></i>${hasDet ? 'Detector nativo' : 'Sin detector nativo'}</span><span class="td-studio__chip"><i style="background:${scan.wedge ? 'var(--td-color-success)' : 'var(--td-color-text-muted)'}"></i>Lector ${scan.wedge ? 'activo' : 'apagado'}</span></span></div>
        <div class="td-scan"><div class="td-scan__col"><div class="td-scan__stage ${scan.on ? 'is-on' : ''} ${freshHit ? 'is-hit' : ''}">
            <video data-st-video playsinline muted autoplay ${scan.on ? '' : 'hidden'} aria-label="Vista de la cámara"></video>
            ${scan.on ? '' : `<div class="td-scan__idle"><strong>${scan.err || 'La cámara está apagada'}</strong><span>${scan.mode === 'single' ? 'Cada lectura se detiene hasta que confirmes la siguiente.' : 'En continuo, cada código nuevo entra al registro sin cerrar la cámara.'}</span><div class="td-ecom__nav"><button type="button" class="td-studio__primary" data-st="scam">Activar cámara</button><button type="button" class="td-scan__ghost" data-st="ssim">Simular lectura</button></div></div>`}
            <div class="td-scan__frame" aria-hidden="true"><i></i><i></i><i></i><i></i><b></b></div>
            <div class="td-scan__badge"><span role="status"><i style="background:${dot}"></i>${status}</span>${scan.mode === 'continuous' ? `<span>${scan.reads.length}</span>` : ''}</div>
            ${freshHit && scan.last ? `<div class="td-scan__toast" role="alert"><b>${esc(scan.last.value)}</b><span>${fmt(scan.last.format)} · ${src[scan.last.source] ?? scan.last.source}</span></div>` : ''}
            ${scan.on ? `<div class="td-scan__bar"><button type="button" class="td-scan__ghost" data-st="scam">Apagar cámara</button><select data-st-in="cam" aria-label="Cámara">${cams.map((cam) => `<option value="${esc(cam.id)}" ${cam.id === scan.camId ? 'selected' : ''}>${esc(cam.label)}</option>`).join('')}</select>${scan.torchOk ? `<button type="button" class="td-scan__ghost" data-st="storch" aria-pressed="${scan.torch}">Linterna</button>` : ''}<span class="td-code__grow"></span><button type="button" class="td-scan__ghost" data-st="ssim">Simular lectura</button></div>` : ''}
        </div><p class="td-studio__dims">${scan.err || (hasDet ? 'Detector nativo listo. El mismo código se ignora durante la ventana de deduplicación.' : 'Este navegador no trae detector nativo: usa un lector, escribe el código o simula una lectura.')}</p></div>
        <div class="td-scan__side"><section class="td-studio__inspector"><div class="td-studio__head"><span class="td-section-title">${scan.waiting ? 'Lectura en espera' : 'Último resultado'}</span>${scan.last ? `<span class="td-code__fmt">${fmt(scan.last.format)}</span>` : ''}</div>
            ${scan.last ? `<strong class="td-hid__code">${esc(scan.last.value)}</strong><span class="td-studio__dims">${src[scan.last.source] ?? scan.last.source} · ${scan.last.t}</span>
                ${part ? `<div class="td-scan__match"><span><b>${esc(part.name)}</b><small class="${part.stock ? 'is-ok' : 'is-bad'}">${part.stock ? `${part.stock} en stock` : 'Agotado'}</small></span><b>${money(part.price)}</b></div>` : '<span class="td-rpt__status is-bad">Sin coincidencia en el catálogo</span>'}
                <div class="td-ecom__nav"><button type="button" data-st="scopy">Copiar</button>${/^https?:/i.test(scan.last.value) ? `<a class="td-scan__link" href="${esc(scan.last.value)}" target="_blank" rel="noopener noreferrer">Abrir enlace</a>` : ''}${scan.waiting ? '<button type="button" class="td-studio__primary" data-st="snext">Leer siguiente</button>' : ''}</div>` : `<p class="td-studio__dims">${scan.mode === 'single' ? 'Al leer un código la detección se pausa hasta Leer siguiente.' : 'Cada código se agrega al registro sin cerrar la cámara.'}</p>`}
        </section><section class="td-studio__inspector"><span class="td-section-title">Comportamiento</span>${sw(scan.beep, 'Pitido al leer', 'sbeep')}${sw(scan.vibrate, 'Vibrar al leer', 'svib')}${sw(scan.wedge, 'Aceptar lector USB o Bluetooth', 'swedge')}
            <label>Ignorar el mismo código durante ${scan.dedupe < 1000 ? `${scan.dedupe} ms` : `${scan.dedupe / 1000} s`}<input data-st-in="dedupe" type="range" min="0" max="5000" step="250" value="${scan.dedupe}"></label>
            <div class="td-scan__manual"><input data-st-in="manual" value="${esc(scan.manual)}" placeholder="Escribir código a mano" aria-label="Código manual"><button type="button" data-st="sadd">Agregar</button></div>
        </section></div></div>
        <section class="td-studio__inspector"><div class="td-studio__head"><span class="td-section-title">Eventos ux-scan · ${scan.reads.length}</span><button type="button" data-st="sexport" ${scan.reads.length ? '' : 'disabled'}>Exportar CSV</button><button type="button" data-st="sclear" ${scan.reads.length ? '' : 'disabled'}>Limpiar</button></div>
        <div class="td-scan__log" role="log" aria-live="polite">${scan.reads.slice(0, 20).map((row) => { const hit = matchPart(row.value); return `<div class="td-scan__row"><span>${row.t}</span><b>${fmt(row.format)}</b><span><strong>${esc(row.value)}</strong><small>${hit ? esc(hit.name) : 'Sin coincidencia'}</small></span><em>${src[row.source] ?? esc(row.source)}</em></div>`; }).join('') || '<p>Sin lecturas todavía</p>'}</div></section>`;
}

function renderScheduler(state: StudioState): string {
    const sch = state.sch;
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const week = monday(sch.date);
    const title = sch.view === 'month' ? `${months[parseIso(sch.date).getMonth()]} ${parseIso(sch.date).getFullYear()}` : sch.view === 'week' || sch.view === 'agenda' ? `${parseIso(week).getDate()} ${months[parseIso(week).getMonth()]} – ${parseIso(addDays(week, 6)).getDate()} ${months[parseIso(addDays(week, 6)).getMonth()]}` : `${days[(parseIso(sch.date).getDay() + 6) % 7]} ${parseIso(sch.date).getDate()} ${months[parseIso(sch.date).getMonth()]}`;
    const visible = sch.events.filter((event) => !sch.hide.includes(event.res));
    const start = 7 * 60;
    const hours = Array.from({ length: 13 }, (_, index) => start + index * 60);
    const columns = sch.view === 'res'
        ? RES.filter((res) => !sch.hide.includes(res.id)).map((res) => ({ key: `r:${res.id}`, head: res.name, sub: res.who, date: sch.date, res: res.id }))
        : (sch.view === 'day' ? [sch.date] : Array.from({ length: 7 }, (_, index) => addDays(week, index))).map((date) => ({ key: `d:${date}`, head: `${days[(parseIso(date).getDay() + 6) % 7]} ${parseIso(date).getDate()}`, sub: '', date, res: '' }));
    const grid = sch.view === 'day' || sch.view === 'week' || sch.view === 'res';
    const dlg = sch.dlg;
    const conflict = dlg ? sch.events.find((event) => event.id !== dlg.id && event.res === dlg.res && event.date === dlg.date && event.s < dlg.e && dlg.s < event.e) : undefined;
    const bad = dlg && !dlg.title.trim() ? 'Escribe un título' : dlg && dlg.e <= dlg.s ? 'La hora de término debe ser posterior al inicio' : '';
    return `<div class="td-studio__bar"><div class="td-ecom__seg">${([['day', 'Día'], ['week', 'Semana'], ['month', 'Mes'], ['agenda', 'Agenda'], ['res', 'Recursos']] as const).map(([key, label]) => `<button type="button" data-st="view:${key}" aria-pressed="${sch.view === key}">${label}</button>`).join('')}</div>
        <div class="td-ecom__nav"><button type="button" data-st="prev">Anterior</button><button type="button" data-st="today">Hoy</button><button type="button" data-st="next">Siguiente</button><strong>${title}</strong><button type="button" data-st="new">Nuevo trabajo</button></div></div>
        <div class="td-ecom__chips">${RES.map((res) => `<button type="button" data-st="res:${res.id}" aria-pressed="${!sch.hide.includes(res.id)}" style="--c:${res.c}">${res.name}</button>`).join('')}</div>
        ${grid ? `<div class="td-studio__cal" style="--cols:${columns.length}"><div class="td-studio__hours">${hours.map((hour) => `<span>${hm(hour)}</span>`).join('')}</div>${columns.map((col) => `<section data-st-col="${col.key}"><header>${col.head}<small>${col.sub}</small></header><div class="td-studio__col" data-st="slot:${col.key}">${visible.filter((event) => { const drag = sch.drag?.id === event.id ? sch.drag : null; const date = drag?.col.startsWith('d:') ? drag.col.slice(2) : event.date; const res = drag?.col.startsWith('r:') ? drag.col.slice(2) : event.res; return date === col.date && (sch.view !== 'res' || res === col.res); }).map((event) => { const drag = sch.drag?.id === event.id ? sch.drag : null; const from = drag?.s ?? event.s; const to = drag?.e ?? event.e; const color = RES.find((res) => res.id === (drag?.col.startsWith('r:') ? drag.col.slice(2) : event.res))?.c || '#333'; return `<button type="button" class="td-studio__event" data-st="edit:${event.id}" style="top:${(from - start) / 60 * 48}px;height:${Math.max(22, (to - from) / 60 * 48 - 2)}px;--c:${color}"><b>${esc(event.title)}</b><small>${hm(from)}–${hm(to)}</small></button>`; }).join('')}</div></section>`).join('')}</div>` : ''}
        ${sch.view === 'agenda' ? Array.from({ length: 7 }, (_, index) => addDays(week, index)).map((date) => { const list = visible.filter((event) => event.date === date); return `<section><h3>${days[(parseIso(date).getDay() + 6) % 7]} ${parseIso(date).getDate()} · ${list.length} trabajos</h3><ul class="td-ecom__lines">${list.map((event) => `<li><button type="button" data-st="edit:${event.id}"><b>${hm(event.s)}–${hm(event.e)} ${esc(event.title)}</b><small>${RES.find((res) => res.id === event.res)?.name}</small></button></li>`).join('') || '<li>Sin trabajos</li>'}</ul></section>`; }).join('') : ''}
        ${sch.view === 'month' ? `<div class="td-studio__month">${days.map((day) => `<b>${day}</b>`).join('')}${monthCells(sch).map((cell) => `<button type="button" data-st="day:${cell.date}"><span>${cell.n}</span>${cell.titles.map((item) => `<small>${esc(item)}</small>`).join('')}${cell.more ? `<em>${cell.more}</em>` : ''}</button>`).join('')}</div>` : ''}
        ${dlg ? `<form class="td-studio__dlg" role="dialog" aria-label="${dlg.id ? 'Editar trabajo' : 'Nuevo trabajo'}"><h3>${dlg.id ? 'Editar trabajo' : 'Nuevo trabajo'}</h3>
            <label>Título<input data-st-in="title" value="${esc(dlg.title)}"></label>
            <label>Fecha<input data-st-in="sdate" type="date" value="${dlg.date}"></label>
            <label>Inicio<select data-st-in="ss">${timeOpts(dlg.s)}</select></label><label>Término<select data-st-in="se">${timeOpts(dlg.e)}</select></label>
            <label>Recurso<select data-st-in="sres">${RES.map((res) => `<option value="${res.id}" ${dlg.res === res.id ? 'selected' : ''}>${res.name} · ${res.who}</option>`).join('')}</select></label>
            <label>Nota<textarea data-st-in="snote">${esc(dlg.note)}</textarea></label>
            ${sch.tried && bad ? `<p class="td-ecom__err" role="alert">${bad}</p>` : ''}${conflict ? `<p role="status">Choca con “${esc(conflict.title)}” (${hm(conflict.s)}–${hm(conflict.e)}) en el mismo recurso.</p>` : ''}
            <div class="td-ecom__nav"><button type="button" data-st="save">Guardar</button>${dlg.id ? '<button type="button" data-st="sdel">Eliminar</button>' : ''}<button type="button" data-st="sclose">Cerrar</button></div></form>` : ''}`;
}

function timeOpts(selected: number): string {
    let html = '';
    for (let min = 7 * 60; min <= 20 * 60; min += 15) html += `<option value="${min}" ${min === selected ? 'selected' : ''}>${hm(min)}</option>`;
    return html;
}

function monthCells(sch: StudioState['sch']): { date: string; n: string; titles: string[]; more: string }[] {
    const first = parseIso(sch.date); first.setDate(1);
    const start = monday(iso(first));
    return Array.from({ length: 42 }, (_, index) => {
        const date = addDays(start, index);
        const list = sch.events.filter((event) => event.date === date && !sch.hide.includes(event.res));
        return { date, n: String(parseIso(date).getDate()), titles: list.slice(0, 3).map((event) => event.title), more: list.length > 3 ? `+${list.length - 3}` : '' };
    });
}

function render(kind: string, state: StudioState): string {
    if (kind === 'labeldesigner') return renderLabel(state);
    if (kind === 'reportdesigner') return renderReport(state.report);
    if (kind === 'printers') return renderPrinters(state);
    if (kind === 'ehid') return renderHid(state);
    if (kind === 'scanner') return renderScanner(state);
    if (kind === 'scheduler') return renderScheduler(state);
    return '';
}

function act(host: HTMLElement, action: string): void {
    const state = states.get(host);
    if (!state) return;
    if (host.dataset.kind === 'reportdesigner') {
        actReport(host, state.report, action, () => paint(host));
        paint(host);
        return;
    }
    const parts = action.split(':');
    const name = parts[0] ?? '';
    const a = parts[1] ?? '';
    const b = parts[2] ?? '';
    const lb = state.label;
    if (name === 'size') { const [w, h] = a.split('x').map(Number); lb.w = w; lb.h = h; }
    else if (name === 'dpi') lb.dpi = Number(a);
    else if (name === 'mode' && (a === 'design' || a === 'code')) { lb.mode = a; if (a === 'code') lb.json = ''; }
    else if (name === 'sel') lb.sel = a;
    else if (name === 'add') addLabel(lb, a as LabelEl['type']);
    else if (name === 'del') { lb.els = lb.els.filter((el) => el.id !== lb.sel); lb.sel = null; }
    else if (name === 'dup') duplicateLabel(lb);
    else if (name === 'align' && (a === 'left' || a === 'center' || a === 'right')) { const el = lb.els.find((item) => item.id === lb.sel); if (el) el.align = a; }
    else if (name === 'bcfmt') { const el = lb.els.find((item) => item.id === lb.sel); if (el) el.format = a; }
    else if (name === 'copdec') lb.copies = clamp(lb.copies - 1, 1, 999);
    else if (name === 'copinc') lb.copies = clamp(lb.copies + 1, 1, 999);
    else if (name === 'dlzpl') { downloadText(zpl(state), `etiqueta-${lb.w}x${lb.h}.zpl`); say(host, 'Archivo ZPL descargado'); return; }
    else if (name === 'var') { const el = lb.els.find((item) => item.id === lb.sel); if (el && el.text != null) el.text = el.type === 'text' ? `${el.text} {${a}}`.trim() : `{${a}}`; }
    else if (name === 'print') { const copies = `${lb.copies} ${lb.copies === 1 ? 'etiqueta' : 'etiquetas'}`; const text = lb.printer === 'browser' ? `Impresión del navegador · ${copies} de ${lb.w}×${lb.h} mm` : `Enviado a ${lb.printer === 'zebra300' ? 'Zebra ZT411' : 'Zebra ZD421'} · ${copies}`; lb.jobs = [{ t: clock(), text }, ...lb.jobs].slice(0, 4); say(host, text); return; }
    else if (name === 'copyzpl') { navigator.clipboard?.writeText(zpl(state)).then(() => say(host, 'ZPL copiado'), () => say(host, 'No se pudo copiar el ZPL')); return; }
    else if (name === 'grid') lb.grid = !lb.grid;
    else if (name === 'bold') { const el = lb.els.find((item) => item.id === lb.sel); if (el) el.bold = !el.bold; }
    else if (name === 'showtext') { const el = lb.els.find((item) => item.id === lb.sel); if (el) el.showText = !el.showText; }
    else if (name === 'resetjson') { lb.json = ''; lb.jsonMsg = ''; lb.jsonBad = false; }
    else if (name === 'printbatch') { printBatch(host, state); return; }
    else if (name === 'applyjson') applyJson(host, state);
    else if (name === 'btscan') startScan(host, state);
    else if (name === 'scanclose') { window.clearInterval(state.print.scanTimer); state.print.scan = null; }
    else if (name === 'webbt') { void pickBluetooth(host, state); return; }
    else if (name === 'pair') pair(host, state, parts.slice(1).join(':'));
    else if (name === 'wifi') state.print.wifi = !state.print.wifi;
    else if (name === 'wfadd') addWifi(host, state);
    else if (name === 'seldev') state.print.sel = a;
    else if (name === 'conn') connect(host, state);
    else if (name === 'def') { state.print.devs.forEach((dev) => { dev.def = dev.id === state.print.sel; }); log(state, 'SYS', 'Impresora predeterminada actualizada'); }
    else if (name === 'forget') { state.print.devs = state.print.devs.filter((dev) => dev.id !== state.print.sel); state.print.sel = state.print.devs[0]?.id || ''; log(state, 'SYS', 'Impresora olvidada'); }
    else if (name === 'test' || name === 'send') testPrint(host, state, name === 'test');
    else if (name === 'preset' && PRESET[a]) state.print.raw = PRESET[a];
    else if (name === 'pcopdec') state.print.copies = clamp(state.print.copies - 1, 1, 999);
    else if (name === 'pcopinc') state.print.copies = clamp(state.print.copies + 1, 1, 999);
    else if (name === 'clearlog') state.print.log = [];
    else if (name === 'hidsim') pushHid(state, PARTS[Math.floor(Math.random() * 6)].code);
    else if (name === 'hidclear') { state.hid.log = []; state.hid.last = null; state.hid.count = 0; }
    else if (name === 'hidon') state.hid.on = !state.hid.on;
    else if (name === 'hidignore') state.hid.ignore = !state.hid.ignore;
    else if (name === 'smode' && (a === 'single' || a === 'continuous')) { state.scan.mode = a; state.scan.waiting = false; }
    else if (name === 'sfmt') state.scan.formats = state.scan.formats.includes(a) ? (state.scan.formats.length > 1 ? state.scan.formats.filter((item) => item !== a) : state.scan.formats) : [...state.scan.formats, a];
    else if (name === 'scam') toggleCamera(host, state);
    else if (name === 'ssim') simulateScan(host, state);
    else if (name === 'snext') { state.scan.waiting = false; state.scan.lastCode = ''; }
    else if (name === 'sadd') addManual(host, state);
    else if (name === 'sclear') { state.scan.reads = []; state.scan.last = null; state.scan.waiting = false; }
    else if (name === 'sbeep') state.scan.beep = !state.scan.beep;
    else if (name === 'svib') state.scan.vibrate = !state.scan.vibrate;
    else if (name === 'swedge') state.scan.wedge = !state.scan.wedge;
    else if (name === 'scopy') { const value = state.scan.last?.value; if (!value) return; navigator.clipboard?.writeText(value).then(() => say(host, 'Código copiado'), () => say(host, 'No se pudo copiar el código')); return; }
    else if (name === 'sexport') { exportScans(state); say(host, 'CSV de lecturas descargado'); return; }
    else if (name === 'storch') { void toggleTorch(host, state); return; }
    else if (name === 'view' && ['day', 'week', 'month', 'agenda', 'res'].includes(a)) state.sch.view = a as StudioState['sch']['view'];
    else if (name === 'prev' || name === 'next' || name === 'today') moveSchedule(state, name);
    else if (name === 'res') state.sch.hide = state.sch.hide.includes(a) ? state.sch.hide.filter((id) => id !== a) : [...state.sch.hide, a];
    else if (name === 'new') state.sch.dlg = { id: 0, title: '', date: state.sch.date, s: 540, e: 600, res: 't1', note: '' };
    else if (name === 'edit') state.sch.dlg = { ...state.sch.events.find((event) => event.id === Number(a))! };
    else if (name === 'day') { state.sch.date = a; state.sch.view = 'day'; }
    else if (name === 'slot') state.sch.dlg = { id: 0, title: '', date: a === 'd' ? b : state.sch.date, s: 540, e: 600, res: a === 'r' ? b : 't1', note: '' };
    else if (name === 'save') saveWork(host, state);
    else if (name === 'sdel' && state.sch.dlg) { state.sch.events = state.sch.events.filter((event) => event.id !== state.sch.dlg?.id); say(host, `Eliminado: ${state.sch.dlg.title}`); state.sch.dlg = null; return; }
    else if (name === 'sclose') state.sch.dlg = null;
    paint(host);
}

function duplicateLabel(lb: StudioState['label']): void {
    const el = lb.els.find((item) => item.id === lb.sel);
    if (!el) return;
    const id = `e${lb.nid + 1}`;
    lb.els = [...lb.els, { ...el, id, x: el.x + 2, y: el.y + 2 }];
    lb.sel = id;
    lb.nid += 1;
}

function downloadText(text: string, name: string): void {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
}

function addLabel(lb: StudioState['label'], type: LabelEl['type']): void {
    const id = `e${lb.nid + 1}`;
    const base: LabelEl = type === 'text' ? { id, type, x: 2, y: 2, w: 30, h: 4, text: 'Texto', size: 3, align: 'left' } : type === 'barcode' ? { id, type, x: 2, y: 2, w: 34, h: 14, text: '{code}', format: 'c128', showText: true } : type === 'qr' ? { id, type, x: 2, y: 2, w: 14, h: 14, text: '{url}' } : type === 'line' ? { id, type, x: 2, y: 2, w: lb.w - 6, h: 0.4, thick: 0.4 } : { id, type, x: 2, y: 2, w: 20, h: 10, thick: 0.35 };
    lb.els = [...lb.els, base];
    lb.sel = id;
    lb.nid += 1;
}

function applyJson(host: HTMLElement, state: StudioState): void {
    try {
        const parsed = JSON.parse(state.label.json || '{}') as { size?: { width?: number; height?: number; dpi?: number }; elements?: LabelEl[] };
        if (!parsed.size || !Array.isArray(parsed.elements)) throw new Error('Faltan "size" o "elements".');
        state.label.els = parsed.elements.map((el, index) => ({ ...el, id: `j${index}` }));
        state.label.w = clamp(Number(parsed.size.width) || 62, 10, 200);
        state.label.h = clamp(Number(parsed.size.height) || 40, 10, 300);
        state.label.jsonMsg = `Plantilla aplicada · ${state.label.els.length} elementos`;
        state.label.jsonBad = false;
        state.label.json = '';
    } catch (error) {
        state.label.jsonMsg = `JSON no válido: ${error instanceof Error ? error.message : 'revisa la plantilla'}`;
        state.label.jsonBad = true;
    }
    paint(host);
}

function log(state: StudioState, dir: string, msg: string): void {
    state.print.log = [{ t: clock(), dir, msg }, ...state.print.log].slice(0, 40);
}

function startScan(host: HTMLElement, state: StudioState): void {
    window.clearInterval(state.print.scanTimer);
    const pool: ScanHit[] = [
        { name: 'Zebra ZQ630', model: 'ZQ630', proto: 'CPCL', rssi: -58, battery: 91, mac: '' },
        { name: 'Epson TM-P20II', model: 'TM-P20II', proto: 'ESC/POS', rssi: -69, battery: 64, mac: '' },
        { name: 'TSC Alpha-40L', model: 'Alpha-40L', proto: 'TSPL', rssi: -63, battery: 77, mac: '' },
    ];
    pool.forEach((hit, index) => { hit.mac = Array.from({ length: 6 }, (_, i) => ((hit.name.length * 37 + i * 53 + index * 11) % 256).toString(16).padStart(2, '0')).join(':').toUpperCase(); });
    state.print.scan = { pr: 0, found: [] };
    log(state, 'SYS', 'Buscando dispositivos Bluetooth LE cercanos…');
    state.print.scanTimer = window.setInterval(() => {
        const scan = state.print.scan;
        if (!scan || !host.isConnected) { window.clearInterval(state.print.scanTimer); return; }
        scan.pr = Math.min(100, scan.pr + 25);
        if (scan.found.length < pool.length) scan.found.push(pool[scan.found.length]);
        if (scan.pr >= 100) { window.clearInterval(state.print.scanTimer); log(state, 'SYS', `Búsqueda terminada · ${scan.found.length} dispositivos`); }
        paint(host);
    }, 450);
    paint(host);
}

function pair(host: HTMLElement, state: StudioState, mac: string): void {
    const hit = state.print.scan?.found.find((item) => item.mac === mac);
    if (!hit || state.print.devs.some((dev) => dev.addr === mac)) return;
    const dev: Device = { id: `bt${mac}`, name: hit.name, model: `${hit.model} · 203 dpi`, conn: 'bt', addr: mac, proto: hit.proto, dpi: 203, width: 104, status: 'connecting', rssi: hit.rssi, battery: hit.battery, fw: '—', jobs: 0 };
    state.print.devs = [...state.print.devs, dev];
    state.print.sel = dev.id;
    log(state, 'SYS', `${hit.name} emparejada (${mac})`);
    window.setTimeout(() => { dev.status = 'connected'; log(state, 'RX', `${hit.name}: lista · papel OK · batería ${hit.battery}%`); if (host.isConnected) paint(host); }, 900);
}

function addWifi(host: HTMLElement, state: StudioState): void {
    const wf = state.print.wf;
    const ipOk = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(wf.ip.trim());
    const port = Number(wf.port);
    if (!ipOk) { state.print.wfMsg = 'Ingresa una IPv4 válida, por ejemplo 192.168.1.60'; state.print.wfBad = true; paint(host); return; }
    if (!(port > 0 && port < 65536)) { state.print.wfMsg = 'Puerto no válido'; state.print.wfBad = true; paint(host); return; }
    const addr = `${wf.ip.trim()}:${port}`;
    if (state.print.devs.some((dev) => dev.addr === addr)) { state.print.wfMsg = 'Esa impresora ya está en la lista'; state.print.wfBad = true; paint(host); return; }
    const name = wf.name.trim() || `Impresora ${wf.ip.trim()}`;
    const dev: Device = { id: `wf${Date.now()}`, name, model: `${wf.proto} · red`, conn: 'wifi', addr, proto: wf.proto, dpi: 203, width: 104, status: 'connected', rssi: -55, fw: '—', jobs: 0 };
    state.print.devs = [...state.print.devs, dev];
    state.print.sel = dev.id;
    state.print.wifi = false;
    state.print.wf = { name: '', ip: '', port: '9100', proto: 'ZPL' };
    state.print.wfMsg = '';
    log(state, 'RX', `${name}: responde en ${addr} · ${dev.proto}`);
    paint(host);
}

function connect(host: HTMLElement, state: StudioState): void {
    const dev = state.print.devs.find((item) => item.id === state.print.sel);
    if (!dev) return;
    if (dev.status === 'connected' || dev.status === 'printing') { dev.status = 'disconnected'; log(state, 'SYS', `${dev.name}: desconectada`); return; }
    dev.status = 'connecting';
    dev.err = '';
    log(state, 'SYS', `Conectando a ${dev.name}…`);
    window.setTimeout(() => {
        if (dev.unreachable) { dev.status = 'error'; dev.err = `No hubo respuesta en ${dev.addr}. Revisa que esté encendida y con el puerto 9100 habilitado.`; log(state, 'ERR', `${dev.name}: timeout`); }
        else { dev.status = 'connected'; log(state, 'RX', `${dev.name}: lista · papel OK`); }
        if (host.isConnected) paint(host);
    }, 900);
}

function testPrint(host: HTMLElement, state: StudioState, test: boolean): void {
    const dev = state.print.devs.find((item) => item.id === state.print.sel);
    if (!dev || dev.status !== 'connected') return;
    dev.status = 'printing';
    const copies = test ? state.print.copies : 1;
    log(state, 'TX', `${dev.name} ← ${test ? `prueba × ${copies}` : 'comando'} · ${dev.proto}`);
    window.setTimeout(() => { dev.status = 'connected'; dev.jobs += copies; log(state, 'RX', `${dev.name}: trabajo completado · ${copies} ${copies === 1 ? 'etiqueta' : 'etiquetas'}`); if (host.isConnected) paint(host); }, 700);
    paint(host);
}

function pushHid(state: StudioState, code: string): void {
    const part = PARTS.find((item) => item.code === code);
    state.hid.count += 1;
    state.hid.last = { code, t: clock(), name: part?.name ?? null };
    state.hid.log = [state.hid.last, ...state.hid.log].slice(0, 40);
}

function emitScan(host: HTMLElement, state: StudioState, code: string, format: string, source: string): void {
    const scan = state.scan;
    if (scan.mode === 'single' && scan.waiting && source === 'camera') return;
    const now = Date.now();
    if (scan.lastCode === code && now - scan.lastAt < scan.dedupe && source !== 'manual') return;
    scan.lastCode = code;
    scan.lastAt = now;
    const read = { value: code, format, source, t: clock(), id: now };
    scan.reads = [read, ...scan.reads].slice(0, 80);
    scan.last = read;
    scan.waiting = scan.mode === 'single';
    cueScan(scan);
    const origin = source === 'camera' ? 'cámara' : source === 'wedge' ? 'lector' : source === 'manual' ? 'teclado' : 'simulación';
    say(host, `${code} · ${origin}`);
}

function printBatch(host: HTMLElement, state: StudioState): void {
    const lb = state.label;
    let rows: unknown[];
    try {
        const parsed = JSON.parse(lb.batch || '[]') as unknown;
        if (!Array.isArray(parsed) || !parsed.length) throw new Error('vacío');
        rows = parsed;
    } catch {
        say(host, 'El lote debe ser un arreglo JSON con al menos un registro.');
        return;
    }
    const copies = lb.copies;
    const total = rows.length * copies;
    const text = `Lote enviado · ${rows.length} registros × ${copies} ${copies === 1 ? 'copia' : 'copias'} = ${total} etiquetas`;
    lb.jobs = [{ t: clock(), text }, ...lb.jobs].slice(0, 4);
    say(host, text);
}

function exportScans(state: StudioState): void {
    const cell = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const lines = ['hora,formato,codigo,origen', ...state.scan.reads.map((row) => [row.t, row.format, row.value, row.source].map(cell).join(','))];
    downloadText(lines.join('\n'), 'lecturas.csv');
}

type BluetoothPick = { requestDevice: (options: { acceptAllDevices: boolean }) => Promise<{ id: string; name?: string }> };

async function pickBluetooth(host: HTMLElement, state: StudioState): Promise<void> {
    const bluetooth = (navigator as Navigator & { bluetooth?: BluetoothPick }).bluetooth;
    if (!bluetooth?.requestDevice) { say(host, 'Este navegador no abre el selector Bluetooth.'); return; }
    try {
        const device = await bluetooth.requestDevice({ acceptAllDevices: true });
        const mac = device.id;
        if (state.print.devs.some((dev) => dev.addr === mac)) { say(host, `${device.name || 'El equipo'} ya está en la lista.`); return; }
        state.print.devs = [...state.print.devs, { id: `bt${mac}`, name: device.name || 'Impresora Bluetooth', model: 'Seleccionada en el navegador', conn: 'bt', addr: mac, proto: 'ZPL', dpi: 203, width: 104, status: 'disconnected', rssi: -55, fw: '—', jobs: 0 }];
        state.print.sel = `bt${mac}`;
        log(state, 'SYS', `Selector del navegador · ${device.name || mac}`);
        paint(host);
    } catch (error) {
        if (error instanceof DOMException && error.name === 'NotFoundError') return;
        say(host, 'No se pudo usar el selector Bluetooth.');
    }
}

function simulateScan(host: HTMLElement, state: StudioState): void {
    if (state.scan.mode === 'single' && state.scan.waiting) return;
    const sims: [string, string][] = [['BR-4521-AD', 'code_128'], ['https://uiuxblazor.dev/r/MT-7702-FL', 'qr_code'], ['7801234567892', 'ean_13'], ['96385074', 'ean_8']];
    const item = sims[state.scan.sim % sims.length];
    state.scan.sim += 1;
    state.scan.lastCode = '';
    emitScan(host, state, item[0], item[1], 'sim');
}

function addManual(host: HTMLElement, state: StudioState): void {
    const code = state.scan.manual.trim();
    if (!code) return;
    const format = /^\d{13}$/.test(code) ? 'ean_13' : /^https?:/i.test(code) ? 'qr_code' : 'code_128';
    state.scan.manual = '';
    state.scan.waiting = false;
    state.scan.lastCode = '';
    emitScan(host, state, code, format, 'manual');
}

function stopCamera(host: HTMLElement, state: StudioState): void {
    cameras.get(host)?.getTracks().forEach((track) => track.stop());
    cameras.delete(host);
    state.scan.on = false;
    state.scan.torch = false;
    host.dataset.tdScanGen = '';
}

async function toggleCamera(host: HTMLElement, state: StudioState): Promise<void> {
    if (state.scan.on) { stopCamera(host, state); paint(host); return; }
    await openCamera(host, state);
}

async function openCamera(host: HTMLElement, state: StudioState): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) { state.scan.err = 'Este navegador no permite usar la cámara.'; paint(host); return; }
    try {
        const video: MediaTrackConstraints = state.scan.camId ? { deviceId: { exact: state.scan.camId } } : { facingMode: { ideal: 'environment' } };
        const stream = await navigator.mediaDevices.getUserMedia({ video, audio: false });
        cameras.set(host, stream);
        state.scan.on = true;
        state.scan.err = '';
        const devices = await navigator.mediaDevices.enumerateDevices().catch(() => [] as MediaDeviceInfo[]);
        const cams = devices.filter((device) => device.kind === 'videoinput').map((device, index) => ({ id: device.deviceId, label: device.label || `Cámara ${index + 1}` }));
        if (cams.length) state.scan.cams = cams;
        const track = stream.getVideoTracks()[0];
        const caps = track?.getCapabilities?.() as (MediaTrackCapabilities & { torch?: boolean }) | undefined;
        state.scan.torchOk = Boolean(caps && 'torch' in caps && caps.torch);
        state.scan.torch = false;
        if (track?.getSettings().deviceId) state.scan.camId = track.getSettings().deviceId || state.scan.camId;
        paint(host);
        restoreCamera(host);
        ensureDetect(host);
    } catch (error) {
        stopCamera(host, state);
        state.scan.err = error instanceof DOMException && error.name === 'NotAllowedError' ? 'Permiso de cámara denegado. Habilítalo en el navegador.' : 'No se pudo abrir la cámara.';
        paint(host);
    }
}

async function swapCamera(host: HTMLElement, state: StudioState): Promise<void> {
    if (!state.scan.on) return;
    const id = state.scan.camId;
    stopCamera(host, state);
    state.scan.camId = id;
    await openCamera(host, state);
}

async function toggleTorch(host: HTMLElement, state: StudioState): Promise<void> {
    const track = cameras.get(host)?.getVideoTracks()[0];
    if (!track) return;
    const next = !state.scan.torch;
    try {
        await track.applyConstraints({ advanced: [{ torch: next }] } as MediaTrackConstraints);
        state.scan.torch = next;
        paint(host);
    } catch {
        state.scan.torch = false;
        state.scan.torchOk = false;
        say(host, 'Esta cámara no permite la linterna.');
    }
}

function ensureDetect(host: HTMLElement): void {
    const Ctor = (window as unknown as { BarcodeDetector?: new (options: { formats: string[] }) => { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string; format: string }[]> } }).BarcodeDetector;
    if (!Ctor) return;
    const gen = String(Date.now());
    host.dataset.tdScanGen = gen;
    const state = states.get(host);
    let formats = state?.scan.formats.join() ?? '';
    let detector = new Ctor({ formats: state?.scan.formats ?? ['qr_code'] });
    const tick = async (): Promise<void> => {
        const current = states.get(host);
        if (host.dataset.tdScanGen !== gen || !current?.scan.on || !host.isConnected) return;
        const nextFormats = current.scan.formats.join();
        if (nextFormats !== formats) { formats = nextFormats; detector = new Ctor({ formats: current.scan.formats }); }
        const video = host.querySelector('[data-st-video]');
        if (video instanceof HTMLVideoElement && video.readyState >= 2 && !(current.scan.mode === 'single' && current.scan.waiting)) {
            try {
                const found = await detector.detect(video);
                const hit = found.find((item) => item.rawValue);
                if (hit && host.dataset.tdScanGen === gen) emitScan(host, current, hit.rawValue, hit.format || 'qr_code', 'camera');
            } catch {
                /* Este cuadro no trae un código legible. */
            }
        }
        window.setTimeout(() => void tick(), 160);
    };
    window.setTimeout(() => void tick(), 200);
}

function moveSchedule(state: StudioState, name: string): void {
    if (name === 'today') { state.sch.date = iso(new Date()); return; }
    const step = state.sch.view === 'month' ? 0 : state.sch.view === 'week' || state.sch.view === 'agenda' ? 7 : 1;
    if (!step) { const date = parseIso(state.sch.date); date.setMonth(date.getMonth() + (name === 'next' ? 1 : -1)); state.sch.date = iso(date); return; }
    state.sch.date = addDays(state.sch.date, name === 'next' ? step : -step);
}

function saveWork(host: HTMLElement, state: StudioState): void {
    const dlg = state.sch.dlg;
    if (!dlg) return;
    if (!dlg.title.trim() || dlg.e <= dlg.s) { state.sch.tried = true; paint(host); return; }
    if (!dlg.id) { dlg.id = state.sch.seq + 1; state.sch.seq += 1; state.sch.events = [...state.sch.events, { ...dlg, title: dlg.title.trim() }]; say(host, `Creado: ${dlg.title.trim()}`); }
    else { state.sch.events = state.sch.events.map((event) => event.id === dlg.id ? { ...dlg, title: dlg.title.trim() } : event); say(host, `Guardado: ${dlg.title.trim()}`); }
    state.sch.dlg = null;
}

function onInput(host: HTMLElement, target: EventTarget | null): void {
    const state = states.get(host);
    if (!state || !(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;
    const key = target.getAttribute('data-st-in');
    if (!key) return;
    if (host.dataset.kind === 'reportdesigner') {
        if (!inputReport(host, state.report, key, target.value, () => paint(host))) paint(host);
        return;
    }
    const lb = state.label;
    const selected = lb.els.find((el) => el.id === lb.sel);
    if (key === 'rec') { lb.rec = Number(target.value); lb.record = null; }
    else if (key === 'copies') lb.copies = clamp(Number(target.value) || 1, 1, 999);
    else if (key === 'printer') lb.printer = target.value;
    else if (key === 'lw') lb.w = clamp(Number(target.value) || lb.w, 10, 200);
    else if (key === 'lh') lb.h = clamp(Number(target.value) || lb.h, 10, 300);
    else if (key === 'size' && selected) selected.size = Math.max(1, Number(target.value) || 3);
    else if (key === 'thick' && selected) selected.thick = Math.max(0.1, Number(target.value) || 0.3);
    else if (key === 'text' && selected) selected.text = target.value;
    else if (key.startsWith('geo:') && selected) { const field = key.slice(4) as 'x' | 'y' | 'w' | 'h'; const n = Number(target.value); if (!Number.isNaN(n)) selected[field] = Math.max(0, n); }
    else if (key === 'json') { lb.json = target.value; lb.jsonMsg = 'Cambios sin aplicar'; lb.jsonBad = false; }
    else if (key === 'batch') lb.batch = target.value;
    else if (key === 'dedupe') state.scan.dedupe = clamp(Number(target.value) || 0, 0, 5000);
    else if (key === 'cam') { state.scan.camId = target.value; void swapCamera(host, state); return; }
    else if (key === 'wf-name') state.print.wf.name = target.value;
    else if (key === 'wf-ip') state.print.wf.ip = target.value;
    else if (key === 'wf-port') state.print.wf.port = target.value;
    else if (key === 'wf-proto') state.print.wf.proto = target.value;
    else if (key === 'pcopies') state.print.copies = clamp(Number(target.value) || 1, 1, 999);
    else if (key === 'raw') state.print.raw = target.value;
    else if (key === 'min') state.hid.minLen = Math.max(1, Number(target.value) || 1);
    else if (key === 'gap') state.hid.gap = Number(target.value) || 0;
    else if (key === 'manual') state.scan.manual = target.value;
    else if (state.sch.dlg && key === 'title') state.sch.dlg.title = target.value;
    else if (state.sch.dlg && key === 'sdate') state.sch.dlg.date = target.value;
    else if (state.sch.dlg && key === 'ss') state.sch.dlg.s = Number(target.value);
    else if (state.sch.dlg && key === 'se') state.sch.dlg.e = Number(target.value);
    else if (state.sch.dlg && key === 'sres') state.sch.dlg.res = target.value;
    else if (state.sch.dlg && key === 'snote') state.sch.dlg.note = target.value;
    if (key !== 'raw' && key !== 'json' && key !== 'batch' && key !== 'manual' && key !== 'title' && key !== 'snote') paint(host);
}

function beginDrag(host: HTMLElement, event: PointerEvent): void {
    if (event.button !== 0) return;
    if (host.dataset.kind === 'reportdesigner') {
        const state = states.get(host);
        if (state) beginReportDrag(state.report, event);
        return;
    }
    if (host.dataset.kind === 'labeldesigner') {
        beginLabelDrag(host, event);
        return;
    }
    if (host.dataset.kind !== 'scheduler') return;
    const button = event.target instanceof Element ? event.target.closest('[data-st^="edit:"]') : null;
    if (!(button instanceof HTMLElement)) return;
    const state = states.get(host);
    const work = state?.sch.events.find((item) => item.id === Number(button.dataset.st?.slice(5)));
    if (!state || !work) return;
    state.sch.skipClick = false;
    const box = button.getBoundingClientRect();
    state.sch.drag = { id: work.id, s: work.s, e: work.e, dur: work.e - work.s, col: button.closest('[data-st-col]')?.getAttribute('data-st-col') || '', grab: event.clientY - box.top, moved: false };
}

function beginLabelDrag(host: HTMLElement, event: PointerEvent): void {
    const state = states.get(host);
    if (!state || state.label.mode !== 'design') return;
    const handle = event.target instanceof Element ? event.target.closest('[data-st^="resize:"]') : null;
    const hit = event.target instanceof Element ? event.target.closest('[data-st^="sel:"]') : null;
    const id = handle instanceof HTMLElement ? handle.dataset.st?.slice(7) : hit instanceof HTMLElement ? hit.dataset.st?.slice(4) : '';
    const el = state.label.els.find((item) => item.id === id);
    if (!el) return;
    state.label.sel = el.id;
    state.labelDrag = { id: el.id, mode: handle ? 'resize' : 'move', x: el.x, y: el.y, w: el.w, h: el.h, px: event.clientX, py: event.clientY, moved: false };
    host.setPointerCapture?.(event.pointerId);
    event.preventDefault();
}

function moveDrag(event: PointerEvent): void {
    const reportHost = [...document.querySelectorAll('td-studio')].find((node) => node instanceof HTMLElement && states.get(node)?.report.drag);
    if (reportHost instanceof HTMLElement) {
        const state = states.get(reportHost);
        if (!state) return;
        moveReportDrag(state.report, event);
        if (state.report.drag?.moved) paint(reportHost);
        return;
    }
    const labelHost = [...document.querySelectorAll('td-studio')].find((node) => node instanceof HTMLElement && states.get(node)?.labelDrag);
    if (labelHost instanceof HTMLElement) {
        moveLabel(labelHost, event);
        return;
    }
    const host = document.querySelector('td-studio[data-kind="scheduler"]');
    if (!(host instanceof HTMLElement)) return;
    const state = states.get(host);
    const drag = state?.sch.drag;
    if (!state || !drag) return;
    const under = document.elementFromPoint(event.clientX, event.clientY);
    const section = under?.closest('[data-st-col]');
    const col = section?.getAttribute('data-st-col') || drag.col;
    const box = section?.querySelector('.td-studio__col')?.getBoundingClientRect();
    if (!box) return;
    const minutes = 7 * 60 + ((event.clientY - drag.grab - box.top) / 48) * 60;
    const start = clamp(Math.round(minutes / 15) * 15, 7 * 60, 20 * 60 - drag.dur);
    if (Math.abs(event.clientY - (box.top + ((drag.s - 7 * 60) / 60) * 48 + drag.grab)) < 6 && col === drag.col && !drag.moved) return;
    if (start === drag.s && col === drag.col) return;
    drag.s = start;
    drag.e = start + drag.dur;
    drag.col = col;
    drag.moved = true;
    paint(host);
}

function moveLabel(host: HTMLElement, event: PointerEvent): void {
    const state = states.get(host);
    const drag = state?.labelDrag;
    if (!state || !drag) return;
    const el = state.label.els.find((item) => item.id === drag.id);
    if (!el) return;
    const scale = Number(host.dataset.lbScale) || labelScale(state.label);
    const dx = (event.clientX - drag.px) / scale;
    const dy = (event.clientY - drag.py) / scale;
    if (Math.hypot(event.clientX - drag.px, event.clientY - drag.py) > 3) drag.moved = true;
    if (drag.mode === 'move') {
        el.x = Math.max(0, Math.round((drag.x + dx) * 2) / 2);
        el.y = Math.max(0, Math.round((drag.y + dy) * 2) / 2);
    } else {
        el.w = Math.max(2, Math.round((drag.w + dx) * 2) / 2);
        el.h = Math.max(1, Math.round((drag.h + dy) * 2) / 2);
    }
    const node = host.querySelector(`[data-lb="${CSS.escape(el.id)}"]`);
    if (node) node.setAttribute('transform', `translate(${el.x} ${el.y})`);
    const hit = host.querySelector(`[data-st="${CSS.escape(`sel:${el.id}`)}"]`);
    if (hit instanceof HTMLElement) {
        hit.style.left = `${el.x * scale}px`;
        hit.style.top = `${el.y * scale}px`;
        hit.style.width = `${el.w * scale}px`;
        hit.style.height = `${Math.max(el.h, el.type === 'line' ? 1.2 : el.h) * scale}px`;
    }
    if (drag.mode === 'resize') paintSoon(host);
}

function endDrag(event: PointerEvent): void {
    const reportHost = [...document.querySelectorAll('td-studio')].find((node) => node instanceof HTMLElement && states.get(node)?.report.drag);
    if (reportHost instanceof HTMLElement) {
        const state = states.get(reportHost);
        if (!state) return;
        const moved = endReportDrag(state.report);
        if (moved) reportHost.dataset.skipClick = '1';
        paint(reportHost);
        if (moved) event.preventDefault();
        return;
    }
    const labelHost = [...document.querySelectorAll('td-studio')].find((node) => node instanceof HTMLElement && states.get(node)?.labelDrag);
    if (labelHost instanceof HTMLElement) {
        const state = states.get(labelHost);
        const moved = state?.labelDrag?.moved;
        if (state) state.labelDrag = null;
        if (moved) labelHost.dataset.skipClick = '1';
        if (moved) { event.preventDefault(); paint(labelHost); }
        return;
    }
    const host = document.querySelector('td-studio[data-kind="scheduler"]');
    if (!(host instanceof HTMLElement)) return;
    const state = states.get(host);
    const drag = state?.sch.drag;
    if (!state || !drag) return;
    state.sch.drag = null;
    if (!drag.moved) return;
    const work = state.sch.events.find((item) => item.id === drag.id);
    if (work) {
        work.s = drag.s;
        work.e = drag.e;
        if (drag.col.startsWith('d:')) work.date = drag.col.slice(2);
        if (drag.col.startsWith('r:')) work.res = drag.col.slice(2);
    }
    state.sch.skipClick = true;
    event.preventDefault();
    paint(host);
}

function onKey(event: KeyboardEvent): void {
    const host = document.querySelector('td-studio');
    if (!(host instanceof HTMLElement)) return;
    const state = states.get(host);
    if (!state) return;
    const target = event.target;
    const typing = target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
    if (host.dataset.kind === 'reportdesigner' && !typing && host.contains(target instanceof Node ? target : host)) {
        if (nudgeReport(state.report, event.key, event.shiftKey)) {
            event.preventDefault();
            paint(host);
        }
        return;
    }
    if (host.dataset.kind === 'labeldesigner' && !typing && state.label.sel) {
        const el = state.label.els.find((item) => item.id === state.label.sel);
        const step = event.shiftKey ? 2 : 0.5;
        if (el && event.key === 'ArrowLeft') el.x = Math.max(0, el.x - step);
        else if (el && event.key === 'ArrowRight') el.x += step;
        else if (el && event.key === 'ArrowUp') el.y = Math.max(0, el.y - step);
        else if (el && event.key === 'ArrowDown') el.y += step;
        else if (el && (event.key === 'Delete' || event.key === 'Backspace')) { state.label.els = state.label.els.filter((item) => item.id !== el.id); state.label.sel = null; }
        else return;
        event.preventDefault();
        paint(host);
        return;
    }
    if (host.dataset.kind === 'ehid' && state.hid.on) {
        if (state.hid.ignore && typing) return;
        if (typing && host.contains(target)) return;
        const now = performance.now();
        if (now - state.hid.lastAt > state.hid.gap) state.hid.buf = '';
        state.hid.lastAt = now;
        if (event.key === 'Enter') {
            if (state.hid.buf.length >= state.hid.minLen) pushHid(state, state.hid.buf);
            state.hid.buf = '';
            paint(host);
        } else if (event.key.length === 1) state.hid.buf += event.key;
    }
    if (host.dataset.kind === 'scanner' && state.scan.wedge && !typing) {
        const now = Date.now();
        if (now - state.scan.bufAt > 80) state.scan.buf = '';
        state.scan.bufAt = now;
        if (event.key === 'Enter' && state.scan.buf.length >= 4) {
            event.preventDefault();
            const code = state.scan.buf;
            state.scan.buf = '';
            emitScan(host, state, code, /^\d{13}$/.test(code) ? 'ean_13' : 'code_128', 'wedge');
        } else if (event.key.length === 1) state.scan.buf += event.key;
    }
}

function applyScenario(host: HTMLElement, state: StudioState): void {
    const kind = host.dataset.kind || '';
    if (kind === 'labeldesigner') {
        const lb = state.label;
        const width = Number(host.dataset.width);
        const height = Number(host.dataset.height);
        const dpi = Number(host.dataset.dpi);
        const copies = Number(host.dataset.copies);
        if (width) lb.w = clamp(width, 10, 200);
        if (height) lb.h = clamp(height, 10, 300);
        if (dpi === 203 || dpi === 300) lb.dpi = dpi;
        if (copies) lb.copies = clamp(Math.round(copies), 1, 99);
        if (host.dataset.template) {
            try {
                const parsed = JSON.parse(host.dataset.template) as { size?: { width?: number; height?: number; dpi?: number }; elements?: LabelEl[] };
                if (parsed.size && Array.isArray(parsed.elements)) {
                    lb.els = parsed.elements.map((el, index) => ({ ...el, id: el.id || `e${index + 1}` }));
                    lb.w = clamp(Number(parsed.size.width) || lb.w, 10, 200);
                    lb.h = clamp(Number(parsed.size.height) || lb.h, 10, 300);
                    if (parsed.size.dpi === 203 || parsed.size.dpi === 300) lb.dpi = parsed.size.dpi;
                    lb.sel = lb.els[0]?.id ?? null;
                    lb.nid = lb.els.length;
                }
            } catch {
                /* La plantilla de la página no se pudo leer: queda la etiqueta de producto. */
            }
        }
        if (host.dataset.record) {
            try {
                const record = JSON.parse(host.dataset.record) as Record<string, string>;
                if (typeof record.code === 'string') lb.record = record;
            } catch {
                /* Sin ficha válida se usa el repuesto de la lista. */
            }
        }
        return;
    }
    if (kind === 'reportdesigner') {
        applyReportHost(state.report, host);
        return;
    }
    if (kind === 'printers' && host.dataset.devices) {
        try {
            const list = JSON.parse(host.dataset.devices) as { id: string; name: string; model: string; connection: string; address: string; protocol: string; dpi: number; widthMm: number; connected: boolean; isDefault: boolean; unreachable?: boolean }[];
            if (!Array.isArray(list) || !list.length) return;
            state.print.devs = list.map((device) => ({
                id: device.id,
                name: device.name,
                model: device.model,
                conn: device.connection === 'bt' ? 'bt' : 'wifi',
                addr: device.address,
                proto: device.protocol,
                dpi: device.dpi || 203,
                width: device.widthMm || 104,
                status: device.connected ? 'connected' : 'disconnected',
                rssi: device.id === 'ql820' ? -66 : device.connection === 'bt' ? -61 : -48,
                battery: device.id === 'zq520' ? 82 : undefined,
                def: device.isDefault,
                fw: device.id === 'zd421' ? 'V93.21.15Z' : device.id === 'ql820' ? '1.21' : device.id === 'zq520' ? 'V85.20.19' : '—',
                jobs: device.id === 'zd421' ? 128 : device.id === 'ql820' ? 42 : device.id === 'zq520' ? 311 : 0,
                unreachable: device.unreachable,
                err: device.unreachable ? 'No responde en el puerto 9100. Revisa que esté encendida y en la misma red.' : undefined,
            }));
            state.print.sel = state.print.devs.find((device) => device.def)?.id ?? state.print.devs[0].id;
        } catch {
            /* Sin lista válida quedan las impresoras de bodega. */
        }
        return;
    }
    if (kind === 'ehid') {
        const min = Number(host.dataset.min);
        if (min) state.hid.minLen = clamp(Math.round(min), 1, 64);
        if (host.dataset.gap != null) state.hid.gap = Math.max(0, Number(host.dataset.gap) || 0);
        state.hid.ignore = host.dataset.ignore === 'true';
        if (host.dataset.initial) pushHid(state, host.dataset.initial);
        return;
    }
    if (kind === 'scanner') {
        if (host.dataset.mode === 'single' || host.dataset.mode === 'continuous') state.scan.mode = host.dataset.mode;
        if (host.dataset.wedge === 'true' || host.dataset.wedge === 'false') state.scan.wedge = host.dataset.wedge === 'true';
        if (host.dataset.initial) {
            const value = host.dataset.initial;
            const read = { value, format: 'code_128', source: 'wedge', t: clock(), id: 1 };
            state.scan.reads = [read];
            state.scan.last = read;
            state.scan.lastCode = value;
            state.scan.lastAt = Date.now();
        }
    }
}

function watchLabel(host: HTMLElement): void {
    if (host.dataset.tdLbWatch === '1' || typeof ResizeObserver === 'undefined') return;
    host.dataset.tdLbWatch = '1';
    const observer = new ResizeObserver(() => {
        const state = states.get(host);
        const well = host.querySelector('.td-studio__well');
        const width = Math.round((well instanceof HTMLElement ? well.clientWidth : host.clientWidth) || 0);
        if (!state || !width || state.labelDrag || Math.abs(width - state.label.avail) < 16) return;
        state.label.avail = width;
        paint(host);
    });
    observer.observe(host);
}

export function bindStudio(root: ParentNode = document): void {
    root.querySelectorAll<HTMLElement>('td-studio').forEach((host) => {
        if (states.has(host)) return;
        const state = fresh();
        applyScenario(host, state);
        states.set(host, state);
        host.addEventListener('click', (event) => {
            const state = states.get(host);
            if (host.dataset.skipClick === '1') { delete host.dataset.skipClick; return; }
            if (state?.sch.skipClick) { state.sch.skipClick = false; return; }
            const target = event.target instanceof Element ? event.target.closest('[data-st]') : null;
            if (!(target instanceof HTMLElement) || target instanceof HTMLInputElement) return;
            if (target.dataset.st?.startsWith('slot:') && event.target !== target) return;
            act(host, target.dataset.st || '');
        });
        host.addEventListener('pointerdown', (event) => beginDrag(host, event));
        host.addEventListener('change', (event) => {
            const target = event.target;
            if (target instanceof HTMLInputElement && target.dataset.stFile === 'uxr') {
                const current = states.get(host);
                if (current) openReportFile(host, current.report, target, () => paint(host));
                return;
            }
            if (target instanceof HTMLInputElement && target.dataset.st === 'grid') { const state = states.get(host); if (state) state.label.grid = target.checked; paint(host); return; }
            if (target instanceof HTMLInputElement && (target.dataset.st === 'bold' || target.dataset.st === 'showtext')) {
                const state = states.get(host);
                const el = state?.label.els.find((item) => item.id === state.label.sel);
                if (el && target.dataset.st === 'bold') el.bold = target.checked;
                if (el && target.dataset.st === 'showtext') el.showText = target.checked;
                paint(host);
                return;
            }
            if (target instanceof HTMLInputElement && target.dataset.st === 'hidon') { const state = states.get(host); if (state) state.hid.on = target.checked; paint(host); return; }
            if (target instanceof HTMLInputElement && target.dataset.st === 'hidignore') { const state = states.get(host); if (state) state.hid.ignore = target.checked; paint(host); return; }
            if (target instanceof HTMLInputElement && target.dataset.st === 'swedge') { const state = states.get(host); if (state) state.scan.wedge = target.checked; paint(host); return; }
            onInput(host, target);
        });
        host.addEventListener('input', (event) => { if (!(event.target instanceof HTMLSelectElement)) onInput(host, event.target); });
        host.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' || !(event.target instanceof HTMLInputElement) || event.target.dataset.stIn !== 'manual') return;
            event.preventDefault();
            act(host, 'sadd');
        });
        paint(host);
        if (host.dataset.kind === 'reportdesigner') watchReportWidth(host, () => states.get(host)?.report, () => paint(host));
        if (host.dataset.kind === 'labeldesigner') watchLabel(host);
    });
    if (!document.documentElement.dataset.tdStudioKeys) {
        document.documentElement.dataset.tdStudioKeys = '1';
        document.addEventListener('keydown', onKey, true);
        document.addEventListener('pointermove', moveDrag);
        document.addEventListener('pointerup', endDrag);
    }
}
