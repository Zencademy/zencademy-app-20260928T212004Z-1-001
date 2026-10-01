import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { AuthButton, AuthError, AuthField, AuthShell } from '../../components/auth/AuthShell';

export default function ResetPasswordScreen() {
  const { changePassword, recovery } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const submit = async () => {
    setFormError(null);
    setPasswordError(null);
    setConfirmError(null);
    if (password.length < 8) {
      setPasswordError('Use at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setConfirmError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await changePassword(password);
      router.replace('/(tabs)');
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : 'Could not update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="New password"
      subtitle={
        recovery
          ? 'Choose a strong password. You’ll stay signed in after saving.'
          : 'Set a new password for your account.'
      }
    >
      <AuthError message={formError} />
      <AuthField
        label="New password"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 8 characters"
        secureTextEntry={!showPassword}
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
        error={confirmError}
      />
      <AuthButton label="Save password" onPress={() => { void submit(); }} loading={loading} />
    </AuthShell>
  );
}
