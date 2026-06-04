import { Component, computed, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface MonthBar { label: string; revenue: number; }
interface CatSlice { label: string; value: number; color: string; }
interface TopEvent { name: string; venue: string; sold: number; total: number; revenue: number; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, DecimalPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  range = signal<'30d' | '90d' | '12m'>('12m');

  readonly months: MonthBar[] = [
    { label: 'Jun', revenue: 18200 }, { label: 'Jul', revenue: 24600 },
    { label: 'Aug', revenue: 31200 }, { label: 'Sep', revenue: 22800 },
    { label: 'Oct', revenue: 27400 }, { label: 'Nov', revenue: 34900 },
    { label: 'Dec', revenue: 41200 }, { label: 'Jan', revenue: 19800 },
    { label: 'Feb', revenue: 23100 }, { label: 'Mar', revenue: 29700 },
    { label: 'Apr', revenue: 38400 }, { label: 'May', revenue: 44800 },
  ];
  maxRevenue = computed(() => Math.max(...this.months.map(m => m.revenue)));

  readonly categories: CatSlice[] = [
    { label: 'Music', value: 42, color: '#7f56d9' },
    { label: 'Theatre', value: 23, color: '#06d373' },
    { label: 'Sport', value: 18, color: '#f59e0b' },
    { label: 'Comedy', value: 11, color: '#3b82f6' },
    { label: 'Other', value: 6, color: '#e0588b' },
  ];
  donut = computed(() => {
    let acc = 0;
    const stops = this.categories.map(c => {
      const start = acc; acc += c.value;
      return `${c.color} ${start}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  });

  readonly topEvents: TopEvent[] = [
    { name: 'Rammstein — Europe Stadium Tour', venue: 'Tallinn Song Festival Grounds', sold: 58200, total: 60000, revenue: 4365000 },
    { name: 'Summer Jazz Festival 2026', venue: 'Tallinn Arena', sold: 3240, total: 4000, revenue: 162000 },
    { name: '50 Landmark Tracks — O.S.T.R.', venue: 'Tartu Theater', sold: 142, total: 500, revenue: 3550 },
    { name: 'Contemporary Dance', venue: 'Estonian National Opera', sold: 180, total: 400, revenue: 9000 },
    { name: 'Comedy Night', venue: 'Comedy Club Tallinn', sold: 150, total: 150, revenue: 3750 },
  ];

  readonly kpis = [
    { label: 'Revenue (YTD)', value: '€ 1.24M', delta: '+12.4%', up: true, icon: 'Pin-Dollar' },
    { label: 'Tickets sold', value: '186,420', delta: '+8.1%', up: true, icon: 'Ticket' },
    { label: 'Active events', value: '34', delta: '+3', up: true, icon: 'Blank Calendar' },
    { label: 'Avg. fill rate', value: '78%', delta: '-2.3%', up: false, icon: 'Chart Column' },
  ];

  pct(e: TopEvent) { return Math.round((e.sold / e.total) * 100); }
}
