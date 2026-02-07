# Blaniel Minecraft Integration

Mod de Minecraft (Fabric 1.20.1) que conecta tus agentes de IA de Blaniel con aldeanos en el mundo 3D.

## ✨ Características

- **Aldeanos conectados a tu API**: Cada aldeano representa un agente de Blaniel
- **Chat in-game**: Habla con tus personajes directamente en Minecraft
- **Sincronización emocional**: Las emociones de tu agente afectan al aldeano
- **Comandos completos**: Spawn, asignar, chatear con comandos simples
- **Configuración flexible**: API URL y API Key configurables

## 📦 Instalación

### Requisitos

- Minecraft 1.20.1
- Fabric Loader 0.15.6+
- Fabric API 0.92.0+
- Java 21+

### Pasos

1. Descarga el mod: `blaniel-mc-0.1.0-alpha.jar`
2. Coloca el .jar en `.minecraft/mods/`
3. Inicia Minecraft con Fabric
4. Configura la API con `/blaniel config apiUrl <url>` y `/blaniel config apiKey <key>`

## 🎮 Uso

### Configuración inicial

```
/blaniel config apiUrl http://localhost:3000
/blaniel config apiKey tu-api-key-aqui
```

### Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `/blaniel spawn <agentId>` | Spawnea un aldeano con el agente especificado |
| `/blaniel list` | Lista todos tus agentes disponibles |
| `/blaniel assign <agentId>` | Asigna un agente al aldeano más cercano |
| `/blaniel chat <mensaje>` | Envía un mensaje al aldeano más cercano |
| `/blaniel config` | Muestra la configuración actual |

### Ejemplo de uso

```bash
# 1. Ver tus agentes
/blaniel list

# 2. Spawnear un aldeano
/blaniel spawn clsm1234567890

# 3. Hablar con él
/blaniel chat Hola, ¿cómo estás?

# 4. El aldeano responderá usando la API de Blaniel
```

## 🛠️ Desarrollo

### Setup del proyecto

```bash
git clone <repo>
cd Blaniel-MC
./gradlew build
```

### Estructura del código

```
src/
├── main/java/com/blaniel/minecraft/
│   ├── BlanielMod.java              # Mod principal
│   ├── config/
│   │   └── BlanielConfig.java       # Configuración
│   ├── entity/
│   │   └── BlanielVillagerEntity.java  # Entidad del aldeano
│   ├── network/
│   │   └── BlanielAPIClient.java    # Cliente HTTP
│   └── command/
│       └── BlanielCommands.java     # Comandos del mod
└── client/java/com/blaniel/minecraft/
    ├── BlanielModClient.java        # Cliente
    └── render/
        └── BlanielVillagerRenderer.java  # Renderer
```

### Compilar

```bash
./gradlew build
```

El .jar se generará en `build/libs/blaniel-mc-0.1.0-alpha.jar`

### Ejecutar en desarrollo

```bash
./gradlew runClient
```

## 🔧 Configuración

El archivo de configuración se encuentra en `.minecraft/config/blaniel-mc.json`:

```json
{
  "apiUrl": "http://localhost:3000",
  "apiKey": "tu-api-key",
  "apiEnabled": true
}
```

## 📡 API

El mod se comunica con los siguientes endpoints:

- `GET /api/v1/minecraft/agents` - Lista de agentes
- `POST /api/v1/minecraft/agents/{id}/chat` - Enviar mensaje

Ver documentación completa en: [../PLAN_IMPLEMENTACION.md](../PLAN_IMPLEMENTACION.md)

## 🚀 Roadmap

- [x] MVP funcional con comandos básicos
- [x] Chat vía comando `/blaniel chat`
- [ ] GUI de chat in-game (pantalla interactiva)
- [ ] Sincronización de emociones → animaciones
- [ ] Movimiento inteligente con LLM
- [ ] Rutinas diarias (schedule-based)
- [ ] Múltiples agentes simultáneos
- [ ] Skins personalizadas por agente
- [ ] Integración con sistema de voz (TTS)

## 📝 Licencia

MIT

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-feature`)
3. Commit tus cambios (`git commit -m 'feat: Agregar nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

## 📞 Soporte

Si encuentras bugs o tienes sugerencias:
- Abre un issue en GitHub
- Únete al Discord de Blaniel

---

**Hecho con ❤️ por el equipo de Blaniel**
