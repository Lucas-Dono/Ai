package com.blaniel.minecraft.ai;

import com.blaniel.minecraft.BlanielMod;
import com.blaniel.minecraft.entity.BlanielVillagerEntity;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import net.minecraft.entity.player.PlayerEntity;
import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.text.Text;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Manejador de diálogos ambientales
 *
 * Activa diálogos entre NPCs cuando un jugador se acerca a un grupo
 */
public class AmbientDialogueHandler {

    private static final Gson GSON = new Gson();
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
        .version(HttpClient.Version.HTTP_1_1)
        .connectTimeout(Duration.ofSeconds(10))
        .build();

    // Cooldown para evitar spam de diálogos
    private static final Map<UUID, Long> groupDialogueCooldown = new ConcurrentHashMap<>();
    private static final long DIALOGUE_COOLDOWN_MS = 30000; // 30 segundos

    /**
     * Activar diálogo ambiental para un grupo
     *
     * @param groupId ID del grupo
     * @param members Miembros del grupo
     * @param player Jugador que activó el diálogo
     */
    public static void triggerAmbientDialogue(
        UUID groupId,
        Set<Integer> memberIds,
        PlayerEntity player,
        net.minecraft.server.world.ServerWorld world
    ) {
        // Verificar cooldown
        Long lastDialogue = groupDialogueCooldown.get(groupId);
        if (lastDialogue != null && System.currentTimeMillis() - lastDialogue < DIALOGUE_COOLDOWN_MS) {
            return; // Cooldown activo
        }

        // Obtener entidades del grupo
        List<BlanielVillagerEntity> members = new ArrayList<>();
        for (Integer memberId : memberIds) {
            var entity = world.getEntityById(memberId);
            if (entity instanceof BlanielVillagerEntity) {
                members.add((BlanielVillagerEntity) entity);
            }
        }

        if (members.size() < 2) {
            return; // No hay suficientes NPCs
        }

        // Verificar si hay historial importante (simplificado: si algún NPC tiene lastInteractedPlayerId)
        boolean hasImportantHistory = members.stream()
            .anyMatch(npc -> npc.getLastInteractedPlayerId() != null);

        BlanielMod.LOGGER.info("Activando diálogo ambiental para grupo {} ({} NPCs, historial: {})",
            groupId, members.size(), hasImportantHistory);

        // Solicitar diálogo al backend (asíncrono)
        requestDialogueFromBackend(groupId, members, player, hasImportantHistory);

        // Actualizar cooldown
        groupDialogueCooldown.put(groupId, System.currentTimeMillis());
    }

    /**
     * Solicitar diálogo al backend
     */
    private static void requestDialogueFromBackend(
        UUID groupId,
        List<BlanielVillagerEntity> members,
        PlayerEntity player,
        boolean hasImportantHistory
    ) {
        try {
            // Construir request body
            JsonObject body = new JsonObject();

            JsonArray agentIds = new JsonArray();
            for (BlanielVillagerEntity npc : members) {
                agentIds.add(npc.getBlanielAgentId());
            }
            body.add("agentIds", agentIds);

            body.addProperty("location", player.getWorld().getRegistryKey().getValue().toString());
            body.addProperty("hasImportantHistory", hasImportantHistory);

            String apiUrl = BlanielMod.CONFIG.getApiUrl() + "/api/v1/minecraft/ambient-dialogue";
            String jwtToken = BlanielMod.CONFIG.getJwtToken();

            BlanielMod.LOGGER.info("[Ambient Dialogue] Solicitando diálogo a: {}", apiUrl);

            // Construir request
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .header("Authorization", "Bearer " + jwtToken)
                .header("User-Agent", "BlanielMinecraft/0.1.0")
                .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                .timeout(Duration.ofSeconds(30))
                .build();

            // Ejecutar request (async)
            HTTP_CLIENT.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenAccept(response -> {
                    if (response.statusCode() == 200) {
                        processDialogueResponse(response.body(), members, player);
                    } else {
                        BlanielMod.LOGGER.error("[Ambient Dialogue] Error: HTTP {}", response.statusCode());
                    }
                })
                .exceptionally(ex -> {
                    BlanielMod.LOGGER.error("[Ambient Dialogue] Error de conexión: {}", ex.getMessage());
                    return null;
                });

        } catch (Exception e) {
            BlanielMod.LOGGER.error("[Ambient Dialogue] Error al solicitar diálogo: {}", e.getMessage());
        }
    }

    /**
     * Procesar respuesta con diálogos
     */
    private static void processDialogueResponse(
        String responseBody,
        List<BlanielVillagerEntity> members,
        PlayerEntity player
    ) {
        try {
            JsonObject response = GSON.fromJson(responseBody, JsonObject.class);
            JsonArray dialogues = response.getAsJsonArray("dialogues");

            if (dialogues == null || dialogues.size() == 0) {
                BlanielMod.LOGGER.warn("[Ambient Dialogue] No hay diálogos en la respuesta");
                return;
            }

            // Reproducir diálogos con delay entre ellos
            for (int i = 0; i < dialogues.size(); i++) {
                JsonObject dialogue = dialogues.get(i).getAsJsonObject();
                String agentId = dialogue.get("agentId").getAsString();
                String agentName = dialogue.get("agentName").getAsString();
                String message = dialogue.get("message").getAsString();

                // Buscar la entidad correspondiente
                BlanielVillagerEntity speaker = members.stream()
                    .filter(npc -> npc.getBlanielAgentId().equals(agentId))
                    .findFirst()
                    .orElse(null);

                if (speaker != null) {
                    // Delay progresivo (0s, 3s, 6s, ...)
                    int delay = i * 60; // 3 segundos en ticks (20 ticks/s * 3)

                    // Programar reproducción del diálogo
                    scheduleDialogueDisplay(speaker, message, delay, player);
                }
            }

            BlanielMod.LOGGER.info("[Ambient Dialogue] {} diálogos programados", dialogues.size());

        } catch (Exception e) {
            BlanielMod.LOGGER.error("[Ambient Dialogue] Error al procesar respuesta: {}", e.getMessage());
        }
    }

    /**
     * Programar display de diálogo con delay
     */
    private static void scheduleDialogueDisplay(
        BlanielVillagerEntity speaker,
        String message,
        int delayTicks,
        PlayerEntity player
    ) {
        // Usar el scheduler del servidor
        speaker.getWorld().getServer().execute(() -> {
            try {
                Thread.sleep(delayTicks * 50); // Convertir ticks a ms

                // Mostrar chat bubble sobre el NPC
                speaker.displayChatBubble(message);

                // Enviar al chat del jugador
                if (player instanceof ServerPlayerEntity) {
                    player.sendMessage(
                        Text.literal("§7[" + speaker.getBlanielAgentName() + "]: §f" + message),
                        false
                    );
                }

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
    }
}
