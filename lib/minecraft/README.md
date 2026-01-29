# Sistema de Skins Minecraft - Documentación Técnica

## Arquitectura del Sistema

### Sistema Híbrido de 3 Prioridades

El endpoint `/api/v1/minecraft/agents/:id/skin` busca la configuración en este orden:

1. **metadata.minecraft.componentConfig** (Base de datos, usuarios)
2. **metadata.minecraft.skinTraits** (Legacy, DEPRECADO)
3. **CHARACTER_SKIN_CONFIGS[slug]** (Hardcoded, premium)

---

## Uso Rápido

### Generar config para un agente:
```bash
npm run minecraft:generate-configs
```

### Endpoint manual:
```bash
POST /api/v1/minecraft/agents/:id/generate-config
```

### Headers de respuesta:
- `X-Skin-Source: component-metadata` (usuario)
- `X-Skin-Source: skin-traits` (legacy)
- `X-Skin-Source: component-config` (premium)

---

Ver código fuente para documentación completa.
