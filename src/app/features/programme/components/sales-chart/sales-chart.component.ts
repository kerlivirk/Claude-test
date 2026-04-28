import { Component, input, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SalesData, TicketCategory, ChartDataPoint } from '../../models/programme-event.model';

type Period = 'Weekly' | 'Monthly' | 'All time' | 'Last 7 days' | 'Last 14 days' | 'Last 30 days' | 'Daily';
type Metric = 'count' | 'value';
type Channel = 'Marketplace' | 'POS' | 'Embed';

@Component({
  selector: 'app-sales-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatCheckboxModule],
  template: `
    <div class="sc-wrap">
      <!-- Left summary cards -->
      <div class="sc-sidebar">
        <div class="sc-card">
          <p class="sc-card-label">Sold tickets</p>
          <div class="sc-card-icon-row">
            <mat-icon class="sc-card-ico">confirmation_number</mat-icon>
            <span class="sc-card-val">{{ data().soldTickets | number }}</span>
          </div>
          <p class="sc-card-sub">Seated: {{ data().seatedCount }}&nbsp;&nbsp;Unseated: {{ data().unseatedCount }}</p>
        </div>
        <div class="sc-card">
          <p class="sc-card-label">Sales value</p>
          <div class="sc-card-icon-row">
            <mat-icon class="sc-card-ico">payments</mat-icon>
            <mat-icon class="sc-card-ico">euro</mat-icon>
            <span class="sc-card-val">{{ data().salesValue | number:'1.2-2' }}</span>
          </div>
        </div>
        <div class="sc-card">
          <p class="sc-card-label">Transactions</p>
          <div class="sc-card-icon-row">
            <mat-icon class="sc-card-ico">swap_horiz</mat-icon>
            <span class="sc-card-val">{{ data().transactions | number }}</span>
          </div>
        </div>
        <div class="sc-card">
          <p class="sc-card-label">Number of products sold</p>
          <div class="sc-card-icon-row">
            <mat-icon class="sc-card-ico">swap_horiz</mat-icon>
            <span class="sc-card-val">{{ data().productsSold | number }}</span>
          </div>
        </div>
      </div>

      <!-- Main chart area -->
      <div class="sc-main">
        <div class="sc-controls">
          <div class="sc-date-row">
            <div class="sc-date-label">Date</div>
            <div class="sc-date-input">
              <input type="date" [value]="chartDate()" (change)="chartDate.set($any($event.target).value)" />
            </div>
          </div>
          <div class="sc-periods">
            @for (p of periods; track p) {
              <button class="sc-period" [class.sc-period-active]="period() === p" (click)="period.set(p)">{{ p }}</button>
            }
          </div>
        </div>
        <div class="sc-controls-row2">
          <div class="sc-metric-toggle">
            <button class="sc-metric" [class.sc-metric-active]="metric() === 'count'" (click)="metric.set('count')">Number of tickets sold</button>
            <button class="sc-metric" [class.sc-metric-active]="metric() === 'value'" (click)="metric.set('value')">Value of tickets</button>
          </div>
          <div class="sc-channels">
            @for (ch of channels; track ch) {
              <label class="sc-channel">
                <mat-checkbox [checked]="isChannelActive(ch)" (change)="toggleChannel(ch)" color="primary" />
                <span>{{ ch }}</span>
              </label>
            }
          </div>
        </div>

        <!-- SVG Chart -->
        <div class="sc-chart-area">
          <svg [attr.viewBox]="'0 0 ' + chartW + ' ' + chartH" class="sc-svg" preserveAspectRatio="xMidYMid meet">
            @for (tick of yTicks(); track tick.value) {
              <line [attr.x1]="padL" [attr.x2]="chartW - padR" [attr.y1]="tick.y" [attr.y2]="tick.y" stroke="#e9e7ed" stroke-width="1"/>
              <text [attr.x]="padL - 8" [attr.y]="tick.y + 4" text-anchor="end" fill="#84738f" font-size="11" font-family="Mulish, sans-serif">{{ tick.label }}</text>
            }
            @for (bar of bars(); track bar.idx) {
              @for (seg of bar.segments; track seg.catIdx) {
                <rect [attr.x]="bar.x" [attr.y]="seg.y" [attr.width]="barWidth()" [attr.height]="seg.h" [attr.fill]="seg.color" [attr.rx]="seg.catIdx === bar.segments.length - 1 ? 3 : 0" />
              }
              @if (bar.showLabel) {
                <text [attr.x]="bar.x + barWidth() / 2" [attr.y]="chartH - 4" text-anchor="middle" fill="#84738f" font-size="11" font-family="Mulish, sans-serif">{{ bar.label }}</text>
              }
            }
          </svg>
        </div>

        <div class="sc-brush">
          <div class="sc-brush-inner">
            <div class="sc-brush-handle sc-brush-left"></div>
            <div class="sc-brush-window"></div>
            <div class="sc-brush-handle sc-brush-right"></div>
          </div>
        </div>
      </div>

      <!-- Right categories panel -->
      <div class="sc-cats">
        <div class="sc-cats-tabs">
          <button class="sc-cat-tab" [class.sc-cat-tab-active]="catTab() === 'categories'" (click)="catTab.set('categories')">Categories ({{ visibleCats().length }})</button>
          <button class="sc-cat-tab" [class.sc-cat-tab-active]="catTab() === 'types'" (click)="catTab.set('types')">Ticket Types</button>
        </div>
        <div class="sc-cat-list">
          <label class="sc-cat-item">
            <mat-checkbox [checked]="allCatsVisible()" (change)="toggleAllCats()" color="primary" />
            <span class="sc-cat-name">ALL</span>
            <button class="sc-cat-copy"><mat-icon class="sc-cat-copy-ico">content_copy</mat-icon></button>
          </label>
          @for (cat of cats(); track cat.id) {
            <label class="sc-cat-item">
              <mat-checkbox [checked]="cat.visible" (change)="toggleCat(cat.id)" color="primary" />
              <span class="sc-cat-name">{{ cat.name }}, Total amount: {{ cat.totalAmount }}</span>
              <span class="sc-cat-dot" [style.background]="cat.color"></span>
            </label>
          }
        </div>
        <button class="sc-cat-clear" (click)="clearCats()">Clear</button>
      </div>
    </div>
  `,
  styles: [`
    .sc-wrap { display: flex; gap: 0; background: var(--gray-50, #f8f8fa); border-top: 1px solid var(--stroke-on-surface-primary, #e9e7ed); padding: 16px 20px; }
    .sc-sidebar { display: flex; flex-direction: column; gap: 8px; width: 160px; flex-shrink: 0; padding-right: 16px; }
    .sc-card { background: var(--bg-surface, #fff); border: 1px solid var(--stroke-on-surface-primary, #e9e7ed); border-radius: var(--radius-lg, 12px); padding: 12px; }
    .sc-card-label { font-size: 11px; color: var(--gray-600, #9686a2); margin: 0 0 6px; font-family: Mulish, sans-serif; }
    .sc-card-icon-row { display: flex; align-items: center; gap: 6px; }
    .sc-card-ico { font-size: 18px; width: 18px; height: 18px; color: var(--gray-400, #c1bacb); }
    .sc-card-val { font-size: 18px; font-weight: 700; color: var(--text-on-surface-primary, #11002b); font-family: Mulish, sans-serif; }
    .sc-card-sub { font-size: 10px; color: var(--gray-500, #a99db6); margin: 4px 0 0; font-family: Mulish, sans-serif; }
    .sc-main { flex: 1; min-width: 0; }
    .sc-controls { display: flex; align-items: flex-end; gap: 12px; margin-bottom: 10px; flex-wrap: wrap; }
    .sc-date-row { display: flex; flex-direction: column; gap: 4px; }
    .sc-date-label { font-size: 10px; color: var(--gray-600, #9686a2); font-family: Mulish, sans-serif; }
    .sc-date-input input { height: 32px; border: 1px solid var(--stroke-on-surface-primary, #e9e7ed); border-radius: var(--radius-md, 8px); padding: 0 10px; font-size: 13px; font-family: Mulish, sans-serif; color: var(--text-on-surface-primary, #11002b); background: var(--bg-surface, #fff); outline: none; width: 150px; }
    .sc-periods { display: flex; gap: 0; }
    .sc-period { height: 32px; padding: 0 12px; border: 1px solid var(--stroke-on-surface-primary, #e9e7ed); background: var(--bg-surface, #fff); font-size: 12px; font-family: Mulish, sans-serif; color: var(--text-on-surface-secondary, #5a5062); cursor: pointer; font-weight: 500; white-space: nowrap; }
    .sc-period:first-child { border-radius: var(--radius-md, 8px) 0 0 var(--radius-md, 8px); }
    .sc-period:last-child { border-radius: 0 var(--radius-md, 8px) var(--radius-md, 8px) 0; }
    .sc-period + .sc-period { margin-left: -1px; }
    .sc-period-active { background: var(--bg-surface-dark, #11002b); color: #fff; border-color: var(--bg-surface-dark, #11002b); z-index: 1; position: relative; }
    .sc-controls-row2 { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; }
    .sc-metric-toggle { display: flex; gap: 0; }
    .sc-metric { height: 30px; padding: 0 14px; border: 1px solid var(--secondary-500, #06d373); background: transparent; font-size: 12px; font-family: Mulish, sans-serif; color: var(--secondary-600, #1b9e5a); cursor: pointer; font-weight: 600; }
    .sc-metric:first-child { border-radius: var(--radius-md, 8px) 0 0 var(--radius-md, 8px); }
    .sc-metric:last-child { border-radius: 0 var(--radius-md, 8px) var(--radius-md, 8px) 0; }
    .sc-metric + .sc-metric { margin-left: -1px; }
    .sc-metric-active { background: var(--secondary-500, #06d373); color: var(--base-black, #11002b); }
    .sc-channels { display: flex; gap: 16px; align-items: center; }
    .sc-channel { display: flex; align-items: center; gap: 4px; font-size: 13px; font-family: Mulish, sans-serif; color: var(--text-on-surface-primary, #11002b); cursor: pointer; }
    .sc-chart-area { width: 100%; }
    .sc-svg { width: 100%; height: auto; display: block; }
    .sc-brush { height: 32px; background: var(--gray-50, #f8f8fa); border: 1px solid var(--stroke-on-surface-primary, #e9e7ed); border-radius: var(--radius-md, 8px); margin-top: 8px; position: relative; overflow: hidden; }
    .sc-brush-inner { display: flex; height: 100%; align-items: center; }
    .sc-brush-handle { width: 6px; background: var(--primary-400, #ae9edd); cursor: ew-resize; height: 100%; }
    .sc-brush-window { flex: 1; background: rgba(157, 133, 208, 0.08); height: 100%; }
    .sc-cats { width: 240px; flex-shrink: 0; margin-left: 16px; border: 1px solid var(--stroke-on-surface-primary, #e9e7ed); border-radius: var(--radius-lg, 12px); background: var(--bg-surface, #fff); display: flex; flex-direction: column; }
    .sc-cats-tabs { display: flex; border-bottom: 1px solid var(--stroke-on-surface-primary, #e9e7ed); }
    .sc-cat-tab { flex: 1; padding: 10px 8px; border: none; background: transparent; font-size: 11px; font-weight: 600; font-family: Mulish, sans-serif; color: var(--gray-500, #a99db6); cursor: pointer; border-bottom: 2px solid transparent; }
    .sc-cat-tab-active { color: var(--text-on-surface-primary, #11002b); border-bottom-color: var(--secondary-500, #06d373); }
    .sc-cat-list { flex: 1; overflow-y: auto; padding: 8px 12px; display: flex; flex-direction: column; gap: 4px; }
    .sc-cat-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; cursor: pointer; font-size: 12px; font-family: Mulish, sans-serif; color: var(--text-on-surface-primary, #11002b); }
    .sc-cat-name { flex: 1; font-size: 11px; }
    .sc-cat-dot { width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0; }
    .sc-cat-copy { border: none; background: none; cursor: pointer; padding: 0; }
    .sc-cat-copy-ico { font-size: 16px; width: 16px; height: 16px; color: var(--gray-400, #c1bacb); }
    .sc-cat-clear { padding: 8px; text-align: center; border: none; border-top: 1px solid var(--stroke-on-surface-primary, #e9e7ed); background: transparent; font-size: 12px; font-weight: 600; color: var(--text-on-surface-secondary, #5a5062); cursor: pointer; font-family: Mulish, sans-serif; }
    .sc-cat-clear:hover { background: var(--gray-50, #f8f8fa); }
  `],
})
export class SalesChartComponent {
  readonly data = input.required<SalesData>();

