import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
  // IMPORTANTE: Habilitar cookies para la sesión
  fetchOptions: {
    credentials: "include", // Incluir cookies en todas las requests
  },
});

export const { useSession, signIn, signOut, signUp } = authClient;
