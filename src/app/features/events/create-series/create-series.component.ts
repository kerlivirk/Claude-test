import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Series, MOCK_SERIES } from '../../../shared/models/series.model';
import { Event, MOCK_EVENTS } from '../../../shared/models/event.model';
import { SeriesEventDialogComponent, SeriesEventForm } from './series-event-dialog/series-event-dialog.component';

const LANGUAGES = [
  { code: 'Universal', name: 'Universal' },
  { code: 'ENG', name: 'English' },
  { code: 'EST', name: 'Estonian' },
  { code: 'LV', name: 'Latvian' },
  { code: 'LIT', name: 'Lithuanian' },
  { code: 'RUS', name: 'Russian' },
];

const LEGAL_ENTITIES = ['PLG Estonia', 'PLG Latvia', 'PLG Lithuania', 'Kumu Art Museum'];

@Component({
  selector: 'app-create-series',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatTableModule,
    MatMenuModule, MatTooltipModule, MatDividerModule,
    MatChipsModule, MatSnackBarModule, MatDialogModule,
  ],
  templateUrl: './create-series.component.html',
  styleUrl: './create-series.component.scss',
})
export class CreateSeriesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  languages = LANGUAGES;
  legalEntities = LEGAL_ENTITIES;

  selectedLanguage = signal('Universal');

  names = signal<Record<string, string>>({ Universal: '' });
  descriptions = signal<Record<string, string>>({ Universal: '' });

  slug = signal('');
  autoSlug = signal(true);
  legalEntity = signal('PLG Estonia');
  coverImage = signal('');

  events = signal<Event[]>([]);
  mainEventId = signal<string>('');

  isEdit = signal(false);
  seriesId = signal<string | null>(null);

  eventColumns = ['name', 'date', 'venue', 'category', 'main', 'actions'];

  getCurrentName() {
    return this.names()[this.selectedLanguage()] ?? '';
  }

  setCurrentName(v: string) {
    const lang = this.selectedLanguage();
    this.names.update(n => ({ ...n, [lang]: v }));
    if (this.autoSlug() && lang === 'Universal') {
      this.slug.set(this.slugify(v));
    }
  }

  getCurrentDescription() {
    return this.descriptions()[this.selectedLanguage()] ?? '';
  }

  setCurrentDescription(v: string) {
    const lang = this.selectedLanguage();
    this.descriptions.update(d => ({ ...d, [lang]: v }));
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const existing = MOCK_SERIES.find(s => s.id === id);
      if (existing) {
        this.isEdit.set(true);
        this.seriesId.set(id);
        this.names.set({ Universal: existing.name });
        this.descriptions.set({ Universal: existing.description ?? '' });
        this.slug.set(existing.slug ?? this.slugify(existing.name));
        this.autoSlug.set(false);
        this.legalEntity.set(existing.legalEntity ?? 'PLG Estonia');
        this.coverImage.set(existing.coverImage ?? '');
        this.mainEventId.set(existing.mainEventId ?? '');
        this.events.set(MOCK_EVENTS.filter(e => existing.eventIds.includes(e.id)));
      }
    }
  }

  setLanguage(code: string) {
    this.selectedLanguage.set(code);
    if (!(code in this.names())) {
      this.names.update(n => ({ ...n, [code]: '' }));
    }
    if (!(code in this.descriptions())) {
      this.descriptions.update(d => ({ ...d, [code]: '' }));
    }
  }

  langHasContent(code: string) {
    return !!(this.names()[code]?.trim() || this.descriptions()[code]?.trim());
  }

  slugify(s: string) {
    return s
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  toggleAutoSlug() {
    this.autoSlug.update(v => !v);
    if (this.autoSlug()) {
      this.slug.set(this.slugify(this.names()['Universal'] ?? ''));
    }
  }

  openAddEvent(existing?: Event) {
    const ref = this.dialog.open(SeriesEventDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: existing ? {
        name: existing.name,
        date: existing.date,
        time: existing.formData?.eventTime ?? '',
        venue: existing.venue,
        category: existing.category,
      } as SeriesEventForm : undefined,
    });
    ref.afterClosed().subscribe((form: SeriesEventForm | undefined) => {
      if (!form) return;
      if (existing) {
        this.events.update(list => list.map(e =>
          e.id === existing.id
            ? {
                ...e,
                name: form.name,
                date: form.date,
                venue: form.venue,
                category: form.category,
                formData: { ...(e.formData ?? {}), eventTime: form.time },
              }
            : e
        ));
      } else {
        const id = 'new-' + Date.now();
        this.events.update(list => [
          ...list,
          {
            id,
            name: form.name,
            category: form.category,
            date: form.date,
            venue: form.venue,
            status: 'Draft',
            ticketsSold: 0,
            totalTickets: 0,
            revenue: 0,
            formData: { eventTime: form.time },
          },
        ]);
      }
    });
  }

  removeEvent(id: string) {
    this.events.update(list => list.filter(e => e.id !== id));
    if (this.mainEventId() === id) this.mainEventId.set('');
  }

  setMain(id: string) {
    this.mainEventId.set(id);
  }

  formatDate(d?: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  canSave = computed(() => !!this.names()['Universal']?.trim());

  save() {
    if (!this.canSave()) {
      this.snack.open('Series name is required', 'OK', { duration: 3000 });
      return;
    }
    this.snack.open(this.isEdit() ? 'Series updated' : 'Series created', 'OK', { duration: 2500 });
    this.router.navigate(['/events']);
  }

  cancel() {
    this.router.navigate(['/events']);
  }
}
