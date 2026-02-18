import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Platform, ActivityIndicator, Modal, FlatList, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Calendar, MapPin, User, MessageSquare, Users, Heart, Cake, GraduationCap, Briefcase, Sparkles, Phone, Plus, Trash2, UserPlus, Clock, Clipboard as ClipboardIcon, X, Map as MapIcon, Check } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Location from 'expo-location';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import Input from '@/components/Input';
import ProgressSteps from '@/components/ProgressSteps';
import TemplateCard from '@/components/TemplateCard';
import PackageCard from '@/components/PackageCard';
import { apiService } from '@/services/api';
import { PackageType, InvitationType, PreInvitedGuest } from '@/types';

const steps = ['Event Type', 'Design', 'Details', 'Guests', 'Package', 'Payment'];

const eventTypes: { id: InvitationType; name: string; icon: React.ReactNode; color: string }[] = [
  { id: 'wedding', name: 'Wedding', icon: <Heart size={24} color="#E91E63" />, color: '#E91E63' },
  { id: 'birthday', name: 'Birthday', icon: <Cake size={24} color="#9C27B0" />, color: '#9C27B0' },
  { id: 'graduation', name: 'Graduation', icon: <GraduationCap size={24} color="#3F51B5" />, color: '#3F51B5' },
  { id: 'corporate', name: 'Corporate', icon: <Briefcase size={24} color="#009688" />, color: '#009688' },
  { id: 'other', name: 'Other', icon: <Sparkles size={24} color="#FF9800" />, color: '#FF9800' },
];

