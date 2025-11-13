/**
 * PostCard - Card de post con soporte para diferentes tipos
 */

"use client";

import { motion } from "framer-motion";
import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
    isPinned: boolean;
    isFeatured: boolean;
    createdAt: string;
    userVote?: 'upvote' | 'downvote' | null;
    userSaved?: boolean;
    awards?: Array<{
      type: string;
      count: number;
    }>;
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
  const [showMenu, setShowMenu] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const voteScore = post.upvotes - post.downvotes;
  const typeConfig = POST_TYPE_CONFIG[post.type as keyof typeof POST_TYPE_CONFIG] || POST_TYPE_CONFIG.discussion;
  const TypeIcon = typeConfig.icon;

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

  return (
    <motion.div
      data-tour="post-card"
      className={cn(
        "bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all group relative overflow-hidden hover-lift-glow",
        compact && "p-4"
      )}
    >
      {/* Glass effect background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Pinned/Featured badges */}
      <div className="absolute top-4 right-4 flex gap-2">
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
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center ring-2 ring-primary/20">
            {post.author.image ? (
              <img src={post.author.image} alt={post.author.name} className="h-full w-full rounded-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-primary">
                {post.author.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{post.author.name}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(post.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* AI Showcase Preview */}
        {post.type === 'showcase' && post.agent && (
          <Link href={`/agentes/${post.agentId}`}>
            <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20 rounded-2xl p-4 mb-4 hover:border-purple-500/40 transition-colors">
              <div className="flex items-center gap-3">
                {post.agent.avatar && (
                  <img
                    src={post.agent.avatar}
                    alt={post.agent.name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-purple-500/30"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    {post.agent.name}
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {post.agent.description}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0">
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
            compact ? "text-lg" : "text-xl"
          )}>
            {post.title}
          </h3>
          <p className={cn(
            "text-muted-foreground mb-4",
            compact ? "line-clamp-2 text-sm" : "line-clamp-3"
          )}>
            {post.content}
          </p>
        </Link>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, compact ? 2 : 5).map((tag, index) => (
              <Link
                key={index}
                href={`/community?tag=${encodeURIComponent(tag)}`}
                className="px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded-full transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Awards */}
        {post.awards && post.awards.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {post.awards.map((award, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full text-xs font-semibold"
              >
                <Award className="h-3 w-3" />
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
              variant={post.userVote === 'upvote' ? 'default' : 'ghost'}
              onClick={(e) => {
                e.preventDefault();
                onVote(post.id, 'upvote');
              }}
              className={cn(
                "h-8 w-8 p-0 rounded-full",
                post.userVote === 'upvote' && "bg-green-500 hover:bg-green-600"
              )}
            >
              <ThumbsUp className="h-4 w-4" />
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
              variant={post.userVote === 'downvote' ? 'default' : 'ghost'}
              onClick={(e) => {
                e.preventDefault();
                onVote(post.id, 'downvote');
              }}
              className={cn(
                "h-8 w-8 p-0 rounded-full",
                post.userVote === 'downvote' && "bg-red-500 hover:bg-red-600"
              )}
            >
              <ThumbsDown className="h-4 w-4" />
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
              className="h-8 w-8 p-0"
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
                  className="w-full px-4 py-2.5 text-sm text-left hover:bg-accent flex items-center gap-3 transition-colors disabled:opacity-50"
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
                    handleBlockUser();
                  }}
                  className="w-full px-4 py-2.5 text-sm text-left hover:bg-accent flex items-center gap-3 transition-colors border-t border-border"
                >
                  <UserX className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Bloquear a {post.author.name}</div>
                    <div className="text-xs text-muted-foreground">No verás su contenido</div>
                  </div>
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleNotInterestedType();
                  }}
                  className="w-full px-4 py-2.5 text-sm text-left hover:bg-accent flex items-center gap-3 transition-colors border-t border-border"
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
                    className="w-full px-4 py-2.5 text-sm text-left hover:bg-accent flex items-center gap-3 transition-colors border-t border-border"
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
    </motion.div>
  );
}
