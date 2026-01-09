/**
 * CommentThread - Thread de comentarios anidados estilo Reddit
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  MoreVertical,
  Reply,
  CheckCircle,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ImageUploader } from "@/components/community/ImageUploader";

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  parentId?: string;
  upvotes: number;
  downvotes: number;
  score: number;
  isEdited: boolean;
  isDeleted: boolean;
  isAcceptedAnswer?: boolean;
  createdAt: string;
  userVote?: 'upvote' | 'downvote' | null;
  replies?: Comment[];
  images?: string[];
}

interface CommentThreadProps {
  comments: Comment[];
  onVote: (commentId: string, voteType: 'upvote' | 'downvote') => void;
  onReply: (parentId: string, content: string, images?: string[]) => Promise<void>;
  onReport?: (commentId: string) => void;
  depth?: number;
  maxDepth?: number;
}

export function CommentThread({
  comments,
  onVote,
  onReply,
  onReport,
  depth = 0,
  maxDepth = 5,
}: CommentThreadProps) {
  return (
    <div className={cn("space-y-3", depth > 0 && "ml-6 mt-3 border-l-2 border-border/50 pl-4")}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onVote={onVote}
          onReply={onReply}
          onReport={onReport}
          depth={depth}
          maxDepth={maxDepth}
        />
      ))}
    </div>
  );
}

function CommentItem({
  comment,
  onVote,
  onReply,
  onReport,
  depth,
  maxDepth,
}: {
  comment: Comment;
  onVote: (commentId: string, voteType: 'upvote' | 'downvote') => void;
  onReply: (parentId: string, content: string, images?: string[]) => Promise<void>;
  onReport?: (commentId: string) => void;
  depth: number;
  maxDepth: number;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyImages, setReplyImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    try {
      setSubmitting(true);
      await onReply(comment.id, replyContent, replyImages);
      setReplyContent("");
      setReplyImages([]);
      setShowReplyForm(false);
    } catch (err) {
      console.error('Error replying:', err);
      alert('Error al responder');
    } finally {
      setSubmitting(false);
    }
  };

  if (comment.isDeleted) {
    return (
      <div className="bg-muted/30 rounded-2xl p-3 text-sm text-muted-foreground italic">
        [Comentario eliminado]
      </div>
    );
  }

  const voteScore = comment.upvotes - comment.downvotes;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Main Comment */}
      <div className={cn(
        "bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 hover:border-primary/20 transition-all",
        comment.isAcceptedAnswer && "border-green-500/50 bg-green-500/5"
      )}>
        {/* Accepted Answer Badge */}
        {comment.isAcceptedAnswer && (
          <div className="flex items-center gap-2 mb-3 text-green-500">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-semibold">Respuesta Aceptada</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center ring-1 ring-primary/20 hover:ring-primary/40 transition-all shrink-0"
          >
            {comment.author.image ? (
              <img
                src={comment.author.image}
                alt={comment.author.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-[10px] font-bold text-primary">
                {comment.author.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground truncate">
                {comment.author.name}
              </p>
              {comment.isEdited && (
                <span className="text-xs text-muted-foreground">(editado)</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </div>

        {/* Content */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm text-foreground mb-3 whitespace-pre-wrap">
                {comment.content}
              </p>

              {/* Images */}
              {comment.images && comment.images.length > 0 && (
                <div className={cn(
                  "mb-3 grid gap-2",
                  comment.images.length === 1 && "grid-cols-1",
                  comment.images.length === 2 && "grid-cols-2",
                  comment.images.length >= 3 && "grid-cols-2"
                )}>
                  {comment.images.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative overflow-hidden rounded-lg border border-border">
                      <img
                        src={image}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-32 object-cover hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(image, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1">
                {/* Voting */}
                <div className="flex items-center gap-1 bg-background/50 rounded-full p-0.5">
                  <Button
                    size="sm"
                    variant={comment.userVote === 'upvote' ? 'default' : 'ghost'}
                    onClick={() => onVote(comment.id, 'upvote')}
                    className={cn(
                      "h-6 w-6 p-0 rounded-full",
                      comment.userVote === 'upvote' && "bg-green-500 hover:bg-green-600"
                    )}
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                  <span className={cn(
                    "text-xs font-bold min-w-[1.5rem] text-center",
                    voteScore > 0 ? "text-green-500" :
                    voteScore < 0 ? "text-red-500" :
                    "text-muted-foreground"
                  )}>
                    {voteScore > 0 ? '+' : ''}{voteScore}
                  </span>
                  <Button
                    size="sm"
                    variant={comment.userVote === 'downvote' ? 'default' : 'ghost'}
                    onClick={() => onVote(comment.id, 'downvote')}
                    className={cn(
                      "h-6 w-6 p-0 rounded-full",
                      comment.userVote === 'downvote' && "bg-red-500 hover:bg-red-600"
                    )}
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                </div>

                {/* Reply Button */}
                {depth < maxDepth && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="gap-1 h-6 text-xs ml-2"
                  >
                    <Reply className="h-3 w-3" />
                    Responder
                  </Button>
                )}

                {/* Report */}
                {onReport && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onReport(comment.id)}
                    className="gap-1 h-6 text-xs ml-auto"
                  >
                    <Flag className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Reply Form */}
              <AnimatePresence>
                {showReplyForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="bg-background/50 rounded-2xl p-3 border border-border/50 space-y-3">
                      <Textarea
                        placeholder="Escribe tu respuesta..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={3}
                        className="resize-none text-sm"
                      />

                      <ImageUploader
                        images={replyImages}
                        onImagesChange={setReplyImages}
                        maxImages={4}
                        maxSizeMB={5}
                      />

                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowReplyForm(false);
                            setReplyImages([]);
                          }}
                          disabled={submitting}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleReply}
                          disabled={submitting || !replyContent.trim()}
                        >
                          {submitting ? 'Enviando...' : 'Responder'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse indicator */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="text-xs text-primary hover:underline"
          >
            {comment.replies && comment.replies.length > 0
              ? `Ver ${comment.replies.length + 1} respuesta${comment.replies.length > 0 ? 's' : ''}`
              : 'Ver comentario'}
          </button>
        )}
      </div>

      {/* Nested Replies */}
      {!collapsed && comment.replies && comment.replies.length > 0 && (
        <CommentThread
          comments={comment.replies}
          onVote={onVote}
          onReply={onReply}
          onReport={onReport}
          depth={depth + 1}
          maxDepth={maxDepth}
        />
      )}
    </motion.div>
  );
}
