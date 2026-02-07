/**
 * ShareModal - Modal para compartir creaciones con la comunidad
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  Globe,
  Lock,
  Tag,
  FileText,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: 'character' | 'prompt' | 'theme';
  itemId: string;
  itemName: string;
  onSuccess?: () => void;
}

export function ShareModal({
  open,
  onOpenChange,
  itemType,
  itemId,
  itemName,
  onSuccess,
}: ShareModalProps) {
  const [visibility, setVisibility] = useState<'public' | 'unlisted'>('public');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  const categories = {
    character: ['anime', 'realistic', 'fantasy', 'sci-fi', 'historical', 'gaming'],
    prompt: ['personality', 'roleplay', 'assistant', 'creative', 'educational'],
    theme: ['dark', 'light', 'colorful', 'minimal', 'anime', 'nature'],
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 10) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleShare = async () => {
    if (!category) return;

    try {
      setSharing(true);

      const endpoint = itemType === 'character'
        ? '/api/community/marketplace/characters'
        : itemType === 'prompt'
        ? '/api/community/marketplace/prompts'
        : '/api/marketplace/themes';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: itemId,
          visibility,
          category,
          description,
          tags,
        }),
      });

      if (response.ok) {
        setShared(true);
        setTimeout(() => {
          onOpenChange(false);
          onSuccess?.();
          // Reset form
          setVisibility('public');
          setCategory('');
          setDescription('');
          setTags([]);
          setShared(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setSharing(false);
    }
  };

  const itemTypeLabels = {
    character: 'Personaje',
    prompt: 'Prompt',
    theme: 'Tema',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartir {itemTypeLabels[itemType]}
          </DialogTitle>
          <DialogDescription>
            Comparte tu {itemTypeLabels[itemType].toLowerCase()} con la comunidad
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Item Preview */}
          <div className="bg-accent/50 border border-border rounded-2xl p-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Compartiendo:
            </p>
            <p className="font-bold text-lg">{itemName}</p>
          </div>

          {/* Visibility */}
          <div className="space-y-3">
            <Label>Visibilidad</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setVisibility('public')}
                className={cn(
                  "flex items-center gap-3 p-4 border-2 rounded-2xl transition-all",
                  visibility === 'public'
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Globe className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-semibold text-sm">Público</p>
                  <p className="text-xs text-muted-foreground">
                    Visible para todos
                  </p>
                </div>
              </button>
              <button
                onClick={() => setVisibility('unlisted')}
                className={cn(
                  "flex items-center gap-3 p-4 border-2 rounded-2xl transition-all",
                  visibility === 'unlisted'
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Lock className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-semibold text-sm">No listado</p>
                  <p className="text-xs text-muted-foreground">
                    Solo con enlace
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories[itemType].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción para la comunidad</Label>
            <Textarea
              id="description"
              placeholder="Describe tu creación para ayudar a otros a entenderla..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">
              Tags <span className="text-xs text-muted-foreground">(máximo 10)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Agregar tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                disabled={tags.length >= 10}
              />
              <Button
                onClick={handleAddTag}
                variant="outline"
                disabled={!tagInput.trim() || tags.length >= 10}
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    #{tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sharing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleShare}
            disabled={!category || sharing || shared}
            className="gap-2"
          >
            <AnimatePresence mode="wait">
              {sharing ? (
                <motion.div
                  key="sharing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Compartiendo...
                </motion.div>
              ) : shared ? (
                <motion.div
                  key="shared"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Compartido
                </motion.div>
              ) : (
                <motion.div
                  key="share"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Compartir
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
