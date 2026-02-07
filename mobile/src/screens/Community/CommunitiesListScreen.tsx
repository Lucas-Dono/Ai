/**
 * Communities List Screen - Pantalla de lista de comunidades
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { communityApi } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export const CommunitiesListScreen = () => {
  const navigation = useNavigation();
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string | undefined>();

  useEffect(() => {
    loadCommunities();
  }, [searchQuery, category]);

  const loadCommunities = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const result = await communityApi.list({
        search: searchQuery || undefined,
        category,
      });

      setCommunities(result.communities);
    } catch (error) {
      console.error('Error loading communities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleJoin = async (communityId: string) => {
    try {
      await communityApi.join(communityId);
      loadCommunities(true);
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  const renderCommunity = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.communityCard}
      onPress={() => navigation.navigate('CommunityDetail', { communityId: item.id })}
    >
      {/* Banner */}
      {item.bannerUrl ? (
        <Image source={{ uri: item.bannerUrl }} style={styles.banner} />
      ) : (
        <View style={[styles.banner, styles.bannerPlaceholder]} />
      )}

      <View style={styles.cardContent}>
        {/* Avatar & Name */}
        <View style={styles.communityHeader}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="people" size={24} color="#9ca3af" />
            </View>
          )}

          <View style={styles.communityInfo}>
            <Text style={styles.communityName}>{item.name}</Text>
            <Text style={styles.communityStats}>
              {item.memberCount} miembros · {item.postCount} posts
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Category */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>

        {/* Join Button */}
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => handleJoin(item.id)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.joinButtonText}>Unirse</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comunidades</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateCommunity')}>
          <Ionicons name="add-circle-outline" size={28} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar comunidades..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Communities List */}
      <FlatList
        data={communities}
        renderItem={renderCommunity}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadCommunities(true)} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>No se encontraron comunidades</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  communityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  banner: {
    width: '100%',
    height: 100,
  },
  bannerPlaceholder: {
    backgroundColor: '#e5e7eb',
  },
  cardContent: {
    padding: 16,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -32,
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  communityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  communityStats: {
    fontSize: 13,
    color: '#6b7280',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    borderRadius: 8,
  },
  joinButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
  loader: {
    marginTop: 32,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
});
