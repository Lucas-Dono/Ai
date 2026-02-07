# Plan de Implementación: Blaniel x Minecraft Integration

## 🎯 Objetivo MVP (Validación en Una Noche)

Crear un mod de Minecraft basado en MCA-Reborn que conecte los aldeanos con los agentes de IA de Blaniel vía API.

**Alcance mínimo viable:**
- ✅ 1 aldeano representa 1 agente de Blaniel
- ✅ Click derecho → abre chat
- ✅ Chat envía mensaje a API → recibe respuesta
- ✅ Aldeano muestra emoción actual (animación básica)
- ✅ Movimiento: sigue lógica de MCA (NO LLM todavía)

**NO incluir en MVP:**
- ❌ Múltiples agentes simultáneos
- ❌ Decisiones de movimiento con LLM
- ❌ Sincronización completa de estado
- ❌ Eventos episódicos
- ❌ Mapas de ciudades

---

## 📁 Estructura del Proyecto

```
Juego/
├── MCA-Reborn/                    (Código original - NO modificar)
├── Blaniel-MC/                    (Nuestro fork)
│   ├── src/main/java/
│   │   └── com/blaniel/minecraft/
│   │       ├── BlanielMod.java           (Main mod class)
│   │       ├── config/
│   │       │   └── BlanielConfig.java    (API URL, auth)
│   │       ├── network/
│   │       │   ├── BlanielAPI.java       (HTTP client)
│   │       │   └── BlanielMessages.java  (Packets)
│   │       ├── entity/
│   │       │   └── BlanielVillager.java  (Extended MCAVillager)
│   │       └── client/
│   │           └── BlanielChatScreen.java (Modified chat UI)
│   ├── src/main/resources/
│   │   ├── META-INF/
│   │   │   └── mods.toml                 (Mod metadata)
│   │   └── blaniel.mixins.json           (Mixins config)
│   └── build.gradle
└── PLAN_IMPLEMENTACION.md
```

---

## 🔧 Paso 1: Setup del Proyecto (30 minutos)

### 1.1 Copiar MCA-Reborn como base

```bash
cd /mnt/SSD/Proyectos/AI/creador-inteligencias/Juego
cp -r MCA-Reborn Blaniel-MC
cd Blaniel-MC
```

### 1.2 Modificar `build.gradle`

**Cambiar:**
- `group = 'com.blaniel.minecraft'`
- `archivesBaseName = 'blaniel-mc'`
- `version = '0.1.0-alpha'`

**Agregar dependencia HTTP:**
```gradle
dependencies {
    // Dependencias existentes de MCA...

    // HTTP Client para API
    implementation 'com.squareup.okhttp3:okhttp:4.12.0'

    // JSON parsing
    implementation 'com.google.code.gson:gson:2.10.1'
}
```

### 1.3 Modificar `mods.toml`

```toml
modId="blaniel_mc"
version="0.1.0-alpha"
displayName="Blaniel Minecraft Integration"
description='''
Conecta tus agentes de IA de Blaniel con Minecraft.
Habla con tus personajes en un mundo 3D.
'''
authors="Tu Nombre"
credits="Based on MCA-Reborn by Reyzerbit"
```

### 1.4 Test inicial

```bash
./gradlew build
```

Si compila sin errores → **Paso 1 completado ✅**

---

## 🔧 Paso 2: Configuración y API Client (60 minutos)

### 2.1 Crear `BlanielConfig.java`

```java
package com.blaniel.minecraft.config;

import net.minecraftforge.common.ForgeConfigSpec;

public class BlanielConfig {
    public static final ForgeConfigSpec.Builder BUILDER = new ForgeConfigSpec.Builder();
    public static final ForgeConfigSpec SPEC;

    // API Configuration
    public static final ForgeConfigSpec.ConfigValue<String> API_URL;
    public static final ForgeConfigSpec.ConfigValue<String> API_KEY;
    public static final ForgeConfigSpec.ConfigValue<Boolean> ENABLE_API;

    static {
        BUILDER.push("Blaniel API Configuration");

        API_URL = BUILDER
            .comment("URL de la API de Blaniel (default: http://localhost:3000)")
            .define("apiUrl", "http://localhost:3000");

        API_KEY = BUILDER
            .comment("API Key de tu cuenta de Blaniel (obtener en /configuracion)")
            .define("apiKey", "");

        ENABLE_API = BUILDER
            .comment("Habilitar conexión a API (false para testing offline)")
            .define("enableApi", true);

        BUILDER.pop();
        SPEC = BUILDER.build();
    }
}
```

