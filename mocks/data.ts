import { Category, Feature, Invitation, Package, Template } from '@/types';

export const categories: Category[] = [
  { id: 'wedding', name: 'Wedding', nameAr: 'زفاف', icon: 'heart', color: '#E91E63' },
  { id: 'birthday', name: 'Birthday', nameAr: 'عيد ميلاد', icon: 'cake', color: '#9C27B0' },
  { id: 'graduation', name: 'Graduation', nameAr: 'تخرج', icon: 'graduation-cap', color: '#3F51B5' },
  { id: 'corporate', name: 'Corporate', nameAr: 'شركات', icon: 'briefcase', color: '#009688' },
];

export const features: Feature[] = [
  {
    id: '1',
    title: 'سريعة وسهولة',
    description: 'أنشئ دعوتك في دقائق معدودة بخطوات بسيطة',
    icon: 'zap',
  },
  {
    id: '2',
    title: 'تصاميم فاخرة',
    description: 'قوالب احترافية مصممة بعناية فائقة',
    icon: 'palette',
  },
  {
    id: '3',
    title: 'تتبع دقيق',
    description: 'تابع ردود ضيوفك بكل سهولة',
    icon: 'bar-chart-2',
  },
  {
    id: '4',
    title: 'أمان وخصوصية',
    description: 'بياناتك محمية بأعلى معايير الأمان',
    icon: 'shield',
  },
];

export const howItWorks = [
  {
    id: '1',
    title: 'اختر التصميم',
    description: 'اختر من مجموعتنا الواسعة من القوالب الفاخرة',
    step: 1,
  },
  {
    id: '2',
    title: 'خصص التفاصيل',
    description: 'أضف معلومات حفلتك والضيوف المدعوين',
    step: 2,
  },
  {
    id: '3',
    title: 'أرسل وتابع',
    description: 'أرسل الدعوات وتابع ردود الضيوف بسهولة',
    step: 3,
  },
];

export const packages: Package[] = [
  {
    id: 'basic',
    name: 'Basic',
    nameAr: 'الباقة الأساسية',
    price: 99,
    currency: 'ريال',
    icon: 'star',
    color: '#C0C0C0',
    features: [
      'تصميم واحد',
      '50 دعوة',
      'دعم عبر البريد',
      'صلاحية 30 يوم',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    nameAr: 'باقة بريميم',
    price: 199,
    currency: 'ريال',
    icon: 'crown',
    color: '#D4AF37',
    recommended: true,
    features: [
      'جميع التصاميم',
      '200 دعوة',
      'دعم فوري',
      'صلاحية 60 يوم',
      'تقارير تفصيلية',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    nameAr: 'الباقة الاحترافية',
    price: 399,
    currency: 'ريال',
    icon: 'gem',
    color: '#8B5CF6',
    features: [
      'جميع التصاميم الحصرية',
      'دعوات غير محدودة',
      'دعم على مدار الساعة',
      'صلاحية غير محدودة',
      'تقارير متقدمة',
      'تخصيص كامل',
    ],
  },
];

export const templates: Template[] = [
  {
    id: '1',
    name: 'Royal Gold',
    nameAr: 'الذهب الملكي',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
    category: 'wedding',
    premium: false,
  },
  {
    id: '2',
    name: 'Elegant White',
    nameAr: 'الأبيض الأنيق',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
    category: 'wedding',
    premium: true,
  },
  {
    id: '3',
    name: 'Modern Minimal',
    nameAr: 'البساطة العصرية',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400',
    category: 'birthday',
    premium: false,
  },
  {
    id: '4',
    name: 'Colorful Celebration',
    nameAr: 'احتفال ملون',
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400',
    category: 'birthday',
    premium: false,
  },
  {
    id: '5',
    name: 'Academic Excellence',
    nameAr: 'التميز الأكاديمي',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400',
    category: 'graduation',
    premium: true,
  },
  {
    id: '6',
    name: 'Corporate Blue',
    nameAr: 'الأزرق المؤسسي',
    image: 'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?w=400',
    category: 'corporate',
    premium: false,
  },
];

export const sampleInvitations: Invitation[] = [
  {
    id: '1',
    title: 'حفل زفاف أحمد وسارة',
    type: 'wedding',
    date: '2025-03-15',
    time: '19:00',
    location: 'قاعة الملكية، الرياض',
    guestCount: 150,
    confirmedCount: 89,
    pendingCount: 45,
    declinedCount: 16,
    status: 'active',
    template: '1',
    createdAt: '2025-01-15',
    package: 'premium',
  },
  {
    id: '2',
    title: 'عيد ميلاد ليان',
    type: 'birthday',
    date: '2025-02-20',
    time: '16:00',
    location: 'منزل العائلة',
    guestCount: 30,
    confirmedCount: 25,
    pendingCount: 3,
    declinedCount: 2,
    status: 'active',
    template: '3',
    createdAt: '2025-01-20',
    package: 'basic',
  },
  {
    id: '3',
    title: 'حفل تخرج محمد',
    type: 'graduation',
    date: '2025-04-10',
    time: '18:00',
    location: 'جامعة الملك سعود',
    guestCount: 75,
    confirmedCount: 0,
    pendingCount: 75,
    declinedCount: 0,
    status: 'draft',
    template: '5',
    createdAt: '2025-01-25',
    package: 'premium',
  },
];

export const faqs = [
  {
    id: '1',
    question: 'هل يمكنني تعديل الدعوة بعد إرسالها؟',
    answer: 'نعم، يمكنك تعديل تفاصيل الدعوة في أي وقت وسيتم إشعار الضيوف بالتحديثات.',
  },
  {
    id: '2',
    question: 'كيف يستلم الضيوف الدعوات؟',
    answer: 'يتم إرسال الدعوات عبر رسائل واتساب أو SMS أو البريد الإلكتروني.',
  },
  {
    id: '3',
    question: 'هل يمكن استرداد المبلغ؟',
    answer: 'نعم، يمكن استرداد المبلغ خلال 7 أيام من الشراء إذا لم تستخدم الخدمة.',
  },
  {
    id: '4',
    question: 'هل الموقع آمن؟',
    answer: 'نعم، نستخدم أعلى معايير الأمان لحماية بياناتك وبيانات ضيوفك.',
  },
];
