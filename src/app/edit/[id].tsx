import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import DeckEditor from '@/components/DeckEditor';
import { getDeck } from '@/lib/storage';
import { colors } from '@/lib/theme';
import type { Deck } from '@/lib/types';

export default function EditDeckScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [deck, setDeck] = useState<Deck | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getDeck(id).then((value) => {
      setDeck(value);
      setLoaded(true);
    });
  }, [id]);

  if (!loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!deck) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Deck not found.</Text>
      </View>
    );
  }

  return <DeckEditor initialDeck={deck} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  notFound: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
