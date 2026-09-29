import { Entypo, Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../components/ThemeContext';
import { AppHeader } from '../../components/ui/AppHeader';
import { type } from '../../components/ui/type';

const width = Dimensions.get('window').width;
const mapSize = Math.min(width, 340);

// Catalog route — XP gates live in ExerciseScreen / games layout
const openCategory = (key: string) => `/games/ExerciseCatalog?category=${key}` as const;

const domains = [
  { key: 'attention', icon: Feather, iconName: 'target', title: 'Attention', desc: 'Sharpen concentration and filter distractions.', more: 'Attention training improves focus for studying, work, and creative flow. Includes tasks that boost sustained and selective attention.' },
  { key: 'memory', icon: MaterialCommunityIcons, iconName: 'brain', title: 'Memory', desc: 'Strengthen short & long-term memory.', more: 'Memory tasks are proven to enhance recall, learning and cognitive agility. Practice n-back, sequences, and visualization memory.' },
  { key: 'logic', icon: MaterialCommunityIcons, iconName: 'puzzle', title: 'Logic', desc: 'Boost reasoning and problem solving.', more: 'Logic training enhances problem solving and decision-making in real life. Includes classic puzzles and deduction challenges.' },
  { key: 'flexibility', icon: Ionicons, iconName: 'shuffle', title: 'Flexibility', desc: 'Adapt & switch between tasks smoothly.', more: 'Cognitive flexibility is core for creative and strategic thinking. These exercises help you switch perspectives and strategies.' },
  { key: 'speed', icon: Feather, iconName: 'zap', title: 'Speed', desc: 'Increase your mental processing speed.', more: 'Processing speed helps with quick thinking and response time. Timed exercises for faster mental reactions.' },
  { key: 'executive', icon: FontAwesome5, iconName: 'chess-king', title: 'Executive', desc: 'Plan, inhibit impulses, decide better.', more: 'Executive function helps with planning, self-control, and goal pursuit. Challenges for inhibition, planning, and set-shifting.' },
  { key: 'creativity', icon: Feather, iconName: 'feather', title: 'Creativity', desc: 'Spark new ideas and divergent thinking.', more: 'Creative tasks boost idea generation and innovation. Practice alternative uses, word play, and flexible thinking.' },
  { key: 'critical', icon: Entypo, iconName: 'magnifying-glass', title: 'Critical', desc: 'Analyze, evaluate, and reason skeptically.', more: 'Critical thinking tasks sharpen your analytical and argumentation skills. Evaluate evidence and spot logical errors.' },
  { key: 'meta', icon: Feather, iconName: 'activity', title: 'Metacognition', desc: 'Reflect on your thinking and self-improve.', more: 'Metacognition means being aware of your thinking. Practice reflection, goal review, and “thinking about thinking”.' },
];

// 3 sau 4 pe rând, automat după ecran
const getNumColumns = () => (width >= 450 ? 4 : 3);

export default function MentalTrainingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selected, setSelected] = useState(domains[0].key);

  // Pentru brain map (cerc)
  const circleDomains = domains.slice(0, 8);
  const centerDomain = domains[8];
  const radius = mapSize * 0.38;
  const center = mapSize / 2;
  const numColumns = getNumColumns();

  // Build grid rows
  const gridRows = [];
  for (let i = 0; i < domains.length; i += numColumns) {
    gridRows.push(domains.slice(i, i + numColumns));
  }

  const selectedDomain = domains.find(d => d.key === selected);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['bottom']}>
      <AppHeader onBack={() => router.push('/TrainingHub')} showWallet />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
      >
        <Text style={[type.title, { color: theme.text, textAlign: 'center', marginTop: 12 }]}>Mental Training</Text>
        <Text style={[type.subtitle, { color: theme.textSecondary, textAlign: 'center', marginBottom: 10 }]}>
          Tap any area or button to see more and start training.
        </Text>
        {/* CERC/Brain Map */}
        <View style={[styles.mapWrap, { width: mapSize, height: mapSize, backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.brainBg, { backgroundColor: theme.card, borderColor: theme.borderLight }]} />
          {circleDomains.map((zone, idx) => {
            const angle = 270 + idx * 45;
            const rad = (angle * Math.PI) / 180;
            const x = center + radius * Math.cos(rad) - 32;
            const y = center + radius * Math.sin(rad) - 32;
            const isActive = selected === zone.key;
            const Icon = zone.icon;
            return (
              <TouchableOpacity
                key={zone.key}
                style={[
                  styles.zoneBtn,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  isActive && styles.zoneBtnActive,
                  { left: x, top: y }
                ]}
                onPress={() => setSelected(zone.key)}
                activeOpacity={0.85}
              >
                <View style={[isActive ? styles.iconActiveWrap : styles.iconWrap, { backgroundColor: isActive ? theme.primary : theme.surface }]}>
                  <Icon
                    name={zone.iconName}
                    size={26}
                    color={isActive ? theme.buttonText : theme.text}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
          {/* Centrul: meta */}
          <TouchableOpacity
            style={[
              styles.zoneBtn, styles.zoneCenter,
              { backgroundColor: theme.card, borderColor: theme.border },
              selected === centerDomain.key && styles.zoneBtnActive,
              { left: center - 29, top: center - 29 }
            ]}
            onPress={() => setSelected(centerDomain.key)}
            activeOpacity={0.85}
          >
            <View style={[selected === centerDomain.key ? styles.iconActiveWrap : styles.iconWrap, { backgroundColor: selected === centerDomain.key ? theme.primary : theme.surface }]}>
              <centerDomain.icon
                name={centerDomain.iconName}
                size={21}
                color={selected === centerDomain.key ? theme.buttonText : theme.text}
              />
            </View>
          </TouchableOpacity>
        </View>
        {/* START TRAINING BUTTON */}
        <View style={{ marginTop: 10, marginBottom: 14 }}>
          <TouchableOpacity
            style={[styles.trainBtnMain, { backgroundColor: theme.primary }]}
            onPress={() => router.push(openCategory(selected))}
            activeOpacity={0.90}
          >
            <Text style={[styles.trainBtnTextMain, { color: theme.buttonText }]}>
              Start Training: {selectedDomain.title}
            </Text>
          </TouchableOpacity>
        </View>
        {/* GRID: 3/4 pe rând */}
        <View style={styles.gridWrap}>
          {gridRows.map((row, rIdx) => (
            <View style={styles.gridRow} key={rIdx}>
              {row.map(domain => {
                const Icon = domain.icon;
                const isActive = selected === domain.key;
                return (
                  <TouchableOpacity
                    key={domain.key}
                    style={[
                      styles.gridBtn,
                      { backgroundColor: theme.card, borderColor: theme.border },
                      isActive && styles.gridBtnActive,
                      { flex: 1 / numColumns }
                    ]}
                    onPress={() => setSelected(domain.key)}
                    activeOpacity={0.85}
                  >
                    <View style={[isActive ? styles.iconActiveWrapSmall : styles.iconWrapSmall, { backgroundColor: isActive ? theme.primary : theme.surface }]}>
                      <Icon
                        name={domain.iconName}
                        size={20}
                        color={isActive ? theme.buttonText : theme.text}
                      />
                    </View>
                    <Text style={[
                      styles.gridTitle,
                      { color: theme.text },
                      isActive && { color: theme.buttonText }
                    ]}>{domain.title}</Text>
                  </TouchableOpacity>
                );
              })}
              {row.length < numColumns &&
                Array(numColumns - row.length)
                  .fill()
                  .map((_, i) => (
                    <View key={`empty${i}`} style={[styles.gridBtn, { backgroundColor: 'transparent', borderColor: 'transparent', flex: 1 / numColumns }]} />
                  ))
              }
            </View>
          ))}
        </View>
        {/* Casetă detalii domeniu selectat */}
        {selected && (
          <View style={[styles.descBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.descTitle, { color: theme.text }]}>{selectedDomain.title}</Text>
            <Text style={[styles.descShort, { color: theme.textSecondary }]}>{selectedDomain.desc}</Text>
            <ScrollView
              style={styles.descMoreScroll}
              contentContainerStyle={{ paddingBottom: 9 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.descMore, { color: theme.textSecondary }]}>{selectedDomain.more}</Text>
            </ScrollView>
            <TouchableOpacity
              style={[styles.trainBtn, { backgroundColor: theme.primary }]}
              onPress={() => router.push(openCategory(selected))}
              activeOpacity={0.88}
            >
              <Text style={[styles.trainBtnText, { color: theme.buttonText }]}>Start Training</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 160 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const iconBG = '#fff';
const iconActiveBG = '#23242b';

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch',
    justifyContent: 'center',
    paddingTop: 10, paddingBottom: 4, marginBottom: 2,
    borderBottomWidth: 1, borderBottomColor: '#ededed',
  },
  backBtn: {
    marginRight: 8,
    alignSelf: 'center',
    padding: 7,
    borderRadius: 10,
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    top: 5,
  },
  logo: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center'
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 60,
    paddingHorizontal: 10,
  },
  title: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 1, marginTop: 18, letterSpacing: 1.1 },
  subtitle: { fontSize: 14.3, fontWeight: '500', textAlign: 'center', marginBottom: 10, letterSpacing: 0.3, paddingHorizontal: 4 },
  mapWrap: {
    marginTop: 4, marginBottom: 14, alignSelf: 'center',
    justifyContent: 'center', alignItems: 'center', position: 'relative',
    borderRadius: 222, borderWidth: 1,
    shadowColor: '#111', shadowOpacity: 0.06, shadowRadius: 7,
  },
  brainBg: {
    position: 'absolute', width: '99%', height: '99%', borderRadius: 999,
    left: '0.5%', top: '0.5%', opacity: 0.75, borderWidth: 1
  },
  zoneBtn: {
    position: 'absolute', width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#111', shadowOpacity: 0.09, shadowRadius: 5, elevation: 2,
    borderWidth: 1.1,
    margin: 0,
  },
  zoneBtnActive: {
    backgroundColor: '#23242b',
    borderColor: '#23242b',
  },
  iconWrap: {
    borderRadius: 999,
    padding: 7,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconActiveWrap: {
    borderRadius: 999,
    padding: 7,
    alignItems: 'center',
    justifyContent: 'center'
  },
  zoneCenter: {
    backgroundColor: '#23242b',
    borderColor: '#23242b',
    width: 58, height: 58, borderRadius: 29,
    shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 5
  },
  gridWrap: {
    width: '100%',
    marginTop: 4,
    marginBottom: 6,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 7,
    width: '100%',
    gap: 4,
  },
  gridBtn: {
    borderRadius: 13,
    borderWidth: 1,
    minWidth: 80,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 2,
  },
  gridBtnActive: {
    backgroundColor: '#23242b',
    borderColor: '#23242b',
  },
  iconWrapSmall: {
    backgroundColor: iconBG,
    borderRadius: 999,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconActiveWrapSmall: {
    backgroundColor: iconActiveBG,
    borderRadius: 999,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  gridTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.1,
    textTransform: 'uppercase'
  },
  descBox: {
    borderRadius: 18,
    paddingVertical: 17,
    paddingHorizontal: 17,
    shadowColor: '#111',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 10,
    width: '98%',
    maxWidth: 370,
    alignSelf: 'center',
    alignItems: 'center',
  },
  descTitle: {
    fontSize: 17.5,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 1,
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  descShort: {
    fontSize: 13.7,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 7,
    marginTop: 2
  },
  descMoreScroll: {
    maxHeight: 60,
    minHeight: 26,
    marginBottom: 9,
    paddingHorizontal: 2
  },
  descMore: {
    fontSize: 13.5,
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 17,
  },
  trainBtn: {
    paddingVertical: 9,
    paddingHorizontal: 28,
    borderRadius: 13,
    shadowColor: '#23242b',
    shadowOpacity: 0.10,
    shadowRadius: 3,
    marginTop: 4,
  },
  trainBtnMain: {
    borderRadius: 13,
    paddingVertical: 14,
    paddingHorizontal: 35,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#23242b',
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 2,
  },
  trainBtnText: {
    fontWeight: '800',
    fontSize: 14.2,
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  trainBtnTextMain: {
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
