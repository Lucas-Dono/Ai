/**
 * PostCard - Card de post con soporte para diferentes tipos
 */

"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Bookmark,
  Award,
  Pin,
  Sparkles,
  ExternalLink,
  Check,
  MoreVertical,
  EyeOff,
  UserX,
  XCircle,
  Tag as TagIcon,
  Flag,
  Bell,
  BellOff,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { renderMentions } from "@/components/community/MentionInput";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    type: string;
    author: {
      id: string;
      name: string;
      image?: string;
    };
    community?: {
      id: string;
      name: string;
      slug: string;
      primaryColor: string;
    };
    agentId?: string;
    agent?: {
      id: string;
      name: string;
      description: string;
      avatar?: string;
    };
    upvotes: number;
    downvotes: number;
    commentCount: number;
    tags: string[];
    images?: string[];
    isPinned: boolean;
    isFeatured: boolean;
    createdAt: string;
    userVote?: 'upvote' | 'downvote' | null;
    userSaved?: boolean;
    isFollowing?: boolean;
    awards?: Array<{
      type: string;
      count: number;
    }>;
    isNSFW?: boolean;
    isSpoiler?: boolean;
    metadata?: {
      isOC?: boolean;
      flair?: string;
      isSpoiler?: boolean;
      imageMetadata?: Array<{
        url: string;
        isNSFW: boolean;
        isSpoiler: boolean;
      }>;
    };
  };
  onVote: (postId: string, voteType: 'upvote' | 'downvote') => void;
  onSave?: (postId: string) => void;
  compact?: boolean;
}

const POST_TYPE_CONFIG = {
  showcase: { label: 'Showcase', color: 'text-purple-400 bg-purple-500/10', icon: Sparkles },
  discussion: { label: 'Discussion', color: 'text-blue-400 bg-blue-500/10', icon: MessageSquare },
  question: { label: 'Question', color: 'text-orange-400 bg-orange-500/10', icon: MessageSquare },
  guide: { label: 'Guide', color: 'text-green-400 bg-green-500/10', icon: ExternalLink },
  help: { label: 'Help', color: 'text-red-400 bg-red-500/10', icon: MessageSquare },
  research: { label: 'Research', color: 'text-cyan-400 bg-cyan-500/10', icon: ExternalLink },
  announcement: { label: 'Announcement', color: 'text-yellow-400 bg-yellow-500/10', icon: Sparkles },
};

