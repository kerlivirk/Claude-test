import { Component, OnInit, Signal, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Event, EventStatus, MOCK_EVENTS } from '../../../shared/models/event.model';
import { Series } from '../../../shared/models/series.model';
import { SeriesStore } from '../../../shared/state/series-store.service';
import { SeriesConfigDialogComponent, SeriesConfigResult } from '../series-config-dialog/series-config-dialog.component';
import { BulkAddDatesDialogComponent, BulkAddRow } from './bulk-add-dates-dialog.component';
import { BulkEditDialogComponent, BulkEditResult } from './bulk-edit-dialog.component';
import { SalesPreviewDialogComponent } from '../../../shared/components/sales-preview-dialog/sales-preview-dialog.component';
import { ShareDialogComponent } from '../create-event/share-dialog.component';
import { PublicShareDialogComponent } from '../../../shared/components/public-share-dialog/public-share-dialog.component';
import { ORGANIZERS } from '../../../shared/models/organizers';

type StatusFilter = 'all' | EventStatus;

@Component({
  selector: 'app-series-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCheckboxModule, MatIconModule, MatMenuModule, MatTooltipModule],
  templateUrl: './series-detail.component.html',
  styleUrl: './series-detail.component.scss',
})
export class SeriesDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private store = inject(SeriesStore);
  private snack = inject(MatSnackBar);

  seriesId = signal<string>('');
  series: Signal<Series | undefined> = computed(() => this.store.getById(this.seriesId())());

  events = signal<Event[]>([]);

  searchQuery = signal('');
  statusFilter = signal<StatusFilter>('all');

  /* Multi-select state */
  multiSelect = signal(false);
  selection = signal<Set<string>>(new Set());

  readonly statusOptions: EventStatus[] = ['Active', 'Scheduled', 'Draft', 'Hidden', 'Ended', 'Cancelled'];

  /* Other series this selection can be moved to — visible only; hidden
     wrappers must never appear as a navigation/move target. */
  otherSeries = computed(() => this.store.visible().filter(s => s.id !== this.seriesId()));

  /* Distinct thumbnail gradients so events in a series are easy to tell apart
     during prototype user testing. */
  readonly cardGradients: string[] = [
    'linear-gradient(135deg, #7f56d9 0%, #4b39a4 70%, #2a1547 100%)',
    'linear-gradient(135deg, #0ea5a5 0%, #0b6e6e 70%, #053b3b 100%)',
    'linear-gradient(135deg, #e0588b 0%, #a12d5e 70%, #5e1536 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #b45309 70%, #6b3408 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 70%, #11277a 100%)',
    'linear-gradient(135deg, #06d373 0%, #047a48 70%, #023b23 100%)',
    'linear-gradient(135deg, #6366f1 0%, #3730a3 70%, #1e1b54 100%)',
    'linear-gradient(135deg, #ef4444 0%, #991b1b 70%, #4c0d0d 100%)',
  ];

  gradientFor(index: number): string {
    return this.cardGradients[index % this.cardGradients.length];
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? this.store.visible()[0]?.id;
    this.seriesId.set(id ?? '');
    this.loadEvents();
  }

  private loadEvents() {
    const s = this.series();
    if (!s) return;
    const ids = new Set(s.eventIds);
    const seriesEvents = MOCK_EVENTS.filter(e => ids.has(e.id));
    const padded: Event[] = [];
    for (let i = 0; i < s.eventCount; i++) {
      padded.push({ ...(seriesEvents[i % Math.max(seriesEvents.length, 1)] ?? MOCK_EVENTS[0]), id: `${s.id}-e${i}` });
    }
    this.events.set(padded);
  }

  filteredEvents = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const s = this.statusFilter();
    return this.events().filter(e => {
      if (s !== 'all' && e.status !== s) return false;
      if (q && !`${e.name} ${e.venue ?? ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  });

  kpiTotal = computed(() => this.events().length);
  kpiTicketSold = computed(() => this.events().reduce((s, e) => s + (e.ticketsSold || 0), 0));
  kpiRevenue = computed(() => this.events().reduce((s, e) => s + (e.revenue || 0), 0));
  kpiCapacity = computed(() => this.events().reduce((s, e) => s + (e.totalTickets || 0), 0));

  formatDate(d?: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  chipVariant(s: EventStatus): 'success' | 'warning' | 'error' | 'muted' {
    switch (s) {
      case 'Active': return 'success';
      case 'Scheduled': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'muted';
    }
  }

  chipLabel(s: EventStatus): string {
    return s === 'Active' ? 'Running' : s;
  }

  openEvent(e: Event) {
    if (this.multiSelect()) {
      this.toggleSelect(e.id);
      return;
    }
    this.router.navigate(['/events/edit', e.id], {
      queryParams: { seriesId: this.series()?.id },
    });
  }

  openTickets(e: Event, ev: MouseEvent) {
    ev.stopPropagation();
    const ref = this.dialog.open(SalesPreviewDialogComponent, {
      width: '560px', maxWidth: '96vw', panelClass: 'series-config-dialog-panel',
      data: { eventName: e.name, ticketsSold: e.ticketsSold, totalTickets: e.totalTickets, priceFrom: e.priceFrom },
    });
    ref.afterClosed().subscribe((res: 'edit' | undefined) => {
      if (res === 'edit') {
        this.router.navigate(['/events/edit', e.id], { queryParams: { seriesId: this.series()?.id, step: 'tickets' } });
      }
    });
  }

  openPublicShare(e: Event, ev: MouseEvent) {
    ev.stopPropagation();
    this.dialog.open(PublicShareDialogComponent, {
      width: '480px', maxWidth: '96vw', panelClass: 'series-config-dialog-panel',
      data: { eventName: e.name },
    });
  }

  openShare(e: Event, ev: MouseEvent) {
    ev.stopPropagation();
    this.dialog.open(ShareDialogComponent, {
      width: '460px', maxWidth: '96vw', panelClass: 'series-config-dialog-panel',
      data: { eventName: e.name, organizers: ORGANIZERS },
    });
  }

  goCreateEvent() {
    this.router.navigate(['/events/create'], { queryParams: { seriesId: this.series()?.id } });
  }

  /* ---------- Bulk add ---------- */
  openBulkAdd() {
    const ref = this.dialog.open(BulkAddDatesDialogComponent, {
      width: '480px',
      maxWidth: '96vw',
      panelClass: 'series-config-dialog-panel',
    });
    ref.afterClosed().subscribe((dateRows: BulkAddRow[] | undefined) => {
      if (!dateRows || dateRows.length === 0) return;
      const s = this.series();
      const base = Date.now();
      const blanks: Event[] = [...dateRows]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((row, i) => ({
          id: `${this.seriesId()}-new-${base}-${i}`,
          name: 'Untitled event',
          category: s?.category ?? '',
          date: row.date,
          venue: '',
          status: 'Draft' as EventStatus,
          ticketsSold: 0,
          totalTickets: 0,
          revenue: 0,
          formData: {
            eventDate: row.date,
            eventTime: row.startTime,
            eventEndDate: row.endDate,
            eventEndTime: row.endTime,
          },
        }));
      this.events.update(list => [...list, ...blanks]);
      if (s) this.store.upsert({ ...s, eventCount: s.eventCount + blanks.length });
      this.snack.open(`${blanks.length} blank event${blanks.length === 1 ? '' : 's'} added`, 'OK', { duration: 2500 });
    });
  }

  /* ---------- Multi-select ---------- */
  toggleMultiSelect() {
    this.multiSelect.update(v => !v);
    if (!this.multiSelect()) this.selection.set(new Set());
  }
  toggleSelect(id: string) {
    const s = new Set(this.selection());
    if (s.has(id)) s.delete(id); else s.add(id);
    this.selection.set(s);
  }
  isSelected(id: string) { return this.selection().has(id); }
  clearSelection() { this.selection.set(new Set()); }
  selectedCount = computed(() => this.selection().size);

  moveSelectedTo(targetId: string) {
    const ids = this.selection();
    if (ids.size === 0) return;
    const target = this.store.getById(targetId)();
    this.events.update(list => list.filter(e => !ids.has(e.id)));
    const s = this.series();
    if (s) this.store.upsert({ ...s, eventCount: Math.max(0, s.eventCount - ids.size) });
    if (target) this.store.upsert({ ...target, eventCount: target.eventCount + ids.size });
    this.snack.open(`Moved ${ids.size} event${ids.size === 1 ? '' : 's'} to "${target?.name}"`, 'OK', { duration: 2800 });
    this.clearSelection();
  }

  duplicateSelected() {
    const ids = this.selection();
    if (ids.size === 0) return;
    const base = Date.now();
    const copies: Event[] = this.events()
      .filter(e => ids.has(e.id))
      .map((e, i) => ({
        ...e,
        id: `${this.seriesId()}-dup-${base}-${i}`,
        name: `${e.name} (Copy)`,
        status: 'Draft' as EventStatus,
        ticketsSold: 0,
        revenue: 0,
      }));
    this.events.update(list => [...list, ...copies]);
    const s = this.series();
    if (s) this.store.upsert({ ...s, eventCount: s.eventCount + copies.length });
    this.snack.open(`Duplicated ${copies.length} event${copies.length === 1 ? '' : 's'}`, 'OK', { duration: 2500 });
    this.clearSelection();
  }

  duplicateSeries() {
    const s = this.series();
    if (!s) return;
    const id = this.store.nextId();
    this.store.upsert({
      ...s,
      id,
      name: `${s.name} (Copy)`,
      slug: s.slug ? `${s.slug}-copy` : undefined,
      status: 'Draft',
      eventCount: 0,
      eventIds: [],
    });
    this.snack.open('Series duplicated as draft', 'OK', { duration: 2500 });
    this.router.navigate(['/events/series', id]);
  }

  editSelected() {
    const count = this.selection().size;
    if (count === 0) return;
    const ref = this.dialog.open(BulkEditDialogComponent, {
      width: '440px',
      maxWidth: '96vw',
      panelClass: 'series-config-dialog-panel',
      data: { count },
    });
    ref.afterClosed().subscribe((result: BulkEditResult | undefined) => {
      if (!result) return;
      const ids = this.selection();
      this.events.update(list => list.map(e => ids.has(e.id) ? { ...e, ...result } : e));
      this.snack.open(`Updated ${ids.size} event${ids.size === 1 ? '' : 's'}`, 'OK', { duration: 2500 });
      this.clearSelection();
    });
  }

  deleteSelected() {
    const ids = this.selection();
    if (ids.size === 0) return;
    this.events.update(list => list.filter(e => !ids.has(e.id)));
    const s = this.series();
    if (s) this.store.upsert({ ...s, eventCount: Math.max(0, s.eventCount - ids.size) });
    this.snack.open(`Deleted ${ids.size} event${ids.size === 1 ? '' : 's'}`, 'OK', { duration: 2500 });
    this.clearSelection();
  }

  goEditSeries() {
    const current = this.series();
    if (!current) return;
    const ref = this.dialog.open(SeriesConfigDialogComponent, {
      width: '560px',
      maxWidth: '560px',
      height: '100vh',
      maxHeight: '100vh',
      position: { right: '0', top: '0' },
      panelClass: ['series-config-dialog-panel', 'series-config-drawer'],
      backdropClass: 'series-config-drawer-backdrop',
      data: { series: current },
    });
    ref.afterClosed().subscribe((result: SeriesConfigResult | undefined) => {
      if (!result) return;
      const { open, ...data } = result;
      this.store.upsert({ ...current, ...data });
    });
  }

  goBack() {
    this.router.navigate(['/events']);
  }
}
