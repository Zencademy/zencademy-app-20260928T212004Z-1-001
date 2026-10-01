import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PracticeDoneModal } from '../../../components/PracticeDoneModal';

const exercises = [
  {
    key: 'basic',
    icon: <MaterialCommunityIcons name="numeric-4-box" size={38} color="#23242b" />,
    iconWhite: <MaterialCommunityIcons name="numeric-4-box" size={38} color="#fff" />,
    title: 'Basic 4-7-8',
    steps: [
      'Sit comfortably with your back straight.',
      'Place the tip of your tongue behind your upper teeth.',
      'Inhale quietly through your nose for 4 counts.',
      'Hold your breath for 7 counts.',
      'Exhale completely through your mouth for 8 counts.',
      'Repeat the cycle for the duration.'
    ],
    tips: [
      'Keep your tongue in position throughout.',
      'Focus on the counting rhythm.',
      'Don\'t rush the breathing pattern.',
      'Feel the relaxation with each cycle.'
    ]
  },
  {
    key: 'relaxation',
    icon: <MaterialCommunityIcons name="human-male" size={38} color="#23242b" />,
    iconWhite: <MaterialCommunityIcons name="human-male" size={38} color="#fff" />,
    title: 'Deep Relaxation',
    steps: [
      'Start with basic 4-7-8 pattern.',
      'Close your eyes for deeper focus.',
      'Visualize stress leaving with each exhale.',
      'Feel your body becoming more relaxed.',
      'Maintain steady rhythm throughout.'
    ],
    tips: [
      'Use this technique before sleep.',
      'Practice in a quiet environment.',
      'Don\'t force the breath counts.',
      'Let go of any tension with each exhale.'
    ]
  },
  {
    key: 'variations',
    icon: <Feather name="activity" size={38} color="#23242b" />,
    iconWhite: <Feather name="activity" size={38} color="#fff" />,
    title: '4-7-8 Variations',
    steps: [
      'Start with basic 4-7-8 breathing.',
      'Try with eyes closed for deeper focus.',
      'Practice while lying down for sleep.',
      'Use during stressful situations.',
      'Combine with gentle stretching.'
    ],
    tips: [
      'Practice regularly for best results.',
      'Use this technique for anxiety relief.',
      'Don\'t practice while driving.',
      'Listen to your body\'s needs.'
    ]
  }
];

