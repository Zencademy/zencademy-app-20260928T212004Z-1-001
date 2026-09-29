import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../components/AuthContext';
import { useTheme } from '../../components/ThemeContext';
import { useXP } from '../../components/XPContext';
import { getXpForLevel } from '../../utils/levels';

interface InfoItemProps {
  icon: string;
  title: string;
  value: string;
  color?: string;
  theme?: any;
}

function InfoItem({ icon, title, value, color = "#666", theme }: InfoItemProps) {
  return (
    <View style={[styles.infoItem, { borderBottomColor: theme?.border || '#f8f8f8' }]}>
      <View style={styles.infoItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={color} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.infoTitle, { color: theme?.textSecondary || '#666' }]}>{title}</Text>
          <Text style={[styles.infoValue, { color: theme?.text || color }]}>{value}</Text>
        </View>
      </View>
    </View>
  );
}

export default function UserInfoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { name, level, streak, xp } = useXP();
  const { theme } = useTheme();

  const xpToNextLevel = getXpForLevel(level);
  const xpProgress = ((xp / xpToNextLevel) * 100).toFixed(1);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.surface }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Info</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileSection, { borderBottomColor: theme.border }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarText}>
                {name && name.length > 0 ? name.charAt(0).toUpperCase() : "?"}
              </Text>
            </View>
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>{name}</Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email}</Text>
        </View>

        <View style={[styles.statsSection, { borderBottomColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="star" size={24} color="#FFD700" />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{level}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Level</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="flame" size={24} color="#FF6B35" />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{streak}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day Streak</Text>
            </View>
          </View>
        </View>

        <View style={[styles.progressSection, { borderBottomColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Progress</Text>
          <View style={[styles.progressCard, { backgroundColor: theme.card }]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressTitle, { color: theme.text }]}>Points to Next Level</Text>
              <Text style={[styles.progressText, { color: theme.textSecondary }]}>{xp} / {xpToNextLevel} Points</Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: theme.surface }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(100, (xp / xpToNextLevel) * 100)}%`, backgroundColor: theme.primary }
                ]} 
              />
            </View>
            <Text style={[styles.progressPercentage, { color: theme.textSecondary }]}>{xpProgress}%</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Account Information</Text>
          <View style={[styles.infoList, { backgroundColor: theme.card }]}>
            <InfoItem
              icon="mail-outline"
              title="Email"
              value={user?.email || "Not available"}
              color="#007AFF"
              theme={theme}
            />
            <InfoItem
              icon="person-outline"
              title="Display Name"
              value={name || "Not set"}
              color="#34C759"
              theme={theme}
            />
            <InfoItem
              icon="calendar-outline"
              title="Member Since"
              value={user?.metadata?.creationTime ? 
                new Date(user.metadata.creationTime).toLocaleDateString() : 
                "Unknown"
              }
              color="#FF9500"
              theme={theme}
            />
            <InfoItem
              icon="shield-outline"
              title="Account Status"
              value={user?.emailVerified ? "Verified" : "Not Verified"}
              color={user?.emailVerified ? "#34C759" : "#FF3B30"}
              theme={theme}
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
  },
  statsSection: {
    paddingVertical: 24,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statCard: {
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  progressSection: {
    paddingVertical: 24,
    borderBottomWidth: 1,
  },
  progressCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    textAlign: 'center',
  },
  infoSection: {
    paddingVertical: 24,
  },
  infoList: {
    borderRadius: 16,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  infoItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
});
