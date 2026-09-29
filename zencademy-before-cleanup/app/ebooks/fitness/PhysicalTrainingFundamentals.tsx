import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const chapters = [
  {
    id: 1,
    title: "Introduction to Physical Training",
    content: `**Physical training** is the systematic process of developing physical fitness through structured exercise programs. It's the foundation for **building strength, endurance, flexibility, and overall health**.

**What is Physical Training?**
Physical training encompasses all forms of **structured physical activity** designed to improve fitness, performance, and health. It's not just about lifting weights or running - it's a comprehensive approach to developing your body's capabilities.

**Core Components of Physical Training:**
• **Strength Training** - Building muscle power and force production
• **Cardiovascular Training** - Improving heart and lung function
• **Flexibility Training** - Enhancing range of motion and mobility
• **Balance Training** - Developing stability and coordination
• **Endurance Training** - Building stamina and work capacity
• **Recovery Training** - Optimizing rest and regeneration

**Benefits of Physical Training:**
**Physical Benefits:**
• **Increased strength** and muscle mass
• **Improved cardiovascular health** and endurance
• **Enhanced flexibility** and mobility
• **Better body composition** and metabolism
• **Stronger bones** and joints
• **Improved immune function**

**Mental Benefits:**
• **Reduced stress** and anxiety
• **Enhanced mood** and mental clarity
• **Better sleep quality** and recovery
• **Increased confidence** and self-esteem
• **Improved focus** and concentration
• **Greater energy levels**

**Performance Benefits:**
• **Enhanced athletic performance** in sports
• **Better functional movement** for daily activities
• **Improved work capacity** and productivity
• **Reduced injury risk** through proper conditioning
• **Faster recovery** from physical demands
• **Increased longevity** and quality of life

**Training Principles:**
**Progressive Overload:**
• **Gradually increase** training intensity over time
• **Challenge your body** to adapt and improve
• **Track progress** and adjust accordingly
• **Avoid plateaus** through systematic progression
• **Maintain safety** while pushing limits

**Specificity:**
• **Train for your goals** - specific adaptations for specific needs
• **Match training** to desired outcomes
• **Consider sport-specific** requirements
• **Address individual** strengths and weaknesses
• **Focus on relevant** movement patterns

**Recovery:**
• **Allow adequate rest** between training sessions
• **Prioritize sleep** and nutrition for recovery
• **Listen to your body** and avoid overtraining
• **Include active recovery** and mobility work
• **Manage stress** and lifestyle factors

**Consistency:**
• **Maintain regular** training schedule
• **Build sustainable** habits and routines
• **Stay committed** to long-term goals
• **Adapt to life** changes and challenges
• **Focus on progress** over perfection

**Important:** **Physical training is a journey, not a destination.** Start with a solid foundation and build gradually. **Consistency and patience** are key to long-term success.`,
    pages: 6
  },
  {
    id: 2,
    title: "Strength Training Fundamentals",
    content: `**Strength training** is the foundation of physical development, focusing on building **muscular strength, power, and endurance**. It's essential for overall fitness and functional movement.

**What is Strength Training?**
Strength training involves **resistance exercises** designed to increase muscular strength and power. It can use bodyweight, free weights, machines, or other resistance modalities.

**Types of Strength Training:**
**Bodyweight Training:**
• **Push-ups** - Upper body pushing strength
• **Pull-ups** - Upper body pulling strength
• **Squats** - Lower body strength and stability
• **Lunges** - Unilateral leg strength and balance
• **Planks** - Core stability and endurance
• **Burpees** - Full body conditioning

**Free Weight Training:**
• **Barbell exercises** - Compound movements with heavy loads
• **Dumbbell exercises** - Unilateral and bilateral movements
• **Kettlebell training** - Dynamic and ballistic movements
• **Weighted carries** - Functional strength and stability
• **Olympic lifts** - Power and explosive strength
• **Accessory movements** - Isolation and corrective exercises

**Machine Training:**
• **Guided movements** for beginners and rehabilitation
• **Isolation exercises** for specific muscle groups
• **Safety features** for independent training
• **Consistent resistance** throughout range of motion
• **Easy progression** and load adjustment
• **Reduced skill requirement** for complex movements

**Core Strength Training Principles:**
**Compound Movements:**
• **Multi-joint exercises** that work multiple muscle groups
• **Functional movements** that mimic real-life activities
• **Efficient training** - more work in less time
• **Better hormonal response** and muscle growth
• **Improved coordination** and movement patterns
• **Reduced injury risk** through balanced development

**Progressive Overload:**
• **Gradually increase** weight, reps, or sets
• **Challenge your muscles** to adapt and grow
• **Track progress** and maintain training logs
• **Avoid plateaus** through systematic progression
• **Maintain proper form** while increasing load
• **Listen to your body** and avoid overtraining

**Exercise Selection:**
**Primary Movements:**
• **Squat variations** - Foundation of lower body strength
• **Deadlift variations** - Posterior chain development
• **Press variations** - Upper body pushing strength
• **Row variations** - Upper body pulling strength
• **Carry variations** - Functional strength and stability
• **Core variations** - Trunk stability and control

**Accessory Movements:**
• **Isolation exercises** for specific muscle groups
• **Corrective exercises** for movement imbalances
• **Mobility work** for range of motion
• **Stability training** for joint integrity
• **Recovery exercises** for active rest
• **Skill development** for complex movements

**Training Variables:**
**Volume (Sets x Reps):**
• **Strength focus** - 1-5 reps, 3-5 sets
• **Hypertrophy focus** - 6-12 reps, 3-4 sets
• **Endurance focus** - 12+ reps, 2-3 sets
• **Power focus** - 1-3 reps, 3-5 sets
• **Recovery focus** - Light weight, high reps

**Intensity (Load):**
• **Maximal strength** - 85-100% of 1RM
• **Strength-speed** - 70-85% of 1RM
• **Speed-strength** - 30-70% of 1RM
• **Endurance** - 30-60% of 1RM
• **Recovery** - 30-50% of 1RM

**Frequency:**
• **Beginner** - 2-3 sessions per week
• **Intermediate** - 3-4 sessions per week
• **Advanced** - 4-6 sessions per week
• **Elite** - 6+ sessions per week
• **Recovery** - 1-2 sessions per week

**Remember:** **Proper form is more important than heavy weight.** Focus on **quality movement** before increasing load. **Consistency and progression** are the keys to long-term strength development.`,
    pages: 8
  },
  {
    id: 3,
    title: "Cardiovascular Training",
    content: `**Cardiovascular training** focuses on improving **heart and lung function**, endurance, and overall aerobic capacity. It's essential for health, performance, and daily activities.

**What is Cardiovascular Training?**
Cardiovascular training involves **sustained physical activity** that elevates heart rate and breathing to improve aerobic fitness. It strengthens the heart, lungs, and circulatory system.

**Types of Cardiovascular Training:**
**Low-Intensity Steady State (LISS):**
• **Walking** - Accessible and low-impact
• **Light jogging** - Moderate intensity aerobic work
• **Cycling** - Low-impact leg conditioning
• **Swimming** - Full body, low-impact exercise
• **Rowing** - Upper and lower body conditioning
• **Elliptical** - Low-impact cardio option

**High-Intensity Interval Training (HIIT):**
• **Sprint intervals** - Maximum effort with recovery
• **Tabata protocol** - 20s work, 10s rest
• **Circuit training** - Multiple exercises in sequence
• **Fartlek training** - Variable intensity running
• **Battle ropes** - Upper body conditioning
• **Plyometric circuits** - Explosive movements

**Moderate-Intensity Continuous Training (MICT):**
• **Jogging** - Sustained moderate effort
• **Cycling** - Endurance building
• **Swimming** - Full body aerobic work
• **Rowing** - Total body conditioning
• **Hiking** - Outdoor endurance activity
• **Dancing** - Fun aerobic exercise

**Cardiovascular Training Zones:**
**Zone 1 - Recovery (50-60% HRmax):**
• **Active recovery** and regeneration
• **Improve recovery** between intense sessions
• **Build aerobic base** gradually
• **Reduce stress** and promote relaxation
• **Suitable for beginners** and recovery days

**Zone 2 - Aerobic Base (60-70% HRmax):**
• **Build aerobic endurance** and efficiency
• **Improve fat burning** and metabolism
• **Enhance recovery** capacity
• **Develop cardiovascular** health
• **Foundation for** higher intensity work

**Zone 3 - Aerobic Threshold (70-80% HRmax):**
• **Improve lactate threshold** and endurance
• **Build aerobic capacity** and efficiency
• **Enhance fat burning** and metabolism
• **Develop sustainable** pace for longer efforts
• **Bridge between** aerobic and anaerobic work

**Zone 4 - Anaerobic Threshold (80-90% HRmax):**
• **Improve lactate threshold** and tolerance
• **Build anaerobic capacity** and power
• **Enhance race pace** and performance
• **Develop mental toughness** and focus
• **High-intensity** training stimulus

**Zone 5 - Maximum Effort (90-100% HRmax):**
• **Improve maximum** aerobic capacity (VO2max)
• **Build anaerobic power** and speed
• **Enhance sprint** and burst performance
• **Develop mental** and physical limits
• **Short duration** maximum efforts

**Training Methods:**
**Long Slow Distance (LSD):**
• **Build aerobic base** and endurance
• **Improve fat burning** and metabolism
• **Enhance recovery** and regeneration
• **Develop mental** endurance and focus
• **Low stress** on joints and muscles

**Tempo Training:**
• **Improve lactate threshold** and tolerance
• **Build sustainable** race pace
• **Enhance mental** toughness and focus
• **Develop pacing** and rhythm
• **Moderate to high** intensity sustained effort

**Interval Training:**
• **Improve maximum** aerobic capacity
• **Build anaerobic** power and speed
• **Enhance recovery** between efforts
• **Develop mental** toughness and focus
• **High-intensity** work with recovery

**Fartlek Training:**
• **Variable intensity** training
• **Improve adaptability** and responsiveness
• **Enhance mental** engagement and focus
• **Develop pacing** and rhythm
• **Fun and varied** training approach

**Benefits of Cardiovascular Training:**
**Health Benefits:**
• **Stronger heart** and improved circulation
• **Better lung function** and oxygen delivery
• **Reduced risk** of heart disease and stroke
• **Improved blood pressure** and cholesterol
• **Enhanced immune function** and recovery
• **Better sleep quality** and stress management

**Performance Benefits:**
• **Increased endurance** and stamina
• **Improved recovery** between efforts
• **Enhanced fat burning** and metabolism
• **Better mental focus** and clarity
• **Increased energy levels** throughout day
• **Improved work capacity** and productivity

**Remember:** **Start with low intensity and build gradually.** Cardiovascular fitness develops over time with **consistent training**. **Listen to your body** and avoid overtraining.`,
    pages: 8
  },
  {
    id: 4,
    title: "Flexibility and Mobility",
    content: `**Flexibility and mobility** are essential components of physical fitness that **improve range of motion, reduce injury risk, and enhance performance**. They're often overlooked but crucial for long-term health and function.

**What is Flexibility and Mobility?**
**Flexibility** is the ability of muscles and connective tissues to lengthen, while **mobility** is the ability to move joints through their full range of motion with control and stability.

**Types of Flexibility Training:**
**Static Stretching:**
• **Hold positions** for 15-60 seconds
• **Improve muscle length** and flexibility
• **Reduce muscle tension** and soreness
• **Enhance relaxation** and recovery
• **Best performed** after exercise or warm-up
• **Focus on major** muscle groups

**Dynamic Stretching:**
• **Move through ranges** of motion actively
• **Improve joint mobility** and coordination
• **Enhance blood flow** and warm-up
• **Prepare body** for movement
• **Best performed** before exercise
• **Mimic movement** patterns

**PNF Stretching (Proprioceptive Neuromuscular Facilitation):**
• **Contract-relax** technique for deeper stretching
• **Improve flexibility** through neuromuscular facilitation
• **Enhance range** of motion more effectively
• **Require partner** or equipment assistance
• **Advanced technique** for experienced practitioners
• **Target specific** muscle groups

**Mobility Training:**
**Joint Mobility:**
• **Ankle mobility** - Essential for squatting and running
• **Hip mobility** - Critical for lower body movements
• **Thoracic spine mobility** - Important for upper body movements
• **Shoulder mobility** - Necessary for overhead movements
• **Wrist mobility** - Important for weight training
• **Cervical spine mobility** - Essential for daily activities

**Movement Patterns:**
• **Squat mobility** - Deep squat position and movement
• **Hinge mobility** - Deadlift and hip hinge patterns
• **Lunge mobility** - Unilateral leg movements
• **Push mobility** - Upper body pushing movements
• **Pull mobility** - Upper body pulling movements
• **Carry mobility** - Loaded movement patterns

**Common Mobility Issues:**
**Tight Hip Flexors:**
• **Caused by** prolonged sitting and inactivity
• **Affects** squat depth and hip hinge
• **Solutions** - Hip flexor stretches and activation
• **Prevention** - Regular movement and stretching
• **Impact** - Lower back pain and poor posture

**Limited Ankle Dorsiflexion:**
• **Caused by** poor footwear and limited movement
• **Affects** squat depth and running mechanics
• **Solutions** - Calf stretches and ankle mobility work
• **Prevention** - Barefoot movement and proper footwear
• **Impact** - Knee pain and poor movement patterns

**Tight Thoracic Spine:**
• **Caused by** poor posture and limited rotation
• **Affects** overhead movements and breathing
• **Solutions** - Thoracic extension and rotation work
• **Prevention** - Good posture and regular movement
• **Impact** - Shoulder pain and limited overhead range

**Poor Shoulder Mobility:**
• **Caused by** limited overhead movement and poor posture
• **Affects** pressing movements and daily activities
• **Solutions** - Shoulder mobility and stability work
• **Prevention** - Regular overhead movement and good posture
• **Impact** - Shoulder pain and limited function

**Mobility Training Methods:**
**Foam Rolling:**
• **Self-myofascial release** for muscle tension
• **Improve blood flow** and recovery
• **Reduce muscle soreness** and tightness
• **Enhance movement** quality and range
• **Pre-exercise** preparation and recovery
• **Target major** muscle groups

**Dynamic Movement:**
• **Active range** of motion exercises
• **Improve joint mobility** and coordination
• **Enhance movement** patterns and control
• **Prepare body** for exercise
• **Mimic sport-specific** movements
• **Build movement** confidence

**Static Stretching:**
• **Hold positions** for improved flexibility
• **Reduce muscle tension** and soreness
• **Enhance relaxation** and recovery
• **Improve muscle length** and range
• **Post-exercise** recovery and maintenance
• **Focus on tight** areas

**Benefits of Flexibility and Mobility:**
**Performance Benefits:**
• **Improved movement** quality and efficiency
• **Enhanced range** of motion for exercises
• **Better technique** and form in movements
• **Reduced injury risk** through proper movement
• **Enhanced recovery** and regeneration
• **Improved balance** and coordination

**Health Benefits:**
• **Reduced muscle tension** and soreness
• **Better posture** and alignment
• **Improved joint health** and function
• **Enhanced daily movement** and activities
• **Reduced pain** and discomfort
• **Better quality** of life

**Remember:** **Consistency is key** for flexibility and mobility improvements. **Start slowly** and progress gradually. **Listen to your body** and avoid forcing movements. **Make it part** of your daily routine.`,
    pages: 8
  },
  {
    id: 5,
    title: "Training Program Design",
    content: `**Training program design** is the systematic approach to **structuring workouts** for optimal results. A well-designed program considers individual goals, current fitness level, and available time.

**Components of Training Program Design:**
**Assessment and Goal Setting:**
• **Current fitness level** evaluation
• **Specific, measurable goals** definition
• **Timeline and milestones** establishment
• **Available time and resources** consideration
• **Individual preferences** and limitations
• **Health and injury history** review

**Exercise Selection:**
**Primary Movements:**
• **Squat variations** - Foundation of lower body strength
• **Deadlift variations** - Posterior chain development
• **Press variations** - Upper body pushing strength
• **Row variations** - Upper body pulling strength
• **Carry variations** - Functional strength and stability
• **Core variations** - Trunk stability and control

**Accessory Movements:**
• **Isolation exercises** for specific muscle groups
• **Corrective exercises** for movement imbalances
• **Mobility work** for range of motion
• **Stability training** for joint integrity
• **Recovery exercises** for active rest
• **Skill development** for complex movements

**Training Variables:**
**Volume (Sets x Reps):**
• **Strength focus** - 1-5 reps, 3-5 sets
• **Hypertrophy focus** - 6-12 reps, 3-4 sets
• **Endurance focus** - 12+ reps, 2-3 sets
• **Power focus** - 1-3 reps, 3-5 sets
• **Recovery focus** - Light weight, high reps

**Intensity (Load):**
• **Maximal strength** - 85-100% of 1RM
• **Strength-speed** - 70-85% of 1RM
• **Speed-strength** - 30-70% of 1RM
• **Endurance** - 30-60% of 1RM
• **Recovery** - 30-50% of 1RM

**Frequency:**
• **Beginner** - 2-3 sessions per week
• **Intermediate** - 3-4 sessions per week
• **Advanced** - 4-6 sessions per week
• **Elite** - 6+ sessions per week
• **Recovery** - 1-2 sessions per week

**Program Structure:**
**Full Body Training:**
• **All major movements** in each session
• **Efficient use** of training time
• **Good for beginners** and time-limited individuals
• **High frequency** of movement patterns
• **Balanced development** of all areas
• **Easy to implement** and follow

**Upper/Lower Split:**
• **Separate upper and lower** body sessions
• **Allow adequate recovery** between sessions
• **Good for intermediate** level trainees
• **Focus on specific** areas each session
• **Manageable volume** per session
• **Flexible scheduling** options

**Push/Pull/Legs Split:**
• **Organized by movement** patterns
• **Allow specific focus** on movement types
• **Good for intermediate** to advanced trainees
• **Manageable volume** per session
• **Adequate recovery** between similar movements
• **Balanced development** of all areas

**Body Part Split:**
• **Focus on specific** muscle groups
• **High volume** for specific areas
• **Good for advanced** bodybuilding focus
• **Require careful** recovery management
• **Time-intensive** training approach
• **Specific goal** oriented

**Progression Methods:**
**Linear Progression:**
• **Increase weight** each session
• **Simple and effective** for beginners
• **Clear progression** path
• **Easy to track** and implement
• **Limited by** recovery capacity
• **Good for** initial strength gains

**Wave Loading:**
• **Increase weight** within session
• **Multiple sets** at different intensities
• **Good for intermediate** to advanced trainees
• **Manage fatigue** and maintain quality
• **Complex progression** system
• **Require careful** planning

**Periodization:**
• **Systematic variation** of training variables
• **Manage fatigue** and optimize performance
• **Good for advanced** trainees and athletes
• **Complex planning** and implementation
• **Require experience** and knowledge
• **Optimize long-term** development

**Recovery and Regeneration:**
**Active Recovery:**
• **Light exercise** to promote recovery
• **Improve blood flow** and nutrient delivery
• **Reduce muscle soreness** and stiffness
• **Maintain movement** patterns and skills
• **Mental break** from intense training
• **Part of overall** training program

**Rest Days:**
• **Complete rest** from structured training
• **Allow full recovery** and adaptation
• **Mental break** from training stress
• **Focus on other** life activities
• **Essential for** long-term progress
• **Prevent overtraining** and burnout

**Remember:** **Start simple and progress gradually.** A well-designed program should be **sustainable and enjoyable**. **Consistency and patience** are more important than complexity. **Listen to your body** and adjust as needed.`,
    pages: 8
  },
  {
    id: 6,
    title: "Nutrition for Training",
    content: `**Nutrition is the foundation** of physical training success. **Proper fueling** supports performance, recovery, and adaptation to training stress.

**Macronutrients for Training:**
**Protein:**
• **Building blocks** for muscle tissue
• **Support muscle** growth and repair
• **Enhance recovery** between sessions
• **Maintain muscle** mass during training
• **Support immune** function and health
• **Recommended intake** - 1.6-2.2g per kg body weight

**Carbohydrates:**
• **Primary fuel** for high-intensity exercise
• **Support glycogen** stores in muscles and liver
• **Enhance performance** during training
• **Support recovery** and adaptation
• **Maintain blood** glucose levels
• **Recommended intake** - 3-7g per kg body weight

**Fats:**
• **Essential for** hormone production
• **Support cell** membrane function
• **Provide energy** for low-intensity exercise
• **Enhance absorption** of fat-soluble vitamins
• **Support brain** and nervous system function
• **Recommended intake** - 0.8-1.2g per kg body weight

**Meal Timing:**
**Pre-Workout Nutrition:**
• **2-3 hours before** - Complete meal with protein, carbs, and fats
• **1-2 hours before** - Light snack with carbs and protein
• **30-60 minutes before** - Simple carbs for quick energy
• **15-30 minutes before** - Sports drink or simple carbs
• **Focus on** easily digestible foods
• **Avoid high-fat** or high-fiber foods

**During Workout Nutrition:**
• **Workouts under 60 minutes** - Usually not necessary
• **Workouts 60-90 minutes** - Consider sports drink
• **Workouts over 90 minutes** - Carbohydrate supplementation
• **High-intensity sessions** - May benefit from carbs
• **Focus on** hydration and electrolytes
• **Avoid heavy** or hard-to-digest foods

**Post-Workout Nutrition:**
• **Within 30 minutes** - Protein and carbohydrates
• **2:1 or 3:1 ratio** of carbs to protein
• **20-30g protein** for muscle repair
• **30-60g carbohydrates** for glycogen replenishment
• **Include fluids** for rehydration
• **Complete meal** within 2 hours

**Hydration:**
**Daily Hydration:**
• **Drink water** throughout the day
• **Monitor urine color** - pale yellow is ideal
• **Consider body weight** and activity level
• **Include electrolytes** for longer sessions
• **Avoid excessive** fluid intake
• **Listen to thirst** signals

**Exercise Hydration:**
• **Pre-hydration** - 16-20oz 2-4 hours before
• **During exercise** - 6-12oz every 15-20 minutes
• **Post-exercise** - Replace fluid losses
• **Monitor sweat rate** and adjust accordingly
• **Include electrolytes** for sessions over 60 minutes
• **Avoid over-hydration** and hyponatremia

**Supplements:**
**Protein Supplements:**
• **Whey protein** - Fast-absorbing, complete protein
• **Casein protein** - Slow-absorbing, sustained release
• **Plant proteins** - Vegan options (pea, rice, hemp)
• **Convenient** post-workout option
• **Support muscle** growth and recovery
• **Not essential** if meeting needs through food

**Creatine:**
• **Improve strength** and power output
• **Enhance muscle** growth and recovery
• **Safe and effective** for most people
• **5g daily** maintenance dose
• **Loading phase** optional (20g for 5-7 days)
• **Best taken** with carbohydrates

**Multivitamins:**
• **Fill nutritional gaps** in diet
• **Support overall** health and function
• **Not replace** whole foods
• **Consider individual** needs and deficiencies
• **Quality matters** - choose reputable brands
• **Consult healthcare** provider if needed

**Omega-3 Fatty Acids:**
• **Support heart** and brain health
• **Reduce inflammation** and support recovery
• **Improve joint** health and function
• **1-3g daily** of EPA/DHA
• **Fish oil** or algae-based options
• **Consider quality** and purity

**Practical Nutrition Tips:**
**Meal Planning:**
• **Plan meals** and snacks in advance
• **Prepare food** in batches for convenience
• **Include variety** for nutrient diversity
• **Consider timing** around training sessions
• **Keep healthy** options readily available
• **Listen to hunger** and fullness cues

**Grocery Shopping:**
• **Shop perimeter** for whole foods
• **Read labels** and ingredient lists
• **Choose minimally** processed options
• **Buy seasonal** and local when possible
• **Plan meals** before shopping
• **Avoid shopping** when hungry

**Eating Out:**
• **Choose restaurants** with healthy options
• **Look for grilled** or baked preparations
• **Ask for modifications** to meet needs
• **Control portions** and avoid overeating
• **Stay hydrated** with water
• **Enjoy occasionally** without guilt

**Remember:** **Nutrition supports training, not replaces it.** **Consistency and quality** matter more than perfection. **Individual needs** vary - experiment and find what works for you. **Whole foods** should be the foundation of your nutrition plan.`,
    pages: 8
  }
];

