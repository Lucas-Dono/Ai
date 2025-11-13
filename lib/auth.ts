import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { checkLoginRateLimit } from "@/lib/auth/rate-limit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Rate limiting (usamos email como identificador para login)
        const rateLimit = await checkLoginRateLimit(credentials.email as string);

        if (!rateLimit.success) {
          throw new Error("Demasiados intentos de inicio de sesión. Por favor, intenta más tarde.");
        }

        // Buscar usuario por email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          return null;
        }

        // Verificar contraseña
        if (!user.password) {
          // Usuario creado con OAuth, no tiene contraseña
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        // Use data from JWT token instead of querying DB on every request
        // This is more efficient and works with edge runtime
        // Note: User data is set during JWT callback on login
        session.user.id = token.sub;
        session.user.email = token.email as string;
        session.user.name = token.name as string | undefined;
        session.user.plan = (token.plan as string) || "free";
      }
      return session;
    },
    async jwt({ token, user, trigger }) {
      // Only query DB on login (when user object is present) or on update
      if (user) {
        token.id = user.id;
        // Fetch plan from database on login
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { plan: true },
        });
        token.plan = dbUser?.plan || "free";
      }

      // On session update, refresh user data from DB
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub as string },
          select: {
            id: true,
            email: true,
            name: true,
            plan: true,
          },
        });

        if (dbUser) {
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.plan = dbUser.plan;
        }
      }

      return token;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
