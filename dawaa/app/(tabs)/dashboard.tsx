import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Mail, Users, CheckCircle, Plus, ChevronLeft, 
  TrendingUp, Calendar, Bell 
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import StatsCard from '@/components/StatsCard';
import InvitationCard from '@/components/InvitationCard';
import Button from '@/components/Button';

import { apiService } from '@/services/api';
import { useFocusEffect } from '@react-navigation/native';
import { useState, useCallback } from 'react';

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(() => {
    setLoading(true);
    apiService.getEvents()
      .then(data => {
        setInvitations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const activeInvitations = invitations.filter((inv: any) => inv.status === 'active');
  const totalGuests = invitations.reduce((acc: number, inv: any) => acc + (inv.guests?.length || 0), 0);
  const confirmedGuests = invitations.reduce((acc: number, inv: any) => 
    acc + (inv.guests?.filter((g: any) => g.rsvpStatus === 'attending').length || 0), 0);


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>مرحباً بك</Text>
              <Text style={[styles.title, { color: colors.text }]}>لوحة التحكم</Text>
            </View>
            <TouchableOpacity style={[styles.notificationBtn, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
              <Bell size={22} color={colors.text} />
              <View style={[styles.notificationBadge, { backgroundColor: colors.error }]} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <StatsCard
                title="إجمالي الدعوات"
                value={invitations.length}
                icon={<Mail size={16} color={colors.primary} />}
                color={colors.primary}
              />
              <StatsCard
                title="الدعوات النشطة"
                value={activeInvitations.length}
                icon={<TrendingUp size={16} color={colors.success} />}
                color={colors.success}
              />
            </View>
            <View style={styles.statsRow}>
              <StatsCard
                title="إجمالي الضيوف"
                value={totalGuests}
                icon={<Users size={16} color={colors.info} />}
                color={colors.info}
              />
              <StatsCard
                title="الردود المؤكدة"
                value={confirmedGuests}
                subtitle={`${totalGuests > 0 ? Math.round((confirmedGuests / totalGuests) * 100) : 0}% من الإجمالي`}
                icon={<CheckCircle size={16} color={colors.success} />}
                color={colors.success}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>إجراءات سريعة</Text>
            </View>
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={[styles.quickActionPrimary, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(tabs)/create' as any)}
              >
                <Plus size={20} color={colors.background} />
                <Text style={[styles.quickActionPrimaryText, { color: colors.background }]}>إنشاء دعوة جديدة</Text>
              </TouchableOpacity>
              <View style={styles.quickActionsRow}>
                <TouchableOpacity 
                  style={[styles.quickAction, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}
                  onPress={() => router.push('/(tabs)/invitations' as any)}
                >
                  <Mail size={18} color={colors.primary} />
                  <Text style={[styles.quickActionText, { color: colors.text }]}>إرسال تذكيرات</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.quickAction, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}
                  onPress={() => router.push('/pricing' as any)}
                >
                  <Calendar size={18} color={colors.primary} />
                  <Text style={[styles.quickActionText, { color: colors.text }]}>ترقية الباقة</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TouchableOpacity 
                style={styles.viewAllBtn}
                onPress={() => router.push('/(tabs)/invitations' as any)}
              >
                <ChevronLeft size={18} color={colors.primary} />
                <Text style={[styles.viewAllText, { color: colors.primary }]}>عرض الكل</Text>
              </TouchableOpacity>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>أحدث الدعوات</Text>
            </View>
            {invitations.slice(0, 2).map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                onPress={() => router.push({ pathname: '/event-details' as any, params: { id: invitation.id } })}
              />
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>هل تواجه مشكلة؟</Text>
            </View>
            <View style={[styles.helpCard, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                فريق الدعم متاح على مدار الساعة لمساعدتك
              </Text>
              <View style={styles.helpButtons}>
                <Button
                  title="واتساب"
                  variant="outline"
                  size="small"
                  onPress={() => {}}
                  style={styles.helpButton}
                />
                <Button
                  title="تواصل معنا"
                  size="small"
                  onPress={() => {}}
                  style={styles.helpButton}
                />
              </View>
            </View>
          </View>

          <View style={styles.footer} />
        </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
  },
  quickActions: {
    gap: 12,
  },
  quickActionPrimary: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickActionPrimaryText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  helpCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  helpText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  helpButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  helpButton: {
    flex: 1,
  },
  footer: {
    height: 40,
  },
});
