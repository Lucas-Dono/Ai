/**
 * Create Post Page - Página para crear un nuevo post en la comunidad
 */

"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Tag, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Community {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  primaryColor?: string;
  type: string;
  description?: string;
  memberCount: number;
}

export default function CreatePostPage() {
  const t = useTranslations('community.create');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "discussion",
    tags: "",
    communityId: "",
    isNSFW: false,
  });

  // Cargar comunidades del usuario al montar el componente
  useEffect(() => {
    async function loadCommunities() {
      try {
        const response = await fetch('/api/community/my-communities');
        if (response.ok) {
          const data = await response.json();
          setCommunities(data.communities || []);
        }
      } catch (error) {
        console.error('Error loading communities:', error);
      } finally {
        setLoadingCommunities(false);
      }
    }

    loadCommunities();
  }, []);

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
          type: formData.type,
          tags,
          communityId: formData.communityId || null,
          isNSFW: formData.isNSFW,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Check if user came from the community tour
        const isFromTour = sessionStorage.getItem('community_tour_active') === 'true';

        if (isFromTour) {
          // Mark that the user created a post for the tour validation
          sessionStorage.setItem('returned_from_create', 'true');
        }

        // Always redirect to community page to see the new post
        router.push('/community');
      } else {
        const error = await response.json();
        alert(error.error || t('errors.createPost'));
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert(t('errors.createPost'));
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
                {t('header.back')}
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{t('header.title')}</h1>
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
              {t('form.title.label')}
            </label>
            <Input
              id="title"
              placeholder={t('form.title.placeholder')}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              maxLength={200}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('form.title.charCount', { current: formData.title.length, max: 200 })}
            </p>
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-2">
              {t('form.type.label')}
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className={cn(
                "w-full px-3 py-2 rounded-md border border-input bg-background",
                "focus:outline-none focus:ring-2 focus:ring-primary"
              )}
              required
            >
              <option value="discussion">{t('form.type.options.discussion')}</option>
              <option value="question">{t('form.type.options.question')}</option>
              <option value="showcase">{t('form.type.options.showcase')}</option>
              <option value="help">{t('form.type.options.help')}</option>
              <option value="research">{t('form.type.options.research')}</option>
              <option value="announcement">{t('form.type.options.announcement')}</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              {t('form.type.hint')}
            </p>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              {t('form.content.label')}
            </label>
            <Textarea
              id="content"
              placeholder={t('form.content.placeholder')}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={12}
              maxLength={5000}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('form.content.charCount', { current: formData.content.length, max: 5000 })}
            </p>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              <Tag className="h-4 w-4 inline mr-1" />
              {t('form.tags.label')}
            </label>
            <Input
              id="tags"
              placeholder={t('form.tags.placeholder')}
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('form.tags.hint')}
            </p>
          </div>

          {/* Community Selection (Optional) */}
          <div>
            <label htmlFor="community" className="block text-sm font-medium mb-2">
              <Users className="h-4 w-4 inline mr-1" />
              {t('form.community.label')}
            </label>
            <select
              id="community"
              value={formData.communityId}
              onChange={(e) => setFormData({ ...formData, communityId: e.target.value })}
              className={cn(
                "w-full px-3 py-2 rounded-md border border-input bg-background",
                "focus:outline-none focus:ring-2 focus:ring-primary"
              )}
              disabled={loadingCommunities}
            >
              <option value="">
                {loadingCommunities
                  ? 'Cargando comunidades...'
                  : communities.length === 0
                    ? 'Sin comunidades (Post global)'
                    : t('form.community.placeholder')}
              </option>
              {communities.map((community) => (
                <option key={community.id} value={community.id}>
                  {community.name} ({community.memberCount} miembros)
                </option>
              ))}
            </select>
            {!loadingCommunities && communities.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                No eres miembro de ninguna comunidad. Tu post será global y visible para todos.
              </p>
            )}
            {!loadingCommunities && communities.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Deja en blanco para crear un post global visible para todos.
              </p>
            )}
          </div>

          {/* NSFW Switch */}
          <div className="flex items-start gap-3 p-4 border border-border rounded-2xl bg-background">
            <div className="flex items-center h-6">
              <input
                type="checkbox"
                id="nsfw"
                checked={formData.isNSFW}
                onChange={(e) => setFormData({ ...formData, isNSFW: e.target.checked })}
                className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="nsfw" className="block text-sm font-medium mb-1 cursor-pointer flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Marcar como NSFW (Contenido +18)
              </label>
              <p className="text-xs text-muted-foreground">
                Marca esta opción si tu post contiene contenido para adultos, violencia, lenguaje explícito o temas sensibles.
                El contenido NSFW se mostrará con una advertencia y filtros visuales.
              </p>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-accent/50 border border-border rounded-2xl p-4">
            <h3 className="font-semibold mb-2 text-sm">{t('guidelines.title')}</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• {t('guidelines.rule1')}</li>
              <li>• {t('guidelines.rule2')}</li>
              <li>• {t('guidelines.rule3')}</li>
              <li>• {t('guidelines.rule4')}</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Link href="/community">
              <Button variant="outline" type="button" disabled={loading}>
                {t('actions.cancel')}
              </Button>
            </Link>
            <Button type="submit" disabled={loading || !formData.title || !formData.content}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {t('actions.publishing')}
                </>
              ) : (
                t('actions.publish')
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
