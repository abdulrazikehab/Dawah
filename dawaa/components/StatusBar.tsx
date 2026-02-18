import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Signal, Wifi, Battery } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function StatusBar() {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      <Text style={[styles.time, { color: colors.text }]}>9:41</Text>
      <View style={styles.icons}>
        <Signal size={14} color={colors.text} />
        <Wifi size={14} color={colors.text} />
        <Battery size={14} color={colors.text} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  time: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  icons: {
    flexDirection: 'row',
    gap: 6,
  },
});
