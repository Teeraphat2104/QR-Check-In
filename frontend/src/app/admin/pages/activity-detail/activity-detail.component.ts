import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService, Activity, ActivityParticipant } from '../../../core/api.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-activity-detail',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (activity) {
      <div class="detail-page">
        <header>
          <button class="btn-back" (click)="back()">&larr; Back</button>
          <div class="header-actions">
            <button class="btn-outline" (click)="edit()">Edit</button>
            <button class="btn-danger" (click)="deleteActivity()">Delete</button>
          </div>
        </header>

        <div class="content">
          <div class="info-panel">
            <h1>{{ activity.title }}</h1>
            <p class="meta">{{ activity.date | date:'fullDate' }} &middot; {{ activity.location }}</p>
            <span class="category">{{ activity.category }}</span>
            @if (activity.description) {
              <p class="desc">{{ activity.description }}</p>
            }

            <div class="qr-section">
              <h2>QR Check-in</h2>
              @if (!activity.check_in_token) {
                <div class="qr-placeholder">
                  <p>No active QR code for this activity.</p>
                  <button class="btn-primary" (click)="generateQR()" [disabled]="qrLoading">
                    {{ qrLoading ? 'Generating...' : 'Generate QR Code' }}
                  </button>
                </div>
              }

              @if (activity.check_in_token && qrUrl) {
                <div class="qr-active">
                  <div class="qr-image">
                    <img [src]="qrUrl" alt="QR Code" />
                  </div>
                  <p class="qr-hint">Scan this QR code to check in</p>
                  <div class="qr-actions">
                    <a class="btn-primary" [href]="qrImageUrl" download>Download PNG</a>
                    <button class="btn-outline" (click)="printQR()">Print</button>
                    <button class="btn-danger" (click)="revokeQR()" [disabled]="qrLoading">
                      {{ qrLoading ? 'Revoking...' : 'Revoke' }}
                    </button>
                  </div>
                  @if (activity.check_in_token_expires_at) {
                    <p class="expiry">Expires: {{ activity.check_in_token_expires_at | date:'medium' }}</p>
                  }
                </div>
              }
            </div>
          </div>

          <div class="participants-panel">
            <h2>Participants ({{ participants.length }})</h2>
            <div class="stats">
              <div class="stat">
                <span class="stat-num">{{ checkedInCount }}</span>
                <span class="stat-label">Checked In</span>
              </div>
              <div class="stat">
                <span class="stat-num">{{ participants.length - checkedInCount }}</span>
                <span class="stat-label">Pending</span>
              </div>
            </div>

            @if (participants.length > 0) {
              <div class="participant-list">
                @for (p of participants; track p.id) {
                  <div class="participant-row" [class.checked-in]="p.checked_in_at">
                    <div class="p-info">
                      <span class="p-name">{{ p.name }}</span>
                      @if (p.faculty) {
                        <span class="p-faculty">{{ p.faculty }}</span>
                      }
                      @if (p.student) {
                        <span class="p-id">ID: {{ p.student.student_id }}</span>
                      }
                    </div>
                    <div class="p-status">
                      <span class="status-badge" [class.done]="p.checked_in_at" [class.pending]="!p.checked_in_at">
                        {{ p.checked_in_at ? (p.checked_in_at | date:'shortTime') : 'Not checked in' }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="empty">No participants yet.</p>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .detail-page { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .btn-back { background: none; border: none; cursor: pointer; font-size: 1rem; color: #2563eb; padding: 0; }
    .header-actions { display: flex; gap: 0.5rem; }
    .content { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    @media (max-width: 768px) { .content { grid-template-columns: 1fr; } }
    h1 { margin: 0 0 0.4rem; font-size: 1.5rem; }
    .meta { color: #666; font-size: 0.9rem; margin: 0 0 0.5rem; }
    .category { display: inline-block; background: #eef2ff; color: #4338ca; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; }
    .desc { margin-top: 1rem; color: #444; line-height: 1.6; }

    .qr-section { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #eee; }
    .qr-section h2 { font-size: 1.1rem; margin: 0 0 1rem; }
    .qr-placeholder { text-align: center; padding: 2rem; background: #f9fafb; border-radius: 10px; }
    .qr-placeholder p { color: #666; margin-bottom: 1rem; }
    .qr-active { text-align: center; }
    .qr-image { display: inline-block; padding: 1rem; background: white; border: 2px solid #eee; border-radius: 12px; margin-bottom: 0.75rem; }
    .qr-image img { width: 200px; height: 200px; }
    .qr-hint { color: #666; font-size: 0.85rem; margin-bottom: 1rem; }
    .qr-actions { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 0.5rem; }
    .expiry { color: #9ca3af; font-size: 0.8rem; }

    .participants-panel h2 { font-size: 1.1rem; margin: 0 0 1rem; }
    .stats { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .stat { flex: 1; background: #f9fafb; padding: 0.75rem; border-radius: 8px; text-align: center; }
    .stat-num { display: block; font-size: 1.5rem; font-weight: 700; color: #2563eb; }
    .stat-label { font-size: 0.75rem; color: #666; }

    .participant-row { display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0; border-bottom: 1px solid #f0f0f0; }
    .participant-row.checked-in { background: #f0fdf4; margin: 0 -0.5rem; padding: 0.65rem 0.5rem; border-radius: 6px; }
    .p-info { display: flex; flex-direction: column; gap: 0.15rem; }
    .p-name { font-weight: 500; font-size: 0.9rem; }
    .p-faculty, .p-id { font-size: 0.75rem; color: #666; }
    .status-badge { font-size: 0.8rem; padding: 0.2rem 0.5rem; border-radius: 4px; }
    .status-badge.done { background: #dcfce7; color: #16a34a; }
    .status-badge.pending { background: #f3f4f6; color: #9ca3af; }

    .btn-primary { padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-outline { padding: 0.5rem 1rem; background: transparent; color: #666; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; font-size: 0.9rem; text-decoration: none; display: inline-block; }
    .btn-danger { padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
    .empty { color: #9ca3af; text-align: center; padding: 2rem 0; }
  `]
})
export class ActivityDetailComponent implements OnInit, OnDestroy {
  activity: Activity | null = null;
  participants: ActivityParticipant[] = [];
  qrLoading = false;
  qrUrl = '';
  qrImageUrl = '';
  private pollInterval: any;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadActivity(id);
      this.loadParticipants(id);
      this.pollInterval = setInterval(() => this.loadParticipants(id), 10000);
    }
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  get checkedInCount() {
    return this.participants.filter(p => p.checked_in_at).length;
  }

  async loadActivity(id: string) {
    try {
      const res = await this.api.getActivity(id);
      this.activity = res.data;
      if (this.activity.check_in_token) {
        this.qrUrl = environment.apiUrl + '/activities/' + id + '/qr-image?t=' + Date.now();
        this.qrImageUrl = environment.apiUrl + '/activities/' + id + '/qr-image';
      }
    } catch (err) {
      console.error('Failed to load activity', err);
    }
  }

  async loadParticipants(id: string) {
    try {
      const res = await this.api.getParticipants(id);
      this.participants = res.data;
    } catch (err) {
      console.error('Failed to load participants', err);
    }
  }

  async generateQR() {
    if (!this.activity) return;
    this.qrLoading = true;
    try {
      const res = await this.api.generateQR(this.activity.id);
      this.activity.check_in_token = res.data.check_in_token;
      this.activity.check_in_token_expires_at = res.data.check_in_token_expires_at;
      this.qrUrl = res.data.check_in_url;
      this.qrImageUrl = environment.apiUrl + '/activities/' + this.activity.id + '/qr-image';
    } catch (err: any) {
      alert(err.message || 'Failed to generate QR');
    } finally {
      this.qrLoading = false;
    }
  }

  async revokeQR() {
    if (!this.activity) return;
    this.qrLoading = true;
    try {
      await this.api.revokeQR(this.activity.id);
      this.activity.check_in_token = null;
      this.activity.check_in_token_expires_at = null;
      this.qrUrl = '';
      this.qrImageUrl = '';
    } catch (err: any) {
      alert(err.message || 'Failed to revoke QR');
    } finally {
      this.qrLoading = false;
    }
  }

  printQR() {
    const win = window.open('', '_blank');
    if (win && this.qrUrl) {
      win.document.write(`<img src="${this.qrUrl}" onload="window.print()" style="width:100%;max-width:400px" />`);
      win.document.close();
    }
  }

  edit() {
    if (this.activity) {
      this.router.navigate(['/admin/activities', this.activity.id, 'edit']);
    }
  }

  async deleteActivity() {
    if (!this.activity || !confirm('Delete this activity? This cannot be undone.')) return;
    try {
      await this.api.deleteActivity(this.activity.id);
      this.router.navigate(['/admin/dashboard']);
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  }

  back() {
    this.router.navigate(['/admin/dashboard']);
  }
}
