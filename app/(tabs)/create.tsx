import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight, Calendar, MapPin, User, MessageSquare, Users, Heart, Cake, GraduationCap, Briefcase, Sparkles, ExternalLink, Phone, Plus, Trash2, UserPlus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import Input from '@/components/Input';
import ProgressSteps from '@/components/ProgressSteps';
import TemplateCard from '@/components/TemplateCard';
import PackageCard from '@/components/PackageCard';
import { apiService } from '@/services/api';
// ... types ...
import { PackageType, InvitationType, PreInvitedGuest } from '@/types';

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
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEventType, setSelectedEventType] = useState<InvitationType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageType>('premium');
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

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
        packageId: selectedPackage,
        preInvitedGuests: preInvitedGuests
      };

      // Add loading state if needed
      apiService.createEvent(invitationData)
        .then((response) => {
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
        })
        .catch((error) => {
          console.error('API Error:', error);
          Alert.alert('خطأ', 'فشل في إنشاء الدعوة. يرجى المحاولة مرة أخرى.');
        });
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

  const openLocationInMaps = () => {
    if (!formData.location) {
      Alert.alert('تنبيه', 'يرجى إدخال الموقع أولاً');
      return;
    }

    const location = formData.location.trim();
    
    // Check if it's already a Google Maps link
    if (location.includes('google.com/maps') || location.includes('goo.gl/maps') || location.includes('maps.app.goo.gl')) {
      Linking.openURL(location).catch(() => {
        Alert.alert('خطأ', 'لا يمكن فتح الرابط');
      });
      return;
    }

    // Otherwise, search for the location
    const encodedLocation = encodeURIComponent(location);
    const url = Platform.select({
      ios: `maps://maps.apple.com/?q=${encodedLocation}`,
      android: `geo:0,0?q=${encodedLocation}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`,
    });

    Linking.openURL(url).catch(() => {
      // Fallback to Google Maps web
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
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>اختر التصميم المناسب</Text>
            <Text style={styles.stepSubtitle}>اختر من مجموعتنا الواسعة من القوالب الفاخرة</Text>
            {filteredTemplates.length === 0 ? (
              <View style={styles.noTemplates}>
                <Text style={styles.noTemplatesText}>لا توجد قوالب متاحة لهذا النوع</Text>
                <Text style={styles.noTemplatesSubtext}>يمكنك استخدام أي قالب من القوالب المتاحة</Text>
                <View style={styles.templatesGrid}>
                  {availableTemplates.map((template: any) => (
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
            <View style={styles.row}>
              <Input
                label="التاريخ"
                placeholder="2025/03/15"
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
                icon={<Calendar size={18} color={Colors.textMuted} />}
                containerStyle={styles.halfInput}
              />
              <Input
                label="الوقت"
                placeholder="19:00"
                value={formData.time}
                onChangeText={(text) => setFormData({ ...formData, time: text })}
                containerStyle={styles.halfInput}
              />
            </View>
            <View style={styles.locationContainer}>
              <Input
                label="الموقع"
                placeholder="أدخل العنوان أو الصق رابط خرائط جوجل"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                icon={<MapPin size={18} color={Colors.textMuted} />}
                containerStyle={styles.locationInput}
              />
              <TouchableOpacity 
                style={styles.openMapBtn} 
                onPress={openLocationInMaps}
                activeOpacity={0.7}
              >
                <ExternalLink size={20} color={Colors.primary} />
              </TouchableOpacity>
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
          <Text style={styles.headerTitle}>إنشاء دعوة جديدة</Text>
          <View style={styles.placeholder} />
        </View>

        <ProgressSteps steps={steps} currentStep={currentStep} />

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderStepContent()}
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
    paddingBottom: 20,
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
  openMapBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
});
