"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface Agent {
  id: string;
  name: string;
  kind: string;
  personality?: string;
  purpose?: string;
  tone?: string;
  description?: string;
  profile: any;
}

export default function EditAgentPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"companion" | "assistant">("companion");
  const [personality, setPersonality] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const res = await fetch(`/api/agents/${agentId}`);
        if (res.ok) {
          const data = await res.json();
          setAgent(data);
          setName(data.name || "");
          setKind(data.kind || "companion");
          setPersonality(data.personality || "");
          setPurpose(data.purpose || "");
          setTone(data.tone || "");
          setDescription(data.description || "");
        } else {
          setError("No se pudo cargar la IA");
        }
      } catch (err) {
        console.error("Error fetching agent:", err);
        setError("Error al cargar la IA");
      } finally {
        setLoading(false);
      }
    };

    if (agentId) {
      fetchAgent();
    }
  }, [agentId]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("El nombre es requerido");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          kind,
          personality: personality.trim(),
          purpose: purpose.trim(),
          tone: tone.trim(),
          description: description.trim(),
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const error = await res.json();
        alert(error.error || "Error al guardar los cambios");
      }
    } catch (err) {
      console.error("Error saving agent:", err);
      alert("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || "IA no encontrada"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Editar IA</h1>
        <p className="text-muted-foreground">
          Modifica los detalles de tu inteligencia artificial
        </p>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la IA</CardTitle>
          <CardDescription>
            Actualiza los campos que desees modificar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la IA"
              required
            />
          </div>

          {/* Kind */}
          <div className="space-y-2">
            <Label htmlFor="kind">Tipo *</Label>
            <Select value={kind} onValueChange={(value: "companion" | "assistant") => setKind(value)}>
              <SelectTrigger id="kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="companion">Compañero (Emocional)</SelectItem>
                <SelectItem value="assistant">Asistente (Administrativo)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Personality */}
          <div className="space-y-2">
            <Label htmlFor="personality">Personalidad</Label>
            <Textarea
              id="personality"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="Describe la personalidad de la IA"
              rows={3}
            />
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Propósito</Label>
            <Textarea
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="¿Cuál es el propósito principal de esta IA?"
              rows={3}
            />
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <Label htmlFor="tone">Tono de Comunicación</Label>
            <Input
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="Ej: Amigable, Profesional, Casual"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción adicional de la IA"
              rows={4}
            />
          </div>

          {/* Profile (Read-only) */}
          <div className="space-y-2">
            <Label>Perfil Generado (Solo lectura)</Label>
            <div className="p-4 bg-muted rounded-lg">
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(agent.profile, null, 2)}
              </pre>
            </div>
            <p className="text-xs text-muted-foreground">
              El perfil es generado automáticamente por Gemini y no se puede editar directamente
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">
                Cancelar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