  readonly chartW = 640;
  readonly chartH = 260;
  readonly padL = 40;
  readonly padR = 10;
  readonly padT = 10;
  readonly padB = 24;

  periods: Period[] = ['Weekly', 'Monthly', 'All time', 'Last 7 days', 'Last 14 days', 'Last 30 days', 'Daily'];
  channels: Channel[] = ['Marketplace', 'POS', 'Embed'];

  period = signal<Period>('Weekly');
  metric = signal<Metric>('count');
  chartDate = signal('2025-08-17');
  catTab = signal<'categories' | 'types'>('categories');
  activeChannels = signal<Set<Channel>>(new Set(['Marketplace', 'POS', 'Embed']));
  cats = signal<TicketCategory[]>([]);

  constructor() {
    effect(() => {
      const d = this.data();
      if (d?.categories) {
        this.cats.set(d.categories.map(c => ({ ...c })));
      }
    });
  }

  visibleCats = computed(() => this.cats().filter(c => c.visible));
  allCatsVisible = computed(() => this.cats().every(c => c.visible));

  isChannelActive(ch: Channel) { return this.activeChannels().has(ch); }
  toggleChannel(ch: Channel) {
    const s = new Set(this.activeChannels());
    s.has(ch) ? s.delete(ch) : s.add(ch);
    this.activeChannels.set(s);
  }

