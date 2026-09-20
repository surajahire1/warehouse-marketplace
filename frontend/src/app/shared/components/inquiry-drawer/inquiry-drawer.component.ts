import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InquiryService } from '../../../core/services/inquiry.service';
import { AuthService } from '../../../core/services/auth.service';
import { Inquiry, InquiryMessage } from '../../../core/models/inquiry.model';

@Component({
  selector: 'app-inquiry-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    @if (isOpen) {
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black/50 backdrop-blur-xs z-[2000] transition-opacity duration-300"
        (click)="onClose()"
      ></div>

      <!-- Slide-over Drawer Panel -->
      <div 
        class="fixed inset-y-0 right-0 max-w-full flex pl-10 z-[2001] animate-slide-in"
      >
        <div class="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-gray-200">
          
          <!-- Drawer Header -->
          <div class="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-xs">
                🏢
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <h3 class="text-sm font-bold text-gray-900 leading-tight">Inquire with Host</h3>
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Host responds quickly"></span>
                </div>
                <p class="text-xs text-gray-500 line-clamp-1 mt-0.5">
                  {{ warehouseTitle || 'Facility Manager' }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button 
                type="button" 
                (click)="loadInquiry(true)" 
                [disabled]="refreshing()"
                title="Refresh conversation"
                class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200/60 transition"
              >
                <span [class.animate-spin]="refreshing()">🔄</span>
              </button>
              <button 
                type="button" 
                (click)="onClose()" 
                class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200/60 transition text-lg leading-none"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Host Profile Ribbon -->
          <div class="px-5 py-2.5 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-950">
            <div class="flex items-center gap-2">
              <span class="font-bold">👤 Host: {{ managerName || 'Verified Facility Manager' }}</span>
              <span class="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded text-[10px]">
                ✓ Verified
              </span>
            </div>
            <span class="text-[11px] text-indigo-700 font-medium">Direct Chat</span>
          </div>

          <!-- Unauthenticated Alert -->
          @if (!authService.isAuthenticated()) {
            <div class="p-4 m-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-3">
              <div class="flex items-start gap-2">
                <span class="text-lg">🔒</span>
                <div>
                  <h4 class="font-bold text-amber-950">Sign in to message the host</h4>
                  <p class="text-amber-800 text-[11px] mt-0.5">
                    Your conversation will be securely saved to your account so you can receive the host's direct operational replies.
                  </p>
                </div>
              </div>
              <a 
                routerLink="/auth/login" 
                class="block w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-center rounded-lg transition shadow-xs text-xs"
              >
                Sign In to Chat
              </a>
            </div>
          }

          <!-- Quick Operational Logistics Questions Chips -->
          <div class="px-5 py-3 border-b border-gray-100 bg-white">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Common Operational Questions:
            </span>
            <div class="flex flex-wrap gap-1.5">
              @for (chip of quickChips; track chip.text) {
                <button 
                  type="button" 
                  (click)="selectChip(chip.text)"
                  class="px-2.5 py-1 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-gray-200 rounded-full text-[11px] text-gray-700 font-medium transition text-left flex items-center gap-1"
                >
                  <span>{{ chip.icon }}</span>
                  <span>{{ chip.text }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Chat Conversation Scroll Area -->
          <div 
            #chatContainer 
            class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 text-xs"
          >
            @if (loading()) {
              <div class="py-12 text-center text-gray-400">Loading conversation...</div>
            } @else if (!inquiry() || inquiry()!.messages.length === 0) {
              <!-- Empty state -->
              <div class="py-10 px-4 text-center">
                <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 text-2xl flex items-center justify-center mx-auto mb-3">
                  💬
                </div>
                <h4 class="font-bold text-gray-900 text-sm">Ask about facility operations</h4>
                <p class="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Have questions about 40-ft trailer access, dock clearance, weekend forklift operators, or climate control? Send a direct question to the host below.
                </p>
              </div>
            } @else {
              <!-- Messages Stream -->
              @for (msg of inquiry()!.messages; track msg._id || msg.createdAt) {
                <div 
                  class="flex flex-col"
                  [ngClass]="isMyMessage(msg) ? 'items-end' : 'items-start'"
                >
                  <div class="flex items-center gap-1 text-[10px] text-gray-400 mb-0.5 px-1">
                    <span class="font-bold text-gray-600">{{ msg.senderName }}</span>
                    <span>•</span>
                    <span>{{ msg.createdAt | date:'shortTime' }}</span>
                  </div>

                  <div 
                    class="max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs"
                    [ngClass]="isMyMessage(msg) 
                      ? 'bg-indigo-600 text-white rounded-tr-xs' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-xs'"
                  >
                    <p class="whitespace-pre-line text-xs">{{ msg.text }}</p>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Input Footer -->
          <div class="p-3 border-t border-gray-200 bg-white space-y-2">
            @if (errorMessage()) {
              <div class="text-[11px] text-rose-600 font-medium px-1">
                ⚠️ {{ errorMessage() }}
              </div>
            }
            <div class="flex items-end gap-2">
              <textarea 
                #messageInput
                [(ngModel)]="newMessageText" 
                (keydown.enter)="onKeyDownEnter($event)"
                [disabled]="!authService.isAuthenticated() || sending()"
                rows="2"
                placeholder="Ask about trailer height, docks, forklift availability... (Press Enter to send)"
                class="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
              ></textarea>

              <button 
                type="button" 
                (click)="onSendMessage()" 
                [disabled]="!newMessageText.trim() || !authService.isAuthenticated() || sending()"
                class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1"
              >
                @if (sending()) {
                  <span>⏳</span>
                } @else {
                  <span>Send</span>
                  <span>➔</span>
                }
              </button>
            </div>
            <div class="flex justify-between items-center text-[10px] text-gray-400 px-1">
              <span>Shift+Enter for newline</span>
              <span>🔒 Direct Host Communication</span>
            </div>
          </div>

        </div>
      </div>
    }
  `,
  styles: [
    `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
        }
      }
      .animate-slide-in {
        animation: slideIn 0.25s ease-out forwards;
      }
    `,
  ],
})
export class InquiryDrawerComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;

  @Input() isOpen: boolean = false;
  @Input() warehouseId: string = '';
  @Input() warehouseTitle: string = '';
  @Input() managerName: string = '';
  @Input() managerPhone?: string = '';

  @Output() close = new EventEmitter<void>();

  authService = inject(AuthService);
  private inquiryService = inject(InquiryService);

  inquiry = signal<Inquiry | null>(null);
  loading = signal<boolean>(false);
  refreshing = signal<boolean>(false);
  sending = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  newMessageText: string = '';
  private pollingInterval: any = null;

  quickChips = [
    { icon: '🚚', text: 'Can 40-ft trailers enter at night?' },
    { icon: '👷', text: 'Do you have forklift operators on weekends?' },
    { icon: '❄️', text: 'Is climate / temperature control available?' },
    { icon: '🔍', text: 'Can we schedule an on-site inspection?' },
    { icon: '🔒', text: 'What are the 24/7 security & CCTV protocols?' },
  ];

  ngOnInit() {
    if (this.isOpen && this.warehouseId && this.authService.isAuthenticated()) {
      this.loadInquiry();
      this.startPolling();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      if (this.isOpen) {
        if (this.warehouseId && this.authService.isAuthenticated()) {
          this.loadInquiry();
          this.startPolling();
        }
      } else {
        this.stopPolling();
      }
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  startPolling() {
    this.stopPolling();
    this.pollingInterval = setInterval(() => {
      if (this.isOpen && this.warehouseId && this.authService.isAuthenticated() && !this.sending()) {
        this.loadInquiry(true);
      }
    }, 5000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  loadInquiry(silent: boolean = false) {
    if (!this.warehouseId || !this.authService.isAuthenticated()) return;

    if (!silent) {
      this.loading.set(true);
    } else {
      this.refreshing.set(true);
    }

    this.inquiryService.getWarehouseInquiry(this.warehouseId).subscribe({
      next: (res) => {
        this.inquiry.set(res.data);
        this.loading.set(false);
        this.refreshing.set(false);
        this.scrollToBottom();
      },
      error: (err) => {
        this.loading.set(false);
        this.refreshing.set(false);
      },
    });
  }

  selectChip(chipText: string) {
    this.newMessageText = chipText;
    setTimeout(() => {
      this.messageInput?.nativeElement?.focus();
    }, 50);
  }

  onKeyDownEnter(e: any) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.onSendMessage();
    }
  }

  onSendMessage() {
    const text = this.newMessageText.trim();
    if (!text || !this.inquiry() || this.sending()) return;

    this.sending.set(true);
    this.errorMessage.set(null);

    this.inquiryService.sendMessage(this.inquiry()!._id, text).subscribe({
      next: (res) => {
        this.inquiry.set(res.data);
        this.newMessageText = '';
        this.sending.set(false);
        this.scrollToBottom();
      },
      error: (err) => {
        this.sending.set(false);
        this.errorMessage.set(err.error?.message || 'Could not send message. Please try again.');
      },
    });
  }

  isMyMessage(msg: InquiryMessage): boolean {
    const currentUserId = this.authService.currentUser()?._id;
    return msg.senderId === currentUserId;
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer?.nativeElement) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  onClose() {
    this.stopPolling();
    this.close.emit();
  }
}
