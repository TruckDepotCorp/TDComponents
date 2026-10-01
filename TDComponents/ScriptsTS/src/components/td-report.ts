import { encodeBarcode, encodeQr } from './td-codes';
import { PARTS } from './td-ecom';

export type ReportElType = 'text' | 'line' | 'box' | 'image' | 'qr' | 'barcode';
type Align = 'left' | 'center' | 'right';
type ParamType = 'texto' | 'numero' | 'fecha';
type PageSize = 'A4' | 'Carta';
type BandName = 'header' | 'footer';

export interface ReportEl {
    id: string;
    type: ReportElType;
    x: number;
    y: number;
    w: number;
    h: number;
    text?: string;
    size?: number;
    bold?: boolean;
    align?: Align;
    thick?: number;
    format?: string;
    showText?: boolean;
}

export interface ReportCol {
    title: string;
    expr: string;
    w: number;
    fmt: string;
    align?: Align;
}

export interface ReportParam {
    name: string;
    type: ParamType;
    value: string;
}

export interface ReportTpl {
    format: 'uiux-report';
    version: 1;
    name: string;
    page: { size: PageSize; margin: number };
    parameters: ReportParam[];
    bands: {
        header: { height: number; elements: ReportEl[] };
        detail: { source: string; rowHeight: number; headHeight: number; zebra: boolean; columns: ReportCol[] };
        footer: { height: number; elements: ReportEl[] };
    };
}

export type ReportSel =
    | { kind: 'el'; band: BandName; id: string }
    | { kind: 'band'; band: BandName }
    | { kind: 'detail' }
    | null;

export interface ReportDrag {
    band: BandName;
    id: string;
    mode: 'move' | 'resize';
    x: number;
    y: number;
    w: number;
    h: number;
    px: number;
    py: number;
    moved: boolean;
}

export interface ReportState {
    mode: 'design' | 'preview' | 'code';
    tplKey: string;
    tpl: ReportTpl;
    sel: ReportSel;
    rows: number;
    pv: Record<string, string>;
    json: string | null;
    jsonMsg: string;
    jsonBad: boolean;
    dataJson: string | null;
    dataMsg: string;
    dataBad: boolean;
    fileMsg: string;
    fileBad: boolean;
    timer: number;
    nid: number;
    avail: number;
    scale: number;
    runData: Record<string, Row[]> | null;
    runParams: Record<string, string> | null;
    drag: ReportDrag | null;
}

type Row = Record<string, string | number>;
type Repaint = () => void;

const NAMES: Record<ReportElType, string> = {
    text: 'Texto',
    line: 'Línea',
    box: 'Recuadro',
    image: 'Imagen',
    qr: 'QR',
    barcode: 'Código de barras',
};

const FONT = 'Barlow, Arial, Helvetica, sans-serif';
const MONO = '"JetBrains Mono", Consolas, monospace';

function clamp(n: number, a: number, b: number): number { return Math.max(a, Math.min(b, n)); }
function r2(n: number): number { return Math.round(n * 100) / 100; }
function esc(value: string): string { return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c)); }
function money(n: number): string { return `$ ${Math.round(n).toLocaleString('es-CL')}`; }
function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }

function el(type: ReportElType, x: number, y: number, w: number, h: number, extra: Partial<ReportEl> = {}): ReportEl {
    return { id: '', type, x, y, w, h, ...extra };
}

function tx(x: number, y: number, w: number, h: number, text: string, size: number, extra: Partial<ReportEl> = {}): ReportEl {
    return el('text', x, y, w, h, { text, size, bold: false, align: 'left', ...extra });
}

function templates(): Record<'factura' | 'stock', ReportTpl> {
    return {
        factura: {
            format: 'uiux-report', version: 1, name: 'Factura', page: { size: 'A4', margin: 12 },
            parameters: [
                { name: 'NumeroFactura', type: 'texto', value: 'F-000481' },
                { name: 'Cliente', type: 'texto', value: 'Transportes del Sur SpA' },
                { name: 'RutCliente', type: 'texto', value: '76.543.210-K' },
                { name: 'Fecha', type: 'fecha', value: '2026-09-23' },
                { name: 'Vendedor', type: 'texto', value: 'Camila Rojas' },
            ],
            bands: {
                header: {
                    height: 62,
                    elements: [
                        el('image', 0, 0, 40, 15, { text: 'Logo' }),
                        tx(0, 18, 110, 6, 'Distribuidora de Repuestos SpA', 4.4, { bold: true }),
                        tx(0, 25, 115, 4, 'RUT 77.123.456-7 · Av. Américo Vespucio 1500, Quilicura', 2.6),
                        el('box', 120, 0, 66, 27, { thick: 0.5 }),
                        tx(120, 3.5, 66, 4.5, 'FACTURA ELECTRÓNICA', 3.4, { bold: true, align: 'center' }),
                        tx(120, 10, 66, 7, 'N° {?NumeroFactura}', 5.6, { bold: true, align: 'center' }),
                        tx(120, 19.5, 66, 4, 'Fecha {?Fecha|date}', 2.8, { align: 'center' }),
                        el('line', 0, 34, 186, 0.3, { thick: 0.3 }),
                        tx(0, 37.5, 60, 3.5, 'CLIENTE', 2.4, { bold: true }),
                        tx(0, 41.5, 140, 5.5, '{?Cliente}', 4.2, { bold: true }),
                        tx(0, 48.5, 140, 4, 'RUT {?RutCliente} · Vendedor {?Vendedor}', 2.7),
                        el('qr', 164, 37, 22, 22, { text: 'https://sii.cl/verificar/{?NumeroFactura}' }),
                    ],
                },
                detail: {
                    source: 'Lineas', rowHeight: 7, headHeight: 8, zebra: true,
                    columns: [
                        { title: 'Código', expr: 'codigo', w: 17, fmt: '' },
                        { title: 'Descripción', expr: 'descripcion', w: 41, fmt: '' },
                        { title: 'Cant.', expr: 'cantidad', w: 10, fmt: 'number', align: 'right' },
                        { title: 'Precio', expr: 'precio', w: 16, fmt: 'money', align: 'right' },
                        { title: 'Total', expr: 'cantidad*precio', w: 16, fmt: 'money', align: 'right' },
                    ],
                },
                footer: {
                    height: 46,
                    elements: [
                        tx(0, 4, 100, 4, 'Líneas: {=count(Lineas)} · unidades: {=sum(Lineas, cantidad)}', 2.7),
                        el('barcode', 0, 12, 72, 16, { text: '{?NumeroFactura}', format: 'c128', showText: true }),
                        tx(110, 4, 40, 4.5, 'Subtotal', 3, { align: 'right' }),
                        tx(152, 4, 34, 4.5, '{=sum(Lineas, cantidad*precio)|money}', 3, { align: 'right' }),
                        tx(110, 10, 40, 4.5, 'IVA 19%', 3, { align: 'right' }),
                        tx(152, 10, 34, 4.5, '{=sum(Lineas, cantidad*precio)*0.19|money}', 3, { align: 'right' }),
                        el('line', 120, 16.5, 66, 0.4, { thick: 0.4 }),
                        tx(110, 19, 40, 6, 'TOTAL', 4.4, { bold: true, align: 'right' }),
                        tx(140, 19, 46, 6, '{=sum(Lineas, cantidad*precio)*1.19|money}', 4.4, { bold: true, align: 'right' }),
                        tx(0, 36, 186, 4, 'Documento generado con TDReport · {now|date}', 2.3, { align: 'center' }),
                    ],
                },
            },
        },
        stock: {
            format: 'uiux-report', version: 1, name: 'Informe de stock', page: { size: 'A4', margin: 12 },
            parameters: [
                { name: 'Bodega', type: 'texto', value: 'Quilicura' },
                { name: 'FechaCorte', type: 'fecha', value: '2026-09-23' },
                { name: 'Responsable', type: 'texto', value: 'Jefe de bodega' },
            ],
            bands: {
                header: {
                    height: 30,
                    elements: [
                        tx(0, 0, 130, 9, 'INFORME DE STOCK', 7, { bold: true }),
                        tx(0, 11, 150, 4.5, 'Bodega {?Bodega} · corte al {?FechaCorte|date} · {?Responsable}', 3.1),
                        el('line', 0, 22, 186, 0.6, { thick: 0.6 }),
                        el('qr', 170, 0, 16, 16, { text: 'stock:{?Bodega}:{?FechaCorte}' }),
                    ],
                },
                detail: {
                    source: 'Repuestos', rowHeight: 6.5, headHeight: 8, zebra: true,
                    columns: [
                        { title: 'Código', expr: 'codigo', w: 16, fmt: '' },
                        { title: 'Repuesto', expr: 'nombre', w: 34, fmt: '' },
                        { title: 'Marca', expr: 'marca', w: 14, fmt: '' },
                        { title: 'Stock', expr: 'stock', w: 9, fmt: 'number', align: 'right' },
                        { title: 'Precio', expr: 'precio', w: 13, fmt: 'money', align: 'right' },
                        { title: 'Valorizado', expr: 'stock*precio', w: 14, fmt: 'money', align: 'right' },
                    ],
                },
                footer: {
                    height: 24,
                    elements: [
                        el('line', 0, 2, 186, 0.4, { thick: 0.4 }),
                        tx(0, 6, 60, 5, 'Repuestos: {=count(Repuestos)}', 3.2, { bold: true }),
                        tx(62, 6, 60, 5, 'Unidades: {=sum(Repuestos, stock)|number}', 3.2, { bold: true }),
                        tx(110, 6, 76, 5, 'Valorizado: {=sum(Repuestos, stock*precio)|money}', 3.2, { bold: true, align: 'right' }),
                        tx(0, 15, 186, 4, 'Sin stock: {=sum(Repuestos, stock==0?1:0)} repuestos', 2.7),
                    ],
                },
            },
        },
    };
}

