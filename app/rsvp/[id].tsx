import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  TextInput, Alert, Image, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Calendar, MapPin, Clock, CheckCircle, User, Phone, Users, Plus, Trash2, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { apiService } from '@/services/api';
import { AcceptedGuest, Companion, PreInvitedGuest } from '@/types';

const typeLabels: Record<string, string> = {
  wedding: 'دعوة زفاف',
  birthday: 'دعوة عيد ميلاد',
  graduation: 'دعوة تخرج',
  corporate: 'دعوة فعالية',
  other: 'دعوة',
};

export default function RSVPScreen() {
  const { id, guestId, guestPhone } = useLocalSearchParams<{ id: string; guestId?: string; guestPhone?: string }>();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [guestQRCode, setGuestQRCode] = useState('');
  const [preInvitedGuest, setPreInvitedGuest] = useState<PreInvitedGuest | null>(null);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [newCompanionName, setNewCompanionName] = useState('');
  const [showCompanionForm, setShowCompanionForm] = useState(false);
  const [savedGuest, setSavedGuest] = useState<AcceptedGuest | null>(null);
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      apiService.getEventById(id)
        .then(data => {
          setInvitation(data);
          
          if (guestId && guestPhone && data.guests) {
            const found = data.guests.find((g: any) => g.id === guestId && g.phone === guestPhone);
            if (found) {
              setPreInvitedGuest(found);
              setName(found.name);
              setPhone(found.phone);
            }
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id, guestId, guestPhone]);
  
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!invitation) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>لم يتم العثور على الدعوة</Text>
            <Text style={styles.notFoundSubtext}>قد تكون الدعوة غير صالحة أو منتهية</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const addCompanion = () => {
    if (!newCompanionName.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم المرافق');
      return;
    }
    if (preInvitedGuest && companions.length >= preInvitedGuest.maxCompanions) {
      Alert.alert('تنبيه', `لا يمكن إضافة أكثر من ${preInvitedGuest.maxCompanions} مرافقين`);
      return;
    }
    const newCompanion: Companion = {
      id: `comp_${Date.now()}`,
      name: newCompanionName.trim(),
    };
    setCompanions([...companions, newCompanion]);
    setNewCompanionName('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeCompanion = (compId: string) => {
    setCompanions(companions.filter(c => c.id !== compId));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAcceptInvitation = async () => {
    if (!name.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسمك');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال رقم هاتفك');
      return;
    }
    if (phone.length < 10) {
      Alert.alert('خطأ', 'يرجى إدخال رقم هاتف صحيح');
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      let result;
      if (preInvitedGuest) {
        result = await apiService.updateRSVP(preInvitedGuest.id, {
          rsvpStatus: 'attending',
          actualCompanions: companions.length
        });
      } else {
        result = await apiService.addGuest(id!, {
          name: name.trim(),
          phone: phone.trim(),
          rsvpStatus: 'attending',
          actualCompanions: companions.length
        });
      }

      const finalGuestId = result.id;
      const qrData = JSON.stringify({
        guestId: finalGuestId,
        invitationId: id,
        name: name.trim(),
        phone: phone.trim(),
        companionsCount: companions.length,
      });
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&bgcolor=1a1a2e&color=ffffff`;

      const newGuest: AcceptedGuest = {
        id: finalGuestId,
        invitationId: id || '',
        name: name.trim(),
        phone: phone.trim(),
        acceptedAt: new Date().toISOString(),
        qrCode: qrCodeUrl,
        companions: companions,
        preInvitedGuestId: preInvitedGuest?.id,
      };

      setGuestQRCode(qrCodeUrl);
      setSavedGuest(newGuest);
      setIsAccepted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (preInvitedGuest && preInvitedGuest.maxCompanions > 0 && companions.length === 0) {
        setTimeout(() => {
          Alert.alert(
            'تم تأكيد حضورك! 🎉',
            `يمكنك إضافة حتى ${preInvitedGuest.maxCompanions} مرافقين معك. هل تريد إضافتهم الآن؟`,
            [
              { text: 'لاحقاً', style: 'cancel' },
              { text: 'نعم، أضف مرافقين', onPress: () => setShowCompanionForm(true) },
            ]
          );
        }, 500);
      }
    } catch (error) {
      console.log('Error accepting invitation:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تأكيد الحضور');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCompanionsLater = async () => {
    if (companions.length === 0) {
      Alert.alert('تنبيه', 'يرجى إضافة مرافق واحد على الأقل');
      return;
    }

    try {
      if (!savedGuest?.id) return;

      await apiService.updateRSVP(savedGuest.id, {
        rsvpStatus: 'accepted',
        actualCompanions: companions.length
      });

      const updatedGuest = { ...savedGuest, companions };
      setSavedGuest(updatedGuest);
      setShowCompanionForm(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('تم!', 'تمت إضافة المرافقين بنجاح');
    } catch (error) {
      console.log('Error updating companions:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إضافة المرافقين');
    }
  };

  if (isAccepted) {
    if (showCompanionForm && preInvitedGuest) {
      return (
        <View style={styles.container}>
          <Stack.Screen options={{ headerShown: false }} />
          <KeyboardAvoidingView 
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <SafeAreaView style={styles.safeArea}>
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.companionHeader}>
                  <Text style={styles.companionTitle}>إضافة المرافقين</Text>
                  <Text style={styles.companionSubtitle}>
                    يمكنك إضافة حتى {preInvitedGuest.maxCompanions} مرافقين
                  </Text>
                  <View style={styles.companionCounter}>
                    <Text style={styles.companionCounterText}>
                      {companions.length} / {preInvitedGuest.maxCompanions}
                    </Text>
                  </View>
                </View>

                {companions.length < preInvitedGuest.maxCompanions && (
                  <View style={styles.addCompanionCard}>
                    <View style={styles.inputContainer}>
                      <View style={styles.inputIcon}>
                        <User size={20} color={Colors.textSecondary} />
                      </View>
                      <TextInput
                        style={styles.input}
                        placeholder="اسم المرافق"
                        placeholderTextColor={Colors.textSecondary}
                        value={newCompanionName}
                        onChangeText={setNewCompanionName}
                        textAlign="right"
                      />
                    </View>
                    <Button
                      title="إضافة"
                      onPress={addCompanion}
                      icon={<Plus size={18} color={Colors.background} />}
                      style={styles.addCompanionBtn}
                    />
                  </View>
                )}

                {companions.length > 0 && (
                  <View style={styles.companionsList}>
                    <Text style={styles.companionsListTitle}>المرافقين المضافين</Text>
                    {companions.map((comp: any, index: number) => (
                      <View key={comp.id} style={styles.companionItem}>
                        <TouchableOpacity
                          style={styles.removeCompanionBtn}
                          onPress={() => removeCompanion(comp.id)}
                        >
                          <Trash2 size={16} color={Colors.error} />
                        </TouchableOpacity>
                        <Text style={styles.companionName}>{comp.name}</Text>
                        <View style={styles.companionNumber}>
                          <Text style={styles.companionNumberText}>{index + 1}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.companionActions}>
                  <Button
                    title="حفظ المرافقين"
                    onPress={handleAddCompanionsLater}
                    style={styles.saveCompanionsBtn}
                  />
                  <Button
                    title="تخطي"
                    variant="outline"
                    onPress={() => setShowCompanionForm(false)}
                  />
                </View>
              </ScrollView>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.successContent}
          >
            <View style={styles.successIcon}>
              <CheckCircle size={60} color={Colors.success} />
            </View>
            <Text style={styles.successTitle}>تم تأكيد حضورك!</Text>
            <Text style={styles.successSubtitle}>
              شكراً لك {name}، نتطلع لرؤيتك في {invitation.title}
            </Text>

            <View style={styles.qrSection}>
              <Text style={styles.qrTitle}>رمز QR الخاص بك</Text>
              <Text style={styles.qrSubtitle}>احتفظ بهذا الرمز لتأكيد حضورك في الفعالية</Text>
              <View style={styles.qrContainer}>
                <Image 
                  source={{ uri: guestQRCode }} 
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.guestInfo}>
                <Text style={styles.guestName}>{name}</Text>
                <Text style={styles.guestPhone}>{phone}</Text>
                {(savedGuest?.companions?.length ?? 0) > 0 && (
                  <View style={styles.companionsBadge}>
                    <Users size={14} color={Colors.primary} />
                    <Text style={styles.companionsBadgeText}>
                      + {savedGuest?.companions?.length} مرافقين
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {preInvitedGuest && preInvitedGuest.maxCompanions > 0 && (savedGuest?.companions?.length ?? 0) < preInvitedGuest.maxCompanions && (
              <TouchableOpacity 
                style={styles.addMoreCompanions}
                onPress={() => setShowCompanionForm(true)}
              >
                <Plus size={18} color={Colors.primary} />
                <Text style={styles.addMoreCompanionsText}>
                  إضافة مرافقين ({savedGuest?.companions?.length ?? 0}/{preInvitedGuest.maxCompanions})
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.eventSummary}>
              <View style={styles.eventRow}>
                <Text style={styles.eventValue}>{invitation.date}</Text>
                <View style={styles.eventLabel}>
                  <Text style={styles.eventLabelText}>التاريخ</Text>
                  <Calendar size={16} color={Colors.primary} />
                </View>
              </View>
              <View style={styles.eventRow}>
                <Text style={styles.eventValue}>{invitation.time}</Text>
                <View style={styles.eventLabel}>
                  <Text style={styles.eventLabelText}>الوقت</Text>
                  <Clock size={16} color={Colors.primary} />
                </View>
              </View>
              <View style={styles.eventRow}>
                <Text style={styles.eventValue}>{invitation.location}</Text>
                <View style={styles.eventLabel}>
                  <Text style={styles.eventLabelText}>الموقع</Text>
                  <MapPin size={16} color={Colors.primary} />
                </View>
              </View>
            </View>

            <Text style={styles.tipText}>
              💡 قم بالتقاط صورة للشاشة للاحتفاظ برمز QR
            </Text>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.header}>
              <Text style={styles.typeLabel}>{typeLabels[invitation.type]}</Text>
              <Text style={styles.title}>{invitation.title}</Text>
            </View>

            {preInvitedGuest && (
              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeText}>مرحباً {preInvitedGuest.name}! 👋</Text>
                <Text style={styles.welcomeSubtext}>
                  أنت مدعو مع {preInvitedGuest.maxCompanions} مرافقين كحد أقصى
                </Text>
                <View style={styles.welcomeNote}>
                  <AlertCircle size={16} color={Colors.warning} />
                  <Text style={styles.welcomeNoteText}>
                    قم بتأكيد حضورك أولاً، ثم يمكنك إضافة المرافقين
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>{invitation.date}</Text>
                <View style={styles.infoLabel}>
                  <Text style={styles.infoLabelText}>التاريخ</Text>
                  <Calendar size={18} color={Colors.primary} />
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>{invitation.time}</Text>
                <View style={styles.infoLabel}>
                  <Text style={styles.infoLabelText}>الوقت</Text>
                  <Clock size={18} color={Colors.primary} />
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>{invitation.location}</Text>
                <View style={styles.infoLabel}>
                  <Text style={styles.infoLabelText}>الموقع</Text>
                  <MapPin size={18} color={Colors.primary} />
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formTitle}>تأكيد الحضور</Text>
              <Text style={styles.formSubtitle}>
                يرجى إدخال بياناتك للحصول على رمز QR الخاص بك
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <User size={20} color={Colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="الاسم الكامل"
                  placeholderTextColor={Colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                  textAlign="right"
                  editable={!preInvitedGuest}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Phone size={20} color={Colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="رقم الهاتف"
                  placeholderTextColor={Colors.textSecondary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  textAlign="right"
                  editable={!preInvitedGuest}
                />
              </View>

              <Button
                title={isSubmitting ? 'جاري التأكيد...' : 'تأكيد الحضور'}
                onPress={handleAcceptInvitation}
                loading={isSubmitting}
                style={styles.submitButton}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  notFoundSubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  typeLabel: {
    color: Colors.primary,
    fontSize: 14,
    marginBottom: 8,
  },
  title: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: '700' as const,
    textAlign: 'center',
  },
  welcomeCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  welcomeText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  welcomeSubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 12,
  },
  welcomeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${Colors.warning}20`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  welcomeNoteText: {
    color: Colors.warning,
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
  },
  infoCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabelText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  formSection: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '600' as const,
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundInput,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontSize: 16,
    paddingVertical: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  successContent: {
    padding: 20,
    alignItems: 'center',
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.success}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  successTitle: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  qrSection: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  qrTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  qrSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  guestInfo: {
    alignItems: 'center',
  },
  guestName: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  guestPhone: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  companionsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${Colors.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  companionsBadgeText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '500' as const,
  },
  addMoreCompanions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 24,
    width: '100%',
  },
  addMoreCompanionsText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  eventSummary: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    marginBottom: 24,
  },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  eventLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventLabelText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  eventValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  tipText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  companionHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  companionTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  companionSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  companionCounter: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  companionCounterText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  addCompanionCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addCompanionBtn: {
    marginTop: 8,
  },
  companionsList: {
    marginBottom: 20,
  },
  companionsListTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
    textAlign: 'right',
  },
  companionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  companionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companionNumberText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  companionName: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500' as const,
    marginHorizontal: 12,
    textAlign: 'right',
  },
  removeCompanionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.error}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companionActions: {
    gap: 12,
  },
  saveCompanionsBtn: {
    marginBottom: 0,
  },
});
