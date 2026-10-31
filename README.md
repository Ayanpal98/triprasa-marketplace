# Triprasa — Rooted in Tripura, open to the Northeast

Triprasa is an early-stage, community-first multi-vendor marketplace concept rooted in Tripura. The intended experience combines quick-commerce-style convenience with local discovery for regional produce, pantry products, handloom, bamboo and cane craft, home essentials and independent makers.

## Current status
**Quick-commerce-inspired frontend prototype with PWA app-shell support.** The storefront includes a compact marketplace layout, location context, search, category shortcuts, product discovery, a local demo basket and seller-interest preview.

- Launch planning geography is **Agartala first**. This is not a claim that delivery is currently available in Agartala.
- Platform direction is **responsive web + PWA first**; native Android/iOS apps are deferred.
- The shopping-area label is saved in the current browser only. It does not check delivery coverage or calculate an ETA.
- The catalogue contains illustrative category previews, not verified live product listings.
- Product images are illustrative stock photography, not item-specific seller photos.
- No live seller accounts, shared backend, inventory, prices, discounts, checkout, payments, delivery dispatch or order fulfilment are connected.
- Seller-interest submissions remain in the visitor's browser and are not sent to a server.
- The PWA service worker caches the same-origin app shell only; it does not sync or cache customer records, orders, payment data or cross-origin assets.
- Supabase schema and adapter files are review scaffolding only; no project is connected and no migration has been applied.
- No real traction, seller count, partnerships, ratings, certifications or impact results are claimed.

## Quick-commerce direction
Use familiar convenience patterns—prominent search, location context, category shortcuts, compact product cards, a persistent basket and a low-friction checkout—without copying Blinkit's brand or promising rapid delivery before service areas, seller capacity, inventory and fulfilment operations are validated.

## Run locally
Open `index.html` in a modern browser or use any static file server. PWA installation and service-worker features require HTTPS or localhost; they do not run from `file://`.

## Project documents
- [Product specification](PRODUCT_SPEC.md)
- [Phase 0–1 implementation record](docs/PHASE_0_1_IMPLEMENTATION.md)
- [Commerce architecture](docs/COMMERCE_ARCHITECTURE.md)
- [Supabase integration guide](supabase/INTEGRATION.md)
- [Supabase pre-connection security review](supabase/SECURITY_REVIEW.md)
- [Legacy proof-of-concept SQL — do not apply](supabase/schema.sql)
- [Roadmap](docs/ROADMAP.md)
- [Frontend audit](docs/FRONTEND_AUDIT.md)
- [Frontend quality checklist](docs/QUALITY_CHECKLIST.md)
- [Contributing guidance](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## Product principles
1. Maker-first and community-informed.
2. Consent and attribution before publishing cultural stories, designs or personal details.
3. Transparent prices, fees, stock and fulfilment information.
4. Accessible, mobile-first shopping and discovery.
5. Validate locally before expanding across the Northeast or nationally.
6. Make no unsupported claims about seller verification, provenance, delivery speed, impact or traction.

## Next steps
1. Validate PWA installation and offline fallback on real Android and desktop browsers.
2. Confirm Agartala launch localities, seller criteria, categories and delivery partner operating procedures.
3. Review the hybrid marketplace schema and RLS policy matrix.
4. Select a dedicated Triprasa Supabase project only after explicit owner confirmation.
5. Test migrations in an isolated development environment before any production connection.
6. Run a controlled pilot only when accurate listings, inventory, payments, fulfilment, support and compliance are ready.

## Licence
The included licence notice is a placeholder. Confirm ownership and licensing terms before accepting outside contributions or distributing the software.
