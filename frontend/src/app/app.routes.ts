import { Routes } from '@angular/router';
import { CheckInComponent } from './check-in/pages/check-in/check-in.component';
import { LandingPage } from './landing/landing-page/landing-page';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes),
  },
  { path: 'check-in/:id', component: CheckInComponent },
];
