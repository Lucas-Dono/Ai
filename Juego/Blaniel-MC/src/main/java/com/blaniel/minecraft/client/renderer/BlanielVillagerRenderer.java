package com.blaniel.minecraft.client.renderer;

import com.blaniel.minecraft.entity.BlanielVillagerEntity;
import com.blaniel.minecraft.skin.BlanielSkinManager;
import com.mojang.authlib.GameProfile;
import net.minecraft.client.render.entity.EntityRendererFactory;
import net.minecraft.client.render.entity.MobEntityRenderer;
import net.minecraft.client.render.entity.model.PlayerEntityModel;
import net.minecraft.client.render.entity.model.EntityModelLayers;
import net.minecraft.util.Identifier;

/**
 * Renderer para BlanielVillagerEntity
 *
 * Usa el modelo de jugador (PlayerEntityModel) y aplica skins personalizadas
 * descargadas desde la API de Blaniel.
 */
public class BlanielVillagerRenderer extends MobEntityRenderer<BlanielVillagerEntity, PlayerEntityModel<BlanielVillagerEntity>> {

	// Skin por defecto (Steve)
	private static final Identifier DEFAULT_TEXTURE = new Identifier("textures/entity/steve.png");

	public BlanielVillagerRenderer(EntityRendererFactory.Context context) {
		super(context, new PlayerEntityModel<>(context.getPart(EntityModelLayers.PLAYER), false), 0.5f);
	}

	/**
	 * Obtener textura de la entidad
	 *
	 * Retorna la skin custom si está disponible, sino la de Steve
	 */
	@Override
	public Identifier getTexture(BlanielVillagerEntity entity) {
		// Intentar obtener skin custom
		String agentId = entity.getBlanielAgentId();

		if (!agentId.isEmpty()) {
			GameProfile profile = entity.getCustomGameProfile();

			if (profile != null) {
				// Obtener Identifier de textura del SkinManager
				Identifier skinTexture = BlanielSkinManager.getTextureIdentifier(agentId);

				// Verificar que no sea la textura por defecto
				if (!skinTexture.getPath().equals("skins/default")) {
					return skinTexture;
				}
			}
		}

		// Fallback a Steve
		return DEFAULT_TEXTURE;
	}
}
