import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Briefcase, ChevronRight } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { useTheme } from '@/contexts/ThemeContext';

export default function EmployeeLoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await apiService.login({ email, password });
      
      if (data.user.role === 'USER') {
        throw new Error('هذا الحساب ليس لديه صلاحيات الموظفين');
      }

      await signIn(data.token, data.user);
      
      if (data.user.role === 'ADMIN') {
        router.replace('/admin' as any);
      } else {
        router.replace('/employee' as any);
      }
    } catch (err: unknown) { // Changed 'any' to 'unknown' for better type safety
      if (err instanceof Error) {
        setError(err.message || 'فشل تسجيل الدخول');
      } else {
        setError('فشل تسجيل الدخول');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity 
        style={[styles.backButton, { backgroundColor: colors.backgroundCard }]} 
        onPress={() => router.replace('/(auth)/login')}
      >
        <ChevronRight size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
          <Briefcase size={40} color={colors.primary} />
        </View>

        <ThemedText type="title" style={styles.title}>دخول الموظفين</ThemedText>
        <ThemedText style={styles.subtitle}>أهلاً بك زميلنا، يرجى تسجيل الدخول للوصول للوحة التحكم</ThemedText>

        <Input
          label="البريد الوظيفي"
          value={email}
          onChangeText={setEmail}
          placeholder="employee@da3wati.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          label="كلمة المرور"
          value={password}
          onChangeText={setPassword}
          placeholder="********"
          secureTextEntry
        />

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

        <Button
          title="دخول"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
        />

        <View style={styles.footer}>
          <ThemedText style={{ opacity: 0.6 }}>تواجه مشكلة في الدخول؟ </ThemedText>
          <TouchableOpacity onPress={() => {}}>
            <ThemedText type="link" style={{ color: colors.primary }}>تواصل مع الإدارة</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 28,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.7,
    lineHeight: 22,
  },
  error: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  button: {
    marginTop: 20,
    height: 56,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    gap: 4
  },
});
