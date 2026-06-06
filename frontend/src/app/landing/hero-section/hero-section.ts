import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScanSimulation } from '../scan-simulation/scan-simulation';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, ScanSimulation],
  template: `
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 text-white pt-20">
      <!-- Background Decorative Elements -->
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl opacity-50 animate-pulse" style="animation-delay: 2s"></div>

      <div class="container mx-auto px-6 relative z-10 text-center">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            {{ persona === 'admin' ? 'Revolutionize Your Event Check-In' : 'Check-In To Your Event' }}
            <span class="text-indigo-600">{{ persona === 'admin' ? ' Effortlessly' : ' In Seconds' }}</span>
          </h1>
          <p class="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto">
            {{ persona === 'admin' ? 'A seamless, zero-install QR check-in system for admins and attendees. Track real-time attendance with zero friction.' : 'No apps to download. No accounts to create. Just scan the event QR and you\'re in.' }}
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button class="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-indigo-600/30">
              {{ persona === 'admin' ? 'Start Your Event' : 'Find My Event' }}
            </button>
            <button class="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold rounded-full transition-all border border-white/20">
              Watch Demo
            </button>
          </div>

          <!-- Mockup with Scan Simulation -->
          <div class="relative group max-w-md mx-auto">
            <div class="absolute -inset-4 bg-gradient-to-r from-indigo-600 to-emerald-400 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div class="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl transition-all duration-500 transform perspective-1000 rotate-x-12 rotate-y-[-5deg] group-hover:rotate-x-0 group-hover:rotate-y-0 flex items-center justify-center">
               <app-scan-simulation></app-scan-simulation>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .perspective-1000 {
      perspective: 1000px;
    }
    .rotate-x-12 {
      transform: rotateX(12deg);
    }
    .rotate-y-[-5deg] {
      transform: rotateY(-5deg);
    }
  `,
})
export class HeroSection {
  @Input() persona: 'admin' | 'student' = 'admin';
}
