import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EbookReader } from '../../components/ebooks/EbookReader';
import { getEbookContent } from '../../lib/ebookContent/catalog';
import { useTheme } from '../../components/ThemeContext';

export default function EbookByIdScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const ebook = typeof id === 'string' ? getEbookContent(id) : null;

  if (!ebook) {
    return (
      <View style={[styles.missing, { backgroundColor: theme.background }]}>
        <Text style={[styles.missingText, { color: theme.text }]}>Ebook not found.</Text>
      </View>
    );
  }

  return <EbookReader title={ebook.title} chapters={ebook.chapters} />;
}

const styles = StyleSheet.create({
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  missingText: { fontSize: 16, fontWeight: '600' },
});
