import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import { useXP } from '../XPContext';
import { AccentPulse, CountUp, SpinCoin, ThunderBolt } from './motion';
import { WalletSkeleton } from './Skeleton';
import { type } from './type';

/** Compact chip wallet used outside Home — denser, more interesting than twin cards. */
export function WalletBar({ compact = false }: { compact?: boolean }) {
  const { theme } = useTheme();
  const { totalPoints, coins, level, loading } = useXP();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  if (loading) {
    return <WalletSkeleton />;
  }

  const pad = compact ? 12 : 20;
  return (
    <Animated.View
      style={{
        paddingHorizontal: pad,
        paddingTop: compact ? 2 : 6,
        paddingBottom: 10,
        opacity: enter,
        transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          borderRadius: 14,
          paddingVertical: compact ? 8 : 10,
          paddingHorizontal: 10,
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.primary,
          }}
        >
          <Text style={[type.label, { color: theme.primary, letterSpacing: 0 }]}>L{level}</Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              borderRadius: 999,
              paddingVertical: 6,
              paddingHorizontal: 10,
              backgroundColor: theme.xpSoft,
              borderWidth: 1,
              borderColor: theme.xpBorder,
            }}
          >
            <ThunderBolt size={14} color={theme.primary} />
            <CountUp value={totalPoints} duration={600} fromZero style={[type.label, { color: theme.text, letterSpacing: 0.2, textTransform: 'none', fontSize: 13, lineHeight: 16, includeFontPadding: false }]} />
            <Text style={[type.label, { color: theme.textTertiary, letterSpacing: 0.4, lineHeight: 16, includeFontPadding: false }]}>XP</Text>
          </View>

          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              borderRadius: 999,
              paddingVertical: 6,
              paddingHorizontal: 10,
              backgroundColor: theme.coinSoft,
              borderWidth: 1,
              borderColor: theme.coinBorder,
            }}
          >
            <SpinCoin size={14} color={theme.coin} />
            <CountUp value={coins} duration={600} fromZero style={[type.label, { color: theme.text, letterSpacing: 0.2, textTransform: 'none', fontSize: 13, lineHeight: 16, includeFontPadding: false }]} />
            <Text style={[type.label, { color: theme.coin, letterSpacing: 0.4, lineHeight: 16, includeFontPadding: false }]}>COIN</Text>
          </View>
        </View>
      </View>
      {!compact ? (
        <Text style={[type.label, { color: theme.textTertiary, marginTop: 6, textAlign: 'center', fontWeight: '600' }]}>
          XP unlocks training · coins buy shop & library
        </Text>
      ) : null}
    </Animated.View>
  );
}

type AppHeaderProps = {
  onBack?: () => void;
  onRight?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  showWallet?: boolean;
  compactWallet?: boolean;
  title?: string;
};

export function AppHeader({ onBack, onRight, rightIcon = 'help-circle-outline', showWallet = false, compactWallet = true, title = 'ZENCADEMY' }: AppHeaderProps) {
  const { theme } = useTheme();
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: theme.background, borderBottomWidth: 1, borderBottomColor: theme.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 8 }}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.8}
            style={{ width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }}
          >
            <Feather name="arrow-left" size={18} color={theme.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <View style={{ alignItems: 'center' }}>
          <Text style={[type.brand, { color: theme.text }]}>{title}</Text>
          <AccentPulse color={theme.primary} />
        </View>
        {onRight ? (
          <TouchableOpacity
            onPress={onRight}
            activeOpacity={0.8}
            style={{ width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }}
          >
            <Ionicons name={rightIcon} size={18} color={theme.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
      {showWallet ? <WalletBar compact={compactWallet} /> : null}
    </SafeAreaView>
  );
}
