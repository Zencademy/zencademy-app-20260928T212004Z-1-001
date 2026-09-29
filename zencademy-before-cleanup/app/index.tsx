import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../components/AuthContext';

export default function Index() {
  const router = useRouter();
  const { user, loading, isInitialized } = useAuth();

  useEffect(() => {
    if (!loading && isInitialized) {
      console.log("Index: Auth loading complete - User:", user ? user.email : "null");
      if (user) {
        console.log("Index: Redirecting to main app (user is logged in)");
        router.replace('/(tabs)');
      } else {
        console.log("Index: Redirecting to login (no user)");
        router.replace('/(auth)/login');
      }
    }
  }, [user, loading, isInitialized, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}
