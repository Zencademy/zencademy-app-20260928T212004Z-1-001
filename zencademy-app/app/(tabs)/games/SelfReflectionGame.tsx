import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import GameHeader from '../../../components/GameHeader';
import { useTheme } from '../../../components/ThemeContext';
import { useGameReward } from '../../../hooks/useGameReward';
import { coinsForXp } from '../../../lib/progression';

const WIN_XP = 12; // Easy

type Q = { prompt: string; correct: string; options: string[] };

const BANK: Q[] = [
	{ prompt: 'How do you feel when you make a mistake?', correct: 'I learn from it', options: ['I learn from it', 'I get angry', 'I ignore it', 'I blame others'] },
	{ prompt: 'What do you do when you don\'t understand something?', correct: 'Ask for help', options: ['Ask for help', 'Give up', 'Pretend I know', 'Skip it'] },
	{ prompt: 'How do you prepare for a difficult task?', correct: 'Plan and practice', options: ['Plan and practice', 'Worry about it', 'Avoid it', 'Rush into it'] },
	{ prompt: 'What do you think about when you succeed?', correct: 'What worked well', options: ['What worked well', 'I am perfect', 'It was luck', 'Others helped'] },
	{ prompt: 'How do you handle criticism?', correct: 'Listen and improve', options: ['Listen and improve', 'Get defensive', 'Ignore it', 'Take it personally'] },
	{ prompt: 'What do you do when you feel stressed?', correct: 'Take a break', options: ['Take a break', 'Work harder', 'Give up', 'Complain'] },
	{ prompt: 'How do you decide what to do first?', correct: 'Prioritize tasks', options: ['Prioritize tasks', 'Do what\'s easy', 'Do what\'s fun', 'Do nothing'] },
	{ prompt: 'What do you think about your goals?', correct: 'Review and adjust', options: ['Review and adjust', 'Set and forget', 'Change them often', 'Don\'t have any'] },
	{ prompt: 'How do you feel about asking questions?', correct: 'It helps me learn', options: ['It helps me learn', 'It shows weakness', 'It wastes time', 'It\'s embarrassing'] },
	{ prompt: 'What do you do when you finish a task?', correct: 'Reflect on it', options: ['Reflect on it', 'Forget about it', 'Start another', 'Celebrate'] },
	{ prompt: 'How do you handle distractions?', correct: 'Focus on priorities', options: ['Focus on priorities', 'Get distracted', 'Give up', 'Blame others'] },
	{ prompt: 'What do you think about your progress?', correct: 'Track and improve', options: ['Track and improve', 'Don\'t care', 'Compare to others', 'Think I\'m perfect'] },
	{ prompt: 'How do you feel about challenges?', correct: 'They help me grow', options: ['They help me grow', 'They scare me', 'I avoid them', 'They\'re unfair'] },
	{ prompt: 'What do you do when you feel overwhelmed?', correct: 'Break it down', options: ['Break it down', 'Panic', 'Give up', 'Ask others to do it'] },
	{ prompt: 'How do you think about your mistakes?', correct: 'Learn from them', options: ['Learn from them', 'Hide them', 'Blame others', 'Forget them'] },
	{ prompt: 'What do you do when you don\'t know something?', correct: 'Research it', options: ['Research it', 'Guess', 'Ask someone else', 'Skip it'] },
	{ prompt: 'How do you feel about feedback?', correct: 'It helps me improve', options: ['It helps me improve', 'It hurts my feelings', 'I ignore it', 'I get angry'] },
	{ prompt: 'What do you do when you feel stuck?', correct: 'Try a different approach', options: ['Try a different approach', 'Give up', 'Keep doing the same', 'Blame the task'] },
	{ prompt: 'How do you think about your strengths?', correct: 'Use them wisely', options: ['Use them wisely', 'Show them off', 'Ignore them', 'Think I\'m perfect'] },
	{ prompt: 'What do you do when you feel tired?', correct: 'Rest and recharge', options: ['Rest and recharge', 'Push through', 'Give up', 'Complain'] },
	{ prompt: 'How do you handle failure?', correct: 'Learn and try again', options: ['Learn and try again', 'Give up completely', 'Blame others', 'Feel ashamed'] },
	{ prompt: 'What do you do when someone disagrees with you?', correct: 'Listen to their perspective', options: ['Listen to their perspective', 'Argue harder', 'Ignore them', 'Get angry'] },
	{ prompt: 'How do you feel about change?', correct: 'Adapt and grow', options: ['Adapt and grow', 'Resist it', 'Fear it', 'Avoid it'] },
	{ prompt: 'What do you do when you feel anxious?', correct: 'Breathe and calm down', options: ['Breathe and calm down', 'Panic more', 'Ignore it', 'Run away'] },
	{ prompt: 'How do you handle success?', correct: 'Stay humble and grateful', options: ['Stay humble and grateful', 'Brag about it', 'Take all credit', 'Expect more'] },
	{ prompt: 'What do you do when you feel bored?', correct: 'Find something meaningful', options: ['Find something meaningful', 'Complain', 'Do nothing', 'Distract yourself'] },
	{ prompt: 'How do you think about your weaknesses?', correct: 'Work on improving them', options: ['Work on improving them', 'Hide them', 'Blame genetics', 'Accept them as permanent'] },
	{ prompt: 'What do you do when you feel jealous?', correct: 'Focus on your own growth', options: ['Focus on your own growth', 'Resent others', 'Copy them', 'Give up'] },
	{ prompt: 'How do you handle uncertainty?', correct: 'Stay flexible and adapt', options: ['Stay flexible and adapt', 'Panic', 'Avoid decisions', 'Demand certainty'] },
	{ prompt: 'What do you do when you feel proud?', correct: 'Share credit and inspire others', options: ['Share credit and inspire others', 'Brag endlessly', 'Keep it secret', 'Expect praise'] },
	{ prompt: 'How do you handle disappointment?', correct: 'Process it and move forward', options: ['Process it and move forward', 'Dwell on it', 'Blame others', 'Give up'] },
	{ prompt: 'What do you do when you feel confident?', correct: 'Use it to help others', options: ['Use it to help others', 'Show off', 'Take risks', 'Ignore others'] },
	{ prompt: 'How do you think about your future?', correct: 'Plan but stay flexible', options: ['Plan but stay flexible', 'Worry constantly', 'Ignore it', 'Expect the worst'] },
	{ prompt: 'What do you do when you feel grateful?', correct: 'Express it and give back', options: ['Express it and give back', 'Keep it to yourself', 'Expect more', 'Feel entitled'] },
	{ prompt: 'How do you handle pressure?', correct: 'Focus on what you can control', options: ['Focus on what you can control', 'Panic', 'Avoid it', 'Blame others'] },
	{ prompt: 'What do you do when you feel inspired?', correct: 'Take action and create', options: ['Take action and create', 'Just feel good', 'Tell others', 'Wait for motivation'] },
	{ prompt: 'How do you think about your past?', correct: 'Learn from it and let go', options: ['Learn from it and let go', 'Dwell on mistakes', 'Live in nostalgia', 'Blame it for everything'] },
	{ prompt: 'What do you do when you feel curious?', correct: 'Explore and learn', options: ['Explore and learn', 'Ignore it', 'Ask others to find out', 'Stay comfortable'] },
	{ prompt: 'How do you handle rejection?', correct: 'Learn from it and try again', options: ['Learn from it and try again', 'Take it personally', 'Give up', 'Blame others'] },
	{ prompt: 'What do you do when you feel peaceful?', correct: 'Enjoy it and share it', options: ['Enjoy it and share it', 'Worry it won\'t last', 'Ignore it', 'Look for problems'] }
];

