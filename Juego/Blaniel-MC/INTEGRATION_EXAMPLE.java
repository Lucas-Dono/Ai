package com.blaniel.minecraft.integration;

import com.google.gson.*;
import net.minecraft.client.MinecraftClient;
import net.minecraft.entity.player.PlayerEntity;
import net.minecraft.text.Text;
import net.minecraft.util.math.Box;
import com.blaniel.minecraft.entity.BlanielVillagerEntity;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Ejemplo de integración con el sistema de chat grupal de Blaniel
 *
 * Este archivo muestra cómo enviar mensajes desde Minecraft al backend
 * y procesar las respuestas de los agentes IA.
 *
 * Uso:
 * 1. El usuario configura su API key en blaniel-mc.properties
 * 2. Cuando envía un mensaje, se detectan agentes cercanos
 * 3. Se envía el mensaje al backend con contexto espacial
 * 4. Las respuestas se muestran como chat bubbles en las entidades
 */
public class BlanielChatIntegration {

    private static final String API_URL = "https://blaniel.com/api/v1/minecraft/message";
    private static final HttpClient HTTP_CLIENT = HttpClient.newHttpClient();
    private static final Gson GSON = new Gson();

    /**
     * Envía un mensaje de chat al backend y procesa las respuestas
     *
     * @param player El jugador que envía el mensaje
     * @param message El contenido del mensaje
     * @param apiKey API key del usuario
     */
    public static CompletableFuture<Void> sendChatMessage(
            PlayerEntity player,
            String message,
            String apiKey
    ) {
        return CompletableFuture.runAsync(() -> {
            try {
                // 1. Preparar datos del jugador
                JsonObject playerData = buildPlayerData(player);

                // 2. Detectar agentes cercanos (radio de 16 bloques)
                JsonArray nearbyAgents = findNearbyAgents(player, 16.0);

                if (nearbyAgents.size() == 0) {
                    player.sendMessage(
                        Text.literal("§cNo hay agentes IA cercanos para responder"),
                        false
                    );
                    return;
                }

                // 3. Construir request body
                JsonObject requestBody = new JsonObject();
                requestBody.addProperty("content", message);
                requestBody.add("player", playerData);
                requestBody.add("nearbyAgents", nearbyAgents);

                // 4. Enviar request HTTP
                HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .header("Content-Type", "application/json")
                    .header("X-API-Key", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                    .build();

                HttpResponse<String> response = HTTP_CLIENT.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
                );

                // 5. Procesar respuesta
                if (response.statusCode() == 200) {
                    processAgentResponses(player, response.body());
                } else {
                    handleError(player, response.statusCode(), response.body());
                }

            } catch (Exception e) {
                player.sendMessage(
                    Text.literal("§cError al comunicarse con el servidor: " + e.getMessage()),
                    false
                );
                e.printStackTrace();
            }
        });
    }

    /**
     * Construye datos del jugador en formato JSON
     */
    private static JsonObject buildPlayerData(PlayerEntity player) {
        JsonObject playerObj = new JsonObject();
        playerObj.addProperty("uuid", player.getUuidAsString());
        playerObj.addProperty("name", player.getName().getString());

        JsonObject position = new JsonObject();
        position.addProperty("x", player.getX());
        position.addProperty("y", player.getY());
        position.addProperty("z", player.getZ());
        position.addProperty("yaw", player.getYaw());
        position.addProperty("pitch", player.getPitch());
        position.addProperty("dimensionId", player.getWorld().getRegistryKey().getValue().toString());

        playerObj.add("position", position);

        return playerObj;
    }

    /**
     * Encuentra agentes BlanielVillager cercanos al jugador
     */
    private static JsonArray findNearbyAgents(PlayerEntity player, double radius) {
        JsonArray agents = new JsonArray();

        // Crear bounding box alrededor del jugador
        Box searchBox = new Box(
            player.getX() - radius,
            player.getY() - radius,
            player.getZ() - radius,
            player.getX() + radius,
            player.getY() + radius,
            player.getZ() + radius
        );

        // Buscar entidades BlanielVillager en el área
        List<BlanielVillagerEntity> nearbyVillagers = player.getWorld()
            .getEntitiesByClass(
                BlanielVillagerEntity.class,
                searchBox,
                entity -> entity.isAlive() && entity.distanceTo(player) <= radius
            );

        // Convertir a JSON
        for (BlanielVillagerEntity villager : nearbyVillagers) {
            JsonObject agentObj = new JsonObject();
            agentObj.addProperty("agentId", villager.getAgentId());
            agentObj.addProperty("entityId", villager.getId());
            agentObj.addProperty("name", villager.getName().getString());

            JsonObject position = new JsonObject();
            position.addProperty("x", villager.getX());
            position.addProperty("y", villager.getY());
            position.addProperty("z", villager.getZ());
            agentObj.add("position", position);

            agentObj.addProperty("isActive", true);

            agents.add(agentObj);
        }

        return agents;
    }

