import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../core/student.service';

@Component({
  selector: 'app-student-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="card">
        <h1>Create Account</h1>
        <p class="subtitle">Register as a student</p>
        <form (ngSubmit)="register()">
          <div class="field-row">
            <div class="field flex-1">
              <label for="student_id">Student ID *</label>
              <input id="student_id" type="text" [(ngModel)]="studentId" name="student_id" required />
            </div>
            <div class="field flex-1">
              <label for="year">Year</label>
              <input id="year" type="number" [(ngModel)]="year" name="year" />
            </div>
          </div>
          <div class="field">
            <label for="name">Full Name *</label>
            <input id="name" type="text" [(ngModel)]="name" name="name" required />
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" [(ngModel)]="email" name="email" />
          </div>
          <div class="field-row">
            <div class="field flex-1">
              <label for="faculty">Faculty</label>
              <input id="faculty" type="text" [(ngModel)]="faculty" name="faculty" />
            </div>
            <div class="field flex-1">
              <label for="major">Major</label>
              <input id="major" type="text" [(ngModel)]="major" name="major" />
            </div>
          </div>
          <div class="field">
            <label for="password">Password *</label>
            <input id="password" type="password" [(ngModel)]="password" name="password" required minlength="6" />
          </div>
          <button type="submit" [disabled]="loading">
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
          @if (error) { <p class="error">{{ error }}</p> }
        </form>
        <p class="footer-text">
          Already have an account? <a routerLink="/student/login">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .page { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f4ff; padding: 1rem; }
    .card { background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); width: 100%; max-width: 480px; }
    h1 { margin: 0 0 0.25rem; font-size: 1.5rem; }
    .subtitle { color: #666; margin-bottom: 1.5rem; }
    .field { margin-bottom: 1rem; }
    .field-row { display: flex; gap: 1rem; }
    .flex-1 { flex: 1; }
    label { display: block; margin-bottom: 0.4rem; font-weight: 500; font-size: 0.9rem; }
    input { width: 100%; padding: 0.65rem; border: 2px solid #e0e7ff; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box; outline: none; }
    input:focus { border-color: #2563eb; }
    button { width: 100%; padding: 0.7rem; background: #2563eb; color: white; border: none; border-radius: 10px; font-size: 1rem; cursor: pointer; font-weight: 600; margin-top: 0.5rem; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    button:hover:not(:disabled) { background: #1d4ed8; }
    .error { color: #dc2626; margin-top: 0.75rem; font-size: 0.85rem; text-align: center; }
    .footer-text { text-align: center; margin-top: 1.25rem; font-size: 0.9rem; color: #666; }
    .footer-text a { color: #2563eb; text-decoration: none; font-weight: 500; }
    .footer-text a:hover { text-decoration: underline; }
  `]
})
export class StudentRegisterComponent {
  studentId = '';
  name = '';
  email = '';
  faculty = '';
  major = '';
  year: number | null = null;
  password = '';
  loading = false;
  error = '';

  constructor(
    private studentService: StudentService,
    private router: Router
  ) {}

  async register() {
    this.loading = true;
    this.error = '';
    try {
      const res = await this.studentService.register({
        student_id: this.studentId,
        name: this.name,
        email: this.email || undefined,
        password: this.password,
        faculty: this.faculty || undefined,
        major: this.major || undefined,
        year: this.year || undefined,
      });
      if (res.data?.token) {
        localStorage.setItem('student_token', res.data.token);
      }
      this.router.navigate(['/student/dashboard']);
    } catch (err: any) {
      this.error = err.message || 'Registration failed';
    } finally {
      this.loading = false;
    }
  }
}
