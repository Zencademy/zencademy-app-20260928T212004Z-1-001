import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';

/** Simple shimmer placeholder for loading wallets / lists. */
export function Skeleton({
  height = 14,
  width = '100%',
  radius = 8,
  style,
}: {
  height?: number;
  width?: number | string;
  radius?: number;
  style?: object;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          height,
          width: width as number,
          borderRadius: radius,
          backgroundColor: theme.border,
          opacity: 0.55,
        },
        style,
      ]}
    />
  );
}

export function WalletSkeleton() {
  const { theme } = useTheme();
  return (
    <View
      style={{
        marginHorizontal: 20,
        marginTop: 6,
        marginBottom: 10,
        borderRadius: 14,
        padding: 12,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        gap: 10,
      }}
    >
      <Skeleton height={34} radius={10} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Skeleton height={32} radius={999} style={{ flex: 1 }} />
        <Skeleton height={32} radius={999} style={{ flex: 1 }} />
      </View>
    </View>
  );
}