function blankTemplate(): ReportTpl {
    return {
        format: 'uiux-report', version: 1, name: 'Nuevo reporte', page: { size: 'A4', margin: 12 },
        parameters: [{ name: 'Titulo', type: 'texto', value: 'Mi reporte' }],
        bands: {
            header: { height: 24, elements: [tx(0, 0, 186, 8, '{?Titulo}', 6, { bold: true })] },
            detail: { source: 'Lineas', rowHeight: 7, headHeight: 8, zebra: false, columns: [{ title: 'Código', expr: 'codigo', w: 30, fmt: '' }, { title: 'Descripción', expr: 'descripcion', w: 70, fmt: '' }] },
            footer: { height: 16, elements: [] },
        },
    };
}

function stamp(tpl: ReportTpl): void {
    tpl.bands.header.elements.forEach((item, index) => { if (!item.id) item.id = `h${index}`; });
    tpl.bands.footer.elements.forEach((item, index) => { if (!item.id) item.id = `f${index}`; });
}

function valuesOf(tpl: ReportTpl): Record<string, string> {
    return Object.fromEntries(tpl.parameters.map((param) => [param.name, param.value]));
}

export function freshReport(): ReportState {
    const tpl = clone(templates().factura);
    stamp(tpl);
    return {
        mode: 'design', tplKey: 'factura', tpl, sel: null, rows: 8, pv: valuesOf(tpl),
        json: null, jsonMsg: '', jsonBad: false, dataJson: null, dataMsg: '', dataBad: false,
        fileMsg: '', fileBad: false, timer: 0, nid: 100, avail: 720, scale: 2.4,
        runData: null, runParams: null, drag: null,
    };
}

export function applyReportHost(report: ReportState, host: HTMLElement): void {
    const key = host.dataset.report;
    if (key === 'factura' || key === 'stock') {
        report.tplKey = key;
        report.tpl = clone(templates()[key]);
        stamp(report.tpl);
        report.pv = valuesOf(report.tpl);
        report.sel = null;
        report.runData = null;
        report.runParams = null;
        report.json = null;
    }
    const rows = Number(host.dataset.rows);
    if (rows) report.rows = clamp(Math.round(rows), 1, 60);
    const seeded: Record<string, string | undefined> = {
        NumeroFactura: host.dataset.numero,
        Cliente: host.dataset.cliente,
        RutCliente: host.dataset.rut,
        Fecha: host.dataset.fecha,
        Vendedor: host.dataset.vendedor,
        Bodega: host.dataset.bodega,
        FechaCorte: host.dataset.fechaCorte,
        Responsable: host.dataset.responsable,
    };
    for (const param of report.tpl.parameters) {
        const value = seeded[param.name];
        if (!value) continue;
        param.value = value;
        report.pv[param.name] = value;
    }
}

function flash(host: HTMLElement, report: ReportState, message: string, bad: boolean, repaint: Repaint): void {
    report.fileMsg = message;
    report.fileBad = bad;
    window.clearTimeout(report.timer);
    report.timer = window.setTimeout(() => {
        report.fileMsg = '';
        if (host.isConnected) repaint();
    }, 4500);
}

function pageSize(size: PageSize): [number, number] {
    return size === 'Carta' ? [216, 279] : [210, 297];
}

function contentWidth(tpl: ReportTpl): number {
    const [width] = pageSize(tpl.page.size);
    return width - tpl.page.margin * 2;
}

function sampleRows(source: string, count: number): Row[] {
    if (source === 'Repuestos') {
        return Array.from({ length: count }, (_, index) => {
            const part = PARTS[index % PARTS.length];
            return { codigo: part.code, nombre: part.name, marca: part.brand, categoria: part.cat, stock: part.stock, precio: part.price };
        });
    }
    return Array.from({ length: count }, (_, index) => {
        const part = PARTS[index % PARTS.length];
        return { codigo: part.code, descripcion: part.name, cantidad: (index * 7) % 4 + 1, precio: part.price };
    });
}

function fmtValue(value: unknown, fmt: string): string {
    if (value == null || value === '') return '';
    if (fmt === 'money') return money(Math.round(Number(value) || 0));
    if (fmt === 'number') return (Number(value) || 0).toLocaleString('es-CL');
    if (fmt === 'date') {
        const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
        return match ? `${match[3]}/${match[2]}/${match[1]}` : String(value);
    }
    return String(value);
}

function calc(expr: string, row: Row | null, sources: Record<string, Row[]>, params: Record<string, string>): unknown {
    let text = String(expr).replace(/\?([A-Za-z_][A-Za-z0-9_]*)/g, (_match, key: string) => {
        const value = params[key];
        return Number.isNaN(Number(value)) || value === '' ? JSON.stringify(String(value ?? '')) : String(Number(value));
    });
    text = text.replace(/(sum|avg|min|max)\(\s*(\w+)\s*,\s*([^)]*)\)/g, (_match, fn: string, source: string, sub: string) => {
        const values = (sources[source] || []).map((item) => Number(calc(sub, item, sources, params)) || 0);
        if (!values.length) return '0';
        if (fn === 'sum') return String(values.reduce((a, b) => a + b, 0));
        if (fn === 'avg') return String(values.reduce((a, b) => a + b, 0) / values.length);
        if (fn === 'min') return String(Math.min(...values));
        return String(Math.max(...values));
    });
    text = text.replace(/count\(\s*(\w+)\s*\)/g, (_match, source: string) => String((sources[source] || []).length));
    if (row) {
        text = text.replace(/"[^"]*"|\b([A-Za-z_]\w*)\b/g, (match, id: string) => {
            if (!id || !(id in row)) return match;
            const value = row[id];
            return typeof value === 'number' ? String(value) : JSON.stringify(String(value));
        });
    }
    if (/^\s*"[^"]*"\s*$/.test(text)) return JSON.parse(text) as string;
    if (!/^[0-9.+\-*/()<>=!?: ]*$/.test(text)) throw new Error(`Expresión no válida: ${expr}`);
    return Function(`"use strict"; return (${text.trim() || '0'})`)() as unknown;
}

function resolve(text: string, row: Row | null, page: [number, number] | null, tpl: ReportTpl, sources: Record<string, Row[]>, params: Record<string, string>): string {
    return String(text ?? '').replace(/\{([^{}]+)\}/g, (token, inner: string) => {
        const [expr, fmt = ''] = inner.split('|');
        try {
            if (expr === 'page') return String(page ? page[0] : 1);
            if (expr === 'pages') return String(page ? page[1] : 1);
            if (expr === 'now') return fmtValue(new Date().toISOString().slice(0, 10), fmt || 'date');
            if (expr.startsWith('?')) {
                const name = expr.slice(1);
                const declared = tpl.parameters.find((param) => param.name === name);
                return fmtValue(params[name], fmt || (declared?.type === 'fecha' ? 'date' : ''));
            }
            if (expr.startsWith('=')) return fmtValue(calc(expr.slice(1), row, sources, params), fmt);
            if (row && expr in row) return fmtValue(row[expr], fmt);
            return token;
        } catch {
            return '#ERR';
        }
    });
}

