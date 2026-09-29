import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import { useXP } from "../../components/XPContext";
import { getXpForLevel, LEVEL_UP_XP } from '../../utils/levels';

function getLast7DaysLabels(short = true) {
  const arr = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    arr.push(short
      ? d.toLocaleDateString("en-US", { weekday: "short" })
      : d.toISOString().slice(0, 10)
    );
  }
  return arr;
}

function getTotalXp(level, xp) {
  // Calculate total XP from all previous levels + current level XP
  let total = xp; // Current level XP
  for (let l = 1; l < level; l++) {
    total += getXpForLevel(l);
  }
  return total;
}

  const levelMilestones = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100];
const streakMilestones = [3, 5, 10, 20, 50, 100];

export default function StatisticsScreen() {
  const router = useRouter();
  const {
    xp, level, streak, completed = 0, unlockedBadges = [],
    xpHistory = [], timeHistory = []
  } = useXP();

  const dayKeys = getLast7DaysLabels(false);
  const daysLabels = getLast7DaysLabels(true);
  const xpLast7 = dayKeys.map(day =>
    (xpHistory.find(x => x.date === day) || { xp: 0 }).xp
  );
  const timeLast7 = dayKeys.map(day =>
    (timeHistory.find(t => t.date === day) || { time: 0 }).time
  );

  const avgXp = xpLast7.reduce((a, b) => a + b, 0) / 7;
  const recordXp = Math.max(...xpLast7);
  const recordDayIndex = xpLast7.indexOf(recordXp);
  const recordDay = daysLabels[recordDayIndex] || "-";
  const avgTime = timeLast7.reduce((a, b) => a + b, 0) / 7;
  const recordTime = Math.max(...timeLast7);

  const totalXp = getTotalXp(level, xp);

  const categoryProgress = [
    { label: "Logică", value: 17, icon: "bulb-outline" },
    { label: "Memorie", value: 12, icon: "layers-outline" },
    { label: "Rapid", value: 5, icon: "flash-outline" },
  ];

  let unlockedLevels = levelMilestones.filter(lv => level >= lv);
  let showLevelBadges = [...unlockedLevels];
  let unlockedStreaks = streakMilestones.filter(s => streak >= s);
  let showStreakBadges = [...unlockedStreaks];
  const premiumBadge = {
    id: "badge-premium",
    name: "Zencademy Legend",
    icon: "medal-outline",
    color: "#9747ff",
    description: unlockedBadges?.includes("badge-premium")
      ? "Legendary badge: Awarded to the most dedicated members."
      : "Buy from the Shop to become a Legend!",
    unlocked: unlockedBadges?.includes("badge-premium") || false,
  };

  const allUnlockedBadges = [
    ...showLevelBadges.map(lv => ({
      id: `lv${lv}`,
      name: `Level ${lv} Achieved`,
      icon: "star-outline",
      color: lv === 1 ? "#4fc3f7" : lv === 5 ? "#42e6a4" : lv === 10 ? "#ffd700" : lv === 15 ? "#d17fff" : "#ff9900",
      description: `Reach Level ${lv}`,
      unlocked: true,
    })),
    ...showStreakBadges.map(s => ({
      id: `streak${s}`,
      name: `${s}-Day Streak`,
      icon: "flame",
      color: s === 3 ? "#ffb74d" : s === 5 ? "#ff7e67" : s === 10 ? "#ff3e3e" : s === 20 ? "#c43ef6" : s === 50 ? "#2ed573" : "#3742fa",
      description: `Maintain a streak of ${s} days`,
      unlocked: true,
    })),
    {
      id: "lv10-streak10",
      name: "Disciplined Warrior",
      icon: "shield-checkmark-outline",
      color: "#00d7a7",
      description: "Reach Level 10 & 10-Day Streak",
      unlocked: level >= 10 && streak >= 10,
    },
    ...(unlockedBadges.includes("badge-premium") ? [premiumBadge] : []),
  ].filter(b => b.unlocked);

  const screenWidth = Dimensions.get("window").width;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#181818" />
        </Pressable>
        <Text style={styles.title}>Your Statistics</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <View style={styles.cardsRow}>
          <StatCard label="Total XP" value={totalXp} icon="star-outline" color="#f9be00" />
          <StatCard label="Level" value={level} icon="medal-outline" color="#4287f5" />
          <StatCard label="Streak" value={streak + "d"} icon="flame-outline" color="#ff4c4c" />
          <StatCard label="Completed" value={completed} icon="checkmark-done-outline" color="#3dbd63" />
        </View>

        <Text style={styles.sectionTitle}>XP Last 7 Days</Text>
        <LineChart
          data={{
            labels: daysLabels,
            datasets: [{ data: xpLast7 }]
          }}
          width={screenWidth - 24}
          height={180}
          yAxisSuffix=" XP"
          yAxisInterval={1}
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(25,25,50,${opacity})`,
            labelColor: (opacity = 1) => `rgba(90,90,90,${opacity})`,
            propsForDots: { r: "5", strokeWidth: "3", stroke: "#f9be00" }
          }}
          bezier
          style={styles.chart}
        />

        <Text style={styles.sectionTitle}>Hours Spent - Last 7 Days</Text>
        <BarChart
          data={{
            labels: daysLabels,
            datasets: [{ data: timeLast7 }]
          }}
          width={screenWidth - 24}
          height={160}
          fromZero
          yAxisSuffix="h"
          showValuesOnTopOfBars
          verticalLabelRotation={90}
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(100,100,100,${opacity})`,
            propsForBackgroundLines: { strokeDasharray: "" },
          }}
          style={styles.chart}
        />

        <View style={styles.inlineRow}>
          <Ionicons name="trending-up" size={22} color="#0af" />
          <Text style={styles.rowLabel}>Avg XP/day: </Text>
          <Text style={styles.rowVal}>{Math.round(avgXp)}</Text>
          <Ionicons name="trophy-outline" size={22} color="#f9be00" style={{ marginLeft: 18 }} />
          <Text style={styles.rowLabel}>Record: </Text>
          <Text style={styles.rowVal}>{recordXp} XP</Text>
          <Text style={styles.recordDay}>({recordDay})</Text>
        </View>
        <View style={styles.inlineRow}>
          <Ionicons name="time-outline" size={22} color="#4287f5" />
          <Text style={styles.rowLabel}>Avg h/day: </Text>
          <Text style={styles.rowVal}>{avgTime.toFixed(2)}h</Text>
          <Text style={[styles.rowLabel, { marginLeft: 10 }]}>Max: </Text>
          <Text style={styles.rowVal}>{recordTime.toFixed(2)}h</Text>
        </View>

        <Text style={styles.sectionTitle}>Progress by Category</Text>
        <View style={styles.catsRow}>
          {categoryProgress.map(c => (
            <View key={c.label} style={styles.catCard}>
              <Ionicons name={c.icon} size={24} color="#181818" />
              <Text style={styles.catLabel}>{c.label}</Text>
              <Text style={styles.catVal}>{c.value}</Text>
              <Text style={styles.catLabel2}>completed</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.inlineRow}>
          <Ionicons name="medal-outline" size={23} color="#9a5cf7" />
          <Text style={styles.rowLabel}>
            {unlockedBadges.length} badges unlocked
          </Text>
        </View>

        {allUnlockedBadges.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Unlocked Badges</Text>
            <View style={styles.unlockedBadgesWrap}>
              {allUnlockedBadges.map(b => (
                <View key={b.id} style={[styles.unlockedBadgeCard, { borderColor: b.color }]}>
                  <Ionicons name={b.icon} size={24} color={b.color} style={{ marginRight: 13 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.unlockedBadgeName, { color: b.color }]}>{b.name}</Text>
                    <Text style={styles.unlockedBadgeDesc}>{b.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <Pressable style={styles.shopBtn} onPress={() => router.push("/ShopScreen")}>
          <Ionicons name="cart-outline" size={21} color="#fff" />
          <Text style={styles.shopBtnText}>Go to Shop</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <View style={styles.statCardWrap}>
      <View style={[styles.statIconCircle, { backgroundColor: color + "22" }]}>
        <Ionicons name={icon} size={23} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel2}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  backBtn: { padding: 7, borderRadius: 15, backgroundColor: "#f6f6f6", marginRight: 7 },
  title: { fontSize: 25, fontWeight: "bold", color: "#181818", letterSpacing: 0.7 },
  cardsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 5, marginBottom: 18, paddingHorizontal: 6 },
  statCardWrap: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 2,
    backgroundColor: "#fafafa",
    borderRadius: 14,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 7,
    minWidth: 75,
  },
  statIconCircle: {
    width: 37, height: 37, borderRadius: 19, alignItems: "center", justifyContent: "center", marginBottom: 2,
  },
  statValue: { fontWeight: "bold", fontSize: 21, color: "#1e1e1e" },
  statLabel2: { fontSize: 14, color: "#666", marginTop: 1, fontWeight: "500" },

  sectionTitle: { fontSize: 17, fontWeight: "bold", color: "#232323", marginTop: 25, marginBottom: 7, marginLeft: 13, letterSpacing: 0.1 },
  chart: { borderRadius: 12, marginVertical: 3, alignSelf: "center" },

  inlineRow: { flexDirection: "row", alignItems: "center", marginTop: 14, marginBottom: 4, marginLeft: 11 },
  rowLabel: { color: "#232323", fontWeight: "600", fontSize: 15, marginLeft: 8 },
  rowVal: { color: "#4287f5", fontWeight: "bold", fontSize: 16, marginRight: 7, marginLeft: 1 },
  recordDay: { color: "#999", fontSize: 13, marginLeft: 2, fontWeight: "500" },

  catsRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 2 },
  catCard: {
    backgroundColor: "#f8f8fa",
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 12,
    minWidth: 92,
    marginHorizontal: 4,
    shadowColor: "#999",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  catLabel: { color: "#111", fontWeight: "bold", fontSize: 15, marginTop: 3 },
  catVal: { color: "#4287f5", fontWeight: "bold", fontSize: 17, marginTop: 2 },
  catLabel2: { color: "#bbb", fontWeight: "500", fontSize: 12 },

  // UNLOCKED BADGES
  unlockedBadgesWrap: {
    flexDirection: "column",
    gap: 9,
    marginBottom: 18,
    marginHorizontal: 7,
  },
  unlockedBadgeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 13,
    padding: 12,
    borderWidth: 2,
    marginBottom: 2,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  unlockedBadgeName: {
    fontWeight: "bold",
    fontSize: 15.5,
    marginBottom: 2,
  },
  unlockedBadgeDesc: {
    fontSize: 13,
    color: "#888",
  },

  shopBtn: {
    marginHorizontal: 50,
    marginTop: 30,
    backgroundColor: "#181818",
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    elevation: 4,
    shadowColor: "#222",
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  shopBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.7,
  },
});
