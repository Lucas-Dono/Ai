# 🤖 Creador de Inteligencias

Plataforma SaaS para crear y gestionar IAs emocionales (Compañeros) y administrativas (Asistentes) que interactúan en mundos virtuales.

## ✨ Características Principales

- 🧠 **Motor Emocional**: Sistema VAD (Valence, Arousal, Dominance) con métricas de relación
- 👥 **Dual AI System**: Compañeros emocionales y Asistentes administrativos
- 🌍 **Mundos Virtuales**: Espacios compartidos para interacción multi-agente
- 🎨 **UI Profesional**: Diseño inspirado en Anthropic, Midjourney y Notion
- 🔄 **Real-time**: Conversaciones en tiempo real con análisis emocional
- 📊 **Analytics**: Panel de administración con estadísticas detalladas

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Database
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/creador_ia"

# Google Gemini AI
GEMINI_API_KEY="tu_api_key_aqui"

# NextAuth (opcional)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera_un_secret_aleatorio_aqui"
```

**Obtener Gemini API Key:**
1. Visita: https://makersuite.google.com/app/apikey
2. Crea un nuevo proyecto o usa uno existente
3. Copia la API key generada

### 2. Configurar Base de Datos

```bash
# Instalar dependencias
npm install

# Crear y migrar la base de datos
npm run db:migrate

# Poblar con datos de demostración (opcional pero recomendado)
npm run db:seed
```

### 3. Iniciar el Proyecto

```bash
# Modo desarrollo
npm run dev

# El proyecto estará disponible en http://localhost:3000
```

## 📦 Scripts Disponibles

```bash
npm run dev          # Inicia el servidor de desarrollo
npm run build        # Construye para producción
npm run start        # Inicia el servidor de producción
npm run lint         # Ejecuta el linter
npm run db:migrate   # Ejecuta migraciones de Prisma
npm run db:seed      # Puebla la BD con datos de demo
npm run db:reset     # Resetea la BD y ejecuta seed
```

## 🎯 Datos de Demostración

Después de ejecutar `npm run db:seed`, tendrás:

### Agentes Creados:
- **Luna** (Compañera): Empática y comprensiva
- **Aria** (Compañera): Creativa y motivadora
- **Nexus** (Asistente): Organizador eficiente
- **Atlas** (Asistente): Analista de investigación

### Mundos Virtuales:
- **Oficina Virtual**: Espacio de trabajo colaborativo
- **Espacio Creativo**: Zona de brainstorming

### Usuario Demo:
- Email: `demo@creador-ia.com`

---

**Desarrollado con ❤️ usando Next.js, Tailwind CSS y Google Gemini**
