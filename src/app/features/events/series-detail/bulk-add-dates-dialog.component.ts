import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface BulkAddRow {
  date: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

@Component({
  selector: 'app-bulk-add-dates-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  template: `
    <div class="ba-dialog">
      <header class="ba-header">
        <div>
          <h1>Bulk add events</h1>
          <p>Add one or more dates with start &amp; end times to create blank events. Name, venue and tickets can be filled in later.</p>
        </div>
        <button class="ba-close" (click)="cancel()" aria-label="Close"><mat-icon>Delete 1</mat-icon></button>
      </header>

      <div class="ba-body">
        @for (row of rows(); track row.key; let i = $index) {
          <div class="ba-row">
            <div class="ba-row-head">
              <span class="ba-row-num">Event {{ i + 1 }}</span>
              <button class="ba-row-del" (click)="removeRow(i)" [disabled]="rows().length === 1" aria-label="Remove date">
                <mat-icon>Trash</mat-icon>
              </button>
            </div>
            <div class="ba-row-fields">
              <label class="ba-f">
                <span>Start date</span>
                <input class="ba-input" type="date" [ngModel]="row.date" (ngModelChange)="setField(i, 'date', $event)" />
              </label>
              <label class="ba-f">
                <span>Start time</span>
                <input class="ba-input" type="time" [ngModel]="row.startTime" (ngModelChange)="setField(i, 'startTime', $event)" />
              </label>
              <label class="ba-f">
                <span>End date</span>
                <input class="ba-input" type="date" [ngModel]="row.endDate" [min]="row.date" (ngModelChange)="setField(i, 'endDate', $event)" />
              </label>
              <label class="ba-f">
                <span>End time</span>
                <input class="ba-input" type="time" [ngModel]="row.endTime" (ngModelChange)="setField(i, 'endTime', $event)" />
              </label>
            </div>
          </div>
        }

        <button class="ba-add-row" (click)="addRow()">
          <mat-icon>Add 1</mat-icon>
          Add another date
        </button>
      </div>

      <footer class="ba-footer">
        <span class="ba-count">{{ validCount() }} event{{ validCount() === 1 ? '' : 's' }} will be created</span>
        <div class="ba-actions">
          <button class="ba-btn ba-btn-ghost" (click)="cancel()">Cancel</button>
          <button class="ba-btn ba-btn-primary" [disabled]="validCount() === 0" (click)="submit()">
            <mat-icon>Check</mat-icon>
            Create {{ validCount() }} event{{ validCount() === 1 ? '' : 's' }}
          </button>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: Mulish, sans-serif; color: #11002b; }
    .ba-dialog { display: flex; flex-direction: column; background: #fff; width: min(520px, 96vw); max-height: 86vh; border-radius: 16px; overflow: hidden; }
    .ba-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 20px 24px 14px; border-bottom: 1px solid #e9e7ed; }
    .ba-header h1 { margin: 0 0 4px; font-family: 'Panel Sans', Mulish, sans-serif; font-weight: 800; font-size: 18px; line-height: 24px; }
    .ba-header p { margin: 0; font: 400 13px/18px Mulish, sans-serif; color: #6d5f79; }
    .ba-close { width: 32px; height: 32px; border: 0; background: transparent; border-radius: 8px; cursor: pointer; color: #11002b; display: inline-flex; align-items: center; justify-content: center; }
    .ba-close:hover { background: #f8f7f9; }
    .ba-close mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .ba-body { flex: 1; overflow-y: auto; padding: 18px 24px; display: flex; flex-direction: column; gap: 12px; }
    .ba-row { border: 1px solid #e9e7ed; border-radius: 12px; padding: 12px 14px; }
    .ba-row-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .ba-row-num { font: 700 12px/16px Mulish, sans-serif; color: #6d5f79; }
    .ba-row-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .ba-f { display: flex; flex-direction: column; gap: 4px; font: 500 11px/14px Mulish, sans-serif; color: #6d5f79; }
    .ba-input { width: 100%; height: 40px; padding: 0 10px; background: #fff; border: 1px solid #e9e7ed; border-radius: 8px; font: 400 14px/20px Mulish, sans-serif; color: #11002b; outline: none; }
    .ba-input:focus { border-color: #11002b; }
    .ba-row-del { width: 30px; height: 30px; border: 1px solid #e9e7ed; background: #fff; border-radius: 8px; cursor: pointer; color: #b3261e; display: inline-flex; align-items: center; justify-content: center; }
    .ba-row-del:hover:not(:disabled) { background: #fdecea; }
    .ba-row-del:disabled { opacity: .4; cursor: not-allowed; }
    .ba-row-del mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .ba-add-row { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; margin-top: 4px; padding: 8px 12px; background: transparent; border: 1px dashed #c1b9cc; border-radius: 8px; font: 600 13px/18px Mulish, sans-serif; color: #11002b; cursor: pointer; }
    .ba-add-row:hover { background: #f8f7f9; }
    .ba-add-row mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .ba-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 24px; border-top: 1px solid #e9e7ed; }
    .ba-count { font: 500 12px/16px Mulish, sans-serif; color: #6d5f79; }
    .ba-actions { display: flex; gap: 8px; }
    .ba-btn { display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 16px; border: 1px solid #e9e7ed; border-radius: 8px; background: #fff; font: 600 13px/18px Mulish, sans-serif; color: #11002b; cursor: pointer; }
    .ba-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .ba-btn-ghost { background: transparent; border-color: transparent; }
    .ba-btn-ghost:hover { background: #f8f7f9; }
    .ba-btn-primary { background: #11002b; border-color: #11002b; color: #fff; }
    .ba-btn-primary:hover { background: #2a1547; }
    .ba-btn-primary:disabled { background: #f4f2f5; border-color: #f4f2f5; color: #a99db6; cursor: not-allowed; }
  `],
})
export class BulkAddDatesDialogComponent {
  private seq = 0;
  rows = signal<{ key: number; date: string; startTime: string; endDate: string; endTime: string }[]>([
    { key: this.seq++, date: '', startTime: '19:00', endDate: '', endTime: '22:00' },
  ]);

  validCount = computed(() => this.rows().filter(r => !!r.date).length);

  constructor(public ref: MatDialogRef<BulkAddDatesDialogComponent, BulkAddRow[] | undefined>) {}

  addRow() {
    this.rows.update(rs => [...rs, { key: this.seq++, date: '', startTime: '19:00', endDate: '', endTime: '22:00' }]);
  }
  removeRow(i: number) {
    this.rows.update(rs => rs.filter((_, idx) => idx !== i));
  }
  setField(i: number, field: 'date' | 'startTime' | 'endDate' | 'endTime', value: string) {
    this.rows.update(rs => rs.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  submit() {
    const result: BulkAddRow[] = this.rows()
      .filter(r => !!r.date)
      .map(r => ({ date: r.date, startTime: r.startTime, endDate: r.endDate || r.date, endTime: r.endTime }));
    if (result.length === 0) return;
    this.ref.close(result);
  }
  cancel() { this.ref.close(); }
}
