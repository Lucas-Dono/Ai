# Blaniel

Advanced platform to create, manage and socialize with emotional and interactive AI agents.

## 🚀 Inicio Rápido

```bash
# Clonar el repositorio
git clone [url-del-repo]
cd creador-inteligencias

# Instalar dependencias
npm install

# Configurar base de datos
npm run db:setup

# Iniciar servidor de desarrollo
npm run dev
```

Visita [http://localhost:3000](http://localhost:3000)

## 📋 Prerequisitos

- Node.js 20+
- PostgreSQL (o base de datos compatible con Prisma)
- Redis (Upstash o local)
- Claves API:
  - OpenAI / OpenRouter
  - ElevenLabs (opcional, para voz)
  - Stripe / MercadoPago (opcional, para pagos)
  - Resend (opcional, para emails)

## ⚙️ Configuración

Copia `.env.example` a `.env` y configura las variables necesarias:

```bash
cp .env.example .env
```

Variables críticas:
- `DATABASE_URL`: Conexión a PostgreSQL
- `UPSTASH_REDIS_URL`: Redis para rate limiting y cache
- `NEXTAUTH_SECRET`: Secret para autenticación
- `OPENROUTER_API_KEY`: API key para LLMs

Ver [`.env.example`](.env.example) para la lista completa.

## 🏗️ Estructura del Proyecto

```
creador-inteligencias/
├── app/                    # Next.js App Router (páginas y API routes)
├── components/             # Componentes React
├── lib/                    # Lógica de negocio y servicios
│   ├── emotional-system/   # Sistema emocional OCC + Plutchik
│   ├── memory/             # Sistema de memoria vectorial
│   ├── worlds/             # Motor de simulación de mundos
│   ├── proactive-behavior/ # Comportamientos proactivos
│   └── services/           # Servicios de dominio
├── prisma/                 # Schema de base de datos
├── mobile/                 # App móvil React Native (Expo)
├── docs/                   # Documentación técnica
└── deprecated/             # Archivos históricos
```

## 🎯 Características Principales

### 🧠 Sistema Emocional Avanzado
- Modelo OCC (Ortony, Clore, Collins) para emociones cognitivas
- Mapeo a rueda de Plutchik (8 emociones primarias)
- Memoria emocional persistente
- Ver: [docs/EMOTIONAL_SYSTEM.md](docs/EMOTIONAL_SYSTEM.md)

### 💭 Memoria Inteligente
- Embeddings vectoriales con ONNX (local)
- Sistema híbrido: memoria a corto/largo plazo
- Compresión inteligente de contexto
- Ver: [docs/memory/](docs/memory/)

### 🌍 Mundos Simulados
- Motor de simulación con eventos emergentes
- Estado persistente en Redis
- Director de IA para narrativas dinámicas
- Auto-pausa por inactividad
- Ver: [docs/worlds/](docs/worlds/)

### 🎮 Gamificación
- Sistema de logros y recompensas
- Niveles y reputación
- Daily check-ins
- Ver: [docs/GAMIFICATION_SYSTEM.md](docs/GAMIFICATION_SYSTEM.md)

### 🌐 Comunidad B2C
- Posts, comentarios, votación
- Eventos y competencias
- Marketplace de personajes/prompts
- Sistema de mensajería
- Ver: [docs/COMMUNITY_SYSTEM_B2C.md](docs/COMMUNITY_SYSTEM_B2C.md)

### 💰 Sistema de Pagos Dual
- Stripe (internacional)
- MercadoPago (LATAM)
- Rate limiting por tier
- Dashboard de billing
- Ver: [docs/billing/](docs/billing/)

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con UI
npm run test:ui

# Tests con coverage
npm run test:run
```

## 📱 Mobile App

```bash
# Instalar dependencias mobile
cd mobile && npm install

# Iniciar Expo
npm run dev:mobile

# Android
npm run android

# iOS
npm run ios
```

Ver: [mobile/README.md](mobile/README.md)

## 🚢 Deployment

### Vercel (Recomendado)

1. Conecta tu repo a Vercel
2. Configura variables de entorno
3. Deploy automático en cada push

Ver: [docs/deployment/VERCEL_SETUP_GUIDE.md](docs/deployment/VERCEL_SETUP_GUIDE.md)

### Cloud Server

Ver: [docs/deployment/CLOUD_SERVER_SETUP_GUIDE.md](docs/deployment/CLOUD_SERVER_SETUP_GUIDE.md)

## 📚 Documentación

### Guías de Inicio
- [QUICK_START.md](QUICK_START.md) - APIs multimodales
- [BOOTSTRAP_STRATEGY.md](BOOTSTRAP_STRATEGY.md) - Estrategia de lanzamiento

### Documentación Técnica
- [docs/](docs/) - Documentación completa de sistemas
- [docs/billing/](docs/billing/) - Sistema de pagos
- [docs/worlds/](docs/worlds/) - Motor de mundos
- [docs/memory/](docs/memory/) - Sistema de memoria

### APIs
- [docs/ENDPOINTS_QUICK_REFERENCE.md](docs/ENDPOINTS_QUICK_REFERENCE.md) - Referencia de endpoints
- Swagger UI: `http://localhost:3000/api-docs` (en desarrollo)

## 🛠️ Scripts Útiles

```bash
# Base de datos
npm run db:setup          # Setup completo (generate + push + seed)
npm run db:migrate        # Crear migración
npm run db:reset          # Reset completo
npm run db:seed:worlds    # Seed de mundos predefinidos

# Desarrollo
npm run dev              # Servidor con Socket.IO
npm run dev:next         # Solo Next.js (sin Socket.IO)
npm run lint             # ESLint

# Build
npm run build            # Build producción
npm run start            # Start producción
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

[Especificar licencia]

## 🆘 Soporte

- 📧 Email: [tu-email]
- 💬 Discord: [tu-discord]
- 🐛 Issues: [GitHub Issues](https://github.com/[tu-repo]/issues)

## 🎯 Roadmap

- [ ] Integración con más LLM providers
- [ ] Sistema de plugins
- [ ] Marketplace de extensiones
- [ ] Apps nativas iOS/Android
- [ ] Más idiomas (actualmente: ES/EN)

---

**Hecho con ❤️ por [Tu Nombre/Equipo]**
