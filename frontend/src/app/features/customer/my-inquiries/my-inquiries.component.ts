import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InquiryService } from '../../../core/services/inquiry.service';
import { Inquiry, InquiryMessage } from '../../../core/models/inquiry.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-my-inquiries',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Top Title & Operational Stats Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-gray-900">My Inquiries & Host Discussions</h1>
            @if (totalUnreadCount() > 0) {
              <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white animate-pulse">
                {{ totalUnreadCount() }} New
              </span>
            }
          </div>
          <p class="text-sm text-gray-500 mt-1">
            Direct operational Q&A with facility managers before booking. Ask about 40-ft trailers, cold chain, and gate hours.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <a
            routerLink="/warehouses"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-xs inline-flex items-center gap-1.5"
          >
            <span>+ Inquire on More Facilities</span>
          </a>
        </div>
      </div>

      <!-- Main Content Area -->
      @if (loading()) {
        <div class="py-24 text-center text-gray-500">Loading your conversations...</div>
      } @else if (inquiries().length === 0) {
        <!-- Zero State -->
        <div class="py-20 text-center bg-white rounded-2xl border border-gray-200 p-8 shadow-xs max-w-xl mx-auto">
          <div class="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 text-3xl flex items-center justify-center mx-auto mb-4">
            💬
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-1">No Inquiries Yet</h3>
          <p class="text-xs text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
            Have questions about dock turnaround speed, night-time trailer access, or forklift availability?
            Click <strong>"Inquire with Host"</strong> on any warehouse page to chat directly with the facility manager.
          </p>
          <a
            routerLink="/warehouses"
            class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm inline-block"
          >
            Explore Available Warehouses
          </a>
        </div>
      } @else {
        <!-- Split Pane Layout -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
          
          <!-- LEFT PANE: Conversations List (4 or 5 columns on desktop) -->
          <div 
            class="lg:col-span-4 border-r border-gray-200 flex flex-col h-full bg-gray-50/40"
            [ngClass]="selectedInquiry() ? 'hidden lg:flex' : 'flex'"
          >
            <!-- Search & Filter Header -->
            <div class="p-4 border-b border-gray-200 bg-white space-y-3">
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  placeholder="Search by facility or host..."
                  class="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span class="absolute left-2.5 top-2.5 text-gray-400 text-xs">🔍</span>
              </div>

              <!-- Filter Pills -->
              <div class="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  (click)="unreadFilterOnly = false"
                  class="px-3 py-1 rounded-full text-xs font-medium transition"
                  [ngClass]="!unreadFilterOnly ? 'bg-indigo-600 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                >
                  All ({{ inquiries().length }})
                </button>
                <button
                  type="button"
                  (click)="unreadFilterOnly = true"
                  class="px-3 py-1 rounded-full text-xs font-medium transition flex items-center gap-1"
                  [ngClass]="unreadFilterOnly ? 'bg-indigo-600 text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                >
                  <span>Unread</span>
                  @if (totalUnreadCount() > 0) {
                    <span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                  }
                </button>
              </div>
            </div>

            <!-- Thread Items Scroll List -->
            <div class="overflow-y-auto flex-1 divide-y divide-gray-100 max-h-[600px]">
              @for (inq of filteredInquiries(); track inq._id) {
                <div
                  (click)="selectInquiry(inq)"
                  class="p-4 transition cursor-pointer flex items-start gap-3 relative hover:bg-gray-100/70"
                  [ngClass]="selectedInquiry()?._id === inq._id ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'bg-white'"
                >
                  <!-- Facility Thumbnail -->
                  <div class="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200 relative">
                    @if (getWarehouseImages(inq.warehouseId).length > 0) {
                      <img [src]="getWarehouseImages(inq.warehouseId)[0]" class="w-full h-full object-cover" />
                    } @else {
                      <div class="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">WH</div>
                    }
                  </div>

                  <!-- Details -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-1 mb-0.5">
                      <h4 class="text-xs font-bold text-gray-900 truncate">
                        {{ getWarehouseTitle(inq.warehouseId) }}
                      </h4>
                      <span class="text-[10px] text-gray-400 whitespace-nowrap">
                        {{ inq.lastMessageAt | date:'shortTime' }}
                      </span>
                    </div>

                    <p class="text-[11px] text-indigo-700 font-medium truncate flex items-center gap-1">
                      <span>👤</span>
                      <span>{{ getManagerName(inq.managerId) }}</span>
                    </p>

                    <p class="text-xs text-gray-500 truncate mt-1">
                      {{ inq.lastMessage || 'No messages yet in this discussion.' }}
                    </p>
                  </div>

                  <!-- Unread Badge -->
                  @if (inq.unreadCustomerCount > 0) {
                    <span class="absolute top-4 right-3 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white shadow-xs animate-bounce">
                      {{ inq.unreadCustomerCount }}
                    </span>
                  }
                </div>
              }
              @if (filteredInquiries().length === 0) {
                <div class="p-8 text-center text-xs text-gray-400">
                  No discussions found matching criteria.
                </div>
              }
            </div>
          </div>

          <!-- RIGHT PANE: Active Chat & Facility Context Bar (8 columns on desktop) -->
          <div 
            class="lg:col-span-8 flex flex-col h-full bg-white"
            [ngClass]="selectedInquiry() ? 'flex' : 'hidden lg:flex'"
          >
            @if (selectedInquiry()) {
              <!-- Facility & Host Info Bar (Top of Chat) -->
              <div class="p-4 border-b border-gray-200 bg-gray-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <!-- Back button for mobile -->
                  <button
                    type="button"
                    (click)="selectedInquiry.set(null)"
                    class="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 bg-white rounded-lg border border-gray-200 text-xs font-bold"
                  >
                    ← Back
                  </button>

                  <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {{ getManagerInitials(selectedInquiry()!.managerId) }}
                  </div>

                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-sm font-bold text-gray-900">
                        {{ getManagerName(selectedInquiry()!.managerId) }}
                      </h3>
                      <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                        ✓ Facility Host
                      </span>
                    </div>
                    <p class="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <span>🏢</span>
                      <a 
                        [routerLink]="['/warehouses', getWarehouseId(selectedInquiry()!.warehouseId)]"
                        class="hover:underline text-indigo-600 font-semibold truncate max-w-xs"
                      >
                        {{ getWarehouseTitle(selectedInquiry()!.warehouseId) }}
                      </a>
                      <span class="text-gray-300">•</span>
                      <span>{{ getWarehouseCity(selectedInquiry()!.warehouseId) }}</span>
                    </p>
                  </div>
                </div>

                <!-- Book Facility CTA Button -->
                <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <a
                    [routerLink]="['/warehouses', getWarehouseId(selectedInquiry()!.warehouseId)]"
                    class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-xs inline-flex items-center gap-1 whitespace-nowrap"
                  >
                    <span>Reserve Space ➔</span>
                  </a>
                </div>
              </div>

              <!-- Message Stream -->
              <div #messagesContainer class="flex-1 overflow-y-auto p-5 space-y-3.5 min-h-[380px] max-h-[460px] bg-gray-50/20">
                @if (selectedInquiry()!.messages.length === 0) {
                  <div class="py-12 text-center text-xs text-gray-400">
                    No messages yet in this discussion. Send an operational question below!
                  </div>
                }

                @for (msg of selectedInquiry()!.messages; track msg._id || msg.createdAt) {
                  @if (msg.senderRole === 'CUSTOMER') {
                    <!-- Customer Message (Right) -->
                    <div class="flex justify-end">
                      <div class="max-w-[78%] bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-xs shadow-xs text-xs">
                        <p class="whitespace-pre-line leading-relaxed">{{ msg.text }}</p>
                        <div class="text-[10px] text-indigo-200 mt-1 text-right flex items-center justify-end gap-1">
                          <span>{{ msg.createdAt | date:'shortTime' }}</span>
                          <span>✓</span>
                        </div>
                      </div>
                    </div>
                  } @else {
                    <!-- Host Message (Left) -->
                    <div class="flex items-start gap-2.5 max-w-[82%]">
                      <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-1">
                        {{ getManagerInitials(selectedInquiry()!.managerId) }}
                      </div>
                      <div class="bg-white border border-gray-200 text-gray-900 p-3.5 rounded-2xl rounded-tl-xs shadow-2xs text-xs">
                        <div class="flex items-center justify-between gap-3 mb-1">
                          <span class="font-bold text-gray-900">{{ msg.senderName || 'Facility Host' }}</span>
                          <span class="text-[10px] text-gray-400">{{ msg.createdAt | date:'shortTime' }}</span>
                        </div>
                        <p class="whitespace-pre-line leading-relaxed text-gray-700">{{ msg.text }}</p>
                      </div>
                    </div>
                  }
                }
              </div>

              <!-- Operational Suggested Prompts -->
              <div class="px-4 py-2 bg-gray-50/80 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span class="text-gray-400 font-semibold whitespace-nowrap uppercase text-[10px]">Quick Ask:</span>
                <button
                  type="button"
                  (click)="appendPrompt('Can 40-ft trailers enter and unload at night?')"
                  class="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 whitespace-nowrap transition"
                >
                  🚚 40-ft Trailer Night Access?
                </button>
                <button
                  type="button"
                  (click)="appendPrompt('Are forklift operators available on weekends?')"
                  class="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 whitespace-nowrap transition"
                >
                  👷 Weekend Forklift Crew?
                </button>
                <button
                  type="button"
                  (click)="appendPrompt('Can we schedule an on-site facility inspection tomorrow?')"
                  class="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 whitespace-nowrap transition"
                >
                  🔍 On-site Visit Tomorrow?
                </button>
              </div>

              <!-- Message Input Composer -->
              <div class="p-4 border-t border-gray-200 bg-white">
                <form (ngSubmit)="sendReply()" class="flex items-end gap-3">
                  <textarea
                    [(ngModel)]="replyText"
                    name="replyText"
                    rows="2"
                    (keydown.enter)="onEnterPress($event)"
                    placeholder="Ask the warehouse manager an operational question... (Press Enter to send)"
                    class="flex-1 p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                  ></textarea>

                  <button
                    type="submit"
                    [disabled]="!replyText.trim() || sending()"
                    class="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    @if (sending()) {
                      <span>⏳</span>
                    } @else {
                      <span>Send ➔</span>
                    }
                  </button>
                </form>
              </div>
            } @else {
              <!-- Empty Right Pane (Desktop only) -->
              <div class="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400">
                <div class="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 text-2xl flex items-center justify-center mb-3">
                  📬
                </div>
                <h4 class="text-sm font-bold text-gray-700">Select a conversation</h4>
                <p class="text-xs text-gray-400 mt-1 max-w-xs">
                  Choose a facility discussion from the left to view questions and replies with warehouse hosts.
                </p>
              </div>
            }
          </div>

        </div>
      }

    </div>
  `,
})
export class MyInquiriesComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

  private inquiryService = inject(InquiryService);
  authService = inject(AuthService);

  inquiries = signal<Inquiry[]>([]);
  selectedInquiry = signal<Inquiry | null>(null);
  loading = signal<boolean>(true);
  sending = signal<boolean>(false);

  searchQuery: string = '';
  unreadFilterOnly: boolean = false;
  replyText: string = '';
  private pollTimer: any = null;

  totalUnreadCount = computed(() => {
    return this.inquiries().reduce((acc, inq) => acc + (inq.unreadCustomerCount || 0), 0);
  });

  filteredInquiries = computed(() => {
    let list = this.inquiries();
    if (this.unreadFilterOnly) {
      list = list.filter((i) => i.unreadCustomerCount > 0);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter((i) => {
        const title = this.getWarehouseTitle(i.warehouseId).toLowerCase();
        const host = this.getManagerName(i.managerId).toLowerCase();
        return title.includes(q) || host.includes(q);
      });
    }
    return list;
  });

  ngOnInit() {
    this.fetchInquiries();
    this.startPolling();
  }

  ngOnDestroy() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
  }

  fetchInquiries(silent: boolean = false) {
    if (!silent) this.loading.set(true);
    this.inquiryService.getMyInquiries().subscribe({
      next: (res) => {
        const data = res.data || [];
        this.inquiries.set(data);
        if (!silent) this.loading.set(false);

        // Keep selected inquiry in sync
        const currentSelected = this.selectedInquiry();
        if (currentSelected) {
          const updated = data.find((i) => i._id === currentSelected._id);
          if (updated) {
            this.selectedInquiry.set(updated);
          }
        }
      },
      error: () => {
        if (!silent) this.loading.set(false);
      },
    });
  }

  startPolling() {
    this.pollTimer = setInterval(() => {
      this.fetchInquiries(true);
    }, 5000);
  }

  selectInquiry(inquiry: Inquiry) {
    this.selectedInquiry.set(inquiry);

    // If there are unread messages, mark as read
    if (inquiry.unreadCustomerCount > 0) {
      this.inquiryService.markAsRead(inquiry._id).subscribe({
        next: () => {
          inquiry.unreadCustomerCount = 0;
          this.inquiryService.unreadCustomerCount.set(this.totalUnreadCount());
        },
      });
    }

    setTimeout(() => this.scrollToBottom(), 100);
  }

  appendPrompt(text: string) {
    this.replyText = text;
  }

  onEnterPress(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      event.preventDefault();
      this.sendReply();
    }
  }

  sendReply() {
    const active = this.selectedInquiry();
    const text = this.replyText.trim();
    if (!active || !text || this.sending()) return;

    this.sending.set(true);
    this.inquiryService.sendMessage(active._id, text).subscribe({
      next: (res) => {
        this.replyText = '';
        this.sending.set(false);
        if (res.data) {
          this.selectedInquiry.set(res.data);
          // Update in local list
          const list = this.inquiries().map((i) => (i._id === res.data._id ? res.data : i));
          this.inquiries.set(list);
        }
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: () => {
        this.sending.set(false);
      },
    });
  }

  private scrollToBottom() {
    if (this.messagesContainer?.nativeElement) {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  getWarehouseTitle(warehouse: any): string {
    if (warehouse && typeof warehouse === 'object' && warehouse.title) {
      return warehouse.title;
    }
    return 'Warehouse Space';
  }

  getWarehouseId(warehouse: any): string {
    if (warehouse && typeof warehouse === 'object' && warehouse._id) {
      return warehouse._id;
    }
    return warehouse || '';
  }

  getWarehouseCity(warehouse: any): string {
    if (warehouse && typeof warehouse === 'object' && warehouse.address?.city) {
      return `${warehouse.address.city}, ${warehouse.address.state || ''}`;
    }
    return '';
  }

  getWarehouseImages(warehouse: any): string[] {
    if (warehouse && typeof warehouse === 'object' && Array.isArray(warehouse.images)) {
      return warehouse.images;
    }
    return [];
  }

  getManagerName(manager: any): string {
    if (manager && typeof manager === 'object' && manager.name) {
      return manager.name;
    }
    return 'Facility Host';
  }

  getManagerInitials(manager: any): string {
    const name = this.getManagerName(manager);
    return name ? name.substring(0, 2).toUpperCase() : 'WH';
  }
}
