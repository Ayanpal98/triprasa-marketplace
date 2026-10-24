# Triprasa shared-backend integration scaffold

## Current mode

This is preparation code only. No Supabase project is selected or connected. `supabase/config.js` intentionally contains empty values, so the adapter cannot initialize a client. The current storefront and admin continue using browser-local demo data.

## Files

- `schema.sql` — proposed Postgres tables, triggers, and row-level security policies.
- `config.example.js` — browser-safe configuration template.
- `adapter.js` — reusable auth, published catalogue, maker application, and admin catalogue/review methods.
- `README.md` — this integration sequence.

## Configure later

1. Select or create a dedicated Triprasa Supabase project.
2. Review and apply `schema.sql) only after checking it against the selected project's policies and schema.
3. Copy `config.example.js` to `config.js`, then add the project URL and its publishable/anon key.
4. Create the first operator via Supabase Auth. Promote that specific Auth UUID to `admin` using a trusted SQL session. Never expose privileged keys in browser code.
5. Include the adapter from a page using an ES module, for example:
   ```html
   <script type="module">
     import { TriprasaBackend } from "./supabase/adapter.js";
     console.log("Shared backend configured:", TriprasaBackend.isConfigured());
   </script>
   ```
6. Implement sign-in UI and connect storefront/admin components to these methods behind loading, error, and empty states. Keep local demo fallback explicit; do not silently mix local and shared records.
7. Test all roles and policies with separate anonymous, customer, maker, and admin sessions before using real data.

## Adapter methods prepared

- Auth: `signInWithPassword`, `signOut`, `getCurrentUser`
- Public catalogue: `listPublishedProducts`
- Maker account: `submitMakerApplication`, `listOwnMakerApplications`
- Admin: `adminListProducts`, `adminSaveProduct`, `adminDeleteProduct`, `adminListMakerApplications`, `adminReviewMakerApplication`

## Deliberately not implemented yet

- Real checkout, payment processing, refunds, shipping, inventory reservation, or order writes.
- Public unauthenticated maker application submission.
- User-facing sign-in/sign-up screens.
- Switching the existing UI from IndexedDB/localStorage to Supabase.
- Uploading product images to Storage.
- Admin role provisioning from the client.

Orders must not be created from trusted client-submitted prices. Before checkout is enabled, move price validation, inventory checks, totals, and payment verification to a trusted server-side function and review order-item policies.

## Security notes

- Only use a publishable/anon key in browser code and rely on row-level security.
- Never commit a service-role or secret key.
- Maker applications are designed to require authentication and explicit contact consent.
- The current `admin.html` page is still an unauthenticated browser-local prototype. Keep real data out of it until the admin UI is replaced with authenticated shared-backend access.
- The adapter is not a substitute for reviewing schema policies and running security advisors.
