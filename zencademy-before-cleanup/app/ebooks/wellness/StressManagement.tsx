import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const chapters = [
  {
    id: 1,
    title: "Understanding Stress",
    content: `**Stress** is your body's natural response to challenges and demands. While some stress can be **motivating and beneficial**, chronic stress can have serious negative effects on your physical and mental health.

**What is Stress?**
Stress is your body's way of responding to any kind of demand or threat. When you sense danger—whether it's real or imagined—your body's defenses kick into high gear in a rapid, automatic process known as the **"fight-or-flight" reaction**.

**Types of Stress:**
• **Acute Stress**: Short-term stress that goes away quickly
• **Chronic Stress**: Long-term stress that continues for weeks or months
• **Eustress**: Positive stress that motivates and energizes you
• **Distress**: Negative stress that causes anxiety and worry

**Common Stress Triggers:**
• **Work pressure** and deadlines
• **Financial concerns** and money problems
• **Relationship issues** and conflicts
• **Health problems** and medical concerns
• **Major life changes** like moving or job loss
• **Daily hassles** like traffic or technology problems

**Physical Symptoms of Stress:**
• **Headaches and muscle tension**
• **Fatigue and sleep problems**
• **Digestive issues** and appetite changes
• **Rapid heartbeat** and chest pain
• **Weakened immune system**

**Mental Symptoms of Stress:**
• **Anxiety and worry**
• **Irritability and mood swings**
• **Difficulty concentrating**
• **Memory problems**
• **Depression and low mood**

**Important:** Understanding your stress triggers and symptoms is the first step toward effective stress management.`,
    pages: 4
  },
  {
    id: 2,
    title: "The Science of Stress",
    content: `Modern research has revealed **fascinating insights** into how stress affects our bodies and minds at the cellular level.

**The Stress Response System:**
When you encounter a stressor, your body activates the **hypothalamic-pituitary-adrenal (HPA) axis**:
• **Hypothalamus** releases corticotropin-releasing hormone (CRH)
• **Pituitary gland** releases adrenocorticotropic hormone (ACTH)
• **Adrenal glands** release cortisol and adrenaline

**Cortisol: The Stress Hormone**
Cortisol plays a crucial role in stress response:
• **Increases blood sugar** for immediate energy
• **Suppresses immune function** to conserve energy
• **Affects memory formation** and emotional processing
• **Regulates metabolism** and blood pressure

**Chronic Stress Effects:**
**Brain Changes:**
• **Reduced hippocampus volume** (memory center)
• **Increased amygdala activity** (fear center)
• **Impaired prefrontal cortex function** (decision-making)
• **Altered neurotransmitter levels**

**Body Changes:**
• **Elevated blood pressure** and heart rate
• **Increased inflammation** throughout the body
• **Weakened immune system** response
• **Digestive system dysfunction**
• **Accelerated aging** at cellular level

**Psychological Effects:**
• **Anxiety disorders** and panic attacks
• **Depression** and mood disorders
• **Cognitive decline** and memory problems
• **Sleep disorders** and insomnia
• **Addiction** and substance abuse

**Research Insight:** Studies show that **chronic stress can shorten telomeres** (protective caps on chromosomes), which is associated with accelerated aging and increased disease risk.`,
    pages: 5
  },
  {
    id: 3,
    title: "Stress Management Techniques",
    content: `Here are **proven techniques** for managing stress effectively:

**1. Deep Breathing Exercises**
**Diaphragmatic Breathing:**
• Sit or lie in a comfortable position
• Place one hand on your chest, one on your abdomen
• **Breathe in slowly through your nose** for 4 counts
• **Hold your breath** for 4 counts
• **Exhale slowly through your mouth** for 6 counts
• **Repeat for 5-10 minutes daily**

**2. Progressive Muscle Relaxation**
A systematic approach to releasing tension:
• Start with your toes and work up to your head
• **Tense each muscle group** for 5 seconds
• **Release and relax** for 10 seconds
• **Notice the difference** between tension and relaxation
• Practice for **10-15 minutes daily**

**3. Mindfulness Meditation**
**Basic Mindfulness Practice:**
• Find a quiet, comfortable space
• **Focus on your breath** or a specific object
• **Observe thoughts** without judgment
• **Return to focus** when mind wanders
• Start with **5-10 minutes**, gradually increase

**4. Physical Exercise**
**Stress-Relieving Activities:**
• **Aerobic exercise** (walking, running, cycling)
• **Yoga and stretching** for flexibility
• **Strength training** for confidence
• **Dance or martial arts** for fun
• **Aim for 30 minutes daily**

**5. Time Management**
**Effective Planning:**
• **Prioritize tasks** using importance/urgency matrix
• **Break large projects** into smaller steps
• **Set realistic deadlines** and expectations
• **Learn to say no** to non-essential commitments
• **Schedule breaks** and relaxation time

**6. Social Support**
**Building Connections:**
• **Talk to trusted friends** and family
• **Join support groups** or communities
• **Seek professional help** when needed
• **Practice active listening** with others
• **Express gratitude** regularly

**7. Healthy Lifestyle Habits**
**Daily Practices:**
• **Get 7-9 hours** of quality sleep
• **Eat a balanced diet** with stress-reducing foods
• **Limit caffeine** and alcohol intake
• **Stay hydrated** throughout the day
• **Practice good sleep hygiene**

**Remember:** Different techniques work for different people. **Experiment to find what works best for you** and practice regularly for maximum benefit.`,
    pages: 6
  },
  {
    id: 4,
    title: "Cognitive Behavioral Techniques",
    content: `**Cognitive Behavioral Therapy (CBT)** techniques can help you **identify and change** stress-inducing thought patterns.

**Understanding Cognitive Distortions:**
These are **irrational thought patterns** that contribute to stress:

**1. All-or-Nothing Thinking**
**Example:** "If I don't get this perfect, I'm a complete failure."
**Reality:** Most situations have **shades of gray**, not just black and white.

**2. Catastrophizing**
**Example:** "If I make a mistake, I'll lose my job and end up homeless."
**Reality:** **Most problems have solutions** and aren't as dire as they seem.

**3. Overgeneralization**
**Example:** "I always mess up everything I try."
**Reality:** **One failure doesn't define** your entire life or abilities.

**4. Mental Filtering**
**Example:** Focusing only on negative feedback, ignoring positive comments.
**Reality:** **Consider the full picture**, including successes and positive feedback.

**5. Should Statements**
**Example:** "I should be able to handle this without stress."
**Reality:** **It's normal to feel stressed** in challenging situations.

**CBT Techniques for Stress Management:**

**1. Thought Challenging**
**Process:**
• **Identify** the stressful thought
• **Examine evidence** for and against it
• **Consider alternative perspectives**
• **Develop a more balanced view**
• **Practice the new thought pattern**

**2. Reframing**
**Technique:**
• **Recognize negative framing**
• **Look for positive aspects** or opportunities
• **Consider what you can learn** from the situation
• **Focus on what you can control**

**3. Problem-Solving Approach**
**Steps:**
• **Define the problem** clearly and specifically
• **Brainstorm possible solutions** without judgment
• **Evaluate each option** for pros and cons
• **Choose the best approach** and implement it
• **Review results** and adjust if needed

**4. Stress Inoculation Training**
**Process:**
• **Prepare** for stressful situations
• **Practice** coping techniques
• **Apply** skills in real situations
• **Review** and refine your approach

**5. Self-Compassion**
**Practice:**
• **Treat yourself** as you would a good friend
• **Acknowledge** that suffering is part of being human
• **Practice mindfulness** without judgment
• **Develop self-kindness** and understanding

**Daily CBT Exercises:**
• **Keep a thought journal** to track patterns
• **Practice gratitude** for positive aspects
• **Use positive affirmations** regularly
• **Challenge negative thoughts** as they arise
• **Celebrate small victories** and progress

**Remember:** **Changing thought patterns takes time and practice**. Be patient with yourself and celebrate your progress.`,
    pages: 5
  },
  {
    id: 5,
    title: "Lifestyle Changes for Stress Reduction",
    content: `**Sustainable lifestyle changes** can significantly reduce stress levels and improve overall well-being.

**Sleep Optimization:**
**Quality Sleep Practices:**
• **Maintain consistent sleep schedule** (same bedtime/wake time)
• **Create a relaxing bedtime routine** (reading, meditation, warm bath)
• **Optimize sleep environment** (cool, dark, quiet room)
• **Limit screen time** 1-2 hours before bed
• **Avoid caffeine** after 2 PM
• **Exercise regularly** but not close to bedtime

**Nutrition for Stress Management:**
**Stress-Reducing Foods:**
• **Complex carbohydrates** (whole grains, fruits, vegetables)
• **Omega-3 fatty acids** (fish, nuts, seeds)
• **B vitamins** (leafy greens, legumes, eggs)
• **Magnesium** (dark chocolate, nuts, avocados)
• **Antioxidants** (berries, colorful vegetables)

**Foods to Limit:**
• **Excess caffeine** and energy drinks
• **Refined sugars** and processed foods
• **Alcohol** (can disrupt sleep and mood)
• **Excessive salt** (affects blood pressure)

**Physical Activity Guidelines:**
**Exercise Recommendations:**
• **150 minutes** of moderate exercise weekly
• **75 minutes** of vigorous exercise weekly
• **Strength training** 2-3 times per week
• **Flexibility exercises** daily
• **Find activities you enjoy** for consistency

**Stress-Relieving Activities:**
• **Walking in nature** (forest bathing)
• **Swimming** or water activities
• **Dancing** or movement classes
• **Gardening** or outdoor activities
• **Team sports** for social connection

**Work-Life Balance:**
**Setting Boundaries:**
• **Define clear work hours** and stick to them
• **Take regular breaks** throughout the day
• **Separate work and personal spaces**
• **Learn to delegate** tasks when possible
• **Practice saying no** to excessive demands

**Time Management Strategies:**
• **Use time-blocking** for important tasks
• **Eliminate time-wasters** and distractions
• **Batch similar tasks** together
• **Set realistic expectations** for yourself
• **Schedule downtime** and relaxation

**Social Connection:**
**Building Support Networks:**
• **Maintain regular contact** with friends and family
• **Join clubs** or groups with shared interests
• **Volunteer** in your community
• **Seek professional support** when needed
• **Practice active listening** and empathy

**Digital Wellness:**
**Technology Boundaries:**
• **Set screen time limits** for social media
• **Take regular digital detoxes**
• **Use technology intentionally** rather than habitually
• **Create tech-free zones** (bedroom, meals)
• **Practice mindful technology use**

**Environmental Factors:**
**Creating Calm Spaces:**
• **Declutter** your living and work spaces
• **Add plants** for natural stress relief
• **Use calming colors** and lighting
• **Reduce noise pollution** when possible
• **Create designated relaxation areas**

**Remember:** **Small changes add up over time**. Focus on **one area at a time** and build sustainable habits gradually.`,
    pages: 6
  },
  {
    id: 6,
    title: "Advanced Stress Management",
    content: `For those dealing with **chronic or severe stress**, these advanced techniques can provide additional support.

**Biofeedback Techniques:**
**Understanding Your Body's Signals:**
• **Heart rate variability** monitoring
• **Muscle tension** awareness
• **Skin temperature** changes
• **Breathing patterns** analysis
• **Brain wave** activity tracking

**Biofeedback Training:**
• **Learn to recognize** stress signals early
• **Practice control** over physiological responses
• **Use technology** to monitor progress
• **Develop self-regulation** skills
• **Apply techniques** in real situations

**Advanced Relaxation Methods:**
**Autogenic Training:**
• **Progressive relaxation** through self-suggestion
• **Focus on warmth** and heaviness in limbs
• **Practice regularly** for best results
• **Combine with breathing** exercises
• **Use for deep relaxation** and stress relief

**Visualization Techniques:**
**Guided Imagery:**
• **Create mental images** of peaceful places
• **Engage all senses** in the visualization
• **Practice regularly** to strengthen the skill
• **Use for quick stress relief** anywhere
• **Combine with breathing** for enhanced effect

**Mindfulness-Based Stress Reduction (MBSR):**
**Core Practices:**
• **Body scan meditation** for awareness
• **Sitting meditation** for focus
• **Walking meditation** for movement
• **Loving-kindness meditation** for compassion
• **Mindful eating** for presence

**Professional Support Options:**
**When to Seek Help:**
• **Persistent stress** despite self-help efforts
• **Physical symptoms** that don't improve
• **Mental health concerns** (anxiety, depression)
• **Relationship problems** related to stress
• **Work performance** significantly affected

**Types of Professional Help:**
• **Individual therapy** (CBT, DBT, psychodynamic)
• **Group therapy** for shared experiences
• **Stress management** workshops
• **Medical evaluation** for physical symptoms
• **Medication** when appropriate

**Crisis Management:**
**Handling Acute Stress:**
• **Recognize warning signs** early
• **Use immediate coping** techniques
• **Reach out for support** when needed
• **Practice self-care** during difficult times
• **Seek professional help** if overwhelmed

**Long-Term Stress Prevention:**
**Building Resilience:**
• **Develop healthy coping** mechanisms
• **Build strong support** networks
• **Maintain physical health** through exercise
• **Practice regular** stress management
• **Cultivate positive** mindset and gratitude

**Stress and Life Transitions:**
**Managing Change:**
• **Anticipate stress** during major changes
• **Prepare coping strategies** in advance
• **Seek support** during transitions
• **Practice self-compassion** during adjustment
• **Celebrate progress** and growth

**Remember:** **Professional help is a sign of strength**, not weakness. **Don't hesitate to seek support** when stress becomes overwhelming or persistent.`,
    pages: 4
  }
];

