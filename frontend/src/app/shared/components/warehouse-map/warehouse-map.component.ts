import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Warehouse } from '../../../core/models/warehouse.model';

@Component({
  selector: 'app-warehouse-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden shadow-sm border border-gray-200">
      <div #mapContainer class="w-full h-full z-0"></div>

      <!-- Floating Map Legend -->
      <div class="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-gray-200 text-xs flex items-center gap-3">
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
          <span class="font-medium text-gray-700">Warehouse Space</span>
        </div>
        @if (userLat && userLng) {
          <div class="flex items-center gap-1.5 border-l border-gray-200 pl-3">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block ring-2 ring-blue-200"></span>
            <span class="font-medium text-gray-700">Your Location ({{ radiusKm }}km Radius)</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class WarehouseMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  @Input() warehouses: Warehouse[] = [];
  @Input() userLat: number | null = null;
  @Input() userLng: number | null = null;
  @Input() radiusKm: number = 500;
  @Input() selectedWarehouseId: string | null = null;

  @Output() warehouseSelected = new EventEmitter<string>();

  private map: L.Map | null = null;
  private markersLayer: L.FeatureGroup = new L.FeatureGroup();
  private radiusCircle: L.Circle | null = null;
  private userMarker: L.Marker | null = null;

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.map) {
      if (changes['warehouses'] || changes['userLat'] || changes['userLng'] || changes['radiusKm']) {
        this.updateMapLayers();
      }
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap() {
    if (!this.mapContainer?.nativeElement) return;

    // Default center to India [20.5937, 78.9629]
    const initialLat = this.userLat || 20.5937;
    const initialLng = this.userLng || 78.9629;
    const initialZoom = this.userLat && this.userLng ? 7 : 5;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      scrollWheelZoom: true,
    });

    // High quality OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);
    this.updateMapLayers();

    // Trigger invalidateSize after a brief delay to ensure container layout is settled
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 200);
  }

  private updateMapLayers() {
    if (!this.map) return;

    this.markersLayer.clearLayers();
    if (this.radiusCircle) {
      this.radiusCircle.remove();
      this.radiusCircle = null;
    }
    if (this.userMarker) {
      this.userMarker.remove();
      this.userMarker = null;
    }

    const boundsPoints: L.LatLngExpression[] = [];

    // 1. Render User GPS Location & Radius Circle if present
    if (this.userLat !== null && this.userLng !== null) {
      const userLatLng: L.LatLngTuple = [this.userLat, this.userLng];
      boundsPoints.push(userLatLng);

      const userIcon = L.divIcon({
        className: 'user-location-pin',
        html: `<div class="pulse-circle"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      this.userMarker = L.marker(userLatLng, { icon: userIcon, zIndexOffset: 1000 }).addTo(this.map);
      this.userMarker.bindTooltip('Your Current Location', { direction: 'top', offset: [0, -10] });

      this.radiusCircle = L.circle(userLatLng, {
        radius: (this.radiusKm || 500) * 1000,
        color: '#4f46e5',
        weight: 1.5,
        fillColor: '#6366f1',
        fillOpacity: 0.08,
      }).addTo(this.map);
    }

    // 2. Render Warehouse Price Pins
    for (const wh of this.warehouses) {
      if (wh.location?.coordinates && wh.location.coordinates.length === 2) {
        const lng = wh.location.coordinates[0];
        const lat = wh.location.coordinates[1];
        const latLng: L.LatLngTuple = [lat, lng];
        boundsPoints.push(latLng);

        const currSymbol = wh.currency === 'USD' ? '$' : '₹';
        const priceText = `${currSymbol}${wh.pricePerUnitPerDay}`;
        const isSelected = this.selectedWarehouseId === wh._id;

        const pinIcon = L.divIcon({
          className: `custom-price-pin ${isSelected ? 'active-pin' : ''}`,
          html: `
            <div class="pin-badge">
              <span>📍</span>
              <span>${priceText}</span>
            </div>
          `,
          iconSize: [60, 26],
          iconAnchor: [30, 13],
        });

        const marker = L.marker(latLng, { icon: pinIcon });

        const photoUrl =
          wh.images && wh.images.length > 0
            ? wh.images[0]
            : 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80';

        const distanceBadge =
          wh.distanceKm !== undefined
            ? `<span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">📍 ${wh.distanceKm} km away</span>`
            : '';

        const popupHtml = `
          <div class="w-64 p-3 bg-white font-sans text-left">
            <div class="h-28 rounded-lg overflow-hidden bg-gray-100 mb-2 border border-gray-100 relative">
              <img src="${photoUrl}" alt="${wh.title}" class="w-full h-full object-cover" />
              <span class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-gray-900 shadow-sm">
                ${currSymbol}${wh.pricePerUnitPerDay}/${wh.capacityUnit}
              </span>
            </div>
            <div class="font-bold text-xs text-gray-900 leading-tight mb-1">${wh.title}</div>
            <div class="text-[11px] text-gray-500 mb-2 flex items-center justify-between">
              <span>📍 ${wh.address.city}, ${wh.address.state}</span>
              ${distanceBadge}
            </div>
            <div class="text-[11px] text-gray-600 mb-2 font-medium">
              Capacity: ${wh.totalCapacity.toLocaleString()} ${wh.capacityUnit}
            </div>
            <div class="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span class="text-xs font-bold text-indigo-600">${currSymbol}${wh.pricePerUnitPerDay}/day</span>
              <a href="/warehouses/${wh._id}" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition">
                Reserve ➔
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml, { maxWidth: 280, minWidth: 260 });

        marker.on('click', () => {
          this.warehouseSelected.emit(wh._id);
        });

        this.markersLayer.addLayer(marker);
      }
    }

    // 3. Auto-fit bounds
    if (boundsPoints.length > 0) {
      const bounds = L.latLngBounds(boundsPoints);
      this.map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: this.userLat ? 11 : 8,
      });
    }
  }
}
