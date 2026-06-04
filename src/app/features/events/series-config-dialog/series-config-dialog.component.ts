import { Component, Inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Series } from '../../../shared/models/series.model';
import { SearchSelectComponent } from '../../../shared/components/search-select/search-select.component';
import { CATEGORY_OPTIONS, GENRE_OPTIONS } from '../../../shared/models/taxonomy';
import {
  TranslationsFieldComponent,
  TransField,
  TransLanguage,
  TransValues,
} from '../../../shared/components/translations-field/translations-field.component';

export type SeriesConfigResult = Partial<Series> & { id: string; open?: boolean };

@Component({
  selector: 'app-series-config-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatTooltipModule, SearchSelectComponent, TranslationsFieldComponent],
  templateUrl: './series-config-dialog.component.html',
  styleUrl: './series-config-dialog.component.scss',
})
export class SeriesConfigDialogComponent {
  readonly categoryOptions = CATEGORY_OPTIONS;
  readonly genreOptions = GENRE_OPTIONS;
  readonly isEdit: boolean;
  readonly id: string;

  readonly baseLang = 'en';
  readonly languages: TransLanguage[] = [
    { code: 'en', name: 'English' },
    { code: 'et', name: 'Estonian' },
    { code: 'lv', name: 'Latvian' },
    { code: 'lt', name: 'Lithuanian' },
    { code: 'ru', name: 'Russian' },
    { code: 'fi', name: 'Finnish' },
  ];
  /** All non-base-language translations, keyed by langCode → fieldKey → value.
   *  The base-language values live on each field's own signal (this.name,
   *  this.description, etc.) and are merged in at render time by valuesFor(). */
  private allTrans = signal<TransValues>({});

  /** Build a TransValues object for a single field by combining its base-lang
   *  signal with the per-language slices in allTrans. */
  private valuesFor(key: string, base: string): TransValues {
    const out: TransValues = { en: { [key]: base } };
    for (const [lang, fields] of Object.entries(this.allTrans())) {
      if (lang === 'en') continue;
      out[lang] = { [key]: fields[key] ?? '' };
    }
    return out;
  }

  /** Write the TransValues from a translations-field back into the base-lang
   *  signal (via setBase) and the allTrans store. */
  private applyValuesFor(key: string, v: TransValues, setBase: (s: string) => void) {
    setBase(v['en']?.[key] ?? '');
    this.allTrans.update(prev => {
      const next: TransValues = { ...prev };
      for (const [lang, fields] of Object.entries(v)) {
        if (lang === 'en') continue;
        next[lang] = { ...(next[lang] ?? {}), [key]: fields[key] ?? '' };
      }
      return next;
    });
  }

  readonly nameFields: TransField[] = [
    { key: 'name', label: 'Series Name', placeholder: 'Summer Concerts' },
  ];
  nameValues = computed<TransValues>(() => this.valuesFor('name', this.name()));

  readonly descriptionFields: TransField[] = [
    { key: 'description', label: 'Description', multiline: true, placeholder: 'Describe the series for ticket buyers…' },
  ];
  descriptionValues = computed<TransValues>(() => this.valuesFor('description', this.description()));

  readonly importantInfoFields: TransField[] = [
    { key: 'importantInfo', label: 'Important Information', multiline: true, placeholder: 'e.g. Doors open 30 minutes before start…' },
  ];
  importantInfoValues = computed<TransValues>(() => this.valuesFor('importantInfo', this.importantInfo()));

  readonly additionalDescFields: TransField[] = [
    { key: 'additionalDesc', label: 'Additional Description', multiline: true, placeholder: 'Any extra info for buyers…' },
  ];
  additionalDescValues = computed<TransValues>(() => this.valuesFor('additionalDesc', this.additionalDesc()));

  readonly priceInfoFields: TransField[] = [
    { key: 'priceInfo', label: 'Price Information', multiline: true },
  ];
  priceInfoValues = computed<TransValues>(() => this.valuesFor('priceInfo', this.priceInfo()));

