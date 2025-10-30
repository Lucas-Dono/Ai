/**
 * Selector de Emojis y GIFs estilo WhatsApp (reemplaza el teclado)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const IMAGE_SIZE = (width - spacing.lg * 3) / COLUMN_COUNT;
const EMOJI_SIZE = 40;
const EMOJI_COLUMNS = 8;

interface GifPickerProps {
  visible: boolean;
  onSelectGif: (gifUrl: string, description: string) => void;
  onSelectEmoji: (emoji: string) => void;
}

interface TenorGif {
  id: string;
  media_formats: {
    gif: { url: string };
    tinygif: { url: string };
  };
  content_description: string;
}

const TENOR_API_KEY = 'AIzaSyBCQSJFm_1Y9WQcrXRuARtG6tkhe14oCTc';
const TENOR_CLIENT_KEY = 'creador-inteligencias';

// Emojis comunes por categorías
const EMOJIS = {
  smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓'],
  gestures: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗'],
};

const EMOJI_CATEGORIES = [
  { id: 'smileys', icon: 'happy-outline', label: 'Caritas' },
  { id: 'gestures', icon: 'hand-left-outline', label: 'Gestos' },
  { id: 'hearts', icon: 'heart-outline', label: 'Corazones' },
  { id: 'animals', icon: 'paw-outline', label: 'Animales' },
];

type TabType = 'emojis' | 'gifs';

export function GifPicker({ visible, onSelectGif, onSelectEmoji }: GifPickerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('emojis');
  const [emojiCategory, setEmojiCategory] = useState('smileys');
  const [search, setSearch] = useState('');
  const [gifs, setGifs] = useState<TenorGif[]>([]);
  const [loading, setLoading] = useState(false);

  if (!visible) return null;

  useEffect(() => {
    if (visible) {
      // Cargar GIFs trending al abrir
      fetchTrendingGifs();
    } else {
      // Limpiar búsqueda al cerrar
      setSearch('');
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    if (search.trim()) {
      const timer = setTimeout(() => {
        searchGifs(search);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      fetchTrendingGifs();
    }
  }, [search, visible]);

  const fetchTrendingGifs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}&limit=20`
      );
      const data = await response.json();
      setGifs(data.results || []);
    } catch (error) {
      console.error('Error fetching trending GIFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(
          query
        )}&key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}&limit=20`
      );
      const data = await response.json();
      setGifs(data.results || []);
    } catch (error) {
      console.error('Error searching GIFs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'emojis' && styles.tabActive]}
          onPress={() => setActiveTab('emojis')}
        >
          <Ionicons
            name="happy-outline"
            size={24}
            color={activeTab === 'emojis' ? colors.primary[500] : colors.text.tertiary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'gifs' && styles.tabActive]}
          onPress={() => setActiveTab('gifs')}
        >
          <Ionicons
            name="images-outline"
            size={24}
            color={activeTab === 'gifs' ? colors.primary[500] : colors.text.tertiary}
          />
        </TouchableOpacity>
      </View>

      {/* Emojis Tab */}
      {activeTab === 'emojis' && (
        <View style={styles.content}>
          {/* Categorías de emojis */}
          <View style={styles.emojiCategories}>
            {EMOJI_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  emojiCategory === cat.id && styles.categoryButtonActive,
                ]}
                onPress={() => setEmojiCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={20}
                  color={
                    emojiCategory === cat.id ? colors.primary[500] : colors.text.tertiary
                  }
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Grid de emojis */}
          <FlatList
            data={EMOJIS[emojiCategory as keyof typeof EMOJIS]}
            keyExtractor={(item, index) => `${item}-${index}`}
            numColumns={EMOJI_COLUMNS}
            contentContainerStyle={styles.emojiGrid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.emojiButton}
                onPress={() => onSelectEmoji(item)}
              >
                <Text style={styles.emoji}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* GIFs Tab */}
      {activeTab === 'gifs' && (
        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar GIFs..."
              placeholderTextColor={colors.text.tertiary}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>

          {/* GIFs Grid */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary[500]} />
            </View>
          ) : gifs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron GIFs</Text>
            </View>
          ) : (
            <FlatList
              data={gifs}
              keyExtractor={(item) => item.id}
              numColumns={COLUMN_COUNT}
              contentContainerStyle={styles.gifGrid}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.gifItem}
                  onPress={() =>
                    onSelectGif(
                      item.media_formats.gif.url,
                      item.content_description || 'GIF'
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: item.media_formats.tinygif.url }}
                    style={styles.gifImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 320,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.card,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[500],
  },
  content: {
    flex: 1,
  },
  emojiCategories: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.card,
  },
  categoryButton: {
    padding: spacing.sm,
    marginRight: spacing.xs,
    borderRadius: borderRadius.md,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary[500] + '20',
  },
  emojiGrid: {
    padding: spacing.sm,
  },
  emojiButton: {
    width: width / EMOJI_COLUMNS,
    height: EMOJI_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    paddingVertical: spacing.xs,
    marginLeft: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  gifGrid: {
    padding: spacing.sm,
  },
  gifItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.background.elevated,
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
});
