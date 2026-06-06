import { Routes } from '@angular/router';
import { AuthGuard } from '../core/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ActivityDetailComponent } from './pages/activity-detail/activity-detail.component';
import { ActivityFormComponent } from './pages/activity-form/activity-form.component';

export const adminRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'activities/new', component: ActivityFormComponent, canActivate: [AuthGuard] },
  { path: 'activities/:id', component: ActivityDetailComponent, canActivate: [AuthGuard] },
  { path: 'activities/:id/edit', component: ActivityFormComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
