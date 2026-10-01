const PAL = ['var(--td-color-primary)', 'var(--td-color-text)', 'var(--td-color-info)', 'var(--td-color-success)', 'var(--td-color-warning)', '#9CA3AB'];
const MUT = 'var(--td-color-text-muted)';
const TXT = 'var(--td-color-text)';
const GRID = 'var(--td-color-border)';
const OK = 'var(--td-color-success)';
const BAD = 'var(--td-color-danger)';

const ADV = new Set(['chwf', 'chfunnel', 'chpareto', 'chtree', 'chradar', 'chsankey', 'chbullet', 'chgantt', 'chforecast', 'chvariance', 'chquadrant', 'chcohort', 'chmekko', 'chslope', 'chdumbbell', 'chcontrol']);

function fm(n: number): string {
    return `$ ${(Math.round(n * 10) / 10).toLocaleString('es-CL')} M`;
}

function tx(x: number, y: number, text: string, o: { fs?: number; fill?: string; a?: string; fw?: number; ff?: string } = {}): string {
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${o.fs ?? 11.5}" fill="${o.fill ?? MUT}" font-family="${o.ff ?? 'var(--td-font-family)'}" text-anchor="${o.a ?? 'middle'}" font-weight="${o.fw ?? 400}" pointer-events="none">${text}</text>`;
}

function dim(hov: string | null, key: string): number {
    return hov == null || hov === key ? 1 : 0.4;
}

function frame(title: string, sub: string, body: string, w: number, h: number, label: string, read: string, notes: string[]): string {
    return `<div class="td-chart__head"><strong>${title}</strong><em>${sub}</em></div>
        <svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="${label}" data-ch-plot>${body}</svg>
        <p class="td-chart__read" role="status">${read}</p>
        <ul class="td-chart__ins">${notes.map((note) => `<li>${note}</li>`).join('')}</ul>`;
}

export function spcSeries(): number[] {
    let seed = 11;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    return Array.from({ length: 30 }, (_, index) => Math.round((22 + (rnd() - 0.5) * 7 + (index === 17 ? 11 : 0) + (index > 23 ? 2.2 : 0)) * 10) / 10);
}

function waterfall(hov: string | null): string {
    const data: [string, number, string?][] = [['Ventas', 84, 't'], ['Costo repuestos', -46.2], ['Flete', -6.2], ['Descuentos', -3.4], ['Devoluciones', -1.5], ['Otros ingresos', 1.3], ['Margen bruto', 0, 't']];
    let acc = 0;
    const rows = data.map(([name, value, total]) => {
        if (total) {
            const tot = name === 'Ventas' ? value : acc;
            acc = tot;
            return { name, a: 0, b: tot, value: tot, total: true };
        }
        const start = acc;
        acc += value;
        return { name, a: start, b: acc, value, total: false };
    });
    const width = 760;
    const height = 340;
    const left = 50;
    const top = 14;
    const bottom = 46;
    const plot = height - top - bottom;
    const max = 90;
    const band = (width - left - 10) / rows.length;
    const y = (value: number) => top + plot - value / max * plot;
    let body = '';
    for (let tick = 0; tick <= max; tick += 15) {
        body += `<line x1="${left}" x2="${width - 10}" y1="${y(tick)}" y2="${y(tick)}" stroke="${GRID}" stroke-dasharray="${tick ? '3 4' : ''}"></line>${tx(left - 8, y(tick) + 4, String(tick), { a: 'end', ff: 'var(--td-font-mono)', fs: 11 })}`;
    }
    rows.forEach((row, index) => {
        const x = left + index * band + band * 0.15;
        const w = band * 0.7;
        const y0 = y(Math.max(row.a, row.b));
        const h = Math.abs(y(row.a) - y(row.b));
        const color = row.total ? TXT : row.value < 0 ? BAD : OK;
        const key = String(index);
        body += `<rect data-ch-hov="${key}" x="${x}" y="${y0}" width="${w}" height="${Math.max(1, h)}" rx="2" fill="${color}" opacity="${dim(hov, key)}"></rect>`;
        body += tx(x + w / 2, y0 - 6, `${row.total ? '' : row.value > 0 ? '+' : '−'}${Math.abs(row.value).toLocaleString('es-CL')}`, { ff: 'var(--td-font-mono)', fw: 700, fill: TXT });
        const parts = row.name.split(' ');
        body += tx(x + w / 2, height - bottom + 18, parts[0], { fs: 11 });
        body += tx(x + w / 2, height - bottom + 32, parts.slice(1).join(' '), { fs: 11 });
        if (index < rows.length - 1) {
            body += `<line x1="${x + w}" x2="${x + band}" y1="${y(row.b)}" y2="${y(row.b)}" stroke="var(--td-color-border-strong)" stroke-dasharray="2 3"></line>`;
        }
    });
    const current = hov == null ? null : rows[Number(hov)];
    const read = current
        ? `${current.name} · ${current.total ? fm(current.value) : `${current.value > 0 ? '+' : '−'}${fm(Math.abs(current.value))} · acumulado ${fm(current.b)}`}`
        : 'Pasa el mouse sobre el gráfico';
    return frame('Puente de margen · septiembre 2026', 'millones CLP', body, width, height, 'Waterfall de margen', read, [
        `Margen bruto ${fm(rows[6].value)} (${Math.round(rows[6].value / 84 * 100)}% de las ventas)`,
        `Mayor fuga: flete, ${fm(6.2)} (7,4%)`,
        `Devoluciones bajaron a ${fm(1.5)}`
    ]);
}

function funnel(hov: string | null): string {
    const data: [string, number][] = [['Visitas', 48200], ['Búsqueda de repuesto', 21300], ['Ficha técnica', 9840], ['Carrito', 3120], ['Cotización', 1460], ['Pedido', 1284]];
    const width = 760;
    const height = 360;
    const cx = 300;
    const maxW = 520;
    const sh = 54;
    const gap = 6;
    let body = '';
    data.forEach(([name, value], index) => {
        const w0 = maxW * Math.sqrt(value / data[0][1]);
        const w1 = index < data.length - 1 ? maxW * Math.sqrt(data[index + 1][1] / data[0][1]) : w0 * 0.92;
        const y = 10 + index * (sh + gap);
        const key = String(index);
        const fill = index === data.length - 1 ? 'var(--td-color-primary)' : `color-mix(in srgb, var(--td-color-text) ${85 - index * 13}%, var(--td-color-surface))`;
        body += `<path data-ch-hov="${key}" d="M${cx - w0 / 2},${y} L${cx + w0 / 2},${y} L${cx + w1 / 2},${y + sh} L${cx - w1 / 2},${y + sh} Z" fill="${fill}" opacity="${dim(hov, key)}"></path>`;
        body += tx(cx, y + sh / 2 + 5, value.toLocaleString('es-CL'), { fs: 15, fw: 800, fill: index > 2 && index < data.length - 1 ? TXT : '#fff', ff: 'var(--td-font-display)' });
        body += tx(cx + maxW / 2 + 20, y + 22, name, { a: 'start', fs: 13, fw: 600, fill: TXT });
        body += tx(cx + maxW / 2 + 20, y + 40, index ? `${Math.round(value / data[index - 1][1] * 1000) / 10}% del paso anterior` : '100%', { a: 'start', fs: 11.5, ff: 'var(--td-font-mono)' });
    });
    const current = hov == null ? null : data[Number(hov)];
    const read = current
        ? `${current[0]} · ${current[1].toLocaleString('es-CL')} · ${Math.round(current[1] / data[0][1] * 1000) / 10}% de las visitas${Number(hov) ? ` · perdidos en este paso ${(data[Number(hov) - 1][1] - current[1]).toLocaleString('es-CL')}` : ''}`
        : 'Pasa el mouse sobre el gráfico';
    return frame('Embudo de conversión · tienda web · septiembre', 'sesiones', body, width, height, 'Embudo de conversión', read, [
        'Conversión total 2,66%',
        'Mayor caída: Ficha técnica → Carrito (−68%)',
        'Cotización → Pedido cierra al 88%'
    ]);
}

