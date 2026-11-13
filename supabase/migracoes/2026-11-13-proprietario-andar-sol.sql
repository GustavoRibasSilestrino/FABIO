-- ============================================================================
-- 1) Apartamento: andar e posição solar (aparecem no anúncio do site).
-- 2) Proprietário: nome e telefone do atual dono do imóvel, que só o administrador vê.
--
-- O proprietário fica numa tabela À PARTE de propósito. A tabela "imoveis" é lida por qualquer
-- visitante do site (a chave pública libera a leitura dela), então um dado privado não pode morar
-- lá, nem em coluna escondida. Na tabela nova ninguém além do administrador lê ou grava.
--
-- Como usar: Supabase > SQL Editor > New query > cole TUDO isto > Run.
-- Pode rodar de novo: nada é apagado.
-- ============================================================================

-- 1. Andar e posição solar (só fazem sentido em apartamento) ---------------------
alter table public.imoveis add column if not exists andar smallint check (andar between 0 and 200);  -- 0 = térreo
alter table public.imoveis add column if not exists posicao_solar text check (posicao_solar in ('nascente', 'poente', 'norte', 'sul'));


-- 2. Proprietário (privado) ---------------------------------------------------------
create table if not exists public.imovel_proprietarios (
  imovel_id     uuid primary key references public.imoveis (id) on delete cascade,  -- apagar o imóvel apaga isto junto
  nome          text check (char_length(nome) <= 120),
  telefone      text check (char_length(telefone) <= 30),
  atualizado_em timestamptz not null default now()
);

drop trigger if exists imovel_proprietarios_atualizado on public.imovel_proprietarios;
create trigger imovel_proprietarios_atualizado
  before update on public.imovel_proprietarios
  for each row execute function public.imoveis_toca_atualizado();

alter table public.imovel_proprietarios enable row level security;

-- visitante (anon) não tem acesso nenhum; só quem está logado e é administrador
revoke all on public.imovel_proprietarios from anon;
grant select, insert, update, delete on public.imovel_proprietarios to authenticated;

drop policy if exists "admin gerencia proprietarios" on public.imovel_proprietarios;
create policy "admin gerencia proprietarios" on public.imovel_proprietarios
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- faz a API enxergar as colunas e a tabela novas na hora
notify pgrst, 'reload schema';
