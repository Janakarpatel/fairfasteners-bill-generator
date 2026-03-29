<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## This repo

Invoice app entry: `app/page.tsx` → `components/BillGenerator.tsx`. Domain logic: `lib/billing/`. Static seller defaults and app version: `lib/static-text.json`. No server database—optional `localStorage` for terms only. See **`docs/ARCHITECTURE.md`** for structure, tax/export/persistence, and Lenis scroll behavior.
