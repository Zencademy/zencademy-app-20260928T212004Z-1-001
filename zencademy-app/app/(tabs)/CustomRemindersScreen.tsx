import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Keyboard,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import uuid from "react-native-uuid";
import { useTheme } from "../../components/ThemeContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Configure notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const STORAGE_KEY = "@custom_reminders_final";

interface Reminder {
  id: string;
  title: string;
  desc?: string;
  time: string;
  enabled: boolean;
  notifId?: string | null;
}

function isReminderNow(reminder: Reminder): boolean {
  if (!reminder.enabled) return false;
  
  const now = new Date();
  const [hh, mm] = reminder.time.split(":").map(Number);
  
  if (isNaN(hh) || isNaN(mm)) return false;
  
  // Check if it's within the current minute
  return now.getHours() === hh && now.getMinutes() === mm;
}

export default function CustomRemindersScreen() {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [time, setTime] = useState("08:00");
  const [enabled, setEnabled] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerValue, setPickerValue] = useState(new Date(2000, 1, 1, 8, 0));
  const [loading, setLoading] = useState(false);
  const [animated] = useState(new Animated.Value(0));
  const [nowMinute, setNowMinute] = useState(new Date().getMinutes());
  const inputRef = useRef<TextInput>(null);
  const [infoMsg, setInfoMsg] = useState("");
  const [clearLoading, setClearLoading] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isLoading, setIsLoading] = useState(true);
  const [modalScale] = useState(new Animated.Value(0.8));
  const [modalOpacity] = useState(new Animated.Value(0));
  const [tempPickerValue, setTempPickerValue] = useState<Date | null>(null);
  const [tempHour, setTempHour] = useState<number>(8);
  const [tempMinute, setTempMinute] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => setNowMinute(new Date().getMinutes()), 10000);
    return () => clearInterval(timer);
  }, []);

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
            "Permission Required",
            "Please enable notifications to receive reminders.",
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        console.log('Error requesting notification permissions:', error);
      }
    };
    
    requestPermissions();
    loadReminders();
  }, []);

  // Animation when reminders load
  useEffect(() => {
    if (reminders.length > 0) {
      Animated.timing(animated, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }
  }, [reminders]);

  // Modal animations
  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(modalOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(modalScale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(modalScale, { toValue: 0.8, duration: 200, useNativeDriver: true })
      ]).start();
    }
  }, [modalVisible]);

  const loadReminders = async () => {
    try {
      setIsLoading(true);
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      let arr: Reminder[] = [];
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          arr = Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch {
          arr = [];
        }
      }
      console.log('Loaded reminders:', arr);
      setReminders(arr);
    } catch (e) {
      console.log('Error loading reminders:', e);
      setReminders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!Array.isArray(reminders)) {
      setReminders([]);
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  const openPicker = () => {
    Keyboard.dismiss();
    const [hh, mm] = time.split(":").map(Number);
    setPickerValue(new Date(2000, 1, 1, hh || 8, mm || 0));
    setTempPickerValue(new Date(2000, 1, 1, hh || 8, mm || 0));
    setTempHour(Number.isFinite(hh) ? (hh as number) : 8);
    setTempMinute(Number.isFinite(mm) ? (mm as number) : 0);
    setShowPicker(true);
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (event.type === "set" && selectedDate) {
      const h = selectedDate.getHours().toString().padStart(2, "0");
      const m = selectedDate.getMinutes().toString().padStart(2, "0");
      setTime(`${h}:${m}`);
      setPickerValue(selectedDate);
    }
  };

  const closeTimePicker = () => {
    setShowPicker(false);
  };

  const handleModalOutsidePress = () => {
    Keyboard.dismiss();
    closeTimePicker();
  };

  const resetModal = () => {
    setEditId(null); 
    setTitle(""); 
    setDesc(""); 
    setTime("08:00"); 
    setEnabled(true); 
    setInfoMsg("");
  };

  const openModal = (reminder: Reminder | null = null) => {
    if (reminder) {
      setEditId(reminder.id);
      setTitle(reminder.title);
      setDesc(reminder.desc || "");
      setTime(reminder.time);
      setEnabled(reminder.enabled);
    } else {
      resetModal();
    }
    setModalVisible(true);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const closeModal = () => { 
    setModalVisible(false); 
    setTimeout(() => resetModal(), 200);
  };

  async function scheduleNotification(title: string, desc: string, time: string, id: string): Promise<string | null> {
    try {
      const [hh, mm] = time.split(":").map(Number);
      if (isNaN(hh) || isNaN(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) {
        console.log('Invalid time format:', time);
        return null;
      }
      
      let now = new Date();
      let target = new Date(now);
      target.setHours(hh, mm, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      
      // Cancel existing notification if any
      let stored = await AsyncStorage.getItem(STORAGE_KEY);
      let list: Reminder[] = stored ? JSON.parse(stored) : [];
      let old = list.find(r => r.id === id);
      if (old && old.notifId) {
        try { 
          await Notifications.cancelScheduledNotificationAsync(old.notifId); 
        } catch (e) {
          console.log('Error canceling old notification:', e);
        }
      }
      
      const notifId = await Notifications.scheduleNotificationAsync({
        content: { 
          title, 
          body: desc || "It's time for your custom reminder!", 
          sound: true,
          data: { reminderId: id }
        },
        trigger: { 
          type: 'date',
          date: target 
        } as any,
      });
      
      console.log('Scheduled notification:', { id, notifId, target });
      return notifId;
    } catch (error) {
      console.log('Error scheduling notification:', error);
      return null;
    }
  }

  const handleSave = async () => {
    if (!title.trim()) { 
      Alert.alert("Title required", "Please add a title for your reminder."); 
      return; 
    }
    
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      Alert.alert("Invalid time", "Please select a valid time.");
      return;
    }
    
    const [hh, mm] = time.split(":").map(Number);
    const now = new Date();
    const pick = new Date(now);
    pick.setHours(hh, mm, 0, 0);
    
    if (pick <= now) {
      setInfoMsg("Reminder will be scheduled for tomorrow at the selected time.");
    } else {
      setInfoMsg("");
    }
    
    setLoading(true);
    let notifId: string | null = null;
    
    if (enabled) {
      try { 
        notifId = await scheduleNotification(title.trim(), desc.trim(), time, editId || uuid.v4() as string); 
        if (!notifId) {
          Alert.alert("Notification Error", "Failed to schedule notification. Please check your notification permissions.");
        }
      } catch (e) { 
        console.log('Error scheduling notification:', e);
        notifId = null; 
        Alert.alert("Notification Error", "Failed to schedule notification. Please try again.");
      }
    }
    
    if (editId) {
      setReminders(reminders => {
        const arr = reminders.map(r =>
          r.id === editId
            ? { ...r, title: title.trim(), desc: desc.trim(), time, enabled, notifId }
            : r
        );
        console.log('Updated reminder:', arr);
        return arr;
      });
    } else {
      setReminders(reminders => {
        const newReminder = { 
          id: uuid.v4() as string, 
          title: title.trim(), 
          desc: desc.trim(), 
          time, 
          enabled, 
          notifId 
        };
        const updatedReminders = [...reminders, newReminder];
        console.log('Added new reminder:', newReminder);
        console.log('All reminders after add:', updatedReminders);
        return updatedReminders;
      });
    }
    
    // Premium animation feedback
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    
    // Reset animation to show new reminder
    animated.setValue(0);
    setTimeout(() => {
      Animated.timing(animated, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 100);
    
    setLoading(false); 
    closeModal();
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Reminder", "Are you sure you want to delete this reminder?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            const rem = reminders.find(r => r.id === id);
            if (rem && rem.notifId && rem.enabled) {
              try { 
                await Notifications.cancelScheduledNotificationAsync(rem.notifId); 
              } catch (e) {
                console.log('Error canceling notification:', e);
              }
            }
            setReminders(reminders => reminders.filter(r => r.id !== id));
          } catch (error) {
            console.log('Error deleting reminder:', error);
            Alert.alert("Error", "Failed to delete reminder. Please try again.");
          }
        }
      }
    ]);
  };

  const handleToggle = async (id: string) => {
    const r = reminders.find(r => r.id === id);
    if (!r) return;
    
    let updated = [...reminders];
    const idx = updated.findIndex(rem => rem.id === id);

    try {
      if (!r.enabled) {
        const notifId = await scheduleNotification(r.title, r.desc || "", r.time, id);
        if (notifId) {
          updated[idx] = { ...r, enabled: true, notifId };
        } else {
          Alert.alert("Error", "Failed to enable reminder. Please check notification permissions.");
          return;
        }
      } else {
        if (r.notifId) {
          try { 
            await Notifications.cancelScheduledNotificationAsync(r.notifId); 
          } catch (e) {
            console.log('Error canceling notification:', e);
          }
        }
        updated[idx] = { ...r, enabled: false, notifId: null };
      }
      setReminders(updated);
    } catch (error) {
      console.log('Error toggling reminder:', error);
      Alert.alert("Error", "Failed to update reminder. Please try again.");
    }
  };

  const handleClearAllNotifs = async () => {
    Alert.alert(
      "Clear All Notifications", 
      "This will cancel all scheduled notifications. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              setClearLoading(true);
              await Notifications.cancelAllScheduledNotificationsAsync();
              // Update all reminders to disabled state
              setReminders(reminders => 
                reminders.map(r => ({ ...r, enabled: false, notifId: null }))
              );
              Alert.alert("Success", "All notifications have been cleared!");
            } catch (error) {
              console.log('Error clearing notifications:', error);
              Alert.alert("Error", "Failed to clear notifications. Please try again.");
            } finally {
              setClearLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.surface }]} 
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Reminders</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Stats */}
      <View style={[styles.statsContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.statIconContainer, { backgroundColor: theme.surface }]}>
            <Ionicons name="notifications-outline" size={20} color={theme.text} />
          </View>
          <Text style={[styles.statNumber, { color: theme.text }]}>{reminders.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.statIconContainer, { backgroundColor: theme.surface }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color={theme.text} />
          </View>
          <Text style={[styles.statNumber, { color: theme.text }]}>{reminders.filter(r => r.enabled).length}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active</Text>
        </View>
        {reminders.length > 0 && (
          <TouchableOpacity 
            style={[styles.clearButton, { backgroundColor: theme.error, shadowColor: theme.error }]} 
            onPress={handleClearAllNotifs}
            disabled={clearLoading}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            {clearLoading ? (
              <ActivityIndicator size="small" color={theme.buttonText} />
            ) : (
              <Ionicons name="trash-outline" size={20} color={theme.buttonText} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={reminders.length === 0 ? styles.emptyContainer : styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Loading...</Text>
          </View>
        ) : reminders.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.surface }]}>
              <Ionicons name="notifications-outline" size={48} color={theme.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Reminders</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Create your first reminder to get started</Text>
          </View>
        ) : (
          reminders.map((reminder, index) => {
            const isNow = isReminderNow(reminder);
            return (
              <Animated.View
                key={reminder.id}
                style={[
                  styles.reminderCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  isNow && { borderColor: theme.primary, borderWidth: 2 },
                  {
                    opacity: animated,
                    transform: [
                      { 
                        translateY: animated.interpolate({ 
                          inputRange: [0, 1], 
                          outputRange: [30 + index * 15, 0] 
                        }) 
                      },
                      { scale: scaleAnim }
                    ]
                  }
                ]}
              >
                <View style={styles.reminderHeader}>
                  <View style={styles.reminderInfo}>
                    <Text style={[styles.reminderTitle, { color: theme.text }]}>
                      {reminder.title}
                    </Text>
                    {reminder.desc && (
                      <Text style={[styles.reminderDesc, { color: theme.textSecondary }]}>{reminder.desc}</Text>
                    )}
                    <View style={[styles.timeContainer, { backgroundColor: theme.surface }]}>
                      <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
                      <Text style={[styles.timeText, { color: theme.text }]}>{reminder.time}</Text>
                      {isNow && (
                        <View style={[styles.nowBadgeContainer, { backgroundColor: theme.primary }]}>
                          <Text style={styles.nowBadge}>NOW</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.reminderActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: theme.surface }]}
                      onPress={() => openModal(reminder)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="create-outline" size={20} color={theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: theme.error }]}
                      onPress={() => handleDelete(reminder.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={20} color={theme.buttonText} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={[styles.reminderFooter, { borderTopColor: theme.border }]}>
                  <Switch
                    value={reminder.enabled}
                    onValueChange={() => handleToggle(reminder.id)}
                    trackColor={{ false: theme.surface, true: theme.primary }}
                    thumbColor={reminder.enabled ? theme.buttonText : theme.textSecondary}
                    style={styles.switch}
                  />
                  <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                    {reminder.enabled ? "Active" : "Inactive"}
                  </Text>
                </View>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: theme.primary }]} 
        onPress={() => openModal()}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={theme.buttonText} />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="none">
        <TouchableWithoutFeedback onPress={handleModalOutsidePress}>
          <Animated.View 
            style={[
              styles.modalOverlay,
              { opacity: modalOpacity, backgroundColor: theme.overlay }
            ]}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View 
                style={[
                  styles.modalContent,
                  { backgroundColor: theme.card },
                  {
                    opacity: modalOpacity,
                    transform: [{ scale: modalScale }]
                  }
                ]}
              >
                <View style={styles.modalContentTouchable}>
                  <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>
                      {editId ? "Edit Reminder" : "New Reminder"}
                    </Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={closeModal}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close" size={24} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  
                  <TextInput
                    ref={inputRef}
                    style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                    placeholder="Reminder title"
                    placeholderTextColor={theme.textSecondary}
                    value={title}
                    onChangeText={setTitle}
                    maxLength={40}
                  />
                  
                  <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                    placeholder="Description (optional)"
                    placeholderTextColor={theme.textSecondary}
                    value={desc}
                    onChangeText={setDesc}
                    maxLength={60}
                    multiline
                    numberOfLines={2}
                  />
                  
                  <TouchableOpacity 
                    style={[styles.timeButton, { backgroundColor: theme.surface, borderColor: theme.border }]} 
                    onPress={openPicker}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="time-outline" size={20} color={theme.text} />
                    <Text style={[styles.timeButtonText, { color: theme.text }]}>{time}</Text>
                    <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
                  </TouchableOpacity>
                  
                  {showPicker && (
                    <Modal visible transparent animationType="fade" onRequestClose={closeTimePicker}>
                      <View style={[styles.pickerModalOverlay, { backgroundColor: theme.overlay }]}> 
                        <View style={[styles.customPickerCard, { backgroundColor: theme.card, borderColor: theme.border }]}> 
                          <View style={styles.sheetHandle} />
                          <View style={[styles.pickerModalHeader, { borderBottomColor: theme.border }]}> 
                            <Text style={[styles.pickerModalCancel, { color: theme.textSecondary }]} onPress={closeTimePicker}>Cancel</Text>
                            <Text style={[styles.pickerModalTitle, { color: theme.text }]}>Select Time</Text>
                            <Text
                              style={[styles.pickerModalDone, { color: theme.primary }]}
                              onPress={() => {
                                const hStr = tempHour.toString().padStart(2, '0');
                                const mStr = tempMinute.toString().padStart(2, '0');
                                const d = new Date(2000, 1, 1, tempHour, tempMinute);
                                setTime(`${hStr}:${mStr}`);
                                setPickerValue(d);
                                setShowPicker(false);
                              }}
                            >Done</Text>
                          </View>
                          <View style={styles.customPickerBody}>
                            <View style={styles.customPickerColumn}>
                              <Text style={[styles.columnLabel, { color: theme.textSecondary }]}>Hours</Text>
                              <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                                {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                                  <TouchableOpacity key={`h-${h}`} style={[styles.optionItem, { backgroundColor: h === tempHour ? theme.primary : theme.surface, borderColor: theme.border }]} onPress={() => setTempHour(h)}>
                                    <Text style={[styles.optionText, { color: h === tempHour ? theme.buttonText : theme.text }]}>{h.toString().padStart(2, '0')}</Text>
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            </View>
                            <View style={styles.customPickerColumn}>
                              <Text style={[styles.columnLabel, { color: theme.textSecondary }]}>Minutes</Text>
                              <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                                {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                                  <TouchableOpacity key={`m-${m}`} style={[styles.optionItem, { backgroundColor: m === tempMinute ? theme.primary : theme.surface, borderColor: theme.border }]} onPress={() => setTempMinute(m)}>
                                    <Text style={[styles.optionText, { color: m === tempMinute ? theme.buttonText : theme.text }]}>{m.toString().padStart(2, '0')}</Text>
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            </View>
                          </View>
                        </View>
                      </View>
                    </Modal>
                  )}
                  
                  <View style={styles.enableRow}>
                    <Text style={[styles.enableLabel, { color: theme.text }]}>Enable reminder</Text>
                    <Switch
                      value={enabled}
                      onValueChange={setEnabled}
                      trackColor={{ false: theme.surface, true: theme.primary }}
                      thumbColor={enabled ? theme.buttonText : theme.textSecondary}
                    />
                  </View>
                  
                  {infoMsg ? (
                    <View style={[styles.infoContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      <Ionicons name="information-circle-outline" size={16} color={theme.text} />
                      <Text style={[styles.infoText, { color: theme.text }]}>{infoMsg}</Text>
                    </View>
                  ) : null}
                  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity 
                      style={[styles.cancelButton, { backgroundColor: theme.surface, borderColor: theme.border }]} 
                      onPress={closeModal}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.saveButton, { backgroundColor: theme.primary }]} 
                      onPress={handleSave}
                      disabled={loading}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      activeOpacity={0.7}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color={theme.buttonText} />
                      ) : (
                        <Text style={[styles.saveButtonText, { color: theme.buttonText }]}>
                          {editId ? "Save" : "Create"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 14 : 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    flex: 1,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 44,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    minWidth: 100,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  statIconContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  clearButton: {
    backgroundColor: "#ff4757",
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#ff4757",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    backgroundColor: "#f8f8f8",
    borderRadius: 40,
    padding: 24,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  emptyTitle: {
    fontSize: 24,
    color: "#000",
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  reminderCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginVertical: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  activeReminderCard: {
    borderColor: "#000",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    borderWidth: 2,
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  reminderInfo: {
    flex: 1,
    marginRight: 16,
  },
  reminderTitle: {
    fontWeight: "700",
    fontSize: 18,
    color: "#000",
    marginBottom: 8,
    lineHeight: 24,
  },
  activeReminderTitle: {
    color: "#000",
  },
  reminderDesc: {
    fontSize: 15,
    color: "#666",
    marginBottom: 16,
    lineHeight: 22,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  timeText: {
    fontWeight: "600",
    fontSize: 16,
    color: "#000",
  },
  nowBadgeContainer: {
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  nowBadge: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  reminderActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f8f8f8",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  deleteButton: {
    backgroundColor: "#ff4757",
  },
  reminderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  statusText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  addButton: {
    position: "absolute",
    bottom: 40,
    right: 24,
    backgroundColor: "#000",
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalOverlayTouchable: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 0,
    minWidth: 320,
    maxWidth: 380,
    elevation: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    zIndex: 1001,
  },
  modalContentTouchable: {
    padding: 32,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 4,
  },
  input: {
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#000",
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 16,
  },
  timeButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  enableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  enableLabel: {
    fontSize: 16,
    color: "#000",
    fontWeight: "600",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e6f3ff",
  },
  infoText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#000",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  pickerModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  pickerModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  pickerModalCancel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  pickerModalDone: {
    fontSize: 16,
    color: "#000",
    fontWeight: "700",
  },
  pickerModalTimePicker: {
    backgroundColor: "#fff",
    marginTop: 10,
  },
  customPickerCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    width: '100%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#888',
    marginTop: 8,
    marginBottom: 4,
    opacity: 0.4,
  },
  customPickerBody: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  customPickerColumn: {
    flex: 1,
  },
  columnLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  columnScroll: {
    maxHeight: 240,
  },
  optionItem: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  inlineTimePicker: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginTop: 16,
    marginBottom: 16,
  },
  timePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  timePicker: {
    backgroundColor: "#fff",
    marginTop: 10,
  },
});
