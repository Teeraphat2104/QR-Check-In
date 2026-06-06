import { Routes } from '@angular/router';
import { CheckInComponent } from './check-in/pages/check-in/check-in.component';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes),
  },
  { path: 'check-in/:id', component: CheckInComponent },
  { path: '', redirectTo: '/admin/dashboard', pathMatch: 'full' },
];
