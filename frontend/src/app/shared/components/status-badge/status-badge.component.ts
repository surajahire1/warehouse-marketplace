import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingStatus } from '../../../core/models/booking.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase"
      [ngClass]="badgeClass"
    >
      {{ status }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: BookingStatus;

  get badgeClass(): string {
    switch (this.status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
