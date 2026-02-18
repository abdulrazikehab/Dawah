import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PORT = 4010;
const ANDROID_LOCALHOST = 'http://10.0.2.2';

export const API_URL = (() => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
        return `http://${hostname}:${PORT}/api`;
      }
      return 'https://rork-app-pages-maker.vercel.app/api';
    }
    return `http://localhost:${PORT}/api`;
  }

  // Native
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':').shift();
    return `http://${ip}:${PORT}/api`;
  }
  return `${ANDROID_LOCALHOST}:${PORT}/api`;
})();

export const ENDPOINTS = {
  EVENTS: '/events',
  GUESTS: '/guests',
  TEMPLATES: '/templates',
  PACKAGES: '/packages',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  ME: '/auth/me',
  // Admin
  ADMIN_EMPLOYEES: '/admin/employees',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_ASSIGN_EMPLOYEE: (eventId: string) => `/admin/events/${eventId}/assign`,
  ADMIN_PACKAGES: '/admin/packages',
  ADMIN_PACKAGE_DETAIL: (id: string) => `/admin/packages/${id}`,
  // Checkout
  CHECKOUT: '/checkout',
  // Employee
  EMPLOYEE_EVENTS: '/employee/events',
  EMPLOYEE_EVENT_DETAILS: (eventId: string) => `/employee/events/${eventId}/details`,
  GUEST_CHECKIN: (guestId: string) => `/guests/${guestId}/checkin`,
};
