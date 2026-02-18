import { Platform } from 'react-native';

const PORT = 8081; // Expo web dev port

export function getBaseUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return `http://localhost:${PORT}`;
}

export function getInvitationLink(eventId: string): string {
  return `${getBaseUrl()}/rsvp/${eventId}`;
}
