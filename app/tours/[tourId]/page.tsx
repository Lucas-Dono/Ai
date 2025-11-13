import { redirect } from "next/navigation";

interface TourPageProps {
  params: Promise<{
    tourId: string;
  }>;
}

// Mapeo de tours a sus páginas objetivo
const TOUR_ROUTES: Record<string, string> = {
  "welcome": "/dashboard",
  "first-agent": "/constructor",
  "community-interaction": "/community",
  "community-tour": "/community",
  "worlds-intro": "/dashboard/mundos",
  "plans-and-features": "/dashboard/billing",
};

export default async function TourPage({ params }: TourPageProps) {
  const { tourId } = await params;

  // Obtener la ruta objetivo del tour
  const targetRoute = TOUR_ROUTES[tourId];

  if (!targetRoute) {
    // Si el tour no existe, redirigir al dashboard
    redirect("/dashboard");
  }

  // Redirigir a la página objetivo con el query param del tour
  redirect(`${targetRoute}?tour=${tourId}`);
}
