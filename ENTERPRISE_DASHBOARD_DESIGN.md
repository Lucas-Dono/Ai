# Diseño Completo del Dashboard Empresarial de IAs Administrativas
## "AI Business Suite" - Sistema de Gestión de Agentes IA para Empresas

**Fecha:** 19 de Octubre, 2025
**Versión:** 1.0.0
**Autor:** Claude (Asistente de Diseño)

---

## Tabla de Contenidos

1. [Visión y Filosofía](#1-visión-y-filosofía)
2. [Sistema de Diseño](#2-sistema-de-diseño)
3. [Arquitectura de Información](#3-arquitectura-de-información)
4. [Especificación de Páginas](#4-especificación-de-páginas)
5. [Componentes UI](#5-componentes-ui)
6. [Flujos de Usuario](#6-flujos-de-usuario)
7. [Plan de Implementación](#7-plan-de-implementación)
8. [Consideraciones Técnicas](#8-consideraciones-técnicas)

---

## 1. Visión y Filosofía

### 1.1 Propuesta de Valor

El **AI Business Suite** es una plataforma empresarial profesional para la gestión, orquestación y monitoreo de agentes de IA administrativos. A diferencia del dashboard de consumidor (orientado a "Compañeros" emocionales), este dashboard se enfoca en **productividad, automatización y ROI empresarial**.

### 1.2 Usuarios Objetivo

- **CTOs y Líderes de Tecnología**: Necesitan visión estratégica de la infraestructura de IA
- **Gerentes de Operaciones**: Gestionan workflows y orquestación de agentes
- **Analistas de Negocio**: Monitorean KPIs y generan reportes
- **Desarrolladores**: Integran APIs y configuran agentes técnicos
- **Administradores de Equipos**: Gestionan permisos y miembros

### 1.3 Diferenciación del Dashboard de Consumidor

| Aspecto | Dashboard de Consumidor | Dashboard Empresarial |
|---------|------------------------|----------------------|
| **Tono** | Amigable, cálido, personal | Profesional, técnico, ejecutivo |
| **Colores** | Vibrantes (#F6B922 amarillo, gradientes) | Corporativos (azules, grises, acentos sutiles) |
| **Tipo de IA** | Compañeros emocionales | Asistentes administrativos |
| **Métricas** | Interacciones, relaciones | KPIs, ROI, eficiencia, uptime |
| **Funciones** | Chat, mundos, personalidad | Workflows, APIs, analytics, equipos |
| **Iconografía** | Heart, Sparkles, emociones | Briefcase, BarChart, Network, Settings |

### 1.4 Principios de Diseño

1. **Claridad sobre creatividad**: Priorizar la comprensión inmediata de datos complejos
2. **Eficiencia sobre elegancia**: Reducir clics para acciones críticas
3. **Datos sobre decoración**: Cada elemento visual debe comunicar información útil
4. **Escalabilidad**: Diseñado para equipos de 1 a 1000+ usuarios
5. **Personalización**: Dashboards adaptables por rol y preferencias

---

## 2. Sistema de Diseño

### 2.1 Paleta de Colores Profesional

#### Colores Principales (Dark Mode - por defecto)

```css
/* Brand Colors - Profesionales y sobrios */
--business-primary: #1E40AF;        /* Azul profesional (Blue-700) */
--business-primary-hover: #1E3A8A;  /* Blue-800 */
--business-primary-light: #3B82F6;  /* Blue-500 */

--business-secondary: #0F172A;      /* Slate-900 - Base oscura */
--business-secondary-light: #1E293B; /* Slate-800 */

--business-accent: #06B6D4;         /* Cyan-500 - Acentos de información */
--business-accent-light: #22D3EE;   /* Cyan-400 */

--business-success: #10B981;        /* Emerald-500 */
--business-warning: #F59E0B;        /* Amber-500 */
--business-error: #EF4444;          /* Red-500 */
--business-info: #3B82F6;           /* Blue-500 */

/* Backgrounds */
--bg-primary: #0F172A;              /* Slate-900 - Fondo principal */
--bg-secondary: #1E293B;            /* Slate-800 - Cards y paneles */
--bg-tertiary: #334155;             /* Slate-700 - Hover states */

/* Text Colors */
--text-primary: #F1F5F9;            /* Slate-100 - Texto principal */
--text-secondary: #94A3B8;          /* Slate-400 - Texto secundario */
--text-muted: #64748B;              /* Slate-500 - Texto deshabilitado */

/* Borders */
--border-default: #334155;          /* Slate-700 */
--border-light: #475569;            /* Slate-600 */
```

#### Light Mode (Opcional)

```css
/* Light Mode - Para ambientes corporativos que lo prefieran */
--business-primary: #1E40AF;
--bg-primary: #FFFFFF;
--bg-secondary: #F8FAFC;            /* Slate-50 */
--bg-tertiary: #F1F5F9;             /* Slate-100 */
--text-primary: #0F172A;            /* Slate-900 */
--text-secondary: #475569;          /* Slate-600 */
--border-default: #E2E8F0;          /* Slate-200 */
```

### 2.2 Tipografía

```css
/* Font Stack - Profesional y legible */
font-family:
  'Inter',
  'SF Pro Display',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  system-ui,
  sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px - Labels pequeños */
--text-sm: 0.875rem;    /* 14px - Texto secundario */
--text-base: 1rem;      /* 16px - Texto principal */
--text-lg: 1.125rem;    /* 18px - Subtítulos */
--text-xl: 1.25rem;     /* 20px - Títulos de card */
--text-2xl: 1.5rem;     /* 24px - Títulos de sección */
--text-3xl: 1.875rem;   /* 30px - Títulos de página */
--text-4xl: 2.25rem;    /* 36px - Hero text */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 2.3 Espaciado y Layout

```css
/* Spacing Scale */
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */

/* Layout Constants */
--sidebar-width: 280px;
--header-height: 64px;
--card-radius: 12px;
--button-radius: 8px;
--input-radius: 6px;
```

### 2.4 Iconografía

**Librería:** Lucide React (consistente con el proyecto actual)

**Estilo:** Stroke-based, limpio, profesional

**Iconos clave para el dashboard empresarial:**
- `LayoutDashboard` - Dashboard principal
- `Bot` - Agentes IA
- `Workflow` - Orquestación
- `BarChart3` - Analytics
- `Settings` - Configuración
- `Users` - Equipos
- `Code` - API/Desarrollo
- `Shield` - Seguridad
- `Zap` - Automatización
- `Database` - Datos

### 2.5 Componentes Base (shadcn/ui)

Reutilizar y extender los componentes existentes de shadcn/ui con variantes empresariales:

- **Button**: Variante "business" con estilo más sobrio
- **Card**: Bordes más definidos, sombras sutiles
- **Badge**: Colores corporativos (blue, slate, emerald)
- **Table**: Densidad alta para datos tabulares
- **Charts**: Recharts con paleta empresarial

---

## 3. Arquitectura de Información

### 3.1 Estructura de Rutas

```
/business                           # Landing empresarial
  ├── /business/dashboard           # Dashboard principal (overview)
  ├── /business/agents              # Gestión de agentes IA
  │   ├── /business/agents/new      # Crear nuevo agente
  │   ├── /business/agents/[id]     # Detalle de agente
  │   └── /business/agents/[id]/edit # Editar agente
  ├── /business/workflows           # Orquestación y workflows
  │   ├── /business/workflows/builder # Visual workflow builder
  │   └── /business/workflows/[id]  # Detalle de workflow
  ├── /business/analytics           # Analytics y reportes
  │   ├── /business/analytics/overview # Overview de métricas
  │   ├── /business/analytics/agents   # Analytics por agente
  │   ├── /business/analytics/costs    # Análisis de costos
  │   └── /business/analytics/reports  # Reportes personalizados
  ├── /business/team                # Gestión de equipo
  │   ├── /business/team/members    # Miembros del equipo
  │   ├── /business/team/roles      # Roles y permisos
  │   └── /business/team/invitations # Invitaciones pendientes
  ├── /business/api                 # API y desarrollo
  │   ├── /business/api/keys        # API keys
  │   ├── /business/api/docs        # Documentación
  │   └── /business/api/webhooks    # Webhooks
  ├── /business/settings            # Configuración empresarial
  │   ├── /business/settings/organization # Datos de la organización
  │   ├── /business/settings/billing      # Facturación
  │   ├── /business/settings/security     # Seguridad
  │   └── /business/settings/integrations # Integraciones
  └── /business/support             # Soporte empresarial
      ├── /business/support/tickets  # Tickets de soporte
      └── /business/support/docs     # Documentación técnica
```

### 3.2 Navegación Principal (Sidebar)

**Estructura jerárquica de dos niveles:**

```
┌─────────────────────────────────────┐
│  🏢 [Logo Empresa]                  │
│  AI Business Suite                  │
├─────────────────────────────────────┤
│                                     │
│  📊 Dashboard                       │
│                                     │
│  🤖 Agents          [12]           │
│    └─ Active                        │
│    └─ Idle                          │
│    └─ Templates                     │
│                                     │
│  ⚡ Workflows       [3]            │
│    └─ Active                        │
│    └─ Scheduled                     │
│                                     │
│  📈 Analytics                       │
│    └─ Overview                      │
│    └─ Performance                   │
│    └─ Costs                         │
│                                     │
│  👥 Team            [8 members]    │
│                                     │
│  🔌 API & Integrations              │
│                                     │
│  ⚙️ Settings                        │
│                                     │
├─────────────────────────────────────┤
│  💼 Enterprise Plan                 │
│  📞 Support (24/7)                  │
│  👤 [User Avatar]                   │
│     John Doe (Admin)                │
└─────────────────────────────────────┘
```

---

## 4. Especificación de Páginas

### 4.1 Dashboard Principal (`/business/dashboard`)

**Objetivo**: Vista ejecutiva rápida del estado de toda la operación de IA

#### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Header: "AI Operations Dashboard"                    [Export]   │
│ Last updated: Just now                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─── KPI Cards (Grid 4 columnas) ───────────────────────┐   │
│  │                                                         │   │
│  │  [Active Agents]  [Total Tasks]  [Success Rate]  [Cost] │   │
│  │      12              1,547          98.5%         $342   │   │
│  │   ▲ +2 this week  ▲ +12.3%      ▲ +1.2%       ▼ -5%   │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Primary Content (Grid 2 columnas) ─────────────────┐   │
│  │                                                         │   │
│  │  ┌─ Agent Performance ─┐  ┌─ Recent Activity ───────┐ │   │
│  │  │                      │  │                          │ │   │
│  │  │  [Line Chart]        │  │  • Agent X completed    │ │   │
│  │  │  Showing throughput  │  │    task #1234           │ │   │
│  │  │  over last 30 days   │  │  • Workflow "Support"   │ │   │
│  │  │                      │  │    triggered            │ │   │
│  │  └──────────────────────┘  │  • New team member      │ │   │
│  │                             │    added                │ │   │
│  │  ┌─ Cost Breakdown ─────┐  │                          │ │   │
│  │  │                      │  └──────────────────────────┘ │   │
│  │  │  [Donut Chart]       │                              │   │
│  │  │  By agent type       │  ┌─ System Health ─────────┐ │   │
│  │  │                      │  │                          │ │   │
│  │  └──────────────────────┘  │  API Status:     ✅ OK   │ │   │
│  │                             │  Database:       ✅ OK   │ │   │
│  │                             │  LLM Provider:   ⚠️  Slow│ │   │
│  │                             │  Queue:          ✅ OK   │ │   │
│  │                             │                          │ │   │
│  │                             └──────────────────────────┘ │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Active Agents Table ──────────────────────────────────┐  │
│  │                                                           │  │
│  │  Agent Name    Type        Status   Tasks/hr   Uptime    │  │
│  │  ────────────────────────────────────────────────────────│  │
│  │  Support Bot   Customer    🟢 Active   42      99.2%     │  │
│  │  Data Analyst  Analytics   🟢 Active   8       100%      │  │
│  │  HR Assistant  HR          🟡 Idle     0       98.1%     │  │
│  │  ...                                                      │  │
│  │                                                           │  │
│  │  [View All Agents →]                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### KPIs Destacados

1. **Active Agents**: Número de agentes actualmente ejecutándose
   - Indicador de tendencia (▲/▼)
   - Comparación vs. semana anterior

2. **Total Tasks Completed**: Tareas completadas en el período
   - Desglose por tipo (automáticas, supervisadas, fallidas)
   - Comparación vs. período anterior

3. **Success Rate**: Porcentaje de tareas exitosas
   - Histórico de 30 días
   - Alertas si baja del 95%

4. **Operational Cost**: Costo de operación (API calls, compute)
   - Por agente
   - Tendencia mensual

#### Componentes Clave

- **AgentPerformanceChart**: Line chart con throughput de agentes
- **RecentActivityFeed**: Lista en tiempo real de eventos
- **CostBreakdownChart**: Donut/Pie chart de costos por categoría
- **SystemHealthIndicator**: Status de servicios críticos
- **ActiveAgentsTable**: Tabla paginada y sorteable

---

### 4.2 Gestión de Agentes (`/business/agents`)

**Objetivo**: CRUD completo de agentes administrativos con vista de lista, cards y detalles

#### Vista Lista/Grid

```
┌─────────────────────────────────────────────────────────────────┐
│ Agents                                              [+ New Agent]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [🔍 Search agents...]  [Filter ▼]  [Sort ▼]  [Grid/List toggle]│
│                                                                  │
│  ┌─── Agent Card ──────────────────────────────────────────┐   │
│  │  🤖 [Avatar]  Customer Support Bot                       │   │
│  │               Type: Customer Service  Status: 🟢 Active  │   │
│  │                                                           │   │
│  │  Tasks today: 127  |  Success rate: 99.2%  |  Uptime: 24h│   │
│  │                                                           │   │
│  │  [View Details]  [Edit]  [⋮ More]                        │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─── Agent Card ──────────────────────────────────────────┐   │
│  │  🤖 [Avatar]  Data Analysis Assistant                    │   │
│  │               Type: Analytics  Status: 🟡 Idle           │   │
│  │                                                           │   │
│  │  Tasks today: 8    |  Success rate: 100%   |  Uptime: 12h│   │
│  │                                                           │   │
│  │  [View Details]  [Edit]  [⋮ More]                        │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [Load More...]                                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Página de Detalle de Agente (`/business/agents/[id]`)

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Back to Agents                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─ Agent Header ──────────────────────────────────────────┐   │
│  │                                                           │   │
│  │  🤖 [Large Avatar]   Customer Support Bot                │   │
│  │                       Type: Customer Service             │   │
│  │                       Status: 🟢 Active (Running 24h)    │   │
│  │                                                           │   │
│  │  [Pause]  [Edit Configuration]  [View Logs]  [Delete]   │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─ Tabs Navigation ───────────────────────────────────────┐   │
│  │  Overview | Performance | Configuration | Logs | Chat   │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─ Tab Content: Overview ─────────────────────────────────┐   │
│  │                                                           │   │
│  │  ┌─ Quick Stats (4 cols) ────────────────────────────┐  │   │
│  │  │  Tasks Today: 127  |  Avg Response: 2.3s  | ...   │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  │  ┌─ Performance Chart ──────┐  ┌─ Recent Tasks ──────┐  │   │
│  │  │                           │  │                      │  │   │
│  │  │  [Line Chart]             │  │  • Task #5421       │  │   │
│  │  │  Throughput over time     │  │    Status: ✅       │  │   │
│  │  │                           │  │    2 min ago        │  │   │
│  │  │                           │  │                      │  │   │
│  │  └───────────────────────────┘  │  • Task #5420       │  │   │
│  │                                  │    Status: ✅       │  │   │
│  │  ┌─ Configuration Summary ───┐  │    5 min ago        │  │   │
│  │  │                           │  │                      │  │   │
│  │  │  Model: GPT-4            │  │  [View All →]       │  │   │
│  │  │  Temperature: 0.7        │  │                      │  │   │
│  │  │  Max Tokens: 2000        │  │                      │  │   │
│  │  │  System Prompt: [...]    │  └──────────────────────┘  │   │
│  │  │                           │                           │   │
│  │  └───────────────────────────┘                           │   │
│  │                                                           │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Constructor de Agentes (`/business/agents/new`)

**Wizard de 4 pasos:**

1. **Basic Information**
   - Nombre del agente
   - Descripción
   - Tipo/Categoría (Customer Service, Analytics, HR, etc.)
   - Icono/Avatar

2. **AI Configuration**
   - Modelo LLM (GPT-4, Claude, etc.)
   - System Prompt (con templates predefinidos)
   - Parámetros (temperature, max_tokens, etc.)
   - Knowledge base (opcional)

3. **Permissions & Access**
   - Qué datos puede acceder
   - APIs que puede usar
   - Límites de ejecución

4. **Review & Deploy**
   - Resumen de configuración
   - Test de prueba
   - Deploy

---

### 4.3 Workflows y Orquestación (`/business/workflows`)

**Objetivo**: Diseñar y gestionar workflows multi-agente

#### Vista de Lista

```
┌─────────────────────────────────────────────────────────────────┐
│ Workflows                                      [+ Create Workflow]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [🔍 Search...]  [Status: All ▼]  [Category ▼]                  │
│                                                                  │
│  ┌─── Workflow Card ───────────────────────────────────────┐   │
│  │                                                           │   │
│  │  ⚡ Customer Support Pipeline                            │   │
│  │     Status: 🟢 Active  |  Agents: 3  |  Runs: 245/day   │   │
│  │                                                           │   │
│  │  Trigger: New customer message                           │   │
│  │  Flow: Classifier → Support Bot → Escalation            │   │
│  │                                                           │   │
│  │  Success Rate: 96.4%  |  Avg Duration: 12s              │   │
│  │                                                           │   │
│  │  [View Details]  [Edit]  [Duplicate]  [⋮ More]          │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─── Workflow Card ───────────────────────────────────────┐   │
│  │                                                           │   │
│  │  ⚡ Data Analysis Pipeline                               │   │
│  │     Status: 🕐 Scheduled (Daily 2am)  |  Agents: 2      │   │
│  │                                                           │   │
│  │  ... [similar structure] ...                             │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Workflow Builder (`/business/workflows/builder`)

**Visual no-code/low-code builder estilo Flowise/LangGraph**

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Back  |  Customer Support Pipeline (Draft)        [Save] [Deploy]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─ Left Sidebar: Components ───┐  ┌─ Canvas ──────────────┐   │
│  │                               │  │                        │   │
│  │  🔍 Search nodes...          │  │  [START]               │   │
│  │                               │  │    ↓                   │   │
│  │  📥 Triggers                  │  │  [Classifier Agent]    │   │
│  │    • Webhook                  │  │    ↙        ↘         │   │
│  │    • Schedule                 │  │  [Agent A]  [Agent B] │   │
│  │    • Event                    │  │    ↓         ↓         │   │
│  │                               │  │  [Merge]               │   │
│  │  🤖 Agents                    │  │    ↓                   │   │
│  │    • [Drag agents here]       │  │  [END]                │   │
│  │                               │  │                        │   │
│  │  ⚡ Actions                   │  │  [Zoom] [Fit] [Grid]  │   │
│  │    • HTTP Request             │  │                        │   │
│  │    • Database Query           │  └────────────────────────┘   │
│  │    • Send Email               │                               │
│  │                               │  ┌─ Right Panel: Config ──┐   │
│  │  🔀 Logic                     │  │                         │   │
│  │    • Condition                │  │  Selected: [Agent A]   │   │
│  │    • Loop                     │  │                         │   │
│  │    • Parallel                 │  │  Name: Support Bot     │   │
│  │                               │  │  Timeout: 30s          │   │
│  └───────────────────────────────┘  │  Retry: 3 times        │   │
│                                      │                         │   │
│                                      │  [Advanced Settings]   │   │
│                                      │                         │   │
│                                      └─────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Features del Builder:**
- Drag & drop de nodos
- Conexiones visuales entre nodos
- Validación en tiempo real
- Preview/Testing mode
- Version control
- Templates predefinidos

---

### 4.4 Analytics y Reportes (`/business/analytics`)

**Objetivo**: Insights profundos sobre performance, costos y ROI

#### Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ Analytics Overview                     [Date Range: Last 30 days]│
│                                        [Export Report ▼]         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─── Key Metrics (4 cards) ──────────────────────────────┐    │
│  │  Total Tasks   |  Avg Response  |  Success Rate  | Cost │    │
│  │    12,547      |     2.3s       |     98.2%      | $1.2K│    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─── Charts Grid ───────────────────────────────────────┐      │
│  │                                                         │      │
│  │  ┌─ Task Volume Over Time ────────────────────────┐   │      │
│  │  │                                                  │   │      │
│  │  │  [Area Chart]                                    │   │      │
│  │  │  Shows daily task volume with trend line        │   │      │
│  │  │                                                  │   │      │
│  │  └──────────────────────────────────────────────────┘   │      │
│  │                                                         │      │
│  │  ┌─ Agent Performance Comparison ───┐  ┌─ Cost ────┐  │      │
│  │  │                                   │  │  Breakdown │  │      │
│  │  │  [Bar Chart]                      │  │           │  │      │
│  │  │  Top 10 agents by throughput      │  │  [Pie]    │  │      │
│  │  │                                   │  │           │  │      │
│  │  └───────────────────────────────────┘  └────────────┘  │      │
│  │                                                         │      │
│  │  ┌─ Success/Failure Rate ─────────────────────────┐   │      │
│  │  │                                                  │   │      │
│  │  │  [Stacked Area Chart]                            │   │      │
│  │  │  Success (green) vs Failures (red) over time    │   │      │
│  │  │                                                  │   │      │
│  │  └──────────────────────────────────────────────────┘   │      │
│  │                                                         │      │
│  └─────────────────────────────────────────────────────────┘      │
│                                                                  │
│  ┌─── Insights & Recommendations ──────────────────────────┐    │
│  │                                                           │    │
│  │  💡 Agent "Customer Support Bot" is performing 20% above │    │
│  │     average. Consider using it as a template.            │    │
│  │                                                           │    │
│  │  ⚠️  "Data Analyst" has a 15% failure rate. Review       │    │
│  │     configuration and error logs.                         │    │
│  │                                                           │    │
│  │  📈 Task volume increased 23% this week. Consider scaling│    │
│  │     infrastructure.                                       │    │
│  │                                                           │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Cost Analytics (`/business/analytics/costs`)

```
┌─────────────────────────────────────────────────────────────────┐
│ Cost Analytics                         [Date Range: This month] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─── Cost Summary ──────────────────────────────────────┐      │
│  │                                                         │      │
│  │  Total Spend: $1,247.32                                │      │
│  │  Projected (End of month): $1,850                      │      │
│  │  Budget: $2,000  (92.5% used)                          │      │
│  │                                                         │      │
│  │  [Progress bar showing budget usage]                   │      │
│  │                                                         │      │
│  └─────────────────────────────────────────────────────────┘      │
│                                                                  │
│  ┌─── Cost Breakdown ─────────────────────────────────────┐      │
│  │                                                         │      │
│  │  ┌─ By Category ─┐  ┌─ By Agent ─────┐  ┌─ By Model ┐│      │
│  │  │               │  │                 │  │            ││      │
│  │  │  [Donut]      │  │  [Bar Chart]    │  │  [Pie]     ││      │
│  │  │               │  │                 │  │            ││      │
│  │  └───────────────┘  └─────────────────┘  └────────────┘│      │
│  │                                                         │      │
│  └─────────────────────────────────────────────────────────┘      │
│                                                                  │
│  ┌─── Detailed Breakdown Table ────────────────────────────┐     │
│  │                                                          │     │
│  │  Agent Name       Category    Calls   Cost      % Total │     │
│  │  ───────────────────────────────────────────────────────│     │
│  │  Support Bot      LLM API     12.5K   $456.20     36.6% │     │
│  │  Data Analyst     Compute      8.2K   $342.10     27.4% │     │
│  │  HR Assistant     LLM API      5.1K   $198.45     15.9% │     │
│  │  ...                                                     │     │
│  │                                                          │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

### 4.5 Gestión de Equipos (`/business/team`)

**Objetivo**: Administrar miembros, roles y permisos del equipo

#### Members List

```
┌─────────────────────────────────────────────────────────────────┐
│ Team Members (8)                           [+ Invite Member]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [🔍 Search members...]  [Role: All ▼]  [Sort by: Name ▼]       │
│                                                                  │
│  ┌─── Member Card ──────────────────────────────────────────┐   │
│  │                                                           │   │
│  │  👤 [Avatar]  John Doe                                    │   │
│  │              john.doe@company.com                         │   │
│  │              Role: Admin  |  Joined: Jan 2025            │   │
│  │                                                           │   │
│  │  Permissions:                                             │   │
│  │    ✅ Manage agents    ✅ View analytics    ✅ Billing   │   │
│  │                                                           │   │
│  │  [Edit Role]  [Remove]                                   │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─── Member Card ──────────────────────────────────────────┐   │
│  │                                                           │   │
│  │  👤 [Avatar]  Jane Smith                                  │   │
│  │              jane.smith@company.com                       │   │
│  │              Role: Developer  |  Joined: Feb 2025        │   │
│  │                                                           │   │
│  │  Permissions:                                             │   │
│  │    ✅ Manage agents    ✅ API access    ❌ Billing       │   │
│  │                                                           │   │
│  │  [Edit Role]  [Remove]                                   │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Roles & Permissions

**Roles predefinidos:**

1. **Owner**: Acceso total
2. **Admin**: Gestión completa excepto billing
3. **Developer**: Gestión de agentes y API, sin acceso a equipo/billing
4. **Analyst**: Solo lectura en analytics
5. **Viewer**: Solo lectura general

**Matriz de permisos:**

| Permission | Owner | Admin | Developer | Analyst | Viewer |
|------------|-------|-------|-----------|---------|--------|
| Manage Agents | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete Agents | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export Reports | ✅ | ✅ | ✅ | ✅ | ❌ |
| Manage Workflows | ✅ | ✅ | ✅ | ❌ | ❌ |
| API Access | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage Team | ✅ | ✅ | ❌ | ❌ | ❌ |
| Billing | ✅ | ❌ | ❌ | ❌ | ❌ |

---

### 4.6 API y Desarrolladores (`/business/api`)

**Objetivo**: Gestionar API keys, documentación y webhooks

#### API Keys

```
┌─────────────────────────────────────────────────────────────────┐
│ API Keys                                       [+ Create New Key] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚠️  Keep your API keys secure. Never share them publicly.      │
│                                                                  │
│  ┌─── API Key ────────────────────────────────────────────┐     │
│  │                                                         │     │
│  │  Production Key                                         │     │
│  │  sk_live_************************1a2b3c                 │     │
│  │                                                         │     │
│  │  Created: Jan 15, 2025                                 │     │
│  │  Last used: 2 hours ago                                │     │
│  │  Rate limit: 1000 req/min                              │     │
│  │                                                         │     │
│  │  [Copy]  [Regenerate]  [Revoke]                        │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌─── API Key ────────────────────────────────────────────┐     │
│  │                                                         │     │
│  │  Development Key                                        │     │
│  │  sk_test_***********************4d5e6f                  │     │
│  │  ...                                                    │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### API Documentation

```
┌─────────────────────────────────────────────────────────────────┐
│ API Documentation                          [View in Swagger UI]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─ Quick Start ──────────────────────────────────────────┐     │
│  │                                                         │     │
│  │  Base URL: https://api.creador-ias.com/v1/business     │     │
│  │  Authentication: Bearer token in header                │     │
│  │                                                         │     │
│  │  Example:                                               │     │
│  │  ```bash                                                │     │
│  │  curl -H "Authorization: Bearer YOUR_API_KEY" \        │     │
│  │       https://api.creador-ias.com/v1/business/agents   │     │
│  │  ```                                                    │     │
│  │                                                         │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌─ Endpoints ────────────────────────────────────────────┐     │
│  │                                                         │     │
│  │  📁 Agents                                              │     │
│  │    GET    /agents            List all agents           │     │
│  │    POST   /agents            Create agent              │     │
│  │    GET    /agents/:id        Get agent details         │     │
│  │    PATCH  /agents/:id        Update agent              │     │
│  │    DELETE /agents/:id        Delete agent              │     │
│  │                                                         │     │
│  │  ⚡ Workflows                                           │     │
│  │    GET    /workflows         List workflows            │     │
│  │    POST   /workflows/trigger Trigger workflow          │     │
│  │                                                         │     │
│  │  📊 Analytics                                           │     │
│  │    GET    /analytics/summary Get analytics summary     │     │
│  │                                                         │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Componentes UI

### 5.1 Componentes Nuevos a Crear

#### StatCard
```tsx
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
}
```

**Uso:**
```tsx
<StatCard
  title="Active Agents"
  value={12}
  change={+2}
  changeType="increase"
  icon={Bot}
  trend="up"
/>
```

#### AgentCard
```tsx
interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    type: string;
    status: 'active' | 'idle' | 'error';
    tasksToday: number;
    successRate: number;
    uptime: string;
  };
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
```

#### WorkflowBuilder
**Componente complejo basado en React Flow:**
```tsx
import ReactFlow from 'reactflow';

const WorkflowBuilder = () => {
  // Nodes: Agents, Actions, Conditions, etc.
  // Edges: Connections between nodes
  // Custom node types for each component type
};
```

#### AnalyticsChart
```tsx
interface AnalyticsChartProps {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any[];
  config: ChartConfig;
  title?: string;
  description?: string;
}
```

#### TeamMemberCard
```tsx
interface TeamMemberCardProps {
  member: {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'developer' | 'analyst' | 'viewer';
    joinedAt: Date;
    permissions: string[];
  };
  onEditRole: () => void;
  onRemove: () => void;
}
```

#### ApiKeyCard
```tsx
interface ApiKeyCardProps {
  apiKey: {
    id: string;
    name: string;
    key: string; // Masked
    createdAt: Date;
    lastUsed?: Date;
    rateLimit: number;
  };
  onCopy: () => void;
  onRegenerate: () => void;
  onRevoke: () => void;
}
```

### 5.2 Componentes de shadcn/ui a Extender

- **Button**: Añadir variante "business"
- **Card**: Añadir variante "stat" con colores empresariales
- **Badge**: Añadir colores para status (active, idle, error)
- **Table**: Añadir sorting y filtering integrados
- **Dialog**: Usar para modals de confirmación

---

## 6. Flujos de Usuario

### 6.1 Crear un Nuevo Agente

```
[/business/agents]
  → Click "+ New Agent"
    → [/business/agents/new] (Wizard)
      → Step 1: Basic Info
        → Fill name, description, type
        → Next
      → Step 2: AI Configuration
        → Select model
        → Configure system prompt (with templates)
        → Set parameters
        → Next
      → Step 3: Permissions
        → Select data access
        → Select API access
        → Set limits
        → Next
      → Step 4: Review & Deploy
        → Review configuration
        → Run test (optional)
        → Click "Deploy"
          → Agent created
          → Redirect to [/business/agents/:id]
```

### 6.2 Crear un Workflow

```
[/business/workflows]
  → Click "+ Create Workflow"
    → [/business/workflows/builder] (Visual builder)
      → Drag "Trigger" node to canvas
      → Configure trigger (webhook, schedule, etc.)
      → Drag "Agent" nodes
      → Connect nodes with edges
      → Add conditions/logic if needed
      → Configure each node
      → Click "Test Workflow" (optional)
        → See execution trace
      → Click "Save"
      → Click "Deploy"
        → Workflow activated
        → Redirect to [/business/workflows/:id]
```

### 6.3 Invitar un Miembro al Equipo

```
[/business/team]
  → Click "+ Invite Member"
    → Modal appears
      → Enter email
      → Select role (Admin, Developer, etc.)
      → Click "Send Invitation"
        → Invitation sent
        → Appears in "Pending Invitations"
          → Member receives email
          → Clicks link
          → Accepts invitation
          → Added to team
```

---

## 7. Plan de Implementación

### 7.1 Fase 1: Fundación (Semana 1-2)

**Objetivos:**
- Setup de rutas `/business/*`
- Sistema de diseño base
- Layout y navegación principal

**Tareas:**
1. ✅ Crear estructura de carpetas `/app/business/`
2. ✅ Definir paleta de colores empresarial en `globals.css`
3. ✅ Crear `BusinessLayout` con sidebar profesional
4. ✅ Implementar navegación principal
5. ✅ Crear página placeholder para cada ruta principal
6. ✅ Setup de middleware para verificar permisos empresariales

**Entregables:**
- `/business/dashboard` (placeholder)
- `/business/agents` (placeholder)
- BusinessNavbar component
- BusinessSidebar component

---

### 7.2 Fase 2: Dashboard Principal (Semana 3)

**Objetivos:**
- Dashboard principal funcional con KPIs reales

**Tareas:**
1. Crear `StatCard` component
2. Implementar API `/api/business/analytics/overview`
3. Crear charts con Recharts:
   - AgentPerformanceChart
   - CostBreakdownChart
4. Implementar tabla de agentes activos
5. Crear feed de actividad reciente
6. Implementar System Health Indicator

**Entregables:**
- `/business/dashboard` completo y funcional
- 4 KPI cards dinámicos
- 3 charts interactivos
- Real-time activity feed

---

### 7.3 Fase 3: Gestión de Agentes (Semana 4-5)

**Objetivos:**
- CRUD completo de agentes administrativos

**Tareas:**
1. Crear `AgentCard` component
2. Implementar lista/grid de agentes con filtros
3. Crear página de detalle de agente con tabs
4. Implementar wizard de creación de agentes (4 pasos)
5. Crear templates predefinidos de agentes
6. Implementar edición de agentes
7. API endpoints:
   - `GET /api/business/agents`
   - `POST /api/business/agents`
   - `GET /api/business/agents/:id`
   - `PATCH /api/business/agents/:id`
   - `DELETE /api/business/agents/:id`

**Entregables:**
- `/business/agents` lista completa
- `/business/agents/new` wizard funcional
- `/business/agents/:id` detalle completo
- `/business/agents/:id/edit` editor

---

### 7.4 Fase 4: Workflows (Semana 6-7)

**Objetivos:**
- Sistema visual de workflows con React Flow

**Tareas:**
1. Setup de React Flow
2. Crear tipos de nodos personalizados:
   - TriggerNode
   - AgentNode
   - ActionNode
   - ConditionNode
3. Implementar WorkflowBuilder canvas
4. Crear sidebar de componentes
5. Implementar panel de configuración de nodos
6. Sistema de validación de workflows
7. Implementar ejecución y testing de workflows
8. API para CRUD de workflows

**Entregables:**
- `/business/workflows` lista
- `/business/workflows/builder` visual builder
- `/business/workflows/:id` detalle
- Sistema de ejecución de workflows

---

### 7.5 Fase 5: Analytics (Semana 8)

**Objetivos:**
- Sistema completo de analytics y reportes

**Tareas:**
1. Implementar analytics overview
2. Crear analytics por agente
3. Implementar cost analytics detallado
4. Crear sistema de reportes exportables (PDF, CSV)
5. Implementar insights con IA
6. APIs:
   - `GET /api/business/analytics/overview`
   - `GET /api/business/analytics/agents/:id`
   - `GET /api/business/analytics/costs`
   - `POST /api/business/analytics/reports/export`

**Entregables:**
- `/business/analytics/overview` completo
- `/business/analytics/agents/:id` por agente
- `/business/analytics/costs` detallado
- Sistema de exportación

---

### 7.6 Fase 6: Team & Permissions (Semana 9)

**Objetivos:**
- Sistema completo de gestión de equipos

**Tareas:**
1. Implementar lista de miembros
2. Crear sistema de invitaciones
3. Implementar roles y permisos (RBAC)
4. Crear middleware de autorización
5. Implementar gestión de roles
6. APIs:
   - `GET /api/business/team/members`
   - `POST /api/business/team/invite`
   - `PATCH /api/business/team/members/:id/role`
   - `DELETE /api/business/team/members/:id`

**Entregables:**
- `/business/team/members` completo
- `/business/team/roles` gestión de roles
- Sistema de invitaciones funcional
- RBAC implementado

---

### 7.7 Fase 7: API & Development (Semana 10)

**Objetivos:**
- Herramientas para desarrolladores

**Tareas:**
1. Implementar gestión de API keys
2. Crear documentación interactiva (Swagger)
3. Implementar webhooks
4. Crear playground de API
5. Sistema de rate limiting
6. APIs públicas documentadas

**Entregables:**
- `/business/api/keys` gestión de keys
- `/business/api/docs` documentación
- `/business/api/webhooks` gestión de webhooks
- API pública v1 completa

---

### 7.8 Fase 8: Settings & Polish (Semana 11-12)

**Objetivos:**
- Configuración empresarial y pulido final

**Tareas:**
1. Implementar settings de organización
2. Crear gestión de billing empresarial
3. Implementar security settings (2FA, SSO)
4. Crear sistema de integraciones
5. Implementar soporte empresarial (tickets)
6. Optimización de performance
7. Testing end-to-end
8. Documentación completa

**Entregables:**
- `/business/settings` completo
- Sistema de billing empresarial
- Security features
- Integrations marketplace
- Soporte técnico

---

## 8. Consideraciones Técnicas

### 8.1 Tecnologías y Librerías

```json
{
  "dependencies": {
    "next": "^15.1.0",
    "react": "19.1.0",
    "react-dom": "19.1.0",

    // UI
    "tailwindcss": "^4",
    "@radix-ui/react-*": "latest",
    "lucide-react": "^0.545.0",
    "framer-motion": "^12.23.24",

    // Charts
    "recharts": "^3.2.1",

    // Workflows
    "reactflow": "^11.11.0",

    // Data fetching
    "swr": "^2.3.6",

    // Forms
    "react-hook-form": "^7.65.0",
    "zod": "^4.1.12",

    // Date handling
    "date-fns": "^4.1.0",

    // Export
    "jspdf": "^3.0.3",
    "xlsx": "^0.18.5"
  }
}
```

### 8.2 Estructura de Archivos

```
app/
├── business/
│   ├── layout.tsx                 # BusinessLayout wrapper
│   ├── dashboard/
│   │   └── page.tsx
│   ├── agents/
│   │   ├── page.tsx               # Lista de agentes
│   │   ├── new/
│   │   │   └── page.tsx           # Wizard de creación
│   │   └── [id]/
│   │       ├── page.tsx           # Detalle
│   │       └── edit/
│   │           └── page.tsx       # Editor
│   ├── workflows/
│   │   ├── page.tsx
│   │   ├── builder/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── analytics/
│   │   ├── overview/
│   │   ├── agents/
│   │   ├── costs/
│   │   └── reports/
│   ├── team/
│   ├── api/
│   └── settings/
│
├── api/
│   └── business/                  # API routes empresariales
│       ├── agents/
│       ├── workflows/
│       ├── analytics/
│       ├── team/
│       └── api-keys/
│
components/
├── business/                      # Componentes empresariales
│   ├── layout/
│   │   ├── BusinessSidebar.tsx
│   │   ├── BusinessHeader.tsx
│   │   └── BusinessLayout.tsx
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── AgentPerformanceChart.tsx
│   │   ├── CostBreakdownChart.tsx
│   │   └── ActivityFeed.tsx
│   ├── agents/
│   │   ├── AgentCard.tsx
│   │   ├── AgentDetail.tsx
│   │   ├── AgentWizard.tsx
│   │   └── AgentConfigPanel.tsx
│   ├── workflows/
│   │   ├── WorkflowBuilder.tsx
│   │   ├── WorkflowCanvas.tsx
│   │   ├── nodes/
│   │   │   ├── TriggerNode.tsx
│   │   │   ├── AgentNode.tsx
│   │   │   └── ActionNode.tsx
│   │   └── WorkflowSidebar.tsx
│   ├── analytics/
│   │   ├── AnalyticsChart.tsx
│   │   ├── CostAnalysis.tsx
│   │   └── InsightsPanel.tsx
│   ├── team/
│   │   ├── TeamMemberCard.tsx
│   │   ├── InviteModal.tsx
│   │   └── RoleEditor.tsx
│   └── api/
│       ├── ApiKeyCard.tsx
│       ├── ApiDocs.tsx
│       └── WebhookConfig.tsx
│
lib/
├── business/                      # Lógica de negocio empresarial
│   ├── analytics.ts
│   ├── workflows.ts
│   ├── permissions.ts
│   └── api-keys.ts
│
styles/
└── business.css                   # Estilos específicos empresariales
```

### 8.3 Base de Datos (Prisma Schema Updates)

**Nuevas tablas necesarias:**

```prisma
// Workflow configuration
model Workflow {
  id          String   @id @default(cuid())
  teamId      String
  name        String
  description String?
  status      String   @default("draft") // draft, active, paused

  // Visual workflow definition (JSON)
  nodes       Json     // Array de nodos
  edges       Json     // Array de conexiones

  // Trigger configuration
  triggerType String   // webhook, schedule, event
  triggerConfig Json

  // Stats
  executionCount Int    @default(0)
  successCount   Int    @default(0)
  failureCount   Int    @default(0)
  avgDuration    Float? // Milliseconds

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  team        Team     @relation(fields: [teamId], references: [id])
  executions  WorkflowExecution[]

  @@index([teamId])
  @@index([status])
}

model WorkflowExecution {
  id         String   @id @default(cuid())
  workflowId String
  status     String   // running, success, failed

  // Execution trace
  startedAt  DateTime @default(now())
  completedAt DateTime?
  duration   Int?     // Milliseconds

  // Input/Output
  input      Json?
  output     Json?
  error      Json?

  // Logs
  logs       Json     // Array de log entries

  workflow   Workflow @relation(fields: [workflowId], references: [id])

  @@index([workflowId])
  @@index([status])
  @@index([startedAt])
}

// API Keys for programmatic access
model ApiKey {
  id         String   @id @default(cuid())
  teamId     String
  userId     String   // Creator

  name       String
  key        String   @unique // Hashed
  keyPreview String   // Last 8 chars for display

  // Permissions
  scopes     Json     // Array de scopes: ["agents:read", "agents:write", etc.]

  // Rate limiting
  rateLimit  Int      @default(1000) // requests per minute

  // Stats
  lastUsedAt DateTime?
  usageCount Int      @default(0)

  // Status
  active     Boolean  @default(true)
  expiresAt  DateTime?

  createdAt  DateTime @default(now())

  team       Team     @relation(fields: [teamId], references: [id])

  @@index([teamId])
  @@index([key])
  @@index([active])
}

// Webhooks for event notifications
model Webhook {
  id         String   @id @default(cuid())
  teamId     String

  url        String
  events     Json     // Array de event types
  secret     String   // For signature validation

  active     Boolean  @default(true)

  // Stats
  lastTriggeredAt DateTime?
  successCount    Int @default(0)
  failureCount    Int @default(0)

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  team       Team     @relation(fields: [teamId], references: [id])
  deliveries WebhookDelivery[]

  @@index([teamId])
  @@index([active])
}

model WebhookDelivery {
  id         String   @id @default(cuid())
  webhookId  String

  event      String
  payload    Json

  status     String   // pending, success, failed
  statusCode Int?
  response   String?  @db.Text

  attempts   Int      @default(1)

  createdAt  DateTime @default(now())
  deliveredAt DateTime?

  webhook    Webhook  @relation(fields: [webhookId], references: [id])

  @@index([webhookId])
  @@index([status])
  @@index([createdAt])
}
```

### 8.4 Seguridad y Permisos

**Middleware de autorización:**

```typescript
// middleware/business-auth.ts
export async function requireBusinessAccess(req: Request) {
  const session = await getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  // Check if user has business plan
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { teamsOwned: true, teamMemberships: true }
  });

  // User must be in a team
  if (user.teamsOwned.length === 0 && user.teamMemberships.length === 0) {
    throw new Error('Business access required');
  }

  return user;
}

export async function requirePermission(permission: string) {
  const user = await requireBusinessAccess();
  const teamMember = await prisma.teamMember.findFirst({
    where: { userId: user.id }
  });

  if (!hasPermission(teamMember.role, permission)) {
    throw new Error('Insufficient permissions');
  }

  return teamMember;
}
```

### 8.5 Performance y Escalabilidad

**Consideraciones:**

1. **Lazy Loading**: Usar React.lazy() para componentes pesados (WorkflowBuilder, Charts)
2. **Pagination**: Todas las listas deben estar paginadas (agents, workflows, logs)
3. **Caching**: Usar SWR con revalidación inteligente
4. **Virtualization**: Para tablas largas, usar react-window
5. **Debouncing**: En búsquedas y filtros
6. **Code Splitting**: Separar código de business del consumer dashboard

---

## Resumen Ejecutivo

Este documento presenta el diseño completo de un **Dashboard Empresarial de clase mundial** para la gestión de agentes de IA administrativos. El sistema está diseñado para:

✅ **Separar claramente** la experiencia B2C (compañeros emocionales) de la B2B (asistentes administrativos)

✅ **Proporcionar herramientas profesionales** de nivel enterprise (workflows, analytics, team management, API)

✅ **Escalar** desde equipos pequeños hasta organizaciones de 1000+ usuarios

✅ **Integrarse** con sistemas existentes vía APIs y webhooks

✅ **Generar valor medible** con analytics detallados de costos y ROI

El plan de implementación propuesto es de **12 semanas** para un MVP completo y funcional, con fases claramente definidas y entregables concretos.

---

**Próximos Pasos Recomendados:**

1. **Revisión y aprobación** del diseño por el equipo
2. **Priorización** de features (si se necesita un MVP más rápido)
3. **Setup de proyecto** (creación de ramas, configuración de ambiente)
4. **Kickoff de Fase 1** (Fundación)

**Duración estimada total:** 10-12 semanas para MVP completo

**Equipo recomendado:**
- 2 Frontend Developers
- 1 Backend Developer
- 1 UI/UX Designer (para assets y refinamiento)
- 1 Product Manager/Project Lead

---

*Documento generado por Claude (Sonnet 4.5) - Octubre 2025*
*Para: Proyecto "Creador de Inteligencias"*
