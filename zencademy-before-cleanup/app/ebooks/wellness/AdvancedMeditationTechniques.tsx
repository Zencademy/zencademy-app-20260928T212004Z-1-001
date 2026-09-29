import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const chapters = [
  {
    id: 1,
    title: "Beyond Basic Meditation",
    content: `**Advanced meditation techniques** build upon the foundation of basic mindfulness practices. These techniques are designed for practitioners who have established a regular meditation practice and are ready to explore **deeper states of consciousness** and awareness.

**What Makes a Technique "Advanced"?**
Advanced meditation techniques typically involve:
• **Longer practice sessions** (30+ minutes)
• **More complex concentration methods** and focus techniques
• **Deeper exploration of consciousness** and awareness states
• **Integration of multiple techniques** and approaches
• **Advanced visualization practices** and mental imagery
• **Energy work and subtle body awareness** (chakras, meridians)

**Prerequisites for Advanced Practice:**
• **Consistent daily meditation practice** (6+ months minimum)
• **Ability to maintain focus** for extended periods without distraction
• **Understanding of basic meditation principles** and techniques
• **Stable emotional and mental state** - not during crisis periods
• **Guidance from experienced teachers** or mentors
• **Proper motivation** - seeking growth, not escape

**The Journey to Advanced Practice:**
**Foundation Building:**
• **Establish daily practice** - Start with 10-15 minutes daily
• **Develop concentration** - Practice focused attention meditation
• **Build mindfulness** - Cultivate present-moment awareness
• **Study theory** - Understand the principles behind advanced techniques
• **Find community** - Connect with other practitioners

**Gradual Progression:**
• **Increase session length** - Gradually extend practice time
• **Explore different techniques** - Try various meditation styles
• **Attend retreats** - Immersive practice experiences
• **Work with teachers** - Receive personalized guidance
• **Integrate practice** - Apply insights to daily life

**Common Advanced Techniques:**
**Concentration Techniques:**
• **Kasina meditation** - Focusing on visual objects
• **Mantra meditation** - Repetition of sacred sounds
• **Breath counting** - Advanced breath awareness
• **Chakra meditation** - Energy center focus
• **Visualization practices** - Mental imagery and symbols

**Insight Techniques:**
• **Vipassana** - Insight into impermanence and suffering
• **Zen meditation** - Direct experience of reality
• **Self-inquiry** - "Who am I?" contemplation
• **Analytical meditation** - Systematic investigation
• **Contemplation** - Deep reflection on teachings

**Important:** **Advanced techniques should be approached with patience, respect, and proper guidance.** Rushing into advanced practices without a solid foundation can be counterproductive and potentially harmful. **Trust the process** and allow your practice to develop naturally.`,
    pages: 6
  },
  {
    id: 2,
    title: "Vipassana Meditation",
    content: `**Vipassana**, meaning "insight" or "clear seeing," is one of the most **profound meditation techniques** in the Buddhist tradition. It focuses on developing insight into the true nature of reality through systematic observation of mind and body.

**Core Principles (The Three Marks of Existence):**
**Anicca (Impermanence):**
• **Everything changes** - Nothing remains the same
• **Observe the flow** - Notice how sensations arise and pass
• **Accept impermanence** - Understand that change is natural
• **Reduce attachment** - Let go of clinging to what changes

**Dukkha (Suffering/Unsatisfactoriness):**
• **All conditioned phenomena are unsatisfactory** - Nothing brings lasting happiness
• **Recognize suffering** - See how we create our own suffering
• **Understand craving** - Notice desire and aversion
• **Find freedom** - Liberation from suffering through insight

**Anatta (No-self):**
• **There is no permanent, unchanging self** - Self is a process, not a thing
• **Observe the self** - See how the sense of self arises and changes
• **Let go of identification** - Don't cling to any aspect as "me"
• **Experience freedom** - Liberation from self-centeredness

**The Practice Method:**
**1. Body Scanning:**
• **Systematically observe sensations** throughout the body
• **Start with the top of the head** and work down to the feet
• **Notice all sensations** - pleasant, unpleasant, or neutral
• **Don't react** - Just observe with equanimity
• **Be thorough** - Cover every part of the body

**2. Breath Awareness:**
• **Focus on the natural breath** as an anchor
• **Observe the breath** without trying to change it
• **Notice the sensations** of breathing
• **Return to breath** when mind wanders
• **Use breath as refuge** during difficult experiences

**3. Sensation Observation:**
• **Notice all physical sensations** without reaction
• **Observe the arising and passing** of sensations
• **Don't cling to pleasant sensations** or avoid unpleasant ones
• **Maintain equanimity** regardless of what you experience
• **See sensations as impermanent** and changing

**4. Mental Observation:**
• **Watch thoughts and emotions** arise and pass
• **Don't get involved** in the content of thoughts
• **Observe the process** of thinking itself
• **Notice mental states** - calm, agitated, focused, distracted
• **See thoughts as impermanent** and not-self

**5. Equanimity Development:**
• **Maintain balanced awareness** regardless of experience
• **Don't prefer pleasant experiences** or avoid unpleasant ones
• **Accept everything** that arises in awareness
• **Develop patience** and tolerance for all experiences
• **Cultivate wisdom** through direct observation

**Advanced Vipassana Techniques:**
**Noting Practice:**
• **Label experiences** as they arise: "thinking," "feeling," "hearing"
• **Keep labels simple** and consistent
• **Don't analyze** - just note and let go
• **Develop precision** in observation
• **Increase awareness** of subtle experiences

**Choiceless Awareness:**
• **Open awareness** to whatever arises
• **Don't focus on anything specific** - just be aware
• **Notice the flow** of experience
• **Observe the observer** - see who is aware
• **Experience pure awareness** beyond objects

**Benefits of Vipassana:**
**Psychological Benefits:**
• **Deep insight** into the nature of reality
• **Reduced attachment** and aversion
• **Increased equanimity** and peace
• **Better understanding** of suffering
• **Enhanced self-awareness** and clarity
• **Improved emotional regulation**

**Spiritual Benefits:**
• **Direct experience** of impermanence
• **Understanding of suffering** and its causes
• **Development of wisdom** and insight
• **Cultivation of compassion** and understanding
• **Progress toward liberation** and freedom
• **Deepening of spiritual practice**

**Practical Benefits:**
• **Better stress management** and resilience
• **Improved relationships** and communication
• **Enhanced creativity** and problem-solving
• **Greater appreciation** for life
• **Reduced reactivity** to difficult situations
• **Increased mindfulness** in daily life

**Remember:** **Vipassana is typically practiced in intensive retreat settings**, but can also be integrated into daily practice. **Start with shorter sessions** and gradually increase duration as your practice develops.`,
    pages: 8
  },
  {
    id: 3,
    title: "Loving-Kindness Meditation",
    content: `**Loving-Kindness (Metta) meditation** is a **heart-centered practice** that cultivates unconditional love and compassion for all beings. It's particularly powerful for developing emotional intelligence and healing relationships.

**The Practice Sequence:**
**1. Self-Loving-Kindness:**
• **Direct love and compassion** toward yourself first
• **Recognize your own suffering** and need for care
• **Offer yourself the same kindness** you would give others
• **Heal self-criticism** and negative self-talk
• **Develop self-acceptance** and self-compassion

**2. Benefactor:**
• **Extend love to someone** who has helped you
• **Think of a teacher, mentor, or benefactor**
• **Remember their kindness** and generosity
• **Wish them well** with genuine care
• **Feel gratitude** for their support

**3. Beloved Friend:**
• **Include a close friend** or family member
• **Think of someone you love** and care about
• **Wish them happiness** and well-being
• **Feel the connection** and bond between you
• **Strengthen your relationship** through love

**4. Neutral Person:**
• **Include someone you neither like nor dislike**
• **Choose someone you see regularly** but don't know well
• **Recognize their humanity** and basic goodness
• **Wish them well** despite lack of personal connection
• **Develop impartial love** and care

**5. Difficult Person:**
• **Include someone with whom you have challenges**
• **Start with someone mildly difficult** - not extremely challenging
• **Recognize their suffering** and humanity
• **Wish them freedom from suffering**
• **Develop compassion** for difficult people

**6. All Beings:**
• **Extend love to all living beings**
• **Include humans, animals, and all creatures**
• **Wish for universal happiness** and peace
• **Feel connected to all life**
• **Develop boundless love** and compassion

**Traditional Phrases:**
• **"May you be happy"** - Wishing genuine happiness
• **"May you be healthy"** - Wishing physical and mental health
• **"May you be safe"** - Wishing protection from harm
• **"May you live with ease"** - Wishing freedom from suffering

**Advanced Variations:**
**Tonglen (Tibetan Taking and Sending):**
• **Breathe in suffering** - Take in others' pain
• **Breathe out compassion** - Send out love and healing
• **Transform suffering** into compassion
• **Develop courage** and fearlessness
• **Strengthen compassion** and empathy

**Compassion Meditation:**
• **Focus specifically on suffering** and its relief
• **Recognize suffering** in yourself and others
• **Wish for freedom** from suffering
• **Develop active compassion** and care
• **Motivate helpful action** and service

**Joy Meditation:**
• **Cultivate sympathetic joy** for others' happiness
• **Rejoice in others' success** and good fortune
• **Overcome envy** and jealousy
• **Develop genuine happiness** for others
• **Strengthen positive emotions**

**Equanimity Meditation:**
• **Develop balanced care** for all beings
• **Overcome attachment** and aversion
• **Maintain stability** in relationships
• **Accept the natural flow** of life
• **Cultivate wisdom** and understanding

**Benefits of Loving-Kindness:**
**Emotional Benefits:**
• **Increased compassion** and empathy
• **Reduced anger** and resentment
• **Improved relationships** and connection
• **Enhanced emotional well-being** and happiness
• **Greater sense of belonging** and community
• **Reduced stress** and anxiety

**Psychological Benefits:**
• **Improved self-esteem** and self-acceptance
• **Better emotional regulation** and stability
• **Enhanced social skills** and communication
• **Reduced depression** and negative thinking
• **Increased positive emotions** and optimism
• **Better conflict resolution** skills

**Physical Benefits:**
• **Reduced stress hormones** and inflammation
• **Improved immune function** and health
• **Better sleep quality** and relaxation
• **Lower blood pressure** and heart rate
• **Enhanced pain tolerance** and management
• **Increased energy** and vitality

**Remember:** **Loving-kindness meditation is a powerful practice** that can transform your relationships and emotional well-being. **Start with yourself** and gradually extend your care to others. **Be patient** - the benefits develop over time with consistent practice.`,
    pages: 8
  },
  {
    id: 4,
    title: "Transcendental Meditation",
    content: `**Transcendental Meditation (TM)** is a specific form of mantra meditation that aims to **transcend ordinary thinking** and access pure awareness. It's practiced for 20 minutes twice daily and requires instruction from a certified teacher.

**Key Characteristics:**
• **Personalized mantra** assigned by certified teacher
• **Effortless practice** - no concentration or control required
• **Natural transcendence** - mind naturally settles inward
• **Systematic instruction** - standardized teaching method
• **Scientific validation** - extensive research on benefits
• **Non-religious approach** - suitable for all backgrounds

**The Practice Method:**
**1. Proper Instruction:**
• **Receive personalized mantra** from certified teacher
• **Learn correct pronunciation** and use
• **Understand the technique** and its principles
• **Practice under guidance** initially
• **Receive follow-up support** and verification

**2. Daily Practice:**
• **Practice twice daily** - morning and evening
• **20-minute sessions** - optimal duration
• **Comfortable sitting position** - no special posture required
• **Eyes closed** - natural relaxation
• **Effortless repetition** of mantra

**3. The Transcendence Process:**
• **Start with mantra** - gentle mental repetition
• **Mind naturally settles** - thoughts become quieter
• **Experience pure awareness** - beyond thought and perception
• **Rest in silence** - deep inner peace
• **Return naturally** - gradual return to normal awareness

**Scientific Research:**
**Brain Changes:**
• **Increased alpha brain waves** - relaxed alertness
• **Enhanced coherence** between brain hemispheres
• **Improved prefrontal cortex** function
• **Reduced amygdala activity** - less stress response
• **Enhanced default mode network** - better self-awareness

**Health Benefits:**
• **Reduced stress** and anxiety levels
• **Lower blood pressure** and heart rate
• **Improved cardiovascular health** and function
• **Enhanced immune system** response
• **Better sleep quality** and patterns
• **Reduced chronic pain** and inflammation

**Psychological Benefits:**
• **Improved cognitive function** and memory
• **Enhanced creativity** and problem-solving
• **Better emotional regulation** and stability
• **Reduced depression** and negative thinking
• **Increased self-actualization** and growth
• **Enhanced spiritual development**

**Comparison with Other Techniques:**
**TM vs. Mindfulness:**
• **TM is effortless** - mindfulness requires attention
• **TM transcends thinking** - mindfulness observes thinking
• **TM is systematic** - mindfulness is flexible
• **TM requires instruction** - mindfulness can be self-taught
• **TM has specific timing** - mindfulness can be anytime

**TM vs. Concentration Meditation:**
• **TM is effortless** - concentration requires effort
• **TM transcends objects** - concentration focuses on objects
• **TM is natural** - concentration is controlled
• **TM leads to transcendence** - concentration leads to absorption
• **TM is systematic** - concentration varies by technique

**Integration with Daily Life:**
**Morning Practice:**
• **Start your day** with clarity and energy
• **Set positive intentions** for the day
• **Reduce morning stress** and anxiety
• **Enhance creativity** and problem-solving
• **Improve focus** and concentration

**Evening Practice:**
• **Release daily stress** and tension
• **Prepare for restful sleep** and recovery
• **Process daily experiences** and insights
• **Cultivate inner peace** and contentment
• **Enhance dream quality** and sleep

**Remember:** **Transcendental Meditation requires proper instruction** from a certified teacher. **The technique is simple but specific** - correct practice is essential for optimal benefits. **Consistency is key** - regular practice twice daily provides maximum benefits.`,
    pages: 8
  },
  {
    id: 5,
    title: "Zen Meditation",
    content: `**Zen meditation (Zazen)** is a **direct approach** to experiencing reality as it is, without conceptual thinking or intellectual understanding. It emphasizes **just sitting** and allowing everything to be as it is.

**Core Principles:**
**Direct Experience:**
• **Beyond concepts** and intellectual understanding
• **Direct perception** of reality
• **No separation** between self and experience
• **Immediate awareness** without interpretation
• **Pure observation** without judgment

**Non-Attachment:**
• **Let go of preferences** and opinions
• **Accept everything** as it arises
• **Don't cling** to pleasant experiences
• **Don't avoid** unpleasant experiences
• **Maintain equanimity** in all situations

**Just Sitting (Shikantaza):**
• **Simply sit** without any technique
• **Allow everything** to be as it is
• **No goal** or expectation
• **No method** or manipulation
• **Pure being** and awareness

**The Practice Method:**
**1. Proper Posture:**
• **Sit cross-legged** on a cushion (lotus or half-lotus)
• **Keep back straight** but not rigid
• **Chin slightly tucked** - head balanced
• **Hands in mudra** - left hand on right, thumbs touching
• **Eyes half-open** - gaze downward

**2. Breath Awareness:**
• **Follow natural breath** without changing it
• **Count breaths** if helpful (1-10, then repeat)
• **Focus on exhalation** - let go with each out-breath
• **Allow inhalation** to happen naturally
• **Maintain awareness** of breathing

**3. Mindful Sitting:**
• **Just sit** without doing anything
• **Allow thoughts** to come and go
• **Don't engage** with thinking
• **Return to sitting** when you notice distraction
• **Be present** with whatever arises

**4. Koan Practice (Rinzai Zen):**
• **Work with koans** - paradoxical questions
• **Contemplate deeply** without intellectual analysis
• **Allow insight** to arise naturally
• **Present understanding** to teacher
• **Continue until resolution**

**Zen Techniques:**
**Breath Counting:**
• **Count each exhalation** from 1 to 10
• **Start over** when you reach 10
• **Return to 1** when mind wanders
• **Keep counting** without judgment
• **Develop concentration** and focus

**Mu Koan:**
• **Contemplate "Mu"** - meaning "no" or "nothing"
• **Ask "What is Mu?"** with your whole being
• **Don't think about it** intellectually
• **Allow the question** to penetrate deeply
• **Wait for insight** to arise naturally

**Walking Meditation (Kinhin):**
• **Walk slowly** between sitting periods
• **Coordinate steps** with breathing
• **Maintain awareness** of movement
• **Keep eyes down** and focused
• **Stay present** with each step

**Benefits of Zen Practice:**
**Psychological Benefits:**
• **Reduced stress** and anxiety
• **Improved concentration** and focus
• **Enhanced clarity** and insight
• **Better emotional regulation**
• **Increased self-awareness**
• **Greater peace** and contentment

**Spiritual Benefits:**
• **Direct experience** of reality
• **Understanding of emptiness** and impermanence
• **Development of wisdom** and insight
• **Cultivation of compassion** and understanding
• **Realization of true nature**
• **Freedom from suffering**

**Practical Benefits:**
• **Better decision-making** and problem-solving
• **Improved relationships** and communication
• **Enhanced creativity** and intuition
• **Greater resilience** and adaptability
• **Increased mindfulness** in daily life
• **Better stress management**

**Integration with Daily Life:**
**Mindful Activities:**
• **Apply Zen awareness** to daily activities
• **Practice mindfulness** while working, eating, walking
• **Maintain presence** in all situations
• **Let go of attachments** and preferences
• **Accept things** as they are

**Zen Mind, Beginner's Mind:**
• **Approach everything** with fresh awareness
• **Let go of preconceptions** and expectations
• **Be open** to new possibilities
• **Maintain curiosity** and wonder
• **Practice humility** and openness

**Remember:** **Zen practice is simple but not easy.** It requires **patience, persistence, and proper guidance**. **Don't expect quick results** - the benefits develop gradually with consistent practice. **Find a teacher** or community to support your practice.`,
    pages: 8
  },
  {
    id: 6,
    title: "Integration and Mastery",
    content: `**Integration and mastery** of advanced meditation techniques involves **bringing the insights and benefits** of practice into all aspects of daily life. This is the ultimate goal of meditation practice.

**The Integration Process:**
**From Practice to Life:**
• **Apply insights** from meditation to daily situations
• **Maintain awareness** throughout the day
• **Practice mindfulness** in all activities
• **Bring compassion** to relationships
• **Use wisdom** in decision-making

**Stages of Integration:**
**1. Foundation Building:**
• **Establish regular practice** and routine
• **Develop basic skills** and understanding
• **Build concentration** and mindfulness
• **Learn from teachers** and community
• **Study theory** and philosophy

**2. Skill Development:**
• **Master basic techniques** thoroughly
• **Explore advanced methods** gradually
• **Develop personal practice** style
• **Overcome obstacles** and challenges
• **Build confidence** and trust

**3. Deepening Practice:**
• **Attend intensive retreats** and workshops
• **Work with experienced teachers**
• **Explore different traditions** and approaches
• **Develop insight** and understanding
• **Cultivate wisdom** and compassion

**4. Integration:**
• **Bring practice into daily life** naturally
• **Apply insights** to relationships and work
• **Maintain awareness** in all situations
• **Serve others** with compassion
• **Live with integrity** and authenticity

**5. Mastery:**
• **Practice becomes natural** and effortless
• **Wisdom guides** all actions and decisions
• **Compassion flows** freely to all beings
• **Life becomes** a continuous meditation
• **Freedom and peace** are realized

**Advanced Integration Practices:**
**Mindful Living:**
• **Practice mindfulness** in all daily activities
• **Maintain awareness** while working, eating, walking
• **Bring attention** to routine tasks
• **Stay present** in conversations and interactions
• **Notice beauty** and wonder in ordinary moments

**Compassionate Action:**
• **Serve others** with kindness and care
• **Practice generosity** and giving
• **Help those in need** without expectation
• **Work for the benefit** of all beings
• **Cultivate loving-kindness** in action

**Wisdom in Action:**
• **Apply insights** to solve problems
• **Make decisions** with clarity and wisdom
• **See through illusions** and confusion
• **Understand the nature** of reality
• **Live with understanding** and acceptance

**Challenges and Obstacles:**
**Common Challenges:**
• **Maintaining consistency** in daily practice
• **Integrating practice** with busy lifestyle
• **Dealing with difficult emotions** and situations
• **Balancing practice** with responsibilities
• **Overcoming doubt** and discouragement

**Strategies for Overcoming:**
• **Set realistic goals** and expectations
• **Create supportive environment** and routine
• **Find community** and teachers for support
• **Practice self-compassion** and patience
• **Remember your motivation** and purpose

**Signs of Progress:**
**Personal Growth:**
• **Increased self-awareness** and understanding
• **Better emotional regulation** and stability
• **Improved relationships** and communication
• **Enhanced creativity** and problem-solving
• **Greater peace** and contentment

**Spiritual Development:**
• **Deeper understanding** of reality
• **Increased compassion** and wisdom
• **Greater freedom** from suffering
• **Enhanced connection** with others
• **Realization of true nature**

**Living the Practice:**
**Daily Integration:**
• **Start each day** with intention and awareness
• **Practice mindfulness** throughout the day
• **End each day** with reflection and gratitude
• **Maintain awareness** in all activities
• **Bring compassion** to all interactions

**Long-term Commitment:**
• **View practice as lifelong** journey
• **Continue learning** and growing
• **Adapt practice** to changing circumstances
• **Serve others** and contribute to world
• **Live with wisdom** and compassion

**Remember:** **Integration is the ultimate goal** of meditation practice. **Don't separate practice from life** - let them become one. **Be patient and persistent** - true integration takes time and dedication. **Trust the process** and allow your practice to naturally transform your life.`,
    pages: 8
  }
];

