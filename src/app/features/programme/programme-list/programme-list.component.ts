import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TicketProgressBarComponent } from '../components/ticket-progress-bar/ticket-progress-bar.component';
import { SalesChartComponent } from '../components/sales-chart/sales-chart.component';
import { ProgrammeEvent, MOCK_PROGRAMME } from '../models/programme-event.model';

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
    TicketProgressBarComponent,
    SalesChartComponent,
  ],
  templateUrl: './programme-list.component.html',
  styleUrl: './programme-list.component.scss',
})
export class ProgrammeListComponent {
  readonly events = signal<ProgrammeEvent[]>(MOCK_PROGRAMME);

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
