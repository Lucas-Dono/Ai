/**
 * Post Detail Screen - Pantalla de detalle de un post
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { postApi, commentApi } from '../../services/api';
import { postFollowApi } from '../../services/api/post-follow.api';
import { Ionicons } from '@expo/vector-icons';

export const PostDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { postId } = route.params as { postId: string };

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    loadPost();
    loadComments();
    checkFollowStatus();
  }, [postId]);

  const loadPost = async () => {
    try {
      const data = await postApi.getById(postId);
      setPost(data);
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await commentApi.getByPostId(postId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    try {
      await postApi.vote(postId, voteType);
      loadPost();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleCommentVote = async (commentId: string, voteType: 'upvote' | 'downvote') => {
    try {
      await commentApi.vote(commentId, voteType);
      loadComments();
    } catch (error) {
      console.error('Error voting comment:', error);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const following = await postFollowApi.isFollowing(postId);
      setIsFollowing(following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleToggleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await postFollowApi.unfollowPost(postId);
        setIsFollowing(false);
        Alert.alert('Éxito', 'Dejaste de seguir esta publicación');
      } else {
        await postFollowApi.followPost(postId);
        setIsFollowing(true);
        Alert.alert('Éxito', 'Ahora sigues esta publicación. Recibirás notificaciones de nuevos comentarios.');
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', error.message || 'No se pudo actualizar el seguimiento');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    try {
      await commentApi.create({
        postId,
        parentId: replyingTo || undefined,
        content: commentText,
      });

      setCommentText('');
      setReplyingTo(null);
      loadComments();

      // Auto-seguir el post al comentar (si no está siguiendo ya)
      if (!isFollowing) {
        checkFollowStatus();
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const renderComment = (comment: any, level = 0) => (
    <View key={comment.id} style={[styles.commentContainer, { marginLeft: level * 16 }]}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentAuthor}>{comment.author.name}</Text>
        <Text style={styles.commentTime}>
          {new Date(comment.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <Text style={styles.commentContent}>{comment.content}</Text>

      {comment.isAcceptedAnswer && (
        <View style={styles.acceptedBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          <Text style={styles.acceptedText}>Respuesta aceptada</Text>
        </View>
      )}

      <View style={styles.commentActions}>
        <TouchableOpacity
          style={styles.commentAction}
          onPress={() => handleCommentVote(comment.id, 'upvote')}
        >
          <Ionicons name="arrow-up" size={16} color="#10b981" />
          <Text style={styles.commentActionText}>{comment.upvotes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.commentAction}
          onPress={() => handleCommentVote(comment.id, 'downvote')}
        >
          <Ionicons name="arrow-down" size={16} color="#ef4444" />
          <Text style={styles.commentActionText}>{comment.downvotes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.commentAction}
          onPress={() => setReplyingTo(comment.id)}
        >
          <Ionicons name="arrow-undo" size={16} color="#6b7280" />
          <Text style={styles.commentActionText}>Responder</Text>
        </TouchableOpacity>
      </View>

      {/* Replies */}
      {comment.replies &&
        comment.replies.map((reply: any) => renderComment(reply, level + 1))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post no encontrado</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView style={styles.scrollView}>
        {/* Post */}
        <View style={styles.postContainer}>
          {/* Community Badge */}
          {post.community && (
            <TouchableOpacity
              style={styles.communityBadge}
              onPress={() =>
                navigation.navigate('CommunityDetail', { communityId: post.community.id })
              }
            >
              <Text style={styles.communityName}>{post.community.name}</Text>
            </TouchableOpacity>
          )}

          {/* Author */}
          <View style={styles.postHeader}>
            <Text style={styles.authorName}>{post.author.name}</Text>
            <Text style={styles.postTime}>
              {new Date(post.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.postTitle}>{post.title}</Text>

          {/* Type Badge */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{post.type}</Text>
          </View>

          {/* Content */}
          <Text style={styles.postContent}>{post.content}</Text>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {post.tags.map((tag: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleVote('upvote')}
            >
              <Ionicons name="arrow-up" size={24} color="#10b981" />
              <Text style={styles.actionText}>{post.upvotes}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleVote('downvote')}
            >
              <Ionicons name="arrow-down" size={24} color="#ef4444" />
              <Text style={styles.actionText}>{post.downvotes}</Text>
            </TouchableOpacity>

            <View style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color="#6b7280" />
              <Text style={styles.actionText}>{post.commentCount}</Text>
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleToggleFollow}
              disabled={followLoading}
            >
              {followLoading ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <>
                  <Ionicons
                    name={isFollowing ? "notifications" : "notifications-outline"}
                    size={24}
                    color={isFollowing ? "#3b82f6" : "#6b7280"}
                  />
                  <Text style={[styles.actionText, isFollowing && styles.followingText]}>
                    {isFollowing ? 'Siguiendo' : 'Seguir'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>
            Comentarios ({post.commentCount})
          </Text>

          {comments.map((comment) => renderComment(comment))}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        {replyingTo && (
          <View style={styles.replyingToBar}>
            <Text style={styles.replyingToText}>Respondiendo...</Text>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.commentInput}
            placeholder="Escribe un comentario..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={commentText.trim() ? '#3b82f6' : '#9ca3af'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  communityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  communityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  postTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  postTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  postContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    color: '#6b7280',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 6,
  },
  commentsSection: {
    backgroundColor: '#fff',
    padding: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  commentContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  commentTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  commentContent: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  acceptedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
    marginLeft: 4,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  commentActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 4,
  },
  commentInputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  replyingToBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  replyingToText: {
    fontSize: 13,
    color: '#6b7280',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  commentInput: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  sendButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  followingText: {
    color: '#3b82f6',
    fontWeight: '700',
  },
});
