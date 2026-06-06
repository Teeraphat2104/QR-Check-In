import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Activity } from '../../../core/api.service';

@Component({
  selector: 'app-activity-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="form-page">
      <div class="form-card">
        <h1>{{ isEdit ? 'Edit Activity' : 'New Activity' }}</h1>
        <form (ngSubmit)="save()">
          <div class="field">
            <label for="title">Title *</label>
            <input id="title" type="text" [(ngModel)]="title" name="title" required />
          </div>
          <div class="field">
            <label for="description">Description</label>
            <textarea id="description" [(ngModel)]="description" name="description" rows="4"></textarea>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="date">Date *</label>
              <input id="date" type="date" [(ngModel)]="date" name="date" required />
            </div>
            <div class="field">
              <label for="location">Location</label>
              <input id="location" type="text" [(ngModel)]="location" name="location" />
            </div>
          </div>
          <div class="field">
            <label for="category">Category</label>
            <input id="category" type="text" [(ngModel)]="category" name="category" placeholder="e.g. Sports, Academic, Cultural" />
          </div>
          <div class="form-actions">
            <button type="button" class="btn-outline" (click)="cancel()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="loading">
              {{ loading ? 'Saving...' : (isEdit ? 'Update' : 'Create') }}
            </button>
          </div>
          @if (error) { <p class="error">{{ error }}</p> }
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-page { display: flex; justify-content: center; padding: 2rem; }
    .form-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); width: 100%; max-width: 600px; }
    h1 { margin: 0 0 1.5rem; font-size: 1.5rem; }
    .field { margin-bottom: 1rem; }
    .field-row { display: flex; gap: 1rem; }
    .field-row .field { flex: 1; }
    label { display: block; margin-bottom: 0.4rem; font-weight: 500; font-size: 0.9rem; }
    input, textarea { width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box; font-family: inherit; }
    textarea { resize: vertical; }
    .form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }
    .btn-primary { padding: 0.6rem 1.25rem; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.6; }
    .btn-outline { padding: 0.6rem 1.25rem; background: transparent; color: #666; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; }
    .error { color: #dc2626; margin-top: 0.75rem; font-size: 0.85rem; }
  `]
})
export class ActivityFormComponent implements OnInit {
  isEdit = false;
  activityId = '';
  title = '';
  description = '';
  date = '';
  location = '';
  category = '';
  loading = false;
  error = '';

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.activityId = id;
      this.loadActivity(id);
    }
  }

  async loadActivity(id: string) {
    try {
      const res = await this.api.getActivity(id);
      const a = res.data;
      this.title = a.title;
      this.description = a.description || '';
      this.date = a.date.substring(0, 10);
      this.location = a.location || '';
      this.category = a.category || '';
    } catch (err: any) {
      this.error = err.message || 'Failed to load activity';
    }
  }

  async save() {
    this.loading = true;
    this.error = '';
    try {
      const data = { title: this.title, description: this.description, date: this.date, location: this.location, category: this.category };
      if (this.isEdit) {
        await this.api.updateActivity(this.activityId, data);
      } else {
        await this.api.createActivity(data);
      }
      this.router.navigate(['/admin/dashboard']);
    } catch (err: any) {
      this.error = err.message || 'Failed to save activity';
    } finally {
      this.loading = false;
    }
  }

  cancel() {
    this.router.navigate(['/admin/dashboard']);
  }
}
