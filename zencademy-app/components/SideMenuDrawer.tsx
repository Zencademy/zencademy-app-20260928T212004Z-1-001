import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_WIDTH = Math.round(SCREEN_WIDTH * 0.82);

type SideMenuDrawerProps = {
  visible: boolean;
  onClose: () => void;
};

export default function SideMenuDrawer({ visible, onClose }: SideMenuDrawerProps) {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [rendered, setRendered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (visible) {
      if (!rendered) setRendered(true);
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 260, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, { toValue: -DRAWER_WIDTH, duration: 240, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 240, useNativeDriver: true }),
      ]).start(({ finished }) => { if (finished) setRendered(false); });
    }
  }, [visible]);

  const MenuItem = useMemo(() => (
    function MenuItem({ icon, label, to }: { icon: any; label: string; to: any }) {
      return (
        <Pressable
          onPress={() => {
            // Close first, then navigate after animation frame
            onClose();
            requestAnimationFrame(() => {
              setTimeout(() => router.push(to), 10);
            });
          }}
          style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name={icon} size={22} color="#232323" style={{ marginRight: 14 }} />
          <Text style={styles.itemLabel}>{label}</Text>
          <Ionicons name="chevron-forward-outline" size={18} color="#aaa" style={{ marginLeft: 'auto' }} />
        </Pressable>
      );
    }
  ), []);

  if (!rendered && !visible) return null;
  return (
    <View pointerEvents={visible ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
      {/* Right blurred overlay that closes on press */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: overlayOpacity }]}>
        <View
          style={{ flex: 1 }}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
        >
          <Pressable onPress={onClose} style={{ flex: 1, alignItems: 'flex-end' }}>
            <BlurView intensity={30} tint="light" style={{ width: SCREEN_WIDTH - DRAWER_WIDTH, height: SCREEN_HEIGHT }} />
          </Pressable>
        </View>
      </Animated.View>

      {/* Drawer */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        <Pressable onPress={onClose} style={styles.closeButton} hitSlop={10}>
          <Ionicons name="close" size={24} color="#111" />
        </Pressable>
        <View style={styles.headerRow}>
          <Ionicons name="trophy-outline" size={24} color="#111" />
          <Text style={styles.headerText}>Zencademy</Text>
        </View>
        <Text style={styles.headerSubtitle}>Navigate and explore</Text>
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <MenuItem icon="person-outline" label="Profile" to="/ProfileScreen" />
          <MenuItem icon="document-text-outline" label="Journal" to={{ pathname: '/(tabs)', params: { initialPage: 3 } }} />
          <MenuItem icon="podium-outline" label="Leaderboard" to={{ pathname: '/(tabs)', params: { initialPage: 4 } }} />
          <MenuItem icon="home-outline" label="Home" to={{ pathname: '/(tabs)', params: { initialPage: 1 } }} />
          <MenuItem icon="cart-outline" label="Shop" to="/ShopScreen" />
          <MenuItem icon="barbell-outline" label="Training Hub" to="/TrainingHub" />
          <MenuItem icon="speedometer-outline" label="Mental Training" to="/MentalTrainingScreen" />
          <MenuItem icon="walk-outline" label="Physical Training" to="/PhysicalTrainingScreen" />
          <MenuItem icon="analytics-outline" label="Intelligence Test" to="/IntelligenceTestScreen" />
          <MenuItem icon="settings-outline" label="Settings" to="/settings" />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e5e5e5',
    paddingTop: 18,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 6,
    borderRadius: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    marginLeft: 10,
    fontSize: 22,
    fontWeight: '900',
    color: '#111',
  },
  headerSubtitle: {
    marginTop: 2,
    marginBottom: 14,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  itemLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
  },
});