export default function PhysicalTrainingFundamentals() {
  const router = useRouter();
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [lineSpacing, setLineSpacing] = useState(1.6);

  const totalPages = chapters.reduce((sum, chapter) => sum + chapter.pages, 0);
  const currentChapterData = chapters[currentChapter];

  const nextPage = () => {
    if (currentPage < currentChapterData.pages - 1) {
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
      setCurrentChapter(currentChapter - 1);
      setCurrentPage(chapters[currentChapter - 1].pages - 1);
    }
  };

  const getPageContent = () => {
    const content = currentChapterData.content;
    const wordsPerPage = 150; // Approximate words per page
    const words = content.split(' ');
    const startIndex = currentPage * wordsPerPage;
    const endIndex = startIndex + wordsPerPage;
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
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#23242b' }]}>Physical Training</Text>
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
                    width: `${((currentChapter * currentChapterData.pages + currentPage + 1) / totalPages) * 100}%`,
                    backgroundColor: isDarkMode ? '#ffd700' : '#23242b',
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              {currentChapter * currentChapterData.pages + currentPage + 1} of {totalPages} pages
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
              (currentChapter === chapters.length - 1 && currentPage === currentChapterData.pages - 1) && { opacity: 0.5 }
            ]}
            onPress={nextPage}
            disabled={currentChapter === chapters.length - 1 && currentPage === currentChapterData.pages - 1}
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
