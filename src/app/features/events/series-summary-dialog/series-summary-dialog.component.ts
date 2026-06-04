import { Component, Inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { Series } from '../../../shared/models/series.model';
import { EventStatus, MOCK_EVENTS } from '../../../shared/models/event.model';

export type SeriesSummaryAction = 'open' | 'edit';

/**
 * Lightweight left-side drawer shown when a series is clicked in the list.
 * Gives a quick summary + event-count overview, then lets the user "Open" the
 * full series view or "Edit" the series template.
 */
@Component({
  selector: 'app-series-summary-dialog',
  standalone: true,
  imports: [CommonModule, DecimalPipe, MatDialogModule, MatIconModule],
  template: `
    <div class="ss-dialog">
      <header class="ss-head">
        <div class="ss-head-text">
          <span class="ss-tag" [class]="'ss-tag--' + chipVariant(series.status)">{{ series.status }}</span>
          <h1>{{ series.name }}</h1>
          @if (series.legalEntity) { <p>{{ series.legalEntity }}</p> }
        </div>
        <button class="ss-close" (click)="close()" aria-label="Close"><mat-icon>Delete 1</mat-icon></button>
      </header>

      <div class="ss-body">
        <!-- Event overview -->
        <span class="ss-section-label">Event overview</span>
        <div class="ss-kpis">
          <div class="ss-kpi ss-kpi--accent">
            <span class="ss-kpi-val">{{ series.eventCount }}</span>
            <span class="ss-kpi-label">Events in series</span>
          </div>
          <div class="ss-kpi">
            <span class="ss-kpi-val">{{ ticketsSold | number:'1.0-0':'en-GB' }}</span>
            <span class="ss-kpi-label">Tickets sold</span>
          </div>
          <div class="ss-kpi">
            <span class="ss-kpi-val">€ {{ revenue | number:'1.0-0':'en-GB' }}</span>
            <span class="ss-kpi-label">Revenue</span>
          </div>
          <div class="ss-kpi">
            <span class="ss-kpi-val">{{ capacity | number:'1.0-0':'en-GB' }}</span>
            <span class="ss-kpi-label">Capacity</span>
          </div>
        </div>

        @if (series.description) {
          <span class="ss-section-label">Description</span>
          <p class="ss-desc">{{ series.description }}</p>
        }

        <span class="ss-section-label">Details</span>
        <dl class="ss-meta">
          <div class="ss-meta-row"><dt>Category</dt><dd>{{ series.category || '—' }}</dd></div>
          <div class="ss-meta-row"><dt>Genre</dt><dd>{{ series.genre || '—' }}</dd></div>
          <div class="ss-meta-row"><dt>Venue</dt><dd>{{ series.venue || '—' }}</dd></div>
          <div class="ss-meta-row"><dt>Slug</dt><dd>/{{ series.slug || '—' }}</dd></div>
        </dl>
      </div>

      <footer class="ss-foot">
        <button class="ss-btn ss-btn-ghost" (click)="edit()">
          <mat-icon>Pencil</mat-icon>
          Edit series
        </button>
        <button class="ss-btn ss-btn-primary" (click)="open()">
          <mat-icon>Layers 1</mat-icon>
          Open series
        </button>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: Mulish, sans-serif; color: #11002b; }
    .ss-dialog { display: flex; flex-direction: column; background: #fff; width: 100%; height: 100vh; }
    .ss-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 22px 22px 16px; border-bottom: 1px solid #e9e7ed; }
    .ss-head h1 { margin: 6px 0 2px; font-family: 'Panel Sans', Mulish, sans-serif; font-weight: 800; font-size: 20px; line-height: 26px; }
    .ss-head p { margin: 0; font: 400 13px/18px Mulish, sans-serif; color: #6d5f79; }
    .ss-tag { display: inline-flex; align-items: center; height: 20px; padding: 0 8px; border-radius: 9999px; font: 700 10px/14px Mulish, sans-serif; text-transform: uppercase; letter-spacing: .4px; background: #f4f2f5; color: #6d5f79; }
    .ss-tag--success { background: #ddfbea; color: #19633d; }
    .ss-tag--warning { background: #fef0d9; color: #b45309; }
    .ss-tag--error { background: #fcd8da; color: #b3261e; }
    .ss-close { width: 32px; height: 32px; border: 0; background: transparent; border-radius: 8px; cursor: pointer; color: #11002b; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .ss-close:hover { background: #f8f7f9; }
    .ss-close mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .ss-body { flex: 1; overflow-y: auto; padding: 18px 22px 24px; }
    .ss-section-label { display: block; font: 700 11px/16px Mulish, sans-serif; text-transform: uppercase; letter-spacing: .5px; color: #6d5f79; margin: 18px 0 8px; }
    .ss-section-label:first-child { margin-top: 0; }
    .ss-kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .ss-kpi { display: flex; flex-direction: column; gap: 2px; padding: 12px 14px; border: 1px solid #e9e7ed; border-radius: 12px; background: #fff; }
    .ss-kpi--accent { background: #faf8ff; border-color: #d6c9ea; }
    .ss-kpi-val { font: 800 20px/26px 'Panel Sans', Mulish, sans-serif; }
    .ss-kpi-label { font: 500 11px/15px Mulish, sans-serif; color: #6d5f79; }
    .ss-desc { margin: 0; font: 400 14px/21px Mulish, sans-serif; color: #11002b; }
    .ss-meta { margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .ss-meta-row { display: flex; justify-content: space-between; gap: 16px; font: 400 13px/18px Mulish, sans-serif; }
    .ss-meta-row dt { color: #6d5f79; margin: 0; }
    .ss-meta-row dd { margin: 0; font-weight: 600; text-align: right; }
    .ss-foot { display: flex; gap: 8px; padding: 14px 22px; border-top: 1px solid #e9e7ed; }
    .ss-btn { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 42px; padding: 0 16px; border: 1px solid #e9e7ed; border-radius: 8px; background: #fff; font: 600 13px/18px Mulish, sans-serif; color: #11002b; cursor: pointer; }
    .ss-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .ss-btn-ghost:hover { background: #f8f7f9; }
    .ss-btn-primary { background: #11002b; border-color: #11002b; color: #fff; }
    .ss-btn-primary:hover { background: #2a1547; }
  `],
})
export class SeriesSummaryDialogComponent {
  readonly series: Series;
  readonly ticketsSold: number;
  readonly revenue: number;
  readonly capacity: number;

  constructor(
    public ref: MatDialogRef<SeriesSummaryDialogComponent, SeriesSummaryAction>,
    @Inject(MAT_DIALOG_DATA) data: { series: Series },
  ) {
    this.series = data.series;
    const evts = MOCK_EVENTS.filter(e => this.series.eventIds.includes(e.id));
    this.ticketsSold = evts.reduce((s, e) => s + (e.ticketsSold || 0), 0);
    this.revenue = evts.reduce((s, e) => s + (e.revenue || 0), 0);
    this.capacity = evts.reduce((s, e) => s + (e.totalTickets || 0), 0);
  }

  chipVariant(s: EventStatus): 'success' | 'warning' | 'error' | 'muted' {
    switch (s) {
      case 'Active': return 'success';
      case 'Scheduled': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'muted';
    }
  }

  open() { this.ref.close('open'); }
  edit() { this.ref.close('edit'); }
  close() { this.ref.close(); }
}
