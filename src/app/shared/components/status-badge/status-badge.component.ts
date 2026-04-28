import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { EventStatus, EventType } from '../../models/event.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, MatChipsModule],
  template: `
    <span class="badge" [class]="badgeClass()">
      {{ label() }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.625rem;
      border-radius: var(--radius-999, 9999px);
      font-size: 0.6875rem;
      font-weight: 600;
      line-height: 1;
    }

    .badge-active    { background: var(--secondary-100, #ddfbea); color: var(--secondary-700, #19633d); }
    .badge-scheduled { background: #e3f2fd; color: #1565c0; }
    .badge-draft     { background: var(--gray-100, #f4f2f5); color: var(--gray-900, #5a5062); }
    .badge-ended     { background: var(--gray-100, #f4f2f5); color: var(--gray-700, #84738f); }
    .badge-hidden    { background: #fff3e0; color: #e65100; }
    .badge-cancelled { background: #fdecea; color: #c62828; }
    .badge-event     { background: var(--base-black, #11002b); color: #fff; }
    .badge-series    { background: var(--primary-100, #e9e7f8); color: var(--primary-700, #7b5aa8); }
    .badge-collection { background: var(--tertiary-100, #fde6f8); color: var(--tertiary-700, #c70f87); }
  `]
})
export class StatusBadgeComponent {
  readonly status = input<EventStatus | EventType | string>('');

  label(): string {
    const s = this.status();
    const labels: Record<string, string> = {
      event: 'Event', series: 'Series', collection: 'Collection', timeslot: 'Time-slot',
      Active: 'Active', Scheduled: 'Scheduled', Draft: 'Draft',
      Ended: 'Ended', Hidden: 'Hidden', Cancelled: 'Cancelled',
    };
    return labels[s] || s;
  }

  badgeClass(): string {
    return `badge badge-${this.status()?.toLowerCase()}`;
  }
}
