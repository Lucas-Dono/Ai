/**
 * Community Feed Screen - Pantalla principal del feed de comunidad
 */

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
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
import { feedApi, postApi } from '../../services/api';
import { colors, spacing, typography } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

type FeedType = 'personalized' | 'hot' | 'new' | 'top' | 'following';

export const CommunityFeedScreen = () => {
  const navigation = useNavigation();
  const [feedType, setFeedType] = useState<FeedType>('personalized');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    console.log('[CommunityFeed] useEffect - feedType cambió a:', feedType);
    // Reset cuando cambia el tipo de feed
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    loadFeed(true);
  }, [feedType]);

  const loadFeed = async (refresh = false) => {
    try {
      // Clear error on retry
      setError(null);

      if (refresh) {
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
      } else {
        // Don't load more if already loading or no more data or error
        if (loading || !hasMore) return;
        setLoading(true);
      }

      const currentPage = refresh ? 1 : page;

      let result: any;
      switch (feedType) {
        case 'personalized':
          result = await feedApi.getPersonalized({ page: currentPage });
          break;
        case 'hot':
          result = await feedApi.getHot({ page: currentPage });
          break;
        case 'new':
          result = await feedApi.getNew({ page: currentPage });
          break;
        case 'top':
          result = await feedApi.getTop({ page: currentPage });
          break;
        case 'following':
          result = await feedApi.getFollowing({ page: currentPage });
          break;
      }

      // Check if there are more posts
      if (!result.posts || result.posts.length === 0) {
        setHasMore(false);
      }

      if (refresh) {
        setPosts(result.posts || []);
      } else {
        setPosts([...posts, ...(result.posts || [])]);
      }
    } catch (error: any) {
      console.error('Error loading feed:', error);
      setError(error.response?.data?.error || error.message || 'Error al cargar el feed');
      setHasMore(false); // Stop infinite scroll on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    try {
      await postApi.vote(postId, voteType);
      // Actualizar el post en la lista
      loadFeed(true);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const renderPost = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
    >
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

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleVote(item.id, 'upvote')}
        >
          <Ionicons name="arrow-up" size={20} color="#10b981" />
          <Text style={styles.actionText}>{item.upvotes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleVote(item.id, 'downvote')}
        >
          <Ionicons name="arrow-down" size={20} color={colors.error.main} />
          <Text style={styles.actionText}>{item.downvotes}</Text>
        </TouchableOpacity>

        <View style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.text.tertiary} />
          <Text style={styles.actionText}>{item.commentCount}</Text>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFeedTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.feedTabs}
      contentContainerStyle={styles.feedTabsContent}
    >
      {(['personalized', 'hot', 'new', 'top', 'following'] as FeedType[]).map((type) => (
        <TouchableOpacity
          key={type}
          style={[styles.tab, feedType === type && styles.tabActive]}
          onPress={() => {
            console.log('[CommunityFeed] Cambiando a:', type);
            setFeedType(type);
          }}
        >
          <Text style={[styles.tabText, feedType === type && styles.tabTextActive]}>
            {type === 'personalized' ? 'Para Ti' : 
             type === 'hot' ? 'Hot' :
             type === 'new' ? 'Nuevo' :
             type === 'top' ? 'Top' :
             'Siguiendo'}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreatePost')}>
          <Ionicons name="add-circle-outline" size={28} color={colors.primary[500]} />
        </TouchableOpacity>
      </View>

      {/* Feed Tabs */}
      {renderFeedTabs()}

      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadFeed(true)} />
        }
        onEndReached={() => {
          if (!loading && !refreshing && hasMore && !error) {
            setPage(page + 1);
            loadFeed();
          }
        }}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.error.main} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => loadFeed(true)}
              >
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.primary[500]} style={styles.loader} />
          ) : error ? null : (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={80} color={colors.neutral[300]} />
              <Text style={styles.emptyTitle}>¡Comienza la conversación!</Text>
              <Text style={styles.emptyText}>
                No hay posts todavía. Sé el primero en compartir algo interesante con la comunidad.
              </Text>
              <TouchableOpacity
                style={styles.createPostButton}
                onPress={() => navigation.navigate('CreatePost')}
              >
                <Ionicons name="add-circle" size={20} color="#fff" style={styles.createPostIcon} />
                <Text style={styles.createPostButtonText}>Crear Primer Post</Text>
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
    fontSize: typography.fontSize["2xl"],
    fontWeight: "700",
    color: colors.text.primary,
  },
  feedTabs: {
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    maxHeight: 44,
  },
  feedTabsContent: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: colors.primary[500],
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  postCard: {
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    marginVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
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
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.tertiary,
    marginLeft: 4,
  },
  loader: {
    marginTop: 32,
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
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
  createPostIcon: {
    marginRight: 8,
  },
  createPostButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#fef2f2',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.error.main,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
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
});
