import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <app-navbar />
      <main class="flex-1">
        <router-outlet />
      </main>
      <footer class="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        &copy; 2026 WareSpace Marketplace Inc. All rights reserved.
      </footer>
    </div>
  `,
})
export class AppComponent {}
