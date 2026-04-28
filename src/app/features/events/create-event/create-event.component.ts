import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatStepperModule,
    MatTabsModule,
    MatExpansionModule,
    MatChipsModule,
    MatSnackBarModule,
  ],
  template: `
    <!-- Header -->
    <div class="create-header">
      <button mat-icon-button [routerLink]="['/events']">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <div>
        <h1 class="create-title">Create Event</h1>
        <p class="create-subtitle">Fill in the details to create a new event</p>
      </div>
      <div class="header-actions">
        <button mat-stroked-button [routerLink]="['/events']">Cancel</button>
        <button mat-flat-button class="save-btn" (click)="save()">
          <mat-icon>check</mat-icon>
          Save Event
        </button>
      </div>
    </div>

    <!-- Stepper -->
    <mat-stepper orientation="horizontal" [linear]="false" class="stepper">

      <!-- Step 1: Basic Info -->
      <mat-step label="Event Details">
        <div class="step-content">

          <!-- Event Name -->
          <div class="form-section">
            <h2 class="section-title">Event Name</h2>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Event Name</mat-label>
              <input matInput placeholder="e.g., Rita Ray Concert" [(ngModel)]="form.name" />
              <mat-hint>This will be the public name of your event</mat-hint>
            </mat-form-field>
          </div>

          <!-- Date & Time -->
          <div class="form-section">
            <h2 class="section-title">Date & Time</h2>
            <div class="grid-2">
              <mat-form-field appearance="outline">
                <mat-label>Start Date</mat-label>
                <input matInput type="date" [(ngModel)]="form.startDate" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Start Time</mat-label>
                <input matInput type="time" [(ngModel)]="form.startTime" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>End Date</mat-label>
                <input matInput type="date" [(ngModel)]="form.endDate" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>End Time</mat-label>
                <input matInput type="time" [(ngModel)]="form.endTime" />
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline">
              <mat-label>Doors Open Time</mat-label>
              <input matInput type="time" [(ngModel)]="form.doorsOpen" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Timezone</mat-label>
              <mat-select [(ngModel)]="form.timezone">
                @for (tz of timezones; track tz) {
                  <mat-option [value]="tz">{{ tz }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Location -->
          <div class="form-section">
            <h2 class="section-title">Location</h2>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Venue Name</mat-label>
              <input matInput placeholder="e.g., Tallinn Arena" [(ngModel)]="form.venue" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Address</mat-label>
              <input matInput placeholder="Street address" [(ngModel)]="form.address" />
            </mat-form-field>
            <div class="grid-2">
              <mat-form-field appearance="outline">
                <mat-label>City</mat-label>
                <input matInput placeholder="City" [(ngModel)]="form.city" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Country</mat-label>
                <input matInput placeholder="Country" [(ngModel)]="form.country" />
              </mat-form-field>
            </div>
          </div>

          <!-- Description -->
          <div class="form-section">
            <h2 class="section-title">Description</h2>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Event Description</mat-label>
              <textarea
                matInput
                rows="6"
                placeholder="Describe your event..."
                [(ngModel)]="form.description"
              ></textarea>
            </mat-form-field>
          </div>

          <!-- Category -->
          <div class="form-section">
            <h2 class="section-title">Category</h2>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Category</mat-label>
              <mat-select [(ngModel)]="form.category">
                @for (cat of categories; track cat) {
                  <mat-option [value]="cat">{{ cat }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div class="step-actions">
            <button mat-flat-button matStepperNext class="save-btn">
              Next: Tickets
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>
        </div>
      </mat-step>

      <!-- Step 2: Tickets -->
      <mat-step label="Price Categories & Places">
        <div class="step-content">
          <div class="form-section">
            <h2 class="section-title">Ticket Sales Source</h2>
            <div class="source-options">
              @for (source of salesSources; track source.value) {
                <button
                  class="source-option"
                  [class.active]="form.salesSource === source.value"
                  (click)="form.salesSource = source.value"
                >
                  <mat-icon>{{ source.icon }}</mat-icon>
                  <span>{{ source.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Ticket types -->
          <div class="form-section">
            <div class="section-header">
              <h2 class="section-title">Price Categories</h2>
              <button mat-stroked-button (click)="addTicketType()">
                <mat-icon>add</mat-icon> Add category
              </button>
            </div>

            @for (tt of form.ticketTypes; track tt.id; let i = $index) {
              <mat-expansion-panel class="ticket-panel">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    {{ tt.name || 'Price Category ' + (i + 1) }}
                  </mat-panel-title>
                  <mat-panel-description>
                    {{ tt.price ? '€' + tt.price : 'No price set' }} · {{ tt.quantity || 0 }} tickets
                  </mat-panel-description>
                </mat-expansion-panel-header>

                <div class="ticket-type-form">
                  <div class="grid-2">
                    <mat-form-field appearance="outline">
                      <mat-label>Internal Name</mat-label>
                      <input matInput [(ngModel)]="tt.name" placeholder="e.g., Early Bird" />
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Display Name</mat-label>
                      <input matInput [(ngModel)]="tt.displayName" placeholder="Shown to customers" />
                    </mat-form-field>
                  </div>
                  <div class="grid-2">
                    <mat-form-field appearance="outline">
                      <mat-label>Price (€)</mat-label>
                      <input matInput type="number" [(ngModel)]="tt.price" placeholder="0.00" />
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Quantity</mat-label>
                      <input matInput type="number" [(ngModel)]="tt.quantity" placeholder="e.g., 500" />
                    </mat-form-field>
                  </div>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Description</mat-label>
                    <input matInput [(ngModel)]="tt.description" placeholder="Optional description" />
                  </mat-form-field>
                  <button mat-button color="warn" (click)="removeTicketType(i)">
                    <mat-icon>delete</mat-icon> Remove
                  </button>
                </div>
              </mat-expansion-panel>
            }
          </div>

          <div class="step-actions">
            <button mat-stroked-button matStepperPrevious>
              <mat-icon>arrow_back</mat-icon> Back
            </button>
            <button mat-flat-button matStepperNext class="save-btn">
              Next: Settings
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>
        </div>
      </mat-step>

      <!-- Step 3: Status & Save -->
      <mat-step label="Settings & Save">
        <div class="step-content">
          <div class="form-section">
            <h2 class="section-title">Event Status</h2>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="form.status">
                <mat-option value="Draft">Draft</mat-option>
                <mat-option value="Active">Active</mat-option>
                <mat-option value="Scheduled">Scheduled</mat-option>
                <mat-option value="Hidden">Hidden</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Summary -->
          <div class="summary-card">
            <h3>Summary</h3>
            <div class="summary-row">
              <span>Name</span><span>{{ form.name || '—' }}</span>
            </div>
            <div class="summary-row">
              <span>Date</span><span>{{ form.startDate || '—' }}</span>
            </div>
            <div class="summary-row">
              <span>Venue</span><span>{{ form.venue || '—' }}</span>
            </div>
            <div class="summary-row">
              <span>Status</span><span>{{ form.status }}</span>
            </div>
            <div class="summary-row">
              <span>Price categories</span><span>{{ form.ticketTypes.length }}</span>
            </div>
          </div>

          <div class="step-actions">
            <button mat-stroked-button matStepperPrevious>
              <mat-icon>arrow_back</mat-icon> Back
            </button>
            <button mat-flat-button class="save-btn" (click)="save()">
              <mat-icon>check</mat-icon> Save Event
            </button>
          </div>
        </div>
      </mat-step>

    </mat-stepper>
  `,
  styles: [`
    .create-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      background: var(--bg-surface, #fff);
      padding: 1rem 1.5rem;
      border-radius: var(--radius-lg, 0.75rem);
      border: 1px solid var(--stroke-on-surface-primary, #e9e7ed);
    }

    .create-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-on-surface-primary, #11002b);
      margin: 0 0 0.125rem;
    }

    .create-subtitle {
      font-size: 0.8125rem;
      color: var(--text-on-surface-secondary, #5a5062);
      margin: 0;
    }

    .header-actions {
      margin-left: auto;
      display: flex;
      gap: 0.75rem;
    }

    .save-btn {
      background-color: var(--bg-brand, #06d373) !important;
      color: var(--text-on-brand-primary, #11002b) !important;
      font-weight: 600 !important;
    }

    /* Stepper */
    .stepper {
      background: var(--bg-surface, #fff);
      border: 1px solid var(--stroke-on-surface-primary, #e9e7ed);
      border-radius: var(--radius-lg, 0.75rem);
      overflow: hidden;
    }

    .step-content {
      padding: 1.5rem;
      max-width: 720px;
    }

    .form-section {
      background: var(--bg-surface, #fff);
      border: 1px solid var(--stroke-on-surface-primary, #e9e7ed);
      border-radius: var(--radius-lg, 0.75rem);
      padding: 1.5rem;
      margin-bottom: 1rem;
    }

    .section-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-on-surface-primary, #11002b);
      margin: 0 0 1rem;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .full-width { width: 100%; }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    /* Source options */
    .source-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    .source-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border: 2px solid var(--stroke-on-surface-primary, #e9e7ed);
      border-radius: var(--radius-md, 0.5rem);
      background: var(--bg-surface, #fff);
      cursor: pointer;
      transition: all 0.15s;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-on-surface-primary, #11002b);

      &:hover { border-color: var(--gray-400, #c1bacb); }
      &.active {
        border-color: var(--base-black, #11002b);
        background: var(--base-black, #11002b);
        color: #fff;
      }
    }

    /* Ticket type panels */
    .ticket-panel {
      margin-bottom: 0.75rem;
      border: 1px solid var(--stroke-on-surface-primary, #e9e7ed) !important;
      border-radius: var(--radius-md, 0.5rem) !important;
    }

    .ticket-type-form {
      padding-top: 1rem;
    }

    /* Summary */
    .summary-card {
      background: var(--gray-50, #f8f8fa);
      border: 1px solid var(--stroke-on-surface-primary, #e9e7ed);
      border-radius: var(--radius-lg, 0.75rem);
      padding: 1.25rem;
      margin: 1rem 0;

      h3 {
        font-size: 0.875rem;
        font-weight: 700;
        color: var(--text-on-surface-primary, #11002b);
        margin: 0 0 0.75rem;
      }
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.375rem 0;
      font-size: 0.875rem;
      border-bottom: 1px solid var(--stroke-on-surface-primary, #e9e7ed);

      &:last-child { border-bottom: none; }

      span:first-child { color: var(--text-on-surface-secondary, #5a5062); }
      span:last-child { font-weight: 500; color: var(--text-on-surface-primary, #11002b); }
    }

    .step-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
  `]
})
export class CreateEventComponent {
  readonly timezones = [
    'Europe/Tallinn', 'Europe/Riga', 'Europe/Vilnius',
    'Europe/Helsinki', 'Europe/Warsaw', 'Europe/Berlin', 'Europe/London'
  ];

