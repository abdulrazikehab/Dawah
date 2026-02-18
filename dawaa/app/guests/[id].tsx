import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, Alert, Modal, Share, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  Users, QrCode, Download, Share2, X, Phone, 
  Calendar, CheckCircle, RefreshCw 
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';


import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { AcceptedGuest } from '@/types';
import { apiService } from '@/services/api';

const typeLabels: Record<string, string> = {
  wedding: 'زفاف',
  birthday: 'عيد ميلاد',
  graduation: 'تخرج',
  corporate: 'شركات',
  other: 'أخرى',
};

export default function GuestsListScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [guests, setGuests] = useState<any[]>([]);
  const [invitation, setInvitation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGuest, setSelectedGuest] = useState<any | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const loadGuests = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await apiService.getEventById(id);
      setInvitation(data);
      
      // Filter for attending guests and add QR code
      const confirmedGuests = (data.guests || [])
        .filter((g: any) => g.rsvpStatus === 'attending')
        .map((g: any) => {
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(g.id)}&bgcolor=ffffff&color=000000`;
          
          return {
            ...g,
            qrCode: qrCodeUrl,
            acceptedAt: g.updatedAt || new Date().toISOString()
          };
        });

      setGuests(confirmedGuests);
    } catch (error) {
      console.log('Error loading guests:', error);
      Alert.alert('خطأ', 'فشل في تحميل قائمة الضيوف');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadGuests();
  }, [loadGuests]);

  const handleRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadGuests();
  };

  const handleViewQR = (guest: AcceptedGuest) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGuest(guest);
    setShowQRModal(true);
  };

  const handleDownloadQR = async (guest: AcceptedGuest) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (Platform.OS === 'web') {
      try {
        const link = document.createElement('a');
        link.href = guest.qrCode;
        link.download = `qr_${guest.name.replace(/\s+/g, '_')}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Alert.alert('تم', 'تم فتح رمز QR للتحميل');
      } catch (error) {
        console.log('Error downloading QR:', error);
        Alert.alert('تنبيه', 'اضغط مطولاً على رمز QR لحفظه');
      }
      return;
    }

    try {
      const message = `رمز QR للضيف: ${guest.name}\n\nرابط رمز QR:\n${guest.qrCode}`;
      await Share.share({
        message,
        title: `رمز QR - ${guest.name}`,
      });
    } catch (error) {
      console.log('Error sharing QR:', error);
      Alert.alert('تنبيه', 'اضغط مطولاً على رمز QR لحفظه');
    }
  };

  const handleShareGuest = async (guest: AcceptedGuest) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const message = `✅ تأكيد حضور\n\nالاسم: ${guest.name}\nرقم الهاتف: ${guest.phone}\nتاريخ التأكيد: ${new Date(guest.acceptedAt).toLocaleDateString('ar-SA')}`;
      await Share.share({
        message,
        title: `تأكيد حضور - ${guest.name}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!invitation) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'قائمة الحضور' }} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>لم يتم العثور على الدعوة</Text>
            <Button title="العودة" onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'قائمة الحضور' }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.invitationTitle}>{invitation.title}</Text>
          <Text style={styles.invitationType}>{typeLabels[invitation.type]}</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: `${Colors.success}20` }]}>
              <CheckCircle size={24} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>{guests.length}</Text>
            <Text style={styles.statLabel}>تأكيد الحضور</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleRefresh}>
            <RefreshCw size={18} color={Colors.primary} />
            <Text style={styles.actionBtnText}>تحديث</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.guestsSection}>
          <Text style={styles.sectionTitle}>الضيوف المؤكدون ({guests.length})</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>جاري التحميل...</Text>
            </View>
          ) : guests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Users size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>لا يوجد ضيوف حتى الآن</Text>
              <Text style={styles.emptySubtitle}>
                شارك رابط الدعوة ليتمكن الضيوف من تأكيد حضورهم
              </Text>
            </View>
          ) : (
            guests.map((guest) => (
              <View key={guest.id} style={styles.guestCard}>
                <View style={styles.guestHeader}>
                  <View style={styles.guestActions}>
                    <TouchableOpacity 
                      style={styles.guestActionBtn}
                      onPress={() => handleShareGuest(guest)}
                    >
                      <Share2 size={16} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.guestActionBtn}
                      onPress={() => handleDownloadQR(guest)}
                    >
                      <Download size={16} color={Colors.success} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.guestActionBtn}
                      onPress={() => handleViewQR(guest)}
                    >
                      <QrCode size={16} color={Colors.info} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.guestInfo}>
                    <Text style={styles.guestName}>{guest.name}</Text>
                    <View style={styles.guestPhone}>
                      <Text style={styles.guestPhoneText}>{guest.phone}</Text>
                      <Phone size={12} color={Colors.textSecondary} />
                    </View>
                  </View>
                </View>
                
                <View style={styles.guestFooter}>
                  <TouchableOpacity 
                    style={styles.qrPreview}
                    onPress={() => handleViewQR(guest)}
                  >
                    <Image 
                      source={{ uri: guest.qrCode }} 
                      style={styles.qrPreviewImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <View style={styles.guestDate}>
                    <Calendar size={12} color={Colors.textSecondary} />
                    <Text style={styles.guestDateText}>
                      {formatDate(guest.acceptedAt)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
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
            >
              <X size={24} color={Colors.white} />
            </TouchableOpacity>
            
            {selectedGuest && (
              <>
                <Text style={styles.modalTitle}>{selectedGuest.name}</Text>
                <Text style={styles.modalSubtitle}>{selectedGuest.phone}</Text>
                
                <View style={styles.qrContainer}>
                  <Image 
                    source={{ uri: selectedGuest.qrCode }} 
                    style={styles.qrImageLarge}
                    resizeMode="contain"
                  />
                </View>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.downloadBtn} 
                    onPress={() => handleDownloadQR(selectedGuest)}
                  >
                    <Download size={18} color="#fff" />
                    <Text style={styles.downloadBtnText}>تحميل رمز QR</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.shareBtn} 
                    onPress={() => handleShareGuest(selectedGuest)}
                  >
                    <Share2 size={18} color={Colors.primary} />
                    <Text style={styles.shareBtnText}>مشاركة</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  header: {
    padding: 20,
    paddingTop: 8,
    alignItems: 'center',
  },
  invitationTitle: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  invitationType: {
    color: Colors.primary,
    fontSize: 14,
  },
  statsCard: {
    backgroundColor: Colors.backgroundCard,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '500' as const,
  },
  guestsSection: {
    padding: 20,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 16,
    textAlign: 'right',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  emptyContainer: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  guestCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  guestInfo: {
    alignItems: 'flex-end',
    flex: 1,
  },
  guestName: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  guestPhone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guestPhoneText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  guestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  guestActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qrPreview: {
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 8,
  },
  qrPreviewImage: {
    width: 50,
    height: 50,
  },
  guestDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guestDateText: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  footer: {
    height: 40,
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
    fontSize: 22,
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
    marginBottom: 20,
  },
  qrImageLarge: {
    width: 220,
    height: 220,
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.success,
    borderRadius: 12,
    paddingVertical: 14,
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  shareBtn: {
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
    fontSize: 14,
    fontWeight: '500' as const,
  },
});
