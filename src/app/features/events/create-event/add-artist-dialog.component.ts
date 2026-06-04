import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ARTIST_DB, MockArtist, gradientForName } from '../../../shared/models/artists';

export interface AddArtistResult { name: string; avatar: string; }

@Component({
  selector: 'app-add-artist-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  template: `
    <div class="aa-dialog">
      <header class="aa-head">
        <h1>Add artist</h1>
        <button class="aa-close" (click)="cancel()" aria-label="Close"><mat-icon>Delete 1</mat-icon></button>
      </header>

      <div class="aa-body">
        <span class="aa-label">Search or create</span>
        <div class="aa-search">
          <mat-icon>Magnifying Glass</mat-icon>
          <input type="text" [ngModel]="search()" (ngModelChange)="search.set($event)" placeholder="Band name" autofocus />
        </div>

        <div class="aa-list">
          @for (a of filtered(); track a.id) {
            <button class="aa-item" [class.sel]="picked()?.name === a.name" (click)="select(a)">
              <span class="aa-avatar" [style.background]="a.avatar">{{ a.name.charAt(0) }}</span>
              <span class="aa-name">{{ a.name }}</span>
              @if (picked()?.name === a.name) { <mat-icon>Check</mat-icon> }
            </button>
          }
          @if (showCreate()) {
            <button class="aa-create" [class.sel]="picked()?.name === search().trim()" (click)="selectCreate()">
              <mat-icon>Add 1</mat-icon>
              Create "{{ search().trim() }}"
              <span class="aa-new">New</span>
            </button>
          }
          @if (filtered().length === 0 && !showCreate()) {
            <div class="aa-empty">Type a band name to search or create</div>
          }
        </div>
      </div>

      <footer class="aa-foot">
        <button class="aa-btn aa-btn-ghost" (click)="cancel()">Cancel</button>
        <button class="aa-btn aa-btn-primary" [disabled]="!picked()" (click)="save()">Save</button>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: Mulish, sans-serif; color: #11002b; }
    .aa-dialog { display: flex; flex-direction: column; background: #fff; width: min(420px, 96vw); max-height: 80vh; border-radius: 16px; overflow: hidden; }
    .aa-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px 12px; border-bottom: 1px solid #e9e7ed; }
    .aa-head h1 { margin: 0; font-family: 'Panel Sans', Mulish, sans-serif; font-weight: 800; font-size: 18px; line-height: 24px; }
    .aa-close { width: 32px; height: 32px; border: 0; background: transparent; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
    .aa-close:hover { background: #f8f7f9; }
    .aa-close mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .aa-body { flex: 1; overflow-y: auto; padding: 16px 24px; }
    .aa-label { display: block; font: 500 12px/16px Mulish, sans-serif; margin-bottom: 6px; }
    .aa-search { display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 12px; border: 1px solid #e9e7ed; border-radius: 8px; }
    .aa-search mat-icon { font-size: 16px; width: 16px; height: 16px; color: #6d5f79; }
    .aa-search input { flex: 1; border: 0; outline: none; font: 400 14px/20px Mulish, sans-serif; color: #11002b; }
    .aa-list { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
    .aa-item { display: grid; grid-template-columns: 30px 1fr 18px; align-items: center; gap: 10px; padding: 8px 10px; background: transparent; border: 1px solid transparent; border-radius: 8px; cursor: pointer; text-align: left; font: 500 14px/20px Mulish, sans-serif; }
    .aa-item:hover { background: #f8f7f9; }
    .aa-item.sel { border-color: #d6c9ea; background: #faf8ff; }
    .aa-avatar { width: 30px; height: 30px; border-radius: 9999px; color: #fff; display: inline-flex; align-items: center; justify-content: center; font: 700 12px/1 Mulish, sans-serif; }
    .aa-item mat-icon { font-size: 16px; width: 16px; height: 16px; color: #06d373; }
    .aa-create { display: flex; align-items: center; gap: 8px; padding: 10px; background: transparent; border: 1px dashed #c1b9cc; border-radius: 8px; cursor: pointer; font: 600 13px/18px Mulish, sans-serif; color: #7f56d9; }
    .aa-create.sel { background: #faf8ff; }
    .aa-create mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .aa-new { margin-left: auto; height: 18px; padding: 0 8px; background: #f4ebff; color: #7f56d9; border-radius: 9999px; font: 700 10px/18px Mulish, sans-serif; }
    .aa-empty { padding: 14px; text-align: center; color: #6d5f79; font: 400 13px/18px Mulish, sans-serif; }
    .aa-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 24px; border-top: 1px solid #e9e7ed; }
    .aa-btn { height: 40px; padding: 0 18px; border: 1px solid #e9e7ed; border-radius: 8px; background: #fff; font: 600 13px/18px Mulish, sans-serif; color: #11002b; cursor: pointer; }
    .aa-btn-ghost { background: transparent; border-color: transparent; }
    .aa-btn-ghost:hover { background: #f8f7f9; }
    .aa-btn-primary { background: #11002b; border-color: #11002b; color: #fff; }
    .aa-btn-primary:disabled { background: #f4f2f5; border-color: #f4f2f5; color: #a99db6; cursor: not-allowed; }
  `],
})
export class AddArtistDialogComponent {
  readonly db: MockArtist[] = ARTIST_DB;
  search = signal('');
  picked = signal<AddArtistResult | null>(null);

  constructor(public ref: MatDialogRef<AddArtistDialogComponent, AddArtistResult | undefined>) {}

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    return this.db.filter(a => !q || a.name.toLowerCase().includes(q));
  });

  showCreate = computed(() => {
    const q = this.search().trim();
    return !!q && !this.db.some(a => a.name.toLowerCase() === q.toLowerCase());
  });

  select(a: MockArtist) { this.picked.set({ name: a.name, avatar: a.avatar }); }
  selectCreate() {
    const name = this.search().trim();
    this.picked.set({ name, avatar: gradientForName(name) });
  }

  save() { if (this.picked()) this.ref.close(this.picked()!); }
  cancel() { this.ref.close(); }
}
