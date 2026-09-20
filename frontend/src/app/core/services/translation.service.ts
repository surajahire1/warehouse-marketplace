import { Injectable, signal } from '@angular/core';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳' },
];

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  readonly languages = SUPPORTED_LANGUAGES;
  currentLanguage = signal<string>('en');

  constructor() {
    this.initLanguage();
  }

  private initLanguage() {
    if (typeof window === 'undefined') return;

    // Check localStorage or cookie
    const saved = localStorage.getItem('app_language');
    const cookieMatch = document.cookie.match(/googtrans=\/en\/([a-z]{2})/i);
    const initialLang = saved || (cookieMatch ? cookieMatch[1].toLowerCase() : 'en');

    if (SUPPORTED_LANGUAGES.some((l) => l.code === initialLang)) {
      this.currentLanguage.set(initialLang);
    }
  }

  getCurrentLanguageOption(): LanguageOption {
    return (
      this.languages.find((l) => l.code === this.currentLanguage()) || this.languages[0]
    );
  }

  setLanguage(code: string) {
    if (typeof window === 'undefined') return;

    const previousLang = this.currentLanguage();
    this.currentLanguage.set(code);
    localStorage.setItem('app_language', code);

    // Update googtrans cookies
    if (code === 'en') {
      this.deleteCookie('googtrans');
      // If switching back to English from another language, reload cleans up DOM translation artifacts
      if (previousLang !== 'en') {
        window.location.reload();
        return;
      }
    } else {
      this.setCookie('googtrans', `/en/${code}`);
    }

    // Attempt to trigger Google Translate dropdown without page refresh
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (combo) {
      combo.value = code;
      combo.dispatchEvent(new Event('change'));
    } else {
      // If combo is not yet in DOM, reload to let the googtrans cookie trigger translation
      window.location.reload();
    }
  }

  private setCookie(name: string, value: string) {
    const host = window.location.hostname;
    document.cookie = `${name}=${value}; path=/; max-age=31536000`;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      document.cookie = `${name}=${value}; domain=.${host}; path=/; max-age=31536000`;
    }
  }

  private deleteCookie(name: string) {
    const host = window.location.hostname;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `${name}=; domain=.${host}; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `${name}=; domain=${host}; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}