function pareto(hov: string | null): string {
    const data: [string, number][] = [['Pastillas', 34], ['Filtros', 28], ['Discos', 22], ['Amortig.', 18], ['Turbo', 16], ['Neumático', 14], ['Embragues', 13], ['Refriger.', 12], ['Alternad.', 11], ['Muelles', 9], ['Ilumin.', 7], ['Sensores', 6], ['Correas', 5], ['Bujes', 4]];
    const total = data.reduce((sum, row) => sum + row[1], 0);
    const width = 780;
    const height = 340;
    const left = 44;
    const right = 44;
    const top = 14;
    const bottom = 44;
    const plotW = width - left - right;
    const plotH = height - top - bottom;
    const band = plotW / data.length;
    const max = 40;
    let cum = 0;
    const pts: number[][] = [];
    let body = `<line x1="${left}" x2="${width - right}" y1="${top + plotH * 0.2}" y2="${top + plotH * 0.2}" stroke="var(--td-color-warning)" stroke-dasharray="5 4"></line>${tx(width - right + 4, top + plotH * 0.2 + 4, '80%', { a: 'start', ff: 'var(--td-font-mono)', fs: 11, fill: 'var(--td-color-warning)' })}`;
    for (let tick = 0; tick <= max; tick += 10) {
        const y = top + plotH - tick / max * plotH;
        body += `<line x1="${left}" x2="${width - right}" y1="${y}" y2="${y}" stroke="${GRID}" stroke-dasharray="${tick ? '3 4' : ''}"></line>${tx(left - 8, y + 4, String(tick), { a: 'end', ff: 'var(--td-font-mono)', fs: 11 })}`;
    }
    data.forEach(([name, value], index) => {
        const prev = cum;
        cum += value;
        const cls = prev / total < 0.8 ? 'A' : prev / total < 0.95 ? 'B' : 'C';
        const x = left + index * band + band * 0.14;
        const h = value / max * plotH;
        const key = String(index);
        const fill = cls === 'A' ? 'var(--td-color-primary)' : cls === 'B' ? TXT : '#9CA3AB';
        body += `<rect data-ch-hov="${key}" x="${x}" y="${top + plotH - h}" width="${band * 0.72}" height="${h}" rx="2" fill="${fill}" opacity="${dim(hov, key)}"></rect>`;
        body += tx(x + band * 0.36, height - bottom + 16, name, { fs: 10.5 });
        body += tx(x + band * 0.36, height - bottom + 30, cls, { fs: 10.5, fw: 700, ff: 'var(--td-font-mono)', fill: TXT });
        pts.push([left + index * band + band / 2, top + plotH - (cum / total) * plotH]);
    });
    body += `<path d="${pts.map((p, index) => `${index ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ')}" fill="none" stroke="var(--td-color-info)" stroke-width="2.5"></path>`;
    pts.forEach((point, index) => {
        body += `<circle cx="${point[0]}" cy="${point[1]}" r="${hov === String(index) ? 5 : 3}" fill="var(--td-color-info)"></circle>`;
    });
    [0, 50, 100].forEach((tick) => {
        body += tx(width - right + 8, top + plotH - tick / 100 * plotH + 4, `${tick}%`, { a: 'start', ff: 'var(--td-font-mono)', fs: 11, fill: 'var(--td-color-info)' });
    });
    const index = hov == null ? -1 : Number(hov);
    const read = index < 0 ? 'Pasa el mouse sobre el gráfico' : `${data[index][0]} · ${fm(data[index][1])} · ${Math.round(data[index][1] / total * 100)}% · acumulado ${Math.round(data.slice(0, index + 1).reduce((sum, row) => sum + row[1], 0) / total * 100)}%`;
    const classA = data.filter((_, i) => data.slice(0, i).reduce((sum, row) => sum + row[1], 0) / total < 0.8).length;
    return frame('Ventas por familia · clasificación ABC', 'millones CLP · acumulado en %', body, width, height, 'Pareto ABC', read, [
        `Clase A: ${classA} de ${data.length} familias generan el 80% de la venta`,
        'Prioriza stock de seguridad en clase A',
        'Clase C candidata a venta bajo pedido'
    ]);
}

function treemap(hov: string | null): string {
    const groups: [string, [string, number][]][] = [['Frenos', [['Pastillas', 34], ['Discos', 22], ['Neumático', 14], ['Sensores', 6]]], ['Motor', [['Filtros', 28], ['Turbo', 16], ['Refrigeración', 12]]], ['Suspensión', [['Amortiguadores', 18], ['Muelles', 9]]], ['Eléctrico', [['Alternadores', 11], ['Iluminación', 7]]], ['Transmisión', [['Embragues', 13]]]];
    const sum = (items: [string, number][]) => items.reduce((total, item) => total + item[1], 0);
    const total = groups.reduce((acc, group) => acc + sum(group[1]), 0);
    const width = 780;
    const height = 380;
    let x = 0;
    let body = '';
    groups.forEach(([name, kids], groupIndex) => {
        const groupWidth = width * sum(kids) / total;
        let y = 0;
        const groupSum = sum(kids);
        kids.forEach(([label, value], kidIndex) => {
            const h = height * value / groupSum;
            const key = `${groupIndex}-${kidIndex}`;
            body += `<rect data-ch-hov="${key}" x="${x + 1}" y="${y + 1}" width="${groupWidth - 2}" height="${h - 2}" fill="${PAL[groupIndex]}" fill-opacity="${0.92 - kidIndex * 0.18}" stroke="var(--td-color-surface)" stroke-width="2" opacity="${dim(hov, key)}"></rect>`;
            if (groupWidth > 90 && h > 44) {
                body += tx(x + 10, y + 22, label, { a: 'start', fs: 13, fw: 700, fill: '#fff' });
                body += tx(x + 10, y + 40, fm(value), { a: 'start', fs: 11.5, ff: 'var(--td-font-mono)', fill: 'rgba(255,255,255,.85)' });
            }
            y += h;
        });
        body += groupWidth > 70
            ? tx(x + groupWidth / 2, height + 18, name, { fs: 12, fw: 700, fill: TXT })
            : tx(Math.min(width - 2, x + groupWidth), height + 18, name, { fs: 12, fw: 700, fill: TXT, a: 'end' });
        x += groupWidth;
    });
    let read = 'Pasa el mouse sobre el gráfico';
    if (hov) {
        const [groupIndex, kidIndex] = hov.split('-').map(Number);
        const group = groups[groupIndex];
        const item = group[1][kidIndex];
        read = `${group[0]} › ${item[0]} · ${fm(item[1])} · ${Math.round(item[1] / total * 100)}% del total · ${Math.round(item[1] / sum(group[1]) * 100)}% de ${group[0]}`;
    }
    return frame('Valor de venta por categoría y subcategoría', 'área proporcional · millones CLP', body, width, height + 26, 'Treemap', read, [
        `Frenos concentra el ${Math.round(sum(groups[0][1]) / total * 100)}% del valor`,
        'Pastillas es la subcategoría más grande',
        'Transmisión depende de un solo producto'
    ]);
}

function radar(hov: string | null): string {
    const axes = ['Precio', 'Plazo', 'Calidad', 'Stock', 'Garantía', 'Soporte'];
    const suppliers: [string, number[]][] = [['Volvo Parts', [6, 7, 9.5, 8, 9, 8]], ['Bosch', [7.5, 8.5, 8.5, 9, 7, 7]], ['Genérico', [9.5, 6, 5.5, 7, 4, 5]]];
    const cx = 230;
    const cy = 190;
    const radius = 150;
    const point = (index: number, value: number) => {
        const angle = -Math.PI / 2 + index * 2 * Math.PI / axes.length;
        return [cx + Math.cos(angle) * radius * value / 10, cy + Math.sin(angle) * radius * value / 10];
    };
    let body = '';
    [2, 4, 6, 8, 10].forEach((tick) => {
        body += `<polygon points="${axes.map((_, index) => point(index, tick).join(',')).join(' ')}" fill="none" stroke="${GRID}"></polygon>`;
    });
    axes.forEach((axis, index) => {
        const edge = point(index, 10);
        const label = point(index, 11.6);
        body += `<line x1="${cx}" y1="${cy}" x2="${edge[0]}" y2="${edge[1]}" stroke="${GRID}"></line>${tx(label[0], label[1] + 4, axis, { fs: 12.5, fw: 600, fill: TXT })}`;
    });
    suppliers.forEach(([, values], index) => {
        const color = PAL[[0, 2, 1][index]];
        const key = String(index);
        body += `<polygon data-ch-hov="${key}" points="${values.map((value, i) => point(i, value).join(',')).join(' ')}" fill="${color}" fill-opacity="${hov === key ? 0.3 : 0.1}" stroke="${color}" stroke-width="${hov === key ? 3 : 2}"></polygon>`;
        values.forEach((value, i) => {
            const p = point(i, value);
            body += `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${color}" pointer-events="none"></circle>`;
        });
    });
    suppliers.forEach(([name], index) => {
        const score = (suppliers[index][1].reduce((a, b) => a + b, 0) / 6).toFixed(1).replace('.', ',');
        body += `<rect x="470" y="${60 + index * 30}" width="12" height="12" rx="3" fill="${PAL[[0, 2, 1][index]]}"></rect>${tx(490, 71 + index * 30, name, { a: 'start', fs: 13, fw: 600, fill: TXT })}${tx(640, 71 + index * 30, score, { a: 'end', fs: 13, ff: 'var(--td-font-mono)', fw: 700, fill: TXT })}`;
    });
    const current = hov == null ? null : suppliers[Number(hov)];
    const read = current ? `${current[0]} · ${axes.map((axis, index) => `${axis} ${String(current[1][index]).replace('.', ',')}`).join(' · ')}` : 'Pasa el mouse sobre el gráfico';
    return frame('Evaluación de proveedores · frenos', 'puntaje 0–10', body, 660, 380, 'Radar de proveedores', read, [
        'Volvo Parts lidera en calidad y garantía',
        'Bosch tiene el mejor plazo y stock',
        'Genérico: más barato pero débil en garantía y soporte'
    ]);
}

function sankey(hov: string | null): string {
    const sources = ['Quilicura', 'Concepción', 'Antofagasta'];
    const dests = ['Metropolitana', 'Centro', 'Sur', 'Norte'];
    const flow = [[320, 120, 40, 40], [30, 60, 150, 20], [20, 10, 10, 170]];
    const width = 760;
    const height = 380;
    const total = flow.flat().reduce((a, b) => a + b, 0);
    const gap = 14;
    const scale = (height - 20 - gap * 3) / total;
    const node = 16;
    const x0 = 150;
    const x1 = width - 170;
    const sourceTotals = sources.map((_, index) => flow[index].reduce((a, b) => a + b, 0));
    const destTotals = dests.map((_, index) => flow.reduce((a, row) => a + row[index], 0));
    const sourceY: number[] = [];
    let y = 10;
    sourceTotals.forEach((value) => { sourceY.push(y); y += value * scale + gap; });
    const destY: number[] = [];
    y = 10;
    destTotals.forEach((value) => { destY.push(y); y += value * scale + gap; });
    const sourceOff = sourceY.slice();
    const destOff = destY.slice();
    let body = '';
    flow.forEach((row, i) => row.forEach((value, j) => {
        const h = value * scale;
        const ya = sourceOff[i] + h / 2;
        const yb = destOff[j] + h / 2;
        const mid = (x0 + node + x1) / 2;
        const key = `${i}-${j}`;
        const opacity = hov == null ? 0.35 : hov === key ? 0.7 : 0.1;
        body += `<path data-ch-hov="${key}" d="M${x0 + node},${ya} C${mid},${ya} ${mid},${yb} ${x1},${yb}" fill="none" stroke="${PAL[[0, 2, 3][i]]}" stroke-width="${Math.max(1, h)}" stroke-opacity="${opacity}"></path>`;
        sourceOff[i] += h;
        destOff[j] += h;
    }));
    sources.forEach((name, index) => {
        body += `<rect x="${x0}" y="${sourceY[index]}" width="${node}" height="${sourceTotals[index] * scale}" rx="2" fill="${PAL[[0, 2, 3][index]]}"></rect>`;
        body += tx(x0 - 10, sourceY[index] + sourceTotals[index] * scale / 2, name, { a: 'end', fs: 13, fw: 700, fill: TXT });
        body += tx(x0 - 10, sourceY[index] + sourceTotals[index] * scale / 2 + 16, `${sourceTotals[index]} pedidos`, { a: 'end', fs: 11, ff: 'var(--td-font-mono)' });
    });
    dests.forEach((name, index) => {
        body += `<rect x="${x1}" y="${destY[index]}" width="${node}" height="${destTotals[index] * scale}" rx="2" fill="${TXT}"></rect>`;
        body += tx(x1 + node + 10, destY[index] + destTotals[index] * scale / 2, name, { a: 'start', fs: 13, fw: 700, fill: TXT });
        body += tx(x1 + node + 10, destY[index] + destTotals[index] * scale / 2 + 16, `${destTotals[index]} pedidos`, { a: 'start', fs: 11, ff: 'var(--td-font-mono)' });
    });
    let read = 'Pasa el mouse sobre el gráfico';
    if (hov?.includes('-') && sources[Number(hov.split('-')[0])]) {
        const [i, j] = hov.split('-').map(Number);
        const value = flow[i][j];
        read = `${sources[i]} → ${dests[j]} · ${value} pedidos · ${Math.round(value / sourceTotals[i] * 100)}% de ${sources[i]} · ${Math.round(value / destTotals[j] * 100)}% de lo recibido en ${dests[j]}`;
    }
    return frame('Flujo de despachos · bodega → región · septiembre', 'pedidos', body, width, height, 'Sankey de despachos', read, [
        'Quilicura abastece el 86% de la Región Metropolitana',
        'Concepción cubre el 75% del Sur',
        '40 pedidos cruzan de Quilicura al Norte: evaluar stock en Antofagasta'
    ]);
}

function bullet(hov: string | null): string {
    const kpis: [string, string, number, number, number[]][] = [['Ventas', 'M CLP', 84, 90, [60, 80, 100]], ['Pedidos', 'miles', 1.28, 1.2, [0.8, 1.1, 1.5]], ['OTIF', '%', 92, 95, [80, 90, 100]], ['Margen', '%', 33, 35, [25, 32, 40]], ['NPS', 'pts', 48, 55, [30, 50, 70]]];
    const width = 760;
    const rowH = 58;
    const left = 150;
    let body = '';
    kpis.forEach(([name, unit, value, target, bands], index) => {
        const y = 10 + index * rowH;
        const plot = width - left - 70;
        const max = bands[2];
        const x = (n: number) => left + n / max * plot;
        [...bands].reverse().forEach((band, bandIndex) => {
            body += `<rect x="${left}" y="${y}" width="${x(band) - left}" height="30" fill="color-mix(in srgb, var(--td-color-text) ${[10, 18, 28][bandIndex]}%, var(--td-color-surface))"></rect>`;
        });
        const ok = value >= target;
        const key = String(index);
        body += `<rect data-ch-hov="${key}" x="${left}" y="${y + 10}" width="${x(value) - left}" height="10" fill="${ok ? OK : 'var(--td-color-primary)'}" opacity="${dim(hov, key)}"></rect>`;
        body += `<line x1="${x(target)}" x2="${x(target)}" y1="${y + 3}" y2="${y + 27}" stroke="${TXT}" stroke-width="3"></line>`;
        body += tx(left - 12, y + 14, name, { a: 'end', fs: 13.5, fw: 700, fill: TXT });
        body += tx(left - 12, y + 29, unit, { a: 'end', fs: 11, ff: 'var(--td-font-mono)' });
        body += tx(width - 60, y + 20, String(value).replace('.', ','), { a: 'start', fs: 14, fw: 800, fill: ok ? OK : TXT, ff: 'var(--td-font-display)' });
    });
    const current = hov == null ? null : kpis[Number(hov)];
    const read = current ? `${current[0]} · ${String(current[2]).replace('.', ',')} ${current[1]} · meta ${String(current[3]).replace('.', ',')} · ${current[2] >= current[3] ? 'cumple (+' : 'falta ('}${Math.round((current[2] / current[3] - 1) * 1000) / 10}%)` : 'Pasa el mouse sobre el gráfico';
    return frame('KPIs del mes contra meta', 'barra = actual · marca = meta · bandas = malo / aceptable / bueno', body, width, 10 + kpis.length * rowH, 'Bullet chart de KPIs', read, [
        'Cumplen meta: Pedidos',
        'Más lejos de la meta: NPS (−13%)',
        'Cinco indicadores en el espacio de un gráfico'
    ]);
}

function gantt(hov: string | null): string {
    const days = ['Lun 22', 'Mar 23', 'Mié 24', 'Jue 25', 'Vie 26', 'Sáb 27'];
    const tasks: [string, number, number, number, number][] = [['Picking OC-00498', 0, 1.5, 100, 0], ['Carga camión CBTR-45', 1, 0.5, 100, 1], ['Ruta Norte · Antofagasta', 1.5, 2.5, 55, 2], ['Picking OC-00503/504', 2, 1, 40, 0], ['Ruta Sur · Concepción', 2.5, 2, 10, 2], ['Inventario cíclico A', 3, 2, 0, 3], ['Entrega Minera Los Robles', 4, 1, 0, 2]];
    const width = 780;
    const left = 210;
    const rowH = 38;
    const top = 30;
    const dayW = (width - left - 10) / days.length;
    const today = 2.45;
    const height = top + tasks.length * rowH + 6;
    let body = '';
    days.forEach((day, index) => {
        body += `<rect x="${left + index * dayW}" y="${top}" width="${dayW}" height="${tasks.length * rowH}" fill="${index % 2 ? 'transparent' : 'var(--td-color-surface-secondary)'}"></rect>`;
        body += tx(left + index * dayW + dayW / 2, 18, day, { fs: 12, fw: 600, fill: index === 2 ? 'var(--td-color-primary)' : MUT });
    });
    tasks.forEach(([name, start, duration, progress, color], index) => {
        const y = top + index * rowH + 8;
        const x = left + start * dayW;
        const w = duration * dayW;
        const fill = PAL[[0, 1, 2, 3][color]];
        const key = String(index);
        body += tx(left - 12, y + 16, name, { a: 'end', fs: 12.5, fw: 600, fill: TXT });
        body += `<rect data-ch-hov="${key}" x="${x}" y="${y}" width="${w}" height="22" rx="4" fill="${fill}" fill-opacity="0.22" stroke="${fill}" opacity="${dim(hov, key)}"></rect>`;
        body += `<rect x="${x}" y="${y}" width="${w * progress / 100}" height="22" rx="4" fill="${fill}" pointer-events="none"></rect>`;
        body += tx(x + w + 6, y + 15, `${progress}%`, { a: 'start', fs: 11, ff: 'var(--td-font-mono)', fill: TXT });
    });
    body += `<line x1="${left + today * dayW}" x2="${left + today * dayW}" y1="${top - 4}" y2="${height}" stroke="var(--td-color-primary)" stroke-width="2"></line>${tx(left + today * dayW, height + 14, 'Hoy', { fs: 11, fw: 700, fill: 'var(--td-color-primary)' })}`;
    let read = 'Pasa el mouse sobre el gráfico';
    if (hov != null && tasks[Number(hov)]) {
        const [name, start, duration, progress] = tasks[Number(hov)];
        const label = (value: number) => `${days[Math.floor(value)]} ${value % 1 ? '14:00' : '08:00'}`;
        read = `${name} · ${label(start)} → ${label(Math.min(start + duration, 5.99))} · ${duration * 24 >= 24 ? `${String(duration).replace('.', ',')} días` : `${duration * 24} h`} · avance ${progress}%`;
    }
    return frame('Programación de despachos · semana 39', 'barra = duración · relleno = avance', body, width, height + 20, 'Gantt de despachos', read, [
        '2 tareas completadas, 3 en curso',
        'Ruta Sur va atrasada respecto a hoy (10%)',
        'Viernes: entrega crítica a Minera Los Robles'
    ]);
}

function forecast(hov: string | null): string {
    const months = ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const actual = [61, 64, 70, 60, 62, 64, 66, 71, 72, 76, 80, 84];
    const future = [86, 89, 95];
    const budget = [60, 62, 66, 62, 63, 65, 68, 70, 73, 75, 78, 80, 83, 86, 90];
    const width = 780;
    const height = 340;
    const left = 44;
    const top = 14;
    const bottom = 32;
    const plotW = width - left - 16;
    const plotH = height - top - bottom;
    const count = months.length;
    const x = (index: number) => left + index * plotW / (count - 1);
    const min = 40;
    const max = 120;
    const y = (value: number) => top + plotH - (value - min) / (max - min) * plotH;
    const last = actual.length - 1;
    let body = '';
    for (let tick = min; tick <= max; tick += 20) {
        body += `<line x1="${left}" x2="${width - 16}" y1="${y(tick)}" y2="${y(tick)}" stroke="${GRID}" stroke-dasharray="3 4"></line>${tx(left - 8, y(tick) + 4, String(tick), { a: 'end', ff: 'var(--td-font-mono)', fs: 11 })}`;
    }
    const band = (k: number) => {
        const up = [[x(last), y(actual[last])], ...future.map((value, index) => [x(last + 1 + index), y(value + (index + 1) * k)])];
        const down = [...future.map((value, index) => [x(last + 1 + index), y(value - (index + 1) * k)])].reverse();
        return `M${up.map((p) => p.join(',')).join(' L')} L${down.map((p) => p.join(',')).join(' L')} L${x(last)},${y(actual[last])} Z`;
    };
    body += `<rect x="${x(last)}" y="${top}" width="${x(count - 1) - x(last)}" height="${plotH}" fill="var(--td-color-surface-secondary)"></rect>${tx((x(last) + x(count - 1)) / 2, top + 14, 'Pronóstico', { fs: 11, fw: 700 })}`;
    body += `<path d="${band(3.2 * 1.96)}" fill="var(--td-color-primary)" fill-opacity="0.1"></path><path d="${band(3.2 * 1.28)}" fill="var(--td-color-primary)" fill-opacity="0.18"></path>`;
    body += `<path d="${budget.map((value, index) => `${index ? 'L' : 'M'}${x(index)},${y(value)}`).join(' ')}" fill="none" stroke="${MUT}" stroke-width="2" stroke-dasharray="6 5"></path>`;
    body += `<path d="${actual.map((value, index) => `${index ? 'L' : 'M'}${x(index)},${y(value)}`).join(' ')}" fill="none" stroke="${TXT}" stroke-width="2.75"></path>`;
    body += `<path d="M${x(last)},${y(actual[last])}${future.map((value, index) => ` L${x(last + 1 + index)},${y(value)}`).join('')}" fill="none" stroke="var(--td-color-primary)" stroke-width="2.75" stroke-dasharray="2 5" stroke-linecap="round"></path>`;
    months.forEach((month, index) => {
        const isFuture = index > last;
        const value = isFuture ? future[index - last - 1] : actual[index];
        body += tx(x(index), height - 10, month, { fs: 11 });
        body += `<circle cx="${x(index)}" cy="${y(value)}" r="${hov === String(index) ? 6 : 3.5}" fill="${isFuture ? 'var(--td-color-primary)' : TXT}"></circle>`;
        body += `<rect data-ch-hov="${index}" x="${x(index) - plotW / (count - 1) / 2}" y="${top}" width="${plotW / (count - 1)}" height="${plotH}" fill="transparent"></rect>`;
    });
    let read = 'Pasa el mouse sobre el gráfico';
    if (hov != null) {
        const index = Number(hov);
        const isFuture = index > last;
        const value = isFuture ? future[index - last - 1] : actual[index];
        const spread = 1.96 * 3.2 * (index - last);
        read = `${months[index]} · ${isFuture ? `pronóstico ${fm(value)} (95 %: ${fm(value - spread)}–${fm(value + spread)})` : `real ${fm(value)}`} · presupuesto ${fm(budget[index])} · brecha ${value >= budget[index] ? '+' : ''}${fm(value - budget[index])}`;
    }
    return frame('Ventas mensuales · real, pronóstico y presupuesto', 'millones CLP · bandas 80 % y 95 %', body, width, height, 'Pronóstico de ventas', read, [
        `Cierre de año proyectado: ${fm(future.reduce((a, b) => a + b, 0))} en el trimestre`,
        `Diciembre supera el presupuesto en ${fm(95 - 90)}`,
        `Riesgo bajo: el peor escenario al 95 % sigue sobre ${fm(Math.round(95 - 1.96 * 3.2 * 3))}`
    ]);
}

function variance(hov: string | null): string {
    const rows = [['Repuestos frenos', 42.1, 38], ['Repuestos motor', 29.4, 31], ['Servicio técnico', 12.8, 10.5], ['E-commerce', 9.6, 12], ['Logística', -8.9, -7.5], ['Marketing', -3.1, -3.4], ['Personal', -18.2, -17.6], ['Arriendo bodegas', -6.0, -6.0]]
        .map(([name, real, budget]) => ({ name: String(name), real: Number(real), budget: Number(budget), delta: Number(real) - Number(budget) }))
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    const width = 780;
    const rowH = 36;
    const left = 200;
    const center = 480;
    const scale = 60;
    const height = 20 + rows.length * rowH + 40;
    let body = `<line x1="${center}" x2="${center}" y1="8" y2="${height - 30}" stroke="${TXT}"></line>${tx(center - 120, 14, '← Bajo presupuesto', { fs: 11, fw: 600, fill: BAD })}${tx(center + 120, 14, 'Sobre presupuesto →', { fs: 11, fw: 600, fill: OK })}`;
    rows.forEach((item, index) => {
        const y = 24 + index * rowH;
        const w = Math.abs(item.delta) * scale;
        const good = item.delta >= 0;
        const key = String(index);
        body += tx(left - 12, y + 16, item.name, { a: 'end', fs: 13, fw: 600, fill: TXT });
        body += tx(left - 12, y + 30, `real ${fm(item.real)} · ppto ${fm(item.budget)}`, { a: 'end', fs: 10.5, ff: 'var(--td-font-mono)' });
        body += `<rect data-ch-hov="${key}" x="${good ? center : center - w}" y="${y + 4}" width="${Math.max(2, w)}" height="22" rx="3" fill="${good ? OK : BAD}" opacity="${dim(hov, key)}"></rect>`;
        body += tx(good ? center + w + 6 : center - w - 6, y + 19, `${good ? '+' : '−'}${Math.abs(item.delta).toFixed(1).replace('.', ',')}`, { a: good ? 'start' : 'end', fs: 12, ff: 'var(--td-font-mono)', fw: 700, fill: TXT });
    });
    const total = rows.reduce((sum, item) => sum + item.delta, 0);
    body += `<line x1="${left - 180}" x2="${width - 10}" y1="${height - 34}" y2="${height - 34}" stroke="${GRID}"></line>`;
    body += tx(left - 12, height - 12, 'Resultado neto vs presupuesto', { a: 'end', fs: 13, fw: 800, fill: TXT });
    body += tx(center + (total >= 0 ? 8 : -8), height - 12, `${total >= 0 ? '+' : '−'}${fm(Math.abs(total))}`, { a: total >= 0 ? 'start' : 'end', fs: 14, fw: 800, fill: total >= 0 ? OK : BAD, ff: 'var(--td-font-display)' });
    const current = hov == null ? null : rows[Number(hov)];
    const read = current ? `${current.name} · real ${fm(current.real)} · presupuesto ${fm(current.budget)} · desviación ${current.delta >= 0 ? '+' : '−'}${fm(Math.abs(current.delta))} (${Math.round(current.delta / Math.abs(current.budget) * 100)}%)` : 'Pasa el mouse sobre el gráfico';
    return frame('Resultado por área · real vs presupuesto · septiembre', 'desviación en millones CLP, ordenada por impacto', body, width, height, 'Varianza contra presupuesto', read, [
        `Frenos explica la mayor parte del sobrecumplimiento (+${fm(4.1)})`,
        'E-commerce 20% bajo lo presupuestado: revisar campañas',
        `Logística se excede en ${fm(1.4)} por fletes al Norte`
    ]);
}

function quadrant(hov: string | null): string {
    const data: [string, number, number, number][] = [['Pastillas', 18, 38, 34], ['Filtros', 6, 42, 28], ['Discos', 12, 31, 22], ['Turbo', 24, 27, 16], ['Amortiguadores', 9, 22, 18], ['Embragues', -4, 35, 13], ['Alternadores', 15, 18, 11], ['Iluminación', 31, 24, 7], ['Correas', -8, 16, 5], ['Bujes', -2, 12, 4], ['Sensores', 38, 44, 6]];
    const width = 780;
    const height = 400;
    const left = 50;
    const top = 16;
    const bottom = 40;
    const plotW = width - left - 20;
    const plotH = height - top - bottom;
    const x = (value: number) => left + (value + 15) / 60 * plotW;
    const y = (value: number) => top + plotH - (value - 5) / 45 * plotH;
    const qx = x(10);
    const qy = y(30);
    const zones: [number, number, number, number, string, string][] = [
        [left, top, qx - left, qy - top, 'Mantener', 'Rentable, crece poco'],
        [qx, top, width - 20 - qx, qy - top, 'Invertir', 'Crece y es rentable'],
        [left, qy, qx - left, top + plotH - qy, 'Revisar / salir', 'Poco margen, sin crecimiento'],
        [qx, qy, width - 20 - qx, top + plotH - qy, 'Mejorar margen', 'Crece con margen bajo']
    ];
    let body = '';
    zones.forEach(([zx, zy, w, h, ,], index) => {
        const fill = index === 1 ? 'color-mix(in srgb, var(--td-color-success) 7%, transparent)' : index === 2 ? 'color-mix(in srgb, var(--td-color-danger) 6%, transparent)' : 'transparent';
        body += `<rect x="${zx}" y="${zy}" width="${w}" height="${h}" fill="${fill}"></rect>`;
    });
    body += `<line x1="${qx}" x2="${qx}" y1="${top}" y2="${top + plotH}" stroke="var(--td-color-border-strong)" stroke-dasharray="5 4"></line><line x1="${left}" x2="${width - 20}" y1="${qy}" y2="${qy}" stroke="var(--td-color-border-strong)" stroke-dasharray="5 4"></line>`;
    [-10, 0, 10, 20, 30, 40].forEach((tick) => { body += tx(x(tick), top + plotH + 18, `${tick}%`, { ff: 'var(--td-font-mono)', fs: 11 }); });
    [10, 20, 30, 40, 50].forEach((tick) => { body += tx(left - 8, y(tick) + 4, `${tick}%`, { a: 'end', ff: 'var(--td-font-mono)', fs: 11 }); });
    body += tx(left + plotW, height - 4, 'Crecimiento anual →', { a: 'end', fs: 11 }) + tx(left + 4, top + 4, '↑ Margen', { a: 'start', fs: 11 });
    data.forEach(([name, growth, margin, sale], index) => {
        const zone = growth >= 10 && margin >= 30 ? 3 : growth < 10 && margin >= 30 ? 1 : growth >= 10 ? 2 : 0;
        const color = [BAD, TXT, 'var(--td-color-info)', OK][zone];
        const key = String(index);
        body += `<circle data-ch-hov="${key}" cx="${x(growth)}" cy="${y(margin)}" r="${6 + Math.sqrt(sale) * 3.2}" fill="${color}" fill-opacity="0.28" stroke="${color}" stroke-width="2" opacity="${dim(hov, key)}"></circle>`;
        body += tx(x(growth), y(margin) + 4, name, { fs: 11, fw: 700, fill: TXT });
    });
    zones.forEach(([zx, zy, w, h, title, detail], index) => {
        const topZone = index < 2;
        const ax = index % 2 ? zx + w - 10 : zx + 10;
        const anchor = index % 2 ? 'end' : 'start';
        body += tx(ax, topZone ? zy + 18 : zy + h - 22, title, { a: anchor, fs: 13, fw: 800, fill: TXT });
        body += tx(ax, topZone ? zy + 33 : zy + h - 8, detail, { a: anchor, fs: 11 });
    });
    const current = hov == null ? null : data[Number(hov)];
    const read = current ? `${current[0]} · crecimiento ${current[1]}% · margen ${current[2]}% · venta ${fm(current[3])} · ${current[1] >= 10 && current[2] >= 30 ? 'Invertir' : current[1] < 10 && current[2] >= 30 ? 'Mantener' : current[1] >= 10 ? 'Mejorar margen' : 'Revisar / salir'}` : 'Pasa el mouse sobre el gráfico';
    return frame('Portafolio de familias · crecimiento vs margen', 'tamaño = venta anual', body, width, height, 'Matriz de portafolio', read, [
        'Invertir: Pastillas, Sensores y Discos',
        'Turbo e Iluminación crecen con margen bajo: renegociar costos',
        'Correas y Bujes: candidatos a salir o vender bajo pedido'
    ]);
}

function cohort(hov: string | null): string {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];
    const clients = [42, 38, 51, 47, 55, 49, 60, 58, 64];
    const base = [100, 78, 69, 63, 60, 57, 55, 54, 53];
    const width = 780;
    const left = 120;
    const top = 40;
    const cell = (width - left - 10) / 9;
    const rowH = 34;
    const height = top + months.length * rowH + 10;
    let body = '';
    for (let column = 0; column < 9; column += 1) {
        body += tx(left + column * cell + cell / 2, top - 12, `Mes ${column}`, { fs: 11, fw: 600 });
    }
    months.forEach((month, row) => {
        body += tx(left - 12, top + row * rowH + 15, `${month} 2026`, { a: 'end', fs: 12.5, fw: 700, fill: TXT });
        body += tx(left - 12, top + row * rowH + 28, `${clients[row]} clientes`, { a: 'end', fs: 10.5, ff: 'var(--td-font-mono)' });
        for (let column = 0; column < 9 - row; column += 1) {
            const value = column ? Math.max(30, Math.round(base[column] + row * 1.6 + ((row * 3 + column) % 4) - 1.5)) : 100;
            const tone = (value - 30) / 70;
            const key = `${row}-${column}`;
            body += `<rect data-ch-hov="${key}" x="${left + column * cell + 2}" y="${top + row * rowH + 2}" width="${cell - 4}" height="${rowH - 4}" rx="3" fill="color-mix(in srgb, var(--td-color-primary) ${Math.round(8 + tone * 88)}%, var(--td-color-surface))" stroke="${hov === key ? TXT : 'none'}" stroke-width="2"></rect>`;
            body += tx(left + column * cell + cell / 2, top + row * rowH + rowH / 2 + 4, `${value}%`, { fs: 11.5, ff: 'var(--td-font-mono)', fw: 600, fill: tone > 0.55 ? '#fff' : TXT });
        }
    });
    let read = 'Pasa el mouse sobre el gráfico';
    if (hov?.includes('-')) {
        const [row, column] = hov.split('-').map(Number);
        read = `Cohorte ${months[row]} · mes ${column} · ${column ? `retención aprox. ${Math.round(base[column] + row * 1.6)}%` : '100% (alta)'} · ${clients[row]} clientes iniciales`;
    }
    return frame('Retención de clientes por cohorte de alta', '% de clientes que vuelve a comprar cada mes', body, width, height, 'Cohortes de retención', read, [
        'La mayor caída ocurre en el primer mes (−22 pp)',
        'Las cohortes recientes retienen mejor: el onboarding de flota funciona',
        'Retención estable en torno al 53% desde el mes 6'
    ]);
}

