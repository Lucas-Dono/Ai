// Script para eliminar modelos de World del schema de Prisma
const fs = require('fs');

const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf-8');

// Modelos a eliminar con sus rangos aproximados
const modelsToRemove = [
  { name: 'World', start: 'model World {', end: '}' },
  { name: 'WorldStatus', start: 'enum WorldStatus {', end: '}' },
  { name: 'WorldAgent', start: 'model WorldAgent {', end: '}' },
  { name: 'WorldInteraction', start: 'model WorldInteraction {', end: '}' },
  { name: 'WorldSimulationState', start: 'model WorldSimulationState {', end: '}' },
  { name: 'AgentToAgentRelation', start: 'model AgentToAgentRelation {', end: '}' },
  { name: 'StoryEvent', start: 'model StoryEvent {', end: '}' },
  { name: 'CharacterArc', start: 'model CharacterArc {', end: '}' },
];

// Remover cada modelo
for (const model of modelsToRemove) {
  const regex = new RegExp(`${model.start}[\\s\\S]*?(?=\\n(?:model |enum |\\/{2,}))`,'gm');
  schema = schema.replace(regex, (match) => {
    console.log(`Eliminando ${model.name}: ${match.substring(0, 100)}...`);
    return '';
  });
}

// Remover comentarios del sistema de mundos
schema = schema.replace(/\/\/ ============================================\n\/\/ SISTEMA DE MUNDOS INTERACTIVOS\n\/\/ ============================================\n/g, '');

// Remover relación worlds del User
schema = schema.replace(/\s*worlds\s+World\[\]\s*\n/g, '\n');

// Remover relaciones del Agent
schema = schema.replace(/\s*worldAgents\s+WorldAgent\[\]\s*\n/g, '\n');
schema = schema.replace(/\s*worldInteractions\s+WorldInteraction\[\]\s+@relation\("SpeakerInteractions"\)\s*\n/g, '\n');

// Actualizar CrossContextMemory
schema = schema.replace(
  /sourceType\s+String\s+\/\/\s+"individual_chat",\s+"world_interaction",\s+"group_interaction",\s+"proactive"/g,
  'sourceType    String // "individual_chat", "group_interaction", "proactive"'
);
schema = schema.replace(/\s*sourceWorldId\s+String\?\s+\/\/[^\n]*\n/g, '\n');
schema = schema.replace(/\s*@@index\(\[sourceWorldId\]\)\s*\n/g, '\n');

// Actualizar TemporalContext
schema = schema.replace(/\s*lastWorldInteractionAt\s+DateTime\?\s*\n/g, '  lastGroupInteractionAt DateTime?\n');
schema = schema.replace(/\s*lastWorldId\s+String\?[^\n]*\n/g, '  lastGroupId String? // Último grupo donde interactuó\n');
schema = schema.replace(/\s*worldInteractionCount\s+Int[^\n]*\n/g, '  groupInteractionCount Int @default(0)\n');
schema = schema.replace(/\s*@@index\(\[lastWorldId\]\)\s*\n/g, '  @@index([lastGroupId])\n');

// Limpiar líneas vacías múltiples
schema = schema.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(schemaPath, schema);
console.log('Schema actualizado correctamente');