function cellValue(col: ReportCol, row: Row, sources: Record<string, Row[]>, params: Record<string, string>): string {
    try {
        const value = col.expr in row ? row[col.expr] : calc(col.expr, row, sources, params);
        return fmtValue(value, col.fmt);
    } catch {
        return '#ERR';
    }
}

function fitSvg(svg: string, meet: boolean): string {
    return svg
        .replace(/\swidth="[^"]*"/, '')
        .replace(/\sheight="[^"]*"/, '')
        .replace('<svg ', `<svg preserveAspectRatio="${meet ? 'xMidYMid meet' : 'none'}" style="width:100%;height:100%;display:block" `);
}

function elementHtml(item: ReportEl, unit: (n: number) => string, row: Row, page: [number, number], tpl: ReportTpl, sources: Record<string, Row[]>, params: Record<string, string>): string {
    const box = `position:absolute;left:${unit(item.x)};top:${unit(item.y)};width:${unit(item.w)};height:${unit(item.h)};`;
    if (item.type === 'text') {
        return `<div style="${box}font:${item.bold ? 700 : 400} ${unit(item.size || 3)}/1.15 ${FONT};text-align:${item.align || 'left'};white-space:nowrap;overflow:hidden;color:#0A0B0C">${esc(resolve(item.text || '', row, page, tpl, sources, params))}</div>`;
    }
    if (item.type === 'line') return `<div style="${box}height:${unit(item.thick || 0.3)};background:#0A0B0C"></div>`;
    if (item.type === 'box') return `<div style="${box}box-sizing:border-box;border:${unit(item.thick || 0.3)} solid #0A0B0C"></div>`;
    if (item.type === 'image') {
        return `<div style="${box}box-sizing:border-box;border:${unit(0.3)} dashed #9CA3AB;background:#F1F2F4;display:flex;align-items:center;justify-content:center;font:500 ${unit(2.6)} ${MONO};color:#6E757D">${esc(item.text || 'Imagen')}</div>`;
    }
    if (item.type === 'qr') {
        const text = resolve(item.text || '', row, page, tpl, sources, params) || ' ';
        const qr = encodeQr(text, 'M', 1, '#0A0B0C', 0);
        if (qr.error || !qr.svg) return `<div style="${box}border:1px dashed #C62828;color:#C62828;font:500 ${unit(2.4)} ${FONT};display:flex;align-items:center;justify-content:center">QR no válido</div>`;
        const size = Math.min(item.w, item.h);
        return `<div style="position:absolute;left:${unit(item.x)};top:${unit(item.y)};width:${unit(size)};height:${unit(size)}">${fitSvg(qr.svg, true)}</div>`;
    }
    if (item.type === 'barcode') {
        const text = resolve(item.text || '', row, page, tpl, sources, params);
        const code = encodeBarcode(item.format === 'ean13' ? 'ean13' : 'c128', text, 1, 40, '#0A0B0C', false);
        if (code.error || !code.svg) return `<div style="${box}border:1px dashed #C62828;color:#C62828;font:500 ${unit(2.4)} ${FONT};display:flex;align-items:center;padding:0 4px">Código no válido</div>`;
        const label = item.showText ? Math.min(3.2, item.h * 0.22) : 0;
        return `<div style="${box}display:flex;flex-direction:column"><div style="flex:1;min-height:0">${fitSvg(code.svg, false)}</div>${label ? `<div style="text-align:center;font:${unit(label)}/1.2 ${MONO};letter-spacing:.08em">${esc(code.value)}</div>` : ''}</div>`;
    }
    return '';
}

function tableHtml(tpl: ReportTpl, rows: Row[], unit: (n: number) => string, sources: Record<string, Row[]>, params: Record<string, string>): string {
    const detail = tpl.bands.detail;
    const sum = detail.columns.reduce((total, col) => total + (Number(col.w) || 0), 0) || 100;
    const cols = detail.columns.map((col) => `<col style="width:${(Number(col.w) || 0) / sum * 100}%">`).join('');
    const head = `<thead><tr>${detail.columns.map((col) => `<th style="height:${unit(detail.headHeight)};padding:0 ${unit(1.5)};background:#EEF0F2;border-top:${unit(0.3)} solid #0A0B0C;border-bottom:${unit(0.3)} solid #0A0B0C;font-weight:700;font-size:${unit(2.5)};text-transform:uppercase;letter-spacing:.04em;text-align:${col.align || 'left'};white-space:nowrap;overflow:hidden">${esc(col.title)}</th>`).join('')}</tr></thead>`;
    const body = rows.map((row, index) => `<tr style="background:${detail.zebra && index % 2 ? '#F6F7F8' : '#FFFFFF'}">${detail.columns.map((col) => `<td style="height:${unit(detail.rowHeight)};padding:0 ${unit(1.5)};border-bottom:${unit(0.2)} solid #DCDFE3;text-align:${col.align || 'left'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${/^(codigo|code)$/.test(col.expr) ? `font-family:${MONO};font-size:${unit(2.5)};` : ''}">${esc(cellValue(col, row, sources, params))}</td>`).join('')}</tr>`).join('');
    return `<table style="position:absolute;left:0;top:0;width:${unit(contentWidth(tpl))};border-collapse:collapse;table-layout:fixed;font:400 ${unit(2.8)} ${FONT};color:#0A0B0C"><colgroup>${cols}</colgroup>${head}<tbody>${body}</tbody></table>`;
}

interface PageItem { kind: 'header' | 'footer' | 'table'; y: number; rows?: Row[] }
interface Page { items: PageItem[] }

function layoutPages(tpl: ReportTpl, rows: Row[]): Page[] {
    const [, height] = pageSize(tpl.page.size);
    const margin = tpl.page.margin;
    const detail = tpl.bands.detail;
    const limit = height - margin - 7;
    const pages: Page[] = [{ items: [] }];
    let page = pages[0];
    let y = margin;
    page.items.push({ kind: 'header', y });
    y += tpl.bands.header.height;
    const next = () => { page = { items: [] }; pages.push(page); y = margin; };
    let index = 0;
    if (!rows.length) {
        page.items.push({ kind: 'table', y, rows: [] });
    }
    while (index < rows.length) {
        if (y + detail.headHeight + detail.rowHeight > limit) next();
        const room = Math.max(1, Math.floor((limit - y - detail.headHeight) / detail.rowHeight));
        const chunk = rows.slice(index, index + room);
        page.items.push({ kind: 'table', y, rows: chunk });
        y += detail.headHeight + chunk.length * detail.rowHeight + 2;
        index += chunk.length;
        if (index < rows.length) next();
    }
    if (y + tpl.bands.footer.height > limit) next();
    page.items.push({ kind: 'footer', y });
    return pages;
}

function pageHtml(tpl: ReportTpl, page: Page, index: number, total: number, unit: (n: number) => string, sample: Row, sources: Record<string, Row[]>, params: Record<string, string>): string {
    const [width, height] = pageSize(tpl.page.size);
    const margin = tpl.page.margin;
    const inner = contentWidth(tpl);
    const body = page.items.map((item) => {
        const content = item.kind === 'table'
            ? tableHtml(tpl, item.rows || [], unit, sources, params)
            : tpl.bands[item.kind].elements.map((element) => elementHtml(element, unit, sample, [index + 1, total], tpl, sources, params)).join('');
        return `<div style="position:absolute;left:${unit(margin)};top:${unit(item.y)};width:${unit(inner)};height:${item.kind === 'table' ? 'auto' : unit(tpl.bands[item.kind].height)}">${content}</div>`;
    }).join('');
    const foot = margin - 6 > 2 ? margin - 6 : 3;
    return `<div style="position:relative;width:${unit(width)};height:${unit(height)};background:#fff;overflow:hidden;box-sizing:border-box">${body}<div style="position:absolute;left:${unit(margin)};right:${unit(margin)};bottom:${unit(foot)};display:flex;justify-content:space-between;font:400 ${unit(2.3)} ${FONT};color:#6E757D"><span>${esc(tpl.name)}</span><span>Página ${index + 1} de ${total}</span></div></div>`;
}

