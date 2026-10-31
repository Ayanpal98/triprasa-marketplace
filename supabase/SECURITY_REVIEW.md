# Supabase Security Review — Pre-connection

**Status:** Repository-only review. No Supabase project was connected or queried remotely. No migration was applied.

## Existing scaffolding inspected
- `supabase/schema.sql`: profile, product, maker application and single-level order proof-of-concept.
- `supabase/adapter.js`: browser adapter with Auth, published catalogue, maker application and admin methods; it loads only when local `config.js` exists.
- `supabase/config.example.js`: empty browser-safe configuration placeholders.
- `.gitignore`: ignores `supabase/config.js`.
- `admin.html`: browser-local prototype; not an authenticated admin application.

## Findings and blockers
1. **Schema does not model hybrid marketplace ownership.** Products use `maker_name` rather than a seller foreign key; no seller accounts/memberships, seller locations, variants, inventory movements, parent-to-seller order split, delivery jobs, payment events or settlement ledger exist.
2. **Role model is too narrow.** `profiles.role` only models customer/maker/admin. Delivery-partner users and scoped seller team members require explicit trusted role assignments and membership checks.
3. **Seller data isolation is absent.** Current product write policies are admin-only. A seller-scoped policy cannot be safely added until seller ownership and membership entities exist.
4. **Order writes are intentionally disabled.** Preserve this until trusted server-side checkout verifies price, stock, serviceability, payment and idempotency.
5. **Current admin UI is not safe for real data.** It is browser-local and unauthenticated. Do not connect it to shared customer/seller records.
6. **Schema syntax was defective and is now textually corrected, but remains unvalidated.** The `private.handle_new_user()` function body previously used a malformed dollar-quote delimiter; the repository file has been corrected to `$`. It has not been run against PostgreSQL and must not be treated as a tested migration.
7. **Adapter authorization is convenience only.** A browser-side `requireAdmin()` check is not a security boundary. RLS and trusted server-side authorization must enforce all privileges.
8. **No remote project is selected.** The repository setup guide previously mentioned an unrelated/inactive project name; that reference is removed from current setup guidance. Do not reuse any existing project without explicit owner confirmation.

## Required role and RLS matrix (design target)
| Resource | Anonymous | Customer | Seller member | Delivery partner | Admin |
|---|---|---|---|---|---|
| Published products | Read published only | Read published | Read published | No general access | Read/manage all |
| Seller account | No | Public profile only | Own seller by membership | Assigned operational details only | Manage/review |
| Draft listings | No | No | Own seller listings | No | Review/manage |
| Inventory | No | No | Own seller locations only | No | Oversight |
| Parent orders | No | Own orders | Only own seller suborders | No general access | Operational access |
| Seller orders | No | Own order summary | Own seller orders | Only linked delivery job details | Operational access |
| Delivery jobs | No | Own tracking summary | Relevant seller handover status | Assigned jobs only | Operational access |
| Payments/ledger | No | Own payment/refund status | Own settlement statements | Own payout statements | Finance permissions |
| Seller documents | No | No | Own seller documents | No | Restricted review access |

## Current Supabase platform consideration
As of 30 October 2026, Supabase has enforced the change that new tables are not automatically exposed through the Data and GraphQL APIs. When a project is eventually selected, explicitly review its exposed-schema settings and grant only the minimum required table/function privileges. Grants and RLS policies must be designed together; a table's API exposure is separate from its row-level policy. See the [Supabase Data API security guide](https://supabase.com/docs/guides/api/securing-your-api) and [RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Security requirements before any database connection
- Dedicated Triprasa project selected by owner; confirm project reference and region.
- Review current Supabase changelog and docs before using product-specific SQL/API behaviour.
- RLS enabled on every exposed table; every policy includes row ownership or scoped membership, not just `TO authenticated`.
- Authorization roles stored in trusted database-managed assignments or protected app metadata; never trust editable user metadata.
- No service-role/secret key in browser, Vercel public environment variables or Git.
- Seller document and proof-of-delivery storage private by default; explicit object policies and signed access.
- Server-side checkout and payment webhooks with signature verification, idempotency and reconciliation.
- Audit logs for role changes, listing moderation, order state changes, refunds and settlements.
- Test anonymous, customer, seller A, seller B, delivery partner and admin sessions, including cross-tenant denial tests.
- Run Supabase security and performance advisors on the selected non-production project before production review.

## Decision
Do not apply `schema.sql` as-is. Design a new hybrid schema and policy suite, test it in an isolated development environment, then request explicit approval before production connection or migration.
