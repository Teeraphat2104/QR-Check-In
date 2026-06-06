import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSection } from '../hero-section/hero-section';
import { FlowSection } from '../flow-section/flow-section';
import { FeatureGrid } from '../feature-grid/feature-grid';
import { PersonaToggle } from '../persona-toggle/persona-toggle';
import { CtaSection } from '../cta-section/cta-section';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, HeroSection, FlowSection, FeatureGrid, PersonaToggle, CtaSection],
  template: `
    <div class="bg-slate-950 min-h-screen">
      <!-- Floating Persona Toggle -->
      <div class="fixed top-6 right-6 z-50">
        <app-persona-toggle
          [persona]="currentPersona"
          (personaChange)="onPersonaChange($event)">
        </app-persona-toggle>
      </div>

      <app-hero-section [persona]="currentPersona"></app-hero-section>
      <app-flow-section></app-flow-section>
      <app-feature-grid></app-feature-grid>
      <app-cta-section></app-cta-section>
    </div>
  `,
  styles: ``,
})
export class LandingPage {
  currentPersona: 'admin' | 'student' = 'admin';

  onPersonaChange(persona: 'admin' | 'student') {
    this.currentPersona = persona;
  }
}
