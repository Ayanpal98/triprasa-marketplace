# Triprasa shared backend preparation

Triprasa is currently a static frontend prototype with a PWA app shell. This folder contains legacy proof-of-concept Supabase scaffolding and a pre-connection security review. It is not ready for production.

## Important status
- No Supabase project has been selected, connected, queried or modified for Triprasa.
- `schema.sql` is a legacy proof-of-concept only. Do not apply it; it does not model the hybrid marketplace and is not a production migration.
- The browser adapter remains unconfigured because `supabase/config.js` is absent and git-ignored.
- The storefront and `admin.html` use browser-local demo data. The admin page is not authenticated and must not receive real customer or seller information.
- No migration, auth user, seller record, order, payment or live inventory has been created.

## Decisions recorded
- Launch planning geography: Agartala first; exact service localities remain TBD.
- Platform: responsive web + PWA first.
- Operating model: hybrid marketplace with seller-specific fulfilment orders.
- Delivery: local delivery partners; no partner roster, service capacity, price or ETA is assumed.

## Safe sequence
1. Review `SECURITY_REVIEW.md` and the domain model in `../docs/COMMERCE_ARCHITECTURE.md`.
2. Design a new hybrid schema covering seller accounts/memberships, locations, catalogue variants, inventory, parent orders, seller orders, payments, delivery jobs, refunds and settlement ledger.
3. Design and test row-level security for customer, seller-member, delivery-partner and admin roles, including cross-tenant denial tests.
4. Select a dedicated Triprasa project explicitly and confirm its organization and region before any connection.
5. Review current Supabase docs/changelog and apply reviewed migrations only to an isolated development project after owner approval.
6. Run security/performance advisors and test anonymous, customer, seller A, seller B, delivery partner and admin sessions.
7. Keep production disconnected until the schema, RLS, storage, secrets and operational policies have passed review.

## Key files
- `schema.sql` — legacy proof-of-concept; do not apply.
- `adapter.js` — unconfigured browser adapter; not wired into the live storefront.
- `config.example.js` — placeholder for a future publishable key and project URL.
- `INTEGRATION.md` — integration boundary and non-goals.
- `SECURITY_REVIEW.md` — findings and required security gates.

Never place a service-role key or secret key in browser code, Vercel public environment variables or Git.
