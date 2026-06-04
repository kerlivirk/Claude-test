import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { GaPoolDialogComponent, GaPool, GaPoolResult } from './ga-pool-dialog.component';

type SalesSource = 'biletomat' | 'external' | 'info-only';
type PricingModel = 'standard' | 'dynamic' | 'theater';
type FeeType = 'commission' | 'agency';
type SaleScheduleMode = 'date' | 'after';

interface TicketType {
  id: string;
  name: string;
}

export interface PriceCategory {
  id: string;
  ticketType: string;
  internalName: string;
  displayName: string;
  description: string;
  vatRate: string;
  vatExempt: boolean;
  pricingModel: PricingModel;
  basePrice: string;
  startPrice: string;
  endPrice: string;
  feeType: FeeType;
  feeAmount: string;
  matchCapacityWithSeats: boolean;
  capacity: string;
  /* Validity period */
  validityStart: string;
  validityEnd: string;
  /* Sale schedule: either a date window OR a cascade ("start after") */
  saleScheduleMode: SaleScheduleMode;
  saleStartDate: string;
  saleStartTime: string;
  saleEndDate: string;
  saleEndTime: string;
  startAfterSource: string;
  posOnly: boolean;
  personal: boolean;
  accessCodeRequired: boolean;
  marketplaceFee: string;
  embeddedFee: string;
  posFee: string;
  /* Sales (read-only overview) */
  reserved: number;
  sold: number;
}

let SEQ = 0;

function blankCategory(): PriceCategory {
  return {
    id: 'pc-' + SEQ++,
    ticketType: 'entrance',
    internalName: '',
    displayName: '',
    description: '',
    vatRate: '20',
    vatExempt: false,
    pricingModel: 'standard',
    basePrice: '',
    startPrice: '',
    endPrice: '',
    feeType: 'commission',
    feeAmount: '',
    matchCapacityWithSeats: false,
    capacity: '',
    validityStart: '',
    validityEnd: '',
    saleScheduleMode: 'date',
    saleStartDate: '',
    saleStartTime: '',
    saleEndDate: '',
    saleEndTime: '',
    startAfterSource: '',
    posOnly: false,
    personal: false,
    accessCodeRequired: false,
    marketplaceFee: '',
    embeddedFee: '',
    posFee: '',
    reserved: 0,
    sold: 0,
  };
}

@Component({
  selector: 'app-tickets-step',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatMenuModule],
  templateUrl: './tickets-step.component.html',
  styleUrl: './tickets-step.component.scss',
})
export class TicketsStepComponent {
  private dialog = inject(MatDialog);
  salesSource = signal<SalesSource>('biletomat');
  externalUrl = signal('');
  priceSummary = signal('');

  ticketTypes = signal<TicketType[]>([
    { id: 'entrance', name: 'Entrance' },
    { id: 'merchandise', name: 'Merchandise' },
  ]);
  addingType = signal(false);
  newTypeName = signal('');

  drafts = signal<PriceCategory[]>([blankCategory()]);
  /* one demo saved category so the sales overview is populated for testing */
  saved = signal<PriceCategory[]>([{
    ...blankCategory(),
    internalName: 'Standard Adult', displayName: 'Adult',
    basePrice: '25', feeAmount: '3', capacity: '500',
    saleStartDate: '2026-02-01', saleEndDate: '2026-04-18',
    reserved: 8, sold: 142,
  }]);

  /* Ticket sale period (event-level) */
  saleStartDate = signal('2026-02-01');
  saleStartTime = signal('10:00');
  saleEndDate = signal('2026-04-18');
  saleEndTime = signal('18:00');

  /* Places */
  placeType = signal<'ga' | 'seated'>('ga');
  poolCapacity = signal('');
  pools = signal<GaPool[]>([]);

  /* Ticket rules */
  minPerOrder = signal('1');
  maxPerOrder = signal('10');
  lowAvailability = signal(true);

  readonly pricingModels: { key: PricingModel; label: string }[] = [
    { key: 'standard', label: 'Standard' },
    { key: 'dynamic', label: 'Dynamic price' },
    { key: 'theater', label: 'Theater Pass' },
  ];

  showTickets = computed(() => this.salesSource() !== 'info-only');

  /* ---- ticket types ---- */
  startAddType() { this.addingType.set(true); this.newTypeName.set(''); }
  confirmAddType() {
    const name = this.newTypeName().trim();
    if (!name) { this.addingType.set(false); return; }
    const id = 'type-' + SEQ++;
    this.ticketTypes.update(t => [...t, { id, name }]);
    this.drafts.update(d => d.length ? d.map((c, i) => i === d.length - 1 ? { ...c, ticketType: id } : c) : d);
    this.addingType.set(false);
  }
  cancelAddType() { this.addingType.set(false); }

