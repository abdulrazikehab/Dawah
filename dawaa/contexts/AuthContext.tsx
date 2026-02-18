import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'USER';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        const storedUser = await AsyncStorage.getItem('auth_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load auth data', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const signIn = async (newToken: string, newUser: User) => {
    try {
      setToken(newToken);
      setUser(newUser);
      await AsyncStorage.setItem('auth_token', newToken);
      await AsyncStorage.setItem('auth_user', JSON.stringify(newUser));
    } catch (e) {
      console.error('Failed to sign in', e);
    }
  };

  const signOut = async () => {
    try {
      setToken(null);
      setUser(null);
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
      router.replace('/(auth)/login');
    } catch (e) {
      console.error('Failed to sign out', e);
    }
  };

  // Protected route logic
  useEffect(() => {
    if (isLoading) return;

    const rootSegment = segments[0];
    const inAuthGroup = rootSegment === '(auth)';
    const inRsvpGroup = rootSegment === 'rsvp';
    const inAdminGroup = rootSegment === 'admin';
    const inEmployeeGroup = rootSegment === 'employee';
    const inTabsGroup = rootSegment === '(tabs)';

    // Public routes that don't require authentication
    if (inRsvpGroup) return;

    // Allow settings access for everyone (Role specific content is handled within the screen)
    const inSettings = segments[1] === 'settings';
    
    if (!user) {
      if (!inAuthGroup) {
        // Redirect to the login page if not signed in and not already in the auth group
        router.replace('/(auth)/login');
      }
    } else {
      // Logic for signed in users
      if (inAuthGroup) {
        // Redirect away from the login/signup page if already signed in
        if (user.role === 'ADMIN') {
          router.replace('/admin' as any);
        } else if (user.role === 'EMPLOYEE') {
          router.replace('/employee' as any);
        } else {
          router.replace('/(tabs)' as any);
        }
      } else if (inAdminGroup && user.role !== 'ADMIN') {
        // Prevent non-admins from accessing admin routes
        router.replace('/(tabs)' as any);
      } else if (inEmployeeGroup && user.role !== 'EMPLOYEE') {
        // Prevent non-employees from accessing employee routes
        router.replace('/(tabs)' as any);
      } else if (inTabsGroup && !inSettings && user.role !== 'USER') {
        // Prevent Admins and Employees from accessing user dashboard
        if (user.role === 'ADMIN') {
          router.replace('/admin' as any);
        } else {
          router.replace('/employee' as any);
        }
      }
    }
  }, [user, segments, isLoading, router]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
