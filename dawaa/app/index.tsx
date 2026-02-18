import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // If already logged in, redirect to appropriate dashboard
  if (user.role === 'ADMIN') {
    return <Redirect href={"/admin" as any} />;
  } else if (user.role === 'EMPLOYEE') {
    return <Redirect href={"/employee" as any} />;
  } else {
    return <Redirect href="/(tabs)/dashboard" />;
  }
}
