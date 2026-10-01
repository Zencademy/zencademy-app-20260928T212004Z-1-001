import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import { type } from '../ui/type';

export function AuthShell({
  children,
  title,
  subtitle,
  footer,
}: React.PropsWithChildren<{
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
}>) {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <Text style={[type.brand, { color: theme.text, marginBottom: 28 }]}>ZENCADEMY</Text>
          <Text style={[type.title, { color: theme.text }]}>{title}</Text>
          <Text style={[type.subtitle, { color: theme.textSecondary, marginTop: 8, marginBottom: 28 }]}>
            {subtitle}
          </Text>
          {children}
          {footer ? <View style={{ marginTop: 28 }}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'none',
  keyboardType = 'default',
  autoComplete,
  textContentType,
  error,
  rightIcon,
  onRightPress,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'number-pad';
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  error?: string | null;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={{ marginBottom: 14, width: '100%' }}>
      <Text style={[type.label, { color: theme.textTertiary, marginBottom: 8 }]}>{label}</Text>
      <View
        style={[
          styles.field,
          {
            borderColor: error ? theme.error : theme.border,
            backgroundColor: theme.card,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textTertiary}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete={autoComplete}
          textContentType={textContentType}
          keyboardType={keyboardType}
          editable
          selectTextOnFocus={false}
          importantForAutofill="yes"
          style={[styles.input, { color: theme.text }]}
        />
        {rightIcon ? (
          <Pressable onPress={onRightPress} hitSlop={10} style={{ padding: 4 }}>
            <Ionicons name={rightIcon} size={20} color={theme.textTertiary} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={[type.body, { color: theme.error, marginTop: 6, fontSize: 13 }]}>{error}</Text>
      ) : null}
    </View>
  );
}

export function AuthButton({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
}) {
  const { theme } = useTheme();
  const primary = variant === 'primary';
  const blocked = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      style={[
        styles.btn,
        {
          backgroundColor: primary ? theme.primary : 'transparent',
          borderWidth: primary ? 0 : 1,
          borderColor: theme.border,
          opacity: blocked ? 0.55 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? theme.buttonText : theme.text} />
      ) : (
        <Text style={[type.button, { color: primary ? theme.buttonText : theme.text }]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function AuthLink({ label, action, onPress }: { label: string; action: string; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress} style={{ alignItems: 'center', marginTop: 16 }}>
      <Text style={[type.body, { color: theme.textSecondary }]}>
        {label}{' '}
        <Text style={{ color: theme.primary, fontWeight: '700' }}>{action}</Text>
      </Text>
    </Pressable>
  );
}

export function AuthError({ message }: { message: string | null }) {
  const { theme } = useTheme();
  if (!message) return null;
  return (
    <View
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.error,
        backgroundColor: theme.surface,
        padding: 12,
        marginBottom: 14,
      }}
    >
      <Text style={[type.body, { color: theme.error }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 48,
    // Top-aligned: justifyContent:'center' + KeyboardAvoidingView breaks TextInput focus on Android
  },
  field: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 52,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    width: '100%',
    minWidth: 0,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    margin: 0,
  },
  btn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
});
