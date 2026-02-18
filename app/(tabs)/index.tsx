import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Animated,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Crown, 
  Check, 
  Sparkles, 
  Star,
  ChevronLeft,
  Users,
  Palette,
  MessageSquare,
  Clock,
  Shield,
  Zap
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

import { useState } from 'react';
import { apiService } from '@/services/api';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const cardAnims = useRef<Animated.Value[]>([]);

  useEffect(() => {
    apiService.getPackages()
      .then(data => {
        setPackagesList(data);
        cardAnims.current = data.map(() => new Animated.Value(0));
        setLoading(false);
        
        // Start card animations after data is loaded
        data.forEach((_, index) => {
          Animated.timing(cardAnims.current[index], {
            toValue: 1,
            duration: 600,
            delay: 400 + index * 150,
            useNativeDriver: true,
          }).start();
        });
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCtaPress = () => {
    router.push('/(tabs)/create' as any);
  };

  const renderPackageCard = (pkg: any, index: number) => {
    const isHighlighted = pkg.highlighted || pkg.recommended;
    const isElite = pkg.elite || (pkg.id === 'professional');
    const name = pkg.nameAr || pkg.name;
    const compensation = pkg.compensation || (pkg.id === 'basic' ? '25%' : pkg.id === 'premium' ? '40%' : '50%');
    const featuresList = pkg.features || [];
    const designFeaturesList = pkg.designFeatures || [];
    const notesList = pkg.notes || [];
    
    return (
      <Animated.View
        key={pkg.id}
        style={[
          styles.packageCard,
          {
            backgroundColor: isHighlighted ? colors.primary : colors.backgroundCard,
            borderColor: isElite ? colors.gold : isHighlighted ? colors.primaryLight : colors.border,
            borderWidth: isHighlighted || isElite ? 2 : 1,
            opacity: cardAnims.current[index] || 1,
            transform: [
              {
                translateY: (cardAnims.current[index] || new Animated.Value(0)).interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
              },
            ],
          },
        ]}
      >
        {pkg.label && (
          <View style={[styles.packageLabel, { backgroundColor: colors.background }]}>
            <Star size={12} color={colors.gold} fill={colors.gold} />
            <Text style={[styles.packageLabelText, { color: colors.gold }]}>{pkg.label}</Text>
          </View>
        )}
        
        {isElite && (
          <View style={[styles.eliteLabel, { backgroundColor: colors.gold }]}>
            <Crown size={12} color={colors.navy} />
            <Text style={[styles.eliteLabelText, { color: colors.navy }]}>Elite</Text>
          </View>
        )}
 
        <Text style={[
          styles.packageName,
          { color: isHighlighted ? colors.navy : colors.text }
        ]}>
          {name}
        </Text>
 
        <View style={styles.compensationBadge}>
          <Text style={[
            styles.compensationText,
            { color: isHighlighted ? colors.navy : colors.gold }
          ]}>
            دعوات تعويضية {compensation}
          </Text>
        </View>
 
        <View style={styles.featuresContainer}>
          <Text style={[
            styles.featuresTitle,
            { color: isHighlighted ? colors.navyDark : colors.textSecondary }
          ]}>
            خدمات الباقة
          </Text>
          {featuresList.map((feature: string, i: number) => (
            <View key={i} style={styles.featureRow}>
              <Check 
                size={16} 
                color={isHighlighted ? colors.navy : colors.gold} 
                strokeWidth={3}
              />
              <Text style={[
                styles.featureText,
                { color: isHighlighted ? colors.navyDark : colors.text }
              ]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>
 
        {designFeaturesList.length > 0 && (
          <View style={[styles.designSection, { borderColor: isHighlighted ? 'rgba(11,20,38,0.2)' : colors.border }]}>
            <Text style={[
              styles.featuresTitle,
              { color: isHighlighted ? colors.navyDark : colors.textSecondary }
            ]}>
              تصميم الدعوة
            </Text>
            {designFeaturesList.map((feature: string, i: number) => (
              <View key={i} style={styles.featureRow}>
                <Palette 
                  size={16} 
                  color={isHighlighted ? colors.navy : colors.primaryLight} 
                />
                <Text style={[
                  styles.featureText,
                  { color: isHighlighted ? colors.navyDark : colors.text }
                ]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        )}
 
        {notesList.length > 0 && (
          <View style={[styles.notesSection, { borderColor: isHighlighted ? 'rgba(11,20,38,0.2)' : colors.border }]}>
            <Text style={[
              styles.notesTitle,
              { color: isHighlighted ? colors.navyDark : colors.textMuted }
            ]}>
              ملاحظات
            </Text>
            {notesList.map((note: string, i: number) => (
              <Text 
                key={i} 
                style={[
                  styles.noteText,
                  { color: isHighlighted ? 'rgba(11,20,38,0.7)' : colors.textSecondary }
                ]}
              >
                • {note}
              </Text>
            ))}
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.packageButton,
            {
              backgroundColor: isHighlighted ? colors.navy : colors.primary,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
          onPress={handleCtaPress}
        >
          <Text style={[
            styles.packageButtonText,
            { color: isHighlighted ? colors.white : colors.navy }
          ]}>
            اختر هذه الباقة
          </Text>
          <ChevronLeft size={18} color={isHighlighted ? colors.white : colors.navy} />
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.header, { backgroundColor: colors.navy }]}>
            <View style={styles.headerContent}>
              <View style={styles.logoSection}>
                <View style={styles.logoWrapper}>
                  <Crown size={28} color={colors.gold} />
                </View>
                <View style={styles.logoTextContainer}>
                  <Text style={[styles.logoArabic, { color: colors.white }]}>دعوة</Text>
                  <Text style={[styles.logoEnglish, { color: colors.textSecondary }]}>Daawa</Text>
                </View>
              </View>
              
              <Pressable
                style={({ pressed }) => [
                  styles.headerButton,
                  { 
                    borderColor: colors.gold,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={handleCtaPress}
              >
                <Sparkles size={14} color={colors.gold} />
                <Text style={[styles.headerButtonText, { color: colors.gold }]}>Daawa</Text>
              </Pressable>
            </View>
          </View>

          <Animated.View 
            style={[
              styles.hero,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            <View style={styles.heroContent}>
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                دعوة: منصّة لإرسال الدعوات
              </Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                ومتابعة حضور ضيوفك بسهولة
              </Text>
              
              <View style={styles.heroFeatures}>
                <View style={styles.heroFeatureItem}>
                  <Users size={18} color={colors.gold} />
                  <Text style={[styles.heroFeatureText, { color: colors.textSecondary }]}>
                    إدارة الضيوف
                  </Text>
                </View>
                <View style={styles.heroFeatureItem}>
                  <MessageSquare size={18} color={colors.gold} />
                  <Text style={[styles.heroFeatureText, { color: colors.textSecondary }]}>
                    تتبع الردود
                  </Text>
                </View>
                <View style={styles.heroFeatureItem}>
                  <Clock size={18} color={colors.gold} />
                  <Text style={[styles.heroFeatureText, { color: colors.textSecondary }]}>
                    سريع وسهل
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.ctaButton,
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.gold,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              onPress={handleCtaPress}
            >
              <Text style={[styles.ctaButtonText, { color: colors.navy }]}>
                ابدأ دعوتك الآن بسهولة وتميّز
              </Text>
              <View style={[styles.ctaIconWrapper, { backgroundColor: 'rgba(11,20,38,0.15)' }]}>
                <ChevronLeft size={20} color={colors.navy} />
              </View>
            </Pressable>
          </Animated.View>

          <View style={styles.trustSection}>
            <View style={styles.trustItem}>
              <Shield size={20} color={colors.gold} />
              <Text style={[styles.trustText, { color: colors.textSecondary }]}>آمن وموثوق</Text>
            </View>
            <View style={[styles.trustDivider, { backgroundColor: colors.border }]} />
            <View style={styles.trustItem}>
              <Zap size={20} color={colors.gold} />
              <Text style={[styles.trustText, { color: colors.textSecondary }]}>سريع وفعال</Text>
            </View>
            <View style={[styles.trustDivider, { backgroundColor: colors.border }]} />
            <View style={styles.trustItem}>
              <Star size={20} color={colors.gold} fill={colors.gold} />
              <Text style={[styles.trustText, { color: colors.textSecondary }]}>جودة عالية</Text>
            </View>
          </View>

          <View style={styles.packagesSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>باقات دعوة</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              اختر الباقة المناسبة لمناسبتك
            </Text>

            <View style={styles.packagesContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>جاري تحميل الباقات...</Text>
                </View>
              ) : (
                packagesList.map((pkg, index) => renderPackageCard(pkg, index))
              )}
            </View>
          </View>

          <View style={[styles.aboutSection, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
            <Text style={[styles.aboutTitle, { color: colors.text }]}>مين دعوة؟</Text>
            <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
              منصة سعودية متخصصة في تصميم وإرسال الدعوات الرقمية للمناسبات المختلفة.
              نقدم حلولاً متكاملة لإدارة قوائم الضيوف ومتابعة ردود الحضور بطريقة 
              احترافية وسهلة الاستخدام.
            </Text>
            <View style={styles.aboutStats}>
              <View style={styles.aboutStatItem}>
                <Text style={[styles.aboutStatValue, { color: colors.gold }]}>5000+</Text>
                <Text style={[styles.aboutStatLabel, { color: colors.textMuted }]}>دعوة مرسلة</Text>
              </View>
              <View style={styles.aboutStatItem}>
                <Text style={[styles.aboutStatValue, { color: colors.gold }]}>99%</Text>
                <Text style={[styles.aboutStatLabel, { color: colors.textMuted }]}>رضا العملاء</Text>
              </View>
              <View style={styles.aboutStatItem}>
                <Text style={[styles.aboutStatValue, { color: colors.gold }]}>24/7</Text>
                <Text style={[styles.aboutStatLabel, { color: colors.textMuted }]}>دعم فني</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerLogo}>
              <Crown size={24} color={colors.gold} />
              <Text style={[styles.footerLogoText, { color: colors.text }]}>دعوة</Text>
            </View>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              © 2024 دعوة - جميع الحقوق محفوظة
            </Text>
          </View>
        </ScrollView>
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
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
  },
  logoTextContainer: {
    alignItems: 'flex-start',
  },
  logoArabic: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  logoEnglish: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    marginTop: -2,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  headerButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 32,
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    textAlign: 'center',
    lineHeight: 38,
  },
  heroFeatures: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 24,
  },
  heroFeatureItem: {
    alignItems: 'center',
    gap: 6,
  },
  heroFeatureText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  ctaIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  trustDivider: {
    width: 1,
    height: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  packagesSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
  },
  packagesContainer: {
    gap: 20,
  },
  packageCard: {
    borderRadius: 20,
    padding: 24,
    position: 'relative' as const,
  },
  packageLabel: {
    position: 'absolute' as const,
    top: -12,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  packageLabelText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  eliteLabel: {
    position: 'absolute' as const,
    top: -12,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  eliteLabelText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  packageName: {
    fontSize: 20,
    fontWeight: '700' as const,
    textAlign: 'right',
    marginBottom: 12,
    marginTop: 8,
  },
  compensationBadge: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  compensationText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginBottom: 12,
    textAlign: 'right',
  },
  featureRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
    lineHeight: 22,
  },
  designSection: {
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
  },
  notesSection: {
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 8,
    textAlign: 'right',
  },
  noteText: {
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 4,
    lineHeight: 20,
  },
  packageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 20,
    gap: 8,
  },
  packageButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  aboutSection: {
    marginHorizontal: 20,
    marginTop: 48,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  aboutTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 24,
  },
  aboutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  aboutStatItem: {
    alignItems: 'center',
  },
  aboutStatValue: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  aboutStatLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 20,
  },
  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  footerLogoText: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  footerText: {
    fontSize: 12,
  },
});
