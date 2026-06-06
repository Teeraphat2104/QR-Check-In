import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flow-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-24 bg-slate-950 relative overflow-hidden">
      <div class="container mx-auto px-6 relative z-10">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">The Flow</h2>
          <p class="text-slate-400 max-w-2xl mx-auto">Three simple steps to get your event check-in running in minutes.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <!-- Connector Line (Desktop) -->
          <div class="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-600 via-emerald-400 to-indigo-600 -translate-y-1/2 z-0"></div>

          <!-- Step 1 -->
          <div class="relative z-10 flex flex-col items-center text-center group">
            <div class="w-20 h-20 bg-slate-900 border-2 border-indigo-600 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-600/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2v9a2 2 0 0 1-2 2H5"/></svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">1. Create</h3>
            <p class="text-slate-400 px-4">Create your event and invite attendees in seconds with our intuitive admin dashboard.</p>
          </div>

          <!-- Step 2 -->
          <div class="relative z-10 flex flex-col items-center text-center group">
            <div class="w-20 h-20 bg-slate-900 border-2 border-indigo-600 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-600/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">2. Display</h3>
            <p class="text-slate-400 px-4">Generate a secure QR code and display it at your event entrance or share it digitally.</p>
          </div>

          <!-- Step 3 -->
          <div class="relative z-10 flex flex-col items-center text-center group">
            <div class="w-20 h-20 bg-slate-900 border-2 border-indigo-600 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-600/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">3. Check-In</h3>
            <p class="text-slate-400 px-4">Attendees simply scan the code. No app download required. Instant check-in, real-time data.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: ``,
})
export class FlowSection {}