### 2.2 Crear `BlanielAPI.java` (HTTP Client)

```java
package com.blaniel.minecraft.network;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import okhttp3.*;
import java.io.IOException;
import java.util.concurrent.CompletableFuture;

public class BlanielAPI {
    private static final Gson GSON = new Gson();
    private static final OkHttpClient CLIENT = new OkHttpClient();

    private final String baseUrl;
    private final String apiKey;

    public BlanielAPI(String baseUrl, String apiKey) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    /**
     * Envía mensaje al agente y obtiene respuesta
     * Endpoint: POST /api/v1/minecraft/agents/{id}/chat
     */
    public CompletableFuture<ChatResponse> sendMessage(String agentId, String message, MinecraftContext context) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Build request body
                JsonObject body = new JsonObject();
                body.addProperty("message", message);

                JsonObject contextObj = new JsonObject();
                if (context != null) {
                    contextObj.addProperty("activity", context.activity);
                    contextObj.addProperty("timeOfDay", context.timeOfDay);
                    contextObj.addProperty("weather", context.weather);

                    if (context.position != null) {
                        JsonObject pos = new JsonObject();
                        pos.addProperty("x", context.position.x);
                        pos.addProperty("y", context.position.y);
                        pos.addProperty("z", context.position.z);
                        pos.addProperty("world", context.position.world);
                        contextObj.add("position", pos);
                    }
                }
                body.add("context", contextObj);

                // Make HTTP request
                RequestBody requestBody = RequestBody.create(
                    body.toString(),
                    MediaType.parse("application/json")
                );

                Request request = new Request.Builder()
                    .url(baseUrl + "/api/v1/minecraft/agents/" + agentId + "/chat")
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .post(requestBody)
                    .build();

                try (Response response = CLIENT.newCall(request).execute()) {
                    if (!response.isSuccessful()) {
                        throw new IOException("API request failed: " + response.code());
                    }

                    String responseBody = response.body().string();
                    return GSON.fromJson(responseBody, ChatResponse.class);
                }

            } catch (Exception e) {
                System.err.println("[Blaniel API] Error: " + e.getMessage());
                e.printStackTrace();

                // Fallback response
                ChatResponse fallback = new ChatResponse();
                fallback.response = "Lo siento, no puedo conectarme al servidor ahora.";
                fallback.emotions = new EmotionData();
                fallback.emotions.primary = "neutral";
                fallback.emotions.intensity = 0.5;
                fallback.emotions.animation = "idle";
                return fallback;
            }
        });
    }

    /**
     * Obtiene lista de agentes disponibles
     * Endpoint: GET /api/v1/minecraft/agents
     */
    public CompletableFuture<AgentListResponse> getAvailableAgents() {
        return CompletableFuture.supplyAsync(() -> {
            try {
                Request request = new Request.Builder()
                    .url(baseUrl + "/api/v1/minecraft/agents")
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .get()
                    .build();

                try (Response response = CLIENT.newCall(request).execute()) {
                    if (!response.isSuccessful()) {
                        throw new IOException("API request failed: " + response.code());
                    }

                    String responseBody = response.body().string();
                    return GSON.fromJson(responseBody, AgentListResponse.class);
                }

            } catch (Exception e) {
                System.err.println("[Blaniel API] Error: " + e.getMessage());
                return null;
            }
        });
    }

    // ===== Data Classes =====

    public static class ChatResponse {
        public String response;
        public EmotionData emotions;
        public ActionData action;
        public RelationshipData relationship;
    }

    public static class EmotionData {
        public String primary;
        public double intensity;
        public String animation;
    }

    public static class ActionData {
        public String type;
    }

    public static class RelationshipData {
        public String stage;
        public double trust;
        public double affinity;
    }

    public static class AgentListResponse {
        public AgentData[] agents;
        public int total;
        public String plan;
    }

    public static class AgentData {
        public String id;
        public String name;
        public String gender;
        public int age;
        public String profession;
        public String currentEmotion;
    }

    public static class MinecraftContext {
        public String activity;
        public int timeOfDay;
        public String weather;
        public Position position;
    }

    public static class Position {
        public double x;
        public double y;
        public double z;
        public String world;
    }
}
```

