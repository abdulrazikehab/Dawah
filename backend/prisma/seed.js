const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Reset database (optional, but good for consistent state during dev)
  try {
    await prisma.guest.deleteMany();
    await prisma.event.deleteMany();
    await prisma.template.deleteMany();
    await prisma.package.deleteMany();
    console.log('Database cleared.');
  } catch (error) {
    console.warn('Could not clear database, maybe tables do not exist yet.');
  }

  // Packages
  await prisma.package.createMany({
    data: [
      {
        id: 'pkg_basic',
        name: 'Basic',
        nameAr: 'باقة دعوة الذاتية',
        price: 99,
        features: ['تصميم دعوة إلكترونية', 'رابط المشاركة عبر واتساب', 'لوحة تحكم للمدعوين', 'عدد لا محدود من المدعوين'],
      },
      {
        id: 'pkg_premium',
        name: 'Premium',
        nameAr: 'باقة دعوة المخصصة',
        price: 249,
        features: ['جميع مميزات الباقة الأساسية', 'إرسال رسائل واتساب تلقائية', 'تذكير بموعد المناسبة', 'باركود QR للدخول', 'دعم فني مخصص'],
      },
      {
        id: 'pkg_vip',
        name: 'VIP',
        nameAr: 'باقة دعوة المتكاملة',
        price: 499,
        features: ['جميع مميزات الباقة المخصصة', 'تصميم فيديو موشن جرافيك', 'نطاق خاص (Domain)', 'إدارة القاعة وتوزيع الطاولات', 'طباعة بطاقات QR'],
      }
    ]
  });

  // Templates
  const templates = [
    // Wedding
    { name: 'Kلاسيك زفاف', category: 'wedding', imageUrl: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop' },
    { name: 'زهور الربيع', category: 'wedding', imageUrl: 'https://images.unsplash.com/photo-1522673607200-1645062cd495?q=80&w=2070&auto=format&fit=crop' },
    { name: 'ليلة العمر', category: 'wedding', imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0202128?q=80&w=2070&auto=format&fit=crop' },
    { name: 'فخامة ملكية', category: 'wedding', imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop' },

    // Birthday
    { name: 'حفلة مرحة', category: 'birthday', imageUrl: 'https://images.unsplash.com/photo-1530103862676-de3c9a59af38?q=80&w=2070&auto=format&fit=crop' },
    { name: 'عيد ميلاد سعيد', category: 'birthday', imageUrl: 'https://images.unsplash.com/photo-1464349172904-ab954274c10a?q=80&w=1858&auto=format&fit=crop' },
    { name: 'ألوان البهجة', category: 'birthday', imageUrl: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?q=80&w=2070&auto=format&fit=crop' },

    // Graduation
    { name: 'تخرج 2024', category: 'graduation', imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop' },
    { name: 'نجاح وتفوق', category: 'graduation', imageUrl: 'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?q=80&w=2070&auto=format&fit=crop' },
    { name: 'مستقبل واعد', category: 'graduation', imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop' },

    // Corporate
    { name: 'مؤتمر تقني', category: 'corporate', imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070&auto=format&fit=crop' },
    { name: 'اجتماع سنوي', category: 'corporate', imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2070&auto=format&fit=crop' },

    // Other
    { name: 'عشاء خاص', category: 'other', imageUrl: 'https://images.unsplash.com/photo-1519671482538-eb7251a7d6a5?q=80&w=2070&auto=format&fit=crop' },
    { name: 'لقاء الأصدقاء', category: 'other', imageUrl: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2069&auto=format&fit=crop' }
  ];

  await prisma.template.createMany({
    data: templates
  });

  console.log(`Seeding finished. Created ${templates.length} templates and 3 packages.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
