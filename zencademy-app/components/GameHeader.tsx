import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './ThemeContext';

interface GameHeaderProps {
  onBack: () => void;
  gameTitle: string;
  gameDescription: string;
  gameInstructions: string;
}

export default function GameHeader({ onBack, gameTitle, gameDescription, gameInstructions }: GameHeaderProps) {
  const { theme } = useTheme();
  const [showInfo, setShowInfo] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: theme.background, paddingTop: 8 }]}>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: theme.surface }]} 
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <Text style={[styles.title, { color: theme.text }]}>Zencademy</Text>
          
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: theme.surface }]} 
            onPress={() => setShowInfo(true)}
          >
            <Ionicons name="help-circle-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Modal
        visible={showInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{gameTitle}</Text>
              <TouchableOpacity 
                style={[styles.closeButton, { backgroundColor: theme.surface }]}
                onPress={() => setShowInfo(false)}
              >
                <Ionicons name="close" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>
              {gameDescription}
            </Text>
            
            <Text style={[styles.modalInstructions, { color: theme.text }]}>
              {gameInstructions}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  modalInstructions: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
