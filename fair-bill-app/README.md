# Fair Bill App

Next.js (App Router) invoice builder for **Fair Fasteners**: form-driven data entry, live preview, PDF and Excel export. App version (footer), company identity, bank details, and defaults are driven by **`lib/static-text.json`**. No database — bill data lives in React state; only terms & conditions are persisted (browser **localStorage**).

## Requirements

- Node.js compatible with Next **16** (see `package.json`).
- npm (or pnpm/yarn/bun) for installs.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Development server       |
| `npm run build`| Production build         |
| `npm run start`| Run production server    |
| `npm run lint` | ESLint                   |

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features (current)

- **Invoice form** (`components/BillGenerator.tsx`): invoice metadata, client and billing address, line items (catalog + custom descriptions), freight, CGST/SGST/IGST, payment terms (presets + custom), notes, terms & conditions.
- **Preview** (`components/BillTemplate.tsx`): A4-style layout; optional show/hide. **PDF** captures `#invoice-preview` via dynamic `html2canvas` + **jsPDF** (`lib/billing/exports.ts`).
- **Excel** export: summary sheet + line items (qty, UOM, rate, amount) (`exportBillAsExcel`).
- **Static config** (`lib/static-text.json`): `app.version`, `company`, `bank`, `defaults` (payment terms text, bill/challan prefixes, default PO no., tax rates, default quantity unit `KG`/`PC`, etc.).
- **Catalog** (`lib/catalog/goods-catalog.json` + `goodsCatalog.ts`): product/size-driven line descriptions.
- **Tax**: GST computed on **subtotal + freight** (`lib/billing/calculations.ts`). **IGST 18% or 0.1%** switches to IGST-only mode (`lib/billing/taxRules.ts`).
- **Persistence**: only **terms & conditions** are saved to `localStorage` (`lib/billing/storage.ts`); key in `lib/billing/constants.ts`.
- **Smooth scroll**: **Lenis** on the window and on scroll regions marked `data-lenis-scroll="true"` (form + preview); nested regions are registered when the DOM updates (`components/LenisScroll.tsx`).
- **Styling**: Tailwind CSS v4, brand tokens in `app/globals.css` (`--brand-primary`, etc.).

## Documentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — folder layout, data flow, debugging, conventions.

## Deploy

Standard Next.js deployment (e.g. Vercel). Set `output`/hosting per your platform; see [Next.js deploying docs](https://nextjs.org/docs/app/building-your-application/deploying).
