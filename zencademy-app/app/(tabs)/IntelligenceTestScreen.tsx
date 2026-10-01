import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Animated,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useXP } from "../../components/XPContext";
import { useTheme } from "../../components/ThemeContext";

type QuestionType = "verbal" | "logical" | "mathematical" | "spatial" | "memory" | "pattern";
type Question = {
  type: QuestionType;
  question: string;
  choices: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
};

type TestResult = {
  totalScore: number;
  maxScore: number;
  iqEstimate: number;
  percentile: number;
  categoryScores: { [key in QuestionType]: number };
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
};

const QUESTIONS: Question[] = [
  // VERBAL REASONING (8 questions)
  {
    type: "verbal",
    question: "Which word is most similar in meaning to 'Eloquent'?",
    choices: ["Articulate", "Quiet", "Confused", "Simple"],
    correctAnswer: 0,
    explanation: "Eloquent means fluent or persuasive in speaking, which is most similar to 'articulate'.",
    difficulty: "medium",
    category: "Verbal Reasoning"
  },
  {
    type: "verbal",
    question: "Complete the analogy: Book is to Reading as Fork is to:",
    choices: ["Cooking", "Eating", "Kitchen", "Food"],
    correctAnswer: 1,
    explanation: "A book is used for reading, just as a fork is used for eating.",
    difficulty: "easy",
    category: "Verbal Reasoning"
  },
  {
    type: "verbal",
    question: "If all Roses are Flowers, and some Flowers are Red, then:",
    choices: ["All Roses are Red", "Some Roses are Red", "No Roses are Red", "Cannot be determined"],
    correctAnswer: 1,
    explanation: "Since all roses are flowers and some flowers are red, it follows that some roses are red.",
    difficulty: "hard",
    category: "Verbal Reasoning"
  },
  {
    type: "verbal",
    question: "Which word means the opposite of 'Benevolent'?",
    choices: ["Kind", "Generous", "Malevolent", "Charitable"],
    correctAnswer: 2,
    explanation: "Benevolent means kind and generous, so the opposite is malevolent (evil).",
    difficulty: "medium",
    category: "Verbal Reasoning"
  },
  {
    type: "verbal",
    question: "Complete: Doctor is to Patient as Teacher is to:",
    choices: ["School", "Student", "Classroom", "Education"],
    correctAnswer: 1,
    explanation: "A doctor helps patients, just as a teacher helps students.",
    difficulty: "easy",
    category: "Verbal Reasoning"
  },
  {
    type: "verbal",
    question: "Which word doesn't belong: Wisdom, Knowledge, Intelligence, Ignorance?",
    choices: ["Wisdom", "Knowledge", "Intelligence", "Ignorance"],
    correctAnswer: 3,
    explanation: "Ignorance is the opposite of the other three positive qualities.",
    difficulty: "medium",
    category: "Verbal Reasoning"
  },
  {
    type: "verbal",
    question: "If 'PEN' is to 'INK' as 'PAPER' is to:",
    choices: ["Write", "Print", "Words", "Pencil"],
    correctAnswer: 2,
    explanation: "A pen contains ink, just as paper contains words.",
    difficulty: "hard",
    category: "Verbal Reasoning"
  },
  {
    type: "verbal",
    question: "Which word is a synonym for 'Perseverance'?",
    choices: ["Patience", "Determination", "Happiness", "Success"],
    correctAnswer: 1,
    explanation: "Perseverance means persistence and determination in doing something.",
    difficulty: "medium",
    category: "Verbal Reasoning"
  },

  // LOGICAL REASONING (8 questions)
  {
    type: "logical",
    question: "Which number comes next: 2, 6, 12, 20, 30, ?",
    choices: ["40", "42", "44", "46"],
    correctAnswer: 1,
    explanation: "The pattern adds 4, then 6, then 8, then 10, so next is +12: 30+12=42.",
    difficulty: "medium",
    category: "Logical Reasoning"
  },
  {
    type: "logical",
    question: "If A=1, B=2, C=3, what does CAB equal?",
    choices: ["123", "312", "321", "213"],
    correctAnswer: 2,
    explanation: "C=3, A=1, B=2, so CAB = 321.",
    difficulty: "easy",
    category: "Logical Reasoning"
  },
  {
    type: "logical",
    question: "Which figure completes the pattern? (Triangle, Square, Circle, Triangle, Square, ?)",
    choices: ["Triangle", "Square", "Circle", "Diamond"],
    correctAnswer: 2,
    explanation: "The pattern repeats: Triangle, Square, Circle.",
    difficulty: "medium",
    category: "Logical Reasoning"
  },
  {
    type: "logical",
    question: "If all cats are animals, and some animals are pets, then:",
    choices: ["All cats are pets", "Some cats are pets", "No cats are pets", "Cannot be determined"],
    correctAnswer: 1,
    explanation: "Since all cats are animals and some animals are pets, some cats are pets.",
    difficulty: "easy",
    category: "Logical Reasoning"
  },
  {
    type: "logical",
    question: "Which number is missing: 3, 7, 15, 31, ?",
    choices: ["47", "63", "55", "59"],
    correctAnswer: 1,
    explanation: "Each number is doubled and add 1: 31×2+1=63.",
    difficulty: "hard",
    category: "Logical Reasoning"
  },
  {
    type: "logical",
    question: "If RED=27, BLUE=32, what does GREEN equal?",
    choices: ["55", "59", "62", "65"],
    correctAnswer: 1,
    explanation: "Count letters: R(18)+E(5)+D(4)=27, B(2)+L(12)+U(21)+E(5)=40, G(7)+R(18)+E(5)+E(5)+N(14)=49.",
    difficulty: "hard",
    category: "Logical Reasoning"
  },
  {
    type: "logical",
    question: "Which shape comes next: Circle, Square, Triangle, Circle, Square, ?",
    choices: ["Triangle", "Circle", "Square", "Diamond"],
    correctAnswer: 0,
    explanation: "The pattern repeats: Circle, Square, Triangle.",
    difficulty: "easy",
    category: "Logical Reasoning"
  },
  {
    type: "logical",
    question: "If today is Monday, what day was it 3 days ago?",
    choices: ["Friday", "Saturday", "Sunday", "Thursday"],
    correctAnswer: 0,
    explanation: "3 days before Monday is Friday.",
    difficulty: "medium",
    category: "Logical Reasoning"
  },

  // MATHEMATICAL REASONING (8 questions)
  {
    type: "mathematical",
    question: "What is 15% of 80?",
    choices: ["10", "12", "15", "18"],
    correctAnswer: 1,
    explanation: "15% of 80 = 0.15 × 80 = 12.",
    difficulty: "easy",
    category: "Mathematical Reasoning"
  },
  {
    type: "mathematical",
    question: "If 3x + 7 = 22, what is x?",
    choices: ["3", "5", "7", "9"],
    correctAnswer: 1,
    explanation: "3x + 7 = 22 → 3x = 15 → x = 5.",
    difficulty: "medium",
    category: "Mathematical Reasoning"
  },
  {
    type: "mathematical",
    question: "What is the next number: 2, 4, 8, 16, 32, ?",
    choices: ["48", "64", "56", "60"],
    correctAnswer: 1,
    explanation: "Each number is multiplied by 2: 32 × 2 = 64.",
    difficulty: "medium",
    category: "Mathematical Reasoning"
  },
  {
    type: "mathematical",
    question: "What is 25% of 120?",
    choices: ["25", "30", "35", "40"],
    correctAnswer: 1,
    explanation: "25% of 120 = 0.25 × 120 = 30.",
    difficulty: "easy",
    category: "Mathematical Reasoning"
  },
  {
    type: "mathematical",
    question: "If 2x - 5 = 11, what is x?",
    choices: ["6", "7", "8", "9"],
    correctAnswer: 2,
    explanation: "2x - 5 = 11 → 2x = 16 → x = 8.",
    difficulty: "medium",
    category: "Mathematical Reasoning"
  },
  {
    type: "mathematical",
    question: "What is the sum of the first 10 even numbers?",
    choices: ["90", "100", "110", "120"],
    correctAnswer: 2,
    explanation: "2+4+6+8+10+12+14+16+18+20 = 110.",
    difficulty: "hard",
    category: "Mathematical Reasoning"
  },
  {
    type: "mathematical",
    question: "If a rectangle has length 8 and width 6, what is its area?",
    choices: ["14", "28", "48", "56"],
    correctAnswer: 2,
    explanation: "Area = length × width = 8 × 6 = 48.",
    difficulty: "easy",
    category: "Mathematical Reasoning"
  },
  {
    type: "mathematical",
    question: "What is the next number: 1, 3, 7, 15, 31, ?",
    choices: ["47", "63", "55", "59"],
    correctAnswer: 1,
    explanation: "Each number is doubled and add 1: 31×2+1=63.",
    difficulty: "hard",
    category: "Mathematical Reasoning"
  },

  // SPATIAL REASONING (8 questions)
  {
    type: "spatial",
    question: "If you fold a cube, which pattern could it NOT be?",
    choices: ["Cross pattern", "T-pattern", "L-pattern", "All are possible"],
    correctAnswer: 3,
    explanation: "Not all patterns can form a cube when folded.",
    difficulty: "hard",
    category: "Spatial Reasoning"
  },
  {
    type: "spatial",
    question: "Which direction is opposite to North-East?",
    choices: ["North-West", "South-East", "South-West", "East"],
    correctAnswer: 2,
    explanation: "South-West is directly opposite to North-East.",
    difficulty: "easy",
    category: "Spatial Reasoning"
  },
  {
    type: "spatial",
    question: "If you rotate a square 90° clockwise, what happens?",
    choices: ["It becomes a rectangle", "It stays the same", "It becomes a diamond", "It disappears"],
    correctAnswer: 1,
    explanation: "A square looks the same when rotated 90°.",
    difficulty: "medium",
    category: "Spatial Reasoning"
  },
  {
    type: "spatial",
    question: "Which shape has the most sides?",
    choices: ["Triangle", "Square", "Pentagon", "Hexagon"],
    correctAnswer: 3,
    explanation: "Hexagon has 6 sides, the most among the options.",
    difficulty: "easy",
    category: "Spatial Reasoning"
  },
  {
    type: "spatial",
    question: "If you mirror the letter 'E', what do you get?",
    choices: ["E", "Ǝ", "3", "M"],
    correctAnswer: 1,
    explanation: "Mirroring 'E' horizontally gives 'Ǝ'.",
    difficulty: "medium",
    category: "Spatial Reasoning"
  },
  {
    type: "spatial",
    question: "Which 3D shape has 6 faces, all squares?",
    choices: ["Pyramid", "Cube", "Cylinder", "Sphere"],
    correctAnswer: 1,
    explanation: "A cube has 6 square faces.",
    difficulty: "easy",
    category: "Spatial Reasoning"
  },
  {
    type: "spatial",
    question: "If you fold a piece of paper in half twice, how many layers do you have?",
    choices: ["2", "3", "4", "5"],
    correctAnswer: 2,
    explanation: "First fold: 2 layers, second fold: 4 layers.",
    difficulty: "medium",
    category: "Spatial Reasoning"
  },
  {
    type: "spatial",
    question: "Which direction is between North and East?",
    choices: ["North-East", "North-West", "South-East", "South-West"],
    correctAnswer: 0,
    explanation: "North-East is between North and East.",
    difficulty: "easy",
    category: "Spatial Reasoning"
  },

  // MEMORY (8 questions)
  {
    type: "memory",
    question: "Memorize this sequence: X7K9M",
    choices: ["X7K9M", "X9K7M", "M9K7X", "K7X9M"],
    correctAnswer: 0,
    explanation: "The correct sequence is X7K9M.",
    difficulty: "easy",
    category: "Memory"
  },
  {
    type: "memory",
    question: "Remember this pattern: Blue, Red, Green, Yellow",
    choices: ["Blue, Red, Green, Yellow", "Red, Blue, Yellow, Green", "Green, Blue, Red, Yellow", "Yellow, Green, Red, Blue"],
    correctAnswer: 0,
    explanation: "The correct order is Blue, Red, Green, Yellow.",
    difficulty: "medium",
    category: "Memory"
  },
  {
    type: "memory",
    question: "Memorize: 8-4-2-1-5",
    choices: ["8-4-2-1-5", "5-1-2-4-8", "8-2-4-1-5", "1-5-8-4-2"],
    correctAnswer: 0,
    explanation: "The correct sequence is 8-4-2-1-5.",
    difficulty: "medium",
    category: "Memory"
  },
  {
    type: "memory",
    question: "Remember: Apple, Banana, Cherry, Date",
    choices: ["Apple, Banana, Cherry, Date", "Banana, Apple, Date, Cherry", "Cherry, Date, Apple, Banana", "Date, Cherry, Banana, Apple"],
    correctAnswer: 0,
    explanation: "The correct order is Apple, Banana, Cherry, Date.",
    difficulty: "easy",
    category: "Memory"
  },
  {
    type: "memory",
    question: "Memorize: 3-7-1-9-4",
    choices: ["3-7-1-9-4", "4-9-1-7-3", "3-1-7-9-4", "9-4-3-7-1"],
    correctAnswer: 0,
    explanation: "The correct sequence is 3-7-1-9-4.",
    difficulty: "medium",
    category: "Memory"
  },
  {
    type: "memory",
    question: "Remember: Dog, Cat, Bird, Fish",
    choices: ["Dog, Cat, Bird, Fish", "Cat, Dog, Fish, Bird", "Bird, Fish, Dog, Cat", "Fish, Bird, Cat, Dog"],
    correctAnswer: 0,
    explanation: "The correct order is Dog, Cat, Bird, Fish.",
    difficulty: "easy",
    category: "Memory"
  },
  {
    type: "memory",
    question: "Memorize: 5-2-8-6-1",
    choices: ["5-2-8-6-1", "1-6-8-2-5", "5-8-2-6-1", "8-1-5-2-6"],
    correctAnswer: 0,
    explanation: "The correct sequence is 5-2-8-6-1.",
    difficulty: "medium",
    category: "Memory"
  },
  {
    type: "memory",
    question: "Remember: Sun, Moon, Star, Planet",
    choices: ["Sun, Moon, Star, Planet", "Moon, Sun, Planet, Star", "Star, Planet, Sun, Moon", "Planet, Star, Moon, Sun"],
    correctAnswer: 0,
    explanation: "The correct order is Sun, Moon, Star, Planet.",
    difficulty: "easy",
    category: "Memory"
  },

  // PATTERN RECOGNITION (8 questions)
  {
    type: "pattern",
    question: "What comes next: 1, 3, 6, 10, 15, ?",
    choices: ["18", "20", "21", "25"],
    correctAnswer: 2,
    explanation: "Add 2, then 3, then 4, then 5, so next is +6: 15+6=21.",
    difficulty: "hard",
    category: "Pattern Recognition"
  },
  {
    type: "pattern",
    question: "Complete: A, C, E, G, ?",
    choices: ["H", "I", "J", "K"],
    correctAnswer: 1,
    explanation: "Skip one letter: A→C→E→G→I.",
    difficulty: "easy",
    category: "Pattern Recognition"
  },
  {
    type: "pattern",
    question: "What's the rule: 2, 6, 18, 54, ?",
    choices: ["108", "162", "216", "324"],
    correctAnswer: 1,
    explanation: "Multiply by 3 each time: 54 × 3 = 162.",
    difficulty: "medium",
    category: "Pattern Recognition"
  },
  {
    type: "pattern",
    question: "What comes next: 1, 4, 9, 16, 25, ?",
    choices: ["30", "36", "40", "49"],
    correctAnswer: 1,
    explanation: "These are perfect squares: 1², 2², 3², 4², 5², so next is 6²=36.",
    difficulty: "medium",
    category: "Pattern Recognition"
  },
  {
    type: "pattern",
    question: "Complete: 2, 4, 8, 16, 32, ?",
    choices: ["48", "64", "56", "60"],
    correctAnswer: 1,
    explanation: "Each number is multiplied by 2: 32×2=64.",
    difficulty: "easy",
    category: "Pattern Recognition"
  },
  {
    type: "pattern",
    question: "What's the pattern: 1, 3, 7, 15, 31, ?",
    choices: ["47", "63", "55", "59"],
    correctAnswer: 1,
    explanation: "Each number is doubled and add 1: 31×2+1=63.",
    difficulty: "hard",
    category: "Pattern Recognition"
  },
  {
    type: "pattern",
    question: "Complete: 1, 2, 4, 7, 11, ?",
    choices: ["14", "15", "16", "17"],
    correctAnswer: 2,
    explanation: "Add 1, then 2, then 3, then 4, so next is +5: 11+5=16.",
    difficulty: "medium",
    category: "Pattern Recognition"
  },
  {
    type: "pattern",
    question: "What comes next: 3, 6, 12, 24, 48, ?",
    choices: ["72", "96", "84", "90"],
    correctAnswer: 1,
    explanation: "Each number is multiplied by 2: 48×2=96.",
    difficulty: "easy",
    category: "Pattern Recognition"
  }
];

