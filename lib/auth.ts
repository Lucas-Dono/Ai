import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { expo } from "@better-auth/expo";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    expo(), // Enable Expo/React Native support
  ],
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    // Expo scheme
    "blaniel://",
    // Development mode - Expo's exp:// scheme with local IP ranges
    ...(process.env.NODE_ENV === "development" ? [
      "exp://",
      "exp://**",
      "exp://192.168.*.*:*/**",
    ] : [])
  ].filter(Boolean) as string[],
  advanced: {
    cookiePrefix: "better-auth",
  },
  // SECURITY: Configuración de cookies con flags de seguridad
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutos en memoria
    },
  },
  cookies: {
    sessionToken: {
      name: "better-auth.session_token",
      options: {
        httpOnly: true, // No accesible desde JavaScript (previene XSS)
        sameSite: "lax" as const, // Protección CSRF (usar "strict" si es posible)
        path: "/",
        secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
