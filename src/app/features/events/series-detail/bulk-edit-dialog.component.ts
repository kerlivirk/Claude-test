import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { EventStatus } from '../../../shared/models/event.model';

export interface BulkEditResult {
  status?: EventStatus;
  venue?: string;
  date?: string;
  saleStartDate?: string;
  saleStartTime?: string;
  saleEndDate?: string;
  saleEndTime?: string;
}

@Component({
  selector: 'app-bulk-edit-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  template: `
    <div class="be-dialog">
      <header class="be-header">
        <div>
          <h1>Edit {{ count }} event{{ count === 1 ? '' : 's' }}</h1>
          <p>Only the fields you toggle on will be applied to the selected events. The rest stay unchanged.</p>
        </div>
        <button class="be-close" (click)="cancel()" aria-label="Close"><mat-icon>Delete 1</mat-icon></button>
      </header>

      <div class="be-body">
        <!-- Status -->
        <div class="be-field" [class.on]="setStatus()">
          <label class="be-toggle-row">
            <input type="checkbox" [checked]="setStatus()" (change)="setStatus.set(!setStatus())" />
            <span>Status</span>
          </label>
          <select class="be-input" [disabled]="!setStatus()" [ngModel]="status()" (ngModelChange)="status.set($event)">
            @for (s of statusOptions; track s) { <option [value]="s">{{ s }}</option> }
          </select>
        </div>

        <!-- Venue -->
        <div class="be-field" [class.on]="setVenue()">
          <label class="be-toggle-row">
            <input type="checkbox" [checked]="setVenue()" (change)="setVenue.set(!setVenue())" />
            <span>Venue</span>
          </label>
          <input class="be-input" type="text" [disabled]="!setVenue()" [ngModel]="venue()" (ngModelChange)="venue.set($event)" placeholder="Venue name" />
        </div>

        <!-- Date -->
        <div class="be-field" [class.on]="setDate()">
          <label class="be-toggle-row">
            <input type="checkbox" [checked]="setDate()" (change)="setDate.set(!setDate())" />
            <span>Event date</span>
          </label>
          <input class="be-input" type="date" [disabled]="!setDate()" [ngModel]="date()" (ngModelChange)="date.set($event)" />
        </div>

        <!-- Sale start -->
        <div class="be-field" [class.on]="setSaleStart()">
          <label class="be-toggle-row">
            <input type="checkbox" [checked]="setSaleStart()" (change)="setSaleStart.set(!setSaleStart())" />
            <span>Sale start</span>
          </label>
          <div class="be-row2">
            <input class="be-input" type="date" [disabled]="!setSaleStart()" [ngModel]="saleStartDate()" (ngModelChange)="saleStartDate.set($event)" />
            <input class="be-input" type="time" [disabled]="!setSaleStart()" [ngModel]="saleStartTime()" (ngModelChange)="saleStartTime.set($event)" />
          </div>
        </div>

        <!-- Sale end -->
        <div class="be-field" [class.on]="setSaleEnd()">
          <label class="be-toggle-row">
            <input type="checkbox" [checked]="setSaleEnd()" (change)="setSaleEnd.set(!setSaleEnd())" />
            <span>Sale end</span>
          </label>
          <div class="be-row2">
            <input class="be-input" type="date" [disabled]="!setSaleEnd()" [ngModel]="saleEndDate()" (ngModelChange)="saleEndDate.set($event)" />
            <input class="be-input" type="time" [disabled]="!setSaleEnd()" [ngModel]="saleEndTime()" (ngModelChange)="saleEndTime.set($event)" />
          </div>
        </div>
      </div>

      <footer class="be-footer">
        <button class="be-btn be-btn-ghost" (click)="cancel()">Cancel</button>
        <button class="be-btn be-btn-primary" [disabled]="!anyOn()" (click)="submit()">
          <mat-icon>Check</mat-icon>
          Apply to {{ count }}
        </button>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: Mulish, sans-serif; color: #11002b; }
    .be-dialog { display: flex; flex-direction: column; background: #fff; width: min(440px, 96vw); border-radius: 16px; overflow: hidden; }
    .be-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 20px 24px 14px; border-bottom: 1px solid #e9e7ed; }
    .be-header h1 { margin: 0 0 4px; font-family: 'Panel Sans', Mulish, sans-serif; font-weight: 800; font-size: 18px; line-height: 24px; }
    .be-header p { margin: 0; font: 400 13px/18px Mulish, sans-serif; color: #6d5f79; }
    .be-close { width: 32px; height: 32px; border: 0; background: transparent; border-radius: 8px; cursor: pointer; color: #11002b; display: inline-flex; align-items: center; justify-content: center; }
    .be-close:hover { background: #f8f7f9; }
    .be-close mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .be-body { padding: 18px 24px; display: flex; flex-direction: column; gap: 16px; }
    .be-field { display: flex; flex-direction: column; gap: 8px; opacity: .55; transition: opacity 120ms ease; }
    .be-field.on { opacity: 1; }
    .be-toggle-row { display: inline-flex; align-items: center; gap: 8px; font: 600 13px/18px Mulish, sans-serif; cursor: pointer; }
    .be-toggle-row input { width: 16px; height: 16px; accent-color: #11002b; }
    .be-input { width: 100%; height: 40px; padding: 0 12px; background: #fff; border: 1px solid #e9e7ed; border-radius: 8px; font: 400 14px/20px Mulish, sans-serif; color: #11002b; outline: none; }
    .be-input:focus { border-color: #11002b; }
    .be-input:disabled { background: #f8f7f9; color: #a99db6; cursor: not-allowed; }
    .be-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .be-footer { display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding: 14px 24px; border-top: 1px solid #e9e7ed; }
    .be-btn { display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 16px; border: 1px solid #e9e7ed; border-radius: 8px; background: #fff; font: 600 13px/18px Mulish, sans-serif; color: #11002b; cursor: pointer; }
    .be-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .be-btn-ghost { background: transparent; border-color: transparent; }
    .be-btn-ghost:hover { background: #f8f7f9; }
    .be-btn-primary { background: #11002b; border-color: #11002b; color: #fff; }
    .be-btn-primary:hover { background: #2a1547; }
    .be-btn-primary:disabled { background: #f4f2f5; border-color: #f4f2f5; color: #a99db6; cursor: not-allowed; }
  `],
})
export class BulkEditDialogComponent {
  readonly count: number;
  readonly statusOptions: EventStatus[] = ['Active', 'Scheduled', 'Draft', 'Hidden', 'Ended', 'Cancelled'];

  setStatus = signal(false);
  setVenue = signal(false);
  setDate = signal(false);
  setSaleStart = signal(false);
  setSaleEnd = signal(false);

  status = signal<EventStatus>('Scheduled');
  venue = signal('');
  date = signal('');
  saleStartDate = signal('');
  saleStartTime = signal('');
  saleEndDate = signal('');
  saleEndTime = signal('');

  constructor(
    public ref: MatDialogRef<BulkEditDialogComponent, BulkEditResult | undefined>,
    @Inject(MAT_DIALOG_DATA) data: { count: number },
  ) {
    this.count = data?.count ?? 0;
  }

  anyOn() {
    return this.setStatus() || this.setVenue() || this.setDate() || this.setSaleStart() || this.setSaleEnd();
  }

  submit() {
    if (!this.anyOn()) return;
    const result: BulkEditResult = {};
    if (this.setStatus()) result.status = this.status();
    if (this.setVenue()) result.venue = this.venue();
    if (this.setDate()) result.date = this.date();
    if (this.setSaleStart()) { result.saleStartDate = this.saleStartDate(); result.saleStartTime = this.saleStartTime(); }
    if (this.setSaleEnd()) { result.saleEndDate = this.saleEndDate(); result.saleEndTime = this.saleEndTime(); }
    this.ref.close(result);
  }
  cancel() { this.ref.close(); }
}
