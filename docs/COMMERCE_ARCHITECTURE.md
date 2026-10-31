# Triprasa Commerce Architecture

**Decision:** Hybrid multi-vendor marketplace with local delivery partners.
**Status:** Architecture proposal only. No live seller data, delivery capacity, prices or transaction capability is asserted.

## 1. Operating model
Triprasa owns the marketplace experience, catalogue discovery, cart orchestration, checkout coordination, customer support policy and platform administration. Independent sellers own their listings, prices, stock accuracy, preparation and handover. Independent local delivery partners accept assigned jobs, collect prepared parcels and provide delivery status and proof.

A single customer basket may contain products from multiple sellers. Checkout creates one customer-facing parent order and one seller fulfilment order per seller. Delivery jobs are created only after seller acceptance and serviceability/capacity checks. Seller orders may be delivered separately; one checkout does not imply one parcel or one arrival time.

Do not promise 10-minute or other rapid delivery until seller density, preparation times, service areas, partner availability and measured delivery performance support the promise.

## 2. Applications and roles
### Customer storefront / PWA
- Browse approved products and seller profiles; search and filter by category.
- Select a locality/service area; collect a precise delivery address only when needed for checkout.
- View variants, unit/pack size, verified seller, current price and stock.
- Use a basket grouped by seller, with item, fee and delivery breakdowns.
- Checkout, track parent and seller orders, request cancellations/returns and contact support.

### Seller workspace
- Apply and complete verification; manage business profile, pickup locations and operating hours.
- Create listings with permitted photos, variants, unit/pack details, prices and stock.
- Accept/reject orders, prepare items, mark ready for pickup and report stock issues.
- Review order history, disputes and settlement statements.

### Delivery partner workspace
- Complete partner onboarding and configure service zones/availability.
- Accept assigned delivery jobs, record pickup/transit/delivery and proof of delivery.
- Report failed attempts and return-to-seller events.
- Access customer contact/address only for assigned jobs and only as operationally necessary.

### Admin operations
- Review sellers and listings; manage categories, service areas, policies and moderation.
- Monitor parent orders, seller fulfilment, delivery jobs, payments, refunds and disputes.
- Reconcile seller and delivery partner balances. All sensitive actions are audited.

## 3. Recommended technical architecture
- Frontend: preserve the existing static prototype as the design reference. Build authenticated commerce features in a maintainable React/Next.js app or modularise progressively after scope approval; avoid a disruptive rewrite.
- Backend: a dedicated Supabase project for PostgreSQL, Auth, Storage and Realtime where useful.
- Trusted operations: Supabase Edge Functions or another trusted server runtime for checkout, price/stock validation, payment webhooks, order splitting, delivery assignment, cancellation/refunds and settlements.
- Database: PostgreSQL with RLS on every exposed table and explicit ownership/membership policies.
- Media: Storage with controlled upload paths, file type/size validation, moderation and approved public product images.
- Payments: select an India-supported provider after onboarding and legal review. Keep secrets server-side, verify signed webhooks and reconcile events. Browser redirects are not proof of payment.
- Maps: select a provider after coverage, pricing and privacy review. Begin with explicitly configured localities/pincodes if sufficient; a typed location is not proof of serviceability.
- Hosting: existing Vercel project may host customer and operations apps, with separate preview/production configuration and secrets.

## 4. Domain model
The current proposed SQL scaffold is not a hybrid marketplace schema: it has a single maker name on products, a single-level order and lacks seller suborders, delivery jobs, inventory movements, payment records and a settlement ledger. Extend it through reviewed migrations; do not apply it as-is for live commerce.

| Entity | Purpose |
|---|---|
| profiles / role_assignments | Auth-linked profiles and trusted customer, seller-member, delivery-partner and admin permissions |
| seller_accounts / seller_members | Seller identity, review status and scoped user membership |
| seller_locations / service_areas | Pickup points, hours, serviceable localities and coverage |
| categories / products / product_variants | Approved catalogue, seller ownership, SKU, unit/pack, attributes and price |
| inventory_balances / inventory_movements | Available/reserved stock and auditable stock changes |
| carts / cart_items | Customer cart and seller/variant references |
| orders | Customer-facing parent order and address/price snapshots |
| seller_orders / seller_order_items | One fulfilment order per seller with immutable item snapshots |
| payments / payment_events | Provider references, verified events, captures and refunds |
| delivery_partners / delivery_jobs / delivery_events | Partner profile, assignment and append-only delivery timeline |
| fee_rules / ledger_entries | Versioned fee rules and auditable seller/partner/platform balances |
| refunds / returns / support_cases | Customer issues, reverse logistics and resolution |
| audit_logs | Sensitive administrative, seller and financial actions |

Use UUIDs, UTC timestamps and integer minor currency units (paise), never floating-point money. Preserve snapshots for item names, variants, seller display name, price/fee basis and delivery address at order time.

## 5. Multi-vendor checkout flow
1. Customer adds products from Seller A and Seller B to one cart.
2. Server reloads published variants, seller status, serviceability and inventory.
3. Server calculates current item totals, taxes/fees and delivery allocation from configured rules.
4. Customer confirms one parent order and uses the selected payment method.
5. After verified payment (or a deliberately approved cash-on-delivery policy), a database transaction creates one seller order per seller and reserves stock atomically.
6. Each seller accepts or rejects within configured operating rules. Rejection or stock failure follows a defined partial/full cancellation and refund flow.
7. Accepted seller orders become eligible for delivery job creation.
8. A delivery partner is assigned using service zone, availability and capacity. Multi-pickup routes are allowed only if explicitly supported by operating rules.
9. Seller orders may complete separately. Parent order completion, partial completion and partial refunds are represented explicitly.
10. Seller and delivery partner balances are calculated from ledger entries and settled under a reviewed reconciliation policy.

