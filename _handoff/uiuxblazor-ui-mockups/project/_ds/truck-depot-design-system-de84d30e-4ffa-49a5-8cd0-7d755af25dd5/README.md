# Truck Depot — Design System

**Truck Depot®** es un proveedor de **repuestos para camiones y buses** (truck & bus
spare parts). La marca es directa, robusta y de inspiración automotriz/motorsport:
tipografía pesada e itálica, rojo encendido sobre negro, y un sistema visual pensado
para catálogos de partes, fichas técnicas y comercio (B2B y retail).

This repository is a **brand-applied design system**: it captures Truck Depot's logos,
color, type, motifs and component language so any agent can produce on-brand interfaces,
catalogs, decks and prototypes.

> **Idioma:** la UI y la copy son en **español** (mercado LATAM). Documentamos en inglés
> para el lector del sistema, pero los ejemplos de copy van en español.

---

## Sources provided

The brand was built from the official logo files supplied by the client (no codebase or
Figma was given):

| File (in `uploads/`) | What it is |
|---|---|
| `Logo TD.png` | Primary horizontal lockup — **TRUCK** (black) + speed bars + **DEPOT** (red), tight crop. Copied to `assets/logo-horizontal.png`. |
| `Truck depot logo final png (1) (1).png` | Same lockup, padded on a large canvas. → `assets/logo-primary.png` |
| `LOGO BLANCO.png` | All-white lockup for dark backgrounds. → `assets/logo-white.png` |
| `Truck depot logo final-05.png` | Watermark treatment — ghosted white **TRUCK** + solid red **DEPOT**. → `assets/logo-watermark.png` |

> ⚠️ **No product UI (codebase / Figma) was provided.** The UI kits in `ui_kits/` are an
> *original application of the Truck Depot brand* to the obvious product surfaces for a
> parts retailer (an ecommerce **Tienda** and a marketing **Sitio**). They are reference
> recreations of standard patterns dressed in the brand — not recreations of an existing
> product. If you have real screens/code/Figma, send them and we'll align the kits exactly.

---

## Brand at a glance

- **Wordmark:** heavy, condensed, **italic** uppercase. "TRUCK" set in near-black,
  "DEPOT" in brand red. A block of **four slanted speed bars** sits between/under the two
  words — the single most recognizable brand element (also used as the app icon).
- **Primary colors:** Depot Red `#ED2A24` + Truck Black `#0A0B0C`.
- **Secondary:** a full neutral **grey** scale.
- **Personality:** mechanical, fast, dependable, no-nonsense. Think pit-lane signage and
  industrial parts catalogs — not soft consumer SaaS.

---

## CONTENT FUNDAMENTALS

How Truck Depot writes.

- **Language:** Spanish (LATAM). Neutral, professional, not slangy.
- **Voice:** direct, confident, utilitarian. The customer is a mechanic, fleet manager,
  or workshop owner who wants the **right part, fast, in stock**. No fluff.
