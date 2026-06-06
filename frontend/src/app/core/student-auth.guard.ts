import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { StudentService } from './student.service';

@Injectable({ providedIn: 'root' })
export class StudentAuthGuard implements CanActivate {
  constructor(
    private studentService: StudentService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    const token = this.studentService.getToken();
    if (token) {
      return true;
    }
    return this.router.parseUrl('/student/login');
  }
}