---

## 🔧 Paso 3: Entidad BlanielVillager (90 minutos)

### 3.1 Crear `BlanielVillager.java`

Esta clase extiende `MCAVillager` y agrega funcionalidad de API:

```java
package com.blaniel.minecraft.entity;

import com.blaniel.minecraft.network.BlanielAPI;
import com.blaniel.minecraft.config.BlanielConfig;
import com.reyzerbit.mca_reborn.common.entities.MCAVillager;
import net.minecraft.entity.EntityType;
import net.minecraft.entity.player.PlayerEntity;
import net.minecraft.nbt.CompoundNBT;
import net.minecraft.util.ActionResultType;
import net.minecraft.util.Hand;
import net.minecraft.util.text.StringTextComponent;
import net.minecraft.world.World;

public class BlanielVillager extends MCAVillager {

    // ID del agente de Blaniel asociado
    private String blanielAgentId = "";

    // API client
    private BlanielAPI api;

    public BlanielVillager(EntityType<? extends MCAVillager> type, World world) {
        super(type, world);

        // Inicializar API client
        String apiUrl = BlanielConfig.API_URL.get();
        String apiKey = BlanielConfig.API_KEY.get();
        this.api = new BlanielAPI(apiUrl, apiKey);
    }

    /**
     * Setear el ID del agente de Blaniel
     */
    public void setBlanielAgentId(String agentId) {
        this.blanielAgentId = agentId;
    }

    public String getBlanielAgentId() {
        return this.blanielAgentId;
    }

    /**
     * Manejar interacción del jugador (click derecho)
     */
    @Override
    public ActionResultType interactAt(PlayerEntity player, Hand hand) {
        if (!this.level.isClientSide) {
            // Servidor: abrir GUI de chat
            if (!blanielAgentId.isEmpty()) {
                // TODO: Abrir pantalla de chat personalizada
                player.sendMessage(
                    new StringTextComponent("§a[Blaniel] §fHabla con " + this.getName().getString()),
                    player.getUUID()
                );
            } else {
                player.sendMessage(
                    new StringTextComponent("§c[Blaniel] §fEste aldeano no tiene un agente asignado"),
                    player.getUUID()
                );
            }
        }

        return ActionResultType.SUCCESS;
    }

    /**
     * Enviar mensaje al agente y procesar respuesta
     */
    public void sendMessageToAgent(String message, PlayerEntity player) {
        if (blanielAgentId.isEmpty() || !BlanielConfig.ENABLE_API.get()) {
            return;
        }

        // Build context
        BlanielAPI.MinecraftContext context = new BlanielAPI.MinecraftContext();
        context.activity = "talking"; // TODO: usar actividad real
        context.timeOfDay = (int) this.level.getDayTime();
        context.weather = this.level.isRaining() ? (this.level.isThundering() ? "thunder" : "rain") : "clear";

        BlanielAPI.Position pos = new BlanielAPI.Position();
        pos.x = this.getX();
        pos.y = this.getY();
        pos.z = this.getZ();
        pos.world = this.level.dimension().location().toString();
        context.position = pos;

        // Enviar mensaje a API (async)
        api.sendMessage(blanielAgentId, message, context).thenAccept(response -> {
            if (response != null && response.response != null) {
                // En el hilo principal de Minecraft
                this.level.getServer().execute(() -> {
                    // Mostrar respuesta al jugador
                    player.sendMessage(
                        new StringTextComponent("§b" + this.getName().getString() + "§f: " + response.response),
                        player.getUUID()
                    );

                    // Actualizar emoción (animación)
                    if (response.emotions != null) {
                        // TODO: aplicar animación basada en response.emotions.animation
                        System.out.println("[Blaniel] Emotion: " + response.emotions.primary +
                                         " (intensity: " + response.emotions.intensity + ")");
                    }
                });
            }
        }).exceptionally(ex -> {
            System.err.println("[Blaniel] Error processing message: " + ex.getMessage());
            return null;
        });
    }

    /**
     * Guardar datos adicionales en NBT
     */
    @Override
    public void addAdditionalSaveData(CompoundNBT nbt) {
        super.addAdditionalSaveData(nbt);
        nbt.putString("BlanielAgentId", this.blanielAgentId);
    }

    /**
     * Cargar datos adicionales desde NBT
     */
    @Override
    public void readAdditionalSaveData(CompoundNBT nbt) {
        super.readAdditionalSaveData(nbt);
        if (nbt.contains("BlanielAgentId")) {
            this.blanielAgentId = nbt.getString("BlanielAgentId");
        }
    }
}
```

