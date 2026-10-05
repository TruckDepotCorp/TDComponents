interface Part {
    id: number;
    code: string;
    name: string;
    brand: string;
    app: string;
    cat: string;
    stock: number;
    price: number;
}

interface Line { id: number; qty: number }
interface WishList { id: string; name: string; items: number[] }
interface BulkRow { code: string; qty: number; ok: boolean; name: string }

interface EcomState {
    cart: Line[];
    wish: number[];
    cmp: number[];
    cmpDiff: boolean;
    layout: 'grid' | 'list';
    drawer: boolean;
    coupon: string;
    couponOk: boolean;
    pv: { side: 'del' | 'tra'; q: 'orig' | 'alt' | 'eco'; qty: number; img: number };
    step: number;
    co: { name: string; mail: string; rut: string; addr: string; ship: 'std' | 'exp' | 'pick'; pay: 'card' | 'transfer' | 'credit'; tried: boolean };
    f: { brand: string[]; cat: string[]; stock: boolean; max: number };
    sort: 'rel' | 'lo' | 'hi' | 'rate';
    q: string;
    qOpen: boolean;
    qHi: number;
    recentQ: string[];
    rf: number;
    rs: 'new' | 'help' | 'hi' | 'lo';
    votes: Record<number, boolean>;
    rv: { open: boolean; stars: number; text: string; tried: boolean };
    pf: { brand: string; model: string; year: string; sys: string; plate: string; tab: 'veh' | 'plate'; done: boolean };
    quote: Line[];
    quoteNote: string;
    quoteSent: boolean;
    bulkText: string;
    bulkRows: BulkRow[] | null;
    recent: number[];
    stockSubs: Record<number, boolean>;
    lists: WishList[];
    newList: string;
    fbtOff: Record<number, boolean>;
    storeQ: string;
    rmaStep: number;
    rma: { item: number | null; reason: string; method: 'refund' | 'credit' | 'exchange'; tried: boolean };
    paid: string[];
    msg: string;
    timer: number;
    flashEnd: number;
    kind: string;
    parts: Part[];
    source: string;
}

const DEMO_PARTS: Part[] = [
    { id: 1, code: 'BR-4521-AD', name: 'Pastilla de freno delantera', brand: 'Volvo', app: 'Volvo FH 460', cat: 'Frenos', stock: 42, price: 189990 },
    { id: 2, code: 'SU-1180-KT', name: 'Amortiguador de cabina', brand: 'Scania', app: 'Scania R450', cat: 'Suspensión', stock: 8, price: 246500 },
    { id: 3, code: 'MT-7702-FL', name: 'Filtro de aceite', brand: 'Mercedes-Benz', app: 'Mercedes-Benz Actros 2651', cat: 'Motor', stock: 120, price: 24990 },
    { id: 4, code: 'EL-3310-AL', name: 'Alternador 24V 110A', brand: 'Freightliner', app: 'Freightliner Cascadia', cat: 'Eléctrico', stock: 0, price: 612000 },
    { id: 5, code: 'TR-5049-EM', name: 'Kit de embrague 430 mm', brand: 'International', app: 'International LT 625', cat: 'Transmisión', stock: 5, price: 1089990 },
    { id: 6, code: 'BR-4609-DS', name: 'Disco de freno ventilado', brand: 'Mercedes-Benz', app: 'Mercedes-Benz O500 RS', cat: 'Frenos', stock: 16, price: 158400 },
    { id: 7, code: 'SU-2231-BL', name: 'Bolsa de aire suspensión', brand: 'Volvo', app: 'Volvo B12R', cat: 'Suspensión', stock: 27, price: 132750 },
    { id: 8, code: 'MT-8840-TB', name: 'Turbocompresor', brand: 'Scania', app: 'Scania K410', cat: 'Motor', stock: 3, price: 1490000 },
    { id: 9, code: 'EL-1024-MA', name: 'Motor de arranque 24V', brand: 'Hino', app: 'Hino 500 FM', cat: 'Eléctrico', stock: 11, price: 398900 },
    { id: 10, code: 'MT-3301-BA', name: 'Bomba de agua', brand: 'Kenworth', app: 'Kenworth T880', cat: 'Motor', stock: 19, price: 214300 },
    { id: 11, code: 'CA-7710-ES', name: 'Espejo retrovisor calefaccionado', brand: 'Volvo', app: 'Volvo FH 540', cat: 'Carrocería', stock: 34, price: 96500 },
    { id: 12, code: 'BR-5512-VA', name: 'Válvula relé de freno', brand: 'MAN', app: 'MAN TGX 18.480', cat: 'Frenos', stock: 9, price: 87400 },
    { id: 13, code: 'TR-2208-CR', name: 'Cruceta de cardán', brand: 'Iveco', app: 'Iveco Stralis', cat: 'Transmisión', stock: 48, price: 45900 },
    { id: 14, code: 'SU-6603-BR', name: 'Barra estabilizadora', brand: 'Mercedes-Benz', app: 'Mercedes-Benz O500 U', cat: 'Suspensión', stock: 6, price: 312000 },
    { id: 15, code: 'EL-4450-FA', name: 'Faro LED delantero', brand: 'Scania', app: 'Scania Serie S', cat: 'Eléctrico', stock: 22, price: 278600 },
    { id: 16, code: 'MT-1190-IN', name: 'Inyector diésel', brand: 'Volvo', app: 'Volvo D13', cat: 'Motor', stock: 0, price: 529000 },
    { id: 17, code: 'CA-3320-PA', name: 'Parachoques delantero', brand: 'International', app: 'International HX 620', cat: 'Carrocería', stock: 2, price: 684500 },
    { id: 18, code: 'BR-7781-TA', name: 'Tambor de freno trasero', brand: 'Hino', app: 'Hino Dutro', cat: 'Frenos', stock: 14, price: 171200 },
    { id: 19, code: 'TR-9902-SI', name: 'Sincronizador 3ª/4ª', brand: 'Scania', app: 'Scania GRS905', cat: 'Transmisión', stock: 7, price: 143800 },
    { id: 20, code: 'SU-4417-RE', name: 'Resorte de hoja delantero', brand: 'Kenworth', app: 'Kenworth W900', cat: 'Suspensión', stock: 13, price: 256700 },
    { id: 21, code: 'EL-8812-SE', name: 'Sensor ABS de rueda', brand: 'Mercedes-Benz', app: 'Mercedes-Benz Citaro', cat: 'Eléctrico', stock: 64, price: 38900 },
    { id: 22, code: 'MT-5520-RA', name: 'Radiador de aluminio', brand: 'MAN', app: "MAN Lion's City", cat: 'Motor', stock: 4, price: 896000 },
    { id: 23, code: 'CA-1150-LI', name: 'Limpiaparabrisas 1000 mm', brand: 'Volvo', app: 'Volvo B8R', cat: 'Carrocería', stock: 85, price: 18900 },
    { id: 24, code: 'BR-3390-CA', name: 'Caliper de freno', brand: 'Iveco', app: 'Iveco Crossway', cat: 'Frenos', stock: 10, price: 368400 },
];

export const PARTS = DEMO_PARTS;

const GRAD = [
    'linear-gradient(135deg,#3A4047,#15181B)',
    'linear-gradient(135deg,#4B5158,#1F2327)',
    'linear-gradient(135deg,#2B3036,#0A0B0C)',
    'linear-gradient(135deg,#5A6168,#2B3036)',
    'linear-gradient(135deg,#33383D,#0A0B0C)',
    'linear-gradient(135deg,#6E757D,#33383D)',
];

const REVIEWS: [number, string, string, string, number, number][] = [
    [5, 'Carlos M.', 'Transportes del Sur', 'Duración excelente, 60.000 km y siguen bien. Sin ruido al frenar.', 18, 2],
    [4, 'Paula R.', 'Taller Maipú', 'Buen producto, la instalación fue simple. El sensor vino aparte.', 9, 5],
    [5, 'Jorge S.', 'Buses Andinos', 'Compramos 40 juegos para la flota, llegaron al día siguiente.', 24, 8],
    [3, 'Ana V.', 'Particular', 'Cumple, pero frenan algo menos en frío que las originales anteriores.', 4, 12],
    [5, 'Luis T.', 'Minera Los Robles', 'Aguantan bien el polvo de faena. Recomendadas.', 12, 20],
    [2, 'Diego F.', 'Particular', 'Llegaron con la caja dañada, aunque las pastillas estaban bien.', 2, 30],
    [4, 'Marcela P.', 'Frío Norte', 'Precio razonable por volumen. Atención rápida del asesor.', 6, 41],
];

const FREE = 150000;
const states = new WeakMap<HTMLElement, EcomState>();
const flashing = new WeakSet<HTMLElement>();

function money(n: number): string {
    return `$ ${Math.round(n).toLocaleString('es-CL')}`;
}

function esc(value: string): string {
    return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] ?? char));
}

function byId(id: number, state?: EcomState): Part | undefined {
    return (state?.parts ?? DEMO_PARTS).find((part) => part.id === id);
}

function lead(state: EcomState, index: number): Part {
    return state.parts[index] ?? state.parts[0] ?? { id: 0, code: '', name: 'Sin productos', brand: '', app: '', cat: '', stock: 0, price: 0 };
}

function disc(part: Part): number {
    return [0, 15, 0, 20, 0, 10, 25, 0][part.id % 8];
}

function sale(part: Part): number {
    return Math.round(part.price * (1 - disc(part) / 100));
}

