-- ============================================================
--  Office AI — Schema Supabase
--  Pegar en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PROYECTOS
create table if not exists proyectos (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  descripcion text,
  estado      text not null default 'draft'
                   check (estado in ('draft', 'in_progress', 'completed')),
  fecha_inicio date,
  fecha_fin    date,
  created_at   timestamptz default now()
);

-- 2. AGENTES
create table if not exists agentes (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  rol         text not null,
  descripcion text,
  estado      text not null default 'active'
                   check (estado in ('active', 'inactive')),
  created_at  timestamptz default now()
);

-- 3. DOCUMENTOS
create table if not exists documentos (
  id          uuid primary key default gen_random_uuid(),
  proyecto_id uuid references proyectos(id) on delete cascade,
  agente_id   uuid references agentes(id) on delete set null,
  nombre      text not null,
  titulo      text not null,
  tipo        text not null check (tipo in ('word', 'excel', 'pdf', 'ppt')),
  contenido   text,
  ruta        text,
  created_at  timestamptz default now()
);

-- 4. HISTORIAL
create table if not exists historial (
  id          uuid primary key default gen_random_uuid(),
  proyecto_id uuid references proyectos(id) on delete cascade,
  tipo_evento text not null,
  descripcion text not null,
  metadata    jsonb,
  created_at  timestamptz default now()
);

-- ============================================================
--  ÍNDICES
-- ============================================================
create index if not exists idx_documentos_proyecto on documentos(proyecto_id);
create index if not exists idx_historial_proyecto  on historial(proyecto_id);
create index if not exists idx_historial_created   on historial(created_at desc);
create index if not exists idx_proyectos_estado    on proyectos(estado);

-- ============================================================
--  ROW LEVEL SECURITY (preparado para auth futura)
--  Por ahora: acceso público anon para desarrollo
-- ============================================================
alter table proyectos  enable row level security;
alter table agentes    enable row level security;
alter table documentos enable row level security;
alter table historial  enable row level security;

-- Políticas permisivas para anon (cambiar cuando agregues auth)
create policy "anon_all_proyectos"  on proyectos  for all to anon using (true) with check (true);
create policy "anon_all_agentes"    on agentes    for all to anon using (true) with check (true);
create policy "anon_all_documentos" on documentos for all to anon using (true) with check (true);
create policy "anon_all_historial"  on historial  for all to anon using (true) with check (true);
