import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import GameHeader from '../../../components/GameHeader';
import { useTheme } from '../../../components/ThemeContext';
import { useXP } from '../../../components/XPContext';

const WIN_XP = 35; // Hard

type Q = { prompt: string; correct: string; options: string[] };

const BANK: Q[] = [
	{ prompt: 'What is metacognition?', correct: 'Thinking about your thinking', options: ['Thinking about your thinking', 'Meditation practice', 'Memory training', 'Speed reading'] },
	{ prompt: 'During a mindful pause, what should you observe?', correct: 'Your thoughts and reactions', options: ['Your thoughts and reactions', 'External distractions', 'Other people', 'The clock'] },
	{ prompt: 'What is the purpose of pausing before responding?', correct: 'Choose a better response', options: ['Choose a better response', 'Waste time', 'Avoid the question', 'Look thoughtful'] },
	{ prompt: 'How do you recognize automatic thoughts?', correct: 'Notice patterns and triggers', options: ['Notice patterns and triggers', 'Ignore them completely', 'Write them down', 'Tell others'] },
	{ prompt: 'What should you do when you notice negative self-talk?', correct: 'Question its accuracy', options: ['Question its accuracy', 'Believe it completely', 'Ignore it', 'Get angry'] },
	{ prompt: 'What is cognitive bias awareness?', correct: 'Recognizing thinking shortcuts', options: ['Recognizing thinking shortcuts', 'Avoiding all biases', 'Being perfect', 'Reading psychology'] },
	{ prompt: 'How do you practice metacognitive monitoring?', correct: 'Check your understanding', options: ['Check your understanding', 'Memorize everything', 'Speed up thinking', 'Avoid reflection'] },
	{ prompt: 'What is the benefit of questioning your assumptions?', correct: 'Discover better solutions', options: ['Discover better solutions', 'Create confusion', 'Waste time', 'Make others angry'] },
	{ prompt: 'How do you develop self-awareness?', correct: 'Regular self-reflection', options: ['Regular self-reflection', 'Ignore your feelings', 'Copy others', 'Read books'] },
	{ prompt: 'What should you do when emotions cloud judgment?', correct: 'Pause and observe', options: ['Pause and observe', 'Act immediately', 'Suppress emotions', 'Blame others'] },
	{ prompt: 'How do you recognize confirmation bias?', correct: 'Seek opposing viewpoints', options: ['Seek opposing viewpoints', 'Only read what you agree with', 'Ignore criticism', 'Stick to your opinion'] },
	{ prompt: 'What is the purpose of mental models?', correct: 'Improve decision making', options: ['Improve decision making', 'Complicate thinking', 'Memorize facts', 'Impress others'] },
	{ prompt: 'How do you practice cognitive flexibility?', correct: 'Consider multiple perspectives', options: ['Consider multiple perspectives', 'Stick to your view', 'Avoid change', 'Follow others'] },
	{ prompt: 'What should you do when you feel overwhelmed?', correct: 'Step back and assess', options: ['Step back and assess', 'Push through harder', 'Give up completely', 'Blame circumstances'] },
	{ prompt: 'How do you recognize emotional reasoning?', correct: 'Separate feelings from facts', options: ['Separate feelings from facts', 'Trust your gut', 'Ignore logic', 'Follow emotions'] },
	{ prompt: 'What is the benefit of mental rehearsal?', correct: 'Prepare for challenges', options: ['Prepare for challenges', 'Avoid reality', 'Waste time', 'Create anxiety'] },
	{ prompt: 'How do you practice cognitive defusion?', correct: 'Observe thoughts without attachment', options: ['Observe thoughts without attachment', 'Believe every thought', 'Suppress thoughts', 'Ignore thoughts'] },
	{ prompt: 'What should you do when you make a decision?', correct: 'Reflect on the process', options: ['Reflect on the process', 'Forget about it', 'Defend it always', 'Blame others'] },
	{ prompt: 'How do you recognize sunk cost fallacy?', correct: 'Consider future costs only', options: ['Consider future costs only', 'Focus on past investment', 'Ignore all costs', 'Blame the past'] },
	{ prompt: 'What is the purpose of mental models?', correct: 'Simplify complex situations', options: ['Simplify complex situations', 'Complicate decisions', 'Memorize everything', 'Avoid thinking'] },
	{ prompt: 'How do you recognize anchoring bias?', correct: 'Question first impressions', options: ['Question first impressions', 'Trust your instincts', 'Follow the crowd', 'Ignore new information'] },
	{ prompt: 'What is the benefit of mindfulness in thinking?', correct: 'Reduce automatic reactions', options: ['Reduce automatic reactions', 'Slow down thinking', 'Avoid decisions', 'Feel relaxed'] },
	{ prompt: 'How do you practice perspective taking?', correct: 'Consider others\' viewpoints', options: ['Consider others\' viewpoints', 'Defend your position', 'Ignore differences', 'Agree with everyone'] },
	{ prompt: 'What should you do when you notice cognitive distortions?', correct: 'Challenge them with evidence', options: ['Challenge them with evidence', 'Believe them completely', 'Ignore them', 'Share them with others'] },
	{ prompt: 'How do you recognize availability bias?', correct: 'Seek diverse information sources', options: ['Seek diverse information sources', 'Trust recent memories', 'Ignore statistics', 'Follow trends'] },
	{ prompt: 'What is the purpose of cognitive restructuring?', correct: 'Change unhelpful thinking patterns', options: ['Change unhelpful thinking patterns', 'Avoid all thoughts', 'Think faster', 'Memorize more'] },
	{ prompt: 'How do you practice metacognitive regulation?', correct: 'Adjust your thinking strategies', options: ['Adjust your thinking strategies', 'Stick to your methods', 'Ignore feedback', 'Copy others'] },
	{ prompt: 'What should you do when you notice mind reading?', correct: 'Ask for clarification', options: ['Ask for clarification', 'Trust your assumptions', 'Avoid the person', 'Get defensive'] },
	{ prompt: 'How do you recognize catastrophizing?', correct: 'Consider realistic outcomes', options: ['Consider realistic outcomes', 'Plan for the worst', 'Ignore problems', 'Worry more'] },
	{ prompt: 'What is the benefit of cognitive flexibility?', correct: 'Adapt to changing situations', options: ['Adapt to changing situations', 'Stay consistent', 'Avoid change', 'Follow routines'] },
	{ prompt: 'How do you practice thought stopping?', correct: 'Redirect attention mindfully', options: ['Redirect attention mindfully', 'Suppress all thoughts', 'Distract yourself', 'Ignore problems'] },
	{ prompt: 'What should you do when you notice black-and-white thinking?', correct: 'Look for gray areas', options: ['Look for gray areas', 'Choose a side', 'Avoid decisions', 'Follow extremes'] },
	{ prompt: 'How do you recognize the planning fallacy?', correct: 'Add buffer time to estimates', options: ['Add buffer time to estimates', 'Trust your instincts', 'Ignore deadlines', 'Rush through tasks'] },
	{ prompt: 'What is the purpose of cognitive reappraisal?', correct: 'Reframe situations positively', options: ['Reframe situations positively', 'Ignore problems', 'Complain more', 'Avoid challenges'] },
	{ prompt: 'How do you practice metacognitive knowledge?', correct: 'Learn about your thinking patterns', options: ['Learn about your thinking patterns', 'Ignore your thoughts', 'Copy others', 'Read psychology books'] },
	{ prompt: 'What should you do when you notice overgeneralization?', correct: 'Look for exceptions', options: ['Look for exceptions', 'Apply to everything', 'Ignore patterns', 'Avoid thinking'] },
	{ prompt: 'How do you recognize the fundamental attribution error?', correct: 'Consider situational factors', options: ['Consider situational factors', 'Blame personality', 'Ignore context', 'Judge quickly'] },
	{ prompt: 'What is the benefit of cognitive distancing?', correct: 'Reduce emotional intensity', options: ['Reduce emotional intensity', 'Avoid feelings', 'Suppress emotions', 'Ignore problems'] },
	{ prompt: 'How do you practice metacognitive control?', correct: 'Direct your thinking process', options: ['Direct your thinking process', 'Let thoughts wander', 'Ignore distractions', 'Follow instincts'] },
	{ prompt: 'What should you do when you notice personalization?', correct: 'Consider other factors', options: ['Consider other factors', 'Take all blame', 'Ignore responsibility', 'Feel guilty'] },
	{ prompt: 'How do you recognize the hindsight bias?', correct: 'Acknowledge uncertainty', options: ['Acknowledge uncertainty', 'Trust your memory', 'Ignore past mistakes', 'Feel overconfident'] },
	{ prompt: 'What is the purpose of cognitive defusion?', correct: 'Observe thoughts without believing them', options: ['Observe thoughts without believing them', 'Ignore all thoughts', 'Believe every thought', 'Suppress thinking'] },
	{ prompt: 'How do you practice metacognitive awareness?', correct: 'Notice your thinking patterns', options: ['Notice your thinking patterns', 'Ignore your thoughts', 'Think faster', 'Avoid reflection'] },
	{ prompt: 'What should you do when you notice emotional reasoning?', correct: 'Separate feelings from facts', options: ['Separate feelings from facts', 'Trust your emotions', 'Ignore logic', 'Follow your gut'] },
	{ prompt: 'How do you recognize the availability heuristic?', correct: 'Seek comprehensive information', options: ['Seek comprehensive information', 'Trust what comes to mind', 'Ignore data', 'Follow intuition'] },
	{ prompt: 'What is the benefit of cognitive restructuring?', correct: 'Improve mental health', options: ['Improve mental health', 'Avoid problems', 'Think less', 'Feel better'] },
	{ prompt: 'How do you practice metacognitive evaluation?', correct: 'Assess your thinking effectiveness', options: ['Assess your thinking effectiveness', 'Ignore results', 'Trust instincts', 'Avoid feedback'] },
	{ prompt: 'What should you do when you notice mind reading?', correct: 'Ask for clarification', options: ['Ask for clarification', 'Trust your assumptions', 'Avoid the person', 'Get defensive'] },
	{ prompt: 'How do you recognize the planning fallacy?', correct: 'Add buffer time to estimates', options: ['Add buffer time to estimates', 'Trust your instincts', 'Ignore deadlines', 'Rush through tasks'] },
	{ prompt: 'What is the purpose of cognitive reappraisal?', correct: 'Reframe situations positively', options: ['Reframe situations positively', 'Ignore problems', 'Complain more', 'Avoid challenges'] },
	{ prompt: 'How do you practice metacognitive knowledge?', correct: 'Learn about your thinking patterns', options: ['Learn about your thinking patterns', 'Ignore your thoughts', 'Copy others', 'Read psychology books'] },
	{ prompt: 'What should you do when you notice overgeneralization?', correct: 'Look for exceptions', options: ['Look for exceptions', 'Apply to everything', 'Ignore patterns', 'Avoid thinking'] },
	{ prompt: 'How do you recognize the fundamental attribution error?', correct: 'Consider situational factors', options: ['Consider situational factors', 'Blame personality', 'Ignore context', 'Judge quickly'] },
	{ prompt: 'What is the benefit of cognitive distancing?', correct: 'Reduce emotional intensity', options: ['Reduce emotional intensity', 'Avoid feelings', 'Suppress emotions', 'Ignore problems'] },
	{ prompt: 'How do you practice metacognitive control?', correct: 'Direct your thinking process', options: ['Direct your thinking process', 'Let thoughts wander', 'Ignore distractions', 'Follow instincts'] },
	{ prompt: 'What should you do when you notice personalization?', correct: 'Consider other factors', options: ['Consider other factors', 'Take all blame', 'Ignore responsibility', 'Feel guilty'] },
	{ prompt: 'How do you recognize the hindsight bias?', correct: 'Acknowledge uncertainty', options: ['Acknowledge uncertainty', 'Trust your memory', 'Ignore past mistakes', 'Feel overconfident'] },
	{ prompt: 'What is the purpose of cognitive defusion?', correct: 'Observe thoughts without believing them', options: ['Observe thoughts without believing them', 'Ignore all thoughts', 'Believe every thought', 'Suppress thinking'] },
	{ prompt: 'How do you practice metacognitive awareness?', correct: 'Notice your thinking patterns', options: ['Notice your thinking patterns', 'Ignore your thoughts', 'Think faster', 'Avoid reflection'] },
	{ prompt: 'What should you do when you notice emotional reasoning?', correct: 'Separate feelings from facts', options: ['Separate feelings from facts', 'Trust your emotions', 'Ignore logic', 'Follow your gut'] },
	{ prompt: 'How do you recognize the availability heuristic?', correct: 'Seek comprehensive information', options: ['Seek comprehensive information', 'Trust what comes to mind', 'Ignore data', 'Follow intuition'] },
	{ prompt: 'What is the benefit of cognitive restructuring?', correct: 'Improve mental health', options: ['Improve mental health', 'Avoid problems', 'Think less', 'Feel better'] },
	{ prompt: 'How do you practice metacognitive evaluation?', correct: 'Assess your thinking effectiveness', options: ['Assess your thinking effectiveness', 'Ignore results', 'Trust instincts', 'Avoid feedback'] }
];

