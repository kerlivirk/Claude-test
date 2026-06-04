import { Component, computed, input, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

/**
 * Multi-select dropdown with a search box and an option list that opens on click.
 * Value is a comma-separated string so it drops into existing string signals.
 */
@Component({
  selector: 'app-search-select',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="ss" [class.open]="open()" [class.disabled]="disabled()">
      <button type="button" class="ss-control" [disabled]="disabled()" (click)="toggle()">
        @if (selected().length) {
          <span class="ss-chips">
            @for (v of selected(); track v) {
              <span class="ss-chip">
                {{ v }}
                <mat-icon (click)="remove(v, $event)">Delete 1</mat-icon>
              </span>
            }
          </span>
        } @else {
          <span class="ss-placeholder">{{ placeholder() }}</span>
        }
        <mat-icon class="ss-caret">Tailless Line Arrow Down 1</mat-icon>
      </button>

      @if (open()) {
        <div class="ss-backdrop" (click)="close()"></div>
        <div class="ss-panel">
          <div class="ss-search">
            <mat-icon>Magnifying Glass</mat-icon>
            <input type="text" [ngModel]="search()" (ngModelChange)="search.set($event)" [placeholder]="searchPlaceholder()" />
          </div>
          <div class="ss-list">
            @for (o of filtered(); track o) {
              <button type="button" class="ss-option" [class.sel]="isSelected(o)" (click)="pick(o)">
                <span>{{ o }}</span>
                @if (isSelected(o)) { <mat-icon>Check</mat-icon> }
              </button>
            }
            @if (filtered().length === 0) {
              @if (allowCreate() && search().trim()) {
                <button type="button" class="ss-create" (click)="createOption()">
                  <mat-icon>Add 1</mat-icon> Create "{{ search().trim() }}"
                </button>
              } @else {
                <div class="ss-empty">No matches</div>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ss { position: relative; font-family: Mulish, sans-serif; }
    .ss-control {
      display: flex; align-items: center; gap: 8px; width: 100%; min-height: 40px;
      padding: 4px 10px 4px 12px; background: #fff; border: 1px solid #e9e7ed;
      border-radius: 8px; cursor: pointer; text-align: left;
    }
    .ss.open .ss-control { border-color: #11002b; }
    .ss.disabled .ss-control { background: #f8f7f9; cursor: not-allowed; }
    .ss-placeholder { flex: 1; color: #6d5f79; font: 400 14px/20px Mulish, sans-serif; }
    .ss-chips { flex: 1; display: flex; flex-wrap: wrap; gap: 6px; }
    .ss-chip {
      display: inline-flex; align-items: center; gap: 4px; height: 24px; padding: 0 4px 0 10px;
      background: #f4f2f5; border-radius: 9999px; font: 600 12px/16px Mulish, sans-serif; color: #11002b;
      mat-icon { font-size: 13px; width: 13px; height: 13px; color: #6d5f79; cursor: pointer; }
      mat-icon:hover { color: #b3261e; }
    }
    .ss-caret { font-size: 16px; width: 16px; height: 16px; color: #6d5f79; flex-shrink: 0; }
    .ss-backdrop { position: fixed; inset: 0; z-index: 40; }
    .ss-panel {
      position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 41;
      background: #fff; border: 1px solid #e9e7ed; border-radius: 10px;
      box-shadow: 0 12px 32px -12px rgba(17,0,43,.25); overflow: hidden;
    }
    .ss-search {
      display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid #efefef;
      mat-icon { font-size: 16px; width: 16px; height: 16px; color: #6d5f79; }
      input { flex: 1; border: 0; outline: none; font: 400 14px/20px Mulish, sans-serif; color: #11002b; }
    }
    .ss-list { max-height: 240px; overflow-y: auto; padding: 6px; }
    .ss-option {
      display: flex; align-items: center; justify-content: space-between; width: 100%;
      padding: 9px 10px; background: transparent; border: 0; border-radius: 8px; cursor: pointer;
      font: 500 14px/20px Mulish, sans-serif; color: #11002b; text-align: left;
      mat-icon { font-size: 16px; width: 16px; height: 16px; color: #06d373; }
    }
    .ss-option:hover { background: #f8f7f9; }
    .ss-option.sel { color: #11002b; font-weight: 700; }
    .ss-create {
      display: flex; align-items: center; gap: 6px; width: 100%; padding: 10px;
      background: transparent; border: 0; border-radius: 8px; cursor: pointer;
      font: 600 13px/18px Mulish, sans-serif; color: #7f56d9;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &:hover { background: #f8f7f9; }
    }
    .ss-empty { padding: 12px; text-align: center; color: #6d5f79; font: 400 13px/18px Mulish, sans-serif; }
  `],
})
export class SearchSelectComponent {
  options = input<string[]>([]);
  value = model<string>('');               // comma-separated
  placeholder = input('Select…');
  searchPlaceholder = input('Search…');
  allowCreate = input(false);
  disabled = input(false);

  open = signal(false);
  search = signal('');
  private extra = signal<string[]>([]);     // created options

  selected = computed<string[]>(() =>
    this.value().split(',').map(s => s.trim()).filter(Boolean));

  private allOptions = computed(() => {
    const set = new Set([...this.options(), ...this.extra()]);
    return [...set];
  });

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    return this.allOptions().filter(o => !q || o.toLowerCase().includes(q));
  });

  isSelected(o: string) { return this.selected().includes(o); }

  toggle() { if (this.disabled()) return; this.open.update(v => !v); if (!this.open()) this.search.set(''); }
  close() { this.open.set(false); this.search.set(''); }

  pick(o: string) {
    const cur = this.selected();
    const next = cur.includes(o) ? cur.filter(x => x !== o) : [...cur, o];
    this.value.set(next.join(', '));
  }
  remove(o: string, ev: Event) {
    ev.stopPropagation();
    this.value.set(this.selected().filter(x => x !== o).join(', '));
  }
  createOption() {
    const name = this.search().trim();
    if (!name) return;
    if (!this.allOptions().includes(name)) this.extra.update(e => [...e, name]);
    this.pick(name);
    this.search.set('');
  }
}
