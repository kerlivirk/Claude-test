import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { Event, EventType } from '../../models/event.model';

@Component({
  selector: 'app-event-summary-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    StatusBadgeComponent,
  ],
  template: `
    @if (open() && event()) {
      <!-- Backdrop -->
      <div class="backdrop" (click)="closed.emit()"></div>

      <!-- Panel -->
      <div class="panel">

        <!-- Header -->
        <div class="panel-header">
          <div class="panel-header-info">
            <div class="badges">
              <app-status-badge [status]="eventType()" />
              <app-status-badge [status]="event()!.status" />
            </div>
            <h2 class="panel-title">{{ event()!.name }}</h2>
            @if (event()!.category) {
              <p class="panel-category">{{ event()!.category }}</p>
            }
            @if (slug()) {
              <p class="panel-slug">/{{ slug() }}</p>
            }
          </div>
          <button mat-icon-button class="close-btn" (click)="closed.emit()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <!-- KPI strip -->
        @if (event()!.totalTickets > 0 || event()!.revenue > 0) {
          <div class="kpi-strip">
            @if (event()!.totalTickets > 0) {
              <div class="kpi">
                <p class="kpi-label">Tickets sold</p>
                <p class="kpi-value">
                  {{ event()!.ticketsSold }}
                  <span class="kpi-total">/ {{ event()!.totalTickets }}</span>
                </p>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="soldPct()"></div>
                </div>
              </div>
            }
            @if (event()!.revenue > 0) {
              <div class="kpi">
                <p class="kpi-label">Revenue</p>
                <p class="kpi-value">€{{ event()!.revenue | number }}</p>
              </div>
            }
          </div>
        }

        <!-- Scrollable body -->
        <div class="panel-body">

          <!-- Date & Time -->
          @if (event()!.date || event()!.formData?.eventTime) {
            <div class="section">
              <p class="section-title">
                <mat-icon>calendar_today</mat-icon> Date & Time
              </p>
              <div class="section-rows">
                <div class="row">
                  <span class="row-label">Start</span>
                  <span class="row-value">
                    {{ event()!.formData?.eventDate || event()!.date | date:'MMM d, y' }}
                    {{ event()!.formData?.eventTime ? '· ' + event()!.formData?.eventTime : '' }}
                  </span>
                </div>
                @if (event()!.formData?.eventEndDate) {
                  <div class="row">
                    <span class="row-label">End</span>
                    <span class="row-value">
                      {{ event()!.formData?.eventEndDate | date:'MMM d, y' }}
                      {{ event()!.formData?.eventEndTime ? '· ' + event()!.formData?.eventEndTime : '' }}
                    </span>
                  </div>
                }
                @if (event()!.formData?.doorsOpenTime) {
                  <div class="row">
                    <span class="row-label">Doors open</span>
                    <span class="row-value">{{ event()!.formData?.doorsOpenTime }}</span>
                  </div>
                }
                @if (event()!.formData?.timezone) {
                  <div class="row">
                    <span class="row-label">Timezone</span>
                    <span class="row-value">{{ event()!.formData?.timezone }}</span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Location -->
          @if (event()!.venue) {
            <div class="section">
              <p class="section-title">
                <mat-icon>location_on</mat-icon> Location
              </p>
              <div class="section-rows">
                <div class="row">
                  <span class="row-label">Venue</span>
                  <span class="row-value">{{ event()!.venue }}</span>
                </div>
                @if (event()!.formData?.locationCity) {
                  <div class="row">
                    <span class="row-label">City</span>
                    <span class="row-value">{{ event()!.formData?.locationCity }}</span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Description -->
          @if (description()) {
            <div class="section">
              <p class="section-title">
                <mat-icon>description</mat-icon> Description
              </p>
              <p class="section-text" [innerHTML]="description()"></p>
            </div>
          }

          <!-- Ticket Sales -->
          <div class="section">
            <p class="section-title">
              <mat-icon>confirmation_number</mat-icon> Ticket Sales
            </p>
            <div class="section-rows">
              <div class="row">
                <span class="row-label">Sales via</span>
                <span class="row-value">{{ salesSource() }}</span>
              </div>
              @if (event()!.totalTickets > 0) {
                <div class="row">
                  <span class="row-label">Total capacity</span>
                  <span class="row-value">{{ event()!.totalTickets | number }}</span>
                </div>
                <div class="row">
                  <span class="row-label">Sold</span>
                  <span class="row-value">{{ event()!.ticketsSold | number }} ({{ soldPct() }}%)</span>
                </div>
              }
            </div>

            <!-- Ticket types -->
            @if (event()!.formData?.ticketTypes?.length) {
              <div class="ticket-types">
                @for (tt of event()!.formData!.ticketTypes; track tt.id) {
                  <div class="ticket-type-row">
                    <div>
                      <p class="tt-name">{{ tt.name }}</p>
                      @if (tt.description) {
                        <p class="tt-desc">{{ tt.description }}</p>
                      }
                    </div>
                    <div class="tt-right">
                      <p class="tt-price">{{ tt.price ? '€' + tt.price : 'Free' }}</p>
                      @if (tt.quantity) {
                        <p class="tt-qty">{{ tt.quantity }} tickets</p>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Tags -->
          @if (event()!.formData?.tags?.length) {
            <div class="section">
              <p class="section-title">
                <mat-icon>label</mat-icon> Tags
              </p>
              <div class="tags">
                @for (tag of event()!.formData!.tags; track tag) {
                  <span class="tag">{{ tag }}</span>
                }
              </div>
            </div>
          }

        </div>

        <!-- Footer -->
        <div class="panel-footer">
          <button
            mat-flat-button
            class="edit-btn"
            (click)="editClicked()"
          >
            <mat-icon>edit</mat-icon>
            Edit Event
          </button>
          <button mat-stroked-button (click)="closed.emit()">
            Close
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.3);
      z-index: 100;
    }

    .panel {
      position: fixed;
      right: 0;
      top: 0;
      height: 100%;
      width: 100%;
      max-width: 520px;
      background: var(--gray-50, #f8f8fa);
      z-index: 101;
      box-shadow: -4px 0 24px rgba(17,0,43,0.12);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Header */
    .panel-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      background: var(--bg-surface, #fff);
      border-bottom: 1px solid var(--stroke-on-surface-primary, #e9e7ed);
      flex-shrink: 0;
    }

    .panel-header-info { flex: 1; padding-right: 1rem; }

    .badges { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.375rem; }

    .panel-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-on-surface-primary, #11002b);
      margin: 0 0 0.25rem;
    }

    .panel-category {
      font-size: 0.8125rem;
      color: var(--text-on-surface-secondary, #5a5062);
      margin: 0;
    }

    .panel-slug {
      font-size: 0.6875rem;
      font-family: monospace;
      color: var(--gray-500, #a99db6);
      margin: 0.25rem 0 0;
    }

    .close-btn {
      color: var(--gray-500, #a99db6);
      flex-shrink: 0;
    }

    /* KPI strip */
    .kpi-strip {
      display: flex;
      background: var(--bg-surface, #fff);
      border-bottom: 1px solid var(--stroke-on-surface-primary, #e9e7ed);
      flex-shrink: 0;
    }

    .kpi {
      flex: 1;
      padding: 0.75rem 1.25rem;
      border-right: 1px solid var(--stroke-on-surface-primary, #e9e7ed);

      &:last-child { border-right: none; }
    }

    .kpi-label {
      font-size: 0.6875rem;
      color: var(--text-on-surface-secondary, #5a5062);
      margin: 0 0 0.25rem;
      opacity: 0.6;
    }

    .kpi-value {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-on-surface-primary, #11002b);
      margin: 0;
    }

    .kpi-total {
      font-size: 0.75rem;
      font-weight: 400;
      opacity: 0.4;
    }

    .progress-bar {
      height: 4px;
      background: var(--gray-200, #e9e7ed);
      border-radius: 9999px;
      margin-top: 0.375rem;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--gray-700, #84738f);
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    /* Body */
    .panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    /* Section */
    .section {
      background: var(--bg-surface, #fff);
      border: 1px solid var(--stroke-on-surface-primary, #e9e7ed);
      border-radius: var(--radius-lg, 0.75rem);
      padding: 0.875rem 1rem;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--gray-600, #9686a2);
      margin: 0 0 0.75rem;

      mat-icon {
        font-size: 0.875rem;
        width: 0.875rem;
        height: 0.875rem;
      }
    }

    .section-rows { display: flex; flex-direction: column; gap: 0.5rem; }

    .row {
      display: flex;
      gap: 0.75rem;

      .row-label {
        font-size: 0.75rem;
        color: var(--text-on-surface-secondary, #5a5062);
        opacity: 0.5;
        min-width: 100px;
        flex-shrink: 0;
        padding-top: 0.0625rem;
      }

      .row-value {
        font-size: 0.8125rem;
        color: var(--text-on-surface-primary, #11002b);
        flex: 1;
      }
    }

    .section-text {
      font-size: 0.8125rem;
      color: var(--text-on-surface-secondary, #5a5062);
      line-height: 1.6;
      margin: 0;
    }

    /* Ticket types */
    .ticket-types {
      margin-top: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .ticket-type-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 0.75rem;
      background: var(--gray-50, #f8f8fa);
      border: 1px solid var(--stroke-on-surface-primary, #e9e7ed);
      border-radius: var(--radius-md, 0.5rem);
    }

    .tt-name { font-size: 0.8125rem; font-weight: 600; color: var(--text-on-surface-primary, #11002b); margin: 0; }
    .tt-desc { font-size: 0.6875rem; color: var(--gray-500, #a99db6); margin: 0; }
    .tt-right { text-align: right; }
    .tt-price { font-size: 0.8125rem; font-weight: 700; color: var(--text-on-surface-primary, #11002b); margin: 0; }
    .tt-qty { font-size: 0.6875rem; color: var(--gray-500, #a99db6); margin: 0; }

    /* Tags */
    .tags { display: flex; flex-wrap: wrap; gap: 0.375rem; }

    .tag {
      padding: 0.25rem 0.625rem;
      background: var(--gray-100, #f4f2f5);
      color: var(--gray-700, #84738f);
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 500;
    }

    /* Footer */
    .panel-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--stroke-on-surface-primary, #e9e7ed);
      background: var(--bg-surface, #fff);
      flex-shrink: 0;
      display: flex;
      gap: 0.75rem;
    }

    .edit-btn {
      flex: 1;
      background-color: var(--bg-surface-dark, #11002b) !important;
      color: #fff !important;
    }
  `]
})
export class EventSummaryPanelComponent {
  readonly event = input<Event | null>(null);
  readonly open = input(false);

  readonly closed = output<void>();
  readonly editClicked_ = output<string>();

  eventType(): EventType {
    return (this.event()?.formData?.creationType || this.event()?.type || 'event') as EventType;
  }

  slug(): string {
    return this.event()?.formData?.slug || '';
  }

  description(): string {
    const d = this.event()?.formData?.descriptions;
    return d ? (d['Universal'] || d['ENG'] || d['EST'] || '') : '';
  }

  soldPct(): number {
    const e = this.event();
    if (!e || !e.totalTickets) return 0;
    return Math.round((e.ticketsSold / e.totalTickets) * 100);
  }

  salesSource(): string {
    const s = this.event()?.formData?.ticketSalesSource;
    const labels: Record<string, string> = {
      biletomat: 'Biletomat', external: 'External URL', 'info-only': 'Info only'
    };
    return labels[s || ''] || 'Biletomat';
  }

  editClicked(): void {
    if (this.event()) {
      this.editClicked_.emit(this.event()!.id);
      this.closed.emit();
    }
  }
}