function rating(part: Part): number {
    return 3.6 + ((part.id * 37) % 14) / 10;
}

function reviewCount(part: Part): number {
    return 12 + (part.id * 53) % 180;
}

function stockOf(stock: number): [string, string] {
    if (stock === 0) return ['Agotado', 'var(--td-color-danger)'];
    if (stock <= 10) return [`Pocas unidades · ${stock}`, 'var(--td-color-warning)'];
    return ['En stock', 'var(--td-color-success)'];
}

function stars(value: number): string {
    const rounded = Math.round(value * 2) / 2;
    return Array.from({ length: 5 }, (_, index) => {
        const fill = index + 1 <= rounded ? 1 : index + 0.5 === rounded ? 0.5 : 0;
        return `<i class="td-ecom__star" style="--fill:${fill}" aria-hidden="true"></i>`;
    }).join('');
}

function fresh(kind = 'ecard'): EcomState {
    return {
        cart: [{ id: 1, qty: 2 }, { id: 4, qty: 1 }],
        wish: [3],
        cmp: [1, 2, 5],
        cmpDiff: false,
        layout: 'grid',
        coupon: '',
        couponOk: false,
        pv: { side: 'del', q: 'orig', qty: 1, img: 0 },
        step: 0,
        co: { name: '', mail: '', rut: '', addr: '', ship: 'std', pay: 'card', tried: false },
        f: { brand: [], cat: [], stock: false, max: 0 },
        sort: 'rel',
        q: '',
        qOpen: false,
        qHi: -1,
        recentQ: ['pastilla volvo', 'filtro aceite scania'],
        rf: 0,
        rs: 'new',
        votes: {},
        rv: { open: false, stars: 0, text: '', tried: false },
        pf: { brand: '', model: '', year: '', sys: '', plate: '', tab: 'veh', done: false },
        quote: [],
        quoteNote: '',
        quoteSent: false,
        bulkText: '',
        bulkRows: null,
        recent: [7, 3, 9, 2, 5],
        stockSubs: {},
        lists: [{ id: 'l1', name: 'Flota Volvo', items: [1, 4] }, { id: 'l2', name: 'Bahía 2', items: [3] }],
        newList: '',
        fbtOff: {},
        storeQ: '',
        rmaStep: 0,
        rma: { item: null, reason: '', method: 'refund', tried: false },
        paid: [],
        msg: '',
        timer: 0,
        flashEnd: Date.now() + (5 * 3600 + 23 * 60 + 41) * 1000,
        kind,
        parts: DEMO_PARTS,
        source: '',
        drawer: kind === 'ecart',
    };
}

