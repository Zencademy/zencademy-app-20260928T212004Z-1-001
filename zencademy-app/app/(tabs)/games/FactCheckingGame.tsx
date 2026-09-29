import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import GameHeader from '../../../components/GameHeader';
import { useTheme } from '../../../components/ThemeContext';
import { useGameReward } from '../../../hooks/useGameReward';
import { coinsForXp } from '../../../lib/progression';

const WIN_XP = 12; // Easy

type Item = { statement: string; isFact: boolean };

const ITEMS: Item[] = [
	{ statement: 'Water boils at 100Â°C at sea level.', isFact: true },
	{ statement: 'Dinosaurs and humans lived at the same time.', isFact: false },
	{ statement: 'The Earth orbits the Sun.', isFact: true },
	{ statement: 'Lightning never strikes the same place twice.', isFact: false },
	{ statement: 'Bats are mammals.', isFact: true },
	{ statement: 'Goldfish have a 3-second memory.', isFact: false },
	{ statement: 'Vaccines cause autism.', isFact: false },
	{ statement: "The Amazon rainforest produces a significant portion of the world's oxygen.", isFact: true },
	{ statement: 'Humans have five senses and no more.', isFact: false },
	{ statement: 'Mount Everest is the tallest mountain above sea level.', isFact: true },
	{ statement: 'Eating carrots improves night vision dramatically.', isFact: false },
	{ statement: 'Bacteria can become resistant to antibiotics.', isFact: true },
	{ statement: 'The Great Wall of China is visible from space with the naked eye.', isFact: false },
	{ statement: 'Sound cannot travel through a vacuum.', isFact: true },
	{ statement: 'Sugar causes hyperactivity in children.', isFact: false },
	{ statement: 'Plate tectonics cause earthquakes.', isFact: true },
	{ statement: 'You can balance an egg only on the equinox.', isFact: false },
	{ statement: 'Bulls are enraged by the color red.', isFact: false },
	{ statement: 'Ultraviolet light can sterilize surfaces.', isFact: true },
	{ statement: 'Humans need oxygen to live.', isFact: true },
	{ statement: 'Sharks are mammals.', isFact: false },
	{ statement: 'Bananas grow on trees.', isFact: false },
	{ statement: 'The Moon affects ocean tides.', isFact: true },
	{ statement: 'Tomatoes are vegetables.', isFact: false },
	{ statement: 'An adult human has 206 bones.', isFact: true },
	{ statement: 'Lightning always strikes only once.', isFact: false },
	{ statement: 'Plants make food through photosynthesis.', isFact: true },
	{ statement: 'The Sahara is the largest desert in the world.', isFact: true }
];

function randomItem() { return ITEMS[Math.floor(Math.random() * ITEMS.length)]; }

