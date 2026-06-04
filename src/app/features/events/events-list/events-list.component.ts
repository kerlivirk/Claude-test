import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Event, EventStatus, MOCK_EVENTS } from '../../../shared/models/event.model';
import { Series } from '../../../shared/models/series.model';
import { SeriesStore } from '../../../shared/state/series-store.service';
import { EventStructureDialogComponent, EventStructureChoice } from '../event-structure-dialog/event-structure-dialog.component';
import { SeriesConfigDialogComponent, SeriesConfigResult } from '../series-config-dialog/series-config-dialog.component';
import { SeriesSummaryDialogComponent, SeriesSummaryAction } from '../series-summary-dialog/series-summary-dialog.component';
import { SalesPreviewDialogComponent } from '../../../shared/components/sales-preview-dialog/sales-preview-dialog.component';
import { ShareDialogComponent } from '../create-event/share-dialog.component';
import { PublicShareDialogComponent } from '../../../shared/components/public-share-dialog/public-share-dialog.component';
import { ORGANIZERS } from '../../../shared/models/organizers';

type TabKey = 'all' | 'future' | 'past';
type StatusFilter = 'all' | EventStatus;
type KindFilter = 'all' | 'event' | 'series';

interface CardRow {
  id: string;
  kind: 'event' | 'series';
  name: string;
  date?: string;
  time?: string;
  venue?: string;
  status: EventStatus;
  ticketsSold: number;
  totalTickets: number;
  revenue: number;
  priceFrom?: number;
  thumbnailGradient?: string;
  eventCount?: number;
}

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatMenuModule,
    MatCheckboxModule, MatTooltipModule, MatDialogModule,
  ],
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.scss',
})
export class EventsListComponent {
  readonly defaultThumb = 'linear-gradient(135deg, #5a1212, #2b0606)';

