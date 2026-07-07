import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import FlipCard from '@/components/FlipCard';
import { getDeck } from '@/lib/storage';
import { colors } from '@/lib/theme';
import type { Deck, Flashcard, ReviewMode } from '@/lib/types';

type Phase = 'loading' | 'not-found' | 'mode-select' | 'session' | 'results';

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [deck, setDeck] = useState<Deck | undefined>(undefined);
  const [phase, setPhase] = useState<Phase>('loading');
  const [order, setOrder] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showButtons, setShowButtons] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  useEffect(() => {
    getDeck(id).then((value) => {
      setDeck(value);
      setPhase(value && value.cards.length > 0 ? 'mode-select' : 'not-found');
    });
  }, [id]);

  function startReview(mode: ReviewMode) {
    if (!deck) return;
    setOrder(mode === 'random' ? shuffle(deck.cards) : deck.cards);
    setCurrentIndex(0);
    setCorrect(0);
    setWrong(0);
    setShowButtons(false);
    setPhase('session');
  }

  function handleAnswer(isCorrect: boolean) {
    if (isCorrect) {
      setCorrect((c) => c + 1);
    } else {
      setWrong((w) => w + 1);
    }
    setShowButtons(false);
    if (currentIndex + 1 >= order.length) {
      setPhase('results');
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  if (phase === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (phase === 'not-found') {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>This deck has no cards to review.</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Back to Decks</Text>
        </Pressable>
      </View>
    );
  }

  if (phase === 'mode-select' && deck) {
    return (
      <View style={styles.center}>
        <Text style={styles.deckTitle}>{deck.name}</Text>
        <Text style={styles.deckSubtitle}>
          {deck.cards.length} card{deck.cards.length === 1 ? '' : 's'}
        </Text>
        <Text style={styles.sectionLabel}>Choose Review Mode</Text>
        <Pressable style={styles.primaryButton} onPress={() => startReview('sequential')}>
          <Text style={styles.primaryButtonText}>Sequential</Text>
        </Pressable>
        <Pressable style={[styles.primaryButton, styles.secondaryButton]} onPress={() => startReview('random')}>
          <Text style={[styles.primaryButtonText, styles.secondaryButtonText]}>Random (Shuffled)</Text>
        </Pressable>
      </View>
    );
  }

  if (phase === 'session') {
    const currentCard = order[currentIndex];
    return (
      <View style={styles.sessionContainer}>
        <Text style={styles.progress}>
          Card {currentIndex + 1} of {order.length}
        </Text>
        <FlipCard
          key={currentCard.id}
          question={currentCard.question}
          answer={currentCard.answer}
          onFlipped={() => setShowButtons(true)}
        />
        {showButtons && (
          <View style={styles.answerButtons}>
            <Pressable style={[styles.answerButton, styles.wrongButton]} onPress={() => handleAnswer(false)}>
              <Text style={styles.answerButtonText}>Wrong</Text>
            </Pressable>
            <Pressable style={[styles.answerButton, styles.correctButton]} onPress={() => handleAnswer(true)}>
              <Text style={styles.answerButtonText}>Correct</Text>
            </Pressable>
          </View>
        )}
        <View style={styles.tally}>
          <Text style={styles.tallyText}>Correct: {correct}</Text>
          <Text style={styles.tallyText}>Wrong: {wrong}</Text>
        </View>
      </View>
    );
  }

  const total = correct + wrong;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <View style={styles.center}>
      <Text style={styles.sectionLabel}>Review Complete</Text>
      <Text style={styles.percentage}>{percentage}%</Text>
      <Text style={styles.resultLine}>Correct: {correct}</Text>
      <Text style={styles.resultLine}>Wrong: {wrong}</Text>
      <Text style={styles.resultLine}>Total: {total}</Text>
      <Pressable style={styles.primaryButton} onPress={() => router.back()}>
        <Text style={styles.primaryButtonText}>Return Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  sessionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  notFound: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  deckTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  deckSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  progress: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    fontWeight: '600',
  },
  answerButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 28,
  },
  answerButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  correctButton: {
    backgroundColor: colors.success,
  },
  wrongButton: {
    backgroundColor: colors.danger,
  },
  answerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  tally: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 24,
  },
  tallyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  percentage: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 16,
  },
  resultLine: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
});
