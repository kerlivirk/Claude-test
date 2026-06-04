import { Component, Inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface GaPoolResult {
  categories: string[];
  capacity: string;
  name: string;
}
export interface GaPool extends GaPoolResult { id: string; }

@Component({
  selector: 'app-ga-pool-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  template: `
    <div class="gp-dialog">
      <header class="gp-head">
        <h1>Add general admission pool</h1>
        <button class="gp-close" (click)="cancel()" aria-label="Close"><mat-icon>Delete 1</mat-icon></button>
      </header>

      <div class="gp-body">
        <div class="gp-info">
          <strong>General admission pools</strong> let you set a combined limit across multiple price categories.
          <div class="gp-eg">
            Example: "Normal" 500 + "Discount" 500 with a pool limit of 500 → up to 500 tickets total across both.
          </div>
        </div>

        <span class="gp-label">Price categories in this pool</span>
        <small class="gp-help">Select which price categories share this pool limit</small>
        <div class="gp-cats">
          @for (c of categories; track c) {
            <label class="gp-cat">
              <input type="checkbox" [checked]="picked().has(c)" (change)="toggle(c)" />
              <span>{{ c }}</span>
            </label>
          }
          @if (categories.length === 0) {
            <div class="gp-empty">Add price categories first to pool them.</div>
          }
        </div>

        <span class="gp-label">Pool capacity (combined limit for all selected categories)</span>
        <small class="gp-help">The maximum total tickets that can be sold across all price categories in this pool</small>
        <input class="gp-input" type="number" [ngModel]="capacity()" (ngModelChange)="capacity.set($event)" placeholder="e.g. 500" />

        <span class="gp-label">Pool name (optional)</span>
        <input class="gp-input" type="text" [ngModel]="name()" (ngModelChange)="name.set($event)" placeholder="e.g. Main pool" />
      </div>

      <footer class="gp-foot">
        <button class="gp-btn gp-btn-ghost" (click)="cancel()">Discard</button>
        <button class="gp-btn gp-btn-primary" [disabled]="!canSave()" (click)="save()"><mat-icon>Check</mat-icon> Save</button>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: Mulish, sans-serif; color: #11002b; }
    .gp-dialog { display: flex; flex-direction: column; background: #fff; width: min(560px, 96vw); max-height: 88vh; border-radius: 16px; overflow: hidden; }
    .gp-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px 12px; border-bottom: 1px solid #e9e7ed; }
    .gp-head h1 { margin: 0; font-family: 'Panel Sans', Mulish, sans-serif; font-weight: 800; font-size: 18px; line-height: 24px; }
    .gp-close { width: 32px; height: 32px; border: 0; background: transparent; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
    .gp-close:hover { background: #f8f7f9; }
    .gp-close mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .gp-body { flex: 1; overflow-y: auto; padding: 16px 24px; }
    .gp-info { padding: 14px; background: #eef3ff; border-radius: 10px; font: 400 13px/19px Mulish, sans-serif; color: #2a4a8a; margin-bottom: 16px; }
    .gp-eg { margin-top: 8px; padding: 10px; background: #fff; border-radius: 8px; font-size: 12px; line-height: 18px; }
    .gp-label { display: block; font: 600 13px/18px Mulish, sans-serif; margin: 14px 0 2px; }
    .gp-help { display: block; font: 400 12px/16px Mulish, sans-serif; color: #6d5f79; margin-bottom: 8px; }
    .gp-cats { display: flex; flex-direction: column; gap: 6px; border: 1px solid #e9e7ed; border-radius: 8px; padding: 8px; }
    .gp-cat { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; font: 500 14px/20px Mulish, sans-serif; cursor: pointer; }
    .gp-cat:hover { background: #f8f7f9; }
    .gp-cat input { width: 16px; height: 16px; accent-color: #11002b; }
    .gp-empty { padding: 10px; text-align: center; color: #6d5f79; font: 400 13px/18px Mulish, sans-serif; }
    .gp-input { width: 100%; height: 40px; padding: 0 12px; border: 1px solid #e9e7ed; border-radius: 8px; font: 400 14px/20px Mulish, sans-serif; color: #11002b; outline: none; }
    .gp-input:focus { border-color: #11002b; }
    .gp-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 24px; border-top: 1px solid #e9e7ed; }
    .gp-btn { display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 18px; border: 1px solid #e9e7ed; border-radius: 8px; background: #fff; font: 600 13px/18px Mulish, sans-serif; color: #11002b; cursor: pointer; }
    .gp-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .gp-btn-ghost { background: transparent; border-color: transparent; }
    .gp-btn-ghost:hover { background: #f8f7f9; }
    .gp-btn-primary { background: #06d373; border-color: #06d373; color: #002b1a; }
    .gp-btn-primary:hover { background: #04a85b; }
    .gp-btn-primary:disabled { background: #f4f2f5; border-color: #f4f2f5; color: #a99db6; cursor: not-allowed; }
  `],
})
export class GaPoolDialogComponent {
  readonly categories: string[];
  picked = signal<Set<string>>(new Set());
  capacity = signal('');
  name = signal('');

  constructor(
    public ref: MatDialogRef<GaPoolDialogComponent, GaPoolResult | undefined>,
    @Inject(MAT_DIALOG_DATA) data: { categories: string[] },
  ) {
    this.categories = data?.categories ?? [];
  }

  toggle(c: string) {
    const s = new Set(this.picked());
    if (s.has(c)) s.delete(c); else s.add(c);
    this.picked.set(s);
  }

  canSave = computed(() => this.picked().size > 0 && !!this.capacity().trim());

  save() {
    if (!this.canSave()) return;
    this.ref.close({ categories: [...this.picked()], capacity: this.capacity(), name: this.name() });
  }
  cancel() { this.ref.close(); }
}
