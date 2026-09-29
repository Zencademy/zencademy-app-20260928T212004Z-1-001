import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import GameHeader from '../../../components/GameHeader';
import { useTheme } from '../../../components/ThemeContext';
import { useXP } from '../../../components/XPContext';

const WIN_XP = 25; // Medium

type Q = { prompt: string; fallacy: string; options: string[] };

const BANK: Q[] = [
	{ prompt: 'Either you agree with me, or you are wrong.', fallacy: 'Only two choices', options: ['Only two choices', 'Attack the person', 'Change the topic', 'Everyone does it'] },
	{ prompt: 'If we allow phones, soon no one will study.', fallacy: 'Exaggerate consequences', options: ['Exaggerate consequences', 'One example proves all', 'Famous person says so', 'Repeats the same thing'] },
	{ prompt: 'This is good because it is not bad.', fallacy: 'Repeats the same thing', options: ['Repeats the same thing', 'Makes you feel bad', 'You do it too', 'Change the topic'] },
	{ prompt: 'Everyone likes this, so it must be good.', fallacy: 'Everyone does it', options: ['Everyone does it', 'One example proves all', 'Wrong cause', 'Happened after so caused it'] },
	{ prompt: 'Don\'t listen to him; he is stupid.', fallacy: 'Attack the person', options: ['Attack the person', 'Natural means good', 'One example proves all', 'Middle is best'] },
	{ prompt: 'One person failed, so everyone fails.', fallacy: 'One example proves all', options: ['Change the topic', 'One example proves all', 'Famous person says so', 'Exclude counterexamples'] },
	{ prompt: 'I wore red and won, so red brings luck.', fallacy: 'Happened after so caused it', options: ['Happened after so caused it', 'New means better', 'Only two choices', 'Change the topic'] },
	{ prompt: 'Real students study hard; you don\'t study hard.', fallacy: 'Exclude counterexamples', options: ['Exclude counterexamples', 'Attack the person', 'Exaggerate consequences', 'Wrong cause'] },
	{ prompt: 'It worked for my friend, so it works for all.', fallacy: 'One example proves all', options: ['One example proves all', 'Famous person says so', 'Everyone does it', 'You do it too'] },
	{ prompt: 'It is natural, so it is good.', fallacy: 'Natural means good', options: ['Natural means good', 'Repeats the same thing', 'False equality', 'Change the topic'] },
	{ prompt: 'If you don\'t agree, you are against us.', fallacy: 'Only two choices', options: ['Only two choices', 'Attack the person', 'Change the topic', 'Everyone does it'] },
	{ prompt: 'A famous person says it works, so it does.', fallacy: 'Famous person says so', options: ['Famous person says so', 'One example proves all', 'Everyone does it', 'Wrong cause'] },
	{ prompt: 'Your idea is bad because you are young.', fallacy: 'Attack the person', options: ['Attack the person', 'Change the topic', 'Exclude counterexamples', 'Repeats the same thing'] },
	{ prompt: 'Let one person cheat, soon everyone will cheat.', fallacy: 'Exaggerate consequences', options: ['Exaggerate consequences', 'Repeats the same thing', 'Only two choices', 'One example proves all'] },
	{ prompt: 'You say exercise helps, but you are fat.', fallacy: 'You do it too', options: ['You do it too', 'Change the topic', 'Natural means good', 'Happened after so caused it'] },
	{ prompt: 'Both sides are wrong, so the middle is right.', fallacy: 'Middle is best', options: ['Middle is best', 'False equality', 'Change the topic', 'Everyone does it'] },
	{ prompt: 'This is fair because it is fair.', fallacy: 'Repeats the same thing', options: ['Repeats the same thing', 'Makes you feel bad', 'Happened after so caused it', 'One example proves all'] },
	{ prompt: 'He made one mistake, so he is always wrong.', fallacy: 'One example proves all', options: ['One example proves all', 'Change the topic', 'Only two choices', 'Change the topic'] },
	{ prompt: 'Cats are better because cats are better.', fallacy: 'Repeats the same thing', options: ['Repeats the same thing', 'Wrong cause', 'Exclude counterexamples', 'Famous person says so'] },
	{ prompt: 'They both have eyes, so they are the same.', fallacy: 'False equality', options: ['False equality', 'Everyone does it', 'Attack the person', 'Happened after so caused it'] },
	{ prompt: 'We talked about grades; why bring up his clothes?', fallacy: 'Change the topic', options: ['Change the topic', 'Natural means good', 'Middle is best', 'Repeats the same thing'] },
	{ prompt: 'It is new, so it must be better.', fallacy: 'New means better', options: ['New means better', 'Makes you feel bad', 'Change the topic', 'Wrong cause'] },
	{ prompt: 'Many people like it, so it is true.', fallacy: 'Everyone does it', options: ['Everyone does it', 'One example proves all', 'Famous person says so', 'Exclude counterexamples'] }
];

