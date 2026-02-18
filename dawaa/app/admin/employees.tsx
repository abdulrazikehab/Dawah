import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, ScrollView, TouchableOpacity, Linking, Modal } from 'react-native';
import { User, Mail, Lock, ChevronLeft, Trash2, MessageCircle, Share2, Copy, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { apiService } from '@/services/api';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

const APP_DOWNLOAD_LINK = 'https://rork.page/download'; // Placeholder for the app download link

export default function EmployeeManagement() {
  const { colors, t, isRTL } = useTheme();
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newEmployeeCreds, setNewEmployeeCreds] = useState<any>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await apiService.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async () => {
    if (!name || !email || !password) {
      Alert.alert(t.error, isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    try {
      setCreating(true);
      await apiService.createEmployee({ name, email, password });
      
      // Save credentials for sharing before clearing
      setNewEmployeeCreds({ name, email, password });
      setShowShareModal(true);
      
      setName('');
      setEmail('');
      setPassword('');
      fetchEmployees();
    } catch (error: any) {
      Alert.alert(t.error, error.message || 'Failed to create employee');
    } finally {
      setCreating(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!newEmployeeCreds) return;
    const message = isRTL 
      ? `مرحباً ${newEmployeeCreds.name}،\n\nتم إنشاء حسابك في تطبيق رورك بنجاح.\n\nبيانات الدخول الخاصة بك:\nالبريد الإلكتروني: ${newEmployeeCreds.email}\nكلمة المرور: ${newEmployeeCreds.password}\n\nيمكنك تحميل التطبيق من الرابط التالي:\n${APP_DOWNLOAD_LINK}`
      : `Hello ${newEmployeeCreds.name},\n\nYour account in Rork App has been created successfully.\n\nLogin Credentials:\nEmail: ${newEmployeeCreds.email}\nPassword: ${newEmployeeCreds.password}\n\nYou can download the app from the following link:\n${APP_DOWNLOAD_LINK}`;
    
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(t.error, isRTL ? 'تطبيق واتساب غير مثبت' : 'WhatsApp is not installed');
    });
  };

  const handleShareEmail = () => {
    if (!newEmployeeCreds) return;
    const subject = isRTL ? 'بيانات حسابك في تطبيق رورك' : 'Your Rork App Account Credentials';
    const body = isRTL 
      ? `مرحباً ${newEmployeeCreds.name}،\n\nتم إنشاء حسابك في تطبيق رورك بنجاح.\n\nبيانات الدخول الخاصة بك:\nالبريد الإلكتروني: ${newEmployeeCreds.email}\nكلمة المرور: ${newEmployeeCreds.password}\n\nيمكنك تحميل التطبيق من الرابط التالي:\n${APP_DOWNLOAD_LINK}`
      : `Hello ${newEmployeeCreds.name},\n\nYour account in Rork App has been created successfully.\n\nLogin Credentials:\nEmail: ${newEmployeeCreds.email}\nPassword: ${newEmployeeCreds.password}\n\nYou can download the app from the following link:\n${APP_DOWNLOAD_LINK}`;
    
    Linking.openURL(`mailto:${newEmployeeCreds.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert(isRTL ? 'تم النسخ' : 'Copied', isRTL ? 'تم نسخ النص إلى الحافظة' : 'Text copied to clipboard');
  };

  const renderEmployeeItem = ({ item }: { item: any }) => (
    <View style={[styles.employeeCard, { backgroundColor: colors.backgroundCard, borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <View style={[styles.employeeInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{item.name?.[0] || 'E'}</Text>
        </View>
        <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
          <Text style={[styles.employeeName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.employeeEmail, { color: colors.textSecondary }]}>{item.email}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => {/* Delete logic */}}>
        <Trash2 size={18} color={colors.error || '#ff4444'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.navy, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#fff" style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.manageEmployees}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.formSection, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {isRTL ? 'إضافة موظف جديد' : 'Add New Employee'}
          </Text>
          <Input
            label={t.name}
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            icon={<User size={18} color={colors.textMuted} />}
          />
          <Input
            label={t.email}
            value={email}
            onChangeText={setEmail}
            placeholder="john@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={18} color={colors.textMuted} />}
          />
          <Input
            label={isRTL ? 'كلمة المرور' : 'Password'}
            value={password}
            onChangeText={setPassword}
            placeholder="********"
            secureTextEntry
            icon={<Lock size={18} color={colors.textMuted} />}
          />
          <Button
            title={isRTL ? 'إنشاء حساب الموظف' : 'Create Employee Account'}
            onPress={handleAddEmployee}
            loading={creating}
            style={styles.createBtn}
          />
        </View>

        <View style={styles.listSection}>
          <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {isRTL ? `الموظفون الحاليون (${employees.length})` : `Current Employees (${employees.length})`}
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            employees.map(item => (
              <View key={item.id}>
                {renderEmployeeItem({ item })}
              </View>
            ))
          )}
          {!loading && employees.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{isRTL ? 'لا يوجد موظفون مسجلون حالياً' : 'No employees registered yet.'}</Text>
          )}
        </View>
      </ScrollView>

      {/* Share Credentials Modal */}
      <Modal
        visible={showShareModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundCard }]}>
            <View style={styles.modalHeaderClose}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {isRTL ? 'مشاركة بيانات الموظف' : 'Share Employee Details'}
              </Text>
              <TouchableOpacity onPress={() => setShowShareModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.credentialsBox, { backgroundColor: colors.backgroundInput }]}>
              <View style={styles.credRow}>
                <Text style={[styles.credLabel, { color: colors.textMuted }]}>{t.name}</Text>
                <Text style={[styles.credValue, { color: colors.text }]}>{newEmployeeCreds?.name}</Text>
              </View>
              <View style={styles.credRow}>
                <Text style={[styles.credLabel, { color: colors.textMuted }]}>{t.email}</Text>
                <View style={styles.valueCopyRow}>
                  <Text style={[styles.credValue, { color: colors.text }]}>{newEmployeeCreds?.email}</Text>
                  <TouchableOpacity onPress={() => copyToClipboard(newEmployeeCreds?.email)}>
                    <Copy size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.credRow}>
                <Text style={[styles.credLabel, { color: colors.textMuted }]}>{isRTL ? 'كلمة المرور' : 'Password'}</Text>
                <View style={styles.valueCopyRow}>
                  <Text style={[styles.credValue, { color: colors.text }]}>{newEmployeeCreds?.password}</Text>
                  <TouchableOpacity onPress={() => copyToClipboard(newEmployeeCreds?.password)}>
                    <Copy size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.shareActions}>
              <TouchableOpacity 
                style={[styles.shareBtn, { backgroundColor: '#25D366' }]} 
                onPress={handleShareWhatsApp}
              >
                <MessageCircle size={20} color="#fff" />
                <Text style={styles.shareBtnText}>{isRTL ? 'واتساب' : 'WhatsApp'}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.shareBtn, { backgroundColor: colors.primary }]} 
                onPress={handleShareEmail}
              >
                <Mail size={20} color="#fff" />
                <Text style={styles.shareBtnText}>{isRTL ? 'بريد إلكتروني' : 'Email'}</Text>
              </TouchableOpacity>
            </View>

            <Button
              title={isRTL ? 'إغلاق' : 'Close'}
              variant="outline"
              onPress={() => setShowShareModal(false)}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backBtn: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
  },
  formSection: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  listSection: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  createBtn: {
    marginTop: 12,
  },
  employeeCard: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  employeeInfo: {
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  employeeEmail: {
    fontSize: 13,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeaderClose: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  credentialsBox: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
  },
  credRow: {
    gap: 4,
  },
  credLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  credValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  valueCopyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shareActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  shareBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
