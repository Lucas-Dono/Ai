package com.blaniel.minecraft.ai;

import com.blaniel.minecraft.BlanielMod;
import com.blaniel.minecraft.entity.BlanielVillagerEntity;
import net.minecraft.entity.player.PlayerEntity;
import net.minecraft.server.world.ServerWorld;
import net.minecraft.util.math.Box;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Sistema de agrupación social de NPCs
 *
 * Gestiona la formación dinámica de grupos sociales entre NPCs,
 * con afinidad basada en interacciones pasadas.
 */
public class SocialGroupingSystem {

    // Grupos activos: groupId -> conjunto de entity IDs
    private final Map<UUID, Set<Integer>> activeGroups = new ConcurrentHashMap<>();

    // Posiciones de reunión: groupId -> posición central
    private final Map<UUID, GroupMeetingPoint> groupMeetingPoints = new ConcurrentHashMap<>();

    // Afinidad entre NPCs: "npcA_npcB" -> score (0.0-1.0)
    private final Map<String, Float> npcAffinity = new ConcurrentHashMap<>();

    // Historial de grupos: hash de combinación de NPCs -> count
    private final Map<String, Integer> groupHistory = new ConcurrentHashMap<>();

    // Cooldown para evitar reagrupación inmediata
    private final Map<Integer, Long> disbandCooldown = new ConcurrentHashMap<>();

    // Constantes
    private static final double PROXIMITY_RADIUS = 8.0; // Bloques para detectar NPCs cercanos
    private static final double GROUP_FORMATION_RADIUS = 5.0; // Radio del grupo formado
    private static final int MIN_GROUP_SIZE = 2;
    private static final int MAX_GROUP_SIZE = 8;
    private static final long COOLDOWN_MS = 30000; // 30 segundos antes de poder reagruparse
    private static final float BASE_GROUP_PROBABILITY = 0.7f; // 70% probabilidad base

    // Singleton
    private static SocialGroupingSystem instance;

    public static SocialGroupingSystem getInstance() {
        if (instance == null) {
            instance = new SocialGroupingSystem();
        }
        return instance;
    }

    /**
     * Evaluar formación de grupos en el mundo
     * Llamar cada 5 segundos desde el servidor
     */
    public void evaluateGroupFormation(ServerWorld world) {
        List<BlanielVillagerEntity> allNPCs = world.getEntitiesByClass(
            BlanielVillagerEntity.class,
            new Box(-30000000, -64, -30000000, 30000000, 320, 30000000), // Todo el mundo
            npc -> npc.isAlive() && !npc.isInConversation()
        );

        if (allNPCs.size() < MIN_GROUP_SIZE) {
            return; // No hay suficientes NPCs
        }

        // Agrupar NPCs por proximidad
        Set<BlanielVillagerEntity> processed = new HashSet<>();

        for (BlanielVillagerEntity npc : allNPCs) {
            if (processed.contains(npc)) {
                continue;
            }

            // Verificar cooldown
            Long lastDisband = disbandCooldown.get(npc.getId());
            if (lastDisband != null && System.currentTimeMillis() - lastDisband < COOLDOWN_MS) {
                continue;
            }

            // Buscar NPCs cercanos
            List<BlanielVillagerEntity> nearby = findNearbyNPCs(npc, allNPCs, processed);

            if (nearby.size() >= MIN_GROUP_SIZE - 1) { // -1 porque no se incluye a sí mismo
                // Decidir si formar grupo
                float probability = calculateGroupProbability(npc, nearby);

                if (world.random.nextFloat() < probability) {
                    // Formar grupo
                    nearby.add(npc);
                    formGroup(world, nearby);
                    processed.addAll(nearby);

                    BlanielMod.LOGGER.info("Grupo formado: {} NPCs (probabilidad: {}%)",
                        nearby.size(), (int)(probability * 100));
                }
            }
        }
    }

    /**
     * Buscar NPCs cercanos no procesados
     */
    private List<BlanielVillagerEntity> findNearbyNPCs(
        BlanielVillagerEntity origin,
        List<BlanielVillagerEntity> allNPCs,
        Set<BlanielVillagerEntity> processed
    ) {
        List<BlanielVillagerEntity> nearby = new ArrayList<>();

        for (BlanielVillagerEntity npc : allNPCs) {
            if (npc == origin || processed.contains(npc)) {
                continue;
            }

            double distance = origin.distanceTo(npc);
            if (distance <= PROXIMITY_RADIUS) {
                nearby.add(npc);
            }
        }

        // Ordenar por afinidad (mayor primero)
        nearby.sort((a, b) -> Float.compare(
            getAffinity(origin.getId(), b.getId()),
            getAffinity(origin.getId(), a.getId())
        ));

        // Limitar tamaño del grupo (aleatorio entre MIN y MAX)
        int targetSize = MIN_GROUP_SIZE + origin.getWorld().random.nextInt(MAX_GROUP_SIZE - MIN_GROUP_SIZE + 1);
        if (nearby.size() > targetSize - 1) {
            nearby = nearby.subList(0, targetSize - 1);
        }

        return nearby;
    }

