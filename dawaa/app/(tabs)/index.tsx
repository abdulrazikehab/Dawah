import React, { useRef, useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Pressable, Animated,
  Dimensions, Modal, TouchableOpacity, Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Crown, Check, Sparkles, Star, ChevronLeft, Users, Palette,
  Clock, Shield, Zap, Calendar, MapPin, Heart,
  QrCode, Menu, Globe, X, Home, Info
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

// ─── Packages Data ───
const packagesData = [
  {
    id: 'basic', name: 'باقة دعوة الذاتية', label: null, highlighted: false, compensation: '25٪',
    features: [
      'إرسال الدعوة من قبل العميل', 'إرسال دعوة تجريبية قبل إرسال الدعوات الأساسية',
      'إرسال تذكير بالموعد قبل المناسبة بيوم', 'خاصية القبول والاعتذار للمدعوين',
      'كود دخول مخصّص لكل مدعو', 'استقبال رسائل المدعوين داخل التطبيق',
      'إمكانية مسح أكواد الدخول من التطبيق بدون جهاز إضافي'
    ],
    notes: [
      'الباقة لا تشمل تصميم بطاقة الدعوة، ويتم تزويدنا بالتصميم من العميل',
      'يمكن إضافة مشرفين لبوابة مسح الأكواد وتنظيم الدخول مقابل رسوم إضافية',
      'مدة التنفيذ: يوم عمل واحد من استلام جميع التفاصيل'
    ]
  },
  {
    id: 'premium', name: 'باقة دعوة المخصصة', label: 'الأكثر طلباً', highlighted: true, compensation: '40٪',
    features: [
      'إرسال الدعوات من التطبيق من قبل العميل', 'إرسال دعوات تجريبية قبل الإرسال الأساسي',
      'إمكانية تعيين داعٍ إضافي للمناسبة', 'إرسال تذكير قبل المناسبة بيوم',
      'وصول الدعوات عبر واتساب أو الرسائل النصية', 'خاصية القبول والاعتذار للمدعوين',
      'كود دخول خاص لكل مدعو', 'إحصائية كاملة لمعرفة القبول والاعتذار بالأسماء والأرقام',
      'إمكانية مسح أكواد الدخول من التطبيق بدون جهاز خاص',
      'استقبال رسائل المدعوين من التطبيق', 'قروب واتساب خاص للدعم الفني',
      'مراجعة ملف أسماء المدعوين قبل الإرسال', 'التواصل مع الداعي الإضافي',
      'متابعة المدعوين في قائمة الانتظار عبر التواصل الهاتفي', 'الرد على استفسارات المدعوين'
    ],
    designFeatures: ['تصميم جاهز من بين 50 تصميم جاهز', 'تصميم حسب ثيم المناسبة برسوم إضافية'],
    notes: [
      'يمكن إضافة مشرفين لبوابة مسح الأكواد وتنظيم الدخول (للـمدن المتاحة فقط) مقابل رسوم إضافية',
      'مدة التنفيذ: 3–5 أيام عمل من استلام كافة التفاصيل'
    ]
  },
  {
    id: 'elite', name: 'باقة دعوة المتكاملة', label: 'VIP', elite: true, compensation: '50٪',
    features: [
      'إرسال الدعوات من التطبيق من قبل العميل', 'إرسال دعوات تجريبية قبل إرسال الدعوات الأساسية',
      'إمكانية تعيين داعٍ إضافي للمناسبة', 'إرسال تذكير قبل المناسبة بيوم',
      'وصول الدعوات عبر واتساب أو الرسائل النصية', 'خاصية القبول والاعتذار للمدعوين',
      'كود دخول خاص لكل مدعو', 'إحصائية للقبول والاعتذار بالأسماء والأرقام',
      'إمكانية مسح أكواد الدخول عبر التطبيق بدون جهاز خاص',
      'استقبال رسائل المدعوين عبر التطبيق', 'قروب واتساب خاص بالدعم الفني',
      'مراجعة ملف أسماء المدعوين قبل إرسال الدعوات', 'التواصل مع الداعي الإضافي',
      'متابعة المدعوين على قائمة الانتظار عبر التواصل الهاتفي', 'الرد على استفسارات المدعوين',
      'إعداد ملف أسماء المدعوين بالكامل', 'صفحة تهاني خاصة بالمناسبة', 'رسالة شكر للمدعوين'
    ]
  }
];

const showcaseInvitations = [
  { id: '1', title: 'زفاف أحمد و سارة', type: 'wedding', hostName: 'عائلة الأحمد', date: '٢٠٢٦/٠٣/١٥', time: '٧:٠٠ مساءً', location: 'قاعة الماسة، الرياض', guestCount: 250, confirmedCount: 180 },
  { id: '2', title: 'حفلة تخرج نورة', type: 'graduation', hostName: 'نورة المحمد', date: '٢٠٢٦/٠٤/٢٠', time: '٥:٠٠ مساءً', location: 'جامعة الملك سعود', guestCount: 80, confirmedCount: 65 },
  { id: '3', title: 'عيد ميلاد يوسف', type: 'birthday', hostName: 'عائلة يوسف', date: '٢٠٢٦/٠٥/١٠', time: '٦:٠٠ مساءً', location: 'استراحة النخيل، جدة', guestCount: 40, confirmedCount: 35 },
  { id: '4', title: 'ملتقى رواد الأعمال', type: 'corporate', hostName: 'شركة التقنية', date: '٢٠٢٦/٠٦/٠١', time: '٩:٠٠ صباحاً', location: 'فندق الفيصلية، الرياض', guestCount: 150, confirmedCount: 120 },
  { id: '5', title: 'زفاف خالد و منيرة', type: 'wedding', hostName: 'عائلة العتيبي', date: '٢٠٢٦/٠٧/٢٠', time: '٨:٠٠ مساءً', location: 'قصر الحمراء، الدمام', guestCount: 300, confirmedCount: 220 },
];

const typeGradients: Record<string, { bg: string; accent: string }> = {
  wedding: { bg: '#0F0A1E', accent: '#D4AF37' }, birthday: { bg: '#0F1A2E', accent: '#FF6B9D' },
  graduation: { bg: '#0A1628', accent: '#4FC3F7' }, corporate: { bg: '#0E1420', accent: '#7C4DFF' },
  other: { bg: '#0B1426', accent: '#C9A227' },
};
const typeEmojis: Record<string, string> = { wedding: '💍', birthday: '🎂', graduation: '🎓', corporate: '🏢', other: '✨' };
const typeLabelsAr: Record<string, string> = { wedding: 'دعوة زفاف', birthday: 'دعوة عيد ميلاد', graduation: 'دعوة تخرج', corporate: 'دعوة فعالية', other: 'دعوة' };

// ─── Mini Invitation Card ───
function MiniInvitationCard({ invitation }: { invitation: typeof showcaseInvitations[0] }) {
  const theme = typeGradients[invitation.type] || typeGradients.other;
  const emoji = typeEmojis[invitation.type] || '✨';
  const typeLabel = typeLabelsAr[invitation.type] || 'دعوة';
  return (
    <View style={[miniStyles.card, { backgroundColor: theme.bg, borderColor: `${theme.accent}30` }]}>
      <View style={[miniStyles.accentBar, { backgroundColor: theme.accent }]}>
        <View style={miniStyles.accentBarInner}>
          <View style={[miniStyles.accentLine, { backgroundColor: `${theme.bg}40` }]} />
          <Text style={miniStyles.emoji}>{emoji}</Text>
          <View style={[miniStyles.accentLine, { backgroundColor: `${theme.bg}40` }]} />
        </View>
        <Text style={[miniStyles.typeLabel, { color: theme.bg }]}>{typeLabel}</Text>
      </View>
      <View style={miniStyles.titleSection}>
        <Text style={[miniStyles.title, { color: theme.accent }]} numberOfLines={1}>{invitation.title}</Text>
        <Text style={miniStyles.hostText}>يتشرف {invitation.hostName}</Text>
        <Text style={miniStyles.inviteText}>بدعوتكم لحضور</Text>
      </View>
      <View style={miniStyles.divider}>
        <View style={[miniStyles.dividerLine, { backgroundColor: `${theme.accent}30` }]} />
        <Heart size={10} color={theme.accent} style={{ opacity: 0.6 }} />
        <View style={[miniStyles.dividerLine, { backgroundColor: `${theme.accent}30` }]} />
      </View>
      <View style={miniStyles.details}>
        <View style={miniStyles.detailRow}><Calendar size={12} color={theme.accent} /><Text style={miniStyles.detailText}>{invitation.date}</Text></View>
        <View style={miniStyles.detailRow}><Clock size={12} color={theme.accent} /><Text style={miniStyles.detailText}>{invitation.time}</Text></View>
        <View style={miniStyles.detailRow}><MapPin size={12} color={theme.accent} /><Text style={miniStyles.detailText} numberOfLines={1}>{invitation.location}</Text></View>
      </View>
      <View style={[miniStyles.statsBar, { borderTopColor: `${theme.accent}15` }]}>
        <View style={miniStyles.statItem}><Users size={11} color={theme.accent} /><Text style={[miniStyles.statText, { color: theme.accent }]}>{invitation.confirmedCount}</Text></View>
        <View style={miniStyles.statItem}><QrCode size={11} color={theme.accent} /><Text style={[miniStyles.statText, { color: theme.accent }]}>QR</Text></View>
      </View>
    </View>
  );
}

// ─── Animated Splash Screen Component ───
function AnimatedSplash({ onFinish, colors }: { onFinish: () => void; colors: any }) {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(30)).current;
  const shimmerPos = useRef(new Animated.Value(-1)).current;
  const ringScale = useRef(new Animated.Value(0.5)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0.5)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Ring pulse animations
    const ringPulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, { toValue: 2.5, duration: 1800, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
          Animated.timing(ringOpacity, { toValue: 0.6, duration: 400, useNativeDriver: true }),
        ]),
        Animated.timing(ringOpacity, { toValue: 0, duration: 1400, useNativeDriver: true }),
        Animated.timing(ringScale, { toValue: 0.5, duration: 0, useNativeDriver: true }),
      ])
    );
    const ring2Pulse = Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.parallel([
          Animated.timing(ring2Scale, { toValue: 3, duration: 2000, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
          Animated.timing(ring2Opacity, { toValue: 0.4, duration: 500, useNativeDriver: true }),
        ]),
        Animated.timing(ring2Opacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
        Animated.timing(ring2Scale, { toValue: 0.5, duration: 0, useNativeDriver: true }),
      ])
    );

    // Floating particles
    const particleAnim = (p: Animated.Value) => Animated.loop(
      Animated.sequence([
        Animated.timing(p, { toValue: 1, duration: 2500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(p, { toValue: 0, duration: 2500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    );

    ringPulse.start();
    ring2Pulse.start();
    particleAnim(particle1).start();
    setTimeout(() => particleAnim(particle2).start(), 800);
    setTimeout(() => particleAnim(particle3).start(), 1600);

    Animated.sequence([
      // Logo entrance
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.delay(200),
      // Tagline entrance
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(taglineSlide, { toValue: 0, friction: 6, tension: 50, useNativeDriver: true }),
      ]),
      // Shimmer
      Animated.timing(shimmerPos, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      Animated.delay(800),
      // Fade out
      Animated.timing(fadeOut, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => onFinish());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const particleStyle = (p: Animated.Value, x: number, y: number) => ({
    position: 'absolute' as const, width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.gold, left: x, top: y,
    opacity: p.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 0.8, 0.2] }),
    transform: [{ translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
                { scale: p.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1.2, 0.5] }) }],
  });

  return (
    <Animated.View style={[splashStyles.container, { backgroundColor: colors.background, opacity: fadeOut }]}>
      {/* Pulsing rings */}
      <Animated.View style={[splashStyles.ring, { borderColor: colors.gold, opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />
      <Animated.View style={[splashStyles.ring, { borderColor: colors.gold, opacity: ring2Opacity, transform: [{ scale: ring2Scale }] }]} />
      
      {/* Floating particles */}
      <Animated.View style={particleStyle(particle1, width * 0.2, 200)} />
      <Animated.View style={particleStyle(particle2, width * 0.7, 300)} />
      <Animated.View style={particleStyle(particle3, width * 0.5, 150)} />

      {/* Logo */}
      <Animated.View style={[splashStyles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <View style={[splashStyles.logoCircle, { backgroundColor: `${colors.gold}15`, borderColor: `${colors.gold}30` }]}>
          <Crown size={48} color={colors.gold} fill={`${colors.gold}30`} />
        </View>
        <Animated.View style={[splashStyles.shimmer, {
          backgroundColor: `${colors.goldShine}40`,
          transform: [{ translateX: shimmerPos.interpolate({ inputRange: [-1, 1], outputRange: [-100, 100] }) }],
        }]} />
      </Animated.View>

      {/* Brand text */}
      <Animated.View style={{ opacity: taglineOpacity, transform: [{ translateY: taglineSlide }], alignItems: 'center' }}>
        <Text style={[splashStyles.brandAr, { color: colors.text }]}>دعوة</Text>
        <Text style={[splashStyles.brandEn, { color: colors.gold }]}>DAAWA</Text>
        <View style={[splashStyles.taglineLine, { backgroundColor: `${colors.gold}40` }]} />
        <Text style={[splashStyles.tagline, { color: colors.textSecondary }]}>منصّة الدعوات الرقمية</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Main Screen ───
export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [packagesList] = useState<any[]>(packagesData);
  const [menuVisible, setMenuVisible] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const cardAnims = useRef<Animated.Value[]>(packagesData.map(() => new Animated.Value(0)));

  useEffect(() => {
    if (!showSplash) {
      packagesData.forEach((_, index) => {
        Animated.timing(cardAnims.current[index], { toValue: 1, duration: 600, delay: 200 + index * 150, useNativeDriver: true }).start();
      });
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]).start();
    }
  }, [showSplash]);

  const handleCtaPress = () => router.push('/(tabs)/create' as any);
  const handlePackagePress = (pkgId: string) => router.push({ pathname: '/(tabs)/create', params: { initialPackage: pkgId } } as any);

  if (showSplash) {
    return <AnimatedSplash onFinish={() => setShowSplash(false)} colors={colors} />;
  }

  const renderPackageCard = (pkg: any, index: number) => {
    const isHighlighted = pkg.highlighted;
    const isElite = pkg.elite;
    const name = pkg.nameAr || pkg.name;
    const featuresList = pkg.features || [];
    const designFeaturesList = pkg.designFeatures || [];
    const notesList = pkg.notes || [];
    
    return (
      <Animated.View key={pkg.id} style={[styles.packageCard, {
        backgroundColor: isHighlighted ? colors.primary : colors.backgroundCard,
        borderColor: isElite ? colors.gold : isHighlighted ? colors.primaryLight : colors.border,
        borderWidth: isHighlighted || isElite ? 2 : 1,
        opacity: cardAnims.current[index] || 1,
        transform: [{ translateY: (cardAnims.current[index] || new Animated.Value(0)).interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
      }]}>
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
        <Text style={[styles.packageName, { color: isHighlighted ? colors.navy : colors.text }]}>{name}</Text>
        {pkg.compensation && (
          <View style={styles.compensationBadge}>
            <Text style={[styles.compensationText, { color: isHighlighted ? colors.navy : colors.gold }]}>دعوات تعويضية {pkg.compensation}</Text>
          </View>
        )}
        <View style={styles.featuresContainer}>
          <Text style={[styles.featuresTitle, { color: isHighlighted ? colors.navyDark : colors.textSecondary }]}>خدمات الباقة</Text>
          {featuresList.map((feature: string, i: number) => (
            <View key={i} style={styles.featureRow}>
              <Check size={16} color={isHighlighted ? colors.navy : colors.gold} strokeWidth={3} />
              <Text style={[styles.featureText, { color: isHighlighted ? colors.navyDark : colors.text }]}>{feature}</Text>
            </View>
          ))}
        </View>
        {designFeaturesList.length > 0 && (
          <View style={[styles.designSection, { borderColor: isHighlighted ? 'rgba(11,20,38,0.2)' : colors.border }]}>
            <Text style={[styles.featuresTitle, { color: isHighlighted ? colors.navyDark : colors.textSecondary }]}>تصميم الدعوة</Text>
            {designFeaturesList.map((f: string, i: number) => (
              <View key={i} style={styles.featureRow}><Palette size={16} color={isHighlighted ? colors.navy : colors.primaryLight} /><Text style={[styles.featureText, { color: isHighlighted ? colors.navyDark : colors.text }]}>{f}</Text></View>
            ))}
          </View>
        )}
        {notesList.length > 0 && (
          <View style={[styles.notesSection, { borderColor: isHighlighted ? 'rgba(11,20,38,0.2)' : colors.border }]}>
            <Text style={[styles.notesTitle, { color: isHighlighted ? colors.navyDark : colors.textMuted }]}>ملاحظات</Text>
            {notesList.map((n: string, i: number) => (
              <Text key={i} style={[styles.noteText, { color: isHighlighted ? 'rgba(11,20,38,0.7)' : colors.textSecondary }]}>• {n}</Text>
            ))}
          </View>
        )}
        <Pressable style={({ pressed }) => [styles.packageButton, { backgroundColor: isHighlighted ? colors.navy : colors.primary, opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]} onPress={() => handlePackagePress(pkg.id)}>
          <Text style={[styles.packageButtonText, { color: isHighlighted ? colors.white : colors.navy }]}>اختر هذه الباقة</Text>
          <ChevronLeft size={18} color={isHighlighted ? colors.white : colors.navy} />
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Top Header Bar */}
        <View style={[styles.topBar, { backgroundColor: colors.background }]}>
          <TouchableOpacity style={[styles.menuButton, { backgroundColor: colors.backgroundCard }]} onPress={() => setMenuVisible(true)}>
            <Menu size={20} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>إعدادات</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/english-invitation' as any)}>
            <Text style={[styles.topBarLink, { color: colors.primary }]}>English Invitation</Text>
          </TouchableOpacity>
        </View>

        {/* Navy Brand Bar */}
        <View style={[styles.navyBar, { backgroundColor: colors.navy }]}>
          <View style={styles.navyLogoContainer}>
            <Text style={[styles.navyLogoAr, { color: colors.white }]}>دعوة</Text>
            <Text style={[styles.navyLogoEn, { color: colors.gold }]}>Daawa</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Hero */}
          <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
            <View style={styles.heroContent}>
              <Text style={[styles.heroDescription, { color: colors.text }]}>
                دعوة: منصّة لإرسال الدعوات ومتابعة حضور ضيوفك بسهولة.
              </Text>
            </View>
            <Pressable style={({ pressed }) => [styles.ctaButton, { backgroundColor: colors.primary, shadowColor: colors.gold, transform: [{ scale: pressed ? 0.97 : 1 }] }]} onPress={handleCtaPress}>
              <Text style={[styles.ctaButtonText, { color: colors.navy }]}>ابداء دعوتك الان بسهوله وتميز</Text>
              <View style={[styles.ctaIconWrapper, { backgroundColor: 'rgba(11,20,38,0.15)' }]}>
                <ChevronLeft size={20} color={colors.navy} />
              </View>
            </Pressable>
          </Animated.View>

          {/* Showcase */}
          <View style={styles.showcaseSection}>
            <View style={styles.showcaseHeader}>
              <View style={[styles.showcaseBadge, { backgroundColor: `${colors.gold}15` }]}>
                <Sparkles size={14} color={colors.gold} />
                <Text style={[styles.showcaseBadgeText, { color: colors.gold }]}>نماذج حية</Text>
              </View>
              <Text style={[styles.showcaseTitle, { color: colors.text }]}>شاهد كيف تبدو دعواتك</Text>
              <Text style={[styles.showcaseSubtitle, { color: colors.textSecondary }]}>دعوات حقيقية أُنشئت من خلال المنصة</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.showcaseScroll} decelerationRate="fast" snapToInterval={236} snapToAlignment="start">
              {showcaseInvitations.map((inv) => (
                <View key={inv.id} style={styles.marqueeItem}><MiniInvitationCard invitation={inv} /></View>
              ))}
            </ScrollView>
          </View>

          {/* Trust */}
          <View style={styles.trustSection}>
            <View style={styles.trustItem}><Shield size={20} color={colors.gold} /><Text style={[styles.trustText, { color: colors.textSecondary }]}>آمن وموثوق</Text></View>
            <View style={[styles.trustDivider, { backgroundColor: colors.border }]} />
            <View style={styles.trustItem}><Zap size={20} color={colors.gold} /><Text style={[styles.trustText, { color: colors.textSecondary }]}>سريع وفعال</Text></View>
            <View style={[styles.trustDivider, { backgroundColor: colors.border }]} />
            <View style={styles.trustItem}><Star size={20} color={colors.gold} fill={colors.gold} /><Text style={[styles.trustText, { color: colors.textSecondary }]}>جودة عالية</Text></View>
          </View>

          {/* How It Works */}
          <View style={styles.howItWorksSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>كيف تعمل دعوة؟</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>ثلاث خطوات بسيطة لإرسال دعوتك</Text>
            <View style={styles.stepsContainer}>
              {[
                { num: '١', icon: <Palette size={24} color={colors.gold} />, title: 'اختر التصميم', desc: 'اختر من بين تصاميم متعددة تناسب مناسبتك' },
                { num: '٢', icon: <Users size={24} color={colors.gold} />, title: 'أضف ضيوفك', desc: 'أضف قائمة ضيوفك وأرسل لهم الدعوات' },
                { num: '٣', icon: <QrCode size={24} color={colors.gold} />, title: 'تتبع الحضور', desc: 'تابع ردود ضيوفك وامسح رموز QR عند الوصول' },
              ].map((step, i) => (
                <View key={i} style={[styles.stepCard, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
                  <View style={[styles.stepNumber, { backgroundColor: `${colors.gold}15` }]}>
                    <Text style={[styles.stepNumberText, { color: colors.gold }]}>{step.num}</Text>
                  </View>
                  <View style={[styles.stepIconCircle, { backgroundColor: `${colors.gold}10` }]}>{step.icon}</View>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                  <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>{step.desc}</Text>
                  {i < 2 && <View style={[styles.stepConnector, { borderColor: `${colors.gold}30` }]} />}
                </View>
              ))}
            </View>
          </View>

          {/* Packages */}
          <View style={styles.packagesSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>باقات دعوة</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>اختر الباقة المناسبة لمناسبتك</Text>
            <View style={styles.packagesContainer}>{packagesList.map((pkg, i) => renderPackageCard(pkg, i))}</View>
          </View>

          {/* About */}
          <View style={[styles.aboutSection, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
            <Text style={[styles.aboutTitle, { color: colors.text }]}>مين دعوة؟</Text>
            <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
              منصة سعودية متخصصة في تصميم وإرسال الدعوات الرقمية للمناسبات المختلفة.
              نقدم حلولاً متكاملة لإدارة قوائم الضيوف ومتابعة ردود الحضور بطريقة 
              احترافية وسهلة الاستخدام.
            </Text>
            <View style={styles.aboutStats}>
              <View style={styles.aboutStatItem}><Text style={[styles.aboutStatValue, { color: colors.gold }]}>5000+</Text><Text style={[styles.aboutStatLabel, { color: colors.textMuted }]}>دعوة مرسلة</Text></View>
              <View style={styles.aboutStatItem}><Text style={[styles.aboutStatValue, { color: colors.gold }]}>99%</Text><Text style={[styles.aboutStatLabel, { color: colors.textMuted }]}>رضا العملاء</Text></View>
              <View style={styles.aboutStatItem}><Text style={[styles.aboutStatValue, { color: colors.gold }]}>24/7</Text><Text style={[styles.aboutStatLabel, { color: colors.textMuted }]}>دعم فني</Text></View>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerLogo}><Crown size={24} color={colors.gold} /><Text style={[styles.footerLogoText, { color: colors.text }]}>دعوة</Text></View>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>© 2024 دعوة - جميع الحقوق محفوظة</Text>
          </View>
        </ScrollView>

        {/* Menu Modal */}
        <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
            <View style={[styles.menuContainer, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
              <View style={styles.menuHeader}>
                <Text style={[styles.menuTitle, { color: colors.text }]}>القائمة</Text>
                <TouchableOpacity onPress={() => setMenuVisible(false)}><X size={24} color={colors.textSecondary} /></TouchableOpacity>
              </View>
              {[
                { icon: <Home size={20} color={colors.primary} />, label: 'الرئيسية' },
                { icon: <Crown size={20} color={colors.primary} />, label: 'الباقات' },
                { icon: <Globe size={20} color={colors.primary} />, label: 'اللغة' },
                { icon: <Info size={20} color={colors.primary} />, label: 'مين دعوة؟' },
              ].map((item, i) => (
                <TouchableOpacity key={i} style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                  {item.icon}
                  <Text style={[styles.menuItemText, { color: colors.text }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

// ─── Splash Styles ───
const splashStyles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, zIndex: 999, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 2 },
  logoContainer: { alignItems: 'center', marginBottom: 24, overflow: 'hidden' },
  logoCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  shimmer: { position: 'absolute', width: 40, height: '100%', top: 0, borderRadius: 20 },
  brandAr: { fontSize: 42, fontWeight: '800' as const, marginBottom: 2 },
  brandEn: { fontSize: 16, fontWeight: '600' as const, letterSpacing: 6, textTransform: 'uppercase' as const, marginBottom: 16 },
  taglineLine: { width: 40, height: 2, borderRadius: 1, marginBottom: 12 },
  tagline: { fontSize: 14, fontWeight: '500' as const },
});

// ─── Mini Card Styles ───
const miniStyles = StyleSheet.create({
  card: { width: 220, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  accentBar: { paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center' },
  accentBarInner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  accentLine: { flex: 1, height: 1 },
  emoji: { fontSize: 18 },
  typeLabel: { fontSize: 9, fontWeight: '600' as const, letterSpacing: 0.5 },
  titleSection: { paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center' },
  title: { fontSize: 14, fontWeight: '700' as const, textAlign: 'center', marginBottom: 4 },
  hostText: { color: '#A8B5C8', fontSize: 10, textAlign: 'center' },
  inviteText: { color: '#6B7A94', fontSize: 9, textAlign: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 6 },
  dividerLine: { flex: 1, height: 1 },
  details: { paddingHorizontal: 14, paddingVertical: 8, gap: 5 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { color: '#FFFFFF', fontSize: 10, flex: 1, textAlign: 'right' },
  statsBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, marginHorizontal: 14, marginBottom: 8, borderTopWidth: 1 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 10, fontWeight: '600' as const },
});

// ─── Main Styles ───
const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  menuButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  menuText: { fontSize: 14, fontWeight: '600' as const },
  topBarLink: { fontSize: 14, fontWeight: '600' as const, textDecorationLine: 'underline' as const },
  navyBar: { width: '100%', paddingVertical: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  navyLogoContainer: { alignItems: 'center', gap: 2 },
  navyLogoAr: { fontSize: 32, fontWeight: '800' as const, lineHeight: 40 },
  navyLogoEn: { fontSize: 14, fontWeight: '600' as const, letterSpacing: 3, textTransform: 'uppercase' as const },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', alignItems: 'flex-start' },
  menuContainer: { width: '70%', height: '100%', padding: 24, borderRightWidth: 1, borderTopRightRadius: 20, borderBottomRightRadius: 20, shadowColor: '#000', shadowOffset: { width: 5, height: 0 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 10 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, marginTop: 12 },
  menuTitle: { fontSize: 20, fontWeight: '700' as const },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.1)' },
  menuItemText: { fontSize: 16, fontWeight: '500' as const },
  scrollContent: { paddingBottom: 20 },
  hero: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 32 },
  heroContent: { alignItems: 'center', marginBottom: 32 },
  heroDescription: { fontSize: 18, fontWeight: '500' as const, textAlign: 'center', lineHeight: 28 },
  ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 24, borderRadius: 16, gap: 12, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8, width: '100%' },
  ctaButtonText: { fontSize: 17, fontWeight: '700' as const },
  ctaIconWrapper: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  showcaseSection: { paddingTop: 32, paddingBottom: 16, overflow: 'hidden', position: 'relative' as const },
  showcaseHeader: { alignItems: 'center', paddingHorizontal: 20, marginBottom: 24 },
  showcaseBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  showcaseBadgeText: { fontSize: 12, fontWeight: '600' as const },
  showcaseTitle: { fontSize: 22, fontWeight: '700' as const, textAlign: 'center', marginBottom: 6 },
  showcaseSubtitle: { fontSize: 14, textAlign: 'center' },
  showcaseScroll: { paddingHorizontal: 20, gap: 16, paddingVertical: 4 },
  marqueeItem: { width: 220 },
  trustSection: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20, gap: 16 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trustText: { fontSize: 12, fontWeight: '500' as const },
  trustDivider: { width: 1, height: 20 },
  howItWorksSection: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 16 },
  stepsContainer: { gap: 16, marginTop: 8 },
  stepCard: { borderRadius: 16, padding: 20, borderWidth: 1, alignItems: 'center', position: 'relative' as const },
  stepNumber: { position: 'absolute' as const, top: -14, right: 20, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { fontSize: 14, fontWeight: '700' as const },
  stepIconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  stepTitle: { fontSize: 16, fontWeight: '700' as const, marginBottom: 6, textAlign: 'center' },
  stepDesc: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  stepConnector: { position: 'absolute' as const, bottom: -16, width: 1, height: 16, borderLeftWidth: 2, borderStyle: 'dashed' as const },
  loadingContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 16, fontWeight: '500' as const },
  packagesSection: { paddingHorizontal: 20, paddingTop: 40 },
  sectionTitle: { fontSize: 28, fontWeight: '700' as const, textAlign: 'center', marginBottom: 8 },
  sectionSubtitle: { fontSize: 15, textAlign: 'center', marginBottom: 32 },
  packagesContainer: { gap: 20 },
  packageCard: { borderRadius: 20, padding: 24, position: 'relative' as const },
  packageLabel: { position: 'absolute' as const, top: -12, right: 20, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  packageLabelText: { fontSize: 11, fontWeight: '600' as const },
  eliteLabel: { position: 'absolute' as const, top: -12, right: 20, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  eliteLabelText: { fontSize: 11, fontWeight: '700' as const },
  packageName: { fontSize: 20, fontWeight: '700' as const, textAlign: 'right', marginBottom: 12, marginTop: 8 },
  compensationBadge: { alignSelf: 'flex-end' as const, marginBottom: 20 },
  compensationText: { fontSize: 14, fontWeight: '600' as const },
  featuresContainer: { marginBottom: 16 },
  featuresTitle: { fontSize: 13, fontWeight: '600' as const, marginBottom: 12, textAlign: 'right' },
  featureRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginBottom: 10 },
  featureText: { fontSize: 14, flex: 1, textAlign: 'right', lineHeight: 22 },
  designSection: { paddingTop: 16, marginTop: 8, borderTopWidth: 1 },
  notesSection: { paddingTop: 16, marginTop: 8, borderTopWidth: 1 },
  notesTitle: { fontSize: 12, fontWeight: '600' as const, marginBottom: 8, textAlign: 'right' },
  noteText: { fontSize: 12, textAlign: 'right', marginBottom: 4, lineHeight: 20 },
  packageButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, marginTop: 20, gap: 8 },
  packageButtonText: { fontSize: 16, fontWeight: '700' as const },
  aboutSection: { marginHorizontal: 20, marginTop: 48, borderRadius: 20, padding: 24, borderWidth: 1 },
  aboutTitle: { fontSize: 22, fontWeight: '700' as const, textAlign: 'center', marginBottom: 16 },
  aboutText: { fontSize: 15, textAlign: 'center', lineHeight: 26, marginBottom: 24 },
  aboutStats: { flexDirection: 'row', justifyContent: 'space-around' },
  aboutStatItem: { alignItems: 'center' },
  aboutStatValue: { fontSize: 24, fontWeight: '700' as const },
  aboutStatLabel: { fontSize: 12, marginTop: 4 },
  footer: { alignItems: 'center', paddingTop: 48, paddingBottom: 20 },
  footerLogo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  footerLogoText: { fontSize: 18, fontWeight: '600' as const },
  footerText: { fontSize: 12 },
});
