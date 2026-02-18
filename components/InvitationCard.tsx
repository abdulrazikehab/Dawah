import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Calendar, MapPin, Users, ChevronLeft, MessageCircle, QrCode } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Invitation } from '@/types';

interface InvitationCardProps {
  invitation: Invitation;
  onPress: () => void;
  onShowQR?: () => void;
}

const statusLabels: Record<string, string> = {
  draft: 'مسودة',
  active: 'نشطة',
  completed: 'مكتملة',
  cancelled: 'ملغية',
};

const typeLabels: Record<string, string> = {
  wedding: 'زفاف',
  birthday: 'عيد ميلاد',
  graduation: 'تخرج',
  corporate: 'شركات',
  other: 'أخرى',
};

export default function InvitationCard({ invitation, onPress, onShowQR }: InvitationCardProps) {
  const { colors } = useTheme();
  
  const statusColors: Record<string, string> = {
    draft: colors.warning,
    active: colors.success,
    completed: colors.info,
    cancelled: colors.error,
  };
  
  const statusColor = statusColors[invitation.status];
  const invitationLink = `https://daawat.app/invite/${invitation.id}`;

  const handleWhatsAppShare = async () => {
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
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusLabels[invitation.status]}
          </Text>
        </View>
        <Text style={[styles.type, { color: colors.textSecondary }]}>{typeLabels[invitation.type]}</Text>
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>{invitation.title}</Text>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Calendar size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{invitation.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>{invitation.location}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.guestInfo}>
          <Users size={14} color={colors.primary} />
          <Text style={[styles.guestCount, { color: colors.primary }]}>
            {invitation.confirmedCount}/{invitation.guestCount} ضيف
          </Text>
        </View>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.quickActionBtn, { backgroundColor: colors.backgroundInput }]} 
            onPress={(e) => { e.stopPropagation(); handleWhatsAppShare(); }}
            activeOpacity={0.7}
          >
            <MessageCircle size={16} color="#25D366" />
          </TouchableOpacity>
          {onShowQR && (
            <TouchableOpacity 
              style={[styles.quickActionBtn, { backgroundColor: colors.backgroundInput }]} 
              onPress={(e) => { e.stopPropagation(); onShowQR(); }}
              activeOpacity={0.7}
            >
              <QrCode size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
          <ChevronLeft size={20} color={colors.textSecondary} />
        </View>
      </View>
      
      <View style={[styles.progressBar, { backgroundColor: colors.backgroundInput }]}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${(invitation.confirmedCount / invitation.guestCount) * 100}%`, backgroundColor: colors.primary }
          ]} 
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  type: {
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
    textAlign: 'right',
  },
  details: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guestCount: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
