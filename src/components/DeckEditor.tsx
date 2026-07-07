import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { deleteDeck, generateId, saveDeck } from '@/lib/storage';
import { colors } from '@/lib/theme';
import type { Deck, Flashcard } from '@/lib/types';

interface DeckEditorProps {
  initialDeck: Deck;
}

export default function DeckEditor({ initialDeck }: DeckEditorProps) {
  const router = useRouter();

  const [deckName, setDeckName] = useState(initialDeck.name);
  const [cards, setCards] = useState<Flashcard[]>(initialDeck.cards);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  function resetCardInputs() {
    setQuestion('');
    setAnswer('');
    setEditingCardId(null);
  }

  function handleAddOrUpdateCard() {
    if (!question.trim() || !answer.trim()) {
      Alert.alert('Missing information', 'Please fill out both the question and answer.');
      return;
    }
    if (editingCardId) {
      setCards((prev) =>
        prev.map((card) =>
          card.id === editingCardId ? { ...card, question: question.trim(), answer: answer.trim() } : card
        )
      );
    } else {
      setCards((prev) => [...prev, { id: generateId(), question: question.trim(), answer: answer.trim() }]);
    }
    resetCardInputs();
  }

  function handleEditCard(card: Flashcard) {
    setEditingCardId(card.id);
    setQuestion(card.question);
    setAnswer(card.answer);
  }

  function handleRemoveCard(id: string) {
    setCards((prev) => prev.filter((card) => card.id !== id));
    if (editingCardId === id) {
      resetCardInputs();
    }
  }

  async function handleSave() {
    if (!deckName.trim()) {
      Alert.alert('Missing deck name', 'Please give your deck a name.');
      return;
    }
    if (cards.length === 0) {
      Alert.alert('No cards yet', 'Add at least one flashcard before saving.');
      return;
    }
    const deck: Deck = {
      id: initialDeck.id,
      name: deckName.trim(),
      cards,
      createdAt: initialDeck.createdAt,
      updatedAt: Date.now(),
    };
    await saveDeck(deck);
    router.back();
  }

  function handleDeleteDeck() {
    Alert.alert('Delete Deck', `Delete "${initialDeck.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDeck(initialDeck.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Deck Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Spanish Vocabulary"
          placeholderTextColor={colors.textSecondary}
          value={deckName}
          onChangeText={setDeckName}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>
          {editingCardId ? 'Edit Card' : 'Add a Card'}
        </Text>
        <Text style={styles.label}>Question</Text>
        <TextInput
          style={styles.input}
          placeholder="What is the question?"
          placeholderTextColor={colors.textSecondary}
          value={question}
          onChangeText={setQuestion}
          multiline
        />
        <Text style={styles.label}>Answer</Text>
        <TextInput
          style={styles.input}
          placeholder="What is the answer?"
          placeholderTextColor={colors.textSecondary}
          value={answer}
          onChangeText={setAnswer}
          multiline
        />

        <View style={styles.cardFormActions}>
          {editingCardId && (
            <Pressable style={[styles.button, styles.secondaryButton]} onPress={resetCardInputs}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          )}
          <Pressable style={[styles.button, styles.primaryButton]} onPress={handleAddOrUpdateCard}>
            <Text style={styles.primaryButtonText}>{editingCardId ? 'Update Card' : 'Add Card'}</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Cards ({cards.length})</Text>
        {cards.length === 0 ? (
          <Text style={styles.emptyText}>No cards added yet.</Text>
        ) : (
          cards.map((card, index) => (
            <View key={card.id} style={styles.cardRow}>
              <View style={styles.cardRowText}>
                <Text style={styles.cardIndex}>#{index + 1}</Text>
                <Text style={styles.cardQuestion} numberOfLines={2}>
                  {card.question}
                </Text>
                <Text style={styles.cardAnswer} numberOfLines={2}>
                  {card.answer}
                </Text>
              </View>
              <View style={styles.cardRowActions}>
                <Pressable style={styles.smallAction} onPress={() => handleEditCard(card)}>
                  <Text style={styles.smallActionText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.smallAction} onPress={() => handleRemoveCard(card.id)}>
                  <Text style={[styles.smallActionText, styles.deleteText]}>Remove</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        <Pressable style={[styles.button, styles.saveButton]} onPress={handleSave}>
          <Text style={styles.primaryButtonText}>Save Changes</Text>
        </Pressable>

        <Pressable style={[styles.button, styles.dangerButton]} onPress={handleDeleteDeck}>
          <Text style={styles.dangerButtonText}>Delete Deck</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  cardFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.primaryText,
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  cardRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    alignItems: 'flex-start',
  },
  cardRowText: {
    flex: 1,
    paddingRight: 8,
  },
  cardIndex: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cardQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  cardAnswer: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardRowActions: {
    gap: 8,
  },
  smallAction: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  smallActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  deleteText: {
    color: colors.danger,
  },
  saveButton: {
    marginTop: 28,
  },
  dangerButton: {
    marginTop: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  dangerButtonText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 15,
  },
});
