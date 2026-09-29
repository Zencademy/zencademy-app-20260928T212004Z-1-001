import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

type Chapter = { id: number; title: string; content: string; pages: number };

const chapters: Chapter[] = [
  {
    id: 1,
    title: 'The Mind–Body Link',
    content: `The **mind–body connection** describes how thoughts, emotions, beliefs, and attitudes can positively or negatively affect biological functioning, and how our physiology in turn influences mental states. Modern science confirms what many wisdom traditions taught: our bodies and minds form a **dynamic, bidirectional system**.

**Core pathways of interaction:**
• **Nervous system**: Brain–body signaling via autonomic pathways (sympathetic/parasympathetic)
• **Endocrine system**: Hormonal cascades (cortisol, adrenaline, oxytocin) that shape energy, mood, and immunity
• **Immune system**: Inflammation responds to stress, sleep, and nutrition
• **Microbiome**: Gut bacteria influence neurotransmitters (serotonin, GABA)

**Stress and the body:**
• **Acute stress** can sharpen focus and mobilize energy
• **Chronic stress** elevates cortisol, impairs sleep, and increases inflammation
• **Mindful downshifting** activates the parasympathetic "rest-and-digest" response

**Practical examples:**
When you feel anxious, your heart rate increases, palms sweat, and breathing becomes shallow. Conversely, when you practice deep breathing, your heart rate slows, muscles relax, and anxiety decreases. This demonstrates the **bidirectional feedback loop** between mind and body.

**Research insights:**
Studies show that **mindfulness meditation** can reduce inflammatory markers, improve immune function, and even change brain structure. The **placebo effect** demonstrates how beliefs can trigger real physiological changes, while **nocebo effects** show how negative expectations can worsen symptoms.

**Key insight**: By training attention and cultivating calm, you influence physiology—heart rate, breath, immunity—and by caring for sleep, movement, and nutrition, you stabilize mood and cognition.`,
    pages: 8,
  },
  {
    id: 2,
    title: 'Breath • Posture • Attention',
    content: `**Breath**: A direct lever to the nervous system. Slow, nasal, diaphragmatic breathing signals safety and steadiness to the body.

**Practice: Box Breathing (4–4–4–4)**
• Inhale 4
• Hold 4
• Exhale 4
• Hold 4
Repeat 1–3 minutes. Observe calm spreading through the body.

**Advanced breathing techniques:**
• **4-7-8 breathing**: Inhale 4, hold 7, exhale 8 (for sleep)
• **Alternate nostril breathing**: Balances left and right brain hemispheres
• **Coherent breathing**: 5-6 breaths per minute for optimal heart rate variability

**Posture**: Body position shapes mind. An upright, relaxed spine improves alertness, breath mechanics, and confidence.

**Micro-adjustments:**
• Crown gently lifts, chin slightly tucked
• Shoulders down and back
• Soft belly breathing
• Pelvis neutral, weight evenly distributed

**Posture throughout the day:**
• **Standing**: Feet hip-width, knees soft, spine elongated
• **Sitting**: Hips higher than knees, feet flat, back supported
• **Walking**: Head up, shoulders relaxed, natural arm swing

**Attention**: Where attention goes, energy flows. Train sustained, relaxed focus to balance arousal and clarity.

**Protocol (3 minutes):**
• 1 minute breath awareness
• 1 minute posture scan
• 1 minute open monitoring of sensations, sounds, and thoughts

**Attention training exercises:**
• **Single-point focus**: Choose one object (breath, candle, sound) and return to it when mind wanders
• **Open monitoring**: Observe thoughts and sensations without getting caught in them
• **Body scanning**: Move attention systematically through the body, noticing sensations`,
    pages: 8,
  },
  {
    id: 3,
    title: 'Somatic Awareness Toolkit',
    content: `**Somatic practices** reconnect mind with body signals, improving interoception (inner sensing) and emotional regulation.

**1) Body Scan (5–10 minutes)**
• Lie or sit comfortably
• Move attention slowly from toes to head
• Label sensations neutrally: warm, cool, pressure, tingling
• If emotions arise, acknowledge kindly and return to sensing

**Progressive body scan variations:**
• **Top-down**: Start at head, work down to feet
• **Center-out**: Begin at core, expand to extremities
• **Energy centers**: Focus on chakras or energy points
• **Micro-scan**: Spend 30 seconds on each body part

**2) Grounding**
• Feel feet on the floor
• Press palms together lightly
• Name 3 things you can see, hear, feel

**Advanced grounding techniques:**
• **5-4-3-2-1 method**: 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste
• **Root lock**: Engage pelvic floor muscles, feel connection to earth
• **Tree visualization**: Imagine roots growing from your feet into the ground

**3) Progressive relaxation**
• Gently tense each muscle group for 5 seconds
• Release for 10–15 seconds
• Notice contrast between tension and ease

**Muscle groups to target:**
• Face and jaw
• Neck and shoulders
• Arms and hands
• Chest and back
• Abdomen
• Legs and feet

**4) Micro-movements during the day**
• Shoulder rolls, neck arcs, hip circles
• 60 seconds per hour to refresh circulation and attention

**Movement sequences:**
• **Desk stretches**: Wrist circles, ankle pumps, shoulder shrugs
• **Standing breaks**: Gentle twists, side bends, forward folds
• **Walking variations**: Heel-to-toe, side steps, backward walking`,
    pages: 10,
  },
  {
    id: 4,
    title: 'Lifestyle Levers',
    content: `**Sleep**: Foundational. 7–9 hours supports learning, mood, and recovery. Create a wind-down ritual, dim lights, and avoid screens late.

**Sleep optimization checklist:**
• **Environment**: Cool (65-68°F), dark, quiet room
• **Routine**: Consistent bedtime and wake time
• **Pre-sleep**: 1 hour screen-free, gentle activities
• **Nutrition**: Avoid large meals, caffeine, alcohol 3 hours before bed
• **Movement**: Exercise earlier in day, gentle stretching before bed

**Nutrition**: Favor whole foods and stable blood sugar. Include protein, fiber, colorful plants, and omega-3s. Hydration matters for cognition.

**Nutritional timing:**
• **Breakfast**: Protein + complex carbs within 1 hour of waking
• **Lunch**: Balanced meal with protein, healthy fats, vegetables
• **Dinner**: Lighter meal, avoid heavy foods close to bedtime
• **Snacks**: Nuts, fruit, or protein between meals if needed

**Movement**: Mix steady activity (walks) with strength and mobility. Even 10-minute bouts improve energy and stress resilience.

**Movement pyramid:**
• **Base**: Daily walking (aim for 8,000-10,000 steps)
• **Middle**: Strength training 2-3x/week, cardio 2-3x/week
• **Top**: High-intensity intervals 1-2x/week
• **Foundation**: Daily mobility and flexibility work

**Sunlight & nature**: Morning light anchors circadian rhythm; nature exposure reduces rumination and supports creativity.

**Nature connection practices:**
• **Morning sunlight**: 10-30 minutes within 1 hour of waking
• **Green exercise**: Walk, run, or exercise outdoors
• **Forest bathing**: Slow, mindful walks in natural settings
• **Garden therapy**: Tending plants, even small indoor gardens

**Social connection**: Co-regulation through safe relationships calms the nervous system. Practice mindful listening and empathy.

**Connection practices:**
• **Quality time**: Uninterrupted conversations, shared activities
• **Physical touch**: Hugs, hand-holding, appropriate physical contact
• **Shared experiences**: Meals, walks, creative activities together
• **Emotional support**: Active listening, validation, encouragement

**Digital hygiene**: Batch notifications, schedule focus blocks, and take screen breaks to protect attention and sleep.

**Digital boundaries:**
• **Notification management**: Turn off non-essential alerts
• **Screen-free zones**: Bedroom, meals, conversations
• **Focus blocks**: 25-90 minute work sessions with breaks
• **Digital sunset**: Stop screen use 1 hour before bed`,
    pages: 12,
  },
  {
    id: 5,
    title: 'Integrating Mind–Body Daily',
    content: `**Morning (5–10 min)**
• 2 min breath + posture
• 2 min intention: "How do I want to show up?"
• 1–3 min mobility

**Morning routine variations:**
• **Gentle wake-up**: Stretch in bed, deep breathing, gratitude
• **Movement first**: Light yoga, walking, or gentle exercise
• **Mindful preparation**: Conscious showering, dressing, breakfast
• **Intention setting**: Write down 3 priorities for the day

**Midday (2–5 min)**
• Body scan or box breathing
• Short outdoor walk or stretch

**Midday reset options:**
• **Breath break**: 3 rounds of 4-7-8 breathing
• **Movement snack**: 2-minute walk, stretch, or dance
• **Nature connection**: Step outside, feel sun/wind, notice surroundings
• **Hydration check**: Drink water, take a moment to pause

**Evening (5–10 min)**
• Gentle stretching, journal 3 gratitudes
• Digital sunset 60 minutes before bed

**Evening wind-down:**
• **Reflection**: Review the day, acknowledge accomplishments
• **Preparation**: Plan tomorrow's priorities
• **Relaxation**: Reading, gentle music, warm bath
• **Gratitude**: Write or think of 3 things you're thankful for

**When stressed**
• Lengthen exhale
• Feel feet on ground, name sensations
• Choose one helpful next step

**Stress response toolkit:**
• **Immediate**: 3 deep breaths, feel feet on ground
• **Short-term**: 5-minute walk, stretch, or movement
• **Medium-term**: 20-minute nature walk or meditation
• **Long-term**: Address root causes, build resilience practices

**Weekly integration:**
• **Sunday planning**: Review week ahead, set intentions
• **Wednesday check-in**: Assess energy, adjust as needed
• **Friday reflection**: Review week, celebrate wins, plan recovery
• **Weekend restoration**: Rest, play, connection, nature time

**Key principle**: Small, consistent practices beat occasional intensity. Build reliable habits that keep mind and body in dialogue.`,
    pages: 10,
  },
];