function norm(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function cartMath(state: EcomState): { sub: number; off: number; ship: number; total: number; qty: number } {
    const sub = state.cart.reduce((sum, line) => {
        const part = byId(line.id, state);
        return part ? sum + sale(part) * line.qty : sum;
    }, 0);
    const off = state.couponOk ? Math.round(sub * 0.1) : 0;
    const ship = sub - off >= FREE || !sub ? 0 : 6990;
    return { sub, off, ship, total: sub - off + ship, qty: state.cart.reduce((sum, line) => sum + line.qty, 0) };
}

function card(part: Part, state: EcomState): string {
    const discount = disc(part);
    const [label, color] = stockOf(part.stock);
    const wished = state.wish.includes(part.id);
    const compared = state.cmp.includes(part.id);
    return `<article class="td-ecom__card ${state.layout === 'list' ? 'is-list' : ''}">
        <div class="td-ecom__media" style="background:${GRAD[part.id % GRAD.length]}">
            <span>${esc(part.cat)}</span>
            ${discount ? `<b class="td-ecom__flag">-${discount}%</b>` : ''}
            ${part.id % 5 === 2 ? '<b class="td-ecom__flag is-new">Nuevo</b>' : ''}
            ${part.id % 7 === 1 ? '<b class="td-ecom__flag is-best">Más vendido</b>' : ''}
        </div>
        <div class="td-ecom__body">
            <small>${esc(part.brand)} · ${esc(part.code)}</small>
            <strong>${esc(part.name)}</strong>
            <span class="td-ecom__stars" aria-label="${rating(part).toFixed(1).replace('.', ',')} de 5">${stars(rating(part))}<em>${rating(part).toFixed(1).replace('.', ',')} (${reviewCount(part)})</em></span>
            <span class="td-ecom__stock" style="color:${color}">${label}</span>
            <p class="td-ecom__price"><b>${money(sale(part))}</b>${discount ? `<s>${money(part.price)}</s>` : ''}</p>
            <div class="td-ecom__acts">
                <button type="button" data-ec="add:${part.id}" ${part.stock ? '' : 'disabled'}>Agregar al carrito</button>
                <button type="button" data-ec="wish:${part.id}" aria-pressed="${wished}" aria-label="${wished ? 'Quitar de favoritos' : 'Agregar a favoritos'}">${wished ? 'En favoritos' : 'Favorito'}</button>
                <button type="button" data-ec="cmp:${part.id}" aria-pressed="${compared}">${compared ? 'En comparación' : 'Comparar'}</button>
            </div>
        </div>
    </article>`;
}

function shell(kind: string, state: EcomState): string {
    const body = renderKind(kind, state);
    return `<p class="td-ecom__msg" role="status">${esc(state.msg || '\u00a0')}</p>${body}`;
}

function renderKind(kind: string, state: EcomState): string {
    switch (kind) {
        case 'ecard': return cards(state);
        case 'edetail': return detail(state);
        case 'ecart': return cart(state);
        case 'echeckout': return checkout(state);
        case 'efacets': return facets(state);
        case 'esearch': return search(state);
        case 'ecompare': return compare(state);
        case 'eflash': return flashSale(state);
        case 'ereviews': return reviews(state);
        case 'efinder': return finder(state);
        case 'equote': return quote(state);
        case 'ebulk': return bulk(state);
        case 'erecent': return recent(state);
        case 'estock': return stockAlert(state);
        case 'ewishmulti': return wishlists(state);
        case 'etrack': return track(state);
        case 'efbt': return bundle(state);
        case 'elocator': return locator(state);
        case 'ecredit': return credit(state);
        case 'ereturns': return returns(state);
        default: return cards(state);
    }
}

function cards(state: EcomState): string {
    const math = cartMath(state);
    return `<div class="td-ecom__bar">
        <div class="td-ecom__seg" role="group" aria-label="Disposición">
            <button type="button" data-ec="layout:grid" aria-pressed="${state.layout === 'grid'}">Grilla</button>
            <button type="button" data-ec="layout:list" aria-pressed="${state.layout === 'list'}">Lista</button>
        </div>
        <span>Favoritos ${state.wish.length} · Comparar ${state.cmp.length} · Carrito ${math.qty}</span>
    </div>
    <div class="td-ecom__grid ${state.layout === 'list' ? 'is-list' : ''}">${state.parts.slice(0, 8).map((part) => card(part, state)).join('')}</div>`;
}

function detail(state: EcomState): string {
    const part = lead(state, 0);
    const factor = state.pv.q === 'orig' ? 1 : state.pv.q === 'alt' ? 0.72 : 0.55;
    const base = Math.round(part.price * factor);
    const tiers: [number, number][] = [[1, 0], [5, 5], [10, 10], [20, 15]];
    const tier = [...tiers].reverse().find((row) => state.pv.qty >= row[0]) ?? tiers[0];
    const unit = Math.round(base * (1 - tier[1] / 100));
    const code = part.code + (state.pv.side === 'tra' ? '-T' : '') + (state.pv.q === 'orig' ? '' : state.pv.q === 'alt' ? '-A' : '-E');
    const views = ['Vista frontal', 'Vista lateral', 'Detalle del material', 'En el eje'];
    const quals: ['orig' | 'alt' | 'eco', string, string][] = [['orig', 'Original', 'Garantía 12 meses'], ['alt', 'Alternativa', 'Garantía 6 meses'], ['eco', 'Económica', 'Garantía 3 meses']];
    const stores: [string, number, string][] = [['Quilicura', 42, 'Hoy'], ['Concepción', 8, 'Mañana'], ['Antofagasta', 0, '3–5 días']];
    return `<div class="td-ecom__detail">
        <div>
            <div class="td-ecom__hero" style="background:${GRAD[(part.id + state.pv.img) % GRAD.length]}">${views[state.pv.img]}</div>
            <div class="td-ecom__thumbs">${views.map((label, index) => `<button type="button" data-ec="img:${index}" aria-pressed="${state.pv.img === index}" style="background:${GRAD[(part.id + index) % GRAD.length]}">${label}</button>`).join('')}</div>
        </div>
        <div class="td-ecom__buy">
            <small>${esc(part.brand)} · ${esc(code)}</small>
            <h2>${esc(part.name)}</h2>
            <span class="td-ecom__stars">${stars(rating(part))}<em>${rating(part).toFixed(1).replace('.', ',')} · ${reviewCount(part)} reseñas</em></span>
            <p>${esc(part.app)}</p>
            <div class="td-ecom__seg" role="group" aria-label="Lado">
                <button type="button" data-ec="side:del" aria-pressed="${state.pv.side === 'del'}">Delantera</button>
                <button type="button" data-ec="side:tra" aria-pressed="${state.pv.side === 'tra'}">Trasera</button>
            </div>
            <div class="td-ecom__quals">${quals.map(([key, label, hint]) => `<button type="button" data-ec="qual:${key}" aria-pressed="${state.pv.q === key}"><b>${label}</b><span>${hint}</span><em>${money(Math.round(part.price * (key === 'orig' ? 1 : key === 'alt' ? 0.72 : 0.55)))}</em></button>`).join('')}</div>
            <div class="td-ecom__tiers">${tiers.map(([count, cut]) => `<span class="${tier[0] === count ? 'is-on' : ''}">${count}+ u. · ${cut ? `−${cut}%` : 'Base'}</span>`).join('')}</div>
            <p class="td-ecom__price"><b>${money(unit)}</b>${tier[1] ? `<s>${money(base)}</s><em>${tier[1]}% por volumen</em>` : ''}</p>
            <div class="td-ecom__qty">
                <button type="button" data-ec="pd:-1" aria-label="Disminuir cantidad">−</button>
                <input data-ec-in="pd" inputmode="numeric" value="${state.pv.qty}" aria-label="Cantidad">
                <button type="button" data-ec="pd:1" aria-label="Aumentar cantidad">+</button>
                <strong>Total ${money(unit * state.pv.qty)}</strong>
            </div>
            <div class="td-ecom__acts">
                <button type="button" data-ec="addpd">Agregar al carrito</button>
                <button type="button" data-ec="buy">Comprar ahora · ${money(unit * state.pv.qty)}</button>
            </div>
            <ul class="td-ecom__stores">${stores.map(([name, qty, when]) => {
                const [label, color] = stockOf(qty);
                return `<li><b>${name}</b><span style="color:${color}">${qty ? `${qty} u. · ${label}` : 'Sin stock'}</span><small>${qty ? `Retiro ${when.toLowerCase()}` : `Traslado ${when}`}</small></li>`;
            }).join('')}</ul>
        </div>
    </div>`;
}

function cart(state: EcomState): string {
    const math = cartMath(state);
    const lines = state.cart.map((line) => ({ line, part: byId(line.id, state) })).filter((row) => row.part);
    const missing = Math.max(0, FREE - (math.sub - math.off));
    const cross = state.parts.filter((part) => part.stock > 0 && !state.cart.some((line) => line.id === part.id)).slice(0, 3);
    return `<div class="td-ecom__cart ${state.drawer ? 'is-open' : ''}">
        <button type="button" data-ec="drawer">${state.drawer ? 'Cerrar carrito' : `Abrir carrito · ${math.qty} productos`}</button>
        <aside class="td-ecom__drawer" ${state.drawer ? '' : 'hidden'} aria-label="Carrito">
            <header><strong>${math.qty} ${math.qty === 1 ? 'producto' : 'productos'}</strong><button type="button" data-ec="drawer">Cerrar</button></header>
            ${lines.length ? `<ul>${lines.map(({ line, part }) => `<li>
                <i style="background:${GRAD[part!.id % GRAD.length]}"></i>
                <div><b>${esc(part!.name)}</b><small>${esc(part!.code)} · ${money(sale(part!))}</small></div>
                <div class="td-ecom__qty">
                    <button type="button" data-ec="line:${line.id}:-1" ${line.qty <= 1 ? 'disabled' : ''} aria-label="Disminuir">−</button>
                    <span>${line.qty}</span>
                    <button type="button" data-ec="line:${line.id}:1" ${line.qty >= part!.stock ? 'disabled' : ''} aria-label="Aumentar">+</button>
                </div>
                <b>${money(sale(part!) * line.qty)}</b>
                <button type="button" data-ec="rm:${line.id}" aria-label="Quitar ${esc(part!.name)}">Quitar</button>
            </li>`).join('')}</ul>` : '<p>El carrito está vacío. Agrega un repuesto para continuar.</p>'}
            <div class="td-ecom__ship"><span style="width:${Math.min(100, Math.round((math.sub - math.off) / FREE * 100))}%"></span></div>
            <p>${math.sub - math.off >= FREE ? 'Tienes despacho gratis' : `Te faltan ${money(missing)} para despacho gratis`}</p>
            <label>Cupón <input data-ec-in="coupon" value="${esc(state.coupon)}" placeholder="FLOTA10" aria-label="Cupón"></label>
            <button type="button" data-ec="coupon">${state.couponOk ? 'Cupón FLOTA10 aplicado · 10%' : 'Aplicar cupón'}</button>
            <dl>
                <dt>Subtotal</dt><dd>${money(math.sub)}</dd>
                ${math.off ? `<dt>Descuento</dt><dd>− ${money(math.off)}</dd>` : ''}
                <dt>Despacho</dt><dd>${math.ship ? money(math.ship) : 'Gratis'}</dd>
                <dt>Total</dt><dd><b>${money(math.total)}</b></dd>
            </dl>
            <button type="button" data-ec="go-check" ${lines.length ? '' : 'disabled'}>Ir a pagar · ${money(math.total)}</button>
            <div class="td-ecom__cross">${cross.map((part) => `<button type="button" data-ec="add:${part.id}"><i style="background:${GRAD[part.id % GRAD.length]}"></i>${esc(part.name)}<b>${money(part.price)}</b></button>`).join('')}</div>
        </aside>
    </div>`;
}

function field(name: string, label: string, value: string, error: string): string {
    return `<label>${label}<input data-ec-in="${name}" value="${esc(value)}" aria-invalid="${error ? 'true' : 'false'}" aria-describedby="${error ? name + '-err' : ''}">${error ? `<small id="${name}-err">${error}</small>` : ''}</label>`;
}

function checkout(state: EcomState): string {
    const math = cartMath(state);
    const co = state.co;
    const errs = {
        name: co.name.trim().length < 3 ? 'Ingresa nombre o razón social' : '',
        mail: /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(co.mail) ? '' : 'Correo no válido',
        rut: /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/.test(co.rut.trim()) ? '' : 'Formato 76.482.190-3',
        addr: co.addr.trim().length < 6 ? 'Ingresa la dirección de despacho' : '',
    };
    const show = co.tried ? errs : { name: '', mail: '', rut: '', addr: '' };
    const ships = [
        ['std', 'Estándar', '24–48 h hábiles', math.ship],
        ['exp', 'Express', 'Hoy antes de las 19:00', 9990],
        ['pick', 'Retiro en bodega', 'Quilicura · hoy', 0],
    ] as const;
    const shipCost = ships.find((row) => row[0] === co.ship)?.[3] ?? 0;
    const total = math.sub - math.off + shipCost;
    const steps = ['Datos', 'Despacho', 'Pago', 'Confirmación'];
    const payLabel = { card: 'Tarjeta', transfer: 'Transferencia', credit: 'Crédito de flota' }[co.pay];
    return `<ol class="td-ecom__steps">${steps.map((label, index) => `<li class="${index === state.step ? 'is-on' : ''} ${index < state.step ? 'is-done' : ''}"><b>${index < state.step ? '✓' : index + 1}</b>${label}</li>`).join('')}</ol>
        ${state.step === 0 ? `<div class="td-ecom__form">${field('name', 'Nombre o razón social', co.name, show.name)}${field('mail', 'Correo', co.mail, show.mail)}${field('rut', 'RUT', co.rut, show.rut)}</div>` : ''}
        ${state.step === 1 ? `<div class="td-ecom__form">${field('addr', 'Dirección de despacho', co.addr, show.addr)}<div class="td-ecom__choices">${ships.map(([key, label, hint, cost]) => `<button type="button" data-ec="ship:${key}" aria-pressed="${co.ship === key}"><b>${label}</b><span>${hint}</span><em>${cost ? money(cost) : 'Gratis'}</em></button>`).join('')}</div></div>` : ''}
        ${state.step === 2 ? `<div class="td-ecom__choices">${([['card', 'Tarjeta de crédito o débito'], ['transfer', 'Transferencia bancaria'], ['credit', 'Crédito de flota a 30 días']] as const).map(([key, label]) => `<button type="button" data-ec="pay:${key}" aria-pressed="${co.pay === key}">${label}</button>`).join('')}</div>` : ''}
        ${state.step === 3 ? `<div class="td-ecom__done"><h2>Pedido OC-2026-0${500 + math.qty}</h2><p>${ships.find((row) => row[0] === co.ship)?.[1]} · ${ships.find((row) => row[0] === co.ship)?.[2]}</p><p>${payLabel} · ${money(total)}</p><p>Te enviaremos la guía a ${esc(co.mail || 'tu correo')}.</p><button type="button" data-ec="restart">Hacer otro pedido</button></div>` : ''}
        ${state.step < 3 ? `<div class="td-ecom__nav">${state.step ? '<button type="button" data-ec="back">Volver</button>' : '<span></span>'}<button type="button" data-ec="next">${state.step === 2 ? `Pagar ${money(total)}` : 'Continuar'}</button></div>` : ''}`;
}

function facets(state: EcomState): string {
    const maxPrice = Math.max(1, ...state.parts.map((part) => part.price));
    const cap = state.f.max || maxPrice;
    const pass = (part: Part, skip?: 'brand' | 'cat') =>
        (skip === 'brand' || !state.f.brand.length || state.f.brand.includes(part.brand))
        && (skip === 'cat' || !state.f.cat.length || state.f.cat.includes(part.cat))
        && (!state.f.stock || part.stock > 0)
        && part.price <= cap;
    const facet = (key: 'brand' | 'cat', values: string[]) => values.map((value) => {
        const on = state.f[key].includes(value);
        const count = state.parts.filter((part) => part[key] === value && pass(part, key)).length;
        return `<label class="${!count && !on ? 'is-off' : ''}"><input type="checkbox" data-ec="facet:${key}:${encodeURIComponent(value)}" ${on ? 'checked' : ''} ${!count && !on ? 'disabled' : ''}>${esc(value)} <em>${count}</em></label>`;
    }).join('');
    const brands = [...new Set(state.parts.map((part) => part.brand))].sort();
    const cats = [...new Set(state.parts.map((part) => part.cat))];
    let results = state.parts.filter((part) => pass(part));
    results = [...results].sort(state.sort === 'lo' ? (a, b) => a.price - b.price : state.sort === 'hi' ? (a, b) => b.price - a.price : state.sort === 'rate' ? (a, b) => rating(b) - rating(a) : (a, b) => a.id - b.id);
    const chips = [
        ...state.f.brand.map((value) => ['brand', value] as const),
        ...state.f.cat.map((value) => ['cat', value] as const),
        ...(state.f.stock ? [['stock', 'Con stock'] as const] : []),
        ...(state.f.max && state.f.max < maxPrice ? [['max', `Hasta ${money(state.f.max)}`] as const] : []),
    ];
    return `<div class="td-ecom__facets">
        <aside>
            <h3>Marca</h3>${facet('brand', brands)}
            <h3>Categoría</h3>${facet('cat', cats)}
            <label class="td-ecom__switch"><input type="checkbox" data-ec="fstock" ${state.f.stock ? 'checked' : ''}>Solo con stock</label>
            <label>Hasta ${money(cap)}<input type="range" data-ec-in="max" min="20000" max="${maxPrice}" step="1000" value="${cap}"></label>
            <button type="button" data-ec="clearf">Limpiar filtros</button>
        </aside>
        <div>
            <div class="td-ecom__bar">
                <span>${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}</span>
                <label>Orden <select data-ec-ch="sort" aria-label="Orden">
                    ${([['rel', 'Relevancia'], ['lo', 'Menor precio'], ['hi', 'Mayor precio'], ['rate', 'Mejor calificados']] as const).map(([key, label]) => `<option value="${key}" ${state.sort === key ? 'selected' : ''}>${label}</option>`).join('')}
                </select></label>
            </div>
            <div class="td-ecom__chips">${chips.map(([key, label]) => `<button type="button" data-ec="chip:${key}:${encodeURIComponent(label)}">${esc(label)} · quitar</button>`).join('')}</div>
            ${results.length ? `<div class="td-ecom__grid">${results.slice(0, 9).map((part) => card(part, state)).join('')}</div>` : '<p>Ningún repuesto coincide con estos filtros. Quita uno para ver más.</p>'}
        </div>
    </div>`;
}

function search(state: EcomState): string {
    const query = norm(state.q.trim());
    const products = query.length >= 2 ? state.parts.filter((part) => norm(`${part.name} ${part.code} ${part.brand}`).includes(query)).slice(0, 5) : [];
    const cats = query.length >= 2 ? [...new Set(state.parts.filter((part) => norm(`${part.name} ${part.cat}`).includes(query)).map((part) => part.cat))].slice(0, 3) : [];
    const suggestions = query.length >= 2 ? [...new Set(state.parts.map((part) => part.name.toLowerCase()).filter((name) => norm(name).includes(query)))].slice(0, 4) : [];
    const open = state.qOpen && (query.length >= 2 || !query);
    return `<div class="td-ecom__search">
        <label>Buscar repuesto<input data-ec-in="q" value="${esc(state.q)}" placeholder="Pastilla, filtro, código…" role="combobox" aria-expanded="${open}" aria-autocomplete="list"></label>
        ${state.q ? '<button type="button" data-ec="qclear">Borrar búsqueda</button>' : ''}
        <div class="td-ecom__suggest" ${open ? '' : 'hidden'} role="listbox">
            ${!query ? state.recentQ.map((item) => `<button type="button" role="option" data-ec="qgo:${encodeURIComponent(item)}">${esc(item)}<span data-ec="qrm:${encodeURIComponent(item)}">Quitar</span></button>`).join('') : ''}
            ${suggestions.map((item) => `<button type="button" role="option" data-ec="qgo:${encodeURIComponent(item)}">${esc(item)}</button>`).join('')}
            ${cats.map((item) => `<button type="button" role="option" data-ec="qgo:${encodeURIComponent(item)}">Categoría · ${esc(item)} <em>${state.parts.filter((part) => part.cat === item).length}</em></button>`).join('')}
            ${products.map((part) => { const [label, color] = stockOf(part.stock); return `<button type="button" role="option" data-ec="qgo:${encodeURIComponent(part.name)}"><i style="background:${GRAD[part.id % GRAD.length]}"></i><span><b>${esc(part.name)}</b><small>${esc(part.code)} · ${money(sale(part))}</small></span><em style="color:${color}">${label}</em></button>`; }).join('')}
            ${query.length >= 2 && !suggestions.length && !products.length ? '<p>Sin coincidencias. Prueba con el código o la marca.</p>' : ''}
        </div>
        <div class="td-ecom__chips">${['Pastillas de freno', 'Filtro de aire', 'Amortiguador', 'Kit de embrague'].map((item) => `<button type="button" data-ec="qpop:${encodeURIComponent(item)}">${item}</button>`).join('')}</div>
    </div>`;
}

function compare(state: EcomState): string {
    const chosen = state.cmp.map((id) => byId(id, state)).filter((part): part is Part => !!part);
    const rows: [string, (part: Part) => string | number, 'min' | 'max' | ''][] = [
        ['Precio', (part) => sale(part), 'min'],
        ['Marca', (part) => part.brand, ''],
        ['Categoría', (part) => part.cat, ''],
        ['Aplicación', (part) => part.app, ''],
        ['Stock', (part) => part.stock, 'max'],
        ['Calificación', (part) => rating(part), 'max'],
        ['Garantía', (part) => (part.price > 150000 ? 12 : 6), 'max'],
        ['Despacho', (part) => (part.stock > 10 ? 'Hoy' : part.stock ? '24 h' : '—'), ''],
    ];
    const body = rows.map(([label, get, best]) => {
        const values = chosen.map(get);
        const same = values.every((value) => String(value) === String(values[0]));
        if (state.cmpDiff && same) return '';
        const numeric = values.filter((value): value is number => typeof value === 'number');
        const winner = best === 'min' ? Math.min(...numeric) : best === 'max' ? Math.max(...numeric) : null;
        return `<tr class="${same ? 'is-same' : ''}"><th>${label}</th>${values.map((value) => `<td class="${winner != null && value === winner && !same ? 'is-best' : ''}">${formatCompare(label, value)}</td>`).join('')}</tr>`;
    }).join('');
    const extras = state.parts.filter((part) => !state.cmp.includes(part.id)).slice(0, 6);
    return `<div class="td-ecom__bar"><label class="td-ecom__switch"><input type="checkbox" data-ec="diff" ${state.cmpDiff ? 'checked' : ''}>Solo diferencias</label><span>${chosen.length} de 4</span></div>
        <div class="td-ecom__cmphead">${chosen.map((part) => `<div><button type="button" data-ec="cmpx:${part.id}" aria-label="Quitar ${esc(part.name)}">Quitar</button><strong>${esc(part.name)}</strong><small>${money(sale(part))}</small></div>`).join('') || '<p>Agrega productos para comparar. El máximo es 4.</p>'}</div>
        ${chosen.length ? `<table class="td-ecom__table"><tbody>${body}</tbody></table>` : ''}
        ${state.cmp.length < 4 ? `<div class="td-ecom__chips">${extras.map((part) => `<button type="button" data-ec="cmpadd:${part.id}">${esc(part.name)}</button>`).join('')}</div>` : ''}`;
}

function formatCompare(label: string, value: string | number): string {
    if (label === 'Precio' && typeof value === 'number') return money(value);
    if (label === 'Stock') return value ? `${value} u.` : 'Agotado';
    if (label === 'Calificación' && typeof value === 'number') return `${value.toFixed(1).replace('.', ',')} / 5`;
    if (label === 'Garantía') return `${value} meses`;
    return esc(String(value));
}

function flashSale(state: EcomState): string {
    const deal = lead(state, 5);
    const left = Math.max(0, state.flashEnd - Date.now());
    const hours = String(Math.floor(left / 3.6e6)).padStart(2, '0');
    const minutes = String(Math.floor(left % 3.6e6 / 6e4)).padStart(2, '0');
    const seconds = String(Math.floor(left % 6e4 / 1000)).padStart(2, '0');
    const sold = 26 + Math.floor((Date.now() / 60000) % 8);
    return `<article class="td-ecom__flash">
        <div class="td-ecom__hero" style="background:${GRAD[2]}">Oferta relámpago</div>
        <div>
            <small>${esc(deal.brand)} · ${esc(deal.code)}</small>
            <h2>${esc(deal.name)}</h2>
            <p class="td-ecom__price"><b>${money(Math.round(deal.price * 0.75))}</b><s>${money(deal.price)}</s><em>Ahorras ${money(Math.round(deal.price * 0.25))}</em></p>
            <p class="td-ecom__clock" aria-label="Tiempo restante"><b>${hours}</b>:<b>${minutes}</b>:<b>${seconds}</b></p>
            <div class="td-ecom__ship"><span style="width:${Math.round(sold / 40 * 100)}%"></span></div>
            <p>${sold} de 40 vendidos · Quedan ${40 - sold}</p>
            <button type="button" data-ec="add:${deal.id}">Agregar al carrito</button>
        </div>
    </article>
    <div class="td-ecom__grid">${state.parts.slice(8, 12).map((part, index) => `<div>${card(part, state)}<small>${[60, 35, 80, 20][index]}% vendido</small></div>`).join('')}</div>`;
}

function reviews(state: EcomState): string {
    const hist = [5, 4, 3, 2, 1].map((stars) => REVIEWS.filter((row) => row[0] === stars).length);
    const average = REVIEWS.reduce((sum, row) => sum + row[0], 0) / REVIEWS.length;
    const list = REVIEWS.map((row, index) => ({ row, index }))
        .filter(({ row }) => !state.rf || row[0] === state.rf)
        .sort((a, b) => state.rs === 'new' ? a.row[5] - b.row[5] : state.rs === 'help' ? (b.row[4] + (state.votes[b.index] ? 1 : 0)) - (a.row[4] + (state.votes[a.index] ? 1 : 0)) : state.rs === 'hi' ? b.row[0] - a.row[0] : a.row[0] - b.row[0]);
    const error = state.rv.tried && (!state.rv.stars || state.rv.text.trim().length < 10) ? 'Elige una calificación y escribe al menos 10 caracteres' : '';
    return `<header class="td-ecom__rvhead">
        <strong>${average.toFixed(1).replace('.', ',')}</strong>
        <span class="td-ecom__stars">${stars(average)}</span>
        <p>${REVIEWS.length} reseñas verificadas · ${Math.round(REVIEWS.filter((row) => row[0] >= 4).length / REVIEWS.length * 100)}% lo recomienda</p>
    </header>
    <div class="td-ecom__hist">${hist.map((count, index) => {
        const star = 5 - index;
        return `<button type="button" data-ec="rvf:${star}" aria-pressed="${state.rf === star}">${star} estrellas <i style="width:${Math.round(count / REVIEWS.length * 100)}%"></i> ${count}</button>`;
    }).join('')}</div>
    <div class="td-ecom__seg">${([['new', 'Recientes'], ['help', 'Útiles'], ['hi', 'Mejor'], ['lo', 'Peor']] as const).map(([key, label]) => `<button type="button" data-ec="rvs:${key}" aria-pressed="${state.rs === key}">${label}</button>`).join('')}</div>
    ${state.rf ? `<p>Mostrando ${list.length} de ${state.rf} estrellas <button type="button" data-ec="rvclear">Ver todas</button></p>` : ''}
    <ul class="td-ecom__reviews">${list.map(({ row, index }) => `<li>
        <b aria-hidden="true">${row[1].split(' ').map((word) => word[0]).join('')}</b>
        <div><strong>${esc(row[1])}</strong> <small>${esc(row[2])} · ${row[5] === 2 ? 'Hace 2 días' : `Hace ${row[5]} días`}</small>
        <span class="td-ecom__stars">${stars(row[0])}</span><p>${esc(row[3])}</p>
        <button type="button" data-ec="vote:${index}" aria-pressed="${!!state.votes[index]}">Útil (${row[4] + (state.votes[index] ? 1 : 0)})</button></div>
    </li>`).join('')}</ul>
    <button type="button" data-ec="rvopen">${state.rv.open ? 'Cerrar reseña' : 'Escribir reseña'}</button>
    ${state.rv.open ? `<form class="td-ecom__form" data-ec-form="review">
        <div class="td-ecom__seg">${[1, 2, 3, 4, 5].map((star) => `<button type="button" data-ec="rvstar:${star}" aria-pressed="${state.rv.stars === star}" aria-label="${star} estrellas">${star}</button>`).join('')}</div>
        <label>Tu reseña<textarea data-ec-in="rv" maxlength="500">${esc(state.rv.text)}</textarea><small>${state.rv.text.length} / 500</small></label>
        ${error ? `<p class="td-ecom__err" role="alert">${error}</p>` : ''}
        <button type="button" data-ec="rvsend">Publicar reseña</button>
    </form>` : ''}`;
}

function finder(state: EcomState): string {
    const pf = state.pf;
    const brands = [...new Set(state.parts.map((part) => part.brand))].sort();
    const models = pf.brand ? [...new Set(state.parts.filter((part) => part.brand === pf.brand).map((part) => part.app.slice(pf.brand.length + 1)))].sort() : [];
    const years = pf.model ? ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2016'] : [];
    const systems = pf.year ? [...new Set(state.parts.filter((part) => part.app === `${pf.brand} ${pf.model}`).map((part) => part.cat))] : [];
    const ready = pf.tab === 'veh' ? !!pf.year : /^[A-Z]{4}-?\d{2}$/.test(pf.plate);
    const fit = pf.done ? state.parts.filter((part) => part.app === `${pf.brand} ${pf.model}` && (!pf.sys || part.cat === pf.sys)) : [];
    const opts = (values: string[], selected: string) => `<option value="">Elige</option>${values.map((value) => `<option ${value === selected ? 'selected' : ''}>${esc(value)}</option>`).join('')}`;
    return `<div class="td-ecom__seg">
        <button type="button" data-ec="pftab:veh" aria-pressed="${pf.tab === 'veh'}">Por vehículo</button>
        <button type="button" data-ec="pftab:plate" aria-pressed="${pf.tab === 'plate'}">Por patente</button>
    </div>
    ${pf.tab === 'veh' ? `<div class="td-ecom__form">
        <label>Marca<select data-ec-ch="brand">${opts(brands, pf.brand)}</select></label>
        <label>Modelo<select data-ec-ch="model" ${pf.brand ? '' : 'disabled'}>${opts(models, pf.model)}</select></label>
        <label>Año<select data-ec-ch="year" ${pf.model ? '' : 'disabled'}>${opts(years, pf.year)}</select></label>
        <label>Sistema<select data-ec-ch="sys" ${pf.year ? '' : 'disabled'}>${opts(systems, pf.sys)}</select></label>
    </div>` : `<label>Patente<input data-ec-in="plate" value="${esc(pf.plate)}" placeholder="ABCD-12" maxlength="8" aria-label="Patente"></label>`}
    <div class="td-ecom__nav"><button type="button" data-ec="pfgo" ${ready ? '' : 'disabled'}>Buscar compatibles</button><button type="button" data-ec="pfreset">Limpiar</button></div>
    ${pf.done ? `<h3>${esc(pf.brand)} ${esc(pf.model)} ${esc(pf.year)} · ${fit.length} ${fit.length === 1 ? 'repuesto compatible' : 'repuestos compatibles'}</h3>${fit.length ? `<div class="td-ecom__grid">${fit.map((part) => card(part, state)).join('')}</div>` : '<p>No hay repuestos para ese sistema. Prueba otro o limpia el sistema.</p>'}` : ''}`;
}

function quote(state: EcomState): string {
    const lines = state.quote.map((line) => ({ line, part: byId(line.id, state) })).filter((row) => row.part);
    const units = lines.reduce((sum, row) => sum + row.line.qty, 0);
    const extras = state.parts.filter((part) => !state.quote.some((line) => line.id === part.id)).slice(0, 6);
    if (state.quoteSent) {
        return `<div class="td-ecom__done"><h2>Cotización enviada</h2><p>${units} unidades · ${lines.length} productos. Un asesor responderá en horario hábil.</p><button type="button" data-ec="qnew">Nueva cotización</button></div>`;
    }
    return `<p>${units} unidades · ${lines.length} productos</p>
        ${lines.length ? `<ul class="td-ecom__lines">${lines.map(({ line, part }) => `<li><b>${esc(part!.name)}</b><small>${esc(part!.code)}</small>
            <div class="td-ecom__qty"><button type="button" data-ec="qq:${line.id}:-1">−</button><span>${line.qty}</span><button type="button" data-ec="qq:${line.id}:1">+</button></div>
            <button type="button" data-ec="qqrm:${line.id}">Quitar</button></li>`).join('')}</ul>` : '<p>Agrega al menos un producto para cotizar.</p>'}
        <div class="td-ecom__chips">${extras.map((part) => `<button type="button" data-ec="qadd:${part.id}">${esc(part.name)}</button>`).join('')}</div>
        <label>Notas para el asesor<textarea data-ec-in="qnote">${esc(state.quoteNote)}</textarea></label>
        <button type="button" data-ec="qsend">Enviar cotización</button>`;
}

function bulk(state: EcomState): string {
    const rows = state.bulkRows ?? [];
    const ok = rows.filter((row) => row.ok).length;
    return `<p>Pega código y cantidad, uno por línea. Ejemplo: BR-4521-AD, 2</p>
        <textarea data-ec-in="bulk" rows="6">${esc(state.bulkText)}</textarea>
        <div class="td-ecom__nav"><button type="button" data-ec="bulksample">Cargar ejemplo</button><button type="button" data-ec="bulkparse">Validar líneas</button></div>
        ${state.bulkRows ? `<p>${ok} válidas${rows.length - ok ? ` · ${rows.length - ok} con error` : ''}</p><ul class="td-ecom__lines">${rows.map((row) => `<li><b>${row.ok ? '✓' : '✕'} ${esc(row.code)}</b><span>${esc(row.name)}</span><em>${row.qty}</em></li>`).join('')}</ul><button type="button" data-ec="bulkok" ${ok ? '' : 'disabled'}>Agregar ${ok} al carrito</button>` : ''}`;
}

function recent(state: EcomState): string {
    const items = state.recent.map((id) => byId(id, state)).filter((part): part is Part => !!part);
    return `<div class="td-ecom__bar"><span>${items.length} vistos</span><button type="button" data-ec="recentclear" ${items.length ? '' : 'disabled'}>Vaciar historial</button></div>
        ${items.length ? `<div class="td-ecom__grid">${items.map((part) => `<div>${card(part, state)}<button type="button" data-ec="recentx:${part.id}">Quitar del historial</button></div>`).join('')}</div>` : '<p>Todavía no hay productos vistos.</p>'}`;
}

function stockAlert(state: EcomState): string {
    const items = state.parts.filter((part) => part.stock === 0).slice(0, 6);
    return `<ul class="td-ecom__lines">${items.map((part) => {
        const on = !!state.stockSubs[part.id];
        return `<li><i style="background:${GRAD[part.id % GRAD.length]}"></i><div><b>${esc(part.name)}</b><small>${esc(part.code)} · Agotado</small></div><button type="button" data-ec="sub:${part.id}" aria-pressed="${on}">${on ? 'Te avisaremos' : 'Avisarme'}</button></li>`;
    }).join('')}</ul>`;
}

function wishlists(state: EcomState): string {
    const extras = state.parts.filter((part) => !state.lists.some((list) => list.items.includes(part.id))).slice(0, 4);
    return `<form class="td-ecom__nav"><input data-ec-in="list" value="${esc(state.newList)}" placeholder="Nombre de la lista" aria-label="Nombre de la lista"><button type="button" data-ec="listadd">Crear lista</button></form>
        <div class="td-ecom__lists">${state.lists.map((list) => `<section><header><h3>${esc(list.name)}</h3><span>${list.items.length} ${list.items.length === 1 ? 'producto' : 'productos'}</span><button type="button" data-ec="listdel:${list.id}">Eliminar lista</button></header>
            ${list.items.length ? `<ul>${list.items.map((id) => byId(id, state)).filter((part): part is Part => !!part).map((part) => `<li><b>${esc(part.name)}</b><small>${money(part.price)}</small>
                <select data-ec-ch="move:${list.id}:${part.id}" aria-label="Mover ${esc(part.name)}"><option value="">Mover a…</option>${state.lists.filter((other) => other.id !== list.id).map((other) => `<option value="${other.id}">${esc(other.name)}</option>`).join('')}</select>
                <button type="button" data-ec="listrm:${list.id}:${part.id}">Quitar</button></li>`).join('')}</ul>` : '<p>Esta lista está vacía.</p>'}
        </section>`).join('')}</div>
        <div class="td-ecom__chips">${extras.map((part) => `<button type="button" data-ec="listitem:${part.id}">${esc(part.name)}</button>`).join('')}</div>`;
}

function track(state: EcomState): string {
    const steps = ['Pedido recibido', 'Preparando', 'Despachado', 'En ruta', 'Entregado'];
    const current = 2;
    const lines = state.parts.slice(0, 2);
    const rows = lines.length ? lines : [lead(state, 0)];
    return `<header><h2>OC-2026-00481</h2><p>Guía GD-88213-CL · Entrega estimada 23 de septiembre, entre 12 y 14 h</p></header>
        <ol class="td-ecom__steps">${steps.map((label, index) => `<li class="${index === current ? 'is-on' : ''} ${index < current ? 'is-done' : ''}"><b>${index < current ? '✓' : index + 1}</b>${label}</li>`).join('')}</ol>
        <ul class="td-ecom__lines">${rows.map((part) => `<li><b>${esc(part.name)}</b><small>${esc(part.code)}</small></li>`).join('')}</ul>`;
}

function bundle(state: EcomState): string {
    const main = lead(state, 0);
    const items = [main, ...state.parts.filter((part) => part.id !== main.id).slice(1, 3)];
    const on = (id: number) => state.fbtOff[id] !== false;
    const chosen = items.filter((part) => on(part.id));
    return `<h2>Comprados juntos</h2><div class="td-ecom__bundle">${items.map((part) => `<label><input type="checkbox" data-ec="fbt:${part.id}" ${on(part.id) ? 'checked' : ''} ${part.id === main.id ? 'disabled' : ''}><i style="background:${GRAD[part.id % GRAD.length]}"></i><b>${esc(part.name)}</b><span>${money(part.price)}</span></label>`).join('')}</div>
        <p>Combo ${chosen.length} productos · <b>${money(chosen.reduce((sum, part) => sum + part.price, 0))}</b></p>
        <button type="button" data-ec="fbtadd">Agregar combo al carrito</button>`;
}

function locator(state: EcomState): string {
    const stores: [string, string, string, number][] = [
        ['Quilicura', 'Av. Américo Vespucio 1501', 'Lun–Vie 08:00–19:00 · Sáb 09:00–14:00', 42],
        ['Concepción', 'Camino a Penco 2200', 'Lun–Vie 08:30–18:30', 8],
        ['Antofagasta', 'Av. Balmaceda 1890', 'Lun–Vie 08:00–18:00', 0],
        ['Puerto Montt', 'Ruta 5 Sur km 1020', 'Lun–Vie 08:30–18:00', 15],
    ];
    const query = state.storeQ.toLowerCase();
    const list = stores.filter(([name]) => !query || name.toLowerCase().includes(query));
    return `<label>Sucursal o ciudad<input data-ec-in="store" value="${esc(state.storeQ)}" placeholder="Quilicura, Sur…"></label>
        <ul class="td-ecom__lines">${list.map(([name, address, hours, stock]) => {
            const [label, color] = stockOf(stock);
            return `<li><div><b>${name}</b><small>${address}</small><small>${hours}</small></div><span style="color:${color}">${label}</span></li>`;
        }).join('') || '<li>Ninguna sucursal coincide. Prueba con otra ciudad.</li>'}</ul>`;
}

function credit(state: EcomState): string {
    const invoices: [string, string, number][] = [['F-88213', '22/09/2026', 412970], ['F-88190', '15/09/2026', 1204300], ['F-88055', '02/09/2026', 238980]];
    return `<div class="td-ecom__kpis"><div><span>Línea</span><b>${money(15000000)}</b></div><div><span>Usado</span><b>${money(9200000)}</b></div><div><span>Disponible</span><b>${money(5800000)}</b></div></div>
        <div class="td-ecom__ship" aria-label="61% de la línea usada"><span style="width:61%"></span></div>
        <ul class="td-ecom__lines">${invoices.map(([number, date, amount]) => {
            const paid = state.paid.includes(number);
            return `<li><div><b>${number}</b><small>${date}</small></div><b>${money(amount)}</b>${paid ? '<span style="color:var(--td-color-success)">Pagada</span>' : `<button type="button" data-ec="payinv:${number}">Pagar ${money(amount)}</button>`}</li>`;
        }).join('')}</ul>`;
}

function returns(state: EcomState): string {
    const items = [lead(state, 0), lead(state, 3)];
    const reasons = ['Producto defectuoso', 'No es compatible con mi vehículo', 'Llegó el repuesto equivocado', 'Ya no lo necesito'];
    const methods: ['refund' | 'credit' | 'exchange', string][] = [['refund', 'Reembolso al medio de pago original'], ['credit', 'Nota de crédito'], ['exchange', 'Cambio por otro producto']];
    const error = state.rma.tried ? (state.rmaStep === 0 && !state.rma.item ? 'Elige un producto' : state.rmaStep === 1 && !state.rma.reason ? 'Elige un motivo' : '') : '';
    const steps = ['Producto', 'Motivo', 'Método', 'Listo'];
    if (state.rmaStep === 3) {
        return `<div class="td-ecom__done"><h2>Solicitud RMA-2026-0091</h2><p>Recibimos la devolución. Te escribiremos con la guía de retiro.</p><button type="button" data-ec="rmarestart">Nueva devolución</button></div>`;
    }
    return `<ol class="td-ecom__steps">${steps.map((label, index) => `<li class="${index === state.rmaStep ? 'is-on' : ''}"><b>${index + 1}</b>${label}</li>`).join('')}</ol>
        ${state.rmaStep === 0 ? `<div class="td-ecom__choices">${items.map((part) => `<button type="button" data-ec="rmaitem:${part.id}" aria-pressed="${state.rma.item === part.id}"><b>${esc(part.name)}</b><span>${esc(part.code)}</span></button>`).join('')}</div>` : ''}
        ${state.rmaStep === 1 ? `<div class="td-ecom__choices">${reasons.map((reason) => `<button type="button" data-ec="rmareason:${encodeURIComponent(reason)}" aria-pressed="${state.rma.reason === reason}">${reason}</button>`).join('')}</div>` : ''}
        ${state.rmaStep === 2 ? `<div class="td-ecom__choices">${methods.map(([key, label]) => `<button type="button" data-ec="rmamethod:${key}" aria-pressed="${state.rma.method === key}">${label}</button>`).join('')}</div>` : ''}
        ${error ? `<p class="td-ecom__err" role="alert">${error}</p>` : ''}
        <div class="td-ecom__nav">${state.rmaStep ? '<button type="button" data-ec="rmaback">Volver</button>' : '<span></span>'}<button type="button" data-ec="rmanext">${state.rmaStep === 2 ? 'Enviar solicitud' : 'Continuar'}</button></div>`;
}

function paint(host: HTMLElement): void {
    const state = states.get(host);
    if (!state) return;
    const active = document.activeElement;
    const mark = active instanceof HTMLElement && host.contains(active) ? active.getAttribute('data-ec-in') || active.getAttribute('data-ec-ch') : null;
    const pos = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement ? active.selectionStart : null;
    host.innerHTML = shell(host.dataset.kind || 'ecard', state);
    if (!mark) return;
    const next = host.querySelector(`[data-ec-in="${CSS.escape(mark)}"], [data-ec-ch="${CSS.escape(mark)}"]`);
    if (!(next instanceof HTMLElement)) return;
    next.focus();
    if ((next instanceof HTMLInputElement || next instanceof HTMLTextAreaElement) && pos != null && next.type !== 'checkbox' && next.type !== 'range') {
        next.setSelectionRange(pos, pos);
    }
}

function say(host: HTMLElement, message: string): void {
    const state = states.get(host);
    if (!state) return;
    state.msg = message;
    window.clearTimeout(state.timer);
    paint(host);
    state.timer = window.setTimeout(() => {
        state.msg = '';
        if (host.isConnected) paint(host);
    }, 2800);
}

function act(host: HTMLElement, action: string, event?: Event): void {
    const state = states.get(host);
    if (!state) return;
    const [name, a = '', b = ''] = action.split(':');
    const id = Number(a);
    const part = byId(id, state);
    if (name === 'layout' && (a === 'grid' || a === 'list')) state.layout = a;
    else if (name === 'wish' && part) {
        state.wish = state.wish.includes(id) ? state.wish.filter((item) => item !== id) : [...state.wish, id];
        say(host, state.wish.includes(id) ? 'Guardado en favoritos' : 'Quitado de favoritos');
        return;
    } else if (name === 'cmp' && part) {
        if (!state.cmp.includes(id) && state.cmp.length >= 4) { say(host, 'Máximo 4 productos para comparar'); return; }
        state.cmp = state.cmp.includes(id) ? state.cmp.filter((item) => item !== id) : [...state.cmp, id];
    } else if (name === 'cmpx') state.cmp = state.cmp.filter((item) => item !== id);
    else if (name === 'cmpadd' && part) {
        if (state.cmp.length >= 4) { say(host, 'Máximo 4 productos para comparar'); return; }
        state.cmp = [...state.cmp, id];
    } else if ((name === 'add' || name === 'addpd') && (name === 'addpd' || part)) {
        const target = name === 'addpd' ? lead(state, 0) : part;
        const qty = name === 'addpd' ? state.pv.qty : 1;
        if (!target || target.stock === 0) return;
        const current = state.cart.find((line) => line.id === target.id);
        state.cart = current
            ? state.cart.map((line) => line.id === target.id ? { ...line, qty: Math.min(target.stock, line.qty + qty) } : line)
            : [...state.cart, { id: target.id, qty }];
        if (host.dataset.kind === 'ecart') state.drawer = true;
        say(host, `${target.name} agregado al carrito`);
        return;
    } else if (name === 'buy') {
        const target = lead(state, 0);
        const current = state.cart.find((line) => line.id === target.id);
        state.cart = current ? state.cart.map((line) => line.id === target.id ? { ...line, qty: Math.min(target.stock, line.qty + state.pv.qty) } : line) : [...state.cart, { id: target.id, qty: state.pv.qty }];
        say(host, 'Listo para pagar. Revisa el checkout.');
        return;
    } else if (name === 'drawer') state.drawer = !state.drawer;
    else if (name === 'line') {
        const delta = Number(b);
        const item = byId(id, state);
        state.cart = state.cart.map((line) => line.id === id ? { ...line, qty: Math.max(1, Math.min(item?.stock ?? 99, line.qty + delta)) } : line);
    } else if (name === 'rm' && part) {
        state.cart = state.cart.filter((line) => line.id !== id);
        say(host, `${part.name} quitado`);
        return;
    } else if (name === 'coupon') {
        if (state.coupon.trim() === 'FLOTA10') { state.couponOk = true; say(host, 'Cupón FLOTA10 aplicado · 10% de descuento'); }
        else { state.couponOk = false; say(host, 'Cupón no válido · prueba FLOTA10'); }
        return;
    } else if (name === 'go-check') say(host, 'Continúa en Checkout para pagar el pedido.');
    else if (name === 'pd') state.pv = { ...state.pv, qty: Math.max(1, Math.min(99, state.pv.qty + Number(a))) };
    else if (name === 'side' && (a === 'del' || a === 'tra')) state.pv = { ...state.pv, side: a };
    else if (name === 'qual' && (a === 'orig' || a === 'alt' || a === 'eco')) state.pv = { ...state.pv, q: a };
    else if (name === 'img') state.pv = { ...state.pv, img: Number(a) };
    else if (name === 'next' || name === 'back' || name === 'restart') checkoutAct(host, state, name);
    else if (name === 'ship' && (a === 'std' || a === 'exp' || a === 'pick')) state.co = { ...state.co, ship: a };
    else if (name === 'pay' && (a === 'card' || a === 'transfer' || a === 'credit')) state.co = { ...state.co, pay: a };
    else if (name === 'facet') toggleFacet(state, a as 'brand' | 'cat', decodeURIComponent(b));
    else if (name === 'chip') removeChip(state, a, decodeURIComponent(action.split(':').slice(2).join(':')));
    else if (name === 'clearf') state.f = { brand: [], cat: [], stock: false, max: 0 };
    else if (name === 'qclear') { state.q = ''; state.qOpen = true; }
    else if (name === 'qgo') { const text = decodeURIComponent(a); state.recentQ = [text.toLowerCase(), ...state.recentQ.filter((item) => item !== text.toLowerCase())].slice(0, 5); state.q = text; state.qOpen = false; say(host, `Buscar: “${text}”`); return; }
    else if (name === 'qrm') { event?.stopPropagation(); state.recentQ = state.recentQ.filter((item) => item !== decodeURIComponent(a)); }
    else if (name === 'qpop') { state.q = decodeURIComponent(a); state.qOpen = true; }
    else if (name === 'rvf') state.rf = state.rf === id ? 0 : id;
    else if (name === 'rvs' && (a === 'new' || a === 'help' || a === 'hi' || a === 'lo')) state.rs = a;
    else if (name === 'rvclear') state.rf = 0;
    else if (name === 'vote') state.votes = { ...state.votes, [id]: !state.votes[id] };
    else if (name === 'rvopen') state.rv = { ...state.rv, open: !state.rv.open };
    else if (name === 'rvstar') state.rv = { ...state.rv, stars: id };
    else if (name === 'rvsend') {
        if (!state.rv.stars || state.rv.text.trim().length < 10) { state.rv = { ...state.rv, tried: true }; paint(host); return; }
        state.rv = { open: false, stars: 0, text: '', tried: false };
        say(host, 'Gracias. Tu reseña se publicará tras moderación');
        return;
    } else if (name === 'pftab' && (a === 'veh' || a === 'plate')) state.pf = { ...state.pf, tab: a, done: false };
    else if (name === 'pfgo') finderGo(host, state);
    else if (name === 'pfreset') state.pf = { ...state.pf, brand: '', model: '', year: '', sys: '', plate: '', done: false };
    else if (name === 'qadd' && part) state.quote = [...state.quote, { id, qty: 10 }];
    else if (name === 'qq') state.quote = state.quote.map((line) => line.id === id ? { ...line, qty: Math.max(1, line.qty + Number(b)) } : line);
    else if (name === 'qqrm') state.quote = state.quote.filter((line) => line.id !== id);
    else if (name === 'qsend') {
        if (!state.quote.length) { say(host, 'Agrega al menos un producto'); return; }
        state.quoteSent = true;
    } else if (name === 'qnew') { state.quote = []; state.quoteNote = ''; state.quoteSent = false; }
    else if (name === 'bulksample') state.bulkText = state.parts.slice(0, 4).map((item, index) => `${item.code}, ${index + 2}`).join('\n');
    else if (name === 'bulkparse') state.bulkRows = parseBulk(state.bulkText, state);
    else if (name === 'bulkok') {
        const ok = (state.bulkRows ?? []).filter((row) => row.ok);
        if (!ok.length) return;
        ok.forEach((row) => {
            const item = state.parts.find((part) => part.code === row.code);
            if (!item) return;
            const current = state.cart.find((line) => line.id === item.id);
            state.cart = current ? state.cart.map((line) => line.id === item.id ? { ...line, qty: line.qty + row.qty } : line) : [...state.cart, { id: item.id, qty: row.qty }];
        });
        state.bulkRows = null;
        state.bulkText = '';
        say(host, `${ok.length} productos agregados al carrito`);
        return;
    } else if (name === 'recentx') state.recent = state.recent.filter((item) => item !== id);
    else if (name === 'recentclear') state.recent = [];
    else if (name === 'sub') state.stockSubs = { ...state.stockSubs, [id]: !state.stockSubs[id] };
    else if (name === 'listadd') {
        const title = state.newList.trim();
        if (!title) return;
        state.lists = [...state.lists, { id: `l${Date.now()}`, name: title, items: [] }];
        state.newList = '';
    } else if (name === 'listdel') state.lists = state.lists.filter((list) => list.id !== a);
    else if (name === 'listrm') state.lists = state.lists.map((list) => list.id === a ? { ...list, items: list.items.filter((item) => item !== Number(b)) } : list);
    else if (name === 'listitem' && part && state.lists[0]) state.lists = state.lists.map((list, index) => index === 0 ? { ...list, items: [...list.items, id] } : list);
    else if (name === 'fbt') state.fbtOff = { ...state.fbtOff, [id]: state.fbtOff[id] === false };
    else if (name === 'fbtadd') {
        const main = lead(state, 0);
        const items = [main, ...state.parts.filter((item) => item.id !== main.id).slice(1, 3)].filter((item) => state.fbtOff[item.id] !== false);
        say(host, `Combo agregado al carrito · ${items.length} productos`);
        return;
    } else if (name === 'payinv') { state.paid = [...state.paid, a]; say(host, `${a} pagada`); return; }
    else if (name === 'rmaitem') state.rma = { ...state.rma, item: id };
    else if (name === 'rmareason') state.rma = { ...state.rma, reason: decodeURIComponent(a) };
    else if (name === 'rmamethod' && (a === 'refund' || a === 'credit' || a === 'exchange')) state.rma = { ...state.rma, method: a };
    else if (name === 'rmanext' || name === 'rmaback' || name === 'rmarestart') rmaAct(state, name);
    paint(host);
}

function checkoutAct(host: HTMLElement, state: EcomState, name: string): void {
    if (name === 'restart') {
        state.step = 0;
        state.co = { name: '', mail: '', rut: '', addr: '', ship: 'std', pay: 'card', tried: false };
        return;
    }
    if (name === 'back') { state.step = Math.max(0, state.step - 1); return; }
    const co = state.co;
    const errs = [
        co.name.trim().length < 3 || !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(co.mail) || !/^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/.test(co.rut.trim()),
        co.addr.trim().length < 6,
        false,
    ];
    if (errs[state.step]) { state.co = { ...co, tried: true }; return; }
    state.step += 1;
    state.co = { ...co, tried: false };
    void host;
}

function toggleFacet(state: EcomState, key: 'brand' | 'cat', value: string): void {
    const list = state.f[key];
    state.f = { ...state.f, [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value] };
}

function removeChip(state: EcomState, key: string, label: string): void {
    if (key === 'brand' || key === 'cat') state.f = { ...state.f, [key]: state.f[key].filter((item) => item !== label) };
    else if (key === 'stock') state.f = { ...state.f, stock: false };
    else state.f = { ...state.f, max: 0 };
}

function applyProducts(state: EcomState, raw: string): void {
    state.source = raw;
    if (!raw) return;
    try {
        const parsed = JSON.parse(raw) as { id?: number; code?: string; name?: string; brand?: string; price?: number; stock?: number; category?: string; fit?: string }[];
        if (!Array.isArray(parsed)) return;
        state.parts = parsed.filter((item) => item.code && item.name).map((item, index) => ({
            id: Number(item.id) || index + 1,
            code: String(item.code),
            name: String(item.name),
            brand: item.brand || '',
            app: item.fit || '',
            cat: item.category || '',
            stock: Number(item.stock) || 0,
            price: Number(item.price) || 0,
        }));
        state.cart = [];
        state.wish = [];
        state.cmp = [];
        state.quote = [];
        state.recent = [];
        state.lists = [];
    } catch {
        /* Sin catálogo válido queda la tienda de demostración. */
    }
}

function finderGo(host: HTMLElement, state: EcomState): void {
    if (!state.parts.length) { say(host, 'No hay productos'); return; }
    if (state.pf.tab === 'plate') {
        if (!/^[A-Z]{4}-?\d{2}$/.test(state.pf.plate)) { say(host, 'Patente con formato ABCD-12'); return; }
        const part = state.parts[state.pf.plate.charCodeAt(0) % state.parts.length];
        const [brand, ...rest] = part.app.split(' ');
        state.pf = { ...state.pf, brand, model: rest.join(' '), year: '2021', sys: '', done: true };
        paint(host);
        return;
    }
    if (state.pf.year) state.pf = { ...state.pf, done: true };
}

function parseBulk(text: string, state: EcomState): BulkRow[] {
    return text.split(/\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
        const cells = line.split(/[,;\t]|\s{2,}/).map((cell) => cell.trim()).filter(Boolean);
        const code = (cells[0] || '').toUpperCase();
        const qty = Number(cells[1]) || 1;
        const part = state.parts.find((item) => item.code === code);
        return { code, qty, ok: !!part, name: part ? part.name : 'No encontrado' };
    });
}

