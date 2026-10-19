-- Smartmarket Phase 1 — run once in the Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role text check (role in ('buyer', 'seller')),
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  name text not null,
  description text check (char_length(description) <= 200),
  commune text not null,
  whatsapp text not null,
  logo_url text,
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id integer primary key,
  name text not null,
  emoji text,
  slug text not null unique
);

insert into public.categories (id, name, emoji, slug) values
  (1, 'Légumes frais', '🥬', 'legumes-frais'),
  (2, 'Épices & condiments', '🌿', 'epices-condiments'),
  (3, 'Conserves & secs', '🥫', 'conserves-secs'),
  (4, 'Tubercules', '🍠', 'tubercules'),
  (5, 'Herbes aromatiques', '🌱', 'herbes-aromatiques'),
  (6, 'Maraîchers divers', '🧅', 'maraichers-divers')
on conflict (id) do update set name = excluded.name, emoji = excluded.emoji, slug = excluded.slug;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  category_id integer not null references public.categories(id),
  name text not null,
  description text,
  price integer not null check (price >= 0),
  unit text not null check (unit in ('kg', 'sachet', 'botte', 'pièce', 'litre')),
  available_quantity numeric(10, 2) not null default 0 check (available_quantity >= 0),
  in_stock boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

alter table public.products
  add column if not exists available_quantity numeric(10, 2) not null default 0
  check (available_quantity >= 0);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  position integer not null default 0
);

create index if not exists products_shop_id_idx on public.products(shop_id);
create index if not exists products_category_status_idx on public.products(category_id, status);
create index if not exists product_images_product_id_idx on public.product_images(product_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.phone);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, full_name, phone)
select id, coalesce(raw_user_meta_data ->> 'full_name', ''), phone
from auth.users
on conflict (id) do nothing;

create or replace function public.guard_shop_status()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if old.status is distinct from new.status and auth.role() = 'authenticated' then
    raise exception 'Boutique status can only be changed by an administrator';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_shop_status on public.shops;
create trigger guard_shop_status
  before update on public.shops
  for each row execute function public.guard_shop_status();

create or replace function public.enforce_shop_product_limit()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  perform 1 from public.shops where id = new.shop_id for update;
  if (select count(*) from public.products where shop_id = new.shop_id) >= 50 then
    raise exception 'La limite de 50 produits par boutique est atteinte';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_shop_product_limit on public.products;
create trigger enforce_shop_product_limit
  before insert on public.products
  for each row execute function public.enforce_shop_product_limit();

alter table public.profiles enable row level security;
alter table public.shops enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (true);
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert with check (auth.uid() = id);
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists categories_select on public.categories;
create policy categories_select on public.categories for select using (true);

drop policy if exists shops_select on public.shops;
create policy shops_select on public.shops for select using (status = 'active' or owner_id = auth.uid());
drop policy if exists shops_insert on public.shops;
create policy shops_insert on public.shops for insert with check (
  owner_id = auth.uid()
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'seller')
);
drop policy if exists shops_update on public.shops;
create policy shops_update on public.shops for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists products_select on public.products;
create policy products_select on public.products for select using (
  (status = 'published' and exists (
    select 1 from public.shops s where s.id = shop_id and s.status = 'active'
  ))
  or exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid())
);
drop policy if exists products_insert on public.products;
create policy products_insert on public.products for insert with check (
  exists (
    select 1 from public.shops s
    where s.id = shop_id and s.owner_id = auth.uid()
      and (products.status = 'draft' or s.status = 'active')
  )
);
drop policy if exists products_update on public.products;
create policy products_update on public.products for update
  using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()))
  with check (exists (
    select 1 from public.shops s
    where s.id = shop_id and s.owner_id = auth.uid()
      and (products.status = 'draft' or s.status = 'active')
  ));
drop policy if exists products_delete on public.products;
create policy products_delete on public.products for delete
  using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));

drop policy if exists product_images_select on public.product_images;
create policy product_images_select on public.product_images for select using (
  exists (
    select 1 from public.products p
    join public.shops s on s.id = p.shop_id
    where p.id = product_id
      and ((p.status = 'published' and s.status = 'active') or s.owner_id = auth.uid())
  )
);
drop policy if exists product_images_insert on public.product_images;
create policy product_images_insert on public.product_images for insert with check (
  exists (
    select 1 from public.products p
    join public.shops s on s.id = p.shop_id
    where p.id = product_id and s.owner_id = auth.uid()
  )
);
drop policy if exists product_images_delete on public.product_images;
create policy product_images_delete on public.product_images for delete using (
  exists (
    select 1 from public.products p
    join public.shops s on s.id = p.shop_id
    where p.id = product_id and s.owner_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "market_images_public_read" on storage.objects;
create policy "market_images_public_read" on storage.objects for select
  using (bucket_id = 'product-images');
drop policy if exists "market_images_owner_upload" on storage.objects;
create policy "market_images_owner_upload" on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and (
      (storage.foldername(storage.objects.name))[1] = 'shops'
      and (storage.foldername(storage.objects.name))[2] = auth.uid()::text
      or (storage.foldername(storage.objects.name))[1] = 'products'
      and exists (
        select 1 from public.products p
        join public.shops s on s.id = p.shop_id
        where p.id::text = (storage.foldername(storage.objects.name))[2]
          and s.owner_id = auth.uid()
      )
    )
  );
drop policy if exists "market_images_owner_delete" on storage.objects;
create policy "market_images_owner_delete" on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and (
      ((storage.foldername(storage.objects.name))[1] = 'shops' and (storage.foldername(storage.objects.name))[2] = auth.uid()::text)
      or ((storage.foldername(storage.objects.name))[1] = 'products' and exists (
        select 1 from public.products p
        join public.shops s on s.id = p.shop_id
        where p.id::text = (storage.foldername(storage.objects.name))[2]
          and s.owner_id = auth.uid()
      ))
    )
  );
