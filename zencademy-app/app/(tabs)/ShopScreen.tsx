import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Screen, PrimaryButton } from '../../components/ui/Screen';
import { type } from '../../components/ui/type';
import { useTheme } from '../../components/ThemeContext';
import { useXP } from '../../components/XPContext';
import { SHOP_ITEMS, ShopCategory, isAvatarItem, isBoostItem } from '../../constants/shop';
import { getEquippedAvatar, setEquippedAvatar } from '../../lib/inventory';
import { useEffect } from 'react';

const TABS: { id: ShopCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'avatars', label: 'Avatars' },
  { id: 'badges', label: 'Badges' },
  { id: 'boosts', label: 'Boosts' },
];

export default function ShopScreen() {
  const { coins, unlockedBadges, purchaseShopItem } = useXP();
  const { theme } = useTheme();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<ShopCategory | 'all'>('all');
  const [equipped, setEquipped] = useState<string | null>(null);

  useEffect(() => {
    void getEquippedAvatar().then(setEquipped);
  }, [unlockedBadges]);

  const items = useMemo(
    () => (tab === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.category === tab)),
    [tab]
  );

  const buy = async (id: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await purchaseShopItem(id);
      if (isBoostItem(id)) setNotice('Boost armed. Timer is running on this device.');
      else if (isAvatarItem(id)) setNotice('Avatar unlocked. Equip it below.');
      else setNotice('Badge added. XP was not spent.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Please retry.');
    } finally {
      setBusy(false);
    }
  };

  const equip = async (id: string) => {
    await setEquippedAvatar(id);
    setEquipped(id);
    setNotice('Avatar equipped.');
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
              <Text style={[type.label, { color: on ? theme.buttonText : theme.textSecondary, letterSpacing: 0.3 }]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {items.map(item => {
        const owned = unlockedBadges.includes(item.id);
        const affordable = coins >= item.price;
        const boost = isBoostItem(item.id);
        const avatar = isAvatarItem(item.id);
        const canRebuy = boost;
        const showOwned = owned && !canRebuy;
        return (
          <View key={item.id} style={{ borderRadius: 16, padding: 16, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: item.tone || theme.surface,
                borderWidth: 1,
                borderColor: theme.border,
              }}>
                {item.glyph ? (
                  <Text style={{ fontSize: 20, color: item.ink || theme.text, fontWeight: '700' }}>{item.glyph}</Text>
                ) : (
                  <Ionicons name={item.icon as never} size={20} color={theme.primary} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[type.card, { color: theme.text }]}>{item.title}</Text>
                <Text style={[type.label, { color: theme.textTertiary, fontWeight: '600' }]}>{item.category.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={[type.body, { color: theme.textSecondary }]}>{item.desc}</Text>
            <PrimaryButton
              label={
                showOwned
                  ? 'Owned'
                  : affordable
                    ? `${item.price} coins`
                    : `Need ${item.price} coins`
              }
              disabled={busy || showOwned || !affordable}
              onPress={() => { void buy(item.id); }}
            />
            {avatar && (owned || unlockedBadges.includes(item.id)) ? (
              <TouchableOpacity
                onPress={() => { void equip(item.id); }}
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
                {equipped === item.id ? (
                  <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
                ) : (
                  <Ionicons name="person-outline" size={16} color={theme.textSecondary} />
                )}
                <Text style={[type.button, { color: equipped === item.id ? theme.primary : theme.text }]}>
                  {equipped === item.id ? 'Currently equipped' : 'Equip avatar'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        );
      })}
    </Screen>
  );
}