    /**
     * Procesa las respuestas de los agentes IA
     */
    private static void processAgentResponses(PlayerEntity player, String responseBody) {
        try {
            JsonObject result = JsonParser.parseString(responseBody).getAsJsonObject();

            // Mostrar contexto de proximidad (debug)
            JsonObject proximityContext = result.getAsJsonObject("proximityContext");
            boolean isGroupConversation = proximityContext.get("isGroupConversation").getAsBoolean();

            player.sendMessage(
                Text.literal(
                    isGroupConversation
                        ? "§7[Conversación Grupal]"
                        : "§7[Conversación Individual]"
                ),
                true // Actionbar
            );

            // Procesar respuestas de cada agente
            JsonArray agentResponses = result.getAsJsonArray("agentResponses");

            for (JsonElement elem : agentResponses) {
                JsonObject agentResp = elem.getAsJsonObject();

                String agentId = agentResp.get("agentId").getAsString();
                String content = agentResp.get("content").getAsString();
                String animationHint = agentResp.has("animationHint")
                    ? agentResp.get("animationHint").getAsString()
                    : "talking";

                // Encontrar la entidad correspondiente
                BlanielVillagerEntity entity = findEntityByAgentId(player, agentId);

                if (entity != null) {
                    // Mostrar chat bubble
                    displayChatBubble(entity, content);

                    // Aplicar animación
                    applyAnimation(entity, animationHint);
                } else {
                    // Si no encontramos la entidad, mostrar en chat normal
                    String agentName = agentResp.get("agentName").getAsString();
                    player.sendMessage(
                        Text.literal("§b" + agentName + ": §f" + content),
                        false
                    );
                }
            }

            // Mostrar metadata (debug)
            JsonObject metadata = result.getAsJsonObject("metadata");
            int responseTime = metadata.get("responseTime").getAsInt();
            int agentsResponded = metadata.get("agentsResponded").getAsInt();

            player.sendMessage(
                Text.literal(
                    String.format(
                        "§7[%d agente(s) respondieron en %dms]",
                        agentsResponded,
                        responseTime
                    )
                ),
                true // Actionbar
            );

        } catch (Exception e) {
            player.sendMessage(
                Text.literal("§cError al procesar respuestas: " + e.getMessage()),
                false
            );
            e.printStackTrace();
        }
    }

    /**
     * Encuentra una entidad BlanielVillager por su agentId
     */
    private static BlanielVillagerEntity findEntityByAgentId(PlayerEntity player, String agentId) {
        List<BlanielVillagerEntity> entities = player.getWorld()
            .getEntitiesByClass(
                BlanielVillagerEntity.class,
                new Box(
                    player.getX() - 32,
                    player.getY() - 32,
                    player.getZ() - 32,
                    player.getX() + 32,
                    player.getY() + 32,
                    player.getZ() + 32
                ),
                entity -> agentId.equals(entity.getAgentId())
            );

        return entities.isEmpty() ? null : entities.get(0);
    }

    /**
     * Muestra un chat bubble sobre la entidad
     */
    private static void displayChatBubble(BlanielVillagerEntity entity, String message) {
        // Opción 1: Usar el nombre de la entidad (simple)
        entity.setCustomName(Text.literal("§f" + message));
        entity.setCustomNameVisible(true);

        // Programar ocultar después de 5 segundos
        MinecraftClient.getInstance().execute(() -> {
            try {
                Thread.sleep(5000);
                entity.setCustomNameVisible(false);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });

        // Opción 2: Si tienes un mod de chat bubbles, úsalo aquí
        // ChatBubbleMod.display(entity, message, 5);
    }

    /**
     * Aplica animación a la entidad basada en el hint
     */
    private static void applyAnimation(BlanielVillagerEntity entity, String hint) {
        switch (hint) {
            case "waving":
                // Hacer que el brazo se mueva
                entity.swingHand(entity.getActiveHand());
                break;

            case "happy":
                // Saltar
                entity.jump();
                break;

            case "thinking":
                // Mirar al jugador y inclinar cabeza
                // (requiere acceso a campos internos)
                break;

            case "talking":
                // Animación de boca (requiere texturas custom)
                break;

            case "surprised":
                // Paso atrás
                entity.addVelocity(0, 0.1, 0);
                break;

            default:
                // Animación por defecto: idle
                break;
        }
    }

    /**
     * Maneja errores de la API
     */
    private static void handleError(PlayerEntity player, int statusCode, String body) {
        try {
            JsonObject error = JsonParser.parseString(body).getAsJsonObject();
            String errorMessage = error.has("error")
                ? error.get("error").getAsString()
                : "Error desconocido";
            String errorCode = error.has("code")
                ? error.get("code").getAsString()
                : "UNKNOWN";

            String displayMessage = switch (statusCode) {
                case 401 -> "§cError de autenticación. Verifica tu API key en blaniel-mc.properties";
                case 429 -> "§cLímite de tasa excedido. Espera un momento antes de enviar otro mensaje.";
                case 404 -> "§cNo se encontraron agentes. ¿Los has creado en blaniel.com?";
                default -> String.format("§cError %d: %s (Código: %s)", statusCode, errorMessage, errorCode);
            };

            player.sendMessage(Text.literal(displayMessage), false);

        } catch (Exception e) {
            player.sendMessage(
                Text.literal(String.format("§cError HTTP %d: %s", statusCode, body)),
                false
            );
        }
    }

    /**
     * Carga la API key desde el archivo de configuración
     */
    public static String loadApiKey() {
        // TODO: Implementar lectura desde blaniel-mc.properties
        // Por ahora, retorna placeholder
        return "API_KEY_PLACEHOLDER";
    }
}
