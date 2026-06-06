import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scan-simulation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-64 h-64 bg-white rounded-3xl p-4 shadow-2xl overflow-hidden border-4 border-slate-800">
      <!-- QR Code Placeholder -->
      <div class="absolute inset-0 flex items-center justify-center p-8 opacity-20">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" class="text-slate-900">
          <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zM13 3h8v8h-8V3zm0 10h8v8h-8v-8z"/>
        </svg>
      </div>

      <!-- Scan Line -->
      <div *ngIf="status === 'scanning'" class="absolute top-0 left-0 w-full h-1 bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.8)] animate-scan"></div>

      <!-- Status Overlay -->
      <div class="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-all duration-500" [class.opacity-0]="status === 'scanning'">
        <div class="text-center animate-bounce-in">
          <div class="w-16 h-16 bg-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-400/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span class="text-white font-bold text-lg">Verified!</span>
        </div>
      </div>

      <!-- Bottom Label -->
      <div class="absolute bottom-4 left-0 w-full text-center">
        <span class="px-3 py-1 bg-slate-900 text-white text-xs font-mono rounded-full" [innerText]="status === 'scanning' ? 'SCANNING...' : 'SUCCESS'"></span>
      </div>
    </div>
  `,
  styles: `
    @keyframes scan {
      0% { top: 0; }
      50% { top: 100%; }
      100% { top: 0; }
    }
    .animate-scan {
      animation: scan 3s linear infinite;
    }
    @keyframes bounce-in {
      0% { transform: scale(0.5); opacity: 0; }
      70% { transform: scale(1.1); }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-bounce-in {
      animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
  `,
})
export class ScanSimulation implements OnInit {
  status: 'scanning' | 'verified' = 'scanning';

  ngOnInit() {
    setTimeout(() => {
      this.status = 'verified';
    }, 3000);
  }
}
