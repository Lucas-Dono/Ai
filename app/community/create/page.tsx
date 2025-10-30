/**
 * Create Post Page - Página para crear un nuevo post en la comunidad
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Tag, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CreatePostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    communityId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          tags,
          communityId: formData.communityId || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/community/post/${data.post.id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Error al crear el post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error al crear el post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/community">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Crear Nuevo Post</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Título del Post
            </label>
            <Input
              id="title"
              placeholder="¿De qué quieres hablar?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              maxLength={200}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.title.length}/200 caracteres
            </p>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Contenido
            </label>
            <Textarea
              id="content"
              placeholder="Comparte tus pensamientos, experiencias o preguntas..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={12}
              maxLength={5000}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.content.length}/5000 caracteres
            </p>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              <Tag className="h-4 w-4 inline mr-1" />
              Tags (opcional)
            </label>
            <Input
              id="tags"
              placeholder="ia, tecnología, tutorial (separados por comas)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ayuda a otros a encontrar tu post. Máximo 5 tags.
            </p>
          </div>

          {/* Community Selection (Optional) */}
          <div>
            <label htmlFor="community" className="block text-sm font-medium mb-2">
              <Users className="h-4 w-4 inline mr-1" />
              Comunidad (opcional)
            </label>
            <select
              id="community"
              value={formData.communityId}
              onChange={(e) => setFormData({ ...formData, communityId: e.target.value })}
              className={cn(
                "w-full px-3 py-2 rounded-md border border-input bg-background",
                "focus:outline-none focus:ring-2 focus:ring-primary"
              )}
            >
              <option value="">Sin comunidad específica</option>
              {/* TODO: Load communities from API */}
            </select>
          </div>

          {/* Guidelines */}
          <div className="bg-accent/50 border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-sm">Pautas de la Comunidad</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Sé respetuoso con los demás miembros</li>
              <li>• No compartas contenido ofensivo o spam</li>
              <li>• Usa tags relevantes para tu contenido</li>
              <li>• Responde a los comentarios de manera constructiva</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Link href="/community">
              <Button variant="outline" type="button" disabled={loading}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading || !formData.title || !formData.content}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Publicando...
                </>
              ) : (
                'Publicar Post'
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
