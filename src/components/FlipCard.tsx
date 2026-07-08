import { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/lib/theme';

interface FlipCardProps {
  question: string;
  answer: string;
  onFlipped: () => void;
}

const SWIPE_THRESHOLD = 60;

export default function FlipCard({ question, answer, onFlipped }: FlipCardProps) {
  const rotation = useRef(new Animated.Value(0)).current;
  const isFlippedRef = useRef(false);
  const isAnimatingRef = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gesture) =>
        !isAnimatingRef.current && Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderRelease: (_, gesture) => {
        if (isAnimatingRef.current) return;
        if (Math.abs(gesture.dx) > SWIPE_THRESHOLD) {
          const flipToAnswer = !isFlippedRef.current;
          isAnimatingRef.current = true;
          isFlippedRef.current = flipToAnswer;
          Animated.spring(rotation, {
            toValue: flipToAnswer ? 1 : 0,
            useNativeDriver: true,
            friction: 8,
            tension: 10,
          }).start(() => {
            isAnimatingRef.current = false;
            if (flipToAnswer) onFlipped();
          });
        }
      },
    })
  ).current;

  const frontInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });
  const frontOpacity = rotation.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });
  const backOpacity = rotation.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Animated.View
        style={[
          styles.card,
          { transform: [{ perspective: 1000 }, { rotateY: frontInterpolate }], opacity: frontOpacity },
        ]}
      >
        <Text style={styles.label}>Question</Text>
        <Text style={styles.text}>{question}</Text>
        <Text style={styles.hint}>Swipe left or right to reveal answer</Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.card,
          styles.cardBack,
          { transform: [{ perspective: 1000 }, { rotateY: backInterpolate }], opacity: backOpacity },
        ]}
      >
        <Text style={styles.label}>Answer</Text>
        <Text style={styles.text}>{answer}</Text>
        <Text style={styles.hint}>Swipe left or right to flip back</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 280,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardBack: {
    backgroundColor: colors.surface,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  hint: {
    position: 'absolute',
    bottom: 16,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
