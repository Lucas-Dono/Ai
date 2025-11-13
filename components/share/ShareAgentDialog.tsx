"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Share2,
  Copy,
  Check,
  MessageCircle,
  Twitter,
  Facebook,
  Linkedin,
  Send,
  Link as LinkIcon,
  QrCode,
  Sparkles,
} from "lucide-react";
import { cn, generateGradient, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import QRCode from "qrcode";

interface ShareAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: {
    id: string;
    name: string;
    description?: string;
    avatar?: string | null;
    category?: string;
  };
}

export function ShareAgentDialog({
  open,
  onOpenChange,
  agent,
}: ShareAgentDialogProps) {
  const [caption, setCaption] = useState("");
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  // Generate share URL
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/agentes/${agent.id}?ref=share`
    : "";

  // Generate QR Code
  const generateQR = async () => {
    try {
      const qr = await QRCode.toDataURL(shareUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#8B5CF6",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(qr);
      setShowQR(true);
    } catch (error) {
      console.error("Error generating QR:", error);
      toast.error("Error al generar código QR");
    }
  };

  // Copy link to clipboard
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);

      // Track share event
      trackShare("copy_link");
    } catch (error) {
      toast.error("Error al copiar link");
    }
  };

  // Share to Community
  const shareToCommunity = async () => {
    setSharing(true);
    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communitySlug: "general", // or let user select
          type: "shared_agent",
          title: `¡Prueba a ${agent.name}!`,
          content: caption || `Quiero compartir esta increíble IA: ${agent.name}. ${agent.description || ""}`,
          sharedAgentId: agent.id,
        }),
      });

      if (response.ok) {
        toast.success("Compartido en la comunidad exitosamente");
        trackShare("community");
        onOpenChange(false);
      } else {
        throw new Error("Failed to share");
      }
    } catch (error) {
      console.error("Error sharing to community:", error);
      toast.error("Error al compartir en la comunidad");
    } finally {
      setSharing(false);
    }
  };

  // Share to Social Media
  const shareToSocial = (platform: "twitter" | "facebook" | "linkedin" | "whatsapp") => {
    const text = caption || `¡Prueba esta IA increíble: ${agent.name}! ${agent.description || ""}`;
    let url = "";

    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`;
        break;
    }

    window.open(url, "_blank", "width=600,height=400");
    trackShare(platform);
  };

  // Track share event
  const trackShare = async (method: string) => {
    try {
      await fetch(`/api/agents/${agent.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });
    } catch (error) {
      console.error("Error tracking share:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-600" />
            Compartir IA
          </DialogTitle>
          <DialogDescription>
            Comparte esta IA con la comunidad o en redes sociales
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Agent Preview */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
            <Avatar className="w-16 h-16 border-2 border-white dark:border-gray-800 shadow-lg">
              {agent.avatar ? (
                <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
              ) : (
                <AvatarFallback
                  className="text-white text-xl font-bold"
                  style={{ background: generateGradient(agent.name) }}
                >
                  {getInitials(agent.name)}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                {agent.name}
              </h3>
              {agent.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {agent.description}
                </p>
              )}
              {agent.category && (
                <Badge variant="outline" className="mt-2 text-xs">
                  {agent.category}
                </Badge>
              )}
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 block">
              Mensaje (opcional)
            </label>
            <Textarea
              placeholder="Agrega un mensaje personal..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Share to Community */}
          <div>
            <Button
              onClick={shareToCommunity}
              disabled={sharing}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {sharing ? "Compartiendo..." : "Compartir en la Comunidad"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Se creará un post en /community para que otros puedan probar esta IA
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-950 px-2 text-muted-foreground">
                O comparte en
              </span>
            </div>
          </div>

          {/* Social Media Buttons */}
          <div className="grid grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => shareToSocial("twitter")}
              className="flex-col h-auto py-3 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-500"
            >
              <Twitter className="w-5 h-5 mb-1 text-blue-500" />
              <span className="text-xs">Twitter</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => shareToSocial("facebook")}
              className="flex-col h-auto py-3 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-600"
            >
              <Facebook className="w-5 h-5 mb-1 text-blue-600" />
              <span className="text-xs">Facebook</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => shareToSocial("whatsapp")}
              className="flex-col h-auto py-3 hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-500"
            >
              <Send className="w-5 h-5 mb-1 text-green-500" />
              <span className="text-xs">WhatsApp</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => shareToSocial("linkedin")}
              className="flex-col h-auto py-3 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-700"
            >
              <Linkedin className="w-5 h-5 mb-1 text-blue-700" />
              <span className="text-xs">LinkedIn</span>
            </Button>
          </div>

          {/* Copy Link & QR */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={copyLink}
              className="flex-1"
              size="lg"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={generateQR}
              size="lg"
              className="px-4"
            >
              <QrCode className="w-4 h-4" />
            </Button>
          </div>

          {/* QR Code Display */}
          <AnimatePresence>
            {showQR && qrCodeUrl && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-center"
              >
                <p className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">
                  Escanea este código QR
                </p>
                <div className="inline-block p-4 bg-white rounded-xl shadow-lg">
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
