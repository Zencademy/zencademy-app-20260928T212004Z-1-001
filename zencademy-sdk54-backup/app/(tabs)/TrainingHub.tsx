import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../components/ThemeContext';

const width = Dimensions.get('window').width;

export default function TrainingHub() {
  const router = useRouter();
  const { theme } = useTheme();
  const isWide = width > 520;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header cu back & logo */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace('/')}
          activeOpacity={0.75}
        >
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.logo, { color: theme.text }]}>ZENCADEMY</Text>
      </View>

      <Text style={[styles.title, { color: theme.text }]}>Training Hub</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Elevate your mind and body. Choose your path.
      </Text>

      <View style={[
        styles.cardsRow,
        { flexDirection: isWide ? 'row' : 'column', gap: isWide ? 28 : 18 }
      ]}>
        {/* Mental Card */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push('/MentalTrainingScreen')}
          activeOpacity={0.89}
        >
          <View style={[styles.iconWrap, { backgroundColor: theme.surface }]}>
            <MaterialCommunityIcons name="brain" size={40} color={theme.text} />
          </View>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Mental</Text>
          <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
            Logic, memory, focus challenges.
          </Text>
        </TouchableOpacity>

        {/* Physical Card */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push('/PhysicalTrainingScreen')}
          activeOpacity={0.89}
        >
          <View style={[styles.iconWrap, { backgroundColor: theme.surface }]}>
            <Feather name="activity" size={38} color={theme.text} />
          </View>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Physical</Text>
          <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
            Movement, stretching, breathing.
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 38,
    paddingHorizontal: 26,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 18,
    marginTop: 2,
  },
  backBtn: {
    padding: 7,
    paddingLeft: 1,
    paddingRight: 9,
    borderRadius: 13,
    backgroundColor: 'transparent',
  },
  logo: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginLeft: 6,
    flex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    marginTop: 6,
    letterSpacing: 2,
    alignSelf: 'stretch',
  },
  subtitle: {
    fontSize: 16.5,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 30,
    alignSelf: 'stretch',
  },
  cardsRow: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 25,
    paddingVertical: 34,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#181828',
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1.2,
    marginVertical: 6,
    width: 200,
    maxWidth: 260,
    minWidth: 140,
  },
  iconWrap: {
    borderRadius: 40,
    padding: 16,
    marginBottom: 13,
    shadowColor: '#222',
    shadowOpacity: 0.08,
    shadowRadius: 9,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 1.1,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.85,
    fontWeight: '500',
    lineHeight: 21,
    marginTop: 3,
  },
});
