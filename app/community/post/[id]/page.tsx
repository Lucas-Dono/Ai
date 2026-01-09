/**
 * Post Detail Page - Página de detalle de un post con comentarios
 */

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
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
  Image as ImageIcon,
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
  images?: string[];
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
  const [newCommentImages, setNewCommentImages] = useState<string[]>([]);
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

      console.log('📦 Comentarios recibidos del servidor (ya organizados en árbol):', data);

      // El servidor ya devuelve los comentarios organizados en árbol
      // Solo necesitamos usarlos directamente
      const comments = Array.isArray(data) ? data : (data.comments || []);

      console.log('🌳 Comentarios procesados:', comments.length, 'comentarios raíz');
      console.log('📊 Estructura completa:', JSON.stringify(comments, null, 2));

      setComments(comments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleVotePost = async (voteType: 'upvote' | 'downvote') => {
    if (!post) return;

    // Guardar estado original para revertir si falla
    const originalPost = post;

    // Calcular nuevos valores
    const wasUpvote = post.userVote === 'upvote';
    const wasDownvote = post.userVote === 'downvote';
    const isUpvote = voteType === 'upvote';

    let newUpvotes = post.upvotes;
    let newDownvotes = post.downvotes;

    // Remover voto anterior
    if (wasUpvote) newUpvotes--;
    if (wasDownvote) newDownvotes--;

    // Si es el mismo voto, toggle (remover)
    if (post.userVote === voteType) {
      console.log('🔄 [handleVotePost] Toggle - Removiendo voto');
      setPost({ ...post, upvotes: newUpvotes, downvotes: newDownvotes, userVote: null });
    } else {
      // Agregar nuevo voto
      if (isUpvote) {
        newUpvotes++;
      } else {
        newDownvotes++;
      }
      console.log('✅ [handleVotePost] Nuevo voto aplicado:', { voteType, newUpvotes, newDownvotes });
      setPost({ ...post, upvotes: newUpvotes, downvotes: newDownvotes, userVote: voteType });
    }

    // Luego llamar a la API
    try {
      const response = await fetch(`/api/community/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });

      if (!response.ok) {
        // Revertir si falla
        console.error('❌ [handleVotePost] API falló, revirtiendo...');
        setPost(originalPost);
      }
    } catch (error) {
      console.error('Error voting:', error);
      // Revertir en caso de error
      setPost(originalPost);
    }
  };

  const handleVoteComment = async (commentId: string, voteType: 'upvote' | 'downvote') => {
    // Actualización optimista - Actualizar localmente ANTES de la petición
    const updateComment = (commentToUpdate: Comment): Comment => {
      if (commentToUpdate.id === commentId) {
        const wasUpvote = commentToUpdate.userVote === 'upvote';
        const wasDownvote = commentToUpdate.userVote === 'downvote';
        const isUpvote = voteType === 'upvote';

        let newUpvotes = commentToUpdate.upvotes;
        let newDownvotes = commentToUpdate.downvotes;

        // Remover voto anterior
        if (wasUpvote) newUpvotes--;
        if (wasDownvote) newDownvotes--;

        // Si es el mismo voto, toggle (remover)
        if (commentToUpdate.userVote === voteType) {
          console.log('🔄 [handleVoteComment] Toggle - Removiendo voto');
          return { ...commentToUpdate, upvotes: newUpvotes, downvotes: newDownvotes, userVote: null };
        }

        // Agregar nuevo voto
        if (isUpvote) {
          newUpvotes++;
        } else {
          newDownvotes++;
        }

        console.log('✅ [handleVoteComment] Nuevo voto aplicado:', { voteType, newUpvotes, newDownvotes });
        return { ...commentToUpdate, upvotes: newUpvotes, downvotes: newDownvotes, userVote: voteType };
      }

      return commentToUpdate;
    };

    const previousComments = comments;
    setComments(comments.map(updateComment));

    try {
      const response = await fetch(`/api/community/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });

      if (!response.ok) {
        // Revertir si falla
        console.error('❌ [handleVoteComment] API falló, revirtiendo...');
        setComments(previousComments);
      }
    } catch (error) {
      console.error('Error voting comment:', error);
      // Revertir en caso de error
      setComments(previousComments);
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
          images: newCommentImages,
        }),
      });

      if (response.ok) {
        setNewComment("");
        setNewCommentImages([]);
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
                variant="outline"
                onClick={() => handleVotePost('upvote')}
                className="gap-2"
              >
                <div className={cn(
                  "rounded-full p-1",
                  post.userVote === 'upvote' && "bg-green-500"
                )}>
                  <ThumbsUp
                    className={cn(
                      "h-4 w-4",
                      post.userVote === 'upvote' ? "fill-white text-white" : "fill-none"
                    )}
                  />
                </div>
                <span>{post.upvotes}</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleVotePost('downvote')}
                className="gap-2"
              >
                <div className={cn(
                  "rounded-full p-1",
                  post.userVote === 'downvote' && "bg-red-500"
                )}>
                  <ThumbsDown
                    className={cn(
                      "h-4 w-4",
                      post.userVote === 'downvote' ? "fill-white text-white" : "fill-none"
                    )}
                  />
                </div>
                <span>{post.downvotes}</span>
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
        <div id="comments" className="space-y-4">
          {/* New Comment Form - Estilo Reddit */}
          <form onSubmit={handleSubmitComment} className="bg-card border-2 border-border rounded-xl px-3 py-2">
            <Textarea
              placeholder="¿Qué opinas?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
              className="resize-none border-0 bg-transparent focus:ring-0 focus-visible:ring-0 text-sm mb-2 px-1 py-1"
            />

            {/* Preview de imágenes seleccionadas */}
            {newCommentImages.length > 0 && (
              <div className="flex gap-2 mb-2">
                {newCommentImages.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded border border-border overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewCommentImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-0 right-0 bg-black/70 text-white p-0.5 rounded-bl"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              {/* Iconos de acción - Estilo Reddit */}
              <div className="flex items-center gap-1">
                <input
                  type="file"
                  id="comment-image-upload"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => {
                      if (newCommentImages.length >= 4) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setNewCommentImages(prev => [...prev, ev.target?.result as string]);
                      };
                      reader.readAsDataURL(file);
                    });
                    e.target.value = '';
                  }}
                />
                <label htmlFor="comment-image-upload" className="cursor-pointer">
                  <div className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent transition-colors">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNewComment("");
                    setNewCommentImages([]);
                  }}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white text-xs"
                >
                  {submitting ? 'Enviando...' : 'Comentar'}
                </Button>
              </div>
            </div>
          </form>

          {/* Sorting and Search */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Ordenar por:</span>
              <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold">
                Mejores ▾
              </Button>
            </div>
            <div className="flex-1" />
            <div className="text-sm text-muted-foreground">
              {comments.length} {comments.length === 1 ? 'comentario' : 'comentarios'}
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                postId={postId}
                onVote={handleVoteComment}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                onReplySuccess={loadComments}
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
  postId,
  onVote,
  onEdit,
  onDelete,
  onReplySuccess,
  depth = 0,
}: {
  comment: Comment;
  currentUserId?: string;
  postId: string;
  onVote: (commentId: string, voteType: 'upvote' | 'downvote') => void;
  onEdit: (commentId: string, newContent: string) => void;
  onDelete: (commentId: string) => void;
  onReplySuccess?: () => void;
  depth?: number;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyImages, setReplyImages] = useState<string[]>([]);
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

  const handleSubmitReply = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!replyContent.trim()) return;

    console.log('📤 Enviando respuesta:', {
      postId,
      parentId: comment.id,
      content: replyContent,
      images: replyImages.length
    });

    try {
      const response = await fetch('/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: postId,
          content: replyContent,
          parentId: comment.id,
          images: replyImages,
        }),
      });

      console.log('📥 Respuesta del servidor:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Respuesta creada:', data);
        setReplyContent("");
        setReplyImages([]);
        setIsReplying(false);
        // Llamar al callback para recargar comentarios sin recargar la página
        if (onReplySuccess) {
          onReplySuccess();
        }
      } else {
        const error = await response.json();
        console.error('❌ Error del servidor:', error);
        alert(error.error || 'Error al responder');
      }
    } catch (error) {
      console.error('❌ Error submitting reply:', error);
      alert('Error al responder: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  return (
    <div className="relative">
      {/* Thread line - posición ajustada por depth */}
      {depth > 0 && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-border/50"
          style={{ left: `${depth * 32 - 28}px` }}
        />
      )}

      <div
        className="flex gap-2"
        style={{ marginLeft: depth > 0 ? `${depth * 32}px` : '0' }}
      >
        {/* Collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex-shrink-0 w-6 h-6 rounded hover:bg-accent flex items-center justify-center mt-1"
        >
          {isCollapsed ? (
            <span className="text-xs font-bold text-muted-foreground">+</span>
          ) : (
            <span className="text-xs font-bold text-muted-foreground">−</span>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-semibold text-primary">
                {comment.author.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <span className="text-xs font-semibold">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              hace {getTimeAgo(comment.createdAt)}
            </span>

            {/* Menu Button - Solo mostrar si el usuario es el autor */}
            {currentUserId && currentUserId === comment.authorId && (
              <div className="relative ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-xs text-left hover:bg-accent flex items-center gap-2 transition-colors"
                    >
                      <Edit2 className="h-3 w-3" />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(comment.id);
                      }}
                      className="w-full px-4 py-2 text-xs text-left hover:bg-accent text-red-500 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Eliminar
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Content - Only show if not collapsed */}
          {!isCollapsed && (
            <>
              {isEditing ? (
                <div className="space-y-2 mb-2">
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={3}
                    className="resize-none text-xs"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="h-7 text-xs"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={!editedContent.trim()}
                      className="h-7 text-xs bg-red-500 hover:bg-red-600"
                    >
                      Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mb-2">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
                  {comment.isEdited && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 italic">
                      (editado)
                    </p>
                  )}

                  {/* Images */}
                  {comment.images && comment.images.length > 0 && (
                    <div className={cn(
                      "mt-2 grid gap-1.5",
                      comment.images.length === 1 && "grid-cols-1",
                      comment.images.length === 2 && "grid-cols-2",
                      comment.images.length >= 3 && "grid-cols-2"
                    )}>
                      {comment.images.slice(0, 4).map((image, index) => (
                        <div key={index} className="relative overflow-hidden rounded-lg border border-border">
                          <img
                            src={image}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-24 object-cover hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => window.open(image, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Voting Actions - Estilo Reddit */}
          {!isEditing && !isCollapsed && (
            <div className="flex items-center gap-1 text-xs font-semibold">
              {/* Upvote */}
              <button
                onClick={() => onVote(comment.id, 'upvote')}
                className={cn(
                  "p-1 rounded hover:bg-accent transition-colors",
                  comment.userVote === 'upvote' && "text-orange-500"
                )}
              >
                <ThumbsUp className="h-4 w-4" />
              </button>

              {/* Vote count */}
              <span className={cn(
                "min-w-[2rem] text-center",
                voteScore > 0 ? "text-orange-500" :
                voteScore < 0 ? "text-blue-500" :
                "text-muted-foreground"
              )}>
                {voteScore > 0 ? '+' : ''}{voteScore}
              </span>

              {/* Downvote */}
              <button
                onClick={() => onVote(comment.id, 'downvote')}
                className={cn(
                  "p-1 rounded hover:bg-accent transition-colors",
                  comment.userVote === 'downvote' && "text-blue-500"
                )}
              >
                <ThumbsDown className="h-4 w-4" />
              </button>

              {/* Responder */}
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="px-2 py-1 rounded hover:bg-accent text-muted-foreground transition-colors ml-1 cursor-pointer"
              >
                Responder
              </button>

              {/* Premiar */}
              <button className="px-2 py-1 rounded hover:bg-accent text-muted-foreground transition-colors cursor-pointer">
                Premiar
              </button>

              {/* Compartir */}
              <button className="px-2 py-1 rounded hover:bg-accent text-muted-foreground transition-colors cursor-pointer">
                Compartir
              </button>

              {/* More */}
              <button className="px-1 py-1 rounded hover:bg-accent text-muted-foreground transition-colors cursor-pointer">
                ...
              </button>
            </div>
          )}

          {/* Reply Form - Mismo estilo que el formulario principal */}
          {isReplying && !isCollapsed && (
            <form
              onSubmit={handleSubmitReply}
              className="mt-2 bg-card border-2 border-border rounded-xl px-3 py-2"
            >
              <Textarea
                placeholder="¿Qué opinas?"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={2}
                className="resize-none border-0 bg-transparent focus:ring-0 focus-visible:ring-0 text-sm mb-2 px-1 py-1"
              />

              {/* Preview de imágenes seleccionadas */}
              {replyImages.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {replyImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded border border-border overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setReplyImages(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-0 right-0 bg-black/70 text-white p-0.5 rounded-bl"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                {/* Icono de imagen */}
                <div className="flex items-center gap-1">
                  <input
                    type="file"
                    id={`reply-image-upload-${comment.id}`}
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => {
                        if (replyImages.length >= 4) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setReplyImages(prev => [...prev, ev.target?.result as string]);
                        };
                        reader.readAsDataURL(file);
                      });
                      e.target.value = '';
                    }}
                  />
                  <label htmlFor={`reply-image-upload-${comment.id}`} className="cursor-pointer">
                    <div className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent transition-colors">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsReplying(false);
                      setReplyContent("");
                      setReplyImages([]);
                    }}
                    className="text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={!replyContent.trim()}
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white text-xs"
                  >
                    Responder
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Collapsed summary */}
          {isCollapsed && (
            <div className="text-xs text-muted-foreground">
              {comment.author.name} • {voteScore > 0 ? '+' : ''}{voteScore} puntos
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies - Renderizar respuestas recursivamente */}
      {!isCollapsed && comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              postId={postId}
              onVote={onVote}
              onEdit={onEdit}
              onDelete={onDelete}
              onReplySuccess={onReplySuccess}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to calculate time ago
function getTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'ahora';
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours} h`;
  if (diffDays < 30) return `${diffDays} d`;
  return past.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}
