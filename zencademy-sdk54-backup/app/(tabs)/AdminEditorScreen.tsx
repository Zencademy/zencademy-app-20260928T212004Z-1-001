import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useAuth } from "../../components/AuthContext";
import { useTheme } from "../../components/ThemeContext";
import { useXP } from "../../components/XPContext";

export default function AdminEditorScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { xp, level, totalPoints, addXP, addXp } = useXP();
  
  const [pointsInput, setPointsInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddPoints = async () => {
    const points = parseInt(pointsInput);
    if (isNaN(points) || points <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid positive number");
      return;
    }

    setLoading(true);
    try {
      await addXP(points);
      setPointsInput("");
      Alert.alert("Success", `Added ${points} points!`);
    } catch (error) {
      Alert.alert("Error", "Failed to add points");
    } finally {
      setLoading(false);
    }
  };

  const handleSubtractPoints = async () => {
    const points = parseInt(pointsInput);
    if (isNaN(points) || points <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid positive number");
      return;
    }

    if (totalPoints < points) {
      Alert.alert("Insufficient Points", `You only have ${totalPoints} points`);
      return;
    }

    setLoading(true);
    try {
      await addXP(-points);
      setPointsInput("");
      Alert.alert("Success", `Subtracted ${points} points!`);
    } catch (error) {
      Alert.alert("Error", "Failed to subtract points");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPoints = async () => {
    const points = parseInt(pointsInput);
    if (isNaN(points) || points < 0) {
      Alert.alert("Invalid Input", "Please enter a valid non-negative number");
      return;
    }

    setLoading(true);
    try {
      const difference = points - totalPoints;
      await addXP(difference);
      setPointsInput("");
      Alert.alert("Success", `Set points to ${points}!`);
    } catch (error) {
      Alert.alert("Error", "Failed to set points");
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: "+10", value: 10 },
    { label: "+50", value: 50 },
    { label: "+100", value: 100 },
    { label: "+500", value: 500 },
    { label: "+1000", value: 1000 },
  ];

  const quickSubtract = [
    { label: "-10", value: 10 },
    { label: "-50", value: 50 },
    { label: "-100", value: 100 },
    { label: "-500", value: 500 },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <Pressable 
          style={[styles.backButton, { backgroundColor: theme.surface }]} 
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Admin Editor</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Stats */}
        <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statsTitle, { color: theme.text }]}>Current Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Level</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{level}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Level Points</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{xp}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Points</Text>
              <Text style={[styles.statValue, { color: theme.primary }]}>{totalPoints.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Custom Points Input */}
        <View style={[styles.inputCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Custom Points Adjustment</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            placeholder="Enter points amount"
            placeholderTextColor={theme.textSecondary}
            value={pointsInput}
            onChangeText={setPointsInput}
            keyboardType="numeric"
            editable={!loading}
          />
          
          <View style={styles.actionButtons}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: theme.primary }, loading && styles.buttonDisabled]}
              onPress={handleAddPoints}
              disabled={loading}
            >
              <Ionicons name="add" size={20} color={theme.buttonText} />
              <Text style={[styles.actionButtonText, { color: theme.buttonText }]}>Add Points</Text>
            </Pressable>
            
            <Pressable
              style={[styles.actionButton, { backgroundColor: theme.error }, loading && styles.buttonDisabled]}
              onPress={handleSubtractPoints}
              disabled={loading}
            >
              <Ionicons name="remove" size={20} color={theme.buttonText} />
              <Text style={[styles.actionButtonText, { color: theme.buttonText }]}>Subtract Points</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.setButton, { backgroundColor: theme.surface, borderColor: theme.border }, loading && styles.buttonDisabled]}
            onPress={handleSetPoints}
            disabled={loading}
          >
            <Ionicons name="create-outline" size={18} color={theme.text} />
            <Text style={[styles.setButtonText, { color: theme.text }]}>Set Exact Amount</Text>
          </Pressable>
        </View>

        {/* Quick Add Actions */}
        <View style={[styles.quickCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Quick Add</Text>
          <View style={styles.quickButtons}>
            {quickActions.map((action) => (
              <Pressable
                key={action.label}
                style={[styles.quickButton, { backgroundColor: theme.primary }, loading && styles.buttonDisabled]}
                onPress={async () => {
                  setLoading(true);
                  try {
                    await addXP(action.value);
                    Alert.alert("Success", `Added ${action.value} points!`);
                  } catch (error) {
                    Alert.alert("Error", "Failed to add points");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                <Text style={[styles.quickButtonText, { color: theme.buttonText }]}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Quick Subtract Actions */}
        <View style={[styles.quickCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Quick Subtract</Text>
          <View style={styles.quickButtons}>
            {quickSubtract.map((action) => (
              <Pressable
                key={action.label}
                style={[styles.quickButton, { backgroundColor: theme.error }, loading && styles.buttonDisabled]}
                onPress={async () => {
                  if (totalPoints < action.value) {
                    Alert.alert("Insufficient Points", `You only have ${totalPoints} points`);
                    return;
                  }
                  setLoading(true);
                  try {
                    await addXP(-action.value);
                    Alert.alert("Success", `Subtracted ${action.value} points!`);
                  } catch (error) {
                    Alert.alert("Error", "Failed to subtract points");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                <Text style={[styles.quickButtonText, { color: theme.buttonText }]}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Info */}
        <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="information-circle-outline" size={20} color={theme.textSecondary} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Changes are saved immediately to Supabase. Use this tool for testing and verification purposes.
          </Text>
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
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  inputCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    padding: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  setButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  setButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  quickCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  quickButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickButton: {
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  quickButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

