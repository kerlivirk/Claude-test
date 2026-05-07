import { Component, OnInit, ViewChild, AfterViewInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Event, EventStatus, MOCK_EVENTS } from '../../../shared/models/event.model';
import { Series, MOCK_SERIES } from '../../../shared/models/series.model';
import { EventStructureDialogComponent, EventStructureChoice } from '../event-structure-dialog/event-structure-dialog.component';

type StatusTab = 'All' | 'Active' | 'Scheduled' | 'Draft' | 'Past' | 'Cancelled';
type RowKind = 'event' | 'series';

interface ListRow {
  kind: RowKind;
  id: string;
  name: string;
  category?: string;
  date?: string;
  venue?: string;
  status: EventStatus;
  ticketsSold?: number;
  totalTickets?: number;
  revenue?: number;
  eventCount?: number;
  legalEntity?: string;
}

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatTabsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatMenuModule, MatChipsModule,
    MatCheckboxModule, MatTooltipModule, MatDialogModule,
  ],
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.scss',
})
export class EventsListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  events = signal<Event[]>(MOCK_EVENTS);
  series = signal<Series[]>(MOCK_SERIES);

  dataSource = new MatTableDataSource<ListRow>([]);

  displayedColumns = ['select', 'name', 'category', 'date', 'venue', 'tickets', 'revenue', 'status', 'actions'];

  statusTabs: StatusTab[] = ['All', 'Active', 'Scheduled', 'Draft', 'Past', 'Cancelled'];
  activeTab = signal<StatusTab>('All');

  typeFilter = signal<'all' | RowKind>('all');
  searchQuery = signal('');
  selectedVenues = signal<string[]>([]);

  selection = signal<Set<string>>(new Set());

  allVenues = computed(() => {
    const set = new Set<string>();
    this.events().forEach(e => set.add(e.venue));
    return [...set].sort();
  });

  rows = computed<ListRow[]>(() => {
    const eventRows: ListRow[] = this.events().map(e => ({
      kind: 'event',
      id: e.id,
      name: e.name,
      category: e.category,
      date: e.date,
      venue: e.venue,
      status: e.status,
      ticketsSold: e.ticketsSold,
      totalTickets: e.totalTickets,
      revenue: e.revenue,
    }));
    const seriesRows: ListRow[] = this.series().map(s => ({
      kind: 'series',
      id: s.id,
      name: s.name,
      status: s.status,
      eventCount: s.eventCount,
      legalEntity: s.legalEntity,
    }));
    return [...eventRows, ...seriesRows];
  });

  filteredRows = computed<ListRow[]>(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const tab = this.activeTab();
    const type = this.typeFilter();
    const venues = this.selectedVenues();

    return this.rows().filter(r => {
      if (type !== 'all' && r.kind !== type) return false;

      if (tab !== 'All') {
        if (tab === 'Past') {
          if (r.status !== 'Ended') return false;
        } else if (r.status !== tab) {
          return false;
        }
      }

      if (q) {
        const hay = [r.name, r.venue, r.category, r.id].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (venues.length && r.venue && !venues.includes(r.venue)) return false;

      return true;
    });
  });

  constructor(private dialog: MatDialog, private router: Router) {}

  ngOnInit(): void {
    this.dataSource.data = this.filteredRows();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilters() {
    this.dataSource.data = this.filteredRows();
    if (this.paginator) this.paginator.firstPage();
  }

  onTabChange(idx: number) {
    this.activeTab.set(this.statusTabs[idx]);
    this.applyFilters();
  }

  onSearchChange(value: string) {
    this.searchQuery.set(value);
    this.applyFilters();
  }

  onTypeChange(value: 'all' | RowKind) {
    this.typeFilter.set(value);
    this.applyFilters();
  }

  onVenuesChange(value: string[]) {
    this.selectedVenues.set(value);
    this.applyFilters();
  }

  toggleSelect(id: string) {
    const s = new Set(this.selection());
    if (s.has(id)) s.delete(id); else s.add(id);
    this.selection.set(s);
  }

  isSelected(id: string) { return this.selection().has(id); }

  toggleSelectAll() {
    if (this.selection().size === this.dataSource.data.length) {
      this.selection.set(new Set());
    } else {
      this.selection.set(new Set(this.dataSource.data.map(r => r.id)));
    }
  }

  allSelected() {
    return this.dataSource.data.length > 0 && this.selection().size === this.dataSource.data.length;
  }

  someSelected() {
    return this.selection().size > 0 && !this.allSelected();
  }

  openCreateDialog() {
    const ref = this.dialog.open(EventStructureDialogComponent, {
      width: '720px',
      maxWidth: '95vw',
      panelClass: 'event-structure-dialog',
    });
    ref.afterClosed().subscribe((choice: EventStructureChoice | undefined) => {
      if (!choice) return;
      switch (choice) {
        case 'single':
          this.router.navigate(['/events/create']);
          break;
        case 'series':
          this.router.navigate(['/events/create-series']);
          break;
        case 'collection':
          this.router.navigate(['/collections']);
          break;
        case 'timeslot':
          this.router.navigate(['/events/create'], { queryParams: { timeslot: 1 } });
          break;
      }
    });
  }

  editRow(row: ListRow) {
    if (row.kind === 'series') {
      this.router.navigate(['/events/series', row.id]);
    } else {
      this.router.navigate(['/events/edit', row.id]);
    }
  }

  duplicateRow(row: ListRow) {
    console.log('duplicate', row);
  }

  deleteRow(row: ListRow) {
    console.log('delete', row);
  }

  formatDate(d?: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatRevenue(v?: number) {
    if (v == null) return '—';
    return '€' + v.toLocaleString('en-GB');
  }

  statusClass(s: EventStatus) { return s.toLowerCase(); }
}