const TIMERS = {
  easy: 30,
  medium: 45,
  hard: 60
};

const CATEGORY_LABELS = {
  verbal: "Verbal Reasoning",
  logical: "Logical Reasoning",
  mathematical: "Mathematical Reasoning",
  spatial: "Spatial Reasoning",
  memory: "Memory",
  pattern: "Pattern Recognition"
};

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function calculateIQ(score: number, maxScore: number): number {
  // Simplified IQ calculation based on percentile
  const percentile = (score / maxScore) * 100;
  if (percentile >= 98) return 130 + Math.floor((percentile - 98) * 2);
  if (percentile >= 90) return 120 + Math.floor((percentile - 90) * 1.25);
  if (percentile >= 75) return 110 + Math.floor((percentile - 75) * 0.8);
  if (percentile >= 50) return 100 + Math.floor((percentile - 50) * 0.4);
  if (percentile >= 25) return 90 + Math.floor((percentile - 25) * 0.4);
  if (percentile >= 10) return 80 + Math.floor((percentile - 10) * 0.67);
  return 70 + Math.floor(percentile * 1.43);
}

function generateRecommendations(result: TestResult): string[] {
  const recommendations: string[] = [];
  
  // General recommendations based on overall score
  if (result.totalScore < result.maxScore * 0.6) {
    recommendations.push("Practice regularly with brain training exercises");
    recommendations.push("Focus on improving your weakest areas");
  } else if (result.totalScore < result.maxScore * 0.8) {
    recommendations.push("Continue challenging yourself with complex problems");
    recommendations.push("Try puzzles and logic games to maintain sharpness");
  } else {
    recommendations.push("Excellent performance! Keep challenging yourself");
    recommendations.push("Consider teaching others to reinforce your skills");
  }

  // Specific recommendations based on category scores
  Object.entries(result.categoryScores).forEach(([category, score]) => {
    const maxCategoryScore = QUESTIONS.filter(q => q.type === category).length;
    const percentage = (score / maxCategoryScore) * 100;
    
    if (percentage < 60) {
      switch (category) {
        case "verbal":
          recommendations.push("Read more books and practice vocabulary exercises");
          break;
        case "logical":
          recommendations.push("Solve logic puzzles and practice deductive reasoning");
          break;
        case "mathematical":
          recommendations.push("Practice mental math and work on mathematical concepts");
          break;
        case "spatial":
          recommendations.push("Try 3D puzzles and spatial reasoning games");
          break;
        case "memory":
          recommendations.push("Practice memory techniques like chunking and visualization");
          break;
        case "pattern":
          recommendations.push("Work on pattern recognition exercises and sequences");
          break;
      }
    }
  });

  return recommendations.slice(0, 5); // Limit to 5 recommendations
}

