import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketAllocation } from '../../models/programme-event.model';

@Component({
  selector: 'app-ticket-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ticket-bar-wrap">
      <div class="ticket-bar-header">
        <span class="tb-total">Total: {{ alloc().total | number }}</span>
        <span class="tb-sr">S.R: {{ alloc().sellRatio }}%</span>
      </div>
      <div class="tb-bar">
        <div class="tb-seg tb-sold"    [style.width.%]="pcts().sold"></div>
        <div class="tb-seg tb-reserved" [style.width.%]="pcts().reserved"></div>
        <div class="tb-seg tb-blocked"  [style.width.%]="pcts().blocked"></div>
        <div class="tb-seg tb-avail"    [style.width.%]="pcts().available"></div>
      </div>
      <div class="tb-legend">
        <span class="tb-leg-item"><span class="tb-dot tb-dot-sold"></span>{{ alloc().sold | number }}</span>
        <span class="tb-leg-item"><span class="tb-dot tb-dot-reserved"></span>{{ alloc().reserved | number }}</span>
        <span class="tb-leg-item"><span class="tb-dot tb-dot-blocked"></span>{{ alloc().blocked | number }}</span>
        <span class="tb-leg-item"><span class="tb-dot tb-dot-avail"></span>{{ alloc().available | number }}</span>
      </div>
    </div>
  `,
  styles: [`
    .ticket-bar-wrap { min-width: 140px; }
    .ticket-bar-header {
      display: flex; gap: 6px; align-items: center;
      font-size: 11px; font-weight: 600; color: var(--text-on-surface-primary, #11002b);
      margin-bottom: 4px; font-family: Mulish, sans-serif;
    }
    .tb-sr { color: var(--text-on-surface-secondary, #5a5062); font-weight: 500; }
    .tb-bar {
      display: flex; height: 8px; border-radius: var(--radius-999, 9999px);
      overflow: hidden; background: var(--gray-100, #f4f2f5);
    }
    .tb-seg { height: 100%; transition: width .3s ease; }
    .tb-sold     { background: var(--secondary-500, #06d373); }
    .tb-reserved { background: var(--primary-500, #9d85d0); }
    .tb-blocked  { background: var(--error-500, #ff0032); }
    .tb-avail    { background: var(--gray-200, #e9e7ed); }
    .tb-legend { display: flex; gap: 6px; margin-top: 4px; flex-wrap: wrap; }
    .tb-leg-item {
      display: flex; align-items: center; gap: 3px;
      font-size: 10px; color: var(--text-on-surface-secondary, #5a5062);
      font-family: Mulish, sans-serif;
    }
    .tb-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .tb-dot-sold     { background: var(--secondary-500, #06d373); }
    .tb-dot-reserved { background: var(--primary-500, #9d85d0); }
    .tb-dot-blocked  { background: var(--error-500, #ff0032); }
    .tb-dot-avail    { background: var(--gray-200, #e9e7ed); }
  `],
})
export class TicketProgressBarComponent {
  readonly alloc = input.required<TicketAllocation>();

  pcts = computed(() => {
    const a = this.alloc();
    const t = a.total || 1;
    return {
      sold: (a.sold / t) * 100,
      reserved: (a.reserved / t) * 100,
      blocked: (a.blocked / t) * 100,
      available: (a.available / t) * 100,
    };
  });
}
