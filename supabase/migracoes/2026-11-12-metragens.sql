-- ============================================================================
-- Metragens por tipo de imóvel: terreno e construção.
-- Casa, sobrado, chácara, sítio e comercial têm as duas; apartamento e terreno têm uma só.
--
-- Como usar: Supabase > SQL Editor > New query > cole TUDO isto > Run.
-- Pode rodar de novo: nada é apagado. A coluna antiga "area" fica como está (sem uso).
-- ============================================================================

alter table public.imoveis add column if not exists area_terreno numeric(10, 2) check (area_terreno >= 0);
alter table public.imoveis add column if not exists area_construida numeric(10, 2) check (area_construida >= 0);

-- Imóveis já cadastrados com a coluna antiga "area":
-- terreno passa a ter "área do terreno"; os demais, "área construída" (ou do apartamento).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'imoveis' and column_name = 'area'
  ) then
    update public.imoveis set area_terreno = area
      where tipo = 'terreno' and area_terreno is null and area is not null;
    update public.imoveis set area_construida = area
      where tipo <> 'terreno' and area_construida is null and area is not null;
  end if;
end
$$;