function mekko(hov: string | null): string {
    const regions: [string, number[]][] = [['Metropolitana', [42, 28, 16, 14]], ['Centro', [35, 30, 20, 15]], ['Sur', [30, 26, 26, 18]], ['Norte', [48, 24, 12, 16]]];
    const cats = ['Frenos', 'Motor', 'Suspensión', 'Otros'];
    const totals = [410, 180, 150, 140];
    const all = totals.reduce((a, b) => a + b, 0);
    const width = 780;
    const height = 360;
    const left = 40;
    const top = 10;
    const plotW = width - left - 110;
    const plotH = height - top - 40;
    let x = left;
    let body = '';
    regions.forEach(([, mix], index) => {
        const w = plotW * totals[index] / all;
        let y = top;
        mix.forEach((percent, cat) => {
            const h = plotH * percent / 100;
            const key = `${index}-${cat}`;
            body += `<rect data-ch-hov="${key}" x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" fill="${PAL[cat]}" fill-opacity="0.9" opacity="${dim(hov, key)}"></rect>`;
            if (h > 22 && w > 60) {
                body += tx(x + w / 2, y + h / 2 + 4, `${percent}%`, { fs: 12, fw: 700, ff: 'var(--td-font-mono)', fill: cat <= 1 ? '#fff' : '#0A0B0C' });
            }
            y += h;
        });
        body += tx(x + w / 2, height - 22, regions[index][0], { fs: 12, fw: 700, fill: TXT });
        body += tx(x + w / 2, height - 8, `${fm(totals[index])} · ${Math.round(totals[index] / all * 100)}%`, { fs: 10.5, ff: 'var(--td-font-mono)' });
        x += w;
    });
    [0, 25, 50, 75, 100].forEach((tick) => {
        body += tx(left - 6, top + plotH - tick / 100 * plotH + 4, `${tick}%`, { a: 'end', fs: 10.5, ff: 'var(--td-font-mono)' });
    });
    cats.forEach((cat, index) => {
        body += `<rect x="${width - 100}" y="${20 + index * 24}" width="12" height="12" rx="3" fill="${PAL[index]}"></rect>${tx(width - 82, 31 + index * 24, cat, { a: 'start', fs: 12.5, fw: 600, fill: TXT })}`;
    });
    let read = 'Pasa el mouse sobre el gráfico';
    if (hov?.includes('-')) {
        const [region, cat] = hov.split('-').map(Number);
        const percent = regions[region][1][cat];
        read = `${regions[region][0]} › ${cats[cat]} · ${percent}% de la región · ${fm(totals[region] * percent / 100)} · ${Math.round(totals[region] * percent / all)}% del total país`;
    }
    return frame('Mezcla de venta · región × categoría', 'ancho = venta de la región · alto = % por categoría', body, width, height, 'Marimekko', read, [
        'Metropolitana es el 47% de la venta',
        'El Norte depende de Frenos (48%): minería',
        'El Sur tiene la mezcla más equilibrada'
    ]);
}

