# 🤖 Sistema de Mensajes Proactivos - Implementación Completa

**Estado:** ✅ Backend Completo | ⚠️ Web Parcial | ❌ Mobile Pendiente
**Fecha:** 2025-01-12
**Adaptado para:** Cloud Server (sin Vercel)

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Backend Implementado](#backend-implementado)
4. [Configuración del Servidor](#configuración-del-servidor)
5. [Integración Web](#integración-web)
6. [Integración Mobile](#integración-mobile)
7. [Testing y Troubleshooting](#testing-y-troubleshooting)

---

## 🎯 Resumen Ejecutivo

### ¿Qué es el Sistema de Mensajes Proactivos?

El sistema permite que las IAs inicien conversaciones con los usuarios basándose en triggers inteligentes, sin necesidad de que el usuario escriba primero.

### Triggers Implementados

| Trigger | Descripción | Frecuencia Recomendada |
|---------|-------------|----------------------|
| **Inactivity** | Usuario lleva tiempo sin interactuar | Después de 24-48h |
| **Follow-up** | Continuar conversación previa | Contextual |
| **Emotional Check-in** | Revisar estado emocional del usuario | Semanal |
| **Celebration** | Celebrar logros o hitos | Evento-based |
| **Life Event** | Responder a eventos importantes | Evento-based |

### Estado de Implementación

```
✅ Backend Completo (100%)
   ├─ ✅ Sistema de triggers
   ├─ ✅ Generación de mensajes (LLM)
   ├─ ✅ Scheduling inteligente
   ├─ ✅ Database models
   ├─ ✅ API endpoints
   └─ ✅ Cron job endpoint

⚠️  Web Frontend (60%)
   ├─ ✅ Hook useProactiveMessages
   ├─ ✅ Componente ProactiveMessageNotification
   ├─ ✅ API endpoints GET/PATCH
   └─ ⚠️  Integración en chat (pendiente)

❌ Mobile (0%)
   ├─ ❌ API service
   ├─ ❌ Hook/Context
   ├─ ❌ Componentes UI
   └─ ❌ Push notifications
```

---

## 🏗️ Arquitectura del Sistema

### Flujo Completo

```
┌──────────────┐
│  Cron Job    │ (Cada hora)
│ (servidor)   │
└──────┬───────┘
       │
       v
┌──────────────────────────────────────────────────┐
│  Backend: /api/cron/proactive-messaging          │
├──────────────────────────────────────────────────┤
│  1. Obtener usuarios activos                     │
│  2. Para cada usuario:                           │
│     - TriggerDetector: ¿Debe enviar mensaje?     │
│     - ContextBuilder: Analizar contexto          │
│     - Scheduler: ¿Es buen momento?               │
│     - MessageGenerator: Generar mensaje (LLM)    │
│     - Guardar en ProactiveMessage (DB)           │
└──────┬───────────────────────────────────────────┘
       │
       v
┌──────────────────────────────────────────────────┐
│  Database: ProactiveMessage                      │
│  status: 'pending' | 'delivered' | 'read'        │
└──────┬───────────────────────────────────────────┘
       │
       v
┌──────────────────────────────────────────────────┐
│  Frontend: Polling cada 1 min                    │
│  GET /api/agents/[id]/proactive-messages         │
├──────────────────────────────────────────────────┤
│  1. Obtener mensajes pendientes                  │
│  2. Marcar como 'delivered'                      │
│  3. Mostrar notificación al usuario              │
│  4. Usuario responde o descarta                  │
│  5. PATCH para marcar como 'read' o 'dismissed'  │
└──────────────────────────────────────────────────┘
```

---

## ✅ Backend Implementado

### Archivos Creados

#### 1. Cron Job Endpoint
**Archivo:** `app/api/cron/proactive-messaging/route.ts`

```typescript
// Endpoint protegido por CRON_SECRET
// Procesa todos los agentes cada hora
POST /api/cron/proactive-messaging
Authorization: Bearer {CRON_SECRET}
```

**Características:**
- ✅ Autenticación por CRON_SECRET
- ✅ Logging detallado
- ✅ Métricas guardadas en DB
- ✅ Error handling robusto
- ✅ Timeout de 5 minutos

#### 2. API Endpoints para Frontend
**Archivo:** `app/api/agents/[id]/proactive-messages/route.ts`

```typescript
// Obtener mensajes pendientes
GET /api/agents/[agentId]/proactive-messages

// Marcar mensaje como leído/descartado
PATCH /api/agents/[agentId]/proactive-messages
Body: { messageId, status, userResponse? }
```

#### 3. Documentación
**Archivos creados:**
- `docs/CLOUD_SERVER_CRON_JOBS.md` - Guía completa de cron jobs
- `scripts/setup-cron-jobs.sh` - Script de instalación automática

---

## ⚙️ Configuración del Servidor

### Paso 1: Variables de Entorno

Agregar a `.env`:

```bash
# Secret para proteger endpoints de cron
CRON_SECRET="genera_uno_con_openssl_rand_base64_32"

# URL de la aplicación
APP_URL="http://localhost:3000"  # o tu dominio

# Habilitar mensajes proactivos
PROACTIVE_MESSAGING_ENABLED=true
```

### Paso 2: Generar CRON_SECRET

```bash
openssl rand -base64 32
```

### Paso 3: Instalar Cron Jobs

#### Opción A: Instalación Automática (Recomendado)

```bash
cd /var/www/circuit-prompt-ai
chmod +x scripts/setup-cron-jobs.sh
./scripts/setup-cron-jobs.sh
```

#### Opción B: Instalación Manual

```bash
crontab -e
```

Agregar estas líneas:

```bash
# Mensajes Proactivos (cada hora)
0 * * * * curl -X POST -H "Authorization: Bearer TU_CRON_SECRET" http://localhost:3000/api/cron/proactive-messaging >> /var/www/circuit-prompt-ai/logs/proactive-messaging.log 2>&1

# Otros cron jobs...
# (Ver docs/CLOUD_SERVER_CRON_JOBS.md para lista completa)
```

### Paso 4: Verificar Instalación

```bash
# Ver cron jobs instalados
crontab -l

# Probar endpoint manualmente
curl -X POST \
  -H "Authorization: Bearer TU_CRON_SECRET" \
  http://localhost:3000/api/cron/proactive-messaging

# Ver logs
tail -f /var/www/circuit-prompt-ai/logs/proactive-messaging.log
```

---

## 🌐 Integración Web

### Archivos Creados

1. **Hook:** `hooks/useProactiveMessages.ts`
2. **Componente:** `components/chat/ProactiveMessageNotification.tsx`

### Integración Rápida

#### Ejemplo: Agregar al Chat Page

**Archivo:** `app/agentes/[id]/page.tsx`

```typescript
import { ProactiveMessageNotification } from "@/components/chat/ProactiveMessageNotification";

export default function AgentChatPage({ params }: { params: { id: string } }) {
  const agentId = params.id;

  return (
    <div>
      {/* Tu chat actual */}
      <YourChatComponent agentId={agentId} />

      {/* Agregar notificaciones proactivas */}
      <ProactiveMessageNotification
        agentId={agentId}
        agentName="Tu IA"
        inline={false} // false = flotante, true = inline en chat
        onMessageClick={(message) => {
          console.log("Usuario clickeó mensaje proactivo:", message);
          // Opcional: Agregar mensaje al chat automáticamente
        }}
      />
    </div>
  );
}
```

#### Ejemplo: Modo Inline (Dentro del Chat)

```typescript
<ProactiveMessageNotification
  agentId={agentId}
  agentName={agent.name}
  inline={true} // Mostrar como parte del chat
  className="mb-4" // Estilo personalizado
  onMessageClick={(message) => {
    // Agregar mensaje al historial del chat
    addMessageToChat({
      role: "assistant",
      content: message.content,
      isProactive: true,
    });
  }}
/>
```

### Características del Componente Web

- ✅ Polling automático cada 1 minuto
- ✅ Notificaciones del sistema (si están permitidas)
- ✅ Sonido de notificación (opcional)
- ✅ Animaciones suaves con Framer Motion
- ✅ Modo flotante o inline
- ✅ Soporte para múltiples mensajes (carousel)
- ✅ Auto-cierre después de 10 segundos (opcional)

### Permisos de Notificaciones

El componente solicita automáticamente permisos de notificación. Para configurar manualmente:

```typescript
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}
```

---

## 📱 Integración Mobile

### TODO: Archivos a Crear

#### 1. API Service

**Archivo:** `mobile/src/services/api/proactive.api.ts`

```typescript
import { API_BASE_URL } from "@/config/api.config";

export interface ProactiveMessage {
  id: string;
  content: string;
  triggerType: string;
  createdAt: string;
  scheduledFor: string | null;
  context?: any;
}

export const proactiveApi = {
  /**
   * Obtener mensajes proactivos pendientes
   */
  async getPendingMessages(agentId: string): Promise<ProactiveMessage[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/agents/${agentId}/proactive-messages`,
      {
        headers: {
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch proactive messages");
    }

    const data = await response.json();
    return data.messages || [];
  },

  /**
   * Marcar mensaje como leído
   */
  async markAsRead(agentId: string, messageId: string): Promise<void> {
    await fetch(
      `${API_BASE_URL}/api/agents/${agentId}/proactive-messages`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify({
          messageId,
          status: "read",
        }),
      }
    );
  },

  /**
   * Marcar mensaje como descartado
   */
  async markAsDismissed(agentId: string, messageId: string): Promise<void> {
    await fetch(
      `${API_BASE_URL}/api/agents/${agentId}/proactive-messages`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify({
          messageId,
          status: "dismissed",
        }),
      }
    );
  },
};
```

#### 2. Hook/Context

**Archivo:** `mobile/src/hooks/useProactiveMessages.ts`

```typescript
import { useState, useEffect, useCallback } from "react";
import { proactiveApi, ProactiveMessage } from "@/services/api/proactive.api";
import * as Notifications from "expo-notifications";
import { Vibration } from "react-native";

export function useProactiveMessages(agentId: string) {
  const [messages, setMessages] = useState<ProactiveMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!agentId) return;

    try {
      setIsLoading(true);
      const newMessages = await proactiveApi.getPendingMessages(agentId);

      // Si hay nuevos mensajes, mostrar notificación
      if (newMessages.length > 0 && messages.length === 0) {
        // Vibración
        Vibration.vibrate([0, 200, 100, 200]);

        // Notificación local
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Nuevo mensaje proactivo",
            body: newMessages[0].content.substring(0, 100),
          },
          trigger: null, // Inmediato
        });
      }

      setMessages(newMessages);
    } catch (error) {
      console.error("Error fetching proactive messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [agentId, messages.length]);

  // Polling cada 1 minuto
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 60000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const markAsRead = async (messageId: string) => {
    await proactiveApi.markAsRead(agentId, messageId);
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  const markAsDismissed = async (messageId: string) => {
    await proactiveApi.markAsDismissed(agentId, messageId);
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  return {
    messages,
    isLoading,
    markAsRead,
    markAsDismissed,
    refresh: fetchMessages,
  };
}
```

#### 3. Componente UI

**Archivo:** `mobile/src/components/chat/ProactiveMessageBanner.tsx`

```typescript
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Sparkles, X } from "lucide-react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface ProactiveMessageBannerProps {
  message: string;
  onPress: () => void;
  onDismiss: () => void;
}

export function ProactiveMessageBanner({
  message,
  onPress,
  onDismiss,
}: ProactiveMessageBannerProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        <Sparkles color="#fff" size={20} />
      </View>

      <TouchableOpacity style={styles.content} onPress={onPress}>
        <Text style={styles.title}>Mensaje proactivo</Text>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
        <X color="#fff" size={20} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#8B5CF6", // purple-600
    borderRadius: 16,
    padding: 12,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  message: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
  },
  closeButton: {
    padding: 4,
  },
});
```

#### 4. Integración en Chat Screen

**Archivo:** `mobile/src/screens/Messages/ChatScreen.tsx`

```typescript
import { useProactiveMessages } from "@/hooks/useProactiveMessages";
import { ProactiveMessageBanner } from "@/components/chat/ProactiveMessageBanner";

