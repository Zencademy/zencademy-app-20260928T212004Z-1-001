import { useRouter } from "expo-router";
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useXP } from '../../components/XPContext';
import { getXpForLevel, MAX_LEVEL } from '../../utils/levels';

const { width } = Dimensions.get('window');

function getLevelXp(level) {
  return getXpForLevel(level);
}

export default function DeveloperScreen() {
  const { xp, setXP, level, setLevel, streak, setStreak, addXp } = useXP();
  const [inputLevel, setInputLevel] = useState('');
  const router = useRouter();

  // Adaugă XP (cu level-up logic)
  const handleAddXp = (amount) => {
    addXp(amount);
  };

  // Scade XP (cu level-down logic)
  const handleRemoveXp = (amount) => {
    let newXp = xp - amount;
    let newLevel = level;
    // Dacă scade sub 0 și nu suntem la Level 1, scădem nivelul și mutăm XP-ul la limita precedentă minus cât lipsește
    while (newXp < 0 && newLevel > 1) {
      newLevel--;
      newXp += getLevelXp(newLevel);
    }
    if (newXp < 0) newXp = 0;
    setXP(newXp);
    setLevel(newLevel);
  };

  const setDevLevel = (val) => {
    let n = parseInt(val);
    if (isNaN(n) || n < 1) n = 1;
    if (n > MAX_LEVEL) n = MAX_LEVEL;
    setLevel(n);
    setXP(0);
    setInputLevel('');
  };

  const handleResetAll = () => {
    setXP(0);
    setLevel(1);
    setStreak(1);
  };

  return (
    <View style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.title}>🛠️ Developers Panel</Text>

        <View style={{ marginBottom: 32 }}>
          <Text style={styles.label}>XP & Level</Text>
          <Text style={styles.value}>Level {level} — {level < MAX_LEVEL ? `${xp}/${getLevelXp(level)} XP` : "MAX LEVEL"}</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btn} onPress={() => handleAddXp(100)}>
              <Text style={styles.btnText}>+100 XP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={() => handleRemoveXp(100)}>
              <Text style={styles.btnText}>-100 XP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={handleResetAll}>
              <Text style={styles.btnText}>Reset All</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <TextInput
              style={styles.levelInput}
              placeholder="Set Level (1-100)"
              value={inputLevel}
              onChangeText={setInputLevel}
              keyboardType="numeric"
              maxLength={2}
            />
            <TouchableOpacity
              style={[styles.btn, { paddingVertical: 9, paddingHorizontal: 12, marginLeft: 6 }]}
              onPress={() => setDevLevel(inputLevel)}
            >
              <Text style={styles.btnText}>Set Level</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginBottom: 32 }}>
          <Text style={styles.label}>Day Streak</Text>
          <Text style={styles.value}>{streak} days</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btn} onPress={() => setStreak(streak + 1)}>
              <Text style={styles.btnText}>+1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={() => setStreak(Math.max(1, streak - 1))}>
              <Text style={styles.btnText}>-1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={() => setStreak(1)}>
              <Text style={styles.btnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#222', marginTop: 14 }]}
          onPress={() => router.push('/')}
        >
          <Text style={styles.btnText}>Exit to Menu</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.footer}>© 2025 Zencademy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f6f6',
    width,
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 22,
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 16,
    shadowColor: '#222',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: '#16181b',
    marginBottom: 28,
    textAlign: 'center',
  },
  label: {
    fontSize: 15,
    color: '#444',
    fontWeight: '700',
    marginBottom: 3,
    textAlign: 'center',
  },
  value: {
    fontSize: 19,
    color: '#222',
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 3,
  },
  btn: {
    backgroundColor: '#222',
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 3,
    marginTop: 7,
    elevation: 1,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  levelInput: {
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    width: 80,
    textAlign: 'center',
    marginRight: 2,
    backgroundColor: '#f7f7f7'
  },
  footer: {
    color: '#b2b2b2',
    fontSize: 13,
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    textAlign: 'center',
    letterSpacing: 1,
  },
});