  readonly cashierInstructionsFields: TransField[] = [
    { key: 'cashierInstructions', label: 'Cashier Instructions', multiline: true, placeholder: 'Instructions for cashiers…' },
  ];
  cashierInstructionsValues = computed<TransValues>(() => this.valuesFor('cashierInstructions', this.cashierInstructions()));

  readonly posNotesFields: TransField[] = [
    { key: 'posNotes', label: 'POS Notes', multiline: true, placeholder: 'Notes shown on POS terminals…' },
  ];
  posNotesValues = computed<TransValues>(() => this.valuesFor('posNotes', this.posNotes()));

  name = signal('');
  slug = signal('');
  autoSlug = signal(true);
  description = signal('');
  importantInfo = signal('');
  additionalDesc = signal('');
  cashierInstructions = signal('');
  posNotes = signal('');
  category = signal('');
  genre = signal('');

  cast = signal('');
  creators = signal('');
  priceInfo = signal('');
  startDate = signal('');
  startTime = signal('');
  endDate = signal('');
  endTime = signal('');
  venue = signal('Tallinn Arena');

  location = signal('');
  subLocation = signal('');
  seatingPlan = signal('');
  organizerAccess = signal<'all' | 'select'>('all');
  selectedOrganizers = signal('');
  reviewHomepage = signal('');
  reviewAuthor = signal('');
  vodLinks = signal('');
  poster = signal('');
  photos = signal('');
  photoSource = signal('');
  multimedia = signal('');

  optionalOpen = signal(false);

  canSubmit = computed(() =>
    !!this.name().trim()
    && !!this.description().trim()
    && !!this.category().trim()
    && !!this.genre().trim()
  );

  constructor(
    public ref: MatDialogRef<SeriesConfigDialogComponent, SeriesConfigResult | undefined>,
    @Inject(MAT_DIALOG_DATA) public data: { series?: Series } | null,
  ) {
    this.ref.addPanelClass('series-config-dialog-panel');

    const seed = data?.series;
    this.isEdit = !!seed;
    this.id = seed?.id ?? '';

    if (seed) {
      this.name.set(seed.name ?? '');
      this.slug.set(seed.slug ?? '');
      this.autoSlug.set(!seed.slug);
      this.description.set(seed.description ?? '');
      this.importantInfo.set(seed.importantInfo ?? '');
      this.additionalDesc.set(seed.additionalDesc ?? '');
      this.cashierInstructions.set(seed.cashierInstructions ?? '');
      this.posNotes.set(seed.posNotes ?? '');
      this.category.set(seed.category ?? '');
      this.genre.set(seed.genre ?? '');
      this.cast.set(seed.cast ?? '');
      this.creators.set(seed.creators ?? '');
      this.priceInfo.set(seed.priceInfo ?? '');
      this.startDate.set(seed.startDate ?? '');
      this.startTime.set(seed.startTime ?? '');
      this.endDate.set(seed.endDate ?? '');
      this.endTime.set(seed.endTime ?? '');
      this.venue.set(seed.venue ?? 'Tallinn Arena');
      this.location.set(seed.location ?? '');
      this.subLocation.set(seed.subLocation ?? '');
      this.seatingPlan.set(seed.seatingPlan ?? '');
      this.organizerAccess.set(seed.organizerAccess ?? 'all');
      this.selectedOrganizers.set(seed.selectedOrganizers ?? '');
      this.reviewHomepage.set(seed.reviewHomepage ?? '');
      this.reviewAuthor.set(seed.reviewAuthor ?? '');
      this.vodLinks.set(seed.vodLinks ?? '');
      this.poster.set(seed.poster ?? '');
      this.photos.set(seed.photos ?? '');
      this.photoSource.set(seed.photoSource ?? '');
      this.multimedia.set(seed.multimedia ?? '');

      // Seed non-base translations from the series (base lang is the main fields)
      if (seed.translations) {
        const { en, ...rest } = seed.translations;
        this.allTrans.set(rest);
      }

      // Keep optional block open if any optional field already has data
      this.optionalOpen.set(this.hasAnyOptional(seed));
    } else {
      this.name.set('Summer Concerts');
      this.slug.set('summer-concerts');
    }
  }

