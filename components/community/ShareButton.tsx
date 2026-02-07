/**
 * ShareButton - Botón para compartir en redes sociales
 */

"use client";

import { useState } from "react";
import { Share2, Check, Twitter, Facebook, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ShareButton({ url, title, text, variant = "ghost", size = "sm" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: fullUrl,
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
  };

  // Si el navegador soporta Web Share API, usar directamente
  if (typeof navigator !== 'undefined' && typeof navigator.share !== 'undefined') {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleNativeShare}
        className="gap-2"
      >
        <Share2 className="h-4 w-4" />
        {size !== "icon" && "Compartir"}
      </Button>
    );
  }

  // Fallback: dropdown con opciones
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Share2 className="h-4 w-4" />
          {size !== "icon" && "Compartir"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-500" />
              <span className="text-green-500">Copiado!</span>
            </>
          ) : (
            <>
              <LinkIcon className="h-4 w-4 mr-2" />
              Copiar enlace
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTwitter}>
          <Twitter className="h-4 w-4 mr-2" />
          Compartir en Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook}>
          <Facebook className="h-4 w-4 mr-2" />
          Compartir en Facebook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
