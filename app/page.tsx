import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Root Page - Smart Redirector
 *
 * Estrategia de rutas:
 * - / → Redirige a /landing si NO está autenticado, a /dashboard si está autenticado
 * - /landing → Landing page pública (siempre accesible, para marketing/ads)
 *
 * Esta separación permite:
 * 1. Usuarios nuevos → ven la landing page pública
 * 2. Usuarios autenticados → van directamente al dashboard (con tours integrados para onboarding)
 * 3. SEO optimizado con landing page dedicada
 */
export default async function Home() {
  const session = await auth();

  // If user is logged in, redirect to dashboard
  // (Dashboard tours will handle onboarding for new users)
  if (session) {
    redirect("/dashboard");
  }

  // If not authenticated, show landing page
  redirect("/landing");
}