  private hasAnyOptional(s: Series): boolean {
    return !!(s.importantInfo || s.additionalDesc || s.cashierInstructions || s.posNotes
      || s.cast || s.creators || s.priceInfo || s.startDate || s.endDate || s.venue !== 'Tallinn Arena'
      || s.location || s.subLocation || s.seatingPlan
      || (s.organizerAccess && s.organizerAccess !== 'all') || s.selectedOrganizers
      || s.reviewHomepage || s.reviewAuthor || s.vodLinks || s.poster || s.photos || s.photoSource || s.multimedia);
  }

  private slugify(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  onNameChange(v: string) {
    this.name.set(v);
    if (this.autoSlug()) this.slug.set(this.slugify(v));
  }

  onNameValuesChange(v: TransValues) {
    // Base language drives the main name (keeps slug auto-gen working) — use
    // onNameChange instead of name.set so the slug stays synced.
    this.applyValuesFor('name', v, s => this.onNameChange(s));
  }
  onDescriptionValuesChange(v: TransValues) {
    this.applyValuesFor('description', v, s => this.description.set(s));
  }
  onImportantInfoValuesChange(v: TransValues) {
    this.applyValuesFor('importantInfo', v, s => this.importantInfo.set(s));
  }
  onAdditionalDescValuesChange(v: TransValues) {
    this.applyValuesFor('additionalDesc', v, s => this.additionalDesc.set(s));
  }
  onPriceInfoValuesChange(v: TransValues) {
    this.applyValuesFor('priceInfo', v, s => this.priceInfo.set(s));
  }
  onCashierInstructionsValuesChange(v: TransValues) {
    this.applyValuesFor('cashierInstructions', v, s => this.cashierInstructions.set(s));
  }
  onPosNotesValuesChange(v: TransValues) {
    this.applyValuesFor('posNotes', v, s => this.posNotes.set(s));
  }

  toggleAutoSlug() {
    this.autoSlug.update(v => !v);
    if (this.autoSlug()) this.slug.set(this.slugify(this.name()));
  }

  private buildResult(): SeriesConfigResult {
    return {
      id: this.id,
      name: this.name(),
      slug: this.slug(),
      description: this.description(),
      importantInfo: this.importantInfo(),
      additionalDesc: this.additionalDesc(),
      cashierInstructions: this.cashierInstructions(),
      posNotes: this.posNotes(),
      category: this.category(),
      genre: this.genre(),
      cast: this.cast(),
      creators: this.creators(),
      priceInfo: this.priceInfo(),
      startDate: this.startDate(),
      startTime: this.startTime(),
      endDate: this.endDate(),
      endTime: this.endTime(),
      venue: this.venue(),
      location: this.location(),
      subLocation: this.subLocation(),
      seatingPlan: this.seatingPlan(),
      organizerAccess: this.organizerAccess(),
      selectedOrganizers: this.selectedOrganizers(),
      reviewHomepage: this.reviewHomepage(),
      reviewAuthor: this.reviewAuthor(),
      vodLinks: this.vodLinks(),
      poster: this.poster(),
      photos: this.photos(),
      photoSource: this.photoSource(),
      multimedia: this.multimedia(),
      translations: this.allTrans(),
    };
  }

  submit() {
    if (!this.canSubmit()) return;
    this.ref.close(this.buildResult());
  }

  /** Save current edits and signal the caller to open the full series view. */
  openSeries() {
    if (!this.canSubmit()) return;
    this.ref.close({ ...this.buildResult(), open: true });
  }

  cancel() {
    this.ref.close();
  }
}
