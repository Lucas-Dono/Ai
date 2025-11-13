/**
 * Post Detail Page - Página de detalle de un post con comentarios
 */

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  MoreVertical,
  Send,
  Edit2,
  Trash2,
  X,
  Check,
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
  authorId: string;
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
  isEdited?: boolean;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  authorId: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  userVote?: 'upvote' | 'downvote' | null;
  isEdited?: boolean;
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [editingPost, setEditingPost] = useState(false);
  const [editedPostContent, setEditedPostContent] = useState("");
  const [editedPostTitle, setEditedPostTitle] = useState("");

  useEffect(() => {
    loadPost();
    loadComments();
  }, [postId]);

  // Close post menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showPostMenu) {
        setShowPostMenu(false);
      }
    };

    if (showPostMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showPostMenu]);

  const loadPost = async () => {
    try {
      const response = await fetch(`/api/community/posts/${postId}`);
      if (!response.ok) {
        throw new Error('Post not found');
      }
      const data = await response.json();
      setPost(data);
    } catch (error) {
      console.error('Error loading post:', error);
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/community/comments?postId=${postId}`);
      if (!response.ok) {
        throw new Error('Failed to load comments');
      }
      const data = await response.json();
      setComments(data || []);
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
      const response = await fetch(`/api/community/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          postId: postId,
        }),
      });

      if (response.ok) {
        setNewComment("");
        loadComments();
        loadPost(); // Reload to update comment count
      } else {
        const error = await response.json();
        alert(error.error || 'Error al crear comentario');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Error al crear comentario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPost = () => {
    if (post) {
      setEditedPostTitle(post.title);
      setEditedPostContent(post.content);
      setEditingPost(true);
      setShowPostMenu(false);
    }
  };

  const handleSavePostEdit = async () => {
    if (!editedPostTitle.trim() || !editedPostContent.trim()) return;

    try {
      const response = await fetch(`/api/community/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedPostTitle,
          content: editedPostContent,
        }),
      });

      if (response.ok) {
        setEditingPost(false);
        loadPost();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al editar post');
      }
    } catch (error) {
      console.error('Error editing post:', error);
      alert('Error al editar post');
    }
  };

  const handleCancelPostEdit = () => {
    setEditingPost(false);
    setEditedPostTitle("");
    setEditedPostContent("");
  };

  const handleDeletePost = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/community/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.href = '/community';
      } else {
        const error = await response.json();
        alert(error.error || 'Error al eliminar post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error al eliminar post');
    }
  };

  const handleEditComment = async (commentId: string, newContent: string) => {
    try {
      const response = await fetch(`/api/community/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });

      if (response.ok) {
        loadComments();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al editar comentario');
      }
    } catch (error) {
      console.error('Error editing comment:', error);
      alert('Error al editar comentario');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      const response = await fetch(`/api/community/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadComments();
        loadPost(); // Update comment count
      } else {
        const error = await response.json();
        alert(error.error || 'Error al eliminar comentario');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error al eliminar comentario');
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
          className="bg-card border border-border rounded-2xl p-8 mb-6"
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
            {/* Solo mostrar menú si el usuario es el autor */}
            {currentUserId && currentUserId === post.authorId && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPostMenu(!showPostMenu);
                  }}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>

                {/* Dropdown Menu */}
                {showPostMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-lg z-50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={handleEditPost}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      Editar post
                    </button>
                    <button
                      onClick={handleDeletePost}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-accent text-red-500 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar post
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Title & Content - Edit Mode or Display Mode */}
          {editingPost ? (
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium mb-2">
                  Título
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={editedPostTitle}
                  onChange={(e) => setEditedPostTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={200}
                />
              </div>
              <div>
                <label htmlFor="edit-content" className="block text-sm font-medium mb-2">
                  Contenido
                </label>
                <Textarea
                  id="edit-content"
                  value={editedPostContent}
                  onChange={(e) => setEditedPostContent(e.target.value)}
                  rows={12}
                  className="resize-none"
                  maxLength={5000}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancelPostEdit}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSavePostEdit}
                  disabled={!editedPostTitle.trim() || !editedPostContent.trim()}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  Guardar cambios
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Title */}
              <div className="mb-4">
                <h1 className="text-3xl font-bold">{post.title}</h1>
                {post.isEdited && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    (editado)
                  </p>
                )}
              </div>

              {/* Content */}
              <div className="prose prose-neutral dark:prose-invert max-w-none mb-6">
                <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
              </div>
            </>
          )}

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
          <form onSubmit={handleSubmitComment} className="bg-card border border-border rounded-2xl p-4">
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
                currentUserId={currentUserId}
                onVote={handleVoteComment}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
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
  currentUserId,
  onVote,
  onEdit,
  onDelete,
}: {
  comment: Comment;
  currentUserId?: string;
  onVote: (commentId: string, voteType: 'upvote' | 'downvote') => void;
  onEdit: (commentId: string, newContent: string) => void;
  onDelete: (commentId: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const voteScore = comment.upvotes - comment.downvotes;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showMenu) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  const handleSaveEdit = () => {
    if (editedContent.trim()) {
      onEdit(comment.id, editedContent);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card border border-border rounded-2xl p-4"
    >
      {/* Author & Time & Menu */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
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

        {/* Menu Button - Solo mostrar si el usuario es el autor */}
        {currentUserId && currentUserId === comment.authorId && (
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
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
                className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-2xl shadow-lg z-50 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2 transition-colors"
                >
                  <Edit2 className="h-3 w-3" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(comment.id);
                  }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-accent text-red-500 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Eliminar
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Content - Edit Mode or Display Mode */}
      {isEditing ? (
        <div className="space-y-3 mb-3">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={3}
            className="resize-none text-sm"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              className="gap-1"
            >
              <X className="h-3 w-3" />
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={!editedContent.trim()}
              className="gap-1"
            >
              <Check className="h-3 w-3" />
              Guardar
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-3">
          <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
          {comment.isEdited && (
            <p className="text-xs text-muted-foreground mt-1 italic">
              (editado)
            </p>
          )}
        </div>
      )}

      {/* Voting Actions */}
      {!isEditing && (
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
      )}
    </motion.div>
  );
}
