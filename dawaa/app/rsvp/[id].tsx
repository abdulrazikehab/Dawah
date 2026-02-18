import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  TextInput, Alert, Image, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Calendar, MapPin, Clock, CheckCircle, User, Phone, Users, Plus, Trash2, AlertCircle, Sparkles, Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { apiService } from '@/services/api';
import { AcceptedGuest, Companion, PreInvitedGuest } from '@/types';
import { invitationThemes } from '@/constants/invitationThemes';



const typeLabels: Record<string, string> = {
  wedding: 'دعوة زفاف',
  birthday: 'دعوة عيد ميلاد',
  graduation: 'دعوة تخرج',
  corporate: 'دعوة فعالية',
  other: 'دعوة',
};

const typeEmojis: Record<string, string> = {
  wedding: '💍',
  birthday: '🎂',
  graduation: '🎓',
  corporate: '🏢',
  other: '✨',
};

const typeGradients: Record<string, { bg: string; accent: string; glow: string }> = {
  wedding: { bg: '#0F0A1E', accent: '#D4AF37', glow: '#D4AF3730' },
  birthday: { bg: '#0F1A2E', accent: '#FF6B9D', glow: '#FF6B9D30' },
  graduation: { bg: '#0A1628', accent: '#4FC3F7', glow: '#4FC3F730' },
  corporate: { bg: '#0E1420', accent: '#7C4DFF', glow: '#7C4DFF30' },
  other: { bg: '#0B1426', accent: '#C9A227', glow: '#C9A22730' },
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

  const getTheme = () => {
    if (invitation?.themeId) {
      const selectedTheme = invitationThemes.find(t => t.id === invitation.themeId);
      if (selectedTheme) {
        return {
          bg: selectedTheme.backgroundColor,
          accent: selectedTheme.accentColor,
          glow: `${selectedTheme.accentColor}30`,
          text: selectedTheme.textColor
        };
      }
    }
    return typeGradients[invitation?.eventType || invitation?.type || 'other'] || typeGradients.other;
  };

  const theme = getTheme();

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
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B1426' }]}>
        <View style={styles.loadingPulse}>
          <Sparkles size={40} color="#C9A227" />
        </View>
        <Text style={styles.loadingText}>جاري تحميل الدعوة...</Text>
      </View>
    );
  }

  if (!invitation) {
    return (
      <View style={[styles.container, { backgroundColor: '#0B1426' }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.notFound}>
            <View style={styles.notFoundIcon}>
              <AlertCircle size={48} color="#EF4444" />
            </View>
            <Text style={styles.notFoundText}>لم يتم العثور على الدعوة</Text>
            <Text style={styles.notFoundSubtext}>قد تكون الدعوة غير صالحة أو منتهية</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const eventType = invitation.eventType || invitation.type || 'other';

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
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeCompanion = (compId: string) => {
    setCompanions(companions.filter(c => c.id !== compId));
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      let result;
      if (preInvitedGuest) {
        result = await apiService.updateRSVP(preInvitedGuest.id, {
          rsvpStatus: 'attending',
          actualCompanions: companions.length
        });
      } else {
        result = await apiService.publicRsvp(id!, {
          name: name.trim(),
          phone: phone.trim(),
          rsvpStatus: 'attending',
          actualCompanions: companions.length
        });
      }

      const finalGuestId = result.id;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(finalGuestId)}&bgcolor=0B1426&color=C9A227`;

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
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

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
        rsvpStatus: 'attending',
        actualCompanions: companions.length
      });

      const updatedGuest = { ...savedGuest, companions };
      setSavedGuest(updatedGuest);
      setShowCompanionForm(false);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('تم!', 'تمت إضافة المرافقين بنجاح');
    } catch (error) {
      console.log('Error updating companions:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إضافة المرافقين');
    }
  };

  // --- COMPANION FORM VIEW ---
  if (isAccepted && showCompanionForm && preInvitedGuest) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
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
                <Text style={[styles.companionTitle, { color: theme.accent }]}>إضافة المرافقين</Text>
                <Text style={styles.companionSubtitle}>
                  يمكنك إضافة حتى {preInvitedGuest.maxCompanions} مرافقين
                </Text>
                <View style={[styles.companionCounter, { backgroundColor: theme.accent }]}>
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
                      <View style={[styles.companionNumber, { backgroundColor: theme.accent }]}>
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
                  style={[styles.saveCompanionsBtn, { backgroundColor: theme.accent }]}
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

  // --- SUCCESS / ACCEPTED VIEW WITH QR ---
  if (isAccepted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.successContent}
          >
            {/* Celebration Header */}
            <View style={styles.celebrationHeader}>
              <Text style={styles.celebrationEmoji}>{typeEmojis[eventType]}</Text>
              <View style={[styles.successCheckBg, { backgroundColor: `${Colors.success}20` }]}>
                <CheckCircle size={60} color={Colors.success} />
              </View>
              <Text style={styles.successTitle}>تم تأكيد حضورك!</Text>
              <Text style={styles.successSubtitle}>
                شكراً لك {name}، نتطلع لرؤيتك في {invitation.title}
              </Text>
            </View>

            {/* QR Code Ticket Card */}
            <View style={[styles.ticketCard, { borderColor: `${theme.accent}40` }]}>
              {/* Ticket Header */}
              <View style={[styles.ticketHeader, { backgroundColor: theme.accent }]}>
                <Text style={styles.ticketHeaderTitle}>{invitation.title}</Text>
                <Text style={styles.ticketHeaderType}>{typeLabels[eventType]}</Text>
              </View>

              {/* Ticket Serrated Edge */}
              <View style={styles.ticketSerration}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <View key={i} style={[styles.serrationDot, { backgroundColor: theme.bg }]} />
                ))}
              </View>

              {/* QR Section */}
              <View style={styles.ticketQrSection}>
                <View style={[styles.qrFrame, { borderColor: theme.accent }]}>
                  <Image 
                    source={{ uri: guestQRCode }} 
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.qrScanText, { color: theme.accent }]}>
                  امسح هذا الرمز عند الوصول
                </Text>
              </View>

              {/* Guest Info */}
              <View style={styles.ticketGuestInfo}>
                <View style={styles.ticketInfoRow}>
                  <Text style={styles.ticketInfoValue}>{name}</Text>
                  <Text style={styles.ticketInfoLabel}>الاسم</Text>
                </View>
                <View style={styles.ticketDivider} />
                <View style={styles.ticketInfoRow}>
                  <Text style={styles.ticketInfoValue}>{phone}</Text>
                  <Text style={styles.ticketInfoLabel}>الهاتف</Text>
                </View>
                {(savedGuest?.companions?.length ?? 0) > 0 && (
                  <>
                    <View style={styles.ticketDivider} />
                    <View style={styles.ticketInfoRow}>
                      <View style={[styles.companionsBadge, { backgroundColor: `${theme.accent}20` }]}>
                        <Users size={14} color={theme.accent} />
                        <Text style={[styles.companionsBadgeText, { color: theme.accent }]}>
                          + {savedGuest?.companions?.length} مرافقين
                        </Text>
                      </View>
                      <Text style={styles.ticketInfoLabel}>المرافقين</Text>
                    </View>
                  </>
                )}
              </View>

              {/* Event Details */}
              <View style={styles.ticketEventDetails}>
                <View style={styles.ticketDetailItem}>
                  <Calendar size={16} color={theme.accent} />
                  <Text style={styles.ticketDetailText}>{invitation.date}</Text>
                </View>
                <View style={styles.ticketDetailItem}>
                  <Clock size={16} color={theme.accent} />
                  <Text style={styles.ticketDetailText}>{invitation.time}</Text>
                </View>
                <View style={styles.ticketDetailItem}>
                  <MapPin size={16} color={theme.accent} />
                  <Text style={styles.ticketDetailText}>{invitation.location}</Text>
                </View>
              </View>
            </View>

            {preInvitedGuest && preInvitedGuest.maxCompanions > 0 && (savedGuest?.companions?.length ?? 0) < preInvitedGuest.maxCompanions && (
              <TouchableOpacity 
                style={[styles.addMoreCompanions, { borderColor: theme.accent }]}
                onPress={() => setShowCompanionForm(true)}
              >
                <Plus size={18} color={theme.accent} />
                <Text style={[styles.addMoreCompanionsText, { color: theme.accent }]}>
                  إضافة مرافقين ({savedGuest?.companions?.length ?? 0}/{preInvitedGuest.maxCompanions})
                </Text>
              </TouchableOpacity>
            )}

            <Text style={styles.tipText}>
              💡 قم بالتقاط صورة للشاشة للاحتفاظ ببطاقة الدعوة
            </Text>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // --- MAIN INVITATION VIEW ---
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
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
            {/* Invitation Card Design */}
            <View style={[styles.invitationCard, { backgroundColor: theme.bg, borderColor: `${theme.accent}30` }]}>
              {/* Template Image if available */}
              {(invitation.template?.imageUrl || invitation.template?.image) && (
                <View style={styles.cardImageContainer}>
                  <Image 
                    source={{ uri: invitation.template?.imageUrl || invitation.template?.image }} 
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  {/* Gradient overlay or fade if desired, but keep it simple for now */}
                </View>
              )}

              {/* Decorative Top */}
              <View style={[styles.cardTopDecoration, { backgroundColor: theme.accent }]}>
                <View style={styles.cardTopInner}>
                  <View style={[styles.decorativeLine, { backgroundColor: `${theme.bg}40` }]} />
                  <Text style={styles.cardEmoji}>{typeEmojis[eventType]}</Text>
                  <View style={[styles.decorativeLine, { backgroundColor: `${theme.bg}40` }]} />
                </View>
                <Text style={[styles.cardTypeLabel, { color: theme.bg }]}>
                  {typeLabels[eventType]}
                </Text>
              </View>

              {/* Main Title */}
              <View style={styles.cardTitleSection}>
                <Text style={[styles.invitationTitle, { color: theme.accent }]}>
                  {invitation.title}
                </Text>
                {invitation.hostName && (
                  <Text style={styles.hostText}>
                    يتشرف {invitation.hostName}
                  </Text>
                )}
                <Text style={styles.inviteText}>
                  بدعوتكم لحضور
                </Text>
                {invitation.message && (
                  <Text style={styles.messageText}>{invitation.message}</Text>
                )}
              </View>

              {/* Ornamental Divider */}
              <View style={styles.ornamentalDivider}>
                <View style={[styles.ornamentLine, { backgroundColor: `${theme.accent}30` }]} />
                <Heart size={16} color={theme.accent} style={{ opacity: 0.6 }} />
                <View style={[styles.ornamentLine, { backgroundColor: `${theme.accent}30` }]} />
              </View>

              {/* Event Details */}
              <View style={styles.eventDetailsSection}>
                <View style={styles.detailCard}>
                  <Calendar size={22} color={theme.accent} />
                  <View style={styles.detailContent}>
                    <Text style={[styles.detailLabel, { color: theme.accent }]}>التاريخ</Text>
                    <Text style={styles.detailValue}>{invitation.date}</Text>
                  </View>
                </View>

                <View style={styles.detailCard}>
                  <Clock size={22} color={theme.accent} />
                  <View style={styles.detailContent}>
                    <Text style={[styles.detailLabel, { color: theme.accent }]}>الوقت</Text>
                    <Text style={styles.detailValue}>{invitation.time}</Text>
                  </View>
                </View>

                <View style={styles.detailCard}>
                  <MapPin size={22} color={theme.accent} />
                  <View style={styles.detailContent}>
                    <Text style={[styles.detailLabel, { color: theme.accent }]}>الموقع</Text>
                    <Text style={styles.detailValue}>{invitation.location}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Pre-invited Guest Welcome */}
            {preInvitedGuest && (
              <View style={[styles.welcomeCard, { borderColor: theme.accent }]}>
                <Text style={[styles.welcomeText, { color: theme.accent }]}>مرحباً {preInvitedGuest.name}! 👋</Text>
                <Text style={styles.welcomeSubtext}>
                  أنت مدعو مع {preInvitedGuest.maxCompanions} مرافقين كحد أقصى
                </Text>
                <View style={[styles.welcomeNote, { backgroundColor: `${Colors.warning}15` }]}>
                  <AlertCircle size={16} color={Colors.warning} />
                  <Text style={styles.welcomeNoteText}>
                    قم بتأكيد حضورك أولاً، ثم يمكنك إضافة المرافقين
                  </Text>
                </View>
              </View>
            )}

            {/* RSVP Form */}
            <View style={[styles.formSection, { borderColor: `${theme.accent}20` }]}>
              <View style={[styles.formBadge, { backgroundColor: theme.accent }]}>
                <Sparkles size={16} color={theme.bg} />
                <Text style={[styles.formBadgeText, { color: theme.bg }]}>تأكيد الحضور</Text>
              </View>
              <Text style={styles.formSubtitle}>
                يرجى إدخال بياناتك للحصول على بطاقة الدعوة ورمز QR
              </Text>

              <View style={[styles.inputContainer, { borderColor: `${theme.accent}20` }]}>
                <View style={styles.inputIcon}>
                  <User size={20} color={theme.accent} />
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

              <View style={[styles.inputContainer, { borderColor: `${theme.accent}20` }]}>
                <View style={styles.inputIcon}>
                  <Phone size={20} color={theme.accent} />
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

              <TouchableOpacity
                style={[styles.acceptButton, { backgroundColor: theme.accent }]}
                onPress={handleAcceptInvitation}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={theme.bg} />
                ) : (
                  <>
                    <CheckCircle size={20} color={theme.bg} />
                    <Text style={[styles.acceptButtonText, { color: theme.bg }]}>
                      تأكيد الحضور
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer Branding */}
            <View style={styles.branding}>
              <Text style={styles.brandingText}>Dawati</Text>
              <Text style={styles.brandingSubtext}>منصة إدارة الدعوات</Text>
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
  },
  keyboardView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
  },

  // --- Loading ---
  loadingPulse: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#C9A22720',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingText: {
    color: '#A8B5C8',
    fontSize: 16,
  },

  // --- Not Found ---
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF444420',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  notFoundText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  notFoundSubtext: {
    color: '#A8B5C8',
    fontSize: 14,
    textAlign: 'center',
  },

  // --- Invitation Card ---
  invitationCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#000',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardTopDecoration: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  cardTopInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  decorativeLine: {
    flex: 1,
    height: 1,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardTypeLabel: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1,
  },
  cardTitleSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  invitationTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
  },
  hostText: {
    color: '#A8B5C8',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 4,
  },
  inviteText: {
    color: '#8090A8',
    fontSize: 14,
    textAlign: 'center',
  },
  messageText: {
    color: '#A8B5C8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
    lineHeight: 22,
    paddingHorizontal: 16,
  },

  // --- Ornamental Divider ---
  ornamentalDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginVertical: 4,
    gap: 12,
  },
  ornamentLine: {
    flex: 1,
    height: 1,
  },

  // --- Event Details ---
  eventDetailsSection: {
    padding: 20,
    gap: 12,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1628',
    borderRadius: 14,
    padding: 14,
    gap: 14,
  },
  detailContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },

  // --- Welcome Card ---
  welcomeCard: {
    backgroundColor: '#0D1B30',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
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

  // --- Form Section ---
  formSection: {
    backgroundColor: '#0D1B30',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    marginBottom: 24,
  },
  formBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  formBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  formSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1628',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingVertical: 16,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },

  // --- Success / Ticket Card ---
  successContent: {
    padding: 20,
    alignItems: 'center',
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
  },
  celebrationHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  successCheckBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },

  // --- Ticket ---
  ticketCard: {
    backgroundColor: '#0D1B30',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 24,
  },
  ticketHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  ticketHeaderTitle: {
    color: '#0B1426',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  ticketHeaderType: {
    color: '#0B142680',
    fontSize: 12,
    fontWeight: '500',
  },
  ticketSerration: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: -6,
  },
  serrationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  ticketQrSection: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 16,
  },
  qrFrame: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  qrScanText: {
    fontSize: 13,
    fontWeight: '500',
  },
  ticketGuestInfo: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  ticketInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  ticketInfoLabel: {
    color: '#6B7A94',
    fontSize: 13,
  },
  ticketInfoValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  ticketDivider: {
    height: 1,
    backgroundColor: '#243552',
  },
  companionsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  companionsBadgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  ticketEventDetails: {
    backgroundColor: '#0A1628',
    margin: 16,
    marginTop: 0,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  ticketDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ticketDetailText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  addMoreCompanions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0D1B30',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 24,
    width: '100%',
  },
  addMoreCompanionsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tipText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },

  // --- Branding ---
  branding: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    opacity: 0.5,
  },
  brandingText: {
    color: '#C9A227',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  brandingSubtext: {
    color: '#6B7A94',
    fontSize: 11,
    marginTop: 2,
  },

  // --- Companion Form ---
  companionHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  companionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  companionSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  companionCounter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  companionCounterText: {
    color: '#0B1426',
    fontSize: 16,
    fontWeight: '600',
  },
  addCompanionCard: {
    backgroundColor: '#0D1B30',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#24355230',
  },
  addCompanionBtn: {
    marginTop: 8,
  },
  companionsList: {
    marginBottom: 20,
  },
  companionsListTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'right',
  },
  companionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1B30',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#24355230',
  },
  companionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companionNumberText: {
    color: '#0B1426',
    fontSize: 12,
    fontWeight: '600',
  },
  companionName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 12,
    textAlign: 'right',
  },
  removeCompanionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF444420',
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