---

## 🔧 Paso 4: Chat UI (60 minutos)

### 4.1 Crear `BlanielChatScreen.java`

```java
package com.blaniel.minecraft.client;

import com.blaniel.minecraft.entity.BlanielVillager;
import com.mojang.blaze3d.matrix.MatrixStack;
import net.minecraft.client.gui.screen.Screen;
import net.minecraft.client.gui.widget.TextFieldWidget;
import net.minecraft.client.gui.widget.button.Button;
import net.minecraft.entity.player.PlayerEntity;
import net.minecraft.util.text.StringTextComponent;
import net.minecraft.util.text.TranslationTextComponent;

public class BlanielChatScreen extends Screen {

    private final BlanielVillager villager;
    private final PlayerEntity player;

    private TextFieldWidget messageInput;
    private Button sendButton;

    // Chat history (últimos 10 mensajes)
    private java.util.List<String> chatHistory = new java.util.ArrayList<>();

    public BlanielChatScreen(BlanielVillager villager, PlayerEntity player) {
        super(new TranslationTextComponent("blaniel.gui.chat.title"));
        this.villager = villager;
        this.player = player;
    }

    @Override
    protected void init() {
        super.init();

        // Campo de texto para mensaje
        this.messageInput = new TextFieldWidget(
            this.font,
            this.width / 2 - 150,
            this.height - 40,
            280,
            20,
            new StringTextComponent("")
        );
        this.messageInput.setMaxLength(200);
        this.addWidget(this.messageInput);

        // Botón de enviar
        this.sendButton = new Button(
            this.width / 2 + 135,
            this.height - 40,
            50,
            20,
            new StringTextComponent("Enviar"),
            (button) -> this.sendMessage()
        );
        this.addButton(this.sendButton);

        // Botón de cerrar
        this.addButton(new Button(
            this.width / 2 - 50,
            this.height - 65,
            100,
            20,
            new StringTextComponent("Cerrar"),
            (button) -> this.onClose()
        ));
    }

    private void sendMessage() {
        String message = this.messageInput.getValue().trim();
        if (message.isEmpty()) {
            return;
        }

        // Agregar mensaje del jugador al historial
        this.chatHistory.add("§eTú§f: " + message);

        // Limpiar input
        this.messageInput.setValue("");

        // Enviar a la API
        this.villager.sendMessageToAgent(message, this.player);

        // Agregar placeholder de "escribiendo..."
        this.chatHistory.add("§b" + this.villager.getName().getString() + "§f está escribiendo...");
    }

    @Override
    public void render(MatrixStack matrixStack, int mouseX, int mouseY, float partialTicks) {
        // Fondo semi-transparente
        this.fillGradient(matrixStack, 0, 0, this.width, this.height, 0x80000000, 0x80000000);

        // Título
        drawCenteredString(
            matrixStack,
            this.font,
            "§lChat con " + this.villager.getName().getString(),
            this.width / 2,
            20,
            0xFFFFFF
        );

        // Renderizar historial de chat
        int yOffset = 50;
        int maxMessages = Math.min(this.chatHistory.size(), 10);
        for (int i = Math.max(0, this.chatHistory.size() - maxMessages); i < this.chatHistory.size(); i++) {
            String msg = this.chatHistory.get(i);
            this.font.draw(matrixStack, msg, 20, yOffset, 0xFFFFFF);
            yOffset += 12;
        }

        // Renderizar widgets
        super.render(matrixStack, mouseX, mouseY, partialTicks);
        this.messageInput.render(matrixStack, mouseX, mouseY, partialTicks);
    }

    @Override
    public boolean keyPressed(int keyCode, int scanCode, int modifiers) {
        // Enter para enviar
        if (keyCode == 257 || keyCode == 335) { // ENTER o NUMPAD_ENTER
            this.sendMessage();
            return true;
        }

        return super.keyPressed(keyCode, scanCode, modifiers) || this.messageInput.keyPressed(keyCode, scanCode, modifiers);
    }

    @Override
    public boolean isPauseScreen() {
        return false; // No pausar el juego
    }
}
```