export default function StressManagement() {
  const router = useRouter();
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [lineSpacing, setLineSpacing] = useState(1.6);

  const WORDS_PER_PAGE = 150;
  const getChapterPages = (chapter: { content: string; pages: number }) => {
    const words = chapter.content.split(' ').length;
    return Math.max(1, Math.ceil(words / WORDS_PER_PAGE));
  };

  const totalPages = useMemo(() => chapters.reduce((sum, chapter) => sum + getChapterPages(chapter), 0), []);
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
    const content = currentChapterData.content;
    const words = content.split(' ');
    const startIndex = currentPage * WORDS_PER_PAGE;
    const endIndex = startIndex + WORDS_PER_PAGE;
    return words.slice(startIndex, endIndex).join(' ');
  };

  const renderHighlightedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const highlightedText = part.slice(2, -2);
        return (
          <Text key={index} style={[styles.highlightedText, { color: isDarkMode ? '#ffd700' : '#e74c3c' }]}>
            {highlightedText}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  const increaseFontSize = () => {
    if (fontSize < 22) setFontSize(fontSize + 1);
  };

  const decreaseFontSize = () => {
    if (fontSize > 14) setFontSize(fontSize - 1);
  };

  const increaseLineSpacing = () => {
    if (lineSpacing < 2.2) setLineSpacing(lineSpacing + 0.1);
  };

  const decreaseLineSpacing = () => {
    if (lineSpacing > 1.2) setLineSpacing(lineSpacing - 0.1);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? '#1a1a1a' : '#fff'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#2d2d2d' : '#fff', borderBottomColor: isDarkMode ? '#404040' : '#f0f0f0' }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color={isDarkMode ? '#fff' : '#23242b'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#23242b' }]}>Stress Management</Text>
        <TouchableOpacity
          style={styles.themeToggle}
          onPress={() => setIsDarkMode(!isDarkMode)}
        >
          <Ionicons 
            name={isDarkMode ? 'sunny' : 'moon'} 
            size={24} 
            color={isDarkMode ? '#ffd700' : '#23242b'} 
          />
        </TouchableOpacity>
      </View>

      {/* Reading Controls */}
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

      {/* Chapter Navigation */}
      <View style={[styles.chapterNav, { backgroundColor: isDarkMode ? '#2d2d2d' : '#fff', borderBottomColor: isDarkMode ? '#404040' : '#f0f0f0' }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {chapters.map((chapter, index) => (
            <TouchableOpacity
              key={chapter.id}
              style={[
                styles.chapterButton,
                { backgroundColor: isDarkMode ? '#404040' : '#f8f9fa', borderColor: isDarkMode ? '#555' : '#e9ecef' },
                currentChapter === index && { backgroundColor: isDarkMode ? '#ffd700' : '#23242b', borderColor: isDarkMode ? '#ffd700' : '#23242b' }
              ]}
              onPress={() => {
                setCurrentChapter(index);
                setCurrentPage(0);
              }}
            >
              <Text style={[
                styles.chapterText,
                { color: isDarkMode ? '#fff' : '#666' },
                currentChapter === index && { color: isDarkMode ? '#1a1a1a' : '#fff' }
              ]}>
                {chapter.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pageContainer}>
          <Text style={[styles.chapterTitle, { color: isDarkMode ? '#fff' : '#23242b' }]}>{currentChapterData.title}</Text>
          <Text style={[
            styles.pageContent, 
            { 
              color: isDarkMode ? '#e0e0e0' : '#333',
              fontSize: fontSize,
              lineHeight: fontSize * lineSpacing
            }
          ]}>
            {renderHighlightedText(getPageContent())}
          </Text>
          
          {/* Reading Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: isDarkMode ? '#404040' : '#e9ecef' }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: isDarkMode ? '#ffd700' : '#23242b',
                    width: `${((chapters.slice(0, currentChapter).reduce((s, ch) => s + getChapterPages(ch), 0) + currentPage + 1) / totalPages) * 100}%`
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              {Math.round(((chapters.slice(0, currentChapter).reduce((s, ch) => s + getChapterPages(ch), 0) + currentPage + 1) / totalPages) * 100)}% Complete
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Navigation Footer */}
      <View style={[styles.footer, { backgroundColor: isDarkMode ? '#2d2d2d' : '#fff', borderTopColor: isDarkMode ? '#404040' : '#f0f0f0' }]}>
        <View style={styles.pageInfo}>
          <Text style={[styles.pageText, { color: isDarkMode ? '#ccc' : '#666' }]}>
            Page {currentPage + 1} of {currentChapterPages} • Chapter {currentChapter + 1} of {chapters.length}
          </Text>
        </View>
        
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[
              styles.navButton,
              { backgroundColor: isDarkMode ? '#404040' : '#f8f9fa', borderColor: isDarkMode ? '#555' : '#e9ecef' },
              (currentChapter === 0 && currentPage === 0) && styles.navButtonDisabled
            ]}
            onPress={prevPage}
            disabled={currentChapter === 0 && currentPage === 0}
          >
            <Feather name="chevron-left" size={20} color={isDarkMode ? '#fff' : '#23242b'} />
            <Text style={[styles.navButtonText, { color: isDarkMode ? '#fff' : '#23242b' }]}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              { backgroundColor: isDarkMode ? '#404040' : '#f8f9fa', borderColor: isDarkMode ? '#555' : '#e9ecef' },
              (currentChapter === chapters.length - 1 && currentPage === currentChapterPages - 1) && styles.navButtonDisabled
            ]}
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  themeToggle: {
    padding: 8,
    borderRadius: 8,
  },
  readingControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  controlGroup: {
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  controlValue: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  chapterNav: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  chapterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  chapterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  pageContainer: {
    padding: 20,
  },
  chapterTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    lineHeight: 32,
  },
  pageContent: {
    textAlign: 'justify',
    marginBottom: 20,
  },
  highlightedText: {
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  pageInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pageText: {
    fontSize: 14,
    fontWeight: '500',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 8,
  },
});
