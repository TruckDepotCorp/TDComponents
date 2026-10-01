const C128 = [
    '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
    '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
    '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
    '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
    '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
    '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
    '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
    '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
    '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
    '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
    '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
];

const EAN_L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const EAN_G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
const EAN_R = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100'];
const EAN_FIRST = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

export interface CodeRender {
    svg: string;
    format: string;
    modules: string;
    value: string;
    hint: string;
    error?: string;
}

export function encodeBarcode(format: string, raw: string, module: number, height: number, color: string, showText: boolean): CodeRender {
    if (format === 'ean13') {
        return drawLinear('EAN-13', eanBits(raw, 13), raw, module, height, color, showText, '12 dígitos + verificador. Se completa con ceros si falta.');
    }
    if (format === 'ean8') {
        return drawLinear('EAN-8', eanBits(raw, 8), raw, module, height, color, showText, '7 dígitos + verificador.');
    }
    return drawLinear('Code 128', code128Bits(raw), raw, module, height, color, showText, 'Code 128 B. ASCII imprimible.');
}

function code128Bits(text: string): { bits: string; value: string; error?: string } {
    const chars = [...text].filter((ch) => ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) <= 126);
    if (!chars.length) {
        return { bits: '', value: text, error: 'Escribe un valor para Code 128.' };
    }

    const codes = [104, ...chars.map((ch) => ch.charCodeAt(0) - 32)];
    const checksum = codes.reduce((sum, code, i) => sum + code * (i === 0 ? 1 : i), 0) % 103;
    codes.push(checksum, 106);
    return { bits: codes.map((code) => widthsToBits(C128[code])).join(''), value: chars.join('') };
}

function eanBits(raw: string, length: number): { bits: string; value: string; error?: string } {
    const digits = raw.replace(/\D/g, '').slice(0, length);
    if (digits.length < length - 1) {
        return { bits: '', value: digits, error: `EAN-${length} necesita ${length - 1} dígitos.` };
    }

    const body = digits.slice(0, length - 1).padStart(length - 1, '0');
    const value = body + eanCheck(body);
    const bits = length === 13 ? ean13(value) : ean8(value);
    return { bits, value };
}

function eanCheck(body: string): string {
    const sum = [...body].reduce((total, digit, index) => {
        const n = Number(digit);
        const fromRight = body.length - index;
        return total + n * (fromRight % 2 === 0 ? 3 : 1);
    }, 0);
    return String((10 - (sum % 10)) % 10);
}

function ean13(value: string): string {
    const first = Number(value[0]);
    const pattern = EAN_FIRST[first];
    let bits = '101';
    for (let i = 0; i < 6; i++) {
        const digit = Number(value[i + 1]);
        bits += pattern[i] === 'L' ? EAN_L[digit] : EAN_G[digit];
    }
    bits += '01010';
    for (let i = 7; i < 13; i++) {
        bits += EAN_R[Number(value[i])];
    }
    return `${bits}101`;
}

function ean8(value: string): string {
    let bits = '101';
    for (let i = 0; i < 4; i++) {
        bits += EAN_L[Number(value[i])];
    }
    bits += '01010';
    for (let i = 4; i < 8; i++) {
        bits += EAN_R[Number(value[i])];
    }
    return `${bits}101`;
}

function widthsToBits(widths: string): string {
    return [...widths].map((n, i) => (i % 2 === 0 ? '1' : '0').repeat(Number(n))).join('');
}

function drawLinear(format: string, encoded: { bits: string; value: string; error?: string }, raw: string, module: number, height: number, color: string, showText: boolean, hint: string): CodeRender {
    if (encoded.error || !encoded.bits) {
        return { svg: '', format, modules: '—', value: raw || '—', hint, error: encoded.error };
    }

    const quiet = 10;
    const width = (encoded.bits.length + quiet * 2) * module;
    const label = showText ? 18 : 0;
    const bars = [...encoded.bits].map((bit, i) => bit === '1'
        ? `<rect x="${(i + quiet) * module}" y="0" width="${module}" height="${height}" fill="${color}"/>`
        : '').join('');
    const text = showText
        ? `<text x="${width / 2}" y="${height + 14}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="12" fill="${color}">${escapeXml(encoded.value)}</text>`
        : '';
    return {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height + label}" viewBox="0 0 ${width} ${height + label}" role="img" aria-label="${format} ${escapeXml(encoded.value)}">${bars}${text}</svg>`,
        format,
        modules: String(encoded.bits.length),
        value: encoded.value,
        hint,
    };
}

export interface QrRender {
    svg: string;
    version: string;
    modules: string;
    bytes: string;
    error?: string;
}

