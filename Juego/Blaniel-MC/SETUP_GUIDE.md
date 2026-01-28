# Guía de Configuración - Blaniel Minecraft Mod

## 🎮 Sistema de Chat Avanzado con IA Conversacional

El mod ahora incluye un sistema de chat grupal avanzado con IA conversacional que detecta contexto espacial y gestiona interacciones inteligentes.

---

## 📋 Requisitos Previos

1. **Cuenta en Blaniel.com**
   - Regístrate en https://blaniel.com/registro
   - Crea al menos un personaje IA

2. **Minecraft 1.20.1 con Fabric**
   - Fabric Loader instalado
   - Fabric API mod instalado

---

## ⚙️ Primer Uso - Login Automático

### 1. Instalar el mod

1. Descarga el archivo `.jar` del mod
2. Colócalo en la carpeta `mods` de tu instalación de Minecraft
3. Inicia Minecraft con el perfil de Fabric

### 2. Login automático en el juego

Cuando entres a un mundo por primera vez, **aparecerá automáticamente** una pantalla de inicio de sesión:

**Pantalla de Login:**
- **Email**: Tu email registrado en Blaniel.com
- **Contraseña**: Tu contraseña de Blaniel.com
- Presiona `Enter` o haz clic en "Iniciar Sesión"

El mod guardará tu sesión automáticamente. **No necesitas volver a loguearte** a menos que cierres sesión manualmente o cambies de cuenta.

### 3. Configuración guardada

Después del login, el mod crea automáticamente:
```
.minecraft/config/blaniel-mc.json
```

Este archivo contiene:
- Token JWT de sesión (se renueva automáticamente)
- URL del servidor (por defecto: https://blaniel.com)
- Datos básicos del usuario (nombre, email, plan)

**No necesitas editar este archivo manualmente.**

---

## 🎯 Uso del Sistema de Chat

### Acceso a Personajes

El mod te da acceso a:
- ✅ **Todos tus personajes privados** (creados por ti)
- ✅ **Todos los personajes públicos** (creados por otros usuarios)
- ✅ **Personajes destacados** (featured)

Esto significa que puedes invocar **cualquier personaje de Blaniel** en tu mundo de Minecraft, no solo los tuyos.

### Invocar personajes en el mundo

Usa el comando en el chat de Minecraft:

```
/blaniel list
```
Muestra todos los personajes disponibles (públicos + privados)

```
/blaniel spawn <nombre_o_id>
```
Invoca un personaje en tu ubicación

**Ejemplo:**
```
/blaniel list
> Mostrando 45 agentes disponibles:
> - Tus agentes (3): Alice, Bob, Charlie
> - Agentes públicos (42): Einstein, Marilyn Monroe, Sherlock Holmes...

/blaniel spawn Einstein
> ✓ Einstein invocado en tu posición
```

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
- **Solución:** Invoca un agente con `/blaniel spawn <nombre>` o acércate a uno existente

### "Debes iniciar sesión primero"
- **Causa:** No has iniciado sesión o la sesión expiró
- **Solución:**
  1. Presiona `K` nuevamente (se abrirá login automático)
  2. Ingresa tu email y contraseña de Blaniel.com
  3. Si el problema persiste, elimina `.minecraft/config/blaniel-mc.json` y reinicia

### "Límite de tasa excedido. Espera un momento"
- **Causa:** Has enviado demasiados mensajes en poco tiempo
- **Solución:** Espera unos segundos antes de enviar otro mensaje
- **Nota:** Los límites dependen de tu plan en Blaniel:
  - Free: 10 msg/min, 100 msg/hora
  - Plus: 30 msg/min, 600 msg/hora
  - Ultra: 100 msg/min, 6000 msg/hora

### "No se encontraron agentes"
- **Causa:** No hay personajes creados en el servidor
- **Solución:**
  1. Ve a https://blaniel.com/create-character y crea un personaje
  2. También puedes usar personajes públicos de otros usuarios

### La tecla K no funciona
- **Causa:** Conflicto con otro mod o keybinding
- **Solución:** Busca en las opciones de Minecraft → Controles → "Blaniel" y reasigna la tecla

### Error de conexión al servidor
- **Causa:** El servidor de Blaniel no está disponible o hay problemas de red
- **Solución:**
  1. Verifica tu conexión a internet
  2. Si usas localhost en desarrollo, asegúrate de que el servidor esté corriendo
  3. Verifica la URL en `.minecraft/config/blaniel-mc.json`

---

## 📊 Información de Debug

Para ver información adicional en los logs, busca en `.minecraft/logs/latest.log`:

```
[Blaniel] Usuario logueado: Tu Nombre (tu@email.com)
[Blaniel] Tipo de conversación: individual
[Blaniel] Agentes respondiendo: 1
```

---

## 🎮 Comandos Disponibles

```bash
# Listar agentes disponibles
/blaniel list

# Invocar agente por nombre o ID
/blaniel spawn <nombre_o_id>

# Eliminar agente (mirando al NPC)
/blaniel remove

# Cerrar sesión
/blaniel logout

# Información del mod
/blaniel info
```

---

## 💡 Consejos de Uso

1. **Conversaciones naturales:** Habla como lo harías normalmente, el sistema entiende contexto
2. **Explora personajes públicos:** Usa `/blaniel list` para ver todos los personajes disponibles
3. **Nombra NPCs claramente:** Usa nombres fáciles de recordar y mencionar
4. **Espaciado:** Mantén los NPCs a menos de 16 bloques para que respondan
5. **Emociones:** Los NPCs responderán con animaciones apropiadas al contexto emocional
6. **Grupos:** Invoca varios agentes para crear conversaciones grupales dinámicas
7. **Privacidad:** Solo tú puedes ver las conversaciones con tus personajes privados

---

## 🔐 Seguridad y Privacidad

- **Sesión segura:** El mod usa JWT tokens que expiran automáticamente
- **Sin almacenamiento de contraseñas:** Tu contraseña nunca se guarda en el disco
- **Datos encriptados:** Las conversaciones se transmiten de forma segura (HTTPS)
- **Privacidad de personajes:** Tus personajes privados solo son accesibles por ti

---

## 🚀 Próximas Características

- [ ] Voz (Text-to-Speech) con ElevenLabs
- [ ] Análisis de imágenes (enviar screenshots)
- [ ] Memoria persistente entre sesiones
- [ ] Eventos emergentes grupales
- [ ] Animaciones más complejas (mod Emotecraft)
- [ ] Sistema de relaciones entre NPCs
- [ ] Misiones y objetivos generados por IA

---

## 📞 Soporte

Si encuentras problemas o tienes preguntas:

1. **Logs:** Revisa los logs de Minecraft en `.minecraft/logs/latest.log`
2. **GitHub Issues:** Reporta bugs en el repositorio del mod
3. **Discord:** Únete al servidor de Blaniel para soporte comunitario
4. **Web:** https://blaniel.com/soporte

---

## 📄 Licencia

Este mod es parte del proyecto Blaniel y está licenciado bajo MIT License.

**Versión:** 0.1.0-alpha
**Fecha:** 2026-01-28
**Autor:** Sistema Blaniel
**Web:** https://blaniel.com
