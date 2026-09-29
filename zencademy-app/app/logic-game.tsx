import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useXP } from '../components/XPContext';
import {
    LogicQuestion,
    calculateScore,
    getCategoryQuestions,
    getHint,
    getRandomQuestions,
    getXPForQuestion,
} from '../utils/logicGames';

const { width, height } = Dimensions.get('window');

export default function LogicGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addXP, incrementCompletedGame } = useXP();

  const [questions, setQuestions] = useState<LogicQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const category = params.category as string;
  const categoryName = params.categoryName as string;
  const questionCount = parseInt(params.questionCount as string) || 5;

  useEffect(() => {
    loadQuestions();
    animateIn();
  }, []);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadQuestions = () => {
    let gameQuestions: LogicQuestion[];
    
    if (category === 'quick') {
      gameQuestions = getRandomQuestions(questionCount);
    } else {
      gameQuestions = getCategoryQuestions(categoryName);
      if (gameQuestions.length > questionCount) {
        gameQuestions = gameQuestions.slice(0, questionCount);
      }
    }

    setQuestions(gameQuestions);
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    // Calculate XP
    const xpGained = getXPForQuestion(isCorrect, hintsUsed);
    addXP(xpGained);

    // Show result
    setTimeout(() => {
      setShowExplanation(true);
    }, 1000);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCurrentHintIndex(0);
    setShowHint(false);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      animateIn();
    } else {
      handleGameComplete();
    }
  };

  const handleGameComplete = () => {
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    const finalScore = calculateScore(score, questions.length, hintsUsed);
    
    setGameCompleted(true);

    // Update stats
    incrementCompletedGame({
      category: categoryName,
      difficulty: 'medium'
    });

    // Show results
    Alert.alert(
      'Joc Terminat!',
      `Scor: ${finalScore}%\nRăspunsuri corecte: ${score}/${questions.length}\nHinturi folosite: ${hintsUsed}\nTimp: ${timeSpent}s`,
      [
        {
          text: 'Înapoi la Meniu',
          onPress: () => router.back(),
        },
        {
          text: 'Joacă Din Nou',
          onPress: () => {
            setGameCompleted(false);
            setCurrentQuestionIndex(0);
            setScore(0);
            setHintsUsed(0);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setCurrentHintIndex(0);
            setShowHint(false);
            setShowExplanation(false);
            loadQuestions();
            animateIn();
          },
        },
      ]
    );
  };

  const handleHint = () => {
    if (currentHintIndex < currentQuestion.hints.length) {
      setCurrentHintIndex(currentHintIndex + 1);
      setHintsUsed(hintsUsed + 1);
      setShowHint(true);
    }
  };

  const getAnswerStyle = (answerIndex: number) => {
    if (!isAnswered) {
      return selectedAnswer === answerIndex ? styles.selectedAnswer : styles.answer;
    }

    if (answerIndex === currentQuestion.correctAnswer) {
      return styles.correctAnswer;
    }

    if (selectedAnswer === answerIndex && answerIndex !== currentQuestion.correctAnswer) {
      return styles.wrongAnswer;
    }

    return styles.answer;
  };

  const getAnswerIcon = (answerIndex: number) => {
    if (!isAnswered) return null;

    if (answerIndex === currentQuestion.correctAnswer) {
      return <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />;
    }

    if (selectedAnswer === answerIndex && answerIndex !== currentQuestion.correctAnswer) {
      return <Ionicons name="close-circle" size={24} color="#F44336" />;
    }

    return null;
  };

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Se încarcă întrebările...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.categoryTitle}>{categoryName}</Text>
            <Text style={styles.progressText}>
              {currentQuestionIndex + 1} / {questions.length}
            </Text>
          </View>

          <View style={styles.scoreContainer}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          </View>

          {/* Answers */}
          <View style={styles.answersContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={getAnswerStyle(index)}
                onPress={() => handleAnswerSelect(index)}
                disabled={isAnswered}
              >
                <View style={styles.answerContent}>
                  <Text style={styles.answerText}>{option}</Text>
                  {getAnswerIcon(index)}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Hint Button */}
          <TouchableOpacity
            style={styles.hintButton}
            onPress={handleHint}
            disabled={isAnswered || currentHintIndex >= currentQuestion.hints.length}
          >
            <Ionicons name="bulb-outline" size={20} color="white" />
            <Text style={styles.hintButtonText}>
              Hint ({currentQuestion.hints.length - currentHintIndex} rămase)
            </Text>
          </TouchableOpacity>

          {/* Current Hint */}
          {showHint && (
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>
                {getHint(currentQuestion, currentHintIndex - 1)}
              </Text>
            </View>
          )}

          {/* Next Button */}
          {isAnswered && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextQuestion}
            >
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  {currentQuestionIndex + 1 < questions.length ? 'Următoarea Întrebare' : 'Termină Jocul'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Explanation Modal */}
        <Modal
          visible={showExplanation}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.explanationModal}>
              <Text style={styles.explanationTitle}>Explicație</Text>
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowExplanation(false)}
              >
                <Text style={styles.closeButtonText}>Închide</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  background: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerInfo: {
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  questionContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    lineHeight: 26,
  },
  answersContainer: {
    marginBottom: 20,
  },
  answer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedAnswer: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  correctAnswer: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  wrongAnswer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F44336',
  },
  answerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  answerText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 25,
    marginBottom: 15,
  },
  hintButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  hintContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  nextButton: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  nextButtonGradient: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  explanationModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    margin: 20,
    maxWidth: width - 40,
  },
  explanationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  explanationText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#667eea',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
