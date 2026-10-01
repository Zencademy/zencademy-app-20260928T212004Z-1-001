import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { useAuth } from '../../components/AuthContext';
import { useTheme } from '../../components/ThemeContext';
import { AuthButton, AuthError, AuthField, AuthLink, AuthShell } from '../../components/auth/AuthShell';
import { type } from '../../components/ui/type';

export default function ForgotPasswordScreen() {
  const { requestReset, verifyReset, recovery } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [linkOrCode, setLinkOrCode] = useState('');
  const [step, setStep] = useState<'email' | 'link'>('email');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Deep link / session already in recovery → skip paste step
  useEffect(() => {
    if (recovery) router.replace('/(auth)/reset-password');
  }, [recovery, router]);

  const sendReset = async () => {
    setFormError(null);
    setEmailError(null);
    if (!email.trim() || !email.includes('@')) {
      setEmailError('Enter a valid email.');
      return;
    }
    setLoading(true);
    try {
      await requestReset(email);
      setStep('link');
    } catch (error: unknown) {
      const raw = error instanceof Error ? error.message : 'Could not send reset email.';
      if (raw.toLowerCase().includes('rate limit')) {
        setFormError(
          'Too many emails sent (Supabase free mailer: 2/hour). Wait about an hour, then try again.'
        );
      } else {
        setFormError(raw);
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmLink = async () => {
    setFormError(null);
    if (!linkOrCode.trim()) {
      setFormError('Paste the reset link from your email.');
      return;
    }
    setLoading(true);
    try {
      await verifyReset(email, linkOrCode);
      router.replace('/(auth)/reset-password');
    } catch (error: unknown) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Invalid or expired link. Request a new reset email.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (step === 'link') {
    return (
      <AuthShell
        title="Open your email"
        subtitle={`We sent a reset link to ${email.trim()}. Do not open it in the browser (that goes to localhost). Long-press → Copy link, then paste it below.`}
        footer={
          <AuthLink
            label="Wrong email?"
            action="Start over"
            onPress={() => {
              setStep('email');
              setLinkOrCode('');
            }}
          />
        }
      >
        <AuthError message={formError} />
        <AuthField
          label="Paste reset link"
          value={linkOrCode}
          onChangeText={setLinkOrCode}
          placeholder="https://….supabase.co/auth/v1/verify?…"
          autoCapitalize="none"
          keyboardType="default"
          autoComplete="off"
        />
        <AuthButton label="Continue" onPress={() => { void confirmLink(); }} loading={loading} />
        <Text style={[type.body, { color: theme.textTertiary, marginTop: 16, textAlign: 'center' }]}>
          Tip: in Gmail / Mail, hold the blue “Reset Password” button → Copy link.
        </Text>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle="We’ll email a reset link. XP and coins stay untouched."
      footer={<AuthLink label="Remembered it?" action="Back to sign in" onPress={() => router.back()} />}
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
      <AuthButton label="Send reset email" onPress={() => { void sendReset(); }} loading={loading} />
    </AuthShell>
  );
}
