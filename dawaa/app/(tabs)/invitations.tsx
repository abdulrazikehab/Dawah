import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Filter, Search } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import InvitationCard from '@/components/InvitationCard';
import Input from '@/components/Input';

import { apiService } from '@/services/api';
import { useFocusEffect } from '@react-navigation/native';

const filters = [
  { id: 'all', label: 'الكل' },
  { id: 'active', label: 'نشطة' },
  { id: 'draft', label: 'مسودة' },
  { id: 'completed', label: 'مكتملة' },
];

export default function InvitationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;
      setLoading(true);
      apiService.getEvents()
        .then(data => {
          if (isMounted) {
            setInvitations(data);
            setLoading(false);
          }
        })
        .catch(err => {
          console.error(err);
          if (isMounted) setLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const filteredInvitations = invitations.filter((inv: any) => {
    const matchesFilter = activeFilter === 'all' || inv.status === activeFilter;
    const matchesSearch = (inv.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/create' as any)}
          >
            <Plus size={20} color={colors.background} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>دعواتي</Text>
        </View>

        <View style={styles.searchContainer}>
          <Input
            placeholder="ابحث عن دعوة..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            icon={<Search size={18} color={colors.textMuted} />}
            containerStyle={styles.searchInput}
          />
          <TouchableOpacity style={[styles.filterBtn, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
            <Filter size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.backgroundCard, borderColor: colors.border },
                  activeFilter === filter.id && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setActiveFilter(filter.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: colors.textSecondary },
                    activeFilter === filter.id && { color: colors.background },
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredInvitations.length > 0 ? (
            filteredInvitations.map((invitation: any) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                onPress={() => router.push({ pathname: '/event-details' as any, params: { id: invitation.id } })}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>لا توجد دعوات</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                ابدأ بإنشاء دعوتك الأولى الآن
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(tabs)/create' as any)}
              >
                <Plus size={18} color={colors.background} />
                <Text style={[styles.emptyButtonText, { color: colors.background }]}>إنشاء دعوة</Text>
              </TouchableOpacity>
            </View>
          )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    alignItems: 'flex-start',
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  filterBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  filtersContainer: {
    paddingVertical: 16,
  },
  filtersScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
