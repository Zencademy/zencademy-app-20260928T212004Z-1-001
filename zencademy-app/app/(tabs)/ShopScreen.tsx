import { useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';
import { Page } from '../../components/Page';
import { useXP } from '../../components/XPContext';
import { useTheme } from '../../components/ThemeContext';
import { SHOP_BADGES } from '../../constants/shop';
export default function ShopScreen() {
  const { coins, unlockedBadges, purchaseShopItem } = useXP(); const { theme } = useTheme(); const [busy, setBusy] = useState(false);
  const buy = async (id: string) => { if (busy) return; setBusy(true); try { await purchaseShopItem(id); Alert.alert('Purchased', 'Your badge is available in your profile.'); } catch (error) { Alert.alert('Purchase failed', error instanceof Error ? error.message : 'Please retry.'); } finally { setBusy(false); } };
  return <Page title="Rewards"><Text style={{ color: theme.text }}>{coins} coins · Your XP and level never decrease when you shop.</Text>{SHOP_BADGES.map(item => <View key={item.id} style={{ padding: 18, borderRadius: 16, backgroundColor: theme.card, gap: 12 }}><Text style={{ color: theme.text, fontSize: 18 }}>{item.title}</Text><Text style={{ color: theme.textSecondary }}>{item.desc}</Text><Button title={unlockedBadges.includes(item.id) ? 'Owned' : `${item.price} coins`} disabled={busy || coins < item.price || unlockedBadges.includes(item.id)} onPress={() => { void buy(item.id); }} /></View>)}</Page>;
}
