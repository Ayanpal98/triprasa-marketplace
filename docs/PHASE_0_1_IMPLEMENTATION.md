# Triprasa Phase 0–1 Implementation Record

## Approved product decisions
- Launch planning geography: **Agartala first**. This is a product-planning decision, not a statement that any locality is currently serviceable.
- Platform strategy: **responsive web + installable PWA first**. Native Android/iOS apps are deferred.
- Operating model: **hybrid multi-vendor marketplace**. One customer basket may contain items from multiple independent sellers; the platform coordinates seller-specific fulfilment.
- Delivery model: **local delivery partners**. No Triprasa fleet, partner roster, rider capacity, fee or ETA is assumed.
- Prototype: preserve the existing Vercel storefront and its browser-local demo behaviour as the current public experience.
- Backend gate: no production Supabase project selection, connection, migration application, live auth, data import, payment or order activation before explicit project selection and security review.

## Phase 0 — scope and operational definition
### Agartala-first boundary
Agartala is the first intended market for validation. Exact launch localities, pincodes, seller pickup points and customer delivery boundaries remain TBD. A location entered in the prototype is only a browser-local label and must never be interpreted as a serviceability check.

### Roles and ownership
- Triprasa: platform policies, discovery, marketplace orchestration, moderation and customer support process.
- Seller: listing accuracy, price, stock, product preparation and parcel handover.
- Local delivery partner: accepted job, pickup, transit, delivery evidence and exception reporting.
- Customer: basket, address, payment choice and support requests.
- Admin: seller/listing review, service-area configuration, operations and audited access control.

### Decisions still required before live pilot
- Exact Agartala localities/pincodes and serviceability verification method.
- Initial categories and product-specific compliance requirements.
- Seller eligibility, identity/business verification, consent and listing approval criteria.
- Seller stock update and order acceptance workflow, operating hours and preparation expectations.
- Delivery partner selection, verification, insurance/liability allocation, availability and failed-delivery procedure.
- Delivery charge, platform fee/commission, tax treatment, seller payout and reconciliation policy.
- Payment provider, refund/chargeback flow, cash-on-delivery decision if any.
- Cancellation, return, replacement, customer support and dispute ownership.
- Privacy notice, data retention, consent, grievance and security incident procedures.
- Packaging, food/product handling and applicable consumer, tax and local regulatory review.

Do not fill TBDs with sample sellers, invented product prices, stock, delivery capacity, ratings, sales or traction. Use synthetic records only in clearly marked test environments.

## Phase 1 — architecture implementation prepared
### Web + PWA foundation
- Added a web app manifest with Triprasa name, theme, scope and install display settings.
- Added a branded SVG app icon for PWA installation surfaces.
- Added a same-origin service worker for an app-shell cache and offline navigation fallback.
- The service worker does not cache cross-origin assets, API responses, customer data, basket records or transactions.
- Existing IndexedDB/localStorage demo data remains browser-local and is not synchronised to a server.
- PWA install prompts are browser-controlled; the app should not claim installation succeeded unless the browser confirms it.

### Backend boundary
- Existing Supabase adapter remains unconfigured and must not be imported by production pages yet.
- Existing SQL is a legacy proof-of-concept schema, not a production hybrid-marketplace migration.
- No Supabase project was selected, connected, inspected remotely or changed during this work.
- No SQL was applied; no credentials, keys, user accounts, seller data or records were created.
- Do not deploy an authenticated seller/admin surface until the revised schema, role model, RLS policies and storage policies have been reviewed and tested.

### Proposed first backend modules
1. Identity and access: profiles, protected role assignments, seller memberships and admin permissions.
2. Seller operations: seller accounts, seller locations, verification/application review and listing moderation.
3. Catalogue: categories, products, variants, unit/pack details, images and listing status.
4. Inventory: location-specific stock balances, reservations and immutable movements.
5. Geography: service areas, locality/pincode configuration and seller/delivery eligibility.
6. Commerce (later gated phase): carts, parent orders, seller orders, payment events, delivery jobs, refunds and settlement ledger.

## Acceptance checklist
- [x] Agartala-first and Web/PWA-first decisions documented.
- [x] Hybrid marketplace and local delivery partner responsibilities documented.
- [x] Existing storefront retained as the prototype baseline.
- [x] PWA manifest, icon and offline shell added.
- [x] No production Supabase project or database modified.
- [x] No seller, price, stock, partner, delivery-time or traction data invented.
- [ ] Validate PWA installation and offline fallback on real Android/desktop browsers.
- [ ] Run accessibility and responsive checks on real devices.
- [ ] Review the proposed database design and RLS matrix with a security reviewer.
- [ ] Select a dedicated Triprasa Supabase project only after explicit confirmation.
- [ ] Approve and test migrations in an isolated development project before any production connection.

## Next release gate
Phase 1 is an architecture and frontend-foundation preparation, not a live commerce release. The next safe step is a reviewed hybrid-marketplace schema and RLS test plan, followed by a dedicated non-production Supabase environment after the owner selects and confirms the project.
