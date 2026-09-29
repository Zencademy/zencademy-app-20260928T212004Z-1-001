import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

type Chapter = { id: number; title: string; content: string; pages: number };

const chapters: Chapter[] = [
  {
    id: 1,
    title: 'Foundations of Holistic Health',
    content: `**Holistic health** views the human being as an integrated system of body, mind, emotions, and environment. Wellness arises when these domains are aligned and supported.

**Principles:**
• **Systems thinking**: Parts influence wholes
• **Personalization**: Biochemical individuality matters
• **Prevention**: Build health proactively, not only reactively
• **Balance**: Homeostasis across sleep, movement, nutrition, stress
• **Connection**: Relationships and purpose shape biology

**Core concepts explained:**
**Systems thinking** recognizes that changing one aspect affects the entire system. For example, improving sleep quality enhances mood, energy, and immune function, while poor sleep disrupts metabolism, stress hormones, and cognitive performance.

**Biochemical individuality** means each person has unique nutritional needs, stress responses, and optimal movement patterns. What works for one person may not work for another, requiring personalized approaches.

**Domains:**
• **Physical**: Sleep, nutrition, movement, recovery
• **Mental**: Focus, learning, creative play
• **Emotional**: Regulation, self-compassion, relationships
• **Spiritual**: Values, meaning, contribution
• **Environmental**: Light, nature, air, noise, digital load

**Integration examples:**
When you prioritize **sleep**, you're supporting physical recovery, mental clarity, emotional stability, and spiritual reflection. When you practice **mindful eating**, you're nourishing your body while cultivating presence and gratitude.

**Holistic assessment questions:**
• How do I feel physically today?
• What's my mental energy and focus level?
• Am I emotionally balanced or reactive?
• Do my actions align with my values?
• How connected do I feel to nature and others?`,
    pages: 8,
  },
  {
    id: 2,
    title: 'Sleep, Stress, and Recovery',
    content: `**Sleep** is the bedrock. Target 7–9 hours with consistent schedules. Use wind-down rituals and protect darkness and temperature.

**Sleep science insights:**
Sleep occurs in cycles of 90-120 minutes, including light sleep, deep sleep, and REM (dreaming) phases. **Deep sleep** is crucial for physical recovery and immune function, while **REM sleep** supports memory consolidation and emotional processing.

**Sleep optimization strategies:**
• **Circadian alignment**: Go to bed and wake up at the same time daily
• **Light management**: Dim lights 2 hours before bed, avoid blue light
• **Temperature control**: Keep bedroom cool (65-68°F/18-20°C)
• **Noise reduction**: Use white noise or earplugs if needed
• **Comfort**: Invest in quality mattress, pillows, and bedding

**Stress regulation:**
• **Parasympathetic practices**: slow breath, nature breaks, social connection
• **Work cadence**: Deep focus blocks, breaks, and clear boundaries
• **Recovery**: Active rest days, mobility, and quiet time to integrate

**Stress response understanding:**
The **autonomic nervous system** has two branches: sympathetic (fight-or-flight) and parasympathetic (rest-and-digest). Chronic stress keeps us in sympathetic mode, leading to inflammation, poor sleep, and health issues.

**Recovery practices:**
• **Active recovery**: Gentle movement, stretching, walking
• **Passive recovery**: Rest, meditation, massage, sauna
• **Social recovery**: Connection with loved ones, laughter
• **Nature recovery**: Time outdoors, forest bathing

**Mini protocol:**
• Morning sunlight 5–10 minutes
• Midday movement 10–20 minutes
• Evening digital sunset and gentle stretching

**Advanced recovery techniques:**
• **Cold exposure**: Cold showers or ice baths for inflammation reduction
• **Heat therapy**: Sauna or hot baths for relaxation and detoxification
• **Compression**: Compression garments for muscle recovery
• **Vibration**: Foam rolling or vibration therapy for tissue health`,
    pages: 8,
  },
  {
    id: 3,
    title: 'Nutrition and Metabolic Health',
    content: `Aim for **nutrient-dense, minimally processed foods**:
• **Protein**: supports muscle, neurotransmitters, and satiety
• **Fiber**: gut health, blood sugar stability
• **Color**: antioxidants and phytonutrients
• **Fats**: omega-3 for anti-inflammatory balance

**Macronutrient balance:**
• **Protein**: 0.8-1.2g per kg body weight (more if active)
• **Carbohydrates**: 45-65% of calories, focus on complex sources
• **Fats**: 20-35% of calories, emphasize healthy sources

**Protein quality matters:**
Complete proteins (animal sources, quinoa, soy) contain all essential amino acids. Plant-based eaters should combine complementary proteins (beans + rice, hummus + whole grain bread).

**Fiber benefits:**
• **Soluble fiber**: Slows digestion, stabilizes blood sugar
• **Insoluble fiber**: Promotes regularity, feeds gut bacteria
• **Resistant starch**: Found in cooled potatoes, rice, legumes

**Stable energy checklist:**
• Protein at each meal
• Color on the plate
• Whole-food carbs around activity windows
• Hydration across the day

**Blood sugar management:**
• **Glycemic index**: Choose lower GI foods for sustained energy
• **Meal timing**: Eat within 1 hour of waking, don't skip meals
• **Portion control**: Use hand portions (palm protein, fist carbs, thumb fats)
• **Food combining**: Pair carbs with protein/fat to slow absorption

**Mindful eating:**
• Slow down, chew thoroughly
• Notice hunger/fullness cues
• Eat without screens to honor satiety signals

**Mindful eating practices:**
• **Hunger scale**: Rate hunger 1-10, eat at 3-4, stop at 6-7
• **20-minute rule**: It takes 20 minutes for satiety signals to reach brain
• **Gratitude practice**: Thank your food and body before eating
• **Sensory awareness**: Notice colors, smells, textures, flavors

**Hydration guidelines:**
• **Daily target**: 0.5-1 ounce per pound body weight
• **Timing**: Drink water upon waking, before meals, during exercise
• **Signs of dehydration**: Dark urine, fatigue, headache, dry mouth
• **Electrolytes**: Add salt, lemon, or electrolyte powder for intense activity`,
    pages: 10,
  },
  {
    id: 4,
    title: 'Movement and Mobility',
    content: `Train across **four pillars**:
• **Strength**: 2–3x/week compound lifts or bodyweight
• **Cardio**: Zone 2 base + intervals as needed
• **Mobility**: Daily joint rotations and dynamic stretches
• **Play**: Sports, dance, hiking—joy sustains consistency

**Movement philosophy:**
Movement should be **functional**, **enjoyable**, and **sustainable**. Choose activities that improve your ability to perform daily tasks, bring you joy, and can be maintained long-term.

**Strength training principles:**
• **Progressive overload**: Gradually increase weight, reps, or difficulty
• **Compound movements**: Squats, deadlifts, push-ups, rows
• **Full range of motion**: Train through complete movement patterns
• **Recovery**: Allow 48-72 hours between training same muscle groups

**Cardiovascular training:**
• **Zone 2 training**: 60-70% max heart rate, sustainable conversation
• **High-intensity intervals**: 20-60 seconds work, 1-3 minutes rest
• **Recovery**: Easy days between hard sessions
• **Variety**: Mix running, cycling, swimming, rowing

**Mobility and flexibility:**
• **Dynamic stretching**: Movement-based stretches before activity
• **Static stretching**: Hold positions 30-60 seconds after activity
• **Joint mobility**: Circles and rotations for all major joints
• **Myofascial release**: Foam rolling, massage, self-massage

**Desk antidotes:**
• Hourly movement snacks (60–120 seconds)
• Posture resets and breath breaks
• Walking calls when possible

**Workplace movement strategies:**
• **Standing desk**: Alternate sitting and standing
• **Walking meetings**: Conduct meetings while walking
• **Stair climbing**: Take stairs instead of elevator
• **Parking distance**: Park further away to increase steps
• **Movement reminders**: Set hourly alerts to move

**Movement throughout life stages:**
• **Children**: Unstructured play, sports, exploration
• **Adults**: Functional fitness, stress relief, health maintenance
• **Seniors**: Balance, strength, flexibility, social connection

**Injury prevention:**
• **Warm-up**: 5-10 minutes light activity before exercise
• **Proper form**: Learn correct technique before increasing intensity
• **Gradual progression**: Increase volume/intensity by 10% weekly
• **Listen to body**: Rest when needed, don't push through pain`,
    pages: 10,
  },
  {
    id: 5,
    title: 'Emotional Fitness and Relationships',
    content: `**Regulation toolkit:**
• Name emotions: "I notice anxiety in the chest"
• Exhale longer than inhale for calm
• Self-compassion phrases: "This is difficult; may I be kind to myself"
• Gratitude journaling: 3 specifics daily

**Emotional intelligence components:**
• **Self-awareness**: Recognizing emotions as they arise
• **Self-regulation**: Managing emotional responses constructively
• **Social awareness**: Understanding others' emotions
• **Relationship skills**: Building and maintaining healthy connections

**Emotional regulation techniques:**
• **RAIN method**: Recognize, Allow, Investigate, Nurture
• **Cognitive reframing**: Challenge negative thought patterns
• **Progressive muscle relaxation**: Release physical tension
• **Visualization**: Imagine peaceful scenes or successful outcomes

**Relationships:**
• Mindful listening and presence
• Repair skills: acknowledge, apologize, and align
• Co-regulation: safe connection reduces stress hormones

**Communication skills:**
• **Active listening**: Focus fully on speaker, reflect back
• **Non-violent communication**: Observations, feelings, needs, requests
• **Boundary setting**: Clear, respectful limits
• **Conflict resolution**: Address issues directly, seek win-win solutions

**Relationship building:**
• **Quality time**: Uninterrupted, focused attention
• **Physical affection**: Appropriate touch, hugs, hand-holding
• **Shared experiences**: Activities that create memories
• **Emotional support**: Being there during difficult times

**Purpose and values:**
• Clarify what matters
• Align weekly actions with values
• Contribute beyond self; meaning buffers stress

**Values clarification exercise:**
• **Core values**: What principles guide your decisions?
• **Life areas**: Career, relationships, health, spirituality, recreation
• **Alignment check**: Do your actions reflect your values?
• **Gap analysis**: Where are you living out of alignment?

**Purpose development:**
• **Strengths assessment**: What are you naturally good at?
• **Passion exploration**: What activities energize you?
• **Impact vision**: How do you want to contribute to others?
• **Action planning**: What steps move you toward your purpose?

**Stress resilience building:**
• **Growth mindset**: View challenges as opportunities to learn
• **Optimism**: Focus on what you can control and influence
• **Social support**: Build network of trusted relationships
• **Meaning-making**: Find purpose in difficult experiences`,
    pages: 10,
  },
  {
    id: 6,
    title: 'Putting It All Together',
    content: `**Weekly template:**
• Sleep: 7–9 hours, consistent timing
• Movement: 2–3 strength, 1–2 cardio, daily mobility
• Nutrition: protein-forward, colorful, mindful meals
• Stress: breathwork 5–10 minutes, daily nature exposure
• Relationships: scheduled connection time
• Learning: 2 sessions of focused study
• Reflection: weekly review and planning

**Daily rhythm examples:**
**Morning (6-9 AM)**: Wake naturally, sunlight exposure, movement, protein-rich breakfast
**Midday (12-2 PM)**: Balanced lunch, short walk, hydration check
**Afternoon (3-6 PM)**: Focus work, movement break, social connection
**Evening (7-10 PM)**: Light dinner, relaxation, preparation for sleep

**Habit stacking strategies:**
• **After morning coffee**: 5 minutes of stretching
• **Before meals**: 3 deep breaths and gratitude
• **After work**: 10-minute walk to transition
• **Before bed**: Journal 3 wins from the day

**Start small:**
• Choose 1–2 leverage habits
• Track for 2 weeks
• Iterate based on energy and mood

**Habit formation science:**
• **Cue**: Environmental trigger for the habit
• **Craving**: Motivation to perform the behavior
• **Response**: The actual habit behavior
• **Reward**: Positive outcome that reinforces the habit

**Progress tracking methods:**
• **Habit tracker**: Visual calendar or app
• **Energy journal**: Rate daily energy 1-10
• **Mood tracking**: Note emotional patterns
• **Symptom monitoring**: Track specific health markers

**Overcoming obstacles:**
• **Time constraints**: Start with 5-minute practices
• **Motivation dips**: Focus on identity ("I am someone who...")
• **Perfectionism**: Aim for consistency, not perfection
• **Social pressure**: Communicate boundaries clearly

**Long-term sustainability:**
• **Seasonal adjustments**: Adapt practices to changing circumstances
• **Life stage awareness**: Modify expectations during transitions
• **Community support**: Find like-minded people for accountability
• **Professional guidance**: Seek help when needed

**Holistic health** is a practice of alignment—subtle, sustainable steps that compound over time. Remember that **progress over perfection** and **consistency over intensity** are the keys to lasting change.`,
    pages: 10,
  },
];