- **Person:** address the customer with **"tu"** in commerce flows ("Encuentra tu
  repuesto", "Agrega al carrito"), and use **imperatives** for actions ("Buscar por
  patente", "Cotizar", "Ver ficha técnica"). Brand statements use first-person plural
  ("Tenemos el repuesto que necesitas").
- **Casing:**
  - **Wordmark & big headlines:** UPPERCASE (matches the logo).
  - **Eyebrows / kickers / nav / buttons:** UPPERCASE, tracked (`letter-spacing` ~0.14em).
  - **Body, product titles, descriptions:** Sentence case.
- **Numbers & codes:** part numbers / SKUs are **monospace, uppercase** (`BR-4521-AD`).
  Prices are bold and condensed with thousands separators ("$ 189.990"), currency varies
  by market.
- **Tone examples (✅ on-brand):**
  - "Repuestos para camiones y buses. En stock y listos para despachar."
  - "Busca por marca, modelo o número de parte."
  - "Garantía de 12 meses en repuestos originales."
  - "¿No encuentras tu repuesto? Cotiza con un asesor."
- **Avoid (❌):** exclamation spam, emoji, cutesy marketing ("¡Wow, qué oferta! 🎉"),
  over-long paragraphs. Keep it short and operational.
- **Emoji:** **not used.** Status is shown with color + icon + short label, never emoji.

---

## VISUAL FOUNDATIONS

Everything that makes a screen *look* like Truck Depot. Tokens live in
`colors_and_type.css`.

### Color
- **Red is an accent, not a wash.** Depot Red (`#ED2A24`) is reserved for primary actions,
  the wordmark, prices/savings, active states, and the speed-bar motif. Black and grey
  carry most of the surface area. Roughly **black/white/grey 90% · red 10%**.
- **Black** (`#0A0B0C`) for headers, footers, hero panels, and high-contrast bands.
- **Grey scale** (`--n-50 … --n-900`) for surfaces, borders, dividers, secondary text.
- **Semantic / stock colors:** green = *En stock*, amber = *Pocas unidades*, red =
  *Agotado*, blue = info/envío. Always color + icon + label (accessibility + no-emoji rule).
- Imagery skews **cool, hard, slightly desaturated** — steel, asphalt, machined metal.
  Black-and-white or low-saturation photos with a single red accent feel most on-brand.

### Typography
- **Display / headlines:** `Saira Condensed` — heavy (800–900), often **italic**,
  UPPERCASE. This is the voice of the logo. Use for hero headlines, section titles,
  prices, big numbers.
- **UI & body:** `Barlow` — an industrial, highway-signage grotesque. Clean, readable,
  slightly condensed feel. Weights 400/500/600/700.
- **Mono:** `JetBrains Mono` for SKUs, part numbers, specs tables, order IDs.
- **Tracking:** tight (negative) on big display; wide (0.12–0.16em) on small uppercase
  eyebrows/labels.

> **Font substitution note:** the logo wordmark uses a proprietary custom italic. We did
> **not** receive the source font. `Saira Condensed` is the closest free Google Fonts match
> (condensed, squared, strong italic). **If you have the brand's actual display font, send
> the files and we'll swap them into `fonts/` and update the tokens.**

### Spacing & layout
- **4px base grid.** Tokens `--sp-1`..`--sp-20`. Generous, gridded layouts; product cards
  on a strict grid. Marketing uses full-width black bands alternating with white sections.
- **Containers:** max ~1280px content width; comfortable gutters.
- Catalog density is **medium-high** — these are working tools, not airy landing pages.

### Corners, borders, cards
- **Radii are small/modular** (`--r-sm` 5px, `--r-md` 8px). Nothing pill-soft except true
  pills (chips/tags use `--r-pill`). The brand reads engineered, not bubbly.
- **Cards:** white surface, 1px `--border` (`#DCDFE3`), `--r-md`, `--shadow-sm`. Hover
  lifts to `--shadow-md` and shows a 1px red top accent or red CTA reveal.
- **Borders over shadows** for structure inside dense catalogs; shadows for elevation
  (dropdowns, modals, sticky bars).

### Shadows / elevation
- Neutral, low-spread, slightly cool. `--shadow-xs/sm/md/lg`. A dedicated red glow
  (`--shadow-red`) for primary CTAs on dark backgrounds only — use sparingly.

### Motion
- **Fast and mechanical.** `--dur-fast 120ms` / `--dur 180ms`, ease `cubic-bezier(.2,.7,.2,1)`.
- Hovers: quick color shift + subtle translateY(-1px) lift on cards/buttons.
- Press: darken (red → `--red-700`) and a tiny `scale(.98)`.
- Entrances: short fades / slide-up (8–12px). **No** bounces, no decorative looping
  animation, no parallax gimmicks. The diagonal speed-bar slant is the only "motion" motif
  expressed statically.

### Hover / press states (summary)
- **Primary (red) button:** rest `--td-red` → hover `--red-600` → press `--red-700` + `scale(.98)`.
- **Secondary (outline) button:** rest transparent + 1px border → hover `--n-50` fill → press `--n-100`.
- **Ghost / link:** hover underline or red text.
- **Card:** hover `--shadow-md` + red accent reveal.
- **Focus:** 3px `--focus-ring` (red @ 45% alpha) outline, never removed.

### Transparency / blur
- Used sparingly: sticky header gets a slight translucent black + backdrop-blur when
  scrolled; image overlays use a **black protection gradient** (bottom-up) so white text
  stays legible on photos. No frosted-glass everywhere.

### The speed-bar motif
- Four slanted bars (≈12–15° shear) are the brand's signature ornament. Use as: app icon,
  section dividers, loading indicator, hover accent, and decorative corner on dark bands.
  Always red on dark, or black/white where red would clash. Don't overuse — one per view.

---

## ICONOGRAPHY

- **No proprietary icon set was provided.** The system uses **[Lucide](https://lucide.dev)**
  (via CDN) as the working icon library: clean, consistent **2px stroke**, rounded joins —
  it reads technical/industrial and pairs well with Barlow. **This is a substitution; flag
  to the client and swap if they have a house set.**
- **Style rules:** outline (stroke) icons only, 2px stroke, 20–24px default, inherit
  `currentColor`. Use filled variants only for tiny status dots.
- **Common icons:** `truck`, `bus`, `wrench`, `search`, `shopping-cart`, `package`,
  `map-pin`, `phone`, `user`, `heart`, `chevron-*`, `check-circle`, `alert-triangle`.
- **Emoji:** never. **Unicode glyphs as icons:** avoid — use Lucide.
- **Brand mark vs icons:** the **speed-bar motif** and the **wordmark** are brand assets
  (in `assets/`), not part of the icon set. Don't redraw them — reference the PNGs or the
  reusable CSS `.td-speedbars` element from the UI kits.
- Logos and the app icon were generated/copied into `assets/`; do **not** hand-draw new
  versions of the wordmark.

---

## Index / manifest

Root files:
- **`README.md`** — this file. Brand context, content + visual foundations, iconography.
- **`colors_and_type.css`** — all design tokens (CSS vars) + semantic type classes. Import
  this into any artifact.
- **`SKILL.md`** — Agent-Skills-compatible entry point.
- **`assets/`** — logos (`logo-horizontal`, `logo-primary`, `logo-white`, `logo-watermark`),
  `icon-app.png`, `icon-app-red.png`, `favicon.png`.
- **`preview/`** — small HTML cards that populate the Design System tab (type, color,
  spacing, components, brand).
- **`ui_kits/`** — high-fidelity, on-brand product recreations:
  - `ui_kits/tienda/` — **Tienda** parts ecommerce storefront (catalog, product, cart).
  - `ui_kits/sitio/` — **Sitio** marketing website (hero, categories, footer).

> No slide template or deck was provided, so `slides/` is intentionally omitted. Ask if you
> want a branded deck template.