export default function AdvancedMeditationTechniques() {
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
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#23242b' }]}>Advanced Meditation</Text>
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
              onPress={() => { setCurrentChapter(index); setCurrentPage(0); }}
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
                    width: `${((chapters.slice(0, currentChapter).reduce((s, ch) => s + getChapterPages(ch), 0) + currentPage + 1) / totalPages) * 100}%`,
                    backgroundColor: isDarkMode ? '#ffd700' : '#23242b',
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              {chapters.slice(0, currentChapter).reduce((s, ch) => s + getChapterPages(ch), 0) + currentPage + 1} of {totalPages} pages
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Navigation Footer */}
      <View style={[styles.footer, { backgroundColor: isDarkMode ? '#2d2d2d' : '#fff', borderTopColor: isDarkMode ? '#404040' : '#f0f0f0' }]}>
        <View style={styles.pageInfo}>
          <Text style={[styles.pageText, { color: isDarkMode ? '#ccc' : '#666' }]}>
            Chapter {currentChapter + 1}, Page {currentPage + 1} of {currentChapterData.pages}
          </Text>
        </View>
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[
              styles.navButton,
              { backgroundColor: isDarkMode ? '#404040' : '#f8f9fa', borderColor: isDarkMode ? '#555' : '#e9ecef' },
              (currentChapter === 0 && currentPage === 0) && { opacity: 0.5 }
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
              (currentChapter === chapters.length - 1 && currentPage === currentChapterPages - 1) && { opacity: 0.5 }
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  themeToggle: {
    padding: 8,
    borderRadius: 8,
  },
  readingControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  controlGroup: {
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
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
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  chapterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chapterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pageContainer: {
    paddingVertical: 20,
  },
  chapterTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  pageContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
  },
  highlightedText: {
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: 20,
  },
  progressBar: {
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
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
  },
  pageInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  pageText: {
    fontSize: 14,
    fontWeight: '500',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 8,
  },
});
