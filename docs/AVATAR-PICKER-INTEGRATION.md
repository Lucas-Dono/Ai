# Integración del Avatar Picker en el Sistema de Agentes

## 📋 Resumen

El **AvatarPicker** es un componente unificado que ofrece 3 métodos para crear/seleccionar avatares:

1. **🎨 Manual** - Editor de personajes con assets anime (Sutemo Female)
2. **✨ IA** - Generación automática con AI Horde
3. **📤 Upload** - Subir imagen propia

---

## 🎯 Caso de uso principal: Creación de Agentes

### Opción A: Modal en creación de agente (Recomendada)

```tsx
// app/agents/new/page.tsx o componente de creación de agente

import { AvatarPicker } from '@/components/avatar/AvatarPicker';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export default function CreateAgentPage() {
  const [agentData, setAgentData] = useState({
    name: '',
    personality: '',
    gender: '',
    avatar: '',
  });

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleAvatarSelected = (avatarUrl: string, method: string) => {
    setAgentData({ ...agentData, avatar: avatarUrl });
    setShowAvatarPicker(false); // Cerrar modal

    // Opcional: guardar en DB inmediatamente
    // await updateAgentAvatar(agentId, avatarUrl);
  };

  return (
    <form>
      {/* Campos normales del agente */}
      <Input
        label="Nombre"
        value={agentData.name}
        onChange={(e) => setAgentData({ ...agentData, name: e.target.value })}
      />

      <Textarea
        label="Personalidad"
        value={agentData.personality}
        onChange={(e) => setAgentData({ ...agentData, personality: e.target.value })}
      />

      {/* Botón para abrir Avatar Picker */}
      <Dialog open={showAvatarPicker} onOpenChange={setShowAvatarPicker}>
        <DialogTrigger asChild>
          <Button variant="outline">
            {agentData.avatar ? 'Cambiar Avatar' : 'Crear Avatar'}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <AvatarPicker
            characterName={agentData.name}
            personality={agentData.personality}
            gender={agentData.gender}
            currentAvatar={agentData.avatar}
            onAvatarSelected={handleAvatarSelected}
          />
        </DialogContent>
      </Dialog>

      {/* Preview del avatar */}
      {agentData.avatar && (
        <div className="mt-4">
          <img src={agentData.avatar} alt="Avatar" className="w-32 h-32 rounded-full" />
        </div>
      )}
    </form>
  );
}
```

---

### Opción B: Página dedicada

```tsx
// app/agents/[id]/avatar/page.tsx

import { AvatarPicker } from '@/components/avatar/AvatarPicker';
import { useRouter } from 'next/navigation';

export default function AgentAvatarPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [agent, setAgent] = useState(null);

  useEffect(() => {
    // Cargar datos del agente
    fetch(`/api/agents/${params.id}`).then(r => r.json()).then(setAgent);
  }, [params.id]);

  const handleAvatarSelected = async (avatarUrl: string, method: string) => {
    // Guardar en DB
    await fetch(`/api/agents/${params.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ avatar: avatarUrl }),
    });

    // Redirigir de vuelta al agente
    router.push(`/agents/${params.id}`);
  };

  if (!agent) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Personalizar Avatar de {agent.name}</h1>
      <AvatarPicker
        characterName={agent.name}
        personality={agent.personality}
        gender={agent.gender}
        currentAvatar={agent.avatar}
        onAvatarSelected={handleAvatarSelected}
      />
    </div>
  );
}
```

---

## 🔧 Props del AvatarPicker

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `characterName` | `string` | `'Personaje'` | Nombre del personaje (para generación IA) |
| `personality` | `string` | `''` | Personalidad (para generación IA) |
| `gender` | `string?` | - | Género opcional |
| `currentAvatar` | `string?` | - | URL del avatar actual (para preview) |
| `onAvatarSelected` | `(url: string, method: string) => void` | **Required** | Callback cuando se selecciona avatar |
| `allowedMethods` | `Array<'manual' \| 'ai' \| 'upload'>` | `['manual', 'ai', 'upload']` | Métodos permitidos |

---

## 📦 Componentes incluidos

### 1. `AvatarPicker.tsx`
Componente principal con tabs.

### 2. `AIAvatarGenerator.tsx`
- Usa endpoint existente: `/api/agents/generate-reference-image`
- Genera avatares fotorealistas con AI Horde
- Muestra progreso en tiempo real

### 3. `ImageUploader.tsx`
- Drag & drop de imágenes
- Validación de formato y tamaño
- Preview antes de upload
- **NOTA:** Actualmente usa base64. Implementar endpoint `/api/upload/avatar` para producción.

### 4. `CharacterEditor.tsx` (ya existente)
- Editor manual con assets anime
- Sistema de presets
- Undo/Redo, Zoom, URL sharing

---

## 🚀 Ejemplo standalone (para testing)

Accede a: `/avatar-picker-demo`

Esta página muestra el AvatarPicker en acción con todos sus métodos.

---

## 📝 TODO para producción

1. **Implementar endpoint de upload:**
   ```ts
   // app/api/upload/avatar/route.ts
   export async function POST(req: NextRequest) {
     const formData = await req.formData();
     const file = formData.get('file') as File;

     // Subir a S3, Cloudinary, o local storage
     const url = await uploadToStorage(file);

     return NextResponse.json({ url });
   }
   ```

2. **Guardar avatar en DB al seleccionar:**
   ```ts
   await prisma.agent.update({
     where: { id: agentId },
     data: { avatar: avatarUrl },
   });
   ```

3. **Optimizar imágenes:**
   - Comprimir imágenes antes de guardar
   - Generar thumbnails para listados
   - Usar WebP cuando sea posible

---

## 🎨 Personalización

### Restringir métodos disponibles

```tsx
// Solo permitir IA y Upload (sin editor manual)
<AvatarPicker
  {...props}
  allowedMethods={['ai', 'upload']}
/>
```

### Cambiar límites de upload

```tsx
// En ImageUploader.tsx, puedes modificar:
maxSizeMB={10}  // Default: 5MB
acceptedFormats={['image/png', 'image/jpeg']}
```

---

## 🐛 Troubleshooting

### "Error al generar imagen"
- Verifica que AI Horde esté configurado en `.env`
- Revisa que `AI_HORDE_API_KEY` esté presente
- El servicio puede tardar 30s - 5min según la carga

### "Error al subir imagen"
- Implementa el endpoint `/api/upload/avatar`
- Actualmente usa base64 (temporal)

### "El editor manual no carga assets"
- Verifica que los assets estén en `public/worlds/Assets/Sutemo - Female`
- Los paths son case-sensitive

---

## 📚 Referencias

- **Editor de personajes:** `/docs/CHARACTER-EDITOR.md`
- **AI Horde:** `lib/visual-system/ai-horde-client.ts`
- **Sistema de avatares:** `lib/multimedia/reference-generator.ts`
