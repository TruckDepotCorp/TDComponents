interface PartRow {
    code: string;
    name: string;
    brand: string;
    stock: number;
    price: number;
}

const COMMANDS = ['help', 'stock', 'buscar', 'pedido', 'imprimir', 'date', 'echo', 'clear'];
const orgHosts = new WeakSet<HTMLElement>();

export function bindExtra(root: ParentNode = document): void {
    root.querySelectorAll<HTMLElement>('td-aos').forEach((host) => {
        if (host.dataset.bound === 'true' || typeof IntersectionObserver === 'undefined') {
            return;
        }
        host.dataset.bound = 'true';
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            host.dataset.visible = 'true';
            return;
        }
        const box = host.closest('[data-td-aos-box]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    host.dataset.visible = 'true';
                    if (host.dataset.once !== 'false') {
                        observer.unobserve(host);
                    }
                } else if (host.dataset.once === 'false') {
                    delete host.dataset.visible;
                }
            });
        }, { root: box instanceof HTMLElement ? box : null, threshold: Number(host.dataset.threshold ?? 0.25) });
        observer.observe(host);
    });

    root.querySelectorAll<HTMLElement>('td-terminal').forEach((host) => {
        if (host.dataset.bound === 'true') {
            return;
        }
        host.dataset.bound = 'true';
        const input = host.querySelector<HTMLInputElement>('[data-td-term-in]');
        const out = host.querySelector<HTMLElement>('[data-td-term-out]');
        const prompt = host.dataset.prompt ?? 'td@taller:~$';
        let parts: PartRow[] = [];
        try {
            parts = JSON.parse(host.querySelector('[data-td-term-parts]')?.textContent || '[]') as PartRow[];
        } catch {
            parts = [];
        }
        const history: string[] = [];
        let cursor = -1;
        const write = (text: string, tone = '') => {
            const line = document.createElement('p');
            line.dataset.tdTermLine = '';
            if (tone) {
                line.dataset.tone = tone;
            }
            line.textContent = text;
            out?.append(line);
            if (out) {
                out.scrollTop = out.scrollHeight;
            }
        };
        const run = (raw: string) => {
            const line = raw.trim();
            if (!line) {
                return;
            }
            const [cmd, ...args] = line.split(/\s+/);
            const arg = args.join(' ');
            const name = cmd.toLowerCase();
            history.unshift(line);
            cursor = -1;
            if (name === 'clear') {
                out?.replaceChildren();
                if (input) {
                    input.value = '';
                }
                return;
            }
            write(`${prompt} ${line}`, 'cmd');
            if (name === 'help') {
                [['help', 'lista de comandos'], ['stock <código>', 'stock y precio de un repuesto'], ['buscar <texto>', 'busca en el catálogo'], ['pedido <número>', 'estado de un pedido'], ['imprimir <código> [copias]', 'envía etiqueta a la impresora predeterminada'], ['date', 'fecha y hora'], ['echo <texto>', 'repite el texto'], ['clear', 'limpia la pantalla']]
                    .forEach(([command, help]) => write(`${command.padEnd(28, ' ')}${help}`));
            } else if (name === 'date') {
                write(new Date().toLocaleString('es-CL'));
            } else if (name === 'echo') {
                write(arg);
            } else if (name === 'stock') {
                const part = parts.find((item) => item.code.toLowerCase() === arg.toLowerCase());
                if (!arg) {
                    write('uso: stock <código>', 'warn');
                } else if (!part) {
                    write(`No existe el código ${arg.toUpperCase()}`, 'bad');
                } else {
                    write(`${part.code}  ${part.name}`);
                    write(`stock ${part.stock} u. · $${part.price.toLocaleString('es-CL')} · ${part.brand}`, part.stock === 0 ? 'bad' : part.stock <= 10 ? 'warn' : 'ok');
                }
            } else if (name === 'buscar') {
                if (!arg) {
                    write('uso: buscar <texto>', 'warn');
                } else {
                    const found = parts.filter((item) => `${item.name} ${item.code} ${item.brand}`.toLowerCase().includes(arg.toLowerCase()));
                    if (!found.length) {
                        write(`Sin resultados para "${arg}"`, 'warn');
                    }
                    found.slice(0, 6).forEach((item) => write(`${item.code.padEnd(14, ' ')}${item.name.slice(0, 34).padEnd(36, ' ')}$${item.price.toLocaleString('es-CL')}`));
                    if (found.length > 6) {
                        write(`… y ${found.length - 6} más`, 'muted');
                    }
                }
            } else if (name === 'pedido') {
                const digits = arg.replace(/\D/g, '');
                if (!digits) {
                    write('uso: pedido <número>', 'warn');
                } else {
                    const states = ['Recibido', 'Preparando', 'En ruta', 'Entregado'];
                    write(`OC-${digits.padStart(5, '0')} · ${states[Number(digits) % 4]} · Transportes del Sur`, 'ok');
                }
            } else if (name === 'imprimir') {
                const [code, copies] = args;
                if (!code) {
                    write('uso: imprimir <código> [copias]', 'warn');
                } else {
                    const count = Math.max(1, Number.parseInt(copies || '1', 10) || 1);
                    write(`→ Zebra ZD421 · ^XA^FD${code.toUpperCase()}^FS^PQ${count}^XZ`, 'print');
                    write(`Trabajo enviado · ${count} ${count === 1 ? 'etiqueta' : 'etiquetas'}`, 'ok');
                }
            } else {
                write(`${cmd}: comando no encontrado. Escribe help.`, 'bad');
            }
            if (input) {
                input.value = '';
            }
        };
        host.querySelector('[data-td-term-form]')?.addEventListener('submit', (event) => {
            event.preventDefault();
            run(input?.value ?? '');
        });
        input?.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                event.preventDefault();
                cursor = Math.max(-1, Math.min(history.length - 1, cursor + (event.key === 'ArrowUp' ? 1 : -1)));
                input.value = cursor < 0 ? '' : history[cursor];
            } else if (event.key === 'Tab') {
                event.preventDefault();
                const matches = COMMANDS.filter((command) => command.startsWith(input.value.toLowerCase()));
                if (matches.length === 1) {
                    input.value = `${matches[0]} `;
                } else if (matches.length > 1) {
                    write(matches.join('   '), 'muted');
                }
            } else if (event.key === 'l' && event.ctrlKey) {
                event.preventDefault();
                out?.replaceChildren();
            }
        });
        host.addEventListener('click', () => input?.focus());
        host.parentElement?.addEventListener('click', (event) => {
            const chip = event.target instanceof Element ? event.target.closest('[data-td-term-chip]') : null;
            if (chip instanceof HTMLElement) {
                run(chip.dataset.tdTermChip ?? chip.textContent ?? '');
            }
        });
    });

    root.querySelectorAll<HTMLElement>('td-org').forEach((host) => {
        if (orgHosts.has(host)) {
            return;
        }
        orgHosts.add(host);
        const message = () => {
            const selected = [...host.querySelectorAll<HTMLElement>('[data-td-org-card].is-on')];
            const note = host.querySelector('[data-td-org-msg]');
            if (note) {
                note.textContent = selected.length
                    ? `Seleccionado: ${selected.map((card) => `${card.dataset.name} (${card.dataset.role})`).join(', ')}`
                    : 'Sin selección';
            }
        };
        host.addEventListener('click', (event) => {
            const target = event.target instanceof Element ? event.target : null;
            if (!target) {
                return;
            }
            if (target.closest('[data-td-org-expand]')) {
                host.querySelectorAll('[data-td-org-kids]').forEach((list) => {
                    (list as HTMLElement).hidden = false;
                });
                host.querySelectorAll('[data-td-org-toggle]').forEach((button) => {
                    button.setAttribute('aria-expanded', 'true');
                    const item = button.closest('[role="treeitem"]');
                    item?.setAttribute('aria-expanded', 'true');
                    const name = item?.querySelector('[data-td-org-card]')?.getAttribute('data-name') ?? 'el equipo';
                    const count = button.querySelector('span')?.textContent ?? '';
                    button.setAttribute('aria-label', `Ocultar equipo de ${name}, ${count === '1' ? '1 persona' : `${count} personas`}`);
                });
                return;
            }
            if (target.closest('[data-td-org-collapse]')) {
                host.querySelectorAll('[data-td-org-kids]').forEach((list) => {
                    (list as HTMLElement).hidden = true;
                });
                host.querySelectorAll('[data-td-org-toggle]').forEach((button) => {
                    button.setAttribute('aria-expanded', 'false');
                    const item = button.closest('[role="treeitem"]');
                    item?.setAttribute('aria-expanded', 'false');
                    const name = item?.querySelector('[data-td-org-card]')?.getAttribute('data-name') ?? 'el equipo';
                    const count = button.querySelector('span')?.textContent ?? '';
                    button.setAttribute('aria-label', `Mostrar equipo de ${name}, ${count === '1' ? '1 persona' : `${count} personas`}`);
                });
                return;
            }
            if (target.closest('[data-td-org-multi]')) {
                const on = host.dataset.multi !== 'true';
                host.dataset.multi = on ? 'true' : 'false';
                target.closest('[data-td-org-multi]')?.setAttribute('aria-checked', String(on));
                host.querySelectorAll('[data-td-org-card]').forEach((card) => card.classList.remove('is-on'));
                message();
                return;
            }
            const toggle = target.closest('[data-td-org-toggle]');
            if (toggle instanceof HTMLButtonElement) {
                const item = toggle.closest('.td-org__item');
                const kids = item?.querySelector(':scope > [data-td-org-kids]');
                const open = toggle.getAttribute('aria-expanded') !== 'true';
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
                item?.setAttribute('aria-expanded', open ? 'true' : 'false');
                const name = item?.querySelector('[data-td-org-card]')?.getAttribute('data-name') ?? 'el equipo';
                const count = toggle.querySelector('span')?.textContent ?? '';
                toggle.setAttribute('aria-label', `${open ? 'Ocultar' : 'Mostrar'} equipo de ${name}, ${count === '1' ? '1 persona' : `${count} personas`}`);
                if (kids instanceof HTMLElement) {
                    kids.hidden = !open;
                }
                return;
            }
            if (target.closest('a')) {
                return;
            }
            const card = target.closest('[data-td-org-card]');
            if (card instanceof HTMLElement) {
                if (host.dataset.multi === 'true') {
                    card.classList.toggle('is-on');
                    card.closest('[role="treeitem"]')?.setAttribute('aria-selected', String(card.classList.contains('is-on')));
                } else {
                    host.querySelectorAll('[data-td-org-card]').forEach((node) => {
                        const on = node === card;
                        node.classList.toggle('is-on', on);
                        node.closest('[role="treeitem"]')?.setAttribute('aria-selected', String(on));
                    });
                }
                message();
            }
        });
        const scroll = host.querySelector<HTMLElement>('[data-td-org-scroll]');
        if (scroll) {
            scroll.scrollLeft = (scroll.scrollWidth - scroll.clientWidth) / 2;
        }
    });
}
