import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Platform, ActivityIndicator, Modal, FlatList, Pressable, TextInput, Image as RNImage } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronRight, Calendar, MapPin, User, MessageSquare, Users, Heart, Cake, GraduationCap, Briefcase, Sparkles, Phone, Plus, Trash2, UserPlus, Clock, Clipboard as ClipboardIcon, X, Map as MapIcon, Palette } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Location from 'expo-location';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import Input from '@/components/Input';
import ProgressSteps from '@/components/ProgressSteps';
import TemplateCard from '@/components/TemplateCard';
import PackageCard from '@/components/PackageCard';
import { apiService } from '@/services/api';
import { PackageType, InvitationType, PreInvitedGuest } from '@/types';
import { invitationThemes } from '@/constants/invitationThemes';

const steps = ['نوع المناسبة', 'التصميم', 'التفاصيل', 'المدعوين', 'الباقة', 'الدفع'];

const eventTypes: { id: InvitationType; name: string; icon: React.ReactNode; color: string }[] = [
  { id: 'wedding', name: 'زفاف', icon: <Heart size={24} color="#E91E63" />, color: '#E91E63' },
  { id: 'birthday', name: 'عيد ميلاد', icon: <Cake size={24} color="#9C27B0" />, color: '#9C27B0' },
  { id: 'graduation', name: 'تخرج', icon: <GraduationCap size={24} color="#3F51B5" />, color: '#3F51B5' },
  { id: 'corporate', name: 'حفل شركة', icon: <Briefcase size={24} color="#009688" />, color: '#009688' },
  { id: 'other', name: 'مناسبة أخرى', icon: <Sparkles size={24} color="#FF9800" />, color: '#FF9800' },
];

