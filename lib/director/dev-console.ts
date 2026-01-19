/**
 * Director Dev Console
 *
 * Utilidad de desarrollo para monitorear el Director desde la consola del navegador (F12)
 *
 * Uso:
 *   director.status()           - Estado completo del director
 *   director.scene()            - Escena actual en ejecución
 *   director.seeds()            - Semillas de tensión activas
 *   director.seeds('ACTIVE')    - Filtrar por estado
 *   director.relations()        - Relaciones IA-IA
 *   director.relations(agentId) - Relaciones de una IA específica
 *   director.history()          - Historial de escenas ejecutadas
 *   director.history(10)        - Últimas N escenas
 *   director.metrics()          - Métricas del grupo
 *   director.catalog()          - Catálogo de escenas disponibles
 *   director.catalog('HUMOR')   - Filtrar por categoría
 *   director.help()             - Ayuda de comandos
 */

interface DirectorGlobal {
  status: (groupId?: string) => Promise<void>;
  scene: (groupId?: string) => Promise<void>;
  seeds: (filter?: string, groupId?: string) => Promise<void>;
  relations: (agentIdOrGroupId?: string, groupId?: string) => Promise<void>;
  history: (limitOrGroupId?: number | string, groupId?: string) => Promise<void>;
  metrics: (groupId?: string) => Promise<void>;
  catalog: (category?: string) => Promise<void>;
  debug: () => void;
  help: () => void;
  _currentGroupId?: string;
}

// Estilos para consola
const styles = {
  title: 'color: #6366f1; font-weight: bold; font-size: 14px;',
  subtitle: 'color: #8b5cf6; font-weight: bold;',
  label: 'color: #64748b; font-weight: bold;',
  value: 'color: #0f172a;',
  success: 'color: #10b981; font-weight: bold;',
  warning: 'color: #f59e0b; font-weight: bold;',
  error: 'color: #ef4444; font-weight: bold;',
  info: 'color: #3b82f6;',
  dim: 'color: #94a3b8;',
};

// Helper para obtener el groupId actual
function getCurrentGroupId(providedId?: string): string | null {
  if (providedId) return providedId;

  // Intentar obtener del contexto actual (URL)
  // Soporta: /groups/[id], /grupos/[id], /dashboard/groups/[id], /dashboard/grupos/[id]
  const match = window.location.pathname.match(/\/(?:dashboard\/)?(?:groups|grupos)\/([^\/]+)/);
  if (match) return match[1];

  // Intentar obtener del localStorage o sessionStorage
  const stored = localStorage.getItem('currentGroupId');
  if (stored) return stored;

  return null;
}

