import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';

import { deleteDeck, getDecks } from '@/lib/storage';
import { colors } from '@/lib/theme';
import type { Deck } from '@/lib/types';

export default function HomeScreen() {
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadDecks = useCallback(() => {
    getDecks().then((value) => {
      setDecks(value);
      setLoaded(true);
    });
  }, []);

  useFocusEffect(loadDecks);

  function handleDelete(deck: Deck) {
    Alert.alert('Delete Deck', `Delete "${deck.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDeck(deck.id);
          loadDecks();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      {loaded && decks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No decks yet</Text>
          <Text style={styles.emptySubtitle}>Create your first flashcard deck to get started.</Text>
        </View>
      ) : (
        <FlatList
          data={decks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable
                style={styles.cardMain}
                onPress={() => router.push(`/review/${item.id}`)}
                disabled={item.cards.length === 0}
              >
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>
                  {item.cards.length} card{item.cards.length === 1 ? '' : 's'}
                </Text>
              </Pressable>
              <View style={styles.cardActions}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => router.push(`/edit/${item.id}`)}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      <Link href="/create" asChild>
        <Pressable style={styles.fab}>
          <Text style={styles.fabText}>+ New Deck</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 96,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardMain: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButton: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  deleteText: {
    color: colors.danger,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },
});
