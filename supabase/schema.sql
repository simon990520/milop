-- ================================================================
-- Polycol – Schema completo para Supabase
-- Ejecuta esto en: Supabase Dashboard → SQL Editor → New query
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
  on public.users for insert with check (true);

create policy "El usuario puede actualizar su propio perfil"
  on public.users for update using (true);

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
  outcome     text        check (outcome in ('YES','NO') or outcome is null),
  closes_at   timestamptz,
  created_by  text        references public.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

comment on table public.markets is 'Eventos de predicción sobre los que se puede apostar';
comment on column public.markets.pool_yes is 'Monto total apostado a SÍ';
comment on column public.markets.pool_no  is 'Monto total apostado a NO';
comment on column public.markets.outcome  is 'Resultado final: YES, NO o null si no está resuelto';

alter table public.markets enable row level security;

create policy "Lectura pública de mercados"
  on public.markets for select using (true);

create policy "Cualquiera puede insertar mercados"
  on public.markets for insert with check (true);

create policy "Cualquiera puede actualizar mercados"
  on public.markets for update using (true);

create policy "Cualquiera puede eliminar mercados"
  on public.markets for delete using (true);

-- ================================================================
-- TABLA: bets
-- ================================================================
create table public.bets (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     text        not null references public.users(id)    on delete cascade,
  market_id   uuid        not null references public.markets(id)  on delete cascade,
  outcome     text        not null check (outcome in ('YES','NO')),
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
  on public.bets for insert with check (true);

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
  on public.comments for insert with check (true);

create policy "Eliminar comentario propio"
  on public.comments for delete using (true);

-- ================================================================
-- DATOS INICIALES: mercados de ejemplo
-- ================================================================
insert into public.markets (question, description, category, pool_yes, pool_no, closes_at) values

('¿Bitcoin superará los $150,000 antes de fin de 2025?',
 'Este mercado se resuelve SÍ si el precio spot de Bitcoin supera los $150,000 USD en cualquier exchange principal antes del 31 de diciembre de 2025.',
 'Crypto', 7500, 2500, '2025-12-31 23:59:59+00'),

('¿SpaceX aterrizará humanos en Marte antes de 2030?',
 'Se resuelve SÍ si SpaceX completa con éxito una misión tripulada a Marte antes del 1 de enero de 2030.',
 'Science', 3000, 7000, '2029-12-31 23:59:59+00'),

('¿La final del Mundial 2026 se jugará en EE.UU.?',
 'Se resuelve SÍ si la final de la Copa Mundial FIFA 2026 se juega en una de las ciudades sede de Estados Unidos.',
 'Sports', 8000, 2000, '2026-07-20 23:59:59+00'),

('¿Alguna IA alcanzará la inteligencia general (AGI) antes de 2026?',
 'Se resuelve SÍ si alguna organización demuestra y verifica públicamente una Inteligencia General Artificial antes del 31 de diciembre de 2026.',
 'AI', 4500, 5500, '2026-12-31 23:59:59+00'),

('¿La temperatura media global subirá 1.5°C sobre niveles preindustriales en 2025?',
 'Se resuelve SÍ según el informe anual de temperatura media de la OMM o NASA GISS para 2025.',
 'Climate', 6500, 3500, '2026-03-01 23:59:59+00'),

('¿Elon Musk seguirá siendo CEO de Tesla durante todo 2025?',
 'Se resuelve SÍ si Elon Musk continúa como CEO de Tesla el 31 de diciembre de 2025.',
 'Business', 7000, 3000, '2025-12-31 23:59:59+00');
