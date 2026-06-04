import { Component, Inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ShareOrganizer { id: string; name: string; email: string; }
export interface ShareResult {
  organizerIds: string[];
  permission: 'view' | 'edit';
}

@Component({
  selector: 'app-share-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  template: `
    <div class="sh-dialog">
      <header class="sh-head">
        <div>
          <h1>Share event</h1>
          <p>Share "{{ eventName }}" with other organizers.</p>
        </div>
        <button class="sh-close" (click)="cancel()" aria-label="Close"><mat-icon>Delete 1</mat-icon></button>
      </header>

      <div class="sh-body">
        <span class="sh-label">Permission</span>
        <div class="sh-perm">
          <button class="sh-seg" [class.active]="permission() === 'view'" (click)="permission.set('view')">Can view</button>
          <button class="sh-seg" [class.active]="permission() === 'edit'" (click)="permission.set('edit')">Can edit</button>
        </div>

        <span class="sh-label">Organizers</span>
        <div class="sh-search">
          <mat-icon>Magnifying Glass</mat-icon>
          <input type="text" [ngModel]="search()" (ngModelChange)="search.set($event)" placeholder="Search organizers…" />
        </div>

        <div class="sh-list">
          @for (o of filtered(); track o.id) {
            <button class="sh-org" [class.sel]="isSelected(o.id)" (click)="toggle(o.id)">
              <span class="sh-org-avatar">{{ o.name.charAt(0) }}</span>
              <span class="sh-org-info">
                <strong>{{ o.name }}</strong>
                <small>{{ o.email }}</small>
              </span>
              <mat-icon class="sh-org-check">{{ isSelected(o.id) ? 'Check Circle' : 'Circle' }}</mat-icon>
            </button>
          }
          @if (filtered().length === 0) { <div class="sh-empty">No organizers found</div> }
        </div>
      </div>

      <footer class="sh-foot">
        <span class="sh-count">{{ selected().size }} selected</span>
        <div class="sh-actions">
          <button class="sh-btn sh-btn-ghost" (click)="cancel()">Cancel</button>
          <button class="sh-btn sh-btn-primary" [disabled]="selected().size === 0" (click)="submit()">
            <mat-icon>Link Share 2</mat-icon>
            Share
          </button>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: Mulish, sans-serif; color: #11002b; }
    .sh-dialog { display: flex; flex-direction: column; background: #fff; width: min(460px, 96vw); max-height: 86vh; border-radius: 16px; overflow: hidden; }
    .sh-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 20px 24px 14px; border-bottom: 1px solid #e9e7ed; }
    .sh-head h1 { margin: 0 0 4px; font-family: 'Panel Sans', Mulish, sans-serif; font-weight: 800; font-size: 18px; line-height: 24px; }
    .sh-head p { margin: 0; font: 400 13px/18px Mulish, sans-serif; color: #6d5f79; }
    .sh-close { width: 32px; height: 32px; border: 0; background: transparent; border-radius: 8px; cursor: pointer; color: #11002b; display: inline-flex; align-items: center; justify-content: center; }
    .sh-close:hover { background: #f8f7f9; }
    .sh-close mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .sh-body { flex: 1; overflow-y: auto; padding: 16px 24px; }
    .sh-label { display: block; font: 500 12px/16px Mulish, sans-serif; color: #11002b; margin: 14px 0 6px; }
    .sh-label:first-child { margin-top: 0; }
    .sh-perm { display: inline-flex; gap: 4px; padding: 4px; background: #f4f2f5; border-radius: 10px; }
    .sh-seg { height: 30px; padding: 0 14px; border: 0; background: transparent; border-radius: 7px; font: 600 13px/18px Mulish, sans-serif; color: #6d5f79; cursor: pointer; }
    .sh-seg.active { background: #fff; color: #11002b; box-shadow: 0 1px 2px rgba(17,0,43,.1); }
    .sh-search { display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 12px; border: 1px solid #e9e7ed; border-radius: 8px; }
    .sh-search mat-icon { font-size: 16px; width: 16px; height: 16px; color: #6d5f79; }
    .sh-search input { flex: 1; border: 0; outline: none; font: 400 14px/20px Mulish, sans-serif; color: #11002b; }
    .sh-list { margin-top: 10px; display: flex; flex-direction: column; gap: 4px; }
    .sh-org { display: grid; grid-template-columns: 32px 1fr 20px; align-items: center; gap: 10px; padding: 8px 10px; background: transparent; border: 1px solid transparent; border-radius: 10px; cursor: pointer; text-align: left; }
    .sh-org:hover { background: #f8f7f9; }
    .sh-org.sel { border-color: #d6c9ea; background: #faf8ff; }
    .sh-org-avatar { width: 32px; height: 32px; border-radius: 9999px; background: linear-gradient(135deg, #7f56d9, #4b39a4); color: #fff; display: inline-flex; align-items: center; justify-content: center; font: 700 13px/1 Mulish, sans-serif; }
    .sh-org-info strong { display: block; font: 600 14px/18px Mulish, sans-serif; }
    .sh-org-info small { display: block; font: 400 12px/16px Mulish, sans-serif; color: #6d5f79; }
    .sh-org-check { font-size: 18px; width: 18px; height: 18px; color: #06d373; }
    .sh-org:not(.sel) .sh-org-check { color: #c1b9cc; }
    .sh-empty { padding: 16px; text-align: center; color: #6d5f79; font: 400 13px/18px Mulish, sans-serif; }
    .sh-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 24px; border-top: 1px solid #e9e7ed; }
    .sh-count { font: 500 12px/16px Mulish, sans-serif; color: #6d5f79; }
    .sh-actions { display: flex; gap: 8px; }
    .sh-btn { display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 16px; border: 1px solid #e9e7ed; border-radius: 8px; background: #fff; font: 600 13px/18px Mulish, sans-serif; color: #11002b; cursor: pointer; }
    .sh-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .sh-btn-ghost { background: transparent; border-color: transparent; }
    .sh-btn-ghost:hover { background: #f8f7f9; }
    .sh-btn-primary { background: #11002b; border-color: #11002b; color: #fff; }
    .sh-btn-primary:hover { background: #2a1547; }
    .sh-btn-primary:disabled { background: #f4f2f5; border-color: #f4f2f5; color: #a99db6; cursor: not-allowed; }
  `],
})
export class ShareDialogComponent {
  readonly eventName: string;
  readonly organizers: ShareOrganizer[];

  search = signal('');
  permission = signal<'view' | 'edit'>('view');
  selected = signal<Set<string>>(new Set());

  constructor(
    public ref: MatDialogRef<ShareDialogComponent, ShareResult | undefined>,
    @Inject(MAT_DIALOG_DATA) data: { eventName: string; organizers: ShareOrganizer[] },
  ) {
    this.eventName = data?.eventName ?? 'this event';
    this.organizers = data?.organizers ?? [];
  }

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    return this.organizers.filter(o => !q || o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q));
  });

  isSelected(id: string) { return this.selected().has(id); }
  toggle(id: string) {
    const s = new Set(this.selected());
    if (s.has(id)) s.delete(id); else s.add(id);
    this.selected.set(s);
  }

  submit() {
    if (this.selected().size === 0) return;
    this.ref.close({ organizerIds: [...this.selected()], permission: this.permission() });
  }
  cancel() { this.ref.close(); }
}
