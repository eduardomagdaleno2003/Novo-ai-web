-- ============================================================
--  Office AI — Seed Data (opcional)
--  Correr en SQL Editor para tener datos de prueba
-- ============================================================

-- Agentes
insert into agentes (nombre, rol, descripcion, estado) values
  ('Jefe',     'Director de Proyectos', 'Coordina el equipo, crea planes ejecutivos y revisa entregables',            'active'),
  ('Analista', 'Analista de Datos',     'Genera reportes Excel y análisis PDF con métricas del proyecto',             'active'),
  ('RH',       'Director de RH',        'Crea presentaciones PowerPoint y comunicados oficiales para el equipo',      'active');

-- Proyecto de ejemplo
insert into proyectos (nombre, descripcion, estado, fecha_inicio) values
  ('Lanzamiento App Móvil Q1', 'Desarrollo y lanzamiento de la aplicación móvil para el primer trimestre', 'in_progress', current_date);

-- Historial de ejemplo
insert into historial (proyecto_id, tipo_evento, descripcion)
select id, 'proyecto_creado', 'Proyecto "Lanzamiento App Móvil Q1" creado'
from proyectos where nombre = 'Lanzamiento App Móvil Q1' limit 1;
