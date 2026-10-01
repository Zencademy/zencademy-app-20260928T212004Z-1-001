import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../components/AuthContext';
import { ACCENT_PRESETS, AccentId, useTheme } from '../../components/ThemeContext';
import { useSound } from '../../lib/sound/SoundPack';

interface SettingsItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  isDestructive?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}

function SettingsItem({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  isDestructive = false, 
  showSwitch = false, 
  switchValue = false, 
  onSwitchChange 
}: SettingsItemProps) {
  const { theme } = useTheme();

  const itemStyle = {
    backgroundColor: theme.card,
    borderBottomColor: theme.borderLight,
  };

  const iconStyle = {
    backgroundColor: theme.surface,
  };

  const destructiveIconStyle = {
    backgroundColor: theme.error + '20',
  };

  return (
    <TouchableOpacity
      style={[styles.settingsItem, itemStyle]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={showSwitch}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[
          styles.iconContainer, 
          iconStyle,
          isDestructive && destructiveIconStyle
        ]}>
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={isDestructive ? theme.error : theme.textSecondary} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.settingsTitle, 
            { color: theme.text },
            isDestructive && { color: theme.error }
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingsSubtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={switchValue ? theme.buttonText : theme.textTertiary}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { theme, themeMode, toggleTheme, accentId, setAccentId } = useTheme();
  const { enabled: soundsEnabled, setEnabled: setSoundsEnabled } = useSound();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.surface }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Account</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.card, borderColor: theme.borderLight }]}>
            <SettingsItem
              icon="person-outline"
              title="My Info"
              subtitle="View your account information"
              onPress={() => router.push("/user-info")}
            />
            <SettingsItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="One streak reminder per day, plus optional nudges"
              onPress={() => router.push("/NotificationsScreen")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Appearance</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.card, borderColor: theme.borderLight, paddingBottom: 8 }]}>
            <SettingsItem
              icon="moon-outline"
              title="Night Mode"
              subtitle={themeMode === 'dark' ? 'Dark theme enabled' : 'Light theme enabled'}
              showSwitch={true}
              switchValue={themeMode === 'dark'}
              onSwitchChange={toggleTheme}
            />
            <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
              <Text style={[styles.settingsTitle, { color: theme.text, marginBottom: 4 }]}>Accent color</Text>
              <Text style={[styles.settingsSubtitle, { color: theme.textSecondary, marginBottom: 14 }]}>
                Primary highlight for buttons, bars, and signals
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {ACCENT_PRESETS.map(preset => {
                  const selected = accentId === preset.id;
                  const swatch = themeMode === 'dark' ? preset.dark : preset.light;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      onPress={() => setAccentId(preset.id as AccentId)}
                      activeOpacity={0.85}
                      style={{ alignItems: 'center', width: 56 }}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: swatch,
                          borderWidth: selected ? 3 : 1,
                          borderColor: selected ? theme.text : theme.border,
                        }}
                      />
                      <Text style={{ marginTop: 6, fontSize: 11, fontWeight: selected ? '700' : '500', color: theme.textSecondary }}>
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Sound</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.card, borderColor: theme.borderLight }]}>
            <SettingsItem
              icon="volume-high-outline"
              title="Game sounds"
              subtitle={soundsEnabled ? 'Babing on wins, taps, and unlocks' : 'Muted — silent feedback only'}
              showSwitch={true}
              switchValue={soundsEnabled}
              onSwitchChange={setSoundsEnabled}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>App</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.card, borderColor: theme.borderLight }]}>
            <SettingsItem
              icon="information-circle-outline"
              title="About"
              subtitle="Zencademy · XP unlocks training · coins buy shop"
              onPress={() => Alert.alert('About', 'Zencademy\n\nXP unlocks harder training.\nCoins buy avatars, badges, and ebooks.\nStreaks reward showing up.')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Account Actions</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.card, borderColor: theme.borderLight }]}>
            <SettingsItem
              icon="log-out-outline"
              title="Logout"
              subtitle="Sign out of your account"
              onPress={handleLogout}
              isDestructive={true}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 14,
  },
});
