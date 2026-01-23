package com.blaniel.minecraft.entity;

import com.blaniel.minecraft.BlanielMod;
import com.blaniel.minecraft.network.BlanielAPIClient;
import com.mojang.authlib.GameProfile;
import net.minecraft.entity.EntityType;
import net.minecraft.entity.ai.goal.*;
import net.minecraft.entity.attribute.DefaultAttributeContainer;
import net.minecraft.entity.attribute.EntityAttributes;
import net.minecraft.entity.data.DataTracker;
import net.minecraft.entity.data.TrackedData;
import net.minecraft.entity.data.TrackedDataHandlerRegistry;
import net.minecraft.entity.mob.MobEntity;
import net.minecraft.entity.mob.PathAwareEntity;
import net.minecraft.entity.player.PlayerEntity;
import net.minecraft.nbt.NbtCompound;
import net.minecraft.text.Text;
import net.minecraft.util.ActionResult;
import net.minecraft.util.Hand;
import net.minecraft.world.World;

/**
 * Entidad de aldeano conectado a agente de Blaniel
 */
public class BlanielVillagerEntity extends PathAwareEntity {

	// DataTracker para sincronización cliente-servidor
	private static final TrackedData<String> AGENT_ID = DataTracker.registerData(
		BlanielVillagerEntity.class, TrackedDataHandlerRegistry.STRING
	);
	private static final TrackedData<String> AGENT_NAME = DataTracker.registerData(
		BlanielVillagerEntity.class, TrackedDataHandlerRegistry.STRING
	);

	// GameProfile personalizado para skin custom
	public GameProfile customGameProfile = null;

	// Cliente de API
	private final BlanielAPIClient apiClient;

	public BlanielVillagerEntity(EntityType<? extends PathAwareEntity> entityType, World world) {
		super(entityType, world);

		// Inicializar cliente de API
		String apiUrl = BlanielMod.CONFIG.getApiUrl();
		String jwtToken = BlanielMod.CONFIG.getJwtToken();
		this.apiClient = new BlanielAPIClient(apiUrl, jwtToken);
	}

	/**
	 * Inicializar DataTracker para sincronización cliente-servidor
	 */
	@Override
	protected void initDataTracker() {
		super.initDataTracker();
		this.dataTracker.startTracking(AGENT_ID, "");
		this.dataTracker.startTracking(AGENT_NAME, "Aldeano");
	}

	/**
	 * Crear atributos por defecto del aldeano
	 */
	public static DefaultAttributeContainer.Builder createVillagerAttributes() {
		return MobEntity.createMobAttributes()
			.add(EntityAttributes.GENERIC_MAX_HEALTH, 20.0)
			.add(EntityAttributes.GENERIC_MOVEMENT_SPEED, 0.5)
			.add(EntityAttributes.GENERIC_FOLLOW_RANGE, 48.0);
	}

	/**
	 * Inicializar AI goals (comportamiento)
	 */
	@Override
	protected void initGoals() {
		// Pathfinding básico
		this.goalSelector.add(0, new SwimGoal(this));
		this.goalSelector.add(1, new EscapeDangerGoal(this, 1.4));
		this.goalSelector.add(2, new LookAtEntityGoal(this, PlayerEntity.class, 8.0f));
		this.goalSelector.add(3, new WanderAroundFarGoal(this, 0.6));
		this.goalSelector.add(4, new LookAroundGoal(this));

		// Targets: huir de zombies
		this.targetSelector.add(1, new ActiveTargetGoal<>(this, net.minecraft.entity.mob.ZombieEntity.class, true));
	}

	/**
	 * Interacción del jugador (click derecho)
	 */
	@Override
	public ActionResult interactMob(PlayerEntity player, Hand hand) {
		if (!this.getWorld().isClient) {
			// Lado del servidor
			String agentId = this.getBlanielAgentId();
			String agentName = this.getBlanielAgentName();

			if (agentId.isEmpty()) {
				player.sendMessage(Text.literal("§c[Blaniel] §fEste aldeano no tiene un agente asignado"), false);
				player.sendMessage(Text.literal("§7Abre la UI con tecla K para asignar un agente"), false);
			} else {
				// Enviar packet al cliente para abrir GUI
				BlanielMod.LOGGER.info("Click derecho en aldeano con agente: " + agentName);

				if (player instanceof net.minecraft.server.network.ServerPlayerEntity) {
					net.minecraft.server.network.ServerPlayerEntity serverPlayer =
						(net.minecraft.server.network.ServerPlayerEntity) player;

					BlanielMod.LOGGER.info("Enviando OPEN_CHAT_PACKET al cliente...");

					net.minecraft.network.PacketByteBuf byteBuf =
						net.fabricmc.fabric.api.networking.v1.PacketByteBufs.create();
					byteBuf.writeInt(this.getId());
					byteBuf.writeString(agentId);
					byteBuf.writeString(agentName);

					net.fabricmc.fabric.api.networking.v1.ServerPlayNetworking.send(
						serverPlayer,
						com.blaniel.minecraft.network.NetworkHandler.OPEN_CHAT_PACKET,
						byteBuf
					);

					BlanielMod.LOGGER.info("OPEN_CHAT_PACKET enviado exitosamente");
				}
			}
		}

		return ActionResult.SUCCESS;
	}

