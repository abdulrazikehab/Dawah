import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, Crown, Gem, Check } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Package } from '../types';

interface PackageCardProps {
  pkg: Package;
  selected?: boolean;
  onSelect: () => void;
}

const iconMap: Record<string, any> = {
  star: Star,
  crown: Crown,
  gem: Gem,
};

export default function PackageCard({ pkg, selected, onSelect }: PackageCardProps) {
  const { colors } = useTheme();
  
  // Dynamic handling of various data structures (API vs Mock)
  const IconComponent = pkg?.icon && iconMap[pkg.icon] ? iconMap[pkg.icon] : Star;
  const name = pkg?.nameAr || pkg?.name || 'باقة';
  const features = pkg?.features || [];
  const color = pkg?.color || colors.primary;
  const currency = pkg?.currency || 'ر.س';
  const price = pkg?.price ?? 0;
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: colors.backgroundCard, borderColor: colors.border },
        selected && { borderColor: colors.primary, borderWidth: 2 },
        pkg?.recommended && { borderColor: colors.primary }
      ]} 
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {pkg?.recommended && (
        <View style={[styles.recommendedBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.recommendedText, { color: colors.background }]}>الأكثر طلباً</Text>
        </View>
      )}
      
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <IconComponent size={28} color={color} />
      </View>
      
      <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
      
      <View style={styles.priceContainer}>
        <Text style={[styles.price, { color: colors.primary }]}>{price}</Text>
        <Text style={[styles.currency, { color: colors.textSecondary }]}>{currency}</Text>
      </View>
      
      <View style={styles.features}>
        {features.map((feature: any, index: number) => (
          <View key={index} style={styles.featureRow}>
            <Check size={14} color={colors.success} />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>{feature}</Text>
          </View>
        ))}
      </View>
      
      <View 
        style={[styles.button, { backgroundColor: selected ? colors.success : colors.primary }]}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>
          {selected ? 'تم الاختيار' : 'اختيار الباقة'}
        </Text>
      </View>
      
      <Text style={[styles.detailsLink, { color: colors.textSecondary }]}>مقارنة التفاصيل</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 16,
  },
  price: {
    fontSize: 32,
    fontWeight: '700' as const,
  },
  currency: {
    fontSize: 14,
  },
  features: {
    width: '100%',
    gap: 10,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    flex: 1,
    textAlign: 'right',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  detailsLink: {
    fontSize: 12,
    marginTop: 12,
    textDecorationLine: 'underline',
  },
});
