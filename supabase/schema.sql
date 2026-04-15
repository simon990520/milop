-- ================================================================
-- Polycol – Schema completo para Supabase
-- Ejecuta esto en: Supabase Dashboard → SQL Editor → New query
-- IMPORTANTE: Debes tener una plantilla JWT de Supabase en Clerk
-- para que las políticas auth.uid() funcionen.
-- ================================================================

-- Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- ================================================================
-- Limpiar tablas previas (en orden por dependencias)
-- ================================================================
drop table if exists public.comments cascade;
drop table if exists public.bets     cascade;
drop table if exists public.markets  cascade;
drop table if exists public.users    cascade;

-- ================================================================
-- TABLA: users
-- Sincronizada desde Clerk en el primer login
-- ================================================================
create table public.users (
  id          text        primary key,          -- Clerk user_id
  username    text,
  avatar_url  text,
  balance     numeric(18,2) not null default 1000.00,
  is_admin    boolean     not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.users is 'Perfil de usuario sincronizado desde Clerk';

alter table public.users enable row level security;

create policy "Lectura pública de usuarios"
  on public.users for select using (true);

create policy "El usuario puede crear su propio perfil"
  on public.users for insert with check ((auth.jwt() ->> 'sub') = id);

create policy "El usuario puede actualizar su propio perfil"
  on public.users for update using ((auth.jwt() ->> 'sub') = id);

-- ================================================================
-- TABLA: markets
-- ================================================================
create table public.markets (
  id          uuid        primary key default uuid_generate_v4(),
  question    text        not null,
  description text,
  image_url   text,
  category    text        not null default 'General',
  pool_yes    numeric(18,2) not null default 500.00,
  pool_no     numeric(18,2) not null default 500.00,
  resolved    boolean     not null default false,
  outcome     text        check (outcome in ('SÍ','NO') or outcome is null),
  closes_at   timestamptz,
  created_by  text        references public.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

comment on table public.markets is 'Eventos de predicción sobre los que se puede apostar';
comment on column public.markets.pool_yes is 'Monto total apostado a SÍ';
comment on column public.markets.pool_no  is 'Monto total apostado a NO';
comment on column public.markets.outcome  is 'Resultado final: SÍ, NO o null si no está resuelto';

alter table public.markets enable row level security;

create policy "Lectura pública de mercados"
  on public.markets for select using (true);

-- Solo administradores pueden mutar mercados (o usando el service_role key en el backend)
create policy "Solo admin puede insertar mercados"
  on public.markets for insert with check (exists (select 1 from public.users where id = (auth.jwt() ->> 'sub') and is_admin = true));

create policy "Solo admin puede actualizar mercados"
  on public.markets for update using (exists (select 1 from public.users where id = (auth.jwt() ->> 'sub') and is_admin = true));

create policy "Solo admin puede eliminar mercados"
  on public.markets for delete using (exists (select 1 from public.users where id = (auth.jwt() ->> 'sub') and is_admin = true));

-- ================================================================
-- TABLA: bets
-- ================================================================
create table public.bets (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     text        not null references public.users(id)    on delete cascade,
  market_id   uuid        not null references public.markets(id)  on delete cascade,
  outcome     text        not null check (outcome in ('SÍ','NO')),
  amount      numeric(18,2) not null check (amount > 0),
  shares      numeric(18,6) not null,
  price       numeric(8,6)  not null check (price > 0 and price <= 1),
  created_at  timestamptz not null default now()
);

comment on table public.bets is 'Apuestas individuales de usuarios';
comment on column public.bets.shares is 'Número de acciones compradas al precio dado';
comment on column public.bets.price  is 'Precio por acción en el momento de la compra (0 a 1)';

create index bets_user_id_idx    on public.bets(user_id);
create index bets_market_id_idx  on public.bets(market_id);

alter table public.bets enable row level security;

create policy "Lectura pública de apuestas"
  on public.bets for select using (true);

create policy "Insertar apuesta propia"
  on public.bets for insert with check ((auth.jwt() ->> 'sub') = user_id);

-- ================================================================
-- TABLA: comments
-- ================================================================
create table public.comments (
  id          uuid        primary key default uuid_generate_v4(),
  market_id   uuid        not null references public.markets(id) on delete cascade,
  user_id     text        not null references public.users(id)   on delete cascade,
  username    text        not null default 'Anónimo',
  avatar_url  text,
  content     text        not null check (char_length(content) between 1 and 1000),
  created_at  timestamptz not null default now()
);

comment on table public.comments is 'Comentarios sociales sobre cada mercado';

create index comments_market_id_idx on public.comments(market_id);
create index comments_created_at_idx on public.comments(created_at desc);

alter table public.comments enable row level security;

create policy "Lectura pública de comentarios"
  on public.comments for select using (true);

create policy "Insertar comentario propio"
  on public.comments for insert with check ((auth.jwt() ->> 'sub') = user_id);

create policy "Eliminar comentario propio"
  on public.comments for delete using ((auth.jwt() ->> 'sub') = user_id);

-- ================================================================
-- DATOS INICIALES: mercados de ejemplo
-- ================================================================
insert into public.markets (question, description, category, pool_yes, pool_no, closes_at) values

('¿Bitcoin superará los $150,000 antes de fin de 2025?',
 'Este mercado se resuelve SÍ si el precio spot de Bitcoin supera los $150,000 USD en cualquier exchange principal antes del 31 de diciembre de 2025.',
 'Crypto', 7500, 2500, '2025-12-31 23:59:59+00'),

('¿SpaceX aterrizará humanos en Marte antes de 2030?',
 'Se resuelve SÍ si SpaceX completa con éxito una misión tripulada a Marte antes del 1 de enero de 2030.',
 'Ciencia', 3000, 7000, '2029-12-31 23:59:59+00'),

('¿La final del Mundial 2026 se jugará en EE.UU.?',
 'Se resuelve SÍ si la final de la Copa Mundial FIFA 2026 se juega en una de las ciudades sede de Estados Unidos.',
 'Deportes', 8000, 2000, '2026-07-20 23:59:59+00'),

('¿Alguna IA alcanzará la inteligencia general (AGI) antes de 2026?',
 'Se resuelve SÍ si alguna organización demuestra y verifica públicamente una Inteligencia General Artificial antes del 31 de diciembre de 2026.',
 'IA', 4500, 5500, '2026-12-31 23:59:59+00'),

('¿La temperatura media global subirá 1.5°C sobre niveles preindustriales en 2025?',
 'Se resuelve SÍ según el informe anual de temperatura media de la OMM o NASA GISS para 2025.',
 'Clima', 6500, 3500, '2026-03-01 23:59:59+00'),

('¿Elon Musk seguirá siendo CEO de Tesla durante todo 2025?',
 'Se resuelve SÍ si Elon Musk continúa como CEO de Tesla el 31 de diciembre de 2025.',
 'Negocios', 7000, 3000, '2025-12-31 23:59:59+00');


-- ================================================================
-- RPC: place_bet
-- Realiza la apuesta de manera transaccional y segura
-- ================================================================
create or replace function public.place_bet(
  p_market_id uuid,
  p_outcome text,
  p_amount numeric
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id text;
  v_pool_yes numeric;
  v_pool_no numeric;
  v_total_pool numeric;
  v_outcome_pool numeric;
  v_price numeric;
  v_shares numeric;
  v_user_balance numeric;
begin
  v_user_id := (auth.jwt() ->> 'sub');
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;

  if p_amount <= 0 or p_outcome not in ('SÍ', 'NO') then
    raise exception 'Parámetros inválidos';
  end if;

  select balance into v_user_balance from public.users where id = v_user_id for update;
  if v_user_balance < p_amount then
    raise exception 'Saldo insuficiente';
  end if;

  select pool_yes, pool_no into v_pool_yes, v_pool_no
  from public.markets where id = p_market_id and resolved = false for update;
  if not found then
    raise exception 'Mercado no encontrado o ya resuelto';
  end if;

  update public.users set balance = balance - p_amount where id = v_user_id;

  v_total_pool := v_pool_yes + v_pool_no;
  if p_outcome = 'SÍ' then
    v_outcome_pool := v_pool_yes;
  else
    v_outcome_pool := v_pool_no;
  end if;
  
  v_price := v_outcome_pool / v_total_pool;
  v_shares := p_amount / v_price;

  if p_outcome = 'SÍ' then
    update public.markets set pool_yes = pool_yes + p_amount where id = p_market_id;
  else
    update public.markets set pool_no = pool_no + p_amount where id = p_market_id;
  end if;

  insert into public.bets (user_id, market_id, outcome, amount, shares, price)
  values (v_user_id, p_market_id, p_outcome, p_amount, v_shares, v_price);
end;
$$;

-- ================================================================
-- RPC: resolve_market_and_payout
-- Resuelve mercado y paga a los ganadores (Solo admin)
-- ================================================================
create or replace function public.resolve_market_and_payout(
  p_market_id uuid,
  p_outcome text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id text;
  v_is_admin boolean;
  b record;
  v_payout numeric;
begin
  v_admin_id := (auth.jwt() ->> 'sub');
  select is_admin into v_is_admin from public.users where id = v_admin_id;
  if not coalesce(v_is_admin, false) then
    raise exception 'No autorizado. Solo admin.';
  end if;

  if p_outcome not in ('SÍ', 'NO') then
    raise exception 'Resultado invalido';
  end if;

  update public.markets
  set resolved = true, outcome = p_outcome, closes_at = now()
  where id = p_market_id and resolved = false;

  if not found then
    raise exception 'Mercado ya resuelto o no encontrado';
  end if;

  for b in (select user_id, shares from public.bets where market_id = p_market_id and outcome = p_outcome) loop
    v_payout := b.shares; -- 1 share paga $1
    update public.users set balance = balance + v_payout where id = b.user_id;
  end loop;
end;
$$;

-- ================================================================
-- RPC: Funciones de Billetera Virtual (Carga/Retiro)
-- ================================================================
create or replace function public.deposit_funds(p_amount numeric) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id text;
begin
  v_user_id := (auth.jwt() ->> 'sub');
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;
  if p_amount <= 0 then
    raise exception 'Monto invalido';
  end if;
  update public.users set balance = balance + p_amount where id = v_user_id;
end;
$$;

create or replace function public.withdraw_funds(p_amount numeric) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id text;
  v_current_balance numeric;
begin
  v_user_id := (auth.jwt() ->> 'sub');
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;
  if p_amount <= 0 then
    raise exception 'Monto invalido';
  end if;

  select balance into v_current_balance from public.users where id = v_user_id for update;
  if v_current_balance < p_amount then
    raise exception 'Saldo insuficiente';
  end if;

  update public.users set balance = balance - p_amount where id = v_user_id;
end;
$$;