export default function IntelligenceTestScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { addXP } = useXP();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timer, setTimer] = useState(45);

  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [progress] = useState(new Animated.Value(1));
  const [questionOrder] = useState(() => {
    // Create a balanced selection of questions from all categories
    const questionsPerCategory = 2; // 2 questions per category
    const totalQuestions = 12; // 6 categories × 2 questions each
    
    const selectedQuestions: number[] = [];
    
    // Get questions by category
    const questionsByCategory: { [key in QuestionType]: number[] } = {
      verbal: QUESTIONS.map((q, i) => q.type === 'verbal' ? i : -1).filter(i => i !== -1),
      logical: QUESTIONS.map((q, i) => q.type === 'logical' ? i : -1).filter(i => i !== -1),
      mathematical: QUESTIONS.map((q, i) => q.type === 'mathematical' ? i : -1).filter(i => i !== -1),
      spatial: QUESTIONS.map((q, i) => q.type === 'spatial' ? i : -1).filter(i => i !== -1),
      memory: QUESTIONS.map((q, i) => q.type === 'memory' ? i : -1).filter(i => i !== -1),
      pattern: QUESTIONS.map((q, i) => q.type === 'pattern' ? i : -1).filter(i => i !== -1)
    };
    
    // Randomly select questions from each category
    Object.values(questionsByCategory).forEach(categoryQuestions => {
      const shuffledCategory = shuffle([...categoryQuestions]);
      selectedQuestions.push(...shuffledCategory.slice(0, questionsPerCategory));
    });
    
    // Shuffle the final selection for complete randomness
    return shuffle(selectedQuestions);
  });

  const currentQ = currentQuestion < 12 ? QUESTIONS[questionOrder[currentQuestion]] : null;

  useEffect(() => {
    if (currentQuestion >= 12) {
      console.log('Reached end of test, calculating results...');
      // Use setTimeout to avoid useInsertionEffect warning
      setTimeout(() => {
        calculateResults();
      }, 0);
      return;
    }

    if (!currentQ) return;

    const timeLimit = TIMERS[currentQ.difficulty];
    setTimer(timeLimit);
    progress.setValue(1);

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const progressInterval = setInterval(() => {
      progress.setValue(timer / timeLimit);
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [currentQuestion]);

  const handleTimeout = () => {
    if (selectedAnswer === null && currentQ) {
      setAnswers(prev => ({ ...prev, [currentQuestion]: -1 }));
      nextQuestion();
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || !currentQ) return;
    
    setSelectedAnswer(answerIndex);
    setAnswers(prev => ({ ...prev, [currentQuestion]: answerIndex }));
    
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    if (currentQuestion < 11) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      console.log('Test completed, moving to results...');
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const calculateResults = () => {
    let totalScore = 0;
    const categoryScores: { [key in QuestionType]: number } = {
      verbal: 0,
      logical: 0,
      mathematical: 0,
      spatial: 0,
      memory: 0,
      pattern: 0
    };

    // Calculate scores
    Object.entries(answers).forEach(([questionIndex, answerIndex]) => {
      const question = QUESTIONS[questionOrder[parseInt(questionIndex)]];
      if (answerIndex === question.correctAnswer) {
        totalScore++;
        categoryScores[question.type]++;
      }
    });

    const maxScore = 12;
    const iqEstimate = calculateIQ(totalScore, maxScore);
    const percentile = Math.round((totalScore / maxScore) * 100);

    // Determine strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    Object.entries(categoryScores).forEach(([category, score]) => {
      const maxCategoryScore = QUESTIONS.filter(q => q.type === category).length;
      const percentage = (score / maxCategoryScore) * 100;
      
      if (percentage >= 80) {
        strengths.push(CATEGORY_LABELS[category as QuestionType]);
      } else if (percentage <= 40) {
        weaknesses.push(CATEGORY_LABELS[category as QuestionType]);
      }
    });

    const result: TestResult = {
      totalScore,
      maxScore,
      iqEstimate,
      percentile,
      categoryScores,
      recommendations: [],
      strengths,
      weaknesses
    };

    result.recommendations = generateRecommendations(result);
    
    // Award XP based on performance
    const xpEarned = Math.round((totalScore / maxScore) * 100) + 50; // Base 50 XP + bonus for performance
    addXP(xpEarned);
    
    // Use requestAnimationFrame to avoid useInsertionEffect warning
    requestAnimationFrame(() => {
      setTestResult(result);
      setShowResults(true);
    });
    
    console.log('Results calculated successfully:', result);
    console.log('XP earned:', xpEarned);
  };

  const getIQLevel = (iq: number): string => {
    if (iq >= 130) return "Very Superior";
    if (iq >= 120) return "Superior";
    if (iq >= 110) return "Above Average";
    if (iq >= 90) return "Average";
    if (iq >= 80) return "Below Average";
    return "Needs Improvement";
  };

  const getScoreColor = (score: number, max: number): string => {
    const percentage = (score / max) * 100;
    if (percentage >= 90) return "#22c55e";
    if (percentage >= 75) return "#3b82f6";
    if (percentage >= 60) return "#f59e0b";
    return "#ef4444";
  };

  if (showResults && testResult) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: theme.surface }]}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Test Results</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Score Card */}
          <View style={[styles.scoreCard, { backgroundColor: theme.card }]}>
            <View style={styles.scoreHeader}>
              <Ionicons name="trophy" size={48} color="#fbbf24" />
              <Text style={[styles.scoreTitle, { color: theme.text }]}>Assessment complete</Text>
            </View>
            
            <View style={styles.scoreDisplay}>
              <Text style={[styles.scoreNumber, { color: theme.text }]}>{testResult.totalScore}</Text>
              <Text style={[styles.scoreMax, { color: theme.textSecondary }]}>/ {testResult.maxScore}</Text>
            </View>

            <View style={[styles.iqSection, { borderTopColor: theme.border }]}>
              <Text style={[styles.iqLabel, { color: theme.textSecondary }]}>Estimated IQ</Text>
              <Text style={[styles.iqScore, { color: getScoreColor(testResult.totalScore, testResult.maxScore) }]}>
                {testResult.iqEstimate}
              </Text>
              <Text style={[styles.iqLevel, { color: theme.text }]}>{getIQLevel(testResult.iqEstimate)}</Text>
              <Text style={[styles.percentile, { color: theme.textSecondary }]}>{testResult.percentile}th percentile</Text>
            </View>
          </View>

          {/* Category Breakdown */}
          <View style={[styles.categorySection, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Performance by Category</Text>
            {Object.entries(testResult.categoryScores).map(([category, score]) => {
              const maxCategoryScore = QUESTIONS.filter(q => q.type === category).length;
              const percentage = (score / maxCategoryScore) * 100;
              
              return (
                <View key={category} style={styles.categoryRow}>
                  <Text style={[styles.categoryName, { color: theme.text }]}>{CATEGORY_LABELS[category as QuestionType]}</Text>
                  <View style={styles.categoryScore}>
                    <Text style={[styles.categoryScoreText, { color: theme.text }]}>{score}/{maxCategoryScore}</Text>
                    <View style={[styles.progressBar, { backgroundColor: theme.surface }]}>
                      <Animated.View 
                        style={[
                          styles.progressFill,
                          { 
                            width: `${percentage}%`,
                            backgroundColor: getScoreColor(score, maxCategoryScore)
                          }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Strengths & Weaknesses */}
          <View style={styles.analysisSection}>
            {testResult.strengths.length > 0 && (
              <View style={[styles.strengthCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.analysisTitle, { color: theme.text }]}>Your Strengths</Text>
                {testResult.strengths.map((strength, index) => (
                  <View key={index} style={styles.analysisItem}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                    <Text style={[styles.analysisText, { color: theme.textSecondary }]}>{strength}</Text>
                  </View>
                ))}
              </View>
            )}

            {testResult.weaknesses.length > 0 && (
              <View style={[styles.weaknessCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.analysisTitle, { color: theme.text }]}>Areas for Improvement</Text>
                {testResult.weaknesses.map((weakness, index) => (
                  <View key={index} style={styles.analysisItem}>
                    <Ionicons name="alert-circle" size={20} color={theme.warning} />
                    <Text style={[styles.analysisText, { color: theme.textSecondary }]}>{weakness}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Recommendations */}
          <View style={[styles.recommendationsSection, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recommendations</Text>
            {testResult.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Ionicons name="bulb-outline" size={20} color={theme.info} />
                <Text style={[styles.recommendationText, { color: theme.textSecondary }]}>{recommendation}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.retakeButton, { backgroundColor: theme.primary }]}
                             onPress={() => {
                 setCurrentQuestion(0);
                 setAnswers({});
                 setSelectedAnswer(null);
                 setShowResults(false);
                 setTestResult(null);
               }}
            >
              <Text style={[styles.retakeButtonText, { color: theme.buttonText }]}>Retake Test</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.homeButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.homeButtonText, { color: theme.text }]}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.surface }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Cognitive Assessment</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress */}
      <View style={[styles.progressSection, { backgroundColor: theme.background }]}>
        <View style={styles.progressInfo}>
          <Text style={[styles.progressText, { color: theme.text }]}>Question {currentQuestion + 1} of 12</Text>
          <Text style={[styles.timerText, { color: theme.error }]}>{timer}s</Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: theme.surface }]}>
          <Animated.View 
            style={[styles.progressFill, { backgroundColor: theme.primary }, { width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%']
            }) }]} 
          />
        </View>
      </View>

      {/* Question Card */}
      {currentQ && (
        <View style={[styles.questionCard, { backgroundColor: theme.card }]}>
          <View style={styles.questionHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: theme.surface }]}>
              <Text style={[styles.categoryBadgeText, { color: theme.info }]}>{CATEGORY_LABELS[currentQ.type]}</Text>
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: theme.surface }]}>
              <Text style={[styles.difficultyBadgeText, { color: theme.warning }]}>{currentQ.difficulty.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={[styles.questionText, { color: theme.text }]}>{currentQ.question}</Text>

          {/* Answer Choices */}
          <View style={styles.choicesContainer}>
            {currentQ.choices.map((choice, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.choiceButton,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  selectedAnswer === index && index === currentQ.correctAnswer && { backgroundColor: theme.success + '20', borderColor: theme.success },
                  selectedAnswer === index && index !== currentQ.correctAnswer && { backgroundColor: theme.error + '20', borderColor: theme.error },
                  selectedAnswer !== null && index === currentQ.correctAnswer && { backgroundColor: theme.success + '20', borderColor: theme.success }
                ]}
                onPress={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
              >
                <Text style={[
                  styles.choiceText,
                  { color: theme.text },
                  selectedAnswer === index && index === currentQ.correctAnswer && { color: theme.success, fontWeight: '600' },
                  selectedAnswer === index && index !== currentQ.correctAnswer && { color: theme.error, fontWeight: '600' },
                  selectedAnswer !== null && index === currentQ.correctAnswer && { color: theme.success, fontWeight: '600' }
                ]}>
                  {String.fromCharCode(65 + index)}. {choice}
                </Text>
                {selectedAnswer === index && index === currentQ.correctAnswer && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                )}
                {selectedAnswer === index && index !== currentQ.correctAnswer && (
                  <Ionicons name="close-circle" size={24} color={theme.error} />
                )}
                {selectedAnswer !== null && index === currentQ.correctAnswer && selectedAnswer !== index && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Feedback */}
          {selectedAnswer !== null && (
            <View style={[
              styles.feedbackCard,
              selectedAnswer === currentQ.correctAnswer ? { backgroundColor: theme.success + '20', borderLeftColor: theme.success } : { backgroundColor: theme.error + '20', borderLeftColor: theme.error }
            ]}>
              <Text style={[styles.feedbackTitle, { color: selectedAnswer === currentQ.correctAnswer ? theme.success : theme.error }]}>
                {selectedAnswer === currentQ.correctAnswer ? "Correct!" : "Incorrect"}
              </Text>
              <Text style={[styles.feedbackText, { color: theme.textSecondary }]}>{currentQ.explanation}</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 14 : 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 44,
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
  },
  timerText: {
    fontSize: 16,
    fontWeight: "700",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  questionCard: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  difficultyBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 26,
    marginBottom: 24,
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
  },
  correctChoice: {
  },
  incorrectChoice: {
  },
  choiceText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  correctChoiceText: {
    fontWeight: "600",
  },
  incorrectChoiceText: {
    fontWeight: "600",
  },
  feedbackCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  correctFeedback: {
  },
  incorrectFeedback: {
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  resultsContainer: {
    paddingBottom: 40,
  },
  scoreCard: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  scoreHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
  },
  scoreDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 20,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: "800",
  },
  scoreMax: {
    fontSize: 24,
    fontWeight: "600",
    marginLeft: 4,
  },
  iqSection: {
    alignItems: "center",
    paddingTop: 20,
    borderTopWidth: 1,
  },
  iqLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  iqScore: {
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 4,
  },
  iqLevel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  percentile: {
    fontSize: 14,
  },
  categorySection: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  categoryScore: {
    alignItems: "flex-end",
    minWidth: 80,
  },
  categoryScoreText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  analysisSection: {
    margin: 20,
    gap: 16,
  },
  strengthCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  weaknessCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  analysisItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  recommendationsSection: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  actionButtons: {
    margin: 20,
    gap: 12,
  },
  retakeButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  homeButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
