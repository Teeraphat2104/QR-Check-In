import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-persona-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-full backdrop-blur-md">
      <button
        (click)="togglePersona('admin')"
        [class.bg-indigo-600]="persona === 'admin'"
        [class.text-white]="persona === 'admin'"
        [class.text-slate-400]="persona !== 'admin'"
        class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200">
        Admin
      </button>
      <button
        (click)="togglePersona('student')"
        [class.bg-indigo-600]="persona === 'student'"
        [class.text-white]="persona === 'student'"
        [class.text-slate-400]="persona !== 'student'"
        class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200">
        Student
      </button>
    </div>
  `,
  styles: ``,
})
export class PersonaToggle {
  @Input() persona: 'admin' | 'student' = 'admin';
  @Output() personaChange = new EventEmitter<'admin' | 'student'>();

  togglePersona(p: 'admin' | 'student') {
    this.persona = p;
    this.personaChange.emit(p);
  }
}
