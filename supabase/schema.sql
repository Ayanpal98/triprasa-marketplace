-- LEGACY PROOF-OF-CONCEPT ONLY — NOT A PRODUCTION HYBRID-MARKETPLACE SCHEMA.
-- Do not apply this file. It lacks seller tenancy, seller fulfilment orders, delivery jobs,
-- inventory movements, payment events and settlement ledgers. See SECURITY_REVIEW.md.
-- No Supabase project is connected. This file is retained for review/history only.
create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'customer' check (role in ('customer', 'maker', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  maker_name text not null,
  category text not null,
  description text not null default '',
  price_inr integer not null check (price_inr >= 0),
  image_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.maker_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  applicant_name text not null,
  business_name text not null,
  email text not null,
  phone text,
  locality text,
  product_types text,
  story text,
  consent_to_contact boolean not null default false,
  status text not null default 'submitted' check (status in ('submitted', 'reviewing', 'approved', 'declined')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  currency text not null default 'INR' check (currency = 'INR'),
  subtotal_inr integer not null check (subtotal_inr >= 0),
  shipping_inr integer not null default 0 check (shipping_inr >= 0),
  total_inr integer generated always as (subtotal_inr + shipping_inr) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name_snapshot text not null,
  maker_name_snapshot text not null,
  unit_price_inr integer not null check (unit_price_inr >= 0),
  quantity integer not null check (quantity > 0),
  line_total_inr integer generated always as (unit_price_inr * quantity) stored
);

create index if not exists products_status_category_idx on public.products(status, category);
create index if not exists maker_applications_status_created_idx on public.maker_applications(status, created_at desc);
create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- Automatically create a least-privilege customer profile after Supabase Auth signup.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created_triprasa on auth.users;
create trigger on_auth_user_created_triprasa
after insert on auth.users
for each row execute function private.handle_new_user();

-- The function lives in a non-exposed schema and checks the authenticated user's DB role.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.maker_applications enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Profiles: signed-in users can read their own profile; role changes are admin-only.
drop policy if exists "profiles_read_own_or_admin" on public.profiles;
create policy "profiles_read_own_or_admin" on public.profiles
for select to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

-- Published catalogue is public. Only admins can manage products.
drop policy if exists "published_products_read_public" on public.products;
create policy "published_products_read_public" on public.products
for select to anon, authenticated
using (status = 'published' or (select private.is_admin()));

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert" on public.products
for insert to authenticated
with check ((select private.is_admin()));

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update" on public.products
for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete" on public.products
for delete to authenticated
using ((select private.is_admin()));

-- Maker applications require sign-in. Applicants can submit and read only their own.
drop policy if exists "maker_application_submit_own" on public.maker_applications;
create policy "maker_application_submit_own" on public.maker_applications
for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "maker_application_read_own_or_admin" on public.maker_applications;
create policy "maker_application_read_own_or_admin" on public.maker_applications
for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists "maker_application_admin_update" on public.maker_applications;
create policy "maker_application_admin_update" on public.maker_applications
for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

-- Orders are account-scoped. Live checkout/payment should not be enabled until server-side
-- price validation, stock reservation, and payment verification are implemented.
drop policy if exists "orders_read_own_or_admin" on public.orders;
create policy "orders_read_own_or_admin" on public.orders
for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()));

-- Client-side order creation is intentionally disabled until a trusted server-side
-- checkout validates current prices, stock, totals, and verified payment status.
drop policy if exists "orders_insert_pending_own" on public.orders;

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "order_items_read_order_owner_or_admin" on public.order_items;
create policy "order_items_read_order_owner_or_admin" on public.order_items
for select to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and (o.user_id = (select auth.uid()) or (select private.is_admin()))
  )
);

-- Client-side order-item creation is intentionally disabled until trusted checkout exists.
drop policy if exists "order_items_insert_pending_owned_order" on public.order_items;

grant select on public.products to anon, authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert on public.maker_applications to authenticated;
grant update on public.maker_applications to authenticated;
grant select on public.orders to authenticated;
grant update on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant select, update on public.profiles to authenticated;

-- Create a user account through Supabase Auth, then promote the intended operator manually:
-- update public.profiles set role = 'admin' where id = '<AUTH_USER_UUID>';
-- Do not allow users to self-assign roles from the browser.
