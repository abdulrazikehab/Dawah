import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share, Linking, Image, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  Calendar, MapPin, Clock, Users, CheckCircle, XCircle, 
  HelpCircle, Share2, Edit2, Send, Trash2, ChevronRight, QrCode, X, Copy, MessageCircle, UserCheck
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { sampleInvitations } from '@/mocks/data';

import { apiService } from '@/services/api';

const statusColors: Record<string, string> = {
  draft: Colors.warning,
  active: Colors.success,
  completed: Colors.info,
  cancelled: Colors.error,
  pending: Colors.warning,
};

const statusLabels: Record<string, string> = {
  draft: 'مسودة',
  active: 'نشطة',
  completed: 'مكتملة',
  cancelled: 'ملغية',
  pending: 'قيد الانتظار',
};

const typeLabels: Record<string, string> = {
  wedding: 'زفاف',
  birthday: 'عيد ميلاد',
  graduation: 'تخرج',
  corporate: 'شركات',
  other: 'أخرى',
};

const packageLabels: Record<string, string> = {
  basic: 'الباقة الأساسية',
  premium: 'باقة بريميم',
  professional: 'الباقة الاحترافية',
};

const eventLabels: Record<string, {
  guestStats: string;
  totalGuests: string;
  confirmed: string;
  pending: string;
  declined: string;
  manageGuests: string;
  manageGuestsSubtitle: string;
  sendReminder: string;
  sendReminderSubtitle: string;
  shareInvitation: string;
  shareSubtitle: string;
  editInvitation: string;
  editSubtitle: string;
  deleteInvitation: string;
  deleteConfirm: string;
  reminderMessage: string;
}> = {
  wedding: {
    guestStats: 'إحصائيات المدعوين',
    totalGuests: 'إجمالي المدعوين',
    confirmed: 'تأكيد الحضور',
    pending: 'في انتظار الرد',
    declined: 'اعتذار',
    manageGuests: 'إدارة المدعوين',
    manageGuestsSubtitle: 'عرض وتعديل قائمة المدعوين',
    sendReminder: 'إرسال تذكير',
    sendReminderSubtitle: 'تذكير المدعوين الذين لم يردوا',
    shareInvitation: 'مشاركة الدعوة',
    shareSubtitle: 'شارك رابط الدعوة مع الآخرين',
    editInvitation: 'تعديل الدعوة',
    editSubtitle: 'تحديث تفاصيل الدعوة',
    deleteInvitation: 'حذف الدعوة',
    deleteConfirm: 'هل أنت متأكد من حذف هذه الدعوة؟ لا يمكن التراجع عن هذا الإجراء.',
    reminderMessage: 'سيتم إرسال تذكير إلى المدعوين الذين لم يردوا بعد',
  },
  birthday: {
    guestStats: 'إحصائيات الضيوف',
    totalGuests: 'إجمالي الضيوف',
    confirmed: 'تأكيد الحضور',
    pending: 'في انتظار الرد',
    declined: 'اعتذار',
    manageGuests: 'إدارة الضيوف',
    manageGuestsSubtitle: 'عرض وتعديل قائمة الضيوف',
    sendReminder: 'إرسال تذكير',
    sendReminderSubtitle: 'تذكير الضيوف الذين لم يردوا',
    shareInvitation: 'مشاركة الدعوة',
    shareSubtitle: 'شارك رابط الدعوة مع الأصدقاء',
    editInvitation: 'تعديل الدعوة',
    editSubtitle: 'تحديث تفاصيل الحفلة',
    deleteInvitation: 'حذف الدعوة',
    deleteConfirm: 'هل أنت متأكد من حذف هذه الدعوة؟ لا يمكن التراجع عن هذا الإجراء.',
    reminderMessage: 'سيتم إرسال تذكير إلى الضيوف الذين لم يردوا بعد',
  },
  graduation: {
    guestStats: 'إحصائيات المدعوين',
    totalGuests: 'إجمالي المدعوين',
    confirmed: 'تأكيد الحضور',
    pending: 'في انتظار الرد',
    declined: 'اعتذار',
    manageGuests: 'إدارة المدعوين',
    manageGuestsSubtitle: 'عرض وتعديل قائمة المدعوين',
    sendReminder: 'إرسال تذكير',
    sendReminderSubtitle: 'تذكير المدعوين الذين لم يردوا',
    shareInvitation: 'مشاركة الدعوة',
    shareSubtitle: 'شارك رابط الدعوة مع العائلة والأصدقاء',
    editInvitation: 'تعديل الدعوة',
    editSubtitle: 'تحديث تفاصيل حفل التخرج',
    deleteInvitation: 'حذف الدعوة',
    deleteConfirm: 'هل أنت متأكد من حذف هذه الدعوة؟ لا يمكن التراجع عن هذا الإجراء.',
    reminderMessage: 'سيتم إرسال تذكير إلى المدعوين الذين لم يردوا بعد',
  },
  corporate: {
    guestStats: 'إحصائيات المشاركين',
    totalGuests: 'إجمالي المشاركين',
    confirmed: 'تأكيد المشاركة',
    pending: 'في انتظار الرد',
    declined: 'اعتذار',
    manageGuests: 'إدارة المشاركين',
    manageGuestsSubtitle: 'عرض وتعديل قائمة المشاركين',
    sendReminder: 'إرسال تذكير',
    sendReminderSubtitle: 'تذكير المشاركين الذين لم يردوا',
    shareInvitation: 'مشاركة الدعوة',
    shareSubtitle: 'شارك رابط الدعوة مع الزملاء',
    editInvitation: 'تعديل الدعوة',
    editSubtitle: 'تحديث تفاصيل الفعالية',
    deleteInvitation: 'حذف الدعوة',
    deleteConfirm: 'هل أنت متأكد من حذف هذه الدعوة؟ لا يمكن التراجع عن هذا الإجراء.',
    reminderMessage: 'سيتم إرسال تذكير إلى المشاركين الذين لم يردوا بعد',
  },
  other: {
    guestStats: 'إحصائيات المدعوين',
    totalGuests: 'إجمالي المدعوين',
    confirmed: 'تأكيد الحضور',
    pending: 'في انتظار الرد',
    declined: 'اعتذار',
    manageGuests: 'إدارة المدعوين',
    manageGuestsSubtitle: 'عرض وتعديل قائمة المدعوين',
    sendReminder: 'إرسال تذكير',
    sendReminderSubtitle: 'تذكير المدعوين الذين لم يردوا',
    shareInvitation: 'مشاركة الدعوة',
    shareSubtitle: 'شارك رابط الدعوة مع الآخرين',
    editInvitation: 'تعديل الدعوة',
    editSubtitle: 'تحديث تفاصيل الدعوة',
    deleteInvitation: 'حذف الدعوة',
    deleteConfirm: 'هل أنت متأكد من حذف هذه الدعوة؟ لا يمكن التراجع عن هذا الإجراء.',
    reminderMessage: 'سيتم إرسال تذكير إلى المدعوين الذين لم يردوا بعد',
  },
};

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showQRModal, setShowQRModal] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      setLoading(true);
      apiService.getEventById(id)
        .then(data => {
          setInvitation(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);
  
  const invitationLink = `https://daawat.app/invite/${id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(invitationLink)}&bgcolor=1a1a2e&color=ffffff`;
  
  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'جاري التحميل...' }} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>جاري تحميل تفاصيل الدعوة...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!invitation) {

    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'تفاصيل الدعوة' }} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>لم يتم العثور على الدعوة</Text>
            <Button title="العودة" onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const statusColor = statusColors[invitation.status];
  const responseRate = Math.round((invitation.confirmedCount / invitation.guestCount) * 100);
  const labels = eventLabels[invitation.type] || eventLabels.other;

  const handleManageGuests = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      labels.manageGuests,
      `${labels.totalGuests}: ${invitation.guestCount}\n${labels.confirmed}: ${invitation.confirmedCount}\n${labels.pending}: ${invitation.pendingCount}\n${labels.declined}: ${invitation.declinedCount}`,
      [{ text: 'حسناً', style: 'default' }]
    );
  };

  const handleViewAcceptedGuests = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/guests/[id]' as any, params: { id: id as string } });
  };

  const handleSendReminder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      labels.sendReminder,
      `${labels.reminderMessage} (${invitation.pendingCount})`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'إرسال', 
          onPress: () => {
            Alert.alert('تم', 'تم إرسال التذكير بنجاح');
          }
        }
      ]
    );
  };

  const handleShareInvitation = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const message = `دعوة: ${invitation.title}\nالتاريخ: ${invitation.date}\nالوقت: ${invitation.time}\nالموقع: ${invitation.location}\n\nرابط الدعوة: ${invitationLink}`;
      await Share.share({
        message,
        title: invitation.title,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleShareWhatsApp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const message = `🎉 *${invitation.title}*\n\n📅 التاريخ: ${invitation.date}\n⏰ الوقت: ${invitation.time}\n📍 الموقع: ${invitation.location}\n\n✨ يسعدنا دعوتكم لحضور هذه المناسبة\n\n🔗 رابط الدعوة:\n${invitationLink}`;
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        const webWhatsApp = `https://wa.me/?text=${encodeURIComponent(message)}`;
        await Linking.openURL(webWhatsApp);
      }
    } catch (error) {
      console.log('Error opening WhatsApp:', error);
      Alert.alert('خطأ', 'تعذر فتح واتساب');
    }
  };

  const handleCopyLink = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(invitationLink);
    Alert.alert('تم النسخ', 'تم نسخ رابط الدعوة بنجاح');
  };

  const handleShowQR = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowQRModal(true);
  };

  const handleEditInvitation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/create' as any);
  };

  const handleDeleteInvitation = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      labels.deleteInvitation,
      labels.deleteConfirm,
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('تم', 'تم حذف الدعوة بنجاح', [
              { text: 'حسناً', onPress: () => router.back() }
            ]);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'تفاصيل الدعوة' }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={styles.typeRow}>
            <Text style={styles.typeLabel}>{typeLabels[invitation.type]}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabels[invitation.status]}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>{invitation.title}</Text>
          <Text style={styles.packageLabel}>{packageLabels[invitation.package]}</Text>
        </View>

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

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>{labels.guestStats}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${Colors.info}20` }]}>
                <Users size={20} color={Colors.info} />
              </View>
              <Text style={styles.statValue}>{invitation.guestCount}</Text>
              <Text style={styles.statLabel}>{labels.totalGuests}</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${Colors.success}20` }]}>
                <CheckCircle size={20} color={Colors.success} />
              </View>
              <Text style={styles.statValue}>{invitation.confirmedCount}</Text>
              <Text style={styles.statLabel}>{labels.confirmed}</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${Colors.warning}20` }]}>
                <HelpCircle size={20} color={Colors.warning} />
              </View>
              <Text style={styles.statValue}>{invitation.pendingCount}</Text>
              <Text style={styles.statLabel}>{labels.pending}</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${Colors.error}20` }]}>
                <XCircle size={20} color={Colors.error} />
              </View>
              <Text style={styles.statValue}>{invitation.declinedCount}</Text>
              <Text style={styles.statLabel}>{labels.declined}</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressPercent}>{responseRate}%</Text>
            <Text style={styles.progressTitle}>نسبة الاستجابة</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${responseRate}%` }]} />
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleViewAcceptedGuests} activeOpacity={0.7}>
            <ChevronRight size={20} color={Colors.textSecondary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>عرض الحضور المؤكد</Text>
              <Text style={styles.actionSubtitle}>عرض قائمة الضيوف مع رموز QR</Text>
            </View>
            <View style={[styles.actionIcon, { backgroundColor: `${Colors.success}20` }]}>
              <UserCheck size={20} color={Colors.success} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleManageGuests} activeOpacity={0.7}>
            <ChevronRight size={20} color={Colors.textSecondary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{labels.manageGuests}</Text>
              <Text style={styles.actionSubtitle}>{labels.manageGuestsSubtitle}</Text>
            </View>
            <View style={[styles.actionIcon, { backgroundColor: `${Colors.info}20` }]}>
              <Users size={20} color={Colors.info} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleSendReminder} activeOpacity={0.7}>
            <ChevronRight size={20} color={Colors.textSecondary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{labels.sendReminder}</Text>
              <Text style={styles.actionSubtitle}>{labels.sendReminderSubtitle}</Text>
            </View>
            <View style={[styles.actionIcon, { backgroundColor: `${Colors.warning}20` }]}>
              <Send size={20} color={Colors.warning} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleShareInvitation} activeOpacity={0.7}>
            <ChevronRight size={20} color={Colors.textSecondary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{labels.shareInvitation}</Text>
              <Text style={styles.actionSubtitle}>{labels.shareSubtitle}</Text>
            </View>
            <View style={[styles.actionIcon, { backgroundColor: `${Colors.primary}20` }]}>
              <Share2 size={20} color={Colors.primary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleEditInvitation} activeOpacity={0.7}>
            <ChevronRight size={20} color={Colors.textSecondary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{labels.editInvitation}</Text>
              <Text style={styles.actionSubtitle}>{labels.editSubtitle}</Text>
            </View>
            <View style={[styles.actionIcon, { backgroundColor: `${Colors.success}20` }]}>
              <Edit2 size={20} color={Colors.success} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>مشاركة الدعوة</Text>
          
          <View style={styles.qrCard}>
            <TouchableOpacity style={styles.qrPreview} onPress={handleShowQR} activeOpacity={0.8}>
              <Image 
                source={{ uri: qrCodeUrl }} 
                style={styles.qrImage}
                resizeMode="contain"
              />
              <Text style={styles.qrHint}>اضغط للتكبير</Text>
            </TouchableOpacity>
            
            <View style={styles.shareButtons}>
              <TouchableOpacity style={styles.whatsappBtn} onPress={handleShareWhatsApp} activeOpacity={0.8}>
                <MessageCircle size={20} color="#fff" />
                <Text style={styles.whatsappBtnText}>إرسال عبر واتساب</Text>
              </TouchableOpacity>
              
              <View style={styles.shareRow}>
                <TouchableOpacity style={styles.shareBtn} onPress={handleCopyLink} activeOpacity={0.8}>
                  <Copy size={18} color={Colors.primary} />
                  <Text style={styles.shareBtnText}>نسخ الرابط</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.shareBtn} onPress={handleShowQR} activeOpacity={0.8}>
                  <QrCode size={18} color={Colors.primary} />
                  <Text style={styles.shareBtnText}>عرض QR</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.dangerSection}>
          <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteInvitation} activeOpacity={0.7}>
            <Trash2 size={18} color={Colors.error} />
            <Text style={styles.dangerButtonText}>{labels.deleteInvitation}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer} />
      </ScrollView>

      <Modal
        visible={showQRModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalClose} 
              onPress={() => setShowQRModal(false)}
              activeOpacity={0.7}
            >
              <X size={24} color={Colors.white} />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>{invitation.title}</Text>
            <Text style={styles.modalSubtitle}>امسح رمز QR للانضمام للدعوة</Text>
            
            <View style={styles.qrContainer}>
              <Image 
                source={{ uri: qrCodeUrl }} 
                style={styles.qrImageLarge}
                resizeMode="contain"
              />
            </View>
            
            <Text style={styles.linkText}>{invitationLink}</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalWhatsappBtn} onPress={handleShareWhatsApp} activeOpacity={0.8}>
                <MessageCircle size={20} color="#fff" />
                <Text style={styles.modalWhatsappText}>مشاركة عبر واتساب</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.modalCopyBtn} onPress={handleCopyLink} activeOpacity={0.8}>
                <Copy size={18} color={Colors.primary} />
                <Text style={styles.modalCopyText}>نسخ الرابط</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  notFoundText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600' as const,
  },
  headerSection: {
    padding: 20,
    paddingTop: 8,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  title: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700' as const,
    textAlign: 'right',
    marginBottom: 8,
  },
  packageLabel: {
    color: Colors.primary,
    fontSize: 13,
    textAlign: 'right',
  },
  infoCard: {
    backgroundColor: Colors.backgroundCard,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
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
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 16,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  progressSection: {
    backgroundColor: Colors.backgroundCard,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  progressPercent: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.backgroundInput,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  actionsSection: {
    padding: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
    marginRight: 12,
    alignItems: 'flex-end',
  },
  actionTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  actionSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  qrSection: {
    padding: 20,
  },
  qrCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  qrPreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: Colors.backgroundInput,
  },
  qrHint: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  shareButtons: {
    width: '100%',
    gap: 12,
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#25D366',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  whatsappBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  shareRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.backgroundInput,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '500' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700' as const,
    marginTop: 20,
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  qrImageLarge: {
    width: 200,
    height: 200,
  },
  linkText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  modalWhatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#25D366',
    borderRadius: 12,
    paddingVertical: 14,
  },
  modalWhatsappText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  modalCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.backgroundInput,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCopyText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  dangerSection: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: `${Colors.error}15`,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: `${Colors.error}30`,
  },
  dangerButtonText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  footer: {
    height: 40,
  },
});