function randomQ(): Q { return BANK[Math.floor(Math.random() * BANK.length)]; }

export default function MindfulPauseGame() {
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
		const ok = opt === q.correct;
		setStreak(s => (ok ? s + 1 : 0));
		setQ(randomQ());
	};

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<GameHeader
				onBack={() => router.replace('/(tabs)/games/MetacognitionTrainingScreen')}
				gameTitle="Mindful Pause"
				gameDescription="Practice metacognitive awareness by observing your thinking processes and responses."
				gameInstructions="Read each question about metacognition and choose the most insightful answer about thinking processes. Build a streak to win!"
			/>
			<View style={styles.gameContent}>
				<Text style={[styles.title, { color: theme.text }]}>Mindful Pause</Text>
				<Text style={[styles.subtitle, { color: theme.textSecondary }]}>Observe your thinking process</Text>

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
						<Text style={[styles.winTitle, { color: theme.text }]}>Outstanding awareness!</Text>
						<Text style={[styles.winText, { color: theme.textSecondary }]}>+{WIN_XP} XP</Text>
						<TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={() => { setShowWin(false); setStreak(0); setQ(randomQ()); }}><Text style={[styles.primaryText, { color: theme.buttonText }]}>Play Again</Text></TouchableOpacity>
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
						<Text style={[styles.helpTextP, { color: theme.textSecondary }]}>Read each question about metacognition and choose the most insightful answer about thinking processes. A wrong pick resets your streak.</Text>
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
