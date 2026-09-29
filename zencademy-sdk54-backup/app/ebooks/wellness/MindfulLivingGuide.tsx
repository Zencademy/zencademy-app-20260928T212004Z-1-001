import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const chapters = [
  {
    id: 1,
    title: "Introduction to Mindfulness",
    content: `**Mindfulness** is the practice of being fully present in the moment, aware of where we are and what we're doing, without being overly reactive or overwhelmed by what's going on around us.

The practice of mindfulness has been around for **thousands of years**, originating from Buddhist meditation practices. However, in recent decades, it has been adapted for secular use and has become increasingly popular in Western psychology and wellness practices.

**What is Mindfulness?**
Mindfulness is the basic human ability to be **fully present**, aware of where we are and what we're doing, and not overly reactive or overwhelmed by what's going on around us. It's a natural quality that we all possess, but it's more readily available to us when we practice it on a daily basis.

**The Essence of Mindfulness:**
• **Present-moment awareness** - Being fully engaged in the here and now
• **Non-judgmental observation** - Seeing things as they are without evaluation
• **Acceptance** - Allowing experiences to be as they are
• **Compassion** - Treating ourselves and others with kindness
• **Curiosity** - Approaching life with wonder and openness

**Key Benefits of Mindfulness:**
**Mental Health Benefits:**
• **Reduced stress and anxiety** - Lower cortisol levels and improved stress response
• **Better emotional regulation** - Increased ability to manage difficult emotions
• **Improved focus and concentration** - Enhanced attention and cognitive performance
• **Enhanced self-awareness** - Greater understanding of thoughts, emotions, and behaviors
• **Increased resilience** - Better ability to bounce back from challenges

**Physical Health Benefits:**
• **Lower blood pressure** - Reduced cardiovascular stress
• **Improved immune function** - Enhanced disease resistance
• **Better sleep quality** - Deeper, more restorative sleep
• **Reduced chronic pain** - Better pain management and tolerance
• **Enhanced energy levels** - Increased vitality and well-being

**Relationship Benefits:**
• **Improved communication** - Better listening and speaking skills
• **Increased empathy** - Greater understanding of others' perspectives
• **Enhanced compassion** - More caring and supportive relationships
• **Better conflict resolution** - Calmer, more constructive problem-solving
• **Deeper connections** - More meaningful and authentic relationships

**Scientific Evidence:**
Recent research has provided **compelling evidence** for the benefits of mindfulness practice. Studies using brain imaging technology have shown that regular mindfulness practice can lead to:

**Brain Changes:**
• **Increased gray matter density** in areas associated with learning, memory, and emotional regulation
• **Reduced activity in the amygdala** (the brain's fear center)
• **Strengthened connections** between different brain regions
• **Improved prefrontal cortex function** (responsible for decision-making and self-control)
• **Enhanced neuroplasticity** - the brain's ability to form new connections

**Research Findings:**
• **Stress Reduction**: Studies show 30-40% reduction in stress levels after 8 weeks of practice
• **Anxiety Relief**: Mindfulness-based interventions are as effective as medication for anxiety
• **Depression Prevention**: Reduces relapse rates in depression by 50%
• **Pain Management**: Reduces pain intensity and improves quality of life
• **Immune Function**: Increases antibody production and immune response

**Common Misconceptions:**
**"Mindfulness is about emptying your mind"**
This is a common misunderstanding. Mindfulness is not about stopping thoughts or achieving a blank mind. Instead, it's about **observing thoughts** as they arise and pass, without getting caught up in them.

**"Mindfulness is religious or spiritual"**
While mindfulness has roots in Buddhist traditions, modern mindfulness practices are **secular and scientific**. They focus on practical benefits for mental and physical health.

**"Mindfulness takes too much time"**
Even **1-2 minutes** of mindfulness practice daily can have significant benefits. You can practice mindfulness while doing everyday activities like walking, eating, or waiting in line.

**"Mindfulness is about being happy all the time"**
Mindfulness is not about avoiding difficult emotions or experiences. It's about **relating to all experiences** - pleasant and unpleasant - with greater awareness and compassion.

**Getting Started:**
**Simple Ways to Begin:**
• **Take a mindful breath** - Notice your breath for just one minute
• **Mindful walking** - Pay attention to the sensation of your feet touching the ground
• **Mindful eating** - Savor each bite, noticing taste, texture, and smell
• **Body scan** - Notice sensations in different parts of your body
• **Present-moment awareness** - Bring your attention to what you're doing right now

**Setting Intentions:**
Before beginning your mindfulness practice, it's helpful to set clear intentions:
• **Why are you practicing?** - What benefits do you hope to experience?
• **What are your goals?** - Be realistic about what you want to achieve
• **How will you measure progress?** - Notice subtle changes in your daily experience
• **What obstacles might arise?** - Plan for common challenges like lack of time or motivation

**Creating a Supportive Environment:**
• **Find a quiet space** where you won't be interrupted
• **Set aside dedicated time** for your practice
• **Minimize distractions** - turn off notifications and devices
• **Make it comfortable** - use cushions, blankets, or a comfortable chair
• **Be consistent** - practice at the same time each day when possible

**Important:** Mindfulness is a skill that develops with practice. **Be patient with yourself** and remember that every moment of awareness is a moment of mindfulness. Progress happens one breath at a time.`,
    pages: 6
  },
  {
    id: 2,
    title: "Core Mindfulness Practices",
    content: `Here are the **fundamental mindfulness techniques** that form the foundation of your practice:

**1. Breath Awareness Meditation**
**The Foundation Practice:**
Breath awareness is the **cornerstone** of mindfulness practice. It's simple, always available, and provides a stable anchor for your attention.

**How to Practice:**
• **Find a comfortable position** - Sit in a chair or on a cushion with your back straight
• **Close your eyes** or soften your gaze downward
• **Bring attention to your breath** - Notice the natural rhythm of breathing
• **Focus on the sensation** - Feel the breath entering and leaving your nostrils, or the rise and fall of your chest/abdomen
• **When your mind wanders** - Gently return your attention to the breath
• **Be patient** - Don't judge yourself when your mind wanders; this is normal

**Common Challenges and Solutions:**
• **"I can't stop thinking"** - Don't try to stop thoughts; just notice them and return to the breath
• **"I'm not doing it right"** - There's no perfect way; focus on the intention to be present
• **"I keep falling asleep"** - Try sitting up straighter or practicing at a different time
• **"I don't have time"** - Start with just 1-2 minutes and gradually increase

**Progressive Practice:**
• **Week 1**: 1-2 minutes daily
• **Week 2**: 3-5 minutes daily
• **Week 3**: 5-10 minutes daily
• **Week 4**: 10-15 minutes daily
• **Ongoing**: 15-30 minutes daily

**2. Body Scan Meditation**
**Developing Body Awareness:**
The body scan helps you develop **awareness of physical sensations** and release tension throughout your body.

**Step-by-Step Practice:**
• **Lie down comfortably** on your back with arms at your sides
• **Close your eyes** and take a few deep breaths
• **Start with your toes** - Notice any sensations: warmth, coolness, tingling, pressure
• **Move attention slowly** up through your feet, ankles, calves, knees, thighs
• **Continue upward** through your pelvis, abdomen, chest, shoulders, arms, hands
• **Finish with your head** - face, scalp, and any sensations in your head
• **Spend 1-2 minutes** on each body part
• **Notice the whole body** - Feel your body as a complete, integrated whole

**Benefits of Body Scan:**
• **Reduces physical tension** and stress
• **Improves body awareness** and proprioception
• **Helps with pain management** and chronic conditions
• **Enhances relaxation** and sleep quality
• **Develops mindfulness** of physical sensations

**3. Mindful Walking**
**Meditation in Motion:**
Walking meditation combines **physical movement** with mindfulness practice, making it accessible throughout your day.

**Indoor Walking Practice:**
• **Choose a clear path** - 10-20 steps in length
• **Stand at one end** and bring attention to your feet
• **Walk slowly** - half your normal pace
• **Focus on sensations** - feet touching the ground, weight shifting, balance
• **Turn mindfully** - pause briefly at each end before turning
• **Maintain awareness** - if your mind wanders, return to the sensation of walking

**Outdoor Walking Practice:**
• **Choose a familiar route** - a park, neighborhood, or nature trail
• **Walk at a comfortable pace** - not too fast, not too slow
• **Notice your surroundings** - sights, sounds, smells, temperature
• **Feel your body** - the rhythm of your steps, your breathing
• **Stay present** - avoid planning or reminiscing; focus on the here and now

**4. Mindful Eating**
**Transforming a Daily Activity:**
Mindful eating turns **every meal into a meditation**, helping you develop a healthier relationship with food.

**Before Eating:**
• **Pause and breathe** - Take a moment to center yourself
• **Express gratitude** - Appreciate the food and those who prepared it
• **Notice hunger** - How hungry are you on a scale of 1-10?
• **Set intentions** - Eat slowly, savor each bite, stop when satisfied

**During Eating:**
• **Look at your food** - Notice colors, textures, arrangement
• **Smell the food** - Take in the aromas before taking a bite
• **Take small bites** - Put down your utensils between bites
• **Chew slowly** - Notice taste, texture, temperature
• **Savor each bite** - Pay full attention to the experience of eating
• **Pause periodically** - Check in with your hunger and fullness

**Benefits of Mindful Eating:**
• **Better digestion** - Slower eating improves digestive function
• **Weight management** - Increased awareness of hunger and fullness
• **Enhanced enjoyment** - Food tastes better when fully attended to
• **Reduced overeating** - Better recognition of satiety signals
• **Improved relationship with food** - Less emotional or mindless eating

**5. Loving-Kindness Meditation (Metta)**
**Cultivating Compassion:**
Loving-kindness meditation develops **compassion and goodwill** toward yourself and others.

**The Practice:**
• **Start with yourself** - "May I be happy, may I be healthy, may I be at peace"
• **Extend to a loved one** - "May you be happy, may you be healthy, may you be at peace"
• **Include a neutral person** - Someone you don't know well
• **Practice toward difficult people** - With patience and understanding
• **Expand to all beings** - "May all beings be happy, may all beings be free from suffering"

**Benefits of Loving-Kindness:**
• **Reduces stress and anxiety** - Activates the relaxation response
• **Increases positive emotions** - Joy, gratitude, and contentment
• **Improves relationships** - Greater empathy and understanding
• **Enhances self-compassion** - Better self-care and self-acceptance
• **Reduces negative emotions** - Less anger, resentment, and judgment

**6. Mindful Listening**
**Deepening Communication:**
Mindful listening improves **relationships and communication** by bringing full attention to others.

**How to Practice:**
• **Give full attention** - Put away distractions and focus completely
• **Listen without planning** - Don't rehearse your response while they speak
• **Notice body language** - Pay attention to non-verbal cues
• **Ask clarifying questions** - Ensure you understand their perspective
• **Reflect back** - Summarize what you heard to confirm understanding
• **Respond mindfully** - Take a breath before responding

**Benefits of Mindful Listening:**
• **Stronger relationships** - People feel heard and valued
• **Better understanding** - Reduced miscommunication and conflict
• **Enhanced empathy** - Greater connection with others' experiences
• **Improved problem-solving** - Better collaboration and cooperation
• **Reduced stress** - Less conflict and misunderstanding

**Integrating Practices into Daily Life:**
**Micro-Mindfulness Moments:**
• **Waiting in line** - Notice your breath and surroundings
• **Brushing teeth** - Feel the sensations and movements
• **Driving** - Pay attention to the experience of driving
• **Showering** - Feel the water and sensations on your skin
• **Falling asleep** - Focus on your breath and let go of thoughts

**Creating Mindful Habits:**
• **Set reminders** - Use phone alerts or sticky notes
• **Choose triggers** - Link mindfulness to existing habits
• **Start small** - Begin with 1-2 practices and build gradually
• **Be consistent** - Practice regularly, even for short periods
• **Track progress** - Notice changes in your daily experience

**Remember:** **Consistency matters more than duration.** A few minutes of daily practice is more valuable than occasional long sessions. Each moment of mindfulness strengthens your practice and brings you closer to greater awareness and well-being.`,
    pages: 8
  },
  {
    id: 3,
    title: "Mindfulness for Emotional Well-being",
    content: `Mindfulness is a **powerful tool** for managing emotions and improving mental health. This chapter explores how to use mindfulness to work with difficult emotions and cultivate positive ones.

**Understanding Emotions Mindfully:**
**The Nature of Emotions:**
Emotions are **natural responses** to our experiences. They provide valuable information about our needs, values, and the world around us. However, when we get caught up in emotions without awareness, they can overwhelm us and lead to suffering.

**Key Principles:**
• **Emotions are temporary** - They arise, change, and pass away
• **Emotions are not you** - You are not your emotions; you experience them
• **All emotions are valid** - There are no "good" or "bad" emotions
• **Emotions contain wisdom** - They can guide us toward what we need
• **Emotions can be worked with** - We can learn to relate to them skillfully

**The RAIN Technique:**
**Recognize** - Notice what emotion is present
**Allow** - Let the emotion be there without trying to change it
**Investigate** - Explore the emotion with curiosity and kindness
**Nurture** - Offer yourself compassion and care

**Working with Difficult Emotions:**
**Anxiety and Worry:**
**Understanding Anxiety:**
Anxiety is often a **response to uncertainty** and the unknown. It's the mind's attempt to protect us from potential threats, but it can become overwhelming when it's excessive or persistent.

**Mindful Approaches:**
• **Ground yourself** - Feel your feet on the ground, your breath in your body
• **Name the anxiety** - "I'm feeling anxious right now"
• **Notice physical sensations** - Where do you feel anxiety in your body?
• **Observe thoughts** - Notice anxious thoughts without believing them
• **Practice self-compassion** - "It's okay to feel anxious; this is difficult"
• **Focus on the present** - Anxiety is often about the future; return to now

**Practical Exercises:**
• **5-4-3-2-1 Grounding** - Name 5 things you see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste
• **Breathing exercises** - Slow, deep breathing to activate the relaxation response
• **Progressive muscle relaxation** - Tense and release muscle groups
• **Mindful movement** - Gentle stretching or walking to release tension

**Anger and Frustration:**
**Understanding Anger:**
Anger often arises when we feel **threatened, frustrated, or powerless**. It can be a protective response, but when expressed unconsciously, it can harm relationships and well-being.

**Mindful Approaches:**
• **Pause before reacting** - Create space between stimulus and response
• **Notice physical sensations** - Where do you feel anger in your body?
• **Breathe deeply** - Slow breathing to calm the nervous system
• **Investigate the cause** - What triggered this anger? What's underneath?
• **Express constructively** - Communicate needs and feelings clearly
• **Practice forgiveness** - Let go of resentment and judgment

**Practical Exercises:**
• **Counting breaths** - Count to 10 before responding
• **Physical release** - Exercise, punching a pillow, or vigorous movement
• **Writing** - Express anger in a journal without sending it
• **Compassion practice** - Extend understanding to yourself and others

**Sadness and Grief:**
**Understanding Sadness:**
Sadness is a **natural response** to loss, disappointment, or difficult circumstances. It's part of the human experience and can be a path to healing and growth.

**Mindful Approaches:**
• **Allow yourself to feel** - Don't try to push sadness away
• **Practice self-compassion** - Be kind to yourself during difficult times
• **Connect with others** - Share your feelings with trusted friends or family
• **Find meaning** - Look for lessons or growth in difficult experiences
• **Trust the process** - Grief has its own timeline and rhythm
• **Seek support** - Professional help can be valuable during deep sadness

**Practical Exercises:**
• **Gentle self-care** - Rest, nourishing food, warm baths
• **Creative expression** - Art, music, writing, or movement
• **Nature connection** - Spend time outdoors in natural settings
• **Gratitude practice** - Notice small moments of beauty and connection

**Cultivating Positive Emotions:**
**Gratitude Practice:**
Gratitude is a **powerful antidote** to negative emotions and a key to happiness and well-being.

**Daily Gratitude Practice:**
• **Morning gratitude** - Write down 3 things you're grateful for
• **Gratitude walk** - Notice and appreciate things as you walk
• **Gratitude journal** - Record moments of appreciation daily
• **Gratitude letters** - Write thank-you notes to people who've helped you
• **Gratitude meditation** - Focus on feelings of thankfulness

**Joy and Happiness:**
**Cultivating Joy:**
Joy is different from happiness - it's a **deeper, more sustainable** state that comes from within.

**Practices for Joy:**
• **Savor positive experiences** - Fully enjoy pleasant moments
• **Practice kindness** - Acts of generosity and compassion
• **Connect with others** - Meaningful relationships and community
• **Engage in flow activities** - Activities that absorb your full attention
• **Celebrate small victories** - Acknowledge and appreciate progress

**Compassion and Self-Compassion:**
**Understanding Compassion:**
Compassion is the **wish for others to be free from suffering** and the motivation to help them.

**Self-Compassion Practice:**
• **Treat yourself like a friend** - Offer yourself the same kindness you'd give others
• **Recognize common humanity** - You're not alone in your struggles
• **Practice mindful awareness** - Notice suffering without getting overwhelmed
• **Use compassionate language** - Speak to yourself with kindness
• **Take compassionate action** - Do things that nurture and care for yourself

**Mindfulness and Relationships:**
**Mindful Communication:**
• **Listen deeply** - Give full attention without planning your response
• **Speak mindfully** - Choose words carefully and speak with intention
• **Pause before responding** - Create space for thoughtful communication
• **Express feelings clearly** - Use "I" statements and share your experience
• **Practice empathy** - Try to understand others' perspectives

**Conflict Resolution:**
• **Stay present** - Don't get caught up in past grievances
• **Focus on needs** - Look for underlying needs rather than positions
• **Practice non-violent communication** - Express observations, feelings, needs, and requests
• **Take breaks when needed** - Step away to calm down before continuing
• **Seek understanding** - Ask questions to clarify and understand

**Building Emotional Resilience:**
**Developing Resilience:**
Emotional resilience is the **ability to bounce back** from difficult experiences and adapt to change.

**Practices for Resilience:**
• **Regular mindfulness practice** - Builds awareness and equanimity
• **Self-care routines** - Physical, emotional, and spiritual nourishment
• **Support networks** - Connect with friends, family, and community
• **Meaning and purpose** - Engage in activities that matter to you
• **Growth mindset** - View challenges as opportunities for learning

**Remember:** **Emotions are natural and temporary.** Mindfulness helps us relate to them with wisdom and compassion, rather than being overwhelmed by them. Each emotion contains valuable information and can be a teacher on our path to greater well-being.`,
    pages: 12
  },
  {
    id: 4,
    title: "Mindfulness in Daily Life",
    content: `Mindfulness isn't just for meditation cushions - it's a **way of living** that can transform every aspect of your daily experience. This chapter explores how to bring mindfulness into your everyday activities.

**Morning Mindfulness:**
**Starting Your Day Mindfully:**
The way you begin your day **sets the tone** for everything that follows. A mindful morning routine can create a foundation of calm and intention.

**Mindful Wake-Up:**
• **Don't reach for your phone immediately** - Give yourself space to wake up naturally
• **Take a few deep breaths** - Notice the sensation of breathing
• **Stretch mindfully** - Feel your body waking up and moving
• **Express gratitude** - Appreciate being alive and starting a new day
• **Set an intention** - What quality do you want to bring to your day?

**Mindful Morning Routine:**
• **Mindful showering** - Feel the water, notice the sensations
• **Mindful dressing** - Choose clothes with awareness and care
• **Mindful breakfast** - Eat slowly and savor your food
• **Mindful commute** - Notice your surroundings and your breath
• **Mindful planning** - Review your day with intention and purpose

**Mindfulness at Work:**
**Creating Mindful Workspaces:**
Your work environment can **support or hinder** mindfulness practice. Small changes can make a big difference.

**Physical Environment:**
• **Declutter your workspace** - Clear space supports clear mind
• **Add natural elements** - Plants, natural light, or nature sounds
• **Create a mindful corner** - A small space for brief meditation or breathing
• **Minimize distractions** - Turn off notifications, close unnecessary tabs
• **Use mindful reminders** - Sticky notes, phone alerts, or visual cues

**Mindful Work Practices:**
• **Single-tasking** - Focus on one task at a time
• **Mindful transitions** - Pause between tasks to reset
• **Mindful breaks** - Take short breaks to breathe and stretch
• **Mindful meetings** - Start with a moment of silence or breathing
• **Mindful communication** - Listen fully and speak with intention

**Managing Work Stress:**
• **Notice stress signals** - Physical tension, racing thoughts, irritability
• **Take micro-breaks** - 30-second breathing exercises throughout the day
• **Practice acceptance** - Acknowledge difficult situations without resistance
• **Set boundaries** - Know your limits and communicate them clearly
• **Seek support** - Connect with colleagues or professionals when needed

**Mindful Eating Throughout the Day:**
**Breakfast Mindfulness:**
• **Prepare with intention** - Choose nourishing foods mindfully
• **Eat without distractions** - No phone, TV, or work while eating
• **Savor each bite** - Notice taste, texture, temperature
• **Express gratitude** - Appreciate the food and those who prepared it
• **Check in with hunger** - Notice when you're satisfied

**Lunch Mindfulness:**
• **Step away from your desk** - Change your environment
• **Eat with others** - Connect and share conversation
• **Take your time** - Don't rush through your meal
• **Notice energy changes** - How does the food affect your energy?
• **Plan your afternoon** - Set intentions for the rest of your day

**Dinner Mindfulness:**
• **Transition mindfully** - Leave work behind and be present
• **Cook with awareness** - Enjoy the process of preparing food
• **Eat with family or friends** - Connect and share your day
• **Reflect on your day** - What went well? What are you grateful for?
• **Prepare for evening** - Set intentions for rest and relaxation

**Mindful Communication:**
**Listening Mindfully:**
• **Give full attention** - Put away distractions and focus completely
• **Listen without planning** - Don't rehearse your response while they speak
• **Notice body language** - Pay attention to non-verbal cues
• **Ask clarifying questions** - Ensure you understand their perspective
• **Reflect back** - Summarize what you heard to confirm understanding
• **Respond mindfully** - Take a breath before responding

**Speaking Mindfully:**
• **Pause before speaking** - Consider your words and their impact
• **Speak with intention** - Know what you want to communicate
• **Use "I" statements** - Share your experience rather than making assumptions
• **Be honest and kind** - Speak truthfully while considering others' feelings
• **Listen to yourself** - Notice your tone, pace, and energy

**Digital Mindfulness:**
**Conscious Technology Use:**
Technology can be a **tool or a trap**. Mindfulness helps us use it wisely and maintain our humanity.

**Setting Boundaries:**
• **Designate tech-free times** - Meals, bedtime, weekends
• **Use apps mindfully** - Choose those that support well-being
• **Create physical distance** - Keep devices out of reach when not needed
• **Practice presence** - Be fully engaged in real-world interactions
• **Use technology intentionally** - Have a purpose before picking up your device

**Social Media Mindfulness:**
• **Pause before posting** - Consider your intention and potential impact
• **Notice emotional reactions** - How do others' posts affect you?
• **Limit comparison** - Remember that social media shows curated highlights
• **Engage meaningfully** - Comment thoughtfully rather than scrolling mindlessly
• **Take regular breaks** - Disconnect to reconnect with real life

**Mindful Movement Throughout the Day:**
**Mindful Walking:**
• **Notice your steps** - Feel your feet touching the ground
• **Observe your surroundings** - See, hear, smell, feel the world around you
• **Stay present** - Avoid planning or reminiscing while walking
• **Appreciate movement** - Be grateful for your ability to walk
• **Use walking as meditation** - Turn any walk into a mindfulness practice

**Mindful Exercise:**
• **Choose activities you enjoy** - Exercise should be pleasurable, not punishment
• **Focus on sensations** - Feel your body moving and working
• **Stay present** - Don't zone out; be aware of your experience
• **Listen to your body** - Respect your limits and needs
• **Express gratitude** - Appreciate your body's capabilities

**Evening Mindfulness:**
**Mindful Evening Routine:**
• **Transition from work** - Leave work concerns behind
• **Connect with loved ones** - Spend quality time with family or friends
• **Practice self-care** - Activities that nourish and restore you
• **Reflect on your day** - What went well? What are you grateful for?
• **Prepare for tomorrow** - Set intentions and organize for the next day

**Mindful Sleep Preparation:**
• **Create a bedtime routine** - Consistent activities that signal sleep
• **Limit screen time** - Avoid devices 1-2 hours before bed
• **Practice relaxation** - Gentle stretching, breathing, or meditation
• **Create a peaceful environment** - Cool, dark, quiet bedroom
• **Let go of the day** - Release concerns and trust in rest

**Mindfulness in Relationships:**
**With Family:**
• **Be fully present** - Put away distractions when with family
• **Listen actively** - Give full attention to family members
• **Express appreciation** - Regularly share gratitude and love
• **Handle conflicts mindfully** - Stay calm and seek understanding
• **Create meaningful traditions** - Activities that bring you together

**With Friends:**
• **Maintain connections** - Regular check-ins and quality time
• **Practice empathy** - Try to understand their experiences
• **Offer support** - Be there during difficult times
• **Celebrate together** - Share joys and accomplishments
• **Respect boundaries** - Honor their needs and limits

**Mindful Self-Care:**
**Physical Self-Care:**
• **Regular exercise** - Movement that feels good and energizing
• **Adequate sleep** - Prioritize rest and recovery
• **Nourishing food** - Eat foods that support your well-being
• **Regular check-ups** - Take care of your physical health
• **Mindful hygiene** - Turn daily routines into mindfulness practices

**Emotional Self-Care:**
• **Express emotions** - Allow yourself to feel and express feelings
• **Practice self-compassion** - Be kind to yourself during difficulties
• **Set boundaries** - Know your limits and communicate them
• **Seek support** - Reach out to friends, family, or professionals
• **Engage in joy** - Activities that bring you happiness and fulfillment

**Remember:** **Mindfulness is a way of being, not just something you do.** Every moment offers an opportunity to practice awareness, presence, and compassion. Start with small changes and build gradually - even one mindful moment can make a difference in your day.`,
    pages: 10
  },
  {
    id: 5,
    title: "Building a Lasting Practice",
    content: `Creating a **sustainable mindfulness practice** requires commitment, patience, and realistic expectations. This chapter provides a comprehensive guide to building a practice that lasts.

**Establishing Your Foundation:**
**Setting Clear Intentions:**
Before beginning your mindfulness practice, it's essential to **clarify your intentions** and understand your motivation.

**Reflection Questions:**
• **Why do you want to practice mindfulness?** - What benefits are you seeking?
• **What are your specific goals?** - Be realistic about what you want to achieve
• **How will you measure progress?** - Notice subtle changes in your daily experience
• **What obstacles might arise?** - Plan for common challenges like lack of time or motivation
• **How will you stay committed?** - What will help you maintain your practice?

**Creating a Supportive Environment:**
**Physical Space:**
• **Find a quiet location** - Where you won't be interrupted
• **Make it comfortable** - Cushions, blankets, or a comfortable chair
• **Minimize distractions** - Turn off notifications, close doors
• **Create a ritual** - Lighting a candle, playing soft music, or using essential oils
• **Keep it simple** - Don't overcomplicate your setup

**Mental Preparation:**
• **Set clear intentions** - Know why you're practicing
• **Let go of expectations** - Don't expect immediate results
• **Approach with curiosity** - Be open to whatever arises
• **Be patient** - Trust the process and your own pace
• **Practice self-compassion** - Be kind to yourself throughout the journey

**Building Your Practice Gradually:**
**Week 1-2: Foundation (5-10 minutes daily)**
• **Choose one technique** - Start with breath awareness or body scan
• **Set a consistent time** - Same time each day when possible
• **Create reminders** - Phone alerts, sticky notes, or environmental cues
• **Track your practice** - Note when you practice and for how long
• **Be gentle** - Don't judge yourself if you miss a day

**Week 3-4: Expansion (10-15 minutes daily)**
• **Add variety** - Try different techniques and approaches
• **Extend practice time** - Gradually increase duration
• **Integrate into daily life** - Practice mindfulness during everyday activities
• **Notice benefits** - Pay attention to changes in your experience
• **Adjust as needed** - Modify your practice based on what works for you

**Month 2-3: Deepening (15-30 minutes daily)**
• **Explore advanced techniques** - Loving-kindness, insight meditation
• **Join a community** - Find others who practice mindfulness
• **Read and learn** - Books, articles, or courses on mindfulness
• **Reflect on progress** - Notice how your practice has evolved
• **Set new intentions** - What would you like to explore next?

**Ongoing: Integration (Flexible duration)**
• **Adapt to life changes** - Modify your practice as circumstances change
• **Continue learning** - Explore new techniques and approaches
• **Share with others** - Teach or support others in their practice
• **Deepen understanding** - Study the philosophy and science of mindfulness
• **Maintain balance** - Don't let practice become another source of stress

**Overcoming Common Obstacles:**
**Lack of Time:**
**Challenge:** "I don't have time to practice mindfulness."
**Solutions:**
• **Start with micro-practices** - 1-2 minutes throughout the day
• **Integrate into existing activities** - Mindful walking, eating, or commuting
• **Use waiting time** - Practice while waiting in line or for appointments
• **Wake up 10 minutes earlier** - Dedicate time before your day begins
• **Combine with other activities** - Mindful exercise or household chores

**Restlessness and Boredom:**
**Challenge:** "I can't sit still or I get bored during practice."
**Solutions:**
• **Try movement practices** - Walking meditation, mindful yoga, or tai chi
• **Use guided meditations** - Audio recordings to provide structure
• **Vary your techniques** - Switch between different mindfulness practices
• **Set shorter sessions** - Start with 5 minutes and gradually increase
• **Focus on curiosity** - Approach practice with interest and wonder

**Sleepiness:**
**Challenge:** "I keep falling asleep during meditation."
**Solutions:**
• **Practice at a different time** - When you're more alert
• **Sit up straight** - Maintain an upright, alert posture
• **Open your eyes slightly** - Soft gaze downward
• **Try walking meditation** - Movement can help maintain alertness
• **Get adequate sleep** - Address underlying sleep issues

**Self-Judgment:**
**Challenge:** "I'm not doing it right or I'm not making progress."
**Solutions:**
• **Remember there's no perfect practice** - Each session is valuable
• **Focus on intention** - The effort to practice is what matters
• **Practice self-compassion** - Be kind to yourself during difficulties
• **Celebrate small victories** - Notice moments of awareness and presence
• **Trust the process** - Benefits often come gradually and subtly

**Lack of Motivation:**
**Challenge:** "I don't feel motivated to practice regularly."
**Solutions:**
• **Connect with your why** - Remember your original intentions
• **Start small** - Commit to just 1 minute daily
• **Find accountability** - Practice with a friend or join a group
• **Notice benefits** - Pay attention to how practice improves your life
• **Be flexible** - Adapt your practice to your current circumstances

**Integrating Practice into Daily Life:**
**Mindful Moments Throughout the Day:**
• **Morning intention** - Set a quality you want to bring to your day
• **Mindful transitions** - Pause between activities to reset
• **Gratitude practice** - Notice and appreciate small moments
• **Mindful communication** - Listen fully and speak with intention
• **Evening reflection** - Review your day with kindness and learning

**Creating Mindful Habits:**
• **Link to existing habits** - Practice after brushing teeth or before meals
• **Use environmental cues** - Place reminders in your environment
• **Set phone reminders** - Gentle alerts to practice mindfulness
• **Create mindful spaces** - Designate areas for brief practice
• **Practice with others** - Family, friends, or community groups

**Measuring Progress:**
**Subtle Indicators of Progress:**
• **Increased awareness** - Noticing thoughts, emotions, and sensations
• **Better stress management** - Responding rather than reacting
• **Improved relationships** - More present and compassionate communication
• **Enhanced well-being** - Greater peace, joy, and contentment
• **Physical benefits** - Better sleep, reduced tension, improved health

**Tracking Your Practice:**
• **Keep a practice journal** - Note sessions, experiences, and insights
• **Use mindfulness apps** - Track sessions and progress
• **Regular reflection** - Weekly or monthly review of your practice
• **Notice patterns** - What works well? What's challenging?
• **Celebrate milestones** - Acknowledge your commitment and progress

**Building Community and Support:**
**Finding Like-Minded People:**
• **Join meditation groups** - Local or online communities
• **Attend workshops** - Learn from experienced teachers
• **Connect with friends** - Share your practice with others
• **Participate in retreats** - Immersive experiences to deepen practice
• **Join online forums** - Connect with practitioners worldwide

**Supporting Others:**
• **Share your experience** - Offer insights and encouragement
• **Practice together** - Meditate with family or friends
• **Teach informally** - Guide others in simple mindfulness practices
• **Create mindful environments** - Support mindfulness in your community
• **Be a role model** - Demonstrate mindful living through your actions

**Long-Term Sustainability:**
**Adapting to Life Changes:**
• **Be flexible** - Modify your practice as circumstances change
• **Maintain core practices** - Keep fundamental techniques even during busy times
• **Find new opportunities** - Discover mindfulness in new situations
• **Seek support** - Reach out to teachers or community during difficult times
• **Trust the process** - Remember that practice is a lifelong journey

**Continuing Education:**
• **Read books** - Explore different perspectives and approaches
• **Attend courses** - Learn from experienced teachers
• **Study the science** - Understand the research behind mindfulness
• **Explore traditions** - Learn about different mindfulness traditions
• **Practice regularly** - Consistent practice is the best teacher

**Remember:** **Mindfulness is a journey, not a destination.** Each moment of practice strengthens your awareness and brings you closer to greater peace, wisdom, and compassion. Be patient with yourself, trust the process, and celebrate every step along the way.`,
    pages: 12
  }
];

export default function MindfulLivingGuide() {
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
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#23242b' }]}>Mindful Living Guide</Text>
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
