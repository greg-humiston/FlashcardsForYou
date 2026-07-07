export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface Deck {
  id: string;
  name: string;
  cards: Flashcard[];
  createdAt: number;
  updatedAt: number;
}

export type ReviewMode = 'sequential' | 'random';