function randomQ(): Q { return BANK[Math.floor(Math.random() * BANK.length)]; }

export default function LogicalFallaciesGame() {
	const router = useRouter();
	const { addXp } = useXP();
	const { theme } = useTheme();
	const [q, setQ] = useState<Q>(randomQ());
	const [streak, setStreak] = useState(0);
	const target = 6;
	const [showWin, setShowWin] = useState(false);
	const [showHelp, setShowHelp] = useState(false);

	useEffect(() => { if (streak >= target) { addXp(WIN_XP); setShowWin(true); } }, [streak]);

	const pick = (opt: string) => {
		const ok = opt === q.fallacy;
		setStreak(s => (ok ? s + 1 : 0));
		setQ(randomQ());
	};

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<GameHeader
				onBack={() => router.replace('/(tabs)/games/CriticalThinkingTrainingScreen')}
				gameTitle="Logical Fallacies"
				gameDescription="Test your ability to identify common logical fallacies in arguments."
				gameInstructions="Read each argument and identify the logical fallacy being used. Build a streak to win!"
			/>
			<View style={styles.gameContent}>
				<Text style={[styles.title, { color: theme.text }]}>Logical Fallacies</Text>
				<Text style={[styles.subtitle, { color: theme.textSecondary }]}>Identify the fallacy</Text>

				<View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
					<Text style={[styles.prompt, { color: theme.text }]}>{q.prompt}</Text>
					<View style={styles.opts}>
						{q.options.slice().sort(() => Math.random() - 0.5).map(o => (
							<TouchableOpacity key={o} style={[styles.opt, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => pick(o)}>
								<Text style={[styles.optText, { color: theme.text }]}>{o}</Text>
							</TouchableOpacity>
						))}
					</View>
					<Text style={[styles.progress, { color: theme.text }]}>Streak: {streak}/{target}</Text>
				</View>
			</View>

			<Modal visible={showWin} transparent animationType="fade" onRequestClose={() => setShowWin(false)}>
				<View style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}>
					<View style={[styles.modalCard, { backgroundColor: theme.card, alignItems: 'center' }]}> 
						<ConfettiCannon count={120} origin={{ x: 180, y: 0 }} fadeOut autoStart explosionSpeed={420} fallSpeed={2100} />
						<Text style={[styles.winTitle, { color: theme.text }]}>Great reasoning!</Text>
						<Text style={[styles.winText, { color: theme.textSecondary }]}>+{WIN_XP} XP</Text>
						<TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={() => { setShowWin(false); setStreak(0); setQ(randomQ()); }}><Text style={[styles.primaryText, { color: theme.buttonText }]}>Play Again</Text></TouchableOpacity>
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
						<Text style={[styles.helpTextP, { color: theme.textSecondary }]}>Read the argument and pick the simple description that best fits the error. A wrong pick resets your streak.</Text>
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
	prompt: { fontSize: 16, marginBottom: 10 },
	opts: { gap: 8 },
	opt: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
	optText: { fontWeight: '800' },
	primaryBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginTop: 8, alignSelf: 'center' },
	primaryText: { fontWeight: '800' },
	progress: { marginTop: 10, fontWeight: '800' },
	modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	modalCard: { padding: 18, borderRadius: 14, width: '86%' },
	winTitle: { fontSize: 22, fontWeight: '900', marginBottom: 6, textAlign: 'center' },
	winText: { fontSize: 14, marginBottom: 10, textAlign: 'center' },
	helpTitle: { fontSize: 18, fontWeight: '900', marginBottom: 8 },
	helpTextP: { fontSize: 14, lineHeight: 20 }
});