// Helper para hacer fetch con manejo de errores
async function fetchAPI(endpoint: string) {
  console.log('🌐 fetchAPI called:', endpoint);

  try {
    const response = await fetch(endpoint, {
      credentials: 'include', // Incluir cookies de sesión
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const text = await response.text();
      console.error(`❌ Error ${response.status}:`, text);

      if (response.status === 401) {
        console.warn('⚠️  No autenticado. Asegúrate de estar logueado.');
      } else if (response.status === 403) {
        console.warn('⚠️  Sin permisos para acceder a este grupo.');
      }

      return null;
    }

    const json = await response.json();
    console.log('✅ JSON parseado correctamente');
    return json;
  } catch (error) {
    console.error('❌ Error de red:', error);
    return null;
  }
}

// Comandos del Director
const directorCommands: DirectorGlobal = {
  // Estado completo del director
  async status(groupId?: string) {
    const id = getCurrentGroupId(groupId);

    // LOG FORZADO sin estilos
    console.log('=== DIRECTOR STATUS ===');
    console.log('GroupId detectado:', id);
    console.log('URL:', window.location.pathname);

    if (!id) {
      const error = '⚠️  No se pudo determinar el groupId. Proporciona uno: director.status("groupId")';
      console.warn(error);
      return { error, url: window.location.pathname };
    }

    console.log('Haciendo fetch a:', `/api/groups/${id}/director`);

    const data = await fetchAPI(`/api/groups/${id}/director`);

    console.log('Datos recibidos:', data);

    if (!data) {
      const error = 'No se recibieron datos del servidor';
      console.error(error);
      return { error, groupId: id };
    }

    // Formatear output legible
    const output = {
      '🎬 Estado': data.enabled ? '✅ ACTIVO' : '❌ INACTIVO',
      '📊 Versión': data.version === 2 ? '🔥 FULL' : data.version === 1 ? '⚡ BASIC' : '⭕ OFF',
      '⚙️  Settings': data.settings,
      '📍 Escena Actual': data.currentScene ? {
        código: data.currentScene.code,
        paso: `${data.currentScene.step}/${data.currentScene.totalSteps}`,
        roles: data.currentScene.roleAssignments
      } : '💤 Sin escena activa',
      '📊 Métricas': {
        'escenas ejecutadas': data.metrics.executedScenes,
        'semillas activas': data.metrics.activeSeeds
      }
    };

    console.log('\n🎬 ESTADO DEL DIRECTOR');
    console.log('══════════════════════════════════════════════════');
    console.table(output);

    directorCommands._currentGroupId = id;

    return output;
  },

  // Escena actual
  async scene(groupId?: string) {
    const id = getCurrentGroupId(groupId);
    if (!id) {
      console.warn('%c⚠️  No se pudo determinar el groupId', styles.warning);
      console.log('%cURL actual:', styles.info, window.location.pathname);
      return;
    }

    console.log('%c🎬 ESCENA ACTUAL', styles.title);
    console.log('%c' + '='.repeat(50), styles.dim);
    console.log('%cGroup ID:', styles.dim, id);

    const data = await fetchAPI(`/api/groups/${id}/director`);
    if (!data) return;

    if (!data.currentScene) {
      console.log('%c💤 No hay escena en ejecución', styles.info);
      return;
    }

    const scene = data.currentScene;
    console.log('%cCódigo:', styles.label, scene.code);
    console.log('%cProgreso:', styles.label, `Paso ${scene.step} de ${scene.totalSteps}`);
    console.log('%cRoles asignados:', styles.label);

    if (scene.roleAssignments) {
      Object.entries(scene.roleAssignments).forEach(([role, agentId]) => {
        console.log(`  %c${role}:%c ${agentId}`, styles.info, styles.value);
      });
    }

    directorCommands._currentGroupId = id;
  },

  // Semillas de tensión
  async seeds(filter?: string, groupId?: string) {
    const id = getCurrentGroupId(typeof filter === 'string' && filter.length > 20 ? filter : groupId);
    if (!id) {
      console.warn('%c⚠️  No se pudo determinar el groupId', styles.warning);
      return;
    }

    const statusFilter = typeof filter === 'string' && filter.length < 20 ? filter : undefined;

    console.log('%c🌱 SEMILLAS DE TENSIÓN', styles.title);
    console.log('%c' + '='.repeat(50), styles.dim);

    const data = await fetchAPI(`/api/groups/${id}/seeds`);
    if (!data) return;

    let seeds = data.seeds || [];

    if (statusFilter) {
      seeds = seeds.filter((s: any) => s.status === statusFilter.toUpperCase());
      console.log(`%cFiltrando por estado: ${statusFilter.toUpperCase()}`, styles.info);
    }

    if (seeds.length === 0) {
      console.log('%c✨ No hay semillas' + (statusFilter ? ` en estado ${statusFilter}` : ''), styles.info);
      return;
    }

    seeds.forEach((seed: any, i: number) => {
      console.log(`\n%c${i + 1}. ${seed.title}`, styles.subtitle);
      console.log('%c  ID:', styles.label, seed.id);
      console.log('%c  Tipo:', styles.label, seed.type);
      console.log('%c  Estado:', styles.label, seed.status);
      console.log('%c  Turno actual:', styles.label, `${seed.currentTurn}/${seed.maxTurns}`);
      console.log('%c  Escalación:', styles.label, seed.escalationLevel);
      console.log('%c  IAs involucradas:', styles.label, seed.involvedAgents);
      console.log('%c  Contenido:', styles.dim, seed.content);
    });

    directorCommands._currentGroupId = id;
  },

  // Relaciones IA-IA
  async relations(agentIdOrGroupId?: string, groupId?: string) {
    const id = getCurrentGroupId(typeof agentIdOrGroupId === 'string' && agentIdOrGroupId.length > 20 ? agentIdOrGroupId : groupId);
    if (!id) {
      console.warn('%c⚠️  No se pudo determinar el groupId', styles.warning);
      return;
    }

    const agentFilter = typeof agentIdOrGroupId === 'string' && agentIdOrGroupId.length < 20 ? agentIdOrGroupId : undefined;

    console.log('%c🤝 RELACIONES IA-IA', styles.title);
    console.log('%c' + '='.repeat(50), styles.dim);

    // Este endpoint necesita ser creado, por ahora simulamos
    console.log('%c⚠️  Endpoint /api/groups/[id]/relations no implementado aún', styles.warning);
    console.log('%cEjemplo de estructura:', styles.info);
    console.log({
      agentAId: 'agent_123',
      agentBId: 'agent_456',
      affinity: 7.5,
      relationType: 'friendship',
      dynamics: ['trust', 'humor_shared'],
      tensionLevel: 0.2,
      interactionCount: 45
    });

    directorCommands._currentGroupId = id;
  },

  // Historial de escenas
  async history(limitOrGroupId?: number | string, groupId?: string) {
    const id = getCurrentGroupId(typeof limitOrGroupId === 'string' ? limitOrGroupId : groupId);
    if (!id) {
      console.warn('%c⚠️  No se pudo determinar el groupId', styles.warning);
      return;
    }

    const limit = typeof limitOrGroupId === 'number' ? limitOrGroupId : 10;

    console.log('%c📜 HISTORIAL DE ESCENAS', styles.title);
    console.log('%c' + '='.repeat(50), styles.dim);
    console.log(`%cÚltimas ${limit} escenas ejecutadas\n`, styles.info);

    // Este endpoint necesita ser creado
    console.log('%c⚠️  Endpoint /api/groups/[id]/scenes/history no implementado aún', styles.warning);
    console.log('%cPara implementar, crear endpoint que devuelva:', styles.info);
    console.log({
      executions: [
        {
          id: 'exec_123',
          sceneCode: 'HUM_042',
          sceneName: 'Broma compartida',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          participantAgents: ['agent_1', 'agent_2'],
          roleAssignments: { COMICO: 'agent_1', RIENDO: 'agent_2' }
        }
      ]
    });

    directorCommands._currentGroupId = id;
  },

  // Métricas del grupo
  async metrics(groupId?: string) {
    const id = getCurrentGroupId(groupId);
    if (!id) {
      console.warn('%c⚠️  No se pudo determinar el groupId', styles.warning);
      return;
    }

    console.log('%c📊 MÉTRICAS DEL GRUPO', styles.title);
    console.log('%c' + '='.repeat(50), styles.dim);

    const data = await fetchAPI(`/api/groups/${id}/director`);
    if (!data) return;

    console.log('%cEscenas ejecutadas:', styles.label, data.metrics.executedScenes);
    console.log('%cSemillas activas:', styles.label, data.metrics.activeSeeds);

    console.log('\n%c💡 Métricas adicionales disponibles próximamente:', styles.info);
    console.log('%c  - Energía grupal', styles.dim);
    console.log('%c  - Nivel de tensión', styles.dim);
    console.log('%c  - Densidad de relaciones', styles.dim);
    console.log('%c  - Categorías más usadas', styles.dim);

    directorCommands._currentGroupId = id;
  },

  // Catálogo de escenas
  async catalog(category?: string) {
    console.log('%c📚 CATÁLOGO DE ESCENAS', styles.title);
    console.log('%c' + '='.repeat(50), styles.dim);

    const data = await fetchAPI('/api/scenes');
    if (!data) {
      // Fallback: mostrar info estática
      console.log('%c📊 Total de escenas: 2002', styles.success);
      console.log('\n%cDistribución por categoría:', styles.subtitle);

      const distribution = {
        COTIDIANO: 502,
        HUMOR: 400,
        DEBATE: 240,
        TENSION: 200,
        ROMANCE: 200,
        VULNERABILIDAD: 160,
        DESCUBRIMIENTO: 100,
        RECONCILIACION: 100,
        PROACTIVIDAD: 60,
        META: 40
      };

      if (category) {
        const upper = category.toUpperCase();
        const count = distribution[upper as keyof typeof distribution];
        if (count) {
          console.log(`%c  ${upper}: ${count} escenas`, styles.info);
        } else {
          console.warn(`%c⚠️  Categoría "${category}" no encontrada`, styles.warning);
          console.log('%cCategorías válidas:', styles.label, Object.keys(distribution).join(', '));
        }
      } else {
        Object.entries(distribution).forEach(([cat, count]) => {
          const percentage = ((count / 2002) * 100).toFixed(1);
          console.log(`%c  ${cat}: %c${count} escenas (${percentage}%)`, styles.label, styles.value);
        });
      }
    }
  },

  // Debug info
  debug() {
    console.log('%c🔧 DEBUG INFO', styles.title);
    console.log('%c' + '='.repeat(50), styles.dim);
    console.log('%cURL actual:', styles.label, window.location.pathname);
    console.log('%cGroup ID detectado:', styles.label, getCurrentGroupId() || 'No detectado');
    console.log('%cLocalStorage groupId:', styles.label, localStorage.getItem('currentGroupId') || 'No guardado');
    console.log('%cWindow.director:', styles.label, typeof (window as any).director);
    console.log('%cNODE_ENV:', styles.label, process.env.NODE_ENV);
  },

  // Ayuda
  help() {
    console.log('%c🎬 DIRECTOR DEV CONSOLE', styles.title);
    console.log('%c' + '='.repeat(50), styles.dim);
    console.log('\n%cComandos disponibles:\n', styles.subtitle);

    const commands = [
      { cmd: 'director.status()', desc: 'Estado completo del director' },
      { cmd: 'director.scene()', desc: 'Escena actual en ejecución' },
      { cmd: 'director.seeds()', desc: 'Semillas de tensión activas' },
      { cmd: 'director.seeds("ACTIVE")', desc: 'Filtrar semillas por estado' },
      { cmd: 'director.relations()', desc: 'Relaciones IA-IA del grupo' },
      { cmd: 'director.relations("agentId")', desc: 'Relaciones de una IA específica' },
      { cmd: 'director.history()', desc: 'Últimas 10 escenas ejecutadas' },
      { cmd: 'director.history(20)', desc: 'Últimas N escenas' },
      { cmd: 'director.metrics()', desc: 'Métricas del grupo' },
      { cmd: 'director.catalog()', desc: 'Catálogo completo de escenas' },
      { cmd: 'director.catalog("HUMOR")', desc: 'Escenas de una categoría' },
      { cmd: 'director.debug()', desc: 'Info de debug (troubleshooting)' },
      { cmd: 'director.help()', desc: 'Mostrar esta ayuda' },
    ];

    commands.forEach(({ cmd, desc }) => {
      console.log(`%c  ${cmd}`, styles.info);
      console.log(`%c    ${desc}\n`, styles.dim);
    });

    console.log('%c💡 Tip:', styles.warning, 'Todos los comandos detectan automáticamente el groupId de la URL actual');
    console.log('%c   O puedes especificar uno manualmente: director.status("groupId")', styles.dim);
  }
};

// Exponer globalmente (solo en desarrollo)
if (typeof window !== 'undefined') {
  (window as any).director = directorCommands;

  // Mostrar mensaje de bienvenida en consola
  if (process.env.NODE_ENV === 'development') {
    console.log('%c🎬 Director Dev Console cargado', styles.success);
    console.log('%cEscribe %cdirector.help()%c para ver comandos disponibles', styles.dim, styles.info, styles.dim);
  }
}

export default directorCommands;
