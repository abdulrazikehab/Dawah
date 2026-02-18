import Constants from 'expo-constants';

// Local dev URL (change to your production URL later)
// Android emulator uses 10.0.2.2 to access localhost
const LOCALHOST = 'http://10.0.2.2:3001'; 
const WEB_LOCALHOST = 'http://localhost:3001';

export const API_URL = Constants.expoConfig?.hostUri
  ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:3001/api`
  : WEB_LOCALHOST + '/api';

export const ENDPOINTS = {
  EVENTS: '/events',
  GUESTS: '/guests',
  TEMPLATES: '/templates',
  PACKAGES: '/packages',
};