const QR_DATA = [
    [19, 16, 13, 9],
    [34, 28, 22, 16],
    [55, 44, 34, 26],
    [80, 64, 48, 36],
];
const QR_ECC = [
    [7, 10, 13, 17],
    [10, 16, 22, 28],
    [15, 26, 36, 44],
    [20, 36, 52, 64],
];
const ECC_INDEX: Record<string, number> = { L: 0, M: 1, Q: 2, H: 3 };
const ECC_FORMAT = [1, 0, 3, 2];

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
    let x = 1;
    for (let i = 0; i < 255; i++) {
        GF_EXP[i] = x;
        GF_LOG[x] = i;
        x <<= 1;
        if (x & 0x100) {
            x ^= 0x11d;
        }
    }
    for (let i = 255; i < 512; i++) {
        GF_EXP[i] = GF_EXP[i - 255];
    }
})();

function gfMul(a: number, b: number): number {
    return a && b ? GF_EXP[GF_LOG[a] + GF_LOG[b]] : 0;
}

function rsEncode(data: number[], ecCount: number): number[] {
    const gen = [1];
    for (let i = 0; i < ecCount; i++) {
        gen.push(0);
        for (let j = gen.length - 1; j > 0; j--) {
            gen[j] = gen[j - 1] ^ gfMul(gen[j], GF_EXP[i]);
        }
        gen[0] = gfMul(gen[0], GF_EXP[i]);
    }

    const ecc = new Array<number>(ecCount).fill(0);
    for (const byte of data) {
        const factor = byte ^ ecc[0];
        ecc.shift();
        ecc.push(0);
        if (!factor) {
            continue;
        }
        for (let j = 0; j < ecCount; j++) {
            ecc[j] ^= gfMul(gen[ecCount - j], factor);
        }
    }
    return ecc;
}

export function encodeQr(text: string, eccName: string, module: number, color = '#0A0B0C', quiet = 4): QrRender {
    const ink = /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#0A0B0C';
    const margin = Math.max(0, quiet);
    if (!text.trim()) {
        return { svg: '', version: '—', modules: '—', bytes: '0', error: 'Escribe un texto para generar el código QR.' };
    }
    const bytes = [...new TextEncoder().encode(text)];
    const ecc = ECC_INDEX[eccName] ?? 1;
    let version = 0;
    while (version < QR_DATA.length && bytes.length + 2 > QR_DATA[version][ecc] - 2) {
        version += 1;
    }
    if (version >= QR_DATA.length) {
        version = QR_DATA.length - 1;
    }

    const dataCap = QR_DATA[version][ecc];
    const payload = bytes.slice(0, Math.max(0, dataCap - 2));
    const bits: number[] = [];
    pushBits(bits, 0b0100, 4);
    pushBits(bits, payload.length, 8);
    payload.forEach((byte) => pushBits(bits, byte, 8));
    pushBits(bits, 0, Math.min(4, dataCap * 8 - bits.length));
    while (bits.length % 8) {
        bits.push(0);
    }

    const data: number[] = [];
    for (let i = 0; i < bits.length; i += 8) {
        data.push(bits.slice(i, i + 8).reduce((n, bit) => (n << 1) | bit, 0));
    }
    const pads = [0xec, 0x11];
    while (data.length < dataCap) {
        data.push(pads[(data.length - payload.length) & 1]);
    }

    const eccWords = rsEncode(data, QR_ECC[version][ecc]);
    const codewords = [...data, ...eccWords];
    const size = 21 + version * 4;
    const reserved = makeReserved(size, version);
    const best = chooseMask(size, version, reserved, codewords, ecc);
    const dim = (size + margin * 2) * module;
    let rects = '';
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (best[y][x]) {
                rects += `<rect x="${(x + margin) * module}" y="${(y + margin) * module}" width="${module}" height="${module}"/>`;
            }
        }
    }
    const cut = bytes.length > payload.length;

    return {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" role="img" aria-label="QR ${escapeXml(text)}"><rect width="${dim}" height="${dim}" fill="#fff"/><g fill="${ink}">${rects}</g></svg>`,
        version: String(version + 1),
        modules: `${size}×${size}`,
        bytes: String(payload.length),
        error: cut ? `El texto supera la versión ${version + 1}. Se codificaron ${payload.length} de ${bytes.length} bytes.` : undefined,
    };
}

function pushBits(bits: number[], value: number, count: number): void {
    for (let i = count - 1; i >= 0; i--) {
        bits.push((value >> i) & 1);
    }
}

function makeReserved(size: number, version: number): boolean[][] {
    const reserved = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
    const markFinder = (x: number, y: number) => {
        for (let r = -1; r <= 7; r++) {
            for (let c = -1; c <= 7; c++) {
                const xx = x + c;
                const yy = y + r;
                if (xx >= 0 && yy >= 0 && xx < size && yy < size) {
                    reserved[yy][xx] = true;
                }
            }
        }
    };
    markFinder(0, 0);
    markFinder(size - 7, 0);
    markFinder(0, size - 7);
    for (let i = 0; i < size; i++) {
        reserved[6][i] = true;
        reserved[i][6] = true;
    }
    if (version > 0) {
        const a = 12 + version * 4;
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                reserved[a - 2 + r][a - 2 + c] = true;
            }
        }
    }
    for (let i = 0; i < 9; i++) {
        reserved[8][i] = true;
        reserved[i][8] = true;
        if (size - 1 - i >= 0) {
            reserved[8][size - 1 - i] = true;
            reserved[size - 1 - i][8] = true;
        }
    }
    reserved[size - 8][8] = true;
    return reserved;
}

