# Fair Fasteners Invoice App Architecture

This document describes the current project structure and where to debug common issues.

## High-Level Flow

- `app/page.tsx` mounts the invoice workflow.
- `components/BillGenerator.tsx` orchestrates UI state, form interactions, and export actions.
- `components/BillTemplate.tsx` is the single source of truth for invoice preview rendering.
- `lib/billing/*` holds domain logic (calculations, persistence, exports).

## Folder Structure

- `app/`
  - Next.js app router entries (`layout.tsx`, `page.tsx`, global styles).
- `components/`
  - Feature components (`BillGenerator.tsx`, `BillTemplate.tsx`).
  - Shared UI primitives (`ui.tsx`, `ui/*`).
- `lib/`
  - Shared helpers/types (`types.ts`, `utils.ts`).
  - `billing/`
    - `calculations.ts`: deterministic invoice math.
    - `constants.ts`: export/persistence constants and color fallbacks.
    - `exports.ts`: PDF/Excel export functions.
    - `storage.ts`: localStorage load/save helpers.
- `docs/`
  - Engineering and architecture notes.

## Debugging Guide

### PDF Export Issues

- Entry point: `lib/billing/exports.ts` -> `exportBillAsPdf()`.
- If colors fail in html2canvas (e.g. `lab` parser errors), check `COLOR_FALLBACKS` in `lib/billing/constants.ts`.
- If output layout drifts, compare:
  - preview markup in `components/BillTemplate.tsx`
  - image scaling math in `exportBillAsPdf()`.

### Excel Export Issues

- Entry point: `lib/billing/exports.ts` -> `exportBillAsExcel()`.
- Verify generated arrays (`summaryData`, `itemsData`) before writing workbook.

### Data Persistence Issues

- Entry points:
  - `loadPersistedBillFields()` in `lib/billing/storage.ts`
  - `savePersistedBillFields()` in `lib/billing/storage.ts`
- LocalStorage key is centralized in `lib/billing/constants.ts`.

## Conventions

- Keep render-only code in components and move business logic to `lib/billing`.
- Use small, pure functions for calculations and exports.
- Add short comments only where behavior is non-obvious.
- Prefer centralized constants over inline literals for shared behavior.

