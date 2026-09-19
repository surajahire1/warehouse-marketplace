import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-capacity-gauge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full">
      <div class="flex justify-between text-xs font-medium text-gray-500 mb-1">
        <span>Available: <strong class="text-gray-900">{{ available }}</strong> {{ unit }}</span>
        <span>Total: {{ total }} {{ unit }}</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          class="h-2 rounded-full transition-all duration-500"
          [style.width.%]="occupancyPercent"
          [ngClass]="{
            'bg-emerald-500': occupancyPercent < 70,
            'bg-amber-500': occupancyPercent >= 70 && occupancyPercent < 90,
            'bg-red-500': occupancyPercent >= 90
          }"
        ></div>
      </div>
    </div>
  `,
})
export class CapacityGaugeComponent {
  @Input({ required: true }) total!: number;
  @Input({ required: true }) available!: number;
  @Input() unit: string = 'SQFT';

  get occupancyPercent(): number {
    if (!this.total || this.total <= 0) return 0;
    const occupied = Math.max(0, this.total - this.available);
    return Math.min(100, Math.round((occupied / this.total) * 100));
  }
}