function rmaAct(state: EcomState, name: string): void {
    if (name === 'rmarestart') { state.rmaStep = 0; state.rma = { item: null, reason: '', method: 'refund', tried: false }; return; }
    if (name === 'rmaback') { state.rmaStep = Math.max(0, state.rmaStep - 1); return; }
    const error = state.rmaStep === 0 ? !state.rma.item : state.rmaStep === 1 ? !state.rma.reason : false;
    if (error) { state.rma = { ...state.rma, tried: true }; return; }
    state.rmaStep += 1;
    state.rma = { ...state.rma, tried: false };
}

function onInput(host: HTMLElement, target: EventTarget | null): void {
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;
    const state = states.get(host);
    if (!state) return;
    const key = target.getAttribute('data-ec-in') || target.getAttribute('data-ec-ch');
    if (!key) return;
    if (key === 'coupon') state.coupon = target.value.toUpperCase();
    else if (key === 'name') state.co = { ...state.co, name: target.value };
    else if (key === 'mail') state.co = { ...state.co, mail: target.value };
    else if (key === 'rut') state.co = { ...state.co, rut: target.value };
    else if (key === 'addr') state.co = { ...state.co, addr: target.value };
    else if (key === 'pd') state.pv = { ...state.pv, qty: Math.max(1, Math.min(99, Number(target.value) || 1)) };
    else if (key === 'max') state.f = { ...state.f, max: Number(target.value) };
    else if (key === 'q') { state.q = target.value; state.qOpen = true; state.qHi = -1; }
    else if (key === 'rv') state.rv = { ...state.rv, text: target.value };
    else if (key === 'plate') state.pf = { ...state.pf, plate: target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 8), done: false };
    else if (key === 'qnote') state.quoteNote = target.value;
    else if (key === 'bulk') { state.bulkText = target.value; state.bulkRows = null; }
    else if (key === 'list') state.newList = target.value;
    else if (key === 'store') state.storeQ = target.value;
    else if (key === 'sort' && (target.value === 'rel' || target.value === 'lo' || target.value === 'hi' || target.value === 'rate')) state.sort = target.value;
    else if (key === 'brand') state.pf = { ...state.pf, brand: target.value, model: '', year: '', sys: '', done: false };
    else if (key === 'model') state.pf = { ...state.pf, model: target.value, year: '', sys: '', done: false };
    else if (key === 'year') state.pf = { ...state.pf, year: target.value, sys: '', done: false };
    else if (key === 'sys') state.pf = { ...state.pf, sys: target.value, done: false };
    else if (key.startsWith('move:')) {
        const [, from, part] = key.split(':');
        const to = target.value;
        if (to) {
            const partId = Number(part);
            state.lists = state.lists.map((list) => list.id === from ? { ...list, items: list.items.filter((item) => item !== partId) } : list.id === to ? { ...list, items: [...list.items, partId] } : list);
        }
    }
    if (key !== 'coupon') paint(host);
}