export function PostCard({ post, onVote, onSave, compact = false }: PostCardProps) {
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showFollowToast, setShowFollowToast] = useState(false);
  const [followToastMessage, setFollowToastMessage] = useState('');
  const [followToastType, setFollowToastType] = useState<'success' | 'error'>('success');
  const [showMenu, setShowMenu] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [revealedSpoiler, setRevealedSpoiler] = useState(false);
  const [revealedNSFW, setRevealedNSFW] = useState(false);
  const [revealedImages, setRevealedImages] = useState<Record<number, boolean>>({});
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(post.isFollowing || false);

  const voteScore = post.upvotes - post.downvotes;
  const typeConfig = POST_TYPE_CONFIG[post.type as keyof typeof POST_TYPE_CONFIG] || POST_TYPE_CONFIG.discussion;
  const TypeIcon = typeConfig.icon;

  // Verificar si el post completo es NSFW o Spoiler
  const isPostNSFW = post.isNSFW || false;
  const isPostSpoiler = post.isSpoiler || post.metadata?.isSpoiler || false;

  const handleShare = async () => {
    const url = `${window.location.origin}/community/post/${post.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content.slice(0, 100),
          url,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(url);
      // Mostrar toast en lugar de alert
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 3000);
    }
  };

  const handleHidePost = async () => {
    setIsHiding(true);
    setShowMenu(false);

    try {
      const response = await fetch('/api/user/moderation/hide-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      });

      if (response.ok) {
        // Mostrar feedback y ocultar el post con animación
        alert('Post ocultado. No volverás a verlo en tu feed.');
        window.location.reload(); // Recargar para actualizar el feed
      } else {
        const error = await response.json();
        alert(error.error || 'Error al ocultar post');
      }
    } catch (error) {
      console.error('Error hiding post:', error);
      alert('Error al ocultar post');
    } finally {
      setIsHiding(false);
    }
  };

  const handleBlockUser = async () => {
    if (!confirm(`¿Bloquear a ${post.author.name}? No verás más sus posts ni comentarios.`)) {
      return;
    }

    setShowMenu(false);

    try {
      const response = await fetch('/api/user/moderation/block-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: post.author.id }),
      });

      if (response.ok) {
        alert(`Usuario ${post.author.name} bloqueado correctamente.`);
        window.location.reload(); // Recargar para actualizar el feed
      } else {
        const error = await response.json();
        alert(error.error || 'Error al bloquear usuario');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Error al bloquear usuario');
    }
  };

  const handleNotInterestedType = async () => {
    setShowMenu(false);

    try {
      const response = await fetch('/api/user/moderation/content-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'postType',
          value: post.type,
          action: 'hide',
        }),
      });

      if (response.ok) {
        alert(`No verás más posts de tipo "${typeConfig.label}"`);
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al configurar preferencia');
      }
    } catch (error) {
      console.error('Error setting preference:', error);
      alert('Error al configurar preferencia');
    }
  };

  const handleNotInterestedTag = async (tag: string) => {
    setShowMenu(false);

    try {
      const response = await fetch('/api/user/moderation/content-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tag',
          value: tag,
          action: 'hide',
        }),
      });

      if (response.ok) {
        alert(`No verás más posts con la etiqueta "#${tag}"`);
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al configurar preferencia');
      }
    } catch (error) {
      console.error('Error setting preference:', error);
      alert('Error al configurar preferencia');
    }
  };

  const handleSavePost = async () => {
    setShowMenu(false);

    try {
      const response = await fetch(`/api/community/posts/${post.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        alert('Post guardado correctamente');
      } else {
        const error = await response.json();
        alert(error.error || 'Error al guardar post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error al guardar post');
    }
  };

  const handleReportPost = async () => {
    setShowMenu(false);

    const reason = prompt('¿Por qué deseas reportar este post?\n\nEjemplos:\n- Contenido spam\n- Acoso o bullying\n- Información falsa\n- Contenido inapropiado');

    if (!reason || reason.trim() === '') {
      return;
    }

    try {
      const response = await fetch(`/api/community/posts/${post.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason.trim()
        }),
      });

      if (response.ok) {
        alert('Reporte enviado. Nuestro equipo lo revisará pronto.');
      } else {
        const error = await response.json();
        alert(error.error || 'Error al reportar post');
      }
    } catch (error) {
      console.error('Error reporting post:', error);
      alert('Error al reportar post');
    }
  };

  const handleFollowUser = async () => {
    setShowMenu(false);

    // Actualización optimista
    const previousState = isFollowing;
    setIsFollowing(!isFollowing);

    try {
      const response = await fetch(`/api/community/posts/${post.id}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const message = isFollowing
          ? 'Dejaste de seguir esta publicación'
          : 'Siguiendo publicación - Recibirás notificaciones';
        setFollowToastMessage(message);
        setFollowToastType('success');
        setShowFollowToast(true);
        setTimeout(() => setShowFollowToast(false), 4000);
      } else {
        const error = await response.json();
        setFollowToastMessage(error.error || 'Error al actualizar seguimiento');
        setFollowToastType('error');
        setShowFollowToast(true);
        setTimeout(() => setShowFollowToast(false), 4000);
        // Revertir en caso de error
        setIsFollowing(previousState);
      }
    } catch (error) {
      console.error('Error following post:', error);
      setFollowToastMessage('Error al actualizar seguimiento');
      setFollowToastType('error');
      setShowFollowToast(true);
      setTimeout(() => setShowFollowToast(false), 4000);
      // Revertir en caso de error
      setIsFollowing(previousState);
    }
  };

  return (
    <>
      <motion.div
        data-tour="post-card"
        className={cn(
          "bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-all group relative hover-lift-glow",
          compact && "p-3"
        )}
      >
      {/* Glass effect background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />

      {/* Pinned/Featured/NSFW/Spoiler badges */}
      <div className="absolute top-4 right-4 flex gap-2 flex-wrap justify-end">
        {post.isPinned && (
          <div className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Pin className="h-3 w-3" />
            Pinned
          </div>
        )}
        {post.isFeatured && (
          <div className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Featured
          </div>
        )}
        {isPostNSFW && (
          <div className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <EyeOff className="h-3 w-3" />
            NSFW
          </div>
        )}
        {isPostSpoiler && (
          <div className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <EyeOff className="h-3 w-3" />
            Spoiler
          </div>
        )}
        {isFollowing && (
          <div className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Bell className="h-3 w-3" />
            Siguiendo
          </div>
        )}
      </div>

      <div className="relative">
        {/* Type Badge & Community */}
        <div className="flex items-center gap-3 mb-3">
          <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", typeConfig.color)}>
            <TypeIcon className="h-3 w-3" />
            {typeConfig.label}
          </div>
          {post.community && (
            <Link
              href={`/community/${post.community.slug}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: post.community.primaryColor }}
              />
              <span className="text-xs font-semibold text-foreground/80">
                {post.community.name}
              </span>
            </Link>
          )}
        </div>

        {/* Author & Time */}
        <div className="flex items-center gap-2 mb-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center ring-2 ring-primary/20">
            {post.author.image ? (
              <img src={post.author.image} alt={post.author.name} className="h-full w-full rounded-full object-cover" />
            ) : (
              <span className="text-[10px] font-bold text-primary">
                {post.author.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-foreground">{post.author.name}</p>
            <p className="text-[10px] text-muted-foreground">
              {new Date(post.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>

          {/* More Options Menu */}
          <div className="relative">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="h-7 w-7 p-0 hover:bg-accent cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {/* Dropdown Menu */}
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-lg z-50 overflow-hidden"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleHidePost();
                  }}
                  disabled={isHiding}
                  className="w-full px-4 py-2.5 text-sm text-left hover:bg-accent flex items-center gap-3 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Ocultar post</div>
                    <div className="text-xs text-muted-foreground">No verás esto en tu feed</div>
                  </div>
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleSavePost();
                  }}
                  className="w-full px-4 py-2.5 text-sm text-left hover:bg-accent flex items-center gap-3 transition-colors border-t border-border cursor-pointer"
                >
                  <Bookmark className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Guardar</div>
                    <div className="text-xs text-muted-foreground">Guardar para ver después</div>
                  </div>
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleReportPost();
                  }}
                  className="w-full px-4 py-2.5 text-sm text-left hover:bg-accent flex items-center gap-3 transition-colors border-t border-border cursor-pointer"
                >
                  <Flag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Denunciar</div>
                    <div className="text-xs text-muted-foreground">Reportar contenido inapropiado</div>
                  </div>
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleFollowUser();
                  }}
                  className={cn(
                    "w-full px-4 py-2.5 text-sm text-left hover:bg-accent flex items-center gap-3 transition-colors border-t border-border cursor-pointer",
                    isFollowing && "bg-primary/5"
                  )}
                >
                  {isFollowing ? (
                    <BellOff className="h-4 w-4 text-primary" />
                  ) : (
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <div className={cn("font-medium", isFollowing && "text-primary")}>
                      {isFollowing ? 'Siguiendo' : 'Seguir publicación'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isFollowing
                        ? 'Click para dejar de recibir notificaciones'
                        : 'Recibe notificaciones de nuevos comentarios'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleNotInterestedType();
                  }}
                  className="w-full px-4 py-2.5 text-sm text-left hover:bg-accent flex items-center gap-3 transition-colors border-t border-border cursor-pointer"
                >
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">No me interesa este tipo</div>
                    <div className="text-xs text-muted-foreground">Menos posts tipo {typeConfig.label}</div>
                  </div>
                </button>

                {post.tags && post.tags.length > 0 && post.tags[0] && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleNotInterestedTag(post.tags[0]);
                    }}
                    className="w-full px-4 py-2.5 text-sm text-left hover:bg-accent flex items-center gap-3 transition-colors border-t border-border cursor-pointer"
                  >
                    <TagIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">No me interesa #{post.tags[0]}</div>
                      <div className="text-xs text-muted-foreground">Menos posts con esta etiqueta</div>
                    </div>
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* AI Showcase Preview */}
        {post.type === 'showcase' && post.agent && (
          <Link href={`/agentes/${post.agentId}`}>
            <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20 rounded-xl p-3 mb-3 hover:border-purple-500/40 transition-colors">
              <div className="flex items-center gap-2.5">
                {post.agent.avatar && (
                  <img
                    src={post.agent.avatar}
                    alt={post.agent.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-500/30"
                  />
                )}
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    {post.agent.name}
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {post.agent.description}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 text-xs px-2 py-1 h-7">
                  Try AI
                </Button>
              </div>
            </div>
          </Link>
        )}

        {/* Title & Content */}
        <Link href={`/community/post/${post.id}`}>
          <h3 className={cn(
            "font-bold mb-2 group-hover:text-primary transition-colors",
            compact ? "text-base" : "text-lg"
          )}>
            {post.title}
          </h3>

          {/* Spoiler Content */}
          {isPostSpoiler && !revealedSpoiler ? (
            <div className="mb-3">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <EyeOff className="h-3.5 w-3.5 text-yellow-500" />
                  <span className="text-xs font-bold text-yellow-500 uppercase">Spoiler</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Este contenido contiene spoilers. Haz clic para revelar.
                </p>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    setRevealedSpoiler(true);
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-xs h-7"
                >
                  Mostrar Contenido
                </Button>
              </div>
            </div>
          ) : (
            <p className={cn(
              "text-muted-foreground mb-3",
              compact ? "line-clamp-2 text-xs" : "line-clamp-2 text-sm"
            )}>
              {renderMentions(post.content)}
            </p>
          )}
        </Link>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={cn(
            "mb-3 grid gap-1.5",
            post.images.length === 1 && "grid-cols-1",
            post.images.length === 2 && "grid-cols-2",
            post.images.length === 3 && "grid-cols-3",
            post.images.length >= 4 && "grid-cols-2"
          )}>
            {post.images.slice(0, 4).map((image, index) => {
              // Obtener metadata de la imagen específica
              const imageMetadata = post.metadata?.imageMetadata?.find(img => img.url === image);
              const isImageNSFW = imageMetadata?.isNSFW || isPostNSFW;
              const isImageSpoiler = imageMetadata?.isSpoiler || false;
              const isRevealed = revealedImages[index] || revealedNSFW;

              return (
                <div
                  key={index}
                  className={cn(
                    "relative overflow-hidden rounded-lg border border-border",
                    post.images!.length === 3 && index === 0 && "col-span-3"
                  )}
                >
                  {/* Imagen con blur si es NSFW/Spoiler y no está revelada */}
                  <img
                    src={image}
                    alt={`Imagen ${index + 1} del post`}
                    className={cn(
                      "w-full max-h-[512px] object-cover transition-all cursor-pointer",
                      !isRevealed && isImageNSFW && "blur-2xl",
                      !isRevealed && isImageSpoiler && !isImageNSFW && "blur-md",
                      isRevealed && "hover:scale-105"
                    )}
                    onClick={() => {
                      if (isRevealed) {
                        setLightboxImage(image);
                      }
                    }}
                  />

                  {/* Overlay con botón para revelar NSFW */}
                  {!isRevealed && isImageNSFW && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                      <div className="bg-red-500/90 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
                        <EyeOff className="h-2.5 w-2.5" />
                        NSFW
                      </div>
                      <p className="text-white text-xs font-medium text-center px-3">
                        Contenido para adultos
                      </p>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setRevealedImages(prev => ({ ...prev, [index]: true }));
                        }}
                        className="bg-white/90 hover:bg-white text-black font-semibold text-xs h-7 px-3"
                      >
                        Ver Imagen
                      </Button>
                    </div>
                  )}

                  {/* Overlay con botón para revelar Spoiler */}
                  {!isRevealed && isImageSpoiler && !isImageNSFW && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                      <div className="bg-yellow-500/90 text-black px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
                        <EyeOff className="h-2.5 w-2.5" />
                        Spoiler
                      </div>
                      <p className="text-white text-xs font-medium text-center px-3">
                        Contiene spoilers
                      </p>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setRevealedImages(prev => ({ ...prev, [index]: true }));
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-xs h-7 px-3"
                      >
                        Ver Imagen
                      </Button>
                    </div>
                  )}

                  {/* Badge de estado cuando está revelada */}
                  {isRevealed && (isImageNSFW || isImageSpoiler) && (
                    <div className="absolute top-1.5 left-1.5 flex gap-1.5">
                      {isImageNSFW && (
                        <div className="bg-red-500/90 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                          NSFW
                        </div>
                      )}
                      {isImageSpoiler && (
                        <div className="bg-yellow-500/90 text-black px-1.5 py-0.5 rounded text-[10px] font-bold">
                          SPOILER
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contador de imágenes adicionales */}
                  {post.images!.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-2xl">
                      +{post.images!.length - 4}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, compact ? 2 : 4).map((tag, index) => (
              <Link
                key={index}
                href={`/community?tag=${encodeURIComponent(tag)}`}
                className="px-2 py-0.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-medium rounded-full transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Awards */}
        {post.awards && post.awards.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            {post.awards.map((award, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
              >
                <Award className="h-2.5 w-2.5" />
                {award.count > 1 && <span>x{award.count}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center gap-2">
          {/* Voting */}
          <div className="flex items-center gap-1 bg-background/50 rounded-full p-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                onVote(post.id, 'upvote');
              }}
              className="h-8 w-8 p-0 rounded-full"
            >
              <div className={cn(
                "rounded-full p-1.5",
                post.userVote === 'upvote' && "bg-green-500"
              )}>
                <ThumbsUp
                  className={cn(
                    "h-4 w-4",
                    post.userVote === 'upvote' ? "fill-white text-white" : "fill-none"
                  )}
                />
              </div>
            </Button>
            <span className={cn(
              "text-sm font-bold min-w-[2rem] text-center",
              voteScore > 0 ? "text-green-500" :
              voteScore < 0 ? "text-red-500" :
              "text-muted-foreground"
            )}>
              {voteScore > 0 ? '+' : ''}{voteScore}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                onVote(post.id, 'downvote');
              }}
              className="h-8 w-8 p-0 rounded-full"
            >
              <div className={cn(
                "rounded-full p-1.5",
                post.userVote === 'downvote' && "bg-red-500"
              )}>
                <ThumbsDown
                  className={cn(
                    "h-4 w-4",
                    post.userVote === 'downvote' ? "fill-white text-white" : "fill-none"
                  )}
                />
              </div>
            </Button>
          </div>

          {/* Comments */}
          <Link href={`/community/post/${post.id}#comments`}>
            <Button size="sm" variant="ghost" className="gap-2 h-8">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">{post.commentCount}</span>
            </Button>
          </Link>

          {/* Save */}
          {onSave && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                onSave(post.id);
              }}
              className={cn("h-8 w-8 p-0", post.userSaved && "text-primary")}
            >
              <Bookmark className={cn("h-4 w-4", post.userSaved && "fill-current")} />
            </Button>
          )}

          {/* Share */}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              handleShare();
            }}
            className="h-8 w-8 p-0 ml-auto"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Toast de link copiado */}
      {showCopyToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2"
        >
          <Check className="h-5 w-5" />
          <span className="font-medium">Link copiado al portapapeles</span>
        </motion.div>
      )}

      {/* Toast de follow/unfollow */}
      {showFollowToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={cn(
            "fixed bottom-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2",
            followToastType === 'success'
              ? "bg-blue-500 text-white"
              : "bg-red-500 text-white"
          )}
        >
          {followToastType === 'success' ? (
            <Bell className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
          <span className="font-medium">{followToastMessage}</span>
        </motion.div>
      )}
    </motion.div>

    {/* Image Lightbox - Rendered via Portal */}
    {typeof window !== 'undefined' && lightboxImage && createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-center justify-center p-4"
        onClick={() => setLightboxImage(null)}
      >
        {/* Backdrop difuminado - imagen de fondo */}
        <div
          className="absolute inset-0 bg-black/90"
          style={{
            backgroundImage: `url(${lightboxImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(40px)',
            transform: 'scale(1.1)',
          }}
        />

        {/* Overlay oscuro adicional */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Botón cerrar */}
        <button
          onClick={() => setLightboxImage(null)}
          className="absolute top-4 right-4 z-[1001] p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        {/* Imagen principal */}
        <motion.img
          src={lightboxImage}
          alt="Imagen ampliada"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative z-[1000] h-screen w-screen object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </motion.div>,
      document.body
    )}
    </>
  );
}
