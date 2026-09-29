import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useXP } from '../../components/XPContext';
import { useTheme } from '../../components/ThemeContext';
import { AppHeader } from '../../components/ui/AppHeader';
import { ebookCoinPrice } from '../../lib/progression';
import { BUYABLE_EBOOK_IDS, ebookPlanPrice } from '../../lib/ebookAccess';

type Ebook = {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  pages: number;
  rating: number;
  icon: React.ReactNode;
  isPremium: boolean;
  requiredLevel?: number;
  recommendedFor?: string[];
  status?: 'available' | 'under-development';
};

const ebooks: Ebook[] = [
  // WELLNESS & HEALTH
  {
    id: '1',
    title: 'Mindful Living Guide',
    author: 'Zencademy',
    description: 'A comprehensive guide to mindfulness and mental wellness.',
    category: 'Wellness',
    pages: 48, // Real page count based on content
    rating: 4.8,
    icon: <MaterialCommunityIcons name="meditation" size={32} color="#23242b" />,
    isPremium: false,
    requiredLevel: 5,
    status: 'available',
    recommendedFor: ['Focus Champion', 'Creative Visionary', 'Strategic Thinker']
  },
  {
    id: '2',
    title: 'Stress Management',
    author: 'Zencademy',
    description: 'Effective strategies for managing stress and anxiety.',
    category: 'Wellness',
    pages: 52, // Real page count based on content
    rating: 4.8,
    icon: <MaterialCommunityIcons name="leaf" size={32} color="#23242b" />,
    isPremium: false,
    requiredLevel: 8,
    status: 'available',
    recommendedFor: ['Quick Reactor', 'Focus Champion', 'Logic Guru']
  },
  {
    id: '3',
    title: 'Advanced Meditation Techniques',
    author: 'Zencademy',
    description: 'Deep meditation practices for experienced practitioners.',
    category: 'Wellness',
    pages: 58, // Real page count based on content
    rating: 4.9,
    icon: <MaterialCommunityIcons name="yoga" size={32} color="#23242b" />,
    isPremium: false,
    requiredLevel: 15,
    status: 'available',
    recommendedFor: ['Focus Champion', 'Strategic Thinker', 'Creative Visionary']
  },
  {
    id: '4',
    title: 'Mind-Body Connection',
    author: 'Zencademy',
    description: 'Understanding and strengthening the mind-body connection.',
    category: 'Wellness',
    pages: 48, // Real page count based on content
    rating: 4.7,
    icon: <MaterialCommunityIcons name="human-male-female" size={32} color="#23242b" />,
    isPremium: false,
    requiredLevel: 12,
    status: 'available',
    recommendedFor: ['Logic Guru', 'Pattern Pro', 'Strategic Thinker']
  },
  {
    id: '5',
    title: 'Holistic Health & Wellness',
    author: 'Zencademy',
    description: 'Complete guide to holistic health and wellness practices.',
    category: 'Wellness',
    pages: 56, // Real page count based on content
    rating: 4.8,
    icon: <MaterialCommunityIcons name="heart-pulse" size={32} color="#23242b" />,
    isPremium: false,
    requiredLevel: 18,
    status: 'available',
    recommendedFor: ['Strategic Thinker', 'Logic Guru', 'Focus Champion']
  },

  // FITNESS & PHYSICAL TRAINING
  {
    id: '6',
    title: 'Physical Training Fundamentals',
    author: 'Zencademy',
    description: 'Essential principles for building strength and endurance.',
    category: 'Fitness',
    pages: 0, // Under development
    rating: 4.9,
    icon: <MaterialCommunityIcons name="dumbbell" size={32} color="#23242b" />,
    isPremium: false,
    requiredLevel: 10,
    status: 'under-development',
    recommendedFor: ['Quick Reactor', 'Focus Champion', 'Strategic Thinker']
  },
  {
    id: '7',
    title: 'Elite Performance Training',
    author: 'Zencademy',
    description: 'Advanced training methods for peak physical performance.',
    category: 'Fitness',
    pages: 0, // Under development
    rating: 4.9,
    icon: <MaterialCommunityIcons name="weight-lifter" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 25,
    status: 'under-development',
    recommendedFor: ['Quick Reactor', 'Focus Champion', 'Strategic Thinker']
  },
  {
    id: '8',
    title: 'Nutrition Basics',
    author: 'Zencademy',
    description: 'Understanding nutrition for optimal health and performance.',
    category: 'Fitness',
    pages: 0, // Under development
    rating: 4.5,
    icon: <MaterialCommunityIcons name="food-apple" size={32} color="#23242b" />,
    isPremium: false,
    requiredLevel: 5,
    status: 'under-development',
    recommendedFor: ['Logic Guru', 'Strategic Thinker', 'Memory Master']
  },
  {
    id: '9',
    title: 'Advanced Nutrition Science',
    author: 'Zencademy',
    description: 'Deep dive into nutrition science and optimization.',
    category: 'Fitness',
    pages: 0, // Under development
    rating: 4.8,
    icon: <MaterialCommunityIcons name="flask" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 20,
    status: 'under-development',
    recommendedFor: ['Logic Guru', 'Pattern Pro', 'Memory Master']
  },

  // MENTAL & COGNITIVE
  {
    id: '10',
    title: 'Cognitive Enhancement',
    author: 'Zencademy',
    description: 'Techniques to improve memory, focus, and mental performance.',
    category: 'Mental',
    pages: 0, // Under development
    rating: 4.7,
    icon: <MaterialCommunityIcons name="brain" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 15,
    status: 'under-development',
    recommendedFor: ['Memory Master', 'Focus Champion', 'Logic Guru']
  },
  {
    id: '11',
    title: 'Mastering Focus & Concentration',
    author: 'Zencademy',
    description: 'Advanced techniques for laser-sharp focus and concentration.',
    category: 'Mental',
    pages: 0, // Under development
    rating: 4.8,
    icon: <MaterialCommunityIcons name="target" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 20,
    status: 'under-development',
    recommendedFor: ['Focus Champion', 'Strategic Thinker', 'Logic Guru']
  },
  {
    id: '12',
    title: 'Elite Mental Performance',
    author: 'Zencademy',
    description: 'Advanced cognitive enhancement for elite performance.',
    category: 'Mental',
    pages: 0, // Under development
    rating: 4.9,
    icon: <MaterialCommunityIcons name="lightning-bolt" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 30,
    status: 'under-development',
    recommendedFor: ['Quick Reactor', 'Logic Guru', 'Focus Champion']
  },
  {
    id: '13',
    title: 'Memory Mastery',
    author: 'Zencademy',
    description: 'Techniques to enhance memory and learning capabilities.',
    category: 'Mental',
    pages: 0, // Under development
    rating: 4.6,
    icon: <MaterialCommunityIcons name="memory" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 25,
    status: 'under-development',
    recommendedFor: ['Memory Master', 'Pattern Pro', 'Logic Guru']
  },

  // PRODUCTIVITY & PERSONAL DEVELOPMENT
  {
    id: '14',
    title: 'Daily Habits for Success',
    author: 'Zencademy',
    description: 'Building productive routines for personal growth.',
    category: 'Productivity',
    pages: 0, // Under development
    rating: 4.6,
    icon: <Feather name="check-circle" size={32} color="#23242b" />,
    isPremium: false,
    requiredLevel: 8,
    status: 'under-development',
    recommendedFor: ['Strategic Thinker', 'Focus Champion', 'Quick Reactor']
  },
  {
    id: '15',
    title: 'Time Management Mastery',
    author: 'Zencademy',
    description: 'Advanced productivity and time management strategies.',
    category: 'Productivity',
    pages: 0, // Under development
    rating: 4.7,
    icon: <MaterialCommunityIcons name="clock-outline" size={32} color="#23242b" />,
    isPremium: false,
    requiredLevel: 12,
    status: 'under-development',
    recommendedFor: ['Strategic Thinker', 'Focus Champion', 'Logic Guru']
  },
  {
    id: '16',
    title: 'Leadership & Influence',
    author: 'Zencademy',
    description: 'Developing leadership skills and personal influence.',
    category: 'Productivity',
    pages: 0, // Under development
    rating: 4.6,
    icon: <MaterialCommunityIcons name="account-group" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 25,
    status: 'under-development',
    recommendedFor: ['Strategic Thinker', 'Creative Visionary', 'Focus Champion']
  },
  {
    id: '17',
    title: 'Goal Setting & Achievement',
    author: 'Zencademy',
    description: 'Master the art of setting and achieving meaningful goals.',
    category: 'Productivity',
    pages: 0, // Under development
    rating: 4.7,
    icon: <MaterialCommunityIcons name="target" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 18,
    status: 'under-development',
    recommendedFor: ['Strategic Thinker', 'Focus Champion', 'Logic Guru']
  },

  // SCIENCE & TECHNOLOGY
  {
    id: '18',
    title: 'Quantum Physics Basics',
    author: 'Zencademy',
    description: 'Understanding the fundamental principles of quantum mechanics.',
    category: 'Science',
    pages: 0, // Under development
    rating: 4.8,
    icon: <MaterialCommunityIcons name="atom" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 35,
    status: 'under-development',
    recommendedFor: ['Logic Guru', 'Pattern Pro', 'Memory Master']
  },
  {
    id: '19',
    title: 'Artificial Intelligence Fundamentals',
    author: 'Zencademy',
    description: 'Introduction to AI, machine learning, and neural networks.',
    category: 'Technology',
    pages: 0, // Under development
    rating: 4.9,
    icon: <MaterialCommunityIcons name="robot" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 20,
    status: 'under-development',
    recommendedFor: ['Logic Guru', 'Pattern Pro', 'Creative Visionary']
  },
  {
    id: '20',
    title: 'Blockchain & Cryptocurrency',
    author: 'Zencademy',
    description: 'Understanding blockchain technology and digital currencies.',
    category: 'Technology',
    pages: 0, // Under development
    rating: 4.7,
    icon: <MaterialCommunityIcons name="bitcoin" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 18,
    status: 'under-development',
    recommendedFor: ['Logic Guru', 'Pattern Pro', 'Strategic Thinker']
  },
  {
    id: '21',
    title: 'Programming Fundamentals',
    author: 'Zencademy',
    description: 'Learn the basics of programming and software development.',
    category: 'Technology',
    pages: 0, // Under development
    rating: 4.8,
    icon: <MaterialCommunityIcons name="code-braces" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 15,
    status: 'under-development',
    recommendedFor: ['Logic Guru', 'Creative Visionary', 'Pattern Pro']
  },
  {
    id: '22',
    title: 'Data Science Essentials',
    author: 'Zencademy',
    description: 'Introduction to data analysis, statistics, and visualization.',
    category: 'Science',
    pages: 0, // Under development
    rating: 4.7,
    icon: <MaterialCommunityIcons name="chart-line" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 20,
    status: 'under-development',
    recommendedFor: ['Logic Guru', 'Pattern Pro', 'Memory Master']
  },

  // GENERAL KNOWLEDGE & EDUCATION
  {
    id: '23',
    title: 'World History Essentials',
    author: 'Zencademy',
    description: 'Key events and figures that shaped human civilization.',
    category: 'Education',
    pages: 0, // Under development
    rating: 4.6,
    icon: <MaterialCommunityIcons name="earth" size={32} color="#23242b" />,
    isPremium: false,
    requiredLevel: 5,
    status: 'under-development',
    recommendedFor: ['Memory Master', 'Pattern Pro', 'Strategic Thinker']
  },
  {
    id: '24',
    title: 'Philosophy for Modern Life',
    author: 'Zencademy',
    description: 'Ancient wisdom applied to contemporary challenges.',
    category: 'Education',
    pages: 0, // Under development
    rating: 4.8,
    icon: <MaterialCommunityIcons name="lightbulb" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 25,
    status: 'under-development',
    recommendedFor: ['Logic Guru', 'Creative Visionary', 'Strategic Thinker']
  },
  {
    id: '25',
    title: 'Economics Fundamentals',
    author: 'Zencademy',
    description: 'Understanding markets, money, and economic principles.',
    category: 'Education',
    pages: 0, // Under development
    rating: 4.7,
    icon: <MaterialCommunityIcons name="trending-up" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 15,
    status: 'under-development',
    recommendedFor: ['Logic Guru', 'Pattern Pro', 'Strategic Thinker']
  },
  {
    id: '26',
    title: 'Psychology Basics',
    author: 'Zencademy',
    description: 'Understanding human behavior and mental processes.',
    category: 'Science',
    pages: 0, // Under development
    rating: 4.8,
    icon: <MaterialCommunityIcons name="brain" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 18,
    status: 'under-development',
    recommendedFor: ['Pattern Pro', 'Memory Master', 'Logic Guru']
  },

  // BUSINESS & FINANCE
  {
    id: '27',
    title: 'Entrepreneurship Guide',
    author: 'Zencademy',
    description: 'Starting and growing successful businesses.',
    category: 'Business',
    pages: 0, // Under development
    rating: 4.8,
    icon: <MaterialCommunityIcons name="briefcase" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 30,
    status: 'under-development',
    recommendedFor: ['Strategic Thinker', 'Creative Visionary', 'Quick Reactor']
  },
  {
    id: '28',
    title: 'Personal Finance Mastery',
    author: 'Zencademy',
    description: 'Building wealth through smart financial decisions.',
    category: 'Business',
    pages: 0, // Under development
    rating: 4.7,
    icon: <MaterialCommunityIcons name="wallet" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 12,
    status: 'under-development',
    recommendedFor: ['Logic Guru', 'Strategic Thinker', 'Memory Master']
  },
  {
    id: '29',
    title: 'Investment Strategies',
    author: 'Zencademy',
    description: 'Understanding markets and building investment portfolios.',
    category: 'Business',
    pages: 0, // Under development
    rating: 4.9,
    icon: <MaterialCommunityIcons name="chart-line" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 35,
    status: 'under-development',
    recommendedFor: ['Logic Guru', 'Pattern Pro', 'Strategic Thinker']
  },

  // CREATIVITY & ARTS
  {
    id: '30',
    title: 'Creative Thinking',
    author: 'Zencademy',
    description: 'Unlocking creativity and innovative problem-solving.',
    category: 'Creativity',
    pages: 0, // Under development
    rating: 4.6,
    icon: <MaterialCommunityIcons name="palette" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 10,
    status: 'under-development',
    recommendedFor: ['Creative Visionary', 'Pattern Pro', 'Quick Reactor']
  },
  {
    id: '31',
    title: 'Digital Art Fundamentals',
    author: 'Zencademy',
    description: 'Creating digital artwork and visual content.',
    category: 'Creativity',
    pages: 0, // Under development
    rating: 4.7,
    icon: <MaterialCommunityIcons name="brush" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 15,
    status: 'under-development',
    recommendedFor: ['Creative Visionary', 'Focus Champion', 'Pattern Pro']
  },
  {
    id: '32',
    title: 'Writing Mastery',
    author: 'Zencademy',
    description: 'Developing powerful writing and communication skills.',
    category: 'Creativity',
    pages: 0, // Under development
    rating: 4.8,
    icon: <MaterialCommunityIcons name="pen" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 12,
    status: 'under-development',
    recommendedFor: ['Creative Visionary', 'Memory Master', 'Focus Champion']
  },

  // LIFESTYLE & RELATIONSHIPS
  {
    id: '33',
    title: 'Relationship Psychology',
    author: 'Zencademy',
    description: 'Building healthy and fulfilling relationships.',
    category: 'Lifestyle',
    pages: 0, // Under development
    rating: 4.7,
    icon: <MaterialCommunityIcons name="heart" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 15,
    status: 'under-development',
    recommendedFor: ['Pattern Pro', 'Memory Master', 'Creative Visionary']
  },
  {
    id: '34',
    title: 'Parenting Essentials',
    author: 'Zencademy',
    description: 'Effective parenting strategies for modern families.',
    category: 'Lifestyle',
    pages: 0, // Under development
    rating: 4.8,
    icon: <MaterialCommunityIcons name="baby-face" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 18,
    status: 'under-development',
    recommendedFor: ['Strategic Thinker', 'Memory Master', 'Focus Champion']
  },
  {
    id: '35',
    title: 'Minimalism & Decluttering',
    author: 'Zencademy',
    description: 'Simplifying life through intentional living.',
    category: 'Lifestyle',
    pages: 0, // Under development
    rating: 4.6,
    icon: <MaterialCommunityIcons name="home" size={32} color="#23242b" />,
    isPremium: false,
    requiredLevel: 8,
    status: 'under-development',
    recommendedFor: ['Focus Champion', 'Strategic Thinker', 'Logic Guru']
  },

  // SPIRITUALITY & PHILOSOPHY
  {
    id: '36',
    title: 'Spiritual Growth',
    author: 'Zencademy',
    description: 'Exploring spirituality and personal transformation.',
    category: 'Spirituality',
    pages: 0, // Under development
    rating: 4.8,
    icon: <MaterialCommunityIcons name="star" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 20,
    status: 'under-development',
    recommendedFor: ['Creative Visionary', 'Pattern Pro', 'Strategic Thinker']
  },
  {
    id: '37',
    title: 'Eastern Philosophy',
    author: 'Zencademy',
    description: 'Ancient wisdom from Eastern traditions.',
    category: 'Spirituality',
    pages: 0, // Under development
    rating: 4.7,
    icon: <MaterialCommunityIcons name="flower" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 18,
    status: 'under-development',
    recommendedFor: ['Creative Visionary', 'Memory Master', 'Pattern Pro']
  },
  {
    id: '38',
    title: 'Mindfulness in Daily Life',
    author: 'Zencademy',
    description: 'Integrating mindfulness into everyday activities.',
    category: 'Spirituality',
    pages: 0, // Under development
    rating: 4.6,
    icon: <MaterialCommunityIcons name="meditation" size={32} color="#23242b" />,
    isPremium: false,
    requiredLevel: 12,
    status: 'under-development',
    recommendedFor: ['Focus Champion', 'Creative Visionary', 'Strategic Thinker']
  },

  // ADVANCED SPECIALIZED TOPICS
  {
    id: '39',
    title: 'Neuroscience of Learning',
    author: 'Zencademy',
    description: 'How the brain learns and retains information.',
    category: 'Science',
    pages: 0, // Under development
    rating: 4.9,
    icon: <MaterialCommunityIcons name="brain" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 40,
    status: 'under-development',
    recommendedFor: ['Logic Guru', 'Memory Master', 'Pattern Pro']
  },
  {
    id: '40',
    title: 'Quantum Consciousness',
    author: 'Zencademy',
    description: 'Exploring consciousness through quantum physics.',
    category: 'Science',
    pages: 0, // Under development
    rating: 4.8,
    icon: <MaterialCommunityIcons name="atom" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 35,
    status: 'under-development',
    recommendedFor: ['Logic Guru', 'Creative Visionary', 'Pattern Pro']
  },
  {
    id: '41',
    title: 'Biohacking Fundamentals',
    author: 'Zencademy',
    description: 'Optimizing human performance through science.',
    category: 'Science',
    pages: 0, // Under development
    rating: 4.7,
    icon: <MaterialCommunityIcons name="flask" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 30,
    status: 'under-development',
    recommendedFor: ['Logic Guru', 'Quick Reactor', 'Focus Champion']
  },
  {
    id: '42',
    title: 'Future Technologies',
    author: 'Zencademy',
    description: 'Emerging technologies that will shape our future.',
    category: 'Technology',
    pages: 0, // Under development
    rating: 4.8,
    icon: <MaterialCommunityIcons name="rocket" size={32} color="#23242b" />,
    isPremium: true,
    requiredLevel: 25,
    status: 'under-development',
    recommendedFor: ['Creative Visionary', 'Logic Guru', 'Pattern Pro']
  },

  // PREMIUM EBOOKS (REQUIRE SHOP PURCHASE)
  {
    id: '43',
    title: 'Elite Performance Mastery',
    author: 'Zencademy',
    description: 'Comprehensive guide to achieving peak performance in all areas of life.',
    category: 'Premium',
    pages: 0, // Under development
    rating: 5.0,
    icon: <MaterialCommunityIcons name="crown" size={32} color="#ffd700" />,
    isPremium: true,
    requiredLevel: 50,
    status: 'under-development',
    recommendedFor: ['Strategic Thinker', 'Focus Champion', 'Quick Reactor']
  },
  {
    id: '44',
    title: 'Advanced Cognitive Enhancement',
    author: 'Zencademy',
    description: 'Cutting-edge techniques for supercharging your mental capabilities.',
    category: 'Premium',
    pages: 0, // Under development
    rating: 5.0,
    icon: <MaterialCommunityIcons name="brain" size={32} color="#ffd700" />,
    isPremium: true,
    requiredLevel: 60,
    status: 'under-development',
    recommendedFor: ['Logic Guru', 'Memory Master', 'Pattern Pro']
  },
  {
    id: '45',
    title: 'Creative Genius Unleashed',
    author: 'Zencademy',
    description: 'Unlock your creative potential and master innovative thinking.',
    category: 'Premium',
    pages: 0, // Under development
    rating: 5.0,
    icon: <MaterialCommunityIcons name="lightbulb" size={32} color="#ffd700" />,
    isPremium: true,
    requiredLevel: 45,
    status: 'under-development',
    recommendedFor: ['Creative Visionary', 'Pattern Pro', 'Quick Reactor']
  },
  {
    id: '46',
    title: 'Wealth Building Mastery',
    author: 'Zencademy',
    description: 'Complete system for building sustainable wealth and financial freedom.',
    category: 'Premium',
    pages: 0, // Under development
    rating: 5.0,
    icon: <MaterialCommunityIcons name="treasure-chest" size={32} color="#ffd700" />,
    isPremium: true,
    requiredLevel: 55,
    status: 'under-development',
    recommendedFor: ['Strategic Thinker', 'Logic Guru', 'Memory Master']
  },
  {
    id: '47',
    title: 'Life Transformation Blueprint',
    author: 'Zencademy',
    description: 'Complete roadmap for transforming every aspect of your life.',
    category: 'Premium',
    pages: 0, // Under development
    rating: 5.0,
    icon: <MaterialCommunityIcons name="star" size={32} color="#ffd700" />,
    isPremium: true,
    requiredLevel: 40,
    status: 'under-development',
    recommendedFor: ['Strategic Thinker', 'Creative Visionary', 'Focus Champion']
  }
];

