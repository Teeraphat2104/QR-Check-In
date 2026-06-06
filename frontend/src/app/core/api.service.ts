import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { SupabaseService } from './supabase.service';

export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  cover_image_url: string;
  check_in_token: string | null;
  check_in_token_expires_at: string | null;
  created_at: string;
  updated_at: string;
  participants?: ActivityParticipant[];
}

export interface ActivityParticipant {
  id: string;
  activity_id: string;
  student_id: string;
  name: string;
  faculty: string;
  extra_data: string | null;
  checked_in_at: string | null;
  created_at: string;
  student?: Student;
}

export interface Student {
  id: string;
  student_id: string;
  name: string;
  faculty: string;
  major: string;
  year: number;
}

export interface CheckInInfo {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
}

export interface QRGenerateResponse {
  check_in_url: string;
  check_in_token: string;
  check_in_token_expires_at: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private supabase: SupabaseService) {}

  private async getHeaders(): Promise<Record<string, string>> {
    const session = await this.supabase.getSession();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    return headers;
  }

  private async request<T>(method: string, path: string, body?: any): Promise<T> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'request failed');
    return json;
  }

  // Admin Auth
  async syncAdmin() {
    return this.request<any>('POST', '/admin/sync');
  }

  async getProfile() {
    return this.request<any>('GET', '/admin/profile');
  }

  // Activities
  async listActivities(search?: string, category?: string) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    const qs = params.toString();
    return this.request<{ success: boolean; data: Activity[] }>('GET', `/activities${qs ? '?' + qs : ''}`);
  }

  async getActivity(id: string) {
    return this.request<{ success: boolean; data: Activity }>('GET', `/activities/${id}`);
  }

  async createActivity(data: { title: string; description?: string; date: string; location?: string; category?: string }) {
    return this.request<{ success: boolean; data: Activity }>('POST', '/activities', data);
  }

  async updateActivity(id: string, data: any) {
    return this.request<{ success: boolean; data: Activity }>('PUT', `/activities/${id}`, data);
  }

  async deleteActivity(id: string) {
    return this.request<{ success: boolean }>('DELETE', `/activities/${id}`);
  }

  // Participants
  async getParticipants(activityId: string) {
    return this.request<{ success: boolean; data: ActivityParticipant[] }>('GET', `/activities/${activityId}/participants`);
  }

  // QR
  async generateQR(activityId: string) {
    return this.request<{ success: boolean; data: QRGenerateResponse }>('POST', `/activities/${activityId}/generate-qr`);
  }

  async revokeQR(activityId: string) {
    return this.request<{ success: boolean }>('POST', `/activities/${activityId}/revoke-qr`);
  }

  getQRImageUrl(activityId: string): string {
    return `${this.baseUrl}/activities/${activityId}/qr-image`;
  }

  // Check-in (public)
  async getCheckInInfo(activityId: string, token: string) {
    const res = await fetch(`${this.baseUrl}/check-in/${activityId}?token=${token}`);
    return res.json();
  }

  async submitCheckIn(activityId: string, token: string, studentId: string) {
    const res = await fetch(`${this.baseUrl}/check-in/${activityId}?token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId }),
    });
    return res.json();
  }
}