function slope(hov: string | null): string {
    const data: [string, number, number][] = [['Quilicura', 214, 262], ['Concepción', 118, 131], ['Antofagasta', 96, 128], ['Puerto Montt', 71, 69], ['Temuco', 52, 74], ['La Serena', 64, 58], ['Rancagua', 40, 55]];
    const width = 700;
    const height = 400;
    const xa = 200;
    const xb = 500;
    const min = 30;
    const max = 280;
    const y = (value: number) => 20 + (max - value) / (max - min) * (height - 40);
    const rank = (column: 1 | 2) => data.map((row, index) => [index, row[column]] as [number, number]).sort((a, b) => b[1] - a[1]).map((row) => row[0]);
    const rankA = rank(1);
    const rankB = rank(2);
    const relax = (values: number[]) => {
        const sorted = values.map((value, index) => ({ y: value, index })).sort((a, b) => a.y - b.y);
        for (let pass = 0; pass < 30; pass += 1) {
            for (let index = 1; index < sorted.length; index += 1) {
                const gap = sorted[index].y - sorted[index - 1].y;
                if (gap < 15) {
                    const shift = (15 - gap) / 2;
                    sorted[index].y += shift;
                    sorted[index - 1].y -= shift;
                }
            }
        }
        const out: number[] = [];
        sorted.forEach((item) => { out[item.index] = item.y; });
        return out;
    };
    const leftLabels = relax(data.map((row) => y(row[1])));
    const rightLabels = relax(data.map((row) => y(row[2])));
    let body = `${tx(xa, 14, '2025', { fs: 13, fw: 800, fill: TXT })}${tx(xb, 14, '2026', { fs: 13, fw: 800, fill: TXT })}<line x1="${xa}" x2="${xa}" y1="22" y2="${height - 10}" stroke="${GRID}"></line><line x1="${xb}" x2="${xb}" y1="22" y2="${height - 10}" stroke="${GRID}"></line>`;
    data.forEach(([name, before, after], index) => {
        const up = after >= before;
        const color = up ? OK : BAD;
        const big = Math.abs(after / before - 1) > 0.2;
        const key = String(index);
        body += `<line data-ch-hov="${key}" x1="${xa}" y1="${y(before)}" x2="${xb}" y2="${y(after)}" stroke="${big || hov === key ? color : 'var(--td-color-border-strong)'}" stroke-width="${hov === key ? 4 : big ? 3 : 2}"></line>`;
        body += `<circle cx="${xa}" cy="${y(before)}" r="5" fill="${TXT}"></circle><circle cx="${xb}" cy="${y(after)}" r="5" fill="${color}"></circle>`;
        body += `<line x1="${xa - 6}" y1="${y(before)}" x2="${xa - 12}" y2="${leftLabels[index]}" stroke="${GRID}"></line><line x1="${xb + 6}" y1="${y(after)}" x2="${xb + 12}" y2="${rightLabels[index]}" stroke="${GRID}"></line>`;
        body += tx(xa - 14, leftLabels[index] + 4, `#${rankA.indexOf(index) + 1} ${name}  ${before}`, { a: 'end', fs: 12, fw: 600, fill: TXT });
        body += tx(xb + 14, rightLabels[index] + 4, `${after}  ${name} #${rankB.indexOf(index) + 1}  ${up ? '+' : ''}${Math.round((after / before - 1) * 100)}%`, { a: 'start', fs: 12, fw: 600, fill: TXT });
    });
    const current = hov == null ? null : data[Number(hov)];
    const read = current ? `${current[0]} · ${fm(current[1])} → ${fm(current[2])} · ${current[2] >= current[1] ? '+' : ''}${Math.round((current[2] / current[1] - 1) * 100)}% · posición #${rankA.indexOf(Number(hov)) + 1} → #${rankB.indexOf(Number(hov)) + 1}` : 'Pasa el mouse sobre el gráfico';
    return frame('Venta por sucursal · 2025 vs 2026 (ene–sep)', 'millones CLP · # = posición', body, width, height, 'Slope chart', read, [
        'Antofagasta sube al #3 con +33%',
        'Temuco es la de mayor crecimiento (+42%)',
        'La Serena y Puerto Montt caen: revisar cobertura comercial'
    ]);
}

