import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronRight, CreditCard, ShieldCheck } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { apiService } from '@/services/api';

export default function PaymentScreen() {
  const router = useRouter();
  const { packageId } = useLocalSearchParams();
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  useEffect(() => {
    if (packageId) {
      apiService.getPackages()
        .then(packages => {
          const selected = packages.find((p: any) => p.id === packageId);
          setPkg(selected);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [packageId]);

  const handlePayment = async () => {
    if (!cardNumber || !expiry || !cvv || !cardName) {
      Alert.alert('خطأ', 'يرجى ملء جميع بيانات البطاقة');
      return;
    }

    try {
      setProcessing(true);
      await apiService.checkout({
        packageId: packageId as string,
        paymentDetails: { cardNumber, expiry, cvv, cardName }
      });
      
      Alert.alert('نجاح', 'تمت عملية الدفع بنجاح! تم تفعيل المميزات لك.', [
        { text: 'حسناً', onPress: () => router.replace('/(tabs)/create') }
      ]);
    } catch (err: any) {
      Alert.alert('خطأ', err.message || 'فشلت عملية الدفع');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronRight size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>إتمام عملية الدفع</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>ملخص الطلب</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryValue}>{pkg?.nameAr}</Text>
              <Text style={styles.summaryLabel}>الباقة المختارة:</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalValue}>{pkg?.price} ر.س</Text>
              <Text style={styles.totalLabel}>الإجمالي:</Text>
            </View>
          </View>

          <View style={styles.paymentForm}>
            <Text style={styles.formTitle}>بيانات البطاقة</Text>
            
            <Input
              label="الاسم على البطاقة"
              value={cardName}
              onChangeText={setCardName}
              placeholder="John Doe"
            />

            <Input
              label="رقم البطاقة"
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="0000 0000 0000 0000"
              keyboardType="numeric"
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Input
                  label="تاريخ الانتهاء"
                  value={expiry}
                  onChangeText={setExpiry}
                  placeholder="MM/YY"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="CVV"
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  keyboardType="numeric"
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.secureNote}>
              <ShieldCheck size={16} color={Colors.success} />
              <Text style={styles.secureNoteText}>دفع آمن ومشفر 100%</Text>
            </View>
          </View>

          <Button
            title={processing ? "جاري المعالجة..." : "تأكيد الدفع"}
            onPress={handlePayment}
            loading={processing}
            disabled={processing}
            style={styles.payButton}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600' as const,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 16,
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  summaryValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  totalValue: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  paymentForm: {
    marginTop: 32,
  },
  formTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 20,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  secureNoteText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  payButton: {
    marginTop: 40,
  },
});
