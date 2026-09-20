import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, LanguageOption } from '../../../core/services/translation.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left" #dropdownRef>
      <!-- Dropdown Toggle Button -->
      <button
        type="button"
        (click)="toggleOpen()"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        aria-haspopup="true"
        [attr.aria-expanded]="isOpen()"
      >
        <span class="text-sm">🌐</span>
        <span>{{ currentOption.nativeName }}</span>
        <svg
          class="w-3.5 h-3.5 text-gray-400 transition-transform duration-200"
          [class.rotate-180]="isOpen()"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown Menu -->
      @if (isOpen()) {
        <div
          class="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl ring-1 ring-black/5 border border-gray-100 py-2 z-50 animate-fade-in divide-y divide-gray-100 max-h-96 overflow-y-auto"
        >
          <div class="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Choose Language / भाषा चुनें
          </div>

          <div class="py-1">
            @for (lang of translationService.languages; track lang.code) {
              <button
                type="button"
                (click)="selectLanguage(lang.code)"
                class="w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition hover:bg-indigo-50/80"
                [ngClass]="{
                  'bg-indigo-50 font-bold text-indigo-900': translationService.currentLanguage() === lang.code,
                  'text-gray-700': translationService.currentLanguage() !== lang.code
                }"
              >
                <div class="flex items-center gap-2">
                  <span class="text-sm">{{ lang.flag }}</span>
                  <div class="flex flex-col">
                    <span class="font-medium text-xs">{{ lang.nativeName }}</span>
                    <span class="text-[10px] text-gray-400">{{ lang.name }}</span>
                  </div>
                </div>

                @if (translationService.currentLanguage() === lang.code) {
                  <span class="text-indigo-600 font-bold text-xs">✓</span>
                }
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class LanguageSelectorComponent {
  translationService = inject(TranslationService);
  private elementRef = inject(ElementRef);

  isOpen = signal<boolean>(false);

  get currentOption(): LanguageOption {
    return this.translationService.getCurrentLanguageOption();
  }

  toggleOpen() {
    this.isOpen.update((v) => !v);
  }

  selectLanguage(code: string) {
    this.translationService.setLanguage(code);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
