package com.blaniel.minecraft.ai;

import com.blaniel.minecraft.entity.BlanielVillagerEntity;
import net.minecraft.entity.ai.goal.Goal;
import net.minecraft.util.math.Vec3d;

import java.util.EnumSet;

/**
 * AI Goal para moverse al punto de reunión de un grupo social
 */
public class MoveToGroupMeetingPointGoal extends Goal {

    private final BlanielVillagerEntity entity;
    private Vec3d meetingPoint;
    private final double speed;
    private final double acceptableDistance;
    private int ticksStuck;
    private static final int MAX_STUCK_TICKS = 100; // 5 segundos

    public MoveToGroupMeetingPointGoal(BlanielVillagerEntity entity, double speed) {
        this.entity = entity;
        this.speed = speed;
        this.acceptableDistance = 2.0; // 2 bloques del punto central
        this.ticksStuck = 0;

        // Este goal no bloquea look ni move
        this.setControls(EnumSet.of(Control.MOVE));
    }

    /**
     * Establecer punto de reunión
     */
    public void setMeetingPoint(Vec3d point) {
        this.meetingPoint = point;
        this.ticksStuck = 0;
    }

    /**
     * Limpiar punto de reunión
     */
    public void clearMeetingPoint() {
        this.meetingPoint = null;
        this.entity.getNavigation().stop();
    }

    /**
     * ¿Puede iniciar este goal?
     */
    @Override
    public boolean canStart() {
        // Solo si hay un punto de reunión y no está en conversación
        if (this.meetingPoint == null || this.entity.isInConversation()) {
            return false;
        }

        // Solo si está lejos del punto
        double distance = this.entity.getPos().distanceTo(this.meetingPoint);
        return distance > this.acceptableDistance;
    }

    /**
     * ¿Debe continuar?
     */
    @Override
    public boolean shouldContinue() {
        if (this.meetingPoint == null || this.entity.isInConversation()) {
            return false;
        }

        // Verificar si llegó
        double distance = this.entity.getPos().distanceTo(this.meetingPoint);
        if (distance <= this.acceptableDistance) {
            return false; // Ya llegó
        }

        // Verificar si está trabado
        if (this.ticksStuck > MAX_STUCK_TICKS) {
            // Abandonar si está trabado por mucho tiempo
            return false;
        }

        return true;
    }

    /**
     * Iniciar ejecución
     */
    @Override
    public void start() {
        if (this.meetingPoint != null) {
            // Navegar al punto de reunión
            this.entity.getNavigation().startMovingTo(
                this.meetingPoint.x,
                this.meetingPoint.y,
                this.meetingPoint.z,
                this.speed
            );
        }
    }

    /**
     * Actualizar cada tick
     */
    @Override
    public void tick() {
        if (this.meetingPoint == null) {
            return;
        }

        // Verificar si está navegando
        if (this.entity.getNavigation().isIdle()) {
            // Reintentar navegación
            this.entity.getNavigation().startMovingTo(
                this.meetingPoint.x,
                this.meetingPoint.y,
                this.meetingPoint.z,
                this.speed
            );

            this.ticksStuck++;
        } else {
            // Está moviéndose, resetear contador
            this.ticksStuck = 0;
        }

        // Mirar hacia el punto de reunión mientras se mueve
        this.entity.getLookControl().lookAt(
            this.meetingPoint.x,
            this.entity.getEyeY(),
            this.meetingPoint.z
        );
    }

    /**
     * Terminar ejecución
     */
    @Override
    public void stop() {
        this.entity.getNavigation().stop();
    }
}
