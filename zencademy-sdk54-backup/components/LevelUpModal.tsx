import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface LevelUpModalProps {
  visible: boolean;
  onClose: () => void;
  onDismiss?: () => void;
  currentLevel: number;
  previousLevel: number;
  unlockedFeatures: string[];
  upcomingFeatures: string[];
  xpGained: number;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({
  visible,
  onClose,
  onDismiss,
  currentLevel,
  previousLevel,
  unlockedFeatures,
  upcomingFeatures,
  xpGained,
}) => {
  const modalScale = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate modal only
      Animated.parallel([
        Animated.spring(modalScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      Animated.parallel([
        Animated.timing(modalScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: modalOpacity,
              transform: [{ scale: modalScale }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.levelBadge}>
              <Ionicons name="star" size={24} color="#fbbf24" />
              <Text style={styles.levelText}>LEVEL {currentLevel}</Text>
            </View>
            <TouchableOpacity 
              onPress={onDismiss || onClose} 
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Congratulations */}
          <View style={styles.congratulationsSection}>
            <Ionicons name="trophy" size={48} color="#fbbf24" />
            <Text style={styles.congratulationsTitle}>Level Up</Text>
            <Text style={styles.congratulationsSubtitle}>
              You've reached Level {currentLevel}!
            </Text>
            <View style={styles.xpGained}>
              <Ionicons name="flash" size={20} color="#10b981" />
              <Text style={styles.xpText}>+{xpGained} XP gained</Text>
            </View>
          </View>

          {/* Unlocked Features */}
          {unlockedFeatures.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="unlock" size={20} color="#10b981" />
                <Text style={styles.sectionTitle}>New Features Unlocked!</Text>
              </View>
              {unlockedFeatures.slice(0, 3).map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
              {unlockedFeatures.length > 3 && (
                <View style={styles.featureItem}>
                  <Ionicons name="add-circle" size={16} color="#10b981" />
                  <Text style={styles.featureText}>+{unlockedFeatures.length - 3} more features</Text>
                </View>
              )}
            </View>
          )}

          {/* Upcoming Features */}
          {upcomingFeatures.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time" size={20} color="#6b7280" />
                <Text style={styles.sectionTitle}>Next Level Preview</Text>
              </View>
              {upcomingFeatures.slice(0, 2).map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="ellipse" size={16} color="#6b7280" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
              {upcomingFeatures.length > 2 && (
                <View style={styles.featureItem}>
                  <Ionicons name="add-circle" size={16} color="#6b7280" />
                  <Text style={styles.featureText}>+{upcomingFeatures.length - 2} more coming</Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {onDismiss && (
              <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
                <Text style={styles.dismissButtonText}>Don't show again</Text>
                <Ionicons name="close-circle" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.continueButton}>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    width: Math.min(420, width - 24),
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginLeft: 6,
  },
  closeButton: {
    padding: 4,
  },
  congratulationsSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  congratulationsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 4,
  },
  congratulationsSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  xpGained: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065f46',
    marginLeft: 6,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 28,
  },
  featureText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 6,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
  dismissButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  dismissButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginRight: 6,
  },
});

export default LevelUpModal;
