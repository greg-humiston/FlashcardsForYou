import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Deck } from './types';

const DECKS_KEY = 'flashcard_decks';

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getDecks(): Promise<Deck[]> {
  const raw = await AsyncStorage.getItem(DECKS_KEY);
  if (!raw) return [];
  try {
    const decks: Deck[] = JSON.parse(raw);
    return decks.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export async function getDeck(id: string): Promise<Deck | undefined> {
  const decks = await getDecks();
  return decks.find((deck) => deck.id === id);
}

async function writeDecks(decks: Deck[]): Promise<void> {
  await AsyncStorage.setItem(DECKS_KEY, JSON.stringify(decks));
}

export async function saveDeck(deck: Deck): Promise<void> {
  const decks = await getDecks();
  const index = decks.findIndex((d) => d.id === deck.id);
  if (index === -1) {
    decks.push(deck);
  } else {
    decks[index] = deck;
  }
  await writeDecks(decks);
}

export async function deleteDeck(id: string): Promise<void> {
  const decks = await getDecks();
  await writeDecks(decks.filter((deck) => deck.id !== id));
}