export function ChatScreen({ route }) {
  const { agentId } = route.params;
  const { messages, markAsRead, markAsDismissed } = useProactiveMessages(agentId);

  const currentProactiveMessage = messages[0];

  return (
    <View style={{ flex: 1 }}>
      {/* Mensajes del chat */}
      <FlatList data={chatMessages} renderItem={renderMessage} />

      {/* Banner de mensaje proactivo */}
      {currentProactiveMessage && (
        <ProactiveMessageBanner
          message={currentProactiveMessage.content}
          onPress={async () => {
            await markAsRead(currentProactiveMessage.id);
            // Opcional: Agregar mensaje al chat
            addMessageToChat(currentProactiveMessage.content);
          }}
          onDismiss={() => markAsDismissed(currentProactiveMessage.id)}
        />
      )}

      {/* Input de chat */}
      <ChatInput onSend={sendMessage} />
    </View>
  );
}
```

#### 5. Configurar Push Notifications

**Archivo:** `mobile/src/services/push-notifications.ts`

```typescript
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configurar handler de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#8B5CF6",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Failed to get push notification permissions");
    return;
  }

  // Opcional: Obtener token para push notifications remotas
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("Push token:", token);

  // Enviar token al backend para recibir push notifications
  // await api.registerPushToken(token);

  return token;
}
```

---

## 🧪 Testing y Troubleshooting

### Testing del Backend

#### 1. Probar Cron Job Manualmente

```bash
curl -X POST \
  -H "Authorization: Bearer TU_CRON_SECRET" \
  http://localhost:3000/api/cron/proactive-messaging