---

## 🔧 Paso 5: Registro y Comandos (45 minutos)

### 5.1 Modificar `BlanielMod.java`

```java
package com.blaniel.minecraft;

import com.blaniel.minecraft.config.BlanielConfig;
import com.blaniel.minecraft.entity.BlanielVillager;
import net.minecraft.entity.EntityType;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.event.RegisterCommandsEvent;
import net.minecraftforge.eventbus.api.SubscribeEvent;
import net.minecraftforge.fml.ModLoadingContext;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fml.config.ModConfig;
import net.minecraftforge.fml.event.lifecycle.FMLCommonSetupEvent;
import net.minecraftforge.fml.javafmlmod.FMLJavaModLoadingContext;

@Mod("blaniel_mc")
public class BlanielMod {

    public static final String MOD_ID = "blaniel_mc";

    public BlanielMod() {
        // Register config
        ModLoadingContext.get().registerConfig(ModConfig.Type.COMMON, BlanielConfig.SPEC, "blaniel-config.toml");

        // Register event listeners
        FMLJavaModLoadingContext.get().getModEventBus().addListener(this::setup);
        MinecraftForge.EVENT_BUS.register(this);
    }

    private void setup(final FMLCommonSetupEvent event) {
        System.out.println("[Blaniel] Initializing Blaniel Minecraft Integration");
        System.out.println("[Blaniel] API URL: " + BlanielConfig.API_URL.get());
        System.out.println("[Blaniel] API Enabled: " + BlanielConfig.ENABLE_API.get());
    }

    @SubscribeEvent
    public void onRegisterCommands(RegisterCommandsEvent event) {
        // Registrar comando /blaniel
        BlanielCommands.register(event.getDispatcher());
    }
}
```

### 5.2 Crear `BlanielCommands.java`

```java
package com.blaniel.minecraft;

import com.blaniel.minecraft.entity.BlanielVillager;
import com.blaniel.minecraft.network.BlanielAPI;
import com.mojang.brigadier.CommandDispatcher;
import com.mojang.brigadier.arguments.StringArgumentType;
import net.minecraft.command.CommandSource;
import net.minecraft.command.Commands;
import net.minecraft.entity.Entity;
import net.minecraft.entity.player.ServerPlayerEntity;
import net.minecraft.util.text.StringTextComponent;

public class BlanielCommands {

    public static void register(CommandDispatcher<CommandSource> dispatcher) {

        // /blaniel spawn <agentId>
        dispatcher.register(Commands.literal("blaniel")
            .then(Commands.literal("spawn")
                .then(Commands.argument("agentId", StringArgumentType.string())
                    .executes(context -> {
                        String agentId = StringArgumentType.getString(context, "agentId");
                        ServerPlayerEntity player = context.getSource().getPlayerOrException();

                        // TODO: Spawnear BlanielVillager en posición del jugador
                        // Por ahora, solo confirmación
                        player.sendMessage(
                            new StringTextComponent("§a[Blaniel] §fSpawneando agente: " + agentId),
                            player.getUUID()
                        );

                        return 1;
                    })
                )
            )
            .then(Commands.literal("list")
                .executes(context -> {
                    ServerPlayerEntity player = context.getSource().getPlayerOrException();

                    // TODO: Llamar a API para obtener lista de agentes
                    player.sendMessage(
                        new StringTextComponent("§a[Blaniel] §fObteniendo lista de agentes..."),
                        player.getUUID()
                    );

                    return 1;
                })
            )
        );
    }
}
```

---

