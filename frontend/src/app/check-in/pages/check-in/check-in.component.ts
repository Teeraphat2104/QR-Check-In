import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService, CheckInInfo } from '../../../core/api.service';
import { SupabaseService } from '../../../core/supabase.service';

@Component({
  selector: 'app-check-in',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="checkin-page">
      @if (!loading) {
        <div class="checkin-card">
          @if (activity) {
            <div class="header">
              <h1>{{ activity.title }}</h1>
              <p class="meta">{{ formatDate(activity.date) }} &middot; {{ activity.location }}</p>
              <span class="category">{{ activity.category }}</span>
            </div>
          }

          @if (error) {
            <div class="error-banner">
              <p>{{ error }}</p>
            </div>
          }

          @if (activity && !checkInResult) {
            <div class="form">
              <p class="instruction">Enter your Student ID to check in</p>
              <input type="text" [(ngModel)]="studentId" placeholder="Student ID" (keyup.enter)="submitCheckIn()" />
              <button (click)="submitCheckIn()" [disabled]="submitting || !studentId">
                {{ submitting ? 'Checking in...' : 'Check In' }}
              </button>
            </div>
          }

          @if (checkInResult) {
            <div class="result">
              <div class="check-icon">&#10003;</div>
              <h2>{{ checkInResult.message === 'already checked in' ? 'Already Checked In' : 'You\'re Checked In!' }}</h2>
              <p class="student-name">{{ checkInResult.data.name }}</p>
              @if (checkInResult.data.checked_in_at) {
                <p class="time">{{ checkInResult.data.checked_in_at | date:'h:mm a' }}</p>
              }
            </div>
          }
        </div>
      } @else {
        <div class="spinner"><div class="loader"></div><p>Loading...</p></div>
      }
    </div>
  `,
  styles: [`
    .checkin-page { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f4ff; padding: 1rem; }
    .checkin-card { background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); width: 100%; max-width: 420px; text-align: center; }
    .header { margin-bottom: 1.5rem; }
    h1 { margin: 0 0 0.4rem; font-size: 1.4rem; }
    .meta { color: #666; font-size: 0.85rem; margin: 0 0 0.5rem; }
    .category { display: inline-block; background: #eef2ff; color: #4338ca; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; }
    .error-banner { background: #fef2f2; color: #dc2626; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.85rem; }
    .error-banner p { margin: 0; }
    .instruction { color: #555; margin-bottom: 1rem; font-size: 0.95rem; }
    .form input { width: 100%; padding: 0.75rem; border: 2px solid #e0e7ff; border-radius: 10px; font-size: 1.1rem; text-align: center; box-sizing: border-box; margin-bottom: 1rem; outline: none; }
    .form input:focus { border-color: #2563eb; }
    .form button { width: 100%; padding: 0.75rem; background: #2563eb; color: white; border: none; border-radius: 10px; font-size: 1rem; cursor: pointer; font-weight: 600; }
    .form button:disabled { opacity: 0.5; cursor: not-allowed; }
    .form button:hover:not(:disabled) { background: #1d4ed8; }
    .result { padding: 1rem 0; }
    .check-icon { width: 64px; height: 64px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; margin: 0 auto 1rem; }
    .result h2 { margin: 0 0 0.5rem; color: #16a34a; font-size: 1.2rem; }
    .student-name { font-size: 1rem; color: #333; margin: 0 0 0.25rem; }
    .time { color: #666; font-size: 0.85rem; margin: 0; }
    .spinner { text-align: center; color: #666; }
    .loader { border: 3px solid #e0e7ff; border-top: 3px solid #2563eb; border-radius: 50%; width: 32px; height: 32px; animation: spin 0.8s linear infinite; margin: 0 auto 0.5rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class CheckInComponent implements OnInit {
  activity: CheckInInfo | null = null;
  studentId = '';
  submitting = false;
  loading = true;
  error = '';
  checkInResult: any = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    const activityId = this.route.snapshot.paramMap.get('id');
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!activityId || !token) {
      this.error = 'Invalid check-in link';
      this.loading = false;
      return;
    }

    try {
      await this.supabase.signInAnonymously();
    } catch (err) {
    }

    try {
      const res = await this.api.getCheckInInfo(activityId, token);
      if (!res.success) {
        this.error = res.message || 'Invalid QR code';
      } else {
        this.activity = res.data;
      }
    } catch (err: any) {
      this.error = err.message || 'Failed to load check-in info';
    } finally {
      this.loading = false;
    }
  }

  async submitCheckIn() {
    const activityId = this.route.snapshot.paramMap.get('id');
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!activityId || !token || !this.studentId.trim()) return;

    this.submitting = true;
    this.error = '';
    try {
      const res = await this.api.submitCheckIn(activityId, token, this.studentId.trim());
      if (!res.success) {
        this.error = res.message || 'Check-in failed';
      } else {
        this.checkInResult = res;
      }
    } catch (err: any) {
      this.error = err.message || 'Check-in failed';
    } finally {
      this.submitting = false;
    }
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}
