# Fair Fasteners Invoice App — Architecture

This document matches the **current** codebase: structure, data flow, and where to change behavior.

## High-level flow

1. **`app/page.tsx`** renders **`components/BillGenerator.tsx`** (client).
2. **`BillGenerator`** holds **`BillData`** in React state, runs **`calculateBillTotals`**, and renders sections + optional **`BillTemplate`** preview.
3. **`BillTemplate`** is the **print/PDF** markup (`id="invoice-preview"`). PDF export rasterizes this node; keep preview and template in sync for WYSIWYG.
4. **`lib/billing/*`** owns calculations, exports, persistence, and most formatting rules.
5. **`lib/static-text.json`** supplies **`app.version`** (footer in **`app/layout.tsx`**), fixed company, bank, and default strings/rates consumed in **`lib/types.ts`** (`fixedCompanyData`, `getInitialBillData`, `getDefaultQuantityUnit`). There is **no server database**; persistence is **localStorage** for terms only (see below).

## Folder structure

| Path | Role |
|------|------|
| `app/` | App Router: `layout.tsx` (Geist font, footer with version from **`static-text.json`**, **`LenisScroll`**), `page.tsx`, `globals.css` (brand CSS variables, print rules). |
| `components/` | **`BillGenerator.tsx`**, **`BillTemplate.tsx`**, **`LenisScroll.tsx`**, **`ui.tsx`** (Input, Textarea, Section, Button), **`ui/*`** (shadcn-style primitives, calendar, dropdown). |
| `lib/types.ts` | **`BillData`**, **`LineItem`**, **`QuantityUnit`** (`'KG' \| 'PC'`), **`Calculations`**, **`getInitialBillData`**. |
| `lib/static-text.json` | **`app.version`**, **`company`**, **`bank`**, **`defaults`** (no bank fields on `BillData`; template reads bank from JSON). |
| `lib/catalog/` | **`goods-catalog.json`**, **`goodsCatalog.ts`** (product list, sizes, description formatting). |
| `lib/billing/` | Domain logic (see below). |
| `lib/utils.ts` | Currency, number-to-words, **`cn`**. |
| `docs/` | This file. |

## `lib/billing/` modules

| File | Responsibility |
|------|----------------|
| **`calculations.ts`** | Line **`amount = quantity * rate`**. **`subTotal`**, **`gstBase = subTotal + freight`**, CGST/SGST or IGST per **`taxRules`**, **`grandTotal`**. |
| **`taxRules.ts`** | **`isIgstInterstateRule(igstRate)`** — `true` for **18** or **0.1** (IGST-only amounts; CGST/SGST zero in UI logic). |
| **`exports.ts`** | **`exportBillAsPdf`** (dynamic **`html2canvas`** + **jsPDF**), **`exportBillAsExcel`** (**xlsx**). |
| **`storage.ts`** | **`loadPersistedBillFields` / `savePersistedBillFields`** — persists **`termsAndConditions`** only. |
| **`constants.ts`** | **`BILL_STORAGE_KEY`**, **`COLOR_FALLBACKS`** for PDF canvas CSS. |
| **`paymentTermsOptions.ts`** | Preset list, **`paymentTermsSelectValue`**, custom sentinel. |
| **`formatBillingAddress.ts`**, **`gstin.ts`**, **`indianMobile.ts`**, **`countryDialCodes.ts`** | Client address display, GSTIN normalization/validation, mobile + dial code UX. |
| **`quantityUnit.ts`** | **`formatQuantityUnitLabel`** (invoice UOM labels). |

## Line items (data model)

- **`LineItem`**: catalog ids, description, HSN, bags, **quantity**, **`quantityUnit`** (`KG` / `PC`), **rate** (amount = qty × rate). No separate “unit price” field.
- Drag-and-reorder and grid UI live in **`BillGenerator`**.

## UI / scroll

- **Lenis**: **`components/LenisScroll.tsx`** creates a **window** Lenis instance and **nested** Lenis for every **`[data-lenis-scroll="true"]`**. A **MutationObserver** rescans the tree so regions that mount later (e.g. **preview** panel) still get smooth scrolling.
- **Form** and **preview** columns in **`BillGenerator`** set **`data-lenis-scroll="true"`** on their scrollable wrappers. Preview wraps toolbar + invoice in one inner column so Lenis **`content`** is correct.

## Debugging

### PDF export

- Entry: **`lib/billing/exports.ts`** → **`exportBillAsPdf`**.
- Target DOM: **`#invoice-preview`** in **`BillTemplate`**.
- Color/CSS issues in canvas: **`COLOR_FALLBACKS`** in **`lib/billing/constants.ts`** (e.g. replacing unsupported color functions for **html2canvas**).

### Excel export

- Entry: **`exportBillAsExcel`**. Check **`summaryData`** and **`itemsData`** row shapes vs. column headers (including totals footer rows).

### localStorage

- Key: **`BILL_STORAGE_KEY`** in **`constants.ts`**.
- Only **terms & conditions** are stored (**`storage.ts`**). Bank/company come from JSON, not the form.

### Tax totals wrong

- Confirm **freight** is included in the GST base (**`calculations.ts`**: **`gstBase`**).
- IGST mode: **`isIgstInterstateRule`** and **`BillGenerator`** rate field behavior for CGST/SGST/IGST.

## Conventions

- Keep **render-only** UI in **components**; put **deterministic** rules in **`lib/billing`** or **`lib/types`** helpers.
- Prefer **small pure functions** for math and export shaping.
- Change **static** seller copy in **`lib/static-text.json`** rather than hardcoding in components.
