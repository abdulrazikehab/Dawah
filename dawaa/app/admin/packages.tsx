import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight, Plus, Edit2, Trash2, Package } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { apiService } from '@/services/api';
import { useTheme } from '@/contexts/ThemeContext';

export default function AdminPackagesScreen() {
  const router = useRouter();
  const { colors, t, isRTL } = useTheme();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [price, setPrice] = useState('');
  const [features, setFeatures] = useState('');

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPackages();
      setPackages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!name || !nameAr || !price) {
      Alert.alert(isRTL ? 'خطأ' : 'Error', isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    const payload = {
      name,
      nameAr,
      price: parseFloat(price),
      features: features.split('\n').filter(f => f.trim() !== '')
    };

    try {
      if (editingPkg) {
        await apiService.adminUpdatePackage(editingPkg.id, payload);
        Alert.alert(isRTL ? 'تم' : 'Success', isRTL ? 'تم تحديث الباقة بنجاح' : 'Package updated successfully');
      } else {
        await apiService.adminCreatePackage(payload);
        Alert.alert(isRTL ? 'تم' : 'Success', isRTL ? 'تم إنشاء الباقة بنجاح' : 'Package created successfully');
      }
      setModalVisible(false);
      resetForm();
      fetchPackages();
    } catch (err: any) {
      Alert.alert(isRTL ? 'خطأ' : 'Error', err.message || 'Action failed');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(isRTL ? 'تأكيد الحذف' : 'Confirm Delete', isRTL ? 'هل أنت متأكد من رغبتك في حذف هذه الباقة؟' : 'Are you sure you want to delete this package?', [
      { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
      { text: isRTL ? 'حذف' : 'Delete', style: 'destructive', onPress: async () => {
        try {
          await apiService.adminDeletePackage(id);
          fetchPackages();
        } catch (err: any) {
          Alert.alert(isRTL ? 'خطأ' : 'Error', err.message || 'Failed to delete');
        }
      }}
    ]);
  };

  const openModal = (pkg: any = null) => {
    if (pkg) {
      setEditingPkg(pkg);
      setName(pkg.name);
      setNameAr(pkg.nameAr);
      setPrice(pkg.price.toString());
      setFeatures(pkg.features.join('\n'));
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingPkg(null);
    setName('');
    setNameAr('');
    setPrice('');
    setFeatures('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.headerBtn, { backgroundColor: colors.backgroundCard }]}>
            <ChevronRight size={24} color={colors.text} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t.managePackages}</Text>
          <TouchableOpacity onPress={() => openModal()} style={[styles.headerBtn, { backgroundColor: colors.backgroundCard }]}>
            <Plus size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {packages.map((pkg) => (
              <View key={pkg.id} style={[styles.pkgCard, { backgroundColor: colors.backgroundCard, borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.pkgIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Package size={20} color={colors.primary} />
                </View>
                <View style={[styles.pkgBody, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                  <Text style={[styles.pkgName, { color: colors.text }]}>{isRTL ? pkg.nameAr : pkg.name}</Text>
                  <Text style={[styles.pkgPrice, { color: colors.primary }]}>{pkg.price} {isRTL ? 'ر.س' : 'SAR'}</Text>
                  <Text style={[styles.pkgFeatures, { color: colors.textSecondary }]}>{pkg.features.length} {isRTL ? 'مميزات' : 'Features'}</Text>
                </View>
                <View style={[styles.pkgActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <TouchableOpacity onPress={() => openModal(pkg)} style={[styles.actionBtn, { backgroundColor: colors.backgroundInput }]}>
                    <Edit2 size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(pkg.id)} style={[styles.actionBtn, { backgroundColor: colors.backgroundInput }]}>
                    <Trash2 size={18} color={colors.error || '#ff4444'} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {packages.length === 0 && (
              <View style={styles.center}>
                <Package size={48} color={colors.textMuted} />
                <Text style={{ color: colors.textSecondary, marginTop: 12 }}>{isRTL ? 'لا توجد باقات مضافة' : 'No packages found'}</Text>
              </View>
            )}
          </ScrollView>
        )}

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.backgroundCard }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingPkg ? (isRTL ? 'تعديل باقة' : 'Edit Package') : (isRTL ? 'إضافة باقة جديدة' : 'Add New Package')}
              </Text>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                <Input
                  label={isRTL ? 'الاسم (English)' : 'Name (English)'}
                  value={name}
                  onChangeText={setName}
                  placeholder="Premium Package"
                />

                <Input
                  label={isRTL ? 'الاسم (العربية)' : 'Name (Arabic)'}
                  value={nameAr}
                  onChangeText={setNameAr}
                  placeholder="الباقة المميزة"
                />

                <Input
                  label={isRTL ? 'السعر' : 'Price'}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="299"
                  keyboardType="numeric"
                />

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL ? 'المميزات (كل ميزة في سطر)' : 'Features (one per line)'}
                  </Text>
                  <TextInput
                    style={[styles.textArea, { backgroundColor: colors.backgroundInput, color: colors.text, borderColor: colors.border, textAlign: isRTL ? 'right' : 'left' }]}
                    value={features}
                    onChangeText={setFeatures}
                    placeholder={isRTL ? 'ميزة 1\nميزة 2...' : 'Feature 1\nFeature 2...'}
                    multiline
                    numberOfLines={6}
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                <View style={[styles.modalButtons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Button
                    title={isRTL ? 'إلغاء' : 'Cancel'}
                    variant="outline"
                    onPress={() => setModalVisible(false)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title={editingPkg ? (isRTL ? "تحديث" : "Update") : (isRTL ? "إنشاء" : "Create")}
                    onPress={handleCreateOrUpdate}
                    style={{ flex: 1 }}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pkgCard: {
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  pkgIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  pkgBody: {
    flex: 1,
  },
  pkgName: {
    fontSize: 16,
    fontWeight: '700',
  },
  pkgPrice: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  pkgFeatures: {
    fontSize: 12,
    marginTop: 4,
  },
  pkgActions: {
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 30,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  textArea: {
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    borderWidth: 1,
    minHeight: 120,
  },
  modalButtons: {
    gap: 12,
    marginTop: 10,
    marginBottom: 20,
  },
});