## 🧪 Paso 6: Testing (30 minutos)

### 6.1 Build y Run

```bash
cd /mnt/SSD/Proyectos/AI/creador-inteligencias/Juego/Blaniel-MC
./gradlew build
./gradlew runClient
```

### 6.2 Setup en Minecraft

1. Iniciar el juego con el mod cargado
2. Crear mundo nuevo o cargar existente
3. Editar config: `config/blaniel-config.toml`
   ```toml
   apiUrl = "http://localhost:3000"
   apiKey = "tu_api_key_aqui"
   enableApi = true
   ```
4. Reiniciar Minecraft

### 6.3 Test básico

1. Ejecutar comando: `/blaniel spawn <tu-agent-id>`
2. Debería spawnear un aldeano
3. Click derecho → debería abrir chat
4. Escribir mensaje → debería enviar a API y recibir respuesta

---

## ✅ Criterios de Éxito del MVP

- [ ] Mod compila sin errores
- [ ] Mod carga en Minecraft sin crashes
- [ ] Comando `/blaniel spawn` funciona
- [ ] Click derecho en aldeano muestra mensaje
- [ ] Mensaje se envía a API (verificar logs de Next.js)
- [ ] Respuesta de API se muestra en chat de Minecraft

Si todos esos puntos funcionan → **MVP validado** 🎉

---

## 📋 Próximos Pasos (Post-MVP)

### Fase 2: Funcionalidad Completa
- Implementar `BlanielChatScreen` completa
- Sistema de spawn múltiples agentes
- Sincronización de emociones → animaciones
- Comando `/blaniel list` con GUI

### Fase 3: Movimiento Inteligente
- Integrar endpoint `/action` para decisiones críticas
- Rutinas basadas en hora del día
- Reacciones a eventos (daño, regalos)

### Fase 4: Features Avanzadas
- Mapa de ciudad (San Francisco, Las Vegas)
- Casas asignadas por agente
- Memoria de lugares visitados
- Eventos emergentes

---

## 💰 Estimación de Costos

### MVP (Solo chat):
- **Llamadas a API:** ~100/día en testing
- **Tokens por llamada:** ~500 tokens (input) + 200 tokens (output)
- **Modelo:** Venice (~$0.007/msg)
- **Costo diario:** ~$0.70/día
- **Costo mensual:** ~$21/mes

### Con decisiones de movimiento (Fase 3):
- **Llamadas adicionales:** ~50/día para decisiones críticas
- **Modelo:** Gemini Flash-Lite (~$0.00001/llamada)
- **Costo adicional:** ~$0.0005/día
- **Total:** ~$21.50/mes

### Producción con 100 usuarios activos:
- **FREE users (80%):** 20 msgs/día × 80 users = 1,600 msgs
- **PLUS users (15%):** 100 msgs/día × 15 users = 1,500 msgs
- **ULTRA users (5%):** 300 msgs/día × 5 users = 1,500 msgs
- **Total:** 4,600 mensajes/día
- **Costo:** ~$32/día = ~$960/mes

**Con límites por plan, esto es sostenible con donaciones.**

---

## 🚨 Troubleshooting Común

### Error: "Cannot resolve symbol 'MCAVillager'"
- Asegurarse de que MCA-Reborn está incluido como dependencia
- Verificar imports

### Error: "okhttp3" not found
- Ejecutar `./gradlew build --refresh-dependencies`

### Mod no carga en Minecraft
- Verificar `mods.toml` tiene modId correcto
- Revisar logs en `logs/latest.log`

### API no responde
- Verificar que Next.js está corriendo en puerto 3000
- Verificar API key en config
- Revisar CORS settings en Next.js

---

## 📞 Contacto y Soporte

Si encuentras problemas durante la implementación:
1. Revisar logs de Minecraft: `logs/latest.log`
2. Revisar logs de Next.js: consola donde corre `npm run dev`
3. Verificar network con `curl`:
   ```bash
   curl -H "Authorization: Bearer YOUR_API_KEY" \
        http://localhost:3000/api/v1/minecraft/agents
   ```

---

**Última actualización:** 2026-01-22
**Autor:** Blaniel Team
**Versión:** 0.1.0-alpha