  readonly tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: 'All events' },
    { key: 'future', label: 'Future' },
    { key: 'past', label: 'Past' },
  ];

  readonly kindTabs: { key: KindFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'event', label: 'Single events' },
    { key: 'series', label: 'Series' },
  ];

  readonly statusOptions: EventStatus[] = ['Active', 'Scheduled', 'Draft', 'Hidden', 'Ended', 'Cancelled'];

  events = signal<Event[]>(MOCK_EVENTS);

  activeTab = signal<TabKey>('all');
  activeKind = signal<KindFilter>('all');
  searchQuery = signal('');
  statusFilter = signal<StatusFilter>('all');
  multiEdit = signal(false);
  selection = signal<Set<string>>(new Set());
  viewMode = signal<'cards' | 'table'>('cards');

  constructor(private dialog: MatDialog, private router: Router, private store: SeriesStore, private snack: MatSnackBar) {}

  private rows = computed<CardRow[]>(() => {
    // Only consider VISIBLE series — events wrapped solely by a hidden
    // (system) series must still appear in the standalone list.
    const allSeries = this.store.visible();
    const eventIdsInSeries = new Set(allSeries.flatMap(s => s.eventIds));
    const eventRows: CardRow[] = this.events()
      .filter(e => !eventIdsInSeries.has(e.id))
      .map(e => ({
        id: e.id,
        kind: 'event',
        name: e.name,
        date: e.date,
        time: e.formData?.eventTime,
        venue: e.venue,
        status: e.status,
        ticketsSold: e.ticketsSold,
        totalTickets: e.totalTickets,
        revenue: e.revenue,
        priceFrom: e.priceFrom,
        thumbnailGradient: e.thumbnailGradient,
      }));
    const seriesRows: CardRow[] = allSeries.map(s => ({
      id: s.id,
      kind: 'series',
      name: s.name,
      status: s.status,
      ticketsSold: 0,
      totalTickets: 0,
      revenue: 0,
      eventCount: s.eventCount,
    }));
    return [...seriesRows, ...eventRows];
  });

  private tabPartition = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    const future: CardRow[] = [];
    const past: CardRow[] = [];
    const all = this.rows();
    for (const r of all) {
      if (!r.date) continue;
      if (r.date >= today) future.push(r); else past.push(r);
    }
    return { all, future, past };
  });

  tabCounts = computed(() => {
    const p = this.tabPartition();
    return { all: p.all.length, future: p.future.length, past: p.past.length };
  });

  filteredCards = computed<CardRow[]>(() => {
    const p = this.tabPartition();
    const base = p[this.activeTab()];
    const q = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();
    const kind = this.activeKind();
    return base.filter(r => {
      if (kind !== 'all' && r.kind !== kind) return false;
      if (status !== 'all' && r.status !== status) return false;
      if (q) {
        const hay = [r.name, r.venue, r.id].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  });

  /* KPI tiles */
  kpiTotal = computed(() => this.events().length);
  kpiActiveWithSales = computed(() =>
    this.events().filter(e => e.ticketsSold > 0).reduce((sum, e) => sum + e.ticketsSold, 0));
  kpiRevenue = computed(() => this.events().reduce((s, e) => s + (e.revenue || 0), 0));
  kpiCapacity = computed(() => this.events().reduce((s, e) => s + (e.totalTickets || 0), 0));

  /* Selection */
  toggleSelect(id: string) {
    const s = new Set(this.selection());
    if (s.has(id)) s.delete(id); else s.add(id);
    this.selection.set(s);
  }
  isSelected(id: string) { return this.selection().has(id); }
  clearSelection() { this.selection.set(new Set()); }
  selectedCount = computed(() => this.selection().size);

  /* Series this selection's events can be moved into — only visible ones; the
     user must never see (or pick) a hidden system-wrapper series. */
  moveTargets = computed(() => this.store.visible());

  private selectedEventIds(): string[] {
    const ids = this.selection();
    return this.events().filter(e => ids.has(e.id)).map(e => e.id);
  }

  moveSelectedToSeries(targetId: string) {
    const target = this.store.getById(targetId)();
    if (!target) return;
    const eventIds = this.selectedEventIds();
    if (eventIds.length === 0) {
      this.snack.open('Select events (not series) to move into a series', 'OK', { duration: 3000 });
      return;
    }
    // attachEventToSeries handles the unlink-from-hidden-wrapper bookkeeping.
    for (const id of eventIds) this.store.attachEventToSeries(id, targetId);
    this.snack.open(`Moved ${eventIds.length} event${eventIds.length === 1 ? '' : 's'} to "${target.name}"`, 'OK', { duration: 2800 });
    this.clearSelection();
  }

  duplicateSelected() {
    const ids = [...this.selection()];
    if (ids.length === 0) return;
    const eventCopies: Event[] = [];
    let i = 0;
    for (const id of ids) {
      const ev = this.events().find(e => e.id === id);
      if (ev) {
        eventCopies.push({ ...ev, id: `e-copy-${Date.now()}-${i++}`, name: `${ev.name} (Copy)`, status: 'Draft', ticketsSold: 0, revenue: 0 });
        continue;
      }
      const s = this.store.getById(id)();
      if (s) {
        this.store.upsert({ ...s, id: this.store.nextId(), name: `${s.name} (Copy)`, slug: s.slug ? `${s.slug}-copy` : undefined, status: 'Draft', eventCount: 0, eventIds: [] });
      }
    }
    if (eventCopies.length) this.events.update(list => [...eventCopies, ...list]);
    this.snack.open(`Duplicated ${ids.length} item${ids.length === 1 ? '' : 's'}`, 'OK', { duration: 2500 });
    this.clearSelection();
  }

  deleteSelected() {
    const ids = this.selection();
    if (ids.size === 0) return;
    this.events.update(list => list.filter(e => !ids.has(e.id)));
    [...ids].forEach(id => { if (this.store.getById(id)()) this.store.remove(id); });
    this.snack.open(`Deleted ${ids.size} item${ids.size === 1 ? '' : 's'}`, 'OK', { duration: 2500 });
    this.clearSelection();
  }

  /* Chip mapping */
  chipVariant(s: EventStatus): 'success' | 'warning' | 'error' | 'muted' {
    switch (s) {
      case 'Active': return 'success';
      case 'Scheduled': return 'warning';
      case 'Cancelled': return 'error';
      case 'Hidden':
      case 'Draft':
      case 'Ended':
      default: return 'muted';
    }
  }

  chipIcon(s: EventStatus): string {
    switch (s) {
      case 'Active': return 'Check Circle';
      case 'Scheduled': return 'Circle Clock';
      case 'Cancelled': return 'Delete 1';
      case 'Hidden': return 'Invisible 1';
      case 'Draft': return 'Text File';
      case 'Ended': return 'Check';
      default: return 'Circle';
    }
  }

  chipLabel(s: EventStatus): string {
    return s === 'Active' ? 'Running' : s;
  }

  /* Formatting */
  formatDate(d?: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /* Actions */
  openCreateDialog() {
    const ref = this.dialog.open(EventStructureDialogComponent, {
      width: '720px',
      maxWidth: '95vw',
      panelClass: 'event-structure-dialog',
    });
    ref.afterClosed().subscribe((choice: EventStructureChoice | undefined) => {
      if (!choice) return;
      if (choice === 'single') this.router.navigate(['/events/create']);
      else if (choice === 'series') this.openSeriesConfigDialog();
    });
  }

  goCreateSeries() {
    this.openSeriesConfigDialog();
  }

  openSeriesConfigDialog() {
    const ref = this.dialog.open(SeriesConfigDialogComponent, {
      width: '760px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      panelClass: 'series-config-dialog-panel',
    });
    ref.afterClosed().subscribe((result: SeriesConfigResult | undefined) => {
      if (!result) return;
      const id = this.store.nextId();
      const newSeries: Series = {
        ...result,
        id,
        name: result.name ?? 'Untitled series',
        status: 'Draft',
        eventCount: 0,
        eventIds: [],
      };
      this.store.upsert(newSeries);
      this.router.navigate(['/events/series', id]);
    });
  }

  /* Card body click: summary drawer for series, editor for events. */
  onCardClick(row: CardRow) {
    if (this.multiEdit()) {
      this.toggleSelect(row.id);
      return;
    }
    if (row.kind === 'series') {
      this.openSeriesSummary(row);
    } else {
      this.router.navigate(['/events/edit', row.id]);
    }
  }

  /* "Open" → full series detail view. */
  openSeriesDetail(row: CardRow, ev?: MouseEvent) {
    ev?.stopPropagation();
    this.router.navigate(['/events/series', row.id]);
  }

  /* Row-menu "Edit" → editor for events, config drawer for series. */
  editRowMenu(row: CardRow) {
    if (row.kind === 'series') {
      this.editSeries(row.id);
    } else {
      this.router.navigate(['/events/edit', row.id]);
    }
  }

  openSeriesSummary(row: CardRow) {
    const series = this.store.getById(row.id)();
    if (!series) return;
    const ref = this.dialog.open(SeriesSummaryDialogComponent, {
      width: '420px',
      maxWidth: '420px',
      height: '100vh',
      maxHeight: '100vh',
      position: { right: '0', top: '0' },
      panelClass: ['series-config-dialog-panel', 'series-summary-drawer'],
      backdropClass: 'series-config-drawer-backdrop',
      data: { series },
    });
    ref.afterClosed().subscribe((action: SeriesSummaryAction | undefined) => {
      if (action === 'open') this.router.navigate(['/events/series', row.id]);
      else if (action === 'edit') this.editSeries(row.id);
    });
  }

  editSeries(id: string) {
    const current = this.store.getById(id)();
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
      if (open) this.router.navigate(['/events/series', id]);
    });
  }

  openTickets(row: CardRow, ev: MouseEvent) {
    ev.stopPropagation();
    const ref = this.dialog.open(SalesPreviewDialogComponent, {
      width: '560px', maxWidth: '96vw', panelClass: 'series-config-dialog-panel',
      data: { eventName: row.name, ticketsSold: row.ticketsSold, totalTickets: row.totalTickets, priceFrom: row.priceFrom },
    });
    ref.afterClosed().subscribe((res: 'edit' | undefined) => {
      if (res === 'edit') this.router.navigate(['/events/edit', row.id], { queryParams: { step: 'tickets' } });
    });
  }

  openPublicShare(row: CardRow, ev: MouseEvent) {
    ev.stopPropagation();
    this.dialog.open(PublicShareDialogComponent, {
      width: '480px', maxWidth: '96vw', panelClass: 'series-config-dialog-panel',
      data: { eventName: row.name },
    });
  }

  openShare(row: CardRow, ev: MouseEvent) {
    ev.stopPropagation();
    this.dialog.open(ShareDialogComponent, {
      width: '460px', maxWidth: '96vw', panelClass: 'series-config-dialog-panel',
      data: { eventName: row.name, organizers: ORGANIZERS },
    });
  }

  duplicateRow(row: CardRow) {
    if (row.kind === 'series') {
      const orig = this.store.getById(row.id)();
      if (!orig) return;
      const id = this.store.nextId();
      this.store.upsert({
        ...orig,
        id,
        name: `${orig.name} (Copy)`,
        slug: orig.slug ? `${orig.slug}-copy` : undefined,
        status: 'Draft',
        eventCount: 0,
        eventIds: [],
      });
      this.snack.open('Series duplicated as draft', 'OK', { duration: 2500 });
    } else {
      const orig = this.events().find(e => e.id === row.id);
      if (!orig) return;
      const copy: Event = {
        ...orig,
        id: `e-copy-${Date.now()}`,
        name: `${orig.name} (Copy)`,
        status: 'Draft',
        ticketsSold: 0,
        revenue: 0,
      };
      this.events.update(list => [copy, ...list]);
      this.snack.open('Event duplicated as draft', 'OK', { duration: 2500 });
    }
  }

  deleteRow(row: CardRow) {
    if (row.kind === 'series') {
      this.store.remove(row.id);
    } else {
      this.events.update(list => list.filter(e => e.id !== row.id));
    }
    this.snack.open(`${row.kind === 'series' ? 'Series' : 'Event'} deleted`, 'OK', { duration: 2500 });
  }
}
