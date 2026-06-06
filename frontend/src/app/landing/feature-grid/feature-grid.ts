import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feature-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-24 bg-slate-950 relative">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">Powerful Features</h2>
          <p class="text-slate-400 max-w-2xl mx-auto">Everything you need to manage your event attendance with zero friction.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Real-time Tracking - Large Card -->
          <div class="md:col-span-2 p-8 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-sm hover:border-indigo-600/50 transition-all group">
            <div class="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">Real-time Tracking</h3>
            <p class="text-slate-400 mb-6">Watch your attendance grow in real-time. Get instant notifications as guests check in, with detailed timestamps and persona data.</p>
            <div class="h-40 bg-slate-800/50 rounded-xl border border-slate-700 p-4 flex flex-col gap-3">
              <div class="h-3 w-3/4 bg-slate-700 rounded animate-pulse"></div>
              <div class="h-3 w-1/2 bg-slate-700 rounded animate-pulse" style="animation-delay: 0.2s"></div>
              <div class="h-3 w-2/3 bg-slate-700 rounded animate-pulse" style="animation-delay: 0.4s"></div>
            </div>
          </div>

          <!-- Zero Install - Small Card -->
          <div class="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-sm hover:border-emerald-400/50 transition-all group">
            <div class="w-12 h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">Zero Install</h3>
            <p class="text-slate-400">No apps, no accounts, no friction. Just scan and enter.</p>
          </div>

          <!-- Secure QR - Small Card -->
          <div class="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-sm hover:border-indigo-600/50 transition-all group">
            <div class="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">Secure QR</h3>
            <p class="text-slate-400">Dynamic QR generation ensures that check-ins are secure and verified.</p>
          </div>

          <!-- Instant Exports - Medium Card -->
          <div class="md:col-span-2 p-8 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-sm hover:border-emerald-400/50 transition-all group">
            <div class="w-12 h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">Instant Exports</h3>
            <p class="text-slate-400">Download your attendance data in one click. Compatible with CSV, JSON, and PDF formats for easy reporting.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: ``,
})
export class FeatureGrid {}
