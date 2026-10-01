import { sessionXp, partialSessionXp, coinsForXp } from '../../../lib/progression';
import { useGameReward } from '../../../hooks/useGameReward';
import { WinPulse } from '../../../components/WinPulse';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useXP } from '../../../components/XPContext';

const WIN_XP = 28; // Hard

const PROMPTS = [
	['an old key', 'a silent train', 'a forgotten promise'],
	['a stormy night', 'a flickering lamp', 'an unexpected guest'],
	['a locked journal', 'a broken compass', 'a distant lighthouse'],
];

function randomPrompts() {
	return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

export default function StoryBuilderGame() {
	const router = useRouter();
	const { plan } = useXP();
  const { award, awardFor, reset: resetReward } = useGameReward();
	const [seeds, setSeeds] = useState<string[]>(randomPrompts());
	const [text, setText] = useState('');
	const [showWin, setShowWin] = useState(false);
	const [showHelp, setShowHelp] = useState(false);

	const done = () => {
		if (text.trim().split(/\s+/).length >= 60) { // 60+ words
			void awardFor('Hard'); setShowWin(true);
		}
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(tabs)/games/CreativityTrainingScreen')}>
				<Text style={styles.backText}>←</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.helpBtn} onPress={() => setShowHelp(true)}>
				<Text style={styles.helpText}>?</Text>
			</TouchableOpacity>
			<Text style={styles.title}>Story Builder</Text>
			<Text style={styles.subtitle}>Write a short story using these prompts</Text>

			<View style={styles.card}>
				<Text style={styles.seed}>Prompts: {seeds.join(' • ')}</Text>
				<TextInput
					style={styles.input}
					placeholder="Write your story here (60+ words)..."
					placeholderTextColor="#999"
					multiline
					value={text}
					onChangeText={setText}
				/>
				<TouchableOpacity style={styles.primaryBtn} onPress={done}><Text style={styles.primaryText}>Finish</Text></TouchableOpacity>
			</View>

			<Modal visible={showWin} transparent animationType="fade" onRequestClose={() => setShowWin(false)}>
				<View style={styles.modalBackdrop}>
					<View style={[styles.modalCard, { alignItems: 'center' }]}> 
						<WinPulse active />
						<Text style={styles.winTitle}>Wonderful imagination!</Text>
						<Text style={styles.winText}>+{WIN_XP} XP</Text>
						<TouchableOpacity style={styles.primaryBtn} onPress={() => { setShowWin(false); setText(''); setSeeds(randomPrompts()); }}><Text style={styles.primaryText}>Write Another</Text></TouchableOpacity>
						<TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#fff', marginTop: 8 }]} onPress={() => { setShowWin(false); router.replace('/(tabs)/games/CreativityTrainingScreen'); }}>
							<Text style={[styles.primaryText, { color: '#111' }]}>Go to Main Menu</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			<Modal visible={showHelp} transparent animationType="fade" onRequestClose={() => setShowHelp(false)}>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalCard}>
						<Text style={styles.helpTitle}>How to Play</Text>
						<Text style={styles.helpTextP}>Use all three prompts somewhere in your story. Aim for 60+ words to complete the challenge.</Text>
						<TouchableOpacity style={styles.primaryBtn} onPress={() => setShowHelp(false)}><Text style={styles.primaryText}>Got it</Text></TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
	backBtn: { position: 'absolute', left: 14, top: 34, backgroundColor: '#fff', borderRadius: 20, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
	backText: { fontSize: 22, fontWeight: '900', color: '#111' },
	helpBtn: { position: 'absolute', right: 14, top: 34, backgroundColor: '#fff', borderRadius: 20, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
	helpText: { fontSize: 20, fontWeight: '900', color: '#111' },
	title: { fontSize: 26, fontWeight: '900', color: '#111', marginTop: 24 },
	subtitle: { fontSize: 14, color: '#666', marginTop: 6 },
	card: { width: '92%', maxWidth: 520, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e6e6e6', padding: 16, marginTop: 16 },
	seed: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 10 },
	input: { height: 200, borderWidth: 1, borderColor: '#e6e6e6', borderRadius: 12, padding: 12, textAlignVertical: 'top', color: '#111' },
	primaryBtn: { backgroundColor: '#111', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginTop: 12 },
	primaryText: { color: '#fff', fontWeight: '800' },
	modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
	modalCard: { backgroundColor: '#fff', padding: 18, borderRadius: 14, width: '86%' },
	winTitle: { fontSize: 22, fontWeight: '900', color: '#111', marginBottom: 6, textAlign: 'center' },
	winText: { fontSize: 14, color: '#333', marginBottom: 10, textAlign: 'center' },
	helpTitle: { fontSize: 18, fontWeight: '900', color: '#111', marginBottom: 8 },
	helpTextP: { fontSize: 14, color: '#333', lineHeight: 20 }
});


