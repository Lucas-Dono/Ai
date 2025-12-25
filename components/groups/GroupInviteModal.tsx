"use client";

import { useState } from "react";
import { X, UserPlus, Copy, Check, Mail, Share2, Loader2 } from "lucide-react";

interface GroupInviteModalProps {
  groupId: string;
  groupName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function GroupInviteModal({
  groupId,
  groupName,
  isOpen,
  onClose,
}: GroupInviteModalProps) {
  const [inviteMethod, setInviteMethod] = useState<"link" | "email">("link");
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const generateInviteLink = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch(`/api/groups/${groupId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 días
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al generar invitación");
      }

      const data = await response.json();
      const link = `${window.location.origin}/dashboard/grupos/invitaciones/${data.invitation.inviteCode}`;
      setInviteLink(link);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copying to clipboard:", err);
    }
  };

  const sendEmailInvite = async () => {
    if (!email.trim()) {
      setError("Ingresa un email válido");
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/groups/${groupId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteeEmail: email,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al enviar invitación");
      }

      setSuccess(`Invitación enviada a ${email}`);
      setEmail("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const shareViaNavigator = async () => {
    if (!inviteLink) return;

    try {
      await navigator.share({
        title: `Únete a ${groupName}`,
        text: `Te invito a unirte al grupo "${groupName}"`,
        url: inviteLink,
      });
    } catch (err) {
      // User cancelled or share not supported
      console.log("Share cancelled or not supported");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card border border-border rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Invitar Miembros</h2>
              <p className="text-sm text-muted-foreground">{groupName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Method selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setInviteMethod("link")}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                inviteMethod === "link"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Enlace de Invitación
            </button>
            <button
              onClick={() => setInviteMethod("email")}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                inviteMethod === "email"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Por Email
            </button>
          </div>

          {/* Link method */}
          {inviteMethod === "link" && (
            <div className="space-y-4">
              {!inviteLink ? (
                <button
                  onClick={generateInviteLink}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-5 h-5" />
                      <span>Generar Enlace</span>
                    </>
                  )}
                </button>
              ) : (
                <>
                  {/* Link display */}
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">
                      Enlace de invitación (válido por 7 días):
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm break-all">
                        {inviteLink}
                      </code>
                      <button
                        onClick={copyToClipboard}
                        className="p-2 hover:bg-background rounded transition-colors flex-shrink-0"
                        title="Copiar"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-green-500">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    {typeof navigator.share !== "undefined" && (
                      <button
                        onClick={shareViaNavigator}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Compartir</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Email method */}
          {inviteMethod === "email" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email del usuario
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className="w-full px-4 py-3 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isSending}
                />
              </div>

              <button
                onClick={sendEmailInvite}
                disabled={isSending || !email.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>Enviar Invitación</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm">
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
