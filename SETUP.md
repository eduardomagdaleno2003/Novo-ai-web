# Office AI — Setup Guide

## 1. SQL para Supabase

Pegar en **Supabase → SQL Editor → New Query** el contenido de `supabase/schema.sql`.

Si quieres datos de prueba, ejecuta también `supabase/seed.sql`.

## 2. Variables de entorno

El archivo `.env.local` ya está creado con tus credenciales.
Para producción en Vercel, agrega estas variables en el dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=https://lgergzksxaevklqdeamy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_8i-Tz0i8fH7442qc--LFhQ__J6Znf1K
```

## 3. Correr localmente

```bash
# Instalar nvm (si no lo tienes)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Cargar nvm
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"

# Instalar deps (solo primera vez)
npm --prefix ~/office-ai-web install

# Iniciar servidor
npm --prefix ~/office-ai-web run dev
```

Abre http://localhost:3000 → redirige automáticamente a /dashboard

## 4. Deploy en Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# En la carpeta del proyecto
cd ~/office-ai-web
vercel

# O conecta el repo en vercel.com:
# 1. Push a GitHub
# 2. Importar proyecto en vercel.com/new
# 3. Agregar las env vars en Settings → Environment Variables
# 4. Deploy
```

## 5. Rutas disponibles

| Ruta             | Descripción                        |
|------------------|------------------------------------|
| /dashboard       | KPIs + proyectos recientes + actividad |
| /projects        | Lista de proyectos                 |
| /projects/new    | Crear proyecto                     |
| /projects/[id]   | Detalle: docs + historial          |
| /agents          | Agentes del sistema                |
| /documents       | Todos los documentos generados     |
| /history         | Timeline de actividad              |
| /settings        | Config + integraciones             |
