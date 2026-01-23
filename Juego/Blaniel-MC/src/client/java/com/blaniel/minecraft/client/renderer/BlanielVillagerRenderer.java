package com.blaniel.minecraft.client.renderer;

import com.blaniel.minecraft.BlanielMod;
import com.blaniel.minecraft.entity.BlanielVillagerEntity;
import com.blaniel.minecraft.skin.BlanielSkinManager;
import net.minecraft.client.render.entity.EntityRendererFactory;
import net.minecraft.client.render.entity.MobEntityRenderer;
import net.minecraft.client.render.entity.model.PlayerEntityModel;
import net.minecraft.client.render.entity.model.EntityModelLayers;
import net.minecraft.util.Identifier;

import java.util.HashSet;
import java.util.Set;

/**
 * Renderer para BlanielVillagerEntity
 *
 * Usa el modelo de jugador (PlayerEntityModel) y aplica skins personalizadas
 * descargadas desde la API de Blaniel.
 */
public class BlanielVillagerRenderer extends MobEntityRenderer<BlanielVillagerEntity, PlayerEntityModel<BlanielVillagerEntity>> {

	// Skin por defecto (Steve)
	private static final Identifier DEFAULT_TEXTURE = new Identifier("textures/entity/steve.png");

	// Set de agentes cuyas skins ya están siendo descargadas (evitar duplicados)
	private static final Set<String> LOADING_SKINS = new HashSet<>();

	public BlanielVillagerRenderer(EntityRendererFactory.Context context) {
		super(context, new PlayerEntityModel<>(context.getPart(EntityModelLayers.PLAYER), false), 0.5f);
	}

	/**
	 * Obtener textura de la entidad
	 *
	 * Retorna la skin custom si está disponible, sino la de Steve.
	 * Lazy-load: carga la skin solo cuando se renderiza por primera vez.
	 */
	@Override
	public Identifier getTexture(BlanielVillagerEntity entity) {
		String agentId = entity.getBlanielAgentId();

		if (agentId.isEmpty()) {
			return DEFAULT_TEXTURE;
		}

		// Intentar obtener Identifier de textura del SkinManager
		Identifier skinTexture = BlanielSkinManager.getTextureIdentifier(agentId);

		// Si ya tiene una textura cargada (no es default), usarla
		if (!skinTexture.getPath().equals("skins/default")) {
			return skinTexture;
		}

		// Si no está cargada y no está descargando, iniciar descarga (lazy load)
		if (!LOADING_SKINS.contains(agentId)) {
			LOADING_SKINS.add(agentId);

			String apiUrl = BlanielMod.CONFIG.getApiUrl();
			String jwtToken = BlanielMod.CONFIG.getJwtToken();

			if (!apiUrl.isEmpty() && !jwtToken.isEmpty()) {
				BlanielMod.LOGGER.info("Cargando skin para: {} ({})", entity.getBlanielAgentName(), agentId);

				BlanielSkinManager.loadSkin(agentId, entity.getBlanielAgentName(), apiUrl, jwtToken)
					.thenAccept(profile -> {
						entity.customGameProfile = profile;
						LOADING_SKINS.remove(agentId);
						BlanielMod.LOGGER.info("Skin cargada: {}", entity.getBlanielAgentName());
					})
					.exceptionally(ex -> {
						BlanielMod.LOGGER.error("Error cargando skin: {}", ex.getMessage());
						LOADING_SKINS.remove(agentId);
						return null;
					});
			} else {
				LOADING_SKINS.remove(agentId);
			}
		}

		// Mientras se descarga, usar Steve
		return DEFAULT_TEXTURE;
	}
}