# Respuesta esperada:
{
  "success": true,
  "message": "Proactive messaging job completed successfully",
  "stats": {
    "messagesCreated": 5,
    "errors": 0,
    "totalAgentsChecked": 20,
    "executionTimeMs": 1234
  }
}
```

#### 2. Ver Mensajes en la Base de Datos

```sql
-- Ver mensajes proactivos pendientes
SELECT * FROM "ProactiveMessage" WHERE status = 'pending';

-- Ver mensajes por agente
SELECT * FROM "ProactiveMessage" WHERE "agentId" = 'agent-id-here';

-- Estadísticas
SELECT
  status,
  COUNT(*) as count
FROM "ProactiveMessage"
GROUP BY status;
```

#### 3. Ver Logs

```bash
# Logs del cron job
tail -f /var/www/circuit-prompt-ai/logs/proactive-messaging.log

# Logs de PM2 (aplicación)
pm2 logs circuit-prompt-ai

# Logs del sistema cron
sudo tail -f /var/log/syslog | grep CRON
```

### Testing del Frontend

#### Web

```typescript
// En la consola del navegador
// 1. Verificar hook
const { messages } = useProactiveMessages(agentId);
console.log("Mensajes proactivos:", messages);

// 2. Forzar fetch manual
await fetch(`/api/agents/${agentId}/proactive-messages`).then(r => r.json());

