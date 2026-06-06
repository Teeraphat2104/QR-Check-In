import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cta-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-24 bg-slate-950 relative overflow-hidden">
      <div class="container mx-auto px-6 relative z-10">
        <div class="relative max-w-5xl mx-auto p-12 md:p-20 bg-indigo-600/10 border border-indigo-600/30 rounded-3xl backdrop-blur-xl text-center overflow-hidden group">
          <!-- Decorative Background Gradient -->
          <div class="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl group-hover:bg-indigo-600/30 transition-all duration-500"></div>
          <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl group-hover:bg-emerald-400/30 transition-all duration-500"></div>

          <h2 class="text-4xl md:text-6xl font-extrabold text-white mb-6 relative z-10">
            Ready to elevate your <br class="hidden md:block"> event experience?
          </h2>
          <p class="text-xl text-slate-400 mb-10 max-w-2xl mx-auto relative z-10">
            Join hundreds of event organizers who have eliminated check-in queues and improved their attendee experience.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <button class="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-indigo-600/30">
              Get Started for Free
            </button>
            <button class="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold rounded-full transition-all border border-white/20">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: ``,
})
export class CtaSection {}
