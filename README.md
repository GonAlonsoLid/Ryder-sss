# 🏆 SSS Ryder Cup

La app definitiva para la Ryder Cup del grupo SSS. Webapp responsive + PWA instalable.

## ✨ Features

- **🏌️ Ryder Scoring**: Matchplay por equipos con actualización en vivo
- **📊 Leaderboard**: Rankings de equipos en tiempo real
- **🍺 Contador de Copas**: Registra tus bebidas y compite por el trono
- **🎯 Challenges**: Retos divertidos con validación entre amigos
- **🏆 Trofeos**: MVP, King of Drinks, Challenge Master y más
- **📱 PWA**: Instalable en móvil con experiencia nativa

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth + Postgres + RLS + Realtime)
- **Deploy**: Vercel (frontend) + Supabase Cloud (backend)

## 🚀 Setup Rápido

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto (región EU West para España)
3. Espera a que se inicialice (~2 min)

### 2. Configurar base de datos

⚠️ **IMPORTANTE**: Si ves el error "Could not find the table 'public.profiles'", necesitas ejecutar las migraciones SQL.

**Pasos detallados:**

1. En Supabase Dashboard, ve a **SQL Editor** (menú lateral)
2. Haz clic en **New Query**
3. Ejecuta **cada archivo en orden** (copia y pega todo el contenido):

   **a) Primero:** `supabase/migrations/00001_initial_schema.sql`
   - Crea todas las tablas, tipos, índices y triggers
   - Haz clic en **Run** (o `Cmd+Enter`)
   
   **b) Segundo:** `supabase/migrations/00002_rls_policies.sql`
   - Crea las políticas de Row Level Security
   - Haz clic en **Run**
   
   **c) Tercero:** `supabase/migrations/00003_seed_data.sql`
   - Inserta datos iniciales (torneo, equipos Pimentonas/Tabaqueras, rondas, retos, trofeos)
   - Haz clic en **Run**

4. Verifica en **Table Editor** que las tablas existen (especialmente `profiles`, `teams`, `tournaments`)

📖 **Guía detallada**: Ver `SETUP_SUPABASE.md` para troubleshooting

### 3. Configurar Authentication

En Supabase Dashboard > Authentication > Providers:

1. **Email**: Activado con Magic Link
2. En **URL Configuration**:
   - Site URL: `http://localhost:3000` (dev) o tu dominio de Vercel (prod)
   - Redirect URLs: Añadir `http://localhost:3000/auth/callback` y `https://tu-dominio.vercel.app/auth/callback`

### 4. Variables de entorno

1. Copia el archivo de ejemplo:
```bash
cp env.example .env.local
```

2. **Obtén tus credenciales de Supabase:**
   - Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
   - Ve a **Settings** (⚙️) > **API**
   - Copia:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Edita `.env.local` y reemplaza los valores:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

⚠️ **IMPORTANTE**: Sin estas variables configuradas, la app no funcionará. El error "Load failed" indica que faltan estas credenciales.

### 5. Instalar y ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📱 Crear usuarios / invitar jugadores

### Opción A: Magic Link (Recomendado)

1. Cada jugador va a la app y pone su email
2. Recibe un email con enlace mágico
3. Al hacer clic, entra y completa onboarding
4. **Después del onboarding**: Ve al dashboard y espera a que el admin te asigne a matches

### Opción B: Admin crea usuarios

En Supabase Dashboard > Authentication > Users:
1. Click "Invite user"
2. Introduce email del jugador
3. El jugador recibirá email de invitación

### Hacer ADMIN a un usuario

**Opción 1: Desde Supabase SQL Editor** (primera vez)

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE display_name = 'TuNombre' OR nickname = 'TuApodo';
```

**Opción 2: Desde la app** (si ya hay un admin)
- El admin va a `/admin` > Tab "Jugadores"
- Hace clic en "Hacer Admin" junto al nombre

## 🎯 Después del Onboarding

Una vez completado el onboarding, los jugadores pueden:
- ✅ Ver el torneo y equipos
- ✅ Registrar copas
- ✅ Ver retos y validar los de otros
- ✅ Ver rankings

**Pero necesitan que el ADMIN:**
- ⚠️ Asigne jugadores a los matches (desde `/admin` > Tab "Matches")
- ⚠️ (Opcional) Asigne retos a jugadores

📖 **Guía completa**: Ver `FLUJO_POST_ONBOARDING.md`

## 🚀 Deploy a Vercel

### 1. Push a GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Import project desde GitHub
3. Añade las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (tu dominio de Vercel)

### 3. Actualizar Supabase

En Supabase > Authentication > URL Configuration:
- Añade tu dominio de Vercel a Site URL y Redirect URLs

## 📊 Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/           # Login y onboarding
│   ├── (main)/           # App principal con nav
│   │   ├── page.tsx      # Dashboard
│   │   ├── tournament/   # Vista del torneo
│   │   ├── rounds/       # Detalle de rondas
│   │   ├── matches/      # Detalle de partidos
│   │   ├── leaderboards/ # Rankings
│   │   ├── drinks/       # Contador de copas
│   │   ├── challenges/   # Retos
│   │   ├── trophies/     # Vitrina
│   │   ├── settings/     # Config usuario
│   │   └── admin/        # Panel admin
│   └── auth/callback/    # Auth redirect
├── components/
│   ├── ui/               # shadcn components
│   ├── layout/           # Header, BottomNav
│   └── features/         # EventsFeed, etc
├── hooks/                # Custom hooks
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── constants.ts      # Constantes
│   └── utils.ts          # Utilidades
└── types/
    └── database.ts       # Tipos TypeScript
```

## 🎮 Datos del Torneo

### Equipos

| 🔴 Pimentonas (Jorge) | 🔵 Tabaqueras (Yago) |
|----------------------|---------------------|
| Jorge (Capitán)      | Yago (Capitán)      |
| Miguel               | Marcos              |
| Pedro                | Enrique             |
| Sebas                | Semmler             |
| Felipe               | Gonzi               |

### Rondas

1. **R1: Scramble** (Sábado) - Valdecañas - Todos los jugadores del equipo juegan desde la mejor posición
2. **R2: Singles 1v1** (Domingo) - Valdecañas - Enfrentamientos individuales

### Puntuación

- Victoria: 1 punto
- Empate: 0.5 puntos cada uno
- Se necesitan 3.5 puntos para ganar (6 partidos totales: 1 scramble + 5 singles)

## 🔧 Scripts

```bash
npm run dev        # Desarrollo
npm run build      # Build producción
npm run start      # Servidor producción
npm run lint       # Linter
npm run typecheck  # Check tipos TS
```

## 📝 Notas

- Los matches vienen sin jugadores asignados. El ADMIN debe asignarlos desde el panel.
- El primer usuario que se registre puede ser convertido en admin vía SQL.
- La app usa Realtime de Supabase para actualizaciones en vivo.
- PWA: Los iconos son placeholders SVG. Para producción, genera PNGs de 192x192 y 512x512.

## 🍺 Hecho con cariño para los SSS

¡Que gane el mejor! 🏆