export default function FourSevenEightGame() {
  const router = useRouter();
  const navigation = useNavigation();
  const [selected, setSelected] = useState(exercises[0].key);
  const [started, setStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showDone, setShowDone] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const intervalRef = useRef(null);

  const handleStartStop = () => {
    if (started) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStarted(false);
    } else {
      setTimer(0);
      setShowDone(false);
      setStarted(true);
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev >= 119) setShowDone(true);
          return prev + 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    const handleBack = () => {
      router.replace('/PhysicalTraining/BreathingTrainingScreen');
      return true;
    };
    const sub = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      router.replace('/PhysicalTraining/BreathingTrainingScreen');
    });
    const backSubscription = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      backSubscription.remove();
      sub && sub();
    };
  }, [navigation, router]);

  const current = exercises.find(e => e.key === selected);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.replace('/PhysicalTraining/BreathingTrainingScreen')}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={24} color="#17181c" />
        </TouchableOpacity>
        <Text style={styles.title}>4-7-8 Breathing</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>Easy</Text></View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tabsRow}>
          {exercises.map(e => {
            const isActive = selected === e.key;
            return (
              <TouchableOpacity
                key={e.key}
                style={[
                  styles.tabBtn,
                  isActive && styles.tabBtnActive
                ]}
                onPress={() => {
                  if (!started) {
                    setSelected(e.key);
                    setShowTips(false);
                    setTimer(0);
                    setShowDone(false);
                    clearInterval(intervalRef.current);
                  }
                }}
                activeOpacity={started ? 1 : 0.8}
                disabled={started}
              >
                {isActive ? e.iconWhite : e.icon}
                <Text style={[
                  styles.tabTitle,
                  isActive && { color: '#fff' }
                ]}>{e.title.split(' ')[0]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.exerciseTitle}>{current.title}</Text>

        <Text style={styles.desc}>
          Relax deeply and manage stress by controlling your breath.
        </Text>

        <View style={styles.stepsBox}>
          <Text style={styles.stepsTitle}>How to:</Text>
          {current.steps.map((step, idx) => (
            <Text style={styles.step} key={idx}>• {step}</Text>
          ))}
        </View>

        <TouchableOpacity
          style={started ? styles.stopBtn : styles.startBtn}
          onPress={handleStartStop}
        >
          <Text style={started ? styles.stopBtnText : styles.startBtnText}>
            {started ? 'Stop' : 'Start Exercise'}
          </Text>
        </TouchableOpacity>

        {started || timer > 0 ? (
          <Text style={styles.timer}>{timer < 60 ? `${timer}s` : `${Math.floor(timer/60)}m ${timer%60}s`}</Text>
        ) : null}

        <TouchableOpacity onPress={() => setShowTips(x => !x)} style={styles.tipsToggle}>
          <Text style={styles.tipsToggleText}>{showTips ? 'Hide Tips' : 'Show Tips'}</Text>
          <Feather name={showTips ? 'chevron-up' : 'chevron-down'} size={19} color="#17181c" />
        </TouchableOpacity>
        {showTips && (
          <View style={styles.tipsBox}>
            {current.tips.map((tip, idx) => (
              <Text style={styles.tip} key={idx}>• {tip}</Text>
            ))}
          </View>
        )}

        {showDone && !started ? (
          <Text style={{ textAlign: 'center', marginTop: 12, color: '#17181c', fontWeight: '600' }}>Session finished — claim your reward</Text>
        ) : null}

        <View style={{ height: 60 }} />
      </ScrollView>

      <PracticeDoneModal
        visible={showDone && !started}
        difficulty="Medium"
        title="Breathing complete"
        onAgain={() => {
          setTimer(0);
          setShowDone(false);
        }}
        onExit={() => {
          setShowDone(false);
          router.replace('/PhysicalTraining/BreathingTrainingScreen');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row', alignItems: 'center', paddingTop: 16, paddingBottom: 9, paddingHorizontal: 10,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', justifyContent: 'space-between',
  },
  backBtn: { padding: 5, marginRight: 4, borderRadius: 9 },
  title: {
    fontSize: 20, fontWeight: '900', color: '#17181c', letterSpacing: 1, flex: 1, textAlign: 'center',
  },
  badge: {
    backgroundColor: '#e7e7e8', borderColor: '#c7c7cb', borderWidth: 1, borderRadius: 13,
    paddingHorizontal: 13, paddingVertical: 5, alignSelf: 'center', marginLeft: 8,
  },
  badgeText: {
    color: '#23242b', fontWeight: '700', fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase'
  },
  content: {
    alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40
  },
  tabsRow: {
    flexDirection: 'row', justifyContent: 'center', marginBottom: 8, gap: 6
  },
  tabBtn: {
    backgroundColor: '#f2f2f2', borderRadius: 12, paddingVertical: 7, paddingHorizontal: 11, alignItems: 'center', marginHorizontal: 4, minWidth: 62,
    borderWidth: 1, borderColor: '#ececf1'
  },
  tabBtnActive: {
    backgroundColor: '#23242b', borderColor: '#23242b'
  },
  tabTitle: {
    fontSize: 12, fontWeight: '700', color: '#23242b', marginTop: 3, textTransform: 'uppercase'
  },
  exerciseTitle: {
    fontWeight: '800', fontSize: 17, color: '#1a1b1e', marginTop: 13, marginBottom: 3, letterSpacing: 0.5
  },
  desc: {
    fontSize: 15, color: '#444', textAlign: 'center', fontWeight: '500', marginBottom: 16, marginTop: 2
  },
  stepsBox: {
    backgroundColor: '#f7f7f9', borderRadius: 15, padding: 15, marginBottom: 14, width: '100%',
    borderWidth: 1, borderColor: '#ececf1'
  },
  stepsTitle: {
    fontWeight: '800', fontSize: 15, color: '#1a1b1e', marginBottom: 7, textTransform: 'uppercase'
  },
  step: {
    fontSize: 14, color: '#23242b', marginBottom: 3, fontWeight: '500'
  },
  startBtn: {
    backgroundColor: '#23242b', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40,
    alignItems: 'center', marginVertical: 12, marginBottom: 0,
  },
  startBtnText: {
    color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 1, textTransform: 'uppercase'
  },
  stopBtn: {
    backgroundColor: '#b7b8ba', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40,
    alignItems: 'center', marginVertical: 12, marginBottom: 0,
  },
  stopBtnText: {
    color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 1, textTransform: 'uppercase'
  },
  timer: {
    fontSize: 27, fontWeight: '900', color: '#17181c', marginVertical: 13, letterSpacing: 2, textAlign: 'center'
  },
  tipsToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 6, marginTop: 3,
  },
  tipsToggleText: {
    fontWeight: '700', fontSize: 14.5, color: '#23242b', marginRight: 3,
  },
  tipsBox: {
    backgroundColor: '#f3f3f6', borderRadius: 13, padding: 13, marginBottom: 16, borderWidth: 1, borderColor: '#e1e1e5',
    width: '100%',
  },
  tip: {
    color: '#23242b', fontSize: 13.5, marginBottom: 3, fontWeight: '500'
  },
  doneBtn: {
    backgroundColor: '#74c365', borderRadius: 12, paddingVertical: 11, paddingHorizontal: 32,
    alignItems: 'center', marginTop: 7, marginBottom: 13,
  },
  doneBtnText: {
    color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.7, textTransform: 'uppercase'
  }
});
