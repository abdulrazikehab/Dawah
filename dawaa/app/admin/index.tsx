import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ActivityIndicator, RefreshControl, TextInput, ScrollView,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Calendar, Users, ChevronRight, Search, X, Settings, Package, Shield, LayoutGrid,
  ListFilter, Ticket, AlertCircle
} from 'lucide-react-native';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, t, isRTL, language } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'events' | 'tickets' | 'users'>('events');
  const [events, setEvents] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === 'events') {
        const data = await apiService.getAdminDashboard();
        setEvents(data);
      } else if (activeTab === 'tickets') {
        const data = await apiService.getAllTickets();
        setTickets(data);
      } else if (activeTab === 'users') {
        const data = await apiService.getUsers();
        setUsers(data);
      }
    } catch (error) {
      console.error(`Failed to fetch ${activeTab}:`, error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || event.template?.name === filterType;
      return matchesSearch && matchesType;
    });
  }, [events, searchQuery, filterType]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tickets, searchQuery]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: events.length,
      active: events.filter(e => e.status === 'active').length,
      upcoming: events.filter(e => e.status === 'pending').length
    };
  }, [events]);

  const renderTicketItem = ({ item }: { item: any }) => (
    <View style={[styles.eventCard, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
      <View style={styles.eventHeader}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
            {isRTL && <AlertCircle size={16} color={item.priority === 'high' ? '#F44336' : colors.primary} />}
            <Text style={[styles.eventTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>{item.title}</Text>
            {!isRTL && <AlertCircle size={16} color={item.priority === 'high' ? '#F44336' : colors.primary} />}
          </View>
          <Text style={[styles.detailText, { color: colors.textSecondary, marginTop: 4, textAlign: isRTL ? 'right' : 'left' }]}>{item.description}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'OPEN' ? '#F4433620' : '#4CAF5020' }]}>
          <Text style={[styles.statusText, { color: item.status === 'OPEN' ? '#F44336' : '#4CAF50' }]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={[styles.cardFooter, { borderTopColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row', marginTop: 12, paddingTop: 12 }]}>
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
          <Users size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.user?.name || 'User'}</Text>
        </View>
        <Text style={[styles.detailText, { color: colors.textMuted }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  const renderUserItem = ({ item }: { item: any }) => (
    <View style={[styles.eventCard, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
      <View style={styles.eventHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eventTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>{item.name || 'No Name'}</Text>
          <Text style={[styles.detailText, { color: colors.textSecondary, marginTop: 2, textAlign: isRTL ? 'right' : 'left' }]}>{item.email}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.role === 'ADMIN' ? '#9C27B020' : item.role === 'EMPLOYEE' ? '#2196F320' : '#4CAF5020' }]}>
          <Text style={[styles.statusText, { color: item.role === 'ADMIN' ? '#9C27B0' : item.role === 'EMPLOYEE' ? '#2196F3' : '#4CAF50' }]}>
            {item.role}
          </Text>
        </View>
      </View>
      <View style={[styles.cardFooter, { borderTopColor: colors.border, marginTop: 8, paddingTop: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={[styles.detailText, { color: colors.textMuted }]}>{(t as any).joined || (language === 'ar' ? 'انضم في' : 'Joined')}: {new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  const renderEventItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.eventCard, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}
      onPress={() => router.push(`/admin/event/${item.id}` as any)}
    >
      <View style={styles.eventHeader}>
        <Text style={[styles.eventTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#4CAF5020' : '#FF980020' }]}>
          <Text style={[styles.statusText, { color: item.status === 'active' ? '#4CAF50' : '#FF9800' }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.eventDetails}>
        <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Calendar size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.date} • {item.time}</Text>
        </View>
        <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Users size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.guests?.length || 0} {t.guests}</Text>
        </View>
      </View>

      <View style={[styles.cardFooter, { borderTopColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={styles.employeeAvatars}>
          {item.employees?.slice(0, 3).map((emp: any, i: number) => (
            <View key={emp.id} style={[styles.miniAvatar, { backgroundColor: colors.primary, left: i * 15 }]}>
              <Text style={styles.miniAvatarText}>{emp.name[0]}</Text>
            </View>
          ))}
          {item.employees?.length > 3 && (
            <View style={[styles.miniAvatar, { backgroundColor: colors.backgroundInput, left: 45 }]}>
              <Text style={[styles.miniAvatarText, { color: colors.text }]}>+{item.employees.length - 3}</Text>
            </View>
          )}
        </View>
        <ChevronRight size={18} color={colors.primary} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.navy }]} edges={['top']}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>{t.adminDashboard}</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.profileBtn, { backgroundColor: colors.backgroundInput }]}
          onPress={() => router.push('/(tabs)/settings')}
        >
          <Settings size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={[styles.content, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: colors.backgroundCard, borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'events' && { backgroundColor: colors.navy }]}
            onPress={() => setActiveTab('events')}
          >
            <LayoutGrid size={18} color={activeTab === 'events' ? '#fff' : colors.textMuted} />
            <Text style={[styles.tabText, { color: activeTab === 'events' ? '#fff' : colors.textSecondary }]}>{t.manageEvents}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'tickets' && { backgroundColor: colors.navy }]}
            onPress={() => setActiveTab('tickets')}
          >
            <Ticket size={18} color={activeTab === 'tickets' ? '#fff' : colors.textMuted} />
            <Text style={[styles.tabText, { color: activeTab === 'tickets' ? '#fff' : colors.textSecondary }]}>{language === 'ar' ? 'البلاغات' : 'Tickets'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'users' && { backgroundColor: colors.navy }]}
            onPress={() => setActiveTab('users')}
          >
            <Users size={18} color={activeTab === 'users' ? '#fff' : colors.textMuted} />
            <Text style={[styles.tabText, { color: activeTab === 'users' ? '#fff' : colors.textSecondary }]}>{language === 'ar' ? 'المستخدمين' : 'Users'}</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'events' && (
          <>
            {/* Quick Actions Grid */}
            <View style={styles.grid}>
              <TouchableOpacity 
                style={[styles.gridItem, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}
                onPress={() => router.push('/admin/employees')}
              >
                <Shield size={24} color={colors.primary} />
                <Text style={[styles.gridText, { color: colors.text }]}>{t.manageEmployees}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.gridItem, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}
                onPress={() => router.push('/admin/packages')}
              >
                <Package size={24} color="#FFD700" />
                <Text style={[styles.gridText, { color: colors.text }]}>{t.managePackages}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.gridItem, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}
                onPress={() => {}}
              >
                <LayoutGrid size={24} color="#4CAF50" />
                <Text style={[styles.gridText, { color: colors.text }]}>{t.manageEvents}</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={[styles.statItem, { backgroundColor: colors.primary + '10' }]}>
                <Text style={[styles.statVal, { color: colors.primary }]}>{stats.total}</Text>
                <Text style={[styles.statLab, { color: colors.textSecondary }]}>{t.total}</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: '#4CAF5010' }]}>
                <Text style={[styles.statVal, { color: '#4CAF50' }]}>{stats.active}</Text>
                <Text style={[styles.statLab, { color: colors.textSecondary }]}>{t.active}</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: '#FF980010' }]}>
                <Text style={[styles.statVal, { color: '#FF9800' }]}>{stats.upcoming}</Text>
                <Text style={[styles.statLab, { color: colors.textSecondary }]}>{t.pending}</Text>
              </View>
            </View>
          </>
        )}

        {/* Search & Filter */}
        <View style={styles.searchSection}>
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
          {activeTab === 'events' && (
            <TouchableOpacity 
              style={[styles.filterBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowFilters(true)}
            >
              <ListFilter size={20} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* List Content */}
        <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {activeTab === 'events' ? `${t.manageEvents} (${filteredEvents.length})` : 
           activeTab === 'tickets' ? (language === 'ar' ? `البلاغات (${filteredTickets.length})` : `Tickets (${filteredTickets.length})`) :
           (language === 'ar' ? `المستخدمين (${filteredUsers.length})` : `Users (${filteredUsers.length})`)}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <>
            {activeTab === 'events' && filteredEvents.map(event => (
              <View key={event.id}>{renderEventItem({ item: event })}</View>
            ))}
            {activeTab === 'tickets' && filteredTickets.map(ticket => (
              <View key={ticket.id}>{renderTicketItem({ item: ticket })}</View>
            ))}
            {activeTab === 'users' && filteredUsers.map(u => (
              <View key={u.id}>{renderUserItem({ item: u })}</View>
            ))}

            {((activeTab === 'events' && filteredEvents.length === 0) ||
              (activeTab === 'tickets' && filteredTickets.length === 0) ||
              (activeTab === 'users' && filteredUsers.length === 0)) && (
              <View style={styles.emptyState}>
                {activeTab === 'events' ? <Calendar size={48} color={colors.textMuted} /> :
                 activeTab === 'tickets' ? <Ticket size={48} color={colors.textMuted} /> :
                 <Users size={48} color={colors.textMuted} />}
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{(t as any).noResultsFound || (language === 'ar' ? 'لا توجد نتائج' : 'No results found')}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={showFilters} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundCard }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.filters}</Text>
            
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>{t.filterByType}</Text>
            <View style={[styles.filterGroup, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {['all', 'Wedding', 'Graduation', 'Birthday'].map(type => (
                <TouchableOpacity 
                  key={type}
                  style={[styles.chip, filterType === type && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                  onPress={() => setFilterType(type)}
                >
                  <Text style={[styles.chipText, { color: filterType === type ? '#fff' : colors.textSecondary }]}>
                    {type === 'all' ? t.allTypes : type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button 
              title={t.done} 
              onPress={() => setShowFilters(false)}
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    padding: 20,
    paddingBottom: 25,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 6,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    gap: 6,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  tabText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  gridItem: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  gridText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLab: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  searchSection: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 14,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 10,
  },
  eventCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventDetails: {
    gap: 6,
    marginBottom: 16,
  },
  detailRow: {
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
  },
  cardFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  employeeAvatars: {
    height: 24,
    width: 100,
  },
  miniAvatar: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  miniAvatarText: {
    color: '#fff',
    fontSize: 10,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterGroup: {
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
