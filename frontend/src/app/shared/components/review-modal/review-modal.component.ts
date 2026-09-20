import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../core/services/review.service';
import { CreateReviewPayload, Review } from '../../../core/models/review.model';

@Component({
  selector: 'app-review-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div 
        class="fixed inset-0 bg-black/50 backdrop-blur-xs z-[3000] flex items-center justify-center p-4 overflow-y-auto"
        (click)="onClose()"
      >
        <div 
          class="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-200 my-8 animate-fade-in"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 text-xl flex items-center justify-center">
                ⭐
              </div>
              <div>
                <h3 class="text-base font-bold text-gray-900">Verified Commercial Review</h3>
                <p class="text-xs text-gray-500 line-clamp-1 mt-0.5">
                  Facility: <strong>{{ warehouseTitle || 'Warehouse Facility' }}</strong>
                </p>
              </div>
            </div>
            <button 
              type="button" 
              (click)="onClose()"
              class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200/60 transition text-lg leading-none"
            >
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            <!-- Overall Star Rating -->
            <div class="text-center bg-amber-50/60 border border-amber-200 p-4 rounded-xl">
              <label class="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
                Overall Facility Rating *
              </label>
              <div class="flex items-center justify-center gap-2">
                @for (star of [1, 2, 3, 4, 5]; track star) {
                  <button
                    type="button"
                    (click)="overallRating = star"
                    (mouseenter)="hoveredRating = star"
                    (mouseleave)="hoveredRating = 0"
                    class="text-3xl transition-transform hover:scale-110 focus:outline-none"
                    [ngClass]="(hoveredRating || overallRating) >= star ? 'text-amber-400' : 'text-gray-300'"
                  >
                    ★
                  </button>
                }
              </div>
              <span class="text-xs font-bold text-amber-950 mt-1 block">
                {{ getRatingLabel(hoveredRating || overallRating) }}
              </span>
            </div>

            <!-- Operational Category Ratings Grid -->
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Operational Breakdown (1 to 5 Stars)
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <!-- Dock Speed -->
                <div class="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <span class="text-xs font-semibold text-gray-800 block">⚡ Dock Speed</span>
                    <span class="text-[10px] text-gray-400">Loading & Turnaround</span>
                  </div>
                  <div class="flex items-center gap-1">
                    @for (s of [1, 2, 3, 4, 5]; track s) {
                      <button 
                        type="button" 
                        (click)="dockSpeedRating = s" 
                        class="text-base"
                        [ngClass]="dockSpeedRating >= s ? 'text-amber-400' : 'text-gray-300'"
                      >
                        ★
                      </button>
                    }
                  </div>
                </div>

                <!-- Security & CCTV -->
                <div class="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <span class="text-xs font-semibold text-gray-800 block">🛡️ Security & CCTV</span>
                    <span class="text-[10px] text-gray-400">24/7 Gate & Safety</span>
                  </div>
                  <div class="flex items-center gap-1">
                    @for (s of [1, 2, 3, 4, 5]; track s) {
                      <button 
                        type="button" 
                        (click)="securityRating = s" 
                        class="text-base"
                        [ngClass]="securityRating >= s ? 'text-amber-400' : 'text-gray-300'"
                      >
                        ★
                      </button>
                    }
                  </div>
                </div>

                <!-- Floor & Cleanliness -->
                <div class="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <span class="text-xs font-semibold text-gray-800 block">🧹 Cleanliness & Floor</span>
                    <span class="text-[10px] text-gray-400">Pest control & flooring</span>
                  </div>
                  <div class="flex items-center gap-1">
                    @for (s of [1, 2, 3, 4, 5]; track s) {
                      <button 
                        type="button" 
                        (click)="cleanlinessRating = s" 
                        class="text-base"
                        [ngClass]="cleanlinessRating >= s ? 'text-amber-400' : 'text-gray-300'"
                      >
                        ★
                      </button>
                    }
                  </div>
                </div>

                <!-- Host Responsiveness -->
                <div class="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <span class="text-xs font-semibold text-gray-800 block">🤝 Host Service</span>
                    <span class="text-[10px] text-gray-400">Communication & Ease</span>
                  </div>
                  <div class="flex items-center gap-1">
                    @for (s of [1, 2, 3, 4, 5]; track s) {
                      <button 
                        type="button" 
                        (click)="hostResponsivenessRating = s" 
                        class="text-base"
                        [ngClass]="hostResponsivenessRating >= s ? 'text-amber-400' : 'text-gray-300'"
                      >
                        ★
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Storage Use Type -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1.5">
                Storage Type Utilized
              </label>
              <select 
                [(ngModel)]="facilityTypeUsed"
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="High-Bay Pallet Racking">High-Bay Selective Pallet Racking</option>
                <option value="Bulk Floor Storage">Bulk Floor Staging / Container Unloading</option>
                <option value="Multi-Temp Cold Logistics">Multi-Temperature / Cold Chain</option>
                <option value="E-Commerce Fulfillment">E-Commerce 3PL Fulfillment</option>
                <option value="Industrial Engineering Spares">Industrial Engineering & Heavy Spares</option>
                <option value="General Commercial Storage">General Commercial Storage</option>
              </select>
            </div>

            <!-- Feedback Comment -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1.5">
                Detailed Commercial Review *
              </label>
              <textarea 
                [(ngModel)]="comment"
                rows="4"
                placeholder="Share your experience regarding 40ft trailer turnaround, dock levelers, clear height accuracy, forklift availability, and security gate check-in..."
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              ></textarea>
              <span class="text-[10px] text-gray-400 block mt-1">
                Your review will be marked with a <strong>✓ Verified Booking</strong> badge.
              </span>
            </div>

            @if (errorMessage()) {
              <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-1.5">
                <span>⚠️</span>
                <span>{{ errorMessage() }}</span>
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button 
              type="button" 
              (click)="onClose()"
              class="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button 
              type="button" 
              (click)="onSubmitReview()"
              [disabled]="submitting() || !comment.trim()"
              class="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
            >
              @if (submitting()) {
                <span>⏳ Submitting...</span>
              } @else {
                <span>★ Post Verified Review</span>
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ReviewModalComponent {
  @Input() isOpen: boolean = false;
  @Input() bookingId: string = '';
  @Input() warehouseTitle: string = '';
  @Input() warehouseId: string = '';

  @Output() close = new EventEmitter<void>();
  @Output() reviewSubmitted = new EventEmitter<Review>();

  private reviewService = inject(ReviewService);

  overallRating: number = 5;
  hoveredRating: number = 0;
  dockSpeedRating: number = 5;
  securityRating: number = 5;
  cleanlinessRating: number = 5;
  hostResponsivenessRating: number = 5;
  facilityTypeUsed: string = 'High-Bay Pallet Racking';
  comment: string = '';

  submitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  getRatingLabel(stars: number): string {
    switch (stars) {
      case 5:
        return '⭐⭐⭐⭐⭐ Excellent (Highly Recommended)';
      case 4:
        return '⭐⭐⭐⭐ Very Good (Smooth Operations)';
      case 3:
        return '⭐⭐⭐ Average (Met Requirements)';
      case 2:
        return '⭐⭐ Poor (Had Operational Delays)';
      case 1:
        return '⭐ Terrible (Did Not Match Specifications)';
      default:
        return 'Select a rating';
    }
  }

  onSubmitReview() {
    if (!this.bookingId) return;
    if (!this.comment.trim()) {
      this.errorMessage.set('Please write a brief comment describing your experience.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const payload: CreateReviewPayload = {
      bookingId: this.bookingId,
      overallRating: this.overallRating,
      dockSpeedRating: this.dockSpeedRating,
      securityRating: this.securityRating,
      cleanlinessRating: this.cleanlinessRating,
      hostResponsivenessRating: this.hostResponsivenessRating,
      facilityTypeUsed: this.facilityTypeUsed,
      comment: this.comment.trim(),
    };

    this.reviewService.submitReview(payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.reviewSubmitted.emit(res.data);
        this.onClose();
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to submit review.');
      },
    });
  }

  onClose() {
    this.close.emit();
  }
}