    /**
     * Calcular probabilidad de formación de grupo
     * Basado en afinidad y historial
     */
    private float calculateGroupProbability(BlanielVillagerEntity origin, List<BlanielVillagerEntity> nearby) {
        float probability = BASE_GROUP_PROBABILITY;

        // Bonus por afinidad alta
        float avgAffinity = 0;
        for (BlanielVillagerEntity npc : nearby) {
            avgAffinity += getAffinity(origin.getId(), npc.getId());
        }
        avgAffinity /= nearby.size();

        // Afinidad aumenta probabilidad hasta 95%
        probability += avgAffinity * 0.25f;

        // Bonus si este grupo ya se formó antes
        String groupHash = getGroupHash(origin, nearby);
        Integer pastFormations = groupHistory.get(groupHash);
        if (pastFormations != null && pastFormations > 0) {
            probability += 0.1f; // +10% si ya conversaron antes
        }

        return Math.min(probability, 0.95f); // Máximo 95%
    }

    /**
     * Formar un grupo social
     */
    private void formGroup(ServerWorld world, List<BlanielVillagerEntity> members) {
        UUID groupId = UUID.randomUUID();
        Set<Integer> memberIds = new HashSet<>();

        // Calcular punto de reunión (centro del grupo)
        double centerX = 0, centerY = 0, centerZ = 0;
        for (BlanielVillagerEntity npc : members) {
            centerX += npc.getX();
            centerY += npc.getY();
            centerZ += npc.getZ();
            memberIds.add(npc.getId());
        }
        centerX /= members.size();
        centerY /= members.size();
        centerZ /= members.size();

        // Registrar grupo
        activeGroups.put(groupId, memberIds);
        groupMeetingPoints.put(groupId, new GroupMeetingPoint(centerX, centerY, centerZ, GROUP_FORMATION_RADIUS));

        // Incrementar historial
        String groupHash = getGroupHash(members);
        groupHistory.merge(groupHash, 1, Integer::sum);

        // Incrementar afinidad entre todos los miembros
        for (int i = 0; i < members.size(); i++) {
            for (int j = i + 1; j < members.size(); j++) {
                increaseAffinity(members.get(i).getId(), members.get(j).getId(), 0.1f);
            }
        }

        BlanielMod.LOGGER.info("Grupo {} formado en ({}, {}, {}) con {} miembros",
            groupId, (int)centerX, (int)centerY, (int)centerZ, members.size());
    }

    /**
     * Disolver un grupo
     */
    public void disbandGroup(UUID groupId, ServerWorld world) {
        Set<Integer> memberIds = activeGroups.remove(groupId);
        groupMeetingPoints.remove(groupId);

        if (memberIds != null) {
            // Aplicar cooldown a todos los miembros
            long now = System.currentTimeMillis();
            for (Integer memberId : memberIds) {
                disbandCooldown.put(memberId, now);
            }

            BlanielMod.LOGGER.info("Grupo {} disuelto ({} miembros)", groupId, memberIds.size());
        }
    }

    /**
     * Obtener o inicializar afinidad entre dos NPCs
     */
    private float getAffinity(int npcA, int npcB) {
        String key = getAffinityKey(npcA, npcB);
        return npcAffinity.getOrDefault(key, 0.0f);
    }

    /**
     * Aumentar afinidad entre dos NPCs
     */
    private void increaseAffinity(int npcA, int npcB, float amount) {
        String key = getAffinityKey(npcA, npcB);
        float current = npcAffinity.getOrDefault(key, 0.0f);
        npcAffinity.put(key, Math.min(current + amount, 1.0f)); // Máximo 1.0
    }

    /**
     * Generar key de afinidad (ordenado para que A-B = B-A)
     */
    private String getAffinityKey(int npcA, int npcB) {
        int min = Math.min(npcA, npcB);
        int max = Math.max(npcA, npcB);
        return min + "_" + max;
    }

    /**
     * Generar hash de grupo para historial
     */
    private String getGroupHash(BlanielVillagerEntity origin, List<BlanielVillagerEntity> nearby) {
        List<Integer> ids = new ArrayList<>();
        ids.add(origin.getId());
        nearby.forEach(npc -> ids.add(npc.getId()));
        Collections.sort(ids);
        return ids.toString();
    }

    private String getGroupHash(List<BlanielVillagerEntity> members) {
        List<Integer> ids = new ArrayList<>();
        members.forEach(npc -> ids.add(npc.getId()));
        Collections.sort(ids);
        return ids.toString();
    }

    /**
     * Verificar si un jugador está cerca de algún grupo
     */
    public UUID findNearbyGroup(PlayerEntity player) {
        for (Map.Entry<UUID, GroupMeetingPoint> entry : groupMeetingPoints.entrySet()) {
            GroupMeetingPoint point = entry.getValue();
            double distance = Math.sqrt(
                Math.pow(player.getX() - point.x, 2) +
                Math.pow(player.getY() - point.y, 2) +
                Math.pow(player.getZ() - point.z, 2)
            );

            if (distance <= point.radius + 3.0) { // +3 bloques de margen
                return entry.getKey();
            }
        }
        return null;
    }

    /**
     * Obtener miembros de un grupo
     */
    public Set<Integer> getGroupMembers(UUID groupId) {
        return activeGroups.get(groupId);
    }

    /**
     * Punto de reunión de un grupo
     */
    private static class GroupMeetingPoint {
        final double x, y, z;
        final double radius;

        GroupMeetingPoint(double x, double y, double z, double radius) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.radius = radius;
        }
    }
}
