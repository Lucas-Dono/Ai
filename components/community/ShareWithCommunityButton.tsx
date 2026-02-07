/**
 * ShareWithCommunityButton - Botón para compartir desde la página de edición de agente
 */

"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareModal } from "./ShareModal";
import { toast } from "sonner";

interface ShareWithCommunityButtonProps {
  itemType: 'character' | 'prompt' | 'theme';
  itemId: string;
  itemName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ShareWithCommunityButton({
  itemType,
  itemId,
  itemName,
  variant = 'outline',
  size = 'default',
  className,
}: ShareWithCommunityButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowModal(true)}
        className={className}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Compartir con Comunidad
      </Button>

      <ShareModal
        open={showModal}
        onOpenChange={setShowModal}
        itemType={itemType}
        itemId={itemId}
        itemName={itemName}
        onSuccess={() => {
          toast.success('¡Compartido!', {
            description: `${itemName} ha sido compartido con la comunidad exitosamente.`,
          });
        }}
      />
    </>
  );
}
