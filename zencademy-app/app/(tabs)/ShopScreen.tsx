import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../components/AuthContext';
import { type AccentId, useTheme } from '../../components/ThemeContext';
import { useXP } from '../../components/XPContext';
import { PrimaryButton, Screen } from '../../components/ui/Screen';
import { type } from '../../components/ui/type';
import {
  SHOP_ITEMS,
  ShopCategory,
  isAvatarItem,
  isBoostAvailable,
  isBoostItem,
  isThemeItem,
  shopItemById,
} from '../../constants/shop';
import { getEquippedAvatar, setEquippedAvatar } from '../../lib/inventory';
import { isAccentUnlocked } from '../../lib/themeOwnership';

const TABS: { id: ShopCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'avatars', label: 'Avatars' },
  { id: 'badges', label: 'Badges' },
  { id: 'themes', label: 'Themes' },
  { id: 'boosts', label: 'Boosts' },
];

function boostNotice(id: string) {
  if (id === 'boost-xp-2h') return 'XP Pulse active — +15% XP from training for 2 hours.';
  if (id === 'boost-coin-rain') return 'Coin Rain active — +10% coins from training for 1 hour.';
  if (id === 'boost-streak-shield') return 'Streak Shield is active. It protects one missed training day.';
  return 'Boost active on your account until it expires.';
}

