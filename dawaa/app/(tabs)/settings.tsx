import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Alert, Modal, TextInput, Linking, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  User, Bell, Lock, CreditCard, HelpCircle, LogOut, 
  ChevronLeft, Globe, Star, Shield, FileText, MessageCircle, Sun, Moon, Camera, Package,
  AlertCircle
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/constants/colors';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showArrow?: boolean;
  danger?: boolean;
  colors: Theme;
}

function SettingItem({ icon, title, subtitle, onPress, rightElement, showArrow = true, danger, colors }: SettingItemProps) {
  return (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: colors.border }]} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: colors.backgroundInput }, danger && { backgroundColor: `${colors.error}15` }]}>
          {icon}
        </View>
        <View>
          <Text style={[styles.settingTitle, { color: colors.text }, danger && { color: colors.error }]}>
            {title}
          </Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (showArrow && <ChevronLeft size={20} color={colors.textMuted} />)}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme, language, setLanguage, t, isRTL } = useTheme();
  const { signOut, user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [profileName, setProfileName] = useState('أحمد محمد');
  const [profileEmail, setProfileEmail] = useState('ahmed@example.com');
  const [profilePhone, setProfilePhone] = useState('+966 50 123 4567');
  const [editName, setEditName] = useState(profileName);
  const [editEmail, setEditEmail] = useState(profileEmail);
  const [editPhone, setEditPhone] = useState(profilePhone);
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');
  const [editImage, setEditImage] = useState(profileImage);

  // Support Ticket State
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [supportTitle, setSupportTitle] = useState('');
  const [supportDesc, setSupportDesc] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const submitTicket = async () => {
    if (!supportTitle || !supportDesc) {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    try {
      setSubmittingTicket(true);
      await apiService.createTicket({
        title: supportTitle,
        description: supportDesc,
        type: 'COMPLAINT'
      });
      Alert.alert(language === 'ar' ? 'تم النجاح' : 'Success', language === 'ar' ? 'تم إرسال بلاغك بنجاح' : 'Your report has been sent successfully');
      setSupportModalVisible(false);
      setSupportTitle('');
      setSupportDesc('');
    } catch (_error) {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', language === 'ar' ? 'فشل إرسال البلاغ' : 'Failed to send report');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t.logout,
      t.logoutConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.logout, style: 'destructive', onPress: () => {
          signOut();
        }},
      ]
    );
  };

  const handleAccountInfo = () => {
    Alert.alert(
      t.accountInfo,
      `${t.name}: ${profileName}\n${t.email}: ${profileEmail}\n${t.phone}: ${profilePhone}`,
      [{ text: t.ok }]
    );
  };

  const handleSecurity = () => {
    Alert.alert(
      t.security,
      t.securitySettings,
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.changePassword, onPress: () => {
          Alert.alert(t.done, t.passwordResetSent);
        }},
      ]
    );
  };

  const handlePaymentMethods = () => {
    Alert.alert(
      t.paymentMethods,
      t.noSavedCards,
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.addCard, onPress: () => {
          Alert.alert(t.comingSoon, t.featureComingSoon);
        }},
      ]
    );
  };

  const handleHelpCenter = () => {
    Alert.alert(
      t.helpCenter,
      t.howCanWeHelp,
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.faq, onPress: () => {
          Alert.alert(t.faq, t.faqContent);
        }},
      ]
    );
  };

  const handleContactUs = () => {
    Alert.alert(
      t.contactUs,
      t.contactMethod,
      [
        { text: t.cancel, style: 'cancel' },
        { text: language === 'ar' ? 'بلاغ عن مشكلة' : 'Report a Problem', onPress: () => setSupportModalVisible(true) },
        { text: t.emailContact, onPress: () => {
          Linking.openURL('mailto:support@da3wati.com');
        }},
        { text: t.whatsapp, onPress: () => {
          Linking.openURL('https://wa.me/966501234567');
        }},
      ]
    );
  };

  const handleTerms = () => {
    Alert.alert(
      t.termsAndConditions,
      t.termsContent,
      [{ text: t.agree }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      t.privacyPolicy,
      t.privacyContent,
      [{ text: t.ok }]
    );
  };

  const handleEditProfile = () => {
    setEditName(profileName);
    setEditEmail(profileEmail);
    setEditPhone(profilePhone);
    setEditImage(profileImage);
    setProfileModalVisible(true);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        language === 'ar' ? 'صلاحية مطلوبة' : 'Permission Required',
        language === 'ar' ? 'نحتاج صلاحية الوصول للصور' : 'We need access to your photos'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setEditImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        language === 'ar' ? 'صلاحية مطلوبة' : 'Permission Required',
        language === 'ar' ? 'نحتاج صلاحية الوصول للكاميرا' : 'We need access to your camera'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setEditImage(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      language === 'ar' ? 'تغيير الصورة' : 'Change Photo',
      language === 'ar' ? 'اختر مصدر الصورة' : 'Choose image source',
      [
        { text: t.cancel, style: 'cancel' },
        { text: language === 'ar' ? 'الكاميرا' : 'Camera', onPress: takePhoto },
        { text: language === 'ar' ? 'معرض الصور' : 'Gallery', onPress: pickImage },
      ]
    );
  };

  const saveProfile = () => {
    setProfileName(editName);
    setProfileEmail(editEmail);
    setProfilePhone(editPhone);
    setProfileImage(editImage);
    setProfileModalVisible(false);
    Alert.alert(t.done, t.savedSuccess);
  };

  const handleLanguageSelect = (lang: 'ar' | 'en') => {
    setLanguage(lang);
    setLanguageModalVisible(false);
    const langName = lang === 'ar' ? t.arabic : t.english;
    Alert.alert(t.done, `${t.languageChanged} ${langName}`);
  };


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
          <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>{t.settings}</Text>
          
          {user?.role !== 'USER' && (
            <TouchableOpacity 
              onPress={() => user?.role === 'ADMIN' ? router.replace('/admin' as any) : router.replace('/employee' as any)}
              style={[styles.backButton, { backgroundColor: colors.backgroundInput }]}
            >
              <ChevronLeft size={24} color={colors.primary} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.profileSection, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
            <Image
              source={{ uri: profileImage }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>{user?.name || 'أحمد محمد'}</Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email || 'ahmed@example.com'}</Text>
            </View>
            <TouchableOpacity style={[styles.editProfileBtn, { backgroundColor: colors.backgroundInput }]} onPress={handleEditProfile}>
              <Text style={[styles.editProfileText, { color: colors.primary }]}>{t.edit}</Text>
            </TouchableOpacity>
          </View>

          {user?.role === 'ADMIN' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>لوحة الإدارة</Text>
              <View style={[styles.sectionContent, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
                <SettingItem
                  colors={colors}
                  icon={<Package size={20} color={colors.primary} />}
                  title="إدارة الباقات"
                  subtitle="تعديل الأسعار والمميزات"
                  onPress={() => router.push('/admin/packages' as any)}
                />
                <SettingItem
                  colors={colors}
                  icon={<Shield size={20} color={colors.primary} />}
                  title="الموظفين"
                  onPress={() => router.push('/admin/employees' as any)}
                />
              </View>
            </View>
          )}

          <View style={[styles.currentPlan, { backgroundColor: colors.backgroundCard, borderColor: colors.primary }]}>
            <View style={[styles.planBadge, { backgroundColor: colors.backgroundInput }]}>
              <Star size={14} color={colors.primary} fill={colors.primary} />
              <Text style={[styles.planBadgeText, { color: colors.primary }]}>{t.premiumPackage}</Text>
            </View>
            <Text style={[styles.planExpiry, { color: colors.textSecondary }]}>{t.validUntil}: 15 مارس 2025</Text>
            <TouchableOpacity 
              style={[styles.upgradePlanBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/pricing' as any)}
            >
              <Text style={[styles.upgradePlanText, { color: colors.background }]}>{t.upgradePackage}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{t.account}</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
              <SettingItem
                colors={colors}
                icon={<User size={20} color={colors.primary} />}
                title={t.accountInfo}
                subtitle={t.accountInfoSubtitle}
                onPress={handleAccountInfo}
              />
              <SettingItem
                colors={colors}
                icon={<Lock size={20} color={colors.primary} />}
                title={t.security}
                subtitle={t.securitySubtitle}
                onPress={handleSecurity}
              />
              <SettingItem
                colors={colors}
                icon={<CreditCard size={20} color={colors.primary} />}
                title={t.paymentMethods}
                subtitle={t.savedCards}
                onPress={handlePaymentMethods}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{t.preferences}</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
              <SettingItem
                colors={colors}
                icon={isDark ? <Moon size={20} color={colors.primary} /> : <Sun size={20} color={colors.primary} />}
                title={t.appearance}
                subtitle={isDark ? t.darkMode : t.lightMode}
                showArrow={false}
                rightElement={
                  <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.white}
                  />
                }
              />
              <SettingItem
                colors={colors}
                icon={<Bell size={20} color={colors.primary} />}
                title={t.notifications}
                showArrow={false}
                rightElement={
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.white}
                  />
                }
              />
              <SettingItem
                colors={colors}
                icon={<Globe size={20} color={colors.primary} />}
                title={t.language}
                subtitle={language === 'ar' ? t.arabic : t.english}
                onPress={() => setLanguageModalVisible(true)}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{t.support}</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
              <SettingItem
                colors={colors}
                icon={<HelpCircle size={20} color={colors.primary} />}
                title={t.helpCenter}
                onPress={handleHelpCenter}
              />
              <SettingItem
                colors={colors}
                icon={<MessageCircle size={20} color={colors.primary} />}
                title={t.contactUs}
                onPress={handleContactUs}
              />
              <SettingItem
                colors={colors}
                icon={<FileText size={20} color={colors.primary} />}
                title={t.termsAndConditions}
                onPress={handleTerms}
              />
              <SettingItem
                colors={colors}
                icon={<Shield size={20} color={colors.primary} />}
                title={t.privacyPolicy}
                onPress={handlePrivacy}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={[styles.sectionContent, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
              <SettingItem
                colors={colors}
                icon={<LogOut size={20} color={colors.error} />}
                title={t.logout}
                showArrow={false}
                danger
                onPress={handleLogout}
              />
            </View>
          </View>

          <Text style={[styles.version, { color: colors.textMuted }]}>{t.version} 1.0.0</Text>
        </ScrollView>

        <Modal
          visible={profileModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setProfileModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t.editProfile}</Text>
              
              <TouchableOpacity style={styles.avatarEditContainer} onPress={showImageOptions}>
                <Image
                  source={{ uri: editImage }}
                  style={styles.avatarEdit}
                />
                <View style={[styles.cameraIconContainer, { backgroundColor: colors.primary }]}>
                  <Camera size={16} color={colors.background} />
                </View>
                <Text style={[styles.changePhotoText, { color: colors.primary }]}>
                  {language === 'ar' ? 'تغيير الصورة' : 'Change Photo'}
                </Text>
              </TouchableOpacity>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{t.name}</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.backgroundInput, color: colors.text, borderColor: colors.border, textAlign: isRTL ? 'right' : 'left' }]}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder={t.enterName}
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{t.email}</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.backgroundInput, color: colors.text, borderColor: colors.border, textAlign: isRTL ? 'right' : 'left' }]}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder={t.enterEmail}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{t.phone}</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.backgroundInput, color: colors.text, borderColor: colors.border, textAlign: isRTL ? 'right' : 'left' }]}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder={t.enterPhone}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={[styles.modalButtons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <TouchableOpacity 
                  style={[styles.modalCancelBtn, { backgroundColor: colors.backgroundInput }]}
                  onPress={() => setProfileModalVisible(false)}
                >
                  <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
                  onPress={saveProfile}
                >
                  <Text style={[styles.modalSaveText, { color: colors.background }]}>{t.save}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={supportModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSupportModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, justifyContent: 'center' }}>
                <AlertCircle size={24} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 0 }]}>
                  {language === 'ar' ? 'بلاغ عن مشكلة' : 'Report a Problem'}
                </Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {language === 'ar' ? 'العنوان' : 'Title'}
                </Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.backgroundInput, color: colors.text, borderColor: colors.border, textAlign: isRTL ? 'right' : 'left' }]}
                  value={supportTitle}
                  onChangeText={setSupportTitle}
                  placeholder={language === 'ar' ? 'مثال: مشكلة في الدفع' : 'e.g. Payment Issue'}
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {language === 'ar' ? 'الوصف' : 'Description'}
                </Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.backgroundInput, color: colors.text, borderColor: colors.border, textAlign: isRTL ? 'right' : 'left', height: 100, paddingTop: 12 }]}
                  value={supportDesc}
                  onChangeText={setSupportDesc}
                  placeholder={language === 'ar' ? 'اشرح المشكلة بالتفصيل...' : 'Explain the issue in detail...'}
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={[styles.modalButtons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <TouchableOpacity 
                  style={[styles.modalCancelBtn, { backgroundColor: colors.backgroundInput }]}
                  onPress={() => setSupportModalVisible(false)}
                >
                  <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalSaveBtn, { backgroundColor: colors.primary, opacity: submittingTicket ? 0.7 : 1 }]}
                  onPress={submitTicket}
                  disabled={submittingTicket}
                >
                  {submittingTicket ? (
                    <ActivityIndicator size="small" color={colors.background} />
                  ) : (
                    <Text style={[styles.modalSaveText, { color: colors.background }]}>{(t as any).send || (language === 'ar' ? 'إرسال' : 'Send')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={languageModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setLanguageModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t.selectLanguage}</Text>
              
              <TouchableOpacity 
                style={[
                  styles.languageOption, 
                  { backgroundColor: colors.backgroundInput, borderColor: colors.border },
                  language === 'ar' && { borderColor: colors.primary, backgroundColor: `${colors.primary}15` }
                ]}
                onPress={() => handleLanguageSelect('ar')}
              >
                <Text style={[styles.languageText, { color: colors.text }, language === 'ar' && { color: colors.primary, fontWeight: '600' as const }]}>العربية</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.languageOption, 
                  { backgroundColor: colors.backgroundInput, borderColor: colors.border },
                  language === 'en' && { borderColor: colors.primary, backgroundColor: `${colors.primary}15` }
                ]}
                onPress={() => handleLanguageSelect('en')}
              >
                <Text style={[styles.languageText, { color: colors.text }, language === 'en' && { color: colors.primary, fontWeight: '600' as const }]}>English</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalCancelBtnFull, { backgroundColor: colors.backgroundInput }]}
                onPress={() => setLanguageModalVisible(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>{t.cancel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
  },
  editProfileBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editProfileText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  currentPlan: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  planBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  planExpiry: {
    fontSize: 12,
    marginBottom: 12,
  },
  upgradePlanBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  upgradePlanText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 12,
  },
  sectionContent: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  version: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  modalInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  modalCancelBtnFull: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  modalSaveBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  languageOption: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  languageText: {
    fontSize: 16,
    textAlign: 'center',
  },
  avatarEditContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarEdit: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 24,
    right: '35%',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginTop: 8,
  },
});
