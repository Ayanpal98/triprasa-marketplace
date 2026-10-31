# Triprasa shared-backend integration scaffold

## Current mode

This is preparation code only. No Supabase project has been selected, connected, queried or changed. The adapter safely loads with no local `supabase/config.js` and remains unconfigured. The current storefront and admin continue using browser-local demo data.

## Files
- `schema.sql` — legacy proof-of-concept only; do not apply to a hybrid marketplace.
- `config.example.js` — browser-safe configuration template.
- `adapter.js` — existing prototype adapter; not wired into the storefront and not a security boundary.
- `SECURITY_REVIEW.md` — repository findings and required pre-connection checks.

## Agartala-first platform decisions
- Responsive web + PWA first.
- Hybrid multi-vendor basket with separate seller fulfilment orders.
- Local delivery partners; exact service areas and partner capacity remain unverified/TBD.
- Keep the existing Vercel storefront as the prototype baseline.

## Configure later — gated
1. Design a new hybrid-marketplace schema and role model; do not apply `schema.sql`.
2. Review the RLS matrix, storage policies, server-side functions and cross-tenant test cases.
3. Select a dedicated Triprasa Supabase project explicitly; confirm organization, region and ownership.
4. Only after explicit approval, connect an isolated development project and apply reviewed migrations.
5. Create test accounts for anonymous, customer, seller A, seller B, delivery partner and admin; test positive and negative access.
6. Run Supabase security/performance advisors and remediate findings.
7. Keep production disconnected until the full security and operational review is signed off.

## Deliberately not implemented
- Real checkout, payment processing, refunds, shipping, inventory reservation or order writes.
- Seller or delivery partner account provisioning.
- Public seller application submission to a server.
- Switching storefront or admin from local demo data to shared records.
- Product image uploads to shared storage.
- Admin role provisioning from the client.

Client-side order creation must remain disabled. Before checkout is enabled, a trusted server-side function must validate price, stock, serviceability, fees, payment status and idempotency. The current `admin.html` is an unauthenticated browser-local prototype and must not be used for real data.
