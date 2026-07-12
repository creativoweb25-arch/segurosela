# Seguros y Fianzas ELA — Sitio Web

Sitio web corporativo de Seguros y Fianzas ELA, empresa 100% mexicana con más de 10 años de trayectoria en Tijuana, Baja California.

## 🚀 Tecnología

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS 4 + shadcn/ui
- **Base de datos**: Prisma ORM + SQLite
- **Email**: Resend
- **Autenticación**: Cookie + token (panel admin)

## 📋 Requisitos

- Node.js 20+ o Bun
- Cuenta de [Resend](https://resend.com) (gratis, para envío de correos)

## 🔧 Configuración local

```bash
# 1. Instalar dependencias
bun install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus claves reales (especialmente RESEND_API_KEY)

# 3. Crear la base de datos
bun run db:push

# 4. Cargar datos iniciales (servicios, posts, aliados, etc.)
bun run db:seed

# 5. Iniciar el servidor de desarrollo
bun run dev
```

El sitio estará disponible en `http://localhost:3000`.

## 🔐 Panel de administración

- **URL**: Click en el icono de engranaje (⚙️) en el header del sitio
- **Usuario**: `admin`
- **Contraseña**: `ela-admin-2024` (configurable en `.env` con `ADMIN_PASSWORD`)

Desde el panel puedes:
- Personalizar logo, colores, contacto y redes
- Gestionar servicios y sus coberturas
- Gestionar posts del blog
- Gestionar aliados comerciales y aseguradoras
- Gestionar ferias de salud (calendario)
- Gestionar posts de Instagram
- Ver cotizaciones y mensajes recibidos

## 📧 Configuración de correos (Resend)

1. Crea una cuenta gratis en [resend.com](https://resend.com)
2. Verifica tu dominio `segurosela.com.mx` (Resend te dará DNS records)
3. Añade los DNS records en Namecheap → Advanced DNS
4. Copia tu API key
5. Pégala en `.env` como `RESEND_API_KEY=re_tu_api_key_real`

Cuando alguien envíe una cotización o mensaje:
- Se guarda en la base de datos (visible en el panel admin)
- Se envía un correo HTML a `contacto@segurosela.com` con todos los datos

## 🚀 Deploy en Vercel

### Paso 1: Subir a GitHub

```bash
# Inicializar repositorio git (si no existe)
git init
git add .
git commit -m "Sitio Seguros ELA - producción"

# Crear repositorio en GitHub.com y subir
git remote add origin https://github.com/TU_USUARIO/segurosela.git
git branch -M main
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) y regístrate con tu cuenta de GitHub
2. Click en **"Add New Project"**
3. Selecciona tu repositorio `segurosela`
4. Vercel detecta automáticamente que es Next.js
5. En **Environment Variables**, añade:
   - `DATABASE_URL` = `file:./prisma/custom.db`
   - `RESEND_API_KEY` = `re_tu_api_key_real`
   - `RESEND_FROM_EMAIL` = `Seguros ELA <noreply@segurosela.com.mx>`
   - `CONTACT_EMAIL` = `contacto@segurosela.com`
   - `ADMIN_PASSWORD` = `ela-admin-2024`
6. Click en **"Deploy"**

### Paso 3: Apuntar el dominio

1. En Vercel: ve a **Settings → Domains**
2. Añade tu dominio: `segurosela.com.mx`
3. Vercel te dará los DNS records
4. En **Namecheap**: ve a **Domain List → Manage → Advanced DNS**
5. Añade:
   - **A Record**: `@` → `76.76.21.21`
   - **CNAME Record**: `www` → `cname.vercel-dns.com`
6. Espera 30 min - 24 hrs para que se propague el DNS
7. Vercel configura el **SSL automáticamente**

### Paso 4: Cargar datos iniciales en producción

Después del primer deploy, ejecuta el seed en Vercel:
```bash
# Desde tu computadora, con el CLI de Vercel
npm i -g vercel
vercel login
vercel link  # conecta con tu proyecto
vercel env pull .env.production  # descarga las variables
bun run db:push  # crea la BD en producción
bun run db:seed  # carga los datos iniciales
```

## 📁 Estructura del proyecto

```
src/
├── app/                    # Rutas (App Router)
│   ├── page.tsx           # Página principal (home)
│   ├── privacidad/        # Aviso de privacidad
│   ├── blog/[slug]/       # Páginas individuales de posts
│   └── api/               # API routes (15+ endpoints)
├── components/
│   ├── sections/          # Secciones del sitio (header, hero, servicios, etc.)
│   ├── admin/             # Panel de administración (10 pestañas)
│   └── ui/                # Componentes shadcn/ui
├── lib/                   # Librerías (db, auth, email, utils)
├── hooks/                 # Hooks personalizados
└── types/                 # Tipos TypeScript

prisma/
├── schema.prisma          # Esquema de la base de datos
└── seed.ts                # Datos iniciales

public/
├── images/                # Imágenes del sitio
└── uploads/               # Imágenes subidas desde el panel admin
```

## 🎨 Personalización

Todos los colores, logo, textos y contenido se pueden personalizar desde el panel de administración:
- **Logo y colores**: Panel → Personalización
- **Servicios**: Panel → Servicios
- **Posts del blog**: Panel → Publicaciones
- **Aseguradoras aliadas**: Panel → Aliados
- **Aliados comerciales**: Panel → Aliados Comerciales
- **Ferias de salud**: Panel → Ferias de Salud
- **Instagram**: Panel → Instagram

## 📝 Licencia

© 2026 Seguros y Fianzas ELA. Todos los Derechos Reservados.
