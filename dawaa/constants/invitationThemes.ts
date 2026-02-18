export interface InvitationTheme {
  id: string;
  nameAr: string;
  nameEn: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export const invitationThemes: InvitationTheme[] = [
  {
    id: 'classic-gold',
    nameAr: 'ذهبي كلاسيكي',
    nameEn: 'Classic Gold',
    primaryColor: '#C9A227',
    secondaryColor: '#152238',
    backgroundColor: '#0B1426',
    textColor: '#FFFFFF',
    accentColor: '#C9A227',
  },
  {
    id: 'royal-silver',
    nameAr: 'فضي ملكي',
    nameEn: 'Royal Silver',
    primaryColor: '#E2E8F0',
    secondaryColor: '#1A1A1A',
    backgroundColor: '#0F172A',
    textColor: '#FFFFFF',
    accentColor: '#94A3B8',
  },
  {
    id: 'floral-pink',
    nameAr: 'زهور وردي',
    nameEn: 'Floral Pink',
    primaryColor: '#F472B6',
    secondaryColor: '#500724',
    backgroundColor: '#1F0B15',
    textColor: '#FFFFFF',
    accentColor: '#F472B6',
  },
  {
    id: 'elegant-navy',
    nameAr: 'كحلي أنيق',
    nameEn: 'Elegant Navy',
    primaryColor: '#38BDF8',
    secondaryColor: '#0C4A6E',
    backgroundColor: '#081421',
    textColor: '#FFFFFF',
    accentColor: '#38BDF8',
  },
  {
    id: 'premium-purple',
    nameAr: 'بنفسجي ملكي',
    nameEn: 'Premium Purple',
    primaryColor: '#A855F7',
    secondaryColor: '#3B0764',
    backgroundColor: '#11061E',
    textColor: '#FFFFFF',
    accentColor: '#A855F7',
  },
  {
    id: 'royal-green',
    nameAr: 'أخضر ملكي',
    nameEn: 'Royal Green',
    primaryColor: '#10B981',
    secondaryColor: '#064E3B',
    backgroundColor: '#022C22',
    textColor: '#FFFFFF',
    accentColor: '#10B981',
  }
];
