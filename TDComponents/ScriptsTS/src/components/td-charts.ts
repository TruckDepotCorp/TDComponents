import { renderAdv, spcSeries } from './td-adv-charts';

const PAL = ['var(--td-color-primary)', 'var(--td-color-text)', 'var(--td-color-info)', 'var(--td-color-success)', 'var(--td-color-warning)', '#9CA3AB'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];
const SER: [string, number[]][] = [
    ['Frenos', [18, 21, 19, 24, 26, 25, 29, 31, 34]],
    ['Motor', [14, 15, 17, 16, 18, 20, 19, 22, 23]],
    ['Suspensión', [9, 10, 9, 11, 12, 12, 13, 14, 15]],
    ['Eléctrico', [6, 7, 8, 7, 9, 9, 10, 11, 12]]
];
const META = [50, 52, 54, 56, 60, 62, 66, 70, 74];
const W0 = 720;
const H0 = 320;
const L = 56;
const R = 16;
const T = 16;
const B = 34;
const PW = W0 - L - R;
const PH = H0 - T - B;

interface ChartModel { title: string; unit: string; categories: string[]; series: [string, number[]][] }
interface ChartState {
    lType: 'line' | 'area' | 'step';
    smooth: boolean;
    markers: boolean;
    hidden: string[];
    hov: number | null;
    cOri: 'v' | 'h';
    cMode: 'group' | 'stack' | 'pct';
    target: boolean;
    pDonut: boolean;
    pHov: number | null;
    sHid: string[];
    sHov: number | null;
    sTrend: boolean;
    g: number;
    kHov: [number, number] | null;
    hHov: [number, number] | null;
    advHov: string | null;
    spc: number[];
    points: { id: number; c: number; val: number; dias: number; u: number; oc: string }[];
    model: ChartModel | null;
    source: string;
}

function nice(maxValue: number): { max: number; step: number } {
    const peak = Math.max(maxValue, 1);
    const power = Math.pow(10, Math.floor(Math.log10(peak)));
    const n = peak / power;
    const stepUnit = n <= 1 ? 0.2 : n <= 2 ? 0.5 : n <= 5 ? 1 : 2;
    const step = stepUnit * power;
    return { max: Math.ceil(peak / step) * step, step };
}

function fmtM(n: number): string {
    return `$ ${(Math.round(n * 10) / 10).toLocaleString('es-CL')} M`;
}

function esc(value: string): string {
    return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] ?? char));
}

function chartSeries(state: ChartState): [string, number[]][] {
    if (!state.model) return SER;
    const count = Math.max(state.model.categories.length, 0, ...state.model.series.map((series) => series[1].length));
    return state.model.series.map(([name, values]) => [name, Array.from({ length: Math.max(count, values.length) }, (_, index) => values[index] ?? 0)]);
}

function chartCats(state: ChartState): string[] {
    if (!state.model) return MONTHS;
    if (state.model.categories.length) return state.model.categories;
    const count = state.model.series[0]?.[1].length ?? 0;
    return Array.from({ length: count }, (_, index) => String(index + 1));
}

function chartText(state: ChartState, n: number): string {
    if (!state.model) return fmtM(n);
    const text = (Math.round(n * 10) / 10).toLocaleString('es-CL');
    return state.model.unit ? `${text} ${state.model.unit}` : text;
}

function parseModel(raw: string): ChartModel | null {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as { title?: string; unit?: string; categories?: string[]; series?: { name?: string; values?: number[] }[] };
        const series = Array.isArray(parsed.series)
            ? parsed.series.filter((item) => item.name).map((item) => [String(item.name), (item.values ?? []).map(Number)] as [string, number[]])
            : [];
        return { title: parsed.title || '', unit: parsed.unit || '', categories: Array.isArray(parsed.categories) ? parsed.categories.map(String) : [], series };
    } catch {
        return null;
    }
}

function smoothPath(pts: number[][]): string {
    return pts.map((p, i) => {
        if (!i) {
            return `M${p[0]},${p[1]}`;
        }
        const p0 = pts[i - 2] || pts[i - 1];
        const p1 = pts[i - 1];
        const p3 = pts[i + 1] || p;
        const c1x = p1[0] + (p[0] - p0[0]) / 6;
        const c1y = p1[1] + (p[1] - p0[1]) / 6;
        const c2x = p[0] - (p3[0] - p1[0]) / 6;
        const c2y = p[1] - (p3[1] - p1[1]) / 6;
        return `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p[0].toFixed(1)},${p[1].toFixed(1)}`;
    }).join(' ');
}

