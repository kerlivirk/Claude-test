import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface SyncConfirmData {
  fieldLabel: string;
  turningOn: boolean;
}

/**
 * Confirms turning the series-sync on/off for a single field, explaining what
 * each direction does before the user commits.
 */
@Component({
  selector: 'app-sync-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="sy-dialog">
      <header class="sy-head" [class.off]="!turningOn">
        <span class="sy-ico"><mat-icon>{{ turningOn ? 'Link Chain' : 'Block 1' }}</mat-icon></span>
        <div>
          <h1>{{ turningOn ? 'Sync “' + fieldLabel + '” with the series?' : 'Stop syncing “' + fieldLabel + '”?' }}</h1>
          <p>{{ turningOn ? 'It will follow the series automatically.' : 'It will become event-specific.' }}</p>
        </div>
      </header>

      <div class="sy-body">
        @if (turningOn) {
          <p>
            When <strong>synced</strong>, this field inherits its value from the series and
            updates automatically whenever the series changes. The value you entered for this
            event will be hidden while sync is on (you can switch back any time).
          </p>
        } @else {
          <p>
            Turning sync <strong>off</strong> lets you set this field just for this event.
            It will no longer change when the series is updated, and you'll be able to edit it
            directly here.
          </p>
        }
      </div>

      <footer class="sy-foot">
        <button class="sy-btn sy-btn-ghost" (click)="cancel()">Cancel</button>
        <button class="sy-btn sy-btn-primary" (click)="confirm()">
          <mat-icon>{{ turningOn ? 'Link Chain' : 'Check' }}</mat-icon>
          {{ turningOn ? 'Sync with series' : 'Turn off sync' }}
        </button>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: Mulish, sans-serif; color: #11002b; }
    .sy-dialog { display: flex; flex-direction: column; background: #fff; width: min(420px, 96vw); border-radius: 16px; overflow: hidden; }
    .sy-head { display: flex; align-items: flex-start; gap: 12px; padding: 20px 24px 14px; border-bottom: 1px solid #e9e7ed; }
    .sy-ico { width: 40px; height: 40px; flex-shrink: 0; border-radius: 10px; background: #f4ebff; color: #7f56d9; display: inline-flex; align-items: center; justify-content: center; }
    .sy-head.off .sy-ico { background: #f4f2f5; color: #6d5f79; }
    .sy-ico mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .sy-head h1 { margin: 0 0 4px; font-family: 'Panel Sans', Mulish, sans-serif; font-weight: 800; font-size: 16px; line-height: 22px; }
    .sy-head p { margin: 0; font: 400 13px/18px Mulish, sans-serif; color: #6d5f79; }
    .sy-body { padding: 16px 24px; }
    .sy-body p { margin: 0; font: 400 14px/21px Mulish, sans-serif; color: #11002b; }
    .sy-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 24px; border-top: 1px solid #e9e7ed; }
    .sy-btn { display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 16px; border: 1px solid #e9e7ed; border-radius: 8px; background: #fff; font: 600 13px/18px Mulish, sans-serif; color: #11002b; cursor: pointer; }
    .sy-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .sy-btn-ghost { background: transparent; border-color: transparent; }
    .sy-btn-ghost:hover { background: #f8f7f9; }
    .sy-btn-primary { background: #11002b; border-color: #11002b; color: #fff; }
    .sy-btn-primary:hover { background: #2a1547; }
  `],
})
export class SyncConfirmDialogComponent {
  readonly fieldLabel: string;
  readonly turningOn: boolean;

  constructor(
    public ref: MatDialogRef<SyncConfirmDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) data: SyncConfirmData,
  ) {
    this.fieldLabel = data?.fieldLabel ?? 'this field';
    this.turningOn = !!data?.turningOn;
  }

  confirm() { this.ref.close(true); }
  cancel() { this.ref.close(false); }
}