export default function FactCheckingGame() {
	const router = useRouter();
	const { award, reset } = useGameReward();
	const { theme } = useTheme();
	const [item, setItem] = useState<Item>(randomItem());
	const [leftIsFact, setLeftIsFact] = useState<boolean>(Math.random() < 0.5);
	const [streak, setStreak] = useState(0);
	const target = 6;
	const [showWin, setShowWin] = useState(false);
	const [showHelp, setShowHelp] = useState(false);

	useEffect(() => { if (streak >= target) { void award(WIN_XP); setShowWin(true); } }, [streak, award]);

	const answer = (ans: 'FACT' | 'FALSE') => {
		const ok = (ans === 'FACT' && item.isFact) || (ans === 'FALSE' && !item.isFact);
		setStreak(s => (ok ? s + 1 : 0));
		setItem(randomItem());
		setLeftIsFact(Math.random() < 0.5);
	};

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<GameHeader
				onBack={() => router.replace('/(tabs)/games/CriticalThinkingTrainingScreen')}
				gameTitle="Fact Checking"
				gameDescription="Test your ability to distinguish between factual statements and false information."
				gameInstructions="Read each statement and decide if it's a fact or false. Build a streak to win!"
			/>
			<View style={styles.gameContent}>
				<Text style={[styles.title, { color: theme.text }]}>Fact Checking</Text>
				<Text style={[styles.subtitle, { color: theme.textSecondary }]}>Is the statement a fact or false?</Text>

				<View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
					<Text style={[styles.statement, { color: theme.text }]}>{item.statement}</Text>
					<View style={styles.row}>
						{leftIsFact ? (
							<>
								<TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={() => answer('FACT')}><Text style={[styles.primaryText, { color: theme.buttonText }]}>FACT</Text></TouchableOpacity>
								<TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.surface }]} onPress={() => answer('FALSE')}><Text style={[styles.primaryText, { color: theme.text }]}>FALSE</Text></TouchableOpacity>
							</>
						) : (
							<>
								<TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.surface }]} onPress={() => answer('FALSE')}><Text style={[styles.primaryText, { color: theme.text }]}>FALSE</Text></TouchableOpacity>
								<TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={() => answer('FACT')}><Text style={[styles.primaryText, { color: theme.buttonText }]}>FACT</Text></TouchableOpacity>
							</>
						)}
					</View>
					<Text style={[styles.progress, { color: theme.text }]}>Streak: {streak}/{target}</Text>
				</View>
			</View>

			<Modal visible={showWin} transparent animationType="fade" onRequestClose={() => setShowWin(false)}>
				<View style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}>
					<View style={[styles.modalCard, { backgroundColor: theme.card, alignItems: 'center' }]}> 
						<ConfettiCannon count={120} origin={{ x: 180, y: 0 }} fadeOut autoStart explosionSpeed={420} fallSpeed={2100} />
						<Text style={[styles.winTitle, { color: theme.text }]}>Sharp judgment!</Text>
						<Text style={[styles.winText, { color: theme.textSecondary }]}>+{WIN_XP} XP + {coinsForXp(WIN_XP)} coins</Text>
						<TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={() => { setShowWin(false); reset(); setStreak(0);  setItem(randomItem()); }}><Text style={[styles.primaryText, { color: theme.buttonText }]}>Play Again</Text></TouchableOpacity>
						<TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.surface, marginTop: 8 }]} onPress={() => { setShowWin(false); router.replace('/(tabs)/games/CriticalThinkingTrainingScreen'); }}>
							<Text style={[styles.primaryText, { color: theme.text }]}>Go to Main Menu</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			<Modal visible={showHelp} transparent animationType="fade" onRequestClose={() => setShowHelp(false)}>
				<View style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}>
					<View style={[styles.modalCard, { backgroundColor: theme.card }]}>
						<Text style={[styles.helpTitle, { color: theme.text }]}>How to Play</Text>
						<Text style={[styles.helpTextP, { color: theme.textSecondary }]}>Read the statement and decide if it's factual or false. Build a streak of correct answers. A wrong answer resets your streak.</Text>
						<TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={() => setShowHelp(false)}><Text style={[styles.primaryText, { color: theme.buttonText }]}>Got it</Text></TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	gameContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	title: { fontSize: 26, fontWeight: '900', marginTop: 24 },
	subtitle: { fontSize: 14, marginTop: 6 },
	card: { width: '92%', maxWidth: 520, borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 16 },
	statement: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
	row: { flexDirection: 'row', gap: 12 },
	primaryBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginTop: 8 },
	primaryText: { fontWeight: '800' },
	progress: { marginTop: 10, fontWeight: '800' },
	modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	modalCard: { padding: 18, borderRadius: 14, width: '86%' },
	winTitle: { fontSize: 22, fontWeight: '900', marginBottom: 6, textAlign: 'center' },
	winText: { fontSize: 14, marginBottom: 10, textAlign: 'center' },
	helpTitle: { fontSize: 18, fontWeight: '900', marginBottom: 8 },
	helpTextP: { fontSize: 14, lineHeight: 20 }
});


