import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { GaPoolDialogComponent, GaPool, GaPoolResult } from './ga-pool-dialog.component';
import {
  PriceCategoryDialogComponent,
  PriceCategoryDialogData,
  PriceCategoryDialogResult,
} from './price-category-dialog.component';
import {
  TransLanguage,
  TransValues,
} from '../../../shared/components/translations-field/translations-field.component';

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
  /* Pool this category pulls from (GA events only). Empty / undefined means
     "unassigned" — surfaced as a warning in the sales overview. */
  poolId?: string;
  /* Per-language translations of displayName + description.
     Shape: { en: { displayName: '…', description: '…' }, et: {...}, ... }.
     The base-lang (en) values mirror the live displayName / description on
     this category and are derived at render time. */
  translations: TransValues;
  /* Sales (read-only overview) */
  reserved: number;
  sold: number;
}

let SEQ = 0;

function blankCategory(): PriceCategory {
  return {
    id: 'pc-' + SEQ++,
    ticketType: 'standard',
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
    poolId: 'pool-default',
    translations: {},
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
  /* Translations (per Price Category — Displayed Name + Additional description) */
  readonly baseLang = 'en';
  readonly languages: TransLanguage[] = [
    { code: 'en', name: 'English' },
    { code: 'et', name: 'Estonian' },
    { code: 'lv', name: 'Latvian' },
    { code: 'lt', name: 'Lithuanian' },
    { code: 'pl', name: 'Polish' },
    { code: 'ru', name: 'Russian' },
    { code: 'fi', name: 'Finnish' },
  ];
  private dialog = inject(MatDialog);
  salesSource = signal<SalesSource>('biletomat');
  externalUrl = signal('');
  priceSummary = signal('');

  /** Reusable ticket-type definitions. Mirrors the production Bilietailt list
   *  (Polish names translated to English). Each Price Category references one
   *  of these — defaults inherit VAT, electronic-ticket description and
   *  portal-presentation from the type record. */
  ticketTypes = signal<TicketType[]>([
    { id: 'standard', name: 'Standard ticket' },
    { id: 'reduced', name: 'Reduced ticket' },
    { id: 'employee', name: 'Employee ticket' },
    { id: 'invitation', name: 'Invitation' },
    { id: 'season-pass', name: 'Season pass' },
    { id: 'support', name: 'Support' },
    { id: 'entry-pass', name: 'Entry pass' },
    { id: 'online-access', name: 'Online access' },
    { id: 'other', name: 'Other' },
  ]);
  /** View mode for the saved-categories sales overview.
   *  - 'cards' — flat grid of cards
   *  - 'table' — dense row table
   *  - 'pool'  — cards grouped under their parent pool, with pool-level rollups */
  savedView = signal<'cards' | 'table' | 'pool'>('cards');

  /** Pool lookup by id — convenience for the by-pool grouping + per-card chips. */
  poolName(id?: string): string {
    if (!id) return 'Unassigned';
    return this.pools().find(p => p.id === id)?.name ?? 'Unassigned';
  }

  /** Grouped view: returns [{ pool, categories: PriceCategory[] }, …] plus an
   *  "Unassigned" bucket for any category without a poolId. Used by the
   *  "By pool" mode in the sales overview. */
  groupedSavedByPool = computed(() => {
    const cats = this.saved();
    const pools = this.pools();
    const groups = pools.map(pool => ({
      pool,
      categories: cats.filter(c => c.poolId === pool.id),
    }));
    const orphans = cats.filter(c => !c.poolId || !pools.some(p => p.id === c.poolId));
    if (orphans.length) {
      groups.push({
        pool: { id: '__orphan', name: 'Unassigned', capacity: '', categories: [] } as GaPool,
        categories: orphans,
      });
    }
    return groups;
  });

  /** Language the Sales overview displays category names in. Defaults to
   *  English; user can switch via the dropdown in the section header. */
  viewLang = signal<string>('en');

  /** Languages that appear in the dropdown — base lang always first, then
   *  any language at least one saved category has a translation for. */
  availableLanguages = computed<TransLanguage[]>(() => {
    const present = new Set<string>([this.baseLang]);
    for (const c of this.saved()) {
      for (const lang of Object.keys(c.translations ?? {})) {
        if ((c.translations as TransValues)[lang]?.['displayName']) present.add(lang);
      }
    }
    return this.languages.filter(l => present.has(l.code));
  });

  /** Displayed name for a category in the selected language, falling back to
   *  the base displayName if no translation exists. */
  nameInLang(c: PriceCategory, lang: string): string {
    if (lang === this.baseLang) return c.displayName;
    return c.translations?.[lang]?.['displayName'] || c.displayName;
  }

  /** True when the displayed name for the current view-lang is the
   *  fallback (not translated). UI uses this to render a muted "(EN)" pill. */
  isFallback(c: PriceCategory, lang: string): boolean {
    if (lang === this.baseLang) return false;
    return !c.translations?.[lang]?.['displayName'];
  }

  /** Highlight id — set briefly after a category is added to Event so the
   *  user can spot the new row in the Sales overview below. */
  justAddedId = signal<string>('');

  /** Per-pool rollup: total sold + reserved across its categories. */
  poolRollup(poolId: string) {
    const cats = this.saved().filter(c => c.poolId === poolId);
    return {
      sold: cats.reduce((s, c) => s + c.sold, 0),
      reserved: cats.reduce((s, c) => s + c.reserved, 0),
      categoryCount: cats.length,
    };
  }
  /* Seeded saved categories — varied real-world examples (translated from
   *  production names) so the overview table demonstrates the range of
   *  naming patterns organisers actually use: brand-style (Weekend Animals,
   *  Lazy Cows), descriptive (Early Bird), and simple (Standard ticket). */
  saved = signal<PriceCategory[]>([
    {
      ...blankCategory(),
      internalName: 'Weekend Animals · 100 pcs until 21.07.2026',
      displayName: 'Weekend Animals',
      description: 'Sat 12:00 – Mon END, camping included',
      ticketType: 'standard',
      poolId: 'pool-default',
      basePrice: '500', feeAmount: '0', capacity: '100',
      saleStartDate: '2026-01-12', saleEndDate: '2026-07-21',
      reserved: 0, sold: 0,
      translations: {
        et: { displayName: 'Nädalavahetuse loomad', description: 'L 12:00 – E LÕPP, telkimine sees' },
        pl: { displayName: 'Zwierzęta weekendu', description: 'Sob 12:00 – Pon KONIEC, camping w cenie' },
      },
    },
    {
      ...blankCategory(),
      internalName: 'Lazy Cows · Pool IV · 370 pcs until 21.07.2026 end of day',
      displayName: 'Lazy Cows',
      description: 'Includes festival camping and welcome drink',
      ticketType: 'standard',
      poolId: 'pool-default',
      basePrice: '540', feeAmount: '0', capacity: '370',
      saleStartDate: '2026-06-02', saleEndDate: '2026-07-21',
      reserved: 0, sold: 0,
    },
    {
      ...blankCategory(),
      internalName: 'Early Bird · 200 pcs',
      displayName: 'Early Bird',
      description: 'Limited release, while stocks last',
      ticketType: 'standard',
      poolId: 'pool-default',
      basePrice: '349', feeAmount: '0', capacity: '200',
      saleStartDate: '2026-02-01', saleEndDate: '2026-03-31',
      reserved: 8, sold: 192,
    },
    {
      ...blankCategory(),
      internalName: 'Student · under 26',
      displayName: 'Student ticket',
      description: 'Valid student ID required at entry. Under 26 only.',
      ticketType: 'reduced',
      poolId: 'pool-vip',
      basePrice: '199', feeAmount: '0', capacity: '150',
      saleStartDate: '2026-02-01', saleEndDate: '2026-07-21',
      reserved: 3, sold: 42,
    },
  ]);

  /* Ticket sale period (event-level) */
  saleStartDate = signal('2026-02-01');
  saleStartTime = signal('10:00');
  saleEndDate = signal('2026-04-18');
  saleEndTime = signal('18:00');

  /* Places */
  placeType = signal<'ga' | 'seated'>('ga');
  poolCapacity = signal('');
  /** Pools are MANDATORY for GA events (Arturs: "we will make pools as
   *  mandatory and then it will make sense"). A default pool is auto-seeded
   *  so the form starts in a valid state. */
  pools = signal<GaPool[]>([
    {
      id: 'pool-default',
      name: 'Main pool',
      categories: [],
      capacity: '670',
    },
    {
      id: 'pool-vip',
      name: 'VIP pool',
      categories: [],
      capacity: '200',
    },
  ]);

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

  /* ---- Create / edit a Price Category via the dialog ----
   *  Inline draft cards were replaced by a dedicated MatDialog so each
   *  category is created in a focused overlay. */

  addCategory() {
    this.openCategoryDialog(blankCategory(), false);
  }

  /** Open the price-category dialog. For "create" mode appends to saved on
   *  save + scrolls/flashes the new card. For "edit" mode replaces the
   *  existing entry in place. */
  private openCategoryDialog(seed: PriceCategory, isEdit: boolean) {
    const ref = this.dialog.open<PriceCategoryDialogComponent, PriceCategoryDialogData, PriceCategoryDialogResult>(
      PriceCategoryDialogComponent,
      {
        width: '760px',
        maxWidth: '96vw',
        maxHeight: '92vh',
        panelClass: 'price-category-dialog-panel',
        data: {
          category: { ...seed },
          isEdit,
          ticketTypes: this.ticketTypes(),
          pools: this.pools(),
          placeType: this.placeType(),
          languages: this.languages,
          baseLang: this.baseLang,
          eventSaleWindow: {
            startDate: this.saleStartDate(), startTime: this.saleStartTime(),
            endDate: this.saleEndDate(), endTime: this.saleEndTime(),
          },
          cascadeSources: this.cascadeSourcesExcluding(seed.id),
        },
      },
    );
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      // Merge any new ticket types the user added inside the dialog
      if (result.newTypes.length) {
        this.ticketTypes.update(list => [...list, ...result.newTypes]);
      }
      if (isEdit) {
        // Replace in place — preserves order.
        this.saved.update(list => list.map(c => c.id === result.category.id ? result.category : c));
      } else {
        this.saved.update(list => [...list, result.category]);
        // Scroll + flash so the user sees where the new card landed.
        this.justAddedId.set(result.category.id);
        setTimeout(() => {
          document.getElementById('tk-sales-overview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
        setTimeout(() => this.justAddedId.set(''), 2500);
      }
    });
  }

  /* ---- saved table ---- */
  editSaved(id: string) {
    const c = this.saved().find(x => x.id === id);
    if (!c) return;
    this.openCategoryDialog(c, true);
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

  /* category names usable as pool members (saved categories only — drafts
     no longer live on the page, they exist only inside the dialog). */
  categoryNames = computed(() =>
    this.saved().map(c => c.displayName || c.internalName).filter(Boolean));

  /* Cascade sources for the start-after schedule: all saved categories
     except the one currently being edited (a category can't chain off
     itself). Passed into the dialog data. */
  cascadeSourcesExcluding(currentId: string): string[] {
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
