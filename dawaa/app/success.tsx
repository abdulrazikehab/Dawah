import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Share, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CheckCircle, Share2, Copy, MessageCircle, Link as LinkIcon, Users, Send, ChevronDown, ChevronUp } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';
import { getInvitationLink } from '@/utils/links';
import Button from '@/components/Button';
import { PreInvitedGuest } from '@/types';

export default function SuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    eventType: string;
    preInvitedGuests?: string;
  }>();

  const [preInvitedGuests, setPreInvitedGuests] = useState<PreInvitedGuest[]>([]);
  const [showGuestsList, setShowGuestsList] = useState(false);
  const [sentGuests, setSentGuests] = useState<string[]>([]);

  const invitationLink = getInvitationLink(params.id || 'demo');

  useEffect(() => {
    if (params.preInvitedGuests) {
      try {
        const guests = JSON.parse(params.preInvitedGuests);
        setPreInvitedGuests(guests);
        AsyncStorage.setItem(`pre_invited_${params.id}`, params.preInvitedGuests);
      } catch (error) {
        console.log('Error parsing pre-invited guests:', error);
      }
    }
  }, [params.preInvitedGuests, params.id]);

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(invitationLink);
    Alert.alert('تم النسخ', 'تم نسخ رابط الدعوة بنجاح');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `أنت مدعو إلى ${params.title || 'مناسبتنا'}!\n\nللرد على الدعوة:\n${invitationLink}`,
        url: invitationLink,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `🎉 أنت مدعو إلى ${params.title || 'مناسبتنا'}!\n\n📅 التاريخ: ${params.date || 'سيتم تحديده'}\n📍 الموقع: ${params.location || 'سيتم تحديده'}\n\nللرد على الدعوة وتأكيد حضورك:\n${invitationLink}`
    );
    const whatsappUrl = `https://wa.me/?text=${message}`;
    Linking.openURL(whatsappUrl);
  };

  const getPersonalInvitationLink = (guest: PreInvitedGuest) => {
    return `${getInvitationLink(params.id || '')}?guestId=${guest.id}&guestPhone=${guest.phone}`;
  };

  const sendWhatsAppToGuest = (guest: PreInvitedGuest) => {
    const personalLink = getPersonalInvitationLink(guest);
    const companionText = guest.maxCompanions > 0 
      ? `\n\n👥 يمكنك إضافة حتى ${guest.maxCompanions} مرافقين معك` 
      : '';
    
    const message = encodeURIComponent(
      `🎉 مرحباً ${guest.name}!\n\nأنت مدعو إلى ${params.title || 'مناسبتنا'}!\n\n📅 التاريخ: ${params.date || 'سيتم تحديده'}\n⏰ الوقت: ${params.time || 'سيتم تحديده'}\n📍 الموقع: ${params.location || 'سيتم تحديده'}${companionText}\n\n✨ للرد على الدعوة وتأكيد حضورك:\n${personalLink}`
    );
    
    const whatsappUrl = `https://wa.me/${guest.phone}?text=${message}`;
    Linking.openURL(whatsappUrl).then(() => {
      if (!sentGuests.includes(guest.id)) {
        setSentGuests([...sentGuests, guest.id]);
      }
    }).catch(() => {
      Alert.alert('خطأ', 'لا يمكن فتح واتساب');
    });
  };

  const sendToAllGuests = () => {
    if (preInvitedGuests.length === 0) return;
    
    Alert.alert(
      'إرسال للجميع',
      `سيتم فتح واتساب لإرسال الدعوة لكل مدعو على حدة.\n\nعدد المدعوين: ${preInvitedGuests.length}`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'ابدأ الإرسال', 
          onPress: () => {
            sendWhatsAppToGuest(preInvitedGuests[0]);
            if (preInvitedGuests.length > 1) {
              Alert.alert(
                'تم إرسال الأول',
                'بعد إرسال الرسالة، عد للتطبيق لإرسال الدعوة للمدعو التالي',
                [{ text: 'حسناً' }]
              );
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <CheckCircle size={64} color={Colors.success} />
            </View>
            
            <Text style={styles.title}>تم إنشاء الدعوة بنجاح!</Text>
            <Text style={styles.subtitle}>
              تم إنشاء دعوتك وهي جاهزة للمشاركة مع ضيوفك
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>ملخص الدعوة</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>{params.title || 'دعوة جديدة'}</Text>
                <Text style={styles.infoLabel}>العنوان</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>{params.date || 'سيتم تحديده'}</Text>
                <Text style={styles.infoLabel}>التاريخ</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>{params.location || 'سيتم تحديده'}</Text>
                <Text style={styles.infoLabel}>الموقع</Text>
              </View>
            </View>

            {preInvitedGuests.length > 0 && (
              <View style={styles.preInvitedSection}>
                <TouchableOpacity 
                  style={styles.preInvitedHeader}
                  onPress={() => setShowGuestsList(!showGuestsList)}
                  activeOpacity={0.7}
                >
                  <View style={styles.preInvitedHeaderLeft}>
                    {showGuestsList ? (
                      <ChevronUp size={20} color={Colors.primary} />
                    ) : (
                      <ChevronDown size={20} color={Colors.primary} />
                    )}
                  </View>
                  <View style={styles.preInvitedHeaderRight}>
                    <Text style={styles.preInvitedTitle}>المدعوين المضافين</Text>
                    <View style={styles.preInvitedBadge}>
                      <Users size={14} color={Colors.background} />
                      <Text style={styles.preInvitedBadgeText}>{preInvitedGuests.length}</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {showGuestsList && (
                  <View style={styles.guestsList}>
                    {preInvitedGuests.map((guest, index) => (
                      <View key={guest.id} style={styles.guestItem}>
                        <TouchableOpacity
                          style={[
                            styles.sendBtn,
                            sentGuests.includes(guest.id) && styles.sendBtnSent
                          ]}
                          onPress={() => sendWhatsAppToGuest(guest)}
                        >
                          {sentGuests.includes(guest.id) ? (
                            <CheckCircle size={16} color={Colors.success} />
                          ) : (
                            <Send size={16} color={Colors.background} />
                          )}
                        </TouchableOpacity>
                        <View style={styles.guestItemInfo}>
                          <Text style={styles.guestItemName}>{guest.name}</Text>
                          <Text style={styles.guestItemPhone}>{guest.phone}</Text>
                          <Text style={styles.guestItemCompanions}>
                            مرافقين: {guest.maxCompanions}
                          </Text>
                        </View>
                        <View style={styles.guestNumber}>
                          <Text style={styles.guestNumberText}>{index + 1}</Text>
                        </View>
                      </View>
                    ))}

                    <Button
                      title="إرسال للجميع عبر واتساب"
                      onPress={sendToAllGuests}
                      icon={<MessageCircle size={18} color={Colors.background} />}
                      style={styles.sendAllBtn}
                    />
                  </View>
                )}
              </View>
            )}

            <View style={styles.linkSection}>
              <Text style={styles.linkTitle}>رابط الدعوة العام</Text>
              <Text style={styles.linkHint}>شارك هذا الرابط مع ضيوف إضافيين</Text>
              <TouchableOpacity style={styles.linkContainer} onPress={handleCopyLink} activeOpacity={0.7}>
                <LinkIcon size={18} color={Colors.primary} />
                <Text style={styles.linkText} numberOfLines={1}>{invitationLink}</Text>
                <Copy size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.shareSection}>
              <Text style={styles.shareTitle}>إجراءات سريعة</Text>
              <View style={styles.shareButtons}>
                <Button
                  title="نسخ الرابط"
                  variant="outline"
                  size="medium"
                  onPress={handleCopyLink}
                  icon={<Copy size={16} color={Colors.primary} />}
                  style={styles.shareButton}
                />
                <Button
                  title="مشاركة"
                  variant="outline"
                  size="medium"
                  onPress={handleShare}
                  icon={<Share2 size={16} color={Colors.primary} />}
                  style={styles.shareButton}
                />
              </View>
              <Button
                title="إرسال عبر واتساب"
                size="medium"
                onPress={handleWhatsAppShare}
                icon={<MessageCircle size={18} color={Colors.background} />}
                style={styles.whatsappButton}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="إدارة الدعوة"
            variant="outline"
            onPress={() => router.push('/(tabs)/invitations' as any)}
            style={styles.footerButton}
          />
          <Button
            title="العودة للرئيسية"
            onPress={() => router.push('/')}
            style={styles.footerButton}
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
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.success}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 16,
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  infoValue: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '500' as const,
  },
  preInvitedSection: {
    width: '100%',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  preInvitedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  preInvitedHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  preInvitedHeaderLeft: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preInvitedTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  preInvitedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  preInvitedBadgeText: {
    color: Colors.background,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  guestsList: {
    padding: 16,
    paddingTop: 0,
  },
  guestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundInput,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  guestNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestNumberText: {
    color: Colors.background,
    fontSize: 12,
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
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnSent: {
    backgroundColor: `${Colors.success}20`,
  },
  sendAllBtn: {
    marginTop: 8,
    backgroundColor: '#25D366',
  },
  linkSection: {
    width: '100%',
    marginBottom: 24,
  },
  linkTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 4,
    textAlign: 'right',
  },
  linkHint: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 12,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 10,
  },
  linkText: {
    flex: 1,
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '500' as const,
  },
  shareSection: {
    width: '100%',
  },
  shareTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 12,
    textAlign: 'right',
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  shareButton: {
    flex: 1,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerButton: {
    flex: 1,
  },
});