// 3. Verificar permisos de notificación
console.log("Notification permission:", Notification.permission);
```

#### Mobile

```typescript
// En React Native
import { proactiveApi } from "@/services/api/proactive.api";

// Probar API
const messages = await proactiveApi.getPendingMessages(agentId);
console.log("Mensajes:", messages);

// Probar notificación
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Test",
    body: "Mensaje de prueba",
  },
  trigger: null,
});
```

### Problemas Comunes

#### 1. Cron Job no se ejecuta

**Síntomas:** No se crean mensajes proactivos

**Solución:**
```bash
# Verificar que cron esté corriendo
sudo systemctl status cron

# Verificar crontab
crontab -l

# Ver logs del sistema
sudo tail -f /var/log/syslog | grep CRON

# Ejecutar manualmente
curl -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/proactive-messaging
```

#### 2. Error 401 (Unauthorized)

**Causa:** CRON_SECRET incorrecto

**Solución:**
```bash
# Verificar CRON_SECRET en .env
grep CRON_SECRET .env

# Verificar en crontab
crontab -l | grep proactive-messaging

# Asegurarse de que coinciden
```

#### 3. Frontend no recibe mensajes

**Causas posibles:**
- Polling deshabilitado
- Usuario no autenticado
- AgentId incorrecto

**Solución:**
```typescript
// Verificar en componente
useProactiveMessages(agentId, {
  enabled: true, // Asegurar que esté true
  pollingInterval: 60000,
  onError: (error) => console.error("Error:", error),
});
```

#### 4. Mobile: Notificaciones no funcionan

**Solución:**
```typescript
// 1. Verificar permisos
const { status } = await Notifications.getPermissionsAsync();
console.log("Notification permission:", status);

