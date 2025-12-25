import { NextResponse } from "next/server";
import { z } from "zod";
import { resendEmailVerification } from "@/lib/email/auth-emails.service";

const resendVerificationSchema = z.object({
  email: z.string().email("Email inválido"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validationResult = resendVerificationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Resend verification email
    const result = await resendEmailVerification(email);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email de verificación enviado exitosamente",
      emailEnabled: process.env.EMAIL_ENABLED === 'true',
    });
  } catch (error) {
    console.error("Error en resend verification:", error);
    return NextResponse.json(
      { error: "Error al reenviar email de verificación" },
      { status: 500 }
    );
  }
}
