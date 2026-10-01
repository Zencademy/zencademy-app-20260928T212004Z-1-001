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

type Snippet = { claim: string; evidence: string; strength: 'weak' | 'moderate' | 'strong' };

const SNIPPETS: Snippet[] = [
	{ claim: 'Daily walking improves cardiovascular health.', evidence: 'A peer-reviewed meta-analysis of 15 RCTs shows lower resting heart rate after 12 weeks.', strength: 'strong' },
	{ claim: 'This supplement boosts memory.', evidence: 'A single small, non-randomized study with no control group reported improvements.', strength: 'weak' },
	{ claim: 'Screen time affects sleep quality in teens.', evidence: 'Two longitudinal studies found correlations, controlling for confounders.', strength: 'moderate' },
	{ claim: 'High-protein diets cause kidney damage in healthy adults.', evidence: 'Expert reviews find insufficient evidence in healthy populations.', strength: 'moderate' },
	{ claim: 'Green tea increases metabolism.', evidence: 'Mixed results across small RCTs; effect sizes are inconsistent.', strength: 'weak' },
	{ claim: 'Mask-wearing reduces viral transmission.', evidence: 'Multiple RCTs and observational studies suggest reductions in transmission, though effect size varies.', strength: 'moderate' },
	{ claim: 'Strength training increases bone density.', evidence: 'Several controlled studies show improvements compared to controls across age groups.', strength: 'strong' },
	{ claim: 'A new app reduces anxiety.', evidence: 'Company blog cites testimonials and a small pilot without a control group.', strength: 'weak' },
	{ claim: 'Omega-3 lowers triglycerides.', evidence: 'Systematic reviews of RCTs indicate consistent triglyceride reduction.', strength: 'strong' },
	{ claim: 'Blue light filters improve sleep.', evidence: 'Mixed observational evidence with potential confounding factors.', strength: 'weak' },
	{ claim: 'Reading before bed improves sleep quality.', evidence: 'Small randomized trial found a mild improvement compared to phone use.', strength: 'moderate' },
	{ claim: 'Vitamin D prevents colds.', evidence: 'Evidence is mixed; some RCTs show small benefits, others show none.', strength: 'weak' },
	{ claim: 'Meditation reduces stress.', evidence: 'Multiple RCTs and meta-analyses show reductions in perceived stress.', strength: 'strong' },
	{ claim: 'Standing desks improve health outcomes.', evidence: 'Short-term studies show higher energy expenditure; long-term outcomes unclear.', strength: 'weak' },
	{ claim: 'High fiber intake helps digestion.', evidence: 'Consistent findings across cohort studies and RCTs support improvements.', strength: 'strong' },
	{ claim: 'Cold showers boost immunity.', evidence: 'Limited small studies; mechanism uncertain and results inconsistent.', strength: 'weak' },
	{ claim: 'Aerobic exercise lowers blood pressure.', evidence: 'Meta-analyses of RCTs report moderate reductions in systolic pressure.', strength: 'strong' },
	{ claim: 'Listening to music improves focus.', evidence: 'Mixed findings; small effects and high individual variation.', strength: 'weak' },
	{ claim: 'Probiotics improve gut health.', evidence: 'Varies by strain; several RCTs show benefits for specific conditions.', strength: 'moderate' },
	{ claim: 'Blueberries improve memory.', evidence: 'Some small RCTs in older adults show small benefits; evidence developing.', strength: 'moderate' }
];

function randomSnippet() { return SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)]; }

export default function EvidenceHuntGame() {
	const router = useRouter();
	const { awardFor, reset, last } = useGameReward();
	const { plan } = useXP();
	const winXp = last?.xp ?? sessionXp('Medium', plan);
	const { theme } = useTheme();
	const [snip, setSnip] = useState<Snippet>(randomSnippet());
	const [streak, setStreak] = useState(0);
	const target = 6;
	const [showWin, setShowWin] = useState(false);
	const [showHelp, setShowHelp] = useState(false);

	useEffect(() => { if (streak >= target) { void awardFor('Medium'); setShowWin(true); } }, [streak, awardFor]);

	const pick = (level: 'weak' | 'moderate' | 'strong') => {
		const ok = level === snip.strength;
		playSfx(ok ? 'correct' : 'wrong');
		setStreak(s => (ok ? s + 1 : 0));
		setSnip(randomSnippet());
	};

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<GameHeader
				onBack={() => router.replace('/(tabs)/games/CriticalThinkingTrainingScreen')}
				gameTitle="Evidence Hunt"
				gameDescription="Test your ability to evaluate the strength of evidence supporting various claims."
				gameInstructions="Read each claim and its evidence, then rate the evidence strength. Build a streak to win!"
			/>
			<View style={styles.gameContent}>
				<Text style={[styles.title, { color: theme.text }]}>Evidence Hunt</Text>
				<Text style={[styles.subtitle, { color: theme.textSecondary }]}>Rate the strength of evidence</Text>

				<View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
					<Text style={[styles.claim, { color: theme.text }]}>Claim: {snip.claim}</Text>
					<Text style={[styles.ev, { color: theme.textSecondary }]}>Evidence: {snip.evidence}</Text>
					<View style={styles.row}>
						<TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={() => pick('weak')}><Text style={[styles.primaryText, { color: theme.buttonText }]}>WEAK</Text></TouchableOpacity>
						<TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={() => pick('moderate')}><Text style={[styles.primaryText, { color: theme.buttonText }]}>MODERATE</Text></TouchableOpacity>
						<TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={() => pick('strong')}><Text style={[styles.primaryText, { color: theme.buttonText }]}>STRONG</Text></TouchableOpacity>
					</View>
					<Text style={[styles.progress, { color: theme.text }]}>Streak: {streak}/{target}</Text>
				</View>
			</View>

			<Modal visible={showWin} transparent animationType="fade" onRequestClose={() => setShowWin(false)}>
				<View style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}>
					<View style={[styles.modalCard, { backgroundColor: theme.card, alignItems: 'center' }]}> 
						<WinPulse active />
						<Text style={[styles.winTitle, { color: theme.text }]}>Evidence expert!</Text>
						<Text style={[styles.winText, { color: theme.textSecondary }]}>+{winXp} XP + {coinsForXp(winXp)} coins</Text>
						<TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={() => { setShowWin(false); reset(); setStreak(0);  setSnip(randomSnippet()); }}><Text style={[styles.primaryText, { color: theme.buttonText }]}>Play Again</Text></TouchableOpacity>
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
						<Text style={[styles.helpTextP, { color: theme.textSecondary }]}>Read the claim and its evidence. Rate the evidence strength (weak/moderate/strong). A wrong rating resets your streak.</Text>
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
	claim: { fontSize: 16, marginBottom: 6 },
	ev: { fontSize: 14, marginBottom: 10 },
	row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
	primaryBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
	primaryText: { fontWeight: '800' },
	progress: { marginTop: 10, fontWeight: '800' },
	modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	modalCard: { padding: 18, borderRadius: 14, width: '86%' },
	winTitle: { fontSize: 22, fontWeight: '900', marginBottom: 6, textAlign: 'center' },
	winText: { fontSize: 14, marginBottom: 10, textAlign: 'center' },
	helpTitle: { fontSize: 18, fontWeight: '900', marginBottom: 8 },
	helpTextP: { fontSize: 14, lineHeight: 20 }
});


