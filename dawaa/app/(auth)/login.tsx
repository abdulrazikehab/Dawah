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
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fingerprint } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  React.useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setIsBiometricSupported(compatible);
  };

  const handleBiometricLogin = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('auth_token_biometric');
      const savedUser = await AsyncStorage.getItem('auth_user_biometric');

      if (!savedToken || !savedUser) {
        setError('يرجى تسجيل الدخول أولاً لتفعيل البصمة');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'تسجيل الدخول بالبصمة',
        fallbackLabel: 'استخدم كلمة المرور',
      });

      if (result.success) {
        setLoading(true);
        await signIn(savedToken, JSON.parse(savedUser));
        router.replace('/(tabs)/dashboard');
      }
    } catch (err: any) {
      console.error('Biometric error:', err);
      setError('فشل التحقق من البصمة');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await apiService.login({ email, password });
      if (data.user.role === 'EMPLOYEE') {
        throw new Error('هذا الحساب خاص بالموظفين، يرجى الدخول من بوابة الموظفين');
      }


      await signIn(data.token, data.user);
      
      // Save for biometric if supported
      if (isBiometricSupported) {
        await AsyncStorage.setItem('auth_token_biometric', data.token);
        await AsyncStorage.setItem('auth_user_biometric', JSON.stringify(data.user));
      }

      if (data.user.role === 'ADMIN') {
        router.replace('/admin' as any);
      } else {
        router.replace('/(tabs)/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>أهلاً بك مجدداً</ThemedText>
        <ThemedText style={styles.subtitle}>الرجاء تسجيل الدخول للمتابعة</ThemedText>

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
          secureTextEntry
        />

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

        <Button
          title="تسجيل الدخول"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
        />

        {isBiometricSupported && (
          <TouchableOpacity 
            style={[styles.biometricBtn, { borderColor: colors.border }]} 
            onPress={handleBiometricLogin}
          >
            <Fingerprint size={32} color={colors.primary} />
            <ThemedText style={styles.biometricText}>تسجيل الدخول بالبصمة</ThemedText>
          </TouchableOpacity>
        )}

        <View style={styles.employeeLinkContainer}>
          <TouchableOpacity onPress={() => router.push('/(auth)/employee-login' as any)}>
            <ThemedText style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center' }}>
              هل أنت موظف؟ <ThemedText style={{ color: colors.primary, fontWeight: 'bold' }}>سجل دخولك هنا</ThemedText>
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <ThemedText>ليس لديك حساب؟ </ThemedText>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <ThemedText type="link" style={{ color: colors.primary }}>إنشاء حساب جديد</ThemedText>
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
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  biometricText: {
    fontSize: 14,
    fontWeight: '500',
  },
  employeeLinkContainer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 4
  },
});
