# Guía de Configuración - Blaniel Minecraft Mod

## 🎮 Sistema de Chat Avanzado Implementado

El mod ahora incluye un sistema de chat grupal avanzado con IA conversacional que detecta contexto espacial y gestiona interacciones inteligentes.

---

## 📋 Requisitos Previos

1. **Cuenta en Blaniel.com**
   - Regístrate en https://blaniel.com/registro
   - Crea al menos un personaje IA

2. **API Key**
   - Ve a https://blaniel.com/configuracion
   - En la sección "Desarrollador", genera una API key
   - Copia la API key (la necesitarás para el paso siguiente)

---

## ⚙️ Configuración Inicial

### 1. Ubicar el archivo de configuración

Cuando ejecutas el mod por primera vez, se crea automáticamente el archivo:
```
blaniel-mc.properties
```

Este archivo se encuentra en el **directorio raíz del juego** (donde está instalado Minecraft).

### 2. Editar la configuración

Abre `blaniel-mc.properties` con un editor de texto y configura:

```properties
# API Key de Blaniel (REQUERIDO)
api.key=tu_api_key_aqui

# URL de la API (por defecto: https://blaniel.com/api/v1/minecraft)
api.url=https://blaniel.com/api/v1/minecraft

# Radio de detección de agentes (en bloques, por defecto: 16.0)
chat.radius=16.0

# Modo debug (muestra información adicional en consola)
debug.enabled=false
```

**Importante:** Reemplaza `tu_api_key_aqui` con la API key que copiaste de Blaniel.com

### 3. Reiniciar Minecraft

Después de editar la configuración, reinicia Minecraft para que los cambios surtan efecto.

---

## 🎯 Uso del Sistema de Chat

### Invocar agentes en el mundo

Usa el comando en el chat de Minecraft:

```
/blaniel spawn <agentId> [nombre personalizado]
```

**Ejemplo:**
```
/blaniel spawn agent_abc123 Einstein
```

Esto creará un aldeano con la IA de ese agente en tu ubicación actual.

### Abrir el chat avanzado

**Presiona la tecla `K`** para abrir el chat de Blaniel.

Se abrirá una interfaz donde puedes escribir tu mensaje.

### Enviar mensajes

1. Presiona `K`
2. Escribe tu mensaje
3. Presiona `Enter` para enviar
4. Presiona `ESC` para cancelar

---

## 🤖 Características del Sistema

### Detección de Contexto

El sistema detecta automáticamente si es una conversación **individual** o **grupal**:

#### Conversación Individual (1 agente responde)
- Estás mirando a un NPC (cruceta sobre el NPC) y estás a menos de 7 metros
- Mencionas explícitamente el nombre de un agente ("Sarah, ¿qué opinas?")
- Continuidad conversacional (< 1 minuto desde última interacción)
- Agente más cercano (fallback)

#### Conversación Grupal (2-3 agentes responden)
- Usas palabras clave grupales: "todos", "chicos", "equipo", "grupo", "amigos", "ustedes"
- Mencionas múltiples nombres ("Alice y Sarah, vengan acá")

### Sistema de Movimiento Inteligente

Los NPCs pueden:
- **Acercarse** si estás a más de 4 metros (se posiciona a 3m)
- **Caminar** hacia otro agente si lo llamas (< 20 metros)
- **Teletransportarse** para distancias largas (> 20 metros)

**Ejemplo de interacción con movimiento:**
```
Usuario: "Alice, necesito hablar contigo"
[Alice está a 6 metros]
Alice: "Claro, espera que me acerco"
[Alice camina hasta 3 metros]
Alice: "Ya estoy aquí, dime"
```

### Redirección de Preguntas

Si haces una pregunta ambigua, la IA puede redirigirla:

**Ejemplo:**
```
Usuario: "¿Y tu amiga qué piensa?"
Alice: "¿Quién, Sarah? Preguntémosle. Sarah! ¿Qué piensas de esto?"
Sarah: "Hmm, creo que es una buena idea..."
```

