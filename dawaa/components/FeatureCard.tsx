import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Zap, Palette, BarChart2, Shield } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Feature } from '@/types';

const iconMap: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  'zap': Zap,
  'palette': Palette,
  'bar-chart-2': BarChart2,
  'shield': Shield,
};

interface FeatureCardProps {
  feature: Feature;
}

export default function FeatureCard({ feature }: FeatureCardProps) {
  const { colors } = useTheme();
  const IconComponent = iconMap[feature.icon] || Zap;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.backgroundInput }]}>
        <IconComponent size={24} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{feature.title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{feature.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    width: '48%',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