  /* ---- draft mutation ---- */
  patch(id: string, change: Partial<PriceCategory>) {
    this.drafts.update(list => list.map(c => c.id === id ? { ...c, ...change } : c));
  }
  addCategory() { this.drafts.update(d => [...d, blankCategory()]); }
  duplicateDraft(id: string) {
    this.drafts.update(d => {
      const src = d.find(c => c.id === id);
      if (!src) return d;
      return [...d, { ...src, id: 'pc-' + SEQ++, internalName: src.internalName ? src.internalName + ' (copy)' : '' }];
    });
  }
  removeDraft(id: string) {
    this.drafts.update(d => d.length > 1 ? d.filter(c => c.id !== id) : d);
  }
  canSave(c: PriceCategory) { return !!c.internalName.trim() && !!c.displayName.trim(); }
  addToEvent(id: string) {
    const c = this.drafts().find(x => x.id === id);
    if (!c || !this.canSave(c)) return;
    this.saved.update(s => [...s, c]);
    this.drafts.update(d => {
      const rest = d.filter(x => x.id !== id);
      return rest.length ? rest : [blankCategory()];
    });
  }

  /* ---- saved table ---- */
  editSaved(id: string) {
    const c = this.saved().find(x => x.id === id);
    if (!c) return;
    this.saved.update(s => s.filter(x => x.id !== id));
    this.drafts.update(d => [...d, c]);
  }
  duplicateSaved(id: string) {
    this.saved.update(s => {
      const src = s.find(c => c.id === id);
      if (!src) return s;
      return [...s, { ...src, id: 'pc-' + SEQ++, internalName: src.internalName + ' (copy)' }];
    });
  }
  deleteSaved(id: string) {
    this.saved.update(s => s.filter(x => x.id !== id));
  }

  typeName(id: string) { return this.ticketTypes().find(t => t.id === id)?.name ?? '—'; }

  /* ---- derived sales-table values ---- */
  num(v: string) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }
  surcharge(c: PriceCategory) { return this.num(c.feeAmount); }
  portalPrice(c: PriceCategory) {
    const base = this.num(c.basePrice);
    return c.feeType === 'agency' ? base + this.num(c.feeAmount) : base;
  }
  available(c: PriceCategory) {
    const cap = this.num(c.capacity);
    return cap ? Math.max(0, cap - c.sold - c.reserved) : 0;
  }

  /* category names usable as pool members (saved + drafts) */
  categoryNames = computed(() =>
    [...this.saved(), ...this.drafts()].map(c => c.displayName || c.internalName).filter(Boolean));

  /* Cascade sources: saved categories only, minus the current draft itself.
     A draft can only chain off a category that is already committed. */
  cascadeSources(currentId: string): string[] {
    return this.saved()
      .filter(c => c.id !== currentId)
      .map(c => c.displayName || c.internalName)
      .filter(Boolean);
  }

  /* Combine date + time into an ISO-ish key for window comparisons.
     Empty strings yield '' so callers can fall back to the event-level window. */
  private combine(date: string, time: string): string {
    if (!date) return '';
    return time ? `${date}T${time}` : `${date}T00:00`;
  }
  private eventStart(): string { return this.combine(this.saleStartDate(), this.saleStartTime()); }
  private eventEnd(): string { return this.combine(this.saleEndDate(), this.saleEndTime()); }

  /** Validation: per-category date window must sit inside the event-level window,
   *  and start must be before end. Returns the first error, or '' if valid.
   *  Only runs for mode 'date' — cascade mode has no dates to validate. */
  saleWindowError(c: PriceCategory): string {
    if (c.saleScheduleMode !== 'date') return '';
    const start = this.combine(c.saleStartDate, c.saleStartTime);
    const end = this.combine(c.saleEndDate, c.saleEndTime);
    if (start && end && start >= end) return 'Sale end must be after sale start.';
    const evStart = this.eventStart();
    const evEnd = this.eventEnd();
    if (start && evStart && start < evStart) return 'Sale start is before the event-level sale window opens.';
    if (end && evEnd && end > evEnd) return 'Sale end is after the event-level sale window closes.';
    return '';
  }

  /** Hint shown when a per-category window field is empty — it inherits the event-level window. */
  inheritsEventWindow(c: PriceCategory): boolean {
    if (c.saleScheduleMode !== 'date') return false;
    return !c.saleStartDate && !c.saleStartTime && !c.saleEndDate && !c.saleEndTime;
  }

  /** Format a category's effective sale start/end for the saved-overview table. */
  effectiveSaleStart(c: PriceCategory): string {
    if (c.saleScheduleMode === 'after') return c.startAfterSource ? `After "${c.startAfterSource}"` : 'After …';
    const start = this.combine(c.saleStartDate, c.saleStartTime) || this.eventStart();
    return start ? start.replace('T', ' ') : '—';
  }
  effectiveSaleEnd(c: PriceCategory): string {
    if (c.saleScheduleMode === 'after') return this.combine(c.saleEndDate, c.saleEndTime).replace('T', ' ') || '—';
    const end = this.combine(c.saleEndDate, c.saleEndTime) || this.eventEnd();
    return end ? end.replace('T', ' ') : '—';
  }

  /* ---- GA pools ---- */
  openPoolModal() {
    const ref = this.dialog.open(GaPoolDialogComponent, {
      width: '560px', maxWidth: '96vw', panelClass: 'series-config-dialog-panel',
      data: { categories: this.categoryNames() },
    });
    ref.afterClosed().subscribe((res: GaPoolResult | undefined) => {
      if (!res) return;
      this.pools.update(p => [...p, { id: 'pool-' + SEQ++, ...res }]);
    });
  }
  removePool(id: string) { this.pools.update(p => p.filter(x => x.id !== id)); }
}
