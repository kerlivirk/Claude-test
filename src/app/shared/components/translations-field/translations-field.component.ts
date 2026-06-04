import { Component, OnInit, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export interface TransField { key: string; label: string; multiline?: boolean; placeholder?: string; }
export interface TransLanguage { code: string; name: string; }
export type TransValues = Record<string, Record<string, string>>;

/**
 * Inline, side-by-side translations (Directus-style). Each open language is a
 * column with a coloured language bar; the "+" on a bar opens another language
 * column next to it, and the language dropdown changes that column's language.
 */
@Component({
  selector: 'app-translations-field',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <span class="tf-title">Translations</span>
    <div class="tf-cols">
      @for (lang of cols(); track lang; let i = $index) {
        <div class="tf-col">
          <div class="tf-bar" [attr.data-c]="i % 4">
            <mat-icon class="tf-bar-ico">Translate Text</mat-icon>
            <span class="tf-lang-wrap">
              <select class="tf-lang" [ngModel]="lang" (ngModelChange)="changeLang(lang, $event)" [disabled]="disabled()">
                <option [value]="lang">{{ langName(lang) }}</option>
                @for (l of available(); track l.code) {
                  <option [value]="l.code">{{ l.name }}</option>
                }
              </select>
              <mat-icon class="tf-lang-caret">Tailless Line Arrow Down 1</mat-icon>
            </span>
            <span class="tf-spacer"></span>
            <button type="button" class="tf-bar-btn" (click)="addColumn()" [disabled]="disabled() || available().length === 0" title="Add language">
              <mat-icon>Add 1</mat-icon>
            </button>
            @if (i > 0) {
              <button type="button" class="tf-bar-btn" (click)="removeColumn(lang)" [disabled]="disabled()" title="Remove language">
                <mat-icon>Delete 1</mat-icon>
              </button>
            }
          </div>

          @for (f of fields(); track f.key) {
            <div class="tf-field">
              <span class="tf-field-label">
                <span class="tf-req">*</span> {{ f.label }}
                <span class="tf-pill" [attr.data-c]="i % 4">{{ langName(lang) }}</span>
              </span>
              @if (f.multiline) {
                <textarea class="tf-input" rows="3" [disabled]="disabled()"
                  [ngModel]="getVal(lang, f.key)" (ngModelChange)="setVal(lang, f.key, $event)"
                  [placeholder]="f.placeholder || ''"></textarea>
              } @else {
                <input class="tf-input" type="text" [disabled]="disabled()"
                  [ngModel]="getVal(lang, f.key)" (ngModelChange)="setVal(lang, f.key, $event)"
                  [placeholder]="f.placeholder || ''" />
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .tf-title { display: block; font: 700 12px/16px Mulish, sans-serif; color: #11002b; margin-bottom: 6px; }
    .tf-cols { display: flex; gap: 16px; flex-wrap: wrap; }
    .tf-col { flex: 1 1 280px; min-width: 240px; }
    .tf-bar {
      display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 8px 0 14px;
      border-radius: 8px; margin-bottom: 12px;
    }
    .tf-bar[data-c="0"] { background: #ddfbea; }
    .tf-bar[data-c="1"] { background: #fde7f5; }
    .tf-bar[data-c="2"] { background: #e3f0ff; }
    .tf-bar[data-c="3"] { background: #fef0d9; }
    .tf-bar-ico { font-size: 18px; width: 18px; height: 18px; }
    .tf-bar[data-c="0"] .tf-bar-ico, .tf-bar[data-c="0"] .tf-lang, .tf-bar[data-c="0"] .tf-lang-caret { color: #19633d; }
    .tf-bar[data-c="1"] .tf-bar-ico, .tf-bar[data-c="1"] .tf-lang, .tf-bar[data-c="1"] .tf-lang-caret { color: #9e2768; }
    .tf-bar[data-c="2"] .tf-bar-ico, .tf-bar[data-c="2"] .tf-lang, .tf-bar[data-c="2"] .tf-lang-caret { color: #1d4ed8; }
    .tf-bar[data-c="3"] .tf-bar-ico, .tf-bar[data-c="3"] .tf-lang, .tf-bar[data-c="3"] .tf-lang-caret { color: #b45309; }
    .tf-lang-wrap { position: relative; display: inline-flex; align-items: center; }
    .tf-lang {
      appearance: none; -webkit-appearance: none;
      border: 1px solid rgba(17,0,43,0.16); background: rgba(255,255,255,0.85);
      border-radius: 8px; height: 30px; padding: 0 30px 0 10px;
      font: 700 13px/1 Mulish, sans-serif; cursor: pointer; outline: none;
    }
    .tf-lang:hover:not(:disabled) { border-color: rgba(17,0,43,0.34); background: #fff; }
    .tf-lang:focus { border-color: rgba(17,0,43,0.5); }
    .tf-lang:disabled { cursor: default; opacity: .65; }
    .tf-lang-caret { position: absolute; right: 9px; top: 50%; transform: translateY(-50%); font-size: 14px; width: 14px; height: 14px; pointer-events: none; }
    .tf-spacer { flex: 1; }
    .tf-bar-btn {
      width: 28px; height: 28px; border: 0; background: rgba(255,255,255,0.6);
      border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
      color: inherit;
    }
    .tf-bar[data-c="0"] .tf-bar-btn { color: #19633d; }
    .tf-bar[data-c="1"] .tf-bar-btn { color: #9e2768; }
    .tf-bar[data-c="2"] .tf-bar-btn { color: #1d4ed8; }
    .tf-bar[data-c="3"] .tf-bar-btn { color: #b45309; }
    .tf-bar-btn:hover:not(:disabled) { background: rgba(255,255,255,0.9); }
    .tf-bar-btn:disabled { opacity: .4; cursor: not-allowed; }
    .tf-bar-btn mat-icon { font-size: 15px; width: 15px; height: 15px; }
    .tf-field { margin-bottom: 12px; }
    .tf-field-label { display: inline-flex; align-items: center; gap: 6px; font: 500 12px/16px Mulish, sans-serif; color: #11002b; margin-bottom: 6px; }
    .tf-req { color: #d92d20; }
    .tf-pill { height: 18px; padding: 0 6px; border-radius: 9999px; font: 600 10px/18px Mulish, sans-serif; }
    .tf-pill[data-c="0"] { background: #ddfbea; color: #19633d; }
    .tf-pill[data-c="1"] { background: #fde7f5; color: #9e2768; }
    .tf-pill[data-c="2"] { background: #e3f0ff; color: #1d4ed8; }
    .tf-pill[data-c="3"] { background: #fef0d9; color: #b45309; }
    .tf-input {
      width: 100%; padding: 0 12px; height: 40px; border: 1px solid #e9e7ed; border-radius: 8px;
      font: 400 14px/20px Mulish, sans-serif; color: #11002b; outline: none;
    }
    textarea.tf-input { height: auto; padding: 10px 12px; resize: vertical; }
    .tf-input:focus { border-color: #11002b; }
    .tf-input:disabled { background: #f8f7f9; color: #6d5f79; cursor: not-allowed; }
  `],
})
export class TranslationsFieldComponent implements OnInit {
  fields = input<TransField[]>([]);
  languages = input<TransLanguage[]>([]);
  baseLang = input<string>('en');
  disabled = input<boolean>(false);
  values = input<TransValues>({});
  valuesChange = output<TransValues>();

  cols = signal<string[]>([]);

  ngOnInit() {
    const base = this.baseLang();
    const present = Object.keys(this.values()).filter(c => c !== base);
    this.cols.set([base, ...present]);
  }

  langName(code: string) { return this.languages().find(l => l.code === code)?.name ?? code; }

  available = computed(() => {
    const open = new Set(this.cols());
    return this.languages().filter(l => !open.has(l.code));
  });

  getVal(lang: string, key: string) { return this.values()[lang]?.[key] ?? ''; }

  setVal(lang: string, key: string, v: string) {
    const next: TransValues = { ...this.values(), [lang]: { ...(this.values()[lang] ?? {}), [key]: v } };
    this.valuesChange.emit(next);
  }

  addColumn() {
    const add = this.available()[0];
    if (!add) return;
    this.cols.update(c => [...c, add.code]);
  }

  removeColumn(lang: string) {
    if (lang === this.baseLang()) return;
    this.cols.update(c => c.filter(x => x !== lang));
    const next = { ...this.values() };
    delete next[lang];
    this.valuesChange.emit(next);
  }

  changeLang(oldCode: string, newCode: string) {
    if (oldCode === newCode) return;
    this.cols.update(c => c.map(x => (x === oldCode ? newCode : x)));
    const next = { ...this.values() };
    if (next[oldCode]) { next[newCode] = next[oldCode]; delete next[oldCode]; }
    this.valuesChange.emit(next);
  }
}
