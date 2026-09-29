import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../components/ThemeContext';

// Configure notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  time: string; // HH:mm format
  messages: string[]; // Motivational messages pool
}

const DEFAULT_NOTIFICATIONS: NotificationSetting[] = [
  {
    id: 'morning',
    title: 'Morning Motivation',
    description: 'Start your day with inspiration',
    icon: 'sunny-outline',
    enabled: true,
    time: '08:00',
    messages: [
      'You don\'t need motivation — you need standards.',
      'Discomfort creates the version of you comfort promised.',
      'No one is coming to save you — and that\'s the power.',
      'You can\'t build greatness with morning excuses.',
      'Control your mind before it controls your day.',
      'Stay cold. Stay focused. Stay untouchable.',
      'Your emotions don\'t deserve leadership.',
      'The goal isn\'t to feel ready — it\'s to act ready.',
      'Weak mornings create average lives.',
      'You either train your mind or it trains your limits.',
      'Comfort is the most expensive addiction.',
      'The world belongs to the ones who do it tired.',
      'You can\'t be legendary and well-rested.',
      'Your discipline is louder than any alarm.',
      'Every sunrise tests who you really are.',
      'Motivation fades. Identity doesn\'t.',
      'Routine beats talent when talent sleeps in.',
      'Your future self is watching what you do this morning.',
      'Stop searching for balance. Build endurance.',
      'The quiet ones working at 6AM will own everything at 6PM.',
    ],
  },
  {
    id: 'midday',
    title: 'Midday Boost',
    description: 'Stay focused and energized',
    icon: 'flash-outline',
    enabled: true,
    time: '13:00',
    messages: [
      'The day isn\'t over — but your excuses should be.',
      'Refocus. Recenter. Restart. You still have time to win.',
      'Half the day is gone. The other half decides who you become.',
      'Discipline doesn\'t get tired — emotion does.',
      'Midday is when average people slow down. You accelerate.',
      'Focus isn\'t motivation — it\'s precision.',
      'You didn\'t come this far to scroll your potential away.',
      'Every choice after noon defines your night.',
      'Momentum is built in the hours no one celebrates.',
      'Success doesn\'t reward early starters — it rewards consistent ones.',
      'Your energy is currency. Spend it where it compounds.',
      'One calm, intentional hour can fix an entire chaotic day.',
      'Don\'t chase productivity — chase alignment.',
      'You can\'t afford emotional noise at midday.',
      'Reset your posture. Reset your mind. Keep going.',
      'Average minds get tired. Focused ones adapt.',
      'You don\'t need caffeine — you need clarity.',
      'Midday silence is the strongest form of power.',
      'You\'re either distracted or dangerous. Choose.',
      'The day isn\'t testing your time — it\'s testing your control.',
    ],
  },
  {
    id: 'evening',
    title: 'Evening Reflection',
    description: 'Reflect on your progress',
    icon: 'moon-outline',
    enabled: true,
    time: '20:00',
    messages: [
      'The day ends — your standard doesn\'t.',
      'You weren\'t tired. You were undisciplined.',
      'Review your day like a scientist, not a victim.',
      'The way you close the day writes tomorrow\'s tone.',
      'Reflection is the gym of awareness.',
      'You don\'t need peace — you need purpose.',
      'Night doesn\'t mean rest. It means recalibration.',
      'Success is built in silence after everyone\'s done talking.',
      'You can\'t sleep peacefully with unfinished promises.',
      'Your mind knows if you gave everything — that\'s your real score.',
      'You didn\'t have a hard day. You had a day that tested your focus.',
      'Rest isn\'t escape. It\'s recovery for another round.',
      'Most people recharge by disconnecting — strong minds recharge by reflecting.',
      'End the day with clarity, not regret.',
      'Your routine at night exposes your discipline, not your fatigue.',
      'Nothing haunts like wasted potential — even in sleep.',
      'Be grateful, not comfortable.',
      'The calm after chaos is earned, not gifted.',
      'You don\'t need to be perfect — just consistent when it\'s hardest.',
      'Let the world sleep. You\'re still becoming.',
    ],
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<NotificationSetting[]>(DEFAULT_NOTIFICATIONS);
  const [showPicker, setShowPicker] = useState<string | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const previousNotificationsRef = useRef<NotificationSetting[]>(DEFAULT_NOTIFICATIONS);
  const pendingTimeChangeRef = useRef<{ id: string; time: string } | null>(null);

  // Load saved notification settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem('@notification_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          console.log('Loaded notification settings:', parsed.map((n: NotificationSetting) => ({
            id: n.id,
            enabled: n.enabled,
            time: n.time,
          })));
          setNotifications(parsed);
          previousNotificationsRef.current = parsed;
        } else {
          console.log('No saved settings, using defaults');
          previousNotificationsRef.current = DEFAULT_NOTIFICATIONS;
        }
        setIsInitialLoad(false);
      } catch (error) {
        console.error('Error loading notification settings:', error);
        setIsInitialLoad(false);
      }
    };
    loadSettings();
  }, []);

  // Request notification permissions
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive motivational messages.'
          );
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    };

    requestPermissions();
  }, []);


  // Helper function to schedule a single notification
  const scheduleSingleNotification = async (notif: NotificationSetting): Promise<string | null> => {
    try {
      const [hours, minutes] = notif.time.split(':').map(Number);
      
      // Validate time format
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.log('Invalid time format:', notif.time);
        return null;
      }

      const randomMessage = notif.messages[Math.floor(Math.random() * notif.messages.length)];

      console.log(`Scheduling ${notif.id} at ${hours}:${minutes.toString().padStart(2, '0')}`);

      // Cancel existing notification if any
      try {
        await Notifications.cancelScheduledNotificationAsync(`notification_${notif.id}`);
      } catch (error) {
        // Ignore if notification doesn't exist
      }

      // Calculate if time has passed today - if so, schedule for tomorrow first
      const now = new Date();
      const todayAtTime = new Date(now);
      todayAtTime.setHours(hours, minutes, 0, 0);
      
      // Use date trigger to ensure it doesn't fire immediately
      // If time has passed today, schedule for tomorrow, otherwise schedule for today
      const targetDate = todayAtTime <= now 
        ? new Date(todayAtTime.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
        : todayAtTime; // Today

      // Schedule with date trigger first, then it will repeat daily
      // This ensures it only fires at the correct time
      const notificationId = await Notifications.scheduleNotificationAsync({
        identifier: `notification_${notif.id}`,
        content: {
          title: notif.title,
          body: randomMessage,
          sound: true,
          data: { notificationId: notif.id },
        },
        trigger: {
          type: 'date',
          date: targetDate,
          repeats: true,
        } as any,
      });

      console.log(`Notification ${notif.id} scheduled with ID: ${notificationId} at ${hours}:${minutes.toString().padStart(2, '0')}`);
      return notificationId;
    } catch (error) {
      console.error(`Error scheduling notification ${notif.id}:`, error);
      return null;
    }
  };

  const toggleNotification = async (id: string) => {
    const notif = notifications.find(n => n.id === id);
    if (!notif) return;

    try {
      if (!notif.enabled) {
        // Enabling notification - schedule it
        const notificationId = await scheduleSingleNotification(notif);
        if (notificationId) {
          const updated = notifications.map(n => (n.id === id ? { ...n, enabled: true } : n));
          setNotifications(updated);
          await AsyncStorage.setItem('@notification_settings', JSON.stringify(updated));
        } else {
          Alert.alert(
            'Error',
            'Failed to enable notification. Please check your notification permissions.'
          );
        }
      } else {
        // Disabling notification - cancel it
        try {
          await Notifications.cancelScheduledNotificationAsync(`notification_${notif.id}`);
        } catch (error) {
          console.error(`Error canceling notification ${notif.id}:`, error);
        }
        const updated = notifications.map(n => (n.id === id ? { ...n, enabled: false } : n));
        setNotifications(updated);
        await AsyncStorage.setItem('@notification_settings', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error toggling notification:', error);
      Alert.alert('Error', 'Failed to update notification. Please try again.');
    }
  };

  const openTimePicker = (id: string) => {
    const notif = notifications.find(n => n.id === id);
    if (notif) {
      const [hours, minutes] = notif.time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      setPickerDate(date);
      setShowPicker(id);
    }
  };

  const handleTimeChange = async (event: any, selectedDate?: Date, id?: string) => {
    if (!id || !selectedDate) return;

    const hours = selectedDate.getHours().toString().padStart(2, '0');
    const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
    const newTime = `${hours}:${minutes}`;

    if (Platform.OS === 'android') {
      // On Android, only update when user confirms (event.type === 'set')
      // and only if it's different from current time
      if (event.type === 'set') {
        const currentNotif = notifications.find(n => n.id === id);
        if (currentNotif && currentNotif.time !== newTime) {
          const updatedNotifications = notifications.map(n => 
            n.id === id ? { ...n, time: newTime } : n
          );
          setNotifications(updatedNotifications);
          
          // If notification is enabled, reschedule it with new time
          if (currentNotif.enabled) {
            try {
              await scheduleSingleNotification({ ...currentNotif, time: newTime });
              await AsyncStorage.setItem('@notification_settings', JSON.stringify(updatedNotifications));
            } catch (error) {
              console.error('Error rescheduling notification:', error);
              Alert.alert('Error', 'Failed to update notification time. Please try again.');
            }
          } else {
            await AsyncStorage.setItem('@notification_settings', JSON.stringify(updatedNotifications));
          }
        }
      }
      // Always close picker on Android
      if (event.type === 'set' || event.type === 'dismissed') {
        setShowPicker(null);
      }
    } else {
      // On iOS, store the pending change but don't update state yet
      pendingTimeChangeRef.current = { id, time: newTime };
      setPickerDate(selectedDate);
    }
  };

  const confirmTimeChange = async () => {
    if (pendingTimeChangeRef.current) {
      const { id, time } = pendingTimeChangeRef.current;
      const currentNotif = notifications.find(n => n.id === id);
      
      if (currentNotif && currentNotif.time !== time) {
        const updatedNotifications = notifications.map(n => 
          n.id === id ? { ...n, time } : n
        );
        setNotifications(updatedNotifications);
        
        // If notification is enabled, reschedule it with new time
        if (currentNotif.enabled) {
          try {
            await scheduleSingleNotification({ ...currentNotif, time });
            await AsyncStorage.setItem('@notification_settings', JSON.stringify(updatedNotifications));
          } catch (error) {
            console.error('Error rescheduling notification:', error);
            Alert.alert('Error', 'Failed to update notification time. Please try again.');
          }
        } else {
          await AsyncStorage.setItem('@notification_settings', JSON.stringify(updatedNotifications));
        }
      }
      
      pendingTimeChangeRef.current = null;
    }
    setShowPicker(null);
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={[styles.introTitle, { color: theme.text }]}>Daily Motivational Notifications</Text>
          <Text style={[styles.introText, { color: theme.textSecondary }]}>
            Get daily inspiration and reminders to help you stay on track with your goals.
          </Text>
        </View>

        <View style={styles.notificationsSection}>
          {notifications.map((notif) => (
            <View
              key={notif.id}
              style={[styles.notificationCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={styles.notificationHeader}>
                <View style={styles.notificationLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: theme.surface }]}>
                    <Ionicons name={notif.icon as any} size={24} color={theme.primary} />
                  </View>
                  <View style={styles.notificationInfo}>
                    <Text style={[styles.notificationTitle, { color: theme.text }]}>
                      {notif.title}
                    </Text>
                    <Text style={[styles.notificationDescription, { color: theme.textSecondary }]}>
                      {notif.description}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notif.enabled}
                  onValueChange={() => toggleNotification(notif.id)}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={notif.enabled ? theme.buttonText : theme.textTertiary}
                />
              </View>

              {notif.enabled && (
                <View style={[styles.timeSection, { borderTopColor: theme.border }]}>
                  <TouchableOpacity
                    style={[styles.timeButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => openTimePicker(notif.id)}
                  >
                    <Ionicons name="time-outline" size={20} color={theme.primary} />
                    <Text style={[styles.timeText, { color: theme.text }]}>{notif.time}</Text>
                    <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
                  </TouchableOpacity>
                </View>
              )}

              {showPicker === notif.id && (
                <DateTimePicker
                  value={pickerDate}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => handleTimeChange(event, date, notif.id)}
                  style={styles.timePicker}
                />
              )}

              {Platform.OS === 'ios' && showPicker === notif.id && (
                <View style={styles.iosPickerActions}>
                  <TouchableOpacity
                    style={[styles.iosPickerButton, { backgroundColor: theme.border }]}
                    onPress={() => {
                      pendingTimeChangeRef.current = null;
                      setShowPicker(null);
                    }}
                  >
                    <Text style={[styles.iosPickerButtonText, { color: theme.text }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.iosPickerButton, { backgroundColor: theme.primary }]}
                    onPress={confirmTimeChange}
                  >
                    <Text style={[styles.iosPickerButtonText, { color: theme.buttonText }]}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
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
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  introSection: {
    marginTop: 24,
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  introText: {
    fontSize: 15,
    lineHeight: 22,
  },
  notificationsSection: {
    marginBottom: 32,
  },
  notificationCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  timeSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  timeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  timePicker: {
    marginTop: 12,
    height: Platform.OS === 'ios' ? 200 : undefined,
  },
  iosPickerActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  iosPickerButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  iosPickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

