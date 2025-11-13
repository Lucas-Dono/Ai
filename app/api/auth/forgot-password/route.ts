import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validationResult = forgotPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Por seguridad, siempre devolver el mismo mensaje
    // para no revelar si el email existe o no
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Si el email existe, recibirás instrucciones para restablecer tu contraseña",
      });
    }

    // Verificar que el usuario tenga contraseña (no sea OAuth)
    if (!user.password) {
      return NextResponse.json({
        success: true,
        message: "Si el email existe, recibirás instrucciones para restablecer tu contraseña",
      });
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    // Eliminar tokens anteriores del usuario
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // Crear nuevo token
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    
    console.log("🔑 Password Reset URL:", resetUrl);

    return NextResponse.json({
      success: true,
      message: "Si el email existe, recibirás instrucciones para restablecer tu contraseña",
      ...(process.env.NODE_ENV === "development" && { resetUrl }),
    });
  } catch (error) {
    console.error("Error en forgot password:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