function dumbbell(hov: string | null): string {
    const data: [string, number, number][] = [['Metropolitana', 1.9, 1.1], ['Valparaíso', 2.6, 1.6], ['O’Higgins', 2.8, 1.9], ['Biobío', 3.4, 2.1], ['Araucanía', 4.1, 2.6], ['Los Lagos', 4.8, 3.3], ['Antofagasta', 5.2, 2.9], ['Atacama', 4.6, 3.8]];
    const width = 760;
    const rowH = 38;
    const left = 170;
    const plot = width - left - 70;
    const max = 6;
    const x = (day: number) => left + day / max * plot;
    const height = 30 + data.length * rowH + 40;
    let body = '';
    for (let tick = 0; tick <= max; tick += 1) {
        body += `<line x1="${x(tick)}" x2="${x(tick)}" y1="20" y2="${height - 40}" stroke="${GRID}" stroke-dasharray="${tick ? '3 4' : ''}"></line>${tx(x(tick), height - 24, `${tick} d`, { fs: 11, ff: 'var(--td-font-mono)' })}`;
    }
    body += `<line x1="${x(2)}" x2="${x(2)}" y1="14" y2="${height - 40}" stroke="var(--td-color-warning)" stroke-width="2" stroke-dasharray="5 4"></line>${tx(x(2) + 4, 12, 'SLA 2 días', { a: 'start', fs: 11, fw: 700, fill: 'var(--td-color-warning)' })}`;
    data.forEach(([name, before, after], index) => {
        const y = 34 + index * rowH;
        const key = String(index);
        body += tx(left - 12, y + 4, name, { a: 'end', fs: 13, fw: 600, fill: TXT });
        body += `<line data-ch-hov="${key}" x1="${x(after)}" x2="${x(before)}" y1="${y}" y2="${y}" stroke="${hov === key ? TXT : 'var(--td-color-border-strong)'}" stroke-width="4"></line>`;
        body += `<circle cx="${x(before)}" cy="${y}" r="7" fill="#9CA3AB"></circle><circle cx="${x(after)}" cy="${y}" r="7" fill="${after <= 2 ? OK : 'var(--td-color-primary)'}"></circle>`;
        body += tx(x(before) + 12, y + 4, `−${Math.round((1 - after / before) * 100)}%`, { a: 'start', fs: 11.5, ff: 'var(--td-font-mono)', fw: 700, fill: TXT });
    });
    body += `<circle cx="${width - 230}" cy="${height - 6}" r="5" fill="#9CA3AB"></circle>${tx(width - 220, height - 2, 'Antes (2025)', { a: 'start', fs: 11 })}`;
    body += `<circle cx="${width - 120}" cy="${height - 6}" r="5" fill="var(--td-color-primary)"></circle>${tx(width - 110, height - 2, 'Después (2026)', { a: 'start', fs: 11 })}`;
    const current = hov == null ? null : data[Number(hov)];
    const read = current ? `${current[0]} · ${String(current[1]).replace('.', ',')} → ${String(current[2]).replace('.', ',')} días · mejora ${Math.round((1 - current[2] / current[1]) * 100)}% · ${current[2] <= 2 ? 'cumple SLA' : `fuera de SLA por ${String(Math.round((current[2] - 2) * 10) / 10).replace('.', ',')} d`}` : 'Pasa el mouse sobre el gráfico';
    return frame('Tiempo de entrega por región · antes y después del plan', 'días promedio', body, width, height, 'Dumbbell de tiempos de entrega', read, [
        'Mejora promedio del 38%',
        'Antofagasta: la mayor mejora (−44%) tras abrir bodega',
        'Atacama y Los Lagos siguen fuera del SLA'
    ]);
}

