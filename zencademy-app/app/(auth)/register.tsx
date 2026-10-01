import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { useAuth } from '../../components/AuthContext';
import { useTheme } from '../../components/ThemeContext';
import { AuthButton, AuthError, AuthField, AuthLink, AuthShell } from '../../components/auth/AuthShell';
import { type } from '../../components/ui/type';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  const validate = () => {
    let ok = true;
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);
    setFormError(null);
    if (!email.trim() || !email.includes('@')) {
      setEmailError('Enter a valid email.');
      ok = false;
    }
    if (password.length < 8) {
      setPasswordError('Use at least 8 characters.');
      ok = false;
    }
    if (password !== confirm) {
      setConfirmError('Passwords do not match.');
      ok = false;
    }
    return ok;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const hasSession = await signUp(email, password);
      if (hasSession) {
        router.replace('/(tabs)');
      } else {
        setNeedsConfirm(true);
      }
    } catch (error: unknown) {
      const raw = error instanceof Error ? error.message : 'Registration failed';
      const m = raw.toLowerCase();
      if (m.includes('rate limit')) {
        setFormError(
          'Too many emails sent (Supabase allows 2/hour on the free mailer). Wait ~1 hour, or disable “Confirm email” in the Supabase dashboard while testing.'
        );
      } else if (m.includes('already') || m.includes('registered')) {
        setFormError('That email is already registered. Sign in instead.');
      } else {
        setFormError(raw);
      }
    } finally {
      setLoading(false);
    }
  };

  if (needsConfirm) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="Confirm your address, then sign in to run the mind-type assessment."
        footer={<AuthLink label="Ready?" action="Go to sign in" onPress={() => router.replace('/(auth)/login')} />}
      >
        <Text style={[type.body, { color: theme.textSecondary }]}>
          We sent a confirmation link to {email.trim()}. After confirming, sign in — onboarding starts automatically.
        </Text>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create account"
      subtitle="Takes a minute. Then a short mind-type assessment shapes your training start."
      footer={<AuthLink label="Already training?" action="Sign in" onPress={() => router.push('/(auth)/login')} />}
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
        placeholder="At least 8 characters"
        secureTextEntry={!showPassword}
        autoComplete="new-password"
        textContentType="newPassword"
        error={passwordError}
        rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
        onRightPress={() => setShowPassword((v) => !v)}
      />
      <AuthField
        label="Confirm password"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Repeat password"
        secureTextEntry={!showPassword}
        autoComplete="new-password"
        textContentType="newPassword"
        error={confirmError}
      />
      <AuthButton label="Create account" onPress={() => { void handleRegister(); }} loading={loading} />
    </AuthShell>
  );
}