// 2. Solicitar permisos
if (status !== "granted") {
  await Notifications.requestPermissionsAsync();
}

// 3. Verificar canal (Android)
await Notifications.setNotificationChannelAsync("default", {
  name: "default",
  importance: Notifications.AndroidImportance.MAX,
});
```

---

## 📊 Monitoreo y Métricas

### Dashboards Recomendados

1. **Cron Job Success Rate**
   - Ejecuciones exitosas vs fallidas
   - Tiempo de ejecución promedio
   - Mensajes creados por ejecución

2. **User Engagement**
   - Mensajes entregados vs leídos
   - Tasa de respuesta
   - Tipos de trigger más efectivos

3. **Performance**
   - Tiempo de generación de mensajes (LLM)
   - Latencia de API endpoints
   - Tamaño de cola de mensajes pendientes

### Queries Útiles

```sql
-- Mensajes creados hoy
SELECT COUNT(*) FROM "ProactiveMessage"
WHERE DATE("createdAt") = CURRENT_DATE;

-- Tasa de respuesta
SELECT
  COUNT(CASE WHEN status = 'read' THEN 1 END) * 100.0 / COUNT(*) as response_rate
FROM "ProactiveMessage"
WHERE status IN ('delivered', 'read', 'dismissed');

-- Triggers más efectivos
SELECT
  "triggerType",
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'read' THEN 1 END) as read_count,
  COUNT(CASE WHEN status = 'read' THEN 1 END) * 100.0 / COUNT(*) as read_rate
FROM "ProactiveMessage"
GROUP BY "triggerType"
ORDER BY read_rate DESC;
```

---

## 🚀 Próximos Pasos

### Prioridad Alta
1. ✅ Completar integración en Web chat
2. ❌ Implementar API service en Mobile
3. ❌ Crear componentes UI para Mobile
4. ❌ Configurar push notifications en Mobile

### Prioridad Media
- Agregar A/B testing para tipos de mensajes
- Implementar machine learning para optimizar triggers
- Dashboard de analytics para administradores
- Configuración de preferencias por usuario

### Prioridad Baja
- Soporte multi-idioma para mensajes proactivos
- Integración con calendarios del usuario
- Mensajes proactivos con multimedia (imágenes, GIFs)

---

## 📞 Soporte

Para problemas o preguntas:

1. Revisar logs: `tail -f /var/www/circuit-prompt-ai/logs/proactive-messaging.log`
2. Verificar documentación: `docs/CLOUD_SERVER_CRON_JOBS.md`
3. Probar manualmente el endpoint
4. Crear issue en GitHub

---

**Última actualización:** 2025-01-12
**Versión:** 1.0.0
**Autor:** Claude Code