## 6. State machines
Parent order: created -> awaiting_payment -> paid -> partially_fulfilled or fulfilled -> completed. Exceptions include payment_failed, cancelled, partially_cancelled, refund_pending, refunded and disputed.

Seller order: awaiting_seller -> accepted -> preparing -> ready_for_pickup -> handed_to_partner -> delivered. Exceptions include rejected, cancelled, out_of_stock, delivery_failed, return_requested, returned and refunded.

Delivery job: unassigned -> offered -> accepted -> at_pickup -> picked_up -> in_transit -> delivered. Exceptions include offer_expired, rejected, cancelled, failed_attempt, returning and returned.

Enforce allowed transitions on the server and store each transition as an immutable event with actor, timestamp, reason and related entity. Clients must not set arbitrary status values.

## 7. Inventory, pricing and checkout invariants
- Sellers manage only their own seller account, listings, locations and stock.
- Customers read only approved, published listings available to their service area.
- Prices, taxes, discounts, delivery charges and totals are recalculated server-side.
- Never trust browser-supplied totals, seller IDs, discounts or stock counts.
- Reserve stock atomically with bounded expiry; prevent overselling under concurrent checkout.
- Use idempotency keys for checkout, payment webhooks, order creation, refunds and delivery events.
- Immutable order snapshots preserve historical transactions when catalogue records change.
- Define partial rejection, cancellation and refund allocation before enabling multi-seller checkout.

## 8. Local delivery partner operations
Start with partner-managed local delivery, not an assumed Triprasa fleet. Before activating a zone, document participating sellers, pickup windows, serviceable destinations, partner availability, parcel restrictions, fee calculation, failed-delivery procedure, support owner and escalation path.

For the first controlled pilot, dispatch may be manually assigned by an authorized operator. Automate matching only after actual operational data exists. If zone or capacity data is insufficient, show no delivery estimate rather than inventing one.

## 9. Security and privacy
- Enable RLS on every table in exposed schemas; combine authenticated access with row ownership and seller-membership predicates.
- Keep privileged keys and payment credentials server-side. Never expose service-role/secret keys in browser code.
- Keep roles in trusted database assignments or protected app metadata; never trust editable user metadata.
- Use private storage for seller documents and delivery proof; expose only approved product images.
- Minimise address and phone exposure; partners see only assigned-job data.
- Add audited admin actions, rate limits, input validation, upload checks and abuse reporting.
- Define retention/deletion, consent, grievance, incident-response and access-revocation procedures.
- Review policies, functions, triggers, views and storage permissions with Supabase security advisors before release.

## 10. Phased implementation plan
### Phase 0 — Product and operations decisions
Confirm first launch geography, categories, seller eligibility, order acceptance expectations, pickup workflow, service areas, delivery fee policy, cancellation/refund policy, support ownership and pilot economics. Unknowns remain explicit TBDs.

### Phase 1 — Data and identity foundation
Review schema migrations, establish separate Supabase environments, implement Auth, protected role assignments, seller accounts/memberships, service areas, categories, products/variants, storage policies, audit trail and RLS tests. Preserve the existing prototype.

### Phase 2 — Seller catalogue and operations
Build seller application review, seller workspace, listing submission/moderation, location and stock management, order acceptance simulation and admin operations. Any test fixtures must be clearly labelled and must not resemble real sellers or live offers.

### Phase 3 — Cart and multi-vendor checkout
Implement server-owned cart validation, seller-grouped cart, parent/seller orders, atomic stock reservation, price snapshots, payment sandbox, signed webhook handling, idempotency and refund/partial cancellation tests. Keep production payments disabled until reconciliation and legal review are complete.

### Phase 4 — Local delivery workflow
Implement partner onboarding, service-zone eligibility, manual dispatch, assigned-job mobile view, pickup and proof of delivery, failure/return states, delivery event history and partner settlement ledger. Do not advertise rapid delivery without measured service levels.

### Phase 5 — Controlled pilot
Use consented sellers, real listings and permissioned product photography, verified price/stock/unit data, tested end-to-end orders, support/returns, payout reconciliation and delivery-cost evidence. Expansion follows measured results.

### Phase 6 — Scale
Only after the pilot: automated assignment, route optimisation, additional localities, multilingual experience, creator-led shopping, live video commerce and broader Northeast expansion.

## 11. Live pilot acceptance criteria
- Customer, seller, delivery partner and admin permissions are separately tested.
- Sellers can access only their own accounts, listings, inventory and orders.
- One multi-seller cart creates correctly grouped seller orders.
- Server verifies current price, stock, serviceability, fees and payment.
- Concurrent checkout cannot oversell stock or create duplicate orders.
- Partial rejection, cancellation and refund reconcile correctly.
- Delivery partners access only assigned jobs and necessary customer details.
- Critical state transitions and financial adjustments are auditable.
- Privacy, consumer terms, tax, payment, returns, seller agreements and local compliance are reviewed.
- Responsive, accessibility, security, backup/recovery and incident-response tests pass.
- No seller, price, availability, rating, delivery-time or traction claim is published without evidence.

## 12. Preserve the existing prototype
Keep the current Vercel storefront as the public design baseline while authenticated commerce is built separately. Do not point the current browser-local admin prototype at real records. Keep demo and live data visibly distinct. Do not silently sync local basket, wishlist or seller-interest entries into production.