function fileName(name: string): string {
    return `${(name || 'reporte').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w-]+/g, '-')}.uxr`;
}

function serial(tpl: ReportTpl, withDate: boolean): string {
    const payload = withDate ? { ...tpl, savedAt: new Date().toISOString() } : tpl;
    return JSON.stringify(payload, null, 2);
}

function selectedElement(report: ReportState): ReportEl | null {
    if (report.sel?.kind !== 'el') return null;
    const { band, id } = report.sel;
    return report.tpl.bands[band].elements.find((item) => item.id === id) ?? null;
}

function targetBand(sel: ReportSel): BandName {
    if (sel && sel.kind !== 'detail') return sel.band;
    return 'header';
}

function nextId(report: ReportState): string {
    report.nid += 1;
    return `r${report.nid}`;
}

function editTpl(report: ReportState, change: (tpl: ReportTpl) => void): void {
    const copy = clone(report.tpl);
    change(copy);
    report.tpl = copy;
    report.json = null;
}

function loadTemplate(report: ReportState, raw: unknown): string {
    if (!raw || typeof raw !== 'object') throw new Error('el archivo no tiene una plantilla');
    const obj = raw as ReportTpl;
    if (obj.format !== 'uiux-report' || !obj.bands?.detail || !obj.bands.header || !obj.bands.footer) {
        throw new Error('no es una plantilla de reporte .uxr');
    }
    if (!Array.isArray(obj.bands.detail.columns) || !Array.isArray(obj.parameters)) {
        throw new Error('faltan las columnas o los parámetros');
    }
    obj.version = 1;
    obj.page = { size: obj.page?.size === 'Carta' ? 'Carta' : 'A4', margin: clamp(Number(obj.page?.margin) || 12, 5, 30) };
    obj.bands.header.elements = obj.bands.header.elements || [];
    obj.bands.footer.elements = obj.bands.footer.elements || [];
    obj.bands.header.height = clamp(Number(obj.bands.header.height) || 20, 5, 200);
    obj.bands.footer.height = clamp(Number(obj.bands.footer.height) || 16, 5, 200);
    stamp(obj);
    report.tpl = obj;
    report.sel = null;
    report.json = null;
    report.runData = null;
    report.runParams = null;
    report.pv = Object.fromEntries((obj.parameters || []).map((param) => [param.name, String(param.value ?? '')]));
    return obj.name || 'Plantilla';
}

function context(report: ReportState) {
    const tpl = report.tpl;
    const source = tpl.bands.detail.source || 'Lineas';
    const rows = (report.runData && report.runData[source]) || sampleRows(source, report.rows);
    const sources: Record<string, Row[]> = { [source]: rows };
    const params = report.runParams || report.pv;
    return { tpl, source, rows, sources, params, sample: rows[0] || {} };
}

function insertToken(host: HTMLElement, report: ReportState, token: string, repaint: Repaint): void {
    const current = selectedElement(report);
    if (current && (current.type === 'text' || current.type === 'qr' || current.type === 'barcode')) {
        editTpl(report, (tpl) => {
            const band = report.sel?.kind === 'el' ? report.sel.band : 'header';
            const item = tpl.bands[band].elements.find((el) => el.id === current.id);
            if (!item) return;
            item.text = item.type === 'text' ? `${item.text ? `${item.text} ` : ''}${token}` : token;
        });
        return;
    }
    if (report.sel?.kind === 'detail') {
        flash(host, report, 'Selecciona un texto del encabezado o del pie. En el detalle, escribe el campo en la columna.', true, repaint);
        return;
    }
    const band = targetBand(report.sel);
    const id = nextId(report);
    editTpl(report, (tpl) => {
        tpl.bands[band].elements.push(tx(0, 0, 80, 5, token, 3.2));
        const added = tpl.bands[band].elements.at(-1);
        if (added) added.id = id;
    });
    report.sel = { kind: 'el', band, id };
}

function seg(items: [string, string][], current: string, action: (key: string) => string): string {
    return `<div class="td-ecom__seg" role="group">${items.map(([key, label]) => `<button type="button" data-st="${action(key)}" aria-pressed="${current === key}">${label}</button>`).join('')}</div>`;
}

function track(on: boolean, label: string, action: string): string {
    return `<button type="button" class="td-rpt__switch" role="switch" aria-checked="${on}" data-st="${action}"><span class="td-rpt__track${on ? ' is-on' : ''}" aria-hidden="true"></span>${label}</button>`;
}

function field(label: string, control: string): string {
    return `<label>${label}${control}</label>`;
}