function randomQ(): Q { return BANK[Math.floor(Math.random() * BANK.length)]; }

export default function SelfReflectionGame() {
	const router = useRouter();
	const { award, reset } = useGameReward();
	const { theme } = useTheme();
	const [q, setQ] = useState<Q>(randomQ());
	const [streak, setStreak] = useState(0);
	const target = 6;
	const [showWin, setShowWin] = useState(false);
	const [showHelp, setShowHelp] = useState(false);

	useEffect(() => {
		if (streak >= target) {
			void award(WIN_XP);
			setShowWin(true);
		}
	}, [streak, award]);

	const pick = (opt: string) => {
		const ok = opt === q.correct;
		setStreak(s => (ok ? s + 1 : 0));
		setQ(randomQ());
	};

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<GameHeader
				onBack={() => router.replace('/(tabs)/games/MetacognitionTrainingScreen')}
				gameTitle="Self-Reflection"
				gameDescription="Practice metacognitive awareness by reflecting on your thinking patterns and responses."
				gameInstructions="Read each question and choose the most thoughtful, self-aware response. Build a streak to win!"
			/>
			<View style={styles.gameContent}>
				<Text style={[styles.title, { color: theme.text }]}>Self-Reflection</Text>
				<Text style={[styles.subtitle, { color: theme.textSecondary }]}>Think about your thinking</Text>

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
						<Text style={[styles.winTitle, { color: theme.text }]}>Great reflection!</Text>
						<Text style={[styles.winText, { color: theme.textSecondary }]}>+{WIN_XP} XP + {coinsForXp(WIN_XP)} coins</Text>
						<TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={() => { setShowWin(false); reset(); setStreak(0); setQ(randomQ()); }}><Text style={[styles.primaryText, { color: theme.buttonText }]}>Play Again</Text></TouchableOpacity>
						<TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.surface, marginTop: 8 }]} onPress={() => { setShowWin(false); router.replace('/(tabs)/games/MetacognitionTrainingScreen'); }}>
							<Text style={[styles.primaryText, { color: theme.text }]}>Go to Main Menu</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			<Modal visible={showHelp} transparent animationType="fade" onRequestClose={() => setShowHelp(false)}>
				<View style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}>
					<View style={[styles.modalCard, { backgroundColor: theme.card }]}>
						<Text style={[styles.helpTitle, { color: theme.text }]}>How to Play</Text>
						<Text style={[styles.helpTextP, { color: theme.textSecondary }]}>Read each question and choose the most thoughtful, self-aware response. A wrong pick resets your streak.</Text>
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
