import { Component, Inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface SalesPreviewData {
  eventName: string;
  ticketsSold: number;
  totalTickets: number;
  priceFrom?: number;
}
interface PreviewRow { name: string; sold: number; reserved: number; capacity: number; price: number; }

@Component({
  selector: 'app-sales-preview-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, DecimalPipe],
  template: `
    <div class="sp-dialog">
      <header class="sp-head">
        <div>
          <h1>Ticket sales</h1>
          <p>{{ data.eventName }}</p>
        </div>
        <button class="sp-close" (click)="cancel()" aria-label="Close"><mat-icon>Delete 1</mat-icon></button>
      </header>

      <div class="sp-body">
        <div class="sp-kpis">
          <div class="sp-kpi"><span class="sp-kpi-k">Sold</span><span class="sp-kpi-v">{{ totalSold() | number }}</span></div>
          <div class="sp-kpi"><span class="sp-kpi-k">Available</span><span class="sp-kpi-v">{{ totalAvailable() | number }}</span></div>
          <div class="sp-kpi"><span class="sp-kpi-k">Revenue</span><span class="sp-kpi-v">€ {{ revenue() | number }}</span></div>
        </div>

        <div class="sp-bar">
          <div class="sp-bar-fill" [style.width.%]="pct()"></div>
        </div>
        <span class="sp-bar-label">{{ pct() }}% sold ({{ totalSold() | number }} / {{ data.totalTickets | number }})</span>

        <table class="sp-table">
          <thead><tr><th>Price category</th><th>Price</th><th>Sold</th><th>Reserved</th><th>Available</th></tr></thead>
          <tbody>
            @for (r of rows; track r.name) {
              <tr>
                <td>{{ r.name }}</td>
                <td>€{{ r.price }}</td>
                <td>{{ r.sold | number }}</td>
                <td>{{ r.reserved | number }}</td>
                <td>{{ (r.capacity - r.sold - r.reserved) | number }}</td>
              </tr>
            }
          </tbody>
        </table>
        <p class="sp-note">Read-only preview. Edit price categories, capacity and rules in the event editor.</p>
      </div>

      <footer class="sp-foot">
        <button class="sp-btn sp-btn-ghost" (click)="cancel()">Close</button>
        <button class="sp-btn sp-btn-primary" (click)="edit()"><mat-icon>Pencil</mat-icon> Edit tickets</button>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: Mulish, sans-serif; color: #11002b; }
    .sp-dialog { display: flex; flex-direction: column; background: #fff; width: min(560px, 96vw); max-height: 88vh; border-radius: 16px; overflow: hidden; }
    .sp-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 18px 24px 14px; border-bottom: 1px solid #e9e7ed; }
    .sp-head h1 { margin: 0 0 4px; font-family: 'Panel Sans', Mulish, sans-serif; font-weight: 800; font-size: 18px; line-height: 24px; }
    .sp-head p { margin: 0; font: 400 13px/18px Mulish, sans-serif; color: #6d5f79; }
    .sp-close { width: 32px; height: 32px; border: 0; background: transparent; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
    .sp-close:hover { background: #f8f7f9; }
    .sp-close mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .sp-body { flex: 1; overflow-y: auto; padding: 16px 24px; }
    .sp-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
    .sp-kpi { display: flex; flex-direction: column; gap: 2px; padding: 12px 14px; background: #f8f7f9; border-radius: 10px; }
    .sp-kpi-k { font: 600 11px/16px Mulish, sans-serif; text-transform: uppercase; letter-spacing: .4px; color: #6d5f79; }
    .sp-kpi-v { font: 800 18px/24px 'Panel Sans', Mulish, sans-serif; }
    .sp-bar { height: 8px; background: #f4ebff; border-radius: 9999px; overflow: hidden; }
    .sp-bar-fill { height: 100%; background: #7f56d9; border-radius: 9999px; }
    .sp-bar-label { display: block; margin: 6px 0 14px; font: 500 12px/16px Mulish, sans-serif; color: #6d5f79; }
    .sp-table { width: 100%; border-collapse: collapse; font: 400 13px/18px Mulish, sans-serif; }
    .sp-table th { text-align: left; padding: 8px 10px; background: #f8f7f9; color: #6d5f79; font: 700 11px/16px Mulish, sans-serif; text-transform: uppercase; letter-spacing: .4px; border-bottom: 1px solid #e9e7ed; }
    .sp-table td { padding: 10px; border-bottom: 1px solid #efefef; }
    .sp-table tr:last-child td { border-bottom: 0; }
    .sp-note { margin: 10px 0 0; font: 400 12px/16px Mulish, sans-serif; color: #6d5f79; }
    .sp-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 24px; border-top: 1px solid #e9e7ed; }
    .sp-btn { display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 18px; border: 1px solid #e9e7ed; border-radius: 8px; background: #fff; font: 600 13px/18px Mulish, sans-serif; color: #11002b; cursor: pointer; }
    .sp-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .sp-btn-ghost { background: transparent; border-color: transparent; }
    .sp-btn-ghost:hover { background: #f8f7f9; }
    .sp-btn-primary { background: #11002b; border-color: #11002b; color: #fff; }
    .sp-btn-primary:hover { background: #2a1547; }
  `],
})
export class SalesPreviewDialogComponent {
  readonly data: SalesPreviewData;
  rows: PreviewRow[];

  constructor(
    public ref: MatDialogRef<SalesPreviewDialogComponent, 'edit' | undefined>,
    @Inject(MAT_DIALOG_DATA) data: SalesPreviewData,
  ) {
    this.data = data;
    const total = data.totalTickets || 0;
    const sold = data.ticketsSold || 0;
    const base = data.priceFrom || 25;
    const adultCap = Math.round(total * 0.7);
    const adultSold = Math.round(sold * 0.78);
    this.rows = [
      { name: 'Adult', price: base, sold: adultSold, reserved: Math.round(adultCap * 0.02), capacity: adultCap },
      { name: 'Discount', price: Math.round(base * 0.7), sold: sold - adultSold, reserved: 0, capacity: total - adultCap },
    ].filter(r => r.capacity > 0);
  }

  totalSold() { return this.rows.reduce((s, r) => s + r.sold, 0); }
  totalReserved() { return this.rows.reduce((s, r) => s + r.reserved, 0); }
  totalAvailable() { return this.rows.reduce((s, r) => s + Math.max(0, r.capacity - r.sold - r.reserved), 0); }
  revenue() { return this.rows.reduce((s, r) => s + r.sold * r.price, 0); }
  pct() { return this.data.totalTickets ? Math.round((this.totalSold() / this.data.totalTickets) * 100) : 0; }

  edit() { this.ref.close('edit'); }
  cancel() { this.ref.close(); }
}