export function renderReport(report: ReportState): string {
    const { tpl, source, rows, sources, params, sample } = context(report);
    const [pageW, pageH] = pageSize(tpl.page.size);
    const margin = tpl.page.margin;
    const mode = report.mode;
    const unit = (scale: number) => (n: number) => `${r2(n * scale)}px`;
    const designScale = clamp((report.avail - 44) / pageW, 1.4, 4.2);
    report.scale = designScale;
    const px = unit(designScale);
    const detail = tpl.bands.detail;
    const fields = Object.keys(rows[0] || { codigo: '', descripcion: '' });
    const numeric = fields.find((key) => typeof (rows[0] || {})[key] === 'number') || 'cantidad';
    const formulas: [string, string][] = [
        ['Σ suma', `{=sum(${source}, ${numeric})|number}`],
        ['# conteo', `{=count(${source})}`],
        ['Página', 'Página {page} de {pages}'],
        ['Hoy', '{now|date}'],
    ];
    const note = report.fileMsg || 'El archivo .uxr guarda bandas, parámetros y fuentes. Se reutiliza pasando otros valores y datos.';
    const noteClass = report.fileMsg ? (report.fileBad ? 'is-bad' : 'is-ok') : '';
    const bandLabel = targetBand(report.sel) === 'header' ? 'encabezado' : 'pie';
    const pages = layoutPages(tpl, rows);
    const previewScale = clamp((report.avail - 60) / pageW, 1, 3.2);
    const previewUnit = unit(previewScale);

    const bandCanvas = (band: BandName, label: string) => {
        const height = tpl.bands[band].height;
        const selected = report.sel?.kind === 'band' && report.sel.band === band;
        const hits = tpl.bands[band].elements.map((item) => {
            const on = report.sel?.kind === 'el' && report.sel.band === band && report.sel.id === item.id;
            const hitH = item.type === 'line' ? Math.max(item.h, 1.6) : item.type === 'qr' ? Math.min(item.w, item.h) : item.h;
            const hitY = item.type === 'line' ? item.y - (hitH - item.h) / 2 : item.y;
            const hitW = item.type === 'qr' ? Math.min(item.w, item.h) : item.w;
            return `<button type="button" class="td-rpt__hit${on ? ' is-on' : ''}" data-st="rhit:${band}:${item.id}" aria-label="${NAMES[item.type]} en ${item.x}, ${item.y} mm" aria-pressed="${on}" style="left:${px(item.x)};top:${px(hitY)};width:${px(hitW)};height:${px(hitH)}">${on ? `<span class="td-studio__tag">${NAMES[item.type]} · ${r2(item.w)}×${r2(item.h)}</span><span class="td-studio__grip" data-st="rsize:${band}:${item.id}" aria-hidden="true"></span>` : ''}</button>`;
        }).join('');
        const drawn = tpl.bands[band].elements.map((item) => elementHtml(item, px, sample, [1, pages.length || 1], tpl, sources, params)).join('');
        return `<div class="td-rpt__bandbox" style="margin:0 ${px(margin)}"><button type="button" class="td-rpt__strip${selected ? ' is-on' : ''}" data-st="rband:${band}" aria-pressed="${selected}"><span>${label}</span><span>${height} mm</span></button><div class="td-rpt__band" style="height:${px(height)}">${drawn}${hits}</div></div>`;
    };

    const detailOn = report.sel?.kind === 'detail';
    const detailH = detail.headHeight + Math.min(3, Math.max(rows.length, 1)) * detail.rowHeight + 2;
    const detailBand = `<div class="td-rpt__bandbox" style="margin:0 ${px(margin)}"><button type="button" class="td-rpt__strip${detailOn ? ' is-on' : ''}" data-st="rdetail" aria-pressed="${detailOn}"><span>Detalle · ${esc(source)} · se repite por fila</span><span>${detail.rowHeight} mm/fila</span></button><div class="td-rpt__band" style="height:${px(detailH)}">${tableHtml(tpl, rows.slice(0, 3), px, sources, params)}<button type="button" class="td-rpt__hit${detailOn ? ' is-on' : ''}" data-st="rdetail" aria-label="Tabla de detalle" aria-pressed="${detailOn}" style="left:0;top:0;width:${px(contentWidth(tpl))};height:${px(detailH - 2)};cursor:pointer">${detailOn ? `<span class="td-studio__tag">Detalle · ${detail.columns.length} columnas</span>` : ''}</button></div></div>`;

    const tools = (['text', 'line', 'box', 'image', 'qr', 'barcode'] as const).map((type) => `<button type="button" data-st="radd:${type}"><b>+</b> ${NAMES[type]}</button>`).join('');
    const sumW = detail.columns.reduce((total, col) => total + (Number(col.w) || 0), 0);

    const paramsCard = tpl.parameters.length
        ? tpl.parameters.map((param, index) => `<div class="td-rpt__param"><input data-st-in="pname:${index}" value="${esc(param.name)}" aria-label="Nombre del parámetro"><select data-st-in="ptype:${index}" aria-label="Tipo de ${esc(param.name) || 'parámetro'}"><option value="texto" ${param.type === 'texto' ? 'selected' : ''}>Texto</option><option value="numero" ${param.type === 'numero' ? 'selected' : ''}>Número</option><option value="fecha" ${param.type === 'fecha' ? 'selected' : ''}>Fecha</option></select><button type="button" class="td-rpt__x" data-st="pdel:${index}" aria-label="Quitar parámetro ${esc(param.name) || index + 1}">×</button><button type="button" class="td-rpt__token" data-st="pins:${index}" title="Insertar en el elemento seleccionado">{?${esc(param.name)}}</button></div>`).join('')
        : '<p class="td-rpt__hint">Todavía no hay parámetros. Agrega uno para usarlo como {?Nombre} en el reporte.</p>';

    const fieldsCard = `<div class="td-rpt__card"><span class="td-section-title">Fuente de datos · ${esc(source)}</span><div class="td-rpt__chips">${fields.map((key) => `<button type="button" class="td-rpt__token" data-st="fins:${key}" title="Insertar {${key}}">{${esc(key)}}</button>`).join('')}</div><span class="td-section-title">Fórmulas</span><div class="td-rpt__chips">${formulas.map(([label, token], index) => `<button type="button" class="td-rpt__token" data-st="qins:${index}" title="${esc(token)}">${label}</button>`).join('')}</div><p class="td-rpt__hint">Clic para insertar en el elemento seleccionado. Sin selección, se crea un texto nuevo en el ${bandLabel}.</p></div>`;

    const current = selectedElement(report);
    let inspector = '';
    if (current && report.sel?.kind === 'el') {
        const where = report.sel.band === 'header' ? 'encabezado' : 'pie';
        const resolved = resolve(current.text || '', sample, [1, pages.length || 1], tpl, sources, params);
        const broken = resolved.includes('#ERR');
        inspector = `<div class="td-rpt__head"><span class="td-section-title">${NAMES[current.type]} · ${where}</span><button type="button" data-st="rdup">Duplicar</button><button type="button" class="is-danger" data-st="rdel">Eliminar</button></div>
            <div class="td-rpt__geo">${([['x', 'X'], ['y', 'Y'], ['w', 'Ancho'], ['h', 'Alto']] as const).map(([key, label]) => field(label, `<input type="number" step="0.5" data-st-in="rgeo:${key}" value="${current[key]}" aria-label="${label}">`)).join('')}</div>
            ${current.text != null || current.type === 'text' || current.type === 'image' || current.type === 'qr' || current.type === 'barcode' ? `${field(current.type === 'text' ? 'Texto · {?param} {campo} {=fórmula}' : current.type === 'image' ? 'Etiqueta de la imagen' : 'Valor a codificar', `<input data-st-in="rtext" value="${esc(current.text || '')}">`)}<span class="td-rpt__hint">${broken ? 'No se pudo resolver. Revisa el parámetro, el campo o la fórmula.' : `Vista previa: ${esc(resolved)}`}</span>` : ''}
            ${current.type === 'text' ? `<div class="td-rpt__geo td-rpt__geo--text">${field('Alto mm', `<input type="number" step="0.2" data-st-in="rsize" value="${current.size ?? 3}">`)}${seg([['left', 'Izq.'], ['center', 'Centro'], ['right', 'Der.']], current.align || 'left', (key) => `ralign:${key}`)}</div>${track(!!current.bold, 'Negrita', 'rbold')}` : ''}
            ${current.type === 'barcode' ? seg([['c128', 'Code 128'], ['ean13', 'EAN-13']], current.format === 'ean13' ? 'ean13' : 'c128', (key) => `rbc:${key}`) + track(!!current.showText, 'Texto legible', 'rshow') : ''}
            ${current.type === 'line' || current.type === 'box' ? field('Grosor mm', `<input type="number" step="0.1" data-st-in="rthick" value="${current.thick ?? 0.3}" style="width:90px">`) : ''}
            <p class="td-rpt__hint">Arrastra para mover. La esquina cambia el tamaño. Flechas: 0,5 mm. Mayús: 2 mm. Supr elimina.</p>`;
    } else if (detailOn) {
        const widthNote = sumW === 100 ? '100%' : `${sumW}% · la tabla los reparte al ancho completo`;
        inspector = `<span class="td-section-title">Banda de detalle</span>
            <div class="td-rpt__detail">${field('Fuente', `<input data-st-in="rsrc" value="${esc(source)}" aria-label="Nombre de la fuente">`)}${field('Fila mm', `<input type="number" step="0.5" data-st-in="rrowh" value="${detail.rowHeight}">`)}${field('Título mm', `<input type="number" step="0.5" data-st-in="rheadh" value="${detail.headHeight}">`)}</div>
            ${track(detail.zebra, 'Filas alternadas', 'rzebra')}
            <div class="td-rpt__head"><span class="td-section-title">Columnas · ${widthNote}</span><button type="button" data-st="cadd">+ Columna</button></div>
            ${detail.columns.length ? detail.columns.map((col, index) => `<div class="td-rpt__col"><input data-st-in="ctitle:${index}" value="${esc(col.title)}" aria-label="Título de la columna ${index + 1}"><input type="number" data-st-in="cw:${index}" value="${col.w}" aria-label="Ancho en porcentaje" title="Ancho %"><button type="button" class="td-rpt__x" data-st="cdel:${index}" aria-label="Quitar columna ${esc(col.title) || index + 1}">×</button><input data-st-in="cexpr:${index}" value="${esc(col.expr)}" aria-label="Campo o expresión" placeholder="campo o expresión"><select class="td-rpt__span2" data-st-in="cfmt:${index}" aria-label="Formato"><option value="" ${!col.fmt ? 'selected' : ''}>Texto</option><option value="number" ${col.fmt === 'number' ? 'selected' : ''}>Número</option><option value="money" ${col.fmt === 'money' ? 'selected' : ''}>Moneda</option><option value="date" ${col.fmt === 'date' ? 'selected' : ''}>Fecha</option></select></div>`).join('') : '<p class="td-rpt__hint">La tabla no tiene columnas. Agrega al menos una para ver las filas.</p>'}`;
    } else if (report.sel?.kind === 'band') {
        const title = report.sel.band === 'header' ? 'Encabezado del reporte' : 'Pie del reporte';
        inspector = `<span class="td-section-title">${title}</span>${field('Alto de la banda mm', `<input type="number" step="1" data-st-in="rbandh" value="${tpl.bands[report.sel.band].height}" style="width:110px">`)}<p class="td-rpt__hint">Este alto reserva espacio en cada página antes del detalle o después de él.</p>`;
    } else {
        inspector = `<span class="td-section-title">Página</span>${seg([['A4', 'A4'], ['Carta', 'Carta']], tpl.page.size, (key) => `rpage:${key}`)}${field('Margen mm', `<input type="number" step="1" data-st-in="rmargin" value="${margin}" style="width:90px">`)}<p class="td-rpt__hint">Selecciona un elemento, la tabla de detalle o el nombre de una banda para editarlos.</p>`;
    }

    const design = `<div class="td-rpt__tools" role="toolbar" aria-label="Insertar elemento">${tools}<span class="td-rpt__hint">Se agrega en: ${bandLabel}</span></div>
        <div class="td-rpt__sheetwrap"><div class="td-rpt__sheet" style="width:${px(pageW)};padding:${px(margin)} 0">${bandCanvas('header', 'Encabezado del reporte')}${detailBand}${bandCanvas('footer', 'Pie del reporte')}</div></div>
        <p class="td-rpt__hint">${tpl.page.size} ${pageW} × ${pageH} mm · margen ${margin} mm · ${tpl.bands.header.elements.length + tpl.bands.footer.elements.length} elementos · ${detail.columns.length} columnas</p>`;

    const preview = `<div class="td-rpt__sheetwrap td-rpt__sheetwrap--pages">${pages.map((page, index) => `<div class="td-rpt__paper" role="img" aria-label="Página ${index + 1} de ${pages.length}">${pageHtml(tpl, page, index, pages.length, previewUnit, sample, sources, params)}</div>`).join('')}</div>`;

    const derived = serial(tpl, false);
    const jsonText = report.json ?? derived;
    const dataDefault = JSON.stringify({ parameters: params, dataSources: { [source]: rows.slice(0, 3) } }, null, 2);
    const code = `<div class="td-rpt__card"><span class="td-section-title">Plantilla .uxr · JSON editable</span><textarea data-st-in="rjson" rows="16" spellcheck="false" aria-label="Plantilla JSON">${esc(jsonText)}</textarea><div class="td-rpt__actions"><button type="button" class="td-studio__primary" data-st="rapply">Aplicar plantilla</button><button type="button" data-st="rreset">Descartar cambios</button><span class="${report.jsonBad ? 'is-bad' : report.jsonMsg ? 'is-ok' : ''} td-rpt__status">${esc(report.jsonMsg || (report.json != null ? 'Cambios sin aplicar' : 'Sincronizada con el diseño'))}</span></div></div>
        <div class="td-rpt__card"><span class="td-section-title">Datos de ejecución · parámetros y fuentes</span><textarea data-st-in="rdata" rows="12" spellcheck="false" aria-label="Datos de ejecución">${esc(report.dataJson ?? dataDefault)}</textarea><div class="td-rpt__actions"><button type="button" class="td-studio__primary" data-st="rrun">Ejecutar y ver</button><span class="${report.dataBad ? 'is-bad' : ''} td-rpt__status">${esc(report.dataMsg || 'Ejecuta el reporte con estos datos, igual que desde el servidor.')}</span></div></div>`;

    const csharp = `var pdf = await Reports.RenderPdfAsync(\n    "Reports/${fileName(tpl.name)}",\n    parameters: new()\n    {\n${tpl.parameters.map((param) => {
        const value = params[param.name] ?? '';
        const literal = param.type === 'fecha' ? `DateTime.Parse(${JSON.stringify(String(value))})` : param.type === 'numero' ? String(Number(value) || 0) : JSON.stringify(String(value));
        return `        ["${param.name}"] = ${literal}`;
    }).join(',\n')}\n    },\n    dataSources: new()\n    {\n        ["${source}"] = db.${source}\n            .Select(x => new { ${fields.map((key) => `x.${key.charAt(0).toUpperCase()}${key.slice(1)}`).join(', ')} })\n    });\n\nreturn Results.File(pdf, "application/pdf");`;

    const left = mode === 'design'
        ? `<div class="td-rpt__card"><div class="td-rpt__head"><span class="td-section-title">Parámetros</span><button type="button" data-st="padd">+ Parámetro</button></div>${paramsCard}</div>${fieldsCard}`
        : mode === 'preview'
            ? `<div class="td-rpt__card"><span class="td-section-title">Parámetros del reporte</span>${tpl.parameters.map((param) => field(param.name, `<input type="${param.type === 'fecha' ? 'date' : param.type === 'numero' ? 'number' : 'text'}" data-st-in="rpv:${esc(param.name)}" value="${esc(params[param.name] ?? '')}">`)).join('')}${field(`Filas de ${esc(source)} · ${report.rows}`, `<input type="range" min="1" max="60" data-st-in="rrows" value="${report.rows}" aria-label="Cantidad de filas">`)}<button type="button" class="td-studio__primary" data-st="rpdf">Imprimir · PDF</button><p class="td-rpt__hint">${rows.length} filas · ${pages.length} ${pages.length === 1 ? 'página' : 'páginas'} ${tpl.page.size}</p></div>`
            : `<div class="td-rpt__card"><div class="td-rpt__head"><span class="td-section-title">Llamada desde C#</span><button type="button" data-st="rcopy">Copiar código</button></div><pre class="td-rpt__pre">${esc(csharp)}</pre></div>`;

    return `<div class="td-rpt">
        <div class="td-rpt__top">
            ${field('Plantilla', `<input data-st-in="rname" value="${esc(tpl.name)}" aria-label="Nombre de la plantilla" style="width:200px">`)}
            ${field('Nueva desde', `<select data-st-in="rtpl" aria-label="Plantilla de partida" style="width:170px"><option value="factura" ${report.tplKey === 'factura' ? 'selected' : ''}>Factura</option><option value="stock" ${report.tplKey === 'stock' ? 'selected' : ''}>Informe de stock</option><option value="blank" ${report.tplKey === 'blank' ? 'selected' : ''}>En blanco</option></select>`)}
            <label class="td-rpt__file">Abrir .uxr<input type="file" data-st-file="uxr" accept=".uxr,.json,application/json" aria-label="Abrir archivo .uxr"></label>
            <button type="button" class="td-studio__primary" data-st="rsave">Guardar .uxr</button>
            <span class="td-rpt__grow"></span>
            ${seg([['design', 'Diseño'], ['preview', 'Vista previa'], ['code', 'Programación']], mode, (key) => `rmode:${key}`)}
        </div>
        <p class="td-rpt__note ${noteClass}" role="status">${esc(note)}</p>
        <div class="td-rpt__body">
            <div class="td-rpt__side">${left}</div>
            <div class="td-rpt__stage">${mode === 'design' ? design : mode === 'preview' ? preview : code}</div>
            ${mode === 'design' ? `<div class="td-rpt__inspector"><div class="td-rpt__card">${inspector}</div></div>` : ''}
        </div>
    </div>`;
}

