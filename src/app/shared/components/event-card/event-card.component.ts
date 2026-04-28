import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { Event, EventType } from '../../models/event.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    StatusBadgeComponent,
  ],
  template: `
    <div class="event-card" (click)="onCardClick()">
      <div class="event-card-inner">

        <!-- Left: info -->
        <div class="event-info">
          <!-- Title row -->
          <div class="event-title-row">
            <span class="event-name" (click)="onNameClick($event)">
              {{ event().name }}
            </span>
            <app-status-badge [status]="eventType()" />
            <app-status-badge [status]="event().status" />
          </div>

          <!-- Category -->
          <p class="event-category">{{ event().category }}</p>

          <!-- Metadata -->
          <div class="event-meta">
            @if (event().date) {
              <span class="meta-item">
                <mat-icon class="meta-icon">calendar_today</mat-icon>
                {{ event().date | date:'MMM d, y' }}
              </span>
            }
            @if (event().venue) {
              <span class="meta-item">
                <mat-icon class="meta-icon">location_on</mat-icon>
                {{ event().venue }}
              </span>
            }
            @if (event().totalTickets > 0) {
              <span class="meta-item">
                <mat-icon class="meta-icon">confirmation_number</mat-icon>
                {{ event().ticketsSold }} / {{ event().totalTickets }} sold
              </span>
            }
            @if (ticketState()) {
              <span class="meta-item" [class]="'ticket-state ticket-state--' + ticketStateKey()">
                <mat-icon class="meta-icon">confirmation_number</mat-icon>
                {{ ticketState() }}
              </span>
            }
          </div>
        </div>

        <!-- Right: actions -->
        <div class="event-actions" (click)="$event.stopPropagation()">
          <button
            mat-stroked-button
            class="action-btn"
            (click)="editEvent.emit(event().id)"
            matTooltip="Edit event"
          >
            <mat-icon>edit</mat-icon>
            Edit
          </button>
          <button
            mat-stroked-button
            class="action-btn action-btn--series"
            (click)="startSeries.emit(event().id)"
            matTooltip="Convert to series"
          >
            <mat-icon>layers</mat-icon>
            Start Series
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .event-card {
      background: var(--bg-surface, #fff);
      border: 1px solid var(--stroke-on-surface-primary, #e9e7ed);
      border-radius: var(--radius-lg, 0.75rem);
      padding: 1rem 1.25rem;
      cursor: pointer;
      transition: box-shadow 0.15s ease, border-color 0.15s ease;
      margin-bottom: 0.5rem;

      &:hover {
        box-shadow: 0 2px 8px rgba(17,0,43,0.08);
        border-color: var(--gray-300, #dbd7e2);
      }
    }

    .event-card-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .event-info {
      flex: 1;
      min-width: 0;
    }

    .event-title-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 0.25rem;
    }

    .event-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-on-surface-primary, #11002b);
      cursor: pointer;
      text-decoration: none;
      transition: text-decoration 0.1s;

      &:hover {
        text-decoration: underline;
      }
    }

    .event-category {
      font-size: 0.8125rem;
      color: var(--text-on-surface-secondary, #5a5062);
      margin: 0 0 0.5rem;
    }

    .event-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      color: var(--text-on-surface-secondary, #5a5062);
    }

    .meta-icon {
      font-size: 0.875rem;
      width: 0.875rem;
      height: 0.875rem;
      color: var(--gray-400, #c1bacb);
    }

    .ticket-state { font-weight: 600; }
    .ticket-state--sold    { color: var(--error-500, #ff0032); }
    .ticket-state--config  { color: var(--secondary-600, #1b9e5a); }
    .ticket-state--missing { color: var(--warning-500, #efb100); }

    .event-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .action-btn {
      height: 2rem;
      font-size: 0.8125rem;
      font-weight: 500;
      border-color: var(--stroke-on-surface-primary, #e9e7ed) !important;
      color: var(--text-on-surface-primary, #11002b) !important;
      padding: 0 0.75rem;

      mat-icon {
        font-size: 0.875rem;
        width: 0.875rem;
        height: 0.875rem;
        margin-right: 0.25rem;
      }
    }

    .action-btn--series {
      border-color: var(--primary-400, #ae9edd) !important;
    }
  `]
})
export class EventCardComponent {
  readonly event = input.required<Event>();

  readonly viewSummary = output<string>();
  readonly editEvent = output<string>();
  readonly startSeries = output<string>();

  eventType(): EventType {
    return (this.event().formData?.creationType || this.event().type || 'event') as EventType;
  }

  ticketState(): string {
    const e = this.event();
    if (this.eventType() !== 'event') return '';
    if (!e.totalTickets) return '';
    if (e.ticketsSold >= e.totalTickets) return 'Sold out';
    if (e.totalTickets > 0) return 'Configured';
    return 'Not configured';
  }

  ticketStateKey(): string {
    const state = this.ticketState();
    if (state === 'Sold out') return 'sold';
    if (state === 'Configured') return 'config';
    return 'missing';
  }

  onNameClick(e: Event | MouseEvent): void {
    (e as MouseEvent).stopPropagation();
    this.viewSummary.emit(this.event().id);
  }

  onCardClick(): void {
    this.viewSummary.emit(this.event().id);
  }
}