function csv(name: string, rows: (string | number)[][]): void {
    const file = new Blob(['\uFEFF' + rows.map((row) => row.join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = `${name}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}

function buttons(key: string, options: [string, string][], current: string): string {
    return `<div class="td-chart__seg" role="group">${options.map(([value, label]) =>
        `<button type="button" data-ch-key="${key}" data-ch-value="${value}" aria-pressed="${String(current === value)}">${label}</button>`
    ).join('')}</div>`;
}

function sw(key: string, on: boolean, label: string): string {
    return `<button type="button" class="td-switch" role="switch" data-ch-toggle="${key}" aria-checked="${on}"><i></i>${label}</button>`;
}

function legend(names: string[], hidden: string[]): string {
    return `<div class="td-chart__legend">${names.map((name, index) => {
        const off = hidden.includes(name);
        return `<button type="button" data-ch-legend="${name}" aria-pressed="${!off}" style="opacity:${off ? .4 : 1};text-decoration:${off ? 'line-through' : 'none'}"><i style="background:${PAL[index]}"></i>${name}</button>`;
    }).join('')}</div>`;
}

function axisY(max: number, step: number, format: (n: number) => string): string {
    let out = '';
    for (let tick = 0; tick <= max + 1e-9; tick += step) {
        const y = T + PH - (tick / max) * PH;
        out += `<line x1="${L}" x2="${L + PW}" y1="${y}" y2="${y}" stroke="var(--td-color-border)" stroke-dasharray="${tick ? '3 4' : ''}"></line>`;
        out += `<text x="${L - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--td-color-text-muted)" font-family="var(--td-font-mono)">${format(tick)}</text>`;
    }
    return out;
}

function svgWrap(body: string, height = H0, label = 'Gráfico'): string {
    return `<svg viewBox="0 0 ${W0} ${height}" width="100%" role="img" aria-label="${label}" data-ch-plot>${body}</svg>`;
}

function lineChart(state: ChartState): string {
    const SER = chartSeries(state);
    const MONTHS = chartCats(state);
    const fmtM = (n: number) => chartText(state, n);
    const heading = state.model?.title || 'Ventas por categoría · 2026';
    const unit = state.model ? (state.model.unit || '') : 'millones CLP';
    if (!SER.length || !MONTHS.length) return `<p class="td-chart__read">${esc(heading || 'Sin datos')}</p>`;
    const vis = SER.filter((series) => !state.hidden.includes(series[0]));
    const scale = nice(Math.max(1, ...vis.flatMap((series) => series[1])) * 1.08);
    const n = MONTHS.length;
    const x = (i: number) => L + i * (PW / Math.max(n - 1, 1));
    const y = (value: number) => T + PH - value / scale.max * PH;
    let body = axisY(scale.max, scale.step, (tick) => String(tick));
    body += MONTHS.map((month, index) => `<text x="${x(index)}" y="${T + PH + 22}" text-anchor="middle" font-size="11.5" fill="var(--td-color-text-muted)">${month}</text>`).join('');
    if (state.hov != null) {
        body += `<line x1="${x(state.hov)}" x2="${x(state.hov)}" y1="${T}" y2="${T + PH}" stroke="var(--td-color-border-strong)"></line>`;
    }
    SER.forEach(([name, values], seriesIndex) => {
        if (state.hidden.includes(name)) {
            return;
        }
        const pts = values.map((value, index) => [x(index), y(value)]);
        let d = '';
        if (state.lType === 'step') {
            d = pts.map((p, index) => index ? `H${p[0]} V${p[1]}` : `M${p[0]},${p[1]}`).join(' ');
        } else {
            d = state.smooth ? smoothPath(pts) : pts.map((p, index) => `${index ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
        }
        if (state.lType === 'area') {
            body += `<path d="${d} L${x(n - 1)},${T + PH} L${L},${T + PH} Z" fill="${PAL[seriesIndex]}" opacity="${seriesIndex ? 0.08 : 0.16}"></path>`;
        }
        body += `<path d="${d}" fill="none" stroke="${PAL[seriesIndex]}" stroke-width="${seriesIndex ? 2 : 2.75}" stroke-linejoin="round" stroke-linecap="round"></path>`;
        if (state.markers) {
            pts.forEach((point, index) => {
                body += `<circle cx="${point[0]}" cy="${point[1]}" r="${state.hov === index ? 5 : 3.2}" fill="var(--td-color-surface)" stroke="${PAL[seriesIndex]}" stroke-width="2"></circle>`;
            });
        }
    });
    const totals = MONTHS.map((_, index) => SER.reduce((sum, series) => sum + series[1][index], 0));
    const best = totals.indexOf(Math.max(...totals));
    const last = Math.max(totals.length - 1, 0);
    const growth = totals[0] ? Math.round((totals[last] / totals[0] - 1) * 100) : 0;
    const kpis = [
        [state.model ? 'Total' : 'Total 2026', fmtM(totals.reduce((a, b) => a + b, 0))],
        ['Mejor periodo', `${MONTHS[best] ?? ''} · ${fmtM(totals[best] || 0)}`],
        [state.model ? 'Cambio' : 'Crecimiento Ene→Sep', `${growth > 0 ? '+' : ''}${growth}%`]
    ];
    const read = state.hov == null
        ? 'Pasa el mouse sobre el gráfico para ver cada mes'
        : `${MONTHS[state.hov]} 2026 · ${vis.map((series) => `${series[0]} ${fmtM(series[1][state.hov as number])}`).join(' · ')} · Total ${fmtM(vis.reduce((sum, series) => sum + series[1][state.hov as number], 0))}`;
    return `<div class="td-chart__kpis">${kpis.map(([k, v]) => `<div><span>${k}</span><strong>${v}</strong></div>`).join('')}</div>
        <div class="td-chart__tools">${buttons('lType', [['line', 'Línea'], ['area', 'Área'], ['step', 'Escalón']], state.lType)}${sw('smooth', state.smooth, 'Suavizado')}${sw('markers', state.markers, 'Marcadores')}<span></span><button type="button" class="td-btn td-btn--secondary td-btn--sm" data-ch-export="ventas">Exportar CSV</button></div>
        <div class="td-chart__head"><strong>${esc(heading)}</strong><em>${esc(unit)}</em></div>
        ${legend(SER.map((series) => series[0]), state.hidden)}
        ${svgWrap(body, H0, 'Ventas por categoría')}
        <p class="td-chart__read" role="status">${read}</p>`;
}

function columnChart(state: ChartState): string {
    const SER = chartSeries(state);
    const MONTHS = chartCats(state);
    const fmtM = (n: number) => chartText(state, n);
    if (!SER.length || !MONTHS.length) return `<p class="td-chart__read">${esc(state.model?.title || 'Sin datos')}</p>`;
    const vis = SER.filter((series) => !state.hidden.includes(series[0]));
    const horiz = state.cOri === 'h';
    const totals = MONTHS.map((_, index) => vis.reduce((sum, series) => sum + series[1][index], 0));
    const maxValue = state.cMode === 'pct' ? 100
        : state.cMode === 'stack' ? Math.max(...totals, state.target ? Math.max(...META) : 0)
        : Math.max(1, ...vis.flatMap((series) => series[1]));
    const scale = state.cMode === 'pct' ? { max: 100, step: 20 } : nice(maxValue * 1.08);
    const band = (horiz ? PH : PW) / MONTHS.length;
    const bar = band * 0.62;
    let body = '';
    if (!horiz) {
        body += axisY(scale.max, scale.step, (tick) => state.cMode === 'pct' ? `${tick}%` : String(tick));
    } else {
        for (let tick = 0; tick <= scale.max + 1e-9; tick += scale.step) {
            const x = L + tick / scale.max * PW;
            body += `<line x1="${x}" x2="${x}" y1="${T}" y2="${T + PH}" stroke="var(--td-color-border)" stroke-dasharray="${tick ? '3 4' : ''}"></line>`;
            body += `<text x="${x}" y="${T + PH + 18}" text-anchor="middle" font-size="11" fill="var(--td-color-text-muted)" font-family="var(--td-font-mono)">${state.cMode === 'pct' ? `${tick}%` : tick}</text>`;
        }
    }
    MONTHS.forEach((month, index) => {
        const center = (horiz ? T : L) + band * index + band / 2;
        body += horiz
            ? `<text x="${L - 8}" y="${center + 4}" text-anchor="end" font-size="11.5" fill="var(--td-color-text-muted)">${month}</text>`
            : `<text x="${center}" y="${T + PH + 22}" text-anchor="middle" font-size="11.5" fill="var(--td-color-text-muted)">${month}</text>`;
        let acc = 0;
        vis.forEach(([name, values]) => {
            const seriesIndex = SER.findIndex((series) => series[0] === name);
            const raw = values[index];
            const value = state.cMode === 'pct' ? raw / totals[index] * 100 : raw;
            let x = 0;
            let y = 0;
            let w = 0;
            let h = 0;
            if (state.cMode === 'group') {
                const sub = bar / vis.length;
                const slot = vis.findIndex((series) => series[0] === name);
                if (horiz) {
                    y = center - bar / 2 + slot * sub;
                    h = sub - 2;
                    x = L;
                    w = value / scale.max * PW;
                } else {
                    x = center - bar / 2 + slot * sub;
                    w = sub - 2;
                    h = value / scale.max * PH;
                    y = T + PH - h;
                }
            } else if (horiz) {
                y = center - bar / 2;
                h = bar;
                x = L + acc / scale.max * PW;
                w = value / scale.max * PW;
                acc += value;
            } else {
                x = center - bar / 2;
                w = bar;
                h = value / scale.max * PH;
                y = T + PH - acc / scale.max * PH - h;
                acc += value;
            }
            const dim = state.hov == null || state.hov === index ? 1 : 0.45;
            body += `<rect data-ch-col="${index}" x="${x}" y="${y}" width="${Math.max(0, w)}" height="${Math.max(0, h)}" rx="1.5" fill="${PAL[seriesIndex]}" opacity="${dim}"></rect>`;
        });
    });
    if (state.target && state.cMode === 'stack' && !horiz) {
        const pts = META.map((value, index) => [L + band * index + band / 2, T + PH - value / scale.max * PH]);
        body += `<path d="${pts.map((p, index) => `${index ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ')}" fill="none" stroke="var(--td-color-warning)" stroke-width="2.5" stroke-dasharray="6 5"></path>`;
        pts.forEach((point) => {
            body += `<circle cx="${point[0]}" cy="${point[1]}" r="3.5" fill="var(--td-color-warning)"></circle>`;
        });
    }
    const read = state.hov == null
        ? 'Pasa el mouse sobre una columna'
        : `${MONTHS[state.hov]} · ${vis.map((series) => `${series[0]} ${state.cMode === 'pct' ? `${Math.round(series[1][state.hov as number] / totals[state.hov as number] * 100)}%` : fmtM(series[1][state.hov as number])}`).join(' · ')} · Total ${fmtM(totals[state.hov])}${state.target && state.cMode === 'stack' ? ` · Meta ${fmtM(META[state.hov])} ${totals[state.hov] >= META[state.hov] ? '✓' : '✗'}` : ''}`;
    const meta = state.target && state.cMode === 'stack' && !horiz ? '<span class="td-chart__meta"><i></i>Meta</span>' : '';
    return `<div class="td-chart__tools">${buttons('cOri', [['v', 'Columnas'], ['h', 'Barras']], state.cOri)}${buttons('cMode', [['group', 'Agrupadas'], ['stack', 'Apiladas'], ['pct', '100 %']], state.cMode)}${sw('target', state.target, 'Línea de meta')}<span></span><button type="button" class="td-btn td-btn--secondary td-btn--sm" data-ch-export="ventas">Exportar CSV</button></div>
        ${state.model?.title ? `<strong class="td-chart__title">${esc(state.model.title)}</strong>` : ''}
        ${legend(SER.map((series) => series[0]), state.hidden)}${meta}
        ${svgWrap(body, H0, esc(state.model?.title || 'Columnas de ventas'))}
        <p class="td-chart__read" role="status">${read}</p>`;
}

function pieChart(state: ChartState): string {
    const fmtM = (n: number) => chartText(state, n);
    const pieTitle = state.model?.title || 'Valor de stock por bodega';
    const data: [string, number][] = state.model
        ? chartCats(state).map((name, index) => [name, state.model?.series[0]?.[1][index] ?? 0])
        : [['Quilicura', 128], ['Concepción', 64], ['Antofagasta', 55], ['Puerto Montt', 34], ['En tránsito', 24]];
    if (!data.length || data.every((row) => !row[1])) return `<p class="td-chart__read">${esc(pieTitle)}</p>`;
    const total = data.reduce((sum, row) => sum + row[1], 0);
    const cx = 160;
    const cy = 150;
    const radius = 120;
    const inner = state.pDonut ? 72 : 0;
    let angle = -Math.PI / 2;
    let body = '';
    data.forEach(([name, value], index) => {
        const next = angle + value / total * Math.PI * 2;
        const mid = (angle + next) / 2;
        const hover = state.pHov === index;
        const shift = hover ? 8 : 0;
        const dx = Math.cos(mid) * shift;
        const dy = Math.sin(mid) * shift;
        const large = next - angle > Math.PI ? 1 : 0;
        const point = (a: number, r: number) => [cx + dx + Math.cos(a) * r, cy + dy + Math.sin(a) * r];
        const p1 = point(angle, radius);
        const p2 = point(next, radius);
        const d = inner
            ? `M${p1} A${radius},${radius} 0 ${large} 1 ${p2} L${point(next, inner)} A${inner},${inner} 0 ${large} 0 ${point(angle, inner)} Z`
            : `M${cx + dx},${cy + dy} L${p1} A${radius},${radius} 0 ${large} 1 ${p2} Z`;
        body += `<path data-ch-pie="${index}" d="${d}" fill="${PAL[index]}" stroke="var(--td-color-surface)" stroke-width="2" opacity="${state.pHov == null || hover ? 1 : .5}"></path>`;
        if (value / total > 0.07) {
            const label = point(mid, inner ? (radius + inner) / 2 : radius * 0.62);
            body += `<text x="${label[0]}" y="${label[1] + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="${index <= 1 ? '#fff' : '#0A0B0C'}" font-family="var(--td-font-mono)">${Math.round(value / total * 100)}%</text>`;
        }
        angle = next;
    });
    if (inner) {
        const current = state.pHov == null ? null : data[state.pHov];
        body += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="12" fill="var(--td-color-text-muted)">${current ? current[0] : 'Valor en stock'}</text>`;
        body += `<text x="${cx}" y="${cy + 22}" text-anchor="middle" font-size="24" font-weight="800" fill="var(--td-color-text)" font-family="var(--td-font-display)">${fmtM(current ? current[1] : total)}</text>`;
    }
    const rows = data.map(([name, value], index) => `<div class="td-chart__pie-row ${state.pHov === index ? 'is-on' : ''}" data-ch-pie="${index}"><i style="background:${PAL[index]}"></i><span><strong>${name}</strong><b style="width:${Math.round(value / data[0][1] * 100)}%;background:${PAL[index]}"></b></span><em>${fmtM(value)}</em><small>${Math.round(value / total * 100)}%</small></div>`).join('');
    return `<div class="td-chart__tools">${buttons('pDonut', [['pie', 'Pie'], ['donut', 'Donut']], state.pDonut ? 'donut' : 'pie')}<strong class="td-chart__title">${esc(pieTitle)}</strong><span></span><button type="button" class="td-btn td-btn--secondary td-btn--sm" data-ch-export="pie">Exportar CSV</button></div>
        <div class="td-chart__pie"><svg viewBox="0 0 320 300" data-ch-plot role="img" aria-label="${esc(pieTitle)}">${body}</svg><div data-ch-pie-list>${rows}</div></div>`;
}

function scatterChart(state: ChartState): string {
    const channels = ['Web', 'Asesor', 'Flota'];
    const colors = [0, 2, 3];
    const pts = state.points.filter((point) => !state.sHid.includes(channels[point.c]));
    const scaleX = nice(2000);
    const scaleY = nice(6.5);
    const x = (value: number) => L + value / scaleX.max * PW;
    const y = (value: number) => T + PH - value / scaleY.max * PH;
    let body = axisY(scaleY.max, scaleY.step, (tick) => `${tick} d`);
    for (let tick = 0; tick <= scaleX.max + 1e-9; tick += scaleX.step) {
        body += `<text x="${x(tick)}" y="${T + PH + 20}" text-anchor="middle" font-size="11" fill="var(--td-color-text-muted)" font-family="var(--td-font-mono)">${tick ? `$${tick}k` : '0'}</text>`;
    }
    pts.forEach((point) => {
        const hover = state.sHov === point.id;
        body += `<circle data-ch-point="${point.id}" cx="${x(point.val)}" cy="${y(point.dias)}" r="${4 + point.u / 2.4}" fill="${PAL[colors[point.c]]}" fill-opacity="${hover ? .9 : .35}" stroke="${PAL[colors[point.c]]}" stroke-width="${hover ? 2.5 : 1.25}"></circle>`;
    });
    let trend = '';
    if (state.sTrend && pts.length > 2) {
        const count = pts.length;
        const meanX = pts.reduce((sum, point) => sum + point.val, 0) / count;
        const meanY = pts.reduce((sum, point) => sum + point.dias, 0) / count;
        const slope = pts.reduce((sum, point) => sum + (point.val - meanX) * (point.dias - meanY), 0) / pts.reduce((sum, point) => sum + (point.val - meanX) ** 2, 0);
        const intercept = meanY - slope * meanX;
        body += `<line x1="${x(0)}" y1="${y(intercept)}" x2="${x(2000)}" y2="${y(intercept + slope * 2000)}" stroke="var(--td-color-text)" stroke-width="2" stroke-dasharray="6 5"></line>`;
        trend = `Tendencia: +${(slope * 1000).toFixed(2).replace('.', ',')} días por cada $ 1 M de pedido`;
    }
    const current = state.points.find((point) => point.id === state.sHov);
    const read = current
        ? `${current.oc} · ${channels[current.c]} · $ ${(current.val * 1000).toLocaleString('es-CL')} · ${String(current.dias).replace('.', ',')} días · ${current.u} unidades`
        : 'Pasa el mouse sobre un punto';
    const legendHtml = channels.map((name, index) => {
        const off = state.sHid.includes(name);
        return `<button type="button" data-ch-channel="${name}" aria-pressed="${!off}" style="opacity:${off ? .4 : 1};text-decoration:${off ? 'line-through' : 'none'}"><i style="background:${PAL[colors[index]]};border-radius:50%"></i>${name}</button>`;
    }).join('');
    return `<div class="td-chart__tools"><strong class="td-chart__title">Valor del pedido vs días de entrega</strong><div class="td-chart__legend">${legendHtml}</div>${sw('sTrend', state.sTrend, 'Línea de tendencia')}</div>
        ${svgWrap(body, H0 + 14, 'Dispersión de pedidos')}
        <p class="td-chart__read" role="status">${read}</p><p class="td-chart__trend">${trend}</p>`;
}

function polar(cx: number, cy: number, radius: number, deg: number): [number, number] {
    const angle = (deg - 90) * Math.PI / 180;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

function arc(cx: number, cy: number, radius: number, start: number, end: number): string {
    const p0 = polar(cx, cy, radius, start);
    const p1 = polar(cx, cy, radius, end);
    return `M${p0[0].toFixed(1)},${p0[1].toFixed(1)} A${radius},${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${p1[0].toFixed(1)},${p1[1].toFixed(1)}`;
}

function gaugeChart(state: ChartState): string {
    const value = state.g;
    const toDeg = (n: number) => -120 + n / 100 * 240;
    let radial = '';
    [[0, 60, 'var(--td-color-danger)'], [60, 85, 'var(--td-color-warning)'], [85, 100, 'var(--td-color-success)']].forEach(([a, b, color]) => {
        radial += `<path d="${arc(150, 150, 110, toDeg(a), toDeg(b))}" fill="none" stroke="${color}" stroke-width="14"></path>`;
    });
    for (let tick = 0; tick <= 100; tick += 10) {
        const p0 = polar(150, 150, 94, toDeg(tick));
        const p1 = polar(150, 150, tick % 50 ? 88 : 82, toDeg(tick));
        radial += `<line x1="${p0[0]}" y1="${p0[1]}" x2="${p1[0]}" y2="${p1[1]}" stroke="var(--td-color-text-muted)" stroke-width="${tick % 50 ? 1.5 : 2.5}"></line>`;
    }
    const needle = polar(150, 150, 100, toDeg(value));
    radial += `<line x1="150" y1="150" x2="${needle[0]}" y2="${needle[1]}" stroke="var(--td-color-text)" stroke-width="4" stroke-linecap="round"></line><circle cx="150" cy="150" r="9" fill="var(--td-color-text)"></circle>`;
    radial += `<text x="150" y="212" text-anchor="middle" font-size="34" font-weight="800" fill="var(--td-color-text)" font-family="var(--td-font-display)">${value}%</text>`;
    radial += `<text x="150" y="234" text-anchor="middle" font-size="12" fill="var(--td-color-text-muted)">Cumplimiento de meta</text>`;
    const otif = Math.max(0, Math.min(100, Math.round(value * 0.4 + 58)));
    const target = 95;
    const length = Math.PI * 100;
    const color = value >= 85 ? 'var(--td-color-success)' : value >= 60 ? 'var(--td-color-warning)' : 'var(--td-color-danger)';
    const stateLabel = value >= 85 ? 'Sobre la meta' : value >= 60 ? 'En riesgo' : 'Bajo la meta';
    return `<div class="td-chart__gauges">
        <div><span>Radial · con rangos</span><svg viewBox="0 0 300 250" role="img" aria-label="Cumplimiento ${value} %">${radial}</svg><strong style="color:${color}">${stateLabel}</strong></div>
        <div><span>Arco · contra meta</span><svg viewBox="0 0 240 150" role="img" aria-label="OTIF ${otif} %"><path d="M20,130 A100,100 0 0 1 220,130" fill="none" stroke="var(--td-color-border)" stroke-width="18" stroke-linecap="round"></path><path d="M20,130 A100,100 0 0 1 220,130" fill="none" stroke="${otif >= target ? 'var(--td-color-success)' : 'var(--td-color-primary)'}" stroke-width="18" stroke-linecap="round" stroke-dasharray="${(length * otif / 100).toFixed(1)} ${length.toFixed(1)}"></path><text x="120" y="118" text-anchor="middle" font-size="32" font-weight="800" fill="var(--td-color-text)" font-family="var(--td-font-display)">${otif}%</text><text x="120" y="142" text-anchor="middle" font-size="11.5" fill="var(--td-color-text-muted)">OTIF · meta ${target}%</text></svg></div>
    </div>
    <div class="td-chart__tools"><label class="td-chart__range">Valor<input type="range" min="0" max="100" value="${value}" data-ch-gauge></label><button type="button" class="td-btn" data-ch-sim>Simular dato</button></div>`;
}

function sparkChart(state: ChartState): string {
    const cards: [string, string, string, boolean, number[], string][] = [
        ['Ventas del mes', '$ 84,0 M', '+12,4%', true, [52, 55, 54, 58, 61, 60, 66, 70, 68, 74, 79, 84], 'area'],
        ['Pedidos', '1.284', '+8,1%', true, [920, 980, 1010, 990, 1060, 1100, 1090, 1150, 1180, 1210, 1240, 1284], 'line'],
        ['Ticket promedio', '$ 65.420', '−2,3%', false, [70, 69, 71, 68, 67, 69, 68, 66, 67, 66, 65.8, 65.4], 'line'],
        ['Devoluciones', '1,8%', '−0,4 pp', true, [2.6, 2.5, 2.4, 2.4, 2.3, 2.2, 2.2, 2.1, 2, 1.9, 1.9, 1.8], 'bar']
    ];
    const kpis = cards.map(([title, value, delta, good, data, type], index) => {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const width = 220;
        const height = 56;
        const x = (i: number) => 2 + i * (width - 4) / (data.length - 1);
        const y = (n: number) => height - 4 - (n - min) / ((max - min) || 1) * (height - 10);
        const pts = data.map((n, i) => [x(i), y(n)]);
        const hover = state.kHov && state.kHov[0] === index ? state.kHov[1] : data.length - 1;
        let plot = '';
        if (type === 'bar') {
            plot = data.map((n, i) => `<rect x="${2 + i * (width - 4) / data.length + 2}" y="${y(n)}" width="${(width - 4) / data.length - 4}" height="${height - 2 - y(n)}" rx="1" fill="${i === data.length - 1 ? 'var(--td-color-primary)' : 'var(--td-color-border-strong)'}"></rect>`).join('');
        } else {
            const d = smoothPath(pts);
            if (type === 'area') {
                plot += `<path d="${d} L${x(data.length - 1)},${height} L${x(0)},${height} Z" fill="var(--td-color-primary)" opacity="0.12"></path>`;
            }
            plot += `<path d="${d}" fill="none" stroke="var(--td-color-primary)" stroke-width="2"></path><circle cx="${pts[hover][0]}" cy="${pts[hover][1]}" r="3.5" fill="var(--td-color-primary)"></circle>`;
        }
        const read = state.kHov && state.kHov[0] === index ? `Mes ${state.kHov[1] + 1}: ${data[state.kHov[1]].toLocaleString('es-CL')}` : 'Últimos 12 meses';
        return `<article><span>${title}</span><div><strong>${value}</strong><em style="color:${good ? 'var(--td-color-success)' : 'var(--td-color-danger)'}">${delta.startsWith('+') || delta.startsWith('−') ? (delta.startsWith('+') ? '▲' : '▼') : ''} ${delta}</em></div><svg data-ch-spark="${index}" viewBox="0 0 ${width} ${height}" width="100%" height="${height}">${plot}</svg><small>${read}</small></article>`;
    }).join('');
    const table = [['Frenos', [18, 21, 19, 24, 26, 25, 29, 31, 34]], ['Motor', [14, 15, 17, 16, 18, 20, 19, 22, 23]], ['Suspensión', [9, 10, 9, 11, 12, 12, 13, 14, 15]], ['Eléctrico', [6, 7, 8, 7, 9, 9, 10, 11, 12]], ['Transmisión', [8, 7, 7, 6, 6, 7, 6, 5, 5]]] as [string, number[]][];
    const rows = table.map(([name, values]) => {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const up = values[values.length - 1] >= values[0];
        const points = values.map((n, index) => `${(index * 120 / (values.length - 1)).toFixed(1)},${(25 - (n - min) / ((max - min) || 1) * 22).toFixed(1)}`).join(' ');
        const delta = `${up ? '+' : ''}${Math.round((values[values.length - 1] / values[0] - 1) * 100)}%`;
        return `<div><span>${name}</span><svg viewBox="0 0 120 28" width="120" height="28"><polyline points="${points}" fill="none" stroke="${up ? 'var(--td-color-text)' : 'var(--td-color-danger)'}" stroke-width="1.75"></polyline></svg><em>${fmtM(values[values.length - 1])}</em><strong style="color:${up ? 'var(--td-color-success)' : 'var(--td-color-danger)'}">${delta}</strong></div>`;
    }).join('');
    return `<div class="td-chart__sparks">${kpis}</div><div class="td-chart__table"><div><span>Categoría</span><span>Ene–Sep</span><span>Sep</span><span>Var.</span></div>${rows}</div>`;
}

function heatChart(state: ChartState): string {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const hours = Array.from({ length: 12 }, (_, index) => 8 + index);
    const value = (day: number, hour: number) => {
        const base = day < 5 ? 1 : day === 5 ? 0.55 : 0.15;
        const peak = Math.exp(-((hour - 10.5) ** 2) / 3) + Math.exp(-((hour - 16) ** 2) / 4) * 0.8;
        return Math.round((6 + peak * 38) * base * (1 + ((day * 7 + hour * 3) % 5) / 12));
    };
    const cells = days.map((_, day) => hours.map((hour) => value(day, hour)));
    const max = Math.max(...cells.flat());
    const byHour = hours.map((_, index) => cells.reduce((sum, row) => sum + row[index], 0));
    const byDay = cells.map((row) => row.reduce((sum, n) => sum + n, 0));
    const kpis = [
        ['Hora punta', `${hours[byHour.indexOf(Math.max(...byHour))]}:00`],
        ['Día con más pedidos', days[byDay.indexOf(Math.max(...byDay))]],
        ['Total semana', `${byDay.reduce((a, b) => a + b, 0).toLocaleString('es-CL')} pedidos`]
    ];
    const head = hours.map((hour) => `<span>${String(hour).padStart(2, '0')}:00</span>`).join('');
    const grid = days.map((day, dayIndex) => `<span class="td-chart__day">${day}</span>${hours.map((hour, hourIndex) => {
        const n = cells[dayIndex][hourIndex];
        const tone = n / max;
        const on = state.hHov && state.hHov[0] === dayIndex && state.hHov[1] === hourIndex;
        return `<button type="button" data-ch-heat="${dayIndex}-${hourIndex}" style="background:color-mix(in srgb, var(--td-color-primary) ${Math.round(6 + tone * 94)}%, var(--td-color-surface));color:${tone > .55 ? '#fff' : 'var(--td-color-text)'};box-shadow:${on ? 'inset 0 0 0 2px var(--td-color-text)' : 'none'}" aria-label="${day} ${hour}:00 · ${n} pedidos">${n}</button>`;
    }).join('')}`).join('');
    const read = state.hHov
        ? `${days[state.hHov[0]]} ${hours[state.hHov[1]]}:00–${hours[state.hHov[1]] + 1}:00 · ${cells[state.hHov[0]][state.hHov[1]]} pedidos`
        : 'Pasa el mouse sobre una celda';
    return `<div class="td-chart__kpis">${kpis.map(([k, v]) => `<div><span>${k}</span><strong>${v}</strong></div>`).join('')}</div>
        <strong class="td-chart__title">Pedidos por día y hora · última semana</strong>
        <div class="td-chart__heat" role="grid" aria-label="Pedidos por día y hora"><span></span>${head}${grid}</div>
        <div class="td-chart__scale"><span>0</span><i></i><span>${max}</span><p role="status">${read}</p></div>`;
}

function paint(host: HTMLElement, state: ChartState): void {
    const kind = host.dataset.kind || 'chline';
    const basic = kind === 'chline' || kind === 'chcol' || kind === 'chpie' || !kind;
    if (!state.model) {
        const adv = renderAdv(kind, state.advHov, state.spc);
        if (adv) {
            host.innerHTML = adv;
            return;
        }
    } else if (!basic && kind !== 'chline') {
        host.innerHTML = columnChart(state);
        return;
    }
    const html = kind === 'chcol' ? columnChart(state)
        : kind === 'chpie' ? pieChart(state)
        : kind === 'chscatter' ? scatterChart(state)
        : kind === 'chgauge' ? gaugeChart(state)
        : kind === 'chspark' ? sparkChart(state)
        : kind === 'chheat' ? heatChart(state)
        : lineChart(state);
    host.innerHTML = html;
}

function indexFrom(svg: SVGSVGElement, event: MouseEvent, count: number): number {
    const box = svg.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width * W0;
    return Math.max(0, Math.min(count - 1, Math.round((x - L) / (PW / (count - 1)))));
}

function freshState(): ChartState {
    let seed = 7;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    return {
        lType: 'area',
        smooth: true,
        markers: true,
        hidden: [],
        hov: null,
        cOri: 'v',
        cMode: 'group',
        target: false,
        pDonut: true,
        pHov: null,
        sHid: [],
        sHov: null,
        sTrend: true,
        g: 78,
        kHov: null,
        hHov: null,
        advHov: null,
        model: null,
        source: '',
        spc: spcSeries(),
        points: Array.from({ length: 48 }, (_, index) => {
            const c = index % 3;
            const val = Math.round(60 + rnd() * 1900);
            const dias = Math.max(0.5, Math.round((0.8 + val / 900 + (c === 2 ? -0.6 : c === 0 ? 0.5 : 0) + (rnd() - 0.5) * 1.6) * 10) / 10);
            return { id: index, c, val, dias, u: Math.round(1 + rnd() * 24), oc: `OC-${String(480 + index).padStart(5, '0')}` };
        })
    };
}

const chartStates = new WeakMap<HTMLElement, ChartState>();

export function bindCharts(root: ParentNode = document): void {
    root.querySelectorAll<HTMLElement>('td-chart').forEach((host) => {
        const previous = chartStates.get(host);
        const source = host.dataset.model || '';
        if (previous) {
            if (previous.source !== source) {
                previous.source = source;
                previous.model = parseModel(source);
                paint(host, previous);
            }
            return;
        }
        const state = freshState();
        state.source = source;
        state.model = parseModel(source);
        chartStates.set(host, state);
        const render = () => paint(host, state);
        host.addEventListener('click', (event) => {
            const target = event.target instanceof Element ? event.target : null;
            const button = target?.closest('button');
            if (!(button instanceof HTMLButtonElement) || !host.contains(button)) {
                return;
            }
            const key = button.dataset.chKey;
            const value = button.dataset.chValue;
            if (key === 'lType' && (value === 'line' || value === 'area' || value === 'step')) {
                state.lType = value;
            } else if (key === 'cOri' && (value === 'v' || value === 'h')) {
                state.cOri = value;
            } else if (key === 'cMode' && (value === 'group' || value === 'stack' || value === 'pct')) {
                state.cMode = value;
            } else if (key === 'pDonut') {
                state.pDonut = value === 'donut';
            } else if (button.dataset.chToggle) {
                const toggle = button.dataset.chToggle;
                if (toggle === 'smooth') state.smooth = !state.smooth;
                if (toggle === 'markers') state.markers = !state.markers;
                if (toggle === 'target') state.target = !state.target;
                if (toggle === 'sTrend') state.sTrend = !state.sTrend;
            } else if (button.dataset.chLegend) {
                const name = button.dataset.chLegend;
                state.hidden = state.hidden.includes(name) ? state.hidden.filter((item) => item !== name) : [...state.hidden, name];
            } else if (button.dataset.chChannel) {
                const name = button.dataset.chChannel;
                state.sHid = state.sHid.includes(name) ? state.sHid.filter((item) => item !== name) : [...state.sHid, name];
            } else if (button.dataset.chExport === 'ventas') {
                const rows = chartSeries(state);
                const labels = chartCats(state);
                csv('ventas-por-categoria', [['Mes', ...rows.map((series) => series[0])], ...labels.map((month, index) => [month, ...rows.map((series) => series[1][index] ?? 0)])]);
                return;
            } else if (button.dataset.chExport === 'pie') {
                const data: [string, number][] = state.model
                    ? chartCats(state).map((name, index) => [name, state.model?.series[0]?.[1][index] ?? 0])
                    : [['Quilicura', 128], ['Concepción', 64], ['Antofagasta', 55], ['Puerto Montt', 34], ['En tránsito', 24]];
                const total = data.reduce((sum, row) => sum + row[1], 0);
                csv('stock-por-bodega', [['Bodega', 'Valor (M)', '%'], ...data.map((row) => [row[0], row[1], Math.round(row[1] / total * 100)])]);
                return;
            } else if (button.dataset.chSim !== undefined) {
                state.g = Math.round(35 + Math.random() * 64);
            } else if (button.dataset.chHeat) {
                const [day, hour] = button.dataset.chHeat.split('-').map(Number);
                state.hHov = [day, hour];
            }
            render();
        });
        host.addEventListener('input', (event) => {
            const range = event.target;
            if (range instanceof HTMLInputElement && range.matches('[data-ch-gauge]')) {
                state.g = Number(range.value);
                render();
            }
        });
        host.addEventListener('mousemove', (event) => {
            const plot = event.target instanceof Element ? event.target.closest('[data-ch-plot]') : null;
            if (plot instanceof SVGSVGElement && (host.dataset.kind === 'chline' || !host.dataset.kind)) {
                const next = indexFrom(plot, event, chartCats(state).length);
                if (next !== state.hov) {
                    state.hov = next;
                    render();
                }
            }
            const spark = event.target instanceof Element ? event.target.closest('[data-ch-spark]') : null;
            if (spark instanceof SVGSVGElement) {
                const box = spark.getBoundingClientRect();
                const index = Number(spark.dataset.chSpark);
                const point = Math.max(0, Math.min(11, Math.round((event.clientX - box.left) / box.width * 11)));
                if (!state.kHov || state.kHov[0] !== index || state.kHov[1] !== point) {
                    state.kHov = [index, point];
                    render();
                }
            }
        });
        host.addEventListener('mouseover', (event) => {
            const target = event.target instanceof Element ? event.target : null;
            const col = target?.closest('[data-ch-col]');
            if (col instanceof SVGElement) {
                const index = Number(col.dataset.chCol);
                if (state.hov !== index) {
                    state.hov = index;
                    render();
                }
            }
            const pie = target?.closest('[data-ch-pie]');
            if (pie instanceof Element) {
                const index = Number(pie.dataset.chPie);
                if (state.pHov !== index) {
                    state.pHov = index;
                    render();
                }
            }
            const point = target?.closest('[data-ch-point]');
            if (point instanceof Element) {
                const id = Number(point.dataset.chPoint);
                if (state.sHov !== id) {
                    state.sHov = id;
                    render();
                }
            }
            const heat = target?.closest('[data-ch-heat]');
            if (heat instanceof HTMLElement) {
                const [day, hour] = (heat.dataset.chHeat ?? '0-0').split('-').map(Number);
                if (!state.hHov || state.hHov[0] !== day || state.hHov[1] !== hour) {
                    state.hHov = [day, hour];
                    render();
                }
            }
            const mark = target?.closest('[data-ch-hov]');
            if (mark instanceof Element) {
                const key = (mark as HTMLElement).dataset.chHov ?? '';
                if (state.advHov !== key) {
                    state.advHov = key;
                    render();
                }
            }
        });
        host.addEventListener('mouseleave', () => {
            state.hov = null;
            state.pHov = null;
            state.sHov = null;
            state.kHov = null;
            state.hHov = null;
            state.advHov = null;
            render();
        });
        render();
    });
}
