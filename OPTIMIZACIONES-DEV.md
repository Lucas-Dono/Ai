# Optimizaciones Adicionales para Desarrollo

## Ya implementadas ✅
1. Turbopack habilitado en server.js
2. optimizePackageImports para librerías grandes
3. Sentry deshabilitado en desarrollo
4. Telemetría de Next.js deshabilitada

## Optimizaciones adicionales opcionales

### 1. Usar dynamic imports para rutas pesadas
En páginas con muchos componentes, usa dynamic imports:

```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <div>Cargando...</div>,
  ssr: false // si no necesitas SSR
})
```

### 2. Configurar exclude en tsconfig.json
Asegúrate de que TypeScript no procese archivos innecesarios:

```json
{
  "exclude": [
    "node_modules",
    ".next",
    "out",
    "mobile",
    "**/*.spec.ts",
    "**/*.test.ts"
  ]
}
```

### 3. Limpiar caché si persisten problemas
```bash
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

### 4. Aumentar aún más la memoria de Node (si tienes RAM disponible)
En package.json, cambiar de 8192 a 12288 si tienes >16GB RAM:
```json
"dev": "NODE_OPTIONS='--max-old-space-size=12288' node server.js"
```

### 5. Usar SWC minifier (ya debería estar activo por defecto en Next 15)
Ya está habilitado por defecto, pero puedes verificar agregando en next.config.ts:
```ts
swcMinify: true
```

### 6. Deshabilitar React Strict Mode en desarrollo (solo si es necesario)
Strict Mode renderiza componentes 2 veces en dev. Solo deshabilitarlo si es muy molesto:
```ts
reactStrictMode: false // Solo en desarrollo
```

## Medición de mejoras

Para medir el impacto:
1. Antes de las optimizaciones: Anota el tiempo de compilación inicial y de HMR
2. Después: Compara los tiempos
3. Esperado: **Reducción de 50-80% en tiempos de compilación**

## Troubleshooting

Si después de los cambios hay errores:
1. Limpia la caché: `rm -rf .next`
2. Reinstala dependencias: `rm -rf node_modules && npm install`
3. Si Turbopack da problemas, puedes deshabilitarlo temporalmente quitando `turbo: dev` de server.js
