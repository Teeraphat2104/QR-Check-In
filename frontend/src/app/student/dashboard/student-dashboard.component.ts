import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService, HistoryItem } from '../../core/student.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  template: `
    <div class="page">
      <div class="container">
        <header>
          <h1>My Check-In History</h1>
          <button class="logout-btn" (click)="logout()">Sign Out</button>
        </header>

        @if (loading) {
          <div class="spinner"><div class="loader"></div><p>Loading...</p></div>
        }

        @if (error) {
          <div class="error-banner"><p>{{ error }}</p></div>
        }

        @if (!loading && history.length === 0) {
          <div class="empty">
            <div class="empty-icon">&#9733;</div>
            <h2>No check-ins yet</h2>
            <p>Scan a QR code at an event to check in.</p>
          </div>
        }

        @if (history.length > 0) {
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Checked In</th>
                </tr>
              </thead>
              <tbody>
                @for (item of history; track item.id) {
                  <tr>
                    <td class="title-cell">{{ item.activity_title }}</td>
                    <td>{{ item.activity_date }}</td>
                    <td>{{ item.location }}</td>
                    <td><span class="badge">{{ item.category }}</span></td>
                    <td>{{ formatDate(item.checked_in_at) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; background: #f0f4ff; }
    .container { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h1 { margin: 0; font-size: 1.5rem; }
    .logout-btn { padding: 0.5rem 1.25rem; background: transparent; color: #dc2626; border: 2px solid #fecaca; border-radius: 10px; cursor: pointer; font-weight: 500; font-size: 0.85rem; }
    .logout-btn:hover { background: #fef2f2; }
    .spinner { text-align: center; padding: 3rem; color: #666; }
    .loader { border: 3px solid #e0e7ff; border-top: 3px solid #2563eb; border-radius: 50%; width: 32px; height: 32px; animation: spin 0.8s linear infinite; margin: 0 auto 0.5rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error-banner { background: #fef2f2; color: #dc2626; padding: 0.75rem 1rem; border-radius: 10px; margin-bottom: 1rem; font-size: 0.85rem; }
    .error-banner p { margin: 0; }
    .empty { text-align: center; padding: 4rem 1rem; background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .empty-icon { font-size: 3rem; margin-bottom: 0.5rem; }
    .empty h2 { margin: 0 0 0.5rem; color: #333; }
    .empty p { color: #666; }
    .table-wrapper { background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 1rem; font-size: 0.8rem; text-transform: uppercase; color: #666; border-bottom: 2px solid #eef2ff; }
    td { padding: 1rem; border-bottom: 1px solid #f0f0f0; font-size: 0.9rem; }
    tr:last-child td { border-bottom: none; }
    .title-cell { font-weight: 500; color: #1e293b; }
    .badge { display: inline-block; background: #eef2ff; color: #4338ca; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; }
  `]
})
export class StudentDashboardComponent implements OnInit {
  history: HistoryItem[] = [];
  loading = true;
  error = '';

  constructor(
    private studentService: StudentService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      const res = await this.studentService.getHistory();
      if (res.success) {
        this.history = res.data;
      }
    } catch (err: any) {
      this.error = err.message || 'Failed to load history';
    } finally {
      this.loading = false;
    }
  }

  logout() {
    localStorage.removeItem('student_token');
    this.router.navigate(['/student/login']);
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
}
