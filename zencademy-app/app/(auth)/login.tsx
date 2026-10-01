import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { useAuth } from '../../components/AuthContext';
import { useTheme } from '../../components/ThemeContext';
import { AuthButton, AuthError, AuthField, AuthLink, AuthShell } from '../../components/auth/AuthShell';
import { type } from '../../components/ui/type';

function friendlyAuthError(raw: string) {
  const m = raw.toLowerCase();
  if (m.includes('rate limit') || m.includes('email rate limit')) {
    return 'Too many emails sent. Wait about an hour, or turn off “Confirm email” in Supabase Auth while testing.';
  }
  if (m.includes('invalid login') || m.includes('invalid credentials')) {
    return 'Email or password is incorrect.';
  }
  if (m.includes('email not confirmed')) {
    return 'Confirm your email first, then sign in.';
  }
  if (m.includes('network')) return 'Network error. Check your connection.';
  return raw || 'Sign in failed. Try again.';
}

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validate = () => {
    let ok = true;
    setEmailError(null);
    setPasswordError(null);
    setFormError(null);
    if (!email.trim() || !email.includes('@')) {
      setEmailError('Enter a valid email.');
      ok = false;
    }
    if (!password) {
      setPasswordError('Enter your password.');
      ok = false;
    }
    return ok;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: unknown) {
      const message = friendlyAuthError(error instanceof Error ? error.message : 'Sign in failed');
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="XP unlocks training. Coins buy shop rewards. Pick up where you left off."
      footer={
        <AuthLink label="New here?" action="Create account" onPress={() => router.push('/(auth)/register')} />
      }
    >
      <AuthError message={formError} />
      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@email.com"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        error={emailError}
      />
      <AuthField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        secureTextEntry={!showPassword}
        autoComplete="password"
        textContentType="password"
        error={passwordError}
        rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
        onRightPress={() => setShowPassword((v) => !v)}
      />
      <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={{ alignSelf: 'flex-end', marginBottom: 8 }}>
        <Text style={[type.label, { color: theme.primary, letterSpacing: 0.3 }]}>Forgot password?</Text>
      </Pressable>
      <AuthButton label="Sign in" onPress={() => { void handleLogin(); }} loading={loading} />
    </AuthShell>
  );
}
