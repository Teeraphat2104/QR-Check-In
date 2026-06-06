import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Activity } from '../../../core/api.service';
import { SupabaseService } from '../../../core/supabase.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, FormsModule],
  template: `
    <div class="dashboard">
      <header>
        <h1>Activities</h1>
        <div class="header-actions">
          <input type="text" placeholder="Search activities..." [(ngModel)]="search" (input)="onSearch()" />
          <button class="btn-primary" (click)="create()">+ New Activity</button>
          <button class="btn-outline" (click)="logout()">Logout</button>
        </div>
      </header>

      @if (activities.length > 0) {
        <div class="activity-grid">
          @for (a of activities; track a.id) {
            <div class="activity-card" (click)="viewActivity(a.id)">
              <h3>{{ a.title }}</h3>
              <p class="meta">{{ a.date | date:'MMM d, yyyy' }} &middot; {{ a.location }}</p>
              <p class="category">{{ a.category }}</p>
              @if (a.check_in_token) {
                <div class="qr-status"><span class="badge active">QR Active</span></div>
              } @else {
                <div class="qr-status"><span class="badge inactive">No QR</span></div>
              }
            </div>
          }
        </div>
      } @else {
        <p class="empty">No activities yet. Create your first one!</p>
      }
    </div>
  `,
  styles: [`
    .dashboard { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; }
    h1 { margin: 0; font-size: 1.75rem; }
    .header-actions { display: flex; gap: 0.5rem; align-items: center; }
    input { padding: 0.5rem 0.75rem; border: 1px solid #ddd; border-radius: 8px; font-size: 0.9rem; width: 220px; }
    .btn-primary { padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-outline { padding: 0.5rem 1rem; background: transparent; color: #666; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
    .btn-outline:hover { background: #f5f5f5; }
    .activity-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
    .activity-card { background: white; padding: 1.25rem; border-radius: 10px; box-shadow: 0 1px 6px rgba(0,0,0,0.06); cursor: pointer; transition: box-shadow 0.15s; }
    .activity-card:hover { box-shadow: 0 3px 12px rgba(0,0,0,0.1); }
    .activity-card h3 { margin: 0 0 0.4rem; font-size: 1.05rem; }
    .meta { color: #666; font-size: 0.85rem; margin: 0 0 0.5rem; }
    .category { display: inline-block; background: #eef2ff; color: #4338ca; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; }
    .qr-status { margin-top: 0.5rem; }
    .badge { font-size: 0.75rem; padding: 0.15rem 0.5rem; border-radius: 4px; }
    .badge.active { background: #dcfce7; color: #16a34a; }
    .badge.inactive { background: #f3f4f6; color: #9ca3af; }
    .empty { text-align: center; color: #9ca3af; padding: 4rem 0; }
  `]
})
export class DashboardComponent implements OnInit {
  activities: Activity[] = [];
  search = '';

  constructor(
    private api: ApiService,
    private supabase: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadActivities();
  }

  async loadActivities() {
    try {
      const res = await this.api.listActivities(this.search || undefined);
      this.activities = res.data;
    } catch (err) {
      console.error('Failed to load activities', err);
    }
  }

  onSearch() {
    this.loadActivities();
  }

  viewActivity(id: string) {
    this.router.navigate(['/admin/activities', id]);
  }

  create() {
    this.router.navigate(['/admin/activities/new']);
  }

  async logout() {
    await this.supabase.signOut();
    this.router.navigate(['/admin/login']);
  }
}
