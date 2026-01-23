package com.blaniel.minecraft.render;

import com.blaniel.minecraft.entity.BlanielVillagerEntity;
import net.minecraft.client.render.entity.EntityRendererFactory;
import net.minecraft.client.render.entity.MobEntityRenderer;
import net.minecraft.client.render.entity.model.EntityModelLayers;
import net.minecraft.client.render.entity.model.VillagerResemblingModel;
import net.minecraft.util.Identifier;

/**
 * Renderer para BlanielVillagerEntity
 * Por ahora usa el modelo de aldeano vanilla
 */
public class BlanielVillagerRenderer extends MobEntityRenderer<BlanielVillagerEntity, VillagerResemblingModel<BlanielVillagerEntity>> {

	private static final Identifier TEXTURE = new Identifier("minecraft", "textures/entity/villager/villager.png");

	public BlanielVillagerRenderer(EntityRendererFactory.Context context) {
		super(context, new VillagerResemblingModel<>(context.getPart(EntityModelLayers.VILLAGER)), 0.5f);
	}

	@Override
	public Identifier getTexture(BlanielVillagerEntity entity) {
		return TEXTURE;
	}
}
