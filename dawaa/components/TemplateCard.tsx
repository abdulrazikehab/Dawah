import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Crown } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Template } from '../types';

interface TemplateCardProps {
  template: Template;
  selected?: boolean;
  onSelect: () => void;
  locale?: 'ar' | 'en';
}

export default function TemplateCard({ template, selected, onSelect, locale = 'ar' }: TemplateCardProps) {
  const { colors } = useTheme();
  const isEn = locale === 'en';
  
  const name = isEn ? (template?.name || template?.nameAr || 'Template') : (template?.nameAr || template?.name || 'قالب');
  const image = template?.image || template?.imageUrl || '';
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: colors.backgroundCard },
        selected && { borderColor: colors.primary, borderWidth: 2 }
      ]} 
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {image ? (
        <Image 
          source={{ uri: image }} 
          style={[styles.image, { backgroundColor: colors.backgroundInput }]} 
        />
      ) : (
        <View style={[styles.image, { backgroundColor: colors.backgroundInput, alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ color: colors.textMuted }}>{isEn ? 'No Image' : 'لا توجد صورة'}</Text>
        </View>
      )}
      
      {template?.premium && (
        <View style={[styles.premiumBadge, { backgroundColor: colors.backgroundCard }]}>
          <Crown size={12} color={colors.primary} />
        </View>
      )}
      
      {selected && (
        <View style={styles.selectedOverlay}>
          <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
            <Text style={[styles.checkmarkText, { color: colors.background }]}>✓</Text>
          </View>
        </View>
      )}
      
      <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  image: {
    width: '100%',
    height: 150,
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    borderRadius: 12,
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  name: {
    fontSize: 13,
    fontWeight: '500' as const,
    padding: 12,
    textAlign: 'center',
  },
});
