/**
 * Create Community Page - Página para crear una nueva comunidad
 */

"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Hash, Info, Image as ImageIcon, Palette, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { CommunityImageUploader } from "@/components/community/CommunityImageUploader";
import { useShakeOnError } from "@/hooks/useShake";

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

export default function CreateCommunityPage() {
  const t = useTranslations('community.communities.create');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { shakeClass } = useShakeOnError(!!error);
  const [iconPending, setIconPending] = useState(false);
  const [bannerPending, setBannerPending] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch('/api/community/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/community/${data.slug}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || t('errors.createCommunity'));
      }
    } catch (err) {
      console.error('Error creating community:', err);
      setError(t('errors.createCommunity'));
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
          {/* Error Message */}
          {error && (
            <div className={`p-3 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-2 ${shakeClass}`}>
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Warning for pending images */}
          {(iconPending || bannerPending) && (
            <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-600 dark:text-yellow-500">
                {iconPending && bannerPending
                  ? "Debes confirmar el recorte del ícono y el banner antes de crear la comunidad"
                  : iconPending
                  ? "Debes confirmar el recorte del ícono antes de crear la comunidad"
                  : "Debes confirmar el recorte del banner antes de crear la comunidad"}
              </p>
            </div>
          )}

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
              onChange={(e) => handleNameChange(e.target.value)}
              required
              maxLength={50}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('form.name.hint')}
            </p>
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-2">
              <Hash className="h-4 w-4 inline mr-1" />
              {t('form.slug.label')}
            </label>
            <Input
              id="slug"
              placeholder={t('form.slug.placeholder')}
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              maxLength={50}
              pattern="[a-z0-9\-]+"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('form.slug.hint')} <span className="font-mono">blaniel.com/community/{formData.slug || 'tu-comunidad'}</span>
            </p>
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
            onImageChange={(url, shape) => setFormData({ ...formData, icon: url, iconShape: shape as "circle" })}
            onPendingChange={setIconPending}
            placeholder={t('form.icon.placeholder')}
            hint={t('form.icon.hint')}
            type="icon"
          />

          {/* Banner Image */}
          <CommunityImageUploader
            label={`${t('form.banner.label')} (${t('form.optional')})`}
            currentImage={formData.banner}
            currentShape={formData.bannerShape}
            onImageChange={(url, shape) => setFormData({ ...formData, banner: url, bannerShape: shape as "banner" })}
            onPendingChange={setBannerPending}
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

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Link href="/community">
              <Button variant="outline" type="button" disabled={loading}>
                {t('actions.cancel')}
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.slug || !formData.description || iconPending || bannerPending}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {t('actions.creating')}
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  {t('actions.create')}
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
