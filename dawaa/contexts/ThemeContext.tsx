import { useState, useEffect, useMemo } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { darkTheme, lightTheme, Theme } from '@/constants/colors';

const THEME_STORAGE_KEY = 'app_theme_mode';
const LANGUAGE_STORAGE_KEY = 'app_language';

export type ThemeMode = 'dark' | 'light';
export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    settings: 'الإعدادات',
    edit: 'تعديل',
    premiumPackage: 'باقة بريميم',
    validUntil: 'صالحة حتى',
    upgradePackage: 'ترقية الباقة',
    account: 'الحساب',
    accountInfo: 'معلومات الحساب',
    accountInfoSubtitle: 'الاسم، البريد، رقم الجوال',
    security: 'الأمان',
    securitySubtitle: 'كلمة المرور، التحقق بخطوتين',
    paymentMethods: 'طرق الدفع',
    savedCards: 'البطاقات المحفوظة',
    preferences: 'التفضيلات',
    appearance: 'المظهر',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    notifications: 'الإشعارات',
    language: 'اللغة',
    support: 'الدعم',
    helpCenter: 'مركز المساعدة',
    contactUs: 'تواصل معنا',
    termsAndConditions: 'الشروط والأحكام',
    privacyPolicy: 'سياسة الخصوصية',
    logout: 'تسجيل الخروج',
    version: 'الإصدار',
    editProfile: 'تعديل الملف الشخصي',
    name: 'الاسم',
    enterName: 'أدخل اسمك',
    email: 'البريد الإلكتروني',
    enterEmail: 'أدخل بريدك الإلكتروني',
    phone: 'رقم الجوال',
    enterPhone: 'أدخل رقم جوالك',
    cancel: 'إلغاء',
    save: 'حفظ',
    selectLanguage: 'اختر اللغة',
    arabic: 'العربية',
    english: 'English',
    logoutConfirm: 'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
    done: 'تم',
    logoutSuccess: 'تم تسجيل الخروج بنجاح',
    savedSuccess: 'تم حفظ التغييرات بنجاح',
    languageChanged: 'تم تغيير اللغة إلى',
    securitySettings: 'إعدادات الأمان',
    changePassword: 'تغيير كلمة المرور',
    passwordResetSent: 'سيتم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني',
    noSavedCards: 'لا توجد بطاقات محفوظة حالياً',
    addCard: 'إضافة بطاقة',
    comingSoon: 'قريباً',
    featureComingSoon: 'سيتم إضافة هذه الميزة قريباً',
    howCanWeHelp: 'كيف يمكننا مساعدتك؟',
    faq: 'الأسئلة الشائعة',
    faqContent: 'س: كيف أنشئ دعوة؟\nج: اذهب إلى تبويب "إنشاء" واتبع الخطوات\n\nس: كيف أعدل دعوة؟\nج: اضغط على الدعوة ثم اختر "تعديل"',
    contactMethod: 'اختر طريقة التواصل',
    emailContact: 'البريد الإلكتروني',
    whatsapp: 'واتساب',
    termsContent: 'باستخدامك لتطبيق دعواتي، فإنك توافق على:\n\n1. استخدام التطبيق للأغراض المشروعة فقط\n2. عدم إرسال محتوى مسيء أو غير لائق\n3. احترام خصوصية الآخرين\n4. عدم استخدام التطبيق لأغراض تجارية بدون إذن',
    privacyContent: 'نحن نحترم خصوصيتك:\n\n• نجمع فقط البيانات الضرورية لتقديم الخدمة\n• لا نشارك بياناتك مع أطراف ثالثة\n• يمكنك حذف حسابك في أي وقت\n• نستخدم تشفير SSL لحماية بياناتك',
    ok: 'حسناً',
    agree: 'موافق',
    home: 'الرئيسية',
    create: 'إنشاء',
    invitations: 'الدعوات',
    dashboard: 'لوحة التحكم',
    myInvitations: 'دعواتي',
    createInvitation: 'إنشاء دعوة',
    guests: 'الضيوف',
    total: 'الإجمالي',
    accepted: 'مقبول',
    pending: 'قيد الانتظار',
    declined: 'مرفوض',
    adminDashboard: 'لوحة تحكم المسؤول',
    employeeDashboard: 'لوحة تحكم الموظف',
    manageEvents: 'إدارة المناسبات',
    manageEmployees: 'إدارة الموظفين',
    managePackages: 'إدارة الباقات',
    assignedEvents: 'المناسبات المعينة',
    profile: 'الملف الشخصي',
    filters: 'الفلاتر',
    searchByName: 'البحث بالاسم...',
    filterByType: 'حسب النوع',
    filterByDate: 'حسب التاريخ',
    allTypes: 'كل الأنواع',
    noEventsFound: 'لم يتم العثور على مناسبات',
    stats: 'الإحصائيات',
    active: 'نشط',
    completed: 'مكتمل',
    todayTasks: 'مهام اليوم',
    error: 'خطأ',
  },
  en: {
    settings: 'Settings',
    edit: 'Edit',
    premiumPackage: 'Premium Package',
    validUntil: 'Valid until',
    upgradePackage: 'Upgrade Package',
    account: 'Account',
    accountInfo: 'Account Info',
    accountInfoSubtitle: 'Name, Email, Phone',
    security: 'Security',
    securitySubtitle: 'Password, Two-factor auth',
    paymentMethods: 'Payment Methods',
    savedCards: 'Saved Cards',
    preferences: 'Preferences',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    adminDashboard: 'Admin Dashboard',
    employeeDashboard: 'Employee Dashboard',
    manageEvents: 'Manage Events',
    manageEmployees: 'Manage Employees',
    managePackages: 'Manage Packages',
    assignedEvents: 'Assigned Events',
    profile: 'Profile',
    filters: 'Filters',
    searchByName: 'Search by name...',
    filterByType: 'Filter by type',
    filterByDate: 'Filter by date',
    allTypes: 'All Types',
    noEventsFound: 'No events found',
    stats: 'Stats',
    active: 'Active',
    completed: 'Completed',
    todayTasks: 'Today\'s Tasks',
    notifications: 'Notifications',
    language: 'Language',
    support: 'Support',
    helpCenter: 'Help Center',
    contactUs: 'Contact Us',
    termsAndConditions: 'Terms & Conditions',
    privacyPolicy: 'Privacy Policy',
    logout: 'Logout',
    version: 'Version',
    editProfile: 'Edit Profile',
    name: 'Name',
    enterName: 'Enter your name',
    email: 'Email',
    enterEmail: 'Enter your email',
    phone: 'Phone',
    enterPhone: 'Enter your phone',
    cancel: 'Cancel',
    save: 'Save',
    selectLanguage: 'Select Language',
    arabic: 'العربية',
    english: 'English',
    logoutConfirm: 'Are you sure you want to logout?',
    done: 'Done',
    logoutSuccess: 'Logged out successfully',
    savedSuccess: 'Changes saved successfully',
    languageChanged: 'Language changed to',
    securitySettings: 'Security Settings',
    changePassword: 'Change Password',
    passwordResetSent: 'Password reset link will be sent to your email',
    noSavedCards: 'No saved cards',
    addCard: 'Add Card',
    comingSoon: 'Coming Soon',
    featureComingSoon: 'This feature will be added soon',
    howCanWeHelp: 'How can we help you?',
    faq: 'FAQ',
    faqContent: 'Q: How do I create an invitation?\nA: Go to "Create" tab and follow the steps\n\nQ: How do I edit an invitation?\nA: Tap on the invitation and choose "Edit"',
    contactMethod: 'Choose contact method',
    emailContact: 'Email',
    whatsapp: 'WhatsApp',
    termsContent: 'By using Da3wati app, you agree to:\n\n1. Use the app for legitimate purposes only\n2. Not send offensive or inappropriate content\n3. Respect others\' privacy\n4. Not use the app for commercial purposes without permission',
    privacyContent: 'We respect your privacy:\n\n• We only collect data necessary to provide the service\n• We do not share your data with third parties\n• You can delete your account at any time\n• We use SSL encryption to protect your data',
    ok: 'OK',
    agree: 'Agree',
    home: 'Home',
    create: 'Create',
    invitations: 'Invitations',
    dashboard: 'Dashboard',
    myInvitations: 'My Invitations',
    createInvitation: 'Create Invitation',
    guests: 'Guests',
    total: 'Total',
    accepted: 'Accepted',
    pending: 'Pending',
    declined: 'Declined',
    error: 'Error',
  },
};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [language, setLanguageState] = useState<Language>('ar');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [savedTheme, savedLanguage] = await Promise.all([
        AsyncStorage.getItem(THEME_STORAGE_KEY),
        AsyncStorage.getItem(LANGUAGE_STORAGE_KEY),
      ]);
      
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeMode(savedTheme);
      }
      
      if (savedLanguage === 'ar' || savedLanguage === 'en') {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newMode: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const setTheme = async (mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      const isRTL = lang === 'ar';
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
      }
    } catch (error) {
      console.log('Error saving language:', error);
    }
  };

  const colors: Theme = useMemo(() => {
    return themeMode === 'dark' ? darkTheme : lightTheme;
  }, [themeMode]);

  const t = useMemo(() => {
    return translations[language];
  }, [language]);

  const isDark = themeMode === 'dark';
  const isRTL = language === 'ar';

  return {
    themeMode,
    colors,
    isDark,
    isLoading,
    toggleTheme,
    setTheme,
    language,
    setLanguage,
    t,
    isRTL,
  };
});
