import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TicketProgressBarComponent } from '../components/ticket-progress-bar/ticket-progress-bar.component';
import { SalesChartComponent } from '../components/sales-chart/sales-chart.component';
import { ProgrammeEvent, MOCK_PROGRAMME } from '../models/programme-event.model';
import { EventStructureDialogComponent, EventStructureChoice } from '../../events/event-structure-dialog/event-structure-dialog.component';
import { SeriesConfigDialogComponent, SeriesConfigResult } from '../../events/series-config-dialog/series-config-dialog.component';
import { Series } from '../../../shared/models/series.model';
import { SeriesStore } from '../../../shared/state/series-store.service';

type SortCol = 'name' | 'date' | 'lastEdited';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-programme-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    TicketProgressBarComponent,
    SalesChartComponent,
  ],
  templateUrl: './programme-list.component.html',
  styleUrl: './programme-list.component.scss',
})
export class ProgrammeListComponent {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly store = inject(SeriesStore);

  readonly events = signal<ProgrammeEvent[]>(MOCK_PROGRAMME);

  /** Topbar "Create" — same Event-or-Series picker used app-wide. */
  openCreateDialog() {
    const ref = this.dialog.open(EventStructureDialogComponent, {
      width: '720px', maxWidth: '95vw', panelClass: 'event-structure-dialog',
    });
    ref.afterClosed().subscribe((choice: EventStructureChoice | undefined) => {
      if (choice === 'single') this.router.navigate(['/events/create']);
      else if (choice === 'series') this.createSeries();
    });
  }

  private createSeries() {
    const ref = this.dialog.open(SeriesConfigDialogComponent, {
      width: '760px', maxWidth: '96vw', maxHeight: '92vh', panelClass: 'series-config-dialog-panel',
    });
    ref.afterClosed().subscribe((result: SeriesConfigResult | undefined) => {
      if (!result) return;
      const id = this.store.nextId();
      const newSeries: Series = {
        ...result, id, name: result.name ?? 'Untitled series',
        status: 'Draft', eventCount: 0, eventIds: [],
      };
      this.store.upsert(newSeries);
      this.router.navigate(['/events/series', id]);
    });
  }

  searchQuery = '';
  filterDate = '2025-08-17';
  selectedLocations = ['Tallinn Arena', 'Song Festival Grounds'];
  selectedStatuses = ['Published', 'Draft'];

  timePills = ['Future', 'Past', 'All events'] as const;
  activeTimePill = signal<string>('Future');

  bulkSelect = signal(false);

  sortCol = signal<SortCol>('date');
  sortDir = signal<SortDir>('asc');

  toggleSort(col: SortCol) {
    if (this.sortCol() === col) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortCol.set(col);
      this.sortDir.set('asc');
    }
  }

  pageSize = 10;
  currentPage = signal(1);
  totalEvents = computed(() => this.events().length);
  pagStart = computed(() => ((this.currentPage() - 1) * this.pageSize) + 1);
  pagEnd = computed(() => Math.min(this.currentPage() * this.pageSize, this.totalEvents()));

  filteredEvents = computed(() => {
    let list = [...this.events()];
    const q = this.searchQuery.toLowerCase();
    if (q) {
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.eventId.includes(q) ||
        e.venue.toLowerCase().includes(q)
      );
    }
    const col = this.sortCol();
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      const av = col === 'name' ? a.name : col === 'date' ? a.date : a.lastEdited;
      const bv = col === 'name' ? b.name : col === 'date' ? b.date : b.lastEdited;
      return av.localeCompare(bv) * dir;
    });
    return list;
  });

  fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
