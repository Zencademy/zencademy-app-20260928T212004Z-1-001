import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../components/ThemeContext';
import { useXP } from '../../components/XPContext';
import { getCategoryQuestions, getRandomQuestions } from '../../utils/logicGames';

const { width, height } = Dimensions.get('window');

interface CategoryCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string[];
  questionCount: number;
}

const categories: CategoryCard[] = [
  {
    id: 'pattern',
    title: 'Pattern Recognition',
    description: 'Găsește pattern-urile în secvențe',
    icon: 'grid-outline',
    color: '#4FC3F7',
    gradient: ['#4FC3F7', '#29B6F6'],
    questionCount: 3,
  },
  {
    id: 'deductive',
    title: 'Deductive Reasoning',
    description: 'Raționament logic și deducții',
    icon: 'bulb-outline',
    color: '#FF9800',
    gradient: ['#FF9800', '#F57C00'],
    questionCount: 2,
  },
  {
    id: 'mathematical',
    title: 'Mathematical Logic',
    description: 'Probleme matematice și ecuații',
    icon: 'calculator-outline',
    color: '#4CAF50',
    gradient: ['#4CAF50', '#388E3C'],
    questionCount: 2,
  },
  {
    id: 'spatial',
    title: 'Spatial Logic',
    description: 'Logica spațială și geometrică',
    icon: 'cube-outline',
    color: '#9C27B0',
    gradient: ['#9C27B0', '#7B1FA2'],
    questionCount: 2,
  },
  {
    id: 'verbal',
    title: 'Verbal Logic',
    description: 'Logica verbală și relații',
    icon: 'chatbubbles-outline',
    color: '#E91E63',
    gradient: ['#E91E63', '#C2185B'],
    questionCount: 2,
  },
];

export default function LogicGamesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { addXP, incrementCompletedGame } = useXP();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryPress = (category: CategoryCard) => {
    setSelectedCategory(category.id);
    
    // Check if category has questions
    const questions = getCategoryQuestions(category.title);
    if (questions.length === 0) {
      Alert.alert('În curând!', 'Această categorie va fi disponibilă în curând.');
      return;
    }

    // Navigate to game
    router.push({
      pathname: '/logic-game',
      params: { 
        category: category.id,
        categoryName: category.title,
        questionCount: category.questionCount.toString()
      }
    });
  };

  const handleQuickPlay = () => {
    const questions = getRandomQuestions(5);
    if (questions.length === 0) {
      Alert.alert('Eroare', 'Nu sunt întrebări disponibile momentan.');
      return;
    }

    router.push({
      pathname: '/logic-game',
      params: { 
        category: 'quick',
        categoryName: 'Quick Play',
        questionCount: '5'
      }
    });
  };

  const handleDailyChallenge = () => {
    Alert.alert('În curând!', 'Provocarea zilnică va fi disponibilă în curând.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={theme.isDark ? [theme.background, theme.surface] : ['#f8f9fa', '#e9ecef']}
        style={styles.background}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.surface }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Jocuri de Logică</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickPlayButton}
              onPress={handleQuickPlay}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.quickPlayGradient}
              >
                <Ionicons name="play" size={24} color="white" />
                <Text style={styles.quickPlayText}>Quick Play</Text>
                <Text style={styles.quickPlaySubtext}>5 întrebări aleatorii</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dailyButton}
              onPress={handleDailyChallenge}
            >
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.dailyGradient}
              >
                <Ionicons name="trophy" size={24} color="white" />
                <Text style={styles.dailyText}>Provocarea Zilnică</Text>
                <Text style={styles.dailySubtext}>În curând</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <View style={styles.categoriesSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Categorii</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Alege o categorie pentru a începe
            </Text>

            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={category.gradient}
                  style={styles.categoryGradient}
                >
                  <View style={styles.categoryIconContainer}>
                    <Ionicons name={category.icon as any} size={32} color="white" />
                  </View>
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Text style={styles.categoryDescription}>
                      {category.description}
                    </Text>
                    <View style={styles.categoryMeta}>
                      <View style={styles.questionCount}>
                        <Ionicons name="help-circle-outline" size={16} color="white" />
                        <Text style={styles.questionCountText}>
                          {category.questionCount} întrebări
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stats Preview */}
          <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Statistici</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                <Ionicons name="trophy-outline" size={24} color="#FF9800" />
                <Text style={[styles.statNumber, { color: theme.text }]}>0</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Jocuri Câștigate</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                <Ionicons name="bulb-outline" size={24} color="#4CAF50" />
                <Text style={[styles.statNumber, { color: theme.text }]}>0</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Răspunsuri Corecte</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                <Ionicons name="time-outline" size={24} color="#2196F3" />
                <Text style={[styles.statNumber, { color: theme.text }]}>0</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Timp Total</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                <Ionicons name="star-outline" size={24} color="#9C27B0" />
                <Text style={[styles.statNumber, { color: theme.text }]}>0</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Scor Mediu</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 15,
    marginVertical: 20,
  },
  quickPlayButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickPlayGradient: {
    padding: 20,
    alignItems: 'center',
  },
  quickPlayText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  quickPlaySubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  dailyButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dailyGradient: {
    padding: 20,
    alignItems: 'center',
  },
  dailyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  dailySubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  categoriesSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  categoryCard: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionCountText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  statsSection: {
    marginVertical: 20,
    marginBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 50) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
