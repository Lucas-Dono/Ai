"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Mail, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al procesar la solicitud");
        setLoading(false);
        return;
      }

      setSuccess(true);
      if (data.resetUrl) {
        setDevResetUrl(data.resetUrl);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error al procesar la solicitud. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-secondary/5 to-transparent rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-2">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-2">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold mb-2">
              ¿Olvidaste tu contraseña?
            </CardTitle>
            <CardDescription className="text-base">
              Ingresa tu email y te enviaremos instrucciones para restablecerla
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                  Si el email existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.
                </p>
                {devResetUrl && (
                  <div className="mt-2 p-2 bg-muted rounded text-xs">
                    <p className="font-semibold mb-1">Modo desarrollo - Link de reset:</p>
                    <Link 
                      href={devResetUrl.replace(window.location.origin, "")} 
                      className="text-primary hover:underline break-all"
                    >
                      Restablecer contraseña
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar instrucciones
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <Link 
              href="/login" 
              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Volver al inicio de sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
