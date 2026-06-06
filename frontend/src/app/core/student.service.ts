import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Student {
  id: string;
  student_id: string;
  name: string;
  email: string;
  faculty: string;
  major: string;
  year: number;
}

export interface HistoryItem {
  id: string;
  activity_id: string;
  activity_title: string;
  activity_date: string;
  location: string;
  category: string;
  checked_in_at: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private baseUrl = environment.apiUrl;

  getToken(): string | null {
    return localStorage.getItem('student_token');
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async register(data: {
    student_id: string;
    name: string;
    email?: string;
    password: string;
    faculty?: string;
    major?: string;
    year?: number;
  }): Promise<{ success: boolean; message: string; data?: { student: Student; token: string } }> {
    const res = await fetch(`${this.baseUrl}/student/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'registration failed');
    return json;
  }

  async login(student_id: string, password: string): Promise<{ success: boolean; message: string; data?: { student: Student; token: string } }> {
    const res = await fetch(`${this.baseUrl}/student/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'login failed');
    return json;
  }

  async getHistory(): Promise<{ success: boolean; data: HistoryItem[] }> {
    const res = await fetch(`${this.baseUrl}/student/history`, {
      headers: this.getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'failed to fetch history');
    return json;
  }
}