function addElement(report: ReportState, type: ReportElType): void {
    const band = targetBand(report.sel);
    const id = nextId(report);
    const first = report.tpl.parameters[0]?.name || 'Param1';
    const width = contentWidth(report.tpl);
    const base: ReportEl = type === 'text'
        ? tx(0, 1, 60, 5, 'Texto', 3.2)
        : type === 'line'
            ? el('line', 0, 1, width, 0.3, { thick: 0.3 })
            : type === 'box'
                ? el('box', 0, 1, 50, 16, { thick: 0.35 })
                : type === 'image'
                    ? el('image', 0, 1, 40, 15, { text: 'Imagen' })
                    : type === 'qr'
                        ? el('qr', 0, 1, 20, 20, { text: `{?${first}}` })
                        : el('barcode', 0, 1, 60, 14, { text: `{?${first}}`, format: 'c128', showText: true });
    base.id = id;
    editTpl(report, (tpl) => { tpl.bands[band].elements.push(base); });
    report.sel = { kind: 'el', band, id };
}

export function actReport(host: HTMLElement, report: ReportState, action: string, repaint: Repaint): void {
    const [name, a = '', b = ''] = action.split(':');
    const tpl = report.tpl;
    if (name === 'rmode' && (a === 'design' || a === 'preview' || a === 'code')) report.mode = a;
    else if (name === 'rsave') {
        const nameFile = fileName(tpl.name);
        const url = URL.createObjectURL(new Blob([serial(tpl, true)], { type: 'application/json' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = nameFile;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 2000);
        flash(host, report, `${nameFile} guardado · ${tpl.parameters.length} parámetros · fuente ${tpl.bands.detail.source}`, false, repaint);
    } else if (name === 'rpdf') {
        const { rows, sources, params, sample } = context(report);
        const pages = layoutPages(tpl, rows);
        const mm = (n: number) => `${n}mm`;
        const [width, height] = pageSize(tpl.page.size);
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(tpl.name)}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;700&family=JetBrains+Mono:wght@500&display=swap"><style>@page{size:${width}mm ${height}mm;margin:0}html,body{margin:0;padding:0}.p{break-after:page}</style></head><body>${pages.map((page, index) => `<div class="p">${pageHtml(tpl, page, index, pages.length, mm, sample, sources, params)}</div>`).join('')}</body></html>`;
        const frame = document.createElement('iframe');
        frame.setAttribute('aria-hidden', 'true');
        frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
        frame.onload = () => window.setTimeout(() => { frame.contentWindow?.focus(); frame.contentWindow?.print(); window.setTimeout(() => frame.remove(), 60000); }, 400);
        frame.srcdoc = html;
        document.body.appendChild(frame);
        flash(host, report, `Listo para imprimir: ${pages.length} ${pages.length === 1 ? 'página' : 'páginas'}. En el diálogo elige Guardar como PDF. El diseño no se modificó.`, false, repaint);
    } else if (name === 'radd' && a in NAMES) addElement(report, a as ReportElType);
    else if (name === 'rband' && (a === 'header' || a === 'footer')) report.sel = { kind: 'band', band: a };
    else if (name === 'rdetail') report.sel = { kind: 'detail' };
    else if (name === 'rhit' && (a === 'header' || a === 'footer') && b) report.sel = { kind: 'el', band: a, id: b };
    else if (name === 'rdup' && report.sel?.kind === 'el') {
        const band = report.sel.band;
        const current = tpl.bands[band].elements.find((item) => item.id === (report.sel?.kind === 'el' ? report.sel.id : ''));
        if (!current) return;
        const id = nextId(report);
        editTpl(report, (copy) => {
            copy.bands[band].elements.push({ ...current, id, y: clamp(current.y + 3, 0, copy.bands[band].height - current.h) });
        });
        report.sel = { kind: 'el', band, id };
    } else if (name === 'rdel' && report.sel?.kind === 'el') {
        const { band, id } = report.sel;
        editTpl(report, (copy) => { copy.bands[band].elements = copy.bands[band].elements.filter((item) => item.id !== id); });
        report.sel = null;
    } else if (name === 'ralign' && report.sel?.kind === 'el' && (a === 'left' || a === 'center' || a === 'right')) {
        const { band, id } = report.sel;
        editTpl(report, (copy) => { const item = copy.bands[band].elements.find((el) => el.id === id); if (item) item.align = a; });
    } else if (name === 'rbold' && report.sel?.kind === 'el') {
        const { band, id } = report.sel;
        editTpl(report, (copy) => { const item = copy.bands[band].elements.find((el) => el.id === id); if (item) item.bold = !item.bold; });
    } else if (name === 'rshow' && report.sel?.kind === 'el') {
        const { band, id } = report.sel;
        editTpl(report, (copy) => { const item = copy.bands[band].elements.find((el) => el.id === id); if (item) item.showText = !item.showText; });
    } else if (name === 'rbc' && report.sel?.kind === 'el' && (a === 'c128' || a === 'ean13')) {
        const { band, id } = report.sel;
        editTpl(report, (copy) => { const item = copy.bands[band].elements.find((el) => el.id === id); if (item) item.format = a; });
    } else if (name === 'rpage' && (a === 'A4' || a === 'Carta')) editTpl(report, (copy) => { copy.page.size = a; });
    else if (name === 'padd') {
        const paramName = `Param${tpl.parameters.length + 1}`;
        editTpl(report, (copy) => { copy.parameters.push({ name: paramName, type: 'texto', value: '' }); });
        report.pv[paramName] = '';
    } else if (name === 'pdel') {
        const index = Number(a);
        const removed = tpl.parameters[index];
        editTpl(report, (copy) => { copy.parameters.splice(index, 1); });
        if (removed) delete report.pv[removed.name];
    } else if (name === 'pins') insertToken(host, report, `{?${tpl.parameters[Number(a)]?.name || ''}}`, repaint);
    else if (name === 'fins') insertToken(host, report, `{${a}}`, repaint);
    else if (name === 'qins') {
        const { source, rows } = context(report);
        const fields = Object.keys(rows[0] || {});
        const numeric = fields.find((key) => typeof (rows[0] || {})[key] === 'number') || 'cantidad';
        const tokens = [`{=sum(${source}, ${numeric})|number}`, `{=count(${source})}`, 'Página {page} de {pages}', '{now|date}'];
        insertToken(host, report, tokens[Number(a)] || '', repaint);
    } else if (name === 'cadd') {
        const { rows } = context(report);
        const expr = Object.keys(rows[0] || { campo: '' })[0] || 'campo';
        editTpl(report, (copy) => { copy.bands.detail.columns.push({ title: 'Columna', expr, w: 12, fmt: '' }); });
    } else if (name === 'cdel') editTpl(report, (copy) => { copy.bands.detail.columns.splice(Number(a), 1); });
    else if (name === 'rzebra') editTpl(report, (copy) => { copy.bands.detail.zebra = !copy.bands.detail.zebra; });
    else if (name === 'rapply') {
        try {
            const title = loadTemplate(report, JSON.parse(report.json || '{}'));
            report.jsonMsg = `Plantilla aplicada · ${title}`;
            report.jsonBad = false;
            flash(host, report, `Plantilla “${title}” aplicada. El diseño ya usa estas bandas.`, false, repaint);
        } catch (error) {
            report.jsonMsg = `No se pudo aplicar: ${error instanceof Error ? error.message : 'JSON no válido'}. Revisa el texto o descarta los cambios.`;
            report.jsonBad = true;
        }
    } else if (name === 'rreset') { report.json = null; report.jsonMsg = ''; report.jsonBad = false; }
    else if (name === 'rrun') {
        try {
            const data = JSON.parse(report.dataJson || '{}') as { parameters?: Record<string, string>; dataSources?: Record<string, Row[]> };
            const src = tpl.bands.detail.source;
            if (!data.dataSources || !Array.isArray(data.dataSources[src])) throw new Error(`falta dataSources.${src}, un arreglo de filas`);
            report.runData = data.dataSources;
            report.runParams = { ...report.pv, ...(data.parameters || {}) };
            report.mode = 'preview';
            report.dataMsg = '';
            report.dataBad = false;
            flash(host, report, `Reporte ejecutado con ${data.dataSources[src].length} filas de ${src}. Estás en la vista previa.`, false, repaint);
        } catch (error) {
            report.dataMsg = `No se pudo ejecutar: ${error instanceof Error ? error.message : 'JSON no válido'}. Corrige los datos y vuelve a intentar.`;
            report.dataBad = true;
        }
    }     else if (name === 'rcopy') {
        const text = host.querySelector('.td-rpt__pre')?.textContent || '';
        if (!navigator.clipboard) {
            flash(host, report, 'No se pudo copiar. Selecciona el código y cópialo a mano.', true, repaint);
            return;
        }
        void navigator.clipboard.writeText(text).then(
            () => flash(host, report, 'Código C# copiado. Pégalo en el servicio que genera el PDF.', false, repaint),
            () => flash(host, report, 'No se pudo copiar. Selecciona el código y cópialo a mano.', true, repaint),
        );
    }
}

export function inputReport(host: HTMLElement, report: ReportState, key: string, value: string, repaint: Repaint): boolean {
    const skip = key === 'rjson' || key === 'rdata';
    if (key === 'rname') editTpl(report, (tpl) => { tpl.name = value; });
    else if (key === 'rtpl' && (value === 'factura' || value === 'stock' || value === 'blank')) {
        const next = value === 'blank' ? blankTemplate() : clone(templates()[value]);
        stamp(next);
        report.tplKey = value;
        report.tpl = next;
        report.sel = null;
        report.json = null;
        report.runData = null;
        report.runParams = null;
        report.pv = valuesOf(next);
        flash(host, report, `Plantilla “${next.name}” cargada. Lo que había en el lienzo se reemplazó.`, false, repaint);
    } else if (key.startsWith('pname:')) {
        const index = Number(key.slice(6));
        const prev = report.tpl.parameters[index];
        if (!prev) return false;
        const name = value.replace(/[^\w]/g, '');
        editTpl(report, (tpl) => { if (tpl.parameters[index]) tpl.parameters[index].name = name; });
        if (name !== prev.name) {
            report.pv[name] = report.pv[prev.name] ?? prev.value;
            delete report.pv[prev.name];
        }
    } else if (key.startsWith('ptype:')) {
        const index = Number(key.slice(6));
        if (value === 'texto' || value === 'numero' || value === 'fecha') {
            editTpl(report, (tpl) => { if (tpl.parameters[index]) tpl.parameters[index].type = value; });
        }
    } else if (key.startsWith('rpv:')) {
        report.pv[key.slice(4)] = value;
        report.runParams = null;
    } else if (key === 'rrows') { report.rows = clamp(Number(value) || 1, 1, 60); report.runData = null; }
    else if (key === 'rjson') { report.json = value; report.jsonMsg = ''; report.jsonBad = false; }
    else if (key === 'rdata') { report.dataJson = value; report.dataMsg = ''; report.dataBad = false; }
    else if (key.startsWith('rgeo:') && report.sel?.kind === 'el') {
        const fieldName = key.slice(5) as 'x' | 'y' | 'w' | 'h';
        const n = Number(value);
        if (!Number.isNaN(n)) {
            const { band, id } = report.sel;
            editTpl(report, (tpl) => {
                const item = tpl.bands[band].elements.find((el) => el.id === id);
                if (item) item[fieldName] = r2(Math.max(0, n));
            });
        }
    } else if (key === 'rtext' && report.sel?.kind === 'el') {
        const { band, id } = report.sel;
        editTpl(report, (tpl) => { const item = tpl.bands[band].elements.find((el) => el.id === id); if (item) item.text = value; });
    } else if (key === 'rsize' && report.sel?.kind === 'el') {
        const { band, id } = report.sel;
        editTpl(report, (tpl) => { const item = tpl.bands[band].elements.find((el) => el.id === id); if (item) item.size = r2(clamp(Number(value) || 1, 1, 30)); });
    } else if (key === 'rthick' && report.sel?.kind === 'el') {
        const { band, id } = report.sel;
        const n = r2(clamp(Number(value) || 0.1, 0.1, 5));
        editTpl(report, (tpl) => {
            const item = tpl.bands[band].elements.find((el) => el.id === id);
            if (!item) return;
            item.thick = n;
            if (item.type === 'line') item.h = n;
        });
    } else if (key === 'rsrc') editTpl(report, (tpl) => { tpl.bands.detail.source = value.replace(/[^\w]/g, '') || 'Lineas'; });
    else if (key === 'rrowh') editTpl(report, (tpl) => { tpl.bands.detail.rowHeight = clamp(Number(value) || 5, 4, 20); });
    else if (key === 'rheadh') editTpl(report, (tpl) => { tpl.bands.detail.headHeight = clamp(Number(value) || 6, 4, 20); });
    else if (key === 'rbandh' && report.sel?.kind === 'band') {
        const band = report.sel.band;
        editTpl(report, (tpl) => { tpl.bands[band].height = clamp(Number(value) || 10, 5, 200); });
    } else if (key === 'rmargin') editTpl(report, (tpl) => { tpl.page.margin = clamp(Number(value) || 5, 5, 30); });
    else if (key.startsWith('ctitle:')) editTpl(report, (tpl) => { const col = tpl.bands.detail.columns[Number(key.slice(7))]; if (col) col.title = value; });
    else if (key.startsWith('cw:')) editTpl(report, (tpl) => { const col = tpl.bands.detail.columns[Number(key.slice(3))]; if (col) col.w = clamp(Number(value) || 1, 1, 100); });
    else if (key.startsWith('cexpr:')) editTpl(report, (tpl) => { const col = tpl.bands.detail.columns[Number(key.slice(6))]; if (col) col.expr = value; });
    else if (key.startsWith('cfmt:')) {
        editTpl(report, (tpl) => {
            const col = tpl.bands.detail.columns[Number(key.slice(5))];
            if (!col) return;
            col.fmt = value;
            col.align = value === 'money' || value === 'number' ? 'right' : 'left';
        });
    }
    return skip;
}

export function openReportFile(host: HTMLElement, report: ReportState, input: HTMLInputElement, repaint: Repaint): void {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    void file.text().then((text) => {
        try {
            const title = loadTemplate(report, JSON.parse(text) as unknown);
            flash(host, report, `${file.name} abierto · plantilla “${title}”.`, false, repaint);
        } catch (error) {
            flash(host, report, `No se pudo abrir ${file.name}: ${error instanceof Error ? error.message : 'archivo no válido'}. El diseño actual sigue intacto.`, true, repaint);
        }
        repaint();
    });
}

export function beginReportDrag(report: ReportState, event: PointerEvent): boolean {
    if (report.mode !== 'design' || event.button !== 0) return false;
    const target = event.target instanceof Element ? event.target : null;
    const grip = target?.closest('[data-st^="rsize:"]');
    const hit = target?.closest('[data-st^="rhit:"]');
    const node = grip instanceof HTMLElement ? grip : hit instanceof HTMLElement ? hit : null;
    if (!node?.dataset.st) return false;
    const [, band, id] = node.dataset.st.split(':');
    if ((band !== 'header' && band !== 'footer') || !id) return false;
    const item = report.tpl.bands[band].elements.find((el) => el.id === id);
    if (!item) return false;
    report.sel = { kind: 'el', band, id };
    report.drag = { band, id, mode: grip ? 'resize' : 'move', x: item.x, y: item.y, w: item.w, h: item.h, px: event.clientX, py: event.clientY, moved: false };
    event.preventDefault();
    return true;
}

export function moveReportDrag(report: ReportState, event: PointerEvent): void {
    const drag = report.drag;
    if (!drag) return;
    const item = report.tpl.bands[drag.band].elements.find((el) => el.id === drag.id);
    if (!item) return;
    const dx = (event.clientX - drag.px) / (report.scale || 1);
    const dy = (event.clientY - drag.py) / (report.scale || 1);
    if (Math.hypot(event.clientX - drag.px, event.clientY - drag.py) > 3) drag.moved = true;
    const snap = (n: number) => Math.round(n * 2) / 2;
    const width = contentWidth(report.tpl);
    const height = report.tpl.bands[drag.band].height;
    if (drag.mode === 'move') {
        item.x = clamp(snap(drag.x + dx), 0, Math.max(0, width - drag.w));
        item.y = clamp(snap(drag.y + dy), 0, Math.max(0, height - drag.h));
    } else {
        let nextW = clamp(snap(drag.w + dx), 2, width - drag.x);
        let nextH = item.type === 'line' ? drag.h : clamp(snap(drag.h + dy), 2, height - drag.y);
        if (item.type === 'qr') nextW = nextH = Math.min(Math.max(nextW, nextH), width - drag.x, height - drag.y);
        item.w = r2(nextW);
        item.h = r2(nextH);
        if (item.type === 'text') item.size = r2(clamp(nextH * 0.78, 1.5, 20));
    }
}

export function endReportDrag(report: ReportState): boolean {
    const moved = !!report.drag?.moved;
    report.drag = null;
    return moved;
}

export function nudgeReport(report: ReportState, key: string, shift: boolean): boolean {
    if (report.mode !== 'design' || report.sel?.kind !== 'el') return false;
    const { band, id } = report.sel;
    const item = report.tpl.bands[band].elements.find((el) => el.id === id);
    if (!item) return false;
    const step = shift ? 2 : 0.5;
    const move: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (move[key]) {
        const [dx, dy] = move[key];
        item.x = clamp(r2(item.x + dx), 0, Math.max(0, contentWidth(report.tpl) - item.w));
        item.y = clamp(r2(item.y + dy), 0, Math.max(0, report.tpl.bands[band].height - item.h));
        return true;
    }
    if (key === 'Delete' || key === 'Backspace') {
        report.tpl.bands[band].elements = report.tpl.bands[band].elements.filter((el) => el.id !== id);
        report.sel = null;
        report.json = null;
        return true;
    }
    return false;
}

export function watchReportWidth(host: HTMLElement, read: () => ReportState | undefined, repaint: Repaint): void {
    if (host.dataset.tdRptWatch === '1' || typeof ResizeObserver === 'undefined') return;
    host.dataset.tdRptWatch = '1';
    const observer = new ResizeObserver(() => {
        const stage = host.querySelector('.td-rpt__stage');
        const width = Math.round((stage instanceof HTMLElement ? stage.clientWidth : host.clientWidth) || 0);
        const report = read();
        if (!report || !width || Math.abs(width - report.avail) < 8 || report.drag) return;
        report.avail = width;
        repaint();
    });
    observer.observe(host);
}
