import { WinPulse } from '../../../components/WinPulse';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GameHeader from '../../../components/GameHeader';
import { useTheme } from '../../../components/ThemeContext';
import { useGameReward } from '../../../hooks/useGameReward';
import { coinsForXp, sessionXp } from '../../../lib/progression';
import { useXP } from '../../../components/XPContext';
import { playSfx } from '../../../lib/sound/SoundPack';

type Q = { prompt: string; correct: string; options: string[] };

const BANK: Q[] = [
	{ prompt: 'What makes a goal SMART?', correct: 'Specific, Measurable, Achievable, Relevant, Time-bound', options: ['Specific, Measurable, Achievable, Relevant, Time-bound', 'Simple, Meaningful, Attractive, Realistic, Timely', 'Smart, Measurable, Attainable, Realistic, Timed', 'Specific, Meaningful, Achievable, Realistic, Timed'] },
	{ prompt: 'How often should you review your goals?', correct: 'Regularly (weekly/monthly)', options: ['Regularly (weekly/monthly)', 'Only when you fail', 'Once a year', 'Never, set them and forget them'] },
	{ prompt: 'What should you do if you\'re not making progress?', correct: 'Analyze why and adjust', options: ['Analyze why and adjust', 'Give up completely', 'Blame external factors', 'Lower your standards'] },
	{ prompt: 'What is the best way to track progress?', correct: 'Measure specific outcomes', options: ['Measure specific outcomes', 'Just feel good about it', 'Compare to others', 'Ignore the results'] },
	{ prompt: 'When should you celebrate progress?', correct: 'At milestones and achievements', options: ['At milestones and achievements', 'Only when fully complete', 'Never, stay humble', 'Every day regardless'] },
	{ prompt: 'What do you do with unrealistic goals?', correct: 'Break them into smaller steps', options: ['Break them into smaller steps', 'Abandon them completely', 'Keep trying harder', 'Blame yourself'] },
	{ prompt: 'How do you know if a goal is achievable?', correct: 'You have the resources and skills', options: ['You have the resources and skills', 'It sounds impressive', 'Others have done it', 'It feels challenging'] },
	{ prompt: 'What is the purpose of setting deadlines?', correct: 'Create urgency and focus', options: ['Create urgency and focus', 'Add stress to your life', 'Make goals harder', 'Impress others'] },
	{ prompt: 'How do you handle competing goals?', correct: 'Prioritize and focus on one', options: ['Prioritize and focus on one', 'Try to do all at once', 'Choose the easiest one', 'Give up on all'] },
	{ prompt: 'What should you do when you achieve a goal?', correct: 'Reflect and set the next one', options: ['Reflect and set the next one', 'Rest on your laurels', 'Tell everyone about it', 'Forget about it'] },
	{ prompt: 'How do you make goals more motivating?', correct: 'Connect them to your values', options: ['Connect them to your values', 'Make them harder', 'Add more pressure', 'Compare to others'] },
	{ prompt: 'What is the best time to set new goals?', correct: 'After reviewing current progress', options: ['After reviewing current progress', 'At the start of the year', 'When you feel motivated', 'When others set them'] },
	{ prompt: 'How do you measure success?', correct: 'Against your own standards', options: ['Against your own standards', 'Compared to others', 'By how much you suffer', 'By how fast you finish'] },
	{ prompt: 'What do you do with vague goals?', correct: 'Make them more specific', options: ['Make them more specific', 'Keep them as they are', 'Abandon them', 'Hope for the best'] },
	{ prompt: 'How do you stay committed to long-term goals?', correct: 'Break them into short-term steps', options: ['Break them into short-term steps', 'Think about the end result', 'Ignore short-term setbacks', 'Tell everyone about them'] },
	{ prompt: 'What is the role of feedback in goal setting?', correct: 'Help you adjust and improve', options: ['Help you adjust and improve', 'Make you feel bad', 'Slow you down', 'Confuse you'] },
	{ prompt: 'How do you handle goal failure?', correct: 'Learn from it and try again', options: ['Learn from it and try again', 'Give up completely', 'Blame external factors', 'Lower your standards'] },
	{ prompt: 'What makes a goal relevant?', correct: 'It aligns with your bigger purpose', options: ['It aligns with your bigger purpose', 'It sounds impressive', 'Others think it\'s good', 'It\'s trendy'] },
	{ prompt: 'How do you know if you\'re making progress?', correct: 'You can measure improvement', options: ['You can measure improvement', 'You feel good about it', 'Others notice', 'You\'re busy'] },
	{ prompt: 'What should you do with completed goals?', correct: 'Document lessons learned', options: ['Document lessons learned', 'Forget about them', 'Brag about them', 'Set harder ones'] },
	{ prompt: 'How do you set priorities among goals?', correct: 'Consider impact and urgency', options: ['Consider impact and urgency', 'Choose the easiest ones', 'Do what others want', 'Pick randomly'] },
	{ prompt: 'What is the purpose of writing down goals?', correct: 'Clarify and commit to them', options: ['Clarify and commit to them', 'Show others', 'Feel organized', 'Waste time'] },
	{ prompt: 'How do you handle goal conflicts?', correct: 'Find a balance or choose one', options: ['Find a balance or choose one', 'Try to do both', 'Give up on both', 'Blame circumstances'] },
	{ prompt: 'What makes a goal time-bound?', correct: 'It has a specific deadline', options: ['It has a specific deadline', 'It takes a long time', 'It happens in the future', 'It has no time limit'] },
	{ prompt: 'How do you adjust goals when circumstances change?', correct: 'Modify them to fit new reality', options: ['Modify them to fit new reality', 'Give up completely', 'Ignore the changes', 'Blame the changes'] },
	{ prompt: 'What is the benefit of sharing goals?', correct: 'Get support and accountability', options: ['Get support and accountability', 'Show off', 'Get criticized', 'Feel pressured'] },
	{ prompt: 'How do you know if a goal is specific?', correct: 'It\'s clear and detailed', options: ['It\'s clear and detailed', 'It sounds good', 'It\'s ambitious', 'It\'s popular'] },
	{ prompt: 'What should you do with easy goals?', correct: 'Make them more challenging', options: ['Make them more challenging', 'Keep them easy', 'Abandon them', 'Brag about them'] },
	{ prompt: 'How do you handle goal setbacks?', correct: 'Learn and adjust strategy', options: ['Learn and adjust strategy', 'Give up', 'Blame others', 'Lower standards'] },
	{ prompt: 'What makes a goal measurable?', correct: 'You can track progress', options: ['You can track progress', 'It feels important', 'It takes effort', 'It sounds good'] },
	{ prompt: 'How do you stay motivated with long goals?', correct: 'Celebrate small wins', options: ['Celebrate small wins', 'Ignore progress', 'Focus only on the end', 'Compare to others'] },
	{ prompt: 'What should you do with outdated goals?', correct: 'Update or replace them', options: ['Update or replace them', 'Keep them forever', 'Forget about them', 'Blame yourself'] },
	{ prompt: 'How do you know if a goal is realistic?', correct: 'You can achieve it with effort', options: ['You can achieve it with effort', 'It sounds impossible', 'Others think it\'s hard', 'It requires luck'] },
	{ prompt: 'What is the purpose of goal visualization?', correct: 'Strengthen motivation', options: ['Strengthen motivation', 'Waste time', 'Avoid action', 'Feel good'] },
	{ prompt: 'How do you handle multiple goals?', correct: 'Focus on one at a time', options: ['Focus on one at a time', 'Try to do all', 'Choose randomly', 'Ignore most'] },
	{ prompt: 'What should you do when you exceed a goal?', correct: 'Set a higher target', options: ['Set a higher target', 'Stop trying', 'Brag about it', 'Lower future goals'] },
	{ prompt: 'How do you make goals more meaningful?', correct: 'Connect to your values', options: ['Connect to your values', 'Make them bigger', 'Tell more people', 'Add pressure'] },
	{ prompt: 'What is the role of planning in goal achievement?', correct: 'Create a clear path', options: ['Create a clear path', 'Waste time', 'Add stress', 'Limit flexibility'] },
	{ prompt: 'How do you handle goal criticism?', correct: 'Consider it thoughtfully', options: ['Consider it thoughtfully', 'Ignore it completely', 'Get defensive', 'Give up'] },
	{ prompt: 'What makes a goal sustainable?', correct: 'It fits your lifestyle', options: ['It fits your lifestyle', 'It\'s very hard', 'It requires sacrifice', 'It\'s temporary'] },
	{ prompt: 'How do you know when to abandon a goal?', correct: 'When it no longer serves you', options: ['When it no longer serves you', 'When it gets hard', 'When others doubt', 'When you fail once'] },
	{ prompt: 'What should you do with achieved goals?', correct: 'Build on the success', options: ['Build on the success', 'Forget about them', 'Brag endlessly', 'Lower future goals'] }
];

