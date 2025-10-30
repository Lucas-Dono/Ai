/**
 * Community Feed Page - Página principal del feed de comunidad
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Clock,
  Star,
  Users,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Plus,
  Filter,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

type FeedType = 'personalized' | 'hot' | 'new' | 'top' | 'following';

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  community?: {
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

export default function CommunityPage() {
  const [feedType, setFeedType] = useState<FeedType>('personalized');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadFeed();
  }, [feedType]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community/feed?type=${feedType}`);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    try {
      await fetch(`/api/community/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });
      loadFeed();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const feedTabs = [
    { type: 'personalized' as FeedType, label: 'Para Ti', icon: Star },
    { type: 'hot' as FeedType, label: 'Hot', icon: TrendingUp },
    { type: 'new' as FeedType, label: 'Nuevo', icon: Clock },
    { type: 'top' as FeedType, label: 'Top', icon: ThumbsUp },
    { type: 'following' as FeedType, label: 'Siguiendo', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Community
            </h1>
            <Link href="/community/create">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Crear Post
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar en la comunidad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Feed Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {feedTabs.map((tab) => (
              <button
                key={tab.type}
                onClick={() => setFeedType(tab.type)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all",
                  feedType === tab.type
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent hover:bg-accent/80 text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : posts.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <MessageSquare className="h-20 w-20 text-muted-foreground/50 mb-4" />
            <h3 className="text-2xl font-bold mb-2">¡Comienza la conversación!</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              No hay posts todavía. Sé el primero en compartir algo interesante con la comunidad.
            </p>
            <Link href="/community/create">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Crear Primer Post
              </Button>
            </Link>
          </motion.div>
        ) : (
          // Posts List
          <div className="space-y-4">
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PostCard post={post} onVote={handleVote} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// PostCard Component
function PostCard({ post, onVote }: { post: Post; onVote: (postId: string, voteType: 'upvote' | 'downvote') => void }) {
  const voteScore = post.upvotes - post.downvotes;

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all group">
      {/* Community Badge */}
      {post.community && (
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: post.community.color }}
          />
          <span className="text-sm font-semibold text-primary">
            {post.community.name}
          </span>
        </div>
      )}

      {/* Author & Time */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <span className="text-xs font-semibold text-primary">
            {post.author.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium">{post.author.name}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Title & Content */}
      <Link href={`/community/post/${post.id}`}>
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {post.content}
        </p>
      </Link>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6">
        {/* Voting */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={post.userVote === 'upvote' ? 'default' : 'ghost'}
            onClick={() => onVote(post.id, 'upvote')}
            className="gap-1"
          >
            <ThumbsUp className="h-4 w-4" />
            <span className="text-sm font-semibold">{post.upvotes}</span>
          </Button>
          <Button
            size="sm"
            variant={post.userVote === 'downvote' ? 'default' : 'ghost'}
            onClick={() => onVote(post.id, 'downvote')}
            className="gap-1"
          >
            <ThumbsDown className="h-4 w-4" />
            <span className="text-sm font-semibold">{post.downvotes}</span>
          </Button>
        </div>

        {/* Comments */}
        <Link href={`/community/post/${post.id}#comments`}>
          <Button size="sm" variant="ghost" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">{post.commentCount}</span>
          </Button>
        </Link>

        {/* Share */}
        <Button size="sm" variant="ghost" className="gap-2">
          <Share2 className="h-4 w-4" />
        </Button>

        {/* Vote Score */}
        <div className="ml-auto">
          <span className={cn(
            "text-sm font-bold",
            voteScore > 0 ? "text-green-500" : voteScore < 0 ? "text-red-500" : "text-muted-foreground"
          )}>
            {voteScore > 0 ? '+' : ''}{voteScore}
          </span>
        </div>
      </div>
    </div>
  );
}