function chooseMask(size: number, version: number, reserved: boolean[][], codewords: number[], ecc: number): boolean[][] {
    let best: boolean[][] = [];
    let bestScore = Infinity;
    for (let mask = 0; mask < 8; mask++) {
        const grid = place(size, version, reserved, codewords, ecc, mask);
        const score = penalty(grid);
        if (score < bestScore) {
            bestScore = score;
            best = grid;
        }
    }
    return best;
}

function place(size: number, version: number, reserved: boolean[][], codewords: number[], ecc: number, mask: number): boolean[][] {
    const grid = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
    drawFinder(grid, 0, 0);
    drawFinder(grid, size - 7, 0);
    drawFinder(grid, 0, size - 7);
    for (let i = 8; i < size - 8; i++) {
        grid[6][i] = i % 2 === 0;
        grid[i][6] = i % 2 === 0;
    }
    if (version > 0) {
        const a = 12 + version * 4;
        drawAlign(grid, a, a);
    }

    const bits: number[] = [];
    codewords.forEach((word) => pushBits(bits, word, 8));
    let bit = 0;
    let up = true;
    for (let col = size - 1; col > 0; col -= 2) {
        if (col === 6) {
            col -= 1;
        }
        for (let i = 0; i < size; i++) {
            const row = up ? size - 1 - i : i;
            for (const c of [col, col - 1]) {
                if (reserved[row][c]) {
                    continue;
                }
                const dark = bit < bits.length ? bits[bit] === 1 : false;
                grid[row][c] = maskBit(row, c, mask) ? !dark : dark;
                bit += 1;
            }
        }
        up = !up;
    }

    applyFormat(grid, size, ECC_FORMAT[ecc], mask);
    return grid;
}

function drawFinder(grid: boolean[][], x: number, y: number): void {
    for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
            const edge = r === 0 || r === 6 || c === 0 || c === 6;
            const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            grid[y + r][x + c] = edge || core;
        }
    }
}

function drawAlign(grid: boolean[][], x: number, y: number): void {
    for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
            grid[y + r][x + c] = Math.max(Math.abs(r), Math.abs(c)) !== 1;
        }
    }
}

function maskBit(row: number, col: number, mask: number): boolean {
    switch (mask) {
        case 0: return (row + col) % 2 === 0;
        case 1: return row % 2 === 0;
        case 2: return col % 3 === 0;
        case 3: return (row + col) % 3 === 0;
        case 4: return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
        case 5: return ((row * col) % 2) + ((row * col) % 3) === 0;
        case 6: return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
        default: return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
    }
}

function applyFormat(grid: boolean[][], size: number, ecc: number, mask: number): void {
    let data = (ecc << 3) | mask;
    let bits = data << 10;
    const gen = 0x537;
    for (let i = 14; i >= 10; i--) {
        if ((bits >> i) & 1) {
            bits ^= gen << (i - 10);
        }
    }
    bits = ((data << 10) | bits) ^ 0x5412;
    const pos = [
        [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
        [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
    ];
    const pos2 = [
        [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8], [size - 5, 8], [size - 6, 8], [size - 7, 8],
        [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5], [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1],
    ];
    for (let i = 0; i < 15; i++) {
        const dark = ((bits >> (14 - i)) & 1) === 1;
        grid[pos[i][0]][pos[i][1]] = dark;
        grid[pos2[i][0]][pos2[i][1]] = dark;
    }
    grid[size - 8][8] = true;
}

function penalty(grid: boolean[][]): number {
    const n = grid.length;
    let score = 0;
    for (let y = 0; y < n; y++) {
        score += runPenalty(grid[y]) + runPenalty(grid.map((row) => row[y]));
    }
    for (let y = 0; y < n - 1; y++) {
        for (let x = 0; x < n - 1; x++) {
            if (grid[y][x] === grid[y][x + 1] && grid[y][x] === grid[y + 1][x] && grid[y][x] === grid[y + 1][x + 1]) {
                score += 3;
            }
        }
    }
    let dark = 0;
    grid.forEach((row) => row.forEach((cell) => {
        if (cell) {
            dark += 1;
        }
    }));
    score += Math.abs(Math.floor((dark * 100) / (n * n) / 5) * 10 - 50);
    return score;
}

function runPenalty(line: boolean[]): number {
    let score = 0;
    let run = 1;
    for (let i = 1; i <= line.length; i++) {
        if (i < line.length && line[i] === line[i - 1]) {
            run += 1;
            continue;
        }
        if (run >= 5) {
            score += 3 + (run - 5);
        }
        run = 1;
    }
    return score;
}

function escapeXml(value: string): string {
    return value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] ?? ch));
}
