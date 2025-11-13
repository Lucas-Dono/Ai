import { Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoResultsProps {
  query?: string;
  title?: string;
  description?: string;
  onReset?: () => void;
  resetLabel?: string;
}

export function NoResults({
  query,
  title,
  description,
  onReset,
  resetLabel = "Limpiar búsqueda"
}: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 flex items-center justify-center">
          <Search className="h-16 w-16 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold mb-2">
        {title || "No encontramos resultados"}
      </h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        {description || (
          query
            ? `No hay resultados para "${query}". Intenta con otros términos.`
            : "Intenta con otros términos de búsqueda"
        )}
      </p>

      {/* Action */}
      {onReset && (
        <Button onClick={onReset} variant="outline" size="lg" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {resetLabel}
        </Button>
      )}
    </div>
  );
}