function formatRemaining(expiresAt: number) {
  const mins = Math.max(1, Math.round((expiresAt - Date.now()) / 60000));
  if (mins >= 120) return `${Math.round(mins / 60)}h left`;
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m left`;
  return `${mins}m left`;
}

export default function ShopScreen() {
  const { user } = useAuth();
  const { coins, unlockedBadges, purchaseShopItem, setEquippedBadge, equippedBadge, refresh, activeBoosts } = useXP();
  const { theme, accentId, setAccentId } = useTheme();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<ShopCategory | 'all'>('all');
  const [equipped, setEquipped] = useState<string | null>(null);
  const [pendingAccent, setPendingAccent] = useState<AccentId | null>(null);

  useEffect(() => {
    void getEquippedAvatar(user?.id).then(setEquipped);
  }, [unlockedBadges, user?.id]);

  // Apply theme only after ownership is visible to AccentOwnershipGuard.
  useEffect(() => {
    if (!pendingAccent) return;
    if (!isAccentUnlocked(pendingAccent, unlockedBadges)) return;
    setAccentId(pendingAccent);
    setPendingAccent(null);
  }, [pendingAccent, unlockedBadges, setAccentId]);

  const items = useMemo(() => {
    const base = tab === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.category === tab);
    return base.filter(i => !isBoostItem(i.id) || isBoostAvailable(i.id));
  }, [tab]);

  const equipAvatar = async (id: string) => {
    await setEquippedAvatar(id, user?.id);
    setEquipped(id);
  };

  const equipTheme = (id: string) => {
    const item = shopItemById(id);
    if (!item?.accentId) return;
    if (!unlockedBadges.includes(id) && item.accentId !== 'crimson') {
      setNotice('Purchase this theme first.');
      return;
    }
    setAccentId(item.accentId);
    setNotice(`${item.title} equipped.`);
  };

  const equipBadge = async (id: string) => {
    await setEquippedBadge(id);
    setNotice('Badge equipped on your profile.');
  };

  const buy = async (id: string) => {
    if (busy) return;
    if (isBoostItem(id) && !isBoostAvailable(id)) {
      setNotice('This boost is not available — purchase disabled.');
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      await purchaseShopItem(id);
      if (isBoostItem(id)) {
        await refresh().catch(() => {});
        setNotice(boostNotice(id));
      } else if (isAvatarItem(id)) {
        await equipAvatar(id);
        setNotice('Avatar unlocked and equipped.');
      } else if (isThemeItem(id)) {
        const item = shopItemById(id);
        if (item?.accentId) setPendingAccent(item.accentId);
        setNotice('Theme unlocked and applied.');
      } else {
        await equipBadge(id);
        setNotice('Badge unlocked and equipped.');
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Please retry.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Store" subtitle="Coins only. XP never spent here." backTo="/(tabs)">
      <Text style={[type.body, { color: theme.textSecondary }]}>{coins} coins available</Text>
      {notice ? <Text style={[type.body, { color: theme.text }]}>{notice}</Text> : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {TABS.map(t => {
          const on = tab === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => setTab(t.id)}
              style={{
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 7,
                backgroundColor: on ? theme.primary : theme.surface,
                borderWidth: 1,
                borderColor: on ? theme.primary : theme.border,
              }}
            >
              <Text style={[type.label, { color: on ? theme.buttonText : theme.textSecondary, letterSpacing: 0.3 }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {items.length === 0 ? (
        <Text style={[type.body, { color: theme.textSecondary }]}>Nothing in this category yet.</Text>
      ) : null}

      {items.map(item => {
        const showAsOwned = unlockedBadges.includes(item.id);
        const affordable = coins >= item.price;
        const boost = isBoostItem(item.id);
        const avatar = isAvatarItem(item.id);
        const themeItem = isThemeItem(item.id);
        const badge = !boost && !avatar && !themeItem;
        const canRebuy = boost;
        const showOwned = showAsOwned && !canRebuy;
        const themeActive = themeItem && item.accentId === accentId;
        const badgeActive = badge && equippedBadge === item.id;
        const activeBoost = boost ? activeBoosts.find(b => b.id === item.id) : undefined;
        return (
          <View
            key={item.id}
            style={{
              borderRadius: 16,
              padding: 16,
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: item.tone || theme.surface,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                {item.glyph ? (
                  <Text style={{ fontSize: 20, color: item.ink || theme.text, fontWeight: '700' }}>{item.glyph}</Text>
                ) : (
                  <Ionicons name={item.icon as never} size={20} color={theme.primary} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[type.card, { color: theme.text }]}>{item.title}</Text>
                <Text style={[type.label, { color: theme.textTertiary, fontWeight: '600' }]}>
                  {item.category.toUpperCase()}
                  {activeBoost ? ` · ACTIVE · ${formatRemaining(activeBoost.expiresAt)}` : ''}
                </Text>
              </View>
            </View>
            <Text style={[type.body, { color: theme.textSecondary }]}>{item.desc}</Text>
            <PrimaryButton
              label={
                showOwned
                  ? 'Owned'
                  : affordable
                    ? activeBoost
                      ? `Extend · ${item.price} coins`
                      : `${item.price} coins`
                    : `Need ${item.price} coins`
              }
              disabled={busy || showOwned || !affordable}
              onPress={() => {
                void buy(item.id);
              }}
            />
            {avatar && showAsOwned ? (
              <TouchableOpacity
                onPress={() => {
                  void equipAvatar(item.id).then(() => setNotice('Avatar equipped.'));
                }}
                style={{
                  borderRadius: 12,
                  paddingVertical: 10,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                  borderWidth: equipped === item.id ? 2 : 1,
                  borderColor: equipped === item.id ? theme.primary : theme.border,
                  backgroundColor: equipped === item.id ? theme.surface : 'transparent',
                }}
              >
                <Ionicons
                  name={equipped === item.id ? 'checkmark-circle' : 'person-outline'}
                  size={16}
                  color={equipped === item.id ? theme.primary : theme.textSecondary}
                />
                <Text style={[type.button, { color: equipped === item.id ? theme.primary : theme.text }]}>
                  {equipped === item.id ? 'Currently equipped' : 'Equip avatar'}
                </Text>
              </TouchableOpacity>
            ) : null}
            {themeItem && showAsOwned ? (
              <TouchableOpacity
                onPress={() => equipTheme(item.id)}
                style={{
                  borderRadius: 12,
                  paddingVertical: 10,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                  borderWidth: themeActive ? 2 : 1,
                  borderColor: themeActive ? theme.primary : theme.border,
                  backgroundColor: themeActive ? theme.surface : 'transparent',
                }}
              >
                <Ionicons
                  name={themeActive ? 'checkmark-circle' : 'color-palette-outline'}
                  size={16}
                  color={themeActive ? theme.primary : theme.textSecondary}
                />
                <Text style={[type.button, { color: themeActive ? theme.primary : theme.text }]}>
                  {themeActive ? 'Accent active' : 'Equip accent'}
                </Text>
              </TouchableOpacity>
            ) : null}
            {badge && showAsOwned ? (
              <TouchableOpacity
                onPress={() => {
                  void equipBadge(item.id);
                }}
                style={{
                  borderRadius: 12,
                  paddingVertical: 10,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                  borderWidth: badgeActive ? 2 : 1,
                  borderColor: badgeActive ? theme.primary : theme.border,
                  backgroundColor: badgeActive ? theme.surface : 'transparent',
                }}
              >
                <Ionicons
                  name={badgeActive ? 'checkmark-circle' : 'ribbon-outline'}
                  size={16}
                  color={badgeActive ? theme.primary : theme.textSecondary}
                />
                <Text style={[type.button, { color: badgeActive ? theme.primary : theme.text }]}>
                  {badgeActive ? 'Equipped on profile' : 'Equip badge'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        );
      })}
    </Screen>
  );
}