	/**
	 * Enviar mensaje al agente de Blaniel
	 */
	public void sendMessageToAgent(String message, PlayerEntity player) {
		String agentId = this.getBlanielAgentId();
		String agentName = this.getBlanielAgentName();

		if (agentId.isEmpty() || !BlanielMod.CONFIG.isApiEnabled()) {
			player.sendMessage(Text.literal("§c[Blaniel] §fAPI no configurada o agente no asignado"), false);
			return;
		}

		// Construir contexto
		var context = new BlanielAPIClient.MinecraftContext();
		context.activity = "talking";
		context.timeOfDay = (int) this.getWorld().getTimeOfDay();
		context.weather = this.getWorld().isRaining() ?
			(this.getWorld().isThundering() ? "thunder" : "rain") : "clear";

		var pos = new BlanielAPIClient.Position();
		pos.x = this.getX();
		pos.y = this.getY();
		pos.z = this.getZ();
		pos.world = this.getWorld().getRegistryKey().getValue().toString();
		context.position = pos;

		// Enviar mensaje a API (async)
		BlanielMod.LOGGER.info("Enviando mensaje a agente {}: {}", agentId, message);

		apiClient.sendMessage(agentId, message, context).thenAccept(response -> {
			if (response != null && response.response != null) {
				// Ejecutar en thread principal de Minecraft
				if (this.getWorld().getServer() != null) {
					this.getWorld().getServer().execute(() -> {
						// Mostrar respuesta al jugador
						player.sendMessage(Text.literal("§b" + agentName + "§f: " + response.response), false);

						// Log de emoción
						if (response.emotions != null) {
							BlanielMod.LOGGER.info("Emoción: {} (intensidad: {})",
								response.emotions.primary, response.emotions.intensity);
						}
					});
				}
			}
		}).exceptionally(ex -> {
			BlanielMod.LOGGER.error("Error al procesar mensaje: {}", ex.getMessage());
			if (this.getWorld().getServer() != null) {
				this.getWorld().getServer().execute(() -> {
					player.sendMessage(Text.literal("§c[Blaniel] §fError al comunicarse con el servidor"), false);
				});
			}
			return null;
		});
	}

	/**
	 * Guardar datos adicionales en NBT (persistencia en disco)
	 */
	@Override
	public void writeCustomDataToNbt(NbtCompound nbt) {
		super.writeCustomDataToNbt(nbt);
		nbt.putString("BlanielAgentId", this.getBlanielAgentId());
		nbt.putString("BlanielAgentName", this.getBlanielAgentName());
	}

	/**
	 * Cargar datos adicionales desde NBT (persistencia en disco)
	 */
	@Override
	public void readCustomDataFromNbt(NbtCompound nbt) {
		super.readCustomDataFromNbt(nbt);
		if (nbt.contains("BlanielAgentId")) {
			this.setBlanielAgentId(nbt.getString("BlanielAgentId"));
		}
		if (nbt.contains("BlanielAgentName")) {
			this.setBlanielAgentName(nbt.getString("BlanielAgentName"));
		}
	}

	// Getters y Setters (usando DataTracker para sincronización cliente-servidor)
	public String getBlanielAgentId() {
		return this.dataTracker.get(AGENT_ID);
	}

	public void setBlanielAgentId(String blanielAgentId) {
		this.dataTracker.set(AGENT_ID, blanielAgentId);
		BlanielMod.LOGGER.info("AgentId establecido: {} para aldeano {}", blanielAgentId, this.getBlanielAgentName());
	}

	public String getBlanielAgentName() {
		return this.dataTracker.get(AGENT_NAME);
	}

	public void setBlanielAgentName(String blanielAgentName) {
		this.dataTracker.set(AGENT_NAME, blanielAgentName);
		BlanielMod.LOGGER.info("AgentName establecido: {}", blanielAgentName);
	}

	/**
	 * Obtener GameProfile personalizado (para renderer)
	 */
	public GameProfile getCustomGameProfile() {
		return customGameProfile;
	}
}
