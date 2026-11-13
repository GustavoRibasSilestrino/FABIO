-- ============================================================================
-- Fábio Ribas · imóveis — banco de dados (Supabase / Postgres)
--
-- Como usar: Supabase > SQL Editor > New query > cole TUDO isto > Run.
-- Pode rodar de novo quando quiser: nada é apagado, só se ajusta o que faltar.
-- ============================================================================


-- 1. Quem pode administrar -----------------------------------------------------
-- Só os e-mails desta lista editam imóveis, mesmo que alguém consiga criar conta.
create table if not exists public.admins (
  email text primary key check (email = lower(email))
);
alter table public.admins enable row level security;
-- (de propósito, sem nenhuma regra de acesso: ninguém lê esta lista pela internet)

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where email = lower(auth.jwt() ->> 'email')
  );
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;


-- 2. Imóveis -------------------------------------------------------------------
create sequence if not exists public.imoveis_codigo_seq start 101;

create table if not exists public.imoveis (
  id            uuid primary key default gen_random_uuid(),
  codigo        text not null unique default ('FB-' || nextval('public.imoveis_codigo_seq')),
  titulo        text check (char_length(titulo) <= 120),
  tipo          text not null check (tipo in (
                  'casa', 'casa-condominio', 'sobrado', 'apartamento',
                  'terreno', 'chacara', 'sitio', 'comercial')),
  cidade        text not null check (char_length(cidade) <= 60),
  bairro        text not null check (char_length(bairro) between 1 and 80),
  quartos       smallint check (quartos between 0 and 50),
  banheiros     smallint check (banheiros between 0 and 50),
  vagas         smallint check (vagas between 0 and 50),
  area_terreno  numeric(10, 2) check (area_terreno >= 0),     -- m² do terreno
  area_construida numeric(10, 2) check (area_construida >= 0), -- m² construídos (ou do apartamento)
  andar         smallint check (andar between 0 and 200),      -- só apartamento; 0 = térreo
  posicao_solar text check (posicao_solar in ('nascente', 'poente', 'norte', 'sul')), -- só apartamento
  preco         bigint check (preco >= 0),          -- em reais; vazio = "Consulte"
  descricao     text check (char_length(descricao) <= 4000),
  fotos         text[] not null default '{}' check (cardinality(fotos) <= 30),
  destaque      boolean not null default false,
  status        text not null default 'ativo' check (status in ('ativo', 'vendido', 'oculto')),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Bancos criados antes das metragens por tipo (12/11/2026) ganham as duas colunas novas aqui.
-- Está também em supabase/migracoes/2026-11-12-metragens.sql.
alter table public.imoveis add column if not exists area_terreno numeric(10, 2) check (area_terreno >= 0);
alter table public.imoveis add column if not exists area_construida numeric(10, 2) check (area_construida >= 0);

-- Bancos criados antes do andar e da posição solar (13/11/2026) ganham as duas colunas aqui.
-- Está também em supabase/migracoes/2026-11-13-proprietario-andar-sol.sql.
alter table public.imoveis add column if not exists andar smallint check (andar between 0 and 200);
alter table public.imoveis add column if not exists posicao_solar text check (posicao_solar in ('nascente', 'poente', 'norte', 'sul'));

create index if not exists imoveis_vitrine_idx
  on public.imoveis (status, destaque desc, criado_em desc);

create or replace function public.imoveis_toca_atualizado()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists imoveis_atualizado on public.imoveis;
create trigger imoveis_atualizado
  before update on public.imoveis
  for each row execute function public.imoveis_toca_atualizado();


-- 3. Quem enxerga e quem altera (regras de segurança) -----------------------------
alter table public.imoveis enable row level security;

grant select on public.imoveis to anon;
grant select, insert, update, delete on public.imoveis to authenticated;
grant usage, select on sequence public.imoveis_codigo_seq to authenticated;

drop policy if exists "visitantes veem imoveis publicados" on public.imoveis;
create policy "visitantes veem imoveis publicados" on public.imoveis
  for select to anon, authenticated
  using (status in ('ativo', 'vendido'));

drop policy if exists "admin ve tudo" on public.imoveis;
create policy "admin ve tudo" on public.imoveis
  for select to authenticated
  using (public.is_admin());

drop policy if exists "admin cadastra" on public.imoveis;
create policy "admin cadastra" on public.imoveis
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "admin edita" on public.imoveis;
create policy "admin edita" on public.imoveis
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin apaga" on public.imoveis;
create policy "admin apaga" on public.imoveis
  for delete to authenticated
  using (public.is_admin());


-- 3b. Proprietário do imóvel (privado) -----------------------------------------------
-- Nome e telefone do atual dono. Ficam numa tabela à parte porque "imoveis" é lida por qualquer
-- visitante do site; esta aqui só o administrador lê e grava. Está também em
-- supabase/migracoes/2026-11-13-proprietario-andar-sol.sql.
create table if not exists public.imovel_proprietarios (
  imovel_id     uuid primary key references public.imoveis (id) on delete cascade,
  nome          text check (char_length(nome) <= 120),
  telefone      text check (char_length(telefone) <= 30),
  atualizado_em timestamptz not null default now()
);

drop trigger if exists imovel_proprietarios_atualizado on public.imovel_proprietarios;
create trigger imovel_proprietarios_atualizado
  before update on public.imovel_proprietarios
  for each row execute function public.imoveis_toca_atualizado();

alter table public.imovel_proprietarios enable row level security;
revoke all on public.imovel_proprietarios from anon;
grant select, insert, update, delete on public.imovel_proprietarios to authenticated;

drop policy if exists "admin gerencia proprietarios" on public.imovel_proprietarios;
create policy "admin gerencia proprietarios" on public.imovel_proprietarios
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- 4. Fotos (armazenamento) ---------------------------------------------------------
-- Pasta pública para leitura (as fotos aparecem no site); só o admin envia e apaga.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('imoveis', 'imoveis', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admin lista fotos" on storage.objects;
create policy "admin lista fotos" on storage.objects
  for select to authenticated
  using (bucket_id = 'imoveis' and public.is_admin());

drop policy if exists "admin envia fotos" on storage.objects;
create policy "admin envia fotos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'imoveis' and public.is_admin());

drop policy if exists "admin troca fotos" on storage.objects;
create policy "admin troca fotos" on storage.objects
  for update to authenticated
  using (bucket_id = 'imoveis' and public.is_admin())
  with check (bucket_id = 'imoveis' and public.is_admin());

drop policy if exists "admin apaga fotos" on storage.objects;
create policy "admin apaga fotos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'imoveis' and public.is_admin());


-- 5. Liberar o administrador (rode DEPOIS, trocando pelo e-mail dele) ----------------
-- insert into public.admins (email) values ('email-do-tio@exemplo.com') on conflict do nothing;
