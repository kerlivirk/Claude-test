import { Component, Inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface SeriesEventForm {
  name: string;
  date: string;
  time: string;
  venue: string;
  category: string;
}

const CATEGORIES = ['Music', 'Theatre', 'Dance', 'Comedy', 'Sports', 'Art', 'Festival', 'Conference', 'Other'];

@Component({
  selector: 'app-series-event-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
  ],
  template: `
    <div class="dh">
      <h2 mat-dialog-title>{{ data ? 'Edit event' : 'Add event to series' }}</h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full">
        <mat-label>Event name</mat-label>
        <input matInput [ngModel]="form().name" (ngModelChange)="update('name', $event)" placeholder="e.g. Opening Night" />
      </mat-form-field>

      <div class="row">
        <mat-form-field appearance="outline" class="grow">
          <mat-label>Date</mat-label>
          <input matInput type="date" [ngModel]="form().date" (ngModelChange)="update('date', $event)" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="grow">
          <mat-label>Time</mat-label>
          <input matInput type="time" [ngModel]="form().time" (ngModelChange)="update('time', $event)" />
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Venue</mat-label>
        <input matInput [ngModel]="form().venue" (ngModelChange)="update('venue', $event)" placeholder="e.g. Tallinn Arena" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="full">
        <mat-label>Category</mat-label>
        <mat-select [ngModel]="form().category" (ngModelChange)="update('category', $event)">
          @for (c of categories; track c) {
            <mat-option [value]="c">{{ c }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="!canSave()" (click)="confirm()">
        {{ data ? 'Save' : 'Add event' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host { font-family: Mulish, sans-serif; display: block; }
    .dh {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px 0;
    }
    .dh h2 { margin: 0; font-size: 18px; font-weight: 700; color: var(--text-primary); }
    mat-dialog-content {
      padding: 16px 24px !important;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .full { width: 100%; }
    .grow { flex: 1; }
    .row { display: flex; gap: 12px; }
    mat-dialog-actions { padding: 12px 24px 20px !important; gap: 8px; }
  `],
})
export class SeriesEventDialogComponent {
  categories = CATEGORIES;
  form = signal<SeriesEventForm>({ name: '', date: '', time: '', venue: '', category: 'Music' });

  canSave = computed(() => {
    const f = this.form();
    return !!(f.name.trim() && f.date && f.venue.trim());
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SeriesEventForm | undefined,
    private dialogRef: MatDialogRef<SeriesEventDialogComponent, SeriesEventForm>,
  ) {
    if (data) this.form.set({ ...data });
  }

  update<K extends keyof SeriesEventForm>(key: K, value: SeriesEventForm[K]) {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  confirm() {
    if (this.canSave()) this.dialogRef.close(this.form());
  }
}