function control(hov: string | null, series: number[]): string {
    const mean = series.reduce((a, b) => a + b, 0) / series.length;
    const sd = Math.sqrt(series.reduce((a, b) => a + (b - mean) ** 2, 0) / series.length);
    const ucl = mean + 3 * sd;
    const lcl = Math.max(0, mean - 3 * sd);
    const width = 780;
    const height = 320;
    const left = 46;
    const top = 14;
    const bottom = 30;
    const plotW = width - left - 104;
    const plotH = height - top - bottom;
    const min = 5;
    const max = 40;
    const x = (index: number) => left + index * plotW / (series.length - 1);
    const y = (value: number) => top + plotH - (value - min) / (max - min) * plotH;
    let body = `<rect x="${left}" y="${y(ucl)}" width="${plotW}" height="${y(lcl) - y(ucl)}" fill="color-mix(in srgb, var(--td-color-success) 6%, transparent)"></rect>`;
    [[ucl, 'LCS', BAD, 0], [mean, 'Media', TXT, 1], [lcl, 'LCI', BAD, 2]].forEach(([value, label, color, index]) => {
        body += `<line x1="${left}" x2="${left + plotW}" y1="${y(Number(value))}" y2="${y(Number(value))}" stroke="${color}" stroke-width="${index === 1 ? 2 : 1.5}" stroke-dasharray="${index === 1 ? '' : '6 4'}"></line>`;
        body += tx(left + plotW + 6, y(Number(value)) + 4, `${label} ${Number(value).toFixed(1).replace('.', ',')}`, { a: 'start', fs: 11, ff: 'var(--td-font-mono)', fw: 700, fill: String(color) });
    });
    [10, 20, 30, 40].forEach((tick) => { body += tx(left - 8, y(tick) + 4, `${tick} h`, { a: 'end', fs: 11, ff: 'var(--td-font-mono)' }); });
    body += `<path d="${series.map((value, index) => `${index ? 'L' : 'M'}${x(index)},${y(value)}`).join(' ')}" fill="none" stroke="${TXT}" stroke-width="2"></path>`;
    let run = 0;
    const trend = series.map((value) => { run = value > mean ? run + 1 : 0; return run >= 6; });
    series.forEach((value, index) => {
        const out = value > ucl || value < lcl;
        const key = String(index);
        const color = out ? BAD : trend[index] ? 'var(--td-color-warning)' : TXT;
        body += `<circle data-ch-hov="${key}" cx="${x(index)}" cy="${y(value)}" r="${hov === key ? 7 : out ? 6 : 4}" fill="${out ? BAD : trend[index] ? 'var(--td-color-warning)' : 'var(--td-color-surface)'}" stroke="${color}" stroke-width="2"></circle>`;
        if (index % 5 === 0) {
            body += tx(x(index), height - 8, `${index + 1} sep`, { fs: 10.5, ff: 'var(--td-font-mono)' });
        }
    });
    let read = 'Pasa el mouse sobre el gráfico';
    if (hov != null) {
        const index = Number(hov);
        const value = series[index];
        const status = value > ucl || value < lcl ? 'FUERA DE CONTROL' : trend[index] ? 'tendencia: 6+ días sobre la media' : 'en control';
        read = `${index + 1} sep · ${String(value).replace('.', ',')} h · ${status} · desvío ${((value - mean) / sd).toFixed(1).replace('.', ',')}σ`;
    }
    const outs = series.map((value, index) => value > ucl || value < lcl ? index + 1 : 0).filter(Boolean);
    return frame('Tiempo de preparación de pedidos · control estadístico', 'horas por día · límites ±3σ', body, width, height, 'Gráfico de control', read, [
        outs.length ? `Fuera de control el ${outs.join(', ')} sep: investigar causa` : 'Proceso en control',
        'Desde el 24 sep: tendencia sobre la media (regla de 6 puntos)',
        `Media ${mean.toFixed(1).replace('.', ',')} h · σ ${sd.toFixed(1).replace('.', ',')} h`
    ]);
}

export function renderAdv(kind: string, hov: string | null, series: number[]): string | null {
    if (!ADV.has(kind)) {
        return null;
    }
    switch (kind) {
        case 'chwf': return waterfall(hov);
        case 'chfunnel': return funnel(hov);
        case 'chpareto': return pareto(hov);
        case 'chtree': return treemap(hov);
        case 'chradar': return radar(hov);
        case 'chsankey': return sankey(hov);
        case 'chbullet': return bullet(hov);
        case 'chgantt': return gantt(hov);
        case 'chforecast': return forecast(hov);
        case 'chvariance': return variance(hov);
        case 'chquadrant': return quadrant(hov);
        case 'chcohort': return cohort(hov);
        case 'chmekko': return mekko(hov);
        case 'chslope': return slope(hov);
        case 'chdumbbell': return dumbbell(hov);
        case 'chcontrol': return control(hov, series);
        default: return null;
    }
}
