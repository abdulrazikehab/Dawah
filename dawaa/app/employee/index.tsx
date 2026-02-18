import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, RefreshControl, TextInput, ScrollView,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Calendar, Users, ChevronRight, LayoutDashboard, 
  LogOut, Search, X, Settings, CheckCircle, Clock,
  ClipboardList
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function EmployeeDashboard() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { colors, t, isRTL, language } = useTheme();
  
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAssignedEvents = async () => {
    try {
      setLoading(true);
      const data = await apiService.getEmployeeEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch assigned events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssignedEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignedEvents();
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: events.length,
      upcoming: events.filter(e => e.status === 'active').length,
    };
  }, [events]);

  const renderEventItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.eventCard, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}
      onPress={() => router.push(`/employee/event/${item.id}` as any)}
    >
      <View style={styles.eventHeader}>
        <Text style={[styles.eventTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>{item.title}</Text>
        <LayoutDashboard size={18} color={colors.primary} />
      </View>
      
      <View style={styles.eventDetails}>
        <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Calendar size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.date} • {item.time}</Text>
        </View>
        <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Users size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item._count?.guests || 0} {t.guests}</Text>
        </View>
      </View>

      <View style={[styles.cardFooter, { borderTopColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={[styles.viewDetails, { color: colors.primary }]}>{t.todayTasks}</Text>
        <ChevronRight size={16} color={colors.primary} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={{ backgroundColor: colors.primary, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>
              {language === 'ar' ? 'مرحباً،' : 'Hello,'} {user?.name?.split(' ')[0]}
            </Text>
            <Text style={styles.subtitleText}>{t.todayTasks}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              onPress={() => router.push('/(tabs)/settings')}
            >
              <Settings size={20} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              onPress={signOut}
            >
              <LogOut size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
              <ClipboardList size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.statVal, { color: colors.text }]}>{stats.total}</Text>
              <Text style={[styles.statLab, { color: colors.textSecondary }]}>{t.assignedEvents}</Text>
            </View>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: '#4CAF5015' }]}>
              <CheckCircle size={20} color="#4CAF50" />
            </View>
            <View>
              <Text style={[styles.statVal, { color: colors.text }]}>{stats.upcoming}</Text>
              <Text style={[styles.statLab, { color: colors.textSecondary }]}>{t.active}</Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: colors.backgroundCard, borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Search size={18} color={colors.textMuted} />
          <TextInput 
            style={[styles.searchInput, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}
            placeholder={t.searchByName}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {t.assignedEvents}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          filteredEvents.map(event => (
            <View key={event.id}>
              {renderEventItem({ item: event })}
            </View>
          ))
        )}

        {filteredEvents.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Clock size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t.noEventsFound}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 32,
  },
  welcomeText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitleText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: -20,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLab: {
    fontSize: 10,
  },
  searchBar: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  eventCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  eventDetails: {
    gap: 10,
    marginBottom: 20,
  },
  detailRow: {
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
  },
  cardFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewDetails: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
  },
});
