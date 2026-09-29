import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { type } from './type';

export function EmptyState({
  icon = 'file-tray-outline',
  title,
  body,
  actionLabel,
  onAction,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.surface,
        paddingVertical: 28,
        paddingHorizontal: 20,
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Ionicons name={icon} size={28} color={theme.textTertiary} />
      <Text style={[type.card, { color: theme.text, textAlign: 'center' }]}>{title}</Text>
      <Text style={[type.body, { color: theme.textSecondary, textAlign: 'center' }]}>{body}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          style={{
            marginTop: 10,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: theme.primary,
          }}
        >
          <Text style={[type.button, { color: theme.buttonText }]}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
