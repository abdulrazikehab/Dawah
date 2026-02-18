import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'outlined' | 'elevated';
}

export default function Card({ children, style, variant = 'default' }: CardProps) {
  const { colors } = useTheme();
  
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return { backgroundColor: colors.backgroundCard, borderWidth: 1, borderColor: colors.border };
      case 'elevated':
        return { backgroundColor: colors.backgroundCard, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 };
      default:
        return { backgroundColor: colors.backgroundCard };
    }
  };
  
  return (
    <View style={[styles.card, getVariantStyle(), style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
  },
});