  toggleCat(id: string) {
    this.cats.update(list => list.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  }
  toggleAllCats() {
    const allVis = this.allCatsVisible();
    this.cats.update(list => list.map(c => ({ ...c, visible: !allVis })));
  }
  clearCats() {
    this.cats.update(list => list.map(c => ({ ...c, visible: false })));
  }

  barWidth = computed(() => {
    const pts = this.data().chartData.length || 1;
    const avail = this.chartW - this.padL - this.padR;
    return Math.max(8, (avail / pts) - 6);
  });

  private maxVal = computed(() => {
    const pts = this.data().chartData;
    const visCats = new Set(this.visibleCats().map(c => c.color));
    let mx = 0;
    for (const pt of pts) {
      let s = 0;
      for (const cat of pt.categories) { if (visCats.has(cat.color)) s += cat.value; }
      mx = Math.max(mx, s);
    }
    return mx || 800;
  });

  yTicks = computed(() => {
    const max = this.maxVal();
    const step = Math.ceil(max / 4 / 100) * 100 || 200;
    const ticks: { value: number; y: number; label: string }[] = [];
    const plotH = this.chartH - this.padT - this.padB;
    for (let v = 0; v <= max; v += step) {
      ticks.push({ value: v, y: this.chartH - this.padB - (v / max) * plotH, label: String(v) });
    }
    return ticks;
  });

  bars = computed(() => {
    const pts = this.data().chartData;
    const visCats = new Set(this.visibleCats().map(c => c.color));
    const max = this.maxVal();
    const plotH = this.chartH - this.padT - this.padB;
    const bw = this.barWidth();
    const gap = 6;

    return pts.map((pt, idx) => {
      const x = this.padL + idx * (bw + gap);
      let cumY = this.chartH - this.padB;
      const segments: { catIdx: number; y: number; h: number; color: string }[] = [];
      pt.categories.forEach((cat, catIdx) => {
        if (!visCats.has(cat.color)) return;
        const h = (cat.value / max) * plotH;
        cumY -= h;
        segments.push({ catIdx, y: cumY, h, color: cat.color });
      });
      return { idx, x, label: pt.label, showLabel: idx % 3 === 0, segments };
    });
  });
}
