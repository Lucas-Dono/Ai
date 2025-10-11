# 🤝 Contributing to Creador de Inteligencias

## 📋 GitFlow Strategy

Este proyecto usa **GitFlow** para un desarrollo profesional y escalable.

### Estructura de Branches

```
main (producción) ────────────────────────────────────────
  │
  └─→ develop (desarrollo) ───────────────────────────────
       │
       ├─→ feature/fase-1-monetization
       ├─→ feature/fase-2-credits
       ├─→ feature/fase-3-api-rest
       ├─→ feature/fase-4-websockets
       ├─→ feature/fase-5-rag-memory
       ├─→ feature/fase-6-analytics
       ├─→ feature/fase-7-marketplace
       ├─→ feature/fase-8-onboarding
       ├─→ feature/fase-9-teams
       └─→ feature/fase-10-testing
```

### Branch Types

#### 🌳 `main`
- **Propósito**: Código en producción, siempre estable
- **Protección**: Requiere PR review + tests passing
- **Deploy**: Automático a producción

#### 🔧 `develop`
- **Propósito**: Rama de integración para desarrollo activo
- **Protección**: Requiere PR review
- **Deploy**: Automático a staging

#### ✨ `feature/*`
- **Propósito**: Nuevas funcionalidades
- **Naming**: `feature/fase-{número}-{descripción}`
- **Base**: Se crean desde `develop`
- **Merge**: Se fusionan de vuelta a `develop`

#### 🐛 `bugfix/*`
- **Propósito**: Corrección de bugs no críticos
- **Base**: Se crean desde `develop`

#### 🚨 `hotfix/*`
- **Propósito**: Corrección urgente en producción
- **Base**: Se crean desde `main`
- **Merge**: Se fusionan a `main` Y `develop`

### Workflow para Nuevas Features

```bash
# 1. Actualizar develop
git checkout develop
git pull origin develop

# 2. Crear feature branch
git checkout -b feature/fase-1-monetization

# 3. Trabajar y commitear
git add .
git commit -m "feat: add Stripe integration"

# 4. Push al remoto
git push -u origin feature/fase-1-monetization

# 5. Crear Pull Request a develop
# (En GitHub/GitLab)

# 6. Después del merge, actualizar develop
git checkout develop
git pull origin develop

# 7. Eliminar feature branch
git branch -d feature/fase-1-monetization
```

### Commit Message Convention

Usamos **Conventional Commits** para mensajes claros:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

#### Types:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formateo, sin cambios de código
- `refactor`: Refactorización de código
- `perf`: Mejora de performance
- `test`: Agregar o modificar tests
- `chore`: Mantenimiento (deps, config, etc.)
- `ci`: Cambios en CI/CD

#### Examples:
```bash
feat(auth): add Google OAuth provider
fix(chat): resolve message duplication issue
docs(readme): update installation instructions
refactor(api): simplify error handling
perf(db): add indexes for faster queries
test(auth): add unit tests for login flow
```

### Code Review Guidelines

#### Para el Autor:
- ✅ Tests passing
- ✅ Sin errores de lint
- ✅ Descripción clara del PR
- ✅ Screenshots si hay cambios UI
- ✅ Actualizar documentación si es necesario

#### Para el Reviewer:
- ✅ Código claro y mantenible
- ✅ Tests apropiados
- ✅ Sin vulnerabilidades de seguridad
- ✅ Sigue las convenciones del proyecto
- ✅ Performance considerations

### Release Process

```bash
# 1. Crear release branch desde develop
git checkout -b release/v1.0.0 develop

# 2. Preparar release (version bump, changelog)
npm version minor
npm run build

# 3. Merge a main
git checkout main
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"

# 4. Merge de vuelta a develop
git checkout develop
git merge --no-ff release/v1.0.0

# 5. Push todo
git push origin main develop --tags

# 6. Eliminar release branch
git branch -d release/v1.0.0
```

### Hotfix Process

```bash
# 1. Crear hotfix desde main
git checkout -b hotfix/critical-bug main

# 2. Fix y commit
git commit -m "fix: resolve critical security issue"

# 3. Merge a main
git checkout main
git merge --no-ff hotfix/critical-bug
git tag -a v1.0.1 -m "Hotfix v1.0.1"

# 4. Merge a develop también
git checkout develop
git merge --no-ff hotfix/critical-bug

# 5. Push
git push origin main develop --tags
```

## 🧪 Testing Requirements

Todo código debe incluir tests apropiados:

- **Unit tests**: Funciones y utilities
- **Integration tests**: API endpoints
- **E2E tests**: Flujos críticos de usuario

```bash
# Ejecutar todos los tests
npm test

# Tests con UI
npm run test:ui

# Tests con coverage
npm run test:coverage
```

## 📝 Documentation

Mantener actualizado:
- README.md
- API documentation (Swagger)
- Code comments para lógica compleja
- CHANGELOG.md

## 🚀 Development Setup

```bash
# Clonar repo
git clone <repo-url>
cd creador-inteligencias

# Instalar dependencias
npm install

# Setup database
npx prisma db push
npm run db:seed

# Start dev server
npm run dev
```

## ❓ Questions?

Si tienes dudas sobre el proceso de contribución, abre un issue o contacta al equipo.

---

**Happy Coding! 🎉**
