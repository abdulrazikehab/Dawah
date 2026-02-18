export interface Invitation {
  id: string;
  title: string;
  type: InvitationType;
  date: string;
  time: string;
  location: string;
  guestCount: number;
  confirmedCount: number;
  pendingCount: number;
  declinedCount: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  template: string;
  createdAt: string;
  package: PackageType;
}

export type InvitationType = 'wedding' | 'birthday' | 'graduation' | 'corporate' | 'other';

export type PackageType = 'basic' | 'premium' | 'professional';

export interface Package {
  id: string;
  name: string;
  nameAr?: string;
  price: number;
  currency?: string;
  features: string[];
  recommended?: boolean;
  icon?: string;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  color: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: 'pending' | 'confirmed' | 'declined';
  invitedAt: string;
  respondedAt?: string;
}

export interface AcceptedGuest {
  id: string;
  invitationId: string;
  name: string;
  phone: string;
  acceptedAt: string;
  qrCode: string;
  companions?: Companion[];
  preInvitedGuestId?: string;
}

export interface PreInvitedGuest {
  id: string;
  name: string;
  phone: string;
  maxCompanions: number;
}

export interface Companion {
  id: string;
  name: string;
}

export interface Template {
  id: string;
  name: string;
  nameAr?: string;
  image?: string;
  imageUrl?: string;
  category: string;
  premium?: boolean;
}

export interface UserStats {
  totalInvitations: number;
  activeInvitations: number;
  totalGuests: number;
  confirmedGuests: number;
}

export interface CreateInvitationData {
  step: number;
  template?: string;
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  groomName?: string;
  brideName?: string;
  message?: string;
  guests: Guest[];
  package?: PackageType;
}