export default function HolisticHealthWellness() {
  const router = useRouter();
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [lineSpacing, setLineSpacing] = useState(1.6);

  const WORDS_PER_PAGE = 150;
  const getChapterPages = (chapter: Chapter) => {
    const words = chapter.content.split(' ').length;
    return Math.max(1, Math.ceil(words / WORDS_PER_PAGE));
  };

  const totalPages = useMemo(() => chapters.reduce((s, ch) => s + getChapterPages(ch), 0), []);
  const currentChapterData = chapters[currentChapter];
  const currentChapterPages = getChapterPages(currentChapterData);

  const nextPage = () => {
    if (currentPage < currentChapterPages - 1) setCurrentPage(currentPage + 1);
    else if (currentChapter < chapters.length - 1) { setCurrentChapter(currentChapter + 1); setCurrentPage(0); }
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
    else if (currentChapter > 0) { const prev = getChapterPages(chapters[currentChapter - 1]); setCurrentChapter(currentChapter - 1); setCurrentPage(prev - 1); }
  };

  const getPageContent = () => {
    const words = currentChapterData.content.split(' ');
    const start = currentPage * WORDS_PER_PAGE;
    const end = start + WORDS_PER_PAGE;
    return words.slice(start, end).join(' ');
  };

  const renderHighlightedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((p, i) => p.startsWith('**') && p.endsWith('**')
      ? <Text key={i} style={[styles.highlightedText, { color: isDarkMode ? '#ffd700' : '#e74c3c' }]}>{p.slice(2, -2)}</Text>
      : <Text key={i}>{p}</Text>);
  };

  const increaseFontSize = () => { if (fontSize < 22) setFontSize(fontSize + 1); };
  const decreaseFontSize = () => { if (fontSize > 14) setFontSize(fontSize - 1); };
  const increaseLineSpacing = () => { if (lineSpacing < 2.2) setLineSpacing(lineSpacing + 0.1); };
  const decreaseLineSpacing = () => { if (lineSpacing > 1.2) setLineSpacing(lineSpacing - 0.1); };

  const completedPages = chapters.slice(0, currentChapter).reduce((s, ch) => s + getChapterPages(ch), 0) + currentPage + 1;

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' }]}> 
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? '#1a1a1a' : '#fff'} />

      <View style={[styles.header, { backgroundColor: isDarkMode ? '#2d2d2d' : '#fff', borderBottomColor: isDarkMode ? '#404040' : '#f0f0f0' }]}> 
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={isDarkMode ? '#fff' : '#23242b'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#23242b' }]}>Holistic Health & Wellness</Text>
        <TouchableOpacity style={styles.themeToggle} onPress={() => setIsDarkMode(!isDarkMode)}>
          <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={24} color={isDarkMode ? '#ffd700' : '#23242b'} />
        </TouchableOpacity>
      </View>

      <View style={[styles.readingControls, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f8f9fa', borderBottomColor: isDarkMode ? '#404040' : '#e9ecef' }]}> 
        <View style={styles.controlGroup}>
          <Text style={[styles.controlLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Font Size</Text>
          <View style={styles.controlButtons}>
            <TouchableOpacity style={[styles.controlButton, { backgroundColor: isDarkMode ? '#404040' : '#fff', borderColor: isDarkMode ? '#555' : '#e9ecef' }]} onPress={decreaseFontSize}>
              <Text style={[styles.controlButtonText, { color: isDarkMode ? '#fff' : '#23242b' }]}>A-</Text>
            </TouchableOpacity>
            <Text style={[styles.controlValue, { color: isDarkMode ? '#fff' : '#23242b' }]}>{fontSize}</Text>
            <TouchableOpacity style={[styles.controlButton, { backgroundColor: isDarkMode ? '#404040' : '#fff', borderColor: isDarkMode ? '#555' : '#e9ecef' }]} onPress={increaseFontSize}>
              <Text style={[styles.controlButtonText, { color: isDarkMode ? '#fff' : '#23242b' }]}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.controlGroup}>
          <Text style={[styles.controlLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Line Spacing</Text>
          <View style={styles.controlButtons}>
            <TouchableOpacity style={[styles.controlButton, { backgroundColor: isDarkMode ? '#404040' : '#fff', borderColor: isDarkMode ? '#555' : '#e9ecef' }]} onPress={decreaseLineSpacing}>
              <Text style={[styles.controlButtonText, { color: isDarkMode ? '#fff' : '#23242b' }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.controlValue, { color: isDarkMode ? '#fff' : '#23242b' }]}>{lineSpacing.toFixed(1)}</Text>
            <TouchableOpacity style={[styles.controlButton, { backgroundColor: isDarkMode ? '#404040' : '#fff', borderColor: isDarkMode ? '#555' : '#e9ecef' }]} onPress={increaseLineSpacing}>
              <Text style={[styles.controlButtonText, { color: isDarkMode ? '#fff' : '#23242b' }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={[styles.chapterNav, { backgroundColor: isDarkMode ? '#2d2d2d' : '#fff', borderBottomColor: isDarkMode ? '#404040' : '#f0f0f0' }]}> 
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {chapters.map((chapter, index) => (
            <TouchableOpacity key={chapter.id} style={[styles.chapterButton, { backgroundColor: isDarkMode ? '#404040' : '#f8f9fa', borderColor: isDarkMode ? '#555' : '#e9ecef' }, currentChapter === index && { backgroundColor: isDarkMode ? '#ffd700' : '#23242b', borderColor: isDarkMode ? '#ffd700' : '#23242b' }]} onPress={() => { setCurrentChapter(index); setCurrentPage(0); }}>
              <Text style={[styles.chapterText, { color: isDarkMode ? '#fff' : '#666' }, currentChapter === index && { color: isDarkMode ? '#1a1a1a' : '#fff' }]}>{chapter.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pageContainer}>
          <Text style={[styles.chapterTitle, { color: isDarkMode ? '#fff' : '#23242b' }]}>{chapters[currentChapter].title}</Text>
          <Text style={[styles.pageContent, { color: isDarkMode ? '#e0e0e0' : '#333', fontSize: fontSize, lineHeight: fontSize * lineSpacing }]}>
            {renderHighlightedText(getPageContent())}
          </Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: isDarkMode ? '#404040' : '#e9ecef' }]}>
              <View style={[styles.progressFill, { backgroundColor: isDarkMode ? '#ffd700' : '#23242b', width: `${((chapters.slice(0, currentChapter).reduce((s, ch) => s + getChapterPages(ch), 0) + currentPage + 1) / totalPages) * 100}%` }]} />
            </View>
            <Text style={[styles.progressText, { color: isDarkMode ? '#ccc' : '#666' }]}>{Math.round(((chapters.slice(0, currentChapter).reduce((s, ch) => s + getChapterPages(ch), 0) + currentPage + 1) / totalPages) * 100)}% Complete</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: isDarkMode ? '#2d2d2d' : '#fff', borderTopColor: isDarkMode ? '#404040' : '#f0f0f0' }]}> 
        <View style={styles.pageInfo}>
          <Text style={[styles.pageText, { color: isDarkMode ? '#ccc' : '#666' }]}>Page {currentPage + 1} of {currentChapterPages} • Chapter {currentChapter + 1} of {chapters.length}</Text>
        </View>
        <View style={styles.navigationButtons}>
          <TouchableOpacity style={[styles.navButton, { backgroundColor: isDarkMode ? '#404040' : '#f8f9fa', borderColor: isDarkMode ? '#555' : '#e9ecef' }, (currentChapter === 0 && currentPage === 0) && styles.navButtonDisabled]} onPress={prevPage} disabled={currentChapter === 0 && currentPage === 0}>
            <Feather name="chevron-left" size={20} color={isDarkMode ? '#fff' : '#23242b'} />
            <Text style={[styles.navButtonText, { color: isDarkMode ? '#fff' : '#23242b' }]}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navButton, { backgroundColor: isDarkMode ? '#404040' : '#f8f9fa', borderColor: isDarkMode ? '#555' : '#e9ecef' }, (currentChapter === chapters.length - 1 && currentPage === currentChapterPages - 1) && styles.navButtonDisabled]} onPress={nextPage} disabled={currentChapter === chapters.length - 1 && currentPage === currentChapterPages - 1}>
            <Text style={[styles.navButtonText, { color: isDarkMode ? '#fff' : '#23242b' }]}>Next</Text>
            <Feather name="chevron-right" size={20} color={isDarkMode ? '#fff' : '#23242b'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  backButton: { padding: 8, borderRadius: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
  themeToggle: { padding: 8, borderRadius: 8 },
  readingControls: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  controlGroup: { alignItems: 'center' },
  controlLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  controlButtons: { flexDirection: 'row', alignItems: 'center' },
  controlButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, marginHorizontal: 4 },
  controlButtonText: { fontSize: 14, fontWeight: '600' },
  controlValue: { fontSize: 14, fontWeight: '600', marginHorizontal: 8, minWidth: 20, textAlign: 'center' },
  chapterNav: { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  chapterButton: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 12, borderRadius: 20, borderWidth: 1 },
  chapterText: { fontSize: 12, fontWeight: '600' },
  content: { flex: 1 },
  pageContainer: { padding: 20 },
  chapterTitle: { fontSize: 24, fontWeight: '700', marginBottom: 20, lineHeight: 32, textAlign: 'center' },
  pageContent: { textAlign: 'justify', marginBottom: 20 },
  highlightedText: { fontWeight: '700' },
  progressContainer: { marginTop: 20, alignItems: 'center' },
  progressBar: { width: '100%', height: 6, borderRadius: 3, marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '500' },
  footer: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1 },
  pageInfo: { alignItems: 'center', marginBottom: 16 },
  pageText: { fontSize: 14, fontWeight: '500' },
  navigationButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  navButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, borderWidth: 1 },
  navButtonDisabled: { opacity: 0.5 },
  navButtonText: { fontSize: 14, fontWeight: '600', marginHorizontal: 8 },
});