export default function EnglishInvitationScreen() {
  const router = useRouter();
  const { initialPackage } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEventType, setSelectedEventType] = useState<InvitationType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageType>('premium');
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    hostName: '',
    honoreeName: '',
    date: '',
    time: '',
    location: '',
    message: '',
    guestCount: '',
  });
  const [preInvitedGuests, setPreInvitedGuests] = useState<PreInvitedGuest[]>([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestMaxCompanions, setNewGuestMaxCompanions] = useState('1');

  // Date & Time Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (initialPackage && typeof initialPackage === 'string') {
      setSelectedPackage(initialPackage as PackageType);
    }
  }, [initialPackage]);

  // Generate date options (next 2 years)
  const dateOptions = Array.from({ length: 730 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return {
      id: i.toString(),
      date: d,
      // Format: "Saturday, March 15, 2025"
      label: d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      value: `${y}/${m}/${day}`,
    };
  });

  // Generate time options (30 min intervals)
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? '00' : '30';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    // Format: "07:00 PM"
    const label = `${hour12}:${m} ${ampm}`;
    const value = `${h.toString().padStart(2, '0')}:${m}`;
    return { id: i.toString(), label, value };
  });

  const handlePasteLocation = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setFormData(prev => ({ ...prev, location: text }));
    } else {
      Alert.alert('Notice', 'Clipboard is empty');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [templatesData, packagesData] = await Promise.all([
          apiService.getTemplates(),
          apiService.getPackages()
        ]);
        setAvailableTemplates(templatesData);
        setAvailablePackages(packagesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleNext = () => {
    if (currentStep === 0 && !selectedEventType) {
      Alert.alert('Notice', 'Please select an event type');
      return;
    }
    if (currentStep === 1 && !selectedTemplate) {
      Alert.alert('Notice', 'Please select an invitation design');
      return;
    }
    if (currentStep === 2 && !formData.title) {
      Alert.alert('Notice', 'Please enter the invitation title');
      return;
    }
    if (currentStep === 2 && !formData.guestCount) {
      Alert.alert('Notice', 'Please enter the number of guests');
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const invitationData = {
        title: formData.title,
        eventType: selectedEventType || 'other',
        hostName: formData.hostName,
        honoreeName: formData.honoreeName,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        message: formData.message,
        guestCount: formData.guestCount,
        templateId: selectedTemplate,
        packageId: selectedPackage,
        preInvitedGuests: preInvitedGuests
      };

      // Add loading state if needed
      apiService.createEvent(invitationData)
        .then((response) => {
          router.push({
            pathname: '/success' as any,
            params: {
              id: response.id,
              title: formData.title,
              date: formData.date,
              time: formData.time,
              location: formData.location,
              eventType: selectedEventType || 'other',
              preInvitedGuests: JSON.stringify(preInvitedGuests),
            },
          });
        })
        .catch((error) => {
          console.error('API Error:', error);
          Alert.alert('Error', 'Failed to create invitation. Please try again.');
        });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const filteredTemplates = selectedEventType 
    ? availableTemplates.filter(t => t.category === selectedEventType || selectedEventType === 'other')
    : availableTemplates;

  const getPlaceholderByType = () => {
    switch (selectedEventType) {
      case 'wedding': return 'Ex: Ahmed & Sarah Wedding';
      case 'birthday': return 'Ex: Layan\'s Birthday';
      case 'graduation': return 'Ex: Mohammed\'s Graduation';
      case 'corporate': return 'Ex: Company Launch Event';
      default: return 'Ex: Event Party';
    }
  };

  const getHostLabel = () => {
    switch (selectedEventType) {
      case 'wedding': return 'Groom\'s Name';
      case 'birthday': return 'Birthday Person\'s Name';
      case 'graduation': return 'Graduate\'s Name';
      case 'corporate': return 'Company / Organizer Name';
      default: return 'Host Name';
    }
  };

  const getHostPlaceholder = () => {
    switch (selectedEventType) {
      case 'wedding': return 'Enter groom\'s name';
      case 'birthday': return 'Enter birthday person\'s name';
      case 'graduation': return 'Enter graduate\'s name';
      case 'corporate': return 'Enter company or organizer name';
      default: return 'Enter host name';
    }
  };

  const getHonoreeLabel = () => {
    switch (selectedEventType) {
      case 'wedding': return 'Bride\'s Name';
      case 'birthday': return 'Honoree Name (Optional)';
      case 'corporate': return 'Contact Person (Optional)';
      default: return null;
    }
  };

  const getHonoreePlaceholder = () => {
    switch (selectedEventType) {
      case 'wedding': return 'Enter bride\'s name';
      case 'birthday': return 'Enter honoree name';
      case 'corporate': return 'Enter contact person name';
      default: return '';
    }
  };

  const openLocationInMaps = async () => {
    let locationToOpen = formData.location ? formData.location.trim() : '';
    
    if (!locationToOpen) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Notice', 'Please enable location services to use this feature');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        locationToOpen = `${latitude},${longitude}`;
        setFormData(prev => ({ ...prev, location: locationToOpen }));
      } catch (error) {
        Alert.alert('Error', 'Failed to get current location');
        return;
      }
    }

    if (locationToOpen.includes('google.com/maps') || locationToOpen.includes('goo.gl/maps') || locationToOpen.includes('maps.app.goo.gl')) {
      Linking.openURL(locationToOpen).catch(() => Alert.alert('Error', 'Cannot open link'));
      return;
    }

    const encodedLocation = encodeURIComponent(locationToOpen);
    const url = Platform.select({
      ios: `maps://maps.apple.com/?q=${encodedLocation}`,
      android: `geo:0,0?q=${encodedLocation}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`,
    });

    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`).catch(() => {
        Alert.alert('Error', 'Cannot open maps');
      });
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select Event Type</Text>
            <Text style={styles.stepSubtitle}>Choose the type of party or event you want to create an invitation for</Text>
            <View style={styles.eventTypesGrid}>
              {eventTypes.map((type: any) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.eventTypeCard,
                    selectedEventType === type.id && { borderColor: type.color, borderWidth: 2 }
                  ]}
                  onPress={() => setSelectedEventType(type.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.eventTypeIcon, { backgroundColor: `${type.color}20` }]}>
                    {type.icon}
                  </View>
                  <Text style={styles.eventTypeName}>{type.name}</Text>
                  {selectedEventType === type.id && (
                    <View style={[styles.eventTypeCheck, { backgroundColor: type.color }]}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Choose a Design</Text>
            <Text style={styles.stepSubtitle}>Select from our wide collection of premium templates</Text>
            {filteredTemplates.length === 0 ? (
              <View style={styles.noTemplates}>
                <Text style={styles.noTemplatesText}>No templates available for this category</Text>
                <Text style={styles.noTemplatesSubtext}>You can use any of the available templates</Text>
                <View style={styles.templatesGrid}>
                  {availableTemplates.map((template: any) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      selected={selectedTemplate === template.id}
                      onSelect={() => setSelectedTemplate(template.id)}
                    />
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.templatesGrid}>
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    selected={selectedTemplate === template.id}
                    onSelect={() => setSelectedTemplate(template.id)}
                    locale="en"
                  />
                ))}
              </View>
            )}
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Invitation Details</Text>
            <Text style={styles.stepSubtitle}>Add your event information</Text>
            <Input
              label="Invitation Title"
              placeholder={getPlaceholderByType()}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              icon={<MessageSquare size={18} color={Colors.textMuted} />}
              style={styles.ltrInput}
            />
            <Input
              label="Number of Guests"
              placeholder="Ex: 50"
              value={formData.guestCount}
              onChangeText={(text) => setFormData({ ...formData, guestCount: text.replace(/[^0-9]/g, '') })}
              keyboardType="numeric"
              icon={<Users size={18} color={Colors.textMuted} />}
              style={styles.ltrInput}
            />
            <Input
              label={getHostLabel()}
              placeholder={getHostPlaceholder()}
              value={formData.hostName}
              onChangeText={(text) => setFormData({ ...formData, hostName: text })}
              icon={<User size={18} color={Colors.textMuted} />}
              style={styles.ltrInput}
            />
            {getHonoreeLabel() && (
              <Input
                label={getHonoreeLabel()!}
                placeholder={getHonoreePlaceholder()}
                value={formData.honoreeName}
                onChangeText={(text) => setFormData({ ...formData, honoreeName: text })}
                icon={<User size={18} color={Colors.textMuted} />}
                style={styles.ltrInput}
              />
            )}
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Date</Text>
                <TouchableOpacity 
                  style={styles.pickerInput} 
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <Calendar size={18} color={Colors.primary} />
                  <Text style={[styles.pickerText, !formData.date && styles.placeholderText]}>
                    {formData.date || 'Select Date'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Time</Text>
                <TouchableOpacity 
                  style={styles.pickerInput} 
                  onPress={() => setShowTimePicker(true)}
                  activeOpacity={0.8}
                >
                  <Clock size={18} color={Colors.primary} />
                  <Text style={[styles.pickerText, !formData.time && styles.placeholderText]}>
                    {formData.time || 'Select Time'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={styles.inputLabel}>Location</Text>
              <View style={styles.enhancedLocationInput}>
                <View style={styles.locationInputInner}>
                  <MapPin size={18} color={Colors.textMuted} />
                  <TextInput
                    style={styles.textInputFlex}
                    placeholder="Location link or name"
                    placeholderTextColor={Colors.textMuted}
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                  />
                </View>
                <View style={styles.locationActions}>
                  <TouchableOpacity onPress={handlePasteLocation} style={styles.locationActionBtn}>
                    <ClipboardIcon size={18} color={Colors.textSecondary} />
                  </TouchableOpacity>
                  <View style={styles.verticalDivider} />
                  <TouchableOpacity onPress={openLocationInMaps} style={styles.locationActionBtn}>
                    <MapIcon size={18} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.helperText}>You can paste the location link from Google Maps here</Text>
            </View>

            <Input
              label="Invitation Message (Optional)"
              placeholder="Add a special message for guests"
              value={formData.message}
              onChangeText={(text) => setFormData({ ...formData, message: text })}
              multiline
              numberOfLines={3}
              style={[styles.textArea, styles.ltrInput]}
            />
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Add Guests (Optional)</Text>
            <Text style={styles.stepSubtitle}>Add people and send them invitations directly via WhatsApp</Text>
            
            <View style={styles.addGuestCard}>
              <Text style={styles.addGuestTitle}>Add New Guest</Text>
              <Input
                label="Guest Name"
                placeholder="Enter guest name"
                value={newGuestName}
                onChangeText={setNewGuestName}
                icon={<User size={18} color={Colors.textMuted} />}
                style={styles.ltrInput}
              />
              <Input
                label="Phone Number (WhatsApp)"
                placeholder="Ex: 966501234567"
                value={newGuestPhone}
                onChangeText={(text) => setNewGuestPhone(text.replace(/[^0-9]/g, ''))}
                keyboardType="phone-pad"
                icon={<Phone size={18} color={Colors.textMuted} />}
                style={styles.ltrInput}
              />
              <Input
                label="Allowed Companions"
                placeholder="Number of guests they can bring"
                value={newGuestMaxCompanions}
                onChangeText={(text) => setNewGuestMaxCompanions(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                icon={<Users size={18} color={Colors.textMuted} />}
                style={styles.ltrInput}
              />
              <Button
                title="Add Guest"
                onPress={() => {
                  if (!newGuestName.trim()) {
                    Alert.alert('Notice', 'Please enter guest name');
                    return;
                  }
                  if (!newGuestPhone.trim() || newGuestPhone.length < 10) {
                    Alert.alert('Notice', 'Please enter a valid phone number');
                    return;
                  }
                  const newGuest: PreInvitedGuest = {
                    id: `pre_${Date.now()}`,
                    name: newGuestName.trim(),
                    phone: newGuestPhone.trim(),
                    maxCompanions: parseInt(newGuestMaxCompanions) || 1,
                  };
                  setPreInvitedGuests([...preInvitedGuests, newGuest]);
                  setNewGuestName('');
                  setNewGuestPhone('');
                  setNewGuestMaxCompanions('1');
                }}
                icon={<Plus size={18} color={Colors.background} />}
                style={styles.addGuestBtn}
              />
            </View>

            {preInvitedGuests.length > 0 && (
              <View style={styles.guestsList}>
                <Text style={styles.guestsListTitle}>Added Guests ({preInvitedGuests.length})</Text>
                {preInvitedGuests.map((guest, index) => (
                  <View key={guest.id} style={styles.guestItem}>
                    <View style={styles.guestItemNumber}>
                      <Text style={styles.guestNumber}>{index + 1}</Text>
                    </View>
                    <View style={styles.guestItemInfo}>
                      <Text style={styles.guestItemName}>{guest.name}</Text>
                      <Text style={styles.guestItemPhone}>{guest.phone}</Text>
                      <Text style={styles.guestItemCompanions}>Companions: {guest.maxCompanions}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeGuestBtn}
                      onPress={() => {
                        setPreInvitedGuests(preInvitedGuests.filter(g => g.id !== guest.id));
                      }}
                    >
                      <Trash2 size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.skipNote}>
              <UserPlus size={20} color={Colors.textSecondary} />
              <Text style={styles.skipNoteText}>
                You can skip this step and share the public invitation link later
              </Text>
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Choose a Package</Text>
            <Text style={styles.stepSubtitle}>Various packages to suit your requirements</Text>
            {loadingData ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 20 }} />
            ) : (
              availablePackages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  selected={selectedPackage === pkg.id}
                  onSelect={() => setSelectedPackage(pkg.id)}
                  locale="en"
                />
              ))
            )}
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Payment Details</Text>
            <Text style={styles.stepSubtitle}>Enter card details to complete purchase</Text>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Invitation</Text>
                <Text style={styles.summaryValue}>{formData.title || 'New Invitation'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Event Type</Text>
                <Text style={styles.summaryValue}>
                  {eventTypes.find(t => t.id === selectedEventType)?.name || 'Not Selected'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Guests</Text>
                <Text style={styles.summaryValue}>{formData.guestCount || '0'} Guests</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Package</Text>
                <Text style={styles.summaryValue}>
                  {availablePackages.find(p => p.id === selectedPackage)?.name}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  {availablePackages.find(p => p.id === selectedPackage)?.price || 0} SAR
                </Text>
              </View>
            </View>

            <View style={styles.paymentMethods}>
              <Text style={styles.paymentTitle}>Payment Method</Text>
              <View style={styles.methodsRow}>
                <TouchableOpacity style={[styles.methodBtn, styles.methodBtnActive]}>
                  <Text style={styles.methodText}>Credit Card</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.methodBtn}>
                  <Text style={styles.methodTextInactive}>Apple Pay</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Input
              label="Card Number"
              placeholder="0000 0000 0000 0000"
              keyboardType="numeric"
            />
            <View style={styles.row}>
              <Input
                label="Expiry Date"
                placeholder="MM/YY"
                containerStyle={styles.halfInput}
              />
              <Input
                label="CVV"
                placeholder="123"
                keyboardType="numeric"
                containerStyle={styles.halfInput}
              />
            </View>
            <Input
              label="Cardholder Name"
              placeholder="Name as it appears on card"
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Invitation</Text>
          <View style={styles.placeholder} />
        </View>

        <ProgressSteps steps={steps} currentStep={currentStep} />

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderStepContent()}
        </ScrollView>

        <View style={styles.footer}>
          {currentStep > 0 && (
            <Button
              title="Back"
              variant="outline"
              onPress={handleBack}
              style={styles.backButton}
            />
          )}
          <Button
            title={currentStep === steps.length - 1 ? 'Pay Now' : 'Next'}
            onPress={handleNext}
            style={styles.nextButton}
          />
        </View>

        {/* Date Picker Modal */}
        <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
            <View style={styles.pickerModalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Date</Text>
              </View>
              <FlatList
                data={dateOptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.pickerItem, formData.date === item.value && styles.pickerItemActive]}
                    onPress={() => {
                      setFormData({ ...formData, date: item.value });
                      setShowDatePicker(false);
                    }}
                  >
                    <View style={styles.pickerItemLeft}>
                      <Calendar size={18} color={formData.date === item.value ? Colors.navy : Colors.textMuted} />
                      <Text style={[styles.pickerItemText, formData.date === item.value && styles.pickerItemTextActive]}>
                        {item.label}
                      </Text>
                    </View>
                    {formData.date === item.value && <Check size={18} color={Colors.navy} />}
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </Pressable>
        </Modal>

        {/* Time Picker Modal */}
        <Modal visible={showTimePicker} transparent animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowTimePicker(false)}>
            <View style={styles.pickerModalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Time</Text>
              </View>
              <FlatList
                data={timeOptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.pickerItem, formData.time === item.value && styles.pickerItemActive]}
                    onPress={() => {
                      setFormData({ ...formData, time: item.value });
                      setShowTimePicker(false);
                    }}
                  >
                    <View style={styles.pickerItemLeft}>
                      <Clock size={18} color={formData.time === item.value ? Colors.navy : Colors.textMuted} />
                      <Text style={[styles.pickerItemText, formData.time === item.value && styles.pickerItemTextActive]}>
                        {item.label}
                      </Text>
                    </View>
                    {formData.time === item.value && <Check size={18} color={Colors.navy} />}
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </Pressable>
        </Modal>
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
    paddingBottom: 100,
    paddingTop: 30, 
  },
  stepContent: {
    paddingTop: 8,
  },
  stepTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  eventTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  eventTypeCard: {
    width: '48%',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    marginBottom: 8,
  },
  eventTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  eventTypeName: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  eventTypeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  noTemplates: {
    alignItems: 'center',
    padding: 20,
  },
  noTemplatesText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noTemplatesSubtext: {
    color: Colors.textMuted,
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  templatesGrid: {
    width: '100%',
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500' as const,
    textAlign: 'left', // Left align for English
  },
  pickerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundInput,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  pickerText: {
    fontSize: 14,
    flex: 1,
    textAlign: 'left', // Left align for English
    color: Colors.white,
  },
  placeholderText: {
    color: Colors.textMuted,
  },
  enhancedLocationInput: {
    backgroundColor: Colors.backgroundInput,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 52,
  },
  locationInputInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textInputFlex: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    height: '100%',
    textAlign: 'left', // Left align for English
  },
  locationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  locationActionBtn: {
    padding: 6,
  },
  helperText: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'left', // Left align for English
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  ltrInput: {
    textAlign: 'left', 
  },
  addGuestCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  addGuestTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 16,
    textAlign: 'left', // Left align for English
  },
  addGuestBtn: {
    marginTop: 8,
  },
  guestsList: {
    marginBottom: 20,
  },
  guestsListTitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '600' as const,
    textAlign: 'left', // Left align for English
  },
  guestItem: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestItemNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12, // Adjusted for LTR
  },
  guestNumber: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700' as const,
  },
  guestItemInfo: {
    flex: 1,
  },
  guestItemName: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 4,
    textAlign: 'left', // Left align for English
  },
  guestItemPhone: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 2,
    textAlign: 'left', // Left align for English
  },
  guestItemCompanions: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'left', // Left align for English
  },
  removeGuestBtn: {
    padding: 8,
    backgroundColor: `${Colors.error}10`,
    borderRadius: 8,
    marginLeft: 8, // Adjusted for LTR
  },
  skipNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.info}15`,
    padding: 16,
    borderRadius: 12,
    gap: 12, 
  },
  skipNoteText: {
    color: Colors.info,
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
    textAlign: 'left', // Left align for English
  },
  summaryCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 20,
    textAlign: 'left', // Left align for English
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  summaryValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 16,
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
  paymentMethods: {
    marginBottom: 24,
  },
  paymentTitle: {
    color: Colors.white,
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '600' as const,
    textAlign: 'left', // Left align for English
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  methodBtn: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  methodBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  methodText: {
    color: Colors.white,
    fontWeight: '600' as const,
  },
  methodTextInactive: {
    color: Colors.textSecondary,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    gap: 12,
  },
  nextButton: {
    flex: 1,
  },
  backButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: Colors.backgroundCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerItemActive: {
    backgroundColor: `${Colors.primary}10`,
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  pickerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pickerItemText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  pickerItemTextActive: {
    color: Colors.white,
    fontWeight: '600' as const,
  },
});
