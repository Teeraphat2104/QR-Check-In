import { Routes } from '@angular/router';
import { CheckInComponent } from './check-in/pages/check-in/check-in.component';
import { LandingPage } from './landing/landing-page/landing-page';
import { StudentLoginComponent } from './student/login/student-login.component';
import { StudentRegisterComponent } from './student/register/student-register.component';
import { StudentDashboardComponent } from './student/dashboard/student-dashboard.component';
import { StudentAuthGuard } from './core/student-auth.guard';

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
  { path: 'student/login', component: StudentLoginComponent },
  { path: 'student/register', component: StudentRegisterComponent },
  { path: 'student/dashboard', component: StudentDashboardComponent, canActivate: [StudentAuthGuard] },
  { path: 'student', redirectTo: 'student/dashboard', pathMatch: 'full' },
];
