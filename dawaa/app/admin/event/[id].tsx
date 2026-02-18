import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, MapPin, Users, CheckCircle2, ChevronLeft } from 'lucide-react-native';
import { apiService } from '@/services/api';
import Button from '@/components/Button';
import { useTheme } from '@/contexts/ThemeContext';

export default function EventAssignment() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, t, isRTL } = useTheme();
  
  const [event, setEvent] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [eventData, employeeData] = await Promise.all([
        apiService.getEventById(id as string),
        apiService.getEmployees()
      ]);
      setEvent(eventData);
      setEmployees(employeeData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      Alert.alert(isRTL ? 'خطأ' : 'Error', isRTL ? 'فشل تحميل البيانات' : 'Failed to load details');
    } finally {
      setLoading(false);
    }
  }, [id, isRTL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssign = async (employeeId: string) => {
    try {
      setAssigning(employeeId);
      await apiService.assignEmployee(id as string, employeeId);
      Alert.alert(isRTL ? 'تم' : 'Success', isRTL ? 'تم تعيين الموظف' : 'Employee assigned');
      fetchData(); // Refresh to show assignment
    } catch (error: any) {
      Alert.alert(isRTL ? 'خطأ' : 'Error', error.message || 'Failed to assign');
    } finally {
      setAssigning(null);
    }
  };

  const isAssigned = (employeeId: string) => {
    return event?.employees?.some((e: any) => e.id === employeeId);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.navy, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#fff" style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isRTL ? 'تعيين الموظفين' : 'Assign Employees'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.eventProfile, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
          <Text style={[styles.eventTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>{event?.title}</Text>
          <View style={[styles.metaRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Calendar size={16} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{event?.date} • {event?.time}</Text>
          </View>
          <View style={[styles.metaRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <MapPin size={16} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{event?.location}</Text>
          </View>
          <View style={[styles.metaRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Users size={16} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{event?.guests?.length || 0} {t.guests}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {isRTL ? 'اختر الموظفين لهذه المناسبة' : 'Select Employees for this Event'}
        </Text>
        
        {employees.map((item) => (
          <View key={item.id} style={[styles.employeeCard, { backgroundColor: colors.backgroundCard, borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.employeeInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.avatar, { backgroundColor: colors.navy, borderColor: colors.primary }]}>
                <Text style={styles.avatarText}>{item.name?.[0]}</Text>
              </View>
              <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                <Text style={[styles.employeeName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.employeeEmail, { color: colors.textSecondary }]}>{item.email}</Text>
              </View>
            </View>

            {isAssigned(item.id) ? (
              <View style={styles.assignedBadge}>
                <CheckCircle2 size={16} color="#4CAF50" />
                <Text style={styles.assignedText}>{isRTL ? 'تم التعيين' : 'Assigned'}</Text>
              </View>
            ) : (
              <Button
                title={isRTL ? 'تعيين' : 'Assign'}
                onPress={() => handleAssign(item.id)}
                loading={assigning === item.id}
                style={styles.assignBtn}
                textStyle={styles.assignBtnText}
                variant="outline"
              />
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backBtn: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
  },
  eventProfile: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metaRow: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  metaText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  employeeCard: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  employeeInfo: {
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  employeeEmail: {
    fontSize: 12,
  },
  assignBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 38,
  },
  assignBtnText: {
    fontSize: 13,
  },
  assignedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  assignedText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
