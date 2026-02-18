import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

const categoryImages: Record<string, string> = {
  wedding: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200&h=200&fit=crop',
  birthday: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200&h=200&fit=crop',
  graduation: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&h=200&fit=crop',
  corporate: 'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?w=200&h=200&fit=crop',
};

export default function CategoryCard({ category, onPress }: CategoryCardProps) {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Image 
        source={{ uri: categoryImages[category.id] }} 
        style={[styles.image, { borderColor: colors.border }]}
      />
      <Text style={[styles.name, { color: colors.text }]}>{category.nameAr}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    alignItems: 'center',
    marginRight: 16,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
    borderWidth: 2,
  },
  name: {
    fontSize: 12,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
});
