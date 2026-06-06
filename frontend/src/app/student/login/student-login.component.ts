import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../core/student.service';

@Component({
  selector: 'app-student-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="card">
        <h1>Student Login</h1>
        <p class="subtitle">Sign in with your Student ID</p>
        <form (ngSubmit)="login()">
          <div class="field">
            <label for="student_id">Student ID</label>
            <input id="student_id" type="text" [(ngModel)]="studentId" name="student_id" required autocomplete="username" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" [(ngModel)]="password" name="password" required autocomplete="current-password" />
          </div>
          <button type="submit" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
          @if (error) { <p class="error">{{ error }}</p> }
        </form>
        <p class="footer-text">
          Don't have an account? <a routerLink="/student/register">Register here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .page { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f4ff; }
    .card { background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); width: 100%; max-width: 400px; }
    h1 { margin: 0 0 0.25rem; font-size: 1.5rem; }
    .subtitle { color: #666; margin-bottom: 1.5rem; }
    .field { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.4rem; font-weight: 500; font-size: 0.9rem; }
    input { width: 100%; padding: 0.65rem; border: 2px solid #e0e7ff; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box; outline: none; }
    input:focus { border-color: #2563eb; }
    button { width: 100%; padding: 0.7rem; background: #2563eb; color: white; border: none; border-radius: 10px; font-size: 1rem; cursor: pointer; font-weight: 600; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    button:hover:not(:disabled) { background: #1d4ed8; }
    .error { color: #dc2626; margin-top: 0.75rem; font-size: 0.85rem; text-align: center; }
    .footer-text { text-align: center; margin-top: 1.25rem; font-size: 0.9rem; color: #666; }
    .footer-text a { color: #2563eb; text-decoration: none; font-weight: 500; }
    .footer-text a:hover { text-decoration: underline; }
  `]
})
export class StudentLoginComponent {
  studentId = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private studentService: StudentService,
    private router: Router
  ) {}

  async login() {
    this.loading = true;
    this.error = '';
    try {
      const res = await this.studentService.login(this.studentId, this.password);
      if (res.data?.token) {
        localStorage.setItem('student_token', res.data.token);
      }
      this.router.navigate(['/student/dashboard']);
    } catch (err: any) {
      this.error = err.message || 'Login failed';
    } finally {
      this.loading = false;
    }
  }
}
