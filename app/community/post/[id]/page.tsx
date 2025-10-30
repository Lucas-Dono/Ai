/**
 * Post Detail Page - Página de detalle de un post con comentarios
 */

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  MoreVertical,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  community?: {
    id: string;
    name: string;
    color: string;
  };
  upvotes: number;
  downvotes: number;
  commentCount: number;
  tags?: string[];
  createdAt: string;
  userVote?: 'upvote' | 'downvote' | null;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  upvotes: number;
  downvotes: number;
  createdAt: string;
  userVote?: 'upvote' | 'downvote' | null;
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [postId]);

  const loadPost = async () => {
    try {
      const response = await fetch(`/api/community/posts/${postId}`);
      const data = await response.json();
      setPost(data.post);
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleVotePost = async (voteType: 'upvote' | 'downvote') => {
    try {
      await fetch(`/api/community/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });
      loadPost();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleVoteComment = async (commentId: string, voteType: 'upvote' | 'downvote') => {
    try {
      await fetch(`/api/community/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });
      loadComments();
    } catch (error) {
      console.error('Error voting comment:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        setNewComment("");
        loadComments();
        loadPost(); // Reload to update comment count
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Post no encontrado</h2>
          <p className="text-muted-foreground mb-4">El post que buscas no existe o fue eliminado.</p>
          <Link href="/community">
            <Button>Volver a Community</Button>
          </Link>
        </div>
      </div>
    );
  }

  const voteScore = post.upvotes - post.downvotes;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/community">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al Feed
            </Button>
          </Link>
        </div>
      </div>

      {/* Post Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-8 mb-6"
        >
          {/* Community Badge */}
          {post.community && (
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: post.community.color }}
              />
              <Link href={`/community/${post.community.id}`}>
                <span className="text-sm font-semibold text-primary hover:underline">
                  {post.community.name}
                </span>
              </Link>
            </div>
          )}

          {/* Author & Time */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {post.author.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold">{post.author.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none mb-6">
            <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center gap-4 pt-4 border-t border-border">
            {/* Voting */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={post.userVote === 'upvote' ? 'default' : 'outline'}
                onClick={() => handleVotePost('upvote')}
                className="gap-2"
              >
                <ThumbsUp className="h-4 w-4" />
                {post.upvotes}
              </Button>
              <Button
                size="sm"
                variant={post.userVote === 'downvote' ? 'default' : 'outline'}
                onClick={() => handleVotePost('downvote')}
                className="gap-2"
              >
                <ThumbsDown className="h-4 w-4" />
                {post.downvotes}
              </Button>
            </div>

            {/* Vote Score */}
            <span className={cn(
              "text-sm font-bold px-3 py-1 rounded-full",
              voteScore > 0 ? "bg-green-500/10 text-green-500" :
              voteScore < 0 ? "bg-red-500/10 text-red-500" :
              "bg-muted text-muted-foreground"
            )}>
              {voteScore > 0 ? '+' : ''}{voteScore}
            </span>

            {/* Comments */}
            <div className="flex items-center gap-2 ml-4">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {post.commentCount} {post.commentCount === 1 ? 'comentario' : 'comentarios'}
              </span>
            </div>

            {/* Share */}
            <Button variant="outline" size="sm" className="gap-2 ml-auto">
              <Share2 className="h-4 w-4" />
              Compartir
            </Button>
          </div>
        </motion.div>

        {/* Comments Section */}
        <div id="comments" className="space-y-6">
          <h2 className="text-2xl font-bold">Comentarios ({comments.length})</h2>

          {/* New Comment Form */}
          <form onSubmit={handleSubmitComment} className="bg-card border border-border rounded-xl p-4">
            <Textarea
              placeholder="Escribe tu comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="mb-3 resize-none"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting || !newComment.trim()} className="gap-2">
                <Send className="h-4 w-4" />
                {submitting ? 'Enviando...' : 'Comentar'}
              </Button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onVote={handleVoteComment}
              />
            ))}

            {comments.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay comentarios todavía. ¡Sé el primero en comentar!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Comment Card Component
function CommentCard({
  comment,
  onVote
}: {
  comment: Comment;
  onVote: (commentId: string, voteType: 'upvote' | 'downvote') => void;
}) {
  const voteScore = comment.upvotes - comment.downvotes;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card border border-border rounded-lg p-4"
    >
      {/* Author & Time */}
      <div className="flex items-center gap-3 mb-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <span className="text-xs font-semibold text-primary">
            {comment.author.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold">{comment.author.name}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-foreground mb-3 whitespace-pre-wrap">{comment.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={comment.userVote === 'upvote' ? 'default' : 'ghost'}
          onClick={() => onVote(comment.id, 'upvote')}
          className="gap-1"
        >
          <ThumbsUp className="h-3 w-3" />
          <span className="text-xs">{comment.upvotes}</span>
        </Button>
        <Button
          size="sm"
          variant={comment.userVote === 'downvote' ? 'default' : 'ghost'}
          onClick={() => onVote(comment.id, 'downvote')}
          className="gap-1"
        >
          <ThumbsDown className="h-3 w-3" />
          <span className="text-xs">{comment.downvotes}</span>
        </Button>
        <span className={cn(
          "text-xs font-semibold ml-2",
          voteScore > 0 ? "text-green-500" :
          voteScore < 0 ? "text-red-500" :
          "text-muted-foreground"
        )}>
          {voteScore > 0 ? '+' : ''}{voteScore}
        </span>
      </div>
    </motion.div>
  );
}
