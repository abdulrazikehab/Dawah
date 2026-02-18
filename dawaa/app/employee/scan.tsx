import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Zap, ZapOff } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { apiService } from '@/services/api';

export default function QRScanner() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || processing) return;
    
    setScanned(true);
    setProcessing(true);

    try {
      // Assuming the QR code data is the Guest ID
      // You might need more complex parsing logic depending on what the QR contains
      const guestId = data.trim();
      
      const guest = await apiService.checkInGuest(guestId);
      
      Alert.alert(
        'Check-In Successful',
        `Guest: ${guest.name}\nStatus: Checked In`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
      
      // Auto-navigate back after a short delay so the user sees the success
      // Or just navigate back immediately if Alert is blocking (Alert IS blocking on native)
      // On Web, Alert is also blocking.
    } catch (error: any) {
      Alert.alert(
        'Scan Error',
        error.message || 'Invalid QR code or already checked in',
        [{ text: 'Try Again', onPress: () => setScanned(false) }]
      );
    } finally {
      setProcessing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={[styles.button, { backgroundColor: 'transparent' }]}>
          <Text style={[styles.buttonText, { color: Colors.primary }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        enableTorch={torch}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
              <X size={28} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTorch(!torch)} style={styles.iconBtn}>
              {torch ? <ZapOff size={28} color={Colors.white} /> : <Zap size={28} color={Colors.white} />}
            </TouchableOpacity>
          </View>

          <View style={styles.scanContainer}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanText}>Position QR code within the frame</Text>
          </View>

          {processing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.processingText}>Verifying guest...</Text>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.eventHint}>Scanning for Event ID: {eventId}</Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
  scanText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  eventHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  processingText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
