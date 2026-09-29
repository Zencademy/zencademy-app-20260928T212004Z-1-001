import { useRouter } from "expo-router";
import React from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function VisualCategory() {
  const router = useRouter();

  const VISUAL_GAMES = [
    {
      emoji: "👀",
      title: "Spot the Difference",
      desc: "Find the difference between images.",
      difficulty: "Easy",
      diffColor: "#55d47a",
      onPress: () => router.push("/games/easy/VisualEasyGame"),
    },
    {
      emoji: "🔷",
      title: "Shape Memory",
      desc: "Remember and recreate shape patterns.",
      difficulty: "Medium",
      diffColor: "#ffd252",
      onPress: () => Alert.alert("Coming soon!", "This game will be available soon."),
    },
    {
      emoji: "🌀",
      title: "Visual Sequence",
      desc: "Continue the visual pattern.",
      difficulty: "Hard",
      diffColor: "#ff7878",
      onPress: () => Alert.alert("Coming soon!", "This game will be available soon."),
    },
  ];

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>👁️ Visual</Text>
        <Text style={styles.subtitle}>Challenge your eyes and mind. Choose your challenge!</Text>

        <View style={styles.gamesList}>
          {VISUAL_GAMES.map((game, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.gameCard}
              activeOpacity={0.89}
              onPress={game.onPress}
            >
              <View style={styles.left}>
                <Text style={styles.gameEmoji}>{game.emoji}</Text>
              </View>
              <View style={styles.center}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.gameDesc}>{game.desc}</Text>
              </View>
              <View style={[styles.diffBadge, { backgroundColor: game.diffColor }]}>
                <Text style={styles.diffBadgeText}>{game.difficulty}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Buton Back jos */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace('/TrainingHub')}
          activeOpacity={0.86}
        >
          <Text style={styles.backBtnText}>← Back to categories</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f7f7fa" },
  scrollContent: {
    alignItems: "center",
    paddingTop: 42,
    paddingBottom: 38,
    minHeight: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#181828',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Arial Black' : 'sans-serif-black',
  },
  subtitle: {
    fontSize: 15.5,
    color: '#636377',
    marginBottom: 26,
    textAlign: "center",
    fontStyle: "italic",
    fontWeight: "500"
  },
  gamesList: {
    width: "100%",
    alignItems: "center",
    gap: 22,
  },
  gameCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#1e2e44',
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    width: "87%",
    maxWidth: 430,
    alignSelf: "center",
    gap: 20,
    marginBottom: 2,
    position: "relative",
  },
  left: {
    marginRight: 7,
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "#f3f8fe",
    justifyContent: "center",
    alignItems: "center",
  },
  gameEmoji: {
    fontSize: 29,
  },
  center: {
    flex: 1,
    justifyContent: "center",
  },
  gameTitle: {
    fontSize: 18.5,
    fontWeight: "800",
    letterSpacing: 0.9,
    color: "#181828",
    marginBottom: 4,
  },
  gameDesc: {
    fontSize: 14.5,
    color: "#3b3b44",
    fontStyle: "italic",
    fontWeight: "500",
  },
  diffBadge: {
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  diffBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  backBtn: {
    marginTop: 36,
    alignSelf: "center",
    backgroundColor: "#181828",
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 40,
    shadowColor: '#222',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  backBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.8,
  },
});
