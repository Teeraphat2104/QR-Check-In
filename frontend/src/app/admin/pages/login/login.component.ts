import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/supabase.service';
import { ApiService } from '../../../core/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Admin Login</h1>
        <p class="subtitle">QR Check-in System</p>
        <form (ngSubmit)="login()">
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" [(ngModel)]="email" name="email" required autocomplete="email" />
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
      </div>
    </div>
  `,
  styles: [`
    .login-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f7fa; }
    .login-card { background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); width: 100%; max-width: 400px; }
    h1 { margin: 0 0 0.25rem; font-size: 1.5rem; }
    .subtitle { color: #666; margin-bottom: 1.5rem; }
    .field { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.4rem; font-weight: 500; font-size: 0.9rem; }
    input { width: 100%; padding: 0.65rem; border: 1px solid #ddd; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box; }
    button { width: 100%; padding: 0.7rem; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    button:hover:not(:disabled) { background: #1d4ed8; }
    .error { color: #dc2626; margin-top: 0.75rem; font-size: 0.85rem; text-align: center; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private supabase: SupabaseService,
    private api: ApiService,
    private router: Router
  ) {}

  async login() {
    this.loading = true;
    this.error = '';
    try {
      const { error } = await this.supabase.signIn(this.email, this.password);
      if (error) throw error;
      await this.api.syncAdmin();
      this.router.navigate(['/admin/dashboard']);
    } catch (err: any) {
      this.error = err.message || 'Login failed';
    } finally {
      this.loading = false;
    }
  }
}
