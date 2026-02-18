import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { QrCode, Search, CheckCircle2, Circle, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { apiService } from '@/services/api';

export default function GuestChecklist() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'checked_in' | 'pending'>('all');
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getEmployeeEventDetails(id as string);
      setEvent(data);
    } catch (error) {
      console.error('Failed to fetch details:', error);
      Alert.alert('Error', 'Failed to load guest list');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [fetchDetails])
  );

  const handleManualCheckIn = async (guestId: string) => {
    try {
      setCheckingIn(guestId);
      await apiService.checkInGuest(guestId);
      // Update local state for immediate feedback
      setEvent((prev: any) => ({
        ...prev,
        guests: prev.guests.map((g: any) => 
          g.id === guestId ? { ...g, checkInStatus: 'checked_in' } : g
        )
      }));
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Check-in failed');
    } finally {
      setCheckingIn(null);
    }
  };

  const filteredGuests = event?.guests?.filter((guest: any) => {
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          guest.phone.includes(searchQuery);
    const matchesFilter = filterStatus === 'all' || guest.checkInStatus === filterStatus;
    return matchesSearch && matchesFilter;
  }) || [];

  const stats = {
    total: event?.guests?.length || 0,
    checkedIn: event?.guests?.filter((g: any) => g.checkInStatus === 'checked_in').length || 0,
    pending: event?.guests?.filter((g: any) => g.checkInStatus === 'pending').length || 0,
  };

  const renderGuestItem = ({ item }: { item: any }) => (
    <View style={styles.guestCard}>
      <View style={styles.guestInfo}>
        <Text style={styles.guestName}>{item.name}</Text>
        <Text style={styles.guestPhone}>{item.phone}</Text>
        <Text style={styles.companionText}>Companions: {item.actualCompanions} / {item.maxCompanions}</Text>
      </View>
      
      {item.checkInStatus === 'checked_in' ? (
        <View style={styles.statusBadge}>
          <CheckCircle2 size={24} color="#4CAF50" />
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.checkInAction}
          onPress={() => handleManualCheckIn(item.id)}
          disabled={checkingIn === item.id}
        >
          {checkingIn === item.id ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Circle size={24} color={Colors.textMuted} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.summarySection}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statBox, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.border }]}>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>{stats.checkedIn}</Text>
          <Text style={styles.statLabel}>Attended</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#FF9800' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search guest name or phone..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.filterBar}>
          {(['all', 'pending', 'checked_in'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, filterStatus === status && styles.activeChip]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[styles.chipText, filterStatus === status && styles.activeChipText]}>
                {status.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredGuests}
        keyExtractor={(item) => item.id}
        renderItem={renderGuestItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No guests match your filters.</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push({ pathname: '/employee/scan', params: { eventId: id } })}
      >
        <QrCode size={28} color={Colors.white} />
        <Text style={styles.fabText}>Scan QR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  summarySection: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  controls: {
    padding: 16,
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    color: Colors.white,
    marginLeft: 10,
    fontSize: 14,
  },
  filterBar: {
    flexDirection: 'row',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeChipText: {
    color: Colors.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  guestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  guestPhone: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 2,
  },
  companionText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  statusBadge: {
    padding: 4,
  },
  checkInAction: {
    padding: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
