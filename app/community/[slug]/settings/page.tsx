/**
 * Community Settings Page - Configuración de comunidad
 */

"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Trash2, Palette, Image as ImageIcon, Info, Hash, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useCommunity } from "@/hooks/useCommunity";
import { CommunityImageUploader, OwnersManagementPanel } from "@/components/community";

const CATEGORIES = [
  'general',
  'tech',
  'gaming',
  'art',
  'education',
  'music',
  'business',
  'health',
  'science',
  'entertainment'
];

export default function CommunitySettingsPage() {
  const t = useTranslations('community.communities.settings');
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const { community, loading: communityLoading } = useCommunity(slug);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "general",
    type: "public",
    rules: "",
    icon: "",
    iconShape: "circle" as const,
    banner: "",
    bannerShape: "banner" as const,
    primaryColor: "#8B5CF6",
  });

  useEffect(() => {
    if (community) {
      setFormData({
        name: community.name,
        description: community.description,
        category: community.category,
        type: community.type,
        rules: community.rules || "",
        icon: community.icon || "",
        iconShape: (community.iconShape as any) || "circle",
        banner: community.banner || "",
        bannerShape: (community.bannerShape as any) || "banner",
        primaryColor: community.primaryColor,
      });
    }
  }, [community]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/community/communities/${community?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/community/${slug}`);
      } else {
        const error = await response.json();
        alert(error.error || t('errors.updateCommunity'));
      }
    } catch (error) {
      console.error('Error updating community:', error);
      alert(t('errors.updateCommunity'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('deleteConfirm'))) return;

    try {
      const response = await fetch(`/api/community/communities/${community?.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/community');
      } else {
        const error = await response.json();
        alert(error.error || t('errors.deleteCommunity'));
      }
    } catch (error) {
      console.error('Error deleting community:', error);
      alert(t('errors.deleteCommunity'));
    }
  };

  if (communityLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Comunidad no encontrada</h2>
          <Link href="/community">
            <Button>Volver a Community</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (community.memberRole !== 'owner') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground mb-4">Solo el propietario puede editar esta comunidad.</p>
          <Link href={`/community/${slug}`}>
            <Button>Volver a la Comunidad</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/community/${slug}`}>
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
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              <Users className="h-4 w-4 inline mr-1" />
              {t('form.name.label')}
            </label>
            <Input
              id="name"
              placeholder={t('form.name.placeholder')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              maxLength={50}
              className="text-lg"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              <Info className="h-4 w-4 inline mr-1" />
              {t('form.description.label')}
            </label>
            <Textarea
              id="description"
              placeholder={t('form.description.placeholder')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.description.length} / 500
            </p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              {t('form.category.label')}
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={cn(
                "w-full px-3 py-2 rounded-md border border-input bg-background",
                "focus:outline-none focus:ring-2 focus:ring-primary"
              )}
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`form.category.options.${cat}`)}
                </option>
              ))}
            </select>
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
              <option value="public">{t('form.type.options.public')}</option>
              <option value="private">{t('form.type.options.private')}</option>
              <option value="restricted">{t('form.type.options.restricted')}</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              {t(`form.type.hints.${formData.type}`)}
            </p>
          </div>

          {/* Color */}
          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium mb-2">
              <Palette className="h-4 w-4 inline mr-1" />
              {t('form.color.label')}
            </label>
            <div className="flex gap-3 items-center">
              <Input
                id="primaryColor"
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="w-20 h-10"
              />
              <div
                className="flex-1 h-10 rounded-md border border-input"
                style={{ backgroundColor: formData.primaryColor }}
              />
            </div>
          </div>

          {/* Icon Image */}
          <CommunityImageUploader
            label={`${t('form.icon.label')} (${t('form.optional')})`}
            currentImage={formData.icon}
            currentShape={formData.iconShape}
            onImageChange={(url, shape) => setFormData({ ...formData, icon: url, iconShape: shape })}
            placeholder={t('form.icon.placeholder')}
            hint={t('form.icon.hint')}
            type="icon"
          />

          {/* Banner Image */}
          <CommunityImageUploader
            label={`${t('form.banner.label')} (${t('form.optional')})`}
            currentImage={formData.banner}
            currentShape={formData.bannerShape}
            onImageChange={(url, shape) => setFormData({ ...formData, banner: url, bannerShape: shape })}
            placeholder={t('form.banner.placeholder')}
            hint={t('form.banner.hint')}
            type="banner"
          />

          {/* Rules (Optional) */}
          <div>
            <label htmlFor="rules" className="block text-sm font-medium mb-2">
              {t('form.rules.label')} <span className="text-muted-foreground">({t('form.optional')})</span>
            </label>
            <Textarea
              id="rules"
              placeholder={t('form.rules.placeholder')}
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              rows={6}
              maxLength={2000}
            />
          </div>

          {/* Gestión de Propietarios - Solo visible para owner principal */}
          {community?.memberRole === 'owner' && (
            <OwnersManagementPanel
              communityId={community?.id || ''}
              principalOwnerId={community?.owner?.id || ''}
              coOwnerIds={Array.isArray((community as any)?.coOwnerIds) ? (community as any).coOwnerIds : []}
              isCurrentUserPrincipalOwner={true}
            />
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-between pt-4 border-t border-border">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {t('actions.delete')}
            </Button>

            <div className="flex gap-3">
              <Link href={`/community/${slug}`}>
                <Button variant="outline" type="button" disabled={loading}>
                  {t('actions.cancel')}
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading || !formData.name || !formData.description}
                className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    {t('actions.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {t('actions.save')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