const categories = [
  'All', 
  'Wellness', 
  'Fitness', 
  'Mental', 
  'Productivity', 
  'Science', 
  'Technology', 
  'Education', 
  'Business', 
  'Creativity', 
  'Lifestyle', 
  'Spirituality',
  'Premium'
];

export default function EbookScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { coins, ownedEbooks, purchaseEbook } = useXP();
  const PURCHASABLE = BUYABLE_EBOOK_IDS;

  const computeRequiredLevel = (ebook: Ebook): number => {
    const base = Math.max(1, Math.round(ebook.pages / 40));
    const premiumBoost = ebook.isPremium ? 10 : 0;
    const ratingBoost = ebook.rating >= 4.8 ? 4 : ebook.rating >= 4.6 ? 2 : 0;
    return Math.min(59, Math.max(1, base + premiumBoost + ratingBoost));
  };

  const normalizedEbooks = useMemo(() => (
    ebooks.map(e => ({ ...e, requiredLevel: computeRequiredLevel(e) }))
  ), []);

  const filteredEbooks = normalizedEbooks.filter(ebook => {
    const matchesCategory = selectedCategory === 'All' || ebook.category === selectedCategory;
    const matchesSearch = ebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ebook.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isOwned = (ebook: Ebook) => ownedEbooks.includes(ebook.id);
  /** Prefer catalog / access-plan prices for buyable titles. */
  const priceOf = (ebook: Ebook) => ebookPlanPrice(ebook.id) ?? ebookCoinPrice(ebook);

  const openEbook = (ebook: Ebook) => {
    if (ebook.status === 'under-development') {
      Alert.alert('Not ready', 'This title is still in production.');
      return;
    }
    switch (ebook.title) {
      case 'Mindful Living Guide':
        router.push('/ebooks/wellness/MindfulLivingGuide');
        break;
      case 'Stress Management':
        router.push('/ebooks/wellness/StressManagement');
        break;
      case 'Advanced Meditation Techniques':
        router.push('/ebooks/wellness/AdvancedMeditationTechniques');
        break;
      case 'Mind-Body Connection':
        router.push('/ebooks/wellness/MindBodyConnection');
        break;
      case 'Holistic Health & Wellness':
        router.push('/ebooks/wellness/HolisticHealthWellness');
        break;
      case 'Physical Training Fundamentals':
        router.push('/ebooks/fitness/PhysicalTrainingFundamentals');
        break;
      default:
        Alert.alert('Coming soon', 'This title is not live yet.');
    }
  };

  const handleEbookPress = async (ebook: Ebook) => {
    if (ebook.status === 'under-development') {
      Alert.alert('Not ready', 'This title is still in production.');
      return;
    }
    if (isOwned(ebook)) {
      openEbook(ebook);
      return;
    }
    if (!PURCHASABLE.has(ebook.id)) {
      Alert.alert('Coming soon', 'This title is not for sale yet.');
      return;
    }
    const price = priceOf(ebook);
    if (price == null) {
      Alert.alert('Unavailable', 'This title cannot be purchased.');
      return;
    }
    if (coins < price) {
      Alert.alert('Not enough coins', `Need ${price} coins. You have ${coins}.`);
      return;
    }
    if (busyId) return;
    setBusyId(ebook.id);
    try {
      await purchaseEbook(ebook.id, price);
      Alert.alert('Unlocked', 'Title added to your library.');
    } catch (error) {
      Alert.alert('Purchase failed', error instanceof Error ? error.message : 'Please retry.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppHeader
        onBack={() => router.back()}
        title="LIBRARY"
        showWallet
        onRight={() => setShowHelpModal(true)}
      />

      <View style={[styles.levelContainer, { borderBottomColor: theme.border }]}>
        <View style={[styles.levelBadge, { backgroundColor: theme.coinSoft, borderWidth: 1, borderColor: theme.coinBorder }]}>
          <Ionicons name="cash-outline" size={16} color={theme.coin} />
          <Text style={[styles.levelText, { color: theme.text }]}>{coins} coins · buy titles</Text>
        </View>
        <Text style={{ marginTop: 8, fontSize: 12, color: theme.textSecondary, lineHeight: 17 }}>
          Access plan: 5 live for coins now · more titles preview/planned without content yet. Owned stays unlocked.
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Feather name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
            <Text style={[styles.searchPlaceholder, { color: theme.textSecondary }]}>Search library...</Text>
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  selectedCategory === category && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  { color: theme.textSecondary },
                  selectedCategory === category && { color: theme.buttonText }
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.ebooksContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {selectedCategory === 'All' ? 'All Titles' : selectedCategory}
          </Text>

          {filteredEbooks.map((ebook) => {
            const owned = isOwned(ebook);
            const price = priceOf(ebook);
            const forSale = PURCHASABLE.has(ebook.id) && ebook.status === 'available';
            const locked = !owned && !forSale;
            return (
              <TouchableOpacity
                key={ebook.id}
                style={[
                  styles.ebookCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  locked && { opacity: 0.7, backgroundColor: theme.surface }
                ]}
                onPress={() => { void handleEbookPress(ebook); }}
                disabled={busyId === ebook.id}
              >
                <View style={styles.ebookHeader}>
                  <View style={[
                    styles.ebookIcon,
                    { backgroundColor: theme.surface },
                    locked && { backgroundColor: theme.border }
                  ]}>
                    {ebook.icon}
                  </View>
                  <View style={styles.badgeContainer}>
                    {ebook.isPremium && (
                      <View style={styles.premiumBadge}>
                        <Ionicons name="star" size={12} color="#fff" />
                      </View>
                    )}
                    {!owned && (
                      <View style={styles.lockBadge}>
                        <Ionicons name={forSale ? 'cash-outline' : 'lock-closed'} size={12} color="#fff" />
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.ebookContent}>
                  <Text style={[styles.ebookTitle, { color: theme.text }, locked && { color: theme.textSecondary }]}>{ebook.title}</Text>
                  <Text style={[styles.ebookAuthor, { color: theme.textSecondary }]}>by {ebook.author}</Text>
                  <Text style={[styles.ebookDescription, { color: theme.textSecondary }, locked && { color: theme.textTertiary }]} numberOfLines={2}>
                    {ebook.description}
                  </Text>

                  {ebook.status === 'under-development' && (
                    <View style={[styles.statusBadge, { backgroundColor: theme.warning }]}>
                      <Text style={[styles.statusBadgeText, { color: '#111' }]}>In production</Text>
                    </View>
                  )}

                  {ebook.recommendedFor && ebook.recommendedFor.length > 0 && (
                    <View style={styles.recommendationsContainer}>
                      <Text style={[styles.recommendationsTitle, { color: theme.text }]}>Best for:</Text>
                      <View style={styles.recommendationsList}>
                        {ebook.recommendedFor.slice(0, 2).map((mindType, index) => (
                          <View key={index} style={[styles.recommendationTag, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Text style={[styles.recommendationText, { color: theme.textSecondary }]}>{mindType}</Text>
                          </View>
                        ))}
                        {ebook.recommendedFor.length > 2 && (
                          <View style={[styles.recommendationTag, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Text style={[styles.recommendationText, { color: theme.textSecondary }]}>+{ebook.recommendedFor.length - 2} more</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  <View style={styles.ebookMeta}>
                    <View style={styles.metaItem}>
                      <Feather name="file-text" size={14} color={theme.textSecondary} />
                      <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                        {ebook.status === 'under-development' ? 'Soon' : `${ebook.pages} pages`}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="star" size={14} color={theme.coin} />
                      <Text style={[styles.metaText, { color: theme.textSecondary }]}>{ebook.rating}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="cash-outline" size={14} color={theme.coin} />
                      <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                        {owned ? 'Owned' : price != null ? `${price}c` : '—'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.ebookFooter}>
                    <View style={[styles.categoryTag, { backgroundColor: theme.surface }]}>
                      <Text style={[styles.categoryTagText, { color: theme.textSecondary }]}>{ebook.category}</Text>
                    </View>
                    {owned ? (
                      <TouchableOpacity style={[styles.readButton, { backgroundColor: theme.primary }]} onPress={() => openEbook(ebook)}>
                        <Text style={[styles.readButtonText, { color: theme.buttonText }]}>Open</Text>
                        <Feather name="arrow-right" size={16} color={theme.buttonText} />
                      </TouchableOpacity>
                    ) : forSale && price != null ? (
                      <TouchableOpacity
                        style={[styles.readButton, { backgroundColor: coins >= price ? theme.coin : theme.border }]}
                        onPress={() => { void handleEbookPress(ebook); }}
                        disabled={busyId === ebook.id}
                      >
                        <Text style={[styles.readButtonText, { color: coins >= price ? '#111' : theme.textSecondary }]}>
                          {busyId === ebook.id ? '...' : `${price} coins`}
                        </Text>
                        <Ionicons name="cash-outline" size={16} color={coins >= price ? '#111' : theme.textSecondary} />
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.lockButton, { backgroundColor: theme.border }]}>
                        <Text style={[styles.lockButtonText, { color: theme.textSecondary }]}>Soon</Text>
                        <Ionicons name="lock-closed" size={16} color={theme.textSecondary} />
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Modal visible={showHelpModal} transparent animationType="fade" onRequestClose={() => setShowHelpModal(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Library</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowHelpModal(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.helpSection}>
                <Text style={[styles.helpSectionTitle, { color: theme.text }]}>Coins unlock titles</Text>
                <Text style={[styles.helpText, { color: theme.textSecondary }]}>
                  XP is never spent here. Coins buy ebooks after training. Owned titles stay in your library.
                </Text>
              </View>
              <View style={styles.helpSection}>
                <Text style={[styles.helpSectionTitle, { color: theme.text }]}>Reading</Text>
                <Text style={[styles.helpText, { color: theme.textSecondary }]}>
                  Open owned titles anytime. Use filters to cut noise. Recommendations map to mind types.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  helpButton: {
    padding: 8,
    borderRadius: 8,
  },
  levelContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholder: {
    fontSize: 16,
    flex: 1,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryButtonActive: {
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
  },
  ebooksContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  ebookCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ebookCardLocked: {
    opacity: 0.6,
  },
  ebookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ebookIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ebookIconLocked: {
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  premiumBadge: {
    backgroundColor: '#ffd700',
    borderRadius: 12,
    padding: 4,
  },
  lockBadge: {
    backgroundColor: '#666',
    borderRadius: 12,
    padding: 4,
  },
  ebookContent: {
    flex: 1,
  },
  ebookTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  ebookTitleLocked: {
  },
  ebookAuthor: {
    fontSize: 14,
    marginBottom: 8,
  },
  ebookDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  ebookDescriptionLocked: {
  },
  ebookMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  ebookFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  readButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  lockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  lockButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recommendationsContainer: {
    marginBottom: 12,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  recommendationTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  recommendationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  helpSection: {
    marginBottom: 24,
  },
  helpSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 22,
  },
  highlightText: {
  },
});
