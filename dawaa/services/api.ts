import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, ENDPOINTS } from '../constants/api';

const getHeaders = async () => {
  const token = await AsyncStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  } as HeadersInit;
};

export const apiService = {
  async getEvents() {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}${ENDPOINTS.EVENTS}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  },

  async getEventById(id: string) {
    const headers = await getHeaders(); // If public, headers won't hurt, but if protected it's needed.
    const response = await fetch(`${API_URL}${ENDPOINTS.EVENTS}/${id}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch event');
    return response.json();
  },

  async createEvent(eventData: any) {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}${ENDPOINTS.EVENTS}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(eventData),
    });
    if (!response.ok) throw new Error('Failed to create event');
    return response.json();
  },

  async updateEvent(id: string, eventData: any) {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}${ENDPOINTS.EVENTS}/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(eventData),
    });
    if (!response.ok) throw new Error('Failed to update event');
    return response.json();
  },

  async getTemplates() {
    const response = await fetch(`${API_URL}${ENDPOINTS.TEMPLATES}`);
    if (!response.ok) throw new Error('Failed to fetch templates');
    return response.json();
  },

  async getPackages() {
    const response = await fetch(`${API_URL}${ENDPOINTS.PACKAGES}`);
    if (!response.ok) throw new Error('Failed to fetch packages');
    return response.json();
  },

  async updateRSVP(guestId: string, rsvpData: { rsvpStatus: string, actualCompanions: number }) {
    const response = await fetch(`${API_URL}${ENDPOINTS.GUESTS}/${guestId}/rsvp`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rsvpData),
    });
    if (!response.ok) throw new Error('Failed to update RSVP');
    return response.json();
  },

  async addGuest(eventId: string, guestData: any) {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}${ENDPOINTS.EVENTS}/${eventId}/guests`, {
      method: 'POST',
      headers,
      body: JSON.stringify(guestData),
    });
    if (!response.ok) throw new Error('Failed to add guest');
    return response.json();
  },
  
  async login(credentials: any) {
    const response = await fetch(`${API_URL}${ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.error || 'Login failed');
    }
    return response.json();
  },
  
  async signup(userData: any) {
    const response = await fetch(`${API_URL}${ENDPOINTS.SIGNUP}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.error || 'Signup failed');
    }
    return response.json();
  },

  async publicRsvp(eventId: string, guestData: any) {
    const response = await fetch(`${API_URL}${ENDPOINTS.EVENTS}/${eventId}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guestData),
    });
    if (!response.ok) throw new Error('Failed to RSVP');
    return response.json();
  },

  // --- Admin APIs ---
  async getAdminDashboard() {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}${ENDPOINTS.ADMIN_DASHBOARD}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch admin dashboard');
    return response.json();
  },

  async getEmployees() {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}${ENDPOINTS.ADMIN_EMPLOYEES}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch employees');
    return response.json();
  },

  async createEmployee(employeeData: any) {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}${ENDPOINTS.ADMIN_EMPLOYEES}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(employeeData),
    });
    if (!response.ok) throw new Error('Failed to create employee');
    return response.json();
  },

  async assignEmployee(eventId: string, employeeId: string) {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}${typeof ENDPOINTS.ADMIN_ASSIGN_EMPLOYEE === 'function' ? ENDPOINTS.ADMIN_ASSIGN_EMPLOYEE(eventId) : ''}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ employeeId }),
    });
    if (!response.ok) throw new Error('Failed to assign employee');
    return response.json();
  },

  async getAllTickets() {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/admin/tickets`, { headers });
    if (!response.ok) throw new Error('Failed to fetch tickets');
    return response.json();
  },

  async updateTicket(ticketId: string, data: any) {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/admin/tickets/${ticketId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update ticket');
    return response.json();
  },

  async getUsers() {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/admin/users`, { headers });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async createTicket(ticketData: any) {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/support/tickets`, {
      method: 'POST',
      headers,
      body: JSON.stringify(ticketData),
    });
    if (!response.ok) throw new Error('Failed to create ticket');
    return response.json();
  },

  async getUserTickets() {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/support/tickets`, { headers });
    if (!response.ok) throw new Error('Failed to fetch tickets');
    return response.json();
  },

  // --- Employee APIs ---
  async getEmployeeEvents() {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}${ENDPOINTS.EMPLOYEE_EVENTS}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch assigned events');
    return response.json();
  },

  async getEmployeeEventDetails(eventId: string) {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}${typeof ENDPOINTS.EMPLOYEE_EVENT_DETAILS === 'function' ? ENDPOINTS.EMPLOYEE_EVENT_DETAILS(eventId) : ''}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch event details');
    return response.json();
  },

  async checkInGuest(guestId: string) {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}${typeof ENDPOINTS.GUEST_CHECKIN === 'function' ? ENDPOINTS.GUEST_CHECKIN(guestId) : ''}`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Check-in failed');
    }
    return response.json();
  },

  // --- Package Management (Admin) ---
  async adminCreatePackage(packageData: any) {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}${ENDPOINTS.ADMIN_PACKAGES}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(packageData),
    });
    if (!response.ok) throw new Error('Failed to create package');
    return response.json();
  },

  async adminUpdatePackage(packageId: string, packageData: any) {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}${ENDPOINTS.ADMIN_PACKAGE_DETAIL(packageId)}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(packageData),
    });
    if (!response.ok) throw new Error('Failed to update package');
    return response.json();
  },

  async adminDeletePackage(packageId: string) {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}${ENDPOINTS.ADMIN_PACKAGE_DETAIL(packageId)}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Failed to delete package');
    return true;
  },

  // --- Checkout ---
  async checkout(checkoutData: { packageId: string, paymentDetails: any }) {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}${ENDPOINTS.CHECKOUT}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(checkoutData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Checkout failed');
    }
    return response.json();
  }
};
