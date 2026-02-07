import { Lock, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoPermissionProps {
  title?: string;
  description?: string;
  showHomeButton?: boolean;
}

export function NoPermission({
  title = "Acceso restringido",
  description = "No tienes permiso para ver este contenido",
  showHomeButton = true
}: NoPermissionProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex items-center justify-center">
          <Lock className="h-16 w-16 text-orange-400 dark:text-orange-500" />
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>

      {/* Action */}
      {showHomeButton && (
        <Button onClick={() => window.location.href = "/"} size="lg" className="gap-2">
          <Home className="h-4 w-4" />
          Ir al inicio
        </Button>
      )}
    </div>
  );
}
