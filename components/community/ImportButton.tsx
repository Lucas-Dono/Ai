/**
 * ImportButton - Botón para importar/clonar una IA a la colección personal
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ImportButtonProps {
  characterId: string;
  characterName: string;
  onImport?: () => void;
  importing?: boolean;
  imported?: boolean;
  className?: string;
}

export function ImportButton({
  characterId,
  characterName,
  onImport,
  importing = false,
  imported = false,
  className,
}: ImportButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [localImporting, setLocalImporting] = useState(false);
  const [localImported, setLocalImported] = useState(imported);

  const handleImport = async () => {
    if (onImport) {
      onImport();
      return;
    }

    try {
      setLocalImporting(true);
      const response = await fetch(`/api/community/marketplace/characters/${characterId}/import`, {
        method: 'POST',
      });

      if (response.ok) {
        setLocalImported(true);
      } else {
        throw new Error('Error al importar');
      }
    } catch (error) {
      console.error('Error importing character:', error);
    } finally {
      setLocalImporting(false);
    }
  };

  const isImporting = importing || localImporting;
  const isImported = imported || localImported;

  return (
    <>
      <Button
        onClick={() => setShowConfirm(true)}
        disabled={isImporting || isImported}
        className={cn("w-full gap-2", className)}
        size="lg"
      >
        <AnimatePresence mode="wait">
          {isImporting ? (
            <motion.div
              key="importing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
              Importando...
            </motion.div>
          ) : isImported ? (
            <motion.div
              key="imported"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              Importado
            </motion.div>
          ) : (
            <motion.div
              key="import"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Download className="h-5 w-5" />
              Importar a Mi Colección
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Importar Personaje</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Quieres importar <strong>{characterName}</strong> a tu colección?
              <br />
              <br />
              Esto creará una copia del personaje en tu cuenta que podrás personalizar
              y modificar libremente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport}>
              Importar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