function randomQ(): Q { return BANK[Math.floor(Math.random() * BANK.length)]; }

export default function GoalReviewGame() {
	const router = useRouter();
	const { awardFor, reset, last } = useGameReward();
	const { plan } = useXP();
	const winXp = last?.xp ?? sessionXp('Medium', plan);
	const { theme } = useTheme();
	const [q, setQ] = useState<Q>(randomQ());
	const [streak, setStreak] = useState(0);
	const target = 6;
	const [showWin, setShowWin] = useState(false);
	const [showHelp, setShowHelp] = useState(false);

	useEffect(() => { if (streak >= target) { void awardFor('Medium'); setShowWin(true); } }, [streak, awardFor]);

	const pick = (opt: string) => {
		const ok = opt === q.correct;
		playSfx(ok ? 'correct' : 'wrong');
		setStreak(s => (ok ? s + 1 : 0));
		setQ(randomQ());
	};

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<GameHeader
				onBack={() => router.replace('/(tabs)/games/MetacognitionTrainingScreen')}
				gameTitle="Goal Review"
				gameDescription="Practice effective goal setting and review strategies for better achievement."
				gameInstructions="Read each question about goal setting and choose the most effective strategy. Build a streak to win!"
			/>
			<View style={styles.gameContent}>
				<Text style={[styles.title, { color: theme.text }]}>Goal Review</Text>
				<Text style={[styles.subtitle, { color: theme.textSecondary }]}>Assess and improve your goals</Text>

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
						<WinPulse active />
						<Text style={[styles.winTitle, { color: theme.text }]}>Excellent goal setting!</Text>
						<Text style={[styles.winText, { color: theme.textSecondary }]}>+{winXp} XP + {coinsForXp(winXp)} coins</Text>
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
						<Text style={[styles.helpTextP, { color: theme.textSecondary }]}>Read each question about goal setting and choose the most effective strategy. A wrong pick resets your streak.</Text>
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
