# Triprasa shared backend setup

Triprasa is currently a static frontend prototype. This folder prepares a Supabase/Postgres schema for a shared catalogue, maker applications, customer profiles, and account-scoped order records.

## Important status

- `schema.sql` is a proposed schema; it has **not** been applied to a live database.
- The storefront and `admin.html` still use browser-local demo data until the Supabase client integration is implemented and configured.
- The public admin route currently has no authentication. Do not enter real customer, seller, or business-sensitive information there.
- Do not add a Supabase service-role key or secret key to frontend code or GitHub.

## Setup sequence

1. Choose or create the correct Supabase project for Triprasa. The available connected project discovered during setup is named `ashasetu` and is inactive; do not assume it belongs to Triprasa or reuse it without confirming.
2. In the chosen project, review and run `schema.sql` using the Supabase SQL Editor or an approved migration workflow.
3. Enable email authentication and configure the allowed site URL and redirect URLs for the deployed Triprasa domain.
4. Create the intended operator account through Supabase Auth. Find its Auth user UUID, then run the final commented SQL statement in `schema.sql` to assign the `admin` role. Never assign roles from public browser input.
5. Configure the frontend with the project's Supabase URL and publishable key only. Never expose a service-role/secret key.
6. Implement and test authenticated admin and maker flows, then switch the storefront from local demo records to shared records.
7. Keep checkout in demo mode until server-side pricing, inventory checks, and verified payment handling exist.

## Tables

- `profiles`: user profile and trusted role.
- `products`: catalogue, with public reads limited to published products and management limited to admins.
- `maker_applications`: signed-in seller submissions; each applicant sees their own record, admins can review all.
- `orders` and `order_items`: account-scoped order records. These are not a payment integration.

Row-level security is enabled for all public tables. Review policies and run the project's security advisors before production use.
