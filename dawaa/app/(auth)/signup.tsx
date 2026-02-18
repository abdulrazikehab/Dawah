import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { useTheme } from '@/contexts/ThemeContext';

export default function SignupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signIn } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await apiService.signup({ name, email, password });
      await signIn(data.token, data.user);
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>فرصة جديدة</ThemedText>
        <ThemedText style={styles.subtitle}>انشئ حسابك الآن لتنظيم مناسباتك</ThemedText>

        <Input
          label="الاسم الكامل"
          value={name}
          onChangeText={setName}
          placeholder="الاسم"
        />

        <Input
          label="البريد الإلكتروني"
          value={email}
          onChangeText={setEmail}
          placeholder="example@mail.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          label="كلمة المرور"
          value={password}
          onChangeText={setPassword}
          placeholder="********"
          secureTextEntry // Fix: Added secureTextEntry
        />

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

        <Button
          title="إنشاء حساب"
          onPress={handleSignup}
          loading={loading}
          style={styles.button} // Fix: Used style={styles.button} instead of containerStyle
        />

        <View style={styles.footer}>
          <ThemedText>لديك حساب بالفعل؟ </ThemedText>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <ThemedText type="link" style={{ color: colors.primary }}>تسجيل الدخول</ThemedText>
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
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Tajawal-Bold', // Assuming Arabic font exists or default
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  button: {
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 4
  },
});