### Animaciones Emocionales

Los NPCs responden con animaciones según el contexto:
- 👋 **waving** - Saludar con la mano
- 🤔 **thinking** - Mirar hacia arriba (pensativo)
- 😊 **happy** - Saltar de alegría
- 😲 **surprised** - Paso atrás
- 👉 **pointing** - Señalar
- 🙋 **beckoning** - "Ven acá" (mano + salto)

---

## 🔧 Solución de Problemas

### "No hay agentes IA cercanos para responder"
- **Causa:** No hay NPCs de Blaniel en un radio de 16 bloques
- **Solución:** Invoca un agente con `/blaniel spawn <agentId>` o acércate a uno existente

### "Error de autenticación. Verifica tu API key"
- **Causa:** API key incorrecta o no configurada
- **Solución:**
  1. Verifica que `blaniel-mc.properties` existe
  2. Asegúrate de que `api.key` tiene tu API key correcta (sin espacios)
  3. Reinicia Minecraft

### "Límite de tasa excedido. Espera un momento"
- **Causa:** Has enviado demasiados mensajes en poco tiempo
- **Solución:** Espera unos segundos antes de enviar otro mensaje
- **Nota:** Los límites dependen de tu plan en Blaniel:
  - Free: 10 msg/min, 100 msg/hora
  - Plus: 30 msg/min, 600 msg/hora
  - Ultra: 100 msg/min, 6000 msg/hora

### "No se encontraron agentes"
- **Causa:** No has creado agentes en Blaniel.com o el agentId es incorrecto
- **Solución:** Ve a https://blaniel.com/create-character y crea un personaje

### La tecla K no funciona
- **Causa:** Conflicto con otro mod o keybinding
- **Solución:** Busca en las opciones de Minecraft → Controles → "Blaniel" y reasigna la tecla

---

## 📊 Información de Debug

Si habilitas `debug.enabled=true` en la configuración, verás información adicional en los logs:

```
[INFO] Tipo de conversación: individual
[INFO] Razón: Player looking at NPC within 7m
[INFO] Agentes respondiendo: 1
[INFO] Tiempo de respuesta: 1247ms
```

---

## 🎮 Comandos Disponibles

```bash
# Invocar agente
/blaniel spawn <agentId> [nombre]

# Listar agentes cercanos
/blaniel list

# Eliminar agente (mirando al NPC)
/blaniel remove

# Recargar configuración
/blaniel reload
```

---

## 💡 Consejos de Uso

1. **Conversaciones naturales:** Habla como lo harías normalmente, el sistema entiende contexto
2. **Nombres claros:** Nombra a tus NPCs con nombres fáciles de recordar y mencionar
3. **Espaciado:** Mantén los NPCs a menos de 16 bloques para que respondan
4. **Emociones:** Los NPCs responderán con animaciones apropiadas al contexto emocional
5. **Grupos:** Invoca varios agentes para crear conversaciones grupales dinámicas

---

## 🚀 Próximas Características

- [ ] Voz (Text-to-Speech) con ElevenLabs
- [ ] Análisis de imágenes (enviar screenshots)
- [ ] Memoria persistente entre sesiones
- [ ] Eventos emergentes grupales
- [ ] Animaciones más complejas (mod Emotecraft)

---

## 📞 Soporte

Si encuentras problemas o tienes preguntas:

1. **Logs:** Revisa los logs de Minecraft en `.minecraft/logs/latest.log`
2. **GitHub Issues:** Reporta bugs en el repositorio del mod
3. **Discord:** Únete al servidor de Blaniel para soporte comunitario

---

## 📄 Licencia

Este mod es parte del proyecto Blaniel y está licenciado bajo MIT License.

**Versión:** 0.1.0-alpha
**Fecha:** 2026-01-28
**Autor:** Sistema Blaniel
