import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/lib/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Your Decks' }} />
        <Stack.Screen name="create" options={{ title: 'New Deck' }} />
        <Stack.Screen name="edit/[id]" options={{ title: 'Edit Deck' }} />
        <Stack.Screen name="review/[id]" options={{ title: 'Review', headerBackTitle: 'Decks' }} />
      </Stack>
    </>
  );
}