function armFlash(host: HTMLElement): void {
    if (host.dataset.kind !== 'eflash' || flashing.has(host)) return;
    flashing.add(host);
    window.setInterval(() => {
        if (host.isConnected && host.dataset.kind === 'eflash') paint(host);
    }, 1000);
}

export function bindEcom(root: ParentNode = document): void {
    root.querySelectorAll<HTMLElement>('td-ecom').forEach((host) => {
        const kind = host.dataset.kind || 'ecard';
        const source = host.dataset.products || '';
        const current = states.get(host);
        if (current) {
            if (current.kind !== kind || host.childElementCount === 0 || current.source !== source) {
                const next = fresh(kind);
                applyProducts(next, source);
                states.set(host, next);
                paint(host);
                armFlash(host);
            }
            return;
        }
        const state = fresh(kind);
        applyProducts(state, source);
        states.set(host, state);
        host.addEventListener('click', (event) => {
            const target = event.target instanceof Element ? event.target.closest('[data-ec]') : null;
            if (!(target instanceof HTMLElement)) return;
            if (target instanceof HTMLInputElement) return;
            act(host, target.dataset.ec || '', event);
        });
        host.addEventListener('change', (event) => {
            const target = event.target;
            if (target instanceof HTMLInputElement && target.dataset.ec === 'fstock') {
                const current = states.get(host);
                if (current) current.f = { ...current.f, stock: target.checked };
                paint(host);
                return;
            }
            if (target instanceof HTMLInputElement && target.dataset.ec === 'diff') {
                const current = states.get(host);
                if (current) current.cmpDiff = target.checked;
                paint(host);
                return;
            }
            if (target instanceof HTMLInputElement && target.dataset.ec?.startsWith('facet:')) {
                const [, key, value] = target.dataset.ec.split(':');
                const current = states.get(host);
                if (current && (key === 'brand' || key === 'cat')) toggleFacet(current, key, decodeURIComponent(value));
                paint(host);
                return;
            }
            if (target instanceof HTMLInputElement && target.dataset.ec?.startsWith('fbt:')) {
                const current = states.get(host);
                const id = Number(target.dataset.ec.split(':')[1]);
                if (current) current.fbtOff = { ...current.fbtOff, [id]: !target.checked };
                paint(host);
                return;
            }
            onInput(host, event.target);
        });
        host.addEventListener('input', (event) => {
            const target = event.target;
            if (target instanceof HTMLSelectElement) return;
            onInput(host, target);
        });
        paint(host);
        armFlash(host);
    });
}