export default function CreateScreen() {
  const router = useRouter();
  const { initialPackage, editId } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEventType, setSelectedEventType] = useState<InvitationType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>(invitationThemes[0].id);
  const [selectedPackage, setSelectedPackage] = useState<PackageType>('premium');
  
  useEffect(() => {
    if (initialPackage && typeof initialPackage === 'string') {
      setSelectedPackage(initialPackage as PackageType);
    }
  }, [initialPackage]);
  
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  const [loadingInitialData, setLoadingInitialData] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (editId) {
      setLoadingInitialData(true);
      apiService.getEventById(editId as string)
        .then(data => {
          setSelectedEventType(data.eventType || data.type);
          setSelectedTemplate(data.templateId);
          setSelectedTheme(data.themeId || invitationThemes[0].id);
          setSelectedPackage(data.packageId);
          setFormData({
            title: data.title,
            hostName: data.hostName,
            honoreeName: data.honoreeName || '',
            date: data.date,
            time: data.time,
            location: data.location,
            message: data.message,
            guestCount: String(data.guestCount),
          });
          setPreInvitedGuests(data.guests || []);
          setLoadingInitialData(false);
          // Auto-advance to details step if we have event type and template
          if (data.type && data.templateId) {
            setCurrentStep(2);
          }
        })
        .catch(err => {
          console.error('Error fetching event for edit:', err);
          setLoadingInitialData(false);
          Alert.alert('خطأ', 'فشل تحميل بيانات الدعوة');
        });
    }
  }, [editId]);

  const [formData, setFormData] = useState({
    title: '',
    hostName: '',
    honoreeName: '',
    date: '',
    time: '',
    location: '',
    message: '',
    guestCount: '',
  });
  const [preInvitedGuests, setPreInvitedGuests] = useState<PreInvitedGuest[]>([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestMaxCompanions, setNewGuestMaxCompanions] = useState('1');

  // Date & Time Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Generate date options (next 60 days)
  // Generate date options (next 2 years)
  const dateOptions = Array.from({ length: 730 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return {
      id: i.toString(),
      date: d,
      // Format: "السبت، 15 مارس 2025"
      label: d.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      value: `${y}/${m}/${day}`,
    };
  });

  // Generate time options (30 min intervals)
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? '00' : '30';
    const ampm = h >= 12 ? 'م' : 'ص';
    const hour12 = h % 12 || 12;
    // Format: "07:00 م"
    const label = `${hour12}:${m} ${ampm}`;
    const value = `${h.toString().padStart(2, '0')}:${m}`;
    return { id: i.toString(), label, value };
  });

  const handlePasteLocation = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setFormData(prev => ({ ...prev, location: text }));
    } else {
      Alert.alert('تنبيه', 'الحافظة فارغة');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [templatesData, packagesData] = await Promise.all([
          apiService.getTemplates(),
          apiService.getPackages()
        ]);
        setAvailableTemplates(templatesData);
        setAvailablePackages(packagesData);
      } catch (_error) {
        console.error('Error fetching data:', _error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async (invitationData: any) => {
    try {
      let response;
      if (editId) {
        response = await apiService.updateEvent(editId as string, invitationData);
      } else {
        response = await apiService.createEvent(invitationData);
      }
      
      router.push({
        pathname: '/success' as any,
        params: {
          id: response.id,
          title: formData.title,
          date: formData.date,
          time: formData.time,
          location: formData.location,
          eventType: selectedEventType || 'other',
          preInvitedGuests: JSON.stringify(preInvitedGuests),
        },
      });
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('خطأ', 'فشل في حفظ الدعوة. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleNext = () => {
    if (currentStep === 0 && !selectedEventType) {
      Alert.alert('تنبيه', 'يرجى اختيار نوع المناسبة');
      return;
    }
    if (currentStep === 1 && !selectedTemplate) {
      Alert.alert('تنبيه', 'يرجى اختيار تصميم للدعوة');
      return;
    }
    if (currentStep === 2 && !formData.title) {
      Alert.alert('تنبيه', 'يرجى إدخال عنوان الدعوة');
      return;
    }
    if (currentStep === 2 && !formData.guestCount) {
      Alert.alert('تنبيه', 'يرجى إدخال عدد المدعوين');
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const invitationData = {
        title: formData.title,
        eventType: selectedEventType || 'other',
        hostName: formData.hostName,
        honoreeName: formData.honoreeName,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        message: formData.message,
        guestCount: formData.guestCount,
        templateId: selectedTemplate,
        themeId: selectedTheme,
        packageId: selectedPackage,
        preInvitedGuests: preInvitedGuests
      };

      handleCreate(invitationData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const filteredTemplates = selectedEventType 
    ? availableTemplates.filter(t => t.category === selectedEventType || selectedEventType === 'other')
    : availableTemplates;

  const getPlaceholderByType = () => {
    switch (selectedEventType) {
      case 'wedding': return 'مثال: حفل زفاف أحمد وسارة';
      case 'birthday': return 'مثال: عيد ميلاد ليان';
      case 'graduation': return 'مثال: حفل تخرج محمد';
      case 'corporate': return 'مثال: حفل تدشين الشركة';
      default: return 'مثال: حفل المناسبة';
    }
  };

  const getEmojiByType = (type: string) => {
    switch (type) {
      case 'wedding': return '💍';
      case 'birthday': return '🎂';
      case 'graduation': return '🎓';
      case 'corporate': return '🏢';
      case 'party': return '🎉';
      default: return '✨';
    }
  };

  const getHostLabel = () => {
    switch (selectedEventType) {
      case 'wedding': return 'اسم العريس';
      case 'birthday': return 'اسم صاحب عيد الميلاد';
      case 'graduation': return 'اسم الخريج';
      case 'corporate': return 'اسم الشركة / المنظم';
      default: return 'اسم المضيف';
    }
  };

  const getHostPlaceholder = () => {
    switch (selectedEventType) {
      case 'wedding': return 'أدخل اسم العريس';
      case 'birthday': return 'أدخل اسم صاحب عيد الميلاد';
      case 'graduation': return 'أدخل اسم الخريج';
      case 'corporate': return 'أدخل اسم الشركة أو المنظم';
      default: return 'أدخل اسم المضيف';
    }
  };

  const getHonoreeLabel = () => {
    switch (selectedEventType) {
      case 'wedding': return 'اسم العروس';
      case 'birthday': return 'اسم المدعو الرئيسي (اختياري)';
      case 'corporate': return 'اسم جهة الاتصال (اختياري)';
      default: return null;
    }
  };

  const getHonoreePlaceholder = () => {
    switch (selectedEventType) {
      case 'wedding': return 'أدخل اسم العروس';
      case 'birthday': return 'أدخل اسم المدعو الرئيسي';
      case 'corporate': return 'أدخل اسم جهة الاتصال';
      default: return '';
    }
  };

  const openLocationInMaps = async () => {
    let locationToOpen = formData.location ? formData.location.trim() : '';
    
    if (!locationToOpen) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('تنبيه', 'يرجى تفعيل خدمة الموقع لاستخدام هذه الميزة');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        // Use coordinates
        locationToOpen = `${latitude},${longitude}`;
        // Update input to show we found it (optional, but good UX)
        setFormData(prev => ({ ...prev, location: locationToOpen }));
      } catch (_error) {
        console.error('Error getting location:', _error);
        Alert.alert('خطأ', 'فشل تحديد الموقع الحالي');
        return;
      }
    }

    // Check if it's already a link
    if (locationToOpen.includes('google.com/maps') || locationToOpen.includes('goo.gl/maps') || locationToOpen.includes('maps.app.goo.gl')) {
      Linking.openURL(locationToOpen).catch(() => Alert.alert('خطأ', 'لا يمكن فتح الرابط'));
      return;
    }

    // Otherwise search or open map with coords
    const encodedLocation = encodeURIComponent(locationToOpen);
    const url = Platform.select({
      ios: `maps://maps.apple.com/?q=${encodedLocation}`,
      android: `geo:0,0?q=${encodedLocation}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`,
    });

    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`).catch(() => {
        Alert.alert('خطأ', 'لا يمكن فتح الخريطة');
      });
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>اختر نوع المناسبة</Text>
            <Text style={styles.stepSubtitle}>حدد نوع الحفل أو المناسبة التي تريد إنشاء دعوة لها</Text>
            <View style={styles.eventTypesGrid}>
              {eventTypes.map((type: any) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.eventTypeCard,
                    selectedEventType === type.id && { borderColor: type.color, borderWidth: 2 }
                  ]}
                  onPress={() => setSelectedEventType(type.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.eventTypeIcon, { backgroundColor: `${type.color}20` }]}>
                    {type.icon}
                  </View>
                  <Text style={styles.eventTypeName}>{type.name}</Text>
                  {selectedEventType === type.id && (
                    <View style={[styles.eventTypeCheck, { backgroundColor: type.color }]}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 1:
        if (loadingData) {
          return (
            <View style={{ flex: 1, paddingVertical: 50, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={{ color: Colors.textSecondary, marginTop: 16 }}>جاري تحميل القوالب...</Text>
            </View>
          );
        }
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>اختر التصميم المناسب</Text>
            <Text style={styles.stepSubtitle}>اختر من مجموعتنا الواسعة من القوالب الفاخرة</Text>
            
            <View style={styles.templatesSection}>
              {filteredTemplates.length === 0 ? (
                <View style={styles.noTemplates}>
                  <Text style={styles.noTemplatesText}>لا توجد قوالب متاحة لهذا النوع حالياً</Text>
                  <Text style={styles.noTemplatesSubtext}>يمكنك تصفح جميع القوالب المتاحة أدناه</Text>
                  <View style={styles.templatesGrid}>
                    {availableTemplates.slice(0, 4).map((template: any) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        selected={selectedTemplate === template.id}
                        onSelect={() => setSelectedTemplate(template.id)}
                      />
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.templatesGrid}>
                  {filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      selected={selectedTemplate === template.id}
                      onSelect={() => setSelectedTemplate(template.id)}
                    />
                  ))}
                </View>
              )}
            </View>

            <View style={styles.themesHeader}>
              <Palette size={20} color={Colors.primary} />
              <Text style={styles.themesTitle}>اختر تنسيق الألوان</Text>
            </View>
            <Text style={styles.themesSubtitle}>اجعل دعوتك مميزة باختيار تنسيق الألوان المفضل لديك</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themesList} style={{ marginBottom: 20 }}>
              {invitationThemes.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.themeCard,
                    selectedTheme === theme.id && { borderColor: Colors.primary, borderWidth: 2 }
                  ]}
                  onPress={() => setSelectedTheme(theme.id)}
                >
                  <View style={[styles.themePreview, { backgroundColor: theme.backgroundColor }]}>
                    <View style={[styles.themeColorCircle, { backgroundColor: theme.primaryColor }]} />
                    <View style={[styles.themeColorCircle, { backgroundColor: theme.accentColor, marginLeft: -10 }]} />
                  </View>
                  <Text style={[styles.themeName, { color: Colors.white }]}>{theme.nameAr}</Text>
                  {selectedTheme === theme.id && (
                    <View style={styles.themeCheck}>
                      <Text style={styles.checkMarkSmall}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Live Preview Section */}
            {selectedTemplate && (
              <View style={styles.livePreviewContainer}>
                <View style={styles.previewHeader}>
                  <Sparkles size={18} color={Colors.primary} />
                  <Text style={styles.previewTitle}>معاينة حية للدعوة</Text>
                </View>
                <View style={[styles.previewCard, { backgroundColor: (invitationThemes.find(t => t.id === selectedTheme) || invitationThemes[0]).backgroundColor }]}>
                  <RNImage 
                    source={{ uri: availableTemplates.find(t => t.id === selectedTemplate)?.imageUrl || availableTemplates.find(t => t.id === selectedTemplate)?.image }} 
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  <View style={styles.previewContent}>
                    <Text style={[styles.previewEventTitle, { color: (invitationThemes.find(t => t.id === selectedTheme) || invitationThemes[0]).primaryColor }]}>
                      {formData.title || getPlaceholderByType()}
                    </Text>
                    <View style={[styles.previewDivider, { backgroundColor: (invitationThemes.find(t => t.id === selectedTheme) || invitationThemes[0]).accentColor }]} />
                    <Text style={[styles.previewDate, { color: (invitationThemes.find(t => t.id === selectedTheme) || invitationThemes[0]).textColor }]}>
                      {formData.date || '٢٠٢٤/١٢/٣١'} • {formData.time || '٠٨:٠٠ م'}
                    </Text>
                    <Text style={[styles.previewLocation, { color: (invitationThemes.find(t => t.id === selectedTheme) || invitationThemes[0]).textColor }]}>
                      {formData.location || 'اسم القاعة أو الموقع'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.previewHint}>هذا عرض تقريبي لمظهر دعوتك النهائي</Text>
              </View>
            )}
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>تفاصيل الدعوة</Text>
            <Text style={styles.stepSubtitle}>أضف معلومات مناسبتك</Text>
            <Input
              label="عنوان الدعوة"
              placeholder={getPlaceholderByType()}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              icon={<MessageSquare size={18} color={Colors.textMuted} />}
            />
            <Input
              label="عدد المدعوين"
              placeholder="مثال: 50"
              value={formData.guestCount}
              onChangeText={(text) => setFormData({ ...formData, guestCount: text.replace(/[^0-9]/g, '') })}
              keyboardType="numeric"
              icon={<Users size={18} color={Colors.textMuted} />}
            />
            <Input
              label={getHostLabel()}
              placeholder={getHostPlaceholder()}
              value={formData.hostName}
              onChangeText={(text) => setFormData({ ...formData, hostName: text })}
              icon={<User size={18} color={Colors.textMuted} />}
            />
            {getHonoreeLabel() && (
              <Input
                label={getHonoreeLabel()!}
                placeholder={getHonoreePlaceholder()}
                value={formData.honoreeName}
                onChangeText={(text) => setFormData({ ...formData, honoreeName: text })}
                icon={<User size={18} color={Colors.textMuted} />}
              />
            )}
            
            {/* New Professional Date & Time Input */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>التاريخ</Text>
                <TouchableOpacity 
                  style={styles.pickerInput} 
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <Calendar size={18} color={Colors.primary} />
                  <Text style={[styles.pickerText, !formData.date && styles.placeholderText]}>
                    {formData.date || 'اختر التاريخ'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>الوقت</Text>
                <TouchableOpacity 
                  style={styles.pickerInput} 
                  onPress={() => setShowTimePicker(true)}
                  activeOpacity={0.8}
                >
                  <Clock size={18} color={Colors.primary} />
                  <Text style={[styles.pickerText, !formData.time && styles.placeholderText]}>
                    {formData.time || 'اختر الوقت'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Enhanced Location Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.inputLabel}>الموقع</Text>
              <View style={styles.enhancedLocationInput}>
                <View style={styles.locationInputInner}>
                  <MapPin size={18} color={Colors.textMuted} />
                  <TextInput
                    style={styles.textInputFlex}
                    placeholder="رابط الموقع أو اسم المكان"
                    placeholderTextColor={Colors.textMuted}
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                  />
                </View>
                <View style={styles.locationActions}>
                  <TouchableOpacity onPress={handlePasteLocation} style={styles.locationActionBtn}>
                    <ClipboardIcon size={18} color={Colors.textSecondary} />
                  </TouchableOpacity>
                  <View style={styles.verticalDivider} />
                  <TouchableOpacity onPress={openLocationInMaps} style={styles.locationActionBtn}>
                    <MapIcon size={18} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.helperText}>يمكنك نسخ رابط الموقع من خرائط جوجل ولصقه هنا</Text>
            </View>

            <Input
              label="رسالة الدعوة (اختياري)"
              placeholder="أضف رسالة خاصة للضيوف"
              value={formData.message}
              onChangeText={(text) => setFormData({ ...formData, message: text })}
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>إضافة مدعوين (اختياري)</Text>
            <Text style={styles.stepSubtitle}>أضف أشخاص وأرسل لهم الدعوة عبر واتساب مباشرة</Text>
            
            <View style={styles.addGuestCard}>
              <Text style={styles.addGuestTitle}>إضافة مدعو جديد</Text>
              <Input
                label="اسم المدعو"
                placeholder="أدخل اسم المدعو"
                value={newGuestName}
                onChangeText={setNewGuestName}
                icon={<User size={18} color={Colors.textMuted} />}
              />
              <Input
                label="رقم الهاتف (واتساب)"
                placeholder="مثال: 966501234567"
                value={newGuestPhone}
                onChangeText={(text) => setNewGuestPhone(text.replace(/[^0-9]/g, ''))}
                keyboardType="phone-pad"
                icon={<Phone size={18} color={Colors.textMuted} />}
              />
              <Input
                label="عدد المرافقين المسموح"
                placeholder="عدد الأشخاص الذين يمكنه إضافتهم معه"
                value={newGuestMaxCompanions}
                onChangeText={(text) => setNewGuestMaxCompanions(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                icon={<Users size={18} color={Colors.textMuted} />}
              />
              <Button
                title="إضافة المدعو"
                onPress={() => {
                  if (!newGuestName.trim()) {
                    Alert.alert('تنبيه', 'يرجى إدخال اسم المدعو');
                    return;
                  }
                  if (!newGuestPhone.trim() || newGuestPhone.length < 10) {
                    Alert.alert('تنبيه', 'يرجى إدخال رقم هاتف صحيح');
                    return;
                  }
                  const newGuest: PreInvitedGuest = {
                    id: `pre_${Date.now()}`,
                    name: newGuestName.trim(),
                    phone: newGuestPhone.trim(),
                    maxCompanions: parseInt(newGuestMaxCompanions) || 1,
                  };
                  setPreInvitedGuests([...preInvitedGuests, newGuest]);
                  setNewGuestName('');
                  setNewGuestPhone('');
                  setNewGuestMaxCompanions('1');
                }}
                icon={<Plus size={18} color={Colors.background} />}
                style={styles.addGuestBtn}
              />
            </View>

            {preInvitedGuests.length > 0 && (
              <View style={styles.guestsList}>
                <Text style={styles.guestsListTitle}>المدعوين المضافين ({preInvitedGuests.length})</Text>
                {preInvitedGuests.map((guest, index) => (
                  <View key={guest.id} style={styles.guestItem}>
                    <TouchableOpacity
                      style={styles.removeGuestBtn}
                      onPress={() => {
                        setPreInvitedGuests(preInvitedGuests.filter(g => g.id !== guest.id));
                      }}
                    >
                      <Trash2 size={18} color={Colors.error} />
                    </TouchableOpacity>
                    <View style={styles.guestItemInfo}>
                      <Text style={styles.guestItemName}>{guest.name}</Text>
                      <Text style={styles.guestItemPhone}>{guest.phone}</Text>
                      <Text style={styles.guestItemCompanions}>مرافقين: {guest.maxCompanions}</Text>
                    </View>
                    <View style={styles.guestItemNumber}>
                      <Text style={styles.guestNumber}>{index + 1}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.skipNote}>
              <UserPlus size={20} color={Colors.textSecondary} />
              <Text style={styles.skipNoteText}>
                يمكنك تخطي هذه الخطوة ومشاركة رابط الدعوة العام لاحقاً
              </Text>
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>اختر الباقة المناسبة</Text>
            <Text style={styles.stepSubtitle}>باقات متنوعة تناسب احتياجاتك ومتطلباتك</Text>
            {loadingData ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 20 }} />
            ) : (
              availablePackages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  selected={selectedPackage === pkg.id}
                  onSelect={() => setSelectedPackage(pkg.id)}
                />
              ))
            )}
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>تفاصيل الدفع</Text>
            <Text style={styles.stepSubtitle}>أدخل بيانات البطاقة لإتمام الشراء</Text>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>ملخص الطلب</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryValue}>{formData.title || 'دعوة جديدة'}</Text>
                <Text style={styles.summaryLabel}>الدعوة</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryValue}>
                  {eventTypes.find(t => t.id === selectedEventType)?.name || 'غير محدد'}
                </Text>
                <Text style={styles.summaryLabel}>نوع المناسبة</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryValue}>{formData.guestCount || '0'} شخص</Text>
                <Text style={styles.summaryLabel}>عدد المدعوين</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryValue}>
                  {availablePackages.find(p => p.id === selectedPackage)?.nameAr || availablePackages.find(p => p.id === selectedPackage)?.name}
                </Text>
                <Text style={styles.summaryLabel}>الباقة</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalValue}>
                  {availablePackages.find(p => p.id === selectedPackage)?.price || 0} ريال
                </Text>
                <Text style={styles.totalLabel}>الإجمالي</Text>
              </View>
            </View>

            <View style={styles.paymentMethods}>
              <Text style={styles.paymentTitle}>طريقة الدفع</Text>
              <View style={styles.methodsRow}>
                <TouchableOpacity style={[styles.methodBtn, styles.methodBtnActive]}>
                  <Text style={styles.methodText}>بطاقة ائتمان</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.methodBtn}>
                  <Text style={styles.methodTextInactive}>Apple Pay</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Input
              label="رقم البطاقة"
              placeholder="0000 0000 0000 0000"
              keyboardType="numeric"
            />
            <View style={styles.row}>
              <Input
                label="تاريخ الانتهاء"
                placeholder="MM/YY"
                containerStyle={styles.halfInput}
              />
              <Input
                label="CVV"
                placeholder="123"
                keyboardType="numeric"
                containerStyle={styles.halfInput}
              />
            </View>
            <Input
              label="اسم حامل البطاقة"
              placeholder="الاسم كما يظهر على البطاقة"
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronRight size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editId ? 'تعديل الدعوة' : 'إنشاء دعوة جديدة'}</Text>
          <View style={styles.placeholder} />
        </View>

        <ProgressSteps steps={steps} currentStep={currentStep} />

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {loadingInitialData || (loadingData && currentStep === 1) ? (
            <View style={{ flex: 1, paddingVertical: 50, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={{ color: Colors.textSecondary, marginTop: 16 }}>جاري التحميل...</Text>
            </View>
          ) : (
            renderStepContent()
          )}
        </ScrollView>

        <View style={styles.footer}>
          {currentStep > 0 && (
            <Button
              title="السابق"
              variant="outline"
              onPress={handleBack}
              style={styles.backButton}
            />
          )}
          <Button
            title={currentStep === steps.length - 1 ? 'إتمام الدفع' : 'التالي'}
            onPress={handleNext}
            style={styles.nextButton}
          />
        </View>

        {/* Preview Modal */}
        <Modal visible={showPreview} transparent animationType="slide" onRequestClose={() => setShowPreview(false)}>
          <SafeAreaView style={styles.previewModalContainer}>
            <View style={styles.previewModalHeader}>
              <TouchableOpacity style={styles.closePreviewBtn} onPress={() => setShowPreview(false)}>
                <X size={24} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.previewHeaderTitle}>معاينة الدعوة</Text>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.previewModalScroll}>
              <View style={[styles.previewPage, { backgroundColor: (invitationThemes.find(t => t.id === selectedTheme) || invitationThemes[0]).backgroundColor }]}>
                <View style={[styles.previewCardFull, { borderColor: `${(invitationThemes.find(t => t.id === selectedTheme) || invitationThemes[0]).accentColor}30` }]}>
                  {/* Template Image */}
                  <RNImage 
                    source={{ uri: availableTemplates.find(t => t.id === selectedTemplate)?.imageUrl || availableTemplates.find(t => t.id === selectedTemplate)?.image }} 
                    style={styles.previewCardImageFull}
                    resizeMode="cover"
                  />
                  
                  {/* Decorative Header */}
                  <View style={[styles.previewCardHeader, { backgroundColor: (invitationThemes.find(t => t.id === selectedTheme) || invitationThemes[0]).accentColor }]}>
                    <Text style={styles.previewEmojiSmall}>{getEmojiByType(selectedEventType)}</Text>
                    <Text style={[styles.previewTypeLabel, { color: (invitationThemes.find(t => t.id === selectedTheme) || invitationThemes[0]).backgroundColor }]}>
                      {eventTypes.find(t => t.id === selectedEventType)?.name || 'دعوة'}
                    </Text>
                  </View>

                  {/* Main Content */}
                  <View style={styles.previewCardContentFull}>
                    <Text style={[styles.previewTitleFull, { color: (invitationThemes.find(t => t.id === selectedTheme) || invitationThemes[0]).primaryColor }]}>
                      {formData.title || getPlaceholderByType()}
                    </Text>
                    
                    {formData.hostName && (
                      <Text style={[styles.previewHostFull, { color: (invitationThemes.find(t => t.id === selectedTheme) || invitationThemes[0]).textColor }]}>
                        يتشرف {formData.hostName} بدعوتكم لحضور
                      </Text>
                    )}
                    
                    <View style={[styles.previewDividerFull, { backgroundColor: (invitationThemes.find(t => t.id === selectedTheme) || invitationThemes[0]).accentColor }]} />
                    
                    <View style={styles.previewInfoRowFull}>
                      <Calendar size={20} color={(invitationThemes.find(t => t.id === selectedTheme) || invitationThemes[0]).accentColor} />
                      <Text style={[styles.previewInfoTextFull, { color: (invitationThemes.find(t => t.id === selectedTheme) || invitationThemes[0]).textColor }]}>
                        {formData.date || '٣١ ديسمبر ٢٠٢٤'}
                      </Text>
                    </View>
                    
                    <View style={styles.previewInfoRowFull}>
                      <Clock size={20} color={(invitationThemes.find(t => t.id === selectedTheme) || invitationThemes[0]).accentColor} />
                      <Text style={[styles.previewInfoTextFull, { color: (invitationThemes.find(t => t.id === selectedTheme) || invitationThemes[0]).textColor }]}>
                        {formData.time || '٠٨:٠٠ م'}
                      </Text>
                    </View>
                    
                    <View style={styles.previewInfoRowFull}>
                      <MapPin size={20} color={(invitationThemes.find(t => t.id === selectedTheme) || invitationThemes[0]).accentColor} />
                      <Text style={[styles.previewInfoTextFull, { color: (invitationThemes.find(t => t.id === selectedTheme) || invitationThemes[0]).textColor }]}>
                        {formData.location || 'اسم القاعة أو الموقع'}
                      </Text>
                    </View>

                    {formData.message ? (
                      <Text style={[styles.previewMessageFull, { color: (invitationThemes.find(t => t.id === selectedTheme) || invitationThemes[0]).textColor }]}>
                        {formData.message}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Floating Preview Button */}
        {selectedTemplate && currentStep >= 1 && (
          <TouchableOpacity 
            style={styles.floatingPreviewBtn}
            onPress={() => setShowPreview(true)}
          >
            <Sparkles size={24} color={Colors.navy} />
            <Text style={styles.floatingPreviewText}>معاينة</Text>
          </TouchableOpacity>
        )}

        {/* Date Picker Modal */}
        <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
            <View style={styles.pickerModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>اختر التاريخ</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={dateOptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.pickerItem, formData.date === item.value && styles.pickerItemActive]}
                    onPress={() => {
                      setFormData({ ...formData, date: item.value });
                      setShowDatePicker(false);
                    }}
                  >
                    <Calendar size={18} color={formData.date === item.value ? Colors.navy : Colors.textMuted} />
                    <Text style={[styles.pickerItemText, formData.date === item.value && styles.pickerItemTextActive]}>
                      {item.label}
                    </Text>
                    {formData.date === item.value && <Text style={styles.checkMark}>✓</Text>}
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </Pressable>
        </Modal>

        {/* Time Picker Modal */}
        <Modal visible={showTimePicker} transparent animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowTimePicker(false)}>
            <View style={styles.pickerModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>اختر الوقت</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={timeOptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.pickerItem, formData.time === item.value && styles.pickerItemActive]}
                    onPress={() => {
                      setFormData({ ...formData, time: item.value });
                      setShowTimePicker(false);
                    }}
                  >
                    <Clock size={18} color={formData.time === item.value ? Colors.navy : Colors.textMuted} />
                    <Text style={[styles.pickerItemText, formData.time === item.value && styles.pickerItemTextActive]}>
                      {item.label}
                    </Text>
                    {formData.time === item.value && <Text style={styles.checkMark}>✓</Text>}
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600' as const,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 30, 
  },
  stepContent: {
    paddingTop: 8,
  },
  stepTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  eventTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  eventTypeCard: {
    width: '47%',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  eventTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  eventTypeName: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  eventTypeCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  noTemplates: {
    alignItems: 'center',
  },
  noTemplatesText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  noTemplatesSubtext: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 20,
  },
  templatesSection: {
    paddingTop: 8,
  },
  themesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 32,
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  themesTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  themesSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 16,
  },
  themesList: {
    paddingVertical: 8,
    gap: 12,
  },
  themeCard: {
    width: 120,
    height: 140,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'space-between',
  },
  themePreview: {
    width: '100%',
    height: 70,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeColorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  themeName: {
    fontSize: 12,
    fontWeight: '600' as const,
    textAlign: 'center',
    marginTop: 8,
  },
  themeCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMarkSmall: {
    color: Colors.navy,
    fontSize: 12,
    fontWeight: '700' as const,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  locationInput: {
    flex: 1,
  },

  
  // New Styles for Picker & Location
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'right',
  },
  pickerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundInput, // Dark input background
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
    height: 52,
  },
  pickerText: {
    color: Colors.white,
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  placeholderText: {
    color: Colors.textMuted,
  },
  enhancedLocationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundInput,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingRight: 10, // Left parsing
    overflow: 'hidden',
    height: 52,
  },
  locationInputInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    gap: 10,
  },
  textInputFlex: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    textAlign: 'right',
    height: '100%',
  },
  inputIcon: {
    marginRight: 0,
  },
  locationActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationActionBtn: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  helperText: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 6,
    textAlign: 'right',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  pickerModalContent: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 20,
    maxHeight: '60%',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  pickerItemActive: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    borderBottomWidth: 0,
    marginVertical: 2,
  },
  pickerItemText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
  },
  pickerItemTextActive: {
    color: Colors.navy,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 16,
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  summaryValue: {
    color: Colors.white,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  totalLabel: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  totalValue: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  paymentMethods: {
    marginBottom: 20,
  },
  paymentTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500' as const,
    marginBottom: 12,
    textAlign: 'right',
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  methodBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundInput,
  },
  methodText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  methodTextInactive: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  addGuestCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addGuestTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 16,
    textAlign: 'right',
  },
  addGuestBtn: {
    marginTop: 8,
  },
  guestsList: {
    marginBottom: 20,
  },
  guestsListTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
    textAlign: 'right',
  },
  guestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guestItemNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestNumber: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  guestItemInfo: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'flex-end',
  },
  guestItemName: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  guestItemPhone: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  guestItemCompanions: {
    color: Colors.primary,
    fontSize: 11,
    marginTop: 2,
  },
  removeGuestBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.error}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skipNoteText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  
  // Preview Styles
  livePreviewContainer: {
    marginTop: 10,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'flex-end',
  },
  previewTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  previewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  previewImage: {
    width: '100%',
    height: 180,
  },
  previewContent: {
    padding: 20,
    alignItems: 'center',
  },
  previewEventTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  previewDivider: {
    width: 60,
    height: 2,
    marginVertical: 12,
    borderRadius: 1,
  },
  previewDate: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  previewLocation: {
    fontSize: 13,
    opacity: 0.8,
    textAlign: 'center',
  },
  previewHint: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  floatingPreviewBtn: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 100,
  },
  floatingPreviewText: {
    color: Colors.navy,
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 14,
  },
  previewModalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  previewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  previewHeaderTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  closePreviewBtn: {
    padding: 4,
  },
  previewModalScroll: {
    flexGrow: 1,
  },
  previewPage: {
    padding: 20,
    minHeight: '100%',
  },
  previewCardFull: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  previewCardImageFull: {
    width: '100%',
    height: 250,
  },
  previewCardHeader: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  previewEmojiSmall: {
    fontSize: 24,
  },
  previewTypeLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  previewCardContentFull: {
    padding: 30,
    alignItems: 'center',
  },
  previewTitleFull: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  previewHostFull: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 10,
  },
  previewDividerFull: {
    width: 80,
    height: 2,
    marginVertical: 20,
    borderRadius: 1,
  },
  previewInfoRowFull: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  previewInfoTextFull: {
    fontSize: 16,
    fontWeight: '500',
  },
  previewMessageFull: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 22,
    opacity: 0.8,
  },
});