export default function MindBodyConnection() {
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
    if (currentPage < currentChapterPages - 1) {
      setCurrentPage(currentPage + 1);
    } else if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      setCurrentPage(0);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (currentChapter > 0) {
      const prevPages = getChapterPages(chapters[currentChapter - 1]);
      setCurrentChapter(currentChapter - 1);
      setCurrentPage(prevPages - 1);
    }
  };

  const getPageContent = () => {
    const words = currentChapterData.content.split(' ');
    const start = currentPage * WORDS_PER_PAGE;
    const end = start + WORDS_PER_PAGE;
    return words.slice(start, end).join(' ');
  };

  const renderHighlightedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const inner = part.slice(2, -2);
        return <Text key={idx} style={[styles.highlightedText, { color: isDarkMode ? '#ffd700' : '#e74c3c' }]}>{inner}</Text>;
      }
      return <Text key={idx}>{part}</Text>;
    });
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
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#23242b' }]}>Mind–Body Connection</Text>
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
            <TouchableOpacity
              key={chapter.id}
              style={[styles.chapterButton, { backgroundColor: isDarkMode ? '#404040' : '#f8f9fa', borderColor: isDarkMode ? '#555' : '#e9ecef' }, currentChapter === index && { backgroundColor: isDarkMode ? '#ffd700' : '#23242b', borderColor: isDarkMode ? '#ffd700' : '#23242b' }]}
              onPress={() => { setCurrentChapter(index); setCurrentPage(0); }}
            >
              <Text style={[styles.chapterText, { color: isDarkMode ? '#fff' : '#666' }, currentChapter === index && { color: isDarkMode ? '#1a1a1a' : '#fff' }]}>
                {chapter.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pageContainer}>
          <Text style={[styles.chapterTitle, { color: isDarkMode ? '#fff' : '#23242b' }]}>{currentChapterData.title}</Text>
          <Text style={[styles.pageContent, { color: isDarkMode ? '#e0e0e0' : '#333', fontSize: fontSize, lineHeight: fontSize * lineSpacing }]}>
            {renderHighlightedText(getPageContent())}
          </Text>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: isDarkMode ? '#404040' : '#e9ecef' }]}>
              <View style={[styles.progressFill, { backgroundColor: isDarkMode ? '#ffd700' : '#23242b', width: `${(completedPages / totalPages) * 100}%` }]} />
            </View>
            <Text style={[styles.progressText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              {Math.round((completedPages / totalPages) * 100)}% Complete
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: isDarkMode ? '#2d2d2d' : '#fff', borderTopColor: isDarkMode ? '#404040' : '#f0f0f0' }]}> 
        <View style={styles.pageInfo}>
          <Text style={[styles.pageText, { color: isDarkMode ? '#ccc' : '#666' }]}>Page {currentPage + 1} of {currentChapterPages} • Chapter {currentChapter + 1} of {chapters.length}</Text>
        </View>
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: isDarkMode ? '#404040' : '#f8f9fa', borderColor: isDarkMode ? '#555' : '#e9ecef' }, (currentChapter === 0 && currentPage === 0) && styles.navButtonDisabled]}
            onPress={prevPage}
            disabled={currentChapter === 0 && currentPage === 0}
          >
            <Feather name="chevron-left" size={20} color={isDarkMode ? '#fff' : '#23242b'} />
            <Text style={[styles.navButtonText, { color: isDarkMode ? '#fff' : '#23242b' }]}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: isDarkMode ? '#404040' : '#f8f9fa', borderColor: isDarkMode ? '#555' : '#e9ecef' }, (currentChapter === chapters.length - 1 && currentPage === currentChapterPages - 1) && styles.navButtonDisabled]}
            onPress={nextPage}
            disabled={currentChapter === chapters.length - 1 && currentPage === currentChapterPages - 1}
          >
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