  readonly categories = [
    'Music', 'Theatre', 'Dance', 'Sport', 'Comedy', 'Art',
    'Film', 'Festival', 'Conference', 'Family', 'Other'
  ];

  readonly salesSources = [
    { value: 'biletomat', label: 'Biletomat.com', icon: 'confirmation_number' },
    { value: 'external', label: 'External', icon: 'open_in_new' },
    { value: 'info-only', label: 'Info only', icon: 'info' },
  ];

  form = {
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    doorsOpen: '',
    timezone: 'Europe/Tallinn',
    venue: '',
    address: '',
    city: '',
    country: '',
    description: '',
    category: '',
    status: 'Draft',
    salesSource: 'biletomat',
    ticketTypes: [] as Array<{
      id: string; name: string; displayName: string;
      price: string; quantity: string; description: string;
    }>,
  };

  constructor(private snackBar: MatSnackBar) {}

  addTicketType(): void {
    this.form.ticketTypes.push({
      id: Date.now().toString(),
      name: '', displayName: '', price: '', quantity: '', description: ''
    });
  }

  removeTicketType(index: number): void {
    this.form.ticketTypes.splice(index, 1);
  }

  save(): void {
    this.snackBar.open('Event saved successfully!', '✓', {
      duration: 3000,
      panelClass: ['snack-success']
    });
  }
}
