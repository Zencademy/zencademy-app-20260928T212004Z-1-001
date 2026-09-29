import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const exercises = [
  {
    key: 'basic',
    icon: <MaterialCommunityIcons name="arrow-left-right-bold" size={38} color="#23242b" />,
    iconWhite: <MaterialCommunityIcons name="arrow-left-right-bold" size={38} color="#fff" />,
    title: 'Basic Alternate',
    steps: [
      'Sit comfortably with your back straight.',
      'Use your right thumb to close your right nostril.',
      'Inhale deeply through your left nostril.',
      'Close your left nostril with your ring finger.',
      'Exhale through your right nostril.',
      'Inhale through your right nostril.',
      'Close your right nostril and exhale through left.',
      'Continue alternating for the duration.'
    ],
    tips: [
      'Keep your hand relaxed and comfortable.',
      'Focus on smooth, controlled breathing.',
      'Maintain equal timing for each breath.',
      'Don\'t force the breathing pattern.'
    ]
  },
  {
    key: 'advanced',
    icon: <MaterialCommunityIcons name="human-male" size={38} color="#23242b" />,
    iconWhite: <MaterialCommunityIcons name="human-male" size={38} color="#fff" />,
    title: 'Advanced Technique',
    steps: [
      'Start with basic alternate nostril breathing.',
      'Add breath retention after each inhale.',
      'Hold for 4-8 counts after inhaling.',
      'Maintain the alternating pattern.',
      'Focus on the energy flow through your body.',
      'Feel the balance between left and right sides.'
    ],
    tips: [
      'Build up gradually to longer retention.',
      'Keep your spine straight throughout.',
      'Visualize energy flowing through each nostril.',
      'Practice in a quiet, distraction-free environment.'
    ]
  },
  {
    key: 'variations',
    icon: <Feather name="activity" size={38} color="#23242b" />,
    iconWhite: <Feather name="activity" size={38} color="#fff" />,
    title: 'Advanced Variations',
    steps: [
      'Start with basic alternate nostril breathing.',
      'Try with different breath ratios (4:4:4:4).',
      'Experiment with longer retention times.',
      'Practice with eyes closed for deeper focus.',
      'Combine with meditation for enhanced effects.',
      'Listen to your body\'s response.'
    ],
    tips: [
      'Practice regularly for best results.',
      'Use this technique for mental clarity.',
      'Don\'t practice while driving or operating machinery.',
      'Consult a yoga teacher for proper technique.'
    ]
  }
];

export default function AlternateNostrilGame() {
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
      clearInterval(intervalRef.current);
      setStarted(false);
    } else {
      setTimer(0);
      setShowDone(false);
      setStarted(true);
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev >= 179) setShowDone(true);
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
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
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
        <Text style={styles.title}>Alternate Nostril</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>Hard</Text></View>
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
          Balance mind and body with this ancient yoga breath.
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

        {showDone && !started && (
          <TouchableOpacity style={styles.doneBtn} onPress={() => {
            setTimer(0);
            setShowDone(false);
          }}>
            <Text style={styles.doneBtnText}>Mark as Done</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
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
    backgroundColor: '#23242b', borderColor: '#23242b', borderWidth: 1, borderRadius: 13,
    paddingHorizontal: 13, paddingVertical: 5, alignSelf: 'center', marginLeft: 8,
  },
  badgeText: {
    color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase'
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
