import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from './ThemeContext';
import { AppHeader } from './ui/AppHeader';
import { type } from './ui/type';

interface GameHeaderProps {
  onBack: () => void;
  gameTitle: string;
  gameDescription: string;
  gameInstructions: string;
}

export default function GameHeader({ onBack, gameTitle, gameDescription, gameInstructions }: GameHeaderProps) {
  const { theme } = useTheme();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <AppHeader onBack={onBack} onRight={() => setShowInfo(true)} showWallet compactWallet title="TRAIN" />
      <Modal visible={showInfo} transparent animationType="fade" onRequestClose={() => setShowInfo(false)}>
        <View style={{ flex: 1, backgroundColor: theme.overlay, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
          <View style={{ borderRadius: 16, padding: 20, width: '100%', maxWidth: 400, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[type.card, { color: theme.text, flex: 1 }]}>{gameTitle}</Text>
              <TouchableOpacity onPress={() => setShowInfo(false)} style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.surface }}>
                <Text style={{ color: theme.text, fontSize: 18 }}>×</Text>
              </TouchableOpacity>
            </View>
            <Text style={[type.body, { color: theme.textSecondary }]}>{gameDescription}</Text>
            <Text style={[type.body, { color: theme.text }]}>{gameInstructions}</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}
