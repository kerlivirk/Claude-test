import { Component, Inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  TranslationsFieldComponent,
  TransField,
  TransLanguage,
  TransValues,
} from '../../../shared/components/translations-field/translations-field.component';
import { PriceCategory } from './tickets-step.component';
import { GaPool } from './ga-pool-dialog.component';

/* Reuses the prototype's pricing-model / fee-type types via plain literals
   to avoid re-exporting them from tickets-step. */
type PricingModelKey = 'standard' | 'dynamic' | 'theater';

interface TicketType { id: string; name: string; }

export interface PriceCategoryDialogData {
  category: PriceCategory;
  isEdit: boolean;
  ticketTypes: TicketType[];
  pools: GaPool[];
  placeType: 'ga' | 'seated';
  languages: TransLanguage[];
  baseLang: string;
  // Event-level sale window used to compute "Leave empty to inherit" hint
  eventSaleWindow: { startDate: string; startTime: string; endDate: string; endTime: string };
  // Names of other saved categories — for the start-after-cascade dropdown
  cascadeSources: string[];
}

export type PriceCategoryDialogResult =
  | { action: 'save'; category: PriceCategory; newTypes: TicketType[] }
  | undefined;

@Component({
  selector: 'app-price-category-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, TranslationsFieldComponent],
  templateUrl: './price-category-dialog.component.html',
  styleUrl: './price-category-dialog.component.scss',
})
export class PriceCategoryDialogComponent {
  /* Working copy — mutated as the user fills the form, returned on Save.
     Initialised in the constructor so the injected `data` is available. */
  c = signal<PriceCategory>(null as unknown as PriceCategory);

  /* Local copy of ticket types so the user can add a new one inside the dialog
     without round-tripping. Any additions get returned to the parent on save. */
  ticketTypes = signal<TicketType[]>([]);
  private newTypes: TicketType[] = [];

  addingType = signal(false);
  newTypeName = signal('');

  readonly pricingModels: { key: PricingModelKey; label: string }[] = [
    { key: 'standard', label: 'Standard' },
    { key: 'dynamic', label: 'Dynamic price' },
    { key: 'theater', label: 'Theater Pass' },
  ];

  readonly displayNameFields: TransField[] = [
    { key: 'displayName', label: 'Displayed Name', placeholder: 'e.g. Weekend Animals · Standard ticket' },
  ];
  readonly descriptionFields: TransField[] = [
    { key: 'description', label: 'Additional description', multiline: true, placeholder: 'e.g. Sat 12:00 – Mon END, camping included' },
  ];

  constructor(
    public ref: MatDialogRef<PriceCategoryDialogComponent, PriceCategoryDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: PriceCategoryDialogData,
  ) {
    this.ref.addPanelClass('price-category-dialog-panel');
    this.c.set({ ...this.data.category });
    this.ticketTypes.set([...this.data.ticketTypes]);
  }

  /* ---- patching the working copy ---- */
  patch(change: Partial<PriceCategory>) {
    this.c.update(prev => ({ ...prev, ...change }));
  }

  /* ---- translation widget glue ---- */
  valuesForField(fieldKey: 'displayName' | 'description'): TransValues {
    const cat = this.c();
    const base = (cat[fieldKey] ?? '') as string;
    const out: TransValues = { [this.data.baseLang]: { [fieldKey]: base } };
    for (const [lang, fields] of Object.entries(cat.translations ?? {})) {
      if (lang === this.data.baseLang) continue;
      out[lang] = { [fieldKey]: fields[fieldKey] ?? '' };
    }
    return out;
  }
  applyFieldValues(fieldKey: 'displayName' | 'description', v: TransValues) {
    const cat = this.c();
    const base = v[this.data.baseLang]?.[fieldKey] ?? '';
    const nextTrans: TransValues = { ...(cat.translations ?? {}) };
    for (const [lang, fields] of Object.entries(v)) {
      if (lang === this.data.baseLang) continue;
      nextTrans[lang] = { ...(nextTrans[lang] ?? {}), [fieldKey]: fields[fieldKey] ?? '' };
    }
    this.patch({ [fieldKey]: base, translations: nextTrans } as Partial<PriceCategory>);
  }

  /* ---- ticket types ---- */
  startAddType() { this.addingType.set(true); this.newTypeName.set(''); }
  cancelAddType() { this.addingType.set(false); }
  confirmAddType() {
    const name = this.newTypeName().trim();
    if (!name) { this.addingType.set(false); return; }
    const id = 'type-' + Date.now();
    const t = { id, name };
    this.ticketTypes.update(list => [...list, t]);
    this.newTypes.push(t);
    this.patch({ ticketType: id });
    this.addingType.set(false);
  }

  /* ---- sale schedule ---- */
  private combine(date: string, time: string): string {
    if (!date) return '';
    return time ? `${date}T${time}` : `${date}T00:00`;
  }
  private eventStart() { return this.combine(this.data.eventSaleWindow.startDate, this.data.eventSaleWindow.startTime); }
  private eventEnd() { return this.combine(this.data.eventSaleWindow.endDate, this.data.eventSaleWindow.endTime); }

  saleWindowError(): string {
    const cat = this.c();
    if (cat.saleScheduleMode !== 'date') return '';
    const start = this.combine(cat.saleStartDate, cat.saleStartTime);
    const end = this.combine(cat.saleEndDate, cat.saleEndTime);
    if (start && end && start >= end) return 'Sale end must be after sale start.';
    const evStart = this.eventStart();
    const evEnd = this.eventEnd();
    if (start && evStart && start < evStart) return 'Sale start is before the event-level sale window opens.';
    if (end && evEnd && end > evEnd) return 'Sale end is after the event-level sale window closes.';
    return '';
  }
  inheritsEventWindow(): boolean {
    const cat = this.c();
    if (cat.saleScheduleMode !== 'date') return false;
    return !cat.saleStartDate && !cat.saleStartTime && !cat.saleEndDate && !cat.saleEndTime;
  }

  /* ---- footer actions ---- */
  canSave = computed(() => {
    const cat = this.c();
    return !!cat.internalName.trim() && !!cat.displayName.trim();
  });

  save() {
    if (!this.canSave()) return;
    this.ref.close({ action: 'save', category: this.c(), newTypes: this.newTypes });
  }
  cancel() { this.ref.close(); }
}
