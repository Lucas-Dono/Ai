/**
 * Following Posts Screen - Pantalla de posts seguidos
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { postApi } from '../../services/api';
import { colors, spacing, typography } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export const FollowingPostsScreen = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFollowedPosts();
  }, []);

  const loadFollowedPosts = async (refresh = false) => {
    try {
      setError(null);

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const followedPosts = await postApi.getFollowedPosts();
      setPosts(followedPosts);
    } catch (error: any) {
      console.error('Error loading followed posts:', error);
      setError(error.message || 'Error al cargar posts seguidos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderPost = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
    >
      {/* Following Badge */}
      <View style={styles.followingBadge}>
        <Ionicons name="notifications" size={14} color="#3b82f6" />
        <Text style={styles.followingBadgeText}>Siguiendo</Text>
      </View>

      {/* Community Badge */}
      {item.community && (
        <View style={styles.communityBadge}>
          <Text style={styles.communityName}>{item.community.name}</Text>
        </View>
      )}

      {/* Author */}
      <View style={styles.postHeader}>
        <Text style={styles.authorName}>{item.author.name}</Text>
        <Text style={styles.postTime}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {/* Title */}
      <Text style={styles.postTitle}>{item.title}</Text>

      {/* Content Preview */}
      <Text style={styles.postContent} numberOfLines={3}>
        {item.content}
      </Text>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag: string, index: number) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Ionicons name="arrow-up" size={16} color="#10b981" />
          <Text style={styles.statText}>{item.upvotes}</Text>
        </View>

        <View style={styles.stat}>
          <Ionicons name="arrow-down" size={16} color={colors.error.main} />
          <Text style={styles.statText}>{item.downvotes}</Text>
        </View>

        <View style={styles.stat}>
          <Ionicons name="chatbubble-outline" size={16} color={colors.text.tertiary} />
          <Text style={styles.statText}>{item.commentCount} comentarios</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Posts Seguidos</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Posts Seguidos</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadFollowedPosts(true)}
          />
        }
        ListEmptyComponent={
          error ? (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={80} color={colors.error.main} />
              <Text style={styles.emptyTitle}>Error</Text>
              <Text style={styles.emptyText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => loadFollowedPosts(true)}
              >
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="notifications-outline"
                size={80}
                color={colors.neutral[300]}
              />
              <Text style={styles.emptyTitle}>No sigues ningún post</Text>
              <Text style={styles.emptyText}>
                Cuando sigas publicaciones, aparecerán aquí. Recibirás notificaciones de
                nuevos comentarios en los posts que sigas.
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate('CommunityFeed')}
              >
                <Text style={styles.exploreButtonText}>Explorar Comunidad</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postCard: {
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    marginVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  followingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  followingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3b82f6',
    marginLeft: 4,
  },
  communityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  communityName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary[400],
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  postTime: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  postContent: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  tag: {
    backgroundColor: colors.primary[900],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    fontSize: 12,
    color: colors.primary[300],
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.tertiary,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: colors.error.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
